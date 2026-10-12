# ClimbNow Mobile

<img src="assets/images/applogo.png" width="32" height="32" align="absmiddle" alt="ClimbNow"> [ClimbNow в RuStore](https://www.rustore.ru/catalog/app/ru.climbnow.mobile)

Мобильное приложение (Expo/React Native) для Android и iOS: живые результаты соревнований Федерации скалолазания России (c-f-r.ru/live). Это порт веб-версии [climb-now](../climb-now). Приложение берёт данные из уже задеплоенного API `https://climbnow.ru/api/*`. Если climbnow.ru недоступен, результаты запрашиваются напрямую с c-f-r.ru и парсятся в приложении (см. «Источник данных»).

## Возможности

- Выбор соревнования по коду (например, `2602vrn`) из списка событий.
- Дисциплины «трудность», «боулдеринг» и «скорость» (для финала скорости — сетка).
- Все группы и подгруппы выбранной дисциплины на одном экране.
- Подсветка своих: по команде (региону) или по списку фамилий. Фильтр «только команда» скрывает остальных участников.
- Идущие группы обновляются автоматически.
- Офлайн-режим: последние данные кэшируются и показываются без сети, об этом предупреждает баннер.
- Ссылка вида `climbnow://...?names=...` передаёт список фамилий. Код соревнования в ссылку не попадает.

## Источник данных

Основной путь — API веб-версии: `https://climbnow.ru/api/groups` (дисциплины и группы), `/api/results` (таблица подгруппы) и `/api/events` (список соревнований). Сервер сам ходит на c-f-r.ru и в календарь rusclimbing.ru, парсит HTML и кэширует ответы.

Запасной путь (`src/shared/services.ts`): если climbnow.ru не ответил (нет соединения, таймаут) или вернул 5xx, приложение запрашивает `https://c-f-r.ru/live/{code}/index.html` и `/{code}/{subgroup}.html`, а список соревнований — из календаря `https://www.rusclimbing.ru/competitions/` напрямую и разбирает их своей копией парсеров веб-версии (`src/shared/parser/`). Ответ 4xx запасной путь не включает: 404 — штатный ответ при подборе суффикса кода (`_vs`, `_ch`, `_perv`).

Ограничения запасного пути:

- Работает только на iOS и Android. В веб-сборке браузер не пустит запрос на c-f-r.ru и rusclimbing.ru из-за CORS.
- Без бэкенда не работают список команд (подставляется встроенный `DEFAULT_TEAMS`) и сохранение подобранного суффикса кода (`PATCH /api/events/{id}`): суффикс приложение подбирает само при каждом открытии соревнования.
- Если climbnow.ru не ответил (до 15 с), следующие 2 минуты (`BACKEND_RETRY_AFTER`) приложение к нему не обращается и сразу идёт к источникам.
- Парсеры — копии: при изменении вёрстки c-f-r.ru или rusclimbing.ru их правят сначала в `climb-now`, затем переносят сюда вместе с моками и тестами.

Чтобы проверить запасной путь вручную, временно поменяйте `BACKEND_API_URL` в `src/shared/constants.ts` на несуществующий адрес.

## Стек

Expo SDK 57, Expo Router, React Native 0.86, TypeScript, MobX, TanStack Query с офлайн-персистентностью (AsyncStorage), NativeWind, React Compiler.

## Установка и запуск

```bash
npm install
npm start          # dev-сервер Expo
npm run android    # нативная сборка и запуск на Android (expo run:android)
npm run ios        # нативная сборка и запуск на iOS (expo run:ios)
npm run web        # запуск в браузере
```

В проекте подключён `expo-dev-client`, поэтому для запуска на устройстве нужна dev-сборка (`npm run android` / `npm run ios` или EAS-профиль `development`), а не Expo Go.

`npm run prebuild` пересоздаёт нативные папки (`expo prebuild --clean`). Плагин `plugins/withNdkVersion.js` при этом закрепляет у всех нативных Android-модулей одну версию NDK, ту же, что требует React Native.

## Проверки

```bash
npm run lint                     # expo lint
npm test                         # jest
npx tsc --noEmit                 # проверка типов
npx expo export --platform web   # быстрая проверка, что бандл собирается
```

## Сборка

Сборки делаются через EAS (`eas.json`): профили `development`, `preview` и `production`. Версия приложения хранится на стороне EAS (`appVersionSource: remote`). Для Android в `production` используются локальные ключи (`credentials.json` и `release.keystore`). Эти файлы в `.gitignore`, в репозиторий они не попадают.

## Документация проекта

- `CLAUDE.md` — архитектура и принятые решения.
- `PRODUCT.md` — о продукте: пользователи, назначение, сценарии.
- `DESIGN.md` — дизайн-система: цвета, таблицы, компоненты.
