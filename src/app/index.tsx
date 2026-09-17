import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'

import { rootStore } from '@/store/root.store'
import { MIN_URL_CODE_LENGTH } from '@/shared/constants'
import { Group } from '@/shared/types'
import { isGroupOnline } from '@/components/groups/groups.utils'
import ResultsForm from '@/components/forms/ResultsForm'
import DisciplineTabs from '@/components/groups/DisciplineTabs'
import GroupCard from '@/components/groups/GroupCard'

function CenteredMessage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="py-12 items-center px-6">
      <Text className="text-xl font-semibold text-gray-600 text-center mb-2">{title}</Text>
      {subtitle && <Text className="text-gray-500 text-center">{subtitle}</Text>}
    </View>
  )
}

export default observer(function HomeScreen() {
  const [activeTab, setActiveTab] = useState(0)
  const disciplinesStore = rootStore.disciplinesStore
  const formStore = rootStore.formStore

  useEffect(() => {
    setActiveTab(0)
  }, [formStore.code])

  const renderContent = () => {
    if (disciplinesStore.isGroupsLoading) {
      return <CenteredMessage title="загрузка..." />
    }
    if (formStore.code.length >= MIN_URL_CODE_LENGTH && disciplinesStore.groupsData === null) {
      return <CenteredMessage title="Соревнование не найдено" />
    }
    if (formStore.code.length >= MIN_URL_CODE_LENGTH && !disciplinesStore.groupsData?.length) {
      return <CenteredMessage title="Нет данных по этому соревнованию" />
    }

    const discipline = disciplinesStore.groupsData?.[activeTab]
    if (!discipline) {
      return (
        <CenteredMessage
          title="Добро пожаловать в ClimbNow!"
          subtitle="Введите код соревнований и свою команду для отображения результатов"
        />
      )
    }

    const filteredGroups = formStore.isOnlyOnline ? discipline.groups.filter(isGroupOnline) : discipline.groups
    return (
      <>
        <DisciplineTabs disciplines={disciplinesStore.groupsData} setActiveTab={setActiveTab} activeTab={activeTab} />
        {!filteredGroups.length && discipline.groups.length ? (
          <Text className="text-center text-gray-500 mb-4">нет онлайн групп</Text>
        ) : null}
        <View className="gap-4">
          {filteredGroups.map((group: Group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </View>
      </>
    )
  }

  // Без edges — по умолчанию учитываются все стороны: в портретной ориентации это
  // статус-бар сверху и жестовая/навигационная панель снизу, а в альбомной — ещё и
  // боковая навигационная панель Android (3 кнопки), которая иначе перекрывает контент.
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerClassName="px-4 pt-4 pb-8" keyboardShouldPersistTaps="handled">
        <ResultsForm />
        <View className="mt-4">{renderContent()}</View>
      </ScrollView>
    </SafeAreaView>
  )
})
