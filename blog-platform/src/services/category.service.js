const categoryRepository = require('../repositories/category.repository');
const { generateUniqueSlug } = require('../utils/slug');
const { NotFoundError, BadRequestError } = require('../utils/errors');

class CategoryService {
  async create({ name, parentId }) {
    // Validate parent exists
    if (parentId) {
      const parent = await categoryRepository.findById(parentId);
      if (!parent) throw new NotFoundError('Parent category');
    }

    const slug = await generateUniqueSlug(name, 'category');
    return categoryRepository.create({ name, slug, parentId: parentId || null });
  }

  async getAll() {
    return categoryRepository.findAll();
  }

  async getById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async update(id, { name, parentId }) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category');

    // Prevent self-reference
    if (parentId && parentId === id) {
      throw new BadRequestError('Category cannot be its own parent');
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = await generateUniqueSlug(name, 'category', id);
    }
    if (parentId !== undefined) {
      updateData.parentId = parentId;
    }

    return categoryRepository.update(id, updateData);
  }

  async delete(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category');
    await categoryRepository.delete(id);
    return { message: 'Category deleted successfully' };
  }
}

module.exports = new CategoryService();
