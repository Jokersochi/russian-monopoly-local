## 2026-04-03 - Improving Accessibility of Custom Selection Groups
**Learning:** In game setup screens or complex dashboards, custom grid-based button groups are often used for selection instead of native radio buttons for visual reasons. To remain accessible, these must be explicitly marked with `role="group"`, have an associated label via `aria-labelledby`, and each button must use `aria-pressed` to communicate its state to screen readers.
**Action:** Always wrap non-native selection button groups in a `role="group"` container and use `aria-pressed` for the active state.
