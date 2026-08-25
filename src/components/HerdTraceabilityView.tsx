import React, { useState, useMemo } from 'react';
import { safePrint } from '../utils/printUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import {
  Search,
  Eye,
  Milk,
  Dna,
  ShieldCheck,
  Award,
  Download,
  Printer,
  Sparkles,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Tag,
  Heart,
  Baby,
  BarChart3,
  Users,
  Layers,
  FileText,
  Stethoscope,
  X,
  History,
  Info,
} from 'lucide-react';

// ============================================================================
// COMPREHENSIVE MASTER TRACEABILITY DATA TYPES
// ============================================================================

export interface OffspringRecord {
  id: string;
  earTag: string;
  name: string;
  birthDate: string;
  sex: 'Macho' | 'Hembra';
  birthWeightKg: number;
  weaningWeightKg: number;
  weaningAgeDays: number;
  sireName: string;
  damTag?: string; // Madre de la cría (muy útil para los toros)
  currentStatus: string;
}

export interface DiseaseClinicalRecord {
  id: string;
  date: string;
  condition: string;
  symptoms: string;
  treatmentApplied: string;
  vetName: string;
  status: 'Resuelto' | 'En Tratamiento' | 'Bajo Observación';
}

export interface LactationRecord {
  lactationNumber: number; // Lactancia 1, Lactancia 2, etc.
  startDate: string; // Fecha de parto
  endDate: string; // Fecha de secado o "En Curso"
  totalLiters305Days: number; // Litros totales producidos en la lactancia
  peakLitersDay: number; // Pico de producción L/día
  averageFatPercent: number; // % Grasa Butírica
  averageProteinPercent: number; // % Proteína Verdadera
  daysInMilkDEL: number; // DEL
  status: 'En Curso' | 'Cerrada / Seca' | 'Interrumpida';
  calvingOutcome: 'Parto Normal (Eutócico)' | 'Distócico (Asistido)' | 'Mellizos' | 'Pérdida Gestacional';
}

export interface GestationalLossRecord {
  id: string;
  date: string;
  gestationalAgeMonths: number; // Edad gestacional en meses
  classification: 'Aborto Temprano (3-4 meses)' | 'Aborto Tardío (5-8 meses)' | 'Reabsorción Embrionaria' | 'Natimorto / Muerte Fetal';
  suspectedCause: string; // e.g., "Neosporosis", "Brucelosis (Descartada Negativo)", "Estrés Térmico", "Traumatismo"
  vetDiagnosis: string;
  treatmentApplied: string;
  uterineRestDays: number; // Días de reposo uterino recomendado
}

export interface MasterTraceabilityAnimal {
  id: string;
  earTag: string;
  animalName: string;
  eidChip: string;
  registrationNum: string;
  breed: string;
  breedCategory: 'Leche' | 'Carne' | 'Doble Propósito';
  sex: 'Hembra' | 'Macho';
  colorCoat: string;
  brandIron: string;
  
  // 1. TRAZABILIDAD - NACIMIENTO, INGRESO & PESOS
  birthDate: string;
  entryDate: string;
  origin: string;
  lotName: string;
  damTag: string;
  sireName: string;
  maternalGrandSire?: string;
  
  // Pesos & Crecimiento
  birthWeightKg: number;
  weaningWeightKg: number;
  weaningAgeDays: number;
  currentWeightKg: number;
  gdpGramsDay: number;
  bodyConditionScore: number;
  
  // Sanidad & Retiro
  healthStatus: 'Excelente' | 'Bueno' | 'Bajo Tratamiento' | 'Atención Especial';
  aftosaVaccineDate: string;
  brucellosisVaccine: string;
  tuberculosisTest: string;
  clostridialVaccineDate: string;
  recordedDiseases: DiseaseClinicalRecord[];
  withdrawalPeriodDays: number;
  withdrawalType: 'Ninguno' | 'Leche' | 'Carne' | 'Ambos';
  withdrawalActive: boolean;

  // 2. GENÉTICA POR RAZA
  bloodComposition: string;
  breedStandardTargets: {
    targetLitersDayOrGDP: string;
    targetFatOrYield: string;
    targetProteinOrFCR: string;
    rusticityAdaptation: string;
  };
  geneticPerformanceScore: number;
  geneticIndexDEPs: {
    milkLitersDEP?: string;
    fatPercentDEP?: string;
    weaningWeightDEP?: string;
    carcassYieldDEP?: string;
    tickResistanceRating?: string;
  };
  recommendedCouplingSires: string[];

  // 3. REPRODUCCIÓN & LACTANCIAS
  reproStatus: 'Gestante' | 'Abierta - Espera Voluntaria' | 'Servida IATF' | 'Seca Gestante' | 'Anestro' | 'Toro Apto - Reproductor' | 'Novillo Ceba';
  calvingsLactationsCount: number;
  ageAtFirstCalvingMonths?: number;
  daysOpen?: number;
  daysInMilkDEL?: number;
  currentMilkLitersDay?: number;
  peakLitersDay?: number;
  servicesPerConception?: number;
  lastServiceDate?: string;
  sireUsedLastService?: string;
  scrotalCircumferenceCm?: number;
  andrologicalStatus?: string;
  
  // HISTORIAL DE LACTANCIAS DETALLADAS (Para Vacas Lecheras)
  lactationHistory?: LactationRecord[];

  // HISTORIAL DE PÉRDIDAS GESTACIONALES / ABORTOS
  gestationalLosses?: GestationalLossRecord[];
  
  // CRÍAS / DESCENDENCIA (Tanto para Vacas como para Toros)
  offspringList: OffspringRecord[];
}

// ============================================================================
// MASTER HERD DATABASE WITH RICH LACTATIONS, ABORTIONS & PROGENY
// ============================================================================

export const MASTER_HERD_TRACEABILITY_DATA: MasterTraceabilityAnimal[] = [
  {
    id: 'mat-104',
    earTag: 'VACA-104',
    animalName: 'Claraboya Royal',
    eidChip: '985 000294019281',
    registrationNum: 'RG-81200',
    breed: 'Holstein Friesian PO',
    breedCategory: 'Leche',
    sex: 'Hembra',
    colorCoat: 'Overo Negro / Blanco',
    brandIron: 'H-04',
    birthDate: '2022-03-15',
    entryDate: '2022-03-15',
    origin: 'Nacido en Finca (Hato Principal)',
    lotName: 'Lote 01 - Alta Producción',
    damTag: 'VACA-062',
    sireName: 'Holstein Planet Kingpin',
    maternalGrandSire: 'O-Man Justy',
    birthWeightKg: 42,
    weaningWeightKg: 185,
    weaningAgeDays: 180,
    currentWeightKg: 585,
    gdpGramsDay: 720,
    bodyConditionScore: 3.25,
    healthStatus: 'Excelente',
    aftosaVaccineDate: '2026-05-12',
    brucellosisVaccine: 'RB51 Aplicada (Cría)',
    tuberculosisTest: 'Negativo (Prueba Tuberculina ICA 2026)',
    clostridialVaccineDate: '2026-04-10',
    recordedDiseases: [
      {
        id: 'd1',
        date: '2025-08-14',
        condition: 'Mastitis Subclínica Grado 1',
        symptoms: 'Leve recuento celular elevado en prueba CMT',
        treatmentApplied: 'Infusión Intramamaria Cefalosporina (3 días)',
        vetName: 'Dr. Roberto Mendoza',
        status: 'Resuelto',
      },
    ],
    withdrawalPeriodDays: 0,
    withdrawalType: 'Ninguno',
    withdrawalActive: false,
    bloodComposition: '100% Holstein Friesian Puro de Origen',
    breedStandardTargets: {
      targetLitersDayOrGDP: '28.0 - 35.0 L/día',
      targetFatOrYield: '3.65% Grasa Butírica',
      targetProteinOrFCR: '3.20% Proteína Verdadera',
      rusticityAdaptation: 'Clima Frío / Templado • Sistema Estabulado',
    },
    geneticPerformanceScore: 98.5,
    geneticIndexDEPs: {
      milkLitersDEP: '+920 L / lactancia 305d',
      fatPercentDEP: '+0.12%',
      weaningWeightDEP: '+14.2 kg',
      tickResistanceRating: 'Moderada (Requiere Control)',
    },
    recommendedCouplingSires: ['Gyr Breyer de La Voluntad (Para F1 Girolando)', 'Holstein Sexado Magnus'],
    reproStatus: 'Servida IATF',
    calvingsLactationsCount: 2,
    ageAtFirstCalvingMonths: 23,
    daysOpen: 45,
    daysInMilkDEL: 45,
    currentMilkLitersDay: 28.2,
    peakLitersDay: 29.8,
    servicesPerConception: 1,
    lastServiceDate: '2026-07-22',
    sireUsedLastService: 'Gyr Breyer de La Voluntad',
    
    // TABLA DE LACTANCIAS ACUMULADAS
    lactationHistory: [
      {
        lactationNumber: 1,
        startDate: '2024-02-10',
        endDate: '2025-01-15',
        totalLiters305Days: 7850,
        peakLitersDay: 28.5,
        averageFatPercent: 3.65,
        averageProteinPercent: 3.18,
        daysInMilkDEL: 305,
        status: 'Cerrada / Seca',
        calvingOutcome: 'Parto Normal (Eutócico)',
      },
      {
        lactationNumber: 2,
        startDate: '2025-06-12',
        endDate: 'En Curso',
        totalLiters305Days: 8420, // proyectado
        peakLitersDay: 29.8,
        averageFatPercent: 3.72,
        averageProteinPercent: 3.22,
        daysInMilkDEL: 45,
        status: 'En Curso',
        calvingOutcome: 'Parto Normal (Eutócico)',
      },
    ],

    // HISTORIAL DE PÉRDIDAS GESTACIONALES / ABORTOS
    gestationalLosses: [
      {
        id: 'loss-104-1',
        date: '2024-11-05',
        gestationalAgeMonths: 3.5,
        classification: 'Aborto Temprano (3-4 meses)',
        suspectedCause: 'Neosporosis Caninum (Confirmado Título Serológico)',
        vetDiagnosis: 'Expulsión embrionaria sin complicaciones colaterales',
        treatmentApplied: 'Lavado uterino antiséptico + Oxitocina + 45 días reposo uterino',
        uterineRestDays: 45,
      },
    ],

    // HIJOS DE LA VACA
    offspringList: [
      {
        id: 'off-1',
        earTag: 'CRIA-104-A',
        name: 'Claraboya Jr.',
        birthDate: '2024-02-10',
        sex: 'Hembra',
        birthWeightKg: 40,
        weaningWeightKg: 190,
        weaningAgeDays: 180,
        sireName: 'Holstein Planet Kingpin',
        currentStatus: 'Novilla Levante - Lote Reemplazo',
      },
      {
        id: 'off-2',
        earTag: 'CRIA-104-B',
        name: 'Toro F1 Girolando 01',
        birthDate: '2025-06-12',
        sex: 'Macho',
        birthWeightKg: 38,
        weaningWeightKg: 215,
        weaningAgeDays: 210,
        sireName: 'Gyr Sansao PO',
        currentStatus: 'Macho F1 Venta Reproductor',
      },
    ],
  },
  {
    id: 'mat-142',
    earTag: 'VACA-142',
    animalName: 'Garota F1 Sansao',
    eidChip: '985 000692019481',
    registrationNum: 'RG-79110',
    breed: 'Girolando F1',
    breedCategory: 'Leche',
    sex: 'Hembra',
    colorCoat: 'Negro Chorrreado / Miel',
    brandIron: 'G-14',
    birthDate: '2021-08-20',
    entryDate: '2021-08-20',
    origin: 'Nacido en Finca (Cruce F1 Controlado)',
    lotName: 'Lote 01 - Alta Producción',
    damTag: 'VACA-038 (Holstein)',
    sireName: 'Gyr Sansao PO',
    maternalGrandSire: 'Holstein Planet Kingpin',
    birthWeightKg: 36,
    weaningWeightKg: 210,
    weaningAgeDays: 210,
    currentWeightKg: 520,
    gdpGramsDay: 680,
    bodyConditionScore: 3.5,
    healthStatus: 'Excelente',
    aftosaVaccineDate: '2026-05-12',
    brucellosisVaccine: 'Cepa 19 Oficial',
    tuberculosisTest: 'Negativo',
    clostridialVaccineDate: '2026-04-10',
    recordedDiseases: [],
    withdrawalPeriodDays: 0,
    withdrawalType: 'Ninguno',
    withdrawalActive: false,
    bloodComposition: '50% Gyr Lechero + 50% Holstein Friesian',
    breedStandardTargets: {
      targetLitersDayOrGDP: '22.0 - 28.0 L/día',
      targetFatOrYield: '4.10% Grasa Butírica',
      targetProteinOrFCR: '3.40% Proteína Verdadera',
      rusticityAdaptation: '100% Tolerancia Térmica • Resistencia a Garrapata',
    },
    geneticPerformanceScore: 99.2,
    geneticIndexDEPs: {
      milkLitersDEP: '+1,120 L / lactancia (Heterosis F1)',
      fatPercentDEP: '+0.35%',
      weaningWeightDEP: '+22.0 kg',
      tickResistanceRating: '100% Máxima Resistencia',
    },
    recommendedCouplingSires: ['Holstein Sexado Magnus (Para 5/8 Girolando)', 'Gyr Breyer'],
    reproStatus: 'Abierta - Espera Voluntaria',
    calvingsLactationsCount: 3,
    ageAtFirstCalvingMonths: 25,
    daysOpen: 35,
    daysInMilkDEL: 35,
    currentMilkLitersDay: 26.8,
    peakLitersDay: 27.5,
    servicesPerConception: 0,
    lastServiceDate: 'Pendiente Programación',
    sireUsedLastService: 'Semen Sexado Holstein Magnus',

    lactationHistory: [
      {
        lactationNumber: 1,
        startDate: '2023-01-15',
        endDate: '2023-11-20',
        totalLiters305Days: 6200,
        peakLitersDay: 24.0,
        averageFatPercent: 4.12,
        averageProteinPercent: 3.38,
        daysInMilkDEL: 305,
        status: 'Cerrada / Seca',
        calvingOutcome: 'Parto Normal (Eutócico)',
      },
      {
        lactationNumber: 2,
        startDate: '2024-05-01',
        endDate: '2025-03-10',
        totalLiters305Days: 7100,
        peakLitersDay: 26.5,
        averageFatPercent: 4.18,
        averageProteinPercent: 3.42,
        daysInMilkDEL: 305,
        status: 'Cerrada / Seca',
        calvingOutcome: 'Parto Normal (Eutócico)',
      },
      {
        lactationNumber: 3,
        startDate: '2025-06-01',
        endDate: 'En Curso',
        totalLiters305Days: 7800,
        peakLitersDay: 27.5,
        averageFatPercent: 4.20,
        averageProteinPercent: 3.45,
        daysInMilkDEL: 35,
        status: 'En Curso',
        calvingOutcome: 'Parto Normal (Eutócico)',
      },
    ],

    gestationalLosses: [],

    offspringList: [
      {
        id: 'off-142-1',
        earTag: 'CRIA-142-1',
        name: 'Garotita 5/8',
        birthDate: '2024-05-01',
        sex: 'Hembra',
        birthWeightKg: 35,
        weaningWeightKg: 205,
        weaningAgeDays: 210,
        sireName: 'Holstein Magnus',
        currentStatus: 'Novilla 5/8 Girolando',
      },
    ],
  },
  {
    id: 'mat-801',
    earTag: 'TORO-801',
    animalName: 'Kaiser Brahman Turbo 801',
    eidChip: '982 000998827101',
    registrationNum: 'AB-99201',
    breed: 'Brahman Blanco / Rojo',
    breedCategory: 'Carne',
    sex: 'Macho',
    colorCoat: 'Blanco Plateado Acinturado',
    brandIron: 'B-80',
    birthDate: '2023-01-10',
    entryDate: '2023-01-10',
    origin: 'Nacido en Finca (Cabaña Brahman PO)',
    lotName: 'Lote Toros Reproductores',
    damTag: 'VAC-BR-040',
    sireName: 'Brahman Manso 883',
    maternalGrandSire: 'Brahman JDH Madison',
    birthWeightKg: 34,
    weaningWeightKg: 248,
    weaningAgeDays: 210,
    currentWeightKg: 780,
    gdpGramsDay: 1350,
    bodyConditionScore: 4.25,
    healthStatus: 'Excelente',
    aftosaVaccineDate: '2026-05-12',
    brucellosisVaccine: 'No Aplica (Macho)',
    tuberculosisTest: 'Negativo',
    clostridialVaccineDate: '2026-04-18',
    recordedDiseases: [],
    withdrawalPeriodDays: 28,
    withdrawalType: 'Carne',
    withdrawalActive: true,
    bloodComposition: '100% Brahman Blanco Puro de Origen',
    breedStandardTargets: {
      targetLitersDayOrGDP: '1,250 - 1,400 g/día GDP',
      targetFatOrYield: '58.0% Rendimiento Canal',
      targetProteinOrFCR: '6.2 kg MS / kg carne FCR',
      rusticityAdaptation: 'Sobresaliente Adaptación al Calor Extremo y Garrapatas',
    },
    geneticPerformanceScore: 99.8,
    geneticIndexDEPs: {
      weaningWeightDEP: '+28.5 kg (Top 1% Raza)',
      carcassYieldDEP: '+3.2% Marmoleo y Canal',
      tickResistanceRating: '100% Inmune a Estrés Térmico',
    },
    recommendedCouplingSires: ['Novillas Angus Negro PO (Para F1 Brangus / Ceba)'],
    reproStatus: 'Toro Apto - Reproductor',
    calvingsLactationsCount: 0,
    scrotalCircumferenceCm: 39.5,
    andrologicalStatus: 'Toro Apto - Motilidad Masiva 85% • Morfología 92% Normal',
    
    // HIJOS / PROGENIE DEL TORO REGISTRADOS EN EL SISTEMA
    offspringList: [
      {
        id: 'off-801-1',
        earTag: 'CRIA-801-A',
        name: 'Novillo F1 Brahman x Angus 01',
        birthDate: '2025-09-10',
        sex: 'Macho',
        birthWeightKg: 33,
        weaningWeightKg: 255,
        weaningAgeDays: 210,
        sireName: 'Kaiser Brahman Turbo 801',
        damTag: 'VAC-ANGUS-12',
        currentStatus: 'Novillo Ceba Pesada',
      },
      {
        id: 'off-801-2',
        earTag: 'CRIA-801-B',
        name: 'Novilla F1 Brahman x Jersey 02',
        birthDate: '2025-11-02',
        sex: 'Hembra',
        birthWeightKg: 31,
        weaningWeightKg: 228,
        weaningAgeDays: 210,
        sireName: 'Kaiser Brahman Turbo 801',
        damTag: 'VACA-101',
        currentStatus: 'Novilla Levante F1 Doble Propósito',
      },
      {
        id: 'off-801-3',
        earTag: 'CRIA-801-C',
        name: 'Ternero Simbrah Kaiser 03',
        birthDate: '2026-01-20',
        sex: 'Macho',
        birthWeightKg: 39,
        weaningWeightKg: 250,
        weaningAgeDays: 210,
        sireName: 'Kaiser Brahman Turbo 801',
        damTag: 'VACA-701',
        currentStatus: 'Ternero Lactante Ceba',
      },
    ],
  },
  {
    id: 'mat-101',
    earTag: 'VACA-101',
    animalName: 'Mariposa Jersey PO',
    eidChip: '982 000392019381',
    registrationNum: 'RG-82105',
    breed: 'Jersey PO',
    breedCategory: 'Leche',
    sex: 'Hembra',
    colorCoat: 'Bayo Miel Claro',
    brandIron: 'J-10',
    birthDate: '2022-01-14',
    entryDate: '2022-01-14',
    origin: 'Nacido en Finca',
    lotName: 'Lote 02 - Media Producción',
    damTag: 'VACA-015',
    sireName: 'Jersey Valentino PO',
    birthWeightKg: 26,
    weaningWeightKg: 155,
    weaningAgeDays: 180,
    currentWeightKg: 435,
    gdpGramsDay: 580,
    bodyConditionScore: 3.0,
    healthStatus: 'Excelente',
    aftosaVaccineDate: '2026-05-12',
    brucellosisVaccine: 'RB51 Oficial',
    tuberculosisTest: 'Negativo',
    clostridialVaccineDate: '2026-04-10',
    recordedDiseases: [],
    withdrawalPeriodDays: 0,
    withdrawalType: 'Ninguno',
    withdrawalActive: false,
    bloodComposition: '100% Jersey Puro de Origen',
    breedStandardTargets: {
      targetLitersDayOrGDP: '20.0 - 25.0 L/día',
      targetFatOrYield: '4.85% Grasa Butírica',
      targetProteinOrFCR: '3.80% Proteína Verdadera',
      rusticityAdaptation: 'Máxima Eficiencia de Conversion Sólidos Lácteos',
    },
    geneticPerformanceScore: 98.8,
    geneticIndexDEPs: {
      milkLitersDEP: '+650 L / lactancia',
      fatPercentDEP: '+0.45%',
      weaningWeightDEP: '+10.5 kg',
      tickResistanceRating: 'Buena Adaptación Pastoreo',
    },
    recommendedCouplingSires: ['Jersey Chrono', 'Jersey Sexado Headline'],
    reproStatus: 'Gestante',
    calvingsLactationsCount: 2,
    ageAtFirstCalvingMonths: 22,
    daysOpen: 82,
    daysInMilkDEL: 82,
    currentMilkLitersDay: 24.5,
    peakLitersDay: 26.0,
    servicesPerConception: 2,
    lastServiceDate: '2026-03-10',
    sireUsedLastService: 'Jersey Chrono',

    lactationHistory: [
      {
        lactationNumber: 1,
        startDate: '2024-01-10',
        endDate: '2024-11-15',
        totalLiters305Days: 5800,
        peakLitersDay: 23.5,
        averageFatPercent: 4.80,
        averageProteinPercent: 3.75,
        daysInMilkDEL: 305,
        status: 'Cerrada / Seca',
        calvingOutcome: 'Parto Normal (Eutócico)',
      },
      {
        lactationNumber: 2,
        startDate: '2025-03-01',
        endDate: 'En Curso',
        totalLiters305Days: 6400,
        peakLitersDay: 26.0,
        averageFatPercent: 4.88,
        averageProteinPercent: 3.82,
        daysInMilkDEL: 82,
        status: 'En Curso',
        calvingOutcome: 'Parto Normal (Eutócico)',
      },
    ],

    gestationalLosses: [],

    offspringList: [
      {
        id: 'off-101-1',
        earTag: 'CRIA-101-A',
        name: 'Mariposita Jersey',
        birthDate: '2024-01-10',
        sex: 'Hembra',
        birthWeightKg: 25,
        weaningWeightKg: 160,
        weaningAgeDays: 180,
        sireName: 'Jersey Chrono',
        currentStatus: 'Novilla Gestante 1er Serv.',
      },
    ],
  },
];

export const ALL_HERD_BREEDS = [
  'Todas las Razas',
  'Holstein Friesian PO',
  'Girolando F1',
  'Jersey PO',
  'Brahman Blanco / Rojo',
  'Angus PO / Brangus',
  'Guzerá x Pardo Suizo',
  'Gyr Lechero PO',
  'Simmental x Cebú',
  'Normando',
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface HerdTraceabilityViewProps {
  isDairyEnabled?: boolean;
  onToggleDairyModule?: () => void;
}

export const HerdTraceabilityView: React.FC<HerdTraceabilityViewProps> = () => {
  // 1. PRIMERA CLASIFICACIÓN (FILTRO PRINCIPAL: Todos o por Raza)
  const [selectedBreedClassification, setSelectedBreedClassification] = useState<string>('Todas las Razas');

  // 2. SEGUNDA CLASIFICACIÓN (VISTAS DE DETALLE)
  const [selectedSecondTab, setSelectedSecondTab] = useState<
    '1_TODOS' | '2_TRAZABILIDAD' | '3_GENETICA' | '4_REPRODUCTIVO'
  >('1_TODOS');

  // Search Query & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sexFilter, setSexFilter] = useState<'Todos' | 'Hembras' | 'Machos'>('Todos');
  const [sanitaryFilter, setSanitaryFilter] = useState<'Todos' | 'Apto' | 'Retiro_Activo'>('Todos');

  // Modal Detail State for Selected Animal
  const [selectedAnimalDetail, setSelectedAnimalDetail] = useState<MasterTraceabilityAnimal | null>(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Animals
  const filteredAnimals = useMemo(() => {
    return MASTER_HERD_TRACEABILITY_DATA.filter((animal) => {
      const matchesBreed =
        selectedBreedClassification === 'Todas las Razas' ||
        animal.breed.toLowerCase().includes(selectedBreedClassification.toLowerCase()) ||
        (selectedBreedClassification.includes('Angus') && animal.breed.includes('Brangus')) ||
        (selectedBreedClassification.includes('Gyr') && animal.breed.includes('Gyr'));

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        animal.earTag.toLowerCase().includes(q) ||
        animal.animalName.toLowerCase().includes(q) ||
        animal.eidChip.toLowerCase().includes(q) ||
        animal.registrationNum.toLowerCase().includes(q) ||
        animal.colorCoat.toLowerCase().includes(q) ||
        animal.lotName.toLowerCase().includes(q);

      const matchesSex =
        sexFilter === 'Todos' ||
        (sexFilter === 'Hembras' && animal.sex === 'Hembra') ||
        (sexFilter === 'Machos' && animal.sex === 'Macho');

      const matchesSanitary =
        sanitaryFilter === 'Todos' ||
        (sanitaryFilter === 'Retiro_Activo' && animal.withdrawalActive) ||
        (sanitaryFilter === 'Apto' && !animal.withdrawalActive);

      return matchesBreed && matchesSearch && matchesSex && matchesSanitary;
    });
  }, [selectedBreedClassification, searchQuery, sexFilter, sanitaryFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = filteredAnimals.length;
    const females = filteredAnimals.filter((a) => a.sex === 'Hembra').length;
    const males = filteredAnimals.filter((a) => a.sex === 'Macho').length;
    const activeWithdrawals = filteredAnimals.filter((a) => a.withdrawalActive).length;
    const avgWeight = total > 0 ? Math.round(filteredAnimals.reduce((acc, a) => acc + a.currentWeightKg, 0) / total) : 0;
    const avgGdp = total > 0 ? Math.round(filteredAnimals.reduce((acc, a) => acc + a.gdpGramsDay, 0) / total) : 0;

    return { total, females, males, activeWithdrawals, avgWeight, avgGdp };
  }, [filteredAnimals]);

  // Export CSV Action
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `MATRIZ DE TRAZABILIDAD - CLASIFICACION RAZA: ${selectedBreedClassification.toUpperCase()} - VISTA: ${selectedSecondTab}\n\n`;

    if (selectedSecondTab === '2_TRAZABILIDAD') {
      csvContent += 'Arete,Nombre,Chip RFID,Registro,Raza,Sexo,Color,Fecha Nacimiento,Fecha Ingreso,Origen,Lote,Peso Nacer (kg),Peso Destete (kg),Peso Actual (kg),GDP (g/d),Estado Sanitario,Aftosa Fecha,Retiro Dias,Retiro Activo\n';
      filteredAnimals.forEach((a) => {
        csvContent += `"${a.earTag}","${a.animalName}","${a.eidChip}","${a.registrationNum}","${a.breed}","${a.sex}","${a.colorCoat}","${a.birthDate}","${a.entryDate}","${a.origin}","${a.lotName}",${a.birthWeightKg},${a.weaningWeightKg},${a.currentWeightKg},${a.gdpGramsDay},"${a.healthStatus}","${a.aftosaVaccineDate}",${a.withdrawalPeriodDays},"${a.withdrawalActive ? 'SI' : 'NO'}"\n`;
      });
    } else if (selectedSecondTab === '3_GENETICA') {
      csvContent += 'Arete,Nombre,Raza,Composicion Sangre,Puntaje Genetico %,Metas Raza,DEPs Leche/Peso,DEPs Grasa/Canal,Padrotes Sugeridos\n';
      filteredAnimals.forEach((a) => {
        csvContent += `"${a.earTag}","${a.animalName}","${a.breed}","${a.bloodComposition}",${a.geneticPerformanceScore}%,"${a.breedStandardTargets.targetLitersDayOrGDP}","${a.geneticIndexDEPs.milkLitersDEP || a.geneticIndexDEPs.weaningWeightDEP || 'N/A'}","${a.geneticIndexDEPs.fatPercentDEP || a.geneticIndexDEPs.carcassYieldDEP || 'N/A'}","${a.recommendedCouplingSires.join(' | ')}"\n`;
      });
    } else if (selectedSecondTab === '4_REPRODUCTIVO') {
      csvContent += 'Arete,Nombre,Raza,Sexo,Estado Reproductivo,Num Partos/Lactancias,EPP Meses,Dias Abiertos,DEL,Produccion L/d,Num Lactancias Registradas,Num Perdidas Gestacionales,Num Hijos Registrados\n';
      filteredAnimals.forEach((a) => {
        csvContent += `"${a.earTag}","${a.animalName}","${a.breed}","${a.sex}","${a.reproStatus}",${a.calvingsLactationsCount},${a.ageAtFirstCalvingMonths || 0},${a.daysOpen || 0},${a.daysInMilkDEL || 0},${a.currentMilkLitersDay || 0},${a.lactationHistory?.length || 0},${a.gestationalLosses?.length || 0},${a.offspringList.length}\n`;
      });
    } else {
      csvContent += 'Arete,Nombre,Chip RFID,Raza,Categoria,Sexo,Lote,Peso Actual (kg),GDP (g/d),Estado Repro,Produccion L/d,Estado Sanitario,Retiro Activo\n';
      filteredAnimals.forEach((a) => {
        csvContent += `"${a.earTag}","${a.animalName}","${a.eidChip}","${a.breed}","${a.breedCategory}","${a.sex}","${a.lotName}",${a.currentWeightKg},${a.gdpGramsDay},"${a.reproStatus}",${a.currentMilkLitersDay || 0},"${a.healthStatus}","${a.withdrawalActive ? 'SI' : 'NO'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Trazabilidad_${selectedBreedClassification}_${selectedSecondTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Descargando matriz CSV (${selectedBreedClassification} - ${selectedSecondTab})...`);
  };

  return (
    <div className="bg-[#f8fdfa] space-y-6 animate-in fade-in pb-12 font-sans text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0D1A13] text-[#ffba38] border-2 border-[#ffba38] px-4 py-3 rounded-2xl shadow-2xl font-mono text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#ffba38]" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* MODULE HEADER */}
      <div className="bg-gradient-to-r from-[#012d1d] via-[#04422c] to-[#012d1d] rounded-3xl p-6 text-white border-2 border-[#083e29] shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Dna className="w-80 h-80 text-emerald-300" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#D4A94E] text-white">
              <ShieldCheck className="w-3.5 h-3.5" /> MÓDULO DE TRAZABILIDAD E INFORMACIÓN INDIVIDUAL DEL ANIMAL
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>

              <button
                type="button"
                onClick={safePrint}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-2 border border-white/20 transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-white flex items-center gap-2.5">
                <Dna className="w-8 h-8 text-[#ffba38] shrink-0" />
                <span>Módulo de Trazabilidad Ganadera & Parámetros Zootécnicos</span>
              </h1>
              <div className="group relative inline-flex items-center">
                <button
                  type="button"
                  className="text-[#a3b8ad] hover:text-[#A5B8AC] transition-colors p-0.5 rounded cursor-pointer"
                  title="Consulte la trazabilidad completa del hato: Nacimiento, marca/hierro, pesajes, ganancias de peso, historial de lactancias, pérdidas gestacionales y progenie."
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-80 bg-[#0D1A13] text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl border border-[#2d6a4f] pointer-events-none animate-in fade-in zoom-in-95">
                  Consulte la trazabilidad completa del hato: Nacimiento, marca/hierro, pesajes, ganancias de peso (GDP), historial de lactancias por vaca, pérdidas gestacionales/abortos y los hijos/progenie de vacas y toros en el sistema.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRIMERA CLASIFICACIÓN: "TODOS LOS ANIMALES" O "POR RAZA"                    */}
      {/* ========================================================================= */}
      <div className="bg-[#15241C] p-5 rounded-3xl border-2 border-[#012d1d]/15 shadow-sm space-y-4 font-mono">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#012d1d]/10 pb-3">
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" /> PRIMERA CLASIFICACIÓN
            </span>
            <h2 className="text-base font-black text-white mt-0.5">
              Filtro Principal del Hato: Todos los Animales o por Raza
            </h2>
          </div>

          <div className="text-xs font-mono bg-emerald-950/30 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Animales Seleccionados: <b>{filteredAnimals.length}</b> de {MASTER_HERD_TRACEABILITY_DATA.length}</span>
          </div>
        </div>

        {/* BREED SELECTOR PILLS */}
        <div className="flex flex-wrap items-center gap-2">
          {ALL_HERD_BREEDS.map((breed) => {
            const isSelected = selectedBreedClassification === breed;
            return (
              <button
                key={breed}
                type="button"
                onClick={() => setSelectedBreedClassification(breed)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#0D1A13] text-[#ffba38] border-[#012d1d] shadow-md scale-105'
                    : 'bg-[#f0fdf4] text-white border-[#c1ecd4] hover:bg-emerald-100'
                }`}
              >
                <Tag className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ffba38]' : 'text-emerald-700'}`} />
                <span>{breed === 'Todas las Razas' ? 'o Todos los animales' : `Raza: ${breed}`}</span>
              </button>
            );
          })}
        </div>

        {/* SEARCH & SECONDARY CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A5B8AC]" />
            <input
              type="text"
              placeholder="Buscar por Arete, Nombre, RFID, Pelaje o Lote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#f8fdfa] rounded-xl border border-white/15 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
            />
          </div>

          <div>
            <select
              value={sexFilter}
              onChange={(e) => setSexFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-[#f8fdfa] rounded-xl border border-white/15 text-xs font-bold text-white"
            >
              <option value="Todos">Filtro Sexo: Todos</option>
              <option value="Hembras">Solo Hembras</option>
              <option value="Machos">Solo Machos / Toros</option>
            </select>
          </div>

          <div>
            <select
              value={sanitaryFilter}
              onChange={(e) => setSanitaryFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-[#f8fdfa] rounded-xl border border-white/15 text-xs font-bold text-white"
            >
              <option value="Todos">Sanidad: Todos los estados</option>
              <option value="Apto">Apto (Sin Retiro Activo)</option>
              <option value="Retiro_Activo">⚠️ En Retiro Sanitario Activo</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEGUNDA CLASIFICACIÓN: 4 NIVELES DE INFORMACIÓN                           */}
      {/* 1. TODOS                                                                  */}
      {/* 2. TRAZABILIDAD - TODA LA INFORMACIÓN DEL ANIMAL                          */}
      {/* 3. PARÁMETROS GENÉTICOS DEPENDIENDO DE LA RAZA                           */}
      {/* 4. PARÁMETROS REPRODUCTIVOS (LACTANCIAS, ABORTOS, HIJOS VACA Y TORO)       */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* SEGUNDA CLASIFICACIÓN TAB BAR */}
        <div className="bg-[#0D1A13] p-2 rounded-2xl text-white flex flex-wrap items-center gap-2 border-2 border-[#083e29] shadow-lg font-mono">
          <span className="text-[10px] font-black uppercase text-[#ffba38] px-2.5 py-1 bg-black/40 rounded-lg flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> SEGUNDA CLASIFICACIÓN:
          </span>

          <button
            type="button"
            onClick={() => setSelectedSecondTab('1_TODOS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedSecondTab === '1_TODOS'
                ? 'bg-[#D4A94E] text-white shadow-md scale-105'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>1. TODOS (Vista General)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSecondTab('2_TRAZABILIDAD')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedSecondTab === '2_TRAZABILIDAD'
                ? 'bg-[#D4A94E] text-white shadow-md scale-105'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. TRAZABILIDAD COMPLETA</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSecondTab('3_GENETICA')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedSecondTab === '3_GENETICA'
                ? 'bg-[#D4A94E] text-white shadow-md scale-105'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. PARÁMETROS GENÉTICOS</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSecondTab('4_REPRODUCTIVO')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedSecondTab === '4_REPRODUCTIVO'
                ? 'bg-[#D4A94E] text-white shadow-md scale-105'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>4. REPRODUCCIÓN, LACTANCIAS & HIJOS</span>
          </button>
        </div>

        {/* TAB 1: TODOS */}
        {selectedSecondTab === '1_TODOS' && (
          <div className="space-y-4 animate-in fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-[#15241C] rounded-2xl border border-white/10 shadow-sm space-y-1">
                <span className="text-[#A5B8AC] font-bold text-[10px] uppercase block">Total Animales</span>
                <span className="text-xl font-black text-white">{metrics.total}</span>
                <span className="text-[9px] text-emerald-700 font-bold block">Filtro Actual</span>
              </div>

              <div className="p-3.5 bg-[#15241C] rounded-2xl border border-white/10 shadow-sm space-y-1">
                <span className="text-[#A5B8AC] font-bold text-[10px] uppercase block">Hembras / Reprod.</span>
                <span className="text-xl font-black text-pink-700">{metrics.females}</span>
                <span className="text-[9px] text-[#A5B8AC] block">Vientres y Terneras</span>
              </div>

              <div className="p-3.5 bg-[#15241C] rounded-2xl border border-white/10 shadow-sm space-y-1">
                <span className="text-[#A5B8AC] font-bold text-[10px] uppercase block">Machos / Toros</span>
                <span className="text-xl font-black text-blue-700">{metrics.males}</span>
                <span className="text-[9px] text-[#A5B8AC] block">Toros y Ceba</span>
              </div>

              <div className="p-3.5 bg-[#15241C] rounded-2xl border border-white/10 shadow-sm space-y-1">
                <span className="text-[#A5B8AC] font-bold text-[10px] uppercase block">Peso Promedio</span>
                <span className="text-xl font-black text-emerald-800">{metrics.avgWeight} kg</span>
                <span className="text-[9px] text-[#A5B8AC] block">En báscula</span>
              </div>

              <div className="p-3.5 bg-[#15241C] rounded-2xl border border-white/10 shadow-sm space-y-1">
                <span className="text-[#A5B8AC] font-bold text-[10px] uppercase block">GDP Promedio</span>
                <span className="text-xl font-black text-amber-700">{metrics.avgGdp} g/día</span>
                <span className="text-[9px] text-[#A5B8AC] block">Ganancia de Peso</span>
              </div>

              <div className={`p-3.5 rounded-2xl border shadow-sm space-y-1 ${metrics.activeWithdrawals > 0 ? 'bg-rose-950/30 border-rose-300 text-rose-950' : 'bg-[#15241C] border-white/10 text-white'}`}>
                <span className="font-bold text-[10px] uppercase block">Alertas Retiro</span>
                <span className={`text-xl font-black ${metrics.activeWithdrawals > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{metrics.activeWithdrawals}</span>
                <span className="text-[9px] font-bold block">{metrics.activeWithdrawals > 0 ? '⚠️ Bloqueo Leche/Carne' : '✓ Todo en regla'}</span>
              </div>
            </div>

            {/* Master Consolidated Table */}
            <div className="bg-[#15241C] rounded-3xl border-2 border-[#012d1d]/15 shadow-sm overflow-hidden font-mono text-xs">
              <div className="p-4 bg-[#0D1A13] text-white flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#ffba38] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#ffba38]" />
                  Directorio Maestro de Animales ({filteredAnimals.length}) — Clasificación: {selectedBreedClassification}
                </h3>
                <span className="text-[10px] text-emerald-200">
                  Haz clic en cualquier animal para abrir la Ficha Integral de Trazabilidad
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#1F3327] text-white text-[10px] uppercase tracking-wider border-b border-white/10">
                      <th className="p-3">Arete / Nombre</th>
                      <th className="p-3">Chip RFID / Registro</th>
                      <th className="p-3">Raza / Pelaje</th>
                      <th className="p-3">Lote / Categoría</th>
                      <th className="p-3 text-right">Peso (kg) / GDP</th>
                      <th className="p-3">Estatus Reproductivo</th>
                      <th className="p-3 text-center">Hijos Registrados</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredAnimals.map((animal) => (
                      <tr key={animal.id} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="p-3 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#0D1A13] text-[#ffba38] rounded font-black text-[11px]">
                              {animal.earTag}
                            </span>
                            <span>{animal.animalName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-white">
                          <div><b>{animal.eidChip}</b></div>
                          <div className="text-[10px] text-[#A5B8AC]">{animal.registrationNum}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{animal.breed}</div>
                          <div className="text-[10px] text-[#A5B8AC]">{animal.colorCoat}</div>
                        </td>
                        <td className="p-3 text-white">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px]">
                            {animal.lotName}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-black text-emerald-900">{animal.currentWeightKg} kg</div>
                          <div className="text-[10px] text-amber-700 font-bold">+{animal.gdpGramsDay} g/día</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-pink-100 text-pink-900 rounded font-bold text-[10px]">
                            {animal.reproStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-pink-950">
                          <span className="px-2.5 py-1 bg-pink-50 border border-pink-200 rounded-xl text-xs">
                            👶 {animal.offspringList.length} Cría(s)
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedAnimalDetail(animal)}
                            className="px-3 py-1.5 bg-[#0D1A13] text-[#ffba38] hover:bg-emerald-900 rounded-xl font-bold text-[11px] flex items-center gap-1 mx-auto cursor-pointer shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ficha
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRAZABILIDAD COMPLETA */}
        {selectedSecondTab === '2_TRAZABILIDAD' && (
          <div className="space-y-4 animate-in fade-in font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnimals.map((animal) => (
                <div key={animal.id} className="bg-[#15241C] p-5 rounded-3xl border-2 border-[#012d1d]/15 shadow-sm space-y-4">
                  {/* Animal Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-[#0D1A13] text-[#ffba38] rounded-xl font-black text-xs">
                          {animal.earTag}
                        </span>
                        <span className="font-black text-base text-black">{animal.animalName}</span>
                      </div>
                      <span className="text-[11px] text-[#A5B8AC] block mt-0.5">
                        {animal.breed} • {animal.sex} • Pelaje: <b>{animal.colorCoat}</b>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedAnimalDetail(animal)}
                      className="px-2.5 py-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-bold rounded-xl text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ficha
                    </button>
                  </div>

                  {/* Identification Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-[#0D1A13] p-3 rounded-2xl border border-white/10">
                    <div>
                      <span className="text-[#A5B8AC] block text-[9.5px] uppercase">Chip RFID:</span>
                      <span className="font-black text-white">{animal.eidChip}</span>
                    </div>
                    <div>
                      <span className="text-[#A5B8AC] block text-[9.5px] uppercase">Registro Genealógico:</span>
                      <span className="font-bold text-white">{animal.registrationNum}</span>
                    </div>
                    <div>
                      <span className="text-[#A5B8AC] block text-[9.5px] uppercase">Hierro / Marca:</span>
                      <span className="font-bold text-white">{animal.brandIron}</span>
                    </div>
                    <div>
                      <span className="text-[#A5B8AC] block text-[9.5px] uppercase">Fecha Nacimiento:</span>
                      <span className="font-bold text-white">{animal.birthDate}</span>
                    </div>
                    <div>
                      <span className="text-[#A5B8AC] block text-[9.5px] uppercase">Fecha Ingreso:</span>
                      <span className="font-bold text-white">{animal.entryDate}</span>
                    </div>
                    <div>
                      <span className="text-[#A5B8AC] block text-[9.5px] uppercase">Origen / Lote:</span>
                      <span className="font-bold text-emerald-800">{animal.origin}</span>
                    </div>
                  </div>

                  {/* Weights */}
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-2">
                    <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-emerald-700" />
                      Evolución de Pesos & Ganancia Diaria de Peso (GDP)
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10.5px]">
                      <div className="p-1.5 bg-[#15241C] rounded-xl border border-emerald-200">
                        <span className="text-[#A5B8AC] block text-[9px]">Peso Nacer</span>
                        <span className="font-black text-white">{animal.birthWeightKg} kg</span>
                      </div>
                      <div className="p-1.5 bg-[#15241C] rounded-xl border border-emerald-200">
                        <span className="text-[#A5B8AC] block text-[9px]">Peso Destete</span>
                        <span className="font-black text-white">{animal.weaningWeightKg} kg</span>
                      </div>
                      <div className="p-1.5 bg-[#15241C] rounded-xl border border-emerald-200">
                        <span className="text-[#A5B8AC] block text-[9px]">Peso Actual</span>
                        <span className="font-black text-emerald-900">{animal.currentWeightKg} kg</span>
                      </div>
                      <div className="p-1.5 bg-amber-100 rounded-xl border border-amber-300">
                        <span className="text-amber-900 block text-[9px] font-bold">GDP Actual</span>
                        <span className="font-black text-amber-900">+{animal.gdpGramsDay} g/d</span>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Diseases */}
                  <div className="p-3 bg-[#0D1A13] rounded-2xl border border-white/10 space-y-2 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-rose-600" />
                        Historial Clínico & Sanidad
                      </span>
                      {animal.withdrawalActive ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-black text-[9.5px]">
                          ⚠️ Retiro {animal.withdrawalPeriodDays} Días
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[9.5px]">
                          ✓ Apto
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-white space-y-1">
                      <div>• Vacuna Fiebre Aftosa: <b>{animal.aftosaVaccineDate}</b></div>
                      <div>• Brucelosis Oficial: <b>{animal.brucellosisVaccine}</b></div>
                      <div>• Prueba Tuberculina: <b>{animal.tuberculosisTest}</b></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PARÁMETROS GENÉTICOS */}
        {selectedSecondTab === '3_GENETICA' && (
          <div className="space-y-4 animate-in fade-in font-mono">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {filteredAnimals.map((animal) => (
                <div key={animal.id} className="bg-[#15241C] p-5 rounded-3xl border-2 border-purple-900/20 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-950 text-purple-200 rounded-lg font-black text-xs">
                          {animal.earTag}
                        </span>
                        <span className="font-black text-base text-black">{animal.animalName}</span>
                      </div>
                      <span className="text-[11px] text-purple-900 font-bold block mt-0.5">
                        Raza: {animal.breed}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#A5B8AC] uppercase block font-bold">Puntaje Genético</span>
                      <span className="text-lg font-black text-purple-700">{animal.geneticPerformanceScore}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-950/30 rounded-2xl border border-purple-200 space-y-1">
                    <span className="font-bold text-purple-950 text-[11px] flex items-center gap-1.5">
                      <Dna className="w-4 h-4 text-purple-700" />
                      Composición Racial & Genotipo:
                    </span>
                    <div className="text-xs font-black text-purple-900 bg-[#15241C] p-2 rounded-xl border border-purple-200">
                      {animal.bloodComposition}
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-purple-900 to-[#012d1d] text-white rounded-2xl space-y-2 text-[11px]">
                    <span className="font-bold text-[#ffba38] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#ffba38]" />
                      DEPs / EPDs (Diferencia Esperada de Progenie):
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-200">
                      {animal.geneticIndexDEPs.milkLitersDEP && (
                        <div>• DEP Leche: <b className="text-emerald-300">{animal.geneticIndexDEPs.milkLitersDEP}</b></div>
                      )}
                      {animal.geneticIndexDEPs.weaningWeightDEP && (
                        <div>• DEP Peso Destete: <b className="text-emerald-300">{animal.geneticIndexDEPs.weaningWeightDEP}</b></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REPRODUCCIÓN, LACTANCIAS DETALLADAS, ABORTOS E HIJOS */}
        {selectedSecondTab === '4_REPRODUCTIVO' && (
          <div className="space-y-4 animate-in fade-in font-mono">
            <div className="p-4 bg-pink-950 text-white rounded-2xl border border-pink-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <span>
                  <b>Información Reproductiva Avanzada:</b> Historial de lactancias consecutivas y totales para vacas lecheras, registro de pérdidas gestacionales/abortos y descendencia completa (cuántos y cuáles son los hijos de vacas y toros).
                </span>
              </div>
            </div>

            <div className="space-y-6 text-xs">
              {filteredAnimals.map((animal) => (
                <div key={animal.id} className="bg-[#15241C] p-5 rounded-3xl border-2 border-pink-900/20 shadow-sm space-y-5">
                  {/* Animal Repro Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-pink-950 text-pink-200 rounded-xl font-black text-xs">
                          {animal.earTag}
                        </span>
                        <span className="font-black text-lg text-black">{animal.animalName}</span>
                        <span className="px-2.5 py-0.5 bg-pink-100 text-pink-900 rounded font-bold text-[10px]">
                          {animal.sex}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#A5B8AC] block mt-1">
                        Raza: {animal.breed} • Estado Reproductivo: <b className="text-pink-900">{animal.reproStatus}</b>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 bg-pink-50 text-pink-950 rounded-xl font-black text-xs border border-pink-200">
                        {animal.sex === 'Hembra' ? `Partos / Lactancias: ${animal.calvingsLactationsCount}` : `Toro Padrote (Reproductor)`}
                      </span>
                    </div>
                  </div>

                  {/* FEMALE REPRODUCTIVE METRICS & LACTATION TABLE */}
                  {animal.sex === 'Hembra' && (
                    <div className="space-y-4">
                      {/* Female Summary KPIs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center text-[10.5px]">
                        <div className="p-2.5 bg-pink-50 rounded-xl border border-pink-200">
                          <span className="text-[#A5B8AC] block text-[9px] uppercase">EPP (1er Parto)</span>
                          <span className="font-black text-pink-900">{animal.ageAtFirstCalvingMonths || 'N/A'} meses</span>
                        </div>
                        <div className="p-2.5 bg-pink-50 rounded-xl border border-pink-200">
                          <span className="text-[#A5B8AC] block text-[9px] uppercase">Días Abiertos</span>
                          <span className="font-black text-pink-900">{animal.daysOpen || 0} días</span>
                        </div>
                        <div className="p-2.5 bg-blue-950/30 rounded-xl border border-blue-200">
                          <span className="text-[#A5B8AC] block text-[9px] uppercase">Días Lactancia (DEL)</span>
                          <span className="font-black text-blue-900">{animal.daysInMilkDEL || 0} DEL</span>
                        </div>
                        <div className="p-2.5 bg-blue-950/30 rounded-xl border border-blue-200">
                          <span className="text-[#A5B8AC] block text-[9px] uppercase">Producción Actual</span>
                          <span className="font-black text-blue-900">{animal.currentMilkLitersDay || 0} L/día</span>
                        </div>
                        <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-200">
                          <span className="text-[#A5B8AC] block text-[9px] uppercase">Servicios / Concep.</span>
                          <span className="font-black text-amber-900">{animal.servicesPerConception || 0} S/C</span>
                        </div>
                        <div className="p-2.5 bg-purple-950/30 rounded-xl border border-purple-200">
                          <span className="text-[#A5B8AC] block text-[9px] uppercase">Último Servicio</span>
                          <span className="font-bold text-purple-900">{animal.lastServiceDate || 'N/A'}</span>
                        </div>
                      </div>

                      {/* DETAILED LACTATIONS TABLE & CHART FOR COW */}
                      {animal.lactationHistory && animal.lactationHistory.length > 0 && (
                        <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-2">
                            <span className="font-black text-blue-950 text-xs flex items-center gap-1.5">
                              <Milk className="w-4 h-4 text-blue-700" />
                              Historial Gráfico & Tabla de Lactancias ({animal.animalName} - Arete {animal.earTag}):
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-300">
                              📊 Comparativa de Campañas Lácteas
                            </span>
                          </div>

                          {/* RECHARTS LACTATION COMPARISON CHART FOR THIS COW */}
                          <div className="bg-[#15241C] p-3 rounded-xl border border-blue-200 shadow-2xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                              Litros Acumulados (305 Días) vs. Pico Diario (L/día) por Lactancia
                            </span>
                            <div className="h-44 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                  data={animal.lactationHistory.map((lac) => ({
                                    nombre: `Lact. #${lac.lactationNumber}`,
                                    litros305: lac.totalLiters305Days,
                                    picoLiters: lac.peakLitersDay,
                                    grasa: lac.averageFatPercent,
                                    proteina: lac.averageProteinPercent,
                                  }))}
                                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                  <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: '#1e3a8a', fontWeight: 'bold' }} />
                                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} domain={[0, 45]} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#93c5fd', fontSize: '11px', fontWeight: 'bold' }}
                                    formatter={(value: any, name: any) => {
                                      if (name === 'Litros Totales (305d)') return [`${Number(value).toLocaleString()} L`, name];
                                      if (name === 'Pico L/día') return [`${value} L/día`, name];
                                      return [value, name];
                                    }}
                                  />
                                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                                  <Bar yAxisId="left" dataKey="litros305" name="Litros Totales (305d)" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={28} />
                                  <Line yAxisId="right" type="monotone" dataKey="picoLiters" name="Pico L/día" stroke="#dc2626" strokeWidth={3} dot={{ r: 5, fill: '#dc2626' }} />
                                </ComposedChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-blue-200 bg-[#15241C]">
                            <table className="w-full text-left text-[11px]">
                              <thead>
                                <tr className="bg-blue-100 text-blue-950 text-[9.5px] uppercase font-black">
                                  <th className="p-2">Lactancia</th>
                                  <th className="p-2">Fecha Inicio / Parto</th>
                                  <th className="p-2">Fecha Secado</th>
                                  <th className="p-2 text-right">Litros Totales (305d)</th>
                                  <th className="p-2 text-right">Pico L/día</th>
                                  <th className="p-2 text-right">% Grasa</th>
                                  <th className="p-2 text-right">% Proteína</th>
                                  <th className="p-2">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {animal.lactationHistory.map((lac) => (
                                  <tr key={lac.lactationNumber} className="hover:bg-blue-50/50">
                                    <td className="p-2 font-black text-blue-900">
                                      Lactancia #{lac.lactationNumber}
                                    </td>
                                    <td className="p-2 text-white">{lac.startDate}</td>
                                    <td className="p-2 text-white">{lac.endDate}</td>
                                    <td className="p-2 text-right font-black text-emerald-800">
                                      {lac.totalLiters305Days.toLocaleString()} Litros
                                    </td>
                                    <td className="p-2 text-right font-bold text-blue-900">
                                      {lac.peakLitersDay} L/d
                                    </td>
                                    <td className="p-2 text-right text-white">{lac.averageFatPercent}%</td>
                                    <td className="p-2 text-right text-white">{lac.averageProteinPercent}%</td>
                                    <td className="p-2 font-bold">
                                      {lac.status === 'En Curso' ? (
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[9.5px]">
                                          🟢 En Curso ({lac.daysInMilkDEL} DEL)
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 bg-[#1F3327] text-white rounded-full text-[9.5px]">
                                          ⚪ {lac.status}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* GESTATIONAL LOSSES / ABORTIONS TABLE */}
                      {animal.gestationalLosses && animal.gestationalLosses.length > 0 && (
                        <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
                          <span className="font-black text-rose-950 text-xs flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            Registro de Pérdidas Gestacionales / Abortos ({animal.gestationalLosses.length} Registrado):
                          </span>

                          <div className="space-y-2">
                            {animal.gestationalLosses.map((loss) => (
                              <div key={loss.id} className="p-3 bg-[#15241C] rounded-xl border border-rose-200 text-[10.5px] space-y-1">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-1">
                                  <span className="font-black text-rose-900">
                                    ⚠️ {loss.classification} ({loss.gestationalAgeMonths} Meses de Gestación)
                                  </span>
                                  <span className="font-bold text-[#A5B8AC]">Fecha: {loss.date}</span>
                                </div>
                                <div>• <b>Causa Diagnosticada:</b> {loss.suspectedCause}</div>
                                <div>• <b>Tratamiento & Reposo Uterino:</b> {loss.treatmentApplied} ({loss.uterineRestDays} Días Reposo)</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MALE ANDROLOGICAL METRICS */}
                  {animal.sex === 'Macho' && (
                    <div className="p-3.5 bg-blue-950/30 rounded-2xl border border-blue-200 space-y-2 text-[11px]">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-700" /> Evaluación Andrológica & Fertilidad del Toro:
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                        <div>• Circunferencia Escrotal: <b>{animal.scrotalCircumferenceCm || 'N/A'} cm</b></div>
                        <div>• Diagnóstico Andrológico: <b>{animal.andrologicalStatus || 'Apto'}</b></div>
                      </div>
                    </div>
                  )}

                  {/* OFFSPRING / HIJOS DE LA VACA O TORO */}
                  <div className="space-y-2.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-xs flex items-center gap-1.5">
                        <Baby className="w-4 h-4 text-pink-600" />
                        {animal.sex === 'Hembra'
                          ? `Hijos de la Vaca (${animal.offspringList.length} Registrados en Finca):`
                          : `Hijos / Progenie del Toro (${animal.offspringList.length} Registrados en el Sistema):`}
                      </span>

                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Total Descendencia: {animal.offspringList.length}
                      </span>
                    </div>

                    {animal.offspringList.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="bg-[#1F3327] text-white text-[9.5px] uppercase font-black">
                              <th className="p-2">Arete / Nombre Cría</th>
                              <th className="p-2">Fecha Nacimiento</th>
                              <th className="p-2">Sexo</th>
                              <th className="p-2 text-right">Peso Nacer</th>
                              <th className="p-2 text-right">Peso Destete (210d)</th>
                              <th className="p-2">Padre / Madre</th>
                              <th className="p-2">Estado Actual</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {animal.offspringList.map((off) => (
                              <tr key={off.id} className="hover:bg-[#0D1A13]">
                                <td className="p-2 font-bold text-black">
                                  {off.earTag} — {off.name}
                                </td>
                                <td className="p-2 text-white">{off.birthDate}</td>
                                <td className="p-2 font-bold text-pink-900">{off.sex}</td>
                                <td className="p-2 text-right font-bold text-white">{off.birthWeightKg} kg</td>
                                <td className="p-2 text-right font-black text-emerald-800">{off.weaningWeightKg} kg</td>
                                <td className="p-2 text-white">
                                  {animal.sex === 'Hembra' ? `Padre: ${off.sireName}` : `Madre: ${off.damTag || 'N/A'}`}
                                </td>
                                <td className="p-2 font-bold text-emerald-900">{off.currentStatus}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#0D1A13] rounded-xl border border-white/10 text-[#A5B8AC] text-[10.5px]">
                        No hay hijos registrados en el sistema actualmente para este animal.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ANIMAL DETAIL MODAL */}
      {selectedAnimalDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-mono text-xs">
          <div className="bg-[#15241C] text-white rounded-3xl max-w-4xl w-full border-2 border-[#012d1d] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-[#0D1A13] text-white flex items-center justify-between border-b border-[#083e29]">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#D4A94E] text-white rounded-xl font-black text-sm">
                  {selectedAnimalDetail.earTag}
                </span>
                <div>
                  <h3 className="font-black text-lg text-white">{selectedAnimalDetail.animalName}</h3>
                  <span className="text-xs text-emerald-200">
                    Raza: {selectedAnimalDetail.breed} • {selectedAnimalDetail.sex} • RFID: {selectedAnimalDetail.eidChip}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnimalDetail(null)}
                className="p-2 hover:bg-white/20 rounded-full text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-200">
                  <span className="text-[#A5B8AC] block text-[9.5px] uppercase">Peso Actual</span>
                  <span className="text-lg font-black text-emerald-900">{selectedAnimalDetail.currentWeightKg} kg</span>
                </div>
                <div className="p-3 bg-amber-950/30 rounded-2xl border border-amber-200">
                  <span className="text-[#A5B8AC] block text-[9.5px] uppercase">GDP Ganancia Peso</span>
                  <span className="text-lg font-black text-amber-900">+{selectedAnimalDetail.gdpGramsDay} g/día</span>
                </div>
                <div className="p-3 bg-pink-50 rounded-2xl border border-pink-200">
                  <span className="text-[#A5B8AC] block text-[9.5px] uppercase">Estado Repro</span>
                  <span className="text-xs font-black text-pink-900">{selectedAnimalDetail.reproStatus}</span>
                </div>
                <div className="p-3 bg-purple-950/30 rounded-2xl border border-purple-200">
                  <span className="text-[#A5B8AC] block text-[9.5px] uppercase">Puntaje Genético</span>
                  <span className="text-lg font-black text-purple-900">{selectedAnimalDetail.geneticPerformanceScore}%</span>
                </div>
              </div>

              {/* LACTATION HISTORY IN MODAL IF COW */}
              {selectedAnimalDetail.sex === 'Hembra' && selectedAnimalDetail.lactationHistory && (
                <div className="p-4 bg-blue-950/30 rounded-2xl border border-blue-200 space-y-2">
                  <h4 className="font-black text-sm text-blue-950 flex items-center gap-2 border-b border-blue-200 pb-2">
                    <Milk className="w-4 h-4 text-blue-700" /> LACTANCIAS ACUMULADAS DE LA VACA
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    {selectedAnimalDetail.lactationHistory.map((lac) => (
                      <div key={lac.lactationNumber} className="p-2.5 bg-[#15241C] rounded-xl border border-blue-200 flex justify-between items-center">
                        <div>
                          <b>Lactancia #{lac.lactationNumber}</b> ({lac.startDate} a {lac.endDate})
                        </div>
                        <div className="font-black text-emerald-900">
                          {lac.totalLiters305Days.toLocaleString()} Litros (Pico: {lac.peakLitersDay} L/d)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OFFSPRING IN MODAL */}
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200 space-y-2">
                <h4 className="font-black text-sm text-pink-950 flex items-center gap-2 border-b border-pink-200 pb-2">
                  <Baby className="w-4 h-4 text-pink-700" />
                  {selectedAnimalDetail.sex === 'Hembra' ? 'HIJOS DE LA VACA' : 'HIJOS / PROGENIE DEL TORO'} ({selectedAnimalDetail.offspringList.length})
                </h4>
                {selectedAnimalDetail.offspringList.map((off) => (
                  <div key={off.id} className="p-2 bg-[#15241C] rounded-xl border border-pink-200 text-[11px] flex justify-between">
                    <span><b>{off.earTag}</b> - {off.name} ({off.sex})</span>
                    <span>Peso nacer: <b>{off.birthWeightKg} kg</b> • Destete: <b>{off.weaningWeightKg} kg</b></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#1F3327] border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAnimalDetail(null)}
                className="px-5 py-2 bg-[#0D1A13] text-white font-black rounded-xl text-xs hover:bg-emerald-900 cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
