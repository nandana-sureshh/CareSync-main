const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Doctor] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Doctor] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
