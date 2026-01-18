import { getHomeSummaryServer } from '@/features/home/services/home.server';
import { AppError, Errors, jsonError, jsonOk, makeRequestId } from '@/lib';
import { ZodError } from 'zod';

export async function GET() {
  const requestId = makeRequestId();
  try {
    const homeSummary = await getHomeSummaryServer();

    return jsonOk(homeSummary, { count: 1 }, requestId);
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(
        Errors.internal('Invalid home summary payload', { issues: err.issues }),
        requestId
      );
    }
    return jsonError(
      err instanceof AppError ? err : Errors.internal(),
      requestId
    );
  }
}
