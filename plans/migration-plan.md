# План миграции ClimbNow → ClimbNow Mobile (React Native + Expo)

Источник: `climb-now/climb-now` (Next.js 16 + React 19 + TypeScript + MobX + TanStack Query + Tailwind).
Цель: нативное приложение на Expo/React Native с той же бизнес-логикой (парсинг результатов соревнований, подсветка команды/скалолазов, живое обновление).

## 1. Что переносим один в один, а что нет

Ядро приложения — не UI, а слой данных: парсер HTML турнирной таблицы (`src/shared/parser/parsers.ts`), конфиги колонок (`src/shared/tables.configs.ts`), типы (`src/shared/types/*`) и бизнес-правила в MobX-сторах (`src/store/*`). Это чистый TypeScript без обращений к DOM/`window` (кроме form.store и disciplines.store, см. п.3) — переносится почти без изменений.

UI переносится **не 1:1**, а по смыслу: HTML-таблицы, Tailwind-классы, `<input>/<button>`, IntersectionObserver, DOMPurify, FontAwesome-web, Next.js Script/Image — всё это веб-специфика, у которой нет прямого аналога в RN и которую нужно заменить нативными примитивами.

Payload CMS в climb-now больше нет (ветка с ним удалена из веб-проекта) — упоминания Payload/CMS-контента ниже сохранены только как история решения 2.7, актуальной интеграции не подразумевают. Веб-версия остаётся живой и работающей отдельно; мобильное приложение ходит в её API (см. п.2).

## 2. Ключевые архитектурные решения

### 2.1 Откуда мобильное приложение берёт данные результатов

Сейчас `/api/groups` и `/api/results` на Next.js — это прокси-парсер: сервер сам ходит на `http://c-f-r.ru/live/...`, парсит HTML через `parse5` и отдаёт JSON. Причины прокси на вебе: CORS и то, что сайт c-f-r.ru отдаётся по HTTP (mixed content в браузере).

В RN эти причины не действуют так же жёстко (CORS в нативном `fetch` не применяется), но HTTP-домен всё равно потребует явных исключений ATS на iOS (`NSExceptionDomains` в Info.plist) и cleartext-исключения на Android (`usesCleartextTraffic` / network security config) именно для `c-f-r.ru`.

**Решение: не дублировать парсер в мобильном приложении.** Мобильное приложение ходит в уже задеплоенный продакшен climb-now — `https://climbnow.ru/api/groups` и `https://climbnow.ru/api/results` (HTTPS, никаких ATS-исключений не нужно). Логика парсинга остаётся в одном месте (веб-репозитории) — при изменении вёрстки c-f-r.ru её правят один раз, а не в двух проектах. Свой бэкенд для мобильного не заводим.

### 2.2 Стилизация

Tailwind-классы (`className="..."`) не работают в RN. Варианты: NativeWind (Tailwind-синтаксис поверх RN, минимальные изменения JSX) или чистый `StyleSheet`. **Рекомендация — NativeWind**: в проекте очень много готовых Tailwind-классов (Table, GroupCard, ResultsForm и т.д.), NativeWind позволяет перенести большую часть разметки почти дословно вместо переписывания каждого компонента на `StyleSheet.create`.

### 2.3 Навигация

Next.js App Router → **Expo Router** (file-based routing, тот же ментальный подход: `app/(frontend)` → `app/index.tsx` и т.д.). Даёт deep linking из коробки, что нужно для замены текущей логики `?code=...&names=...` в URL (см. 2.5).

### 2.4 Состояние: MobX + TanStack Query — переносим как есть

`RootStore`, `FormStore`, `DisciplinesStore`, `EventsStore`, `TeamsStore` — чистая логика, обе библиотеки (`mobx`, `mobx-react`/`mobx-react-lite`, `@tanstack/react-query`) полностью поддерживают RN. Переносятся с точечными правками:

- `window.location` / `window.history` (в `FormStore.loadFromUrl`, `DisciplinesStore.fetchGroups`) → `expo-router` (`useLocalSearchParams`, `router.setParams`) или `Linking.getInitialURL`.
- `localStorage` (в `FormStore.loadFromStorage/saveToStorage`) → `@react-native-async-storage/async-storage` (методы асинхронные — `loadFromStorage` перестаёт быть синхронным вызовом в конструкторе, нужно дождаться промиса перед первым рендером, например через MobX `runInAction` после `await`).

**Офлайн-режим (решено — нужен в MVP):** `QueryClient` оборачивается в `PersistQueryClientProvider` (`@tanstack/react-query-persist-client`) с персистером `@tanstack/query-async-storage-persister` поверх того же `@react-native-async-storage/async-storage`, что и `FormStore`. Кэш последних загруженных групп/результатов переживает перезапуск приложения и показывается сразу (stale, затем идёт revalidate), что также даёт базовый offline-first UX без отдельного бэкенда. Настраивается на этапе 2 вместе с `AsyncStorage`, а не откладывается на post-MVP.

### 2.5 Шеринг ссылок и deep linking

`ShareNamesBtn` сейчас копирует URL с `?names=...` в буфер обмена (веб-механизм "поделиться ссылкой"). В приложении: `expo-clipboard` для копирования + системный `Share.share()` (RN `Share` API) для нативного шаринга, и `expo-linking`/deep link scheme (`climbnow://`) + Universal/App Links на `climbnow.ru`, чтобы ссылка, отправленная в мессенджер, открывала именно приложение с предзаполненными `names`, если оно установлено.

**Решено: `code` через URL/deep link не передаётся** — в мобильном приложении нет адресной строки, `code` живёт только как поле `FormStore` (устанавливается вводом в форме), не читается из входящих ссылок и не кладётся в исходящие ссылки шаринга. Deep link/шеринг несёт только `names`.

### 2.6 Аналитика

Яндекс.Метрика веб-тег (`next/script`) не работает в RN. **Решено: аналитика в MVP не нужна.** AppMetrica или другой SDK не подключаем; вопрос закрыт, не переносится в бэклог как открытый.

### 2.7 Footer / CMS-контент

Payload CMS в climb-now удалён, редактируемого через CMS футера в вебе больше нет. **Решено: в MVP футер/CMS-контент в мобильном приложении не нужен** — экран "о приложении" и футер не делаем.

## 3. Маппинг зависимостей

| Web (climb-now) | Mobile (climb-now-mobile) | Комментарий |
|---|---|---|
| `next` (routing, SSR) | `expo-router` | file-based routing |
| `react`, `react-dom` | `react`, `react-native` | |
| `tailwindcss` | `nativewind` + `tailwindcss` (для конфигов классов) | см. 2.2 |
| `axios` | `axios` | без изменений, работает в RN |
| `mobx`, `mobx-react`(`-lite`) | те же | без изменений |
| `@tanstack/react-query` | тот же + `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` | офлайн-кэш поверх `AsyncStorage`, см. 2.4 |
| `parse5` (сервер) | не нужен на клиенте | парсинг остаётся на веб-бэкенде (см. 2.1) |
| `@fortawesome/react-fontawesome` + `free-solid-svg-icons` | `@fortawesome/react-native-fontawesome` + те же icon-паки, либо `@expo/vector-icons` | решить на этапе UI-компонентов |
| `dompurify` | не нужен | санитайз строк — простой `trim`/regex на вход, без risk innerHTML |
| `next/image` | `expo-image` | |
| `localStorage` | `@react-native-async-storage/async-storage` | асинхронный API |
| `window.location`/`history` | `expo-router` params / `expo-linking` | |
| `IntersectionObserver` (`LazyLoader`) | не нужен либо `onViewableItemsChanged` у `FlatList`/`FlashList` | RN-списки виртуализируются сами |
| Yandex.Metrika web tag | не переносится | аналитика в MVP не нужна (решено) |
| `vitest` | `jest` + `jest-expo` (дефолт Expo) либо оставить vitest, если совместимо с RN-пресетом | проверить на этапе настройки тестов |

## 4. Структура нового проекта (предложение)

```
climb-now-mobile/
  app/                      # expo-router: экраны
    index.tsx                # главный экран: форма + список групп
    _layout.tsx
  src/
    shared/
      parser/                 # НЕ переносим парсер — только типы результатов (см. 2.1)
      types/                  # копия/шаринг типов Discipline, Group, Subgroup, Results...
      constants.ts
      utils/                  # date.utils, forms.utils — переносятся почти без изменений
      hooks/useDebounce.ts     # переносится как есть (чистый хук на таймерах)
      services.ts              # fetch к climbnow.ru/api/* и cfr-search.vercel.app
    store/                    # RootStore, FormStore, DisciplinesStore, EventsStore, TeamsStore
    components/
      forms/                  # ResultsForm → RN TextInput/Picker-based аналог
      groups/                 # GroupCard, DisciplineTabs, StatusIcon
      tables/                 # Table → FlatList-based таблица, BoulderCell, RefreshTableBtn
  plans/                     # (этот файл и последующие планы — см. CLAUDE-память проекта)
```

**Решено: независимые копии кода, без monorepo.** `shared/types` и утилиты (`date.utils`, `forms.utils`, `constants`) копируются вручную в `climb-now-mobile`, отдельный npm/pnpm workspace с `climb-now` не заводим. При расхождении типов с веб-API синхронизируют копии вручную — это приемлемо при текущем объёме кода (несколько файлов типов и утилит).

## 5. Этапы миграции

### Этап 0 — подготовка
- Поднять Expo-проект (`create-expo-app`, TypeScript template, Expo Router template).
- Настроить алиасы импортов, аналогичные `@/*` в `tsconfig.json` веб-проекта.
- Подключить NativeWind, ESLint (`eslint-config-expo` вместо `eslint-config-next`), тестовый раннер.

### Этап 1 — данные и типы (без UI)
- Скопировать `src/shared/types/{disciplines,groups,events,status,index}.ts` — переносятся без изменений.
- Скопировать `src/shared/constants.ts`, `src/shared/utils/date.utils.ts`, `src/shared/utils/forms.utils.ts`, `src/shared/hooks/useDebounce.ts` — переносятся без изменений (проверить тесты `*.test.ts`, они должны пройти на Jest так же, как на Vitest).
- Написать `services.ts` для мобильного: `fetchResults` → `https://climbnow.ru/api/groups`, аналог `useFetchResults` → `https://climbnow.ru/api/results`; `fetchTeams`/`fetchEvents`/`patchEvent` — тот же `cfr-search.vercel.app`, копируются почти как есть.

### Этап 2 — состояние
- Перенести `RootStore`, `DisciplinesStore`, `EventsStore`, `TeamsStore` без изменений в бизнес-логике.
- Переписать `FormStore`: `localStorage` → `AsyncStorage` (асинхронная инициализация), `window.location`/`history` → `expo-router`/`expo-linking`.
- Настроить `PersistQueryClientProvider` + `createAsyncStoragePersister` для `QueryClient` (см. 2.4) — офлайн-кэш последних результатов на `AsyncStorage`.

### Этап 3 — базовые UI-компоненты
- `TextInput`, `Autocomplete` (перестроить без `document.addEventListener('mousedown', ...)` — в RN это через `Modal`/`Pressable` с оверлеем для закрытия по тапу вне), `StatusIcon`, `BoulderCell`, `RefreshTableBtn`.
- Иконки FontAwesome → RN-пакет или `@expo/vector-icons`.

### Этап 4 — экраны
- Главный экран: `ResultsForm` (поля кода/команды/чекбоксы) + список `GroupCard`.
- `GroupCard`: раскрывающийся блок с табами подгрупп (`DisciplineTabs`/табы статусов) — на RN как `Pressable` + локальный state, разметка на NativeWind.
- `Table` → главный компонент для переосмысления: HTML `<table>` с произвольным числом колонок на группу становится либо горизонтально скроллящейся сеткой (`ScrollView horizontal` + строки `View` с фиксированной шириной колонок), либо `FlatList` с рендером строки как `View` из ячеек. Обычный `FlatList` не умеет "таблицу" нативно — нужно вручную выравнивать ширины колонок (например, через `getTableConfig` + фиксированные `width` в стилях, аналогично текущему `w-4` для служебных колонок).
- `LazyLoader` (IntersectionObserver) — вероятно, не нужен: `FlatList`/`FlashList` уже виртуализируют офскрин-контент. Если групп много и внутри каждой — тяжёлая таблица, использовать `FlatList` на уровне списка групп с `windowSize`/`initialNumToRender`, а не переносить IntersectionObserver-паттерн дословно.

### Этап 5 — платформенные штуки
- Deep linking (`climbnow://`, Universal/App Links) для ссылок с `code`/`names` (см. 2.5).
- Share — `Share.share()` + `expo-clipboard`.
- ATS/cleartext — не потребуется, следуем решению 2.1 (только HTTPS-запросы к `climbnow.ru`).
- Push/аналитика — не делаем в MVP (см. 2.6).

### Этап 6 — тесты
- Перенести `parsers.test.ts` НЕ нужно (парсер не переезжает), но `date.utils.test.ts`, `forms.utils.test.ts`, `tables.utils.test.ts` — переносятся, если соответствующий код (`tables.utils.ts`, форматирование дат, utils) тоже переезжает. Прогнать на `jest-expo` вместо vitest, поправить импорты `vitest` → `@jest/globals`/дефолтные глобалы Jest.

### Этап 7 — сборка и релиз
- Настроить EAS Build (iOS/Android), `app.json`/`app.config.ts` (иконки, splash, deep link scheme, bundle id).
- Тестовые сборки через EAS internal distribution / TestFlight.
- Публикация в App Store / Google Play (готовятся отдельно: скриншоты, описание, политика конфиденциальности — учитывая, что часть контента — персональные имена скалолазов из открытых протоколов соревнований).

## 6. Принятые решения (закрывают открытые вопросы)

1. **Монорепо vs независимые копии кода** — независимые копии, без monorepo (см. конец п.4).
2. **Аналитика в MVP** — не нужна.
3. **Офлайн-режим** — нужен: `@tanstack/react-query` с persistence (`@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` поверх `AsyncStorage`), настраивается сразу на этапе 2, не откладывается (см. 2.4).
4. **Футер/CMS-контент в MVP** — не нужен (Payload CMS в самом climb-now удалён, интегрировать уже не с чем), см. 2.7.
