import React from 'react';
import { PaddockGeo, LotRecord } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Waves,
  ArrowRight,
  TrendingUp,
  Scale,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface RotationMatrixViewProps {
  paddocks: PaddockGeo[];
  lots: LotRecord[];
  onSelectPaddock: (paddock: PaddockGeo) => void;
  onOpenAforoCalculator: (paddock: PaddockGeo) => void;
  onAssignLot: (paddockId: string, lotId: string | undefined) => void;
}

export const RotationMatrixView: React.FC<RotationMatrixViewProps> = ({
  paddocks,
  lots,
  onSelectPaddock,
  onOpenAforoCalculator,
  onAssignLot,
}) => {
  const readyPaddocks = paddocks.filter((p) => p.status === 'listo');
  const occupiedPaddocks = paddocks.filter((p) => p.status === 'ocupado');
  const restingPaddocks = paddocks.filter((p) => p.status === 'descanso');
  const restrictedPaddocks = paddocks.filter(
    (p) => p.status === 'inundado' || p.status === 'recuperacion',
  );

  // Rotation global stats
  const totalOccupiedHa = occupiedPaddocks.reduce((sum, p) => sum + p.areaHa, 0);
  const totalOccupiedHeads = occupiedPaddocks.reduce((sum, p) => sum + (p.currentHeads || 0), 0);
  const instantaneousStockingRate =
    totalOccupiedHa > 0 ? (totalOccupiedHeads / totalOccupiedHa).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Grazing Rhythm Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Presión de Pastoreo</p>
          <p className="text-xl font-mono font-extrabold text-white">
            {instantaneousStockingRate} <span className="text-xs text-[#A5B8AC]">Cab/Ha</span>
          </p>
          <p className="text-[10px] text-[#A5B8AC]">
            {totalOccupiedHeads} cabezas en {totalOccupiedHa.toFixed(1)} Ha activas
          </p>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Potreros Listos (Óptimo)</p>
          <p className="text-xl font-mono font-extrabold text-emerald-400">
            {readyPaddocks.length} <span className="text-xs text-[#A5B8AC]">potreros</span>
          </p>
          <p className="text-[10px] text-emerald-400 font-bold">
            {readyPaddocks.reduce((sum, p) => sum + p.areaHa, 0).toFixed(1)} Ha con descanso cumplido
          </p>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">En Pastoreo Activo</p>
          <p className="text-xl font-mono font-extrabold text-rose-400">
            {occupiedPaddocks.length} <span className="text-xs text-[#A5B8AC]">potreros</span>
          </p>
          <p className="text-[10px] text-[#A5B8AC]">
            {occupiedPaddocks.reduce((sum, p) => sum + p.areaHa, 0).toFixed(1)} Ha ocupadas hoy
          </p>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">En Reposo Vegetativo</p>
          <p className="text-xl font-mono font-extrabold text-[#D4A94E]">
            {restingPaddocks.length} <span className="text-xs text-[#A5B8AC]">potreros</span>
          </p>
          <p className="text-[10px] text-[#A5B8AC]">Acumulando biomasa y carbohidratos</p>
        </div>
      </div>

      {/* Kanban / Visual Rotation Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Ocupados Actualmente */}
        <div className="bg-[#15241C] rounded-3xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
          <div className="bg-rose-950/40 border-b border-rose-500/20 p-4 flex items-center justify-between">
            <h3 className="font-bold text-xs text-rose-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
              Ocupados con Ganado ({occupiedPaddocks.length})
            </h3>
            <span className="text-[11px] font-mono font-bold text-rose-300">Pastoreo Activo</span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px] bg-[#121E17]">
            {occupiedPaddocks.map((p) => {
              const occupancyPct = Math.min(
                100,
                Math.round(((p.daysInOccupancy || 1) / p.occupancyDaysTarget) * 100),
              );

              return (
                <div
                  key={p.id}
                  className="bg-[#1A2C22] p-4 rounded-2xl border border-white/10 space-y-3 hover:border-[#D4A94E]/50 transition-all cursor-pointer"
                  onClick={() => onSelectPaddock(p)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-[#0D1A13] text-[#D4A94E] border border-[#D4A94E]/30 text-xs font-bold px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      <h4 className="font-bold text-sm text-white">{p.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#A5B8AC]">{p.areaHa} Ha</span>
                  </div>

                  {/* Assigned Lot Badge */}
                  <div className="bg-[#15241C] p-2.5 rounded-xl border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">
                        🐄 {p.assignedLotName || 'Lote Activo'}
                      </span>
                      <span className="font-mono font-bold text-[#D4A94E]">
                        {p.currentHeads || 45} cabezas
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#A5B8AC]">
                      <span>
                        Día {p.daysInOccupancy || 1} de {p.occupancyDaysTarget} objetivo
                      </span>
                      <span>Salida: {p.targetExitDate || 'Pronto'}</span>
                    </div>

                    {/* Progress Bar of Occupancy */}
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct >= 100 ? 'bg-rose-500' : 'bg-[#D4A94E]'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAforoCalculator(p);
                      }}
                      className="text-xs font-bold text-[#D4A94E] hover:underline flex items-center gap-1"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      Aforo: {p.forageYieldKgM2} kg/m²
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignLot(p.id, undefined);
                      }}
                      className="text-[11px] font-bold text-rose-300 hover:bg-rose-900/40 px-2 py-1 rounded-lg border border-rose-500/30 transition-colors"
                    >
                      Mover Lote
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Listos para Pastoreo */}
        <div className="bg-[#15241C] rounded-3xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
          <div className="bg-[#123F2A]/60 border-b border-emerald-500/20 p-4 flex items-center justify-between">
            <h3 className="font-bold text-xs text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Listos para Pastoreo ({readyPaddocks.length})
            </h3>
            <span className="text-[11px] font-mono font-bold text-emerald-300">Punto Óptimo</span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px] bg-[#121E17]">
            {readyPaddocks.length === 0 ? (
              <p className="text-xs text-[#A5B8AC] text-center py-6">
                No hay potreros con descanso completo en este momento.
              </p>
            ) : (
              readyPaddocks.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#1A2C22] p-4 rounded-2xl border border-white/10 space-y-3 hover:border-emerald-400/50 transition-all cursor-pointer"
                  onClick={() => onSelectPaddock(p)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-[#0D1A13] text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      <h4 className="font-bold text-sm text-white">{p.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#A5B8AC]">{p.areaHa} Ha</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#15241C] p-2.5 rounded-xl border border-white/10">
                    <div>
                      <span className="text-[10px] text-[#A5B8AC] block">Capacidad</span>
                      <span className="font-mono font-bold text-white">
                        {p.carryingCapacityUGG} UGG ({p.maxHeadsRecommended} cab)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A5B8AC] block">Días Reposo</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {p.daysInRest} días cumplidos
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-[#A5B8AC] truncate max-w-[140px]">
                      {p.pastureType}
                    </span>

                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        if (e.target.value) {
                          onAssignLot(p.id, e.target.value);
                        }
                      }}
                      defaultValue=""
                      className="bg-[#D4A94E] hover:bg-[#E4C477] text-[#0D1A13] font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <option value="" disabled>
                        Meter Lote aquí...
                      </option>
                      {lots.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.heads} cab)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: En Descanso & Recuperación */}
        <div className="bg-[#15241C] rounded-3xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
          <div className="bg-[#202E25] border-b border-[#D4A94E]/20 p-4 flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#D4A94E] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4A94E]" />
              En Descanso Vegetativo ({restingPaddocks.length})
            </h3>
            <span className="text-[11px] font-mono font-bold text-[#D4A94E]">Recuperación</span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px] bg-[#121E17]">
            {restingPaddocks.map((p) => {
              const recoveryPct = Math.min(100, Math.round((p.daysInRest / p.restDaysTarget) * 100));

              return (
                <div
                  key={p.id}
                  className="bg-[#1A2C22] p-4 rounded-2xl border border-white/10 space-y-3 hover:border-[#D4A94E]/50 transition-all cursor-pointer"
                  onClick={() => onSelectPaddock(p)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-[#0D1A13] text-[#A5B8AC] border border-white/10 text-xs font-bold px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      <h4 className="font-bold text-sm text-white">{p.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#A5B8AC]">{p.areaHa} Ha</span>
                  </div>

                  {/* Progress of Rest Period */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[#A5B8AC]">
                      <span>Progreso de reposo:</span>
                      <span className="font-mono font-bold text-white">
                        {p.daysInRest} de {p.restDaysTarget} días ({recoveryPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${recoveryPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#A5B8AC]">
                    <span>Faltan: {Math.max(0, p.restDaysTarget - p.daysInRest)} días</span>
                    <span className="font-mono font-bold text-white">
                      {p.forageYieldKgM2} kg/m²
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
