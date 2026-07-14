const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true
  },
  profilePic: {
    type: String,
    default: ''
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^\+?[0-9]{10,15}$/, 'Please provide a valid mobile number']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() { return this.role !== 'admin'; }
  },
  designation: {
    type: String,
    required: function() { return this.role !== 'admin'; },
    trim: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    default: 0
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    required: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  }
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  if (!this.employeeId && this.role !== 'admin') {
    try {
      const lastUser = await this.constructor.findOne(
        { employeeId: /^EMP\d+$/ },
        {},
        { sort: { employeeId: -1 } }
      );
      
      let newNumber = 1001;
      if (lastUser && lastUser.employeeId) {
        const match = lastUser.employeeId.match(/^EMP(\d+)$/);
        if (match) {
          newNumber = parseInt(match[1]) + 1;
        }
      }
      this.employeeId = `EMP${newNumber}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
