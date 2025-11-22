const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    console.log(' ');
    console.log('🛡️  ===== AUTH MIDDLEWARE START =====');
    console.log('🛡️  Path:', req.path);
    console.log('🛡️  Method:', req.method);
    console.log('🛡️  Headers:', req.headers.authorization ? 'Has Authorization header' : 'No Authorization header');

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ AUTH: No token provided');
        console.log('🛡️  ===== AUTH MIDDLEWARE END (401) =====');
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🛡️  Token length:', token.length);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('✅ AUTH: Token valid for user:', decoded.userId);
        console.log('🛡️  ===== AUTH MIDDLEWARE END (SUCCESS) =====');
        next();
    } catch (err) {
        console.log('❌ AUTH: Token invalid:', err.message);
        console.log('🛡️  ===== AUTH MIDDLEWARE END (403) =====');
        return res.status(403).json({ error: 'Неверный или просроченный токен' });
    }
}

module.exports = authMiddleware;