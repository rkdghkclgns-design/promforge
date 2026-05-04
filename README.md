# PromForge — AI 게임 제작 커뮤니티

Node.js (Express) + Supabase Postgres + Supabase Edge Functions(Gemini 프록시) 로 동작하는 커뮤니티 사이트입니다.

## 구성

```
promforge-app/
├─ server/                 # Express 백엔드 (ES modules)
│  ├─ index.mjs           # 진입점, 미들웨어, 라우터 마운트
│  ├─ config.mjs          # 환경변수 로드
│  ├─ db.mjs              # pg pool
│  ├─ auth.mjs            # bcrypt + JWT 쿠키 + 권한 미들웨어
│  ├─ routes-auth.mjs     # /api/auth/{signup,login,logout,me}
│  ├─ routes-content.mjs  # /api/{boards,posts,studies,showcases,subscribe}
│  ├─ routes-admin.mjs    # /api/admin/* (admin 전용)
│  └─ routes-gemini.mjs   # /api/gemini/search → Edge Function 프록시
├─ public/                 # 정적 프런트 (React via Babel-Standalone)
│  ├─ index.html
│  ├─ js/api.js           # 백엔드 호출 클라이언트
│  ├─ js/auth-override.jsx # 실제 가입/로그인/관리자 가드
│  └─ ...                  # 디자인 번들 컴포넌트들
├─ scripts/
│  └─ bootstrap-admin.mjs # admin 계정(보장) 셋업
├─ .github/workflows/      # CI + 배포
└─ .env.example
```

## 빠른 시작

```bash
cd promforge-app
cp .env.example .env
# .env 의 DATABASE_URL, JWT_SECRET 채우기

npm install
npm run bootstrap   # admin 계정 비밀번호를 .env 의 ADMIN_PASSWORD 로 (재)설정
npm start           # http://localhost:3000
```

## 기본 계정

- **관리자**: `admin` / `1124`
- 그 외는 사이트에서 직접 가입.

## 인증 / 권한

- 가입은 `/api/auth/signup` (Zod 스키마 검증, 사용자명 3-32자/영숫자, 비번 4자 이상).
- 로그인 성공 시 `pf_token` httpOnly 쿠키에 JWT 발급 (7일).
- 비밀번호는 `bcryptjs` 로 해시 저장.
- 권한:
  - 비로그인: 게시판/스터디/쇼케이스/도구 메타데이터 열람 가능. 본문은 미리보기.
  - 로그인 사용자: 본문/댓글/글쓰기/프롬프트 저장.
  - **관리자**(role=`admin`): `/admin` 라우트 + `/api/admin/*` 엔드포인트.

## Gemini

`GEMINI_API_KEY` 는 Supabase 프로젝트의 **Edge Function 시크릿**에 저장되어 있고, Node 백엔드는 키를 직접 보유하지 않습니다. `/api/gemini/search` 가 Edge Function `gemini-search` 를 호출하는 프록시 역할을 합니다.

```
브라우저 → Node /api/gemini/search → Edge Function gemini-search → Gemini API
                                            ↑ Deno.env GEMINI_API_KEY
```

Edge Function 은 `verify_jwt: true` 로 배포되어 있고, Node 가 `SUPABASE_ANON_KEY` 로 호출합니다.

## 데이터베이스 (Supabase Postgres)

마이그레이션 두 개가 적용되어 있습니다:
- `promforge_schema_init` — `pf_users`, `pf_boards`, `pf_posts`, `pf_studies`, `pf_showcases`, `pf_subscribers`, `pf_audit_logs`
- `promforge_seed` — 8개 보드 + admin 사용자 자리

다른 앱과 충돌하지 않게 모든 테이블은 `pf_` 프리픽스를 사용하며, 서버 측에서 권한을 강제하므로 RLS 는 비활성화되어 있습니다.

## API 요약

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/signup` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/logout` | public |
| GET  | `/api/auth/me` | user |
| GET  | `/api/boards` | public |
| GET  | `/api/posts` | public (본문은 user) |
| GET  | `/api/posts/:id` | public (본문은 user) |
| POST | `/api/posts` | user |
| GET  | `/api/studies` | public |
| GET  | `/api/showcases` | public |
| POST | `/api/subscribe` | public |
| GET  | `/api/admin/overview` | admin |
| GET  | `/api/admin/users` | admin |
| GET  | `/api/admin/audit` | admin |
| GET  | `/api/admin/subscribers` | admin |
| POST | `/api/gemini/search` | user |

## CI/CD

`.github/workflows/ci.yml` 이 푸시/PR 마다 lint + test 를 돌리고, `deploy.yml` 은 `main` 브랜치 푸시 시 (선택) 호스팅 대상에 배포합니다.

## 보안

- helmet + CSP 설정 (Babel Standalone 호환).
- `express-rate-limit` 으로 로그인/가입/Gemini 호출 제한.
- 비밀번호 bcrypt(cost 10).
- JWT httpOnly 쿠키 + sameSite=lax, 프로덕션에서 secure.
- 모든 사용자 입력 Zod 스키마 검증.
