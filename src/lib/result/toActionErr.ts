import { AppError } from '../errors/AppError';
import { Errors } from '../errors/Errors';

export type ActionErr = {
  code: string;
  message: string;
  details?: unknown;
  requestId: string;
};

export function toActionErr(e: unknown, requestId: string): ActionErr {
  if (e instanceof AppError) {
    return {
      code: e.code,
      message: e.message,
      details: e.details,
      requestId,
    };
  }

  const msg = e instanceof Error ? e.message : 'Unknown error';
  const wrapped = Errors.internal(msg); // 내부적으로 AppError 생성
  return {
    code: wrapped.code,
    message: wrapped.message,
    details: wrapped.details,
    requestId,
  };
}
