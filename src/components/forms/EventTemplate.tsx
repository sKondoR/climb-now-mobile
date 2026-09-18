import { Text, View } from 'react-native'

import { isDateBefore } from '@/shared/utils/date.utils'
import { Event } from '@/shared/types/events'
import { Item } from '@/shared/components/Autocomplete/Autocomplete.types'

export function EventTemplate(item: Event | null, value: Item | null) {
  if (!item?.link) return <Text>{item ? String(item) : ''}</Text>
  const isHighlighted = isDateBefore(item.enddate)
  const isActive = value === item.link
  return (
    <View className={`px-3 py-2 ${isActive ? 'bg-blue-200' : isHighlighted ? 'bg-green-50' : ''}`}>
      <View className="flex-row justify-between">
        <Text className="flex-1 mr-3 font-bold min-w-[20%]">{item.location}</Text>
        <Text className="max-w-[70%] text-right">{item.name}</Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="flex-1 mr-3 text-xs text-gray-500">
          {item.date} {item.year}
        </Text>
        <Text className="text-xs text-gray-400">{item.link}</Text>
      </View>
    </View>
  )
}
