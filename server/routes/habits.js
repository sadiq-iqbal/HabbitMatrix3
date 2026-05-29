import { Router } from 'express';
import { readDb, writeDb } from '../db.js';

const router = Router();

function generateId() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#3b82f6',
];

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// GET /api/habits
router.get('/', (req, res) => {
    const db = readDb();
    res.json(db.habits);
});

// POST /api/habits
router.post('/', (req, res) => {
    const { name, frequency } = req.body;
    if (!name || !frequency) {
        return res.status(400).json({ error: 'name and frequency are required' });
    }
    const db = readDb();
    const habit = {
        id: generateId(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
        archived: false,
        frequency,
        color: getRandomColor(),
    };
    db.habits.push(habit);
    writeDb(db);
    res.status(201).json(habit);
});

// PUT /api/habits/:id
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const idx = db.habits.findIndex((h) => h.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Habit not found' });

    db.habits[idx] = { ...db.habits[idx], ...req.body, id };
    writeDb(db);
    res.json(db.habits[idx]);
});

// DELETE /api/habits/:id
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const exists = db.habits.some((h) => h.id === id);
    if (!exists) return res.status(404).json({ error: 'Habit not found' });

    db.habits = db.habits.filter((h) => h.id !== id);
    db.entries = db.entries.filter((e) => e.habitId !== id);
    writeDb(db);
    res.json({ success: true });
});

export default router;
