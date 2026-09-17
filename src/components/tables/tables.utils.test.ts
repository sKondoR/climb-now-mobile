import { describe, it, expect } from '@jest/globals'
import {
  isCommandMatch,
  isNameMatch,
  getTableConfig,
  getRowClasses,
  getFinalPlaces,
  getClimbedCount,
} from './tables.utils'
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

    it('should return leadQualConfig when neither isLead nor isBoulder is true', () => {
      const config = getTableConfig({ isLead: false, isBoulder: false, isQualResult: false, isFinal: false })
      expect(config).toBeDefined()
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

    it('should return bg-blue-200 when isSameCommandRow is true', () => {
      const classes = getRowClasses({
        ...baseProps,
        result: { ...mockLeadQualItem, command: 'СПБ' },
        isNamesFilterEnabled: false
      })
      expect(classes).toBe(' bg-blue-200')
    })

    it('should return bg-blue-200 when isSameNameRow is true', () => {
      const classes = getRowClasses({
        ...baseProps,
        isNamesFilterEnabled: true
      })
      expect(classes).toBe(' bg-blue-200')
    })

    it('should return bg-green-200 when isHighlighted is true', () => {
      const props = {
        ...baseProps,
        isNamesFilterEnabled: false,
        command: 'ВРЖ',
        names: '',
        result: { ...mockLeadQualItem, isHighlighted: true },
      }
      const classes = getRowClasses(props)
      expect(classes).toBe(' bg-green-200')
    })

    it('should return bg-green-200 when isFinalRow is true', () => {
      const props = {
        ...baseProps,
        isNamesFilterEnabled: false,
        command: 'ВРЖ',
        names: '',
        result: { ...mockLeadQualItem, rank: '1', name: 'Катя Иванова' },
        isFinal: true,
      }
      const classes = getRowClasses(props)
      expect(classes).toBe(' bg-green-200')
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
