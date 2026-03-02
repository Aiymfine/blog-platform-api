-- Migration 1: Initial schema (users, posts, categories with self-ref)
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AUTHOR', 'READER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable: users
CREATE TABLE "users" (
    "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
    "email"         TEXT         NOT NULL,
    "password_hash" TEXT         NOT NULL,
    "role"          "UserRole"   NOT NULL DEFAULT 'READER',
    "post_count"    INTEGER      NOT NULL DEFAULT 0,
    "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_check" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- CreateIndex: unique email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable: categories (with self-referential FK)
CREATE TABLE "categories" (
    "id"        UUID  NOT NULL DEFAULT gen_random_uuid(),
    "name"      TEXT  NOT NULL,
    "slug"      TEXT  NOT NULL,
    "parent_id" UUID  NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categories_no_self_ref" CHECK ("parent_id" IS NULL OR "parent_id" <> "id"),
    CONSTRAINT "categories_parent_fk" FOREIGN KEY ("parent_id")
        REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex: unique slug for categories
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateTable: posts
CREATE TABLE "posts" (
    "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
    "title"        TEXT         NOT NULL,
    "slug"         TEXT         NOT NULL,
    "content"      TEXT         NOT NULL,
    "status"       "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "author_id"    UUID         NOT NULL,
    "category_id"  UUID         NULL,
    "published_at" TIMESTAMPTZ  NULL,
    "created_at"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "posts_published_at_check"
        CHECK (status <> 'PUBLISHED' OR "published_at" IS NOT NULL),
    CONSTRAINT "posts_author_fk" FOREIGN KEY ("author_id")
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "posts_category_fk" FOREIGN KEY ("category_id")
        REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex: unique slug for posts
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
