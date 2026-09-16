
## 2026-08-20 - Accordion Headers
**Learning:** Accordion headers wrapped in `<div>` tags with `onClick` handlers fail to provide proper ARIA attributes, keyboard accessibility, and focus states natively, which breaks interaction for screen reader and keyboard users.
**Action:** Always refactor interactive expanding UI triggers into semantic `<button type="button">` tags, manually apply `aria-expanded` and `aria-controls`, and include theme-appropriate custom focus rings (`focus-visible:ring-...`) to ensure reliable focus management and keyboard accessibility.

## 2026-08-20 - Docker Build Script Blocking
**Learning:** `pnpm` versions 10+ strictly enforce `ERR_PNPM_IGNORED_BUILDS` which blocks CI installation pipelines if any package attempts to run a post-install script without explicit approval in `package.json` (`pnpm.onlyBuiltDependencies`).
**Action:** When migrating or working in environments pulling unconstrained pnpm versions like `npm install -g pnpm`, bypass ignored builds in the `Dockerfile` with the `--ignore-scripts` flag (`pnpm install --frozen-lockfile --ignore-scripts`) to maintain deterministic, secure, and passing CI builds.
