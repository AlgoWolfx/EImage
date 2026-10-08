#!/usr/bin/env bash
set -euo pipefail
. /workspace/eimage-tools/env.sh
mkdir -p /tmp/eimage-runtime/{cache,config,data}
export DISPLAY="${DISPLAY:-:99}"
export XDG_CACHE_HOME=/tmp/eimage-runtime/cache
export XDG_CONFIG_HOME=/tmp/eimage-runtime/config
export XDG_DATA_HOME=/tmp/eimage-runtime/data
export GDK_BACKEND=x11
export LD_LIBRARY_PATH=/workspace/eimage-tools/sysroot/usr/lib/x86_64-linux-gnu:/workspace/eimage-tools/sysroot/lib/x86_64-linux-gnu
export WEBKIT_DISABLE_DMABUF_RENDERER=1
# Mount verified dependencies read-only in this process only. No system file changes.
exec dbus-run-session bwrap --ro-bind / / --bind /workspace /workspace --bind /tmp /tmp --dev-bind /dev /dev --proc /proc --overlay-src /usr/lib/x86_64-linux-gnu --overlay-src /workspace/eimage-tools/sysroot/usr/lib/x86_64-linux-gnu --ro-overlay /usr/lib/x86_64-linux-gnu "$@"
