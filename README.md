# SwishClean

Aplikasi pemesanan ART (asisten rumah tangga) — Expo SDK 58 + Expo Router + Supabase.

**Prototype (demo mode):** https://swishclean.expo.app — best viewed at phone size; any 6-digit OTP works.

## Run locally

```bash
git clone https://github.com/andrewemmanuelyohanson31-ship-it/SwishClean.git
cd SwishClean
npm install
cp .env.example .env   # fill in the two Supabase values, or leave empty for demo mode
npx expo start --web   # open at 390×844 (phone size)
```

**Demo mode:** with `.env` empty the app runs on local sample data and any 6-digit OTP works.
**Live mode:** with `.env` filled, login uses Supabase phone OTP — turn on Authentication → Sign In / Providers → Phone
(add test numbers like `6281200000001=123456` if there is no SMS provider yet).

Only the **publishable** key goes in `.env` / the app. Never the `service_role` / `sb_secret_` key — row-level security
(`supabase/migrations/`) is the access control.

## Share the app

Log in once: `npx eas-cli@latest login` (free account at expo.dev).

### 1. Website link (anyone with a browser)

```bash
# Demo prototype (sample data, any OTP) — what the public link uses:
EXPO_NO_DOTENV=1 npx expo export --platform web
# Live backend instead:  npx expo export --platform web

npx eas-cli@latest deploy             # preview URL: https://<name>--<id>.expo.app
npx eas-cli@latest deploy --prod      # stable URL:  https://<name>.expo.app
```

Re-run export + deploy after every change. If `https://swishclean.expo.app` still shows the old version, promote the
new deployment: `npx eas-cli@latest deploy:alias --prod --id <id from the deployment URL>`.
On desktop browsers the site shows the app inside a phone frame (`src/components/PhoneFrame.tsx`); phones get it full screen. On PowerShell, set the variable with `$env:EXPO_NO_DOTENV=1` first.

### 2. Android APK (install by link / QR, no Play Store)

`.env` is not uploaded to EAS (it is gitignored), so store the values on EAS once:

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://<ref>.supabase.co --environment preview --visibility plaintext
npx eas-cli@latest env:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value sb_publishable_... --environment preview --visibility plaintext
npx eas-cli@latest build --platform android --profile preview
```

When the build finishes, open it on expo.dev → **Install** to get a link + QR code for testers.
Testers must allow "install unknown apps". Skip the `env:create` step for a demo-mode APK.

### 3. iPhone

Needs a paid Apple Developer account. Register each tester's device with `npx eas-cli@latest device:create`,
then `npx eas-cli@latest build --platform ios --profile preview` (ad hoc, max 100 devices/year) — or use TestFlight.

### 4. Quick live demo from your PC (Expo Go)

```bash
npm i -g @expo/ngrok
npx expo start --tunnel
```

Testers install **Expo Go** and scan the QR code. Works only while your PC runs the command.

## Checks before pushing

```bash
npx tsc --noEmit
npx expo lint
```
