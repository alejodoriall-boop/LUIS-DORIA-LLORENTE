import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Building2,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Check,
  ArrowRight,
  LogOut,
  Sliders,
  LifeBuoy,
} from 'lucide-react';
import { AdminContextMode, TenantRecord, FarmDataPackage } from '../types';
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
            ? 'bg-neutral-900 text-amber-300 border-amber-500/30 hover:bg-neutral-800'
            : currentMode === 'support_impersonation'
            ? 'bg-amber-500 text-neutral-950 border-amber-600 font-extrabold hover:bg-amber-400 animate-pulse'
            : 'bg-emerald-900 text-emerald-100 border-emerald-700/50 hover:bg-emerald-850'
        }`}
        title="Conmutador de Contexto Administrativo"
      >
        {currentMode === 'global_platform' && (
          <>
            <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[170px]">Global Superadmin</span>
          </>
        )}

        {currentMode === 'support_impersonation' && (
          <>
            <LifeBuoy className="w-3.5 h-3.5 text-neutral-950 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[170px]">
              Soporte: {impersonatedTenant?.farmName || 'Cliente'}
            </span>
          </>
        )}

        {currentMode === 'my_farms' && (
          <>
            <Building2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
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
              className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="fixed sm:absolute right-3 sm:right-0 sm:left-auto top-16 sm:top-full mt-2 w-auto sm:w-80 max-w-sm bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-3 z-50 space-y-2 text-left"
            >
              {/* Header */}
              <div className="px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                    Espacio de Trabajo
                  </span>
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                    {userEmail}
                  </p>
                </div>
                <span className="text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300/40">
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
                      ? 'bg-neutral-950 text-amber-300 font-bold border border-neutral-800 shadow-xs'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold leading-tight">🌐 Panel Plataforma Global</p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        KPIs SaaS, Tenants, Storage & Audit
                      </p>
                    </div>
                  </div>
                  {currentMode === 'global_platform' && (
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
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
                      ? 'bg-emerald-950 text-emerald-100 font-bold border border-emerald-800 shadow-xs'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold leading-tight">🐄 Mis Fincas Propias</p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        Vista operativa de ganadería estándar
                      </p>
                    </div>
                  </div>
                  {currentMode === 'my_farms' && (
                    <Check className="w-4 h-4 text-emerald-300 shrink-0" />
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
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-t border-neutral-100 dark:border-neutral-800 pt-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold leading-tight">🏠 Home Page Pública</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          Presentación oficial y portal público
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* 4. Support Impersonation Option */}
                {impersonatedTenant && (
                  <div className="pt-1">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                          <LifeBuoy className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[11px] font-bold">Modo Soporte Activo</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 px-1.5 py-0.2 rounded">
                          {impersonatedTenant.tenantCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate">
                        Finca: <span className="font-bold">{impersonatedTenant.farmName}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onExitImpersonation();
                          setIsOpen(false);
                        }}
                        className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
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
