---
version: alpha
name: namaewanam.github.io
description: Engineering and distributed systems personal tech blog with a Shank/terminal minimalist aesthetic.
colors:
  background: hsl(var(--background))
  foreground: hsl(var(--foreground))
  primary: hsl(var(--primary))
  primary-foreground: hsl(var(--primary-foreground))
  secondary: hsl(var(--secondary))
  secondary-foreground: hsl(var(--secondary-foreground))
  muted: hsl(var(--muted))
  muted-foreground: hsl(var(--muted-foreground))
  accent: hsl(var(--accent))
  accent-foreground: hsl(var(--accent-foreground))
  card: hsl(var(--card))
  card-foreground: hsl(var(--card-foreground))
  border: hsl(var(--border))
  ring: hsl(var(--ring))
typography:
  sans:
    fontFamily: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
  mono:
    fontFamily: var(--font-mono), "SF Mono", "Cascadia Code", Menlo, monospace
---

## Overview

A personal developer publication focused on backend systems, distributed architectures, database internals, and hands-on practice labs. The visual style follows a warm, tactile Shank/terminal aesthetic: high content density, monospace metadata labels, restrained borders, and clear typography hierarchy.

## Colors

The interface relies on the Shank Color Palette with high contrast and WCAG AA accessibility:

- **Background & Card**: Cream tone in Light Mode (`#f5f4d5`), deep warm charcoal brown in Dark Mode.
- **Foreground**: Deep earth brown in Light Mode (`#765023`), warm cream in Dark Mode.
- **Primary & Accent**: Gold (`#fccb26`) for primary focus, highlights, and active tags; Warm Orange (`#f18231`) for hyperlinks and interactive callouts.
- **Border & Muted**: Subtle low-contrast structural borders that define containers without visual clutter.

## Themes

| Role | Light Mode Value | Dark Mode Value | Purpose |
| :--- | :--- | :--- | :--- |
| `background` | `56 67% 90%` (#f5f4d5) | `27 50% 8%` | Root canvas |
| `foreground` | `27 54% 30%` (#765023) | `56 50% 88%` | Primary text |
| `primary` | `39 96% 57%` (#fccb26) | `39 96% 57%` | Brand gold, active tags |
| `accent` | `25 85% 57%` (#f18231) | `25 85% 57%` | Links, action items |
| `card` | `56 55% 93%` | `27 42% 12%` | Grouped containers, cards |
| `border` | `27 20% 78%` | `27 25% 22%` | Structural hairline dividers |

## Typography

- **Body Copy**: Standard system sans-serif (`font-sans`) optimized with `leading-[1.75]` to `leading-[1.9]`. Long-form article paragraphs are capped at `max-w-prose` (approx 65–75 characters per line) to maintain comfortable eye movement.
- **Terminal & Metadata**: Monospace font (`font-mono`) used for path breadcrumbs, metadata badges, dates, tags, and CLI guestbook.
- **Headings**: Semibold weight with tight letter tracking (`tracking-tight`), distinct margins (`mt-8 mb-3` for `h2`, `mt-6 mb-2` for `h3`).

## Layout

- **Container Widths**:
  - `max-w-3xl` (~768px) for blog index, category landing, reading list, and standalone pages.
  - `max-w-5xl` (~1024px) for long-form post layout containing the two-column article and sticky Table of Contents.
- **Responsive Behavior**:
  - Desktop (≥ 1024px): Dedicated right-hand sticky Table of Contents with scroll-spy heading tracking.
  - Mobile (< 1024px): Collapsible Table of Contents disclosure at the top of the post for instant section jumps.

## Do's and Don'ts

- **Do** use semantic role colors (`primary`, `accent`, `muted-foreground`, `border`) rather than arbitrary hardcoded hex codes.
- **Do** ensure interactive controls have minimum touch targets of 44×44px on mobile devices.
- **Do** maintain smooth transitions (150ms–200ms ease-out) for theme switching, card hovers, and disclosures.
- **Don't** use arbitrary drop shadows, glowing neon blurs, or gradients that contradict the minimal terminal aesthetic.
- **Don't** hide navigation or content hierarchies on mobile without an accessible interactive alternative.
