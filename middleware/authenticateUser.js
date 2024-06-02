const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECRET_KEY;

//verify the web token
function verifyAccessToken(token){
    try {
        const decoded = jwt.verify(token, jwtSecretKey);
        return {success: true, data: decoded};
    } catch (error) {
        return {success: false, error: error.message};
    }
}

//Middleware to check the presence of the JWT Token
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({ error: 'Access token is missing' });
    }

    const result = verifyAccessToken(token);

    if(!result.success){
        return res.status(403).json({error: error.message});
    }
    req.user = result.data;
    next();
}

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