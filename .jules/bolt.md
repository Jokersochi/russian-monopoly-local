## 2026-08-20 - Pre-flattening translation dictionaries for O(1) lookups
**Learning:** Calling `key.split('.')` and traversing nested translation objects on every `t()` call during React component render loops causes repeated string allocations and dynamic tree traversal overhead across dozens/hundreds of UI elements.
**Action:** Pre-flatten nested JSON translation dictionaries into `Map<string, string>` instances at module load time to convert dynamic key resolution into an $O(1)$ constant-time lookup with zero allocations during renders.
