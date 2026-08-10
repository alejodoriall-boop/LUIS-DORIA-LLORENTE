import { LotRecord, ImportedAnimalRecord, LotCategory } from '../types';

const BREEDS_CEBA = ['Brahman Blanco', 'Brahman Rojo', 'Nelore', 'Brangus', 'Gyr X Holstein', 'Simbrah'];
const BREEDS_LECHE = ['Holstein', 'Jerthol', 'Gyr Lechero', 'Normando', 'Ayrshire'];
const BREEDS_GENETICA = ['Brahman PO', 'Gyr Puro Registrado', 'Senepol', 'Nelore Mocho'];

export function generateAnimalsForLot(lot: LotRecord, farmName: string = 'Predio'): ImportedAnimalRecord[] {
  if (lot.animals && lot.animals.length > 0) {
    return lot.animals.map((a) => ({
      ...a,
      origin: a.origin || farmName,
    }));
  }

  const count = Math.min(Math.max(lot.heads, 1), 200); // cap at reasonable UI list size
  const baseWeight = lot.currentAvgWeight || 400;
  const isMale = lot.sexLabel.toLowerCase().includes('macho') || lot.sexLabel.toLowerCase().includes('novillo');
  const category = lot.category || 'ceba';

  const breedsList =
    category === 'leche'
      ? BREEDS_LECHE
      : category === 'genetica'
      ? BREEDS_GENETICA
      : BREEDS_CEBA;

  const generated: ImportedAnimalRecord[] = [];

  for (let i = 1; i <= count; i++) {
    // Generate deterministic variance based on lot id and index
    const variancePct = (( (i * 17 + lot.code.length * 13) % 21) - 10) / 100; // -10% to +10%
    const weightKg = Math.round(baseWeight * (1 + variancePct * 0.5));
    const breed = breedsList[(i + lot.code.length) % breedsList.length];
    const tagPad = i < 10 ? `00${i}` : i < 100 ? `0${i}` : `${i}`;
    const tag = `${lot.code}-${tagPad}`;

    const pricePerKg =
      category === 'genetica'
        ? 15500
        : category === 'ceba'
        ? 9200
        : category === 'leche'
        ? 8800
        : 9500;

    const originType =
      category === 'genetica'
        ? (i % 2 === 0 ? 'puro_registro' : 'nacido')
        : (i % 3 === 0 ? 'nacido' : i % 3 === 1 ? 'comprado' : 'nacido');

    const animalRec: ImportedAnimalRecord = {
      id: `${lot.id}-animal-${i}`,
      tag,
      name: category === 'genetica' ? `Ejemplar ${breed} #${tagPad}` : undefined,
      weightKg,
      sex: isMale ? 'macho' : 'hembra',
      breed,
      pricePerKg,
      totalPrice: weightKg * pricePerKg,
      lotCode: lot.code,
      lotId: lot.id,
      farmName,
      ageMonths: category === 'cria' ? 10 : category === 'ceba' ? 22 : 36,
      originType,
      origin:
        originType === 'nacido'
          ? `Nacido en ${farmName}`
          : originType === 'comprado'
          ? `Subastar S.A. - Lote ${lot.code}`
          : `Asocebú - ${breed} Pureza`,
      notes: `Registrado en ${farmName} - Condición corporal óptima.`,
      status: 'activo',
    };

    if (originType === 'nacido') {
      animalRec.bornInfo = {
        damTag: `Vaca ${400 + (i % 30)} (${breed})`,
        sireTagOrBull: `Toro Gran Campeón ${breed} (B-10)`,
        birthDate: '2024-05-12',
        birthWeightKg: 35,
        earTagInitial: `CHP-ORE-${tag}`,
        tattooNumber: `TAT-${tag}`,
      };
    } else if (originType === 'comprado') {
      animalRec.purchasedInfo = {
        supplierOrAuction: 'Subastar S.A. - Planeta Rica',
        purchaseDate: '2025-11-10',
        purchasePriceTotal: weightKg * pricePerKg,
        purchasePricePerKg: pricePerKg,
        purchaseWeightKg: Math.round(weightKg * 0.85),
        invoiceOrReceipt: `FAC-${8800 + i}`,
      };
    } else if (originType === 'puro_registro') {
      animalRec.purebredInfo = {
        association: 'Asocebú Colombia',
        registrationNumber: `REG-2025-${9000 + i}`,
        registeredName: `Don Gabriel ${breed} ${tag}`,
        sireName: 'JDH Sir Liberty 45/9',
        sireReg: 'US-882104',
        damName: 'Lady Manso 102/5',
        damReg: 'COL-44120',
        maternalGrandSire: '+ + Mr. V8 380/6',
      };
    }

    generated.push(animalRec);
  }

  return generated;
}

export function getPricePerKgByCategory(category: LotCategory): number {
  switch (category) {
    case 'genetica':
      return 15500;
    case 'ceba':
      return 9200;
    case 'leche':
      return 8800;
    case 'cria':
    default:
      return 9600;
  }
}

export interface FarmLotSummary {
  farmName: string;
  farmId?: string;
  totalLots: number;
  totalHeads: number;
  totalWeightKg: number;
  totalWeightTon: number;
  avgWeightPerHead: number;
  avgGdpWeighted: number;
  totalEstimatedValueCop: number;
  lots: (LotRecord & { farmName?: string; farmId?: string })[];
}

export interface GrandTotalizedMetrics {
  totalLots: number;
  totalHeads: number;
  totalWeightKg: number;
  totalWeightTon: number;
  avgWeightGlobal: number;
  avgGdpGlobal: number;
  totalEstimatedValueCop: number;
  farmSummaries: FarmLotSummary[];
}

export function calculateGrandTotalizedMetrics(
  lots: (LotRecord & { farmName?: string; farmId?: string })[]
): GrandTotalizedMetrics {
  let totalLots = lots.length;
  let totalHeads = 0;
  let totalWeightKg = 0;
  let weightedGdpSum = 0;
  let totalEstimatedValueCop = 0;

  const farmMap = new Map<string, FarmLotSummary>();

  lots.forEach((lot) => {
    const farmName = lot.farmName || 'Predio Principal';
    const heads = lot.heads || 0;
    const avgWeight = lot.currentAvgWeight || 0;
    const lotWeight = heads * avgWeight;
    const gdp = lot.gdpCurrent || 0;
    const pricePerKg = getPricePerKgByCategory(lot.category);
    const estimatedValue = lot.estimatedValueCop || lotWeight * pricePerKg;

    totalHeads += heads;
    totalWeightKg += lotWeight;
    weightedGdpSum += gdp * heads;
    totalEstimatedValueCop += estimatedValue;

    if (!farmMap.has(farmName)) {
      farmMap.set(farmName, {
        farmName,
        farmId: lot.farmId,
        totalLots: 0,
        totalHeads: 0,
        totalWeightKg: 0,
        totalWeightTon: 0,
        avgWeightPerHead: 0,
        avgGdpWeighted: 0,
        totalEstimatedValueCop: 0,
        lots: [],
      });
    }

    const farmSum = farmMap.get(farmName)!;
    farmSum.totalLots += 1;
    farmSum.totalHeads += heads;
    farmSum.totalWeightKg += lotWeight;
    farmSum.totalEstimatedValueCop += estimatedValue;
    farmSum.lots.push(lot);
  });

  // Calculate averages per farm
  farmMap.forEach((farmSum) => {
    farmSum.totalWeightTon = Number((farmSum.totalWeightKg / 1000).toFixed(1));
    farmSum.avgWeightPerHead = farmSum.totalHeads > 0 ? Math.round(farmSum.totalWeightKg / farmSum.totalHeads) : 0;
    const farmGdpSum = farmSum.lots.reduce((acc, l) => acc + (l.gdpCurrent || 0) * (l.heads || 0), 0);
    farmSum.avgGdpWeighted = farmSum.totalHeads > 0 ? Number((farmGdpSum / farmSum.totalHeads).toFixed(2)) : 0;
  });

  const totalWeightTon = Number((totalWeightKg / 1000).toFixed(1));
  const avgWeightGlobal = totalHeads > 0 ? Math.round(totalWeightKg / totalHeads) : 0;
  const avgGdpGlobal = totalHeads > 0 ? Number((weightedGdpSum / totalHeads).toFixed(2)) : 0;

  return {
    totalLots,
    totalHeads,
    totalWeightKg,
    totalWeightTon,
    avgWeightGlobal,
    avgGdpGlobal,
    totalEstimatedValueCop,
    farmSummaries: Array.from(farmMap.values()),
  };
}
