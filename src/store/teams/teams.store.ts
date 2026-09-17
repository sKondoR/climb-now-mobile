import { makeAutoObservable, runInAction } from 'mobx'
import { QueryClient, QueryObserver } from '@tanstack/react-query'

import { fetchTeams } from '@/shared/services'

export class TeamsStore {
  private queryClient: QueryClient
  teams: string[] = []
  isTeamsLoading: boolean = false
  error: string | null = null

  private teamsQueryObserver: QueryObserver<string[], Error>

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
    makeAutoObservable(this)

    this.teamsQueryObserver = new QueryObserver<string[], Error>(this.queryClient, {
      queryKey: ['teams'],
      queryFn: fetchTeams,
      staleTime: 1000 * 60 * 60 * 24 * 7, // week
      retry: 3,
      retryDelay: 500
    })

    this.setupQuerySubscription()
  }

  private setupQuerySubscription() {
    this.teamsQueryObserver.subscribe((result) => {
      runInAction(() => {
        this.teams = result?.data || []
        this.isTeamsLoading = false
        this.error = result.error?.message || null
      })
    })
  }

  async refetchTeams() {
    await this.queryClient.refetchQueries({ queryKey: ['teams'] })
  }

  invalidateTeams() {
    this.queryClient.invalidateQueries({ queryKey: ['teams'] })
  }

  destroy() {
    this.teamsQueryObserver.destroy()
  }

  reset() {
    this.teams = []
    this.isTeamsLoading = false
    this.error = null
  }
}
