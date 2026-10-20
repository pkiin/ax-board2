# AX 아이디어 보드

업무에 AI를 어떻게 적용할지 아이디어를 카드로 모아 두는 웹앱입니다. React + Vite 프론트엔드와 Express + PostgreSQL 백엔드로 구성되며, 등록한 아이디어는 서버 DB에 저장되어 같은 DB를 보는 모든 사람에게 보입니다.

## 기능

- **아이디어 추가** — 제목 / 태그(선택) / 대상 업무 / AI 활용 아이디어를 입력해 카드로 등록합니다. 태그를 뺀 세 항목이 채워져야 등록되고, 서버도 제목이 비면 `400` 으로 거부합니다. 새 카드는 목록 맨 위에 쌓입니다.
- **아이디어 개수 표시** — 화면 제목 옆에 `아이디어 N개` 배지를 띄웁니다. 카드를 추가·삭제하면 숫자가 바로 바뀌고, 한 건도 없으면 `아직 아이디어가 없어요` 로 바뀝니다.
- **목록 조회와 삭제** — 서버에서 최신순으로 받아 목록으로 보여 주고, 카드마다 `삭제` 버튼으로 개별 삭제합니다.
- **서버 저장** — 모든 변경이 PostgreSQL 의 `ideas` 테이블에 반영되므로 브라우저나 기기를 바꿔도 같은 목록이 보입니다.

## 준비

```bash
npm install
cp .env.example .env    # 본인 계정에 맞게 고치기
```

`.env` 는 커밋되지 않습니다(`.gitignore`). 계정이 `user99` 라면 다음과 같이 적습니다.

```
DATABASE_URL=postgresql:///user99?host=/var/run/postgresql
SERVER_PORT=3199
```

백엔드 포트는 **프론트 포트(`$PORT`) + 100** 규칙을 씁니다. `user99` → 프론트 3099, 백엔드 3199.

## 실행

```bash
npm run dev:all         # 백엔드 + 프론트 한 번에
```

따로 띄우려면 터미널 두 개에서,

```bash
npm run dev:server      # Express, http://localhost:3199
PORT=3099 npm run dev   # Vite,    http://localhost:3099
```

Vite 는 `/api` 요청을 백엔드 포트로 프록시하므로 브라우저는 프론트 주소 하나만 보면 됩니다. `PORT` 를 생략하면 Vite 기본값(5173)을 씁니다.

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev:all` | 백엔드 + 프론트 동시 실행 |
| `npm run dev` | 프론트 개발 서버 (HMR) |
| `npm run dev:server` | 백엔드 API 서버 (`--watch` 자동 재시작) |
| `npm run build` | `dist/` 로 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm run lint` | Oxlint 검사 |

## 확인 방법

브라우저에서 `http://localhost:3099` 를 열고 카드를 추가·삭제한 뒤 새로고침하면 목록이 그대로 남아 있습니다. API 를 직접 확인할 때는,

```bash
curl http://localhost:3099/api/ideas                      # 프록시 경유 목록 조회
curl -X POST http://localhost:3099/api/ideas \
  -H 'Content-Type: application/json' \
  -d '{"title":"테스트","tag":"샘플","target":"대상 업무","idea":"활용 아이디어"}'
curl -X POST http://localhost:3099/api/ideas \
  -H 'Content-Type: application/json' -d '{"title":""}'   # 400 + 오류 메시지
curl -X DELETE http://localhost:3099/api/ideas/1          # 204
psql -c 'SELECT * FROM ideas ORDER BY id;'                # DB 에서 직접 확인
```

## API

| 메서드 | 경로 | 설명 | 응답 |
| --- | --- | --- | --- |
| `GET` | `/api/ideas` | 전체 목록 (최신순) | `200` + 배열 |
| `POST` | `/api/ideas` | 등록. 본문 `{ title, tag?, target?, idea? }` | `201` + 생성된 행 / 제목이 비면 `400` |
| `DELETE` | `/api/ideas/:id` | 삭제 | `204` / 없는 id 는 `404` / 숫자가 아니면 `400` |

## 프로젝트 구조

```
server/
├── index.js        Express 앱과 라우트
└── db.js           pg Pool, 시작 시 테이블 생성

src/
├── main.jsx        진입점
├── App.jsx         상태 보유, 목록 렌더링, API 호출
├── IdeaForm.jsx    입력 폼과 유효성 검사
├── IdeaCard.jsx    카드 표시와 삭제 버튼
├── api.js          fetch 래퍼 (목록/등록/삭제)
├── index.css       전역 스타일과 색상 토큰
└── App.css         화면 스타일

.env                DATABASE_URL, SERVER_PORT (커밋 제외)
.env.example        .env 샘플
vite.config.js      /api → 백엔드 프록시
```

## 데이터 저장 방식

서버가 시작할 때 `ideas` 테이블이 없으면 만듭니다.

```sql
CREATE TABLE IF NOT EXISTS ideas (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  tag        TEXT,
  target     TEXT,
  idea       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`DATABASE_URL` 은 비밀번호 없이 Unix 도메인 소켓(`/var/run/postgresql`)으로 접속하므로 실습 서버에서 바로 동작합니다. `.env` 가 없거나 `DATABASE_URL` 이 비어 있으면 서버가 안내 메시지를 남기고 종료합니다.

## 기술 스택

React 19, Vite 8, Express 5, PostgreSQL 16 (`pg`), 순수 CSS (외부 UI 라이브러리 없음).
