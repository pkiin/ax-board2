# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 안내입니다.

## 프로젝트 개요

AX 아이디어 보드: 업무별 AI 활용 아이디어를 카드로 등록·조회·수정·삭제하고 태그로 거르는 웹 앱입니다.

```
브라우저 ──▶ Vite + React ($PORT) ──/api 프록시──▶ Express 백엔드 ($PORT + 100) ──▶ PostgreSQL (ideas 테이블)
```

- 프런트: Vite + React 19 (`src/`)
  - `App.jsx` 목록·개수 배지·태그 필터, `IdeaForm.jsx` 등록 폼, `IdeaCard.jsx` 카드(수정·삭제), `api.js` fetch 래퍼
- 백엔드: Express 5 + `pg` (`server/`)
  - `index.js` 라우트, `db.js` 커넥션 풀과 테이블 생성(`initDb`)
- DB: 실습 서버 PostgreSQL, 계정별 DB (`.env`의 `DATABASE_URL`)

## 개발 서버 실행 (중요)

공용 개발 서버라 여러 사용자가 동시에 서버를 띄웁니다. **포트는 반드시 계정별 `$PORT` 기준입니다.**

```bash
npm run dev:all   # 백엔드 + 프런트 함께 실행
```

- 프런트 포트는 셸의 `$PORT`(예: user98 → 3098), 백엔드 포트는 `.env`의 `SERVER_PORT`로 `$PORT + 100`(예: 3198)입니다.
- 3000, 5173, 8080 같은 기본 포트를 임의로 쓰지 않습니다. 다른 사용자의 서버와 부딪힙니다.
- 이미 떠 있는 서버를 끌 때는 본인이 띄운 프로세스만 끕니다(`pkill node` 같은 일괄 종료 금지).
- `.env`는 커밋하지 않습니다. 처음 설정할 때는 `.env.example`을 복사해 계정에 맞게 고칩니다.

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev:all` | 백엔드 + 프런트 동시 실행 |
| `npm run dev` | 프런트만 (Vite, HMR) |
| `npm run dev:server` | 백엔드만 (`--watch` 자동 재시작) |
| `npm run build` | `dist/`로 빌드 |
| `npm run lint` | Oxlint 검사 |

테스트 프레임워크는 없습니다. 변경 후에는 `npm run lint`, `npm run build`를 통과시키고, API는 `curl`로, DB는 `psql`로 직접 확인합니다(예시는 `README.md`의 "확인 방법").

## API

| 메서드 | 주소 | 요청 바디 | 성공 |
| --- | --- | --- | --- |
| `GET` | `/api/ideas?tag=…` | 없음 (`tag`는 선택, 정확히 일치) | `200` + 배열(최신순) |
| `POST` | `/api/ideas` | `{ title, tag?, target?, idea? }` | `201` + 생성된 행 |
| `PATCH` | `/api/ideas/:id` | `{ title?, tag? }` 중 하나 이상, `tag: ""`는 태그 삭제 | `200` + 수정된 행 |
| `DELETE` | `/api/ideas/:id` | 없음 | `204` |

- 실패 응답은 항상 `{ error: "한국어 메시지" }` 형식입니다. 프런트 `api.js`의 `parseError`가 이 문구를 그대로 화면에 보여 줍니다.
- 응답 필드는 DB 행 그대로 `{ id, title, tag, target, idea, created_at }`(snake_case)입니다. 조회 컬럼은 `server/index.js`의 `COLUMNS` 한 곳에서 관리하므로, 필드를 추가하면 `COLUMNS`와 프런트에서 쓰는 곳(`IdeaCard.jsx` 등)을 함께 고칩니다.
- SQL은 항상 `$1, $2 …` 파라미터 바인딩을 씁니다. 사용자 입력을 문자열로 이어 붙이지 않습니다.

## 작업 규칙

- UI 문구, 주석, 커밋 메시지는 한국어로 작성합니다.
- 테이블 구조를 바꾸면 기존 데이터가 있는 DB에서도 동작하도록 `server/db.js`의 `initDb`에 `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` 등 이전 방법을 함께 작성합니다(`CREATE TABLE IF NOT EXISTS`는 이미 있는 테이블을 바꾸지 않습니다).
- 프런트와 백엔드의 입력 검증 규칙(필수값, 길이)은 함께 맞춥니다.
  - 현재 프런트: 제목·대상 업무·아이디어 필수, 길이 제한 제목 80 / 태그 30 / 대상 업무 80 / 아이디어 500(`maxLength`)
  - 현재 백엔드: 제목만 필수, 길이 검사 없음 → 검증을 손볼 때 이 차이를 맞춥니다.
- 새 의존성은 꼭 필요할 때만 추가합니다.
- 기능을 추가·변경하면 `README.md`의 기능 목록과 API 표도 함께 고칩니다.

## Git 규칙

- main 브랜치에 직접 commit · push 하지 않는다
- 작업 전 main을 최신으로 받고 새 브랜치에서 시작한다
- 브랜치 이름: feat/내용, fix/내용
- 커밋 메시지: "feat: 한국어 설명" 형식
- PR 본문에 관련 Issue(Closes #번호)와 확인 방법을 적는다
- 충돌이 나면 임의로 해결하지 말고 양쪽 내용을 설명한 뒤 멈춘다
