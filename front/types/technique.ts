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

export interface TechniqueResponse {
  data: Technique;
}

export type CategoryFilterValue = 'all' | TechniqueCategory;

export const CATEGORY_FILTERS: { label: string; value: CategoryFilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Nage-waza', value: 'nage-waza' },
  { label: 'Katame-waza', value: 'katame-waza' },
  { label: 'Atemi-waza', value: 'atemi-waza' },
];

export type SubcategoryFilterValue =
  | 'all'
  | 'te-waza'
  | 'koshi-waza'
  | 'ashi-waza'
  | 'ma-sutemi-waza'
  | 'yo-sutemi-waza'
  | 'osaekomi-waza'
  | 'shime-waza'
  | 'kansetsu-waza'
  | 'ude-ate'
  | 'keri-waza';

export const SUBCATEGORY_FILTERS: { label: string; value: SubcategoryFilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Te-waza', value: 'te-waza' },
  { label: 'Koshi-waza', value: 'koshi-waza' },
  { label: 'Ashi-waza', value: 'ashi-waza' },
  { label: 'Ma-sutemi', value: 'ma-sutemi-waza' },
  { label: 'Osaekomi', value: 'osaekomi-waza' },
  { label: 'Shime-waza', value: 'shime-waza' },
  { label: 'Kansetsu', value: 'kansetsu-waza' },
];
