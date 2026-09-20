import { useSyncExternalStore } from 'react'
import { Text, View } from 'react-native'
import { onlineManager } from '@tanstack/react-query'

const isOnline = () => onlineManager.isOnline()

export default function OfflineBanner() {
  const online = useSyncExternalStore(onlineManager.subscribe.bind(onlineManager), isOnline)
  if (online) return null

  return (
    <View className="bg-amber-100 px-4 py-2 mt-2">
      <Text className="text-center text-sm text-amber-800">нет сети, показаны сохранённые данные</Text>
    </View>
  )
}
