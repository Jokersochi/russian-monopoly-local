## 2026-08-20 - Semantic Accordion Header Accessibility in Player Panels
**Learning:** Using non-interactive `<div>` elements for expandable card headers prevents keyboard focus and screen reader discovery of details sections.
**Action:** Replace clickable `<div>` wrappers with semantic `<button type="button">` controls featuring `aria-expanded`, `aria-controls`, and `focus-visible` ring indicators while preserving block-level layout via `w-full text-left`.
