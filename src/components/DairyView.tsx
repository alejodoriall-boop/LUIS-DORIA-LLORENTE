import React, { useState } from 'react';
import { DairyRecord, UpcomingCowEvent } from '../types';
import { LACTATION_CURVE_POINTS } from '../data/mockData';
import { MilkGlassIcon } from './icons/MilkGlassIcon';
import {
  Droplets,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  FlaskConical,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  Milk,
  Baby,
  Users,
  Award,
  Info,
  Radio,
  Cpu,
  Sliders,
  Zap,
  ShieldAlert,
} from 'lucide-react';

interface DairyViewProps {
  dairyData: DairyRecord;
  upcomingEvents: UpcomingCowEvent[];
  onOpenMilkingModal: () => void;
  onCompleteEvent: (eventId: string) => void;
}

export const DairyView: React.FC<DairyViewProps> = ({
  dairyData,
  upcomingEvents,
  onOpenMilkingModal,
  onCompleteEvent,
}) => {
  const [selectedCurveView, setSelectedCurveView] = useState<'promedio' | 'multiparas'>(
    'promedio',
  );

  const rfidConfig = dairyData.rfidConfig;
  const cowMilkingList = dairyData.cowMilkingList || [];
  const activeMilkingCowsCount = dairyData.activeMilkingCows || dairyData.activeCowsCount || 280;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#012d1d] tracking-tight flex items-center gap-2.5">
            <MilkGlassIcon className="w-8 h-8 text-[#ffba38]" />
            <span>Módulo de Lechería Especializada</span>
          </h2>
          <p className="text-xs md:text-sm text-[#414844] mt-0.5">
            Control operativo, orígenes de ordeño (Manual + Chapetas RFID FDX-B / HDX) y reproducción láctea.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMilkingModal}
            className="h-10 px-4 bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 duration-100 uppercase tracking-wider cursor-pointer"
          >
            <Radio className="w-4 h-4 text-[#012d1d]" />
            <span>Sincronizar Ordeño Automático</span>
          </button>
        </div>
      </div>

      {/* RFID Technology & Manual Configuration Status Banner */}
      <div className="bg-gradient-to-r from-[#012d1d] via-[#02402a] to-[#15803d] text-white p-4.5 md:p-5 rounded-2xl shadow-md border border-[#012d1d] relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Radio className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#ffba38] text-[#523700] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                Sistema Dual: Manual + Chapeta RFID
              </span>
              <span className="bg-white/20 text-[#c1ecd4] font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                Estándar Activo: {rfidConfig?.standard || 'FDX-B'} (ISO 11784 / 11785)
              </span>
            </div>

            <h3 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
              <span>Automatización de Ordeño</span>
            </h3>

            <p className="text-xs text-[#c1ecd4]/90 max-w-2xl leading-relaxed">
              Detección automática de la vaca al ingresar al puesto de ordeño mediante microchips <b>FDX-B (Full Duplex)</b> o <b>HDX (Half Duplex)</b> a 134.2 kHz. Muestra alerta por retiro de antibiótico y captura litros de leche desde el flujómetro.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={onOpenMilkingModal}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#ffba38]" />
              <span>Configurar Chapetas & Antena</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase text-[#c1ecd4] block font-bold">Lector Conectado</span>
            <span className="font-mono font-bold text-white text-xs">{rfidConfig?.readerBrand || 'Tru-Test SRS2'}</span>
          </div>

          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase text-[#c1ecd4] block font-bold">Protocolo Conexión</span>
            <span className="font-mono font-bold text-[#ffba38] text-xs uppercase">{rfidConfig?.connectionType || 'Bluetooth'} LE</span>
          </div>

          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase text-[#c1ecd4] block font-bold">Auto-Flujómetro</span>
            <span className="font-mono font-bold text-emerald-300 text-xs">
              {rfidConfig?.autoCaptureMilk ? 'Habilitado' : 'Manual'}
            </span>
          </div>

          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase text-[#c1ecd4] block font-bold">Control Medicamentos</span>
            <span className="font-mono font-bold text-red-300 text-xs">
              {rfidConfig?.withholdingAlert ? 'Alarma Activa' : 'Desactivado'}
            </span>
          </div>
        </div>
      </div>

      {/* Plantel Lechero Integral Breakdown */}
      <div className="bg-[#f0f7f4] border-2 border-[#c1ecd4] p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#c1ecd4] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#012d1d] text-[#c1ecd4] rounded-xl">
              <Milk className="w-5 h-5 text-[#ffba38]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#012d1d]">
                Plantel Lechero Integral
              </h3>
              <p className="text-[11px] text-[#414844]">
                Inventario consolidado del rebaño de producción láctea (vacas en ordeño, secas, toros, terneras y levantes).
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-[#012d1d] text-[#c1ecd4] px-2.5 py-1 rounded-xl self-start sm:self-auto">
            {activeMilkingCowsCount + 38 + 4 + 28 + 32} Cabezas Totales
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {/* Vacas Ordeño */}
          <div className="bg-white p-3 rounded-xl border border-[#c1ecd4] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#012d1d] block">
              Vacas en Ordeño
            </span>
            <span className="text-xl font-mono font-black text-[#012d1d] mt-1 block">
              {activeMilkingCowsCount}
            </span>
            <span className="text-[9.5px] text-[#2d6a4f] font-semibold">Producción activa</span>
          </div>

          {/* Vacas Secas / Horras */}
          <div className="bg-white p-3 rounded-xl border border-[#c1c8c2] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#79564b] block">
              Vacas Secas / Horras
            </span>
            <span className="text-xl font-mono font-black text-[#79564b] mt-1 block">
              38
            </span>
            <span className="text-[9.5px] text-[#717973] font-semibold">Gestación / Periodo seco</span>
          </div>

          {/* Toros Lecheros */}
          <div className="bg-white p-3 rounded-xl border border-[#c1c8c2] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#523700] block">
              Toros Lecheros
            </span>
            <span className="text-xl font-mono font-black text-[#523700] mt-1 block">
              4
            </span>
            <span className="text-[9.5px] text-[#8c6500] font-semibold">Reproductores probados</span>
          </div>

          {/* Terneras & Crías */}
          <div className="bg-white p-3 rounded-xl border border-[#c1c8c2] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077b6] block">
              Terneras & Crías
            </span>
            <span className="text-xl font-mono font-black text-[#0077b6] mt-1 block">
              28
            </span>
            <span className="text-[9.5px] text-[#0077b6] font-semibold">Lactancia & Cuna</span>
          </div>

          {/* Levantes Lecheros */}
          <div className="bg-white p-3 rounded-xl border border-[#c1c8c2] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a148c] block">
              Levante & Reemplazos
            </span>
            <span className="text-xl font-mono font-black text-[#4a148c] mt-1 block">
              32
            </span>
            <span className="text-[9.5px] text-[#6a1b9a] font-semibold">Vaquillas de reemplazo</span>
          </div>
        </div>
      </div>

      {/* Individual Cow RFID Milking Summary Table */}
      {cowMilkingList.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#c1c8c2] p-4 md:p-5 tactical-shadow space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#eeeeee]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#012d1d] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#2d6a4f]" />
                <span>Rendimiento Individual por Chapeta Electrónica (RFID EID)</span>
              </h3>
              <p className="text-[11px] text-[#717973]">
                Registro detallado por vaca con identificación ISO 11784 (FDX-B / HDX), volumen y estado sanitario.
              </p>
            </div>

            <button
              onClick={onOpenMilkingModal}
              className="text-[#012d1d] hover:text-[#15803d] font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Abrir Consola de Ordeño</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f0f4f1] text-[#012d1d] font-bold text-[10.5px] uppercase border-b border-[#c1c8c2]">
                  <th className="p-2.5">Vaca / Arete</th>
                  <th className="p-2.5">Chapeta RFID (EID ISO)</th>
                  <th className="p-2.5">Estándar</th>
                  <th className="p-2.5 text-center">DEL</th>
                  <th className="p-2.5 text-right">Mañana (L)</th>
                  <th className="p-2.5 text-right">Tarde (L)</th>
                  <th className="p-2.5 text-right">Total (L)</th>
                  <th className="p-2.5 text-center">Estado Sanitario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee] font-mono">
                {cowMilkingList.map((cow) => (
                  <tr key={cow.id} className="hover:bg-[#f9fbf9] transition-colors">
                    <td className="p-2.5 font-sans">
                      <span className="font-extrabold text-[#012d1d]">{cow.cowTag}</span>
                      <span className="block text-[10px] text-[#717973]">{cow.cowName} ({cow.breed || 'Lechera'})</span>
                    </td>

                    <td className="p-2.5 font-mono text-[#2d6a4f] font-bold text-[11px]">
                      {cow.eidChip}
                    </td>

                    <td className="p-2.5 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cow.chipStandard === 'FDX-B'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {cow.chipStandard}
                      </span>
                    </td>

                    <td className="p-2.5 text-center font-sans text-[#414844]">
                      {cow.lactationDays} d
                    </td>

                    <td className="p-2.5 text-right font-bold text-[#012d1d]">
                      {cow.recordedMorningLiters || cow.targetMorningLiters} L
                    </td>

                    <td className="p-2.5 text-right text-[#414844]">
                      {cow.recordedEveningLiters || cow.targetEveningLiters} L
                    </td>

                    <td className="p-2.5 text-right font-bold text-[#15803d]">
                      {(
                        (cow.recordedMorningLiters || cow.targetMorningLiters) +
                        (cow.recordedEveningLiters || cow.targetEveningLiters)
                      ).toFixed(1)} L
                    </td>

                    <td className="p-2.5 text-center font-sans">
                      {cow.hasMedicineAlert ? (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1" title={cow.medicineNotes}>
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          Retención Fármaco
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Leche Conforme
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Card 1: Control de Ordeño Diario (Spans 6 cols) */}
        <div className="md:col-span-6 bg-white rounded-2xl border border-[#c1c8c2] p-4 md:p-5 tactical-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#79564b]">
                CONTROL DE ORDEÑO DIARIO
              </h3>
              <Droplets className="w-5 h-5 text-[#717973]" />
            </div>

            {/* Morning & Evening Shifts Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Turno Mañana */}
              <div className="bg-[#eeeeee] p-3 rounded-xl border-b-2 border-[#c1c8c2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#414844] block mb-1">
                  TURNO MAÑANA
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-bold font-mono text-[#012d1d]">
                    {dairyData.morningLiters.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-[#414844]">L</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +{dairyData.morningDeltaPct}% vs ayer
                </span>
              </div>

              {/* Turno Tarde */}
              <div className="bg-[#eeeeee] p-3 rounded-xl border-b-2 border-[#c1c8c2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#414844] block mb-1">
                  TURNO TARDE
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-bold font-mono text-[#012d1d]">
                    {dairyData.eveningLiters.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-[#414844]">L</span>
                </div>
                <span className="text-[10px] font-bold text-[#ba1a1a] flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3.5 h-3.5" /> {dairyData.eveningDeltaPct}% vs ayer
                </span>
              </div>
            </div>
          </div>

          {/* Visual Lactation Curve Area */}
          <div className="h-36 w-full relative bg-[#f3f3f3] rounded-xl overflow-hidden border border-[#c1c8c2] p-2 flex flex-col justify-between">
            <div className="flex items-center justify-between z-10">
              <div className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-[#012d1d] uppercase tracking-wider">
                CURVA DE LACTANCIA (PROMEDIO)
              </div>
              <div className="flex gap-1 bg-white/80 p-0.5 rounded-lg text-[9px]">
                <button
                  onClick={() => setSelectedCurveView('promedio')}
                  className={`px-1.5 py-0.5 rounded ${
                    selectedCurveView === 'promedio' ? 'bg-[#012d1d] text-white font-bold' : ''
                  }`}
                >
                  Promedio
                </button>
                <button
                  onClick={() => setSelectedCurveView('multiparas')}
                  className={`px-1.5 py-0.5 rounded ${
                    selectedCurveView === 'multiparas' ? 'bg-[#012d1d] text-white font-bold' : ''
                  }`}
                >
                  Multíparas
                </button>
              </div>
            </div>

            {/* SVG Visual Lactation Curve */}
            <div className="relative w-full h-24">
              <svg
                className="w-full h-full"
                viewBox="0 0 300 80"
                preserveAspectRatio="none"
              >
                {/* Area Gradient Fill */}
                <defs>
                  <linearGradient id="lactationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a5d0b9" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d="M 0 70 Q 60 10 120 25 T 300 75 L 300 80 L 0 80 Z"
                  fill="url(#lactationGrad)"
                />
                <path
                  d="M 0 70 Q 60 10 120 25 T 300 75"
                  fill="none"
                  stroke="#012d1d"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Peak point indicator */}
                <circle cx="75" cy="18" r="4" fill="#ffba38" stroke="#012d1d" strokeWidth="2" />
              </svg>

              <div className="absolute top-1 left-24 text-[9px] font-mono text-[#012d1d] font-bold bg-white/80 px-1 rounded shadow-xs">
                Pico: 38.5 L (Día 60)
              </div>
            </div>

            <div className="flex justify-between text-[9px] font-mono text-[#717973] px-1 border-t border-[#e2e2e2] pt-0.5">
              <span>0 DIM</span>
              <span>60 DIM (Pico)</span>
              <span>150 DIM</span>
              <span>305 DIM (Secado)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Indicadores Reproductivos (Spans 6 cols) */}
        <div className="md:col-span-6 bg-white rounded-2xl border border-[#c1c8c2] p-4 md:p-5 tactical-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#79564b]">
                INDICADORES REPRODUCTIVOS
              </h3>
              <Activity className="w-5 h-5 text-[#717973]" />
            </div>

            <div className="space-y-3.5">
              {/* Días Abiertos */}
              <div className="flex items-center justify-between p-3.5 border border-[#c1c8c2] rounded-xl bg-[#f9f9f9] border-l-4 border-l-[#ffba38]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#414844]">
                    DÍAS ABIERTOS (PROMEDIO)
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl md:text-2xl font-bold font-mono text-[#012d1d]">
                      115
                    </span>
                    <span className="text-xs text-[#414844]">días</span>
                  </div>
                </div>
                <div className="bg-[#ffba38]/30 text-[#523700] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                  OBJETIVO: &lt; 120
                </div>
              </div>

              {/* Intervalo Entre Partos (IEP) */}
              <div className="flex items-center justify-between p-3.5 border border-[#c1c8c2] rounded-xl bg-[#f9f9f9] border-l-4 border-l-[#1b4332]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#414844]">
                    INTERVALO ENTRE PARTOS (IEP)
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl md:text-2xl font-bold font-mono text-[#012d1d]">
                      13.2
                    </span>
                    <span className="text-xs text-[#414844]">meses</span>
                  </div>
                </div>
                <div className="bg-[#c1ecd4] text-[#002114] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                  ÓPTIMO
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#eeeeee]">
            <div className="text-center p-2 bg-[#f3f3f3] rounded-lg">
              <p className="text-[10px] text-[#717973] font-semibold">Tasa Concepción (1er Serv)</p>
              <p className="text-base font-bold font-mono text-[#012d1d]">62.4%</p>
            </div>
            <div className="text-center p-2 bg-[#f3f3f3] rounded-lg">
              <p className="text-[10px] text-[#717973] font-semibold">Preñez General del Hato</p>
              <p className="text-base font-bold font-mono text-[#012d1d]">88.1%</p>
            </div>
          </div>
        </div>

        {/* Card 3: Calidad de Leche (Spans 4 cols) */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-[#c1c8c2] p-4 md:p-5 tactical-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#79564b]">
                CALIDAD DE LECHE
              </h3>
              <FlaskConical className="w-5 h-5 text-[#717973]" />
            </div>

            <ul className="space-y-2 text-xs">
              {/* Grasa */}
              <li className="flex justify-between items-center py-2 border-b border-[#eeeeee]">
                <span className="font-medium text-[#1a1c1c]">Grasa Butírica</span>
                <span className="font-mono font-bold text-[#012d1d] text-sm">
                  {dairyData.fatPct}%
                </span>
              </li>

              {/* Proteína */}
              <li className="flex justify-between items-center py-2 border-b border-[#eeeeee]">
                <span className="font-medium text-[#1a1c1c]">Proteína Verdadera</span>
                <span className="font-mono font-bold text-[#012d1d] text-sm">
                  {dairyData.proteinPct}%
                </span>
              </li>

              {/* RCS */}
              <li className="flex justify-between items-center py-2">
                <div className="flex flex-col">
                  <span className="font-medium text-[#1a1c1c]">RCS</span>
                  <span className="text-[10px] text-[#717973]">Recuento Cel. Somáticas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#ba1a1a] text-sm">
                    {dairyData.somaticCellCountK}k
                  </span>
                  <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-3 p-2 bg-[#ffdad6] text-[#93000a] rounded-xl text-[10px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Monitorear cuartos Lote 2 por ligero incremento de células somáticas.</span>
          </div>
        </div>

        {/* Card 4: Próximas a Secado o Parto (Spans 8 cols) */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-[#c1c8c2] p-4 md:p-5 tactical-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#79564b]">
                PRÓXIMAS A SECADO O PARTO
              </h3>
              <button className="text-[#012d1d] text-xs font-bold hover:underline flex items-center gap-1">
                VER TODAS <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-[#c1c8c2]">
                    <th className="text-[10px] font-bold uppercase text-[#717973] pb-2 pl-2">
                      ID / Nombre
                    </th>
                    <th className="text-[10px] font-bold uppercase text-[#717973] pb-2">Evento</th>
                    <th className="text-[10px] font-bold uppercase text-[#717973] pb-2">
                      Fecha Estimada
                    </th>
                    <th className="text-[10px] font-bold uppercase text-[#717973] pb-2">Lote</th>
                    <th className="text-[10px] font-bold uppercase text-[#717973] pb-2 text-right pr-2">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="font-mono divide-y divide-[#eeeeee]">
                  {upcomingEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      className="hover:bg-[#f9f9f9] transition-colors"
                    >
                      <td className="py-2.5 pl-2 flex items-center gap-2 font-sans">
                        <div className="w-7 h-7 rounded-lg bg-[#fed0c1] text-[#79564b] flex items-center justify-center font-bold text-[10px] font-mono">
                          {evt.tagId}
                        </div>
                        <span className="font-semibold text-[#1a1c1c]">{evt.cowName}</span>
                      </td>

                      <td className="py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            evt.eventType === 'Secado'
                              ? 'bg-[#ffdeac] text-[#281900]'
                              : 'bg-[#c1ecd4] text-[#002114]'
                          }`}
                        >
                          {evt.eventType}
                        </span>
                      </td>

                      <td className="py-2.5 text-[#1a1c1c] font-sans">
                        {evt.estimatedDate}
                        <span className="block text-[10px] text-[#717973]">
                          En {evt.daysLeft} días
                        </span>
                      </td>

                      <td className="py-2.5 text-[#414844] font-sans">{evt.batch}</td>

                      <td className="py-2.5 text-right pr-2">
                        <button
                          onClick={() => onCompleteEvent(evt.id)}
                          className="bg-[#f3f3f3] hover:bg-[#c1ecd4] text-[#012d1d] px-2 py-1 rounded-lg text-[10px] font-sans font-bold transition-colors"
                          title="Completar evento"
                        >
                          Registrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
