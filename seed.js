import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
    // DB 연결
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    // 읽어올 tsv 파일 목록
    const files = ['a.tsv', 'b.tsv', 'c.tsv', 'd.tsv', 'e.tsv'];

    try {
        for (const file of files) {
            console.log(`⏳ ${file} 파일 읽는 중...`);
            const data = fs.readFileSync(file, 'utf-8');

            // 줄바꿈으로 나누고 첫 줄(헤더) 제외
            const rows = data.trim().split('\n').slice(1);

            // MySQL에 넣을 2차원 배열 형태로 변환
            const values = rows.map(row => {
                // tsv 파일 구조: eco, name, pgn(moves)
                const [eco, name, pgn] = row.split('\t');
                return [eco, name, pgn];
            });

            // 벌크 인서트 (한 번에 뭉텅이로 삽입하여 속도 극대화)
            if (values.length > 0) {
                await pool.query(
                    'INSERT INTO openings (eco, name, moves) VALUES ?',
                    [values]
                );
                console.log(`✅ ${file} - ${values.length}개 오프닝 삽입 완료!`);
            }
        }
        console.log('🎉 모든 체스 오프닝 데이터가 DB에 성공적으로 들어갔습니다!');
    } catch (error) {
        console.error('🚨 데이터 삽입 중 에러 발생:', error);
    } finally {
        pool.end(); // DB 연결 종료
    }
}

seedDatabase();