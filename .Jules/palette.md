## 2024-05-14 - Improve accessibility for icon-only buttons in GameSetup
**Learning:** Icon-only buttons used for locale selection must be grouped properly and have ARIA labels clearly communicating the choice, instead of relying solely on the visual flag icon or omitting proper labeling.
**Action:** Added `aria-label` attribute with the language name to each locale button, and grouped them using `role="group"` with an associated `aria-labelledby`.
