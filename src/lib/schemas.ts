import { z } from 'zod';

// ── Frequency Schema ──
export const frequencyConfigSchema = z.object({
    type: z.enum(['daily', 'weekly', 'custom']),
    days: z.array(z.number().min(0).max(6)).optional(),
});

// ── Habit Schema ──
export const habitSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(100),
    createdAt: z.string(),
    archived: z.boolean(),
    frequency: frequencyConfigSchema,
    color: z.string(),
});

// ── Entry Schema ──
export const habitEntrySchema = z.object({
    habitId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    completed: z.boolean(),
});

// ── Settings Schema ──
export const settingsSchema = z.object({
    theme: z.enum(['light', 'dark']),
    startDate: z.string(),
    endDate: z.string(),
});

// ── Full Storage Schema ──
export const storageSchema = z.object({
    version: z.number(),
    habits: z.array(habitSchema),
    entries: z.array(habitEntrySchema),
    settings: settingsSchema,
});

// ── Import Validation ──
export const importDataSchema = z.object({
    version: z.number().optional(),
    habits: z.array(habitSchema),
    entries: z.array(habitEntrySchema),
    settings: settingsSchema.optional(),
});
