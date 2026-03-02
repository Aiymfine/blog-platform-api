const tagRepository = require('../repositories/tag.repository');
const { NotFoundError } = require('../utils/errors');

class TagService {
  async getAll() {
    return tagRepository.findAll();
  }

  async getById(id) {
    const tag = await tagRepository.findById(id);
    if (!tag) throw new NotFoundError('Tag');
    return tag;
  }

  async delete(id) {
    const tag = await tagRepository.findById(id);
    if (!tag) throw new NotFoundError('Tag');
    await tagRepository.delete(id);
    return { message: 'Tag deleted successfully' };
  }
}

module.exports = new TagService();
