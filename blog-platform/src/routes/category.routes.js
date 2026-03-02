const router = require('express').Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCategoryValidator, updateCategoryValidator } = require('../validators/category.validator');

// Public
router.get('/', categoryController.getAll.bind(categoryController));
router.get('/:id', categoryController.getById.bind(categoryController));

// Protected (Admin only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createCategoryValidator,
  validate,
  categoryController.create.bind(categoryController)
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  updateCategoryValidator,
  validate,
  categoryController.update.bind(categoryController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  categoryController.delete.bind(categoryController)
);

module.exports = router;
