/**
 * Supabase(PostgreSQL) Error Mapper
 *  - Supabase는 Postgres의 SQLSTATE 에러 코드를 그대로 반환합니다.
 *
 * 참고: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */

import { AppError } from './AppError';
import { Errors } from './Errors';

type PGError = {
  code?: string;
  message: string;
  details?: unknown;
  hint?: string;
};

export function mapSupabaseError(e: PGError): AppError {
  switch (e.code) {
    // ───────────────────────────────
    // 23 — Integrity Constraint Violation
    // ───────────────────────────────
    case '23505': // unique_violation
      return Errors.conflict(
        'Duplicate resource (unique constraint violated)',
        e
      );

    case '23503': // foreign_key_violation
      return Errors.invalid('Invalid reference (foreign key violation)', e);

    case '23502': // not_null_violation
      return Errors.invalid(
        'Missing required field (NOT NULL constraint violated)',
        e
      );

    case '23514': // check_violation
      return Errors.invalid('Value violates CHECK constraint', e);

    case '23P01': // exclusion_violation
      return Errors.invalid('Exclusion constraint violated', e);

    // ───────────────────────────────
    // 22 — Data Exception
    // ───────────────────────────────
    case '22001': // string_data_right_truncation
      return Errors.invalid('String too long for column', e);

    case '22003': // numeric_value_out_of_range
      return Errors.invalid('Numeric value out of range', e);

    case '22007': // invalid_datetime_format
    case '22008': // datetime_field_overflow
      return Errors.invalid('Invalid date or time format', e);

    case '22P02': // invalid_text_representation
      return Errors.invalid('Invalid input syntax for data type', e);

    case '22P05': // untranslatable_character
      return Errors.invalid('Invalid or unsupported character encoding', e);

    // ───────────────────────────────
    // 42 — Syntax or Access Rule Violation
    // ───────────────────────────────
    case '42P01': // undefined_table
      return Errors.db('Referenced table not found (undefined_table)', e);

    case '42703': // undefined_column
      return Errors.db('Referenced column not found (undefined_column)', e);

    case '42501': // insufficient_privilege
      return Errors.forbidden(
        'Insufficient privilege to perform this action',
        e
      );

    // ───────────────────────────────
    // 40 — Transaction Rollback
    // ───────────────────────────────
    case '40001': // serialization_failure
      return Errors.db('Transaction conflict, please retry', e);

    case '40003': // statement_completion_unknown
      return Errors.db('Transaction completion uncertain', e);

    // ───────────────────────────────
    // 57 — Operator Intervention / Cancellation
    // ───────────────────────────────
    case '57014': // query_canceled
      return Errors.db('Query canceled or execution timeout', e);

    case '57P01': // admin_shutdown
      return Errors.db('Database is shutting down', e);

    // ───────────────────────────────
    // 53 — Insufficient Resources
    // ───────────────────────────────
    case '53100': // disk_full
      return Errors.db('Insufficient disk space', e);

    case '53200': // out_of_memory
      return Errors.db('Database out of memory', e);

    // ───────────────────────────────
    // 08 — Connection Exception
    // ───────────────────────────────
    case '08003': // connection_does_not_exist
    case '08006': // connection_failure
      return Errors.db('Database connection failed', e);

    // ───────────────────────────────
    // XX — Internal Error
    // ───────────────────────────────
    case 'XX000': // internal_error
      return Errors.db('Internal database error', e);

    default:
      // 기타 예외 — 안전하게 메시지 감싸서 반환
      return Errors.db(e.message || 'Unknown database error', e);
  }
}
