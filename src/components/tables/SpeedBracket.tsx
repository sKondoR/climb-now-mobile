import { Text, View } from 'react-native'

import { getRowClasses } from './tables.utils'

import { COMMAND_COL, NAME_COL } from '@/shared/tables.configs'
import { SpeedFinalItem } from '@/shared/types'

interface SpeedBracketProps {
  results: SpeedFinalItem[]
  command: string
  isNamesFilterEnabled: boolean
  names: string
}

const TABULAR_NUMS = { fontVariant: ['tabular-nums' as const] }
const CELL = 'px-1 py-1 justify-center'
// Как в основной таблице: заголовок («команда») в одну строку, при нехватке места шрифт сжимается
const HEADER_TEXT_PROPS = { numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.7 }

// Сетку-дерево не рисуем: на телефоне четыре колонки раундов не помещаются.
// Раунды по порядку (1/8, 1/4, полуфинал, финал) — друг под другом, каждый забег — своя пара строк
export default function SpeedBracket({ results, command, isNamesFilterEnabled, names }: SpeedBracketProps) {
  const rounds = [...new Set(results.map((result) => result.round))]

  return (
    <View className="gap-4">
      {rounds.map((round) => {
        const roundResults = results.filter((result) => result.round === round)
        const isFinal = round === 'Финал'
        const heats = [...new Set(roundResults.map((result) => result.heat))]
        return (
          <View key={round}>
            <Text className="px-1 text-body font-semibold text-accent-soft-fg mb-1" accessibilityRole="header">{round}</Text>
            {/* Шапку скринридер пропускает: строки озвучиваются целиком */}
            <View className="flex-row border-b border-line" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              {isFinal && <Text className={`${CELL} w-12 text-caption font-medium text-fg-subtle`} {...HEADER_TEXT_PROPS}>место</Text>}
              <Text className={`${CELL} flex-1 text-caption font-medium text-fg-subtle`} {...HEADER_TEXT_PROPS}>{NAME_COL}</Text>
              <Text className={`${CELL} w-16 text-caption font-medium text-fg-subtle`} {...HEADER_TEXT_PROPS}>{COMMAND_COL}</Text>
              <Text className={`${CELL} w-16 text-caption font-medium text-fg-subtle text-right`} {...HEADER_TEXT_PROPS}>время</Text>
            </View>
            {heats.map((heat) => (
              // Между забегами — зазор
              <View key={heat} className="mb-3">
                {/* В финале победитель забега — выше, как на пьедестале */}
                {roundResults
                  .filter((result) => result.heat === heat)
                  .sort((a, b) => (isFinal && a.rank && b.rank ? Number(a.rank) - Number(b.rank) : 0))
                  .map((result) => {
                    // Зелёным — только призёры финала: победителей забегов не красим, их время и так жирное
                    const rowClass = getRowClasses({
                      result: { ...result, isHighlighted: false },
                      command,
                      names,
                      isNamesFilterEnabled,
                      isFinal,
                    })
                    const isOwn = rowClass.includes('bg-highlight')
                    const rowState = isOwn ? ', свой' : rowClass.includes('bg-live-soft') ? ', призёр' : ''
                    const rowLabel =
                      `${isFinal ? `место ${result.rank || 'нет'}, ` : ''}${result.name}, команда ${result.command || 'нет'}, ` +
                      `время ${result.score || 'нет'}${result.isHighlighted ? ', победитель забега' : ''}${rowState}`
                    return (
                      <View
                        key={result.name}
                        className={`flex-row border-b border-surface ${rowClass || 'bg-surface-muted/50'}`}
                        accessible
                        accessibilityLabel={rowLabel}
                      >
                        {isFinal && (
                          <Text style={TABULAR_NUMS} className={`${CELL} w-12 text-caption font-medium text-fg`}>
                            {result.rank}
                          </Text>
                        )}
                        <Text className={`${CELL} flex-1 text-caption text-fg ${isOwn ? 'font-bold' : 'font-medium'}`}>
                          {result.name}
                        </Text>
                        <Text
                          className={`${CELL} w-16 text-caption font-medium ${rowClass ? 'text-fg-muted' : 'text-fg-subtle'}`}
                          numberOfLines={1}
                        >
                          {result.command}
                        </Text>
                        {/* Победителя забега видно не только по цвету: его время жирное */}
                        <Text
                          style={TABULAR_NUMS}
                          className={`${CELL} w-16 text-caption text-fg text-right ${result.isHighlighted ? 'font-bold' : 'font-medium'}`}
                          numberOfLines={1}
                        >
                          {result.score}
                        </Text>
                      </View>
                    )
                  })}
              </View>
            ))}
          </View>
        )
      })}
    </View>
  )
}
