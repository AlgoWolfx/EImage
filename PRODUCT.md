# EIMAGE

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, TypeScript and Vite for the shared editor and static promotional website. Tauri + React is explicitly selected by the user for its lighter desktop runtime; Tauri v2 and Rust supply the native capture, save and clipboard boundary. The user confirmed Windows, macOS and Linux. A web-rendered desktop UI shares its language across operating systems; this does not claim native mobile design.

## Product Purpose

A desktop screenshot tool: capture a screen or window, select a region, annotate or conceal details, then copy or save a local image. Its companion website explains the product, free usage, source availability and actual download status. The user's explicit screenshot/desktop brief supersedes the old image-converter specification, retained in docs/ARCHIVED_IMAGE_CONVERTER_BRIEF.md.

## Users

Inferred working audience: people sharing a screen detail for support, work or explanation. This audience assumption is not a verified market or usage count.

## Capabilities and Constraints

Windows, macOS and Linux are the confirmed targets. Screen/window capture needs OS permission and Linux session support. Local editing and export; no account, uploads, subscriptions, paid tiers, quotas, watermark or telemetry. All implemented features are free. Screen content must not be persisted without an explicit save action. Runtime memory bounds are safety limits, never license limits. Desktop signing, notarization, physical platform validation and public binaries must be reported at their actual status.

## Brand Commitments

EIMAGE, by Yiğit Bayrak · EGORA Digital. The user pinned the same Emil Kowalski + Impeccable series direction as EQR/EMeta: local system typography, quiet native controls, restrained interaction and clear product text. The user previously confirmed English source copy and direct code implementation as the standing series workflow.

## Evidence on Hand

MIT LICENSE exists. The repository initially contained only README.md, LICENSE and the superseded image-converter brief. A screenshot editor, promotional website and unsigned Linux package are now implemented. Real X11 release-binary capture/save/clipboard checks passed; details are in docs/VALIDATION.md. Windows/macOS verification, signed releases, security certification, VirusTotal results, a public website address, benchmarks and testimonials remain unavailable. Security claims must follow real checks; publish source, release checksums and instructions for independent VirusTotal scanning, never invent a clean verdict or a guarantee of absence of malware.

## Product Principles

- Capture and edit locally; make the next action immediate.
- Keep every implemented feature free and available without an account.
- Flatten concealment into exported pixels and disclose its scope.
- Prove downloads and security assertions with verifiable artifacts.
- Preserve originals and make cancellation/recovery clear.

## Open Decisions

Website domain, release signing credentials and release publication are not selected. Cross-platform source support is not evidence that every packaged platform has been tested.

The user reported SmartScreen blocking the unsigned Windows test installer and selected free Microsoft Store distribution. Windows consumer packages must follow the MSIX route with the real Partner Center identity and Microsoft certification/signing. The user supplied the reserved EIMAGE Partner Center identity and Store ID `9NQCCCZPTW3N`; certification and publication are still pending. Store signing does not require purchasing an external certificate; publishing and trust must never be claimed from SDK package validation alone.
