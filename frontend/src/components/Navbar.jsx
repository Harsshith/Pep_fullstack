import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FiBell, FiSun, FiMoon, FiUser, FiLogOut, FiMenu, FiChevronDown, FiMail } from 'react-icons/fi';
import api from '../services/api';
import { toast } from './Toast';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav style={navbarStyle} className="glass">
      <div style={leftSection}>
        <button style={menuBtnStyle} onClick={onToggleSidebar}>
          <FiMenu size={24} color="var(--primary-color)" />
        </button>
        <span style={logoText}>KEC Software <span style={roleBadge}>{user?.role}</span></span>
      </div>

      <div style={rightSection}>
        {/* Theme Toggle */}
        <button style={iconBtnStyle} onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? (
            <FiMoon size={20} color="var(--primary-color)" />
          ) : (
            <FiSun size={20} color="var(--secondary-color)" />
          )}
        </button>

        {/* Notifications */}
        <div style={dropdownContainer} ref={notifRef}>
          <button style={iconBtnStyle} onClick={() => setShowNotifications(!showNotifications)}>
            <FiBell size={20} color="var(--primary-color)" />
            {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div style={notifDropdownStyle} className="card glass">
              <div style={dropdownHeader}>
                <span style={dropdownTitle}>Notifications</span>
                {unreadCount > 0 && (
                  <button style={markAllBtn} onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={listContainer}>
                {notifications.length === 0 ? (
                  <div style={emptyNotif}>No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        ...notifItem,
                        backgroundColor: n.read ? 'transparent' : 'var(--hover-color)'
                      }}
                      onClick={() => handleMarkRead(n._id)}
                    >
                      <div style={notifText}>{n.message}</div>
                      <div style={notifTime}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={dropdownContainer} ref={profileRef}>
          <button style={profileBtnStyle} onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            {user?.profilePic ? (
              <img src={`http://localhost:5000${user.profilePic}`} alt="Profile" style={avatarStyle} />
            ) : (
              <div style={avatarPlaceholder}>{user?.fullName?.charAt(0).toUpperCase()}</div>
            )}
            <span style={usernameStyle}>{user?.fullName}</span>
            <FiChevronDown size={16} />
          </button>

          {showProfileDropdown && (
            <div style={profileDropdownStyle} className="card glass">
              <div style={profileHeaderStyle}>
                <p style={profileNameStyle}>{user?.fullName}</p>
                <p style={profileEmailStyle}>{user?.email}</p>
              </div>
              <hr style={dividerStyle} />
              
              <Link 
                to={user?.role === 'admin' ? '/admin/profile' : user?.role === 'manager' ? '/manager/profile' : '/employee/profile'} 
                style={dropdownItemStyle}
                onClick={() => setShowProfileDropdown(false)}
              >
                <FiUser size={18} />
                <span>My Profile</span>
              </Link>
              
              <button style={dropdownItemBtnStyle} onClick={handleLogout}>
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Inline styles for glassmorphism layout
const navbarStyle = {
  height: '70px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 24px',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  borderBottom: '1px solid var(--border-color)',
  transition: 'var(--transition)'
};

const leftSection = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
};

const menuBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
};

const logoText = {
  fontSize: '20px',
  fontWeight: '700',
  color: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const roleBadge = {
  fontSize: '11px',
  padding: '3px 8px',
  borderRadius: '12px',
  backgroundColor: 'var(--hover-color)',
  color: 'var(--primary-color)',
  textTransform: 'uppercase',
  fontWeight: '600'
};

const rightSection = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px'
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '50%',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'var(--transition)'
};

const badgeStyle = {
  position: 'absolute',
  top: '2px',
  right: '2px',
  backgroundColor: 'var(--danger-color)',
  color: 'white',
  fontSize: '10px',
  borderRadius: '50%',
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700'
};

const dropdownContainer = {
  position: 'relative'
};

const notifDropdownStyle = {
  position: 'absolute',
  top: '45px',
  right: 0,
  width: '320px',
  padding: '16px',
  maxHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1050,
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius)'
};

const dropdownHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--border-color)'
};

const dropdownTitle = {
  fontWeight: '700',
  fontSize: '16px',
  color: 'var(--text-color)'
};

const markAllBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--primary-color)',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: '600'
};

const listContainer = {
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const emptyNotif = {
  padding: '20px',
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: '14px'
};

const notifItem = {
  padding: '10px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'var(--transition)',
  borderBottom: '1px solid var(--border-color)'
};

const notifText = {
  fontSize: '13px',
  color: 'var(--text-color)',
  lineHeight: '1.4',
  marginBottom: '4px'
};

const notifTime = {
  fontSize: '10px',
  color: 'var(--text-muted)'
};

const profileBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--text-color)',
  fontWeight: '600',
  fontSize: '14px'
};

const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid var(--primary-color)'
};

const avatarPlaceholder = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '14px'
};

const usernameStyle = {
  maxWidth: '120px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const profileDropdownStyle = {
  position: 'absolute',
  top: '45px',
  right: 0,
  width: '220px',
  padding: '16px',
  zIndex: 1050,
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const profileHeaderStyle = {
  padding: '4px 8px'
};

const profileNameStyle = {
  fontWeight: '700',
  fontSize: '15px',
  color: 'var(--text-color)',
  marginBottom: '2px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const profileEmailStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const dividerStyle = {
  border: 0,
  borderTop: '1px solid var(--border-color)',
  margin: '4px 0'
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '14px',
  color: 'var(--text-color)',
  fontWeight: '600',
  transition: 'var(--transition)'
};

const dropdownItemBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '14px',
  color: 'var(--danger-color)',
  fontWeight: '600',
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'var(--transition)'
};

export default Navbar;
