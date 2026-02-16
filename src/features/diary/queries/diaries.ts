export const diaryKeys = {
  /**
   * 1. 최상위 루트 키 (all)
   * - 일기와 관련된 모든 쿼리의 시작점이다.
   * - 사용자가 로그아웃하거나 모든 일기 데이터를 한 번에 새로고침(Invalidate)해야 할 때,
   * queryClient.invalidateQueries({ queryKey: diaryKeys.all }) 한 줄로 해결 가능하다.
   */
  all: ['diary'] as const,

  /**
   * 2. 상세 정보 계층 (details & detail)
   * - details(): 특정 ID와 상관없이 모든 '상세 보기' 쿼리를 그룹화한다.
   * 일기를 하나 수정했을 때, 모든 상세 페이지 캐시만 골라서 무효화하고 싶을 때 유용하다.
   * - detail(id): 특정 일기의 고유한 키다. ['diary', 'detail', '123'] 형태가 되어
   * 정확히 해당 일기의 데이터만 캐싱하고 식별한다.
   */
  details: () => [...diaryKeys.all, 'detail'] as const,
  detail: (id: string) => [...diaryKeys.details(), id] as const,

  /**
   * 3. 목록 및 아카이브 계층 (lists & list)
   * - lists(): 리스트 형태의 모든 쿼리(검색 결과, 월별 목록 등)를 그룹화한다.
   * - list(filters): 검색어나 선택된 달(month)에 따라 달라지는 동적인 키를 생성한다.
   * TanStack Query는 이 filters 객체의 내용을 비교하여 데이터의 신선도를 판단한다.
   */
  lists: () => [...diaryKeys.all, 'list'] as const,
  list: (filters: { month?: string; q?: string }) =>
    [...diaryKeys.lists(), filters] as const,
};
