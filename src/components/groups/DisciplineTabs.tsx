import { Pressable, ScrollView, Text } from 'react-native'

import { DISCIPLINES } from '@/shared/constants'
import { Discipline } from '@/shared/types'

interface DisciplineTabsProps {
  disciplines: Discipline[] | null
  setActiveTab: (index: number) => void
  activeTab: number
}

export default function DisciplineTabs({ disciplines, setActiveTab, activeTab }: DisciplineTabsProps) {
  if (!disciplines) return null
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // -mt-1.5 + py-1.5: зона нажатия табов (hitSlop 6) лежит внутри ScrollView
      className="-mt-1.5 mb-1.5"
      accessibilityRole="tablist"
      contentContainerClassName="grow gap-1 px-4 py-1.5 justify-center"
    >
      {disciplines.map(({ discipline }, index: number) => {
        const isDisabled = discipline === DISCIPLINES.SPEED
        const isActive = activeTab === index
        return (
          <Pressable
            key={`${discipline}-${index}`}
            disabled={isDisabled}
            onPress={() => setActiveTab(index)}
            hitSlop={{ top: 6, bottom: 6 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive, disabled: isDisabled }}
            className={`px-4 py-1.5 rounded-lg ${
              isActive ? 'bg-accent' : isDisabled ? 'bg-surface-muted/50' : 'bg-surface-muted'
            }`}
          >
            <Text className={`text-body font-medium ${isActive ? 'text-white' : isDisabled ? 'text-fg-disabled' : 'text-fg-muted'}`}>
              {discipline}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
