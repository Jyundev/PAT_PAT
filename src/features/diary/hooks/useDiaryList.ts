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
    // 쿼리 키에 상태를 집어넣음 -> 상태가 바뀌면 자동으로 다시 fetch!
    queryKey: ['diary', 'list', { month: selectedMonth, q: debouncedQ }],
    queryFn: async () => {
      const res = await getDiariesAction({
        month: selectedMonth,
        q: debouncedQ,
      });

      //  unwrap 패턴: 실패 시 에러를 throw하여 Query의 error 상태로 보냄
      if (!res.ok) {
        // res에는 message와 requestId가 포함되어 있어 디버깅에 용이함
        throw new Error(`[${res.code}] ${res.message} (ID: ${res.requestId})`);
      }

      return res.data;
    },
    staleTime: 1000 * 60, // 1분간은 신선하다고 가정 (서버 부하 감소)
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
