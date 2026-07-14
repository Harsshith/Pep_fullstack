# Full Stack Employee Management System (EMS)

A modern, responsive, production-ready Full Stack Employee Management System built with a Light Purple Glassmorphic theme. Features Role-Based Access Control (Admin, Manager, Employee), Dark Mode, live progress monitoring, department management, leave applications, task logging, and real-time search/filters.

## Project Overview

This application acts as a centralized dashboard for organization staff. It supports distinct operations for three roles:
1. **Admin**: Create, edit, delete, view employees, manage departments, monitor all leave applications, and view tasks progress logs.
2. **Manager**: View department team members, create/edit/delete tasks, monitor task completion, and approve or reject leave requests.
3. **Employee**: View dashboard stats, update assigned tasks progress (completion percentage and daily remarks), apply for leaves, and receive alert logs.

---

## Tech Stack

**Frontend**
- React.js (Vite)
- React Router DOM
- Axios
- React Icons
- Custom HSL Light Purple Theme (No Tailwind/Bootstrap)
- Glassmorphism & Micro-animations

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs (Password hashing)
- Multer (Profile picture uploads)
- Dotenv & CORS

---

## Folder Structure

```text
employee-management-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── departmentController.js
│   │   ├── taskController.js
│   │   ├── leaveController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── Task.js
│   │   ├── LeaveRequest.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── leaveRoutes.js
│   │   └── notificationRoutes.js
│   ├── utils/
│   │   └── seeder.js
│   ├── uploads/          # Local storage for uploaded photos
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── LoadingSpinner.jsx
        │   ├── ConfirmDialog.jsx
        │   └── Toast.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── layouts/
        │   └── Layout.jsx
        ├── pages/
        │   ├── ProfileCommon.jsx
        │   ├── Auth/
        │   │   ├── Login.jsx
        │   │   ├── AccessDenied.jsx
        │   │   └── NotFound.jsx
        │   ├── Admin/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── EmployeesList.jsx
        │   │   ├── EmployeeForm.jsx
        │   │   ├── DepartmentsList.jsx
        │   │   ├── LeaveRequestsList.jsx
        │   │   ├── TaskMonitoring.jsx
        │   │   └── Profile.jsx
        │   ├── Manager/
        │   │   ├── ManagerDashboard.jsx
        │   │   ├── TeamMembers.jsx
        │   │   ├── TaskManagement.jsx
        │   │   ├── LeaveApprovals.jsx
        │   │   └── Profile.jsx
        │   └── Employee/
        │       ├── EmployeeDashboard.jsx
        │       ├── MyTasks.jsx
        │       ├── ApplyLeave.jsx
        │       └── Profile.jsx
        └── services/
            └── api.js
```

---

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm / yarn
- MongoDB server running locally or a MongoDB Atlas URI

### 1. MongoDB Setup
Make sure MongoDB is running on your system locally:
- Windows: Run `mongod` command or ensure the MongoDB service is running in System Services.
- Connection Default: `mongodb://127.0.0.1:27017/employee_management`

### 2. Backend Setup
Navigate to the backend directory and configure the environment:
```bash
cd backend
# Install dependencies
npm install

# Create/Edit .env file in backend/ with:
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/employee_management
JWT_SECRET=supersecretjwtkeyforrolebasedauth12345
NODE_ENV=development
```

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
# Install dependencies
npm install
```

---

## Running the Application

To run the application locally, start both the backend and frontend development servers.

### Run Backend
In the `backend/` directory:
```bash
# Starts Node server on port 5000 (auto-seeds database on first connection)
npm start

# Or to run with nodemon in development mode:
npm run dev
```

### Run Frontend
In the `frontend/` directory:
```bash
# Starts Vite local server on http://localhost:5173
npm run dev
```

---

## Default Login Credentials
Upon first startup, the database seeder will automatically insert the following default credentials for testing:

| Role | Username / Email | Password |
|---|---|---|
| **Admin** | `admin@gmail.com` | `Admin@123` |
| **Manager** | `manager@gmail.com` | `Manager@123` |
| **Employee** | `employee@gmail.com` | `Employee@123` |

*(Additional testing accounts manager2@gmail.com and employee2@gmail.com - employee8@gmail.com are seeded as well).*

---

## API Documentation

### Authentication `/api/auth`
- `POST /api/auth/login` - Public login. Returns user details and JWT Token.
- `POST /api/auth/register` - Private (Admin). Create new manager/employee.
- `GET /api/auth/profile` - Private. Fetch current user profile details.
- `PUT /api/auth/profile` - Private. Edit user profile details and upload profile photo.
- `PUT /api/auth/change-password` - Private. Change current password.

### Employees `/api/employees`
- `GET /api/employees` - Private (Admin/Manager). Retrieve employees with pagination, search, sorting, and department/role/status filters.
- `GET /api/employees/:id` - Private. Get detail parameters for single employee.
- `POST /api/employees` - Private (Admin). Create employee with Multer file profile pic upload.
- `PUT /api/employees/:id` - Private (Admin). Update employee details.
- `DELETE /api/employees/:id` - Private (Admin). Remove employee.

### Departments `/api/departments`
- `GET /api/departments` - Private. Lists all departments and counts active employees in each.
- `POST /api/departments` - Private (Admin). Create department.
- `PUT /api/departments/:id` - Private (Admin). Edit department.
- `DELETE /api/departments/:id` - Private (Admin). Delete department (fails if employees are assigned to it).

### Tasks `/api/tasks`
- `GET /api/tasks` - Private. Retrieve tasks scoped by role (Admin sees all, Manager sees tasks they assigned, Employee sees tasks assigned to them). Supports search and status filters.
- `POST /api/tasks` - Private (Admin/Manager). Create and assign task to employee.
- `PUT /api/tasks/:id` - Private (Admin/Manager). Edit task details.
- `DELETE /api/tasks/:id` - Private (Admin/Manager). Remove task.
- `PUT /api/tasks/:id/progress` - Private (Employee). Log daily progress, status, and completion %.

### Leaves `/api/leaves`
- `GET /api/leaves` - Private. Retrieve leave applications scoped by role.
- `POST /api/leaves` - Private (Employee). Submit leave request.
- `PUT /api/leaves/:id` - Private (Admin/Manager). Approve or Reject leave request.

### Notifications `/api/notifications`
- `GET /api/notifications` - Private. Returns latest 50 notifications for logged-in user.
- `PUT /api/notifications` - Private. Mark all user notifications read.
- `PUT /api/notifications/:id` - Private. Mark specific user notification read.

---

## Security Configurations Included
- **JWT Middleware**: Enforces token validation on all private routes.
- **Role Middleware**: Restricts administrative endpoints (registration, employee deletion, department CRUD) strictly to Admin roles.
- **Hashed Passwords**: Bcryptjs salt hashing ensures database passwords remain secure.
- **Multer File Validation**: Strict limits on image file uploads (JPEG/PNG/WEBP, Max 5MB).
- **Data Validation**: Client and server side regex validators verify mobile numbers and emails.

---

## Future Improvements
- Integrate standard mail notification relays (e.g. NodeMailer) on task assignments and leave status updates.
- Connect MongoDB database logs index mapping to search optimizations (e.g. Atlas search).
- Implement interactive calendar scheduler UI for employees leave monitoring and task deadlines.
