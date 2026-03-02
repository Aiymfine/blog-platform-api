const { body, param } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('parentId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('parentId must be a valid UUID'),
];

const updateCategoryValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('parentId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('parentId must be a valid UUID'),
];

module.exports = { createCategoryValidator, updateCategoryValidator };
