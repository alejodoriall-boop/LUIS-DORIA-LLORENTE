import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  LogOut,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Award,
  Users,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AdminUser, SystemRoleType } from '../../types';

interface AuthSessionModalProps {
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
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectUser = (user: AdminUser) => {
    setSelectedUserToLogin(user);
    setPinInput('');
    setLoginError(null);
    setLoginSuccessMessage(null);
  };

  const handlePerformLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!selectedUserToLogin) {
      setLoginError('Por favor seleccione un perfil de usuario.');
      return;
    }

    if (!pinInput.trim()) {
      setLoginError('Por favor ingrese su PIN de acceso de 4 dígitos.');
      return;
    }

    const success = onLoginUser(selectedUserToLogin, pinInput.trim());
    if (success) {
      setLoginSuccessMessage(`¡Bienvenido de nuevo, ${selectedUserToLogin.fullName}!`);
      setTimeout(() => {
        setLoginSuccessMessage(null);
        onClose();
      }, 1200);
    } else {
      setLoginError('PIN de seguridad incorrecto. Intente de nuevo.');
    }
  };

  const getRoleBadgeStyle = (role: SystemRoleType) => {
    switch (role) {
      case 'propietario':
        return 'bg-amber-100 text-amber-950 border-amber-300';
      case 'administrador':
        return 'bg-blue-100 text-blue-950 border-blue-300';
      case 'veterinario':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300';
      case 'mayordomo':
        return 'bg-orange-100 text-orange-950 border-orange-300';
      case 'financiero_contador':
        return 'bg-purple-100 text-purple-950 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleLabel = (role: SystemRoleType) => {
    switch (role) {
      case 'propietario':
        return '👑 Propietario / Socio';
      case 'administrador':
        return '🏢 Administrador General';
      case 'veterinario':
        return '🩺 Veterinario / Zootecnista';
      case 'mayordomo':
        return '🤠 Mayordomo / Caporal';
      case 'financiero_contador':
        return '💼 Financiero / Contador';
      default:
        return '👤 Usuario Administrativo';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-[#012d1d] via-[#02402a] to-[#011c12] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#ffba38] text-[#012d1d] rounded-2xl shadow-md font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest block">
                Control de Sesión de Usuario
              </span>
              <h2 className="text-xl font-black text-white">Inicio & Cierre de Sesión</h2>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* CURRENT USER STATUS CARD */}
          {activeUser ? (
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-black text-lg shadow-sm border border-[#ffba38]/30">
                    {activeUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                        ● Sesión Activa
                      </span>
                    </div>
                    <h3 className="font-black text-base text-gray-900 mt-0.5">{activeUser.fullName}</h3>
                    <p className="text-xs text-gray-600 font-mono">
                      {getRoleLabel(activeUser.roleType)} • C.C. {activeUser.documentId}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getRoleBadgeStyle(activeUser.roleType)}`}>
                  {activeUser.customRoleTitle || activeUser.roleType}
                </span>
              </div>

              <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">
                  Matrícula/Pin: <b className="font-mono text-gray-900">•••• ({activeUser.securityPin})</b>
                </span>

                <div className="flex items-center gap-2">
                  {onNavigateToAdmin && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToAdmin();
                      }}
                      className="text-xs font-bold text-[#012d1d] bg-white hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-300 transition"
                    >
                      Ver Roles & Permisos →
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onLogoutUser();
                      setLoginSuccessMessage('Sesión cerrada correctamente.');
                      setTimeout(() => setLoginSuccessMessage(null), 2000);
                    }}
                    className="text-xs font-black text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-xl border border-rose-300 transition flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="text-xs text-amber-900">
                <b>Sin Sesión Iniciada:</b> Seleccione su usuario a continuación e ingrese su PIN para autenticarse en el sistema.
              </div>
            </div>
          )}

          {/* LOGIN / USER SWITCH FORM */}
          <form onSubmit={handlePerformLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="font-black text-xs uppercase tracking-wider text-gray-800 block">
                1. Seleccionar Usuario / Perfil de Ingreso:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 pr-2">
                {users.map((u) => {
                  const isSelected = selectedUserToLogin?.id === u.id;
                  const isActiveSession = activeUser?.id === u.id;

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#012d1d] text-white border-[#ffba38] shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div
                          className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#ffba38] text-[#012d1d]'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {u.fullName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-xs truncate leading-tight">{u.fullName}</h4>
                          <span
                            className={`text-[10px] block truncate font-mono ${
                              isSelected ? 'text-amber-200' : 'text-gray-500'
                            }`}
                          >
                            {u.customRoleTitle || getRoleLabel(u.roleType)}
                          </span>
                        </div>
                      </div>

                      {isActiveSession && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.5 rounded shrink-0">
                          Activo
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PIN ENTRY INPUT */}
            {selectedUserToLogin && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#012d1d]" />
                    <span>PIN de Seguridad / Clave de Acceso</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Rol: <b>{selectedUserToLogin.customRoleTitle || selectedUserToLogin.roleType}</b>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={8}
                    required
                    placeholder="Ingrese su PIN (ej: 1234, 1092, 4410)..."
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full text-sm font-mono font-bold tracking-widest p-3 bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-700"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {loginError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {loginSuccessMessage && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{loginSuccessMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* BUTTON ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-[#ffba38] text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-[#ffba38]" />
                <span>Ingresar / Cambiar Sesión</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
