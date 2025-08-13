const db = require('../src/config/db');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email, "password:", password);
    try {
        const [rows] = await db.query(
            'SELECT * FROM login WHERE email = ? AND password = ?',
            [email, password]
        );
        
        if (rows.length > 0) {
            const user = rows[0];

            // JWT payload
            const payload = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '200m' });

            // Send both token & user details
            res.status(200).json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

module.exports = { loginUser };
