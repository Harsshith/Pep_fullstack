import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { API_BASE_URL } from '../../config';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiFilter, 
  FiChevronUp, 
  FiChevronDown 
} from 'react-icons/fi';

const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Sorting state
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);

  const navigate = useNavigate();

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  // Fetch employees list
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees', {
        params: {
          search,
          department: deptFilter,
          role: roleFilter,
          status: statusFilter,
          sortBy,
          order,
          page,
          limit: 8
        }
      });
      setEmployees(res.data.employees || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load employees list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 on filter/search change
    setPage(1);
  }, [search, deptFilter, roleFilter, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, deptFilter, roleFilter, statusFilter, sortBy, order]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const handleDeleteTrigger = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/employees/${deleteId}`);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return order === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employee Management</h1>
        <Link to="/admin/employees/new" className="btn btn-primary">
          <FiPlus /> Add Employee
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card glass" style={filterBarContainer}>
        <div style={searchBox}>
          <FiSearch style={searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, mobile or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </div>

        <div style={filtersWrapper}>
          <div style={filterItem}>
            <FiFilter size={14} color="var(--primary-color)" />
            <select 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={filterItem}>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div style={filterItem}>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      {loading ? (
        <LoadingSpinner />
      ) : employees.length === 0 ? (
        <div className="card glass" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No employees found matching standard search filters.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={sortHeader} onClick={() => handleSort('employeeId')}>
                    Employee ID <SortIcon field="employeeId" />
                  </th>
                  <th style={sortHeader} onClick={() => handleSort('fullName')}>
                    Name <SortIcon field="fullName" />
                  </th>
                  <th>Email</th>
                  <th style={sortHeader} onClick={() => handleSort('department')}>
                    Department <SortIcon field="department" />
                  </th>
                  <th style={sortHeader} onClick={() => handleSort('designation')}>
                    Designation <SortIcon field="designation" />
                  </th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                      {emp.employeeId || 'ADMIN'}
                    </td>
                    <td>
                      <div style={nameCell}>
                        {emp.profilePic ? (
                          <img 
                            src={`${API_BASE_URL}${emp.profilePic}`} 
                            alt="Avatar" 
                            style={avatarStyle} 
                          />
                        ) : (
                          <div style={avatarPlaceholder}>{emp.fullName.charAt(0).toUpperCase()}</div>
                        )}
                        <span>{emp.fullName}</span>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.department?.name || 'N/A'}</td>
                    <td>{emp.designation || 'N/A'}</td>
                    <td>
                      <span className="badge badge-info">{emp.role}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${emp.status.toLowerCase()}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div style={actionsGroup}>
                        <button 
                          className="btn btn-secondary btn-small" 
                          onClick={() => setViewEmployee(emp)}
                          title="View Details"
                          style={{ padding: '6px' }}
                        >
                          <FiEye size={14} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-small" 
                          onClick={() => navigate(`/admin/employees/edit/${emp._id}`)}
                          title="Edit"
                          style={{ padding: '6px' }}
                        >
                          <FiEdit2 size={14} />
                        </button>
                        {emp.role !== 'admin' && (
                          <button 
                            className="btn btn-danger btn-small" 
                            onClick={() => handleDeleteTrigger(emp._id)}
                            title="Delete"
                            style={{ padding: '6px' }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn" 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                disabled={page === 1}
              >
                Previous
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-btn ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button 
                className="pagination-btn" 
                onClick={() => setPage(prev => Math.min(prev + 1, pages))} 
                disabled={page === pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This will permanently remove their records from the system."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
      />

      {/* View Employee Detail Modal */}
      {viewEmployee && (
        <div style={overlayStyle}>
          <div className="card glass" style={modalStyle}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Employee Details</h3>
              <button style={closeBtn} onClick={() => setViewEmployee(null)}>×</button>
            </div>
            
            <div style={detailBody}>
              <div style={detailHeader}>
                {viewEmployee.profilePic ? (
                  <img 
                    src={`${API_BASE_URL}${viewEmployee.profilePic}`} 
                    alt="Profile" 
                    style={largeAvatar} 
                  />
                ) : (
                  <div style={largeAvatarPlaceholder}>
                    {viewEmployee.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 style={detailName}>{viewEmployee.fullName}</h4>
                  <p style={detailRole}>{viewEmployee.role.toUpperCase()}</p>
                </div>
              </div>

              <div style={detailGrid}>
                <div style={detailItem}>
                  <span style={detailLabel}>Employee ID</span>
                  <span style={detailValue}>{viewEmployee.employeeId || 'ADMIN'}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Email</span>
                  <span style={detailValue}>{viewEmployee.email}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Mobile</span>
                  <span style={detailValue}>{viewEmployee.mobileNumber}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Department</span>
                  <span style={detailValue}>{viewEmployee.department?.name || 'N/A'}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Designation</span>
                  <span style={detailValue}>{viewEmployee.designation || 'N/A'}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Joining Date</span>
                  <span style={detailValue}>
                    {viewEmployee.joiningDate ? new Date(viewEmployee.joiningDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {viewEmployee.salary !== undefined && (
                  <div style={detailItem}>
                    <span style={detailLabel}>Salary</span>
                    <span style={detailValue}>${viewEmployee.salary.toLocaleString()}</span>
                  </div>
                )}
                <div style={detailItem}>
                  <span style={detailLabel}>Status</span>
                  <span style={detailValue}>
                    <span className={`badge badge-${viewEmployee.status.toLowerCase()}`}>{viewEmployee.status}</span>
                  </span>
                </div>
                <div style={{ ...detailItem, gridColumn: 'span 2' }}>
                  <span style={detailLabel}>Address</span>
                  <span style={detailValue}>{viewEmployee.address || 'No address provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Styles
const filterBarContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '15px',
  padding: '16px',
  marginBottom: '24px'
};

const searchBox = {
  position: 'relative',
  flex: '1 1 300px',
  display: 'flex',
  alignItems: 'center'
};

const searchIcon = {
  position: 'absolute',
  left: '14px',
  color: 'var(--primary-color)'
};

const searchInput = {
  width: '100%',
  padding: '10px 16px 10px 42px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--card-bg)',
  color: 'var(--text-color)',
  fontSize: '14px'
};

const filtersWrapper = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
};

const filterItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  padding: '0 10px'
};

const selectStyle = {
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-color)',
  padding: '10px 0',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '600'
};

const sortHeader = {
  cursor: 'pointer',
  userSelect: 'none'
};

const nameCell = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const avatarStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  objectFit: 'cover'
};

const avatarPlaceholder = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  backgroundColor: 'var(--secondary-color)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '12px'
};

const actionsGroup = {
  display: 'flex',
  gap: '8px'
};

/* Modal styles */
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
  maxWidth: '550px',
  width: '90%',
  padding: '24px',
  animation: 'scaleIn 0.3s ease'
};

const modalHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '10px'
};

const modalTitle = {
  fontSize: '20px',
  fontWeight: '800',
  color: 'var(--primary-color)'
};

const closeBtn = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: 'var(--text-muted)'
};

const detailBody = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const detailHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px'
};

const largeAvatar = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid var(--primary-color)'
};

const largeAvatarPlaceholder = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '28px'
};

const detailName = {
  fontSize: '20px',
  fontWeight: '700',
  color: 'var(--text-color)',
  marginBottom: '4px'
};

const detailRole = {
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--primary-color)',
  letterSpacing: '1px'
};

const detailGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '15px',
  backgroundColor: 'var(--hover-color)',
  padding: '16px',
  borderRadius: '12px'
};

const detailItem = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const detailLabel = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: '600'
};

const detailValue = {
  fontSize: '14px',
  color: 'var(--text-color)',
  fontWeight: '600'
};

export default EmployeesList;
