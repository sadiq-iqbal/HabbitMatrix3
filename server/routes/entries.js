import { Router } from 'express';
import { readDb, writeDb } from '../db.js';

const router = Router();

// GET /api/entries?startDate=&endDate=&habitId=
router.get('/', (req, res) => {
    const db = readDb();
    let entries = db.entries;

    if (req.query.habitId) {
        entries = entries.filter((e) => e.habitId === req.query.habitId);
    }
    if (req.query.startDate) {
        entries = entries.filter((e) => e.date >= req.query.startDate);
    }
    if (req.query.endDate) {
        entries = entries.filter((e) => e.date <= req.query.endDate);
    }

    res.json(entries);
});

// POST /api/entries/toggle  { habitId, date }
router.post('/toggle', (req, res) => {
    const { habitId, date } = req.body;
    if (!habitId || !date) {
        return res.status(400).json({ error: 'habitId and date are required' });
    }

    const db = readDb();
    const idx = db.entries.findIndex(
        (e) => e.habitId === habitId && e.date === date
    );

    let entry;
    if (idx !== -1) {
        db.entries[idx] = { ...db.entries[idx], completed: !db.entries[idx].completed };
        entry = db.entries[idx];
    } else {
        entry = { habitId, date, completed: true };
        db.entries.push(entry);
    }

    writeDb(db);
    res.json(entry);
});

export default router;
