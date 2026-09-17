export const DEFAULT_URL_CODE = '2602vrn'
export const MIN_URL_CODE_LENGTH = 7
export const DEFAULT_TEAM = 'СПБ'
export const UPDATE_INTERVAL = 120000
export const DEBOUNCE_DELAY = 500

// Продакшен climb-now отдаёт уже распарсенные результаты — свой парсер/бэкенд в мобильном приложении не нужен (см. plans/migration-plan.md, п.2.1).
export const WEB_API_URL = 'https://climbnow.ru/api/'
export const BACKEND_API_URL = 'https://cfr-search.vercel.app/api/'
// Только для ссылки "открыть на сайте федерации" (LinkToEvent) — не используется для получения/парсинга данных.
export const EXTERNAL_EVENT_BASE_URL = 'http://c-f-r.ru/live/'

export const DISCIPLINES = {
  LEAD: 'трудность' as const,
  SPEED: 'скорость' as const,
  BOULRER: 'боулдеринг' as const,
} as const

export const STATUSES = {
  PENDING: 'pending' as const,
  ONLINE: 'online' as const,
  PASSED: 'passed' as const,
} as const

export const SPECIAL_STATUSES = ['н/я', 'в/к']
