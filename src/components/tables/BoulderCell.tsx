import { memo } from 'react'
import { View, Text } from 'react-native'

const TABULAR_NUMS = { fontVariant: ['tabular-nums' as const] }
// Плашка до 28dp шириной: на узком экране колонка трассы уже — плашка сжимается вместе с ней
const PLATE = 'self-center w-full max-w-7 min-h-8'
const HALF = 'flex-1 text-caption font-bold text-center text-boulder-fg'

interface BoulderCellProps {
  value: string
}

// Значение — «попытки на топ/попытки на зону»; пробел — не пролезено
const BoulderCell = memo(({ value }: BoulderCellProps) => {
  const [top, zone] = value.split('/')
  const hasTop = top !== ' '
  const hasZone = zone !== ' '
  if (!hasTop && !hasZone) {
    return <View className={`${PLATE} bg-boulder-empty`} />
  }
  return (
    <View className={PLATE}>
      <Text style={TABULAR_NUMS} className={`${HALF} ${hasTop ? 'bg-boulder-top' : 'bg-boulder-blank'}`}>
        {hasTop ? top : ''}
      </Text>
      <Text style={TABULAR_NUMS} className={`${HALF} ${hasTop ? 'bg-boulder-top-zone' : 'bg-boulder-zone'}`}>
        {hasZone ? zone : ''}
      </Text>
    </View>
  )
})

BoulderCell.displayName = 'BoulderCell'

export default BoulderCell
