const db = require('../services/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecretKey = process.env.JWT_SECRET_KEY;

//create a JWT token
function generateAccessToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        role: user._role
    }

    const options = { expiresIn: '3 days' };

    return jwt.sign(payload, jwtSecretKey, options);
}


//register a new user
exports.registerUser = async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, _password, email, _role) VALUES (?, ?, ?, ?)';
        const values = [username, hashedPassword, email, role];

        db.query(query, values, (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.status(201).json({ id: results.id, username, email, role: role });
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

};

//login the registered user
exports.loginUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const query = 'SELECT * FROM users WHERE username = ?';
        db.query(query, [username], async (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.length === 0) {
                return res.status(401).json({ error: 'Invalid Username or Password!' });
            }
            const user = results[0];

            //Check the role of the user
            if (user._role != role) {
                return res.status(403).json({
                    message: "Please make sure you are logging in from the right portal.",
                    success: false,
                });
            }

            //compare the provided password with the hashed password in the database
            const isMatch = await bcrypt.compare(password, user._password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            //call the function to generate JWT token
            const token = generateAccessToken(user);

            res.status(200).json({ token });
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

};

// get the profile of the logged in user
exports.getProfile = (req, res) => {
    try {
        const email = req.body.email;

        const query = 'SELECT id, username, email, _role, created_at FROM users WHERE email = ?';
        db.query(query, [email], (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'user not found!' });
            }
            res.status(200).json(results[0]);
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};