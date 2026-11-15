# Monopoly Luxe — MAX UI + Online Alpha

Рабочая ветка `feature/prod-foundation-2026` поверх `Jokersochi/russian-monopoly-local`.

## Изменения
- Прямоугольная 14×8 доска с 40 клетками по периметру, древесиной и золотым оформлением.
- Framer Motion: движение фишек, бросок кубиков, анимированные состояния.
- Существующий LOCAL 2–6 игроков, экономика и localStorage сохранения не заменены.
- Дополнительный маршрут `/online`: приватные комнаты, 2–6 игроков, готовность, старт, бросок, покупка, аренда, basic jail/tax/chance, чат и reconnect.
- Серверное RNG, валидация действий, токен сессии 256 бит, хеш токена в локальной серверной базе, защита от повторных запросов, Origin + лимиты.
- Online Alpha хранит данные в JSON snapshots. Для production необходимы Postgres/Redis, parity правил, нагрузка, бэкапы, security review.

## Локальный запуск
```powershell
npm ci
npm run dev:online
```
В другом терминале:
```powershell
npm run dev
```

Web: http://127.0.0.1:8080 ; online: http://127.0.0.1:8080/online ; websocket: ws://127.0.0.1:8789/ws

## Проверки
```powershell
npm run verify:all
npm run test:coverage
node --test server/tests/online-protocol.test.mjs
npm audit --omit=dev --audit-level=high
```

См. docs/PRODUCTION_MASTER_SPEC_RU.md и docs/IMPLEMENTATION_STATUS_RU.md.
