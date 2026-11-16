import type { Href } from 'expo-router';

import type { TechniqueCategory } from '@/types/technique';

export const LibraryRoutes = {
  index: '/library',
  rules: '/library/rules',
  moralCode: '/library/moral-code',
  techniques: '/library/techniques',
  techniqueCategory: (category: TechniqueCategory): Href => ({
    pathname: '/library/techniques/[category]',
    params: { category },
  }),
  techniqueSubcategory: (category: string, subcategory: string): Href => ({
    pathname: '/library/techniques/[category]/[subcategory]',
    params: { category, subcategory },
  }),
  techniqueDetail: (category: string, subcategory: string, id: string): Href => ({
    pathname: '/library/techniques/[category]/[subcategory]/[id]',
    params: { category, subcategory, id },
  }),
} as const;
