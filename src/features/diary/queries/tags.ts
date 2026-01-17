export const tagsKeys = {
  all: ['tags'] as const,
  // 필요해지면 확장
  // list: (type?: string) => [...tagsKeys.all, "list", { type }] as const,
};
