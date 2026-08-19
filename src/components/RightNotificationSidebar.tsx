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
          bg: 'bg-[#C9A35A]/15',
          text: 'text-[#9E7728]',
          border: 'border-[#C9A35A]/30',
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
            className="relative z-[111] w-full sm:w-[420px] md:w-[440px] max-w-full bg-[#F5F7F3] shadow-2xl flex flex-col h-full border-l border-[#D6DED7] overflow-hidden focus:outline-none"
            tabIndex={-1}
          >
            {/* Sticky Header - Dark Institutional Green */}
            <div className="sticky top-0 z-20 p-3.5 sm:p-4 border-b border-[#075239] flex items-center justify-between shrink-0 bg-[#043825] text-white shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/10 text-[#C9A35A] flex items-center justify-center border border-white/10 shrink-0 shadow-2xs">
                  <Activity className="w-4 h-4 text-[#C9A35A]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 id="drawer-title" className="font-bold text-sm text-[#F5F2E9] leading-tight truncate">
                      Operación & Avisos
                    </h3>
                    <span className="bg-[#C9A35A] text-[#101713] text-[10.5px] font-black px-2 py-0.2 rounded-full shrink-0 font-mono">
                      {totalBadges}
                    </span>
                  </div>
                  <p className="text-xs text-[#B9C3BB] mt-0.5 truncate max-w-[220px]">
                    {currentFarmName}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="text-[#B9C3BB] hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Cerrar panel de avisos"
                title="Cerrar panel (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body - Light Operational Workspace */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 max-w-full custom-scrollbar bg-[#F5F7F3] text-[#18241D]">
              {/* WhatsApp Bot Quick Access Card */}
              {onOpenWhatsAppModal && (
                <div
                  onClick={() => {
                    onClose();
                    onOpenWhatsAppModal();
                  }}
                  className="w-full bg-white hover:bg-[#EEF2ED] text-[#18241D] p-3.5 rounded-2xl shadow-xs border border-[#25D366]/40 cursor-pointer transition-all flex items-center justify-between gap-2 group min-h-[44px]"
                  title="Abrir Asistente Virtual en WhatsApp"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Smartphone className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-[#18241D] leading-tight truncate">WhatsApp de Campo</h4>
                        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                      </div>
                      <p className="text-[10.5px] text-[#526158] mt-0.5 truncate">Audios, fotos y textos en tiempo real</p>
                    </div>
                  </div>

                  <span className="text-[11px] bg-[#EEF2ED] group-hover:bg-[#DDEBE3] text-[#043825] px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0">
                    Probar
                  </span>
                </div>
              )}

              {/* REGISTROS Y EVENTOS RECIENTES */}
              <section className="space-y-2 relative max-w-full" ref={menuRef}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#18241D]">
                      Eventos Recientes
                    </h4>
                    <span className="text-[10px] text-[#7A877F] font-medium">
                      (Sincronizado)
                    </span>
                  </div>

                  {/* + Registrar Module Picker Button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowModuleMenu(!showModuleMenu)}
                      className="text-[11px] font-bold text-[#0D1410] bg-[#C9A35A] hover:bg-[#B78F42] px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0 min-h-[36px]"
                      title="Registrar tarea o evento en un módulo específico"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#0D1410]" />
                      <span>Registrar</span>
                    </button>

                    {/* Quick Module Registration Dropdown */}
                    {showModuleMenu && (
                      <div className="absolute right-0 top-9 z-50 w-64 bg-white rounded-2xl shadow-xl border border-[#D6DED7] p-2 text-xs space-y-1 animate-in fade-in zoom-in-95 text-[#18241D]">
                        <div className="px-2 py-1 border-b border-[#D6DED7] flex items-center justify-between">
                          <span className="font-bold text-[#18241D] text-[11px]">Vincular a Módulo</span>
                          <span className="text-[9px] text-[#526158] font-mono">10 Módulos</span>
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
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#F4EBD8] text-[#9E7728] flex items-center justify-center shrink-0">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-[#043825]">Inventario Ganado</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Altas, compras y traslados</p>
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
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#F4EBD8] text-[#9E7728] flex items-center justify-center shrink-0">
                              <Scale className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-[#9E7728]">Control de Pesaje</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Lote / individual / GDP</p>
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
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Baby className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-amber-700">Crianza de Terneros</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Nacimientos y destete</p>
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
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                              <HeartPulse className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-pink-700">Genética & Reproducción</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Inseminación y palpación</p>
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
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                              <Droplets className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-sky-700">Lechería Especializada</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Ordeño y tanque frío</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('buffalo');
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <BuffaloIcon className="w-3.5 h-3.5 text-emerald-700" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-emerald-700">Bubalinos (Búfalos)</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Gestión integral & sólidos</p>
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
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                              <Stethoscope className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-rose-700">Plan Sanitario</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Vacunas y retiro de fármacos</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('supplementation');
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Wheat className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-amber-700">Suplementación</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Sal mineral y bloques</p>
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
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <Compass className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-emerald-700">Aforos & Pastos</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Pluviometría y aforo</p>
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
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <DollarSign className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px] group-hover:text-emerald-700">Ventas & Salidas</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Despachos y facturación</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowModuleMenu(false);
                              onClose();
                              onOpenPendingActivitiesModal();
                            }}
                            className="w-full p-2 rounded-xl hover:bg-[#EEF2ED] text-left flex items-center gap-2 transition cursor-pointer group border-t border-[#D6DED7]"
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#EEF2ED] text-[#18241D] flex items-center justify-center shrink-0">
                              <ClipboardList className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#18241D] text-[11px]">Nueva Tarea Operativa</p>
                              <p className="text-[9.5px] text-[#526158] truncate">Gestor de actividades</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* List of Recent Activities with Direct Navigation */}
                <div className="bg-white border border-[#D6DED7] rounded-2xl divide-y divide-[#E1E6E1] overflow-hidden w-full shadow-2xs">
                  {displayActivities.slice(0, 5).map((act, idx) => {
                    const meta = getCategoryMeta(act.category);
                    const IconComp = meta.icon;

                    return (
                      <div
                        key={`${act.id}-${idx}`}
                        className="p-2.5 sm:p-3 flex items-center justify-between hover:bg-[#F5F7F3] transition-colors cursor-pointer group gap-2 w-full min-h-[44px]"
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
                              <p className="text-xs font-semibold text-[#18241D] truncate group-hover:text-[#043825] transition-colors">
                                {act.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-[#526158] truncate mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] shrink-0 ${meta.badgeBg}`}>
                                {meta.module}
                              </span>
                              <span className="shrink-0">•</span>
                              <span className="truncate">{act.subtitle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end pl-1">
                          <span className="text-[11px] font-mono font-medium text-[#18241D] bg-[#EEF2ED] px-1.5 py-0.5 rounded border border-[#D6DED7] inline-flex items-center gap-1 group-hover:border-[#043825]/50 whitespace-nowrap">
                            <span>{act.weightOrMetric}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#7A877F] group-hover:text-[#043825] transition-colors shrink-0" />
                          </span>
                          <p className="text-[9.5px] text-[#7A877F] mt-0.5 whitespace-nowrap">
                            {act.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* AVISOS Y ALERTAS SANITARIAS */}
              <section className="space-y-2.5 pt-2 border-t border-[#D6DED7]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#526158]" />
                    <h4 className="text-xs font-bold text-[#18241D]">Avisos & Alertas</h4>
                  </div>
                  <span className="bg-[#EEF2ED] text-[#043825] text-[10px] font-bold px-2 py-0.2 rounded-full font-mono border border-[#D6DED7]">
                    {totalBadges}
                  </span>
                </div>

                {/* Minimal Filter Tabs */}
                <div className="bg-[#EEF2ED] p-0.5 rounded-xl border border-[#D6DED7] flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`flex-1 text-[10.5px] font-medium py-1.5 px-2 rounded-lg transition-all cursor-pointer min-h-[36px] ${
                      filterTab === 'all'
                        ? 'bg-white text-[#18241D] font-bold shadow-xs'
                        : 'text-[#526158] hover:text-[#18241D]'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('sanitary')}
                    className={`flex-1 text-[10.5px] font-medium py-1.5 px-2 rounded-lg transition-all cursor-pointer min-h-[36px] ${
                      filterTab === 'sanitary'
                        ? 'bg-white text-[#18241D] font-bold shadow-xs'
                        : 'text-[#526158] hover:text-[#18241D]'
                    }`}
                  >
                    Sanitarias
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('tasks')}
                    className={`flex-1 text-[10.5px] font-medium py-1.5 px-2 rounded-lg transition-all cursor-pointer min-h-[36px] ${
                      filterTab === 'tasks'
                        ? 'bg-white text-[#18241D] font-bold shadow-xs'
                        : 'text-[#526158] hover:text-[#18241D]'
                    }`}
                  >
                    Tareas
                  </button>
                </div>

                {/* ALERT 1: Plan Sanitario URGENTE */}
                {(filterTab === 'all' || filterTab === 'sanitary') && (
                  <div className="bg-white border border-rose-200 rounded-2xl p-3 shadow-2xs space-y-1.5 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-rose-800 leading-tight">Plan Sanitario ICA</h5>
                          <span className="text-[10px] text-rose-600 font-medium">Módulo: Inventarios / Sanidad</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded">
                        En 3 días
                      </span>
                    </div>
                    <p className="text-[11px] text-[#526158] leading-relaxed font-normal">
                      Ciclo oficial de vacunación obligatorio para ganado de Ceba y Cría.
                    </p>
                    <div className="pt-1 flex items-center justify-between border-t border-[#F5F7F3]">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onNavigateToTab) onNavigateToTab('cattle');
                          onOpenWithdrawalModal();
                        }}
                        className="text-[10.5px] font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer min-h-[36px]"
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
                    className="bg-white border border-amber-200 rounded-2xl p-3 shadow-2xs space-y-1.5 transition-all cursor-pointer hover:border-amber-400 group min-h-[44px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-amber-900 leading-tight">Retiro Fármacos</h5>
                          <span className="text-[10px] text-amber-700 font-medium">Módulo: Inventarios & Inocuidad</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                        5 Animales
                      </span>
                    </div>
                    <p className="text-[11px] text-[#526158] leading-relaxed font-normal">
                      Animales bajo tratamiento con restricción de ordeño o despacho.
                    </p>
                    <div className="pt-1 flex items-center justify-between border-t border-[#F5F7F3]">
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
                      onClose();
                      if (onNavigateToTab) onNavigateToTab('dairy');
                      onOpenMastitisModal();
                    }}
                    className="bg-white border border-sky-200 rounded-2xl p-3 shadow-2xs space-y-1.5 transition-all cursor-pointer hover:border-sky-400 group min-h-[44px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200">
                          <Droplets className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-sky-900 leading-tight">Control Mastitis</h5>
                          <span className="text-[10px] text-sky-700 font-medium">Módulo: Lechería Especializada</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded">
                        {activeMastitisCount} Casos
                      </span>
                    </div>
                    <p className="text-[11px] text-[#526158] leading-relaxed font-normal">
                      Casos en tratamiento y seguimiento de cuartos mamarios en ordeño.
                    </p>
                    <div className="pt-1 border-t border-[#F5F7F3]">
                      <span className="text-[10.5px] font-bold text-sky-800 group-hover:underline">
                        Abrir registros de mastitis en Lechería →
                      </span>
                    </div>
                  </div>
                )}

                {/* ALERT 4: Tareas Operativas Pendientes */}
                {(filterTab === 'all' || filterTab === 'tasks') && (
                  <div className="bg-white rounded-2xl p-3 border border-[#D6DED7] shadow-2xs space-y-2">
                    <div className="flex items-center justify-between border-b border-[#E1E6E1] pb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#EEF2ED] text-[#043825] flex items-center justify-center shrink-0 border border-[#D6DED7]">
                          <ClipboardList className="w-3.5 h-3.5" />
                        </div>
                        <h5 className="font-bold text-xs text-[#18241D]">Tareas de Campo</h5>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold text-[#043825] bg-[#EEF2ED] px-1.5 py-0.5 rounded border border-[#D6DED7]">
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
                              className="flex items-start justify-between gap-2 p-2 bg-[#F5F7F3] hover:bg-[#EEF2ED] rounded-xl border border-[#D6DED7] cursor-pointer group transition-colors min-h-[44px]"
                              title={`Ir al módulo ${moduleLabel}`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <span className="font-semibold text-[#18241D] block text-[11px] truncate group-hover:text-[#043825]">
                                  {task.title}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-[#526158] truncate">
                                  <span className="px-1.5 py-0.2 rounded bg-white text-[#18241D] font-bold text-[8.5px] border border-[#D6DED7]">
                                    {moduleLabel}
                                  </span>
                                  {task.responsibleWorker && (
                                    <span>• {task.responsibleWorker}</span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[8.5px] font-mono bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-bold shrink-0">
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
                            className="flex items-start justify-between gap-2 p-2 bg-[#F5F7F3] hover:bg-[#EEF2ED] rounded-xl border border-[#D6DED7] cursor-pointer group transition-colors min-h-[44px]"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-[#18241D] block text-[11px] group-hover:text-[#043825]">
                                Control Pesaje Lote Ceba 1
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-[#526158]">
                                <span className="px-1.5 py-0.2 rounded bg-[#F4EBD8] text-[#9E7728] font-bold text-[8.5px]">
                                  Pesaje
                                </span>
                                <span>• 45 cabezas</span>
                              </div>
                            </div>
                            <span className="text-[8.5px] font-mono bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-bold">
                              Próximo
                            </span>
                          </div>

                          <div
                            onClick={() => {
                              onClose();
                              if (onNavigateToTab) onNavigateToTab('genetics');
                              if (onOpenRegisterPalpationModal) onOpenRegisterPalpationModal();
                            }}
                            className="flex items-start justify-between gap-2 p-2 bg-[#F5F7F3] hover:bg-[#EEF2ED] rounded-xl border border-[#D6DED7] cursor-pointer group transition-colors min-h-[44px]"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-[#18241D] block text-[11px] group-hover:text-pink-700">
                                Palpación Vacas Cría
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-[#526158]">
                                <span className="px-1.5 py-0.2 rounded bg-pink-100 text-pink-800 font-bold text-[8.5px]">
                                  Genética
                                </span>
                                <span>• 60 días post-servicio</span>
                              </div>
                            </div>
                            <span className="text-[8.5px] font-mono bg-sky-100 text-sky-800 border border-sky-200 px-1.5 py-0.2 rounded font-bold">
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
                      className="w-full text-[11px] font-bold text-[#18241D] bg-[#EEF2ED] hover:bg-[#DDEBE3] p-2 rounded-xl transition-colors border border-[#D6DED7] flex items-center justify-center gap-1 cursor-pointer min-h-[38px]"
                    >
                      <span>Gestor Completo de Tareas ({pendingActivitiesCount})</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#526158]" />
                    </button>
                  </div>
                )}

                {/* ALERT 5: Pluviometría / Clima */}
                {filterTab === 'all' && (
                  <div
                    onClick={() => {
                      onClose();
                      if (onNavigateToTab) onNavigateToTab('aforo');
                      if (onOpenRegisterRainfallModal) onOpenRegisterRainfallModal();
                    }}
                    className="bg-white hover:bg-[#F5F7F3] rounded-2xl p-3 border border-[#D6DED7] shadow-2xs space-y-1 cursor-pointer group transition-colors min-h-[44px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                          <CloudRain className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-[#18241D]">Pluviómetro & Clima</h5>
                          <span className="text-[10px] text-[#526158]">Módulo: Aforos & Pastos</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-[#DDEBE3] text-[#043825] border border-[#D6DED7] px-1.5 py-0.5 rounded">
                        24 mm / 24h
                      </span>
                    </div>
                    <p className="text-[11px] text-[#526158] leading-relaxed font-normal">
                      Precipitación óptima para rebrote en potreros de rotación.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Fixed Bottom Footer */}
            <div className="sticky bottom-0 z-20 px-4 py-2.5 bg-[#EEF2ED] border-t border-[#D6DED7] text-center text-[10.5px] text-[#7A877F] font-normal shrink-0 font-mono select-none">
              GanaderIA • Sincronización Multi-Módulo
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
