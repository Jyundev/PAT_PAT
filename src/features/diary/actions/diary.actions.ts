'use server';

import {
  queryDiaries,
  QueryDiariesParams,
} from '@/features/diary-archive/server/queryDiaries';

import { AppError, Errors, makeRequestId, mapSupabaseError } from '@/lib';
import { withAuthAction } from '@/lib/actions/withAuthAction';

export async function updateDiaryAction(input: UpsertDiaryInput) {
  return withAuthAction(async ({ supabase, authUser }) => {
    const { data, error } = await supabase.rpc('update_diary_entry', {
      p_auth_user_id: authUser.id,
      p_diary_id: input.diary_id,
      p_polarity: input.polarity,
      p_content: input.content,
      p_emotion_intensity: input.intensity,
      p_tag_ids: input.tag_ids ?? [],
    });

    if (error) throw mapSupabaseError(error);
    return data;
  });
}

export async function createDiaryAction(input: UpsertDiaryInput) {
  return withAuthAction(async ({ supabase, authUser }) => {
    const { data, error } = await supabase.rpc('create_diary_entry', {
      p_auth_user_id: authUser.id,
      p_entry_date: input.entry_date,
      p_polarity: input.polarity,
      p_content: input.content,
      p_emotion_intensity: input.intensity,
      p_tag_ids: input.tag_ids ?? [],
    });

    if (error) throw mapSupabaseError(error);
    return data;
  });
}

export async function getDiariesAction(params: QueryDiariesParams) {
  const requestId = makeRequestId(); // 추적을 위한 ID 생성

  try {
    const data = await queryDiaries(params);
    return { ok: true, data, requestId };
  } catch (e) {
    // throw된 AppError를 잡아 jsonError 형태로 포장
    const error = e instanceof AppError ? e : Errors.internal();
    return {
      ok: false,
      code: error.code,
      message: error.message,
      requestId,
    };
  }
}
