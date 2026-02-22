import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 기존 코드와의 호환성을 위한 supabase 객체 익스포트 유지 (필요시)
export const supabase = createClient();
