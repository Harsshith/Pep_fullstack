import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import { FiMail, FiPhone, FiMapPin, FiLayers } from 'react-icons/fi';

const TeamMembers = () => {
  const { user } = useContext(AuthContext);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const deptId = user?.department?._id;
        
        const params = { role: 'employee', limit: 10000 };
        if (deptId) {
          params.department = deptId;
        }

        const res = await api.get('/employees', { params });
        setTeam(res.data.employees || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeam();
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Team Members</h1>
        <span className="badge badge-info" style={{ fontSize: '14px', fontWeight: 'bold' }}>
          Department: {user?.department?.name || 'All'}
        </span>
      </div>

      {team.length === 0 ? (
        <div className="card glass" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No employees assigned to this department yet.</p>
        </div>
      ) : (
        <div style={gridContainer}>
          {team.map((member) => (
            <div key={member._id} className="card glass" style={memberCard}>
              <div style={avatarSection}>
                {member.profilePic ? (
                  <img 
                    src={`${API_BASE_URL}${member.profilePic}`} 
                    alt="Avatar" 
                    style={avatarStyle} 
                  />
                ) : (
                  <div style={avatarPlaceholder}>
                    {member.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 style={memberName}>{member.fullName}</h3>
                <p style={memberDesignation}>{member.designation}</p>
                <span style={memberIdBadge}>{member.employeeId}</span>
              </div>

              <div style={detailsSection}>
                <div style={detailItem}>
                  <FiMail size={16} color="var(--primary-color)" />
                  <span style={detailText} title={member.email}>{member.email}</span>
                </div>
                <div style={detailItem}>
                  <FiPhone size={16} color="var(--primary-color)" />
                  <span style={detailText}>{member.mobileNumber}</span>
                </div>
                {member.address && (
                  <div style={detailItem}>
                    <FiMapPin size={16} color="var(--primary-color)" />
                    <span style={detailText} title={member.address}>{member.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const gridContainer = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '24px',
  marginTop: '20px'
};

const memberCard = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  justifyContent: 'space-between',
  minHeight: '300px'
};

const avatarSection = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%'
};

const avatarStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid var(--primary-color)',
  marginBottom: '12px'
};

const avatarPlaceholder = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '32px',
  marginBottom: '12px'
};

const memberName = {
  fontSize: '18px',
  fontWeight: '800',
  color: 'var(--text-color)',
  marginBottom: '4px'
};

const memberDesignation = {
  fontSize: '13px',
  color: 'var(--text-muted)',
  fontWeight: '600',
  marginBottom: '10px'
};

const memberIdBadge = {
  fontSize: '11px',
  padding: '3px 8px',
  borderRadius: '10px',
  backgroundColor: 'var(--hover-color)',
  color: 'var(--primary-color)',
  fontWeight: '700'
};

const detailsSection = {
  width: '100%',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '16px',
  marginTop: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  textAlign: 'left'
};

const detailItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '13px',
  color: 'var(--text-color)'
};

const detailText = {
  fontWeight: '600',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '200px'
};

export default TeamMembers;
