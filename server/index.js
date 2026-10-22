import express from 'express'
import { initDb, pool } from './db.js'

const PORT = Number(process.env.SERVER_PORT) || 3198
const COLUMNS = 'id, title, tag, target, idea, created_at'

const app = express()
app.use(express.json())

const trimmed = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null)

// 경로의 :id 를 정수로 바꾼다. 정수가 아니면 null.
function parseId(value) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

// 목록 조회 — 최신 등록 순. ?tag=… 가 있으면 그 태그와 정확히 같은 카드만.
app.get('/api/ideas', async (req, res, next) => {
  const tag = trimmed(req.query.tag)

  try {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM ideas
       WHERE $1::text IS NULL OR tag = $1
       ORDER BY created_at DESC, id DESC`,
      [tag],
    )
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

// 등록 — 제목이 비면 400
app.post('/api/ideas', async (req, res, next) => {
  const title = trimmed(req.body?.title)
  if (!title) {
    res.status(400).json({ error: '제목을 입력해 주세요.' })
    return
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO ideas (title, tag, target, idea)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNS}`,
      [title, trimmed(req.body?.tag), trimmed(req.body?.target), trimmed(req.body?.idea)],
    )
    res.status(201).json(rows[0])
  } catch (error) {
    next(error)
  }
})

// 제목·태그 수정 — 보낸 항목만 바꾼다. 제목을 보냈는데 비어 있으면 400, 없는 id 는 404
app.patch('/api/ideas/:id', async (req, res, next) => {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: '잘못된 id 입니다.' })
    return
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const sets = []
  const values = [id]

  if ('title' in body) {
    const title = trimmed(body.title)
    if (!title) {
      res.status(400).json({ error: '제목을 입력해 주세요.' })
      return
    }
    values.push(title)
    sets.push(`title = $${values.length}`)
  }

  if ('tag' in body) {
    // 빈 문자열이나 null 을 보내면 태그를 지운다.
    values.push(trimmed(body.tag))
    sets.push(`tag = $${values.length}`)
  }

  if (sets.length === 0) {
    res.status(400).json({ error: '수정할 항목(title, tag)을 보내 주세요.' })
    return
  }

  try {
    const { rows } = await pool.query(
      `UPDATE ideas SET ${sets.join(', ')} WHERE id = $1 RETURNING ${COLUMNS}`,
      values,
    )
    if (rows.length === 0) {
      res.status(404).json({ error: '해당 아이디어를 찾을 수 없습니다.' })
      return
    }
    res.json(rows[0])
  } catch (error) {
    next(error)
  }
})

// 삭제 — 없는 id 는 404
app.delete('/api/ideas/:id', async (req, res, next) => {
  const id = parseId(req.params.id)
  if (id === null) {
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
  // 본문이 올바른 JSON 이 아니면 express.json() 이 던지는 오류 — 클라이언트 잘못이므로 400
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({ error: '요청 본문이 올바른 JSON 이 아닙니다.' })
    return
  }
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
