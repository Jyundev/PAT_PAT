'use server';

import { mapSupabaseError } from '@/lib';
import {
  createServerSupabaseClient,
  createServerSupabaseClientReadOnly,
} from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAuthSessionAction() {
  const supabase = await createServerSupabaseClientReadOnly();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const };
  }

  return {
    ok: true as const,
    user, // auth.users 정보
  };
}

function pickNickname(user: any, inputNickname?: string) {
  const fromInput = (inputNickname ?? '').trim();
  if (fromInput) return fromInput;

  const fromMeta = (
    user?.user_metadata?.nickname ||
    user?.user_metadata?.name ||
    ''
  )
    ?.toString()
    .trim();

  if (fromMeta) return fromMeta;

  const email = (user?.email ?? '').toString();
  return email.includes('@') ? email.split('@')[0] : 'user';
}

/**
 * 약관 동의 완료 처리
 * - 세션 기반으로 현재 user를 확인
 * - users 테이블 upsert + terms_accepted_at 기록
 * - 성공 시 /home redirect
 */
export async function completeSignupAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  // 1) 현재 로그인 유저 확인 (클라에서 auth_user_id 받지 않기)
  const { data: sessionRes, error: sessionErr } =
    await supabase.auth.getSession();
  if (sessionErr) {
    console.error('[completeSignupAction] getSession error:', sessionErr);
  } else {
    console.log('[completeSignupAction] session exists:', !!sessionRes.session);
  }

  // 유저 확인
  const { data: userRes, error: userErr } = await supabase.auth.getUser();

  if (userErr || !userRes.user) {
    return {
      ok: false as const,
      code: 'NO_SESSION',
      message: '세션이 없습니다.',
    };
  }

  const user = userRes.user;
  if (!user) {
    return {
      ok: false as const,
      code: 'NO_SESSION',
      message: '세션이 없습니다.',
    };
  }

  // (선택) 닉네임 입력을 폼에서 받을 경우
  const nicknameInput = String(formData.get('nickname') ?? '');
  const nickname = pickNickname(user, nicknameInput);

  // provider
  const provider = (user.app_metadata?.provider as string) || 'email';

  // 2) upsert (중복/레이스 안전)
  const nowIso = new Date().toISOString();
  const { error: upsertErr } = await supabase.from('users').upsert(
    {
      auth_user_id: user.id,
      email: user.email,
      signup_method: provider,
      nickname,
      terms_accepted_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: 'auth_user_id' }
  );

  if (upsertErr) throw mapSupabaseError(upsertErr);

  // 3) 캐시 갱신 (필요한 페이지만)
  revalidatePath('/home');
  revalidatePath('/auth/terms');

  // 4) 완료 후 성공 반환 (클라에서 redirect 처리)
  return { ok: true as const };
}
