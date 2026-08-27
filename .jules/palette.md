## 2026-08-20 - Icon-Only Filter Buttons
**Learning:** Icon-only filter buttons (like emojis) with native `title` attributes provide poor UI polish and lack accessibility state announcements for screen readers.
**Action:** Replace native `title` attributes with Shadcn `Tooltip` components, and always apply `aria-label` and `aria-pressed` to the button element to ensure proper screen reader announcement and state indication.
