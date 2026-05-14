/**
 * Vercel Serverless Entry Point
 *
 * Vercel pe hum httpServer.listen() nahi karte.
 * Vercel khud request handle karta hai aur app ko call karta hai.
 * Isliye sirf `app` export karte hain.
 *
 * Socket.io serverless mein kaam nahi karta (persistent connection chahiye).
 * Isliye yahan Socket.io nahi hai — baaki sab APIs kaam karengi.
 */

import express from 'express';
import cors from 'cors';

import { connectDB } from '../src/component/lib/db.js';
import { pollRouter } from '../src/component/api/poll/routes.js';
import { responseRouter } from '../src/component/api/response/routes.js';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Vercel pe FRONTEND_URL env variable set karenge
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            FRONTEND,
            'http://localhost:5173',
            'http://localhost:3000',
        ];
        // No origin = Postman/curl — allow karo
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
}));

app.use(express.json());

// ─── DB Connect ───────────────────────────────────────────────────────────────
// Serverless mein har request pe connection check karo
// Mongoose internally connection pool manage karta hai
let isConnected = false;

async function ensureDB() {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
}

// Middleware — har request se pehle DB connect karo
app.use(async (req, res, next) => {
    try {
        await ensureDB();
        next();
    } catch (err) {
        res.status(500).json({ message: 'Database connection failed' });
    }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Polling App API is running ✅' });
});

app.use('/api/polls', pollRouter);
app.use('/api/polls/:pollId/responses', responseRouter);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

export default app;
