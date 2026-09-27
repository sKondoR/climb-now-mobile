import { useState } from 'react'
import { LayoutAnimation, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'

import { rootStore } from '@/store/root.store'
import ResultsForm from '@/components/forms/ResultsForm'
import { useIconColors } from '@/shared/theme'
import { useReduceMotion } from '@/shared/hooks/useReduceMotion'
import IconButton from '@/shared/components/IconButton/IconButton'

const HeaderFormValues = observer(function HeaderFormValues() {
  const { code, command, isCommandFilterEnabled, isOnlyOnline } = rootStore.formStore
  return (
    <View className="flex-row gap-x-4">
      <View className="flex-1 gap-y-1">
        <Text className="text-caption text-fg-subtle">
          код соревнований: <Text className="font-bold text-fg">{code || '-'}</Text>
        </Text>
        <Text className="text-caption text-fg-subtle">
          команда: <Text className="font-bold text-fg">{command || '-'}</Text>
        </Text>
      </View>
      <View className="flex-1 gap-y-1">
        <Text className="text-caption text-fg-subtle">
          только команда: <Text className="font-bold text-fg">{isCommandFilterEnabled ? 'да' : 'нет'}</Text>
        </Text>
        <Text className="text-caption text-fg-subtle">
          только онлайн: <Text className="font-bold text-fg">{isOnlyOnline ? 'да' : 'нет'}</Text>
        </Text>
      </View>
    </View>
  )
})

export default function Header() {
  const [isExpanded, setIsExpanded] = useState(true)
  const iconColors = useIconColors()
  const reduceMotion = useReduceMotion()

  const toggleExpanded = () => {
    // При «уменьшить движение» шапка сворачивается мгновенно
    if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsExpanded((prev) => !prev)
  }

  return (
    <View className="bg-surface border-b border-line-subtle relative">
      {!isExpanded && (
        <View className="pl-4 pr-14 py-3">
          <HeaderFormValues />
        </View>
      )}
      <View className={`px-4 pb-4 pt-3 ${isExpanded ? '' : 'hidden'}`}>
        <ResultsForm />
      </View>
      <IconButton
        icon={isExpanded ? 'chevron-up' : 'chevron-down'}
        label={isExpanded ? 'Свернуть форму поиска' : 'Развернуть форму поиска'}
        expanded={isExpanded}
        outlined
        size={12}
        color={iconColors.muted}
        onPress={toggleExpanded}
        className="absolute bottom-1 right-1"
      />
    </View>
  )
}
