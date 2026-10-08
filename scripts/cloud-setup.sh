#!/usr/bin/env bash
set -euo pipefail
# Debian 13 cloud setup with a user-owned prefix; package signatures remain enabled.
. /etc/os-release
if [[ "$ID" != debian || "$VERSION_ID" != 13 ]]; then
  echo 'This helper targets the Debian 13 cloud workspace. See Tauri platform prerequisites for other systems.' >&2
  exit 1
fi
EIMAGE_TOOLS=/workspace/eimage-tools
EIMAGE_APT=/tmp/eimage-apt
mkdir -p "$EIMAGE_TOOLS/sysroot" "$EIMAGE_APT/parts" "$EIMAGE_APT/lists/partial" "$EIMAGE_APT/archives/partial" "$EIMAGE_APT/log"
cat > "$EIMAGE_APT/sources.list" <<'SOURCES'
deb [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] https://deb.debian.org/debian trixie main
SOURCES
EIMAGE_APT_FLAGS=(-o "Dir::Etc::parts=$EIMAGE_APT/parts" -o "Dir::Etc::sourcelist=$EIMAGE_APT/sources.list" -o Dir::Etc::sourceparts=- -o "Dir::State::lists=$EIMAGE_APT/lists" -o "Dir::Cache::archives=$EIMAGE_APT/archives" -o "Dir::Cache::pkgcache=$EIMAGE_APT/pkgcache.bin" -o "Dir::Cache::srcpkgcache=$EIMAGE_APT/srcpkgcache.bin" -o "Dir::Log=$EIMAGE_APT/log" -o Debug::NoLocking=true)
if [[ ! -f "$EIMAGE_TOOLS/sysroot/usr/lib/x86_64-linux-gnu/pkgconfig/webkit2gtk-4.1.pc" || ! -x "$EIMAGE_TOOLS/sysroot/usr/bin/WebKitWebDriver" || ! -x "$EIMAGE_TOOLS/sysroot/usr/bin/openbox" ]]; then
  apt-get "${EIMAGE_APT_FLAGS[@]}" update
  apt-get "${EIMAGE_APT_FLAGS[@]}" --download-only --assume-yes --no-install-recommends install libwebkit2gtk-4.1-dev libgtk-3-dev librsvg2-dev patchelf libxdo-dev libclang-dev libclang1-19 libllvm19 libpipewire-0.3-dev libgbm-dev xvfb xserver-common libxfont2 webkitgtk-webdriver openbox xdotool xclip
  # Explicit downloads also retain runtimes already installed in the base image.
  (cd "$EIMAGE_APT/archives"; apt-get "${EIMAGE_APT_FLAGS[@]}" download libclang1-19 libllvm19 xvfb xserver-common libxfont2 webkitgtk-webdriver xdotool xclip)
  python3 - "$EIMAGE_APT/archives" "$EIMAGE_TOOLS/sysroot" <<'PY'
from pathlib import Path
import subprocess,sys
for package in Path(sys.argv[1]).glob('*.deb'):
    subprocess.run(['dpkg-deb','--extract',str(package),sys.argv[2]],check=True)
PY
fi
python3 - "$EIMAGE_TOOLS/sysroot" <<'PY'
from pathlib import Path
import shutil,sys
root=Path(sys.argv[1])
for link in (root/'usr/lib').rglob('*'):
    if not link.is_symlink() or link.exists(): continue
    target=link.resolve(strict=False)
    if target.is_relative_to(root):
        source=Path('/')/target.relative_to(root)
        if source.is_file():
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(source,target)
PY
if [[ ! -x "$EIMAGE_TOOLS/cargo/bin/rustup" ]]; then
  curl --fail --show-error --location https://sh.rustup.rs -o "$EIMAGE_TOOLS/rustup-init.sh"
  CARGO_HOME="$EIMAGE_TOOLS/cargo" RUSTUP_HOME="$EIMAGE_TOOLS/rustup" sh "$EIMAGE_TOOLS/rustup-init.sh" -y --no-modify-path --profile minimal --default-toolchain stable
fi
cat > "$EIMAGE_TOOLS/env.sh" <<'ENV'
export CARGO_HOME=/workspace/eimage-tools/cargo
export RUSTUP_HOME=/workspace/eimage-tools/rustup
export PATH=/workspace/eimage-tools/cargo/bin:/workspace/eimage-tools/sysroot/usr/bin:$PATH
export PKG_CONFIG_PATH=/workspace/eimage-tools/sysroot/usr/lib/x86_64-linux-gnu/pkgconfig:/workspace/eimage-tools/sysroot/usr/share/pkgconfig
export PKG_CONFIG_SYSROOT_DIR=/workspace/eimage-tools/sysroot
export LIBCLANG_PATH=/workspace/eimage-tools/sysroot/usr/lib/llvm-19/lib
export RUSTFLAGS='-L native=/workspace/eimage-tools/sysroot/usr/lib/x86_64-linux-gnu -L native=/workspace/eimage-tools/sysroot/lib/x86_64-linux-gnu'
export BINDGEN_EXTRA_CLANG_ARGS='-isystem /workspace/eimage-tools/sysroot/usr/lib/llvm-19/lib/clang/19/include -isystem /usr/lib/gcc/x86_64-linux-gnu/14/include'
export npm_config_cache=/tmp/eimage-npm-cache
ENV
. "$EIMAGE_TOOLS/env.sh"
rustup component add rustfmt
if [[ ! -x "$EIMAGE_TOOLS/cargo/bin/tauri-driver" ]]; then cargo install tauri-driver --version 2.1.0 --locked; fi
pkg-config --modversion gtk+-3.0 webkit2gtk-4.1 libpipewire-0.3
cd /workspace/EIMAGE
npm ci --cache /tmp/eimage-npm-cache --no-audit --no-fund
npm test
npm run build
cargo test --locked --manifest-path apps/desktop/src-tauri/Cargo.toml -j 4
graphify codex install
