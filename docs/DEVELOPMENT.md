# Development environment

Use the existing checkout; a cloud task already has an isolated workspace. Do not create another worktree unless requested. Preserve EQR, EMeta and other user files.

Standard personal-machine setup is in README and the official Tauri prerequisites. Node 24, Rust 1.99 and Debian 13 were used in this cloud task. Native and npm dependencies are locked. No credentials, backend or database are required. PUBLIC_SITE_URL is optional and must be the real deployment address.

## Cloud prerequisites

Run `bash scripts/cloud-setup.sh` from `/workspace/EIMAGE`. It installs verified Debian packages and Rust into `/workspace/eimage-tools`, prepares Node dependencies and runs real unit/build/Rust checks. It never edits `/usr`, disables TLS/signature validation or changes sibling repositories. Source `/workspace/eimage-tools/env.sh` for Cargo/pkg-config activation in each new shell. Snapshot publication retains installed files, not processes.

Web development: `npm run dev` (editor, 5175), `npm run dev:site` (site, 5176). Production preview: `npm run preview:editor` (4175) and `npm run preview:site` (4176). Reuse healthy servers; do not kill unknown processes. Internal readiness checks are supported; the cloud onboarding UI does not expose localhost links as public previews.

## Native Linux testing

A graphical session is required. In this cloud workspace, start Xvfb on `:99` at `1440x1000x24`, then Openbox and the fictional capture fixture. Use the retained prefix binaries; set `XDG_DATA_DIRS=/workspace/eimage-tools/sysroot/usr/share:/usr/share` and the prefix library path for Openbox.

The packaged WebKit helpers use fixed `/usr/lib` locations. `scripts/cloud-native.sh` mounts the verified user-prefix libraries read-only at those locations in a temporary process. It leaves host system files unchanged and preserves the WebKit sandbox. The cloud command runner may require `require_escalated` for this temporary user/mount namespace: the ordinary nested sandbox cannot write its UID map. This action was validated without system writes.

Example WebDriver startup (long-lived session):

```sh
bash scripts/cloud-native.sh /workspace/eimage-tools/cargo/bin/tauri-driver --port 4446 --native-port 4447 --native-driver /workspace/eimage-tools/sysroot/usr/bin/WebKitWebDriver
```

Then run from the project root:

```sh
EIMAGE_NATIVE_BINARY=/workspace/EIMAGE/apps/desktop/src-tauri/target/release/eimage \
EIMAGE_DRIVER_URL=http://127.0.0.1:4446 \
EIMAGE_REQUIRE_WINDOW=1 \
EIMAGE_XCLIP=/workspace/eimage-tools/sysroot/usr/bin/xclip \
EIMAGE_XDOTOOL=/workspace/eimage-tools/sysroot/usr/bin/xdotool \
DISPLAY=:99 \
LD_LIBRARY_PATH=/workspace/eimage-tools/sysroot/usr/lib/x86_64-linux-gnu \
node scripts/native-smoke.mjs
```

The script checks the actual Tauri bridge, source enumeration, OS capture dimensions, canvas concealment and clipboard. With xdotool, it also operates the real native save chooser and independently decodes the resulting PNG. It writes evidence under the ignored `.impeccable/review` directory. Start the `tests/fixtures/native-window.html` fixture in a test browser with the title “EIMAGE capture fixture” to include a window-capture check; no private data is needed.

`npm run build:desktop -- --ci` creates the local Debian package; `node scripts/checksums.mjs` records its actual hash. The CI matrix builds Windows NSIS and macOS app/DMG on their own systems. Those build paths and actual native behavior are distinct checks; read VALIDATION.md before claiming a platform is verified.
