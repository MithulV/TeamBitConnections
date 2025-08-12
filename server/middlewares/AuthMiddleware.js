const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Get token from "Authorization" header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
                                            
        // Store decoded payload in req.user
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
