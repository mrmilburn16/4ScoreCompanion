# forScore Companion iOS App (SwiftUI)

This folder contains a full SwiftUI Xcode project:

- `forScoreCompanion.xcodeproj`
- App target: `forScoreCompanion`

## What it does

- Pair device with web app using pairing code
- Persist mobile auth token in Keychain
- Fetch files from `/api/mobile/files`
- Share downloaded files to forScore via iOS share sheet
- Settings for backend URL and sign-out

## Local setup

1. Open `forScoreCompanion.xcodeproj` in Xcode.
2. In the app, enter your web backend URL (e.g. `http://localhost:3002/` on simulator with proper networking setup).
3. Generate a pairing code in the web app settings.
4. Enter pairing code in iOS onboarding to link device.
5. Open file row and tap **Share to forScore**.

## Notes

- This project is designed to match the web app visual language (dark gradients, pill metadata, strong hierarchy).
- Pairing/token APIs currently target the local backend implemented in `web/`.
