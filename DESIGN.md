---
version: "alpha"
name: "Doclify - Verdant Intelligent Developer Platform"
description: "Design specification for Doclify AI Developer Platform. Features a premium dark/zinc aesthetic, emerald #10B981 accent, Geist and Inter typography, glass surfaces, subtle borders, atmospheric background, and a responsive WebGL/Canvas dot-matrix particle field."
colors:
  primary: "#10B981"
  secondary: "#FFFFFF"
  tertiary: "#0A83C9"
  neutral: "#FFFFFF"
  background: "#09090B"
  surface: "#18181B"
  surface-hover: "#27272A"
  surface-subtle: "rgba(24, 24, 27, 0.65)"
  text-primary: "#A1A1AA"
  text-secondary: "#FFFFFF"
  text-muted: "#71717A"
  border: "#27272A"
  border-subtle: "rgba(39, 39, 42, 0.6)"
  accent: "#10B981"
  accent-glow: "rgba(16, 185, 129, 0.15)"
typography:
  display-lg:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "72px"
    fontWeight: 300
    lineHeight: "72px"
    letterSpacing: "-0.05em"
  display-md:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "48px"
    fontWeight: 300
    lineHeight: "52px"
    letterSpacing: "-0.03em"
  body-md:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "18px"
    fontWeight: 300
    lineHeight: "28px"
  label-md:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  mono-sm:
    fontFamily: "Geist Mono, JetBrains Mono, monospace"
    fontSize: "13px"
    lineHeight: "18px"
rounded:
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  base: "8px"
  sm: "8px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  gap: "8px"
  section-padding: "32px"
---

# Doclify Visual Design Specification

## Overview
Doclify's visual interface pairs the high-precision minimalism of modern developer tooling (Vercel, Linear) with an atmospheric, organic computing aesthetic (Verdant).

- **Layout:** Flex / Full Bleed composition with standard 8px grid rhythm.
- **Framing:** Glassy surfaces with radial emerald gradient lighting.
- **Atmosphere:** Deep zinc `#09090B` background illuminated by a full-bleed interactive Canvas dot-matrix particle field.

---

## 1. Color Palette

*   **Primary Accent (`#10B981`):** Emerald green indicator for active AI processes, CTAs, status badges, and data flow lines.
*   **Background (`#09090B`):** Deep obsidian/zinc foundation.
*   **Surface (`#18181B`):** Glass cards and elevation panels with `backdrop-filter: blur(12px)`.
*   **Border (`#27272A`):** 1px subtle hairline framing.
*   **Text Primary (`#FFFFFF`):** High-contrast headlines and active labels.
*   **Text Secondary (`#A1A1AA`):** Body copy, secondary metadata, and descriptions.
*   **Text Muted (`#71717A`):** File extensions, timestamps, and placeholder text.

---

## 2. Typography

*   **Geist Display:** Headlines, hero title, section banners. Light weight (300/400) with tight tracking (`-0.05em`).
*   **Inter:** Interface labels, table content, forms, and buttons.
*   **Geist Mono / JetBrains Mono:** Code snippets, terminal logs, file tree paths, and CLI commands.

---

## 3. Elevation, Glassmorphism & Radial Depth

Surfaces read as frosted glass over an atmospheric particle field:
*   `background: rgba(24, 24, 27, 0.7)` with `backdrop-filter: blur(16px)`
*   `border: 1px solid rgba(39, 39, 42, 0.8)`
*   **Glow Shell:** Inset or outer wrappers powered by `radial-gradient(circle at center, rgba(16, 185, 129, 0.12) 0%, rgba(9, 9, 11, 0) 70%)`.

---

## 4. WebGL / Canvas Dot-Matrix Particle Field

The hero features an organic, computational particle field:
*   **Structure:** 3D spherical / toroidal particle cloud projected onto a 2D canvas.
*   **Particles:** `#10B981` emerald dots with soft alpha depth fade based on Z-depth.
*   **Motion:** Continuous slow breathing pulse oscillating with sinusoidal rotation.
*   **Interaction:** Subtle pointer-reactive parallax drift tracking mouse position.
*   **Fallback:** Radial gradient backdrop ensuring zero visual disruption if Canvas is unavailable.

---

## 5. Component Patterns

*   **Primary Action Button:** Full rounded `pill` (`rounded-full`), white background `#FFFFFF`, black text `#18181B`, emerald hover glow.
*   **Secondary Ghost Button:** Glass background `rgba(24, 24, 27, 0.8)`, hairline border `#27272A`, white text, hover border `#10B981`.
*   **Status Pill:** Emerald pulsing dot + uppercase micro-label (`READY`, `ANALYZING`, `SYNCED`).
*   **Pipeline Visualizer:** Interactive 5-stage node flow (Codebase → Context Engineering → AI Agents → Cache → README) showing real-time data movement.
