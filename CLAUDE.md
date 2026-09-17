# CLAUDE.md

Always answer in russian.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Always use Context7 when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

## Project overview

Expo/React Native port of the `climb-now` Next.js web app (see `../climb-now`). Displays live climbing competition results from the Russian Climbing Federation, ported per `plans/migration-plan.md`. That plan documents the architecture decisions (data source, styling, navigation, state, offline caching) and the stage-by-stage migration order this codebase follows — read it before making structural changes.

## Commands

```bash
npm install               # install dependencies
npx expo install --check  # verify all deps match the installed Expo SDK version
npm start                 # expo start — dev server (press i/a/w for iOS/Android/web)
npm run ios               # expo start --ios
npm run android            # expo start --android
npm run web                 # expo start --web
npm run lint                 # expo lint
npm test                      # jest run
npm run test:watch             # jest --watch
npx tsc --noEmit                # typecheck only
npx expo export --platform web   # produce a static web bundle — fastest way to smoke-test that Metro/NativeWind/imports all resolve without a device or emulator
```

Run a single test file: `npx jest src/shared/utils/date.utils.test.ts`.

## Key decisions (see `plans/migration-plan.md` for detail)

- **Data source**: no local parser or backend — the app calls the already-deployed `https://climbnow.ru/api/groups` and `https://climbnow.ru/api/results` (`src/shared/services.ts`). Don't reimplement the HTML scraping/parsing here.
- **Code sharing with `climb-now`**: independent copies, not a monorepo — files under `src/shared/types`, `src/shared/utils`, `src/store` started as hand-copies of the web app's equivalents and now diverge independently.
- **Offline**: `@tanstack/react-query` wrapped in `PersistQueryClientProvider` with `@tanstack/query-async-storage-persister` over `@react-native-async-storage/async-storage` (`src/store/RootStoreProvider.tsx`) — set up from the start, not deferred.
- **Analytics**: none.
- **Footer/CMS content**: none (the web app's Payload CMS was also removed, so there's nothing to integrate with).
- **Styling**: NativeWind (Tailwind class names via `className`) — see `tailwind.config.js`, `metro.config.js`, `src/global.css`.
- **Navigation**: Expo Router (file-based, `src/app/`).

## Architecture

### State: MobX stores + a single shared QueryClient

`src/store/root.store.ts` is a straight port of the web app's `RootStore` singleton — one `QueryClient` plus `formStore`/`disciplinesStore`/`eventsStore`/`teamsStore`. Unlike the web app (which has a second, separate `QueryClient` from a stray `QueryClientProviderWrapper` that its own `useQuery`-based components don't actually share with the MobX stores), this port uses **one** `QueryClient` everywhere — `RootStoreProvider` wraps the app in `PersistQueryClientProvider` around `rootStore.queryClient` directly, so the MobX-driven queries (groups/teams/events) and the per-subgroup `useFetchResults` hook share the same cache and the same offline persistence. Don't reintroduce a second `QueryClient`.

`disciplines.store.ts` and `form.store.ts` diverge from the web versions where they touched `window`/`localStorage`:
- `FormStore.loadFromStorage/saveToStorage` use `@react-native-async-storage/async-storage` (async, unlike the sync `localStorage` calls on web).
- `FormStore.loadFromUrl` reads `names` from `expo-linking`'s `Linking.getInitialURL()` instead of `window.location` (cold-start deep link), and `subscribeToIncomingLinks()` (called from `RootStoreProvider`) handles links received while the app is already open. `code` is deliberately excluded from this — there's no address bar on mobile, so `code` lives only as a `FormStore` field set through the form (`setCode`), never read from or written to a URL/deep link.
- `DisciplinesStore.fetchGroups` dropped the web version's `window.history.replaceState` URL-syncing — there's no address bar to sync to on mobile.

### UI: NativeWind, no direct 1:1 DOM ports

Components under `src/components/` and `src/shared/components/` are RN rewrites of the web app's components, not direct ports — the biggest departures:
- `Autocomplete` closes its dropdown via a `Modal` + `Pressable` backdrop instead of the web version's `document.addEventListener('mousedown', ...)`.
- `Table` renders as nested `View`s in a horizontal `ScrollView` (fixed-width columns via `getTableConfig`) instead of an HTML `<table>`.
- Icons use `@expo/vector-icons/FontAwesome6` instead of `@fortawesome/react-fontawesome`.
- The web app's `LazyLoader` (`IntersectionObserver`-based lazy mount) was dropped per the migration plan; the group list in `src/app/index.tsx` currently renders via a plain `ScrollView`/`.map()` rather than a virtualized `FlatList` — fine while a competition has a modest number of groups, but worth revisiting with `FlatList` if that stops being true.
- `react-compiler` is enabled (`app.json` → `experiments.reactCompiler`), which is strict about mutating variables during render and calling `setState` synchronously inside `useEffect`. `tables.utils.ts`'s `getFinalBorderClasses()` and the derived-state pattern in `Autocomplete`/`useFetchResults` exist specifically to satisfy that lint (`npm run lint`) — don't reintroduce a `let` mutated inside a `.map()` in a render body or an effect that just mirrors props/query state into local state.

### Not yet done

- **EAS Build / store release** (plan Этап 7) needs the user's own Expo/Apple/Google developer accounts and credentials — not something to attempt without them.
- **Universal/App Links** (opening `https://climbnow.ru/...` links directly in the app) need `apple-app-site-association` and `assetlinks.json` hosted on the `climb-now` web domain, which needs real Apple/Google team IDs. Only the custom `climbnow://` URL scheme is wired up so far.

## Sibling project

`../climb-now` is the source Next.js web app this is being ported from, and also the live backend this app's API calls hit in production.
