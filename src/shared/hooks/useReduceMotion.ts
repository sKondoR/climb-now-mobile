import { useSyncExternalStore } from 'react'
import { AccessibilityInfo } from 'react-native'

// Системная настройка «Уменьшить движение» (iOS), «Удалить анимацию» / масштаб анимации 0 (Android),
// prefers-reduced-motion (web). Animated и LayoutAnimation сами её не учитывают — каждая анимация
// проверяет этот хук и заменяется проявлением или мгновенным переключением.
// Одна подписка на всё приложение: точек онлайн на экране может быть много.
let reduceMotion = false
const listeners = new Set<() => void>()

const setReduceMotion = (value: boolean) => {
  reduceMotion = value
  listeners.forEach((listener) => listener())
}

AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const getSnapshot = () => reduceMotion

export function useReduceMotion() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
