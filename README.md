# 🚀 Full Stack Employee Management System (EMS)

A modern **Role-Based Employee Management System** built with **React.js, Node.js, Express.js, and MongoDB**. The application provides a complete solution for managing employees, departments, tasks, leave requests, and notifications through secure authentication and role-based access.

---

# ✨ Features

## 🔐 Authentication & Authorization
- JWT Authentication
- Role-Based Access Control (Admin, Manager, Employee)
- Secure Password Hashing (bcryptjs)
- Protected Routes

## 👨‍💼 Admin Module
- Dashboard Overview
- Employee Management (CRUD)
- Department Management
- Task Monitoring
- Leave Request Management
- Profile Management

## 👨‍💻 Manager Module
- Team Management
- Assign & Update Tasks
- Monitor Task Progress
- Approve / Reject Leave Requests
- Profile Management

## 👨 Employee Module
- Dashboard
- View Assigned Tasks
- Update Task Progress
- Apply Leave
- Notifications
- Profile Management

## 🎨 UI Features
- Responsive Design
- Glassmorphism UI
- Light Purple Theme
- Dark Mode Support
- Smooth Animations
- Search & Filters

---

# 🛠️ Tech Stack

## Frontend
- React.js (Vite)
- React Router DOM
- Axios
- React Icons
- CSS3
- Context API

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- CORS
- Dotenv

---

# 📁 Project Structure

```text
employee-management-system/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/employee-management-system.git
```

```bash
cd employee-management-system
```

---

# 📦 Backend Setup

Move to backend folder

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/employee_management
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Start backend server

```bash
npm run dev
```

or

```bash
npm start
```

Backend Server

```
http://localhost:5000
```

---

# 💻 Frontend Setup

Move to frontend

```bash
cd frontend
```

Install packages

```bash
npm install
```

Start React Application

```bash
npm run dev
```

Frontend

```
http://localhost:5173
```

---

# 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | Admin@123 |
| Manager | manager@gmail.com | Manager@123 |
| Employee | employee@gmail.com | Employee@123 |

---

# 🌐 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | User Login |
| POST | `/api/auth/register` | Register User |
| GET | `/api/auth/profile` | Get Profile |
| PUT | `/api/auth/profile` | Update Profile |
| PUT | `/api/auth/change-password` | Change Password |

---

## Employees

| Method | Endpoint |
|---------|----------|
| GET | `/api/employees` |
| GET | `/api/employees/:id` |
| POST | `/api/employees` |
| PUT | `/api/employees/:id` |
| DELETE | `/api/employees/:id` |

---

## Departments

| Method | Endpoint |
|---------|----------|
| GET | `/api/departments` |
| POST | `/api/departments` |
| PUT | `/api/departments/:id` |
| DELETE | `/api/departments/:id` |

---

## Tasks

| Method | Endpoint |
|---------|----------|
| GET | `/api/tasks` |
| POST | `/api/tasks` |
| PUT | `/api/tasks/:id` |
| DELETE | `/api/tasks/:id` |
| PUT | `/api/tasks/:id/progress` |

---

## Leave Management

| Method | Endpoint |
|---------|----------|
| GET | `/api/leaves` |
| POST | `/api/leaves` |
| PUT | `/api/leaves/:id` |

---

## Notifications

| Method | Endpoint |
|---------|----------|
| GET | `/api/notifications` |
| PUT | `/api/notifications` |
| PUT | `/api/notifications/:id` |

---

# 🔒 Security

- JWT Authentication
- Role-Based Authorization
- Password Hashing (bcryptjs)
- Multer File Upload Validation
- Protected API Routes
- Input Validation
- Environment Variables
- MongoDB Schema Validation

---

# 📸 Screenshots

Add your screenshots here.

```
screenshots/

dashboard.png
employees.png
departments.png
tasks.png
leave.png
profile.png
login.png
```

---

# 🚀 Future Enhancements

- Email Notifications
- Real-Time Notifications (Socket.io)
- Calendar Integration
- Attendance Management
- Payroll Module
- Report Generation
- Export PDF & Excel
- Two-Factor Authentication (2FA)
- Docker Deployment

---

# 👨‍💻 Author

**Harsshhi**

- Full Stack Developer
- React.js | Node.js | MongoDB | Express.js

---

# ⭐ Support

If you found this project helpful, please give it a **⭐ Star** on GitHub.
