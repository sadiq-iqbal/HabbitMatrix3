import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('[server] MONGODB_URI environment variable is not set');
    process.exit(1);
}

export async function connectDb() {
    try {
        await mongoose.connect(MONGODB_URI, { dbName: 'habitmatrix' });
        console.log('[server] Connected to MongoDB');
    } catch (err) {
        console.error('[server] MongoDB connection error:', err.message);
        process.exit(1);
    }
}

// ── Schemas & Models ────────────────────────────────────────────────────────

const frequencySchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['daily', 'weekly', 'custom'], required: true },
        days: { type: [Number], default: undefined },
    },
    { _id: false }
);

const habitSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    createdAt: { type: String, required: true },
    archived: { type: Boolean, default: false },
    frequency: { type: frequencySchema, required: true },
    color: { type: String, required: true },
});

const entrySchema = new mongoose.Schema({
    habitId: { type: String, required: true },
    date: { type: String, required: true },
    completed: { type: Boolean, default: false },
});
entrySchema.index({ habitId: 1, date: 1 }, { unique: true });

const settingsSchema = new mongoose.Schema({
    _singleton: { type: String, default: 'settings', unique: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
});

export const Habit = mongoose.model('Habit', habitSchema);
export const Entry = mongoose.model('Entry', entrySchema);
export const Settings = mongoose.model('Settings', settingsSchema);
