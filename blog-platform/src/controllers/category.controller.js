const categoryService = require('../services/category.service');

class CategoryController {
  async create(req, res, next) {
    try {
      const category = await categoryService.create(req.body);
      res.status(201).json({ data: category });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAll();
      res.json({ data: categories });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const category = await categoryService.getById(req.params.id);
      res.json({ data: category });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      res.json({ data: category });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await categoryService.delete(req.params.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
