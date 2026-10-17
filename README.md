# PixelVision: Gemma 4 Set-of-Mark Workbench

### Deterministic DOM Telemetry + Gemma 4 (31B / 26B) Multimodal Spec Verification

**PixelVision** is an AI-powered UI/UX auditing and verification workbench built with React 18, TypeScript, Vite, and Tailwind CSS. It combines Google's **Set-of-Mark (SoM)** visual prompting technique with **Gemma 4 (31B / 26B)** multimodal reasoning to audit live webpages and components against explicit product specifications, detect visual and layout regressions, and apply remediation patches in one click.

Submission for **[Hacktoberfest Hack Day Bengaluru 2026](https://www.mlh.com/events/hacktoberfest-hack-day-bengaluru-a0)** (October 13–18, 2026 | Hosted by KrowdKraft Community at Startup Park, Bengaluru)[cite: 20, 21]:
- **Primary Track:** Track 01 — *Best Use of Gemma 4* (`G3: Multimodal AI Intelligence — Text + Images`)
- **Open-Source Alignment:** Track 02 — *Best Open-Source AI Project* (`O3: Trustworthy and Verifiable AI`)

---

## The Problem & Vision

Modern frontend development and QA workflows suffer from critical bottlenecks:
- **Subjective UI Reviews:** Design critiques frequently rely on personal preference rather than objective, verifiable criteria.
- **Missed Visual Regressions:** Overlapping elements, clipped text, broken visual hierarchy, and inadequate touch targets slip through manual QA.
- **Spec-to-Code Drift:** Product and design specifications are not always faithfully translated into production HTML and CSS.
- **Slow Feedback Loops:** Manual design review cycles delay bug detection and remediation before shipping.

**How PixelVision Solves This:**
Instead of asking a vision model to guess pixel coordinates from a raw screenshot, PixelVision deterministically scans the live DOM inside an isolated sandbox, injects numbered red **Set-of-Mark (SoM)** badges with exact bounding boxes, and pairs the marked screenshot with structured DOM telemetry. Gemma 4 evaluates both the visual canvas and the structural telemetry against the developer's ground-truth product specification, returning badge-referenced violation reports and an actionable code patch that can be applied directly to the editor in one click.

---

## Try It in 60 Seconds

Just head over to https://pixelvision-black.vercel.app/