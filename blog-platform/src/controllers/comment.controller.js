const commentService = require('../services/comment.service');

class CommentController {
  async create(req, res, next) {
    try {
      const comment = await commentService.create(
        { postId: req.params.postId, ...req.body },
        req.user.id
      );
      res.status(201).json({ data: comment });
    } catch (err) {
      next(err);
    }
  }

  async getByPost(req, res, next) {
    try {
      const { page = 1, limit = 50, status } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const comments = await commentService.getByPost(req.params.postId, {
        skip,
        take: parseInt(limit),
        status,
      });
      res.json({ data: comments });
    } catch (err) {
      next(err);
    }
  }

  async getPending(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const comments = await commentService.getPending({ skip, take: parseInt(limit) });
      res.json({ data: comments });
    } catch (err) {
      next(err);
    }
  }

  async moderate(req, res, next) {
    try {
      const comment = await commentService.moderate(
        req.params.id,
        req.body.status,
        req.user.role
      );
      res.json({ data: comment });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await commentService.delete(req.params.id, req.user.id, req.user.role);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CommentController();
