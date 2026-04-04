## 2025-05-15 - Keyboard Shortcuts and Accessibility
 **Learning:** Simple keyboard shortcuts (Space/Enter for primary actions, mnemonic keys like 'B' for 'Buy') significantly improve the game's UX by reducing friction and allowing for faster gameplay.
 **Action:** For complex interactive components like game boards or setup screens, always use ARIA roles and labels to provide context for screen readers. Group related buttons with `role="group"` and `aria-labelledby`. Provide summary `aria-label`s for visual multi-part results like dice rolls.
