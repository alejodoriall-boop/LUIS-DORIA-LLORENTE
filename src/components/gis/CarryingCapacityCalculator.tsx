import React, { useState, useMemo } from 'react';
import { PaddockGeo, LotRecord } from '../../types';
import { calculateCarryingCapacity } from '../../utils/geoUtils';
import {
  Scale,
  X,
  TrendingUp,
  Droplets,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  HelpCircle,
} from 'lucide-react';

interface CarryingCapacityCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  paddocks: PaddockGeo[];
  initialPaddockId?: string;
  lots: LotRecord[];
  onSavePaddockAforo: (
    paddockId: string,
    updates: {
      forageYieldKgM2: number;
      dryMatterPct: number;
      grazingEfficiencyPct: number;
      occupancyDaysTarget: number;
      restDaysTarget: number;
      carryingCapacityUGG: number;
      carryingCapacityUGGPerHa: number;
      maxHeadsRecommended: number;
      forageTotalTon: number;
    },
  ) => void;
}

export const CarryingCapacityCalculator: React.FC<CarryingCapacityCalculatorProps> = ({
  isOpen,
  onClose,
  paddocks,
  initialPaddockId,
  lots,
  onSavePaddockAforo,
}) => {
  const [selectedPaddockId, setSelectedPaddockId] = useState<string>(
    initialPaddockId || (paddocks[0]?.id ?? ''),
  );

  const selectedPaddock = paddocks.find((p) => p.id === selectedPaddockId) || paddocks[0];

  // Form State
  const [areaHa, setAreaHa] = useState<number>(selectedPaddock?.areaHa || 18.4);
  const [forageYieldKgM2, setForageYieldKgM2] = useState<number>(
    selectedPaddock?.forageYieldKgM2 || 3.8,
  );
  const [dryMatterPct, setDryMatterPct] = useState<number>(selectedPaddock?.dryMatterPct || 20);
  const [efficiencyPct, setEfficiencyPct] = useState<number>(
    selectedPaddock?.grazingEfficiencyPct || 65,
  );
  const [animalWeightKg, setAnimalWeightKg] = useState<number>(420);
  const [occupancyDays, setOccupancyDays] = useState<number>(
    selectedPaddock?.occupancyDaysTarget || 2,
  );
  const [restDays, setRestDays] = useState<number>(selectedPaddock?.restDaysTarget || 30);
  const [currentHeads, setCurrentHeads] = useState<number>(selectedPaddock?.currentHeads || 45);

  // Sync with selected paddock when changed
  React.useEffect(() => {
    if (selectedPaddock) {
      setAreaHa(selectedPaddock.areaHa);
      setForageYieldKgM2(selectedPaddock.forageYieldKgM2);
      setDryMatterPct(selectedPaddock.dryMatterPct);
      setEfficiencyPct(selectedPaddock.grazingEfficiencyPct);
      setOccupancyDays(selectedPaddock.occupancyDaysTarget);
      setRestDays(selectedPaddock.restDaysTarget);
      if (selectedPaddock.currentHeads) setCurrentHeads(selectedPaddock.currentHeads);
    }
  }, [selectedPaddockId]);

  // Live Calculations
  const result = useMemo(() => {
    return calculateCarryingCapacity({
      areaHa,
      forageYieldKgM2,
      dryMatterPct,
      efficiencyPct,
      animalWeightKg,
      occupancyDays,
      restDays,
      currentHeads,
    });
  }, [areaHa, forageYieldKgM2, dryMatterPct, efficiencyPct, animalWeightKg, occupancyDays, restDays, currentHeads]);

  // Calculate actual duration with current heads
  const actualDaysDuration = useMemo(() => {
    const dailyDemandTotalKg = currentHeads * (animalWeightKg * 0.10);
    if (dailyDemandTotalKg === 0) return 0;
    return Number((result.usableForageKg / dailyDemandTotalKg).toFixed(1));
  }, [result.usableForageKg, currentHeads, animalWeightKg]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!selectedPaddock) return;
    onSavePaddockAforo(selectedPaddock.id, {
      forageYieldKgM2,
      dryMatterPct,
      grazingEfficiencyPct: efficiencyPct,
      occupancyDaysTarget: occupancyDays,
      restDaysTarget: restDays,
      carryingCapacityUGG: result.instantaneousUGG,
      carryingCapacityUGGPerHa: result.uggPerHectare,
      maxHeadsRecommended: result.maxHeadsForDuration,
      forageTotalTon: Math.round((areaHa * 10000 * forageYieldKgM2) / 1000),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-3xl border border-white/10 card-shadow max-w-3xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#123F2A] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D1A13] border border-[#2d6a4f] flex items-center justify-center text-[#ffba38]">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Calculadora de Aforo & Capacidad de Carga
              </h3>
              <p className="text-xs text-[#86af99]">
                Zootecnia de pasturas, oferta forrajera y rotación Voisin (PRV)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-[#f9f9f9]">
          {/* Paddock Selector */}
          <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 card-shadow flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="w-full sm:w-auto">
              <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                Seleccionar Potrero de la Finca
              </label>
              <select
                value={selectedPaddockId}
                onChange={(e) => setSelectedPaddockId(e.target.value)}
                className="w-full sm:w-64 bg-[#f3f3f3] border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm font-bold text-white"
              >
                {paddocks.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} ({p.areaHa} Ha)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#f3f3f3] px-3 py-2 rounded-xl border border-white/10 text-xs">
              <span className="text-[#717973]">Pasto:</span>
              <span className="font-bold text-white">
                {selectedPaddock?.pastureType || 'Brachiaria'}
              </span>
            </div>
          </div>

          {/* Core Calculation Outputs Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#15241C] p-3.5 rounded-2xl border border-white/10 card-shadow text-center">
              <p className="text-[10px] uppercase font-bold text-[#717973]">Capacidad Instantánea</p>
              <p className="text-xl font-mono font-extrabold text-white">
                {result.instantaneousUGG}{' '}
                <span className="text-xs font-bold text-[#717973]">UGG</span>
              </p>
              <p className="text-[10px] text-emerald-700 font-bold font-mono">
                {result.uggPerHectare} UGG / Ha
              </p>
            </div>

            <div className="bg-[#15241C] p-3.5 rounded-2xl border border-white/10 card-shadow text-center">
              <p className="text-[10px] uppercase font-bold text-[#717973]">Cabezas Permitidas</p>
              <p className="text-xl font-mono font-extrabold text-[#0D1A13]">
                {result.maxHeadsForDuration}
              </p>
              <p className="text-[10px] text-[#717973]">
                {animalWeightKg} kg PV ({occupancyDays} días)
              </p>
            </div>

            <div className="bg-[#15241C] p-3.5 rounded-2xl border border-white/10 card-shadow text-center">
              <p className="text-[10px] uppercase font-bold text-[#717973]">Forraje Aprovechable</p>
              <p className="text-xl font-mono font-extrabold text-white">
                {(result.usableForageKg / 1000).toFixed(1)}{' '}
                <span className="text-xs font-bold text-[#717973]">Ton</span>
              </p>
              <p className="text-[10px] text-[#717973] font-mono">
                {(result.totalDryMatterKg / 1000).toFixed(1)} Ton MS
              </p>
            </div>

            <div className="bg-[#15241C] p-3.5 rounded-2xl border border-white/10 card-shadow text-center">
              <p className="text-[10px] uppercase font-bold text-[#717973]">Potreros en Rotación</p>
              <p className="text-xl font-mono font-extrabold text-white">
                {result.totalPaddocksNeededInRotation}
              </p>
              <p className="text-[10px] text-[#717973]">
                {restDays}d descanso / {occupancyDays}d pastoreo
              </p>
            </div>
          </div>

          {/* Grazing Simulation & Alerts */}
          <div
            className={`p-4 rounded-2xl border ${
              actualDaysDuration < occupancyDays
                ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]'
                : actualDaysDuration > occupancyDays * 1.8
                ? 'bg-[#ffdeac] text-[#0D1A13] border-[#ffba38]'
                : 'bg-[#c1ecd4] text-[#002114] border-[#1b4332]'
            }`}
          >
            <div className="flex items-start gap-3">
              {actualDaysDuration < occupancyDays ? (
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-800" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm">
                  {actualDaysDuration < occupancyDays
                    ? '⚠️ Alerta de Sobrecarga / Forraje Insuficiente'
                    : actualDaysDuration > occupancyDays * 1.8
                    ? '🌾 Excedente Forrajero (Subpastoreo)'
                    : '✅ Carga Animal Óptima para el Potrero'}
                </p>
                <p className="leading-relaxed">
                  Con el lote actual de <b>{currentHeads} animales</b> ({animalWeightKg} kg), este potrero
                  brinda alimento para <b>{actualDaysDuration} días</b> de ocupación antes de tocar el
                  remanente fisiológico de la planta.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Parameter Sliders */}
          <div className="bg-[#15241C] p-5 rounded-2xl border border-white/10 card-shadow space-y-5">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider">
              Variables Zootécnicas de Aforo
            </h4>

            {/* Slider 1: Aforo kg/m² */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-white">
                  1. Aforo de Forraje Verde (kg/m²):
                </label>
                <span className="font-mono font-extrabold text-white bg-[#f3f3f3] px-2 py-0.5 rounded border border-white/10">
                  {forageYieldKgM2} kg/m² ({forageYieldKgM2 * 10} Ton MV/Ha)
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.1"
                value={forageYieldKgM2}
                onChange={(e) => setForageYieldKgM2(parseFloat(e.target.value))}
                className="w-full accent-[#ffba38] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717973]">
                <span>1.0 kg/m² (Pasto bajo/degradado)</span>
                <span>3.5 kg/m² (Promedio Brachiaria)</span>
                <span>8.0 kg/m² (Mombasa/SSP intensivo)</span>
              </div>
            </div>

            {/* Grid for Area and Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Área del Potrero (Ha)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={areaHa}
                  onChange={(e) => setAreaHa(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-full bg-[#f3f3f3] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Peso Promedio Animal (kg PV)
                </label>
                <input
                  type="number"
                  step="10"
                  value={animalWeightKg}
                  onChange={(e) => setAnimalWeightKg(Math.max(50, parseInt(e.target.value) || 50))}
                  className="w-full bg-[#f3f3f3] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white text-xs"
                />
              </div>
            </div>

            {/* Slider 2: Occupancy Days & Rest Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">Días de Ocupación:</span>
                  <span className="font-mono font-bold text-[#0D1A13]">{occupancyDays} días</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={occupancyDays}
                  onChange={(e) => setOccupancyDays(parseInt(e.target.value))}
                  className="w-full accent-[#1b4332] cursor-pointer"
                />
                <span className="text-[10px] text-[#717973] block">
                  Recomendado: 1 a 2 días para no comer rebrote
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">Días de Descanso:</span>
                  <span className="font-mono font-bold text-emerald-800">{restDays} días</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="1"
                  value={restDays}
                  onChange={(e) => setRestDays(parseInt(e.target.value))}
                  className="w-full accent-[#1b4332] cursor-pointer"
                />
                <span className="text-[10px] text-[#717973] block">
                  Lluvias: 28-35 días • Sequía: 45-60 días
                </span>
              </div>
            </div>

            {/* Efficiency and DM% */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#eeeeee]">
              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  % Aprovechamiento Sin Desperdicio ({efficiencyPct}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="85"
                  value={efficiencyPct}
                  onChange={(e) => setEfficiencyPct(parseInt(e.target.value))}
                  className="w-full accent-[#ffba38] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  % Materia Seca ({dryMatterPct}% MS)
                </label>
                <input
                  type="range"
                  min="15"
                  max="30"
                  value={dryMatterPct}
                  onChange={(e) => setDryMatterPct(parseInt(e.target.value))}
                  className="w-full accent-[#ffba38] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Water Supply Math */}
          <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 card-shadow space-y-3">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-600" />
              Requerimiento Hídrico del Lote
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#f3f3f3] rounded-xl border border-white/10">
                <span className="text-[10px] text-[#717973] uppercase font-bold block">
                  Consumo Diario Total
                </span>
                <span className="text-base font-mono font-bold text-white">
                  {result.dailyWaterNeedLiters.toLocaleString()} Litros / día
                </span>
                <span className="text-[10px] text-[#717973]">
                  (~65 L/cab/día para {currentHeads} animales)
                </span>
              </div>
              <div className="p-3 bg-[#f3f3f3] rounded-xl border border-white/10">
                <span className="text-[10px] text-[#717973] uppercase font-bold block">
                  Caudal Mínimo en Bebedero
                </span>
                <span className="text-base font-mono font-bold text-blue-700">
                  {result.troughFlowRateRequiredLpm} L/min
                </span>
                <span className="text-[10px] text-[#717973]">Válvula de flotador alto caudal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#eeeeee] p-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-[#414844] hover:bg-[#15241C] transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="bg-[#D4A94E] hover:bg-[#ffdeac] text-[#0D1A13] font-bold text-xs md:text-sm px-6 py-2.5 rounded-xl tactical-shadow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar Aforo en Potrero
          </button>
        </div>
      </div>
    </div>
  );
};
