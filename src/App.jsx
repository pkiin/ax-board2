import { useEffect, useState } from 'react'
import IdeaForm from './IdeaForm.jsx'
import IdeaCard from './IdeaCard.jsx'
import { createIdea, deleteIdea, listIdeas } from './api.js'
import './App.css'

export default function App() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    listIdeas()
      .then((rows) => {
        if (!cancelled) setIdeas(rows)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function addIdea(input) {
    const created = await createIdea(input)
    setIdeas((prev) => [created, ...prev])
    setError('')
  }

  async function removeIdea(id) {
    try {
      await deleteIdea(id)
      setIdeas((prev) => prev.filter((idea) => idea.id !== id))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-title-row">
          <h1>우리 팀 AX 보드-A</h1>
          <span className="idea-count" aria-live="polite">
            {loading
              ? '불러오는 중…'
              : ideas.length === 0
                ? '아직 아이디어가 없어요'
                : `아이디어 ${ideas.length}개`}
          </span>
        </div>
        <p className="page-desc">
          업무에 AI를 어떻게 적용할지 아이디어를 모아 보세요. 입력한 내용은 서버 DB에 저장되어 함께
          보는 사람 모두에게 보입니다.
        </p>
      </header>

      <IdeaForm onAdd={addIdea} />

      <section className="board" aria-label="아이디어 목록">
        <div className="board-head">
          <h2>등록된 아이디어</h2>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="empty">아이디어를 불러오는 중입니다…</p>
        ) : ideas.length === 0 ? (
          <p className="empty">아직 등록된 아이디어가 없습니다. 첫 아이디어를 추가해 보세요.</p>
        ) : (
          <ul className="card-list">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onDelete={removeIdea} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
