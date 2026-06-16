import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as paths from 'path';

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 현재 파일의 경로를 절대 경로로 변환하여 __dirname 생성
const __filename = fileURLToPath(import.meta.url);
const __dirname = paths.dirname(__filename);

const dbPromise = open({
    filename: paths.join(__dirname, 'openings.db'),
    driver: sqlite3.Database
});

// 미들웨어 설정
app.use(cors()); // 테스트 및 개발 단계를 위해 모든 도메인 허용
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/favicon.ico', () => res.status(204).json({ "message": "No Content" }))

/**
 * [GET] 체스 오프닝 북 데이터 조회 API
 * URL: /api/openings
 */
app.get('/api/openings', async (req, res, next) => {
    try {
        // DB에서 오프닝 목록 쿼리 실행
        const rows = db.prepare('SELECT * FROM openings').all();
        res.json(rows);
    } catch (error) {
        // 에러 발생 시 중앙 에러 처리 미들웨어로 던지기
        next(error);
    }
});

// 중앙 에러 처리 미들웨어
app.use((err, req, res, next) => {
    console.error("🚨 서버 에러 발생:", err.stack);
    res.status(500).json({ error: "Internal Server Error - 데이터베이스 또는 서버 내부 오류가 발생했습니다." });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 체스 API 서버가 http://localhost:${PORT} 에서 달리는 중...`);
});