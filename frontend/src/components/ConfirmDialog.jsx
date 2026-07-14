import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div className="card glass" style={modalStyle}>
        <div style={headerStyle}>
          <FiAlertTriangle size={32} color="var(--primary-color)" />
          <h3 style={titleStyle}>{title}</h3>
        </div>
        <div style={bodyStyle}>
          <p>{message}</p>
        </div>
        <div style={footerStyle}>
          <button className="btn btn-secondary btn-small" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-danger btn-small" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  maxWidth: '450px',
  width: '90%',
  padding: '24px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  animation: 'scaleIn 0.3s ease'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px'
};

const titleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  color: 'var(--text-color)'
};

const bodyStyle = {
  fontSize: '15px',
  color: 'var(--text-muted)',
  marginBottom: '24px',
  lineHeight: '1.5'
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px'
};

export default ConfirmDialog;
