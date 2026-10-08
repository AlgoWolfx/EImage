import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  ArrowUpRight,
  Square,
  Pencil,
  Type,
  Crop,
  Shield,
  Undo2,
  Redo2,
  Copy,
  Download,
  ImagePlus,
  ScanLine,
  X,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import {
  commit,
  decodeImage,
  exportImage,
  initialHistory,
  normalizedRect,
  redo,
  renderDocument,
  renderMark,
  undo,
  type History,
  type Mark,
  type Point,
  type Rect,
  type Tool,
} from "./model";
import { createDemo } from "./demo";
import "./editor.css";
export type CaptureSource = {
  id: number;
  kind: "screen" | "window";
  name: string;
  width: number;
  height: number;
};
export type NativeBridge = {
  sources: () => Promise<CaptureSource[]>;
  capture: (source: CaptureSource) => Promise<Blob>;
  save: (blob: Blob, name: string) => Promise<string | null>;
  copy: (blob: Blob) => Promise<void>;
};
const tools = [
  { id: "arrow", name: "Arrow", Icon: ArrowUpRight, key: "A" },
  { id: "rectangle", name: "Rectangle", Icon: Square, key: "R" },
  { id: "draw", name: "Draw", Icon: Pencil, key: "D" },
  { id: "text", name: "Text", Icon: Type, key: "T" },
  { id: "redact", name: "Conceal", Icon: Shield, key: "H" },
  { id: "crop", name: "Crop", Icon: Crop, key: "C" },
] as const;
export function Editor({
  bridge,
  demo = false,
}: {
  bridge?: NativeBridge;
  demo?: boolean;
}) {
  const [image, setImage] = useState<ImageBitmap>();
  const imageRef = useRef<ImageBitmap | undefined>(undefined);
  const [history, setHistory] = useState<History>();
  const [tool, setTool] = useState<Tool>("arrow");
  const [draft, setDraft] = useState<Mark>();
  const [selection, setSelection] = useState<Rect>();
  const [color, setColor] = useState("#c53636");
  const [width, setWidth] = useState(4);
  const [fontSize, setFontSize] = useState(26);
  const [text, setText] = useState("Look here");
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [name, setName] = useState("screenshot");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [status, setStatus] = useState(
    demo
      ? "Example screenshot. Edit it or open your own image."
      : "Capture a screen or open an image to get started.",
  );
  const [error, setError] = useState("");
  const [sources, setSources] = useState<CaptureSource[]>([]);
  const [sourceKey, setSourceKey] = useState("");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [region, setRegion] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(1);
  const [replace, setReplace] = useState<(() => void) | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const gesture = useRef<
    { pointer: number; mark: Mark; crop: boolean } | undefined
  >(undefined);
  const live = useRef(true);
  const changed =
    !!history &&
    (history.present.marks.length > 0 ||
      history.present.crop.width !== image?.width ||
      history.present.crop.height !== image?.height);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      imageRef.current?.close();
      imageRef.current = undefined;
    };
  }, []);
  async function task(action: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      if (live.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      if (live.current) setBusy(false);
    }
  }
  async function load(blob: Blob, label = "screenshot") {
    const next = await decodeImage(blob);
    if (!live.current) {
      next.close();
      return;
    }
    imageRef.current?.close();
    imageRef.current = next;
    setImage(next);
    setHistory(initialHistory(next.width, next.height));
    setDraft(undefined);
    setSelection(undefined);
    setZoom(1);
    setName(label.replace(/\.[^.]+$/, "").slice(0, 100) || "screenshot");
    setStatus(`${next.width} × ${next.height} pixels. Ready to edit.`);
  }
  function replaceOr(action: () => void) {
    if (changed) setReplace(() => action);
    else action();
  }
  useEffect(() => {
    if (demo)
      void task(async () => {
        await load(await createDemo(), "example");
        setStatus("Example screenshot. All content is fictional.");
      });
  }, [demo]);
  useEffect(() => {
    const target = stage.current;
    if (!target || !history) return;
    const update = () =>
      setFit(
        Math.min(
          1,
          Math.max(
            0.05,
            (target.clientWidth - 48) / history.present.crop.width,
          ),
          Math.max(
            0.05,
            (target.clientHeight - 48) / history.present.crop.height,
          ),
        ),
      );
    const observer = new ResizeObserver(update);
    observer.observe(target);
    update();
    return () => observer.disconnect();
  }, [history?.present.crop.width, history?.present.crop.height]);
  useEffect(() => {
    const c = canvas.current;
    if (!c || !image || !history) return;
    const { crop } = history.present;
    c.width = crop.width;
    c.height = crop.height;
    const ctx = c.getContext("2d")!;
    renderDocument(ctx, image, history.present);
    if (draft) {
      ctx.save();
      ctx.translate(-crop.x, -crop.y);
      renderMark(ctx, draft, crop);
      ctx.restore();
    }
    if (selection) {
      ctx.save();
      ctx.strokeStyle = "#22634b";
      ctx.lineWidth = 2 / Math.max(fit * zoom, 0.1);
      ctx.setLineDash([6 / (fit * zoom), 4 / (fit * zoom)]);
      ctx.strokeRect(
        selection.x - crop.x,
        selection.y - crop.y,
        selection.width,
        selection.height,
      );
      ctx.restore();
    }
  }, [image, history, draft, selection, fit, zoom]);
  function location(e: PointerEvent<HTMLCanvasElement>): Point {
    const r = e.currentTarget.getBoundingClientRect();
    const c = history!.present.crop;
    return {
      x: Math.min(
        c.x + c.width,
        Math.max(c.x, ((e.clientX - r.left) * c.width) / r.width + c.x),
      ),
      y: Math.min(
        c.y + c.height,
        Math.max(c.y, ((e.clientY - r.top) * c.height) / r.height + c.y),
      ),
    };
  }
  function start(e: PointerEvent<HTMLCanvasElement>) {
    if (!history || busy || e.button !== 0) return;
    const p = location(e);
    if (tool === "text") {
      if (!text.trim()) {
        setError("Enter text in the settings panel, then click the image.");
        return;
      }
      add({
        tool: "text",
        points: [p],
        color,
        width,
        text: text.slice(0, 500),
        fontSize,
      });
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    const m: Mark = {
      tool: tool === "crop" ? "rectangle" : tool,
      points: [p, p],
      color,
      width,
    };
    gesture.current = { pointer: e.pointerId, mark: m, crop: tool === "crop" };
    setSelection(undefined);
    setDraft(tool === "crop" ? undefined : m);
  }
  function move(e: PointerEvent<HTMLCanvasElement>) {
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointer || !history) return;
    const p = location(e);
    g.mark = {
      ...g.mark,
      points:
        g.mark.tool === "draw"
          ? [...g.mark.points, p].slice(0, 10000)
          : [g.mark.points[0], p],
    };
    if (g.crop)
      setSelection(normalizedRect(g.mark.points[0], p, history.present.crop));
    else setDraft(g.mark);
  }
  function end(e: PointerEvent<HTMLCanvasElement>) {
    const g = gesture.current;
    if (!g || g.pointer !== e.pointerId) return;
    move(e);
    gesture.current = undefined;
    setDraft(undefined);
    if (
      !g.crop &&
      Math.hypot(
        g.mark.points[0].x - g.mark.points.at(-1)!.x,
        g.mark.points[0].y - g.mark.points.at(-1)!.y,
      ) > 1
    )
      add(g.mark);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function cancelGesture() {
    gesture.current = undefined;
    setDraft(undefined);
  }
  function add(m: Mark) {
    setHistory((h) =>
      h ? commit(h, { ...h.present, marks: [...h.present.marks, m] }) : h,
    );
    setStatus(
      m.tool === "redact"
        ? "Selected pixels are concealed. Saved images contain a solid cover."
        : "Annotation added.",
    );
  }
  function applyCrop() {
    if (!selection || selection.width < 1 || selection.height < 1) return;
    setHistory((h) => (h ? commit(h, { ...h.present, crop: selection }) : h));
    setSelection(undefined);
    setZoom(1);
    setStatus("Crop applied. Undo restores the previous area.");
  }
  function centerMark() {
    if (!history) return;
    const c = history.present.crop,
      a = {
        x: Math.round(c.x + c.width * 0.3),
        y: Math.round(c.y + c.height * 0.35),
      },
      b = {
        x: Math.round(c.x + c.width * 0.7),
        y: Math.round(c.y + c.height * 0.65),
      };
    if (tool === "crop") {
      setSelection(normalizedRect(a, b, c));
      return;
    }
    if (tool === "text" && !text.trim()) {
      setError("Enter the text you want to place.");
      return;
    }
    add({
      tool,
      points: [a, b],
      color,
      width,
      text: text.slice(0, 500),
      fontSize,
    });
  }
  async function showCapture() {
    if (!bridge) {
      setStatus(
        "Screen capture is available in the desktop app. You can open and edit images here.",
      );
      return;
    }
    await task(async () => {
      const choices = await bridge.sources();
      setSources(choices);
      setSourceKey(choices[0] ? `${choices[0].kind}:${choices[0].id}` : "");
      setCaptureOpen(true);
      if (!choices.length)
        throw new Error(
          "No capture sources found. Check screen permissions or use an X11 session on Linux.",
        );
    });
  }
  function captureSelected() {
    const source = sources.find((s) => `${s.kind}:${s.id}` === sourceKey);
    if (!source || !bridge) return;
    replaceOr(
      () =>
        void task(async () => {
          setStatus("Capturing… EIMAGE briefly hides its window.");
          const blob = await bridge.capture(source);
          await load(blob, "screenshot");
          setCaptureOpen(false);
          if (region) {
            setTool("crop");
            setStatus("Drag over the area you want, then choose Apply crop.");
          } else
            setStatus("Screenshot captured. Add an annotation or save it.");
        }),
    );
  }
  async function save() {
    if (!history || !image) return;
    await task(async () => {
      const blob = await exportImage(image, history.present, format);
      const filename = `${
        name
          .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
          .replace(/[. ]+$/, "")
          .trim() || "screenshot"
      }.${format === "jpeg" ? "jpg" : format}`;
      if (bridge) {
        const saved = await bridge.save(blob, filename);
        setStatus(
          saved
            ? `Saved to ${saved}. Annotations and concealed pixels are flattened.`
            : "Save canceled. Your image is still here.",
        );
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        setStatus(
          "Image downloaded. Annotations and concealed pixels are flattened.",
        );
      }
    });
  }
  async function copy() {
    if (!history || !image) return;
    await task(async () => {
      const blob = await exportImage(image, history.present, "png");
      if (bridge) await bridge.copy(blob);
      else {
        if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined")
          throw new Error(
            "Image copying is unavailable here. Use Save image instead.",
          );
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      }
      setStatus("Image copied. Paste it into another app.");
    });
  }
  const actions = useRef({ save, copy, showCapture });
  actions.current = { save, copy, showCapture };
  useEffect(() => {
    function key(e: KeyboardEvent) {
      const element = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) ||
        element.isContentEditable
      )
        return;
      const modifier = e.ctrlKey || e.metaKey;
      if (modifier && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (!busyRef.current) {
          setHistory((h) => (h ? (e.shiftKey ? redo(h) : undo(h)) : h));
          setSelection(undefined);
        }
        return;
      }
      if (modifier && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void (e.shiftKey
          ? actions.current.showCapture()
          : actions.current.save());
        return;
      }
      if (modifier && e.key.toLowerCase() === "c") {
        e.preventDefault();
        void actions.current.copy();
        return;
      }
      if (e.key === "Escape") {
        cancelGesture();
        setSelection(undefined);
        setCaptureOpen(false);
        setReplace(null);
      }
      if (!modifier && !e.altKey) {
        const t = tools.find(
          (t) => t.key.toLowerCase() === e.key.toLowerCase(),
        );
        if (t && !busyRef.current) {
          setTool(t.id);
          setSelection(undefined);
        }
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const crop = history?.present.crop;
  const active = tools.find((t) => t.id === tool)!;
  return (
    <section
      className={`editor ${demo ? "editor-demo" : ""}`}
      aria-label="Screenshot editor"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f && !busy) replaceOr(() => void task(() => load(f, f.name)));
      }}
    >
      <div className="editor-header">
        <div className="editor-identity">
          <ScanLine size={20} />
          <strong>EIMAGE</strong>
          <span>{bridge ? "Screenshot editor" : "Local image editor"}</span>
        </div>
        <div className="capture-actions">
          <button
            className="button primary"
            onClick={() => void showCapture()}
            disabled={busy || !bridge}
            title={
              bridge
                ? "Capture a screen or window"
                : "Screen capture requires the desktop app"
            }
          >
            <ScanLine size={16} />
            Capture
          </button>
          <button
            className="button"
            onClick={() => replaceOr(() => file.current?.click())}
            disabled={busy}
          >
            <ImagePlus size={16} />
            Open image
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void task(() => load(f, f.name));
            e.target.value = "";
          }}
        />
      </div>
      {captureOpen && (
        <div className="capture-panel">
          <label>
            Capture source
            <select
              value={sourceKey}
              onChange={(e) => setSourceKey(e.target.value)}
            >
              {["screen", "window"].map((kind) => (
                <optgroup
                  key={kind}
                  label={kind === "screen" ? "Screens" : "Windows"}
                >
                  {sources
                    .filter((s) => s.kind === kind)
                    .map((s) => (
                      <option value={`${kind}:${s.id}`} key={s.id}>
                        {s.name} · {s.width} × {s.height}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={region}
              onChange={(e) => setRegion(e.target.checked)}
            />
            Select a region after capture
          </label>
          <button
            className="button primary"
            disabled={busy || !sourceKey}
            onClick={captureSelected}
          >
            Take screenshot
          </button>
          <button
            className="icon-button"
            aria-label="Cancel capture"
            disabled={busy}
            onClick={() => setCaptureOpen(false)}
          >
            <X size={18} />
          </button>
          <small>
            macOS needs Screen Recording permission. Linux capture depends on
            your desktop session.
          </small>
        </div>
      )}
      {replace && (
        <div className="replacement" role="alert">
          <span>
            Replace this image? Save it first if you want to keep your edits.
          </span>
          <button className="button" onClick={() => setReplace(null)}>
            Keep editing
          </button>
          <button
            className="button"
            onClick={() => {
              const action = replace;
              setReplace(null);
              action();
            }}
          >
            Replace image
          </button>
        </div>
      )}
      <div className="toolbar" role="toolbar" aria-label="Annotation tools">
        {tools.map(({ id, name, Icon, key }) => (
          <button
            key={id}
            disabled={!image || busy}
            className={`tool ${tool === id ? "selected" : ""}`}
            aria-pressed={tool === id}
            title={`${name} (${key})`}
            onClick={() => {
              setTool(id);
              setSelection(undefined);
            }}
          >
            <Icon size={17} />
            <span>{name}</span>
          </button>
        ))}
        <span className="toolbar-divider" />
        <button
          className="icon-button"
          aria-label="Undo"
          title="Undo (Ctrl/Cmd+Z)"
          disabled={!history?.past.length || busy}
          onClick={() => {
            setHistory((h) => (h ? undo(h) : h));
            setSelection(undefined);
          }}
        >
          <Undo2 size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Redo"
          title="Redo (Ctrl/Cmd+Shift+Z)"
          disabled={!history?.future.length || busy}
          onClick={() => {
            setHistory((h) => (h ? redo(h) : h));
            setSelection(undefined);
          }}
        >
          <Redo2 size={18} />
        </button>
      </div>
      <div className="editor-workspace">
        <div className="image-workspace">
          <div className="canvas-stage" ref={stage}>
            {image && crop ? (
              <canvas
                ref={canvas}
                className={`image-canvas tool-${tool}`}
                aria-label={`Screenshot, ${crop.width} by ${crop.height} pixels. ${active.name} selected. Drag to annotate, or use Add at center in settings.`}
                role="img"
                style={{
                  width: crop.width * fit * zoom,
                  height: crop.height * fit * zoom,
                }}
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={end}
                onPointerCancel={cancelGesture}
                onLostPointerCapture={cancelGesture}
              />
            ) : (
              <div className="empty-canvas">
                <ScanLine size={38} />
                <h2>Your next screenshot starts here.</h2>
                <p>
                  {bridge
                    ? "Capture a screen or window, or open an existing image."
                    : "Open an image to try the editor. Screen capture runs in the desktop app."}
                </p>
                <button
                  className="button"
                  onClick={() => file.current?.click()}
                  disabled={busy}
                >
                  Choose image
                </button>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() =>
                    void task(async () => {
                      await load(await createDemo(), "example");
                      setStatus(
                        "Example screenshot. All content is fictional.",
                      );
                    })
                  }
                >
                  Try an example
                </button>
                <small>PNG, JPEG and WebP · processed on your device</small>
              </div>
            )}
          </div>
          <div className="canvas-footer">
            <span>
              {crop ? `${crop.width} × ${crop.height} px` : "No image selected"}
            </span>
            <div className="zoom-controls">
              <button
                className="icon-button"
                aria-label="Zoom out"
                disabled={!image || zoom <= 0.5}
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              >
                <Minus size={15} />
              </button>
              <button
                className="text-button"
                disabled={!image}
                onClick={() => setZoom(1)}
                title="Fit image"
              >
                {zoom === 1 ? "Fit" : `${Math.round(fit * zoom * 100)}%`}
              </button>
              <button
                className="icon-button"
                aria-label="Zoom in"
                disabled={!image || zoom >= 4}
                onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        </div>
        <aside className="inspector" aria-label="Editor settings">
          <div className="inspector-section">
            <h2>{active.name}</h2>
            <p>
              {tool === "redact"
                ? "Drag to cover private details with solid pixels. This covers only the area you select."
                : tool === "crop"
                  ? "Drag a selection, then apply the crop. Undo restores the previous area."
                  : tool === "text"
                    ? "Write your text, then click the image to place it."
                    : "Drag on the image to mark what matters."}
            </p>
            {tool !== "redact" && tool !== "crop" && (
              <>
                <label>
                  Ink color
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={busy}
                  />
                </label>
                {tool === "text" ? (
                  <>
                    <label>
                      Text
                      <textarea
                        aria-label="Text"
                        maxLength={500}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={busy}
                        rows={3}
                      />
                    </label>
                    <label>
                      Text size
                      <select
                        aria-label="Text size"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        disabled={busy}
                      >
                        {[18, 22, 26, 34, 48, 64].map((n) => (
                          <option key={n} value={n}>
                            {n} px
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : (
                  <label>
                    Stroke width
                    <select
                      aria-label="Stroke width"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      disabled={busy}
                    >
                      {[2, 4, 6, 10, 16].map((n) => (
                        <option value={n} key={n}>
                          {n} px
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}
            <button
              className="button compact"
              onClick={centerMark}
              disabled={!image || busy}
            >
              {tool === "crop" ? "Select center area" : "Add at center"}
            </button>
            {tool === "crop" && (
              <>
                <label>
                  Selection X
                  <input
                    aria-label="Selection X"
                    type="number"
                    min={crop?.x || 0}
                    max={crop ? crop.x + crop.width - 1 : 0}
                    value={selection?.x ?? crop?.x ?? 0}
                    disabled={!image || busy}
                    onChange={(e) => {
                      if (!crop) return;
                      const x = Math.min(
                        crop.x + crop.width - 1,
                        Math.max(crop.x, Math.floor(Number(e.target.value))),
                      );
                      setSelection((s) => ({
                        x,
                        y: s?.y ?? crop.y,
                        width: Math.min(
                          s?.width ?? crop.width,
                          crop.x + crop.width - x,
                        ),
                        height: s?.height ?? crop.height,
                      }));
                    }}
                  />
                </label>
                <label>
                  Selection Y
                  <input
                    aria-label="Selection Y"
                    type="number"
                    min={crop?.y || 0}
                    max={crop ? crop.y + crop.height - 1 : 0}
                    value={selection?.y ?? crop?.y ?? 0}
                    disabled={!image || busy}
                    onChange={(e) => {
                      if (!crop) return;
                      const y = Math.min(
                        crop.y + crop.height - 1,
                        Math.max(crop.y, Math.floor(Number(e.target.value))),
                      );
                      setSelection((s) => ({
                        x: s?.x ?? crop.x,
                        y,
                        width: s?.width ?? crop.width,
                        height: Math.min(
                          s?.height ?? crop.height,
                          crop.y + crop.height - y,
                        ),
                      }));
                    }}
                  />
                </label>
                {(["width", "height"] as const).map((axis) => (
                  <label key={axis}>
                    Selection {axis}
                    <input
                      type="number"
                      min="1"
                      max={crop?.[axis] || 1}
                      value={selection?.[axis] ?? crop?.[axis] ?? 1}
                      disabled={!image || busy}
                      onChange={(e) => {
                        if (!crop) return;
                        setSelection((s) => {
                          const rect = s ?? { ...crop };
                          return {
                            ...rect,
                            [axis]: Math.max(
                              1,
                              Math.min(
                                crop[axis] -
                                  (rect[axis === "width" ? "x" : "y"] -
                                    crop[axis === "width" ? "x" : "y"]),
                                Math.floor(Number(e.target.value)),
                              ),
                            ),
                          };
                        });
                      }}
                    />
                  </label>
                ))}
                <button
                  className="button primary"
                  disabled={!selection?.width || !selection.height || busy}
                  onClick={applyCrop}
                >
                  Apply crop
                </button>
              </>
            )}
          </div>
          <div className="inspector-section export-settings">
            <h2>Share image</h2>
            <label>
              File name
              <input
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
              />
            </label>
            <label>
              Format
              <select
                aria-label="Format"
                value={format}
                onChange={(e) => setFormat(e.target.value as typeof format)}
                disabled={busy}
              >
                <option value="png">PNG · lossless</option>
                <option value="jpeg">JPEG · smaller file</option>
                <option value="webp">WebP · compact</option>
              </select>
            </label>
            {format === "jpeg" && (
              <small>
                Transparent areas become white. JPEG uses lossy compression.
              </small>
            )}
            <button
              className="button primary"
              onClick={() => void save()}
              disabled={!image || busy}
            >
              <Download size={16} />
              {busy ? "Working…" : "Save image"}
            </button>
            <button
              className="button"
              onClick={() => void copy()}
              disabled={!image || busy}
            >
              <Copy size={16} />
              Copy image
            </button>
            <small>
              Annotations are flattened. Concealed pixels cannot be uncovered
              from the exported image.
            </small>
          </div>
          <button
            className="text-button clear-image"
            disabled={!image || busy}
            onClick={() =>
              replaceOr(() => {
                imageRef.current?.close();
                imageRef.current = undefined;
                setImage(undefined);
                setHistory(undefined);
                setSelection(undefined);
                setStatus(
                  "Image cleared from this editor. Saved files and clipboard copies are unchanged.",
                );
              })
            }
          >
            <RotateCcw size={14} />
            Clear image
          </button>
        </aside>
      </div>
      <div className="editor-status">
        <span role="status" aria-live="polite">
          {busy ? "Working…" : status}
        </span>
        <span>Local processing</span>
      </div>
      {error && (
        <div className="editor-error" role="alert">
          {error}
          <button
            className="icon-button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
