const jwt = require('jsonwebtoken');
const User = require('../models/User');
const connectDB = require('./db');

export async function protect(req, res) {
    await connectDB();
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123');
            req.user = await User.findById(decoded.id).select('-password');
            return true;
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
            return false;
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return false;
    }
    return false;
}
