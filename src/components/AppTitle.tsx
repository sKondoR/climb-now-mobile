import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, Text, View } from 'react-native'

// teal-500 -> emerald-500 -> blue-500, как в градиенте заголовка веб-версии (Header.tsx)
const GRADIENT_COLORS = ['#14b8a6', '#10b981', '#3b82f6'] as const

export default function AppTitle() {
  return (
    <View className="items-center justify-center py-12 px-6">
      <MaskedView maskElement={<Text style={styles.title}>ClimbNow</Text>}>
        <LinearGradient colors={GRADIENT_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={[styles.title, styles.hiddenTitle]}>ClimbNow</Text>
        </LinearGradient>
      </MaskedView>
      <Text className="text-gray-500 mt-1 text-center" style={styles.secondTitle}>Соревнования ФСР онлайн</Text>
      <Text className="text-gray-500 mt-1 text-center">Введите код соревнований и свою команду для отображения результатов</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  secondTitle: {
    fontSize: 24,
  },
  hiddenTitle: {
    opacity: 0,
  },
})
