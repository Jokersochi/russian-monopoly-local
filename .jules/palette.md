## 2026-08-20 - [ARIA Label Dynamic Text Override]
**Learning:** When adding `aria-label` to an element (like `<Button>`) that contains dynamic child text (such as an event count badge), providing a static `aria-label` will completely override and hide the dynamic child content from screen readers, causing a loss of context.
**Action:** Always interpolate the dynamic child data directly into the `aria-label` string (e.g., ``aria-label={`${tooltipText}, ${count} событий`}``) to ensure screen readers announce the full context.
