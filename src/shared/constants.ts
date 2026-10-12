export const DEFAULT_URL_CODE = '2602vrn'
export const MIN_URL_CODE_LENGTH = 7
export const DEFAULT_TEAM = 'СПБ'
// Запасной список команд, если бэкенд недоступен
export const DEFAULT_TEAMS = [
  'БАШК', 'ВОЛГ', 'ВОЛО', 'ВРНЖ', 'ДНР', 'КИРВ', 'КЛНД', 'КРДР', 'КРСК', 'КУРС',
  'ЛЕНГ', 'ЛНР', 'МОСК', 'МСК', 'НИЖГ', 'ПЕНЗ', 'ПЕРМ', 'ПРИМ', 'РКАР', 'РОСТ',
  'РЯЗН', 'САРТ', 'СВРД', 'СВСТ', 'СПБ', 'ТАТ', 'ТУЛС', 'УДМ', 'ХБРК', 'ЧЛБН',
]
export const UPDATE_INTERVAL = 120000
export const DEBOUNCE_DELAY = 500
export const FETCH_TIMEOUT = 15000
// Сколько не обращаться к climbnow.ru после того, как он не ответил (см. fetchBackend в services.ts)
export const BACKEND_RETRY_AFTER = 2 * 60 * 1000
// Как в веб-версии: код соревнования и подгруппа подставляются в путь URL источника
export const SAFE_PATH_SEGMENT = /^[\w-]+$/

export const CFR_LIVE_URL = 'https://c-f-r.ru/live/'
// Календарь соревнований ФСР — источник событий, если climbnow.ru недоступен (на бэкенде /api/events парсит его же)
export const EVENTS_SOURCE_URL = 'https://www.rusclimbing.ru/competitions/'
// API продакшена climb-now: уже распарсенные результаты, события, команды. Если он недоступен, результаты и события
// берутся с CFR_LIVE_URL и EVENTS_SOURCE_URL и парсятся в приложении (src/shared/parser/sources.ts) — см. services.ts
export const BACKEND_API_URL = 'https://climbnow.ru/api/'

export const DISCIPLINES = {
  LEAD: 'трудность' as const,
  SPEED: 'скорость' as const,
  // «ЛАЗАНИЕ НА СКОРОСТЬ (К)» — классическая скорость, свои протоколы s_*
  SPEED_CLASSIC: 'скорость (кл)' as const,
  BOULRER: 'боулдеринг' as const,
} as const

export const STATUSES = {
  PENDING: 'pending' as const,
  ONLINE: 'online' as const,
  PASSED: 'passed' as const,
} as const

export const SPECIAL_STATUSES = ['н/я', 'в/к', 'ф/с']
