## 2026-08-20 - Pre-flattening Nested Translation JSON Objects
**Learning:** Pre-flattening nested translation JSON objects into Map<string, string> instances at module load time converts dynamic `key.split('.')` string splitting and object tree traversals into $O(1)$ constant-time lookups with zero allocations during component render loops.
**Action:** For localized applications with frequent `t()` translation calls during re-renders, pre-process translation files into flat Map structures at module evaluation.
