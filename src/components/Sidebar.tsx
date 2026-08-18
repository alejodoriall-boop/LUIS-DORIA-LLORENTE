import React from 'react';
import { motion } from 'motion/react';
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
  Droplet,
  Dna,
  MapPin,
  Scale,
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
  Lock,
  KeyRound,
  Shield,
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

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#042e1f] text-white border-r border-emerald-950/60 h-screen sticky top-0 shrink-0 z-40 shadow-2xl overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-emerald-900/60 bg-[#032418]/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <GanaderIALogo
            variant="full"
            size="md"
            theme="dark"
            onClick={() => setActiveTab('home')}
          />
          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/40 shrink-0 font-mono">
            <ShieldCheck className="w-2.5 h-2.5 text-[#facc15]" /> PRO
          </span>
        </div>
      </div>

      {/* Navigation Container */}
      <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Module Management header */}
        <button
          type="button"
          onClick={onOpenModuleManagerModal}
          className="w-full px-2.5 py-1.5 flex items-center justify-between cursor-pointer group hover:bg-white/5 rounded-xl transition-all text-left"
          title="Abrir Gestor de Módulos"
        >
          <p className="text-[10px] font-bold text-emerald-300/70 uppercase tracking-widest group-hover:text-emerald-100 transition-colors flex items-center gap-1">
            Módulos del Sistema
          </p>
          <span className="text-[10px] font-mono text-[#facc15] font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/40">
            {isDairyEnabled ? `${navItems.length}/${navItems.length}` : `${navItems.length - 1}/${navItems.length}`}
          </span>
        </button>

        {/* Predios vs Lotes Switch Pill */}
        <div
          onClick={onToggleLotsModule}
          className="mx-1 mb-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 hover:border-[#facc15]/50 flex items-center justify-between text-[11px] cursor-pointer transition-all active:scale-[0.98] group"
          title={isLotsEnabled ? 'Manejo por Lotes activo. Clic para volver a Predios.' : 'Manejo por Predios activo por defecto. Clic para habilitar Lotes.'}
        >
          <span className="text-emerald-200/90 flex items-center gap-1.5 font-medium truncate">
            {isLotsEnabled ? (
              <Layers className="w-3.5 h-3.5 text-[#facc15]" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span className="group-hover:text-white transition-colors">
              {isLotsEnabled ? 'Modo: Lotes' : 'Modo: Predios (Default)'}
            </span>
          </span>
          <span className={`px-1.5 py-0.2 rounded-md font-bold text-[9px] uppercase tracking-wider shrink-0 ${
            isLotsEnabled ? 'bg-[#facc15] text-[#042e1f]' : 'bg-emerald-900/80 text-emerald-200'
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
                  <div className="h-px bg-rose-950 flex-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400/80 flex items-center gap-1">
                    Módulo Desactivado
                  </span>
                  <div className="h-px bg-rose-950 flex-1" />
                </div>
              )}

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full h-11 rounded-xl transition-all duration-200 flex items-center justify-between px-3 cursor-pointer text-left group relative ${
                  isDairy && !isDairyEnabled
                    ? 'opacity-60 bg-rose-950/30 text-rose-300 border border-rose-900/30 hover:opacity-90'
                    : isActive
                    ? 'bg-[#facc15] text-[#042e1f] font-bold shadow-[0_4px_16px_rgba(250,204,21,0.25)]'
                    : 'text-emerald-100/90 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isDairy && !isDairyEnabled
                        ? 'bg-rose-900/40 text-rose-300'
                        : isActive
                        ? 'bg-[#042e1f] text-[#facc15]'
                        : 'bg-emerald-900/50 text-emerald-200 group-hover:text-white'
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
                          ? 'text-[#042e1f] font-bold'
                          : 'text-slate-100'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-[9.5px] truncate font-medium ${
                        isDairy && !isDairyEnabled
                          ? 'text-rose-400'
                          : isActive
                          ? 'text-[#042e1f]/80'
                          : 'text-emerald-300/60'
                      }`}
                    >
                      {isDairy && !isDairyEnabled ? 'Desactivado (clic para activar)' : item.sublabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {item.hasAlertBadge && unreadAlertsCount > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-500 text-white font-mono">
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
                          ? 'text-[#042e1f] opacity-80'
                          : 'text-emerald-500/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                      }`}
                    />
                  )}
                </div>
              </motion.button>
            </React.Fragment>
          );
        })}

        {/* Security / System Logout Section */}
        <div className="pt-3 pb-1 border-t border-emerald-900/50 mt-2">
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-900/70 text-emerald-200 flex items-center justify-center shrink-0">
                  <Power className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white leading-tight">
                    Seguridad & Acceso
                  </h4>
                  <p className="text-[9.5px] text-emerald-300/70 truncate max-w-[130px]">
                    {activeUser ? activeUser.fullName : 'Modo Invitado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              {activeUser ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onLogoutUser) onLogoutUser();
                  }}
                  className="flex-1 py-1.5 px-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Salir</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAuthModal) onOpenAuthModal();
                  }}
                  className="flex-1 py-1.5 px-2.5 bg-[#facc15] hover:bg-[#fde047] text-[#042e1f] font-bold text-[10px] rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Ingresar PIN</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="p-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded-xl transition border border-emerald-700/40 cursor-pointer"
                title="Ver perfil o verificar PIN"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Sync Status */}
      <div className="p-3 m-3 rounded-2xl bg-emerald-950/80 border border-emerald-900/50 text-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-200">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#facc15]" /> Sincronización
          </span>
          <span className="text-[9px] font-mono bg-emerald-900/80 px-2 py-0.2 rounded-full text-emerald-200 border border-emerald-700/40">
            ONLINE
          </span>
        </div>
      </div>
    </aside>
  );
};

