# Size-optimized build

The app is functionally and visually the same; files were only removed when nothing references them, and images/fonts/SVGs were re-compressed with visual-difference checks.

## Result

| | Original | This build |
|---|---|---|
| Application files (without `.git`) | **54.69 MiB** (4,003 files) | **19.29 MiB** (2,026 files) |
| Install ZIP | 24.43 MB | **8.51 MB** ✅ under 15 MB |

* ZIP: **`boostmysocial-lite.zip`** — this is the file to upload to hosting.
* The unpacked app is 20.23 MB (19.29 MiB). Hosting upload limits apply to the ZIP, which is 8.51 MB.
* `.git` (version history) is not part of the ZIP and is not included in the numbers above.

## What was removed — 28.85 MiB, 1,977 files

| Size | Files | Removed |
|---|---|---|
| 6.24 MiB | 283 | PhpSpreadsheet `samples/` and `docs/` (the library itself is kept) |
| 5.67 MiB | 127 | Google API PHP client — no code references it (`Google_oauth` wrapper was unused) |
| 3.80 MiB | 569 | CodeMirror modes, tests, demos, docs — the CSS editor is kept |
| 2.51 MiB | 234 | TinyMCE unused languages, skins (`light`, `perfex`), themes (`inlite`, `mobile`), `.less` sources |
| 2.28 MiB | 9 | Legacy font files (`eot`/`svg`/`ttf`); `woff`/`woff2` kept |
| 2.25 MiB | 256 | Square (`1x1`) flag variants — only 4:3 flags are ever rendered |
| 1.02 MiB | 33 | Font Awesome sources (`less`/`scss`) and legacy font formats |
| 1.01 MiB | 3 | Unused admin CSS (`tabler.css`, `tabler.rtl.css`, `dashboard.rtl.css`) |
| 0.88 MiB | 34 | Unused Twitter/Facebook OAuth SDKs and wrapper classes |
| 0.67 MiB | 66 | AOS source/tests/locks (`dist` kept) |
| 0.36 MiB | 1 | Old runtime log |
| 0.35 MiB | 184 | Unused theme `animate` plugin copies |
| 0.33 MiB | 77 | Facebook SDK (unused) |
| 0.30 MiB | 82 | Datepicker locales and duplicate CSS/JS builds |
| 0.28 MiB | 4 | Unused JS bundles (`chart.bundle`, jQuery slim, require.js, dashboard.js) |
| 0.28 MiB | 3 | Feather legacy font formats |
| 0.26 MiB | 2 | Unreferenced GIFs |
| 0.20 MiB | 2 | Language backup copies |
| 0.08 MiB | 2 | Emoji-picker unused images |
| 0.07 MiB | 6 | Unused theme CSS/JS duplicates and flag CSS build |

Everything else (all 30 modules, CodeIgniter core, PhpSpreadsheet runtime, PHPMailer, payment SDKs, all three themes, TinyMCE, CodeMirror, flags, emoji pickers, database dump) is kept.

## What was optimized — 6.55 MiB saved, 356 files

* **49 PNGs** and **10 JPEGs** re-encoded/palette-quantized. Every file was decoded and compared to the original: pixel difference (RMSE) is **≤1.2 %** for normal images and **≤1.45 %** at display scale for emoji sprites.
* **296 SVGs** minified with SVGO. Flags use integer path precision; at their ~20 px display size the measured difference is **≤1.3 %** and they render identically. All **552/552 SVGs parse and render**.
* Emoji sprite sheets: 2.70 MiB → 0.86 MiB (still the same dimensions and all 5 sheets).
* Large payment logos, theme images, and the demo avatar: 4.71 MiB → 1.46 MiB.
* Flag CSS trimmed to match the retained 4:3 flags.

## Verification

* **2,026 files**, all images decode (149/149) and all SVGs render (552/552).
* Every asset referenced by PHP/CSS/JS exists. The only missing references are ones that were **already broken in the original** (`assets/css/landing_page.css`, `assets/js/landing_page.js`, core.css's `assets/images/flags/*`, and `assets/fonts/fontawesome-webfont.*`) — they were left untouched.
* The 256 flags referenced by `flag-icon.css` all exist.
* No PHP logic was edited. Only unreferenced files were deleted, so runtime behaviour is unchanged.

## Install (same as before)

1. Upload **`boostmysocial-lite.zip`** to your host and extract it into the web root (e.g. `public_html`).
2. Import `dlititci_boostmysocial2.sql` into MySQL.
3. Edit `app/config/database.php` with your database details and open the site.

If you need the **unpacked** folder itself below 15 MB, that would require removing real features (e.g. the Excel export library ≈4.5 MiB, the admin editor, or all flags). The current build avoids that, and the 8.51 MB install ZIP is the artifact hosting panels check.
