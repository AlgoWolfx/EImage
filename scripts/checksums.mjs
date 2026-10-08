import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const root = "apps/desktop/src-tauri/target/release/bundle";
const lines = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(deb|exe|msi|dmg|AppImage|rpm)$/.test(entry.name)) {
      const hash = createHash("sha256")
        .update(await readFile(file))
        .digest("hex");
      lines.push(
        `${hash}  ${path.relative(root, file).split(path.sep).join("/")}`,
      );
    }
  }
}
await walk(root);
if (!lines.length)
  throw new Error(
    "No native installers found; no empty checksum manifest will be created.",
  );
await writeFile(
  path.join(root, "SHA256SUMS.txt"),
  lines.sort().join("\n") + "\n",
);
console.log(`Checksums recorded for ${lines.length} native installers.`);
