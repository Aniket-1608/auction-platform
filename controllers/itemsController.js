const db = require('../services/db');

exports.getAllItems = (req, res) => {
    db.query('SELECT * FROM items', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(200).json(results);
    });
};

exports.getItemById = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM items WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Items not found" });
        }
        res.status(200).json(results[0]);
    });
};

exports.createItem = (req, res) => {
    const { id, name, description, starting_price, image_url, end_time } = req.body;
    const owner_id = req.user.id;
    const query = 'INSERT INTO items (id, name, description, starting_price, image_url, end_time, owner_id) VALUES (? ,? ,?, ?, ?, ?, ?)';
    const values = [id, name, description, starting_price, image_url, end_time, owner_id];

    db.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ id: results.insertId, ...req.body });
    });
};

exports.updateItem = (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description, starting_price, image_url, end_time, owner_id } = req.body;

    // First, verify the owner of the item
    const verifyOwnerQuery = 'SELECT owner_id FROM items WHERE id = ?';
    db.query(verifyOwnerQuery, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const item = results[0];
        if (item.owner_id != owner_id) {
            return res.status(403).json({ message: 'Owner Mismatch. You are not allowed to update the item.' });
        }

        // If owner is verified, proceed to update the item
        const updateQuery = 'UPDATE items SET name = ?, description = ?, starting_price = ?, image_url = ?, end_time = ? WHERE id = ?';
        const values = [name, description, starting_price, image_url, end_time, id];

        db.query(updateQuery, values, (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Item not found' });
            }

            // Return the updated item details
            res.status(200).json({ id, name, description, starting_price, image_url, end_time, owner_id });
        });
    });
};


exports.deleteItem = (req, res) => {
    const id = req.params.id;
    const owner_id = req.user.id;
    console.log(owner_id);
    // First, fetch the item to check the owner
    db.query('SELECT owner_id FROM items WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        const item = results[0];
        if (item.owner_id !== owner_id) {
            return res.status(403).json({ message: 'Owner Mismatch. You are not allowed to delete the item.' });
        }

        // Owner matches, proceed to delete the item
        db.query('DELETE FROM items WHERE id = ?', [id], (error) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.status(200).json({ message: 'Item deleted' });
        });
    });
};

// Search and filter for auction items
exports.searchItem = (req, res) => {
    let { startingPrice, endTime } = req.body;

    // Initialize SQL query and values array
    let query = 'SELECT * FROM items WHERE 1=1';
    let values = [];

    if (startingPrice) {
        query += ' AND starting_price >= ?';
        values.push(startingPrice);
    }

    if (endTime) {
        query += ' AND end_time > ?';
        values.push(endTime);
    }

    // Execute SQL query
    db.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
};

// Get items with pagination
exports.getAllItemsPagination = (req, res) => {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const offset = (page - 1) * limit;

    const query = 'SELECT * FROM items LIMIT ? OFFSET ?';
    db.query(query, [limit, offset], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
};

