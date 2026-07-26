---
name: Luiz Witt
description: Visual system for the Luiz Witt demand-order interface.
colors:
  ink: "#101820"
  ink-2: "#182631"
  paper: "#f4f0e8"
  paper-2: "#e6e0d4"
  line: "#b7b4aa"
  muted: "#626b6d"
  amber: "#e7aa2b"
  lime: "#c5e86c"
  red: "#c74e3d"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(42px, 6vw, 82px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.07em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(34px, 5vw, 62px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.065em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.12em"
rounded:
  square: "0px"
  pill: "999px"
  dot: "50%"
spacing:
  nav-height: "72px"
  gutter: "48px"
  gutter-narrow: "32px"
  section: "100px"
  section-narrow: "70px"
components:
  button-primary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "14px 19px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "14px 19px"
  order-preview:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "24px"
    width: "100%"
  form-field:
    backgroundColor: "#faf8f3"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "12px"
---

# Design System: Luiz Witt

## Overview

**Creative North Star: "A visual work order"**

The interface treats a technical request like an open order: explicit, bounded, and easy to review. The visual language is editorial and operational, using dark ink fields, paper surfaces, thin rules, numbered sections, monospace metadata, and a small set of high-contrast signals.

The page alternates between paper and dark sections. Amber marks action and emphasis; lime marks selected or confirmed states. The composition is controlled rather than ornamental, with the order preview acting as the signature object.

**Key Characteristics:**
- Work-order framing with numbered sections and metadata labels.
- Paper, ink, and amber blocks with lime state accents.
- Offset amber depth on the order preview rather than general elevation.

## Colors

The palette is a warm paper-and-ink foundation with amber action color, lime state color, and muted structural neutrals.

### Primary
- **Amber** (`{colors.amber}`): Primary action buttons, highlighted price, and the order preview offset.
- **Lime** (`{colors.lime}`): Selected chips, signal text, hover emphasis, and focus outlines.

### Neutral
- **Ink** (`{colors.ink}`): Header, hero, contact area, primary text, and dark controls.
- **Ink 2** (`{colors.ink-2}`): Dark section surfaces.
- **Paper** (`{colors.paper}`): Page background, light cards, and light text on dark surfaces.
- **Paper 2** (`{colors.paper-2}`): Available warm paper step for the visual palette.
- **Line** (`{colors.line}`): Rules and dividers on light surfaces.
- **Muted** (`{colors.muted}`): Supporting copy and section indices.
- **Red** (`{colors.red}`): Invalid form-field borders.

**The Signal Rule.** Keep amber and lime as sparse signals against the ink-and-paper foundation; do not turn them into full-page backgrounds except where the implemented offer and final call-to-action do so.

## Typography

**Display Font:** Archivo (with `system-ui`, sans-serif fallback)  
**Body Font:** Archivo (with `system-ui`, sans-serif fallback)  
**Label/Mono Font:** IBM Plex Mono (with monospace fallback)

**Character:** Archivo supplies compact, heavy editorial headings and readable body copy. IBM Plex Mono makes labels, indices, statuses, and metadata feel like parts of a tracked work order.

### Hierarchy
- **Display** (regular, `clamp(42px, 6vw, 82px)`, `0.98`): Hero title.
- **Headline** (regular, `clamp(34px, 5vw, 62px)`, `1`): Section and feature headings.
- **Title** (regular, `21px`): Audience, service, and mode titles.
- **Body** (regular, `15px`, `1.5`): Supporting and explanatory copy.
- **Label** (600, `11px`, `0.12em`, uppercase): Eyebrows, indices, field labels, and metadata.

## Layout

Content sits in a centered wrapper capped at `1240px`, with a `48px` horizontal gutter that becomes `32px` below `850px`. The desktop hero uses an asymmetric two-column grid (`1.05fr` / `0.95fr`); the order preview is aligned to the right and the content sections use editorial grids for audiences, services, process steps, and differences.

At `850px` and below, navigation links collapse into a menu panel, the hero and content layouts become single-column, and the order preview stretches to the available width. Sections reduce from `100px` to `70px` vertical padding. At `520px` and below, forms become one column, process and difference grids become one column, and the order rows use a narrower `95px` label column.

## Elevation & Depth

Depth is mostly flat and tonal. The order preview is the deliberate exception: it uses an `18px 18px 0` amber offset on wide screens and a `10px 10px 0` offset below `850px`. Rules, dark/light section changes, and the amber offer block do most of the remaining separation work.

## Shapes

Controls and fields are square-cornered (`0px` radius), with 1px borders and no rounded card treatment. The skip link is pill-shaped (`999px`), while the small brand mark is circular (`50%`). Form controls use a warm near-paper fill and the order preview is a rectangular paper block.

## Components

### Buttons

Buttons are compact, squared actions with strong type and a small lift on primary hover.
- **Primary:** Amber background, ink text, `14px 19px` padding; hover shifts to the lighter amber and translates upward `2px`.
- **Ghost:** Transparent background with a muted border and paper text; hover changes the border and text to lime. On the amber offer and final sections, the ghost action uses an ink border/text and fills ink on hover.
- **Focus:** Lime `3px` outline with `2px` offset is shared with other interactive controls.

### Inputs / Fields

The demand form is a light paper panel inside the dark contact section. Labels use uppercase IBM Plex Mono; inputs, selects, and the textarea have a `1px` border, `#faf8f3` background, `12px` padding, and square corners. The form is a two-column grid on desktop, with wide fields spanning both columns, then collapses to one column below `520px`. Invalid entered fields use the red border; focus uses the lime outline.

### Order Preview

The hero’s order preview is the signature component: a paper panel with a bottom rule in its header, an `ABERTA` lime status, selectable service chips, and labeled deliverable/proposal/reference rows. Selected chips use an ink fill with lime text. The panel updates its title and deliverable when a chip is selected, while the initial content remains available without JavaScript.

### FAQ

FAQ items use native `details` and `summary`, separated by top and bottom rules. Summaries are bold, the marker is a monospace `+` that changes to `−` when open, and the expanded answer uses muted text on light sections and paper text in the dark FAQ section.

## Do's and Don'ts

### Do:
- **Do** frame new sections with the paper/ink system, thin rules, and monospace metadata when a section index or status is needed.
- **Do** reserve amber for actions, offers, and the order preview offset; use lime for selection, signals, hover, and focus.
- **Do** preserve square form controls and the single intentional offset shadow on the order preview.
- **Do** keep responsive behavior aligned to the `850px` and `520px` layout changes.

### Don't:
- **Don't** introduce rounded cards or pill-shaped buttons; the implemented form language is square.
- **Don't** add generic shadows, gradients, or decorative elevation that competes with the order preview offset.
- **Don't** use a second display or body typeface; the shipped pairing is Archivo with IBM Plex Mono for labels and metadata.
- **Don't** hide focus treatment or remove the reduced-motion behavior already provided by the system.
