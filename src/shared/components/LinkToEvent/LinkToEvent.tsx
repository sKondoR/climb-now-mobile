import { Pressable } from 'react-native'
import * as Linking from 'expo-linking'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

import { EXTERNAL_EVENT_BASE_URL } from '@/shared/constants'
import { sanitizeEventCode } from '@/shared/utils/forms.utils'

interface LinkToEventProps {
  code: string | null
}

export default function LinkToEvent({ code }: LinkToEventProps) {
  const sanitizedCode = sanitizeEventCode(code)
  if (!sanitizedCode) return null
  return (
    <Pressable
      onPress={() => Linking.openURL(`${EXTERNAL_EVENT_BASE_URL}${sanitizedCode}/index.html`)}
      className="absolute top-0 right-0 p-1"
    >
      <FontAwesome6 name="up-right-from-square" solid size={18} color="#14b8a6" />
    </Pressable>
  )
}
