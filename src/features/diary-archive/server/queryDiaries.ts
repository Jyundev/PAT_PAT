import 'server-only';

import { createServerSupabaseClient } from '@/utils/supabase/server';
import { Errors, mapSupabaseError } from '@/lib';

export type Polarity = 'POSITIVE' | 'NEGATIVE' | 'UNSET';
export type QueryDiariesParams = {
  month?: string | null;
  date?: string | null;
  q?: string | null;
  polarity?: Polarity | null;
  tagIds?: string[];
  limit?: number;
  cursor?: string | null;
};

type Row = {
  diary_id: string;
  entry_date: string;
  content: string | null;
  emotion_polarity: Polarity;
  emotion_intensity: number | null;
  created_at: string;
  updated_at: string | null;
  diary_tags: Array<{
    tag: { tag_id: string; tag_name: string } | null;
  }> | null;
};

export type DiaryTag = { tag_id: string; tag_name: string };
export type DiaryListItem = {
  diary_id: string;
  entry_date: string;
  content: string;
  emotion_polarity: Polarity;
  emotion_intensity: number | null;
  created_at: string;
  updated_at: string | null;
  tags: DiaryTag[];
};

export type QueryDiariesResult = {
  items: DiaryListItem[];
  nextCursor: string | null;
};

function clampLimit(v: unknown, fallback = 20) {
  const n = Number(v ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, 1), 50);
}

function isYYYYMM(v: string) {
  return /^\d{4}-\d{2}$/.test(v);
}
function isYYYYMMDD(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export async function queryDiaries(
  params: QueryDiariesParams
): Promise<QueryDiariesResult> {
  const supabase = await createServerSupabaseClient();

  // 1) 로그인 체크
  const { data, error: authErr } = await supabase.auth.getUser();
  const authUser = data.user;
  if (authErr || !authUser) throw Errors.unauthorized();

  const month = params.month ?? null;
  const date = params.date ?? null;
  const q = (params.q ?? '').trim();
  const polarity = params.polarity ?? null;
  const tagIds = params.tagIds ?? [];
  const limit = clampLimit(params.limit, 20);
  const cursor = params.cursor ?? null;

  // tag filter MVP 보정: tagIds 있을 때는 넉넉히 가져왔다가 필터링
  const fetchLimit = tagIds.length > 0 ? Math.min(limit * 5, 200) : limit;

  let query = supabase
    .from('diary')
    .select(
      `
        diary_id,
        auth_user_id,
        entry_date,
        content,
        emotion_polarity,
        emotion_intensity,
        created_at,
        updated_at,
        diary_tags:diary_tags (
          tag:tag_id (
            tag_id,
            tag_name
          )
        )
      `
    )
    .eq('auth_user_id', authUser.id)
    .is('deleted_at', null)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(fetchLimit);

  if (month && isYYYYMM(month)) {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

    query = query
      .gte('entry_date', start.toISOString().slice(0, 10))
      .lt('entry_date', end.toISOString().slice(0, 10));
  }

  // date 필터
  if (date && isYYYYMMDD(date)) {
    query = query.eq('entry_date', date);
  }

  // content 검색
  if (q) {
    query = query.ilike('content', `%${q}%`);
  }

  // polarity 필터
  if (polarity && ['POSITIVE', 'NEGATIVE', 'UNSET'].includes(polarity)) {
    query = query.eq('emotion_polarity', polarity);
  }

  // cursor pagination: created_at 기준
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: diaries, error: diaryErr } = await query;
  if (diaryErr) throw mapSupabaseError(diaryErr);

  // tagIds AND 필터
  let filtered: Row[] = (diaries ?? []) as unknown as Row[];
  if (tagIds.length > 0) {
    const tagSet = new Set(tagIds.map(String));
    filtered = filtered.filter((d: Row) => {
      const have = new Set(
        (d.diary_tags ?? []).map((x) => String(x?.tag?.tag_id)).filter(Boolean)
      );
      for (const id of tagSet) if (!have.has(id)) return false;
      return true;
    });
  }

  // 반환은 limit만
  filtered = filtered.slice(0, limit);

  const items: DiaryListItem[] = filtered.map((d: Row) => ({
    diary_id: String(d.diary_id),
    entry_date: String(d.entry_date),
    content: String(d.content ?? ''),
    emotion_polarity: d.emotion_polarity,
    emotion_intensity: d.emotion_intensity,
    created_at: String(d.created_at),
    updated_at: d.updated_at ? String(d.updated_at) : null,
    tags: (d.diary_tags ?? [])
      .map((x) => x?.tag)
      .filter((t): t is DiaryTag => !!t)
      .map((t) => ({
        tag_id: String(t.tag_id),
        tag_name: String(t.tag_name),
      })),
  }));

  // nextCursor는 “실제로 반환한 마지막 아이템” 기준이 더 자연스러움
  const nextCursor =
    items.length > 0 ? items[items.length - 1].created_at : null;

  return { items, nextCursor };
}
