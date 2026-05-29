import { Router } from 'express';
import { Habit, Entry } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function generateId() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const COLORS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#3b82f6',
];

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// GET /api/habits
router.get('/', async (req, res) => {
    const habits = await Habit.find({ userId: req.userId }, '-_id -__v').lean();
    res.json(habits);
});

// POST /api/habits
router.post('/', async (req, res) => {
    const { name, frequency } = req.body;
    if (!name || !frequency) {
        return res.status(400).json({ error: 'name and frequency are required' });
    }
    const habit = await Habit.create({
        id: generateId(),
        userId: req.userId,
        name: name.trim(),
        createdAt: new Date().toISOString(),
        archived: false,
        frequency,
        color: getRandomColor(),
    });
    const plain = habit.toObject();
    delete plain._id;
    delete plain.__v;
    res.status(201).json(plain);
});

// PUT /api/habits/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updated = await Habit.findOneAndUpdate(
        { id, userId: req.userId },
        { $set: req.body },
        { new: true, projection: '-_id -__v' }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'Habit not found' });
    res.json(updated);
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const result = await Habit.deleteOne({ id, userId: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Habit not found' });
    await Entry.deleteMany({ habitId: id, userId: req.userId });
    res.json({ success: true });
});

export default router;
