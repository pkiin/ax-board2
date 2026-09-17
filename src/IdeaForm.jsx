import { useState } from 'react'

const EMPTY = { title: '', target: '', idea: '' }

export default function IdeaForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const title = form.title.trim()
    const target = form.target.trim()
    const idea = form.idea.trim()

    if (!title || !target || !idea) {
      setError('제목, 대상 업무, AI 활용 아이디어를 모두 입력해 주세요.')
      return
    }

    onAdd({
      id: crypto.randomUUID(),
      title,
      target,
      idea,
      createdAt: new Date().toISOString(),
    })
    setForm(EMPTY)
    setError('')
  }

  return (
    <form className="idea-form" onSubmit={handleSubmit}>
      <h2>새 아이디어 추가</h2>

      <label className="field">
        <span>제목</span>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="예) 주간 보고서 자동 초안 작성"
          maxLength={80}
        />
      </label>

      <label className="field">
        <span>대상 업무</span>
        <input
          name="target"
          value={form.target}
          onChange={handleChange}
          placeholder="예) 영업팀 주간 실적 보고"
          maxLength={80}
        />
      </label>

      <label className="field">
        <span>AI 활용 아이디어</span>
        <textarea
          name="idea"
          value={form.idea}
          onChange={handleChange}
          placeholder="예) CRM 데이터를 요약해 보고서 초안을 생성하고 담당자가 검토만 수행"
          rows={4}
          maxLength={500}
        />
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="submit">
        카드 추가
      </button>
    </form>
  )
}
