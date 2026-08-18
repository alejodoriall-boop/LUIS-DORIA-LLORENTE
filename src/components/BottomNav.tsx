import React from 'react';
import { motion } from 'motion/react';
import { MainTab } from '../types';
import { CowIcon } from './icons/CowIcon';
import { BuffaloIcon } from './icons/BuffaloIcon';
import { MilkGlassIcon } from './icons/MilkGlassIcon';
import {
  Home,
  DollarSign,
  Menu,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  unreadCount?: number;
  onOpenMobileMenu?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  onOpenMobileMenu,
}) => {
  const primaryTabs: { id: MainTab; label: string; icon: React.FC<any> }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'cattle', label: 'Ganado', icon: CowIcon },
    { id: 'buffalo', label: 'Búfalos', icon: BuffaloIcon },
    { id: 'dairy', label: 'Lechería', icon: MilkGlassIcon },
    { id: 'sales', label: 'Ventas', icon: DollarSign },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-1.5 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around select-none">
      {primaryTabs.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#043825] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 active:bg-slate-100/80'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#facc15]' : 'text-slate-600'}`} />
            <span
              className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
                isActive ? 'font-bold text-white' : 'font-semibold text-slate-600'
              }`}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}

      {/* Menú Más Button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          if (onOpenMobileMenu) {
            onOpenMobileMenu();
          } else {
            setActiveTab('menu');
          }
        }}
        className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-600 hover:text-slate-900 active:bg-slate-100/80 transition-all duration-200 cursor-pointer"
      >
        <div className="relative">
          <Menu className="w-4 h-4 text-emerald-800 shrink-0" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          )}
        </div>
        <span className="text-[10px] font-semibold text-slate-700 tracking-tight mt-0.5 whitespace-nowrap">
          Menú Más
        </span>
      </motion.button>
    </nav>
  );
};



