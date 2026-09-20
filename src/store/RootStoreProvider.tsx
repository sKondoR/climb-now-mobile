import { createContext, useContext, ReactNode, useEffect } from 'react'
import { AppState } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { focusManager, onlineManager } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

import { rootStore, RootStore } from './root.store'

const RootStoreContext = createContext<RootStore | undefined>(undefined)

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'climbnow-query-cache',
})

// Без этого React Query в React Native считает, что сеть есть всегда
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
)

export const RootStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    rootStore.formStore.loadFromUrl()
    return rootStore.formStore.subscribeToIncomingLinks()
  }, [])

  // В фоне опрос не идёт, при возврате устаревшие данные обновляются
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active')
    })
    return () => subscription.remove()
  }, [])

  return (
    <PersistQueryClientProvider
      client={rootStore.queryClient}
      persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <RootStoreContext.Provider value={rootStore}>{children}</RootStoreContext.Provider>
    </PersistQueryClientProvider>
  )
}

export const useRootStore = () => {
  const context = useContext(RootStoreContext)
  if (!context) {
    throw new Error('useRootStore must be used within a RootStoreProvider')
  }
  return context
}
