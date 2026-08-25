import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MainTab, AdminUser } from '../types';
import { CowIcon } from './icons/CowIcon';
import { HorseIcon } from './icons/HorseIcon';
import { BuffaloIcon } from './icons/BuffaloIcon';
import { GanaderIALogo } from './GanaderIALogo';
import { GrassIcon } from './icons/GrassIcon';
import { MilkGlassIcon } from './icons/MilkGlassIcon';
import {
  Home,
  Baby,
  Dna,
  MapPin,
  DollarSign,
  Users,
  CloudRain,
  Warehouse,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Bell,
  ChevronRight,
  Wheat,
  BarChart3,
  Building2,
  Layers,
  Power,
  LogOut,
  KeyRound,
  Shield,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  unreadAlertsCount: number;
  isDairyEnabled?: boolean;
  onToggleDairyModule?: () => void;
  isLotsEnabled?: boolean;
  onToggleLotsModule?: () => void;
  onOpenModuleManagerModal?: () => void;
  activeUser?: AdminUser | null;
  onLogoutUser?: () => void;
  onOpenAuthModal?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  isDairyEnabled = true,
  onToggleDairyModule,
  isLotsEnabled = false,
  onToggleLotsModule,
  onOpenModuleManagerModal,
  activeUser,
  onLogoutUser,
  onOpenAuthModal,
  isMobileOpen = false,
  onMobileClose,
}) => {

  const navItems = [
    {
      id: 'home' as MainTab,
      label: 'Inicio',
      sublabel: 'Panel General',
      icon: Home,
    },
    {
      id: 'cattle' as MainTab,
      label: 'Inventarios Ganado',
      sublabel: 'Ceba / Cría & Levante',
      icon: CowIcon,
    },
    {
      id: 'buffalo' as MainTab,
      label: 'Bubalinos (Búfalos)',
      sublabel: 'Gestión & Sólidos',
      icon: BuffaloIcon,
    },
    {
      id: 'equines' as MainTab,
      label: 'Equinos y Mulares',
      sublabel: 'Trabajo & Cría',
      icon: HorseIcon,
    },
    {
      id: 'dairy' as MainTab,
      label: 'Lechería Especializada',
      sublabel: 'Ordeño & Tanque',
      icon: MilkGlassIcon,
    },
    {
      id: 'genetics' as MainTab,
      label: 'Genética & Pedigrí',
      sublabel: 'Montas e IATF',
      icon: Dna,
    },
    {
      id: 'herd_traceability' as MainTab,
      label: 'Trazabilidad',
      sublabel: 'Eficiencia & Cargas',
      icon: ShieldCheck,
    },
    {
      id: 'calf_rearing' as MainTab,
      label: 'Crianza de Terneros',
      sublabel: 'Crianza & Pesaje',
      icon: Baby,
    },
    {
      id: 'supplementation' as MainTab,
      label: 'Suplementación',
      sublabel: 'Sal & Bloques',
      icon: Wheat,
    },
    {
      id: 'gis' as MainTab,
      label: 'SIG & Potreros',
      sublabel: 'Mapeo Satelital',
      icon: MapPin,
    },
    {
      id: 'aforo' as MainTab,
      label: 'Aforos & Pastos',
      sublabel: 'Capacidad de Carga',
      icon: GrassIcon,
    },
    {
      id: 'sales' as MainTab,
      label: 'Ventas & Salidas',
      sublabel: 'Báscula & Despacho',
      icon: DollarSign,
    },
    {
      id: 'finance' as MainTab,
      label: 'Finanzas de Finca',
      sublabel: 'Rentabilidad / Ha',
      icon: DollarSign,
    },
    {
      id: 'payroll' as MainTab,
      label: 'Nómina & Personal',
      sublabel: 'Jornales & Pagos',
      icon: Users,
    },
    {
      id: 'rainfall' as MainTab,
      label: 'Pluviómetro',
      sublabel: 'Registro Lluvias',
      icon: CloudRain,
    },
    {
      id: 'inventory' as MainTab,
      label: 'Almacén & Bodega',
      sublabel: 'Insumos & Medicinas',
      icon: Warehouse,
    },
    {
      id: 'analytics_report' as MainTab,
      label: 'Analítica Ejecutiva',
      sublabel: 'Reportes e Indicadores',
      icon: BarChart3,
    },
    {
      id: 'admin' as MainTab,
      label: 'Administración',
      sublabel: 'Roles y Seguridad',
      icon: Shield,
    },
    {
      id: 'menu' as MainTab,
      label: 'Asistente Sanitario',
      sublabel: 'Plan Sanitario & IA',
      icon: Sparkles,
      hasAlertBadge: true,
    },
  ];

  const displayedNavItems = isDairyEnabled
    ? navItems
    : [...navItems.filter((i) => i.id !== 'dairy'), navItems.find((i) => i.id === 'dairy')!];

  const handleItemClick = (tab: MainTab) => {
    setActiveTab(tab);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const renderContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full select-none bg-[#0D1A13] text-[#FFFFFF] overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0D1A13] flex items-center justify-between shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <GanaderIALogo
              variant="full"
              size="md"
              theme="dark"
              onClick={() => handleItemClick('home')}
            />
            <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider bg-[#D4A94E]/15 text-[#D4A94E] px-2 py-0.5 rounded-full border border-[#D4A94E]/30 shrink-0 font-mono">
              <ShieldCheck className="w-2.5 h-2.5 text-[#D4A94E]" /> PRO
            </span>
          </div>
          {isMobile && onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 text-[#A5B8AC] hover:text-white rounded-xl hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Container (Scrollable) */}
      <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Module Management header */}
        <button
          type="button"
          onClick={() => {
            if (onOpenModuleManagerModal) onOpenModuleManagerModal();
            if (isMobile && onMobileClose) onMobileClose();
          }}
          className="w-full px-2.5 py-1.5 flex items-center justify-between cursor-pointer group hover:bg-white/5 rounded-xl transition-all text-left"
          title="Abrir Gestor de Módulos"
        >
          <p className="text-[11px] font-bold text-[#A5B8AC] uppercase tracking-wider group-hover:text-white transition-colors flex items-center gap-1">
            Módulos del Sistema
          </p>
          <span className="text-[10px] font-mono text-[#D4A94E] font-black bg-[#15241C] px-2.5 py-0.5 rounded-full border border-white/10">
            {isDairyEnabled ? `${navItems.length}/${navItems.length}` : `${navItems.length - 1}/${navItems.length}`}
          </span>
        </button>

        {/* Predios vs Lotes Switch Pill */}
        <div
          onClick={() => {
            if (onToggleLotsModule) onToggleLotsModule();
          }}
          className="mx-1 mb-2 px-3 py-1.5 rounded-xl bg-[#15241C] border border-white/10 hover:border-[#D4A94E]/40 flex items-center justify-between text-[11px] cursor-pointer transition-all active:scale-[0.98] group"
          title={isLotsEnabled ? 'Manejo por Lotes activo. Clic para volver a Predios.' : 'Manejo por Predios activo por defecto. Clic para habilitar Lotes.'}
        >
          <span className="text-white flex items-center gap-1.5 font-medium truncate">
            {isLotsEnabled ? (
              <Layers className="w-3.5 h-3.5 text-[#D4A94E]" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-[#A5B8AC]" />
            )}
            <span className="group-hover:text-[#D4A94E] transition-colors">
              {isLotsEnabled ? 'Modo: Lotes' : 'Modo: Predios (Default)'}
            </span>
          </span>
          <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider shrink-0 ${
            isLotsEnabled ? 'bg-[#D4A94E] text-[#0D1A13]' : 'bg-[#202E25] text-[#A5B8AC]'
          }`}>
            {isLotsEnabled ? 'LOTES' : 'PREDIOS'}
          </span>
        </div>

        {/* Navigation Items List */}
        {displayedNavItems.map((item) => {
          const isDairy = item.id === 'dairy';
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              {/* Deactivated Dairy Module separation */}
              {isDairy && !isDairyEnabled && (
                <div className="pt-3 pb-1 px-2 flex items-center gap-2">
                  <div className="h-px bg-rose-950/60 flex-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400/80 flex items-center gap-1">
                    Módulo Desactivado
                  </span>
                  <div className="h-px bg-rose-950/60 flex-1" />
                </div>
              )}

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full h-11 rounded-xl transition-all duration-200 flex items-center justify-between px-3 cursor-pointer text-left group relative ${
                  isDairy && !isDairyEnabled
                    ? 'opacity-60 bg-rose-950/20 text-rose-300 border border-rose-900/30 hover:opacity-90'
                    : isActive
                    ? 'bg-[#123F2A] text-white font-bold border-l-4 border-[#D4A94E] shadow-sm'
                    : 'text-[#A5B8AC] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isDairy && !isDairyEnabled
                        ? 'bg-rose-900/40 text-rose-300'
                        : isActive
                        ? 'bg-[#D4A94E] text-[#0D1A13]'
                        : 'bg-[#15241C] text-[#A5B8AC] group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col leading-tight truncate">
                    <span
                      className={`text-xs font-semibold tracking-tight truncate ${
                        isDairy && !isDairyEnabled
                          ? 'text-rose-300/80 line-through'
                          : isActive
                          ? 'text-white font-bold'
                          : 'text-[#E1E8E3]'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-[9.5px] truncate font-medium ${
                        isDairy && !isDairyEnabled
                          ? 'text-rose-400'
                          : isActive
                          ? 'text-[#E4C477]'
                          : 'text-[#829488]'
                      }`}
                    >
                      {isDairy && !isDairyEnabled ? 'Desactivado (clic para activar)' : item.sublabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {item.hasAlertBadge && unreadAlertsCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-[#C83E4D] text-white font-mono">
                      <Bell className="w-2.5 h-2.5 mr-0.5" />
                      {unreadAlertsCount}
                    </span>
                  )}

                  {isDairy && !isDairyEnabled ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDairyModule?.();
                      }}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-900/60 text-rose-200 border border-rose-700/50 hover:bg-rose-800"
                    >
                      OFF
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive
                          ? 'text-[#D4A94E] opacity-100'
                          : 'text-[#829488] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                      }`}
                    />
                  )}
                </div>
              </motion.button>
            </React.Fragment>
          );
        })}

        {/* Navigation Items List ends */}
      </div>

      {/* Pinned Bottom Footer Section (Fijo hasta el final del panel) */}
      <div className="shrink-0 border-t border-white/10 bg-[#0D1A13] p-3 space-y-2 select-none pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {/* Security / System Logout Section */}
        <div className="p-2.5 rounded-xl bg-[#15241C] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#202E25] text-[#D4A94E] flex items-center justify-center shrink-0">
                <Power className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-white leading-tight truncate">
                  {activeUser ? activeUser.fullName : 'Modo Invitado'}
                </h4>
                <p className="text-[9px] text-[#A5B8AC] truncate">
                  {activeUser ? activeUser.customRoleTitle || activeUser.roleType : 'Sin PIN autenticado'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal();
                if (isMobile && onMobileClose) onMobileClose();
              }}
              className="p-1 bg-[#202E25] hover:bg-[#2A3C31] text-[#D4A94E] rounded-lg transition border border-white/10 cursor-pointer shrink-0"
              title="Ver perfil o verificar PIN"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            {activeUser ? (
              <button
                type="button"
                onClick={() => {
                  if (onLogoutUser) onLogoutUser();
                  if (isMobile && onMobileClose) onMobileClose();
                }}
                className="w-full py-1.5 px-2 bg-[#C83E4D]/20 hover:bg-[#C83E4D]/30 text-rose-200 border border-[#C83E4D]/30 font-bold text-[10px] rounded-lg transition shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <LogOut className="w-3 h-3" />
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal();
                  if (isMobile && onMobileClose) onMobileClose();
                }}
                className="w-full py-1.5 px-2 bg-[#D4A94E] hover:bg-[#E4C477] text-[#0D1A13] font-bold text-[10px] rounded-lg transition shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <KeyRound className="w-3 h-3" />
                <span>Ingresar PIN</span>
              </button>
            )}
          </div>
        </div>

        {/* Cloud Sync Status Pill */}
        <div className="px-3 py-2 rounded-xl bg-[#15241C] border border-white/10 text-xs shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#A5B8AC]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#27885D] shrink-0" />
              <span>Sincronización</span>
            </span>
            <span className="text-[9px] font-mono bg-[#27885D]/20 text-emerald-400 px-2 py-0.5 rounded-full border border-[#27885D]/40 font-bold">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar - Fixed on the left edge for independent scrolling */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0D1A13] text-[#FFFFFF] border-r border-white/10 h-screen h-[100vh] fixed top-0 left-0 bottom-0 shrink-0 z-40 shadow-2xl overflow-hidden select-none">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer (Slide-over) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[88vw] max-w-[330px] bg-[#0D1A13] text-[#FFFFFF] shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-r-3xl flex flex-col md:hidden overflow-hidden border-r border-white/10"
            >
              {renderContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
