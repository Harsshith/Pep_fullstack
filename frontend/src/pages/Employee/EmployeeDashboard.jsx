import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import { 
  FiCheckSquare, 
  FiClock, 
  FiCalendar, 
  FiBriefcase, 
  FiActivity,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    approvedLeaves: 0,
    remainingLeaves: 20
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      try {
        setLoading(true);

        // Fetch user tasks
        const taskRes = await api.get('/tasks?limit=10000');
        const tasks = taskRes.data.tasks || [];
        const myTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const pendingTasks = myTasks - completedTasks;

        // Fetch user leaves
        const leaveRes = await api.get('/leaves?limit=10000');
        const leaves = leaveRes.data.leaves || [];
        const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
        
        // Calculate remaining leaves (say, 20 starting leaves pool)
        const remainingLeaves = Math.max(20 - approvedLeaves, 0);

        setStats({
          myTasks,
          completedTasks,
          pendingTasks,
          approvedLeaves,
          remainingLeaves
        });

        // Set top 3 recent pending or in progress tasks
        setRecentTasks(tasks.filter(t => t.status !== 'Completed').slice(0, 3));

        // Fetch user notifications
        const notifyRes = await api.get('/notifications');
        setRecentNotifications(notifyRes.data.slice(0, 5));

      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEmployeeStats();
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.fullName}!</h1>
        <p style={{ color: 'var(--text-muted)' }}>Role: Employee | Employee ID: {user?.employeeId}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-container">
        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Assigned Tasks</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(124, 77, 255, 0.1)' }}>
              <FiBriefcase size={22} color="var(--primary-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.myTasks}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Completed Tasks</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(82, 196, 26, 0.1)' }}>
              <FiCheckSquare size={22} color="var(--success-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.completedTasks}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Pending Tasks</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(250, 173, 20, 0.1)' }}>
              <FiClock size={22} color="var(--warning-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.pendingTasks}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Approved Leaves</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(82, 196, 26, 0.1)' }}>
              <FiCalendar size={22} color="var(--success-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.approvedLeaves}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Remaining Leaves</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(24, 144, 255, 0.1)' }}>
              <FiCalendar size={22} color="var(--info-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.remainingLeaves}</span>
        </div>
      </div>

      <div className="dashboard-split">
        {/* Left Side: Recent Tasks */}
        <div className="card glass" style={splitItem}>
          <h3 style={sectionTitle}>
            <FiCheckSquare color="var(--primary-color)" /> Active Assigned Tasks
          </h3>
          <div style={tasksList}>
            {recentTasks.length === 0 ? (
              <div style={noTasksBox}>
                <FiCheckCircle size={32} color="var(--success-color)" />
                <p>Hooray! No pending tasks assigned.</p>
              </div>
            ) : (
              recentTasks.map((t) => (
                <div key={t._id} style={taskItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={taskTitle}>{t.title}</h4>
                    <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                  </div>
                  <p style={taskDesc}>{t.description.substring(0, 100)}...</p>
                  <div style={taskFooter}>
                    <span>Deadline: {new Date(t.deadline).toLocaleDateString()}</span>
                    <span>Progress: {t.completionPercentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Notifications */}
        <div className="card glass" style={splitItem}>
          <h3 style={sectionTitle}>
            <FiActivity color="var(--primary-color)" /> Recent Notifications
          </h3>
          <div style={notificationsList}>
            {recentNotifications.length === 0 ? (
              <p style={noNotifText}>No recent activity</p>
            ) : (
              recentNotifications.map((notif) => (
                <div key={notif._id} style={notifItem}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <FiAlertCircle size={16} color="var(--primary-color)" style={{ marginTop: '2px' }} />
                    <div>
                      <p style={notifMessage}>{notif.message}</p>
                      <span style={notifTime}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const cardStyle = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '120px'
};

const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const cardTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--text-muted)'
};

const cardCount = {
  fontSize: '32px',
  fontWeight: '800',
  color: 'var(--text-color)'
};

const iconWrapper = {
  padding: '8px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};


const splitItem = {
  padding: '24px'
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '800',
  color: 'var(--text-color)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '20px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '10px'
};

const tasksList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const taskItem = {
  padding: '16px',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  backgroundColor: 'var(--card-bg)'
};

const taskTitle = {
  fontSize: '15px',
  fontWeight: '700',
  color: 'var(--text-color)'
};

const taskDesc = {
  fontSize: '13px',
  color: 'var(--text-muted)',
  margin: '8px 0',
  lineHeight: '1.4'
};

const taskFooter = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: '600',
  marginTop: '8px'
};

const noTasksBox = {
  textAlign: 'center',
  padding: '40px 20px',
  color: 'var(--text-muted)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px'
};

const notificationsList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const notifItem = {
  padding: '12px',
  borderBottom: '1px solid var(--border-color)',
  transition: 'var(--transition)'
};

const notifMessage = {
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--text-color)',
  marginBottom: '4px'
};

const notifTime = {
  fontSize: '11px',
  color: 'var(--text-muted)'
};

const noNotifText = {
  color: 'var(--text-muted)',
  fontSize: '14px',
  textAlign: 'center',
  padding: '30px'
};

export default EmployeeDashboard;
