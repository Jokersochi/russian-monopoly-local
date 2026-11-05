## 2026-10-16 - Accordion Trigger Accessibility in Player Cards
**Learning:** Non-interactive `<div>` elements used as accordion toggles prevent screen readers and keyboard users from discovering and expanding card details. Overriding accordion triggers with explicit `aria-label` attributes erases rich child information.
**Action:** Always convert expandable card headers to semantic `<button type=button>` elements with `aria-expanded`, `aria-controls`, and focus visible styling while avoiding explicit `aria-label` on complex child containers.
