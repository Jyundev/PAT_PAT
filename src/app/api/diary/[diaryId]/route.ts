import { getDiaryDetailServer } from '@/features/diary/services/diary.server';
import { AppError, Errors, jsonError, jsonOk } from '@/lib';
import { makeRequestId } from '@/lib/ids/requestId';
import { ZodError } from 'zod';

export async function GET(
  _req: Request,
  context: { params: Promise<{ diaryId: string }> }
) {
  const requestId = makeRequestId();

  try {
    const { diaryId } = await context.params;

    const diary = await getDiaryDetailServer(diaryId);

    return jsonOk(diary, { count: 1 }, requestId);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return jsonError(
        Errors.internal('Invalid diary payload', { issues: err.issues }),
        requestId
      );
    }
    console.error('[requestId]', requestId, err);

    return jsonError(
      err instanceof AppError ? err : Errors.internal(),
      requestId
    );
  }
}
