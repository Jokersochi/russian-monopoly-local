## 2026-08-20 - Icon-Only Toggle Buttons Tooltips
**Learning:** When implementing icon-only filter or toggle buttons (like emojis), replace native `title` attributes with Shadcn `Tooltip` components for UI polish, and always apply `aria-label` and `aria-pressed` to the button element to ensure proper screen reader announcement and state indication.
**Action:** Always wrap icon-only buttons with Tooltips and explicit ARIA properties instead of using native `title` properties. Ensure not to import TooltipProvider locally if it is already present in App.tsx.
