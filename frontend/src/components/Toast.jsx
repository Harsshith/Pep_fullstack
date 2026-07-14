import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

export const toast = {
  success: (message) => {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message } }));
  },
  error: (message) => {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message } }));
  },
  info: (message) => {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'info', message } }));
  }
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const { type, message } = e.detail;
      const id = Date.now() + Math.random().toString();
      
      setToasts((prev) => [...prev, { id, type, message }]);
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('app-toast', handleToastEvent);
    return () => window.removeEventListener('app-toast', handleToastEvent);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={containerStyle}>
      {toasts.map((t) => (
        <div key={t.id} style={{ ...toastStyle, ...typeStyles[t.type] }}>
          <div style={contentStyle}>
            {t.type === 'success' && <FiCheckCircle size={20} />}
            {t.type === 'error' && <FiXCircle size={20} />}
            {t.type === 'info' && <FiInfo size={20} />}
            <span style={textStyle}>{t.message}</span>
          </div>
          <button style={closeBtnStyle} onClick={() => removeToast(t.id)}>
            <FiX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

const containerStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '350px',
  width: '100%'
};

const toastStyle = {
  padding: '12px 16px',
  borderRadius: '10px',
  color: 'white',
  fontSize: '14px',
  fontWeight: '600',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  animation: 'slideIn 0.3s ease',
  gap: '10px'
};

const typeStyles = {
  success: {
    backgroundColor: '#52c41a',
    borderLeft: '5px solid #237804'
  },
  error: {
    backgroundColor: '#ff4d4f',
    borderLeft: '5px solid #a8071a'
  },
  info: {
    backgroundColor: '#1890ff',
    borderLeft: '5px solid #0050b3'
  }
};

const contentStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flex: 1
};

const textStyle = {
  lineHeight: '1.4'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  opacity: 0.8,
  transition: 'opacity 0.2s'
};

export default ToastContainer;
