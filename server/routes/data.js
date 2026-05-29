import { Router } from 'express';
import { format, subDays } from 'date-fns';
import { Habit, Entry, Settings } from '../db.js';

const router = Router();

// GET /api/data — full export
router.get('/', async (_req, res) => {
    const [habits, entries, settingsDoc] = await Promise.all([
        Habit.find({}, '-_id -__v').lean(),
        Entry.find({}, '-_id -__v').lean(),
        Settings.findOne({ _singleton: 'settings' }, '-_id -__v').lean(),
    ]);

    const today = new Date();
    const settings = settingsDoc ?? {
        theme: 'light',
        startDate: format(subDays(today, 13), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
    };

    res.json({ version: 1, habits, entries, settings });
});

// POST /api/data/import — bulk import
router.post('/import', async (req, res) => {
    const { habits, entries, settings } = req.body;
    if (!Array.isArray(habits) || !Array.isArray(entries)) {
        return res.status(400).json({ error: 'habits and entries arrays are required' });
    }

    await Promise.all([
        Habit.deleteMany({}),
        Entry.deleteMany({}),
    ]);

    if (habits.length) await Habit.insertMany(habits);
    if (entries.length) await Entry.insertMany(entries);

    if (settings) {
        await Settings.findOneAndUpdate(
            { _singleton: 'settings' },
            { $set: settings },
            { upsert: true }
        );
    }

    res.json({ success: true });
});

// DELETE /api/data — clear habits + entries
router.delete('/', async (_req, res) => {
    await Promise.all([
        Habit.deleteMany({}),
        Entry.deleteMany({}),
    ]);
    res.json({ success: true });
});

export default router;
