import { useState } from 'react'
import { LayoutAnimation, Pressable, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

import { rootStore } from '@/store/root.store'
import ResultsForm from '@/components/forms/ResultsForm'

const HeaderFormValues = observer(function HeaderFormValues() {
  const { code, command, isCommandFilterEnabled, isOnlyOnline } = rootStore.formStore
  return (
    <View className="flex-row gap-x-4">
      <View className="flex-1 gap-y-1">
        <Text className="text-xs text-gray-500">
          код соревнований: <Text className="font-bold text-gray-900">{code || '-'}</Text>
        </Text>
        <Text className="text-xs text-gray-500">
          команда: <Text className="font-bold text-gray-900">{command || '-'}</Text>
        </Text>
      </View>
      <View className="flex-1 gap-y-1">
        <Text className="text-xs text-gray-500">
          только команда: <Text className="font-bold text-gray-900">{isCommandFilterEnabled ? 'да' : 'нет'}</Text>
        </Text>
        <Text className="text-xs text-gray-500">
          только онлайн: <Text className="font-bold text-gray-900">{isOnlyOnline ? 'да' : 'нет'}</Text>
        </Text>
      </View>
    </View>
  )
})

export default function Header() {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsExpanded((prev) => !prev)
  }

  return (
    <View className="bg-white border-b border-gray-200 relative">
      {!isExpanded && (
        <View className="pl-4 pr-14 py-3">
          <HeaderFormValues />
        </View>
      )}
      <View className={`px-4 pb-4 pt-3 ${isExpanded ? '' : 'hidden'}`}>
        <ResultsForm />
      </View>
      <Pressable
        onPress={toggleExpanded}
        className="absolute bottom-3 right-3 w-8 h-8 rounded-full border border-gray-300 bg-white items-center justify-center shadow-sm"
        hitSlop={8}
        accessibilityLabel={isExpanded ? 'Свернуть шапку' : 'Развернуть шапку'}
      >
        <FontAwesome6 name={isExpanded ? 'chevron-up' : 'chevron-down'} solid size={12} color="#4b5563" />
      </Pressable>
    </View>
  )
}
