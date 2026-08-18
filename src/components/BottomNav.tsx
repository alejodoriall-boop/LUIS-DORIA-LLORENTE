import React from 'react';
import { motion } from 'motion/react';
import { MainTab } from '../types';
import { CowIcon } from './icons/CowIcon';
import { HorseIcon } from './icons/HorseIcon';
import { BuffaloIcon } from './icons/BuffaloIcon';
import { GrassIcon } from './icons/GrassIcon';
import { MilkGlassIcon } from './icons/MilkGlassIcon';
import {
  Home,
  Dna,
  MapPin,
  Sparkles,
  DollarSign,
  Users,
  CloudRain,
  Warehouse,
  BarChart3,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 2,
}) => {
  const items = [
    { id: 'home' as MainTab, label: 'Inicio', icon: Home },
    { id: 'cattle' as MainTab, label: 'Ganado', icon: CowIcon },
    { id: 'buffalo' as MainTab, label: 'Búfalos', icon: BuffaloIcon },
    { id: 'dairy' as MainTab, label: 'Lechería', icon: MilkGlassIcon },
    { id: 'sales' as MainTab, label: 'Ventas', icon: DollarSign },
    { id: 'gis' as MainTab, label: 'SIG', icon: MapPin },
    { id: 'aforo' as MainTab, label: 'Aforos', icon: GrassIcon },
    { id: 'finance' as MainTab, label: 'Finanzas', icon: DollarSign },
    { id: 'rainfall' as MainTab, label: 'Lluvia', icon: CloudRain },
    { id: 'menu' as MainTab, label: 'Sanidad', icon: Sparkles, badge: unreadCount },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 flex items-center px-2 py-1.5 bg-white/90 backdrop-blur-2xl border border-black/[0.08] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] gap-1 overflow-x-auto custom-scrollbar">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center min-w-[56px] flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer select-none ${
              isActive
                ? 'bg-[#043825] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#facc15]' : 'text-slate-600'}`} />
            <span className="text-[9.5px] font-semibold tracking-tight mt-0.5 whitespace-nowrap">
              {item.label}
            </span>
            {item.badge && item.badge > 0 && !isActive && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};


