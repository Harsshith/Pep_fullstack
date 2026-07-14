import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import { 
  FiUsers, 
  FiUserCheck, 
  FiUserX, 
  FiBriefcase, 
  FiClock, 
  FiCheckCircle, 
  FiActivity,
  FiCalendar
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    managersCount: 0,
    pendingLeaves: 0,
    completedTasks: 0
  });
  const [deptData, setDeptData] = useState([]);
  const [taskData, setTaskData] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch Employees
        const empRes = await api.get('/employees?limit=10000');
        const employees = empRes.data.employees || [];
        
        // Fetch Leaves
        const leaveRes = await api.get('/leaves?limit=10000');
        const leaves = leaveRes.data.leaves || [];

        // Fetch Tasks
        const taskRes = await api.get('/tasks?limit=10000');
        const tasks = taskRes.data.tasks || [];

        // Aggregate statistics
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(e => e.status === 'Active').length;
        const inactiveEmployees = totalEmployees - activeEmployees;
        const managersCount = employees.filter(e => e.role === 'manager').length;
        const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;

        setStats({
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          managersCount,
          pendingLeaves,
          completedTasks
        });

        // Aggregate Department distribution
        const deptCounts = {};
        employees.forEach(emp => {
          if (emp.department) {
            const deptName = emp.department.name || 'Unassigned';
            deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
          }
        });
        const deptChartArray = Object.keys(deptCounts).map(name => ({
          name,
          count: deptCounts[name]
        }));
        setDeptData(deptChartArray);

        // Aggregate Task distribution
        const pending = tasks.filter(t => t.status === 'Pending').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        setTaskData({ pending, inProgress, completed });

        // Aggregate recent notifications for activity feed
        const notifyRes = await api.get('/notifications');
        setRecentActivities(notifyRes.data.slice(0, 5)); // top 5 activities

      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Chart Max calculations
  const maxDeptCount = deptData.length > 0 ? Math.max(...deptData.map(d => d.count)) : 1;
  const maxTaskCount = Math.max(taskData.pending, taskData.inProgress, taskData.completed, 1);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome to the admin monitoring deck.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid-container">
        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Total Employees</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(124, 77, 255, 0.1)' }}>
              <FiUsers size={22} color="var(--primary-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.totalEmployees}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Active Employees</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(82, 196, 26, 0.1)' }}>
              <FiUserCheck size={22} color="var(--success-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.activeEmployees}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Inactive Employees</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(255, 77, 79, 0.1)' }}>
              <FiUserX size={22} color="var(--danger-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.inactiveEmployees}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Managers</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(24, 144, 255, 0.1)' }}>
              <FiBriefcase size={22} color="var(--info-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.managersCount}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Pending Leaves</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(250, 173, 20, 0.1)' }}>
              <FiCalendar size={22} color="var(--warning-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.pendingLeaves}</span>
        </div>

        <div className="card glass" style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Completed Tasks</span>
            <div style={{ ...iconWrapper, backgroundColor: 'rgba(82, 196, 26, 0.1)' }}>
              <FiCheckCircle size={22} color="var(--success-color)" />
            </div>
          </div>
          <span style={cardCount}>{stats.completedTasks}</span>
        </div>
      </div>

      {/* Charts Section */}
      <div style={chartGrid}>
        {/* Department Distribution Chart */}
        <div className="card glass" style={chartCard}>
          <h3 style={chartCardTitle}>Department Wise Employees</h3>
          <div className="chart-container">
            {deptData.length === 0 ? (
              <p style={noDataStyle}>No department data available</p>
            ) : (
              <div className="chart-bars">
                {deptData.map((d, index) => {
                  const heightPct = (d.count / maxDeptCount) * 80 + 10; // offset to guarantee visualization
                  return (
                    <div key={index} className="chart-bar-wrapper">
                      <div 
                        className="chart-bar" 
                        style={{ height: `${heightPct}%` }}
                      >
                        <span className="chart-tooltip">{d.count} Employees</span>
                      </div>
                      <div className="chart-label" title={d.name}>{d.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Task Progress Distribution */}
        <div className="card glass" style={chartCard}>
          <h3 style={chartCardTitle}>Task Progress</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {/* Pending Bar */}
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${(taskData.pending / maxTaskCount) * 80 + 10}%`,
                    background: 'var(--warning-color)'
                  }}
                >
                  <span className="chart-tooltip">{taskData.pending} Pending</span>
                </div>
                <div className="chart-label">Pending</div>
              </div>
              {/* In Progress Bar */}
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${(taskData.inProgress / maxTaskCount) * 80 + 10}%`,
                    background: 'var(--info-color)'
                  }}
                >
                  <span className="chart-tooltip">{taskData.inProgress} In Progress</span>
                </div>
                <div className="chart-label">In Progress</div>
              </div>
              {/* Completed Bar */}
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${(taskData.completed / maxTaskCount) * 80 + 10}%`,
                    background: 'var(--success-color)'
                  }}
                >
                  <span className="chart-tooltip">{taskData.completed} Completed</span>
                </div>
                <div className="chart-label">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="card glass" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <FiActivity size={24} color="var(--primary-color)" />
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Recent System Activities</h3>
        </div>
        <div style={activitiesList}>
          {recentActivities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No recent system logs</p>
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

const chartGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '24px',
  marginTop: '30px'
};

const chartCard = {
  padding: '24px'
};

const chartCardTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--text-color)',
  marginBottom: '15px'
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

const noDataStyle = {
  color: 'var(--text-muted)',
  textAlign: 'center',
  padding: '80px 0'
};

export default AdminDashboard;
