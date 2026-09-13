
## 2026-08-20 - Accessible Accordion Headers
**Learning:** In expandable card headers (such as `PlayerPanel`), using a non-interactive `<div>` wrapped around content prevents keyboard navigation and lacks screen reader state announcements.
**Action:** Replace `<div>` with semantic `<button type="button">`, adding `aria-expanded={isExpanded}`, `aria-controls`, and `w-full text-left` to preserve layout behavior. Add custom focus styling (like `focus-visible:ring-russia-gold`) to ensure clear visual focus indicators.
