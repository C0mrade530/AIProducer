# AIProducer — Deployment Instructions

## Текущий статус деплоя

✅ **Сайт работает:** http://89.23.97.9

### Выполненные изменения

1. ✅ **Мобильная адаптация**
   - Hamburger-меню для sidebar на мобильных (<768px)
   - Responsive артефакты panel в agent-chat
   - Адаптивный dashboard layout
   - Mobile-first padding и spacing

2. ✅ **Настройки Трекера-ментора**
   - UI для включения/выключения мотивации в Telegram
   - UI для включения/выключения "Факт дня из книг"
   - Предупреждение если Telegram не привязан

3. ✅ **Production environment**
   - `.env.production` с правильным APP_URL
   - Docker IPv6 fix
   - Healthcheck настроен

## ⚠️ ТРЕБУЕТСЯ: Применить SQL Migration

После деплоя необходимо применить SQL migration в Supabase:

### Шаг 1: Зайти в Supabase Dashboard
https://supabase.com/dashboard/project/mwtisbekfotdkemehdzy

### Шаг 2: Открыть SQL Editor
Dashboard → SQL Editor → New Query

### Шаг 3: Выполнить миграцию
Скопировать и выполнить SQL из файла:
```
supabase/migrations/001_add_tracker_settings.sql
```

Или напрямую:
```sql
-- Add tracker settings to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tracker_motivation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tracker_daily_fact BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN profiles.tracker_motivation IS 'Enable Telegram motivation messages from Tracker agent';
COMMENT ON COLUMN profiles.tracker_daily_fact IS 'Enable daily fact/quote from business books';
```

### Шаг 4: Проверить
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('tracker_motivation', 'tracker_daily_fact');
```

## Следующие шаги для релиза

### Критические задачи

1. [ ] **Применить SQL migration** (см. выше)

2. [ ] **Проверить работу агентов**
   - Зарегистрироваться на http://89.23.97.9
   - Пройти онбординг
   - Запустить агента "Распаковщик"
   - Проверить что промпты загружаются
   - Проверить стриминг ответов
   - Сохранить артефакт
   - Перейти к следующему агенту
   - Проверить что артефакты передаются в pipeline

3. [ ] **Telegram bot**
   - Создать бота через @BotFather
   - Обновить TELEGRAM_BOT_TOKEN в .env.production на VPS
   - Перезапустить контейнер
   - Проверить привязку Telegram

4. [ ] **Реализовать функционал Трекера-ментора**
   - Обновить промпт AGENT_TRACKER.md:
     - Добавить генерацию мотивационных сообщений
     - Добавить генерацию "Факт дня"
   - Создать cron job / scheduled function для отправки в Telegram
   - Проверить что настройки tracker_motivation и tracker_daily_fact работают

5. [ ] **UX полировка**
   - Добавить loading states где их нет
   - Добавить error states с понятными сообщениями
   - Проверить hover states на всех кнопках
   - Добавить empty states с подсказками

### Некритические улучшения

- [ ] Удалить warning о deprecated `version` в docker-compose.yml
- [ ] Настроить HTTPS через nginx reverse proxy
- [ ] Настроить мониторинг (uptime, errors)
- [ ] Настроить автоматический backup БД

## Быстрый деплой

Для деплоя изменений после commit и push:

```bash
sshpass -p 'i8+ezh+3EgJcd+' ssh root@89.23.97.9 "cd /root/AIProducer && git pull && docker compose build && docker compose up -d"
```

Для быстрого рестарта без rebuild:

```bash
sshpass -p 'i8+ezh+3EgJcd+' ssh root@89.23.97.9 "cd /root/AIProducer && git pull && docker compose restart"
```

## Проверка статуса

```bash
sshpass -p 'i8+ezh+3EgJcd+' ssh root@89.23.97.9 "docker ps && docker logs aiproducer --tail 20"
```

## Архитектура

- **Frontend:** Next.js 16 (App Router, React 19, Tailwind v4)
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL + RLS)
- **AI:** CometAPI (Claude Opus 4.6, Sonnet 4.6)
- **Hosting:** Docker на VPS 89.23.97.9
- **Port:** 80 (HTTP)

## Переменные окружения

Все критические переменные находятся в `.env.production` на VPS:
- Supabase (auth, database)
- CometAPI (AI models)
- Resend (email)
- Telegram Bot
- YooKassa (payments)
