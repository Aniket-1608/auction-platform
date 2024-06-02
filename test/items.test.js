const request = require('supertest');
const { app, server } = require('../server');
const db = require('../services/db');
const jwt = require('jsonwebtoken');

// Mocking the database
jest.mock('../db');

// Mocking the JWT library
jest.mock('jsonwebtoken');

afterAll((done) => {
  server.close(done);
});

describe('Items API Endpoints', () => {
  // Define a valid token and user for the tests
  const validToken = 'valid-token';
  const user = { id: 1, role: 'admin' };

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

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Item 1',
        description: 'Description 1',
        starting_price: 100,
        image_url: 'http://example.com/image.jpg',
        end_time: '2024-12-31',
        owner_id: 1
      };
      const mockResult = { insertId: 1 };

      db.query.mockImplementation((query, values, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 1, ...newItem });
    });

    it('should handle database errors on item creation', async () => {
      const newItem = {
        name: 'Item 1',
        description: 'Description 1',
        starting_price: 100,
        image_url: 'http://example.com/image.jpg',
        end_time: '2024-12-31',
        owner_id: 1
      };

      db.query.mockImplementation((query, values, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send(newItem);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const id = 1;
      const updatedItem = {
        name: 'Updated Item',
        description: 'Updated Description',
        starting_price: 200,
        image_url: 'http://example.com/new-image.jpg',
        end_time: '2024-12-31',
        owner_id: 1
      };

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, [{ owner_id: 1 }]);
      });

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .put(`/api/items/${id}`)
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send(updatedItem);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id, ...updatedItem });
    });

    it('should return 404 if item not found during update', async () => {
      const id = 1;
      const updatedItem = {
        name: 'Updated Item',
        description: 'Updated Description',
        starting_price: 200,
        image_url: 'http://example.com/new-image.jpg',
        end_time: '2024-12-31',
        owner_id: 1
      };

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .put(`/api/items/${id}`)
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send(updatedItem);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Item not found' });
    });

    it('should handle owner mismatch during update', async () => {
      const id = 1;
      const updatedItem = {
        name: 'Updated Item',
        description: 'Updated Description',
        starting_price: 200,
        image_url: 'http://example.com/new-image.jpg',
        end_time: '2024-12-31',
        owner_id: 2 // Different owner_id to simulate mismatch
      };

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, [{ owner_id: 1 }]);
      });

      const response = await request(app)
        .put(`/api/items/${id}`)
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send(updatedItem);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: 'Owner Mismatch. You are not allowed to update the item.' });
    });

    it('should handle database errors during update', async () => {
      const id = 1;
      const updatedItem = {
        name: 'Updated Item',
        description: 'Updated Description',
        starting_price: 200,
        image_url: 'http://example.com/new-image.jpg',
        end_time: '2024-12-31',
        owner_id: 1
      };

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, [{ owner_id: 1 }]);
      });

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .put(`/api/items/${id}`)
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send(updatedItem);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const id = 1;
      const owner_id = 1;

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, [{ owner_id: 1 }]);
      });

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .delete(`/api/items/${id}`)
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send({ owner_id });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Item deleted' });
    });

    it('should return 404 if item not found during deletion', async () => {
      const id = 1;
      const owner_id = 1;

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .delete(`/api/items/${id}`)
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send({ owner_id });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Item not found' });
    });

    it('should handle owner mismatch during deletion', async () => {
      const id = 1;
      const owner_id = 2; // Different owner_id to simulate mismatch

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, [{ owner_id: 1 }]);
      });

      const response = await request(app)
        .delete(`/api/items/${id}`)
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send({ owner_id });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: 'Owner Mismatch. You are not allowed to delete the item.' });
    });

    it('should handle database errors during deletion', async () => {
      const id = 1;
      const owner_id = 1;

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(null, [{ owner_id: 1 }]);
      });

      db.query.mockImplementationOnce((query, values, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .delete(`/api/items/${id}`)
        .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
        .send({ owner_id });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });
});
