import { ApiErrorBody, ApiSuccess } from '@/lib';
import { TagsSchema } from '../schemas/tag.schema';

export async function getTagsClient(): Promise<TTag[]> {
  const res = await fetch('/api/tags', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  const body = (await res.json().catch(() => null)) as
    | ApiSuccess<unknown>
    | ApiErrorBody
    | null;

  if (!res.ok) {
    const msg =
      (body && 'message' in body && body.message) ||
      `Failed to fetch tags: ${res.status}`;
    throw new Error(msg);
  }

  if (!body || body.ok !== true) {
    throw new Error('Invalid API response shape');
  }

  const parsed = TagsSchema.safeParse(body.data);
  if (!parsed.success) {
    throw new Error('Tags payload schema mismatch');
  }

  return parsed.data;
}
