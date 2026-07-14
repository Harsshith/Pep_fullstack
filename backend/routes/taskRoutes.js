const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskProgress
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

// List/view tasks
router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);

// Admin/Manager task management
router.post('/', protect, authorize('admin', 'manager'), createTask);
router.put('/:id', protect, authorize('admin', 'manager'), updateTask);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteTask);

// Employee task progress updates
router.put('/:id/progress', protect, authorize('employee'), updateTaskProgress);

module.exports = router;
