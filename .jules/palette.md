## 2026-04-19 - Added Tooltip to icon-only log filters
**Learning:** Icon-only filter buttons in GameLog used native title attributes which lack sufficient contrast and styling context, leading to poor a11y.
**Action:** Replaced native `title` with Shadcn's `Tooltip`, adding explicit `aria-label` and `aria-pressed` to enhance screen reader accessibility while maintaining the UI compactness.
