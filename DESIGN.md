---
name: EIMAGE
description: A quiet local workspace for making screenshots clear.
colors:
  bg: "#f8f9f7"
  surface: "#fff"
  layer: "#f0f3ef"
  canvas: "#e8eee9"
  line: "#dce2dc"
  ink: "#232b27"
  muted: "#59665e"
  accent: "#22634b"
  accent-hover: "#1a503c"
  selected: "#e4f0e8"
  error: "#a12f2f"
  error-bg: "#fff1f0"
  dark-bg: "#151b18"
  dark-surface: "#1b231f"
  dark-layer: "#222d26"
  dark-canvas: "#121915"
  dark-line: "#38463c"
  dark-ink: "#e8eee9"
  dark-muted: "#abb8ae"
  dark-accent: "#9bd5b5"
  dark-accent-hover: "#b6e4ca"
  dark-selected: "#294737"
  dark-error: "#ffb0a6"
  dark-error-bg: "#3d2523"
typography:
  display:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "64px"
    fontWeight: 620
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "34px"
    fontWeight: 620
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  lead:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  control:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 550
    lineHeight: 1.5
  compact-control:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 550
    lineHeight: 1.5
  field:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  navigation:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  inspector-title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 650
    lineHeight: 1.3
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "11px"
    fontWeight: 550
    lineHeight: 1.5
  supporting:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  text-control: "5px"
  field: "6px"
  tool: "7px"
  button: "8px"
  container: "14px"
spacing:
  xs: "4px"
  field-gap: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  content: "18px"
  panel: "20px"
  xl: "24px"
  xxl: "32px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.button}"
    padding: "9px 13px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.button}"
    padding: "9px 13px"
  button-secondary-hover:
    backgroundColor: "{colors.layer}"
  button-compact:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.compact-control}"
    rounded: "{rounded.button}"
    padding: "7px 10px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.tool}"
    width: "34px"
    height: "34px"
  button-icon-hover:
    backgroundColor: "{colors.layer}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.field}"
    rounded: "{rounded.text-control}"
    padding: "4px 6px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.field}"
    padding: "7px 8px"
  navigation:
    textColor: "{colors.muted}"
    typography: "{typography.navigation}"
  tool:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.tool}"
    padding: "8px 10px"
  tool-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.accent}"
  editor-container:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
  canvas-stage:
    backgroundColor: "{colors.canvas}"
    padding: "24px"
---

# Design System: EIMAGE

## Overview

**Creative North Star: "The Local Screenshot Workspace"**

The screenshot is the work. EIMAGE surrounds it with quiet native controls, forest actions, green-gray surfaces and enough separation to keep annotation and sharing immediate. Density belongs in the tools; the image keeps the broadest uninterrupted space.

This is EIMAGE's expression of the user-pinned EQR/EMeta Emil Kowalski + Impeccable series: local system typography, restrained interaction and clear product text. The shared React editor carries the same visual language into the Tauri desktop app and website. English labels explain real actions and states; local processing and free access remain plain product facts, never decorative badges.

**Key Characteristics:**

- Screenshot-led hierarchy with compact controls.
- Forest action and selection within light or dark green-neutral surfaces.
- Local system sans with a tight, readable utility scale.
- Hairline separation and one soft lift beneath image pixels.
- Brief pointer feedback with reduced-motion support.

## Colors

The palette combines forest action with warm-neutral grounds and cool green-gray working surfaces; the frontmatter preserves the exact light and dark CSS values.

### Primary

- **Forest action** (`accent`): capture, save, links, caret, selected-tool ink and focus outline. **Deep forest** (`accent-hover`) is its pointer-hover state.
- **Pale forest selection** (`selected`): active tools, text selection and recoverable capture/replacement panels; the website verification panel uses the same quiet field.
- **Mint action** (`dark-accent`, `dark-accent-hover`): the corresponding dark-theme action and feedback pair, with **deep forest selection** (`dark-selected`) behind selected controls.

### Secondary

- **Error red** (`error`, `dark-error`): actual recoverable failure messages. **Error wash** (`error-bg`, `dark-error-bg`) separates the message without turning it into a modal.

### Neutral

- **Quiet ground** (`bg`, `dark-bg`): page and desktop chrome; also the fill of inspector fields.
- **Working surface** (`surface`, `dark-surface`): editor, inspector and secondary buttons. Primary-button text uses this theme-aware surface token.
- **Tool layer** (`layer`, `dark-layer`): toolbar and neutral pointer-hover fill.
- **Image ground** (`canvas`, `dark-canvas`): space around screenshot pixels.
- **Hairline** (`line`, `dark-line`): container edges, section divisions and field borders.
- **Main ink** (`ink`, `dark-ink`) and **supporting ink** (`muted`, `dark-muted`): action labels versus secondary guidance, dimensions and status.

### Named Rules

**The Semantic Forest Rule.** Use the accent for actionable controls, selection and focus; let screenshot content supply the visual detail.

**The Paired Theme Rule.** Change the root semantic tokens together when switching theme. Keep hierarchy and component geometry consistent between light and dark.

## Typography

**Display Font:** local system sans, as recorded in `typography.display`.
**Body Font:** the same local system stack; no webfont or separate display face.

**Character:** direct, familiar and compact. The system face is an explicit user-pinned series decision; restrained weight and tracking distinguish editorial headings from operating controls.

### Hierarchy

- **Display:** website introduction; `display` reduces to 48px at the medium breakpoint and 46px at the small breakpoint.
- **Headline:** supporting website section headings; `headline` reduces to 28px at the medium breakpoint.
- **Title:** workflow and release headings; `inspector-title` is the denser editor section heading.
- **Body / Lead:** default text uses `body`; introductory explanation uses `lead`, reducing to 15px at the medium breakpoint. Paragraphs normally cap at 68ch; introductory copy caps at 41ch, then 42ch on small screens.
- **Control / Field / Label:** `control` for buttons, `compact-control` for the compact variant, `field` for tools and editable fields, and `label` for inspector labels.
- **Supporting:** small editor guidance uses `supporting`; dimensions and status are 11px. Canvas dimensions use tabular numerals.

### Named Rules

**The One System Voice Rule.** Keep the user-approved local system sans across editorial copy and operational UI; change hierarchy through the observed scale, weight and spacing.

## Layout

The desktop model is a top capture/open header, wrapping horizontal annotation toolbar, dominant centered canvas and right inspector. The shared workspace uses a flexible image column and a 224px inspector; at 850px and below the inspector narrows to 205px. The browser editor's canvas stage is 480px high, then 420px at that medium breakpoint. The native desktop editor instead fills `calc(100vh - 100px)` with a 440px minimum and lets the canvas consume remaining height.

At 600px and below, capture actions span a second header row, controls gain 42px targets, the canvas becomes 330px high with a 260px minimum, and the inspector moves below it in two columns. At 360px and below the inspector becomes one column. Fields gain a 40px minimum height in the small layout. The toolbar wraps rather than clipping required actions.

Website content sits within a 1200px maximum container, with side gutters of 32px, 24px at the medium breakpoint and 18px at the small breakpoint. Editorial two-column sections stack below 600px. The functioning editor follows the short introduction; website sequence and desktop composition remain surface contracts, rather than mandatory arrangements for every future screen.

The spacing entries are extracted recurring intervals, not new CSS custom properties. Small gaps connect icon and label or label and field; broader panel padding separates image work from settings. Preserve real word boundaries when responsive layouts hide a heading line break.

## Elevation & Depth

Depth comes from semantic fills and single-pixel boundaries. Controls and editor containers have no resting box shadow. Only screenshot pixels receive the observed soft lift, `0 6px 20px rgb(18 40 26 / 0.1)`, distinguishing the image from its canvas ground without dramatizing the app chrome.

### Named Rules

**The Pixels Carry Depth Rule.** Reserve the observed shadow for image pixels; use tonal layers and hairlines to separate controls and containers.

## Shapes

Corners are gently rounded and sized by role: text actions use `text-control`, fields use `field`, icon and tool controls use `tool`, buttons use `button`, and the editor and verification container use `container`. Borders are a single pixel in the semantic line color. Images retain their document geometry; the editor clips content at its outer rounded boundary.

Icons use consistent outline SVGs: controls generally use 14–18px icons, while brand and contextual illustrations use larger versions of the same stroke language. Tool names remain visible alongside their icons; icon-only controls carry accessible action names.

## Components

### Buttons

Quiet, explicit and compact. Primary buttons fill with accent and use surface-colored text; secondary buttons have a surface fill and line border. Both share `button` corners, 38px minimum height, an 8px icon gap and the frontmatter's padding. Compact buttons reduce to a 34px minimum height. Website introduction actions expand to a 43px minimum height with 11px 16px padding.

On hover-capable fine pointers, neutral buttons fill with layer and primary buttons use accent-hover. Pressing scales these controls to 0.98. Background feedback runs for 140ms with `ease`; transform uses 140ms with `cubic-bezier(0.2, 0.8, 0.2, 1)`. Disabled buttons use 0.48 opacity, a not-allowed cursor and no transform. Focus-visible uses the global 2px focus outline with a 3px offset.

Icon controls use `button-icon` geometry, expanding to 42px square below 600px except the website theme control's observed 34px width. Text actions remain underlined with a 4px underline offset; they have no invented hover fill or press motion.

### Chips / Tool Selection

Annotation tools are the system's selectable chip-like control. Default tools are transparent; selected tools use selected fill and accent ink with `aria-pressed`. Fine-pointer hover fills inactive tools with layer and preserves selected fill. Tools use the same focus, disabled and press treatments as buttons. They wrap across lines and retain text labels.

### Cards / Containers

The editor is a working container with surface fill, line border and `container` corners; it is not a repeated marketing card. Its header, toolbar, inspector and status separate with hairlines. The verification panel is a selected-tonal container with the same corner scale. Neither receives the image shadow.

### Inputs / Fields

Inspector fields use ground fill, main ink, a line border and `field` corners, with a 34px minimum height. Labels sit 6px above fields. Textareas resize vertically with an 80px minimum height; color controls use native input behavior. Focus uses the shared outline and text carets use accent. Disabled fields keep native disabled semantics; the implementation's button-opacity rule does not apply to them.

### Navigation

Website navigation is a plain row of supporting-ink links with a 26px gap, reducing to 18px and then 13px. Hover underlines links; keyboard focus uses the shared outline. Below 600px the first demo link hides while download, source and theme actions remain. No active-page pill or fabricated selected-link treatment exists.

### Image Canvas and Status

The image sits centered within the semantic canvas ground, scrolls when needed and uses a crosshair for drawing or a text cursor for text placement. Pixel dimensions and fit/zoom controls stay in a quiet footer. The live status line wraps long messages; errors appear as a red tonal strip with an explicit dismiss action. Capture and image-replacement prompts use selected fill with recoverable choices. Reduced-motion preference removes transition duration throughout.

## Do's and Don'ts

### Do:

- **Do** keep screenshot pixels as the largest uninterrupted working surface.
- **Do** use semantic root tokens so light and dark controls change together.
- **Do** preserve the visible focus outline, tool labels and accessible icon-control names.
- **Do** wrap controls and stack settings at the observed breakpoints while retaining primary actions.
- **Do** use short, truthful English action and status copy, including real release and platform limits.
- **Do** preserve spaces when responsive heading line breaks disappear.

### Don't:

- **Don't** add a separate decorative display font to the user-pinned system-sans series.
- **Don't** spread the screenshot shadow to ordinary controls or containers.
- **Don't** replace the working screenshot with a grid of generic feature cards.
- **Don't** invent account, premium, certification or completed-platform badges.
- **Don't** add hover or selected states that the implemented component does not have.

The final source and reviewed responsive fix show no known visual defect to canonize. No approved image comp or quality-bar board exists: the remote decision service was unavailable. Windows/macOS validation and release publication are product evidence limits, not visual-system rules. This document records EIMAGE only and does not replace sibling design systems.
