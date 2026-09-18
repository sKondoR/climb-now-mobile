import { useCallback, useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

import { rootStore } from '@/store/root.store'
import { DEFAULT_TEAM, DEFAULT_URL_CODE } from '@/shared/constants'

import { EventTemplate } from './EventTemplate'
import { Item } from '@/shared/components/Autocomplete/Autocomplete.types'
import { Event } from '@/shared/types/events'
import LinkToEvent from '@/shared/components/LinkToEvent/LinkToEvent'
import Autocomplete from '@/shared/components/Autocomplete/Autocomplete'
import TextInput from '@/shared/components/TextInput/TextInput'

function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable onPress={onToggle} className="flex-row items-center mt-2">
      <View className={`w-4 h-4 rounded border items-center justify-center ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
        {checked && <FontAwesome6 name="check" solid size={10} color="white" />}
      </View>
      <Text className="text-sm font-medium text-gray-700 ml-2">{label}</Text>
    </Pressable>
  )
}

// Веб-версия чистила ввод через DOMPurify (защита от innerXSS в браузере) — в RN текст никогда
// не интерпретируется как HTML, санитайз не нужен (см. plans/migration-plan.md, маппинг зависимостей).
export default observer(function ResultsForm() {
  const formStore = rootStore.formStore
  const teamsStore = rootStore.teamsStore
  const disciplinesStore = rootStore.disciplinesStore
  const eventsStore = rootStore.eventsStore
  const command = formStore.command as Item | null
  const names = formStore.names
  const { isCommandFilterEnabled, isNamesFilterEnabled, isOnlyOnline } = formStore

  useEffect(() => {
    const currentEvent = eventsStore.events?.find((event) => event.link === formStore.code)
    disciplinesStore.fetchGroups(formStore.code, currentEvent?.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formStore.code])

  const handleUrlChange = useCallback((value: Item | null) => {
    formStore.setCode(typeof value === 'string' ? value : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCommandChange = useCallback((value: Item | null) => {
    formStore.setCommand(typeof value === 'string' ? value : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNamesChange = useCallback((value: string) => {
    formStore.setNames(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className="gap-4 px-4">
      <View className="relative">
        <Autocomplete
          value={formStore.code}
          onChange={handleUrlChange}
          placeholder="2602vrn"
          data={eventsStore.events as unknown as Item[]}
          label="код соревнований"
          dataLabel={DEFAULT_URL_CODE}
          property="link"
          renderItem={(item: Item, value: Item | null) => EventTemplate(item as unknown as Event, value as string | null)}
        />
        {disciplinesStore.groupsData && <LinkToEvent code={formStore.code} />}
      </View>

      <View className="relative">
        {isNamesFilterEnabled ? (
          <TextInput value={names} onChange={handleNamesChange} placeholder="Петров, Иванов" label="скалолазы" dataLabel="Петров, Иванов" />
        ) : (
          <Autocomplete
            value={command}
            onChange={handleCommandChange}
            placeholder={DEFAULT_TEAM}
            data={teamsStore.teams as Item[]}
            label="команда"
            dataLabel={DEFAULT_TEAM}
          />
        )}
        <Pressable
          onPress={() => formStore.setIsNamesFilterEnabled(!isNamesFilterEnabled)}
          className="absolute top-0 right-0 p-1"
        >
          <FontAwesome6 name={isNamesFilterEnabled ? 'users' : 'flag'} solid size={14} color="#2563eb" />
        </Pressable>
      </View>

      <View>
        <Checkbox
          checked={isCommandFilterEnabled}
          onToggle={() => formStore.setIsCommandFilterEnabled(!isCommandFilterEnabled)}
          label="только команда"
        />
        <Checkbox
          checked={isOnlyOnline}
          onToggle={() => formStore.setIsOnlyOnline(!isOnlyOnline)}
          label="только онлайн"
        />
      </View>
    </View>
  )
})
