'use client';

import { getDiariesAction } from '@/features/diary/actions/diary.actions';
import { useDebouncedValue } from '@/shared/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

export function useDiaryList() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedMonth, setSelectedMonth] = useState<string>(todayMonth);
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const {
    data: diaryMonthData,
    isLoading: diaryMonthLoading,
    isError,
  } = useQuery({
    /**
     * 1. queryKey: 이 쿼리의 "주소"이자 "의존성 배열"
     * - 'diary', 'list'로 계층을 나누어 관리하면 나중에 'diary' 키만으로 전체 무효화가 가능하다.
     * - selectedMonth나 debouncedQ가 변경되면 TanStack Query가 이를 감지하고
     * 새로운 데이터를 자동으로 fetch한다. (useEffect를 직접 쓸 필요가 없는 이유다.)
     */
    queryKey: ['diary', 'list', { month: selectedMonth, q: debouncedQ }],

    /**
     * 2. queryFn: 실제 데이터를 가져오는 비동기 로직
     * - getDiariesAction(Server Action)을 호출하여 서버에서 데이터를 가져온다.
     */
    queryFn: async () => {
      const res = await getDiariesAction({
        month: selectedMonth,
        q: debouncedQ,
      });

      /**
       * 3. Unwrap 패턴 (에러 핸들링)
       * - Server Action은 HTTP 에러가 나도 throw를 하지 않고 응답 객체(ok: false)를 보낼 때가 많다.
       * - 여기서 직접 에러를 throw해줘야 TanStack Query가 "아, 실패했구나"라고 인식하여
       * 내부의 isError 상태를 true로 바꾸고, 지정된 횟수만큼 재시도(Retry)를 수행한다.
       */
      if (!res.ok) {
        throw new Error(`[${res.code}] ${res.message} (ID: ${res.requestId})`);
      }

      // 성공 시 실제 데이터만 반환하여 컴포넌트에서 쓰기 편하게 만든다.
      return res.data;
    },

    /**
     * 4. staleTime: 데이터가 "신선한" 상태로 유지되는 시간
     * - 이 시간(1분) 동안은 같은 키로 호출이 발생해도 네트워크 요청을 하지 않고 캐시를 쓴다.
     * - 0이면(기본값) 컴포넌트가 다시 보일 때마다 백그라운드 fetch가 일어나는데,
     * 1분으로 설정함으로써 서버 부하를 줄이고 사용자 경험을 매끄럽게 만든다.
     */
    staleTime: 1000 * 60,
  });
  return {
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    diaryMonthData,
    diaryMonthLoading,
    isError,
    q,
    setQ,
    view,
    setView,
  };
}
