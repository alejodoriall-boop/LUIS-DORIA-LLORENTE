import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Scale,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Truck,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  Zap,
  Info,
  Calendar,
  CheckCircle2,
  Users,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
  Calculator,
  Printer,
  BadgePercent,
  Search,
  CheckSquare,
  Square,
  Tag,
  Dna,
  Filter,
  Check,
  ChevronDown,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { CowIcon } from '../icons/CowIcon';
import {
  FarmDataPackage,
  LotRecord,
  MasterTraceabilityAnimal,
  LivestockSaleRecord,
  SaleReasonType,
  SaleSettlementMode,
  SaleDestinationType,
  SoldAnimalItem,
} from '../../types';
import {
  SALE_REASON_LABELS,
  SETTLEMENT_MODE_LABELS,
  DESTINATION_TYPE_LABELS,
} from '../../data/mockSalesData';
import { generateAnimalsForLot } from '../../utils/lotAnimalUtils';
import { MASTER_HERD_TRACEABILITY_DATA } from '../HerdTraceabilityView';

export interface EditableAnimalWeight {
  id: string;
  tag: string;
  name?: string;
  breed: string;
  sex: string;
  category: string;
  entryWeightKg: number;
  entryDate: string;
  currentGrossWeightKg: number;
  bodyConditionScore: number;
  initialCost: number;
  accumulatedCosts: number;
  originLotId?: string;
  originLotName?: string;
  paddockId?: string;
  paddockName?: string;
  healthWithdrawalActive?: boolean;
  withdrawalDaysRemaining?: number;
}

interface RegisterSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  lots: LotRecord[];
  activeAnimals?: MasterTraceabilityAnimal[];
  liveScaleWeight?: number;
  scaleName?: string;
  onOpenScaleModal?: () => void;
  onSaveSale: (sale: LivestockSaleRecord) => void;
  brandingIrons?: any[];
  isLotsEnabled?: boolean;
}

export const RegisterSaleModal: React.FC<RegisterSaleModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  lots,
  activeAnimals = [],
  liveScaleWeight,
  scaleName,
  onOpenScaleModal,
  onSaveSale,
  isLotsEnabled = false,
}) => {
  const [selectedFarmId, setSelectedFarmId] = useState<string>(currentFarmId || 'farm-1');
  const targetFarm = useMemo(() => {
    return farms.find((f) => f.profile.id === selectedFarmId) || farms[0] || null;
  }, [farms, selectedFarmId]);

  const targetPaddocks = useMemo(() => targetFarm?.paddocks || [], [targetFarm]);

  // Form Basic Info
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saleReason, setSaleReason] = useState<SaleReasonType>('ceba_terminada');
  const [settlementMode, setSettlementMode] = useState<SaleSettlementMode>('kilo_en_pie');
  const [destinationType, setDestinationType] = useState<SaleDestinationType>('frigorifico');

  // =========================================================================
  // INDIVIDUAL ANIMAL-BY-ANIMAL ROSTER (MANDATORY CORE)
  // =========================================================================
  const [dispatchAnimals, setDispatchAnimals] = useState<EditableAnimalWeight[]>([]);
  const [selectedLotToLoad, setSelectedLotToLoad] = useState<string>(() => (lots.length > 0 ? lots[0].id : ''));
  const [lotSelectionFilter, setLotSelectionFilter] = useState<'all' | 'heavy_480' | 'heavy_500'>('all');

  // Quick Single Animal Scan / Add Inputs
  const [quickTagInput, setQuickTagInput] = useState<string>('');
  const [quickWeightInput, setQuickWeightInput] = useState<string>('');
  const [quickAnimalSearchTerm, setQuickAnimalSearchTerm] = useState<string>('');
  const [showHerdSuggestions, setShowHerdSuggestions] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Commercial & Buyer details
  const [buyerName, setBuyerName] = useState<string>('Frigorífico Red Cárnica S.A.S.');
  const [buyerDoc, setBuyerDoc] = useState<string>('NIT 900.458.120-4');
  const [buyerPhone, setBuyerPhone] = useState<string>('+57 310 845 2200');
  const [destinationLocation, setDestinationLocation] = useState<string>('Planta de Beneficio Montería - Córdoba');
  const [icaGuideNumber, setIcaGuideNumber] = useState<string>(
    `ICA-GSMI-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `FAC-VTA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // Biometry & Shrinkage Defaults
  const [shrinkagePercent, setShrinkagePercent] = useState<string>('3.5');
  const [carcassYieldPercent, setCarcassYieldPercent] = useState<string>('55.5');
  const [bodyConditionScore, setBodyConditionScore] = useState<number>(4.0);

  // Pricing inputs based on mode
  const [pricePerKg, setPricePerKg] = useState<string>('9200');
  const [pricePerCarcassKg, setPricePerCarcassKg] = useState<string>('17800');
  const [pricePerHead, setPricePerHead] = useState<string>('4500000');
  const [geneticBasePrice, setGeneticBasePrice] = useState<string>('12000000');
  const [geneticPremium, setGeneticPremium] = useState<string>('3500000');

  // Deductions inputs
  const [freightCost, setFreightCost] = useState<string>('600000');
  const [auctionCommissionPct, setAuctionCommissionPct] = useState<string>('0');
  const [weighingCost, setWeighingCost] = useState<string>('75000');
  const [withholdingTaxPct, setWithholdingTaxPct] = useState<string>('1.5');
  const [livestockFundPct, setLivestockFundPct] = useState<string>('0.75');
  const [otherDeductions, setOtherDeductions] = useState<string>('0');

  // Logistics & Sanity
  const [transporterName, setTransporterName] = useState<string>('Transportes Ganaderos del Sinú');
  const [transporterPhone, setTransporterPhone] = useState<string>('+57 312 901 8833');
  const [truckPlate, setTruckPlate] = useState<string>('TRK-984');
  const [dispatcherName, setDispatcherName] = useState<string>('Carlos Mendoza (Mayordomo)');
  const [operatorResponsible, setOperatorResponsible] = useState<string>('Ing. Mateo Restrepo');
  const [sanitaryClearanceVerified, setSanitaryClearanceVerified] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>(
    'Salida formal con báscula individual certificada y cumplimiento 100% de tiempos de retiro.'
  );

  // Master Herd Catalog for Instant Lookup
  const masterHerdCatalog = useMemo((): EditableAnimalWeight[] => {
    const catalog: EditableAnimalWeight[] = [];
    const farmName = targetFarm?.profile.name || 'Hacienda La Gloria';

    // Prioritize lots belonging to target farm
    const activeFarmLots = targetFarm?.lots && targetFarm.lots.length > 0
      ? targetFarm.lots
      : lots.filter((l) => !l.farmId || l.farmId === selectedFarmId);

    // From All Active Lots in target farm
    activeFarmLots.forEach((lot) => {
      const generated = generateAnimalsForLot(lot, farmName);
      generated.forEach((a, idx) => {
        const entryW = a.purchasedInfo?.purchaseWeightKg || Math.round(a.weightKg * 0.75) || 320;
        const days = a.ageMonths ? Math.max(1, a.ageMonths * 30 - 300) : 240;
        const initialCost = a.purchasedInfo?.purchasePriceTotal || Math.round(entryW * 8000) || 2560000;
        const sanCost = Math.round(95000 + (idx % 4) * 5000);
        const feedCost = Math.round(480000 + (idx % 3) * 15000);
        const laborCost = 180000;

        catalog.push({
          id: a.id,
          tag: a.tag,
          name: a.name || `${lot.lotName} - #${a.tag}`,
          breed: a.breed || lot.breed || 'Brahman Comercial',
          sex: a.sex || lot.sexLabel || 'macho',
          category: a.category || lot.category || 'ceba',
          entryWeightKg: entryW,
          entryDate: new Date(Date.now() - days * 86400000).toISOString().split('T')[0],
          currentGrossWeightKg: a.weightKg || lot.currentAvgWeight || 500,
          bodyConditionScore: 4.0,
          initialCost,
          accumulatedCosts: sanCost + feedCost + laborCost,
          originLotId: lot.id,
          originLotName: lot.lotName,
          paddockId: lot.paddockId,
          paddockName: targetPaddocks.find((p) => p.id === lot.paddockId)?.name,
          healthWithdrawalActive: false,
          withdrawalDaysRemaining: 0,
        });
      });
    });

    // From MASTER_HERD_TRACEABILITY_DATA (if applicable to this farm)
    (MASTER_HERD_TRACEABILITY_DATA as any[]).forEach((m) => {
      const tagStr = m.earTag || m.tag || 'TAG';
      if (!catalog.some((c) => c.tag.toLowerCase() === tagStr.toLowerCase() || c.id === m.id)) {
        catalog.push({
          id: m.id,
          tag: tagStr,
          name: m.animalName || m.name || `Animal #${tagStr}`,
          breed: m.breed || 'Brahman',
          sex: m.sex === 'Hembra' ? 'hembra' : 'macho',
          category: m.breedCategory === 'Leche' ? 'leche' : 'ceba',
          entryWeightKg: m.weaningWeightKg || m.entryWeightKg || 180,
          entryDate: m.entryDate || m.birthDate || '2023-01-01',
          currentGrossWeightKg: m.currentWeightKg || m.weightKg || 550,
          bodyConditionScore: m.bodyConditionScore || 3.5,
          initialCost: 3500000,
          accumulatedCosts: 850000,
          originLotId: 'master-traceability',
          originLotName: m.lotName || 'Hato General',
          healthWithdrawalActive: Boolean(m.withdrawalActive),
          withdrawalDaysRemaining: m.withdrawalDaysRemaining || (m.withdrawalActive ? 5 : 0),
        });
      }
    });

    return catalog;
  }, [lots, targetFarm, targetPaddocks, selectedFarmId]);

  // Pre-load default animals from first lot on mount if list is empty
  useEffect(() => {
    if (dispatchAnimals.length === 0 && lots.length > 0 && selectedLotToLoad) {
      const lot = lots.find((l) => l.id === selectedLotToLoad);
      if (lot) {
        const lotAnimals = masterHerdCatalog.filter((a) => a.originLotId === lot.id);
        if (lotAnimals.length > 0) {
          // Pre-populate with first 5 animals as starting draft
          setDispatchAnimals(lotAnimals.slice(0, Math.min(8, lotAnimals.length)));
        }
      }
    }
  }, [selectedLotToLoad, lots, masterHerdCatalog]);

  // Set default buyer and params when saleReason changes
  useEffect(() => {
    if (saleReason === 'ceba_terminada') {
      setDestinationType('frigorifico');
      setBuyerName('Frigorífico Red Cárnica S.A.S.');
      setSettlementMode('kilo_en_pie');
      setPricePerKg('9200');
      setCarcassYieldPercent('55.5');
      setShrinkagePercent('3.5');
      setAuctionCommissionPct('0');
    } else if (saleReason === 'genetica_elite') {
      setDestinationType('subasta');
      setBuyerName('Subastar S.A. - Gran Subasta Élite');
      setSettlementMode('valor_genetico');
      setAuctionCommissionPct('5.0');
      setShrinkagePercent('2.0');
      setGeneticBasePrice('12000000');
      setGeneticPremium('3500000');
    } else if (saleReason === 'pie_de_cria') {
      setDestinationType('finca_receptora');
      setBuyerName('Ganadería Las Acacias - San Carlos');
      setSettlementMode('por_cabeza');
      setPricePerHead('4800000');
      setAuctionCommissionPct('0');
      setShrinkagePercent('3.0');
    } else if (saleReason === 'descarte_productivo') {
      setDestinationType('subasta');
      setBuyerName('Subasta Ganadera Regional');
      setSettlementMode('kilo_en_pie');
      setPricePerKg('7400');
      setAuctionCommissionPct('3.0');
      setShrinkagePercent('4.0');
    } else if (saleReason === 'descarte_sanitario') {
      setDestinationType('particular');
      setBuyerName('Carnes y Derivados Locales');
      setSettlementMode('kilo_en_pie');
      setPricePerKg('6200');
      setAuctionCommissionPct('0');
      setShrinkagePercent('5.0');
    }
  }, [saleReason]);

  // Filter herd suggestions for quick-add
  const filteredHerdSuggestions = useMemo(() => {
    const term = (quickAnimalSearchTerm || quickTagInput).trim().toLowerCase();
    if (!term) return [];
    const alreadyAddedTags = new Set(dispatchAnimals.map((a) => a.tag.toLowerCase()));

    return masterHerdCatalog
      .filter((a) => !alreadyAddedTags.has(a.tag.toLowerCase()))
      .filter(
        (a) =>
          a.tag.toLowerCase().includes(term) ||
          (a.name && a.name.toLowerCase().includes(term)) ||
          a.breed.toLowerCase().includes(term) ||
          (a.originLotName && a.originLotName.toLowerCase().includes(term))
      )
      .slice(0, 6);
  }, [masterHerdCatalog, quickAnimalSearchTerm, quickTagInput, dispatchAnimals]);

  // =========================================================================
  // ACTIONS: ADD, REMOVE, UPDATE INDIVIDUAL ANIMALS
  // =========================================================================

  const handleAddAnimalDirectly = (animalToAdd: EditableAnimalWeight) => {
    setValidationError(null);
    if (dispatchAnimals.some((a) => a.tag.toLowerCase() === animalToAdd.tag.toLowerCase())) {
      setValidationError(`El animal con chapeta ${animalToAdd.tag} ya se encuentra en la lista de venta.`);
      return;
    }
    setDispatchAnimals((prev) => [...prev, animalToAdd]);
    setQuickTagInput('');
    setQuickWeightInput('');
    setQuickAnimalSearchTerm('');
    setShowHerdSuggestions(false);
  };

  const handleQuickAddByInput = () => {
    const rawTag = quickTagInput.trim();
    if (!rawTag) {
      setValidationError('Por favor ingrese la chapeta o código del animal.');
      return;
    }

    if (dispatchAnimals.some((a) => a.tag.toLowerCase() === rawTag.toLowerCase())) {
      setValidationError(`El animal con chapeta ${rawTag} ya está en la lista de despacho.`);
      return;
    }

    // Lookup in catalog by exact match or normalized format
    const cleanRawTag = rawTag.toLowerCase().replace(/^[#\s]+/, '');
    const matched = masterHerdCatalog.find(
      (a) =>
        a.tag.toLowerCase() === rawTag.toLowerCase() ||
        a.tag.toLowerCase().replace(/^[#\s]+/, '') === cleanRawTag ||
        a.id.toLowerCase() === rawTag.toLowerCase()
    );

    if (!matched) {
      setValidationError(
        `❌ ERROR DE INVENTARIO: El animal con identificación/chapeta "${rawTag}" NO existe en el predio "${targetFarm?.profile.name || 'Predio seleccionado'}". No se puede cargar para venta ningún animal no registrado en el hato o con número erróneo.`
      );
      return;
    }

    const weightFromInput = parseFloat(quickWeightInput);
    const resolvedWeight =
      !isNaN(weightFromInput) && weightFromInput > 0
        ? weightFromInput
        : liveScaleWeight && liveScaleWeight > 0
        ? Math.round(liveScaleWeight)
        : matched.currentGrossWeightKg || 480;

    handleAddAnimalDirectly({
      ...matched,
      currentGrossWeightKg: resolvedWeight,
    });
  };

  const handleLoadLotAnimals = () => {
    if (!selectedLotToLoad) return;
    const lot = lots.find((l) => l.id === selectedLotToLoad);
    if (!lot) return;

    let lotAnimals = masterHerdCatalog.filter((a) => a.originLotId === lot.id);

    if (lotSelectionFilter === 'heavy_480') {
      lotAnimals = lotAnimals.filter((a) => a.currentGrossWeightKg >= 480);
    } else if (lotSelectionFilter === 'heavy_500') {
      lotAnimals = lotAnimals.filter((a) => a.currentGrossWeightKg >= 500);
    }

    const currentTags = new Set(dispatchAnimals.map((a) => a.tag.toLowerCase()));
    const toAdd = lotAnimals.filter((a) => !currentTags.has(a.tag.toLowerCase()));

    if (toAdd.length === 0) {
      setValidationError('Todos los animales del lote seleccionado ya están incluidos en la lista.');
      return;
    }

    setDispatchAnimals((prev) => [...prev, ...toAdd]);
    setValidationError(null);
  };

  const handleRemoveAnimal = (animalId: string) => {
    setDispatchAnimals((prev) => prev.filter((a) => a.id !== animalId));
  };

  const handleClearAllAnimals = () => {
    if (dispatchAnimals.length > 0 && window.confirm('¿Está seguro de vaciar la lista de animales a despachar?')) {
      setDispatchAnimals([]);
    }
  };

  const handleUpdateAnimalWeight = (animalId: string, newWeight: number) => {
    setDispatchAnimals((prev) =>
      prev.map((a) => (a.id === animalId ? { ...a, currentGrossWeightKg: newWeight } : a))
    );
  };

  const handleCaptureLiveScaleToAnimal = (animalId: string) => {
    if (liveScaleWeight && liveScaleWeight > 0) {
      handleUpdateAnimalWeight(animalId, Math.round(liveScaleWeight));
    }
  };

  // =========================================================================
  // METRICS & FINANCIAL CONSOLIDATION
  // =========================================================================
  const parsedShrinkagePct = parseFloat(shrinkagePercent) || 0;
  const parsedCarcassYield = parseFloat(carcassYieldPercent) || 0;
  const headsCount = dispatchAnimals.length;

  const totalGrossWeightKg = useMemo(() => {
    return dispatchAnimals.reduce((acc, a) => acc + (a.currentGrossWeightKg || 0), 0);
  }, [dispatchAnimals]);

  const avgGrossWeightKg = headsCount > 0 ? totalGrossWeightKg / headsCount : 0;
  const totalShrinkageKg = (totalGrossWeightKg * parsedShrinkagePct) / 100;
  const totalNetWeightKg = totalGrossWeightKg - totalShrinkageKg;
  const avgNetWeightKg = headsCount > 0 ? totalNetWeightKg / headsCount : 0;
  const hotCarcassWeightKg = (totalNetWeightKg * parsedCarcassYield) / 100;
  const uggCount = Number((totalGrossWeightKg / 450).toFixed(2));

  // Count invalid weight animals
  const unweighedCount = useMemo(() => {
    return dispatchAnimals.filter((a) => !a.currentGrossWeightKg || a.currentGrossWeightKg <= 0).length;
  }, [dispatchAnimals]);

  // Check for animals with active withdrawal
  const withdrawalBlockedAnimals = useMemo(() => {
    return dispatchAnimals.filter((a) => a.healthWithdrawalActive);
  }, [dispatchAnimals]);

  // Gross Income Calculation
  const grossSaleIncome = useMemo(() => {
    if (settlementMode === 'kilo_en_pie') {
      const pKg = parseFloat(pricePerKg) || 0;
      return Math.round(totalNetWeightKg * pKg);
    }
    if (settlementMode === 'kilo_en_canal') {
      const pCanal = parseFloat(pricePerCarcassKg) || 0;
      return Math.round(hotCarcassWeightKg * pCanal);
    }
    if (settlementMode === 'por_cabeza') {
      const pHead = parseFloat(pricePerHead) || 0;
      return Math.round(headsCount * pHead);
    }
    if (settlementMode === 'valor_genetico') {
      const base = parseFloat(geneticBasePrice) || 0;
      const premium = parseFloat(geneticPremium) || 0;
      return Math.round(headsCount * (base + premium));
    }
    return 0;
  }, [
    settlementMode,
    totalNetWeightKg,
    pricePerKg,
    hotCarcassWeightKg,
    pricePerCarcassKg,
    headsCount,
    pricePerHead,
    geneticBasePrice,
    geneticPremium,
  ]);

  // Deductions Calculation
  const parsedFreight = parseFloat(freightCost) || 0;
  const parsedAuctionPct = parseFloat(auctionCommissionPct) || 0;
  const auctionCommissionVal = Math.round((grossSaleIncome * parsedAuctionPct) / 100);
  const parsedWeighing = parseFloat(weighingCost) || 0;
  const parsedWithholdingPct = parseFloat(withholdingTaxPct) || 0;
  const withholdingTaxVal = Math.round((grossSaleIncome * parsedWithholdingPct) / 100);
  const parsedFundPct = parseFloat(livestockFundPct) || 0;
  const livestockFundVal = Math.round((grossSaleIncome * parsedFundPct) / 100);
  const parsedOtherDeductions = parseFloat(otherDeductions) || 0;

  const totalDeductions =
    parsedFreight +
    auctionCommissionVal +
    parsedWeighing +
    withholdingTaxVal +
    livestockFundVal +
    parsedOtherDeductions;

  const netSaleIncome = Math.max(0, grossSaleIncome - totalDeductions);

  // Economic History from Animals
  const totalInitialCost = useMemo(() => {
    return dispatchAnimals.reduce((acc, a) => acc + (a.initialCost || 2500000), 0);
  }, [dispatchAnimals]);

  const totalAccumulatedCosts = useMemo(() => {
    return dispatchAnimals.reduce((acc, a) => acc + (a.accumulatedCosts || 750000), 0);
  }, [dispatchAnimals]);

  const totalEntryWeightKg = useMemo(() => {
    return dispatchAnimals.reduce((acc, a) => acc + (a.entryWeightKg || 320), 0);
  }, [dispatchAnimals]);

  const totalWeightGainKg = Math.max(0, totalNetWeightKg - totalEntryWeightKg);
  const avgDEF = 240; // average days in farm
  const gdpKgDay = avgDEF > 0 && headsCount > 0 ? totalWeightGainKg / headsCount / avgDEF : 0;
  const gdpGramsDay = Math.round(gdpKgDay * 1000);

  const grossMargin = netSaleIncome - totalInitialCost;
  const realNetProfitability = grossMargin - totalAccumulatedCosts;
  const totalInvested = totalInitialCost + totalAccumulatedCosts;
  const roiPercent = totalInvested > 0 ? (realNetProfitability / totalInvested) * 100 : 0;
  const profitPerDay = avgDEF > 0 ? Math.round(realNetProfitability / avgDEF) : 0;
  const costPerKgProduced =
    totalWeightGainKg > 0 ? Math.round(totalAccumulatedCosts / totalWeightGainKg) : 0;

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // =========================================================================
  // SUBMIT & MANDATORY ANIMAL VALIDATION
  // =========================================================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Rule 1: Must have at least 1 individual animal
    if (headsCount <= 0) {
      setValidationError('Debe registrar e identificar individualmente al menos 1 animal (*).');
      return;
    }

    // Rule 2: Every single animal must have a valid non-empty Tag
    const animalWithoutTag = dispatchAnimals.find((a) => !a.tag || a.tag.trim() === '');
    if (animalWithoutTag) {
      setValidationError('Todos los animales a despachar deben contar con su identificación individual (Chapeta/DIN/EID) (*).');
      return;
    }

    // Rule 2.1: Restrict Sale Registration to Existing Animals in the Selected Farm
    const nonExistentAnimal = dispatchAnimals.find((da) => {
      const cleanDaTag = da.tag.toLowerCase().replace(/^[#\s]+/, '');
      return !masterHerdCatalog.some(
        (mc) =>
          mc.tag.toLowerCase() === da.tag.toLowerCase() ||
          mc.tag.toLowerCase().replace(/^[#\s]+/, '') === cleanDaTag ||
          mc.id === da.id
      );
    });
    if (nonExistentAnimal) {
      setValidationError(
        `❌ ERROR DE INVENTARIO: El animal con identificación "${nonExistentAnimal.tag}" NO existe en el inventario activo de "${targetFarm?.profile.name || 'este predio'}". No puede cargar ni despachar animales no registrados o con números erróneos.`
      );
      return;
    }

    // Rule 3: Every single animal must have a verified exit weight > 0
    const unweighed = dispatchAnimals.find((a) => !a.currentGrossWeightKg || a.currentGrossWeightKg <= 0 || isNaN(a.currentGrossWeightKg));
    if (unweighed) {
      setValidationError(`El animal con chapeta "${unweighed.tag}" tiene un peso de salida inválido o en 0 kg. El pesaje individual (*) es requerido para formalizar la venta.`);
      return;
    }

    // Rule 4: Mandatory sanitary clearance
    if (!sanitaryClearanceVerified) {
      setValidationError('Debe certificar el cumplimiento de tiempos de retiro sanitario para formalizar la salida según normativa ICA.');
      return;
    }

    // Rule 5: Active withdrawal blocker
    if (withdrawalBlockedAnimals.length > 0) {
      const blockedTags = withdrawalBlockedAnimals.map((a) => a.tag).join(', ');
      if (!window.confirm(`ALERTA SANITARIA ICA: Los animales [${blockedTags}] tienen un periodo de retiro de medicamentos activo. ¿Confirma bajo estricta responsabilidad zootécnica el despacho?`)) {
        return;
      }
    }

    // Build Individual Sold Animal Records
    const soldAnimalItems: SoldAnimalItem[] = dispatchAnimals.map((a, idx) => {
      const indNetWeight = a.currentGrossWeightKg * (1 - parsedShrinkagePct / 100);
      const indGain = Math.max(0, indNetWeight - a.entryWeightKg);
      const indDays = 240;
      const indGdp = indDays > 0 ? indGain / indDays : 0;

      const indGrossInc =
        headsCount > 0
          ? settlementMode === 'kilo_en_pie'
            ? Math.round(indNetWeight * (parseFloat(pricePerKg) || 0))
            : Math.round(grossSaleIncome / headsCount)
          : 0;

      const indDeduc = headsCount > 0 ? Math.round(totalDeductions / headsCount) : 0;
      const indNetInc = indGrossInc - indDeduc;
      const indGrossMargin = indNetInc - a.initialCost;
      const indNetProfit = indGrossMargin - a.accumulatedCosts;
      const indRoi =
        a.initialCost + a.accumulatedCosts > 0
          ? (indNetProfit / (a.initialCost + a.accumulatedCosts)) * 100
          : 0;

      return {
        id: a.id || `sold-${Date.now()}-${idx}`,
        tag: a.tag,
        name: a.name || `Animal ${a.tag}`,
        breed: a.breed,
        sex: a.sex,
        category: a.category,
        lotId: a.originLotId || undefined,
        lotName: a.originLotName || 'Lote de Procedencia',
        paddockId: a.paddockId || undefined,
        paddockName: a.paddockName || undefined,
        entryDate: a.entryDate,
        entryWeightKg: a.entryWeightKg,
        grossExitWeightKg: a.currentGrossWeightKg,
        shrinkagePercent: parsedShrinkagePct,
        netExitWeightKg: indNetWeight,
        bodyConditionScore: a.bodyConditionScore || bodyConditionScore,
        carcassYieldPercent: parsedCarcassYield,
        hotCarcassWeightKg: (indNetWeight * parsedCarcassYield) / 100,
        daysInFarm: indDays,
        totalWeightGainKg: indGain,
        gdpKgDay: indGdp,
        initialCost: a.initialCost,
        accumulatedCosts: a.accumulatedCosts,
        individualGrossIncome: indGrossInc,
        individualDeductions: indDeduc,
        individualNetIncome: indNetInc,
        grossMargin: indGrossMargin,
        netProfit: indNetProfit,
        roiPercent: indRoi,
        saleReason,
      };
    });

    const primaryLotId = dispatchAnimals[0]?.originLotId;
    const primaryLot = lots.find((l) => l.id === primaryLotId);

    const newSaleRecord: LivestockSaleRecord = {
      id: `sale-${Date.now()}`,
      saleCode: `VTA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      saleDate,
      farmId: selectedFarmId,
      farmName: targetFarm?.profile?.name || 'Hacienda La Gloria',
      lotId: primaryLotId,
      lotName: primaryLot?.lotName || (headsCount === 1 ? `Animal ${dispatchAnimals[0].tag}` : 'Despacho Multilote Verificado'),
      paddockId: primaryLot?.paddockId,
      paddockName: targetPaddocks.find((p) => p.id === primaryLot?.paddockId)?.name,
      saleReason,
      saleReasonLabel: SALE_REASON_LABELS[saleReason].label,
      settlementMode,
      settlementModeLabel: SETTLEMENT_MODE_LABELS[settlementMode].label,
      destinationType,
      buyerName,
      buyerDoc,
      buyerPhone,
      destinationLocation,
      icaGuideNumber,
      invoiceNumber,
      headsCount,
      animals: soldAnimalItems,
      zootecnicMetrics: {
        grossWeightKg: totalGrossWeightKg,
        shrinkagePercent: parsedShrinkagePct,
        shrinkageKg: totalShrinkageKg,
        netWeightKg: totalNetWeightKg,
        bodyConditionScore,
        carcassYieldPercent: parsedCarcassYield,
        hotCarcassWeightKg,
        avgAgeMonths: 28,
      },
      deductions: {
        freightCost: parsedFreight,
        auctionCommission: auctionCommissionVal,
        auctionCommissionPct: parsedAuctionPct,
        weighingCost: parsedWeighing,
        withholdingTax: withholdingTaxVal,
        withholdingTaxPct: parsedWithholdingPct,
        livestockFundFee: livestockFundVal,
        livestockFundPct: parsedFundPct,
        otherDeductions: parsedOtherDeductions,
        totalDeductions,
      },
      economicMetrics: {
        daysInFarm: avgDEF,
        entryDate: new Date(Date.now() - avgDEF * 86400000).toISOString().split('T')[0],
        entryWeightKg: totalEntryWeightKg,
        totalWeightGainKg,
        dailyWeightGainKg: gdpKgDay,
        dailyWeightGainGrams: gdpGramsDay,
        grossSaleIncome,
        totalDeductions,
        netSaleIncome,
        initialCost: totalInitialCost,
        accumulatedSanitaryCost: Math.round(totalAccumulatedCosts * 0.15),
        accumulatedFeedingCost: Math.round(totalAccumulatedCosts * 0.6),
        accumulatedLaborCost: Math.round(totalAccumulatedCosts * 0.25),
        totalAccumulatedCosts,
        grossMargin,
        realNetProfitability,
        roiPercent,
        profitPerDay,
        costPerKgProduced,
      },
      pricePerKg: settlementMode === 'kilo_en_pie' ? parseFloat(pricePerKg) : undefined,
      pricePerCarcassKg: settlementMode === 'kilo_en_canal' ? parseFloat(pricePerCarcassKg) : undefined,
      pricePerHead: settlementMode === 'por_cabeza' ? parseFloat(pricePerHead) : undefined,
      geneticBasePrice: settlementMode === 'valor_genetico' ? parseFloat(geneticBasePrice) : undefined,
      geneticPremium: settlementMode === 'valor_genetico' ? parseFloat(geneticPremium) : undefined,
      transporterName,
      transporterPhone,
      truckPlate,
      dispatcherName,
      operatorResponsible,
      sanitaryClearanceVerified,
      inventoryReleased: {
        heads: headsCount,
        biomassKg: totalGrossWeightKg,
        uggCount,
        paddockFreedId: primaryLot?.paddockId,
        paddockFreedName: targetPaddocks.find((p) => p.id === primaryLot?.paddockId)?.name,
        lotFreedId: primaryLotId,
        lotFreedName: primaryLot?.lotName,
        closedIndividualSheets: true,
        archivedInTraceability: true,
        herdBookUpdated: true,
      },
      status: 'completada',
      notes,
      createdTimestamp: new Date().toISOString(),
    };

    onSaveSale(newSaleRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0D1A13] rounded-3xl w-full max-w-6xl my-4 overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-emerald-300 flex items-center justify-center border border-emerald-700 shadow-inner">
              <CowIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Registro de Venta & Despacho Oficial
                </h2>
                <span className="text-[10px] uppercase font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Registro Animal por Animal *
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium">
                Cada animal a despachar debe estar individualmente identificado (Chapeta/DIN), pesado en báscula y verificado sanitariamente.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="bg-rose-950/30 border-b border-rose-200 p-3 px-6 flex items-center gap-3 text-rose-900 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="flex-1">{validationError}</span>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-white">
          {/* Top Configuration: Origin, Date, Reasons & Settlement */}
          <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-[#A5B8AC] block mb-1">
                  Predio de Origen:
                </label>
                <div className="flex items-center gap-1.5 bg-[#0D1A13] border border-white/15 rounded-xl px-2.5 py-2">
                  <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <select
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-hidden"
                  >
                    {farms.map((f) => (
                      <option key={f.profile.id} value={f.profile.id}>
                        {f.profile.name} ({f.profile.municipality})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#A5B8AC] block mb-1">
                  Fecha de Despacho:
                </label>
                <div className="flex items-center gap-1.5 bg-[#0D1A13] border border-white/15 rounded-xl px-2.5 py-2">
                  <Calendar className="w-4 h-4 text-[#A5B8AC] shrink-0" />
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#A5B8AC] block mb-1">
                  Motivo de Salida:
                </label>
                <select
                  value={saleReason}
                  onChange={(e) => setSaleReason(e.target.value as SaleReasonType)}
                  className="w-full bg-[#0D1A13] border border-white/15 text-white text-xs font-bold rounded-xl p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {Object.entries(SALE_REASON_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#A5B8AC] block mb-1">
                  Modalidad de Liquidación:
                </label>
                <select
                  value={settlementMode}
                  onChange={(e) => setSettlementMode(e.target.value as SaleSettlementMode)}
                  className="w-full bg-[#0D1A13] border border-white/15 text-white text-xs font-bold rounded-xl p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {Object.entries(SETTLEMENT_MODE_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label} ({val.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Row */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-white">
                  Precio Base de Liquidación ({SETTLEMENT_MODE_LABELS[settlementMode].formula}):
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {settlementMode === 'kilo_en_pie' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#A5B8AC]">$/kg en pie:</span>
                    <input
                      type="number"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                      className="w-32 bg-[#15241C] border border-white/15 text-xs font-black text-emerald-950 rounded-lg p-1.5 font-mono text-right"
                    />
                    <span className="text-xs font-bold text-[#A5B8AC]">COP</span>
                  </div>
                )}

                {settlementMode === 'kilo_en_canal' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#A5B8AC]">$/kg canal:</span>
                    <input
                      type="number"
                      value={pricePerCarcassKg}
                      onChange={(e) => setPricePerCarcassKg(e.target.value)}
                      className="w-32 bg-[#15241C] border border-white/15 text-xs font-black text-emerald-950 rounded-lg p-1.5 font-mono text-right"
                    />
                    <span className="text-xs font-bold text-[#A5B8AC]">COP</span>
                  </div>
                )}

                {settlementMode === 'por_cabeza' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#A5B8AC]">$/cabeza:</span>
                    <input
                      type="number"
                      value={pricePerHead}
                      onChange={(e) => setPricePerHead(e.target.value)}
                      className="w-36 bg-[#15241C] border border-white/15 text-xs font-black text-emerald-950 rounded-lg p-1.5 font-mono text-right"
                    />
                    <span className="text-xs font-bold text-[#A5B8AC]">COP</span>
                  </div>
                )}

                {settlementMode === 'valor_genetico' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#A5B8AC]">Base:</span>
                    <input
                      type="number"
                      value={geneticBasePrice}
                      onChange={(e) => setGeneticBasePrice(e.target.value)}
                      className="w-28 bg-[#15241C] border border-white/15 text-xs font-bold rounded-lg p-1.5 font-mono text-right"
                    />
                    <span className="text-xs font-bold text-[#A5B8AC]">+ Prima:</span>
                    <input
                      type="number"
                      value={geneticPremium}
                      onChange={(e) => setGeneticPremium(e.target.value)}
                      className="w-28 bg-[#15241C] border border-white/15 text-xs font-bold rounded-lg p-1.5 font-mono text-right"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#A5B8AC] font-bold">% Desbaste:</span>
                  <input
                    type="number"
                    step="0.5"
                    value={shrinkagePercent}
                    onChange={(e) => setShrinkagePercent(e.target.value)}
                    className="w-16 bg-[#15241C] border border-white/15 text-xs font-bold rounded-lg p-1.5 font-mono text-center"
                  />
                  <span className="text-[#A5B8AC]">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION: ROSTER BUILDER - ANIMAL POR ANIMAL */}
          {/* ================================================================= */}
          <div className="bg-[#15241C] p-4 sm:p-5 rounded-2xl border-2 border-emerald-700/30 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">
                    Manifiesto de Despacho Animal por Animal *
                  </h3>
                </div>
                <p className="text-xs text-[#A5B8AC]">
                  Agregue, escanee o cargue los animales uno por uno. Cada animal requiere chapeta y pesaje individual verificado (*).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {liveScaleWeight && liveScaleWeight > 0 ? (
                  <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl text-xs font-mono font-bold">
                    <Scale className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Báscula en Vivo: <strong>{liveScaleWeight.toFixed(1)} kg</strong></span>
                  </div>
                ) : onOpenScaleModal ? (
                  <button
                    type="button"
                    onClick={onOpenScaleModal}
                    className="text-xs font-bold text-white bg-[#1F3327] hover:bg-[#202E25] border border-white/15 px-3 py-1 rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Conectar Báscula Digital</span>
                  </button>
                ) : null}

                {dispatchAnimals.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllAnimals}
                    className="text-xs font-bold text-rose-700 bg-rose-950/30 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar Lista</span>
                  </button>
                )}
              </div>
            </div>

            {/* TOOLBAR 1: QUICK INDIVIDUAL ANIMAL SCAN / INPUT BAR */}
            <div className="bg-[#0D1A13] p-3 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[11px] font-black uppercase text-[#A5B8AC] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                {isLotsEnabled ? 'Opción A: Escanear / Ingresar Chapeta Individual (Manga de Despacho)' : 'Escanear / Ingresar Chapeta Individual del Predio (Manga de Despacho) *'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 relative">
                {/* Tag Search Input */}
                <div className="sm:col-span-6 relative">
                  <Tag className="w-3.5 h-3.5 text-[#A5B8AC] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Digitar o escanear Chapeta / DIN (ej. GLO-301, VACA-104)..."
                    value={quickTagInput}
                    onChange={(e) => {
                      setQuickTagInput(e.target.value);
                      setShowHerdSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleQuickAddByInput();
                      }
                    }}
                    onFocus={() => setShowHerdSuggestions(true)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-[#15241C] border border-white/15 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />

                  {/* Herd Suggestions Dropdown */}
                  {showHerdSuggestions && filteredHerdSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#15241C] border border-white/15 rounded-xl shadow-xl z-30 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                      <div className="p-1.5 bg-[#1F3327] text-[10px] font-bold text-[#A5B8AC] uppercase px-2">
                        Coincidencias en el Hato ({filteredHerdSuggestions.length}):
                      </div>
                      {filteredHerdSuggestions.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => handleAddAnimalDirectly(sug)}
                          className="w-full text-left p-2 hover:bg-emerald-950/30 transition-colors flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-emerald-950">{sug.tag}</span>
                            <span className="text-[#A5B8AC] text-[11px]">{sug.breed} • {sug.category}</span>
                            {isLotsEnabled && sug.originLotName && (
                              <span className="text-[10px] text-[#A5B8AC]">({sug.originLotName})</span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-white bg-[#1F3327] px-2 py-0.5 rounded">
                            {sug.currentGrossWeightKg} kg
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weight Input */}
                <div className="sm:col-span-3">
                  <div className="flex items-center gap-1 bg-[#15241C] border border-white/15 rounded-xl px-2 py-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#A5B8AC] shrink-0" />
                    <input
                      type="number"
                      placeholder={liveScaleWeight ? `${Math.round(liveScaleWeight)}` : 'Peso kg'}
                      value={quickWeightInput}
                      onChange={(e) => setQuickWeightInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQuickAddByInput();
                        }
                      }}
                      className="w-full text-xs font-mono font-bold bg-transparent text-right focus:outline-hidden"
                    />
                    <span className="text-[10px] font-bold text-[#A5B8AC]">kg</span>
                  </div>
                </div>

                {/* Add Button */}
                <div className="sm:col-span-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleQuickAddByInput}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar a Venta</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TOOLBAR 2: BATCH LOAD FROM LOT (Visible only in Modo Lotes) */}
            {isLotsEnabled && (
              <div className="bg-[#0D1A13] p-3 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Users className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="text-[11px] font-black uppercase text-white">
                    Opción B: Cargar Animales desde un Lote:
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                  <select
                    value={selectedLotToLoad}
                    onChange={(e) => setSelectedLotToLoad(e.target.value)}
                    className="bg-[#15241C] border border-white/15 text-xs font-bold rounded-xl px-2.5 py-1.5 text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {lots.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.lotName} ({l.heads} Cab. • {l.currentAvgWeight} kg prom.)
                      </option>
                    ))}
                  </select>

                  <select
                    value={lotSelectionFilter}
                    onChange={(e) => setLotSelectionFilter(e.target.value as any)}
                    className="bg-[#15241C] border border-white/15 text-xs font-bold rounded-xl px-2 py-1.5 text-white"
                  >
                    <option value="all">Todas las Cabezas</option>
                    <option value="heavy_480">Pesados (&ge; 480 kg)</option>
                    <option value="heavy_500">Gordos Top (&ge; 500 kg)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleLoadLotAnimals}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-xs cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Incorporar al Despacho</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUMMARY BAR OF THE INDIVIDUAL ROSTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-slate-900 text-white rounded-xl text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  {headsCount} Animales en Lista de Venta
                </span>
                <span className="text-[#A5B8AC]">|</span>
                <span className="font-mono text-emerald-300">
                  Biomasa Bruta: <strong>{totalGrossWeightKg.toLocaleString('es-CO')} kg</strong>
                </span>
                <span className="text-[#A5B8AC]">|</span>
                <span className="font-mono text-[#A5B8AC]">
                  Promedio: <strong>{avgGrossWeightKg.toFixed(1)} kg/cab</strong>
                </span>
                <span className="text-[#A5B8AC]">|</span>
                <span className="font-mono text-sky-300">
                  Carga: <strong>{uggCount} UGG</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {unweighedCount > 0 ? (
                  <span className="text-[11px] font-bold text-rose-300 bg-rose-900/80 px-2.5 py-0.5 rounded-full border border-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    {unweighedCount} sin pesaje válido
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    100% Pesaje Verificado
                  </span>
                )}
              </div>
            </div>

            {/* MANDATORY ANIMAL-BY-ANIMAL TABLE */}
            <div className="max-h-72 overflow-y-auto border border-white/10 rounded-xl bg-[#15241C] shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#1F3327] text-white font-black uppercase text-[10px] sticky top-0 border-b border-white/10 z-10">
                  <tr>
                    <th className="p-2.5 text-center w-10">#</th>
                    <th className="p-2.5">Chapeta / DIN / EID</th>
                    <th className="p-2.5">Raza & Sexo</th>
                    <th className="p-2.5">Procedencia</th>
                    <th className="p-2.5 text-right">Peso Entrada</th>
                    <th className="p-2.5 text-right w-36">Peso Salida Báscula *</th>
                    <th className="p-2.5 text-center">Báscula</th>
                    <th className="p-2.5 text-right">Ganancia (GDP)</th>
                    <th className="p-2.5 text-center">Retiro Sanitario</th>
                    <th className="p-2.5 text-right">Ingreso Liq. Est.</th>
                    <th className="p-2.5 text-center w-12">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispatchAnimals.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-[#A5B8AC] space-y-2">
                        <CowIcon className="w-8 h-8 mx-auto text-[#A5B8AC]" />
                        <p className="text-xs font-bold text-[#A5B8AC]">
                          No hay animales agregados al despacho aún.
                        </p>
                        <p className="text-[11px] text-[#A5B8AC]">
                          Utilice la barra superior para escanear chapetas o cargue animales de un lote para formalizar la venta.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    dispatchAnimals.map((animal, idx) => {
                      const netWeight = animal.currentGrossWeightKg * (1 - parsedShrinkagePct / 100);
                      const gainKg = Math.max(0, netWeight - animal.entryWeightKg);
                      const indGdp = Math.round((gainKg / 240) * 1000);
                      const indEstIncome =
                        settlementMode === 'kilo_en_pie'
                          ? Math.round(netWeight * (parseFloat(pricePerKg) || 0))
                          : headsCount > 0
                          ? Math.round(grossSaleIncome / headsCount)
                          : 0;

                      const isWeightValid = animal.currentGrossWeightKg > 0;

                      return (
                        <tr
                          key={animal.id || idx}
                          className={`hover:bg-[#0D1A13] transition-colors ${
                            !isWeightValid ? 'bg-rose-50/50' : ''
                          }`}
                        >
                          <td className="p-2.5 text-center text-[#A5B8AC] font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              <span className="font-mono font-black text-white text-xs">
                                {animal.tag}
                              </span>
                            </div>
                          </td>
                          <td className="p-2.5 text-[#A5B8AC]">
                            <span className="font-medium">{animal.breed}</span> • <span className="capitalize">{animal.sex}</span>
                          </td>
                          <td className="p-2.5 text-[#A5B8AC] text-[11px]">
                            {animal.originLotName || 'Lote Origen'}
                          </td>
                          <td className="p-2.5 text-right font-mono text-[#A5B8AC]">
                            {animal.entryWeightKg} kg
                          </td>
                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                required
                                min="1"
                                value={typeof animal.currentGrossWeightKg === 'number' && !isNaN(animal.currentGrossWeightKg) ? animal.currentGrossWeightKg : ''}
                                onChange={(e) =>
                                  handleUpdateAnimalWeight(animal.id, parseFloat(e.target.value) || 0)
                                }
                                className={`w-24 py-1 px-1.5 text-xs font-mono font-black text-right border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden ${
                                  isWeightValid
                                    ? 'bg-[#15241C] border-white/15 text-white'
                                    : 'bg-rose-100 border-rose-400 text-rose-900 ring-2 ring-rose-300'
                                }`}
                              />
                              <span className="text-[10px] font-bold text-[#A5B8AC]">kg</span>
                            </div>
                          </td>
                          <td className="p-2.5 text-center">
                            {liveScaleWeight && liveScaleWeight > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleCaptureLiveScaleToAnimal(animal.id)}
                                title="Tomar peso actual de báscula"
                                className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md border border-emerald-300 cursor-pointer flex items-center gap-1 mx-auto"
                              >
                                <Scale className="w-3 h-3 text-emerald-700" />
                                <span>{liveScaleWeight.toFixed(1)} kg</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#A5B8AC] font-mono">Manual</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono text-[11px] text-amber-800 font-bold">
                            +{gainKg.toFixed(1)} kg <span className="text-[#A5B8AC] font-normal">({indGdp}g/d)</span>
                          </td>
                          <td className="p-2.5 text-center">
                            {animal.healthWithdrawalActive ? (
                              <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Retiro ({animal.withdrawalDaysRemaining || 5}d)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Apto (0d)
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-white">
                            {formatCOP(indEstIncome)}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveAnimal(animal.id)}
                              className="text-[#A5B8AC] hover:text-rose-600 p-1 rounded-md hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Quitar animal de la venta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* ================================================================= */}
          {/* SECTION: DEDUCTIONS & COMMERCIAL EXPENSES */}
          {/* ================================================================= */}
          <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs space-y-3">
            <span className="text-xs font-black uppercase text-white flex items-center gap-2">
              <BadgePercent className="w-4 h-4 text-rose-700" />
              Costos de Comercialización, Fletes & Deducciones de Venta
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Flete Salida ($):</label>
                <input
                  type="number"
                  value={freightCost}
                  onChange={(e) => setFreightCost(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono text-xs font-semibold rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Comisión Subasta (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={auctionCommissionPct}
                  onChange={(e) => setAuctionCommissionPct(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono text-xs font-semibold rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Pesaje Báscula ($):</label>
                <input
                  type="number"
                  value={weighingCost}
                  onChange={(e) => setWeighingCost(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono text-xs font-semibold rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Retefuente (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={withholdingTaxPct}
                  onChange={(e) => setWithholdingTaxPct(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono text-xs font-semibold rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Fomento (FEDEGAN %):</label>
                <input
                  type="number"
                  step="0.05"
                  value={livestockFundPct}
                  onChange={(e) => setLivestockFundPct(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono text-xs font-semibold rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Otras Deducciones ($):</label>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono text-xs font-semibold rounded-lg p-2"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-200 flex items-center justify-between text-xs">
              <span className="font-bold text-rose-900">Total Deducciones Aplicadas a la Venta:</span>
              <span className="font-mono font-black text-rose-950">- {formatCOP(totalDeductions)}</span>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION: BUYER, ICA GUIDE & TRANSPORT */}
          {/* ================================================================= */}
          <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs space-y-4">
            <span className="text-xs font-black uppercase text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-700" />
              Datos del Comprador, Guía ICA (GSMI) & Despacho
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Nombre / Razón Social:</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-bold rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">NIT / Documento:</label>
                <input
                  type="text"
                  value={buyerDoc}
                  onChange={(e) => setBuyerDoc(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Teléfono Comprador:</label>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Guía Sanitaria ICA (GSMI):</label>
                <input
                  type="text"
                  value={icaGuideNumber}
                  onChange={(e) => setIcaGuideNumber(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono font-bold text-white rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Factura / Liquidación N°:</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Lugar Destino:</label>
                <input
                  type="text"
                  value={destinationLocation}
                  onChange={(e) => setDestinationLocation(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Empresa / Transportador:</label>
                <input
                  type="text"
                  value={transporterName}
                  onChange={(e) => setTransporterName(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Placa Camión:</label>
                <input
                  type="text"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 font-mono uppercase font-bold rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Despachador / Mayordomo:</label>
                <input
                  type="text"
                  value={dispatcherName}
                  onChange={(e) => setDispatcherName(e.target.value)}
                  className="w-full bg-[#0D1A13] border border-white/15 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            {/* Sanitary Clearance Checkbox */}
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-300 rounded-xl flex items-center gap-3">
              <input
                type="checkbox"
                id="sanitaryClearance"
                checked={sanitaryClearanceVerified}
                onChange={(e) => setSanitaryClearanceVerified(e.target.checked)}
                className="w-5 h-5 text-emerald-700 rounded-sm border-emerald-400 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="sanitaryClearance" className="text-xs font-bold text-emerald-950 cursor-pointer">
                Certifico que todos los animales a despachar cumplen con los Tiempos de Retiro de medicamentos veterinarios (0 días activos) y están libres de signos clínicos infectocontagiosos según normativa ICA.
              </label>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION: REAL-TIME FINANCIAL CONSOLIDATION & PROFITABILITY */}
          {/* ================================================================= */}
          <div className="bg-emerald-950 text-white p-5 rounded-3xl border border-emerald-900 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-200">
                  Consolidado Económico & Cierre de Rentabilidad Real
                </h3>
              </div>

              <span className="text-xs font-mono font-bold bg-emerald-900 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-700">
                {headsCount} Cabezas • {totalNetWeightKg.toFixed(1)} kg Netos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800/80">
                <span className="text-[10px] font-sans font-bold uppercase text-emerald-300 block">
                  Ingreso Bruto Venta
                </span>
                <span className="text-base font-black text-white block mt-0.5">
                  {formatCOP(grossSaleIncome)}
                </span>
                <span className="text-[10px] text-emerald-400">
                  Prom: {headsCount > 0 ? formatCOP(grossSaleIncome / headsCount) : '$0'}
                </span>
              </div>

              <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800/80">
                <span className="text-[10px] font-sans font-bold uppercase text-rose-300 block">
                  Deducciones Totales
                </span>
                <span className="text-base font-black text-rose-300 block mt-0.5">
                  - {formatCOP(totalDeductions)}
                </span>
                <span className="text-[10px] text-emerald-400">Flete, Retefuente, Subasta</span>
              </div>

              <div className="bg-emerald-900/60 p-3.5 rounded-2xl border border-emerald-800/80">
                <span className="text-[10px] font-sans font-bold uppercase text-emerald-300 block">
                  Ingreso Neto Recibido
                </span>
                <span className="text-base font-black text-emerald-300 block mt-0.5">
                  {formatCOP(netSaleIncome)}
                </span>
                <span className="text-[10px] text-emerald-400">Entrada a Caja / Banco</span>
              </div>

              <div className="bg-amber-400/10 p-3.5 rounded-2xl border border-amber-400/30">
                <span className="text-[10px] font-sans font-bold uppercase text-amber-300 block">
                  Rentabilidad Neta Real
                </span>
                <span className="text-base font-black text-amber-300 block mt-0.5">
                  {formatCOP(realNetProfitability)}
                </span>
                <span className="text-[10px] text-amber-200 font-bold">
                  ROI: {roiPercent.toFixed(1)}% ({formatCOP(profitPerDay)}/día)
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div className="text-xs text-[#A5B8AC] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#A5B8AC] shrink-0" />
              <span>
                Esta acción dará de baja nominalmente <strong>{headsCount} cabezas</strong> del inventario, actualizará el Libro de Hato y liberará potreros.
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/15 text-white hover:bg-[#1F3327] font-bold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={headsCount <= 0 || unweighedCount > 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Venta y Dar de Baja ({headsCount} Cab.)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
