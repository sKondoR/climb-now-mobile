import * as Clipboard from 'expo-clipboard'

export function sanitizeEventCode(code: string | null): string | null {
  if (!code) return null

  // Allow only alphanumeric characters, hyphens, and underscores
  const sanitized = code.replace(/[^a-zA-Z0-9-_]/g, '')

  // Return null if sanitization removed all characters or changed the value
  return sanitized.length > 0 && sanitized === code ? sanitized : null
}

export function getShareUrl(names: string): string {
  const url = new URL('https://climbnow.ru/')
  url.searchParams.set('names', names)
  return url.href
}

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text)
}
