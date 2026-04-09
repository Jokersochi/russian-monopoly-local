## 2024-04-09 - Accessible Mutually Exclusive Selection Buttons
**Learning:** Standalone grid layout buttons are often used for mutually exclusive selections (like Language or Player Count) instead of native radio components. These button groups are not inherently accessible.
**Action:** Always wrap these button groups with `role="group"` and `aria-labelledby`, use `aria-pressed` on individual buttons to reflect their active state, and ensure decorative elements like emojis have `aria-hidden="true"`.
