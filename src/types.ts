export type MainTab = 'home' | 'cattle' | 'dairy' | 'genetics' | 'gis' | 'aforo' | 'finance' | 'rainfall' | 'inventory' | 'menu';

export type SexType = 'toro' | 'vaca' | 'novillo' | 'vaquillona' | 'ternero' | 'ternera';
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

export interface RecentActivity {
  id: string;
  title: string;
  subtitle: string;
  weightOrMetric: string;
  category: 'birth' | 'weigh' | 'dairy' | 'health' | 'genetics';
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

export interface BornOnFarmInfo {
  damTag: string; // Madre (Arete / Nombre) - Obligatorio
  sireTagOrBull?: string; // Padre / Toro / Semen - Opcional
  birthDate: string; // Fecha de nacimiento
  birthWeightKg?: number; // Peso al nacer (kg)
  earTagInitial?: string; // Chapeta / Marca de oreja al nacer
  tattooNumber?: string; // Tatuaje inicial en oreja
  originFarmName?: string; // Predio de origen donde nació
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
}

export interface ImportedAnimalRecord {
  id: string;
  tag: string; // Arete / ID Bovino
  name?: string; // Nombre / Alias del animal
  weightKg: number; // Peso actual / entrada
  sex: 'macho' | 'hembra';
  breed: string; // Raza / fenotipo (ej. Brahman Blanco, Nelore, Brangus, Gyr, Simbrah)
  category?: LotCategory | string;
  pricePerKg?: number; // Precio por kg COP
  totalPrice?: number; // Precio total
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
  movementType: 'transferencia_interna' | 'salida_muerte' | 'salida_sacrificio' | 'salida_venta';
  animalIds?: string[];
  lotId?: string;
  targetFarmId?: string; // Para transferencia interna a otro predio
  targetLotId?: string;
  date: string;
  causeOrReason?: string; // ej. Muerte por enfermedad, Venta comercial, Subasta, etc.
  buyerOrDestination?: string; // Comprador / Destino / Matadero / Predio Destino
  salePriceTotal?: number; // En caso de venta
  salePricePerKg?: number;
  totalWeightKg?: number;
  invoiceOrGuideNumber?: string;
  notes?: string;
}

export interface NewLotRegistrationInput {
  farmId: string; // Predio asignado (e.g. 'finca-san-juan')
  lotName: string;
  category: LotCategory;
  categoryLabel?: string;
  sourceType: 'subasta' | 'compra_directa' | 'nacimiento_lote' | 'traslado' | 'inventario_inicial';
  sourceEntity?: string; // e.g. "Subastar S.A. - Planeta Rica", "Subacasanare", "Cogasucre"
  invoiceNumber?: string; // N° Factura / Liquidación
  purchaseDate: string;
  paddockId?: string; // Potrero asignado en el predio
  pricePerKg?: number;
  freightCost?: number;
  heads: number;
  currentAvgWeight: number;
  targetWeight?: number;
  ageRange?: string;
  sexLabel?: string;
  pastureType?: string;
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




