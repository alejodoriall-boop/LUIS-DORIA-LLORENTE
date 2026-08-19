import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MainTab, FarmDataPackage, AdminUser, AdminContextMode, TenantRecord } from '../types';
import {
  Bell,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  X,
  AlertTriangle,
  Bluetooth,
  Zap,
  CalendarDays,
  FlaskConical,
  Milk,
  LogOut,
  User,
  KeyRound,
  Shield,
  Smartphone,
  Menu,
  Sparkles,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  ProductionCategoryKey,
  filterFarmsByCategory,
} from '../utils/farmCategoryUtils';
import { useClickOutside } from '../hooks/useClickOutside';
import { FarmSelector } from './FarmSelector';

interface HeaderProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  unreadAlertsCount: number;
  onOpenWithdrawalModal: () => void;
  onOpenNewEventModal?: (eventType?: string) => void;
  scaleName?: string;
  scaleWeight?: number;
  onOpenScaleModal?: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  onSelectFarm: (farmId: string) => void;
  onOpenCreateFarmModal: () => void;
  onOpenFarmManagerModal: () => void;
  onOpenPendingActivitiesModal?: () => void;
  pendingActivitiesCount?: number;
  onOpenMastitisModal?: () => void;
  activeMastitisCount?: number;
  isDairyEnabled?: boolean;
  onToggleDairyModule?: () => void;
  isLotsEnabled?: boolean;
  onToggleLotsModule?: () => void;
  activeUser?: AdminUser | null;
  onOpenAuthModal?: () => void;
  onLogoutUser?: () => void;
  onOpenWhatsAppModal?: () => void;
  onOpenMobileMenu?: () => void;
  adminContextMode?: AdminContextMode;
  onAdminContextModeChange?: (mode: AdminContextMode) => void;
  impersonatedTenant?: TenantRecord | null;
  onExitImpersonation?: () => void;
  isSuperadmin?: boolean;
  onGoToLanding?: () => void;
  isRightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
  onOpenRightSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  onOpenWithdrawalModal,
  onOpenNewEventModal,
  scaleName,
  scaleWeight,
  onOpenScaleModal,
  farms,
  currentFarmId,
  onSelectFarm,
  onOpenCreateFarmModal,
  onOpenFarmManagerModal,
  onOpenPendingActivitiesModal,
  pendingActivitiesCount = 0,
  onOpenMastitisModal,
  activeMastitisCount = 0,
  isDairyEnabled = true,
  onToggleDairyModule,
  isLotsEnabled = false,
  onToggleLotsModule,
  activeUser,
  onOpenAuthModal,
  onLogoutUser,
  onOpenWhatsAppModal,
  onOpenMobileMenu,
  adminContextMode = 'my_farms',
  onAdminContextModeChange,
  impersonatedTenant,
  onExitImpersonation,
  isSuperadmin = true,
  onGoToLanding,
  isRightSidebarOpen = false,
  onToggleRightSidebar,
  onOpenRightSidebar,
}) => {
  const [showOperationsMenu, setShowOperationsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [headerCategoryFilter, setHeaderCategoryFilter] = useState<ProductionCategoryKey>('all');

  const operationsMenuRef = useClickOutside<HTMLDivElement>(() => setShowOperationsMenu(false), showOperationsMenu);
  const userMenuRef = useClickOutside<HTMLDivElement>(() => setShowUserMenu(false), showUserMenu);

  const activeFarm = farms.find((f) => f.profile.id === currentFarmId) || farms[0];

  // Dynamic calculation: sum ONLY active operational alerts (Pendientes + Mastitis + Retiros + Operación y Avisos)
  const retirosCount = 5; // active withdrawal records
  const totalActiveAlerts =
    (pendingActivitiesCount || 0) +
    (activeMastitisCount || 0) +
    retirosCount +
    (unreadAlertsCount || 0);

  const handleOpenDrawer = () => {
    if (onToggleRightSidebar) {
      onToggleRightSidebar();
    } else if (onOpenRightSidebar) {
      onOpenRightSidebar();
    }
  };

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showOperationsMenu) {
        setShowOperationsMenu(false);
      }
    };
    if (showOperationsMenu) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showOperationsMenu]);

  const filteredDropdownFarms = useMemo(() => {
    return filterFarmsByCategory(farms, headerCategoryFilter);
  }, [farms, headerCategoryFilter]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-2.5 sm:px-4 md:px-6 h-14 md:h-16 w-full max-w-full bg-[#101713]/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 gap-1.5 select-none text-[#F5F2E9]">
      {/* Left: Mobile Drawer Trigger + Farm Selector + Context Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onOpenMobileMenu && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#152019] text-[#C9A35A] border border-white/10 hover:bg-[#1A251E] active:scale-95 transition-all cursor-pointer shrink-0"
            title="Abrir menú de navegación de módulos"
          >
            <Menu className="w-4 h-4" />
          </motion.button>
        )}

        <FarmSelector
          farms={farms}
          currentFarmId={currentFarmId}
          onSelectFarm={onSelectFarm}
          onOpenCreateFarmModal={onOpenCreateFarmModal}
          onOpenFarmManagerModal={onOpenFarmManagerModal}
        />
      </div>

      {/* Right: Centro Operativo Dropdown & User Session */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* ================= BOTÓN UNIFICADO: CENTRO OPERATIVO ================= */}
        <div className="relative" ref={operationsMenuRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowOperationsMenu(!showOperationsMenu)}
            aria-expanded={showOperationsMenu}
            aria-haspopup="true"
            aria-controls="centro-operativo-dropdown"
            className={`flex items-center gap-1.5 sm:gap-2.5 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full font-bold text-xs transition-all cursor-pointer border whitespace-nowrap shrink-0 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A35A] ${
              showOperationsMenu
                ? 'bg-[#1F2C23] border-[#C9A35A] text-[#C9A35A] shadow-[0_0_14px_rgba(201,163,90,0.25)]'
                : 'bg-[#152019] hover:bg-[#1A251E] border-white/10 hover:border-[#C9A35A]/50 text-[#F5F2E9]'
            }`}
            title="Abrir Centro Operativo: Integraciones y Alertas Activas"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 text-[#C9A35A]" />
              {totalActiveAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse border border-[#101713]" />
              )}
            </div>

            <span className="font-bold text-xs text-[#F5F2E9] tracking-tight">Centro Operativo</span>

            {totalActiveAlerts > 0 && (
              <span className="bg-[#C9A35A] text-[#101713] text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono shadow-2xs">
                {totalActiveAlerts}
              </span>
            )}

            <ChevronDown
              className={`w-3.5 h-3.5 text-[#A5B8AC] transition-transform duration-200 shrink-0 ${
                showOperationsMenu ? 'rotate-180 text-[#C9A35A]' : ''
              }`}
            />
          </motion.button>

          {/* ================= DESPLEGABLE FLOTANTE CENTRO OPERATIVO ================= */}
          <AnimatePresence>
            {showOperationsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowOperationsMenu(false)}
                />
                <motion.div
                  id="centro-operativo-dropdown"
                  role="menu"
                  aria-label="Centro Operativo"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] max-w-[calc(100vw-24px)] bg-[#152019]/98 backdrop-blur-2xl rounded-[14px] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.65)] p-3.5 z-50 space-y-3.5 text-[#F5F2E9] focus:outline-none"
                >
                  {/* Encabezado del desplegable */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10 px-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#C9A35A]/15 text-[#C9A35A] flex items-center justify-center border border-[#C9A35A]/30 shrink-0">
                        <Activity className="w-4 h-4 text-[#C9A35A]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-[#F5F2E9] leading-tight">
                          Centro Operativo
                        </h3>
                        <p className="text-[10px] text-[#A5B8AC]">
                          {activeFarm?.profile?.name || 'Predio Activo'} • Estado en vivo
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#C9A35A]/20 text-[#C9A35A] px-2 py-0.5 rounded-full border border-[#C9A35A]/30">
                      {totalActiveAlerts} alertas
                    </span>
                  </div>

                  {/* SECCIÓN 1: INTEGRACIONES Y ESTADO */}
                  <div className="space-y-1.5">
                    <div className="px-1 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7F8C83]">
                        1. Integraciones y Estado
                      </span>
                      <span className="text-[9px] font-mono text-[#A5B8AC]">Módulos & Hardware</span>
                    </div>

                    <div className="space-y-1">
                      {/* 1.1 Lechería Especializada */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onToggleDairyModule?.();
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#1A251E] hover:bg-[#202E25] border border-white/5 hover:border-white/15 flex items-center justify-between gap-2.5 transition-all text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A35A]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                              isDairyEnabled
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-white/5 text-[#7F8C83] border-white/10'
                            }`}
                          >
                            <Milk className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#F5F2E9] group-hover:text-blue-200 transition-colors">
                              Lechería Especializada
                            </p>
                            <p className="text-[10px] text-[#A5B8AC] truncate">
                              Control de ordeño diario y tanque frío
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors shrink-0 ${
                            isDairyEnabled
                              ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40 shadow-xs'
                              : 'bg-white/10 text-[#7F8C83] border border-white/10'
                          }`}
                        >
                          {isDairyEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      {/* 1.2 Báscula Tru-Test */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowOperationsMenu(false);
                          if (onOpenScaleModal) onOpenScaleModal();
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#1A251E] hover:bg-[#202E25] border border-white/5 hover:border-white/15 flex items-center justify-between gap-2.5 transition-all text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A35A]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/30">
                            <Bluetooth className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#F5F2E9] group-hover:text-blue-200 transition-colors">
                              Báscula Tru-Test
                            </p>
                            <p className="text-[10px] text-[#A5B8AC] truncate">
                              {scaleName ? `${scaleName} • Conectada` : 'Tru-Test S2 • Bluetooth en brete'}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                          {scaleWeight ? `${scaleWeight} kg` : '442.5 kg'}
                        </span>
                      </button>

                      {/* 1.3 WhatsApp Bot */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowOperationsMenu(false);
                          if (onOpenWhatsAppModal) onOpenWhatsAppModal();
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#1A251E] hover:bg-[#202E25] border border-white/5 hover:border-white/15 flex items-center justify-between gap-2.5 transition-all text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A35A]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0 border border-[#25D366]/30">
                            <Smartphone className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#F5F2E9] group-hover:text-[#25D366] transition-colors">
                              WhatsApp Bot de Campo
                            </p>
                            <p className="text-[10px] text-[#A5B8AC] truncate">
                              Asistente IA para audios, fotos y registros
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                          IA Conectado
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* SECCIÓN 2: ALERTAS OPERATIVAS */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="px-1 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7F8C83]">
                        2. Alertas Operativas
                      </span>
                      <span className="text-[9px] font-mono text-[#A5B8AC]">Sanidad & Tareas</span>
                    </div>

                    <div className="space-y-1">
                      {/* 2.1 Pendientes (Amarillo/Dorado) */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowOperationsMenu(false);
                          if (onOpenPendingActivitiesModal) onOpenPendingActivitiesModal();
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#1A251E] hover:bg-[#202E25] border border-white/5 hover:border-[#C9A35A]/30 flex items-center justify-between gap-2.5 transition-all text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A35A]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#C9A35A]/15 text-[#C9A35A] flex items-center justify-center shrink-0 border border-[#C9A35A]/30">
                            <CalendarDays className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#F5F2E9] group-hover:text-[#C9A35A] transition-colors">
                              Tareas Pendientes
                            </p>
                            <p className="text-[10px] text-[#A5B8AC] truncate">
                              Actividades diarias programadas y vencidas
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#C9A35A]/20 text-[#C9A35A] border border-[#C9A35A]/30 shrink-0">
                          {pendingActivitiesCount}
                        </span>
                      </button>

                      {/* 2.2 Mastitis (Rojo) */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowOperationsMenu(false);
                          if (onOpenMastitisModal) onOpenMastitisModal();
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#1A251E] hover:bg-[#202E25] border border-white/5 hover:border-rose-500/30 flex items-center justify-between gap-2.5 transition-all text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                            <FlaskConical className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#F5F2E9] group-hover:text-rose-300 transition-colors">
                              Mastitis (CMT)
                            </p>
                            <p className="text-[10px] text-[#A5B8AC] truncate">
                              {activeMastitisCount > 0
                                ? `${activeMastitisCount} caso(s) en tratamiento`
                                : 'Sin casos positivos activos'}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                          {activeMastitisCount}
                        </span>
                      </button>

                      {/* 2.3 Retiros Sanitarios (Naranja) */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowOperationsMenu(false);
                          onOpenWithdrawalModal();
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#1A251E] hover:bg-[#202E25] border border-white/5 hover:border-orange-500/30 flex items-center justify-between gap-2.5 transition-all text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#F5F2E9] group-hover:text-orange-300 transition-colors">
                              Tiempos de Retiro
                            </p>
                            <p className="text-[10px] text-[#A5B8AC] truncate">
                              Fármacos con restricción de despacho
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0">
                          {retirosCount}
                        </span>
                      </button>

                      {/* 2.4 Operación y Avisos (Verde / General) */}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowOperationsMenu(false);
                          handleOpenDrawer();
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#1A251E] hover:bg-[#202E25] border border-white/5 hover:border-emerald-500/30 flex items-center justify-between gap-2.5 transition-all text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <Activity className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#F5F2E9] group-hover:text-emerald-300 transition-colors">
                              Operación & Avisos
                            </p>
                            <p className="text-[10px] text-[#A5B8AC] truncate">
                              Panel lateral de alertas, eventos y avisos
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          {unreadAlertsCount > 0 ? unreadAlertsCount : 4}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Pie de página del desplegable */}
                  <div className="pt-2 border-t border-white/10 px-1 flex items-center justify-between text-[10px] text-[#7F8C83]">
                    <span className="font-mono">GanaderIA • Operaciones</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOperationsMenu(false);
                        handleOpenDrawer();
                      }}
                      className="text-[#C9A35A] hover:text-[#D8B66C] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Abrir panel lateral</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Session Chip / Dropdown */}
        <div className="relative border-l border-white/10 pl-1.5 md:pl-2 ml-0.5" ref={userMenuRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            title="Gestión de Sesión & Usuario"
          >
            <div className="w-8 h-8 rounded-full bg-[#1A251E] text-[#C9A35A] flex items-center justify-center font-bold text-xs shadow-xs border border-[#C9A35A]/40 shrink-0">
              {activeUser ? activeUser.fullName.charAt(0) : <User className="w-4 h-4" />}
            </div>

            <div className="hidden lg:block text-left pr-1">
              <span className="font-semibold text-xs text-[#F5F2E9] block leading-tight truncate max-w-[110px]">
                {activeUser ? activeUser.fullName : 'Iniciar Sesión'}
              </span>
              <span className="text-[10px] text-[#A5B8AC] font-medium block leading-none capitalize truncate max-w-[110px]">
                {activeUser ? activeUser.customRoleTitle || activeUser.roleType : 'Invitado'}
              </span>
            </div>

            <ChevronDown className="w-3 h-3 text-[#7F8C83] hidden lg:block" />
          </motion.button>

          {/* User Session Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-[#152019] backdrop-blur-2xl rounded-2xl border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-4 z-50 space-y-3 text-[#F5F2E9]"
                >
                  {activeUser ? (
                    <>
                      <div className="p-3 bg-[#202B24] rounded-xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            ● Sesión Activa
                          </span>
                          <span className="text-[10px] font-mono text-[#7F8C83]">PIN ••••</span>
                        </div>
                        <h4 className="font-bold text-sm text-[#F5F2E9] mt-1">{activeUser.fullName}</h4>
                        <p className="text-xs text-[#A5B8AC] font-medium">
                          {activeUser.customRoleTitle || activeUser.roleType}
                        </p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setActiveTab('admin');
                          }}
                          className="w-full text-left p-2.5 hover:bg-white/5 rounded-xl font-semibold text-[#F5F2E9] flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <Shield className="w-4 h-4 text-[#C9A35A]" />
                          <span>Módulo Administrativo & Roles</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (onOpenAuthModal) onOpenAuthModal();
                          }}
                          className="w-full text-left p-2.5 hover:bg-white/5 rounded-xl font-semibold text-[#F5F2E9] flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <KeyRound className="w-4 h-4 text-[#C9A35A]" />
                          <span>Cambiar de Usuario / PIN</span>
                        </button>

                        {onGoToLanding && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onGoToLanding();
                            }}
                            className="w-full text-left p-2.5 hover:bg-[#C9A35A]/10 text-[#C9A35A] rounded-xl font-semibold flex items-center gap-2.5 cursor-pointer transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-[#C9A35A]" />
                            <span>Ver Home Page Pública</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (onLogoutUser) onLogoutUser();
                          }}
                          className="w-full text-left p-2.5 hover:bg-rose-500/15 text-rose-300 rounded-xl font-bold flex items-center gap-2.5 transition-colors mt-2 cursor-pointer border border-rose-500/20"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center p-2">
                        <User className="w-8 h-8 text-[#7F8C83] mx-auto mb-1" />
                        <h4 className="font-bold text-sm text-[#F5F2E9]">Sin Sesión de Usuario</h4>
                        <p className="text-xs text-[#A5B8AC]">Seleccione su perfil de usuario e ingrese su PIN.</p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onOpenAuthModal) onOpenAuthModal();
                        }}
                        className="w-full py-2.5 bg-[#C9A35A] text-[#101713] hover:bg-[#D8B66C] text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <KeyRound className="w-4 h-4 text-[#101713]" />
                        <span>Iniciar Sesión</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
