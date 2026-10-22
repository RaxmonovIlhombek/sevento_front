# Sevento — frontend

React + TypeScript + Vite. Backend alohida repoda: [sevento_back](https://github.com/shaxobiddindev/sevento_back) (REST `/api/v1/` + WebSocket `/ws/v1/`).

## Holat

**0-bosqich — reja.** Kod hali yo'q.

- [docs/architecture.md](docs/architecture.md) — papka tuzilishi, API klient, auth, realtime, formalar, i18n, PWA/Tauri.
- Umumiy hujjatlar (arxitektura, ER, hodisalar, WebSocket, huquqlar, bosqichlar) — `sevento_back/docs/`.

## Ishga tushirish (1-bosqichdan keyin)

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173, /api va /ws → http://localhost:8000
npm run gen:api      # backend OpenAPI sxemasidan turlar
```
