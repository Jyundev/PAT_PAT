export const diaryKeys = {
  // 1. 모든 일기 관련 데이터의 최상위 루트
  all: ['diary'] as const,

  // 2. 일기 상세 (상세 페이지용)
  details: () => [...diaryKeys.all, 'detail'] as const,
  detail: (id: string) => [...diaryKeys.details(), id] as const,

  // 3. 일기 목록/아카이브 (검색, 월별 조회용)
  lists: () => [...diaryKeys.all, 'list'] as const,
  list: (filters: { month?: string; q?: string }) =>
    [...diaryKeys.lists(), filters] as const,
};
