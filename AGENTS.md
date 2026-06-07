# AGENTS.md

## Cursor Cloud specific instructions

### Product scope

Single-device **Russian Monopoly** React SPA. All game logic runs in-browser; there is no backend, database, or WebSocket layer. End-to-end verification is browser-only.

### Services

| Service | Port | Command |
|---------|------|---------|
| Vite dev server (primary) | **8080** | `pnpm run dev` |
| Vite preview (optional) | 4173 | `pnpm run build && pnpm run preview` |
| Docker/nginx (optional) | **3002** | `docker-compose up -d` |

Only the Vite dev server is required for normal development.

### Standard commands

See `CLAUDE.md` for the canonical command list (`pnpm install`, `pnpm run dev`, `pnpm run lint`, `pnpm run build`). README’s port **5173** is wrong — use **8080**.

### Lint

`pnpm run lint` exits non-zero due to pre-existing ESLint errors in shadcn UI stubs and `GameContext.tsx` (not introduced by env setup). `pnpm run build` is the reliable compile check.

### Tests

No test runner is configured (`package.json` has no `test` script).

### Dev server startup

Run the dev server in a **tmux** session (long-lived process), not as a one-shot background shell:

```bash
SESSION_NAME="vite-dev-server"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null \
  || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "$PWD" -- "${SHELL:-zsh}" -l
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" 'pnpm run dev' C-m
```

Health check: `curl -sf -o /dev/null http://localhost:8080`

### Hello-world / smoke test

1. Open `http://localhost:8080`
2. Click **✨ Начать игру** (start game with default 4 players)
3. Click **🎲 Бросить кубики** — dice totals and board movement should update

Game state persists in `localStorage` key `russianMonopolyState`; clear it or pick an empty save slot if setup behaves unexpectedly.

### pnpm build-script warning

Fresh `pnpm install` may warn that `@swc/core` / `esbuild` build scripts were skipped. Production `pnpm run build` still succeeds in this environment without `pnpm approve-builds`.
