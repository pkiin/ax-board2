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

export default function IdeaCard({ idea, onEdit, onDelete, onTagClick }) {
  const [confirming, setConfirming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ title: '', tag: '' })
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!confirming) return

    function onKeyDown(event) {
      if (event.key === 'Escape') setConfirming(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [confirming])

  function startEdit() {
    setDraft({ title: idea.title, tag: idea.tag ?? '' })
    setEditError('')
    setEditing(true)
  }

  function handleDraftChange(event) {
    const { name, value } = event.target
    setDraft((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()

    const title = draft.title.trim()
    if (!title) {
      setEditError('제목을 입력해 주세요.')
      return
    }

    setSaving(true)
    try {
      await onEdit(idea.id, { title, tag: draft.tag.trim() })
      setEditing(false)
    } catch (err) {
      // 서버가 400(빈 제목)·404(이미 삭제됨) 등으로 거부하면 그 문구를 보여 준다.
      setEditError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="card">
      {editing ? (
        <form
          className="card-edit"
          onSubmit={handleSave}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setEditing(false)
          }}
        >
          <label className="field">
            <span>제목</span>
            <input
              name="title"
              value={draft.title}
              onChange={handleDraftChange}
              maxLength={80}
              autoFocus
            />
          </label>
          <label className="field">
            <span>태그 (선택)</span>
            <input name="tag" value={draft.tag} onChange={handleDraftChange} maxLength={30} />
          </label>

          {editError && (
            <p className="error" role="alert">
              {editError}
            </p>
          )}

          <div className="card-edit-actions">
            <button type="button" className="confirm-cancel" onClick={() => setEditing(false)}>
              취소
            </button>
            <button type="submit" className="submit" disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        </form>
      ) : (
        <div className="card-top">
          <div className="card-heading">
            <h3 className="card-title">{idea.title}</h3>
            {idea.tag && (
              <button
                type="button"
                className="card-tag"
                onClick={() => onTagClick(idea.tag)}
                aria-label={`#${idea.tag} 태그만 보기`}
              >
                #{idea.tag}
              </button>
            )}
          </div>
          <div className="card-actions">
            <button
              type="button"
              className="edit"
              onClick={startEdit}
              aria-label={`${idea.title} 수정`}
            >
              수정
            </button>
            <button
              type="button"
              className="delete"
              onClick={() => setConfirming(true)}
              aria-label={`${idea.title} 삭제`}
            >
              삭제
            </button>
          </div>
        </div>
      )}

      <dl className="card-body">
        <dt>대상 업무</dt>
        <dd>{idea.target}</dd>
        <dt>AI 활용 아이디어</dt>
        <dd className="card-idea">{idea.idea}</dd>
      </dl>

      {idea.created_at && <p className="card-date">{formatDate(idea.created_at)} 등록</p>}

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
