import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Bell,
  Stethoscope,
  CloudRain,
  Droplets,
  Baby,
  Scale,
  HeartPulse,
  Plus,
  Activity,
  ArrowUpRight,
  Layers,
  Sparkles,
  Wheat,
  DollarSign,
  Compass,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { RecentActivity, MainTab, PendingDailyActivity } from '../types';
import { INITIAL_ACTIVITIES } from '../data/mockData';
import { BuffaloIcon } from './icons/BuffaloIcon';

interface RightNotificationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigateToTab?: (tab: MainTab) => void;
  onOpenWithdrawalModal: () => void;
  onOpenNewEventModal: (category?: any) => void;
  onOpenPendingActivitiesModal: () => void;
  pendingActivitiesCount: number;
  activeMastitisCount: number;
  onOpenMastitisModal: () => void;
  onOpenWeightModal?: () => void;
  onOpenScaleModal?: () => void;
  onOpenMilkingModal?: () => void;
  onOpenRegisterPalpationModal?: () => void;
  onOpenRegisterRainfallModal?: () => void;
  onOpenRegisterStockEntryModal?: () => void;
  onOpenSaleModal?: () => void;
  onOpenWhatsAppModal?: () => void;
  currentFarmName?: string;
  alerts?: any[];
  activities?: RecentActivity[];
  pendingActivities?: PendingDailyActivity[];
}

export const RightNotificationSidebar: React.FC<RightNotificationSidebarProps> = ({
  isOpen,
  onToggle,
  onNavigateToTab,
  onOpenWithdrawalModal,
  onOpenNewEventModal,
  onOpenPendingActivitiesModal,
  pendingActivitiesCount,
  activeMastitisCount,
  onOpenMastitisModal,
  onOpenWeightModal,
  onOpenScaleModal,
  onOpenMilkingModal,
  onOpenRegisterPalpationModal,
  onOpenRegisterRainfallModal,
  onOpenRegisterStockEntryModal,
  onOpenSaleModal,
  onOpenWhatsAppModal,
  currentFarmName = 'Predio Activo',
  alerts = [],
  activities = INITIAL_ACTIVITIES,
  pendingActivities = [],
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'sanitary' | 'tasks'>('all');
  const [showModuleMenu, setShowModuleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close register menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowModuleMenu(false);
      }
    };
    if (showModuleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModuleMenu]);

  const totalBadges = 2 + (pendingActivitiesCount > 0 ? 1 : 0) + (activeMastitisCount > 0 ? 1 : 0);
  const displayActivities = activities && activities.length > 0 ? activities : INITIAL_ACTIVITIES;

  // Handle click on a recent activity -> Navigate directly to relevant module
  const handleActivityClick = (act: RecentActivity) => {
    switch (act.category) {
      case 'birth':
        if (onNavigateToTab) onNavigateToTab('calf_rearing');
        break;
      case 'weigh':
        if (onNavigateToTab) onNavigateToTab('cattle');
        if (onOpenWeightModal) onOpenWeightModal();
        break;
      case 'genetics':
        if (onNavigateToTab) onNavigateToTab('genetics');
        if (onOpenRegisterPalpationModal) onOpenRegisterPalpationModal();
        break;
      case 'dairy':
        if (onNavigateToTab) onNavigateToTab('dairy');
        if (onOpenMilkingModal) onOpenMilkingModal();
        break;
      case 'health':
        if (onNavigateToTab) onNavigateToTab('cattle');
        if (onOpenWithdrawalModal) onOpenWithdrawalModal();
        break;
      case 'buffalo':
        if (onNavigateToTab) onNavigateToTab('buffalo');
        break;
      default:
        if (onNavigateToTab) onNavigateToTab('cattle');
        break;
    }
  };

  // Helper for category metadata
  const getCategoryMeta = (category: string) => {
    switch (category) {
      case 'birth':
        return {
          module: 'Crianza Terneros',
          tab: 'calf_rearing' as MainTab,
          icon: Baby,
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-100',
          badgeBg: 'bg-amber-100/70 text-amber-800',
        };
      case 'weigh':
        return {
          module: 'Pesaje Ganado',
          tab: 'cattle' as MainTab,
          icon: Scale,
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-100',
          badgeBg: 'bg-emerald-100/70 text-emerald-800',
        };
      case 'dairy':
        return {
          module: 'Lechería Especializada',
          tab: 'dairy' as MainTab,
          icon: Droplets,
          bg: 'bg-sky-50',
          text: 'text-sky-700',
          border: 'border-sky-100',
          badgeBg: 'bg-sky-100/70 text-sky-800',
        };
      case 'genetics':
        return {
          module: 'Genética & IATF',
          tab: 'genetics' as MainTab,
          icon: HeartPulse,
          bg: 'bg-pink-50',
          text: 'text-pink-700',
          border: 'border-pink-100',
          badgeBg: 'bg-pink-100/70 text-pink-800',
        };
      case 'buffalo':
        return {
          module: 'Bubalinos (Búfalos)',
          tab: 'buffalo' as MainTab,
          icon: BuffaloIcon,
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-100/80 text-emerald-900',
        };
      default:
        return {
          module: 'Sanidad & Manejo',
          tab: 'cattle' as MainTab,
          icon: Stethoscope,
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-100',
          badgeBg: 'bg-rose-100/70 text-rose-800',
        };
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-3 top-20 z-30 bg-white text-slate-700 p-2.5 rounded-xl shadow-md border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all flex items-center gap-2 group cursor-pointer"
        title="Abrir panel de avisos"
      >
        <div className="relative">
          <Bell className="w-4 h-4 text-slate-600 group-hover:text-emerald-700 transition-colors" />
          {totalBadges > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {totalBadges}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold hidden lg:inline text-slate-700">Avisos</span>
        <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
      </button>
    );
  }

  return (
    <aside className="w-full md:w-80 lg:w-88 shrink-0 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col md:h-[calc(100vh-4rem)] md:sticky md:top-16 z-30 transition-all overflow-hidden">
      {/* Minimal Header */}
      <div className="p-3.5 md:p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-slate-900 leading-none truncate">Operación & Avisos</h3>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0">
                {displayActivities.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[170px]">
              {currentFarmName}
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Ocultar panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 max-w-full">
        {/* WhatsApp Bot Quick Access Card */}
        {onOpenWhatsAppModal && (
          <div
            onClick={onOpenWhatsAppModal}
            className="w-full bg-[#004D38] hover:bg-[#064e3b] text-white p-3.5 rounded-xl shadow-xs border border-[#25D366]/30 cursor-pointer transition-all flex items-center justify-between gap-2 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#25D366] text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white leading-tight truncate">WhatsApp de Campo</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                </div>
                <p className="text-[10px] text-emerald-200 mt-0.5 truncate">Audios, fotos y textos en tiempo real</p>
              </div>
            </div>

            <span className="text-[10px] bg-white/10 group-hover:bg-white/20 px-2.5 py-1 rounded-lg font-bold text-white transition-colors shrink-0">
              Probar
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REGISTROS Y EVENTOS RECIENTES */}
        {/* ========================================================================= */}
        <section className="space-y-2 relative max-w-full" ref={menuRef}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-slate-800">
                Eventos Recientes
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">
                (Sincronizado)
              </span>
            </div>

            {/* + Registrar Module Picker Button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowModuleMenu(!showModuleMenu)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors border border-emerald-200/60 shadow-2xs shrink-0"
                title="Registrar tarea o evento en un módulo específico"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Registrar</span>
              </button>

              {/* Quick Module Registration Dropdown */}
              {showModuleMenu && (
                <div className="absolute right-0 top-7 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 text-xs space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">Vincular a Módulo</span>
                    <span className="text-[9px] text-slate-400 font-mono">10 Módulos</span>
                  </div>

                  <div className="space-y-0.5 max-h-72 overflow-y-auto pt-1">
                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('cattle');
                        onOpenNewEventModal('compra');
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-emerald-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-emerald-800">Inventario Ganado</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Altas, compras y traslados</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('cattle');
                        if (onOpenWeightModal) onOpenWeightModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-amber-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-amber-800">Control de Pesaje</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Lote / individual / GDP</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('calf_rearing');
                        onOpenNewEventModal('nacimiento');
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-amber-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Baby className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-amber-800">Crianza de Terneros</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Nacimientos y destete</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('genetics');
                        if (onOpenRegisterPalpationModal) onOpenRegisterPalpationModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-pink-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-pink-100 text-pink-800 flex items-center justify-center shrink-0">
                        <HeartPulse className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-pink-800">Genética & Reproducción</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Inseminación y palpación</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('dairy');
                        if (onOpenMilkingModal) onOpenMilkingModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-sky-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                        <Droplets className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-sky-800">Lechería Especializada</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Ordeño y tanque frío</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('buffalo');
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-emerald-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <BuffaloIcon className="w-3.5 h-3.5 text-emerald-800" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-emerald-800">Bubalinos (Búfalos)</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Gestión integral & sólidos</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('cattle');
                        if (onOpenWithdrawalModal) onOpenWithdrawalModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-rose-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-rose-800">Plan Sanitario</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Vacunas y retiro de fármacos</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('supplementation');
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-amber-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Wheat className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-amber-800">Suplementación</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Sal mineral y bloques</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('aforo');
                        if (onOpenRegisterRainfallModal) onOpenRegisterRainfallModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-emerald-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-emerald-800">Aforos & Pastos</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Pluviometría y aforo</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('sales');
                        if (onOpenSaleModal) onOpenSaleModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-emerald-50 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px] group-hover:text-emerald-800">Ventas & Salidas</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Despachos y facturación</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        onOpenPendingActivitiesModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-slate-100 text-left flex items-center gap-2 transition cursor-pointer group border-t border-slate-100"
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[11px]">Nueva Tarea Operativa</p>
                        <p className="text-[9.5px] text-slate-400 truncate">Gestor de actividades</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List of Recent Activities with Direct Navigation */}
          <div className="bg-white border border-slate-200/80 rounded-xl divide-y divide-slate-100 overflow-hidden w-full">
            {displayActivities.slice(0, 5).map((act, idx) => {
              const meta = getCategoryMeta(act.category);
              const IconComp = meta.icon;

              return (
                <div
                  key={`${act.id}-${idx}`}
                  className="p-2.5 sm:p-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group gap-2 w-full"
                  onClick={() => handleActivityClick(act)}
                  title={`Clic para ir al módulo: ${meta.module}`}
                >
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${meta.bg} ${meta.text} ${meta.border}`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-800 transition-colors">
                          {act.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate mt-0.5">
                        <span className={`px-1 py-0.2 rounded font-medium text-[9px] shrink-0 ${meta.badgeBg}`}>
                          {meta.module}
                        </span>
                        <span className="shrink-0">•</span>
                        <span className="truncate">{act.subtitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end pl-1">
                    <span className="text-[11px] font-mono font-medium text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/80 inline-flex items-center gap-1 group-hover:border-emerald-300 whitespace-nowrap">
                      <span>{act.weightOrMetric}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </span>
                    <p className="text-[9.5px] text-slate-400 mt-0.5 whitespace-nowrap">
                      {act.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* AVISOS Y ALERTAS SANITARIAS */}
        {/* ========================================================================= */}
        <section className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-xs font-semibold text-slate-800">Avisos & Alertas</h4>
            </div>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 rounded-full font-mono">
              {totalBadges}
            </span>
          </div>

          {/* Minimal Filter Tabs */}
          <div className="bg-slate-100/80 p-0.5 rounded-lg flex items-center gap-0.5">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 text-[10.5px] font-medium py-1 px-2 rounded-md transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterTab('sanitary')}
              className={`flex-1 text-[10.5px] font-medium py-1 px-2 rounded-md transition-all cursor-pointer ${
                filterTab === 'sanitary'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sanitarias
            </button>
            <button
              onClick={() => setFilterTab('tasks')}
              className={`flex-1 text-[10.5px] font-medium py-1 px-2 rounded-md transition-all cursor-pointer ${
                filterTab === 'tasks'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tareas
            </button>
          </div>

          {/* ALERT 1: Plan Sanitario URGENTE */}
          {(filterTab === 'all' || filterTab === 'sanitary') && (
            <div className="bg-white border border-rose-200/90 rounded-xl p-3 shadow-2xs space-y-1.5 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-rose-900 leading-tight">Plan Sanitario ICA</h5>
                    <span className="text-[10px] text-rose-600 font-medium">Módulo: Inventarios / Sanidad</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                  En 3 días
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                Ciclo oficial de vacunación obligatorio para ganado de Ceba y Cría.
              </p>
              <div className="pt-1 flex items-center justify-between border-t border-rose-50">
                <button
                  onClick={() => {
                    if (onNavigateToTab) onNavigateToTab('cattle');
                    onOpenWithdrawalModal();
                  }}
                  className="text-[10.5px] font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                >
                  <Stethoscope className="w-3 h-3" />
                  <span>Ir a Plan Sanitario →</span>
                </button>
              </div>
            </div>
          )}

          {/* ALERT 2: Tiempos de Retiro de Fármacos */}
          {(filterTab === 'all' || filterTab === 'sanitary') && (
            <div
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('cattle');
                onOpenWithdrawalModal();
              }}
              className="bg-white border border-amber-200/90 rounded-xl p-3 shadow-2xs space-y-1.5 transition-all cursor-pointer hover:border-amber-300 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-100">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-amber-950 leading-tight">Retiro Fármacos</h5>
                    <span className="text-[10px] text-amber-700 font-medium">Módulo: Inventarios & Inocuidad</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                  5 Animales
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                Animales bajo tratamiento con restricción de ordeño o despacho.
              </p>
              <div className="pt-1 flex items-center justify-between border-t border-amber-50">
                <span className="text-[10.5px] font-bold text-amber-800 group-hover:underline inline-flex items-center gap-1">
                  Ver lista de retiro de fármacos →
                </span>
              </div>
            </div>
          )}

          {/* ALERT 3: Mastitis Activa */}
          {activeMastitisCount > 0 && (filterTab === 'all' || filterTab === 'sanitary') && (
            <div
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('dairy');
                onOpenMastitisModal();
              }}
              className="bg-white border border-sky-200/90 rounded-xl p-3 shadow-2xs space-y-1.5 transition-all cursor-pointer hover:border-sky-300 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-sky-950 leading-tight">Control Mastitis</h5>
                    <span className="text-[10px] text-sky-700 font-medium">Módulo: Lechería Especializada</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded">
                  {activeMastitisCount} Casos
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                Casos en tratamiento y seguimiento de cuartos mamarios en ordeño.
              </p>
              <div className="pt-1 border-t border-sky-50">
                <span className="text-[10.5px] font-bold text-sky-700 group-hover:underline">
                  Abrir registros de mastitis en Lechería →
                </span>
              </div>
            </div>
          )}

          {/* ALERT 4: Tareas Operativas Pendientes */}
          {(filterTab === 'all' || filterTab === 'tasks') && (
            <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="font-semibold text-xs text-slate-800">Tareas de Campo</h5>
                </div>
                <span className="text-[9.5px] font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {pendingActivitiesCount} pendientes
                </span>
              </div>

              {/* Task list with direct module shortcuts */}
              <div className="space-y-1.5 text-xs">
                {pendingActivities && pendingActivities.length > 0 ? (
                  pendingActivities.slice(0, 3).map((task) => {
                    let taskModule: MainTab = 'cattle';
                    let moduleLabel = 'Ganado';
                    if (task.category === 'sanitario') { taskModule = 'cattle'; moduleLabel = 'Sanidad'; }
                    else if (task.category === 'ordeno') { taskModule = 'dairy'; moduleLabel = 'Lechería'; }
                    else if (task.category === 'reproduccion') { taskModule = 'genetics'; moduleLabel = 'Genética'; }
                    else if (task.category === 'pastoreo') { taskModule = 'aforo'; moduleLabel = 'Aforo/Pastos'; }
                    else if (task.category === 'nutricion') { taskModule = 'supplementation'; moduleLabel = 'Suplemento'; }
                    else if (task.category === 'mantenimiento') { taskModule = 'gis'; moduleLabel = 'SIG'; }
                    else if (task.category === 'personal') { taskModule = 'payroll'; moduleLabel = 'Nómina'; }
                    else if (task.category === 'inventario') { taskModule = 'inventory'; moduleLabel = 'Bodega'; }

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          if (onNavigateToTab) onNavigateToTab(taskModule);
                        }}
                        className="flex items-start justify-between gap-2 p-2 bg-slate-50/80 hover:bg-emerald-50/60 rounded-lg border border-slate-100 cursor-pointer group transition-colors"
                        title={`Ir al módulo ${moduleLabel}`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-medium text-slate-800 block text-[11px] truncate group-hover:text-emerald-800">
                            {task.title}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                            <span className="px-1 py-0.2 rounded bg-slate-200/70 text-slate-700 font-bold text-[8.5px]">
                              {moduleLabel}
                            </span>
                            {task.responsibleWorker && (
                              <span>• {task.responsibleWorker}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[8.5px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-medium shrink-0">
                          {task.scheduledDate}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div
                      onClick={() => {
                        if (onNavigateToTab) onNavigateToTab('cattle');
                        if (onOpenWeightModal) onOpenWeightModal();
                      }}
                      className="flex items-start justify-between gap-2 p-2 bg-slate-50/70 hover:bg-emerald-50/60 rounded-lg border border-slate-100 cursor-pointer group transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 block text-[11px] group-hover:text-emerald-800">
                          Control Pesaje Lote Ceba 1
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[8.5px]">
                            Pesaje
                          </span>
                          <span>• 45 cabezas</span>
                        </div>
                      </div>
                      <span className="text-[8.5px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                        Próximo
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        if (onNavigateToTab) onNavigateToTab('genetics');
                        if (onOpenRegisterPalpationModal) onOpenRegisterPalpationModal();
                      }}
                      className="flex items-start justify-between gap-2 p-2 bg-slate-50/70 hover:bg-pink-50/60 rounded-lg border border-slate-100 cursor-pointer group transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 block text-[11px] group-hover:text-pink-800">
                          Palpación Vacas Cría
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="px-1 py-0.2 rounded bg-pink-100 text-pink-800 font-bold text-[8.5px]">
                            Genética
                          </span>
                          <span>• 60 días post-servicio</span>
                        </div>
                      </div>
                      <span className="text-[8.5px] font-mono bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.2 rounded font-medium">
                        Pendiente
                      </span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={onOpenPendingActivitiesModal}
                className="w-full text-[10.5px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg transition-colors border border-slate-200/80 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Gestor Completo de Tareas ({pendingActivitiesCount})</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          )}

          {/* ALERT 5: Pluviometría / Clima */}
          {filterTab === 'all' && (
            <div
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('pastures');
                if (onOpenRegisterRainfallModal) onOpenRegisterRainfallModal();
              }}
              className="bg-slate-50/80 hover:bg-emerald-50/60 rounded-xl p-3 border border-slate-200/80 shadow-2xs space-y-1 cursor-pointer group transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CloudRain className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-800 leading-tight group-hover:text-emerald-800">
                      Pluviometría & Aforos
                    </h5>
                    <span className="text-[10px] text-slate-400">Módulo: Aforos & Pastos</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-800">45 mm</span>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-relaxed pt-1">
                Nivel óptimo de agua. Clic para registrar lectura de pluviómetro →
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Minimal Footer */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 text-center text-[10px] text-slate-400 font-normal shrink-0">
        GanaderIA • Sincronización Multi-Módulo
      </div>
    </aside>
  );
};

