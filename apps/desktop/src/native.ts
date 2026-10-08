import { invoke, isTauri } from "@tauri-apps/api/core";
import type {
  CaptureSource,
  NativeBridge,
} from "../../../packages/editor/src/Editor";
export const bridge: NativeBridge | undefined = isTauri()
  ? {
      sources: () => invoke<CaptureSource[]>("capture_sources"),
      capture: async (source) =>
        new Blob(
          [
            new Uint8Array(
              await invoke<ArrayBuffer>("capture_image", {
                kind: source.kind,
                id: source.id,
              }),
            ),
          ],
          { type: "image/png" },
        ),
      save: async (blob, name) =>
        invoke<string | null>("save_image", {
          bytes: Array.from(new Uint8Array(await blob.arrayBuffer())),
          name,
        }),
      copy: async (blob) =>
        invoke<void>("copy_image", {
          bytes: Array.from(new Uint8Array(await blob.arrayBuffer())),
        }),
    }
  : undefined;
