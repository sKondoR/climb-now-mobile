import { Text, View } from 'react-native'

export default function BaseTemplate(item: string, value: string) {
  const isSelected = value === item
  return (
    <View className={`px-3 py-2 ${isSelected ? 'bg-blue-200' : ''}`}>
      <Text>{item}</Text>
    </View>
  )
}
