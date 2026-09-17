import { createContext, useContext, ReactNode, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

import { rootStore, RootStore } from './root.store'

const RootStoreContext = createContext<RootStore | undefined>(undefined)

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'climbnow-query-cache',
})

export const RootStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    rootStore.formStore.loadFromUrl()
    return rootStore.formStore.subscribeToIncomingLinks()
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
