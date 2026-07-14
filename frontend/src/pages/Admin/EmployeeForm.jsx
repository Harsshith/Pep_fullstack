import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { API_BASE_URL } from '../../config';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import { FiArrowLeft, FiCamera, FiSave } from 'react-icons/fi';

const EmployeeForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(isEditMode);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [salary, setSalary] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Active');
  const [role, setRole] = useState('employee');
  const [password, setPassword] = useState('');

  // Profile photo preview
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  // Fetch departments & Employee details
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Fetch departments
        const deptRes = await api.get('/departments');
        setDepartments(deptRes.data);

        // Fetch employee details if editing
        if (isEditMode) {
          const empRes = await api.get(`/employees/${id}`);
          const emp = empRes.data;

          setFullName(emp.fullName || '');
          setEmail(emp.email || '');
          setMobileNumber(emp.mobileNumber || '');
          setDepartment(emp.department?._id || '');
          setDesignation(emp.designation || '');
          setAddress(emp.address || '');
          setStatus(emp.status || 'Active');
          setRole(emp.role || 'employee');
          setSalary(emp.salary || '');
          
          if (emp.joiningDate) {
            setJoiningDate(emp.joiningDate.substring(0, 10)); // YYYY-MM-DD
          }
          if (emp.profilePic) {
            setProfilePicPreview(`${API_BASE_URL}${emp.profilePic}`);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load form dependencies');
      } finally {
        setFetchingDetails(false);
      }
    };
    fetchFormData();
  }, [id, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    // Name validation
    if (fullName.trim().length < 3) {
      toast.error('Full Name must be at least 3 characters');
      return false;
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(mobileNumber)) {
      toast.error('Please enter a valid mobile number (10-15 digits)');
      return false;
    }

    // Department & Designation (required unless role is admin)
    if (role !== 'admin') {
      if (!department) {
        toast.error('Please select a department');
        return false;
      }
      if (!designation.trim()) {
        toast.error('Please enter a designation');
        return false;
      }
    }

    // Password validation (required for new user, min 6 chars)
    if (!isEditMode && (!password || password.length < 6)) {
      toast.error('Password is required and must be at least 6 characters');
      return false;
    }
    if (isEditMode && password && password.length < 6) {
      toast.error('Password must be at least 6 characters if you wish to change it');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Prepare FormData since we have image uploads
    const formData = new FormData();
    formData.append('fullName', fullName.trim());
    formData.append('email', email.trim());
    formData.append('mobileNumber', mobileNumber.trim());
    formData.append('role', role);
    formData.append('status', status);
    formData.append('address', address.trim());

    if (role !== 'admin') {
      formData.append('department', department);
      formData.append('designation', designation.trim());
      formData.append('joiningDate', joiningDate);
      if (salary) formData.append('salary', salary);
    }

    if (password) {
      formData.append('password', password);
    }

    if (profilePicFile) {
      formData.append('profilePic', profilePicFile);
    }

    try {
      if (isEditMode) {
        await api.put(`/employees/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Employee updated successfully');
      } else {
        await api.post('/employees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Employee created successfully');
      }
      navigate('/admin/employees');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDetails) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn btn-secondary btn-small" onClick={() => navigate('/admin/employees')}>
            <FiArrowLeft size={16} />
          </button>
          <h1 className="page-title">{isEditMode ? 'Edit Employee' : 'Add Employee'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card glass" style={formCard}>
        {/* Photo Upload Header */}
        <div style={photoUploadSection}>
          <div style={avatarContainer}>
            {profilePicPreview ? (
              <img src={profilePicPreview} alt="Preview" style={avatarPreview} />
            ) : (
              <div style={emptyAvatar}>
                {fullName ? fullName.charAt(0).toUpperCase() : 'EMP'}
              </div>
            )}
            <label style={uploadIconLabel}>
              <FiCamera size={16} color="white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <p style={photoGuidelines}>Upload profile picture (Max 5MB, JPG/PNG/WEBP)</p>
        </div>

        <div className="form-grid">
          {/* Full Name */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. johndoe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="tel"
              className="form-control"
              placeholder="e.g. +919876543210"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>

          {/* Role selection */}
          <div className="form-group">
            <label>System Role *</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Department (Conditional) */}
          {role !== 'admin' && (
            <div className="form-group">
              <label>Department *</label>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Designation (Conditional) */}
          {role !== 'admin' && (
            <div className="form-group">
              <label>Designation *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Frontend Developer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
            </div>
          )}

          {/* Joining Date (Conditional) */}
          {role !== 'admin' && (
            <div className="form-group">
              <label>Joining Date</label>
              <input
                type="date"
                className="form-control"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </div>
          )}

          {/* Salary (Conditional) */}
          {role !== 'admin' && (
            <div className="form-group">
              <label>Monthly Salary (Optional)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 50000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
          )}

          {/* Status */}
          <div className="form-group">
            <label>Status *</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>{isEditMode ? 'Change Password (Leave blank to keep current)' : 'Password *'}</label>
            <input
              type="password"
              className="form-control"
              placeholder={isEditMode ? 'Enter new password' : 'Min 6 characters'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEditMode}
            />
          </div>

          {/* Address */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Residential Address</label>
            <textarea
              className="form-control"
              placeholder="Enter full address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>
        </div>

        <div style={footerStyle}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/employees')}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiSave />
            {loading ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Inline Styles
const formCard = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '30px'
};

const photoUploadSection = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '30px',
  gap: '10px'
};

const avatarContainer = {
  position: 'relative',
  width: '100px',
  height: '100px'
};

const avatarPreview = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid var(--primary-color)'
};

const emptyAvatar = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  backgroundColor: 'var(--hover-color)',
  color: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '32px',
  border: '3px dashed var(--border-color)'
};

const uploadIconLabel = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: 'var(--primary-color)',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  transition: 'var(--transition)'
};

// Form Photo Guidelines Style
const photoGuidelines = {
  fontSize: '12px',
  color: 'var(--text-muted)'
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '15px',
  marginTop: '30px',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '20px'
};

export default EmployeeForm;
