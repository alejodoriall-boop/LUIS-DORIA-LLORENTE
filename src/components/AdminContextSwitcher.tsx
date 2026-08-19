import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Building2,
  ChevronDown,
  Sparkles,
  Check,
  LogOut,
  LifeBuoy,
} from 'lucide-react';
import { AdminContextMode, TenantRecord } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';

export interface AdminContextSwitcherProps {
  currentMode: AdminContextMode;
  onModeChange: (mode: AdminContextMode) => void;
  impersonatedTenant?: TenantRecord | null;
  onExitImpersonation: () => void;
  userEmail?: string;
  isSuperadmin?: boolean;
  className?: string;
  onGoToLanding?: () => void;
}

export const AdminContextSwitcher: React.FC<AdminContextSwitcherProps> = ({
  currentMode,
  onModeChange,
  impersonatedTenant,
  onExitImpersonation,
  userEmail = 'superadmin@ganaderia.cloud',
  isSuperadmin = true,
  className = '',
  onGoToLanding,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);

  if (!isSuperadmin) return null;

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Selector Pill Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs cursor-pointer select-none ${
          currentMode === 'global_platform'
            ? 'bg-[#152019] text-[#C9A35A] border-[#C9A35A]/40 hover:bg-[#1A251E]'
            : currentMode === 'support_impersonation'
            ? 'bg-[#C9A35A] text-[#101713] border-[#C9A35A] font-extrabold hover:bg-[#D8B66C]'
            : 'bg-[#152019] text-[#F5F2E9] border-white/10 hover:bg-[#1A251E]'
        }`}
        title="Conmutador de Contexto Administrativo"
      >
        {currentMode === 'global_platform' && (
          <>
            <Globe className="w-3.5 h-3.5 text-[#C9A35A] shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[170px]">Global Superadmin</span>
          </>
        )}

        {currentMode === 'support_impersonation' && (
          <>
            <LifeBuoy className="w-3.5 h-3.5 text-[#101713] shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[170px]">
              Soporte: {impersonatedTenant?.farmName || 'Cliente'}
            </span>
          </>
        )}

        {currentMode === 'my_farms' && (
          <>
            <Building2 className="w-3.5 h-3.5 text-[#A5B8AC] shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[170px]">Mis Fincas Propias</span>
          </>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 opacity-100' : 'opacity-70'
          }`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <div
              className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="fixed sm:absolute right-3 sm:right-0 sm:left-auto top-16 sm:top-full mt-2 w-auto sm:w-80 max-w-sm bg-[#152019] rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3.5 z-50 space-y-2 text-left text-[#F5F2E9]"
            >
              {/* Header */}
              <div className="px-2 py-1.5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#7F8C83] uppercase tracking-wider block">
                    Espacio de Trabajo
                  </span>
                  <p className="text-xs font-semibold text-[#F5F2E9] truncate">
                    {userEmail}
                  </p>
                </div>
                <span className="text-[9px] font-mono font-bold bg-[#C9A35A]/15 text-[#C9A35A] px-2 py-0.5 rounded-md border border-[#C9A35A]/30">
                  SUPERADMIN
                </span>
              </div>

              {/* Options */}
              <div className="space-y-1">
                {/* 1. Global Platform */}
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('global_platform');
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    currentMode === 'global_platform'
                      ? 'bg-[#202B24] text-[#C9A35A] font-bold border border-[#C9A35A]/30 shadow-xs'
                      : 'hover:bg-white/5 text-[#B9C3BB]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#C9A35A]/15 text-[#C9A35A] flex items-center justify-center shrink-0 border border-[#C9A35A]/30">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold leading-tight text-[#F5F2E9]">🌐 Panel Plataforma Global</p>
                      <p className="text-[10px] text-[#A5B8AC]">
                        KPIs SaaS, Tenants, Storage & Audit
                      </p>
                    </div>
                  </div>
                  {currentMode === 'global_platform' && (
                    <Check className="w-4 h-4 text-[#C9A35A] shrink-0" />
                  )}
                </button>

                {/* 2. My Own Farms */}
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('my_farms');
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    currentMode === 'my_farms'
                      ? 'bg-[#202B24] text-[#F5F2E9] font-bold border border-white/20 shadow-xs'
                      : 'hover:bg-white/5 text-[#B9C3BB]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold leading-tight text-[#F5F2E9]">🐄 Mis Fincas Propias</p>
                      <p className="text-[10px] text-[#A5B8AC]">
                        Vista operativa de ganadería estándar
                      </p>
                    </div>
                  </div>
                  {currentMode === 'my_farms' && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>

                {/* 3. Public Home Page */}
                {onGoToLanding && (
                  <button
                    type="button"
                    onClick={() => {
                      onGoToLanding();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer hover:bg-[#C9A35A]/10 text-[#C9A35A] border-t border-white/10 pt-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#C9A35A]/15 text-[#C9A35A] flex items-center justify-center shrink-0 border border-[#C9A35A]/30">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold leading-tight text-[#C9A35A]">🏠 Home Page Pública</p>
                        <p className="text-[10px] text-[#A5B8AC]">
                          Presentación oficial y portal público
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* 4. Support Impersonation Option */}
                {impersonatedTenant && (
                  <div className="pt-1">
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-200">
                          <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] font-bold">Modo Soporte Activo</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-[#C9A35A] text-[#101713] px-1.5 py-0.2 rounded">
                          {impersonatedTenant.tenantCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A5B8AC] truncate">
                        Finca: <span className="font-bold text-[#F5F2E9]">{impersonatedTenant.farmName}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onExitImpersonation();
                          setIsOpen(false);
                        }}
                        className="w-full py-1.5 bg-[#C9A35A] hover:bg-[#D8B66C] text-[#101713] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3 text-[#101713]" />
                        <span>Salir de Impersonación</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
