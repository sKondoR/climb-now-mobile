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
      className="mb-3"
      contentContainerClassName="grow gap-1 px-4 justify-center"
    >
      {disciplines.map(({ discipline }, index: number) => {
        const isDisabled = discipline === DISCIPLINES.SPEED
        const isActive = activeTab === index
        return (
          <Pressable
            key={`${discipline}-${index}`}
            disabled={isDisabled}
            onPress={() => setActiveTab(index)}
            className={`px-4 py-1.5 rounded-lg ${
              isActive ? 'bg-blue-600' : isDisabled ? 'bg-gray-100' : 'bg-gray-200'
            }`}
          >
            <Text className={`text-base font-medium ${isActive ? 'text-white' : isDisabled ? 'text-gray-300' : 'text-gray-700'}`}>
              {discipline}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
