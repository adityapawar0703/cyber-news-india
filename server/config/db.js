import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cyber_india_news';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[DB] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}
