import { Router } from 'express';
import { Entry } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/entries?habitId=&startDate=&endDate=
router.get('/', async (req, res) => {
    const filter = { userId: req.userId };
    if (req.query.habitId) filter.habitId = req.query.habitId;
    if (req.query.startDate || req.query.endDate) {
        filter.date = {};
        if (req.query.startDate) filter.date.$gte = req.query.startDate;
        if (req.query.endDate) filter.date.$lte = req.query.endDate;
    }
    const entries = await Entry.find(filter, '-_id -__v').lean();
    res.json(entries);
});

// POST /api/entries/toggle  { habitId, date }
router.post('/toggle', async (req, res) => {
    const { habitId, date } = req.body;
    if (!habitId || !date) {
        return res.status(400).json({ error: 'habitId and date are required' });
    }

    const existing = await Entry.findOne({ habitId, date, userId: req.userId });
    let entry;
    if (existing) {
        existing.completed = !existing.completed;
        await existing.save();
        entry = existing.toObject();
    } else {
        const created = await Entry.create({ habitId, date, completed: true, userId: req.userId });
        entry = created.toObject();
    }

    delete entry._id;
    delete entry.__v;
    res.json(entry);
});

export default router;
