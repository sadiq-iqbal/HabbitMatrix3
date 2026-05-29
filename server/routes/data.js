import { Router } from 'express';
import { format, addDays } from 'date-fns';
import { Habit, Entry, Settings } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/data — full export for current user
router.get('/', async (req, res) => {
    const [habits, entries, settingsDoc] = await Promise.all([
        Habit.find({ userId: req.userId }, '-_id -__v').lean(),
        Entry.find({ userId: req.userId }, '-_id -__v').lean(),
        Settings.findOne({ userId: req.userId }, '-_id -__v').lean(),
    ]);

    const today = new Date();
    const settings = settingsDoc ?? {
        theme: 'light',
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(addDays(today, 29), 'yyyy-MM-dd'),
    };

    res.json({ version: 1, habits, entries, settings });
});

// POST /api/data/import — bulk import for current user
router.post('/import', async (req, res) => {
    const { habits, entries, settings } = req.body;
    if (!Array.isArray(habits) || !Array.isArray(entries)) {
        return res.status(400).json({ error: 'habits and entries arrays are required' });
    }

    await Promise.all([
        Habit.deleteMany({ userId: req.userId }),
        Entry.deleteMany({ userId: req.userId }),
    ]);

    const uid = req.userId;
    if (habits.length) await Habit.insertMany(habits.map((h) => ({ ...h, userId: uid })));
    if (entries.length) await Entry.insertMany(entries.map((e) => ({ ...e, userId: uid })));

    if (settings) {
        await Settings.findOneAndUpdate(
            { userId: uid },
            { $set: settings },
            { upsert: true }
        );
    }

    res.json({ success: true });
});

// DELETE /api/data — clear habits + entries for current user
router.delete('/', async (req, res) => {
    await Promise.all([
        Habit.deleteMany({ userId: req.userId }),
        Entry.deleteMany({ userId: req.userId }),
    ]);
    res.json({ success: true });
});

export default router;
