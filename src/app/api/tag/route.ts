import { TagsSchema } from '@/features/diary/schemas/tag.schema';
import { getTagsServer } from '@/features/diary/services/tags.server';
import { AppError, Errors, jsonError, jsonOk, makeRequestId } from '@/lib';
import { ZodError } from 'zod';

export async function GET() {
  const requestId = makeRequestId();
  try {
    const tags = await getTagsServer();

    return jsonOk(tags, { count: tags.length }, requestId);
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(
        Errors.internal('Invalid tags payload', { issues: err.issues }),
        requestId
      );
    }
    return jsonError(
      err instanceof AppError ? err : Errors.internal(),
      requestId
    );
  }
}
