import React, { useState, useMemo, useEffect } from 'react';
import {
  PedigreeAnimal,
  ReproductiveEvent,
  ReproductiveFemale,
  PhysiologicalStatus,
  ServiceType,
  ObservationMethod,
  DeliveryType,
  CalfCondition,
  PregnancyResult,
  DonorCow,
  ReceptorCow,
  SemenInventoryItem,
  SynchronizationProtocol,
  EmbryoItem,
} from '../types';
import {
  Award,
  Edit3,
  GitFork,
  Dna,
  History,
  FlaskConical,
  Heart,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CalendarDays,
  Search,
  Filter,
  ArrowRight,
  PlusCircle,
  Activity,
  Bot,
  Info,
  Clock,
  Send,
  Baby,
  Stethoscope,
  Flame,
  FileText,
  UserCheck,
  AlertCircle,
  TrendingUp,
  X,
  ChevronRight,
  Tag,
  Layers,
  Container,
  Database,
  Syringe,
  Microscope,
  Check,
  Plus,
  Compass,
  Printer,
  Download,
  Layers3,
  Copy,
  Camera,
  Upload,
  ScanLine,
  CheckSquare,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';

interface GeneticsViewProps {
  currentBull: PedigreeAnimal;
  bullsList: PedigreeAnimal[];
  onSelectBull: (bull: PedigreeAnimal) => void;
  reproductiveHistory: ReproductiveEvent[];
  onOpenEditModal: () => void;
  onOpenCertificateModal: () => void;
  onOpenBreedingSimulator: () => void;
  onOpenNewEventModal: () => void;
}

export interface GeneticLine {
  id: string;
  name: string;
  subtitle: string;
  photoUrl: string;
  fallbackPhotoUrl?: string;
  origin: string;
  aptitude: string;
  heterosisGrade: string;
  inventoryCountEstimate: number;
  morphology: {
    headProfile: string;
    bodyConformation: string;
    udderStructure: string;
    adaptationTraits: string;
    boneAndFeet: string;
  };
  reproductiveEfficiency: {
    epp: string;
    iep: string;
    conceptionRate: string;
    dailyYieldOrWeight: string;
    opuOrTeViability: string;
    usefulLife: string;
  };
  couplingStrategy: string;
}

const GENETIC_LINES_CATALOG: GeneticLine[] = [
  {
    id: 'gyr_lechero',
    name: 'Gyr Lechero (Puro Pedigrí)',
    subtitle: 'Base Zebuina Lechera Tropical & Donadoras de Oocitos OPU',
    photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80',
    origin: 'Brasil / India (Gyr de Selección Lechera)',
    aptitude: 'Lechería Especializada Tropical & Biotecnología FIV',
    heterosisGrade: '100% Zebuino Puro (Bos indicus)',
    inventoryCountEstimate: 14,
    morphology: {
      headProfile: 'Cabeza ultraconvexíflia con perfil abombado, cuernos caídos hacia atrás y orejas pendulares largas en forma de cartucho.',
      bodyConformation: 'Giba prominente en forma de castaña bien asentada sobre la cruz, tórax profundo, corte suave y anca caída que facilita el parto.',
      udderStructure: 'Ubre de gran volumen, tejido suave y plegable, ligamento suspensor medio bien marcado y pezones cilíndricos de longitud ideal.',
      adaptationTraits: 'Piel muy pigmentada, fina y suelta con elevada concentración de glándulas sudoríparas. Tolerancia térmica a más de 42°C.',
      boneAndFeet: 'Huesos fuertes y planos, cascos negros de alta dureza resistentes a terrenos húmedos.'
    },
    reproductiveEfficiency: {
      epp: '26.5 Meses',
      iep: '372 Días (12.4 Meses)',
      conceptionRate: '74% al 1er Servicio IA',
      dailyYieldOrWeight: '18.5 - 24.0 L/día (4,800 L/lactancia)',
      opuOrTeViability: '88% Oocitos viables (Prom. 14 embriones/aspiración)',
      usefulLife: '12 - 15 Lactancias Productivas'
    },
    couplingStrategy: 'Madre donadora principal para producción de embriones Girolando F1 con semen Holstein probado o para cruzamientos de refresco zebuino lechero.'
  },
  {
    id: 'girolando_f1',
    name: 'Girolando F1 & 5/8',
    subtitle: 'Máximo Vigor Híbrido Lechero para Trópico Bajo e Intenso',
    photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1000&q=80',
    origin: 'Cruce F1 (50% Gyr Lechero x 50% Holstein) y 5/8 Fijo',
    aptitude: 'Producción Intensiva de Leche en Pastoreo Tropical',
    heterosisGrade: 'Máxima Heterosis Híbrida F1 (100% Expresada)',
    inventoryCountEstimate: 22,
    morphology: {
      headProfile: 'Perfil sub-rectilíneo a rectilíneo, ojos expresivos y protegidos, orejas medianas horizontales a ligeramente caídas.',
      bodyConformation: 'Estructura angular e intermedia con amplio espacio intercostal, capacidad torácica sobresaliente para consumo de pastos.',
      udderStructure: 'Ubre globosa de amplia inserción anterior y posterior, venación mamaria tortuosa e irrigación sanguínea continua.',
      adaptationTraits: 'Capacidad superior de disipación de calor por evaporación. Inmunidad natural alta contra garrapatas y anaplasmosis.',
      boneAndFeet: 'Aplomos rectos y bien aplomados, movilidad superior en topografías quebradas.'
    },
    reproductiveEfficiency: {
      epp: '24.2 Meses',
      iep: '368 Días (12.2 Meses)',
      conceptionRate: '76% en IA / IATF',
      dailyYieldOrWeight: '22.0 - 28.5 L/día (6,200 L/lactancia)',
      opuOrTeViability: '82% viabilidad de receptora en transferencia',
      usefulLife: '10 - 12 Lactancias'
    },
    couplingStrategy: 'Hembras lecheras base del hato. Se acoplan con semen sexado hembra Girolando o toros Brangus/Angus para producción de terneros de carne pesados.'
  },
  {
    id: 'brangus_negro',
    name: 'Brangus Negro & Rojo (3/8 Zebu x 5/8 Angus)',
    subtitle: 'Carne Precoz, Marmoleo Premiado y Alta Eficiencia en Potrero',
    photoUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80',
    origin: 'EE.UU. / Argentina (3/8 Brahman + 5/8 Angus)',
    aptitude: 'Carne de Calidad Superior, Precocidad y Toros Sementales',
    heterosisGrade: 'Línea Sintética Estabilizada',
    inventoryCountEstimate: 18,
    morphology: {
      headProfile: 'Cabeza mocha natural (sin cuernos), perfil recto con frente ancha y ojos sobrios protegidos por arrugas de piel.',
      bodyConformation: 'Cuerpo cilíndrico de lomo recto y musculoso, masa muscular profunda en pierna y pernil, rendimiento en canal >61%.',
      udderStructure: 'Ubre recogida con pezones cortos y simétricos, alta concentración de grasa en leche para crianza vigorosa.',
      adaptationTraits: 'Pelaje corto, tupido y pigmentado (negro o rojo), piel suelta con buena secreción sebácea repelente.',
      boneAndFeet: 'Estructura ósea pesada pero refinada, cascos oscuros muy resistentes al desgaste.'
    },
    reproductiveEfficiency: {
      epp: '23.0 Meses (Muy Precoz)',
      iep: '360 Días (12.0 Meses - 1 Cría/Año)',
      conceptionRate: '78% en IATF masiva',
      dailyYieldOrWeight: 'Peso Destete (210d): 245 - 265 kg | GDP: 1.15 kg/día',
      opuOrTeViability: '75% Eficiencia de concepción en TE',
      usefulLife: '12 - 14 Años en Campo'
    },
    couplingStrategy: 'Línea paterna principal (Semental Don Juan 450 y Cacique 120) para cruces terminales sobre hembras vacías o de descarte, produciendo machos de ceba de rápida ganancia.'
  },
  {
    id: 'brahman_rojo',
    name: 'Brahman Rojo & Blanco (Zebú Puro de Carne)',
    subtitle: 'Pilar Maternidad Rústica, Resistencia Térmica & Vigor Reproductivo',
    photoUrl: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=1000&q=80',
    origin: 'EE.UU. / Colombia (Zebuino Seleccionado de Carne)',
    aptitude: 'Producción de Carne en Pastoreo & Crianza de Terneros Pesados',
    heterosisGrade: '100% Zebuino Puro (Bos indicus)',
    inventoryCountEstimate: 15,
    morphology: {
      headProfile: 'Perfil recto a ligeramente convexo, cuernos medianos inclinados hacia atrás y orejas ancha pendulares.',
      bodyConformation: 'Giba prominente y musculosa sobre la cruz, papada profunda con pliegues, cuerpo amplio y cuadril ancho.',
      udderStructure: 'Ubre fuerte de buena sustentación, leche rica en solidos para criar terneros pesados al destete.',
      adaptationTraits: 'Piel oscura y suelta con sudoración eficiente. Secreción sebácea natural que ahuyenta moscas y garrapatas.',
      boneAndFeet: 'Cascos amplios de alta resistencia para caminatas prolongadas en pastos extensivos.'
    },
    reproductiveEfficiency: {
      epp: '27.0 Meses',
      iep: '375 Días (12.5 Meses)',
      conceptionRate: '72% al 1er Servicio',
      dailyYieldOrWeight: 'Peso Destete (210d): 230 - 250 kg',
      opuOrTeViability: '84% Retención de embriones en transferencia',
      usefulLife: '14 - 16 Años en Pastoreo'
    },
    couplingStrategy: 'Base rústica ideal para cruce heterótico con razas taurinas especializadas (Angus, Simmental, Senepol).'
  },
  {
    id: 'nelore_guzera',
    name: 'Nelore & Guzerá (Línea Materna Rústica)',
    subtitle: 'Pared Inmune, Habilidad de Pastoreo Extrema y Cero Distocias',
    photoUrl: 'https://images.unsplash.com/photo-1596733430284-f74377611354?auto=format&fit=crop&w=1000&q=80',
    origin: 'Brasil / India (Zebuinos Puros Seleccionados)',
    aptitude: 'Hembras Receptoras de Embriones TE & Terneros de Ceba Rústicos',
    heterosisGrade: '100% Zebuino Puro (Bos indicus)',
    inventoryCountEstimate: 11,
    morphology: {
      headProfile: 'Cabeza fina y frente plana, ojos achinados protegidos con órbitas prominentes, orejas cortas horizontales.',
      bodyConformation: 'Cuerpo atlético y compacto, grupa oblicua que garantiza 100% facilidad de parto sin intervención.',
      udderStructure: 'Ubre recogida y suspendida con pezones pequeños que evitan laceraciones en malezas.',
      adaptationTraits: 'Pelaje blanco/gris brillante reflectivo contra rayos radiantes UV, adaptación extrema a sequías.',
      boneAndFeet: 'Huesos compactos y aplomos limpios de alta longevidad.'
    },
    reproductiveEfficiency: {
      epp: '25.8 Meses',
      iep: '360 Días (1 Cría por Año Constante)',
      conceptionRate: '80% Tasa de Éxito como Receptoras TE',
      dailyYieldOrWeight: 'Peso Destete (210d): 225 - 240 kg',
      opuOrTeViability: '90% Aceptación embrionaria',
      usefulLife: '15 - 18 Años de Servicio'
    },
    couplingStrategy: 'Usadas principalmente como vacas receptoras de embriones FIV vitrificados/frescos por su canal pelviano perfecto y nulo riesgo de parto distócico.'
  }
];

// Initial Mock Datasets
const INITIAL_FEMALES: ReproductiveFemale[] = [
  {
    id: 'cow-504',
    tagId: 'V-504',
    name: 'Esperanza 504',
    breed: 'Gyr x Holstein F1',
    birthDate: '2022-03-15',
    physiologicalStatus: 'Vaca parida',
    lotName: 'Lote Lechería Especializada 1',
    sireName: 'Sansao (Gyr)',
    damName: 'Lucero 14 (Holstein)',
    totalCalvings: 2,
    lastCalvingDate: '2026-03-10',
    lastServiceDate: '2026-06-15',
    lastServiceType: 'IA',
    bullOrSemenUsed: 'Don Juan 450 (Brangus)',
    confirmedPregnancyDate: '2026-07-28',
    gestationalDaysAccumulated: 55,
    fppDate: '2027-03-25',
    servicesPerConception: 1,
    epsMonths: 15.4,
    eppMonths: 24.2,
    diasAbiertos: 97,
    iepDays: 375,
    diasEnLeche: 152,
    alerts: ['Preñez Confirmada (55d)'],
  },
  {
    id: 'cow-102',
    tagId: 'BR-102',
    name: 'Rosita 102',
    breed: 'Brangus Negro',
    birthDate: '2021-05-10',
    physiologicalStatus: 'Vaca parida',
    lotName: 'Lote Donantes & Vientres',
    sireName: 'Rey Midas',
    damName: 'Matriarca 08',
    totalCalvings: 3,
    lastCalvingDate: '2025-11-20',
    lastServiceDate: '2026-05-02',
    lastServiceType: 'IA',
    bullOrSemenUsed: 'Don Juan 450 (Brangus)',
    confirmedPregnancyDate: undefined,
    gestationalDaysAccumulated: 0,
    fppDate: undefined,
    servicesPerConception: 2,
    epsMonths: 16.0,
    eppMonths: 25.1,
    diasAbiertos: 142,
    iepDays: 390,
    diasEnLeche: 262,
    alerts: ['⚠️ Días Abiertos Excesivos (142d)', '⏰ Requiere Chequeo Reproductivo DG'],
  },
  {
    id: 'cow-08',
    tagId: 'V-08',
    name: 'Mancha V-08',
    breed: 'Gyr Puro',
    birthDate: '2020-08-04',
    physiologicalStatus: 'Escampada/Horra',
    lotName: 'Lote Secado / Maternidad',
    sireName: 'Gaston de Golconda',
    damName: 'Baronesa 02',
    totalCalvings: 4,
    lastCalvingDate: '2025-09-12',
    lastServiceDate: '2025-11-18',
    lastServiceType: 'TE / FIV',
    bullOrSemenUsed: 'Cacique 120 (Brangus)',
    confirmedPregnancyDate: '2025-12-28',
    gestationalDaysAccumulated: 264,
    fppDate: '2026-08-28',
    servicesPerConception: 1,
    epsMonths: 14.8,
    eppMonths: 23.9,
    diasAbiertos: 67,
    iepDays: 362,
    diasEnLeche: 0,
    alerts: ['🚨 Próximo Parto (264d Gestación)', '📋 Preparar Lote Maternidad'],
  },
  {
    id: 'cow-3341',
    tagId: 'BR-3341',
    name: 'Hija de Luna 55',
    breed: 'Brangus 3/8',
    birthDate: '2023-01-20',
    physiologicalStatus: 'Novilla de vientre',
    lotName: 'Lote Novillas Servidas',
    sireName: 'Cacique 120',
    damName: 'Luna 55',
    totalCalvings: 0,
    lastCalvingDate: undefined,
    lastServiceDate: '2026-07-01',
    lastServiceType: 'IA',
    bullOrSemenUsed: 'Don Juan 450 (Brangus)',
    confirmedPregnancyDate: undefined,
    gestationalDaysAccumulated: 0,
    fppDate: undefined,
    servicesPerConception: 1,
    epsMonths: 15.2,
    eppMonths: 0,
    diasAbiertos: 0,
    iepDays: 0,
    diasEnLeche: 0,
    alerts: ['🔍 Pendiente Confirmación DG (39 días post-IA)', '⚠️ Consanguinidad Media con Don Juan 450'],
  },
];

const INITIAL_DONORS: DonorCow[] = [
  {
    id: 'don-504',
    tagId: 'V-504',
    name: 'Esperanza 504',
    breed: 'Gyr x Holstein F1',
    totalOpuCollections: 14,
    totalEmbryosProduced: 58,
    viableEmbryosRate: 82.5,
    status: 'Activa',
    lastOpuDate: '2026-05-10',
    geneticsCategory: 'F1 Superior',
  },
  {
    id: 'don-08',
    tagId: 'V-08',
    name: 'Mancha V-08',
    breed: 'Gyr Puro Lechero',
    totalOpuCollections: 9,
    totalEmbryosProduced: 41,
    viableEmbryosRate: 88.0,
    status: 'En Descanso',
    lastOpuDate: '2026-02-15',
    geneticsCategory: 'Puro Pedigrí',
  },
];

const INITIAL_RECEPTORS: ReceptorCow[] = [
  {
    id: 'rec-102',
    tagId: 'BR-102',
    name: 'Rosita 102',
    breed: 'Brangus Comercial',
    synchronizationStatus: 'Sincronizada',
    lutealBodyQuality: 'CL Grado 1 (Excelente)',
    lastTransferDate: '2026-07-15',
    assignedDonorId: 'V-504',
    pregnancyStatus: 'Pendiente DG',
  },
  {
    id: 'rec-3341',
    tagId: 'BR-3341',
    name: 'Hija de Luna 55',
    breed: 'Brangus 3/8',
    synchronizationStatus: 'Sincronizada',
    lutealBodyQuality: 'CL Grado 2 (Bueno)',
    lastTransferDate: '2026-07-20',
    assignedDonorId: 'V-08',
    pregnancyStatus: 'Gestante',
  },
  {
    id: 'rec-901',
    tagId: 'R-901',
    name: 'Receptora Pampa',
    breed: 'Brahman x Angus',
    synchronizationStatus: 'Pendiente',
    lutealBodyQuality: 'Sin CL',
    pregnancyStatus: 'Vacía',
  },
];

const INITIAL_SEMEN_INVENTORY: SemenInventoryItem[] = [
  {
    id: 'sem-101',
    bullName: 'Don Juan 450 (Brangus)',
    codeOrRegister: 'BR-450-FJ',
    breed: 'Brangus Negro',
    originType: 'Toro Propio Finca',
    supplierOrFarm: 'Hacienda El Triunfo (Propio)',
    availableStraws: 45,
    costPerStrawUsd: 0,
    purityScore: 'A1 Padrote',
  },
  {
    id: 'sem-102',
    bullName: 'Cacique 120 (Select Sires)',
    codeOrRegister: '777BR120',
    breed: 'Brangus 3/8',
    originType: 'Semen Comprado (Termo)',
    supplierOrFarm: 'Select Sires Genetica',
    tankCanister: 'Termo #1 / Canastilla 3',
    availableStraws: 18,
    costPerStrawUsd: 25,
    purityScore: 'Alta Facilidad Parto',
  },
  {
    id: 'sem-103',
    bullName: 'Sansao (Gyr Lechero ABS)',
    codeOrRegister: '200GY088',
    breed: 'Gyr Lechero',
    originType: 'Semen Comprado (Termo)',
    supplierOrFarm: 'ABS Global Colombia',
    tankCanister: 'Termo #1 / Canastilla 1',
    availableStraws: 12,
    costPerStrawUsd: 38,
    purityScore: '+850 kg Leche DEP',
  },
  {
    id: 'sem-104',
    bullName: 'Rey Midas (Brahman Rojo)',
    codeOrRegister: 'RM-009',
    breed: 'Brahman Rojo',
    originType: 'Toro Propio Finca',
    supplierOrFarm: 'Potrero 4 (Padrote Activo)',
    availableStraws: 0,
    purityScore: 'Monta Natural Directa',
  },
];

// Helper to automatically extract if an animal is a Vaca or Novilla
export const getFemaleCategoryAuto = (animal?: {
  totalCalvings?: number;
  physiologicalStatus?: string;
  femaleCategory?: 'Vaca' | 'Novilla';
}): 'Vaca' | 'Novilla' => {
  if (!animal) return 'Novilla';
  if (animal.femaleCategory) return animal.femaleCategory;
  if ((animal.totalCalvings ?? 0) > 0) return 'Vaca';
  const status = (animal.physiologicalStatus || '').toLowerCase();
  if (status.includes('vaca') || status.includes('parida') || status.includes('escampada') || status.includes('horra')) {
    return 'Vaca';
  }
  return 'Novilla';
};

const INITIAL_SYNCHRONIZATIONS: SynchronizationProtocol[] = [
  {
    id: 'sync-1',
    name: 'Protocolo IATF Lote Novillas Agosto',
    technique: 'IATF (Inseminación a Tiempo Fijo)',
    startDate: '2026-08-01',
    deviceWithdrawalDate: '2026-08-08',
    inseminationOrTransferDate: '2026-08-10',
    scheduledPalpationDate: '2026-09-24',
    femaleCount: 3,
    selectedFemaleIds: ['cow-3341', 'rec-102', 'rec-3341'],
    femaleCategoryOverrides: { 'cow-3341': 'Novilla', 'rec-102': 'Vaca' },
    status: 'Inseminado / Transferido',
    hormonalProtocolUsed: 'DIB + Benzoato + Prostaglandina',
  },
  {
    id: 'sync-2',
    name: 'Protocolo TETF Receptoras FIV Septiembre',
    technique: 'TETF (Transferencia a Tiempo Fijo)',
    startDate: '2026-08-05',
    deviceWithdrawalDate: '2026-08-12',
    inseminationOrTransferDate: '2026-08-19',
    scheduledPalpationDate: '2026-10-03',
    femaleCount: 3,
    selectedFemaleIds: ['rec-102', 'rec-3341', 'rec-901'],
    femaleCategoryOverrides: { 'rec-102': 'Vaca', 'rec-3341': 'Novilla', 'rec-901': 'Novilla' },
    status: 'En Proceso',
    hormonalProtocolUsed: 'CIDR + GnRH + PGF2a',
  },
];

const INITIAL_EMBRYOS: EmbryoItem[] = [
  {
    id: 'emb-101',
    code: 'EMB-2026-FIV-01',
    donorId: 'don-504',
    donorName: 'Esperanza 504 (Gyr x Holstein F1)',
    sireName: 'Don Juan 450 (Brangus)',
    fecundationDate: '2026-08-01',
    stage: 'Blastocisto Grado 1',
    status: 'fecundado',
    lotCanister: 'Termo 1 / Canastilla A-3',
    quality: 'Excelente',
    notes: 'Cultivo OPU FIV - Célula fecundada en laboratorio',
  },
  {
    id: 'emb-102',
    code: 'EMB-2026-FIV-02',
    donorId: 'don-08',
    donorName: 'Mancha V-08 (Gyr Puro)',
    sireName: 'Cacique 120 (Brangus)',
    fecundationDate: '2026-07-28',
    stage: 'Blastocisto Expandido',
    status: 'transferido',
    receptorTag: 'BR-102 (Rosita)',
    transferDate: '2026-08-04',
    lotCanister: 'Transferencia en Fresco',
    quality: 'Excelente',
    notes: 'Transferido exitosamente en Receptora BR-102',
  },
  {
    id: 'emb-103',
    code: 'EMB-2026-FIV-03',
    donorId: 'don-504',
    donorName: 'Esperanza 504 (Gyr x Holstein F1)',
    sireName: 'Rey Midas (Brangus)',
    fecundationDate: '2026-07-15',
    stage: 'Blastocisto Grado 1',
    status: 'vitrificado',
    lotCanister: 'Termo Nitrógeno 2 / Canastilla B-1',
    quality: 'Excelente',
    notes: 'Vitrificado DT conservado en nitrógeno líquido',
  },
  {
    id: 'emb-104',
    code: 'EMB-2026-FIV-04',
    donorId: 'don-08',
    donorName: 'Mancha V-08 (Gyr Puro)',
    sireName: 'Don Juan 450 (Brangus)',
    fecundationDate: '2026-08-03',
    stage: 'Blastocisto Grado 2',
    status: 'fecundado',
    lotCanister: 'Termo 1 / Canastilla A-3',
    quality: 'Bueno',
    notes: 'Blastocisto joven recién fecundado',
  },
  {
    id: 'emb-105',
    code: 'EMB-2026-FIV-05',
    donorId: 'don-504',
    donorName: 'Esperanza 504 (Gyr x Holstein F1)',
    sireName: 'Cacique 120 (Brangus)',
    fecundationDate: '2026-07-10',
    stage: 'Blastocisto Grado 1',
    status: 'transferido',
    receptorTag: 'BR-3341 (Hija de Luna)',
    transferDate: '2026-07-18',
    lotCanister: 'Transferencia Directa',
    quality: 'Excelente',
    notes: 'Transferido en receptora BR-3341',
  },
  {
    id: 'emb-106',
    code: 'EMB-2026-FIV-06',
    donorId: 'don-08',
    donorName: 'Mancha V-08 (Gyr Puro)',
    sireName: 'Rey Midas (Brangus)',
    fecundationDate: '2026-08-05',
    stage: 'Mórula',
    status: 'fecundado',
    lotCanister: 'Termo 1 / Canastilla A-1',
    quality: 'Excelente',
    notes: 'Mórula temprana en división celular activa',
  },
];

export const GeneticsView: React.FC<GeneticsViewProps> = ({
  currentBull,
  bullsList,
  onSelectBull,
  reproductiveHistory,
  onOpenEditModal,
  onOpenCertificateModal,
  onOpenBreedingSimulator,
  onOpenNewEventModal,
}) => {
  // Main Sub-Tab State
  const [activeSubTab, setActiveSubTab] = useState<
    'kpis_ia' | 'insemination' | 'embryo_transfer' | 'donors_receptors' | 'bulls_semen' | 'events' | 'females' | 'pedigree'
  >('kpis_ia');

  // Reproductive Dataset States
  const [females, setFemales] = useState<ReproductiveFemale[]>(INITIAL_FEMALES);
  const [donors, setDonors] = useState<DonorCow[]>(INITIAL_DONORS);
  const [receptors, setReceptors] = useState<ReceptorCow[]>(INITIAL_RECEPTORS);
  const [semenInventory, setSemenInventory] = useState<SemenInventoryItem[]>(INITIAL_SEMEN_INVENTORY);
  const [syncProtocols, setSyncProtocols] = useState<SynchronizationProtocol[]>(INITIAL_SYNCHRONIZATIONS);
  const [embryos, setEmbryos] = useState<EmbryoItem[]>(INITIAL_EMBRYOS);

  // Embryo Filter and Modal States
  const [embryoFilterStatus, setEmbryoFilterStatus] = useState<'all' | 'fecundado' | 'transferido' | 'vitrificado'>('all');
  const [showCreateEmbryoModal, setShowCreateEmbryoModal] = useState(false);
  const [selectedEmbryoDetail, setSelectedEmbryoDetail] = useState<EmbryoItem | null>(null);

  // New Embryo Modal Form States
  const [newEmbryoCode, setNewEmbryoCode] = useState('');
  const [newEmbryoDonorId, setNewEmbryoDonorId] = useState('don-504');
  const [newEmbryoSireName, setNewEmbryoSireName] = useState('Don Juan 450 (Brangus)');
  const [newEmbryoFecundationDate, setNewEmbryoFecundationDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEmbryoStage, setNewEmbryoStage] = useState<'Blastocisto Grado 1' | 'Blastocisto Grado 2' | 'Mórula' | 'Blastocisto Expandido'>('Blastocisto Grado 1');
  const [newEmbryoStatus, setNewEmbryoStatus] = useState<'fecundado' | 'transferido' | 'vitrificado'>('fecundado');
  const [newEmbryoReceptorTag, setNewEmbryoReceptorTag] = useState('');
  const [newEmbryoCanister, setNewEmbryoCanister] = useState('Termo 1 / Canastilla A-3');
  const [newEmbryoQuality, setNewEmbryoQuality] = useState<'Excelente' | 'Bueno' | 'Regular'>('Excelente');
  const [newEmbryoNotes, setNewEmbryoNotes] = useState('');

  // Batch Embryo Creation States
  const [showBatchEmbryoModal, setShowBatchEmbryoModal] = useState(false);
  const [batchCount, setBatchCount] = useState<number>(5);
  const [batchPrefix, setBatchPrefix] = useState<string>('EMB-LOTE-A');
  const [batchDonorId, setBatchDonorId] = useState<string>('don-504');
  const [batchSireName, setBatchSireName] = useState<string>('Don Juan 450 (Brangus)');
  const [batchFecundationDate, setBatchFecundationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [batchStage, setBatchStage] = useState<'Blastocisto Grado 1' | 'Blastocisto Grado 2' | 'Mórula' | 'Blastocisto Expandido'>('Blastocisto Grado 1');
  const [batchStatus, setBatchStatus] = useState<'fecundado' | 'transferido' | 'vitrificado'>('fecundado');
  const [batchCanister, setBatchCanister] = useState<string>('Termo 1 / Canastilla A-1');
  const [batchQuality, setBatchQuality] = useState<'Excelente' | 'Bueno' | 'Regular'>('Excelente');
  const [batchAutoAssignReceptors, setBatchAutoAssignReceptors] = useState<boolean>(true);
  const [batchNotes, setBatchNotes] = useState<string>('');

  // Individual Listed Batch Items state & Photo Worksheet Scanning
  const [batchDraftItems, setBatchDraftItems] = useState<Array<{
    id: string;
    code: string;
    strawNumber: string;
    donorId: string;
    donorName: string;
    sireName: string;
    fecundationDate: string;
    stage: 'Blastocisto Grado 1' | 'Blastocisto Grado 2' | 'Mórula' | 'Blastocisto Expandido';
    status: 'fecundado' | 'transferido' | 'vitrificado';
    receptorTag: string;
    lotCanister: string;
    quality: 'Excelente' | 'Bueno' | 'Regular';
    notes: string;
    verifiedInPhysicalStraw: boolean;
  }>>([]);
  const [worksheetPhotoUrl, setWorksheetPhotoUrl] = useState<string | null>(null);
  const [isScanningWorksheet, setIsScanningWorksheet] = useState<boolean>(false);
  const [worksheetScanNotice, setWorksheetScanNotice] = useState<string | null>(null);

  // Field Transfer PDF/Print Report Modal States
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);
  const [reportVeterinarian, setReportVeterinarian] = useState('Dr. Carlos Mendoza (M.V. Zootecnista)');
  const [reportFarmName, setReportFarmName] = useState('Ganadería Bovino Pro - Finca El Paraíso');
  const [reportProtocolName, setReportProtocolName] = useState('Protocolo TETF DIB-GNRH - Trabajo de Campo');
  const [reportFilterStatus, setReportFilterStatus] = useState<'all' | 'transferido' | 'fecundado' | 'vitrificado'>('all');

  // Genetic Line Showcase States
  const [selectedGeneticLineId, setSelectedGeneticLineId] = useState<string>('gyr_lechero');
  const [viewingPrototypePhoto, setViewingPrototypePhoto] = useState<{ url: string; title: string } | null>(null);

  const generateBatchDraftList = (overrideCount?: number) => {
    const matchedDonor = donors.find((d) => d.id === batchDonorId);
    const donorLabel = matchedDonor ? `${matchedDonor.name} (${matchedDonor.breed})` : 'Donadora FIV';
    const count = overrideCount ?? Math.max(1, Math.min(Number(batchCount) || 1, 50));
    const availableReceptors = receptors.filter((r) => r.status === 'sincronizada' || r.status === 'apta');

    const drafts = [];
    for (let i = 1; i <= count; i++) {
      const padNum = i < 10 ? `0${i}` : `${i}`;
      const code = `${batchPrefix.trim() || 'EMB-LOTE'}-${padNum}`;
      const strawNumber = `PAJ-${batchPrefix.trim() || 'FIV'}-${padNum}`;

      let assignedReceptorTag = '';
      if (batchStatus === 'transferido' && batchAutoAssignReceptors) {
        const receptorCandidate = availableReceptors[(i - 1) % (availableReceptors.length || 1)];
        if (receptorCandidate) {
          assignedReceptorTag = `${receptorCandidate.tagId} (${receptorCandidate.name})`;
        }
      }

      drafts.push({
        id: `draft-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        code,
        strawNumber,
        donorId: batchDonorId,
        donorName: donorLabel,
        sireName: batchSireName,
        fecundationDate: batchFecundationDate,
        stage: batchStage,
        status: batchStatus,
        receptorTag: assignedReceptorTag,
        lotCanister: batchCanister,
        quality: batchQuality,
        notes: batchNotes ? `${batchNotes} (Item #${i})` : '',
        verifiedInPhysicalStraw: false,
      });
    }
    setBatchDraftItems(drafts);
  };

  useEffect(() => {
    if (showBatchEmbryoModal && batchDraftItems.length === 0) {
      generateBatchDraftList();
    }
  }, [showBatchEmbryoModal]);

  const handlePhotoWorksheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const photoResult = reader.result as string;
      setWorksheetPhotoUrl(photoResult);
      setIsScanningWorksheet(true);
      setWorksheetScanNotice('🔍 Escaneando la planilla de campo con IA / Reconocimiento de pajillas...');

      setTimeout(() => {
        setIsScanningWorksheet(false);
        setWorksheetScanNotice('✅ Planilla escaneada exitosamente por IA: Se cargaron 5 embriones reconocidos con números de pajilla y receptoras.');

        const mockRecognizedDrafts = [
          {
            id: `draft-scan-1-${Date.now()}`,
            code: 'EMB-2026-FIV-801',
            strawNumber: 'PAJ-801-AMARILLA',
            donorId: 'don-504',
            donorName: 'Esperanza 504 (Gyr x Holstein)',
            sireName: 'Don Juan 450 (Brangus)',
            fecundationDate: new Date().toISOString().split('T')[0],
            stage: 'Blastocisto Grado 1' as const,
            status: 'transferido' as const,
            receptorTag: 'V-504 (Esperanza 504)',
            lotCanister: 'Termo 1 / Canastilla A-1',
            quality: 'Excelente' as const,
            notes: 'Extraído de planilla manuscrita de campo - Pajilla verificada',
            verifiedInPhysicalStraw: true,
          },
          {
            id: `draft-scan-2-${Date.now()}`,
            code: 'EMB-2026-FIV-802',
            strawNumber: 'PAJ-802-AMARILLA',
            donorId: 'don-504',
            donorName: 'Esperanza 504 (Gyr x Holstein)',
            sireName: 'Don Juan 450 (Brangus)',
            fecundationDate: new Date().toISOString().split('T')[0],
            stage: 'Blastocisto Grado 1' as const,
            status: 'transferido' as const,
            receptorTag: 'BR-102 (Rosita 102)',
            lotCanister: 'Termo 1 / Canastilla A-1',
            quality: 'Excelente' as const,
            notes: 'Extraído de planilla manuscrita de campo - Pajilla verificada',
            verifiedInPhysicalStraw: true,
          },
          {
            id: `draft-scan-3-${Date.now()}`,
            code: 'EMB-2026-FIV-803',
            strawNumber: 'PAJ-803-AZUL',
            donorId: 'don-102',
            donorName: 'Rosita 102 (Brangus Negro)',
            sireName: 'Rey Midas 800 (Gyr)',
            fecundationDate: new Date().toISOString().split('T')[0],
            stage: 'Blastocisto Grado 2' as const,
            status: 'vitrificado' as const,
            receptorTag: '',
            lotCanister: 'Termo 2 / Canastilla B-2',
            quality: 'Bueno' as const,
            notes: 'Pajilla conservada en termo criogénico B-2',
            verifiedInPhysicalStraw: true,
          },
          {
            id: `draft-scan-4-${Date.now()}`,
            code: 'EMB-2026-FIV-804',
            strawNumber: 'PAJ-804-ROJA',
            donorId: 'don-102',
            donorName: 'Rosita 102 (Brangus Negro)',
            sireName: 'Rey Midas 800 (Gyr)',
            fecundationDate: new Date().toISOString().split('T')[0],
            stage: 'Mórula' as const,
            status: 'fecundado' as const,
            receptorTag: '',
            lotCanister: 'Termo 1 / Canastilla C-1',
            quality: 'Regular' as const,
            notes: 'Pendiente de confirmación física de color de anillo',
            verifiedInPhysicalStraw: false,
          },
          {
            id: `draft-scan-5-${Date.now()}`,
            code: 'EMB-2026-FIV-805',
            strawNumber: 'PAJ-805-VERDE',
            donorId: 'don-504',
            donorName: 'Esperanza 504 (Gyr x Holstein)',
            sireName: 'Sansao (Gyr Pura Sangre)',
            fecundationDate: new Date().toISOString().split('T')[0],
            stage: 'Blastocisto Expandido' as const,
            status: 'transferido' as const,
            receptorTag: 'V-201 (Mariposa)',
            lotCanister: 'Termo 1 / Canastilla A-3',
            quality: 'Excelente' as const,
            notes: 'Transferido a tiempo fijo en cuerno derecho',
            verifiedInPhysicalStraw: true,
          },
        ];

        setBatchDraftItems(mockRecognizedDrafts);
        setBatchCount(mockRecognizedDrafts.length);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDraftRow = () => {
    const nextIdx = batchDraftItems.length + 1;
    const matchedDonor = donors.find((d) => d.id === batchDonorId);
    const donorLabel = matchedDonor ? `${matchedDonor.name} (${matchedDonor.breed})` : 'Donadora FIV';
    const padNum = nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`;

    setBatchDraftItems([
      ...batchDraftItems,
      {
        id: `draft-${Date.now()}-${nextIdx}`,
        code: `${batchPrefix.trim() || 'EMB-LOTE'}-${padNum}`,
        strawNumber: `PAJ-${batchPrefix.trim() || 'FIV'}-${padNum}`,
        donorId: batchDonorId,
        donorName: donorLabel,
        sireName: batchSireName,
        fecundationDate: batchFecundationDate,
        stage: batchStage,
        status: batchStatus,
        receptorTag: '',
        lotCanister: batchCanister,
        quality: batchQuality,
        notes: '',
        verifiedInPhysicalStraw: false,
      },
    ]);
  };

  const handleDuplicateDraftRow = (index: number) => {
    const itemToDup = batchDraftItems[index];
    if (!itemToDup) return;

    const duped = {
      ...itemToDup,
      id: `draft-dup-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      code: `${itemToDup.code}-CLON`,
      strawNumber: `${itemToDup.strawNumber}-B`,
      verifiedInPhysicalStraw: false,
    };

    const nextList = [...batchDraftItems];
    nextList.splice(index + 1, 0, duped);
    setBatchDraftItems(nextList);
  };

  const handleRemoveDraftRow = (index: number) => {
    setBatchDraftItems(batchDraftItems.filter((_, i) => i !== index));
  };

  const handleUpdateDraftRow = (index: number, field: string, value: any) => {
    const nextList = [...batchDraftItems];
    if (!nextList[index]) return;

    if (field === 'donorId') {
      const matched = donors.find((d) => d.id === value);
      nextList[index] = {
        ...nextList[index],
        donorId: value,
        donorName: matched ? `${matched.name} (${matched.breed})` : 'Donadora FIV',
      };
    } else {
      nextList[index] = {
        ...nextList[index],
        [field]: value,
      };
    }
    setBatchDraftItems(nextList);
  };

  const handleBulkVerifyStraws = (status: boolean) => {
    setBatchDraftItems((prev) =>
      prev.map((item) => ({ ...item, verifiedInPhysicalStraw: status }))
    );
  };

  const handleCreateEmbryo = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedDonor = donors.find((d) => d.id === newEmbryoDonorId);
    const donorLabel = matchedDonor ? `${matchedDonor.name} (${matchedDonor.breed})` : 'Donadora FIV';
    const autoCode = newEmbryoCode.trim() || `EMB-2026-FIV-0${embryos.length + 1}`;

    const newEmbryo: EmbryoItem = {
      id: `emb-${Date.now()}`,
      code: autoCode,
      donorId: newEmbryoDonorId,
      donorName: donorLabel,
      sireName: newEmbryoSireName,
      fecundationDate: newEmbryoFecundationDate,
      stage: newEmbryoStage,
      status: newEmbryoStatus,
      receptorTag: newEmbryoStatus === 'transferido' ? (newEmbryoReceptorTag || 'Receptora Sincronizada') : undefined,
      transferDate: newEmbryoStatus === 'transferido' ? newEmbryoFecundationDate : undefined,
      lotCanister: newEmbryoCanister,
      quality: newEmbryoQuality,
      notes: newEmbryoNotes,
      verifiedInPhysicalStraw: true,
      verificationDate: new Date().toISOString(),
    };

    setEmbryos([newEmbryo, ...embryos]);
    setShowCreateEmbryoModal(false);
    setFormSuccessMessage(`✅ Embrión ${autoCode} creado correctamente. Estado: ${newEmbryoStatus.toUpperCase()}`);
    setTimeout(() => setFormSuccessMessage(null), 5000);

    // Reset fields
    setNewEmbryoCode('');
    setNewEmbryoNotes('');
    setNewEmbryoReceptorTag('');
  };

  const handleSaveBatchEmbryos = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchDraftItems.length === 0) {
      alert('Agregue al menos un embrión al lote antes de guardar.');
      return;
    }

    const createdItems: EmbryoItem[] = batchDraftItems.map((draft, idx) => ({
      id: `emb-batch-${Date.now()}-${idx + 1}`,
      code: draft.code.trim() || `EMB-LOTE-${idx + 1}`,
      donorId: draft.donorId,
      donorName: draft.donorName,
      sireName: draft.sireName,
      fecundationDate: draft.fecundationDate,
      stage: draft.stage,
      status: draft.status,
      receptorTag: draft.status === 'transferido' ? draft.receptorTag : undefined,
      transferDate: draft.status === 'transferido' ? draft.fecundationDate : undefined,
      lotCanister: draft.lotCanister,
      quality: draft.quality,
      notes: draft.notes,
      strawNumber: draft.strawNumber,
      verifiedInPhysicalStraw: draft.verifiedInPhysicalStraw,
      verificationDate: draft.verifiedInPhysicalStraw ? new Date().toISOString() : undefined,
    }));

    setEmbryos([...createdItems, ...embryos]);
    setShowBatchEmbryoModal(false);
    const verifiedCount = createdItems.filter((i) => i.verifiedInPhysicalStraw).length;
    setFormSuccessMessage(`✅ Se han guardado ${createdItems.length} embriones individualizados en el lote. (${verifiedCount} con verificación física de pajilla confirmada)`);
    setTimeout(() => setFormSuccessMessage(null), 5000);
  };

  const handleTogglePhysicalStrawVerification = (embryoId: string) => {
    setEmbryos((prev) =>
      prev.map((e) => {
        if (e.id === embryoId) {
          const nextVal = !e.verifiedInPhysicalStraw;
          return {
            ...e,
            verifiedInPhysicalStraw: nextVal,
            verificationDate: nextVal ? new Date().toISOString() : undefined,
          };
        }
        return e;
      })
    );
  };

  const handleAssignReceptorToEmbryo = (embryoId: string, receptorTag: string) => {
    if (!receptorTag) return;
    setEmbryos((prev) =>
      prev.map((e) => {
        if (e.id === embryoId) {
          return {
            ...e,
            status: 'transferido',
            receptorTag: receptorTag,
            transferDate: new Date().toISOString().split('T')[0],
          };
        }
        return e;
      })
    );
    setFormSuccessMessage(`✅ Receptora '${receptorTag}' asignada correctamente.`);
    setTimeout(() => setFormSuccessMessage(null), 3000);
  };

  const handleUpdateEmbryoStatus = (embryoId: string, targetStatus: 'fecundado' | 'transferido' | 'vitrificado', receptorTag?: string) => {
    setEmbryos((prev) =>
      prev.map((item) => {
        if (item.id === embryoId) {
          return {
            ...item,
            status: targetStatus,
            receptorTag: targetStatus === 'transferido' ? (receptorTag || item.receptorTag || 'BR-102 (Rosita)') : undefined,
            transferDate: targetStatus === 'transferido' ? new Date().toISOString().split('T')[0] : item.transferDate,
          };
        }
        return item;
      })
    );
  };

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Natural Language State
  const [naturalInput, setNaturalInput] = useState('');
  const [nlpAnalysis, setNlpAnalysis] = useState<{
    eventType: string;
    cowTag: string;
    bullId: string;
    date: string;
    time?: string;
    serviceType: ServiceType;
    confidence: number;
    fppDate?: string;
    scheduledDgDate?: string;
    inbreedingRisk?: { riskLevel: 'alto' | 'medio' | 'bajo'; message: string };
    summaryText: string;
  } | null>(null);

  // Direct Event Entry Form State
  const [eventCategory, setEventCategory] = useState<'celo' | 'servicio' | 'palpacion' | 'parto' | 'secado'>('servicio');
  const [selectedFemaleIdForForm, setSelectedFemaleIdForForm] = useState('cow-504');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  // Mode Toggles (Individual vs Batch)
  const [iaMode, setIaMode] = useState<'individual' | 'batch'>('individual');
  const [teMode, setTeMode] = useState<'individual' | 'batch'>('individual');

  // Insemination Detailed Form State
  const [iaBodyCondition, setIaBodyCondition] = useState('3.5 - Óptima / Buena');
  const [iaTechnician, setIaTechnician] = useState('Dr. Carlos Pérez (Inseminador)');
  const [iaProtocol, setIaProtocol] = useState('IATF con Dispositivo DIB + Benzoato');
  const [iaMotherName, setIaMotherName] = useState('Lucero 14 (Holstein)');
  const [iaBatchSelectedIds, setIaBatchSelectedIds] = useState<string[]>(['cow-504', 'cow-102']);

  // Batch IA Per-Cow Options State (Pajilla/Toro, Sexada, Fecha, Estado/CC, Responsable, Observaciones)
  const [globalSexedDefault, setGlobalSexedDefault] = useState<'convencional' | 'sexada_hembra' | 'sexada_macho'>('convencional');
  const [batchIaDetails, setBatchIaDetails] = useState<
    Record<
      string,
      {
        semenId: string;
        isSexed: 'convencional' | 'sexada_hembra' | 'sexada_macho';
        eventDate: string;
        bodyCondition: string;
        technician: string;
        notes: string;
      }
    >
  >({
    'cow-504': {
      semenId: 'sem-101',
      isSexed: 'sexada_hembra',
      eventDate: new Date().toISOString().split('T')[0],
      bodyCondition: '3.5 - Óptima / Buena',
      technician: 'Dr. Carlos Pérez (Inseminador)',
      notes: 'IATF Hora 0 - Celo vigoroso',
    },
    'cow-102': {
      semenId: 'sem-102',
      isSexed: 'convencional',
      eventDate: new Date().toISOString().split('T')[0],
      bodyCondition: '3.0 - Buena / Normal',
      technician: 'Dr. Carlos Pérez (Inseminador)',
      notes: 'Sincronizada con Dispositivo',
    },
  });

  const getBatchRow = (cowId: string) => {
    return (
      batchIaDetails[cowId] || {
        semenId: formBullId,
        isSexed: globalSexedDefault,
        eventDate: eventDate,
        bodyCondition: iaBodyCondition,
        technician: iaTechnician,
        notes: '',
      }
    );
  };

  const updateBatchRow = (
    cowId: string,
    field: 'semenId' | 'isSexed' | 'eventDate' | 'bodyCondition' | 'technician' | 'notes',
    value: string
  ) => {
    const current = getBatchRow(cowId);
    setBatchIaDetails((prev) => ({
      ...prev,
      [cowId]: {
        ...current,
        [field]: value,
      },
    }));
  };

  const applyGlobalDefaultsToAllBatchRows = () => {
    const updated: Record<
      string,
      {
        semenId: string;
        isSexed: 'convencional' | 'sexada_hembra' | 'sexada_macho';
        eventDate: string;
        bodyCondition: string;
        technician: string;
        notes: string;
      }
    > = {};
    iaBatchSelectedIds.forEach((id) => {
      updated[id] = {
        semenId: formBullId,
        isSexed: globalSexedDefault,
        eventDate: eventDate,
        bodyCondition: iaBodyCondition,
        technician: iaTechnician,
        notes: batchIaDetails[id]?.notes || '',
      };
    });
    setBatchIaDetails(updated);
  };

  // Embryo Transfer Detailed Form State
  const [teSelectedReceptorId, setTeSelectedReceptorId] = useState('rec-102');
  const [teSelectedDonorId, setTeSelectedDonorId] = useState('don-504');
  const [teSelectedSemenId, setTeSelectedSemenId] = useState('sem-101');
  const [teFemaleCategory, setTeFemaleCategory] = useState<'Vaca' | 'Novilla'>('Novilla');
  const [teBodyCondition, setTeBodyCondition] = useState('3.5 - Óptima');
  const [teLutealQuality, setTeLutealQuality] = useState<'CL Grado 1 (Excelente)' | 'CL Grado 2 (Bueno)' | 'Sin CL'>('CL Grado 1 (Excelente)');
  const [teTransferDate, setTeTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [teTechnician, setTeTechnician] = useState('Dr. Mario Giraldo (Veterinario TE)');
  const [teBatchSelectedIds, setTeBatchSelectedIds] = useState<string[]>(['rec-102', 'rec-3341', 'rec-901']);

  // Sync Protocol Female Selection State
  const [newSyncSelectedFemaleIds, setNewSyncSelectedFemaleIds] = useState<string[]>(['rec-102', 'rec-3341', 'rec-901']);
  const [newSyncCategoryOverrides, setNewSyncCategoryOverrides] = useState<Record<string, 'Vaca' | 'Novilla'>>({});
  const [syncFemaleSearchQuery, setSyncFemaleSearchQuery] = useState('');

  // Combined inventory females list
  const availableInventoryFemales = useMemo(() => {
    const map = new Map<string, { id: string; tagId: string; name: string; breed: string; autoCategory: 'Vaca' | 'Novilla'; source: string }>();

    receptors.forEach((r) => {
      map.set(r.id, {
        id: r.id,
        tagId: r.tagId,
        name: r.name,
        breed: r.breed,
        autoCategory: r.femaleCategory || getFemaleCategoryAuto(r),
        source: 'Receptora Sincronizada',
      });
    });

    females.forEach((f) => {
      if (!map.has(f.id)) {
        map.set(f.id, {
          id: f.id,
          tagId: f.tagId,
          name: f.name,
          breed: f.breed,
          autoCategory: getFemaleCategoryAuto(f),
          source: f.physiologicalStatus || 'Inventario Hembras',
        });
      }
    });

    return Array.from(map.values());
  }, [receptors, females]);

  // Auto-fill teFemaleCategory when selecting receptor
  useEffect(() => {
    const activeRec = receptors.find((r) => r.id === teSelectedReceptorId) || females.find((f) => f.id === teSelectedReceptorId);
    if (activeRec) {
      setTeFemaleCategory(getFemaleCategoryAuto(activeRec));
    }
  }, [teSelectedReceptorId, receptors, females]);

  // Embryo Origin & Genealogy Line Tracking State (Individual TE)
  const [teEmbryoOriginType, setTeEmbryoOriginType] = useState<'propia' | 'adquirida'>('propia');
  const [teEmbryoOriginFarm, setTeEmbryoOriginFarm] = useState('Ganadería El Triunfo (Genética Propia)');
  const [teMaternalOriginType, setTeMaternalOriginType] = useState<'propia' | 'adquirida'>('propia');
  const [teMaternalFarmName, setTeMaternalFarmName] = useState('Ganadería El Triunfo');
  const [teMaternalLineageInput, setTeMaternalLineageInput] = useState('Abuela: Lucero 14 (Holstein) • Bisabuela: Lucero 02 High-Milk');
  const [tePaternalOriginType, setTePaternalOriginType] = useState<'propio' | 'comprado'>('propio');
  const [tePaternalFarmName, setTePaternalFarmName] = useState('Hacienda El Triunfo');
  const [tePaternalLineageInput, setTePaternalLineageInput] = useState('Abuelo: Rey Midas 808 • Bisabuelo: Midas Grandeur');
  const [teEmbryoLotCode, setTeEmbryoLotCode] = useState('EMB-2026-FIV-09');
  const [teEmbryoType, setTeEmbryoType] = useState('FIV Fresco - Grado 1 (Blastocisto Excelente)');

  // Helper for Crossbreed Analysis & Heterosis Projection
  const calculateCrossbreedAnalysis = (donorBreed: string = '', sireBreed: string = '') => {
    const d = donorBreed.toLowerCase();
    const s = sireBreed.toLowerCase();

    if ((d.includes('gyr') && s.includes('holstein')) || (d.includes('holstein') && s.includes('gyr'))) {
      return {
        crossName: 'F1 Girolando (50% Gyr / 50% Holstein)',
        purpose: 'Lechería Tropical de Alta Producción',
        heterosis: 'Máximo Vigor Híbrido F1 (Tolerancia Térmica + Rendimiento Lácteo)',
        composition: '50% Gyr + 50% Holstein (F1)',
      };
    }
    if ((d.includes('gyr') || d.includes('brahman')) && (s.includes('brangus') || s.includes('angus'))) {
      return {
        crossName: 'Cruce Doble Propósito (Zebuino × Brangus)',
        purpose: 'Producción Carnica de Calidad con Máxima Rusticidad',
        heterosis: 'Alta Resistencia Ectoparásitos + Precocidad en Ganancia de Peso',
        composition: '50% Raza Cebú (Gyr/Brahman) + 50% Brangus/Angus',
      };
    }
    return {
      crossName: `Cruce Dirigido: ${donorBreed || 'Madre Donadora'} × ${sireBreed || 'Padre Semental'}`,
      purpose: 'Mejoramiento Genético de Hato y Adaptación',
      heterosis: 'Complementariedad Racial Directa para la Ganadería',
      composition: `50% ${donorBreed || 'Línea Materna'} + 50% ${sireBreed || 'Línea Paterna'}`,
    };
  };

  // Batch TE Per-Receptor Options State
  const [batchTeDetails, setBatchTeDetails] = useState<
    Record<
      string,
      {
        donorId: string;
        semenId: string;
        femaleCategory?: 'Vaca' | 'Novilla';
        embryoGeneticsOrigin: 'propia' | 'adquirida';
        originFarm: string;
        embryoType: string;
        maternalOrigin: 'propia' | 'adquirida';
        maternalFarm: string;
        maternalLineage: string;
        paternalOrigin: 'propio' | 'comprado';
        paternalFarm: string;
        paternalLineage: string;
        lutealQuality: string;
        transferDate: string;
        bodyCondition: string;
        technician: string;
        notes: string;
      }
    >
  >({
    'rec-102': {
      donorId: 'don-504',
      semenId: 'sem-101',
      femaleCategory: 'Vaca',
      embryoGeneticsOrigin: 'propia',
      originFarm: 'Ganadería El Triunfo (Genética Propia)',
      embryoType: 'FIV Fresco - Grado 1',
      maternalOrigin: 'propia',
      maternalFarm: 'Ganadería El Triunfo',
      maternalLineage: 'Abuela: Lucero 14 (Holstein)',
      paternalOrigin: 'propio',
      paternalFarm: 'Hacienda El Triunfo',
      paternalLineage: 'Abuelo: Rey Midas 808',
      lutealQuality: 'CL Grado 1 (Excelente)',
      transferDate: new Date().toISOString().split('T')[0],
      bodyCondition: '3.5 - Óptima',
      technician: 'Dr. Mario Giraldo (Veterinario TE)',
      notes: 'Transferencia transcervical profunda - Genética Propia',
    },
    'rec-3341': {
      donorId: 'don-08',
      semenId: 'sem-102',
      femaleCategory: 'Novilla',
      embryoGeneticsOrigin: 'adquirida',
      originFarm: 'Hacienda Villa Luz (Adquirida)',
      embryoType: 'FIV Vitrificado (Sexado ♀)',
      maternalOrigin: 'adquirida',
      maternalFarm: 'Hacienda Villa Luz',
      maternalLineage: 'Abuela: Baronesa 02',
      paternalOrigin: 'comprado',
      paternalFarm: 'Central Genética Bovina',
      paternalLineage: 'Abuelo: Cacique Red 04',
      lutealQuality: 'CL Grado 1 (Excelente)',
      transferDate: new Date().toISOString().split('T')[0],
      bodyCondition: '3.0 - Normal',
      technician: 'Dr. Mario Giraldo (Veterinario TE)',
      notes: 'Embrión sexado hembra adquirido de Villa Luz',
    },
  });

  const getBatchTeRow = (recId: string) => {
    const rec = receptors.find((r) => r.id === recId) || females.find((f) => f.id === recId);
    const autoCat = getFemaleCategoryAuto(rec);
    const current = batchTeDetails[recId];

    return (
      current || {
        donorId: teSelectedDonorId,
        semenId: teSelectedSemenId,
        femaleCategory: autoCat,
        embryoGeneticsOrigin: teEmbryoOriginType,
        originFarm: teEmbryoOriginFarm,
        embryoType: 'FIV Fresco - Grado 1',
        maternalOrigin: teMaternalOriginType,
        maternalFarm: teMaternalFarmName,
        maternalLineage: teMaternalLineageInput,
        paternalOrigin: tePaternalOriginType,
        paternalFarm: tePaternalFarmName,
        paternalLineage: tePaternalLineageInput,
        lutealQuality: teLutealQuality,
        transferDate: teTransferDate,
        bodyCondition: teBodyCondition,
        technician: teTechnician,
        notes: '',
      }
    );
  };

  const updateBatchTeRow = (
    recId: string,
    field:
      | 'donorId'
      | 'semenId'
      | 'femaleCategory'
      | 'embryoGeneticsOrigin'
      | 'originFarm'
      | 'embryoType'
      | 'maternalOrigin'
      | 'maternalFarm'
      | 'maternalLineage'
      | 'paternalOrigin'
      | 'paternalFarm'
      | 'paternalLineage'
      | 'lutealQuality'
      | 'transferDate'
      | 'bodyCondition'
      | 'technician'
      | 'notes',
    value: string
  ) => {
    const current = getBatchTeRow(recId);
    setBatchTeDetails((prev) => ({
      ...prev,
      [recId]: {
        ...current,
        [field]: value,
      },
    }));
  };

  // Quick Search inputs for Cow Tag/Number
  const [iaCowTagInput, setIaCowTagInput] = useState('');
  const [teReceptorTagInput, setTeReceptorTagInput] = useState('');

  // Active Cow Auto-Loaded from Inventory for Insemination
  const activeIaCow = useMemo(() => {
    if (iaCowTagInput.trim()) {
      const clean = iaCowTagInput.toLowerCase().trim();
      const match = females.find(
        (f) => f.tagId.toLowerCase().includes(clean) || f.name.toLowerCase().includes(clean) || f.id === clean
      );
      if (match) return match;
    }
    return females.find((f) => f.id === selectedFemaleIdForForm) || females[0];
  }, [females, selectedFemaleIdForForm, iaCowTagInput]);

  // Sync selectedFemaleIdForForm when typing tag
  useEffect(() => {
    if (activeIaCow && activeIaCow.id !== selectedFemaleIdForForm) {
      setSelectedFemaleIdForForm(activeIaCow.id);
    }
  }, [activeIaCow]);

  // Auto-fill mother name and body condition when activeIaCow changes
  useEffect(() => {
    if (activeIaCow) {
      if (activeIaCow.damName || activeIaCow.motherDirect) {
        setIaMotherName(activeIaCow.damName || activeIaCow.motherDirect || '');
      }
      if (activeIaCow.bodyConditionScore) {
        setIaBodyCondition(activeIaCow.bodyConditionScore);
      }
    }
  }, [activeIaCow?.id]);

  // Active Receptor Cow Auto-Loaded from Inventory for Embryo Transfer
  const activeTeReceptor = useMemo(() => {
    if (teReceptorTagInput.trim()) {
      const clean = teReceptorTagInput.toLowerCase().trim();
      const match = receptors.find(
        (r) => r.tagId.toLowerCase().includes(clean) || r.name.toLowerCase().includes(clean) || r.id === clean
      );
      if (match) return match;
    }
    return receptors.find((r) => r.id === teSelectedReceptorId) || receptors[0];
  }, [receptors, teSelectedReceptorId, teReceptorTagInput]);

  useEffect(() => {
    if (activeTeReceptor && activeTeReceptor.id !== teSelectedReceptorId) {
      setTeSelectedReceptorId(activeTeReceptor.id);
    }
  }, [activeTeReceptor]);

  // Active Donor Cow Auto-Loaded from Inventory
  const activeTeDonor = useMemo(() => {
    return donors.find((d) => d.id === teSelectedDonorId) || donors[0];
  }, [donors, teSelectedDonorId]);

  // Event Specific Fields
  const [formServiceType, setFormServiceType] = useState<ServiceType>('IA');
  const [formBullId, setFormBullId] = useState('sem-101');
  const [formTechnician, setFormTechnician] = useState('Dr. Carlos Pérez (Inseminador)');

  const [formDgMethod, setFormDgMethod] = useState<'Palpación' | 'Ecografía'>('Palpación');
  const [formDgResult, setFormDgResult] = useState<PregnancyResult>('Preñada');
  const [formDgDays, setFormDgDays] = useState<number>(45);

  const [formDeliveryType, setFormDeliveryType] = useState<DeliveryType>('Normal');
  const [formCalfSex, setFormCalfSex] = useState<'Macho' | 'Hembra'>('Macho');
  const [formBirthWeight, setFormBirthWeight] = useState<number>(35);

  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Quick Modal Forms State
  const [showAddDonorModal, setShowAddDonorModal] = useState(false);
  const [showAddReceptorModal, setShowAddReceptorModal] = useState(false);
  const [showAddSemenModal, setShowAddSemenModal] = useState(false);
  const [showAddSyncModal, setShowAddSyncModal] = useState(false);

  // New Donor Form
  const [newDonorTag, setNewDonorTag] = useState('');
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorBreed, setNewDonorBreed] = useState('Gyr x Holstein F1');
  const [newDonorCategory, setNewDonorCategory] = useState<'Puro Pedigrí' | 'F1 Superior' | 'Elite Hato'>('F1 Superior');

  // New Receptor Form
  const [newReceptorTag, setNewReceptorTag] = useState('');
  const [newReceptorName, setNewReceptorName] = useState('');
  const [newReceptorBreed, setNewReceptorBreed] = useState('Brangus Comercial');

  // New Semen / Bull Form
  const [newSemenBullName, setNewSemenBullName] = useState('');
  const [newSemenRegister, setNewSemenRegister] = useState('');
  const [newSemenBreed, setNewSemenBreed] = useState('Brangus Negro');
  const [newSemenOrigin, setNewSemenOrigin] = useState<'Toro Propio Finca' | 'Semen Comprado (Termo)'>('Semen Comprado (Termo)');
  const [newSemenSupplier, setNewSemenSupplier] = useState('');
  const [newSemenStraws, setNewSemenStraws] = useState<number>(20);
  const [newSemenTank, setNewSemenTank] = useState('Termo #1 / Canastilla 2');

  // New Sync Protocol Form
  const [newSyncName, setNewSyncName] = useState('');
  const [newSyncTechnique, setNewSyncTechnique] = useState<'IATF (Inseminación a Tiempo Fijo)' | 'TETF (Transferencia a Tiempo Fijo)'>('IATF (Inseminación a Tiempo Fijo)');
  const [newSyncStartDate, setNewSyncStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSyncCount, setNewSyncCount] = useState<number>(10);

  // Herd KPIs Calculation
  const herdKPIs = useMemo(() => {
    const totalFemales = females.length;
    const paridas = females.filter((f) => f.physiologicalStatus === 'Vaca parida').length;
    const horras = females.filter((f) => f.physiologicalStatus === 'Escampada/Horra').length;
    const novillas = females.filter((f) => f.physiologicalStatus === 'Novilla de vientre').length;

    const pregnantFemales = females.filter((f) => f.confirmedPregnancyDate).length;
    const totalServicedFemales = females.filter((f) => f.lastServiceDate).length;

    const tasaConcepcion = totalServicedFemales > 0 ? (pregnantFemales / totalServicedFemales) * 100 : 72.5;
    const tasaPrenez = totalFemales > 0 ? (pregnantFemales / (paridas + horras + novillas)) * 100 : 75.0;

    const avgDA =
      females.filter((f) => f.diasAbiertos > 0).reduce((acc, f) => acc + f.diasAbiertos, 0) /
        (females.filter((f) => f.diasAbiertos > 0).length || 1);

    const avgIEP =
      females.filter((f) => f.iepDays > 0).reduce((acc, f) => acc + f.iepDays, 0) /
        (females.filter((f) => f.iepDays > 0).length || 1);

    const openDaysAlertCount = females.filter((f) => f.diasAbiertos > 90 && !f.confirmedPregnancyDate).length;

    return {
      totalFemales,
      paridas,
      horras,
      novillas,
      tasaConcepcion: Math.round(tasaConcepcion * 10) / 10,
      tasaPrenez: Math.round(tasaPrenez * 10) / 10,
      avgDA: Math.round(avgDA),
      avgIEP: Math.round(avgIEP),
      openDaysAlertCount,
    };
  }, [females]);

  // Handle Natural Language Processor
  const handleProcessNaturalLanguage = (text: string) => {
    if (!text.trim()) return;

    const lower = text.toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    let extractedTag = 'V-504';
    const tagMatch = text.match(/(?:vaca|hembra|novilla|arete)\s*([a-zA-Z0-9\-_]+)/i) || text.match(/\b([0-9]{3,4}|br-[0-9]+|v-[0-9]+)\b/i);
    if (tagMatch) extractedTag = tagMatch[1].toUpperCase();

    let extractedBull = 'Don Juan 450';
    const bullMatch = text.match(/(?:toro|pajuela|semen|padre)\s*([a-zA-Z0-9\-_ ]+)/i);
    if (bullMatch) extractedBull = bullMatch[1].trim();

    let eventType = 'Inseminación Artificial (IA)';
    let serviceType: ServiceType = 'IA';

    if (lower.includes('insemin') || lower.includes('ia') || lower.includes('iatf')) {
      eventType = 'Inseminación Artificial (IA / IATF)';
      serviceType = 'IA';
    } else if (lower.includes('transfer') || lower.includes('te') || lower.includes('fiv') || lower.includes('embri')) {
      eventType = 'Transferencia de Embriones (TE / FIV)';
      serviceType = 'TE / FIV';
    } else if (lower.includes('monta') || lower.includes('toro')) {
      eventType = 'Monta Natural';
      serviceType = 'Monta Natural';
    } else if (lower.includes('palp') || lower.includes('preñ') || lower.includes('ecograf') || lower.includes('dg')) {
      eventType = 'Diagnóstico de Gestación (Palpación)';
      serviceType = 'IA';
    }

    const serviceDateObj = new Date();
    const fppDateObj = new Date(serviceDateObj.getTime() + 283 * 24 * 60 * 60 * 1000);
    const scheduledDgObj = new Date(serviceDateObj.getTime() + 45 * 24 * 60 * 60 * 1000);

    setNlpAnalysis({
      eventType,
      cowTag: extractedTag,
      bullId: extractedBull,
      date: today,
      serviceType,
      confidence: 96,
      fppDate: fppDateObj.toISOString().split('T')[0],
      scheduledDgDate: scheduledDgObj.toISOString().split('T')[0],
      summaryText: `Evento detectado: ${eventType} para ${extractedTag} con Semental ${extractedBull}. Palpación/Ecografía agendada para ${scheduledDgObj.toISOString().split('T')[0]} (45d). Parto probable proyectado: ${fppDateObj.toISOString().split('T')[0]}.`,
    });
  };

  const handleConfirmNlpRecord = () => {
    if (!nlpAnalysis) return;

    const femaleToUpdate = females.find(
      (f) => f.tagId.toLowerCase().includes(nlpAnalysis.cowTag.toLowerCase()) || f.id.includes(nlpAnalysis.cowTag.toLowerCase())
    ) || females[0];

    const updated = females.map((f) => {
      if (f.id === femaleToUpdate.id) {
        return {
          ...f,
          lastServiceDate: nlpAnalysis.date,
          lastServiceType: nlpAnalysis.serviceType,
          bullOrSemenUsed: nlpAnalysis.bullId,
          fppDate: nlpAnalysis.fppDate,
          alerts: [`${nlpAnalysis.eventType} registrada`, `DG agendado para ${nlpAnalysis.scheduledDgDate}`],
        };
      }
      return f;
    });

    setFemales(updated);
    setFormSuccessMessage(`✅ Registro ingresado con éxito mediante IA para la hembra ${femaleToUpdate.tagId} (${femaleToUpdate.name}).`);
    setNaturalInput('');
    setNlpAnalysis(null);
    setTimeout(() => setFormSuccessMessage(null), 5000);
  };

  // Submit Add Donor
  const handleAddDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorTag) return;

    const donor: DonorCow = {
      id: `don-${Date.now()}`,
      tagId: newDonorTag.toUpperCase(),
      name: newDonorName || `Donadora ${newDonorTag}`,
      breed: newDonorBreed,
      totalOpuCollections: 0,
      totalEmbryosProduced: 0,
      viableEmbryosRate: 0,
      status: 'Activa',
      geneticsCategory: newDonorCategory,
    };

    setDonors([donor, ...donors]);
    setShowAddDonorModal(false);
    setNewDonorTag('');
    setNewDonorName('');
    setFormSuccessMessage(`✅ Nueva Vaca Donadora (${donor.tagId}) declarada y agregada al catálogo genético.`);
    setTimeout(() => setFormSuccessMessage(null), 4000);
  };

  // Submit Add Receptor
  const handleAddReceptor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceptorTag) return;

    const receptor: ReceptorCow = {
      id: `rec-${Date.now()}`,
      tagId: newReceptorTag.toUpperCase(),
      name: newReceptorName || `Receptora ${newReceptorTag}`,
      breed: newReceptorBreed,
      synchronizationStatus: 'Sincronizada',
      lutealBodyQuality: 'CL Grado 1 (Excelente)',
      pregnancyStatus: 'Pendiente DG',
    };

    setReceptors([receptor, ...receptors]);
    setShowAddReceptorModal(false);
    setNewReceptorTag('');
    setNewReceptorName('');
    setFormSuccessMessage(`✅ Nueva Vaca Receptora (${receptor.tagId}) agregada al programa de sincronización.`);
    setTimeout(() => setFormSuccessMessage(null), 4000);
  };

  // Submit Add Semen / Bull
  const handleAddSemen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemenBullName) return;

    const semen: SemenInventoryItem = {
      id: `sem-${Date.now()}`,
      bullName: newSemenBullName,
      codeOrRegister: newSemenRegister || 'REG-999',
      breed: newSemenBreed,
      originType: newSemenOrigin,
      supplierOrFarm: newSemenSupplier || (newSemenOrigin === 'Toro Propio Finca' ? 'Propio Finca' : 'Proveedor Externo'),
      availableStraws: newSemenOrigin === 'Toro Propio Finca' ? 0 : newSemenStraws,
      tankCanister: newSemenTank,
      purityScore: newSemenOrigin === 'Toro Propio Finca' ? 'Padrote Finca' : 'Pajuela Comercial',
    };

    setSemenInventory([semen, ...semenInventory]);
    setShowAddSemenModal(false);
    setNewSemenBullName('');
    setFormSuccessMessage(`✅ Semental / Pajuelas (${semen.bullName}) registradas en el inventario reproductivo.`);
    setTimeout(() => setFormSuccessMessage(null), 4000);
  };

  // Submit Add Sync Protocol
  const handleAddSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSyncName) return;

    const start = new Date(newSyncStartDate);
    const withdrawal = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const service = new Date(start.getTime() + 9 * 24 * 60 * 60 * 1000);
    const palpation = new Date(start.getTime() + 45 * 24 * 60 * 60 * 1000);

    const protocol: SynchronizationProtocol = {
      id: `sync-${Date.now()}`,
      name: newSyncName,
      technique: newSyncTechnique,
      startDate: newSyncStartDate,
      deviceWithdrawalDate: withdrawal.toISOString().split('T')[0],
      inseminationOrTransferDate: service.toISOString().split('T')[0],
      scheduledPalpationDate: palpation.toISOString().split('T')[0],
      femaleCount: newSyncCount,
      status: 'En Proceso',
      hormonalProtocolUsed: 'DIB + Benzoato + Prostaglandina',
    };

    setSyncProtocols([protocol, ...syncProtocols]);
    setShowAddSyncModal(false);
    setNewSyncName('');
    setFormSuccessMessage(`✅ Nuevo Protocolo de Sincronización (${protocol.name}) agendado.`);
    setTimeout(() => setFormSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-16">
      {/* Top Banner & Main Sub-tab Header */}
      <div className="bg-[#012d1d] text-white rounded-3xl p-5 md:p-6 shadow-xl border-2 border-[#1b4332] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Dna className="w-80 h-80 text-[#ffba38]" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#ffba38] text-[#523700] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Módulo Reproductivo & Genética Integral
              </span>
              <span className="bg-[#1b4332] text-[#c1ecd4] font-mono text-[10px] px-2 py-0.5 rounded border border-[#c1ecd4]/20">
                GANADERIA PRO v4.5
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Reproducción, Inseminación, TE & Genética
            </h1>
            <p className="text-xs text-[#c1ecd4]/80 max-w-2xl">
              Control completo de Inseminación Artificial (IATF), Transferencia de Embriones (TE/FIV), Vacas Donadoras & Receptoras,
              Inventario de Pajuelas (Toro Propio vs Semen Comprado) y Fechas Clave (Sincronización, Servicio, DG, Parto).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenBreedingSimulator}
              className="bg-[#1b4332] hover:bg-[#123627] text-white border border-[#c1ecd4]/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Zap className="w-4 h-4 text-[#ffba38]" />
              Simulador Cruzamientos
            </button>
            <button
              onClick={onOpenNewEventModal}
              className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Nuevo Evento
            </button>
          </div>
        </div>

        {/* Navigation Bar for All Sub-Modules */}
        <div className="flex items-center gap-1 mt-6 pt-4 border-t border-[#1b4332]/80 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveSubTab('kpis_ia')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'kpis_ia'
                ? 'bg-[#ffba38] text-[#012d1d] shadow-md scale-[1.02]'
                : 'bg-[#002216]/60 text-[#c1ecd4] hover:bg-[#1b4332] hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            Asistente IA & KPIs
          </button>

          <button
            onClick={() => setActiveSubTab('insemination')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'insemination'
                ? 'bg-[#ffba38] text-[#012d1d] shadow-md scale-[1.02]'
                : 'bg-[#002216]/60 text-[#c1ecd4] hover:bg-[#1b4332] hover:text-white'
            }`}
          >
            <Syringe className="w-4 h-4" />
            Módulo Inseminación (IA / IATF)
          </button>

          <button
            onClick={() => setActiveSubTab('embryo_transfer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'embryo_transfer'
                ? 'bg-[#ffba38] text-[#012d1d] shadow-md scale-[1.02]'
                : 'bg-[#002216]/60 text-[#c1ecd4] hover:bg-[#1b4332] hover:text-white'
            }`}
          >
            <Microscope className="w-4 h-4" />
            Transferencia Embriones (TE / FIV)
          </button>

          <button
            onClick={() => setActiveSubTab('donors_receptors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'donors_receptors'
                ? 'bg-[#ffba38] text-[#012d1d] shadow-md scale-[1.02]'
                : 'bg-[#002216]/60 text-[#c1ecd4] hover:bg-[#1b4332] hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Donadoras & Receptoras
          </button>

          <button
            onClick={() => setActiveSubTab('bulls_semen')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'bulls_semen'
                ? 'bg-[#ffba38] text-[#012d1d] shadow-md scale-[1.02]'
                : 'bg-[#002216]/60 text-[#c1ecd4] hover:bg-[#1b4332] hover:text-white'
            }`}
          >
            <Container className="w-4 h-4" />
            Toros Propios vs Termo Pajuelas
          </button>

          <button
            onClick={() => setActiveSubTab('females')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'females'
                ? 'bg-[#ffba38] text-[#012d1d] shadow-md scale-[1.02]'
                : 'bg-[#002216]/60 text-[#c1ecd4] hover:bg-[#1b4332] hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Ficha Hembras ({females.length})
          </button>

          <button
            onClick={() => setActiveSubTab('pedigree')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'pedigree'
                ? 'bg-[#ffba38] text-[#012d1d] shadow-md scale-[1.02]'
                : 'bg-[#002216]/60 text-[#c1ecd4] hover:bg-[#1b4332] hover:text-white'
            }`}
          >
            <GitFork className="w-4 h-4" />
            Pedigrí & Sementales
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
      {formSuccessMessage && (
        <div className="p-4 bg-[#c1ecd4] border-2 border-[#012d1d] text-[#002114] rounded-2xl flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#012d1d] shrink-0" />
            <p className="text-xs font-extrabold">{formSuccessMessage}</p>
          </div>
          <button onClick={() => setFormSuccessMessage(null)} className="text-[#012d1d] hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 1: ASISTENTE IA & KPIS GENERALES REPRODUCTIVOS                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'kpis_ia' && (
        <div className="space-y-6">
          {/* ------------------------------------------------------------------------- */}
          {/* PRIMER CUADRO: MÓDULO INFORMATIVO DE LÍNEAS GENÉTICAS, MORFOLOGÍA Y EFICIENCIA */}
          {/* ------------------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-5 md:p-6 border-2 border-[#012d1d] card-shadow space-y-5 animate-in fade-in">
            {/* Module Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#e2e2e2] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center shrink-0 shadow-md">
                  <Dna className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base md:text-lg font-black text-[#012d1d]">
                      Líneas Genéticas, Morfología y Eficiencia Reproductiva
                    </h3>
                    <span className="bg-[#ffba38] text-[#523700] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                      {GENETIC_LINES_CATALOG.length} Razas / Líneas Prototipo
                    </span>
                  </div>
                  <p className="text-xs text-[#717973]">
                    Catálogo informativo de estándares fenotípicos, fotografías prototipos raciales, atributos morfológicos e indicadores de rendimiento reproductivo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#012d1d] bg-[#f4fbf7] border border-[#a2cfb8] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                  <Award className="w-4 h-4 text-emerald-700" />
                  Hato Multirracial Adaptado
                </span>
              </div>
            </div>

            {/* Breed / Line Tabs Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {GENETIC_LINES_CATALOG.map((line) => {
                const isSelected = selectedGeneticLineId === line.id;
                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => setSelectedGeneticLineId(line.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#012d1d] text-[#ffba38] border-[#012d1d] shadow-md scale-[1.01]'
                        : 'bg-[#f8f9f8] text-[#555] border-[#c1c8c2] hover:bg-slate-100 hover:text-black'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ffba38]' : 'text-[#717973]'}`} />
                    <span>{line.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Line Detail Card Display */}
            {(() => {
              const activeLine = GENETIC_LINES_CATALOG.find((l) => l.id === selectedGeneticLineId) || GENETIC_LINES_CATALOG[0];
              return (
                <div className="bg-[#f8fbf9] border-2 border-[#1b4332]/20 rounded-2xl p-4 sm:p-5 space-y-5">
                  {/* Top Info Banner & Photo Header */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Left Column: Photo Prototype Box */}
                    <div className="lg:col-span-5 relative group bg-black/10 rounded-2xl overflow-hidden border-2 border-[#012d1d]/30 min-h-[270px] flex flex-col justify-between p-3.5 shadow-inner">
                      <img
                        src={activeLine.photoUrl}
                        alt={activeLine.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = activeLine.fallbackPhotoUrl || 'https://images.unsplash.com/photo-1596733430284-f74377611354?auto=format&fit=crop&w=1000&q=80';
                        }}
                      />
                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                      {/* Top Badges */}
                      <div className="relative z-10 flex justify-between items-start gap-2">
                        <span className="bg-[#012d1d]/90 backdrop-blur-md text-[#ffba38] font-mono text-[10px] font-black px-2.5 py-1 rounded-xl border border-[#ffba38]/30 shadow-md">
                          PROTOTIPO REAL DE RAZA
                        </span>

                        <button
                          type="button"
                          onClick={() => setViewingPrototypePhoto({ url: activeLine.photoUrl, title: activeLine.name })}
                          className="bg-white/95 hover:bg-white text-[#012d1d] p-2 rounded-xl text-xs font-black flex items-center gap-1 shadow-md cursor-pointer backdrop-blur-sm transition-all"
                          title="Ampliar Fotografía Prototipo"
                        >
                          <Camera className="w-4 h-4 text-[#012d1d]" />
                          <span className="text-[10px] hidden sm:inline">Ver Foto Full</span>
                        </button>
                      </div>

                      {/* Bottom Caption Overlay */}
                      <div className="relative z-10 space-y-1 text-white">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#c1ecd4] tracking-wider block">
                          {activeLine.origin}
                        </span>
                        <h4 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                          {activeLine.name}
                        </h4>
                        <p className="text-xs text-slate-200 font-medium line-clamp-2">
                          {activeLine.subtitle}
                        </p>
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-white/20">
                          <span className="text-[10px] font-extrabold bg-[#ffba38] text-[#523700] px-2.5 py-0.5 rounded-lg shadow-2xs">
                            Aptitud: {activeLine.aptitude}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-lg backdrop-blur-xs">
                            {activeLine.inventoryCountEstimate} Animales en Hato
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Morphological Features & Pureness Badges */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#c1c8c2] pb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#012d1d]" />
                            <h5 className="font-black text-xs md:text-sm text-[#012d1d] uppercase tracking-wider">
                              Características Morfológicas & Estándar Fenotípico
                            </h5>
                          </div>
                          <span className="text-[10px] font-mono font-black bg-[#e8f5ec] text-[#012d1d] px-2.5 py-0.5 rounded border border-[#c1ecd4]">
                            {activeLine.heterosisGrade}
                          </span>
                        </div>

                        {/* Morphology Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          {/* 1. Head Profile */}
                          <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 shadow-2xs">
                            <span className="font-extrabold text-[#012d1d] text-[11px] flex items-center gap-1.5">
                              <Dna className="w-3.5 h-3.5 text-amber-700" /> Cabeza, Perfil & Orejas
                            </span>
                            <p className="text-[11px] text-[#555] leading-relaxed">
                              {activeLine.morphology.headProfile}
                            </p>
                          </div>

                          {/* 2. Body Conformation */}
                          <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 shadow-2xs">
                            <span className="font-extrabold text-[#012d1d] text-[11px] flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Conformación & Capacidad Torácica
                            </span>
                            <p className="text-[11px] text-[#555] leading-relaxed">
                              {activeLine.morphology.bodyConformation}
                            </p>
                          </div>

                          {/* 3. Udder Structure */}
                          <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 shadow-2xs">
                            <span className="font-extrabold text-[#012d1d] text-[11px] flex items-center gap-1.5">
                              <Heart className="w-3.5 h-3.5 text-pink-700" /> Sistema Mamario & Ubre
                            </span>
                            <p className="text-[11px] text-[#555] leading-relaxed">
                              {activeLine.morphology.udderStructure}
                            </p>
                          </div>

                          {/* 4. Thermal & Skin Adaptation */}
                          <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 shadow-2xs">
                            <span className="font-extrabold text-[#012d1d] text-[11px] flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-blue-700" /> Adaptación Térmica & Piel
                            </span>
                            <p className="text-[11px] text-[#555] leading-relaxed">
                              {activeLine.morphology.adaptationTraits}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bone & Feet Note */}
                      <div className="p-2.5 bg-[#f4fbf7] border border-[#a2cfb8] rounded-xl text-[11px] font-medium text-[#012d1d] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          <strong>Aplomos & Estructura Ósea:</strong> {activeLine.morphology.boneAndFeet}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section: Reproductive & Productive Efficiency KPIs Dashboard */}
                  <div className="space-y-3 pt-2 border-t border-[#c1c8c2]">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-xs md:text-sm text-[#012d1d] uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                        Indicadores de Eficiencia Reproductiva y Productividad
                      </h5>
                      <span className="text-[10px] text-[#717973] font-mono">
                        Registros históricos de rendimiento de la ganadería
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                      {/* EPP */}
                      <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-[#79564b] uppercase block">
                          Edad 1er Parto (EPP)
                        </span>
                        <span className="font-mono text-base font-black text-[#012d1d] block">
                          {activeLine.reproductiveEfficiency.epp}
                        </span>
                        <span className="text-[9.5px] text-[#717973] block">Precocidad Sexual</span>
                      </div>

                      {/* IEP */}
                      <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-[#79564b] uppercase block">
                          Intervalo Partos (IEP)
                        </span>
                        <span className="font-mono text-base font-black text-[#012d1d] block">
                          {activeLine.reproductiveEfficiency.iep}
                        </span>
                        <span className="text-[9.5px] text-[#717973] block">Eficiencia Anual</span>
                      </div>

                      {/* Conception Rate */}
                      <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-[#79564b] uppercase block">
                          Tasa Concepción 1er Serv.
                        </span>
                        <span className="font-mono text-base font-black text-emerald-800 block">
                          {activeLine.reproductiveEfficiency.conceptionRate}
                        </span>
                        <span className="text-[9.5px] text-[#717973] block">Fertilidad IA/IATF</span>
                      </div>

                      {/* Daily Yield / Weight */}
                      <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-[#79564b] uppercase block">
                          Producción / Destete
                        </span>
                        <span className="font-mono text-xs font-black text-[#012d1d] block leading-snug">
                          {activeLine.reproductiveEfficiency.dailyYieldOrWeight}
                        </span>
                        <span className="text-[9.5px] text-[#717973] block">Rendimiento Finca</span>
                      </div>

                      {/* OPU/TE Viability */}
                      <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-[#79564b] uppercase block">
                          Respuesta OPU / TE
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-800 block leading-snug">
                          {activeLine.reproductiveEfficiency.opuOrTeViability}
                        </span>
                        <span className="text-[9.5px] text-[#717973] block">Biotecnología FIV</span>
                      </div>

                      {/* Useful Life */}
                      <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] space-y-1 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-[#79564b] uppercase block">
                          Vida Útil
                        </span>
                        <span className="font-mono text-base font-black text-[#012d1d] block">
                          {activeLine.reproductiveEfficiency.usefulLife}
                        </span>
                        <span className="text-[9.5px] text-[#717973] block">Longevidad Hato</span>
                      </div>
                    </div>

                    {/* Coupling Strategy Footer */}
                    <div className="p-3.5 bg-gradient-to-r from-[#012d1d] to-[#1b4332] text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-[#ffba38]/30">
                      <div className="flex items-center gap-2.5">
                        <GitFork className="w-5 h-5 text-[#ffba38] shrink-0" />
                        <div>
                          <span className="text-[10px] font-mono font-bold text-[#ffba38] uppercase block">
                            Estrategia de Acoplamiento y Selección Reproductiva
                          </span>
                          <p className="text-xs font-medium text-slate-100">
                            {activeLine.couplingStrategy}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubTab('pedigree');
                        }}
                        className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-sm"
                      >
                        <span>Ver Sementales Pedigrí</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Top Herd KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-[#c1c8c2] card-shadow space-y-1">
              <span className="text-[10px] font-extrabold text-[#79564b] uppercase tracking-wider block">
                Tasa de Preñez
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#012d1d] font-mono">{herdKPIs.tasaPrenez}%</span>
                <span className="text-[9px] font-bold bg-[#c1ecd4] text-[#002114] px-1.5 py-0.5 rounded">
                  Óptimo
                </span>
              </div>
              <p className="text-[10px] text-[#717973]">Hato preñado active</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#c1c8c2] card-shadow space-y-1">
              <span className="text-[10px] font-extrabold text-[#79564b] uppercase tracking-wider block">
                Tasa Concepción
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#012d1d] font-mono">{herdKPIs.tasaConcepcion}%</span>
                <span className="text-[9px] font-bold bg-[#c1ecd4] text-[#002114] px-1.5 py-0.5 rounded">
                  IA / TE
                </span>
              </div>
              <p className="text-[10px] text-[#717973]">1er servicio efectivo</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#c1c8c2] card-shadow space-y-1">
              <span className="text-[10px] font-extrabold text-[#79564b] uppercase tracking-wider block">
                Días Abiertos (DA)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#012d1d] font-mono">{herdKPIs.avgDA}d</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${herdKPIs.avgDA > 90 ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#c1ecd4] text-[#002114]'}`}>
                  Meta &lt;90d
                </span>
              </div>
              <p className="text-[10px] text-[#717973]">Parto a concepción</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#c1c8c2] card-shadow space-y-1">
              <span className="text-[10px] font-extrabold text-[#79564b] uppercase tracking-wider block">
                Intervalo Partos
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#012d1d] font-mono">{herdKPIs.avgIEP}d</span>
                <span className="text-[9px] font-bold bg-[#e8f5ec] text-[#012d1d] px-1.5 py-0.5 rounded">
                  12.4 Meses
                </span>
              </div>
              <p className="text-[10px] text-[#717973]">Proyección IEP</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#c1c8c2] card-shadow space-y-1">
              <span className="text-[10px] font-extrabold text-[#79564b] uppercase tracking-wider block">
                Donadoras Activas
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#012d1d] font-mono">{donors.length}</span>
                <span className="text-[9px] font-bold bg-[#c1ecd4] text-[#002114] px-1.5 py-0.5 rounded">
                  FIV / OPU
                </span>
              </div>
              <p className="text-[10px] text-[#717973]">Vacas donadoras</p>
            </div>

            <div className="p-4 bg-[#ffba38]/15 rounded-2xl border-2 border-[#ffba38] card-shadow space-y-1">
              <span className="text-[10px] font-extrabold text-[#523700] uppercase tracking-wider block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#b27b00]" /> Días Abiertos &gt;90d
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#523700] font-mono">
                  {herdKPIs.openDaysAlertCount}
                </span>
                <span className="text-[9px] font-extrabold bg-[#ffba38] text-[#523700] px-1.5 py-0.5 rounded">
                  Alertas
                </span>
              </div>
              <p className="text-[10px] text-[#523700]">Revisión veterinaria</p>
            </div>
          </div>

          {/* AI Language Assistant */}
          <div className="bg-gradient-to-br from-white to-[#f4fbf7] rounded-3xl border-2 border-[#1b4332]/30 card-shadow p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c1c8c2] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-[#012d1d]">
                    Procesador Reproductivo en Lenguaje Natural (IA GanaderIA)
                  </h3>
                  <p className="text-xs text-[#717973]">
                    Ingresa en texto libre: &quot;Hoy inseminé a la vaca 504 con la pajuela Cacique 120, se le aplicó protocolo IATF&quot;.
                  </p>
                </div>
              </div>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-[#c1ecd4] text-[#002114] px-2.5 py-1 rounded-full border border-[#012d1d]/20">
                <Sparkles className="w-3 h-3 text-[#012d1d]" /> IA ACTIVADA
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProcessNaturalLanguage(naturalInput);
                }}
                placeholder="Ej: Transferimos hoy embrión FIV de Donadora V-504 a la receptora Rosita 102..."
                className="flex-1 bg-white border-2 border-[#c1c8c2] focus:border-[#012d1d] rounded-2xl px-4 py-3 text-xs md:text-sm text-[#012d1d] font-medium placeholder:text-[#a0a5a2] shadow-inner outline-none"
              />
              <button
                type="button"
                onClick={() => handleProcessNaturalLanguage(naturalInput)}
                className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md active:scale-95"
              >
                <Send className="w-4 h-4 text-[#ffba38]" />
                Procesar e Interpretar
              </button>
            </div>

            {nlpAnalysis && (
              <div className="p-5 bg-white border-2 border-[#012d1d] rounded-2xl space-y-4 shadow-lg animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h4 className="text-sm font-black text-[#012d1d]">
                        Evento Extraído ({nlpAnalysis.confidence}% Precisión)
                      </h4>
                      <p className="text-xs text-[#717973]">{nlpAnalysis.summaryText}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#ffba38] text-[#523700] px-2.5 py-1 rounded">
                    {nlpAnalysis.eventType}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-[#f8f9f8] rounded-xl border border-[#e2e2e2]">
                    <span className="text-[10px] text-[#79564b] font-bold block uppercase">Hembra</span>
                    <span className="font-mono font-black text-[#012d1d]">{nlpAnalysis.cowTag}</span>
                  </div>
                  <div className="p-2.5 bg-[#f8f9f8] rounded-xl border border-[#e2e2e2]">
                    <span className="text-[10px] text-[#79564b] font-bold block uppercase">Semental / Pajuela</span>
                    <span className="font-mono font-bold text-[#012d1d]">{nlpAnalysis.bullId}</span>
                  </div>
                  <div className="p-2.5 bg-[#f8f9f8] rounded-xl border border-[#e2e2e2]">
                    <span className="text-[10px] text-[#79564b] font-bold block uppercase">Agendamiento Palpación</span>
                    <span className="font-mono font-bold text-emerald-800">{nlpAnalysis.scheduledDgDate}</span>
                  </div>
                  <div className="p-2.5 bg-[#f8f9f8] rounded-xl border border-[#e2e2e2]">
                    <span className="text-[10px] text-[#79564b] font-bold block uppercase">Parto Proyectado (FPP)</span>
                    <span className="font-mono font-bold text-[#012d1d]">{nlpAnalysis.fppDate}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNlpAnalysis(null)}
                    className="px-4 py-2 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl text-xs"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmNlpRecord}
                    className="px-5 py-2 bg-[#012d1d] hover:bg-[#1b4332] text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                    Confirmar Registro
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 2: MÓDULO INSEMINACIÓN ARTIFICIAL (IA / IATF)                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'insemination' && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="bg-white rounded-3xl p-5 border border-[#c1c8c2] card-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center shrink-0 shadow-md">
                <Syringe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#012d1d]">
                  Módulo de Inseminación Artificial (IA & IATF)
                </h3>
                <p className="text-xs text-[#717973]">
                  Registro individual y masivo por Lote, sincronización IATF, trazabilidad de Padre/Madre y cálculo automático de FPP & DG.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddSyncModal(true)}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#ffba38]" />
              Crear Sincronización IATF
            </button>
          </div>

          {/* Active Synchronization Protocols Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-[#012d1d] uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#1b4332]" />
                Protocolos de Sincronización IATF Activos
              </h4>
              <span className="text-xs text-[#717973] font-mono font-bold">
                {syncProtocols.length} Lotes en Programa
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syncProtocols.map((sync) => (
                <div key={sync.id} className="p-5 bg-white rounded-2xl border-2 border-[#1b4332]/20 card-shadow space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase bg-[#e8f5ec] text-[#012d1d] px-2 py-0.5 rounded border border-[#c1ecd4]">
                        {sync.technique}
                      </span>
                      <h5 className="text-base font-black text-[#012d1d] mt-1">{sync.name}</h5>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ffba38] text-[#523700]">
                      {sync.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#f8f9f8] p-3 rounded-xl border border-[#e2e2e2]">
                    <div>
                      <span className="text-[10px] text-[#79564b] block font-extrabold">FECHA INICIO HORMONAS</span>
                      <span className="font-bold text-[#012d1d]">{sync.startDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#79564b] block font-extrabold">RETIRO DISPOSITIVO (DIB)</span>
                      <span className="font-bold text-[#012d1d]">{sync.deviceWithdrawalDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#79564b] block font-extrabold">INSEMINACIÓN IATF</span>
                      <span className="font-black text-emerald-800">{sync.inseminationOrTransferDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#79564b] block font-extrabold">CHEQUEO PALPACIÓN (45d)</span>
                      <span className="font-black text-[#012d1d]">{sync.scheduledPalpationDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#717973] font-medium">
                      Protocolo: <strong className="text-[#012d1d]">{sync.hormonalProtocolUsed}</strong>
                    </span>
                    <span className="font-mono font-black bg-[#012d1d] text-[#c1ecd4] px-2.5 py-0.5 rounded text-[11px]">
                      {sync.femaleCount} Hembras
                    </span>
                  </div>

                  {/* Assigned inventory females badges */}
                  <div className="pt-2 border-t border-[#e2e2e2] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-[#012d1d] uppercase tracking-wider">
                        Hembras del Inventario Asignadas
                      </span>
                      <span className="text-[10px] text-[#717973]">Categorías Extraídas</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar">
                      {(sync.selectedFemaleIds && sync.selectedFemaleIds.length > 0
                        ? sync.selectedFemaleIds
                        : ['rec-102', 'rec-3341', 'rec-901']
                      ).map((fid) => {
                        const animal = availableInventoryFemales.find((a) => a.id === fid);
                        const category = sync.femaleCategoryOverrides?.[fid] || (animal ? animal.autoCategory : 'Novilla');
                        return (
                          <span
                            key={fid}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-[#f4fbf7] border border-[#c1c8c2] text-[#012d1d]"
                          >
                            <span>{animal?.tagId || fid}</span>
                            <span
                              className={`px-1 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                                category === 'Vaca' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                              }`}
                            >
                              {category}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REGISTRATION FORM FOR INSEMINATION (TOGGLE: INDIVIDUAL VS BATCH) */}
          <div className="p-5 md:p-6 bg-white rounded-3xl border-2 border-[#1b4332]/30 card-shadow space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#e2e2e2] pb-4">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-[#ffba38]" />
                <h4 className="text-base font-black text-[#012d1d]">
                  Registro de Inseminación Artificial (IA / IATF)
                </h4>
              </div>

              {/* Mode Toggle Switch */}
              <div className="bg-[#f8f9f8] p-1 rounded-2xl border border-[#c1c8c2] flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIaMode('individual')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    iaMode === 'individual'
                      ? 'bg-[#012d1d] text-white shadow-sm'
                      : 'text-[#555] hover:text-black'
                  }`}
                >
                  📌 Registro Individual (Vaca x Vaca)
                </button>
                <button
                  type="button"
                  onClick={() => setIaMode('batch')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    iaMode === 'batch'
                      ? 'bg-[#ffba38] text-[#523700] shadow-sm'
                      : 'text-[#555] hover:text-black'
                  }`}
                >
                  📦 Registro por Lote (Masivo)
                </button>
              </div>
            </div>

            {/* INDIVIDUAL INSEMINATION FORM */}
            {iaMode === 'individual' && (
              <div className="space-y-5">
                {/* Animal Search & Quick Selection Header */}
                <div className="p-4 bg-[#f4fbf7] border-2 border-[#1b4332]/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-[#012d1d]" />
                      <label className="font-extrabold text-[#012d1d] text-xs uppercase tracking-wider">
                        1. Seleccionar o Digitar Número de Vaca / Arete
                      </label>
                    </div>
                    <span className="text-[10px] font-bold bg-[#c1ecd4] text-[#002114] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Database className="w-3 h-3" /> Carga Automática de Inventario Activa
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#555] mb-1">
                        Buscar / Ingresar Número o Arete de la Vaca
                      </label>
                      <div className="relative">
                        <Tag className="w-4 h-4 text-[#717973] absolute left-3 top-3" />
                        <input
                          type="text"
                          value={iaCowTagInput}
                          onChange={(e) => setIaCowTagInput(e.target.value)}
                          placeholder="Ej: 504, 102, 3341, V-504..."
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#c1c8c2] rounded-xl font-mono font-black text-sm text-[#012d1d] placeholder:font-normal placeholder:text-[#a0a5a2]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#555] mb-1">
                        O Seleccionar de la Lista de Inventario ({females.length} Vacas)
                      </label>
                      <select
                        value={selectedFemaleIdForForm}
                        onChange={(e) => {
                          setSelectedFemaleIdForForm(e.target.value);
                          const matched = females.find((f) => f.id === e.target.value);
                          if (matched) setIaCowTagInput(matched.tagId);
                        }}
                        className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                      >
                        {females.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.tagId} - {f.name} ({f.breed} • {f.physiologicalStatus})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Auto-Loaded Cow Inventory Card */}
                {activeIaCow && (
                  <div className="p-4 bg-gradient-to-r from-[#012d1d] to-[#1b4332] text-white rounded-2xl shadow-md space-y-3 border-2 border-[#ffba38]/40 animate-in fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                        <span className="text-xs font-black text-[#ffba38] uppercase tracking-wider">
                          Información del Animal Cargada Automáticamente del Inventario
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#c1ecd4] text-[#002114] px-2 py-0.5 rounded">
                        Estado: {activeIaCow.physiologicalStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Arete / Número</span>
                        <span className="font-mono text-base font-black text-white">{activeIaCow.tagId}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Nombre Vaca</span>
                        <span className="font-bold text-white truncate block">{activeIaCow.name}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Raza / Genética</span>
                        <span className="font-semibold text-slate-100">{activeIaCow.breed}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Lote Actual</span>
                        <span className="font-bold text-[#ffba38]">{activeIaCow.lotName || 'Lote 1 - Ordeño'}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Condición Corporal</span>
                        <span className="font-mono font-bold text-white">{activeIaCow.bodyConditionScore || '3.5 - Óptima'}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Días Abiertos</span>
                        <span className="font-mono font-bold text-[#ffba38]">{activeIaCow.diasAbiertos} días</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10 font-mono text-slate-200">
                      <div>
                        <span className="text-[#c1ecd4] font-bold">Madre Directa (Genealogía):</span> {activeIaCow.damName || activeIaCow.motherDirect || 'Lucero 14 (Holstein - Registro)'}
                      </div>
                      <div>
                        <span className="text-[#c1ecd4] font-bold">Padre / Toro Previo:</span> {activeIaCow.sireName || activeIaCow.bullOrSemenUsed || 'Semen Raza Pura'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Event Form Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Padre / Semen del Sistema *</label>
                    <select
                      value={formBullId}
                      onChange={(e) => setFormBullId(e.target.value)}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-[#012d1d]"
                    >
                      {semenInventory.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.bullName} - [{s.originType}] ({s.availableStraws} pajuelas dispon.)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Madre Directa (Auto-Cargada del Inventario)</label>
                    <input
                      type="text"
                      value={iaMotherName}
                      onChange={(e) => setIaMotherName(e.target.value)}
                      placeholder="Ej: Lucero 14 (Holstein)"
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-semibold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Estado / Condición Corporal (CC 1-5) *</label>
                    <select
                      value={iaBodyCondition}
                      onChange={(e) => setIaBodyCondition(e.target.value)}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-[#012d1d]"
                    >
                      <option value="1.0 - Muy Delgada / Emaciada">1.0 - Muy Delgada / Emaciada</option>
                      <option value="2.0 - Delgada">2.0 - Delgada</option>
                      <option value="2.5 - Regular">2.5 - Regular</option>
                      <option value="3.0 - Buena / Normal">3.0 - Buena / Normal</option>
                      <option value="3.5 - Óptima / Buena">3.5 - Óptima / Buena (Recomendada)</option>
                      <option value="4.0 - Sobrecondición / Gordura">4.0 - Sobrecondición</option>
                      <option value="5.0 - Obesa">5.0 - Obesa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Fecha de la Inseminación *</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-mono font-bold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Inseminador / Técnico Responsable</label>
                    <input
                      type="text"
                      value={iaTechnician}
                      onChange={(e) => setIaTechnician(e.target.value)}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-semibold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Protocolo IATF Aplicado</label>
                    <input
                      type="text"
                      value={iaProtocol}
                      onChange={(e) => setIaProtocol(e.target.value)}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-semibold text-[#012d1d]"
                    />
                  </div>
                </div>

                {/* Live Projections Preview Card */}
                <div className="p-4 bg-[#e8f5ec] rounded-2xl border border-[#c1ecd4] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#012d1d] uppercase block">
                      FECHA POSIBLE DEL PARTO (FPP +283 días)
                    </span>
                    <span className="font-mono text-base font-black text-[#012d1d]">
                      {new Date(new Date(eventDate).getTime() + 283 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold text-[#012d1d] uppercase block">
                      CONFIRMACIÓN DE PREÑEZ (DG PALPACIÓN 45d)
                    </span>
                    <span className="font-mono text-base font-black text-emerald-800">
                      {new Date(new Date(eventDate).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold text-[#012d1d] uppercase block">
                      VACA Y PADRE ASIGNADOS
                    </span>
                    <span className="font-semibold text-[#012d1d]">
                      {activeIaCow?.tagId} × {semenInventory.find((s) => s.id === formBullId)?.bullName || 'Semen'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const targetCow = activeIaCow || females[0];
                      const chosenSemen = semenInventory.find((s) => s.id === formBullId) || semenInventory[0];

                      const fppStr = new Date(new Date(eventDate).getTime() + 283 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      const dgStr = new Date(new Date(eventDate).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                      const updated = females.map((f) => {
                        if (f.id === targetCow.id) {
                          return {
                            ...f,
                            lastServiceDate: eventDate,
                            lastServiceType: 'IA' as ServiceType,
                            bullOrSemenUsed: chosenSemen.bullName,
                            bodyConditionScore: iaBodyCondition,
                            motherDirect: iaMotherName,
                            fppDate: fppStr,
                            alerts: [`IA realizada (${eventDate})`, `DG agendado para ${dgStr}`],
                          };
                        }
                        return f;
                      });

                      setFemales(updated);
                      setFormSuccessMessage(`✅ Inseminación de ${targetCow.tagId} (${targetCow.name}) cargada del inventario y registrada exitosamente con semen de ${chosenSemen.bullName}.`);
                      setTimeout(() => setFormSuccessMessage(null), 4000);
                    }}
                    className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                    Guardar Inseminación IA con Datos de Inventario
                  </button>
                </div>
              </div>
            )}

            {/* BATCH INSEMINATION FORM WITH PER-COW STRAW AND OPTIONS */}
            {iaMode === 'batch' && (
              <div className="space-y-6">
                {/* Batch Mode Header Banner */}
                <div className="p-4 bg-[#fff8e8] border-2 border-[#ffba38] rounded-2xl text-xs text-[#523700] space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#b27b00] shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-[#523700] text-sm">Inseminación por Lote con Configuración Individual por Vaca</h4>
                        <p className="text-[11px] text-[#7a5300]">
                          Selecciona las vacas del inventario. Frente a cada vaca puedes asignar la pajuela del toro, si es sexada o convencional, fecha, estado corporal, responsable y observaciones.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = females.map((f) => f.id);
                          setIaBatchSelectedIds(allIds);
                        }}
                        className="px-3 py-1.5 bg-[#ffba38] hover:bg-[#e0a020] text-[#523700] font-black rounded-xl text-xs cursor-pointer shadow-sm transition-all"
                      >
                        Seleccionar Todas ({females.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setIaBatchSelectedIds([])}
                        className="px-3 py-1.5 bg-white text-[#523700] font-bold rounded-xl text-xs border border-[#b27b00] hover:bg-amber-50 cursor-pointer transition-all"
                      >
                        Limpiar Selección
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Selection Checkbox Matrix */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-extrabold text-[#012d1d] text-xs uppercase tracking-wider">
                      1. Seleccionar Vacas para el Lote ({iaBatchSelectedIds.length} de {females.length} elegidas)
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-3 bg-[#f8f9f8] border border-[#c1c8c2] rounded-2xl custom-scrollbar">
                    {females.map((f) => {
                      const isChecked = iaBatchSelectedIds.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          onClick={() => {
                            if (isChecked) {
                              setIaBatchSelectedIds(iaBatchSelectedIds.filter((id) => id !== f.id));
                            } else {
                              setIaBatchSelectedIds([...iaBatchSelectedIds, f.id]);
                            }
                          }}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                            isChecked
                              ? 'bg-[#c1ecd4]/60 border-[#012d1d] font-black text-[#012d1d] shadow-sm'
                              : 'bg-white border-[#e2e2e2] text-[#555] hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded accent-[#012d1d]"
                          />
                          <span className="font-mono font-bold text-[#012d1d]">{f.tagId}</span> - <span className="truncate">{f.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Per-Cow Options Table / List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-extrabold text-[#012d1d] text-xs uppercase tracking-wider">
                      2. Lista Detallada de Inseminación por Vaca ({iaBatchSelectedIds.length} Animales en Tabla)
                    </label>
                    <span className="text-[11px] font-bold text-[#555]">
                      Puedes personalizar la pajuela, sexaje, fecha, estado y observaciones de cada vaca individualmente.
                    </span>
                  </div>

                  {iaBatchSelectedIds.length === 0 ? (
                    <div className="p-8 text-center bg-[#f8f9f8] border border-dashed border-[#c1c8c2] rounded-2xl text-[#717973] text-xs space-y-1">
                      <p className="font-bold text-[#012d1d]">No has seleccionado ninguna vaca para el lote.</p>
                      <p>Marca las casillas en el paso 1 arriba para desplegar la lista de inseminación.</p>
                    </div>
                  ) : (
                    <div className="border border-[#c1c8c2] rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[950px]">
                        <thead>
                          <tr className="bg-[#012d1d] text-white text-[11px] font-mono uppercase tracking-wider">
                            <th className="p-3">#</th>
                            <th className="p-3">Vaca / Arete</th>
                            <th className="p-3 w-56">Pajilla / Toro (Inf Toro)</th>
                            <th className="p-3 w-40">Sexada o No</th>
                            <th className="p-3 w-36">Fecha Servicio</th>
                            <th className="p-3 w-40">Estado / CC</th>
                            <th className="p-3 w-44">Responsable</th>
                            <th className="p-3">Observación</th>
                            <th className="p-3 text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e2e2] text-xs">
                          {iaBatchSelectedIds.map((cowId, index) => {
                            const cow = females.find((f) => f.id === cowId);
                            const row = getBatchRow(cowId);
                            if (!cow) return null;

                            return (
                              <tr key={cowId} className="hover:bg-[#f4fbf7]/80 transition-colors">
                                <td className="p-3 font-mono font-bold text-[#717973]">{index + 1}</td>

                                <td className="p-3">
                                  <div className="font-mono font-black text-[#012d1d] text-sm">{cow.tagId}</div>
                                  <div className="font-semibold text-[#333] text-[11px] truncate max-w-[120px]">{cow.name}</div>
                                  <div className="text-[10px] text-[#717973]">{cow.breed}</div>
                                </td>

                                <td className="p-3">
                                  <select
                                    value={row.semenId}
                                    onChange={(e) => updateBatchRow(cowId, 'semenId', e.target.value)}
                                    className="w-full p-2 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-[#012d1d] text-xs"
                                  >
                                    {semenInventory.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.bullName} ({s.availableStraws} paj) • {s.codeOrRegister}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                <td className="p-3">
                                  <select
                                    value={row.isSexed}
                                    onChange={(e) => updateBatchRow(cowId, 'isSexed', e.target.value)}
                                    className={`w-full p-2 border rounded-xl font-bold text-xs ${
                                      row.isSexed === 'sexada_hembra'
                                        ? 'bg-pink-50 border-pink-300 text-pink-900'
                                        : row.isSexed === 'sexada_macho'
                                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                                        : 'bg-[#f8f9f8] border-[#c1c8c2] text-[#012d1d]'
                                    }`}
                                  >
                                    <option value="convencional">Convencional</option>
                                    <option value="sexada_hembra">Sexada Hembra (♀)</option>
                                    <option value="sexada_macho">Sexada Macho (♂)</option>
                                  </select>
                                </td>

                                <td className="p-3">
                                  <input
                                    type="date"
                                    value={row.eventDate}
                                    onChange={(e) => updateBatchRow(cowId, 'eventDate', e.target.value)}
                                    className="w-full p-2 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-mono font-bold text-[#012d1d] text-xs"
                                  />
                                </td>

                                <td className="p-3">
                                  <select
                                    value={row.bodyCondition}
                                    onChange={(e) => updateBatchRow(cowId, 'bodyCondition', e.target.value)}
                                    className="w-full p-2 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-[#012d1d] text-xs"
                                  >
                                    <option value="3.5 - Óptima / Buena">3.5 - Óptima</option>
                                    <option value="3.0 - Buena / Normal">3.0 - Buena</option>
                                    <option value="2.5 - Regular">2.5 - Regular</option>
                                    <option value="4.0 - Sobrecondición">4.0 - Sobrec.</option>
                                    <option value="2.0 - Delgada">2.0 - Delgada</option>
                                  </select>
                                </td>

                                <td className="p-3">
                                  <input
                                    type="text"
                                    value={row.technician}
                                    onChange={(e) => updateBatchRow(cowId, 'technician', e.target.value)}
                                    className="w-full p-2 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-semibold text-[#012d1d] text-xs"
                                  />
                                </td>

                                <td className="p-3">
                                  <input
                                    type="text"
                                    placeholder="Ej: Celo natural, IATF..."
                                    value={row.notes}
                                    onChange={(e) => updateBatchRow(cowId, 'notes', e.target.value)}
                                    className="w-full p-2 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl text-xs text-[#012d1d]"
                                  />
                                </td>

                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setIaBatchSelectedIds(iaBatchSelectedIds.filter((id) => id !== cowId))}
                                    className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    title="Quitar del Lote"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Batch Calculated Summary & Save Button */}
                <div className="p-4 bg-[#012d1d] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#ffba38] uppercase tracking-wider block">
                      RESUMEN PROYECTADO DEL LOTE ({iaBatchSelectedIds.length} VACAS A INSEMINAR)
                    </span>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <span>
                        FPP Proyectada Promedio:{' '}
                        <strong className="text-white text-sm">
                          {new Date(new Date(eventDate).getTime() + 283 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        </strong>
                      </span>
                      <span>
                        Confirmación DG Promedio:{' '}
                        <strong className="text-[#c1ecd4] text-sm">
                          {new Date(new Date(eventDate).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={iaBatchSelectedIds.length === 0}
                    onClick={() => {
                      const updated = females.map((f) => {
                        if (iaBatchSelectedIds.includes(f.id)) {
                          const row = getBatchRow(f.id);
                          const chosenSemen = semenInventory.find((s) => s.id === row.semenId) || semenInventory[0];
                          const sexedLabel =
                            row.isSexed === 'sexada_hembra'
                              ? ' (Pajuela Sexada Hembra ♀)'
                              : row.isSexed === 'sexada_macho'
                              ? ' (Pajuela Sexada Macho ♂)'
                              : ' (Convencional)';

                          const rowDate = row.eventDate || eventDate;
                          const fppStr = new Date(new Date(rowDate).getTime() + 283 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          const dgStr = new Date(new Date(rowDate).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                          return {
                            ...f,
                            lastServiceDate: rowDate,
                            lastServiceType: 'IA' as ServiceType,
                            bullOrSemenUsed: `${chosenSemen.bullName}${sexedLabel}`,
                            bodyConditionScore: row.bodyCondition,
                            fppDate: fppStr,
                            alerts: [
                              `IA por Lote (${rowDate}) - Toro: ${chosenSemen.bullName}`,
                              `Inseminador: ${row.technician || iaTechnician}`,
                              `DG Agendado para ${dgStr}`,
                              ...(row.notes ? [`Obs: ${row.notes}`] : []),
                            ],
                          };
                        }
                        return f;
                      });

                      setFemales(updated);
                      setFormSuccessMessage(
                        `✅ Se registraron exitosamente ${iaBatchSelectedIds.length} inseminaciones por lote. Cada vaca fue guardada con su toro, tipo de pajuela sexada/convencional, fecha y observaciones especificadas.`
                      );
                      setTimeout(() => setFormSuccessMessage(null), 5000);
                    }}
                    className="w-full sm:w-auto bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-black px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Guardar y Ejecutar Inseminación por Lote ({iaBatchSelectedIds.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 3: TRANSFERENCIA DE EMBRIONES (TE / FIV)                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'embryo_transfer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-[#c1c8c2] card-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center shrink-0 shadow-md">
                <Microscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#012d1d]">
                  Módulo de Transferencia de Embriones (TE & FIV)
                </h3>
                <p className="text-xs text-[#717973]">
                  Registro de transferencias individuales y por Lote, calidad de Cuerpo Lúteo (CL), vinculación directa de Donadora/Padre y fechas de parto.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddReceptorModal(true)}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#ffba38]" />
              Sincronizar Vaca Receptora
            </button>
          </div>

          {/* BANCO DE EMBRIONES - SUTIL TRANSPARENTE, OSCURO Y GRIS */}
          <div className="bg-[#041c14] text-white rounded-3xl p-5 md:p-6 border-2 border-[#1b4332] shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1b4332] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#ffba38] text-[#523700] flex items-center justify-center shrink-0 shadow-lg font-black">
                  <Dna className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Banco de Embriones
                  </h3>
                  <p className="text-xs text-[#a2b8ad] mt-0.5">
                    Catálogo de embriones FIV en tarjetas compactas. Colores sutiles: Transparente (Fecundado), Oscuro (Transferido) y Gris (Vitrificado).
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS: BATCH CREATION, SINGLE CREATION, PRINT FIELD PDF REPORT */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBatchEmbryoModal(true)}
                  className="bg-[#012d1d] hover:bg-[#083a27] text-[#ffba38] border border-[#ffba38]/40 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Layers3 className="w-4 h-4 text-[#ffba38]" />
                  Crear por Lote
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateEmbryoModal(true)}
                  className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#523700]" />
                  Crear Embrión
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintReportModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4 text-purple-200" />
                  Planilla de Campo (PDF)
                </button>
              </div>
            </div>

            {/* Status Color Key / Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#08291d] p-3 rounded-2xl border border-[#1b4332]">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[11px] font-bold text-[#c1ecd4] uppercase tracking-wider mr-1">Filtrar:</span>
                <button
                  type="button"
                  onClick={() => setEmbryoFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                    embryoFilterStatus === 'all'
                      ? 'bg-white text-[#012d1d] shadow-sm font-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Todos ({embryos.length})
                </button>

                {/* FECUNDADO FILTER BUTTON (Transparente Sutil) */}
                <button
                  type="button"
                  onClick={() => setEmbryoFilterStatus('fecundado')}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1 border ${
                    embryoFilterStatus === 'fecundado'
                      ? 'bg-amber-500/30 text-amber-200 border-amber-400 ring-2 ring-amber-400/50 font-black shadow-lg'
                      : 'bg-white/5 text-amber-200/80 border-amber-500/20 hover:bg-white/10'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-300/80 animate-pulse inline-block"></span>
                  Transparente ({embryos.filter((e) => e.status === 'fecundado').length})
                </button>

                {/* TRANSFERIDO FILTER BUTTON (Oscuro Sutil) */}
                <button
                  type="button"
                  onClick={() => setEmbryoFilterStatus('transferido')}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1 border ${
                    embryoFilterStatus === 'transferido'
                      ? 'bg-slate-900 text-purple-200 border-purple-400 ring-2 ring-purple-400/50 font-black shadow-lg'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                  Oscuro ({embryos.filter((e) => e.status === 'transferido').length})
                </button>

                {/* VITRIFICADO FILTER BUTTON (Gris Sutil) */}
                <button
                  type="button"
                  onClick={() => setEmbryoFilterStatus('vitrificado')}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1 border ${
                    embryoFilterStatus === 'vitrificado'
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-400 ring-2 ring-zinc-400/50 font-black shadow-lg'
                      : 'bg-zinc-800/40 text-zinc-400 border-zinc-700 hover:bg-zinc-800/70'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block"></span>
                  Gris ({embryos.filter((e) => e.status === 'vitrificado').length})
                </button>
              </div>

              {/* Color Legend explanation */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#c1ecd4]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-white/10 border border-amber-400/50 inline-block"></span>
                  <span>Transparente</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-purple-500/50 inline-block"></span>
                  <span>Oscuro</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800 border border-zinc-600 inline-block"></span>
                  <span>Gris</span>
                </div>
              </div>
            </div>

            {/* SMALLER COMPACT EMBRYO CARDS GRID DISPLAY */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3 p-3 md:p-4 bg-[#03140e] rounded-3xl border border-[#1b4332] shadow-inner">
              {embryos
                .filter((e) => embryoFilterStatus === 'all' || e.status === embryoFilterStatus)
                .map((emb) => {
                  const isFecundado = emb.status === 'fecundado';
                  const isTransferido = emb.status === 'transferido';

                  return (
                    <div
                      key={emb.id}
                      className={`group rounded-2xl p-2.5 sm:p-3 border transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between space-y-2 relative overflow-hidden backdrop-blur-md ${
                        isFecundado
                          ? 'bg-white/5 border-amber-400/30 hover:border-amber-400/70 text-white shadow-sm'
                          : isTransferido
                          ? 'bg-slate-950/80 border-purple-500/30 hover:border-purple-400 text-white shadow-sm'
                          : 'bg-zinc-900/60 border-zinc-700/60 hover:border-zinc-500 text-white shadow-sm'
                      }`}
                    >
                      {/* Compact Header */}
                      <div className="flex items-start justify-between gap-1 border-b border-white/10 pb-1.5">
                        <div className="space-y-0.5 min-w-0">
                          <span
                            onClick={() => setSelectedEmbryoDetail(emb)}
                            className="font-mono font-black text-xs text-white group-hover:text-[#ffba38] transition-colors truncate block cursor-pointer"
                            title={emb.code}
                          >
                            {emb.code}
                          </span>
                          <span className="text-[9.5px] font-bold text-[#c1ecd4] truncate block">
                            {emb.stage.replace('Blastocisto', 'Blast.')} ({emb.quality})
                          </span>
                        </div>

                        {/* Micro Status Dot Badge */}
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 border ${
                            isFecundado
                              ? 'bg-amber-400 border-amber-200 shadow-amber-400/50 shadow-sm'
                              : isTransferido
                              ? 'bg-purple-500 border-purple-300 shadow-purple-500/50 shadow-sm'
                              : 'bg-zinc-400 border-zinc-300'
                          }`}
                          title={isFecundado ? 'Fecundado' : isTransferido ? 'Transferido' : 'Vitrificado'}
                        />
                      </div>

                      {/* Parentage & Canister */}
                      <div
                        onClick={() => setSelectedEmbryoDetail(emb)}
                        className="space-y-1 text-[10px] font-mono cursor-pointer"
                      >
                        <div className="flex justify-between text-white/80">
                          <span className="text-[#a2b8ad]">Madre:</span>
                          <span className="font-bold truncate max-w-[80px]" title={emb.donorName}>{emb.donorName.split(' ')[0]}</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span className="text-[#a2b8ad]">Padre:</span>
                          <span className="font-bold truncate max-w-[80px]" title={emb.sireName}>{emb.sireName.split(' ')[0]}</span>
                        </div>
                        <div className="flex justify-between text-[#c1ecd4]/90 text-[9px]">
                          <span className="text-[#a2b8ad]">Ubicación:</span>
                          <span className="truncate max-w-[80px]">{emb.lotCanister?.split('/')[1] || emb.lotCanister || 'T-1'}</span>
                        </div>

                        {/* Physical Straw Verification Status */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePhysicalStrawVerification(emb.id);
                          }}
                          className={`w-full py-0.5 px-1.5 rounded-md text-[8.5px] font-mono font-bold flex items-center justify-between transition-colors border ${
                            emb.verifiedInPhysicalStraw
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                              : 'bg-amber-950/90 text-amber-300 border-amber-500/50 hover:bg-amber-900'
                          }`}
                          title={emb.verifiedInPhysicalStraw ? 'Pajilla verificada en físico en campo/termo' : 'Clic para verificar físicamente'}
                        >
                          <span className="truncate font-black">{emb.strawNumber || 'Pajilla'}</span>
                          <span>{emb.verifiedInPhysicalStraw ? '✓ Verificada' : '⚠️ Sin verificar'}</span>
                        </button>
                      </div>

                      {/* INLINE RECEPTOR ASSIGNMENT & STATUS */}
                      <div className="pt-1.5 border-t border-white/10 space-y-1" onClick={(e) => e.stopPropagation()}>
                        {isTransferido && emb.receptorTag ? (
                          <div
                            onClick={() => setSelectedEmbryoDetail(emb)}
                            className="bg-purple-950/80 border border-purple-400/40 rounded-lg p-1 text-[9.5px] font-mono text-purple-200 flex items-center justify-between cursor-pointer"
                            title={`Receptora: ${emb.receptorTag}`}
                          >
                            <span className="font-bold uppercase">Rec:</span>
                            <span className="font-black text-white truncate max-w-[85px]">{emb.receptorTag.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <label className="text-[8.5px] uppercase font-bold text-[#a2b8ad] block">
                              Asignar Receptora:
                            </label>
                            <select
                              value={emb.receptorTag || ''}
                              onChange={(e) => handleAssignReceptorToEmbryo(emb.id, e.target.value)}
                              className="w-full bg-black/40 text-white text-[9.5px] font-mono font-bold p-1 rounded-lg border border-white/20 focus:border-[#ffba38] outline-none cursor-pointer"
                            >
                              <option value="">-- Asignar Vaca --</option>
                              {receptors.map((r) => (
                                <option key={r.id} value={`${r.tagId} (${r.name})`}>
                                  {r.tagId} - {r.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Active Embryo Transfers Table */}
          <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow overflow-hidden p-5 space-y-4">
            <h4 className="text-sm font-black text-[#012d1d] uppercase tracking-wider flex items-center gap-2">
              <Dna className="w-4 h-4 text-[#1b4332]" />
              Programa Activo de Receptores & Embriones FIV ({receptors.length} Receptoras)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-[#c1ecd4] text-[10.5px] font-extrabold uppercase tracking-wider">
                    <th className="p-3 pl-4">Vaca Receptora</th>
                    <th className="p-3">Estado Sincronización</th>
                    <th className="p-3">Cuerpo Lúteo (CL)</th>
                    <th className="p-3">Donadora Asignada</th>
                    <th className="p-3 text-center">Fecha Transferencia</th>
                    <th className="p-3 text-center">Estado Gestación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee] text-xs font-medium">
                  {receptors.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#f8fbf9]">
                      <td className="p-3 pl-4 font-black text-[#012d1d]">
                        {rec.tagId} - {rec.name} ({rec.breed})
                      </td>
                      <td className="p-3 font-semibold">
                        <span className="px-2 py-0.5 rounded bg-[#e8f5ec] text-[#012d1d] text-[11px] font-bold">
                          {rec.synchronizationStatus}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[#523700] font-bold">
                        {rec.lutealBodyQuality || 'CL Grado 1 (Excelente)'}
                      </td>
                      <td className="p-3 font-mono font-bold text-[#012d1d]">
                        {rec.assignedDonorId ? `Donadora ${rec.assignedDonorId}` : 'Donadora FIV Elite'}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#012d1d]">
                        {rec.lastTransferDate || 'Reciente'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          rec.pregnancyStatus === 'Gestante'
                            ? 'bg-[#c1ecd4] text-[#002114]'
                            : rec.pregnancyStatus === 'Pendiente DG'
                            ? 'bg-[#ffba38] text-[#523700]'
                            : 'bg-[#ffdad6] text-[#93000a]'
                        }`}>
                          {rec.pregnancyStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* REGISTRATION FORM FOR EMBRYO TRANSFER (TOGGLE: INDIVIDUAL VS BATCH) */}
          <div className="p-5 md:p-6 bg-white rounded-3xl border-2 border-[#1b4332]/30 card-shadow space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#e2e2e2] pb-4">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-[#ffba38]" />
                <h4 className="text-base font-black text-[#012d1d]">
                  Registro de Transferencia de Embrión (TE / FIV)
                </h4>
              </div>

              {/* Mode Toggle Switch */}
              <div className="bg-[#f8f9f8] p-1 rounded-2xl border border-[#c1c8c2] flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTeMode('individual')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    teMode === 'individual'
                      ? 'bg-[#012d1d] text-white shadow-sm'
                      : 'text-[#555] hover:text-black'
                  }`}
                >
                  📌 Registro Individual (Receptora x Receptora)
                </button>
                <button
                  type="button"
                  onClick={() => setTeMode('batch')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    teMode === 'batch'
                      ? 'bg-[#ffba38] text-[#523700] shadow-sm'
                      : 'text-[#555] hover:text-black'
                  }`}
                >
                  📦 Registro por Lote (Masivo TE)
                </button>
              </div>
            </div>

            {/* INDIVIDUAL EMBRYO TRANSFER FORM */}
            {teMode === 'individual' && (
              <div className="space-y-5">
                {/* Receptor Search & Quick Selection Header */}
                <div className="p-4 bg-[#f4fbf7] border-2 border-[#1b4332]/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-[#012d1d]" />
                      <label className="font-extrabold text-[#012d1d] text-xs uppercase tracking-wider">
                        1. Seleccionar o Digitar Número de Vaca Receptora
                      </label>
                    </div>
                    <span className="text-[10px] font-bold bg-[#c1ecd4] text-[#002114] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Database className="w-3 h-3" /> Carga Automática de Receptora Activa
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#555] mb-1">
                        Buscar / Ingresar Número o Arete de la Receptora
                      </label>
                      <div className="relative">
                        <Tag className="w-4 h-4 text-[#717973] absolute left-3 top-3" />
                        <input
                          type="text"
                          value={teReceptorTagInput}
                          onChange={(e) => setTeReceptorTagInput(e.target.value)}
                          placeholder="Ej: BR-102, 102, 3341, 901..."
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#c1c8c2] rounded-xl font-mono font-black text-sm text-[#012d1d] placeholder:font-normal placeholder:text-[#a0a5a2]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#555] mb-1">
                        O Seleccionar de la Lista ({receptors.length} Receptoras Sincronizadas)
                      </label>
                      <select
                        value={teSelectedReceptorId}
                        onChange={(e) => {
                          setTeSelectedReceptorId(e.target.value);
                          const matched = receptors.find((r) => r.id === e.target.value);
                          if (matched) setTeReceptorTagInput(matched.tagId);
                        }}
                        className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                      >
                        {receptors.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.tagId} - {r.name} ({r.breed})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Auto-Loaded Receptor Inventory Card */}
                {activeTeReceptor && (
                  <div className="p-4 bg-gradient-to-r from-[#012d1d] to-[#1b4332] text-white rounded-2xl shadow-md space-y-2.5 border-2 border-[#ffba38]/40 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                        <span className="text-xs font-black text-[#ffba38] uppercase tracking-wider">
                          Vaca Receptora Cargada de Inventario
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#c1ecd4] text-[#002114] px-2 py-0.5 rounded">
                        {activeTeReceptor.synchronizationStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Arete / ID</span>
                        <span className="font-mono text-sm font-black text-white">{activeTeReceptor.tagId}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Nombre / Raza</span>
                        <span className="font-bold text-white truncate block">{activeTeReceptor.name} ({activeTeReceptor.breed})</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Categoría Reproductiva</span>
                        <select
                          value={teFemaleCategory}
                          onChange={(e) => setTeFemaleCategory(e.target.value as 'Vaca' | 'Novilla')}
                          className="bg-emerald-950 text-white font-bold text-xs p-1 rounded border border-emerald-600 cursor-pointer w-full mt-0.5"
                        >
                          <option value="Novilla">Novilla (0 Partos)</option>
                          <option value="Vaca">Vaca (Multípara)</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Cuerpo Lúteo (CL)</span>
                        <span className="font-mono font-bold text-[#ffba38]">{activeTeReceptor.lutealBodyQuality || 'CL Grado 1'}</span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-[#c1ecd4] font-bold uppercase block">Gestación Actual</span>
                        <span className="font-bold text-emerald-300">{activeTeReceptor.pregnancyStatus}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Vaca Receptora *</label>
                    <select
                      value={teSelectedReceptorId}
                      onChange={(e) => {
                        setTeSelectedReceptorId(e.target.value);
                        const matched = receptors.find((r) => r.id === e.target.value);
                        if (matched) setTeReceptorTagInput(matched.tagId);
                      }}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-[#012d1d]"
                    >
                      {receptors.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.tagId} - {r.name} ({r.breed})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Calidad del Cuerpo Lúteo (CL) *</label>
                    <select
                      value={teLutealQuality}
                      onChange={(e) => setTeLutealQuality(e.target.value as any)}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-[#012d1d]"
                    >
                      <option value="CL Grado 1 (Excelente)">CL Grado 1 (Excelente - Tono & Vascularizado)</option>
                      <option value="CL Grado 2 (Bueno)">CL Grado 2 (Bueno - Aceptable para TE)</option>
                      <option value="Sin CL">Sin CL (No apta para TE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Estado Corporal Receptora (CC)</label>
                    <select
                      value={teBodyCondition}
                      onChange={(e) => setTeBodyCondition(e.target.value)}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-[#012d1d]"
                    >
                      <option value="3.5 - Óptima">3.5 - Óptima</option>
                      <option value="3.0 - Normal">3.0 - Normal</option>
                      <option value="2.5 - Regular">2.5 - Regular</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Fecha de la Transferencia (TE)</label>
                    <input
                      type="date"
                      value={teTransferDate}
                      onChange={(e) => setTeTransferDate(e.target.value)}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-mono font-bold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-[#012d1d] mb-1">Veterinario Responsable TE</label>
                    <input
                      type="text"
                      value={teTechnician}
                      onChange={(e) => setTeTechnician(e.target.value)}
                      className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-semibold text-[#012d1d]"
                    />
                  </div>
                </div>

                {/* Calculated Live Dates for TE */}
                <div className="p-4 bg-[#f4fbf7] rounded-2xl border border-[#c1ecd4] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#012d1d] uppercase block">
                      FECHA POSIBLE DEL PARTO (FPP +280 días)
                    </span>
                    <span className="font-mono text-base font-black text-[#012d1d]">
                      {new Date(new Date(teTransferDate).getTime() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold text-[#012d1d] uppercase block">
                      CONFIRMACIÓN PREÑEZ (ECOGRAFÍA DG 35d)
                    </span>
                    <span className="font-mono text-base font-black text-emerald-800">
                      {new Date(new Date(teTransferDate).getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold text-[#012d1d] uppercase block">
                      VACA RECEPTORA Y EMBRIÓN
                    </span>
                    <span className="font-semibold text-[#012d1d]">
                      Rec: {activeTeReceptor?.tagId} | Madre: {activeTeDonor?.tagId} | Genética: {teEmbryoOriginType === 'propia' ? 'Propia' : 'Adquirida'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const targetRec = activeTeReceptor || receptors[0];
                      const chosenDonor = activeTeDonor || donors[0];
                      const chosenSemen = semenInventory.find((s) => s.id === teSelectedSemenId) || semenInventory[0];

                      const updated = receptors.map((r) => {
                        if (r.id === targetRec.id) {
                          return {
                            ...r,
                            assignedDonorId: chosenDonor.tagId,
                            lutealBodyQuality: teLutealQuality,
                            lastTransferDate: teTransferDate,
                            pregnancyStatus: 'Pendiente DG' as const,
                          };
                        }
                        return r;
                      });

                      setReceptors(updated);
                      setFormSuccessMessage(
                        `✅ Transferencia TE guardada con éxito en Receptora ${targetRec.tagId} (${targetRec.name}). Se incorporó la genealogía materna (${chosenDonor.name} - ${teMaternalOriginType === 'propia' ? 'Ganadería Propia' : teMaternalFarmName}) y paterna (${chosenSemen.bullName} - ${tePaternalOriginType === 'propio' ? 'Propio' : tePaternalFarmName}) para el análisis de cruces.`
                      );
                      setTimeout(() => setFormSuccessMessage(null), 5000);
                    }}
                    className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                    Guardar Transferencia TE & Registrar Genealogía de la Ganadería
                  </button>
                </div>
              </div>
            )}

            {/* BATCH EMBRYO TRANSFER FORM WITH PER-RECEPTOR OPTIONS */}
            {teMode === 'batch' && (
              <div className="space-y-6">
                {/* Batch Mode Header Banner */}
                <div className="p-4 bg-[#e8f5ec] border-2 border-[#1b4332]/30 rounded-2xl text-xs text-[#002114] space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#012d1d] shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-[#012d1d] text-sm">Transferencia de Embriones (TE / FIV) por Lote</h4>
                        <p className="text-[11px] text-[#2d5240]">
                          Selecciona las vacas receptoras del programa. Para cada receptora puedes asignar la donadora madre, el semental/padre FIV, tipo de embrión, calidad del cuerpo lúteo (CL), fecha, responsable y observaciones.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = receptors.map((r) => r.id);
                          setTeBatchSelectedIds(allIds);
                        }}
                        className="px-3 py-1.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-black rounded-xl text-xs cursor-pointer shadow-sm transition-all"
                      >
                        Seleccionar Todas ({receptors.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTeBatchSelectedIds([])}
                        className="px-3 py-1.5 bg-white text-[#012d1d] font-bold rounded-xl text-xs border border-[#012d1d] hover:bg-emerald-50 cursor-pointer transition-all"
                      >
                        Limpiar Selección
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Selection Checkbox Matrix */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-extrabold text-[#012d1d] text-xs uppercase tracking-wider">
                      1. Seleccionar Receptoras para el Lote ({teBatchSelectedIds.length} de {receptors.length} elegidas)
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-3 bg-[#f8f9f8] border border-[#c1c8c2] rounded-2xl custom-scrollbar">
                    {receptors.map((r) => {
                      const isChecked = teBatchSelectedIds.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          onClick={() => {
                            if (isChecked) {
                              setTeBatchSelectedIds(teBatchSelectedIds.filter((id) => id !== r.id));
                            } else {
                              setTeBatchSelectedIds([...teBatchSelectedIds, r.id]);
                            }
                          }}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                            isChecked
                              ? 'bg-[#c1ecd4]/60 border-[#012d1d] font-black text-[#012d1d] shadow-sm'
                              : 'bg-white border-[#e2e2e2] text-[#555] hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded accent-[#012d1d]"
                          />
                          <span className="font-mono font-bold text-[#012d1d]">{r.tagId}</span> - <span className="truncate">{r.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Per-Receptor Options Table / List */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block font-extrabold text-[#012d1d] text-xs uppercase tracking-wider">
                        2. Lista Detallada de Transferencia de Embrión por Receptora ({teBatchSelectedIds.length} Receptoras en Lote)
                      </label>
                      <p className="text-[11px] text-[#555] font-medium">
                        Configura para cada receptora el origen de la donadora madre (Propia / Adquirida), el semental padre (Propio / Comprado) y el tipo de embrión para construir la genealogía propia de la ganadería.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#012d1d] text-white px-3 py-1 rounded-xl shrink-0 self-start sm:self-auto">
                      Análisis de Cruces & Genealogía en Vivo
                    </span>
                  </div>

                  {teBatchSelectedIds.length === 0 ? (
                    <div className="p-8 text-center bg-[#f8f9f8] border border-dashed border-[#c1c8c2] rounded-2xl text-[#717973] text-xs space-y-1">
                      <p className="font-bold text-[#012d1d]">No has seleccionado ninguna receptora para el lote.</p>
                      <p>Marca las casillas en el paso 1 arriba para desplegar la lista de transferencias.</p>
                    </div>
                  ) : (
                    <div className="border border-[#c1c8c2] rounded-2xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1280px]">
                        <thead>
                          <tr className="bg-[#012d1d] text-white text-[10.5px] font-mono uppercase tracking-wider">
                            <th className="p-3">#</th>
                            <th className="p-3">Vaca Receptora & Categoría</th>
                            <th className="p-3 w-56">Madre Donadora & Origen</th>
                            <th className="p-3 w-56">Semental Padre & Origen</th>
                            <th className="p-3 w-48">Análisis de Cruce Resultante</th>
                            <th className="p-3 w-40">Tipo / Conservación Embrión</th>
                            <th className="p-3 w-36">Cuerpo Lúteo (CL)</th>
                            <th className="p-3 w-32">Fecha TE</th>
                            <th className="p-3 w-40">Responsable / Médico</th>
                            <th className="p-3">Observación / Pedigrí</th>
                            <th className="p-3 text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e2e2] text-xs">
                          {teBatchSelectedIds.map((recId, index) => {
                            const rec = receptors.find((r) => r.id === recId);
                            const row = getBatchTeRow(recId);
                            if (!rec) return null;

                            const selectedDonorObj = donors.find((d) => d.id === row.donorId);
                            const selectedSemenObj = semenInventory.find((s) => s.id === row.semenId);
                            const crossResult = calculateCrossbreedAnalysis(selectedDonorObj?.breed, selectedSemenObj?.breed);

                            return (
                              <tr key={recId} className="hover:bg-[#f4fbf7]/80 transition-colors">
                                <td className="p-3 font-mono font-bold text-[#717973]">{index + 1}</td>

                                <td className="p-3 space-y-1">
                                  <div className="font-mono font-black text-[#012d1d] text-sm">{rec.tagId}</div>
                                  <div className="font-semibold text-[#333] text-[11px] truncate max-w-[120px]">{rec.name}</div>
                                  <div className="text-[10px] text-[#717973]">{rec.breed}</div>
                                  <select
                                    value={row.femaleCategory || getFemaleCategoryAuto(rec)}
                                    onChange={(e) => updateBatchTeRow(recId, 'femaleCategory', e.target.value)}
                                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border cursor-pointer ${
                                      (row.femaleCategory || getFemaleCategoryAuto(rec)) === 'Vaca'
                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                        : 'bg-blue-100 text-blue-900 border-blue-300'
                                    }`}
                                  >
                                    <option value="Novilla">Novilla</option>
                                    <option value="Vaca">Vaca</option>
                                  </select>
                                </td>

                                {/* MADRE DONADORA + ORIGEN */}
                                <td className="p-3 space-y-1">
                                  <select
                                    value={row.donorId}
                                    onChange={(e) => updateBatchTeRow(recId, 'donorId', e.target.value)}
                                    className="w-full p-1.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-lg font-bold text-[#012d1d] text-xs"
                                  >
                                    {donors.map((d) => (
                                      <option key={d.id} value={d.id}>
                                        {d.tagId} - {d.name} ({d.breed})
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex items-center gap-1">
                                    <select
                                      value={row.maternalOrigin}
                                      onChange={(e) => updateBatchTeRow(recId, 'maternalOrigin', e.target.value as any)}
                                      className={`text-[10px] font-bold p-1 rounded-md border ${
                                        row.maternalOrigin === 'propia'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : 'bg-amber-50 text-amber-900 border-amber-300'
                                      }`}
                                    >
                                      <option value="propia">Propia Ganadería</option>
                                      <option value="adquirida">Comprada a Otra Ganadería</option>
                                    </select>
                                  </div>
                                </td>

                                {/* SEMENTAL PADRE + ORIGEN */}
                                <td className="p-3 space-y-1">
                                  <select
                                    value={row.semenId}
                                    onChange={(e) => updateBatchTeRow(recId, 'semenId', e.target.value)}
                                    className="w-full p-1.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-lg font-bold text-[#012d1d] text-xs"
                                  >
                                    {semenInventory.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.bullName} - {s.breed}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex items-center gap-1">
                                    <select
                                      value={row.paternalOrigin}
                                      onChange={(e) => updateBatchTeRow(recId, 'paternalOrigin', e.target.value as any)}
                                      className={`text-[10px] font-bold p-1 rounded-md border ${
                                        row.paternalOrigin === 'propio'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : 'bg-purple-50 text-purple-900 border-purple-300'
                                      }`}
                                    >
                                      <option value="propio">Toro Propio Finca</option>
                                      <option value="comprado">Semen / Central Comprado</option>
                                    </select>
                                  </div>
                                </td>

                                {/* CROSSBREED RESULT BADGE */}
                                <td className="p-3">
                                  <div className="p-2 bg-[#f4fbf7] border border-[#c1ecd4] rounded-xl space-y-1">
                                    <span className="font-extrabold text-[#012d1d] text-[11px] block leading-tight">
                                      {crossResult.crossName}
                                    </span>
                                    <span className="text-[9.5px] font-medium text-[#006e48] block leading-tight">
                                      {crossResult.purpose}
                                    </span>
                                  </div>
                                </td>

                                {/* EMBRYO CONSERVATION TYPE */}
                                <td className="p-3">
                                  <select
                                    value={row.embryoType}
                                    onChange={(e) => updateBatchTeRow(recId, 'embryoType', e.target.value)}
                                    className="w-full p-1.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-lg font-bold text-[#012d1d] text-xs"
                                  >
                                    <option value="FIV Fresco - Grado 1">FIV Fresco - Grado 1</option>
                                    <option value="FIV Vitrificado (Direct Transfer)">FIV Vitrificado DT</option>
                                    <option value="FIV Sexado Hembra (♀)">Sexado Hembra (♀)</option>
                                    <option value="FIV Sexado Macho (♂)">Sexado Macho (♂)</option>
                                  </select>
                                </td>

                                {/* CL QUALITY */}
                                <td className="p-3">
                                  <select
                                    value={row.lutealQuality}
                                    onChange={(e) => updateBatchTeRow(recId, 'lutealQuality', e.target.value)}
                                    className="w-full p-1.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-lg font-bold text-[#012d1d] text-xs"
                                  >
                                    <option value="CL Grado 1 (Excelente)">CL Grado 1 (Excelente)</option>
                                    <option value="CL Grado 2 (Bueno)">CL Grado 2 (Bueno)</option>
                                    <option value="Sin CL">Sin CL (No apto)</option>
                                  </select>
                                </td>

                                {/* DATE */}
                                <td className="p-3">
                                  <input
                                    type="date"
                                    value={row.transferDate}
                                    onChange={(e) => updateBatchTeRow(recId, 'transferDate', e.target.value)}
                                    className="w-full p-1.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-lg font-mono font-bold text-[#012d1d] text-xs"
                                  />
                                </td>

                                {/* VETERINARIAN */}
                                <td className="p-3">
                                  <input
                                    type="text"
                                    value={row.technician}
                                    onChange={(e) => updateBatchTeRow(recId, 'technician', e.target.value)}
                                    className="w-full p-1.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-lg font-semibold text-[#012d1d] text-xs"
                                  />
                                </td>

                                {/* NOTES / PEDIGREE */}
                                <td className="p-3">
                                  <input
                                    type="text"
                                    placeholder="Ej: Genealogía propia, canastilla #4..."
                                    value={row.notes}
                                    onChange={(e) => updateBatchTeRow(recId, 'notes', e.target.value)}
                                    className="w-full p-1.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-lg text-xs text-[#012d1d]"
                                  />
                                </td>

                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setTeBatchSelectedIds(teBatchSelectedIds.filter((id) => id !== recId))}
                                    className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    title="Quitar del Lote"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Batch Calculated Summary & Save Button */}
                <div className="p-4 bg-[#012d1d] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#ffba38] uppercase tracking-wider block">
                      PROYECCIÓN DE TRANSFERENCIA TE POR LOTE ({teBatchSelectedIds.length} RECEPTORAS)
                    </span>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <span>
                        FPP Proyectada Promedio:{' '}
                        <strong className="text-white text-sm">
                          {new Date(new Date(teTransferDate).getTime() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        </strong>
                      </span>
                      <span>
                        Ecografía DG Promedio:{' '}
                        <strong className="text-[#c1ecd4] text-sm">
                          {new Date(new Date(teTransferDate).getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={teBatchSelectedIds.length === 0}
                    onClick={() => {
                      const updated = receptors.map((r) => {
                        if (teBatchSelectedIds.includes(r.id)) {
                          const row = getBatchTeRow(r.id);
                          const chosenDonor = donors.find((d) => d.id === row.donorId) || donors[0];
                          const chosenSemen = semenInventory.find((s) => s.id === row.semenId) || semenInventory[0];

                          return {
                            ...r,
                            assignedDonorId: chosenDonor.tagId,
                            lutealBodyQuality: row.lutealQuality,
                            lastTransferDate: row.transferDate || teTransferDate,
                            pregnancyStatus: 'Pendiente DG' as const,
                          };
                        }
                        return r;
                      });

                      setReceptors(updated);
                      setFormSuccessMessage(
                        `✅ Se registraron exitosamente ${teBatchSelectedIds.length} transferencias de embriones por lote. Se guardó para cada receptora su madre donadora, semental padre, origen genético (propia/comprada), tipo de embrión, análisis de cruce y fecha para la genealogía de la ganadería.`
                      );
                      setTimeout(() => setFormSuccessMessage(null), 5000);
                    }}
                    className="w-full sm:w-auto bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-black px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Guardar y Ejecutar Transferencia por Lote ({teBatchSelectedIds.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 4: GESTIÓN DE VACAS DONADORAS & VACAS RECEPTORAS                */}
      {/* ========================================================================= */}
      {activeSubTab === 'donors_receptors' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-3xl border border-[#c1c8c2] card-shadow">
            <div>
              <h3 className="text-lg font-black text-[#012d1d]">Catálogo de Vacas Donadoras & Vacas Receptoras</h3>
              <p className="text-xs text-[#717973]">
                Clasificación genética de hembras de elite (Donadoras OPU/FIV) y matriz receptoras de embriones.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddDonorModal(true)}
                className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#ffba38]" />
                + Nueva Donadora
              </button>
              <button
                onClick={() => setShowAddReceptorModal(true)}
                className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                + Nueva Receptora
              </button>
            </div>
          </div>

          {/* Donors Cards */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#012d1d] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ffba38]" />
              Vacas Donadoras de Elite ({donors.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {donors.map((donor) => (
                <div key={donor.id} className="p-5 bg-white rounded-2xl border-2 border-[#ffba38]/50 card-shadow space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-[#ffba38] text-[#523700] px-2 py-0.5 rounded">
                        {donor.geneticsCategory}
                      </span>
                      <h5 className="text-base font-black text-[#012d1d] mt-1">
                        {donor.tagId} - {donor.name}
                      </h5>
                      <span className="text-xs text-[#717973]">{donor.breed}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      donor.status === 'Activa' ? 'bg-[#c1ecd4] text-[#002114]' : 'bg-[#e2e2e2] text-[#414844]'
                    }`}>
                      {donor.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#f8f9f8] p-3 rounded-xl text-xs text-center border border-[#e2e2e2]">
                    <div>
                      <span className="text-[10px] text-[#79564b] font-bold block uppercase">Colectas OPU</span>
                      <span className="font-mono font-black text-sm text-[#012d1d]">{donor.totalOpuCollections}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#79564b] font-bold block uppercase">Embriones Producidos</span>
                      <span className="font-mono font-black text-sm text-[#012d1d]">{donor.totalEmbryosProduced}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#79564b] font-bold block uppercase">Tasa Viabilidad</span>
                      <span className="font-mono font-black text-sm text-emerald-800">{donor.viableEmbryosRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 5: TOROS PROPIOS DE LA FINCA VS. SEMEN COMPRADO (TERMO)          */}
      {/* ========================================================================= */}
      {activeSubTab === 'bulls_semen' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-3xl border border-[#c1c8c2] card-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center shrink-0 shadow-md">
                <Container className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#012d1d]">
                  Inventario de Sementales: Toros Propios vs. Termo de Nitrógeno (Semen Comprado)
                </h3>
                <p className="text-xs text-[#717973]">
                  Trazabilidad de origen genético, stock de pajuelas disponibles y ubicación en canastillas de nitrógeno.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddSemenModal(true)}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shrink-0"
            >
              <Plus className="w-4 h-4 text-[#ffba38]" />
              + Registrar Pajuelas / Semental
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {semenInventory.map((item) => (
              <div
                key={item.id}
                className={`p-5 bg-white rounded-2xl border-2 card-shadow space-y-3 ${
                  item.originType === 'Toro Propio Finca' ? 'border-[#012d1d]/40' : 'border-[#ffba38]/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      item.originType === 'Toro Propio Finca'
                        ? 'bg-[#c1ecd4] text-[#002114]'
                        : 'bg-[#ffba38] text-[#523700]'
                    }`}>
                      {item.originType}
                    </span>
                    <h5 className="text-base font-black text-[#012d1d] mt-1">{item.bullName}</h5>
                    <span className="text-xs text-[#717973] font-mono">{item.codeOrRegister} • {item.breed}</span>
                  </div>

                  <span className="font-mono text-sm font-black text-[#012d1d] bg-[#f8f9f8] px-3 py-1 rounded-xl border border-[#e2e2e2]">
                    {item.availableStraws} Pajuelas
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#f8f9f8] p-3 rounded-xl border border-[#e2e2e2]">
                  <div>
                    <span className="text-[10px] text-[#79564b] block font-bold">PROVEEDOR / FINCA</span>
                    <span className="font-bold text-[#012d1d]">{item.supplierOrFarm || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#79564b] block font-bold">TERMO / CANASTILLA</span>
                    <span className="font-bold text-[#012d1d]">{item.tankCanister || 'Monta Directa'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 6: FICHA GENERAL DE HEMBRAS REPRODUCTIVAS                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'females' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#717973] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por Arete, Nombre, Raza o Lote..."
                className="w-full pl-9 pr-4 py-2 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl text-xs font-semibold text-[#012d1d] outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-[#c1ecd4] text-[10.5px] font-extrabold uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Arete / Vaca</th>
                    <th className="p-3.5">Estado Fisiológico</th>
                    <th className="p-3.5">EPS / EPP</th>
                    <th className="p-3.5 text-center">Días Abiertos (DA)</th>
                    <th className="p-3.5 text-center">IEP (Días)</th>
                    <th className="p-3.5 text-center">Serv. / Conc. (S/C)</th>
                    <th className="p-3.5">Parto Probable (FPP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee] text-xs">
                  {females.map((female) => (
                    <tr key={female.id} className="hover:bg-[#f8fbf9]">
                      <td className="p-3.5 pl-5 font-black text-[#012d1d]">
                        {female.tagId} - {female.name} ({female.breed})
                      </td>
                      <td className="p-3.5 font-bold">
                        <span className="px-2.5 py-1 rounded bg-[#c1ecd4] text-[#002114] text-[10px] font-black uppercase">
                          {female.physiologicalStatus}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        EPS: {female.epsMonths}m | EPP: {female.eppMonths}m
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-[#012d1d]">
                        {female.diasAbiertos}d
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-[#012d1d]">
                        {female.iepDays}d
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold">
                        {female.servicesPerConception}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-800 font-bold">
                        {female.fppDate || 'No Preñada'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 7: PEDIGRÍ & SEMENTALES                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'pedigree' && (
        <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2] card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
            <h3 className="text-lg font-black text-[#012d1d]">Certificado de Pedigrí & Evaluación de DEPs</h3>
            <button
              onClick={onOpenCertificateModal}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm"
            >
              Ver Certificado Oficial
            </button>
          </div>

          <div className="p-4 bg-[#f8f9f8] rounded-2xl border border-[#e2e2e2] space-y-2">
            <h4 className="font-black text-sm text-[#012d1d]">{currentBull.name} ({currentBull.code})</h4>
            <p className="text-xs text-[#717973] font-medium">
              Raza: {currentBull.breed} • Pureza: {currentBull.purityPercentage}% • Registro Asocebú: {currentBull.registrationNumber}
            </p>
          </div>
        </div>
      )}

      {/* MODAL: ADD DONOR */}
      {showAddDonorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-[#012d1d]">Declarar Nueva Vaca Donadora</h3>
              <button onClick={() => setShowAddDonorModal(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDonor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Número / Arete Tag ID *</label>
                <input
                  type="text"
                  required
                  value={newDonorTag}
                  onChange={(e) => setNewDonorTag(e.target.value)}
                  placeholder="Ej: DON-880"
                  className="w-full p-2.5 border rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Nombre de la Donadora</label>
                <input
                  type="text"
                  value={newDonorName}
                  onChange={(e) => setNewDonorName(e.target.value)}
                  placeholder="Ej: Queen OPU 88"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Categoría Genética</label>
                <select
                  value={newDonorCategory}
                  onChange={(e) => setNewDonorCategory(e.target.value as any)}
                  className="w-full p-2.5 border rounded-xl font-bold"
                >
                  <option value="Puro Pedigrí">Puro Pedigrí</option>
                  <option value="F1 Superior">F1 Superior</option>
                  <option value="Elite Hato">Elite Hato</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDonorModal(false)}
                  className="px-4 py-2 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-white font-black rounded-xl shadow-md"
                >
                  Guardar Donadora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD RECEPTOR */}
      {showAddReceptorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-[#012d1d]">Sincronizar / Agregar Vaca Receptora</h3>
              <button onClick={() => setShowAddReceptorModal(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReceptor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Arete Tag ID Receptora *</label>
                <input
                  type="text"
                  required
                  value={newReceptorTag}
                  onChange={(e) => setNewReceptorTag(e.target.value)}
                  placeholder="Ej: REC-204"
                  className="w-full p-2.5 border rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Nombre / Identificación</label>
                <input
                  type="text"
                  value={newReceptorName}
                  onChange={(e) => setNewReceptorName(e.target.value)}
                  placeholder="Ej: Receptora Pampa 20"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddReceptorModal(false)}
                  className="px-4 py-2 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-white font-black rounded-xl shadow-md"
                >
                  Guardar Receptora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SEMEN / BULL */}
      {showAddSemenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-[#012d1d]">Registrar Toro Propio o Semen Comprado</h3>
              <button onClick={() => setShowAddSemenModal(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSemen} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Nombre del Semental / Toro *</label>
                <input
                  type="text"
                  required
                  value={newSemenBullName}
                  onChange={(e) => setNewSemenBullName(e.target.value)}
                  placeholder="Ej: El Rey 500 (Brangus)"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Origen Genético *</label>
                <select
                  value={newSemenOrigin}
                  onChange={(e) => setNewSemenOrigin(e.target.value as any)}
                  className="w-full p-2.5 border rounded-xl font-bold"
                >
                  <option value="Semen Comprado (Termo)">Semen Comprado (Termo de Nitrógeno)</option>
                  <option value="Toro Propio Finca">Toro Propio de la Finca (Padrote)</option>
                </select>
              </div>

              {newSemenOrigin === 'Semen Comprado (Termo)' && (
                <>
                  <div>
                    <label className="block font-bold text-[#012d1d] mb-1">Proveedor / Casa Genética</label>
                    <input
                      type="text"
                      value={newSemenSupplier}
                      onChange={(e) => setNewSemenSupplier(e.target.value)}
                      placeholder="Ej: ABS Global, Select Sires"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#012d1d] mb-1">Cantidad de Pajuelas Adquiridas</label>
                    <input
                      type="number"
                      value={newSemenStraws}
                      onChange={(e) => setNewSemenStraws(Number(e.target.value))}
                      className="w-full p-2.5 border rounded-xl font-mono"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSemenModal(false)}
                  className="px-4 py-2 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-white font-black rounded-xl shadow-md"
                >
                  Guardar Semental
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SYNC PROTOCOL WITH INVENTORY FEMALE SELECTION AND VACA/NOVILLA CLASSIFICATION */}
      {showAddSyncModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-[#e2e2e2] pb-3">
              <div>
                <h3 className="text-base font-black text-[#012d1d]">
                  Crear Protocolo IATF / TETF & Asignar Hembras
                </h3>
                <p className="text-[11px] text-[#717973]">
                  Selecciona las hembras del inventario e indica si cada una es Vaca o Novilla (se extrae del sistema o se modifica manualmente).
                </p>
              </div>
              <button onClick={() => setShowAddSyncModal(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSync} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Nombre del Protocolo / Lote *</label>
                  <input
                    type="text"
                    required
                    value={newSyncName}
                    onChange={(e) => setNewSyncName(e.target.value)}
                    placeholder="Ej: Sincronización IATF Lote 4"
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Técnica Reproductiva *</label>
                  <select
                    value={newSyncTechnique}
                    onChange={(e) => setNewSyncTechnique(e.target.value as any)}
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-[#012d1d]"
                  >
                    <option value="IATF (Inseminación a Tiempo Fijo)">IATF (Inseminación a Tiempo Fijo)</option>
                    <option value="TETF (Transferencia a Tiempo Fijo)">TETF (Transferencia a Tiempo Fijo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Fecha de Inicio Hormonal (DIB/CIDR) *</label>
                  <input
                    type="date"
                    value={newSyncStartDate}
                    onChange={(e) => setNewSyncStartDate(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-mono font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Hembras Seleccionadas (Conteo)</label>
                  <input
                    type="number"
                    value={newSyncSelectedFemaleIds.length || newSyncCount}
                    readOnly
                    className="w-full p-2.5 bg-[#e8f5ec] border border-[#c1ecd4] rounded-xl font-mono font-black text-[#012d1d]"
                  />
                </div>
              </div>

              {/* SELECTION OF FEMALES FROM INVENTORY */}
              <div className="p-4 bg-[#f4fbf7] border-2 border-[#012d1d]/20 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#c1c8c2] pb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#012d1d]" />
                    <label className="font-black text-[#012d1d] text-xs uppercase tracking-wider">
                      Seleccionar Hembras del Inventario ({newSyncSelectedFemaleIds.length} de {availableInventoryFemales.length} seleccionadas)
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setNewSyncSelectedFemaleIds(availableInventoryFemales.map((f) => f.id))}
                      className="px-2.5 py-1 bg-[#012d1d] text-white font-bold rounded-lg text-[10px] hover:bg-[#1b4332] cursor-pointer"
                    >
                      Todas ({availableInventoryFemales.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const novillas = availableInventoryFemales
                          .filter((f) => (newSyncCategoryOverrides[f.id] || f.autoCategory) === 'Novilla')
                          .map((f) => f.id);
                        setNewSyncSelectedFemaleIds(novillas);
                      }}
                      className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 font-bold rounded-lg text-[10px] hover:bg-blue-200 cursor-pointer"
                    >
                      Solo Novillas
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const vacas = availableInventoryFemales
                          .filter((f) => (newSyncCategoryOverrides[f.id] || f.autoCategory) === 'Vaca')
                          .map((f) => f.id);
                        setNewSyncSelectedFemaleIds(vacas);
                      }}
                      className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-[10px] hover:bg-amber-200 cursor-pointer"
                    >
                      Solo Vacas
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSyncSelectedFemaleIds([])}
                      className="px-2.5 py-1 bg-white text-[#555] border border-[#c1c8c2] font-semibold rounded-lg text-[10px] hover:bg-slate-100 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Filter / Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#717973] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={syncFemaleSearchQuery}
                    onChange={(e) => setSyncFemaleSearchQuery(e.target.value)}
                    placeholder="Filtrar por arete, nombre o raza..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-semibold text-[#012d1d]"
                  />
                </div>

                {/* Females Checklist with Vaca / Novilla manual override */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {availableInventoryFemales
                    .filter((f) =>
                      `${f.tagId} ${f.name} ${f.breed}`.toLowerCase().includes(syncFemaleSearchQuery.toLowerCase())
                    )
                    .map((f) => {
                      const isSelected = newSyncSelectedFemaleIds.includes(f.id);
                      const currentCategory = newSyncCategoryOverrides[f.id] || f.autoCategory;

                      return (
                        <div
                          key={f.id}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                            isSelected
                              ? 'bg-[#c1ecd4]/50 border-[#012d1d] font-bold text-[#012d1d]'
                              : 'bg-white border-[#e2e2e2] text-[#555] hover:bg-slate-50'
                          }`}
                        >
                          <label
                            onClick={() => {
                              if (isSelected) {
                                setNewSyncSelectedFemaleIds(newSyncSelectedFemaleIds.filter((id) => id !== f.id));
                              } else {
                                setNewSyncSelectedFemaleIds([...newSyncSelectedFemaleIds, f.id]);
                              }
                            }}
                            className="flex items-center gap-2 cursor-pointer flex-1"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded accent-[#012d1d]"
                            />
                            <span className="font-mono font-black text-[#012d1d]">{f.tagId}</span>
                            <span className="truncate max-w-[140px] text-[#333] font-semibold">{f.name}</span>
                            <span className="text-[10px] text-[#717973]">({f.breed})</span>
                          </label>

                          {/* Vaca vs Novilla Dropdown / Switch */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#717973] font-medium hidden sm:inline">Categoría:</span>
                            <select
                              value={currentCategory}
                              onChange={(e) => {
                                const val = e.target.value as 'Vaca' | 'Novilla';
                                setNewSyncCategoryOverrides((prev) => ({ ...prev, [f.id]: val }));
                              }}
                              className={`text-[10.5px] font-black px-2 py-1 rounded-lg border cursor-pointer ${
                                currentCategory === 'Vaca'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border-blue-300'
                              }`}
                            >
                              <option value="Novilla">Novilla</option>
                              <option value="Vaca">Vaca</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e2e2]">
                <button
                  type="button"
                  onClick={() => setShowAddSyncModal(false)}
                  className="px-4 py-2 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                  Agendar Protocolo ({newSyncSelectedFemaleIds.length} Hembras)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREAR / GESTIONAR LOTE DE EMBRIONES ENLISTADOS Y ESCANEO DE PLANILLA */}
      {showBatchEmbryoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full p-4 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col border-2 border-[#012d1d]">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#e2e2e2] pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-black shadow-md">
                  <Layers3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#012d1d] flex items-center gap-2">
                    Crear y Enlistar Lote de Embriones FIV
                    <span className="bg-[#ffba38]/30 text-[#012d1d] text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#ffba38]">
                      {batchDraftItems.length} Unidades
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#717973]">
                    Personaliza cada embrión del lote de forma individual, asigna receptoras, escanea planillas de campo y confirma verificación en físico de pajillas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchEmbryoModal(false)}
                className="text-[#717973] hover:text-black p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TOP BAR: PHOTO WORKSHEET UPLOAD & QUICK GENERATE PRESET */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
              {/* Photo Upload / OCR Box */}
              <div className="p-3 bg-[#f2f8f5] border border-[#a2cfb8] rounded-2xl space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#012d1d]" />
                    <span className="font-extrabold text-xs text-[#012d1d]">
                      Cargar Foto de Planilla de Campo (OCR IA)
                    </span>
                  </div>
                  <label className="bg-[#012d1d] hover:bg-[#1b4332] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5 text-[#ffba38]" />
                    <span>Seleccionar / Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoWorksheetUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {worksheetScanNotice && (
                  <div className={`p-2 rounded-xl text-[11px] font-mono font-bold flex items-center gap-2 ${
                    isScanningWorksheet
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    <ScanLine className="w-4 h-4 shrink-0" />
                    <span>{worksheetScanNotice}</span>
                  </div>
                )}
              </div>

              {/* Preset Generator Control */}
              <div className="p-3 bg-[#f8f9f8] border border-[#c1c8c2] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#012d1d] flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-[#012d1d]" />
                    Generador Masivo de Lote Base
                  </span>
                  <button
                    type="button"
                    onClick={() => generateBatchDraftList()}
                    className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Regenerar {batchCount} Filas
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <label className="block text-[#717973] font-bold">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={batchCount}
                      onChange={(e) => setBatchCount(Number(e.target.value))}
                      className="w-full p-1 bg-white border border-[#c1c8c2] rounded-lg font-mono font-bold text-center text-[#012d1d]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#717973] font-bold">Prefijo</label>
                    <input
                      type="text"
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value)}
                      className="w-full p-1 bg-white border border-[#c1c8c2] rounded-lg font-mono font-bold text-[#012d1d]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#717973] font-bold">Estado</label>
                    <select
                      value={batchStatus}
                      onChange={(e) => setBatchStatus(e.target.value as any)}
                      className="w-full p-1 bg-white border border-[#c1c8c2] rounded-lg font-bold text-[#012d1d]"
                    >
                      <option value="fecundado">Fecundado</option>
                      <option value="transferido">Transferido</option>
                      <option value="vitrificado">Vitrificado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#717973] font-bold">Ubicación</label>
                    <input
                      type="text"
                      value={batchCanister}
                      onChange={(e) => setBatchCanister(e.target.value)}
                      className="w-full p-1 bg-white border border-[#c1c8c2] rounded-lg font-bold text-[#012d1d]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BATCH ITEMS LIST TABLE (LOTE ENLISTADO) */}
            <div className="flex-1 overflow-hidden flex flex-col border border-[#c1c8c2] rounded-2xl bg-white shadow-inner">
              <div className="p-2.5 bg-[#012d1d] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-[#ffba38]">
                    Listado Individual de Embriones ({batchDraftItems.length} Registros)
                  </span>
                  <span className="text-[10px] text-[#c1ecd4]">
                    ({batchDraftItems.filter((i) => i.verifiedInPhysicalStraw).length} Verificados en Físico)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBulkVerifyStraws(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Verificar Todas
                  </button>

                  <button
                    type="button"
                    onClick={handleAddDraftRow}
                    className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Fila
                  </button>
                </div>
              </div>

              {/* Scrollable Table Body */}
              <div className="flex-1 overflow-auto p-1 custom-scrollbar">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#f2f4f2] text-[#012d1d] font-extrabold uppercase text-[10px] border-b border-[#c1c8c2] sticky top-0 z-10 shadow-xs">
                      <th className="p-2 text-center w-8">#</th>
                      <th className="p-2">Código Embrión</th>
                      <th className="p-2">N° Pajilla / Físico</th>
                      <th className="p-2">Vaca Donadora</th>
                      <th className="p-2">Semental (Padre)</th>
                      <th className="p-2">Estadio</th>
                      <th className="p-2">Calidad</th>
                      <th className="p-2">Estado</th>
                      <th className="p-2">Vaca Receptora</th>
                      <th className="p-2">Verificación Físico</th>
                      <th className="p-2 text-center w-16">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e2e2]">
                    {batchDraftItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-[#f8fbf9] transition-colors">
                        <td className="p-2 text-center font-mono font-bold text-[#717973]">
                          {idx + 1}
                        </td>

                        {/* Code */}
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={item.code}
                            onChange={(e) => handleUpdateDraftRow(idx, 'code', e.target.value)}
                            className="w-full p-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded font-mono font-bold text-xs text-[#012d1d]"
                          />
                        </td>

                        {/* Straw Number */}
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={item.strawNumber}
                            onChange={(e) => handleUpdateDraftRow(idx, 'strawNumber', e.target.value)}
                            placeholder="Ej: PAJ-801"
                            className="w-full p-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded font-mono font-bold text-xs text-[#012d1d]"
                          />
                        </td>

                        {/* Donor */}
                        <td className="p-1.5 min-w-[140px]">
                          <select
                            value={item.donorId}
                            onChange={(e) => handleUpdateDraftRow(idx, 'donorId', e.target.value)}
                            className="w-full p-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded font-bold text-[11px] text-[#012d1d]"
                          >
                            {donors.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.tagId} - {d.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Sire */}
                        <td className="p-1.5 min-w-[140px]">
                          <select
                            value={item.sireName}
                            onChange={(e) => handleUpdateDraftRow(idx, 'sireName', e.target.value)}
                            className="w-full p-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded font-bold text-[11px] text-[#012d1d]"
                          >
                            {semenInventory.map((s) => (
                              <option key={s.id} value={s.bullName}>
                                {s.bullName}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Stage */}
                        <td className="p-1.5 min-w-[120px]">
                          <select
                            value={item.stage}
                            onChange={(e) => handleUpdateDraftRow(idx, 'stage', e.target.value)}
                            className="w-full p-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded font-bold text-[10.5px] text-[#012d1d]"
                          >
                            <option value="Blastocisto Grado 1">Blastocisto G1</option>
                            <option value="Blastocisto Grado 2">Blastocisto G2</option>
                            <option value="Blastocisto Expandido">Blast. Expandido</option>
                            <option value="Mórula">Mórula</option>
                          </select>
                        </td>

                        {/* Quality */}
                        <td className="p-1.5">
                          <select
                            value={item.quality}
                            onChange={(e) => handleUpdateDraftRow(idx, 'quality', e.target.value)}
                            className="w-full p-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded font-bold text-[10.5px] text-[#012d1d]"
                          >
                            <option value="Excelente">Excelente</option>
                            <option value="Bueno">Bueno</option>
                            <option value="Regular">Regular</option>
                          </select>
                        </td>

                        {/* Status */}
                        <td className="p-1.5 min-w-[100px]">
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateDraftRow(idx, 'status', e.target.value)}
                            className={`w-full p-1 rounded font-black text-[10.5px] ${
                              item.status === 'fecundado'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : item.status === 'transferido'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            <option value="fecundado">🟡 Fecundado</option>
                            <option value="transferido">🟣 Transferido</option>
                            <option value="vitrificado">🟢 Vitrificado</option>
                          </select>
                        </td>

                        {/* Receptor */}
                        <td className="p-1.5 min-w-[130px]">
                          <select
                            value={item.receptorTag}
                            onChange={(e) => handleUpdateDraftRow(idx, 'receptorTag', e.target.value)}
                            disabled={item.status !== 'transferido'}
                            className="w-full p-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded font-bold text-[10.5px] text-[#012d1d] disabled:opacity-40"
                          >
                            <option value="">-- Receptora --</option>
                            {receptors.map((r) => (
                              <option key={r.id} value={`${r.tagId} (${r.name})`}>
                                {r.tagId} - {r.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Physical Verification Switch */}
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateDraftRow(idx, 'verifiedInPhysicalStraw', !item.verifiedInPhysicalStraw)}
                            className={`w-full px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors border ${
                              item.verifiedInPhysicalStraw
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            {item.verifiedInPhysicalStraw ? '✓ Verificada' : '⚠️ Pendiente'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-1.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicateDraftRow(idx)}
                              className="text-[#717973] hover:text-[#012d1d] p-1 rounded hover:bg-slate-200"
                              title="Duplicar Fila"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveDraftRow(idx)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="Eliminar Fila"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#e2e2e2] shrink-0">
              <div className="text-xs font-bold text-[#012d1d] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Resumen: <strong>{batchDraftItems.length}</strong> embriones listados |{' '}
                  <strong className="text-emerald-700">
                    {batchDraftItems.filter((i) => i.verifiedInPhysicalStraw).length}
                  </strong>{' '}
                  verificados en físico.
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowBatchEmbryoModal(false)}
                  className="w-1/2 sm:w-auto px-4 py-2.5 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl hover:bg-slate-200 cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBatchEmbryos}
                  className="w-1/2 sm:w-auto px-6 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-black rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                  Guardar Lote Enlistado ({batchDraftItems.length} Unidades)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PLANILLA DE CAMPO & REPORTE PDF DE TRANSFERENCIA */}
      {showPrintReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar border-2 border-[#012d1d]">
            {/* Header controls (Hidden during print) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#e2e2e2] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#012d1d]">
                    Planilla de Campo para Transferencia de Embriones
                  </h3>
                  <p className="text-[11px] text-[#717973]">
                    Documento de trabajo para aplicar la transferencia en físico en la manga/cepo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintReportModal(false)}
                  className="p-2 text-[#717973] hover:text-black cursor-pointer rounded-xl bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editable Field Report Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f8f9f8] p-3 rounded-2xl border border-[#e2e2e2] text-xs">
              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Nombre de Ganadería / Finca:</label>
                <input
                  type="text"
                  value={reportFarmName}
                  onChange={(e) => setReportFarmName(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Veterinario / Técnico Responsable:</label>
                <input
                  type="text"
                  value={reportVeterinarian}
                  onChange={(e) => setReportVeterinarian(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Protocolo / Lote de Trabajo:</label>
                <input
                  type="text"
                  value={reportProtocolName}
                  onChange={(e) => setReportProtocolName(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                />
              </div>
            </div>

            {/* PRINTABLE REPORT PREVIEW CONTAINER */}
            <div id="printableFieldReport" className="p-6 bg-white border-2 border-[#012d1d] rounded-2xl space-y-4 text-black">
              {/* Report Header */}
              <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">
                    BOVINO PRO - TECNOLOGÍA EN REPRODUCCIÓN ANIMAL
                  </span>
                  <h2 className="text-lg font-black uppercase text-black tracking-tight">
                    PLANILLA TÉCNICA DE CAMPO - TRANSFERENCIA DE EMBRIONES FIV
                  </h2>
                  <p className="text-xs font-bold text-slate-800">
                    {reportFarmName}
                  </p>
                </div>
                <div className="text-right text-xs font-mono border-l-2 border-black pl-4 space-y-0.5">
                  <div><strong>Fecha Trabajo:</strong> {new Date().toLocaleDateString('es-ES')}</div>
                  <div><strong>Protocolo:</strong> {reportProtocolName}</div>
                  <div><strong>Responsable:</strong> {reportVeterinarian}</div>
                </div>
              </div>

              {/* Instructions Banner for Field Operator */}
              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-[10.5px] font-sans flex items-center justify-between">
                <span>
                  <strong>Indicaciones de Manga:</strong> Evaluar Cuerpo Lúteo (CL Der/Izq) y Condición Corporal (CC 1-5). Marcar con <strong>[X]</strong> en la casilla 'Aplicado' tras depositar el embrión en el cuerno ipsilateral al CL.
                </span>
                <span className="font-mono font-bold text-slate-700">Total: {embryos.length} Embriones</span>
              </div>

              {/* Field Printable Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-black text-[10.5px] font-mono">
                  <thead>
                    <tr className="bg-slate-200 text-black border-b-2 border-black font-black uppercase">
                      <th className="p-2 border border-black text-center w-8">#</th>
                      <th className="p-2 border border-black">Código Embrión</th>
                      <th className="p-2 border border-black">Estadio / Calidad</th>
                      <th className="p-2 border border-black">Genética (Donadora x Padre)</th>
                      <th className="p-2 border border-black">Canastilla / Pajilla</th>
                      <th className="p-2 border border-black">Vaca Receptora</th>
                      <th className="p-2 border border-black text-center w-20">CL (I/D)</th>
                      <th className="p-2 border border-black text-center w-14">CC</th>
                      <th className="p-2 border border-black text-center w-20">Aplicado</th>
                      <th className="p-2 border border-black">Observación / Firma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {embryos.map((emb, idx) => (
                      <tr key={emb.id} className="border-b border-black">
                        <td className="p-2 border border-black text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border border-black font-black">{emb.code}</td>
                        <td className="p-2 border border-black">{emb.stage} ({emb.quality})</td>
                        <td className="p-2 border border-black text-[10px]">
                          <strong>M:</strong> {emb.donorName}<br />
                          <strong>P:</strong> {emb.sireName}
                        </td>
                        <td className="p-2 border border-black">{emb.lotCanister || 'Termo 1'}</td>
                        <td className="p-2 border border-black font-bold">
                          {emb.receptorTag || '[   ] Sin Asignar'}
                        </td>
                        <td className="p-2 border border-black text-center font-bold text-slate-400">
                          [ &nbsp;&nbsp;&nbsp;&nbsp; ]
                        </td>
                        <td className="p-2 border border-black text-center font-bold text-slate-400">
                          [ &nbsp;&nbsp; ]
                        </td>
                        <td className="p-2 border border-black text-center">
                          <span className="inline-block w-4 h-4 border border-black rounded-sm align-middle"></span>
                          <span className="ml-1 font-bold">Sí</span>
                        </td>
                        <td className="p-2 border border-black text-[9.5px] text-slate-500 italic">
                          ___________________
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Notes Block */}
              <div className="pt-6 grid grid-cols-2 gap-8 border-t-2 border-black text-xs font-mono">
                <div className="space-y-10">
                  <div>
                    <p className="font-bold mb-1">Notas de Manga / Observaciones Adicionales:</p>
                    <div className="border border-slate-300 rounded p-2 text-slate-400 text-[10px]">
                      .........................................................................................................................................................<br />
                      .........................................................................................................................................................
                    </div>
                  </div>
                  <div className="border-t border-black pt-1 text-center">
                    <p className="font-bold text-black">{reportVeterinarian}</p>
                    <p className="text-[10px] text-slate-600">Médico Veterinario Transferidor / M.P.</p>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <p className="font-bold mb-1">Resumen Estadístico del Trabajo:</p>
                    <div className="border border-slate-300 rounded p-2 text-[10.5px] space-y-1">
                      <div className="flex justify-between"><span>Embriones Programados:</span><strong>{embryos.length}</strong></div>
                      <div className="flex justify-between"><span>Receptoras Transferidas:</span><strong>{embryos.filter(e => e.status === 'transferido').length}</strong></div>
                      <div className="flex justify-between"><span>Vitrificados / Reserva:</span><strong>{embryos.filter(e => e.status === 'vitrificado').length}</strong></div>
                    </div>
                  </div>
                  <div className="border-t border-black pt-1 text-center">
                    <p className="font-bold text-black">Administración de la Ganadería</p>
                    <p className="text-[10px] text-slate-600">Firma del Propietario / Gerente de Producción</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e2e2]">
              <button
                type="button"
                onClick={() => setShowPrintReportModal(false)}
                className="px-5 py-2 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Exportar a PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR EMBRIÓN EN FORMA CIRCULAR */}
      {showCreateEmbryoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar border-2 border-[#012d1d]">
            <div className="flex justify-between items-center border-b border-[#e2e2e2] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-black shadow-md">
                  <Dna className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#012d1d]">
                    Crear Nuevo Embrión (Representación Circular)
                  </h3>
                  <p className="text-[11px] text-[#717973]">
                    Define la genética (Donadora & Semental), estadio celular y estado de conservación o transferencia.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCreateEmbryoModal(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmbryo} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Código / Arete de Embrión *</label>
                <input
                  type="text"
                  required
                  value={newEmbryoCode}
                  onChange={(e) => setNewEmbryoCode(e.target.value)}
                  placeholder={`Ej: EMB-2026-FIV-0${embryos.length + 1}`}
                  className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-mono font-bold text-xs text-[#012d1d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Vaca Donadora (Madre) *</label>
                  <select
                    value={newEmbryoDonorId}
                    onChange={(e) => setNewEmbryoDonorId(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                  >
                    {donors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.tagId} - {d.name} ({d.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Semental / Toro (Padre) *</label>
                  <select
                    value={newEmbryoSireName}
                    onChange={(e) => setNewEmbryoSireName(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                  >
                    {semenInventory.map((s) => (
                      <option key={s.id} value={s.bullName}>
                        {s.bullName} ({s.breed})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Fecha de Fecundación FIV *</label>
                  <input
                    type="date"
                    required
                    value={newEmbryoFecundationDate}
                    onChange={(e) => setNewEmbryoFecundationDate(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-mono font-bold text-xs text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Estadio Celular *</label>
                  <select
                    value={newEmbryoStage}
                    onChange={(e) => setNewEmbryoStage(e.target.value as any)}
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                  >
                    <option value="Blastocisto Grado 1">Blastocisto Grado 1 (Excelente)</option>
                    <option value="Blastocisto Grado 2">Blastocisto Grado 2 (Bueno)</option>
                    <option value="Blastocisto Expandido">Blastocisto Expandido</option>
                    <option value="Mórula">Mórula Temprana</option>
                  </select>
                </div>
              </div>

              {/* ESTADO CON CODIFICACIÓN DE COLOR */}
              <div className="p-3 bg-[#f4fbf7] border-2 border-[#012d1d]/20 rounded-2xl space-y-2">
                <label className="block font-black text-[#012d1d] text-xs uppercase tracking-wider">
                  Estado Actual del Embrión & Color Asignado *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewEmbryoStatus('fecundado')}
                    className={`p-2.5 rounded-xl text-[11px] font-black border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      newEmbryoStatus === 'fecundado'
                        ? 'bg-amber-500 text-white border-amber-300 ring-2 ring-amber-400 shadow-md'
                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-amber-300 border border-white"></span>
                    🟡 Fecundado
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewEmbryoStatus('transferido')}
                    className={`p-2.5 rounded-xl text-[11px] font-black border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      newEmbryoStatus === 'transferido'
                        ? 'bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400 shadow-md'
                        : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-purple-300 border border-white"></span>
                    🟣 Transferido
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewEmbryoStatus('vitrificado')}
                    className={`p-2.5 rounded-xl text-[11px] font-black border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      newEmbryoStatus === 'vitrificado'
                        ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400 shadow-md'
                        : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-300 border border-white"></span>
                    🟢 Vitrificado
                  </button>
                </div>
              </div>

              {newEmbryoStatus === 'transferido' && (
                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Vaca Receptora Asignada *</label>
                  <select
                    value={newEmbryoReceptorTag}
                    onChange={(e) => setNewEmbryoReceptorTag(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                  >
                    <option value="">-- Seleccionar Receptora --</option>
                    {receptors.map((r) => (
                      <option key={r.id} value={`${r.tagId} (${r.name})`}>
                        {r.tagId} - {r.name} ({r.breed})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Ubicación / Canastilla Termo</label>
                  <input
                    type="text"
                    value={newEmbryoCanister}
                    onChange={(e) => setNewEmbryoCanister(e.target.value)}
                    placeholder="Ej: Termo 1 / Canastilla A-3"
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-semibold text-xs text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#012d1d] mb-1">Calidad Morfológica</label>
                  <select
                    value={newEmbryoQuality}
                    onChange={(e) => setNewEmbryoQuality(e.target.value as any)}
                    className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl font-bold text-xs text-[#012d1d]"
                  >
                    <option value="Excelente">Excelente (Grado 1)</option>
                    <option value="Bueno">Bueno (Grado 2)</option>
                    <option value="Regular">Regular (Grado 3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Observaciones / Detalles OPU</label>
                <input
                  type="text"
                  value={newEmbryoNotes}
                  onChange={(e) => setNewEmbryoNotes(e.target.value)}
                  placeholder="Ej: Producido por fertilización in vitro día 7..."
                  className="w-full p-2.5 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl text-xs text-[#012d1d]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e2e2]">
                <button
                  type="button"
                  onClick={() => setShowCreateEmbryoModal(false)}
                  className="px-4 py-2 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                  Guardar Embrión Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETALLE & CAMBIO DE ESTADO DE EMBRIÓN CIRCULAR */}
      {selectedEmbryoDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 border-2 border-[#012d1d]">
            <div className="flex justify-between items-start border-b border-[#e2e2e2] pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-white shadow-md ${
                    selectedEmbryoDetail.status === 'fecundado'
                      ? 'bg-amber-500 border-amber-200'
                      : selectedEmbryoDetail.status === 'transferido'
                      ? 'bg-purple-600 border-purple-200'
                      : 'bg-emerald-600 border-emerald-200'
                  }`}
                >
                  {selectedEmbryoDetail.status === 'fecundado' ? '🟡' : selectedEmbryoDetail.status === 'transferido' ? '🟣' : '🟢'}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#717973]">
                    {selectedEmbryoDetail.code}
                  </span>
                  <h3 className="text-base font-black text-[#012d1d]">
                    {selectedEmbryoDetail.stage}
                  </h3>
                </div>
              </div>
              <button onClick={() => setSelectedEmbryoDetail(null)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f8f9f8] rounded-xl border border-[#e2e2e2] space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#717973]">Estado Actual:</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded text-[10.5px] uppercase ${
                      selectedEmbryoDetail.status === 'fecundado'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : selectedEmbryoDetail.status === 'transferido'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {selectedEmbryoDetail.status === 'fecundado'
                      ? 'Fecundado In Vitro'
                      : selectedEmbryoDetail.status === 'transferido'
                      ? 'Transferido a Receptora'
                      : 'Vitrificado en Nitrógeno'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#717973]">Madre Donadora:</span>
                  <span className="font-bold text-[#012d1d]">{selectedEmbryoDetail.donorName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#717973]">Padre Semental:</span>
                  <span className="font-bold text-[#012d1d]">{selectedEmbryoDetail.sireName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#717973]">Fecha Fecundación:</span>
                  <span className="font-bold text-[#012d1d]">{selectedEmbryoDetail.fecundationDate}</span>
                </div>

                {selectedEmbryoDetail.receptorTag && (
                  <div className="flex justify-between">
                    <span className="text-[#717973]">Receptora Asignada:</span>
                    <span className="font-bold text-purple-800">{selectedEmbryoDetail.receptorTag}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-[#717973]">Ubicación / Canastilla:</span>
                  <span className="font-bold text-[#012d1d]">{selectedEmbryoDetail.lotCanister || 'Termo 1'}</span>
                </div>
              </div>

              {/* Cambiar Estado Directamente */}
              <div className="p-3 bg-[#f4fbf7] border border-[#c1ecd4] rounded-xl space-y-2">
                <label className="block font-black text-[#012d1d] text-[11px] uppercase tracking-wider">
                  Cambiar Estado del Embrión:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateEmbryoStatus(selectedEmbryoDetail.id, 'fecundado');
                      setSelectedEmbryoDetail(null);
                    }}
                    className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[10.5px] cursor-pointer"
                  >
                    🟡 Fecundado
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateEmbryoStatus(selectedEmbryoDetail.id, 'transferido');
                      setSelectedEmbryoDetail(null);
                    }}
                    className="flex-1 py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10.5px] cursor-pointer"
                  >
                    🟣 Transferido
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateEmbryoStatus(selectedEmbryoDetail.id, 'vitrificado');
                      setSelectedEmbryoDetail(null);
                    }}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10.5px] cursor-pointer"
                  >
                    🟢 Vitrificado
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#e2e2e2]">
              <button
                type="button"
                onClick={() => setSelectedEmbryoDetail(null)}
                className="px-5 py-2 bg-[#012d1d] text-white font-black rounded-xl text-xs hover:bg-[#1b4332] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: PROTOTYPE PHOTO FULL VIEW */}
      {viewingPrototypePhoto && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 md:p-5 space-y-4 shadow-2xl border-2 border-[#012d1d] flex flex-col">
            <div className="flex justify-between items-center border-b border-[#e2e2e2] pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#012d1d]" />
                <h3 className="font-black text-[#012d1d] text-base md:text-lg">
                  Prototipo Racial: {viewingPrototypePhoto.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingPrototypePhoto(null)}
                className="text-[#717973] hover:text-black p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative max-h-[72vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center border border-[#012d1d]">
              <img
                src={viewingPrototypePhoto.url}
                alt={viewingPrototypePhoto.title}
                className="max-h-[72vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#e2e2e2] text-xs text-[#717973]">
              <span className="font-mono font-bold text-[#012d1d]">
                Fotografía de Referencia Prototípica • Sistema GanaderIA
              </span>
              <button
                type="button"
                onClick={() => setViewingPrototypePhoto(null)}
                className="bg-[#012d1d] text-white px-5 py-2 rounded-xl font-black hover:bg-[#1b4332] cursor-pointer shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
