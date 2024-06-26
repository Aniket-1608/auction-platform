const db = require('../services/db');

//retrieve all bids for a speciifc item
exports.getItemBids = (req, res) => {
    const itemid = req.params.itemid;

    const query = 'SELECT * FROM bids WHERE item_id = ? ORDER BY created_at DESC';

    db.query(query, [itemid], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(200).json(results);
    });
};

//place a new bid on a specific item
exports.placeItemBids = (req, res) => {
    const itemid = parseInt(req.params.itemid);
    const bidamount = req.body.bidamount;

    const user = req.user;
    const userid = user.id;

    //Insert the new bid into the database
    const query = 'INSERT INTO bids (item_id, user_id, bid_amount) VALUES (?, ?, ?)';
    const values = [itemid, userid, bidamount];

    db.query(query, values, (error) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ itemid, userid, bidamount });
    });
};

