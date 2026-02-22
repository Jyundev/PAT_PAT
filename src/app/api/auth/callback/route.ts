import { Errors, mapSupabaseError } from '@/lib';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const AFTER_LOGIN = '/home';
const SIGNIN = '/start';
const SAFE_PATHS = new Set([AFTER_LOGIN]);
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  console.error('[auth/callback]');

  try {
    const code = url.searchParams.get('code');
    const oauthErr =
      url.searchParams.get('error') ||
      url.searchParams.get('error_description');

    // 1) OAuth 단계 에러 (외부 서비스 문제)
    if (oauthErr) {
      throw Errors.unauthorized(`OAuth provider error: ${oauthErr}`);
    }
    // 2) Code 누락
    if (!code) {
      throw Errors.invalid('Missing OAuth code');
    }
    const supabase = await createServerSupabaseClient();
    // 3) 세션 교환
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      // Supabase 에러를 우리 표준 에러로 변환
      throw mapSupabaseError(exchangeError);
    }
    // 4) 사용자 정보 저장 (DB 작업)
    const user = data.user;
    const provider = user.app_metadata?.provider as string;
    const nickname = user.user_metadata?.nickname || user.user_metadata?.name;
    if (user) {
      // 먼저 유저가 있는지 확인
      const { data: existingUser, error: selectErr } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (selectErr) throw mapSupabaseError(selectErr);

      if (!existingUser) {
        // [회원가입 절차 개입] DB에 유저가 없는 경우 -> 약관 동의 페이지로 리다이렉트
        // 주의: 이 시점에는 Supabase Auth 세션은 생성된 상태입니다.
        console.log('신규 사용자 감지: 약관 동의 페이지로 리다이렉트');
        return NextResponse.redirect(new URL('/auth/terms', origin));
      } else {
        // [로그인 로직] 이미 유저가 있는 경우
        const { error: updateErr } = await supabase
          .from('users')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('auth_user_id', user.id);

        if (updateErr) throw mapSupabaseError(updateErr);

        console.log('기존 회원 로그인!');
      }
    }
    const nextParam = url.searchParams.get('next');
    const targetPath =
      nextParam && SAFE_PATHS.has(nextParam) ? nextParam : AFTER_LOGIN;
    // 성공 리다이렉트 (기존 유저)
    return NextResponse.redirect(new URL(targetPath, origin));
  } catch (err: any) {
    // 5) 모든 에러가 모이는 곳 (에러 처리 통합)
    console.error('[auth/callback] Error caught:', err);

    // AppError인지 확인하고, 아니면 internal error로 간주
    const appError = err.code
      ? err
      : Errors.internal(err.message || 'Unknown error');

    // 클라이언트에게 에러 정보를 넘김
    return NextResponse.redirect(
      new URL(`${SIGNIN}?error=${appError.code}`, origin),
      { status: 303 }
    );
  }
}
