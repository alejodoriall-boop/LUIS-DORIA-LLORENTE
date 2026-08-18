import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MainTab, RecentActivity, SanitarioAlert, FarmDataPackage, BrandingIron } from '../types';
import { CowIcon } from './icons/CowIcon';
import { GanaderIALogo } from './GanaderIALogo';
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
          bg: 'bg-[#c1ecd4]',
          text: 'text-[#012d1d]',
          border: 'border-[#86af99]',
        };
      case 'cria':
        return {
          label: 'Cría y Levante',
          bg: 'bg-[#ffdeac]',
          text: 'text-[#523700]',
          border: 'border-[#e0b064]',
        };
      case 'doble_proposito':
        return {
          label: 'Doble Propósito',
          bg: 'bg-emerald-100',
          text: 'text-emerald-900',
          border: 'border-emerald-300',
        };
      case 'lecheria_especializada':
        return {
          label: 'Lechería Especializada',
          bg: 'bg-blue-100',
          text: 'text-blue-900',
          border: 'border-blue-300',
        };
      case 'genetica_pura':
        return {
          label: 'Genética & Cabaña',
          bg: 'bg-amber-100',
          text: 'text-amber-900',
          border: 'border-amber-300',
        };
      default:
        return {
          label: 'Ganadería Integral',
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
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
      {/* Top Banner & Quick Actions Bar */}
      <div className="bg-gradient-to-br from-[#043825] via-[#074730] to-[#043825] p-5 md:p-6 rounded-3xl text-white shadow-[0_8px_30px_rgba(4,56,37,0.18)] border border-white/[0.08] relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#facc15]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-3">
          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenNewEventModal('compra')}
              className="bg-[#facc15] hover:bg-[#ebd00a] text-slate-950 font-bold text-xs h-8 px-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-900" />
              <span>Nuevo Registro</span>
            </motion.button>

            {onOpenPendingActivitiesModal && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenPendingActivitiesModal}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-semibold text-xs h-8 px-2.5 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer relative shrink-0"
                title="Abrir Reporte Operativo de Actividades Diarias Pendientes"
              >
                <ClipboardList className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tareas</span>
                {pendingActivitiesCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
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
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-semibold text-xs h-8 px-2.5 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Heart className="w-3.5 h-3.5 text-rose-300" />
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
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-semibold text-xs h-8 px-2.5 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
              <span>Plan Sanitario</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onOpenWeightModal}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-semibold text-xs h-8 px-2.5 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Scale className="w-3.5 h-3.5 text-amber-300" />
              <span>Pesaje</span>
            </motion.button>

            {onOpenWhatsAppModal && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={onOpenWhatsAppModal}
                className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-100 backdrop-blur-md font-semibold text-xs h-8 px-2.5 rounded-xl border border-[#25D366]/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Vincular Asistente de WhatsApp y Probar Bot"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Bot</span>
              </motion.button>
            )}

            {onOpenFarmManagerModal && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenFarmManagerModal}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-semibold text-xs h-8 px-2.5 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Administrar fincas"
              >
                <Settings className="w-3.5 h-3.5 text-slate-300" />
                <span>Gestionar</span>
              </motion.button>
            )}

            {onOpenCreateFarmModal && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenCreateFarmModal}
                className="bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-100 font-semibold text-xs h-8 px-2.5 rounded-xl border border-emerald-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Building className="w-3.5 h-3.5 text-emerald-300" />
                <span>+ Finca</span>
              </motion.button>
            )}

            {onOpenRegisterBrandingIronModal && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={onOpenRegisterBrandingIronModal}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-semibold text-xs h-8 px-2.5 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Registrar nuevo Hierro o Marca a Fuego"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Hierro</span>
              </motion.button>
            )}
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 self-start md:self-auto">
            <GanaderIALogo variant="banner" size="lg" theme="dark" />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-3.5 mt-3.5 border-t border-white/10 flex items-center gap-2.5 flex-wrap">
          <span className="bg-[#facc15] text-slate-900 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-lg shadow-xs">
            SISTEMA OFICIAL
          </span>
          <span className="text-xs md:text-sm text-emerald-100/90 font-medium">
            {totalFarmsCount} {totalFarmsCount === 1 ? 'Predio Activo' : 'Predios Activos'} • {uniqueDepartments.join(', ')}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIRECT ACCESS SELECTOR CARDS FOR ALL FINCAS / PREDIOS & CATEGORY FILTER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/[0.06] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
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
                    ? 'bg-[#043825] text-[#facc15] shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
                title={
                  isLotsEnabled
                    ? 'Modo POTREROS Activo: Muestra la discriminación detallada potrero por potrero. Haz clic para volver a Modo Predios.'
                    : 'Modo PREDIOS Activo por Defecto. Haz clic para activar el Modo Potreros y ver el desglose por potrero.'
                }
              >
                {isLotsEnabled ? (
                  <Layers className="w-3.5 h-3.5 text-[#facc15]" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span>Manejo:</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${isLotsEnabled ? 'bg-[#facc15] text-slate-950' : 'bg-slate-900 text-white'}`}>
                  {isLotsEnabled ? 'POTREROS' : 'PREDIOS'}
                </span>
              </button>
            )}

            <button
              onClick={() => handleViewChange('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedView === 'all'
                  ? 'bg-[#043825] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#facc15]" />
              <span>Todas (Consolidado)</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs (Apple pill style) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
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
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {catKey === 'all' && <Layers className="w-3.5 h-3.5 text-[#facc15]" />}
                {catKey === 'ceba' && <Beef className="w-3.5 h-3.5 text-emerald-600" />}
                {catKey === 'cria' && <Baby className="w-3.5 h-3.5 text-amber-600" />}
                {catKey === 'leche' && <Droplet className="w-3.5 h-3.5 text-blue-600" />}
                {catKey === 'genetica' && <Dna className="w-3.5 h-3.5 text-purple-600" />}
                <span>{def.shortLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${isSelected ? 'bg-slate-100 text-slate-800' : 'bg-slate-200 text-slate-600'}`}>
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
                ? 'bg-[#043825] text-white shadow-[0_8px_20px_rgba(4,56,37,0.2)] border border-[#043825]'
                : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
                    selectedView === 'all'
                      ? 'bg-white/15 text-[#facc15]'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  CONSOLIDADO
                </span>
                {selectedView === 'all' && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#facc15]" /> Activo
                  </span>
                )}
              </div>
              <h3 className={`text-base font-bold mt-2.5 leading-tight ${selectedView === 'all' ? 'text-white' : 'text-slate-900'}`}>
                Todas las Fincas
              </h3>
              <p className={`text-xs mt-0.5 ${selectedView === 'all' ? 'text-emerald-100/70' : 'text-slate-500'}`}>
                {totalFarmsCount} predios operando
              </p>
            </div>

            <div className={`mt-3.5 pt-3 border-t grid grid-cols-3 gap-1 text-center ${
              selectedView === 'all' ? 'border-white/10' : 'border-slate-200'
            }`}>
              <div>
                <span className={`block font-bold text-xs ${selectedView === 'all' ? 'text-[#facc15]' : 'text-slate-900'}`}>
                  {totalConsolidatedAreaHa.toLocaleString()}
                </span>
                <span className={`text-[9.5px] uppercase font-medium ${selectedView === 'all' ? 'text-emerald-100/70' : 'text-slate-400'}`}>
                  Ha
                </span>
              </div>
              <div>
                <span className={`block font-bold text-xs ${selectedView === 'all' ? 'text-[#facc15]' : 'text-slate-900'}`}>
                  {totalConsolidatedHeads.toLocaleString()}
                </span>
                <span className={`text-[9.5px] uppercase font-medium ${selectedView === 'all' ? 'text-emerald-100/70' : 'text-slate-400'}`}>
                  Cabezas
                </span>
              </div>
              <div>
                <span className={`block font-bold text-xs ${selectedView === 'all' ? 'text-[#facc15]' : 'text-slate-900'}`}>
                  {totalConsolidatedPaddocks}
                </span>
                <span className={`text-[9.5px] uppercase font-medium ${selectedView === 'all' ? 'text-emerald-100/70' : 'text-slate-400'}`}>
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
                    ? 'bg-[#043825] text-white shadow-[0_8px_20px_rgba(4,56,37,0.2)] border border-[#043825]'
                    : 'bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md truncate max-w-[130px] ${
                        isSelected
                          ? 'bg-white/15 text-emerald-200'
                          : `${badge.bg} ${badge.text}`
                      }`}
                    >
                      {badge.label}
                    </span>

                    {isSelected ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#facc15] shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Seleccionada
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" /> {farm.profile.department}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-bold mt-2.5 leading-snug truncate ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}>
                    {farm.profile.name}
                  </h3>

                  <p className={`text-xs mt-0.5 truncate flex items-center gap-1 ${
                    isSelected ? 'text-emerald-100/70' : 'text-slate-500'
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
                          isSelected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {CATEGORY_DEFINITIONS[cat]?.shortLabel || cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`mt-3.5 pt-3 border-t grid grid-cols-3 gap-1 text-center ${
                  isSelected ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <div>
                    <span className={`block font-bold text-xs ${isSelected ? 'text-[#facc15]' : 'text-slate-900'}`}>
                      {farm.profile.totalAreaHa}
                    </span>
                    <span className={`text-[9.5px] uppercase font-medium ${isSelected ? 'text-emerald-100/70' : 'text-slate-400'}`}>
                      Ha
                    </span>
                  </div>
                  <div>
                    <span className={`block font-bold text-xs ${isSelected ? 'text-[#facc15]' : 'text-slate-900'}`}>
                      {farmHeads}
                    </span>
                    <span className={`text-[9.5px] uppercase font-medium ${isSelected ? 'text-emerald-100/70' : 'text-slate-400'}`}>
                      Cabezas
                    </span>
                  </div>
                  <div>
                    <span className={`block font-bold text-xs ${isSelected ? 'text-[#facc15]' : 'text-slate-900'}`}>
                      {farm.paddocks?.length || 0}
                    </span>
                    <span className={`text-[9.5px] uppercase font-medium ${isSelected ? 'text-emerald-100/70' : 'text-slate-400'}`}>
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
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/[0.06] relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Balance Global
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {totalFarmsCount} Unidades Productivas en {uniqueDepartments.length} Departamentos
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-2 text-slate-900">
                  Operación Ganadera Consolidada
                </h2>
                <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-3xl">
                  Totalizando <strong className="text-slate-900">{totalConsolidatedAreaHa.toLocaleString()} Hectáreas</strong> y un hato de <strong className="text-slate-900">{totalConsolidatedHeads.toLocaleString()} cabezas</strong> distribuidas en <strong className="text-slate-900">{totalConsolidatedPaddocks} potreros</strong> georreferenciados.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveTab('gis')}
                  className="bg-[#043825] hover:bg-[#064e34] text-white font-semibold text-xs md:text-sm px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Map className="w-4 h-4 text-[#facc15]" />
                  <span>Explorar Mapa SIG</span>
                  <ChevronRight className="w-4 h-4 text-emerald-200" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Key Consolidated Metrics (6 KPIs) */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
            {/* KPI 1: Predios Activos */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  Predios
                </p>
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                  <Building className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {totalFarmsCount}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-medium">fincas</span>
              </div>
              <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 truncate">
                {uniqueDepartments.join(', ')}
              </p>
            </div>

            {/* KPI 2: Inventario Consolidado */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  Hato Total
                </p>
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                  <Tractor className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {totalConsolidatedHeads.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-medium">cabezas</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold border-t border-slate-100 pt-1.5 truncate">
                100% inventariado
              </p>
            </div>

            {/* KPI 3: Área Total */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  Área Total
                </p>
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {totalConsolidatedAreaHa.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-medium">Ha</span>
              </div>
              <p className="text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 truncate">
                Carga: <strong className="text-slate-800">{globalCarryingCapacity} UGG/Ha</strong>
              </p>
            </div>

            {/* KPI 4: Potreros Totales */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  Potreros SIG
                </p>
                <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg shrink-0">
                  <Compass className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {totalConsolidatedPaddocks}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-medium">divisiones</span>
              </div>
              <p className="text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 truncate">
                Rotación PRV activa
              </p>
            </div>

            {/* KPI 5: Producción Leche */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={isDairyEnabled ? onOpenMilkingModal : onToggleDairyModule}
              className={`rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all cursor-pointer min-w-0 overflow-hidden ${
                isDairyEnabled
                  ? 'bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md'
                  : 'bg-slate-100 border border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  Leche Hoy
                </p>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Droplet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className={`text-2xl md:text-3xl font-bold tracking-tight ${isDairyEnabled ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                  {isDairyEnabled ? todayMilkLiters.toLocaleString() : 'OFF'}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-medium">{isDairyEnabled ? 'L' : ''}</span>
              </div>
              <p className={`text-[10px] font-semibold border-t border-slate-100 pt-1.5 truncate ${isDairyEnabled ? 'text-slate-500' : 'text-rose-600'}`}>
                {isDairyEnabled ? 'Ordeño activo' : 'Módulo apagado'}
              </p>
            </motion.div>

            {/* KPI 6: GDP Promedio */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={onOpenWeightModal}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all min-w-0 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                  GDP Promedio
                </p>
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2 truncate">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {avgGdp.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-medium">kg/d</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold border-t border-slate-100 pt-1.5 truncate">
                Ceba y recría
              </p>
            </motion.div>
          </section>

          {/* Consolidated Farms Comparison Table & Interactive Cards */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Predios Registrados en la Ganadería
                </h2>
                <div className="group relative inline-flex items-center">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded cursor-pointer"
                    title="Detalle comparativo por finca. Haz clic en cualquiera para abrir su ficha técnica completa."
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-64 bg-slate-900 text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl pointer-events-none">
                    Detalle comparativo por finca. Haz clic en cualquiera para abrir su ficha técnica completa.
                  </div>
                </div>
              </div>

              {onOpenCreateFarmModal && (
                <button
                  onClick={onOpenCreateFarmModal}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
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
                    className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>

                        <span className="text-[11px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                          {farm.profile.registrationNumber || 'ICA'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-2.5 group-hover:text-emerald-800 transition-colors">
                        {farm.profile.name}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {farm.profile.municipality}, {farm.profile.department} • {farm.profile.vereda}
                        </span>
                      </p>

                      <div className="mt-4 bg-slate-50 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="block text-sm font-bold text-slate-900">
                            {farm.profile.totalAreaHa} Ha
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">Área</span>
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-900">
                            {farmHeads}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">Cabezas</span>
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-900">
                            {farm.paddocks?.length || 0}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">Potreros</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
                        <span>Carga: <strong className="text-slate-800">{carrying} UGG/Ha</strong></span>
                        <span>Altitud: <strong className="text-slate-800">{farm.profile.elevationMsnm} msnm</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleViewChange(farm.profile.id)}
                        className="flex-1 bg-[#043825] hover:bg-[#064e34] text-white text-xs font-semibold py-2.5 px-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Ver Ficha y Detalle</span>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (onSelectFarm) onSelectFarm(farm.profile.id);
                          setActiveTab('gis');
                        }}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
                        title="Ver en Mapa SIG"
                      >
                        <Map className="w-4 h-4 text-slate-600" />
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
            <section className="space-y-4 border-t border-slate-200 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Potreros Segmentados por Predio</span>
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {segmentedPaddocks.reduce((sum, s) => sum + s.paddocks.length, 0)} potreros
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('cattle')}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Beef className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Módulo Ganado</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('gis')}
                    className="text-xs font-semibold text-white bg-[#043825] hover:bg-[#064e34] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Map className="w-3.5 h-3.5 text-[#facc15]" />
                    <span>Mapa SIG</span>
                  </button>
                </div>
              </div>

              {segmentedPaddocks.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
                  <p className="text-sm font-medium">No se encontraron potreros para el filtro seleccionado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {segmentedPaddocks.map((seg) => (
                    <div
                      key={seg.farm.profile.id}
                      className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/[0.06] space-y-4"
                    >
                      {/* Farm Segment Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl shrink-0">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-base text-slate-900">
                                {seg.farm.profile.name}
                              </h3>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {seg.farm.profile.municipality}, {seg.farm.profile.department}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400">
                                {(seg.totalPaddocksAreaHa ?? seg.totalAreaHa ?? 0).toFixed(1)} Ha en {seg.paddocks.length} potreros
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Farm Metric Pill */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-xl font-medium">
                            {seg.occupiedCount} Ocupados ({seg.totalHeadsOccupying ?? seg.totalOccupiedHeads ?? 0} Cab)
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl font-medium">
                            {seg.readyCount} Listos
                          </span>
                          <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl font-medium">
                            {seg.restingCount} En Descanso
                          </span>
                          <button
                            onClick={() => {
                              if (onSelectFarm) onSelectFarm(seg.farm.profile.id);
                              setSelectedView(seg.farm.profile.id);
                            }}
                            className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer"
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
                                  ? 'bg-rose-50/40 border-rose-100'
                                  : isReady
                                  ? 'bg-emerald-50/40 border-emerald-100'
                                  : isResting
                                  ? 'bg-amber-50/30 border-amber-100'
                                  : 'bg-slate-50 border-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold font-mono bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                  {p.code}
                                </span>
                                <span
                                  className={`text-[9.5px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                                    isOccupied
                                      ? 'bg-rose-100 text-rose-800'
                                      : isReady
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isResting
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </div>

                              <div className="mt-2">
                                <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                  {p.pastureType || 'Brachiaria Brizantha'}
                                </p>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-800">{p.areaHa} Ha</span>
                                {isOccupied && p.assignedLotName ? (
                                  <span className="font-semibold text-rose-700 text-[10px] truncate max-w-[110px]">
                                    {p.assignedLotName}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500">
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
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-800" />
              <span>← Volver a Vista Consolidada</span>
            </motion.button>

            <span className="text-xs text-slate-400">
              Predio activo en el sistema
            </span>
          </div>

          {/* Active Finca Identity Card (Ficha Técnica del Predio) */}
          <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/[0.06] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-[#043825] text-[#facc15] rounded-2xl shrink-0 shadow-xs">
                  <Building className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                      PREDIO SELECCIONADO
                    </span>
                    {(() => {
                      const b = getProductionBadge(activeDetailedFarm.profile.productionType);
                      return (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${b.bg} ${b.text}`}>
                          {b.label}
                        </span>
                      );
                    })()}
                    <span className="text-xs text-slate-400 font-mono">
                      ICA: {activeDetailedFarm.profile.registrationNumber || 'Oficial'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
                    {activeDetailedFarm.profile.name}
                  </h2>

                  <p className="text-xs md:text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                  className="bg-[#facc15] hover:bg-[#ebd00a] text-slate-950 text-xs md:text-sm font-bold px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-900" />
                  <span>+ Ingresar Lote</span>
                </motion.button>

                {onOpenEditFarmModal && (
                  <button
                    onClick={() => onOpenEditFarmModal(activeDetailedFarm.profile.id)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2.5 rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600" />
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
                  className="bg-[#043825] hover:bg-[#064e34] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-2xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Map className="w-4 h-4 text-[#facc15]" />
                  <span>Mapa SIG</span>
                  <ChevronRight className="w-4 h-4 text-emerald-200" />
                </motion.button>
              </div>
            </div>

            {/* Technical Metadata Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3.5 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Propietario Legal</span>
                <span className="font-semibold text-slate-900 truncate block mt-0.5" title={activeDetailedFarm.profile.legalOwner}>
                  {activeDetailedFarm.profile.legalOwner || 'No asignado'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Código Catastral</span>
                <span className="font-mono font-semibold text-slate-900 truncate block mt-0.5">
                  {activeDetailedFarm.profile.cadastralCode || '0000000000'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Altitud</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {activeDetailedFarm.profile.elevationMsnm} msnm
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Perímetro</span>
                <span className="font-semibold text-slate-900 block font-mono mt-0.5">
                  {activeDetailedFarm.profile.totalPerimeterM?.toLocaleString() || '4,500'} m
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Contacto</span>
                <span className="font-semibold text-slate-900 block truncate mt-0.5">
                  {activeDetailedFarm.profile.contactPhone || '+57 310 000 0000'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Actualización</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {activeDetailedFarm.profile.lastUpdated || 'Hoy'}
                </span>
              </div>
            </div>
          </div>

          {/* Specific Farm Key Metrics */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Metric 1: Heads count */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Inventario
                </p>
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Tractor className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {(
                    activeDetailedFarm.headsCount ||
                    activeDetailedFarm.profile.headsCount ||
                    activeDetailedFarm.lots?.reduce((s, l) => s + l.heads, 0) ||
                    0
                  ).toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-medium">cabezas</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
                {activeDetailedFarm.lots?.length || 0} lotes asignados
              </p>
            </div>

            {/* Metric 2: Area & Carrying */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Área y Carga
                </p>
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {activeDetailedFarm.profile.totalAreaHa}
                </span>
                <span className="text-xs text-slate-500 font-medium">Ha</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 border-t border-slate-100 pt-1.5">
                Carga: <strong className="text-slate-800">{(
                  (activeDetailedFarm.headsCount || activeDetailedFarm.profile.headsCount || 100) /
                  Math.max(1, activeDetailedFarm.profile.totalAreaHa)
                ).toFixed(2)} UGG/Ha</strong>
              </p>
            </div>

            {/* Metric 3: Paddocks */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Potreros
                </p>
                <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                  <Compass className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {activeDetailedFarm.paddocks?.length || 0}
                </span>
                <span className="text-xs text-slate-500 font-medium">potreros</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold mt-2 border-t border-slate-100 pt-1.5">
                {activeDetailedFarm.paddocks?.filter((p) => p.status === 'listo').length || 0} listos para pastoreo
              </p>
            </div>

            {/* Metric 4: Forage Availability */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Forraje Estimado
                </p>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {(
                    activeDetailedFarm.paddocks?.reduce((sum, p) => sum + (p.forageTotalTon || 0), 0) || 1250
                  ).toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-medium">Ton MV</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold mt-2 border-t border-slate-100 pt-1.5">
                Oferta de biomasa óptima
              </p>
            </div>
          </section>

          {/* Paddocks in this Farm (Potreros del Predio) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Potreros y Rotación en {activeDetailedFarm.profile.name}
                </h3>
              </div>

              <button
                onClick={() => {
                  if (onSelectFarm) onSelectFarm(activeDetailedFarm.profile.id);
                  setActiveTab('gis');
                }}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
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
                      className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">
                            {pad.code}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase ${
                              isReady
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOccupied
                                ? 'bg-rose-100 text-rose-800'
                                : isRest
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
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

                        <h4 className="font-bold text-sm text-slate-900 mt-2">
                          {pad.name}
                        </h4>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {pad.pastureType}
                        </p>

                        <div className="mt-3 bg-slate-50 p-2.5 rounded-xl grid grid-cols-3 gap-1 text-center text-xs">
                          <div>
                            <span className="block font-bold text-slate-900">{pad.areaHa} Ha</span>
                            <span className="text-[9px] text-slate-400 uppercase font-medium">Área</span>
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900">
                              {isOccupied ? `${pad.daysInOccupancy}d` : `${pad.daysInRest}d`}
                            </span>
                            <span className="text-[9px] text-slate-400 uppercase font-medium">
                              {isOccupied ? 'Ocupado' : 'Descanso'}
                            </span>
                          </div>
                          <div>
                            <span className="block font-bold text-emerald-600">
                              {pad.forageYieldKgM2} kg/m²
                            </span>
                            <span className="text-[9px] text-slate-400 uppercase font-medium">Aforo</span>
                          </div>
                        </div>
                      </div>

                      {pad.assignedLotName && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                          <span className="text-slate-400">Lote:</span>
                          <strong className="text-slate-900">{pad.assignedLotName}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-slate-400">
                <p className="text-sm">No hay potreros registrados aún en este predio.</p>
                <button
                  onClick={() => setActiveTab('gis')}
                  className="mt-2 text-xs font-semibold text-emerald-800 hover:underline"
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
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {isLotsEnabled
                    ? `Lotes de Ganado en ${activeDetailedFarm.profile.name}`
                    : `Consolidado de Inventario en ${activeDetailedFarm.profile.name}`}
                </h3>
              </div>

              <button
                onClick={() => setActiveTab('cattle')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
              >
                Módulo de Ganado →
              </button>
            </div>

            {!isLotsEnabled ? (
              <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/[0.06]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        Consolidado General: {activeDetailedFarm.profile.name}
                      </h4>
                      <p className="text-xs text-slate-500">Manejo directo por Predio</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-900 font-semibold text-xs px-3 py-1 rounded-xl self-start sm:self-auto">
                    {activeDetailedFarm.headsCount} Bovinos Totales
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Cabezas en Predio</span>
                    <span className="text-lg font-bold text-slate-900 mt-0.5 block">{activeDetailedFarm.headsCount} cab.</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Extensión Finca</span>
                    <span className="text-lg font-bold text-slate-900 mt-0.5 block">{activeDetailedFarm.hectares} ha</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Potreros Activos</span>
                    <span className="text-lg font-bold text-slate-900 mt-0.5 block">{activeDetailedFarm.paddocks?.length || 0} potreros</span>
                  </div>
                  <div className="bg-[#043825] text-white p-3 rounded-2xl">
                    <span className="text-emerald-200 text-[10px] uppercase font-medium block">Capacidad Carga</span>
                    <span className="text-lg font-bold text-[#facc15] mt-0.5 block">
                      {(activeDetailedFarm.headsCount / Math.max(1, activeDetailedFarm.hectares)).toFixed(2)} UGG/ha
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenWeightModal}
                    className="w-full sm:w-auto text-xs font-semibold bg-[#043825] text-white hover:bg-[#064e34] px-4 py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Scale className="w-4 h-4 text-[#facc15]" />
                    <span>Pesar Ganado del Predio</span>
                  </motion.button>

                  <button
                    onClick={() => setActiveTab('cattle')}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
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
                    className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                            {lot.code}
                          </span>
                          <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-500" />
                            {activeDetailedFarm.profile.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md uppercase">
                          {lot.categoryLabel || lot.category}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 mt-2">
                        {lot.name}
                      </h4>
                      <p className="text-xs text-slate-500">{lot.sexLabel} • {lot.ageRange}</p>

                      <div className="mt-3 bg-slate-50 p-2.5 rounded-xl grid grid-cols-3 gap-1 text-center text-xs">
                        <div>
                          <span className="block font-bold text-slate-900">{lot.heads}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-medium">Cabezas</span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">{lot.currentAvgWeight} kg</span>
                          <span className="text-[9px] text-slate-400 uppercase font-medium">Peso Prom</span>
                        </div>
                        <div>
                          <span className="block font-bold text-emerald-600">+{lot.gdpCurrent} kg/d</span>
                          <span className="text-[9px] text-slate-400 uppercase font-medium">GDP</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={onOpenWeightModal}
                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Pesar Lote</span>
                      </button>

                      <span className="text-[10px] text-slate-400">
                        Meta: {lot.targetWeight} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center text-slate-400">
                <p className="text-xs">No hay lotes específicos cargados para este predio.</p>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* MÓDULO DE HIERROS GANADEROS / MARCAS A FUEGO & PATENTES */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/[0.06] space-y-4 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm md:text-base font-bold text-slate-900">
                  Hierros Ganaderos y Registro de Marcas
                </h2>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {brandingIrons.length} {brandingIrons.length === 1 ? 'Hierro' : 'Hierros'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro oficial de marcas a fuego, patentes ganaderas y ubicación anatómica en bovinos.
              </p>
            </div>
          </div>

          {brandingIrons.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenRegisterBrandingIronModal}
              className="px-3 py-1.5 bg-[#043825] hover:bg-[#064e34] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 text-[#facc15]" />
              <span>+ Registrar Hierro</span>
            </motion.button>
          )}
        </div>

        {brandingIrons.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-1.5">
            <Flame className="w-6 h-6 text-amber-500 mx-auto" />
            <p className="text-xs font-semibold text-slate-900">No hay hierros de marcar registrados en el sistema</p>
            <p className="text-[11px] text-slate-500">
              Registra los hierros de tu ganadería para asignarlos automáticamente en los nacimientos y compras.
            </p>
            <button
              onClick={onOpenRegisterBrandingIronModal}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#043825] text-white text-xs font-semibold rounded-xl hover:bg-[#064e34] transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#facc15]" />
              <span>Registrar Primer Hierro</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {brandingIrons.map((iron) => (
              <motion.div
                key={iron.id}
                whileHover={{ y: -2 }}
                className="bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3.5 space-y-2.5 transition-all relative group"
              >
                {/* Top Iron Stamp Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Stamp Badge / Photo */}
                    {iron.imageUrl ? (
                      <div className="w-10 h-10 rounded-xl border border-amber-300 overflow-hidden bg-black shadow-xs shrink-0 relative group/photo">
                        <img src={iron.imageUrl} alt={iron.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-400/40 p-0.5 flex flex-col items-center justify-center text-center shadow-xs shrink-0">
                        <span className="text-xs leading-none font-bold text-amber-300">
                          {iron.symbolIcon || '🔥'}
                        </span>
                        <span className="text-[8px] font-mono font-bold text-white tracking-wider uppercase">
                          {iron.code}
                        </span>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {iron.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="bg-slate-200 text-slate-700 text-[8.5px] font-mono font-medium px-1.5 py-0.2 rounded">
                          Cod: {iron.code}
                        </span>
                        <span className={`text-[8.5px] font-semibold px-1.5 py-0.2 rounded ${
                          iron.type === 'ventanilla'
                            ? 'bg-amber-100 text-amber-900'
                            : iron.type === 'sanitario'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-emerald-100 text-emerald-900'
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
                        className="p-1 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Editar Hierro"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                    {onDeleteBrandingIron && (
                      <button
                        onClick={() => onDeleteBrandingIron(iron.id)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Hierro"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Row */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium uppercase text-[8.5px]">Ubicación:</span>
                    <strong className="text-slate-800 font-semibold">{iron.bodyLocation}</strong>
                  </div>
                  {iron.registrationNumber && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium uppercase text-[8.5px]">Registro ICA:</span>
                      <span className="font-mono font-medium text-slate-800">{iron.registrationNumber}</span>
                    </div>
                  )}
                  {iron.farmName && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium uppercase text-[8.5px]">Predio:</span>
                      <span className="font-medium text-slate-800">{iron.farmName}</span>
                    </div>
                  )}
                </div>

                {iron.notes && (
                  <p className="text-[10px] text-slate-500 italic line-clamp-2 bg-white/60 p-1.5 rounded-lg">
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
