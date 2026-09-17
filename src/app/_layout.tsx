import '@/global.css'

import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { RootStoreProvider } from '@/store/RootStoreProvider'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootStoreProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </RootStoreProvider>
    </SafeAreaProvider>
  )
}
