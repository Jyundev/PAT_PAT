'use server';
import { mapSupabaseError } from '@/lib';
import { withAuthAction } from '@/lib/actions/withAuthAction';

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
