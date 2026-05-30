import { Router } from 'express';
import { JournalEntry } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/journal — all journal entries for the logged-in user
router.get('/', async (req, res) => {
    const entries = await JournalEntry.find(
        { userId: req.userId },
        '-_id -__v -userId'
    ).lean();
    res.json(entries);
});

// POST /api/journal — create or update entry for a given date (upsert)
router.post('/', async (req, res) => {
    const { date, mood, energyLevel, note } = req.body;

    if (!date || !mood || !energyLevel) {
        return res.status(400).json({ error: 'date, mood, and energyLevel are required' });
    }
    if (mood < 1 || mood > 5) {
        return res.status(400).json({ error: 'mood must be between 1 and 5' });
    }

    const entry = await JournalEntry.findOneAndUpdate(
        { userId: req.userId, date },
        { $set: { mood, energyLevel, note: note ?? '' } },
        { new: true, upsert: true, projection: '-_id -__v -userId' }
    ).lean();

    res.status(200).json(entry);
});

export default router;
