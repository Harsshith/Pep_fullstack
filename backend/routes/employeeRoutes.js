const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin and Manager can list all employees
router.get('/', protect, authorize('admin', 'manager'), getEmployees);

// Any authenticated user can view employee details (with access restrictions checked inside controller)
router.get('/:id', protect, getEmployeeById);

// Admin only can add, edit, and delete employees
router.post('/', protect, authorize('admin'), upload.single('profilePic'), createEmployee);
router.put('/:id', protect, authorize('admin'), upload.single('profilePic'), updateEmployee);
router.delete('/:id', protect, authorize('admin'), deleteEmployee);

module.exports = router;
