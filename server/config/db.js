import mongoose from 'mongoose';

let isConnected = false;
let retryTimer = null;

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('\n================================================================');
    console.warn('[DB WARNING] MONGO_URI environment variable is not defined!');
    console.warn('[DB WARNING] Using local fallback: mongodb://127.0.0.1:27017/cyber_india_news');
    if (process.env.NODE_ENV === 'production') {
      console.warn('[DB ACTION REQUIRED] In Render Dashboard -> Environment Variables:');
      console.warn('[DB ACTION REQUIRED] Add MONGO_URI with your MongoDB Atlas connection string.');
      console.warn('[DB ACTION REQUIRED] Make sure 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.');
    }
    console.warn('================================================================\n');
  }

  const connectionString = uri || 'mongodb://127.0.0.1:27017/cyber_india_news';

  const tryConnect = async (attempt = 1) => {
    try {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      console.log(`[DB] Connecting to MongoDB (attempt ${attempt})...`);
      const conn = await mongoose.connect(connectionString, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      });

      isConnected = true;
      console.log(`[DB] Connected successfully to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      isConnected = false;
      console.error(`\n[DB ERROR] MongoDB connection failed (attempt ${attempt}):`, err.message);

      if (process.env.NODE_ENV === 'production') {
        console.error('[DB HELP] Common Render deployment causes:');
        console.error('  1. MONGO_URI not set in Render environment variables.');
        console.error('  2. IP Access: In MongoDB Atlas -> Network Access, ensure 0.0.0.0/0 is added.');
        console.error('  3. Database user/password incorrect in the MongoDB connection string.\n');
      }

      // Do NOT process.exit(1) — keep the HTTP server alive so Render health checks pass,
      // and retry connecting in the background
      const nextDelay = Math.min(10000, 3000 * attempt);
      console.log(`[DB] Retrying connection in ${nextDelay / 1000}s...`);
      retryTimer = setTimeout(() => tryConnect(attempt + 1), nextDelay);
    }
  };

  return tryConnect(1);
}
