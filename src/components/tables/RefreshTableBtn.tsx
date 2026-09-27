import { useEffect, useState } from 'react'
import { Animated, Easing } from 'react-native'

import { useIconColors } from '@/shared/theme'
import { useReduceMotion } from '@/shared/hooks/useReduceMotion'
import IconButton from '@/shared/components/IconButton/IconButton'

interface RefreshTableBtnProps {
  refetch: () => void
}

export default function RefreshTableBtn({ refetch }: RefreshTableBtnProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const iconColors = useIconColors()
  const reduceMotion = useReduceMotion()
  // useState вместо useRef — см. StatusIcon.tsx.
  const [spin] = useState(() => new Animated.Value(0))
  const [fade] = useState(() => new Animated.Value(1))

  useEffect(() => {
    if (!isRefreshing) return
    if (reduceMotion) {
      // Вместо поворота — короткое затухание: смена прозрачности не считается движением,
      // а нажатие всё равно видно
      Animated.sequence([
        Animated.timing(fade, { toValue: 0.4, duration: 75, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 75, useNativeDriver: true }),
      ]).start()
      return
    }
    spin.setValue(0)
    Animated.timing(spin, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true }).start()
  }, [isRefreshing, reduceMotion, spin, fade])

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })

  // -my-3.5 -mr-3: зона нажатия 48dp не раздувает строку заголовка подгруппы
  return (
    <IconButton
      icon="rotate-right"
      label="Обновить результаты"
      color={iconColors.accent}
      size={12}
      iconStyle={reduceMotion ? { opacity: fade } : { transform: [{ rotate }] }}
      className="-my-3.5 -mr-3"
      onPress={() => {
        setIsRefreshing(true)
        refetch()
        setTimeout(() => setIsRefreshing(false), 700)
      }}
    />
  )
}
