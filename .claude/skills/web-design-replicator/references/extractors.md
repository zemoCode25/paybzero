# Extraction Scripts

Ready-to-run scripts for extracting design tokens from fetched HTML/CSS files.
Run these from the terminal after Phase 1 (fetching the site).

---

## Node.js: Full Design Token Extractor

Save as `/tmp/extract-tokens.js` and run with `node /tmp/extract-tokens.js`

```javascript
const fs = require('fs');
const path = require('path');

// Load fetched CSS files
const cssFiles = ['/tmp/style_0.css', '/tmp/style_1.css', '/tmp/style_2.css']
  .filter(f => { try { fs.accessSync(f); return true; } catch { return false; } })
  .map(f => fs.readFileSync(f, 'utf8'))
  .join('\n');

const html = (() => { try { return fs.readFileSync('/tmp/site.html', 'utf8'); } catch { return ''; } })();
const allCSS = cssFiles + '\n' + (html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || []).join('\n');

const result = {};

// Colors
const colorRx = /(#[0-9a-fA-F]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\))/g;
const colorCounts = {};
let m;
while ((m = colorRx.exec(allCSS)) !== null) {
  colorCounts[m[1]] = (colorCounts[m[1]] || 0) + 1;
}
result.colors = Object.entries(colorCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([color, count]) => ({ color, count }));

// Font families
const fontFamilies = new Set();
const fontRx = /font-family\s*:\s*([^;}{]+)/gi;
while ((m = fontRx.exec(allCSS)) !== null) {
  m[1].split(',').forEach(f => fontFamilies.add(f.trim().replace(/['"]/g, '')));
}
result.fontFamilies = [...fontFamilies];

// Font sizes
const fontSizes = new Set();
const sizeRx = /font-size\s*:\s*([\d.]+(?:px|rem|em|vw|%))/gi;
while ((m = sizeRx.exec(allCSS)) !== null) fontSizes.add(m[1]);
result.fontSizes = [...fontSizes].sort((a, b) => parseFloat(a) - parseFloat(b));

// Font weights
const fontWeights = new Set();
const weightRx = /font-weight\s*:\s*([\w]+)/gi;
while ((m = weightRx.exec(allCSS)) !== null) fontWeights.add(m[1]);
result.fontWeights = [...fontWeights];

// CSS custom properties (design tokens)
const customProps = {};
const propRx = /(--[\w-]+)\s*:\s*([^;}{]+)/g;
while ((m = propRx.exec(allCSS)) !== null) {
  customProps[m[1].trim()] = m[2].trim();
}
result.customProperties = customProps;

// Spacing values
const spacingValues = new Set();
const spacingRx = /(?:padding|margin|gap|row-gap|column-gap)\s*:\s*([\d.remvhpx %]+)/gi;
while ((m = spacingRx.exec(allCSS)) !== null) spacingValues.add(m[1].trim());
result.spacing = [...spacingValues].slice(0, 20);

// Border radius
const radii = new Set();
const radiusRx = /border-radius\s*:\s*([^;}{]+)/gi;
while ((m = radiusRx.exec(allCSS)) !== null) radii.add(m[1].trim());
result.borderRadius = [...radii];

// Shadows
const shadows = new Set();
const shadowRx = /box-shadow\s*:\s*([^;}{]+)/gi;
while ((m = shadowRx.exec(allCSS)) !== null) shadows.add(m[1].trim());
result.boxShadows = [...shadows];

// Google Fonts imports
const gfontsRx = /https:\/\/fonts\.googleapis\.com[^\s"')]+/g;
const gfonts = new Set();
while ((m = gfontsRx.exec(html + allCSS)) !== null) gfonts.add(m[0]);
result.googleFontsUrls = [...gfonts];

// Max widths
const maxWidths = new Set();
const mwRx = /max-width\s*:\s*([\d.]+(?:px|rem|em|vw|ch|%))/gi;
while ((m = mwRx.exec(allCSS)) !== null) maxWidths.add(m[1]);
result.maxWidths = [...maxWidths];

// Output
console.log(JSON.stringify(result, null, 2));
fs.writeFileSync('/tmp/design-tokens.json', JSON.stringify(result, null, 2));
console.error('\n✅ Tokens saved to /tmp/design-tokens.json');
```

---

## Python: Lightweight Color + Font Extractor

Save as `/tmp/extract.py` and run with `python3 /tmp/extract.py`

```python
import re, json, os, glob
from collections import Counter

css = ""
for f in glob.glob("/tmp/style_*.css"):
    with open(f) as fh:
        css += fh.read()

html = ""
try:
    with open("/tmp/site.html") as fh:
        html = fh.read()
    # inline styles
    css += " ".join(re.findall(r'<style[^>]*>(.*?)</style>', html, re.DOTALL))
except:
    pass

all_text = css + html

# Colors
colors = Counter(re.findall(
    r'#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)',
    all_text
))

# Fonts
fonts = set(re.findall(r"font-family\s*:\s*([^;}{]+)", all_text, re.I))
font_imports = re.findall(r'https://fonts\.googleapis\.com[^\s"\')\]]+', all_text)

# Custom props
custom_props = dict(re.findall(r'(--[\w-]+)\s*:\s*([^;}{]+)', all_text))

# Spacing
spacing = set(re.findall(r'(?:padding|margin|gap)\s*:\s*([\d.\w %]+)', all_text, re.I))

# Radius
radii = set(re.findall(r'border-radius\s*:\s*([^;}{]+)', all_text, re.I))

# Shadows
shadows = set(re.findall(r'box-shadow\s*:\s*([^;}{]+)', all_text, re.I))

result = {
    "colors": [{"color": c, "count": n} for c, n in colors.most_common(20)],
    "fonts": list(fonts)[:15],
    "googleFontsUrls": list(set(font_imports)),
    "customProperties": {k: v.strip() for k, v in list(custom_props.items())[:60]},
    "spacing": list(spacing)[:20],
    "borderRadius": list(radii)[:10],
    "boxShadows": list(shadows)[:10],
}

print(json.dumps(result, indent=2))
with open("/tmp/design-tokens.json", "w") as f:
    json.dump(result, f, indent=2)
print("✅ Tokens saved to /tmp/design-tokens.json")
```

---

## Bash: Quick Color Audit (no Node/Python needed)

```bash
# Top 20 colors used across all fetched CSS
cat /tmp/style_*.css 2>/dev/null | \
  grep -oP '(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\))' | \
  sort | uniq -c | sort -rn | head -20

# All font-family declarations
cat /tmp/style_*.css 2>/dev/null | \
  grep -iP 'font-family' | \
  grep -oP "(?<=:)[^;]+" | \
  sort -u

# CSS custom properties (design tokens)
cat /tmp/style_*.css 2>/dev/null | \
  grep -oP '--[\w-]+\s*:\s*[^;}{]+' | \
  head -40

# Google Fonts URLs from HTML
grep -oP 'https://fonts\.googleapis\.com[^\s"'\'']+' /tmp/site.html 2>/dev/null
```
