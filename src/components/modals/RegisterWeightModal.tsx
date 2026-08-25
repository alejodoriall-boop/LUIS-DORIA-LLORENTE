import React, { useState, useEffect } from 'react';
import { LotRecord, BatchWeighItem } from '../../types';
import {
  Scale,
  X,
  CheckCircle2,
  TrendingUp,
  Bluetooth,
  Wifi,
  RefreshCw,
  Lock,
  Unlock,
  Radio,
  Beef,
  Layers,
  Zap,
  Plus,
  Trash2,
  Sparkles,
  Signal,
  BatteryCharging,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LivestockScaleHook } from '../../hooks/useLivestockScale';

interface RegisterWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  lots: LotRecord[];
  initialLotId?: string;
  onSaveWeight: (lotId: string, newAvgWeight: number, date: string) => void;
  scaleHook: LivestockScaleHook;
  onOpenScaleModal: () => void;
}

export const RegisterWeightModal: React.FC<RegisterWeightModalProps> = ({
  isOpen,
  onClose,
  lots,
  initialLotId,
  onSaveWeight,
  scaleHook,
  onOpenScaleModal,
}) => {
  const [selectedLotId, setSelectedLotId] = useState(initialLotId || lots[0]?.id || '');
  const [inputMode, setInputMode] = useState<'live_scale' | 'manual'>('live_scale');
  const [weighingType, setWeighingType] = useState<'lote' | 'individual' | 'batch_chute'>('lote');
  const [animalTag, setAnimalTag] = useState<string>('4512');
  const [dateInput, setDateInput] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [manualWeightInput, setManualWeightInput] = useState<string>('442.5');
  const [capturedWeight, setCapturedWeight] = useState<number | null>(null);

  // Batch weighing in chute session state
  const [batchItems, setBatchItems] = useState<BatchWeighItem[]>([]);

  const {
    activeScale,
    reading,
    tareScale,
    lockCurrentWeight,
    unlockWeight,
    simulateNextAnimal,
    readRFIDTag,
  } = scaleHook;

  // Auto-fill initial values
  useEffect(() => {
    if (initialLotId) {
      setSelectedLotId(initialLotId);
    }
  }, [initialLotId]);

  // Keep manual weight in sync when capturing from scale
  useEffect(() => {
    if (inputMode === 'live_scale' && reading.isStable && !capturedWeight) {
      const nextStr = reading.weight.toFixed(1);
      setManualWeightInput((prev) => (prev === nextStr ? prev : nextStr));
    }
  }, [inputMode, reading.weight, reading.isStable, capturedWeight]);

  // When RFID ear tag is detected, update animalTag
  useEffect(() => {
    if (activeScale?.lastEIDTag && weighingType !== 'lote') {
      const parts = activeScale.lastEIDTag.split(' ');
      const shortTag = parts[parts.length - 1]?.slice(-4) || '4512';
      setAnimalTag((prev) => (prev === shortTag ? prev : shortTag));
    }
  }, [activeScale?.lastEIDTag, weighingType]);

  if (!isOpen) return null;

  const currentLot = lots.find((l) => l.id === selectedLotId) || lots[0];
  const activeWeight =
    inputMode === 'live_scale'
      ? capturedWeight !== null
        ? capturedWeight
        : reading.weight
      : parseFloat(manualWeightInput) || 0;

  // Estimated daily weight gain calculation
  const prevWeight = currentLot?.currentAvgWeight || 420;
  const deltaWeight = activeWeight - prevWeight;
  const estimatedDays = 30;
  const calculatedGdp = (deltaWeight / estimatedDays).toFixed(2);
  const isPositiveGain = Number(calculatedGdp) >= 0;

  // Handle weight capture button
  const handleCaptureWeight = () => {
    const locked = lockCurrentWeight();
    setCapturedWeight(locked);
    setManualWeightInput(locked.toFixed(1));
  };

  // Read RFID ear tag
  const handleScanRFID = () => {
    const eid = readRFIDTag();
    const shortTag = eid.slice(-4);
    setAnimalTag(shortTag);
  };

  // Add animal to chute batch weighing list
  const handleAddBatchItem = () => {
    const weightToLog = activeWeight;
    if (weightToLog <= 0) return;

    const newItem: BatchWeighItem = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      animalTag: animalTag || `BOV-${batchItems.length + 1}`,
      lotId: selectedLotId,
      weight: weightToLog,
      previousWeight: prevWeight,
      dailyGainKg: Number(calculatedGdp),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eidTag: activeScale?.lastEIDTag,
    };

    setBatchItems((prev) => [newItem, ...prev]);
    setCapturedWeight(null);

    // Simulate next animal stepping in automatically
    simulateNextAnimal();
  };

  const handleRemoveBatchItem = (id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Handle main save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let finalWeight = activeWeight;
    if (weighingType === 'batch_chute' && batchItems.length > 0) {
      const sum = batchItems.reduce((acc, curr) => acc + curr.weight, 0);
      finalWeight = Math.round((sum / batchItems.length) * 10) / 10;
    }

    if (!finalWeight || finalWeight <= 0) return;

    onSaveWeight(selectedLotId, finalWeight, dateInput);

    // Confetti celebration
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#012d1d', '#ffba38', '#c1ecd4'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-3xl max-w-3xl lg:max-w-5xl lg:max-w-6xl w-full border border-white/10 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-[#0D1A13] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#D4A94E] text-[#0D1A13] rounded-xl shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Registrar Pesaje de Ganado
              </h3>
              <p className="text-[11px] text-[#a5d0b9]">
                Sincronización en tiempo real con báscula e indicador ganadero
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCALE CONNECTION STATUS BAR */}
        <div className="bg-[#c1ecd4]/50 border-b border-[#a5d0b9] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {activeScale ? (
              <div className="flex items-center gap-1.5 font-bold text-[#002114]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <Bluetooth className="w-3.5 h-3.5 text-emerald-800" />
                <span>{activeScale.name}</span>
                <span className="text-[10px] font-mono text-[#274e3d] bg-white/70 px-1.5 py-0.5 rounded border border-[#a5d0b9]">
                  {activeScale.battery}% Bat
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-bold text-[#ba1a1a]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Báscula Desconectada</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {activeScale && (
              <button
                type="button"
                onClick={tareScale}
                title="Poner báscula en cero"
                className="px-2 py-1 bg-[#15241C] hover:bg-[#f3f3f3] border border-[#a5d0b9] text-[#002114] font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-emerald-800" />
                Tara 0.0
              </button>
            )}

            <button
              type="button"
              onClick={onOpenScaleModal}
              className="px-2.5 py-1 bg-[#0D1A13] hover:bg-[#123F2A] text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition-colors"
            >
              <Zap className="w-3 h-3 text-[#ffba38]" />
              {activeScale ? 'Configurar Báscula' : 'Sincronizar Báscula'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* WEIGHING TYPE TABS */}
          <div className="flex bg-[#f3f3f3] p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setWeighingType('lote')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                weighingType === 'lote'
                  ? 'bg-[#0D1A13] text-white shadow-xs'
                  : 'text-[#414844] hover:text-white'
              }`}
            >
              Pesaje Promedio Lote
            </button>
            <button
              type="button"
              onClick={() => setWeighingType('individual')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                weighingType === 'individual'
                  ? 'bg-[#0D1A13] text-white shadow-xs'
                  : 'text-[#414844] hover:text-white'
              }`}
            >
              Bovino Individual
            </button>
            <button
              type="button"
              onClick={() => setWeighingType('batch_chute')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
                weighingType === 'batch_chute'
                  ? 'bg-[#0D1A13] text-white shadow-xs'
                  : 'text-[#414844] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#ffba38]" />
              Manga Continua
            </button>
          </div>

          {/* INPUT SOURCE TOGGLE (BÁSCULA EN VIVO vs ENTRADA MANUAL) */}
          <div className="flex items-center justify-between bg-[#15241C] p-2.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
              Modo de Captura:
            </span>
            <div className="flex gap-1 bg-[#f3f3f3] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setInputMode('live_scale')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  inputMode === 'live_scale'
                    ? 'bg-[#D4A94E] text-[#0D1A13] shadow-xs'
                    : 'text-[#414844] hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Báscula en Vivo (Auto)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'manual'
                    ? 'bg-[#0D1A13] text-white shadow-xs'
                    : 'text-[#414844] hover:text-white'
                }`}
              >
                Manual
              </button>
            </div>
          </div>

          {/* LOT SELECTOR */}
          <div>
            <label className="block text-[11px] font-bold text-white uppercase mb-1">
              Potrero / Lote Destino
            </label>
            <select
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#012d1d]"
            >
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code}) • {l.heads} cabezas • Peso actual: {l.currentAvgWeight} kg
                </option>
              ))}
            </select>
          </div>

          {/* INDIVIDUAL OR BATCH EAR TAG FIELD */}
          {weighingType !== 'lote' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-white uppercase mb-1">
                  Número de Arete (Visual ID)
                </label>
                <input
                  type="text"
                  placeholder="Ej. #4512"
                  value={animalTag}
                  onChange={(e) => setAnimalTag(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold font-mono text-white focus:outline-none focus:border-[#012d1d]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white uppercase mb-1">
                  Lector RFID / Arete EID
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    disabled
                    value={activeScale?.lastEIDTag || '982 000045892103'}
                    className="flex-1 bg-[#e8e8e8] border border-white/10 rounded-xl px-2.5 py-2 text-[11px] font-mono text-[#414844]"
                  />
                  <button
                    type="button"
                    onClick={handleScanRFID}
                    title="Escanear arete con bastón RFID"
                    className="px-2.5 py-2 bg-[#D4A94E]/30 hover:bg-[#D4A94E]/50 border border-[#dc9a00] text-[#0D1A13] font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    RFID
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DIGITAL SCALE WEIGHT DISPLAY / INTERFACE */}
          {inputMode === 'live_scale' ? (
            <div className="bg-[#00180f] rounded-2xl p-4 md:p-5 border-2 border-[#012d1d] shadow-lg text-center relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#a5d0b9] border-b border-[#1b4332] pb-2 mb-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  SEÑAL DE BÁSCULA ACTIVA ({activeScale?.brand || 'Tru-Test'})
                </span>
                <span className="flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3 text-emerald-400" />
                  {activeScale?.battery || 94}%
                </span>
              </div>

              {/* Stability status */}
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                {reading.weight === 0 ? (
                  <span className="bg-[#313632] text-[#c1c8c2] px-2.5 py-0.5 rounded-full">
                    PLATAFORMA EN CERO
                  </span>
                ) : reading.isStable ? (
                  <span className="bg-[#123F2A] text-[#A5B8AC] border border-[#2d6a4f] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    PESO ESTABLE 🔒 [LISTO]
                  </span>
                ) : (
                  <span className="bg-[#D4A94E]/20 text-[#ffba38] border border-[#ffba38]/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    ESTABILIZANDO...
                  </span>
                )}
              </div>

              {/* Big Digital Weight */}
              <div className="my-1">
                <span className="font-mono text-5xl md:text-6xl font-black text-[#A5B8AC] tracking-tight drop-shadow-[0_0_20px_rgba(45,106,79,0.7)]">
                  {(capturedWeight !== null ? capturedWeight : reading.weight).toFixed(1)}
                </span>
                <span className="font-mono text-xl font-bold text-[#a5d0b9] ml-1.5">
                  {reading.unit}
                </span>
              </div>

              {/* Scale Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-[#1b4332]">
                <button
                  type="button"
                  onClick={handleCaptureWeight}
                  className="bg-[#D4A94E] hover:bg-[#ffdeac] text-[#0D1A13] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 tactical-shadow transition-all active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Capturar y Bloquear Peso
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCapturedWeight(null);
                    simulateNextAnimal();
                  }}
                  className="bg-[#123F2A] hover:bg-[#1F6547] text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Beef className="w-3.5 h-3.5 text-[#ffba38]" />
                  Simular Siguiente Bovino
                </button>

                <button
                  type="button"
                  onClick={tareScale}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  Tara 0.0
                </button>
              </div>
            </div>
          ) : (
            /* MANUAL WEIGHT INPUT */
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-white uppercase mb-1">
                  Peso Registrado (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={manualWeightInput}
                  onChange={(e) => setManualWeightInput(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-[#012d1d]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white uppercase mb-1">
                  Fecha de Pesaje
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#012d1d]"
                  required
                />
              </div>
            </div>
          )}

          {/* BATCH CHUTE MODE LIST & ADD BUTTON */}
          {weighingType === 'batch_chute' && (
            <div className="bg-[#f9f9f9] p-3.5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#dc9a00]" />
                    Manga de Pesaje en Continuo ({batchItems.length} Registrados)
                  </h4>
                  <p className="text-[10px] text-[#717973]">
                    Pesa animal por animal sin salir del módulo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddBatchItem}
                  className="bg-[#0D1A13] hover:bg-[#123F2A] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ffba38]" />
                  Añadir Arete #{animalTag} ({activeWeight} kg)
                </button>
              </div>

              {batchItems.length > 0 ? (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {batchItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-[#15241C] p-2 rounded-xl border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#c1ecd4] text-[#002114] font-mono font-bold text-[10px] flex items-center justify-center">
                          {batchItems.length - idx}
                        </span>
                        <div>
                          <span className="font-bold text-white">Arete #{item.animalTag}</span>
                          <span className="text-[10px] text-[#717973] ml-2">{item.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white">
                          {item.weight} kg
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            item.dailyGainKg >= 0 ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {item.dailyGainKg >= 0 ? `+${item.dailyGainKg}` : item.dailyGainKg} kg/d
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBatchItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-[#717973] bg-[#15241C] rounded-xl border border-dashed border-white/10">
                  Coloca un animal en la báscula y presiona "Añadir Arete" para iniciar la manga.
                </div>
              )}
            </div>
          )}

          {/* CALCULATED PREVIEW / GAIN METRIC */}
          {currentLot && (
            <div className="p-3.5 bg-[#c1ecd4]/40 border border-[#a5d0b9] rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] text-[#002114] font-bold uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-800" />
                  Ganancia Diaria Estimada (GDP)
                </p>
                <p className="text-xs text-[#274e3d]">
                  Peso anterior: <span className="font-bold">{prevWeight} kg</span> → Nuevo:{' '}
                  <span className="font-bold">{activeWeight} kg</span> ({deltaWeight >= 0 ? `+${deltaWeight.toFixed(1)}` : deltaWeight.toFixed(1)} kg)
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`font-mono text-base md:text-lg font-black ${
                    isPositiveGain ? 'text-white' : 'text-red-700'
                  }`}
                >
                  {isPositiveGain ? `+${calculatedGdp}` : calculatedGdp} kg/d
                </span>
                <p className="text-[10px] text-[#274e3d]">
                  Meta: {currentLot.targetWeight} kg
                </p>
              </div>
            </div>
          )}

          {/* MODAL ACTIONS */}
          <div className="flex gap-2 pt-3 border-t border-[#eeeeee]">
            <button
              type="submit"
              className="flex-1 bg-[#D4A94E] hover:bg-[#ffdeac] text-[#0D1A13] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 tactical-shadow transition-colors active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              {weighingType === 'batch_chute' && batchItems.length > 0
                ? `Guardar Lote Manga (${batchItems.length} Bovinos)`
                : `Guardar Pesaje (${activeWeight} kg)`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#414844] font-semibold rounded-xl text-xs transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
