import React, { useState, useMemo } from 'react';
import {
  FarmNumberingPolicy,
  NumberingPolicyType,
  YearPositionType,
} from '../../types/numberingPolicy';
import {
  generateNextAnimalTag,
  buildCustomRegexPattern,
  saveFarmNumberingPolicy,
} from '../../utils/numberingPolicyEngine';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Upload,
  Calendar,
  Tag,
  Hash,
  ShieldCheck,
  Info,
  X,
  ArrowRight,
  Eye,
  Check,
  HelpCircle,
  Copy,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface NumberingPolicySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId?: string;
  farmName?: string;
  currentPolicy: FarmNumberingPolicy;
  onPolicyUpdated: (newPolicy: FarmNumberingPolicy) => void;
}

export const NumberingPolicySettingsModal: React.FC<NumberingPolicySettingsModalProps> = ({
  isOpen,
  onClose,
  farmId = 'all',
  farmName = 'Predio Activo',
  currentPolicy,
  onPolicyUpdated,
}) => {
  const [selectedType, setSelectedType] = useState<NumberingPolicyType>(
    currentPolicy.policyType || 'CHRONOLOGICAL_YEAR_CONSECUTIVE'
  );
  
  // Parámetros Generales
  const [consecutiveLength, setConsecutiveLength] = useState<number>(
    currentPolicy.consecutiveDigitsLength || 3
  );
  const [useSeparator, setUseSeparator] = useState<boolean>(
    currentPolicy.useSeparator ?? true
  );
  const [separatorChar, setSeparatorChar] = useState<'-' | '/' | '.' | ''>(
    currentPolicy.separatorChar || '-'
  );

  // Parámetros Tipo 3 (Sexo)
  const [malePrefix, setMalePrefix] = useState<string>(currentPolicy.malePrefix || 'M');
  const [femalePrefix, setFemalePrefix] = useState<string>(currentPolicy.femalePrefix || 'H');

  // Parámetros Tipo 4 (Personalizado / Adopción)
  const [customPrefix, setCustomPrefix] = useState<string>(currentPolicy.customPrefix || 'TE-');
  const [customSuffix, setCustomSuffix] = useState<string>(currentPolicy.customSuffix || '');
  const [yearPosition, setYearPosition] = useState<YearPositionType>(currentPolicy.yearPosition || 'PREFIX');
  const [yearDigitsLength, setYearDigitsLength] = useState<1 | 2 | 4>(currentPolicy.yearDigitsLength || 2);
  const [isFixedLength, setIsFixedLength] = useState<boolean>(currentPolicy.isConsecutiveFixedLength ?? true);
  const [initialOffset, setInitialOffset] = useState<number>(currentPolicy.initialConsecutiveOffset || 0);

  // Modal de Confirmación y Bloqueo Doble
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationWord, setConfirmationWord] = useState('');
  const [hasAcknowledgedIrreversible, setHasAcknowledgedIrreversible] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Archivo simulado para Homologación
  const [importedFileStats, setImportedFileStats] = useState<{
    fileName: string;
    totalHeads: number;
    validHeads: number;
    highestConsecutive: number;
  } | null>(null);

  // Estado temporal de la política para previsualización en vivo
  const draftPolicy: FarmNumberingPolicy = useMemo(() => {
    return {
      farmId,
      policyType: selectedType,
      consecutiveDigitsLength: consecutiveLength,
      useSeparator,
      separatorChar,
      malePrefix,
      femalePrefix,
      customPrefix,
      customSuffix,
      yearPosition,
      yearDigitsLength,
      isConsecutiveFixedLength: isFixedLength,
      initialConsecutiveOffset: initialOffset,
      isLocked: currentPolicy.isLocked,
      registeredAnimalsCount: currentPolicy.registeredAnimalsCount || 0,
    };
  }, [
    farmId,
    selectedType,
    consecutiveLength,
    useSeparator,
    separatorChar,
    malePrefix,
    femalePrefix,
    customPrefix,
    customSuffix,
    yearPosition,
    yearDigitsLength,
    isFixedLength,
    initialOffset,
    currentPolicy.isLocked,
    currentPolicy.registeredAnimalsCount,
  ]);

  // Ejemplos generados en tiempo real para previsualización
  const sampleNow = useMemo(() => {
    return generateNextAnimalTag(draftPolicy, {
      eventDate: new Date(2026, 7, 18), // Agosto 2026 (Trimestre 3)
      gender: 'hembra',
      consecutiveOverride: 15,
    });
  }, [draftPolicy]);

  const sampleMale = useMemo(() => {
    return generateNextAnimalTag(draftPolicy, {
      eventDate: new Date(2026, 7, 18),
      gender: 'macho',
      consecutiveOverride: 15,
    });
  }, [draftPolicy]);

  const sampleNextBorn = useMemo(() => {
    const nextOffset = (initialOffset > 0 ? initialOffset : 0) + 1;
    return generateNextAnimalTag(draftPolicy, {
      eventDate: new Date(2026, 7, 18),
      gender: 'macho',
      consecutiveOverride: nextOffset,
    });
  }, [draftPolicy, initialOffset]);

  const dynamicRegex = useMemo(() => {
    if (selectedType === 'CUSTOM_LEGACY_ADOPTION') {
      return buildCustomRegexPattern(draftPolicy);
    }
    return null;
  }, [draftPolicy, selectedType]);

  const handleSimulateExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportedFileStats({
        fileName: file.name,
        totalHeads: 1250,
        validHeads: 1248,
        highestConsecutive: 1250,
      });
      setInitialOffset(1250);
    }
  };

  const handleSaveAndLock = () => {
    if (currentPolicy.isLocked) return;

    const lockedPolicy: FarmNumberingPolicy = {
      ...draftPolicy,
      isLocked: true,
      lockedAt: new Date().toISOString(),
      lockedBy: 'Administrador Principal',
      sampleGeneratedCode: sampleNextBorn,
      generatedRegexPattern: dynamicRegex || undefined,
    };

    const saved = saveFarmNumberingPolicy(lockedPolicy);
    onPolicyUpdated(saved);
    setIsConfirmationModalOpen(false);
    setSuccessBanner('¡Política de numeración fijada y bloqueada permanentemente con éxito!');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#15241C] rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden border border-white/10">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0D1A13] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
              currentPolicy.isLocked ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}>
              {currentPolicy.isLocked ? <Lock className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Políticas de Numeración e Identificación del Hato
                </h2>
                {currentPolicy.isLocked ? (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    BLOQUEO INMUTABLE ACTIVO
                  </span>
                ) : (
                  <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    CONFIGURACIÓN INICIAL
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/80">
                Predio: <span className="font-semibold text-white">{farmName}</span> • Trazabilidad zootécnica oficial y unicidad de inventario
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top duration-200 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Banner de Estado Bloqueado vs Configurable */}
        {currentPolicy.isLocked ? (
          <div className="bg-amber-950/30 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold">Esquema Inmutable y Protegido:</span> Esta política no puede ser modificada para proteger la trazabilidad de los animales registrados.
              </div>
            </div>
            <div className="text-[11px] font-mono font-bold bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
              Registrado: {currentPolicy.lockedAt ? new Date(currentPolicy.lockedAt).toLocaleDateString() : 'Activo'}
            </div>
          </div>
        ) : (
          <div className="bg-blue-950/30 border-b border-blue-200 px-6 py-2.5 flex items-center gap-2 text-xs text-blue-900 shrink-0">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>Regla de Decisión Única:</strong> Selecciona la estructura de numeración. Una vez guardado el primer registro, el sistema activará el candado inmutable permanentemente.
            </span>
          </div>
        )}

        {/* Body Content (2 Columns: Selector & Live Preview) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          {/* Columna Izquierda: Opciones de Política (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                1. Selecciona el Esquema de Identificación
              </h3>
              {currentPolicy.isLocked && (
                <span className="text-[11px] font-bold text-[#A5B8AC] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Solo Lectura
                </span>
              )}
            </div>

            {/* Grid con las 4 Opciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción 1: Cronológico Estándar */}
              <div
                onClick={() => !currentPolicy.isLocked && setSelectedType('CHRONOLOGICAL_YEAR_CONSECUTIVE')}
                className={`p-4 rounded-2xl border-2 transition-all text-left relative flex flex-col justify-between ${
                  currentPolicy.isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                } ${
                  selectedType === 'CHRONOLOGICAL_YEAR_CONSECUTIVE'
                    ? 'border-[#012d1d] bg-[#15241C] shadow-md ring-2 ring-[#012d1d]/10'
                    : 'border-white/10 bg-[#15241C] hover:border-white/15'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-950/30 px-2 py-0.5 rounded-md">
                      Tipo 1
                    </span>
                    {selectedType === 'CHRONOLOGICAL_YEAR_CONSECUTIVE' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white">Cronológico Estándar</h4>
                  <p className="text-[11px] text-[#A5B8AC] mt-1 leading-snug">
                    Año + Consecutivo. Ideal para ceba y ciclos anuales.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#A5B8AC] text-[10px]">Ejemplo:</span>
                  <span className="font-bold text-white bg-[#1F3327] px-2 py-0.5 rounded">6-015</span>
                </div>
              </div>

              {/* Opción 2: Estacional / Trimestral */}
              <div
                onClick={() => !currentPolicy.isLocked && setSelectedType('SEASONAL_TRIMESTER_YEAR')}
                className={`p-4 rounded-2xl border-2 transition-all text-left relative flex flex-col justify-between ${
                  currentPolicy.isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                } ${
                  selectedType === 'SEASONAL_TRIMESTER_YEAR'
                    ? 'border-[#012d1d] bg-[#15241C] shadow-md ring-2 ring-[#012d1d]/10'
                    : 'border-white/10 bg-[#15241C] hover:border-white/15'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-950/30 px-2 py-0.5 rounded-md">
                      Tipo 2
                    </span>
                    {selectedType === 'SEASONAL_TRIMESTER_YEAR' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white">Estacional / Trimestral</h4>
                  <p className="text-[11px] text-[#A5B8AC] mt-1 leading-snug">
                    Consecutivo + Trimestre + Año. Óptimo para IATF y montas masivas.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#A5B8AC] text-[10px]">Ejemplo:</span>
                  <span className="font-bold text-white bg-[#1F3327] px-2 py-0.5 rounded">015-36</span>
                </div>
              </div>

              {/* Opción 3: Mixto por Sexo */}
              <div
                onClick={() => !currentPolicy.isLocked && setSelectedType('GENDER_CATEGORIZED_YEAR')}
                className={`p-4 rounded-2xl border-2 transition-all text-left relative flex flex-col justify-between ${
                  currentPolicy.isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                } ${
                  selectedType === 'GENDER_CATEGORIZED_YEAR'
                    ? 'border-[#012d1d] bg-[#15241C] shadow-md ring-2 ring-[#012d1d]/10'
                    : 'border-white/10 bg-[#15241C] hover:border-white/15'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-950/30 px-2 py-0.5 rounded-md">
                      Tipo 3
                    </span>
                    {selectedType === 'GENDER_CATEGORIZED_YEAR' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white">Mixto por Sexo (H/M)</h4>
                  <p className="text-[11px] text-[#A5B8AC] mt-1 leading-snug">
                    Año + Letra Sexo + Consecutivo. Cabañas, genética y lecherías.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#A5B8AC] text-[10px]">Ejemplo:</span>
                  <span className="font-bold text-purple-800 bg-purple-950/30 px-2 py-0.5 rounded">6H-015</span>
                </div>
              </div>

              {/* Opción 4: Adopción de Sistema Existente */}
              <div
                onClick={() => !currentPolicy.isLocked && setSelectedType('CUSTOM_LEGACY_ADOPTION')}
                className={`p-4 rounded-2xl border-2 transition-all text-left relative flex flex-col justify-between ${
                  currentPolicy.isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                } ${
                  selectedType === 'CUSTOM_LEGACY_ADOPTION'
                    ? 'border-[#012d1d] bg-amber-50/50 shadow-md ring-2 ring-[#012d1d]/10'
                    : 'border-amber-200 bg-[#15241C] hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Tipo 4: Nueva
                    </span>
                    {selectedType === 'CUSTOM_LEGACY_ADOPTION' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white">Adoptar Estructura Previa</h4>
                  <p className="text-[11px] text-[#A5B8AC] mt-1 leading-snug">
                    Conserva tu nomenclatura y hierro sin remarcar el hato.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#A5B8AC] text-[10px]">Ejemplo:</span>
                  <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">TE-26-085</span>
                </div>
              </div>
            </div>

            {/* Parámetros Específicos según Tipo Seleccionado */}
            <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                Parámetros de Formato y Estructura
              </h4>

              {/* Ajustes Generales de Dígitos y Separador */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#A5B8AC] mb-1">
                    Dígitos del Consecutivo
                  </label>
                  <select
                    disabled={currentPolicy.isLocked}
                    value={consecutiveLength}
                    onChange={(e) => setConsecutiveLength(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0D1A13] border border-white/10 rounded-xl p-2 font-medium disabled:opacity-60"
                  >
                    <option value={3}>3 Dígitos (001 - 999)</option>
                    <option value={4}>4 Dígitos (0001 - 9999)</option>
                    <option value={5}>5 Dígitos (00001 - 99999)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#A5B8AC] mb-1">
                    Separador Visual
                  </label>
                  <select
                    disabled={currentPolicy.isLocked}
                    value={useSeparator ? separatorChar : 'NONE'}
                    onChange={(e) => {
                      if (e.target.value === 'NONE') {
                        setUseSeparator(false);
                        setSeparatorChar('');
                      } else {
                        setUseSeparator(true);
                        setSeparatorChar(e.target.value as any);
                      }
                    }}
                    className="w-full bg-[#0D1A13] border border-white/10 rounded-xl p-2 font-medium disabled:opacity-60"
                  >
                    <option value="-">Guión medio ( - )</option>
                    <option value="/">Barra ( / )</option>
                    <option value=".">Punto ( . )</option>
                    <option value="NONE">Sin separador (junto)</option>
                  </select>
                </div>

                {selectedType === 'GENDER_CATEGORIZED_YEAR' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#A5B8AC] mb-1">
                      Letras Sexo (H/M)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled={currentPolicy.isLocked}
                        value={femalePrefix}
                        onChange={(e) => setFemalePrefix(e.target.value.toUpperCase())}
                        maxLength={2}
                        placeholder="H"
                        className="w-1/2 bg-[#0D1A13] border border-white/10 rounded-xl p-2 text-center font-bold"
                        title="Hembra"
                      />
                      <input
                        type="text"
                        disabled={currentPolicy.isLocked}
                        value={malePrefix}
                        onChange={(e) => setMalePrefix(e.target.value.toUpperCase())}
                        maxLength={2}
                        placeholder="M"
                        className="w-1/2 bg-[#0D1A13] border border-white/10 rounded-xl p-2 text-center font-bold"
                        title="Macho"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ajustes Avanzados para Tipo 4 (Personalizado / Adopción) */}
              {selectedType === 'CUSTOM_LEGACY_ADOPTION' && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs space-y-2">
                    <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      Constructor de Nomenclatura Personalizada
                    </span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-[#A5B8AC] block">Prefijo Fijo</label>
                        <input
                          type="text"
                          disabled={currentPolicy.isLocked}
                          value={customPrefix}
                          onChange={(e) => setCustomPrefix(e.target.value)}
                          placeholder="ej. TE-, H-"
                          className="w-full bg-[#15241C] border border-white/15 rounded-lg p-1.5 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#A5B8AC] block">Posición Año</label>
                        <select
                          disabled={currentPolicy.isLocked}
                          value={yearPosition}
                          onChange={(e) => setYearPosition(e.target.value as any)}
                          className="w-full bg-[#15241C] border border-white/15 rounded-lg p-1.5 text-xs font-medium"
                        >
                          <option value="PREFIX">Al Inicio (Prefijo)</option>
                          <option value="SUFFIX">Al Final (Sufijo)</option>
                          <option value="NONE">Sin Año Visible</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#A5B8AC] block">Dígitos Año</label>
                        <select
                          disabled={currentPolicy.isLocked || yearPosition === 'NONE'}
                          value={yearDigitsLength}
                          onChange={(e) => setYearDigitsLength(parseInt(e.target.value, 10) as any)}
                          className="w-full bg-[#15241C] border border-white/15 rounded-lg p-1.5 text-xs font-medium"
                        >
                          <option value={1}>1 dígito (6)</option>
                          <option value={2}>2 dígitos (26)</option>
                          <option value={4}>4 dígitos (2026)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#A5B8AC] block">Sufijo Fijo</label>
                        <input
                          type="text"
                          disabled={currentPolicy.isLocked}
                          value={customSuffix}
                          onChange={(e) => setCustomSuffix(e.target.value)}
                          placeholder="ej. -A, -CEBA"
                          className="w-full bg-[#15241C] border border-white/15 rounded-lg p-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-[11px] text-white">
                        <input
                          type="checkbox"
                          disabled={currentPolicy.isLocked}
                          checked={isFixedLength}
                          onChange={(e) => setIsFixedLength(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-emerald-600"
                        />
                        <span>Rellenar con ceros a la izquierda (ej. 0085 en vez de 85)</span>
                      </label>
                    </div>
                  </div>

                  {/* Sección de Homologación e Importación Inicial */}
                  {!currentPolicy.isLocked && (
                    <div className="bg-[#1F3327] p-3.5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                          Homologación y Punto de Corte Inicial
                        </span>
                        <label className="text-[11px] bg-[#0D1A13] hover:bg-[#02412a] text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition">
                          <Upload className="w-3 h-3" />
                          Cargar Excel/CSV
                          <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={handleSimulateExcelUpload}
                          />
                        </label>
                      </div>

                      {importedFileStats ? (
                        <div className="bg-[#15241C] p-2.5 rounded-lg border border-emerald-300 text-xs space-y-1">
                          <div className="flex items-center justify-between text-emerald-800 font-bold">
                            <span>Archivo: {importedFileStats.fileName}</span>
                            <span className="bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                              {importedFileStats.validHeads} / {importedFileStats.totalHeads} Válidos
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A5B8AC]">
                            Último consecutivo detectado: <strong>#{importedFileStats.highestConsecutive}</strong>. Los nuevos registros continuarán desde <strong>#{importedFileStats.highestConsecutive + 1}</strong>.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-[#A5B8AC] block mb-0.5">
                              Último Consecutivo Utilizado en la Finca (Punto de Corte)
                            </label>
                            <input
                              type="number"
                              value={initialOffset}
                              onChange={(e) => setInitialOffset(parseInt(e.target.value, 10) || 0)}
                              placeholder="0 (iniciar desde 1)"
                              className="w-full bg-[#15241C] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                            />
                          </div>
                          <span className="text-[10px] text-[#A5B8AC] max-w-[200px] leading-tight">
                            El próximo nacimiento sugerirá #{initialOffset + 1}.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Vista Previa en Vivo & Candado de Bloqueo (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-700" />
                2. Vista Previa de Chapetas Físicas
              </h3>

              {/* Live Preview Card */}
              <div className="bg-gradient-to-br from-[#012d1d] to-[#04422b] text-white p-5 rounded-3xl shadow-lg space-y-4 border border-emerald-600/30">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-emerald-300 uppercase font-bold">
                    CHAPETA SIMULADA
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-emerald-200">
                    Campaña Ganadora
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center space-y-1">
                  <span className="text-[10px] text-emerald-200 uppercase font-medium">
                    Próximo Ingreso / Nacimiento:
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-amber-300 py-1">
                    {sampleNextBorn}
                  </div>
                  <span className="text-[10px] text-slate-200">
                    Calculado automáticamente para {farmName}
                  </span>
                </div>

                {/* Muestras comparativas */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[9px] text-[#A5B8AC] block">Hembra (Ago 2026):</span>
                    <span className="font-bold text-white text-xs">{sampleNow}</span>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[9px] text-[#A5B8AC] block">Macho (Ago 2026):</span>
                    <span className="font-bold text-white text-xs">{sampleMale}</span>
                  </div>
                </div>

                {dynamicRegex && (
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 text-[11px] font-mono text-emerald-200 flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-[#A5B8AC]">Regex Validación:</span>
                    <span className="font-bold truncate max-w-[180px]">{dynamicRegex}</span>
                  </div>
                )}
              </div>

              {/* Guía Zootécnica */}
              <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 text-xs space-y-2 text-[#A5B8AC]">
                <div className="flex items-center gap-2 font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Garantía de Unicidad y Trazabilidad
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  El sistema garantiza que ningún animal tenga código duplicado en la finca. La chapeta oficial (SINIGAN / ICA) y los chips RFID operan como campos independientes sin alterar tu ID interno.
                </p>
              </div>
            </div>

            {/* Botón de Acción / Bloqueo */}
            <div className="pt-2">
              {currentPolicy.isLocked ? (
                <div className="bg-[#1F3327] text-[#A5B8AC] p-3 rounded-2xl text-center text-xs font-bold border border-white/10 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Política fijada permanentemente (Inmutable)
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmationModalOpen(true)}
                  className="w-full bg-[#0D1A13] hover:bg-[#02412a] text-white p-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer group"
                >
                  <Lock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Confirmar y Bloquear Política de Numeración</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Advertencia Crítica y Bloqueo Doble */}
      {isConfirmationModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#15241C] rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 border-2 border-amber-500 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  ¿Confirmar y Bloquear Política Definitiva?
                </h3>
                <p className="text-xs text-[#A5B8AC]">
                  Esta decisión es <strong>PERMANENTE E IRREVERSIBLE</strong>.
                </p>
              </div>
            </div>

            <div className="bg-amber-950/30 border border-amber-200 p-4 rounded-2xl text-xs text-amber-950 space-y-2">
              <p className="font-bold">Efectos del Bloqueo:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11.5px]">
                <li>La estructura de chapetas <strong>no podrá ser editada ni eliminada</strong> en el futuro.</li>
                <li>Todos los nacimientos y compras seguirán obligatoriamente el formato elegido: <strong>{sampleNextBorn}</strong>.</li>
                <li>Garantiza la trazabilidad legal y zootécnica de por vida en {farmName}.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-white font-medium">
                <input
                  type="checkbox"
                  checked={hasAcknowledgedIrreversible}
                  onChange={(e) => setHasAcknowledgedIrreversible(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 mt-0.5"
                />
                <span>
                  Entiendo y acepto que una vez guardada, la política quedará <strong>bloqueada en modo solo lectura</strong>.
                </span>
              </label>

              <div>
                <label className="block text-[11px] font-bold text-white mb-1">
                  Escribe la palabra <strong className="text-amber-800">BLOQUEAR</strong> para autorizar:
                </label>
                <input
                  type="text"
                  value={confirmationWord}
                  onChange={(e) => setConfirmationWord(e.target.value.toUpperCase())}
                  placeholder="BLOQUEAR"
                  className="w-full bg-[#0D1A13] border border-white/15 rounded-xl p-2.5 text-xs font-mono font-bold tracking-widest text-center"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmationModalOpen(false)}
                className="flex-1 bg-[#1F3327] hover:bg-[#202E25] text-white py-3 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!hasAcknowledgedIrreversible || confirmationWord !== 'BLOQUEAR'}
                onClick={handleSaveAndLock}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Bloquear y Activar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
