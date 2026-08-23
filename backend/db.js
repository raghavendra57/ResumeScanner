const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB safely without crashing if database is unavailable
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_screener';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000 // 4s timeout for fast fallback
    });

    isConnected = true;
    console.log(`✔ MongoDB Connected successfully to: ${uri.replace(/\/\/.*@/, '//***@')}`);
  } catch (error) {
    isConnected = false;
    console.warn(`⚠ MongoDB connection failed: ${error.message}`);
    console.warn(`  Resume screening will continue in standalone mode without persisting candidate history.`);
  }
}

/**
 * Helper to check whether MongoDB is currently connected
 * @returns {boolean}
 */
function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  isDbConnected
};
