const request = require('supertest');
const { app, server } = require('../pages/server');
const db = require('../services/db');
const jwt = require('jsonwebtoken');

// Mocking the database
jest.mock('../services/db');

// Mocking the JWT library
jest.mock('jsonwebtoken');

afterAll((done) => {
    server.close(done);
});

describe('Notifications API Endpoints', () => {
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

    describe('GET /api/notifications', () => {
        it('should retrieve notifications for the logged-in user', async () => {
            const notifications = [
                { id: 1, user_id: 1, message: 'Notification 1', created_at: '2024-06-01' },
                { id: 2, user_id: 1, message: 'Notification 2', created_at: '2024-06-02' },
            ];
            const user_id = notifications[0].user_id;

            db.query.mockImplementation((query, values, callback) => {
                callback(null, notifications);
            });

            const response = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
                .send({ user_id });

            // console.log(response.body);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(notifications);
        });

        it('should handle database errors when retrieving notifications', async () => {
            db.query.mockImplementation((query, values, callback) => {
                callback(new Error('Database error'), null);
            });

            const response = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${validToken}`); // Set the authorization header

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('POST /api/notifications/mark-read', () => {
        it('should mark notifications as read', async () => {
            const notificationIds = [1, 2];
            // const mockResult = { affectedRows: notificationIds.length };

            db.query.mockImplementationOnce((query, values, callback) => {
                callback(null, { affectedRows: notificationIds.length });
            });

            const response = await request(app)
                .post('/api/notifications/mark-read')
                .set('Authorization', `Bearer ${validToken}`) // Set the authorization header
                .send({ notificationIds });

            // console.log(response.body);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: `${notificationIds.length} notifications marked as read` });
        });

        it('should return 400 for invalid notification IDs', async () => {
            const response = await request(app)
                .post('/api/notifications/mark-read')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ notificationIds: [] });

            expect(response.status).toBe(400);
            expect(response.body).toEqual('Invalid notification IDs');
        });

        it('should handle database errors when marking notifications', async () => {
            const notificationIds = [1, 2];

            db.query.mockImplementationOnce((query, values, callback) => {
                callback(new Error('Database error'), null);
            });

            const response = await request(app)
                .post('/api/notifications/mark-read')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ notificationIds });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });
});
