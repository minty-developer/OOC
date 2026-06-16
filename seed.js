import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function setup() {
    const db = await open({ filename: 'openings.db', driver: sqlite3.Database });
    await db.exec('CREATE TABLE IF NOT EXISTS openings (eco TEXT, name TEXT, moves TEXT)');

    const files = ['a.tsv', 'b.tsv', 'c.tsv', 'd.tsv', 'e.tsv'];
    for (const file of files) {
        const data = fs.readFileSync('opnings/' + file, 'utf-8');
        const rows = data.split('\n').slice(1);
        for (const row of rows) {
            const [eco, name, pgn] = row.split('\t');
            if (eco) await db.run('INSERT INTO openings VALUES (?, ?, ?)', [eco, name, pgn]);
        }
    }
    console.log('데이터 삽입 완료!');
}
setup();