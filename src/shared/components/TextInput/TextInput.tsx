import { ReactNode, useState } from 'react'
import { Text, TextInput as RNTextInput, View } from 'react-native'

import { useDebounce } from '@/shared/hooks/useDebounce'
import ShareNamesBtn from '../ShareNamesBtn/ShareNamesBtn'
import IconButton from '../IconButton/IconButton'
import { useIconColors } from '@/shared/theme'

interface TextInputProps {
  value: string
  onChange: (names: string) => void
  placeholder?: string
  label?: string
  dataLabel?: string
  debounceDelay?: number
  // Кнопка-иконка справа от подписи (переключатель команда/фамилии)
  labelAction?: ReactNode
}

export const TextInput = ({
  value = '',
  onChange = () => {},
  placeholder = '',
  label = '',
  dataLabel = '',
  debounceDelay = 800,
  labelAction,
}: TextInputProps) => {
  const [text, setText] = useState(value)
  const [isOpened, setIsOpened] = useState(false)
  const iconColors = useIconColors()

  const debouncedOnChange = useDebounce(onChange, debounceDelay)

  const handleChangeText = (newValue: string) => {
    setText(newValue)
    debouncedOnChange(newValue)
  }

  return (
    <View className="w-full">
      {(label || labelAction) && (
        <View className="flex-row items-center mb-2 min-h-5">
          <Text
            className="flex-1 text-body-sm font-medium text-fg-muted"
            importantForAccessibility="no"
            accessibilityElementsHidden
          >
            {label}
            {dataLabel ? <Text className="font-normal text-fg-subtle"> (например: {dataLabel})</Text> : null}
          </Text>
          {labelAction ? <View className="flex-row -my-3.5 -mr-3">{labelAction}</View> : null}
        </View>
      )}
      <View className="relative flex-row items-start">
        <RNTextInput
          value={text}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={iconColors.placeholder}
          accessibilityLabel={label || placeholder}
          accessibilityHint={dataLabel ? `фамилии через запятую, например: ${dataLabel}` : undefined}
          multiline={isOpened}
          numberOfLines={isOpened ? 4 : 1}
          className="flex-1 min-h-12 px-3 py-3 pr-24 border border-line rounded-md text-body text-fg bg-surface"
        />
        <View className="absolute right-0 top-0 flex-row">
          <IconButton
            icon={isOpened ? 'compress' : 'expand'}
            label={isOpened ? 'Свернуть поле' : 'Развернуть поле'}
            color={iconColors.subtle}
            expanded={isOpened}
            onPress={() => setIsOpened((prev) => !prev)}
          />
          <ShareNamesBtn />
        </View>
      </View>
    </View>
  )
}

export default TextInput
