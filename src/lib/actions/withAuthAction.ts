'use server';

import { Errors } from '@/lib';
import { makeRequestId } from '@/lib/ids/requestId';
import { Result } from '@/lib/result/result';
import { toActionErr } from '@/lib/result/toActionErr'; // 네 프로젝트 경로에 맞게
import { createServerSupabaseClientReadOnly } from '@/utils/supabase/server';

type ActionErr = {
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
};

export async function withAuthAction<T>(
  fn: (args: {
    supabase: Awaited<ReturnType<typeof createServerSupabaseClientReadOnly>>;
    authUser: { id: string };
    requestId: string;
  }) => Promise<T>
): Promise<Result<T, ActionErr>> {
  const requestId = makeRequestId();

  try {
    const supabase = await createServerSupabaseClientReadOnly();

    const { data, error: authErr } = await supabase.auth.getUser();
    const authUser = data.user;

    if (authErr || !authUser) {
      return {
        ok: false,
        ...toActionErr(Errors.unauthorized('unauthorized'), requestId),
      };
    }

    const dataResult = await fn({ supabase, authUser, requestId });
    return { ok: true, data: dataResult };
  } catch (e: unknown) {
    // supabase 에러 형태면 mapSupabaseError를 적용하고 싶으면 여기서도 처리 가능
    return { ok: false, ...toActionErr(e, requestId) };
  }
}
