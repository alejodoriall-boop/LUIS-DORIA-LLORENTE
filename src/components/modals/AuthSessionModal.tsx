import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Search,
  User,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { AdminUser, SystemRoleType } from '../../types';
import { GanaderIALogo } from '../GanaderIALogo';

export interface AuthSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AdminUser[];
  activeUser: AdminUser | null;
  onLoginUser: (user: AdminUser, pinInput: string) => boolean;
  onLogoutUser: () => void;
  onNavigateToAdmin?: () => void;
}

export const AuthSessionModal: React.FC<AuthSessionModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUser,
  onLoginUser,
  onLogoutUser,
  onNavigateToAdmin,
}) => {
  const [selectedUserToLogin, setSelectedUserToLogin] = useState<AdminUser | null>(
    activeUser || users[0] || null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pinInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync selected user when activeUser changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUserToLogin(activeUser || users[0] || null);
      setPinInput('');
      setLoginError(null);
      setLoginSuccessMessage(null);
      setIsDropdownOpen(false);
      setSearchQuery('');
      setIsSubmitting(false);

      // Focus PIN input after modal renders
      const timer = setTimeout(() => {
        pinInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeUser, users]);

  // Handle escape key to close dropdown or modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDropdownOpen, onClose]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && users.length > 5) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen, users.length]);

  if (!isOpen) return null;

  const isSwitchingSession = !!activeUser && activeUser.id !== selectedUserToLogin?.id;
  const isCurrentlyActiveUser = !!activeUser && activeUser.id === selectedUserToLogin?.id;

  const getInitials = (name: string): string => {
    const cleanName = name
      .replace(/^(Don|Doña|Dra\.|Dr\.|Ing\.|Lic\.|Sr\.|Sra\.)\s+/i, '')
      .trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getRoleLabel = (role: SystemRoleType): string => {
    switch (role) {
      case 'propietario':
        return 'Propietario / Socio';
      case 'administrador':
        return 'Administrador General';
      case 'veterinario':
        return 'Veterinario / Zootecnista';
      case 'mayordomo':
        return 'Mayordomo / Caporal';
      case 'financiero_contador':
        return 'Financiero / Contador';
      default:
        return 'Usuario Administrativo';
    }
  };

  const getRoleBadgeStyle = (role: SystemRoleType): string => {
    switch (role) {
      case 'propietario':
        return 'bg-[#C9A35A]/15 text-[#C9A35A] border-[#C9A35A]/30';
      case 'administrador':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'veterinario':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'mayordomo':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'financiero_contador':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30';
    }
  };

  const handleSelectUser = (user: AdminUser) => {
    setSelectedUserToLogin(user);
    setIsDropdownOpen(false);
    setSearchQuery('');
    setPinInput('');
    setLoginError(null);
    setLoginSuccessMessage(null);
    // Auto-focus PIN input
    setTimeout(() => {
      pinInputRef.current?.focus();
    }, 100);
  };

  const handlePerformLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessMessage(null);

    if (!selectedUserToLogin) {
      setLoginError('Selecciona un perfil para continuar.');
      return;
    }

    const trimmedPin = pinInput.trim();
    if (!trimmedPin) {
      setLoginError('Ingresa tu PIN de seguridad.');
      pinInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    // Validate using existing authentication logic
    const success = onLoginUser(selectedUserToLogin, trimmedPin);
    if (success) {
      setLoginSuccessMessage(`¡Bienvenido, ${selectedUserToLogin.fullName.split(' ')[0]}!`);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 600);
    } else {
      setIsSubmitting(false);
      setLoginError('El PIN ingresado no es correcto.');
      setPinInput('');
      pinInputRef.current?.focus();
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(query) ||
      (u.customRoleTitle && u.customRoleTitle.toLowerCase().includes(query)) ||
      u.roleType.toLowerCase().includes(query) ||
      u.documentId.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md transition-all duration-200"
      onClick={(e) => {
        if (modalContainerRef.current && !modalContainerRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <motion.div
        ref={modalContainerRef}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-[460px] bg-[#101713] border border-white/10 rounded-[22px] shadow-2xl overflow-hidden relative flex flex-col text-[#F5F2E9] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A35A]/60 to-transparent" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana de acceso"
          className="absolute top-4 right-4 p-2 text-[#A5B8AC] hover:text-[#F5F2E9] hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado del Modal */}
        <div className="px-6 sm:px-7 pt-7 pb-4 text-left">
          <div className="flex items-center gap-3 mb-3">
            <GanaderIALogo variant="icon" size="sm" />
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#043825] border border-emerald-500/25">
              <ShieldCheck className="w-3 h-3 text-[#C9A35A]" />
              <span className="text-[10px] font-bold tracking-widest text-[#C9A35A] uppercase font-mono">
                Acceso Seguro
              </span>
            </div>
          </div>

          <h2
            id="auth-modal-title"
            className="font-serif text-2xl sm:text-[26px] font-bold text-[#F5F2E9] tracking-tight leading-tight"
          >
            {activeUser ? 'Cambiar perfil' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-xs sm:text-sm text-[#A5B8AC] mt-1 leading-relaxed">
            {activeUser
              ? 'Selecciona otro perfil para alternar la sesión activa'
              : 'Selecciona tu perfil e ingresa tu PIN para continuar'}
          </p>
        </div>

        {/* Formulario Principal de Autenticación */}
        <form onSubmit={handlePerformLogin} className="px-6 sm:px-7 pb-6 space-y-4 text-left">
          
          {/* Selector de Perfil Desplegable */}
          <div className="space-y-1.5" ref={dropdownRef}>
            <label className="text-xs font-semibold text-[#A5B8AC] block">
              Perfil de ingreso
            </label>

            {/* If a user is selected and dropdown is closed, show selected card with "Cambiar" */}
            {selectedUserToLogin && !isDropdownOpen ? (
              <div className="p-3 bg-[#202B24] border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Initials Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-[#043825] border border-[#C9A35A]/30 text-[#C9A35A] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {getInitials(selectedUserToLogin.fullName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#F5F2E9] truncate leading-tight">
                        {selectedUserToLogin.fullName}
                      </h4>
                      {isCurrentlyActiveUser && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded shrink-0">
                          En sesión
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#A5B8AC] truncate mt-0.5">
                      {selectedUserToLogin.customRoleTitle || getRoleLabel(selectedUserToLogin.roleType)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border hidden sm:inline-block ${getRoleBadgeStyle(
                      selectedUserToLogin.roleType
                    )}`}
                  >
                    {selectedUserToLogin.roleType}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(true)}
                    className="px-2.5 py-1 text-xs font-semibold text-[#C9A35A] hover:text-[#d6b56f] bg-white/[0.04] hover:bg-white/[0.08] rounded-lg border border-white/10 transition-colors cursor-pointer"
                    aria-label="Cambiar perfil seleccionado"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            ) : (
              /* Dropdown Trigger Button */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                  className="w-full px-3.5 py-2.5 bg-[#202B24] border border-white/10 hover:border-white/20 rounded-xl text-left text-sm flex items-center justify-between text-[#F5F2E9] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C9A35A]/50"
                >
                  <div className="flex items-center gap-2.5 text-[#A5B8AC]">
                    <User className="w-4 h-4 text-[#C9A35A]" />
                    <span className={selectedUserToLogin ? 'text-[#F5F2E9] font-medium' : 'text-[#A5B8AC]'}>
                      {selectedUserToLogin ? selectedUserToLogin.fullName : 'Seleccionar perfil de ingreso...'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#A5B8AC] transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-[#C9A35A]' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Container */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1.5 bg-[#152019] border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden max-h-60 flex flex-col"
                    >
                      {/* Search Bar if > 4 users */}
                      {users.length > 4 && (
                        <div className="p-2 border-b border-white/10 sticky top-0 bg-[#152019]">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-[#A5B8AC] absolute left-3 pointer-events-none" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder="Buscar colaborador..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#202B24] border border-white/10 rounded-lg text-[#F5F2E9] placeholder-[#A5B8AC]/60 focus:outline-none focus:border-[#C9A35A]"
                            />
                          </div>
                        </div>
                      )}

                      {/* User Items List */}
                      <div className="overflow-y-auto p-1.5 space-y-1">
                        {filteredUsers.length === 0 ? (
                          <div className="py-4 text-center text-xs text-[#A5B8AC]">
                            No se encontraron perfiles con "{searchQuery}"
                          </div>
                        ) : (
                          filteredUsers.map((u) => {
                            const isSelected = selectedUserToLogin?.id === u.id;
                            const isActive = activeUser?.id === u.id;
                            return (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleSelectUser(u)}
                                className={`w-full p-2.5 rounded-lg flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#043825] border border-emerald-500/40 text-white'
                                    : 'hover:bg-white/[0.05] text-[#F5F2E9]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                      isSelected
                                        ? 'bg-[#C9A35A] text-[#101713]'
                                        : 'bg-[#202B24] text-[#A5B8AC] border border-white/10'
                                    }`}
                                  >
                                    {getInitials(u.fullName)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-xs text-[#F5F2E9] truncate">
                                        {u.fullName}
                                      </span>
                                      {isActive && (
                                        <span className="text-[8px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded">
                                          Sesión
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-[#A5B8AC] truncate block">
                                      {u.customRoleTitle || getRoleLabel(u.roleType)}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`text-[9px] font-semibold px-2 py-0.5 rounded border shrink-0 ${getRoleBadgeStyle(
                                    u.roleType
                                  )}`}
                                >
                                  {u.roleType}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Campo de PIN de Seguridad */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="security-pin-input"
                className="text-xs font-semibold text-[#A5B8AC] flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#C9A35A]" />
                <span>PIN de seguridad</span>
              </label>
              {selectedUserToLogin && (
                <span className="text-[11px] text-[#A5B8AC]/70">
                  {selectedUserToLogin.fullName.split(' ')[0]}
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[#A5B8AC] pointer-events-none">
                <Lock className="w-4 h-4 text-[#C9A35A]" />
              </div>

              <input
                ref={pinInputRef}
                id="security-pin-input"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                autoComplete="current-password"
                placeholder="Ingresa tu PIN"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                className="w-full pl-10 pr-11 py-3 bg-[#202B24] border border-white/10 focus:border-[#C9A35A] focus:ring-1 focus:ring-[#C9A35A] rounded-xl text-[#F5F2E9] placeholder-[#A5B8AC]/50 text-sm font-mono tracking-widest transition-all outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                className="absolute right-3 p-1.5 text-[#A5B8AC] hover:text-[#F5F2E9] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Demo PIN Helper */}
            {selectedUserToLogin && selectedUserToLogin.securityPin && (
              <div className="flex items-center justify-between text-[11px] px-1 pt-0.5 text-[#A5B8AC]">
                <span>PIN por defecto: <strong className="font-mono text-[#C9A35A]">{selectedUserToLogin.securityPin}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setPinInput(selectedUserToLogin.securityPin);
                    if (loginError) setLoginError(null);
                  }}
                  className="text-[#C9A35A] hover:underline font-semibold cursor-pointer"
                >
                  Autocompletar PIN
                </button>
              </div>
            )}

            {/* Error Message Inline (aria-live) */}
            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  aria-live="polite"
                  className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message Inline (aria-live) */}
            <AnimatePresence>
              {loginSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  aria-live="polite"
                  className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{loginSuccessMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedUserToLogin || !pinInput.trim()}
              className="w-full py-3.5 px-4 bg-[#C9A35A] hover:bg-[#b89249] disabled:bg-[#202B24] disabled:text-[#A5B8AC]/40 disabled:border-white/5 disabled:cursor-not-allowed text-[#101713] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#101713] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isSwitchingSession ? 'Confirmar cambio de perfil' : 'Ingresar a GanaderIA'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#A5B8AC] hover:text-[#F5F2E9] py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              {/* Opción para cerrar sesión activa si existe */}
              {activeUser && (
                <button
                  type="button"
                  onClick={() => {
                    onLogoutUser();
                    onClose();
                  }}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 py-1.5 px-2 rounded-lg hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar sesión actual</span>
                </button>
              )}
            </div>
          </div>

          {/* Línea de Seguridad Visual */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-[#A5B8AC]/50">
            <Shield className="w-3.5 h-3.5" />
            <span>Acceso protegido · Sesión privada</span>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
