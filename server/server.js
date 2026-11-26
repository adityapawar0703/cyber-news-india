import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB, isDBConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy headers on Render, Railway, Heroku, Cloudflare
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server, Render health probes)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.includes(cleanOrigin) ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploaded editorial images
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '7d',
  })
);

// Root route (for Render default health check probes and browser visits)
app.get('/', (_req, res) => {
  const clientDist = path.resolve(__dirname, '../client/dist');
  if (fs.existsSync(clientDist)) {
    return res.sendFile(path.join(clientDist, 'index.html'));
  }
  res.json({
    status: 'ok',
    service: 'Cyber India News API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: isDBConnected() ? 'connected' : 'connecting_or_disconnected',
    endpoints: {
      health: '/api/health',
      articles: '/api/articles',
      categories: '/api/articles/categories',
    },
    timestamp: new Date().toISOString(),
  });
});

// Dedicated health checks for Render / Kubernetes / Docker
app.get(['/api/health', '/healthz'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'cyber-india-news-api',
    environment: process.env.NODE_ENV || 'development',
    database: isDBConnected() ? 'connected' : 'connecting_or_disconnected',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/newsletter', newsletterRoutes);

// If client/dist exists (unified single-service deployment), serve SPA
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

// Start HTTP server immediately on 0.0.0.0 so Render port detection succeeds
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API] Cyber India News server is live on http://0.0.0.0:${PORT}`);
  console.log(`[API] Health check available at: http://0.0.0.0:${PORT}/api/health`);

  // Connect to MongoDB asynchronously after HTTP listener is bound
  connectDB();
});

// Graceful shutdown on SIGTERM / SIGINT
function handleShutdown(signal) {
  console.log(`\n[API] Received ${signal}. Closing HTTP server gracefully...`);
  server.close(() => {
    console.log('[API] HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
