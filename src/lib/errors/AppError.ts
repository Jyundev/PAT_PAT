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
  constructor(
    public code: AppErrorCode,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // 에러 발생 지점을 정확히 잡기 위해 stack trace 조정 (V8 엔진 환경)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
