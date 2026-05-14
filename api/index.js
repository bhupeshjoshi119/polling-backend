import express from 'express';
import cors from 'cors';
import { connectDB } from '../src/component/lib/db.js';
import { pollRouter } from '../src/component/api/poll/routes.js';
import { responseRouter } from '../src/component/api/response/routes.js';

const app = express();
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: (origin, callback) => {
        const allowed = [FRONTEND, 'http://localhost:5173', 'http://localhost:3000'];
        if (!origin || allowed.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));

app.use(express.json());

let dbConnected = false;
app.use(async (req, res, next) => {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
        } catch (err) {
            return res.status(500).json({ message: 'Database connection failed' });
        }
    }
    next();
});

app.get('/', (req, res) => res.json({ message: 'Polling App API is running ✅' }));
app.use('/api/polls', pollRouter);
app.use('/api/polls/:pollId/responses', responseRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

export default app;
