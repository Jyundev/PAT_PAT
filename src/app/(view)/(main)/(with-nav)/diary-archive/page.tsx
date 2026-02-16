import MyDiaryClient from '@/features/diary-archive/components/MyDiaryClient';
import { getDiariesAction } from '@/features/diary/actions/diary.actions';
import { diaryKeys } from '@/features/diary/queries/diaries';
import { getQueryClient } from '@/lib/providers/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Page() {
  /**
   * 1. queryClient 인스턴스 획득
   * - 서버에서 데이터를 캐싱할 싱글톤 인스턴스를 가져온다.
   * - 서버 컴포넌트이므로 요청(Request)마다 독립된 캐시 저장소를 갖게 된다.
   */
  const queryClient = getQueryClient();

  const todayMonth = new Date().toISOString().slice(0, 7);
  const initialParams = { month: todayMonth, q: '' };

  /**
   * 2. prefetchQuery: 서버에서 데이터를 미리 찌르기
   * - 클라이언트가 페이지를 받기 전에 서버에서 API(getDiariesAction)를 미리 호출한다.
   * - 가져온 데이터는 queryClient 내부 캐시에 'diaryKeys.list(initialParams)'라는 키로 저장된다.
   */
  await queryClient.prefetchQuery({
    queryKey: diaryKeys.list(initialParams),
    queryFn: async () => {
      const res = await getDiariesAction(initialParams);

      /**
       * 3. 에러 처리 및 throw
       * - Prefetch 도중 에러가 나면 캐시에 데이터가 쌓이지 않는다.
       * - throw를 해줘야 TanStack Query가 실패를 감지하며,
       * 클라이언트가 마운트되었을 때 다시 데이터를 가져오려고 시도한다.
       */
      if (!res.ok) {
        console.error(
          `[Prefetch Error] ID: ${res.requestId}, Code: ${res.code}`
        );
        throw new Error(res.message);
      }
      return res.data;
    },
  });

  return (
    /**
     * 4. HydrationBoundary와 dehydrate
     * - dehydrate(queryClient): 서버 캐시에 저장된 데이터를 JSON 형태로 직렬화하여 클라이언트로 넘긴다.
     * - HydrationBoundary: 클라이언트의 QueryClient가 서버에서 받은 데이터를 '흡수(Hydrate)'하게 만든다.
     * * 결과: <MyDiaryClient /> 내부에서 'diaryKeys.list(initialParams)' 키로 useQuery를 호출하면,
     * 로딩(`isLoading`) 없이 즉시 서버에서 받아온 데이터를 보여줄 수 있다. (사용자 경험 극대화)
     */
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="min-h-[100svh] text-white">
        <MyDiaryClient />
      </main>
    </HydrationBoundary>
  );
}
