const prisma = require('../utils/prisma');

class TagRepository {
  async findAll() {
    return prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id) {
    return prisma.tag.findUnique({ where: { id } });
  }

  async findByName(name) {
    return prisma.tag.findUnique({ where: { name } });
  }

  async delete(id) {
    return prisma.tag.delete({ where: { id } });
  }
}

module.exports = new TagRepository();
