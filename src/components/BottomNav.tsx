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
  unreadAlertsCount?: number;
  isDairyEnabled?: boolean;
  onOpenMobileMenu?: () => void;
  onOpenMoreMenu?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  unreadAlertsCount = 0,
  onOpenMobileMenu,
  onOpenMoreMenu,
}) => {
  const handleOpenMenu = onOpenMoreMenu || onOpenMobileMenu;
  const effectiveUnread = unreadAlertsCount || unreadCount;
  const primaryTabs: { id: MainTab; label: string; icon: React.FC<any> }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'cattle', label: 'Ganado', icon: CowIcon },
    { id: 'buffalo', label: 'Búfalos', icon: BuffaloIcon },
    { id: 'dairy', label: 'Lechería', icon: MilkGlassIcon },
    { id: 'sales', label: 'Ventas', icon: DollarSign },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D1A13]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.6)] px-1.5 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around select-none">
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
                ? 'bg-[#D4A94E]/15 text-white border border-[#D4A94E]/40 shadow-xs'
                : 'text-[#A5B8AC] hover:text-white active:bg-white/5'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4A94E]' : 'text-[#A5B8AC]'}`} />
            <span
              className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
                isActive ? 'font-bold text-white' : 'font-semibold text-[#A5B8AC]'
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
          if (handleOpenMenu) {
            handleOpenMenu();
          } else {
            setActiveTab('menu');
          }
        }}
        className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[#A5B8AC] hover:text-white active:bg-white/5 transition-all duration-200 cursor-pointer"
      >
        <div className="relative">
          <Menu className="w-4 h-4 text-[#D4A94E] shrink-0" />
          {effectiveUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C83E4D] rounded-full ring-2 ring-[#0D1A13]" />
          )}
        </div>
        <span className="text-[10px] font-semibold text-[#A5B8AC] tracking-tight mt-0.5 whitespace-nowrap">
          Menú Más
        </span>
      </motion.button>
    </nav>
  );
};
