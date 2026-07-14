import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { 
  FiGrid, 
  FiUsers, 
  FiLayers, 
  FiCalendar, 
  FiCheckSquare, 
  FiUser, 
  FiLogOut,
  FiX
} from 'react-icons/fi';
import { toast } from './Toast';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const getAdminLinks = () => [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid size={20} /> },
    { to: '/admin/employees', label: 'Employees', icon: <FiUsers size={20} /> },
    { to: '/admin/departments', label: 'Departments', icon: <FiLayers size={20} /> },
    { to: '/admin/leaves', label: 'Leave Requests', icon: <FiCalendar size={20} /> },
    { to: '/admin/tasks', label: 'Task Monitoring', icon: <FiCheckSquare size={20} /> },
    { to: '/admin/profile', label: 'Profile', icon: <FiUser size={20} /> }
  ];

  const getManagerLinks = () => [
    { to: '/manager/dashboard', label: 'Dashboard', icon: <FiGrid size={20} /> },
    { to: '/manager/team', label: 'Team Members', icon: <FiUsers size={20} /> },
    { to: '/manager/tasks', label: 'Task Management', icon: <FiCheckSquare size={20} /> },
    { to: '/manager/leaves', label: 'Leave Approvals', icon: <FiCalendar size={20} /> },
    { to: '/manager/profile', label: 'Profile', icon: <FiUser size={20} /> }
  ];

  const getEmployeeLinks = () => [
    { to: '/employee/dashboard', label: 'Dashboard', icon: <FiGrid size={20} /> },
    { to: '/employee/tasks', label: 'My Tasks', icon: <FiCheckSquare size={20} /> },
    { to: '/employee/leave', label: 'Apply Leave', icon: <FiCalendar size={20} /> },
    { to: '/employee/profile', label: 'Profile', icon: <FiUser size={20} /> }
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return getAdminLinks();
      case 'manager':
        return getManagerLinks();
      case 'employee':
        return getEmployeeLinks();
      default:
        return [];
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && <div style={overlayStyle} onClick={onClose} />}

      <div 
        style={{
          ...sidebarStyle,
          left: isOpen ? '0' : '-260px'
        }} 
        className="glass"
      >
        <div style={sidebarHeader}>
          <h2 style={logoText}>EMS Panel</h2>
          <button className="sidebar-close-btn" onClick={onClose}>
            <FiX size={24} color="var(--primary-color)" />
          </button>
        </div>

        <div style={linksContainer}>
          {getLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              style={({ isActive }) => ({
                ...linkStyle,
                backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                color: isActive ? '#white' : 'var(--text-color)',
                boxShadow: isActive ? '0 4px 12px rgba(124, 77, 255, 0.3)' : 'none'
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ color: isActive ? 'white' : 'var(--primary-color)' }}>
                    {link.icon}
                  </span>
                  <span style={{ color: isActive ? 'white' : 'var(--text-color)', fontWeight: '600' }}>
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div style={footerSection}>
          <button style={logoutBtn} onClick={handleLogout}>
            <FiLogOut size={20} color="var(--danger-color)" />
            <span style={{ fontWeight: '600' }}>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  zIndex: 1040,
  backdropFilter: 'blur(3px)'
};

const sidebarStyle = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  width: '260px',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1045,
  borderRight: '1px solid var(--border-color)',
  transition: 'left 0.3s ease-in-out',
  padding: '24px'
};

const sidebarHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '40px'
};

const logoText = {
  fontSize: '22px',
  fontWeight: '800',
  color: 'var(--primary-color)',
  letterSpacing: '0.5px'
};

const linksContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  flex: 1
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '12px 16px',
  borderRadius: 'var(--border-radius)',
  transition: 'var(--transition)',
  textDecoration: 'none'
};

const footerSection = {
  paddingTop: '20px',
  borderTop: '1px solid var(--border-color)'
};

const logoutBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '12px 16px',
  width: '100%',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  borderRadius: 'var(--border-radius)',
  color: 'var(--danger-color)',
  transition: 'var(--transition)'
};

export default Sidebar;
