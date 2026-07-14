const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const departments = await Department.find(query).sort({ name: 1 });
    
    // For each department, find count of users
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const count = await User.countDocuments({ department: dept._id });
        return {
          _id: dept._id,
          name: dept.name,
          description: dept.description,
          employeeCount: count,
          createdAt: dept.createdAt,
          updatedAt: dept.updatedAt
        };
      })
    );

    res.status(200).json(departmentsWithCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const count = await User.countDocuments({ department: department._id });
    res.status(200).json({
      ...department._doc,
      employeeCount: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create department (Admin Only)
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res) => {
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const deptExists = await Department.findOne({ name: name.trim() });
    if (deptExists) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }

    const department = new Department({
      name: name.trim(),
      description
    });

    const savedDept = await department.save();
    res.status(201).json(savedDept);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update department (Admin Only)
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res) => {
  const { name, description } = req.body;

  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (name) {
      const deptExists = await Department.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
      if (deptExists) {
        return res.status(400).json({ message: 'Another department already has this name' });
      }
      department.name = name.trim();
    }
    
    if (description !== undefined) {
      department.description = description;
    }

    const updatedDept = await department.save();
    res.status(200).json(updatedDept);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete department (Admin Only)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if any employee is in this department
    const employeeExists = await User.findOne({ department: req.params.id });
    if (employeeExists) {
      return res.status(400).json({
        message: 'Cannot delete department. There are active employees assigned to it.'
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
