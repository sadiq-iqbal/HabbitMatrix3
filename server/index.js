import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './db.js';
import authRouter from './routes/auth.js';
import habitsRouter from './routes/habits.js';
import entriesRouter from './routes/entries.js';
import settingsRouter from './routes/settings.js';
import dataRouter from './routes/data.js';
import journalRouter from './routes/journal.js';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5000';

// ES modules - get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '10mb' }));

// Serve static React build files
app.use(express.static(path.join(__dirname, '../dist')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/data', dataRouter);
app.use('/api/journal', journalRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message 
  });
});

// Serve React app for all non-API routes (SPA fallback) - MUST be last
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Database connection and server startup
connectDb()
  .then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[server] Express API running at http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
