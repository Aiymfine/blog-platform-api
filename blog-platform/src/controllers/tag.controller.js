const tagService = require('../services/tag.service');

class TagController {
  async getAll(req, res, next) {
    try {
      const tags = await tagService.getAll();
      res.json({ data: tags });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const tag = await tagService.getById(req.params.id);
      res.json({ data: tag });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await tagService.delete(req.params.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TagController();
