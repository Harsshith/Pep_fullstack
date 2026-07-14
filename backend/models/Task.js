const mongoose = require('mongoose');

const ProgressUpdateSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  remarks: {
    type: String,
    required: true
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    required: true
  }
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  deadline: {
    type: Date,
    required: [true, 'Task deadline is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee assignment is required']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Manager assignment is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  remarks: {
    type: String,
    default: ''
  },
  updates: [ProgressUpdateSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
