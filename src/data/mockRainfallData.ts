import { RainfallRecord } from '../types';

export const MONTH_NAMES_SPANISH = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const MONTH_SHORT_SPANISH = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

// Base historical average monthly rain (mm) for Colombia's typical livestock zones
export const HISTORICAL_MONTHLY_AVERAGES: Record<string, number[]> = {
  // Montería / Córdoba (Caribe - Estación seca Ene-Mar, Lluvias May-Nov)
  'finca-el-roble': [15, 22, 45, 110, 180, 165, 175, 190, 210, 205, 120, 35],
  // Puerto López / Meta (Orinoquía - Lluvioso Abr-Nov)
  'finca-san-juan': [25, 45, 110, 290, 380, 410, 360, 310, 280, 260, 150, 45],
  // Rionegro / Antioquia (Trópico Alto - Lluvias constantes)
  'finca-[#demo-3]': [80, 95, 140, 210, 230, 160, 150, 180, 220, 240, 180, 110],
  // Fallback default
  'default': [30, 40, 80, 180, 240, 220, 210, 220, 230, 220, 140, 50],
};

// Generate realistic daily rainfall data spanning 2023, 2024, 2025, and 2026 up to current month (August 2026)
export const INITIAL_RAINFALL_RECORDS: RainfallRecord[] = [
  // --- RECENT 2026 RECORDS FOR FINCA EL ROBLE ---
  { id: 'rain-2026-08-07-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-08-07', amountMm: 38.5, durationMinutes: 110, intensity: 'fuerte', recordedBy: 'Carlos Mendoza', notes: 'Aguacero de tarde con buena escorrentía para reservorios' },
  { id: 'rain-2026-08-05-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-08-05', amountMm: 14.2, durationMinutes: 45, intensity: 'moderada', recordedBy: 'Carlos Mendoza', notes: 'Lluvia suave en potreros del sector norte' },
  { id: 'rain-2026-08-02-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-08-02', amountMm: 22.0, durationMinutes: 60, intensity: 'moderada', recordedBy: 'Estación Automática', notes: 'Lluvia constante de medianoche' },
  { id: 'rain-2026-07-28-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-07-28', amountMm: 42.0, durationMinutes: 90, intensity: 'torrencial', recordedBy: 'Carlos Mendoza', notes: 'Tormenta eléctrica con vientos fuertes' },
  { id: 'rain-2026-07-22-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-07-22', amountMm: 18.5, durationMinutes: 50, intensity: 'suave', recordedBy: 'Carlos Mendoza', notes: 'Llovizna matutina' },
  { id: 'rain-2026-07-15-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-07-15', amountMm: 31.0, durationMinutes: 80, intensity: 'fuerte', recordedBy: 'Estación Automática', notes: 'Saturación en cañadas' },
  { id: 'rain-2026-07-09-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-07-09', amountMm: 25.4, durationMinutes: 70, intensity: 'moderada', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-07-03-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-07-03', amountMm: 12.0, durationMinutes: 40, intensity: 'suave', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-06-25-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-06-25', amountMm: 48.0, durationMinutes: 130, intensity: 'torrencial', recordedBy: 'Carlos Mendoza', notes: 'Creciente menor en el caño central' },
  { id: 'rain-2026-06-18-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-06-18', amountMm: 29.5, durationMinutes: 75, intensity: 'fuerte', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-06-12-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-06-12', amountMm: 16.0, durationMinutes: 55, intensity: 'moderada', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-06-04-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-06-04', amountMm: 35.0, durationMinutes: 95, intensity: 'fuerte', recordedBy: 'Estación Automática' },
  { id: 'rain-2026-05-29-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-05-29', amountMm: 52.0, durationMinutes: 140, intensity: 'torrencial', recordedBy: 'Carlos Mendoza', notes: 'Pico de lluvias de mayo' },
  { id: 'rain-2026-05-21-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-05-21', amountMm: 28.0, durationMinutes: 80, intensity: 'fuerte', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-05-14-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-05-14', amountMm: 21.0, durationMinutes: 60, intensity: 'moderada', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-05-06-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-05-06', amountMm: 39.0, durationMinutes: 100, intensity: 'fuerte', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-04-26-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-04-26', amountMm: 27.5, durationMinutes: 70, intensity: 'moderada', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-04-18-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-04-18', amountMm: 33.0, durationMinutes: 85, intensity: 'fuerte', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-04-09-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-04-09', amountMm: 19.0, durationMinutes: 50, intensity: 'moderada', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-03-24-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-03-24', amountMm: 15.0, durationMinutes: 40, intensity: 'suave', recordedBy: 'Carlos Mendoza', notes: 'Primeras lluvias de transición' },
  { id: 'rain-2026-03-11-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-03-11', amountMm: 8.5, durationMinutes: 30, intensity: 'suave', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-02-14-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-02-14', amountMm: 12.0, durationMinutes: 35, intensity: 'suave', recordedBy: 'Carlos Mendoza' },
  { id: 'rain-2026-01-20-roble', farmId: 'finca-el-roble', farmName: 'Hacienda El Roble', date: '2026-01-20', amountMm: 6.0, durationMinutes: 20, intensity: 'suave', recordedBy: 'Carlos Mendoza', notes: 'Llovizna esporádica en verano' },

  // --- RECENT 2026 RECORDS FOR HACIENDA SAN JUAN ---
  { id: 'rain-2026-08-06-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-08-06', amountMm: 45.0, durationMinutes: 120, intensity: 'fuerte', recordedBy: 'Jorge Silva', notes: 'Lluvia torrencial en la altillanura' },
  { id: 'rain-2026-08-03-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-08-03', amountMm: 28.0, durationMinutes: 75, intensity: 'moderada', recordedBy: 'Jorge Silva' },
  { id: 'rain-2026-07-29-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-07-29', amountMm: 62.0, durationMinutes: 160, intensity: 'torrencial', recordedBy: 'Jorge Silva', notes: 'Desborde temporal de jagüeyes' },
  { id: 'rain-2026-07-20-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-07-20', amountMm: 35.5, durationMinutes: 90, intensity: 'fuerte', recordedBy: 'Jorge Silva' },
  { id: 'rain-2026-07-12-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-07-12', amountMm: 41.0, durationMinutes: 105, intensity: 'fuerte', recordedBy: 'Jorge Silva' },
  { id: 'rain-2026-06-28-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-06-28', amountMm: 74.0, durationMinutes: 180, intensity: 'torrencial', recordedBy: 'Jorge Silva', notes: 'Máximo registro invernal del mes' },
  { id: 'rain-2026-06-15-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-06-15', amountMm: 48.0, durationMinutes: 115, intensity: 'fuerte', recordedBy: 'Jorge Silva' },
  { id: 'rain-2026-05-25-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-05-25', amountMm: 68.0, durationMinutes: 150, intensity: 'torrencial', recordedBy: 'Jorge Silva' },
  { id: 'rain-2026-05-10-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-05-10', amountMm: 55.0, durationMinutes: 130, intensity: 'fuerte', recordedBy: 'Jorge Silva' },
  { id: 'rain-2026-04-20-sanjuan', farmId: 'finca-san-juan', farmName: 'Hacienda San Juan', date: '2026-04-20', amountMm: 42.0, durationMinutes: 95, intensity: 'fuerte', recordedBy: 'Jorge Silva', notes: 'Inicio de la temporada de invierno llanero' },

  // --- HISTORICAL MONTHLY AGGREGATE SYNTHETIC DATA FOR MULTI-YEAR CONSOLIDATED ANALYSIS ---
];

// Helper: Seed full 2023, 2024, 2025, 2026 records dynamically if empty for a farm/month
export function getAugmentedRainfallRecords(userRecords: RainfallRecord[]): RainfallRecord[] {
  const records = [...userRecords];
  const existingKeys = new Set(records.map((r) => `${r.farmId}-${r.date}`));

  const farmIds = ['finca-el-roble', 'finca-san-juan', 'finca-la-carolina', 'finca-el-paraiso'];
  const years = [2023, 2024, 2025, 2026];

  // Random generator with deterministic seed per farm/date
  const getPseudoMm = (farmId: string, year: number, month: number, day: number) => {
    const baseMonthly = HISTORICAL_MONTHLY_AVERAGES[farmId] || HISTORICAL_MONTHLY_AVERAGES['default'];
    const monthAvg = baseMonthly[month - 1];

    // Introduce year variations (e.g. 2023 El Niño dryer -15%, 2024 La Niña wetter +20%, 2025 normal, 2026 normal)
    let yearFactor = 1.0;
    if (year === 2023) yearFactor = 0.82;
    if (year === 2024) yearFactor = 1.22;
    if (year === 2025) yearFactor = 1.05;
    if (year === 2026) yearFactor = 0.98;

    // Days with rain per month: typically 6-18 days depending on month
    const rainProbability = Math.min(0.7, (monthAvg / 300) * yearFactor);
    const daySeed = (year * 365 + month * 31 + day + farmId.length * 7) % 100 / 100;

    if (daySeed < rainProbability) {
      const dayMm = Math.round((monthAvg / (rainProbability * 30)) * (0.4 + daySeed * 1.2) * yearFactor * 10) / 10;
      return dayMm > 1.0 ? dayMm : 0;
    }
    return 0;
  };

  farmIds.forEach((farmId) => {
    const farmName = farmId === 'finca-el-roble'
      ? 'Hacienda El Roble'
      : farmId === 'finca-san-juan'
      ? 'Hacienda San Juan'
      : farmId === 'finca-la-carolina'
      ? 'Finca La Carolina'
      : 'Hacienda El Paraíso';

    years.forEach((year) => {
      const maxMonth = year === 2026 ? 8 : 12; // 2026 up to August
      for (let month = 1; month <= maxMonth; month++) {
        // Generate 3-5 key rainy days per month for complete charts
        const daysToSample = [4, 11, 18, 25];
        daysToSample.forEach((day) => {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const key = `${farmId}-${dateStr}`;

          if (!existingKeys.has(key)) {
            const mm = getPseudoMm(farmId, year, month, day);
            if (mm > 0) {
              const intensity = mm > 40 ? 'torrencial' : mm > 25 ? 'fuerte' : mm > 12 ? 'moderada' : 'suave';
              records.push({
                id: `gen-${farmId}-${dateStr}`,
                farmId,
                farmName,
                date: dateStr,
                amountMm: mm,
                durationMinutes: Math.round(mm * 2.2),
                intensity,
                recordedBy: 'Estación Meteorológica',
                notes: `Registro de pluviómetro ${farmName}`,
              });
              existingKeys.add(key);
            }
          }
        });
      }
    });
  });

  return records.sort((a, b) => (b.date > a.date ? 1 : -1));
}

// Compute Monthly Totals for a specific farm and year
export function getMonthlyTotals(
  records: RainfallRecord[],
  farmId: string,
  year: number,
): { month: number; monthLabel: string; totalMm: number; rainyDays: number; maxDaily: number; historicalAvg: number }[] {
  const filtered = records.filter((r) => (farmId === 'all' || r.farmId === farmId) && new Date(r.date).getFullYear() === year);
  const baseAvg = HISTORICAL_MONTHLY_AVERAGES[farmId] || HISTORICAL_MONTHLY_AVERAGES['default'];

  return MONTH_SHORT_SPANISH.map((label, idx) => {
    const mNum = idx + 1;
    const monthRecs = filtered.filter((r) => new Date(r.date).getMonth() + 1 === mNum);
    const totalMm = Math.round(monthRecs.reduce((sum, r) => sum + r.amountMm, 0) * 10) / 10;
    const rainyDays = monthRecs.filter((r) => r.amountMm > 0).length;
    const maxDaily = monthRecs.reduce((max, r) => (r.amountMm > max ? r.amountMm : max), 0);

    return {
      month: mNum,
      monthLabel: label,
      totalMm,
      rainyDays,
      maxDaily,
      historicalAvg: baseAvg[idx],
    };
  });
}

// Compute Multi-Year Comparison (2023, 2024, 2025, 2026) for monthly distribution
export function getMultiYearConsolidatedData(
  records: RainfallRecord[],
  farmId: string,
): {
  monthLabel: string;
  mm2023: number;
  mm2024: number;
  mm2025: number;
  mm2026: number;
  historicalAvg: number;
}[] {
  const baseAvg = HISTORICAL_MONTHLY_AVERAGES[farmId] || HISTORICAL_MONTHLY_AVERAGES['default'];

  return MONTH_SHORT_SPANISH.map((label, idx) => {
    const mNum = idx + 1;

    const getMonthTotalForYear = (y: number) => {
      const match = records.filter(
        (r) =>
          (farmId === 'all' || r.farmId === farmId) &&
          new Date(r.date).getFullYear() === y &&
          new Date(r.date).getMonth() + 1 === mNum,
      );
      return Math.round(match.reduce((sum, r) => sum + r.amountMm, 0) * 10) / 10;
    };

    return {
      monthLabel: label,
      mm2023: getMonthTotalForYear(2023),
      mm2024: getMonthTotalForYear(2024),
      mm2025: getMonthTotalForYear(2025),
      mm2026: getMonthTotalForYear(2026),
      historicalAvg: baseAvg[idx],
    };
  });
}

// Compute Annual Totals for Multi-Year comparison bar chart
export function getAnnualTotalsComparison(
  records: RainfallRecord[],
  farmId: string,
): { year: number; totalMm: number; rainyDays: number; avgMonthlyMm: number; wettestMonth: string }[] {
  const years = [2023, 2024, 2025, 2026];

  return years.map((y) => {
    const yearRecs = records.filter(
      (r) => (farmId === 'all' || r.farmId === farmId) && new Date(r.date).getFullYear() === y,
    );
    const totalMm = Math.round(yearRecs.reduce((sum, r) => sum + r.amountMm, 0) * 10) / 10;
    const rainyDays = yearRecs.filter((r) => r.amountMm > 0).length;
    const monthsCount = y === 2026 ? 8 : 12;
    const avgMonthlyMm = Math.round((totalMm / monthsCount) * 10) / 10;

    // Find wettest month
    let maxMonthMm = 0;
    let wettestMonth = 'N/A';
    MONTH_SHORT_SPANISH.slice(0, monthsCount).forEach((mLabel, idx) => {
      const mTotal = yearRecs
        .filter((r) => new Date(r.date).getMonth() === idx)
        .reduce((sum, r) => sum + r.amountMm, 0);
      if (mTotal > maxMonthMm) {
        maxMonthMm = mTotal;
        wettestMonth = mLabel;
      }
    });

    return {
      year: y,
      totalMm,
      rainyDays,
      avgMonthlyMm,
      wettestMonth,
    };
  });
}
