import { useState } from 'react'

const EMPTY = { title: '', tag: '', target: '', idea: '' }

export default function IdeaForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const title = form.title.trim()
    const target = form.target.trim()
    const idea = form.idea.trim()

    if (!title || !target || !idea) {
      setError('제목, 대상 업무, AI 활용 아이디어를 모두 입력해 주세요.')
      return
    }

    setSaving(true)
    try {
      await onAdd({ title, tag: form.tag.trim(), target, idea })
      setForm(EMPTY)
      setError('')
    } catch (err) {
      // 서버가 400(제목 누락) 등으로 거부하면 그 문구를 그대로 보여 준다.
      setError(err.message)
    } finally {
      setSaving(false)
    }
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
        <span>태그 (선택)</span>
        <input
          name="tag"
          value={form.tag}
          onChange={handleChange}
          placeholder="예) 보고서"
          maxLength={30}
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

      <button type="submit" className="submit" disabled={saving}>
        {saving ? '저장 중…' : '카드 추가'}
      </button>
    </form>
  )
}
