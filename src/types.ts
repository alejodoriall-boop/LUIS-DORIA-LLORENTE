export type MainTab =
  | 'home'
  | 'cattle'
  | 'buffalo'
  | 'sales'
  | 'dairy'
  | 'genetics'
  | 'equines'
  | 'herd_traceability'
  | 'gis'
  | 'aforo'
  | 'finance'
  | 'payroll'
  | 'rainfall'
  | 'inventory'
  | 'calf_rearing'
  | 'supplementation'
  | 'analytics_report'
  | 'admin'
  | 'menu';

export type SexType = 'toro' | 'vaca' | 'novillo' | 'vaquillona' | 'ternero' | 'ternera';
export type LivestockSexCode = 'TO' | 'VE' | 'HV' | 'HL' | 'ML' | 'MC' | 'VP';
export type LotCategory = 'ceba' | 'cria' | 'leche' | 'genetica';

// ==========================================
// GIS, GEOREFERENCING & PADDOCK MODELS
// ==========================================

export type TopographyType = 'plana' | 'ondulada' | 'ladera_suave' | 'escarpada';
export type FloodRiskLevel = 'ninguno' | 'bajo' | 'medio' | 'alto';
export type PaddockStatus = 'ocupado' | 'descanso' | 'listo' | 'recuperacion' | 'inundado';
export type FenceType = 'electrica' | 'puas' | 'viva' | 'malla';
export type WaterSourceType = 'bebedero_gravedad' | 'bebedero_bomba' | 'quebrada' | 'reservorio' | 'sin_agua';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export type FarmProductionType =
  | 'ceba'
  | 'cria'
  | 'doble_proposito'
  | 'lecheria_especializada'
  | 'genetica_pura';

export interface FarmGeoProfile {
  id: string;
  name: string;
  legalOwner: string;
  registrationNumber: string; // e.g. ICA / SENASA
  cadastralCode: string;
  department: string;
  municipality: string;
  vereda: string;
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
  elevationMsnm: number;
  totalAreaHa: number;
  totalPerimeterM: number;
  perimeterPolygon: GeoCoordinate[];
  importedFileName?: string;
  lastUpdated: string;
  productionType?: FarmProductionType;
  headsCount?: number;
  paddocksCount?: number;
  contactPhone?: string;
  notes?: string;
  isDefault?: boolean;
  colorTag?: string;
  isDisabled?: boolean;
}

export interface FarmDataPackage {
  profile: FarmGeoProfile;
  paddocks: PaddockGeo[];
  contours: ContourLine[];
  floodZones: FloodZoneFeature[];
  waterInfra: WaterInfrastructure;
  lots: LotRecord[];
  headsCount: number;
  dairyData?: DairyRecord;
}

export interface CreateFarmInput {
  name: string;
  legalOwner: string;
  registrationNumber: string;
  cadastralCode: string;
  department: string;
  municipality: string;
  vereda: string;
  totalAreaHa: number;
  elevationMsnm: number;
  centerLat: number;
  centerLng: number;
  productionType: FarmProductionType;
  initialPaddocksCount: number;
  predominantPasture: string;
  fenceType: FenceType;
  contactPhone?: string;
  notes?: string;
}

export interface SoilAnalysis {
  soilType: string; // e.g. 'Franco Arcilloso', 'Vertisol', 'Oxisol'
  ph: number; // e.g. 5.6
  organicMatterPct: number; // e.g. 4.2%
  phosphorusPpm: number; // e.g. 18 ppm
  potassiumMeq: number; // e.g. 0.35 meq/100g
  cationExchangeCap: number; // CIC e.g. 22.5
  aluminumSaturationPct: number; // % Sat Al e.g. 12%
  fertilityLevel: 'alta' | 'media' | 'baja' | 'critica';
  limingRecommendationTonHa: number; // Ton/Ha Cal dolomítica
  fertilizerRecommendation: string;
}

export interface PaddockGeo {
  id: string;
  code: string;
  name: string;
  polygon: GeoCoordinate[];
  color: string;
  areaHa: number;
  areaM2: number;
  perimeterM: number;
  fenceType: FenceType;
  pastureType: string; // e.g. 'Brachiaria Brizantha', 'Panicum Mombasa'
  pastureCondition: 'excelente' | 'bueno' | 'regular' | 'degradado';
  topography: TopographyType;
  avgSlopePct: number; // %
  elevationMsnm: number;
  
  // Flood and environmental
  isFloodProne: boolean;
  floodRisk: FloodRiskLevel;
  drainageChannel: boolean;

  // Soil survey
  soilAnalysis: SoilAnalysis;

  // Water supply
  waterAccess: boolean;
  waterSource: WaterSourceType;
  waterTroughDistanceM: number; // Max distance to water point
  troughCapacityLiters: number;
  flowRateLpm: number;

  // Forage & Carrying capacity (Aforo y Zootecnia)
  forageYieldKgM2: number; // Aforo de forraje verde kg/m²
  forageTotalTon: number; // Toneladas de pasto verde total
  dryMatterPct: number; // % Materia Seca (ej. 20%)
  grazingEfficiencyPct: number; // % Aprovechamiento real (ej. 65%)
  residualHeightCm: number; // Altura de remanente recomendada
  restDaysTarget: number; // Días óptimos de descanso
  occupancyDaysTarget: number; // Días óptimos de ocupación (ej. 1 a 3)
  carryingCapacityUGG: number; // Capacidad instantánea en Unidades Gran Ganado (450kg)
  carryingCapacityUGGPerHa: number; // UGG / Ha
  maxHeadsRecommended: number; // Cabezas máximas según peso lote

  // Operational state
  status: PaddockStatus;
  assignedLotId?: string;
  assignedLotName?: string;
  currentHeads?: number;
  currentLotCategory?: LotCategory;
  daysInOccupancy: number;
  daysInRest: number;
  entryDate?: string;
  targetExitDate?: string;
  notes?: string;
}

export interface ContourLine {
  id: string;
  elevationMsnm: number;
  isMajor: boolean; // Major lines (e.g. every 20m) vs Minor (every 5m)
  points: GeoCoordinate[];
}

export interface FloodZoneFeature {
  id: string;
  name: string;
  type: 'humedal' | 'bajio' | 'rio' | 'quebrada' | 'reservorio';
  polygon?: GeoCoordinate[];
  linePath?: GeoCoordinate[];
  riskSeason: 'invierno' | 'permanente' | 'ninguno';
  bufferProtectionM: number;
  description: string;
}

export interface WaterPipeline {
  id: string;
  name: string;
  diameterInches: string; // e.g. "2 pulgadas", "1 pulgada"
  material: 'PVC' | 'Polietileno Alta Densidad (HDPE)' | 'Galvanizado';
  pressureType: 'gravedad' | 'presurizado_bomba';
  lengthM: number;
  path: GeoCoordinate[];
}

export interface WaterInfrastructure {
  troughs: {
    id: string;
    name: string;
    type: 'circular' | 'rectangular' | 'movil';
    capacityLiters: number;
    hasFloatValve: boolean;
    location: GeoCoordinate;
    flowRateLpm: number;
    servesPaddockCodes: string[];
  }[];
  tanks: {
    id: string;
    name: string;
    capacityLiters: number;
    elevationMsnm: number;
    type: 'tanque_elevado' | 'reservorio_australiano' | 'tanque_plastico';
    location: GeoCoordinate;
  }[];
  sources: {
    id: string;
    name: string;
    type: 'pozo_profundo' | 'nacimiento' | 'rio' | 'jaguey';
    capacityM3: number;
    pumpType: 'solar' | 'electrica' | 'ariete' | 'ninguna';
    location: GeoCoordinate;
  }[];
  pipelines: WaterPipeline[];
}

export interface GISLayerVisibility {
  satellite: boolean;
  paddocks: boolean;
  paddockLabels: boolean;
  contourLines: boolean;
  floodZones: boolean;
  soilAnalysis: boolean;
  waterNetwork: boolean;
  waterTroughBuffers: boolean;
  fences: boolean;
  occupancyHeatmap: boolean;
}

export interface DepMetric {
  code: string;
  name: string;
  value: string;
  precision: number;
  progressPercent: number;
  description: string;
}

export interface ReproductiveEvent {
  id: string;
  type: 'IA' | 'Monta Natural' | 'Transferencia Embrionaria' | 'Palpación' | 'Parto' | 'Celo' | 'Secado';
  date: string;
  lotOrCow: string;
  details: string;
  status: 'Exitoso' | 'Preñez Confirmada' | 'Excelente' | 'En Observación' | 'Alerta';
  iconType: 'science' | 'heart' | 'biotech' | 'check';
}

export type PhysiologicalStatus = 'Vaca parida' | 'Escampada/Horra' | 'Novilla de vientre' | 'Ternera';
export type ServiceType = 'IA' | 'Monta Natural' | 'TE / FIV';
export type ObservationMethod = 'Visual' | 'Parche/Pintura' | 'Podómetro' | 'Toro Recelador';
export type DeliveryType = 'Normal' | 'Distócico con asistencia' | 'Cesárea';
export type CalfCondition = 'Vivo' | 'Muerto' | 'Momificado';
export type PregnancyResult = 'Preñada' | 'Vacía' | 'Dudosa';

export interface CeloEventRecord {
  id: string;
  femaleId: string;
  femaleTag: string;
  date: string;
  time: string;
  intensity: 'Alta' | 'Media' | 'Baja';
  method: ObservationMethod;
  notes?: string;
}

export interface ServiceEventRecord {
  id: string;
  femaleId: string;
  femaleTag: string;
  date: string;
  serviceType: ServiceType;
  bullOrSemenId: string;
  technician?: string;
  donorId?: string;
  receptorId?: string;
  embryoType?: string;
  serviceNumber: number;
  notes?: string;
}

export interface PregnancyCheckRecord {
  id: string;
  femaleId: string;
  femaleTag: string;
  date: string;
  method: 'Palpación' | 'Ecografía';
  result: PregnancyResult;
  gestationalDaysEstimated: number;
  notes?: string;
}

export interface CalvingEventRecord {
  id: string;
  femaleId: string;
  femaleTag: string;
  realDate: string;
  deliveryType: DeliveryType;
  calfSex: 'Macho' | 'Hembra';
  birthWeightKg: number;
  condition: CalfCondition;
  calfTag?: string;
  notes?: string;
}

export interface DryingEventRecord {
  id: string;
  femaleId: string;
  femaleTag: string;
  scheduledDate: string;
  realDate: string;
  notes?: string;
}

export interface DonorCow {
  id: string;
  tagId: string;
  name: string;
  breed: string;
  totalOpuCollections: number;
  totalEmbryosProduced: fontNumber;
  viableEmbryosRate: number; // %
  status: 'Activa' | 'En Descanso' | 'Baja';
  lastOpuDate?: string;
  geneticsCategory: 'Puro Pedigrí' | 'F1 Superior' | 'Elite Hato';
}

type fontNumber = number;

export interface ReceptorCow {
  id: string;
  tagId: string;
  name: string;
  breed: string;
  femaleCategory?: 'Vaca' | 'Novilla';
  synchronizationStatus: 'Sincronizada' | 'En Celo Natural' | 'Pendiente' | 'No Apta (Sin CL)';
  lutealBodyQuality?: 'CL Grado 1 (Excelente)' | 'CL Grado 2 (Bueno)' | 'Sin CL';
  lastTransferDate?: string;
  assignedDonorId?: string;
  pregnancyStatus: 'Pendiente DG' | 'Gestante' | 'Vacía';
}

export interface SemenInventoryItem {
  id: string;
  bullName: string;
  codeOrRegister: string;
  breed: string;
  originType: 'Toro Propio Finca' | 'Semen Comprado (Termo)';
  supplierOrFarm?: string;
  tankCanister?: string;
  availableStraws: number;
  costPerStrawUsd?: number;
  purityScore?: string;
}

export interface SynchronizationProtocol {
  id: string;
  name: string;
  technique: 'IATF (Inseminación a Tiempo Fijo)' | 'TETF (Transferencia a Tiempo Fijo)';
  startDate: string;
  deviceWithdrawalDate: string;
  inseminationOrTransferDate: string;
  scheduledPalpationDate: string;
  femaleCount: number;
  selectedFemaleIds?: string[];
  femaleCategoryOverrides?: Record<string, 'Vaca' | 'Novilla'>;
  status: 'En Proceso' | 'Inseminado / Transferido' | 'Finalizado con DG';
  hormonalProtocolUsed: 'DIB + Benzoato + Prostaglandina' | 'CIDR + GnRH + PGF2a' | 'Otro';
  // Palpation Susceptibility & Expiration (30-day rule)
  palpationLotName?: string;
  palpationDate?: string; // YYYY-MM-DD date when females were palpated
  susceptibilityType?: 'Inseminación (IATF)' | 'Transferencia de Embriones (TETF)' | 'Ambas Susceptibles';
  expirationDays?: number; // Default 30 days
  isPalpationExpired?: boolean; // Derived or flagged if >30 days without sync
}

export interface EmbryoItem {
  id: string;
  code: string;
  donorId: string;
  donorName: string;
  sireName: string;
  fecundationDate: string;
  stage: 'Blastocisto Grado 1' | 'Blastocisto Grado 2' | 'Mórula' | 'Blastocisto Expandido';
  status: 'fecundado' | 'transferido' | 'vitrificado';
  receptorTag?: string;
  transferDate?: string;
  lotCanister?: string;
  quality: 'Excelente' | 'Bueno' | 'Regular';
  notes?: string;
  strawNumber?: string;
  verifiedInPhysicalStraw?: boolean;
  verificationDate?: string;
}

export interface ReproductiveFemale {
  id: string;
  tagId: string;
  name: string;
  breed: string;
  birthDate: string;
  physiologicalStatus: PhysiologicalStatus;
  lotName: string;
  sireName?: string;
  damName?: string;
  totalCalvings: number;
  lastCalvingDate?: string;
  lastServiceDate?: string;
  lastServiceType?: ServiceType;
  bullOrSemenUsed?: string;
  confirmedPregnancyDate?: string;
  gestationalDaysAccumulated?: number;
  fppDate?: string; // Fecha Probable de Parto (calculada ~283 días)
  servicesPerConception: number;
  epsMonths: number; // Edad Primer Servicio (meses)
  eppMonths: number; // Edad Primer Parto (meses)
  diasAbiertos: number; // DA
  iepDays: number; // Intervalo entre partos (días)
  diasEnLeche: number; // DEL
  alerts: string[];
}

export interface PedigreeAnimal {
  id: string;
  code: string;
  name: string;
  breed: string;
  category: string;
  sex: 'm' | 'f';
  birthDate: string;
  sire?: PedigreeAnimal;
  dam?: PedigreeAnimal;
  paternalGrandsire?: string;
  paternalGranddam?: string;
  maternalGrandsire?: string;
  maternalGranddam?: string;
  inbreedingCoeff: number;
  deps: DepMetric[];
  breeder: string;
  avatarUrl?: string;
  registryNumber: string;
  location: string;
  weight: number;
}

export interface LotRecord {
  id: string;
  code: string;
  name: string;
  category: LotCategory;
  categoryLabel: string;
  heads: number;
  sexLabel: string;
  ageRange: string;
  gdpCurrent: number; // kg/day
  currentAvgWeight: number; // kg
  targetWeight: number; // kg
  estDaysToExit: number;
  pastureType: string;
  notes: string;
  historyWeights: { date: string; weight: number }[];
  farmName?: string;
  farmId?: string;
  estimatedValueCop?: number;
  animals?: ImportedAnimalRecord[];
}

export type RfidChipStandard = 'FDX-B' | 'HDX';

export interface RfidMilkingConfig {
  mode: 'manual' | 'automated_rfid';
  standard: RfidChipStandard;
  readerBrand: 'Allflex' | 'Tru-Test' | 'Gallagher' | 'Datamars' | 'Agrident' | 'Panel Afimilk' | 'Panel DeLaval' | 'Genérica ISO 11784';
  connectionType: 'bluetooth' | 'wifi' | 'serial' | 'usb_baston';
  frequencyKhz: number;
  antennaLocation: 'puerta_entrada' | 'puesto_fosa' | 'brete_paso' | 'baston_manual';
  antennaSensitivity: 'alta' | 'media' | 'baja';
  autoCaptureMilk: boolean;
  beepConfirmation: boolean;
  withholdingAlert: boolean;
  autoPrescriptionWithdrawal?: boolean;
  withdrawalHandlingMethod?: 'desvio_automatico' | 'bloqueo_fosa';
  antiDuplicateSeconds: number;
}

export interface IndividualCowMilkingRecord {
  id: string;
  cowTag: string;
  eidChip: string;
  chipStandard: RfidChipStandard;
  cowName: string;
  breed?: string;
  lactationDays: number;
  stallsPuesto: string;
  targetMorningLiters: number;
  targetEveningLiters: number;
  recordedMorningLiters: number;
  recordedEveningLiters: number;
  fatPct: number;
  proteinPct: number;
  somaticCellK: number;
  hasMedicineAlert: boolean;
  medicineNotes?: string;
  prescriptionWithdrawalDaysRemaining?: number;
  prescriptionName?: string;
  prescriptionEndDate?: string;
  withdrawnLiters?: number;
  scannedAt?: string;
  status: 'en_espera' | 'en_puesto' | 'completado' | 'retenido_antibiotico';
}

export interface DairyRecord {
  date: string;
  morningLiters: number;
  morningDeltaPct: number;
  eveningLiters: number;
  eveningDeltaPct: number;
  totalLiters: number;
  fatPct: number;
  proteinPct: number;
  somaticCellCountK: number; // thousands
  activeMilkingCows: number;
  avgLitersPerCow: number;
  rfidConfig?: RfidMilkingConfig;
  cowMilkingList?: IndividualCowMilkingRecord[];
}

export type MastitisQuarterScore = 'negativo' | 'trazas' | 'positivo_1' | 'positivo_2' | 'positivo_3';
export type MastitisType = 'subclinica' | 'clinica_aguda' | 'clinica_cronica';
export type MastitisTestType = 'CMT (California Mastitis Test)' | 'Recuento Celular Somático (RCS)' | 'Observación Clínica (Grumos/Ubre Inflamada)' | 'Cultivo Microbiológico / Antibiograma';
export type MastitisStatus = 'en_tratamiento' | 'en_observacion' | 'curado' | 'cuarto_perdido';

export interface UdderQuarters {
  anteriorIzquierdo: MastitisQuarterScore; // Front Left (FL)
  anteriorDerecho: MastitisQuarterScore;   // Front Right (FR)
  posteriorIzquierdo: MastitisQuarterScore; // Rear Left (RL)
  posteriorDerecho: MastitisQuarterScore;   // Rear Right (RR)
}

export interface MastitisRecord {
  id: string;
  cowTag: string;
  cowName: string;
  eidChip?: string;
  testDate: string;
  testType: MastitisTestType;
  mastitisType: MastitisType;
  quarters: UdderQuarters;
  pathogenIsolated?: string; // e.g. Staphylococcus aureus, Streptococcus agalactiae, E. coli
  somaticCellCountK?: number;
  treatmentApplied: string;
  withdrawalDays: number;
  withdrawalStartDate: string;
  withdrawalEndDate: string;
  severity: 'critica' | 'moderada' | 'leve';
  status: MastitisStatus;
  veterinarian?: string;
  notes?: string;
}

export interface UpcomingCowEvent {
  id: string;
  tagId: string;
  cowName: string;
  eventType: 'Secado' | 'Parto' | 'IA' | 'Vacunación';
  estimatedDate: string;
  batch: string;
  status: 'pending' | 'completed';
  daysLeft: number;
}

export interface SanitarioAlert {
  id: string;
  type: 'vaccine' | 'withdrawal' | 'health';
  title: string;
  message: string;
  badge: string;
  daysRemaining?: number;
  lotAffected?: string;
  animalsCount?: number;
  severity: 'error' | 'warning' | 'info';
}

export type SanitaryCategory =
  | 'vacunacion_oficial'
  | 'vacunacion_reproductiva'
  | 'clostridiosis'
  | 'control_parasitario'
  | 'vitaminas_minerales'
  | 'podologia'
  | 'diagnostico_pruebas'
  | 'tratamiento_especifico';

export type SanitaryFrequency =
  | 'anual'
  | 'semestral'
  | 'trimestral'
  | 'mensual'
  | 'al_destete'
  | 'al_nacer'
  | 'al_secado'
  | 'pre_servicio'
  | 'estrategica'
  | 'unica';

export type SanitaryStatus =
  | 'programado'
  | 'urgente'
  | 'en_progreso'
  | 'completado'
  | 'vencido';

export interface SanitaryProtocol {
  id: string;
  farmId?: string;
  name: string;
  category: SanitaryCategory;
  targetGroup: string;
  frequency: SanitaryFrequency;
  productName: string;
  activeIngredient?: string;
  laboratory?: string;
  dosage: string;
  route: 'subcutanea' | 'intramuscular' | 'oral' | 'pour_on' | 'topica' | 'intramamaria' | 'ocular' | 'inmersion';
  meatWithdrawalDays: number;
  milkWithdrawalHoursOrDays: number;
  costPerDose: number;
  scheduledDate: string; // YYYY-MM-DD
  lastAppliedDate?: string; // YYYY-MM-DD
  nextScheduledDate?: string; // YYYY-MM-DD
  status: SanitaryStatus;
  icaRegistration?: string;
  batchNumber?: string;
  veterinarian?: string;
  notes?: string;
  autoCreateWithdrawal?: boolean;
}

export interface SanitaryApplicationRecord {
  id: string;
  protocolId?: string;
  farmId: string;
  farmName?: string;
  date: string; // YYYY-MM-DD
  treatmentName: string;
  category: SanitaryCategory;
  productName: string;
  laboratory?: string;
  batchNumber?: string;
  icaRegistration?: string;
  dosage: string;
  route: string;
  targetLotOrGroup: string;
  headcount: number;
  animalTags?: string[];
  meatWithdrawalDays: number;
  milkWithdrawalDays: number;
  costPerHead?: number;
  totalCost?: number;
  veterinarian: string;
  vetLicense?: string;
  notes?: string;
  adverseReactions?: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  subtitle: string;
  weightOrMetric: string;
  category: 'birth' | 'weigh' | 'dairy' | 'health' | 'genetics' | 'buffalo';
  timestamp: string;
}

export interface WithdrawalAnimal {
  id: string;
  tagId: string;
  name: string;
  medication: string;
  appliedDate: string;
  withdrawalDays: number;
  daysRemaining: number;
  reason: string;
  lot: string;
}

export type ScaleBrand = 'Tru-Test' | 'Gallagher' | 'Balanzas Hook' | 'Iconix' | 'Datamars' | 'Genérica';
export type ScaleConnectionType = 'bluetooth' | 'wifi' | 'serial';
export type ScaleStatus = 'connected' | 'disconnected' | 'connecting' | 'scanning';

export interface ScaleDevice {
  id: string;
  name: string;
  model: string;
  brand: ScaleBrand;
  connectionType: ScaleConnectionType;
  status: ScaleStatus;
  battery: number; // percentage (0-100)
  signal: number; // percentage (0-100)
  ipAddress?: string;
  port?: number;
  baudRate?: number;
  autoLockSeconds: number;
  isZeroTare: boolean;
  soundFeedback: boolean;
  rfidConnected: boolean;
  lastEIDTag?: string;
}

export interface ScaleReading {
  weight: number;
  isStable: boolean;
  isLocked: boolean;
  unit: 'kg' | 'lb';
  timestamp: string;
  rawFluctuation?: number;
}

export interface BatchWeighItem {
  id: string;
  animalTag: string;
  animalName?: string;
  lotId: string;
  weight: number;
  previousWeight: number;
  dailyGainKg: number;
  timestamp: string;
  eidTag?: string;
  notes?: string;
}

export type AnimalOriginType = 'nacido' | 'comprado' | 'puro_registro' | 'transferencia_entrada';

export interface PurebredRegistryInfo {
  association: string; // e.g., 'Asocebú', 'ASOHOLSTEIN', 'Asociación Angus & Brangus'
  registrationNumber: string; // N° Registro Oficial
  registeredName: string; // Nombre completo registrado
  sireName?: string; // Padre
  sireReg?: string; // Registro del Padre
  damName?: string; // Madre
  damReg?: string; // Registro de la Madre
  maternalGrandSire?: string; // Abuelo materno
  certificateUrl?: string;
}

export type BirthDeliveryType = 'eutocico' | 'distocico_asistido' | 'cesarea' | 'mortinato';
export type CalvingCondition = 'simple' | 'multiple'; // Cría simple o mellos/gemelos
export type ConceptionMethod = 'monta_natural' | 'ia' | 'iatf' | 'te_fiv';

export interface BornOnFarmInfo {
  // 1. Identificación y Datos Básicos
  tag?: string; // ID / Chapeta única (arete, SINIGAN/ICA o RFID)
  rfidTag?: string; // Chip RFID / DIN / SINIGAN
  birthDate: string; // Fecha exacta del parto
  birthTime?: string; // Hora exacta del parto (HH:mm)
  sex?: 'macho' | 'hembra'; // Sexo
  breed?: string; // Raza / Composición genética
  purityPct?: string; // Pura o % de cruce (ej. 100% Puro, 50% F1, 3/4)
  color?: string; // Color / Capa
  brandingIronId?: string; // Hierro / Marca a fuego
  brandingIronName?: string;

  // 2. Datos del Parto y Ternero
  birthWeightKg?: number; // Peso al nacer en kg
  deliveryType?: BirthDeliveryType; // Eutócico (normal), asistido, cesárea o mortinato
  calvingCondition?: CalvingCondition; // Cría simple o múltiple (mellos/gemelos)
  vigorScore?: number; // Vigor / vitalidad (escala 1 a 5)

  // 3. Genealogía
  damTag: string; // ID Madre Biológica (Chapeta)
  surrogateDamTag?: string; // ID Madre Receptora (si aplica para TE / FIV)
  sireTagOrBull?: string; // ID Padre (Toro de monta o código de pajilla IA/IATF)
  conceptionMethod?: ConceptionMethod; // Método de concepción: Monta natural, IA, IATF o TE

  // 4. Manejo Inicial y Ubicación
  colostrumFed?: boolean; // Calostro suministrado (Sí / No)
  colostrumHoursPostCalving?: number; // Tiempo posparto de toma de calostro (horas)
  navelDisinfected?: boolean; // Curación de ombligo realizada (Sí / No)
  initialTreatments?: string; // Tratamientos aplicados (Vitaminas, hierro, selenio, medicamentos)
  originFarmId?: string;
  originFarmName?: string; // Finca
  paddockMaternityName?: string; // Potrero / lote de maternidad
  operatorResponsible?: string; // Operario / responsable del registro
  earTagInitial?: string; // Chapeta inicial / oreja
  tattooNumber?: string; // Tatuaje inicial en oreja
  notes?: string;
}

export interface WeaningInfo {
  weaningDate: string; // Fecha de destete
  weaningWeightKg: number; // Peso registrado al destete
  weaningAgeMonths?: number; // Edad al destete en meses
  dailyGainKg?: number; // Ganancia diaria de peso predestete (GDP)
  brandType: 'hierro_caliente' | 'chapeta_definitiva' | 'tatuaje_oreja' | 'fuego_numerico';
  brandCode: string; // Hierro / Chapeta / Marca asignada en destete
  asocebuRegisterNumber?: string; // Registro Asocebú / Genealógico
  asocebuBook?: string; // Libro / Categoria Asocebú
  registeredNameAsocebu?: string; // Nombre oficial en Asocebú
  weaningNotes?: string;
}

export interface PurchasedInfo {
  supplierOrAuction: string; // Proveedor / Subasta / Vendedor
  purchaseDate: string; // Fecha de compra
  purchasePriceTotal?: number; // Costo total $
  purchasePricePerKg?: number; // $/kg
  purchaseWeightKg?: number; // Peso de compra
  invoiceOrReceipt?: string; // Guía / Factura
  sellerDoc?: string;
  sellerPhone?: string;
  sellerLocation?: string;
  sellerSanitaryStatus?: string;

  // Parámetros Zootécnicos de Nacimiento & Genealogía del animal comprado
  birthDate?: string;
  birthTime?: string;
  birthWeightKg?: number;
  deliveryType?: BirthDeliveryType;
  calvingCondition?: CalvingCondition;
  vigorScore?: number;
  damTag?: string;
  surrogateDamTag?: string;
  sireTagOrBull?: string;
  conceptionMethod?: ConceptionMethod;
  colostrumFed?: boolean;
  colostrumHoursPostCalving?: number;
  navelDisinfected?: boolean;
  initialTreatments?: string;
  originFarmName?: string;
  paddockMaternityName?: string;
  operatorResponsible?: string;
}

export interface ImportedAnimalRecord {
  id: string;
  tag: string; // Arete / ID Bovino / Número
  name?: string; // Nombre / Alias del animal
  weightKg: number; // Peso actual / entrada en kg
  sex: 'macho' | 'hembra';
  sexCode?: LivestockSexCode | string; // TO, VE, HV, HL, ML, MC, VP
  breed: string; // Raza / fenotipo (ej. Brahman Blanco, Nelore, Brangus, Gyr, Simbrah)
  category?: LotCategory | string;
  pricePerKg?: number; // Precio por kg COP
  totalPrice?: number; // Precio total
  movementGuideNumber?: string; // Guía de Movilización Sanitaria ICA / GSMI
  lotCode?: string; // Código de lote
  lotId?: string; // ID de lote
  farmId?: string; // Predio
  farmName?: string;
  paddockName?: string;
  ageMonths?: number; // Edad aproximada en meses
  color?: string; // Color / capa / pelaje
  cattleType?: 'ganado_comercial' | 'puro_registro' | 'cruzado_f1' | 'siete_colores' | string; // Tipo: Comercial, Puro, Cruzado
  origin?: string; // Procedencia / Vendedor
  notes?: string;

  // Hierro / Marca a fuego asignada
  brandingIronId?: string;
  brandingIronName?: string;
  brandingIronLocation?: string;
  brandingIronSymbol?: string;

  // Enriched Origin & Registration Info
  originType?: AnimalOriginType;
  bornInfo?: BornOnFarmInfo;
  weaningInfo?: WeaningInfo;
  purchasedInfo?: PurchasedInfo;
  purebredInfo?: PurebredRegistryInfo;

  // Commercial Purpose / Destination
  commercialDestination?: 'lecheria' | 'doble_proposito' | 'ceba_carne' | 'cria_levante' | 'genetica_reproductor' | 'reemplazo_finca' | string;

  // Status & Exit details
  status?: 'activo' | 'vendido' | 'muerto' | 'sacrificado' | 'transferido_externo';
  exitDate?: string;
  exitReason?: string;
  exitPriceTotal?: number;
  exitDestination?: string;

  // Category transition history
  categoryHistory?: {
    date: string;
    previousCategory: string;
    newCategory: string;
    reason: string;
    approvedBy?: string;
  }[];
}

export interface CategoryProgressionRule {
  id: string;
  ruleName: string;
  sourceCategory: string; // e.g. 'cria', 'levante', 'preceba', 'ternero'
  targetCategory: string; // e.g. 'ceba', 'finalizacion', 'novilla_vientre'
  targetCategoryLabel: string;
  minWeightKg: number; // e.g. 350 kg
  minAgeMonths: number; // e.g. 24 meses
  sexFilter?: 'macho' | 'hembra' | 'todos';
  description: string;
  isActive: boolean;
}

export interface CategoryTransitionAlert {
  id: string;
  animalId: string;
  animalTag: string;
  animalName?: string;
  sex: 'macho' | 'hembra';
  breed?: string;
  currentCategory: string;
  targetCategory: string;
  targetCategoryLabel: string;
  triggerType: 'peso' | 'edad' | 'ambos';
  triggerReason: string;
  currentWeightKg: number;
  currentAgeMonths: number;
  ruleMinWeightKg: number;
  ruleMinAgeMonths: number;
  detectedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  farmId?: string;
  farmName?: string;
  lotId?: string;
  lotCode?: string;
}

export interface LivestockMovementInput {
  movementType: 'transferencia_interna' | 'salida_muerte' | 'salida_sacrificio' | 'salida_venta' | 'rotacion_interna';
  animalIds?: string[];
  lotId?: string;
  lotName?: string;
  category?: LotCategory | string;
  categoryLabel?: string;
  sexLabel?: string;
  breed?: string;
  ageRange?: string;
  brandingIron?: string;
  commercialPurpose?: string;
  sourceFarmId?: string;
  sourceFarmName?: string;
  sourcePaddockId?: string;
  sourcePaddockName?: string;
  targetFarmId?: string; // Para transferencia interna a otro predio
  targetFarmName?: string;
  targetPaddockId?: string;
  targetPaddockName?: string;
  targetLotId?: string;
  headsMoved?: number;
  avgWeightKg?: number;
  totalWeightKg?: number;
  date: string;
  causeOrReason?: string; // ej. Muerte por enfermedad, Venta comercial, Subasta, etc.
  buyerOrDestination?: string; // Comprador / Destino / Matadero / Predio Destino
  buyerDoc?: string;
  buyerPhone?: string;
  salePriceTotal?: number; // En caso de venta
  salePricePerKg?: number;
  invoiceOrGuideNumber?: string;
  sanitaryClearanceVerified?: boolean;
  transporterName?: string;
  transporterPhone?: string;
  truckPlate?: string;
  freightCost?: number;
  dispatcherName?: string;
  receiverName?: string;
  notes?: string;
}

export interface NewLotRegistrationInput {
  farmId: string; // Predio asignado (e.g. 'finca-san-juan')
  lotName: string;
  category: LotCategory;
  categoryLabel?: string;
  sourceType: 'subasta' | 'compra_directa' | 'nacimiento_lote' | 'traslado' | 'inventario_inicial' | 'sociedad';
  sourceEntity?: string; // e.g. "Subastar S.A. - Planeta Rica", "Subacasanare", "Cogasucre"
  invoiceNumber?: string; // N° Factura / Liquidación
  movementGuideNumber?: string; // Guía Sanitaria de Movilización Interna ICA / GSMI
  purchaseDate: string;
  paddockId?: string; // Potrero asignado en el predio
  pricePerKg?: number;
  totalPrice?: number;
  freightCost?: number;
  heads: number;
  currentAvgWeight: number;
  targetWeight?: number;
  ageRange?: string;
  sexLabel?: string;
  sexCode?: LivestockSexCode | string;
  breed?: string;
  color?: string;
  brandingIronId?: string;
  brandingIron?: string;
  commercialPurpose?: string;
  sanitaryStatus?: string;
  pastureType?: string;
  sourceFarmName?: string;
  targetPaddockName?: string;
  sanitaryClearanceVerified?: boolean;
  partnerName?: string;
  partnerDoc?: string;
  partnerPhone?: string;
  shareScheme?: string;
  animals: ImportedAnimalRecord[];
  notes?: string;
}

// ==========================================
// PLUVIOMETRY / RAINFALL DATA MODELS
// ==========================================

export type RainIntensity = 'suave' | 'moderada' | 'fuerte' | 'torrencial';

export interface RainfallRecord {
  id: string;
  farmId: string;
  farmName?: string;
  date: string; // YYYY-MM-DD
  amountMm: number; // Precipitaciones en mm (L/m²)
  durationMinutes?: number;
  intensity?: RainIntensity;
  recordedBy?: string;
  notes?: string;
  timestamp?: string;
}

export interface DailyRainfallInput {
  farmId: string;
  date: string;
  amountMm: number;
  durationMinutes?: number;
  intensity?: RainIntensity;
  recordedBy?: string;
  notes?: string;
}

export interface MonthlyRainfallSummary {
  year: number;
  month: number; // 1-12
  monthLabel: string; // "Ene", "Feb", etc.
  totalMm: number;
  rainyDaysCount: number;
  maxDailyMm: number;
  avgDailyMm: number;
  historicalAvgMm?: number;
  differencePct?: number; // % deviation from historical average
}

export interface AnnualRainfallSummary {
  year: number;
  totalMm: number;
  rainyDaysCount: number;
  maxDailyMm: number;
  maxDailyDate?: string;
  monthlyBreakdown: MonthlyRainfallSummary[];
  wettestMonthName?: string;
  driestMonthName?: string;
}

// ==========================================
// WAREHOUSE & INVENTORY MODELS (ALMACÉN)
// ==========================================

export type InventoryCategory =
  | 'sales_nutricion'
  | 'concentrados_alimentos'
  | 'salud_veterinaria'
  | 'agroquimicos'
  | 'insumos_ordeno'
  | 'herramientas_equipos'
  | (string & {});

export interface CategoryInfo {
  id?: string;
  label: string;
  iconName: string;
  color: string;
  badgeBg: string;
  description?: string;
}

export type MovementType = 'entrada' | 'salida' | 'ajuste' | 'baja';

export interface InventoryItem {
  id: string;
  farmId: string;
  farmName?: string;
  name: string; // e.g. "Sal Mineralizada SLA 8% Ganadería"
  category: InventoryCategory;
  brand?: string;
  unit: string; // "Saco 40kg", "Frasco 500ml", "Dosis", "Bulto 50kg", "Rollo 500m"
  currentStock: number;
  minStockAlert: number; // Safety reorder threshold e.g. 5 sacos
  unitCostEstimate?: number; // COP $
  locationInStore?: string; // e.g. "Bodega 1 - Estante B"
  batchNumber?: string;
  expirationDate?: string; // YYYY-MM-DD
  supplierName?: string;
  lastRestockDate?: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  farmId: string;
  farmName?: string;
  type: MovementType;
  quantity: number;
  unit: string;
  stockAfter: number;
  date: string; // YYYY-MM-DD
  time?: string;
  registeredBy: string; // "Mayordomo Carlos", "Admin"
  reasonOrDestination?: string; // "Suministro Potrero 4 - Lote Ceba", "Factura #1042", "Vacunación Fiebre Aftosa"
  invoiceNumber?: string;
  notes?: string;
}

export interface InvoiceItemScan {
  itemName: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  unitCost?: number;
  batchNumber?: string;
  expirationDate?: string;
  confidenceScore?: number; // 0-100%
}

// ==========================================
// AFORO DE PASTOS Y CAPACIDAD DE CARGA
// ==========================================

export type AforoSeason = 'lluvia' | 'sequia' | 'transicion';

export interface AforoFrameCut {
  frameIndex: number;
  weightKg: number; // e.g. 1.25 kg
  heightCm?: number; // grass height in cm e.g. 45 cm
  qualityNote?: 'alto' | 'medio' | 'bajo';
}

export interface AforoSampling {
  id: string;
  farmId: string;
  farmName: string;
  paddockId: string;
  paddockName: string;
  paddockAreaHa: number;
  date: string; // YYYY-MM-DD
  samplerName: string; // "Mayordomo Carlos", "Ing. Agrónomo"
  grassType: string; // "Brachiaria decumbens", "Mombasa", "Guinea India", etc.
  season: AforoSeason;
  frameSizeM2: number; // 1.0, 0.5, 0.25 m²
  cuts: AforoFrameCut[];
  
  // Computed metrics
  avgWeightPerFrameKg: number; // average weight per frame
  avgGreenYieldKgM2: number; // kg/m² = avgWeight / frameSizeM2
  totalGreenYieldTonHa: number; // Ton/Ha = avgGreenYieldKgM2 * 10
  
  dryMatterPercentage: number; // default 20%
  grazingLossPercentage: number; // default 30% (pisoteo, rechazo, heces)
  
  usefulGreenYieldKgHa: number; // kg/ha usable green = totalGreenYieldTonHa * 1000 * (1 - loss%)
  usefulDryMatterKgHa: number; // kg/ha usable DM = usefulGreenYieldKgHa * (dryMatter% / 100)
  
  animalUnitWeightKg: number; // default 450 kg (1 UA)
  dailyGreenConsumptionPercentage: number; // default 10% (45 kg green forage/UA/day)
  
  recommendedGrazingDays: number; // days recommended for current herd
  recommendedRestDays: number; // days rest needed before re-grazing
  carryingCapacityUaHa: number; // capacity in UA/Ha
  
  currentAnimalsInPaddock?: number;
  currentUAsInPaddock?: number;
  statusAlert?: 'excelente' | 'adecuado' | 'riesgo_sobrepastoreo' | 'subaprovechado';
  
  notes?: string;
}

// ==========================================
// ANÁLISIS FINANCIERO POR HECTÁREA & UNIDADES DE NEGOCIO
// ==========================================

export type BusinessUnitId =
  | 'lecheria'
  | 'genetica'
  | 'crias'
  | 'ganado_comercial'
  | 'insumos_servicios'
  | 'corporativo_general';

export interface BusinessUnitInfo {
  id: BusinessUnitId;
  label: string;
  shortLabel: string;
  iconName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export type IncomeCategory =
  | 'venta_ganado'
  | 'venta_ganado_ceba'
  | 'venta_leche'
  | 'venta_genetica'
  | 'venta_embriones'
  | 'venta_animales_puro_registro'
  | 'venta_vacas_lecheras_registro'
  | 'venta_reproductores_toros'
  | 'venta_terneros'
  | 'servicio_monta_maquila'
  | 'subproductos'
  | 'otros_ingresos';

export type ExpenseCategory =
  | 'alimentacion_sales'
  | 'veterinaria_vacunas'
  | 'mantenimiento_pastos'
  | 'cercas_infraestructura'
  | 'mano_obra_directa'
  | 'compra_ganado'
  | 'fletes_transporte'
  | 'nomina_fija'
  | 'servicios_combustible'
  | 'impuestos_tasas'
  | 'arriendos_honorarios'
  | 'otros_gastos';

export interface FinancialTransaction {
  id: string;
  farmId: string;
  farmName: string;
  date: string; // YYYY-MM-DD
  type: 'ingreso' | 'egreso';
  costType?: 'directo' | 'fijo';
  category: IncomeCategory | ExpenseCategory;
  businessUnit?: BusinessUnitId;
  description: string;
  amount: number; // $ Total
  paddockId?: string;
  paddockName?: string;
  affectedAreaHa?: number; // Ha vinculadas, o total de la finca
  headcount?: number;
  kgOrLiters?: number;
}

export interface MonthlyFinancialRecord {
  year: number;
  month: number; // 1 - 12
  monthName: string; // "Ene", "Feb", ...
  farmId: string; // farmId or 'all'
  farmName: string;
  totalAreaHa: number;
  
  totalIncome: number;
  totalIncomePerHa: number; // $/Ha/mes
  
  totalDirectCosts: number;
  totalDirectCostsPerHa: number; // $/Ha/mes
  
  totalFixedCosts: number;
  totalFixedCostsPerHa: number; // $/Ha/mes
  
  grossMargin: number; // Income - Direct Costs
  grossMarginPerHa: number; // $/Ha/mes
  
  netProfit: number; // Income - Total Costs
  netProfitPerHa: number; // $/Ha/mes
  
  incomeByCategory: Record<string, number>;
  costsByCategory: Record<string, number>;
  
  producedKg: number;
  producedLiters: number;
  costPerKgProduced: number;
  costPerLiterProduced: number;
}

export interface AnnualFinancialSummary {
  year: number;
  farmId: string;
  farmName: string;
  totalAreaHa: number;
  
  totalIncomeAnnual: number;
  totalIncomePerHaAnnual: number; // $/Ha/año
  totalIncomePerHaMonthlyAvg: number; // $/Ha/mes promedio
  
  totalCostsAnnual: number;
  totalCostsPerHaAnnual: number; // $/Ha/año
  totalCostsPerHaMonthlyAvg: number; // $/Ha/mes promedio
  
  netProfitAnnual: number; // $/año
  netProfitPerHaAnnual: number; // $/Ha/año
  netProfitPerHaMonthlyAvg: number; // $/Ha/mes promedio
  
  roiPercentage: number; // % sobre inversión/activos
  operatingMarginPercentage: number; // % Margen operativo
  
  avgCarryingCapacityUaHa: number;
  producedKgAnnual: number;
  producedLitersAnnual: number;
  costPerKgAvg: number;
  costPerLiterAvg: number;
  
  monthlyBreakdown: MonthlyFinancialRecord[];
}

export interface ConsolidatedFinancialReport {
  periodLabel: string; // e.g., "Consolidado Multi-Predio 2024-2026"
  totalFarmsCount: number;
  combinedAreaHa: number;
  
  totalIncomeConsolidated: number;
  totalIncomePerHaAnnualAvg: number; // $/Ha/año
  totalIncomePerHaMonthlyAvg: number; // $/Ha/mes
  
  totalCostsConsolidated: number;
  totalCostsPerHaAnnualAvg: number; // $/Ha/año
  totalCostsPerHaMonthlyAvg: number; // $/Ha/mes
  
  netProfitConsolidated: number;
  netProfitPerHaAnnualAvg: number; // $/Ha/año
  netProfitPerHaMonthlyAvg: number; // $/Ha/mes
  
  farmComparisons: Array<{
    farmId: string;
    farmName: string;
    areaHa: number;
    productionType: string;
    incomeAnnual: number;
    incomePerHaAnnual: number;
    incomePerHaMonthly: number;
    costsAnnual: number;
    costsPerHaAnnual: number;
    costsPerHaMonthly: number;
    netProfitAnnual: number;
    netProfitPerHaAnnual: number;
    netProfitPerHaMonthly: number;
    profitMarginPercent: number;
    carryingCapacityUaHa: number;
  }>;
}

export interface BrandingIron {
  id: string;
  name: string; // Nombre / Código, ej: "Hierro Principal H1"
  code: string; // Código / Iniciales o Símbolo, ej: "H1", "GLD", "★"
  symbolIcon?: string; // Icono visual / Emoji o inicial (ej: "🔥", "👑", "⚡", "★", "✝", "⚓", "Ω", "H", "G", "T")
  bodyLocation: string; // Ubicación en el animal: "Anca Derecha", "Pierna Izquierda", "Paleta Derecha", "Ijar Derecho", etc.
  type?: 'propiedad' | 'ventanilla' | 'finca' | 'sanitario' | string; // Tipo de hierro
  registrationNumber?: string; // Número Registro ICA / RUP / Patente
  farmId?: string; // ID Finca asociada (opcional)
  farmName?: string; // Nombre Finca asociada
  imageUrl?: string; // Imagen o firma en data URL / SVG
  notes?: string;
  createdAt: string;
}

// ============================================================================
// MÓDULO DE NÓMINA & PERSONAL DE CAMPO (ENLAZADO A FINANZAS)
// ============================================================================

export type WorkerRole =
  | 'Administrador / Mayordomo'
  | 'Vaquero / Ordeñador'
  | 'Operario Maquinaria'
  | 'Jornalero / Temporal'
  | 'Veterinario / Zootecnista'
  | 'Auxiliar de Campo';

export type ContractType =
  | 'Término Indefinido'
  | 'Término Fijo'
  | 'Obra o Labor'
  | 'Fijo Mensual'
  | 'Jornal Diario'
  | 'Prestación de Servicios'
  | 'Destajo / Por Tarea'
  | 'Aprendizaje / Pasantía';

export interface Employee {
  id: string;
  farmId: string;
  farmName: string;
  documentId: string; // Cédula o NIT
  fullName: string;
  role: WorkerRole;
  contractType: ContractType;
  baseRate: number; // $ Base mensual o tarifa diaria
  dailyJornalRate?: number; // $ Tarifa fija por jornal diario
  paymentFrequency: 'Quincenal' | 'Mensual' | 'Semanal';
  bankName: string; // Bancolombia, Nequi, Daviplata, Efectivo
  bankAccount?: string;
  phone?: string;
  startDate: string;
  status: 'Activo' | 'Inactivo' | 'Vacaciones';
  socialSecurityNotes?: string;
  epsName?: string; // EPS (ej. Sura, Nueva EPS, Sanitas)
  pensionFund?: string; // Fondo de Pensión (ej. Porvenir, Protección, Colpensiones)
  arlRiskLevel?: string; // Nivel de Riesgo ARL (ej. Nivel III - Agropecuario 2.436%)
  cajaCompensacion?: string; // Caja de Compensación (ej. Comfama, Colsubsidio)
  ibcSalary?: number; // Ingreso Base de Cotización (IBC)
}

export interface SocialSecurityBreakdown {
  ibc: number; // Ingreso Base de Cotización
  epsName: string;
  pensionFund: string;
  arlRiskLevel: string;
  cajaCompensacion: string;
  workerHealth: number; // 4% Salud
  workerPension: number; // 4% Pensión
  employerHealth: number; // 8.5% Salud
  employerPension: number; // 12% Pensión
  employerArl: number; // ARL según nivel
  employerCaja: number; // 4% Caja Compensación
  employerSenaIcbf: number; // Parafiscales
  totalWorkerDeduction: number; // Total aportes empleado
  totalEmployerContribution: number; // Total aportes empleador
  totalCombined: number; // Total a pagar por este empleado
}

export interface PayrollItem {
  employeeId: string;
  employeeName: string;
  role: string;
  daysWorked: number;
  dailyJornalRate?: number; // Tarifa de jornal por día ($/jornal)
  jornalesCount?: number; // Número de jornales trabajados
  jornalTaskType?: string; // Tarea ejecutada (ej. Guadaña, Cercas, Limpieza)
  basePay: number;
  overtimeHours?: number;
  overtimePay: number;
  bonuses: number; // Bonificación por ordeño, nacimientos, metas
  deductions: number; // Anticipos, prestamos, aportes
  netPayable: number; // basePay + overtimePay + bonuses - deductions
  socialSecurity?: SocialSecurityBreakdown; // Desglose completo de Seguridad Social
  notes?: string;
}

export type PilaNovedadCode = 'NINGUNA' | 'SLN' | 'IGE' | 'LMA' | 'VAC' | 'VST' | 'ING' | 'RET';

export interface PilaItemNovedad {
  code: PilaNovedadCode;
  days?: number;
  startDate?: string;
  endDate?: string;
  newIbc?: number;
  notes?: string;
}

export interface PayrollRun {
  id: string;
  farmId: string; // Finca asociada
  farmName: string;
  periodName: string; // ej: "Nómina 1ra Quincena Agosto 2026"
  periodType: 'Quincenal' | 'Mensual' | 'Semanal' | 'Jornales / Ocasional' | 'Vacaciones' | 'Bonificaciones' | 'Cesantías';
  startDate: string;
  endDate: string;
  paymentDate: string;
  status: 'Borrador' | 'Aprobada' | 'Pagada';
  businessUnit: BusinessUnitId; // Default 'corporativo_general' or 'lecheria'
  items: PayrollItem[];
  totalBase: number;
  totalOvertime: number;
  totalBonuses: number;
  totalDeductions: number;
  totalNetPayable: number;
  totalSocialSecurityEmployer?: number; // Total aportes patronales
  pilaPin?: string; // PIN o número de planilla PILA
  pilaStatus?: 'Pendiente' | 'Pagada PSE';
  disbursementStatus?: 'Pendiente' | 'Dispersada ACH';
  disbursementBatchCode?: string;
  disbursementBank?: string;
  disbursementDate?: string;
  financialTransactionId?: string; // ID del egreso registrado en Finanzas al pagar
  createdAt: string;
}

export interface SocialSecurityPilaPlanilla {
  id: string;
  farmId: string;
  farmName: string;
  period: string; // e.g. "2026-08"
  operatorName: 'Aportes en Línea' | 'Mi Planilla' | 'SOI' | 'Asopagos' | 'Simple';
  pilaPin: string; // PIN PILA generado (ej: "8830194021")
  generationDate: string;
  paymentDate?: string;
  totalEmployees: number;
  totalIbc: number;
  totalHealth: number;
  totalPension: number;
  totalArl: number;
  totalCaja: number;
  totalEmployerContributions: number;
  totalWorkerDeductions: number;
  grandTotalPila: number; // Total a pagar vía PSE
  status: 'Borrador' | 'Generada PILA' | 'Pagada PSE';
  isAutoGeneratedDraft?: boolean;
  draftBasePeriod?: string;
  pseReference?: string;
  financialTransactionId?: string;
  items: {
    employeeName: string;
    documentId: string;
    epsName: string;
    pensionFund: string;
    arlRiskLevel: string;
    cajaCompensacion: string;
    ibc: number;
    healthWorker: number;
    healthEmployer: number;
    pensionWorker: number;
    pensionEmployer: number;
    arlEmployer: number;
    cajaEmployer: number;
    totalItem: number;
    daysWorked?: number;
    novedad?: PilaItemNovedad;
  }[];
}

export interface PayrollAdvance {
  id: string;
  farmId: string;
  farmName: string;
  employeeId: string;
  employeeName: string;
  date: string;
  amount: number;
  reason: string;
  status: 'Pendiente' | 'Descontado';
  payrollRunId?: string;
}

// ==========================================
// PENDING DAILY ACTIVITIES & TASK REPORT MODELS
// ==========================================

export type PendingActivityPriority = 'alta' | 'media' | 'normal';

export type PendingActivityCategory =
  | 'sanitario'
  | 'ordeno'
  | 'nutricion'
  | 'pastoreo'
  | 'mantenimiento'
  | 'inventario'
  | 'personal'
  | 'reproduccion';

export type PendingActivityStatus = 'pendiente' | 'en_progreso' | 'completada' | 'postergada';

export interface PendingDailyActivity {
  id: string;
  title: string;
  category: PendingActivityCategory;
  priority: PendingActivityPriority;
  status: PendingActivityStatus;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
  responsibleWorker?: string;
  assignedLotOrAnimal?: string;
  locationPaddock?: string;
  notes?: string;
  farmId?: string;
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
  completionNotes?: string;
}

export interface ProgenyOffspringRecord {
  id: string;
  offspringTag: string;
  offspringName: string;
  damTag: string;
  sex: 'Macho' | 'Hembra';
  birthDate: string;
  birthWeightKg: number;
  weaningWeight210dKg: number;
  finalWeight18mKg?: number;
  dailyWeightGainGrams: number;
  milk305dLiters?: number;
  calvingEaseScore: number;
  conformationScore: number;
  notes?: string;
}

export interface ProgenyTestRecord {
  id: string;
  testCode: string;
  sireId: string;
  sireName: string;
  sireRegister: string;
  sireBreed: string;
  aptitude: 'Leche' | 'Carne' | 'Doble Propósito';
  evaluatorVeterinarian: string;
  evaluationDate: string;
  evaluationStatus: 'probado_excelente' | 'probado_positivo' | 'en_evaluacion' | 'descartado';
  offspringCountMeasured: number;
  offspringRecords: ProgenyOffspringRecord[];
  depMilkKg: number;
  depWeaningWeightKg: number;
  depBirthWeightKg: number;
  depCalvingEasePercent: number;
  reliabilityPercent: number;
  recommendations?: string;
}

// ==========================================
// CRIANZA ARTIFICIAL DE TERNEROS TYPES
// ==========================================

export type CalfHealthStatus = 'excelente' | 'bueno' | 'en_observacion' | 'tratamiento' | 'critico';
export type CalfFeedingType = 'calostro' | 'leche_entera' | 'sustituto_lacteo' | 'transicion_mixta' | 'destetado';
export type CalfHousingType = 'cuna_individual' | 'jaula_elevada' | 'corral_colectivo' | 'pastoreo_terneril';

export type CalfRearingModelId = 
  | 'crianza_artificial_intensiva'
  | 'crianza_vaca_nodriza'
  | 'crianza_colectiva_automatica'
  | 'crianza_pastoreo_creep_feeding'
  | 'crianza_tradicional_balde';

export interface CalfRearingModel {
  id: CalfRearingModelId;
  name: string;
  category: 'Lechería Especializada' | 'Doble Propósito' | 'Tecnificada / Estabulada' | 'Cría a Campo' | 'Tradicional';
  description: string;
  durationDays: number;
  housingRecommended: string;
  feedingProtocol: string;
  weaningCriteria: string;
  targetGDPGrams: number;
  estimatedCostPerCalfUSD: number;
  pros: string[];
  cons: string[];
  recommendedBreeds: string[];
}

export interface CalfColostrumRecord {
  id: string;
  calfId: string;
  colostrumDate: string;
  litersFed: number;
  brixQualityPercent: number;
  timePostBirthHours: number;
  umbilicalDisinfectionDone: boolean;
  iggPassivitySuccess: boolean;
  notes?: string;
}

export interface CalfDailyFeedingRecord {
  id: string;
  calfId: string;
  date: string;
  morningLiters: number;
  afternoonLiters: number;
  liquidType: 'Leche Entera' | 'Sustituto Lácteo Premium' | 'Transición Calostral';
  starterFeedGrams: number;
  forageGrams: number;
  waterAvailable: boolean;
  appetiteScore: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface CalfGrowthWeightRecord {
  id: string;
  calfId: string;
  date: string;
  weightKg: number;
  heartGirthCm?: number;
  dailyGainGrams: number;
  ageDays: number;
}

export interface CalfHealthEventRecord {
  id: string;
  calfId: string;
  date: string;
  eventType: 'diarrea_neonatal' | 'neumonia' | 'omfalitis' | 'vacunacion' | 'descorne' | 'desparasitacion' | 'podologia';
  description: string;
  medication?: string;
  dose?: string;
  vetInCharge?: string;
  resolved: boolean;
}

export interface ArtificialCalfRecord {
  id: string;
  earTag: string;
  name: string;
  sex: 'Macho' | 'Hembra';
  breed: string;
  birthDate: string;
  birthWeightKg: number;
  currentWeightKg: number;
  damTag: string;
  damName?: string;
  sireTag: string;
  housingType: CalfHousingType;
  housingNumber: string;
  healthStatus: CalfHealthStatus;
  feedingType: CalfFeedingType;
  currentDailyMilkLiters: number;
  starterFeedConsumptionGrams: number;
  colostrumRecord?: CalfColostrumRecord;
  feedingHistory: CalfDailyFeedingRecord[];
  growthHistory: CalfGrowthWeightRecord[];
  healthHistory: CalfHealthEventRecord[];
  targetWeaningDate: string;
  weaned: boolean;
  rearingModelId?: CalfRearingModelId;
  notes?: string;
}

// ==========================================
// PLAN DE SUPLEMENTACIÓN MULTI-ETAPA
// ==========================================

export type SupplementStage =
  | 'cria'
  | 'levante'
  | 'preceba'
  | 'ceba'
  | 'crianza_artificial';

export interface FeedIngredient {
  id: string;
  name: string;
  category: 'energetico' | 'proteico' | 'mineral' | 'fibra_forraje' | 'aditivo' | 'lacteo';
  dryMatterPercent: number; // DM % (Materia Seca)
  crudeProteinPercent: number; // CP % (Proteína Cruda)
  tdnPercent: number; // TDN % (Nutrientes Digestibles Totales)
  netEnergyMcalKg: number; // Mcal/kg (Energía Neta)
  costPerKgUSD: number; // $ USD / kg
  unit: string;
  notes?: string;
}

export interface FormulaComponent {
  ingredientId: string;
  ingredientName: string;
  percentageInclusion: number; // % en la mezcla seca o fresca
  kgPerTon: number; // kg por tonelada (1000 kg)
  costContributionUSD: number; // Aporte al costo por kg
}

export interface SupplementPlan {
  id: string;
  name: string;
  stage: SupplementStage;
  stageLabel: string;
  description: string;
  seasonSuitability: 'epoca_seca' | 'lluvias' | 'transicion' | 'todo_el_ano';
  targetWeightMinKg: number;
  targetWeightMaxKg: number;
  targetGDPGrams: number; // Ganancia Diaria de Peso proyectada (g/día)
  inclusionPercentBW: number; // Consumo recomendado como % del Peso Vivo (ej. 0.5%, 1.2%, 2.0%)
  recommendedDoseKgPerHead: number; // Dosis promedio en kg/cabeza/día
  crudeProteinPercent: number; // % Proteína Cruda de la mezcla
  energyMcalKg: number; // Mcal/kg de la mezcla
  costPerKgUSD: number; // Costo $/kg preparado
  costPerHeadDayUSD: number; // Costo $/animal/día
  formula: FormulaComponent[];
  feedingFrequency: string; // ej: "1 toma matutina", "2 tomas (AM/PM)", "Libre acceso en saladero"
  recommendations: string[];
  isPreconfigured?: boolean;
}

export type PurchaseHorizonDays = 7 | 15 | 30 | 90 | 180 | 365;

export interface FeedPurchaseOrderProjection {
  materialId: string;
  materialName: string;
  category: string;
  packageWeightKg: number;
  unitCostPerKgUSD: number;
  currentStockKg: number;
  safetyStockKg: number;
  dailyDemandHatoKg: number;
  projectedDemandKg: number;
  netShortageKg: number;
  suggestedPackages: number;
  totalOrderKg: number;
  totalEstimatedCostUSD: number;
  daysOfAutonomy: number;
  isUrgentReorder: boolean;
  supplier?: string;
  supplierPhone?: string;
}

export interface SupplementDispatchLog {
  id: string;
  date: string;
  stage: SupplementStage;
  lotName: string;
  planName: string;
  animalCount: number;
  kgOfferedTotal: number;
  kgRefusalTotal: number; // Desperdicio / Rechazo en comedero
  kgConsumedNet: number;
  kgConsumedPerHead: number;
  costTotalUSD: number;
  operatorName: string;
  notes?: string;
}

// ==========================================
// EQUINES, MULES & DONKEYS INVENTORY MODELS
// ==========================================

export type EquineSpecies = 'caballar' | 'mular' | 'asnal';
export type EquineSex = 'macho' | 'hembra' | 'capon';
export type EquineAptitude = 'trabajo_vaqueria' | 'carga_enjalma' | 'reproduccion_cria' | 'paseo_exposicion' | 'tiro';
export type EquineSanitaryStatus = 'excelente' | 'atencion' | 'tratamiento' | 'cuarentena';

export interface EquineHerrajeRecord {
  id: string;
  date: string;
  type: 'completo' | 'delantero' | 'recorte_cascos';
  farrierName: string; // Herrador
  costCop: number;
  notes?: string;
}

export interface EquineSanitaryEvent {
  id: string;
  date: string;
  type: 'aie_coggins' | 'encefalitis' | 'tetanos' | 'desparasitacion' | 'vitamina' | 'otro';
  title: string;
  laboratoryOrMedication: string;
  resultOrDose: string;
  nextDueDate?: string;
  costCop?: number;
}

export interface EquineAnimal {
  id: string;
  earTagOrIron: string; // Arete, Hierro o Número
  name: string;
  rfidChip?: string;
  species: EquineSpecies; // caballar, mular, asnal
  sex: EquineSex; // macho, hembra, capon
  breed: string; // Ej: Criollo Colombiano, Cuarto de Milla, Mula de Carga, Asno Zamorano
  coatColor: string; // Pelaje/Capa: Ej: Castaño, Alazán, Bayo, Roano, Muro, Zano
  ageYears: number;
  weightKg: number;
  farmName: string;
  aptitude: EquineAptitude;
  status: 'activo' | 'reposo' | 'gestacion' | 'retirado' | 'vendido';
  sanitaryStatus: EquineSanitaryStatus;
  lastHerrajeDate?: string;
  nextHerrajeDueDate?: string;
  lastAieTestDate?: string; // Test de Anemia Infecciosa Equina
  aieCertificateCode?: string;
  cogginsValidUntil?: string;
  photoUrl?: string;
  fatherName?: string;
  motherName?: string;
  assignedRiderOrWorker?: string; // Encargado / Arriero / Vaquero
  observations?: string;
  herrajeHistory?: EquineHerrajeRecord[];
  sanitaryHistory?: EquineSanitaryEvent[];
}

// ==========================================
// ADMINISTRATIVE MODULE & ROLE MANAGEMENT TYPES
// ==========================================

export type SystemRoleType =
  | 'propietario'
  | 'administrador'
  | 'veterinario'
  | 'mayordomo'
  | 'financiero_contador'
  | 'otro';

export interface AdminUserPermissions {
  cattle: boolean; // Control de Ganado y Pesajes
  dairy: boolean; // Lechería y Ordeño
  genetics: boolean; // Genética y Trasplante de Embrio
  finance: boolean; // Finanzas, Costos e Ingresos
  payroll: boolean; // Nómina, PILA y Pagos
  sanitary: boolean; // Sanidad, Vacunación y Recetas
  inventory: boolean; // Almacén e Inventarios
  gis: boolean; // SIG Potreros y Mapas
  admin: boolean; // Configuración y Gestión de Usuarios
  reports: boolean; // Informe Ejecutivo y Exportación Excel/PDF
}

export interface AdminUser {
  id: string;
  fullName: string;
  documentId: string; // Cédula de Ciudadanía / NIT
  email: string;
  phone: string;
  roleType: SystemRoleType;
  customRoleTitle?: string; // Título exacto de cargo (ej: "Zootecnista Principal", "Auditor Externo")
  assignedFarms: string[]; // IDs de fincas asignadas o ['all'] para todas
  status: 'activo' | 'inactivo' | 'suspendido';
  securityPin: string; // PIN de 4 a 6 dígitos para firmas o aprobaciones
  
  // Specific role metadata
  ownershipPercentage?: number; // Para Propietarios (% participación de la finca/empresa)
  maxDisbursementApproval?: number; // Para Administradores / Financieros ($ Límite de desembolso)
  professionalLicenseNo?: string; // Para Veterinarios / Zootecnistas (COMVEZCOL/ICA) o Contadores (TP)
  digitalSignatureUrl?: string; // Firma digital para recetas o balances
  assignedPaddocksOrLotsScope?: string[]; // Para Mayordomos/Caporales (Scope específico)
  
  permissions: AdminUserPermissions;
  createdAt: string;
  lastLogin?: string;
  notes?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  module: string;
  action: string;
  details: string;
  ipOrDevice?: string;
}

// ============================================================================
// MÓDULO DE VENTAS: PARÁMETROS Y AFECTACIÓN DEL INVENTARIO
// ============================================================================

export type SaleReasonType =
  | 'ceba_terminada'       // Ceba Terminada / Carne Comercial: Animal que completó su ciclo de engorde.
  | 'pie_de_cria'          // Pie de Cría / Reproducción: Hembras o machos aptos para cría comercial.
  | 'genetica_elite'       // Genética de Registro / Élite: Reproductores, donantes, novillas preñadas con embriones o terneros puros.
  | 'descarte_productivo'  // Descarte Productivo: Vacas por baja producción de leche, problemas reproductivos (días abiertos excesivos) o edad.
  | 'descarte_sanitario';  // Descarte Sanitario / Emergencia: Problemas de aplomos, mastitis crónica o accidentes (venta forzosa).

export type SaleSettlementMode =
  | 'kilo_en_pie'          // Al Kilo en Pie: Peso final en báscula × Precio por kg.
  | 'kilo_en_canal'        // Al Kilo en Canal: Peso canal caliente (PCC) × Rendimiento (%) × Precio canal.
  | 'por_cabeza'           // Por Cabeza (Precio Fijo / Lote): Valor acordado por animal.
  | 'valor_genetico';      // Valor Genético / Subasta: Precio base + prima por mérito genético/preñez.

export type SaleDestinationType =
  | 'frigorifico'          // Frigorífico / Planta de Beneficio
  | 'subasta'              // Subasta Ganadera
  | 'particular'           // Comprador Particular / Comisionista
  | 'finca_receptora';     // Finca Receptora / Predio de Destino

export interface SaleDeductions {
  freightCost: number;       // Fletes de salida ($)
  auctionCommission: number; // Comisiones de subasta o corretaje ($)
  auctionCommissionPct?: number; // % comisión
  weighingCost: number;      // Báscula y pesaje ($)
  withholdingTax: number;    // Retención en la fuente ($)
  withholdingTaxPct?: number;// % retención (ej. 1.5% o 2.5%)
  livestockFundFee: number;  // Cuota de fomento ganadero / FEDEGAN ($)
  livestockFundPct?: number; // % cuota (ej. 0.75%)
  otherDeductions: number;   // Otras deducciones ($)
  totalDeductions: number;   // Total deducciones acumuladas ($)
}

export interface SaleZootecnicMetrics {
  grossWeightKg: number;        // Pesaje Final de Salida (kg bruto en báscula)
  shrinkagePercent: number;     // % de Desbaste Acordado (ej. 3% - 5%)
  shrinkageKg: number;          // Kilos descontados por desbaste
  netWeightKg: number;          // Peso Neto Liquidado (kg reales cobrados)
  bodyConditionScore: number;   // Condición Corporal (CC) al Despacho (Escala 1 a 5)
  carcassYieldPercent: number;  // Rendimiento en Canal Estimado / Real (%)
  hotCarcassWeightKg: number;   // Peso Canal Caliente (PCC) en kg
  avgAgeMonths?: number;        // Edad promedio al momento de venta
}

export interface SaleEconomicMetrics {
  daysInFarm: number;           // Días Totales en Finca (DEF) = Fecha Venta - Fecha Ingreso/Nacimiento
  entryDate: string;            // Fecha de Ingreso / Nacimiento
  entryWeightKg: number;        // Peso de Entrada / Nacimiento (kg)
  totalWeightGainKg: number;    // Ganancia Total de Peso = Peso Neto Salida - Peso de Entrada (kg)
  dailyWeightGainKg: number;    // Ganancia Diaria de Peso (GDP) = Ganancia Total / DEF (kg/día)
  dailyWeightGainGrams: number; // GDP en g/día
  grossSaleIncome: number;      // Ingreso Bruto de Venta ($)
  totalDeductions: number;      // Deducciones (Fletes, comisiones, impuestos) ($)
  netSaleIncome: number;        // Ingreso Neto de Venta = Ingreso Bruto - Deducciones ($)
  initialCost: number;          // Costo de Compra / Entrada ($)
  accumulatedSanitaryCost: number; // Costos acumulados de Sanidad ($)
  accumulatedFeedingCost: number;  // Costos acumulados de Alimentación y Suplementación ($)
  accumulatedLaborCost: number;    // Costos de Mano de Obra y Manejo ($)
  totalAccumulatedCosts: number;   // Costos acumulados totales (Sanidad + Alimentación + Manejo) ($)
  grossMargin: number;          // Margen Bruto Total = Ingreso Neto - Costo de Compra ($)
  realNetProfitability: number; // Rentabilidad Neta Real = Margen Bruto - Costos acumulados ($)
  roiPercent: number;           // Retorno sobre la inversión (%)
  profitPerDay: number;         // Ganancia neta por día en finca ($/día)
  costPerKgProduced: number;    // Costo por kg producido ($/kg)
}

export interface SoldAnimalItem {
  id: string;
  tag: string;
  name?: string;
  breed: string;
  sex: 'macho' | 'hembra' | string;
  category: string;
  lotId?: string;
  lotName?: string;
  paddockId?: string;
  paddockName?: string;
  entryDate: string;
  entryWeightKg: number;
  grossExitWeightKg: number;
  shrinkagePercent: number;
  netExitWeightKg: number;
  bodyConditionScore: number;
  carcassYieldPercent?: number;
  hotCarcassWeightKg?: number;
  daysInFarm: number;
  totalWeightGainKg: number;
  gdpKgDay: number;
  initialCost: number;
  accumulatedCosts: number;
  individualGrossIncome: number;
  individualDeductions: number;
  individualNetIncome: number;
  grossMargin: number;
  netProfit: number;
  roiPercent: number;
  brandingIron?: string;
  saleReason: SaleReasonType;
}

export interface LivestockSaleRecord {
  id: string;
  saleCode: string;             // ej. VTA-2026-0042
  saleDate: string;             // Fecha de Salida / Facturación
  farmId: string;               // Predio de Origen
  farmName: string;
  lotId?: string;               // Lote de procedencia
  lotName?: string;
  paddockId?: string;           // Potrero de salida
  paddockName?: string;
  saleReason: SaleReasonType;   // Motivo de venta / Causa de salida
  saleReasonLabel: string;
  settlementMode: SaleSettlementMode; // Modalidad de liquidación
  settlementModeLabel: string;
  destinationType: SaleDestinationType;
  buyerName: string;            // Cliente / Frigorífico / Subasta / Particular
  buyerDoc: string;             // Cédula / NIT
  buyerPhone: string;
  destinationLocation: string;  // Frigorífico, subasta, comprador particular o finca receptora
  icaGuideNumber: string;       // Guía Sanitaria de Movilización Oficial ICA
  invoiceNumber: string;        // Número de Factura o Liquidación Comercial
  headsCount: number;           // Cantidad de cabezas vendidas
  animals: SoldAnimalItem[];    // Detalle por animal individual
  zootecnicMetrics: SaleZootecnicMetrics; // Parámetros Zootécnicos consolidados
  deductions: SaleDeductions;   // Costos y Deducciones de Venta
  economicMetrics: SaleEconomicMetrics;   // Indicadores Económicos calculados al cierre
  
  // Parámetros de Precio según modalidad
  pricePerKg?: number;          // $/kg en pie
  pricePerCarcassKg?: number;   // $/kg en canal
  pricePerHead?: number;        // $/cabeza
  geneticBasePrice?: number;    // Precio base genético
  geneticPremium?: number;      // Prima por mérito genético / preñez

  // Logística y Transporte
  transporterName?: string;
  transporterPhone?: string;
  truckPlate?: string;
  dispatcherName?: string;
  veterinarianCertification?: string;
  sanitaryClearanceVerified: boolean; // Certificación de cumplimiento de tiempos de retiro
  
  // Afectación de Inventario ejecutada
  inventoryReleased: {
    heads: number;
    biomassKg: number;
    uggCount: number; // Unidades Gran Ganado liberadas (kg / 450)
    paddockFreedId?: string;
    paddockFreedName?: string;
    lotFreedId?: string;
    lotFreedName?: string;
    closedIndividualSheets: boolean;
    archivedInTraceability: boolean;
    herdBookUpdated: boolean;
  };

  operatorResponsible: string;
  status: 'completada' | 'anulada';
  notes?: string;
  createdTimestamp: string;
}

export interface SaleFilterOptions {
  searchTerm: string;
  farmId: string;
  saleReason: SaleReasonType | 'all';
  settlementMode: SaleSettlementMode | 'all';
  destinationType: SaleDestinationType | 'all';
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface SaleSimulationInput {
  lotId?: string;
  animalIds?: string[];
  headsCount: number;
  avgGrossWeightKg: number;
  saleReason: SaleReasonType;
  settlementMode: SaleSettlementMode;
  shrinkagePercent: number;
  bodyConditionScore: number;
  carcassYieldPercent: number;
  pricePerKg: number;
  pricePerCarcassKg: number;
  pricePerHead: number;
  geneticBasePrice: number;
  geneticPremium: number;
  freightCost: number;
  auctionCommissionPct: number;
  weighingCost: number;
  withholdingTaxPct: number;
  livestockFundPct: number;
  otherDeductions: number;
  avgDaysInFarm: number;
  avgEntryWeightKg: number;
  avgInitialCostPerHead: number;
  avgSanitaryCostPerHead: number;
  avgFeedingCostPerHead: number;
  avgLaborCostPerHead: number;
}

export interface MasterTraceabilityAnimal {
  id: string;
  tag: string;
  dinNumber?: string;
  name?: string;
  breed: string;
  sex: 'macho' | 'hembra' | string;
  category?: string;
  weightKg: number;
  lotId?: string;
  lotName?: string;
  paddockId?: string;
  paddockName?: string;
  birthDate?: string;
  entryDate?: string;
  entryWeightKg?: number;
  status: 'activo' | 'vendido' | 'muerto' | 'trasladado';
}

// ==========================================
// EMAIL NOTIFICATION RECIPIENTS & CHANNELS
// ==========================================

export interface NotificationPreferences {
  // A. Alertas Críticas e Inmediatas
  alertSalesDispatch: boolean;       // Ventas y liquidación de inventario
  alertMortalityRecorded: boolean;   // Bajas / muertes diagnosticadas
  alertWithdrawalActive: boolean;    // Períodos de retiro en carne/leche
  alertCriticalStockOut: boolean;    // Quiebre de stock en bodega (<7 días)
  
  // B. Notificaciones Operativas y Reproductivas
  notifyNewBirths: boolean;          // Partos y registros de crías
  notifyCalvingForecast: boolean;    // Próximos partos y secados (7 días)
  notifyHealthReinforcement: boolean;// Refuerzos de vacunas y tratamientos
  
  // C. Reportes Periódicos Consolidados
  reportDailyDigest: boolean;        // Resumen diario de cierre (06:00 PM)
  reportWeeklyExecutive: boolean;    // Balance semanal ejecutivo (Lunes 08:00 AM)
  reportMonthlyMrp: boolean;         // Proyección mensual de compras MRP
}

export interface EmailNotificationRecipient {
  id: string;
  fullName: string;
  email: string;
  role: 'propietario' | 'administrador' | 'veterinario' | 'contador' | 'zootecnista';
  isAllFarmsAccess: boolean;
  assignedFarmNames?: string[];
  status: 'active' | 'pending_verification' | 'paused' | 'bounced';
  verificationCode?: string;
  verifiedAt?: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // ej: "21:00"
  quietHoursEnd: string;   // ej: "06:00"
  preferences: NotificationPreferences;
  lastSentAt?: string;
  createdAt: string;
}

export interface NotificationDeliveryLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  eventCategory: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  subject: string;
  sentAt: string;
  deliveryStatus: 'delivered' | 'sent' | 'bounced' | 'opened';
}

// ==========================================
// BUBALINE / WATER BUFFALO MODULE TYPES
// ==========================================

export type BubalineBreed =
  | 'Murrah'
  | 'Mediterránea'
  | 'Jafarabadi'
  | 'Carabao'
  | 'Nili-Ravi'
  | 'Mestizo Lechero'
  | 'Cruce Comercial';

export type BubalineCategory =
  | 'bucerro_lactante' // 0-10 meses macho
  | 'bucerra_lactante' // 0-10 meses hembra
  | 'bubillo_levante'  // 10-24 meses macho
  | 'bubilla_levante'  // 10-24 meses hembra
  | 'bufala_primipara' // 24-34 meses (1er vientre)
  | 'bufala_produccion'// Vientre en ordeño
  | 'bufala_seca'      // Vientre en descanso
  | 'bufalo_reproductor' // Padrón / Torete
  | 'bufalo_ceba';     // Engorde / Carne

export type BubalineMarkingMethod =
  | 'ear_tag_rfid'
  | 'rumen_bolus'
  | 'tattoo_inguinal'
  | 'tattoo_ear'
  | 'hot_iron';

export interface BubalineMilkQualityRecord {
  id: string;
  animalId: string;
  animalTag: string;
  animalName: string;
  date: string;
  shift: 'mañana' | 'tarde' | 'unico';
  liters: number;
  fatPercentage: number;       // 6.5% - 9.0%
  proteinPercentage: number;   // 3.8% - 4.8%
  totalSolidsPercentage: number; // 16.0% - 19.5%
  sccK: number;                // Conteo Células Somáticas en miles/mL (normal < 150)
  estimatedMozzarellaKg: number; // Algoritmo: L * (0.075*Grasa + 0.080*Prot)
  notes?: string;
}

export interface BubalineReproductionRecord {
  id: string;
  femaleId: string;
  femaleTag: string;
  femaleName: string;
  serviceType: 'IA' | 'Monta Natural' | 'Transferencia Embrion';
  serviceDate: string;
  sireNameOrStraw: string;
  gestationDaysConstant: 312; // Específica bubalina
  expectedCalvingDate: string; // serviceDate + 312 días
  expectedDryOffDate: string;   // serviceDate + 250 días
  pregnancyConfirmed: boolean;
  pregnancyCheckDate?: string;
  isSeasonalPhotoperiod: boolean;
  status: 'gestante' | 'vacia' | 'parida' | 'en_servicio';
}

export interface BubalineAnimal {
  id: string;
  earTag: string;
  name: string;
  rfidOrTattoo?: string;
  markingMethod: BubalineMarkingMethod;
  breed: BubalineBreed;
  category: BubalineCategory;
  sex: 'macho' | 'hembra';
  birthDate: string;
  ageMonths: number;
  weightKg: number;
  lastWeighDate: string;
  dailyWeightGainG: number; // GDP en gramos/día
  farmId: string;
  farmName: string;
  paddockName: string;
  hasWallowAccess: boolean; // Acceso a poza/revolcadero
  shadeCoveragePct: number; // Cobertura de sombra en potrero (%)
  
  // Eje Lechero
  isMilking: boolean;
  dailyMilkLiters?: number;
  currentLactationDays?: number;
  lastFatPercentage?: number;
  lastProteinPercentage?: number;
  lastSolidsPercentage?: number;
  
  // Eje Reproductivo
  reproductiveStatus: 'vacia' | 'servida' | 'gestante' | 'seca' | 'reproductor_activo';
  lastServiceDate?: string;
  expectedCalvingDate?: string; // 312 días
  daysInGestation?: number;
  totalCalvings: number;
  lastCalvingDate?: string;
  
  // Sanidad
  toxocaraDewormed: boolean;
  toxocaraDewormingDate?: string;
  sanitaryNotes?: string;
}


