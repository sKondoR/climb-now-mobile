import { useEffect, useState } from 'react'
import { Animated, Easing, Pressable } from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

interface RefreshTableBtnProps {
  refetch: () => void
}

export default function RefreshTableBtn({ refetch }: RefreshTableBtnProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  // useState вместо useRef — см. StatusIcon.tsx.
  const [spin] = useState(() => new Animated.Value(0))

  useEffect(() => {
    if (!isRefreshing) return
    spin.setValue(0)
    Animated.timing(spin, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true }).start()
  }, [isRefreshing, spin])

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })

  return (
    <Pressable
      className="ml-2"
      onPress={() => {
        setIsRefreshing(true)
        refetch()
        setTimeout(() => setIsRefreshing(false), 700)
      }}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <FontAwesome6 name="rotate-right" solid size={12} color="#2563eb" />
      </Animated.View>
    </Pressable>
  )
}
