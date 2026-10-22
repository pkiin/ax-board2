import pg from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL 이 설정되지 않았습니다. .env 파일을 확인해 주세요.')
}

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// 서버가 뜰 때 테이블이 없으면 만들어 둔다. 마이그레이션 도구 없이 실습하기 위한 구성.
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ideas (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      tag        TEXT,
      target     TEXT,
      idea       TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}
