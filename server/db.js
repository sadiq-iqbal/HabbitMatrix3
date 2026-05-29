import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { format, subDays } from 'date-fns';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');

function getDefaultData() {
    const today = new Date();
    return {
        version: 1,
        habits: [],
        entries: [],
        settings: {
            theme: 'light',
            startDate: format(subDays(today, 13), 'yyyy-MM-dd'),
            endDate: format(today, 'yyyy-MM-dd'),
        },
    };
}

export function readDb() {
    if (!existsSync(DATA_FILE)) {
        const defaults = getDefaultData();
        writeFileSync(DATA_FILE, JSON.stringify(defaults, null, 2));
        return defaults;
    }
    try {
        return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    } catch {
        return getDefaultData();
    }
}

export function writeDb(data) {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
