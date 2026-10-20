import express from 'express'
import { initDb, pool } from './db.js'

const PORT = Number(process.env.SERVER_PORT) || 3198

const app = express()
app.use(express.json())

// 목록 조회 — 최신 등록 순
app.get('/api/ideas', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, tag, target, idea, created_at FROM ideas ORDER BY created_at DESC, id DESC',
    )
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

// 등록 — 제목이 비면 400
app.post('/api/ideas', async (req, res, next) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  if (!title) {
    res.status(400).json({ error: '제목을 입력해 주세요.' })
    return
  }

  const trimmed = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null)

  try {
    const { rows } = await pool.query(
      `INSERT INTO ideas (title, tag, target, idea)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, tag, target, idea, created_at`,
      [title, trimmed(req.body?.tag), trimmed(req.body?.target), trimmed(req.body?.idea)],
    )
    res.status(201).json(rows[0])
  } catch (error) {
    next(error)
  }
})

// 삭제 — 없는 id 는 404
app.delete('/api/ideas/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: '잘못된 id 입니다.' })
    return
  }

  try {
    const { rowCount } = await pool.query('DELETE FROM ideas WHERE id = $1', [id])
    if (rowCount === 0) {
      res.status(404).json({ error: '해당 아이디어를 찾을 수 없습니다.' })
      return
    }
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: '서버에서 오류가 발생했습니다.' })
})

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API 서버 실행 중 → http://localhost:${PORT}/api/ideas`)
    })
  })
  .catch((error) => {
    console.error('DB 초기화 실패:', error.message)
    process.exit(1)
  })
