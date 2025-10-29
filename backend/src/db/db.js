const mongoose = require('mongoose');
const {DB_NAME} = require('../constants');
const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log(`MongoDB connected at ${process.env.MONGO_URI}/${DB_NAME}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};
module.exports = connectDB;