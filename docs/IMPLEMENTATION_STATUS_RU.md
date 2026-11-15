# Состояние внедрения — Monopoly Luxe
Актуальность: 2026-11-15/16. Версия: online Alpha, НЕ production release.

## Выполнено в ветке feature/prod-foundation-2026
- Сохранён исходный локальный экономический движок/сохранения (не изменяли GameContext).
- MAX UI: 14×8, 40 клеток, dark wood / gold, Framer Motion анимации кубиков и фишек.
- Приведены к единой конфигурации Vite, npm/package-lock, Node 24, Dockerfile, Vercel.
- Добавлен docs/PRODUCTION_MASTER_SPEC_RU.md и не-шаблонный SECURITY.md.
- Реализован ONLINE ALPHA engine с авторитетными серверными dice/картами, 40 клетками из общего каталога, очередностью ходов, покупками/арендой/налогами/дублями/базовой тюрьмой, простыми карточками, банкротством.
- Реализованы частные комнаты, готовность, запуск только ведущим, 2–6 игроков, cryptographic 256-bit session credentials, hash at rest, reconnect, перенос сессии между сокетами, chat, requestId deduplication, Origin validation, payload size cap, basic rate limiting.
- Добавлено атомарное файловое сохранение room state (alpha/dev only), restart restore.
- Реализован веб-маршрут /online с вводом имени и кода, действующими кнопками и логами состояний.
- CI включает typecheck server+web, eslint, unit+coverage, build frontend/backend, серверный протокольный тест.
- Проведен smoke E2E в двух независимых браузерных контекстах: создать/войти/ready/start/roll/buy/chat/reload.
- Production deployment требует ручного workflow_dispatch и environment approval; никакой автоматической публикации этой Alpha нет.

## Важные ограничения и незакрытые production-блокеры
1. LOCAL/ONLINE ещё НЕ обладают полным parity: в online отсутствуют аукционы, торговля, дома/отели, залоги, полные штрафы/карты, выплата долгов, продуманный банкротный процесс.
2. File JSON persistence недостаточна для нескольких серверов, ACID событий и гарантий при обрывах питания. Нужны Postgres+Redis, миграции, optimistic locking и append-only event log.
3. Нет полноценного аккаунта/OAuth, lifecycle токенов/их expiration, серверных turn deadlines, scheduler, сезонного рейтинга и bots.
4. Нет репликации, нагрузочного тестирования, длительного soak-теста, резервных копий с recovery drill, production metrics/alerts.
5. Нет юридической проверки IP прав на бренды/логотипы, публичной privacy policy/terms, moderation pipeline.
6. В локальном движке ранее существовали ESLint hook warnings; не менять логику наугад.
7. Визуальная доска 14×8 имеет 40 клеток, но канонические номера углов 0/10/20/30 не совпадают со всеми физическими углами — нужна отдельная логическая разметка при финальной игровой доске.
8. Offline localStorage saves пока не промигрированы в аккаунт, так задумано.
9. Online server запускать только в тестовой/внутренней среде до DB/identity/security release gates.

## Запуск на JOKER (два терминала)
```powershell
cd monopoly-luxe-max-ui
npm ci
npm run dev:online
```
```powershell
cd monopoly-luxe-max-ui
npm run dev
```
Web: http://localhost:8080/online, backend: ws://127.0.0.1:8789/ws.
Для удалённого production обязательно HTTPS/WSS, ALLOWED_ORIGINS и стойкое persistent DB.

## Проверки
```powershell
npm run typecheck
npm run lint
npm run test:coverage
npm run build
npm run build:online
node --test server/tests/online-protocol.test.mjs
npm audit --omit=dev --audit-level=high
```
Текущая оценка покрытия выбранных проверяемых модулей: 74,79% строк, ядро онлайн — 71,14%; нужны дальнейшие тесты переходов и сценариев.

## Следующие задачи
P1: полная parity правил online, серверные deadline и отказоустойчивый state machine.
P2: Postgres+Redis с миграциями и event ledger, аккаунты и session expiry/revoke.
P2: board-pack мировых компаний от дешевых к дорогим + IP review; боты; accessibility/motion tests.
P3: 2k websocket load/fault tests, observability, restore-drills, penetration/security review, staged canary.
Никакой пункт не считать выполненным без проверенных артефактов и воспроизводимого теста.
