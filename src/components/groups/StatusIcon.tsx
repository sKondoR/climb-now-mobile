import { useEffect, useState } from 'react'
import { Animated, View } from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

import { Status } from '@/shared/types'
import { STATUSES } from '@/shared/constants'
import { useIconColors } from '@/shared/theme'
import { useReduceMotion } from '@/shared/hooks/useReduceMotion'

// onDark — точка на залитом акцентом фоне (активная вкладка дисциплины): обводка белая, а не цвета карточки
export default function StatusIcon({ status, onlyOnline, onDark }: { status: Status; onlyOnline?: boolean; onDark?: boolean }) {
  const isOnline = status === STATUSES.ONLINE
  const iconColors = useIconColors()
  // При «уменьшить движение» точка не пульсирует: онлайн по-прежнему видно по цвету,
  // а скринридер озвучивает «идёт сейчас» у родителя.
  const reduceMotion = useReduceMotion()
  // useState вместо useRef: значение создаётся один раз (ленивый инициализатор) и не читается
  // как ref во время рендера — этого требует react-compiler eslint-правило react-hooks/refs.
  const [pulse] = useState(() => new Animated.Value(1))

  useEffect(() => {
    if (!isOnline || reduceMotion) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [isOnline, reduceMotion, pulse])

  if (status === STATUSES.PENDING || status === null) return null
  if (onlyOnline && !isOnline) return null

  return (
    // Галочка стоит перед названием в колонке фиксированной ширины, точка «в эфире» — после названия
    <View className={`items-center justify-center ${isOnline ? 'mx-1' : 'w-4 mr-1'}`} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {isOnline ? (
        // Обводка отделяет зелёную точку от фона под ней
        <Animated.View style={{ opacity: reduceMotion ? 1 : pulse }}>
          <View className={`w-3 h-3 rounded-full bg-live border ${onDark ? 'border-white' : 'border-surface'}`} />
        </Animated.View>
      ) : (
        <FontAwesome6 name="check" solid size={12} color={iconColors.live} />
      )}
    </View>
  )
}
