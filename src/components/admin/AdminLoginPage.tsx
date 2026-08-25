import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Shield,
  Server,
  Fingerprint,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { GanaderIALogo } from '../GanaderIALogo';
import { adminAuthService } from '../../services/adminAuthService';

export interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu identificador y contraseña administrativa.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Simulate cryptographic handshake delay for brute force protection
      await new Promise((res) => setTimeout(res, 600));

      const result = await adminAuthService.loginSuperadmin(
        identifier,
        password,
        twoFactorCode
      );

      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.message || 'Credenciales administrativas no autorizadas.');
        if (result.attemptsRemaining !== undefined) {
          setAttemptsRemaining(result.attemptsRemaining);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error de comunicación con el servicio de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0D1A13] text-[#FFFFFF] flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-[#D4A94E]/30 selection:text-[#FFFFFF]">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#123F2A]/25 via-transparent to-transparent pointer-events-none" />

      {/* Top bar with back to public home button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <button
          type="button"
          onClick={() => {
            if (onNavigateHome) {
              onNavigateHome();
            } else {
              window.location.href = '/';
            }
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#15241C] hover:bg-[#1A251E] border border-white/10 text-xs font-semibold text-[#A5B8AC] hover:text-[#FFFFFF] transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4A94E]" />
          <span>Volver al sitio público</span>
        </button>
      </div>

      {/* Main Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#0D1A13] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 relative z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3.5 rounded-2xl bg-[#15241C] border border-white/10 shadow-inner flex items-center justify-center">
            <GanaderIALogo className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4A94E]/10 border border-[#D4A94E]/30 text-[10px] font-bold font-mono uppercase tracking-wider text-[#D4A94E]">
              <Shield className="w-3 h-3" />
              <span>Portal de Control Global</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] tracking-tight">
              Administración Global
            </h1>
            <p className="text-xs text-[#A5B8AC] max-w-xs mx-auto leading-relaxed">
              Acceso exclusivo y verificado para supervisión de infraestructura, tenants y operaciones de GanaderIA Cloud.
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold leading-tight">{errorMessage}</p>
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <p className="text-[11px] text-rose-300/80">
                  Intentos restantes antes de bloqueo temporal: <strong>{attemptsRemaining}</strong>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identificador / Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-identifier"
              className="block text-xs font-bold text-[#FFFFFF] tracking-wide"
            >
              Identificador o Correo Institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7F8C83]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="admin-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="superadmin@ganaderia.cloud"
                autoComplete="username"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#15241C] border border-white/10 rounded-xl text-xs sm:text-sm text-[#FFFFFF] placeholder-[#58635B] focus:outline-none focus:border-[#D4A94E] focus:ring-1 focus:ring-[#D4A94E] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-[#FFFFFF] tracking-wide"
              >
                Contraseña Administrativa
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7F8C83]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2.5 bg-[#15241C] border border-white/10 rounded-xl text-xs sm:text-sm text-[#FFFFFF] placeholder-[#58635B] focus:outline-none focus:border-[#D4A94E] focus:ring-1 focus:ring-[#D4A94E] transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7F8C83] hover:text-[#FFFFFF] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Optional 2FA Code */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="admin-2fa"
                className="block text-[11px] font-semibold text-[#A5B8AC]"
              >
                Código de Autenticación 2FA / Token (Opcional)
              </label>
              <span className="text-[10px] text-[#7F8C83]">TOTP / Token</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7F8C83]">
                <Fingerprint className="w-4 h-4" />
              </div>
              <input
                id="admin-2fa"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#15241C] border border-white/10 rounded-xl text-xs sm:text-sm text-[#FFFFFF] font-mono tracking-widest placeholder-[#58635B] focus:outline-none focus:border-[#D4A94E] focus:ring-1 focus:ring-[#D4A94E] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#D4A94E] hover:bg-[#D8B66C] active:scale-[0.98] disabled:bg-[#1A251E] disabled:text-[#58635B] disabled:cursor-not-allowed text-[#0D1A13] font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0D1A13]" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al panel global</span>
                  <ArrowRight className="w-4 h-4 text-[#0D1A13]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Disclaimers & Audit Info */}
        <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] text-[#A5B8AC]/70 text-center">
          <div className="flex items-center justify-center gap-3 text-[10px] text-[#7F8C83]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Cifrado TLS 1.3
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-[#D4A94E]" />
              Auditoría Inmutable
            </span>
          </div>
          <p className="leading-relaxed">
            Todas las acciones administrativas, intentos de acceso y sesiones son registradas permanentemente con dirección IP y firma criptográfica.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
