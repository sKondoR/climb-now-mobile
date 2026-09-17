import { Discipline, SubGroupData } from '@/shared/types'
import { BACKEND_API_URL, WEB_API_URL } from './constants'
import { getDateRange } from './utils/date.utils'
import type {
  EventResponse,
  BaseResponseListEvent,
  BaseResponse,
  FetchEventsOperation,
} from './types/api.types'

// Кэш для списка команд
let teamsCache: string[] | null = null
let teamsCacheTime: number | null = null
const CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 часа
const TEAMS_CACHE_DURATION = CACHE_DURATION * 30
let eventsCache: EventResponse[] | null = null
let eventsCacheTime: number | null = null
const EVENTS_CACHE_DURATION = CACHE_DURATION * 3

/**
 * Получает список команд
 */
export const fetchTeams = async (): Promise<string[]> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(`${BACKEND_API_URL}teams`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    teamsCache = data.teams
    teamsCacheTime = Date.now()
    return data.teams
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('fetchTeams timed out, using cached value if available')
      if (teamsCache && teamsCacheTime && Date.now() - teamsCacheTime < TEAMS_CACHE_DURATION) {
        return teamsCache
      }
    } else {
      console.error('Error fetching teams:', error)
    }
    throw error
  }
}

/**
 * Получает список событий за указанный период
 */
export const fetchEvents = async (): Promise<EventResponse[]> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  try {
    const [startDate, endDate] = getDateRange()

    const params: FetchEventsOperation['parameters']['query'] = {
      start: startDate,
      end: endDate,
    }

    const queryString = new URLSearchParams(params as Record<string, string>).toString()
    const response = await fetch(`${BACKEND_API_URL}events?${queryString}`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }

    const data: BaseResponseListEvent = await response.json()

    eventsCache = data.data || []
    eventsCacheTime = Date.now()

    return eventsCache
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('fetchEvents timed out, using cached value if available')
      if (eventsCache && eventsCacheTime && Date.now() - eventsCacheTime < EVENTS_CACHE_DURATION) {
        return eventsCache
      }
    } else {
      console.error('Error fetching events:', error)
    }
    throw error
  }
}

/**
 * Изменяет code события на новый.
 * eventId передаётся вызывающей стороной (а не ищется здесь через rootStore.eventsStore) —
 * иначе получился бы require cycle между services.ts и store/root.store.ts.
 */
export const patchEvent = async (eventId: number, newCode: string): Promise<EventResponse> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ link: newCode }),
    })

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }

    const data: EventResponse = await response.json()
    return data
  } catch (error) {
    console.error('Patch event failed:', error)
    throw error
  }
}

/**
 * Проверяет здоровье API
 */
export const healthCheck = async (): Promise<BaseResponse> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}health`)

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }

    const data: BaseResponse = await response.json()
    return data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

/**
 * Получает результаты (список дисциплин/групп) для указанного кода соревнования
 * с уже задеплоенного продакшена climb-now (см. plans/migration-plan.md, п.2.1) —
 * мобильное приложение не парсит HTML c-f-r.ru само.
 */
export const fetchResults = async (code: string): Promise<Discipline[] | null> => {
  let lastError: Error | null = null

  try {
    const response = await fetch(`${WEB_API_URL}groups?code=${code}`)

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data as Discipline[]
  } catch (error) {
    lastError = error as Error
    console.error('Error fetching results:', error)
  }

  if (lastError) {
    if (lastError.name === 'AbortError') {
      console.error('Fetch request timed out for code:', code)
    } else if (lastError.name === 'TypeError' && lastError.message.includes('fetch failed')) {
      console.error('Network error occurred for code:', code, lastError.message)
    }
  }
  return null
}

/**
 * Получает таблицу результатов конкретной подгруппы с продакшена climb-now.
 */
export const fetchResultsTable = async (code: string, subgroupLink: string): Promise<SubGroupData> => {
  const response = await fetch(`${WEB_API_URL}results?code=${code}&subgroup=${subgroupLink}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch results: ${response.statusText}`)
  }
  return response.json()
}
