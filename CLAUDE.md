# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # both package-lock.json and bun.lockb exist; README uses pnpm
pnpm run dev          # Vite dev server on http://localhost:8080  (README says 5173 — README is wrong)
pnpm run build        # production build → dist/
pnpm run build:dev    # build in development mode
pnpm run lint         # ESLint flat config (eslint.config.js)
pnpm run preview      # serve the production build
```

No test framework is configured — no `test` script, no runner in deps. Don't hunt for tests.

Docker: `docker-compose up -d` → multi-stage build (Node 20 → Nginx), host port **3002** → container 80.

## Architecture

Single-device React SPA. All game logic runs in-browser; there is no backend and no WebSocket layer (README is aspirational there).

### State: two React Contexts, no Redux/Zustand

- **`src/contexts/GameContext.tsx`** owns the entire `GameState` (players, dice, phase, round, log) and every mutation (`initGame`, `rollDice`, `buyProperty`, `passProperty`, `endTurn`). State auto-persists to `localStorage` under `russianMonopolyState` and auto-restores on mount — any change to `GameState`'s shape must handle stale saved games in existing users' browsers.
- **`src/contexts/LocaleContext.tsx`** provides i18n across `ru | en | de | es` (loaded from `src/data/locales/*.json`) via a namespaced `t('game.title', params)` API. It writes the chosen locale to `localStorage['monopolyLocale']` but does **not** restore it on mount — every session starts in `ru`.

Consume state via `useGame()` / `useLocale()`. Don't add a separate store — extend the context.

### Game phase state machine (partially implemented)

`GamePhase` (`src/types/game.ts`) declares ten values: `setup | rolling | moving | landed | buying | auction | paying-rent | card-draw | jail | game-over`. Only **`rolling ↔ landed`** is actually executed. `auction`, `buying`, `moving`, `paying-rent`, `card-draw`, `jail`, `game-over` are typed but never set. Consequences:

- Chance / Trial / Tax / Go-to-Jail cells currently **no-op**: the player lands, `ActionPanel` shows "End Turn", `endTurn()` advances the player. No card is drawn, no tax deducted, no jailing happens.
- `AuctionState`, `Contract`, and `residenceCity` on `Player` are defined types with no implementation.

When adding any of these mechanics, gate on `phase === ...` and extend the existing enum rather than introducing side-channel flags.

**Turn-ending is split across three methods** — this is the single most non-obvious thing about the current code:
- **Purchasable cell** (`price` defined, unowned, affordable): `buyProperty()` or `passProperty()`; each advances `currentPlayer` and resets `phase='rolling'` itself.
- **Non-purchasable cell** (start, jail-visiting, free-parking, go-to-jail, chance, trial, tax): `ActionPanel` calls `endTurn()`.

If you add tax/chance/jail logic, hook it into the `landed` phase **before** `endTurn()` fires so the side-effect runs.

### Static game data

`src/data/board.ts` is the single source of truth for the 40-cell board, property prices, the 1–6 house rent ladder, chance/trial card decks, and the 6 player tokens. `src/types/game.ts` has matching contracts (`Cell`, `Player`, `ChanceCard`, `MicroEvent`, `Contract`, `AuctionState`). Board math: `position = (position + sum) % 40`.

Constants (in `GameContext.tsx`): `STARTING_MONEY = 15_000_000`, `START_BONUS = 2_000_000`, `maxRounds = 50`.

### Routing and providers

- App-level (`src/App.tsx`): `QueryClientProvider > TooltipProvider > BrowserRouter` with `/` → `Index`, `*` → `NotFound`.
- Page-level (`src/pages/Index.tsx`): `LocaleProvider > GameProvider > GameContent`. Game contexts are page-scoped, not app-scoped.

## Conventions

- **Path alias**: `@/` → `src/` in `vite.config.ts` and both `tsconfig.json` / `tsconfig.app.json`. Use `@/...`, not relative paths.
- **UI components**: shadcn/ui lives in `src/components/ui/` (49 components; see `components.json`). Don't re-implement — add new ones via the shadcn CLI.
- **Tailwind tokens**: `tailwind.config.ts` defines `russia-{red,blue,gold,white}`, `board-{green,dark}`, `gradient-{russian,gold,board}`, `shadow-{strong,board}`, backed by CSS variables in `src/index.css`. Use these, not raw hex.
- **Permissive TypeScript**: both tsconfigs disable strict mode (`strict: false`, `noImplicitAny: false`, `noUnusedLocals: false`, `noUnusedParameters: false`; root adds `strictNullChecks: false`). Existing code relies on this — don't flip strictness as a drive-by.
- **Naming**: components / contexts PascalCase; hook files kebab-case (`use-toast.ts`); data exports UPPER_SNAKE_CASE (`BOARD_CELLS`, `PLAYER_TOKENS`).

## Known stale docs

- `README.md` describes a planned online-multiplayer product (Zustand, WebSocket, Discord, monetization tiers). Treat as roadmap/marketing, not spec. Its dev-server port (5173) is wrong — actual is 8080.
- `GAME_README.md` is a closer feature checklist, but several ticked items (auctions, jail, card effects, game-over) are only partially implemented — see "Game phase state machine" above.
