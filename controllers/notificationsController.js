const db = require('../services/db');

// retrieve notifications for the logged-in users
exports.getNotifications = (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';

    db.query(query, [userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(200).json(results);
    })
};

// mark notifications as read
exports.markNotifications = (req, res) => {
    const user_id = req.user.id;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json('Invalid notification IDs');
    }

    // Constructing the query with placeholders
    const query = `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${notificationIds.map(() => '?').join(',')})`;
    const params = [user_id, ...notificationIds];

    db.query(query, params, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(200).json({ message: `${results.affectedRows} notifications marked as read` });
    });
};

//add notification to the database
exports.addUserNotifications = (req, res) => {
    const userId = req.body.userid;
    const message = req.body.message;

    const query = 'INSERT INTO notifications (user_id ,message) VALUES (?, ?)';
    const values = [userId, message];

    db.query(query, values, (error) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(200).json({ message: 'Added notification to the database' });
    });

};