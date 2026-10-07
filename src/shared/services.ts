import { Discipline, SubGroupData } from '@/shared/types'
import { BACKEND_API_URL, DEFAULT_TEAMS, FETCH_TIMEOUT, WEB_API_URL } from './constants'
import { getDateRange } from './utils/date.utils'
import type {
  EventResponse,
  BaseResponseListEvent,
  BaseResponse,
  FetchEventsOperation,
} from './types/api.types'

/**
 * fetch с таймаутом: если соединение повисло (например, домен режется DPI),
 * запрос падает с ошибкой вместо вечной загрузки.
 */
const fetchWithTimeout = async (url: string, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Получает список команд
 */
export const fetchTeams = async (): Promise<string[]> => {
  try {
    const response = await fetchWithTimeout(`${BACKEND_API_URL}teams`)

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.teams
  } catch (error) {
    // Не бросаем ошибку, чтобы react-query не повторял запрос: берём запасной список
    console.warn('fetchTeams failed, using DEFAULT_TEAMS:', error)
    return DEFAULT_TEAMS
  }
}

/**
 * Получает список событий за указанный период
 */
export const fetchEvents = async (): Promise<EventResponse[]> => {
  try {
    const [startDate, endDate] = getDateRange()

    const params: FetchEventsOperation['parameters']['query'] = {
      start: startDate,
      end: endDate,
    }

    const queryString = new URLSearchParams(params as Record<string, string>).toString()
    const response = await fetchWithTimeout(`${BACKEND_API_URL}events?${queryString}`)

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }

    const data: BaseResponseListEvent = await response.json()
    return data.data || []
  } catch (error) {
    console.warn('Error fetching events:', error)
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
    const response = await fetchWithTimeout(`${BACKEND_API_URL}events/${eventId}`, {
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
    const response = await fetchWithTimeout(`${BACKEND_API_URL}health`)

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
    const response = await fetchWithTimeout(`${WEB_API_URL}groups?code=${code}`)

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data as Discipline[]
  } catch (error) {
    lastError = error as Error
    console.warn('Error fetching results:', error)
  }

  if (lastError) {
    if (lastError.name === 'AbortError') {
      console.warn('Fetch request timed out for code:', code)
    } else if (lastError.name === 'TypeError' && lastError.message.includes('fetch failed')) {
      console.warn('Network error occurred for code:', code, lastError.message)
    }
  }
  return null
}

/**
 * Получает таблицу результатов конкретной подгруппы с продакшена climb-now.
 */
export const fetchResultsTable = async (code: string, subgroupLink: string): Promise<SubGroupData> => {
  const response = await fetchWithTimeout(`${WEB_API_URL}results?code=${code}&subgroup=${subgroupLink}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch results: ${response.status} ${response.statusText}`)
  }
  return response.json()
}
