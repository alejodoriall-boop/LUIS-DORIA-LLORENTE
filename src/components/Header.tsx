import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MainTab, FarmDataPackage, AdminUser } from '../types';
import {
  Bell,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  X,
  AlertTriangle,
  Bluetooth,
  Zap,
  Building,
  Settings,
  CalendarDays,
  FlaskConical,
  Milk,
  Building2,
  LogOut,
  User,
  KeyRound,
  Shield,
  Layers,
  Activity,
  Smartphone,
} from 'lucide-react';
import {
  ProductionCategoryKey,
  filterFarmsByCategory,
} from '../utils/farmCategoryUtils';

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
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFarmMenu, setShowFarmMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [headerCategoryFilter, setHeaderCategoryFilter] = useState<ProductionCategoryKey>('all');

  const activeFarm = farms.find((f) => f.profile.id === currentFarmId) || farms[0];

  const filteredDropdownFarms = useMemo(() => {
    return filterFarmsByCategory(farms, headerCategoryFilter);
  }, [farms, headerCategoryFilter]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-3.5 sm:px-5 md:px-6 h-14 md:h-16 w-full bg-white/85 backdrop-blur-xl border-b border-black/[0.06] transition-all duration-300">
      {/* Left: Active Farm Selector / Quick Switcher */}
      <div className="flex items-center gap-2 relative">
        <motion.button
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => setShowFarmMenu(!showFarmMenu)}
          className="flex items-center gap-2 bg-[#043825] hover:bg-[#064e3b] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-[0_2px_8px_rgba(4,56,37,0.15)] border border-emerald-800/40 transition-all cursor-pointer group"
          title="Cambiar de Predio o Administrar"
        >
          <Building2 className="w-3.5 h-3.5 text-[#facc15] shrink-0" />
          <span className="font-bold tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
            {activeFarm?.profile.name || 'SAN JUAN'}
          </span>
          <ChevronDown className="w-3 h-3 text-emerald-300 opacity-80 group-hover:opacity-100 transition-opacity" />
        </motion.button>

        {/* Quick Farm Switcher Dropdown */}
        <AnimatePresence>
          {showFarmMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowFarmMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-3 z-50 space-y-2"
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Predios Ganaderos
                  </span>
                  <button
                    onClick={() => {
                      setShowFarmMenu(false);
                      onOpenFarmManagerModal();
                    }}
                    className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Gestionar</span>
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                  {farms.map((f) => {
                    const isSelected = f.profile.id === activeFarm?.profile.id;
                    return (
                      <button
                        key={f.profile.id}
                        onClick={() => {
                          onSelectFarm(f.profile.id);
                          setShowFarmMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/70'
                            : 'hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                          <span className="truncate">{f.profile.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {f.profile.totalAreaHa || 0} Ha
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowFarmMenu(false);
                      onOpenCreateFarmModal();
                    }}
                    className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Building className="w-3.5 h-3.5 text-emerald-700" />
                    <span>+ Crear Nuevo Predio</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Operational Controls & Status Badges */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Toggle Mode: LECHERÍA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onToggleDairyModule?.()}
          className={`flex items-center gap-1.5 h-8 px-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer border whitespace-nowrap ${
            isDairyEnabled
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-950 shadow-xs'
              : 'bg-slate-50/60 border-slate-200/60 text-slate-500 hover:bg-slate-100/80'
          }`}
          title={
            isDairyEnabled
              ? 'Módulo Lechería ACTIVADO - Clic para desactivar'
              : 'Módulo Lechería DESACTIVADO - Clic para activar'
          }
        >
          <Milk className={`w-3.5 h-3.5 shrink-0 ${isDairyEnabled ? 'text-blue-700' : 'text-slate-400'}`} />
          <span className="hidden lg:inline text-[11px] text-slate-600">Lechería:</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isDairyEnabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            {isDairyEnabled ? 'ON' : 'OFF'}
          </span>
        </motion.button>

        {/* Báscula Bluetooth */}
        {onOpenScaleModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenScaleModal}
            className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-slate-50/80 hover:bg-slate-100 border border-slate-200/70 text-slate-800 transition-colors shadow-2xs cursor-pointer text-xs font-semibold whitespace-nowrap"
            title="Configurar Báscula Bluetooth / Tru-Test"
          >
            <Bluetooth className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-mono text-[11px] truncate max-w-[120px]">
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
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-[#075e54] text-white hover:bg-[#064e3b] transition-all shadow-xs cursor-pointer text-xs font-semibold whitespace-nowrap"
            title="Vincular y Probar Asistente Virtual en WhatsApp"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            <span className="hidden lg:inline">WhatsApp Bot</span>
            <span className="bg-[#25D366] text-slate-950 text-[9.5px] font-black px-1.5 py-0.2 rounded-full font-mono">
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
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-[#043825] text-white hover:bg-[#064e3b] transition-all shadow-xs cursor-pointer text-xs font-semibold whitespace-nowrap"
            title="Ver y gestionar Reporte de Actividades Diarias Pendientes"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#facc15] shrink-0" />
            <span className="hidden md:inline">Pendientes</span>
            <span className="bg-[#facc15] text-[#362300] text-[9.5px] font-black px-1.5 py-0.2 rounded-full font-mono">
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
            className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-900 hover:bg-rose-100/80 transition-colors shadow-2xs cursor-pointer text-xs font-semibold whitespace-nowrap"
            title="Registro de Casos Positivos de Mastitis (CMT)"
          >
            <FlaskConical className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="hidden xl:inline">Mastitis</span>
            <span className="bg-rose-600 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full font-mono">
              {activeMastitisCount}
            </span>
          </motion.button>
        )}

        {/* Retiros Sanitarios */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenWithdrawalModal}
          className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-amber-50/80 border border-amber-200/80 text-amber-950 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer text-xs font-semibold whitespace-nowrap"
          title="Ver animales en tiempo de retiro sanitario de medicamentos"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="hidden xl:inline">Retiros</span>
          <span className="bg-amber-600 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full font-mono">
            5
          </span>
        </motion.button>

        {/* Campana de Notificaciones */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center transition-colors text-slate-800 shadow-2xs cursor-pointer"
            title="Alertas Sanitarias y Notificaciones"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white font-mono">
                {unreadAlertsCount}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-4 z-50"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Notificaciones de Campo
                    </h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mt-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Alert 1 */}
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('menu');
                        onOpenWithdrawalModal();
                      }}
                      className="p-3 bg-rose-50 text-rose-950 rounded-xl border border-rose-200/70 text-xs cursor-pointer hover:bg-rose-100/70 transition-colors"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Plan Sanitario</span>
                        <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                          En 3 días
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600">
                        Vacunación oficial contra Fiebre Aftosa en Lote 4 (45 novillos).
                      </p>
                    </div>

                    {/* Alert 2 */}
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        onOpenWithdrawalModal();
                      }}
                      className="p-3 bg-amber-50 text-amber-950 rounded-xl border border-amber-200/70 text-xs cursor-pointer hover:bg-amber-100/70 transition-colors"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Control de Tiempos de Retiro</span>
                        <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
                          5 animales
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600">
                        5 bovinos con tratamiento antibiótico activo. Prohibido despacho.
                      </p>
                    </div>

                    {/* Alert 3 */}
                    <div className="p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span>Pesaje Programado</span>
                        <span className="text-[10px] font-mono text-slate-500">Mañana</span>
                      </div>
                      <p className="mt-1 text-slate-600">
                        Lote Potrero Norte (45 Machos) cumple ciclo de 15 días.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sincronizado
                    </span>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('menu');
                      }}
                      className="font-bold text-emerald-800 hover:text-emerald-950 text-[11px] cursor-pointer"
                    >
                      Ver todo
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Session Chip / Dropdown */}
        <div className="relative border-l border-slate-200 pl-1.5 md:pl-2 ml-0.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Gestión de Sesión & Usuario"
          >
            <div className="w-8 h-8 rounded-full bg-[#043825] text-[#facc15] flex items-center justify-center font-bold text-xs shadow-xs border border-[#facc15]/30 shrink-0">
              {activeUser ? activeUser.fullName.charAt(0) : <User className="w-4 h-4" />}
            </div>

            <div className="hidden lg:block text-left pr-1">
              <span className="font-semibold text-xs text-slate-900 block leading-tight truncate max-w-[110px]">
                {activeUser ? activeUser.fullName : 'Iniciar Sesión'}
              </span>
              <span className="text-[10px] text-emerald-800 font-medium block leading-none capitalize truncate max-w-[110px]">
                {activeUser ? activeUser.customRoleTitle || activeUser.roleType : 'Invitado'}
              </span>
            </div>

            <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
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
                  className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-4 z-50 space-y-3"
                >
                  {activeUser ? (
                    <>
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            ● Sesión Activa
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">PIN ••••</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{activeUser.fullName}</h4>
                        <p className="text-xs text-emerald-800 font-medium">
                          {activeUser.customRoleTitle || activeUser.roleType}
                        </p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setActiveTab('admin');
                          }}
                          className="w-full text-left p-2 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Shield className="w-4 h-4 text-emerald-800" />
                          <span>Módulo Administrativo & Roles</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (onOpenAuthModal) onOpenAuthModal();
                          }}
                          className="w-full text-left p-2 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <KeyRound className="w-4 h-4 text-amber-600" />
                          <span>Cambiar de Usuario / PIN</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            if (onLogoutUser) onLogoutUser();
                          }}
                          className="w-full text-left p-2 hover:bg-rose-50 text-rose-700 rounded-xl font-bold flex items-center gap-2 transition-colors mt-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center p-2">
                        <User className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                        <h4 className="font-bold text-sm text-slate-800">Sin Sesión de Usuario</h4>
                        <p className="text-xs text-slate-500">Seleccione su perfil de usuario e ingrese su PIN.</p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onOpenAuthModal) onOpenAuthModal();
                        }}
                        className="w-full py-2 bg-[#043825] text-white hover:bg-[#064e3b] text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <KeyRound className="w-4 h-4 text-[#facc15]" />
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

