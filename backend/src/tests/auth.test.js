// backend/src/tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Ensure fresh DB for each test
  await mongoose.connection.db.dropDatabase();
});

describe('Authentication flow', () => {
  const user = { email: 'test@example.com', password: 'Secret123' };

  test('register succeeds', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ email: user.email });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('duplicate registration fails', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  test('login succeeds', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send(user);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ email: user.email });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('login with wrong password fails', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Wrong' });
    expect(res.status).toBe(401);
  });

  test('protected profile accessible with cookie', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(user);
    const cookie = registerRes.headers['set-cookie'];
    const profileRes = await request(app).get('/api/auth/profile').set('Cookie', cookie);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body).toMatchObject({ email: user.email });
  });

  test('profile without auth fails', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  test('logout clears cookie', async () => {
    const agent = request.agent(app);
    const registerRes = await agent.post('/api/auth/register').send(user);
    expect(registerRes.status).toBe(201);
    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);
    // After logout, profile should be unauthorized
    const profileRes = await agent.get('/api/auth/profile');
    expect(profileRes.status).toBe(401);
  });
});
