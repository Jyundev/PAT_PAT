// 표준 에러 클래스
export type AppErrorCode =
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'DB_ERROR'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  code: AppErrorCode;
  status: number;
  details?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
