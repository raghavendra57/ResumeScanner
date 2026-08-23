const app = require('../backend/app');
const { connectDB } = require('../backend/db');

// Ensure DB connection is initiated for serverless invocations
connectDB().catch(err => {
  console.warn('Database connection error in serverless handler:', err.message);
});

module.exports = app;
