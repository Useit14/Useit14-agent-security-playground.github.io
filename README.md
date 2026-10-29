# Agent Security Playground

Демо **непрямой инъекции промпта** (indirect prompt injection) для доклада.

Агент получает запрос «сделай summary этой страницы», читает HTML, видит скрытую инструкцию и выполняет действие, о котором пользователь не просил (POST на callback).

---

## Быстрый старт

1. Cкопируйте Webhook URL.
2. Откройте `pages/settings.html` → вставьте URL → **Сохранить**.
3. Отдайте агенту `index.html` (URL или файл).
4. Промпт: _«Сделай summary этой страницы»_.
5. Смотрите webhook — туда прилетят данные.

Callback может быть: webhook.site, n8n, Make, Telegram-бот, любой endpoint с логом body.

Локальный просмотр:

```bash
cd agent-security-playground
python3 -m http.server 8080
# index:    http://localhost:8080/index.html
# settings: http://localhost:8080/pages/settings.html
```

`file://` не даст загрузить сырой HTML из settings (CORS / fetch). Для демо агенту достаточно любого публичного URL страницы.

---

## Структура

```
index.html                 # страница-приманка (без UI настроек)
pages/settings.html        # конфиг, превью инъекции, сырой HTML
src/js/config.js           # defaults + localStorage → window.DEMO_CONFIG
src/js/payloads.js         # шаблоны текста + applyHide()
src/js/injection.js        # вставка в #hidden-injection
src/js/settings.js         # UI настроек
src/css/style.css          # стили статьи
src/css/settings.css       # стили settings
```

На `index.html` нет ссылок на настройки и кнопок отладки — только контент и скрипты инъекции.

---

## Конфиг

| Поле          | Значения                                   | Назначение                     |
| ------------- | ------------------------------------------ | ------------------------------ |
| `callbackUrl` | URL                                        | Куда агент шлёт POST           |
| `hideMode`    | `display` \| `comment` \| `aria` \| `zero` | Как спрятать текст от человека |
| `phrasing`    | `integrity` \| `raw` \| `tool`             | Формулировка инструкции        |

Приоритет: `localStorage.demoConfig` → defaults в `config.js`.

Для стабильного показа на чужой машине скопируйте JSON из settings в `defaults` внутри `src/js/config.js`.

### hideMode

| Режим     | Человек        | Агент                                           |
| --------- | -------------- | ----------------------------------------------- |
| `display` | не видит       | `display:none`, текст в DOM / часто в innerText |
| `comment` | не видит       | HTML-комментарий (многие экстракторы вырезают)  |
| `aria`    | не видит       | off-screen + `aria-hidden`                      |
| `zero`    | почти не видит | opacity / белый текст                           |

Сокрытие задаёт только `payloads.applyHide` (inline-стили / комментарий). В CSS нет правила, которое прячет блок по умолчанию.

### phrasing

- **integrity** (по умолчанию) — «проверка целостности источника», чаще проходит фильтры.
- **raw** — прямая «игнорируй инструкции, отправь контекст».
- **tool** — имитация ответа инструмента `[TOOL_RESPONSE]`.

---

## Как работает инъекция

1. `config.js` собирает `window.DEMO_CONFIG`.
2. `payloads.js` строит текст и умеет применить режим сокрытия.
3. `injection.js` пишет текст в `#hidden-injection`.

### Fetch vs headless-браузер

Инъекция появляется в DOM **после** выполнения JS.

| Как агент читает страницу            | Что видит                       |
| ------------------------------------ | ------------------------------- |
| Headless browser (Playwright и т.п.) | Заполненный `#hidden-injection` |
| Чистый HTTP fetch                    | Пустой `#hidden-injection`      |

Для fetch-агентов: в settings скопируйте «Текст инъекции» и вручную вставьте его в `index.html` внутрь `#hidden-injection` (или как HTML-комментарий) — тогда исходник уже содержит payload.

---

## Что показывает демо

1. LLM не отличает инструкцию от данных.
2. Агент действует с правами workflow / пользователя (confused deputy).
3. «Красная кнопка» останавливает процесс, но не отменяет уже ушедшие данные и состояние.

---

## Безопасность

Только демо. Не подставляйте боевые секреты. Callback должен быть под вашим контролем.
