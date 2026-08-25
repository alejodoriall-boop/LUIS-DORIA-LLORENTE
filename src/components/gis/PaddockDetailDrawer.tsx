import React from 'react';
import { PaddockGeo, LotRecord } from '../../types';
import { safeConfirm } from '../../utils/printUtils';
import {
  X,
  Scale,
  Mountain,
  Waves,
  FlaskConical,
  Droplets,
  Calendar,
  Layers,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface PaddockDetailDrawerProps {
  paddock: PaddockGeo | null;
  onClose: () => void;
  lots: LotRecord[];
  onOpenAforoCalculator: (paddock: PaddockGeo) => void;
  onOpenPaddockEditor: (paddock: PaddockGeo) => void;
  onAssignLot: (paddockId: string, lotId: string | undefined) => void;
  onDeletePaddock: (paddockId: string) => void;
}

export const PaddockDetailDrawer: React.FC<PaddockDetailDrawerProps> = ({
  paddock,
  onClose,
  lots,
  onOpenAforoCalculator,
  onOpenPaddockEditor,
  onAssignLot,
  onDeletePaddock,
}) => {
  if (!paddock) return null;

  const getStatusBadge = (status: PaddockGeo['status']) => {
    switch (status) {
      case 'ocupado':
        return {
          bg: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
          label: 'OCUPADO CON GANADO',
          icon: Clock,
        };
      case 'listo':
        return {
          bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
          label: 'LISTO PARA PASTOREO',
          icon: CheckCircle2,
        };
      case 'descanso':
        return {
          bg: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
          label: 'EN DESCANSO VEGETATIVO',
          icon: Calendar,
        };
      case 'inundado':
        return {
          bg: 'bg-sky-950/70 text-sky-300 border-sky-500/40',
          label: 'ZONA INUNDADA / RESTRINGIDA',
          icon: Waves,
        };
      default:
        return {
          bg: 'bg-white/10 text-white border-white/20',
          label: 'EN RECUPERACIÓN',
          icon: Layers,
        };
    }
  };

  const statusBadge = getStatusBadge(paddock.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0D1A13] shadow-2xl border-l border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 text-white">
      {/* Drawer Header */}
      <div className="bg-[#123F2A] text-white p-5 flex items-center justify-between shrink-0 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono bg-[#0D1A13] text-[#D4A94E] px-2 py-0.5 rounded text-xs font-bold border border-[#D4A94E]/40">
              {paddock.code}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg} flex items-center gap-1`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusBadge.label}
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">{paddock.name}</h3>
        </div>

        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#0D1A13]">
        {/* Metric Highlights Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#15241C] p-3 rounded-2xl border border-white/10 shadow-xs text-center">
            <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Superficie</p>
            <p className="text-lg font-mono font-extrabold text-white">{paddock.areaHa} Ha</p>
            <p className="text-[10px] text-[#A5B8AC] font-mono">
              {paddock.areaM2.toLocaleString()} m²
            </p>
          </div>

          <div className="bg-[#15241C] p-3 rounded-2xl border border-white/10 shadow-xs text-center">
            <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Capacidad UGG</p>
            <p className="text-lg font-mono font-extrabold text-[#D4A94E]">
              {paddock.carryingCapacityUGG}
            </p>
            <p className="text-[10px] text-emerald-400 font-bold font-mono">
              {paddock.carryingCapacityUGGPerHa} UGG/Ha
            </p>
          </div>

          <div className="bg-[#15241C] p-3 rounded-2xl border border-white/10 shadow-xs text-center">
            <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Aforo Forraje</p>
            <p className="text-lg font-mono font-extrabold text-white">
              {paddock.forageYieldKgM2}
            </p>
            <p className="text-[10px] text-[#A5B8AC] font-mono">kg/m² ({paddock.forageTotalTon} Ton)</p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAforoCalculator(paddock)}
            className="flex-1 bg-[#D4A94E] hover:bg-[#E4C477] text-[#0D1A13] font-bold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Scale className="w-4 h-4" />
            Calcular Aforo & Capacidad
          </button>

          <button
            onClick={() => onOpenPaddockEditor(paddock)}
            className="bg-[#15241C] hover:bg-[#1F3327] text-white border border-white/10 p-2.5 rounded-xl transition-colors"
            title="Editar Ficha"
          >
            <Edit3 className="w-4 h-4 text-[#D4A94E]" />
          </button>

          <button
            onClick={() => {
              if (safeConfirm(`¿Eliminar el potrero ${paddock.name} (${paddock.code}) del sistema?`)) {
                onDeletePaddock(paddock.id);
                onClose();
              }
            }}
            className="bg-[#15241C] hover:bg-rose-950/60 text-rose-400 border border-rose-500/30 p-2.5 rounded-xl transition-colors"
            title="Eliminar Potrero"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Current Animal Grazing & Lot Assignment Section */}
        <div className="bg-[#15241C] rounded-2xl border border-white/10 shadow-xs p-4 space-y-3">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🐄</span> Ocupación de Ganado
            </span>
            {paddock.status === 'ocupado' && (
              <span className="text-[10px] font-bold font-mono bg-rose-950/70 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                Día {paddock.daysInOccupancy} de {paddock.occupancyDaysTarget}
              </span>
            )}
          </h4>

          {paddock.assignedLotName ? (
            <div className="bg-[#1A2C22] p-3 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{paddock.assignedLotName}</span>
                <span className="font-mono text-xs font-bold text-[#D4A94E] bg-[#0D1A13] border border-[#D4A94E]/30 px-2 py-0.5 rounded">
                  {paddock.currentHeads || 45} Cabezas
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#A5B8AC]">
                <span>Entrada: {paddock.entryDate || 'Reciente'}</span>
                <span>Salida estimada: {paddock.targetExitDate || 'Pronto'}</span>
              </div>
              <button
                onClick={() => onAssignLot(paddock.id, undefined)}
                className="w-full text-xs font-bold text-rose-400 hover:bg-rose-950/60 py-1.5 rounded-lg transition-colors border border-dashed border-rose-500/40"
              >
                Liberar Potrero (Mover a Descanso)
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#A5B8AC]">
                Este potrero está en descanso ({paddock.daysInRest} días acumulados de reposo).
              </p>
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onAssignLot(paddock.id, e.target.value);
                    }
                  }}
                  defaultValue=""
                  className="flex-1 bg-[#1A2C22] border border-white/15 text-xs font-bold text-white rounded-xl px-3 py-2"
                >
                  <option value="" disabled className="bg-[#0D1A13] text-[#A5B8AC]">
                    Asignar lote de ganado...
                  </option>
                  {lots.map((l) => (
                    <option key={l.id} value={l.id} className="bg-[#0D1A13] text-white">
                      {l.name} ({l.heads} cabezas - {l.categoryLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Forage & Species Card */}
        <div className="bg-[#15241C] rounded-2xl border border-white/10 shadow-xs p-4 space-y-3">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-base">🌾</span> Botánica & Pastura
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">Especie</span>
              <span className="font-bold text-white">{paddock.pastureType}</span>
            </div>
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">Estado</span>
              <span className="font-bold text-emerald-400 uppercase">{paddock.pastureCondition}</span>
            </div>
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">Materia Seca</span>
              <span className="font-mono font-bold text-white">{paddock.dryMatterPct}% MS</span>
            </div>
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">
                Altura Remanente
              </span>
              <span className="font-mono font-bold text-white">{paddock.residualHeightCm} cm</span>
            </div>
          </div>
        </div>

        {/* Topography & Elevation Card */}
        <div className="bg-[#15241C] rounded-2xl border border-white/10 shadow-xs p-4 space-y-3">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-amber-400" />
            Topografía & Curvas de Nivel
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">Relieve</span>
              <span className="font-bold text-white capitalize">{paddock.topography}</span>
            </div>
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">Pendiente</span>
              <span className="font-mono font-bold text-white">{paddock.avgSlopePct}%</span>
            </div>
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">Cota MSNM</span>
              <span className="font-mono font-bold text-white">{paddock.elevationMsnm} m</span>
            </div>
          </div>
        </div>

        {/* Flood Risk & Drainage Card */}
        <div className="bg-[#15241C] rounded-2xl border border-white/10 shadow-xs p-4 space-y-2">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-sky-400" />
            Hidrografía & Inundabilidad
          </h4>
          <div className="flex items-center justify-between text-xs p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
            <div>
              <p className="font-bold text-white">
                Riesgo Inundación: <span className="uppercase text-sky-300">{paddock.floodRisk}</span>
              </p>
              <p className="text-[11px] text-[#A5B8AC]">
                {paddock.isFloodProne
                  ? '⚠️ Zona baja con drenaje artificial requerido en temporada de lluvias.'
                  : '✅ Terreno alto no inundable.'}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                paddock.isFloodProne ? 'bg-sky-950/70 text-sky-300 border border-sky-500/30' : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {paddock.isFloodProne ? 'Bajo Húmedo' : 'Zona Firme'}
            </span>
          </div>
        </div>

        {/* Soil Survey & Agronomy Card */}
        <div className="bg-[#15241C] rounded-2xl border border-white/10 shadow-xs p-4 space-y-3">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            Estudio de Suelo & Fertilidad
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-[#A5B8AC]">Textura / Tipo:</span>
              <span className="font-bold text-white">{paddock.soilAnalysis.soilType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-[#A5B8AC]">pH del Suelo:</span>
              <span className="font-mono font-bold text-white">
                {paddock.soilAnalysis.ph}{' '}
                {paddock.soilAnalysis.ph < 5.5
                  ? '(Ácido)'
                  : paddock.soilAnalysis.ph > 6.5
                  ? '(Neutro)'
                  : '(Óptimo)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-[#A5B8AC]">Materia Orgánica (MO):</span>
              <span className="font-mono font-bold text-white">
                {paddock.soilAnalysis.organicMatterPct}%
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-[#A5B8AC]">Fósforo Disponible (P):</span>
              <span className="font-mono font-bold text-white">
                {paddock.soilAnalysis.phosphorusPpm} ppm
              </span>
            </div>
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">
                Recomendación Agronómica
              </span>
              <p className="text-[11px] text-white leading-relaxed">
                {paddock.soilAnalysis.fertilizerRecommendation}
              </p>
              {paddock.soilAnalysis.limingRecommendationTonHa > 0 && (
                <p className="text-[11px] font-bold text-[#D4A94E]">
                  🌾 Encalado recomendado: {paddock.soilAnalysis.limingRecommendationTonHa} Ton/Ha Cal
                  dolomítica.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Water Network & Drinking Trough Card */}
        <div className="bg-[#15241C] rounded-2xl border border-white/10 shadow-xs p-4 space-y-3">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-sky-400" />
            Red de Acueducto & Bebedero
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">Fuente</span>
              <span className="font-bold text-white capitalize">
                {paddock.waterSource.replace('_', ' ')}
              </span>
            </div>
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">
                Capacidad Bebedero
              </span>
              <span className="font-mono font-bold text-white">
                {paddock.troughCapacityLiters} Litros
              </span>
            </div>
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">
                Caudal Válvula
              </span>
              <span className="font-mono font-bold text-white">{paddock.flowRateLpm} L/min</span>
            </div>
            <div className="p-2.5 bg-[#1A2C22] rounded-xl border border-white/10">
              <span className="text-[10px] text-[#A5B8AC] uppercase font-bold block">
                Distancia al Agua
              </span>
              <span className="font-mono font-bold text-white">
                {paddock.waterTroughDistanceM} m (Óptimo &lt;200m)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
