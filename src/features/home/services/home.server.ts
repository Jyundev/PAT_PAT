import 'server-only';

import { Errors, mapSupabaseError } from '@/lib';
import { createServerSupabaseClientReadOnly } from '@/utils/supabase/server';
import { HomeSummarySchema } from '../schemas/home.schema';

export async function getHomeSummaryServer(): Promise<HomeSummary> {
  const supabase = await createServerSupabaseClientReadOnly();

  const { data, error: authErr } = await supabase.auth.getUser();
  const authUser = data.user;
  if (authErr || !authUser) throw Errors.unauthorized();

  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('user_id, auth_user_id, email, nickname')
    .eq('auth_user_id', authUser.id)
    .is('deleted_at', null)
    .single();

  if (profileErr) throw mapSupabaseError(profileErr);
  if (!profile) throw Errors.notFound('User profile not found');

  // 1. 기준 날짜 설정
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const mondayIso = monday.toISOString();
  // 한국 시간 기준(KST) YYYY-MM-DD 추출을 위한 보정 (필요 시)
  const todayKst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // 2. 비동기 작업을 병렬로 실행 (속도 향상)
  const [starRes, diaryWeekRes, diaryTodayRes] = await Promise.all([
    // 이번 주 별 개수
    supabase
      .from('star')
      .select('star_id', { count: 'exact', head: true })
      .gte('created_at', mondayIso)
      .eq('auth_user_id', authUser.id),

    // 이번 주 일기 개수
    supabase
      .from('diary')
      .select('diary_id', { count: 'exact', head: true })
      .gte('created_at', mondayIso)
      .eq('auth_user_id', authUser.id),

    // 오늘 일기 작성 여부
    supabase
      .from('diary')
      .select('diary_id')
      .eq('entry_date', todayKst) // entry_date가 날짜 형식이면 KST 기준이 안전
      .eq('auth_user_id', authUser.id)
      .is('deleted_at', null),
  ]);

  // 3. 에러 핸들링
  if (starRes.error) throw mapSupabaseError(starRes.error);
  if (diaryWeekRes.error) throw mapSupabaseError(diaryWeekRes.error);
  if (diaryTodayRes.error) throw mapSupabaseError(diaryTodayRes.error);

  // 4. 데이터 결과 조합
  const homeData = {
    profile: { nickname: profile.nickname, email: profile.email },
    starCount: starRes.count ?? 0,
    diaryCount: diaryWeekRes.count ?? 0,
    isDiary: (diaryTodayRes.data?.length ?? 0) > 0,
    diaryId: diaryTodayRes.data?.[0]?.diary_id,
  };

  // 런타임 검증 (DB 데이터 이상/컬럼 타입 이상 즉시 감지)
  return HomeSummarySchema.parse(homeData);
}
