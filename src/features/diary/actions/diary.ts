'use server';
import { Errors, makeRequestId, mapSupabaseError } from '@/lib';
import { Result } from '@/lib/result/result';
import { ActionErr, toActionErr } from '@/lib/result/toActionErr';
import { createServerSupabaseClientReadOnly } from '@/utils/supabase/server';

export async function createDiaryAction(
  input: CreateDiaryInput
): Promise<Result<CreateDiaryData, ActionErr>> {
  const supabase = await createServerSupabaseClientReadOnly();
  const requestId = makeRequestId();

  const { data, error: authErr } = await supabase.auth.getUser();
  const authUser = data.user;

  if (authErr || !authUser) {
    return {
      ok: false,
      ...toActionErr(Errors.unauthorized('unauthorized'), requestId),
    };
  }

  try {
    const { data, error } = await supabase.rpc('create_diary_entry', {
      p_auth_user_id: authUser.id,
      p_entry_date: input.entry_date,
      p_polarity: input.polarity,
      p_content: input.content,
      p_emotion_intensity: input.intensity,
      p_tag_ids: input.tag_ids ?? [],
    });

    if (error) {
      return { ok: false, ...toActionErr(mapSupabaseError(error), requestId) };
    }

    return { ok: true, data };
  } catch (e) {
    return { ok: false, ...toActionErr(e, requestId) };
  }
}

type GetDiaryByDateData = { exists: boolean };

export async function getDiaryByDateAction(
  entryDate: string // YYYY-MM-DD
): Promise<Result<GetDiaryByDateData, ActionErr>> {
  const supabase = await createServerSupabaseClientReadOnly();
  const requestId = makeRequestId();

  const { data, error: authErr } = await supabase.auth.getUser();
  const authUser = data.user;

  if (authErr || !authUser) {
    return {
      ok: false,
      ...toActionErr(Errors.unauthorized('unauthorized'), requestId),
    };
  }

  try {
    const { count, error } = await supabase
      .from('diary')
      .select('diary_id', { count: 'exact', head: true })
      .eq('auth_user_id', authUser.id)
      .eq('entry_date', entryDate)
      .is('deleted_at', null);

    if (error) {
      return { ok: false, ...toActionErr(mapSupabaseError(error), requestId) };
    }

    return { ok: true, data: { exists: (count ?? 0) > 0 } };
  } catch (e) {
    return { ok: false, ...toActionErr(e, requestId) };
  }
}
