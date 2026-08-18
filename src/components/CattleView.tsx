import React, { useState, useMemo, useEffect } from 'react';
import {
  LotRecord,
  ScaleDevice,
  ScaleReading,
  FarmDataPackage,
  PaddockGeo,
  ImportedAnimalRecord,
  LivestockMovementInput,
  WeaningInfo,
  CategoryProgressionRule,
  CategoryTransitionAlert,
} from '../types';
import { RegisterNewAnimalModal } from './modals/RegisterNewAnimalModal';
import { RegisterLivestockMovementModal } from './modals/RegisterLivestockMovementModal';
import { WeaningProcessModal } from './modals/WeaningProcessModal';
import { CategoryTransitionApprovalModal } from './modals/CategoryTransitionApprovalModal';
import { NumberingPolicySettingsModal } from './modals/NumberingPolicySettingsModal';
import { MigrateInventoryModal, MigrationResult } from './modals/MigrateInventoryModal';
import { FarmNumberingPolicy } from '../types/numberingPolicy';
import { getSavedFarmNumberingPolicy } from '../utils/numberingPolicyEngine';
import {
  getSavedCategoryRules,
  saveCategoryRules,
  getSavedTransitionAlerts,
  saveTransitionAlerts,
  evaluateCategoryTransitions,
} from '../utils/categoryRuleEngine';
import {
  Scale,
  Flame,
  Filter,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Leaf,
  Waves,
  Beef,
  Baby,
  Droplet,
  Dna,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Bluetooth,
  Wifi,
  Zap,
  RefreshCw,
  Radio,
  ShoppingBag,
  PlusCircle,
  Building2,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  Table,
  Calculator,
  Tag,
  Database,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  BadgeCheck,
  DollarSign,
  Building,
  Heart,
  Award,
  ArrowRightLeft,
  Skull,
  Truck,
  FileText,
  UserCheck,
  Info,
} from 'lucide-react';
import {
  ProductionCategoryKey,
  CATEGORY_DEFINITIONS,
  getFarmCategories,
  farmHasCategory,
  filterFarmsByCategory,
  segmentPaddocksByFarms,
} from '../utils/farmCategoryUtils';
import {
  generateAnimalsForLot,
  getPricePerKgByCategory,
  calculateGrandTotalizedMetrics,
  GrandTotalizedMetrics,
} from '../utils/lotAnimalUtils';

interface CattleViewProps {
  lots: LotRecord[];
  farms?: FarmDataPackage[];
  currentFarm?: FarmDataPackage;
  selectedFarmId?: string;
  onSelectFarm?: (farmId: string) => void;
  onOpenWeightModal: (selectedLotId?: string) => void;
  onOpenReportModal: () => void;
  onOpenScaleModal?: () => void;
  onOpenNewLotModal?: () => void;
  activeScale?: ScaleDevice | null;
  reading?: ScaleReading;
  onSelectLotDetail?: (lot: LotRecord) => void;
  isDairyEnabled?: boolean;
  onToggleDairyModule?: () => void;
  isLotsEnabled?: boolean;
  onToggleLotsModule?: (enabled?: boolean) => void;
}

export const CattleView: React.FC<CattleViewProps> = ({
  lots,
  farms = [],
  currentFarm,
  selectedFarmId = 'all',
  onSelectFarm,
  onOpenWeightModal,
  onOpenReportModal,
  onOpenScaleModal,
  onOpenNewLotModal,
  activeScale,
  reading,
  isDairyEnabled = true,
  onToggleDairyModule,
  isLotsEnabled = false,
  onToggleLotsModule,
}) => {
  const [selectedSex, setSelectedSex] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductionCategoryKey>('all');
  const [activeFarmFilter, setActiveFarmFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLotDetail, setActiveLotDetail] = useState<LotRecord | null>(null);
  const [viewMode, setViewMode] = useState<'lots' | 'totalized' | 'paddocks'>('lots');

  // Inventarios de Ganado Modal States
  const [isNewAnimalModalOpen, setIsNewAnimalModalOpen] = useState<boolean>(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState<boolean>(false);
  const [isWeaningModalOpen, setIsWeaningModalOpen] = useState<boolean>(false);
  const [isCategoryApprovalModalOpen, setIsCategoryApprovalModalOpen] = useState<boolean>(false);
  const [isNumberingPolicyModalOpen, setIsNumberingPolicyModalOpen] = useState<boolean>(false);
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState<boolean>(false);
  const [farmNumberingPolicy, setFarmNumberingPolicy] = useState<FarmNumberingPolicy>(() =>
    getSavedFarmNumberingPolicy(currentFarm?.profile.id || 'all')
  );
  const [selectedAnimalForFicha, setSelectedAnimalForFicha] = useState<ImportedAnimalRecord | null>(null);
  const [inventoryBannerMessage, setInventoryBannerMessage] = useState<string | null>(null);
  const [customAnimals, setCustomAnimals] = useState<ImportedAnimalRecord[]>([]);
  const [customLots, setCustomLots] = useState<LotRecord[]>([]);

  // Category Progression Rule Engine States
  const [categoryRules, setCategoryRules] = useState<CategoryProgressionRule[]>(() => getSavedCategoryRules());
  const [transitionAlerts, setTransitionAlerts] = useState<CategoryTransitionAlert[]>(() => getSavedTransitionAlerts());

  const handleSaveWeaning = (
    animalId: string,
    weaningInfo: WeaningInfo,
    newCategory: string,
    targetLotId?: string,
  ) => {
    setCustomAnimals((prev) =>
      prev.map((a) => {
        if (a.id === animalId) {
          return {
            ...a,
            category: newCategory,
            lotId: targetLotId || a.lotId,
            weightKg: weaningInfo.weaningWeightKg,
            weaningInfo,
          };
        }
        return a;
      }),
    );

    setInventoryBannerMessage(
      `🔥 Destete Registrado: Peso ${weaningInfo.weaningWeightKg} kg, Marca '${weaningInfo.brandCode}' (${weaningInfo.brandType.replace('_', ' ')}) ${
        weaningInfo.asocebuRegisterNumber ? `| Registro Asocebú: ${weaningInfo.asocebuRegisterNumber}` : ''
      }.`,
    );

    setTimeout(() => {
      setInventoryBannerMessage(null);
    }, 7000);
  };

  const handleSaveNewAnimal = (
    animalData: Partial<ImportedAnimalRecord>,
    targetLotId: string,
    targetFarmId: string,
  ) => {
    const newAnimal = animalData as ImportedAnimalRecord;
    setCustomAnimals((prev) => [newAnimal, ...prev]);

    const farmName = farms.find((f) => f.profile.id === targetFarmId)?.profile.name || 'Predio Principal';
    setInventoryBannerMessage(
      `✅ Ingreso Registrado: Bovino Arete ${newAnimal.tag} (${newAnimal.origin || 'Nacido'}) ingresado con exito a ${farmName}.`,
    );

    setTimeout(() => {
      setInventoryBannerMessage(null);
    }, 6000);
  };

  const handleSaveMovement = (movement: LivestockMovementInput) => {
    let msg = '✅ Movimiento Registrado con Éxito';
    if (movement.movementType === 'transferencia_interna') {
      const targetFarmName = farms.find((f) => f.profile.id === movement.targetFarmId)?.profile.name || 'Predio Destino';
      msg = `🔄 Transferencia Interna Registrada: Ganado trasladado a ${targetFarmName} con fecha ${movement.date}.`;
    } else if (movement.movementType === 'salida_venta') {
      msg = `💰 Venta Externa Registrada: Salida comercial a ${movement.buyerOrDestination || 'Comprador'} por $${(movement.salePriceTotal || 0).toLocaleString()} COP.`;
    } else if (movement.movementType === 'salida_muerte') {
      msg = `⚠️ Baja de Inventario Registrada: Registro de pérdida / muerte con fecha ${movement.date}.`;
    } else if (movement.movementType === 'salida_sacrificio') {
      msg = `🥩 Sacrificio Registrado: Salida para autoconsumo / consumo interno.`;
    }

    setInventoryBannerMessage(msg);
    setTimeout(() => {
      setInventoryBannerMessage(null);
    }, 6000);
  };

  const handleCompleteMigration = (result: MigrationResult) => {
    setCustomAnimals((prev) => [...result.importedAnimals, ...prev]);
    setCustomLots((prev) => [...result.createdLots, ...prev]);

    setInventoryBannerMessage(
      `🎉 Migración Exitosa: Se importaron ${result.totalImported} bovinos y ${result.createdLots.length} lotes a ${result.targetFarmName}.`
    );

    setTimeout(() => {
      setInventoryBannerMessage(null);
    }, 8000);
  };

  // Lot Detail Modal Internal State
  const [modalTab, setModalTab] = useState<'animals' | 'weights'>('animals');
  const [animalSearchQuery, setAnimalSearchQuery] = useState<string>('');
  const [expandedFarms, setExpandedFarms] = useState<Record<string, boolean>>({});

  // Filter available farms according to selected category (Ceba, Cría, Lechería, Genética)
  const eligibleFarms = useMemo(() => {
    return filterFarmsByCategory(farms, selectedCategory);
  }, [farms, selectedCategory]);

  // Adjust farm filter if currently selected farm is not in the filtered category list
  const effectiveFarmFilter = useMemo(() => {
    if (activeFarmFilter === 'all') return 'all';
    const exists = eligibleFarms.some((f) => f.profile.id === activeFarmFilter);
    return exists ? activeFarmFilter : 'all';
  }, [activeFarmFilter, eligibleFarms]);

  // Aggregate all lots across eligible farms or specific farm
  const combinedLots = useMemo(() => {
    if (effectiveFarmFilter !== 'all') {
      const target = farms.find((f) => f.profile.id === effectiveFarmFilter);
      return (target?.lots || []).map((lot) => ({
        ...lot,
        farmName: target?.profile?.name || 'Predio Principal',
        farmId: target?.profile?.id,
      }));
    }

    // Collect lots from all eligible farms
    const allEligibleLots: (LotRecord & { farmName?: string; farmId?: string })[] = [];
    eligibleFarms.forEach((farm) => {
      (farm.lots || []).forEach((lot) => {
        allEligibleLots.push({
          ...lot,
          farmName: farm.profile.name,
          farmId: farm.profile.id,
        });
      });
    });

    // If no farms in list, fallback to lots prop
    if (allEligibleLots.length === 0) {
      const base = lots.map((l) => ({ ...l, farmName: currentFarm?.profile?.name || 'Predio Principal' }));
      return [...customLots, ...base];
    }

    return [...customLots, ...allEligibleLots];
  }, [farms, eligibleFarms, effectiveFarmFilter, lots, currentFarm, customLots]);

  // Aggregate all animals in active inventory across lots to evaluate rules
  const allInventoryAnimals = useMemo(() => {
    const generated: ImportedAnimalRecord[] = [];
    combinedLots.forEach((lot) => {
      const lotAnims = generateAnimalsForLot(lot, lot.farmName || 'Predio Principal');
      generated.push(...lotAnims);
    });

    const animMap = new Map<string, ImportedAnimalRecord>();
    generated.forEach((a) => animMap.set(a.id, a));
    customAnimals.forEach((a) => animMap.set(a.id, a));

    return Array.from(animMap.values());
  }, [combinedLots, customAnimals]);

  // Evaluate rules on all animals whenever inventory animals or rules change
  useEffect(() => {
    if (allInventoryAnimals.length > 0) {
      setTransitionAlerts((prevAlerts) => {
        const updatedAlerts = evaluateCategoryTransitions(allInventoryAnimals, categoryRules, prevAlerts);
        if (
          updatedAlerts.length === prevAlerts.length &&
          updatedAlerts.every(
            (a, idx) =>
              a.id === prevAlerts[idx]?.id &&
              a.status === prevAlerts[idx]?.status
          )
        ) {
          return prevAlerts;
        }
        return updatedAlerts;
      });
    }
  }, [allInventoryAnimals.length, categoryRules]);

  const handleApproveTransition = (
    alertId: string,
    animalId: string,
    newCategory: string,
    targetLotId?: string,
  ) => {
    setCustomAnimals((prev) => {
      const existing = prev.find((a) => a.id === animalId);
      if (existing) {
        return prev.map((a) =>
          a.id === animalId
            ? {
                ...a,
                category: newCategory,
                lotId: targetLotId || a.lotId,
                categoryHistory: [
                  ...(a.categoryHistory || []),
                  {
                    date: new Date().toISOString().split('T')[0],
                    previousCategory: a.category || 'desconocida',
                    newCategory,
                    reason: 'Aprobación de reclasificación automática por regla de peso/edad',
                    approvedBy: 'Administrador',
                  },
                ],
              }
            : a,
        );
      } else {
        const baseAnim = allInventoryAnimals.find((a) => a.id === animalId);
        if (baseAnim) {
          const updated: ImportedAnimalRecord = {
            ...baseAnim,
            category: newCategory,
            lotId: targetLotId || baseAnim.lotId,
            categoryHistory: [
              ...(baseAnim.categoryHistory || []),
              {
                date: new Date().toISOString().split('T')[0],
                previousCategory: baseAnim.category || 'desconocida',
                newCategory,
                reason: 'Aprobación de reclasificación automática por regla de peso/edad',
                approvedBy: 'Administrador',
              },
            ],
          };
          return [updated, ...prev];
        }
      }
      return prev;
    });

    setTransitionAlerts((prev) => {
      const updated = prev.map((a) => (a.id === alertId ? { ...a, status: 'approved' as const } : a));
      saveTransitionAlerts(updated);
      return updated;
    });
  };

  const handleRejectTransition = (alertId: string) => {
    setTransitionAlerts((prev) => {
      const updated = prev.map((a) => (a.id === alertId ? { ...a, status: 'rejected' as const } : a));
      saveTransitionAlerts(updated);
      return updated;
    });
  };

  const handleApproveAllPending = () => {
    const pending = transitionAlerts.filter((a) => a.status === 'pending');
    pending.forEach((a) => {
      handleApproveTransition(a.id, a.animalId, a.targetCategory, a.lotId);
    });
  };

  const handleSaveRules = (updatedRules: CategoryProgressionRule[]) => {
    setCategoryRules(updatedRules);
    saveCategoryRules(updatedRules);
  };

  const pendingCategoryAlerts = useMemo(() => {
    return transitionAlerts.filter((a) => a.status === 'pending');
  }, [transitionAlerts]);

  // Filter lots by category, sex, age, search query
  const filteredLots = useMemo(() => {
    return combinedLots.filter((lot) => {
      if (selectedCategory !== 'all') {
        const cat = (lot.category || '').toLowerCase();
        const lbl = (lot.categoryLabel || '').toLowerCase();
        if (selectedCategory === 'ceba' && !cat.includes('ceba') && !lbl.includes('ceba')) return false;
        if (selectedCategory === 'cria' && !cat.includes('cria') && !cat.includes('cría') && !lbl.includes('cría') && !lbl.includes('cria') && !lbl.includes('levante')) return false;
        if (selectedCategory === 'leche' && !cat.includes('leche') && cat !== 'doble_proposito' && !lbl.includes('leche') && !lbl.includes('ordeño')) return false;
        if (selectedCategory === 'genetica' && !cat.includes('genet') && !cat.includes('registr') && !lbl.includes('genét') && !lbl.includes('registr') && !lbl.includes('reproductor') && !lbl.includes('puro')) return false;
      }
      if (selectedSex === 'm' && !lot.sexLabel.toLowerCase().includes('macho') && !lot.sexLabel.toLowerCase().includes('toro') && !lot.sexLabel.toLowerCase().includes('novillo')) return false;
      if (selectedSex === 'f' && !lot.sexLabel.toLowerCase().includes('hembra') && !lot.sexLabel.toLowerCase().includes('vaca') && !lot.sexLabel.toLowerCase().includes('ternera')) return false;
      if (selectedAge === '1' && !lot.ageRange.includes('0-6')) return false;
      if (selectedAge === '2' && !lot.ageRange.includes('6-12') && !lot.ageRange.includes('8-14')) return false;
      if (selectedAge === '3' && !lot.ageRange.includes('18-24') && !lot.ageRange.includes('12-18') && !lot.ageRange.includes('20-26')) return false;
      if (selectedAge === '4' && !lot.ageRange.includes('24-30') && !lot.ageRange.includes('+24') && !lot.ageRange.includes('36-60') && !lot.ageRange.includes('30-48')) return false;
      if (
        searchQuery &&
        !lot.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !lot.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(lot.farmName || '').toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [combinedLots, selectedCategory, selectedSex, selectedAge, searchQuery]);

  // Segmented Paddocks per Farm
  const segmentedPaddocks = useMemo(() => {
    const targetFarms = effectiveFarmFilter === 'all'
      ? eligibleFarms
      : farms.filter((f) => f.profile.id === effectiveFarmFilter);
    return segmentPaddocksByFarms(targetFarms, selectedCategory);
  }, [eligibleFarms, farms, effectiveFarmFilter, selectedCategory]);

  // Grand Totalized Metrics Calculation
  const grandMetrics: GrandTotalizedMetrics = useMemo(() => {
    return calculateGrandTotalizedMetrics(filteredLots);
  }, [filteredLots]);

  // Calculate summary metrics for lots view
  const totalHeads = grandMetrics.totalHeads;
  const avgGdpGlobal = grandMetrics.avgGdpGlobal.toFixed(2);
  const nearestExit = filteredLots.reduce(
    (min, curr) => (curr.estDaysToExit < min ? curr.estDaysToExit : min),
    999,
  );
  const nearestLot = filteredLots.find((l) => l.estDaysToExit === nearestExit);

  // Individual Animals for Active Lot Modal
  const activeLotAnimals = useMemo(() => {
    if (!activeLotDetail) return [];
    return generateAnimalsForLot(activeLotDetail, activeLotDetail.farmName || 'Predio Principal');
  }, [activeLotDetail]);

  const filteredActiveLotAnimals = useMemo(() => {
    if (!animalSearchQuery) return activeLotAnimals;
    const q = animalSearchQuery.toLowerCase();
    return activeLotAnimals.filter(
      (a) =>
        a.tag.toLowerCase().includes(q) ||
        a.breed.toLowerCase().includes(q) ||
        (a.origin || '').toLowerCase().includes(q) ||
        a.sex.toLowerCase().includes(q)
    );
  }, [activeLotAnimals, animalSearchQuery]);

  const toggleFarmExpand = (farmName: string) => {
    setExpandedFarms((prev) => ({
      ...prev,
      [farmName]: prev[farmName] === undefined ? false : !prev[farmName],
    }));
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Inventory Feedback Banner */}
      {inventoryBannerMessage && (
        <div className="bg-[#1b4332] text-[#c1ecd4] px-4 py-3 rounded-2xl shadow-lg border border-[#c1ecd4]/30 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <Sparkles className="w-5 h-5 text-[#ffba38] shrink-0" />
            <span>{inventoryBannerMessage}</span>
          </div>
          <button
            onClick={() => setInventoryBannerMessage(null)}
            className="text-white/80 hover:text-white text-xs font-mono font-bold px-2 py-1 rounded bg-black/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Main Header & Operational Controls */}
      <div className="bg-[#012d1d] text-white rounded-3xl p-5 md:p-6 shadow-lg border border-[#1b4332] space-y-4">
        {/* Header Title, Metadata & Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#1b4332] text-[#c1ecd4] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded font-mono border border-[#2d6a4f]">
                Inventario Multi-Predio
              </span>
              <span className="text-xs text-[#a3b8ad] font-medium">
                {eligibleFarms.length} {eligibleFarms.length === 1 ? 'Predio activo' : 'Predios activos'}
              </span>
              <span className="text-[#2d6a4f] text-xs">•</span>
              <span className="text-xs text-[#c1ecd4] font-medium">
                Modo: {!isLotsEnabled ? 'Manejo por Predios' : 'Manejo por Lotes Activo'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight pt-0.5">
              Control de Inventario de Ganado
            </h1>
          </div>

          {/* Quick toggle mode button & Migration button */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIsMigrateModalOpen(true)}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95 flex items-center gap-2 border border-emerald-400/40"
            >
              <Database className="w-4 h-4 text-emerald-100" />
              <span>Migrar Inventario Existente</span>
            </button>

            {!isLotsEnabled ? (
              <button
                type="button"
                onClick={() => onToggleLotsModule?.(true)}
                className="px-4 py-2.5 bg-[#ffba38] hover:bg-[#ffdeac] text-[#012d1d] font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-[#012d1d]" />
                <span>Habilitar Manejo por Lotes</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleLotsModule?.(false)}
                className="px-4 py-2.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-[#c1ecd4] font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap border border-[#2d6a4f] flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-[#ffba38]" />
                <span>Volver a Manejo por Predios</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Progression Alert Banner */}
        {pendingCategoryAlerts.length > 0 && (
          <div className="bg-[#523700]/40 border border-[#ffba38]/70 p-3.5 px-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ffba38] text-[#523700] rounded-xl shrink-0 shadow-xs">
                <Zap className="w-4 h-4 text-[#523700]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-[#ffba38] uppercase tracking-wide">
                    Reclasificación por Peso o Edad
                  </span>
                  <span className="bg-rose-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {pendingCategoryAlerts.length} pendientes
                  </span>
                </div>
                <p className="text-[11px] text-[#ffdeac] mt-0.5 leading-normal">
                  {pendingCategoryAlerts.length === 1
                    ? `El ejemplar #${pendingCategoryAlerts[0].animalTag} cumplió el umbral para pase a ${pendingCategoryAlerts[0].targetCategoryLabel}.`
                    : `${pendingCategoryAlerts.length} bovinos alcanzaron el peso límite o edad para cambio de etapa productiva.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCategoryApprovalModalOpen(true)}
              className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#012d1d] font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-[#012d1d]" />
              <span>Revisar y Aprobar ({pendingCategoryAlerts.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid de Acciones Rápidas (Estilizada y sin textos cortados) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* 1. Ingreso Nuevo Individual / Lote */}
        <button
          onClick={() => setIsNewAnimalModalOpen(true)}
          className="bg-white hover:bg-slate-50 text-slate-900 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">Alta</span>
          </div>
          <div>
            <span className="block font-bold text-xs text-slate-900 leading-tight">
              Ingreso Nuevo
            </span>
            <span className="block text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
              Nacidos & Compras
            </span>
          </div>
        </button>

        {/* 2. Migrar Inventario Existente */}
        <button
          onClick={() => setIsMigrateModalOpen(true)}
          className="bg-emerald-50/60 hover:bg-emerald-100/70 text-slate-900 p-3.5 rounded-2xl border border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center border border-emerald-500 group-hover:scale-105 transition-transform shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-bold bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded uppercase font-mono">
              Excel/CSV
            </span>
          </div>
          <div>
            <span className="block font-bold text-xs text-slate-900 leading-tight">
              Migrar Inventario
            </span>
            <span className="block text-[10.5px] text-emerald-800 font-medium leading-tight mt-0.5">
              Planillas Previas
            </span>
          </div>
        </button>

        {/* 2. Módulo de Destete */}
        <button
          onClick={() => setIsWeaningModalOpen(true)}
          className="bg-white hover:bg-amber-50/50 text-slate-900 p-3.5 rounded-2xl border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded uppercase font-mono">
              Nuevo
            </span>
          </div>
          <div>
            <span className="block font-bold text-xs text-slate-900 leading-tight">
              Proceso Destete
            </span>
            <span className="block text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
              Hierro & Asocebú
            </span>
          </div>
        </button>

        {/* 3. Reclasificación Automática (Peso / Edad) */}
        <button
          onClick={() => setIsCategoryApprovalModalOpen(true)}
          className={`p-3.5 rounded-2xl border shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 text-left group cursor-pointer ${
            pendingCategoryAlerts.length > 0
              ? 'bg-amber-50/70 border-amber-300 text-slate-900 hover:bg-amber-50'
              : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${
              pendingCategoryAlerts.length > 0
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            {pendingCategoryAlerts.length > 0 && (
              <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded-full">
                {pendingCategoryAlerts.length}
              </span>
            )}
          </div>
          <div>
            <span className="block font-bold text-xs text-slate-900 leading-tight">
              Reclasificación
            </span>
            <span className="block text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
              Reglas Peso & Edad
            </span>
          </div>
        </button>

        {/* 4. Control de Pesaje */}
        <button
          onClick={() => onOpenWeightModal()}
          className="bg-white hover:bg-slate-50 text-slate-900 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded">GDP</span>
          </div>
          <div>
            <span className="block font-bold text-xs text-slate-900 leading-tight">
              Control Pesaje
            </span>
            <span className="block text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
              Registrar Pesos & GDP
            </span>
          </div>
        </button>

        {/* 5. Transferencias & Salidas */}
        <button
          onClick={() => setIsMovementModalOpen(true)}
          className="bg-white hover:bg-slate-50 text-slate-900 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded">Mov</span>
          </div>
          <div>
            <span className="block font-bold text-xs text-slate-900 leading-tight">
              Transferencias
            </span>
            <span className="block text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
              Traslados & Salidas
            </span>
          </div>
        </button>

        {/* 6. Políticas de Numeración e Identificación */}
        <button
          onClick={() => setIsNumberingPolicyModalOpen(true)}
          className={`p-3.5 rounded-2xl border shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 text-left group cursor-pointer ${
            farmNumberingPolicy.isLocked
              ? 'bg-amber-50/50 hover:bg-amber-50 border-amber-200/90 text-slate-900'
              : 'bg-white hover:bg-emerald-50/50 border-emerald-200/90 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${
              farmNumberingPolicy.isLocked
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}>
              <Tag className="w-4 h-4" />
            </div>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
              farmNumberingPolicy.isLocked
                ? 'bg-amber-200/80 text-amber-900'
                : 'bg-emerald-200/80 text-emerald-900'
            }`}>
              {farmNumberingPolicy.isLocked ? 'BLOQUEADO' : 'CONFIGURAR'}
            </span>
          </div>
          <div>
            <span className="block font-bold text-xs text-slate-900 leading-tight">
              Numeración Hato
            </span>
            <span className="block text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
              {farmNumberingPolicy.isLocked ? 'Política Inmutable' : '4 Esquemas & Adopción'}
            </span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CATEGORY SELECTOR TABS (Ceba, Cría, Lechería, Genética, Todos) */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-2xl border-2 border-[#c1c8c2] card-shadow space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#2d6a4f]" />
              Filtrar Inventario por Categoría Productiva:
            </span>
          </div>
          <span className="text-[11px] text-[#717973]">
            {CATEGORY_DEFINITIONS[selectedCategory].description}
          </span>
        </div>

        {/* Categories Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['all', 'ceba', 'cria', 'leche', 'genetica'] as ProductionCategoryKey[]).map((catKey) => {
            const def = CATEGORY_DEFINITIONS[catKey];
            const isSelected = selectedCategory === catKey;
            const matchingCount = filterFarmsByCategory(farms, catKey).length;

            return (
              <button
                key={catKey}
                onClick={() => {
                  setSelectedCategory(catKey);
                  setActiveFarmFilter('all');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? `${def.colorBg} ${def.colorText} border-[#012d1d] shadow-md ring-2 ring-[#012d1d]/20`
                    : 'bg-[#fbfbfb] hover:bg-[#f0f4f1] text-[#1a1c1c] border-[#c1c8c2]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                    {catKey === 'all' && <Layers className="w-4 h-4 text-[#ffba38]" />}
                    {catKey === 'ceba' && <Beef className="w-4 h-4 text-[#ffba38]" />}
                    {catKey === 'cria' && <Baby className="w-4 h-4 text-[#ffdbcf]" />}
                    {catKey === 'leche' && <Droplet className="w-4 h-4 text-[#caf0f8]" />}
                    {catKey === 'genetica' && <Award className="w-4 h-4 text-[#ffe082]" />}
                    <span>{def.shortLabel}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#ffba38]" />}
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-current/20 text-[10px]">
                  <span className="opacity-90">{matchingCount} {matchingCount === 1 ? 'predio' : 'predios'}</span>
                  <span className="font-bold uppercase tracking-wider">{catKey === 'all' ? 'Completo' : 'Activo'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 2. DYNAMIC PREDIOS / FINCAS SELECTOR & VIEW MODE TABS */}
        {/* ========================================================================= */}
        <div className="pt-3 border-t border-[#c1c8c2] space-y-3">
          {/* Row 1: View Mode Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#f0f4f1] p-1.5 rounded-2xl border border-[#c1c8c2]">
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#012d1d]">
                Modo de Visualización:
              </span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setViewMode('lots')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'lots'
                    ? 'bg-[#012d1d] text-white shadow-xs'
                    : 'text-[#414844] hover:bg-[#e2eae5] hover:text-[#012d1d]'
                }`}
              >
                {isLotsEnabled ? (
                  <>
                    <Beef className="w-3.5 h-3.5 text-[#ffba38]" />
                    <span>Lotes por Tarjeta ({filteredLots.length})</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-[#ffba38]" />
                    <span>Predios por Tarjeta ({grandMetrics.farmSummaries.length})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setViewMode('totalized')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'totalized'
                    ? 'bg-[#012d1d] text-[#ffba38] shadow-xs'
                    : 'text-[#414844] hover:bg-[#e2eae5] hover:text-[#012d1d]'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-[#ffba38]" />
                <span>{isLotsEnabled ? 'Ver Totalizado Consolidado' : 'Tabla Consolidada por Predio'}</span>
              </button>

              <button
                onClick={() => setViewMode('paddocks')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  viewMode === 'paddocks'
                    ? 'bg-[#012d1d] text-white shadow-xs'
                    : 'text-[#414844] hover:bg-[#e2eae5] hover:text-[#012d1d]'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-[#c1ecd4]" />
                <span>Potreros por Predio</span>
              </button>
            </div>
          </div>

          {/* Row 2: Filter by Farm */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-bold text-[#414844] flex items-center gap-1.5 pr-1 whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 text-[#012d1d]" />
              Predios con este inventario:
            </span>

            {/* All button */}
            <button
              onClick={() => setActiveFarmFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                effectiveFarmFilter === 'all'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'bg-[#f4fbf7] text-[#012d1d] hover:bg-[#c1ecd4]/50 border border-[#c1c8c2]'
              }`}
            >
              <span>Todos los Predios ({eligibleFarms.length})</span>
            </button>

            {/* Individual Predios */}
            {eligibleFarms.map((f) => {
              const isSelected = effectiveFarmFilter === f.profile.id;
              const heads = f.headsCount || f.profile.headsCount || 0;

              return (
                <button
                  key={f.profile.id}
                  onClick={() => {
                    setActiveFarmFilter(f.profile.id);
                    if (onSelectFarm) onSelectFarm(f.profile.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-xs'
                      : 'bg-white text-[#1a1c1c] border-[#c1c8c2] hover:border-[#012d1d] hover:bg-[#f8fbf9]'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-[#ffba38]' : 'text-[#717973]'}`} />
                  <span>{f.profile.name}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-[#eef2ef] text-[#2d6a4f]'}`}>
                    {heads} cab.
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Informative Banner when Registrados is selected */}
      {selectedCategory === 'genetica' && (
        <div className="bg-[#f3e5f5] text-[#4a148c] border-2 border-[#ce93d8] p-4 rounded-2xl shadow-sm flex items-start gap-3">
          <Award className="w-6 h-6 text-[#7b1fa2] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase text-[11px] bg-[#7b1fa2] text-white px-2 py-0.5 rounded">
                Módulo Informativo: Animales con Registro
              </span>
              <span className="text-[10px] font-mono font-bold text-[#6a1b9a] bg-white/80 px-2 py-0.5 rounded border border-[#ce93d8]">
                Pureza & Genealogía
              </span>
            </div>
            <p className="font-semibold text-[#4a148c]">
              Este catálogo consolida los ejemplares con registro genealógico oficial (Asocebú, ASOHOLSTEIN, Simmental, etc.).
            </p>
            <p className="text-[11px] text-[#6a1b9a] leading-relaxed">
              <strong>Nota Informativa:</strong> Este módulo es de consulta transversal. Un animal registrado puede estar simultáneamente en ordeño (Lechería), ceba o reproducción en su predio activo sin duplicar su conteo físico.
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar: Search, Sex, Age */}
      <section className="bg-[#f3f3f3] p-3.5 md:p-4 rounded-2xl border border-[#c1c8c2] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 text-[#414844] text-xs font-bold uppercase tracking-wider">
          <Search className="w-4 h-4 text-[#012d1d]" />
          <span>Búsqueda y Filtros de Campo:</span>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              placeholder="Buscar por lote, arete, predio o potrero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#c1c8c2] rounded-xl text-xs text-[#1a1c1c] focus:outline-none focus:border-[#012d1d]"
            />
          </div>

          {/* Sex Select */}
          <select
            value={selectedSex}
            onChange={(e) => setSelectedSex(e.target.value)}
            className="bg-white border border-[#c1c8c2] px-3 py-1.5 rounded-xl text-xs text-[#1a1c1c] focus:border-[#012d1d] focus:outline-none font-medium"
          >
            <option value="">Sexo (Todos)</option>
            <option value="m">Machos (Novillos / Toros / Torretes)</option>
            <option value="f">Hembras (Vaquillonas / Terneras / Donantes)</option>
          </select>

          {/* Age Select */}
          <select
            value={selectedAge}
            onChange={(e) => setSelectedAge(e.target.value)}
            className="bg-white border border-[#c1c8c2] px-3 py-1.5 rounded-xl text-xs text-[#1a1c1c] focus:border-[#012d1d] focus:outline-none font-medium"
          >
            <option value="">Edad (Todas)</option>
            <option value="1">0-6 Meses (Cría al pie)</option>
            <option value="2">6-12 Meses (Destete / Levante)</option>
            <option value="3">12-24 Meses (Levante / Ceba media)</option>
            <option value="4">+24 Meses (Ceba final / Adultos)</option>
          </select>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: TARJETAS DE PREDIOS O LOTES DE GANADO */}
      {/* ========================================================================= */}
      {viewMode === 'lots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!isLotsEnabled ? (
            /* PREDIO CARDS (When Lots Disabled) */
            grandMetrics.farmSummaries.map((farmSum) => {
              const allFarmAnimals = farmSum.lots.flatMap((l) => generateAnimalsForLot(l, farmSum.farmName));
              const firstLotId = farmSum.lots[0]?.id || '';

              return (
                <article
                  key={farmSum.farmName}
                  className="bg-white rounded-2xl border-2 border-[#012d1d]/30 shadow-sm overflow-hidden flex flex-col hover:border-[#012d1d] transition-all hover:shadow-md"
                >
                  {/* Header */}
                  <div className="px-4 py-3 bg-[#012d1d] text-white flex justify-between items-center border-b border-[#012d1d]">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#ffba38]" />
                      <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                        {farmSum.farmName}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest uppercase bg-[#c1ecd4] text-[#002114]">
                      PREDIO ACTIVO
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 md:p-5 flex flex-col gap-4 flex-grow justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-[#012d1d] leading-snug">
                        {farmSum.farmName}
                      </h3>
                      <p className="text-xs text-[#414844] mt-0.5 font-medium">
                        Consolidado General • {farmSum.totalHeads} Bovinos Registrados
                      </p>
                    </div>

                    {/* Key KPIs Box */}
                    <div className="bg-[#f4fbf7] p-3 rounded-xl border border-[#c1ecd4] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[#717973] uppercase font-bold block">Peso Promedio</span>
                        <span className="font-mono text-lg font-bold text-[#012d1d]">{farmSum.avgWeightPerHead} kg</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#717973] uppercase font-bold block">Peso Total</span>
                        <span className="font-mono text-lg font-bold text-[#012d1d]">{farmSum.totalWeightTon} Ton</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#717973] uppercase font-bold block">GDP Ponderada</span>
                        <span className="font-mono text-lg font-bold text-emerald-800">+{farmSum.avgGdpWeighted} kg/d</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#717973] uppercase font-bold block">Valor Comercial</span>
                        <span className="font-mono text-lg font-bold text-[#523700]">${(farmSum.totalEstimatedValueCop / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#eeeeee] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenWeightModal(firstLotId)}
                        className="flex-1 text-xs font-bold py-2 px-3 rounded-xl bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#012d1d] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5 text-[#2d6a4f]" />
                        Pesar Predio
                      </button>

                      <button
                        onClick={() => setActiveLotDetail({
                          id: `farm-combined-${farmSum.farmName}`,
                          code: 'PREDIO',
                          name: `Bovinos en ${farmSum.farmName}`,
                          category: 'ceba',
                          categoryLabel: 'CONSOLIDADO PREDIO',
                          heads: farmSum.totalHeads,
                          currentAvgWeight: farmSum.avgWeightPerHead,
                          gdpCurrent: farmSum.avgGdpWeighted,
                          pastureType: 'Pasturas Predio',
                          farmName: farmSum.farmName,
                          sexLabel: 'Macho / Hembra',
                          ageRange: 'Consolidado Predio',
                          targetWeight: 450,
                          estDaysToExit: 60,
                          estimatedValueCop: farmSum.totalEstimatedValueCop,
                          animals: allFarmAnimals,
                        })}
                        className="text-xs font-bold py-2 px-3 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#ffba38]" />
                        Ver Bovinos ({farmSum.totalHeads})
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            filteredLots.map((lot) => {
            const progressPercent = Math.min(
              100,
              Math.round((lot.currentAvgWeight / (lot.targetWeight || 450)) * 100),
            );

            const isCeba = lot.category === 'ceba';
            const isCria = lot.category === 'cria';
            const isLeche = lot.category === 'leche' || (lot.category as any) === 'doble_proposito';
            const isGenetica = lot.category === 'genetica';

            return (
              <article
                key={lot.id}
                className="bg-white rounded-2xl border-2 border-[#c1c8c2] shadow-sm overflow-hidden flex flex-col hover:border-[#012d1d] transition-all hover:shadow-md"
              >
                {/* Header with Code, Category Tag and PROMINENT Farm Badge */}
                <div
                  className={`px-4 py-2.5 flex justify-between items-center border-b border-[#c1c8c2] ${
                    isCeba
                      ? 'bg-[#1b4332]'
                      : isCria
                      ? 'bg-[#79564b]'
                      : isLeche
                      ? 'bg-[#0077b6]'
                      : 'bg-[#8d6200]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-white tracking-wider">
                      {lot.code}
                    </span>
                    <span className="text-[10px] bg-[#ffba38] text-[#523700] px-2 py-0.5 rounded font-extrabold flex items-center gap-1 shadow-xs truncate max-w-[160px]">
                      <Building2 className="w-3 h-3 text-[#523700] shrink-0" />
                      <span className="truncate">{lot.farmName || 'Predio Principal'}</span>
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shrink-0 ${
                      isCeba
                        ? 'bg-[#c1ecd4] text-[#002114]'
                        : isCria
                        ? 'bg-[#ffdbcf] text-[#2d150d]'
                        : isLeche
                        ? 'bg-[#caf0f8] text-[#03045e]'
                        : 'bg-[#fff3cd] text-[#533f03]'
                    }`}
                  >
                    {lot.categoryLabel || lot.category}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 md:p-5 flex flex-col gap-4 flex-grow justify-between">
                  {/* Title & Icon */}
                  <div className="flex justify-between items-start">
                    <div>
                      {/* Prominent Finca / Predio Tag inside card body for maximum clarity */}
                      <div className="mb-1">
                        <span className="text-[11px] font-bold text-[#2d6a4f] bg-[#f4fbf7] border border-[#c1ecd4] px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#012d1d]" />
                          Predio: <strong>{lot.farmName || 'Predio Principal'}</strong>
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-[#012d1d] leading-snug">{lot.name}</h3>
                      <p className="text-xs text-[#414844] mt-0.5 font-medium">
                        {lot.heads} {lot.sexLabel} • {lot.ageRange}
                      </p>
                      <p className="text-[11px] text-[#2d6a4f] font-semibold mt-1 flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        {lot.pastureType}
                      </p>
                    </div>
                    <div className="p-2 bg-[#f3f3f3] rounded-xl text-[#717973] shrink-0">
                      {isCeba && <Beef className="w-5 h-5 text-[#012d1d]" />}
                      {isCria && <Baby className="w-5 h-5 text-[#79564b]" />}
                      {isLeche && <Droplet className="w-5 h-5 text-[#0077b6]" />}
                      {isGenetica && <Dna className="w-5 h-5 text-[#b07d00]" />}
                    </div>
                  </div>

                  {/* GDP Box */}
                  <div className="bg-[#f3f3f3] p-3 rounded-xl flex flex-col gap-1 border border-[#c1c8c2]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#79564b]">
                        GDP PROMEDIO
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-[#c1ecd4] px-1.5 py-0.2 rounded font-semibold">
                        +{((lot.gdpCurrent - 0.7) * 100).toFixed(0)}% vs promedio hato
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-2xl md:text-3xl font-bold text-[#012d1d]">
                          {lot.gdpCurrent.toFixed(2)}
                        </span>
                        <span className="text-xs text-[#414844]">kg/día</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#717973] block uppercase font-bold">Peso Total Lote</span>
                        <span className="font-mono font-bold text-xs text-[#012d1d]">
                          {(lot.heads * lot.currentAvgWeight).toLocaleString()} kg
                        </span>
                      </div>
                    </div>

                    {/* Visual trend line */}
                    <div className="w-full bg-[#e2e2e2] h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          isCeba
                            ? 'bg-[#ffba38]'
                            : isCria
                            ? 'bg-[#79564b]'
                            : isLeche
                            ? 'bg-[#0077b6]'
                            : 'bg-[#dc9a00]'
                        }`}
                        style={{ width: `${Math.min(100, (lot.gdpCurrent / 1.3) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Weight Progress */}
                  <div className="pt-2 flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#414844]">
                        {isCeba ? 'Proyección Frigorífico' : isCria ? 'Proyección Destete' : isLeche ? 'Peso Corporal Ordeño' : 'Proyección Registro'}
                      </span>
                      <span className="text-[#012d1d] font-bold font-mono">
                        {lot.currentAvgWeight}kg / {lot.targetWeight}kg
                      </span>
                    </div>

                    <div className="w-full bg-[#e8e8e8] h-3.5 rounded-full overflow-hidden border border-[#c1c8c2] relative">
                      <div
                        className={`h-full relative rounded-full transition-all duration-500 ${
                          isCeba
                            ? 'bg-[#012d1d]'
                            : isCria
                            ? 'bg-[#79564b]'
                            : isLeche
                            ? 'bg-[#0077b6]'
                            : 'bg-[#dc9a00]'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute inset-0 stripe-pattern opacity-40" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-[#717973] mt-0.5 font-medium">
                      <span>{progressPercent}% meta lograda</span>
                      <span className="font-mono font-bold text-[#012d1d]">
                        Est. Salida: {lot.estDaysToExit} Días
                      </span>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-[#eeeeee] flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenWeightModal(lot.id)}
                      className="flex-1 text-xs font-bold py-2 px-3 rounded-xl bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#012d1d] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5 text-[#2d6a4f]" />
                      Pesar Lote
                    </button>

                    <button
                      onClick={() => setActiveLotDetail(lot)}
                      className="text-xs font-bold py-2 px-3 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#ffba38]" />
                      Ver Animales ({lot.heads})
                    </button>
                  </div>
                </div>
              </article>
            );
          })
          )}

          {/* Global Summary Card */}
          <article className="bg-[#eeeeee] rounded-2xl border-2 border-[#c1c8c2] shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[#012d1d]">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-bold text-lg">Resumen de Categoría</h3>
              </div>
              <p className="text-xs text-[#414844] mb-4">
                Consolidado de los {filteredLots.length} lotes activos en {eligibleFarms.length} predios filtrados.
              </p>

              <ul className="flex flex-col gap-2.5">
                <li className="flex justify-between items-center py-2 border-b border-[#c1c8c2]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#414844]">
                    TOTAL CABEZAS
                  </span>
                  <span className="font-mono text-xl text-[#012d1d] font-bold">{totalHeads}</span>
                </li>

                <li className="flex justify-between items-center py-2 border-b border-[#c1c8c2]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#414844]">
                    GDP PROMEDIO GLOBAL
                  </span>
                  <span className="font-mono text-xl text-[#012d1d] font-bold">
                    {avgGdpGlobal} kg/d
                  </span>
                </li>

                <li className="flex justify-between items-center py-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#414844]">
                    PRÓX. SALIDAS MERCADO
                  </span>
                  <span className="font-mono text-xl text-[#523700] font-bold">
                    {nearestLot?.heads || 45} ({nearestExit} d)
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-3 border-t border-[#c1c8c2] flex justify-end">
              <button
                onClick={onOpenReportModal}
                className="text-[#012d1d] font-bold text-xs hover:bg-[#e2e2e2] px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                VER REPORTE COMPLETO <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: VISTA TOTALIZADA CONSOLIDADA (TABLA TOTALIZADA Y MÉTRICAS) */}
      {/* ========================================================================= */}
      {viewMode === 'totalized' && (
        <div className="space-y-6">
          {/* Consolidated Top Metric Bar (6 KPIs) */}
          <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
              <div className="flex items-center justify-between text-slate-600 gap-1 min-w-0">
                <span className="text-[10px] font-bold uppercase truncate">
                  {isLotsEnabled ? 'Total Lotes' : 'Total Predios'}
                </span>
                {isLotsEnabled ? (
                  <Layers className="w-4 h-4 text-emerald-800 shrink-0" />
                ) : (
                  <Building2 className="w-4 h-4 text-emerald-800 shrink-0" />
                )}
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2 truncate tracking-tight">
                {isLotsEnabled ? grandMetrics.totalLots : grandMetrics.farmSummaries.length}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium truncate">
                {isLotsEnabled ? 'Lotes registrados' : 'Predios con inventario'}
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
              <div className="flex items-center justify-between text-slate-600 gap-1 min-w-0">
                <span className="text-[10px] font-bold uppercase truncate">Total Cabezas</span>
                <Beef className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2 truncate tracking-tight">{grandMetrics.totalHeads.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-700 font-medium mt-1 truncate">Bovinos en inventario</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
              <div className="flex items-center justify-between text-slate-600 gap-1 min-w-0">
                <span className="text-[10px] font-bold uppercase truncate">Peso Total</span>
                <Scale className="w-4 h-4 text-emerald-800 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2 truncate tracking-tight">{grandMetrics.totalWeightTon} Ton</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono font-medium truncate">{grandMetrics.totalWeightKg.toLocaleString()} kg</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
              <div className="flex items-center justify-between text-slate-600 gap-1 min-w-0">
                <span className="text-[10px] font-bold uppercase truncate">Peso Promedio</span>
                <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-2 truncate tracking-tight">{grandMetrics.avgWeightGlobal} kg</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium truncate">Promedio ponderado</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
              <div className="flex items-center justify-between text-slate-600 gap-1 min-w-0">
                <span className="text-[10px] font-bold uppercase truncate">GDP Ponderada</span>
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-800 mt-2 truncate tracking-tight">+{grandMetrics.avgGdpGlobal}</p>
              <p className="text-[10px] text-emerald-700 font-medium mt-1 truncate">kg / animal / día</p>
            </div>

            <div className="bg-[#043825] text-white rounded-2xl p-4 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
              <div className="flex items-center justify-between text-[#facc15] gap-1 min-w-0">
                <span className="text-[10px] font-bold uppercase truncate">Valor Est. Hato</span>
                <DollarSign className="w-4 h-4 text-[#facc15] shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-mono text-[#facc15] mt-2 truncate tracking-tight">
                ${(grandMetrics.totalEstimatedValueCop / 1000000).toFixed(1)}M
              </p>
              <p className="text-[10px] text-emerald-200 mt-1 font-mono font-medium truncate">COP Comercial</p>
            </div>
          </section>

          {/* Consolidated Totalized Table Grouped by Farm */}
          <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl card-shadow overflow-hidden">
            <div className="bg-[#012d1d] text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="bg-[#ffba38] text-[#523700] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono">
                  RESUMEN TOTALIZADO MULTI-PREDIO
                </span>
                <h2 className="text-xl font-bold mt-1 text-white">
                  {isLotsEnabled
                    ? 'Consolidado General de Lotes por Finca o Predio'
                    : 'Consolidado General de Inventario por Predio o Finca'}
                </h2>
                <p className="text-xs text-[#c1ecd4]">
                  Información totalizada con número de cabezas, peso total, GDP promedio y valorización comercial.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenReportModal}
                  className="bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#ffba38]" />
                  <span>Exportar Consolidado</span>
                </button>
              </div>
            </div>

            {/* Totalized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0f4f1] text-[#012d1d] font-bold uppercase tracking-wider text-[11px] border-b-2 border-[#c1c8c2]">
                    <th className="p-3">Predio / Finca</th>
                    {isLotsEnabled && <th className="p-3">Código y Lote</th>}
                    <th className="p-3">Categoría</th>
                    <th className="p-3 text-center">Cabezas</th>
                    <th className="p-3 text-right">Peso Prom. (kg)</th>
                    <th className="p-3 text-right">Peso Total (kg)</th>
                    <th className="p-3 text-right">GDP (kg/d)</th>
                    <th className="p-3">Pastura / Potrero</th>
                    <th className="p-3 text-right">Valor Est. ($ COP)</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {grandMetrics.farmSummaries.map((farmSum) => {
                    const isCollapsed = expandedFarms[farmSum.farmName] === false;
                    const allFarmAnimals = farmSum.lots.flatMap((l) => generateAnimalsForLot(l, farmSum.farmName));

                    return (
                      <React.Fragment key={farmSum.farmName}>
                        {/* Farm Header Row */}
                        <tr
                          onClick={() => isLotsEnabled && toggleFarmExpand(farmSum.farmName)}
                          className={`bg-[#eef5f1] hover:bg-[#e2efe8] font-bold text-[#012d1d] transition-colors border-t-2 border-[#c1c8c2] ${
                            isLotsEnabled ? 'cursor-pointer' : ''
                          }`}
                        >
                          <td colSpan={isLotsEnabled ? 3 : 2} className="p-3">
                            <div className="flex items-center gap-2">
                              {isLotsEnabled && (
                                isCollapsed ? (
                                  <ChevronRight className="w-4 h-4 text-[#012d1d]" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-[#012d1d]" />
                                )
                              )}
                              <Building2 className="w-4 h-4 text-[#2d6a4f]" />
                              <span className="text-sm font-black">{farmSum.farmName}</span>
                              <span className="text-[10px] bg-[#012d1d] text-[#ffba38] px-2 py-0.5 rounded font-mono">
                                {isLotsEnabled
                                  ? `${farmSum.totalLots} ${farmSum.totalLots === 1 ? 'Lote' : 'Lotes'}`
                                  : 'Predio Activo'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-sm bg-white/40">
                            {farmSum.totalHeads}
                          </td>
                          <td className="p-3 text-right font-mono font-bold bg-white/40">
                            {farmSum.avgWeightPerHead} kg
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-sm text-[#012d1d] bg-white/40">
                            {farmSum.totalWeightKg.toLocaleString()} kg ({farmSum.totalWeightTon} Ton)
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-800 bg-white/40">
                            +{farmSum.avgGdpWeighted}
                          </td>
                          <td className="p-3 text-xs text-[#717973] font-normal">
                            Promedio Ponderado
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#523700] bg-white/40">
                            ${(farmSum.totalEstimatedValueCop / 1000000).toFixed(2)}M
                          </td>
                          <td className="p-3 text-center">
                            {isLotsEnabled ? (
                              <span className="text-[10px] font-bold text-[#2d6a4f] underline">
                                {isCollapsed ? 'Expandir' : 'Contraer'}
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveLotDetail({
                                    id: `farm-combined-${farmSum.farmName}`,
                                    code: 'PREDIO',
                                    name: `Bovinos en ${farmSum.farmName}`,
                                    category: 'ceba',
                                    categoryLabel: 'CONSOLIDADO PREDIO',
                                    heads: farmSum.totalHeads,
                                    currentAvgWeight: farmSum.avgWeightPerHead,
                                    gdpCurrent: farmSum.avgGdpWeighted,
                                    pastureType: 'Pasturas Predio',
                                    farmName: farmSum.farmName,
                                    sexLabel: 'Macho / Hembra',
                                    ageRange: 'Consolidado Predio',
                                    targetWeight: 450,
                                    estDaysToExit: 60,
                                    estimatedValueCop: farmSum.totalEstimatedValueCop,
                                    animals: allFarmAnimals,
                                  });
                                }}
                                className="px-2.5 py-1 bg-[#012d1d] hover:bg-[#1b4332] text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                              >
                                <Eye className="w-3 h-3 text-[#ffba38]" />
                                <span>Ver Bovinos</span>
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Lot Detail Rows for this Farm (ONLY WHEN isLotsEnabled IS TRUE) */}
                        {isLotsEnabled &&
                          !isCollapsed &&
                          farmSum.lots.map((lot) => {
                            const pricePerKg = getPricePerKgByCategory(lot.category);
                            const lotWeightKg = (lot.heads || 0) * (lot.currentAvgWeight || 0);
                            const valCop = lot.estimatedValueCop || lotWeightKg * pricePerKg;

                            return (
                              <tr key={lot.id} className="hover:bg-[#f9fbf9] transition-colors">
                                <td className="p-3 pl-8">
                                  <span className="text-xs font-bold text-[#2d6a4f] flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#717973]" />
                                    {lot.farmName || farmSum.farmName}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-[#012d1d]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono bg-[#012d1d] text-white px-1.5 py-0.2 rounded text-[10px]">
                                      {lot.code}
                                    </span>
                                    <span>{lot.name}</span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="bg-[#f0f4f1] text-[#012d1d] font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                                    {lot.categoryLabel || lot.category}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-sm text-[#012d1d]">
                                  {lot.heads}
                                </td>
                                <td className="p-3 text-right font-mono font-semibold">
                                  {lot.currentAvgWeight} kg
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-[#012d1d]">
                                  {lotWeightKg.toLocaleString()} kg
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-emerald-700">
                                  +{lot.gdpCurrent.toFixed(2)}
                                </td>
                                <td className="p-3 text-xs text-[#414844] truncate max-w-[150px]">
                                  {lot.pastureType}
                                </td>
                                <td className="p-3 text-right font-mono font-semibold text-[#523700]">
                                  ${(valCop / 1000000).toFixed(2)}M
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => setActiveLotDetail(lot)}
                                    className="px-2.5 py-1 bg-[#012d1d] hover:bg-[#1b4332] text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                                  >
                                    <Eye className="w-3 h-3 text-[#ffba38]" />
                                    <span>Ver Animales</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                {/* Grand Total Footer Row */}
                <tfoot>
                  <tr className="bg-[#012d1d] text-white font-extrabold border-t-4 border-[#ffba38]">
                    <td colSpan={isLotsEnabled ? 3 : 2} className="p-4 text-sm uppercase tracking-wider">
                      GRAND TOTAL CONSOLIDADO MULTI-PREDIO
                    </td>
                    <td className="p-4 text-center font-mono text-base text-[#ffba38]">
                      {grandMetrics.totalHeads.toLocaleString()} cab.
                    </td>
                    <td className="p-4 text-right font-mono text-sm text-white">
                      {grandMetrics.avgWeightGlobal} kg prom.
                    </td>
                    <td className="p-4 text-right font-mono text-base text-white">
                      {grandMetrics.totalWeightKg.toLocaleString()} kg ({grandMetrics.totalWeightTon} Ton)
                    </td>
                    <td className="p-4 text-right font-mono text-sm text-[#c1ecd4]">
                      +{grandMetrics.avgGdpGlobal} kg/d
                    </td>
                    <td className="p-4 text-xs font-normal text-[#c1ecd4]">
                      {isLotsEnabled
                        ? `${grandMetrics.totalLots} Lotes Registrados`
                        : `${grandMetrics.farmSummaries.length} Predios Registrados`}
                    </td>
                    <td className="p-4 text-right font-mono text-base text-[#ffba38]">
                      ${(grandMetrics.totalEstimatedValueCop / 1000000).toFixed(2)}M COP
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-[10px] text-[#c1ecd4] font-mono">100% OK</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: POTREROS SEGMENTADOS POR FINCAS O PREDIOS */}
      {/* ========================================================================= */}
      {viewMode === 'paddocks' && (
        <div className="space-y-6">
          {segmentedPaddocks.map((seg) => {
            const farm = seg.farm;
            const paddocks = seg.paddocks;

            return (
              <div
                key={farm.profile.id}
                className="bg-white rounded-2xl border-2 border-[#c1c8c2] card-shadow overflow-hidden"
              >
                {/* Farm Segment Header */}
                <div className="bg-[#012d1d] text-white p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#ffba38] text-[#523700] text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                        PREDIO: {farm.profile.code || farm.profile.id.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#c1ecd4] font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {farm.profile.municipality}, {farm.profile.department}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                      {farm.profile.name}
                    </h2>
                    <p className="text-xs text-[#c1ecd4]/80 mt-0.5">
                      {farm.profile.notes || 'Predio ganadero registrado en el sistema SIG.'}
                    </p>
                  </div>

                  {/* Farm Summary Chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center border border-white/10">
                      <p className="text-[10px] text-[#c1ecd4] font-bold uppercase">Área Total</p>
                      <p className="font-mono font-bold text-sm text-white">{seg.totalAreaHa} Ha</p>
                    </div>

                    <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center border border-white/10">
                      <p className="text-[10px] text-[#c1ecd4] font-bold uppercase">Potreros</p>
                      <p className="font-mono font-bold text-sm text-[#ffba38]">{seg.totalPaddocks}</p>
                    </div>

                    <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center border border-white/10">
                      <p className="text-[10px] text-[#c1ecd4] font-bold uppercase">Ocupados</p>
                      <p className="font-mono font-bold text-sm text-[#ffdad6]">{seg.occupiedCount}</p>
                    </div>

                    <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center border border-white/10">
                      <p className="text-[10px] text-[#c1ecd4] font-bold uppercase">En Descanso</p>
                      <p className="font-mono font-bold text-sm text-[#c1ecd4]">{seg.restingCount}</p>
                    </div>
                  </div>
                </div>

                {/* Paddocks Grid for this Farm */}
                <div className="p-4 md:p-5">
                  {paddocks.length === 0 ? (
                    <div className="p-8 text-center bg-[#f9f9f9] rounded-xl border border-dashed border-[#c1c8c2]">
                      <Leaf className="w-8 h-8 text-[#717973] mx-auto mb-2 opacity-60" />
                      <p className="font-bold text-xs text-[#414844]">No hay potreros delimitados para este predio.</p>
                      <p className="text-[11px] text-[#717973] mt-0.5">Utiliza el módulo SIG para dibujar o importar potreros KML.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {paddocks.map((p) => {
                        const isOccupied = p.status === 'ocupado';
                        const isResting = p.status === 'descanso';
                        const isReady = p.status === 'listo';

                        return (
                          <div
                            key={p.id}
                            className="bg-[#fbfbfb] hover:bg-white p-4 rounded-xl border border-[#c1c8c2] hover:border-[#012d1d] transition-all card-shadow space-y-2.5 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono bg-[#012d1d] text-[#ffba38] text-xs font-bold px-2 py-0.5 rounded">
                                    {p.code}
                                  </span>
                                  <h4 className="font-bold text-sm text-[#012d1d] truncate">{p.name}</h4>
                                </div>

                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    isOccupied
                                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                      : isReady
                                      ? 'bg-[#c1ecd4] text-[#002114]'
                                      : 'bg-[#fff3cd] text-[#523700]'
                                  }`}
                                >
                                  {isOccupied ? '🔴 Ocupado' : isReady ? '🟢 Listo' : '🟡 Descanso'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#eeeeee]">
                                <span className="text-[#414844] font-medium flex items-center gap-1">
                                  <Leaf className="w-3.5 h-3.5 text-[#2d6a4f]" />
                                  {p.pastureType}
                                </span>
                                <span className="font-mono font-bold text-[#012d1d]">{p.areaHa} Ha</span>
                              </div>

                              {/* Occupancy or Rest details */}
                              <div className="mt-2 p-2.5 bg-white rounded-lg border border-[#e5e7eb] text-xs space-y-1">
                                {isOccupied ? (
                                  <>
                                    <div className="flex justify-between font-bold text-[#012d1d]">
                                      <span>🐄 {p.assignedLotName || 'Lote Activo'}</span>
                                      <span className="font-mono text-[#523700]">{p.currentHeads || 45} cab.</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-[#717973]">
                                      <span>Día {p.daysInOccupancy || 1} de pastoreo</span>
                                      <span>Aforo: {p.forageYieldKgM2 || 2.5} kg/m²</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-between font-semibold text-[#2d6a4f]">
                                      <span>🌱 En Reposo Vegetativo</span>
                                      <span className="font-mono">{p.daysInRest || 18} días descanso</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-[#717973]">
                                      <span>Objetivo: {p.restDaysTarget || 30} días</span>
                                      <span>Capacidad: {p.carryingCapacityUGG || (p.areaHa * 1.5).toFixed(1)} UGG</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1 text-[#717973]">
                              <span>Condición: <strong className="text-[#012d1d] capitalize">{p.pastureCondition}</strong></span>
                              <span className="font-mono text-[#2d6a4f] font-bold">Máx {p.maxHeadsRecommended || Math.round(p.areaHa * 2.5)} Cab.</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LOT DETAIL MODAL (CON PREDIO Y LISTADO INDIVIDUAL DE ANIMALES ENFRENTE) */}
      {/* ========================================================================= */}
      {activeLotDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4" onClick={(e) => { if (e.target === e.currentTarget) setActiveLotDetail(null); }}>
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 md:p-6 border-2 border-[#c1c8c2] shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
            {/* Modal Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#012d1d] gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-white bg-[#012d1d] font-bold px-2 py-0.5 rounded">
                      {activeLotDetail.code}
                    </span>
                    {/* PROMINENT FARM BADGE IN FRONT OF LOT INFORMATION */}
                    <span className="bg-[#ffba38] text-[#523700] text-xs font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Building2 className="w-3.5 h-3.5 text-[#523700]" />
                      <span>PREDIO / FINCA: {activeLotDetail.farmName || 'Predio Principal'}</span>
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-[#012d1d] mt-1">
                    {activeLotDetail.name}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveLotDetail(null)}
                  className="p-1.5 text-[#717973] hover:text-black hover:bg-[#f3f3f3] rounded-xl cursor-pointer self-end sm:self-auto"
                >
                  ✕
                </button>
              </div>

              {/* Lot Key KPI Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 text-xs">
                <div className="p-3 bg-[#f4fbf7] border border-[#c1ecd4] rounded-xl">
                  <p className="text-[#717973] font-semibold text-[10px] uppercase">Cabezas en Lote</p>
                  <p className="text-xl font-black font-mono text-[#012d1d]">
                    {activeLotDetail.heads} bovinos
                  </p>
                </div>

                <div className="p-3 bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl">
                  <p className="text-[#717973] font-semibold text-[10px] uppercase">Peso Prom. / Cabeza</p>
                  <p className="text-xl font-black font-mono text-[#012d1d]">
                    {activeLotDetail.currentAvgWeight} kg
                  </p>
                </div>

                <div className="p-3 bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl">
                  <p className="text-[#717973] font-semibold text-[10px] uppercase">Peso Total Lote</p>
                  <p className="text-xl font-black font-mono text-[#012d1d]">
                    {(activeLotDetail.heads * activeLotDetail.currentAvgWeight).toLocaleString()} kg
                  </p>
                </div>

                <div className="p-3 bg-[#012d1d] text-white rounded-xl">
                  <p className="text-[#ffba38] font-semibold text-[10px] uppercase">Valor Comercial Est.</p>
                  <p className="text-xl font-black font-mono text-[#ffba38]">
                    ${((activeLotDetail.heads * activeLotDetail.currentAvgWeight * getPricePerKgByCategory(activeLotDetail.category)) / 1000000).toFixed(2)}M
                  </p>
                </div>
              </div>

              {/* Modal Tabs: Animals List vs Weights History */}
              <div className="flex items-center gap-2 border-b border-[#c1c8c2] mb-4">
                <button
                  onClick={() => setModalTab('animals')}
                  className={`pb-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modalTab === 'animals'
                      ? 'border-b-2 border-[#012d1d] text-[#012d1d]'
                      : 'text-[#717973] hover:text-[#012d1d]'
                  }`}
                >
                  <Beef className="w-4 h-4 text-[#2d6a4f]" />
                  <span>Listado de Animales Individuales ({activeLotAnimals.length})</span>
                </button>

                <button
                  onClick={() => setModalTab('weights')}
                  className={`pb-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modalTab === 'weights'
                      ? 'border-b-2 border-[#012d1d] text-[#012d1d]'
                      : 'text-[#717973] hover:text-[#012d1d]'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#2d6a4f]" />
                  <span>Histórico Pesajes Lote</span>
                </button>
              </div>

              {/* TAB 1: INDIVIDUAL ANIMALS TABLE (WITH PREDIOS IN FRONT OF EACH ANIMAL) */}
              {modalTab === 'animals' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#f8faf8] p-2.5 rounded-xl border border-[#c1c8c2]">
                    <div className="relative flex-1 w-full sm:w-auto">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#717973]" />
                      <input
                        type="text"
                        placeholder="Buscar animal por arete, raza, sexo o predio..."
                        value={animalSearchQuery}
                        onChange={(e) => setAnimalSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 bg-white border border-[#c1c8c2] rounded-lg text-xs text-[#1a1c1c] focus:outline-none focus:border-[#012d1d]"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#2d6a4f]">
                      {filteredActiveLotAnimals.length} de {activeLotAnimals.length} animales mostrados
                    </span>
                  </div>

                  {/* Individual Animals List Table */}
                  <div className="border border-[#c1c8c2] rounded-xl overflow-x-auto max-h-[340px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-[#012d1d] text-white font-bold text-[10.5px] uppercase tracking-wider z-10">
                        <tr>
                          <th className="p-2.5">Predio / Finca</th>
                          <th className="p-2.5">Arete / Tag</th>
                          <th className="p-2.5">Origen / Tipo</th>
                          <th className="p-2.5">Raza / Capa</th>
                          <th className="p-2.5">Sexo & Edad</th>
                          <th className="p-2.5 text-right">Peso (kg)</th>
                          <th className="p-2.5 text-right">GDP (kg/d)</th>
                          <th className="p-2.5 text-center">Ficha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeeee]">
                        {filteredActiveLotAnimals.map((animal, idx) => {
                          const animalGdp = (
                            (activeLotDetail.gdpCurrent || 0.75) *
                            (0.92 + (idx % 5) * 0.04)
                          ).toFixed(2);

                          return (
                            <tr key={animal.id} className="hover:bg-[#f4fbf7] transition-colors">
                              {/* PREDIOS DISPLAYED PROMINENTLY IN FRONT OF EACH ANIMAL */}
                              <td className="p-2.5">
                                <span className="bg-[#f4fbf7] text-[#012d1d] border border-[#c1ecd4] font-extrabold px-2 py-0.5 rounded text-[10.5px] inline-flex items-center gap-1 shadow-2xs">
                                  <Building2 className="w-3 h-3 text-[#2d6a4f]" />
                                  <span>{animal.origin || activeLotDetail.farmName || 'Predio Principal'}</span>
                                </span>
                              </td>
                              <td className="p-2.5 font-mono font-bold text-[#012d1d]">
                                {animal.tag}
                                {animal.name && <span className="block text-[10px] text-[#717973] font-sans font-normal">{animal.name}</span>}
                              </td>
                              <td className="p-2.5">
                                {animal.originType === 'nacido' ? (
                                  <span className="bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7] font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                                    <Heart className="w-3 h-3 text-[#2e7d32]" />
                                    <span>Nacido en Finca</span>
                                  </span>
                                ) : animal.originType === 'comprado' ? (
                                  <span className="bg-[#e1f5fe] text-[#01579b] border border-[#81d4fa] font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                                    <ShoppingBag className="w-3 h-3 text-[#0288d1]" />
                                    <span>Comprado</span>
                                  </span>
                                ) : animal.originType === 'puro_registro' ? (
                                  <span className="bg-[#f3e5f5] text-[#4a148c] border border-[#ce93d8] font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                                    <Award className="w-3 h-3 text-[#7b1fa2]" />
                                    <span>Puro Registrado</span>
                                  </span>
                                ) : (
                                  <span className="bg-[#f3f3f3] text-[#414844] font-medium px-2 py-0.5 rounded text-[10px]">
                                    {animal.origin || 'Inventario'}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 font-medium text-[#1a1c1c]">
                                {animal.breed}
                              </td>
                              <td className="p-2.5 text-[#414844] capitalize">
                                {animal.sex === 'macho' ? 'Macho' : 'Hembra'} • {animal.ageMonths || 18}m
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-[#012d1d]">
                                {animal.weightKg} kg
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                                +{animalGdp}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  onClick={() => setSelectedAnimalForFicha(animal)}
                                  className="px-2 py-1 bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 mx-auto cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-[#c1ecd4]" />
                                  <span>Ficha</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: WEIGHT HISTORY */}
              {modalTab === 'weights' && (
                <div className="space-y-3">
                  <p className="font-bold text-[#012d1d] text-xs">Histórico de Pesajes Recientes del Lote</p>
                  <div className="border border-[#c1c8c2] rounded-xl overflow-hidden divide-y divide-[#eeeeee]">
                    {activeLotDetail.historyWeights.map((hw, i) => (
                      <div key={i} className="flex justify-between px-3 py-2 text-xs">
                        <span className="font-medium text-[#1a1c1c]">{hw.date}</span>
                        <span className="font-mono font-bold text-[#012d1d]">{hw.weight} kg</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2] text-xs">
                    <p className="text-[#717973] font-semibold mb-1">Notas de Manejo y Pastura</p>
                    <p className="text-[#1a1c1c]">{activeLotDetail.notes}</p>
                    <p className="text-[11px] text-[#2d6a4f] font-bold mt-1">
                      Pastura: {activeLotDetail.pastureType}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-4 mt-4 border-t border-[#eeeeee]">
              <button
                onClick={() => {
                  const lotId = activeLotDetail.id;
                  setActiveLotDetail(null);
                  onOpenWeightModal(lotId);
                }}
                className="flex-1 bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Scale className="w-4 h-4" />
                Registrar Pesaje de Lote
              </button>

              <button
                onClick={() => setActiveLotDetail(null)}
                className="px-5 py-2.5 bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#414844] font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. REGISTER NEW ANIMAL MODAL */}
      {/* ========================================================================= */}
      <RegisterNewAnimalModal
        isOpen={isNewAnimalModalOpen}
        onClose={() => setIsNewAnimalModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        lots={lots}
        animals={allInventoryAnimals}
        onSaveNewAnimal={handleSaveNewAnimal}
      />

      {/* ========================================================================= */}
      {/* 2. REGISTER LIVESTOCK MOVEMENT MODAL */}
      {/* ========================================================================= */}
      <RegisterLivestockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        farms={farms}
        lots={lots}
        onSaveMovement={handleSaveMovement}
      />

      {/* ========================================================================= */}
      {/* 2.B WEANING PROCESS MODAL */}
      {/* ========================================================================= */}
      <WeaningProcessModal
        isOpen={isWeaningModalOpen}
        onClose={() => setIsWeaningModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        lots={lots}
        animals={customAnimals}
        onSaveWeaning={handleSaveWeaning}
      />

      {/* ========================================================================= */}
      {/* 3. FICHA INDIVIDUAL DEL BOVINO MODAL */}
      {/* ========================================================================= */}
      {selectedAnimalForFicha && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setSelectedAnimalForFicha(null); }}>
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 md:p-6 border border-[#c1c8c2] shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#eeeeee]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#012d1d] text-[#c1ecd4] rounded-2xl shadow-sm">
                    <Tag className="w-6 h-6 text-[#ffba38]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#012d1d] bg-[#f4fbf7] border border-[#c1ecd4] px-2 py-0.5 rounded">
                        Arete: {selectedAnimalForFicha.tag}
                      </span>
                      {selectedAnimalForFicha.originType === 'nacido' && (
                        <span className="bg-[#e8f5e9] text-[#1b5e20] text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Heart className="w-3 h-3 text-[#2e7d32]" /> Nacido en Finca
                        </span>
                      )}
                      {selectedAnimalForFicha.originType === 'comprado' && (
                        <span className="bg-[#e1f5fe] text-[#01579b] text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-[#0288d1]" /> Comprado
                        </span>
                      )}
                      {selectedAnimalForFicha.originType === 'puro_registro' && (
                        <span className="bg-[#f3e5f5] text-[#4a148c] text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Award className="w-3 h-3 text-[#7b1fa2]" /> Puro Registrado
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-[#012d1d] mt-1">
                      {selectedAnimalForFicha.name || `Bovino ${selectedAnimalForFicha.breed}`}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnimalForFicha(null)}
                  className="p-1.5 text-[#717973] hover:text-black hover:bg-[#f0f0f0] rounded-xl transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Ficha Key Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 text-xs">
                <div className="p-2.5 bg-[#f4fbf7] border border-[#c1ecd4] rounded-2xl">
                  <p className="text-[#717973] font-bold text-[9px] uppercase">Peso Actual</p>
                  <p className="text-base font-black font-mono text-[#012d1d]">{selectedAnimalForFicha.weightKg} kg</p>
                </div>
                <div className="p-2.5 bg-[#f3f3f3] border border-[#c1c8c2] rounded-2xl">
                  <p className="text-[#717973] font-bold text-[9px] uppercase">Raza / Sexo</p>
                  <p className="text-xs font-bold text-[#012d1d] capitalize">{selectedAnimalForFicha.breed} ({selectedAnimalForFicha.sex})</p>
                </div>
                <div className="p-2.5 bg-[#f3f3f3] border border-[#c1c8c2] rounded-2xl">
                  <p className="text-[#717973] font-bold text-[9px] uppercase">Color / Pelaje</p>
                  <p className="text-xs font-bold text-[#012d1d]">{selectedAnimalForFicha.color || 'Blanco / Gris'}</p>
                </div>
                <div className="p-2.5 bg-[#f3f3f3] border border-[#c1c8c2] rounded-2xl">
                  <p className="text-[#717973] font-bold text-[9px] uppercase">Tipo / Categoría</p>
                  <p className="text-xs font-bold text-[#012d1d] capitalize">
                    {selectedAnimalForFicha.cattleType === 'puro_registrable' || selectedAnimalForFicha.cattleType === 'puro_registro'
                      ? 'Puro / Registrable'
                      : selectedAnimalForFicha.cattleType === 'puro_comercial'
                      ? 'Puro Comercial'
                      : 'Comercial'} • {selectedAnimalForFicha.category || 'Cría'}
                  </p>
                </div>
              </div>

              {/* Hierro / Marca Asignada */}
              <div className="p-3 bg-gradient-to-r from-[#2a1b12] to-[#120b07] border-2 border-[#ffba38]/60 rounded-2xl text-white flex items-center justify-between my-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffba38] text-[#523700] flex items-center justify-center text-xl font-black shadow-inner">
                    {selectedAnimalForFicha.brandingIronSymbol || '🔥'}
                  </div>
                  <div>
                    <span className="text-[9.5px] font-mono font-bold text-[#ffba38] uppercase block">
                      HIERRO / MARCA GANADERA
                    </span>
                    <p className="text-xs font-black text-white">
                      {selectedAnimalForFicha.brandingIronName || 'Hierro Principal H1'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-[#d7ccc8] uppercase block">Ubicación</span>
                  <span className="text-xs font-bold text-[#ffe082]">
                    📍 {selectedAnimalForFicha.brandingIronLocation || 'Anca Derecha'}
                  </span>
                </div>
              </div>

              {/* Origin Details */}
              {selectedAnimalForFicha.bornInfo && (
                <div className="p-3.5 bg-[#e8f5e9]/70 border border-[#a5d6a7] rounded-2xl space-y-2 mb-3 text-xs">
                  <h4 className="font-bold text-[#1b5e20] flex items-center justify-between border-b border-[#a5d6a7] pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-[#2e7d32]" /> Datos de Nacimiento & Marca de Oreja
                    </span>
                    <span className="text-[9.5px] bg-[#2e7d32] text-white px-2 py-0.2 rounded font-mono font-bold">
                      Etapa Nacer
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-[#2e7d32] font-semibold">Madre (Obligatoria):</span> <strong>{selectedAnimalForFicha.bornInfo.damTag}</strong></div>
                    <div><span className="text-[#2e7d32] font-semibold">Padre (Toro/Semen):</span> <strong>{selectedAnimalForFicha.bornInfo.sireTagOrBull || 'Sin trazabilidad'}</strong></div>
                    <div><span className="text-[#2e7d32] font-semibold">Predio de Origen:</span> <strong>{selectedAnimalForFicha.bornInfo.originFarmName || selectedAnimalForFicha.farmName || 'Predio Principal'}</strong></div>
                    <div><span className="text-[#2e7d32] font-semibold">Fecha Nacimiento:</span> <strong>{selectedAnimalForFicha.bornInfo.birthDate}</strong></div>
                    <div><span className="text-[#2e7d32] font-semibold">Peso al Nacer:</span> <strong>{selectedAnimalForFicha.bornInfo.birthWeightKg || 35} kg</strong></div>
                    {selectedAnimalForFicha.bornInfo.earTagInitial && (
                      <div><span className="text-[#2e7d32] font-semibold">Marca Oreja Inicial:</span> <strong className="font-mono">{selectedAnimalForFicha.bornInfo.earTagInitial}</strong></div>
                    )}
                    {selectedAnimalForFicha.bornInfo.tattooNumber && (
                      <div><span className="text-[#2e7d32] font-semibold">Tatuaje Oreja:</span> <strong className="font-mono">{selectedAnimalForFicha.bornInfo.tattooNumber}</strong></div>
                    )}
                  </div>
                </div>
              )}

              {/* Weaning Details if available */}
              {selectedAnimalForFicha.weaningInfo && (
                <div className="p-3.5 bg-[#fff8e7] border-2 border-[#ffe082] rounded-2xl space-y-2 mb-3 text-xs">
                  <h4 className="font-bold text-[#523700] flex items-center justify-between border-b border-[#ffe082] pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-[#ff8f00]" /> Registro Oficial de Destete
                    </span>
                    <span className="text-[9.5px] bg-[#ffba38] text-[#523700] px-2 py-0.2 rounded font-mono font-bold">
                      Etapa Destete
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-[#523700] font-semibold">Fecha Destete:</span> <strong>{selectedAnimalForFicha.weaningInfo.weaningDate}</strong></div>
                    <div><span className="text-[#523700] font-semibold">Peso Destete:</span> <strong className="font-mono">{selectedAnimalForFicha.weaningInfo.weaningWeightKg} kg</strong></div>
                    <div><span className="text-[#523700] font-semibold">GDP Predestete:</span> <strong className="font-mono text-[#1b5e20]">{selectedAnimalForFicha.weaningInfo.dailyGainKg || 0.75} kg/día</strong></div>
                    <div><span className="text-[#523700] font-semibold">Marca Definitiva:</span> <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#ffe082]">{selectedAnimalForFicha.weaningInfo.brandCode} ({selectedAnimalForFicha.weaningInfo.brandType.replace('_', ' ')})</strong></div>
                    {selectedAnimalForFicha.weaningInfo.asocebuRegisterNumber && (
                      <div className="col-span-2 text-[#4a148c] bg-[#f3e5f5] p-2 rounded-xl border border-[#ce93d8] flex items-center justify-between">
                        <span className="font-bold">🏆 Registro Asocebú: {selectedAnimalForFicha.weaningInfo.asocebuRegisterNumber}</span>
                        <span className="text-[10px]">{selectedAnimalForFicha.weaningInfo.registeredNameAsocebu || 'Ejemplar Puro'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedAnimalForFicha.purchasedInfo && (
                <div className="p-3.5 bg-[#e1f5fe]/70 border border-[#81d4fa] rounded-2xl space-y-2 mb-3 text-xs">
                  <h4 className="font-bold text-[#01579b] flex items-center gap-1.5 border-b border-[#81d4fa] pb-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#0288d1]" /> Datos de Comercialización / Compra
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-[#0288d1] font-semibold">Origen:</span> <strong>{selectedAnimalForFicha.purchasedInfo.supplierOrAuction}</strong></div>
                    <div><span className="text-[#0288d1] font-semibold">Fecha Compra:</span> <strong>{selectedAnimalForFicha.purchasedInfo.purchaseDate}</strong></div>
                    <div><span className="text-[#0288d1] font-semibold">Precio Total:</span> <strong>${selectedAnimalForFicha.purchasedInfo.purchasePriceTotal?.toLocaleString()} COP</strong></div>
                    <div><span className="text-[#0288d1] font-semibold">Factura / Guía:</span> <strong>{selectedAnimalForFicha.purchasedInfo.invoiceOrReceipt || 'N/A'}</strong></div>
                  </div>
                </div>
              )}

              {selectedAnimalForFicha.purebredInfo && (
                <div className="p-3.5 bg-[#f3e5f5]/70 border border-[#ce93d8] rounded-2xl space-y-2 mb-3 text-xs">
                  <h4 className="font-bold text-[#4a148c] flex items-center gap-1.5 border-b border-[#ce93d8] pb-1.5">
                    <Award className="w-4 h-4 text-[#7b1fa2]" /> Genealogía y Registro de Pureza
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-[#7b1fa2] font-semibold">Asociación:</span> <strong>{selectedAnimalForFicha.purebredInfo.association}</strong></div>
                    <div><span className="text-[#7b1fa2] font-semibold">N° Registro:</span> <strong className="font-mono">{selectedAnimalForFicha.purebredInfo.registrationNumber}</strong></div>
                    <div className="col-span-2"><span className="text-[#7b1fa2] font-semibold">Nombre Oficial:</span> <strong>{selectedAnimalForFicha.purebredInfo.registeredName}</strong></div>
                    <div><span className="text-[#7b1fa2] font-semibold">Padre:</span> {selectedAnimalForFicha.purebredInfo.sireName} ({selectedAnimalForFicha.purebredInfo.sireReg})</div>
                    <div><span className="text-[#7b1fa2] font-semibold">Madre:</span> {selectedAnimalForFicha.purebredInfo.damName} ({selectedAnimalForFicha.purebredInfo.damReg})</div>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="p-3 bg-[#f8faf8] border border-[#c1c8c2] rounded-2xl text-xs space-y-1">
                <p className="font-bold text-[#012d1d] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#2d6a4f]" /> Ubicación Actual en Ganadería
                </p>
                <p className="text-[#414844]">
                  Predio: <strong>{selectedAnimalForFicha.farmName || 'Predio Principal'}</strong> • Lote: <strong>{selectedAnimalForFicha.lotCode || 'General'}</strong>
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#eeeeee] flex justify-end">
              <button
                onClick={() => setSelectedAnimalForFicha(null)}
                className="px-5 py-2 rounded-xl bg-[#012d1d] text-white font-bold text-xs cursor-pointer hover:bg-[#1b4332]"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Progression Rule & Approval Modal */}
      <CategoryTransitionApprovalModal
        isOpen={isCategoryApprovalModalOpen}
        onClose={() => setIsCategoryApprovalModalOpen(false)}
        alerts={transitionAlerts}
        rules={categoryRules}
        animals={allInventoryAnimals}
        lots={combinedLots}
        onApproveTransition={handleApproveTransition}
        onRejectTransition={handleRejectTransition}
        onApproveAllPending={handleApproveAllPending}
        onSaveRules={handleSaveRules}
      />

      {/* Numbering Policy & Identification Settings Modal */}
      <NumberingPolicySettingsModal
        isOpen={isNumberingPolicyModalOpen}
        onClose={() => setIsNumberingPolicyModalOpen(false)}
        farmId={currentFarm?.profile.id || 'all'}
        farmName={currentFarm?.profile.name || 'Predio Activo'}
        currentPolicy={farmNumberingPolicy}
        onPolicyUpdated={(newPolicy) => setFarmNumberingPolicy(newPolicy)}
      />

      {/* Migrate Existing Inventory Modal */}
      <MigrateInventoryModal
        isOpen={isMigrateModalOpen}
        onClose={() => setIsMigrateModalOpen(false)}
        farms={farms}
        currentFarmId={currentFarm?.profile.id || 'all'}
        onCompleteMigration={handleCompleteMigration}
      />
    </div>
  );
};
