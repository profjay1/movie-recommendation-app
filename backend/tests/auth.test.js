// tests/auth.test.js
import request from 'supertest';
import app from '../src/server.js';

describe('Auth', () => {
  it('register & login', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ name:'Bob', email:'bob@test.com', password:'pass123' });
    expect(res1.body.token).toBeDefined();

    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ email:'bob@test.com', password:'pass123' });
    expect(res2.body.token).toBeDefined();
  });
});
