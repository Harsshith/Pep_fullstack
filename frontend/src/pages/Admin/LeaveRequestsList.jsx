import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { API_BASE_URL } from '../../config';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import { FiCalendar, FiFilter, FiCheck, FiX, FiInfo } from 'react-icons/fi';

const LeaveRequestsList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Leave detail modal
  const [selectedLeave, setSelectedLeave] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves', {
        params: {
          status: statusFilter,
          page,
          limit: 10
        }
      });
      setLeaves(res.data.leaves || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Leave Requests</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and manage employee leave applications.</p>
      </div>

      {/* Filter Bar */}
      <div className="card glass" style={filterBarContainer}>
        <div style={filterItem}>
          <FiFilter size={14} color="var(--primary-color)" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Leaves</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leaves list */}
      {loading ? (
        <LoadingSpinner />
      ) : leaves.length === 0 ? (
        <div className="card glass" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No leave requests found.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                      {leave.employee?.employeeId || 'ADMIN'}
                    </td>
                    <td>
                      <div style={nameCell}>
                        {leave.employee?.profilePic ? (
                          <img 
                            src={`${API_BASE_URL}${leave.employee.profilePic}`} 
                            alt="Avatar" 
                            style={avatarStyle} 
                          />
                        ) : (
                          <div style={avatarPlaceholder}>
                            {leave.employee?.fullName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{leave.employee?.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{leave.leaveType}</span>
                    </td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      <div style={actionsGroup}>
                        <button 
                          className="btn btn-secondary btn-small"
                          onClick={() => setSelectedLeave(leave)}
                          title="View Details"
                          style={{ padding: '6px' }}
                        >
                          <FiInfo size={14} />
                        </button>
                        {leave.status === 'Pending' && (
                          <>
                            <button 
                              className="btn btn-primary btn-small"
                              onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                              title="Approve"
                              style={{ padding: '6px', background: 'var(--success-color)' }}
                            >
                              <FiCheck size={14} color="white" />
                            </button>
                            <button 
                              className="btn btn-danger btn-small"
                              onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                              title="Reject"
                              style={{ padding: '6px' }}
                            >
                              <FiX size={14} color="white" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn" 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                disabled={page === 1}
              >
                Previous
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-btn ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button 
                className="pagination-btn" 
                onClick={() => setPage(prev => Math.min(prev + 1, pages))} 
                disabled={page === pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Leave Detail Modal */}
      {selectedLeave && (
        <div style={overlayStyle}>
          <div className="card glass" style={modalStyle}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Leave Application Detail</h3>
              <button style={closeBtn} onClick={() => setSelectedLeave(null)}>×</button>
            </div>

            <div style={detailBody}>
              <div style={detailHeader}>
                {selectedLeave.employee?.profilePic ? (
                  <img 
                    src={`${API_BASE_URL}${selectedLeave.employee.profilePic}`} 
                    alt="Profile" 
                    style={largeAvatar} 
                  />
                ) : (
                  <div style={largeAvatarPlaceholder}>
                    {selectedLeave.employee?.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 style={detailName}>{selectedLeave.employee?.fullName}</h4>
                  <p style={detailRole}>{selectedLeave.employee?.designation || 'Staff'} ({selectedLeave.employee?.department?.name || 'No Dept'})</p>
                </div>
              </div>

              <div style={detailGrid}>
                <div style={detailItem}>
                  <span style={detailLabel}>Leave Type</span>
                  <span style={detailValue}>{selectedLeave.leaveType}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Status</span>
                  <span style={detailValue}>
                    <span className={`badge badge-${selectedLeave.status.toLowerCase()}`}>{selectedLeave.status}</span>
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Start Date</span>
                  <span style={detailValue}>{new Date(selectedLeave.startDate).toLocaleDateString()}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>End Date</span>
                  <span style={detailValue}>{new Date(selectedLeave.endDate).toLocaleDateString()}</span>
                </div>
                <div style={{ ...detailItem, gridColumn: 'span 2' }}>
                  <span style={detailLabel}>Reason</span>
                  <p style={reasonText}>{selectedLeave.reason}</p>
                </div>
              </div>

              {selectedLeave.status === 'Pending' && (
                <div style={modalActions}>
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => handleUpdateStatus(selectedLeave._id, 'Rejected')}
                    style={{ backgroundColor: 'rgba(255, 77, 79, 0.1)', color: 'var(--danger-color)' }}
                  >
                    Reject Leave
                  </button>
                  <button 
                    className="btn btn-primary btn-small"
                    onClick={() => handleUpdateStatus(selectedLeave._id, 'Approved')}
                    style={{ backgroundColor: 'var(--success-color)' }}
                  >
                    Approve Leave
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Styles
const filterBarContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  marginBottom: '24px'
};

const filterItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  padding: '0 10px'
};

const selectStyle = {
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-color)',
  padding: '10px 0',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '600'
};

const nameCell = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const avatarStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  objectFit: 'cover'
};

const avatarPlaceholder = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  backgroundColor: 'var(--secondary-color)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '12px'
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

const detailBody = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const detailHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px'
};

const largeAvatar = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--primary-color)'
};

const largeAvatarPlaceholder = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '24px'
};

const detailName = {
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--text-color)',
  marginBottom: '4px'
};

const detailRole = {
  fontSize: '12px',
  color: 'var(--text-muted)'
};

const detailGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '15px',
  backgroundColor: 'var(--hover-color)',
  padding: '16px',
  borderRadius: '12px'
};

const detailItem = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const detailLabel = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: '600'
};

const detailValue = {
  fontSize: '14px',
  color: 'var(--text-color)',
  fontWeight: '600'
};

const reasonText = {
  fontSize: '14px',
  color: 'var(--text-color)',
  lineHeight: '1.5',
  margin: 0
};

const modalActions = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '10px'
};

export default LeaveRequestsList;
