# iOS Companion Starter (SwiftUI)

This starter is an optional native companion that can be used after the web MVP.

## Goal

Enable an iOS app to:

1. Fetch uploaded files from the web app backend.
2. Present them in a native list.
3. Trigger the iOS share sheet so users can select **forScore** directly.

## Why this exists

Web apps can’t silently import files into other iOS apps due to sandboxing. A native app can provide a tighter handoff UX by using `UIActivityViewController` / document interaction mechanisms.

## Setup (on macOS + Xcode)

1. Create a new iOS App project in Xcode (`forScoreCompanionStarter`).
2. Copy these Swift files into your Xcode target.
3. Set your backend URL in `ShareToForScoreView`.
4. Add networking permissions if using non-HTTPS local dev (`NSAppTransportSecurity` exceptions for local testing only).
5. Run on a real iPhone/iPad and verify the share sheet includes forScore.

## Notes

- This is intentionally lightweight starter code, not a full production iOS app.
- Use your own auth/security layer before distributing.
