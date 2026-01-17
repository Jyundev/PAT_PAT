import { NextResponse } from 'next/server';
import {
  Polarity,
  queryDiaries,
} from '@/features/diary-archive/server/queryDiaries';
import { jsonOk, jsonError } from '@/lib/http/response';
import { makeRequestId } from '@/lib/ids/requestId';
import { AppError, Errors } from '@/lib';

function parseCsv(s: string | null) {
  if (!s) return [];
  return s
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseLimit(v: string | null) {
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.min(n, 100); // 상한선 추천
}

export async function GET(req: Request) {
  const requestId = makeRequestId();

  try {
    const url = new URL(req.url);

    const month = url.searchParams.get('month');
    const date = url.searchParams.get('date');
    const q = (url.searchParams.get('q') || '').trim();
    const polarity =
      (url.searchParams.get('polarity') as Polarity | null) ?? null;
    const tagIds = parseCsv(url.searchParams.get('tag_ids'));
    const limit = parseLimit(url.searchParams.get('limit'));
    const cursor = url.searchParams.get('cursor');

    const { items, nextCursor } = await queryDiaries({
      month,
      date,
      q,
      polarity,
      tagIds,
      limit,
      cursor,
    });

    return jsonOk({ items, nextCursor }, null, requestId);
  } catch (e) {
    return jsonError(e instanceof AppError ? e : Errors.internal(), requestId);
  }
}
