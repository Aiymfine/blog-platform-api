require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminHash = await bcrypt.hash('admin1234', 12);
  const authorHash = await bcrypt.hash('author1234', 12);
  const readerHash = await bcrypt.hash('reader1234', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@blog.com' },
    update: {},
    create: { email: 'admin@blog.com', passwordHash: adminHash, role: 'ADMIN' },
  });

  const author = await prisma.user.upsert({
    where: { email: 'author@blog.com' },
    update: {},
    create: { email: 'author@blog.com', passwordHash: authorHash, role: 'AUTHOR' },
  });

  const reader = await prisma.user.upsert({
    where: { email: 'reader@blog.com' },
    update: {},
    create: { email: 'reader@blog.com', passwordHash: readerHash, role: 'READER' },
  });

  // Create categories
  const techCategory = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: { name: 'Technology', slug: 'technology' },
  });

  const webDevCategory = await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: { name: 'Web Development', slug: 'web-development', parentId: techCategory.id },
  });

  // Create tags
  const jsTag = await prisma.tag.upsert({
    where: { name: 'javascript' },
    update: {},
    create: { name: 'javascript' },
  });

  const nodeTag = await prisma.tag.upsert({
    where: { name: 'nodejs' },
    update: {},
    create: { name: 'nodejs' },
  });

  // Create a post
  const post = await prisma.post.upsert({
    where: { slug: 'getting-started-with-nodejs' },
    update: {},
    create: {
      title: 'Getting Started with Node.js',
      slug: 'getting-started-with-nodejs',
      content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. This guide covers the basics of building server-side applications with Node.js.',
      status: 'PUBLISHED',
      authorId: author.id,
      categoryId: webDevCategory.id,
      publishedAt: new Date(),
      tags: {
        create: [
          { tag: { connect: { id: jsTag.id } } },
          { tag: { connect: { id: nodeTag.id } } },
        ],
      },
    },
  });

  // Update author post_count
  await prisma.user.update({
    where: { id: author.id },
    data: { postCount: 1 },
  });

  // Create an approved comment
  const comment = await prisma.comment.create({
    data: {
      postId: post.id,
      userId: reader.id,
      content: 'Great introduction! Very helpful for beginners.',
      status: 'APPROVED',
    },
  });

  // Create a reply
  await prisma.comment.create({
    data: {
      postId: post.id,
      userId: author.id,
      content: 'Thank you! Glad you found it helpful.',
      status: 'APPROVED',
      parentId: comment.id,
    },
  });

  console.log('✅ Seed complete!');
  console.log('  Admin:  admin@blog.com / admin1234');
  console.log('  Author: author@blog.com / author1234');
  console.log('  Reader: reader@blog.com / reader1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
