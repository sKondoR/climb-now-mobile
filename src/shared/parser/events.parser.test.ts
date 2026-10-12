import { describe, it, expect } from '@jest/globals'

import { parseEvents, parseDateRange, extractYear } from './events.parser'
import { mockEventsHtml } from './mocks/mockEventsHtml'

describe('events parser', () => {
  describe('parseEvents', () => {
    it('parses event fields without field labels', () => {
      expect(parseEvents(mockEventsHtml)[0]).toStrictEqual({
        date: '05  - 12 января',
        year: '2025',
        rank: null,
        startdate: '2025-01-05',
        enddate: '2025-01-12',
        link: '2501vrn',
        name: 'Рождественский турнир',
        location: 'Воронеж',
        type: 'С',
        groups: ['Ю', 'С', 'М', 'П'],
        disciplines: ['Т', 'Эт', 'Б'],
      })
    })

    it('skips cancelled events and non-event links', () => {
      expect(parseEvents(mockEventsHtml).map(event => event.link)).toStrictEqual(['2501vrn', '2511kem_perv'])
    })

    it('returns an empty list for a page without events', () => {
      expect(parseEvents('<html><body><h1>Календарь</h1></body></html>')).toStrictEqual([])
    })
  })

  describe('parseDateRange', () => {
    it('parses a range within one month', () => {
      expect(parseDateRange('05  - 12 января', '2025')).toStrictEqual(['2025-01-05', '2025-01-12'])
    })

    it('parses a range across months', () => {
      expect(parseDateRange('24 ноября - 01 декабря', '2025')).toStrictEqual(['2025-11-24', '2025-12-01'])
    })

    it('parses a single date', () => {
      expect(parseDateRange('25 мая', '2026')).toStrictEqual(['2026-05-25', '2026-05-25'])
    })

    it('returns nulls for unknown formats or missing year', () => {
      expect(parseDateRange('весной', '2026')).toStrictEqual([null, null])
      expect(parseDateRange('05  - 12 января', '')).toStrictEqual([null, null])
    })
  })

  describe('extractYear', () => {
    it('takes the year from the first two digits of the code', () => {
      expect(extractYear('2602vrn_vs')).toBe('2026')
      expect(extractYear('msk')).toBe('')
    })
  })
})
