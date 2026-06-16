import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise'; // 비동기(Promise) 버전 사용
import { fileURLToPath } from 'url';
import * as paths from 'path';

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 현재 파일의 경로를 절대 경로로 변환하여 __dirname 생성
const __filename = fileURLToPath(import.meta.url);
const __dirname = paths.dirname(__filename);

// 커넥션 풀 생성 (연결 효율 극대화)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 미들웨어 설정
app.use(cors()); // 테스트 및 개발 단계를 위해 모든 도메인 허용
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * [GET] 체스 오프닝 북 데이터 조회 API
 * URL: /api/openings
 */
app.get('/api/openings', async (req, res, next) => {
    try {
        // DB에서 오프닝 목록 쿼리 실행
        const [rows] = await pool.query('SELECT name, eco, moves FROM openings ORDER BY id DESC');

        // 프론트엔드로 JSON 배열 반환
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