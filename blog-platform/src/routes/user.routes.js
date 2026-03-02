const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/user.validator');

// Public
router.post('/register', registerValidator, validate, userController.register.bind(userController));
router.post('/login', loginValidator, validate, userController.login.bind(userController));

// Protected
router.get('/me', authenticate, userController.getMe.bind(userController));
router.get('/', authenticate, authorize('ADMIN'), userController.getAll.bind(userController));
router.get('/:id', authenticate, userController.getById.bind(userController));

module.exports = router;
