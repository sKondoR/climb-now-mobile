import { describe, it, expect, jest } from '@jest/globals'

import {
  isDateInRange,
  isDateBefore,
  getCurrentDate,
  getDateRange
} from './date.utils'

describe('date.utils', () => {
  describe('isDateInRange', () => {
    it('should return true when current date is within the range', () => {
      const startDate = '2026-01-01'
      const endDate = '2026-12-31'
      const mockDate = new Date('2026-06-15')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateInRange(startDate, endDate)).toBe(true)
    })

    it('should return false when current date is before the range', () => {
      const startDate = '2026-01-01'
      const endDate = '2026-12-31'
      const mockDate = new Date('2025-12-31')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateInRange(startDate, endDate)).toBe(false)
    })

    it('should return false when current date is after the range', () => {
      const startDate = '2026-01-01'
      const endDate = '2026-12-31'
      const mockDate = new Date('2027-01-01')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateInRange(startDate, endDate)).toBe(false)
    })

    it('should return true when current date equals start date', () => {
      const startDate = '2026-01-01'
      const endDate = '2026-12-31'
      const mockDate = new Date('2026-01-01')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateInRange(startDate, endDate)).toBe(true)
    })

    it('should return true when current date equals end date', () => {
      const startDate = '2026-01-01'
      const endDate = '2026-12-31'
      const mockDate = new Date('2026-12-31')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateInRange(startDate, endDate)).toBe(true)
    })

    it('should handle edge case with very small time difference', () => {
      const startDate = '2026-01-01T00:00:00.000Z'
      const endDate = '2026-01-01T00:00:01.000Z'
      const mockDate = new Date('2026-01-01T00:00:00.500Z')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateInRange(startDate, endDate)).toBe(true)
    })
  })

  describe('isDateBefore', () => {
    it('should return true when current date is after the given date', () => {
      const endDate = '2026-01-01'
      const mockDate = new Date('2026-06-15')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateBefore(endDate)).toBe(true)
    })

    it('should return false when current date is before the given date', () => {
      const endDate = '2026-01-01'
      const mockDate = new Date('2025-12-31')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateBefore(endDate)).toBe(false)
    })

    it('should return true when current date equals the given date', () => {
      const endDate = '2026-01-01'
      const mockDate = new Date('2026-01-01')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateBefore(endDate)).toBe(true)
    })

    it('should handle dates with time component', () => {
      const endDate = '2026-01-01T12:00:00.000Z'
      const mockDate = new Date('2026-01-01T13:00:00.000Z')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      expect(isDateBefore(endDate)).toBe(true)
    })
  })

  describe('getCurrentDate', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const mockDate = new Date('2026-06-15')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      const result = getCurrentDate()
      expect(result).toBe('2026-06-15')
    })

    it('should always return a valid date string', () => {
      const mockDate = new Date('2026-12-31')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      const result = getCurrentDate()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return date in correct format with leading zeros', () => {
      const mockDate = new Date('2026-01-05')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      const result = getCurrentDate()
      expect(result).toBe('2026-01-05')
    })
  })

  describe('getDateRange', () => {
    it('should return a tuple of two date strings', () => {
      const result = getDateRange()
      expect(result).toHaveLength(2)
      expect(result[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return correct range for different months', () => {
      const mockDate = new Date('2026-03-15')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      const result = getDateRange()
      expect(result[0]).toBe('2025-01-01')
      expect(result[1]).toBe('2026-04-15')
    })

    it('should handle leap years correctly', () => {
      const mockDate = new Date('2024-03-15')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      const result = getDateRange()
      expect(result[0]).toBe('2023-01-01')
      expect(result[1]).toBe('2024-04-15')
    })

    it('should handle February correctly in non-leap year', () => {
      const mockDate = new Date('2025-12-31') 
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      const result = getDateRange()
      expect(result[0]).toBe('2025-01-01')
      expect(result[1]).toBe('2026-01-31')
    })

    it('should handle December correctly', () => {
      const mockDate = new Date('2026-12-15')
      jest.useFakeTimers()
      jest.setSystemTime(mockDate)
      const result = getDateRange()
      expect(result[0]).toBe('2026-01-01')
      expect(result[1]).toBe('2027-01-15')
    })
  })
})
