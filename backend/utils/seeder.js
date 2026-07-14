const User = require('../models/User');
const Department = require('../models/Department');

const seedData = async () => {
  try {
    // Check if users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has users. Skipping seeding.');
      return;
    }

    console.log('Starting Database Seeding...');

    // 1. Create Departments
    const deptNames = [
      { name: 'Developer', description: 'Software Development Team' },
      { name: 'HR', description: 'Human Resources Team' },
      { name: 'Testing', description: 'Quality Assurance & Testing Team' },
      { name: 'Marketing', description: 'Marketing & Sales Strategy Team' },
      { name: 'Sales', description: 'Customer Acquisition & Sales' },
      { name: 'Support', description: 'Technical & Customer Support Team' },
      { name: 'Accounts', description: 'Finance and Account Management' }
    ];

    const createdDepts = [];
    for (const d of deptNames) {
      let dept = await Department.findOne({ name: d.name });
      if (!dept) {
        dept = await Department.create(d);
        console.log(`Department "${d.name}" created.`);
      }
      createdDepts.push(dept);
    }

    // Map department names to their ObjectIds for easy reference
    const deptMap = {};
    createdDepts.forEach(dept => {
      deptMap[dept.name] = dept._id;
    });

    // 2. Create Users
    // Admin (1 User)
    await User.create({
      fullName: 'System Admin',
      email: 'admin@gmail.com',
      mobileNumber: '+919876543210',
      role: 'admin',
      password: 'Admin@123',
      designation: 'Administrator',
      status: 'Active',
      address: 'Admin Office Headquarters'
    });
    console.log('Admin user seeded: admin@gmail.com / Admin@123');

    // Managers (2 Users)
    const managers = [
      {
        fullName: 'John Manager',
        email: 'manager@gmail.com',
        mobileNumber: '+919876543211',
        role: 'manager',
        password: 'Manager@123',
        department: deptMap['Developer'],
        designation: 'Engineering Manager',
        salary: 120000,
        address: 'Downtown Street, NY',
        status: 'Active'
      },
      {
        fullName: 'Sarah HR Manager',
        email: 'manager2@gmail.com',
        mobileNumber: '+919876543212',
        role: 'manager',
        password: 'Manager@123',
        department: deptMap['HR'],
        designation: 'HR Lead',
        salary: 95000,
        address: 'Uptown Business Block, SF',
        status: 'Active'
      }
    ];

    for (const m of managers) {
      await User.create(m);
    }
    console.log('Managers seeded: manager@gmail.com, manager2@gmail.com / Manager@123');

    // Employees (8 Users)
    const employees = [
      {
        fullName: 'Alex Dev',
        email: 'employee@gmail.com',
        mobileNumber: '+919876543213',
        role: 'employee',
        password: 'Employee@123',
        department: deptMap['Developer'],
        designation: 'Frontend Engineer',
        salary: 75000,
        address: 'Queens, NY',
        status: 'Active'
      },
      {
        fullName: 'Bob Dev',
        email: 'employee2@gmail.com',
        mobileNumber: '+919876543214',
        role: 'employee',
        password: 'Employee@123',
        department: deptMap['Developer'],
        designation: 'Backend Engineer',
        salary: 80000,
        address: 'Brooklyn, NY',
        status: 'Active'
      },
      {
        fullName: 'Charlie Tester',
        email: 'employee3@gmail.com',
        mobileNumber: '+919876543215',
        role: 'employee',
        password: 'Employee@123',
        department: deptMap['Testing'],
        designation: 'QA Analyst',
        salary: 60000,
        address: 'Bronx, NY',
        status: 'Active'
      },
      {
        fullName: 'Diana Marketing',
        email: 'employee4@gmail.com',
        mobileNumber: '+919876543216',
        role: 'employee',
        password: 'Employee@123',
        department: deptMap['Marketing'],
        designation: 'Content Creator',
        salary: 55000,
        address: 'Staten Island, NY',
        status: 'Active'
      },
      {
        fullName: 'Ethan Sales',
        email: 'employee5@gmail.com',
        mobileNumber: '+919876543217',
        role: 'employee',
        password: 'Employee@123',
        department: deptMap['Sales'],
        designation: 'Sales Representative',
        salary: 50000,
        address: 'Manhattan, NY',
        status: 'Active'
      },
      {
        fullName: 'Fiona Support',
        email: 'employee6@gmail.com',
        mobileNumber: '+919876543218',
        role: 'employee',
        password: 'Employee@123',
        department: deptMap['Support'],
        designation: 'Support Engineer',
        salary: 48000,
        address: 'Jersey City, NJ',
        status: 'Active'
      },
      {
        fullName: 'George Accountant',
        email: 'employee7@gmail.com',
        mobileNumber: '+919876543219',
        role: 'employee',
        password: 'Employee@123',
        department: deptMap['Accounts'],
        designation: 'Finance Associate',
        salary: 70000,
        address: 'Hoboken, NJ',
        status: 'Active'
      },
      {
        fullName: 'Hannah Dev',
        email: 'employee8@gmail.com',
        mobileNumber: '+919876543220',
        role: 'employee',
        password: 'Employee@123',
        department: deptMap['Developer'],
        designation: 'Fullstack Dev Intern',
        salary: 35000,
        address: 'Newark, NJ',
        status: 'Active'
      }
    ];

    for (const emp of employees) {
      await User.create(emp);
    }
    console.log('8 Employees seeded. All passwords are set to "Employee@123"');
    console.log('Database Seeding Completed Successfully.');
  } catch (error) {
    console.error('Seeding Error:', error);
  }
};

module.exports = seedData;
