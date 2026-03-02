const prisma = require('../utils/prisma');

class PostRepository {
  /**
   * Create a post (used inside transactions - accepts tx client)
   */
  async create(data, tx = prisma) {
    return tx.post.create({ data });
  }

  async findById(id) {
    return prisma.post.findUnique({ where: { id } });
  }

  /**
   * GET /posts/:slug - Full post with author, category hierarchy,
   * tags, threaded approved comments, and comment count.
   * Single query using include (no N+1).
   */
  async findBySlugFull(slug) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, email: true, role: true, postCount: true, createdAt: true },
        },
        category: {
          include: {
            parent: {
              include: {
                parent: true, // support up to 3 levels deep
              },
            },
          },
        },
        tags: {
          include: { tag: true },
        },
        comments: {
          where: {
            status: 'APPROVED',
            deletedAt: null,
            parentId: null, // top-level only; replies fetched via replies relation
          },
          include: {
            user: { select: { id: true, email: true, role: true } },
            replies: {
              where: { status: 'APPROVED', deletedAt: null },
              include: {
                user: { select: { id: true, email: true, role: true } },
                replies: {
                  where: { status: 'APPROVED', deletedAt: null },
                  include: {
                    user: { select: { id: true, email: true, role: true } },
                  },
                  orderBy: { createdAt: 'asc' },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            comments: { where: { status: 'APPROVED', deletedAt: null } },
          },
        },
      },
    });
    return post;
  }

  async findAll({ skip = 0, take = 20, status, authorId, categoryId } = {}) {
    const where = {};
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    if (categoryId) where.categoryId = categoryId;

    return prisma.post.findMany({
      where,
      skip,
      take,
      include: {
        author: { select: { id: true, email: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: { where: { status: 'APPROVED', deletedAt: null } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.post.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.post.delete({ where: { id } });
  }

  async incrementViewCount(id) {
    return prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  /**
   * Upsert tags (create if not exist) and link to post.
   * Runs inside a transaction.
   */
  async syncTags(postId, tagNames, tx = prisma) {
    // Delete existing tag links
    await tx.postTag.deleteMany({ where: { postId } });

    if (!tagNames || tagNames.length === 0) return;

    // Upsert each tag and collect IDs
    const tagIds = await Promise.all(
      tagNames.map(async (name) => {
        const tag = await tx.tag.upsert({
          where: { name: name.toLowerCase().trim() },
          update: {},
          create: { name: name.toLowerCase().trim() },
        });
        return tag.id;
      })
    );

    // Create post_tags links
    await tx.postTag.createMany({
      data: tagIds.map((tagId) => ({ postId, tagId })),
      skipDuplicates: true,
    });
  }
}

module.exports = new PostRepository();
