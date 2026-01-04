
export interface Pokemon {
  name: string;
  image: string;
  shiny?: boolean;
  shinyImage?: string;
  form?: string;
  costume?: string;
}

export interface SpawnCategory {
  id: number;
  name: string;
  spawns: Pokemon[];
}

export interface Attack {
  pokemon: string;
  move: string;
  image: string;
  type: string;
  energy: string; // Para carregados: "1", "2", "3" (barras). Para ágil: "fast"
  category?: 'fast' | 'charged';
  power?: string;
  method?: string;
}

export interface Raid {
  tier: string;
  boss: string;
  image?: string;
  form?: string;
  costume?: string;
}

export interface CustomText {
  type: 'text' | 'image' | 'mixed';
  title: string;
  desc?: string;
  img?: string;
}

export interface EggGroup {
  distance: string;
  spawns: Pokemon[];
}

export interface PogoEventPayment {
  type: string;
  cost: string;
  ticket?: {
    cost: string;
    bonuses: string[];
  };
}

export interface PogoEvent {
  id: string;
  name: string;
  type: string;
  start: string;
  end: string;
  location: string;
  cover?: string;
  research?: string;
  eggTitle?: string;
  eggDesc?: string;
  bonuses: string[];
  images: string[];
  payment?: PogoEventPayment;
  featured?: {
    name: string;
    image: string;
    shinyRate?: string;
    form?: string;
    costume?: string;
  };
  paidResearch?: {
    name: string;
    cost: string;
    details: string;
  };
  spawnCategories: SpawnCategory[];
  attacks: Attack[];
  raidsList: Raid[];
  customTexts: CustomText[];
  eggs: EggGroup[];
}

export interface CatalogProgress {
  [pokemonId: string]: {
    normal?: boolean;
    shiny?: boolean;
    hundo?: boolean;
    shundo?: boolean;
    xxl?: boolean;
    xxs?: boolean;
    shadow?: boolean;
    purified?: boolean;
    move_obtained?: boolean;
  };
}
