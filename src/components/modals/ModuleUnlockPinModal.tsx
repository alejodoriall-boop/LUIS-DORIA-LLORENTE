import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Delete,
  RotateCcw,
  Settings,
  Sparkles,
  Milk,
} from 'lucide-react';

interface ModuleUnlockPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  moduleName?: string;
}

const DEFAULT_PIN = '1234';

export const ModuleUnlockPinModal: React.FC<ModuleUnlockPinModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  moduleName = 'Módulo de Lechería Especializada',
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [pinChangeSuccessMsg, setPinChangeSuccessMsg] = useState<string | null>(null);

  // Get current active PIN from localStorage or default '1234'
  const getStoredPin = (): string => {
    try {
      const stored = localStorage.getItem('ganaderia_admin_pin');
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    } catch (e) {
      console.warn('Error reading admin pin from localStorage:', e);
    }
    return DEFAULT_PIN;
  };

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMsg(null);
      setIsChangingPin(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
      setPinChangeSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentActivePin = getStoredPin();

  const handleVerifyPin = () => {
    setErrorMsg(null);
    if (!pinInput.trim()) {
      setErrorMsg('⚠️ Por favor ingresa el código o clave de autorización.');
      return;
    }

    if (pinInput.trim() === currentActivePin) {
      // Success!
      onUnlockSuccess();
      onClose();
    } else {
      setErrorMsg('❌ Clave o código incorrecto. Inténtalo de nuevo.');
      setPinInput('');
    }
  };

  const handleKeypadPress = (val: string) => {
    setErrorMsg(null);
    if (pinInput.length < 8) {
      const nextPin = pinInput + val;
      setPinInput(nextPin);
      if (nextPin === currentActivePin) {
        setTimeout(() => {
          onUnlockSuccess();
          onClose();
        }, 150);
      }
    }
  };

  const handleKeypadDelete = () => {
    setErrorMsg(null);
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setErrorMsg(null);
    setPinInput('');
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeSuccessMsg(null);
    setErrorMsg(null);

    if (currentPinInput !== currentActivePin) {
      setErrorMsg('❌ La clave actual ingresada no coincide.');
      return;
    }

    if (!newPinInput || newPinInput.length < 4) {
      setErrorMsg('⚠️ La nueva clave debe tener al menos 4 dígitos o caracteres.');
      return;
    }

    if (newPinInput !== confirmNewPinInput) {
      setErrorMsg('⚠️ La confirmación de la nueva clave no coincide.');
      return;
    }

    try {
      localStorage.setItem('ganaderia_admin_pin', newPinInput.trim());
      setPinChangeSuccessMsg('✅ ¡Clave de seguridad actualizada con éxito!');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
      setTimeout(() => {
        setIsChangingPin(false);
        setPinChangeSuccessMsg(null);
      }, 1500);
    } catch (err) {
      console.warn('Could not update admin pin:', err);
      setErrorMsg('Error al guardar la clave en memoria.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#15241C] border-2 border-[#012d1d] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-[#0D1A13] text-white p-5 flex items-center justify-between border-b border-[#1b4332]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#123F2A] text-[#ffba38] rounded-2xl border border-[#ffba38]/30">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase font-mono flex items-center gap-2">
                CLAVE DE SEGURIDAD
              </h2>
              <p className="text-xs text-[#A5B8AC]/80 mt-0.5">
                Autorización para habilitar módulo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#123F2A] text-[#A5B8AC] hover:text-white hover:bg-rose-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 bg-[#fcfdfc]">
          {/* Target Module Info */}
          <div className="bg-[#eaf4ee] border border-[#c1ecd4] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-[#0D1A13] text-[#ffba38] rounded-xl shrink-0">
              <Milk className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase font-black text-emerald-800">
                Acción Restringida
              </p>
              <p className="text-xs font-extrabold text-white">
                Habilitar: <span className="underline">{moduleName}</span>
              </p>
            </div>
          </div>

          {!isChangingPin ? (
            <>
              {/* Default PIN Notice */}
              <div className="bg-amber-950/30 border border-amber-200 p-3 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-snug">
                  <p className="font-bold">Clave por defecto del sistema: <span className="font-mono text-sm bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950 font-black">1234</span></p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Ingresa el código para autorizar el cambio de estado del módulo.
                  </p>
                </div>
              </div>

              {/* PIN Display & Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-white uppercase font-mono flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#ffba38]" />
                    INGRESA CÓDIGO / PIN:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] font-bold text-[#A5B8AC] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPin ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </div>

                {/* Input Dots Visualizer */}
                <div className="bg-[#15241C] border-2 border-[#012d1d]/30 focus-within:border-[#012d1d] p-3 rounded-2xl flex items-center justify-between shadow-xs transition-colors">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setPinInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleVerifyPin();
                      }
                    }}
                    placeholder="••••"
                    maxLength={8}
                    autoFocus
                    className="w-full bg-transparent text-center text-2xl font-mono font-black text-white tracking-widest outline-none placeholder:text-[#A5B8AC]"
                  />
                  {pinInput.length > 0 && (
                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className="text-[#A5B8AC] hover:text-rose-600 p-1 cursor-pointer"
                      title="Borrar todo"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* On-screen Keypad */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      className="py-3 bg-[#15241C] hover:bg-[#eaf4ee] active:bg-[#0D1A13] active:text-white text-white border border-white/10 hover:border-[#012d1d] rounded-2xl font-mono text-xl font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleKeypadClear}
                    className="py-3 bg-[#1F3327] hover:bg-gray-200 text-white border border-white/10 rounded-2xl font-mono text-xs font-extrabold uppercase transition-colors cursor-pointer"
                  >
                    Borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="py-3 bg-[#15241C] hover:bg-[#eaf4ee] active:bg-[#0D1A13] active:text-white text-white border border-white/10 hover:border-[#012d1d] rounded-2xl font-mono text-xl font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-center"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleKeypadDelete}
                    className="py-3 bg-[#1F3327] hover:bg-rose-100 text-rose-800 border border-white/10 hover:border-rose-300 rounded-2xl font-mono text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Error or Success Notice */}
              {errorMsg && (
                <div className="p-3 bg-rose-950/30 border border-rose-200 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Toggle to change PIN */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setIsChangingPin(true);
                  }}
                  className="text-xs font-bold text-white hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#ffba38]" />
                  <span>¿Deseas cambiar la clave de seguridad?</span>
                </button>
              </div>
            </>
          ) : (
            /* Change PIN Form */
            <form onSubmit={handleChangePinSubmit} className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xs font-extrabold text-white uppercase font-mono flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-[#ffba38]" />
                  CONFIGURAR NUEVA CLAVE
                </h3>
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="text-xs font-bold text-[#A5B8AC] hover:text-white cursor-pointer"
                >
                  Volver al Teclado
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white mb-1">
                  Clave Actual (defecto 1234):
                </label>
                <input
                  type="password"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  placeholder="Clave actual..."
                  className="w-full p-2.5 bg-[#15241C] border border-white/15 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white mb-1">
                  Nueva Clave Personalizada:
                </label>
                <input
                  type="password"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Mínimo 4 dígitos..."
                  className="w-full p-2.5 bg-[#15241C] border border-white/15 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white mb-1">
                  Confirmar Nueva Clave:
                </label>
                <input
                  type="password"
                  value={confirmNewPinInput}
                  onChange={(e) => setConfirmNewPinInput(e.target.value)}
                  placeholder="Repite la nueva clave..."
                  className="w-full p-2.5 bg-[#15241C] border border-white/15 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/30 border border-rose-200 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {pinChangeSuccessMsg && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pinChangeSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="flex-1 py-2.5 bg-[#1F3327] hover:bg-gray-200 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0D1A13] hover:bg-[#123F2A] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Guardar Clave
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {!isChangingPin && (
          <div className="bg-[#0D1A13] border-t border-white/10 p-4 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleVerifyPin}
              className="flex-1 py-2.5 bg-[#0D1A13] hover:bg-[#123F2A] text-white text-xs font-black uppercase font-mono rounded-xl cursor-pointer transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#ffba38]" />
              <span>DESBLOQUEAR & ACTIVAR</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
