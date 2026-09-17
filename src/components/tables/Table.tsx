import { ActivityIndicator, Text, View } from 'react-native'

import { NAME_COL, COMMAND_COL } from '@/shared/tables.configs'
import { getClimbedCount, getFinalBorderClasses, getRowClasses, getTableConfig, isCommandMatch } from './tables.utils'
import BoulderCell from './BoulderCell'
import RefreshTableBtn from './RefreshTableBtn'
import useFetchResults from './useFetchResults'

import { SPECIAL_STATUSES, STATUSES } from '@/shared/constants'
import {
  Subgroup,
  Results,
  LeadQualItem,
  LeadQualResultItem,
  LeadFinalsItem,
  BoulderQualItem,
  BoulderFinalItem,
} from '@/shared/types'

interface TableProps {
  subGroup: Subgroup | undefined
  code: string
  isCommandFilterEnabled: boolean
  command: string
  isNamesFilterEnabled: boolean
  names: string
}

const WIDE_COLS = [NAME_COL, COMMAND_COL]

export default function Table({
  subGroup,
  code,
  isCommandFilterEnabled,
  command,
  isNamesFilterEnabled,
  names,
}: TableProps) {
  const { results, isLead, isBoulder, isFinal, isQualResult, isLoading, error, refetch } = useFetchResults({
    code,
    isOnline: subGroup?.status === STATUSES.ONLINE,
    subgroupLink: subGroup?.link,
  })

  if (!subGroup) return null

  const filterResultsByCommand = (results: Results) => {
    if (!isCommandFilterEnabled) {
      return results
    }
    const filtered = results.filter((result) => isCommandMatch(result.command, command))
    return filtered.length
      ? results.filter((result) => result.rank === '1' || isCommandMatch(result.command, command))
      : []
  }

  const filteredResults: Results = filterResultsByCommand(results as Results)
  const climbedCount = getClimbedCount({ results, isLead, isBoulder })

  const config = getTableConfig({ isFinal, isQualResult, isLead, isBoulder }).filter((col) => {
    if (!col.prop) return false
    const firstResult = results?.[0]
    if (!firstResult) return false
    return col.prop in firstResult
  })

  const finalBorderClasses = getFinalBorderClasses(filteredResults)

  return (
    <View className="mt-2">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-gray-900">{subGroup.title}</Text>
        <View className="flex-row items-center">
          <View className="px-2.5 py-0.5 rounded-full bg-blue-100">
            <Text className="text-xs font-medium text-blue-800">
              {climbedCount} / {results.length} пролезло
            </Text>
          </View>
          <RefreshTableBtn refetch={refetch} />
        </View>
      </View>

      <View className="relative">
        {/* flex-колонки вместо горизонтального скролла с фиксированной шириной — таблица всегда
            растягивается на 100% ширины экрана в портретной ориентации, узкие числовые колонки
            (например, боулдеринг с 8 трассами) сжимаются, а не уезжают за край экрана. */}
        <View className="w-full">
          <View className="flex-row border-b border-gray-300">
            {config.map((col) => (
              <View key={col.id} className={`px-1 py-1 ${WIDE_COLS.includes(col.name as string) ? 'flex-[2]' : 'flex-1'}`}>
                <Text className="text-xs font-medium text-left text-gray-700" numberOfLines={1}>
                  {col.name}
                </Text>
              </View>
            ))}
          </View>

          {filteredResults.map((result, index) => {
            const finalBorderClass = finalBorderClasses[index]
            const rowClass = getRowClasses({ result, command, names, isNamesFilterEnabled, isFinal })

            return (
              <View
                key={`${result.name}-${index}`}
                className={`flex-row border-b border-white ${finalBorderClass}${rowClass}`}
              >
                {config.map((col, colIndex) => {
                  const value = (
                    result as LeadQualItem | LeadQualResultItem | LeadFinalsItem | BoulderQualItem | BoulderFinalItem
                  )[col.prop as Exclude<keyof typeof result, 'isHighlighted'>]
                  const isBoulderCell = value.includes('/') && !SPECIAL_STATUSES.includes(value.toLowerCase())
                  const isWide = WIDE_COLS.includes(col.name as string)
                  return (
                    <View key={`${col.id}-${colIndex}`} className={`${isWide ? 'flex-[2]' : 'flex-1'} px-1 py-1`}>
                      {isBoulderCell ? (
                        <BoulderCell value={value} />
                      ) : (
                        <Text className="text-xs font-medium text-gray-900" numberOfLines={1}>
                          {value}
                        </Text>
                      )}
                    </View>
                  )
                })}
              </View>
            )
          })}

          {filteredResults.length === 0 && !isLoading && !error && (
            <View className="py-1 border-b border-gray-100">
              <Text className="text-center text-gray-500">-</Text>
            </View>
          )}
        </View>

        {isLoading && (
          <View className="absolute inset-0 bg-white/70 items-center justify-center py-4">
            <ActivityIndicator color="#6b7280" />
            <Text className="text-gray-500 font-medium mt-2">Загрузка результатов...</Text>
          </View>
        )}

        {error && (
          <View className="absolute inset-0 bg-red-500/90 items-center justify-center p-4">
            <Text className="text-white text-base font-semibold mb-2">Ошибка загрузки</Text>
            <Text className="text-white text-center">{error}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
