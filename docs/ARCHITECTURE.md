# Architecture

- `apps/desktop/src`: desktop shell and native bridge. Browser preview exposes the local editor and disables desktop capture.
- `apps/desktop/src-tauri`: Rust/Tauri native boundary. Enumerate screens/windows with xcap; hide the editor during capture and restore it on success/failure; return PNG bytes through IPC. Save through a native chooser; copy flattened image pixels through arboard. No shell, network, arbitrary filesystem or updater plugin is enabled.
- `packages/editor/src`: shared canvas model, bounded input inspection, decode/export, annotation history, editor, theme and fictional example. Crop coordinates remain in the original image coordinate system. Exports contain flattened pixels, with no original-image layer beneath concealment.
- `apps/website`: promotional site with a real local editor demonstration, source/release status, FAQ and verification instructions.
- `scripts/seo.mjs`: render React into static HTML and produce canonical/OG/schema/robots/sitemap from PUBLIC_SITE_URL. Unconfigured previews remain noindex.
- `tests`: geometry/history/input tests and real browser tests of output pixels, formats, failure states and accessibility. `scripts/native-smoke.mjs` exercises the actual Tauri window through WebDriver.

Images are in memory until an explicit save/copy. Only the theme preference persists in localStorage. Imports decode before replacing the current image. Clearing closes its ImageBitmap and removes editor history; saved files, originals, clipboard content and OS process memory have separate lifetimes. This is local processing, not a forensic erasure guarantee.

The initial editor holds one document. Undo retains 60 states. Input is limited to 30 MB, 32 megapixels and 16,384 pixels per side. Freehand paths bound point counts. These limits protect memory; no account, paid tier or usage quota exists.

Desktop native commands validate source kinds/IDs and image dimensions/format independently of the renderer. The save path comes from the OS chooser; a renderer-provided filename is sanitized and never used as an arbitrary filesystem path. Temporary-file replacement prevents partial writes to an existing image. The clipboard handle stays alive while EIMAGE runs so Linux can serve copied image content.
