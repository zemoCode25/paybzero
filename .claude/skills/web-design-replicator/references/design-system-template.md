# Design System Template

Blank template to fill in during Phase 3. Copy this into your response when presenting
the extracted design system to the user.

---

## Extracted Design System: [SITE NAME]
> Source: [URL] | Analyzed: [DATE]

---

### 🎨 Color Palette

```css
:root {
  --color-primary:    [hex];   /* [usage context, e.g. "CTAs, links"] */
  --color-secondary:  [hex];   /* [usage context] */
  --color-accent:     [hex];   /* [usage context, e.g. "highlights, badges"] */
  --color-bg:         [hex];   /* [page background] */
  --color-surface:    [hex];   /* [cards, panels] */
  --color-surface-2:  [hex];   /* [nested surfaces, inputs] */
  --color-border:     [hex];   /* [dividers, outlines] */
  --color-text:       [hex];   /* [primary body text] */
  --color-text-muted: [hex];   /* [secondary / placeholder text] */
  --color-text-inv:   [hex];   /* [text on dark/colored backgrounds] */
}
```

**Theme mood:** [dark / light / warm neutral / cool neutral / high contrast / pastel]

---

### 🔤 Typography

```css
/* Import */
[GOOGLE FONTS @import or <link> tag]

:root {
  --font-display: '[Display/Heading font]', [fallback stack];
  --font-body:    '[Body font]', [fallback stack];
  --font-mono:    '[Mono font if used]', monospace;

  /* Scale */
  --text-xs:   [value];   /* e.g. 0.75rem */
  --text-sm:   [value];   /* e.g. 0.875rem */
  --text-base: [value];   /* e.g. 1rem */
  --text-lg:   [value];   /* e.g. 1.125rem */
  --text-xl:   [value];   /* e.g. 1.25rem */
  --text-2xl:  [value];   /* e.g. 1.5rem */
  --text-3xl:  [value];   /* e.g. 1.875rem */
  --text-4xl:  [value];   /* e.g. 2.25rem */

  /* Weights */
  --weight-normal:    400;
  --weight-medium:    500;   /* if used */
  --weight-semibold:  600;   /* if used */
  --weight-bold:      700;

  /* Line heights */
  --leading-tight:   1.2;
  --leading-normal:  1.5;
  --leading-relaxed: 1.75;

  /* Letter spacing */
  --tracking-tight:  -0.02em;
  --tracking-normal: 0;
  --tracking-wide:   0.05em;   /* common for uppercase labels */
}
```

---

### 📐 Spacing & Sizing

```css
:root {
  /* Spacing scale */
  --space-1:  [value];   /* ~4px */
  --space-2:  [value];   /* ~8px */
  --space-3:  [value];   /* ~12px */
  --space-4:  [value];   /* ~16px */
  --space-6:  [value];   /* ~24px */
  --space-8:  [value];   /* ~32px */
  --space-10: [value];   /* ~40px */
  --space-12: [value];   /* ~48px */
  --space-16: [value];   /* ~64px */
  --space-20: [value];   /* ~80px */
  --space-24: [value];   /* ~96px */

  /* Border radius */
  --radius-sm:   [value];   /* e.g. 4px  — small tags, inputs */
  --radius-md:   [value];   /* e.g. 8px  — buttons, cards */
  --radius-lg:   [value];   /* e.g. 12px — modals, large cards */
  --radius-xl:   [value];   /* e.g. 16px — hero sections */
  --radius-full: 9999px;    /* pill shape */

  /* Layout */
  --container-max: [value];   /* e.g. 1200px */
  --container-pad: [value];   /* e.g. 24px horizontal padding */
  --grid-cols:    [N];
  --grid-gap:     [value];
}
```

---

### ✨ Visual Effects

```css
:root {
  /* Shadows */
  --shadow-sm: [value];   /* subtle card lift */
  --shadow-md: [value];   /* elevated components */
  --shadow-lg: [value];   /* modals, popovers */

  /* Borders */
  --border-width: [value];
  --border-color: var(--color-border);
  --border:       var(--border-width) solid var(--border-color);

  /* Transitions */
  --transition-fast:   [value];   /* e.g. 150ms ease */
  --transition-normal: [value];   /* e.g. 250ms ease */
  --transition-slow:   [value];   /* e.g. 400ms ease */
}
```

---

### 🏗️ Layout Patterns

| Pattern | Value |
|---------|-------|
| Nav height | [px] |
| Section padding (vertical) | [px/rem] |
| Card padding | [px/rem] |
| Sidebar width | [px / %] |
| Column layout | [e.g. 12-col grid, 3-col cards] |
| Breakpoints | [sm: Xpx, md: Xpx, lg: Xpx] |

---

### 🎯 Visual Signature (1-line summary)

> "[Site name] uses a [dark/light] [adjective] aesthetic — [key characteristics, e.g. 
> 'sharp geometric typography, high-contrast monochrome palette with electric blue accents,
> elevated cards with subtle blur, tight dense spacing throughout']."

---

### 📦 Component Patterns Observed

- **Buttons:** [style description — e.g. "filled primary, ghost secondary, pill-shaped, 16px padding"]
- **Cards:** [e.g. "1px border, 12px radius, subtle shadow, 24px padding"]
- **Navigation:** [e.g. "sticky, frosted glass bg, logo left, links right, CTA button end"]
- **Hero:** [e.g. "full-width, centered text, gradient background, large display font"]
- **Inputs:** [e.g. "2px border, transparent bg, focus ring in accent color"]
- **Badges/Tags:** [e.g. "small pill, muted bg, tight letter-spacing uppercase"]
