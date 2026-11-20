## 2026-09-29 - Semantic Expandable Buttons
**Learning:** Using non-interactive <div> elements for accordion/expandable card headers breaks keyboard navigation and hides the expanded state from screen readers.
**Action:** Always use semantic <button type="button"> elements with aria-expanded and aria-controls, along with w-full text-left to preserve block layout behavior.
