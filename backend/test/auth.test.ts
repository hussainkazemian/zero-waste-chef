import request from 'supertest';
import express from 'express';
import { initializeDatabase } from '../src/db';
import authRoutes from '../src/routes/auth';

const app = express();

// Ensure DB is initialized before tests
beforeAll(async () => {
  await initializeDatabase();
});

app.use(express.json());  // Middleware to parse JSON request bodies
app.use('/api/auth', authRoutes); // Use the authentication routes for testing

describe('Auth API', () => {
    // Test case for user registration
  it('POST /api/auth/register - success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        family_name: 'User',
      });
    expect(res.status).toBe(201); // Expect a 201 Created status
    expect(res.body).toHaveProperty('token'); // Expect the response to contain a token
  });

    // Test case for user login
  it('POST /api/auth/login - success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: 'testuser', password: 'password123' });
    expect(res.status).toBe(200); // Expect a 200 OK status
    expect(res.body).toHaveProperty('token'); // Expect the response to contain a token
  });
});
