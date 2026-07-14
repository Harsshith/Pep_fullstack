import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiLayers } from 'react-icons/fi';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // CRUD modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments', {
        params: { search }
      });
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptDesc('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptDesc(dept.description || '');
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      toast.error('Department name is required');
      return;
    }

    setFormLoading(true);
    try {
      if (editingDept) {
        // Edit Department
        await api.put(`/departments/${editingDept._id}`, {
          name: deptName.trim(),
          description: deptDesc.trim()
        });
        toast.success('Department updated successfully');
      } else {
        // Create Department
        await api.post('/departments', {
          name: deptName.trim(),
          description: deptDesc.trim()
        });
        toast.success('Department created successfully');
      }
      setShowFormModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTrigger = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/departments/${deleteId}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Department Management</h1>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <FiPlus /> Create Department
        </button>
      </div>

      {/* Search Filter */}
      <div className="card glass" style={filterBarContainer}>
        <div style={searchBox}>
          <FiSearch style={searchIcon} />
          <input
            type="text"
            placeholder="Search departments by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </div>
      </div>

      {/* Departments Table */}
      {loading ? (
        <LoadingSpinner />
      ) : departments.length === 0 ? (
        <div className="card glass" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No departments found. Create a new one to get started.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Active Employees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiLayers /> {dept.name}
                    </div>
                  </td>
                  <td>{dept.description || <span style={{ color: 'var(--text-muted)' }}>No description</span>}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '13px', fontWeight: 'bold' }}>
                      {dept.employeeCount} Employees
                    </span>
                  </td>
                  <td>
                    <div style={actionsGroup}>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => handleOpenEdit(dept)}
                        title="Edit Department"
                        style={{ padding: '6px' }}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteTrigger(dept._id)}
                        title="Delete Department"
                        style={{ padding: '6px' }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone and will fail if employees are still assigned to it."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
      />

      {/* Create / Edit Department Modal */}
      {showFormModal && (
        <div style={overlayStyle}>
          <form onSubmit={handleSubmit} className="card glass" style={modalStyle}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>{editingDept ? 'Edit Department' : 'Create Department'}</h3>
              <button type="button" style={closeBtn} onClick={() => setShowFormModal(false)}>×</button>
            </div>
            
            <div style={modalBody}>
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. HR, Developer, Sales"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  placeholder="Briefly describe department responsibilities"
                  rows={4}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>
            </div>

            <div style={modalFooter}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowFormModal(false)}
                disabled={formLoading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Saving...' : 'Save Department'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Inline Styles
const filterBarContainer = {
  padding: '16px',
  marginBottom: '24px'
};

const searchBox = {
  position: 'relative',
  maxWidth: '400px',
  display: 'flex',
  alignItems: 'center'
};

const searchIcon = {
  position: 'absolute',
  left: '14px',
  color: 'var(--primary-color)'
};

const searchInput = {
  width: '100%',
  padding: '10px 16px 10px 42px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--card-bg)',
  color: 'var(--text-color)',
  fontSize: '14px'
};

const actionsGroup = {
  display: 'flex',
  gap: '8px'
};

/* Modal styles */
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(11, 7, 26, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100,
  backdropFilter: 'blur(5px)'
};

const modalStyle = {
  maxWidth: '500px',
  width: '90%',
  padding: '24px',
  animation: 'scaleIn 0.3s ease'
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '10px'
};

const modalTitle = {
  fontSize: '20px',
  fontWeight: '800',
  color: 'var(--primary-color)'
};

const closeBtn = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: 'var(--text-muted)'
};

const modalBody = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const modalFooter = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '24px',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '16px'
};

export default DepartmentsList;
