const { body } = require('express-validator');

const createCommentValidator = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Comment content must be between 1 and 5000 characters'),
  body('parentId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('parentId must be a valid UUID'),
];

const moderateCommentValidator = [
  body('status')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage('Status must be APPROVED or REJECTED'),
];

module.exports = { createCommentValidator, moderateCommentValidator };
