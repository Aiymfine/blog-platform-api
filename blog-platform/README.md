# Blog Platform API

A multi-author blog platform API built with **Express.js**, **Prisma ORM**, and **PostgreSQL**.

## Architecture

```
src/
├── app.js                    # Entry point, Express setup
├── routes/                   # Route definitions (thin layer)
│   ├── user.routes.js
│   ├── post.routes.js
│   ├── category.routes.js
│   ├── tag.routes.js
│   └── comment.routes.js
├── controllers/              # HTTP request/response handling only
│   ├── user.controller.js
│   ├── post.controller.js
│   ├── category.controller.js
│   ├── tag.controller.js
│   └── comment.controller.js
├── services/                 # Business logic layer
│   ├── user.service.js
│   ├── post.service.js
│   ├── category.service.js
│   ├── tag.service.js
│   └── comment.service.js
├── repositories/             # Data access layer (all DB queries)
│   ├── user.repository.js
│   ├── post.repository.js
│   ├── category.repository.js
│   ├── tag.repository.js
│   └── comment.repository.js
├── middleware/
│   ├── auth.js               # JWT authentication + authorization
│   ├── errorHandler.js       # Global error handler
│   ├── notFoundHandler.js
│   └── validate.js           # express-validator result handler
├── validators/               # Request validation rules
│   ├── user.validator.js
│   ├── post.validator.js
│   ├── category.validator.js
│   └── comment.validator.js
└── utils/
    ├── prisma.js             # Prisma client singleton
    ├── slug.js               # Unique slug generator
    └── errors.js             # Custom error classes
prisma/
├── schema.prisma             # Data model
├── seed.js                   # Database seeder
└── migrations/
    ├── 001_initial_schema/migration.sql  # users, posts, categories
    ├── 002_tags_comments/migration.sql   # tags, post_tags, comments
    └── 003_view_count/migration.sql      # view_count on posts
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Run migrations (run each SQL file in order against your DB)
psql $DATABASE_URL -f prisma/migrations/001_initial_schema/migration.sql
psql $DATABASE_URL -f prisma/migrations/002_tags_comments/migration.sql
psql $DATABASE_URL -f prisma/migrations/003_view_count/migration.sql

# 4. Generate Prisma client
npm run db:generate

# 5. Seed database
npm run db:seed

# 6. Start server
npm run dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | None | Register new user |
| POST | `/api/users/login` | None | Login, returns JWT |
| GET | `/api/users/me` | Bearer | Get current user |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | None | List posts (paginated) |
| GET | `/api/posts/:slug` | None | **Full post** with author, category hierarchy, tags, threaded comments |
| POST | `/api/posts` | AUTHOR/ADMIN | Create post (atomic transaction) |
| PUT | `/api/posts/:id` | AUTHOR/ADMIN | Update post |
| DELETE | `/api/posts/:id` | AUTHOR/ADMIN | Delete post |

Query params for `GET /api/posts`: `page`, `limit`, `status`, `authorId`, `categoryId`

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | None | List all categories with hierarchy |
| GET | `/api/categories/:id` | None | Get category by ID |
| POST | `/api/categories` | ADMIN | Create category |
| PUT | `/api/categories/:id` | ADMIN | Update category |
| DELETE | `/api/categories/:id` | ADMIN | Delete category |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts/:postId/comments` | None | Get approved comments for a post |
| POST | `/api/posts/:postId/comments` | Any Auth | Create comment (starts PENDING) |
| GET | `/api/comments/pending` | ADMIN/AUTHOR | Moderation queue |
| PATCH | `/api/comments/:id/moderate` | ADMIN/AUTHOR | Approve or reject comment |
| DELETE | `/api/comments/:id` | Owner/ADMIN | Soft delete comment |

### Tags
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tags` | None | List all tags |
| GET | `/api/tags/:id` | None | Get tag by ID |
| DELETE | `/api/tags/:id` | ADMIN | Delete tag |

## Error Response Format

All errors follow the consistent structure:
```json
{
  "error": "Human readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

HTTP Status codes used: `400`, `401`, `403`, `404`, `409`, `422`, `500`

## Key Design Decisions

### Atomic Publish Transaction
`POST /api/posts` executes as a single `prisma.$transaction`:
1. Verify author role
2. Insert post record with generated unique slug
3. Upsert tags (create new ones if they don't exist) + create `post_tags` links
4. Increment author's `post_count` cache
If any step fails, the entire operation rolls back.

### N+1 Prevention
`GET /posts/:slug` uses a single Prisma query with nested `include` for: author profile, full category hierarchy (up to 3 levels), all tags, threaded approved comments (2 levels of replies), and comment count.

### Database-Level Constraints
- `CHECK (status <> 'PUBLISHED' OR published_at IS NOT NULL)` — enforces published_at presence
- `CHECK (parent_id <> id)` — prevents self-referencing comments
- Partial UNIQUE index on `comments(post_id, user_id) WHERE status = 'PENDING' AND deleted_at IS NULL` — prevents comment spam
- `ON DELETE CASCADE` for comments when post deleted
- `ON DELETE RESTRICT` for posts when author deleted
- `ON DELETE SET NULL` for child categories when parent deleted

## Test Credentials (after seeding)
- **Admin**: admin@blog.com / admin1234
- **Author**: author@blog.com / author1234
- **Reader**: reader@blog.com / reader1234
