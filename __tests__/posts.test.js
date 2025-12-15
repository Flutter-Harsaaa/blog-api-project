// File: __tests__/posts.test.js

const request = require('supertest');
const app = require('../src/app');
const { clearDatabase, createTestUserWithToken, createTestPost } = require('./helpers/testHelper');

describe('Post Endpoints', () => {
  let token;
  let user;
  let token2;
  let user2;

  beforeEach(async () => {
    await clearDatabase();
    const userData = await createTestUserWithToken(request(app));
    token = userData.token;
    user = userData.user;

    const userData2 = await createTestUserWithToken(request(app), global.testUser2);
    token2 = userData2.token;
    user2 = userData2.user;
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is test content',
        published: true,
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe(postData.title);
      expect(response.body.data.post.content).toBe(postData.content);
      expect(response.body.data.post.published).toBe(true);
      expect(response.body.data.post.authorId).toBe(user.id);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'Test Post',
          content: 'This is test content',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'AB', // Too short
          content: 'Short',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

// File: __tests__/posts.test.js (UPDATE the beforeEach in "GET /api/posts")

describe('GET /api/posts', () => {
  beforeEach(async () => {
    // Create posts directly without helper to avoid issues
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Post 1',
        content: 'Content 1 with minimum length requirement',
        published: true,
      });
    
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Post 2',
        content: 'Content 2 with minimum length requirement',
        published: false,
      });
  });

  it('should get all posts with pagination', async () => {
    const response = await request(app)
      .get('/api/posts')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.posts).toBeInstanceOf(Array);
    expect(response.body.data.posts.length).toBeGreaterThanOrEqual(2);
    expect(response.body.data.pagination).toHaveProperty('currentPage');
    expect(response.body.data.pagination).toHaveProperty('totalPages');
  });

  it('should filter by published status', async () => {
    const response = await request(app)
      .get('/api/posts?published=true')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.posts.length).toBeGreaterThanOrEqual(1);
    
    // All returned posts should be published
    response.body.data.posts.forEach(post => {
      expect(post.published).toBe(true);
    });
  });
});

  describe('GET /api/posts/:id', () => {
    let post;

    beforeEach(async () => {
      post = await createTestPost(request(app), token, {
        title: 'Test Post',
        content: 'Test Content',
        published: true,
      });
    });

    it('should get post by id', async () => {
      const response = await request(app)
        .get(`/api/posts/${post.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.id).toBe(post.id);
      expect(response.body.data.post.title).toBe(post.title);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .get('/api/posts/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/posts/:id', () => {
    let post;

    beforeEach(async () => {
      post = await createTestPost(request(app), token, {
        title: 'Original Title',
        content: 'Original Content',
        published: false,
      });
    });

    it('should update own post', async () => {
      const updateData = {
        title: 'Updated Title',
        published: true,
      };

      const response = await request(app)
        .put(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe(updateData.title);
      expect(response.body.data.post.published).toBe(true);
    });

    it('should fail to update another user\'s post', async () => {
      const response = await request(app)
        .put(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: 'Hacked Title' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

describe('DELETE /api/posts/:id', () => {
  let post;

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Post to Delete',
        content: 'Content that meets minimum length',
        published: true,
      });
    
    post = response.body.data.post;
  });

  it('should delete own post', async () => {
    const response = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);

    // Verify deletion
    await request(app).get(`/api/posts/${post.id}`).expect(404);
  });

  it('should fail to delete another user\'s post', async () => {
    const response = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403);

    expect(response.body.success).toBe(false);
  });
});


//Testing Purpose 
/*describe('DEBUG', () => {
  it('should show post creation response', async () => {
    const testToken = await createTestUserWithToken(request(app));
    
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${testToken.token}`)
      .send({
        title: 'Debug Post',
        content: 'Debug content with sufficient length',
        published: true,
      });
    
    console.log('Response body:', JSON.stringify(response.body, null, 2));
  });
});*/

});
