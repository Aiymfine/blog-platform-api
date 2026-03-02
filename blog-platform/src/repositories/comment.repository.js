const prisma = require('../utils/prisma');

class CommentRepository {
  async create(data) {
    return prisma.comment.create({
      data,
      include: {
        user: { select: { id: true, email: true } },
      },
    });
  }

  async findById(id) {
    return prisma.comment.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, email: true } },
        post: { select: { id: true, slug: true, title: true } },
      },
    });
  }

  async findByPost(postId, { skip = 0, take = 50, status } = {}) {
    const where = { postId, deletedAt: null, parentId: null };
    if (status) where.status = status;

    return prisma.comment.findMany({
      where,
      skip,
      take,
      include: {
        user: { select: { id: true, email: true } },
        replies: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findPending({ skip = 0, take = 20 } = {}) {
    return prisma.comment.findMany({
      where: { status: 'PENDING', deletedAt: null },
      skip,
      take,
      include: {
        user: { select: { id: true, email: true } },
        post: { select: { id: true, slug: true, title: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateStatus(id, status) {
    return prisma.comment.update({
      where: { id },
      data: { status },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async softDelete(id) {
    return prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = new CommentRepository();
