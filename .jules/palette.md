## 2024-03-24 - Accessibility for Custom Button Groups
**Learning:** Using grid layouts with standalone buttons for mutually exclusive selections (like Player Count or Language) breaks native radio group accessibility.
**Action:** Always wrap these button groups with `role="group"` and `aria-labelledby` pointing to the section label, and use `aria-pressed` on the individual buttons to clearly communicate state to screen readers. Hide decorative emojis with `aria-hidden="true"` and provide clean `aria-label`s for icons.
