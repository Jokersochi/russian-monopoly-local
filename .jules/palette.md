## 2026-10-08 - Interactive Card Headers Need Focus State
**Learning:** In PlayerPanel.tsx, expandable card headers were implemented as non-interactive divs with click handlers, breaking keyboard navigation and screen reader support.
**Action:** When implementing expandable cards (accordion pattern), always use semantic `<button>` elements with `aria-expanded`, `aria-controls`, and standard focus styles (`focus-visible:ring-2`) instead of clickable divs.
