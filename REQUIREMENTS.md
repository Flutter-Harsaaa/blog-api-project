# 📋 Requirement Analysis Document
**Blog API — Production-Grade RESTful Backend**

---

## 1. Project Overview

The **Blog API** is a backend service designed to support a modern blogging platform. It provides secure, scalable, and performant RESTful APIs for managing users, blog posts, and comments.

The system is designed with:
- **Clean architecture** - Separation of layers (controllers, services, routes)
- **Separation of concerns** - Each module has a single responsibility
- **Security best practices** - JWT authentication, bcrypt hashing, input validation
- **Performance optimizations** - Redis caching, pagination, query optimization
- **Production-readiness** - Logging, error handling, graceful shutdown, testing

---

## 2. Objectives

- ✅ Build a RESTful backend API for blog management
- ✅ Support user authentication and authorization
- ✅ Enable CRUD operations for posts and comments
- ✅ Ensure data integrity and ownership-based access
- ✅ Optimize performance using Redis caching
- ✅ Provide developer-friendly documentation and testing

---

## 3. Functional Requirements

### 3.1 User Management

#### User Registration
- Users must be able to register using:
  - **Name** (required)
  - **Email** (required, unique)
  - **Password** (required, min 6 characters)
- Email must be **unique** across the system
- Password must be securely **hashed using bcrypt** (10 salt rounds)

#### User Authentication
- Users must be able to log in using **email and password**
- System must generate a **JWT token** upon successful login
- Token must be used to access **protected routes**
- Token expires after **7 days** (configurable)

#### User Profile
- Authenticated users must be able to **fetch their own profile**
- Password must **never be exposed** in API responses
- Response must include: `id`, `name`, `email`, `createdAt`

---

### 3.2 Blog Post Management

#### Create Post
- **Authenticated users** can create blog posts
- **Required fields:**
  - Title (string, max 255 characters)
  - Content (text, max 10,000 characters)
- **Optional fields:**
  - Published status (boolean, default: `false`)
- Each post must be **linked to its author** (foreign key)

#### Read Posts
- **Public users** can view all published posts
- Posts must support:
  - **Pagination** (`page`, `limit` query parameters)
  - **Filtering** (by published status, author)
  - **Individual post retrieval by ID**
- Response must include author information (excluding password)

#### Update Post
- Only the **post owner** can update their post
- **Partial updates** are allowed (title, content, published)
- **Unauthorized access must be rejected** (403 Forbidden)

#### Delete Post
- Only the **post owner** can delete their post
- Deleting a post must also **invalidate related cache entries**
- Associated comments must be **cascade deleted**

---

### 3.3 Comment Management

#### Create Comment
- **Authenticated users** can comment on posts
- Each comment must be linked to:
  - A **post** (foreign key to `posts.id`)
  - An **author** (foreign key to `users.id`)
- Content must not exceed **1,000 characters**

#### Read Comments
- **Public users** can view comments for a specific post
- Comments must be returned in **descending order of creation** (newest first)
- Response must include author information (excluding password)

#### Update Comment
- Only the **comment owner** can update their comment
- Only the **content field** can be updated

#### Delete Comment
- Only the **comment owner** can delete their comment
- Deletion must be **permanent** (no soft delete)

---

## 4. API Endpoints Requirements

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login user | ❌ |
| `GET` | `/api/auth/profile` | Get authenticated user profile | ✅ |

---

### Posts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/posts` | Get all posts (paginated) | ❌ |
| `GET` | `/api/posts/:id` | Get post by ID | ❌ |
| `POST` | `/api/posts` | Create post | ✅ |
| `PUT` | `/api/posts/:id` | Update post | ✅ (owner only) |
| `DELETE` | `/api/posts/:id` | Delete post | ✅ (owner only) |

---

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/comments/:postId` | Create comment | ✅ |
| `GET` | `/api/comments/post/:postId` | Get comments for a post | ❌ |
| `GET` | `/api/comments/:id` | Get comment by ID | ❌ |
| `PUT` | `/api/comments/:id` | Update comment | ✅ (owner only) |
| `DELETE` | `/api/comments/:id` | Delete comment | ✅ (owner only) |

---

## 5. Non-Functional Requirements

### 5.1 Security Requirements

- ✅ **JWT-based authentication** - Stateless token-based auth
- ✅ **Password hashing using bcrypt** - 10 salt rounds
- ✅ **Ownership-based authorization** - Users can only modify their own resources
- ✅ **Input validation and sanitization** - Using `express-validator`
- ✅ **Protection against SQL injection** - Via Prisma ORM (parameterized queries)
- ✅ **Rate limiting** - 100 requests per 15 minutes per IP

---

### 5.2 Performance Requirements

- ⚡ **Redis caching** for read-heavy endpoints (`GET /api/posts`, `GET /api/posts/:id`)
- ⚡ **Cache TTL of 60 seconds** - Automatic expiration
- ⚡ **Cache invalidation** on create/update/delete operations
- ⚡ **Optimized database queries** - Use of Prisma `select` and `include`
- ⚡ **Pagination** to prevent large payloads (default: 10 items per page)

---

### 5.3 Reliability & Availability

- 🔄 **Graceful server shutdown** - Close DB and Redis connections on exit
- 🔄 **Database and Redis connection handling** - Retry logic and error handling
- 🔄 **Centralized error handling** - Consistent error response format
- 🔄 **Meaningful HTTP status codes** - 200, 201, 400, 401, 403, 404, 500

---

## 6. Database Design Requirements

### 6.1 Entities

#### Users Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary Key (auto-increment) |
| `name` | String | User full name |
| `email` | String | Unique email address |
| `password` | String | Hashed password (bcrypt) |
| `createdAt` | Timestamp | Account creation time |
| `updatedAt` | Timestamp | Last update time |

**Relationships:**
- One user can have **many posts** (1:N)
- One user can have **many comments** (1:N)

---

#### Posts Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary Key (auto-increment) |
| `title` | String | Post title (max 255 chars) |
| `content` | Text | Post body content |
| `published` | Boolean | Publish status (default: false) |
| `authorId` | Integer | FK → `users.id` |
| `createdAt` | Timestamp | Post creation time |
| `updatedAt` | Timestamp | Last update time |

**Relationships:**
- Many posts belong to **one user** (N:1)
- One post can have **many comments** (1:N)

---

#### Comments Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary Key (auto-increment) |
| `content` | Text | Comment text (max 1000 chars) |
| `postId` | Integer | FK → `posts.id` |
| `authorId` | Integer | FK → `users.id` |
| `createdAt` | Timestamp | Comment creation time |

**Relationships:**
- Many comments belong to **one post** (N:1)
- Many comments belong to **one user** (N:1)

---

### 6.2 Database Constraints

- `users.email` must be **UNIQUE**
- `posts.authorId` must reference a valid **user.id**
- `comments.postId` must reference a valid **post.id**
- `comments.authorId` must reference a valid **user.id**
- **Cascade delete:** Deleting a post deletes all its comments

---

## 7. Technology & Tooling Requirements

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | >= 18.0.0 | JavaScript runtime |
| **Framework** | Express.js | ^4.18.0 | HTTP server & routing |
| **Database** | MySQL | >= 8.0 | Relational database |
| **ORM** | Prisma | ^5.0.0 | Database toolkit & ORM |
| **Caching** | Redis | >= 6.0 | In-memory cache |
| **Authentication** | JWT | ^9.0.0 | Token-based auth |
| **Password Hashing** | bcrypt | ^5.1.0 | Password encryption |
| **Validation** | express-validator | ^7.0.0 | Input validation |
| **Logging** | Winston + Morgan | ^3.11.0 | Structured logging |
| **Testing** | Jest + Supertest | ^29.0.0 | Unit & integration tests |
| **Documentation** | Swagger | ^5.0.0 | API documentation |

---

## 8. Testing Requirements

### 8.1 Unit Tests
- ✅ Test **service layer** business logic
- ✅ Test **utility functions** (JWT, response formatting)
- ✅ Mock database and external dependencies

### 8.2 Integration Tests
- ✅ Test **API endpoints** end-to-end
- ✅ Test **authentication flow** (register, login, protected routes)
- ✅ Test **authorization scenarios** (owner vs non-owner)
- ✅ Test **error handling** (validation errors, unauthorized access)

### 8.3 Coverage Requirements
- ✅ **Minimum 80%+ code coverage**
- ✅ Cover all critical paths (success and failure cases)
- ✅ Use `Jest` for assertions and `Supertest` for HTTP testing

---


## 9. Assumptions & Constraints

### Assumptions
- ✅ API is **backend-only** (no frontend included)
- ✅ **Stateless authentication** using JWT (no sessions)
- ✅ Redis is **optional but recommended** for performance
- ✅ Designed for **small to medium-scale usage** (up to 10k daily users)

### Constraints
- ❌ No real-time features (WebSockets not required)
- ❌ No file upload support (images/media)
- ❌ No email verification (simplified auth flow)
- ❌ No OAuth/social login (JWT only)

---

## 10. Deployment Considerations

- 🚀 Use **environment variables** for configuration
- 🚀 Deploy on **cloud platforms** (AWS, Heroku, Railway, Render)
- 🚀 Use **PM2** or **Docker** for process management
- 🚀 Set up **CI/CD pipelines** for automated testing and deployment
- 🚀 Monitor with **logging and alerting** tools (Winston, Sentry)

---

## 11. Success Criteria

The project is considered **successful** when:
- ✅ All **API endpoints** work as specified
- ✅ **Authentication and authorization** are properly enforced
- ✅ **Test coverage** exceeds 80%
- ✅ **API documentation** is complete and interactive (Swagger)
- ✅ **Performance optimizations** (caching, pagination) are implemented
- ✅ **Code quality** meets production standards (ESLint, clean architecture)

---

## 12. Conclusion

This requirement analysis guided the development of a **production-grade Blog API** that adheres to modern backend engineering standards, demonstrating real-world system design, scalability, and maintainability.

The system is designed to be:
- **Secure** - JWT auth, bcrypt hashing, input validation
- **Scalable** - Redis caching, pagination, optimized queries
- **Maintainable** - Clean architecture, separation of concerns
- **Testable** - 80%+ coverage, unit & integration tests
- **Production-ready** - Logging, error handling, graceful shutdown

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** ✅ Complete