// Load .env file only in local development (not on Vercel — env vars come from dashboard)
try {
    // Node 20.6+ built-in — works locally, silently fails on Vercel (no .env file there)
    process.loadEnvFile();
} catch(e) {
    // Ignore — on Vercel env vars are injected directly
}

export function port(){
    const PORT=process.env.PORT || 8000;
    return PORT;
}

export function mongoUri(){
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pollsdb';
    return MONGO_URI;
}

export function jwtSecret(){
    const JWT_SECRET = process.env.JWT_SECRET || 'myjwtsecret';
    return JWT_SECRET;
}

export function frontendUrl(){
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    return FRONTEND_URL;
}
