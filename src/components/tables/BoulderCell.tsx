import { memo } from 'react'
import { View, Text } from 'react-native'

const TABULAR_NUMS = { fontVariant: ['tabular-nums' as const] }

interface BoulderCellProps {
  value: string
}

const BoulderCell = memo(({ value }: BoulderCellProps) => {
  const [val1, val2] = value.split('/')
  return (
    <View className="bg-boulder-empty">
      <Text style={TABULAR_NUMS} className={`text-caption text-center leading-tight ${val1 !== ' ' ? 'bg-boulder text-boulder-fg' : ''}`}>
        {val1}
      </Text>
      <Text style={TABULAR_NUMS} className={`text-caption text-center leading-tight ${val2 !== ' ' ? 'bg-boulder text-boulder-fg' : ''}`}>
        {val2}
      </Text>
    </View>
  )
})

BoulderCell.displayName = 'BoulderCell'

export default BoulderCell
