const postService = require('../services/post.service');

class PostController {
  async create(req, res, next) {
    try {
      const post = await postService.create(req.body, req.user.id);
      res.status(201).json({ data: post });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, status, authorId, categoryId } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const posts = await postService.getAll({ skip, take: parseInt(limit), status, authorId, categoryId });
      res.json({ data: posts });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const post = await postService.getBySlug(req.params.slug);
      res.json({ data: post });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const post = await postService.update(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role
      );
      res.json({ data: post });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await postService.delete(req.params.id, req.user.id, req.user.role);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PostController();
