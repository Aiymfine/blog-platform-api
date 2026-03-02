const router = require('express').Router();
const commentController = require('../controllers/comment.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { moderateCommentValidator } = require('../validators/comment.validator');

// Moderation queue (Admin/Author only)
router.get(
  '/pending',
  authenticate,
  authorize('ADMIN', 'AUTHOR'),
  commentController.getPending.bind(commentController)
);

// Moderate a comment (approve/reject)
router.patch(
  '/:id/moderate',
  authenticate,
  authorize('ADMIN', 'AUTHOR'),
  moderateCommentValidator,
  validate,
  commentController.moderate.bind(commentController)
);

// Soft delete
router.delete(
  '/:id',
  authenticate,
  commentController.delete.bind(commentController)
);

module.exports = router;
