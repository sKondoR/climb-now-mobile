import { useColorScheme } from 'react-native'

// Иконки FontAwesome и ActivityIndicator принимают цвет строкой, а не className —
// значения повторяют токены из src/global.css.
const ICON_COLORS = {
  light: {
    accent: '#1d4ed8', // accent-fg
    muted: '#475569', // fg-muted
    subtle: '#64748b', // fg-subtle
    live: '#22c55e', // live
    brand: '#0d9488', // teal-600
    surface: '#ffffff', // surface — фон кружка pull-to-refresh на Android
  },
  dark: {
    accent: '#60a5fa',
    muted: '#cbd5e1',
    subtle: '#94a3b8',
    live: '#4ade80',
    brand: '#2dd4bf', // teal-400
    surface: '#0f172a',
  },
} as const

export function useIconColors() {
  return ICON_COLORS[useColorScheme() === 'dark' ? 'dark' : 'light']
}
