'use client';

import { tagsKeys } from '@/features/diary/queries/tags';
import { useQuery } from '@tanstack/react-query';
import { getTagsClient } from '../services/tags.clieny';

export function useTags() {
  return useQuery({
    queryKey: tagsKeys.all,
    queryFn: getTagsClient,

    // tags는 자주 안 바뀌는 “준정적 데이터”라 길게 줘도 됨
    staleTime: 1000 * 60 * 30, // 30분 동안 fresh로 취급 (refetch 억제)
    gcTime: 1000 * 60 * 60 * 6, // 6시간 동안 캐시 유지 (v5에서 cacheTime 대신 gcTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
