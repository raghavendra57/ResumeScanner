const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const { isDbConnected } = require('../db');

/**
 * GET /api/candidates
 * Retrieve candidate history sorted by newest first
 */
async function getCandidates(req, res) {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        dbConnected: false,
        message: 'Database storage is currently unavailable.'
      });
    }

    const query = {};
    if (req.query.shortlisted === 'true') {
      query.shortlisted = true;
    }

    const candidates = await Candidate.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
      dbConnected: true
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve candidate history.'
    });
  }
}

/**
 * GET /api/candidates/:id
 * Retrieve single candidate details by ID
 */
async function getCandidateById(req, res) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        error: 'Database storage is currently unavailable.'
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid candidate ID format.'
      });
    }

    const candidate = await Candidate.findById(id).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Error fetching candidate by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve candidate details.'
    });
  }
}

/**
 * PATCH /api/candidates/:id/shortlist
 * Update candidate shortlist status
 */
async function updateShortlistStatus(req, res) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        error: 'Database storage is currently unavailable.'
      });
    }

    const { id } = req.params;
    const { shortlisted } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid candidate ID format.'
      });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { shortlisted: Boolean(shortlisted) },
      { returnDocument: 'after' }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Error updating shortlist status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update candidate shortlist status.'
    });
  }
}

/**
 * DELETE /api/candidates/:id
 * Delete candidate by ID
 */
async function deleteCandidate(req, res) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        error: 'Database storage is currently unavailable.'
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid candidate ID format.'
      });
    }

    const deleted = await Candidate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Candidate record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete candidate.'
    });
  }
}

module.exports = {
  getCandidates,
  getCandidateById,
  updateShortlistStatus,
  deleteCandidate
};
