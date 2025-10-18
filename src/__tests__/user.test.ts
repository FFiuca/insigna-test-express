import request from 'supertest';
import app from '../app';
import { connectDB, clearDB, closeDB } from './setup';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let authToken: string;
let userId: string;

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

// Helper function to create a user and get auth token
const createAuthenticatedUser = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: hashedPassword,
  });

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  return { token, userId: String(user._id) };
};

describe('User API', () => {
  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.user).toHaveProperty('name', 'John Doe');
      expect(response.body.user).toHaveProperty('email', 'john@example.com');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).toHaveProperty('createdAt');
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
      });

      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('valid');
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('6 characters');
    });

    it('should fail with missing name', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('name');
    });

    it('should hash password before storing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      const user = await User.findById(response.body.user.id);
      expect(user?.password).not.toBe('password123');
      expect(user?.password.length).toBeGreaterThan(20);
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      const auth = await createAuthenticatedUser();
      authToken = auth.token;
    });

    it('should get all users with valid token', async () => {
      await User.create({
        name: 'User 1',
        email: 'user1@example.com',
        password: await bcrypt.hash('password123', 10),
      });

      await User.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: await bcrypt.hash('password123', 10),
      });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeGreaterThanOrEqual(3);
      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.users[0]).not.toHaveProperty('password');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid or expired token');
    });

    it('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('GET /api/users/:id', () => {
    beforeEach(async () => {
      const auth = await createAuthenticatedUser();
      authToken = auth.token;
      userId = auth.userId;
    });

    it('should get user by ID with valid token', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail without token', async () => {
      const response = await request(app).get(`/api/users/${userId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });

    it('should fail with non-existent user ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should fail with invalid user ID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid user ID');
    });
  });

  describe('PUT /api/users/:id', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        name: 'Original Name',
        email: 'original@example.com',
        password: hashedPassword,
      });
      userId = String(user._id);
    });

    it('should update user name successfully', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('updated successfully');
      expect(response.body.user.name).toBe('Updated Name');
      expect(response.body.user.email).toBe('original@example.com');
    });

    it('should update user email successfully', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          email: 'newemail@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('newemail@example.com');
    });

    it('should update user password and hash it', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          password: 'newpassword123',
        });

      expect(response.status).toBe(200);

      const user = await User.findById(userId);
      expect(user?.password).not.toBe('newpassword123');
      const isValid = await bcrypt.compare('newpassword123', user!.password);
      expect(isValid).toBe(true);
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        name: 'Another User',
        email: 'another@example.com',
        password: await bcrypt.hash('password123', 10),
      });

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          email: 'another@example.com',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('Email already in use');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('valid');
    });

    it('should fail with non-existent user ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should fail with no update fields', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/users/:id', () => {
    beforeEach(async () => {
      const user = await User.create({
        name: 'User To Delete',
        email: 'delete@example.com',
        password: await bcrypt.hash('password123', 10),
      });
      userId = String(user._id);
    });

    it('should delete user successfully', async () => {
      const response = await request(app).delete(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');

      const user = await User.findById(userId);
      expect(user).toBeNull();
    });

    it('should fail with non-existent user ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).delete(`/api/users/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should fail with invalid user ID format', async () => {
      const response = await request(app).delete('/api/users/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid user ID');
    });
  });
});
