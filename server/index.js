import express from 'express';
import cors from 'cors';
import habitsRouter from './routes/habits.js';
import entriesRouter from './routes/entries.js';
import settingsRouter from './routes/settings.js';
import dataRouter from './routes/data.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5000' }));
app.use(express.json());

app.use('/api/habits', habitsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/data', dataRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, 'localhost', () => {
    console.log(`[server] Express API running at http://localhost:${PORT}`);
});
