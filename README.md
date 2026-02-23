# forScore Companion

This repository contains:

- `web/` — the production-style web app for uploading files and handing them off to forScore.
- `ios-companion-starter/` — an optional SwiftUI starter for a native companion app.

## Quick start (web app)

```bash
cd web
npm install
npm run dev
```

Open: `http://localhost:3002`

## Supported formats

- PDF (`.pdf`)
- forScore package (`.4sc`)
- forScore setlist package (`.4ss`)

## Available scripts

From `web/`:

- `npm run dev` — starts app on port 3002
- `npm run lint` — ESLint
- `npm run test:unit` — Vitest unit tests
- `npm run test:e2e` — Playwright end-to-end tests
- `npm run build` — production build
