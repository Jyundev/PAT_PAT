import 'server-only';
import { createServerSupabaseClientReadOnly } from '@/utils/supabase/server';
import { mapSupabaseError } from '@/lib';
import { TagsSchema, type Tag } from '@/features/diary/schemas/tag.schema';

export async function getTagsServer(): Promise<Tag[]> {
  const supabase = await createServerSupabaseClientReadOnly();

  const { data, error } = await supabase
    .from('tag')
    .select('tag_id, tag_name')
    .eq('is_active', true)
    .order('order_no', { ascending: true, nullsFirst: false })
    .order('tag_name', { ascending: true });

  if (error) throw mapSupabaseError(error);

  // 런타임 검증 (DB 데이터 이상/컬럼 타입 이상 즉시 감지)
  return TagsSchema.parse(data ?? []);
}
