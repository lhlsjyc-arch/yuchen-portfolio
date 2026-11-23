---
name: YC Workbench portfolio system
version: 2
---

# YC Workbench design system

## Direction

The case study uses an Apple-inspired product language: white space, quiet light-gray chapters, large product-led type, and real interface evidence. The page should feel precise and calm rather than branded by decorative color. No yellow fields, black page bands, gradients, or ornamental effects.

## Color

- `white`: `#FFFFFF` — primary page and product surface.
- `surface`: `#F5F5F7` — alternating chapters and grouped interface fields.
- `surface-deep`: `#E8E8ED` — subtle dividers and controls.
- `ink`: `#1D1D1F` — headings and primary text.
- `ink-soft`: `#424245` — secondary copy.
- `muted`: `#6E6E73` — metadata and explanations.
- `blue`: `#0071E3` — links, focus, progress, and primary actions only.

Black is used only as readable text. Yellow and large dark surfaces are not part of this system.

## Typography

Use the Apple system stack with PingFang SC fallbacks. Display type is large, compact, and semibold with balanced line breaks. Body copy remains neutral and readable, with a restrained measure and generous line height.

## Layout

The hero is one screen: a centered product thesis above the real macOS interface, cropped cleanly at the fold. Chapters alternate white and light gray at page scale. Section explanations sit directly below their headings so each chapter reads as one unit; the finished visual follows after a deliberate content gap. All content sections size to their content instead of being forced to viewport height, while keeping equal outer edges at every breakpoint.

## Components

Primary actions use Apple blue and a compact pill. Product windows use restrained radii, thin neutral borders, and one soft shadow. Supporting cards stay white or light gray; elevation is reserved for the selected record and main product windows. All visuals contain real content—no empty image placeholders.

## Motion

The hero enters once with opacity and transform. The four-step workflow is the only scroll-linked moment, using a blue progress line and small step offsets. Motion uses transforms and opacity only and resolves immediately under `prefers-reduced-motion`.

## Accessibility

Body text meets 4.5:1 contrast, controls are at least 44px tall on touch layouts, focus rings use Apple blue, reduced motion is supported, and the page must not overflow horizontally at 390px.
