import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from '../../components/Toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const redirectUser = (role) => {
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'manager') {
      navigate('/manager/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.fullName}!`);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      redirectUser(result.user.role);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="card glass">
        <div style={headerStyle}>
          <h1 style={titleStyle}>KEC Software</h1>
          <p style={subtitleStyle}>Employee Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={inputGroupStyle}>
            <label>Email Address</label>
            <div style={inputContainer}>
              <FiMail style={inputIcon} />
              <input
                type="email"
                className="form-control"
                style={inputControlStyle}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={inputGroupStyle}>
            <label>Password</label>
            <div style={inputContainer}>
              <FiLock style={inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={inputControlStyle}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                style={eyeBtnStyle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div style={actionsContainer}>
            <label style={checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={checkboxStyle}
              />
              Remember Me
            </label>
            <button
              type="button"
              style={forgotLinkStyle}
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={submitBtnStyle}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotModal && (
        <div style={overlayStyle}>
          <div className="card glass" style={modalStyle}>
            <h3 style={modalTitleStyle}>Forgot Password?</h3>
            <p style={modalBodyStyle}>
              For security reasons, self-service password recovery is disabled. Please contact your system Administrator or HR Department to reset your password.
            </p>
            <div style={modalFooterStyle}>
              <button
                className="btn btn-primary btn-small"
                onClick={() => setShowForgotModal(false)}
              >
                Okay, Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS-in-JS styling for premium UI elements
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
  maxWidth: '450px',
  width: '100%',
  padding: '40px',
  border: '1px solid var(--border-color)',
  boxShadow: '0 12px 40px var(--shadow-color)'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '35px'
};

const titleStyle = {
  fontSize: '36px',
  fontWeight: '800',
  color: 'var(--primary-color)',
  marginBottom: '8px',
  letterSpacing: '-1px'
};

const subtitleStyle = {
  color: 'var(--text-muted)',
  fontSize: '15px',
  fontWeight: '500'
};

const inputGroupStyle = {
  position: 'relative'
};

const inputContainer = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputIcon = {
  position: 'absolute',
  left: '16px',
  color: 'var(--primary-color)',
  zIndex: 10
};

const inputControlStyle = {
  paddingLeft: '48px',
  height: '50px'
};

const eyeBtnStyle = {
  position: 'absolute',
  right: '16px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const actionsContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px',
  fontSize: '14px'
};

const checkboxLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  color: 'var(--text-color)'
};

const checkboxStyle = {
  width: '16px',
  height: '16px',
  borderRadius: '4px',
  accentColor: 'var(--primary-color)',
  cursor: 'pointer'
};

const forgotLinkStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--primary-color)',
  cursor: 'pointer',
  fontWeight: '600'
};

const submitBtnStyle = {
  width: '100%',
  height: '50px',
  fontSize: '16px'
};

// Modal specific styling
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
  maxWidth: '400px',
  width: '90%',
  padding: '24px',
  animation: 'scaleIn 0.3s ease'
};

const modalTitleStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: 'var(--primary-color)',
  marginBottom: '12px'
};

const modalBodyStyle = {
  fontSize: '14px',
  color: 'var(--text-muted)',
  marginBottom: '20px',
  lineHeight: '1.5'
};

const modalFooterStyle = {
  display: 'flex',
  justifyContent: 'flex-end'
};

export default Login;
