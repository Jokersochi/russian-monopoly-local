## 2024-05-20 - Accessibility and Localization Hardening
**Learning:** In a multi-language board game, screen readers benefit significantly from consolidated `aria-label` summaries for visual results (like dice rolls) and explicit `aria-pressed` states for custom button-based selectors (like player count or language).
**Action:** Use a single `role="img"` with a descriptive `aria-label` for complex visual states, and always pair custom button groups with `role="group"` and `aria-labelledby`.
