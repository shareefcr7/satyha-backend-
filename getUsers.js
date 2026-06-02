const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user');

const MONGO_URI = process.env.MONGO_URI;

const getUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const users = await User.find({}).select('email role provider');
    console.log(users);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
getUsers();
