const request = require('supertest');
const { app, server } = require('../server');
const db = require('../services/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mocking the database
jest.mock('../db');

// Mocking bcrypt
jest.mock('bcrypt');

// Mocking jwt
jest.mock('jsonwebtoken');

afterAll((done) => {
  server.close(done);
});

describe('users Authentication API Endpoints', () => {
    // Define a valid token and user for the tests
    const validToken = 'valid-token';
    const user = { id: 1, username: 'testuser', email: 'test@example.com', _role: 'user', created_at: '2024-06-02' };
    beforeEach(() => {
        // Mock the JWT verification to always return the user
        jwt.verify.mockImplementation((token, secret, callback) => {
          if (token === validToken) {
            callback(null, user);
          } else {
            callback(new Error('Token is not valid'));
          }
        });
    });
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        username: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
        role: 'user'
      };

      // Mock bcrypt.hash to return hashed password
      bcrypt.hash.mockResolvedValue('hashedPassword');

      // Mock database query to return user data
      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, { id: 1, ...newUser });
      });

      const response = await request(app)
        .post('/api/users/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 1, ...newUser });
    });

    it('should handle registration errors', async () => {
      const newUser = {
        username: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
        role: 'user'
      };

      // Mock bcrypt.hash to throw an error
      bcrypt.hash.mockRejectedValue(new Error('Bcrypt error'));

      const response = await request(app)
        .post('/api/users/register')
        .send(newUser);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Bcrypt error' });
    });
  });

  describe('POST /api/users/login', () => {
    it('should login a user with valid credentials', async () => {
      const loginUser = {
        username: 'testuser',
        password: 'testpassword',
        role: 'user'
      };

      // Mock database query to return user data
      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, [{ username: 'testuser', _password: 'hashedPassword', _role: 'user' }]);
      });

      // Mock bcrypt.compare to return true
      bcrypt.compare.mockResolvedValue(true);

      // Mock jwt.sign to return token
      jwt.sign.mockReturnValue('mockedToken');

      const response = await request(app)
        .post('/api/users/login')
        .send(loginUser);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token: 'mockedToken' });
    });

    it('should handle login errors', async () => {
      const loginUser = {
        username: 'testuser',
        password: 'testpassword',
        role: 'user'
      };

      // Mock database query to throw an error
      db.query.mockImplementationOnce((query, values, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/api/users/login')
        .send(loginUser);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('GET /api/users/profile', () => {
    it('should get the profile of the logged in user', async () => {
      // Mock user object
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        _role: 'user',
        created_at: '2024-06-02'
      };

      // Mock database query to return user data
      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, [mockUser]);
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should handle profile retrieval errors', async () => {
      // Mock database query to throw an error
      db.query.mockImplementationOnce((query, values, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send();

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should return 404 if user not found', async () => {
      // Mock database query to return empty result
      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'user not found!' });
    });
  });
});
