## 2025-05-15 - React Hook Rules and Top-Level Declarations
**Learning:** Always place React Hooks (e.g., `useMemo`, `useCallback`) at the very top level of a component, before any early returns (like `if (!gameState) return null`). Failing to do so violates the `react-hooks/rules-of-hooks` ESLint rule because the order and presence of hooks must be consistent across renders.
**Action:** When adding memoization to components with conditional returns, ensure hooks are declared before those returns to maintain a stable hook execution order.
