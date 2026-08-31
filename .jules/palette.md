## 2026-08-20 - Accessible Accordions for Custom Interactive Containers

**Learning:** Custom `div`-based accordion headers lack default keyboard and screen reader accessibility, rendering expandable content hidden or unusable for keyboard-only and assistive technology users.
**Action:** Always add `role="button"`, `tabIndex={0}`, `aria-expanded`, `aria-controls`, custom focus ring styles (`focus-visible:ring-russia-gold`), and an `onKeyDown` handler (intercepting `Enter` and `Space` with `e.preventDefault()`) when creating custom collapsible panels.
