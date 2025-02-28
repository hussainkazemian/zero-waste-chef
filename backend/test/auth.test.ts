import request from 'supertest';
import express from 'express';
import { initializeDatabase } from '../src/db';
import authRoutes from '../src/routes/auth';

const app = express();

beforeAll(async () => {
  await initializeDatabase(); // Ensure DB is initialized before tests
});

app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
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
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login - success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: 'testuser', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
