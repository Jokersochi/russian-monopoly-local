# MONOPOLY LUXE — MASTER SPECIFICATION / PRODUCTION
Версия: 1.0; дата: 2026-11-15. Статус: целевая спецификация, а не свидетельство production-готовности.

## 1. Продукт и обязательные ограничения
Цель: premium браузерная экономическая игра с 40-клеточным полем, режимами LOCAL/PRIVATE ONLINE/AI, долговременными партиями, надежным reconnect и безопасной серверной экономикой. MVP бесплатный, без реальных ставок/криптовалют/игровых платежей.

Сценарии: быстрое начало локальной игры 2–6, частная комната по коду 2–6, приглашение друзей, управление ходом, покупка/аренда/аукцион/торговля, завершение партии, запись результата, восстановление после разрыва сети, настройки графики, обучение.

Не затрагивать текущие локальные save slots без совместимой миграции. Не публиковать непроверенные бренды/логотипы. Не выдавать онлайн-alpha за готовый многопользовательский продукт.

## 2. Фактическая исходная база
Jokersochi/russian-monopoly-local: React 18 + Vite 8 + TypeScript + Tailwind/shadcn; текущая локальная игра из 40 клеток, 2–6 человек, покупка, аренда, дубли, тюрьма, карты, аукционы, дома/отели, залог, сделки, банкротство, локальные сохранения, RU/EN/DE/ES.
В отдельной рабочей копии MAX UI создана геометрия 14×8 для 40 клеток строго по периметру, премиальный интерфейс/Framer Motion. 13×8 вмещает лишь 38 клеток по периметру.
Фактический статус нового online-модуля см. IMPLEMENTATION_STATUS_RU.md.

## 3. Игровой движок (P0/P1, blocker)
- Один канонический каталог BOARD_CELLS с ID 0–39, version, полями type/color/price/rent/houses.
- Pure reducer: validate command -> deterministic transition -> event -> persistence transaction -> broadcast.
- Сервер генерирует кубики и карты через crypto-secure RNG, клиент не передает результат.
- Фазы: lobby/ready/rolling/moving/landed/buying/auction/card/trade/jail/debt/end/finished.
- Дубли/тройной дубль, бонус за Старт, аренда с монополиями и постройками, залоги, trade, debt, auction, карты, разорение — полная parity с локальным GameContext.
- Ход-операция содержит expectedVersion, requestId/turnId/idempotencyKey; повторные запросы не списывают деньги.
- Инварианты: одному активу один владелец; денежный баланс корректен; недопустимые ставки/торговля не меняют состояние; обработка банкротства не уничтожает активы вопреки правилам.
- Для экономики — property-based, replay и сценарные тесты по 40 клеткам. Целевое покрытие критичных переходов >=80%.

## 4. Мировые компании и интеллектуальные противники
- Отдельный BOARD_PACK "Global Companies" на 40 клеток. Покупаемые компании идут по кругу от самых доступных к самым дорогим (цены — баланс игровой экономики, не текущая рыночная капитализация).
- Поля компании: stable ID, name, sector, price, rent vector, color tier, metadata, rights/license, locale aliases.
- Логотипы и товарные знаки: подтвердить разрешения/правовое основание до коммерческого релиза.
- Бот EASY: валидные случайные действия + резерв денег; MEDIUM: EV аренды, аукционы, сделки; HARD: ограниченный MCTS/Monte-Carlo без знания колоды/секретов.
- Все боты должны пользоваться тем же серверным API и набором правил. 10k матчей с seed в nightly проверке.

## 5. Online core, security и realtime (P1/P2, blocker)
- Node.js поддерживаемого LTS + WebSocket, аутентификация игрока стабильной session identity, не socket.id.
- Комнаты: hostId, код, 2–6 игроков, ready, start, leave, forfeit, spectators optional, reconnect и ownership session.
- Session token >=256-bit entropy, hash in storage, expiry/revocation, rotation; no tokens in logs/snapshots.
- Проверка Origin/TLS, лимиты команд и чата, размер пакетов, schema validation, запрет посылать playerId от клиента.
- Команды с версионированием, ACK и идемпотентностью, ретраи и reconnect с authoritative snapshot + event delta.
- Обязательны серверный таймер ходов, дедлайн аукциона и автоматические таймауты с корректными правилами.
- Продакшен-операции атомарны в Postgres с optimistic concurrency и append-only match_events; Redis pub/sub или совместимый adapter для нескольких экземпляров.
- Бэкап с PITR/планом восстановления (целевые RPO <=15 min, RTO <=2 h), проверка restore.
- При нарушении ledger-инварианта остановить запись и сигнализировать, не пытаться 'починить' состояние на клиенте.
- Сервер in-memory или file-based допустим только для online-alpha/dev; он НЕ удовлетворяет production reliability.

## 6. Данные/схема
User(id,display_name), Identity(id,hash,expires), Room(code,host,createdAt,version), Member(room,user,seat), Match(id,room,boardVersion,state,version), MatchEvent(matchId,seq,actor,kind,payload), Auction, Trade, ChatMessage(room,user,text,createdAt), Rating, Ban/Report, AuditLog.
Уникальность (matchId,seq), (roomId,seat); транзакционная фиксация state+event; outbox для доставки. Миграции вперед, обратимость и совместимые версии во время rollback.

## 7. MAX UI / Framer Motion (P0/P2)
Визуальная система: темное дерево + латунь + зеленое сукно + стеклянные панели с низким blur. Прямоугольное поле 14×8/40 клеток, читаемость названий, подсветка владельца, здания и статус залога.
Motion: бросок кубиков, фишки с промежуточными шагами, ход/покупка/аукцион/продажа, staggered transitions, spring не меняет gameState.
UI компоненты: Board, Tokens, Dice, CardDetail, ActionPanel, Auction, Trade, Players, Chat, GameLog, Timer, Tutorial, Postgame, ReconnectOverlay, Settings.
Платформы: desktop widescreen, laptop, tablet landscape, mobile portrait fallback scroll+zoom.
Доступность: WCAG AA, управление клавиатурой, focus-trap в модалках, Escape, aria-live, hit targets >=44px, prefers-reduced-motion, контраст текста, не полагаться только на цвет.
Производительность (целевые): LCP p75 <=2.5s, INP <=200ms, CLS <=0.1, 60fps на поддерживаемых устройствах; подтверждать замерами RUM и тестами.

## 8. Игровая аналитика и UX
- События: view, tutorial-start/finish, create/join, first-roll, buy, auction-start/end, trade, reconnect, game-finish, disconnect/error.
- Приватность: исключить raw tokens, переписки и PII из аналитики без правового основания; версия event-schema.
- Обучение за 3–5 мин и контекстные подсказки, повтор партии, postgame stats, звуки с mute и настройкой громкости.
- Целевые продуктовые метрики: TTFR, completion rate, crash-free, reconnect success, количество десинхронизаций, retention D1/D7, match duration.

## 9. CI/CD, environments и инфраструктура
- DEV: быстрый локальный запуск web+server, тестовый catalog, no secrets.
- STAGING: независимые Postgres+Redis, 2 браузера, синтетические аккаунты, TLS/WSS, smoke+load.
- PROD: isolated DB, secrets manager, immutable releases, CDN, TLS, rate limiting, CSP/CORS, rollback.
- Node 24 LTS минимум, перейти на 26 после совместимости. npm package-lock единый, npm ci. CI: TypeScript, eslint, Vitest coverage, API/WebSocket integration, Playwright 2-user E2E, audit prod high+, CodeQL, secret scanning, build.
- Deploy только после успешного CI + staging + одобрения prod; branch protection, permissions минимальны, actions закрепить.
- /health/live и /health/ready, OpenTelemetry, Sentry-compatible alerts, логирование без секретов, метрики ошибок/действий/длительности/DB.
- SLO (цель): 99.9% API availability, 99% обычных reconnect <=10s; нагрузочные испытания >=2000 web sockets/500 rooms до обещаний клиентам.
- Canary, crash recovery drill, restore drill, feature flags и kill switch для онлайн-режима.

## 10. Юридические, контентные и бизнес требования
Уникальный бренд/иконография, аудит прав на название игры и изображения/логотипы компаний, политика конфиденциальности, условия игры, возрастные ограничения, региональный комплаенс.
Игровые '₽' — очки/виртуальная валюта, никаких ставок или выводов. Платежи и платные подписки только отдельным этапом после security/legal и подтверждения экономики.

## 11. Gate checklist и definition of done
G0: Node supported, npm deterministic install, CI green, нет high/critical production CVE, корректный deploy config, security reporting, локальные сейвы сохранены.
G1: pure core state machine + invariants + tests >=80% engine transitions, deterministic replay, versioned schema, no duplicate charges.
G2: полноценная parity LOCAL/ONLINE (auction, trade, houses, mortgage, bankruptcy, chance), session reconnect, persistence Postgres, timers, chat moderation, rate limits.
G3: responsive premium UI, audit 4 размеров экрана, клавиатура, screen-reader, reduced motion, four locale checks.
G4: CI + 2 браузера E2E + load+fault injection + backups/restore + monitoring, staging release, security/code review.
G5: права/лицензии, legal docs, release tag, canary, automatic rollback thresholds, 24h наблюдение.

## 12. Приоритеты реализации
P0 — инфраструктурные блокеры и сохранение MAX UI; [обязательная база].
P1 — online-alpha: серверные комнаты, safe sessions, базовая экономика, чат, reconnect, базовая persistence, маршрут /online; [не prod].
P2 — parity online, серверный таймер, полностью транзакционная БД, Redis, аккаунты/модерация, real-company board pack и боты.
P3 — UX QA, security review, load test, observability, backup restore, legal, stage canary, production approval.
P4 — рейтинги, турниры, сезонный контент, мета-прогресс, косметическая монетизация без pay-to-win.

Каждый пункт закрывается только доказательствами (тест, запись сценария, CI run и метрики), не словами. Изменения не выкатывать на main до прохождения ворот. Все незавершенное фиксировать в docs/IMPLEMENTATION_STATUS_RU.md.

## 13. Release runbook
Подготовка: commit SHA, миграции, бэкап, staging тест, права контента, TTL секретов.
Deploy: stage -> smoke 2 clients -> canary -> production; передача трафика только после зелёных health/latency/desync.
Rollback: на предыдущую совместимую версию и DB schema, при подозрении на нарушение инварианта остановить прием критичных команд и сохранить event log для расследования.
Post-release: мониторинг 24h, отчёт о p95 action latency и reconnect, проверка restore, журнал изменений.
