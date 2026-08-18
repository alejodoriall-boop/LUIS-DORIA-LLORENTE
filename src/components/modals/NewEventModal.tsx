import React, { useState, useEffect } from 'react';
import { printHTML } from '../../utils/printUtils';
import {
  Baby,
  Scale,
  Heart,
  Stethoscope,
  X,
  CheckCircle2,
  Zap,
  Building2,
  MapPin,
  Sparkles,
  ShoppingBag,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Coins,
  AlertCircle,
  Dna,
  Award,
  Flame,
  Users,
  Truck,
  UserCheck,
  Phone,
  FileText,
  Compass,
  ShieldAlert,
  ChevronRight,
  PlusCircle,
  Share2,
  Printer,
  Search,
  ClipboardCheck,
  Activity,
  Trash2,
  Plus,
  Upload,
  Download,
  ClipboardPaste,
  Sliders,
  ChevronDown,
  ChevronUp,
  Edit3,
  LogOut,
  Check,
  Save,
  Handshake,
  ClipboardList,
  DollarSign,
  Skull,
  AlertTriangle,
  ArrowRightLeft,
  Repeat,
  Clock,
  Route,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FarmDataPackage, ImportedAnimalRecord, NewLotRegistrationInput, LotCategory, BrandingIron, LotRecord, LivestockMovementInput } from '../../types';
import { generateAnimalsForLot } from '../../utils/lotAnimalUtils';
import { AuctionExcelImporter } from './AuctionExcelImporter';

export type RegistrationEventType =
  | 'compra'
  | 'venta'
  | 'birth'
  | 'pasaje'
  | 'sociedad'
  | 'baja'
  | 'auction';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  animals?: ImportedAnimalRecord[];
  lots?: LotRecord[];
  onSelectFarm?: (farmId: string) => void;
  onAddActivity: (
    title: string,
    subtitle: string,
    metric: string,
    category: 'birth' | 'weigh' | 'dairy' | 'health' | 'genetics',
  ) => void;
  onRegisterAuctionLot: (lotInput: NewLotRegistrationInput) => void;
  onRegisterLivestockMovement?: (movement: LivestockMovementInput) => void;
  liveScaleWeight?: number;
  scaleName?: string;
  onOpenScaleModal?: () => void;
  initialEventType?: RegistrationEventType;
  brandingIrons?: BrandingIron[];
  isLotsEnabled?: boolean;
}

const DEFAULT_SYSTEM_DAMS = [
  { tag: 'Vaca 402 - La Reina', breed: 'Brahman Blanco' },
  { tag: 'Vaca 102 - Lady Manso', breed: 'Gyr Leche' },
  { tag: 'Vaca 304 - Mariposa', breed: 'Simbrah' },
  { tag: 'Vaca 501 - La Esperanza', breed: 'Brahman Rojo' },
  { tag: 'Vaca 802 - Clara', breed: 'Guzerá' },
  { tag: 'Vaca 210 - Paloma', breed: 'Girolando' },
];

const DEFAULT_SYSTEM_SIRES = [
  { tag: 'Toro Don Pedro (B-12)', breed: 'Brahman Blanco' },
  { tag: 'JDH Sir Liberty 45/9', breed: 'Brahman Importado' },
  { tag: 'Toro San Juan #88', breed: 'Brahman Rojo' },
  { tag: 'Pajilla IA - Mr. V8 380/6', breed: 'Semen IA Importado' },
  { tag: 'Pajilla IA - Sansao Gyr #2201', breed: 'Semen IA Leche' },
];

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  animals = [],
  lots = [],
  onSelectFarm,
  onAddActivity,
  onRegisterAuctionLot,
  onRegisterLivestockMovement,
  liveScaleWeight,
  scaleName,
  onOpenScaleModal,
  initialEventType = 'compra',
  brandingIrons = [],
  isLotsEnabled = false,
}) => {
  // Target Farm selection
  const [selectedFarmId, setSelectedFarmId] = useState<string>(currentFarmId || (farms[0]?.profile?.id ?? ''));
  
  // Farm Change Confirmation State for All Registration & Event Types
  const [pendingFarmId, setPendingFarmId] = useState<string | null>(null);
  const [showFarmConfirmModal, setShowFarmConfirmModal] = useState<boolean>(false);

  // Event category
  const [eventType, setEventType] = useState<RegistrationEventType>(initialEventType || 'compra');

  // Sync selectedFarmId when modal opens or currentFarmId changes
  useEffect(() => {
    if (isOpen) {
      if (currentFarmId) {
        setSelectedFarmId(currentFarmId);
        setBirthOriginFarmId(currentFarmId);
      }
      setEventType(initialEventType || 'compra');
      setShowFarmConfirmModal(false);
      setPendingFarmId(null);
    }
  }, [isOpen, currentFarmId, initialEventType]);

  const handleInitiateFarmChange = (newFarmId: string) => {
    if (newFarmId === selectedFarmId) return;
    setPendingFarmId(newFarmId);
    setShowFarmConfirmModal(true);
  };

  const handleConfirmFarmChange = () => {
    if (pendingFarmId) {
      setSelectedFarmId(pendingFarmId);
      setSelectedPaddockId('');
      setBirthOriginFarmId(pendingFarmId);
      setSalePaddockId('');
      setSociedadPaddockId('');
      setPasajeOriginPaddockId('');
      setPasajeTargetPaddockId('');
      setBajaPaddockId('');

      const newFarmObj = farms.find((f) => f.profile.id === pendingFarmId);
      if (newFarmObj) {
        if (lotName === 'Lote Novillos Ceba Compra' || lotName.startsWith('Lote Compra')) {
          setLotName(`Lote Compra - ${newFarmObj.profile.name}`);
        }
        if (sociedadLotName.startsWith('Lote Sociedad')) {
          setSociedadLotName(`Lote Sociedad - ${newFarmObj.profile.name}`);
        }
      }
    }
    setShowFarmConfirmModal(false);
    setPendingFarmId(null);
  };

  const handleCancelFarmChange = () => {
    setShowFarmConfirmModal(false);
    setPendingFarmId(null);
  };

  // Backward compatibility alias
  const handleInitiateCompraFarmChange = handleInitiateFarmChange;
  const handleConfirmCompraFarmChange = handleConfirmFarmChange;
  const handleCancelCompraFarmChange = handleCancelFarmChange;

  // System Animals Filtering
  const systemCows = animals.filter((a) => a.sex === 'hembra' || a.category === 'cria' || a.category === 'novilla');
  const systemBulls = animals.filter((a) => a.sex === 'macho' || a.category === 'ceba' || a.category === 'toro');

  // ==========================================
  // COMPRA & VENDEDOR STATE
  // ==========================================
  const [sellerType, setSellerType] = useState<'subasta' | 'particular' | 'comerciante' | 'finca' | 'empresa'>('subasta');
  const [auctionEntity, setAuctionEntity] = useState('Subastar S.A. (Montería / Planeta Rica)');
  const [customAuctionEntity, setCustomAuctionEntity] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerDoc, setSellerDoc] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [sellerSanitaryStatus, setSellerSanitaryStatus] = useState('Hato libre de Brucelosis y Aftosa');
  const [invoiceNumber, setInvoiceNumber] = useState(`FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [lotName, setLotName] = useState('Lote Novillos Ceba Compra');
  const [lotCategory, setLotCategory] = useState<LotCategory>('ceba');
  const [selectedPaddockId, setSelectedPaddockId] = useState<string>('');
  const [pricePerKg, setPricePerKg] = useState('8750');
  const [freightCost, setFreightCost] = useState('45000');
  const [auctionEntryMode, setAuctionEntryMode] = useState<'excel' | 'quick'>('quick');
  const [importedAnimals, setImportedAnimals] = useState<ImportedAnimalRecord[]>([]);

  // Quick batch manual input
  const [quickHeads, setQuickHeads] = useState('25');
  const [quickAvgWeight, setQuickAvgWeight] = useState('365.0');
  const [quickSex, setQuickSex] = useState<'Machos' | 'Hembras' | 'Mixto'>('Machos');
  const [quickBreed, setQuickBreed] = useState('Brahman Blanco / Cebú');
  const [quickColor, setQuickColor] = useState('Blanco / Gris');
  const [quickAgeRange, setQuickAgeRange] = useState('18-24 Meses');
  const [quickBrandingIronId, setQuickBrandingIronId] = useState('');

  // ==========================================
  // NACIMIENTOS STATE (4 Módulos Clave)
  // ==========================================
  // 1. Identificación y Datos Básicos
  const [tag, setTag] = useState('#9084');
  const [birthRfid, setBirthRfid] = useState('982 000 412 884 102');
  const [birthDate, setBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [birthTime, setBirthTime] = useState('06:30');
  const [birthSex, setBirthSex] = useState<'hembra' | 'macho'>('hembra');
  const [birthBreed, setBirthBreed] = useState<string>('Brahman Blanco');
  const [birthPurityPct, setBirthPurityPct] = useState<string>('100% Puro');
  const [birthColor, setBirthColor] = useState<string>('Blanco / Gris');
  const [birthCattleType, setBirthCattleType] = useState<string>('comercial');
  const [selectedBrandingIronId, setSelectedBrandingIronId] = useState<string>('');

  // 2. Datos del Parto y Ternero
  const [individualWeight, setIndividualWeight] = useState('36.5');
  const [deliveryType, setDeliveryType] = useState<'eutocico' | 'distocico_asistido' | 'cesarea' | 'mortinato'>('eutocico');
  const [calvingCondition, setCalvingCondition] = useState<'simple' | 'multiple'>('simple');
  const [vigorScore, setVigorScore] = useState<number>(5);

  // 3. Genealogía
  const [parentTag, setParentTag] = useState('Vaca 402 - La Reina');
  const [surrogateDamTag, setSurrogateDamTag] = useState('');
  const [birthSireTag, setBirthSireTag] = useState('Toro Don Pedro (B-12)');
  const [conceptionMethod, setConceptionMethod] = useState<'monta_natural' | 'ia' | 'iatf' | 'te_fiv'>('monta_natural');

  // 4. Manejo Inicial y Ubicación
  const [colostrumFed, setColostrumFed] = useState<boolean>(true);
  const [colostrumHoursPostCalving, setColostrumHoursPostCalving] = useState<string>('2');
  const [navelDisinfected, setNavelDisinfected] = useState<boolean>(true);
  const [initialTreatments, setInitialTreatments] = useState<string>('Hierro dextrano 2ml + Complejo B + Selenio');
  const [birthOriginFarmId, setBirthOriginFarmId] = useState<string>(currentFarmId || farms[0]?.profile.id || '');
  const [customOriginFarmName, setCustomOriginFarmName] = useState('');
  const [birthMaternityPaddockId, setBirthMaternityPaddockId] = useState<string>('');
  const [operatorResponsible, setOperatorResponsible] = useState<string>('Carlos Mendoza (Mayordomo / Operario)');
  const [notes, setNotes] = useState('Ternero vigoroso, mamó calostro a las 2 horas. Ombligo curado con yodo al 7%.');
  const [birthError, setBirthError] = useState<string | null>(null);

  // ==========================================
  // RECIBIDOS EN SOCIEDAD STATE
  // ==========================================
  const [partnerName, setPartnerName] = useState('Don Gabriel Gómez');
  const [partnerDoc, setPartnerDoc] = useState('80.123.456');
  const [partnerPhone, setPartnerPhone] = useState('311 890 1234');
  const [shareScheme, setShareScheme] = useState('50% Socio / 50% Finca (En Aumento)');
  const [sociedadLotName, setSociedadLotName] = useState('Lote Sociedad Gómez - Machos Ceba');
  const [sociedadCategory, setSociedadCategory] = useState<LotCategory>('cria');
  const [sociedadSex, setSociedadSex] = useState('Machos de Levante');
  const [sociedadBreed, setSociedadBreed] = useState('Cebú Comercial / Aumento');
  const [sociedadColor, setSociedadColor] = useState('Bayo / Amarillo');
  const [sociedadAgeRange, setSociedadAgeRange] = useState('12-18 Meses');
  const [sociedadBrandingIronId, setSociedadBrandingIronId] = useState('');
  const [sociedadAnimalTags, setSociedadAnimalTags] = useState('');
  const [sociedadCommercialPurpose, setSociedadCommercialPurpose] = useState('Ceba en Aumento');
  const [sociedadHeads, setSociedadHeads] = useState('18');
  const [sociedadAvgWeight, setSociedadAvgWeight] = useState('275.0');
  const [sociedadPricePerKg, setSociedadPricePerKg] = useState('8200');
  const [sociedadPaddockId, setSociedadPaddockId] = useState('');
  const [sociedadNotes, setSociedadNotes] = useState('Ganado de levante recibido al aumento. Contrato a 12 meses.');

  // ==========================================
  // VENTA DE GANADO STATE
  // ==========================================
  const [saleMode, setSaleMode] = useState<'individual' | 'lot'>('individual');
  const [saleError, setSaleError] = useState<string | null>(null);
  const [saleLotId, setSaleLotId] = useState('');
  const [saleBuyer, setSaleBuyer] = useState('Frigorífico del Sinú / Comprador Particular');
  const [saleBuyerDoc, setSaleBuyerDoc] = useState('900.876.543-1');
  const [saleBuyerPhone, setSaleBuyerPhone] = useState('310 456 7890');
  const [saleDestination, setSaleDestination] = useState('Planta de Beneficio Red Cárnica - Montería');
  const [saleCategory, setSaleCategory] = useState<LotCategory>('ceba');
  const [saleSex, setSaleSex] = useState('Machos de Ceba');
  const [saleBreed, setSaleBreed] = useState('Brahman Blanco / Cebú');
  const [saleColor, setSaleColor] = useState('Blanco / Gris');
  const [saleAgeRange, setSaleAgeRange] = useState('24-30 Meses');
  const [saleBrandingIronId, setSaleBrandingIronId] = useState('');
  const [saleAnimalTags, setSaleAnimalTags] = useState('');
  const [saleCommercialPurpose, setSaleCommercialPurpose] = useState('Planta de Beneficio / Carne');
  const [saleSanitaryWithdrawalClear, setSaleSanitaryWithdrawalClear] = useState(true);
  const [saleHeads, setSaleHeads] = useState('20');
  const [saleAvgWeight, setSaleAvgWeight] = useState('485.0');
  const [salePricingType, setSalePricingType] = useState<'kilo' | 'total'>('kilo');
  const [salePricePerKg, setSalePricePerKg] = useState('9800');
  const [salePriceTotalCustom, setSalePriceTotalCustom] = useState('95060000');
  const [saleInvoiceNumber, setSaleInvoiceNumber] = useState(`FAC-VTA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [saleIcaGuideNumber, setSaleIcaGuideNumber] = useState(`ICA-VTA-${Math.floor(100000 + Math.random() * 900000)}`);
  const [salePaddockId, setSalePaddockId] = useState('');
  const [saleLotName, setSaleLotName] = useState('Lote Novillos Ceba Pesada');
  const [saleNotes, setSaleNotes] = useState('Ganado pesado en báscula certificada. Cumple días de retiro sanitario.');
  const [saleSearchHerdTerm, setSaleSearchHerdTerm] = useState('');
  const [showHerdAnimalPicker, setShowHerdAnimalPicker] = useState(false);

  // ==========================================
  // DAR DE BAJA (MUERTE, PÉRDIDA, SACRIFICIO, ENFERMEDAD) STATE
  // ==========================================
  const [bajaLotId, setBajaLotId] = useState('');
  const [bajaReason, setBajaReason] = useState<'muerte' | 'perdida' | 'sacrificio' | 'enfermedad'>('muerte');
  const [bajaSpecificCause, setBajaSpecificCause] = useState('Timpanismo agudo por leguminosas / forraje');
  const [bajaAnimalTagOrLot, setBajaAnimalTagOrLot] = useState('#NOV-409');
  const [bajaCategory, setBajaCategory] = useState<LotCategory>('ceba');
  const [bajaSex, setBajaSex] = useState('Macho');
  const [bajaBreed, setBajaBreed] = useState('Brahman Blanco');
  const [bajaColor, setBajaColor] = useState('Blanco / Gris');
  const [bajaAge, setBajaAge] = useState('24 Meses');
  const [bajaAgeRange, setBajaAgeRange] = useState('24 Meses');
  const [bajaBrandingIronId, setBajaBrandingIronId] = useState('');
  const [bajaHeads, setBajaHeads] = useState('1');
  const [bajaWeightKg, setBajaWeightKg] = useState('380.0');
  const [bajaAvgWeight, setBajaAvgWeight] = useState('380.0');
  const [bajaDate, setBajaDate] = useState(new Date().toISOString().split('T')[0]);
  const [bajaPaddockId, setBajaPaddockId] = useState('');
  const [bajaWitnessOrVet, setBajaWitnessOrVet] = useState('Dr. Carlos Mendoza (MVZ) / Mayordomo');
  const [bajaDocumentRef, setBajaDocumentRef] = useState(`ACTA-BAJA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [bajaEstimatedLoss, setBajaEstimatedLoss] = useState('3200000');
  const [bajaNotes, setBajaNotes] = useState('Verificado por personal de campo. Disposición final según protocolo sanitario.');

  // ==========================================
  // TRANSFERENCIA INTERNA & TRASLADOS STATE
  // ==========================================
  const [pasajeTransferType, setPasajeTransferType] = useState<'rotacion_interna' | 'traslado_interpredial'>('rotacion_interna');
  const [pasajeLotId, setPasajeLotId] = useState('');
  const [pasajeOriginPaddockId, setPasajeOriginPaddockId] = useState('');
  const [pasajeTargetPaddockId, setPasajeTargetPaddockId] = useState('');
  const [pasajeTargetFarmId, setPasajeTargetFarmId] = useState('');
  const [pasajeDestinationPaddockId, setPasajeDestinationPaddockId] = useState('');
  const [pasajeLotNameOrId, setPasajeLotNameOrId] = useState('Lote Novillos de Ceba #1');
  const [pasajeCategory, setPasajeCategory] = useState<LotCategory>('ceba');
  const [pasajeSex, setPasajeSex] = useState('Machos de Ceba');
  const [pasajeBreed, setPasajeBreed] = useState('Brahman Blanco / Cruce Cebú');
  const [pasajeColor, setPasajeColor] = useState('Blanco / Gris');
  const [pasajeAgeRange, setPasajeAgeRange] = useState('20-28 Meses');
  const [pasajeBrandingIronId, setPasajeBrandingIronId] = useState('');
  const [pasajeCommercialPurpose, setPasajeCommercialPurpose] = useState('Ceba Intensiva');
  const [pasajeAnimalTags, setPasajeAnimalTags] = useState('');
  const [pasajeHeads, setPasajeHeads] = useState('24');
  const [pasajeAvgWeight, setPasajeAvgWeight] = useState('420.0');
  const [pasajeRotationReason, setPasajeRotationReason] = useState('rotacion_prv');
  const [pasajeCustomReason, setPasajeCustomReason] = useState('Cumplimiento de tiempo óptimo de descanso y aforo');
  const [pasajeTransportMode, setPasajeTransportMode] = useState<'a_pie' | 'camion_sencillo' | 'doble_troque' | 'tractomula'>('camion_sencillo');
  const [pasajeTransporterName, setPasajeTransporterName] = useState('Transportes Ganaderos del Sinú / Jairo Morales');
  const [pasajeTransporterPhone, setPasajeTransporterPhone] = useState('312 456 7890');
  const [pasajeTruckPlate, setPasajeTruckPlate] = useState('WNK-452');
  const [pasajeFreightCost, setPasajeFreightCost] = useState('350000');
  const [pasajeIcaGuideNumber, setPasajeIcaGuideNumber] = useState(`GSMI-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
  const [pasajeRemisionNumber, setPasajeRemisionNumber] = useState(`REM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [pasajeWithdrawalVerified, setPasajeWithdrawalVerified] = useState(true);
  const [pasajeDate, setPasajeDate] = useState(new Date().toISOString().split('T')[0]);
  const [pasajeTime, setPasajeTime] = useState('06:30');
  const [pasajeDispatcher, setPasajeDispatcher] = useState('Capataz Carlos Restrepo');
  const [pasajeReceiver, setPasajeReceiver] = useState('Administrador Luis Durango');
  const [pasajeNotes, setPasajeNotes] = useState('Movimiento realizado sin incidentes en horas frescas de la mañana. Ganado tranquilo.');

  const targetFarm = farms.find((f) => f.profile.id === selectedFarmId) || farms[0];
  const targetPaddocks = targetFarm?.paddocks || [];

  // Active Lots and Catalog Animals for the Selected Farm
  const activeFarmLots = React.useMemo(() => {
    if (targetFarm?.lots && targetFarm.lots.length > 0) {
      return targetFarm.lots;
    }
    return lots.filter((l) => !l.farmId || l.farmId === selectedFarmId);
  }, [targetFarm, lots, selectedFarmId]);

  const farmCatalogAnimals = React.useMemo((): ImportedAnimalRecord[] => {
    const list: ImportedAnimalRecord[] = [];
    const farmName = targetFarm?.profile?.name || 'Predio Actual';
    activeFarmLots.forEach((lot) => {
      const generated = generateAnimalsForLot(lot, farmName);
      list.push(...generated);
    });
    return list;
  }, [activeFarmLots, targetFarm]);

  // Tag validation logic for sales
  const saleTagValidation = React.useMemo(() => {
    const raw = (saleAnimalTags || '').trim();
    if (!raw) {
      return {
        isValid: false,
        isEmpty: true,
        parsedTags: [],
        validAnimals: [] as ImportedAnimalRecord[],
        missingTags: [] as string[],
        message: 'Debe ingresar o seleccionar al menos un animal registrado en el predio.',
      };
    }

    const tokens = raw.split(/[,;\n]+/).map((t) => t.trim()).filter((t) => t.length > 0);
    const parsedTags: string[] = [];
    const validAnimals: ImportedAnimalRecord[] = [];
    const missingTags: string[] = [];

    for (const token of tokens) {
      const numRange = token.match(/^#?(\d+)\s*[-–—]\s*#?(\d+)$/);
      if (numRange) {
        const start = parseInt(numRange[1], 10);
        const end = parseInt(numRange[2], 10);
        if (!isNaN(start) && !isNaN(end) && start <= end && end - start <= 150) {
          for (let i = start; i <= end; i++) {
            parsedTags.push(String(i));
          }
          continue;
        }
      }
      parsedTags.push(token);
    }

    const normalize = (s: string) => s.toLowerCase().replace(/^[#\s]+/, '').trim();

    for (const tag of parsedTags) {
      const cleanTag = normalize(tag);
      if (!cleanTag) continue;

      const matched = farmCatalogAnimals.find((a) => {
        const aCleanTag = normalize(a.tag);
        const aCleanId = normalize(a.id);
        return (
          aCleanTag === cleanTag ||
          a.tag.toLowerCase() === tag.toLowerCase() ||
          aCleanId === cleanTag ||
          aCleanTag.endsWith(`-${cleanTag}`) ||
          (cleanTag.length >= 3 && aCleanTag.includes(cleanTag))
        );
      });

      if (matched) {
        if (!validAnimals.some((va) => va.id === matched.id)) {
          validAnimals.push(matched);
        }
      } else {
        missingTags.push(tag);
      }
    }

    const isValid = missingTags.length === 0 && validAnimals.length > 0;
    const farmName = targetFarm?.profile?.name || 'el predio seleccionado';
    const message =
      missingTags.length > 0
        ? `❌ El animal/número "${missingTags.join(', ')}" NO existe en el inventario de "${farmName}". Corrija el número o seleccione animales existentes.`
        : undefined;

    return {
      isValid,
      isEmpty: false,
      parsedTags,
      validAnimals,
      missingTags,
      message,
    };
  }, [saleAnimalTags, farmCatalogAnimals, targetFarm]);

  if (!isOpen) return null;

  const handleFetchFromScale = () => {
    if (liveScaleWeight) {
      if (eventType === 'compra' || eventType === 'auction') {
        setQuickAvgWeight(liveScaleWeight.toFixed(1));
      }
    }
  };

  const handleSharePDF = () => {
    const farmName = targetFarm?.profile?.name || 'Finca GanaderIA';
    const currentDate = new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const isInternal = pasajeTransferType === 'rotacion_interna';
    const headsVal = pasajeHeads || '24';
    const avgW = pasajeAvgWeight || '420.0';
    const totalW = (parseFloat(headsVal) * parseFloat(avgW)).toLocaleString('es-CO');

    const originPad = targetPaddocks.find((p) => p.id === pasajeOriginPaddockId);
    const destFarm = farms.find((f) => f.profile.id === pasajeTargetFarmId);
    const destPaddocks = destFarm?.paddocks || [];
    const destPad = isInternal
      ? targetPaddocks.find((p) => p.id === pasajeTargetPaddockId)
      : destPaddocks.find((p) => p.id === pasajeDestinationPaddockId);

    const originLabel = isInternal
      ? `${farmName} — ${originPad ? `${originPad.code} (${originPad.name})` : 'Potrero Origen'}`
      : `${farmName} — ${originPad ? `${originPad.code}` : 'Origen'}`;

    const destLabel = isInternal
      ? `${farmName} — ${destPad ? `${destPad.code} (${destPad.name})` : 'Potrero Destino'}`
      : `${destFarm?.profile.name || 'Predio Destino'} — ${destPad ? `${destPad.code}` : 'Potrero Llegada'}`;

    const reasonMap: Record<string, string> = {
      rotacion_prv: 'Rotación PRV / Voisin (Cumplimiento de descanso)',
      forraje_consumido: 'Forraje Consumido (Altura Remanente)',
      descanso_potrero: 'Mantenimiento / Recuperación Forrajera',
      clasificacion: 'Separación / Clasificación Zootécnica',
      inundacion: 'Anegamiento / Inundación Temporal',
      otro: pasajeCustomReason || 'Manejo Zootécnico',
    };
    const reasonVal = isInternal ? reasonMap[pasajeRotationReason] || pasajeCustomReason : pasajeCustomReason;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Acta de Transferencia y Movilización de Ganado - ${farmName}</title>
        <style>
          @media print {
            @page { margin: 12mm; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            color: #012d1d;
            background-color: #ffffff;
            margin: 0;
            padding: 24px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #012d1d;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .logo {
            font-size: 26px;
            font-weight: 900;
            color: #012d1d;
            letter-spacing: -0.5px;
          }
          .logo span { color: #ffba38; }
          .badge {
            background-color: #012d1d;
            color: #ffba38;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 12px;
            border-radius: 6px;
            text-transform: uppercase;
          }
          .title-section {
            margin-bottom: 20px;
            background: #f0f7ff;
            border: 1.5px solid #90caf9;
            border-radius: 14px;
            padding: 16px 20px;
          }
          .title {
            font-size: 18px;
            font-weight: 800;
            color: #0d47a1;
            margin: 0 0 6px 0;
          }
          .subtitle {
            font-size: 12px;
            color: #475569;
            margin: 0;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .kpi-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 14px;
          }
          .kpi-label {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .kpi-value {
            font-size: 16px;
            font-weight: 900;
            color: #012d1d;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
          }
          .details-table th, .details-table td {
            border: 1px solid #e2e8f0;
            padding: 10px 14px;
            text-align: left;
            font-size: 11.5px;
          }
          .details-table th {
            background-color: #012d1d;
            color: #ffffff;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10.5px;
          }
          .details-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .signature-line {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .sig-box {
            border-top: 1.5px solid #94a3b8;
            text-align: center;
            padding-top: 8px;
            font-size: 11px;
            color: #334155;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Ganader<span>IA</span>.</div>
            <div style="font-size: 11px; color: #475569; font-weight: 600; margin-top: 2px;">Software Inteligente para Ganadería</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">ACTA DE MOVILIZACIÓN INTERNA</span>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">${currentDate}</div>
          </div>
        </div>

        <div class="title-section">
          <h1 class="title">🔄 ${isInternal ? 'Acta de Rotación Interna de Potreros' : 'Guía de Traslado Inter-Predial de Ganado'}</h1>
          <p class="subtitle">Predio Principal: <strong>${farmName}</strong> | Fecha: <strong>${pasajeDate}</strong> a las <strong>${pasajeTime}</strong></p>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">TOTAL CABEZAS</div>
            <div class="kpi-value" style="color: #0d47a1;">${headsVal} Cab.</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">PESO PROMEDIO</div>
            <div class="kpi-value">${avgW} kg</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">PESO TOTAL LOTE</div>
            <div class="kpi-value" style="color: #166534;">${totalW} kg</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">TIPO MOVILIZACIÓN</div>
            <div class="kpi-value" style="font-size: 13px;">${isInternal ? '🌿 Rotación' : '🚚 Inter-Predial'}</div>
          </div>
        </div>

        <table class="details-table">
          <thead>
            <tr>
              <th>Parámetro de Movilización</th>
              <th>Detalle Registrado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Lote / Grupo Bovino</strong></td>
              <td>${pasajeLotNameOrId || 'Lote General'}</td>
            </tr>
            <tr>
              <td><strong>Punto de Origen (Salida)</strong></td>
              <td><strong>${originLabel}</strong></td>
            </tr>
            <tr>
              <td><strong>Punto de Destino (Llegada)</strong></td>
              <td><strong>${destLabel}</strong></td>
            </tr>
            <tr>
              <td><strong>Motivo / Justificación</strong></td>
              <td>${reasonVal || 'Rotación de pasturas'}</td>
            </tr>
            ${
              !isInternal
                ? `
            <tr>
              <td><strong>Guía Sanitaria GSMI ICA</strong></td>
              <td><strong style="color: #0d47a1;">${pasajeIcaGuideNumber || 'S/N'}</strong></td>
            </tr>
            <tr>
              <td><strong>Remisión / Despacho</strong></td>
              <td>${pasajeRemisionNumber || 'S/N'}</td>
            </tr>
            <tr>
              <td><strong>Transporte & Placa</strong></td>
              <td>${pasajeTransportMode.toUpperCase()} • Placa: <strong>${pasajeTruckPlate}</strong> (${pasajeTransporterName} - Tel: ${pasajeTransporterPhone})</td>
            </tr>
            <tr>
              <td><strong>Costo de Flete</strong></td>
              <td>$${parseInt(pasajeFreightCost, 10).toLocaleString('es-CO')} COP</td>
            </tr>
            `
                : ''
            }
            <tr>
              <td><strong>Responsable de Despacho / Arreo</strong></td>
              <td>${pasajeDispatcher || 'Capataz de Campo'}</td>
            </tr>
            ${
              !isInternal
                ? `
            <tr>
              <td><strong>Responsable de Recepción</strong></td>
              <td>${pasajeReceiver || 'Administrador Destino'}</td>
            </tr>
            `
                : ''
            }
            <tr>
              <td><strong>Observaciones y Estado del Ganado</strong></td>
              <td>${pasajeNotes || 'Sin novedades. Cumple con los requerimientos sanitarios y de bienestar animal.'}</td>
            </tr>
          </tbody>
        </table>

        <div class="signature-line">
          <div class="sig-box">Firma Responsable Despacho / Arreo<br><span style="font-size: 9.5px; font-weight: normal; color: #64748b;">${pasajeDispatcher}</span></div>
          <div class="sig-box">Firma Responsable Recepción / Veedor<br><span style="font-size: 9.5px; font-weight: normal; color: #64748b;">${isInternal ? 'Mayordomo de Campo' : pasajeReceiver}</span></div>
        </div>

        <div class="footer">
          <div>GanaderIA • Sistema Integral de Gestión Ganadera</div>
          <div>Copia Oficial en PDF • ${farmName}</div>
        </div>
      </body>
      </html>
    `;
    printHTML(htmlContent);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const farmName = targetFarm?.profile?.name || 'Predio';

    // 1. COMPRA DE GANADO (SUBASTA O PARTICULAR)
    if (eventType === 'compra' || eventType === 'auction') {
      const subastaName =
        sellerType === 'subasta'
          ? auctionEntity === 'Otro / Particular'
            ? customAuctionEntity || 'Subasta Comercial'
            : auctionEntity
          : `${sellerName || 'Proveedor Particular'} (${sellerType.toUpperCase()})`;

      let finalAnimals = [...importedAnimals];
      let headsCount = 0;
      let calculatedAvgWeight = 0;

      if (auctionEntryMode === 'excel' && finalAnimals.length > 0) {
        headsCount = finalAnimals.length;
        const sumWeight = finalAnimals.reduce((acc, curr) => acc + curr.weightKg, 0);
        calculatedAvgWeight = Number((sumWeight / headsCount).toFixed(1));
      } else {
        headsCount = parseInt(quickHeads, 10) || 20;
        calculatedAvgWeight = parseFloat(quickAvgWeight) || 350;
        const unitPrice = parseFloat(pricePerKg) || 8750;

        finalAnimals = Array.from({ length: headsCount }, (_, idx) => ({
          id: `anim-compra-${Date.now()}-${idx}`,
          tag: `#CMP-${8000 + idx + 1}`,
          weightKg: calculatedAvgWeight,
          sex: quickSex === 'Hembras' ? 'hembra' : 'macho',
          breed: quickBreed,
          pricePerKg: unitPrice,
          totalPrice: Math.round(calculatedAvgWeight * unitPrice),
          lotCode: invoiceNumber,
          ageMonths: calculatedAvgWeight < 220 ? 8 : 22,
          notes: `Compra ${sellerType}: ${lotName}. Vendedor: ${sellerName || subastaName}`,
        }));
      }

      const selectedIron = brandingIrons.find((i) => i.id === selectedBrandingIronId);
      const ironName = selectedIron ? `${selectedIron.symbolIcon || '🔥'} ${selectedIron.name}` : undefined;

      const newLotData: NewLotRegistrationInput = {
        farmId: selectedFarmId,
        lotName: lotName.trim() || `Lote Compra ${invoiceNumber}`,
        category: lotCategory,
        categoryLabel:
          lotCategory === 'ceba'
            ? 'CEBA INTENSIVA'
            : lotCategory === 'cria'
            ? 'CRÍA / LEVANTE'
            : lotCategory === 'leche'
            ? 'LECHERÍA'
            : 'GENÉTICA',
        sourceType: sellerType === 'subasta' ? 'subasta' : 'compra_directa',
        sourceEntity: subastaName,
        invoiceNumber,
        purchaseDate: new Date().toLocaleDateString('es-CO'),
        paddockId: selectedPaddockId || undefined,
        pricePerKg: parseFloat(pricePerKg) || 8750,
        freightCost: parseFloat(freightCost) || 0,
        heads: headsCount,
        currentAvgWeight: calculatedAvgWeight,
        targetWeight: calculatedAvgWeight + 120,
        ageRange: calculatedAvgWeight < 220 ? '8-14 Meses' : '18-28 Meses',
        sexLabel: quickSex === 'Hembras' ? 'Hembras de Levante' : 'Machos de Ceba',
        breed: quickBreed,
        brandingIron: ironName,
        commercialPurpose: lotCategory === 'ceba' ? 'Ceba y Engorde' : 'Cría y Reproducción',
        sourceFarmName: subastaName,
        targetPaddockName: targetPaddocks.find((p) => p.id === selectedPaddockId)?.name,
        sanitaryClearanceVerified: true,
        pastureType:
          targetPaddocks.find((p) => p.id === selectedPaddockId)?.pastureType ||
          targetFarm?.profile?.notes?.slice(0, 30) ||
          'Brachiaria Brizantha',
        animals: finalAnimals,
        notes: `Comprado en ${subastaName} (Factura: ${invoiceNumber}). Vendedor: ${sellerName || 'N/A'} (Tel: ${
          sellerPhone || 'S/N'
        }, Doc: ${sellerDoc || 'S/N'}). Sanidad: ${sellerSanitaryStatus}. Asignado a ${farmName}.`,
      };

      onRegisterAuctionLot(newLotData);

      onAddActivity(
        `Compra Ganado: ${newLotData.lotName}`,
        `${headsCount} Cab. asignadas a ${farmName} • Fact: ${invoiceNumber} • Proveedor: ${subastaName}${
          sellerName ? ` (${sellerName})` : ''
        }`,
        `+${headsCount} Cab.`,
        'weigh',
      );
    }
    // 2. VENTA DE GANADO (SALIDA COMERCIAL)
    else if (eventType === 'venta') {
      if (!saleAnimalTags || !saleAnimalTags.trim()) {
        setSaleError('La identificación de # ANIMAL / # CHAPETA es OBLIGATORIA. Seleccione o ingrese animales registrados en el predio.');
        return;
      }

      // Restrict Sale: Non-existent animals or number errors are strictly blocked
      if (!saleTagValidation.isValid) {
        setSaleError(
          saleTagValidation.message ||
            `❌ BLOQUEO DE SEGURIDAD: Los animales ingresados no existen en el inventario de "${targetFarm?.profile?.name || 'este predio'}". No puede cargar animales no registrados.`
        );
        return;
      }
      setSaleError(null);

      const heads = saleTagValidation.validAnimals.length > 0 ? saleTagValidation.validAnimals.length : parseInt(saleHeads, 10) || 1;
      const avgW = parseFloat(saleAvgWeight) || 450;
      const priceKg = parseFloat(salePricePerKg) || 9800;
      const totalAmount =
        salePricingType === 'kilo'
          ? Math.round(heads * avgW * priceKg)
          : parseFloat(salePriceTotalCustom) || 0;

      const guideText = saleIcaGuideNumber ? ` • Guía ICA: ${saleIcaGuideNumber}` : '';
      const invoiceText = saleInvoiceNumber ? ` • Factura: ${saleInvoiceNumber}` : '';
      const selectedIron = brandingIrons.find((i) => i.id === saleBrandingIronId);
      const ironName = selectedIron ? `${selectedIron.symbolIcon || '🔥'} ${selectedIron.name}` : undefined;

      if (onRegisterLivestockMovement) {
        onRegisterLivestockMovement({
          movementType: 'salida_venta',
          date: new Date().toLocaleDateString('es-CO'),
          lotId: saleLotId || undefined,
          lotName: saleLotName || `${heads} Cabezas Vendidas`,
          category: saleCategory,
          categoryLabel: saleCategory === 'ceba' ? 'CEBA COMERCIAL' : 'CRÍA / VIENTRES',
          sexLabel: saleSex,
          breed: saleBreed,
          ageRange: saleAgeRange,
          brandingIron: ironName,
          commercialPurpose: saleCommercialPurpose,
          headsMoved: heads,
          avgWeightKg: avgW,
          totalWeightKg: heads * avgW,
          sourceFarmId: selectedFarmId,
          sourceFarmName: farmName,
          sourcePaddockId: salePaddockId || undefined,
          sourcePaddockName: targetPaddocks.find((p) => p.id === salePaddockId)?.name,
          buyerOrDestination: saleBuyer,
          buyerDoc: saleBuyerDoc,
          salePricePerKg: salePricingType === 'kilo' ? priceKg : undefined,
          salePriceTotal: totalAmount,
          invoiceOrGuideNumber: saleIcaGuideNumber || saleInvoiceNumber,
          sanitaryClearanceVerified: saleSanitaryWithdrawalClear,
          notes: `${saleNotes} | Raza: ${saleBreed} | Color: ${saleColor} | Edad: ${saleAgeRange} | Sexo: ${saleSex}${saleAnimalTags ? ` | Aretes: ${saleAnimalTags}` : ''}`,
        });
      }

      onAddActivity(
        `Venta Ganado: ${saleLotName || `${heads} Cabezas`}`,
        `${heads} Cab. (${saleBreed}, ${saleColor}, ${saleSex}) vendidas a ${saleBuyer || 'Comprador'}${guideText}${invoiceText} • Destino: ${saleDestination || 'Comercial'} • Total: $${totalAmount.toLocaleString('es-CO')} COP`,
        `-${heads} Cab. 💰`,
        'weigh',
      );
    }
    // 3. NACIMIENTOS
    else if (eventType === 'birth') {
      if (!parentTag || !parentTag.trim()) {
        setBirthError('La información de la MADRE Biológica es obligatoria para registrar el nacimiento.');
        return;
      }
      setBirthError(null);

      const originFarmObj = farms.find((f) => f.profile.id === birthOriginFarmId);
      const originFarmName =
        birthOriginFarmId === 'custom'
          ? customOriginFarmName.trim() || 'Predio de Origen'
          : originFarmObj?.profile.name || farmName;

      const maternityPad = targetPaddocks.find((p) => p.id === birthMaternityPaddockId);
      const maternityLocation = maternityPad ? ` • Potrero: ${maternityPad.code} (${maternityPad.name})` : '';

      const selectedIron = brandingIrons.find((i) => i.id === selectedBrandingIronId);
      const ironText = selectedIron ? ` • Hierro: ${selectedIron.symbolIcon || '🔥'} ${selectedIron.name}` : '';

      const deliveryMap: Record<string, string> = {
        eutocico: 'Eutócico (Normal)',
        distocico_asistido: 'Distócico (Asistido)',
        cesarea: 'Cesárea',
        mortinato: 'Mortinato (Nacido muerto)',
      };

      const conceptionMap: Record<string, string> = {
        monta_natural: 'Monta Natural',
        ia: 'Inseminación Artificial (IA)',
        iatf: 'IATF',
        te_fiv: 'Transferencia de Embriones (TE / FIV)',
      };

      const condText = calvingCondition === 'multiple' ? ' • Mellizo/Gemelo 👥' : ' • Simple';
      const surrogateText = surrogateDamTag.trim() ? ` • Receptora TE: ${surrogateDamTag.trim()}` : '';
      const colostrumText = colostrumFed ? ` • Calostro: Sí (${colostrumHoursPostCalving}h)` : ' • Calostro: No suministrado';
      const navelText = navelDisinfected ? ' • Ombligo curado' : ' • Ombligo sin curar';

      onAddActivity(
        `Nacimiento - Ternero ${tag} (${originFarmName})`,
        `Madre: ${parentTag.trim()}${surrogateText} • Padre: ${birthSireTag.trim() || 'Desconocido'} • Concepción: ${conceptionMap[conceptionMethod] || conceptionMethod} • Parto: ${deliveryMap[deliveryType] || deliveryType}${condText} • Vigor: ${vigorScore}/5 • Sexo: ${birthSex} • Raza: ${birthBreed} (${birthPurityPct}) • Color: ${birthColor}${ironText}${colostrumText}${navelText}${maternityLocation} • Operario: ${operatorResponsible}`,
        `${individualWeight} kg`,
        'birth',
      );
    }
    // 4. RECIBIDOS EN SOCIEDAD
    else if (eventType === 'sociedad') {
      const heads = parseInt(sociedadHeads, 10) || 10;
      const avgW = parseFloat(sociedadAvgWeight) || 250;
      const priceKg = parseFloat(sociedadPricePerKg) || 8200;
      const selectedIron = brandingIrons.find((i) => i.id === sociedadBrandingIronId);
      const ironName = selectedIron ? `${selectedIron.symbolIcon || '🔥'} ${selectedIron.name}` : undefined;

      const sociedadLotData: NewLotRegistrationInput = {
        farmId: selectedFarmId,
        lotName: `Sociedad - ${partnerName || 'Socio'} (${shareScheme.slice(0, 20)})`,
        category: sociedadCategory,
        categoryLabel: 'RECIBIDO EN SOCIEDAD',
        sourceType: 'compra_directa',
        sourceEntity: `Sociedad / Alianza con ${partnerName || 'Socio'}`,
        invoiceNumber: `SOC-${Date.now().toString().slice(-4)}`,
        purchaseDate: new Date().toLocaleDateString('es-CO'),
        paddockId: sociedadPaddockId || undefined,
        pricePerKg: priceKg,
        freightCost: 0,
        heads: heads,
        currentAvgWeight: avgW,
        targetWeight: avgW + 150,
        ageRange: sociedadAgeRange,
        sexLabel: sociedadSex,
        breed: sociedadBreed,
        brandingIron: ironName,
        commercialPurpose: sociedadCommercialPurpose,
        partnerName: partnerName,
        partnerDoc: partnerDoc,
        partnerPhone: partnerPhone,
        shareScheme: shareScheme,
        targetPaddockName: targetPaddocks.find((p) => p.id === sociedadPaddockId)?.name,
        sanitaryClearanceVerified: true,
        animals: Array.from({ length: heads }, (_, idx) => ({
          id: `anim-soc-${Date.now()}-${idx}`,
          tag: `#SOC-${7000 + idx + 1}`,
          weightKg: avgW,
          sex: sociedadSex.toLowerCase().includes('hembra') ? 'hembra' : 'macho',
          breed: sociedadBreed,
          color: sociedadColor,
          pricePerKg: priceKg,
          totalPrice: Math.round(avgW * priceKg),
          lotCode: `SOC-${(partnerName || 'SOC').slice(0, 3).toUpperCase()}`,
          notes: `Recibido en sociedad con ${partnerName}. Color: ${sociedadColor}. Esquema: ${shareScheme}`,
        })),
        notes: `Recibido en sociedad. Socio: ${partnerName} (CC/NIT: ${partnerDoc}, Tel: ${partnerPhone}). Esquema: ${shareScheme}. Raza: ${sociedadBreed}. Color: ${sociedadColor}.${sociedadAnimalTags ? ` Aretes: ${sociedadAnimalTags}.` : ''} ${sociedadNotes}`,
      };

      onRegisterAuctionLot(sociedadLotData);

      onAddActivity(
        `Recibido en Sociedad: ${partnerName || 'Socio'}`,
        `${heads} Cab. (${sociedadBreed}, ${sociedadColor}, ${avgW} kg prom.) • Participación: ${shareScheme} • Asignado a ${farmName}`,
        `+${heads} Cab.`,
        'weigh',
      );
    }
    // 5. TRANSFERENCIA INTERNA & TRASLADOS
    else if (eventType === 'pasaje') {
      const heads = parseInt(pasajeHeads, 10) || 1;
      const avgW = parseFloat(pasajeAvgWeight) || 420;
      const selectedIron = brandingIrons.find((i) => i.id === pasajeBrandingIronId);
      const ironName = selectedIron ? `${selectedIron.symbolIcon || '🔥'} ${selectedIron.name}` : undefined;

      const originPad = targetPaddocks.find((p) => p.id === pasajeOriginPaddockId);
      const destFarm = farms.find((f) => f.profile.id === pasajeTargetFarmId);
      const destPaddocks = destFarm?.paddocks || [];
      const destPad = pasajeTransferType === 'traslado_interpredial'
        ? destPaddocks.find((p) => p.id === pasajeDestinationPaddockId)
        : targetPaddocks.find((p) => p.id === pasajeTargetPaddockId);

      if (onRegisterLivestockMovement) {
        onRegisterLivestockMovement({
          movementType: 'transferencia_interna',
          date: pasajeDate,
          lotId: pasajeLotId || undefined,
          lotName: pasajeLotNameOrId,
          category: pasajeCategory,
          categoryLabel: pasajeCategory === 'ceba' ? 'CEBA INTENSIVA' : 'CRÍA / TRASLADO',
          sexLabel: pasajeSex,
          breed: pasajeBreed,
          ageRange: pasajeAgeRange,
          brandingIron: ironName,
          commercialPurpose: pasajeCommercialPurpose,
          headsMoved: heads,
          avgWeightKg: avgW,
          totalWeightKg: heads * avgW,
          sourceFarmId: selectedFarmId,
          sourceFarmName: farmName,
          sourcePaddockId: pasajeOriginPaddockId,
          sourcePaddockName: originPad?.name,
          targetFarmId: pasajeTransferType === 'traslado_interpredial' ? pasajeTargetFarmId : selectedFarmId,
          targetFarmName: pasajeTransferType === 'traslado_interpredial' ? destFarm?.profile.name : farmName,
          targetPaddockId: pasajeTransferType === 'traslado_interpredial' ? pasajeDestinationPaddockId : pasajeTargetPaddockId,
          targetPaddockName: destPad?.name,
          transporterName: pasajeTransporterName,
          transporterPhone: pasajeTransporterPhone,
          truckPlate: pasajeTruckPlate,
          freightCost: parseFloat(pasajeFreightCost) || 0,
          invoiceOrGuideNumber: pasajeIcaGuideNumber,
          causeOrReason: pasajeRotationReason,
          sanitaryClearanceVerified: pasajeWithdrawalVerified,
          notes: `${pasajeNotes} | Raza: ${pasajeBreed} | Color: ${pasajeColor} | Sexo: ${pasajeSex}${pasajeAnimalTags ? ` | Aretes: ${pasajeAnimalTags}` : ''}`,
        });
      }

      if (pasajeTransferType === 'rotacion_interna') {
        const targetPad = targetPaddocks.find((p) => p.id === pasajeTargetPaddockId);
        const originLabel = originPad ? `${originPad.code} - ${originPad.name}` : 'Potrero Origen';
        const targetLabel = targetPad ? `${targetPad.code} - ${targetPad.name}` : 'Potrero Destino';

        const reasonMap: Record<string, string> = {
          rotacion_prv: 'Rotación PRV / Voisin',
          forraje_consumido: 'Forraje Consumido (Altura Remanente)',
          descanso_potrero: 'Mantenimiento / Descanso de Potrero',
          clasificacion: 'Separación / Clasificación de Hato',
          inundacion: 'Anegamiento / Inundación Temporal',
          otro: pasajeCustomReason || 'Manejo Zootécnico',
        };
        const reasonText = reasonMap[pasajeRotationReason] || pasajeCustomReason || 'Rotación de pasturas';

        onAddActivity(
          `Rotación Interna: ${pasajeLotNameOrId || `${heads} Cabezas`}`,
          `[${originLabel}] ➔ [${targetLabel}] • ${heads} Cab. (${pasajeBreed}, ${pasajeColor}, ${avgW} kg prom.) • Causa: ${reasonText} • Arreo por: ${pasajeDispatcher} • Predio: ${farmName}. ${pasajeNotes}`,
          `${heads} Cab. 🔄`,
          'weigh',
        );
      } else {
        // Traslado Inter-Predial
        const originFarmName = farmName;
        const targetFarmName = destFarm?.profile.name || 'Predio Destino';
        const originPadText = originPad ? ` (${originPad.code})` : '';
        const destPadText = destPad ? ` (${destPad.code})` : '';

        const transportLabel =
          pasajeTransportMode === 'a_pie'
            ? 'Arreo a Pie'
            : pasajeTransportMode === 'camion_sencillo'
            ? `Camión Sencillo [${pasajeTruckPlate}]`
            : pasajeTransportMode === 'doble_troque'
            ? `Doble Troque [${pasajeTruckPlate}]`
            : `Tractomula Ganadera [${pasajeTruckPlate}]`;

        const guideText = pasajeIcaGuideNumber ? ` • GSMI ICA: ${pasajeIcaGuideNumber}` : '';
        const remisionText = pasajeRemisionNumber ? ` • Rem: ${pasajeRemisionNumber}` : '';
        const freightText =
          parseInt(pasajeFreightCost, 10) > 0
            ? ` • Flete: $${parseInt(pasajeFreightCost, 10).toLocaleString('es-CO')} COP`
            : '';

        onAddActivity(
          `Traslado Inter-Predial: ${pasajeLotNameOrId || `${heads} Cabezas`}`,
          `[${originFarmName}${originPadText}] ➔ [${targetFarmName}${destPadText}] • ${heads} Cab. (${pasajeBreed}, ${pasajeColor}, ${avgW} kg prom.) • ${transportLabel} (${pasajeTransporterName})${guideText}${remisionText}${freightText} • Despacha: ${pasajeDispatcher} | Recibe: ${pasajeReceiver}. ${pasajeNotes}`,
          `${heads} Cab. 🚚`,
          'weigh',
        );
      }
    }
    // 6. DAR DE BAJA (MUERTE, PÉRDIDA, SACRIFICIO, ENFERMEDAD)
    else if (eventType === 'baja') {
      const heads = parseInt(bajaHeads, 10) || 1;
      const reasonTitle =
        bajaReason === 'muerte'
          ? 'Muerte Natural / Accidente'
          : bajaReason === 'perdida'
          ? 'Pérdida / Abigeato'
          : bajaReason === 'sacrificio'
          ? 'Sacrificio de Emergencia'
          : 'Descarte Sanitario / Enfermedad';

      const lossText = bajaEstimatedLoss ? ` • Pérdida Estimada: ${parseInt(bajaEstimatedLoss, 10).toLocaleString('es-CO')} COP` : '';
      const docText = bajaDocumentRef ? ` • Ref: ${bajaDocumentRef}` : '';
      const vetText = bajaWitnessOrVet ? ` • Certifica: ${bajaWitnessOrVet}` : '';
      const selectedIron = brandingIrons.find((i) => i.id === bajaBrandingIronId);
      const ironName = selectedIron ? `${selectedIron.symbolIcon || '🔥'} ${selectedIron.name}` : undefined;

      if (onRegisterLivestockMovement) {
        onRegisterLivestockMovement({
          movementType: bajaReason === 'muerte' ? 'salida_muerte' : 'salida_sacrificio',
          date: bajaDate,
          lotId: bajaLotId || undefined,
          lotName: bajaAnimalTagOrLot,
          category: 'ceba',
          categoryLabel: bajaCategory,
          sexLabel: bajaSex,
          breed: bajaBreed,
          ageRange: bajaAge,
          brandingIron: ironName,
          headsMoved: heads,
          avgWeightKg: parseFloat(bajaWeightKg) || 380,
          totalWeightKg: heads * (parseFloat(bajaWeightKg) || 380),
          sourceFarmId: selectedFarmId,
          sourceFarmName: farmName,
          sourcePaddockId: bajaPaddockId || undefined,
          sourcePaddockName: targetPaddocks.find((p) => p.id === bajaPaddockId)?.name,
          causeOrReason: `${bajaReason}: ${bajaSpecificCause}`,
          notes: `${bajaNotes} | Ref: ${bajaDocumentRef} | Raza: ${bajaBreed} | Color: ${bajaColor} | Sexo: ${bajaSex} | Pérdida: ${bajaEstimatedLoss} | Testigo: ${bajaWitnessOrVet}`,
        });
      }

      onAddActivity(
        `Baja de Inventario (${reasonTitle}): ${bajaAnimalTagOrLot || `${heads} Cab.`}`,
        `Causa: ${bajaSpecificCause} (${bajaBreed}, ${bajaColor}, ${bajaSex}) • Fecha: ${bajaDate} • Ubicación: ${farmName}${docText}${lossText}${vetText}. ${bajaNotes}`,
        `-${heads} Cab. ⚠️`,
        'health',
      );
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#012d1d', '#ffba38', '#c1ecd4', '#2d6a4f'],
    });

    onClose();
  };

  const getEventHeaderDetails = () => {
    switch (eventType) {
      case 'compra':
      case 'auction':
        return {
          title: 'COMPRA DE GANADO & INGRESO DE LOTE',
          description: 'Ingreso de nuevo lote de ganado por compra particular o en subasta comercial.',
          icon: <Coins className="w-4 h-4 text-amber-300" />,
          bgColor: 'bg-[#012d1d] text-emerald-300',
        };
      case 'venta':
        return {
          title: 'VENTA DE GANADO & SALIDA COMERCIAL',
          description: 'Registro de venta a frigorífico, subasta o particular con liquidación en báscula y guía ICA.',
          icon: <DollarSign className="w-4 h-4 text-emerald-300" />,
          bgColor: 'bg-emerald-950 text-emerald-100',
        };
      case 'birth':
        return {
          title: 'REGISTRO DE PARTO O NACIMIENTO',
          description: 'Registro de crías nacidas en el predio, asignación de madre, padre, peso neonatal y chapa.',
          icon: <Baby className="w-4 h-4 text-cyan-300" />,
          bgColor: 'bg-cyan-950 text-cyan-100',
        };
      case 'pasaje':
        return {
          title: 'TRANSFERENCIA INTERNA & TRASLADOS',
          description: 'Rotación de potreros o traslado de animales entre predios con guía sanitaria ICA.',
          icon: <Truck className="w-4 h-4 text-blue-300" />,
          bgColor: 'bg-blue-950 text-blue-100',
        };
      case 'sociedad':
        return {
          title: 'GANADO EN SOCIEDAD / AL AUMENTO',
          description: 'Ingreso de inventario bajo contrato de sociedad ganadera o esquema de aumento.',
          icon: <Handshake className="w-4 h-4 text-teal-300" />,
          bgColor: 'bg-teal-950 text-teal-100',
        };
      case 'baja':
        return {
          title: 'DAR DE BAJA & SALIDA DE INVENTARIO',
          description: 'Bajas por Muerte, Pérdida/Hurto, Sacrificio de Emergencia o Enfermedad/Descarte sanitario.',
          icon: <AlertTriangle className="w-4 h-4 text-rose-300" />,
          bgColor: 'bg-rose-950 text-rose-100',
        };
      default:
        return {
          title: 'NUEVO EVENTO GANADERO',
          description: 'Registro técnico de actividades y novedades del hato.',
          icon: <ClipboardList className="w-4 h-4 text-emerald-300" />,
          bgColor: 'bg-[#012d1d] text-emerald-300',
        };
    }
  };

  const headerDetails = getEventHeaderDetails();

  const getFarmRoleDetails = () => {
    switch (eventType) {
      case 'compra':
      case 'auction':
        return {
          title: 'Predio Destino:',
          actionLabel: 'Ingreso de Inventario',
          badge: 'Destino de Compra',
        };
      case 'venta':
        return {
          title: 'Predio de Origen:',
          actionLabel: 'Salida Comercial de Ganado',
          badge: 'Origen de Venta',
        };
      case 'birth':
        return {
          title: 'Predio de Nacimiento:',
          actionLabel: 'Asignación de Crías al Hato',
          badge: 'Origen de Parto',
        };
      case 'pasaje':
        return {
          title: 'Predio de Salida:',
          actionLabel: 'Origen del Traslado / Movimiento',
          badge: 'Origen de Movimiento',
        };
      case 'sociedad':
        return {
          title: 'Predio Receptor:',
          actionLabel: 'Pastos & Asignación en Sociedad',
          badge: 'Predio de Alianza',
        };
      case 'baja':
        return {
          title: 'Predio del Hato Afectado:',
          actionLabel: 'Salida de Inventario por Novedad',
          badge: 'Predio de la Baja',
        };
      default:
        return {
          title: 'Predio Seleccionado:',
          actionLabel: 'Asignación de Inventario',
          badge: 'Predio Activo',
        };
    }
  };

  const getFarmChangeConfirmDetails = () => {
    switch (eventType) {
      case 'compra':
      case 'auction':
        return {
          title: '¿Confirmar Cambio de Predio de Destino?',
          roleLabel: 'Nuevo Predio Destino:',
          note: 'Al confirmar el cambio, este nuevo lote de compra, sus animales y los potreros se registrarán y asociarán en el inventario del nuevo predio seleccionado.',
          btnText: 'Sí, Cambiar Predio de Destino',
        };
      case 'venta':
        return {
          title: '¿Confirmar Cambio de Predio de Venta?',
          roleLabel: 'Nuevo Predio de Salida:',
          note: 'Al cambiar de predio, se actualizarán los lotes, potreros y animales correspondientes a la nueva finca para registrar la salida comercial.',
          btnText: 'Sí, Cambiar Predio de Venta',
        };
      case 'birth':
        return {
          title: '¿Confirmar Cambio de Predio de Nacimiento?',
          roleLabel: 'Nuevo Predio de Nacimiento:',
          note: 'Al cambiar de predio, el nuevo nacimiento, la matriz y el ternero quedarán asociados al inventario de la nueva finca seleccionada.',
          btnText: 'Sí, Cambiar Predio de Nacimiento',
        };
      case 'pasaje':
        return {
          title: '¿Confirmar Cambio de Predio de Origen?',
          roleLabel: 'Nuevo Predio de Salida:',
          note: 'Al cambiar de predio, los lotes y potreros de salida se actualizarán con los de la nueva finca seleccionada.',
          btnText: 'Sí, Cambiar Predio de Origen',
        };
      case 'sociedad':
        return {
          title: '¿Confirmar Cambio de Predio Receptor?',
          roleLabel: 'Nuevo Predio Receptor:',
          note: 'Al cambiar de predio, los animales en sociedad y los potreros de pastoreo se asignarán a la nueva finca seleccionada.',
          btnText: 'Sí, Cambiar Predio Receptor',
        };
      case 'baja':
        return {
          title: '¿Confirmar Cambio de Predio para la Baja?',
          roleLabel: 'Nuevo Predio Afectado:',
          note: 'Al cambiar de predio, se actualizará el inventario y potreros de la finca donde ocurrió la novedad del animal.',
          btnText: 'Sí, Cambiar Predio de la Baja',
        };
      default:
        return {
          title: '¿Confirmar Cambio de Predio?',
          roleLabel: 'Nuevo Predio:',
          note: 'Al cambiar de predio, todos los datos del evento se registrarán en la nueva finca seleccionada.',
          btnText: 'Sí, Cambiar Predio',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl max-w-5xl lg:max-w-6xl w-full p-5 md:p-7 border-2 border-[#c1c8c2] shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[94vh] flex flex-col">
        {/* Dynamic Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${headerDetails.bgColor}`}>
                {headerDetails.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#012d1d]">{headerDetails.title}</h3>
            </div>
            <p className="text-xs text-[#717973] mt-0.5">
              {headerDetails.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#717973] hover:text-black hover:bg-[#f3f3f3] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Core Functional Tabs for "Nuevo Registro" */}
        <div className="bg-[#f4f7f5] border border-[#d1ded7] p-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 my-2 rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => setEventType('compra')}
            className={`px-3 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              eventType === 'compra' || eventType === 'auction'
                ? 'bg-[#012d1d] text-white shadow-xs ring-1 ring-[#001b10]'
                : 'bg-white hover:bg-emerald-50 text-[#314a3e] border border-[#c8d9cf]'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-[#ffba38]" />
            <span>Compra</span>
          </button>

          <button
            type="button"
            onClick={() => setEventType('venta')}
            className={`px-3 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              eventType === 'venta'
                ? 'bg-emerald-800 text-white shadow-xs ring-1 ring-emerald-950'
                : 'bg-white hover:bg-emerald-50 text-[#314a3e] border border-[#c8d9cf]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-[#c1ecd4]" />
            <span>Venta</span>
          </button>

          <button
            type="button"
            onClick={() => setEventType('birth')}
            className={`px-3 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              eventType === 'birth'
                ? 'bg-cyan-800 text-white shadow-xs ring-1 ring-cyan-950'
                : 'bg-white hover:bg-cyan-50 text-[#314a3e] border border-[#c8d9cf]'
            }`}
          >
            <Baby className="w-3.5 h-3.5 text-cyan-300" />
            <span>Parto o Nacimiento</span>
          </button>

          <button
            type="button"
            onClick={() => setEventType('pasaje')}
            className={`px-3 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              eventType === 'pasaje'
                ? 'bg-blue-800 text-white shadow-xs ring-1 ring-blue-950'
                : 'bg-white hover:bg-blue-50 text-[#314a3e] border border-[#c8d9cf]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-300" />
            <span>Transferencia Interna</span>
          </button>

          <button
            type="button"
            onClick={() => setEventType('sociedad')}
            className={`px-3 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              eventType === 'sociedad'
                ? 'bg-teal-800 text-white shadow-xs ring-1 ring-teal-950'
                : 'bg-white hover:bg-teal-50 text-[#314a3e] border border-[#c8d9cf]'
            }`}
          >
            <Handshake className="w-3.5 h-3.5 text-teal-300" />
            <span>Sociedad</span>
          </button>

          <button
            type="button"
            onClick={() => setEventType('baja')}
            className={`px-3 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              eventType === 'baja'
                ? 'bg-rose-900 text-white shadow-xs ring-1 ring-rose-950'
                : 'bg-white hover:bg-rose-50 text-[#7f1d1d] border border-[#fecaca]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Dar de Baja (Muerte / Pérdida / Sacrificio / Enfermedad)</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 my-3 overflow-y-auto flex-1 pr-1 text-xs">
          {/* PREDIO ACTIVO DISCRETO (Heredado del Panel Principal con Confirmación al Cambiar para Todos los Eventos) */}
          <div className="bg-[#f7faf8] border border-[#d2ded7] rounded-xl px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#e1efe6] border border-[#c1ecd4] flex items-center justify-center text-[#2d6a4f] shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-[#717973] uppercase tracking-wide">
                    {getFarmRoleDetails().title}
                  </span>
                  <span className="font-extrabold text-xs text-[#012d1d] truncate">
                    {targetFarm?.profile?.name || 'Predio Principal'}
                  </span>
                  <span className="text-[9px] bg-[#e8f5e9] text-[#1b5e20] border border-[#c8e6c9] font-bold px-2 py-0.5 rounded-full">
                    {selectedFarmId === currentFarmId ? 'Ruta activa del panel principal' : 'Predio alternativo'}
                  </span>
                </div>
                <p className="text-[10px] text-[#717973] truncate mt-0.5">
                  📍 {targetFarm?.profile?.municipality}, {targetFarm?.profile?.department} • {targetFarm?.headsCount || targetFarm?.profile?.headsCount || 0} cabezas • {targetPaddocks.length} potreros disponibles
                </p>
              </div>
            </div>

            {/* Lista menos visible para cambiar de predio con confirmación */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 shadow-2xs">
              <span className="text-[10px] font-semibold text-[#717973]">Cambiar predio:</span>
              <select
                value={selectedFarmId}
                onChange={(e) => handleInitiateFarmChange(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-[#012d1d] focus:outline-none cursor-pointer pr-1 max-w-[190px] truncate"
              >
                {farms.map((f) => (
                  <option key={f.profile.id} value={f.profile.id}>
                    {f.profile.name} ({f.profile.municipality}) {f.profile.id === currentFarmId ? '★ Principal' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ========================================== */}
          {/* MÓDULO 1: COMPRA DE GANADO CON INF. VENDEDOR */}
          {/* ========================================== */}
          {(eventType === 'compra' || eventType === 'auction') && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#fbfbfb] border border-[#d6e2db] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
                  <p className="text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-[#dc9a00]" />
                    Información de la Compra & Origen del Ganado
                  </p>
                  <span className="text-[10px] bg-[#e8f5e9] text-[#1b5e20] font-mono font-bold px-2 py-0.5 rounded">
                    Módulo de Compras
                  </span>
                </div>

                {/* Seleccionar Origen / Vendedor (Subasta vs Particular, etc) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Origen / Tipo de Vendedor *
                    </label>
                    <select
                      value={sellerType}
                      onChange={(e) => setSellerType(e.target.value as any)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-2 font-bold text-xs text-[#012d1d]"
                    >
                      <option value="subasta">🏛️ Subasta Comercial (Subastar, Cogasucre, etc)</option>
                      <option value="particular">👤 Particular / Ganadero Directo</option>
                      <option value="comerciante">💼 Comerciante / Intermediario</option>
                      <option value="finca">🏡 Finca / Criadero Vecino</option>
                      <option value="empresa">🏢 Empresa Comercializadora</option>
                    </select>
                  </div>

                  {sellerType === 'subasta' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Entidad / Subasta
                      </label>
                      <select
                        value={auctionEntity}
                        onChange={(e) => setAuctionEntity(e.target.value)}
                        className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-2 font-semibold text-xs"
                      >
                        <option value="Subastar S.A. (Montería / Planeta Rica)">Subastar S.A. (Córdoba)</option>
                        <option value="Subacasanare (Yopal / Aguazul)">Subacasanare (Casanare / Meta)</option>
                        <option value="Cogasucre (Sincelejo)">Cogasucre (Sucre)</option>
                        <option value="Subagauca (La Dorada / Caldas)">Subagauca (Magdalena Medio)</option>
                        <option value="SubaOriente (Puerto Boyacá)">SubaOriente</option>
                        <option value="Feria de Ganados Medellín">Feria de Ganados Medellín</option>
                        <option value="Otro / Particular">Otra Subasta...</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Nombre del Vendedor / Razón Social *
                      </label>
                      <input
                        type="text"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        placeholder="Ej. Don Carlos Mendoza - Finca El Recuerdo"
                        className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-2 text-xs font-bold"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Factura / Liquidación / Guía *
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-2 font-mono font-bold text-xs text-[#012d1d]"
                      required
                    />
                  </div>
                </div>

                {/* Campos Detallados de Información del Vendedor */}
                <div className="bg-[#f2f7f4] border border-[#c1ecd4] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black text-[#012d1d] uppercase flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#2d6a4f]" />
                      Información Detallada del Vendedor / Proveedor
                    </span>
                    <span className="text-[9px] text-[#2d6a4f] font-semibold">Trazabilidad Comercial</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {sellerType === 'subasta' && (
                      <div>
                        <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                          Consignatario / Vendedor
                        </label>
                        <input
                          type="text"
                          value={sellerName}
                          onChange={(e) => setSellerName(e.target.value)}
                          placeholder="Nombre del criadero o dueño"
                          className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Cédula / NIT del Vendedor
                      </label>
                      <input
                        type="text"
                        value={sellerDoc}
                        onChange={(e) => setSellerDoc(e.target.value)}
                        placeholder="Ej. 91.234.567-8"
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Teléfono / Contacto
                      </label>
                      <input
                        type="text"
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        placeholder="Ej. 310 555 1234"
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Ubicación / Municipio
                      </label>
                      <input
                        type="text"
                        value={sellerLocation}
                        onChange={(e) => setSellerLocation(e.target.value)}
                        placeholder="Ej. Montería, Córdoba"
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div className={sellerType === 'subasta' ? 'col-span-1' : 'col-span-1 sm:col-span-2'}>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Garantía / Estado Sanitario
                      </label>
                      <input
                        type="text"
                        value={sellerSanitaryStatus}
                        onChange={(e) => setSellerSanitaryStatus(e.target.value)}
                        placeholder="Hato libre, vacunas al día..."
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Nombre de Lote, Categoría, Potrero, Precio Base */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Nombre del Lote *
                    </label>
                    <input
                      type="text"
                      value={lotName}
                      onChange={(e) => setLotName(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Categoría Zootécnica
                    </label>
                    <select
                      value={lotCategory}
                      onChange={(e) => setLotCategory(e.target.value as LotCategory)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-semibold text-xs"
                    >
                      <option value="ceba">Ceba Intensiva (Engorde)</option>
                      <option value="cria">Cría / Levante</option>
                      <option value="leche">Lechería / Doble Propósito</option>
                      <option value="genetica">Genética / Reproductores</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Potrero Destino en {targetFarm?.profile?.name}
                    </label>
                    <select
                      value={selectedPaddockId}
                      onChange={(e) => setSelectedPaddockId(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#012d1d]"
                    >
                      <option value="">-- Asignar más tarde --</option>
                      {targetPaddocks.map((pad) => (
                        <option key={pad.id} value={pad.id}>
                          {pad.code} - {pad.name} ({pad.areaHa} Ha • {pad.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Precio Base / Kilo ($ COP)
                    </label>
                    <input
                      type="number"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                      placeholder="8750"
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Mode Switcher: Excel Import vs Quick Manual */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#79564b] uppercase">
                    Método de Ingreso de los Animales Comprados
                  </span>
                  <div className="flex items-center gap-1 bg-[#f3f3f3] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAuctionEntryMode('quick')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                        auctionEntryMode === 'quick' ? 'bg-[#012d1d] text-white shadow-xs' : 'text-[#414844]'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      Ingreso Rápido por Lote
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuctionEntryMode('excel')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                        auctionEntryMode === 'excel' ? 'bg-[#012d1d] text-white shadow-xs' : 'text-[#414844]'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Importar Excel / Subasta ({importedAnimals.length})
                    </button>
                  </div>
                </div>

                {auctionEntryMode === 'excel' ? (
                  <AuctionExcelImporter
                    animals={importedAnimals}
                    onAnimalsChange={setImportedAnimals}
                    defaultPricePerKg={parseFloat(pricePerKg) || 8750}
                  />
                ) : (
                  <div className="bg-[#fbfbfb] border border-[#d6e2db] rounded-2xl p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          N° de Cabezas *
                        </label>
                        <input
                          type="number"
                          value={quickHeads}
                          onChange={(e) => setQuickHeads(e.target.value)}
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-extrabold text-sm text-[#012d1d]"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-[#717973] uppercase">
                            Peso Promedio (kg) *
                          </label>
                          {liveScaleWeight && (
                            <button
                              type="button"
                              onClick={handleFetchFromScale}
                              className="text-[9px] text-emerald-800 font-bold bg-[#c1ecd4] hover:bg-[#a5d0b9] px-1 py-0.5 rounded flex items-center gap-1"
                            >
                              <Zap className="w-2.5 h-2.5 text-[#dc9a00]" />
                              Báscula ({liveScaleWeight.toFixed(1)} kg)
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={quickAvgWeight}
                          onChange={(e) => setQuickAvgWeight(e.target.value)}
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-sm text-[#012d1d]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Sexo Predominante
                        </label>
                        <select
                          value={quickSex}
                          onChange={(e) => setQuickSex(e.target.value as any)}
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-semibold"
                        >
                          <option value="Machos">Machos (Ceba / Levante)</option>
                          <option value="Hembras">Hembras</option>
                          <option value="Mixto">Lote Mixto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Raza / Cruce
                        </label>
                        <input
                          type="text"
                          value={quickBreed}
                          onChange={(e) => setQuickBreed(e.target.value)}
                          placeholder="Ej. Brahman Blanco / Cebú"
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Color / Pelaje
                        </label>
                        <select
                          value={quickColor}
                          onChange={(e) => setQuickColor(e.target.value)}
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs"
                        >
                          <option value="Blanco / Gris">⚪ Blanco / Gris</option>
                          <option value="Rojo / Sardo">🔴 Rojo / Sardo</option>
                          <option value="Bayo / Amarillo">🟡 Bayo / Amarillo</option>
                          <option value="Negro / Arrebolado">⚫ Negro / Arrebolado</option>
                          <option value="Hosco / Chorreado">🟤 Hosco / Chorreado</option>
                          <option value="Pintado / Overo">⚪🔴 Pintado / Overo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Rango de Edad
                        </label>
                        <input
                          type="text"
                          value={quickAgeRange}
                          onChange={(e) => setQuickAgeRange(e.target.value)}
                          placeholder="Ej. 18-24 Meses"
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#e65100]" />
                          Hierro / Marca
                        </label>
                        <select
                          value={quickBrandingIronId}
                          onChange={(e) => setQuickBrandingIronId(e.target.value)}
                          className="w-full bg-[#fffde7] border border-[#fbc02d] rounded-xl px-3 py-2 text-xs font-bold text-[#3e2723]"
                        >
                          <option value="">-- Sin Hierro --</option>
                          {brandingIrons.map((iron) => (
                            <option key={iron.id} value={iron.id}>
                              {iron.symbolIcon || '🔥'} {iron.name} ({iron.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-[#e6f4ea] p-2.5 rounded-xl text-xs text-[#002114] flex items-center justify-between">
                      <span>
                        Se generarán <strong>{quickHeads} animales</strong> con un peso total estimado de{' '}
                        <strong>
                          {((parseInt(quickHeads, 10) || 0) * (parseFloat(quickAvgWeight) || 0)).toLocaleString('es-CO')} kg
                        </strong>
                      </span>
                      <span className="font-mono font-bold text-[#012d1d]">
                        ${(
                          ((parseInt(quickHeads, 10) || 0) *
                            (parseFloat(quickAvgWeight) || 0) *
                            (parseFloat(pricePerKg) || 8750)) /
                          1000000
                        ).toFixed(2)}{' '}
                        M COP
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 2: VENTA DE GANADO & SALIDA COMERCIAL */}
          {/* ========================================== */}
          {eventType === 'venta' && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#f2f9f5] border-2 border-[#a7d7be] rounded-2xl p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#a7d7be] pb-2.5">
                  <p className="text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    Información del Comprador & Destino Comercial
                  </p>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-mono font-bold px-2 py-0.5 rounded border border-emerald-300">
                    Módulo de Ventas
                  </span>
                </div>

                {saleError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="flex-1">{saleError}</span>
                    <button type="button" onClick={() => setSaleError(null)} className="text-red-500 hover:text-red-700 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 1. SELECCIÓN DE ANIMALES / IDENTIFICACIÓN (PRIMERO) */}
                <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-500/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase">
                        <Tag className="w-4 h-4 text-emerald-700" />
                        1. Identificación de Animales a Vender
                      </span>
                      <span className="text-red-500 font-black text-sm">*</span>
                    </div>

                    {/* Selector Individual o Por Lote (Únicamente visible en Modo Lotes Habilitado) */}
                    {isLotsEnabled && (
                      <div className="flex items-center bg-[#f0f7f2] p-1 rounded-xl border border-emerald-200">
                        <button
                          type="button"
                          onClick={() => setSaleMode('individual')}
                          className={`px-3 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            saleMode === 'individual'
                              ? 'bg-emerald-800 text-white shadow-xs'
                              : 'text-emerald-900 hover:bg-emerald-100'
                          }`}
                        >
                          <Tag className="w-3.5 h-3.5" />
                          Individual (Animal por Animal)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSaleMode('lot')}
                          className={`px-3 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            saleMode === 'lot'
                              ? 'bg-emerald-800 text-white shadow-xs'
                              : 'text-emerald-900 hover:bg-emerald-100'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Por Lote (Lote de Ganado)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Panel según modo: Individual o Por Lote */}
                  {!isLotsEnabled || saleMode === 'individual' ? (
                    <div className="space-y-3 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-emerald-950 uppercase tracking-wide">
                          # ANIMAL / # CHAPETA *
                        </label>
                        <span className="text-[9px] text-emerald-800 font-semibold">
                          Separe por comas o ingrese chapetas (Ej: GLO-001, GLO-002...)
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={saleAnimalTags}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSaleAnimalTags(val);
                            setSaleError(null);
                          }}
                          placeholder="Ej: GLO-001, GLO-002, GLO-003... o seleccione del catálogo abajo"
                          className={`w-full bg-white border-2 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d] focus:ring-2 focus:ring-emerald-500 shadow-inner ${
                            saleTagValidation.missingTags.length > 0
                              ? 'border-red-500 bg-red-50/30 text-red-950'
                              : saleTagValidation.isValid
                              ? 'border-emerald-600'
                              : 'border-slate-300'
                          }`}
                          required
                        />
                      </div>

                      {/* Live Validation Alert & Status Feedback */}
                      {saleTagValidation.missingTags.length > 0 && (
                        <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-xs text-red-900 font-bold flex items-start gap-2 shadow-xs animate-shake">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-red-950 font-black uppercase text-[11px]">
                              ❌ Bloqueo de Venta: Animal no encontrado en el Predio
                            </p>
                            <p className="text-red-800 mt-0.5 leading-relaxed">
                              El animal o número <span className="bg-red-200 text-red-950 px-1.5 py-0.5 rounded font-mono font-black">{saleTagValidation.missingTags.join(', ')}</span> NO existe en el inventario activo de <strong>{targetFarm?.profile?.name || 'este predio'}</strong>. No se puede cargar para venta ningún animal no registrado o con error en el número.
                            </p>
                          </div>
                        </div>
                      )}

                      {saleTagValidation.isValid && (
                        <div className="p-2.5 bg-emerald-100/70 border border-emerald-400 rounded-xl text-xs text-emerald-950 font-bold flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>
                              ✅ <strong>{saleTagValidation.validAnimals.length}</strong> animal(es) verificados y confirmados en el inventario de <strong>{targetFarm?.profile?.name || 'el predio'}</strong>.
                            </span>
                          </div>
                          {saleTagValidation.validAnimals.length > 0 && (
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded font-bold">
                              Peso Promedio: {Math.round(saleTagValidation.validAnimals.reduce((acc, a) => acc + (a.weightKg || 450), 0) / saleTagValidation.validAnimals.length)} kg
                            </span>
                          )}
                        </div>
                      )}

                      {/* Quick Catálog of Animals in this farm */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black uppercase text-emerald-950 flex items-center gap-1">
                            🏷️ Catálogo de Animales Disponibles en {targetFarm?.profile?.name || 'Predio'} ({farmCatalogAnimals.length}):
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowHerdAnimalPicker(!showHerdAnimalPicker)}
                            className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-bold cursor-pointer"
                          >
                            {showHerdAnimalPicker ? 'Ocultar catálogo' : '🔍 Ver y Seleccionar Animales del Hato'}
                          </button>
                        </div>

                        {showHerdAnimalPicker && (
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-300 shadow-sm space-y-2 max-h-48 overflow-y-auto">
                            <div className="relative">
                              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                              <input
                                type="text"
                                placeholder="Filtrar por chapeta, lote o raza..."
                                value={saleSearchHerdTerm}
                                onChange={(e) => setSaleSearchHerdTerm(e.target.value)}
                                className="w-full pl-7 pr-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                              />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {farmCatalogAnimals
                                .filter((a) => {
                                  if (!saleSearchHerdTerm.trim()) return true;
                                  const term = saleSearchHerdTerm.toLowerCase();
                                  return (
                                    a.tag.toLowerCase().includes(term) ||
                                    (a.name && a.name.toLowerCase().includes(term)) ||
                                    (a.breed && a.breed.toLowerCase().includes(term))
                                  );
                                })
                                .slice(0, 30)
                                .map((a) => {
                                  const isSelected = saleTagValidation.validAnimals.some((va) => va.id === a.id);
                                  return (
                                    <button
                                      key={a.id}
                                      type="button"
                                      onClick={() => {
                                        if (isSelected) {
                                          // Remove
                                          const remaining = saleTagValidation.validAnimals
                                            .filter((va) => va.id !== a.id)
                                            .map((va) => va.tag);
                                          setSaleAnimalTags(remaining.join(', '));
                                          setSaleHeads(String(remaining.length));
                                        } else {
                                          // Add
                                          const current = saleAnimalTags
                                            ? saleAnimalTags.split(/[\s,]+/).filter((t) => t.trim().length > 0)
                                            : [];
                                          const updated = [...current, a.tag];
                                          setSaleAnimalTags(updated.join(', '));
                                          setSaleHeads(String(updated.length));
                                        }
                                      }}
                                      className={`p-1.5 rounded-lg border text-left text-[11px] font-mono transition-all flex items-center justify-between cursor-pointer ${
                                        isSelected
                                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                                          : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200'
                                      }`}
                                    >
                                      <div>
                                        <span className="font-bold block">{a.tag}</span>
                                        <span className={`text-[9px] block ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                                          {a.weightKg || 450} kg • {a.breed || 'Cebú'}
                                        </span>
                                      </div>
                                      {isSelected ? (
                                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                                      ) : (
                                        <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 bg-emerald-50/40 p-3 rounded-xl border border-emerald-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black text-emerald-950 uppercase mb-1">
                            🏷️ Seleccionar Lote Registrado en Finca *
                          </label>
                          <select
                            value={saleLotId}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              setSaleLotId(selectedId);
                              const selectedLot = activeFarmLots.find((l) => l.id === selectedId);
                              if (selectedLot) {
                                setSaleLotName(selectedLot.lotName);
                                setSaleCategory(selectedLot.category);
                                setSaleBreed(selectedLot.breed || 'Brahman Blanco');
                                setSaleSex(selectedLot.sexLabel || 'Machos');
                                setSaleAgeRange(selectedLot.ageRange || '24-30 Meses');
                                setSaleHeads(String(selectedLot.heads));
                                setSaleAvgWeight(String(selectedLot.currentAvgWeight));
                                setSalePaddockId(selectedLot.paddockId || '');
                                
                                // Auto-fill with the verified animals generated for this lot
                                const lotAnimals = generateAnimalsForLot(selectedLot, targetFarm?.profile?.name || 'Predio');
                                const tagsList = lotAnimals.map((a) => a.tag).join(', ');
                                setSaleAnimalTags(tagsList);
                              }
                            }}
                            className="w-full bg-white border-2 border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#012d1d]"
                          >
                            <option value="">-- Seleccionar Lote del Hato --</option>
                            {activeFarmLots.map((lot) => (
                              <option key={lot.id} value={lot.id}>
                                🏷️ {lot.lotName} ({lot.heads} Cab. • {lot.currentAvgWeight} kg • {lot.category.toUpperCase()})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-emerald-950 uppercase mb-1 tracking-wide">
                            # ANIMAL / # CHAPETA *
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={saleAnimalTags}
                              onChange={(e) => {
                                setSaleAnimalTags(e.target.value);
                                setSaleError(null);
                              }}
                              placeholder="Ej: GLO-001, GLO-002, GLO-003..."
                              className={`w-full bg-white border-2 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-[#012d1d] focus:ring-2 focus:ring-emerald-500 ${
                                saleTagValidation.missingTags.length > 0 ? 'border-red-500 bg-red-50 text-red-950' : 'border-emerald-600'
                              }`}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lot Mode Validation Warning */}
                      {saleTagValidation.missingTags.length > 0 && (
                        <div className="p-2 bg-red-50 border border-red-400 rounded-xl text-xs text-red-900 font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>
                            ❌ El animal/número "{saleTagValidation.missingTags.join(', ')}" no existe en este predio.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nombre/Identificación del Despacho y Potrero Salida */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        {isLotsEnabled ? 'Nombre / Identificación del Lote a Despachar' : 'Descripción / Manifiesto del Despacho'}
                      </label>
                      <input
                        type="text"
                        value={saleLotName}
                        onChange={(e) => setSaleLotName(e.target.value)}
                        placeholder={isLotsEnabled ? "Nombre o identificación del lote..." : "Ej: Despacho novillos gordos a frigorífico..."}
                        className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#012d1d]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Potrero de Salida
                      </label>
                      <select
                        value={salePaddockId}
                        onChange={(e) => setSalePaddockId(e.target.value)}
                        className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                      >
                        <option value="">-- Potrero de Salida --</option>
                        {targetPaddocks.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Datos Básicos del Ganado Vendido */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Categoría
                      </label>
                      <select
                        value={saleCategory}
                        onChange={(e) => setSaleCategory(e.target.value as LotCategory)}
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="ceba">Ceba</option>
                        <option value="cria">Cría / Levante</option>
                        <option value="leche">Lechería</option>
                        <option value="genetica">Genética</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Raza / Cruce
                      </label>
                      <input
                        type="text"
                        value={saleBreed}
                        onChange={(e) => setSaleBreed(e.target.value)}
                        placeholder="Ej. Brahman Blanco"
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Color / Pelaje
                      </label>
                      <select
                        value={saleColor}
                        onChange={(e) => setSaleColor(e.target.value)}
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="Blanco / Gris">⚪ Blanco / Gris</option>
                        <option value="Rojo / Sardo">🔴 Rojo / Sardo</option>
                        <option value="Bayo / Amarillo">🟡 Bayo / Amarillo</option>
                        <option value="Negro / Arrebolado">⚫ Negro / Arrebolado</option>
                        <option value="Hosco / Chorreado">🟤 Hosco / Chorreado</option>
                        <option value="Pintado / Overo">⚪🔴 Pintado / Overo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Sexo
                      </label>
                      <select
                        value={saleSex}
                        onChange={(e) => setSaleSex(e.target.value)}
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="Machos de Ceba">Machos de Ceba</option>
                        <option value="Machos de Levante">Machos de Levante</option>
                        <option value="Hembras de Levante">Hembras de Levante</option>
                        <option value="Vacas de Descarte">Vacas de Descarte</option>
                        <option value="Toros">Toros</option>
                        <option value="Mixto">Mixto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Rango Edad
                      </label>
                      <input
                        type="text"
                        value={saleAgeRange}
                        onChange={(e) => setSaleAgeRange(e.target.value)}
                        placeholder="24-30 Meses"
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Hierro
                      </label>
                      <select
                        value={saleBrandingIronId}
                        onChange={(e) => setSaleBrandingIronId(e.target.value)}
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs font-bold"
                      >
                        <option value="">-- Sin Hierro --</option>
                        {brandingIrons.map((iron) => (
                          <option key={iron.id} value={iron.id}>
                            {iron.symbolIcon || '🔥'} {iron.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Comprador / Frigorífico / Subasta *
                    </label>
                    <input
                      type="text"
                      value={saleBuyer}
                      onChange={(e) => setSaleBuyer(e.target.value)}
                      placeholder="Ej. Frigorífico del Sinú / Particular"
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#012d1d]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Cédula / NIT Comprador
                    </label>
                    <input
                      type="text"
                      value={saleBuyerDoc}
                      onChange={(e) => setSaleBuyerDoc(e.target.value)}
                      placeholder="Ej. 900.123.456-7"
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="text"
                      value={saleBuyerPhone}
                      onChange={(e) => setSaleBuyerPhone(e.target.value)}
                      placeholder="Ej. 310 123 4567"
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Destino / Planta de Beneficio o Predio Receptor
                    </label>
                    <input
                      type="text"
                      value={saleDestination}
                      onChange={(e) => setSaleDestination(e.target.value)}
                      placeholder="Ej. Planta Frigorífica Montería / Finca La Cabaña"
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Factura de Venta
                    </label>
                    <input
                      type="text"
                      value={saleInvoiceNumber}
                      onChange={(e) => setSaleInvoiceNumber(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Guía Sanitaria ICA (GSMI)
                    </label>
                    <input
                      type="text"
                      value={saleIcaGuideNumber}
                      onChange={(e) => setSaleIcaGuideNumber(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Liquidación de Pesos y Precios */}
              <div className="bg-[#fbfbfb] border border-[#c1c8c2] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2 flex-wrap gap-2">
                  <p className="text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#2d6a4f]" />
                    Liquidación de Báscula & Valores Comerciales
                  </p>
                  <div className="flex items-center gap-1.5 bg-gray-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSalePricingType('kilo')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        salePricingType === 'kilo'
                          ? 'bg-[#012d1d] text-white shadow-2xs'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Por Kilo en Báscula ($/kg)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSalePricingType('total')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        salePricingType === 'total'
                          ? 'bg-[#012d1d] text-white shadow-2xs'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Valor Global Cerrado ($)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Cabezas Vendidas *
                    </label>
                    <input
                      type="number"
                      value={saleHeads}
                      onChange={(e) => setSaleHeads(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-bold font-mono text-xs text-[#012d1d]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Peso Promedio (kg/cab) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={saleAvgWeight}
                      onChange={(e) => setSaleAvgWeight(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-bold font-mono text-xs text-[#012d1d]"
                      required
                    />
                  </div>
                  {salePricingType === 'kilo' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Precio Venta por Kg ($ COP) *
                      </label>
                      <input
                        type="number"
                        value={salePricePerKg}
                        onChange={(e) => setSalePricePerKg(e.target.value)}
                        className="w-full bg-white border border-[#2d6a4f] rounded-xl px-2.5 py-1.5 font-black font-mono text-xs text-emerald-800"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Valor Total de la Venta ($ COP) *
                      </label>
                      <input
                        type="number"
                        value={salePriceTotalCustom}
                        onChange={(e) => setSalePriceTotalCustom(e.target.value)}
                        className="w-full bg-white border border-[#2d6a4f] rounded-xl px-2.5 py-1.5 font-black font-mono text-xs text-emerald-800"
                        required
                      />
                    </div>
                  )}
                  <div className="bg-[#e8f5e9] p-2.5 rounded-xl border border-emerald-300 flex flex-col justify-between">
                    <span className="text-[9.5px] font-bold text-emerald-800 uppercase">Total Liquidación Estimada</span>
                    <span className="text-sm font-black font-mono text-emerald-950">
                      ${(
                        salePricingType === 'kilo'
                          ? (parseFloat(saleHeads) || 0) * (parseFloat(saleAvgWeight) || 0) * (parseFloat(salePricePerKg) || 0)
                          : parseFloat(salePriceTotalCustom) || 0
                      ).toLocaleString('es-CO')}{' '}
                      <span className="text-[10px] font-normal">COP</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Guía Sanitaria ICA Movilización
                    </label>
                    <input
                      type="text"
                      value={saleIcaGuideNumber}
                      onChange={(e) => setSaleIcaGuideNumber(e.target.value)}
                      placeholder="Ej. ICA-VTA-98124"
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-[#012d1d]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Factura / Liquidación
                    </label>
                    <input
                      type="text"
                      value={saleInvoiceNumber}
                      onChange={(e) => setSaleInvoiceNumber(e.target.value)}
                      placeholder="Ej. FAC-VTA-2026-01"
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-[#012d1d]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Potrero de Salida
                    </label>
                    <select
                      value={salePaddockId}
                      onChange={(e) => setSalePaddockId(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                    >
                      <option value="">-- Seleccionar Potrero --</option>
                      {targetPaddocks.map((pad) => (
                        <option key={pad.id} value={pad.id}>
                          {pad.code} - {pad.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                    Observaciones de la Venta
                  </label>
                  <input
                    type="text"
                    value={saleNotes}
                    onChange={(e) => setSaleNotes(e.target.value)}
                    placeholder="Condiciones de pago, transporte, pesaje en finca o en planta..."
                    className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 3: NACIMIENTOS */}
          {/* ========================================== */}
          {eventType === 'birth' && (
            <div className="space-y-4 pt-1">
              <div className="p-4 bg-white border-2 border-emerald-500/50 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Registro de Parto & Nacimiento de Ternero
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Identificación, datos del parto, genealogía y manejo inicial neonatal
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold px-2.5 py-1 rounded-full uppercase">
                    Protocolo Zootécnico
                  </span>
                </div>

                {birthError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{birthError}</span>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 1. IDENTIFICACIÓN Y DATOS BÁSICOS */}
                {/* ========================================================= */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                      <Tag className="w-4 h-4 text-emerald-700" />
                      1. Identificación y Datos Básicos
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      ID Único & Fenotipo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        ID / Chapeta (Arete / SINIGAN / ICA) *
                      </label>
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Ej. #9084 o SINIGAN-10482"
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Chip RFID / Botón Electrónico
                      </label>
                      <input
                        type="text"
                        value={birthRfid}
                        onChange={(e) => setBirthRfid(e.target.value)}
                        placeholder="982 000 412..."
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Fecha del Parto *
                      </label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-1.5 font-bold text-xs text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Hora del Parto
                      </label>
                      <input
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Sexo *
                      </label>
                      <select
                        value={birthSex}
                        onChange={(e) => setBirthSex(e.target.value as 'macho' | 'hembra')}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                      >
                        <option value="hembra">♀ Hembra</option>
                        <option value="macho">♂ Macho</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Raza / Composición *
                      </label>
                      <select
                        value={birthBreed}
                        onChange={(e) => setBirthBreed(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-semibold text-xs text-slate-900"
                      >
                        <option value="Brahman Blanco">Brahman Blanco</option>
                        <option value="Brahman Rojo">Brahman Rojo</option>
                        <option value="Gyr Lechero">Gyr Lechero</option>
                        <option value="Guzerá">Guzerá</option>
                        <option value="Nelore">Nelore</option>
                        <option value="Brangus">Brangus</option>
                        <option value="Simbrah">Simbrah</option>
                        <option value="Holstein">Holstein</option>
                        <option value="Jersey">Jersey / Jerthol</option>
                        <option value="Girolando">Girolando</option>
                        <option value="F1 Cebú x Europeo">F1 Cebú x Europeo</option>
                        <option value="Siete Colores">Siete Colores</option>
                        <option value="Criollo Romosinuano">Criollo Romosinuano</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Pureza / % Cruce *
                      </label>
                      <select
                        value={birthPurityPct}
                        onChange={(e) => setBirthPurityPct(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-semibold text-xs text-slate-900"
                      >
                        <option value="100% Puro (Registro)">100% Puro (Registro)</option>
                        <option value="Puro Comercial">Puro Comercial</option>
                        <option value="50% F1 (Media Sangre)">50% F1 (Media Sangre)</option>
                        <option value="75% (3/4 Cruce)">75% (3/4 Cruce)</option>
                        <option value="62.5% (5/8 Sintético)">62.5% (5/8 Sintético)</option>
                        <option value="Comercial / Múltiple">Comercial / Múltiple</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Color / Pelaje *
                      </label>
                      <select
                        value={birthColor}
                        onChange={(e) => setBirthColor(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-semibold text-xs text-slate-900"
                      >
                        <option value="Blanco / Gris">⚪ Blanco / Gris</option>
                        <option value="Rojo / Sardo">🔴 Rojo / Sardo</option>
                        <option value="Bayo / Amarillo">🟡 Bayo / Amarillo</option>
                        <option value="Negro / Arrebolado">⚫ Negro / Arrebolado</option>
                        <option value="Hosco / Chorreado">🟤 Hosco / Chorreado</option>
                        <option value="Pintado / Overo">⚪🔴 Pintado / Overo</option>
                        <option value="Flor de Durazno / Moro">🌸 Flor de Durazno / Moro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                        Hierro / Número de Marca (Opcional en nacimiento)
                      </label>
                      <select
                        value={selectedBrandingIronId}
                        onChange={(e) => setSelectedBrandingIronId(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      >
                        <option value="">-- Sin Hierro Marcado Aún (Se marca al destete) --</option>
                        {brandingIrons.map((iron) => (
                          <option key={iron.id} value={iron.id}>
                            {iron.symbolIcon || '🔥'} {iron.name} ({iron.code}) - {iron.bodyLocation}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Tipo de Destino Zootécnico
                      </label>
                      <select
                        value={birthCattleType}
                        onChange={(e) => setBirthCattleType(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                      >
                        <option value="comercial">🐮 Cría y Levante Comercial</option>
                        <option value="puro_comercial">🐄 Hato Genético Puro Comercial</option>
                        <option value="puro_registrable">📜 Hato con Registro Genealógico Asocebú</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 2. DATOS DEL PARTO Y TERNERO */}
                {/* ========================================================= */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                      <Scale className="w-4 h-4 text-emerald-700" />
                      2. Datos del Parto y Ternero
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Biometría & Vitalidad
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">
                          Peso al Nacer (kg) *
                        </label>
                        {liveScaleWeight && (
                          <button
                            type="button"
                            onClick={() => setIndividualWeight(liveScaleWeight.toFixed(1))}
                            className="text-[9px] text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                          >
                            <Zap className="w-2.5 h-2.5 text-amber-600" />
                            {liveScaleWeight.toFixed(1)} kg
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={individualWeight}
                        onChange={(e) => setIndividualWeight(e.target.value)}
                        placeholder="35.0"
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-1.5 font-mono font-black text-xs text-emerald-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Tipo de Parto *
                      </label>
                      <select
                        value={deliveryType}
                        onChange={(e) => setDeliveryType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                      >
                        <option value="eutocico">🟢 Eutócico (Normal / Sin ayuda)</option>
                        <option value="distocico_asistido">🟡 Asistido (Tracción manual / Mecánica)</option>
                        <option value="cesarea">🔴 Cesárea Quirúrgica</option>
                        <option value="mortinato">⚫ Mortinato (Nacido Muerto)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Condición del Parto *
                      </label>
                      <select
                        value={calvingCondition}
                        onChange={(e) => setCalvingCondition(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                      >
                        <option value="simple">👤 Cría Simple (1 Cría)</option>
                        <option value="multiple">👥 Cría Múltiple (Mellizos / Gemelos)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Vigor / Vitalidad (Escala 1 a 5) *
                      </label>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={vigorScore}
                          onChange={(e) => setVigorScore(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                        >
                          <option value={5}>⭐ 5 - Excelente (Se para & mama de inmediato)</option>
                          <option value={4}>⭐ 4 - Bueno (Alerta, se levanta pronto)</option>
                          <option value={3}>⭐ 3 - Regular (Lento pero reactivo)</option>
                          <option value={2}>⭐ 2 - Débil (Requiere asistencia térmica y de pie)</option>
                          <option value={1}>⭐ 1 - Crítico / Deprimido</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 3. GENEALOGÍA */}
                {/* ========================================================= */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                      <Dna className="w-4 h-4 text-emerald-700" />
                      3. Genealogía & Método de Concepción
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Trazabilidad Parental
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Madre Biológica */}
                    <div className="bg-white p-3 rounded-xl border border-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-slate-900 uppercase flex items-center gap-1">
                          <Dna className="w-3.5 h-3.5 text-emerald-700" />
                          ID Madre Biológica (Chapeta) *
                        </label>
                      </div>
                      <select
                        value={parentTag}
                        onChange={(e) => {
                          setParentTag(e.target.value);
                          setBirthError(null);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                      >
                        <option value="">-- Seleccionar Madre del Hato --</option>
                        {systemCows.length > 0 && (
                          <optgroup label="Hembras Activas en el Sistema">
                            {systemCows.map((c) => (
                              <option key={c.id || c.tag} value={`${c.tag} ${c.name ? `(${c.name})` : ''}`}>
                                🐮 #{c.tag} {c.name ? `- ${c.name}` : ''} ({c.breed || 'Matriz'})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Matrices Registradas">
                          {DEFAULT_SYSTEM_DAMS.map((d) => (
                            <option key={d.tag} value={d.tag}>
                              🐮 #{d.tag} - {d.breed}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <input
                        type="text"
                        value={parentTag}
                        onChange={(e) => {
                          setParentTag(e.target.value);
                          setBirthError(null);
                        }}
                        placeholder="O digite arete de la madre biológica..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-900"
                        required
                      />
                    </div>

                    {/* Padre (Toro o Pajilla) */}
                    <div className="bg-white p-3 rounded-xl border border-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-slate-900 uppercase flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          ID Padre (Toro de Monta / Pajilla IA)
                        </label>
                        <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded uppercase">
                          Opcional
                        </span>
                      </div>
                      <select
                        value={birthSireTag}
                        onChange={(e) => setBirthSireTag(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                      >
                        <option value="Sin padre registrado (Desconocido)">
                          ❓ Sin padre registrado (Desconocido / Sin trazabilidad)
                        </option>
                        {systemBulls.length > 0 && (
                          <optgroup label="Toros del Hato">
                            {systemBulls.map((b) => (
                              <option key={b.id || b.tag} value={`${b.tag} ${b.name ? `(${b.name})` : ''}`}>
                                🐂 #{b.tag} {b.name ? `- ${b.name}` : ''}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Toros & Pajillas IA de Referencia">
                          {DEFAULT_SYSTEM_SIRES.map((s) => (
                            <option key={s.tag} value={s.tag}>
                              🐂 {s.tag} - {s.breed}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <input
                        type="text"
                        value={birthSireTag}
                        onChange={(e) => setBirthSireTag(e.target.value)}
                        placeholder="O digite el toro o código de pajilla..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Método de Concepción *
                      </label>
                      <select
                        value={conceptionMethod}
                        onChange={(e) => setConceptionMethod(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                      >
                        <option value="monta_natural">🐂 Monta Natural (Toro en Potrero)</option>
                        <option value="ia">🔬 Inseminación Artificial Convencional (IA)</option>
                        <option value="iatf">⏱️ Inseminación Artificial a Tiempo Fijo (IATF)</option>
                        <option value="te_fiv">🧫 Transferencia de Embriones (TE / FIV)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                        <span>ID Madre Receptora (Solo si aplica para TE / FIV)</span>
                        {conceptionMethod === 'te_fiv' && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                            Receptor TE
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={surrogateDamTag}
                        onChange={(e) => setSurrogateDamTag(e.target.value)}
                        placeholder="Ej. Vaca Receptora #REC-204 (Solo para TE / FIV)"
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 4. MANEJO INICIAL Y UBICACIÓN */}
                {/* ========================================================= */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase">
                      <Stethoscope className="w-4 h-4 text-emerald-700" />
                      4. Manejo Inicial y Ubicación
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Sanidad Neonatal & Custodia
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Calostro */}
                    <div className="bg-white p-3 rounded-xl border border-slate-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-700 uppercase">
                          Consumo de Calostro Suministrado *
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setColostrumFed(true)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              colostrumFed ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            ✓ Sí
                          </button>
                          <button
                            type="button"
                            onClick={() => setColostrumFed(false)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              !colostrumFed ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            ✗ No
                          </button>
                        </div>
                      </div>

                      {colostrumFed && (
                        <div>
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5">
                            Tiempo Posparto de Toma (Horas)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.5"
                              value={colostrumHoursPostCalving}
                              onChange={(e) => setColostrumHoursPostCalving(e.target.value)}
                              placeholder="2"
                              className="w-24 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900"
                            />
                            <span className="text-[10px] text-slate-500">
                              horas posparto (óptimo antes de 6 horas)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Curación de Ombligo */}
                    <div className="bg-white p-3 rounded-xl border border-slate-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-700 uppercase">
                          Curación de Ombligo Realizada *
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setNavelDisinfected(true)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              navelDisinfected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            ✓ Realizada
                          </button>
                          <button
                            type="button"
                            onClick={() => setNavelDisinfected(false)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              !navelDisinfected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            ✗ Pendiente
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Inmersión completa del cordón en tintura de yodo al 7% o clorhexidina.
                      </p>
                    </div>
                  </div>

                  {/* Tratamientos Neonatales */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Tratamientos / Medicamentos Aplicados (Vitaminas, Hierro, Selenio)
                    </label>
                    <input
                      type="text"
                      value={initialTreatments}
                      onChange={(e) => setInitialTreatments(e.target.value)}
                      placeholder="Ej. Hierro dextrano 2ml + Complejo B + Selenio / Probiótico oral..."
                      className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  {/* Ubicación (Finca, Potrero) & Operario */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                        Finca / Predio *
                      </label>
                      <select
                        value={birthOriginFarmId}
                        onChange={(e) => {
                          setBirthOriginFarmId(e.target.value);
                          setBirthError(null);
                        }}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                      >
                        {farms.map((f) => (
                          <option key={f.profile.id} value={f.profile.id}>
                            🏡 {f.profile.name}
                          </option>
                        ))}
                        <option value="custom">✍️ Otro Predio Externo...</option>
                      </select>
                      {birthOriginFarmId === 'custom' && (
                        <input
                          type="text"
                          value={customOriginFarmName}
                          onChange={(e) => setCustomOriginFarmName(e.target.value)}
                          placeholder="Nombre del predio..."
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 mt-1 text-xs"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        Potrero / Lote Maternidad
                      </label>
                      <select
                        value={birthMaternityPaddockId}
                        onChange={(e) => setBirthMaternityPaddockId(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                      >
                        <option value="">-- Asignar Potrero Maternidad --</option>
                        {targetPaddocks.map((p) => (
                          <option key={p.id} value={p.id}>
                            🌱 {p.code} - {p.name} ({p.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        Operario Responsable *
                      </label>
                      <input
                        type="text"
                        value={operatorResponsible}
                        onChange={(e) => setOperatorResponsible(e.target.value)}
                        placeholder="Nombre de quien atendió el parto"
                        className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-2.5 py-1.5 font-bold text-xs text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Observaciones Generales del Nacimiento
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Comportamiento materno, vigor de succión, tiempo de expulsión de placenta..."
                      className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 3: RECIBIDOS EN SOCIEDAD */}
          {/* ========================================== */}
          {eventType === 'sociedad' && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#fffdf5] border-2 border-[#ffe082] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#ffe082] pb-2">
                  <span className="text-xs font-bold text-[#5d4037] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#f57f17]" />
                    Registro de Ganado Recibido en Sociedad / Alianza / Aumento
                  </span>
                  <span className="text-[10px] bg-[#fff8e1] text-[#f57f17] font-mono font-bold px-2 py-0.5 rounded border border-[#ffe082]">
                    Módulo Sociedad
                  </span>
                </div>

                {/* Datos del Socio / Inversionista */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Nombre del Socio / Inversionista *
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Ej. Don Gabriel Gómez"
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Cédula / NIT del Socio
                    </label>
                    <input
                      type="text"
                      value={partnerDoc}
                      onChange={(e) => setPartnerDoc(e.target.value)}
                      placeholder="Ej. 80.123.456"
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="text"
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      placeholder="Ej. 311 890 1234"
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Información Básica del Lote en Sociedad */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                  <span className="text-[10px] font-black text-amber-900 uppercase block">
                    🏷️ Información Básica del Ganado en Sociedad
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Nombre del Lote / Denominación *
                      </label>
                      <input
                        type="text"
                        value={sociedadLotName}
                        onChange={(e) => setSociedadLotName(e.target.value)}
                        placeholder="Ej. Lote Sociedad Gómez - Machos Ceba"
                        className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-bold text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Categoría Zootécnica *
                      </label>
                      <select
                        value={sociedadCategory}
                        onChange={(e) => setSociedadCategory(e.target.value as LotCategory)}
                        className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-semibold text-xs"
                      >
                        <option value="ceba">Ceba (Engorde)</option>
                        <option value="cria">Cría / Levante</option>
                        <option value="leche">Lechería / Doble Propósito</option>
                        <option value="genetica">Genética / Reproductores</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-0.5">
                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Raza / Cruce
                      </label>
                      <input
                        type="text"
                        value={sociedadBreed}
                        onChange={(e) => setSociedadBreed(e.target.value)}
                        placeholder="Ej. Brahman / Cebú Comercial"
                        className="w-full bg-white border border-[#ffe082] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Color / Pelaje
                      </label>
                      <select
                        value={sociedadColor}
                        onChange={(e) => setSociedadColor(e.target.value)}
                        className="w-full bg-white border border-[#ffe082] rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="Blanco / Gris">⚪ Blanco / Gris</option>
                        <option value="Rojo / Sardo">🔴 Rojo / Sardo</option>
                        <option value="Bayo / Amarillo">🟡 Bayo / Amarillo</option>
                        <option value="Negro / Arrebolado">⚫ Negro / Arrebolado</option>
                        <option value="Hosco / Chorreado">🟤 Hosco / Chorreado</option>
                        <option value="Pintado / Overo">⚪🔴 Pintado / Overo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Sexo
                      </label>
                      <select
                        value={sociedadSex}
                        onChange={(e) => setSociedadSex(e.target.value)}
                        className="w-full bg-white border border-[#ffe082] rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="Machos">Machos</option>
                        <option value="Hembras">Hembras</option>
                        <option value="Mixto">Mixto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Rango de Edad
                      </label>
                      <input
                        type="text"
                        value={sociedadAgeRange}
                        onChange={(e) => setSociedadAgeRange(e.target.value)}
                        placeholder="Ej. 18-24 Meses"
                        className="w-full bg-white border border-[#ffe082] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Hierro / Marca
                      </label>
                      <select
                        value={sociedadBrandingIronId}
                        onChange={(e) => setSociedadBrandingIronId(e.target.value)}
                        className="w-full bg-white border border-[#ffe082] rounded-lg px-2 py-1 text-xs font-bold"
                      >
                        <option value="">-- Sin Hierro --</option>
                        {brandingIrons.map((iron) => (
                          <option key={iron.id} value={iron.id}>
                            {iron.symbolIcon || '🔥'} {iron.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                      Aretes / Chapetas Individuales (Opcional)
                    </label>
                    <input
                      type="text"
                      value={sociedadAnimalTags}
                      onChange={(e) => setSociedadAnimalTags(e.target.value)}
                      placeholder="Ej: #SOC-01, #SOC-02, #SOC-03..."
                      className="w-full bg-white border border-[#ffe082] rounded-lg px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Esquema de Participación y Cantidades */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Esquema de Participación *
                    </label>
                    <select
                      value={shareScheme}
                      onChange={(e) => setShareScheme(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-semibold text-xs"
                    >
                      <option value="50% Socio / 50% Finca (En Aumento)">50% Socio / 50% Finca (Aumento)</option>
                      <option value="60% Finca / 40% Socio">60% Finca / 40% Socio</option>
                      <option value="70% Finca / 30% Socio">70% Finca / 30% Socio</option>
                      <option value="Fijo $ por Kilo Ganado">Fijo $ por Kilo de Aumento</option>
                      <option value="Ganado en Pastoreo (Alquiler)">Alquiler de Pastos / Pastaje</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Cabezas Recibidas *
                    </label>
                    <input
                      type="number"
                      value={sociedadHeads}
                      onChange={(e) => setSociedadHeads(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Peso Promedio Entrada (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={sociedadAvgWeight}
                      onChange={(e) => setSociedadAvgWeight(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Valor Base / Kg ($ COP)
                    </label>
                    <input
                      type="number"
                      value={sociedadPricePerKg}
                      onChange={(e) => setSociedadPricePerKg(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Potrero & Notas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Potrero Asignado en {targetFarm?.profile?.name}
                    </label>
                    <select
                      value={sociedadPaddockId}
                      onChange={(e) => setSociedadPaddockId(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                    >
                      <option value="">-- Seleccionar Potrero --</option>
                      {targetPaddocks.map((pad) => (
                        <option key={pad.id} value={pad.id}>
                          {pad.code} - {pad.name} ({pad.areaHa} Ha)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Observaciones del Contrato / Acuerdo
                    </label>
                    <input
                      type="text"
                      value={sociedadNotes}
                      onChange={(e) => setSociedadNotes(e.target.value)}
                      placeholder="Plazo de liquidación, condiciones sanitarias..."
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 4: TRANSFERENCIA INTERNA & TRASLADOS */}
          {/* ========================================== */}
          {eventType === 'pasaje' && (
            <div className="space-y-4 pt-1">
              {/* Main Container Card */}
              <div className="bg-[#f0f9ff] border-2 border-[#7dd3fc] rounded-2xl p-4 space-y-4 shadow-2xs">
                {/* Header with Title and PDF Export */}
                <div className="flex items-center justify-between border-b border-[#bae6fd] pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-[#0369a1] uppercase tracking-wide flex items-center gap-1.5">
                        Transferencia Interna & Traslados de Ganado
                      </h3>
                      <p className="text-[11px] text-[#0284c7] font-medium">
                        Movilización entre potreros y predios con trazabilidad zootécnica y pesaje
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSharePDF}
                      className="bg-[#0369a1] hover:bg-[#0284c7] text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Exportar Acta Oficial de Movilización en PDF"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#ffba38]" />
                      <span>Acta de Movilización (PDF)</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Type Switcher: Rotación Interna vs Traslado Inter-Predial */}
                <div className="grid grid-cols-2 gap-2 bg-[#e0f2fe] p-1.5 rounded-xl border border-[#bae6fd]">
                  <button
                    type="button"
                    onClick={() => setPasajeTransferType('rotacion_interna')}
                    className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      pasajeTransferType === 'rotacion_interna'
                        ? 'bg-[#0284c7] text-white shadow-xs'
                        : 'text-[#0369a1] hover:bg-[#bae6fd]/50 font-bold'
                    }`}
                  >
                    <Repeat className="w-4 h-4" />
                    <span>Rotación Interna de Potreros</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPasajeTransferType('traslado_interpredial');
                      if (!pasajeTargetFarmId) {
                        const otherFarm = farms.find((f) => f.profile.id !== selectedFarmId);
                        if (otherFarm) setPasajeTargetFarmId(otherFarm.profile.id);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      pasajeTransferType === 'traslado_interpredial'
                        ? 'bg-[#0284c7] text-white shadow-xs'
                        : 'text-[#0369a1] hover:bg-[#bae6fd]/50 font-bold'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Traslado Inter-Predial (Entre Fincas)</span>
                  </button>
                </div>

                {/* KPI Metrics Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white p-3 rounded-xl border border-[#bae6fd] space-y-1">
                    <span className="text-[10px] font-bold text-[#0284c7] uppercase block">
                      Cabezas a Mover
                    </span>
                    <span className="text-base font-black font-mono text-[#0369a1]">
                      {pasajeHeads || '0'} Cab.
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#bae6fd] space-y-1">
                    <span className="text-[10px] font-bold text-[#0284c7] uppercase block">
                      Peso Promedio
                    </span>
                    <span className="text-base font-black font-mono text-[#0369a1]">
                      {pasajeAvgWeight ? `${pasajeAvgWeight} kg` : '420.0 kg'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#bae6fd] space-y-1">
                    <span className="text-[10px] font-bold text-[#0284c7] uppercase block">
                      Biomasa Total Lote
                    </span>
                    <span className="text-base font-black font-mono text-[#166534]">
                      {(
                        (parseInt(pasajeHeads, 10) || 0) * (parseFloat(pasajeAvgWeight) || 0)
                      ).toLocaleString('es-CO')}{' '}
                      kg
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#bae6fd] space-y-1">
                    <span className="text-[10px] font-bold text-[#0284c7] uppercase block">
                      Carga Animal Estimada
                    </span>
                    <span className="text-base font-black font-mono text-[#78350f]">
                      {(
                        ((parseInt(pasajeHeads, 10) || 0) * (parseFloat(pasajeAvgWeight) || 0)) /
                        450
                      ).toFixed(1)}{' '}
                      UGM
                    </span>
                  </div>
                </div>

                {/* Section 1: Bovine Lot / Group & Weight Information */}
                <div className="bg-white p-3.5 rounded-xl border border-[#bae6fd] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#e0f2fe] pb-2">
                    <span className="text-xs font-bold text-[#0369a1] flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-[#0284c7]" />
                      {isLotsEnabled ? 'Identificación del Lote y Registro de Pesaje' : 'Identificación del Ganado y Registro de Pesaje'}
                    </span>
                    {liveScaleWeight && (
                      <button
                        type="button"
                        onClick={() => {
                          setPasajeAvgWeight(liveScaleWeight.toFixed(1));
                        }}
                        className="text-[10px] text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Zap className="w-3 h-3 text-[#dc9a00]" />
                        Capturar Báscula ({liveScaleWeight.toFixed(1)} kg)
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black text-[#0369a1] uppercase">
                        {isLotsEnabled ? '🏷️ Seleccionar Lote del Hato para Trasladar' : '🏷️ Identificación del Ganado a Trasladar *'}
                      </label>
                      <span className="text-[9px] text-[#0284c7] font-semibold">
                        Carga de información zootécnica
                      </span>
                    </div>

                    <div className={`grid grid-cols-1 ${isLotsEnabled ? 'sm:grid-cols-2' : ''} gap-2`}>
                      {isLotsEnabled && (
                        <select
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const selectedLot = lots.find((l) => l.id === selectedId);
                            if (selectedLot) {
                              setPasajeLotNameOrId(selectedLot.lotName);
                              setPasajeHeads(String(selectedLot.heads));
                              setPasajeAvgWeight(String(selectedLot.currentAvgWeight));
                              if (selectedLot.breed) setPasajeBreed(selectedLot.breed);
                              if (selectedLot.sexLabel) setPasajeSex(selectedLot.sexLabel);
                              if (selectedLot.ageRange) setPasajeAgeRange(selectedLot.ageRange);
                              if (selectedLot.paddockId) {
                                setPasajeOriginPaddockId(selectedLot.paddockId);
                              }
                            }
                          }}
                          className="w-full bg-[#f0f9ff] border border-[#7dd3fc] rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#0369a1]"
                        >
                          <option value="">-- Seleccionar Lote Registrado en Finca --</option>
                          {lots.map((lot) => (
                            <option key={lot.id} value={lot.id}>
                              🏷️ {lot.lotName} ({lot.heads} Cab. • {lot.currentAvgWeight} kg • {lot.category.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      )}

                      <input
                        type="text"
                        value={pasajeLotNameOrId}
                        onChange={(e) => setPasajeLotNameOrId(e.target.value)}
                        placeholder={isLotsEnabled ? "Nombre o identificación del lote..." : "Descripción o identificación del ganado a trasladar..."}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0f172a]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Raza / Cruce
                      </label>
                      <input
                        type="text"
                        value={pasajeBreed}
                        onChange={(e) => setPasajeBreed(e.target.value)}
                        placeholder="Ej. Brahman / Cebú"
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Color / Pelaje
                      </label>
                      <select
                        value={pasajeColor}
                        onChange={(e) => setPasajeColor(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="Blanco / Gris">⚪ Blanco / Gris</option>
                        <option value="Rojo / Sardo">🔴 Rojo / Sardo</option>
                        <option value="Bayo / Amarillo">🟡 Bayo / Amarillo</option>
                        <option value="Negro / Arrebolado">⚫ Negro / Arrebolado</option>
                        <option value="Hosco / Chorreado">🟤 Hosco / Chorreado</option>
                        <option value="Pintado / Overo">⚪🔴 Pintado / Overo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Sexo
                      </label>
                      <select
                        value={pasajeSex}
                        onChange={(e) => setPasajeSex(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="Machos">Machos</option>
                        <option value="Hembras">Hembras</option>
                        <option value="Mixto">Mixto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Rango de Edad
                      </label>
                      <input
                        type="text"
                        value={pasajeAgeRange}
                        onChange={(e) => setPasajeAgeRange(e.target.value)}
                        placeholder="Ej. 18-24 Meses"
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Hierro / Marca
                      </label>
                      <select
                        value={pasajeBrandingIronId}
                        onChange={(e) => setPasajeBrandingIronId(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2 py-1 text-xs font-bold"
                      >
                        <option value="">-- Sin Hierro --</option>
                        {brandingIrons.map((iron) => (
                          <option key={iron.id} value={iron.id}>
                            {iron.symbolIcon || '🔥'} {iron.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Número de Cabezas a Trasladar *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={pasajeHeads}
                        onChange={(e) => setPasajeHeads(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs text-[#0369a1]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Peso Promedio por Animal (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={pasajeAvgWeight}
                        onChange={(e) => setPasajeAvgWeight(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs text-[#0369a1]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Aretes / Identificadores Individuales (Opcional - Separados por coma o espacio)
                    </label>
                    <input
                      type="text"
                      value={pasajeAnimalTags}
                      onChange={(e) => setPasajeAnimalTags(e.target.value)}
                      placeholder="Ej. #402, #403, #404, #405..."
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#334155]"
                    />
                  </div>
                </div>

                {/* Section 2: Origin and Destination Mapping */}
                <div className="bg-white p-3.5 rounded-xl border border-[#bae6fd] space-y-3">
                  <span className="text-xs font-bold text-[#0369a1] flex items-center gap-1.5 border-b border-[#e0f2fe] pb-2">
                    <Route className="w-4 h-4 text-[#0284c7]" />
                    Puntos de Origen y Destino del Ganado
                  </span>

                  {pasajeTransferType === 'rotacion_interna' ? (
                    /* Rotación Interna: Paddock to Paddock in same farm */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          📍 Potrero de Salida / Origen ({targetFarm?.profile?.name || 'Predio Actual'}) *
                        </label>
                        <select
                          value={pasajeOriginPaddockId}
                          onChange={(e) => setPasajeOriginPaddockId(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-2 text-xs font-bold text-[#0f172a]"
                        >
                          <option value="">-- Seleccionar Potrero Origen --</option>
                          {targetPaddocks.map((pad) => (
                            <option key={pad.id} value={pad.id}>
                              {pad.code} - {pad.name} ({pad.areaHa} Ha • {pad.pastureType || 'Pasto'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          🎯 Potrero de Llegada / Destino ({targetFarm?.profile?.name || 'Predio Actual'}) *
                        </label>
                        <select
                          value={pasajeTargetPaddockId}
                          onChange={(e) => setPasajeTargetPaddockId(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-[#bae6fd] rounded-xl px-2.5 py-2 text-xs font-bold text-[#0369a1]"
                        >
                          <option value="">-- Seleccionar Potrero Destino --</option>
                          {targetPaddocks
                            .filter((pad) => pad.id !== pasajeOriginPaddockId)
                            .map((pad) => (
                              <option key={pad.id} value={pad.id}>
                                {pad.code} - {pad.name} ({pad.areaHa} Ha • {pad.status || 'Disponible'})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    /* Traslado Inter-Predial: Farm to Farm */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Origin Farm & Paddock */}
                        <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#cbd5e1] space-y-2">
                          <span className="text-[10px] font-bold text-[#475569] uppercase flex items-center gap-1">
                            <span>🏡</span> Predio de Origen (Salida)
                          </span>
                          <div className="text-xs font-black text-[#0f172a] bg-white p-2 rounded-lg border border-[#e2e8f0]">
                            {targetFarm?.profile?.name || 'Predio Principal'}
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-[#717973] uppercase mb-1">
                              Potrero de Salida
                            </label>
                            <select
                              value={pasajeOriginPaddockId}
                              onChange={(e) => setPasajeOriginPaddockId(e.target.value)}
                              className="w-full bg-white border border-[#cbd5e1] rounded-lg px-2 py-1.5 text-xs font-semibold"
                            >
                              <option value="">-- Potrero de Salida --</option>
                              {targetPaddocks.map((pad) => (
                                <option key={pad.id} value={pad.id}>
                                  {pad.code} - {pad.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Destination Farm & Paddock */}
                        <div className="bg-[#f0f9ff] p-3 rounded-xl border border-[#bae6fd] space-y-2">
                          <span className="text-[10px] font-bold text-[#0369a1] uppercase flex items-center gap-1">
                            <span>🚚</span> Predio de Destino (Llegada) *
                          </span>
                          <select
                            value={pasajeTargetFarmId}
                            onChange={(e) => {
                              setPasajeTargetFarmId(e.target.value);
                              setPasajeDestinationPaddockId('');
                            }}
                            className="w-full bg-white border border-[#7dd3fc] rounded-lg px-2 py-1.5 text-xs font-bold text-[#0369a1]"
                          >
                            <option value="">-- Seleccionar Predio Destino --</option>
                            {farms
                              .filter((f) => f.profile.id !== selectedFarmId)
                              .map((f) => (
                                <option key={f.profile.id} value={f.profile.id}>
                                  {f.profile.name} ({f.profile.department || 'Colombia'})
                                </option>
                              ))}
                          </select>
                          <div>
                            <label className="block text-[9px] font-bold text-[#717973] uppercase mb-1">
                              Potrero de Llegada en Destino
                            </label>
                            <select
                              value={pasajeDestinationPaddockId}
                              onChange={(e) => setPasajeDestinationPaddockId(e.target.value)}
                              className="w-full bg-white border border-[#bae6fd] rounded-lg px-2 py-1.5 text-xs font-semibold"
                            >
                              <option value="">-- Potrero de Recepción --</option>
                              {farms
                                .find((f) => f.profile.id === pasajeTargetFarmId)
                                ?.paddocks.map((pad) => (
                                  <option key={pad.id} value={pad.id}>
                                    {pad.code} - {pad.name} ({pad.areaHa} Ha)
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Rotation Reason & Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Reason for Rotation / Transfer */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#bae6fd] space-y-2.5">
                    <span className="text-xs font-bold text-[#0369a1] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#0284c7]" />
                      Motivo de la Rotación / Movilización
                    </span>

                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Causa Zootécnica
                      </label>
                      <select
                        value={pasajeRotationReason}
                        onChange={(e) => setPasajeRotationReason(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                      >
                        <option value="rotacion_prv">Rotación PRV / Voisin (Cumplimiento de descanso)</option>
                        <option value="forraje_consumido">Forraje Consumido (Altura de remanente óptima)</option>
                        <option value="descanso_potrero">Mantenimiento y Recuperación del Potrero</option>
                        <option value="clasificacion">Separación / Clasificación Zootécnica</option>
                        <option value="inundacion">Anegamiento / Inundación por Lluvias</option>
                        <option value="otro">Otro Motivo Específico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Detalle o Justificación Adicional
                      </label>
                      <input
                        type="text"
                        value={pasajeCustomReason}
                        onChange={(e) => setPasajeCustomReason(e.target.value)}
                        placeholder="Ej. Tiempo óptimo de descanso alcanzado (32 días)"
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  {/* Operational Details (Date, Time, Handlers) */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#bae6fd] space-y-2.5">
                    <span className="text-xs font-bold text-[#0369a1] flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#0284c7]" />
                      Responsables y Horario del Movimiento
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Fecha Movimiento
                        </label>
                        <input
                          type="date"
                          value={pasajeDate}
                          onChange={(e) => setPasajeDate(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2 py-1.5 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Hora de Arreo/Salida
                        </label>
                        <input
                          type="time"
                          value={pasajeTime}
                          onChange={(e) => setPasajeTime(e.target.value)}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2 py-1.5 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Despachado / Arreado Por
                        </label>
                        <input
                          type="text"
                          value={pasajeDispatcher}
                          onChange={(e) => setPasajeDispatcher(e.target.value)}
                          placeholder="Ej. Carlos Restrepo"
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Recibido Por
                        </label>
                        <input
                          type="text"
                          value={pasajeReceiver}
                          onChange={(e) => setPasajeReceiver(e.target.value)}
                          placeholder="Ej. Luis Durango"
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: If Inter-Predial, Show Official ICA & Freight Info */}
                {pasajeTransferType === 'traslado_interpredial' && (
                  <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#bae6fd] space-y-3">
                    <span className="text-xs font-bold text-[#0369a1] flex items-center gap-1.5 border-b border-[#e0f2fe] pb-2">
                      <Truck className="w-4 h-4 text-[#0284c7]" />
                      Documentación Sanitaria ICA & Transporte de Carga
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          N° Guía GSMI ICA *
                        </label>
                        <input
                          type="text"
                          value={pasajeIcaGuideNumber}
                          onChange={(e) => setPasajeIcaGuideNumber(e.target.value)}
                          placeholder="Ej. GSMI-2026-48901"
                          className="w-full bg-white border border-[#7dd3fc] rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-[#0369a1]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          N° Remisión Interna
                        </label>
                        <input
                          type="text"
                          value={pasajeRemisionNumber}
                          onChange={(e) => setPasajeRemisionNumber(e.target.value)}
                          placeholder="Ej. REM-2026-104"
                          className="w-full bg-white border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Costo del Flete ($ COP)
                        </label>
                        <input
                          type="number"
                          value={pasajeFreightCost}
                          onChange={(e) => setPasajeFreightCost(e.target.value)}
                          placeholder="350000"
                          className="w-full bg-white border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Tipo de Vehículo
                        </label>
                        <select
                          value={pasajeTransportMode}
                          onChange={(e) =>
                            setPasajeTransportMode(
                              e.target.value as 'a_pie' | 'camion_sencillo' | 'doble_troque' | 'tractomula'
                            )
                          }
                          className="w-full bg-white border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                        >
                          <option value="a_pie">Arreo a Pie / Vaquería</option>
                          <option value="camion_sencillo">Camión Sencillo Ganadero</option>
                          <option value="doble_troque">Doble Troque Ganadero</option>
                          <option value="tractomula">Tractomula / Tráiler Ganadero</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Transportador / Chofer
                        </label>
                        <input
                          type="text"
                          value={pasajeTransporterName}
                          onChange={(e) => setPasajeTransporterName(e.target.value)}
                          placeholder="Nombre y empresa"
                          className="w-full bg-white border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Placa del Vehículo
                        </label>
                        <input
                          type="text"
                          value={pasajeTruckPlate}
                          onChange={(e) => setPasajeTruckPlate(e.target.value.toUpperCase())}
                          placeholder="Ej. WNK-452"
                          className="w-full bg-white border border-[#cbd5e1] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs text-[#0f172a]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="pasajeWithdrawalCheck"
                        checked={pasajeWithdrawalVerified}
                        onChange={(e) => setPasajeWithdrawalVerified(e.target.checked)}
                        className="rounded border-[#cbd5e1] text-[#0284c7] focus:ring-[#0284c7] cursor-pointer"
                      />
                      <label
                        htmlFor="pasajeWithdrawalCheck"
                        className="text-xs text-[#475569] font-medium cursor-pointer"
                      >
                        Certifico que el lote cumple con los tiempos de retiro sanitario (sin medicamentos residuales activos).
                      </label>
                    </div>
                  </div>
                )}

                {/* Section 5: Observations */}
                <div>
                  <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                    Observaciones y Novedades del Movimiento
                  </label>
                  <input
                    type="text"
                    value={pasajeNotes}
                    onChange={(e) => setPasajeNotes(e.target.value)}
                    placeholder="Condición de las pasturas, estado corporal de los animales, hora estimada de llegada..."
                    className="w-full bg-white border border-[#7dd3fc] rounded-xl px-3 py-2 text-xs text-[#0f172a]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 6: DAR DE BAJA (MUERTE, PÉRDIDA, SACRIFICIO, ENFERMEDAD) */}
          {/* ========================================== */}
          {eventType === 'baja' && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#fff5f5] border-2 border-[#fca5a5] rounded-2xl p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#fca5a5] pb-2.5">
                  <p className="text-xs font-bold text-[#991b1b] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Motivo & Justificación de Salida por Baja
                  </p>
                  <span className="text-[10px] bg-rose-100 text-rose-900 font-mono font-bold px-2 py-0.5 rounded border border-rose-300">
                    Módulo de Bajas
                  </span>
                </div>

                {/* 4 Causas Principales */}
                <div>
                  <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1.5">
                    Causa Principal de la Baja *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setBajaReason('muerte')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        bajaReason === 'muerte'
                          ? 'bg-red-800 text-white border-red-950 ring-2 ring-red-700 shadow-xs'
                          : 'bg-white text-gray-700 border-red-200 hover:bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">💀</span>
                        <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded uppercase ${bajaReason === 'muerte' ? 'bg-red-900 text-white' : 'bg-red-100 text-red-800'}`}>Muerte</span>
                      </div>
                      <span className="text-xs font-black leading-tight">Muerte</span>
                      <span className="text-[9.5px] opacity-80">Natural o Accidental</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBajaReason('perdida')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        bajaReason === 'perdida'
                          ? 'bg-amber-800 text-white border-amber-950 ring-2 ring-amber-700 shadow-xs'
                          : 'bg-white text-gray-700 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">🥷</span>
                        <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded uppercase ${bajaReason === 'perdida' ? 'bg-amber-900 text-white' : 'bg-amber-100 text-amber-800'}`}>Pérdida</span>
                      </div>
                      <span className="text-xs font-black leading-tight">Pérdida</span>
                      <span className="text-[9.5px] opacity-80">Hurto o Extravío</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBajaReason('sacrificio')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        bajaReason === 'sacrificio'
                          ? 'bg-orange-800 text-white border-orange-950 ring-2 ring-orange-700 shadow-xs'
                          : 'bg-white text-gray-700 border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">🔪</span>
                        <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded uppercase ${bajaReason === 'sacrificio' ? 'bg-orange-900 text-white' : 'bg-orange-100 text-orange-800'}`}>Sacrificio</span>
                      </div>
                      <span className="text-xs font-black leading-tight">Sacrificio</span>
                      <span className="text-[9.5px] opacity-80">Por Emergencia</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBajaReason('enfermedad')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        bajaReason === 'enfermedad'
                          ? 'bg-rose-900 text-white border-rose-950 ring-2 ring-rose-800 shadow-xs'
                          : 'bg-white text-gray-700 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">🏥</span>
                        <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded uppercase ${bajaReason === 'enfermedad' ? 'bg-rose-950 text-white' : 'bg-rose-100 text-rose-800'}`}>Enfermedad</span>
                      </div>
                      <span className="text-xs font-black leading-tight">Enfermedad</span>
                      <span className="text-[9.5px] opacity-80">Descarte Sanitario</span>
                    </button>
                  </div>
                </div>

                {/* Selección de Lote o Animal Afectado */}
                <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black text-rose-900 uppercase">
                      {isLotsEnabled ? '🏷️ Seleccionar Lote o Animal Afectado' : '🏷️ Identificación del Animal Afectado *'}
                    </label>
                    <span className="text-[9px] text-rose-700 font-semibold">
                      Trazabilidad con Información Básica
                    </span>
                  </div>
                  <div className={`grid grid-cols-1 ${isLotsEnabled ? 'sm:grid-cols-2' : ''} gap-2`}>
                    {isLotsEnabled && (
                      <select
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedLot = lots.find((l) => l.id === selectedId);
                          if (selectedLot) {
                            setBajaAnimalTagOrLot(selectedLot.lotName);
                            setBajaCategory(selectedLot.category);
                            setBajaBreed(selectedLot.breed || 'Brahman Blanco');
                            setBajaSex(selectedLot.sexLabel || 'Machos');
                            setBajaAgeRange(selectedLot.ageRange || '24-30 Meses');
                            setBajaAvgWeight(String(selectedLot.currentAvgWeight));
                            if (selectedLot.paddockId) {
                              setBajaPaddockId(selectedLot.paddockId);
                            }
                          }
                        }}
                        className="w-full bg-[#fff5f5] border border-rose-300 rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#991b1b]"
                      >
                        <option value="">-- Seleccionar Lote Registrado en Finca --</option>
                        {lots.map((lot) => (
                          <option key={lot.id} value={lot.id}>
                            🏷️ {lot.lotName} ({lot.heads} Cab. • {lot.currentAvgWeight} kg • {lot.category.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    )}

                    <input
                      type="text"
                      value={bajaAnimalTagOrLot}
                      onChange={(e) => setBajaAnimalTagOrLot(e.target.value)}
                      placeholder={isLotsEnabled ? "Arete / ID individual o nombre de lote..." : "Arete o identificación del animal (Ej: GLO-001)..."}
                      className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 font-bold font-mono text-xs text-[#991b1b]"
                      required
                    />
                  </div>

                  {/* Datos Básicos del Ganado Dado de Baja */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Categoría
                      </label>
                      <select
                        value={bajaCategory}
                        onChange={(e) => setBajaCategory(e.target.value as LotCategory)}
                        className="w-full bg-white border border-rose-200 rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="ceba">Ceba</option>
                        <option value="cria">Cría / Levante</option>
                        <option value="leche">Lechería</option>
                        <option value="genetica">Genética</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Raza / Cruce
                      </label>
                      <input
                        type="text"
                        value={bajaBreed}
                        onChange={(e) => setBajaBreed(e.target.value)}
                        placeholder="Ej. Brahman Blanco"
                        className="w-full bg-white border border-rose-200 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Color / Pelaje
                      </label>
                      <select
                        value={bajaColor}
                        onChange={(e) => setBajaColor(e.target.value)}
                        className="w-full bg-white border border-rose-200 rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="Blanco / Gris">⚪ Blanco / Gris</option>
                        <option value="Rojo / Sardo">🔴 Rojo / Sardo</option>
                        <option value="Bayo / Amarillo">🟡 Bayo / Amarillo</option>
                        <option value="Negro / Arrebolado">⚫ Negro / Arrebolado</option>
                        <option value="Hosco / Chorreado">🟤 Hosco / Chorreado</option>
                        <option value="Pintado / Overo">⚪🔴 Pintado / Overo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Sexo
                      </label>
                      <select
                        value={bajaSex}
                        onChange={(e) => setBajaSex(e.target.value)}
                        className="w-full bg-white border border-rose-200 rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="Machos">Machos</option>
                        <option value="Hembras">Hembras</option>
                        <option value="Mixto">Mixto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Rango Edad
                      </label>
                      <input
                        type="text"
                        value={bajaAgeRange}
                        onChange={(e) => setBajaAgeRange(e.target.value)}
                        placeholder="Ej. 18-24 Meses"
                        className="w-full bg-white border border-rose-200 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#717973] uppercase mb-0.5">
                        Hierro
                      </label>
                      <select
                        value={bajaBrandingIronId}
                        onChange={(e) => setBajaBrandingIronId(e.target.value)}
                        className="w-full bg-white border border-rose-200 rounded-lg px-2 py-1 text-xs font-bold"
                      >
                        <option value="">-- Sin Hierro --</option>
                        {brandingIrons.map((iron) => (
                          <option key={iron.id} value={iron.id}>
                            {iron.symbolIcon || '🔥'} {iron.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Cabezas Dadas de Baja *
                    </label>
                    <input
                      type="number"
                      value={bajaHeads}
                      onChange={(e) => setBajaHeads(e.target.value)}
                      className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 font-bold font-mono text-xs text-[#991b1b]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Peso Estimado o en Báscula (kg/cab)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bajaAvgWeight}
                      onChange={(e) => setBajaAvgWeight(e.target.value)}
                      className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-[#991b1b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Fecha del Suceso *
                    </label>
                    <input
                      type="date"
                      value={bajaDate}
                      onChange={(e) => setBajaDate(e.target.value)}
                      className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Diagnóstico Clínico / Causa Específica *
                    </label>
                    <input
                      type="text"
                      value={bajaSpecificCause}
                      onChange={(e) => setBajaSpecificCause(e.target.value)}
                      placeholder="Ej. Timpanismo agudo / Fractura de fémur / Anaplasmosis / Abigeato..."
                      className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#991b1b]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Pérdida Económica Estimada ($ COP)
                    </label>
                    <input
                      type="number"
                      value={bajaEstimatedLoss}
                      onChange={(e) => setBajaEstimatedLoss(e.target.value)}
                      placeholder="Ej. 3500000"
                      className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-rose-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Veterinario o Testigo que Certifica
                    </label>
                    <input
                      type="text"
                      value={bajaWitnessOrVet}
                      onChange={(e) => setBajaWitnessOrVet(e.target.value)}
                      placeholder="Ej. Dr. Mario Restrepo (TP: 1892)"
                      className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Denuncia / Acta / Documento Soporte
                    </label>
                    <input
                      type="text"
                      value={bajaDocumentRef}
                      onChange={(e) => setBajaDocumentRef(e.target.value)}
                      placeholder="Ej. ACTA-NEC-042 / DENUNCIA-POL-99"
                      className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Potrero donde Ocurrió
                    </label>
                    <select
                      value={bajaPaddockId}
                      onChange={(e) => setBajaPaddockId(e.target.value)}
                      className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                    >
                      <option value="">-- Seleccionar Potrero --</option>
                      {targetPaddocks.map((pad) => (
                        <option key={pad.id} value={pad.id}>
                          {pad.code} - {pad.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                    Disposición Final / Observaciones
                  </label>
                  <input
                    type="text"
                    value={bajaNotes}
                    onChange={(e) => setBajaNotes(e.target.value)}
                    placeholder="Ej. Enterrado en fosa con cal viva / Notificado a la aseguradora ganadera..."
                    className="w-full bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#eeeeee] shrink-0">
            {eventType === 'pasaje' && (
              <button
                type="button"
                onClick={handleSharePDF}
                className="bg-[#0d47a1] hover:bg-[#1565c0] text-white font-bold px-4 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
              >
                <Share2 className="w-4 h-4 text-[#ffba38]" />
                <span>Compartir en PDF</span>
              </button>
            )}

            <button
              type="submit"
              className="flex-1 bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-extrabold py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 tactical-shadow transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5 text-[#523700]" />
              <span>
                Cargar e Ingresar a Inventario de{' '}
                <strong className="underline">{targetFarm?.profile?.name || 'Predio'}</strong>
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 bg-[#f3f3f3] hover:bg-[#e9eae9] text-[#414844] font-semibold rounded-2xl text-xs transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal for Changing Predio in Any Event (Compra, Venta, Parto, Sociedad, Baja, etc.) */}
      {showFarmConfirmModal && pendingFarmId && (
        <div
          className="fixed inset-0 z-[75] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancelFarmChange();
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-emerald-300 shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                <Building2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#012d1d]">
                  {getFarmChangeConfirmDetails().title}
                </h3>
                <p className="text-xs text-[#525e57] font-medium mt-0.5 leading-relaxed">
                  El predio seleccionado en el panel principal es{' '}
                  <strong className="text-emerald-950 font-bold underline">
                    {farms.find((f) => f.profile.id === currentFarmId)?.profile.name || 'Predio Activo'}
                  </strong>.
                </p>
              </div>
            </div>

            <div className="bg-[#f7faf8] p-3.5 rounded-2xl border border-[#d2ded7] text-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#717973] font-semibold">Predio Actual:</span>
                <span className="font-bold text-[#012d1d]">
                  {targetFarm?.profile.name} ({targetFarm?.profile.municipality})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-[#e2ece6] pt-2">
                <span className="text-[#717973] font-semibold">{getFarmChangeConfirmDetails().roleLabel}</span>
                <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {farms.find((f) => f.profile.id === pendingFarmId)?.profile.name}
                </span>
              </div>
              <div className="bg-[#fff9e6] border border-[#ffe082] rounded-xl p-2.5 text-[11px] text-[#7c5e10] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                <span>
                  {getFarmChangeConfirmDetails().note}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eeeeee]">
              <button
                type="button"
                onClick={handleCancelFarmChange}
                className="px-4 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar (Mantener {targetFarm?.profile.name})
              </button>
              <button
                type="button"
                onClick={handleConfirmFarmChange}
                className="px-4 py-2.5 bg-[#012d1d] hover:bg-[#024029] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4 text-emerald-300" />
                <span>{getFarmChangeConfirmDetails().btnText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
