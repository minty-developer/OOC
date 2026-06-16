import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as paths from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = paths.dirname(__filename);

// ✅ Fix 1: DB 초기화 함수 분리
async function initDB() {
    return open({
        filename: paths.join(__dirname, 'openings.db'),
        driver: sqlite3.Database
    });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Fix 2: (req, res) 파라미터 누락 수정 + sendStatus로 단순화
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// ✅ Fix 3: db.prepare → db.all (sqlite 패키지 API), await 추가, app.locals.db 참조
app.get('/api/openings', async (req, res, next) => {
    try {
        const rows = await app.locals.db.all('SELECT * FROM openings');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    console.error("🚨 서버 에러 발생:", err.stack);
    res.status(500).json({ error: "Internal Server Error - 데이터베이스 또는 서버 내부 오류가 발생했습니다." });
});

// ✅ Fix 4: DB 연결 완료 후에 서버 시작, app.locals에 db 인스턴스 저장
initDB()
    .then(db => {
        app.locals.db = db;
        app.listen(PORT, () => {
            console.log(`🚀 체스 API 서버가 https://ooc-epvp.onrender.com (PORT:${process.env.PORT}) 에서 달리는 중...`);
        });
    })
    .catch(err => {
        console.error("❌ DB 초기화 실패:", err);
        process.exit(1);
    });