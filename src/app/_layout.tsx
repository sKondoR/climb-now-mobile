import '@/global.css'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { RootStoreProvider } from '@/store/RootStoreProvider'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootStoreProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </RootStoreProvider>
    </SafeAreaProvider>
  )
}
