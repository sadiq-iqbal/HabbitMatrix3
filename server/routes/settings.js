import { Router } from 'express';
import { format, addDays } from 'date-fns';
import { Settings } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

async function getOrCreate(userId) {
    const today = new Date();
    let doc = await Settings.findOne({ userId });
    if (!doc) {
        doc = await Settings.create({
            userId,
            theme: 'light',
            startDate: format(today, 'yyyy-MM-dd'),
            endDate: format(addDays(today, 29), 'yyyy-MM-dd'),
        });
    }
    return doc;
}

// GET /api/settings
router.get('/', async (req, res) => {
    const doc = await getOrCreate(req.userId);
    res.json({ theme: doc.theme, startDate: doc.startDate, endDate: doc.endDate });
});

// PUT /api/settings
router.put('/', async (req, res) => {
    const doc = await getOrCreate(req.userId);
    Object.assign(doc, req.body);
    await doc.save();
    res.json({ theme: doc.theme, startDate: doc.startDate, endDate: doc.endDate });
});

export default router;
