import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

import { mockHtmlEnglishIndex, mockHtmlLeadFinal } from './parser/mocks/mockHtml'
import { mockEventsHtml } from './parser/mocks/mockEventsHtml'
import { BACKEND_RETRY_AFTER } from './constants'

const fetchMock = jest.fn<typeof fetch>()
global.fetch = fetchMock

const html = (body: string, status = 200) => new Response(body, { status })
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

const requestedUrls = () => fetchMock.mock.calls.map(([url]) => String(url))

// services хранит в модуле, что climbnow.ru недоступен, — каждый тест берёт свежую копию модуля
let services: typeof import('./services')

beforeEach(() => {
  fetchMock.mockReset()
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    services = require('./services')
  })
})

afterEach(() => {
  jest.useRealTimers()
})

// Окно дат событий считается от текущей даты (getDateRange), а мок календаря — за 2025 год.
// Таймеры не подменяем: fetchWithTimeout держит настоящий setTimeout
const setNow = (date: string | number) => {
  jest.useFakeTimers({ doNotFake: ['setTimeout', 'clearTimeout', 'setImmediate', 'nextTick', 'queueMicrotask'] })
  jest.setSystemTime(new Date(date))
}

describe('fetchResults', () => {
  it('берёт группы с climbnow.ru, не обращаясь к c-f-r.ru', async () => {
    fetchMock.mockResolvedValueOnce(json([{ discipline: 'трудность', groups: [] }]))

    expect(await services.fetchResults('2602vrn')).toEqual([{ discipline: 'трудность', groups: [] }])
    expect(requestedUrls()).toEqual(['https://climbnow.ru/api/groups?code=2602vrn'])
  })

  it('на 404 от climbnow.ru возвращает null без запасного пути', async () => {
    fetchMock.mockResolvedValueOnce(json({ error: 'not found' }, 404))

    expect(await services.fetchResults('2602vrn_vs')).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('если climbnow.ru недоступен, парсит index.html с c-f-r.ru', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce(html(mockHtmlEnglishIndex))

    const result = await services.fetchResults('2602vrn')

    expect(requestedUrls()[1]).toBe('https://c-f-r.ru/live/2602vrn/index.html')
    expect(result?.map((item) => item.discipline)).toContain('трудность')
  })

  it('на 5xx от climbnow.ru тоже идёт на c-f-r.ru', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ error: 'bad gateway' }, 502))
      .mockResolvedValueOnce(html('', 404))

    expect(await services.fetchResults('2602vrn')).toBeNull()
    expect(requestedUrls()[1]).toBe('https://c-f-r.ru/live/2602vrn/index.html')
  })
})

describe('fetchResultsTable', () => {
  it('если climbnow.ru недоступен, парсит протокол с c-f-r.ru', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('Aborted'))
      .mockResolvedValueOnce(html(mockHtmlLeadFinal))

    const result = await services.fetchResultsTable('2602vrn', 'l_f_m')

    expect(requestedUrls()[1]).toBe('https://c-f-r.ru/live/2602vrn/l_f_m.html')
    expect(result.isLead).toBe(true)
    expect(result.data.length).toBeGreaterThan(0)
  })

  it('на 4xx от climbnow.ru бросает ошибку без запасного пути', async () => {
    fetchMock.mockResolvedValueOnce(json({ error: 'bad request' }, 400))

    await expect(services.fetchResultsTable('2602vrn', 'l_f_m')).rejects.toThrow('400')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('в запасном пути не подставляет в URL c-f-r.ru небезопасную подгруппу', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'))

    await expect(services.fetchResultsTable('2602vrn', '../l_f_m')).rejects.toThrow('Invalid path segment')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('недоступный climbnow.ru', () => {
  it('после сбоя следующие запросы сразу идут на c-f-r.ru', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('Aborted'))
      .mockResolvedValueOnce(html(mockHtmlLeadFinal))
      .mockResolvedValueOnce(html(mockHtmlLeadFinal))

    await services.fetchResultsTable('2602vrn', 'l_f_m')
    await services.fetchResultsTable('2602vrn', 'l_q_m')

    expect(requestedUrls()).toEqual([
      'https://climbnow.ru/api/results?code=2602vrn&subgroup=l_f_m',
      'https://c-f-r.ru/live/2602vrn/l_f_m.html',
      'https://c-f-r.ru/live/2602vrn/l_q_m.html',
    ])
  })

  it('события берёт из календаря rusclimbing.ru', async () => {
    setNow('2025-06-01')
    fetchMock
      .mockRejectedValueOnce(new Error('Aborted'))
      .mockResolvedValueOnce(html(mockEventsHtml))

    const events = await services.fetchEvents()

    expect(requestedUrls()[1]).toMatch(/^https:\/\/www\.rusclimbing\.ru\/competitions\/\?start=/)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0]).toMatchObject({ link: expect.any(String), id: expect.any(Number) })
  })

  it('id события из календаря совпадает с id из /api/events (FNV-1a от кода)', async () => {
    setNow('2025-06-01')
    fetchMock
      .mockRejectedValueOnce(new Error('Aborted'))
      .mockResolvedValueOnce(html(mockEventsHtml))

    const [event] = await services.fetchEvents()

    expect(event).toMatchObject({ link: '2501vrn', id: 247370715 })
  })

  it('через BACKEND_RETRY_AFTER снова пробует climbnow.ru', async () => {
    setNow(0)
    fetchMock
      .mockRejectedValueOnce(new Error('Aborted'))
      .mockResolvedValueOnce(html(mockEventsHtml))
      .mockResolvedValueOnce(html(mockEventsHtml))
      .mockResolvedValueOnce(json({ data: [] }))

    await services.fetchEvents()
    await services.fetchEvents()
    setNow(BACKEND_RETRY_AFTER)

    expect(await services.fetchEvents()).toEqual([])
    expect(requestedUrls().filter((url) => url.startsWith('https://climbnow.ru'))).toHaveLength(2)
  })
})
