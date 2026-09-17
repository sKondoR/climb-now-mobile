import { makeAutoObservable, runInAction } from 'mobx'
import { QueryClient, QueryObserver } from '@tanstack/react-query'

import { fetchEvents } from '@/shared/services'
import type { EventResponse } from '@/shared/types/api.types'

export class EventsStore {
  private queryClient: QueryClient
  events: EventResponse[] = []
  isEventsLoading: boolean = false
  error: string | null = null

  private EventsQueryObserver: QueryObserver<EventResponse[], unknown>

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
    makeAutoObservable(this)

    this.EventsQueryObserver = new QueryObserver<EventResponse[], unknown>(this.queryClient, {
      queryKey: ['events'],
      queryFn: fetchEvents,
      staleTime: 1000 * 60 * 60 * 24, // day
      retry: 3,
      retryDelay: 500
    })

    this.setupQuerySubscription()
  }

  private setupQuerySubscription() {
    this.EventsQueryObserver.subscribe((result) => {
      runInAction(() => {
        // Сортируем события по дате начала
        this.events = result?.data?.sort((a, b) => {
          const dateA = a.startdate || a.date
          const dateB = b.startdate || b.date
          return dateB.localeCompare(dateA)
        }) || []
        this.isEventsLoading = false
        this.error = result.error instanceof Error ? result.error.message : null
      })
    })
  }

  async refetchEvents() {
    await this.queryClient.refetchQueries({ queryKey: ['events'] })
  }

  invalidateEvents() {
    this.queryClient.invalidateQueries({ queryKey: ['events'] })
  }

  destroy() {
    this.EventsQueryObserver.destroy()
  }
}
