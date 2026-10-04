# ClimbNow Mobile

<img src="assets/images/applogo.png" width="32" height="32" align="absmiddle" alt="ClimbNow"> [ClimbNow в RuStore](https://www.rustore.ru/catalog/app/ru.climbnow.mobile)

Мобильное приложение (Expo/React Native) для Android и iOS: живые результаты соревнований Федерации скалолазания России (c-f-r.ru/live). Это порт веб-версии [climb-now](../climb-now). Приложение берёт данные из уже задеплоенного API `https://climbnow.ru/api/*`, собственного парсера и бэкенда у него нет.

## Возможности

- Выбор соревнования по коду (например, `2602vrn`) из списка событий.
- Дисциплины «трудность», «боулдеринг» и «скорость» (для финала скорости — сетка).
- Все группы и подгруппы выбранной дисциплины на одном экране.
- Подсветка своих: по команде (региону) или по списку фамилий. Фильтр «только команда» скрывает остальных участников.
- Идущие группы обновляются автоматически.
- Офлайн-режим: последние данные кэшируются и показываются без сети, об этом предупреждает баннер.
- Ссылка вида `climbnow://...?names=...` передаёт список фамилий. Код соревнования в ссылку не попадает.

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
- `plans/migration-plan.md` — план миграции с веб-версии и его обоснование.
