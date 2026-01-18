'use server';

import { mapSupabaseError } from '@/lib';
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
