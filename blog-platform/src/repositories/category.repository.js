const prisma = require('../utils/prisma');

class CategoryRepository {
  async create(data) {
    return prisma.category.create({ data });
  }

  async findById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findBySlug(slug) {
    return prisma.category.findUnique({ where: { slug } });
  }

  async findAll() {
    return prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: { select: { posts: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id, data) {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.category.delete({ where: { id } });
  }
}

module.exports = new CategoryRepository();
