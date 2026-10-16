## 2026-02-23 - Screen Reader Accessibility for Save Slots and Option Toggles
**Learning:** In interactive setup forms with card-like save slot selectors and custom button groups, adding `aria-pressed={isSelected}` alongside dynamic `aria-label`s (summarizing slot contents or option context) allows screen readers to announce active choices and hidden details without requiring complex DOM structures.
**Action:** Always include `aria-pressed` for toggle/segmented button choices and set a comprehensive `aria-label` when card choices contain multi-line or truncated info.
