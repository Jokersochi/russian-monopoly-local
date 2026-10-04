## 2026-10-04 - Semantic Accordion Headers
**Learning:** Using non-interactive <div> elements for expandable card headers prevents keyboard focus and screen reader expansion states, while adding aria-label to rich-text buttons overrides child content.
**Action:** Use semantic <button type="button"> elements with aria-expanded and aria-controls, add w-full text-left to preserve block layout, and avoid aria-label if child text is sufficient.
