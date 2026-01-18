'use client';

import { useQuery } from '@tanstack/react-query';
import { diaryKeys } from '../queries/diaries';
import { getDiaryClient } from '../services/diary.client';

export function useDiaryDetail(diaryId?: string) {
  return useQuery({
    queryKey: diaryKeys.detail(diaryId ?? ''),
    queryFn: () => getDiaryClient(diaryId!),
    // diaryId가 없을 때 요청 막기
    enabled: !!diaryId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    // 상세 화면에서 깜빡임 방지
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
