const request = require('supertest');
const { app, server } = require('../server');
const db = require('../services/db');
const jwt = require('jsonwebtoken');

// Mocking the database
jest.mock('../services/db');

// Mocking the JWT library
jest.mock('jsonwebtoken');

afterAll((done) => {
    server.close(done);
});

describe('Bids API Endpoints', () => {
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

    describe('GET /api/items/:itemid/bids', () => {
        it('should retrieve all bids for a specific item', async () => {
            const itemid = 1;
            const mockResults = [
                { bid_id: 1, item_id: itemid, user_id: 1, bid_amount: 150, created_at: '2024-01-01' },
                { bid_id: 2, item_id: itemid, user_id: 2, bid_amount: 200, created_at: '2024-01-02' },
            ];

            db.query.mockImplementation((query, values, callback) => {
                callback(null, mockResults);
            });

            const response = await request(app)
                .get(`/api/items/${itemid}/bids`)

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResults);
        });

        it('should handle database errors during bid retrieval', async () => {
            const itemid = 1;

            db.query.mockImplementation((query, values, callback) => {
                callback(new Error('Database error'), null);
            });

            const response = await request(app)
                .get(`/api/items/${itemid}/bids`)

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('POST /api/items/:itemid/bids/', () => {
        it('should place a new bid on a specific item', async () => {
            const itemid = 1;
            const newBid = {
                userid: 1,
                bidamount: 250
            };
            const mockResult = { insertId: 1 };

            db.query.mockImplementation((query, values, callback) => {
                callback(null, mockResult);
            });

            const response = await request(app)
                .post(`/api/items/${itemid}/bids/`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(newBid);
            expect(response.status).toBe(201);
            expect(response.body).toEqual({ itemid, ...newBid });
        });

        it('should handle database errors during bid placement', async () => {
            const itemid = 1;
            const newBid = {
                userid: 1,
                bidamount: 250
            };

            db.query.mockImplementation((query, values, callback) => {
                callback(new Error('Database error'), null);
            });

            const response = await request(app)
                .post(`/api/items/${itemid}/bids/`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(newBid);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });
});
