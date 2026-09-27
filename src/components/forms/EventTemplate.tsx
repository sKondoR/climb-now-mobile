import { Text, View } from 'react-native'

import { isDateBefore } from '@/shared/utils/date.utils'
import { Event } from '@/shared/types/events'
import { Item } from '@/shared/components/Autocomplete/Autocomplete.types'

export function EventTemplate(item: Event | null, value: Item | null) {
  if (!item?.link) return <Text className="text-body text-fg">{item ? String(item) : ''}</Text>
  const isHighlighted = isDateBefore(item.enddate)
  const isActive = value === item.link
  return (
    <View className={`px-4 py-2.5 ${isActive ? 'bg-highlight' : isHighlighted ? 'bg-live-faint' : ''}`}>
      <View className="flex-row justify-between">
        <Text className="flex-1 mr-3 text-body-sm font-bold min-w-[20%] text-fg">{item.location}</Text>
        <Text className="max-w-[70%] text-body-sm text-right text-fg">{item.name}</Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="flex-1 mr-3 text-caption text-fg-subtle">
          {item.date} {item.year}
        </Text>
        <Text className="text-caption text-fg-subtle">{item.link}</Text>
      </View>
    </View>
  )
}
