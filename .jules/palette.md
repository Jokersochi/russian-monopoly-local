## 2026-08-20 - GameLog Tooltips
**Learning:** Adding Tooltip component wrappers requires `TooltipProvider` to be available. Also, ARIA attributes like `aria-label` and `aria-pressed` should be provided on the interactive trigger elements like buttons to properly denote their current active filter state on top of hover interactions for screen readers.
**Action:** Always verify if a `TooltipProvider` exists globally (e.g., in App.tsx) when introducing `Tooltip` components; and add semantic aria properties on filter/toggle buttons along with the custom tooltip components.
