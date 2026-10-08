# Microsoft Store listing draft

This is factual submission copy, not an approved or published Store page. Use the exact reserved application name and assigned publisher identity after account setup. The user selected free MSIX distribution through Microsoft Store.

## Name and description

Reserved name: **EIMAGE**. Owner-supplied Store ID: `9NQCCCZPTW3N`; publication and certification remain pending.

Short description:

> Capture screenshots, annotate what matters and save or copy images locally. Free and open source.

Description:

> EIMAGE is a free, open-source desktop screenshot tool. Choose a screen or window, crop the result, add arrows, shapes, freehand drawing or text, and cover selected private details with opaque pixels. Copy the edited image to your clipboard or save it as PNG, JPEG or WebP.
>
> Work locally, without an account, image uploads, subscriptions, paid features or watermarks. You can also open an existing PNG, JPEG or WebP. Light and dark themes and app-focused keyboard shortcuts keep the workflow quick.
>
> Concealment is flattened into exported pixels. Your original files, editor undo history and earlier copies can still contain the covered information; inspect the result before sharing. EIMAGE does not claim forensic anonymization.
>
> EIMAGE is licensed under MIT. Review the source at https://github.com/AlgoWolfx/EImage.

Features:

- Screen/window capture with region selection after capture.
- Arrow, rectangle, freehand, text and opaque concealment tools.
- Crop, undo and redo.
- Local PNG/JPEG/WebP import and export; image clipboard copy.
- Light/dark themes; focused-app shortcuts.
- Every implemented feature is free.

## Submission values

- Price: **Free**, in every selected market; no paid add-ons or trial.
- Suggested category: photo/video or a suitable image utility category available in Partner Center.
- Privacy policy: https://github.com/AlgoWolfx/EImage/blob/main/PRIVACY.md
- Support: https://github.com/AlgoWolfx/EImage/issues
- Source/license: https://github.com/AlgoWolfx/EImage
- Supported package architecture: x64 Windows Desktop.
- WebView2 Evergreen is a prerequisite; verify clean-machine availability.
- No background/global shortcut, tray recording or screen-recording feature is claimed.
- Memory bounds protect local stability and are not paid quotas.

## Restricted capability justification

`runFullTrust` runs the Tauri/Rust desktop process so the user can explicitly capture a screen/window, copy an image to the OS clipboard and save through a native file picker. The app does not run in the background, monitor the screen continuously, start automatically at login, upload screen content or require administrator privileges for its intended editing workflow. Capture is user initiated. The package does not request network or unrelated restricted capabilities.

## Notes for Microsoft's reviewer

No login, purchase or remote service is required. Launch the app; choose **Try an example** to inspect a fictional local screenshot or use **Capture** for a real screen/window. Add an arrow or conceal a selected area, then save PNG and verify the result. Test native clipboard copy as well. `Ctrl+Shift+S` opens capture options only while EIMAGE has focus.

The submitted MSIX must use the actual Partner Center identity. The separately generated `EIMAGE.PackagingValidation` fixture is never a submission. Microsoft signing and certification are pending, and no clean VirusTotal result or security certification is claimed.

## Required evidence before submission

Take Store screenshots on the real Windows candidate using fictional content: capture picker, edited image and export options. Existing Linux WebKit screenshots are development evidence and must not be represented as Windows Store captures. Run the Windows App Certification Kit and clean-machine capture, clipboard, file save and cancellation checks. Complete Microsoft's age-rating, accessibility and product declaration forms according to actual behavior. Account setup, these platform checks, listing images and Store review are still required.
