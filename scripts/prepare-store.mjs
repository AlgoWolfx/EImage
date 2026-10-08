import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  storeIdentity,
  assertWindowsX64PEHeader,
  assertStoreLogo,
  createStoreManifest,
} from "../packages/store/src/manifest.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const validationOnly = args.includes("--validation-only");
try {
  if (args.some((a) => !["--validation-only", "--check-identity"].includes(a)))
    throw new Error("Unknown Store packaging option.");
  const identity = storeIdentity(process.env, validationOnly);
  if (args.includes("--check-identity")) {
    console.log(JSON.stringify({ identityReady: true, validationOnly }));
  } else {
    const binary = path.join(
      root,
      "apps/desktop/src-tauri/target/release/eimage.exe",
    );
    if ((await stat(binary)).size > 512 * 1024 * 1024)
      throw new Error("Store executable exceeds the packaging memory bound.");
    const bytes = await readFile(binary);
    assertWindowsX64PEHeader(bytes);
    const outputDir = path.join(
      root,
      "artifacts",
      validationOnly ? "store-validation" : "store",
    );
    await mkdir(outputDir, { recursive: true });
    const staging = await mkdtemp(path.join(outputDir, "staging-"));
    await mkdir(path.join(staging, "Assets"));
    await mkdir(path.join(staging, "licenses"));
    await copyFile(binary, path.join(staging, "eimage.exe"));
    for (const [name, size] of [
      ["Square44x44Logo.png", 44],
      ["Square150x150Logo.png", 150],
      ["StoreLogo.png", 50],
    ]) {
      const source = path.join(root, "apps/desktop/store/assets", name);
      assertStoreLogo(await readFile(source), size);
      await copyFile(source, path.join(staging, "Assets", name));
    }
    await copyFile(
      path.join(root, "LICENSE"),
      path.join(staging, "licenses/LICENSE"),
    );
    await copyFile(
      path.join(root, "docs/THIRD_PARTY_NOTICES.md"),
      path.join(staging, "licenses/THIRD_PARTY_NOTICES.md"),
    );
    await writeFile(
      path.join(staging, "AppxManifest.xml"),
      createStoreManifest(identity),
    );
    const packagePath = path.join(
      outputDir,
      `EIMAGE_${identity.version}_x64_${validationOnly ? "validation-only" : "store-upload"}.msix`,
    );
    const descriptor = {
      validationOnly,
      identity,
      staging,
      packagePath,
      appSha256: createHash("sha256").update(bytes).digest("hex"),
    };
    await writeFile(
      path.join(outputDir, "package-metadata.json"),
      JSON.stringify(descriptor, null, 2) + "\n",
    );
    console.log(JSON.stringify(descriptor));
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
