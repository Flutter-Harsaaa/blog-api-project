// File: src/docs/swagger.js

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'InnoByte Blog API Documentation',
      version: '1.0.0',
      description: 'A scalable, production-ready RESTful Blog API built with Node.js, Express, MySQL, Prisma ORM, Redis caching, and JWT authentication.',
      contact: {
        name: 'API Support',
        email: 'official.devharshtiwari@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'My First Blog Post',
            },
            content: {
              type: 'string',
              example: 'This is the content of my first post.',
            },
            published: {
              type: 'boolean',
              example: true,
            },
            authorId: {
              type: 'integer',
              example: 1,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            author: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            content: {
              type: 'string',
              example: 'Great post!',
            },
            postId: {
              type: 'integer',
              example: 1,
            },
            authorId: {
              type: 'integer',
              example: 1,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            author: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'object',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Posts',
        description: 'Blog post management endpoints',
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints',
      },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: {
                      type: 'string',
                      example: 'John Doe',
                    },
                    email: {
                      type: 'string',
                      example: 'john@example.com',
                    },
                    password: {
                      type: 'string',
                      example: 'Test123',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User registered successfully' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          token: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error' },
            409: { description: 'Email already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      example: 'john@example.com',
                    },
                    password: {
                      type: 'string',
                      example: 'Test123',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Login successful' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          token: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/profile': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Profile retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/posts': {
        get: {
          tags: ['Posts'],
          summary: 'Get all posts with pagination',
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
            {
              name: 'published',
              in: 'query',
              schema: { type: 'boolean' },
            },
            {
              name: 'authorId',
              in: 'query',
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: {
              description: 'Posts retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          posts: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Post' },
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              currentPage: { type: 'integer' },
                              totalPages: { type: 'integer' },
                              totalItems: { type: 'integer' },
                              itemsPerPage: { type: 'integer' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Posts'],
          summary: 'Create a new post',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'content'],
                  properties: {
                    title: { type: 'string', example: 'My New Post' },
                    content: { type: 'string', example: 'Post content here' },
                    published: { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Post created successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/posts/{id}': {
        get: {
          tags: ['Posts'],
          summary: 'Get post by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: { description: 'Post retrieved successfully' },
            404: { description: 'Post not found' },
          },
        },
        put: {
          tags: ['Posts'],
          summary: 'Update post',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    published: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Post updated successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Not the owner' },
            404: { description: 'Post not found' },
          },
        },
        delete: {
          tags: ['Posts'],
          summary: 'Delete post',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: { description: 'Post deleted successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Not the owner' },
            404: { description: 'Post not found' },
          },
        },
      },
      '/api/comments/{postId}': {
        post: {
          tags: ['Comments'],
          summary: 'Create comment on a post',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'postId',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['content'],
                  properties: {
                    content: { type: 'string', example: 'Great post!' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Comment created successfully' },
            401: { description: 'Unauthorized' },
            404: { description: 'Post not found' },
          },
        },
      },
      '/api/comments/post/{postId}': {
        get: {
          tags: ['Comments'],
          summary: 'Get all comments for a post',
          parameters: [
            {
              name: 'postId',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: { description: 'Comments retrieved successfully' },
            404: { description: 'Post not found' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
