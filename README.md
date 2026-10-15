# zero-cls-font ⚡

> Zero-runtime automatic font fallback metric calculator to eliminate **Cumulative Layout Shift (CLS)** forever.

[![npm version](https://badge.fury.io/js/zero-cls-font.svg)](https://www.npmjs.com/package/zero-cls-font)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

When custom web fonts load over real-world networks (especially 3G/4G or mobile), browsers temporarily render fallback system fonts (such as Arial or Times New Roman). Because the dimensions and character widths of system fonts differ from your custom font, the page violently reflows when the web font swaps in—causing high **Cumulative Layout Shift (CLS)** and degrading Google Core Web Vitals.

**`zero-cls-font`** extracts glyph metrics from any OpenType, TrueType, or WOFF2 font and mathematically calculates CSS overrides (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`) to morph local fallback fonts into exact replicas of your web font's layout boundaries.

---

## Features

- 🎯 **Eliminates Font CLS**: Prevents layout jumps when fonts swap with `font-display: swap`.
- ⚡ **Zero Runtime Overhead**: All math is performed at build time or via CLI. Zero client-side JS.
- 🛠 **Universal CLI**: Run `npx zero-cls-font --font ./font.woff2` anywhere.
- 🔌 **Vite Plugin Included**: Virtual CSS module integration (`virtual:zero-cls-font.css`).
- 🎨 **Visual Storybook Lab**: Test layout jump in real-time with adjustable network throttling.
- 📦 **Dual ESM & CommonJS**: Full TypeScript support out-of-the-box.

---

## Installation

```bash
npm install zero-cls-font
# or
pnpm add zero-cls-font
# or
yarn add zero-cls-font
```

---

## Quick Start

### 1. Command Line Interface (CLI)

Generate fallback CSS directly from your font file:

```bash
# Print to console
npx zero-cls-font --font ./fonts/PlayfairDisplay-Regular.woff2 --fallback Arial

# Save directly to CSS file
npx zero-cls-font --font ./fonts/PlayfairDisplay-Regular.woff2 --fallback Arial --out ./src/font-fallback.css
```

#### CLI Options

| Flag | Short | Description | Default |
| --- | --- | --- | --- |
| `--font` | `-f` | **(Required)** Path to `.woff2`, `.ttf`, or `.otf` font | — |
| `--fallback` | `-b` | System fallback font (`Arial`, `Times New Roman`, `Courier New`, `Roboto`) | `Arial` |
| `--url` | `-u` | Public URL for primary `@font-face` rule | Optional |
| `--out` | `-o` | Output file path (prints to stdout if omitted) | stdout |

---

### 2. Vite Plugin

Add `zeroClsFontPlugin` to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { zeroClsFontPlugin } from 'zero-cls-font/vite';

export default defineConfig({
  plugins: [
    zeroClsFontPlugin({
      fonts: [
        {
          fontPath: './public/fonts/Outfit-Regular.woff2',
          fallbackFont: 'Arial',
          customFontUrl: '/fonts/Outfit-Regular.woff2',
        },
      ],
    }),
  ],
});
```

Import the virtual CSS into your app's main entry (`main.ts` or `App.tsx`):

```typescript
import 'virtual:zero-cls-font.css';
```

Use the generated CSS variable in your stylesheets:

```css
body {
  font-family: var(--font-outfit);
}
```

---

### 3. Programmatic Node.js API

```typescript
import { generateZeroClsCss, extractFontMetrics, computeOverridesFromMetrics } from 'zero-cls-font';

// 1. High-level generation directly from file
const result = generateZeroClsCss({
  fontPath: './fonts/SpaceGrotesk.woff2',
  fallbackFont: 'Arial',
  customFontUrl: '/fonts/SpaceGrotesk.woff2',
});

console.log(result.css);
console.log(result.sizeAdjust); // e.g. "98.54%"
console.log(result.ascentOverride); // e.g. "97.23%"
```

---

## Generated CSS Example

```css
@font-face {
  font-family: 'Playfair Display';
  src: url('/fonts/PlayfairDisplay.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'Playfair Display Fallback';
  src: local('Arial');
  size-adjust: 104.22%;
  ascent-override: 103.82%;
  descent-override: 24.08%;
  line-gap-override: 0.00%;
}

:root {
  --font-playfair-display: 'Playfair Display', 'Playfair Display Fallback', sans-serif;
}
```

---

## Storybook Visual CLS Testing Lab

To visually inspect font swapping and measure real pixel layout shift:

```bash
npm run storybook
```

This launches an interactive Storybook test suite where you can test different system fallbacks against custom Google Fonts, tweak artificial 3G latency, and observe live layout shift scoring.

---

## License

[MIT](./LICENSE) © 2026
