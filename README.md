# forScore Companion

This repository contains:

- `web/` — the production-style web app for uploading files and handing them off to forScore.
- `ios/forScoreCompanion/` — full SwiftUI Xcode project for native iOS companion app.
- `ios-companion-starter/` — earlier lightweight starter reference.

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

## iOS app

- Open `ios/forScoreCompanion/forScoreCompanion.xcodeproj` in Xcode.
- Pair using web-generated code from the web app’s **Link an iOS device** settings section.
- CI build validation is defined at `.github/workflows/ios-build.yml` (macOS runner, `xcodebuild`).
