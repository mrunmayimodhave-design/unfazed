const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getSharedNotesForClient,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

// Client portal safe route: strictly returns ONLY shared notes
router.get('/shared/client/:clientId', getSharedNotesForClient);

// Therapist clinical note routes (protected - includes private notes)
router.get('/', protect, getNotes);
router.post('/', protect, createNote);
router.get('/:id', protect, getNoteById);
router.put('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);

module.exports = router;
