export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };
export type Tool = "arrow" | "rectangle" | "draw" | "text" | "redact" | "crop";
export type Mark = {
  tool: Exclude<Tool, "crop">;
  points: Point[];
  color: string;
  width: number;
  text?: string;
  fontSize?: number;
};
export type DocumentState = { crop: Rect; marks: Mark[] };
export type History = {
  past: DocumentState[];
  present: DocumentState;
  future: DocumentState[];
};
export const MAX_PIXELS = 32_000_000;
export const MAX_BYTES = 30 * 1024 * 1024;
export const HISTORY_LIMIT = 60;
export function dimensionsAllowed(width: number, height: number) {
  return (
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width > 0 &&
    height > 0 &&
    width <= 16384 &&
    height <= 16384 &&
    width * height <= MAX_PIXELS
  );
}
export function normalizedRect(a: Point, b: Point, bounds: Rect): Rect {
  const x = Math.max(bounds.x, Math.min(a.x, b.x));
  const y = Math.max(bounds.y, Math.min(a.y, b.y));
  const right = Math.min(bounds.x + bounds.width, Math.max(a.x, b.x));
  const bottom = Math.min(bounds.y + bounds.height, Math.max(a.y, b.y));
  return {
    x: Math.floor(x),
    y: Math.floor(y),
    width: Math.max(0, Math.ceil(right) - Math.floor(x)),
    height: Math.max(0, Math.ceil(bottom) - Math.floor(y)),
  };
}
export function initialHistory(width: number, height: number): History {
  if (!dimensionsAllowed(width, height))
    throw new Error(
      "Use an image up to 32 megapixels and 16,384 pixels per side.",
    );
  return {
    past: [],
    present: { crop: { x: 0, y: 0, width, height }, marks: [] },
    future: [],
  };
}
export function commit(history: History, present: DocumentState): History {
  return {
    past: [...history.past.slice(-(HISTORY_LIMIT - 1)), history.present],
    present,
    future: [],
  };
}
export function undo(h: History): History {
  const p = h.past.at(-1);
  return p
    ? {
        past: h.past.slice(0, -1),
        present: p,
        future: [h.present, ...h.future],
      }
    : h;
}
export function redo(h: History): History {
  const f = h.future[0];
  return f
    ? { past: [...h.past, h.present], present: f, future: h.future.slice(1) }
    : h;
}
export function markRect(m: Mark, bounds: Rect) {
  return normalizedRect(m.points[0], m.points.at(-1)!, bounds);
}
export function renderDocument(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  state: DocumentState,
  white = false,
) {
  const { crop } = state;
  ctx.clearRect(0, 0, crop.width, crop.height);
  if (white) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, crop.width, crop.height);
  }
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );
  ctx.save();
  ctx.translate(-crop.x, -crop.y);
  for (const m of state.marks) renderMark(ctx, m, crop);
  ctx.restore();
}
export function renderMark(
  ctx: CanvasRenderingContext2D,
  m: Mark,
  bounds: Rect,
) {
  ctx.save();
  ctx.strokeStyle = m.color;
  ctx.fillStyle = m.color;
  ctx.lineWidth = m.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const a = m.points[0],
    b = m.points.at(-1)!;
  if (m.tool === "redact") {
    const r = markRect(m, bounds);
    ctx.fillStyle = "#151b18";
    ctx.fillRect(r.x, r.y, r.width, r.height);
  } else if (m.tool === "rectangle") {
    const r = markRect(m, bounds);
    ctx.strokeRect(r.x, r.y, r.width, r.height);
  } else if (m.tool === "text") {
    ctx.font = `600 ${m.fontSize || 24}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textBaseline = "top";
    for (const [i, line] of (m.text || "").split("\n").entries())
      ctx.fillText(line, a.x, a.y + i * (m.fontSize || 24) * 1.3);
  } else {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    for (const p of m.points.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (m.tool === "arrow") {
      const angle = Math.atan2(b.y - a.y, b.x - a.x),
        length = Math.max(12, m.width * 4);
      ctx.beginPath();
      ctx.moveTo(
        b.x - length * Math.cos(angle - 0.5),
        b.y - length * Math.sin(angle - 0.5),
      );
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(
        b.x - length * Math.cos(angle + 0.5),
        b.y - length * Math.sin(angle + 0.5),
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}
export type RasterInfo = {
  format: "png" | "jpeg" | "webp";
  width: number;
  height: number;
};
export function inspectRaster(bytes: Uint8Array): RasterInfo {
  if (bytes.length > MAX_BYTES)
    throw new Error("Use a PNG, JPEG or WebP file under 30 MB.");
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const str = (offset: number, len: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + len));
  let info: RasterInfo | undefined;
  if (
    bytes.length >= 24 &&
    str(1, 3) === "PNG" &&
    bytes[0] === 137 &&
    str(12, 4) === "IHDR"
  )
    info = { format: "png", width: d.getUint32(16), height: d.getUint32(20) };
  else if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216) {
    let i = 2;
    while (i + 3 < bytes.length) {
      if (bytes[i++] !== 255) break;
      while (bytes[i] === 255) i++;
      const marker = bytes[i++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (i + 2 > bytes.length) break;
      const size = d.getUint16(i);
      if (size < 2 || i + size > bytes.length) break;
      if (
        [
          0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
          0xce, 0xcf,
        ].includes(marker) &&
        size >= 7
      ) {
        info = {
          format: "jpeg",
          height: d.getUint16(i + 3),
          width: d.getUint16(i + 5),
        };
        break;
      }
      i += size;
    }
  } else if (
    bytes.length >= 30 &&
    str(0, 4) === "RIFF" &&
    str(8, 4) === "WEBP"
  ) {
    const chunk = str(12, 4);
    if (chunk === "VP8X") {
      const u24 = (i: number) =>
        bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16);
      info = { format: "webp", width: 1 + u24(24), height: 1 + u24(27) };
    } else if (chunk === "VP8L" && bytes[20] === 0x2f) {
      const v = d.getUint32(21, true);
      info = {
        format: "webp",
        width: (v & 16383) + 1,
        height: ((v >>> 14) & 16383) + 1,
      };
    } else if (
      chunk === "VP8 " &&
      bytes[23] === 0x9d &&
      bytes[24] === 1 &&
      bytes[25] === 0x2a
    ) {
      info = {
        format: "webp",
        width: d.getUint16(26, true) & 16383,
        height: d.getUint16(28, true) & 16383,
      };
    }
  }
  if (!info)
    throw new Error("This file is not a supported PNG, JPEG or WebP image.");
  if (!dimensionsAllowed(info.width, info.height))
    throw new Error(
      "Use an image up to 32 megapixels and 16,384 pixels per side.",
    );
  return info;
}
export async function decodeImage(blob: Blob): Promise<ImageBitmap> {
  inspectRaster(new Uint8Array(await blob.arrayBuffer()));
  const image = await createImageBitmap(blob);
  if (!dimensionsAllowed(image.width, image.height)) {
    image.close();
    throw new Error("This image is too large to edit safely.");
  }
  return image;
}
export async function exportImage(
  image: CanvasImageSource,
  state: DocumentState,
  format: "png" | "jpeg" | "webp",
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = state.crop.width;
  canvas.height = state.crop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error(
      "Image export is unavailable. Restart EIMAGE and try again.",
    );
  renderDocument(ctx, image, state, format === "jpeg");
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        canvas.width = canvas.height = 1;
        if (!blob)
          reject(new Error("The image could not be exported. Try PNG."));
        else if (blob.type !== `image/${format}`)
          reject(
            new Error(
              `${format.toUpperCase()} export is unavailable in this runtime. Choose PNG.`,
            ),
          );
        else resolve(blob);
      },
      `image/${format}`,
      0.92,
    ),
  );
}
