import { Router } from 'express';
import { readDb, writeDb } from '../db.js';

const router = Router();

// GET /api/settings
router.get('/', (req, res) => {
    const db = readDb();
    res.json(db.settings);
});

// PUT /api/settings
router.put('/', (req, res) => {
    const db = readDb();
    db.settings = { ...db.settings, ...req.body };
    writeDb(db);
    res.json(db.settings);
});

export default router;
