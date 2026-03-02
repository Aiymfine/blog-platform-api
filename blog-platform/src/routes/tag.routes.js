const router = require('express').Router();
const tagController = require('../controllers/tag.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public
router.get('/', tagController.getAll.bind(tagController));
router.get('/:id', tagController.getById.bind(tagController));

// Admin only
router.delete('/:id', authenticate, authorize('ADMIN'), tagController.delete.bind(tagController));

module.exports = router;
