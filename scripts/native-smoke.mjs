import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile),
  url = process.env.EIMAGE_DRIVER_URL || "http://127.0.0.1:4444";
const application =
  process.env.EIMAGE_NATIVE_BINARY ||
  fileURLToPath(
    new URL("../apps/desktop/src-tauri/target/debug/eimage", import.meta.url),
  );
let session;
async function request(method, path, data) {
  const response = await fetch(`${url}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const json = await response.json();
  if (!response.ok || json.value?.error)
    throw new Error(`${path}: ${JSON.stringify(json).slice(0, 1200)}`);
  return json.value;
}
const execute = (script, args = []) =>
  request("POST", `/session/${session}/execute/sync`, { script, args });
async function wait(script, seconds = 15) {
  const start = Date.now();
  while (Date.now() - start < seconds * 1000) {
    const result = await execute(script);
    if (result) return result;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Native smoke wait timed out: " + script);
}
async function click(text) {
  const node = await execute(
    'return [...document.querySelectorAll("button")].find(b=>b.textContent.trim()===arguments[0]);',
    [text],
  );
  assert(node, `Missing button ${text}`);
  await request(
    "POST",
    `/session/${session}/element/${node["element-6066-11e4-a52e-4f735466cecf"]}/click`,
    {},
  );
}
const report = { application, checks: [] };
try {
  const created = await request("POST", "/session", {
    capabilities: { alwaysMatch: { "tauri:options": { application } } },
  });
  session = created.sessionId;
  assert(session);
  await wait(
    'return document.querySelector(".empty-canvas h2")?.textContent.includes("Your next screenshot");',
  );
  assert.equal(
    await execute(
      'return [...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Capture").disabled;',
    ),
    false,
  );
  report.checks.push("Tauri native bridge active");
  await click("Capture");
  await wait(
    'return document.querySelector(".capture-panel select")?.options.length>0;',
  );
  const sources = await execute(
    'return [...document.querySelector(".capture-panel select").options].map(o=>({value:o.value,label:o.textContent}));',
  );
  assert(sources.some((s) => s.value.startsWith("screen:")));
  report.sources = sources;
  report.checks.push("Real screen/window enumeration");
  await click("Take screenshot");
  await wait('return document.querySelector("canvas")?.width===1440;');
  assert.equal(
    await execute('return document.querySelector("canvas").height;'),
    1000,
  );
  report.checks.push(
    "Actual 1440 × 1000 X11 screen capture, editor hidden and restored",
  );
  const windowSource = sources.find(
    (s) =>
      s.value.startsWith("window:") &&
      (s.label.includes("EIMAGE capture fixture") ||
        s.label.includes("native-window.html")),
  );
  if (process.env.EIMAGE_REQUIRE_WINDOW)
    assert(windowSource, "Window capture fixture was not enumerated");
  if (windowSource) {
    await click("Capture");
    await wait('return !!document.querySelector(".capture-panel select");');
    await execute(
      'const s=document.querySelector(".capture-panel select");s.value=arguments[0];s.dispatchEvent(new Event("change",{bubbles:true}));',
      [windowSource.value],
    );
    await click("Take screenshot");
    const dims = windowSource.label.match(/(\d+) × (\d+)$/);
    await wait(
      `return document.querySelector("canvas")?.width===${Number(dims[1])};`,
    );
    assert.equal(
      await execute('return document.querySelector("canvas").height;'),
      Number(dims[2]),
    );
    report.checks.push(
      "Actual X11 window capture at the enumerated source dimensions",
    );
    await click("Capture");
    await wait('return !!document.querySelector(".capture-panel select");');
    await click("Take screenshot");
    await wait('return document.querySelector("canvas")?.width===1440;');
  }

  await click("Conceal");
  await click("Add at center");
  assert.deepEqual(
    await execute(
      'return Array.from(document.querySelector("canvas").getContext("2d").getImageData(600,450,1,1).data);',
    ),
    [21, 27, 24, 255],
  );
  report.checks.push("Native WebKit canvas opaque concealment");
  await click("Copy image");
  await wait(
    'return document.querySelector("[role=status]")?.textContent.includes("Image copied");',
  );
  report.checks.push("Native image clipboard write");
  if (process.env.EIMAGE_XCLIP) {
    const clip = await run(
      process.env.EIMAGE_XCLIP,
      ["-selection", "clipboard", "-t", "image/png", "-o"],
      {
        env: { ...process.env, DISPLAY: process.env.DISPLAY || ":99" },
        encoding: "buffer",
        maxBuffer: 30 * 1024 * 1024,
      },
    );
    const { PNG } = await import("pngjs");
    const decoded = PNG.sync.read(clip.stdout);
    assert.deepEqual([decoded.width, decoded.height], [1440, 1000]);
    report.checks.push("Independent X11 clipboard PNG readback");
  }

  if (process.env.EIMAGE_XDOTOOL) {
    const basename = `eimage-native-export-${Date.now()}`;
    const file = `/tmp/${basename}.png`;
    const input = await execute(
      'return document.querySelector(".export-settings input");',
    );
    const inputId = input["element-6066-11e4-a52e-4f735466cecf"];
    await request("POST", `/session/${session}/element/${inputId}/clear`, {});
    await request("POST", `/session/${session}/element/${inputId}/value`, {
      text: basename,
    });
    const env = { ...process.env, DISPLAY: process.env.DISPLAY || ":99" };
    await click("Save image");
    let dialog;
    for (let i = 0; i < 50; i++) {
      try {
        dialog = (
          await run(
            process.env.EIMAGE_XDOTOOL,
            ["search", "--onlyvisible", "--name", "^Save screenshot$"],
            { env },
          )
        ).stdout
          .trim()
          .split("\n")
          .at(-1);
        if (dialog) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    assert(dialog, "Native save dialog did not appear");
    await run(
      process.env.EIMAGE_XDOTOOL,
      ["windowactivate", "--sync", dialog],
      { env },
    );
    await run(process.env.EIMAGE_XDOTOOL, ["key", "ctrl+l"], { env });
    await run(
      process.env.EIMAGE_XDOTOOL,
      ["type", "--clearmodifiers", `/tmp/${basename}`],
      { env },
    );
    await run(process.env.EIMAGE_XDOTOOL, ["key", "Return", "alt+s"], { env });
    await wait(
      'return document.querySelector("[role=status]")?.textContent.includes("Saved to ");',
    );
    const savedStatus = await execute(
      'return document.querySelector("[role=status]").textContent;',
    );
    const actualPath = savedStatus.match(/^Saved to (.+)\. Annotations/)[1];
    console.log({ requestedSave: file, actualSave: actualPath });
    const bytes = await readFile(actualPath);
    assert.deepEqual(Array.from(bytes.subarray(0, 4)), [137, 80, 78, 71]);
    const { PNG } = await import("pngjs");
    const decoded = PNG.sync.read(bytes);
    assert.deepEqual([decoded.width, decoded.height], [1440, 1000]);
    assert.deepEqual(
      Array.from(
        decoded.data.subarray(
          (450 * decoded.width + 600) * 4,
          (450 * decoded.width + 600) * 4 + 4,
        ),
      ),
      [21, 27, 24, 255],
    );
    report.export = actualPath;
    report.checks.push(
      "Native save dialog writes a valid flattened PNG with opaque concealed pixels",
    );
    await click("Save image");
    let cancelDialog;
    for (let i = 0; i < 50; i++) {
      try {
        cancelDialog = (
          await run(
            process.env.EIMAGE_XDOTOOL,
            ["search", "--onlyvisible", "--name", "^Save screenshot$"],
            { env },
          )
        ).stdout
          .trim()
          .split("\n")
          .at(-1);
        if (cancelDialog) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    assert(cancelDialog);
    await run(
      process.env.EIMAGE_XDOTOOL,
      ["windowactivate", "--sync", cancelDialog],
      { env },
    );
    await run(process.env.EIMAGE_XDOTOOL, ["key", "Escape"], { env });
    await wait(
      'return document.querySelector("[role=status]")?.textContent.includes("Save canceled");',
    );
    assert.equal(
      await execute('return document.querySelector("canvas").width;'),
      1440,
    );
    report.checks.push("Native save cancellation preserves the current image");
  }

  await mkdir(".impeccable/review", { recursive: true });
  await writeFile(
    ".impeccable/review/native.png",
    Buffer.from(
      await request("GET", `/session/${session}/screenshot`),
      "base64",
    ),
  );
  await writeFile(
    ".impeccable/review/native-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(report);
} catch (e) {
  if (session) {
    console.error(
      await execute("return document.body.innerText;").catch(
        () => "(no readable UI)",
      ),
    );
  }
  throw e;
} finally {
  if (session) await request("DELETE", `/session/${session}`).catch(() => {});
}
