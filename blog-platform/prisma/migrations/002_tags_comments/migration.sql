-- Migration 2: Add tags, post_tags junction, comments table

-- CreateTable: tags
CREATE TABLE "tags" (
    "id"   UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateTable: post_tags (junction with composite PK)
CREATE TABLE "post_tags" (
    "post_id" UUID NOT NULL,
    "tag_id"  UUID NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("post_id", "tag_id"),
    CONSTRAINT "post_tags_post_fk" FOREIGN KEY ("post_id")
        REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_tags_tag_fk" FOREIGN KEY ("tag_id")
        REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: comments (with threading + soft delete)
CREATE TABLE "comments" (
    "id"         UUID            NOT NULL DEFAULT gen_random_uuid(),
    "post_id"    UUID            NOT NULL,
    "user_id"    UUID            NOT NULL,
    "content"    TEXT            NOT NULL,
    "status"     "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "parent_id"  UUID            NULL,
    "created_at" TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ     NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "comments_no_self_ref" CHECK ("parent_id" <> "id"),
    CONSTRAINT "comments_post_fk" FOREIGN KEY ("post_id")
        REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_user_fk" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_parent_fk" FOREIGN KEY ("parent_id")
        REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Partial UNIQUE index: one user cannot have multiple PENDING comments on same post (spam prevention)
CREATE UNIQUE INDEX "comments_one_pending_per_user_post"
    ON "comments"("post_id", "user_id")
    WHERE (status = 'PENDING' AND deleted_at IS NULL);
