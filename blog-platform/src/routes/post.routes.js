const router = require('express').Router();
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createPostValidator, updatePostValidator } = require('../validators/post.validator');
const { createCommentValidator } = require('../validators/comment.validator');

// Public
router.get('/', postController.getAll.bind(postController));
router.get('/:slug', postController.getBySlug.bind(postController));

// Comments on a post (public read)
router.get('/:postId/comments', commentController.getByPost.bind(commentController));

// Protected
router.post(
  '/',
  authenticate,
  authorize('AUTHOR', 'ADMIN'),
  createPostValidator,
  validate,
  postController.create.bind(postController)
);

router.put(
  '/:id',
  authenticate,
  authorize('AUTHOR', 'ADMIN'),
  updatePostValidator,
  validate,
  postController.update.bind(postController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('AUTHOR', 'ADMIN'),
  postController.delete.bind(postController)
);

// Create a comment on a post
router.post(
  '/:postId/comments',
  authenticate,
  createCommentValidator,
  validate,
  commentController.create.bind(commentController)
);

module.exports = router;
