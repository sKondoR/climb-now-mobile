import { useEffect, useState } from 'react'
import { Animated, Easing } from 'react-native'

import { useIconColors } from '@/shared/theme'
import IconButton from '@/shared/components/IconButton/IconButton'

interface RefreshTableBtnProps {
  refetch: () => void
}

export default function RefreshTableBtn({ refetch }: RefreshTableBtnProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const iconColors = useIconColors()
  // useState вместо useRef — см. StatusIcon.tsx.
  const [spin] = useState(() => new Animated.Value(0))

  useEffect(() => {
    if (!isRefreshing) return
    spin.setValue(0)
    Animated.timing(spin, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true }).start()
  }, [isRefreshing, spin])

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })

  // -my-3.5 -mr-3: зона нажатия 48dp не раздувает строку заголовка подгруппы
  return (
    <IconButton
      icon="rotate-right"
      label="Обновить результаты"
      color={iconColors.accent}
      size={12}
      iconStyle={{ transform: [{ rotate }] }}
      className="-my-3.5 -mr-3"
      onPress={() => {
        setIsRefreshing(true)
        refetch()
        setTimeout(() => setIsRefreshing(false), 700)
      }}
    />
  )
}
