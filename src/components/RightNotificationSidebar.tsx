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
  Wheat,
  DollarSign,
  Compass,
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
  onOpenMilkingModal,
  onOpenRegisterPalpationModal,
  onOpenRegisterRainfallModal,
  onOpenSaleModal,
  onOpenWhatsAppModal,
  currentFarmName = 'Predio Activo',
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
          bg: 'bg-amber-500/15',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          badgeBg: 'bg-amber-500/20 text-amber-300',
        };
      case 'weigh':
        return {
          module: 'Pesaje Ganado',
          tab: 'cattle' as MainTab,
          icon: Scale,
          bg: 'bg-[#C9A35A]/15',
          text: 'text-[#C9A35A]',
          border: 'border-[#C9A35A]/30',
          badgeBg: 'bg-[#C9A35A]/20 text-[#C9A35A]',
        };
      case 'dairy':
        return {
          module: 'Lechería Especializada',
          tab: 'dairy' as MainTab,
          icon: Droplets,
          bg: 'bg-sky-500/15',
          text: 'text-sky-400',
          border: 'border-sky-500/30',
          badgeBg: 'bg-sky-500/20 text-sky-300',
        };
      case 'genetics':
        return {
          module: 'Genética & IATF',
          tab: 'genetics' as MainTab,
          icon: HeartPulse,
          bg: 'bg-pink-500/15',
          text: 'text-pink-400',
          border: 'border-pink-500/30',
          badgeBg: 'bg-pink-500/20 text-pink-300',
        };
      case 'buffalo':
        return {
          module: 'Bubalinos (Búfalos)',
          tab: 'buffalo' as MainTab,
          icon: BuffaloIcon,
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-500/20 text-emerald-300',
        };
      default:
        return {
          module: 'Sanidad & Manejo',
          tab: 'cattle' as MainTab,
          icon: Stethoscope,
          bg: 'bg-rose-500/15',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          badgeBg: 'bg-rose-500/20 text-rose-300',
        };
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-3 top-20 z-30 bg-[#152019] text-[#F5F2E9] p-2.5 rounded-xl shadow-xl border border-white/10 hover:border-[#C9A35A]/50 hover:text-[#C9A35A] transition-all flex items-center gap-2 group cursor-pointer"
        title="Abrir panel de avisos"
      >
        <div className="relative">
          <Bell className="w-4 h-4 text-[#A5B8AC] group-hover:text-[#C9A35A] transition-colors" />
          {totalBadges > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {totalBadges}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold hidden lg:inline text-[#F5F2E9]">Avisos</span>
        <ChevronLeft className="w-3.5 h-3.5 text-[#7F8C83]" />
      </button>
    );
  }

  return (
    <aside className="w-full md:w-80 lg:w-88 shrink-0 bg-[#101713] border-t md:border-t-0 md:border-l border-white/10 flex flex-col md:h-[calc(100vh-4rem)] md:sticky md:top-16 z-30 transition-all overflow-hidden text-[#F5F2E9]">
      {/* Header */}
      <div className="p-3.5 md:p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0D1410]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#C9A35A]/15 text-[#C9A35A] flex items-center justify-center border border-[#C9A35A]/30 shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-[#F5F2E9] leading-none truncate">Operación & Avisos</h3>
              <span className="bg-[#202B24] text-[#C9A35A] text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 border border-white/10 font-mono">
                {displayActivities.length}
              </span>
            </div>
            <p className="text-[11px] text-[#A5B8AC] mt-0.5 truncate max-w-[170px]">
              {currentFarmName}
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="text-[#7F8C83] hover:text-[#F5F2E9] hover:bg-white/5 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Ocultar panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 max-w-full custom-scrollbar">
        {/* WhatsApp Bot Quick Access Card */}
        {onOpenWhatsAppModal && (
          <div
            onClick={onOpenWhatsAppModal}
            className="w-full bg-[#0D1410] hover:bg-[#152019] text-[#F5F2E9] p-3.5 rounded-2xl shadow-xs border border-[#25D366]/30 cursor-pointer transition-all flex items-center justify-between gap-2 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#25D366] text-[#101713] flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-[#F5F2E9] leading-tight truncate">WhatsApp de Campo</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                </div>
                <p className="text-[10px] text-[#A5B8AC] mt-0.5 truncate">Audios, fotos y textos en tiempo real</p>
              </div>
            </div>

            <span className="text-[10px] bg-white/10 group-hover:bg-white/20 px-2.5 py-1 rounded-lg font-bold text-[#F5F2E9] transition-colors shrink-0">
              Probar
            </span>
          </div>
        )}

        {/* REGISTROS Y EVENTOS RECIENTES */}
        <section className="space-y-2 relative max-w-full" ref={menuRef}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-[#F5F2E9]">
                Eventos Recientes
              </h4>
              <span className="text-[10px] text-[#7F8C83] font-medium">
                (Sincronizado)
              </span>
            </div>

            {/* + Registrar Module Picker Button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowModuleMenu(!showModuleMenu)}
                className="text-[11px] font-bold text-[#101713] bg-[#C9A35A] hover:bg-[#D8B66C] px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0"
                title="Registrar tarea o evento en un módulo específico"
              >
                <Plus className="w-3.5 h-3.5 text-[#101713]" />
                <span>Registrar</span>
              </button>

              {/* Quick Module Registration Dropdown */}
              {showModuleMenu && (
                <div className="absolute right-0 top-7 z-50 w-64 bg-[#152019] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/15 p-2 text-xs space-y-1 animate-in fade-in zoom-in-95 text-[#F5F2E9]">
                  <div className="px-2 py-1 border-b border-white/10 flex items-center justify-between">
                    <span className="font-bold text-[#F5F2E9] text-[11px]">Vincular a Módulo</span>
                    <span className="text-[9px] text-[#A5B8AC] font-mono">10 Módulos</span>
                  </div>

                  <div className="space-y-0.5 max-h-72 overflow-y-auto pt-1 custom-scrollbar">
                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('cattle');
                        onOpenNewEventModal('compra');
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#C9A35A]/15 text-[#C9A35A] flex items-center justify-center shrink-0">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-[#C9A35A]">Inventario Ganado</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Altas, compras y traslados</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('cattle');
                        if (onOpenWeightModal) onOpenWeightModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-amber-400">Control de Pesaje</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Lote / individual / GDP</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('calf_rearing');
                        onOpenNewEventModal('nacimiento');
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                        <Baby className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-amber-400">Crianza de Terneros</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Nacimientos y destete</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('genetics');
                        if (onOpenRegisterPalpationModal) onOpenRegisterPalpationModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0">
                        <HeartPulse className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-pink-400">Genética & Reproducción</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Inseminación y palpación</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('dairy');
                        if (onOpenMilkingModal) onOpenMilkingModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                        <Droplets className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-sky-400">Lechería Especializada</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Ordeño y tanque frío</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('buffalo');
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <BuffaloIcon className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-emerald-400">Bubalinos (Búfalos)</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Gestión integral & sólidos</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('cattle');
                        if (onOpenWithdrawalModal) onOpenWithdrawalModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-rose-400">Plan Sanitario</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Vacunas y retiro de fármacos</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('supplementation');
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                        <Wheat className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-amber-400">Suplementación</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Sal mineral y bloques</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('aforo');
                        if (onOpenRegisterRainfallModal) onOpenRegisterRainfallModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-emerald-400">Aforos & Pastos</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Pluviometría y aforo</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        if (onNavigateToTab) onNavigateToTab('sales');
                        if (onOpenSaleModal) onOpenSaleModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px] group-hover:text-emerald-400">Ventas & Salidas</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Despachos y facturación</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowModuleMenu(false);
                        onOpenPendingActivitiesModal();
                      }}
                      className="w-full p-1.5 rounded-xl hover:bg-white/5 text-left flex items-center gap-2 transition cursor-pointer group border-t border-white/10"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#202B24] text-[#F5F2E9] flex items-center justify-center shrink-0">
                        <ClipboardList className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F2E9] text-[11px]">Nueva Tarea Operativa</p>
                        <p className="text-[9.5px] text-[#A5B8AC] truncate">Gestor de actividades</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List of Recent Activities with Direct Navigation */}
          <div className="bg-[#152019] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden w-full">
            {displayActivities.slice(0, 5).map((act, idx) => {
              const meta = getCategoryMeta(act.category);
              const IconComp = meta.icon;

              return (
                <div
                  key={`${act.id}-${idx}`}
                  className="p-2.5 sm:p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group gap-2 w-full"
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
                        <p className="text-xs font-semibold text-[#F5F2E9] truncate group-hover:text-[#C9A35A] transition-colors">
                          {act.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#A5B8AC] truncate mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded font-medium text-[9px] shrink-0 ${meta.badgeBg}`}>
                          {meta.module}
                        </span>
                        <span className="shrink-0">•</span>
                        <span className="truncate">{act.subtitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end pl-1">
                    <span className="text-[11px] font-mono font-medium text-[#F5F2E9] bg-[#202B24] px-1.5 py-0.5 rounded border border-white/10 inline-flex items-center gap-1 group-hover:border-[#C9A35A]/50 whitespace-nowrap">
                      <span>{act.weightOrMetric}</span>
                      <ArrowUpRight className="w-3 h-3 text-[#7F8C83] group-hover:text-[#C9A35A] transition-colors shrink-0" />
                    </span>
                    <p className="text-[9.5px] text-[#7F8C83] mt-0.5 whitespace-nowrap">
                      {act.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AVISOS Y ALERTAS SANITARIAS */}
        <section className="space-y-2.5 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#A5B8AC]" />
              <h4 className="text-xs font-semibold text-[#F5F2E9]">Avisos & Alertas</h4>
            </div>
            <span className="bg-[#202B24] text-[#C9A35A] text-[10px] font-semibold px-2 py-0.2 rounded-full font-mono border border-white/10">
              {totalBadges}
            </span>
          </div>

          {/* Minimal Filter Tabs */}
          <div className="bg-[#152019] p-0.5 rounded-xl border border-white/10 flex items-center gap-0.5">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 text-[10.5px] font-medium py-1 px-2 rounded-lg transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-[#202B24] text-[#F5F2E9] font-bold shadow-xs'
                  : 'text-[#A5B8AC] hover:text-[#F5F2E9]'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterTab('sanitary')}
              className={`flex-1 text-[10.5px] font-medium py-1 px-2 rounded-lg transition-all cursor-pointer ${
                filterTab === 'sanitary'
                  ? 'bg-[#202B24] text-[#F5F2E9] font-bold shadow-xs'
                  : 'text-[#A5B8AC] hover:text-[#F5F2E9]'
              }`}
            >
              Sanitarias
            </button>
            <button
              onClick={() => setFilterTab('tasks')}
              className={`flex-1 text-[10.5px] font-medium py-1 px-2 rounded-lg transition-all cursor-pointer ${
                filterTab === 'tasks'
                  ? 'bg-[#202B24] text-[#F5F2E9] font-bold shadow-xs'
                  : 'text-[#A5B8AC] hover:text-[#F5F2E9]'
              }`}
            >
              Tareas
            </button>
          </div>

          {/* ALERT 1: Plan Sanitario URGENTE */}
          {(filterTab === 'all' || filterTab === 'sanitary') && (
            <div className="bg-[#152019] border border-rose-500/30 rounded-2xl p-3 shadow-xs space-y-1.5 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-rose-300 leading-tight">Plan Sanitario ICA</h5>
                    <span className="text-[10px] text-rose-400/80 font-medium">Módulo: Inventarios / Sanidad</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded">
                  En 3 días
                </span>
              </div>
              <p className="text-[11px] text-[#A5B8AC] leading-relaxed font-normal">
                Ciclo oficial de vacunación obligatorio para ganado de Ceba y Cría.
              </p>
              <div className="pt-1 flex items-center justify-between border-t border-white/5">
                <button
                  onClick={() => {
                    if (onNavigateToTab) onNavigateToTab('cattle');
                    onOpenWithdrawalModal();
                  }}
                  className="text-[10.5px] font-bold text-rose-300 hover:text-rose-200 flex items-center gap-1 cursor-pointer"
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
              className="bg-[#152019] border border-amber-500/30 rounded-2xl p-3 shadow-xs space-y-1.5 transition-all cursor-pointer hover:border-amber-500/50 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-amber-300 leading-tight">Retiro Fármacos</h5>
                    <span className="text-[10px] text-amber-400/80 font-medium">Módulo: Inventarios & Inocuidad</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                  5 Animales
                </span>
              </div>
              <p className="text-[11px] text-[#A5B8AC] leading-relaxed font-normal">
                Animales bajo tratamiento con restricción de ordeño o despacho.
              </p>
              <div className="pt-1 flex items-center justify-between border-t border-white/5">
                <span className="text-[10.5px] font-bold text-amber-300 group-hover:underline inline-flex items-center gap-1">
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
              className="bg-[#152019] border border-sky-500/30 rounded-2xl p-3 shadow-xs space-y-1.5 transition-all cursor-pointer hover:border-sky-500/50 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-sky-300 leading-tight">Control Mastitis</h5>
                    <span className="text-[10px] text-sky-400/80 font-medium">Módulo: Lechería Especializada</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 px-1.5 py-0.5 rounded">
                  {activeMastitisCount} Casos
                </span>
              </div>
              <p className="text-[11px] text-[#A5B8AC] leading-relaxed font-normal">
                Casos en tratamiento y seguimiento de cuartos mamarios en ordeño.
              </p>
              <div className="pt-1 border-t border-white/5">
                <span className="text-[10.5px] font-bold text-sky-300 group-hover:underline">
                  Abrir registros de mastitis en Lechería →
                </span>
              </div>
            </div>
          )}

          {/* ALERT 4: Tareas Operativas Pendientes */}
          {(filterTab === 'all' || filterTab === 'tasks') && (
            <div className="bg-[#152019] rounded-2xl p-3 border border-white/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#202B24] text-[#A5B8AC] flex items-center justify-center shrink-0 border border-white/10">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="font-semibold text-xs text-[#F5F2E9]">Tareas de Campo</h5>
                </div>
                <span className="text-[9.5px] font-mono font-medium text-[#C9A35A] bg-[#202B24] px-1.5 py-0.5 rounded border border-white/10">
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
                        className="flex items-start justify-between gap-2 p-2 bg-[#202B24] hover:bg-[#26332B] rounded-xl border border-white/5 cursor-pointer group transition-colors"
                        title={`Ir al módulo ${moduleLabel}`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-medium text-[#F5F2E9] block text-[11px] truncate group-hover:text-[#C9A35A]">
                            {task.title}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-[#A5B8AC] truncate">
                            <span className="px-1.5 py-0.2 rounded bg-white/10 text-[#F5F2E9] font-bold text-[8.5px]">
                              {moduleLabel}
                            </span>
                            {task.responsibleWorker && (
                              <span>• {task.responsibleWorker}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[8.5px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-medium shrink-0">
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
                      className="flex items-start justify-between gap-2 p-2 bg-[#202B24] hover:bg-[#26332B] rounded-xl border border-white/5 cursor-pointer group transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-[#F5F2E9] block text-[11px] group-hover:text-[#C9A35A]">
                          Control Pesaje Lote Ceba 1
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-[#A5B8AC]">
                          <span className="px-1.5 py-0.2 rounded bg-[#C9A35A]/20 text-[#C9A35A] font-bold text-[8.5px]">
                            Pesaje
                          </span>
                          <span>• 45 cabezas</span>
                        </div>
                      </div>
                      <span className="text-[8.5px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-medium">
                        Próximo
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        if (onNavigateToTab) onNavigateToTab('genetics');
                        if (onOpenRegisterPalpationModal) onOpenRegisterPalpationModal();
                      }}
                      className="flex items-start justify-between gap-2 p-2 bg-[#202B24] hover:bg-[#26332B] rounded-xl border border-white/5 cursor-pointer group transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-[#F5F2E9] block text-[11px] group-hover:text-pink-400">
                          Palpación Vacas Cría
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-[#A5B8AC]">
                          <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-bold text-[8.5px]">
                            Genética
                          </span>
                          <span>• 60 días post-servicio</span>
                        </div>
                      </div>
                      <span className="text-[8.5px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded font-medium">
                        Pendiente
                      </span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={onOpenPendingActivitiesModal}
                className="w-full text-[10.5px] font-semibold text-[#F5F2E9] bg-[#202B24] hover:bg-[#26332B] p-1.5 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Gestor Completo de Tareas ({pendingActivitiesCount})</span>
                <ChevronRight className="w-3 h-3 text-[#7F8C83]" />
              </button>
            </div>
          )}

          {/* ALERT 5: Pluviometría / Clima */}
          {filterTab === 'all' && (
            <div
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('aforo');
                if (onOpenRegisterRainfallModal) onOpenRegisterRainfallModal();
              }}
              className="bg-[#152019] hover:bg-[#202B24] rounded-2xl p-3 border border-white/10 shadow-xs space-y-1 cursor-pointer group transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <CloudRain className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-[#F5F2E9] leading-tight group-hover:text-[#C9A35A]">
                      Pluviometría & Aforos
                    </h5>
                    <span className="text-[10px] text-[#A5B8AC]">Módulo: Aforos & Pastos</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#C9A35A]">45 mm</span>
              </div>
              <p className="text-[10.5px] text-[#A5B8AC] leading-relaxed pt-1">
                Nivel óptimo de agua. Clic para registrar lectura de pluviómetro →
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Minimal Footer */}
      <div className="px-3 py-2 bg-[#0D1410] border-t border-white/10 text-center text-[10px] text-[#7F8C83] font-normal shrink-0 font-mono">
        GanaderIA • Sincronización Multi-Módulo
      </div>
    </aside>
  );
};
