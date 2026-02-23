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
- File library with:
  - Download
  - Native share (when browser supports it)
  - Copy link
  - Remove
- iOS forScore import guidance checklist

## Why import is user-mediated on iOS

Browsers cannot silently inject files into other iOS apps due to sandboxing.  
This app implements the best practical flow:

1. Upload file in web app.
2. Download or Share file on iOS.
3. Choose forScore in the iOS share sheet.

## Testing

```bash
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

## API routes

- `GET /api/files` — list stored files
- `POST /api/files/upload` — upload one or more files (`files` form-data key)
- `GET /api/files/:id/download` — download file
- `DELETE /api/files/:id` — delete file

## Optional iOS companion starter

See `../ios-companion-starter/README.md` for native app starter details.
