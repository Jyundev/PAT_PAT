'use client';

import { useQuery } from '@tanstack/react-query';
import { homeKeys } from '../queries/summary,';
import { getHomeSummaryClient } from '../services/home.client';

export function useHomeSummary() {
  return useQuery({
    queryKey: homeKeys.summary(),
    queryFn: getHomeSummaryClient,

    staleTime: 1000 * 60 * 30, // 30분 동안 fresh로 취급 (refetch 억제)
    gcTime: 1000 * 60 * 60 * 6, // 6시간 동안 캐시 유지 (v5에서 cacheTime 대신 gcTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
