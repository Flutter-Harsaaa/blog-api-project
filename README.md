# 📝 Blog API - Production-Grade RESTful API

A scalable, production-ready RESTful Blog Application API built with Node.js, Express.js, MySQL, Prisma ORM, Redis caching, and JWT authentication.

[![Tests](https://img.shields.io/badge/tests-39%20passed-success)]()
[![Coverage](https://img.shields.io/badge/coverage-85.23%25-brightgreen)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 🚀 Features

### Core Functionality
- ✅ User authentication (register, login, JWT tokens)
- ✅ CRUD operations for blog posts
- ✅ CRUD operations for comments
- ✅ Ownership-based authorization
- ✅ Input validation & sanitization
- ✅ Pagination support

### Performance & Scalability
- ⚡ Redis caching (60s TTL)
- ⚡ Automatic cache invalidation
- ⚡ Database connection pooling
- ⚡ Rate limiting (100 req/15min)
- ⚡ Optimized database queries

### Production-Ready
- 🔒 JWT authentication & bcrypt password hashing
- 📝 Winston structured logging
- 🛡️ Centralized error handling
- 🔄 Graceful shutdown
- 📊 Swagger/OpenAPI documentation
- ✅ 85%+ test coverage

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js |
| **Database** | MySQL |
| **ORM** | Prisma |
| **Caching** | Redis (ioredis) |
| **Authentication** | JWT (jsonwebtoken) |
| **Validation** | express-validator |
| **Logging** | Winston + Morgan |
| **Testing** | Jest + Supertest |
| **Documentation** | Swagger/OpenAPI 3.0 |

---

## 📋 Prerequisites

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0
- npm or yarn

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd blog-api-project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
Create a `.env` file in the root directory:
```bash
# =========================
# Database
# =========================
DATABASE_URL="mysql://root:password@localhost:3306/blog_api"

# =========================
# JWT
# =========================
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# =========================
# Server
# =========================
NODE_ENV="development"
PORT=5000
CORS_ORIGIN="*"

# =========================
# Redis
# =========================
REDIS_URL="redis://localhost:6379"

```

### 4. Database setup

Run Prisma migrations
```bash
npx prisma migrate dev --name init
```
Generate Prisma Client
```bash
npx prisma generate
```

### 5. Start Redis (Docker)
```bash
docker run -d -p 6379:6379 --name redis-blog-api redis:alpine
```

### 6. Start the server
```bash
npm start
```

Server will start on `http://localhost:5000`

---

## 📚 API Documentation

### Interactive Documentation

Access Swagger UI at: [**http://localhost:5000/api/docs**](http://localhost:5000/api/docs)
### Quick Start

Health check
```bash
curl http://localhost:5000/health
```

Register user
```bash
curl -X POST http://localhost:5000/api/auth/register
-H "Content-Type: application/json"
-d '{"name":"John Doe","email":"john@example.com","password":"Test123"}'
```

Login
```bash
curl -X POST http://localhost:5000/api/auth/login
-H "Content-Type: application/json"
-d '{"email":"john@example.com","password":"Test123"}'
```

Get posts
```bash
curl http://localhost:5000/api/posts
```
### API Endpoints

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |

#### Posts
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts` | Get all posts (paginated) | ❌ |
| GET | `/api/posts/:id` | Get post by ID | ❌ |
| POST | `/api/posts` | Create new post | ✅ |
| PUT | `/api/posts/:id` | Update post (owner only) | ✅ |
| DELETE | `/api/posts/:id` | Delete post (owner only) | ✅ |

#### Comments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/comments/:postId` | Create comment | ✅ |
| GET | `/api/comments/post/:postId` | Get comments for post | ❌ |
| GET | `/api/comments/:id` | Get comment by ID | ❌ |
| PUT | `/api/comments/:id` | Update comment (owner only) | ✅ |
| DELETE | `/api/comments/:id` | Delete comment (owner only) | ✅ |

---

## 🧪 Testing

Run all tests
```bash
npm test
```
Run tests in watch mode
```bash
npm run test:watch
```
Generate coverage report
```bash
npm run test:coverage
```

### Test Coverage
- **85.23%** overall coverage
- **39** comprehensive tests
- Integration & unit tests included

---

## 📁 Project Structure
```bash
blog-api-project/
├── tests/ # Test suites (39 tests)
├── prisma/ # Database schema & migrations
├── src/
│ ├── config/ # Configuration files
│ ├── controllers/ # Request handlers
│ ├── routes/ # API routes
│ ├── middlewares/ # Auth & validation
│ ├── services/ # Business logic
│ ├── docs/ # Swagger docs
│ ├── utils/ # Helpers
│ ├── app.js # Express setup
│ └── server.js # Entry point
├── .env # Environment config
└── package.json # Dependencies
```

### Directory Details

| Directory | Files | Purpose |
|-----------|-------|---------|
| `__tests__/` | `auth.test.js`, `posts.test.js`, `comments.test.js` | Comprehensive test suites |
| `src/config/` | `db.js`, `jwt.js`, `logger.js`, `redis.js` | App configuration |
| `src/controllers/` | `auth`, `post`, `comment` controllers | Handle HTTP requests |
| `src/services/` | `auth`, `post`, `comment` services | Business logic & DB ops |
| `src/middlewares/` | `auth`, `error`, `validate` | Request processing |
| `src/routes/` | `auth`, `post`, `comment` routes | API endpoints |
---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Input validation & sanitization
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Ownership-based authorization
- ✅ SQL injection protection (Prisma ORM)

---

## 🚀 Performance Optimizations

- **Redis Caching**: 60-second TTL for GET requests
- **Database Indexing**: Optimized queries on frequently accessed fields
- **Connection Pooling**: Efficient database connection management
- **Pagination**: Prevents large data transfers
- **Lazy Loading**: Relations loaded only when needed

---

## 📈 Monitoring & Logging

- **Winston**: Structured JSON logging
- **Morgan**: HTTP request logging
- **Environment-aware**: Debug logs in development, error-only in production
- **Log files**: Errors logged to `logs/error.log` in production

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👤 Author

**Your Name**
- GitHub: [@Flutter-Harsaaa](https://github.com/Flutter-Harsaaa)
- LinkedIn: [Harsh Tiwari](https://linkedin.com/in/dev-harshtiwari)
- Email: official.devharshtiwari@gmail.com

---

## 🙏 Acknowledgments

- Built as part of an internship project
- Demonstrates production-grade backend development practices
- Follows industry-standard architecture and best practices

---

## 📞 Support

For support, email official.devharshtiwari@gmail.com or open an issue in the repository.

---

**⭐ If you found this project helpful, please consider giving it a star!**