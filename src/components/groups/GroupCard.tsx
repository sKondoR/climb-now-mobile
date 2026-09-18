import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { observer } from 'mobx-react-lite'

import { Group } from '@/shared/types'
import { STATUSES } from '@/shared/constants'
import { rootStore } from '@/store/root.store'
import StatusIcon from './StatusIcon'
import Table from '../tables/Table'

interface GroupCardProps {
  group: Group
}

export default observer(function GroupCard({ group }: GroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { isCommandFilterEnabled, code, command, isNamesFilterEnabled, names } = rootStore.formStore

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (group.subgroups.length === 0) return '0'
    const onlineSubgroup = group.subgroups.find((s) => s.status === STATUSES.ONLINE)
    return onlineSubgroup ? onlineSubgroup.id : group.subgroups[group.subgroups.length - 1].id
  })

  useEffect(() => {
    if (group.subgroups.length > 0 && !group.subgroups.find((s) => s.id === activeTab)) {
      setActiveTab(group.subgroups[0].id)
    }
  }, [group.subgroups, activeTab])

  let isOnline: typeof STATUSES.ONLINE | null = null
  const tabs = group.subgroups.map((subgroup) => {
    if (subgroup.status === STATUSES.ONLINE) isOnline = STATUSES.ONLINE
    return { id: subgroup.id, label: subgroup.title, status: subgroup.status }
  })

  return (
    <View className={`bg-white shadow-sm border p-4 ${isOnline ? 'border-green-500' : 'border-gray-200'}`}>
      <Pressable className="flex-row items-center" onPress={() => setIsExpanded(!isExpanded)}>
        <Text className="text-xl font-bold text-gray-900 mr-2">{group.title}</Text>
        <StatusIcon status={isOnline} onlyOnline />
        <View className="flex-1" />
        <View className="border border-gray-300 rounded-full w-8 h-8 items-center justify-center">
          <FontAwesome6 name={isExpanded ? 'chevron-up' : 'chevron-down'} solid size={12} color="#4b5563" />
        </View>
      </Pressable>

      {isExpanded && (
        <View className="mt-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`flex-row items-center border-2 px-2 py-1 rounded-lg bg-gray-100 ${
                    isActive ? 'border-blue-600' : 'border-gray-100'
                  }`}
                >
                  <StatusIcon status={tab.status} />
                  <Text className="text-sm font-medium text-gray-700">{tab.label}</Text>
                </Pressable>
              )
            })}
          </ScrollView>

          <Table
            subGroup={group.subgroups.find((s) => s.id === activeTab)}
            code={code}
            isCommandFilterEnabled={isCommandFilterEnabled}
            command={command}
            isNamesFilterEnabled={isNamesFilterEnabled}
            names={names}
          />
        </View>
      )}
    </View>
  )
})
