import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import { FiCalendar, FiPlus, FiSend, FiClock } from 'react-icons/fi';

const ApplyLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves?limit=10000');
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      toast.error('Please enter all required fields');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setFormLoading(true);
    try {
      await api.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason: reason.trim()
      });
      toast.success('Leave application submitted successfully');
      setLeaveType('Sick Leave');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Leave Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Apply for time off and track your approval status.</p>
      </div>

      <div className="leave-split">
        {/* Left Side: Apply Form */}
        <form onSubmit={handleSubmit} className="card glass" style={formCard}>
          <h3 style={sectionTitle}>
            <FiPlus color="var(--primary-color)" /> Apply for Leave
          </h3>

          <div className="form-group">
            <label>Leave Type *</label>
            <select
              className="form-control"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              required
            >
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Paternity Leave">Paternity Leave</option>
              <option value="Loss of Pay">Loss of Pay</option>
            </select>
          </div>

          <div style={formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Start Date *</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>End Date *</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Leave *</label>
            <textarea
              className="form-control"
              placeholder="State the reason for your time off..."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{ resize: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={formLoading}>
            <FiSend /> {formLoading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        {/* Right Side: History */}
        <div className="card glass" style={historyCard}>
          <h3 style={sectionTitle}>
            <FiClock color="var(--primary-color)" /> My Leave History
          </h3>

          {loading ? (
            <LoadingSpinner />
          ) : leaves.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              No leave history found.
            </p>
          ) : (
            <div style={historyList}>
              {leaves.map((leave) => {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <div key={leave._id} style={leaveItem}>
                    <div style={leaveHeader}>
                      <span style={leaveTypeName}>{leave.leaveType}</span>
                      <span className={`badge badge-${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </div>
                    <p style={leaveReason}>{leave.reason}</p>
                    <div style={leaveDates}>
                      <span>
                        Dates: {start.toLocaleDateString()} - {end.toLocaleDateString()}
                      </span>
                      <span><b>{diffDays} {diffDays === 1 ? 'day' : 'days'}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formCard = {
  padding: '30px'
};

const historyCard = {
  padding: '30px'
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '800',
  color: 'var(--text-color)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '20px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '10px'
};

const formRow = {
  display: 'flex',
  gap: '15px'
};

const historyList = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  maxHeight: '400px',
  overflowY: 'auto',
  paddingRight: '5px'
};

const leaveItem = {
  padding: '14px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--card-bg)'
};

const leaveHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px'
};

const leaveTypeName = {
  fontWeight: '700',
  fontSize: '14px',
  color: 'var(--primary-color)'
};

const leaveReason = {
  fontSize: '13px',
  color: 'var(--text-color)',
  margin: '8px 0',
  lineHeight: '1.4'
};

const leaveDates = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: 'var(--text-muted)'
};

export default ApplyLeave;
