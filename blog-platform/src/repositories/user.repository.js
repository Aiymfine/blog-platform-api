const prisma = require('../utils/prisma');

class UserRepository {
  async create(data) {
    return prisma.user.create({ data });
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findAll({ skip = 0, take = 20 } = {}) {
    return prisma.user.findMany({
      skip,
      take,
      select: { id: true, email: true, role: true, postCount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data) {
    return prisma.user.update({ where: { id }, data });
  }

  async incrementPostCount(id, tx = prisma) {
    return tx.user.update({
      where: { id },
      data: { postCount: { increment: 1 } },
    });
  }

  async decrementPostCount(id, tx = prisma) {
    return tx.user.update({
      where: { id },
      data: { postCount: { decrement: 1 } },
    });
  }
}

module.exports = new UserRepository();
