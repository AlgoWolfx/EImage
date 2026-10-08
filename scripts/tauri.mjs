import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const binary = fileURLToPath(
  new URL("../node_modules/@tauri-apps/cli/tauri.js", import.meta.url),
);
const child = spawn(process.execPath, [binary, ...process.argv.slice(2)], {
  cwd: fileURLToPath(new URL("../apps/desktop/", import.meta.url)),
  stdio: "inherit",
  env: process.env,
});
child.on("error", (e) => {
  console.error(e);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
