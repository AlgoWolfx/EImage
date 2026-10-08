import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const folder = ".impeccable/review";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const metrics = [];
async function draw(page, a, b) {
  const c = page.locator("canvas");
  await c.scrollIntoViewIfNeeded();
  const r = await c.boundingBox();
  await page.mouse.move(
    r.x + (r.width * a[0]) / 1100,
    r.y + (r.height * a[1]) / 680,
  );
  await page.mouse.down();
  await page.mouse.move(
    r.x + (r.width * b[0]) / 1100,
    r.y + (r.height * b[1]) / 680,
    { steps: 8 },
  );
  await page.mouse.up();
}
async function annotate(page) {
  await page.getByRole("button", { name: "Conceal", exact: true }).click();
  await draw(page, [280, 544], [510, 578]);
  await page.getByRole("button", { name: "Arrow", exact: true }).click();
  await draw(page, [635, 340], [467, 431]);
}

try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1100],
    ["mobile", 390, 844],
    ["narrow", 320, 900],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto("http://127.0.0.1:5176");
    await page.getByRole("img", { name: /Screenshot, 1100 by 680/ }).waitFor();
    await annotate(page);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${folder}/${name}.png` });
    await page.screenshot({
      path: `${folder}/${name}-full.png`,
      fullPage: true,
    });
    metrics.push({
      name,
      ...(await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        fonts: document.fonts.status,
        canvas: [
          document.querySelector("canvas").width,
          document.querySelector("canvas").height,
        ],
        bodyFont: getComputedStyle(document.body).fontFamily,
      }))),
    });
    if (name === "desktop") {
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector(".button:not(.primary)"))
            .backgroundColor === "rgb(27, 35, 31)",
      );
      await page.screenshot({ path: `${folder}/dark.png` });
    }
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 1200, height: 820 },
  });
  await page.goto("http://127.0.0.1:5175");
  await page
    .getByRole("heading", { name: "Your next screenshot starts here." })
    .waitFor();
  await page.screenshot({ path: `${folder}/editor-empty.png` });
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("img", { name: /1100 by 680/ }).waitFor();
  await annotate(page);
  await page.screenshot({ path: `${folder}/editor.png` });
  await writeFile(
    `${folder}/capture-metrics.json`,
    JSON.stringify(metrics, null, 2),
  );
  console.log(metrics);
} finally {
  await browser.close();
}
