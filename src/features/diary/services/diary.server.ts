import { Errors, mapSupabaseError } from '@/lib';
import { createServerSupabaseClientReadOnly } from '@/utils/supabase/server';
import 'server-only';
import { DiaryDetail, DiaryDetailSchema } from '../schemas/diaryDetail.schema';

export async function getDiaryDetailServer(
  diaryId: string
): Promise<DiaryDetail> {
  const supabase = await createServerSupabaseClientReadOnly();

  // 1) 로그인 체크
  const { data, error: authErr } = await supabase.auth.getUser();
  const authUser = data.user;
  if (authErr || !authUser) throw Errors.unauthorized();

  // 2) diary 상세 + tags join (FK 기반)
  const { data: diary, error: diaryErr } = await supabase
    .from('diary')
    .select(
      `
      diary_id,
      entry_date,
      content,
      emotion_polarity,
      emotion_intensity,
      created_at,
      updated_at,
      diary_tags:diary_tags (
        tag:tag_id ( tag_id, tag_name )
      )
    `
    )
    .eq('diary_id', diaryId)
    .eq('auth_user_id', authUser.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (diaryErr) throw mapSupabaseError(diaryErr);
  if (!diary) throw Errors.notFound('Diary not found');

  // 3) tags 형태 정리
  const mapped = {
    ...diary,
    tags: (diary.diary_tags ?? [])
      .map((x: any) => x?.tag)
      .filter(Boolean)
      .map((t: any) => ({
        tag_id: String(t.tag_id),
        tag_name: String(t.tag_name),
      })),
  };

  return DiaryDetailSchema.parse(mapped);
}
