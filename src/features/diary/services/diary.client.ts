import { ApiErrorBody, ApiSuccess } from '@/lib';
import { DiaryDetail, DiaryDetailSchema } from '../schemas/diaryDetail.schema';

export async function getDiaryClient(diaryId: string): Promise<DiaryDetail> {
  const res = await fetch(`/api/diary/${diaryId}`, {
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
      `Failed to fetch diary: ${res.status}`;
    const rid = body && 'requestId' in body ? body.requestId : undefined;
    throw new Error(rid ? `${msg} (requestId: ${rid})` : msg);
  }

  if (!body || body.ok !== true) {
    throw new Error('Invalid API response shape');
  }

  const parsed = DiaryDetailSchema.safeParse(body.data);
  if (!parsed.success) {
    throw new Error('Diary payload schema mismatch');
  }

  return parsed.data;
}
