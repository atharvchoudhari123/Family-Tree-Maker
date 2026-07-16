export interface Person {
  id: string;
  name: string;
  title?: string;
  birthYear?: string;
  deathYear?: string;
  isDeceased?: boolean;
  gender?: 'male' | 'female' | 'other' | 'unspecified';
  parents: string[]; // parent person IDs
  children: string[]; // child person IDs
  spouses: string[]; // spouse person IDs
  generation: number; // 0 = default, negative = ancestors, positive = descendants
  sortOrder?: number; // horizontal sorting within the generation
  colorTheme?: 'slate' | 'blue' | 'rose' | 'amber' | 'emerald' | 'indigo' | 'violet';
  customClass?: string;
}

export type LineStyle = 'curved' | 'straight' | 'orthogonal';

export interface FamilyTreeSettings {
  treeTitle: string;
  treeSubtitle: string;
  theme: 'elegant' | 'modern' | 'warm' | 'dark';
  lineStyle: LineStyle;
  showDates: boolean;
  showTitles: boolean;
  lineColor: string;
}
