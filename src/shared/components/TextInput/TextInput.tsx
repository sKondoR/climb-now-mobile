import { useState } from 'react'
import { Pressable, Text, TextInput as RNTextInput, View } from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

import { useDebounce } from '@/shared/hooks/useDebounce'
import ShareNamesBtn from '../ShareNamesBtn/ShareNamesBtn'

interface TextInputProps {
  value: string
  onChange: (names: string) => void
  placeholder?: string
  label?: string
  dataLabel?: string
  debounceDelay?: number
}

export const TextInput = ({
  value = '',
  onChange = () => {},
  placeholder = '',
  label = '',
  dataLabel = '',
  debounceDelay = 800,
}: TextInputProps) => {
  const [text, setText] = useState(value)
  const [isOpened, setIsOpened] = useState(false)

  const debouncedOnChange = useDebounce(onChange, debounceDelay)

  const handleChangeText = (newValue: string) => {
    setText(newValue)
    debouncedOnChange(newValue)
  }

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
          {dataLabel ? <Text className="text-xs text-gray-500"> (например: {dataLabel})</Text> : null}
        </Text>
      )}
      <View className="relative flex-row items-start">
        <RNTextInput
          value={text}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          multiline={isOpened}
          numberOfLines={isOpened ? 4 : 1}
          className="flex-1 px-3 py-2 pr-16 border border-gray-300 rounded-md text-base"
        />
        <Pressable onPress={() => setIsOpened((prev) => !prev)} className="absolute right-9 top-1 p-2">
          <FontAwesome6 name={isOpened ? 'compress' : 'expand'} solid size={14} color="#6b7280" />
        </Pressable>
        <View className="absolute right-1 top-1">
          <ShareNamesBtn />
        </View>
      </View>
    </View>
  )
}

export default TextInput
