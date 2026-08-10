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
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">Presión de Pastoreo</p>
          <p className="text-xl font-mono font-extrabold text-[#012d1d]">
            {instantaneousStockingRate} <span className="text-xs text-[#717973]">Cab/Ha</span>
          </p>
          <p className="text-[10px] text-[#717973]">
            {totalOccupiedHeads} cabezas en {totalOccupiedHa.toFixed(1)} Ha activas
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">Potreros Listos (Óptimo)</p>
          <p className="text-xl font-mono font-extrabold text-emerald-800">
            {readyPaddocks.length} <span className="text-xs text-[#717973]">potreros</span>
          </p>
          <p className="text-[10px] text-emerald-700 font-bold">
            {readyPaddocks.reduce((sum, p) => sum + p.areaHa, 0).toFixed(1)} Ha con descanso cumplido
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">En Pastoreo Activo</p>
          <p className="text-xl font-mono font-extrabold text-[#ba1a1a]">
            {occupiedPaddocks.length} <span className="text-xs text-[#717973]">potreros</span>
          </p>
          <p className="text-[10px] text-[#717973]">
            {occupiedPaddocks.reduce((sum, p) => sum + p.areaHa, 0).toFixed(1)} Ha ocupadas hoy
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">En Reposo Vegetativo</p>
          <p className="text-xl font-mono font-extrabold text-[#523700]">
            {restingPaddocks.length} <span className="text-xs text-[#717973]">potreros</span>
          </p>
          <p className="text-[10px] text-[#717973]">Acumulando biomasa y carbohidratos</p>
        </div>
      </div>

      {/* Kanban / Visual Rotation Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Ocupados Actualmente */}
        <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow overflow-hidden flex flex-col">
          <div className="bg-[#ffdad6] border-b border-[#ba1a1a]/20 p-4 flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#ba1a1a] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse" />
              Ocupados con Ganado ({occupiedPaddocks.length})
            </h3>
            <span className="text-[11px] font-mono font-bold text-[#ba1a1a]">Pastoreo Activo</span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px] bg-[#fdfdfd]">
            {occupiedPaddocks.map((p) => {
              const occupancyPct = Math.min(
                100,
                Math.round(((p.daysInOccupancy || 1) / p.occupancyDaysTarget) * 100),
              );

              return (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow space-y-3 hover:border-[#1b4332] transition-all cursor-pointer"
                  onClick={() => onSelectPaddock(p)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-[#012d1d] text-[#ffba38] text-xs font-bold px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      <h4 className="font-bold text-sm text-[#012d1d]">{p.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#717973]">{p.areaHa} Ha</span>
                  </div>

                  {/* Assigned Lot Badge */}
                  <div className="bg-[#f3f3f3] p-2.5 rounded-xl border border-[#c1c8c2] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#012d1d]">
                        🐄 {p.assignedLotName || 'Lote Activo'}
                      </span>
                      <span className="font-mono font-bold text-[#523700]">
                        {p.currentHeads || 45} cabezas
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#717973]">
                      <span>
                        Día {p.daysInOccupancy || 1} de {p.occupancyDaysTarget} objetivo
                      </span>
                      <span>Salida: {p.targetExitDate || 'Pronto'}</span>
                    </div>

                    {/* Progress Bar of Occupancy */}
                    <div className="w-full bg-[#e0e0e0] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct >= 100 ? 'bg-[#ba1a1a]' : 'bg-[#ffba38]'
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
                      className="text-xs font-bold text-[#523700] hover:underline flex items-center gap-1"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      Aforo: {p.forageYieldKgM2} kg/m²
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignLot(p.id, undefined);
                      }}
                      className="text-[11px] font-bold text-[#ba1a1a] hover:bg-[#ffdad6] px-2 py-1 rounded-lg border border-[#ba1a1a]/30 transition-colors"
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
        <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow overflow-hidden flex flex-col">
          <div className="bg-[#c1ecd4] border-b border-[#1b4332]/20 p-4 flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#002114] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-800" />
              Listos para Pastoreo ({readyPaddocks.length})
            </h3>
            <span className="text-[11px] font-mono font-bold text-[#002114]">Punto Óptimo</span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px] bg-[#fdfdfd]">
            {readyPaddocks.length === 0 ? (
              <p className="text-xs text-[#717973] text-center py-6">
                No hay potreros con descanso completo en este momento.
              </p>
            ) : (
              readyPaddocks.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow space-y-3 hover:border-[#1b4332] transition-all cursor-pointer"
                  onClick={() => onSelectPaddock(p)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-[#012d1d] text-[#c1ecd4] text-xs font-bold px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      <h4 className="font-bold text-sm text-[#012d1d]">{p.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#717973]">{p.areaHa} Ha</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#f3f3f3] p-2.5 rounded-xl border border-[#c1c8c2]">
                    <div>
                      <span className="text-[10px] text-[#717973] block">Capacidad</span>
                      <span className="font-mono font-bold text-[#012d1d]">
                        {p.carryingCapacityUGG} UGG ({p.maxHeadsRecommended} cab)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#717973] block">Días Reposo</span>
                      <span className="font-mono font-bold text-emerald-800">
                        {p.daysInRest} días cumplidos
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-[#717973] truncate max-w-[140px]">
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
                      className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
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
        <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow overflow-hidden flex flex-col">
          <div className="bg-[#ffdeac] border-b border-[#ffba38]/20 p-4 flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#523700] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#523700]" />
              En Descanso Vegetativo ({restingPaddocks.length})
            </h3>
            <span className="text-[11px] font-mono font-bold text-[#523700]">Recuperación</span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px] bg-[#fdfdfd]">
            {restingPaddocks.map((p) => {
              const recoveryPct = Math.min(100, Math.round((p.daysInRest / p.restDaysTarget) * 100));

              return (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow space-y-3 hover:border-[#1b4332] transition-all cursor-pointer"
                  onClick={() => onSelectPaddock(p)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-[#012d1d] text-[#86af99] text-xs font-bold px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      <h4 className="font-bold text-sm text-[#012d1d]">{p.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#717973]">{p.areaHa} Ha</span>
                  </div>

                  {/* Progress of Rest Period */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[#717973]">
                      <span>Progreso de reposo:</span>
                      <span className="font-mono font-bold text-[#012d1d]">
                        {p.daysInRest} de {p.restDaysTarget} días ({recoveryPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#e0e0e0] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${recoveryPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#717973]">
                    <span>Faltan: {Math.max(0, p.restDaysTarget - p.daysInRest)} días</span>
                    <span className="font-mono font-bold text-[#012d1d]">
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
