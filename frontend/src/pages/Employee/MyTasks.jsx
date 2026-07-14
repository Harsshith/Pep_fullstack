import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import { FiCheckSquare, FiSearch, FiFilter, FiInfo, FiActivity } from 'react-icons/fi';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Update Progress Modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', {
        params: {
          search,
          status: statusFilter
        }
      });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter]);

  const handleOpenUpdate = (task) => {
    setSelectedTask(task);
    setStatus(task.status);
    setCompletionPercentage(task.completionPercentage);
    setRemarks(task.remarks || '');
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      toast.error('Please enter update remarks');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.put(`/tasks/${selectedTask._id}/progress`, {
        status,
        completionPercentage,
        remarks: remarks.trim()
      });
      toast.success('Task progress updated successfully');
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Assigned Tasks</h1>
        <p style={{ color: 'var(--text-muted)' }}>Keep track of your projects and log daily updates.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card glass" style={filterBarContainer}>
        <div style={searchBox}>
          <FiSearch style={searchIcon} />
          <input
            type="text"
            placeholder="Search my tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </div>

        <div style={filterItem}>
          <FiFilter size={14} color="var(--primary-color)" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <div className="card glass" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No assigned tasks found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Progress %</th>
                <th>Status</th>
                <th>Assigned By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{task.title}</td>
                  <td>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>{new Date(task.deadline).toLocaleDateString()}</td>
                  <td>
                    <div style={progressContainer}>
                      <div style={progressOuterBar}>
                        <div 
                          style={{ 
                            ...progressInnerBar, 
                            width: `${task.completionPercentage}%`,
                            background: task.status === 'Completed' ? 'var(--success-color)' : 'var(--primary-color)'
                          }} 
                        />
                      </div>
                      <span style={progressText}>{task.completionPercentage}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${task.status.replace(' ', '').toLowerCase()}`}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {task.assignedBy?.fullName || 'N/A'}
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => handleOpenUpdate(task)}
                      title="Log Progress"
                    >
                      Update Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Progress Modal */}
      {selectedTask && (
        <div style={overlayStyle}>
          <form onSubmit={handleUpdateProgress} className="card glass" style={modalStyle}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Update Task Progress</h3>
              <button type="button" style={closeBtn} onClick={() => setSelectedTask(null)}>×</button>
            </div>

            <div style={modalBody}>
              <div style={taskSummary}>
                <h4 style={taskLabel}>{selectedTask.title}</h4>
                <p style={taskDesc}>{selectedTask.description}</p>
                <div style={taskDetailRow}>
                  <span>Priority: <b>{selectedTask.priority}</b></span>
                  <span>Deadline: <b>{new Date(selectedTask.deadline).toLocaleDateString()}</b></span>
                </div>
              </div>

              {/* Status input */}
              <div className="form-group">
                <label>Task Status</label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Slider for completion percentage */}
              <div className="form-group">
                <label>Completion Percentage: <b>{completionPercentage}%</b></label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={completionPercentage}
                  onChange={(e) => setCompletionPercentage(parseInt(e.target.value))}
                  style={sliderStyle}
                />
              </div>

              {/* Remarks/Daily Progress */}
              <div className="form-group">
                <label>Daily Progress / Remarks *</label>
                <textarea
                  className="form-control"
                  placeholder="Detail work performed today..."
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Previous progress entries logs */}
              {selectedTask.updates && selectedTask.updates.length > 0 && (
                <div>
                  <h4 style={logsTitle}>
                    <FiActivity /> Previous Progress Logs
                  </h4>
                  <div style={logsList}>
                    {selectedTask.updates.map((up, i) => (
                      <div key={i} style={logItem}>
                        <div style={logHeader}>
                          <span style={logPercent}>{up.completionPercentage}%</span>
                          <span style={logDate}>{new Date(up.date).toLocaleString()}</span>
                        </div>
                        <p style={logRemarks}>{up.remarks}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={modalFooter}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedTask(null)}
                disabled={submitLoading}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Submitting...' : 'Submit Progress Update'}
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
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  marginBottom: '24px'
};

const searchBox = {
  position: 'relative',
  maxWidth: '400px',
  width: '100%',
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

const progressContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minWidth: '100px'
};

const progressOuterBar = {
  flex: 1,
  height: '6px',
  backgroundColor: 'var(--border-color)',
  borderRadius: '10px',
  overflow: 'hidden'
};

const progressInnerBar = {
  height: '100%',
  borderRadius: '10px',
  transition: 'width 0.3s ease'
};

const progressText = {
  fontSize: '12px',
  fontWeight: '700'
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
  maxWidth: '550px',
  width: '90%',
  padding: '24px',
  animation: 'scaleIn 0.3s ease',
  maxHeight: '90vh',
  overflowY: 'auto'
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

const taskSummary = {
  backgroundColor: 'var(--hover-color)',
  padding: '16px',
  borderRadius: '10px',
  marginBottom: '10px'
};

const taskLabel = {
  fontSize: '16px',
  fontWeight: '800',
  color: 'var(--text-color)',
  marginBottom: '8px'
};

const taskDesc = {
  fontSize: '13px',
  color: 'var(--text-muted)',
  lineHeight: '1.4',
  marginBottom: '10px'
};

const taskDetailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: 'var(--text-color)',
  fontWeight: '600'
};

const sliderStyle = {
  width: '100%',
  accentColor: 'var(--primary-color)',
  cursor: 'pointer',
  height: '6px',
  borderRadius: '5px',
  margin: '10px 0'
};

const logsTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: 'var(--text-color)',
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const logsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '130px',
  overflowY: 'auto'
};

const logItem = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '10px'
};

const logHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '11px',
  fontWeight: '700',
  marginBottom: '4px'
};

const logPercent = {
  color: 'var(--primary-color)'
};

const logDate = {
  color: 'var(--text-muted)',
  fontWeight: 'normal'
};

const logRemarks = {
  fontSize: '13px',
  color: 'var(--text-color)',
  margin: 0
};

const modalFooter = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '20px',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '16px'
};

export default MyTasks;
