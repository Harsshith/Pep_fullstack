import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import { 
  FiBriefcase, 
  FiCheckSquare, 
  FiClock, 
  FiUsers, 
  FiCalendar, 
  FiActivity 
} from 'react-icons/fi';

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    teamSize: 0,
    leaveRequests: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchManagerStats = async () => {
      try {
        setLoading(true);

        // Get manager's department ID
        const deptId = user?.department?._id;

        // Fetch team size (all employees in the same department)
        let teamSize = 0;
        if (deptId) {
          const empRes = await api.get('/employees?limit=10000', {
            params: { department: deptId, role: 'employee' }
          });
          teamSize = empRes.data.employees?.length || 0;
        } else {
          // Fallback: list all employees
          const empRes = await api.get('/employees?limit=10000', { params: { role: 'employee' } });
          teamSize = empRes.data.employees?.length || 0;
        }

        // Fetch leaves (for approval)
        const leaveRes = await api.get('/leaves?limit=10000', { params: { status: 'Pending' } });
        const leaveRequests = leaveRes.data.leaves?.length || 0;

        // Fetch tasks assigned by this manager
        const taskRes = await api.get('/tasks?limit=10000');
        const tasks = taskRes.data.tasks || [];
        
        const assignedTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const pendingTasks = assignedTasks - completedTasks;

        setStats({
          assignedTasks,
          completedTasks,
          pendingTasks,
          teamSize,
          leaveRequests
        });

        // Get activities (notifications for manager)
        const notifyRes = await api.get('/notifications');
        setRecentActivities(notifyRes.data.slice(0, 5));

      } catch (err) {
        console.error(err);
        toast.error('Failed to load team statistics');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchManagerStats();
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manager Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Department: {user?.department?.name || 'Operations'}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid-container">
        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Assigned Tasks</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(124, 77, 255, 0.1)' }}>
              <FiCheckSquare size={22} color="var(--primary-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.assignedTasks}</span>
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
            <span style={cardTitle}>Team Members</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(24, 144, 255, 0.1)' }}>
              <FiUsers size={22} color="var(--info-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.teamSize}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Leave Approvals</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(255, 77, 79, 0.1)' }}>
              <FiCalendar size={22} color="var(--danger-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.leaveRequests}</span>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="card glass" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <FiActivity size={24} color="var(--primary-color)" />
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Team Updates Feed</h3>
        </div>
        <div style={activitiesList}>
          {recentActivities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No recent updates from team members</p>
          ) : (
            recentActivities.map((act) => (
              <div key={act._id} style={activityItem}>
                <div style={activityIconWrapper}>
                  <FiClock size={16} color="var(--primary-color)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={activityMessage}>{act.message}</p>
                  <span style={activityTime}>
                    {new Date(act.createdAt).toLocaleDateString()} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className={`badge badge-info`} style={{ fontSize: '10px' }}>
                  {act.type}
                </span>
              </div>
            ))
          )}
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

const activitiesList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const activityItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '12px',
  borderBottom: '1px solid var(--border-color)',
  transition: 'var(--transition)'
};

const activityIconWrapper = {
  padding: '8px',
  borderRadius: '50%',
  backgroundColor: 'var(--hover-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const activityMessage = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--text-color)',
  marginBottom: '4px'
};

const activityTime = {
  fontSize: '12px',
  color: 'var(--text-muted)'
};

export default ManagerDashboard;
