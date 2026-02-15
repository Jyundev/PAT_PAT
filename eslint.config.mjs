import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 및 __filename을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 구형 ESLint 설정(extends 등)을 새로운 Flat Config 방식에서 쓸 수 있게 변환해주는 도구
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // 1. Next.js 및 TypeScript 공식 권장 규칙 적용 (Core Web Vitals 최적화 포함)
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // 2. Import 정렬 규칙 (코드 가독성 및 일관성 확보)
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': [
        'error',
        {
          // 내장 -> 외장 -> 내부 -> 부모 -> 형제 순으로 그룹핑
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          // 특정 라이브러리 및 경로에 우선순위 부여 (React를 최상단에 배치 등)
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: 'next/**', group: 'external', position: 'after' },

            { pattern: '@/shared/**', group: 'internal', position: 'before' },
            { pattern: '@/features/**', group: 'internal', position: 'after' },
            { pattern: '@/app/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always', // 그룹 간에는 항상 빈 줄 추가
          alphabetize: { order: 'asc', caseInsensitive: true }, // 알파벳 오름차순 정렬
        },
      ],
    },
  },
];
