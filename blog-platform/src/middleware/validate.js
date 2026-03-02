const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join('; ');
    return res.status(422).json({
      error: messages,
      code: 'VALIDATION_ERROR',
    });
  }
  next();
}

module.exports = { validate };
