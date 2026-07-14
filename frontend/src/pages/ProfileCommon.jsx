import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiLock, FiCalendar, FiBriefcase } from 'react-icons/fi';

const ProfileCommon = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // Edit profile state
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setMobileNumber(user.mobileNumber || '');
      setAddress(user.address || '');
      if (user.profilePic) {
        setProfilePicPreview(`http://localhost:5000${user.profilePic}`);
      }
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim()) {
      toast.error('Name and mobile number are required');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('fullName', fullName.trim());
    formData.append('mobileNumber', mobileNumber.trim());
    formData.append('address', address.trim());
    
    if (profilePicFile) {
      formData.append('profilePic', profilePicFile);
    }

    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter all password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-grid">
        {/* Left Side - Profile Overview */}
        <div className="card glass" style={leftCard}>
          <div style={avatarSection}>
            <div style={avatarWrapper}>
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Avatar" style={avatarImg} />
              ) : (
                <div style={avatarTextPlaceholder}>
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              <label style={cameraBadge}>
                <FiCamera size={16} color="white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <h3 style={profileName}>{user.fullName}</h3>
            <span className="badge badge-info" style={{ textTransform: 'uppercase', marginTop: '5px' }}>
              {user.role}
            </span>
          </div>

          <div style={infoList}>
            <div style={infoItem}>
              <FiBriefcase color="var(--primary-color)" />
              <div>
                <span style={infoLabel}>Designation</span>
                <span style={infoVal}>{user.designation || 'System Admin'}</span>
              </div>
            </div>
            {user.department && (
              <div style={infoItem}>
                <FiUser color="var(--primary-color)" />
                <div>
                  <span style={infoLabel}>Department</span>
                  <span style={infoVal}>{user.department.name}</span>
                </div>
              </div>
            )}
            <div style={infoItem}>
              <FiCalendar color="var(--primary-color)" />
              <div>
                <span style={infoLabel}>Joining Date</span>
                <span style={infoVal}>
                  {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            <div style={infoItem}>
              <FiMail color="var(--primary-color)" />
              <div>
                <span style={infoLabel}>Email</span>
                <span style={infoVal}>{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div style={formsColumn}>
          {/* Edit Details */}
          <form onSubmit={handleUpdateProfile} className="card glass" style={formCard}>
            <h3 style={formTitle}>Edit Personal Info</h3>
            
            <div className="form-group">
              <label>Full Name</label>
              <div style={inputContainer}>
                <FiUser style={inputIcon} />
                <input
                  type="text"
                  className="form-control"
                  style={inputControl}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <div style={inputContainer}>
                <FiPhone style={inputIcon} />
                <input
                  type="tel"
                  className="form-control"
                  style={inputControl}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <div style={inputContainer}>
                <FiMapPin style={inputIcon} />
                <input
                  type="text"
                  className="form-control"
                  style={inputControl}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="card glass" style={formCard}>
            <h3 style={formTitle}>Change Password</h3>

            <div className="form-group">
              <label>Current Password</label>
              <div style={inputContainer}>
                <FiLock style={inputIcon} />
                <input
                  type="password"
                  className="form-control"
                  style={inputControl}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div style={inputContainer}>
                <FiLock style={inputIcon} />
                <input
                  type="password"
                  className="form-control"
                  style={inputControl}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div style={inputContainer}>
                <FiLock style={inputIcon} />
                <input
                  type="password"
                  className="form-control"
                  style={inputControl}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Styles

const leftCard = {
  padding: '30px',
  textAlign: 'center'
};

const avatarSection = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '30px'
};

const avatarWrapper = {
  position: 'relative',
  width: '120px',
  height: '120px',
  marginBottom: '15px'
};

const avatarImg = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '4px solid var(--primary-color)'
};

const avatarTextPlaceholder = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '48px'
};

const cameraBadge = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: 'var(--primary-color)',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
};

const profileName = {
  fontSize: '22px',
  fontWeight: '800',
  color: 'var(--text-color)',
  marginBottom: '4px'
};

const infoList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  textAlign: 'left',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '20px'
};

const infoItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const infoLabel = {
  display: 'block',
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontWeight: '600',
  textTransform: 'uppercase'
};

const infoVal = {
  fontSize: '14px',
  color: 'var(--text-color)',
  fontWeight: '600'
};

const formsColumn = {
  display: 'flex',
  flexDirection: 'column',
  gap: '30px'
};

const formCard = {
  padding: '30px'
};

const formTitle = {
  fontSize: '18px',
  fontWeight: '800',
  color: 'var(--primary-color)',
  marginBottom: '20px'
};

const inputContainer = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputIcon = {
  position: 'absolute',
  left: '16px',
  color: 'var(--primary-color)',
  zIndex: 10
};

const inputControl = {
  paddingLeft: '48px',
  height: '45px'
};

export default ProfileCommon;
