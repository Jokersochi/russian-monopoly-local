## 2026-08-20 - Ensure .jules directory exists before writing logs
**Learning:** The `.jules` directory does not exist by default in the repository workspace and must be explicitly created before attempting to write or append to any agent journal files like `.jules/palette.md`.
**Action:** Always check for and create the `.jules` directory using `mkdir -p .jules` before executing echo commands to write to journal files.
