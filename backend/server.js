const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { connectDB } = require('./db');

const PORT = process.env.PORT || 5000;

// Initialize Database connection (non-blocking)
connectDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===========================================`);
  console.log(`  Smart Resume Screener Backend running    `);
  console.log(`  Port: http://127.0.0.1:${PORT}           `);
  console.log(`  Health Check: http://127.0.0.1:${PORT}/api/health`);
  console.log(`  Gemini API Key Configured: ${Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() && process.env.GEMINI_API_KEY !== 'your_api_key_here')}`);
  console.log(`===========================================`);
});

