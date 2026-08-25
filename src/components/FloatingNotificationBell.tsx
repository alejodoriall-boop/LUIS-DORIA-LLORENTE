import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';

interface FloatingNotificationBellProps {
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingNotificationBell: React.FC<FloatingNotificationBellProps> = ({
  unreadCount,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 right-3 sm:right-6 z-40 select-none print:hidden">
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onToggle}
        aria-label="Abrir panel de Operación y Avisos"
        aria-expanded={isOpen}
        title="Operación & Avisos • Notificaciones del predio"
        className={`group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.65)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D4A94E]/50 ${
          isOpen
            ? 'bg-[#123F2A] border-2 border-[#D4A94E] text-[#D4A94E] shadow-[0_0_25px_rgba(212,169,78,0.45)]'
            : 'bg-[#0D1A13]/95 backdrop-blur-xl border-2 border-[#D4A94E]/60 hover:border-[#D4A94E] text-white hover:bg-[#15241C]'
        }`}
      >
        {/* Subtle Pulse Glow when unread alerts exist */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#D4A94E]/20 animate-ping pointer-events-none" />
        )}

        {/* Bell Icon */}
        <div className="relative flex items-center justify-center">
          <Bell
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
              unreadCount > 0 ? 'group-hover:rotate-12 text-[#D4A94E]' : 'text-white group-hover:text-[#D4A94E]'
            }`}
          />
        </div>

        {/* Dynamic Alert Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#C83E4D] text-white font-mono font-black text-[10px] sm:text-[11px] rounded-full flex items-center justify-center border-2 border-[#0D1A13] shadow-md shadow-rose-950/60"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Floating Tooltip on Hover */}
        <span className="pointer-events-none absolute right-full mr-3 px-2.5 py-1 rounded-xl bg-[#0D1A13]/95 backdrop-blur-md border border-white/10 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hidden md:block">
          Operación & Avisos
          {unreadCount > 0 && (
            <span className="ml-1.5 text-[#D4A94E] font-bold">({unreadCount})</span>
          )}
        </span>
      </motion.button>
    </div>
  );
};
