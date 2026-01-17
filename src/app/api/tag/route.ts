import { TagsSchema } from '@/features/diary/schemas/tag.schema';
import { getTagsServer } from '@/features/diary/services/tags.server';
import { jsonError, jsonOk, makeRequestId } from '@/lib';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function GET() {
  const requestId = makeRequestId();
  try {
    const tags = await getTagsServer();
    const safe = TagsSchema.parse(tags);

    return jsonOk(safe, { count: safe.length }, requestId);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { message: 'Invalid tags payload', issues: err.issues },
        { status: 500 }
      );
    }
    return jsonError(err as Error, requestId);
  }
}
