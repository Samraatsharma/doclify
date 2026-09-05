# Revia Public Website

The official public-facing marketing and distribution website for **Revia** — *"Your computer remembers, so you don’t have to."*

Built with React 19, TypeScript, Vite 8, and Vanilla CSS (Editorial & Mac-Native Design Tokens). Completely static, ultra-lightweight (< 275KB total bundle), and deployable to any static host (Cloudflare Pages, GitHub Pages, Vercel, Netlify).

---

## 1. Local Development

### Prerequisites
- Node.js 18+ and npm installed

### Running Locally
```bash
# Navigate to website directory
cd website

# Start development server
npm run dev
```

Visit `http://localhost:5173` to explore the live website.

---

## 2. Production Build

To build the static distribution bundle:

```bash
cd website
npm run build
```

The output will be placed in `website/dist/`:
- `dist/index.html`: Fully semantic, SEO-optimized HTML entry point
- `dist/assets/`: Compiled and minified CSS and JS bundles
- `dist/downloads/Revia_1.5.0_aarch64.dmg`: Real 15 MB Apple Silicon production disk image
- `dist/favicon.svg`: Luminous Revia 3D Memory Core icon
- `dist/robots.txt`: Search crawler directives
- `dist/sitemap.xml`: Sitemap specification

You can preview the production build locally with:
```bash
npm run preview
```

---

## 3. Dedicated Section Navigation Architecture

Rather than merely anchor-scrolling down a giant monolithic page, the navigation supports **dedicated section views** with full browser Back/Forward integration:
- `#overview`: Full cinematic introduction & staged Mac desktop simulation.
- `#story`: The cognitive problem & human memory gap narrative.
- `#how-it-works`: 3-phase progression (See it, Forget it, Ask Revia) with conceptual search and voice waveform demo.
- `#memory-field`: Interactive self-organizing memory constellation visualizer.
- `#privacy`: 4-stage on-device pipeline diagram and verified disclosures.
- `#mac`: Ambient menu bar resident and Double-Tap Control (`⌃ ⌃`) showcase.
- `#download`: Production download hub with verified SHA-256 checksum and 3-step installation guide.

---

## 4. Configuration & Direct Download Architecture

All release metadata, versions, and download URLs are centralized in [`website/src/config.ts`](./src/config.ts):

```typescript
export const CONFIG: ReleaseConfig = {
  version: "1.5.0",
  releaseDate: "September 2026",
  appName: "Revia",
  tagline: "Your computer remembers, so you don't have to.",
  subheadline: "Find that thing you saw on your Mac — even when you can't remember where you saw it.",
  githubOwner: "Samraatsharma",
  githubRepo: "doclify",
  signingStatus: "Developer build (signing/notarization pending)",
  githubReleasePageUrl: "https://github.com/Samraatsharma/doclify/releases",
  supportedOS: "macOS 12.0 Monterey or later",
  supportedArchitecture: "Apple Silicon (M1 / M2 / M3 / M4)",
  shortcutDefault: "DoubleControl",
  shortcutDisplay: "⌃ ⌃  (Double-Tap Control)",
};
```

---

## 5. Download Validation

The direct ZIP download has been verified via HTTP request:

```bash
curl -I http://localhost:5173/downloads/Revia_1.5.0_aarch64.zip
```

Returns `HTTP/1.1 200 OK` with `Content-Type: application/zip`.

Checksum calculation:
```bash
shasum -a 256 website/public/downloads/Revia_1.5.0_aarch64.zip
# -> 298dd95e2264a643aafd83fce5676ddb9eb0068c87b80a40f79c7a4a729f09e5
```

---

## 6. Free Deployment Options

### Option A: Cloudflare Pages (Recommended)
1. Push this repository to GitHub.
2. Log into Cloudflare Dashboard → Workers & Pages → Create Application → Pages → Connect to Git.
3. Select this repository.
4. Set **Build command**: `npm run build`
5. Set **Root directory**: `website`
6. Set **Build output directory**: `dist`
7. Click **Deploy site**.

### Option B: GitHub Pages
1. In `website/vite.config.ts`, if deploying under a subpath `https://<owner>.github.io/<repo>/`, set `base: "/<repo>/"`.
2. Push to GitHub with a GitHub Actions Pages workflow targeting `website/dist`.

### Option C: Vercel / Netlify
- Import the Git repository.
- Root Directory: `website`
- Build Command: `npm run build`
- Output Directory: `dist`
