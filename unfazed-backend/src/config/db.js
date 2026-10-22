const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using MONGO_URI from environment variables.
 * Does not fall back to in-memory database.
 * Does not expose credentials in console logs.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.trim() === '') {
    const errorMsg = 'MONGO_URI is not defined in backend .env file. Please configure a valid MongoDB Atlas connection string.';
    console.error(`❌ Database Configuration Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB Atlas connection error: ${err.message}`);
    throw err;
  }
};

module.exports = { connectDB };
