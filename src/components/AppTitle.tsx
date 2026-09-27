import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { Text, View } from 'react-native'

// teal-500 -> emerald-500 -> blue-500, как в градиенте заголовка веб-версии (Header.tsx)
const GRADIENT_COLORS = ['#14b8a6', '#10b981', '#3b82f6'] as const
// Вордмарк — логотип, а не текст для чтения: при крупном системном шрифте он растёт
// не больше чем в 1.3 раза, иначе «ClimbNow» не помещается в ширину телефона.
// Название для скринридера отдаётся отдельно (accessibilityLabel).
const WORDMARK_MAX_SCALE = 1.3
const WORDMARK_CLASS = 'text-display font-bold'

export default function AppTitle() {
  return (
    <View className="items-center justify-center py-12 px-6">
      <MaskedView
        maskElement={
          <Text className={WORDMARK_CLASS} maxFontSizeMultiplier={WORDMARK_MAX_SCALE}>
            ClimbNow
          </Text>
        }
        accessible
        accessibilityRole="header"
        accessibilityLabel="ClimbNow"
      >
        <LinearGradient colors={GRADIENT_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text className={`${WORDMARK_CLASS} opacity-0`} maxFontSizeMultiplier={WORDMARK_MAX_SCALE}>
            ClimbNow
          </Text>
        </LinearGradient>
      </MaskedView>
      <Text className="text-headline text-fg-muted mt-1 text-center">Соревнования ФСР онлайн</Text>
      <Text className="text-body-sm text-fg-muted mt-2 text-center">
        Введите код соревнований и свою команду для отображения результатов
      </Text>
    </View>
  )
}
