import { describe, it, expect, jest } from '@jest/globals'
import * as Clipboard from 'expo-clipboard'
import { copyToClipboard, getShareUrl, sanitizeEventCode } from './forms.utils'

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(async () => true),
}))

describe('sanitizeEventCode', () => {
  it('should return null when input is null', () => {
    expect(sanitizeEventCode(null)).toBeNull()
  })

  it('should return null when input is empty string', () => {
    expect(sanitizeEventCode('')).toBeNull()
  })

  it('should return the same string for valid alphanumeric characters', () => {
    expect(sanitizeEventCode('ABC123')).toBe('ABC123')
  })

  it('should allow hyphens and underscores', () => {
    expect(sanitizeEventCode('ABC-123_DEF')).toBe('ABC-123_DEF')
  })

  it('should remove invalid special characters', () => {
    expect(sanitizeEventCode('ABC@123#')).toBeNull()
  })

  it('should return null when sanitization removes all characters', () => {
    expect(sanitizeEventCode('@#$%')).toBeNull()
  })

  it('should return null when sanitized value differs from original', () => {
    expect(sanitizeEventCode('ABC!123')).toBeNull()
  })

  it('should handle strings with whitespace', () => {
    expect(sanitizeEventCode('test code')).toBeNull()
  })
})

describe('getShareUrl', () => {
  it('should create a URL with a names parameter', () => {
    const result = getShareUrl('John,Doe')
    const url = new URL(result)
    expect(url.searchParams.get('names')).toBe('John,Doe')
  })

  it('should not include a code parameter', () => {
    const result = getShareUrl('John,Doe')
    const url = new URL(result)
    expect(url.searchParams.has('code')).toBe(false)
  })

  it('should handle names with URL-sensitive characters', () => {
    const testCases = ['John&Doe', 'John=Doe', 'John?Doe', 'John#Doe', 'John+Doe']

    testCases.forEach((names) => {
      const result = getShareUrl(names)
      const url = new URL(result)
      expect(url.searchParams.get('names')).toBe(names)
    })
  })
})

describe('copyToClipboard', () => {
  it('should call Clipboard.setStringAsync with provided text', async () => {
    await copyToClipboard('test text')
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('test text')
  })
})
