# ClimbNow Mobile

Мобильное приложение (Expo/React Native) для отображения соревнований с сайта Федерации Скалолазания России — порт веб-версии [climb-now](../climb-now). Использует уже задеплоенный API `https://climbnow.ru/api/*`, своего парсера/бэкенда не имеет.

## Стэк

Expo, Expo Router, React Native, TypeScript, MobX, TanStack Query (с офлайн-персистентностью), NativeWind.

## Установка и запуск

```bash
npm install
npx expo start
```

В выводе будут ссылки на открытие в Expo Go, iOS-симуляторе или Android-эмуляторе.

## Команды

```bash
npm run lint   # expo lint
npm test        # jest
npx tsc --noEmit # проверка типов
```

## Документация проекта

- `CLAUDE.md` — архитектура и принятые решения для дальнейшей разработки.
- `plans/migration-plan.md` — план миграции с веб-версии и его обоснование.
