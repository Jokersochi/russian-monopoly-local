## 2026-04-10 - [Lockfile and Artifact Hygiene]
**Learning:** Automated tools like 'pnpm install' or 'pnpm build' generate massive ephemeral files (pnpm-lock.yaml, dist/) that can accidentally be included in patches, violating PR size constraints and hygiene.
**Action:** Always manually verify the file list before submission and explicitly delete auto-generated artifacts (node_modules, dist, lockfiles) if they aren't part of the source of truth.
