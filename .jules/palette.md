## 2026-10-09 - Accessible Accordion Cards
**Learning:** Expandable cards using block-level `<div>` elements block keyboard navigation and screen reader expansion states. Converting them to `<button>` breaks layout unless block-level styling (`w-full text-left`) is explicitly restored.
**Action:** Always use semantic `<button aria-expanded aria-controls>` with layout-preserving classes for custom accordion headers.
