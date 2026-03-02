const { body } = require('express-validator');

const createPostValidator = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('categoryId must be a valid UUID'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be a non-empty string (max 50 chars)'),
];

const updatePostValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
  body('categoryId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('categoryId must be a valid UUID'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('tags must be an array'),
];

module.exports = { createPostValidator, updatePostValidator };
