import MyDiaryClient from '@/features/diary-archive/components/MyDiaryClient';
import { getDiariesAction } from '@/features/diary/actions/diary.actions';
import { diaryKeys } from '@/features/diary/queries/diaries';
import { getQueryClient } from '@/lib/providers/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Page() {
  const queryClient = getQueryClient();

  const todayMonth = new Date().toISOString().slice(0, 7);
  const initialParams = { month: todayMonth, q: '' };

  await queryClient.prefetchQuery({
    queryKey: diaryKeys.list(initialParams),
    queryFn: async () => {
      const res = await getDiariesAction(initialParams);

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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="min-h-[100svh] text-white">
        <MyDiaryClient />
      </main>
    </HydrationBoundary>
  );
}
