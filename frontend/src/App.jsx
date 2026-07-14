import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Context Providers
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Route Guards & Layouts
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import Layout from './layouts/Layout';

// Common Components
import ToastContainer from './components/Toast';

// Auth Pages
import Login from './pages/Auth/Login';
import AccessDenied from './pages/Auth/AccessDenied';
import NotFound from './pages/Auth/NotFound';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import EmployeesList from './pages/Admin/EmployeesList';
import EmployeeForm from './pages/Admin/EmployeeForm';
import DepartmentsList from './pages/Admin/DepartmentsList';
import LeaveRequestsList from './pages/Admin/LeaveRequestsList';
import TaskMonitoring from './pages/Admin/TaskMonitoring';
import AdminProfile from './pages/Admin/Profile';

// Manager Pages
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import TeamMembers from './pages/Manager/TeamMembers';
import TaskManagement from './pages/Manager/TaskManagement';
import LeaveApprovals from './pages/Manager/LeaveApprovals';
import ManagerProfile from './pages/Manager/Profile';

// Employee Pages
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import MyTasks from './pages/Employee/MyTasks';
import ApplyLeave from './pages/Employee/ApplyLeave';
import EmployeeProfile from './pages/Employee/Profile';

// Root redirect handler
const RootRedirect = () => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return null; // Let the app load credentials silently
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'manager':
        return <Navigate to="/manager/dashboard" replace />;
      case 'employee':
        return <Navigate to="/employee/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                
                {/* Admin Routes */}
                <Route element={<RoleRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/employees" element={<EmployeesList />} />
                  <Route path="/admin/employees/new" element={<EmployeeForm />} />
                  <Route path="/admin/employees/edit/:id" element={<EmployeeForm />} />
                  <Route path="/admin/departments" element={<DepartmentsList />} />
                  <Route path="/admin/leaves" element={<LeaveRequestsList />} />
                  <Route path="/admin/tasks" element={<TaskMonitoring />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>

                {/* Manager Routes */}
                <Route element={<RoleRoute allowedRoles={['manager']} />}>
                  <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                  <Route path="/manager/team" element={<TeamMembers />} />
                  <Route path="/manager/tasks" element={<TaskManagement />} />
                  <Route path="/manager/leaves" element={<LeaveApprovals />} />
                  <Route path="/manager/profile" element={<ManagerProfile />} />
                </Route>

                {/* Employee Routes */}
                <Route element={<RoleRoute allowedRoles={['employee']} />}>
                  <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                  <Route path="/employee/tasks" element={<MyTasks />} />
                  <Route path="/employee/leave" element={<ApplyLeave />} />
                  <Route path="/employee/profile" element={<EmployeeProfile />} />
                </Route>

              </Route>
            </Route>

            {/* Root Route Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Custom toast popups */}
          <ToastContainer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
