# EIMAGE — Desktop screenshot tool

The confirmed user brief supersedes the old image converter plan, preserved in [docs/ARCHIVED_IMAGE_CONVERTER_BRIEF.md](docs/ARCHIVED_IMAGE_CONVERTER_BRIEF.md).

## Product

A free, MIT-licensed desktop screenshot tool targeting Windows, macOS and Linux. Tauri v2 + Rust provides native capture, a save dialog and the image clipboard. React + TypeScript provides a shared local canvas editor and a static promotional website.

## Workflow

Capture a screen or window, optionally select a region after capture, or open a PNG/JPEG/WebP. Add arrows, rectangles, freehand strokes and text; cover private details with solid pixels; crop; undo/redo. Save a flattened PNG/JPEG/WebP or copy a flattened PNG. Preserve the current document on failed imports, canceled save dialogs and capture failures. Replacing an edited image requires a deliberate choice.

## Interface

User-confirmed layout: tools above a large central image, settings on the right. The website starts with a functioning editor example, then explains capture → edit → share and exposes source/release status. Maintain the EQR/EMeta Emil Kowalski + Impeccable direction, system typography, light/dark themes, keyboard focus and reduced motion. English is the standing source language.

## Privacy and truthful claims

No account, subscriptions, paid features, watermark, uploads or telemetry. Images remain in memory until explicit save/copy. The OS clipboard and saved files have their own lifetime. Undo and original input retain source content until cleared; only exported concealed pixels are covered permanently. Do not claim forensic sanitization, malware-free guarantees, signing, completed VirusTotal scans or working public installers without evidence.

## Runtime limits

30 MB encoded input, 32 megapixels and 16,384 pixels per side. Undo retains 60 states. These bounds protect memory; they are not licensing or usage quotas. Linux Wayland depends on compositor/portal support; X11 is the initial test session. macOS needs Screen Recording permission. Keyboard capture shortcuts are available while EIMAGE has focus; background/global hotkeys and screen recording are outside this version.

## Delivery checks

TypeScript unit tests; actual canvas exports, opaque concealment, undo/redo, crop dimensions, image formats, failed input, accessibility, responsive layout and local-only requests in a browser. Rust validation tests and a real Linux Tauri capture/clipboard/save smoke test. Native packages must build on their respective OS in CI. Keep platform validation, signing, source publication, binary publication and website deployment separate.

## SEO

Static rendered content, descriptive title/metadata, zero-price SoftwareApplication data, canonical URL, robots and sitemap. PUBLIC_SITE_URL remains unset until a real HTTPS domain is chosen; unconfigured preview builds use noindex and an empty sitemap. No invented reviews, download counts or scan results.
