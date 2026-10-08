import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PNG } from "pngjs";
const ready = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Screenshot, 1100 by 680/ }),
  ).toBeVisible();
};
async function pixels(
  page: import("@playwright/test").Page,
  x: number,
  y: number,
) {
  return page
    .locator("canvas")
    .evaluate(
      (c, a) =>
        Array.from(
          (c as HTMLCanvasElement)
            .getContext("2d")!
            .getImageData(a[0], a[1], 1, 1).data,
        ),
      [x, y],
    );
}
test("concealment is opaque in actual exported PNG pixels", async ({
  page,
}) => {
  await ready(page);
  const original = await pixels(page, 400, 300);
  await page.getByRole("button", { name: "Conceal", exact: true }).click();
  await page.getByRole("button", { name: "Add at center" }).click();
  expect(await pixels(page, 400, 300)).toEqual([21, 27, 24, 255]);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save image", exact: true }).click();
  const file = await (await download).path();
  const png = PNG.sync.read(
    await (await import("node:fs/promises")).readFile(file!),
  );
  expect(
    Array.from(
      png.data.subarray(
        (300 * png.width + 400) * 4,
        (300 * png.width + 400) * 4 + 4,
      ),
    ),
  ).toEqual([21, 27, 24, 255]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await pixels(page, 400, 300)).toEqual(original);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  expect(await pixels(page, 400, 300)).toEqual([21, 27, 24, 255]);
});
test("crop exports its selected dimensions and undo restores image", async ({
  page,
}) => {
  await ready(page);
  await page.getByRole("button", { name: "Crop", exact: true }).click();
  await page.getByRole("button", { name: "Select center area" }).click();
  await page.getByRole("button", { name: "Apply crop" }).click();
  await expect(
    page.getByRole("img", { name: /Screenshot, 440 by 204/ }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save image", exact: true }).click();
  const png = PNG.sync.read(
    await (
      await import("node:fs/promises")
    ).readFile((await (await download).path())!),
  );
  expect([png.width, png.height]).toEqual([440, 204]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /Screenshot, 1100 by 680/ }),
  ).toBeVisible();
});
for (const format of ["JPEG · smaller file", "WebP · compact"])
  test(`${format} exports real expected image format`, async ({ page }) => {
    await ready(page);
    await page
      .getByLabel("Format", { exact: true })
      .selectOption({ label: format });
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save image", exact: true }).click();
    const file = await (await download).path();
    const data = await (await import("node:fs/promises")).readFile(file!);
    if (format.startsWith("JPEG"))
      expect(Array.from(data.subarray(0, 2))).toEqual([255, 216]);
    else expect(data.subarray(8, 12).toString()).toBe("WEBP");
  });
test("pointer arrow drawing and keyboard undo are functional", async ({
  page,
}) => {
  await ready(page);
  const c = page.locator("canvas");
  await c.scrollIntoViewIfNeeded();
  const r = (await c.boundingBox())!;
  const before = await c.evaluate((el) =>
    (el as HTMLCanvasElement).toDataURL(),
  );
  await page.mouse.move(r.x + r.width * 0.25, r.y + r.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width * 0.7, r.y + r.height * 0.65, {
    steps: 8,
  });
  await page.mouse.up();
  expect(
    (await c.evaluate((el) => (el as HTMLCanvasElement).toDataURL())) !==
      before,
  ).toBe(true);
  await page.keyboard.press("Control+z");
  expect(await c.evaluate((el) => (el as HTMLCanvasElement).toDataURL())).toBe(
    before,
  );
});
test("text places visible pixels and filename keyboard edits do not change tools", async ({
  page,
}) => {
  await ready(page);
  const before = await page
    .locator("canvas")
    .evaluate((el) => (el as HTMLCanvasElement).toDataURL());
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.getByLabel("Text", { exact: true }).fill("An explicit note");
  await page.getByRole("button", { name: "Add at center" }).click();
  expect(
    (await page
      .locator("canvas")
      .evaluate((el) => (el as HTMLCanvasElement).toDataURL())) !== before,
  ).toBe(true);
  await page.getByLabel("File name", { exact: true }).fill("arrow crop redact");
  await expect(
    page.getByRole("button", { name: "Text", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("failed imports preserve the current image and explain recovery", async ({
  page,
}) => {
  await ready(page);
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.png",
    mimeType: "image/png",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.getByRole("alert")).toContainText("not a supported");
  await expect(page.getByRole("img", { name: /1100 by 680/ })).toBeVisible();
});
test("replacement requires a deliberate choice and clearing releases the editor", async ({
  page,
}) => {
  await ready(page);
  await page.getByRole("button", { name: "Add at center" }).click();
  await page.getByRole("button", { name: "Clear image" }).click();
  await expect(page.getByRole("alert")).toContainText("Replace this image?");
  await page.getByRole("button", { name: "Keep editing" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Clear image" }).click();
  await page.getByRole("button", { name: "Replace image" }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
});
for (const [name, width, height] of [
  ["desktop", 1440, 1100],
  ["mobile", 390, 844],
  ["narrow", 320, 900],
] as const)
  test(`${name}: no overflow, accessible controls and no remote requests`, async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (r) => {
      if (
        !r.url().startsWith("http://127.0.0.1:4176") &&
        !r.url().startsWith("data:")
      )
        requests.push(r.url());
    });
    await page.setViewportSize({ width, height });
    await ready(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    expect(requests).toEqual([]);
  });
test("dark theme preserves contrast and persists only a theme preference", async ({
  page,
}) => {
  await ready(page);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([
    "eimage-theme",
  ]);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("browser capture is explicitly unavailable and source links are real", async ({
  page,
}) => {
  await ready(page);
  await expect(
    page.getByRole("button", { name: "Capture", exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole("link", { name: "View source" })).toHaveAttribute(
    "href",
    "https://github.com/AlgoWolfx/EIMAGE",
  );
});
