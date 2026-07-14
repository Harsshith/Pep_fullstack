import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiCalendar, FiUser, FiInfo } from 'react-icons/fi';

const TaskManagement = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Create / Edit modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Detail view state
  const [selectedTask, setSelectedTask] = useState(null);

  // Deletion state
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const fetchEmployees = async () => {
    try {
      // Fetch only employees belonging to the manager's department (or all employees)
      const deptId = user?.department?._id;
      const params = { role: 'employee', limit: 10000 };
      if (deptId) {
        params.department = deptId;
      }
      const res = await api.get('/employees', { params });
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter]);

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDeadline('');
    setAssignedTo('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setAssignedTo(task.assignedTo?._id || '');
    if (task.deadline) {
      setDeadline(task.deadline.substring(0, 10)); // YYYY-MM-DD
    }
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !deadline || !assignedTo) {
      toast.error('Please fill in all required fields');
      return;
    }

    setFormLoading(true);
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      deadline,
      assignedTo
    };

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', taskData);
        toast.success('Task created and assigned successfully');
      }
      setShowFormModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
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
      await api.delete(`/tasks/${deleteId}`);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Task Management</h1>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <FiPlus /> Assign New Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card glass" style={filterBarContainer}>
        <div style={searchBox}>
          <FiSearch style={searchIcon} />
          <input
            type="text"
            placeholder="Search team tasks..."
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
          <p style={{ color: 'var(--text-muted)' }}>No tasks assigned. Click Assign New Task to get started.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assigned Employee</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Progress %</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{task.title}</td>
                  <td>
                    <div style={nameCell}>
                      <span>{task.assignedTo?.fullName || 'N/A'}</span>
                      <span style={empIdBadge}>{task.assignedTo?.employeeId || 'N/A'}</span>
                    </div>
                  </td>
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
                  <td>
                    <div style={actionsGroup}>
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={() => setSelectedTask(task)}
                        title="View Log/Progress"
                        style={{ padding: '6px' }}
                      >
                        <FiInfo size={14} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={() => handleOpenEdit(task)}
                        title="Edit Task"
                        style={{ padding: '6px' }}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteTrigger(task._id)}
                        title="Delete Task"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Assigned Task"
        message="Are you sure you want to delete this task? The employee will be notified and this action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
      />

      {/* Detail / Progress logs Modal */}
      {selectedTask && (
        <div style={overlayStyle}>
          <div className="card glass" style={modalStyle}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Task Assignment Details</h3>
              <button style={closeBtn} onClick={() => setSelectedTask(null)}>×</button>
            </div>
            
            <div style={detailBody}>
              <div>
                <h4 style={taskDetailTitle}>{selectedTask.title}</h4>
                <p style={taskDetailDesc}>{selectedTask.description}</p>
              </div>

              <div style={detailGrid}>
                <div style={detailItem}>
                  <span style={detailLabel}>Priority</span>
                  <span style={detailValue}>{selectedTask.priority}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Deadline</span>
                  <span style={detailValue}>{new Date(selectedTask.deadline).toLocaleDateString()}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Assigned Employee</span>
                  <span style={detailValue}>{selectedTask.assignedTo?.fullName || 'N/A'}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Current Status</span>
                  <span style={detailValue}>{selectedTask.status}</span>
                </div>
              </div>

              {/* Progress update logs */}
              <div>
                <h4 style={logsTitle}>Daily Progress logs ({selectedTask.updates?.length || 0})</h4>
                <div style={logsList}>
                  {!selectedTask.updates || selectedTask.updates.length === 0 ? (
                    <p style={noLogsText}>No updates logged by employee yet.</p>
                  ) : (
                    selectedTask.updates.map((up, idx) => (
                      <div key={idx} style={logItem}>
                        <div style={logHeader}>
                          <span style={logPercent}>{up.completionPercentage}%</span>
                          <span style={logDate}>{new Date(up.date).toLocaleString()}</span>
                        </div>
                        <p style={logRemarks}>{up.remarks}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {showFormModal && (
        <div style={overlayStyle}>
          <form onSubmit={handleSubmit} className="card glass" style={modalStyle}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>{editingTask ? 'Edit Assigned Task' : 'Assign New Task'}</h3>
              <button type="button" style={closeBtn} onClick={() => setShowFormModal(false)}>×</button>
            </div>

            <div style={modalBody}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter task summary title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Task Description *</label>
                <textarea
                  className="form-control"
                  placeholder="Detail task requirements..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-group">
                <label>Assign Team Member *</label>
                <select
                  className="form-control"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div style={formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select
                    className="form-control"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Deadline *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>
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
                {formLoading ? 'Saving...' : 'Save Task'}
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
  flexWrap: 'wrap',
  gap: '15px',
  padding: '16px',
  marginBottom: '24px'
};

const searchBox = {
  position: 'relative',
  flex: '1 1 300px',
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

const nameCell = {
  display: 'flex',
  flexDirection: 'column'
};

const empIdBadge = {
  fontSize: '11px',
  color: 'var(--text-muted)'
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
  maxWidth: '550px',
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

const taskDetailTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--text-color)',
  marginBottom: '8px'
};

const taskDetailDesc = {
  fontSize: '14px',
  color: 'var(--text-muted)',
  lineHeight: '1.5',
  margin: 0
};

const detailGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  backgroundColor: 'var(--hover-color)',
  padding: '12px',
  borderRadius: '10px'
};

const detailItem = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const detailLabel = {
  fontSize: '10px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: '600'
};

const detailValue = {
  fontSize: '13px',
  color: 'var(--text-color)',
  fontWeight: '600'
};

const logsTitle = {
  fontSize: '15px',
  fontWeight: '700',
  color: 'var(--text-color)',
  marginBottom: '10px'
};

const logsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '150px',
  overflowY: 'auto'
};

const noLogsText = {
  color: 'var(--text-muted)',
  fontSize: '13px',
  textAlign: 'center',
  padding: '10px'
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
  fontSize: '12px',
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

const modalBody = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const formRow = {
  display: 'flex',
  gap: '15px'
};

const modalFooter = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '20px',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '16px'
};

export default TaskManagement;
