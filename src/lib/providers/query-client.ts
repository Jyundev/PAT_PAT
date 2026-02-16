import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query';

/**
 * 1. makeQueryClient: 새로운 QueryClient 인스턴스를 생성하는 팩토리 함수
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * SSR 효율을 위해 1분(60,000ms) 동안 데이터가 신선(fresh)하다고 설정한다.
         * 이 설정이 없으면(기본값 0), 서버에서 가져온 데이터를 클라이언트가
         * 받자마자 "낡았다"고 판단하여 즉시 불필요한 네트워크 재요청을 보낼 수 있다.
         */
        staleTime: 60 * 1000,
      },
      dehydrate: {
        /**
         * 서버에서 클라이언트로 데이터를 넘겨줄(dehydrate) 기준을 정의한다.
         * - 기본 조건(성공한 쿼리 등)을 만족하거나,
         * - 현재 상태가 'pending'인 경우에도 포함시킨다.
         * 이는 서버에서 데이터를 불러오는 중일 때의 상태까지 클라이언트로 전달하기 위함이다.
         */
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });
}

// 브라우저 메모리에 유지될 클라이언트 인스턴스 (싱글톤 변수)
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * 2. getQueryClient: 실행 환경에 따라 최적화된 QueryClient를 반환하는 메인 함수
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    /**
     * [서버 환경 - SSR/SSG]
     * 서버에서는 매 요청(Request)마다 새로운 QueryClient를 생성해야 한다.
     * 인스턴스를 공유하면 서로 다른 사용자의 데이터가 섞여버리는 보안 사고가 발생할 수 있기 때문이다.
     */
    return makeQueryClient();
  } else {
    /**
     * [클라이언트 환경 - 브라우저]
     * 브라우저에서는 단 하나의 인스턴스(싱글톤)만 유지한다.
     * 사용자가 페이지 내에서 이동하더라도 기존 캐시 데이터를 계속 재사용하기 위함이다.
     */
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
