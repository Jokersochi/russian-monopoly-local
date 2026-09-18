## 2026-08-20 - Ensure .jules directory exists before writing logs
**Learning:** The `.jules` directory does not exist by default in the repository workspace and must be explicitly created before attempting to write or append to any agent journal files like `.jules/palette.md`.
**Action:** Always check for and create the `.jules` directory using `mkdir -p .jules` before executing echo commands to write to journal files.
## 2026-08-20 - Fix Docker CI ERR_PNPM_OUTDATED_LOCKFILE
**Learning:** In CI, Docker builds fail if  specifiers do not precisely match  when using  (e.g., ). Modifying  to match the lockfile is a safer resolution in these CI pipelines to avoid massive dependency bumps.
**Action:** When CI fails on Lockfile is up to date, resolution step is skipped
Already up to date

╭ Warning ─────────────────────────────────────────────────────────────────────╮
│                                                                              │
│   Ignored build scripts: @swc/core@1.15.32, esbuild@0.21.5,                  │
│   esbuild@0.25.12.                                                           │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed     │
│   to run scripts.                                                            │
│                                                                              │
╰──────────────────────────────────────────────────────────────────────────────╯
Done in 1.3s using pnpm v10.30.3 due to mismatched versions, align  versions to match .
## 2026-08-20 - Fix Docker CI ERR_PNPM_OUTDATED_LOCKFILE
**Learning:** In CI, Docker builds fail if package.json specifiers do not precisely match pnpm-lock.yaml when using --frozen-lockfile. Modifying package.json to match the lockfile is a safer resolution in these CI pipelines to avoid massive dependency bumps.
**Action:** When CI fails on pnpm install --frozen-lockfile due to mismatched versions, align package.json versions to match pnpm-lock.yaml.
