const multer = require('multer');
const path = require('path');

// Configure in-memory storage for security and zero disk clutter
const storage = multer.memoryStorage();

// Validate file type (PDF only)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ext === '.pdf' && (mime === 'application/pdf' || mime === 'application/x-pdf')) {
    cb(null, true);
  } else {
    const errorMsg =
      file.fieldname === 'jobDescriptionFile'
        ? 'Only PDF job descriptions are supported.'
        : 'Only PDF resumes are supported.';
    const error = new Error(errorMsg);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// 5 MB maximum file size limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 }
]);

/**
 * Express middleware wrapper to handle multer errors cleanly
 */
function handleResumeUpload(req, res, next) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const errorMsg =
          err.field === 'jobDescriptionFile'
            ? 'Job Description PDF must be smaller than 5 MB.'
            : 'Resume must be smaller than 5 MB.';
        return res.status(400).json({
          success: false,
          error: errorMsg
        });
      }
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Only PDF files are supported.'
      });
    }
    next();
  });
}

module.exports = {
  handleResumeUpload
};
