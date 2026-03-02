const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { ConflictError, NotFoundError, BadRequestError } = require('../utils/errors');

class UserService {
  async register({ email, password, role }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ email, passwordHash, role });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new BadRequestError('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new BadRequestError('Invalid credentials');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async getAll(options) {
    return userRepository.findAll(options);
  }

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new UserService();
