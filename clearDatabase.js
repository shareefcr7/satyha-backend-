require('dotenv').config();
const mongoose = require('mongoose');
const chalk = require('chalk');

const keys = require('./config/keys');
const { database } = keys;

const clearDB = async () => {
  try {
    console.log(chalk.yellow('🔄 Connecting to MongoDB...'));
    await mongoose.connect(database.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(chalk.green('✓ MongoDB Connected!'));

    console.log(chalk.yellow('🗑️  Dropping all collections...'));
    await mongoose.connection.db.dropDatabase();
    console.log(chalk.green('✓ Database cleared successfully!'));

    console.log(chalk.blue('📊 Fresh database ready for new data'));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('❌ Error clearing database:'), error);
    process.exit(1);
  }
};

clearDB();
