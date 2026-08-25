import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MainTab, RecentActivity, SanitarioAlert, FarmDataPackage, BrandingIron } from '../types';
import { CowIcon } from './icons/CowIcon';
import {
  AlertTriangle,
  Clock,
  Store,
  Droplet,
  Dna,
  Baby,
  Scale,
  PlusCircle,
  TrendingUp,
  Sparkles,
  HeartPulse,
  Map,
  Building,
  Building2,
  MapPin,
  Settings,
  ChevronRight,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Phone,
  FileText,
  Compass,
  Tractor,
  Activity,
  Award,
  Calendar,
  ExternalLink,
  ShoppingBag,
  Beef,
  Leaf,
  Filter,
  Flame,
  Edit3,
  Trash2,
  Truck,
  Users,
  Heart,
  Stethoscope,
  ClipboardList,
  CalendarDays,
  Info,
  Smartphone,
} from 'lucide-react';
import { RegistrationEventType } from './modals/NewEventModal';
import {
  ProductionCategoryKey,
  CATEGORY_DEFINITIONS,
  getFarmCategories,
  farmHasCategory,
  filterFarmsByCategory,
  segmentPaddocksByFarms,
} from '../utils/farmCategoryUtils';

interface HomeViewProps {
  setActiveTab: (tab: MainTab) => void;
  alerts: SanitarioAlert[];
  activities: RecentActivity[];
  totalHeads: number;
  avgGdp: number;
  todayMilkLiters: number;
  onOpenWithdrawalModal: () => void;
  onOpenNewEventModal: (eventType?: RegistrationEventType) => void;
  onOpenWeightModal: () => void;
  onOpenMilkingModal: () => void;
  currentFarm?: FarmDataPackage;
  farms?: FarmDataPackage[];
  selectedFarmId?: string;
  onSelectFarm?: (farmId: string) => void;
  onOpenCreateFarmModal?: () => void;
  onOpenFarmManagerModal?: () => void;
  onOpenEditFarmModal?: (farmId: string) => void;
  brandingIrons?: BrandingIron[];
  onOpenRegisterBrandingIronModal?: () => void;
  onDeleteBrandingIron?: (id: string) => void;
  onEditBrandingIron?: (iron: BrandingIron) => void;
  onOpenPendingActivitiesModal?: () => void;
  pendingActivitiesCount?: number;
  isDairyEnabled?: boolean;
  onToggleDairyModule?: () => void;
  isLotsEnabled?: boolean;
  onToggleLotsModule?: () => void;
  onOpenPalpationModal?: () => void;
  onOpenSanitaryPlanModal?: (tab?: 'protocols' | 'apply' | 'withdrawals' | 'history') => void;
  onOpenWhatsAppModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  alerts,
  activities,
  totalHeads,
  avgGdp,
  todayMilkLiters,
  onOpenWithdrawalModal,
  onOpenNewEventModal,
  onOpenWeightModal,
  onOpenMilkingModal,
  currentFarm,
  farms = [],
  selectedFarmId,
  onSelectFarm,
  onOpenCreateFarmModal,
  onOpenFarmManagerModal,
  onOpenEditFarmModal,
  brandingIrons = [],
  onOpenRegisterBrandingIronModal,
  onDeleteBrandingIron,
  onEditBrandingIron,
  onOpenPendingActivitiesModal,
  pendingActivitiesCount = 0,
  isDairyEnabled = true,
  onToggleDairyModule,
  isLotsEnabled = false,
  onToggleLotsModule,
  onOpenPalpationModal,
  onOpenSanitaryPlanModal,
  onOpenWhatsAppModal,
}) => {
  // 'all' for consolidated multi-farm view, or specific farm ID for detailed farm view
  const [selectedView, setSelectedView] = useState<'all' | string>('all');
  // Category filter: 'all' | 'ceba' | 'cria' | 'leche' | 'genetica'
  const [selectedCategory, setSelectedCategory] = useState<ProductionCategoryKey>('all');

  // Handle switching to a specific farm or global view
  const handleViewChange = (viewId: 'all' | string) => {
    setSelectedView(viewId);
    if (viewId !== 'all' && onSelectFarm) {
      onSelectFarm(viewId);
    }
  };

  // Filter farms by category
  const filteredFarms = useMemo(() => {
    return filterFarmsByCategory(farms, selectedCategory);
  }, [farms, selectedCategory]);

  // Segmented Paddocks
  const segmentedPaddocks = useMemo(() => {
    return segmentPaddocksByFarms(filteredFarms, selectedCategory);
  }, [filteredFarms, selectedCategory]);

  // Find the selected farm package if a specific farm is active
  const activeDetailedFarm =
    selectedView === 'all'
      ? null
      : farms.find((f) => f.profile.id === selectedView) || currentFarm;

  // ==========================================
  // CONSOLIDATED GLOBAL CALCULATIONS
  // ==========================================
  const totalFarmsCount = farms.length;
  const totalConsolidatedAreaHa = farms.reduce(
    (acc, f) => acc + (f.profile.totalAreaHa || 0),
    0,
  );
  const totalConsolidatedHeads = farms.reduce((acc, f) => {
    const lotHeads = f.lots?.reduce((lAcc, l) => lAcc + l.heads, 0) || 0;
    const farmHeads = f.headsCount || f.profile.headsCount || 0;
    return acc + Math.max(farmHeads, lotHeads);
  }, 0);
  const totalConsolidatedPaddocks = farms.reduce(
    (acc, f) => acc + (f.paddocks?.length || 0),
    0,
  );

  // Departments covered
  const uniqueDepartments = Array.from(
    new Set(farms.map((f) => f.profile.department).filter(Boolean)),
  );

  // Global carrying capacity
  const globalCarryingCapacity =
    totalConsolidatedAreaHa > 0
      ? (totalConsolidatedHeads / totalConsolidatedAreaHa).toFixed(2)
      : '1.20';

  // Helper for vocation label & color
  const getProductionBadge = (prodType?: string) => {
    switch (prodType) {
      case 'ceba':
        return {
          label: 'Ceba Intensiva',
          bg: 'bg-emerald-950/70',
          text: 'text-emerald-300',
          border: 'border-emerald-700/40',
        };
      case 'cria':
        return {
          label: 'Cría y Levante',
          bg: 'bg-amber-950/70',
          text: 'text-amber-300',
          border: 'border-amber-700/40',
        };
      case 'doble_proposito':
        return {
          label: 'Doble Propósito',
          bg: 'bg-teal-950/70',
          text: 'text-teal-300',
          border: 'border-teal-700/40',
        };
      case 'lecheria_especializada':
        return {
          label: 'Lechería Especializada',
          bg: 'bg-blue-950/70',
          text: 'text-blue-300',
          border: 'border-blue-700/40',
        };
      case 'genetica_pura':
        return {
          label: 'Genética & Cabaña',
          bg: 'bg-purple-950/70',
          text: 'text-purple-300',
          border: 'border-purple-700/40',
        };
      default:
        return {
          label: 'Ganadería Integral',
          bg: 'bg-[#1F3327]',
          text: 'text-[#A5B8AC]',
          border: 'border-white/10',
        };
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 w-full pb-12"
    >
      {/* Quick Actions Toolbar (Directly on light operational workspace, no hero banner) */}
      <div className="w-full flex flex-wrap items-center gap-2 pt-0.5 pb-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onOpenNewEventModal('compra')}
          className="bg-[#D4A94E] hover:bg-[#C5993F] text-[#0D1A13] font-bold text-xs sm:text-sm h-10 sm:h-9 px-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#0D1A13]" />
          <span>Nuevo Registro</span>
        </motion.button>

        {onOpenPendingActivitiesModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenPendingActivitiesModal}
            className="bg-[#123F2A] hover:bg-[#1F6547] text-white font-semibold text-xs sm:text-sm h-10 sm:h-9 px-3 rounded-xl border border-[rgba(255, 255, 255, 0.12)] transition-all flex items-center justify-center gap-1.5 cursor-pointer relative shrink-0 shadow-2xs"
            title="Abrir Reporte Operativo de Actividades Diarias Pendientes"
          >
            <ClipboardList className="w-4 h-4 text-[#39D98A]" />
            <span>Tareas</span>
            {pendingActivitiesCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {pendingActivitiesCount}
              </span>
            )}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            if (onOpenPalpationModal) {
              onOpenPalpationModal();
            } else {
              setActiveTab('genetics');
            }
          }}
          className="bg-[#123F2A] hover:bg-[#1F6547] text-white font-semibold text-xs sm:text-sm h-10 sm:h-9 px-3 rounded-xl border border-[rgba(255, 255, 255, 0.12)] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
        >
          <Heart className="w-4 h-4 text-rose-300" />
          <span>Palpación</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            if (onOpenSanitaryPlanModal) {
              onOpenSanitaryPlanModal();
            } else {
              setActiveTab('menu');
              onOpenWithdrawalModal();
            }
          }}
          className="bg-[#123F2A] hover:bg-[#1F6547] text-white font-semibold text-xs sm:text-sm h-10 sm:h-9 px-3 rounded-xl border border-[rgba(255, 255, 255, 0.12)] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
        >
          <Stethoscope className="w-4 h-4 text-teal-300" />
          <span>Plan Sanitario</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onOpenWeightModal}
          className="bg-[#123F2A] hover:bg-[#1F6547] text-white font-semibold text-xs sm:text-sm h-10 sm:h-9 px-3 rounded-xl border border-[rgba(255, 255, 255, 0.12)] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
        >
          <Scale className="w-4 h-4 text-[#D4A94E]" />
          <span>Pesaje</span>
        </motion.button>

        {onOpenWhatsAppModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onOpenWhatsAppModal}
            className="bg-[#128C7E] hover:bg-[#075E54] text-white font-semibold text-xs sm:text-sm h-10 sm:h-9 px-3 rounded-xl border border-[#25D366]/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            title="Vincular Asistente de WhatsApp y Probar Bot"
          >
            <Smartphone className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Bot</span>
          </motion.button>
        )}

        {onOpenFarmManagerModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenFarmManagerModal}
            className="bg-[#123F2A] hover:bg-[#1F6547] text-white font-semibold text-xs sm:text-sm h-10 sm:h-9 px-3 rounded-xl border border-[rgba(255, 255, 255, 0.12)] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            title="Administrar fincas"
          >
            <Settings className="w-4 h-4 text-[#A5B8AC]" />
            <span>Gestionar</span>
          </motion.button>
        )}

        {onOpenCreateFarmModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenCreateFarmModal}
            className="bg-[#123F2A] hover:bg-[#1F6547] text-emerald-300 font-semibold text-xs sm:text-sm h-10 sm:h-9 px-3 rounded-xl border border-emerald-600/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Building className="w-4 h-4 text-emerald-400" />
            <span>+ Finca</span>
          </motion.button>
        )}

        {onOpenRegisterBrandingIronModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onOpenRegisterBrandingIronModal}
            className="bg-[#123F2A] hover:bg-[#1F6547] text-white font-semibold text-xs sm:text-sm h-10 sm:h-9 px-3 rounded-xl border border-[rgba(255, 255, 255, 0.12)] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            title="Registrar nuevo Hierro o Marca a Fuego"
          >
            <Flame className="w-4 h-4 text-[#D4A94E]" />
            <span>Hierro</span>
          </motion.button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DIRECT ACCESS SELECTOR CARDS FOR ALL FINCAS / PREDIOS & CATEGORY FILTER */}
      {/* ========================================================================= */}
      <div className="bg-[#15241C] rounded-3xl p-5 md:p-6 shadow-xl border border-white/10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#1F3327] text-[#D4A94E] rounded-xl border border-white/10">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF] tracking-tight">
                Predios e Inventario Ganadero
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            {onToggleLotsModule && (
              <button
                onClick={onToggleLotsModule}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isLotsEnabled
                    ? 'bg-[#123F2A] text-[#D4A94E] border border-[#D4A94E]/40 shadow-xs'
                    : 'bg-[#1F3327] text-[#A5B8AC] hover:bg-[#1F3327] border border-white/10'
                }`}
                title={
                  isLotsEnabled
                    ? 'Modo POTREROS Activo: Muestra la discriminación detallada potrero por potrero. Haz clic para volver a Modo Predios.'
                    : 'Modo PREDIOS Activo por Defecto. Haz clic para activar el Modo Potreros y ver el desglose por potrero.'
                }
              >
                {isLotsEnabled ? (
                  <Layers className="w-3.5 h-3.5 text-[#D4A94E]" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-[#A5B8AC]" />
                )}
                <span>Manejo:</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${isLotsEnabled ? 'bg-[#D4A94E] text-[#0D1A13]' : 'bg-[#0D1A13] text-[#FFFFFF]'}`}>
                  {isLotsEnabled ? 'POTREROS' : 'PREDIOS'}
                </span>
              </button>
            )}

            <button
              onClick={() => handleViewChange('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedView === 'all'
                  ? 'bg-[#123F2A] text-[#FFFFFF] border border-[#D4A94E]/40 shadow-xs'
                  : 'bg-[#1F3327] text-[#A5B8AC] hover:bg-[#1F3327] border border-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#D4A94E]" />
              <span>Todas (Consolidado)</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0D1A13] p-1.5 rounded-2xl border border-white/10">
          <span className="text-[11px] font-semibold text-[#A5B8AC] px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#A5B8AC]" />
            Filtro:
          </span>

          {(['all', 'ceba', 'cria', 'leche', 'genetica'] as ProductionCategoryKey[]).map((catKey) => {
            const def = CATEGORY_DEFINITIONS[catKey];
            const isSelected = selectedCategory === catKey;
            const count = filterFarmsByCategory(farms, catKey).length;

            return (
              <motion.button
                key={catKey}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#D4A94E] text-[#0D1A13] shadow-md font-bold'
                    : 'text-[#A5B8AC] hover:text-[#FFFFFF] hover:bg-white/5'
                }`}
              >
                {catKey === 'all' && <Layers className="w-3.5 h-3.5 text-[#0D1A13]" />}
                {catKey === 'ceba' && <Beef className="w-3.5 h-3.5 text-emerald-400" />}
                {catKey === 'cria' && <Baby className="w-3.5 h-3.5 text-amber-400" />}
                {catKey === 'leche' && <Droplet className="w-3.5 h-3.5 text-blue-400" />}
                {catKey === 'genetica' && <Dna className="w-3.5 h-3.5 text-purple-400" />}
                <span>{def.shortLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${isSelected ? 'bg-[#0D1A13]/20 text-[#0D1A13]' : 'bg-[#1F3327] text-[#A5B8AC]'}`}>
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Fincas Selector Grid (Filtered by Category) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 0: VISTA CONSOLIDADA (TODAS LAS FINCAS) */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleViewChange('all')}
            className={`p-4 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between select-none ${
              selectedView === 'all'
                ? 'bg-[#123F2A] text-white shadow-[0_8px_20px_rgba(4,56,37,0.4)] border border-[#D4A94E]/50'
                : 'bg-[#1F3327] hover:bg-[#1F3327] border border-white/10 text-[#FFFFFF]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
                    selectedView === 'all'
                      ? 'bg-white/15 text-[#D4A94E]'
                      : 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/30'
                  }`}
                >
                  CONSOLIDADO
                </span>
                {selectedView === 'all' && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A94E]" /> Activo
                  </span>
                )}
              </div>
              <h3 className={`text-base font-bold mt-2.5 leading-tight ${selectedView === 'all' ? 'text-white' : 'text-[#FFFFFF]'}`}>
                Todas las Fincas
              </h3>
              <p className={`text-xs mt-0.5 ${selectedView === 'all' ? 'text-emerald-100/70' : 'text-[#A5B8AC]'}`}>
                {totalFarmsCount} predios operando
              </p>
            </div>

            <div className={`mt-3.5 pt-3 border-t grid grid-cols-3 gap-1 text-center ${
              selectedView === 'all' ? 'border-white/15' : 'border-white/10'
            }`}>
              <div>
                <span className={`block font-bold text-xs ${selectedView === 'all' ? 'text-[#D4A94E]' : 'text-[#FFFFFF]'}`}>
                  {totalConsolidatedAreaHa.toLocaleString()}
                </span>
                <span className={`text-[9.5px] uppercase font-medium ${selectedView === 'all' ? 'text-emerald-100/70' : 'text-[#7F8C83]'}`}>
                  Ha
                </span>
              </div>
              <div>
                <span className={`block font-bold text-xs ${selectedView === 'all' ? 'text-[#D4A94E]' : 'text-[#FFFFFF]'}`}>
                  {totalConsolidatedHeads.toLocaleString()}
                </span>
                <span className={`text-[9.5px] uppercase font-medium ${selectedView === 'all' ? 'text-emerald-100/70' : 'text-[#7F8C83]'}`}>
                  Cabezas
                </span>
              </div>
              <div>
                <span className={`block font-bold text-xs ${selectedView === 'all' ? 'text-[#D4A94E]' : 'text-[#FFFFFF]'}`}>
                  {totalConsolidatedPaddocks}
                </span>
                <span className={`text-[9.5px] uppercase font-medium ${selectedView === 'all' ? 'text-emerald-100/70' : 'text-[#7F8C83]'}`}>
                  Potreros
                </span>
              </div>
            </div>
          </motion.div>

          {/* Cards 1..N: Individual Farm Cards matching selected Category */}
          {filteredFarms.map((farm) => {
            const isSelected = selectedView === farm.profile.id;
            const badge = getProductionBadge(farm.profile.productionType);
            const farmCats = getFarmCategories(farm);
            const farmHeads =
              farm.headsCount ||
              farm.profile.headsCount ||
              farm.lots?.reduce((sum, l) => sum + l.heads, 0) ||
              0;

            return (
              <motion.div
                key={farm.profile.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleViewChange(farm.profile.id)}
                className={`p-4 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                  isSelected
                    ? 'bg-[#123F2A] text-white shadow-[0_8px_20px_rgba(4,56,37,0.4)] border border-[#D4A94E]/50'
                    : 'bg-[#1F3327] hover:bg-[#1F3327] border border-white/10 text-[#FFFFFF]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md truncate max-w-[130px] border ${
                        isSelected
                          ? 'bg-white/15 text-emerald-200 border-white/15'
                          : `${badge.bg} ${badge.text} ${badge.border}`
                      }`}
                    >
                      {badge.label}
                    </span>

                    {isSelected ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#D4A94E] shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Seleccionada
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#A5B8AC] flex items-center gap-0.5 shrink-0 font-medium">
                        <MapPin className="w-3 h-3 text-[#A5B8AC]" /> {farm.profile.department}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-bold mt-2.5 leading-snug truncate ${
                    isSelected ? 'text-white' : 'text-[#FFFFFF]'
                  }`}>
                    {farm.profile.name}
                  </h3>

                  <p className={`text-xs mt-0.5 truncate flex items-center gap-1 ${
                    isSelected ? 'text-emerald-100/70' : 'text-[#A5B8AC]'
                  }`}>
                    <span>{farm.profile.municipality}</span>
                    <span>•</span>
                    <span className="truncate">{farm.profile.vereda}</span>
                  </p>

                  {/* Categories Tags */}
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {farmCats.map((cat) => (
                      <span
                        key={cat}
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md uppercase ${
                          isSelected ? 'bg-white/15 text-white' : 'bg-[#0D1A13] text-[#A5B8AC] border border-white/10'
                        }`}
                      >
                        {CATEGORY_DEFINITIONS[cat]?.shortLabel || cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`mt-3.5 pt-3 border-t grid grid-cols-3 gap-1 text-center ${
                  isSelected ? 'border-white/15' : 'border-white/10'
                }`}>
                  <div>
                    <span className={`block font-bold text-xs ${isSelected ? 'text-[#D4A94E]' : 'text-[#FFFFFF]'}`}>
                      {farm.profile.totalAreaHa}
                    </span>
                    <span className={`text-[9.5px] uppercase font-medium ${isSelected ? 'text-emerald-100/70' : 'text-[#7F8C83]'}`}>
                      Ha
                    </span>
                  </div>
                  <div>
                    <span className={`block font-bold text-xs ${isSelected ? 'text-[#D4A94E]' : 'text-[#FFFFFF]'}`}>
                      {farmHeads}
                    </span>
                    <span className={`text-[9.5px] uppercase font-medium ${isSelected ? 'text-emerald-100/70' : 'text-[#7F8C83]'}`}>
                      Cabezas
                    </span>
                  </div>
                  <div>
                    <span className={`block font-bold text-xs ${isSelected ? 'text-[#D4A94E]' : 'text-[#FFFFFF]'}`}>
                      {farm.paddocks?.length || 0}
                    </span>
                    <span className={`text-[9.5px] uppercase font-medium ${isSelected ? 'text-emerald-100/70' : 'text-[#7F8C83]'}`}>
                      Potreros
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONDITIONAL RENDERING: VISTA CONSOLIDADA (ALL) vs VISTA DETALLADA (FINCA) */}
      {/* ========================================================================= */}

      {selectedView === 'all' ? (
        /* ========================================================================= */
        /* 1. VISTA CONSOLIDADA DE TODA LA GANADERÍA */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Consolidated Executive Summary Banner */}
          <div className="bg-[#15241C] rounded-3xl p-5 md:p-6 shadow-xl border border-white/10 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Balance Global
                  </span>
                  <span className="text-xs text-[#A5B8AC] font-medium">
                    {totalFarmsCount} Unidades Productivas en {uniqueDepartments.length} Departamentos
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-2 text-[#FFFFFF]">
                  Operación Ganadera Consolidada
                </h2>
                <p className="text-xs md:text-sm text-[#A5B8AC] mt-1 max-w-3xl">
                  Totalizando <strong className="text-[#FFFFFF]">{totalConsolidatedAreaHa.toLocaleString()} Hectáreas</strong> y un hato de <strong className="text-[#FFFFFF]">{totalConsolidatedHeads.toLocaleString()} cabezas</strong> distribuidas en <strong className="text-[#FFFFFF]">{totalConsolidatedPaddocks} potreros</strong> georreferenciados.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveTab('gis')}
                  className="bg-[#123F2A] hover:bg-[#064e34] text-white font-semibold text-xs md:text-sm px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shadow-md border border-[#D4A94E]/30 cursor-pointer"
                >
                  <Map className="w-4 h-4 text-[#D4A94E]" />
                  <span>Explorar Mapa SIG</span>
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Key Consolidated Metrics (6 KPIs) */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
            {/* KPI 1: Predios Activos */}
            <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col justify-between hover:border-white/20 transition-all min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC] truncate">
                  Predios
                </p>
                <div className="p-1.5 bg-[#1F3327] text-[#D4A94E] rounded-lg shrink-0 border border-white/10">
                  <Building className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight">
                  {totalFarmsCount}
                </span>
                <span className="text-xs text-[#A5B8AC] ml-1 font-medium">fincas</span>
              </div>
              <p className="text-[10px] text-[#7F8C83] border-t border-white/10 pt-1.5 truncate">
                {uniqueDepartments.join(', ')}
              </p>
            </div>

            {/* KPI 2: Inventario Consolidado */}
            <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col justify-between hover:border-white/20 transition-all min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC] truncate">
                  Hato Total
                </p>
                <div className="p-1.5 bg-[#1F3327] text-emerald-400 rounded-lg shrink-0 border border-white/10">
                  <Tractor className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight">
                  {totalConsolidatedHeads.toLocaleString()}
                </span>
                <span className="text-xs text-[#A5B8AC] ml-1 font-medium">cabezas</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold border-t border-white/10 pt-1.5 truncate">
                100% inventariado
              </p>
            </div>

            {/* KPI 3: Área Total */}
            <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col justify-between hover:border-white/20 transition-all min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC] truncate">
                  Área Total
                </p>
                <div className="p-1.5 bg-[#1F3327] text-emerald-400 rounded-lg shrink-0 border border-white/10">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight">
                  {totalConsolidatedAreaHa.toLocaleString()}
                </span>
                <span className="text-xs text-[#A5B8AC] ml-1 font-medium">Ha</span>
              </div>
              <p className="text-[10px] text-[#A5B8AC] border-t border-white/10 pt-1.5 truncate">
                Carga: <strong className="text-[#FFFFFF]">{globalCarryingCapacity} UGG/Ha</strong>
              </p>
            </div>

            {/* KPI 4: Potreros Totales */}
            <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col justify-between hover:border-white/20 transition-all min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC] truncate">
                  Potreros SIG
                </p>
                <div className="p-1.5 bg-[#1F3327] text-teal-400 rounded-lg shrink-0 border border-white/10">
                  <Compass className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight">
                  {totalConsolidatedPaddocks}
                </span>
                <span className="text-xs text-[#A5B8AC] ml-1 font-medium">divisiones</span>
              </div>
              <p className="text-[10px] text-[#A5B8AC] border-t border-white/10 pt-1.5 truncate">
                Rotación PRV activa
              </p>
            </div>

            {/* KPI 5: Producción Leche */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={isDairyEnabled ? onOpenMilkingModal : onToggleDairyModule}
              className={`rounded-2xl p-4 shadow-md flex flex-col justify-between transition-all cursor-pointer min-w-0 overflow-hidden border ${
                isDairyEnabled
                  ? 'bg-[#15241C] border-white/10 hover:border-blue-400/50'
                  : 'bg-[#0D1A13] border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC] truncate">
                  Leche Hoy
                </p>
                <div className="p-1.5 bg-[#1F3327] text-blue-400 rounded-lg shrink-0 border border-white/10">
                  <Droplet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className={`text-2xl md:text-3xl font-bold tracking-tight ${isDairyEnabled ? 'text-[#FFFFFF]' : 'text-[#7F8C83] line-through'}`}>
                  {isDairyEnabled ? todayMilkLiters.toLocaleString() : 'OFF'}
                </span>
                <span className="text-xs text-[#A5B8AC] ml-1 font-medium">{isDairyEnabled ? 'L' : ''}</span>
              </div>
              <p className={`text-[10px] font-semibold border-t border-white/10 pt-1.5 truncate ${isDairyEnabled ? 'text-[#A5B8AC]' : 'text-rose-400'}`}>
                {isDairyEnabled ? 'Ordeño activo' : 'Módulo apagado'}
              </p>
            </motion.div>

            {/* KPI 6: GDP Promedio */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={onOpenWeightModal}
              className="bg-[#15241C] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col justify-between cursor-pointer hover:border-emerald-400/50 transition-all min-w-0 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC] truncate">
                  GDP Promedio
                </p>
                <div className="p-1.5 bg-[#1F3327] text-emerald-400 rounded-lg shrink-0 border border-white/10">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight">
                  {avgGdp.toFixed(2)}
                </span>
                <span className="text-xs text-[#A5B8AC] ml-1 font-medium">kg/d</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold border-t border-white/10 pt-1.5 truncate">
                Ceba y recría
              </p>
            </motion.div>
          </section>

          {/* Consolidated Farms Comparison Table & Interactive Cards */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#FFFFFF] tracking-tight">
                  Predios Registrados en la Ganadería
                </h2>
                <div className="group relative inline-flex items-center">
                  <button
                    type="button"
                    className="text-[#7F8C83] hover:text-[#FFFFFF] transition-colors p-0.5 rounded cursor-pointer"
                    title="Detalle comparativo por finca. Haz clic en cualquiera para abrir su ficha técnica completa."
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-64 bg-[#0D1A13] border border-white/15 text-[#FFFFFF] text-[11px] font-medium p-2.5 rounded-xl shadow-xl pointer-events-none">
                    Detalle comparativo por finca. Haz clic en cualquiera para abrir su ficha técnica completa.
                  </div>
                </div>
              </div>

              {onOpenCreateFarmModal && (
                <button
                  onClick={onOpenCreateFarmModal}
                  className="text-xs font-semibold text-[#D4A94E] hover:text-[#D8B66C] flex items-center gap-1 cursor-pointer"
                >
                  + Agregar Predio
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farms.map((farm) => {
                const badge = getProductionBadge(farm.profile.productionType);
                const farmHeads =
                  farm.headsCount ||
                  farm.profile.headsCount ||
                  farm.lots?.reduce((sum, l) => sum + l.heads, 0) ||
                  0;
                const carrying =
                  farm.profile.totalAreaHa > 0
                    ? (farmHeads / farm.profile.totalAreaHa).toFixed(2)
                    : '1.0';

                return (
                  <motion.div
                    key={farm.profile.id}
                    whileHover={{ y: -3 }}
                    className="bg-[#15241C] border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>

                        <span className="text-[11px] text-[#A5B8AC] font-mono bg-[#0D1A13] border border-white/10 px-2 py-0.5 rounded-md">
                          {farm.profile.registrationNumber || 'ICA'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#FFFFFF] mt-2.5 group-hover:text-[#D4A94E] transition-colors">
                        {farm.profile.name}
                      </h3>

                      <p className="text-xs text-[#A5B8AC] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#A5B8AC] shrink-0" />
                        <span>
                          {farm.profile.municipality}, {farm.profile.department} • {farm.profile.vereda}
                        </span>
                      </p>

                      <div className="mt-4 bg-[#1F3327] border border-white/5 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="block text-sm font-bold text-[#FFFFFF]">
                            {farm.profile.totalAreaHa} Ha
                          </span>
                          <span className="text-[10px] text-[#7F8C83] uppercase font-medium">Área</span>
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-[#FFFFFF]">
                            {farmHeads}
                          </span>
                          <span className="text-[10px] text-[#7F8C83] uppercase font-medium">Cabezas</span>
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-[#FFFFFF]">
                            {farm.paddocks?.length || 0}
                          </span>
                          <span className="text-[10px] text-[#7F8C83] uppercase font-medium">Potreros</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-[#A5B8AC] px-1">
                        <span>Carga: <strong className="text-[#FFFFFF]">{carrying} UGG/Ha</strong></span>
                        <span>Altitud: <strong className="text-[#FFFFFF]">{farm.profile.elevationMsnm} msnm</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleViewChange(farm.profile.id)}
                        className="flex-1 bg-[#123F2A] hover:bg-[#064e34] text-white text-xs font-semibold py-2.5 px-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border border-[#D4A94E]/30"
                      >
                        <span>Ver Ficha y Detalle</span>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (onSelectFarm) onSelectFarm(farm.profile.id);
                          setActiveTab('gis');
                        }}
                        className="p-2.5 bg-[#1F3327] hover:bg-[#1F3327] text-[#FFFFFF] border border-white/10 rounded-2xl transition-colors cursor-pointer"
                        title="Ver en Mapa SIG"
                      >
                        <Map className="w-4 h-4 text-[#D4A94E]" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SEGMENTED PADDOCKS BY FARM (Solo visible cuando MODO POTREROS está activo) */}
          {/* ========================================================================= */}
          {isLotsEnabled && (
            <section className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-[#FFFFFF] tracking-tight flex items-center gap-2">
                    <span>Potreros Segmentados por Predio</span>
                    <span className="text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 px-2.5 py-0.5 rounded-full">
                      {segmentedPaddocks.reduce((sum, s) => sum + s.paddocks.length, 0)} potreros
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('cattle')}
                    className="text-xs font-semibold text-[#FFFFFF] hover:bg-[#1F3327] bg-[#1F3327] px-3 py-1.5 rounded-xl border border-white/10 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Beef className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Módulo Ganado</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('gis')}
                    className="text-xs font-semibold text-white bg-[#123F2A] hover:bg-[#064e34] border border-[#D4A94E]/30 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Map className="w-3.5 h-3.5 text-[#D4A94E]" />
                    <span>Mapa SIG</span>
                  </button>
                </div>
              </div>

              {segmentedPaddocks.length === 0 ? (
                <div className="bg-[#15241C] border border-white/10 rounded-3xl p-8 text-center text-[#A5B8AC]">
                  <p className="text-sm font-medium">No se encontraron potreros para el filtro seleccionado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {segmentedPaddocks.map((seg) => (
                    <div
                      key={seg.farm.profile.id}
                      className="bg-[#15241C] rounded-3xl p-5 md:p-6 shadow-xl border border-white/10 space-y-4"
                    >
                      {/* Farm Segment Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#1F3327] text-emerald-400 rounded-xl shrink-0 border border-white/10">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-base text-[#FFFFFF]">
                                {seg.farm.profile.name}
                              </h3>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#1F3327] border border-white/10 text-[#A5B8AC]">
                                {seg.farm.profile.municipality}, {seg.farm.profile.department}
                              </span>
                              <span className="text-[10px] font-medium text-[#7F8C83]">
                                {(seg.totalPaddocksAreaHa ?? seg.totalAreaHa ?? 0).toFixed(1)} Ha en {seg.paddocks.length} potreros
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Farm Metric Pill */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="bg-rose-950/80 text-rose-300 border border-rose-800/40 px-2.5 py-1 rounded-xl font-medium">
                            {seg.occupiedCount} Ocupados ({seg.totalHeadsOccupying ?? seg.totalOccupiedHeads ?? 0} Cab)
                          </span>
                          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 px-2.5 py-1 rounded-xl font-medium">
                            {seg.readyCount} Listos
                          </span>
                          <span className="bg-amber-950/80 text-amber-300 border border-amber-800/40 px-2.5 py-1 rounded-xl font-medium">
                            {seg.restingCount} En Descanso
                          </span>
                          <button
                            onClick={() => {
                              if (onSelectFarm) onSelectFarm(seg.farm.profile.id);
                              setSelectedView(seg.farm.profile.id);
                            }}
                            className="text-[11px] font-semibold text-[#D4A94E] hover:text-[#D8B66C] px-2.5 py-1 rounded-xl bg-[#1F3327] hover:bg-[#1F3327] border border-white/10 cursor-pointer"
                          >
                            Ver Ficha →
                          </button>
                        </div>
                      </div>

                      {/* Paddocks Grid for this Farm */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {seg.paddocks.map((p) => {
                          const isOccupied = p.status === 'ocupado';
                          const isReady = p.status === 'listo';
                          const isResting = p.status === 'descanso';

                          return (
                            <div
                              key={p.id}
                              className={`p-3.5 rounded-2xl border transition-all ${
                                isOccupied
                                  ? 'bg-rose-950/30 border-rose-800/40'
                                  : isReady
                                  ? 'bg-emerald-950/30 border-emerald-800/40'
                                  : isResting
                                  ? 'bg-amber-950/30 border-amber-800/40'
                                  : 'bg-[#1F3327] border-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold font-mono bg-[#0D1A13] text-[#FFFFFF] border border-white/10 px-2 py-0.5 rounded-md">
                                  {p.code}
                                </span>
                                <span
                                  className={`text-[9.5px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                                    isOccupied
                                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40'
                                      : isReady
                                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                      : isResting
                                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                                      : 'bg-[#0D1A13] text-[#A5B8AC] border border-white/10'
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </div>

                              <div className="mt-2">
                                <h4 className="font-bold text-xs text-[#FFFFFF] truncate">{p.name}</h4>
                                <p className="text-[10px] text-[#A5B8AC] truncate mt-0.5">
                                  {p.pastureType || 'Brachiaria Brizantha'}
                                </p>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                                <span className="font-bold text-[#FFFFFF]">{p.areaHa} Ha</span>
                                {isOccupied && p.assignedLotName ? (
                                  <span className="font-semibold text-rose-300 text-[10px] truncate max-w-[110px]">
                                    {p.assignedLotName}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-[#A5B8AC]">
                                    Cap: {p.carryingCapacityUGG} UGG
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      ) : activeDetailedFarm ? (
        /* ========================================================================= */
        /* 2. VISTA DETALLADA DE LA FINCA SELECCIONADA */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Breadcrumb / Return to Consolidated View */}
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleViewChange('all')}
              className="bg-[#1F3327] hover:bg-[#1F3327] text-[#FFFFFF] border border-white/10 text-xs font-semibold px-3.5 py-2 rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4A94E]" />
              <span>← Volver a Vista Consolidada</span>
            </motion.button>

            <span className="text-xs text-[#7F8C83]">
              Predio activo en el sistema
            </span>
          </div>

          {/* Active Finca Identity Card (Ficha Técnica del Predio) */}
          <div className="bg-[#15241C] rounded-3xl p-5 md:p-6 shadow-xl border border-white/10 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-[#123F2A] text-[#D4A94E] rounded-2xl shrink-0 shadow-md border border-[#D4A94E]/30">
                  <Building className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 px-2 py-0.5 rounded-md">
                      PREDIO SELECCIONADO
                    </span>
                    {(() => {
                      const b = getProductionBadge(activeDetailedFarm.profile.productionType);
                      return (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${b.bg} ${b.text} ${b.border}`}>
                          {b.label}
                        </span>
                      );
                    })()}
                    <span className="text-xs text-[#A5B8AC] font-mono bg-[#0D1A13] px-2 py-0.5 rounded-md border border-white/10">
                      ICA: {activeDetailedFarm.profile.registrationNumber || 'Oficial'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#FFFFFF] mt-1.5 tracking-tight">
                    {activeDetailedFarm.profile.name}
                  </h2>

                  <p className="text-xs md:text-sm text-[#A5B8AC] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A5B8AC] shrink-0" />
                    <span>
                      {activeDetailedFarm.profile.municipality}, {activeDetailedFarm.profile.department} • Vereda {activeDetailedFarm.profile.vereda}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions for this specific farm */}
              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (onSelectFarm) onSelectFarm(activeDetailedFarm.profile.id);
                    onOpenNewEventModal();
                  }}
                  className="bg-[#D4A94E] hover:bg-[#D8B66C] text-[#0D1A13] text-xs md:text-sm font-bold px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#0D1A13]" />
                  <span>+ Ingresar Lote</span>
                </motion.button>

                {onOpenEditFarmModal && (
                  <button
                    onClick={() => onOpenEditFarmModal(activeDetailedFarm.profile.id)}
                    className="bg-[#1F3327] hover:bg-[#1F3327] text-[#FFFFFF] text-xs font-semibold px-3.5 py-2.5 rounded-2xl border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#A5B8AC]" />
                    <span>Editar</span>
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (onSelectFarm) onSelectFarm(activeDetailedFarm.profile.id);
                    setActiveTab('gis');
                  }}
                  className="bg-[#123F2A] hover:bg-[#064e34] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-2xl border border-[#D4A94E]/30 transition-colors flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Map className="w-4 h-4 text-[#D4A94E]" />
                  <span>Mapa SIG</span>
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                </motion.button>
              </div>
            </div>

            {/* Technical Metadata Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3.5 border-t border-white/10 text-xs">
              <div className="bg-[#1F3327] border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[#7F8C83] block text-[10px] uppercase font-medium">Propietario Legal</span>
                <span className="font-semibold text-[#FFFFFF] truncate block mt-0.5" title={activeDetailedFarm.profile.legalOwner}>
                  {activeDetailedFarm.profile.legalOwner || 'No asignado'}
                </span>
              </div>

              <div className="bg-[#1F3327] border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[#7F8C83] block text-[10px] uppercase font-medium">Código Catastral</span>
                <span className="font-mono font-semibold text-[#FFFFFF] truncate block mt-0.5">
                  {activeDetailedFarm.profile.cadastralCode || '0000000000'}
                </span>
              </div>

              <div className="bg-[#1F3327] border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[#7F8C83] block text-[10px] uppercase font-medium">Altitud</span>
                <span className="font-semibold text-[#FFFFFF] block mt-0.5">
                  {activeDetailedFarm.profile.elevationMsnm} msnm
                </span>
              </div>

              <div className="bg-[#1F3327] border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[#7F8C83] block text-[10px] uppercase font-medium">Perímetro</span>
                <span className="font-semibold text-[#FFFFFF] block font-mono mt-0.5">
                  {activeDetailedFarm.profile.totalPerimeterM?.toLocaleString() || '4,500'} m
                </span>
              </div>

              <div className="bg-[#1F3327] border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[#7F8C83] block text-[10px] uppercase font-medium">Contacto</span>
                <span className="font-semibold text-[#FFFFFF] block truncate mt-0.5">
                  {activeDetailedFarm.profile.contactPhone || '+57 310 000 0000'}
                </span>
              </div>

              <div className="bg-[#1F3327] border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[#7F8C83] block text-[10px] uppercase font-medium">Actualización</span>
                <span className="font-semibold text-[#FFFFFF] block mt-0.5">
                  {activeDetailedFarm.profile.lastUpdated || 'Hoy'}
                </span>
              </div>
            </div>
          </div>

          {/* Specific Farm Key Metrics */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Metric 1: Heads count */}
            <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 md:p-5 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC]">
                  Inventario
                </p>
                <div className="p-1.5 bg-[#1F3327] text-emerald-400 rounded-lg border border-white/10">
                  <Tractor className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight">
                  {(
                    activeDetailedFarm.headsCount ||
                    activeDetailedFarm.profile.headsCount ||
                    activeDetailedFarm.lots?.reduce((s, l) => s + l.heads, 0) ||
                    0
                  ).toLocaleString()}
                </span>
                <span className="text-xs text-[#A5B8AC] font-medium">cabezas</span>
              </div>
              <p className="text-[10px] text-[#7F8C83] mt-2 border-t border-white/10 pt-1.5">
                {activeDetailedFarm.lots?.length || 0} lotes asignados
              </p>
            </div>

            {/* Metric 2: Area & Carrying */}
            <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 md:p-5 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC]">
                  Área y Carga
                </p>
                <div className="p-1.5 bg-[#1F3327] text-emerald-400 rounded-lg border border-white/10">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight">
                  {activeDetailedFarm.profile.totalAreaHa}
                </span>
                <span className="text-xs text-[#A5B8AC] font-medium">Ha</span>
              </div>
              <p className="text-[10px] text-[#A5B8AC] mt-2 border-t border-white/10 pt-1.5">
                Carga: <strong className="text-[#FFFFFF]">{(
                  (activeDetailedFarm.headsCount || activeDetailedFarm.profile.headsCount || 100) /
                  Math.max(1, activeDetailedFarm.profile.totalAreaHa)
                ).toFixed(2)} UGG/Ha</strong>
              </p>
            </div>

            {/* Metric 3: Paddocks */}
            <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 md:p-5 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC]">
                  Potreros
                </p>
                <div className="p-1.5 bg-[#1F3327] text-teal-400 rounded-lg border border-white/10">
                  <Compass className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight">
                  {activeDetailedFarm.paddocks?.length || 0}
                </span>
                <span className="text-xs text-[#A5B8AC] font-medium">potreros</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold mt-2 border-t border-white/10 pt-1.5">
                {activeDetailedFarm.paddocks?.filter((p) => p.status === 'listo').length || 0} listos para pastoreo
              </p>
            </div>

            {/* Metric 4: Forage Availability */}
            <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 md:p-5 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5B8AC]">
                  Forraje Estimado
                </p>
                <div className="p-1.5 bg-[#1F3327] text-[#D4A94E] rounded-lg border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight">
                  {(
                    activeDetailedFarm.paddocks?.reduce((sum, p) => sum + (p.forageTotalTon || 0), 0) || 1250
                  ).toLocaleString()}
                </span>
                <span className="text-xs text-[#A5B8AC] font-medium">Ton MV</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold mt-2 border-t border-white/10 pt-1.5">
                Oferta de biomasa óptima
              </p>
            </div>
          </section>

          {/* Paddocks in this Farm (Potreros del Predio) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#FFFFFF] tracking-tight">
                  Potreros y Rotación en {activeDetailedFarm.profile.name}
                </h3>
              </div>

              <button
                onClick={() => {
                  if (onSelectFarm) onSelectFarm(activeDetailedFarm.profile.id);
                  setActiveTab('gis');
                }}
                className="text-xs font-semibold text-[#D4A94E] hover:text-[#D8B66C] flex items-center gap-1 cursor-pointer"
              >
                Abrir Mapa SIG →
              </button>
            </div>

            {activeDetailedFarm.paddocks && activeDetailedFarm.paddocks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeDetailedFarm.paddocks.map((pad) => {
                  const isReady = pad.status === 'listo';
                  const isOccupied = pad.status === 'ocupado';
                  const isRest = pad.status === 'descanso';

                  return (
                    <div
                      key={pad.id}
                      className="bg-[#15241C] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col justify-between hover:border-white/20 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs bg-[#0D1A13] text-[#FFFFFF] border border-white/10 px-2 py-0.5 rounded-md">
                            {pad.code}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase ${
                              isReady
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                : isOccupied
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40'
                                : isRest
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                                : 'bg-[#1F3327] text-blue-300 border border-blue-800/40'
                            }`}
                          >
                            {isReady
                              ? '🟢 Listo'
                              : isOccupied
                              ? '🔴 Ocupado'
                              : isRest
                              ? '🟡 Descanso'
                              : pad.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-[#FFFFFF] mt-2">
                          {pad.name}
                        </h4>

                        <p className="text-xs text-[#A5B8AC] mt-0.5">
                          {pad.pastureType}
                        </p>

                        <div className="mt-3 bg-[#1F3327] border border-white/5 p-2.5 rounded-xl grid grid-cols-3 gap-1 text-center text-xs">
                          <div>
                            <span className="block font-bold text-[#FFFFFF]">{pad.areaHa} Ha</span>
                            <span className="text-[9px] text-[#7F8C83] uppercase font-medium">Área</span>
                          </div>
                          <div>
                            <span className="block font-bold text-[#FFFFFF]">
                              {isOccupied ? `${pad.daysInOccupancy}d` : `${pad.daysInRest}d`}
                            </span>
                            <span className="text-[9px] text-[#7F8C83] uppercase font-medium">
                              {isOccupied ? 'Ocupado' : 'Descanso'}
                            </span>
                          </div>
                          <div>
                            <span className="block font-bold text-emerald-400">
                              {pad.forageYieldKgM2} kg/m²
                            </span>
                            <span className="text-[9px] text-[#7F8C83] uppercase font-medium">Aforo</span>
                          </div>
                        </div>
                      </div>

                      {pad.assignedLotName && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-[#A5B8AC] flex items-center justify-between">
                          <span className="text-[#7F8C83]">Lote:</span>
                          <strong className="text-[#FFFFFF]">{pad.assignedLotName}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#15241C] border border-white/10 rounded-3xl p-6 text-center text-[#7F8C83]">
                <p className="text-sm">No hay potreros registrados aún en este predio.</p>
                <button
                  onClick={() => setActiveTab('gis')}
                  className="mt-2 text-xs font-semibold text-[#D4A94E] hover:underline"
                >
                  + Trazar potreros en el Mapa SIG
                </button>
              </div>
            )}
          </section>

          {/* Lots & Cattle Grazing in this Farm */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#FFFFFF] tracking-tight">
                  {isLotsEnabled
                    ? `Lotes de Ganado en ${activeDetailedFarm.profile.name}`
                    : `Consolidado de Inventario en ${activeDetailedFarm.profile.name}`}
                </h3>
              </div>

              <button
                onClick={() => setActiveTab('cattle')}
                className="text-xs font-semibold text-[#D4A94E] hover:text-[#D8B66C] flex items-center gap-1 cursor-pointer"
              >
                Módulo de Ganado →
              </button>
            </div>

            {!isLotsEnabled ? (
              <div className="bg-[#15241C] rounded-3xl p-5 md:p-6 shadow-xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#1F3327] text-emerald-400 rounded-xl border border-white/10">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#FFFFFF] text-base">
                        Consolidado General: {activeDetailedFarm.profile.name}
                      </h4>
                      <p className="text-xs text-[#A5B8AC]">Manejo directo por Predio</p>
                    </div>
                  </div>
                  <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-semibold text-xs px-3 py-1 rounded-xl self-start sm:self-auto">
                    {activeDetailedFarm.headsCount} Bovinos Totales
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  <div className="bg-[#1F3327] border border-white/5 p-3 rounded-2xl">
                    <span className="text-[10px] text-[#7F8C83] uppercase font-medium block">Cabezas en Predio</span>
                    <span className="text-lg font-bold text-[#FFFFFF] mt-0.5 block">{activeDetailedFarm.headsCount} cab.</span>
                  </div>
                  <div className="bg-[#1F3327] border border-white/5 p-3 rounded-2xl">
                    <span className="text-[10px] text-[#7F8C83] uppercase font-medium block">Extensión Finca</span>
                    <span className="text-lg font-bold text-[#FFFFFF] mt-0.5 block">{activeDetailedFarm.hectares} ha</span>
                  </div>
                  <div className="bg-[#1F3327] border border-white/5 p-3 rounded-2xl">
                    <span className="text-[10px] text-[#7F8C83] uppercase font-medium block">Potreros Activos</span>
                    <span className="text-lg font-bold text-[#FFFFFF] mt-0.5 block">{activeDetailedFarm.paddocks?.length || 0} potreros</span>
                  </div>
                  <div className="bg-[#123F2A] text-white p-3 rounded-2xl border border-[#D4A94E]/30">
                    <span className="text-emerald-200 text-[10px] uppercase font-medium block">Capacidad Carga</span>
                    <span className="text-lg font-bold text-[#D4A94E] mt-0.5 block">
                      {(activeDetailedFarm.headsCount / Math.max(1, activeDetailedFarm.hectares)).toFixed(2)} UGG/ha
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenWeightModal}
                    className="w-full sm:w-auto text-xs font-semibold bg-[#123F2A] text-white hover:bg-[#064e34] border border-[#D4A94E]/30 px-4 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Scale className="w-4 h-4 text-[#D4A94E]" />
                    <span>Pesar Ganado del Predio</span>
                  </motion.button>

                  <button
                    onClick={() => setActiveTab('cattle')}
                    className="text-xs font-semibold text-[#D4A94E] hover:text-[#D8B66C] flex items-center gap-1 cursor-pointer"
                  >
                    Ver Bovinos en Ganado →
                  </button>
                </div>
              </div>
            ) : activeDetailedFarm.lots && activeDetailedFarm.lots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeDetailedFarm.lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-[#15241C] border border-white/10 rounded-2xl p-4 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold bg-[#0D1A13] text-[#FFFFFF] border border-white/10 px-2 py-0.5 rounded-md">
                            {lot.code}
                          </span>
                          <span className="text-[10px] font-medium bg-[#1F3327] text-[#A5B8AC] px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                            <Building className="w-3 h-3 text-[#A5B8AC]" />
                            {activeDetailedFarm.profile.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 px-2 py-0.5 rounded-md uppercase">
                          {lot.categoryLabel || lot.category}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#FFFFFF] mt-2">
                        {lot.name}
                      </h4>
                      <p className="text-xs text-[#A5B8AC]">{lot.sexLabel} • {lot.ageRange}</p>

                      <div className="mt-3 bg-[#1F3327] border border-white/5 p-2.5 rounded-xl grid grid-cols-3 gap-1 text-center text-xs">
                        <div>
                          <span className="block font-bold text-[#FFFFFF]">{lot.heads}</span>
                          <span className="text-[9px] text-[#7F8C83] uppercase font-medium">Cabezas</span>
                        </div>
                        <div>
                          <span className="block font-bold text-[#FFFFFF]">{lot.currentAvgWeight} kg</span>
                          <span className="text-[9px] text-[#7F8C83] uppercase font-medium">Peso Prom</span>
                        </div>
                        <div>
                          <span className="block font-bold text-emerald-400">+{lot.gdpCurrent} kg/d</span>
                          <span className="text-[9px] text-[#7F8C83] uppercase font-medium">GDP</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={onOpenWeightModal}
                        className="text-xs font-semibold text-[#D4A94E] hover:text-[#D8B66C] flex items-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5 text-[#D4A94E]" />
                        <span>Pesar Lote</span>
                      </button>

                      <span className="text-[10px] text-[#7F8C83]">
                        Meta: {lot.targetWeight} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#15241C] border border-white/10 rounded-2xl p-5 text-center text-[#7F8C83]">
                <p className="text-xs">No hay lotes específicos cargados para este predio.</p>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* MÓDULO DE HIERROS GANADEROS / MARCAS A FUEGO & PATENTES */}
      {/* ========================================================================= */}
      <div className="bg-[#15241C] rounded-3xl p-5 md:p-6 shadow-xl border border-white/10 space-y-4 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#1F3327] text-[#D4A94E] rounded-xl border border-white/10">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm md:text-base font-bold text-[#FFFFFF]">
                  Hierros Ganaderos y Registro de Marcas
                </h2>
                <span className="bg-[#1F3327] text-[#A5B8AC] border border-white/10 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {brandingIrons.length} {brandingIrons.length === 1 ? 'Hierro' : 'Hierros'}
                </span>
              </div>
              <p className="text-xs text-[#A5B8AC] mt-0.5">
                Registro oficial de marcas a fuego, patentes ganaderas y ubicación anatómica en bovinos.
              </p>
            </div>
          </div>

          {brandingIrons.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenRegisterBrandingIronModal}
              className="px-3 py-1.5 bg-[#123F2A] hover:bg-[#064e34] text-white border border-[#D4A94E]/30 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-md"
            >
              <Flame className="w-3.5 h-3.5 text-[#D4A94E]" />
              <span>+ Registrar Hierro</span>
            </motion.button>
          )}
        </div>

        {brandingIrons.length === 0 ? (
          <div className="p-6 bg-[#0D1A13] border border-white/10 rounded-2xl text-center space-y-1.5">
            <Flame className="w-6 h-6 text-[#D4A94E] mx-auto" />
            <p className="text-xs font-semibold text-[#FFFFFF]">No hay hierros de marcar registrados en el sistema</p>
            <p className="text-[11px] text-[#A5B8AC]">
              Registra los hierros de tu ganadería para asignarlos automáticamente en los nacimientos y compras.
            </p>
            <button
              onClick={onOpenRegisterBrandingIronModal}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#123F2A] text-white border border-[#D4A94E]/30 text-xs font-semibold rounded-xl hover:bg-[#064e34] transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#D4A94E]" />
              <span>Registrar Primer Hierro</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {brandingIrons.map((iron) => (
              <motion.div
                key={iron.id}
                whileHover={{ y: -2 }}
                className="bg-[#1F3327] border border-white/10 hover:border-white/20 rounded-2xl p-3.5 space-y-2.5 transition-all relative group"
              >
                {/* Top Iron Stamp Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Stamp Badge / Photo */}
                    {iron.imageUrl ? (
                      <div className="w-10 h-10 rounded-xl border border-[#D4A94E]/50 overflow-hidden bg-black shadow-xs shrink-0 relative group/photo">
                        <img src={iron.imageUrl} alt={iron.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#0D1A13] border border-[#D4A94E]/40 p-0.5 flex flex-col items-center justify-center text-center shadow-xs shrink-0">
                        <span className="text-xs leading-none font-bold text-[#D4A94E]">
                          {iron.symbolIcon || '🔥'}
                        </span>
                        <span className="text-[8px] font-mono font-bold text-[#FFFFFF] tracking-wider uppercase">
                          {iron.code}
                        </span>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-[#FFFFFF] leading-tight">
                        {iron.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="bg-[#0D1A13] border border-white/10 text-[#A5B8AC] text-[8.5px] font-mono font-medium px-1.5 py-0.2 rounded">
                          Cod: {iron.code}
                        </span>
                        <span className={`text-[8.5px] font-semibold px-1.5 py-0.2 rounded border ${
                          iron.type === 'ventanilla'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/40'
                            : iron.type === 'sanitario'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-700/40'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/40'
                        }`}>
                          {iron.type === 'ventanilla'
                            ? 'Ventanilla'
                            : iron.type === 'sanitario'
                            ? 'Sanitario'
                            : 'Propiedad'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {onEditBrandingIron && (
                      <button
                        onClick={() => onEditBrandingIron(iron)}
                        className="p-1 hover:bg-white/10 text-[#A5B8AC] hover:text-[#FFFFFF] rounded-lg transition-colors cursor-pointer"
                        title="Editar Hierro"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                    {onDeleteBrandingIron && (
                      <button
                        onClick={() => onDeleteBrandingIron(iron.id)}
                        className="p-1 hover:bg-red-950/50 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Hierro"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Row */}
                <div className="bg-[#0D1A13] p-2.5 rounded-xl border border-white/10 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#7F8C83] font-medium uppercase text-[8.5px]">Ubicación:</span>
                    <strong className="text-[#FFFFFF] font-semibold">{iron.bodyLocation}</strong>
                  </div>
                  {iron.registrationNumber && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#7F8C83] font-medium uppercase text-[8.5px]">Registro ICA:</span>
                      <span className="font-mono font-medium text-[#FFFFFF]">{iron.registrationNumber}</span>
                    </div>
                  )}
                  {iron.farmName && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#7F8C83] font-medium uppercase text-[8.5px]">Predio:</span>
                      <span className="font-medium text-[#FFFFFF]">{iron.farmName}</span>
                    </div>
                  )}
                </div>

                {iron.notes && (
                  <p className="text-[10px] text-[#A5B8AC] italic line-clamp-2 bg-[#0D1A13]/60 border border-white/5 p-1.5 rounded-lg">
                    "{iron.notes}"
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
