## 2026-08-20 - [TooltipProvider Scope in Shadcn]
**Learning:** The Shadcn `TooltipProvider` is globally defined in `src/App.tsx`.
**Action:** When adding Tooltips to individual components, ensure to only import and compose `Tooltip`, `TooltipTrigger`, and `TooltipContent`, avoiding adding nested or redundant `TooltipProvider`s which might cause unintended side effects or hydration errors.
