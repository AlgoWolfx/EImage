# EImage — Project Specification

## Goal

Build a high-quality local-first image utility for everyday conversion and optimization.

The product should be faster and simpler than opening a full image editor.

## v1 formats

Input:
- JPEG/JPG
- PNG
- WebP

Output:
- JPEG
- PNG
- WebP

Add AVIF when browser/runtime support is reliable.

Evaluate HEIC separately; do not claim native support until tested.

## Core operations

- convert format
- resize by width/height
- preserve aspect ratio
- resize by percentage
- compression/quality
- rotate
- crop
- remove metadata
- batch processing
- rename output pattern
- download one file or ZIP

## UX

Main workflow:

Drop images → choose operation/output settings → preview estimated/result sizes → process → download.

Requirements:
- drag/drop and file picker
- multiple files
- per-file status
- cancel/retry
- clear before/after size
- sensible defaults
- no unnecessary wizard
- responsive design
- light/dark mode
- accessible controls

## Privacy

Perform image processing locally wherever practical.

Core v1 must not require file uploads to EGORA or any third-party server.

## Performance

- do not block the main UI during large batches
- use workers where useful
- limit concurrency
- release object URLs/memory
- handle hundreds of images gracefully
- expose progress

## Engineering

- separate codecs/processors from UI
- typed processing pipeline
- deterministic operation model
- reusable design system
- tests for dimensions, output MIME types and metadata removal
- graceful browser capability detection

## Quality bar

- output opens correctly in standard viewers
- orientation is preserved or normalized intentionally
- transparency behavior is clear when converting PNG to JPEG
- color/quality degradation is not hidden from the user
- large image batches do not freeze the app

## Delivery order

1. Build design system and dropzone.
2. Implement JPEG/PNG/WebP conversion.
3. Add resize.
4. Add compression controls.
5. Add batch queue and progress.
6. Add metadata removal.
7. Add crop/rotate.
8. Add ZIP download and naming patterns.
9. Add tests and performance pass.
10. Add AVIF if robust.

## Brand

Built by Yiğit Bayrak · EGORA Digital

Do not watermark user images.
