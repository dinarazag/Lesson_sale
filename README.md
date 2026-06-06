# Lesson Sale (фронтенд)

Веб-приложение на React + Vite. Данные сейчас хранятся в браузере (`localStorage`) — удобно для разработки и демо; для продакшена с общей базой позже подключают бэкенд.

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте адрес из терминала (обычно http://localhost:5173).

## Сборка

```bash
npm run build
```

Готовые файлы появятся в папке `dist/`.

## Размещение на сервере

Подробная инструкция: **[DEPLOY.md](./DEPLOY.md)**.

**Быстрый старт (Docker):**

```bash
cp .env.example .env
docker compose up -d --build
```

Сайт: http://localhost:8080 (порт меняется в `.env` → `APP_PORT`).

## Структура деплоя

| Файл | Назначение |
|------|------------|
| `Dockerfile` | Сборка и образ с nginx |
| `docker-compose.yml` | Запуск одной командой |
| `deploy/nginx.conf` | Настройка nginx внутри Docker |
| `deploy/nginx-vps.conf.example` | Пример для VPS без Docker |
| `.env.example` | Шаблон переменных |

## Дальнейшее развитие

- Заменить реализацию в `src/api/base44Client.js` на запросы к вашему API (`/api/...`).
- Бэкенд и база данных — отдельный сервис на том же или другом сервере.
