import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Clock,
  ClipboardList,
  ChevronRight,
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
  X,
} from 'lucide-react';
import { RecentActivity, MainTab, PendingDailyActivity } from '../types';
import { INITIAL_ACTIVITIES } from '../data/mockData';
import { BuffaloIcon } from './icons/BuffaloIcon';

interface RightNotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
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
  onClose,
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
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Auto-focus close button or drawer for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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

  // Handle click on a recent activity -> Navigate directly to relevant module and close drawer
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
    onClose();
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
          text: 'text-amber-600',
          border: 'border-amber-500/30',
          badgeBg: 'bg-amber-100 text-amber-800',
        };
      case 'weigh':
        return {
          module: 'Pesaje Ganado',
          tab: 'cattle' as MainTab,
          icon: Scale,
          bg: 'bg-[#D4A94E]/15',
          text: 'text-[#9E7728]',
          border: 'border-[#D4A94E]/30',
          badgeBg: 'bg-[#F4EBD8] text-[#9E7728]',
        };
      case 'dairy':
        return {
          module: 'Lechería Especializada',
          tab: 'dairy' as MainTab,
          icon: Droplets,
          bg: 'bg-sky-500/15',
          text: 'text-sky-600',
          border: 'border-sky-500/30',
          badgeBg: 'bg-sky-100 text-sky-800',
        };
      case 'genetics':
        return {
          module: 'Genética & IATF',
          tab: 'genetics' as MainTab,
          icon: HeartPulse,
          bg: 'bg-pink-500/15',
          text: 'text-pink-600',
          border: 'border-pink-500/30',
          badgeBg: 'bg-pink-100 text-pink-800',
        };
      case 'buffalo':
        return {
          module: 'Bubalinos (Búfalos)',
          tab: 'buffalo' as MainTab,
          icon: BuffaloIcon,
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-700',
          border: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-100 text-emerald-800',
        };
      default:
        return {
          module: 'Sanidad & Manejo',
          tab: 'cattle' as MainTab,
          icon: Stethoscope,
          bg: 'bg-rose-500/15',
          text: 'text-rose-600',
          border: 'border-rose-500/30',
          badgeBg: 'bg-rose-100 text-rose-800',
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          {/* Semitransparent Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Drawer Panel Container */}
          <motion.aside
            ref={drawerRef}
            id="right-notification-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, duration: 0.25 }}
            className="relative z-[111] w-full sm:w-[420px] md:w-[440px] max-w-full bg-[#0D1A13] text-white shadow-2xl flex flex-col h-full border-l border-white/10 overflow-hidden focus:outline-none"
            tabIndex={-1}
          >
            {/* Sticky Header - Dark Institutional Green */}
            <div className="sticky top-0 z-20 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0D1A13]/98 backdrop-blur-md text-white shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#15241C] text-[#D4A94E] flex items-center justify-center border border-[#D4A94E]/30 shrink-0 shadow-2xs">
                  <Activity className="w-4 h-4 text-[#D4A94E]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 id="drawer-title" className="font-bold text-sm text-white leading-tight truncate">
                      Operación & Avisos
                    </h3>
                    <span className="bg-[#D4A94E] text-[#0D1A13] text-[10.5px] font-black px-2 py-0.2 rounded-full shrink-0 font-mono">
                      {totalBadges}
                    </span>
                  </div>
                  <p className="text-xs text-[#A5B8AC] mt-0.5 truncate max-w-[220px]">
                    {currentFarmName}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="text-[#A5B8AC] hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Cerrar panel de avisos"
                title="Cerrar panel (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body - Dark Operational Workspace */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 max-w-full custom-scrollbar bg-[#0D1A13] text-white">
              {/* WhatsApp Bot Quick Access Card */}
              {onOpenWhatsAppModal && (
                <div
                  onClick={() => {
                    onClose();
                    onOpenWhatsAppModal();
                  }}
                  className="w-full bg-[#15241C] hover:bg-[#1F3327] text-white p-3.5 rounded-2xl shadow-xs border border-[#27885D]/40 cursor-pointer transition-all flex items-center justify-between gap-2 group min-h-[44px]"
                  title="Abrir Asistente Virtual en WhatsApp"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#27885D] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Smartphone className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white leading-tight truncate">WhatsApp de Campo</h4>
                        <span className="w-2 h-2 rounded-full bg-[#27885D] animate-pulse shrink-0" />
                      </div>
                      <p className="text-[10.5px] text-[#A5B8AC] mt-0.5 truncate">Audios, fotos y textos en tiempo real</p>
                    </div>
                  </div>

                  <span className="text-[11px] bg-[#123F2A] group-hover:bg-[#1F6547] text-[#D4A94E] border border-[#D4A94E]/30 px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0">
                    Probar
                  </span>
                </div>
              )}

              {/* REGISTROS Y EVENTOS RECIENTES */}
              <section className="space-y-2 relative max-w-full" ref={menuRef}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white">
                      Eventos Recientes
                    </h4>
                    <span className="text-[10px] text-[#A5B8AC] font-medium">
                      (Sincronizado)
                    </span>
                  </div>

                  {/* + Registrar Module Picker Button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowModuleMenu(!showModuleMenu)}
                      className="text-[11px] font-bold text-[#0D1A13] bg-[#D4A94E] hover:bg-[#E4C477] px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0 min-h-[36px]"
                      title="Registrar tarea o evento en un módulo específico"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#0D1A13]" />
                      <span>Registrar</span>
                    </button>

                    {/* Quick Module Registration Dropdown */}
                    {showModuleMenu && (
                      <div className="absolute right-0 top-9 z-50 w-64 bg-[#15241C] rounded-2xl shadow-xl border border-white/15 p-2 text-xs space-y-1 animate-in fade-in zoom-in-95 text-white">
                        <div className="px-2 py-1 border-b border-white/10 flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">Vincular a Módulo</span>
                          <span className="text-[9px] text-[#A5B8AC] font-mono">10 Módulos</span>
                        </div>

                        <div className="space-y-0.5 max-h-72 overflow-y-auto pt-1 custom-scrollbar">
                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('cattle');
                              onOpenNewEventModal('compra');
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#202E25] text-[#D4A94E] flex items-center justify-center shrink-0">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-[#D4A94E]">Inventario Ganado</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Altas, compras y traslados</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('cattle');
                              if (onOpenWeightModal) onOpenWeightModal();
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#202E25] text-[#D4A94E] flex items-center justify-center shrink-0">
                              <Scale className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-[#D4A94E]">Control de Pesaje</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Lote / individual / GDP</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('calf_rearing');
                              onOpenNewEventModal('nacimiento');
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                              <Baby className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-amber-300">Crianza de Terneros</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Nacimientos y destete</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('genetics');
                              if (onOpenRegisterPalpationModal) onOpenRegisterPalpationModal();
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center shrink-0">
                              <HeartPulse className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-pink-300">Genética & Reproducción</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Inseminación y palpación</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('dairy');
                              if (onOpenMilkingModal) onOpenMilkingModal();
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                              <Droplets className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-sky-300">Lechería Especializada</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Ordeño y tanque frío</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('buffalo');
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                              <BuffaloIcon className="w-3.5 h-3.5 text-emerald-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-emerald-300">Bubalinos (Búfalos)</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Gestión integral & sólidos</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('cattle');
                              if (onOpenWithdrawalModal) onOpenWithdrawalModal();
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                              <Stethoscope className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-rose-300">Plan Sanitario</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Vacunas y retiro de fármacos</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('supplementation');
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                              <Wheat className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-amber-300">Suplementación</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Sal mineral y bloques</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('aforo');
                              if (onOpenRegisterRainfallModal) onOpenRegisterRainfallModal();
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                              <Compass className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-emerald-300">Aforos & Pastos</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Pluviometría y aforo</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('sales');
                              if (onOpenSaleModal) onOpenSaleModal();
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                              <DollarSign className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px] group-hover:text-emerald-300">Ventas & Salidas</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Despachos y facturación</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              onOpenPendingActivitiesModal();
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#1F3327] text-left flex items-center gap-2 transition cursor-pointer group border-t border-white/10 text-white"
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#202E25] text-white flex items-center justify-center shrink-0">
                              <ClipboardList className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-[11px]">Nueva Tarea Operativa</p>
                              <p className="text-[9.5px] text-[#A5B8AC] truncate">Gestor de actividades</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* List of Recent Activities with Direct Navigation */}
                <div className="bg-[#15241C] border border-white/10 rounded-2xl divide-y divide-white/10 overflow-hidden w-full shadow-2xs">
                  {displayActivities.slice(0, 5).map((act, idx) => {
                    const meta = getCategoryMeta(act.category);
                    const IconComp = meta.icon;

                    return (
                      <div
                        key={`${act.id}-${idx}`}
                        className="p-2.5 sm:p-3 flex items-center justify-between hover:bg-[#1F3327] transition-colors cursor-pointer group gap-2 w-full min-h-[44px]"
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
                              <p className="text-xs font-semibold text-white truncate group-hover:text-[#D4A94E] transition-colors">
                                {act.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-[#A5B8AC] truncate mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] shrink-0 bg-[#202E25] text-[#D4A94E]`}>
                                {meta.module}
                              </span>
                              <span className="shrink-0">•</span>
                              <span className="truncate">{act.subtitle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end pl-1">
                          <span className="text-[11px] font-mono font-medium text-white bg-[#202E25] px-1.5 py-0.5 rounded border border-white/10 inline-flex items-center gap-1 group-hover:border-[#D4A94E]/50 whitespace-nowrap">
                            <span>{act.weightOrMetric}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#A5B8AC] group-hover:text-[#D4A94E] transition-colors shrink-0" />
                          </span>
                          <p className="text-[9.5px] text-[#A5B8AC] mt-0.5 whitespace-nowrap">
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
                    <Bell className="w-3.5 h-3.5 text-[#D4A94E]" />
                    <h4 className="text-xs font-bold text-white">Avisos & Alertas</h4>
                  </div>
                  <span className="bg-[#15241C] text-[#D4A94E] text-[10px] font-bold px-2 py-0.2 rounded-full font-mono border border-white/10">
                    {totalBadges}
                  </span>
                </div>

                {/* Minimal Filter Tabs */}
                <div className="bg-[#15241C] p-0.5 rounded-xl border border-white/10 flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`flex-1 text-[10.5px] font-medium py-1.5 px-2 rounded-lg transition-all cursor-pointer min-h-[36px] ${
                      filterTab === 'all'
                        ? 'bg-[#123F2A] text-white font-bold border border-[#D4A94E]/40 shadow-xs'
                        : 'text-[#A5B8AC] hover:text-white'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('sanitary')}
                    className={`flex-1 text-[10.5px] font-medium py-1.5 px-2 rounded-lg transition-all cursor-pointer min-h-[36px] ${
                      filterTab === 'sanitary'
                        ? 'bg-[#123F2A] text-white font-bold border border-[#D4A94E]/40 shadow-xs'
                        : 'text-[#A5B8AC] hover:text-white'
                    }`}
                  >
                    Sanitarias
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('tasks')}
                    className={`flex-1 text-[10.5px] font-medium py-1.5 px-2 rounded-lg transition-all cursor-pointer min-h-[36px] ${
                      filterTab === 'tasks'
                        ? 'bg-[#123F2A] text-white font-bold border border-[#D4A94E]/40 shadow-xs'
                        : 'text-[#A5B8AC] hover:text-white'
                    }`}
                  >
                    Tareas
                  </button>
                </div>

                {/* ALERT 1: Plan Sanitario URGENTE */}
                {(filterTab === 'all' || filterTab === 'sanitary') && (
                  <div className="bg-[#15241C] border border-rose-500/30 rounded-2xl p-3 shadow-2xs space-y-1.5 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-rose-300 leading-tight">Plan Sanitario ICA</h5>
                          <span className="text-[10px] text-rose-400/80 font-medium">Módulo: Inventarios / Sanidad</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded">
                        En 3 días
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] leading-relaxed font-normal">
                      Ciclo oficial de vacunación obligatorio para ganado de Ceba y Cría.
                    </p>
                    <div className="pt-1 flex items-center justify-between border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onNavigateToTab) onNavigateToTab('cattle');
                          onOpenWithdrawalModal();
                        }}
                        className="text-[10.5px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer min-h-[36px]"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Ir a Plan Sanitario →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ALERT 2: Tiempos de Retiro de Fármacos */}
                {(filterTab === 'all' || filterTab === 'sanitary') && (
                  <div
                    onClick={() => {
                      onClose();
                      if (onNavigateToTab) onNavigateToTab('cattle');
                      onOpenWithdrawalModal();
                    }}
                    className="bg-[#15241C] border border-[#D99A28]/30 rounded-2xl p-3 shadow-2xs space-y-1.5 transition-all cursor-pointer hover:border-[#D99A28] group min-h-[44px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#D99A28]/20 text-[#D99A28] flex items-center justify-center shrink-0 border border-[#D99A28]/30">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-[#D99A28] leading-tight">Retiro Fármacos</h5>
                          <span className="text-[10px] text-[#A5B8AC] font-medium">Módulo: Inventarios & Inocuidad</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-[#D99A28]/20 text-[#D99A28] border border-[#D99A28]/30 px-1.5 py-0.5 rounded">
                        5 Animales
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] leading-relaxed font-normal">
                      Animales bajo tratamiento con restricción de ordeño o despacho.
                    </p>
                    <div className="pt-1 flex items-center justify-between border-t border-white/10">
                      <span className="text-[10.5px] font-bold text-[#D99A28] group-hover:underline inline-flex items-center gap-1">
                        Ver lista de retiro de fármacos →
                      </span>
                    </div>
                  </div>
                )}

                {/* ALERT 3: Mastitis Activa */}
                {activeMastitisCount > 0 && (filterTab === 'all' || filterTab === 'sanitary') && (
                  <div
                    onClick={() => {
                      onClose();
                      if (onNavigateToTab) onNavigateToTab('dairy');
                      onOpenMastitisModal();
                    }}
                    className="bg-[#15241C] border border-[#397DB5]/30 rounded-2xl p-3 shadow-2xs space-y-1.5 transition-all cursor-pointer hover:border-[#397DB5] group min-h-[44px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#397DB5]/20 text-[#397DB5] flex items-center justify-center shrink-0 border border-[#397DB5]/30">
                          <Droplets className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-blue-300 leading-tight">Control Mastitis</h5>
                          <span className="text-[10px] text-[#A5B8AC] font-medium">Módulo: Lechería Especializada</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-[#397DB5]/20 text-blue-300 border border-[#397DB5]/30 px-1.5 py-0.5 rounded">
                        {activeMastitisCount} Casos
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] leading-relaxed font-normal">
                      Casos en tratamiento y seguimiento de cuartos mamarios en ordeño.
                    </p>
                    <div className="pt-1 border-t border-white/10">
                      <span className="text-[10.5px] font-bold text-blue-300 group-hover:underline">
                        Abrir registros de mastitis en Lechería →
                      </span>
                    </div>
                  </div>
                )}

                {/* ALERT 4: Tareas Operativas Pendientes */}
                {(filterTab === 'all' || filterTab === 'tasks') && (
                  <div className="bg-[#15241C] rounded-2xl p-3 border border-white/10 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#202E25] text-[#D4A94E] flex items-center justify-center shrink-0 border border-white/10">
                          <ClipboardList className="w-3.5 h-3.5" />
                        </div>
                        <h5 className="font-bold text-xs text-white">Tareas de Campo</h5>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold text-[#D4A94E] bg-[#202E25] px-1.5 py-0.5 rounded border border-white/10">
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
                                onClose();
                                if (onNavigateToTab) onNavigateToTab(taskModule);
                              }}
                              className="flex items-start justify-between gap-2 p-2 bg-[#123F2A]/30 hover:bg-[#1F3327] rounded-xl border border-white/10 cursor-pointer group transition-colors min-h-[44px]"
                              title={`Ir al módulo ${moduleLabel}`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <span className="font-semibold text-white block text-[11px] truncate group-hover:text-[#D4A94E]">
                                  {task.title}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-[#A5B8AC] truncate">
                                  <span className="px-1.5 py-0.2 rounded bg-[#202E25] text-[#D4A94E] font-bold text-[8.5px] border border-white/10">
                                    {moduleLabel}
                                  </span>
                                  {task.responsibleWorker && (
                                    <span>• {task.responsibleWorker}</span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[8.5px] font-mono bg-[#D4A94E]/20 text-[#D4A94E] border border-[#D4A94E]/30 px-1.5 py-0.2 rounded font-bold shrink-0">
                                {task.scheduledDate}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <div
                            onClick={() => {
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('cattle');
                              if (onOpenWeightModal) onOpenWeightModal();
                            }}
                            className="flex items-start justify-between gap-2 p-2 bg-[#123F2A]/30 hover:bg-[#1F3327] rounded-xl border border-white/10 cursor-pointer group transition-colors min-h-[44px]"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-white block text-[11px] group-hover:text-[#D4A94E]">
                                Control Pesaje Lote Ceba 1
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-[#A5B8AC]">
                                <span className="px-1.5 py-0.2 rounded bg-[#202E25] text-[#D4A94E] font-bold text-[8.5px]">
                                  Pesaje
                                </span>
                                <span>• 45 cabezas</span>
                              </div>
                            </div>
                            <span className="text-[8.5px] font-mono bg-[#D4A94E]/20 text-[#D4A94E] border border-[#D4A94E]/30 px-1.5 py-0.2 rounded font-bold">
                              Próximo
                            </span>
                          </div>

                          <div
                            onClick={() => {
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('genetics');
                              if (onOpenRegisterPalpationModal) onOpenRegisterPalpationModal();
                            }}
                            className="flex items-start justify-between gap-2 p-2 bg-[#123F2A]/30 hover:bg-[#1F3327] rounded-xl border border-white/10 cursor-pointer group transition-colors min-h-[44px]"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-white block text-[11px] group-hover:text-pink-300">
                                Palpación Vacas Cría
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-[#A5B8AC]">
                                <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-bold text-[8.5px]">
                                  Genética
                                </span>
                                <span>• 60 días post-servicio</span>
                              </div>
                            </div>
                            <span className="text-[8.5px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded font-bold">
                              Pendiente
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPendingActivitiesModal();
                      }}
                      className="w-full text-[11px] font-bold text-white bg-[#15241C] hover:bg-[#1F3327] p-2 rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-1 cursor-pointer min-h-[38px]"
                    >
                      <span>Gestor Completo de Tareas ({pendingActivitiesCount})</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4A94E]" />
                    </button>
                  </div>
                )}

                {/* ALERT 5: Pluviometría / Clima */}
                {filterTab === 'all' && (
                  <div
                    onClick={() => {
                      onClose();
                      if (onNavigateToTab) onNavigateToTab('aforo');
                      onOpenRegisterRainfallModal();
                    }}
                    className="bg-[#15241C] hover:bg-[#1F3327] rounded-2xl p-3 border border-white/10 shadow-2xs space-y-1 cursor-pointer group transition-colors min-h-[44px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#27885D]/20 text-emerald-400 flex items-center justify-center shrink-0 border border-[#27885D]/30">
                          <CloudRain className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-white">Pluviómetro & Clima</h5>
                          <span className="text-[10px] text-[#A5B8AC]">Módulo: Aforos & Pastos</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-[#27885D]/20 text-emerald-400 border border-[#27885D]/30 px-1.5 py-0.5 rounded">
                        24 mm / 24h
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] leading-relaxed font-normal">
                      Precipitación óptima para rebrote en potreros de rotación.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Fixed Bottom Footer */}
            <div className="sticky bottom-0 z-20 px-4 py-2.5 bg-[#0D1A13] border-t border-white/10 text-center text-[10.5px] text-[#A5B8AC] font-normal shrink-0 font-mono select-none">
              GanaderIA • Sincronización Multi-Módulo
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
