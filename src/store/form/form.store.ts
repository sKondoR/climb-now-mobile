import { makeAutoObservable, runInAction } from 'mobx'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Linking from 'expo-linking'

import { DEFAULT_TEAM } from '@/shared/constants'

const STORAGE_KEY = 'climbnow-data'

export class FormStore {
  code: string = ''
  command: string = DEFAULT_TEAM
  isCommandFilterEnabled: boolean = false
  names: string = ''
  isNamesFilterEnabled: boolean = false
  isOnlyOnline: boolean = false

  constructor() {
    makeAutoObservable(this)
    this.loadFromStorage()
    this.loadFromUrl()
  }

  setCode(code: string) {
    this.code = code
  }

  // Заменяет web-версию, читавшую ?names= из window.location: здесь это deep link
  // (climbnow://... или https://climbnow.ru/...), которым приложение было открыто.
  // code сюда намеренно не попадает — в мобильном приложении нет адресной строки,
  // и code живёт только как поле стора (устанавливается через форму, см. setCode).
  async loadFromUrl() {
    const initialUrl = await Linking.getInitialURL()
    if (initialUrl) {
      this.applyUrl(initialUrl)
    }
  }

  private applyUrl(url: string) {
    const { queryParams } = Linking.parse(url)
    const names = queryParams?.names
    if (typeof names === 'string' && names) {
      runInAction(() => {
        this.isNamesFilterEnabled = true
        this.names = names
      })
    }
  }

  // Ловит deep link, полученный, пока приложение уже открыто (initial URL покрывает только холодный старт).
  subscribeToIncomingLinks() {
    const subscription = Linking.addEventListener('url', ({ url }) => this.applyUrl(url))
    return () => subscription.remove()
  }

  async saveToStorage() {
    try {
      const data = {
        command: this.command,
        names: this.names,
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to AsyncStorage:', error)
    }
  }

  async loadFromStorage() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        runInAction(() => {
          this.command = data.command ?? DEFAULT_TEAM
          this.names = data.names ?? ''
        })
      }
    } catch (error) {
      console.error('Failed to load from AsyncStorage:', error)
      await AsyncStorage.removeItem(STORAGE_KEY)
    }
  }

  setCommand(command: string) {
    this.command = command
    this.saveToStorage()
  }
  setIsCommandFilterEnabled(enabled: boolean) {
    this.isCommandFilterEnabled = enabled
  }
  setNames(names: string) {
    this.names = names
    this.saveToStorage()
  }
  setIsNamesFilterEnabled(enabled: boolean) {
    this.isNamesFilterEnabled = enabled
  }
  setIsOnlyOnline(enabled: boolean) {
    this.isOnlyOnline = enabled
  }
  reset() {
    this.code = ''
    this.command = DEFAULT_TEAM
    this.isCommandFilterEnabled = false
    this.names = ''
    this.isNamesFilterEnabled = false
    this.isOnlyOnline = false
    this.saveToStorage()
  }
}
