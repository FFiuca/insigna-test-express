import request from 'supertest';
import app from '../app';
import { connectDB, clearDB, closeDB } from './setup';
import User from '../models/User';
import bcrypt from 'bcrypt';

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

describe('Authentication API', () => {
  describe('POST /api/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a user first
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'john@example.com');
      expect(response.body.user).toHaveProperty('name', 'John Doe');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should fail with invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email');
    });

    it('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'john@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('password');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('valid');
    });
  });
});
