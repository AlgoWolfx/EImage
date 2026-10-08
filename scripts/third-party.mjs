import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
const sections = [
  "# Third-party notices\n\nEIMAGE itself is MIT-licensed. The following notices accompany the JavaScript and Rust components in a source/native distribution. Platform GTK/WebKit libraries are supplied by the operating system, not redistributed as part of EIMAGE.",
];
for (const name of [
  "react",
  "react-dom",
  "scheduler",
  "lucide-react",
  "@tauri-apps/api",
]) {
  const root = path.join("node_modules", name);
  const pkg = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  );
  let text = "";
  for (const file of await readdir(root))
    if (/^licen[cs]e/i.test(file))
      text += await readFile(path.join(root, file), "utf8");
  sections.push(
    `## ${name} ${pkg.version}\n\nLicense: ${pkg.license}\n\n${text}`,
  );
}
const cargo = process.env.EIMAGE_CARGO || "cargo";
const metadata = JSON.parse(
  execFileSync(
    cargo,
    [
      "metadata",
      "--locked",
      "--format-version",
      "1",
      "--manifest-path",
      "apps/desktop/src-tauri/Cargo.toml",
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
  ),
);
for (const pkg of metadata.packages
  .filter((p) => p.name !== "eimage")
  .sort((a, b) => a.name.localeCompare(b.name))) {
  const root = path.dirname(pkg.manifest_path);
  let text = "";
  for (const file of await readdir(root, { withFileTypes: true }))
    if (
      file.isFile() &&
      /^(license|licence|copying|notice)([.-]|$)/i.test(file.name)
    )
      text += `\n${file.name}\n${await readFile(path.join(root, file.name), "utf8")}`;
  sections.push(
    `## ${pkg.name} ${pkg.version}\n\nLicense: ${pkg.license || "See upstream license file"}\nRepository: ${pkg.repository || pkg.source || "Cargo registry"}\n${text}`,
  );
}
await writeFile("docs/THIRD_PARTY_NOTICES.md", sections.join("\n\n") + "\n");
console.log(
  `Recorded notices for ${sections.length - 1} dependencies, including target-specific Cargo packages.`,
);
