import { parseFragment, findElementsByTag, hasClass } from './parsers'

import type { Parse5Element, Parse5ChildNode } from './parsers.types'
import type { EventResponse } from '@/shared/types/api.types'

// Копия парсера событий веб-версии (climb-now/src/shared/parser) — запасной путь, когда climbnow.ru недоступен.
// При изменении вёрстки rusclimbing.ru правится в обоих проектах.

export type ParsedEvent = Omit<EventResponse, 'id' | 'created_at' | 'updated_at'>

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
// Отменённые события сайт не убирает, а дописывает в название: «(отменено)», «- ОТМЕНЕН»
const REJECTED_WORDS = ['отмен']

// Собственный текст <p> без вложенного <span> с подписью поля («Даты проведения», «Группы», ...)
const getFieldText = (link: Parse5Element, className: string): string => {
  const field = findElementsByTag(link, 'p').find(p => hasClass(p, className))
  if (!field) return ''
  return field.childNodes
    .map((child: Parse5ChildNode) => child.nodeName === '#text' && 'value' in child ? child.value : '')
    .join('')
    .trim()
}

const splitList = (text: string) => text.split(';').map(item => item.trim()).filter(Boolean)

// Код 2501vrn: год — первые две цифры
export const extractYear = (link: string): string => {
  const match = link.match(/\d{2}/)
  return match ? `20${match[0]}` : ''
}

const toIsoDate = (year: string, month: string, day: string): string | null => {
  const monthIndex = MONTHS.indexOf(month.toLowerCase())
  if (monthIndex === -1) return null
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${day.padStart(2, '0')}`
}

// Форматы сайта: «05  - 12 января», «24 ноября - 01 декабря», «25 мая»
export const parseDateRange = (date: string, year: string): [string | null, string | null] => {
  if (!year) return [null, null]

  const range = date.match(/^(\d{1,2})\s*([а-яё]*)\s*[-—]\s*(\d{1,2})\s*([а-яё]+)$/i)
  if (range) {
    const [, startDay, startMonth, endDay, endMonth] = range
    return [toIsoDate(year, startMonth || endMonth, startDay), toIsoDate(year, endMonth, endDay)]
  }

  const single = date.match(/^(\d{1,2})\s*([а-яё]+)$/i)
  if (single) {
    const isoDate = toIsoDate(year, single[2], single[1])
    return [isoDate, isoDate]
  }

  return [null, null]
}

export const parseEvents = (html: string): ParsedEvent[] => {
  const links = findElementsByTag(parseFragment(html), 'a')
    .filter(a => hasClass(a, 'table__content') && hasClass(a, 'calendar__link'))

  const events: ParsedEvent[] = []
  for (const link of links) {
    const href = link.attrs.find(attr => attr.name === 'href')?.value ?? ''
    const code = href.match(/^\/competitions\/([^/]+)\/$/)?.[1]
    const date = getFieldText(link, 'calendar__date')
    const name = getFieldText(link, 'calendar__name')
    const location = getFieldText(link, 'calendar__location')
    if (!code || !date || !name) continue

    const searchableText = `${name} ${location}`.toLowerCase()
    if (REJECTED_WORDS.some(word => searchableText.includes(word))) continue

    const year = extractYear(code)
    const [startdate, enddate] = parseDateRange(date, year)
    events.push({
      date,
      year,
      rank: null,
      startdate,
      enddate,
      link: code,
      name,
      location,
      type: getFieldText(link, 'calendar__type'),
      groups: splitList(getFieldText(link, 'calendar__group')),
      disciplines: splitList(getFieldText(link, 'calendar__disciplines')),
    })
  }
  return events
}
