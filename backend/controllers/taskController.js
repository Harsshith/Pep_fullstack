const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get tasks with search, filter, and pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      employeeId,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Role-based scoping
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'manager') {
      // Return tasks created by this manager or where team members are assigned
      query.assignedBy = req.user._id;
    }
    // Admin sees all

    // Search filter (title, description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Priority filter
    if (priority) {
      query.priority = priority;
    }

    // Employee filter (specifically for admin/manager looking up an employee's tasks)
    if (employeeId && req.user.role !== 'employee') {
      query.assignedTo = employeeId;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'fullName email employeeId profilePic')
      .populate('assignedBy', 'fullName email designation')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(query);

    res.status(200).json({
      tasks,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName email employeeId profilePic department')
      .populate('assignedBy', 'fullName email designation');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Access control
    if (
      req.user.role === 'employee' &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied: You are not assigned to this task' });
    }

    if (
      req.user.role === 'manager' &&
      task.assignedBy._id.toString() !== req.user._id.toString()
    ) {
      // Let managers view team tasks. If manager didn't assign it, they shouldn't view it unless it's their team.
      // For simplicity, verify task.assignedBy matches req.user._id (or if they are admin).
      return res.status(403).json({ message: 'Access denied: You did not assign this task' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a task (Manager or Admin)
// @route   POST /api/tasks
// @access  Private/Manager or Private/Admin
const createTask = async (req, res) => {
  const { title, description, priority, deadline, assignedTo } = req.body;

  try {
    if (!title || !description || !deadline || !assignedTo) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if assigned employee exists
    const employee = await User.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ message: 'Assigned employee not found' });
    }

    // Create task
    const task = new Task({
      title,
      description,
      priority: priority || 'Medium',
      deadline,
      assignedTo,
      assignedBy: req.user._id,
      status: 'Pending'
    });

    const savedTask = await task.save();

    // Create notification for employee
    await Notification.create({
      user: assignedTo,
      type: 'Task Assigned',
      message: `You have been assigned a new task: "${title}". Deadline: ${new Date(deadline).toLocaleDateString()}`
    });

    res.status(201).json(savedTask);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task details (Manager or Admin)
// @route   PUT /api/tasks/:id
// @access  Private/Manager or Private/Admin
const updateTask = async (req, res) => {
  const { title, description, priority, deadline, assignedTo, status } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check manager authorization (must be the one who assigned it or Admin)
    if (req.user.role === 'manager' && task.assignedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You cannot edit tasks you did not assign' });
    }

    // Update details
    const previousAssignee = task.assignedTo.toString();

    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.deadline = deadline || task.deadline;
    task.assignedTo = assignedTo || task.assignedTo;
    task.status = status || task.status;

    // Adjust percentage based on status
    if (status === 'Completed') {
      task.completionPercentage = 100;
    } else if (status === 'Pending') {
      task.completionPercentage = 0;
    }

    const updatedTask = await task.save();

    // Send notifications
    if (previousAssignee !== task.assignedTo.toString()) {
      // Reassigned
      await Notification.create({
        user: previousAssignee,
        type: 'Task Updated',
        message: `Task "${task.title}" has been unassigned from you.`
      });

      await Notification.create({
        user: task.assignedTo,
        type: 'Task Assigned',
        message: `You have been assigned a new task: "${task.title}".`
      });
    } else {
      // Updated details
      await Notification.create({
        user: task.assignedTo,
        type: 'Task Updated',
        message: `Your assigned task "${task.title}" details have been updated by your manager.`
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task (Manager or Admin)
// @route   DELETE /api/tasks/:id
// @access  Private/Manager or Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'manager' && task.assignedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You cannot delete tasks you did not assign' });
    }

    await Task.findByIdAndDelete(req.params.id);
    
    // Notify employee of deletion
    await Notification.create({
      user: task.assignedTo,
      type: 'Task Updated',
      message: `Assigned task "${task.title}" has been deleted by your manager.`
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task progress/status (Employee Only)
// @route   PUT /api/tasks/:id/progress
// @access  Private/Employee
const updateTaskProgress = async (req, res) => {
  const { status, remarks, completionPercentage } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify requesting user is the assigned employee
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You are not assigned to this task' });
    }

    if (!status || completionPercentage === undefined || !remarks) {
      return res.status(400).json({ message: 'Please provide status, completion percentage, and remarks' });
    }

    // Update main task values
    task.status = status;
    task.completionPercentage = parseInt(completionPercentage);
    task.remarks = remarks;

    // Handle Completed automation
    if (parseInt(completionPercentage) === 100) {
      task.status = 'Completed';
    }

    // Add progress update entry
    task.updates.push({
      date: new Date(),
      remarks,
      completionPercentage: parseInt(completionPercentage),
      status: task.status
    });

    const updatedTask = await task.save();

    // Notify the manager who assigned this task
    await Notification.create({
      user: task.assignedBy,
      type: 'Task Updated',
      message: `Employee ${req.user.fullName} updated task "${task.title}" to ${task.status} (${task.completionPercentage}%). Remarks: ${remarks}`
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskProgress
};
