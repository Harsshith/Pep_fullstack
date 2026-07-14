const express = require('express');
const router = Router = express.Router();
const {
  applyLeave,
  getLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

// Get leave requests & submit leave requests
router.get('/', protect, getLeaves);
router.post('/', protect, authorize('employee'), applyLeave);

// Manager/Admin approves or rejects leave
router.put('/:id', protect, authorize('admin', 'manager'), updateLeaveStatus);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateLeaveStatus);

module.exports = router;
