import { memo } from 'react'
import { View, Text } from 'react-native'

interface BoulderCellProps {
  value: string
}

const BoulderCell = memo(({ value }: BoulderCellProps) => {
  const [val1, val2] = value.split('/')
  return (
    <View className="bg-gray-200 items-center">
      <Text className={`flex-1 text-xs leading-tight ${val1 !== ' ' ? 'bg-red-300' : 'text-white/0'}`}>
        {val1 !== ' ' ? val1 : '-'}
      </Text>
      <Text className={`flex-1 text-xs leading-tight ${val2 !== ' ' ? 'bg-red-300' : 'text-white/0'}`}>
        {val2 !== ' ' ? val2 : '-'}
      </Text>
    </View>
  )
})

BoulderCell.displayName = 'BoulderCell'

export default BoulderCell
