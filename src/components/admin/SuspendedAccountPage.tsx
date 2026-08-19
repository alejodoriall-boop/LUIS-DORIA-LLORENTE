import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Phone, Mail, ArrowLeft, Shield } from 'lucide-react';
import { GanaderIALogo } from '../GanaderIALogo';

export interface SuspendedAccountPageProps {
  onNavigateHome?: () => void;
}

export const SuspendedAccountPage: React.FC<SuspendedAccountPageProps> = ({
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen w-full bg-[#0D1410] text-[#F5F2E9] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#C9A35A]/30 selection:text-[#F5F2E9]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#101713] rounded-3xl border border-amber-500/20 shadow-2xl p-6 sm:p-8 text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Suscripción Pausada
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F2E9]">
            Acceso Temporalmente Suspendido
          </h1>
          <p className="text-xs sm:text-sm text-[#A5B8AC] leading-relaxed">
            El acceso a esta cuenta o predio ha sido pausado por vencimiento del ciclo de facturación o solicitud administrativa.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#152019] border border-white/10 text-xs text-left space-y-2.5">
          <div className="flex items-center gap-1.5 text-[#F5F2E9] font-bold">
            <Shield className="w-4 h-4 text-[#C9A35A]" />
            <span>Contacto de Soporte & Facturación</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-[#A5B8AC]">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#C9A35A]" />
              <span>soporte@ganaderia.cloud</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#C9A35A]" />
              <span>+57 (310) 892-4011</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onNavigateHome) {
              onNavigateHome();
            } else {
              window.location.href = '/';
            }
          }}
          className="w-full py-2.5 px-4 bg-[#152019] hover:bg-[#1A251E] text-[#F5F2E9] font-semibold text-xs rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al sitio público</span>
        </button>
      </motion.div>
    </div>
  );
};
