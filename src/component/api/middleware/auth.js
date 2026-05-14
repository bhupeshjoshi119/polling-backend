import jwt from 'jsonwebtoken';
import { jwtSecret } from '../../lib/dotenv.js';

/**
 * Tries to extract user from Bearer token.
 * Sets req.user if valid, otherwise req.user = null.
 * Does NOT block the request — use requireAuth for that.
 */
export function extractUser() {
    return function (req, res, next) {
        const header = req.headers['authorization'];
        if (!header || !header.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = header.split(' ')[1];
        if (!token) {
            req.user = null;
            return next();
        }

        try {
            const payload = jwt.verify(token, jwtSecret());
            req.user = payload;   // { id: '...' }
        } catch {
            req.user = null;
        }
        next();
    };
}

/**
 * Blocks unauthenticated requests.
 * Must be used AFTER extractUser().
 */
export function requireAuth() {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        next();
    };
}
