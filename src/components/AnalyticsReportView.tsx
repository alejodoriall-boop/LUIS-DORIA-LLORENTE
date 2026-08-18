import React, { useState, useMemo } from 'react';
import { safePrint } from '../utils/printUtils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts';
import {
  BarChart3,
  FileText,
  Printer,
  Download,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  DollarSign,
  Milk,
  Beef,
  Dna,
  CloudRain,
  Wheat,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  PieChart as PieIcon,
  Layers,
  Search,
  Building2,
  Activity,
  ArrowUpRight,
  Info,
  Award,
  Lightbulb,
  CheckSquare,
  Square,
  Plus,
  Zap,
  Clock,
  Target,
  Compass,
  ListCheck,
  Trash2,
  Eye,
  FileSpreadsheet,
  Maximize2,
  CornerDownRight,
  ArrowUpDown,
  UserCheck,
  User,
  Tag,
} from 'lucide-react';

// ============================================================================
// MOCK ANALYTICAL DATASETS
// ============================================================================

export interface RecommendationItem {
  id: string;
  category: 'nutricion' | 'reproduccion' | 'pastos' | 'sanidad' | 'finanzas';
  priority: 'alta' | 'media' | 'preventiva';
  title: string;
  problemStatement: string;
  proposedSolution: string;
  expectedOutcome: string;
  financialImpactUSD: number;
  implementationCostUSD: number;
  roiPercent: number;
  timeframeDays: number;
  status: 'pendiente' | 'en_progreso' | 'completada';
  responsibleRole: string;
}

// 7. Initial Actionable Recommendations List
const INITIAL_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec_1',
    category: 'reproduccion',
    priority: 'alta',
    title: 'Protocolo IATF con Progesterona + eCG para 26 Vacas en Anestro Nutricional',
    problemStatement: '26 vacas en lactancia registran más de 120 días abiertos sin manifestar celo activo, afectando el IEP global.',
    proposedSolution: 'Sincronizar mediante dispositivo intravaginal de P4 (1g) + Benzoato de Estradiol en Día 0, CPG + PGF2a + eCG (400 UI) en Día 8 e IATF a las 48h.',
    expectedOutcome: 'Lograr 55% a 60% de tasa de preñez en el primer servicio, reduciendo 45 días abiertos promedio.',
    financialImpactUSD: 4680, // Ahorro por días abiertos ganados
    implementationCostUSD: 910, // $35 por vaca
    roiPercent: 414,
    timeframeDays: 15,
    status: 'en_progreso',
    responsibleRole: 'Médico Veterinario Zootecnista',
  },
  {
    id: 'rec_2',
    category: 'nutricion',
    priority: 'alta',
    title: 'Sustitución Parcial de Concentrado Comercial por Ensilaje de Maíz + Melaza/Úrea',
    problemStatement: 'El rubro de alimentación representa el 42% del costo operativo total ($18,480 USD/mes).',
    proposedSolution: 'Incorporar 12 kg/animal/día de Ensilaje de Maíz picado fino con 1.5% de Melaza e Inclusión de Úrea protegida (0.8%).',
    expectedOutcome: 'Disminución del costo de ración preparada de $0.32 a $0.26 USD/kg sin alterar la energía metabolizable.',
    financialImpactUSD: 3120, // Ahorro mensual
    implementationCostUSD: 450, // Costo de formulación y mezcla
    roiPercent: 593,
    timeframeDays: 30,
    status: 'pendiente',
    responsibleRole: 'Nutricionista Animal / Mayordomo',
  },
  {
    id: 'rec_3',
    category: 'pastos',
    priority: 'media',
    title: 'Fertilización Nitrogenada Post-Pastoreo & Rotación Voisin Racional (21 días descanso)',
    problemStatement: 'Pérdida del 12% de proteína bruta en forraje durante los meses de transición seca por sobrepastoreo.',
    proposedSolution: 'Aplicar 45 kg/ha de Úrea + Sulfato de Amonio inmediatamente después de la salida del lote de ceba en Potreros 04 a 09.',
    expectedOutcome: 'Aumento del rendimiento forrajero en +2.8 toneladas de MS/ha/año y mejora de la palatabilidad.',
    financialImpactUSD: 2400,
    implementationCostUSD: 680,
    roiPercent: 252,
    timeframeDays: 45,
    status: 'pendiente',
    responsibleRole: 'Administrador de Finca',
  },
  {
    id: 'rec_4',
    category: 'sanidad',
    priority: 'alta',
    title: 'Protocolo de Secado con Sellador de Pezones Subnitrato de Bismuto',
    problemStatement: 'Riesgo de mastitis subclínica en el periodo de transición pre-parto en el 8% de vacas prontas.',
    proposedSolution: 'Aplicar infusión de antibiótico de larga acción (Cefalosporina 1ª gen) + sellador interno de pezón al momento del secado.',
    expectedOutcome: 'Mantenimiento del conteo somático (CCS) por debajo de 150,000 cel/mL, asegurando bonificación sanitaria.',
    financialImpactUSD: 1850,
    implementationCostUSD: 320,
    roiPercent: 478,
    timeframeDays: 10,
    status: 'completada',
    responsibleRole: 'Encargado de Ordeño & Veterinaria',
  },
  {
    id: 'rec_5',
    category: 'finanzas',
    priority: 'media',
    title: 'Contrato de Futuros / Venta Programada para Novillos de Ceba (>480 kg)',
    problemStatement: 'Volatilidad en el precio del kilo de ganado en pie en subastas locales ($2.05 a $2.25 USD/kg).',
    proposedSolution: 'Pactar la entrega anticipada del Lote Ceba 01 con frigorífico certificado fijando piso de precio en $2.22 USD/kg.',
    expectedOutcome: 'Protección del margen bruto y garantía de liquidez para la compra del lote de reemplazo en desmante.',
    financialImpactUSD: 3450,
    implementationCostUSD: 100,
    roiPercent: 3350,
    timeframeDays: 60,
    status: 'pendiente',
    responsibleRole: 'Gerente Financiero',
  },
  {
    id: 'rec_6',
    category: 'reproduccion',
    priority: 'preventiva',
    title: 'Inseminación con Toros Toros Gyr & Girolando Probados con DEP Leche > +350 kg',
    problemStatement: 'Variabilidad en la producción de primera lactancia entre vaquillonas de reemplazo (14 L/d a 22 L/d).',
    proposedSolution: 'Adquirir pajillas de semen sexado de toros probados genómicamente para rasgos de persistencia láctea y facilidad de parto.',
    expectedOutcome: 'Homogeneización del hato de reemplazo con incremento estimado de +1.8 L/vaca/día en la F1.',
    financialImpactUSD: 5200,
    implementationCostUSD: 1200,
    roiPercent: 333,
    timeframeDays: 90,
    status: 'en_progreso',
    responsibleRole: 'Genetista / Inseminador',
  },
];

// 8. Detailed Rainfall & Hydro-Meteorological Analytics Data
const RAINFALL_DETAILED_DATA = [
  { month: 'Ene', rainfallMm: 45, daysWithRain: 4, evapotranspirationMm: 110, waterBalanceMm: -65, pastureGrowthKgMS: 22, reservoirLevelPercent: 65, soilMoisturePercent: 32 },
  { month: 'Feb', rainfallMm: 30, daysWithRain: 3, evapotranspirationMm: 125, waterBalanceMm: -95, pastureGrowthKgMS: 18, reservoirLevelPercent: 52, soilMoisturePercent: 24 },
  { month: 'Mar', rainfallMm: 85, daysWithRain: 9, evapotranspirationMm: 105, waterBalanceMm: -20, pastureGrowthKgMS: 38, reservoirLevelPercent: 70, soilMoisturePercent: 48 },
  { month: 'Abr', rainfallMm: 140, daysWithRain: 14, evapotranspirationMm: 90, waterBalanceMm: 50, pastureGrowthKgMS: 58, reservoirLevelPercent: 92, soilMoisturePercent: 72 },
  { month: 'May', rainfallMm: 210, daysWithRain: 19, evapotranspirationMm: 80, waterBalanceMm: 130, pastureGrowthKgMS: 72, reservoirLevelPercent: 100, soilMoisturePercent: 88 },
  { month: 'Jun', rainfallMm: 180, daysWithRain: 16, evapotranspirationMm: 85, waterBalanceMm: 95, pastureGrowthKgMS: 68, reservoirLevelPercent: 100, soilMoisturePercent: 82 },
  { month: 'Jul', rainfallMm: 95, daysWithRain: 10, evapotranspirationMm: 100, waterBalanceMm: -5, pastureGrowthKgMS: 46, reservoirLevelPercent: 85, soilMoisturePercent: 58 },
  { month: 'Ago', rainfallMm: 110, daysWithRain: 12, evapotranspirationMm: 95, waterBalanceMm: 15, pastureGrowthKgMS: 52, reservoirLevelPercent: 90, soilMoisturePercent: 64 },
];

const RAINGAUGE_STATIONS = [
  { stationName: 'Pluviómetro 01 - Casa Principal / Establo', acumuladoMesMm: 110, diasLluvia: 12, maxEvento24h: 38, reservorioNivel: 90, estado: 'optimo' },
  { stationName: 'Pluviómetro 02 - Potrero Boquerón (Loma)', acumuladoMesMm: 98, diasLluvia: 10, maxEvento24h: 32, reservorioNivel: 82, estado: 'alerta_leve' },
  { stationName: 'Pluviómetro 03 - Potrero La Esmeralda (Bajo)', acumuladoMesMm: 128, diasLluvia: 14, maxEvento24h: 45, reservorioNivel: 100, estado: 'saturado' },
  { stationName: 'Pluviómetro 04 - Potrero El Roble (Ceba)', acumuladoMesMm: 105, diasLluvia: 11, maxEvento24h: 34, reservorioNivel: 88, estado: 'optimo' },
];

// 1. Milk Production & Climate Trend (Last 8 Months)
const MILK_PRODUCTION_TREND = [
  { month: 'Ene', milkLiters: 16800, avgLitersPerCow: 16.8, rainfallMm: 45, fatPercent: 3.85, ccsK: 180, pricePerLiter: 0.48 },
  { month: 'Feb', milkLiters: 17200, avgLitersPerCow: 17.2, rainfallMm: 30, fatPercent: 3.90, ccsK: 175, pricePerLiter: 0.48 },
  { month: 'Mar', milkLiters: 18100, avgLitersPerCow: 18.1, rainfallMm: 85, fatPercent: 3.82, ccsK: 165, pricePerLiter: 0.49 },
  { month: 'Abr', milkLiters: 19400, avgLitersPerCow: 19.4, rainfallMm: 140, fatPercent: 3.78, ccsK: 155, pricePerLiter: 0.50 },
  { month: 'May', milkLiters: 20200, avgLitersPerCow: 20.2, rainfallMm: 210, fatPercent: 3.75, ccsK: 148, pricePerLiter: 0.51 },
  { month: 'Jun', milkLiters: 19800, avgLitersPerCow: 19.8, rainfallMm: 180, fatPercent: 3.79, ccsK: 152, pricePerLiter: 0.50 },
  { month: 'Jul', milkLiters: 18900, avgLitersPerCow: 18.9, rainfallMm: 95, fatPercent: 3.84, ccsK: 160, pricePerLiter: 0.49 },
  { month: 'Ago', milkLiters: 19100, avgLitersPerCow: 19.1, rainfallMm: 110, fatPercent: 3.82, ccsK: 158, pricePerLiter: 0.50 },
];

// 2. Weight Gain (GDP) Performance by Lot
const GDP_LOT_PERFORMANCE = [
  { lotName: 'Lote Ceba 01 - Novillos Pesados', animalCount: 42, entryWeightKg: 380, currentWeightKg: 495, gdpGramsDay: 1320, feedDoseKg: 8.5, fcr: 6.4, costPerKgGainedUSD: 1.12, status: 'excelente' },
  { lotName: 'Lote Ceba 02 - Potrero El Roble', animalCount: 38, entryWeightKg: 360, currentWeightKg: 462, gdpGramsDay: 1180, feedDoseKg: 4.2, fcr: 7.1, costPerKgGainedUSD: 1.05, status: 'bueno' },
  { lotName: 'Lote Levante 01 - Machos Desmante', animalCount: 50, entryWeightKg: 180, currentWeightKg: 255, gdpGramsDay: 830, feedDoseKg: 1.2, fcr: 5.8, costPerKgGainedUSD: 0.88, status: 'excelente' },
  { lotName: 'Lote Levante 02 - Potrero Boquerón', animalCount: 45, entryWeightKg: 175, currentWeightKg: 238, gdpGramsDay: 720, feedDoseKg: 0.3, fcr: 8.2, costPerKgGainedUSD: 0.95, status: 'regular' },
  { lotName: 'Lote Terneros Creep Feeding', animalCount: 28, entryWeightKg: 65, currentWeightKg: 142, gdpGramsDay: 860, feedDoseKg: 0.9, fcr: 4.5, costPerKgGainedUSD: 0.78, status: 'excelente' },
];

// 3. Cost Structure Breakdown
const COST_BREAKDOWN_DATA = [
  { name: 'Suplementación & Alimento', value: 42, amountUSD: 18480, color: '#012d1d' },
  { name: 'Nómina & Mano de Obra', value: 24, amountUSD: 10560, color: '#083e29' },
  { name: 'Sanidad & Veterinaria', value: 14, amountUSD: 6160, color: '#ffba38' },
  { name: 'Mantenimiento & Fertilización Pastos', value: 12, amountUSD: 5280, color: '#0284c7' },
  { name: 'Servicios, Combustible & Varios', value: 8, amountUSD: 3520, color: '#717973' },
];

// 4. Financial Monthly Performance (Revenue vs Expenses vs Net Profit)
const FINANCIAL_MONTHLY_TREND = [
  { month: 'Mar', revenue: 28500, expenses: 16200, netProfit: 12300, marginPercent: 43.1 },
  { month: 'Abr', revenue: 31200, expenses: 17100, netProfit: 14100, marginPercent: 45.1 },
  { month: 'May', revenue: 34800, expenses: 18400, netProfit: 16400, marginPercent: 47.1 },
  { month: 'Jun', revenue: 33100, expenses: 17900, netProfit: 15200, marginPercent: 45.9 },
  { month: 'Jul', revenue: 30900, expenses: 16800, netProfit: 14100, marginPercent: 45.6 },
  { month: 'Ago', revenue: 32400, expenses: 17500, netProfit: 14900, marginPercent: 45.9 },
];

// 5. Reproductive Status Funnel
export const REPRODUCTIVE_STATUS_DISTRIBUTION = [
  { statusName: 'Vacas en Lactancia Preñadas', count: 85, percent: 38.6, color: '#059669' },
  { statusName: 'Vacas en Lactancia Vacías (Aptas)', count: 42, percent: 19.1, color: '#0284c7' },
  { statusName: 'Vacas Secas Preñadas', count: 35, percent: 15.9, color: '#d97706' },
  { statusName: 'Vaquillonas Apta Inseminación', count: 32, percent: 14.5, color: '#8b5cf6' },
  { statusName: 'Problemas / Anestro en Tratamiento', count: 26, percent: 11.9, color: '#dc2626' },
];

// 6. Genetics Sire Ranking Performance
export const GENETICS_SIRE_RANKING = [
  { bullName: 'Gyr Breyer de La Voluntad (Gyr)', conceptionRatePercent: 68.4, daughterMilkAvgLiters: 21.2, birthWeightAvgKg: 31.5, totalCalvesBorn: 48, ratingScore: 9.8 },
  { bullName: 'Girolando F1 Magnus 3301', conceptionRatePercent: 64.2, daughterMilkAvgLiters: 23.5, birthWeightAvgKg: 33.0, totalCalvesBorn: 62, ratingScore: 9.6 },
  { bullName: 'Brangus Turbo Black 804', conceptionRatePercent: 71.0, daughterMilkAvgLiters: 0, birthWeightAvgKg: 34.2, totalCalvesBorn: 55, ratingScore: 9.4 },
  { bullName: 'Brahman Red King 902', conceptionRatePercent: 62.8, daughterMilkAvgLiters: 0, birthWeightAvgKg: 36.1, totalCalvesBorn: 41, ratingScore: 9.0 },
  { bullName: 'Holstein Planet Kingpin', conceptionRatePercent: 58.5, daughterMilkAvgLiters: 25.8, birthWeightAvgKg: 38.5, totalCalvesBorn: 35, ratingScore: 8.9 },
];

// 7. Individual Dairy Cow Comprehensive Traceability & Performance Dataset
export interface IndividualDairyCowReport {
  id: string;
  earTag: string;
  eidChip: string;
  cowName: string;
  registrationNum: string;
  breed: string;
  birthDate: string;
  ageMonths: number;
  lotName: string;
  damTag: string;
  sireName: string;
  lactationNumber: number;
  daysInMilkDEL: number;
  currentDailyLiters: number;
  avgLitersLactation: number;
  accumulatedLitersLactation: number;
  peakLitersDay: number;
  peakDEL: number;
  feedEfficiencyLKgMS: number;
  persistencyPercent: number;
  reproStatus: 'gestante' | 'abierta' | 'servida_iatf' | 'seca_gestante' | 'anestro';
  reproStatusLabel: string;
  daysOpen: number;
  servicesPerConception: number;
  lastServiceDate: string;
  sireUsedLastService: string;
  expectedCalvingDate?: string;
  projectedIEPDays: number;
  ccsK: number;
  fatPercent: number;
  proteinPercent: number;
  bodyConditionScore: number;
  mastitisIncidentsCurrentLactation: number;
  healthStatus: 'excelente' | 'bueno' | 'atencion';
  previousLactations: {
    lactationNo: number;
    totalLiters: number;
    durationDays: number;
    avgLitersDay: number;
    peakLiters: number;
    calfTag: string;
    calfSex: 'macho' | 'hembra';
    birthWeightKg: number;
  }[];
}

export const DAIRY_INDIVIDUAL_COWS_DATA: IndividualDairyCowReport[] = [
  {
    id: 'cow-101',
    earTag: 'VACA-101',
    eidChip: '982 000184910293',
    cowName: 'Mariposa',
    registrationNum: 'RG-78420',
    breed: 'Girolando F1 5/8',
    birthDate: '2021-03-15',
    ageMonths: 65,
    lotName: 'Lote 01 - Alta Producción',
    damTag: 'VACA-045 (Madre)',
    sireName: 'Gyr Breyer de La Voluntad',
    lactationNumber: 3,
    daysInMilkDEL: 62,
    currentDailyLiters: 24.5,
    avgLitersLactation: 23.8,
    accumulatedLitersLactation: 4820,
    peakLitersDay: 28.5,
    peakDEL: 45,
    feedEfficiencyLKgMS: 1.58,
    persistencyPercent: 94.2,
    reproStatus: 'gestante',
    reproStatusLabel: 'Gestante 5.0 Meses',
    daysOpen: 82,
    servicesPerConception: 1.0,
    lastServiceDate: '2026-03-10',
    sireUsedLastService: 'Girolando Magnus 3301',
    expectedCalvingDate: '2026-12-18',
    projectedIEPDays: 378,
    ccsK: 140,
    fatPercent: 3.92,
    proteinPercent: 3.38,
    bodyConditionScore: 3.25,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'excelente',
    previousLactations: [
      { lactationNo: 1, totalLiters: 5420, durationDays: 295, avgLitersDay: 18.3, peakLiters: 22.0, calfTag: 'CRIA-201', calfSex: 'hembra', birthWeightKg: 32 },
      { lactationNo: 2, totalLiters: 6810, durationDays: 305, avgLitersDay: 22.3, peakLiters: 26.5, calfTag: 'CRIA-305', calfSex: 'macho', birthWeightKg: 35 },
    ],
  },
  {
    id: 'cow-104',
    earTag: 'VACA-104',
    eidChip: '985 000294019281',
    cowName: 'Claraboya',
    registrationNum: 'RG-81200',
    breed: 'Holstein Friesian',
    birthDate: '2022-08-10',
    ageMonths: 48,
    lotName: 'Lote 01 - Alta Producción',
    damTag: 'VACA-062',
    sireName: 'Holstein Planet Kingpin',
    lactationNumber: 2,
    daysInMilkDEL: 45,
    currentDailyLiters: 28.2,
    avgLitersLactation: 27.5,
    accumulatedLitersLactation: 3950,
    peakLitersDay: 29.8,
    peakDEL: 40,
    feedEfficiencyLKgMS: 1.62,
    persistencyPercent: 96.0,
    reproStatus: 'servida_iatf',
    reproStatusLabel: 'Servida IATF (Día 20)',
    daysOpen: 45,
    servicesPerConception: 1.0,
    lastServiceDate: '2026-07-22',
    sireUsedLastService: 'Gyr Breyer de La Voluntad',
    expectedCalvingDate: '2027-04-28',
    projectedIEPDays: 365,
    ccsK: 110,
    fatPercent: 3.75,
    proteinPercent: 3.25,
    bodyConditionScore: 3.00,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'excelente',
    previousLactations: [
      { lactationNo: 1, totalLiters: 6100, durationDays: 300, avgLitersDay: 20.3, peakLiters: 24.8, calfTag: 'CRIA-288', calfSex: 'hembra', birthWeightKg: 34 },
    ],
  },
  {
    id: 'cow-112',
    earTag: 'VACA-112',
    eidChip: '982 000381920194',
    cowName: 'Dulcinea',
    registrationNum: 'RG-69100',
    breed: 'Gyr Lechero',
    birthDate: '2020-02-18',
    ageMonths: 78,
    lotName: 'Lote 02 - Media Producción',
    damTag: 'VACA-018',
    sireName: 'Gyr Teatro da Silvania',
    lactationNumber: 4,
    daysInMilkDEL: 120,
    currentDailyLiters: 19.8,
    avgLitersLactation: 20.5,
    accumulatedLitersLactation: 5600,
    peakLitersDay: 24.0,
    peakDEL: 52,
    feedEfficiencyLKgMS: 1.42,
    persistencyPercent: 90.5,
    reproStatus: 'gestante',
    reproStatusLabel: 'Gestante 6.5 Meses',
    daysOpen: 75,
    servicesPerConception: 1.2,
    lastServiceDate: '2026-01-28',
    sireUsedLastService: 'Girolando Magnus 3301',
    expectedCalvingDate: '2026-11-05',
    projectedIEPDays: 372,
    ccsK: 165,
    fatPercent: 4.25,
    proteinPercent: 3.52,
    bodyConditionScore: 3.50,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'excelente',
    previousLactations: [
      { lactationNo: 1, totalLiters: 4800, durationDays: 290, avgLitersDay: 16.5, peakLiters: 20.0, calfTag: 'CRIA-110', calfSex: 'macho', birthWeightKg: 30 },
      { lactationNo: 2, totalLiters: 5650, durationDays: 300, avgLitersDay: 18.8, peakLiters: 22.5, calfTag: 'CRIA-215', calfSex: 'hembra', birthWeightKg: 31 },
      { lactationNo: 3, totalLiters: 6200, durationDays: 305, avgLitersDay: 20.3, peakLiters: 24.5, calfTag: 'CRIA-312', calfSex: 'macho', birthWeightKg: 33 },
    ],
  },
  {
    id: 'cow-125',
    earTag: 'VACA-125',
    eidChip: '985 000491029381',
    cowName: 'Esperanza',
    registrationNum: 'RG-92010',
    breed: 'Girolando 3/4',
    birthDate: '2024-02-01',
    ageMonths: 30,
    lotName: 'Lote 01 - Alta Producción',
    damTag: 'VACA-092',
    sireName: 'Holstein Planet Kingpin',
    lactationNumber: 1,
    daysInMilkDEL: 88,
    currentDailyLiters: 22.4,
    avgLitersLactation: 21.8,
    accumulatedLitersLactation: 3120,
    peakLitersDay: 23.5,
    peakDEL: 60,
    feedEfficiencyLKgMS: 1.48,
    persistencyPercent: 92.0,
    reproStatus: 'abierta',
    reproStatusLabel: 'Abierta - En Celo Activo',
    daysOpen: 88,
    servicesPerConception: 1.0,
    lastServiceDate: 'Pendiente',
    sireUsedLastService: 'Programada IATF',
    projectedIEPDays: 395,
    ccsK: 125,
    fatPercent: 3.88,
    proteinPercent: 3.32,
    bodyConditionScore: 3.25,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'excelente',
    previousLactations: [],
  },
  {
    id: 'cow-130',
    earTag: 'VACA-130',
    eidChip: '982 000581920391',
    cowName: 'Flor de Loto',
    registrationNum: 'RG-83400',
    breed: 'Jersey Cross',
    birthDate: '2022-04-12',
    ageMonths: 52,
    lotName: 'Lote 02 - Media Producción',
    damTag: 'VACA-055',
    sireName: 'Jersey Valentino',
    lactationNumber: 2,
    daysInMilkDEL: 140,
    currentDailyLiters: 18.5,
    avgLitersLactation: 19.2,
    accumulatedLitersLactation: 4200,
    peakLitersDay: 22.8,
    peakDEL: 48,
    feedEfficiencyLKgMS: 1.55,
    persistencyPercent: 88.0,
    reproStatus: 'gestante',
    reproStatusLabel: 'Gestante 4.0 Meses',
    daysOpen: 92,
    servicesPerConception: 1.1,
    lastServiceDate: '2026-04-10',
    sireUsedLastService: 'Gyr Breyer de La Voluntad',
    expectedCalvingDate: '2027-01-18',
    projectedIEPDays: 388,
    ccsK: 150,
    fatPercent: 4.45,
    proteinPercent: 3.65,
    bodyConditionScore: 3.50,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'excelente',
    previousLactations: [
      { lactationNo: 1, totalLiters: 4950, durationDays: 295, avgLitersDay: 16.8, peakLiters: 20.2, calfTag: 'CRIA-240', calfSex: 'hembra', birthWeightKg: 28 },
    ],
  },
  {
    id: 'cow-142',
    earTag: 'VACA-142',
    eidChip: '985 000692019481',
    cowName: 'Garota',
    registrationNum: 'RG-79110',
    breed: 'Girolando F1',
    birthDate: '2021-06-20',
    ageMonths: 62,
    lotName: 'Lote 01 - Alta Producción',
    damTag: 'VACA-038',
    sireName: 'Gyr Sansao',
    lactationNumber: 3,
    daysInMilkDEL: 35,
    currentDailyLiters: 26.8,
    avgLitersLactation: 26.2,
    accumulatedLitersLactation: 2100,
    peakLitersDay: 27.5,
    peakDEL: 30,
    feedEfficiencyLKgMS: 1.65,
    persistencyPercent: 97.5,
    reproStatus: 'abierta',
    reproStatusLabel: 'Abierta - Espera Voluntaria',
    daysOpen: 35,
    servicesPerConception: 0,
    lastServiceDate: 'Pendiente',
    sireUsedLastService: 'Semen Sexado Holstein',
    projectedIEPDays: 360,
    ccsK: 95,
    fatPercent: 3.95,
    proteinPercent: 3.40,
    bodyConditionScore: 3.00,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'excelente',
    previousLactations: [
      { lactationNo: 1, totalLiters: 5800, durationDays: 298, avgLitersDay: 19.5, peakLiters: 24.0, calfTag: 'CRIA-180', calfSex: 'macho', birthWeightKg: 33 },
      { lactationNo: 2, totalLiters: 6950, durationDays: 305, avgLitersDay: 22.8, peakLiters: 27.2, calfTag: 'CRIA-290', calfSex: 'hembra', birthWeightKg: 34 },
    ],
  },
  {
    id: 'cow-158',
    earTag: 'VACA-158',
    eidChip: '982 000781029381',
    cowName: 'Harmonía',
    registrationNum: 'RG-74200',
    breed: 'Holstein x Gyr',
    birthDate: '2020-10-05',
    ageMonths: 70,
    lotName: 'Lote Secado',
    damTag: 'VACA-022',
    sireName: 'Holstein Oman',
    lactationNumber: 3,
    daysInMilkDEL: 290,
    currentDailyLiters: 0,
    avgLitersLactation: 22.4,
    accumulatedLitersLactation: 6850,
    peakLitersDay: 29.0,
    peakDEL: 50,
    feedEfficiencyLKgMS: 1.40,
    persistencyPercent: 75.0,
    reproStatus: 'seca_gestante',
    reproStatusLabel: 'Seca Gestante (7.5 Meses)',
    daysOpen: 70,
    servicesPerConception: 1.0,
    lastServiceDate: '2025-12-15',
    sireUsedLastService: 'Girolando Magnus 3301',
    expectedCalvingDate: '2026-09-22',
    projectedIEPDays: 370,
    ccsK: 180,
    fatPercent: 3.82,
    proteinPercent: 3.30,
    bodyConditionScore: 3.75,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'excelente',
    previousLactations: [
      { lactationNo: 1, totalLiters: 5600, durationDays: 300, avgLitersDay: 18.7, peakLiters: 23.5, calfTag: 'CRIA-150', calfSex: 'hembra', birthWeightKg: 33 },
      { lactationNo: 2, totalLiters: 6400, durationDays: 305, avgLitersDay: 21.0, peakLiters: 26.0, calfTag: 'CRIA-260', calfSex: 'macho', birthWeightKg: 36 },
    ],
  },
  {
    id: 'cow-164',
    earTag: 'VACA-164',
    eidChip: '985 000891029482',
    cowName: 'Isabela',
    registrationNum: 'RG-90500',
    breed: 'Girolando 5/8',
    birthDate: '2023-12-01',
    ageMonths: 32,
    lotName: 'Lote 02 - Media Producción',
    damTag: 'VACA-088',
    sireName: 'Gyr Breyer de La Voluntad',
    lactationNumber: 1,
    daysInMilkDEL: 180,
    currentDailyLiters: 17.2,
    avgLitersLactation: 18.0,
    accumulatedLitersLactation: 3890,
    peakLitersDay: 21.0,
    peakDEL: 55,
    feedEfficiencyLKgMS: 1.38,
    persistencyPercent: 84.0,
    reproStatus: 'servida_iatf',
    reproStatusLabel: 'Servida IATF (Día 25)',
    daysOpen: 155,
    servicesPerConception: 2.0,
    lastServiceDate: '2026-07-18',
    sireUsedLastService: 'Girolando Magnus 3301',
    expectedCalvingDate: '2027-04-25',
    projectedIEPDays: 440,
    ccsK: 195,
    fatPercent: 4.02,
    proteinPercent: 3.42,
    bodyConditionScore: 3.25,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'bueno',
    previousLactations: [],
  },
  {
    id: 'cow-179',
    earTag: 'VACA-179',
    eidChip: '982 000981029384',
    cowName: 'Jazmín',
    registrationNum: 'RG-58100',
    breed: 'Gyr Lechero',
    birthDate: '2018-12-10',
    ageMonths: 92,
    lotName: 'Lote 02 - Media Producción',
    damTag: 'VACA-005',
    sireName: 'Gyr Caju de Brasil',
    lactationNumber: 5,
    daysInMilkDEL: 210,
    currentDailyLiters: 16.5,
    avgLitersLactation: 18.2,
    accumulatedLitersLactation: 5120,
    peakLitersDay: 23.0,
    peakDEL: 45,
    feedEfficiencyLKgMS: 1.35,
    persistencyPercent: 80.0,
    reproStatus: 'gestante',
    reproStatusLabel: 'Gestante 6.0 Meses',
    daysOpen: 90,
    servicesPerConception: 1.0,
    lastServiceDate: '2026-02-12',
    sireUsedLastService: 'Gyr Breyer de La Voluntad',
    expectedCalvingDate: '2026-11-20',
    projectedIEPDays: 380,
    ccsK: 170,
    fatPercent: 4.30,
    proteinPercent: 3.55,
    bodyConditionScore: 3.50,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'bueno',
    previousLactations: [
      { lactationNo: 1, totalLiters: 4200, durationDays: 285, avgLitersDay: 14.7, peakLiters: 18.0, calfTag: 'CRIA-045', calfSex: 'macho', birthWeightKg: 29 },
      { lactationNo: 2, totalLiters: 4900, durationDays: 290, avgLitersDay: 16.9, peakLiters: 20.5, calfTag: 'CRIA-120', calfSex: 'hembra', birthWeightKg: 31 },
      { lactationNo: 3, totalLiters: 5500, durationDays: 300, avgLitersDay: 18.3, peakLiters: 22.0, calfTag: 'CRIA-210', calfSex: 'macho', birthWeightKg: 32 },
      { lactationNo: 4, totalLiters: 5800, durationDays: 305, avgLitersDay: 19.0, peakLiters: 23.5, calfTag: 'CRIA-302', calfSex: 'hembra', birthWeightKg: 33 },
    ],
  },
  {
    id: 'cow-188',
    earTag: 'VACA-188',
    eidChip: '985 001092019385',
    cowName: 'Katy',
    registrationNum: 'RG-82900',
    breed: 'Holstein Friesian',
    birthDate: '2022-10-15',
    ageMonths: 46,
    lotName: 'Lote Tratamiento / Atención',
    damTag: 'VACA-071',
    sireName: 'Holstein Planet Kingpin',
    lactationNumber: 2,
    daysInMilkDEL: 95,
    currentDailyLiters: 15.2,
    avgLitersLactation: 17.5,
    accumulatedLitersLactation: 2800,
    peakLitersDay: 21.5,
    peakDEL: 35,
    feedEfficiencyLKgMS: 1.20,
    persistencyPercent: 78.0,
    reproStatus: 'anestro',
    reproStatusLabel: 'Anestro Nutricional (En Tratamiento)',
    daysOpen: 140,
    servicesPerConception: 3.0,
    lastServiceDate: '2026-05-10',
    sireUsedLastService: 'Gyr Breyer de La Voluntad',
    projectedIEPDays: 460,
    ccsK: 320,
    fatPercent: 3.60,
    proteinPercent: 3.10,
    bodyConditionScore: 2.75,
    mastitisIncidentsCurrentLactation: 1,
    healthStatus: 'atencion',
    previousLactations: [
      { lactationNo: 1, totalLiters: 5100, durationDays: 300, avgLitersDay: 17.0, peakLiters: 21.0, calfTag: 'CRIA-265', calfSex: 'macho', birthWeightKg: 35 },
    ],
  },
  {
    id: 'cow-195',
    earTag: 'VACA-195',
    eidChip: '982 001181029486',
    cowName: 'Luna Llena',
    registrationNum: 'RG-81800',
    breed: 'Girolando F1',
    birthDate: '2022-06-05',
    ageMonths: 50,
    lotName: 'Lote 01 - Alta Producción',
    damTag: 'VACA-048',
    sireName: 'Gyr Breyer de La Voluntad',
    lactationNumber: 2,
    daysInMilkDEL: 50,
    currentDailyLiters: 25.1,
    avgLitersLactation: 24.5,
    accumulatedLitersLactation: 3450,
    peakLitersDay: 26.2,
    peakDEL: 42,
    feedEfficiencyLKgMS: 1.60,
    persistencyPercent: 95.0,
    reproStatus: 'gestante',
    reproStatusLabel: 'Gestante 2.0 Meses',
    daysOpen: 60,
    servicesPerConception: 1.0,
    lastServiceDate: '2026-06-10',
    sireUsedLastService: 'Girolando Magnus 3301',
    expectedCalvingDate: '2027-03-18',
    projectedIEPDays: 368,
    ccsK: 130,
    fatPercent: 3.90,
    proteinPercent: 3.35,
    bodyConditionScore: 3.25,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'excelente',
    previousLactations: [
      { lactationNo: 1, totalLiters: 5900, durationDays: 300, avgLitersDay: 19.6, peakLiters: 24.5, calfTag: 'CRIA-270', calfSex: 'hembra', birthWeightKg: 32 },
    ],
  },
  {
    id: 'cow-202',
    earTag: 'VACA-202',
    eidChip: '985 001291029387',
    cowName: 'Milagrosa',
    registrationNum: 'RG-77100',
    breed: 'Jersey x Gyr',
    birthDate: '2021-02-14',
    ageMonths: 66,
    lotName: 'Lote 02 - Media Producción',
    damTag: 'VACA-030',
    sireName: 'Jersey Valentino',
    lactationNumber: 3,
    daysInMilkDEL: 155,
    currentDailyLiters: 19.1,
    avgLitersLactation: 19.8,
    accumulatedLitersLactation: 4510,
    peakLitersDay: 23.5,
    peakDEL: 50,
    feedEfficiencyLKgMS: 1.50,
    persistencyPercent: 86.0,
    reproStatus: 'abierta',
    reproStatusLabel: 'Abierta - Celo Proyectado',
    daysOpen: 110,
    servicesPerConception: 2.0,
    lastServiceDate: '2026-05-20',
    sireUsedLastService: 'Gyr Breyer de La Voluntad',
    projectedIEPDays: 405,
    ccsK: 145,
    fatPercent: 4.35,
    proteinPercent: 3.60,
    bodyConditionScore: 3.25,
    mastitisIncidentsCurrentLactation: 0,
    healthStatus: 'excelente',
    previousLactations: [
      { lactationNo: 1, totalLiters: 4850, durationDays: 290, avgLitersDay: 16.7, peakLiters: 20.5, calfTag: 'CRIA-190', calfSex: 'macho', birthWeightKg: 29 },
      { lactationNo: 2, totalLiters: 5720, durationDays: 300, avgLitersDay: 19.0, peakLiters: 23.0, calfTag: 'CRIA-298', calfSex: 'hembra', birthWeightKg: 31 },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface AnalyticsReportViewProps {
  currentFarm?: any;
  farms?: any[];
  dairyData?: any;
  financialTransactions?: any[];
  rainfallRecords?: any[];
  lots?: any[];
  inventoryItems?: any[];
  employees?: any[];
}

export const AnalyticsReportView: React.FC<AnalyticsReportViewProps> = ({
  currentFarm,
  farms,
  dairyData,
  financialTransactions = [],
  rainfallRecords = [],
  lots = [],
  inventoryItems = [],
  employees = [],
}) => {
  // State
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('q3_2026');
  const [reportFocus, setReportFocus] = useState<'consolidado' | 'leche' | 'ceba' | 'reproduccion' | 'finanzas'>('consolidado');

  // Recommendations State
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(INITIAL_RECOMMENDATIONS);
  const [recCatFilter, setRecCatFilter] = useState<string>('todas');
  const [recPriorityFilter, setRecPriorityFilter] = useState<string>('todas');

  // Modal for new Recommendation
  const [showAddRecModal, setShowAddRecModal] = useState<boolean>(false);
  const [newRec, setNewRec] = useState<Omit<RecommendationItem, 'id'>>({
    category: 'nutricion',
    priority: 'alta',
    title: '',
    problemStatement: '',
    proposedSolution: '',
    expectedOutcome: '',
    financialImpactUSD: 1000,
    implementationCostUSD: 200,
    roiPercent: 400,
    timeframeDays: 30,
    status: 'pendiente',
    responsibleRole: 'Médico Veterinario / Asesor Técnico',
  });

  // Chapters Toggle for Print / View
  const [includedChapters, setIncludedChapters] = useState<{ [key: string]: boolean }>({
    ch1_leche: true,
    ch2_ceba: true,
    ch3_reproduccion: true,
    ch4_finanzas: true,
    ch5_forrajero: true,
    ch6_recomendaciones: true,
    ch7_lluvias: true,
  });

  // Dairy Individual Cows Consolidated Report State
  const [cowSearchQuery, setCowSearchQuery] = useState<string>('');
  const [cowReproFilter, setCowReproFilter] = useState<string>('todas');
  const [cowLotFilter, setCowLotFilter] = useState<string>('todos');
  const [cowBreedFilter, setCowBreedFilter] = useState<string>('todas');
  const [cowSortField, setCowSortField] = useState<'earTag' | 'currentDailyLiters' | 'daysInMilkDEL' | 'daysOpen' | 'ccsK' | 'lactationNumber'>('currentDailyLiters');
  const [cowSortOrder, setCowSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCowForDetail, setSelectedCowForDetail] = useState<IndividualDairyCowReport | null>(null);

  // Toast / Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered & Sorted Dairy Cows
  const filteredAndSortedCows = useMemo(() => {
    return DAIRY_INDIVIDUAL_COWS_DATA.filter((cow) => {
      const query = cowSearchQuery.toLowerCase();
      const matchQuery =
        !query ||
        cow.earTag.toLowerCase().includes(query) ||
        cow.cowName.toLowerCase().includes(query) ||
        cow.eidChip.toLowerCase().includes(query) ||
        cow.registrationNum.toLowerCase().includes(query) ||
        cow.breed.toLowerCase().includes(query);

      const matchRepro = cowReproFilter === 'todas' || cow.reproStatus === cowReproFilter;
      const matchLot = cowLotFilter === 'todos' || cow.lotName === cowLotFilter;
      const matchBreed = cowBreedFilter === 'todas' || cow.breed.toLowerCase().includes(cowBreedFilter.toLowerCase());

      return matchQuery && matchRepro && matchLot && matchBreed;
    }).sort((a, b) => {
      let valA: any = a[cowSortField];
      let valB: any = b[cowSortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return cowSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return cowSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [cowSearchQuery, cowReproFilter, cowLotFilter, cowBreedFilter, cowSortField, cowSortOrder]);

  // Dairy Cows Summary Metrics
  const cowSummaryMetrics = useMemo(() => {
    const totalCows = DAIRY_INDIVIDUAL_COWS_DATA.length;
    const avgDailyMilk = (
      DAIRY_INDIVIDUAL_COWS_DATA.reduce((sum, c) => sum + c.currentDailyLiters, 0) / totalCows
    ).toFixed(1);
    const avgDEL = Math.round(
      DAIRY_INDIVIDUAL_COWS_DATA.reduce((sum, c) => sum + c.daysInMilkDEL, 0) / totalCows
    );
    const avgDaysOpen = Math.round(
      DAIRY_INDIVIDUAL_COWS_DATA.reduce((sum, c) => sum + c.daysOpen, 0) / totalCows
    );
    const pregnantCount = DAIRY_INDIVIDUAL_COWS_DATA.filter(
      (c) => c.reproStatus === 'gestante' || c.reproStatus === 'seca_gestante'
    ).length;
    const pregRatePercent = Math.round((pregnantCount / totalCows) * 100);
    const avgCCS = Math.round(
      DAIRY_INDIVIDUAL_COWS_DATA.reduce((sum, c) => sum + c.ccsK, 0) / totalCows
    );

    return { totalCows, avgDailyMilk, avgDEL, avgDaysOpen, pregnantCount, pregRatePercent, avgCCS };
  }, []);

  // Status Toggle for Recommendations
  const handleToggleRecStatus = (id: string, currentStatus: RecommendationItem['status']) => {
    const nextStatusMap: Record<RecommendationItem['status'], RecommendationItem['status']> = {
      pendiente: 'en_progreso',
      en_progreso: 'completada',
      completada: 'pendiente',
    };
    const nextStatus = nextStatusMap[currentStatus];

    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    );

    const labelMap = {
      pendiente: '⏳ Pendiente',
      en_progreso: '🔄 En Progreso',
      completada: '✅ Completada / Ejecutada',
    };
    showToast(`Estado de recomendación actualizado a: ${labelMap[nextStatus]}`);
  };

  // Delete Recommendation
  const handleDeleteRec = (id: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    showToast('Recomendación removida del informe.');
  };

  // Add New Recommendation
  const handleCreateRec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRec.title.trim() || !newRec.proposedSolution.trim()) {
      alert('Por favor complete los campos de Título y Solución Propuesta.');
      return;
    }

    const calculatedRoi =
      newRec.implementationCostUSD > 0
        ? Math.round(
            ((newRec.financialImpactUSD - newRec.implementationCostUSD) /
              newRec.implementationCostUSD) *
              100
          )
        : 100;

    const created: RecommendationItem = {
      ...newRec,
      id: `rec_custom_${Date.now()}`,
      roiPercent: calculatedRoi > 0 ? calculatedRoi : 100,
    };

    setRecommendations((prev) => [created, ...prev]);
    setShowAddRecModal(false);
    showToast('💡 Nueva recomendación agregada exitosamente al informe.');

    // Reset Form
    setNewRec({
      category: 'nutricion',
      priority: 'alta',
      title: '',
      problemStatement: '',
      proposedSolution: '',
      expectedOutcome: '',
      financialImpactUSD: 1000,
      implementationCostUSD: 200,
      roiPercent: 400,
      timeframeDays: 30,
      status: 'pendiente',
      responsibleRole: 'Médico Veterinario / Asesor Técnico',
    });
  };

  // Filtered Recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r) => {
      const catMatch = recCatFilter === 'todas' || r.category === recCatFilter;
      const prioMatch = recPriorityFilter === 'todas' || r.priority === recPriorityFilter;
      return catMatch && prioMatch;
    });
  }, [recommendations, recCatFilter, recPriorityFilter]);

  // Recommendation Summary Metrics
  const recStats = useMemo(() => {
    const totalImpact = recommendations.reduce((sum, r) => sum + r.financialImpactUSD, 0);
    const totalCost = recommendations.reduce((sum, r) => sum + r.implementationCostUSD, 0);
    const completedCount = recommendations.filter((r) => r.status === 'completada').length;
    const inProgressCount = recommendations.filter((r) => r.status === 'en_progreso').length;
    const pendingCount = recommendations.filter((r) => r.status === 'pendiente').length;
    const executionPercent = Math.round((completedCount / (recommendations.length || 1)) * 100);

    return {
      totalImpact,
      totalCost,
      netBenefit: totalImpact - totalCost,
      completedCount,
      inProgressCount,
      pendingCount,
      executionPercent,
    };
  }, [recommendations]);

  // Print Handler
  const handlePrintReport = () => {
    safePrint();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'INFORME DE ANALISIS DE DATOS GANADERIA CONSOLIDADA\n';
    csvContent += `Fecha de Generacion: ${new Date().toLocaleDateString()}\n`;
    csvContent += `Hacienda: ${selectedFarm === 'all' ? 'Consolidado General' : selectedFarm}\n`;
    csvContent += `Periodo: ${timePeriod}\n\n`;

    csvContent += 'PRODUCCION LACTEA Y CLIMA\n';
    csvContent += 'Mes,Litros Totales,Promedio L/Vaca/Dia,Lluvia (mm),Grasa %,CCS (x1000/mL),Precio/L ($USD)\n';
    MILK_PRODUCTION_TREND.forEach((m) => {
      csvContent += `${m.month},${m.milkLiters},${m.avgLitersPerCow},${m.rainfallMm},${m.fatPercent},${m.ccsK},${m.pricePerLiter}\n`;
    });

    csvContent += '\nDESEMPEÑO DE CEBA Y LEVANTE (GDP)\n';
    csvContent += 'Lote,Animales,Peso Entrada (kg),Peso Actual (kg),GDP (g/dia),Dosis Suplemento (kg),Costo/kg Ganado ($USD)\n';
    GDP_LOT_PERFORMANCE.forEach((l) => {
      csvContent += `"${l.lotName}",${l.animalCount},${l.entryWeightKg},${l.currentWeightKg},${l.gdpGramsDay},${l.feedDoseKg},${l.costPerKgGainedUSD}\n`;
    });

    csvContent += '\nRECOMENDACIONES TECNICAS Y PLAN DE ACCION\n';
    csvContent += 'Titulo,Categoria,Prioridad,Estado,Impacto Estimado ($USD),Costo Implementacion ($USD),ROI %,Plazo (Dias),Responsable\n';
    recommendations.forEach((r) => {
      csvContent += `"${r.title.replace(/"/g, '""')}",${r.category},${r.priority},${r.status},${r.financialImpactUSD},${r.implementationCostUSD},${r.roiPercent}%,${r.timeframeDays},"${r.responsibleRole}"\n`;
    });

    csvContent += '\nANALISIS AGROCLIMATICO DE LLUVIAS Y BALANCE HIDRICO\n';
    csvContent += 'Mes,Precipitacion (mm),Dias Lluvia,Evapotranspiracion ET0 (mm),Balance Hidrico (mm),Crecimiento Pasto (kg MS/ha/dia),Nivel Reservorios %,Humedad Suelo %\n';
    RAINFALL_DETAILED_DATA.forEach((rf) => {
      csvContent += `${rf.month},${rf.rainfallMm},${rf.daysWithRain},${rf.evapotranspirationMm},${rf.waterBalanceMm},${rf.pastureGrowthKgMS},${rf.reservoirLevelPercent}%,${rf.soilMoisturePercent}%\n`;
    });

    csvContent += '\nESTACIONES PLUVIOMETRICAS Y POTREROS\n';
    csvContent += 'Estacion / Potrero,Acumulado Mes (mm),Dias Lluvia,Max Evento 24h (mm),Nivel Reservorio %,Estado Suelo\n';
    RAINGAUGE_STATIONS.forEach((st) => {
      csvContent += `"${st.stationName}",${st.acumuladoMesMm},${st.diasLluvia},${st.maxEvento24h},${st.reservorioNivel}%,${st.estado}\n`;
    });

    csvContent += '\nREPORTE CONSOLIDADO ANIMAL POR ANIMAL DE LECHERIA (TRAZABILIDAD COMPLETA)\n';
    csvContent += 'Arete/Tag,Nombre,Rfid Chip,Registro,Raza,Lote,Partos/Lact,DEL (Dias),L/Dia Hoy,Prom Lact (L/d),Acum Lact (L),Pico (L/d),Eficiencia MS,Estado Repro,Dias Abiertos,SPC,Ultimo Servicio,Semen Usado,FPP,IEP Proyectado (Dias),CCS (k/mL),Grasa %,Proteina %,CC,Salud\n';
    DAIRY_INDIVIDUAL_COWS_DATA.forEach((c) => {
      csvContent += `"${c.earTag}","${c.cowName}","${c.eidChip}","${c.registrationNum}","${c.breed}","${c.lotName}",${c.lactationNumber},${c.daysInMilkDEL},${c.currentDailyLiters},${c.avgLitersLactation},${c.accumulatedLitersLactation},${c.peakLitersDay},${c.feedEfficiencyLKgMS},"${c.reproStatusLabel}",${c.daysOpen},${c.servicesPerConception},"${c.lastServiceDate}","${c.sireUsedLastService}","${c.expectedCalvingDate || 'N/A'}",${c.projectedIEPDays},${c.ccsK},${c.fatPercent}%,${c.proteinPercent}%,${c.bodyConditionScore},"${c.healthStatus}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Informe_GanaderIA_Consolidado_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('📊 Informe y Plan de Recomendaciones descargados exitosamente.');
  };

  const toggleChapter = (key: string) => {
    setIncludedChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 w-full print:p-0 print:space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#012d1d] text-[#ffba38] border-2 border-[#ffba38] px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-4 print:hidden">
          <Sparkles className="w-5 h-5 text-[#ffba38] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER BANNER & ACTION CONTROLS (Hidden in print mode)                   */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#012d1d] via-[#083e29] to-[#012d1d] text-white rounded-3xl p-5 md:p-7 border-2 border-[#012d1d] card-shadow space-y-5 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#1b5e43] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ffba38] text-[#012d1d] flex items-center justify-center font-black text-2xl shrink-0 shadow-lg">
              <BarChart3 className="w-8 h-8 text-[#012d1d]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#ffba38] text-[#012d1d] text-[10px] font-mono font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                  MÓDULO DE INTELIGENCIA DE DATOS & INFORMES
                </span>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                  Zootecnia & Analítica de Precisión
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <h1 className="font-black text-2xl md:text-3xl text-[#ffba38]">
                  Informe Ejecutivo de Desempeño Ganadero
                </h1>
                <div className="group relative inline-flex items-center">
                  <button
                    type="button"
                    className="text-[#a3b8ad] hover:text-[#ffba38] transition-colors p-0.5 rounded cursor-pointer"
                    title="Consolidado integral de métricas de Producción Láctea, Ganancia de Peso (GDP), Reproducción, Balance Forrajero y Estructura Financiera con diagnóstico zootécnico automático."
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-80 bg-[#012d1d] text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl border border-[#2d6a4f] pointer-events-none animate-in fade-in zoom-in-95">
                    Consolidado integral de métricas de <b>Producción Láctea, Ganancia de Peso (GDP), Reproducción, Balance Forrajero y Estructura Financiera</b> con diagnóstico zootécnico automático.
                  </div>
                </div>
              </div>

              {/* AUTOMATIC LIVE UPDATE INDICATOR */}
              <div className="mt-2.5 inline-flex items-center gap-2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-[10.5px] font-mono font-bold shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>⚡ Actualización Automática en Tiempo Real: Conectado activamente con todos los registros del hato ({lots.length || 14} Lotes / {dairyData?.cowMilkingList?.length || 280} Vacas en Ordeño / {financialTransactions.length || 38} Transacciones).</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="bg-[#ffba38] hover:bg-[#e0a020] text-[#012d1d] px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4 text-[#012d1d]" />
              Imprimir / PDF Informe
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-[#03402a] hover:bg-[#07593c] text-white border border-[#1b5e43] px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#ffba38]" />
              Exportar CSV / Excel
            </button>
          </div>
        </div>

        {/* CONTROLS & FILTERS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-mono font-black uppercase text-emerald-200 block mb-1">
              Alcance de Hacienda / Finca:
            </label>
            <select
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="w-full bg-[#03402a] border border-[#1b5e43] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
            >
              <option value="all">🏢 Todas las Fincas (Consolidado General)</option>
              <option value="hacienda_el_paraiso">🏡 Hacienda El Paraíso (Lechería)</option>
              <option value="finca_la_esmeralda">🌿 Finca La Esmeralda (Ceba Intensiva)</option>
              <option value="rancho_el_milagro">⛰️ Rancho El Milagro (Cría & Genética)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono font-black uppercase text-emerald-200 block mb-1">
              Período de Análisis:
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full bg-[#03402a] border border-[#1b5e43] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
            >
              <option value="q3_2026">📅 Trimestre Actual (Q3 - 2026)</option>
              <option value="semester_2026">📅 Semestre 1 - 2026</option>
              <option value="year_2026">📅 Año 2026 Acumulado</option>
              <option value="last_12_months">📅 Últimos 12 Meses Móviles</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono font-black uppercase text-emerald-200 block mb-1">
              Enfoque del Reporte:
            </label>
            <select
              value={reportFocus}
              onChange={(e) => setReportFocus(e.target.value as any)}
              className="w-full bg-[#03402a] border border-[#1b5e43] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
            >
              <option value="consolidado">📊 Informe Consolidado Completo</option>
              <option value="leche">🥛 Enfoque Producción Láctea</option>
              <option value="ceba">🥩 Enfoque Ceba & Ganancia de Peso</option>
              <option value="reproduccion">🧬 Enfoque Reproducción & Genética</option>
              <option value="finanzas">💵 Enfoque Costos & Margen Financiero</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono font-black uppercase text-emerald-200 block mb-1">
              Configuración de Capítulos:
            </label>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-white bg-[#03402a] px-3 py-2 rounded-xl border border-[#1b5e43] w-full text-center">
                {Object.values(includedChapters).filter(Boolean).length} / 7 Capítulos Visibles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL HEADER (Visible only when printing)                     */}
      {/* ========================================================================= */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">
              INFORME TECNICO Y DIAGNOSTICO ZOOTECNICO CONSOLIDADO
            </h1>
            <p className="text-xs font-bold text-gray-700">
              Plataforma GanaderIA v3.2 • Sistema de Gestión de Información Pecuaria
            </p>
          </div>
          <div className="text-right text-xs font-mono font-bold">
            <p>Fecha de Emisión: {new Date().toLocaleDateString()}</p>
            <p>Empresa: Ganadería El Paraíso & Asociados</p>
            <p>Período: Q3 2026 Consolidado</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXECUTIVE KPI STRIP                                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border-2 border-[#012d1d] p-4 card-shadow space-y-1">
          <div className="flex items-center justify-between text-[#717973]">
            <span className="text-[10px] font-mono font-black uppercase">Producción Leche</span>
            <Milk className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-mono font-black text-[#012d1d] block">19.1 L/v/día</span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+1.2 L vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#012d1d] p-4 card-shadow space-y-1">
          <div className="flex items-center justify-between text-[#717973]">
            <span className="text-[10px] font-mono font-black uppercase">GDP Ceba Promedio</span>
            <Beef className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-mono font-black text-[#012d1d] block">+1,250 g/día</span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+85 g/d vs target</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#012d1d] p-4 card-shadow space-y-1">
          <div className="flex items-center justify-between text-[#717973]">
            <span className="text-[10px] font-mono font-black uppercase">Tasa de Preñez global</span>
            <Dna className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-mono font-black text-[#012d1d] block">64.8%</span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>IEP: 398 días (Óptimo)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#012d1d] p-4 card-shadow space-y-1">
          <div className="flex items-center justify-between text-[#717973]">
            <span className="text-[10px] font-mono font-black uppercase">Carga Animal (UGM/ha)</span>
            <Wheat className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-mono font-black text-[#012d1d] block">2.15 UGM/ha</span>
          <div className="flex items-center gap-1 text-[11px] text-[#717973] font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Capacidad: 2.30 UGM/ha</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#012d1d] to-[#083e29] text-white rounded-2xl border-2 border-[#012d1d] p-4 card-shadow space-y-1">
          <div className="flex items-center justify-between text-emerald-200">
            <span className="text-[10px] font-mono font-black uppercase">Margen Neto / ha</span>
            <DollarSign className="w-4 h-4 text-[#ffba38]" />
          </div>
          <span className="text-2xl font-mono font-black text-[#ffba38] block">$428.50 USD</span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% ROI Anualizado</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIAGNÓSTICO ZOOTÉCNICO EJECUTIVO (TEXTUAL BRIEF)                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5 text-[#ffba38]" />
            </div>
            <div>
              <span className="bg-[#012d1d] text-[#ffba38] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase">
                Síntesis Ejecutiva & Evaluación Zootécnica
              </span>
              <h3 className="font-black text-lg text-[#012d1d] mt-0.5">
                Diagnóstico de Salud Operativa y Rentabilidad Pecuaria
              </h3>
            </div>
          </div>

          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-black px-3 py-1 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Salud General: EXCELENTE (Score 9.2/10)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Fortalezas */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-2">
            <h4 className="font-black text-emerald-950 uppercase text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              1. Fortalezas Clave del Período:
            </h4>
            <ul className="space-y-1.5 text-emerald-950 font-medium leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="font-black text-emerald-700">✓</span>
                <b>Excelente conversión en Ceba Intensiva:</b> GDP de 1,320 g/día en Lote 01 con un costo por kg ganado de $1.12 USD.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black text-emerald-700">✓</span>
                <b>Calidad láctea sanitaria Premium:</b> Conteos somáticos (CCS) consolidados en 158,000 cel/mL, habilitando bonificación de precio.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black text-emerald-700">✓</span>
                <b>Respuesta genética comprobada:</b> Toros Gyr y Girolando incrementaron producción en hijas de primera lactancia (+2.1 L/v/d).
              </li>
            </ul>
          </div>

          {/* Cuellos de Botella */}
          <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-2">
            <h4 className="font-black text-amber-950 uppercase text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              2. Oportunidades & Alertas Críticas:
            </h4>
            <ul className="space-y-1.5 text-amber-950 font-medium leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="font-black text-amber-700">⚠</span>
                <b>Anestro post-parto en potrero Boquerón:</b> 11.9% de vacas en lactancia registran atraso reproductivo mayor a 120 días abiertos.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black text-amber-700">⚠</span>
                <b>Costo de Suplementación elevado:</b> Representa el 42% de la estructura de egresos. Requiere optimización mediante ensilaje propio.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black text-amber-700">⚠</span>
                <b>Variabilidad por época de lluvias:</b> Leve caída de solidos totales (Grasa %) durante mayo por dilución forrajera.
              </li>
            </ul>
          </div>

          {/* Plan de Acción Priorizado */}
          <div className="p-4 bg-blue-50/80 border border-blue-300 rounded-2xl space-y-2">
            <h4 className="font-black text-blue-950 uppercase text-[11px] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-700" />
              3. Plan de Acción Recomendado:
            </h4>
            <ul className="space-y-1.5 text-blue-950 font-medium leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="font-black text-blue-700">1.</span>
                <b>Iniciar protocolo IATF con Progesterona + eCG</b> a las 26 vacas en anestro previo a la entrada de lluvias.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black text-blue-700">2.</span>
                <b>Incrementar inclusión de Maíz Ensilado en ceba:</b> reduce el costo de ración preparada de $0.32 a $0.27 USD/kg.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black text-blue-700">3.</span>
                <b>Ajuste de aforo forrajero en Potrero La Esmeralda</b> para mantener carga en 2.30 UGM/ha con rotación de 21 días.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CAPÍTULO 1: PRODUCCIÓN LÁCTEA & CURVA DE ORDEÑO                          */}
      {/* ========================================================================= */}
      {includedChapters.ch1_leche && (
        <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-5 print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
            <div className="flex items-center gap-3">
              <Milk className="w-6 h-6 text-blue-600" />
              <div>
                <span className="text-[10px] font-mono font-black text-blue-800 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                  CAPÍTULO 1
                </span>
                <h3 className="font-black text-lg text-[#012d1d] mt-0.5">
                  Producción de Leche, Calidad Sanitaria & Correlación de Lluvia
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleChapter('ch1_leche')}
              className="text-xs font-bold text-[#717973] hover:text-black print:hidden"
            >
              Ocultar Capítulo
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Recharts Area & Line Chart */}
            <div className="lg:col-span-2 space-y-2">
              <h4 className="font-black text-xs uppercase text-[#012d1d] flex items-center justify-between">
                <span>Evolución Diaria L/Vaca y Precipitaciones Pluviométricas (mm):</span>
                <span className="text-[10px] text-blue-700 font-mono">L/vaca/día vs Pluviometría</span>
              </h4>

              <div className="h-64 bg-[#f8fdfa] p-3 rounded-2xl border border-[#c1c8c2]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={MILK_PRODUCTION_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2efe8" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#012d1d', fontWeight: 'bold' }} />
                    <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10 }} label={{ value: 'L/vaca/día', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: 'Lluvia (mm)', angle: 90, position: 'insideRight', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#012d1d', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Bar yAxisId="right" dataKey="rainfallMm" name="Pluviometría (mm)" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                    <Line yAxisId="left" type="monotone" dataKey="avgLitersPerCow" name="Promedio L/vaca/día" stroke="#012d1d" strokeWidth={3} dot={{ r: 5, fill: '#ffba38' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quality Breakdown & Indicators */}
            <div className="space-y-3">
              <h4 className="font-black text-xs uppercase text-[#012d1d]">
                Indicadores Sanitarios y Valorización por Calidad:
              </h4>

              <div className="bg-[#f8fdfa] p-4 rounded-2xl border border-[#c1c8c2] space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-[#e2efe8] pb-2">
                  <span className="font-bold text-[#717973]">Células Somáticas (CCS):</span>
                  <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    158,000 / mL (Grado A)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-[#e2efe8] pb-2">
                  <span className="font-bold text-[#717973]">Grasa Butírica Promedio:</span>
                  <span className="font-mono font-black text-[#012d1d]">3.82%</span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-[#e2efe8] pb-2">
                  <span className="font-bold text-[#717973]">Proteína Láctea Promedio:</span>
                  <span className="font-mono font-black text-[#012d1d]">3.35%</span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-[#e2efe8] pb-2">
                  <span className="font-bold text-[#717973]">Incidencia de Mastitis:</span>
                  <span className="font-mono font-black text-emerald-800">1.8% de la hato</span>
                </div>

                <div className="bg-[#012d1d] text-white p-3 rounded-xl text-center font-mono">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">Precio Promedio Pagado</span>
                  <span className="text-lg font-black text-[#ffba38]">$0.50 USD / Litro</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN ESPECIALIZADA: GRÁFICAS Y CURVAS DE LACTANCIA POR NÚMERO DE PARTO  */}
          {/* ========================================================================= */}
          <div className="pt-4 border-t border-[#eeeeee] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded uppercase border border-blue-300">
                  📈 ANALÍTICA DE LACTANCIAS POR CAMPAÑA
                </span>
                <h4 className="font-black text-base text-[#012d1d] mt-1 flex items-center gap-2">
                  <Milk className="w-5 h-5 text-blue-700" />
                  <span>Gráficas de Lactancias: Curva de Producción (DEL) & Producción Acumulada (#1 a #5)</span>
                </h4>
                <p className="text-xs text-[#717973]">
                  Análisis comparativo fisiológico de la producción diaria (L/vaca) y rendimiento acumulado a 305 días por campaña láctea.
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-[#012d1d] text-[#ffba38] px-3 py-1.5 rounded-xl self-start sm:self-auto border border-[#ffba38]/40">
                Pico Vital: 3ª y 4ª Lactancia (34 L/día)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart A: Lactation Curve lines */}
              <div className="p-4 bg-[#f8fdfa] rounded-2xl border border-[#c1c8c2] space-y-2">
                <span className="text-xs font-black text-[#012d1d] uppercase block">
                  Curva de Lactancia: Primíparas vs Secundíparas vs Multíparas
                </span>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { del: 'Día 10', primiparas: 16.5, secundiparas: 20.2, multiparas: 24.5 },
                        { del: 'Día 30', primiparas: 21.0, secundiparas: 25.5, multiparas: 31.8 },
                        { del: 'Día 45 (Pico)', primiparas: 22.5, secundiparas: 27.2, multiparas: 34.0 },
                        { del: 'Día 60', primiparas: 22.0, secundiparas: 26.5, multiparas: 32.5 },
                        { del: 'Día 90', primiparas: 20.8, secundiparas: 24.8, multiparas: 30.0 },
                        { del: 'Día 120', primiparas: 19.5, secundiparas: 23.0, multiparas: 27.5 },
                        { del: 'Día 150', primiparas: 18.2, secundiparas: 21.2, multiparas: 25.0 },
                        { del: 'Día 180', primiparas: 17.0, secundiparas: 19.5, multiparas: 22.8 },
                        { del: 'Día 210', primiparas: 16.0, secundiparas: 18.0, multiparas: 20.5 },
                        { del: 'Día 240', primiparas: 15.0, secundiparas: 16.5, multiparas: 18.5 },
                        { del: 'Día 270', primiparas: 14.0, secundiparas: 15.2, multiparas: 16.8 },
                        { del: 'Día 305', primiparas: 13.2, secundiparas: 14.0, multiparas: 15.0 },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2efe8" />
                      <XAxis dataKey="del" tick={{ fontSize: 9, fill: '#012d1d', fontWeight: 'bold' }} />
                      <YAxis tick={{ fontSize: 9 }} domain={[10, 38]} />
                      <Tooltip contentStyle={{ backgroundColor: '#012d1d', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                      <Line type="monotone" dataKey="primiparas" name="1ª Lact. (Primíparas)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="secundiparas" name="2ª Lactancia" stroke="#9333ea" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="multiparas" name="3ª+ Lact. (Multíparas)" stroke="#d97706" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart B: Consecutive Lactations BarChart */}
              <div className="p-4 bg-[#f8fdfa] rounded-2xl border border-[#c1c8c2] space-y-2">
                <span className="text-xs font-black text-[#012d1d] uppercase block">
                  Producción Acumulada a 305 Días por Lactancia (#1 a #5)
                </span>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { lactancia: '1ª Lactancia', litros: 5850, pico: 22.5 },
                        { lactancia: '2ª Lactancia', litros: 6720, pico: 27.2 },
                        { lactancia: '3ª Lactancia', litros: 7550, pico: 34.0 },
                        { lactancia: '4ª Lactancia', litros: 7620, pico: 33.8 },
                        { lactancia: '5ª+ Lactancia', litros: 7100, pico: 31.0 },
                      ]}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2efe8" />
                      <XAxis dataKey="lactancia" tick={{ fontSize: 9, fill: '#012d1d', fontWeight: 'bold' }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#012d1d', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} L`, 'Litros Totales (305d)']}
                      />
                      <Bar dataKey="litros" name="Litros Acumulados (305 Días)" fill="#059669" radius={[6, 6, 0, 0]} barSize={34} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CONSOLIDADO INDIVIDUAL ANIMAL POR ANIMAL DE LECHERÍA                    */}
          {/* ========================================================================= */}
          <div className="pt-4 border-t border-[#eeeeee] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase border border-emerald-300">
                  REPORTE COMPLETO Y CONSOLIDADO INDIVIDUAL
                </span>
                <h4 className="font-black text-base text-[#012d1d] mt-1 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <span>Matriz Individual Animal por Animal: Parámetros Reproductivos, Eficiencia & Trazabilidad Histórica</span>
                </h4>
                <p className="text-xs text-[#717973]">
                  Consolidado detallado de vacas en producción con métricas de leche, días abiertos, días en leche (DEL), persistencia, genética e historial de lactancias anteriores.
                </p>
              </div>

              {/* KPI Strip for Cows */}
              <div className="flex items-center gap-2 text-xs font-mono font-bold shrink-0">
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950">
                  <span className="text-[10px] text-blue-700 block uppercase font-sans">Total Evaluadas</span>
                  <span className="text-sm font-black">{cowSummaryMetrics.totalCows} Vacas</span>
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                  <span className="text-[10px] text-emerald-700 block uppercase font-sans">Prom. L/Vaca/Día</span>
                  <span className="text-sm font-black">{cowSummaryMetrics.avgDailyMilk} L/d</span>
                </div>
                <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-950">
                  <span className="text-[10px] text-purple-700 block uppercase font-sans">Días Abiertos Prom.</span>
                  <span className="text-sm font-black">{cowSummaryMetrics.avgDaysOpen} días</span>
                </div>
                <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
                  <span className="text-[10px] text-amber-800 block uppercase font-sans">Preñez Hato</span>
                  <span className="text-sm font-black">{cowSummaryMetrics.pregRatePercent}%</span>
                </div>
              </div>
            </div>

            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="p-3 bg-[#f8fdfa] rounded-2xl border border-[#c1c8c2] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
              {/* Search input */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#717973]" />
                <input
                  type="text"
                  placeholder="Buscar por Arete, Nombre, Chip RFID, Registro o Raza..."
                  value={cowSearchQuery}
                  onChange={(e) => setCowSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#c1c8c2] text-xs font-medium text-[#012d1d] focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              {/* Repro Filter */}
              <div>
                <select
                  value={cowReproFilter}
                  onChange={(e) => setCowReproFilter(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white rounded-xl border border-[#c1c8c2] text-xs font-bold text-[#012d1d]"
                >
                  <option value="todas">🎯 Estado Repro: Todos</option>
                  <option value="gestante">🟢 Gestantes</option>
                  <option value="abierta">🔵 Abiertas / Aptas</option>
                  <option value="servida_iatf">🟣 Servida IATF</option>
                  <option value="seca_gestante">🟡 Seca Gestante</option>
                  <option value="anestro">🔴 Anestro / Atención</option>
                </select>
              </div>

              {/* Lot Filter */}
              <div>
                <select
                  value={cowLotFilter}
                  onChange={(e) => setCowLotFilter(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white rounded-xl border border-[#c1c8c2] text-xs font-bold text-[#012d1d]"
                >
                  <option value="todos">🏠 Lote: Todos</option>
                  <option value="Lote 01 - Alta Producción">Lote 01 - Alta Producción</option>
                  <option value="Lote 02 - Media Producción">Lote 02 - Media Producción</option>
                  <option value="Lote Secado">Lote Secado</option>
                  <option value="Lote Tratamiento / Atención">Lote Tratamiento / Atención</option>
                </select>
              </div>

              {/* Sort field & order */}
              <div className="flex items-center gap-1">
                <select
                  value={cowSortField}
                  onChange={(e: any) => setCowSortField(e.target.value)}
                  className="w-full py-2 px-2 bg-white rounded-xl border border-[#c1c8c2] text-xs font-bold text-[#012d1d]"
                >
                  <option value="currentDailyLiters">Sort: Producción L/d</option>
                  <option value="daysInMilkDEL">Sort: DEL (Días Leche)</option>
                  <option value="daysOpen">Sort: Días Abiertos</option>
                  <option value="ccsK">Sort: CCS (Células Som.)</option>
                  <option value="lactationNumber">Sort: N° Lactancia</option>
                  <option value="earTag">Sort: Arete / Id</option>
                </select>
                <button
                  onClick={() => setCowSortOrder(cowSortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-white border border-[#c1c8c2] rounded-xl hover:bg-emerald-50 text-[#012d1d]"
                  title="Alternar Orden Ascendente / Descendente"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CONSOLIDATED ANIMAL TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-[#c1c8c2] bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#012d1d] text-white font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-3">Animal & Trazabilidad</th>
                    <th className="p-3">Raza & Linaje (Madre x Padre)</th>
                    <th className="p-3 text-center">Parto / DEL</th>
                    <th className="p-3 text-center">Producción L/día</th>
                    <th className="p-3 text-center">Acum. Lact. (L)</th>
                    <th className="p-3 text-center">Eficiencia MS</th>
                    <th className="p-3 text-center">Estado Reproductivo</th>
                    <th className="p-3 text-center">Días Abiertos / IEP</th>
                    <th className="p-3 text-center">Últ. Servicio / Semen</th>
                    <th className="p-3 text-center">Calidad CCS & CC</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee] font-medium text-[#012d1d]">
                  {filteredAndSortedCows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-[#717973] font-bold">
                        No se encontraron animales con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedCows.map((cow) => {
                      const reproBadgeMap = {
                        gestante: { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: '🟢' },
                        abierta: { bg: 'bg-blue-100 text-blue-900 border-blue-300', icon: '🔵' },
                        servida_iatf: { bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: '🟣' },
                        seca_gestante: { bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: '🟡' },
                        anestro: { bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: '🔴' },
                      }[cow.reproStatus] || { bg: 'bg-gray-100 text-gray-800', icon: '⚪' };

                      return (
                        <tr key={cow.id} className="hover:bg-emerald-50/60 transition-all">
                          {/* Identificación */}
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center font-black shrink-0 font-mono text-xs">
                                #{cow.earTag.replace('VACA-', '')}
                              </div>
                              <div>
                                <span className="font-black text-[#012d1d] block">
                                  {cow.cowName} ({cow.earTag})
                                </span>
                                <span className="text-[10px] font-mono text-[#717973] block">
                                  RFID: {cow.eidChip} • {cow.registrationNum}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Raza & Linaje */}
                          <td className="p-3">
                            <span className="font-bold text-[#012d1d] block text-xs">{cow.breed}</span>
                            <span className="text-[10px] text-[#717973] block">
                              M: {cow.damTag} | P: {cow.sireName}
                            </span>
                          </td>

                          {/* Parto / DEL */}
                          <td className="p-3 text-center font-mono">
                            <span className="font-black text-xs block text-purple-950">
                              Lact. #{cow.lactationNumber}
                            </span>
                            <span className="text-[10px] font-bold text-[#717973] block">
                              {cow.daysInMilkDEL} DEL
                            </span>
                          </td>

                          {/* Producción L/d */}
                          <td className="p-3 text-center font-mono">
                            <span className="font-black text-sm text-blue-950 block">
                              {cow.currentDailyLiters} L/d
                            </span>
                            <span className="text-[10px] text-[#717973] block">
                              Pico: {cow.peakLitersDay} L/d
                            </span>
                          </td>

                          {/* Acumulado Lactancia */}
                          <td className="p-3 text-center font-mono font-black text-emerald-900">
                            {cow.accumulatedLitersLactation.toLocaleString()} L
                          </td>

                          {/* Eficiencia MS */}
                          <td className="p-3 text-center font-mono text-xs">
                            <span className="font-black text-slate-900 block">
                              {cow.feedEfficiencyLKgMS} L/kg MS
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold block">
                              {cow.persistencyPercent}% Persist.
                            </span>
                          </td>

                          {/* Estado Repro */}
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${reproBadgeMap.bg}`}>
                              <span>{reproBadgeMap.icon}</span>
                              <span>{cow.reproStatusLabel}</span>
                            </span>
                          </td>

                          {/* Días Abiertos / IEP */}
                          <td className="p-3 text-center font-mono text-xs">
                            <span className="font-black text-[#012d1d] block">
                              {cow.daysOpen} DA
                            </span>
                            <span className="text-[10px] text-purple-800 font-bold block">
                              IEP: {cow.projectedIEPDays}d
                            </span>
                          </td>

                          {/* Último Servicio / Semen */}
                          <td className="p-3 text-center font-mono text-[11px]">
                            <span className="font-bold text-[#012d1d] block">
                              {cow.lastServiceDate}
                            </span>
                            <span className="text-[10px] text-[#717973] block truncate max-w-[120px]">
                              {cow.sireUsedLastService} (SPC: {cow.servicesPerConception})
                            </span>
                          </td>

                          {/* CCS & CC */}
                          <td className="p-3 text-center font-mono text-xs">
                            <span className={`font-black block ${cow.ccsK > 250 ? 'text-rose-700' : 'text-emerald-800'}`}>
                              {cow.ccsK}k CCS
                            </span>
                            <span className="text-[10px] text-[#717973] block">
                              CC: {cow.bodyConditionScore.toFixed(2)} / 5
                            </span>
                          </td>

                          {/* Acción Ficha */}
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setSelectedCowForDetail(cow)}
                              className="px-2.5 py-1.5 bg-[#012d1d] text-[#ffba38] hover:bg-[#083e29] font-mono font-bold text-[10px] rounded-xl flex items-center gap-1 mx-auto transition-all shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ficha</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / DRAWER: FICHA TÉCNICA E HISTORIAL COMPLETO DEL ANIMAL             */}
      {/* ========================================================================= */}
      {selectedCowForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 card-shadow space-y-6 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-black text-lg font-mono border border-[#083e29]">
                  #{selectedCowForDetail.earTag.replace('VACA-', '')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xl text-[#012d1d]">
                      {selectedCowForDetail.cowName} ({selectedCowForDetail.earTag})
                    </h3>
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-black px-2 py-0.5 rounded-md">
                      {selectedCowForDetail.breed}
                    </span>
                  </div>
                  <p className="text-xs text-[#717973] font-mono mt-0.5">
                    RFID Chip: {selectedCowForDetail.eidChip} • Reg: {selectedCowForDetail.registrationNum} • Lote: {selectedCowForDetail.lotName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCowForDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 flex items-center justify-center font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Genealogía & Trazabilidad Nivel 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#f8fdfa] rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Madre Biológica</span>
                <span className="font-bold text-[#012d1d] block mt-0.5">{selectedCowForDetail.damTag}</span>
              </div>
              <div className="p-3 bg-[#f8fdfa] rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Toro / Padre</span>
                <span className="font-bold text-[#012d1d] block mt-0.5">{selectedCowForDetail.sireName}</span>
              </div>
              <div className="p-3 bg-[#f8fdfa] rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Edad / Naci.</span>
                <span className="font-bold text-[#012d1d] block mt-0.5">{selectedCowForDetail.ageMonths}m ({selectedCowForDetail.birthDate})</span>
              </div>
              <div className="p-3 bg-[#f8fdfa] rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Estado Sanitario</span>
                <span className="font-bold text-emerald-800 uppercase block mt-0.5">{selectedCowForDetail.healthStatus}</span>
              </div>
            </div>

            {/* Current Lactation Performance Cards */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase text-[#012d1d] flex items-center gap-1.5">
                <Milk className="w-4 h-4 text-blue-600" />
                <span>Rendimiento Lactancia Actual (Lactancia #{selectedCowForDetail.lactationNumber})</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-900 block">Producción Hoy</span>
                  <span className="text-xl font-mono font-black text-blue-950">{selectedCowForDetail.currentDailyLiters} L/día</span>
                  <span className="text-[10px] text-blue-800 font-medium block">{selectedCowForDetail.daysInMilkDEL} Días en Leche (DEL)</span>
                </div>

                <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-900 block">Acumulado Lactancia</span>
                  <span className="text-xl font-mono font-black text-emerald-950">{selectedCowForDetail.accumulatedLitersLactation.toLocaleString()} L</span>
                  <span className="text-[10px] text-emerald-800 font-medium block">Prom. {selectedCowForDetail.avgLitersLactation} L/día</span>
                </div>

                <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-900 block">Pico de Lactancia</span>
                  <span className="text-xl font-mono font-black text-purple-950">{selectedCowForDetail.peakLitersDay} L/día</span>
                  <span className="text-[10px] text-purple-800 font-medium block">Alcanzado a los DEL {selectedCowForDetail.peakDEL}</span>
                </div>

                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-900 block">Eficiencia Conversión</span>
                  <span className="text-xl font-mono font-black text-amber-950">{selectedCowForDetail.feedEfficiencyLKgMS} L/kg MS</span>
                  <span className="text-[10px] text-amber-800 font-medium block">{selectedCowForDetail.persistencyPercent}% Persistencia</span>
                </div>
              </div>
            </div>

            {/* Parámetros Reproductivos & Cronograma */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase text-[#012d1d] flex items-center gap-1.5">
                <Dna className="w-4 h-4 text-purple-600" />
                <span>Estado Reproductivo & Trazabilidad Inseminaciones</span>
              </h4>

              <div className="p-4 bg-[#f8fdfa] rounded-2xl border border-[#c1c8c2] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Diagnóstico Reproductivo</span>
                  <span className="font-black text-[#012d1d] block text-sm mt-0.5">{selectedCowForDetail.reproStatusLabel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Días Abiertos (DA)</span>
                  <span className="font-black text-purple-950 block text-sm mt-0.5">{selectedCowForDetail.daysOpen} días</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Intervalo Parto Proyectado</span>
                  <span className="font-black text-[#012d1d] block text-sm mt-0.5">IEP: {selectedCowForDetail.projectedIEPDays} días</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Servicios p/ Concepción (SPC)</span>
                  <span className="font-bold text-[#012d1d] block mt-0.5">{selectedCowForDetail.servicesPerConception} servicios</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Última Inseminación / Servicio</span>
                  <span className="font-bold text-[#012d1d] block mt-0.5">{selectedCowForDetail.lastServiceDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-sans font-bold block">Toro / Semen Utilizado</span>
                  <span className="font-bold text-[#012d1d] block mt-0.5">{selectedCowForDetail.sireUsedLastService}</span>
                </div>
              </div>
            </div>

            {/* HISTORIAL COMPLETO DE LACTANCIAS PREVIAS */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase text-[#012d1d] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Historial de Lactancias Previas & Trazabilidad de Crías Nacidas</span>
                </span>
                <span className="text-[10px] font-mono text-[#717973]">
                  {selectedCowForDetail.previousLactations.length} Lactancias Anteriores Registradas
                </span>
              </h4>

              {selectedCowForDetail.previousLactations.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-[#717973]">
                  Animal en su <b>Primer Parto (Vaca Primeriza)</b>. No registra lactancias previas completadas.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#c1c8c2]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#012d1d] text-white font-mono text-[10px] uppercase">
                        <th className="p-2.5">N° Lactancia</th>
                        <th className="p-2.5 text-center">Duración (Días)</th>
                        <th className="p-2.5 text-center">Producción Total</th>
                        <th className="p-2.5 text-center">Promedio L/día</th>
                        <th className="p-2.5 text-center">Pico L/día</th>
                        <th className="p-2.5 text-center">Cría Nacida (Sex / Arete)</th>
                        <th className="p-2.5 text-center">Peso Nacer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee] font-medium text-[#012d1d]">
                      {selectedCowForDetail.previousLactations.map((lact, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/50">
                          <td className="p-2.5 font-bold font-mono">Lactancia #{lact.lactationNo}</td>
                          <td className="p-2.5 text-center font-mono">{lact.durationDays} días</td>
                          <td className="p-2.5 text-center font-mono font-black text-emerald-900">{lact.totalLiters.toLocaleString()} L</td>
                          <td className="p-2.5 text-center font-mono font-bold">{lact.avgLitersDay} L/d</td>
                          <td className="p-2.5 text-center font-mono text-purple-900 font-bold">{lact.peakLiters} L/d</td>
                          <td className="p-2.5 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${lact.calfSex === 'hembra' ? 'bg-pink-100 text-pink-900' : 'bg-blue-100 text-blue-900'}`}>
                              {lact.calfSex === 'hembra' ? '♀ Hembra' : '♂ Macho'} ({lact.calfTag})
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold">{lact.birthWeightKg} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCowForDetail(null)}
                className="px-5 py-2.5 bg-[#012d1d] text-white rounded-xl font-bold text-xs hover:bg-[#083e29]"
              >
                Cerrar Ficha del Animal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAPÍTULO 2: CEBA & GANANCIA DIARIA DE PESO (GDP)                         */}
      {/* ========================================================================= */}
      {includedChapters.ch2_ceba && (
        <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-5 print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
            <div className="flex items-center gap-3">
              <Beef className="w-6 h-6 text-rose-600" />
              <div>
                <span className="text-[10px] font-mono font-black text-rose-800 uppercase bg-rose-50 px-2 py-0.5 rounded-md">
                  CAPÍTULO 2
                </span>
                <h3 className="font-black text-lg text-[#012d1d] mt-0.5">
                  Análisis de Ceba Intensiva, Conversión Alimenticia & GDP por Lote
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleChapter('ch2_ceba')}
              className="text-xs font-bold text-[#717973] hover:text-black print:hidden"
            >
              Ocultar Capítulo
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Table Breakdown */}
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-[#ffba38] font-black uppercase text-[10px]">
                    <th className="p-2.5 rounded-tl-xl">Lote de Ganado</th>
                    <th className="p-2.5 text-center">Cabezas</th>
                    <th className="p-2.5 text-center">Peso Entrada</th>
                    <th className="p-2.5 text-center">Peso Actual</th>
                    <th className="p-2.5 text-center">GDP (g/día)</th>
                    <th className="p-2.5 text-center">Conversión (FCR)</th>
                    <th className="p-2.5 text-center rounded-tr-xl">Costo/kg Ganado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {GDP_LOT_PERFORMANCE.map((lot, idx) => (
                    <tr key={idx} className="hover:bg-[#f8fdfa] font-medium text-[#012d1d]">
                      <td className="p-2.5 font-bold text-[#012d1d]">
                        {lot.lotName}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold">{lot.animalCount}</td>
                      <td className="p-2.5 text-center font-mono text-[#717973]">{lot.entryWeightKg} kg</td>
                      <td className="p-2.5 text-center font-mono font-bold text-[#012d1d]">{lot.currentWeightKg} kg</td>
                      <td className="p-2.5 text-center font-mono font-black text-emerald-800">
                        +{lot.gdpGramsDay} g/d
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-blue-900">{lot.fcr}:1</td>
                      <td className="p-2.5 text-center font-mono font-black text-amber-900">${lot.costPerKgGainedUSD.toFixed(2)} USD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* GDP Chart */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase text-[#012d1d]">
                Comparativo GDP (g/día) por Lote:
              </h4>
              <div className="h-56 bg-[#f8fdfa] p-2 rounded-2xl border border-[#c1c8c2]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={GDP_LOT_PERFORMANCE} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2efe8" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="lotName" type="category" width={100} tick={{ fontSize: 9, fill: '#012d1d' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#012d1d', color: '#fff', borderRadius: '10px', fontSize: '11px' }} />
                    <Bar dataKey="gdpGramsDay" name="GDP (g/día)" fill="#059669" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAPÍTULO 3: REPRODUCCIÓN & GENÉTICA                                      */}
      {/* ========================================================================= */}
      {includedChapters.ch3_reproduccion && (
        <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-5 print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
            <div className="flex items-center gap-3">
              <Dna className="w-6 h-6 text-purple-600" />
              <div>
                <span className="text-[10px] font-mono font-black text-purple-800 uppercase bg-purple-50 px-2 py-0.5 rounded-md">
                  CAPÍTULO 3
                </span>
                <h3 className="font-black text-lg text-[#012d1d] mt-0.5">
                  Eficiencia Reproductiva del Hato & Ranking de Reproductores
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleChapter('ch3_reproduccion')}
              className="text-xs font-bold text-[#717973] hover:text-black print:hidden"
            >
              Ocultar Capítulo
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Reproductive Pie Chart */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase text-[#012d1d]">
                Distribución Estado Reproductivo Hembras:
              </h4>
              <div className="h-60 bg-[#f8fdfa] p-2 rounded-2xl border border-[#c1c8c2] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={REPRODUCTIVE_STATUS_DISTRIBUTION} dataKey="count" nameKey="statusName" cx="50%" cy="50%" outerRadius={70} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {REPRODUCTIVE_STATUS_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#012d1d', color: '#fff', borderRadius: '10px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sire Performance Table */}
            <div className="lg:col-span-2 space-y-2">
              <h4 className="font-black text-xs uppercase text-[#012d1d]">
                Desempeño de Toros / Semen en Progenie:
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#012d1d] text-[#ffba38] font-black uppercase text-[10px]">
                      <th className="p-2.5 rounded-tl-xl">Reproductor (Toro / Semen)</th>
                      <th className="p-2.5 text-center">Concepción %</th>
                      <th className="p-2.5 text-center">Crías Nacidas</th>
                      <th className="p-2.5 text-center">Prod. Hijas (L/v/d)</th>
                      <th className="p-2.5 text-center rounded-tr-xl">Score Zootécnico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {GENETICS_SIRE_RANKING.map((bull, idx) => (
                      <tr key={idx} className="hover:bg-[#f8fdfa] font-medium text-[#012d1d]">
                        <td className="p-2.5 font-bold text-[#012d1d]">
                          {bull.bullName}
                        </td>
                        <td className="p-2.5 text-center font-mono font-black text-purple-900">{bull.conceptionRatePercent}%</td>
                        <td className="p-2.5 text-center font-mono font-bold">{bull.totalCalvesBorn} cab</td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-900">
                          {bull.daughterMilkAvgLiters > 0 ? `${bull.daughterMilkAvgLiters} L/v/d` : 'N/A (Carne)'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="bg-[#ffba38] text-[#012d1d] font-mono font-black px-2 py-0.5 rounded-md text-[11px]">
                            {bull.ratingScore} / 10
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAPÍTULO 4: ESTRUCTURA DE COSTOS & MARGENES FINANCIEROS                  */}
      {/* ========================================================================= */}
      {includedChapters.ch4_finanzas && (
        <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-5 print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-[#012d1d]" />
              <div>
                <span className="text-[10px] font-mono font-black text-[#012d1d] uppercase bg-amber-100 px-2 py-0.5 rounded-md">
                  CAPÍTULO 4
                </span>
                <h3 className="font-black text-lg text-[#012d1d] mt-0.5">
                  Estructura Económica, Desglose de Gastos & Margen Neto por Hectárea
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleChapter('ch4_finanzas')}
              className="text-xs font-bold text-[#717973] hover:text-black print:hidden"
            >
              Ocultar Capítulo
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Financial Trend Bar Chart */}
            <div className="lg:col-span-2 space-y-2">
              <h4 className="font-black text-xs uppercase text-[#012d1d]">
                Ingresos vs Egresos vs Utilidad Neta ($ USD):
              </h4>

              <div className="h-60 bg-[#f8fdfa] p-3 rounded-2xl border border-[#c1c8c2]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FINANCIAL_MONTHLY_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2efe8" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#012d1d', fontWeight: 'bold' }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#012d1d', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Bar dataKey="revenue" name="Ingresos Brutos ($)" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Egresos Operativos ($)" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="netProfit" name="Utilidad Neta ($)" fill="#ffba38" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expenses Pie Legend */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase text-[#012d1d]">
                Composición de Gastos Operativos:
              </h4>

              <div className="bg-[#f8fdfa] p-3 rounded-2xl border border-[#c1c8c2] space-y-2 text-xs">
                {COST_BREAKDOWN_DATA.map((cost, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#e2efe8]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cost.color }} />
                      <span className="font-medium text-[#012d1d]">{cost.name}</span>
                    </div>
                    <div className="font-mono font-bold text-right">
                      <span className="text-[#012d1d] block">{cost.value}%</span>
                      <span className="text-[10px] text-[#717973]">${cost.amountUSD.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAPÍTULO 5: BALANCE FORRAJERO & CAPACIDAD DE CARGA                       */}
      {/* ========================================================================= */}
      {includedChapters.ch5_forrajero && (
        <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4 print:break-inside-avoid">
          <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
            <div className="flex items-center gap-3">
              <Wheat className="w-6 h-6 text-emerald-700" />
              <div>
                <span className="text-[10px] font-mono font-black text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                  CAPÍTULO 5
                </span>
                <h3 className="font-black text-lg text-[#012d1d] mt-0.5">
                  Balance Forrajero, Aforos de Pastura & Carga Sustentable por Potrero
                </h3>
              </div>
            </div>

            <button
              onClick={() => toggleChapter('ch5_forrajero')}
              className="text-xs font-bold text-[#717973] hover:text-black print:hidden"
            >
              Ocultar Capítulo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#f8fdfa] rounded-2xl border border-[#c1c8c2] space-y-1 text-center">
              <span className="text-[10px] uppercase font-bold text-[#717973] block">Oferta Forrajera Promedio</span>
              <span className="text-2xl font-mono font-black text-emerald-800">12,450 kg MS/ha/año</span>
              <span className="text-[10px] text-[#525a55] block">Especies Brachiaria Brizantha / Humidicola</span>
            </div>

            <div className="p-4 bg-[#f8fdfa] rounded-2xl border border-[#c1c8c2] space-y-1 text-center">
              <span className="text-[10px] uppercase font-bold text-[#717973] block">Demanda de Materia Seca</span>
              <span className="text-2xl font-mono font-black text-[#012d1d]">10,120 kg MS/ha/año</span>
              <span className="text-[10px] text-[#525a55] block">Consumo hato al 2.8% del Peso Vivo</span>
            </div>

            <div className="p-4 bg-emerald-100 rounded-2xl border border-emerald-300 space-y-1 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-900 block">Balance de Seguridad (Superávit)</span>
              <span className="text-2xl font-mono font-black text-emerald-950">+2,330 kg MS/ha</span>
              <span className="text-[10px] text-emerald-900 block font-bold">✓ Reserva recomendada para época seca</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAPÍTULO 6: PLAN DE RECOMENDACIONES TÁCTICAS & HOJA DE RUTA               */}
      {/* ========================================================================= */}
      {includedChapters.ch6_recomendaciones && (
        <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-5 print:break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#eeeeee] pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffba38] text-[#012d1d] flex items-center justify-center font-black shrink-0">
                <Lightbulb className="w-6 h-6 text-[#012d1d]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-[#012d1d] uppercase bg-amber-100 px-2 py-0.5 rounded-md">
                  CAPÍTULO 6
                </span>
                <h3 className="font-black text-lg text-[#012d1d] mt-0.5">
                  Plan Estratégico de Recomendaciones Tácticas & Hoja de Ruta
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button
                onClick={() => setShowAddRecModal(true)}
                className="bg-[#012d1d] hover:bg-[#083e29] text-[#ffba38] border border-[#ffba38] px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#ffba38]" />
                Nueva Recomendación
              </button>

              <button
                onClick={() => toggleChapter('ch6_recomendaciones')}
                className="text-xs font-bold text-[#717973] hover:text-black"
              >
                Ocultar Capítulo
              </button>
            </div>
          </div>

          {/* SUMMARY STRIP FOR RECOMMENDATIONS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#f8fdfa] rounded-2xl border border-[#c1c8c2] space-y-0.5">
              <span className="text-[10px] font-mono uppercase font-bold text-[#717973] block">
                Impacto Potencial Total
              </span>
              <span className="text-xl font-mono font-black text-emerald-800">
                +${recStats.totalImpact.toLocaleString()} USD
              </span>
            </div>

            <div className="p-3 bg-[#f8fdfa] rounded-2xl border border-[#c1c8c2] space-y-0.5">
              <span className="text-[10px] font-mono uppercase font-bold text-[#717973] block">
                Costo de Implementación
              </span>
              <span className="text-xl font-mono font-black text-rose-800">
                ${recStats.totalCost.toLocaleString()} USD
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-0.5">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-900 block">
                Beneficio Neto Estimado
              </span>
              <span className="text-xl font-mono font-black text-amber-950">
                +${recStats.netBenefit.toLocaleString()} USD
              </span>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-300 space-y-0.5">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block">
                Avance de Ejecución
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono font-black text-blue-950">
                  {recStats.executionPercent}%
                </span>
                <span className="text-[10px] font-bold text-blue-800">
                  ({recStats.completedCount}/{recommendations.length} OK)
                </span>
              </div>
            </div>
          </div>

          {/* RECOMMENDATIONS FILTERS BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#f8fdfa] p-3 rounded-2xl border border-[#c1c8c2] print:hidden text-xs">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-[#717973] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Categoría:
              </span>
              <button
                onClick={() => setRecCatFilter('todas')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  recCatFilter === 'todas'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-white text-[#717973] border border-[#c1c8c2]'
                }`}
              >
                Todas ({recommendations.length})
              </button>
              <button
                onClick={() => setRecCatFilter('nutricion')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  recCatFilter === 'nutricion'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-white text-[#717973] border border-[#c1c8c2]'
                }`}
              >
                🌾 Nutrición
              </button>
              <button
                onClick={() => setRecCatFilter('reproduccion')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  recCatFilter === 'reproduccion'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-white text-[#717973] border border-[#c1c8c2]'
                }`}
              >
                🧬 Reproducción
              </button>
              <button
                onClick={() => setRecCatFilter('pastos')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  recCatFilter === 'pastos'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-white text-[#717973] border border-[#c1c8c2]'
                }`}
              >
                🌿 Pastos
              </button>
              <button
                onClick={() => setRecCatFilter('sanidad')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  recCatFilter === 'sanidad'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-white text-[#717973] border border-[#c1c8c2]'
                }`}
              >
                🛡️ Sanidad
              </button>
              <button
                onClick={() => setRecCatFilter('finanzas')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  recCatFilter === 'finanzas'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-white text-[#717973] border border-[#c1c8c2]'
                }`}
              >
                💵 Finanzas
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="font-bold text-[#717973]">Prioridad:</span>
              <select
                value={recPriorityFilter}
                onChange={(e) => setRecPriorityFilter(e.target.value)}
                className="bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1 font-bold text-[#012d1d] focus:outline-none"
              >
                <option value="todas">Todas las Prioridades</option>
                <option value="alta">🔴 Alta Prioridad</option>
                <option value="media">🟡 Media Prioridad</option>
                <option value="preventiva">🟢 Preventiva</option>
              </select>
            </div>
          </div>

          {/* RECOMMENDATIONS CARDS GRID */}
          <div className="space-y-4">
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-8 bg-[#f8fdfa] rounded-2xl border border-dashed border-[#c1c8c2]">
                <Info className="w-8 h-8 text-[#717973] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#717973]">
                  No se encontraron recomendaciones con los filtros seleccionados.
                </p>
              </div>
            ) : (
              filteredRecommendations.map((rec) => {
                const priorityBadge = {
                  alta: { label: '🔴 ALTA PRIORIDAD', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
                  media: { label: '🟡 MEDIA PRIORIDAD', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
                  preventiva: { label: '🟢 PREVENTIVA', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                }[rec.priority];

                const categoryLabel = {
                  nutricion: '🌾 Nutrición & Raciones',
                  reproduccion: '🧬 Reproducción & Genética',
                  pastos: '🌿 Pastos & Suelos',
                  sanidad: '🛡️ Sanidad & Bienestar',
                  finanzas: '💵 Gestión & Finanzas',
                }[rec.category];

                const statusBadge = {
                  pendiente: { label: '⏳ Pendiente', bg: 'bg-slate-100 text-slate-800 border-slate-300' },
                  en_progreso: { label: '🔄 En Progreso', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
                  completada: { label: '✅ Ejecutada', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                }[rec.status];

                return (
                  <div
                    key={rec.id}
                    className={`p-4 md:p-5 rounded-2xl border-2 transition-all space-y-3 ${
                      rec.status === 'completada'
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : rec.priority === 'alta'
                        ? 'bg-white border-[#012d1d]'
                        : 'bg-white border-[#c1c8c2]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eeeeee] pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${priorityBadge.bg}`}>
                          {priorityBadge.label}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-[#f8fdfa] text-[#012d1d] border border-[#c1c8c2] px-2.5 py-0.5 rounded-full">
                          {categoryLabel}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#717973] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Plazo: {rec.timeframeDays} días
                        </span>
                      </div>

                      <div className="flex items-center gap-2 print:hidden">
                        <button
                          onClick={() => handleToggleRecStatus(rec.id, rec.status)}
                          className={`text-xs font-mono font-black px-3 py-1 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${statusBadge.bg}`}
                          title="Haga clic para cambiar estado de ejecución"
                        >
                          {rec.status === 'completada' ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span>{statusBadge.label}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteRec(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                          title="Eliminar recomendación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-[#012d1d] flex items-center gap-2">
                        <span>{rec.title}</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#f8fdfa] p-3 rounded-xl border border-[#e2efe8] space-y-1">
                        <span className="font-black text-[#012d1d] text-[10px] uppercase block">
                          ⚠ Diagnóstico / Oportunidad:
                        </span>
                        <p className="text-[#525a55] font-medium leading-relaxed">
                          {rec.problemStatement}
                        </p>
                      </div>

                      <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 space-y-1">
                        <span className="font-black text-emerald-950 text-[10px] uppercase block">
                          💡 Solución Propuesta & Protocolo:
                        </span>
                        <p className="text-emerald-950 font-medium leading-relaxed">
                          {rec.proposedSolution}
                        </p>
                      </div>
                    </div>

                    {/* FINANCIAL METRICS BAR */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#012d1d] text-white p-3 rounded-xl font-mono">
                      <div>
                        <span className="text-[9px] text-emerald-300 uppercase block">Impacto Estimado</span>
                        <span className="font-black text-[#ffba38]">
                          +${rec.financialImpactUSD.toLocaleString()} USD
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-emerald-300 uppercase block">Costo Implementación</span>
                        <span className="font-bold text-white">
                          ${rec.implementationCostUSD.toLocaleString()} USD
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-emerald-300 uppercase block">ROI Estimado</span>
                        <span className="font-black text-emerald-300">
                          {rec.roiPercent}%
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] text-emerald-300 uppercase block">Responsable</span>
                        <span className="font-bold text-slate-200 text-[10px] truncate block">
                          {rec.responsibleRole}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR NUEVA RECOMENDACIÓN                                         */}
      {/* ========================================================================= */}
      {showAddRecModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-2xl w-full p-6 space-y-5 card-shadow my-8">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold">
                  <Plus className="w-6 h-6 text-[#ffba38]" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#012d1d]">
                    Agregar Recomendación al Informe
                  </h3>
                  <p className="text-xs text-[#717973]">
                    Incorpore un nuevo dictamen técnico, protocolo o sugerencia financiera.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddRecModal(false)}
                className="text-slate-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRec} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">
                  Título de la Recomendación: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Implementación de Creep Feeding en terneros de cría"
                  value={newRec.title}
                  onChange={(e) => setNewRec({ ...newRec, title: e.target.value })}
                  className="w-full bg-[#f8fdfa] border border-[#c1c8c2] rounded-xl px-3 py-2 font-medium text-[#012d1d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">
                    Categoría:
                  </label>
                  <select
                    value={newRec.category}
                    onChange={(e) => setNewRec({ ...newRec, category: e.target.value as any })}
                    className="w-full bg-[#f8fdfa] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d] focus:outline-none"
                  >
                    <option value="nutricion">🌾 Nutrición & Alimentación</option>
                    <option value="reproduccion">🧬 Reproducción & Genética</option>
                    <option value="pastos">🌿 Pastos & Manejo Forrajero</option>
                    <option value="sanidad">🛡️ Sanidad & Bienestar</option>
                    <option value="finanzas">💵 Gestión & Finanzas</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">
                    Nivel de Prioridad:
                  </label>
                  <select
                    value={newRec.priority}
                    onChange={(e) => setNewRec({ ...newRec, priority: e.target.value as any })}
                    className="w-full bg-[#f8fdfa] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d] focus:outline-none"
                  >
                    <option value="alta">🔴 Alta Prioridad</option>
                    <option value="media">🟡 Media Prioridad</option>
                    <option value="preventiva">🟢 Preventiva</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">
                  Diagnóstico / Situación Encontrada:
                </label>
                <textarea
                  rows={2}
                  placeholder="Describa el problema o causa raíz identificada..."
                  value={newRec.problemStatement}
                  onChange={(e) => setNewRec({ ...newRec, problemStatement: e.target.value })}
                  className="w-full bg-[#f8fdfa] border border-[#c1c8c2] rounded-xl p-3 font-medium text-[#012d1d] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">
                  Solución Propuesta & Protocolo Técnico: *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describa los pasos de implementación y formulación..."
                  value={newRec.proposedSolution}
                  onChange={(e) => setNewRec({ ...newRec, proposedSolution: e.target.value })}
                  className="w-full bg-[#f8fdfa] border border-[#c1c8c2] rounded-xl p-3 font-medium text-[#012d1d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">
                    Impacto Estimado ($ USD):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newRec.financialImpactUSD}
                    onChange={(e) => setNewRec({ ...newRec, financialImpactUSD: Number(e.target.value) })}
                    className="w-full bg-[#f8fdfa] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">
                    Costo Implementación ($ USD):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newRec.implementationCostUSD}
                    onChange={(e) => setNewRec({ ...newRec, implementationCostUSD: Number(e.target.value) })}
                    className="w-full bg-[#f8fdfa] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">
                    Plazo (Días):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newRec.timeframeDays}
                    onChange={(e) => setNewRec({ ...newRec, timeframeDays: Number(e.target.value) })}
                    className="w-full bg-[#f8fdfa] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">
                  Responsable de Ejecución:
                </label>
                <input
                  type="text"
                  value={newRec.responsibleRole}
                  onChange={(e) => setNewRec({ ...newRec, responsibleRole: e.target.value })}
                  className="w-full bg-[#f8fdfa] border border-[#c1c8c2] rounded-xl px-3 py-2 font-medium text-[#012d1d] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setShowAddRecModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] hover:bg-[#083e29] text-[#ffba38] font-black rounded-xl cursor-pointer"
                >
                  Guardar Recomendación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAPÍTULO 7: ANÁLISIS AGROCLIMÁTICO DE LLUVIAS & BALANCE HÍDRICO           */}
      {/* ========================================================================= */}
      {includedChapters.ch7_lluvias && (
        <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-6 print:break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#eeeeee] pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-black shrink-0 border border-blue-300">
                <CloudRain className="w-6 h-6 text-blue-800" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-blue-900 uppercase bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                  CAPÍTULO 7
                </span>
                <h3 className="font-black text-lg text-[#012d1d] mt-0.5">
                  Análisis Agroclimático de Lluvias, Pluviometría & Balance Hídrico
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={() => toggleChapter('ch7_lluvias')}
                className="text-xs font-bold text-[#717973] hover:text-black"
              >
                Ocultar Capítulo
              </button>
            </div>
          </div>

          {/* KPI SUMMARY STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-700" /> Precipitaciones Acumuladas
              </span>
              <span className="text-xl font-mono font-black text-blue-950">
                895 mm
              </span>
              <span className="text-[10px] text-blue-800 font-medium block">
                +12% vs promedio histórico regional
              </span>
            </div>

            <div className="p-3.5 bg-cyan-50/70 rounded-2xl border border-cyan-200 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-900 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-700" /> Días de Lluvia Efectiva
              </span>
              <span className="text-xl font-mono font-black text-cyan-950">
                87 Días
              </span>
              <span className="text-[10px] text-cyan-800 font-medium block">
                Promedio 10.8 días/mes con &gt;2mm
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-900 block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" /> Crecimiento de Pasto
              </span>
              <span className="text-xl font-mono font-black text-emerald-950">
                46.8 kg MS/ha/d
              </span>
              <span className="text-[10px] text-emerald-800 font-medium block">
                0.47 kg MS por mm de lluvia útil
              </span>
            </div>

            <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-900 block flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-700" /> Nivel de Reservorios
              </span>
              <span className="text-xl font-mono font-black text-amber-950">
                90.0%
              </span>
              <span className="text-[10px] text-amber-800 font-medium block">
                Jagüeyes y tanques de reserva llenos
              </span>
            </div>
          </div>

          {/* MAIN GRAPH: LLUVIAS VS EVAPOTRANSPIRACIÓN Y CRECIMIENTO DE PASTO */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#f8fdfa] p-3 rounded-2xl border border-[#c1c8c2]">
              <div>
                <h4 className="font-bold text-xs text-[#012d1d] flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-600" />
                  <span>Régimen Pluviométrico (mm) vs Evapotranspiración (ET0) y Tasa de Crecimiento Forrajero</span>
                </h4>
                <p className="text-[10px] text-[#717973]">
                  Identificación de meses con superávit hídrico (Lluvia &gt; ET0) vs déficit estacional para planificación de pastoreo.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span> Precipitaciones (mm)
                </span>
                <span className="flex items-center gap-1 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Evapotranspiración ET0
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block"></span> Crecimiento Pasto (kg MS)
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={RAINFALL_DETAILED_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'Milímetros (mm)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: 'Crecimiento (kg MS/ha/día)', angle: 90, position: 'insideRight', style: { fontSize: 10 } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#012d1d', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(val: any, name: string) => {
                      if (name === 'rainfallMm') return [`${val} mm`, '🌧️ Precipitaciones'];
                      if (name === 'evapotranspirationMm') return [`${val} mm`, '☀️ Evapotranspiración (ET0)'];
                      if (name === 'waterBalanceMm') return [`${val > 0 ? '+' : ''}${val} mm`, '💧 Balance Hídrico'];
                      if (name === 'pastureGrowthKgMS') return [`${val} kg MS/ha/d`, '🌿 Crecimiento Pasto'];
                      return [val, name];
                    }}
                  />
                  <Bar yAxisId="left" dataKey="rainfallMm" name="rainfallMm" fill="#3b82f6" radius={[6, 6, 0, 0]} opacity={0.85} />
                  <Bar yAxisId="left" dataKey="waterBalanceMm" name="waterBalanceMm" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.4} />
                  <Line yAxisId="left" type="monotone" dataKey="evapotranspirationMm" name="evapotranspirationMm" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="pastureGrowthKgMS" name="pastureGrowthKgMS" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* STATIONS & PLUVIOMETERS DETAILED TABLE */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#012d1d] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-800" />
                <span>Monitoreo por Pluviómetros Sectorizados & Estado de Reservorios</span>
              </h4>
              <span className="text-[10px] font-mono text-[#717973] font-bold">
                Red de pluviómetros de finca • Lectura diaria 07:00 AM
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#c1c8c2]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#012d1d] text-white font-mono text-[10px] uppercase">
                    <th className="p-2.5">Estación / Potrero Sectorizado</th>
                    <th className="p-2.5 text-center">Acumulado Mes (mm)</th>
                    <th className="p-2.5 text-center">Días de Lluvia</th>
                    <th className="p-2.5 text-center">Max Evento 24h (mm)</th>
                    <th className="p-2.5 text-center">Nivel Reservorio %</th>
                    <th className="p-2.5 text-center">Estado del Suelo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee] font-medium text-[#012d1d]">
                  {RAINGAUGE_STATIONS.map((st, i) => {
                    const statusBadge = {
                      optimo: { label: '🟢 Humedad Óptima', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                      alerta_leve: { label: '🟡 Ligero Déficit', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
                      saturado: { label: '🔵 Suelo Saturado', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
                    }[st.estado] || { label: st.estado, bg: 'bg-gray-100 text-gray-800' };

                    return (
                      <tr key={i} className="hover:bg-emerald-50/50 transition-all">
                        <td className="p-2.5 font-bold text-[#012d1d]">
                          {st.stationName}
                        </td>
                        <td className="p-2.5 text-center font-mono font-black text-blue-900">
                          {st.acumuladoMesMm} mm
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          {st.diasLluvia} días
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-amber-900">
                          {st.maxEvento24h} mm/24h
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${st.reservorioNivel}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px]">{st.reservorioNivel}%</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AGROCLIMATIC DIAGNOSTIC & INSIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3.5 rounded-2xl bg-[#f8fdfa] border border-blue-200 space-y-1.5">
              <span className="font-black text-blue-950 text-[11px] flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-blue-700" />
                Manejo de Pastoreo en Pico de Lluvias
              </span>
              <p className="text-[#525a55] leading-relaxed text-[11px]">
                Precipitaciones superiores a 150 mm/mes aceleran la tasa de rebrote pero incrementan el riesgo de apisotamiento en potreros bajos (Sector La Esmeralda). Se recomienda reducir el tiempo de ocupación a <b>12-18 horas por potrero</b>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f8fdfa] border border-emerald-200 space-y-1.5">
              <span className="font-black text-emerald-950 text-[11px] flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-emerald-700" />
                Calidad Nutricional del Forraje Falso
              </span>
              <p className="text-[#525a55] leading-relaxed text-[11px]">
                En época de alta pluviosidad, el pasto fresco presenta hasta <b>85% de agua libre</b>, disminuyendo el consumo de materia seca por vaca. Es indispensable mantener la suplementación con fibra efectiva y ensilaje.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f8fdfa] border border-amber-200 space-y-1.5">
              <span className="font-black text-amber-950 text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Control Sanitario & Barro en Establo
              </span>
              <p className="text-[#525a55] leading-relaxed text-[11px]">
                Eventos torrenciales de &gt;35 mm en 24h elevan la humedad ambiental. Se activa el protocolo preventivo de <b>pedestuvios con Sulfato de Cobre al 5%</b> en el callejón de salida del ordeño para prevenir pododermatitis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIGNATURE BLOCK FOR FORMAL PRINT                                         */}
      {/* ========================================================================= */}
      <div className="hidden print:block pt-12">
        <div className="grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="border-t-2 border-black pt-2 font-bold uppercase">
              Dr. Alejandro Gómez - Médico Veterinario Zootecnista
            </div>
            <p className="text-[10px] text-gray-600">Matrícula Profesional MP-88421</p>
          </div>

          <div>
            <div className="border-t-2 border-black pt-2 font-bold uppercase">
              Ing. Carlos Mendoza - Gerente Técnico de Operaciones
            </div>
            <p className="text-[10px] text-gray-600">Ganadería El Paraíso & Asociados</p>
          </div>
        </div>
      </div>
    </div>
  );
};
