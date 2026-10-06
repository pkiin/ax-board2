import { useEffect, useState } from 'react'
import IdeaForm from './IdeaForm.jsx'
import IdeaCard from './IdeaCard.jsx'
import { loadIdeas, saveIdeas } from './storage.js'
import './App.css'

export default function App() {
  const [ideas, setIdeas] = useState(loadIdeas)

  useEffect(() => {
    saveIdeas(ideas)
  }, [ideas])

  function addIdea(idea) {
    setIdeas((prev) => [idea, ...prev])
  }

  function removeIdea(id) {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id))
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-title-row">
          <h1>우리 팀 AX 보드-A</h1>
          <span className="idea-count" aria-live="polite">
            {ideas.length === 0 ? '아직 아이디어가 없어요' : `아이디어 ${ideas.length}개`}
          </span>
        </div>
        <p className="page-desc">
          업무에 AI를 어떻게 적용할지 아이디어를 모아 보세요. 입력한 내용은 이 브라우저에 저장됩니다.
        </p>
      </header>

      <IdeaForm onAdd={addIdea} />

      <section className="board" aria-label="아이디어 목록">
        <div className="board-head">
          <h2>등록된 아이디어</h2>
        </div>

        {ideas.length === 0 ? (
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
