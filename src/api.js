const BASE = '/api/ideas'

async function parseError(response, fallback) {
  try {
    const body = await response.json()
    if (body && typeof body.error === 'string') return body.error
  } catch {
    // 에러 응답이 JSON 이 아니면 기본 문구를 쓴다.
  }
  return fallback
}

export async function listIdeas(tag) {
  const response = await fetch(tag ? `${BASE}?tag=${encodeURIComponent(tag)}` : BASE)
  if (!response.ok) {
    throw new Error(await parseError(response, '아이디어 목록을 불러오지 못했습니다.'))
  }
  return response.json()
}

export async function createIdea(input) {
  const response = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(await parseError(response, '아이디어를 등록하지 못했습니다.'))
  }
  return response.json()
}

export async function updateIdea(id, changes) {
  const response = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })
  if (!response.ok) {
    throw new Error(await parseError(response, '아이디어를 수정하지 못했습니다.'))
  }
  return response.json()
}

export async function deleteIdea(id) {
  const response = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(await parseError(response, '아이디어를 삭제하지 못했습니다.'))
  }
}
