# 🎲 Русская Монополия

Интерактивная экономическая настольная игра с российскими городами и объектами. Текущая версия — локальная hot-seat партия на 2–6 игроков с расширенной экономикой, сохранением прогресса и адаптивной premium-доской.

## Текущее состояние

Реализовано:

- локальная партия на 2–6 игроков;
- российская тематическая доска из 40 клеток;
- покупка недвижимости и оплата аренды;
- дубли, тюрьма и переход через Старт;
- аукционы;
- дома и отели;
- залог недвижимости;
- сделки между игроками;
- карточки событий и микро-события;
- банкротство и завершение партии;
- автосохранение и save slots в браузере;
- четыре локали: RU / EN / DE / ES;
- адаптивный интерфейс и premium tabletop UI;
- TypeScript, ESLint, production build и CodeQL в CI;
- Docker и Vercel deployment configuration.

Онлайн-комнаты, сервер-авторитетный multiplayer, чат, рейтинг и reconnect identity входят в следующий архитектурный этап и пока не считаются готовыми функциями.

## Локальный запуск

Требования: Node.js 20+ и npm.

```bash
git clone https://github.com/Jokersochi/russian-monopoly-local.git
cd russian-monopoly-local
npm ci
npm run dev
```

Vite dev server настроен на:

```text
http://localhost:8080
```

Если проект запускается через внешний dev-контейнер или прокси, порт может быть проброшен на другой адрес, например `127.0.0.1:3000`.

## Проверки

```bash
npm ci
npm audit --omit=dev --audit-level=high
npx tsc -p tsconfig.app.json --noEmit
npm run lint
npm run build
```

## Docker

```bash
docker compose up --build
```

После запуска контейнера приложение доступно на:

```text
http://localhost:3002
```

## Архитектура

```text
src/
  components/      игровое поле, панели действий, UI
  contexts/        GameContext и LocaleContext
  data/            клетки, карточки, события, локали
  pages/           основные страницы
  types/           доменные TypeScript-типы
  hooks/           переиспользуемые React hooks
  lib/             вспомогательные функции
```

Игровое состояние сейчас находится на клиенте и сохраняется в `localStorage`. Это удобно для локального режима, но для честного онлайн-мультиплеера игровое ядро должно быть перенесено на сервер.

## Следующий этап: Online Core

Приоритетная архитектура:

1. вынести правила и экономику в shared/server game engine;
2. добавить сервер-авторитетные комнаты;
3. использовать постоянный `playerSessionId` вместо `socket.id` как личности игрока;
4. добавить reconnect/restore;
5. реализовать room chat;
6. добавить matchmaking и рейтинг;
7. подключить AI-игроков к тому же серверному engine;
8. хранить профиль, матчи и статистику в БД;
9. добавить E2E-тесты мультиплеерных сценариев.

## UI roadmap

- плавное перемещение фишек между клетками;
- улучшенные анимации кубиков;
- отдельный post-game summary;
- timeline/replay партии;
- звуковая система;
- дополнительные премиальные темы доски;
- оптимизация touch UX для телефонов.

## Технологии

- React 18;
- TypeScript;
- Vite 8;
- Tailwind CSS;
- shadcn/ui + Radix UI;
- TanStack React Query;
- ESLint;
- GitHub Actions + CodeQL;
- Docker + nginx.

## Production

Для production build:

```bash
npm run build
npm run preview
```

Vercel configuration находится в `vercel.json`. Production deploy workflow запускается только из `main` и использует repository secrets для Vercel.
