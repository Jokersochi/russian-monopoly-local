## 2026-09-27 - Game Log Filter Accessibility
**Learning:** Icon-only filter toggle buttons in log feeds need both localized title tooltips for hover clarity and explicit aria-label/aria-pressed attributes for screen readers.
**Action:** Always provide FILTER_CONFIG objects with ariaLabel properties for icon-only filter button groups.
