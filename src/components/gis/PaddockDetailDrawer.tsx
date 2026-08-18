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
          bg: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]',
          label: 'OCUPADO CON GANADO',
          icon: Clock,
        };
      case 'listo':
        return {
          bg: 'bg-[#c1ecd4] text-[#002114] border-[#1b4332]',
          label: 'LISTO PARA PASTOREO',
          icon: CheckCircle2,
        };
      case 'descanso':
        return {
          bg: 'bg-[#ffdeac] text-[#523700] border-[#ffba38]',
          label: 'EN DESCANSO VEGETATIVO',
          icon: Calendar,
        };
      case 'inundado':
        return {
          bg: 'bg-[#bfe6ff] text-[#004e7a] border-[#0077b6]',
          label: 'ZONA INUNDADA / RESTRINGIDA',
          icon: Waves,
        };
      default:
        return {
          bg: 'bg-[#eeeeee] text-[#414844] border-[#c1c8c2]',
          label: 'EN RECUPERACIÓN',
          icon: Layers,
        };
    }
  };

  const statusBadge = getStatusBadge(paddock.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l-2 border-[#c1c8c2] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="bg-[#1b4332] text-white p-5 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono bg-[#012d1d] text-[#ffba38] px-2 py-0.5 rounded text-xs font-bold border border-[#2d6a4f]">
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
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#f9f9f9]">
        {/* Metric Highlights Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-[#c1c8c2] card-shadow text-center">
            <p className="text-[10px] uppercase font-bold text-[#717973]">Superficie</p>
            <p className="text-lg font-mono font-extrabold text-[#012d1d]">{paddock.areaHa} Ha</p>
            <p className="text-[10px] text-[#717973] font-mono">
              {paddock.areaM2.toLocaleString()} m²
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#c1c8c2] card-shadow text-center">
            <p className="text-[10px] uppercase font-bold text-[#717973]">Capacidad UGG</p>
            <p className="text-lg font-mono font-extrabold text-[#523700]">
              {paddock.carryingCapacityUGG}
            </p>
            <p className="text-[10px] text-emerald-700 font-bold font-mono">
              {paddock.carryingCapacityUGGPerHa} UGG/Ha
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#c1c8c2] card-shadow text-center">
            <p className="text-[10px] uppercase font-bold text-[#717973]">Aforo Forraje</p>
            <p className="text-lg font-mono font-extrabold text-[#012d1d]">
              {paddock.forageYieldKgM2}
            </p>
            <p className="text-[10px] text-[#717973] font-mono">kg/m² ({paddock.forageTotalTon} Ton)</p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAforoCalculator(paddock)}
            className="flex-1 bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-bold text-xs py-2.5 px-3 rounded-xl tactical-shadow transition-all flex items-center justify-center gap-1.5"
          >
            <Scale className="w-4 h-4" />
            Calcular Aforo & Capacidad
          </button>

          <button
            onClick={() => onOpenPaddockEditor(paddock)}
            className="bg-white hover:bg-[#f3f3f3] text-[#012d1d] border border-[#c1c8c2] p-2.5 rounded-xl transition-colors"
            title="Editar Ficha"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (safeConfirm(`¿Eliminar el potrero ${paddock.name} (${paddock.code}) del sistema?`)) {
                onDeletePaddock(paddock.id);
                onClose();
              }
            }}
            className="bg-white hover:bg-[#ffdad6] text-[#ba1a1a] border border-[#c1c8c2] p-2.5 rounded-xl transition-colors"
            title="Eliminar Potrero"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Current Animal Grazing & Lot Assignment Section */}
        <div className="bg-white rounded-2xl border border-[#c1c8c2] card-shadow p-4 space-y-3">
          <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🐄</span> Ocupación de Ganado
            </span>
            {paddock.status === 'ocupado' && (
              <span className="text-[10px] font-bold font-mono bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded">
                Día {paddock.daysInOccupancy} de {paddock.occupancyDaysTarget}
              </span>
            )}
          </h4>

          {paddock.assignedLotName ? (
            <div className="bg-[#f3f3f3] p-3 rounded-xl border border-[#c1c8c2] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#012d1d]">{paddock.assignedLotName}</span>
                <span className="font-mono text-xs font-bold text-[#523700] bg-[#ffdeac] px-2 py-0.5 rounded">
                  {paddock.currentHeads || 45} Cabezas
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#717973]">
                <span>Entrada: {paddock.entryDate || 'Reciente'}</span>
                <span>Salida estimada: {paddock.targetExitDate || 'Pronto'}</span>
              </div>
              <button
                onClick={() => onAssignLot(paddock.id, undefined)}
                className="w-full text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 py-1.5 rounded-lg transition-colors border border-dashed border-[#ba1a1a]"
              >
                Liberar Potrero (Mover a Descanso)
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#717973]">
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
                  className="flex-1 bg-[#f3f3f3] border border-[#c1c8c2] text-xs font-bold text-[#012d1d] rounded-xl px-3 py-2"
                >
                  <option value="" disabled>
                    Asignar lote de ganado...
                  </option>
                  {lots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.heads} cabezas - {l.categoryLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Forage & Species Card */}
        <div className="bg-white rounded-2xl border border-[#c1c8c2] card-shadow p-4 space-y-3">
          <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-base">🌾</span> Botánica & Pastura
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">Especie</span>
              <span className="font-bold text-[#012d1d]">{paddock.pastureType}</span>
            </div>
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">Estado</span>
              <span className="font-bold text-emerald-800 uppercase">{paddock.pastureCondition}</span>
            </div>
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">Materia Seca</span>
              <span className="font-mono font-bold text-[#012d1d]">{paddock.dryMatterPct}% MS</span>
            </div>
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">
                Altura Remanente
              </span>
              <span className="font-mono font-bold text-[#012d1d]">{paddock.residualHeightCm} cm</span>
            </div>
          </div>
        </div>

        {/* Topography & Elevation Card */}
        <div className="bg-white rounded-2xl border border-[#c1c8c2] card-shadow p-4 space-y-3">
          <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-amber-600" />
            Topografía & Curvas de Nivel
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">Relieve</span>
              <span className="font-bold text-[#012d1d] capitalize">{paddock.topography}</span>
            </div>
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">Pendiente</span>
              <span className="font-mono font-bold text-[#012d1d]">{paddock.avgSlopePct}%</span>
            </div>
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">Cota MSNM</span>
              <span className="font-mono font-bold text-[#012d1d]">{paddock.elevationMsnm} m</span>
            </div>
          </div>
        </div>

        {/* Flood Risk & Drainage Card */}
        <div className="bg-white rounded-2xl border border-[#c1c8c2] card-shadow p-4 space-y-2">
          <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-cyan-600" />
            Hidrografía & Inundabilidad
          </h4>
          <div className="flex items-center justify-between text-xs p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
            <div>
              <p className="font-bold text-[#012d1d]">
                Riesgo Inundación: <span className="uppercase text-[#0077b6]">{paddock.floodRisk}</span>
              </p>
              <p className="text-[11px] text-[#717973]">
                {paddock.isFloodProne
                  ? '⚠️ Zona baja con drenaje artificial requerido en temporada de lluvias.'
                  : '✅ Terreno alto no inundable.'}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                paddock.isFloodProne ? 'bg-[#bfe6ff] text-[#004e7a]' : 'bg-[#c1ecd4] text-[#002114]'
              }`}
            >
              {paddock.isFloodProne ? 'Bajo Húmedo' : 'Zona Firme'}
            </span>
          </div>
        </div>

        {/* Soil Survey & Agronomy Card */}
        <div className="bg-white rounded-2xl border border-[#c1c8c2] card-shadow p-4 space-y-3">
          <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-emerald-600" />
            Estudio de Suelo & Fertilidad
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#eeeeee]">
              <span className="text-[#717973]">Textura / Tipo:</span>
              <span className="font-bold text-[#1a1c1c]">{paddock.soilAnalysis.soilType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#eeeeee]">
              <span className="text-[#717973]">pH del Suelo:</span>
              <span className="font-mono font-bold text-[#012d1d]">
                {paddock.soilAnalysis.ph}{' '}
                {paddock.soilAnalysis.ph < 5.5
                  ? '(Ácido)'
                  : paddock.soilAnalysis.ph > 6.5
                  ? '(Neutro)'
                  : '(Óptimo)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#eeeeee]">
              <span className="text-[#717973]">Materia Orgánica (MO):</span>
              <span className="font-mono font-bold text-[#1a1c1c]">
                {paddock.soilAnalysis.organicMatterPct}%
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#eeeeee]">
              <span className="text-[#717973]">Fósforo Disponible (P):</span>
              <span className="font-mono font-bold text-[#1a1c1c]">
                {paddock.soilAnalysis.phosphorusPpm} ppm
              </span>
            </div>
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2] space-y-1">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">
                Recomendación Agronómica
              </span>
              <p className="text-[11px] text-[#012d1d] leading-relaxed">
                {paddock.soilAnalysis.fertilizerRecommendation}
              </p>
              {paddock.soilAnalysis.limingRecommendationTonHa > 0 && (
                <p className="text-[11px] font-bold text-[#523700]">
                  🌾 Encalado recomendado: {paddock.soilAnalysis.limingRecommendationTonHa} Ton/Ha Cal
                  dolomítica.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Water Network & Drinking Trough Card */}
        <div className="bg-white rounded-2xl border border-[#c1c8c2] card-shadow p-4 space-y-3">
          <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-blue-600" />
            Red de Acueducto & Bebedero
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">Fuente</span>
              <span className="font-bold text-[#012d1d] capitalize">
                {paddock.waterSource.replace('_', ' ')}
              </span>
            </div>
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">
                Capacidad Bebedero
              </span>
              <span className="font-mono font-bold text-[#012d1d]">
                {paddock.troughCapacityLiters} Litros
              </span>
            </div>
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">
                Caudal Válvula
              </span>
              <span className="font-mono font-bold text-[#012d1d]">{paddock.flowRateLpm} L/min</span>
            </div>
            <div className="p-2.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#717973] uppercase font-bold block">
                Distancia al Agua
              </span>
              <span className="font-mono font-bold text-[#012d1d]">
                {paddock.waterTroughDistanceM} m (Óptimo &lt;200m)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
