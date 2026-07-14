import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiHome } from 'react-icons/fi';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="card glass">
        <FiAlertCircle size={64} color="var(--primary-color)" style={{ marginBottom: '20px' }} />
        <h1 style={titleStyle}>404 - Page Not Found</h1>
        <p style={messageStyle}>
          The page you are looking for does not exist or has been moved. Please check the URL or head back home.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <FiHome size={18} />
          Back Home
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

export default NotFound;
