@AGENTS.md

# SwishClean

Indonesian app for booking housecleaners (ART, "asisten rumah tangga"); UI copy is Indonesian. Built 1:1 from Figma — the design is the source of truth for layout and copy.
Stack: Expo SDK 58, RN 0.88, Expo Router (`src/app/`), TypeScript, Poppins. Repo: private GitHub `andrewemmanuelyohanson31-ship-it/SwishClean` (main).

## Workflow
- Run: `npx expo start --web` and check at 390×844. Don't set `CI=1` (disables file watching).
- Public prototype: https://swishclean.expo.app (EAS Hosting, demo build: `EXPO_NO_DOTENV=1 npx expo export -p web` → `npx eas-cli@latest deploy --prod`). Expo account `andrewyohanson`; steps in README.
- Done = `npx tsc --noEmit` + `npx expo lint` clean + changed screens clicked through in the browser.
- **Reuse before writing.** Check the lists below first; extend an existing component/helper instead of adding a near-copy. Never use raw hex — use `C` from `src/theme.ts`.

## Code map (reuse these)
- `src/theme.ts` — color tokens `C`, fonts `F`. Text colors were darkened from Figma for WCAG 4.5:1 (see comment there).
- `src/ui.tsx` — `T` (text, line-height ceil(size×1.5)), `useInsets`, `TopBar`, `BackButton`, `IconButton`, `Button` (hitSlop, optional `icon`), `Chip`, `Tag`, `Avatar`, `Toggle`, `Steps`, `SummaryBar`, `card`, `goBack(fallback)` — always use `goBack`, never bare `router.back()`.
- `src/components/` — `ArtCard`, `BottomNav` (customer, 5 tabs), `MitraNav` (4 tabs), `ChatScreen` (customer + mitra chat), `ReviewCard`, `HomeSheet`, `CameraShell` (mock camera), `DaftarSteps`, `PageTransition` (+ `useReducedMotion` — use it for any new animation).
- `src/icons.ts` — original Figma SVGs from `assets/figma/` as components (react-native-svg-transformer). SVG colors were darkened with the theme; keep them in sync if tokens change.
- `src/data/store.ts` — single persisted store (AsyncStorage `swishclean:v1`): `useStore(sel)` (selector must return existing refs), `setState`, `createOrder`, `updateOrder`, `toggleFavorite`, `logout`, `showToast`.
- `src/data/remote.ts` — Supabase client + `sendOtp`/`verifyOtp`, `loadArts`, `pullOrders`, `pushOrder`, `pushOrderPatch`, `toE164`.
- Other data: `arts.ts` (ART list, `getArt`, `rupiah`, `km`), `order.ts` (`quote`, `estimateMinutes`, add-ons; self-check), `search.ts` (self-check), `calendar.ts` (Oct 2026 only), `mitra.ts`, `reviews.ts`, `payments.ts`, `policies.ts` (DRAFT copy, needs legal review), `media.ts` (`pickImages`).
- Routing: one Stack in `src/app/_layout.tsx`; `Guard` there redirects by role (UX only — the server enforces access via RLS). Booking steps pass `art/day/time/addons` as route params.

## Screens
All 30 Figma frames on page "App SwishClean" (file `4T0p24hYGDwNsizsOVX6ru`) are built: customer `/`, `/cari`, `/art/[id]`, `/jadwal` (sheet), `/detail-rumah`, `/konfirmasi`, `/berhasil`, `/pesanan`, `/chat/[id]`, `/ulasan`, `/komplain`, `/langganan`, `/akun`; auth `/masuk` (`?peran=mitra`), `/daftar`, `/mitra/daftar*`, `/mitra/verifikasi`; mitra `/mitra`, `/mitra/order-baru`, `/mitra/tugas/[id]`, `/mitra/chat/[id]`, `/mitra/selesai`, `/mitra/pendapatan`, `/mitra/profil`.
No Figma frame (built from the same components): `/notifikasi`, `/lokasi`, `/pembayaran`, `/profil-edit`, `/pengaturan-notifikasi`, `/kebijakan/[slug]`, `/bantuan`, `/bantuan/chat`, `/ulasan-art/[id]`, `/mitra/tarik-dana`, `/mitra/ketersediaan`, `/mitra/libur`.
Figma access: the MCP Starter plan limit was hit; the fallback is the REST API with a personal token in env var `FIGMA_TOKEN` (never commit it).

## Backend (Supabase)
- Project ref `nsxiqmdysztfvcsujudq`. Supabase MCP is configured in `.mcp.json` (project scope) — use it to run SQL, apply migrations, read logs and generate types instead of asking the user to paste SQL.
- Schema: `supabase/migrations/20261112050031_init.sql` (applied 2026-11-12) — 12 tables with RLS, a signup trigger making `profiles`, a private `kyc` bucket, and seed ARTs. Add changes as new migration files; never edit an applied one.
- App config: `.env` with `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (template `.env.example`). Unset = demo mode (local sample data, any 6-digit OTP). Never put the secret/service_role key in the app.
- Phone login needs Auth → Providers → Phone + an SMS provider (or test numbers). As of 2026-11-18 it was OFF on the live project ("Unsupported phone provider").
- `20261119083150_qc_fixes.sql` (server price check, no double booking, payout ≤ earnings, mitra status rules, mitra-only tables, hidden reviewer id, address/customer on orders) — applied 2026-11-19; `rls_check.sql` 64/65 (only the known "past date" item fails). Local migration filenames must match the versions `list_migrations` reports — rename after `apply_migration`.
- `20261119084157_booking_limits.sql`: a job is max 12 jam and must end by 24.00 (same rule as `jobTooLong` in `order.ts`; Detail Rumah blocks "Lanjut"); double-booking compares minutes, not `time` (no midnight wrap). Any change to `quote()`/add-ons must be mirrored in `price_order()` — on 2026-11-19 all 920 UI-reachable price combos were checked against the live trigger and matched.
- DB test: `supabase/tests/rls_check.sql` — run with `execute_sql`; it rolls itself back and returns `QCRESULT [...]`. Run it after every policy/trigger change.
- Sync (`remote.ts`): orders (+ reviews, complaints, chat messages per order), favorites, addresses, profile name/email, mitra settings, payouts, linked ART (`myArtId`). Store `setState` calls `pushChanges(prev, next)`; pass `fromServer=true` when applying pulled data. Not synced: notifications, photos (chat/KYC/review), CS chat (no backend).
- Mitra jobs = real orders where `artId === myArtId` (+ design samples in demo mode only) — `allJobs(state)` in `src/data/mitra.ts`.
- Still open: order code made on device; promo applied to every order; calendar fixed to Oct 2026 (so no "past date" check yet).

## Not built yet
- Admin "add new ART" (user's idea; write `arts` via service role / admin screen).
- Payments (Midtrans/Xendit), push notifications, masked calling (calls show a toast), real camera for KYC.
- Not tested on a physical phone yet (Expo Go / EAS build).
- Known: 3 moderate npm audit advisories in Expo tooling — don't `npm audit fix --force` (downgrades Expo).
