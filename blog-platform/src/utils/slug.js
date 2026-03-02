const slugify = require('slugify');
const prisma = require('./prisma');

/**
 * Generate a URL-safe slug from text, ensuring uniqueness against a model.
 * @param {string} text - Source text
 * @param {string} model - Prisma model name ('post' | 'category')
 * @param {string} [excludeId] - Exclude current record when updating
 */
async function generateUniqueSlug(text, model, excludeId = null) {
  const base = slugify(text, { lower: true, strict: true, trim: true });
  let slug = base;
  let counter = 1;

  while (true) {
    const where = { slug };
    if (excludeId) where.id = { not: excludeId };

    const existing = await prisma[model].findFirst({ where });
    if (!existing) break;

    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = { generateUniqueSlug };
