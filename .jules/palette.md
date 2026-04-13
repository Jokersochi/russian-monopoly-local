## 2025-05-15 - Enhancing Icon-Only Elements with Tooltips and ARIA

**Learning:** In highly visual games like Monopoly, player tokens and ownership markers are often represented by icons or emojis. While visually appealing, these lack inherent meaning for screen readers and can be ambiguous for sighted users (e.g., "Which player is the teapot?"). Using Shadcn `Tooltip` components paired with `aria-label` and `aria-pressed` provides a dual-layer of accessibility: tooltips for visual clarification and ARIA attributes for assistive technologies.

**Action:** Always wrap icon-only buttons or informational markers in tooltips. Ensure `aria-label` is used to describe the action or the state, and use `aria-hidden="true"` for purely decorative emojis to reduce screen reader noise.
