import { Discipline, SubGroupData } from '@/shared/types'
import { CFR_LIVE_URL, EVENTS_SOURCE_URL, SAFE_PATH_SEGMENT } from '../constants'
import { fetchWithTimeout } from '../utils/fetch.utils'
import type { EventResponse } from '../types/api.types'
import { parseResults, parseResultsTable } from './parsers'
import { parseEvents } from './events.parser'

// Запасной путь, когда climbnow.ru недоступен: страницы источников (c-f-r.ru, rusclimbing.ru) напрямую.
// Повторяет то, что бэкенд веб-версии делает в /api/groups, /api/results и eventsSource.ts

const fetchSource = async (url: string): Promise<Response> => {
  const response = await fetchWithTimeout(url)
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status} ${response.statusText}`)
  }
  return response
}

// Как в роутах веб-версии: code и subgroup подставляются в путь, поэтому пускаем только [\w-]
const assertSafeSegment = (segment: string) => {
  if (!SAFE_PATH_SEGMENT.test(segment)) {
    throw new Error(`Invalid path segment: ${segment}`)
  }
}

// Копия eventsSource.ts веб-версии: календарь rusclimbing.ru с теми же фильтрами и тем же id события
// (FNV-1a хеш исходного кода), чтобы id совпадали с id из /api/events
const linkToId = (link: string): number => {
  let hash = 0x811c9dc5
  for (let i = 0; i < link.length; i++) {
    hash ^= link.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export const fetchEventsFromSource = async (start: string, end: string): Promise<EventResponse[]> => {
  const params = new URLSearchParams({ start, end })
  const filters = {
    ranks: ['Всероссийские', 'Международные', 'Региональные'],
    types: ['book_competition', 'book_festival'],
    groups: ['adults', 'juniors', 'teenagers', 'younger', 'v10', 'v13', 'v15', 'v19'],
    disciplines: ['bouldering', 'dvoerobye', 'etalon', 'skorost', 'trudnost', 'sv', 'mnogobore'],
  }
  Object.entries(filters).forEach(([key, values]) => values.forEach((value) => params.append(`${key}[]`, value)))

  const response = await fetchSource(`${EVENTS_SOURCE_URL}?${params}`)
  const loadedAt = new Date().toISOString()
  // Как в /api/events: только события, целиком попавшие в окно дат
  return parseEvents(await response.text())
    .filter((event) => event.startdate != null && event.startdate >= start && event.enddate != null && event.enddate <= end)
    .map((event) => ({ ...event, id: linkToId(event.link), created_at: loadedAt, updated_at: loadedAt }))
}

export const fetchResultsFromSource = async (code: string): Promise<Discipline[] | null> => {
  assertSafeSegment(code)
  const response = await fetchSource(`${CFR_LIVE_URL}${code}/index.html`)
  return parseResults(await response.text(), response.headers.get('last-modified') ?? undefined)
}

const fetchCfrTable = async (code: string, subgroupLink: string): Promise<SubGroupData> => {
  const response = await fetchSource(`${CFR_LIVE_URL}${code}/${subgroupLink}.html`)
  return parseResultsTable(await response.text())
}

// Копия withSpeedCommands из /api/results веб-версии.
// В сетке финалов скорости нет команд: берём их из квалификации той же группы (e16_f_m → e_q_m, s8_4f_f10 → s_q_f10).
// В сетке на блоках div имена сокращены («Шепелева С.») — подставляем полные, чтобы работал поиск по фамилиям.
// Без квалификации отдаём сетку как есть
const withSpeedCommands = async (parsed: SubGroupData, code: string, subgroupLink: string): Promise<SubGroupData> => {
  const qualSubgroup = subgroupLink.replace(/^([es])\d+_\d*f_/, '$1_q_')
  if (qualSubgroup === subgroupLink) return parsed
  try {
    const qual = await fetchCfrTable(code, qualSubgroup)
    const climbers = new Map<string, { name: string, command: string } | null>()
    qual.data.forEach(({ name, command }) => {
      climbers.set(name, { name, command })
      const [surname, firstName] = name.split(' ')
      if (!firstName) return
      // Длинные фамилии в сетке идут вовсе без инициала («Могильникова»).
      // Неоднозначное сокращение (однофамильцы) не раскрываем
      for (const short of [`${surname} ${firstName[0]}.`, surname]) {
        climbers.set(short, climbers.has(short) ? null : { name, command })
      }
    })
    return {
      ...parsed,
      data: parsed.data.map((item) => {
        const climber = climbers.get(item.name)
        return climber ? { ...item, ...climber } : { ...item, command: '' }
      }),
    }
  } catch {
    return parsed
  }
}

export const fetchResultsTableFromSource = async (code: string, subgroupLink: string): Promise<SubGroupData> => {
  assertSafeSegment(code)
  assertSafeSegment(subgroupLink)
  const parsed = await fetchCfrTable(code, subgroupLink)
  return parsed.isSpeed && parsed.isFinal ? withSpeedCommands(parsed, code, subgroupLink) : parsed
}
