import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiSlash, FiArrowLeft } from 'react-icons/fi';

const AccessDenied = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (!user) {
      navigate('/login');
    } else {
      // Go to their dashboard
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'manager') navigate('/manager/dashboard');
      else navigate('/employee/dashboard');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="card glass">
        <FiSlash size={64} color="var(--danger-color)" style={{ marginBottom: '20px' }} />
        <h1 style={titleStyle}>403 - Access Denied</h1>
        <p style={messageStyle}>
          You do not have permission to view this resource. This area is restricted to authorized roles.
        </p>
        <button className="btn btn-primary" onClick={handleGoBack} style={{ marginTop: '10px' }}>
          <FiArrowLeft size={18} />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100%',
  backgroundColor: 'var(--bg-color)',
  padding: '20px'
};

const cardStyle = {
  maxWidth: '480px',
  width: '100%',
  padding: '40px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '800',
  color: 'var(--text-color)',
  marginBottom: '12px'
};

const messageStyle = {
  fontSize: '15px',
  color: 'var(--text-muted)',
  lineHeight: '1.6',
  marginBottom: '30px'
};

export default AccessDenied;
