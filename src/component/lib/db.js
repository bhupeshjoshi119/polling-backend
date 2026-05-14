import mongoose from 'mongoose';

export async function connectDB() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error('MONGO_URI environment variable is not set');
    }

    // Already connected — skip
    if (mongoose.connection.readyState === 1) {
        return;
    }

    await mongoose.connect(uri, {
        // Serverless ke liye connection pool limit
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });

    console.log('MongoDB connected');
}
