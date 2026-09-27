import { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput as RNTextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

import { Item } from './Autocomplete.types'
import BaseTemplate from './BaseTemplate'
import IconButton from '../IconButton/IconButton'
import { useIconColors } from '@/shared/theme'

type RenderItem<T extends Item = string | Record<string, unknown>> = (item: T, value: T | null) => ReactNode

interface AutocompleteProps<T extends Item = string | Record<string, unknown>> {
  value: T | null
  onChange: (value: T | null) => void
  placeholder?: string
  data: T[]
  label?: string
  dataLabel?: string
  property?: keyof T | string
  renderItem?: RenderItem<T>
  isLoading?: boolean
  // Кнопка-иконка справа от подписи (ссылка на сайт ФСР, переключатель команда/фамилии)
  labelAction?: ReactNode
}

function getItemValue<T extends Item>(item: T, prop: keyof T | string): string {
  if (prop && item && typeof item === 'object' && prop in item) {
    return String(item[prop as keyof T])
  }
  return typeof item === 'object' ? JSON.stringify(item) : String(item)
}

// Выбор из списка — нижняя панель (bottom sheet) со своим полем поиска, а не выпадающий
// список под полем: на телефоне клавиатура и выпадающий список не помещаются одновременно,
// а панель не зависит от положения поля на экране и поворота. Ввести значение вручную
// можно и без списка (пока он грузится или если не загрузился).
export const Autocomplete = <T extends Item = string>({
  value,
  onChange,
  placeholder = '',
  data = [],
  label = '',
  dataLabel = '',
  property = '',
  renderItem,
  isLoading = false,
  labelAction,
}: AutocompleteProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  // true сразу после открытия — показывает весь список; после ввода список фильтруется по value.
  const [showAll, setShowAll] = useState(true)
  const { height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const iconColors = useIconColors()
  // Высота клавиатуры отслеживается вручную: на Android (edge-to-edge, SDK 57) окно под
  // клавиатуру не сжимается и KeyboardAvoidingView не работает — без отступа клавиатура
  // перекрывала низ панели и список нельзя было докрутить до конца.
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (!isOpen) return
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvent, (event) => setKeyboardHeight(event.endCoordinates.height))
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0))
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [isOpen])

  const getTemplate = (item: T) =>
    renderItem ? renderItem(item, value) : BaseTemplate(item as unknown as string, value as unknown as string)

  const filteredByValue = useMemo(() => {
    if (!value) return data
    const textValue = getItemValue(value, property).toLowerCase()
    return data.filter((item) => getItemValue(item, property).toLowerCase().includes(textValue))
  }, [value, data, property])

  const filteredData = showAll ? data : filteredByValue
  const visibleValue = value ? getItemValue(value, property) : ''

  const open = () => {
    setShowAll(true)
    setKeyboardHeight(0)
    setIsOpen(true)
  }
  const close = () => setIsOpen(false)

  const handleChangeText = (text: string) => {
    onChange(text as unknown as T)
    setShowAll(false)
  }

  const handleSelect = (item: T) => {
    const newValue = property && typeof item === 'object' && property in item ? item[property as keyof T] : item
    onChange(newValue as T)
    close()
  }

  const renderEmpty = () => (
    <View className="px-4 py-6 items-center">
      {isLoading ? (
        <>
          <ActivityIndicator color={iconColors.subtle} />
          <Text className="text-body-sm text-fg-subtle mt-2">список загружается</Text>
        </>
      ) : (
        <Text className="text-body-sm text-fg-muted text-center">
          {data.length ? 'ничего не найдено' : 'списка нет'} — введённое значение будет использовано как есть
        </Text>
      )}
    </View>
  )

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

      <Pressable
        onPress={open}
        accessibilityRole="combobox"
        accessibilityLabel={`${label || placeholder}: ${visibleValue || 'не выбрано'}`}
        accessibilityHint="открывает список для выбора или ввода"
        accessibilityState={{ expanded: isOpen }}
        className="flex-row items-center min-h-12 pl-3 border border-line rounded-md bg-surface active:opacity-70"
      >
        <Text className={`flex-1 text-body ${visibleValue ? 'text-fg' : 'text-fg-subtle'}`} numberOfLines={1}>
          {visibleValue || placeholder}
        </Text>
        <View className="w-12 items-center">
          {isLoading && !data.length ? (
            <ActivityIndicator size="small" color={iconColors.subtle} />
          ) : (
            <FontAwesome6 name="caret-down" solid size={16} color={iconColors.subtle} />
          )}
        </View>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
        <View className="flex-1">
          {/* Затемнение — отдельный слой, а не обёртка панели: Pressable объединяет потомков
              в один элемент для скринридера, и пункты списка стали бы недоступны. */}
          <Pressable
            className="absolute inset-0 bg-black/40"
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Закрыть список"
          />
          <View className="flex-1" pointerEvents="box-none" />
          <View
            accessibilityViewIsModal
            className="bg-surface rounded-t-3xl"
            style={{
              // С открытой клавиатурой панель может занять почти весь экран — иначе на список
              // над клавиатурой остаётся место на 2–3 строки.
              maxHeight: keyboardHeight ? windowHeight - insets.top - 16 : windowHeight * 0.85,
              paddingBottom: keyboardHeight || insets.bottom,
            }}
          >
            <View className="items-center pt-2" importantForAccessibility="no-hide-descendants">
              <View className="w-8 h-1 rounded-full bg-line" />
            </View>

            <View className="flex-row items-center pl-4 pr-1">
              <Text className="flex-1 text-body font-semibold text-fg" accessibilityRole="header">
                {label}
              </Text>
              <IconButton icon="xmark" label="Готово" onPress={close} color={iconColors.muted} size={16} />
            </View>

            <View className="flex-row items-center mx-4 mb-2 min-h-12 pl-3 border border-line rounded-md bg-surface">
              <RNTextInput
                value={visibleValue}
                onChangeText={handleChangeText}
                onSubmitEditing={close}
                placeholder={placeholder}
                placeholderTextColor={iconColors.subtle}
                accessibilityLabel={label || placeholder}
                accessibilityHint={dataLabel ? `например: ${dataLabel}` : undefined}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                className="flex-1 py-2 text-body text-fg"
              />
              {visibleValue ? (
                <IconButton
                  icon="circle-xmark"
                  label="Очистить"
                  onPress={() => handleChangeText('')}
                  color={iconColors.subtle}
                  size={16}
                />
              ) : null}
            </View>

            <FlatList
              data={filteredData}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item, index) => (typeof item === 'object' ? JSON.stringify(item) : String(item)) + index}
              ListEmptyComponent={renderEmpty}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  className="border-b border-line-subtle active:opacity-70"
                  accessibilityRole="button"
                  accessibilityState={{ selected: getItemValue(item, property) === visibleValue }}
                >
                  {getTemplate(item)}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default Autocomplete
