## $(date +%Y-%m-%d) - Accessible Button Groups

**Learning:** When using visually separate grid buttons as mutually exclusive selection options (like Player Count or Language in GameSetup), native screen reader support is lacking. Wrapping them in a `role="group"` with `aria-labelledby`, using `aria-pressed` for state, hiding decorative elements with `aria-hidden`, and exporting the proper types (like `Locale`) for robust typed React components dramatically improves both semantic meaning and type safety without altering the visual design.

**Action:** Always verify that custom "button group" layouts meant to act like radio buttons have the proper ARIA roles and state attributes (`aria-pressed` or `aria-checked`), and ensure any localized icon-only buttons include descriptive `aria-label` properties.
