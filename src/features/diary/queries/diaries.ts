export const diaryKeys = {
  all: ['diary'] as const,
  detail: (diaryId: string) => [...diaryKeys.all, 'detail', diaryId] as const,
};
