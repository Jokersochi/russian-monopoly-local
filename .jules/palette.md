## 2026-10-10 - Semantic Expandable Cards
**Learning:** Using non-interactive divs for expandable card headers (like in PlayerPanel.tsx) breaks keyboard navigation and screen reader support. Converting them requires `<button type="button">`, `aria-expanded`, `aria-controls`, and `w-full text-left` to maintain layout.
**Action:** Always use semantic buttons with proper ARIA attributes for custom accordion patterns to ensure accessibility.
