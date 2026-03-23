---
name: web-design-replicator
description: >
  Scan any live website URL and replicate its visual design in clean, production-ready code.
  Use this skill whenever the user provides a URL and wants to clone, mimic, replicate, rebuild,
  or reverse-engineer a website's design, layout, style, or aesthetic. Also triggers on phrases
  like "make it look like [site]", "match this design", "copy the style of", "build something
  similar to", or "can you replicate [URL]". Always activate for any URL + design/build request.
---

# Web Design Replicator

Fetches a live website, extracts its full design system, then rebuilds the visual UI in clean
production-ready code — matching the original's aesthetics without copying its content.

---

## Phase 1 — Fetch & Inventory the Site

### 1a. Pull the raw HTML + CSS

```bash
# Fetch full HTML (follow redirects, set a browser User-Agent to avoid blocks)
curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 \
  (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" \
  "{{URL}}" -o /tmp/site.html

# Extract all stylesheet hrefs
grep -oP '(?<=href=")[^"]*\.css[^"]*' /tmp/site.html | head -20
```

### 1b. Fetch key stylesheets

For each CSS file found (up to 3 main ones):

```bash
curl -sL "{{CSS_URL}}" -o /tmp/style_{{n}}.css
```

### 1c. Screenshot the site (if Puppeteer / Playwright available)

```bash
# If npx is available — takes a full-page screenshot
npx --yes @playwright/test chromium --screenshot --full-page "{{URL}}" \
  --output /tmp/site-screenshot.png 2>/dev/null || \
node -e "
const { execSync } = require('child_process');
// fallback: skip screenshot, continue with CSS analysis
console.log('Screenshot unavailable, proceeding with CSS extraction');
"
```

If screenshot succeeds, visually analyze it before proceeding.

---

## Phase 2 — Extract the Design System

Parse the fetched HTML + CSS to extract these tokens. Use `grep`, `sed`, or a small Node/Python
script. See `references/extractors.md` for copy-paste extraction scripts.

### Extract in this order:

**Colors**
```bash
# All hex + rgb/hsl color values in CSS
grep -oP '(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\))' /tmp/style_*.css \
  | sort | uniq -c | sort -rn | head -30
```

**Typography**
```bash
# Font families
grep -iP 'font-family\s*:' /tmp/style_*.css | grep -oP "(?<=:)[^;]+" | sort -u

# Font sizes
grep -oP 'font-size\s*:\s*[\d.]+[a-z%]+' /tmp/style_*.css | sort -u

# Font weights
grep -oP 'font-weight\s*:\s*\w+' /tmp/style_*.css | sort -u

# Google Fonts import URLs
grep -oP 'https://fonts\.googleapis\.com[^"'\'']+' /tmp/site.html /tmp/style_*.css | sort -u
```

**Spacing & Sizing**
```bash
# CSS custom properties (design tokens)
grep -oP '--[\w-]+\s*:\s*[^;]+' /tmp/style_*.css | head -50

# Padding / margin / gap values
grep -oP '(padding|margin|gap)\s*:\s*[\d.remvhpx% ]+' /tmp/style_*.css | sort -u | head -20

# Border radius
grep -oP 'border-radius\s*:\s*[^;]+' /tmp/style_*.css | sort -u
```

**Layout & Grid**
```bash
# Flex / grid patterns
grep -P '(display\s*:\s*(flex|grid)|grid-template)' /tmp/style_*.css | head -20

# Max widths / container sizes
grep -oP 'max-width\s*:\s*[^;]+' /tmp/style_*.css | sort -u
```

**Shadows & Effects**
```bash
grep -oP 'box-shadow\s*:\s*[^;]+' /tmp/style_*.css | sort -u
grep -oP 'backdrop-filter\s*:\s*[^;]+' /tmp/style_*.css | sort -u
```

---

## Phase 3 — Synthesize the Design System

After extraction, produce a structured design system summary:

```markdown
## Extracted Design System: {{SITE_NAME}}

### Color Palette
- Primary:    [most dominant non-white/black color]
- Secondary:  [second most used]
- Accent:     [high-contrast pop color]
- Background: [page bg]
- Surface:    [card/panel bg]
- Text:       [body text color]
- Muted:      [secondary text]

### Typography
- Display font: [name + import URL]
- Body font:    [name + import URL]
- Scale:        [xs/sm/base/lg/xl/2xl sizes in rem]
- Weights used: [list]
- Line heights: [list]

### Spacing System
- Base unit:  [px or rem value]
- Scale:      [xs sm md lg xl 2xl mapped values]
- Radius:     [button: Xpx, card: Xpx, pill: Xpx]

### Layout
- Max content width: [value]
- Column system:     [flex/grid, N cols]
- Breakpoints:       [sm/md/lg/xl if found]

### Visual Signatures
- Shadow style: [flat/elevated/dramatic/none]
- Border style: [visible/subtle/none]
- Motion:       [static/subtle/animated]
- Texture:      [gradient/solid/glassmorphism/noise]
- Overall mood: [1 sentence description]
```

---

## Phase 4 — Rebuild the UI

Apply the **frontend-design skill** principles while using the extracted tokens.

### Rules for replication:

1. **Use extracted tokens exactly** — plug in the real hex codes, font names, spacing values
2. **Replicate structure, not content** — use placeholder text/images, never copy real copy
3. **Match the visual fingerprint** — if the site uses glassmorphism + tight spacing + monospace,
   your output must too
4. **Import real fonts** — use the actual Google Fonts / Typekit URLs found in extraction
5. **Recreate the CSS architecture** — if they use CSS custom properties (`--color-primary`),
   mirror that pattern
6. **Honor the grid** — replicate column layout, gutters, max-width containers faithfully
7. **Capture signature effects** — gradients, shadows, blur effects are what make it "feel" right

### Output format:

Default to a **single self-contained HTML file** with embedded `<style>` and `<script>` unless
the user specifies a framework. For React, use styled-components or Tailwind with the exact
extracted values.

### Quality checklist before delivering:

- [ ] Color palette matches (eyeball primary, secondary, bg, text)  
- [ ] Fonts are actually imported and rendering  
- [ ] Spacing rhythm feels the same (tight vs airy)  
- [ ] Shadows / depth match the original feel  
- [ ] Layout structure (nav, hero, cards, footer) maps to the original  
- [ ] Hover states included if the original has them  

---

## Phase 5 — Deliver

1. Show the user the **extracted design system summary** first (Phase 3 output)
2. Ask if they want to adjust anything before building
3. Build the replicated component/page
4. Offer to target a specific section (hero, nav, cards, pricing, footer) if the full page
   is too complex

---

## Error Handling

| Problem | Action |
|---------|--------|
| Site blocks curl (403/429) | Try with different User-Agent or note limitation; ask user to paste HTML manually |
| No external CSS (inline styles / CSS-in-JS) | Parse `<style>` tags and inline `style=""` attributes from HTML |
| Fonts behind paywall (Adobe, custom) | Find the closest Google Fonts match and note the substitution |
| Heavy JS framework (React/Next/Svelte) | HTML will be minimal — focus on extracting colors + fonts from CSS; ask user for a screenshot |
| Screenshot fails | Proceed with CSS-only analysis; ask user to paste a screenshot manually |

---

## Read Next

- `references/extractors.md` — Ready-to-run Node + Python extraction scripts  
- `references/design-system-template.md` — Blank design system template to fill in  
