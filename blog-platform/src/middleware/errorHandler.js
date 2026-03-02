const { Prisma } = require('@prisma/client');
const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  // Known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  // Prisma-specific errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const fields = err.meta?.target?.join(', ') || 'field';
        return res.status(409).json({
          error: `A record with this ${fields} already exists`,
          code: 'CONFLICT',
        });
      }
      case 'P2003':
        return res.status(400).json({
          error: 'Related record not found (foreign key constraint)',
          code: 'FOREIGN_KEY_VIOLATION',
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Record not found',
          code: 'NOT_FOUND',
        });
      case 'P2014':
        return res.status(400).json({
          error: 'The operation would violate a required relation',
          code: 'RELATION_VIOLATION',
        });
      default:
        return res.status(400).json({
          error: `Database error: ${err.message}`,
          code: `DB_ERROR_${err.code}`,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(422).json({
      error: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
    });
  }

  // Express validation errors (express-validator)
  if (err.type === 'validation') {
    return res.status(422).json({
      error: err.message,
      code: 'VALIDATION_ERROR',
    });
  }

  // Fallback for unexpected errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  });
}

module.exports = { errorHandler };
