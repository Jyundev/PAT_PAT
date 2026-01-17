import DiaryWrite from '@/features/diary/components/diaryWrite';
import { tagsKeys } from '@/features/diary/queries/tags';
import { getTagsServer } from '@/features/diary/services/tags.server';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

export default async function DiaryWritePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: tagsKeys.all,
    queryFn: getTagsServer, // 서버에서 DB 직접
    staleTime: 1000 * 60 * 30, // 서버/클라 동일하게 맞추면 더 예측 가능
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DiaryWrite />
    </HydrationBoundary>
  );
}
