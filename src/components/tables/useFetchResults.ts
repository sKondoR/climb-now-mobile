import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchResultsTable } from '@/shared/services'

interface UseResultsOptions {
  code: string
  isOnline: boolean
  subgroupLink?: string
}

export default function useFetchResults({ code, subgroupLink, isOnline }: UseResultsOptions) {
  const query = useQuery({
    queryKey: ['results', code, subgroupLink],
    queryFn: () => {
      if (!subgroupLink) {
        throw new Error('subgroupLink is required')
      }
      return fetchResultsTable(code, subgroupLink)
    },
    enabled: !!subgroupLink && isOnline,
    refetchInterval: isOnline ? 30000 : false, // Обновление каждые 30 секунд только при isOnline=true
    retry: 3,
    retryDelay: 1000,
  })

  // Для случая isOnline=false делаем только один запрос при монтировании компонента
  useEffect(() => {
    if (!isOnline && subgroupLink) {
      query.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, subgroupLink, query.refetch])

  if (query.error) {
    console.error('Error in useFetchResults:', query.error)
  }

  return {
    results: query.data?.data ?? [],
    isLead: query.data?.isLead ?? false,
    isQualResult: query.data?.isQualResult ?? false,
    isFinal: query.data?.isFinal ?? false,
    isBoulder: query.data?.isBoulder ?? false,
    isLoading: query.isLoading,
    error: query.error ? (query.error instanceof Error ? query.error.message : 'Unknown error') : null,
    refetch: query.refetch,
  }
}
