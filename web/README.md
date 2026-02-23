# forScore Companion Web App

Upload sheet files (PDF, 4SC, 4SS) and send them into forScore using iOS share flows.

## Local development

```bash
cd web
npm install
npm run dev
```

App URL: `http://localhost:3002`

## Features

- Drag-and-drop and file-picker uploads
- Upload queue with explicit controls:
  - Upload queued files
  - Retry failed uploads
  - Cancel in-flight upload
  - Clear completed queue entries
- Supported formats: PDF, 4SC, 4SS
- Upload validation (type, size, count)
- Toast-based status notifications
- Route/global error boundaries for resilient failure handling
- File library with:
  - Search, type filtering, and sorting
  - Download
  - Native share (when browser supports it)
  - Copy link
  - Remove
- iOS forScore import guidance checklist
- iOS companion pairing settings:
  - generate short-lived pairing codes
  - view/revoke linked devices
  - mobile token exchange and authenticated file API

## Why import is user-mediated on iOS

Browsers cannot silently inject files into other iOS apps due to sandboxing.  
This app implements the best practical flow:

1. Upload file in web app.
2. Download or Share file on iOS.
3. Choose forScore in the iOS share sheet.

## iOS manual verification

Use a real iPhone/iPad for final handoff validation:

1. Open the app in Safari.
2. Upload a PDF (or 4SC/4SS).
3. Use Share/Download from the file row.
4. Pick forScore from the share sheet.

## Testing

```bash
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

Manual/interaction QA checklist: `./QA_CHECKLIST.md`

Playwright coverage includes desktop interaction flows and a mobile viewport sanity pass.

## API routes

- `GET /api/files` — list stored files
- `POST /api/files/upload` — upload one or more files (`files` form-data key)
- `GET /api/files/:id/download` — download file
- `DELETE /api/files/:id` — delete file
- `POST /api/pairing/code` — generate pairing code for iOS app
- `POST /api/pairing/exchange` — exchange pairing code for device token
- `GET /api/pairing/devices` — list linked devices
- `DELETE /api/pairing/devices/:id` — revoke linked device
- `GET /api/mobile/files` — token-authenticated file list for iOS app

## Optional iOS companion starter

See `../ios-companion-starter/README.md` for native app starter details.
