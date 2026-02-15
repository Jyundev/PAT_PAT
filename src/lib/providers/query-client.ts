import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR 효율을 위해 1분 정도는 기본적으로 신선(fresh)하다고 가정
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버 환경: 매번 새로운 클라이언트 반환
    return makeQueryClient();
  } else {
    // 클라이언트 환경: 브라우저당 하나만 유지 (싱글톤)
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
