const db = require('../services/db');

// retrieve notifications for the logged-in users
exports.getNotifications = (req, res) => {
    const userId = req.user_id;
    const query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
    
    db.query(query, [userId], (error, results) => {
        if(error){
            return res.status(500).json({error: error.message});
        }
        res.status(200).json(results);
    })
};

// mark notifications as read
exports.markNotifications = (req, res) => {
    const user_id =req.user_id;
    const {notificationIds} = req.body;

    if(!Array.isArray(notificationIds) || notificationIds.length === 0){
        return res.status(400).json('Invalid notification IDs');
    }

    const query = 'SELECT * FROM notifications WHERE user_id = ? AND id IN (?)';

    db.query(query,{user_id, notificationIds} , (error, results) => {
        if(error){
            return res.status(500).json({error: error.message});
        }
        res.status(200).json({message: `${results.affectedRows} notifications marked as read`});
    });
};