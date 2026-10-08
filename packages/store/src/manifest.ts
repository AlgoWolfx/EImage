import { Buffer } from "node:buffer";

export interface StoreIdentity {
  name: string;
  publisher: string;
  publisherDisplayName: string;
  displayName: string;
  version: string;
}

export function storeIdentity(
  env: Record<string, string | undefined>,
  validationOnly = false,
): StoreIdentity {
  const identity = validationOnly
    ? {
        name: "EIMAGE.PackagingValidation",
        publisher: "CN=EIMAGE Packaging Validation",
        publisherDisplayName: "Packaging validation only",
        displayName: "EIMAGE (validation only)",
        version: "1.0.0.0",
      }
    : {
        name: env.EIMAGE_STORE_IDENTITY_NAME ?? "",
        publisher: env.EIMAGE_STORE_IDENTITY_PUBLISHER ?? "",
        publisherDisplayName: env.EIMAGE_STORE_PUBLISHER_DISPLAY_NAME ?? "",
        displayName: env.EIMAGE_STORE_DISPLAY_NAME ?? "",
        version: env.EIMAGE_STORE_VERSION ?? "",
      };
  for (const [field, value] of Object.entries(identity)) {
    if (!value || value.trim() !== value || /[\x00-\x1f\x7f]/.test(value))
      throw new Error(
        `Store ${field} is missing or invalid. Copy the actual Partner Center identity; no production placeholder is available.`,
      );
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9.-]{1,48}[A-Za-z0-9]$/.test(identity.name))
    throw new Error(
      "Store identity name must be 3–50 ASCII letters, digits, periods or hyphens.",
    );
  if (!identity.publisher.startsWith("CN="))
    throw new Error(
      "Store publisher must be the exact CN= identity from Partner Center.",
    );
  const parts = identity.version.split(".");
  if (
    parts.length !== 4 ||
    parts.some((p) => !/^(0|[1-9][0-9]{0,4})$/.test(p) || Number(p) > 65535) ||
    Number(parts[0]) < 1 ||
    parts[3] !== "0"
  )
    throw new Error(
      "Store version must have four integers, major >= 1, each <= 65535, and final component 0 (for example 1.0.0.0).",
    );
  return identity;
}

export function assertWindowsX64PEHeader(bytes: Buffer): void {
  if (bytes.length < 64 || bytes.toString("ascii", 0, 2) !== "MZ")
    throw new Error(
      "Store input must be a built Windows executable, not a Linux/macOS binary.",
    );
  const offset = bytes.readUInt32LE(60);
  if (
    offset < 64 ||
    offset + 26 > bytes.length ||
    bytes.toString("ascii", offset, offset + 4) !== "PE\0\0" ||
    bytes.readUInt16LE(offset + 4) !== 0x8664 ||
    bytes.readUInt16LE(offset + 24) !== 0x20b ||
    !(bytes.readUInt16LE(offset + 22) & 2)
  )
    throw new Error(
      "Store input must have an executable AMD64 PE32+ header; architecture must match the x64 manifest.",
    );
}

export function assertStoreLogo(bytes: Buffer, size: number): void {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (
    bytes.length < 33 ||
    !bytes.subarray(0, 8).equals(signature) ||
    bytes.toString("ascii", 12, 16) !== "IHDR" ||
    bytes.readUInt32BE(16) !== size ||
    bytes.readUInt32BE(20) !== size
  )
    throw new Error(`Store logo must be a ${size} × ${size} PNG.`);
}

export function createStoreManifest(identity: StoreIdentity): string {
  const xml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  return `<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  IgnorableNamespaces="uap rescap">
  <Identity Name="${xml(identity.name)}" Publisher="${xml(identity.publisher)}" Version="${xml(identity.version)}" ProcessorArchitecture="x64" />
  <Properties>
    <DisplayName>${xml(identity.displayName)}</DisplayName>
    <PublisherDisplayName>${xml(identity.publisherDisplayName)}</PublisherDisplayName>
    <Description>Free, open-source desktop screenshot capture and annotation.</Description>
    <Logo>Assets/StoreLogo.png</Logo>
  </Properties>
  <Resources><Resource Language="en-us" /></Resources>
  <Dependencies><TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.19041.0" MaxVersionTested="10.0.26100.0" /></Dependencies>
  <Applications>
    <Application Id="EIMAGE" Executable="eimage.exe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements DisplayName="${xml(identity.displayName)}" Description="Capture and annotate screenshots locally" BackgroundColor="#22634b" Square44x44Logo="Assets/Square44x44Logo.png" Square150x150Logo="Assets/Square150x150Logo.png" />
    </Application>
  </Applications>
  <Capabilities><rescap:Capability Name="runFullTrust" /></Capabilities>
</Package>
`;
}
