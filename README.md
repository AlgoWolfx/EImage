# EIMAGE

**A screenshot. A clearer point.**

A free, open-source desktop screenshot tool built with **Tauri + React**. Capture a screen or window, annotate what matters, conceal private details, then copy or save a local image.

No account, subscriptions, paid features, uploads, telemetry or watermark. Every implemented feature is free. EIMAGE is licensed under MIT.

## What it does

- Capture a screen or window; select a smaller region after capture.
- Open PNG, JPEG and WebP images.
- Add arrows, rectangles, freehand drawing and text.
- Cover selected details with solid pixels that are flattened into the exported image.
- Crop, undo and redo without modifying the input file.
- Save PNG/JPEG/WebP through the native file chooser; copy PNG pixels to the clipboard.
- Use light/dark themes and keyboard shortcuts while the app has focus.

The companion website includes a functioning local editor demo. **Screen capture belongs to the desktop app.** The website does not capture your screen or upload images.

## Platform and release status

| Target  | Current status                                                                                                 |
| ------- | -------------------------------------------------------------------------------------------------------------- |
| Linux   | Built and exercised in a Debian 13 X11 virtual desktop; see [validation](docs/VALIDATION.md) for exact checks. |
| Windows | Source/build target and CI packaging configured; native validation pending.                                    |
| macOS   | Source/build target and CI packaging configured; native validation pending.                                    |

Public installers, signed releases and a live website are not published yet. The [releases page](https://github.com/AlgoWolfx/EIMAGE/releases) is the official place to check download availability. CI artifacts are unsigned test builds, not an audited release.

**Windows consumer distribution will use Microsoft Store with an MSIX package.** Microsoft signs this package after certification. The unsigned NSIS test installer can trigger SmartScreen; it is not the public installation route. Store account setup, actual publisher identity and Microsoft review are still pending. See [Store packaging and publication](docs/MICROSOFT_STORE.md).

macOS needs Screen Recording permission. Linux Wayland support depends on the compositor and portals; X11 is the initial validation target. No background/global hotkey or screen-recording feature is claimed in this version.

## Development

Requirements: Node.js 22.12+ (Node 24 used here), npm, stable Rust and the [Tauri v2 platform prerequisites](https://v2.tauri.app/start/prerequisites/). Windows needs the Microsoft C++ build tools and WebView2; macOS needs Xcode command-line tools.

On Debian/Ubuntu, install the native build dependencies:

```sh
sudo apt-get update
sudo apt-get install libwebkit2gtk-4.1-dev libgtk-3-dev librsvg2-dev patchelf libxdo-dev libclang-dev libpipewire-0.3-dev libgbm-dev
```

Then:

```sh
npm ci
npm run desktop
```

Browser-only editor preview: `npm run dev`. Promotional website: `npm run dev:site`. These are development servers, not public deployments.

```sh
npm test
npm run build
npm run test:e2e
cargo test --locked --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml --check
npm run format:check
```

Install the Playwright Chromium runtime with `npx playwright install chromium` if none is installed; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select a local executable. Native WebDriver prerequisites and cloud-specific setup are in [development](docs/DEVELOPMENT.md).

## Build a desktop package

```sh
npm run build:desktop -- --ci --bundles deb       # Linux
npm run build:desktop -- --ci --bundles nsis      # Windows
npm run build:desktop -- --ci --bundles app,dmg   # macOS
node scripts/checksums.mjs
```

Run the command on its target OS. Bundles appear in `apps/desktop/src-tauri/target/release/bundle/`. CI builds each target independently and uploads unsigned test artifacts plus SHA-256 checksums. It does not automatically publish a release. Third-party notices accompany native and web distributions.

## Website and SEO

`npm run build` produces `dist/site` for static HTTPS hosting and `dist/desktop` for the desktop app. Website text and FAQ are present in static HTML for crawlers and readers with JavaScript disabled.

The public domain is undecided. Set `PUBLIC_SITE_URL` to the actual HTTPS website address in the build environment or root `.env.local` before deployment. It controls canonical/OG URLs, zero-price SoftwareApplication schema, robots and sitemap. Unconfigured preview builds intentionally use `noindex,nofollow` and an empty sitemap. See [SEO](docs/SEO.md).

## Privacy and verification

Images stay in memory until you copy or save. Only a theme preference is stored locally. Clearing the editor removes its document/history; originals, saved files and clipboard copies have separate lifetimes.

Concealment covers only the selected area in the exported pixels. The original image and undo history may still contain that information; inspect the result before sharing. Memory bounds (30 MB input, 32 megapixels, 16,384 pixels per side, 60 undo states) protect stability and are not paid quotas.

Read [SECURITY.md](SECURITY.md) to compare checksums, inspect signatures when available and scan an installer yourself with [VirusTotal](https://www.virustotal.com/gui/home/upload). **No completed scan or malware-free guarantee is claimed.** EIMAGE never sends files to VirusTotal automatically.

The [privacy policy](PRIVACY.md) describes image access, local storage and the system clipboard.

## Project notes

[Specification](PROJECT_SPEC.md) · [Architecture](docs/ARCHITECTURE.md) · [Validation](docs/VALIDATION.md) · [Third-party notices](docs/THIRD_PARTY_NOTICES.md)

The confirmed desktop screenshot brief supersedes the original image-converter plan, which is preserved in [the archived brief](docs/ARCHIVED_IMAGE_CONVERTER_BRIEF.md).

Built by **Yiğit Bayrak · EGORA Digital**.
