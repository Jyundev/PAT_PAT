import DiaryWrite from '@/features/diary/components/diaryWrite';
import { diaryKeys } from '@/features/diary/queries/diaries';
import { tagsKeys } from '@/features/diary/queries/tags';
import { getDiaryDetailServer } from '@/features/diary/services/diary.server';
import { getTagsServer } from '@/features/diary/services/tags.server';
import { getQueryClient } from '@/lib/providers/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function DiaryWritePage({
  searchParams,
}: {
  searchParams: Promise<{ diaryId?: string }>;
}) {
  const { diaryId } = await searchParams;
  const queryClient = getQueryClient();

  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: tagsKeys.list(),
      queryFn: getTagsServer,
      staleTime: 1000 * 60 * 30,
    }),
  ];

  if (diaryId) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: diaryKeys.detail(diaryId),
        queryFn: () => getDiaryDetailServer(diaryId),
        staleTime: 1000 * 60 * 30,
      })
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DiaryWrite diaryId={diaryId} />
    </HydrationBoundary>
  );
}
