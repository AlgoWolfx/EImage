# Microsoft Store distribution

The selected Windows consumer channel is **Microsoft Store, using an MSIX package**. EIMAGE stays free and MIT-licensed. The existing NSIS `.exe` artifacts are unsigned developer test builds; they are not the consumer installation route.

Microsoft's [SmartScreen documentation](https://learn.microsoft.com/windows/apps/package-and-deploy/smartscreen-reputation) explains that Store-distributed apps are signed by Microsoft and are not subject to the SmartScreen download warning shown for an unrecognized external installer. Signing an external `.exe`, including with an EV certificate, does not guarantee immediate reputation. A VirusTotal result does not grant SmartScreen reputation.

For an [MSIX Store submission](https://learn.microsoft.com/windows/apps/package-and-deploy/code-signing-options), Microsoft handles signing after certification; no purchased Authenticode certificate is needed. Submitting an external MSI/EXE to the Store is a different route and requires publisher signing. Do not confuse these channels.

## Publisher setup

The owner confirmed that no Partner Center developer account or EIMAGE application reservation exists yet. Consequently, a real submission package cannot be generated with the correct assigned identity, and the app is not published or certified.

1. Start at [storedeveloper.microsoft.com](https://storedeveloper.microsoft.com) and choose **Get started for free**. Microsoft's [current registration documentation](https://learn.microsoft.com/windows/apps/publish/partner-center/open-a-developer-account) says this new onboarding flow has no registration fee; older entry points can show the legacy flow.
2. Select the account type that matches the actual publisher. Complete Microsoft's own identity/business verification and developer agreement. The account owner must do this; do not invent a legal publisher or submit identity documents through this repository.
3. In Partner Center, create a Windows application and reserve the desired EIMAGE name. Availability has not been checked or guaranteed. Use the MSIX/AppX package submission route.
4. Copy the exact **Product identity** values. Capitalization, punctuation and spaces matter.

## Prepare the upload

Run **Actions → Prepare Microsoft Store submission → Run workflow**, on `main`. Its inputs are public package identity data, not credentials:

| Input                    | Source                                                       |
| ------------------------ | ------------------------------------------------------------ |
| `identity_name`          | Partner Center `Package/Identity/Name`                       |
| `identity_publisher`     | Partner Center `Package/Identity/Publisher`, including `CN=` |
| `publisher_display_name` | Actual Partner Center publisher display name                 |
| `display_name`           | The reserved application name                                |
| `package_version`        | Four-part Store package version, initially `1.0.0.0`         |

Store package versions have a major component of at least 1 and a final component of 0; each component is at most 65535. The initial source application is `0.1.0`, so the Store package version is recorded separately. Advance the Store version for each submission update; do not reuse an older published package version.

The workflow builds the real x64 Windows binary, stages its licenses and three Store logos, generates the manifest, runs Windows SDK **MakeAppx** with validation enabled, and unpacks the MSIX to compare every staged file hash and the exact manifest identity. It uploads `eimage-Microsoft-Store-submission-x64`, containing the unsigned MSIX, package metadata and SHA-256 checksum. This is an **upload for Microsoft**, not a file for users to sideload.

Identity validation runs before the native build. There is no production fallback to a made-up name, publisher, self-signed certificate or trusted-root installation.

For local Windows packaging, use Node 24, PowerShell 7, Rust and the Windows SDK:

```powershell
# Set these to the actual public Partner Center values in this shell.
$env:EIMAGE_STORE_IDENTITY_NAME = '<Package/Identity/Name>'
$env:EIMAGE_STORE_IDENTITY_PUBLISHER = '<Package/Identity/Publisher>'
$env:EIMAGE_STORE_PUBLISHER_DISPLAY_NAME = '<Publisher display name>'
$env:EIMAGE_STORE_DISPLAY_NAME = '<Reserved app name>'
$env:EIMAGE_STORE_VERSION = '1.0.0.0'
npm ci
npm run build:desktop -- --ci --no-bundle --no-sign
pwsh -NoProfile -File scripts/package-store.ps1
```

## Certification and listing

Upload the generated MSIX in Partner Center. Use [STORE_LISTING.md](STORE_LISTING.md) for the factual description, capability justification, pricing and review notes; use [PRIVACY.md](../PRIVACY.md) for the public privacy policy. Follow Microsoft's [package requirements](https://learn.microsoft.com/windows/apps/publish/publish-your-app/msix/app-package-requirements) and test with the Windows App Certification Kit and physical Windows hardware before submission.

The declared target is x64 Windows Desktop, minimum build `10.0.19041.0`; the manifest's SDK compatibility target is `10.0.26100.0`. These declarations do not establish physical Windows 10/11 testing. The app requires Microsoft's WebView2 Evergreen runtime (included with Windows 11 and most eligible Windows 10 installations); verify this prerequisite on clean test machines. No runtime bootstrapper is secretly installed by this packaging script.

`runFullTrust` is required for the existing desktop OS capture, clipboard and native file chooser. Microsoft must review this restricted capability. SDK packaging success is not Store certification, a malware scan or a guarantee of policy approval. Store-installed app execution can still be governed by enterprise/device policies.

Set the price to **Free** in every selected market. No subscriptions, paid add-ons, trial expiration, quotas or watermark. After Microsoft accepts and signs the package, use the actual Store product link for Windows consumer downloads. Do not invent a Store ID, badge, approval or live download URL while review is pending.

## Packaging validation

The normal Windows CI job runs `scripts/package-store.ps1 -ValidationOnly` on the actual compiled Windows application. It uses an explicitly fictional validation identity, verifies SDK packing/unpacking and file hashes, and does not upload the validation MSIX. That fixture must never be submitted to Partner Center or given to consumers. It tests packaging infrastructure without claiming access to the publisher account.

This workflow neither publishes the app automatically nor modifies SmartScreen, Smart App Control, Defender, Mark of the Web or trusted certificates on any user's computer.
