import { Router } from 'express';
import { readDb, writeDb, } from '../db.js';

const router = Router();

// GET /api/data  — full export
router.get('/', (req, res) => {
    res.json(readDb());
});

// POST /api/data/import  — full import
router.post('/import', (req, res) => {
    const { habits, entries, settings } = req.body;
    if (!Array.isArray(habits) || !Array.isArray(entries)) {
        return res.status(400).json({ error: 'habits and entries arrays are required' });
    }
    const db = readDb();
    writeDb({ version: db.version, habits, entries, settings: settings ?? db.settings });
    res.json({ success: true });
});

// DELETE /api/data  — clear everything
router.delete('/', (req, res) => {
    const db = readDb();
    db.habits = [];
    db.entries = [];
    writeDb(db);
    res.json({ success: true });
});

export default router;
