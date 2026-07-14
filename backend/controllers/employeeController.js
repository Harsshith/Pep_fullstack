const User = require('../models/User');
const Department = require('../models/Department');
const Notification = require('../models/Notification');

// @desc    Get all employees with Search, Filter, Pagination, Sorting
// @route   GET /api/employees
// @access  Private/Admin or Private/Manager
const getEmployees = async (req, res) => {
  try {
    const {
      search,
      department,
      status,
      role,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Do not return Admins in standard listings unless requested, or filter based on user roles
    // Actually, listing all employees/managers is fine.
    
    // Search filter
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Department filter
    if (department) {
      query.department = department;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const employees = await User.find(query)
      .select('-password')
      .populate('department', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      employees,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Access control: Employee can only view their own profile, managers can view team members, admin can view all
    if (req.user.role === 'employee' && req.user._id.toString() !== employee._id.toString()) {
      return res.status(403).json({ message: 'Access denied: Cannot view other employee details' });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create Employee (Admin Only)
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      department,
      designation,
      joiningDate,
      salary,
      address,
      status,
      role,
      password
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    let profilePic = '';
    if (req.file) {
      profilePic = `/uploads/${req.file.filename}`;
    }

    const employee = new User({
      fullName,
      email,
      mobileNumber,
      department: department || undefined,
      designation,
      joiningDate: joiningDate || undefined,
      salary: salary || 0,
      address,
      status: status || 'Active',
      role: role || 'employee',
      password,
      profilePic
    });

    const savedEmployee = await employee.save();

    // Create a notification for the employee
    await Notification.create({
      user: savedEmployee._id,
      type: 'Employee Added',
      message: `Account created for ${savedEmployee.fullName} as ${savedEmployee.role}.`
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        _id: savedEmployee._id,
        employeeId: savedEmployee.employeeId,
        fullName: savedEmployee.fullName,
        email: savedEmployee.email,
        role: savedEmployee.role
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update Employee (Admin Only)
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Fields that admin can update
    employee.fullName = req.body.fullName || employee.fullName;
    employee.email = req.body.email || employee.email;
    employee.mobileNumber = req.body.mobileNumber || employee.mobileNumber;
    employee.department = req.body.department !== undefined ? (req.body.department || undefined) : employee.department;
    employee.designation = req.body.designation || employee.designation;
    employee.joiningDate = req.body.joiningDate || employee.joiningDate;
    employee.salary = req.body.salary !== undefined ? req.body.salary : employee.salary;
    employee.address = req.body.address || employee.address;
    employee.status = req.body.status || employee.status;
    employee.role = req.body.role || employee.role;

    // Check if new password is sent
    if (req.body.password && req.body.password.trim() !== '') {
      employee.password = req.body.password;
    }

    // Handle Profile Pic if uploaded in file
    if (req.file) {
      employee.profilePic = `/uploads/${req.file.filename}`;
    }

    const updatedEmployee = await employee.save();
    
    res.status(200).json({
      message: 'Employee updated successfully',
      employee: {
        _id: updatedEmployee._id,
        employeeId: updatedEmployee.employeeId,
        fullName: updatedEmployee.fullName,
        email: updatedEmployee.email,
        role: updatedEmployee.role
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete Employee (Admin Only)
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Prevent Admin from deleting themselves
    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete their own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
