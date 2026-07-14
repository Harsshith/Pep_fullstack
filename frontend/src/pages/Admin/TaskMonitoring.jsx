import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import { FiSearch, FiFilter, FiCheckSquare, FiUser, FiInfo, FiActivity } from 'react-icons/fi';

const TaskMonitoring = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail Modal
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter,
          page,
          limit: 10
        }
      });
      setTasks(res.data.tasks || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks monitoring');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [page, search, statusFilter, priorityFilter]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Task Monitoring</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time overview of tasks assigned across departments.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card glass" style={filterBarContainer}>
        <div style={searchBox}>
          <FiSearch style={searchIcon} />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </div>

        <div style={filtersWrapper}>
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

          <div style={filterItem}>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <div className="card glass" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No tasks found matching standard search filters.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Assigned Employee</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Completion %</th>
                  <th>Status</th>
                  <th>Assigned By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCheckSquare /> {task.title}
                      </div>
                    </td>
                    <td>
                      <div style={nameCell}>
                        {task.assignedTo?.fullName || 'N/A'}
                        <span style={empIdBadge}>({task.assignedTo?.employeeId || 'N/A'})</span>
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
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {task.assignedBy?.fullName || 'N/A'}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={() => setSelectedTask(task)}
                        title="View Updates Log"
                        style={{ padding: '6px' }}
                      >
                        <FiInfo size={14} />
                      </button>
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

      {/* Task Details & Progress Logs Modal */}
      {selectedTask && (
        <div style={overlayStyle}>
          <div className="card glass" style={modalStyle}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Task Monitoring Details</h3>
              <button style={closeBtn} onClick={() => setSelectedTask(null)}>×</button>
            </div>

            <div style={detailBody}>
              <div style={detailSection}>
                <h4 style={taskLabelTitle}>{selectedTask.title}</h4>
                <p style={taskDescText}>{selectedTask.description}</p>
              </div>

              <div style={detailGrid}>
                <div style={detailItem}>
                  <span style={detailLabel}>Priority</span>
                  <span style={detailValue}>
                    <span className={`badge badge-${selectedTask.priority.toLowerCase()}`}>{selectedTask.priority}</span>
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Deadline</span>
                  <span style={detailValue}>{new Date(selectedTask.deadline).toLocaleDateString()}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Employee</span>
                  <span style={detailValue}>{selectedTask.assignedTo?.fullName} ({selectedTask.assignedTo?.employeeId})</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Assigned By</span>
                  <span style={detailValue}>{selectedTask.assignedBy?.fullName}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Current Status</span>
                  <span style={detailValue}>
                    <span className={`badge badge-${selectedTask.status.replace(' ', '').toLowerCase()}`}>{selectedTask.status}</span>
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Completion</span>
                  <span style={detailValue}>{selectedTask.completionPercentage}%</span>
                </div>
              </div>

              {/* Progress Logs */}
              <div style={logsContainer}>
                <h4 style={logsTitle}>
                  <FiActivity /> Progress updates log ({selectedTask.updates?.length || 0})
                </h4>
                <div style={logsList}>
                  {!selectedTask.updates || selectedTask.updates.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '15px' }}>
                      No progress logs submitted yet.
                    </p>
                  ) : (
                    selectedTask.updates.map((update, idx) => (
                      <div key={idx} style={logItem}>
                        <div style={logHeader}>
                          <span style={logPercent}>{update.completionPercentage}% Complete</span>
                          <span style={logDate}>{new Date(update.date).toLocaleString()}</span>
                        </div>
                        <p style={logRemarks}>{update.remarks}</p>
                        <span className={`badge badge-${update.status.replace(' ', '').toLowerCase()}`} style={{ fontSize: '10px', marginTop: '5px' }}>
                          {update.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
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

const filtersWrapper = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
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
  color: 'var(--text-muted)',
  fontWeight: '600'
};

const progressContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minWidth: '120px'
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
  fontWeight: '700',
  minWidth: '30px'
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

const detailSection = {
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '12px'
};

const taskLabelTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--text-color)',
  marginBottom: '8px'
};

const taskDescText = {
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

const logsContainer = {
  marginTop: '10px'
};

const logsTitle = {
  fontSize: '15px',
  fontWeight: '700',
  color: 'var(--text-color)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '12px'
};

const logsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxHeight: '180px',
  overflowY: 'auto',
  paddingRight: '5px'
};

const logItem = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column'
};

const logHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  fontWeight: '700',
  marginBottom: '6px'
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
  margin: 0,
  lineHeight: '1.4'
};

export default TaskMonitoring;
