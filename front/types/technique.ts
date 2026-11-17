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
