import { useState } from 'react'
import { ActivityIndicator, ScrollView, Text, useWindowDimensions, View, ViewStyle } from 'react-native'

import { getClimbedCount, getFinalBorderClasses, getRowClasses, getTableConfig, isCommandMatch } from './tables.utils'
import BoulderCell from './BoulderCell'
import RefreshTableBtn from './RefreshTableBtn'
import useFetchResults from './useFetchResults'

import { SPECIAL_STATUSES, STATUSES } from '@/shared/constants'
import { useIconColors } from '@/shared/theme'
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

// Место, стартовый номер и место в квалификации — максимум 3 цифры, им хватает фиксированной ширины; освободившуюся
// ширину забирают имя и результат, которые переносятся на несколько строк, а не обрезаются.
// На узком экране между колонками 2px (px-px), от sm — прежние 8px.
const CELL_PADDING = 'px-px sm:px-1 py-1 justify-center'
// Первой и последней колонкам — отступ от края строки, чтобы текст не прилипал к краю цветной подсветки.
const getCellPadding = (index: number, count: number) =>
  `${CELL_PADDING}${index === 0 ? ' pl-[5px] sm:pl-[5px]' : ''}${index === count - 1 ? ' pr-[5px] sm:pr-[5px]' : ''}`
const WRAPPED_PROPS = ['name', 'score', 'mark']
// Цифры одинаковой ширины — колонки не «гуляют» при обновлении результатов.
// fontVariant напрямую, а не класс tabular-nums: NativeWind собирает его через CSS-переменные.
const TABULAR_NUMS = { fontVariant: ['tabular-nums' as const] }
// Второстепенные колонки — приглушённым цветом, чтобы взгляд шёл к месту, имени и результату
const SECONDARY_PROPS = ['stRank', 'command']

// Для скринридера: «ст.#» и «тр.1» читаются плохо, поэтому озвучиваются полные названия.
const SPOKEN_COL_NAMES: Record<string, string> = {
  rank: 'место',
  stRank: 'стартовый номер',
  qRank: 'место в квалификации',
  score: 'результат',
}
const getSpokenColName = (col: { prop?: string; name?: string }) => {
  if (col.prop && SPOKEN_COL_NAMES[col.prop]) return SPOKEN_COL_NAMES[col.prop]
  if (col.prop && /^r\d$/.test(col.prop)) return `трасса ${col.name}`
  return (col.name ?? '').replace('тр.', 'трасса ')
}

// Ячейка боулдеринга «1/ » озвучивается как «1 и нет», пустое значение — «нет»
const getSpokenValue = (value?: string) => {
  if (value?.includes('/') && !SPECIAL_STATUSES.includes(value.toLowerCase())) {
    return value
      .split('/')
      .map((part) => part.trim() || 'нет')
      .join(' и ')
  }
  return value?.trim() || 'нет'
}

// Ширины колонок в dp при обычном размере шрифта; все умножаются на системный fontScale,
// чтобы при крупном шрифте цифры и имена не обрезались. Место, ст.# и место в квалификации —
// до 3 цифр, им хватает фиксированной ширины (кв.свод от 640px — 56, чтобы влез полный заголовок).
const NARROW_COLS = ['rank', 'stRank', 'qRank']
const getFixedWidth = (prop: string, isNarrow: boolean) => {
  if (isNarrow) return 28
  return prop === 'qRank' ? 56 : 44
}
// flex — доля свободной ширины, min — ниже этого колонка не сжимается
const getFlexCol = (prop?: string) => {
  if (prop === 'name') return { flex: 3, min: 72 }
  if (prop === 'command') return { flex: 2, min: 36 }
  if (prop === 'score' || prop === 'mark') return { flex: 1.5, min: 36 }
  if (prop && /^r\d$/.test(prop)) return { flex: 1, min: 14 }
  return { flex: 1, min: 28 }
}
const getColStyle = (prop: string | undefined, isNarrow: boolean, fontScale: number): ViewStyle => {
  if (prop && NARROW_COLS.includes(prop)) return { width: getFixedWidth(prop, isNarrow) * fontScale }
  const { flex, min } = getFlexCol(prop)
  return { flex, minWidth: min * fontScale }
}
const getColMinWidth = (prop: string | undefined, isNarrow: boolean, fontScale: number) =>
  (prop && NARROW_COLS.includes(prop) ? getFixedWidth(prop, isNarrow) : getFlexCol(prop).min) * fontScale

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
  const iconColors = useIconColors()
  // Та же граница, что у sm: в классах — на узком экране заголовки сокращаются (место → м)
  const { width: windowWidth, fontScale } = useWindowDimensions()
  const isNarrow = windowWidth < 640
  // Реальная доступная ширина — если минимальные ширины колонок в неё не влезают
  // (узкий экран + крупный шрифт + 8 трасс боулдеринга), таблица скроллится по горизонтали.
  const [availableWidth, setAvailableWidth] = useState(0)

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
  const minTableWidth = config.reduce((sum, col) => sum + getColMinWidth(col.prop, isNarrow, fontScale), 0) + 10
  const needsScroll = availableWidth > 0 && minTableWidth > availableWidth

  return (
    <View className="mt-2">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-body font-semibold text-fg" accessibilityRole="header">{subGroup.title}</Text>
        <View className="flex-row items-center">
          <View
            className="px-2.5 py-0.5 rounded-full bg-accent-soft"
            accessible
            accessibilityLabel={`пролезло ${climbedCount} из ${results.length}`}
          >
            <Text className="text-caption font-medium text-accent-soft-fg" style={TABULAR_NUMS}>
              {climbedCount} / {results.length} пролезло
            </Text>
          </View>
          <RefreshTableBtn refetch={refetch} />
        </View>
      </View>

      {/* Минимальная высота — чтобы оверлей загрузки/ошибки не сжимался в полоску, пока строк ещё нет. */}
      <View
        className={`relative ${isLoading || error ? 'min-h-28' : ''}`}
        onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
      >
        {/* flex-колонки на 100% ширины; горизонтальный скролл — только запасной вариант,
            когда минимальные ширины колонок не помещаются (см. needsScroll). */}
        <ScrollView
          horizontal
          scrollEnabled={needsScroll}
          showsHorizontalScrollIndicator={needsScroll}
          persistentScrollbar={needsScroll}
          contentContainerStyle={{ width: needsScroll ? minTableWidth : availableWidth || undefined }}
        >
        <View className="w-full">
          {/* Строки озвучиваются целиком с названиями колонок, поэтому шапку скринридер пропускает */}
          <View className="flex-row border-b border-line" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            {config.map((col, colIndex) => (
              <View
                key={col.id}
                className={getCellPadding(colIndex, config.length)}
                style={getColStyle(col.prop, isNarrow, fontScale)}
              >
                <Text
                  className={`text-caption font-medium text-fg-subtle ${colIndex === config.length - 1 ? 'text-right' : 'text-left'}`}
                  numberOfLines={1}
                >
                  {isNarrow && col.short ? col.short : col.name}
                </Text>
              </View>
            ))}
          </View>

          {filteredResults.map((result, index) => {
            const finalBorderClass = finalBorderClasses[index]
            const rowClass = getRowClasses({ result, command, names, isNamesFilterEnabled, isFinal })
            const getValue = (prop?: string) =>
              (result as LeadQualItem | LeadQualResultItem | LeadFinalsItem | BoulderQualItem | BoulderFinalItem)[
                prop as Exclude<keyof typeof result, 'isHighlighted'>
              ]
            const rowState = rowClass.includes('bg-highlight')
              ? ', свой'
              : rowClass.includes('bg-live-soft')
                ? isFinal
                  ? ', призёр'
                  : ', прошёл дальше'
                : ''
            const rowLabel =
              config.map((col) => `${getSpokenColName(col)} ${getSpokenValue(getValue(col.prop))}`).join(', ') + rowState

            return (
              <View
                key={`${result.name}-${index}`}
                className={`flex-row border-b border-surface ${finalBorderClass}${rowClass}`}
                accessible
                accessibilityLabel={rowLabel}
              >
                {config.map((col, colIndex) => {
                  const value = (
                    result as LeadQualItem | LeadQualResultItem | LeadFinalsItem | BoulderQualItem | BoulderFinalItem
                  )[col.prop as Exclude<keyof typeof result, 'isHighlighted'>]
                  const isBoulderCell = value.includes('/') && !SPECIAL_STATUSES.includes(value.toLowerCase())
                  return (
                    <View
                      key={`${col.id}-${colIndex}`}
                      className={getCellPadding(colIndex, config.length)}
                      style={getColStyle(col.prop, isNarrow, fontScale)}
                    >
                      {isBoulderCell ? (
                        <BoulderCell value={value} />
                      ) : (
                        <Text
                          style={TABULAR_NUMS}
                          className={`text-caption font-medium ${SECONDARY_PROPS.includes(col.prop as string) ? 'text-fg-subtle' : 'text-fg'}${colIndex === config.length - 1 ? ' text-right' : ''}`}
                          numberOfLines={WRAPPED_PROPS.includes(col.prop as string) ? 0 : 1}>
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
            <View className="py-1 border-b border-line-subtle">
              <Text className="text-caption text-center text-fg-subtle">-</Text>
            </View>
          )}
        </View>
        </ScrollView>

        {isLoading && (
          <View
            className="absolute inset-0 bg-surface/80 items-center justify-center py-4"
            accessibilityRole="progressbar"
            accessibilityLabel="Загрузка результатов"
            accessibilityLiveRegion="polite"
          >
            <ActivityIndicator color={iconColors.subtle} />
            <Text className="text-body-sm text-fg-subtle font-medium mt-2">Загрузка результатов...</Text>
          </View>
        )}

        {error && (
          <View
            className="absolute inset-0 bg-danger/95 items-center justify-center p-4"
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            <Text className="text-white text-body font-semibold mb-2">Ошибка загрузки</Text>
            <Text className="text-body-sm text-white text-center">{error}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
