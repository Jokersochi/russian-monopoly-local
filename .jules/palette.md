## 2026-08-20 - Interactive Accordion Headers as Semantic Buttons
**Learning:** In sidebar panels where cards toggle expanded details (e.g. player net worth and properties), rendering card headers as clickable `<div>`s breaks keyboard navigation (Tab/Space/Enter) and hides expandable state from screen readers.
**Action:** Always wrap interactive card headers in a semantic `<button type="button">` with `aria-expanded`, `aria-controls`, `aria-hidden` on decorative indicators, and `focus-visible:ring-2` matching the app theme.
