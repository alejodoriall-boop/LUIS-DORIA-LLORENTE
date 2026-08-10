import React, { useState, useEffect } from 'react';
import { GrassIcon } from '../icons/GrassIcon';
import {
  X,
  Scale,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  User,
  Wheat,
  Ruler,
  TrendingUp,
  Sliders,
  FileText,
} from 'lucide-react';
import { AforoSampling, AforoFrameCut, FarmDataPackage, AforoSeason } from '../../types';
import { GRASS_TYPES_PRESETS } from '../../data/mockAforoData';

interface RegisterAforoModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  onSaveAforo: (aforo: AforoSampling) => void;
}

export const RegisterAforoModal: React.FC<RegisterAforoModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  onSaveAforo,
}) => {
  const [farmId, setFarmId] = useState<string>(currentFarmId);
  const [paddockId, setPaddockId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [samplerName, setSamplerName] = useState<string>('Mayordomo Carlos');
  const [grassType, setGrassType] = useState<string>(GRASS_TYPES_PRESETS[0].name);
  const [season, setSeason] = useState<AforoSeason>('lluvia');
  const [frameSizeM2, setFrameSizeM2] = useState<number>(1.0); // 1.0 m² standard

  // Frame cuts state (default 5 samples)
  const [cuts, setCuts] = useState<AforoFrameCut[]>([
    { frameIndex: 1, weightKg: 1.25, heightCm: 45, qualityNote: 'alto' },
    { frameIndex: 2, weightKg: 1.35, heightCm: 48, qualityNote: 'alto' },
    { frameIndex: 3, weightKg: 1.10, heightCm: 40, qualityNote: 'medio' },
    { frameIndex: 4, weightKg: 1.40, heightCm: 50, qualityNote: 'alto' },
    { frameIndex: 5, weightKg: 1.20, heightCm: 42, qualityNote: 'alto' },
  ]);

  // Parameters
  const [dryMatterPercentage, setDryMatterPercentage] = useState<number>(20);
  const [grazingLossPercentage, setGrazingLossPercentage] = useState<number>(30);
  const [animalUnitWeightKg, setAnimalUnitWeightKg] = useState<number>(450);
  const [dailyGreenConsumptionPercentage, setDailyGreenConsumptionPercentage] = useState<number>(10);
  const [currentAnimalsCount, setCurrentAnimalsCount] = useState<number>(35);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Selected farm & paddock references
  const selectedFarmPackage = farms.find((f) => f.profile.id === farmId) || farms[0];
  const farmPaddocks = selectedFarmPackage?.paddocks || [];

  // Update paddockId if farm changes or initial load
  useEffect(() => {
    if (farmPaddocks.length > 0 && (!paddockId || !farmPaddocks.some((p) => p.id === paddockId))) {
      setPaddockId(farmPaddocks[0].id);
    }
  }, [farmId, farmPaddocks]);

  const selectedPaddock = farmPaddocks.find((p) => p.id === paddockId);
  const paddockAreaHa = selectedPaddock?.areaHa || 5.0;

  // Auto-adjust default DM and Loss when preset grass changes
  const handleGrassTypeChange = (selectedName: string) => {
    setGrassType(selectedName);
    const preset = GRASS_TYPES_PRESETS.find((g) => g.name === selectedName);
    if (preset) {
      setDryMatterPercentage(preset.defaultDm);
      setGrazingLossPercentage(preset.defaultLoss);
    }
  };

  // Add new frame cut sample
  const handleAddFrame = () => {
    const nextIndex = cuts.length + 1;
    const lastWeight = cuts.length > 0 ? cuts[cuts.length - 1].weightKg : 1.2;
    setCuts([...cuts, { frameIndex: nextIndex, weightKg: lastWeight, heightCm: 45, qualityNote: 'alto' }]);
  };

  // Remove a frame cut
  const handleRemoveFrame = (index: number) => {
    if (cuts.length <= 1) {
      setErrorMsg('Debes mantener al menos 1 marco de aforo muestreado.');
      return;
    }
    const updated = cuts.filter((_, i) => i !== index).map((c, i) => ({ ...c, frameIndex: i + 1 }));
    setCuts(updated);
  };

  // Update cut weight
  const handleUpdateCutWeight = (index: number, weightStr: string) => {
    const val = parseFloat(weightStr) || 0;
    const updated = [...cuts];
    updated[index] = { ...updated[index], weightKg: val };
    setCuts(updated);
  };

  // Update cut height
  const handleUpdateCutHeight = (index: number, heightStr: string) => {
    const val = parseFloat(heightStr) || 0;
    const updated = [...cuts];
    updated[index] = { ...updated[index], heightCm: val };
    setCuts(updated);
  };

  // Calculated variables
  const validCuts = cuts.filter((c) => c.weightKg > 0);
  const sumWeight = validCuts.reduce((acc, c) => acc + c.weightKg, 0);
  const avgWeightPerFrameKg = validCuts.length > 0 ? sumWeight / validCuts.length : 0;
  
  // avgGreenYieldKgM2 = avgWeightPerFrameKg / frameSizeM2
  const avgGreenYieldKgM2 = frameSizeM2 > 0 ? avgWeightPerFrameKg / frameSizeM2 : avgWeightPerFrameKg;
  
  // Total Gross Ton/Ha = avgGreenYieldKgM2 * 10
  const totalGreenYieldTonHa = avgGreenYieldKgM2 * 10;
  
  // Gross Kg Green Forage / Ha
  const totalGreenYieldKgHa = totalGreenYieldTonHa * 1000;
  
  // Usable Green Forage Kg/Ha after losses
  const usefulGreenYieldKgHa = totalGreenYieldKgHa * (1 - grazingLossPercentage / 100);
  
  // Usable Dry Matter Kg/Ha
  const usefulDryMatterKgHa = usefulGreenYieldKgHa * (dryMatterPercentage / 100);
  
  // Daily Green Forage Requirement per UA = 450 kg * 10% = 45 kg green forage / UA / day
  const dailyGreenKgPerUa = animalUnitWeightKg * (dailyGreenConsumptionPercentage / 100);
  
  // Total Usable Green Forage in the Paddock (Ha * Kg/Ha)
  const paddockTotalUsefulGreenKg = usefulGreenYieldKgHa * paddockAreaHa;
  
  // Current Total Herd UAs
  const currentTotalUAs = currentAnimalsCount > 0 ? currentAnimalsCount * (450 / 450) : 1;
  const herdDailyGreenConsumptionKg = currentTotalUAs * dailyGreenKgPerUa;
  
  // Recommended Grazing Days in paddock = Total Usable Forage in Paddock / Herd Daily Consumption
  const recommendedGrazingDays =
    herdDailyGreenConsumptionKg > 0 ? Math.floor(paddockTotalUsefulGreenKg / herdDailyGreenConsumptionKg) : 0;
  
  // Carrying capacity in UA/Ha for a standard 30-day rest grazing cycle:
  // (usefulGreenYieldKgHa / (30 days * dailyGreenKgPerUa))
  const carryingCapacityUaHa =
    dailyGreenKgPerUa > 0 ? Number((usefulGreenYieldKgHa / (30 * dailyGreenKgPerUa)).toFixed(2)) : 0;
  
  // Recommended Rest Days according to season
  const recommendedRestDays = season === 'lluvia' ? 32 : season === 'sequia' ? 50 : 40;

  // Status Alert
  let statusAlert: 'excelente' | 'adecuado' | 'riesgo_sobrepastoreo' | 'subaprovechado' = 'adecuado';
  if (totalGreenYieldTonHa >= 15) {
    statusAlert = 'excelente';
  } else if (totalGreenYieldTonHa < 8) {
    statusAlert = 'riesgo_sobrepastoreo';
  } else if (recommendedGrazingDays > 12) {
    statusAlert = 'subaprovechado';
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validCuts.length === 0) {
      setErrorMsg('Debes ingresar al menos un peso válido para el muestreo de aforo.');
      return;
    }

    const newAforo: AforoSampling = {
      id: 'aforo-' + Date.now(),
      farmId,
      farmName: selectedFarmPackage?.profile.name || 'Finca Sin Nombre',
      paddockId,
      paddockName: selectedPaddock?.name || 'Potrero N/A',
      paddockAreaHa,
      date,
      samplerName: samplerName.trim() || 'Evaluador',
      grassType,
      season,
      frameSizeM2,
      cuts: validCuts,
      avgWeightPerFrameKg: Number(avgWeightPerFrameKg.toFixed(3)),
      avgGreenYieldKgM2: Number(avgGreenYieldKgM2.toFixed(3)),
      totalGreenYieldTonHa: Number(totalGreenYieldTonHa.toFixed(2)),
      dryMatterPercentage,
      grazingLossPercentage,
      usefulGreenYieldKgHa: Math.round(usefulGreenYieldKgHa),
      usefulDryMatterKgHa: Math.round(usefulDryMatterKgHa),
      animalUnitWeightKg,
      dailyGreenConsumptionPercentage,
      recommendedGrazingDays,
      recommendedRestDays,
      carryingCapacityUaHa,
      currentAnimalsInPaddock: currentAnimalsCount,
      currentUAsInPaddock: currentTotalUAs,
      statusAlert,
      notes: notes.trim() || undefined,
    };

    onSaveAforo(newAforo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#c1c8c2] animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-[#012d1d] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ffba38] text-[#012d1d] rounded-2xl shadow-sm">
              <GrassIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Nuevo Aforo de Pastos</h2>
              <p className="text-xs text-[#c1ecd4]/80 font-medium">
                Muestreo de biomasa forrajera y capacidad de carga por marco
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-[#fee2e2] border border-[#fca5a5] text-[#b91c1c] text-xs font-bold rounded-2xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Ubicación y Datos Generales */}
          <div className="bg-[#f8fbf9] p-4 rounded-2xl border border-[#c1c8c2] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2ede6] pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#012d1d] flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-[#ffba38]" />
                1. Ubicación y Datos de Campo
              </span>
              <span className="text-[10px] font-mono font-bold text-[#2d6a4f] bg-[#e8f3ed] px-2 py-0.5 rounded-full">
                {paddockAreaHa} Hectáreas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Farm Selector */}
              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Hacienda / Finca:
                </label>
                <select
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d] focus:outline-none focus:border-[#012d1d]"
                >
                  {farms.map((f) => (
                    <option key={f.profile.id} value={f.profile.id}>
                      {f.profile.name} ({f.profile.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Paddock Selector */}
              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Potrero a Muestrear:
                </label>
                <select
                  value={paddockId}
                  onChange={(e) => setPaddockId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d] focus:outline-none focus:border-[#012d1d]"
                >
                  {farmPaddocks.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.areaHa} Ha - {p.grassType || 'Pasto'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Fecha de Muestreo:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d] focus:outline-none focus:border-[#012d1d]"
                  />
                </div>
              </div>

              {/* Sampler Name */}
              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Evaluador / Mayordomo:
                </label>
                <input
                  type="text"
                  value={samplerName}
                  onChange={(e) => setSamplerName(e.target.value)}
                  placeholder="Ej. Ing. Carlos, Mayordomo Pedro"
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-medium text-[#1a1c1c] focus:outline-none focus:border-[#012d1d]"
                />
              </div>

              {/* Grass Type */}
              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Especie de Pasto:
                </label>
                <select
                  value={grassType}
                  onChange={(e) => handleGrassTypeChange(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d] focus:outline-none focus:border-[#012d1d]"
                >
                  {GRASS_TYPES_PRESETS.map((g) => (
                    <option key={g.name} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Época del Año:
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as AforoSeason)}
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d] focus:outline-none focus:border-[#012d1d]"
                >
                  <option value="lluvia">🌧️ Temporada de Lluvias (Invierno)</option>
                  <option value="sequia">☀️ Temporada de Sequía (Verano)</option>
                  <option value="transicion">⛅ Época de Transición</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Marco y Pesaje de Muestras */}
          <div className="bg-[#f8fbf9] p-4 rounded-2xl border border-[#c1c8c2] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2ede6] pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#012d1d] flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-[#ffba38]" />
                2. Cortes de Marco (Pesaje de Forraje Verde)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#414844]">Tamaño Marco:</span>
                <select
                  value={frameSizeM2}
                  onChange={(e) => setFrameSizeM2(parseFloat(e.target.value))}
                  className="p-1 bg-white border border-[#c1c8c2] rounded-lg text-xs font-bold text-[#012d1d]"
                >
                  <option value={1.0}>1.0 m² (1m x 1m)</option>
                  <option value={0.5}>0.5 m² (1m x 0.5m)</option>
                  <option value={0.25}>0.25 m² (0.5m x 0.5m)</option>
                </select>
              </div>
            </div>

            {/* Frame List Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-extrabold uppercase text-[#717973] px-2">
                <span className="col-span-2">Muestra</span>
                <span className="col-span-4">Peso Verde (Kg)</span>
                <span className="col-span-4">Altura Pasto (cm)</span>
                <span className="col-span-2 text-right">Acción</span>
              </div>

              {cuts.map((cut, idx) => (
                <div
                  key={cut.frameIndex}
                  className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-[#c1c8c2]"
                >
                  <span className="col-span-2 text-xs font-extrabold text-[#012d1d] pl-1">
                    Marco #{cut.frameIndex}
                  </span>
                  <div className="col-span-4 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={cut.weightKg}
                      onChange={(e) => handleUpdateCutWeight(idx, e.target.value)}
                      className="w-full p-1.5 bg-[#f8fbf9] border border-[#c1c8c2] rounded-lg text-xs font-bold text-[#012d1d] text-center focus:outline-none focus:border-[#012d1d]"
                    />
                    <span className="text-[10px] font-bold text-[#717973]">kg</span>
                  </div>
                  <div className="col-span-4 flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="200"
                      value={cut.heightCm || ''}
                      onChange={(e) => handleUpdateCutHeight(idx, e.target.value)}
                      className="w-full p-1.5 bg-[#f8fbf9] border border-[#c1c8c2] rounded-lg text-xs font-bold text-[#012d1d] text-center focus:outline-none focus:border-[#012d1d]"
                      placeholder="45"
                    />
                    <span className="text-[10px] font-bold text-[#717973]">cm</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveFrame(idx)}
                      className="p-1.5 text-[#b91c1c] hover:bg-[#fee2e2] rounded-lg transition-all cursor-pointer"
                      title="Eliminar muestra"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddFrame}
              className="w-full py-2 bg-white hover:bg-[#e8f3ed] text-[#012d1d] font-bold text-xs rounded-xl border border-dashed border-[#2d6a4f] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#ffba38]" />
              <span>+ Agregar Cuadro de Muestreo</span>
            </button>

            {/* Frame Cut Summary Badge */}
            <div className="bg-[#e8f3ed] p-3 rounded-xl border border-[#c1ecd4] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[#414844] font-medium">Promedio por Marco: </span>
                <span className="font-extrabold text-[#012d1d] font-mono">
                  {avgWeightPerFrameKg.toFixed(2)} kg
                </span>
              </div>
              <div>
                <span className="text-[#414844] font-medium">Rendimiento m²: </span>
                <span className="font-extrabold text-[#012d1d] font-mono">
                  {avgGreenYieldKgM2.toFixed(2)} kg/m²
                </span>
              </div>
              <div className="bg-[#012d1d] text-white px-2.5 py-1 rounded-lg font-extrabold font-mono text-xs shadow-2xs">
                {totalGreenYieldTonHa.toFixed(1)} Ton Verde / Ha
              </div>
            </div>
          </div>

          {/* Section 3: Parámetros de Aprovechamiento y Carga */}
          <div className="bg-[#f8fbf9] p-4 rounded-2xl border border-[#c1c8c2] space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#012d1d] flex items-center gap-1.5 border-b border-[#e2ede6] pb-2 block">
              <Sliders className="w-4 h-4 text-[#ffba38]" />
              3. Ajuste de Pérdidas y Consumo Ganadero
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#414844] uppercase mb-1">
                  % Materia Seca (% MS):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={dryMatterPercentage}
                    onChange={(e) => setDryMatterPercentage(parseFloat(e.target.value) || 20)}
                    className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  />
                  <span className="text-xs font-bold text-[#717973]">%</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#414844] uppercase mb-1">
                  % Pérdida (Pisoteo/Rechazo):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={grazingLossPercentage}
                    onChange={(e) => setGrazingLossPercentage(parseFloat(e.target.value) || 30)}
                    className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  />
                  <span className="text-xs font-bold text-[#717973]">%</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#414844] uppercase mb-1">
                  Cabezas del Lote Actual:
                </label>
                <input
                  type="number"
                  min="1"
                  value={currentAnimalsCount}
                  onChange={(e) => setCurrentAnimalsCount(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Live Results Box */}
          <div className="bg-[#012d1d] text-white p-4 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#ffba38] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Resultados del Aforo en {paddockAreaHa} Ha
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  statusAlert === 'excelente'
                    ? 'bg-[#15803d] text-white'
                    : statusAlert === 'riesgo_sobrepastoreo'
                    ? 'bg-[#dc2626] text-white'
                    : 'bg-[#d97706] text-white'
                }`}
              >
                {statusAlert === 'excelente'
                  ? 'Oferta Alta'
                  : statusAlert === 'riesgo_sobrepastoreo'
                  ? 'Baja Oferta / Alerta'
                  : 'Oferta Normal'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <span className="block text-[9.5px] font-semibold text-[#c1ecd4] uppercase">
                  Forraje Útil (Kg/Ha)
                </span>
                <span className="text-base font-extrabold text-white font-mono">
                  {Math.round(usefulGreenYieldKgHa).toLocaleString()}
                </span>
              </div>

              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <span className="block text-[9.5px] font-semibold text-[#c1ecd4] uppercase">
                  Materia Seca (Kg MS/Ha)
                </span>
                <span className="text-base font-extrabold text-[#ffba38] font-mono">
                  {Math.round(usefulDryMatterKgHa).toLocaleString()}
                </span>
              </div>

              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <span className="block text-[9.5px] font-semibold text-[#c1ecd4] uppercase">
                  Capacidad Carga (UA/Ha)
                </span>
                <span className="text-base font-extrabold text-white font-mono">
                  {carryingCapacityUaHa} UA
                </span>
              </div>

              <div className="bg-[#ffba38] text-[#012d1d] p-2.5 rounded-xl font-bold shadow-inner">
                <span className="block text-[9.5px] font-extrabold uppercase opacity-80">
                  Días Pastoreo Lote
                </span>
                <span className="text-lg font-black font-mono">
                  {recommendedGrazingDays} Días
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
              Observaciones del Pastizal (Opcional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Buena presencia de trébol/leguminosa, libre de malezas leñosas, rebrote uniforme..."
              className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-medium text-[#1a1c1c] focus:outline-none focus:border-[#012d1d]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#f0f0f0]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white hover:bg-[#f0f0f0] text-[#414844] font-bold text-xs rounded-xl border border-[#c1c8c2] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
              <span>Guardar Aforo de Pastos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
