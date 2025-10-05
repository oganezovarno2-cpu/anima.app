# Anima — PWA MVP

Готовый бесплатный веб-приложение (PWA) с офлайн-кэшем, локальным хранением сообщений и базовым UI под твой стиль (нежные розово-лавандовые градиенты).

## Быстрый старт

```bash
npm i
npm run dev
```

Сборка:
```bash
npm run build
npm run preview
```

## Деплой (0$)
- **Vercel** или **Cloudflare Pages** (загрузи весь проект/репозиторий).
- После билда в `dist/` добавь заголовок:
  - Vercel добавляет сам. На Pages укажи корень `dist`.

## PWA
- `public/manifest.webmanifest`
- `public/service-worker.js`
- Иконки лежат в `public/icons/` — замени PNG на свои 192/512.

## ИИ (когда захочешь)
Сейчас внутри демо-бот (без серверов). Для реального ИИ:
- **Вариант A (ноль денег)**: WebLLM/Transformers.js прямо в браузере (локальная модель). Потребуется добавить загрузку модели по CDN и поменять обработчик в `App.tsx`.
- **Вариант B (дешево)**: Cloudflare Workers AI или любой LLM API. Вынеси ключ на сервер (Workers) и из клиента ходи на свой endpoint.

## iOS/Android стора
Чтобы опубликовать в App Store/Google Play, понадобится:
- Apple Developer Program ($99/год), Google Play Console ($25 единовременно)
- Обертка (Capacitor) и прохождение ревью.
Без этого PWA можно **устанавливать на экран** сразу.

— Сгенерировано 2025-10-04


## Как быстро перенести дизайн из Figma
1. Экспортируй главный экран(ы) как PNG/JPG (2–3x), пришли сюда — я подгоню отступы/радиусы 1:1.
2. Скопируй HEX-цвета и шрифты из Figma (Inspect) и вставь в `src/theme.json` и `tailwind.config.js`.
3. Лого как `public/logo.svg`, иконки PWA — заменяй в `public/icons/` (192/512).
4. Всё остальное — правится в `src/ui/App.tsx` (хедер, чат и лендинг).


## Stripe интеграция (MVP, $10/mo)
- В Stripe создай продукт `Anima Pro` с ценой **$10**/month → скопируй `priceId`.
- Эндпоинт `/api/checkout` должен создавать Checkout Session и редиректить на Stripe.
- Укажи `success_url` как `https://YOUR_DOMAIN/#/success?session_id={CHECKOUT_SESSION_ID}`.
  Для MVP мы отмечаем `localStorage.anima-premium = "1"` на странице Success. Для продакшна используй **webhook**.

### Пример для Vercel Functions
`api/checkout.ts`:
```ts
import Stripe from 'stripe'
export default async function handler(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  const { userId } = req.body
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: 'https://YOUR_DOMAIN/#/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://YOUR_DOMAIN/#/cancel',
    metadata: { userId }
  })
  res.status(200).json({ url: session.url })
}
```

### Пример для Cloudflare Workers (опционально)
Создай endpoint `/api/checkout` с той же логикой и прокинь секреты через `wrangler.toml`.


## Ограничение MVP
- Включено: **3 бесплатных диалога**. Счётчик хранится в `localStorage.anima-dialogs`.
- После 3 диалогов показывается Paywall (подписка $10/mo — экран-заглушка; интеграция платежей добавится позже).

## Ответы бота (демо с "человечностью")
- Бот подстраивается под выбранный язык (EN/RU/ES), зеркалит ключевые слова и всегда добавляет честное мнение.
- Это заглушка без сервера. Для реального ИИ подключим WebLLM (офлайн) или API.
