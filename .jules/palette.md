## 2026-10-19 - Expandable Card Accordion Pattern
**Learning:** Non-interactive divs with click handlers for expandable card headers break keyboard focus and screen reader navigation. Converting them to semantic button elements with aria-expanded and aria-controls restores full keyboard accessibility and accessibility tree hierarchy.
**Action:** Always wrap expandable card headers in semantic button elements with aria-expanded and aria-controls attributes.
