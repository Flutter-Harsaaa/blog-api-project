// File: __tests__/comments.test.js

const request = require('supertest');
const app = require('../src/app');
const { clearDatabase, createTestUserWithToken } = require('./helpers/testHelper');

describe('Comment Endpoints', () => {
  let token;
  let user;
  let token2;
  let user2;
  let post;

  beforeEach(async () => {
    await clearDatabase();
    
    // Create first user
    const userData = await createTestUserWithToken(request(app));
    token = userData.token;
    user = userData.user;

    // Create second user
    const userData2 = await createTestUserWithToken(request(app), global.testUser2);
    token2 = userData2.token;
    user2 = userData2.user;

    // Create a test post
    const postResponse = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Post for Comments',
        content: 'This post will have comments',
        published: true,
      });
    
    post = postResponse.body.data.post;
  });

  describe('POST /api/comments/:postId', () => {
    it('should create a comment on a post', async () => {
      const commentData = {
        content: 'This is a great post!',
      };

      const response = await request(app)
        .post(`/api/comments/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Comment created successfully');
      expect(response.body.data.comment.content).toBe(commentData.content);
      expect(response.body.data.comment.postId).toBe(post.id);
      expect(response.body.data.comment.authorId).toBe(user.id);
      expect(response.body.data.comment.author).toHaveProperty('name');
      expect(response.body.data.comment.post).toHaveProperty('title');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/comments/${post.id}`)
        .send({
          content: 'This should fail',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid content', async () => {
      const response = await request(app)
        .post(`/api/comments/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: '', // Empty content
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail with non-existent post', async () => {
      const response = await request(app)
        .post('/api/comments/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Comment on non-existent post',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Post not found');
    });
  });

  describe('GET /api/comments/post/:postId', () => {
    beforeEach(async () => {
      // Create multiple comments
      await request(app)
        .post(`/api/comments/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'First comment' });

      await request(app)
        .post(`/api/comments/${post.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ content: 'Second comment' });
    });

    it('should get all comments for a post', async () => {
      const response = await request(app)
        .get(`/api/comments/post/${post.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Comments retrieved successfully');
      expect(response.body.data.comments).toBeInstanceOf(Array);
      expect(response.body.data.comments.length).toBe(2);
      expect(response.body.data.comments[0]).toHaveProperty('author');
    });

    it('should return empty array for post with no comments', async () => {
      // Create new post without comments
      const newPostResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Post without comments',
          content: 'This post has no comments',
          published: true,
        });

      const newPost = newPostResponse.body.data.post;

      const response = await request(app)
        .get(`/api/comments/post/${newPost.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comments).toBeInstanceOf(Array);
      expect(response.body.data.comments.length).toBe(0);
    });

    it('should fail for non-existent post', async () => {
      const response = await request(app)
        .get('/api/comments/post/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Post not found');
    });
  });

  describe('GET /api/comments/:id', () => {
    let comment;

    beforeEach(async () => {
      const commentResponse = await request(app)
        .post(`/api/comments/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Test comment' });

      comment = commentResponse.body.data.comment;
    });

    it('should get comment by id', async () => {
      const response = await request(app)
        .get(`/api/comments/${comment.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Comment retrieved successfully');
      expect(response.body.data.comment.id).toBe(comment.id);
      expect(response.body.data.comment.content).toBe(comment.content);
      expect(response.body.data.comment).toHaveProperty('author');
      expect(response.body.data.comment).toHaveProperty('post');
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await request(app)
        .get('/api/comments/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Comment not found');
    });
  });

  describe('PUT /api/comments/:id', () => {
    let comment;

    beforeEach(async () => {
      const commentResponse = await request(app)
        .post(`/api/comments/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Original comment' });

      comment = commentResponse.body.data.comment;
    });

    it('should update own comment', async () => {
      const updateData = {
        content: 'Updated comment content',
      };

      const response = await request(app)
        .put(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Comment updated successfully');
      expect(response.body.data.comment.content).toBe(updateData.content);
      expect(response.body.data.comment.id).toBe(comment.id);
    });

    it('should fail to update another user\'s comment', async () => {
      const response = await request(app)
        .put(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ content: 'Trying to hack comment' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You are not authorized to update this comment');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/comments/${comment.id}`)
        .send({ content: 'Should fail' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid content', async () => {
      const response = await request(app)
        .put(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail for non-existent comment', async () => {
      const response = await request(app)
        .put('/api/comments/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Updated content' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    let comment;

    beforeEach(async () => {
      const commentResponse = await request(app)
        .post(`/api/comments/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Comment to delete' });

      comment = commentResponse.body.data.comment;
    });

    it('should delete own comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Comment deleted successfully');

      // Verify deletion
      await request(app)
        .get(`/api/comments/${comment.id}`)
        .expect(404);
    });

    it('should fail to delete another user\'s comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${comment.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You are not authorized to delete this comment');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/comments/${comment.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail for non-existent comment', async () => {
      const response = await request(app)
        .delete('/api/comments/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
