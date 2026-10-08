import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import {
  assertStoreLogo,
  assertWindowsX64PEHeader,
  createStoreManifest,
  storeIdentity,
} from "../packages/store/src/manifest.ts";

describe("Store package trust boundary", () => {
  it("refuses a production placeholder when Partner Center identity is missing", () => {
    expect(() => storeIdentity({})).toThrow(/missing/);
    const fixture = storeIdentity({}, true);
    expect(fixture.displayName).toContain("validation only");
    expect(fixture.name).toContain("PackagingValidation");
  });
  it("preserves exact publisher identity while escaping XML syntax", () => {
    const identity = storeIdentity({
      EIMAGE_STORE_IDENTITY_NAME: "12345.EIMAGE",
      EIMAGE_STORE_IDENTITY_PUBLISHER: "CN=Developer, O=A&B",
      EIMAGE_STORE_PUBLISHER_DISPLAY_NAME: 'A & B "Studio"',
      EIMAGE_STORE_DISPLAY_NAME: "EIMAGE <local>",
      EIMAGE_STORE_VERSION: "1.0.0.0",
    });
    const xml = createStoreManifest(identity);
    expect(xml).toContain('Publisher="CN=Developer, O=A&amp;B"');
    expect(xml).toContain("A &amp; B &quot;Studio&quot;");
    expect(xml).toContain("EIMAGE &lt;local&gt;");
    expect(xml).toContain('Executable="eimage.exe"');
    expect(xml).toContain('Name="runFullTrust"');
    expect(xml).not.toContain("internetClient");
  });
  it.each([
    "0.1.0.0",
    "1.0.0.1",
    "1.0.0",
    "65536.0.0.0",
    "1.0.0.0-beta",
    "01.0.0.0",
  ])("rejects Store-incompatible version %s", (version) => {
    const f = storeIdentity({}, true);
    expect(() =>
      storeIdentity({
        EIMAGE_STORE_IDENTITY_NAME: f.name,
        EIMAGE_STORE_IDENTITY_PUBLISHER: f.publisher,
        EIMAGE_STORE_PUBLISHER_DISPLAY_NAME: f.publisherDisplayName,
        EIMAGE_STORE_DISPLAY_NAME: f.displayName,
        EIMAGE_STORE_VERSION: version,
      }),
    ).toThrow(/version/);
  });
  it("rejects Linux binaries and PE architecture mismatches", () => {
    expect(() =>
      assertWindowsX64PEHeader(Buffer.from([0x7f, 69, 76, 70])),
    ).toThrow(/Windows/);
    const pe = Buffer.alloc(256);
    pe.write("MZ");
    pe.writeUInt32LE(128, 60);
    pe.write("PE\0\0", 128);
    pe.writeUInt16LE(0x8664, 132);
    pe.writeUInt16LE(2, 150);
    pe.writeUInt16LE(0x20b, 152);
    expect(() => assertWindowsX64PEHeader(pe)).not.toThrow();
    pe.writeUInt16LE(0xaa64, 132);
    expect(() => assertWindowsX64PEHeader(pe)).toThrow(/AMD64/);
    pe.writeUInt32LE(65535, 60);
    expect(() => assertWindowsX64PEHeader(pe)).toThrow(/AMD64/);
  });
  it("checks real shipping logo dimensions and refuses a wrong tile", () => {
    for (const [name, size] of [
      ["Square44x44Logo.png", 44],
      ["Square150x150Logo.png", 150],
      ["StoreLogo.png", 50],
    ] as const) {
      const png = readFileSync(
        new URL(`../apps/desktop/store/assets/${name}`, import.meta.url),
      );
      expect(() => assertStoreLogo(png, size)).not.toThrow();
      expect(() => assertStoreLogo(png, size + 1)).toThrow(/PNG/);
    }
  });
});
