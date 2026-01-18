import HomeClient from '@/features/home/components/homeClient';
import { homeKeys } from '@/features/home/queries/summary,';
import { getHomeSummaryServer } from '@/features/home/services/home.server';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

export default async function HomePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: homeKeys.summary(),
    queryFn: getHomeSummaryServer,
    staleTime: 1000 * 60 * 30,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient />
    </HydrationBoundary>
  );
}
