const prisma = require('../utils/prisma');
const postRepository = require('../repositories/post.repository');
const userRepository = require('../repositories/user.repository');
const { generateUniqueSlug } = require('../utils/slug');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');

class PostService {
  /**
   * Create/Publish a post - ATOMIC TRANSACTION:
   * 1. Verify author exists and is active
   * 2. Insert post record
   * 3. Link tags (upsert)
   * 4. Update author's post_count cache
   * Rollback entire operation if any step fails.
   */
  async create({ title, content, status = 'DRAFT', categoryId, tags = [] }, authorId) {
    // Step 1: Verify author exists
    const author = await userRepository.findById(authorId);
    if (!author) throw new NotFoundError('Author');
    if (!['AUTHOR', 'ADMIN'].includes(author.role)) {
      throw new ForbiddenError('Only AUTHORS and ADMINs can create posts');
    }

    const slug = await generateUniqueSlug(title, 'post');

    const publishedAt = status === 'PUBLISHED' ? new Date() : null;

    // Atomic transaction
    const post = await prisma.$transaction(async (tx) => {
      // Step 2: Create post
      const newPost = await tx.post.create({
        data: {
          title,
          slug,
          content,
          status,
          authorId,
          categoryId: categoryId || null,
          publishedAt,
        },
      });

      // Step 3: Link tags (upsert new tags)
      if (tags.length > 0) {
        await postRepository.syncTags(newPost.id, tags, tx);
      }

      // Step 4: Update author post_count cache
      await tx.user.update({
        where: { id: authorId },
        data: { postCount: { increment: 1 } },
      });

      return newPost;
    });

    return this.getById(post.id);
  }

  async getAll(options) {
    const posts = await postRepository.findAll(options);
    return posts.map(this._formatPost);
  }

  async getBySlug(slug) {
    const post = await postRepository.findBySlugFull(slug);
    if (!post) throw new NotFoundError('Post');

    // Increment view count (fire and forget)
    postRepository.incrementViewCount(post.id).catch(() => {});

    return this._formatFullPost(post);
  }

  async getById(id) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, email: true } },
        tags: { include: { tag: true } },
      },
    });
    if (!post) throw new NotFoundError('Post');
    return this._formatPost(post);
  }

  async update(id, data, requesterId, requesterRole) {
    const post = await postRepository.findById(id);
    if (!post) throw new NotFoundError('Post');

    // Only author or admin can update
    if (post.authorId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('You can only edit your own posts');
    }

    const updateData = { ...data };

    // Regenerate slug if title changed
    if (data.title) {
      updateData.slug = await generateUniqueSlug(data.title, 'post', id);
    }

    // Set publishedAt when publishing
    if (data.status === 'PUBLISHED' && !post.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const tags = data.tags;
    delete updateData.tags;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedPost = await tx.post.update({ where: { id }, data: updateData });
      if (tags !== undefined) {
        await postRepository.syncTags(id, tags, tx);
      }
      return updatedPost;
    });

    return this.getById(updated.id);
  }

  async delete(id, requesterId, requesterRole) {
    const post = await postRepository.findById(id);
    if (!post) throw new NotFoundError('Post');

    if (post.authorId !== requesterId && requesterRole !== 'ADMIN') {
      throw new ForbiddenError('You can only delete your own posts');
    }

    await prisma.$transaction(async (tx) => {
      await tx.post.delete({ where: { id } });
      await tx.user.update({
        where: { id: post.authorId },
        data: { postCount: { decrement: 1 } },
      });
    });

    return { message: 'Post deleted successfully' };
  }

  _formatPost(post) {
    return {
      ...post,
      tags: post.tags?.map((pt) => pt.tag) || [],
      commentCount: post._count?.comments ?? undefined,
      _count: undefined,
    };
  }

  _formatFullPost(post) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      status: post.status,
      viewCount: post.viewCount,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      author: post.author,
      category: post.category ? this._buildCategoryHierarchy(post.category) : null,
      tags: post.tags.map((pt) => pt.tag),
      commentCount: post._count.comments,
      comments: post.comments,
    };
  }

  _buildCategoryHierarchy(category) {
    // Returns flat breadcrumb: [grandparent, parent, child]
    const hierarchy = [];
    let current = category;
    while (current) {
      hierarchy.unshift({ id: current.id, name: current.name, slug: current.slug });
      current = current.parent;
    }
    return hierarchy;
  }
}

module.exports = new PostService();
