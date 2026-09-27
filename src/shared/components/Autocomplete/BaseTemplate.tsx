import { Text, View } from 'react-native'

export default function BaseTemplate(item: string, value: string) {
  const isSelected = value === item
  return (
    <View className={`px-4 py-3 ${isSelected ? 'bg-highlight' : ''}`}>
      <Text className="text-body text-fg">{item}</Text>
    </View>
  )
}
