import { describe, it, expect } from "vitest";
import {
  commit,
  dimensionsAllowed,
  HISTORY_LIMIT,
  initialHistory,
  inspectRaster,
  normalizedRect,
  redo,
  undo,
  MAX_BYTES,
} from "../packages/editor/src/model";
function png(w: number, h: number) {
  const b = new Uint8Array(24);
  b.set([137, 80, 78, 71]);
  b.set([73, 72, 68, 82], 12);
  new DataView(b.buffer).setUint32(16, w);
  new DataView(b.buffer).setUint32(20, h);
  return b;
}
describe("bounded image loading", () => {
  it("reads raster dimensions before decoding", () =>
    expect(inspectRaster(png(1200, 800))).toEqual({
      format: "png",
      width: 1200,
      height: 800,
    }));
  it.each([
    [0, 10],
    [20_000, 2],
    [8000, 8000],
  ])("rejects unsafe dimensions %s × %s", (w, h) =>
    expect(() => inspectRaster(png(w, h))).toThrow(),
  );
  it("allows ordinary high-DPI screenshots", () =>
    expect(dimensionsAllowed(6000, 4000)).toBe(true));
  it("rejects SVG and non-image input", () =>
    expect(() =>
      inspectRaster(new TextEncoder().encode("<svg></svg>")),
    ).toThrow("not a supported"));
  it("rejects excessive input bytes", () =>
    expect(() => inspectRaster(new Uint8Array(MAX_BYTES + 1))).toThrow(
      "under 30 MB",
    ));
  it("reads a JPEG frame marker", () => {
    const b = Uint8Array.from([255, 216, 255, 192, 0, 7, 8, 0, 60, 0, 80]);
    expect(inspectRaster(b)).toEqual({ format: "jpeg", width: 80, height: 60 });
  });
  it("rejects truncated JPEG segments", () =>
    expect(() =>
      inspectRaster(
        Uint8Array.from([255, 216, 255, 192, 255, 255, 8, 0, 60, 0, 80]),
      ),
    ).toThrow());
  it("reads lossless WebP dimensions", () => {
    const b = new Uint8Array(30);
    b.set(new TextEncoder().encode("RIFF"));
    b.set(new TextEncoder().encode("WEBPVP8L"), 8);
    b[20] = 0x2f;
    new DataView(b.buffer).setUint32(21, 79 | (59 << 14), true);
    expect(inspectRaster(b)).toEqual({ format: "webp", width: 80, height: 60 });
  });
});
describe("non-destructive edits", () => {
  it("normalizes reverse drag and clips to image bounds", () =>
    expect(
      normalizedRect(
        { x: 130, y: 90 },
        { x: -10, y: 5 },
        { x: 0, y: 0, width: 100, height: 70 },
      ),
    ).toEqual({ x: 0, y: 5, width: 100, height: 65 }));
  it("keeps crop positions in original image coordinates", () =>
    expect(
      normalizedRect(
        { x: 80, y: 90 },
        { x: 220, y: 170 },
        { x: 100, y: 100, width: 100, height: 100 },
      ),
    ).toEqual({ x: 100, y: 100, width: 100, height: 70 }));
  it("undoes and redoes a crop while preserving annotations", () => {
    const h = initialHistory(100, 100),
      next = commit(h, {
        ...h.present,
        crop: { x: 20, y: 20, width: 50, height: 50 },
      });
    expect(undo(next).present).toEqual(h.present);
    expect(redo(undo(next)).present).toEqual(next.present);
  });
  it("clears redo after a new edit", () => {
    let h = initialHistory(100, 100);
    h = commit(h, {
      ...h.present,
      crop: { x: 0, y: 0, width: 80, height: 80 },
    });
    h = undo(h);
    h = commit(h, {
      ...h.present,
      crop: { x: 0, y: 0, width: 60, height: 60 },
    });
    expect(h.future).toEqual([]);
  });
  it("bounds undo memory without gating features", () => {
    let h = initialHistory(100, 100);
    for (let i = 0; i < 100; i++) h = commit(h, { ...h.present });
    expect(h.past).toHaveLength(HISTORY_LIMIT);
  });
});
