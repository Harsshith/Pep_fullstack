const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private/Employee
const applyLeave = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  try {
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const leave = new LeaveRequest({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    });

    const savedLeave = await leave.save();

    // Notify Admins and Managers
    // Find managers to notify
    const managers = await User.find({ role: 'manager' });
    for (const manager of managers) {
      await Notification.create({
        user: manager._id,
        type: 'System',
        message: `New leave request submitted by ${req.user.fullName} (${leaveType}).`
      });
    }

    res.status(201).json(savedLeave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all leave requests with filters
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res) => {
  try {
    const { status, employeeId, page = 1, limit = 10 } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      // Managers can view team leaves. We can let managers view all employee leaves or department-specific.
      // If manager has a department, we can list leaves of employees in that department, or let managers view all leaves.
      // Let's filter team members or allow viewing all non-admin leaves.
      const employees = await User.find({ role: 'employee' }).select('_id');
      const employeeIds = employees.map(emp => emp._id);
      query.employee = { $in: employeeIds };
    }
    // Admin sees all leaves

    // Override if manager/admin wants to query specific employee
    if (employeeId && req.user.role !== 'employee') {
      query.employee = employeeId;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'employee',
        select: 'fullName email employeeId designation department profilePic',
        populate: {
          path: 'department',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await LeaveRequest.countDocuments(query);

    res.status(200).json({
      leaves,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id/status
// @access  Private/Manager or Private/Admin
const updateLeaveStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected' });
    }

    const leave = await LeaveRequest.findById(req.params.id).populate('employee', 'fullName');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Update status
    leave.status = status;
    const updatedLeave = await leave.save();

    // Create notification for employee
    await Notification.create({
      user: leave.employee._id,
      type: status === 'Approved' ? 'Leave Approved' : 'Leave Rejected',
      message: `Your leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been ${status.toLowerCase()} by your manager.`
    });

    res.status(200).json(updatedLeave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus
};
