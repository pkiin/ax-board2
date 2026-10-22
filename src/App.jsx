import { useEffect, useState } from 'react'
import IdeaForm from './IdeaForm.jsx'
import IdeaCard from './IdeaCard.jsx'
import { createIdea, deleteIdea, listIdeas, updateIdea } from './api.js'
import './App.css'

export default function App() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 비어 있으면 전체, 값이 있으면 GET /api/ideas?tag=… 로 거른 목록
  const [tagFilter, setTagFilter] = useState('')

  useEffect(() => {
    let cancelled = false

    listIdeas(tagFilter)
      .then((rows) => {
        if (!cancelled) {
          setIdeas(rows)
          setError('')
        }
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
  }, [tagFilter])

  function changeFilter(tag) {
    if (tag === tagFilter) return
    setLoading(true)
    setTagFilter(tag)
  }

  // 거르는 중이면 그 태그가 붙은 카드만 목록에 남긴다.
  const matchesFilter = (idea) => !tagFilter || idea.tag === tagFilter

  async function addIdea(input) {
    const created = await createIdea(input)
    if (matchesFilter(created)) setIdeas((prev) => [created, ...prev])
    setError('')
  }

  async function editIdea(id, changes) {
    const updated = await updateIdea(id, changes)
    setIdeas((prev) =>
      matchesFilter(updated)
        ? prev.map((idea) => (idea.id === id ? updated : idea))
        : prev.filter((idea) => idea.id !== id),
    )
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

  const countLabel = tagFilter ? `#${tagFilter} 아이디어` : '아이디어'

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-title-row">
          <h1>우리 팀 AX 보드-A</h1>
          <span className="idea-count" aria-live="polite">
            {loading
              ? '불러오는 중…'
              : ideas.length === 0
                ? tagFilter
                  ? `#${tagFilter} 아이디어가 없어요`
                  : '아직 아이디어가 없어요'
                : `${countLabel} ${ideas.length}개`}
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
          {tagFilter ? (
            <span className="filter-chip">
              #{tagFilter} 태그만 보는 중
              <button type="button" onClick={() => changeFilter('')}>
                전체 보기
              </button>
            </span>
          ) : (
            <span className="board-hint">카드의 태그를 누르면 그 태그만 볼 수 있어요</span>
          )}
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="empty">아이디어를 불러오는 중입니다…</p>
        ) : ideas.length === 0 ? (
          <p className="empty">
            {tagFilter
              ? `#${tagFilter} 태그가 붙은 아이디어가 없습니다.`
              : '아직 등록된 아이디어가 없습니다. 첫 아이디어를 추가해 보세요.'}
          </p>
        ) : (
          <ul className="card-list">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onEdit={editIdea}
                onDelete={removeIdea}
                onTagClick={changeFilter}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
