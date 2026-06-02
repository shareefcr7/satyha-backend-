const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user');
const { ROLES } = require('./constants');

const MONGO_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const adminEmail = 'clearglass@gmail.com';
    const adminPassword = 'clearglass123';

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(adminPassword, salt);

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists — resetting password and ensuring Admin role...');
      await User.updateOne(
        { email: adminEmail },
        { $set: { role: ROLES.Admin, password: hash } }
      );
      console.log('✅ Admin updated successfully.');
      console.log('Email:    ' + adminEmail);
      console.log('Password: ' + adminPassword);
      process.exit(0);
    }

    const adminUser = new User({
      email: adminEmail,
      password: adminPassword, // pre-save hook will hash this
      firstName: 'ClearGlass',
      lastName: 'Admin',
      role: ROLES.Admin
    });

    await adminUser.save();

    console.log('✅ Admin created successfully.');
    console.log('Email:    ' + adminEmail);
    console.log('Password: ' + adminPassword);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

seedAdmin();
