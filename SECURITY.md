# Security and download verification

EIMAGE is open source and free. It does not upload screenshots, run telemetry, load remote fonts, require an account or provide a paid tier. Desktop capture uses OS APIs and needs the appropriate permission. Images remain in memory until you choose to save or copy them; other applications can read a system clipboard image.

## Verify a download

1. Download only from the official [AlgoWolfx/EIMAGE releases](https://github.com/AlgoWolfx/EIMAGE/releases) or build the source yourself. Read the release's platform validation and signing status.
2. Compare the downloaded file with `SHA256SUMS.txt` attached to that same release. On Windows, use `Get-FileHash -Algorithm SHA256 <file>`; on macOS use `shasum -a 256 <file>`; on Linux use `sha256sum <file>`. A checksum detects changed bytes; it does not prove that a file is safe.
3. Inspect the publisher signature when a signed release is available. No signature or notarization is currently claimed. Unsigned test artifacts are identified as such.
4. If you want an additional check, submit the downloaded installer to [VirusTotal](https://www.virustotal.com/gui/home/upload) yourself. EIMAGE never submits files automatically. Do not upload private screenshots or documents to a third-party scanner.

No completed VirusTotal scan, detection count, malware-free guarantee, security certification or independent security audit is claimed. Open source, checksums and scan results are separate forms of evidence and have practical limits.

## Concealment

Conceal places an opaque solid cover over the selected pixels in an exported image. It does not sanitize the original file, editor undo history, older copies, other applications, OS caches or process memory. Inspect the whole output before sharing; text or identifying content outside your selected area can remain. Clear the editor when finished. PNG/JPEG/WebP exports are fresh canvas images without original container metadata or editable layers; this is not a promise of forensic anonymization.

## Reporting issues

Report a reproducible, non-sensitive issue through the repository's GitHub issues. Do not attach private screenshots, credentials or exploit details that expose another person's data. For sensitive issues, request a private contact method without publishing the details.
