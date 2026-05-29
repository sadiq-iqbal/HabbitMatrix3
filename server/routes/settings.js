import { Router } from 'express';
import { format, subDays } from 'date-fns';
import { Settings } from '../db.js';

const router = Router();

async function getOrCreate() {
    const today = new Date();
    let doc = await Settings.findOne({ _singleton: 'settings' });
    if (!doc) {
        doc = await Settings.create({
            _singleton: 'settings',
            theme: 'light',
            startDate: format(subDays(today, 13), 'yyyy-MM-dd'),
            endDate: format(today, 'yyyy-MM-dd'),
        });
    }
    return doc;
}

// GET /api/settings
router.get('/', async (_req, res) => {
    const doc = await getOrCreate();
    res.json({ theme: doc.theme, startDate: doc.startDate, endDate: doc.endDate });
});

// PUT /api/settings
router.put('/', async (req, res) => {
    const doc = await getOrCreate();
    Object.assign(doc, req.body);
    await doc.save();
    res.json({ theme: doc.theme, startDate: doc.startDate, endDate: doc.endDate });
});

export default router;
