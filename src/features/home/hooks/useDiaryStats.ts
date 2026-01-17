'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

interface DiaryStats {
  totalStars: number;
  totalWorries: number;
  recentDiaries: RecentDiary[];
  weeklyMood: string | null; // 이번 주 가장 많은 감정
}

interface RecentDiary {
  diary_id: number;
  diary_type: 'star' | 'worry';
  content: string;
  created_at: string;
  emotion_name?: string;
}

interface UseDiaryStatsReturn {
  stats: DiaryStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * 로그인한 사용자의 일기 통계를 가져오는 훅
 */
export function useDiaryStats(): UseDiaryStatsReturn {
  const { user, loading: authLoading } = useAuth({ required: true });
  const [stats, setStats] = useState<DiaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      setStats({
        totalStars: 0,
        totalWorries: 0,
        recentDiaries: [],
        weeklyMood: null,
      });

      // 2. 별(star) 개수 조회 - diary_type 컬럼이 없는 경우 대비
      let starCount = 0;
      try {
        const { count: starCountResult, error: starError } = await supabase
          .from('diary')
          .select('*', { count: 'exact', head: true })
          .eq('auth_user_id', user?.id)
          .eq('diary_type', 'star');

        if (starError) {
          // diary_type 컬럼이 없는 경우 또는 400 에러 (배포 환경 스키마 문제)
          if (
            starError.code === '42703' ||
            starError.message.includes('does not exist') ||
            starError.message === '' ||
            (starError as any).status === 400
          ) {
            console.warn(
              '[useDiaryStats] diary_type column not found, using fallback'
            );
            // diary_type 없이 전체 개수 조회
            const { count: totalCount, error: totalError } = await supabase
              .from('diary')
              .select('*', { count: 'exact', head: true })
              .eq('auth_user_id', user?.id);

            if (!totalError) {
              starCount = totalCount || 0;
            }
          } else {
            console.error('[useDiaryStats] star 조회 에러:', starError);
          }
        } else {
          starCount = starCountResult || 0;
        }
      } catch (err) {
        console.error('[useDiaryStats] star 조회 예외:', err);
      }

      // 3. 걱정(worry) 개수 조회 - diary_type 컬럼이 없는 경우 대비
      let worryCount = 0;
      try {
        const { count: worryCountResult, error: worryError } = await supabase
          .from('diary')
          .select('*', { count: 'exact', head: true })
          .eq('auth_user_id', user?.id)
          .eq('diary_type', 'worry');

        if (worryError) {
          // diary_type 컬럼이 없는 경우 또는 400 에러
          if (
            worryError.code === '42703' ||
            worryError.message.includes('does not exist') ||
            worryError.message === '' ||
            (worryError as any).status === 400
          ) {
            console.warn(
              '[useDiaryStats] diary_type column not found, skipping worry count'
            );
            worryCount = 0;
          } else {
            console.error('[useDiaryStats] worry 조회 에러:', worryError);
          }
        } else {
          worryCount = worryCountResult || 0;
        }
      } catch (err) {
        console.error('[useDiaryStats] worry 조회 예외:', err);
      }

      // 4. 최근 일기 5개 조회 - diary_type 컬럼이 없는 경우 대비
      let recentDiaries: RecentDiary[] = [];
      try {
        // 먼저 diary_type 포함해서 시도
        let selectFields = `
          diary_id,
          diary_type,
          content,
          created_at
        `;

        const { data: recentData, error: recentError } = await supabase
          .from('diary')
          .select(selectFields)
          .eq('auth_user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) {
          // diary_type 컬럼이 없는 경우 또는 400 에러
          if (
            recentError.code === '42703' ||
            recentError.message.includes('does not exist') ||
            recentError.message === '' ||
            (recentError as any).status === 400
          ) {
            console.warn(
              '[useDiaryStats] diary_type column not found, using fallback'
            );
            // diary_type 없이 조회
            const { data: recentDataFallback, error: recentErrorFallback } =
              await supabase
                .from('diary')
                .select('diary_id, content, created_at')
                .eq('auth_user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!recentErrorFallback && recentDataFallback) {
              recentDiaries = recentDataFallback.map((d: any) => ({
                diary_id: d.diary_id,
                diary_type: 'star' as const, // 기본값
                content: d.content || '',
                created_at: d.created_at,
                emotion_name: undefined,
              }));
            }
          } else {
            console.error('[useDiaryStats] 최근 일기 조회 에러:', recentError);
          }
        } else if (recentData) {
          recentDiaries = recentData.map((d: any) => ({
            diary_id: d.diary_id,
            diary_type: d.diary_type || 'star', // 기본값
            content: d.content || '',
            created_at: d.created_at,
            emotion_name: undefined,
          }));
        }
      } catch (err) {
        console.error('[useDiaryStats] 최근 일기 조회 예외:', err);
      }

      // 감정 분석은 일단 스킵 (테이블 구조 확인 후 추가)
      const weeklyMood: string | null = null;

      // 결과 설정
      setStats({
        totalStars: starCount,
        totalWorries: worryCount,
        recentDiaries,
        weeklyMood,
      });
    } catch (err) {
      console.error('[useDiaryStats] 예상치 못한 에러:', err);
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(new Error(errorMessage));
      // 에러가 발생해도 기본값으로 설정 (UI가 깨지지 않도록)
      setStats({
        totalStars: 0,
        totalWorries: 0,
        recentDiaries: [],
        weeklyMood: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  return {
    stats,
    loading: authLoading || loading,
    error,
    refetch: fetchStats,
  };
}
