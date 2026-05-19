export type TechniqueDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type TechniqueCategory = 'nage-waza' | 'katame-waza' | 'atemi-waza';

export interface Technique {
  id: string;
  name: string;
  category: TechniqueCategory;
  subcategory: string;
  description: string;
  difficulty: TechniqueDifficulty;
  tags: string[];
}

export interface TechniquesResponse {
  data: Technique[];
  count: number;
}

export type CategoryFilterValue = 'all' | TechniqueCategory;

export const CATEGORY_FILTERS: { label: string; value: CategoryFilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Nage-waza', value: 'nage-waza' },
  { label: 'Katame-waza', value: 'katame-waza' },
  { label: 'Atemi-waza', value: 'atemi-waza' },
];
