# Weight & Rings — CHI 2027 Digital Experience Prototype

## 1. Project Goal & Competition Constraints

- **Target**: ACM CHI 2027 Digital Experience Competition (Mobile-first web prototype, live demo without login/backend).
- **Core Concept**: A calm conference companion with a clay-style architectural miniature inspired by western Pennsylvania. Every session and break adds one selectable cantilever. Higher load compresses the spacing and thin break layers open a gap. The stone core grows upward and the miniature scales to fit. Selecting a session gives access to its 2023–2027 CHI research growth rings and the offline Slow Shelf.
- **Hard Constraints**:
  - **Zero Backend / Zero Auth**: 100% client-side persistence via `localStorage` (works offline after first load).
  - **WCAG 2.1 AA Accessibility (25% Judging Weight)**: Full keyboard navigation, semantic landmarks, `aria-live="polite"` load updates, zero rapid flashing, `prefers-reduced-motion` support, and a dedicated high-contrast static `List` view.
  - **Data Honesty**: Never fabricate room capacities or live crowd numbers; explicitly display `ROOM CAP: UNSPECIFIED · CHI JSON` where metadata is absent.

## 2. Tech Stack

- **Framework**: React 18 + TypeScript + Vite (zero unnecessary heavy dependencies).
- **Styling**: Tailwind CSS + CSS custom properties (`src/styles/tokens.css`).
- **Motion**: Lightweight CSS transitions / Framer Motion or Anime.js (strictly respecting `prefers-reduced-motion`).
- **Graphics**: Modular clay-style renders compose the dynamic architectural miniature and Slow Shelf thumbnails. The cedar dial and dock icons use SVG.
- **Responsive Viewport**: Mobile-first design (`max-width: 430px` centered gracefully on desktop with a subtle clean studio backdrop `#F5F6F4` and subtle border/shadow so judges on laptops see the exact mobile framing).

## 3. Visual System & Solar Sky Palette

- **Typography**: Clean geometric humanist sans-serif (`Inter` / `-apple-system, BlinkMacSystemFont, "SF Pro Display"`), tight editorial headings, tabular numbers (`font-variant-numeric: tabular-nums`) for percentages and years.
- **Primary Brand Colors**:
  - Deep Pine Text & Primary CTA: `#1B4335`
  - Secondary Muted Pine: `#4B635B`
  - Floating Dock Surface: `#193D32`
  - Surface Cards: `rgba(255, 255, 255, 0.72)` with subtle blur & soft warm border
  - Highlight Gold (2027 Ring / Active Terrace): `#D49B2A`
  - Overload Accent (Gentle Terracotta, never harsh alarm red): `#C86446`
- **Solar Sky System (5 Time-of-Day Gradients, all maintaining WCAG AA contrast for `#1B4335` text)**:
  1. `dawn` (06:00–09:00, default): `linear-gradient(180deg, #D9EEE5 0%, #F7F4EA 68%)`
  2. `morning` (09:00–11:30): `linear-gradient(180deg, #D9E9F2 0%, #F5F7F6 68%)`
  3. `noon` (11:30–14:30): `linear-gradient(180deg, #E8F1EC 0%, #F8F3E4 68%)`
  4. `afternoon` (14:30–17:30): `linear-gradient(180deg, #F1E4D1 0%, #F7F1E7 68%)`
  5. `dusk` (17:30–20:30): `linear-gradient(180deg, #D8DDE9 0%, #F2DDD2 68%)`

## 4. Material-Coded Session Types (Must Stay Consistent Across All 3 Views)

| Session Type | Cognitive Load Weight | Slow Shelf Subject | Color Tokens |
| :--- | :--- | :--- | :--- |
| `paper` (Paper session) | Heavy (`22`–`28` pts) | Folded research paper with a gold Three Sisters span | `#A69F91` / `#D49B2A` |
| `workshop` (Workshop / SIG) | Medium (`16`–`20` pts) | Maple workbench with the red Duquesne Incline | `#C79A63` / `#97382F` |
| `poster` (Poster / Demo) | Light (`10`–`14` pts) | Bar-chart display with the Phipps Palm Court roofline | `#CBE0D6` / `#2D6050` |
| `break` (Pause / Break) | Restorative (`-12` pts) | Thin warm sandstone terrace with a wider air gap | `#FAF5E6` / `#A69F91` |

## 5. Five Bottom Dock Views (Bespoke Inline SVG Icons)

Bottom floating capsule dock (`#193D32`, fixed at bottom with safe padding):

1. **Vessel** (`Today` main architectural stage with interactive terraces)
2. **Rings** (Growth rings inspector for the currently selected session, or quick picker if none selected)
3. **Pause** (Quick break drawer with Pittsburgh/Pennsylvania restorative landings + 15-min break action)
4. **Saved** (`Slow Shelf` offline-ready archive with material-coded cards)
5. **List** (Zero-animation, high-contrast static accessible schedule & full session browser)
