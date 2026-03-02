const userService = require('../services/user.service');

class UserController {
  async register(req, res, next) {
    try {
      const user = await userService.register(req.body);
      res.status(201).json({ data: user });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await userService.login(req.body);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const users = await userService.getAll({ skip, take: parseInt(limit) });
      res.json({ data: users });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await userService.getById(req.user.id);
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
