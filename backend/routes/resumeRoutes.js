const express = require('express');
const router = express.Router();
const { handleResumeUpload } = require('../middleware/uploadMiddleware');
const { analyzeResume } = require('../controllers/resumeController');

// POST /api/analyze
router.post('/analyze', handleResumeUpload, analyzeResume);

// GET /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0 && process.env.GEMINI_API_KEY !== 'your_api_key_here')
  });
});

module.exports = router;
