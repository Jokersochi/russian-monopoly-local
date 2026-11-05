## 2025-05-18 - Accordion Accessibility Pattern
Learning: Non-interactive block elements used as accordion card headers prevent keyboard users from focusing and expanding details.
Action: Always wrap expandable card headers in semantic `<button type=button>` elements with `aria-expanded` and `aria-controls` attributes while preserving block layout with `w-full text-left`.
