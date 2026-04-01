## 2024-04-01 - Accessible Button Groups
**Learning:** This app occasionally uses standalone grid layout buttons for mutually exclusive selections (like Language or Player Count) instead of native radio or toggle components. Screen readers might not perceive these as a related set of options.
**Action:** Always wrap these custom button groups with `role="group"` and `aria-labelledby` pointing to their labels, and use `aria-pressed` on the individual buttons to clearly indicate the selected state.
