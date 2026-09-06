## 2026-08-20 - Accessible Icon-Only Filter Buttons with Tooltips
**Learning:** Icon-only or emoji filter buttons in control bars lack native clarity for screen readers and touch/mouse users if relying solely on native `title` attributes or unannounced icons.
**Action:** Replace native `title` attributes with Shadcn `Tooltip` components (using `asChild` on `TooltipTrigger`) and add explicit `aria-label` and `aria-pressed` attributes to custom `<Button>` toggles.
