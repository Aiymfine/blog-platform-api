-- Migration 3: Add view_count column to posts with default 0

ALTER TABLE "posts"
    ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;
