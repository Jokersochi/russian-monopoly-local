## 2025-05-14 - [Accessible Dice Rolls and Keyboard Shortcuts]
**Learning:** Screen readers struggle with decorative dot patterns for dice. Using role="img" with a consolidated aria-label and aria-hidden on decorative sub-elements provides a better summary. Keyboard shortcuts (Space/Enter) significantly improve board game flow.
**Action:** Always use role="img" for multi-part visual results and provide localized shortcut hints [{{key}}] for discoverability.
