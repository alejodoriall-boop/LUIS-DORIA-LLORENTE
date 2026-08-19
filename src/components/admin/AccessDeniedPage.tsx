import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { GanaderIALogo } from '../GanaderIALogo';

export interface AccessDeniedPageProps {
  onNavigateHome?: () => void;
  onNavigateApp?: () => void;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  onNavigateHome,
  onNavigateApp,
}) => {
  return (
    <div className="min-h-screen w-full bg-[#0D1410] text-[#F5F2E9] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#C9A35A]/30 selection:text-[#F5F2E9]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#101713] rounded-3xl border border-rose-500/20 shadow-2xl p-6 sm:p-8 text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
            Error 403 • Prohibido
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F2E9]">
            Acceso Denegado
          </h1>
          <p className="text-xs sm:text-sm text-[#A5B8AC] leading-relaxed">
            No tienes permisos para acceder a esta sección. Esta ruta está estrictamente reservada para la administración global y auditoría de la plataforma.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#152019] border border-white/10 text-xs text-[#7F8C83] text-left space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#F5F2E9] font-bold">
            <Lock className="w-3.5 h-3.5 text-[#C9A35A]" />
            <span>Seguridad Institucional</span>
          </div>
          <p className="text-[11px] text-[#A5B8AC]">
            El intento de acceso no autorizado ha sido registrado en los registros de auditoría y seguridad del sistema.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          {onNavigateApp && (
            <button
              type="button"
              onClick={onNavigateApp}
              className="w-full py-2.5 px-4 bg-[#043825] hover:bg-[#075239] text-[#F5F2E9] font-bold text-xs rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#C9A35A]" />
              <span>Ir a la Aplicación</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                window.location.href = '/';
              }
            }}
            className="w-full py-2.5 px-4 bg-[#152019] hover:bg-[#1A251E] text-[#A5B8AC] hover:text-[#F5F2E9] font-semibold text-xs rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Inicio</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
