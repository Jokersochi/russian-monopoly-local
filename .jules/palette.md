## 2026-04-14 - Accessibility for Icon-only and Emoji UI Elements

**Learning:** In a multi-language application, icon-only buttons (like flag emojis for language selection) are ambiguous for both sighted and screen-reader users if they lack text labels. Using the target locale's native name in both a `Tooltip` (for visual guidance) and an `aria-label` (for accessibility) ensures that users can always find their language regardless of the current application state. Additionally, dynamic emoji-based tokens (like player icons) must have `role="img"` and a descriptive `aria-label` to be meaningful to assistive technologies.

**Action:** Always wrap icon-only buttons in a `Tooltip` component and provide an `aria-label`. For language selectors, use the native name of the language. For dynamic emojis, use `role="img"` with an appropriate label.
