import { ReactNode, useMemo, useRef, useState } from 'react'
import { FlatList, Modal, Pressable, Text, TextInput as RNTextInput, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

import { Item } from './Autocomplete.types'
import BaseTemplate from './BaseTemplate'

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
}

interface DropdownLayout {
  top: number
  left: number
  width: number
}

function getItemValue<T extends Item>(item: T, prop: keyof T | string): string {
  if (prop && item && typeof item === 'object' && prop in item) {
    return String(item[prop as keyof T])
  }
  return typeof item === 'object' ? JSON.stringify(item) : String(item)
}

// Web-версия закрывала выпадающий список по document.addEventListener('mousedown', ...) —
// в RN для этого нет DOM-событий, поэтому список рендерится в Modal с Pressable-фоном (см. plans/migration-plan.md, Этап 3).
export const Autocomplete = <T extends Item = string>({
  value,
  onChange,
  placeholder = '',
  data = [],
  label = '',
  dataLabel = '',
  property = '',
  renderItem,
}: AutocompleteProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  // true после клика по стрелке — показывает весь список вместо отфильтрованного по введённому value.
  const [showAll, setShowAll] = useState(false)
  // Позиция списка считается от реального положения поля на экране, а не фиксированным
  // отступом — иначе список наезжает на инпут вместо того, чтобы встать под ним.
  const [dropdownLayout, setDropdownLayout] = useState<DropdownLayout | null>(null)
  const inputWrapperRef = useRef<View>(null)
  const { height: windowHeight } = useWindowDimensions()
  // На Android useWindowDimensions().height включает область под системной панелью
  // навигации (кнопки "назад"/"домой"), поэтому без вычитания insets.bottom список
  // рисуется под ней, а не над.
  const insets = useSafeAreaInsets()

  // При повороте экрана старые координаты (измеренные до поворота) больше не верны и список
  // может наложиться на другие элементы — проще закрыть его, чем показывать по неактуальной позиции.
  // Сброс делается прямо в рендере (а не в useEffect) по официальному паттерну React
  // "adjusting state when a prop changes" — react-compiler запрещает setState внутри эффекта.
  const [measuredForHeight, setMeasuredForHeight] = useState(windowHeight)
  if (windowHeight !== measuredForHeight) {
    setMeasuredForHeight(windowHeight)
    if (isOpen) setIsOpen(false)
    if (dropdownLayout) setDropdownLayout(null)
  }

  const measureAndOpen = () => {
    inputWrapperRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownLayout({ top: y + height + 4, left: x, width })
    })
    setIsOpen(true)
  }

  const getTemplate = (item: T) =>
    renderItem ? renderItem(item, value) : BaseTemplate(item as unknown as string, value as unknown as string)

  const filteredByValue = useMemo(() => {
    if (!value) return []
    const textValue = getItemValue(value, property).toLowerCase()
    return data.filter((item) => getItemValue(item, property).toLowerCase().includes(textValue))
  }, [value, data, property])

  const filteredData = showAll ? data : filteredByValue

  const handleChangeText = (text: string) => {
    onChange(text as unknown as T)
    setShowAll(false)
    measureAndOpen()
  }

  const handleOpen = () => {
    setShowAll(true)
    measureAndOpen()
  }

  const handleSelect = (item: T) => {
    const newValue = property && typeof item === 'object' && property in item ? item[property as keyof T] : item
    onChange(newValue as T)
    setShowAll(false)
    setIsOpen(false)
  }

  const visibleValue = value ? getItemValue(value, property) : ''

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
          {dataLabel ? <Text className="text-xs text-gray-500"> (например: {dataLabel})</Text> : null}
        </Text>
      )}
      <View ref={inputWrapperRef} className="relative flex-row items-center">
        <RNTextInput
          value={visibleValue}
          onChangeText={handleChangeText}
          onFocus={measureAndOpen}
          placeholder={placeholder}
          editable={!!data.length}
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 px-3 py-2 pr-9 border border-gray-300 rounded-md text-base"
        />
        <Pressable onPress={handleOpen} className="absolute right-2 p-2">
          <FontAwesome6 name={data.length ? 'caret-down' : 'spinner'} solid size={16} color="#6b7280" />
        </Pressable>
      </View>

      <Modal
        visible={isOpen && filteredData.length > 0 && !!dropdownLayout}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable className="flex-1" onPress={() => setIsOpen(false)}>
          {dropdownLayout && (
            <View
              style={{
                position: 'absolute',
                top: dropdownLayout.top,
                left: dropdownLayout.left,
                width: dropdownLayout.width,
                // Список растягивается вниз до отступа 16 (такого же, как px-4/pt-4 у
                // ScrollView в index.tsx), чтобы занимать весь доступный экран, а не только
                // высоту контента — вместо этого он получает собственный скролл через FlatList.
                maxHeight: windowHeight - insets.bottom - dropdownLayout.top,
              }}
              className="bg-white rounded-md shadow-lg border border-gray-300 overflow-hidden"
            >
              <FlatList
                data={filteredData}
                keyExtractor={(item, index) => (typeof item === 'object' ? JSON.stringify(item) : String(item)) + index}
                renderItem={({ item }) => (
                  <Pressable onPress={() => handleSelect(item)} className="border-b border-gray-200">
                    {getTemplate(item)}
                  </Pressable>
                )}
              />
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  )
}

export default Autocomplete
