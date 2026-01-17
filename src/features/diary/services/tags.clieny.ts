import { TagsSchema } from '../schemas/tag.schema';

export async function getTagsClient(): Promise<TTag[]> {
  const res = await fetch('/api/tags', {
    method: 'GET',
    credentials: 'include', // 쿠키 기반이면 안전하게 포함
    cache: 'no-store', // TanStack Query가 캐시하므로 브라우저 HTTP 캐시는 꺼도 됨
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch tags: ${res.status} ${text}`);
  }

  const json = await res.json();
  const parsed = TagsSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Tags payload schema mismatch');
  }
  return parsed.data;
}
