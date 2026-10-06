import { useEffect, useState } from 'react'

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function IdeaCard({ idea, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return

    function onKeyDown(event) {
      if (event.key === 'Escape') setConfirming(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [confirming])

  return (
    <li className="card">
      <div className="card-top">
        <h3 className="card-title">{idea.title}</h3>
        <button
          type="button"
          className="delete"
          onClick={() => setConfirming(true)}
          aria-label={`${idea.title} 삭제`}
        >
          삭제
        </button>
      </div>

      <dl className="card-body">
        <dt>대상 업무</dt>
        <dd>{idea.target}</dd>
        <dt>AI 활용 아이디어</dt>
        <dd className="card-idea">{idea.idea}</dd>
      </dl>

      {idea.createdAt && <p className="card-date">{formatDate(idea.createdAt)} 등록</p>}

      {confirming && (
        <div className="confirm-backdrop" onClick={() => setConfirming(false)}>
          <div
            className="confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`confirm-title-${idea.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h4 id={`confirm-title-${idea.id}`} className="confirm-title">
              아이디어를 삭제할까요?
            </h4>
            <p className="confirm-desc">
              &lsquo;{idea.title}&rsquo; 아이디어가 삭제됩니다. 삭제한 내용은 되돌릴 수 없습니다.
            </p>
            <div className="confirm-actions">
              <button type="button" className="confirm-cancel" onClick={() => setConfirming(false)}>
                취소
              </button>
              <button
                type="button"
                className="confirm-delete"
                autoFocus
                onClick={() => onDelete(idea.id)}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  )
}
