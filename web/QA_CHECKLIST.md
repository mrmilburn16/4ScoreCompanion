# QA Checklist — forScore Companion Web App

This checklist verifies the key interactive controls requested in the implementation plan.

## Environment

- App URL: `http://localhost:3002`
- Browser automation: Playwright (Chromium)

## Browser matrix notes

- Desktop Chrome (Linux CI / local): automated via Playwright ✅
- Desktop Safari (macOS): manual smoke test recommended (upload, download, copy link)
- Mobile Safari on iOS: manual smoke test recommended (upload flow + share sheet to forScore)

## Button-by-button results

- [x] Upload area click opens picker  
  - Covered by Playwright test: `exercises checklist modal and key controls` (`Choose Files` file chooser event).
- [x] Drag/drop or picker queues files  
  - Covered by Playwright tests using file input selection and queue status assertions.
- [x] **Upload queued files** works  
  - Covered by Playwright tests (`uploads and lists a PDF`, `shows validation error...`).
- [x] **Retry failed** works  
  - Covered by Playwright unsupported-file test (failed → queued transition).
- [x] **Queue Remove** works  
  - Covered by Playwright queue-control test removing queued item.
- [x] **Clear completed** works  
  - Covered by Playwright queue-control test (uploaded item removed from queue).
- [x] **Cancel upload** button state works  
  - Covered by Playwright queue-control test (disabled when no active upload).
- [x] **Download** works  
  - Covered by Playwright download event assertion.
- [x] **Share** works/falls back gracefully  
  - Covered by Playwright warning-path assertion in non-shareable browser environment.
- [x] **Copy Link** works  
  - Covered by Playwright clipboard-permission test and success toast assertion.
- [x] **Remove** works  
  - Covered by Playwright remove + success toast assertion.
- [x] Dialog open/close actions work (`How to import`, `Open import checklist`, `Got it`, Escape/backdrop close support)  
  - Covered by Playwright checklist modal test and component behavior.
- [x] **Refresh** button works  
  - Covered by Playwright checklist test invoking refresh control.

## Regression command set

```bash
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

## iOS real-device handoff script (manual)

1. Open app on iPhone/iPad Safari.
2. Upload a small PDF using **Choose Files**.
3. Tap **Upload queued files**.
4. In file list, tap **Share** (or **Download**).
5. In iOS share sheet:
   - choose **forScore**, or
   - tap **More** and add forScore to favorites first.
6. Confirm file appears in forScore library.
