import { ComponentProps } from 'react'
import { Animated, Pressable, View } from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

interface IconButtonProps {
  icon: ComponentProps<typeof FontAwesome6>['name']
  label: string
  onPress: () => void
  color: string
  size?: number
  // Круглая кнопка 32dp с рамкой (свернуть/развернуть) — внутри той же зоны нажатия 48dp
  outlined?: boolean
  role?: 'button' | 'link'
  disabled?: boolean
  busy?: boolean
  expanded?: boolean
  iconStyle?: ComponentProps<typeof Animated.View>['style']
  className?: string
}

// Зона нажатия всегда 48×48dp (минимум Material), сама иконка остаётся маленькой.
// Чтобы кнопка не раздувала строку, вызывающий код компенсирует её отрицательными отступами.
export default function IconButton({
  icon,
  label,
  onPress,
  color,
  size = 14,
  outlined = false,
  role = 'button',
  disabled = false,
  busy = false,
  expanded,
  iconStyle,
  className = '',
}: IconButtonProps) {
  const glyph = (
    <Animated.View style={iconStyle}>
      <FontAwesome6 name={icon} solid size={size} color={color} />
    </Animated.View>
  )

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy, expanded }}
      className={`w-12 h-12 items-center justify-center active:opacity-60 ${className}`}
    >
      {outlined ? (
        <View className="w-8 h-8 rounded-full border border-line bg-surface items-center justify-center shadow-sm">
          {glyph}
        </View>
      ) : (
        glyph
      )}
    </Pressable>
  )
}
