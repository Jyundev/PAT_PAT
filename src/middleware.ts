import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  //  초기 응답 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. API 라우트, 정적 파일, 이미지 등은 미들웨어 로직을 건너뜁니다.
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('/favicon.ico')
  ) {
    return response;
  }
  // 2. 미들웨어 전용 Supabase 클라이언트 설정
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value); // 요청 쿠키 업데이트
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options); // 응답 쿠키 업데이트
          });
        },
      },
    }
  );

  // 3. 세션 정보 확인 (
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/start') ||
    request.nextUrl.pathname === '/';

  // 4. 로직 처리: 로그인 안 된 유저가 보호된 페이지 접근 시
  if (!user && !isAuthPage) {
    // 로그인이 안 되어 있고, 허용된 페이지(/start, /auth)가 아니면 로그인으로 보냄
    return NextResponse.redirect(new URL('/start', request.url));
  }

  // 5. 로직 처리: 이미 로그인된 유저가 로그인/시작 페이지 접근 시
  if (user && isAuthPage) {
    // [예외] 약관 동의 페이지(/auth/terms)는 신규 가입자가 세션을 가진 채로 머물러야 하므로 제외
    if (request.nextUrl.pathname === '/auth/terms') {
      return response;
    }
    // 이미 로그인했는데 /login 이나 /start로 가려고 하면 대시보드로 보냄
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에서 미들웨어 실행
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
