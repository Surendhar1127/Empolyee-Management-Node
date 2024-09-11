require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res,next) => {
    const header = req.headers['authorization'];
    const secretKey = process.env.JWT_SECRET;

    if (!header) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Authentication header is not found' }));
        return false;
    }

    const token = header.split(' ')[1];

    if (!token) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Token not found' }));
        return false;
    }

    try {
        const validate = jwt.verify(token, secretKey);
        req.user = validate;
        //return true;
        next();
    } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid Token' }));
        return false;
    }
};

module.exports = authenticateToken;

