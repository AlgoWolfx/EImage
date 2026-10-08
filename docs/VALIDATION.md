# Validation and release status

Validation date: 8 October 2026. This records executed checks, rather than treating configured build targets as verified releases.

## Executed in the development workspace

| Check                              | Result    | Scope                                                                                                                                                                        |
| ---------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript editor/Store unit tests | 25 passed | 15 editor tests plus 10 Store identity/version, XML escaping, PE architecture and real logo checks.                                                                          |
| Rust unit tests                    | 4 passed  | Native image decoding and bounds, malformed/unsupported input, capture-kind validation.                                                                                      |
| Chromium production browser tests  | 13 passed | Editor interactions, flattened conceal pixels, decoded PNG/JPEG/WebP exports, crop, undo, recovery, theme, accessibility and responsive widths.                              |
| Production build                   | Passed    | TypeScript checking, desktop frontend, static website and server-rendered product copy.                                                                                      |
| SEO configuration                  | Passed    | Unconfigured noindex/empty sitemap; configured HTTPS root/subpath canonical, robots, sitemap and zero-price application data; repeat generation does not duplicate metadata. |
| Formatting                         | Passed    | Prettier and Rustfmt.                                                                                                                                                        |
| Linux desktop package              | Built     | Unsigned Debian amd64 package, with MIT and third-party notices; generated SHA-256 file refers to the actual bundle.                                                         |

The browser suite runs against built production assets, including 320, 390 and 1440 px checks. Its accessibility assertions found no Axe violations on the tested surfaces. This is bounded automated evidence, not a certification or coverage of every assistive technology.

## Actual Linux desktop checks

The release Tauri binary was launched in WebKit on Debian 13, x86-64, with a 1440 × 1000 X11 virtual desktop. Official Tauri/WebKit WebDriver, a fictional browser window, xdotool and an independent X11 clipboard reader exercised all nine checks:

1. Active native Tauri bridge.
2. Real screen/window enumeration.
3. Actual screen capture at 1440 × 1000, with the editor hidden and restored.
4. Actual window capture at its enumerated 640 × 480 dimensions.
5. Opaque concealment in the native WebKit canvas.
6. Native image clipboard write.
7. Independent clipboard readback and PNG decoding.
8. Real native save chooser followed by independent PNG decoding and concealed-pixel verification.
9. Native save cancellation preserves the current document.

`scripts/native-smoke.mjs` writes the run report and screenshot to ignored `.impeccable/review/` paths. `docs/DEVELOPMENT.md` documents reproduction and the temporary read-only library overlay needed by this cloud runtime. It does not modify host system libraries or disable the WebKit security sandbox.

## GitHub Windows/macOS and Store packaging checks

[The initial cross-platform run](https://github.com/AlgoWolfx/EImage/actions/runs/37779555782) completed successfully on the Windows, macOS and Ubuntu runners. Windows produced the unsigned NSIS installer; macOS produced app/DMG packages. Native Rust tests and the build commands passed. These are compilation/unit/packaging checks, not evidence of physical Windows/macOS capture behavior.

[The Store packaging run](https://github.com/AlgoWolfx/EImage/actions/runs/37785835577), source commit `e21634366cc584e1aec7594df1c8cbd87592fb43`, completed successfully. Its Windows job `113340212225` ran the real `Validate Microsoft Store MSIX packaging (non-publishable fixture)` step. MakeAppx packed the actual Windows binary with SDK validation enabled, unpacked the MSIX, compared every staged file hash and the exact identity, and verified absence of a signature in the submission fixture. The validation MSIX was not uploaded or offered to consumers. The production path independently refuses missing Partner Center identity; it has no production fallback.

The same run passed the web, Linux and macOS jobs. The web unit suite now runs 25 cases (15 editor + 10 Store); the production browser suite remains 13 cases. Store signing/certification, a real account-bound submission, installed-MSIX behavior and the Windows App Certification Kit remain unverified.

## Still pending

Windows/macOS builds and unit/package checks passed on their own GitHub runners. Their physical OS capture permissions, installed-package save/clipboard behavior, Store signing/certification and macOS notarization remain pending. Wayland and physical multi-monitor/HiDPI systems also need target-device testing. Chromium does not establish Firefox/Safari compatibility; the native Linux run verifies WebKit on the stated X11 setup only.

Public installers and a live website have not been released. GitHub Actions artifacts, when a job succeeds, are unsigned test builds. No VirusTotal result, security audit or guarantee of absence of malware is claimed. See [SECURITY.md](../SECURITY.md) for independent verification.
