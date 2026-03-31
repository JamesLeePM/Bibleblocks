# BibleBlocks — App Store preparation

## Already in the repo

- **Privacy manifest** (`ios/App/App/PrivacyInfo.xcprivacy`): no tracking; `UserDefaults` reason `CA92.1` (Capacitor preferences).
- **Export compliance** (`ITSAppUsesNonExemptEncryption` = `false` in `Info.plist`) — standard for apps that only use HTTPS / OS crypto.
- **Capacitor** `allowNavigation: []` — bundled WebView content only (tighten further if you add in-app browsers).
- **Background**: main loop pauses when the document is hidden (saves battery on iOS).

## Before you archive in Xcode

1. **Bundle ID**: Xcode uses `com.jamesleepm.bibleblocks.dev`. For production, set **Product → Bundle Identifier** and `appId` in `capacitor.config.ts` to your final ID (e.g. `com.yourcompany.bibleblocks`), then `npm run build && npx cap sync`.
2. **Version**: Keep `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` in Xcode aligned with `package.json` when you ship.
3. **Icons & launch**: Fill `ios/App/App/Assets.xcassets/AppIcon.appiconset` and `Splash.imageset` for all required sizes.
4. **App Store Connect**: Privacy questionnaire — align with manifest (no tracking; local save data only if you declare it).
5. **Kids / education**: Choose age rating and Kids category rules; add privacy policy URL if you collect any data or use analytics later.
6. **TestFlight**: Full pass on device — saves, creative/survival, crafting, touch controls, rotation, background/foreground.

## Store listing (outside the repo)

Screenshots (6.7", 5.5", iPad if supported), description, keywords, support URL, and **“what’s new”** text for each release.
