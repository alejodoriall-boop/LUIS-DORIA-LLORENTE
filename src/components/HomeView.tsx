import React, { useState, useMemo } from 'react';
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
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      {/* Top Welcome & Quick Actions Bar with Official GanaderIA Logo */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-gradient-to-r from-[#012d1d] via-[#083d28] to-[#012d1d] p-5 md:p-6 rounded-3xl border border-[#1b4332] shadow-lg text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#ffba38] text-[#523700] text-[9.5px] font-mono font-black uppercase px-2 py-0.5 rounded shadow-2xs">
              SISTEMA OFICIAL
            </span>
            <span className="text-xs text-[#a3c9b4] font-medium">
              {totalFarmsCount} {totalFarmsCount === 1 ? 'Predio Activo' : 'Predios Activos'} • {uniqueDepartments.join(', ')}
            </span>
          </div>
          <GanaderIALogo variant="banner" size="lg" theme="dark" />
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto flex-wrap">
          {onOpenFarmManagerModal && (
            <button
              onClick={onOpenFarmManagerModal}
              className="bg-[#f0f4f1] hover:bg-[#e2eae4] text-[#012d1d] font-bold text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Administrar fincas"
            >
              <Settings className="w-4 h-4 text-[#2d6a4f]" />
              <span>Gestionar</span>
            </button>
          )}

          {onOpenCreateFarmModal && (
            <button
              onClick={onOpenCreateFarmModal}
              className="bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs md:text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-[#2d6a4f]"
            >
              <Building className="w-4 h-4 text-[#ffba38]" />
              <span>+ Crear Finca</span>
            </button>
          )}

          <button
            onClick={() => onOpenNewEventModal('compra')}
            className="bg-[#ffba38] text-[#523700] hover:brightness-95 font-extrabold text-xs md:text-sm px-4 py-2.5 rounded-xl tactical-shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Registro</span>
          </button>

          {/* ACCESOS RÁPIDOS DIRECTOS: MONTA, SANIDAD Y PESAJE */}
          <button
            type="button"
            onClick={() => onOpenNewEventModal('monta')}
            className="bg-[#083d28] hover:bg-[#0c4e34] border border-[#2d6a4f] hover:border-pink-400 text-white font-bold text-xs md:text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
          >
            <Heart className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            <span>Monta & Inseminación</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewEventModal('health')}
            className="bg-[#083d28] hover:bg-[#0c4e34] border border-[#2d6a4f] hover:border-rose-400 text-white font-bold text-xs md:text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
          >
            <Stethoscope className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>Sanidad</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewEventModal('weigh')}
            className="bg-[#083d28] hover:bg-[#0c4e34] border border-[#2d6a4f] hover:border-amber-400 text-white font-bold text-xs md:text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
          >
            <Scale className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Pesaje</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DIRECT ACCESS SELECTOR CARDS FOR ALL FINCAS / PREDIOS & CATEGORY FILTER */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-4 md:p-5 card-shadow space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#012d1d] text-[#c1ecd4] rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-[#012d1d]">
                Acceso Rápido a Predios y Filtro de Inventario
              </h2>
              <p className="text-xs text-[#717973]">
                Filtra por categoría productiva (Ceba, Cría, Lechería, Genética) para ver únicamente los predios que poseen dichos inventarios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => handleViewChange('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedView === 'all'
                  ? 'bg-[#012d1d] text-white shadow-sm ring-2 ring-[#012d1d]/30'
                  : 'bg-[#f4fbf7] text-[#012d1d] hover:bg-[#c1ecd4]/50 border border-[#c1c8c2]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#ffba38]" />
              <span>Ver Todas (Consolidado)</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#f3f6f4] p-1.5 rounded-2xl border border-[#d6e2db]">
          <span className="text-[11px] font-bold text-[#012d1d] px-2.5 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#2d6a4f]" />
            Inventario:
          </span>

          {(['all', 'ceba', 'cria', 'leche', 'genetica'] as ProductionCategoryKey[]).map((catKey) => {
            const def = CATEGORY_DEFINITIONS[catKey];
            const isSelected = selectedCategory === catKey;
            const count = filterFarmsByCategory(farms, catKey).length;

            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? `${def.colorBg} ${def.colorText} shadow-xs ring-1 ring-[#012d1d]`
                    : 'bg-white text-[#414844] hover:bg-[#eaf1ec] hover:text-[#012d1d] border border-[#c1c8c2]'
                }`}
              >
                {catKey === 'all' && <Layers className="w-3.5 h-3.5 text-[#ffba38]" />}
                {catKey === 'ceba' && <Beef className="w-3.5 h-3.5 text-[#ffba38]" />}
                {catKey === 'cria' && <Baby className="w-3.5 h-3.5 text-[#ffdbcf]" />}
                {catKey === 'leche' && <Droplet className="w-3.5 h-3.5 text-[#caf0f8]" />}
                {catKey === 'genetica' && <Dna className="w-3.5 h-3.5 text-[#ffe082]" />}
                <span>{def.shortLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${isSelected ? 'bg-white/20 text-white' : 'bg-[#e2e8f0] text-[#1a1c1c]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fincas Selector Grid (Filtered by Category) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 0: VISTA CONSOLIDADA (TODAS LAS FINCAS) */}
          <div
            onClick={() => handleViewChange('all')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
              selectedView === 'all'
                ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-md ring-2 ring-[#ffba38]'
                : 'bg-[#f9fbf9] hover:bg-[#edf7f2] border-[#c1c8c2] text-[#012d1d] hover:border-[#2d6a4f]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono ${
                    selectedView === 'all'
                      ? 'bg-[#1b4332] text-[#ffba38] border border-[#ffba38]/30'
                      : 'bg-[#012d1d] text-[#c1ecd4]'
                  }`}
                >
                  EMPRESA GANADERA
                </span>
                {selectedView === 'all' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#c1ecd4]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ffba38]" /> Activo
                  </span>
                )}
              </div>
              <h3 className={`text-base font-extrabold mt-2 leading-tight ${selectedView === 'all' ? 'text-white' : 'text-[#012d1d]'}`}>
                📊 Todas las Fincas
              </h3>
              <p className={`text-xs mt-0.5 ${selectedView === 'all' ? 'text-[#c1ecd4]/80' : 'text-[#717973]'}`}>
                Consolidado de {totalFarmsCount} predios
              </p>
            </div>

            <div className={`mt-3 pt-2.5 border-t grid grid-cols-3 gap-1 text-center ${
              selectedView === 'all' ? 'border-[#1b4332]' : 'border-[#e2e8f0]'
            }`}>
              <div>
                <span className={`block font-mono font-bold text-xs ${selectedView === 'all' ? 'text-[#ffba38]' : 'text-[#012d1d]'}`}>
                  {totalConsolidatedAreaHa.toLocaleString()}
                </span>
                <span className={`text-[9px] uppercase font-medium ${selectedView === 'all' ? 'text-[#c1ecd4]/70' : 'text-[#717973]'}`}>
                  Ha Totales
                </span>
              </div>
              <div>
                <span className={`block font-mono font-bold text-xs ${selectedView === 'all' ? 'text-[#ffba38]' : 'text-[#012d1d]'}`}>
                  {totalConsolidatedHeads.toLocaleString()}
                </span>
                <span className={`text-[9px] uppercase font-medium ${selectedView === 'all' ? 'text-[#c1ecd4]/70' : 'text-[#717973]'}`}>
                  Cabezas
                </span>
              </div>
              <div>
                <span className={`block font-mono font-bold text-xs ${selectedView === 'all' ? 'text-[#ffba38]' : 'text-[#012d1d]'}`}>
                  {totalConsolidatedPaddocks}
                </span>
                <span className={`text-[9px] uppercase font-medium ${selectedView === 'all' ? 'text-[#c1ecd4]/70' : 'text-[#717973]'}`}>
                  Potreros
                </span>
              </div>
            </div>
          </div>

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
              <div
                key={farm.profile.id}
                onClick={() => handleViewChange(farm.profile.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                  isSelected
                    ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-md ring-2 ring-[#ffba38]'
                    : 'bg-white hover:bg-[#f4fbf7] border-[#c1c8c2] text-[#012d1d] hover:border-[#2d6a4f]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded truncate max-w-[130px] border ${
                        isSelected
                          ? 'bg-[#1b4332] text-[#c1ecd4] border-[#c1ecd4]/30'
                          : `${badge.bg} ${badge.text} ${badge.border}`
                      }`}
                    >
                      {badge.label}
                    </span>

                    {isSelected ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#ffba38] shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Seleccionada
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#717973] flex items-center gap-0.5 shrink-0">
                        <MapPin className="w-3 h-3 text-[#2d6a4f]" /> {farm.profile.department}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-extrabold mt-2 leading-snug truncate ${
                    isSelected ? 'text-white' : 'text-[#012d1d]'
                  }`}>
                    {farm.profile.name}
                  </h3>

                  <p className={`text-xs mt-0.5 truncate flex items-center gap-1 ${
                    isSelected ? 'text-[#c1ecd4]/80' : 'text-[#717973]'
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
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#eef4f0] text-[#1b4332]'
                        }`}
                      >
                        {CATEGORY_DEFINITIONS[cat]?.shortLabel || cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`mt-3 pt-2.5 border-t grid grid-cols-3 gap-1 text-center ${
                  isSelected ? 'border-[#1b4332]' : 'border-[#e2e8f0]'
                }`}>
                  <div>
                    <span className={`block font-mono font-bold text-xs ${isSelected ? 'text-[#ffba38]' : 'text-[#012d1d]'}`}>
                      {farm.profile.totalAreaHa}
                    </span>
                    <span className={`text-[9px] uppercase font-medium ${isSelected ? 'text-[#c1ecd4]/70' : 'text-[#717973]'}`}>
                      Ha
                    </span>
                  </div>
                  <div>
                    <span className={`block font-mono font-bold text-xs ${isSelected ? 'text-[#ffba38]' : 'text-[#012d1d]'}`}>
                      {farmHeads}
                    </span>
                    <span className={`text-[9px] uppercase font-medium ${isSelected ? 'text-[#c1ecd4]/70' : 'text-[#717973]'}`}>
                      Cabezas
                    </span>
                  </div>
                  <div>
                    <span className={`block font-mono font-bold text-xs ${isSelected ? 'text-[#ffba38]' : 'text-[#012d1d]'}`}>
                      {farm.paddocks?.length || 0}
                    </span>
                    <span className={`text-[9px] uppercase font-medium ${isSelected ? 'text-[#c1ecd4]/70' : 'text-[#717973]'}`}>
                      Potreros
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MÓDULO DE HIERROS GANADEROS / MARCAS A FUEGO & PATENTES */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-[#012d1d] rounded-2xl p-4 md:p-5 card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-[#012d1d] to-[#120b07] text-[#ffba38] rounded-2xl shadow-md border border-[#ffba38]/30">
              <Flame className="w-5 h-5 text-[#ffba38]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm md:text-base font-black text-[#012d1d]">
                  Hierros Ganaderos y Registro de Marcas
                </h2>
                <span className="bg-[#e8f5ec] text-[#012d1d] border border-[#a5d6a7] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                  {brandingIrons.length} {brandingIrons.length === 1 ? 'Hierro Registrado' : 'Hierros Registrados'}
                </span>
              </div>
              <p className="text-xs text-[#717973]">
                Registro oficial de marcas a fuego, patentes ganaderas y ubicación anatómica en bovinos.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRegisterBrandingIronModal}
            className="bg-[#012d1d] text-white hover:bg-[#1b4332] font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <Flame className="w-4 h-4 text-[#ffba38]" />
            <span>+ Registrar Hierro</span>
          </button>
        </div>

        {brandingIrons.length === 0 ? (
          <div className="p-6 bg-[#f9fbf9] border border-dashed border-[#a5d6a7] rounded-2xl text-center space-y-2">
            <Flame className="w-8 h-8 text-[#a5d6a7] mx-auto" />
            <p className="text-xs font-bold text-[#012d1d]">No hay hierros de marcar registrados en el sistema</p>
            <p className="text-[11px] text-[#717973]">
              Registra los hierros de tu ganadería para asignarlos automáticamente en los nacimientos y compras.
            </p>
            <button
              onClick={onOpenRegisterBrandingIronModal}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#012d1d] text-white text-xs font-bold rounded-xl hover:bg-[#1b4332] transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#ffba38]" />
              <span>Registrar Primer Hierro</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {brandingIrons.map((iron) => (
              <div
                key={iron.id}
                className="bg-gradient-to-br from-[#fafcfb] to-[#f4f7f5] border-2 border-[#c1c8c2] hover:border-[#012d1d] rounded-2xl p-3.5 space-y-3 transition-all relative group shadow-xs hover:shadow-md"
              >
                {/* Top Iron Stamp Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Stamp Badge / Photo */}
                    {iron.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl border-2 border-[#ffba38] overflow-hidden bg-black shadow-md shrink-0 relative group/photo">
                        <img src={iron.imageUrl} alt={iron.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold">Foto</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2a1b12] to-[#120b07] border-2 border-[#ffba38] p-0.5 flex flex-col items-center justify-center text-center shadow-md shrink-0">
                        <span className="text-lg leading-none font-black text-[#ffba38] drop-shadow-[0_1px_2px_rgba(255,186,56,0.6)]">
                          {iron.symbolIcon || '🔥'}
                        </span>
                        <span className="text-[9px] font-mono font-black text-white tracking-wider uppercase">
                          {iron.code}
                        </span>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-extrabold text-[#012d1d] leading-tight">
                        {iron.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="bg-[#012d1d] text-[#c1ecd4] text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded">
                          Cod: {iron.code}
                        </span>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                          iron.type === 'ventanilla'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : iron.type === 'sanitario'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {iron.type === 'ventanilla'
                            ? '⚡ Ventanilla'
                            : iron.type === 'sanitario'
                            ? '💉 Sanitario'
                            : '🔥 Propiedad'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {onEditBrandingIron && (
                      <button
                        onClick={() => onEditBrandingIron(iron)}
                        className="p-1.5 hover:bg-[#e2eae4] text-[#012d1d] rounded-lg transition-colors cursor-pointer"
                        title="Editar Hierro"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteBrandingIron && (
                      <button
                        onClick={() => onDeleteBrandingIron(iron.id)}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Hierro"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Row */}
                <div className="bg-white p-2.5 rounded-xl border border-[#d6e2db] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#717973] font-bold uppercase text-[9.5px]">📍 Ubicación:</span>
                    <strong className="text-[#012d1d] font-bold">{iron.bodyLocation}</strong>
                  </div>
                  {iron.registrationNumber && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#717973] font-bold uppercase text-[9.5px]">📜 Registro ICA/RUP:</span>
                      <span className="font-mono font-bold text-[#012d1d]">{iron.registrationNumber}</span>
                    </div>
                  )}
                  {iron.farmName && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#717973] font-bold uppercase text-[9.5px]">🏡 Predio:</span>
                      <span className="font-medium text-[#012d1d]">{iron.farmName}</span>
                    </div>
                  )}
                </div>

                {iron.notes && (
                  <p className="text-[10.5px] text-[#555d58] italic line-clamp-2 bg-[#f0f4f1] p-1.5 rounded-lg border border-[#e2eae4]">
                    "{iron.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
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
          <div className="bg-gradient-to-r from-[#012d1d] via-[#1b4332] to-[#2d6a4f] rounded-2xl p-5 md:p-6 text-white card-shadow relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#ffba38] text-[#523700] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Vista Consolidada Total
                  </span>
                  <span className="text-xs text-[#c1ecd4] font-semibold">
                    {totalFarmsCount} Fincas Productivas en {uniqueDepartments.length} Departamentos
                  </span>
                </div>
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight mt-2 text-white">
                  Balance General de la Operación Ganadera
                </h2>
                <p className="text-xs md:text-sm text-[#c1ecd4] mt-1 max-w-3xl">
                  Totalizando <strong className="text-white">{totalConsolidatedAreaHa.toLocaleString()} Hectáreas</strong> y un hato ganadero global de <strong className="text-white">{totalConsolidatedHeads.toLocaleString()} cabezas</strong> distribuidas en <strong className="text-white">{totalConsolidatedPaddocks} potreros</strong> georreferenciados.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setActiveTab('gis')}
                  className="bg-[#ffba38] hover:bg-[#fcc419] text-[#523700] font-extrabold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Map className="w-4 h-4" />
                  <span>Explorar Mapa SIG</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Key Consolidated Metrics (6 KPIs) */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {/* KPI 1: Predios Activos */}
            <div className="bg-white border border-[#c1c8c2] rounded-2xl p-4 card-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#79564b]">
                  Predios Activos
                </p>
                <Building className="w-4 h-4 text-[#2d6a4f]" />
              </div>
              <div className="my-2">
                <span className="text-2xl md:text-3xl font-extrabold text-[#012d1d] font-mono">
                  {totalFarmsCount}
                </span>
                <span className="text-xs text-[#414844] ml-1 font-medium">fincas</span>
              </div>
              <p className="text-[10px] text-[#717973] border-t border-[#f0f0f0] pt-1 truncate">
                {uniqueDepartments.join(', ')}
              </p>
            </div>

            {/* KPI 2: Inventario Consolidado */}
            <div className="bg-white border border-[#c1c8c2] rounded-2xl p-4 card-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#79564b]">
                  Hato Total
                </p>
                <Tractor className="w-4 h-4 text-[#012d1d]" />
              </div>
              <div className="my-2">
                <span className="text-2xl md:text-3xl font-extrabold text-[#012d1d] font-mono">
                  {totalConsolidatedHeads.toLocaleString()}
                </span>
                <span className="text-xs text-[#414844] ml-1 font-medium">cabezas</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-bold border-t border-[#f0f0f0] pt-1 truncate">
                100% inventariado
              </p>
            </div>

            {/* KPI 3: Área Total */}
            <div className="bg-white border border-[#c1c8c2] rounded-2xl p-4 card-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#79564b]">
                  Área Ganadera
                </p>
                <MapPin className="w-4 h-4 text-[#012d1d]" />
              </div>
              <div className="my-2">
                <span className="text-2xl md:text-3xl font-extrabold text-[#012d1d] font-mono">
                  {totalConsolidatedAreaHa.toLocaleString()}
                </span>
                <span className="text-xs text-[#414844] ml-1 font-medium">Ha</span>
              </div>
              <p className="text-[10px] text-[#717973] border-t border-[#f0f0f0] pt-1 truncate">
                Carga: {globalCarryingCapacity} UGG/Ha
              </p>
            </div>

            {/* KPI 4: Potreros Totales */}
            <div className="bg-white border border-[#c1c8c2] rounded-2xl p-4 card-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#79564b]">
                  Potreros SIG
                </p>
                <Compass className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="my-2">
                <span className="text-2xl md:text-3xl font-extrabold text-[#012d1d] font-mono">
                  {totalConsolidatedPaddocks}
                </span>
                <span className="text-xs text-[#414844] ml-1 font-medium">divisiones</span>
              </div>
              <p className="text-[10px] text-[#717973] border-t border-[#f0f0f0] pt-1 truncate">
                Rotación PRV activa
              </p>
            </div>

            {/* KPI 5: Producción Leche */}
            <div
              onClick={onOpenMilkingModal}
              className="bg-white border border-[#c1c8c2] rounded-2xl p-4 card-shadow flex flex-col justify-between cursor-pointer hover:border-[#012d1d] transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#79564b]">
                  Leche (Hoy)
                </p>
                <Droplet className="w-4 h-4 text-blue-600" />
              </div>
              <div className="my-2">
                <span className="text-2xl md:text-3xl font-extrabold text-[#012d1d] font-mono">
                  {todayMilkLiters.toLocaleString()}
                </span>
                <span className="text-xs text-[#414844] ml-1 font-medium">L</span>
              </div>
              <p className="text-[10px] text-[#717973] border-t border-[#f0f0f0] pt-1 truncate">
                Lechería y D.P.
              </p>
            </div>

            {/* KPI 6: GDP Promedio */}
            <div
              onClick={onOpenWeightModal}
              className="bg-white border border-[#c1c8c2] rounded-2xl p-4 card-shadow flex flex-col justify-between cursor-pointer hover:border-[#012d1d] transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#79564b]">
                  GDP Promedio
                </p>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="my-2">
                <span className="text-2xl md:text-3xl font-extrabold text-[#012d1d] font-mono">
                  {avgGdp.toFixed(2)}
                </span>
                <span className="text-xs text-[#414844] ml-1 font-medium">kg/d</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-bold border-t border-[#f0f0f0] pt-1 truncate">
                Ceba y recría
              </p>
            </div>
          </section>

          {/* Consolidated Farms Comparison Table & Interactive Cards */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#012d1d] tracking-tight">
                  Predios Registrados en la Ganadería
                </h2>
                <p className="text-xs text-[#717973]">
                  Detalle comparativo por finca. Haz clic en cualquiera para abrir su ficha técnica completa.
                </p>
              </div>

              {onOpenCreateFarmModal && (
                <button
                  onClick={onOpenCreateFarmModal}
                  className="text-xs font-bold text-[#012d1d] hover:underline flex items-center gap-1"
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
                  <div
                    key={farm.profile.id}
                    className="bg-white border border-[#c1c8c2] rounded-2xl p-5 card-shadow flex flex-col justify-between hover:border-[#012d1d] transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>

                        <span className="text-xs text-[#717973] font-mono bg-[#f4f4f4] px-2 py-0.5 rounded border border-[#e5e5e5]">
                          {farm.profile.registrationNumber || 'ICA'}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-[#012d1d] mt-2 group-hover:text-[#1b4332] transition-colors">
                        {farm.profile.name}
                      </h3>

                      <p className="text-xs text-[#414844] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0" />
                        <span>
                          {farm.profile.municipality}, {farm.profile.department} • {farm.profile.vereda}
                        </span>
                      </p>

                      <div className="mt-3.5 bg-[#f9fbf9] border border-[#e5e7eb] rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="block text-sm font-bold text-[#012d1d] font-mono">
                            {farm.profile.totalAreaHa} Ha
                          </span>
                          <span className="text-[10px] text-[#717973] uppercase">Área</span>
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-[#012d1d] font-mono">
                            {farmHeads} Cab
                          </span>
                          <span className="text-[10px] text-[#717973] uppercase">Hato</span>
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-[#012d1d] font-mono">
                            {farm.paddocks?.length || 0}
                          </span>
                          <span className="text-[10px] text-[#717973] uppercase">Potreros</span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-[#717973] px-1">
                        <span>Carga: <strong className="text-[#012d1d]">{carrying} UGG/Ha</strong></span>
                        <span>Elevación: <strong className="text-[#012d1d]">{farm.profile.elevationMsnm} msnm</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex items-center gap-2">
                      <button
                        onClick={() => handleViewChange(farm.profile.id)}
                        className="flex-1 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>Ver Ficha y Detalle</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectFarm) onSelectFarm(farm.profile.id);
                          setActiveTab('gis');
                        }}
                        className="p-2 bg-[#f4fbf7] hover:bg-[#c1ecd4] text-[#012d1d] border border-[#c1c8c2] rounded-xl transition-colors cursor-pointer"
                        title="Ver en Mapa SIG"
                      >
                        <Map className="w-4 h-4 text-[#2d6a4f]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Critical Alerts Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alert 1: Plan Sanitario */}
            <div className="bg-[#ffdad6] text-[#93000a] rounded-2xl p-4 md:p-5 border-l-4 border-[#ba1a1a] card-shadow flex items-start gap-3">
              <div className="bg-[#ba1a1a] text-white p-2 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base md:text-lg text-[#ba1a1a]">Plan Sanitario General</h3>
                  <span className="text-[10px] font-mono uppercase bg-[#ba1a1a] text-white px-2 py-0.5 rounded font-bold">
                    Urgente
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[#93000a] mt-1 font-medium">
                  Ciclo de Vacunación Fiebre Aftosa y Brucelosis programado en 3 días (Lotes Ceba y Cría).
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-2 text-xs font-bold text-[#ba1a1a] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Ver protocolo sanitario completo →
                </button>
              </div>
            </div>

            {/* Alert 2: Tiempos de Retiro */}
            <div
              onClick={onOpenWithdrawalModal}
              className="bg-[#ffdeac] text-[#604100] rounded-2xl p-4 md:p-5 border-l-4 border-[#523700] card-shadow flex items-start gap-3 cursor-pointer hover:brightness-95 transition-all"
            >
              <div className="bg-[#523700] text-[#ffdeac] p-2 rounded-xl shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base md:text-lg text-[#523700]">Tiempos de Retiro de Fármacos</h3>
                  <span className="text-[10px] font-mono uppercase bg-[#523700] text-[#ffdeac] px-2 py-0.5 rounded font-bold">
                    5 Animales
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[#604100] mt-1 font-medium">
                  5 animales bajo control de inocuidad por antibióticos y desparasitantes en ordeño y ceba.
                </p>
                <span className="mt-2 text-xs font-bold text-[#523700] inline-flex items-center gap-1 underline">
                  Ver detalle de animales y días restantes →
                </span>
              </div>
            </div>
          </section>

          {/* Quick Access Functional Modules */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Module 1: Inventarios de Ganado */}
            <button
              onClick={() => setActiveTab('cattle')}
              className="bg-[#012d1d] text-white rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 card-shadow hover:bg-[#1b4332] active:scale-98 transition-all min-h-[120px] group text-left cursor-pointer"
            >
              <div className="bg-[#1b4332] text-[#c1ecd4] p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <CowIcon className="w-6 h-6 text-[#ffba38]" />
              </div>
              <span className="font-bold text-base md:text-lg tracking-tight">Inventarios de Ganado</span>
              <span className="text-[11px] text-[#86af99] text-center font-normal">
                Ceba, Cría & Levante, Pesaje y Lotes
              </span>
            </button>

            {/* Module 2: Lechería */}
            <button
              onClick={() => setActiveTab('dairy')}
              className="bg-white border-2 border-[#012d1d] text-[#012d1d] rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 card-shadow hover:bg-[#eeeeee] active:scale-98 transition-all min-h-[120px] group text-left cursor-pointer"
            >
              <div className="bg-[#c1ecd4] text-[#012d1d] p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6" />
              </div>
              <span className="font-bold text-base md:text-lg tracking-tight">Lechería</span>
              <span className="text-[11px] text-[#414844] text-center font-normal">
                Control Ordeño, Curvas y Partos
              </span>
            </button>

            {/* Module 3: Genética */}
            <button
              onClick={() => setActiveTab('genetics')}
              className="bg-white border-2 border-[#012d1d] text-[#012d1d] rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 card-shadow hover:bg-[#eeeeee] active:scale-98 transition-all min-h-[120px] group text-left cursor-pointer"
            >
              <div className="bg-[#fed0c1] text-[#79564b] p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Dna className="w-6 h-6" />
              </div>
              <span className="font-bold text-base md:text-lg tracking-tight">Genética</span>
              <span className="text-[11px] text-[#414844] text-center font-normal">
                Pedigrí, DEPs y Biotecnología
              </span>
            </button>

            {/* Module 4: SIG & Potreros */}
            <button
              onClick={() => setActiveTab('gis')}
              className="bg-white border-2 border-[#1b4332] text-[#012d1d] rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 card-shadow hover:bg-[#c1ecd4]/20 active:scale-98 transition-all min-h-[120px] group text-left cursor-pointer"
            >
              <div className="bg-[#1b4332] text-[#ffba38] p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6" />
              </div>
              <span className="font-bold text-base md:text-lg tracking-tight">SIG & Potreros</span>
              <span className="text-[11px] text-[#414844] text-center font-normal">
                Georreferenciación y Aforos
              </span>
            </button>
          </section>

          {/* ========================================================================= */}
          {/* SEGMENTED PADDOCKS BY FARM (Potreros Segmentados por Predio) */}
          {/* ========================================================================= */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#012d1d] tracking-tight flex items-center gap-2">
                  <span>🌱 Potreros Segmentados por Finca / Predio</span>
                  <span className="text-xs font-mono font-bold bg-[#c1ecd4] text-[#012d1d] px-2 py-0.5 rounded-full">
                    {segmentedPaddocks.reduce((sum, s) => sum + s.paddocks.length, 0)} potreros
                  </span>
                </h2>
                <p className="text-xs text-[#717973]">
                  Distribución de pastos, ocupación y aforos por cada una de tus unidades de producción.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('cattle')}
                  className="text-xs font-bold text-[#012d1d] hover:underline flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#c1c8c2]"
                >
                  <Beef className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <span>Ver en Módulo Ganado</span>
                </button>
                <button
                  onClick={() => setActiveTab('gis')}
                  className="text-xs font-bold text-white bg-[#012d1d] hover:bg-[#1b4332] px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Map className="w-3.5 h-3.5 text-[#ffba38]" />
                  <span>Abrir Mapa SIG</span>
                </button>
              </div>
            </div>

            {segmentedPaddocks.length === 0 ? (
              <div className="bg-white border border-[#c1c8c2] rounded-3xl p-8 text-center text-[#717973]">
                <p className="text-sm font-semibold">No se encontraron potreros para el filtro seleccionado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {segmentedPaddocks.map((seg) => (
                  <div
                    key={seg.farm.profile.id}
                    className="bg-white border-2 border-[#c1c8c2] rounded-3xl p-4 md:p-5 card-shadow space-y-3.5"
                  >
                    {/* Farm Segment Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8ede9] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-[#012d1d] text-[#ffba38] rounded-xl shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-base text-[#012d1d]">
                              {seg.farm.profile.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e8f5ec] text-[#1b4332] border border-[#c1ecd4]">
                              {seg.farm.profile.municipality}, {seg.farm.profile.department}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#717973]">
                              {(seg.totalPaddocksAreaHa ?? seg.totalAreaHa ?? 0).toFixed(1)} Ha en {seg.paddocks.length} potreros
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Farm Metric Pill */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="bg-[#ffdad6] text-[#ba1a1a] px-2.5 py-1 rounded-xl font-bold font-mono">
                          {seg.occupiedCount} Ocupados ({seg.totalHeadsOccupying ?? seg.totalOccupiedHeads ?? 0} Cab)
                        </span>
                        <span className="bg-[#c1ecd4] text-[#002114] px-2.5 py-1 rounded-xl font-bold font-mono">
                          {seg.readyCount} Listos
                        </span>
                        <span className="bg-[#fff3d6] text-[#523700] px-2.5 py-1 rounded-xl font-bold font-mono">
                          {seg.restingCount} En Descanso
                        </span>
                        <button
                          onClick={() => {
                            if (onSelectFarm) onSelectFarm(seg.farm.profile.id);
                            setSelectedView(seg.farm.profile.id);
                          }}
                          className="text-[11px] font-bold text-[#012d1d] hover:bg-[#eaf4ee] px-2.5 py-1 rounded-xl border border-[#c1c8c2] cursor-pointer"
                        >
                          Ver Ficha Predio →
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
                            className={`p-3 rounded-2xl border transition-all ${
                              isOccupied
                                ? 'bg-[#fff8f7] border-[#ffdad6]'
                                : isReady
                                ? 'bg-[#f4fbf7] border-[#c1ecd4]'
                                : isResting
                                ? 'bg-[#fcfdfa] border-[#e2e8f0]'
                                : 'bg-[#fafafa] border-[#e0e0e0]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold bg-[#012d1d] text-[#ffba38] px-2 py-0.5 rounded">
                                {p.code}
                              </span>
                              <span
                                className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                  isOccupied
                                    ? 'bg-[#ba1a1a] text-white'
                                    : isReady
                                    ? 'bg-emerald-700 text-white'
                                    : isResting
                                    ? 'bg-[#523700] text-white'
                                    : 'bg-gray-600 text-white'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>

                            <div className="mt-2">
                              <h4 className="font-bold text-xs text-[#012d1d] truncate">{p.name}</h4>
                              <p className="text-[10px] text-[#717973] truncate">
                                {p.pastureType || 'Brachiaria Brizantha'}
                              </p>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between text-[11px]">
                              <span className="font-mono font-bold text-[#012d1d]">{p.areaHa} Ha</span>
                              {isOccupied && p.assignedLotName ? (
                                <span className="font-bold text-[#ba1a1a] text-[10px] truncate max-w-[110px]">
                                  🐄 {p.assignedLotName}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-[#523700]">
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

          {/* Consolidated Activity Feed */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-[#012d1d] tracking-tight">
                Últimos Registros y Eventos de la Ganadería
              </h2>
              <button
                onClick={onOpenNewEventModal}
                className="text-xs font-bold text-[#012d1d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Registrar Evento
              </button>
            </div>

            <div className="bg-white border border-[#c1c8c2] rounded-2xl overflow-hidden card-shadow">
              <div className="divide-y divide-[#c1c8c2]">
                {activities.slice(0, 6).map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 md:p-4 flex items-center justify-between hover:bg-[#f3f3f3] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-xl p-2.5 flex items-center justify-center shrink-0 ${
                          act.category === 'birth'
                            ? 'bg-[#ffdeac] text-[#523700]'
                            : act.category === 'weigh'
                            ? 'bg-[#c1ecd4] text-[#012d1d]'
                            : act.category === 'dairy'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-[#fed0c1] text-[#79564b]'
                        }`}
                      >
                        {act.category === 'birth' ? (
                          <Baby className="w-4 h-4" />
                        ) : act.category === 'weigh' ? (
                          <Scale className="w-4 h-4" />
                        ) : act.category === 'dairy' ? (
                          <Droplet className="w-4 h-4" />
                        ) : (
                          <HeartPulse className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#1a1c1c]">{act.title}</p>
                        <p className="text-xs text-[#717973] mt-0.5">{act.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs md:text-sm font-bold text-[#79564b] bg-[#f3f3f3] px-2 py-1 rounded-lg border border-[#e8e8e8]">
                        {act.weightOrMetric}
                      </span>
                      <p className="text-[10px] text-[#717973] mt-1 hidden sm:block">
                        {act.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : activeDetailedFarm ? (
        /* ========================================================================= */
        /* 2. VISTA DETALLADA DE LA FINCA SELECCIONADA */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Breadcrumb / Return to Consolidated View */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleViewChange('all')}
              className="bg-white hover:bg-[#f0f4f1] text-[#012d1d] border border-[#c1c8c2] text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#2d6a4f]" />
              <span>← Volver a Vista Consolidada (Todas las Fincas)</span>
            </button>

            <span className="text-xs text-[#717973]">
              Predio activo en el sistema
            </span>
          </div>

          {/* Active Finca Identity Card (Ficha Técnica del Predio) */}
          <div className="bg-[#f4fbf7] border-2 border-[#012d1d] rounded-2xl p-5 md:p-6 card-shadow space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3.5 bg-[#012d1d] text-[#ffba38] rounded-2xl shrink-0 shadow-sm">
                  <Building className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase bg-[#012d1d] text-[#c1ecd4] px-2.5 py-0.5 rounded font-mono">
                      PREDIO SELECCIONADO
                    </span>
                    {(() => {
                      const b = getProductionBadge(activeDetailedFarm.profile.productionType);
                      return (
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${b.bg} ${b.text} ${b.border}`}>
                          {b.label}
                        </span>
                      );
                    })()}
                    <span className="text-xs text-[#717973] font-mono">
                      Registro: {activeDetailedFarm.profile.registrationNumber || 'ICA'}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-[#012d1d] mt-1.5 tracking-tight">
                    {activeDetailedFarm.profile.name}
                  </h2>

                  <p className="text-xs md:text-sm text-[#414844] flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-[#2d6a4f] shrink-0" />
                    <span>
                      {activeDetailedFarm.profile.municipality}, {activeDetailedFarm.profile.department} • Vereda {activeDetailedFarm.profile.vereda}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions for this specific farm */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (onSelectFarm) onSelectFarm(activeDetailedFarm.profile.id);
                    onOpenNewEventModal();
                  }}
                  className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] text-xs md:text-sm font-extrabold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>+ Ingresar Lote / Subasta</span>
                </button>

                {onOpenEditFarmModal && (
                  <button
                    onClick={() => onOpenEditFarmModal(activeDetailedFarm.profile.id)}
                    className="bg-white hover:bg-[#eeeeee] text-[#012d1d] border border-[#c1c8c2] text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Editar Ficha</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (onSelectFarm) onSelectFarm(activeDetailedFarm.profile.id);
                    setActiveTab('gis');
                  }}
                  className="bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Map className="w-4 h-4 text-[#ffba38]" />
                  <span>Ver Mapa SIG Satelital</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Technical Metadata Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-[#c1c8c2]/60 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/50">
                <span className="text-[#717973] block text-[10px] uppercase font-semibold">Propietario Legal</span>
                <span className="font-bold text-[#012d1d] truncate block" title={activeDetailedFarm.profile.legalOwner}>
                  {activeDetailedFarm.profile.legalOwner || 'No asignado'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/50">
                <span className="text-[#717973] block text-[10px] uppercase font-semibold">Código Catastral</span>
                <span className="font-mono font-bold text-[#012d1d] truncate block">
                  {activeDetailedFarm.profile.cadastralCode || '0000000000'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/50">
                <span className="text-[#717973] block text-[10px] uppercase font-semibold">Altitud / Relieve</span>
                <span className="font-bold text-[#012d1d] block">
                  {activeDetailedFarm.profile.elevationMsnm} msnm
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/50">
                <span className="text-[#717973] block text-[10px] uppercase font-semibold">Perímetro Total</span>
                <span className="font-bold text-[#012d1d] block font-mono">
                  {activeDetailedFarm.profile.totalPerimeterM?.toLocaleString() || '4,500'} m
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/50">
                <span className="text-[#717973] block text-[10px] uppercase font-semibold">Contacto / Teléfono</span>
                <span className="font-bold text-[#012d1d] block truncate">
                  {activeDetailedFarm.profile.contactPhone || '+57 310 000 0000'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2]/50">
                <span className="text-[#717973] block text-[10px] uppercase font-semibold">Última Actualización</span>
                <span className="font-bold text-[#012d1d] block">
                  {activeDetailedFarm.profile.lastUpdated || 'Hoy'}
                </span>
              </div>
            </div>
          </div>

          {/* Specific Farm Key Metrics */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Metric 1: Heads count */}
            <div className="bg-white border border-[#c1c8c2] rounded-2xl p-4 md:p-5 card-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#79564b]">
                  Inventario del Predio
                </p>
                <Tractor className="w-4 h-4 text-[#012d1d]" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-4xl font-extrabold text-[#012d1d] font-mono">
                  {(
                    activeDetailedFarm.headsCount ||
                    activeDetailedFarm.profile.headsCount ||
                    activeDetailedFarm.lots?.reduce((s, l) => s + l.heads, 0) ||
                    0
                  ).toLocaleString()}
                </span>
                <span className="text-xs md:text-sm font-medium text-[#414844]">cabezas</span>
              </div>
              <p className="text-[10px] text-[#717973] mt-2 border-t border-[#eeeeee] pt-1.5">
                {activeDetailedFarm.lots?.length || 0} lotes asignados
              </p>
            </div>

            {/* Metric 2: Area & Carrying */}
            <div className="bg-white border border-[#c1c8c2] rounded-2xl p-4 md:p-5 card-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#79564b]">
                  Área y Carga
                </p>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-4xl font-extrabold text-[#012d1d] font-mono">
                  {activeDetailedFarm.profile.totalAreaHa}
                </span>
                <span className="text-xs md:text-sm font-medium text-[#414844]">Ha</span>
              </div>
              <p className="text-[10px] text-[#717973] mt-2 border-t border-[#eeeeee] pt-1.5">
                Carga: {(
                  (activeDetailedFarm.headsCount || activeDetailedFarm.profile.headsCount || 100) /
                  Math.max(1, activeDetailedFarm.profile.totalAreaHa)
                ).toFixed(2)} UGG/Ha
              </p>
            </div>

            {/* Metric 3: Paddocks */}
            <div className="bg-white border border-[#c1c8c2] rounded-2xl p-4 md:p-5 card-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#79564b]">
                  Potreros y Rotación
                </p>
                <Compass className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-4xl font-extrabold text-[#012d1d] font-mono">
                  {activeDetailedFarm.paddocks?.length || 0}
                </span>
                <span className="text-xs md:text-sm font-medium text-[#414844]">potreros</span>
              </div>
              <p className="text-[10px] text-[#717973] mt-2 border-t border-[#eeeeee] pt-1.5">
                {activeDetailedFarm.paddocks?.filter((p) => p.status === 'listo').length || 0} listos para pastoreo
              </p>
            </div>

            {/* Metric 4: Forage Availability */}
            <div className="bg-white border border-[#c1c8c2] rounded-2xl p-4 md:p-5 card-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#79564b]">
                  Forraje Estimado
                </p>
                <Sparkles className="w-4 h-4 text-[#ffba38]" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl md:text-4xl font-extrabold text-[#012d1d] font-mono">
                  {(
                    activeDetailedFarm.paddocks?.reduce((sum, p) => sum + (p.forageTotalTon || 0), 0) || 1250
                  ).toLocaleString()}
                </span>
                <span className="text-xs md:text-sm font-medium text-[#414844]">Ton MV</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-bold mt-2 border-t border-[#eeeeee] pt-1.5">
                Oferta de biomasa verde óptima
              </p>
            </div>
          </section>

          {/* Paddocks in this Farm (Potreros del Predio) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#012d1d] tracking-tight">
                  Potreros y Rotación de Pastos en {activeDetailedFarm.profile.name}
                </h3>
                <p className="text-xs text-[#717973]">
                  Aforo forrajero, tipo de pasto y estado operacional de cada subdivisión.
                </p>
              </div>

              <button
                onClick={() => {
                  if (onSelectFarm) onSelectFarm(activeDetailedFarm.profile.id);
                  setActiveTab('gis');
                }}
                className="text-xs font-bold text-[#012d1d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Abrir en SIG Satelital →
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
                      className="bg-white border border-[#c1c8c2] rounded-2xl p-4 card-shadow flex flex-col justify-between hover:border-[#012d1d] transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold text-xs bg-[#012d1d] text-white px-2 py-0.5 rounded">
                            {pad.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
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
                              ? '🟡 En Descanso'
                              : pad.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-[#012d1d] mt-2">
                          {pad.name}
                        </h4>

                        <p className="text-xs text-[#717973] mt-0.5">
                          {pad.pastureType}
                        </p>

                        <div className="mt-3 bg-[#f8faf8] p-2.5 rounded-xl border border-[#e5e7eb] grid grid-cols-3 gap-1 text-center text-xs">
                          <div>
                            <span className="block font-bold text-[#012d1d] font-mono">{pad.areaHa} Ha</span>
                            <span className="text-[9px] text-[#717973] uppercase">Área</span>
                          </div>
                          <div>
                            <span className="block font-bold text-[#012d1d] font-mono">
                              {isOccupied ? `${pad.daysInOccupancy}d` : `${pad.daysInRest}d`}
                            </span>
                            <span className="text-[9px] text-[#717973] uppercase">
                              {isOccupied ? 'Ocupado' : 'Descanso'}
                            </span>
                          </div>
                          <div>
                            <span className="block font-bold text-emerald-700 font-mono">
                              {pad.forageYieldKgM2} kg/m²
                            </span>
                            <span className="text-[9px] text-[#717973] uppercase">Aforo</span>
                          </div>
                        </div>
                      </div>

                      {pad.assignedLotName && (
                        <div className="mt-2.5 pt-2 border-t border-[#f0f0f0] text-[11px] text-[#414844] flex items-center justify-between">
                          <span className="text-[#717973]">Lote:</span>
                          <strong className="text-[#012d1d]">{pad.assignedLotName}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#c1c8c2] rounded-2xl p-6 text-center text-[#717973]">
                <p className="text-sm">No hay potreros registrados aún en este predio.</p>
                <button
                  onClick={() => setActiveTab('gis')}
                  className="mt-2 text-xs font-bold text-[#012d1d] hover:underline"
                >
                  + Trazar potreros en el Mapa SIG
                </button>
              </div>
            )}
          </section>

          {/* Lots & Cattle Grazing in this Farm */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#012d1d] tracking-tight">
                  Lotes de Ganado en {activeDetailedFarm.profile.name}
                </h3>
                <p className="text-xs text-[#717973]">
                  Grupos de animales en pastoreo y ganancia diaria de peso.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('cattle')}
                className="text-xs font-bold text-[#012d1d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver Módulo de Ganado →
              </button>
            </div>

            {activeDetailedFarm.lots && activeDetailedFarm.lots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeDetailedFarm.lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-white border border-[#c1c8c2] rounded-2xl p-4 card-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold bg-[#012d1d] text-white px-2 py-0.5 rounded">
                            {lot.code}
                          </span>
                          <span className="text-[10px] font-bold bg-[#f4fbf7] text-[#012d1d] border border-[#c1ecd4] px-2 py-0.5 rounded flex items-center gap-1">
                            <Building className="w-3 h-3 text-[#2d6a4f]" />
                            {activeDetailedFarm.profile.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold bg-[#c1ecd4] text-[#012d1d] px-2 py-0.5 rounded uppercase">
                          {lot.categoryLabel || lot.category}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#012d1d] mt-2">
                        {lot.name}
                      </h4>
                      <p className="text-xs text-[#717973]">{lot.sexLabel} • {lot.ageRange}</p>

                      <div className="mt-3 bg-[#f8faf8] p-2.5 rounded-xl border border-[#e5e7eb] grid grid-cols-3 gap-1 text-center text-xs">
                        <div>
                          <span className="block font-mono font-bold text-[#012d1d]">{lot.heads}</span>
                          <span className="text-[9px] text-[#717973] uppercase">Cabezas</span>
                        </div>
                        <div>
                          <span className="block font-mono font-bold text-[#012d1d]">{lot.currentAvgWeight} kg</span>
                          <span className="text-[9px] text-[#717973] uppercase">Peso Prom</span>
                        </div>
                        <div>
                          <span className="block font-mono font-bold text-emerald-700">+{lot.gdpCurrent} kg/d</span>
                          <span className="text-[9px] text-[#717973] uppercase">GDP</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#f0f0f0] flex items-center justify-between">
                      <button
                        onClick={onOpenWeightModal}
                        className="text-xs font-bold text-[#012d1d] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5 text-[#2d6a4f]" />
                        <span>Pesar Lote con Báscula</span>
                      </button>

                      <span className="text-[10px] text-[#717973]">
                        Meta: {lot.targetWeight} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#c1c8c2] rounded-2xl p-5 text-center text-[#717973]">
                <p className="text-xs">No hay lotes específicos cargados para este predio.</p>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
};
