## 2024-04-03 - Accessible Standalone Button Groups
**Learning:** The codebase occasionally uses standalone grid layout buttons for mutually exclusive selections (like Language or Player Count) instead of native radio/toggle components. Screen readers don't natively understand these as a grouped selection.
**Action:** For accessibility, always wrap these button groups with `role="group"` and `aria-labelledby`, use `aria-pressed` on the individual buttons to indicate selection state, and hide decorative emojis from screen readers with `aria-hidden="true"`.
