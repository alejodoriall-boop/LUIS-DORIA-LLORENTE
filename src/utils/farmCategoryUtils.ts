import { FarmDataPackage, PaddockGeo, LotRecord } from '../types';

export type ProductionCategoryKey = 'all' | 'ceba' | 'cria' | 'leche' | 'genetica';

export interface CategoryInfo {
  key: ProductionCategoryKey;
  label: string;
  shortLabel: string;
  description: string;
  colorBg: string;
  colorText: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export const CATEGORY_DEFINITIONS: Record<ProductionCategoryKey, CategoryInfo> = {
  all: {
    key: 'all',
    label: 'Todos los Inventarios',
    shortLabel: 'Todos',
    description: 'Todos los predios y sistemas productivos',
    colorBg: 'bg-[#012d1d]',
    colorText: 'text-white',
    badgeBg: 'bg-[#e8f5e9]',
    badgeText: 'text-[#012d1d]',
    iconName: 'layers',
  },
  ceba: {
    key: 'ceba',
    label: 'Ceba y Engorde',
    shortLabel: 'Ceba',
    description: 'Machos en finalización, novillos y alta conversión de peso',
    colorBg: 'bg-[#1b4332]',
    colorText: 'text-white',
    badgeBg: 'bg-[#c1ecd4]',
    badgeText: 'text-[#002114]',
    iconName: 'beef',
  },
  cria: {
    key: 'cria',
    label: 'Cría y Levante',
    shortLabel: 'Cría & Levante',
    description: 'Terneros destetos, vaquillonas de reemplazo, ganado de levante y vientres',
    colorBg: 'bg-[#79564b]',
    colorText: 'text-white',
    badgeBg: 'bg-[#ffdbcf]',
    badgeText: 'text-[#3e1c12]',
    iconName: 'baby',
  },
  leche: {
    key: 'leche',
    label: 'Lechería Especializada & Plantel Lácteo',
    shortLabel: 'Lechería',
    description: 'Plantel lechero integral: Vacas en ordeño, vacas secas/horras, toros lecheros, terneras/crías y vaquillas de levante lechero.',
    colorBg: 'bg-[#0077b6]',
    colorText: 'text-white',
    badgeBg: 'bg-[#caf0f8]',
    badgeText: 'text-[#03045e]',
    iconName: 'droplet',
  },
  genetica: {
    key: 'genetica',
    label: 'Animales con Registro / Pureza Oficial',
    shortLabel: 'Registrados',
    description: 'Módulo informativo de ejemplares con registro genealógico (Asocebú, Holstein, etc.). Nota: Un animal registrado puede estar en ordeño, ceba o cría y aparecer listado acá.',
    colorBg: 'bg-[#b07d00]',
    colorText: 'text-white',
    badgeBg: 'bg-[#fff3cd]',
    badgeText: 'text-[#533f03]',
    iconName: 'award',
  },
};

/**
 * Returns all categories present in a farm (inspecting lots, paddocks, and profile).
 */
export function getFarmCategories(farm: FarmDataPackage): ProductionCategoryKey[] {
  const categories = new Set<ProductionCategoryKey>();

  // Check lots
  (farm.lots || []).forEach((lot) => {
    const cat = (lot.category || '').toLowerCase();
    const lbl = (lot.categoryLabel || '').toLowerCase();
    const name = (lot.name || '').toLowerCase();

    if (cat === 'ceba' || cat.includes('ceba') || lbl.includes('ceba') || name.includes('ceba') || name.includes('novillo')) {
      categories.add('ceba');
    }
    if (
      cat === 'cria' ||
      cat.includes('cria') ||
      cat.includes('cría') ||
      lbl.includes('cría') ||
      lbl.includes('cria') ||
      lbl.includes('levante') ||
      lbl.includes('recría') ||
      name.includes('cría') ||
      name.includes('cria') ||
      name.includes('ternero') ||
      name.includes('vaquillona')
    ) {
      categories.add('cria');
    }
    if (
      cat === 'leche' ||
      cat.includes('leche') ||
      cat === 'doble_proposito' ||
      lbl.includes('leche') ||
      lbl.includes('ordeño') ||
      lbl.includes('doble') ||
      lbl.includes('producción') ||
      name.includes('leche') ||
      name.includes('ordeño') ||
      name.includes('vaca')
    ) {
      categories.add('leche');
    }
    if (
      cat === 'genetica' ||
      cat.includes('genetica') ||
      cat.includes('genética') ||
      lbl.includes('genét') ||
      lbl.includes('reproductor') ||
      lbl.includes('biotecnología') ||
      lbl.includes('donante') ||
      name.includes('genét') ||
      name.includes('toro') ||
      name.includes('donante')
    ) {
      categories.add('genetica');
    }
  });

  // Check paddocks
  (farm.paddocks || []).forEach((p) => {
    const pCat = (p.currentLotCategory || '').toLowerCase();
    const pName = (p.assignedLotName || '').toLowerCase();
    if (pCat === 'ceba' || pName.includes('ceba') || pName.includes('novillo')) categories.add('ceba');
    if (pCat === 'cria' || pName.includes('cría') || pName.includes('cria') || pName.includes('ternero')) categories.add('cria');
    if (pCat === 'leche' || pCat === 'doble_proposito' || pName.includes('ordeño') || pName.includes('leche')) categories.add('leche');
    if (pCat === 'genetica' || pName.includes('genét') || pName.includes('donante') || pName.includes('toro')) categories.add('genetica');
  });

  // Check farm profile productionType
  const prod = (farm.profile?.productionType || '').toLowerCase();
  if (prod === 'ceba' || prod.includes('ceba')) categories.add('ceba');
  if (prod === 'cria' || prod.includes('cria') || prod.includes('cría')) categories.add('cria');
  if (prod === 'lecheria_especializada' || prod === 'doble_proposito' || prod.includes('leche')) categories.add('leche');
  if (prod === 'genetica_pura' || prod.includes('genetica') || prod.includes('genética')) categories.add('genetica');

  // Fallback defaults if empty
  if (categories.size === 0) {
    categories.add('ceba');
  }

  return Array.from(categories);
}

/**
 * Checks whether a farm has inventory or production for a specific category.
 */
export function farmHasCategory(farm: FarmDataPackage, category: string): boolean {
  if (category === 'all' || !category) return true;
  const categories = getFarmCategories(farm);
  return categories.includes(category as ProductionCategoryKey);
}

/**
 * Filters a list of farms to only those that contain the requested category inventory.
 */
export function filterFarmsByCategory(
  farms: FarmDataPackage[],
  category: string,
): FarmDataPackage[] {
  if (category === 'all' || !category) return farms;
  return farms.filter((f) => farmHasCategory(f, category));
}

/**
 * Aggregates and segments paddocks by farm with detailed metrics.
 */
export interface FarmPaddocksSegment {
  farm: FarmDataPackage;
  paddocks: PaddockGeo[];
  totalPaddocks: number;
  totalAreaHa: number;
  totalPaddocksAreaHa: number;
  occupiedCount: number;
  restingCount: number;
  readyCount: number;
  restrictedCount: number;
  totalOccupiedHeads: number;
  totalHeadsOccupying: number;
  categories: ProductionCategoryKey[];
  matchingLots: LotRecord[];
}

export function segmentPaddocksByFarms(
  farms: FarmDataPackage[],
  categoryFilter: string = 'all',
): FarmPaddocksSegment[] {
  const filteredFarms = filterFarmsByCategory(farms, categoryFilter);

  return filteredFarms.map((farm) => {
    const paddocks = farm.paddocks || [];
    const totalPaddocks = paddocks.length;
    const totalAreaHa = Number(
      paddocks.reduce((sum, p) => sum + (p.areaHa || 0), 0).toFixed(1),
    );
    const occupiedCount = paddocks.filter((p) => p.status === 'ocupado').length;
    const restingCount = paddocks.filter((p) => p.status === 'descanso').length;
    const readyCount = paddocks.filter((p) => p.status === 'listo').length;
    const restrictedCount = paddocks.filter(
      (p) => p.status === 'inundado' || p.status === 'recuperacion',
    ).length;
    const totalOccupiedHeads = paddocks.reduce(
      (sum, p) => sum + (p.status === 'ocupado' ? p.currentHeads || 0 : 0),
      0,
    );

    const categories = getFarmCategories(farm);
    const matchingLots = (farm.lots || []).filter((l) => {
      if (categoryFilter === 'all') return true;
      const cat = (l.category || '').toLowerCase();
      return cat === categoryFilter || cat.includes(categoryFilter);
    });

    return {
      farm,
      paddocks,
      totalPaddocks,
      totalAreaHa,
      totalPaddocksAreaHa: totalAreaHa,
      occupiedCount,
      restingCount,
      readyCount,
      restrictedCount,
      totalOccupiedHeads,
      totalHeadsOccupying: totalOccupiedHeads,
      categories,
      matchingLots,
    };
  });
}
