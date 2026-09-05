## 2026-08-20 - Custom Toggle Button Accessibility
**Learning:** When implementing custom interactive elements (like the property selection buttons in `TradingModal.tsx`) that act as toggles, they often lack native state communication for screen readers and visible focus indicators.
**Action:** Always add `aria-pressed={boolean}` to custom toggle buttons to ensure their selected state is announced programmatically, and apply `focus-visible:ring-2 focus-visible:ring-offset-1` with appropriate theme colors to maintain keyboard accessibility.
