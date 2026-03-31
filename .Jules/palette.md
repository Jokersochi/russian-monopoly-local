## 2024-05-14 - Improve accessibility for button group selections
**Learning:** For standalone grid layout buttons used as mutually exclusive selections (like Language or Player Count) instead of native radio/toggle components, screen readers lack context of the grouping and selection state.
**Action:** Always wrap these button groups with `role="group"` and `aria-labelledby`, and use `aria-pressed` on the individual buttons to announce their selection state to screen readers.
