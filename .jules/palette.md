## 2026-10-17 - Accessible Accordion Headers
**Learning:** When creating custom interactive wrappers containing rich text, using a semantic button with aria-expanded is better than adding aria-label, which overrides all child text content for screen readers.
**Action:** Always use <button type="button"> with aria-expanded and aria-controls for accordion headers instead of interactive divs.
