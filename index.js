import { createServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import express from 'express';
import cors from 'cors';

import { port, frontendUrl } from './src/component/lib/dotenv.js';
import { connectDB } from './src/component/lib/db.js';
import { pollRouter } from './src/component/api/poll/routes.js';
import { responseRouter } from './src/component/api/response/routes.js';

const PORT = port();
const FRONTEND = frontendUrl();

const app = express();
const httpServer = createServer(app);

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
    cors: {
        origin: [FRONTEND, 'http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Attach io to app so controllers can emit events
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client joins a poll room to receive live analytics updates
    socket.on('join:poll', (pollId) => {
        socket.join(`poll:${pollId}`);
        console.log(`Socket ${socket.id} joined poll:${pollId}`);
    });

    socket.on('leave:poll', (pollId) => {
        socket.leave(`poll:${pollId}`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [FRONTEND, 'http://localhost:5173', 'http://localhost:3000'];
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
}));

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Polling App API is running' });
});

app.use('/api/polls', pollRouter);
app.use('/api/polls/:pollId/responses', responseRouter);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Polling API running at http://localhost:${PORT}`);
        console.log(`Socket.io ready`);
    });
});
