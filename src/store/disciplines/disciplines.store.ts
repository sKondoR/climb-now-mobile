import { makeAutoObservable } from 'mobx'
import { QueryClient } from '@tanstack/react-query'

import type { Discipline } from '@/shared/types/disciplines'
import { fetchResults, patchEvent } from '@/shared/services'
import { MIN_URL_CODE_LENGTH } from '@/shared/constants'
import type { FormStore } from '@/store/form/form.store'
import type { EventsStore } from '@/store/events/events.store'

const getSuffixes = (name?: string) => {
  const suffixes = ['']
  if (name === undefined) {
    return suffixes
  }
  const lowercased = name.toLowerCase()
  if (lowercased.includes('всероссийские')) {
    suffixes.push('_vs')
  }
  if (lowercased.includes('чемпионат')) {
    suffixes.push('_ch')
  }
  if (lowercased.includes('первенство')) {
    suffixes.push('_perv')
  }
  return suffixes
}

export class DisciplinesStore {
  private queryClient: QueryClient
  private formStore: FormStore
  private eventsStore: EventsStore

  groupsData: Discipline[] | null = null
  isGroupsLoading: boolean = false
  groupsError: string | null = null

  // formStore/eventsStore передаются явно вместо импорта singleton'а rootStore — тот сам
  // создаёт DisciplinesStore, и обратный импорт замкнул бы require cycle.
  constructor(queryClient: QueryClient, formStore: FormStore, eventsStore: EventsStore) {
    this.queryClient = queryClient
    this.formStore = formStore
    this.eventsStore = eventsStore
    makeAutoObservable(this)
  }

  // В отличие от веб-версии, здесь нет адресной строки для синхронизации code —
  // deep linking с предзаполненным code/names обрабатывает FormStore.loadFromUrl (см. 2.5 плана миграции).
  async fetchGroups(code: string, name?: string) {
    this.setGroupsData(null)
    this.setGroupsError(null)
    if (code?.length < MIN_URL_CODE_LENGTH) {
      this.setIsGroupsLoading(false)
      return
    }
    this.setIsGroupsLoading(true)

    const suffixes = getSuffixes(name)
    let data = null
    let usedCode = code

    try {
      for (const suffix of suffixes) {
        const currentCode = code + suffix
        try {
          data = await fetchResults(currentCode)
          if (data) {
            usedCode = currentCode
            break
          }
        } catch (error) {
          console.log(error)
          continue
        }
      }

      this.setGroupsData(data)
      if (data && usedCode !== code) {
        this.formStore.setCode(usedCode)
        const event = this.eventsStore.events.find((ev) => ev.link === code)
        if (event) {
          patchEvent(event.id, usedCode)
        }
      }
    } catch (error) {
      this.setGroupsError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      this.setIsGroupsLoading(false)
    }
  }

  refetchGroups() {
    this.queryClient.refetchQueries({ queryKey: ['groups'] })
  }

  invalidateGroups() {
    this.queryClient.invalidateQueries({ queryKey: ['groups'] })
  }

  setGroupsData(data: Discipline[] | null) {
    this.groupsData = data
  }

  setIsGroupsLoading(enabled: boolean) {
    this.isGroupsLoading = enabled
  }

  setGroupsError(error: string | null) {
    this.groupsError = error
  }

  reset() {
    this.setGroupsData(null)
    this.setIsGroupsLoading(false)
    this.setGroupsError(null)
  }
}
