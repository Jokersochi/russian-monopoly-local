## 2026-10-24 - Input and Toggle Accessibility
**Learning:** Standalone inputs without visible associated labels (like those in GameSetup, ActionPanel, and TradingModal) are inaccessible to screen readers without aria-label, and toggle buttons missing aria-pressed fail to announce their selection state.
**Action:** Always add aria-label to Input components that lack htmlFor labels, and add aria-pressed to buttons functioning as toggles.
