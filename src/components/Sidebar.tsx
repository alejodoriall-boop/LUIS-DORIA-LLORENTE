import React from 'react';
import { MainTab } from '../types';
import { CowIcon } from './icons/CowIcon';
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
  CloudRain,
  Warehouse,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Bell,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  unreadAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
}) => {
  const navItems = [
    {
      id: 'home' as MainTab,
      label: 'HOME',
      sublabel: 'PANEL PRINCIPAL',
      icon: Home,
    },
    {
      id: 'cattle' as MainTab,
      label: 'INVENTARIOS DE GANADO',
      sublabel: 'CEBA / CRÍA & LEVANTE',
      icon: CowIcon,
    },
    {
      id: 'dairy' as MainTab,
      label: 'LECHERÍA ESPECIALIZADA',
      sublabel: 'LECHERÍA & ORDEÑO',
      icon: MilkGlassIcon,
    },
    {
      id: 'genetics' as MainTab,
      label: 'REPRODUCCIÓN & GENÉTICA',
      sublabel: 'REPRODUCCIÓN & PEDIGRÍ',
      icon: Dna,
    },
    {
      id: 'gis' as MainTab,
      label: 'SIG',
      sublabel: 'POTREROS & MAPAS',
      icon: MapPin,
      badgeColor: 'bg-[#ffba38] text-[#523700]',
    },
    {
      id: 'aforo' as MainTab,
      label: 'AFOROS',
      sublabel: 'PASTOS / CARGA',
      icon: GrassIcon,
    },
    {
      id: 'finance' as MainTab,
      label: 'FINANZAS',
      sublabel: '$/HA / MES',
      icon: DollarSign,
      badgeColor: 'bg-[#1098ad] text-white',
    },
    {
      id: 'rainfall' as MainTab,
      label: 'LLUVIA',
      sublabel: 'PLUVIÓMETRO',
      icon: CloudRain,
    },
    {
      id: 'inventory' as MainTab,
      label: 'ALMACÉN',
      sublabel: 'INVENTARIOS',
      icon: Warehouse,
    },
    {
      id: 'menu' as MainTab,
      label: 'ASISTENTE',
      sublabel: 'SANIDAD & IA',
      icon: Sparkles,
      hasAlertBadge: true,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#012d1d] text-white border-r-2 border-[#1b4332] h-screen sticky top-0 shrink-0 z-40 shadow-xl overflow-y-auto select-none">
      {/* Sidebar Header Brand */}
      <div className="p-5 border-b border-[#1b4332]/80 bg-[#002216]/60 backdrop-blur-xs flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <GanaderIALogo
            variant="full"
            size="md"
            theme="dark"
            onClick={() => setActiveTab('home')}
          />
          <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold tracking-wider bg-[#1b4332] text-[#c1ecd4] px-1.5 py-0.5 rounded border border-[#c1ecd4]/20 shrink-0">
            <ShieldCheck className="w-2.5 h-2.5" /> PRO
          </span>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 pt-1 flex items-center justify-between">
          <p className="text-[10px] font-extrabold text-[#c1ecd4]/60 uppercase tracking-widest">
            MÓDULOS DE GESTIÓN
          </p>
          <span className="text-[10px] font-mono text-[#ffba38]/80 font-bold">10/10</span>
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full h-12 lg:h-[50px] rounded-2xl transition-all duration-200 flex items-center justify-between px-3.5 cursor-pointer text-left group ${
                isActive
                  ? 'bg-[#ffba38] text-[#012d1d] font-extrabold shadow-lg shadow-[#ffba38]/20 scale-[1.02]'
                  : 'bg-[#012d1d] hover:bg-[#1b4332]/90 text-[#c1ecd4]/90 hover:text-white border border-transparent hover:border-[#1b4332]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#012d1d] text-[#ffba38]'
                      : 'bg-[#1b4332]/80 text-[#c1ecd4] group-hover:bg-[#012d1d] group-hover:text-[#ffba38]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex flex-col leading-tight truncate">
                  <span
                    className={`font-black text-xs tracking-wider uppercase truncate ${
                      isActive ? 'text-[#012d1d]' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-[9.5px] font-bold truncate ${
                      isActive ? 'text-[#012d1d]/80' : 'text-[#c1ecd4]/60'
                    }`}
                  >
                    {item.sublabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {item.hasAlertBadge && unreadAlertsCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black rounded-full animate-pulse ${
                      isActive
                        ? 'bg-[#ba1a1a] text-white'
                        : 'bg-[#ba1a1a] text-white'
                    }`}
                  >
                    <Bell className="w-2.5 h-2.5 mr-0.5" />
                    {unreadAlertsCount}
                  </span>
                )}

                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isActive
                      ? 'text-[#012d1d] translate-x-0.5'
                      : 'text-[#1b4332] opacity-0 group-hover:opacity-100 group-hover:text-[#c1ecd4] group-hover:translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer Widget */}
      <div className="p-3.5 m-3 rounded-2xl bg-[#002216]/80 border border-[#1b4332] text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#c1ecd4]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#ffba38]" /> Sincronización
          </span>
          <span className="text-[9px] font-mono bg-[#1b4332] px-1.5 py-0.5 rounded text-[#c1ecd4]">
            ONLINE
          </span>
        </div>
        <p className="text-[10px] text-[#c1ecd4]/70 leading-snug">
          Datos sincronizados con la nube. Control de inventario en tiempo real.
        </p>
      </div>
    </aside>
  );
};
