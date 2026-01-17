import { AppError, Errors, jsonError, jsonOk, mapSupabaseError } from '@/lib';
import { createServerSupabaseClientReadOnly } from '@/utils/supabase/server';
import { makeRequestId } from '@/lib/ids/requestId';

export async function GET() {
  const requestId = makeRequestId();

  try {
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

    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

    const { count: starCount, error: starErr } = await supabase
      .from('star')
      .select('star_id', { count: 'exact', head: true })
      .gte('created_at', monday.toISOString())
      .eq('auth_user_id', authUser.id);

    if (starErr) throw mapSupabaseError(starErr);

    const { count: diaryCount, error: diaryErr } = await supabase
      .from('diary')
      .select('diary_id', { count: 'exact', head: true })
      .eq('auth_user_id', authUser.id)
      .gte('created_at', monday.toISOString());

    if (diaryErr) throw mapSupabaseError(diaryErr);

    const today = new Date().toISOString().slice(0, 10);

    const { count: todayCount, error: todayErr } = await supabase
      .from('diary')
      .select('diary_id', { count: 'exact', head: true })
      .eq('auth_user_id', authUser.id)
      .eq('entry_date', today);

    if (todayErr) throw mapSupabaseError(todayErr);

    const homeData = {
      profile: { nickname: profile.nickname, email: profile.email },
      starCount: starCount ?? 0,
      diaryCount: diaryCount ?? 0,
      isDiary: !!todayCount,
    };

    return jsonOk(homeData, null, requestId);
  } catch (e: unknown) {
    return jsonError(e instanceof AppError ? e : Errors.internal(), requestId);
  }
}
