import { FETCH_TIMEOUT } from '../constants'

/**
 * fetch с таймаутом: если соединение повисло (например, домен режется DPI),
 * запрос падает с ошибкой вместо вечной загрузки.
 */
export const fetchWithTimeout = async (url: string, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}
