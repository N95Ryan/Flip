import type { TechniqueCategory } from '@/types/technique';

export const LibraryRoutes = {
  index: '/library',
  rules: '/library/rules',
  moralCode: '/library/moral-code',
  techniques: '/library/techniques',
  techniqueCategory: (category: TechniqueCategory) =>
    `/library/techniques/${category}`,
  techniqueSubcategory: (category: string, subcategory: string) =>
    `/library/techniques/${category}/${subcategory}`,
  techniqueDetail: (category: string, subcategory: string, id: string) =>
    `/library/techniques/${category}/${subcategory}/${id}`,
} as const;
