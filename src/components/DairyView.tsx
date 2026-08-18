import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';
import { DairyRecord, UpcomingCowEvent } from '../types';
import { LACTATION_CURVE_POINTS } from '../data/mockData';
import { MilkGlassIcon } from './icons/MilkGlassIcon';
import { CategoryAnimalsModal, DairyCategoryKey } from './modals/CategoryAnimalsModal';
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
  Eye,
  Heart,
  Clock,
  Scale,
  Dna,
  Sparkles,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

interface DairyViewProps {
  dairyData: DairyRecord;
  upcomingEvents: UpcomingCowEvent[];
  onOpenMilkingModal: () => void;
  onCompleteEvent: (eventId: string) => void;
  onOpenMastitisModal?: () => void;
  activeMastitisCount?: number;
  isDairyEnabled?: boolean;
  onToggleDairyModule?: () => void;
}

export const DairyView: React.FC<DairyViewProps> = ({
  dairyData,
  upcomingEvents,
  onOpenMilkingModal,
  onCompleteEvent,
  onOpenMastitisModal,
  activeMastitisCount = 0,
  isDairyEnabled = true,
  onToggleDairyModule,
}) => {
  const [selectedCurveView, setSelectedCurveView] = useState<'promedio' | 'multiparas'>(
    'promedio',
  );
  const [dairyStandardsSubTab, setDairyStandardsSubTab] = useState<'reproductivo' | 'curva' | 'calidad' | 'calculadora'>('reproductivo');
  const [simPeakLiters, setSimPeakLiters] = useState<number>(34);
  const [selectedBreedStandard, setSelectedBreedStandard] = useState<'Holstein' | 'Jersey' | 'F1_Gyrolando'>('Holstein');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedModalCategory, setSelectedModalCategory] = useState<DairyCategoryKey>('todos');

  const openCategoryAnimals = (category: DairyCategoryKey = 'todos') => {
    setSelectedModalCategory(category);
    setIsCategoryModalOpen(true);
  };

  const rfidConfig = dairyData.rfidConfig;
  const cowMilkingList = dairyData.cowMilkingList || [];
  const activeMilkingCowsCount = dairyData.activeMilkingCows || dairyData.activeCowsCount || 280;

  return (
    <>
    <div className="space-y-6 w-full pb-12">
      {!isDairyEnabled && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base uppercase font-mono tracking-tight">⚠️ MÓDULO DE LECHERÍA DESACTIVADO EN SISTEMA</h3>
              <p className="text-xs font-medium text-amber-800 mt-0.5">
                Has desactivado el uso del Módulo de Lechería. Todos los registros de ordeño, pesajes de leche por vaca, tanques de almacenamiento y controles sanitarios lácteos están inhabilitados.
              </p>
            </div>
          </div>
          {onToggleDairyModule && (
            <button
              onClick={onToggleDairyModule}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-mono font-bold text-xs rounded-xl shadow-md shrink-0 cursor-pointer transition-all active:scale-95 flex items-center gap-2"
            >
              <MilkGlassIcon className="w-4 h-4 text-blue-300" />
              <span>Activar Módulo de Lechería</span>
            </button>
          )}
        </div>
      )}

      <div className={`space-y-6 transition-all ${!isDairyEnabled ? 'opacity-50 pointer-events-none select-none filter blur-[0.3px]' : ''}`}>
        {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#012d1d] tracking-tight flex items-center gap-2.5">
            <MilkGlassIcon className="w-8 h-8 text-[#ffba38]" />
            <span>Módulo de Lechería Especializada</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenMastitisModal && (
            <button
              onClick={onOpenMastitisModal}
              className="h-8 px-3 bg-red-700 hover:bg-red-800 text-white font-bold text-[11px] rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-100 uppercase tracking-wider cursor-pointer border border-red-800"
              title="Registro y Gestión de Pruebas Positivas de Mastitis (CMT)"
            >
              <FlaskConical className="w-3.5 h-3.5 text-red-200" />
              <span>Mastitis Positivas</span>
              {activeMastitisCount > 0 && (
                <span className="bg-white text-red-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full font-mono leading-none">
                  {activeMastitisCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenMilkingModal}
            className="h-8 px-3 bg-[#ffba38] hover:bg-[#fcd34d] text-[#523700] font-bold text-[11px] rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-100 uppercase tracking-wider cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-[#523700]" />
            <span>Sincronizar Ordeño Automático</span>
          </button>
        </div>
      </div>

      {/* RFID Technology & Manual Configuration Status Banner - Light & Clear Theme */}
      <div className="bg-white border border-slate-200/90 text-slate-800 p-4 md:p-5 rounded-2xl shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600 fill-current" />
                Sistema Dual: Manual + Chapeta RFID
              </span>
              <span className="bg-emerald-50 text-emerald-800 font-mono text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Estándar Activo: {rfidConfig?.standard || 'FDX-B'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Automatización de Ordeño</span>
              </h3>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={onOpenMilkingModal}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Configurar Chapetas & Antena</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Lector Conectado</span>
            <span className="font-mono font-bold text-slate-800 text-xs">{rfidConfig?.readerBrand || 'Tru-Test SRS2'}</span>
          </div>

          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Protocolo Conexión</span>
            <span className="font-mono font-bold text-amber-700 text-xs uppercase">{rfidConfig?.connectionType || 'Bluetooth'} LE</span>
          </div>

          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Auto-Flujómetro</span>
            <span className="font-mono font-bold text-emerald-700 text-xs">
              {rfidConfig?.autoCaptureMilk ? 'Habilitado' : 'Manual'}
            </span>
          </div>

          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Control Medicamentos</span>
            <span className="font-mono font-bold text-rose-700 text-xs">
              {rfidConfig?.withholdingAlert ? 'Alarma Activa' : 'Desactivado'}
            </span>
          </div>
        </div>
      </div>

      {/* Plantel Lechero Integral Breakdown - Clean Light Theme */}
      <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <Milk className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Plantel Lechero Integral</span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => openCategoryAnimals('todos')}
            className="text-[11px] font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl self-start sm:self-auto cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
            title="Ver los 382 animales del Plantel Lechero"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver Todos ({activeMilkingCowsCount + 38 + 4 + 28 + 32} Cabezas) →</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {/* Vacas Ordeño */}
          <div
            onClick={() => openCategoryAnimals('vacas_ordeno')}
            className="bg-slate-50 hover:bg-emerald-50/50 p-3 rounded-xl border border-slate-200/80 hover:border-emerald-500 shadow-2xs cursor-pointer transition-all active:scale-98 group flex flex-col justify-between"
            title="Haz clic para ver las vacas en ordeño"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Vacas en Ordeño
                </span>
                <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <span className="text-xl font-mono font-bold text-slate-900 mt-1 block">
                {activeMilkingCowsCount}
              </span>
              <span className="text-[9.5px] text-emerald-700 font-medium">Producción activa</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded-md mt-2 block text-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              Ver Animales ({activeMilkingCowsCount}) →
            </span>
          </div>

          {/* Vacas Secas / Horras */}
          <div
            onClick={() => openCategoryAnimals('vacas_secas')}
            className="bg-slate-50 hover:bg-amber-50/50 p-3 rounded-xl border border-slate-200/80 hover:border-amber-500 shadow-2xs cursor-pointer transition-all active:scale-98 group flex flex-col justify-between"
            title="Haz clic para ver las 38 vacas secas"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Vacas Secas / Horras
                </span>
                <Eye className="w-3.5 h-3.5 text-amber-700 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <span className="text-xl font-mono font-bold text-slate-900 mt-1 block">
                38
              </span>
              <span className="text-[9.5px] text-slate-500 font-medium">Gestación / Periodo seco</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-md mt-2 block text-center group-hover:bg-amber-700 group-hover:text-white transition-colors">
              Ver Animales (38) →
            </span>
          </div>

          {/* Toros Lecheros */}
          <div
            onClick={() => openCategoryAnimals('toros_lecheros')}
            className="bg-slate-50 hover:bg-amber-50/50 p-3 rounded-xl border border-slate-200/80 hover:border-amber-500 shadow-2xs cursor-pointer transition-all active:scale-98 group flex flex-col justify-between"
            title="Haz clic para ver los 4 toros lecheros"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Toros Lecheros
                </span>
                <Eye className="w-3.5 h-3.5 text-amber-800 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <span className="text-xl font-mono font-bold text-slate-900 mt-1 block">
                4
              </span>
              <span className="text-[9.5px] text-amber-800 font-medium">Reproductores probados</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded-md mt-2 block text-center group-hover:bg-amber-700 group-hover:text-white transition-colors">
              Ver Toros (4) →
            </span>
          </div>

          {/* Terneras & Crías */}
          <div
            onClick={() => openCategoryAnimals('terneras_crias')}
            className="bg-slate-50 hover:bg-sky-50/50 p-3 rounded-xl border border-slate-200/80 hover:border-sky-500 shadow-2xs cursor-pointer transition-all active:scale-98 group flex flex-col justify-between"
            title="Haz clic para ver las 28 terneras y crías"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Terneras & Crías
                </span>
                <Eye className="w-3.5 h-3.5 text-sky-600 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <span className="text-xl font-mono font-bold text-slate-900 mt-1 block">
                28
              </span>
              <span className="text-[9.5px] text-sky-700 font-medium">Lactancia & Cuna</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-sky-800 bg-sky-100/70 px-1.5 py-0.5 rounded-md mt-2 block text-center group-hover:bg-sky-700 group-hover:text-white transition-colors">
              Ver Crías (28) →
            </span>
          </div>

          {/* Levantes Lecheros */}
          <div
            onClick={() => openCategoryAnimals('levante_reemplazos')}
            className="bg-slate-50 hover:bg-purple-50/50 p-3 rounded-xl border border-slate-200/80 hover:border-purple-500 shadow-2xs cursor-pointer transition-all active:scale-98 group flex flex-col justify-between"
            title="Haz clic para ver las 32 vaquillas de levante"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Levante & Reemplazos
                </span>
                <Eye className="w-3.5 h-3.5 text-purple-600 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
              <span className="text-xl font-mono font-bold text-slate-900 mt-1 block">
                32
              </span>
              <span className="text-[9.5px] text-purple-700 font-medium">Vaquillas de reemplazo</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-purple-800 bg-purple-100/70 px-1.5 py-0.5 rounded-md mt-2 block text-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
              Ver Vaquillas (32) →
            </span>
          </div>
        </div>
      </div>

      {/* Individual Cow RFID Milking Summary Table - Clean Light Theme */}
      {cowMilkingList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-700" />
                <span>Rendimiento Individual por Chapeta Electrónica (RFID EID)</span>
              </h3>
            </div>

            <button
              onClick={onOpenMilkingModal}
              className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Abrir Consola de Ordeño</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold text-[10.5px] uppercase border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100 font-mono">
                {cowMilkingList.map((cow) => (
                  <tr key={cow.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-2.5 font-sans">
                      <span className="font-bold text-slate-900">{cow.cowTag}</span>
                      <span className="block text-[10px] text-slate-500">{cow.cowName} ({cow.breed || 'Lechera'})</span>
                    </td>

                    <td className="p-2.5 font-mono text-emerald-700 font-bold text-[11px]">
                      {cow.eidChip}
                    </td>

                    <td className="p-2.5 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        cow.chipStandard === 'FDX-B'
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {cow.chipStandard}
                      </span>
                    </td>

                    <td className="p-2.5 text-center font-sans text-slate-600">
                      {cow.lactationDays} d
                    </td>

                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {cow.recordedMorningLiters || cow.targetMorningLiters} L
                    </td>

                    <td className="p-2.5 text-right text-slate-600">
                      {cow.recordedEveningLiters || cow.targetEveningLiters} L
                    </td>

                    <td className="p-2.5 text-right font-bold text-emerald-700">
                      {(
                        (cow.recordedMorningLiters || cow.targetMorningLiters) +
                        (cow.recordedEveningLiters || cow.targetEveningLiters)
                      ).toFixed(1)} L
                    </td>

                    <td className="p-2.5 text-center font-sans">
                      {cow.hasMedicineAlert ? (
                        <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1" title={cow.medicineNotes}>
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          Retención Fármaco
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
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

      {/* ========================================================================= */}
      {/* SECCIÓN ESPECIALIZADA: MATRIZ Y PARÁMETROS ZOOTÉCNICOS DE LECHERÍA          */}
      {/* ========================================================================= */}
      <div className="bg-white text-slate-800 rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Milk className="w-3.5 h-3.5 text-emerald-700" /> Estándares Zootécnicos Lecheros
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Matriz Productiva, Reproductiva & Calidad Composicional</span>
            </h3>
          </div>

          {/* Navigation Subtabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDairyStandardsSubTab('reproductivo')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                dairyStandardsSubTab === 'reproductivo'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>1. Reproductivos</span>
            </button>

            <button
              type="button"
              onClick={() => setDairyStandardsSubTab('curva')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                dairyStandardsSubTab === 'curva'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>2. Curva & Razas</span>
            </button>

            <button
              type="button"
              onClick={() => setDairyStandardsSubTab('calidad')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                dairyStandardsSubTab === 'calidad'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>3. Calidad & Higiene</span>
            </button>

            <button
              type="button"
              onClick={() => setDairyStandardsSubTab('calculadora')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                dairyStandardsSubTab === 'calculadora'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>4. Calculadora del Pico</span>
            </button>
          </div>
        </div>

        {/* SUBTAB 1: PARÁMETROS REPRODUCTIVOS Y DE CICLO DE VIDA */}
        {dairyStandardsSubTab === 'reproductivo' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white font-mono">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-[10.5px] uppercase tracking-wider border-b border-slate-200 font-semibold">
                    <th className="p-3">Parámetro Reproductivo</th>
                    <th className="p-3 text-center bg-emerald-50/70 text-emerald-900">Meta Óptima (Especializado)</th>
                    <th className="p-3 text-center bg-amber-50/70 text-amber-900">Rango Comercial / Trópico</th>
                    <th className="p-3">Criterio Técnico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Edad al Primer Servicio
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">13 – 15 meses</td>
                    <td className="p-3 text-center text-amber-800 bg-amber-50/20 font-medium">16 – 20 meses</td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Cuando alcanza 55%-60% del peso adulto (330-360 kg Holstein; 240-270 kg Jersey).</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Baby className="w-3.5 h-3.5 text-pink-600" /> Edad al Primer Parto (EPP)
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">22 – 24 meses</td>
                    <td className="p-3 text-center text-amber-800 bg-amber-50/20 font-medium">25 – 30 meses</td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Reducir la EPP disminuye los costos de levante de novilla antes de iniciar vida productiva.</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" /> Intervalo Entre Partos (IEP)
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">365 – 400 días</td>
                    <td className="p-3 text-center text-amber-800 bg-amber-50/20 font-medium">410 – 460 días</td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Un IEP &gt; 420 días genera pérdidas económicas por días en anestro o fallas reproductivas.</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-600" /> Días Abiertos
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">85 – 115 días</td>
                    <td className="p-3 text-center text-amber-800 bg-amber-50/20 font-medium">130 – 180+ días</td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Días entre el parto y la nueva concepción. La meta es preñar la vaca antes del día 110.</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Periodo Seco
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">50 – 60 días</td>
                    <td className="p-3 text-center text-amber-800 bg-amber-50/20 font-medium">45 – 70 días</td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Tiempo de descanso mamario y regeneración celular previo al siguiente parto.</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Dna className="w-3.5 h-3.5 text-amber-600" /> Servicios por Concepción
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">1.5 – 1.8</td>
                    <td className="p-3 text-center text-amber-800 bg-amber-50/20 font-medium">2.0 – 2.8</td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Inseminaciones requeridas por gestación (balance nutricional y detección de celo).</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-rose-600" /> Tasa de Descarte Anual
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">20% – 25%</td>
                    <td className="p-3 text-center text-amber-800 bg-amber-50/20 font-medium">25% – 35%</td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Vacas reemplazadas por baja producción, mastitis recurrente o fertilidad.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 2: PARÁMETROS PRODUCTIVOS Y CURVA DE LACTANCIA */}
        {dairyStandardsSubTab === 'curva' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
              {/* Lactancia Estándar Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-bold uppercase flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-600" /> Duración Estándar
                  </span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-semibold">
                    Ordeño Continuo
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900">305 Días</div>
                <p className="text-[11px] text-slate-500 font-sans leading-snug">
                  Período de ordeño activo continuo antes del descanso mamario (Periodo seco 50-60 días).
                </p>
              </div>

              {/* Pico de Lactancia Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-bold uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" /> Pico de Lactancia
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                    Día 45 – 60
                  </span>
                </div>
                <div className="text-2xl font-bold text-amber-800">45 – 60 DIM</div>
                <p className="text-[11px] text-slate-500 font-sans leading-snug">
                  Volumen máximo alcanzado (+1 L en el pico = ~200 L adicionales en lactancia total).
                </p>
              </div>

              {/* Persistencia de Lactancia Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-bold uppercase flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-600" /> Persistencia Mensual
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                    Caída &lt; 8-10%
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-800">85% – 90% / mes</div>
                <p className="text-[11px] text-slate-500 font-sans leading-snug">
                  Caída paulatina sostenida tras el pico de lactancia sin descensos abruptos.
                </p>
              </div>
            </div>

            {/* INTERACTIVE LACTATION CHARTS (RECHARTS) - Light Theme */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    Curvas de Lactancia Comparativas (DEL vs. Litros/Día)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Pico: Días 45 - 60 DIM
                </span>
              </div>

              <div className="h-64 w-full bg-white p-3 rounded-xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { del: 'D10', primiparas: 16.5, secundiparas: 20.2, multiparas: 24.5, promedio: 21.0 },
                      { del: 'D30', primiparas: 21.0, secundiparas: 25.5, multiparas: 31.8, promedio: 26.8 },
                      { del: 'D45 (Pico)', primiparas: 22.5, secundiparas: 27.2, multiparas: 34.0, promedio: 28.5 },
                      { del: 'D60', primiparas: 22.0, secundiparas: 26.5, multiparas: 32.5, promedio: 27.5 },
                      { del: 'D90', primiparas: 20.8, secundiparas: 24.8, multiparas: 30.0, promedio: 25.6 },
                      { del: 'D120', primiparas: 19.5, secundiparas: 23.0, multiparas: 27.5, promedio: 23.8 },
                      { del: 'D150', primiparas: 18.2, secundiparas: 21.2, multiparas: 25.0, promedio: 21.8 },
                      { del: 'D180', primiparas: 17.0, secundiparas: 19.5, multiparas: 22.8, promedio: 20.0 },
                      { del: 'D210', primiparas: 16.0, secundiparas: 18.0, multiparas: 20.5, promedio: 18.4 },
                      { del: 'D240', primiparas: 15.0, secundiparas: 16.5, multiparas: 18.5, promedio: 16.8 },
                      { del: 'D270', primiparas: 14.0, secundiparas: 15.2, multiparas: 16.8, promedio: 15.4 },
                      { del: 'D305', primiparas: 13.2, secundiparas: 14.0, multiparas: 15.0, promedio: 14.1 },
                    ]}
                    margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="del" tick={{ fontSize: 10, fill: '#475569' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} domain={[10, 38]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', borderColor: '#cbd5e1', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: any, name: any) => [`${val} L/día`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#334155', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="primiparas" name="1ª Lactancia" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="secundiparas" name="2ª Lactancia" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="multiparas" name="3ª+ Lactancia" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="promedio" name="Promedio Hato" stroke="#059669" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRÁFICA 2: COMPARATIVA DE LACTANCIAS CONSECUTIVAS - Light Theme */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                    <Milk className="w-4 h-4 text-emerald-700" />
                    Producción Acumulada a 305 Días vs. Pico por Lactancia (#1 a #5)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                  Madurez Vital: 3ª y 4ª
                </span>
              </div>

              <div className="h-60 w-full bg-white p-3 rounded-xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[
                      { lactancia: '1ª Lact.', litros305: 5850, picoLiters: 22.5 },
                      { lactancia: '2ª Lact.', litros305: 6720, picoLiters: 27.2 },
                      { lactancia: '3ª Lact.', litros305: 7550, picoLiters: 34.0 },
                      { lactancia: '4ª Lact.', litros305: 7620, picoLiters: 33.8 },
                      { lactancia: '5ª+ Lact.', litros305: 7100, picoLiters: 31.0 },
                    ]}
                    margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="lactancia" tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#475569' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#dc2626' }} domain={[0, 45]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', borderColor: '#cbd5e1', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: any, name: any) => {
                        if (name === 'Litros Totales (305d)') return [`${Number(val).toLocaleString()} L`, name];
                        if (name === 'Pico L/día') return [`${val} L/día`, name];
                        return [val, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#334155', paddingTop: '6px' }} />
                    <Bar yAxisId="left" dataKey="litros305" name="Litros Totales (305d)" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={32} />
                    <Line yAxisId="right" type="monotone" dataKey="picoLiters" name="Pico L/día" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 5, fill: '#dc2626' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Producción por Lactancia según Raza - Light Cards */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 font-mono text-xs">
              <h4 className="font-bold text-slate-800 uppercase flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" /> Producción Estimada por Lactancia (305 días) Según Genética
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-sky-800 font-bold">
                    <span>Holstein Friesian</span>
                    <span className="text-[10px] bg-sky-100 px-1.5 py-0.5 rounded font-semibold">Especializada</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">7,500 – 10,000+ L</div>
                  <p className="text-[10px] text-slate-500 font-sans">Máximo volumen por vaca con balance de fibra efectiva.</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-amber-800 font-bold">
                    <span>Jersey PO</span>
                    <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded font-semibold">Sólidos & Quesero</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">5,500 – 7,000 L</div>
                  <p className="text-[10px] text-slate-500 font-sans">Alta conversión por kg de peso y elevado % de grasa y proteína.</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-emerald-800 font-bold">
                    <span>F1 / Doble Propósito</span>
                    <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded font-semibold">Gyrolando / Trópico</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">2,500 – 4,500 L</div>
                  <p className="text-[10px] text-slate-500 font-sans">Rusticidad y adaptación total al calor y trópico bajo.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: CALIDAD E HIGIENE DE LA LECHE */}
        {dairyStandardsSubTab === 'calidad' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white font-mono">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-[10.5px] uppercase tracking-wider border-b border-slate-200 font-semibold">
                    <th className="p-3">Parámetro de Calidad</th>
                    <th className="p-3 bg-sky-50 text-sky-900">Estándar Holstein</th>
                    <th className="p-3 bg-amber-50 text-amber-900">Estándar Jersey</th>
                    <th className="p-3">Significado Técnico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-amber-600" /> Grasa Butírica (%)
                    </td>
                    <td className="p-3 font-bold text-sky-800 bg-sky-50/30">3.5% – 3.8%</td>
                    <td className="p-3 font-bold text-amber-800 bg-amber-50/30">4.5% – 5.5%</td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Fuente principal de sólidos. Afectada por la fibra efectiva en dieta.</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-sky-600" /> Proteína Verdadera (%)
                    </td>
                    <td className="p-3 font-bold text-sky-800 bg-sky-50/30">3.1% – 3.3%</td>
                    <td className="p-3 font-bold text-amber-800 bg-amber-50/30">3.7% – 4.2%</td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Determina el rendimiento quesero y precio bonificado.</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-emerald-600" /> Sólidos Totales (%)
                    </td>
                    <td className="p-3 font-bold text-emerald-800 bg-emerald-50/30" colSpan={2}>
                      12.0% – 14.5% (Grasa, proteína, lactosa y minerales)
                    </td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Base para la liquidación tarifaria por litro.</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Células Somáticas (RCS)
                    </td>
                    <td className="p-3 font-bold text-emerald-800 bg-emerald-50/30 text-center" colSpan={2}>
                      &lt; 200,000 CS/ml (Salud de Ubre)
                    </td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Indicador directo de salud de la ubre y mastitis subclínica.</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Unidades Formadoras Colonia (UFC)
                    </td>
                    <td className="p-3 font-bold text-sky-800 bg-sky-50/30 text-center" colSpan={2}>
                      &lt; 50,000 UFC/ml (Higiene Ordeño)
                    </td>
                    <td className="p-3 text-slate-500 text-[11px] font-sans">Higiene en ordeño, lavado de pezoneras y cadena de frío (&lt; 4 °C).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 4: CALCULADORA INTERACTIVA DEL PICO Y PROYECCIÓN */}
        {dairyStandardsSubTab === 'calculadora' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 font-mono animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-700" />
                  Calculadora de Proyección por Pico (+1 L en Pico = ~200 L en 305d)
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Control 1: Peak Liters Slider */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-800 font-bold">1. Litros Alcanzados en el Pico (45-60 DIM):</label>
                  <span className="font-bold text-base text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {simPeakLiters} L / día
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="55"
                  step="1"
                  value={simPeakLiters}
                  onChange={(e) => setSimPeakLiters(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>15 L (Doble Prop.)</span>
                  <span>35 L (Promedio)</span>
                  <span>55 L (Elite)</span>
                </div>
              </div>

              {/* Control 2: Breed Selection */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="text-slate-800 font-bold block">2. Seleccionar Raza Base:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Holstein', 'Jersey', 'F1_Gyrolando'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBreedStandard(b)}
                      className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedBreedStandard === b
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {b === 'F1_Gyrolando' ? 'F1 Gyrolando' : b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculations Box */}
            {(() => {
              const projected305 = simPeakLiters * 200;
              const targetRange = selectedBreedStandard === 'Holstein' ? '7,500 – 10,000+ L' : selectedBreedStandard === 'Jersey' ? '5,500 – 7,000 L' : '2,500 – 4,500 L';
              const fatTarget = selectedBreedStandard === 'Holstein' ? '3.5% - 3.8%' : selectedBreedStandard === 'Jersey' ? '4.5% - 5.5%' : '4.1% - 4.4%';
              const protTarget = selectedBreedStandard === 'Holstein' ? '3.1% - 3.3%' : selectedBreedStandard === 'Jersey' ? '3.7% - 4.2%' : '3.4% - 3.6%';

              return (
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2.5 bg-sky-50/70 rounded-lg border border-sky-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Proyección 305 Días</span>
                    <span className="text-lg font-bold text-sky-900">{projected305.toLocaleString()} L</span>
                    <span className="text-[9px] text-sky-700 block">Factor ~200L/L pico</span>
                  </div>

                  <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Rango Meta</span>
                    <span className="text-base font-bold text-emerald-900">{targetRange}</span>
                    <span className="text-[9px] text-emerald-700 block">{selectedBreedStandard}</span>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Grasa Esperada</span>
                    <span className="text-base font-bold text-amber-900">{fatTarget}</span>
                    <span className="text-[9px] text-amber-700 block">Sólidos lácteos</span>
                  </div>

                  <div className="p-2.5 bg-purple-50/70 rounded-lg border border-purple-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Proteína Esperada</span>
                    <span className="text-base font-bold text-purple-900">{protTarget}</span>
                    <span className="text-[9px] text-purple-700 block">Rendimiento</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

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

          <div className="mt-3 pt-2 space-y-2">
            {onOpenMastitisModal && (
              <button
                onClick={onOpenMastitisModal}
                className="w-full bg-[#012d1d] hover:bg-[#1b4332] text-white p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-red-400" />
                  <span>Control Pruebas de Mastitis (CMT)</span>
                </div>
                <span className="bg-red-500/30 text-red-200 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {activeMastitisCount} Activas
                </span>
              </button>
            )}

            <div className="p-2 bg-[#ffdad6] text-[#93000a] rounded-xl text-[10px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Monitorear cuartos Lote 2 por ligero incremento de células somáticas.</span>
            </div>
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
    </div>

    {/* Modal for viewing category animals */}
    <CategoryAnimalsModal
      isOpen={isCategoryModalOpen}
      onClose={() => setIsCategoryModalOpen(false)}
      initialCategory={selectedModalCategory}
      moduleTitle="Plantel Lechero Integral"
    />
    </>
  );
};
