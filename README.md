# Sevento — frontend

React 19 + TypeScript + Vite 8. Backend alohida repoda: [sevento_back](https://github.com/shaxobiddindev/sevento_back) (REST `/api/v1/` + WebSocket `/ws/v1/`).

## Holat

| Bosqich | Holat |
|---|---|
| 1. Skelet: API klient (refresh, xatolar), auth (cookie), layout, login, foydalanuvchilar/rollar/nuqtalar/tizim sozlamalari/audit sahifalari | ✅ |
| 2. Realtime klient (ticket, backoff, ping/pong, invalidate xaritasi, holat indikatori, polling fallback) | ✅ |
| 3. Katalog (tovarlar, narxlar, kategoriya daraxti, ma'lumotnomalar), valyuta kursi, valyutalar | ✅ |
| 4. Kirim va ombor sahifalari | ⏳ keyingi |

Tuzilma va qoidalar: [docs/architecture.md](docs/architecture.md). Umumiy hujjatlar (arxitektura, ER, hodisalar, WebSocket, huquqlar, bosqichlar) — `sevento_back/docs/`.

## Ishga tushirish

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173 — /api va /ws → VITE_PROXY_TARGET (default http://localhost:8000)
```

Backend lokal ishlab turishi kerak (`sevento_back` README). Boshlang'ich login: backend `.env` dagi `BOOTSTRAP_ADMIN_*`.

## Skriptlar

| Skript | Nima qiladi |
|---|---|
| `npm run gen:api` | OpenAPI sxemadan TypeScript turlari → `src/shared/api/schema.d.ts` (manba: `OPENAPI_URL` yoki `../sevento_back/docs/api/openapi.yaml`) |
| `npm run lint` / `format:check` / `typecheck` | ESLint (feature chegaralari qoidasi bilan), Prettier, `tsc -b` |
| `npm test` | Vitest + Testing Library + MSW |
| `npm run build` | production build → `dist/` |
| `docker build -t sevento-front .` | Nginx image (`/api`, `/ws` → `backend:8000`); compose backend repoda |

## Qoidalar (qisqacha)

- API so'rovlari faqat `features/*/api/` da, TanStack Query hooklari orqali; komponentda `fetch` yo'q.
- API turlari qo'lda yozilmaydi — `schema.d.ts` generatsiya, `src/shared/api/types.ts` faqat alias.
- Access token faqat xotirada; refresh httpOnly cookie da; sahifa yangilanganda `POST /auth/refresh/` bilan tiklanadi.
- Boshqa feature faqat `@/features/<nom>` (index.ts) orqali; `shared/` features ni import qilmaydi (ESLint tekshiradi).
- Matnlar `src/shared/i18n/locales/uz/*.json` da; kodda qattiq matn yo'q.
- WebSocket faqat bildirishnoma kanali: xabar → `src/shared/realtime/invalidation.ts` xaritasi → TanStack kesh invalidate; ma'lumot doim REST dan. Uzilganda `meta.pollWhenOffline` so'rovlar har 30 s qayta o'qiladi.
