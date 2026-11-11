@AGENTS.md

# SwishClean

Mobile app for finding housecleaners (ART, "asisten rumah tangga") in Indonesia. UI language is Indonesian.
Built 1:1 from the Figma file — the design is the source of truth for layout, colors and copy.

- Stack: Expo SDK 58, React Native 0.88, Expo Router (routes in `src/app/`), TypeScript, Poppins via `@expo-google-fonts/poppins`.
- Run: `npx expo start` (web: `npx expo start --web`, then open at 390×844). Don't set `CI=1` — it disables file watching.
- Check before finishing: `npx tsc --noEmit`, then click through the changed screens in a 390×844 browser viewport and compare with the Figma screenshot.

## Figma

File: https://www.figma.com/design/4T0p24hYGDwNsizsOVX6ru/SwishClean (fileKey `4T0p24hYGDwNsizsOVX6ru`, page "App SwishClean" = `1:3`).
Each screen frame contains `Hotspot → <target>` frames that say where a tap should navigate.

| Figma frame (inner node) | Route / file | Status |
|---|---|---|
| Pelanggan_02_Beranda `1:1854` | `/` `src/app/index.tsx` | done |
| Pelanggan_03_Cari_ART `1:1974` | `/cari` | done |
| Pelanggan_04_Profil_ART `1:2157` + Bar_Order `1:2325` | `/art/[id]` | done |
| Pelanggan_05_Pilih_Jadwal `1:2336` | `/jadwal` (transparent modal) | done |
| Pelanggan_06_Detail_Rumah_Add_On `1:2439` | `/detail-rumah` | done |
| Pelanggan_07_Konfirmasi_Order `1:2735` | `/konfirmasi` | done |
| Pelanggan_08_Order_Berhasil `1:2549` | `/berhasil` | done |
| Pelanggan_09_Pesanan_Saya `1:2607` | `/pesanan` | done |
| Pelanggan_10_Chat_ART `1:2818` | `/chat/[id]` | done |
| Pelanggan_11_Beri_Ulasan `1:2893` | `/ulasan` | done |
| Pelanggan_12_Komplain_dan_Refund `1:2972` | `/komplain` | done |
| Pelanggan_13_ART_Langgananku `1:3038` | `/langganan` | done |
| Pelanggan_14_Akun `1:3149` | `/akun` | done |
| App_00_Masuk_Pelanggan `17:4`, App_00_Masuk_Mitra_ART `17:88` | `/masuk` (one screen, role toggle; `?peran=mitra`) | done — logged-out users are redirected here from `/` |
| App_01_Daftar_Pelanggan `21:3` | `/daftar` | done |
| App_02_Daftar_Mitra 1–4 (`21:82`, `21:180`, `22:3`, `22:69`) | `/mitra/daftar`, `/mitra/daftar-ktp`, `/mitra/daftar-wajah`, `/mitra/verifikasi` | done (camera is a mock: `CameraShell`) |
| Mitra_02_Jadwal_Hari_Ini `1:3389` | `/mitra` (mitra home, redirects to /masuk if not mitra) | done |
| Mitra_03_Order_Baru `1:3278` | `/mitra/order-baru` | done |
| Mitra_04_Detail_dan_Daftar_Tugas `1:3616` | `/mitra/tugas/[id]` | done |
| Mitra_05_Chat_Pelanggan `1:3711` | `/mitra/chat/[id]` (shares `ChatScreen` with `/chat/[id]`) | done |
| Mitra_06_Pekerjaan_Selesai `1:3507` | `/mitra/selesai` | done |
| Mitra_07_Pendapatan `1:3786` | `/mitra/pendapatan` | done |
| Mitra_08_Profil_dan_Ketersediaan `1:3885` | `/mitra/profil` | done |

All Figma frames on the App page are implemented (2026-11-12).

## How the code is organized

- `src/theme.ts` — color tokens `C` and font names `F` taken from the Figma SVGs. Use these, never raw hex.
- `src/ui.tsx` — shared pieces: `T` (Poppins text, line-height = ceil(size×1.5) like Figma), `useInsets` (design assumes 47px status bar / 22px bottom), `TopBar`, `BackButton`, `IconButton`, `Button` (optional `icon`), `Tag`, `Avatar`, `Toggle` (44×26), `Steps` (Langkah n dari 3), `SummaryBar`, `card` style.
- `src/components/` — `ArtCard` (350×132 card), `BottomNav` (5 tabs; each tab screen renders it itself — the app uses one Stack, not Tabs).
- `src/icons.ts` — every icon is the original Figma SVG in `assets/figma/<asset-id>.svg`, imported as a component via `react-native-svg-transformer` (see `metro.config.js`, `svg.d.ts`). Icons render at their native SVG size. Boxes/backgrounds are Views, not SVGs.
- `src/data/arts.ts` — the single ART list used by every screen (`getArt(id)`, `rupiah()`, `km()`).
- `src/data/order.ts` — add-ons, pricing (`quote()`), service fee, promo, time helpers; has a self-check against the design's numbers (Rp165.000 / Rp162.000).
- `src/data/calendar.ts` — October 2026 only, like the design.

- `src/data/session.ts` — logged-in role (`pelanggan` | `mitra`), in memory only.
- Transitions: native stack slides pages / fades tabs (`src/app/_layout.tsx`); on web `PageTransition` (via `screenLayout`) does the same. Jadwal sheet slides up itself.

- `src/components/` also has `MitraNav` (4-tab mitra nav), `ChatScreen`, `CameraShell`, `DaftarSteps`, `PageTransition`; `src/data/mitra.ts` holds mitra sample data.

Figma MCP note: the Starter plan hit its MCP tool-call limit on 2026-11-12. Fallback used: Figma REST API with a personal access token in the Windows user env var `FIGMA_TOKEN` (never commit it):
`GET https://api.figma.com/v1/files/<fileKey>/nodes?ids=<ids>` (layout/text/colors) and `GET /v1/images/<fileKey>?ids=<ids>&format=svg|png` (icons + reference renders). REST-exported icons are saved as `assets/figma/n<node-id>.svg`.

Booking state is passed between steps as route params (`art`, `day`, `time`, `addons`). There is no backend or persistence yet; orders, reviews, chat, profile and favourites are the design's sample data (marked `shortcut:` in code).

## Getting design context (Figma MCP)

1. `create_session` with the fileKey, then `get_design_context` on the inner node id (table above).
2. Download that screen's SVG assets into `assets/figma/` (filename = asset id) and only keep the icons you import; delete unused ones.
3. Convert the React/Tailwind reference into RN flex layouts using px from the design (percentages are of 390×844).

## Planned / not built yet

- Admin can add new ARTs (user's idea, details to be discussed). Keep `src/data/arts.ts` as the single source so it can be swapped for a DB/API.
- Login/sign-up and the Mitra ART screens (see table).
- Buttons with no designed target are inert: Notifikasi, Batalkan, Keluar, Mitra banner, Akun menu rows, phone/camera, "chat CS", Pesanan tabs Selesai/Dibatalkan.
- Not yet tested on a physical Android/iOS device (only web at 390×844).
