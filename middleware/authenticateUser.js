const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECRET_KEY;

//Middleware to check the role of the user
exports.checkRole = (requiredRole) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }

        jwt.verify(token, jwtSecretKey, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Token is not valid' });
            }

            if (user.role !== requiredRole) {
                return res.status(403).json({ message: 'Access denied: insufficient role' });
            }

            // Attach user object to request
            req.user = user;
            next();
        });
    };
};