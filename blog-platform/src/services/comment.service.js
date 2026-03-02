const commentRepository = require('../repositories/comment.repository');
const postRepository = require('../repositories/post.repository');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');

class CommentService {
  async create({ postId, content, parentId }, userId) {
    // Verify post exists and is published
    const post = await postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post');
    if (post.status !== 'PUBLISHED') {
      throw new BadRequestError('Cannot comment on unpublished posts');
    }

    // Validate parent comment exists if provided
    if (parentId) {
      const parent = await commentRepository.findById(parentId);
      if (!parent) throw new NotFoundError('Parent comment');
      if (parent.postId !== postId) {
        throw new BadRequestError('Parent comment does not belong to this post');
      }
    }

    return commentRepository.create({
      postId,
      userId,
      content,
      parentId: parentId || null,
      status: 'PENDING',
    });
  }

  async getByPost(postId, options) {
    const post = await postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post');
    return commentRepository.findByPost(postId, options);
  }

  async getPending(options) {
    return commentRepository.findPending(options);
  }

  async moderate(commentId, status, moderatorRole) {
    if (!['ADMIN', 'AUTHOR'].includes(moderatorRole)) {
      throw new ForbiddenError('Only admins and authors can moderate comments');
    }

    const comment = await commentRepository.findById(commentId);
    if (!comment) throw new NotFoundError('Comment');
    if (comment.status !== 'PENDING') {
      throw new BadRequestError(`Comment is already ${comment.status.toLowerCase()}`);
    }

    return commentRepository.updateStatus(commentId, status);
  }

  async delete(commentId, requesterId, requesterRole) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) throw new NotFoundError('Comment');

    if (comment.userId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await commentRepository.softDelete(commentId);
    return { message: 'Comment deleted successfully' };
  }
}

module.exports = new CommentService();
