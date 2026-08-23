const express = require('express');
const router = express.Router();
const {
  getCandidates,
  getCandidateById,
  updateShortlistStatus,
  deleteCandidate
} = require('../controllers/candidateController');

// GET /api/candidates
router.get('/', getCandidates);

// GET /api/candidates/:id
router.get('/:id', getCandidateById);

// PATCH /api/candidates/:id/shortlist
router.patch('/:id/shortlist', updateShortlistStatus);

// DELETE /api/candidates/:id
router.delete('/:id', deleteCandidate);

module.exports = router;
