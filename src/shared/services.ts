import { Platform } from 'react-native'

import { Discipline, SubGroupData } from '@/shared/types'
import { BACKEND_API_URL, BACKEND_RETRY_AFTER, DEFAULT_TEAMS } from './constants'
import { fetchEventsFromSource, fetchResultsFromSource, fetchResultsTableFromSource } from './parser/sources'
import { getDateRange } from './utils/date.utils'
import { fetchWithTimeout } from './utils/fetch.utils'
import type {
  EventResponse,
  BaseResponseListEvent,
  FetchEventsOperation,
} from './types/api.types'

// climbnow.ru не ответил (нет соединения, таймаут, 5xx) — следующие BACKEND_RETRY_AFTER мс к нему не ходим:
// иначе каждый запрос сначала ждал бы FETCH_TIMEOUT, прежде чем упасть или перейти к источнику
let backendDownUntil = 0

const fetchBackend = async (url: string, init?: RequestInit): Promise<Response> => {
  if (Date.now() < backendDownUntil) {
    throw new Error('climbnow.ru unavailable (skipped)')
  }
  try {
    const response = await fetchWithTimeout(url, init)
    if (response.status >= 500) {
      throw new Error(`climbnow.ru responded with ${response.status}`)
    }
    backendDownUntil = 0
    return response
  } catch (error) {
    backendDownUntil = Date.now() + BACKEND_RETRY_AFTER
    throw error
  }
}

// В веб-сборке браузер не пустит запрос на c-f-r.ru и rusclimbing.ru (CORS), запасной путь только для iOS/Android
const canFetchSources = Platform.OS !== 'web'

/**
 * Запрос к API climbnow.ru. null — бэкенд недоступен, и вызывающий идёт к источнику напрямую
 * (в веб-сборке идти некуда — ошибка пробрасывается). Ответы 4xx штатные (404 при подборе суффикса кода)
 * и возвращаются как есть.
 */
const tryBackend = async (url: string): Promise<Response | null> => {
  try {
    return await fetchBackend(url)
  } catch (error) {
    if (!canFetchSources) throw error
    console.warn('climbnow.ru unavailable:', error)
    return null
  }
}

/**
 * Получает список команд
 */
export const fetchTeams = async (): Promise<string[]> => {
  try {
    const response = await fetchBackend(`${BACKEND_API_URL}teams`)

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
    const response = await tryBackend(`${BACKEND_API_URL}events?${queryString}`)
    if (!response) return await fetchEventsFromSource(startDate, endDate)

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
    const response = await fetchBackend(`${BACKEND_API_URL}events/${eventId}`, {
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
    console.warn('Patch event failed:', error)
    throw error
  }
}

/**
 * Получает результаты (список дисциплин/групп) для указанного кода соревнования
 * с продакшена climb-now, а если он недоступен — напрямую с c-f-r.ru.
 */
export const fetchResults = async (code: string): Promise<Discipline[] | null> => {
  try {
    const response = await tryBackend(`${BACKEND_API_URL}groups?code=${code}`)
    if (!response) return await fetchResultsFromSource(code)
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as Discipline[]
  } catch (error) {
    console.warn('Error fetching results:', error)
    return null
  }
}

/**
 * Получает таблицу результатов конкретной подгруппы с продакшена climb-now, а если он недоступен — напрямую с c-f-r.ru.
 */
export const fetchResultsTable = async (code: string, subgroupLink: string): Promise<SubGroupData> => {
  const response = await tryBackend(`${BACKEND_API_URL}results?code=${code}&subgroup=${subgroupLink}`)
  if (!response) return fetchResultsTableFromSource(code, subgroupLink)
  if (!response.ok) {
    throw new Error(`Failed to fetch results: ${response.status} ${response.statusText}`)
  }
  return response.json()
}
