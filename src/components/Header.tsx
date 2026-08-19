import React, { useState, useMemo } from 'react';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [headerCategoryFilter, setHeaderCategoryFilter] = useState<ProductionCategoryKey>('all');

  const notifMenuRef = useClickOutside<HTMLDivElement>(() => setShowNotifications(false), showNotifications);
  const userMenuRef = useClickOutside<HTMLDivElement>(() => setShowUserMenu(false), showUserMenu);

  const activeFarm = farms.find((f) => f.profile.id === currentFarmId) || farms[0];

  const totalNotifCount = 2 + (pendingActivitiesCount > 0 ? 1 : 0) + (activeMastitisCount > 0 ? 1 : 0);

  const handleOpenDrawer = () => {
    if (onToggleRightSidebar) {
      onToggleRightSidebar();
    } else if (onOpenRightSidebar) {
      onOpenRightSidebar();
    }
  };

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

      {/* Right: Operational Controls & Status Badges */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full">
        {/* Toggle Mode: LECHERÍA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onToggleDairyModule?.()}
          className={`flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
            isDairyEnabled
              ? 'bg-[#152019] border-blue-500/40 text-blue-300 shadow-xs'
              : 'bg-[#101713] border-white/10 text-[#7F8C83] hover:bg-[#152019]'
          }`}
          title={
            isDairyEnabled
              ? 'Módulo Lechería ACTIVADO - Clic para desactivar'
              : 'Módulo Lechería DESACTIVADO - Clic para activar'
          }
        >
          <Milk className={`w-3.5 h-3.5 shrink-0 ${isDairyEnabled ? 'text-blue-400' : 'text-[#7F8C83]'}`} />
          <span className="hidden lg:inline text-[11px] text-[#A5B8AC]">Lechería:</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isDairyEnabled ? 'bg-blue-500 text-slate-950' : 'bg-white/10 text-[#A5B8AC]'}`}>
            {isDairyEnabled ? 'ON' : 'OFF'}
          </span>
        </motion.button>

        {/* Báscula Bluetooth */}
        {onOpenScaleModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenScaleModal}
            className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-2.5 rounded-full bg-[#152019] hover:bg-[#1A251E] border border-white/10 text-[#F5F2E9] transition-colors shadow-2xs cursor-pointer text-xs font-semibold whitespace-nowrap shrink-0"
            title="Configurar Báscula Bluetooth / Tru-Test"
          >
            <Bluetooth className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-mono text-[11px] truncate max-w-[85px] sm:max-w-[120px] text-[#A5B8AC]">
              {scaleName ? `${scaleName.split(' ')[0]} (${scaleWeight ?? 0} kg)` : 'Báscula BT'}
            </span>
          </motion.button>
        )}

        {/* WhatsApp Bot de Campo */}
        {onOpenWhatsAppModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenWhatsAppModal}
            className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-2.5 rounded-full bg-[#152019] hover:bg-[#1A251E] border border-emerald-500/30 text-[#F5F2E9] transition-all shadow-xs cursor-pointer text-xs font-semibold whitespace-nowrap shrink-0"
            title="Vincular y Probar Asistente Virtual en WhatsApp"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            <span className="hidden sm:inline text-xs">WhatsApp Bot</span>
            <span className="bg-[#25D366] text-[#0D1410] text-[9.5px] font-black px-1.5 py-0.2 rounded-full font-mono">
              IA
            </span>
          </motion.button>
        )}

        {/* Tareas Pendientes */}
        {onOpenPendingActivitiesModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenPendingActivitiesModal}
            className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-2.5 rounded-full bg-[#152019] hover:bg-[#1A251E] border border-[#C9A35A]/30 text-[#F5F2E9] transition-all shadow-xs cursor-pointer text-xs font-semibold whitespace-nowrap shrink-0"
            title="Ver y gestionar Reporte de Actividades Diarias Pendientes"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#C9A35A] shrink-0" />
            <span className="hidden md:inline text-xs text-[#A5B8AC]">Pendientes</span>
            <span className="bg-[#C9A35A] text-[#101713] text-[9.5px] font-black px-1.5 py-0.2 rounded-full font-mono">
              {pendingActivitiesCount}
            </span>
          </motion.button>
        )}

        {/* Mastitis (si hay casos) */}
        {onOpenMastitisModal && activeMastitisCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenMastitisModal}
            className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-200 hover:bg-rose-900/50 transition-colors shadow-2xs cursor-pointer text-xs font-semibold whitespace-nowrap"
            title="Registro de Casos Positivos de Mastitis (CMT)"
          >
            <FlaskConical className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="hidden xl:inline">Mastitis</span>
            <span className="bg-rose-500 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full font-mono">
              {activeMastitisCount}
            </span>
          </motion.button>
        )}

        {/* Retiros Sanitarios */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenWithdrawalModal}
          className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-200 hover:bg-amber-900/50 transition-colors shadow-2xs cursor-pointer text-xs font-semibold whitespace-nowrap"
          title="Ver animales en tiempo de retiro sanitario de medicamentos"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden xl:inline">Retiros</span>
          <span className="bg-[#C9A35A] text-[#101713] text-[9.5px] font-black px-1.5 py-0.2 rounded-full font-mono">
            5
          </span>
        </motion.button>

        {/* Botón Operación & Avisos (Drawer) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOpenDrawer}
          aria-expanded={isRightSidebarOpen}
          aria-controls="right-notification-drawer"
          className={`flex items-center gap-1.5 sm:gap-2 h-7 sm:h-8 px-2.5 sm:px-3 rounded-full font-semibold text-xs transition-all cursor-pointer border whitespace-nowrap shrink-0 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#C9A35A] ${
            isRightSidebarOpen
              ? 'bg-[#1F2C23] border-[#C9A35A] text-[#C9A35A]'
              : 'bg-[#152019] hover:bg-[#1A251E] border-white/10 hover:border-[#C9A35A]/50 text-[#F5F2E9]'
          }`}
          title="Abrir panel lateral de Operación & Avisos"
        >
          <div className="relative flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-[#C9A35A] shrink-0" />
            {totalNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <span className="hidden sm:inline text-xs font-bold">Operación & Avisos</span>
          <span className="bg-[#C9A35A] text-[#101713] text-[9.5px] font-black px-1.5 py-0.2 rounded-full font-mono">
            {totalNotifCount}
          </span>
        </motion.button>

        {/* Campana de Notificaciones (Direct Trigger to Drawer) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenDrawer}
          aria-expanded={isRightSidebarOpen}
          aria-controls="right-notification-drawer"
          className="relative w-8 h-8 rounded-full bg-[#152019] hover:bg-[#1A251E] border border-white/10 flex items-center justify-center transition-colors text-[#F5F2E9] shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C9A35A]"
          title="Ver Avisos y Notificaciones de Operación"
        >
          <Bell className="w-4 h-4 text-[#A5B8AC]" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#101713] font-mono">
              {unreadAlertsCount}
            </span>
          )}
        </motion.button>

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
