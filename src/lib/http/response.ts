import { NextResponse } from 'next/server';
import { AppError } from '../errors/AppError';

// 공통 응답 타입
export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
};
export type ApiErrorBody = {
  ok: false;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
};

export function jsonOk<T>(
  data: T,
  meta?: Record<string, unknown> | null,
  requestId?: string
) {
  const body: ApiSuccess<T> = { ok: true, data };
  if (meta != null) body.meta = meta;
  if (requestId) body.requestId = requestId;
  return NextResponse.json(body, { status: 200 });
}

export function jsonError(err: AppError | Error, requestId?: string) {
  // AppError인 경우
  if (err instanceof AppError) {
    const body: ApiErrorBody = {
      ok: false,
      code: err.code,
      message: err.message,
      requestId,
    };
    if (err.details !== undefined) body.details = err.details;
    return NextResponse.json(body, { status: err.status });
  }

  // 일반 Error
  const body: ApiErrorBody = {
    ok: false,
    code: 'INTERNAL_ERROR',
    message: err.message || 'Internal error',
    requestId,
  };
  return NextResponse.json(body, { status: 500 });
}
