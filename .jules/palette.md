## 2026-10-14 - Semantic Accordion Buttons
**Learning:** Using non-interactive <div> elements for expandable sections breaks keyboard focus and screen reader expansion state detection. Adding an explicit aria-label to a rich content button incorrectly overrides all its inner child text for screen readers.
**Action:** Use <button type="button"> with aria-expanded, aria-controls, w-full, and text-left for accordion triggers without applying an explicit aria-label when the button contains rich descriptive content.
