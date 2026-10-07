import { describe, it, expect } from '@jest/globals'
import {
  isCommandMatch,
  isNameMatch,
  getTableConfig,
  withRouteColumns,
  getRowClasses,
  getFinalPlaces,
  getClimbedCount,
  filterOwnHeats,
} from './tables.utils'
import { speedQualConfig } from '@/shared/tables.configs'
import { LeadQualItem } from '@/shared/types'

// Mock data for testing
const mockLeadQualItem: LeadQualItem = {
  rank: '1',
  stRank: '1',
  name: 'Витя Петров',
  command: 'МСК',
  score: '100'
}

describe('tables.utils', () => {
  describe('isCommandMatch', () => {
    it('should return true when commands match (case insensitive)', () => {
      expect(isCommandMatch('СПБ', 'СПБ')).toBe(true)
      expect(isCommandMatch('спб', 'СПБ')).toBe(true)
      expect(isCommandMatch('СПБ', 'спб')).toBe(true)
    })

    it('should return false when commands do not match', () => {
      expect(isCommandMatch('СПБ', 'МСК')).toBe(false)
      expect(isCommandMatch('СПБ', '')).toBe(false)
    })
  })

  describe('isNameMatch', () => {
    it('should return true when name contains any of the search terms', () => {
      expect(isNameMatch('Витя Петров', 'Петров, Иванов, Федоров')).toBe(true)
      expect(isNameMatch('Витя Петров', 'Петров,Иванов,Федоров')).toBe(true)
      expect(isNameMatch('Витя Петров', 'петров,иванов,федоров')).toBe(true)
      expect(isNameMatch('Витя Петров', 'витя петров')).toBe(true)
      expect(isNameMatch('Витя Петров', 'витя петров,')).toBe(true)
    })

    it('should return false when name does not contain any search terms', () => {
      expect(isNameMatch('Витя Петров', 'Иванов')).toBe(false)
    })

    it('should not match every name when the list has a trailing comma', () => {
      expect(isNameMatch('Витя Сидоров', 'Петров, Иванов,')).toBe(false)
    })

    it('should handle multiple spaces correctly', () => {
      expect(isNameMatch('Витя Петров', 'витя  петров')).toBe(true)
    })
  })

  describe('getTableConfig', () => {
    it('should return leadFinalConfig when isLead and isFinal are true', () => {
      const config = getTableConfig({ isLead: true, isBoulder: false, isQualResult: false, isFinal: true })
      expect(config).toBeDefined()
    })

    it('should return leadQualResultsConfig when isLead is true and isQualResult is true', () => {
      const config = getTableConfig({ isLead: true, isBoulder: false, isQualResult: true, isFinal: false })
      expect(config).toBeDefined()
    })

    it('should return leadQualConfig when isLead is true and isQualResult is false', () => {
      const config = getTableConfig({ isLead: true, isBoulder: false, isQualResult: false, isFinal: false })
      expect(config).toBeDefined()
    })

    it('should return boulderFinalConfig when isBoulder is true and isFinal is true', () => {
      const config = getTableConfig({ isLead: false, isBoulder: true, isQualResult: false, isFinal: true })
      expect(config).toBeDefined()
    })

    it('should return boulderQualConfig when isBoulder is true and isFinal is false', () => {
      const config = getTableConfig({ isLead: false, isBoulder: true, isQualResult: false, isFinal: false })
      expect(config).toBeDefined()
    })

    it('should return speedQualConfig for speed qualification', () => {
      const config = getTableConfig({ isLead: false, isBoulder: false, isSpeed: true, isQualResult: false, isFinal: false })
      expect(config).toBe(speedQualConfig)
    })

    it('should return leadQualConfig when neither isLead nor isBoulder is true', () => {
      const config = getTableConfig({ isLead: false, isBoulder: false, isQualResult: false, isFinal: false })
      expect(config).toBeDefined()
    })
  })

  describe('filterOwnHeats', () => {
    const item = (name: string, command: string, heat: number) =>
      ({ rank: '', name, command, score: '05,000', round: '1/8 финала', heat })
    const results = [item('А', 'СПБ', 0), item('Б', 'МСК', 0), item('В', 'МСК', 1), item('Г', 'ТЮМН', 1)]

    it('keeps whole heats with own climbers, opponents included', () => {
      expect(filterOwnHeats(results, 'спб')).toStrictEqual([results[0], results[1]])
    })

    it('returns nothing when there are no own climbers', () => {
      expect(filterOwnHeats(results, 'КРСК')).toStrictEqual([])
    })
  })

  describe('getFinalPlaces', () => {
    it('should return standard when mathPlaces >= standard', () => {
      expect(getFinalPlaces(100, 10)).toBe(10)
      expect(getFinalPlaces(20, 10)).toBe(10)
      expect(getFinalPlaces(15, 10)).toBe(10)
      expect(getFinalPlaces(14, 10)).toBe(10)
      expect(getFinalPlaces(13, 10)).toBe(10)
    })

    it('should return standard - 2 when mathPlaces >= standard - 2', () => {
      expect(getFinalPlaces(12, 10)).toBe(8)
      expect(getFinalPlaces(11, 10)).toBe(8)
      expect(getFinalPlaces(10, 10)).toBe(8)
    })

    it('should return standard - 4 when mathPlaces >= standard - 4', () => {
      
      expect(getFinalPlaces(9, 10)).toBe(6)
      expect(getFinalPlaces(8, 10)).toBe(6)
      expect(getFinalPlaces(7, 10)).toBe(6)
    })

    it('should return standard - 6 when mathPlaces < standard - 4', () => {
      expect(getFinalPlaces(6, 10)).toBe(4)
      expect(getFinalPlaces(5, 10)).toBe(4)
    })

    it('should handle edge cases', () => {
      expect(getFinalPlaces(4, 10)).toBe(4)
    })
  })

  describe('getRowClasses', () => {
    const baseProps = {
      result: mockLeadQualItem,
      isFinal: false,
      command: 'СПБ',
      names: 'Витя Петров',
      isNamesFilterEnabled: false
    }

    it('should return bg-highlight when isSameCommandRow is true', () => {
      const classes = getRowClasses({
        ...baseProps,
        result: { ...mockLeadQualItem, command: 'СПБ' },
        isNamesFilterEnabled: false
      })
      expect(classes).toBe(' bg-highlight')
    })

    it('should return bg-highlight when isSameNameRow is true', () => {
      const classes = getRowClasses({
        ...baseProps,
        isNamesFilterEnabled: true
      })
      expect(classes).toBe(' bg-highlight')
    })

    it('should return bg-live-soft when isHighlighted is true', () => {
      const props = {
        ...baseProps,
        isNamesFilterEnabled: false,
        command: 'ВРЖ',
        names: '',
        result: { ...mockLeadQualItem, isHighlighted: true },
      }
      const classes = getRowClasses(props)
      expect(classes).toBe(' bg-live-soft')
    })

    it('should return bg-live-soft when isFinalRow is true', () => {
      const props = {
        ...baseProps,
        isNamesFilterEnabled: false,
        command: 'ВРЖ',
        names: '',
        result: { ...mockLeadQualItem, rank: '1', name: 'Катя Иванова' },
        isFinal: true,
      }
      const classes = getRowClasses(props)
      expect(classes).toBe(' bg-live-soft')
    })

    it('should return empty string when no conditions match', () => {
      const classes = getRowClasses(baseProps)
      expect(classes).toBe('')
    })
  })

  describe('getClimbedCount', () => {
    const mockResults = [
      { rank: '1', stRank: '1', name: 'Витя Петров', command: 'СПБ', score: '100' },
      { rank: '', stRank: '', name: 'Галя Иванова', command: 'МСК', score: '' },
      { rank: '2', stRank: '2', name: 'Федя Павлов', command: 'МУР', score: '95' }
    ]

    it('should count climbers for lead discipline', () => {
      const count = getClimbedCount({ results: mockResults, isLead: true, isBoulder: false })
      expect(count).toBe(2)
    })

    it('should count climbers for boulder discipline', () => {
      const count = getClimbedCount({ results: mockResults, isLead: false, isBoulder: true })
      expect(count).toBe(2)
    })

    it('should return total length when neither lead nor boulder', () => {
      const count = getClimbedCount({ results: mockResults, isLead: false, isBoulder: false })
      expect(count).toBe(3)
    })
  })
})

describe('withRouteColumns', () => {
  const names = (config: { name?: string }[]) => config.map((col) => col.name)

  it('should add route columns beyond the config for unofficial boulder qualification', () => {
    const config = getTableConfig({ isLead: false, isBoulder: true, isQualResult: false, isFinal: false })
    const result = { rank: '1', stRank: '1', name: 'A', command: 'B', ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`r${i + 1}`, '1/1'])), score: '249,7' }
    expect(names(withRouteColumns(config, result))).toEqual(['место', undefined, 'ст.#', 'имя', 'команда', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'результат'])
  })

  it('should keep only routes present in the protocol for boulder final', () => {
    const config = getTableConfig({ isLead: false, isBoulder: true, isQualResult: false, isFinal: true })
    const result = { rank: '1', stRank: '1', name: 'A', command: 'B', qRank: '1', r1: '1/1', r2: '1/1', r3: '1/1', score: '1' }
    expect(names(withRouteColumns(config, result))).toEqual(['место', undefined, 'ст.#', 'имя', 'команда', 'квал', '1', '2', '3', 'результат'])
  })
})
