import React, { useState } from 'react';
import { GrassIcon } from './icons/GrassIcon';
import {
  Scale,
  Wheat,
  Plus,
  Search,
  Calendar,
  Ruler,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Filter,
  BarChart2,
  Building2,
  ChevronRight,
  Calculator,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  Shield,
  Eye,
  Trash2,
  X,
} from 'lucide-react';
import { AforoSampling, FarmDataPackage } from '../types';

interface AforoViewProps {
  farms: FarmDataPackage[];
  selectedFarmId: string;
  onSelectFarm: (id: string) => void;
  aforoSamplings: AforoSampling[];
  onOpenRegisterAforoModal: () => void;
  onDeleteAforo?: (id: string) => void;
}

export const AforoView: React.FC<AforoViewProps> = ({
  farms,
  selectedFarmId,
  onSelectFarm,
  aforoSamplings,
  onOpenRegisterAforoModal,
  onDeleteAforo,
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'matrix' | 'calculator' | 'guide'>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<string>('all');
  const [selectedSamplingDetails, setSelectedSamplingDetails] = useState<AforoSampling | null>(null);

  // Quick Calculator State
  const [calcAreaHa, setCalcAreaHa] = useState<number>(5.0);
  const [calcYieldTonHa, setCalcYieldTonHa] = useState<number>(14.0);
  const [calcLossPct, setCalcLossPct] = useState<number>(30);
  const [calcDmPct, setCalcDmPct] = useState<number>(20);
  const [calcHeadCount, setCalcHeadCount] = useState<number>(40);
  const [calcAnimalWeightKg, setCalcAnimalWeightKg] = useState<number>(420);

  // Filter samplings by farm and search query
  const filteredSamplings = aforoSamplings.filter((sam) => {
    const matchesFarm = selectedFarmId === 'all' || sam.farmId === selectedFarmId;
    const matchesQuery =
      sam.paddockName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sam.grassType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sam.samplerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeason = selectedSeasonFilter === 'all' || sam.season === selectedSeasonFilter;
    return matchesFarm && matchesQuery && matchesSeason;
  });

  // Key KPI Calculations
  const totalSamplingsCount = filteredSamplings.length;
  const avgGreenYieldTonHa =
    totalSamplingsCount > 0
      ? filteredSamplings.reduce((acc, s) => acc + s.totalGreenYieldTonHa, 0) / totalSamplingsCount
      : 0;
  const avgUsefulDmKgHa =
    totalSamplingsCount > 0
      ? filteredSamplings.reduce((acc, s) => acc + s.usefulDryMatterKgHa, 0) / totalSamplingsCount
      : 0;
  const avgCarryingCapacityUaHa =
    totalSamplingsCount > 0
      ? filteredSamplings.reduce((acc, s) => acc + s.carryingCapacityUaHa, 0) / totalSamplingsCount
      : 0;

  // Selected farm info
  const currentFarmPackage = farms.find((f) => f.profile.id === selectedFarmId) || farms[0];
  const currentFarmPaddocks = currentFarmPackage?.paddocks || [];

  // Interactive Calculator Logic
  const calcUsefulGreenKgHa = calcYieldTonHa * 1000 * (1 - calcLossPct / 100);
  const calcUsefulDmKgHa = calcUsefulGreenKgHa * (calcDmPct / 100);
  const calcPaddockTotalUsefulGreenKg = calcUsefulGreenKgHa * calcAreaHa;
  const calcHerdDailyGreenNeedKg = calcHeadCount * (calcAnimalWeightKg * 0.1);
  const calcEstimatedDays =
    calcHerdDailyGreenNeedKg > 0 ? Math.floor(calcPaddockTotalUsefulGreenKg / calcHerdDailyGreenNeedKg) : 0;
  const calcCarryingCapacityUa =
    calcAnimalWeightKg > 0 ? Number(((calcUsefulGreenKgHa / (30 * 45)) * (450 / calcAnimalWeightKg)).toFixed(2)) : 0;

  return (
    <div className="space-y-5 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#012d1d] via-[#02402a] to-[#15803d] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-[#012d1d] relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GrassIcon className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#ffba38] text-[#012d1d] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono">
                PASTOREO ROTACIONAL & BIOMASA
              </span>
              <span className="text-xs text-[#c1ecd4] font-semibold">
                {currentFarmPackage?.profile.name || 'Todas las Fincas'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                <GrassIcon className="w-6 h-6 text-[#ffba38]" />
                Control de Aforos de Pastos
              </h1>
              <div className="group relative inline-flex items-center">
                <button
                  type="button"
                  className="text-[#a3b8ad] hover:text-[#c1ecd4] transition-colors p-0.5 rounded cursor-pointer"
                  title="Mide la oferta de forraje verde y materia seca (MS) por cuadro. Calcula la capacidad de carga real en Unidades Animales (UA/Ha) y optimiza los días de ocupación y descanso por potrero."
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-80 bg-[#012d1d] text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl border border-[#2d6a4f] pointer-events-none animate-in fade-in zoom-in-95">
                  Mide la oferta de forraje verde y materia seca (MS) por cuadro. Calcula la capacidad de carga real en Unidades Animales (UA/Ha) y optimiza los días de ocupación y descanso por potrero.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenRegisterAforoModal}
              className="h-9 px-3.5 bg-[#ffba38] hover:bg-[#f59e0b] text-[#012d1d] font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Nuevo Aforo de Pastos</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOP KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#717973]">
            <span className="text-[10px] font-extrabold uppercase">Rendimiento Verde Prom.</span>
            <Wheat className="w-4 h-4 text-[#d97706]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#012d1d] font-mono">
              {avgGreenYieldTonHa.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-[#414844]">Ton/Ha</span>
          </div>
          <p className="text-[10px] text-[#717973] font-medium">Forraje verde en pie</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#717973]">
            <span className="text-[10px] font-extrabold uppercase">Oferta Materia Seca</span>
            <TrendingUp className="w-4 h-4 text-[#15803d]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#012d1d] font-mono">
              {Math.round(avgUsefulDmKgHa).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#414844]">Kg MS/Ha</span>
          </div>
          <p className="text-[10px] text-[#2d6a4f] font-semibold">Descontando pérdidas por pisoteo</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#717973]">
            <span className="text-[10px] font-extrabold uppercase">Capacidad de Carga</span>
            <BarChart2 className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#012d1d] font-mono">
              {avgCarryingCapacityUaHa.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-[#414844]">UA / Ha</span>
          </div>
          <p className="text-[10px] text-[#717973] font-medium">UA = 450 Kg peso vivo</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#f8fbf9] p-4 rounded-2xl border border-[#c1c8c2] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#717973]">
            <span className="text-[10px] font-extrabold uppercase">Potreros Evaluados</span>
            <CheckCircle2 className="w-4 h-4 text-[#012d1d]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#012d1d] font-mono">
              {totalSamplingsCount}
            </span>
            <span className="text-xs font-bold text-[#717973]">
              / {currentFarmPaddocks.length || '—'}
            </span>
          </div>
          <p className="text-[10px] text-[#717973] font-medium">Muestreos activos</p>
        </div>
      </div>

      {/* FILTER & TABS NAVBAR */}
      <div className="bg-white p-3 rounded-2xl border border-[#c1c8c2] shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Main Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-[#f8fbf9] p-1 rounded-xl border border-[#c1c8c2] overflow-x-auto">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'records'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Aforos Realizados</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Matriz de Potreros</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-[#ffba38]" />
              <span>Simulador de Pastoreo</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Guía Metodológica</span>
            </button>
          </div>

          {/* Search & Season Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#717973] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar potrero o pasto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#f8fbf9] border border-[#c1c8c2] rounded-xl text-xs font-medium text-[#1a1c1c] focus:outline-none focus:border-[#012d1d]"
              />
            </div>

            {/* Season Filter */}
            <select
              value={selectedSeasonFilter}
              onChange={(e) => setSelectedSeasonFilter(e.target.value)}
              className="p-1.5 bg-[#f8fbf9] border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d] focus:outline-none"
            >
              <option value="all">Todas las Épocas</option>
              <option value="lluvia">🌧️ Lluvias</option>
              <option value="sequia">☀️ Sequía</option>
              <option value="transicion">⛅ Transición</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: RECORDS TABLE / CARDS */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {filteredSamplings.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#c1c8c2] text-center space-y-3">
              <div className="p-3 bg-[#e8f3ed] text-[#012d1d] rounded-2xl w-fit mx-auto">
                <GrassIcon className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-[#012d1d]">No hay aforos registrados</h3>
              <p className="text-xs text-[#717973] max-w-md mx-auto">
                Registra el primer aforo de pasto tirando marcos de 1m² en tus potreros para conocer la
                oferta real de alimento de tus animales.
              </p>
              <button
                onClick={onOpenRegisterAforoModal}
                className="py-2.5 px-4 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#ffba38]" />
                <span>Realizar Aforo Ahora</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSamplings.map((sampling) => {
                const statusColor =
                  sampling.statusAlert === 'excelente'
                    ? 'bg-[#dcfce7] text-[#15803d] border-[#86efac]'
                    : sampling.statusAlert === 'riesgo_sobrepastoreo'
                    ? 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]'
                    : 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]';

                return (
                  <div
                    key={sampling.id}
                    className="bg-white rounded-3xl border border-[#c1c8c2] shadow-2xs hover:shadow-md transition-all p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-2">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#2d6a4f] uppercase font-mono block">
                            {sampling.farmName}
                          </span>
                          <h3 className="text-sm font-black text-[#012d1d] truncate">
                            {sampling.paddockName}
                          </h3>
                        </div>
                        <span
                          className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${statusColor}`}
                        >
                          {sampling.statusAlert === 'excelente'
                            ? 'Alta Oferta'
                            : sampling.statusAlert === 'riesgo_sobrepastoreo'
                            ? 'Baja Oferta'
                            : 'Oferta Media'}
                        </span>
                      </div>

                      {/* Info Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                        <span className="bg-[#f8fbf9] px-2 py-0.5 rounded-lg border border-[#c1c8c2] text-[#414844] font-semibold">
                          🌿 {sampling.grassType}
                        </span>
                        <span className="bg-[#f8fbf9] px-2 py-0.5 rounded-lg border border-[#c1c8c2] text-[#717973] font-medium">
                          {sampling.season === 'lluvia'
                            ? '🌧️ Lluvia'
                            : sampling.season === 'sequia'
                            ? '☀️ Sequía'
                            : '⛅ Transición'}
                        </span>
                        <span className="bg-[#f8fbf9] px-2 py-0.5 rounded-lg border border-[#c1c8c2] text-[#717973] font-mono">
                          {sampling.paddockAreaHa} Ha
                        </span>
                      </div>

                      {/* Main Yield Metric Box */}
                      <div className="bg-[#f8fbf9] p-3 rounded-2xl border border-[#e2ede6] grid grid-cols-2 gap-2 text-center">
                        <div>
                          <span className="block text-[9.5px] font-bold text-[#717973] uppercase">
                            Ton Verde / Ha
                          </span>
                          <span className="text-base font-black text-[#012d1d] font-mono">
                            {sampling.totalGreenYieldTonHa}
                          </span>
                        </div>
                        <div className="border-l border-[#c1c8c2] pl-2">
                          <span className="block text-[9.5px] font-bold text-[#717973] uppercase">
                            Kg MS Útil / Ha
                          </span>
                          <span className="text-base font-black text-[#15803d] font-mono">
                            {sampling.usefulDryMatterKgHa.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Capacity Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#d97706]" />
                          <div>
                            <span className="text-[10px] text-[#717973] block leading-none">
                              Días Ocupación:
                            </span>
                            <span className="font-extrabold text-[#012d1d]">
                              {sampling.recommendedGrazingDays} días
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <BarChart2 className="w-3.5 h-3.5 text-[#0284c7]" />
                          <div>
                            <span className="text-[10px] text-[#717973] block leading-none">
                              Capacidad Carga:
                            </span>
                            <span className="font-extrabold text-[#012d1d]">
                              {sampling.carryingCapacityUaHa} UA/Ha
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-[#f0f0f0] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-[#717973] text-[11px]">
                        <Calendar className="w-3 h-3 text-[#2d6a4f]" />
                        <span>{sampling.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onDeleteAforo && (
                          <button
                            onClick={() => onDeleteAforo(sampling.id)}
                            className="p-1.5 text-[#b91c1c] hover:bg-[#fee2e2] rounded-xl transition-all cursor-pointer"
                            title="Eliminar Aforo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSamplingDetails(sampling)}
                          className="px-2.5 py-1 bg-[#e8f3ed] hover:bg-[#012d1d] text-[#012d1d] hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalles</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: PADDOCK PERFORMANCE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-[#c1c8c2] shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#012d1d]">
                Matriz Comparativa de Capacidad Forrajera por Potrero
              </h2>
              <p className="text-xs text-[#717973]">
                Visualiza el rendimiento de forraje verde y la capacidad de sostener ganado en cada área
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fbf9] border-b border-[#c1c8c2] text-[#414844] font-extrabold uppercase text-[10px]">
                  <th className="p-3">Potrero</th>
                  <th className="p-3">Área (Ha)</th>
                  <th className="p-3">Especie Pasto</th>
                  <th className="p-3 text-center">Ton Verde / Ha</th>
                  <th className="p-3 text-center">Kg MS Útil / Ha</th>
                  <th className="p-3 text-center">Capacidad (UA/Ha)</th>
                  <th className="p-3 text-center">Días Estimados</th>
                  <th className="p-3 text-right">Último Aforo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {currentFarmPaddocks.map((paddock) => {
                  const lastAforo = aforoSamplings.find((s) => s.paddockId === paddock.id);

                  return (
                    <tr key={paddock.id} className="hover:bg-[#f8fbf9] transition-colors">
                      <td className="p-3 font-extrabold text-[#012d1d]">
                        {paddock.name}
                      </td>
                      <td className="p-3 font-mono text-[#414844]">
                        {paddock.areaHa} Ha
                      </td>
                      <td className="p-3 font-medium text-[#414844]">
                        {paddock.grassType || lastAforo?.grassType || 'No especificado'}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#012d1d]">
                        {lastAforo ? `${lastAforo.totalGreenYieldTonHa} Ton` : '—'}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#15803d]">
                        {lastAforo ? lastAforo.usefulDryMatterKgHa.toLocaleString() : '—'}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#0284c7]">
                        {lastAforo ? `${lastAforo.carryingCapacityUaHa} UA` : '—'}
                      </td>
                      <td className="p-3 text-center font-bold text-[#d97706]">
                        {lastAforo ? `${lastAforo.recommendedGrazingDays} días` : '—'}
                      </td>
                      <td className="p-3 text-right font-mono text-[#717973] text-[11px]">
                        {lastAforo ? lastAforo.date : 'Sin aforo'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: INTERACTIVE GRAZING SIMULATOR */}
      {activeTab === 'calculator' && (
        <div className="bg-white rounded-3xl border border-[#c1c8c2] shadow-2xs p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#f0f0f0] pb-3">
            <div className="p-2 bg-[#ffba38] text-[#012d1d] rounded-2xl">
              <Calculator className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#012d1d]">
                Simulador Rápido de Pastoreo y Rotación
              </h2>
              <p className="text-xs text-[#717973]">
                Calcula al instante cuántos días soportará un potrero según el número de animales y peso medio
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls Side */}
            <div className="bg-[#f8fbf9] p-4 rounded-2xl border border-[#c1c8c2] space-y-4">
              <span className="text-xs font-extrabold uppercase text-[#012d1d] block">
                Parámetros del Potrero y Lote:
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-[#414844] uppercase mb-1">
                    Área Potrero (Ha):
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={calcAreaHa}
                    onChange={(e) => setCalcAreaHa(parseFloat(e.target.value) || 1)}
                    className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#414844] uppercase mb-1">
                    Aforo Verde (Ton/Ha):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={calcYieldTonHa}
                    onChange={(e) => setCalcYieldTonHa(parseFloat(e.target.value) || 1)}
                    className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#414844] uppercase mb-1">
                    % Pérdida (Pisoteo):
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={calcLossPct}
                    onChange={(e) => setCalcLossPct(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#414844] uppercase mb-1">
                    % Materia Seca (% MS):
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="40"
                    value={calcDmPct}
                    onChange={(e) => setCalcDmPct(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#414844] uppercase mb-1">
                    Número de Animales:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={calcHeadCount}
                    onChange={(e) => setCalcHeadCount(parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#414844] uppercase mb-1">
                    Peso Promedio (Kg/animal):
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="800"
                    value={calcAnimalWeightKg}
                    onChange={(e) => setCalcAnimalWeightKg(parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="bg-[#012d1d] text-white p-5 rounded-2xl flex flex-col justify-between shadow-lg space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#ffba38] tracking-wider block mb-1 font-mono">
                  RESULTADOS DE SIMULACIÓN
                </span>
                <h3 className="text-lg font-black text-white">
                  Balance de Oferta y Demanda Forrajera
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="block text-[10px] font-semibold text-[#c1ecd4] uppercase">
                    Forraje Útil en Potrero
                  </span>
                  <span className="text-lg font-extrabold text-white font-mono">
                    {Math.round(calcPaddockTotalUsefulGreenKg).toLocaleString()} kg
                  </span>
                </div>

                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="block text-[10px] font-semibold text-[#c1ecd4] uppercase">
                    Consumo Diario Lote
                  </span>
                  <span className="text-lg font-extrabold text-[#ffba38] font-mono">
                    {Math.round(calcHerdDailyGreenNeedKg).toLocaleString()} kg/día
                  </span>
                </div>
              </div>

              <div className="bg-[#ffba38] text-[#012d1d] p-4 rounded-2xl text-center shadow-inner space-y-0.5">
                <span className="text-xs font-extrabold uppercase tracking-wider block opacity-80">
                  Días Recomendados de Permanencia
                </span>
                <span className="text-3xl font-black font-mono">
                  {calcEstimatedDays} DÍAS
                </span>
                <p className="text-[10.5px] font-bold text-[#012d1d]/80 pt-1">
                  Capacidad teórica: {calcCarryingCapacityUa} UA/Ha
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: FIELD SAMPLING METHODOLOGY GUIDE */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-3xl border border-[#c1c8c2] shadow-2xs p-5 space-y-5">
          <div className="border-b border-[#f0f0f0] pb-3">
            <h2 className="text-base font-extrabold text-[#012d1d]">
              Guía Técnica: ¿Cómo Realizar un Aforo de Pastos Correcto?
            </h2>
            <p className="text-xs text-[#717973]">
              Paso a paso para medir la oferta forrajera en campo utilizando el método del marco de 1m²
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-[#f8fbf9] p-4 rounded-2xl border border-[#c1c8c2] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#012d1d] text-[#ffba38] font-black text-sm flex items-center justify-center font-mono">
                1
              </div>
              <h3 className="text-xs font-extrabold text-[#012d1d] uppercase">
                Lanzamiento en 'W' o 'X'
              </h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Camina en zig-zag por todo el potrero y lanza el marco de metal/PVC de 1m² de forma aleatoria en al menos 5 a 10 puntos representativos. Evita orillas y bebederos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#f8fbf9] p-4 rounded-2xl border border-[#c1c8c2] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#012d1d] text-[#ffba38] font-black text-sm flex items-center justify-center font-mono">
                2
              </div>
              <h3 className="text-xs font-extrabold text-[#012d1d] uppercase">
                Corte a Altura de Pastoreo
              </h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Corta todo el pasto que queda dentro del marco utilizando una tijera o machete a la misma altura a la que el animal suele cosecharlo (dejar puño/remanente).
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#f8fbf9] p-4 rounded-2xl border border-[#c1c8c2] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#012d1d] text-[#ffba38] font-black text-sm flex items-center justify-center font-mono">
                3
              </div>
              <h3 className="text-xs font-extrabold text-[#012d1d] uppercase">
                Pesaje y Cálculo de Carga
              </h3>
              <p className="text-xs text-[#414844] leading-relaxed">
                Pesa cada muestra en una gramera digital y registra el peso en kg. La app calcula automáticamente el promedio por m², Ton/Ha y los días máximos de ocupación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DRAWER */}
      {selectedSamplingDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedSamplingDetails(null); }}>
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#c1c8c2] animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#012d1d] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GrassIcon className="w-5 h-5 text-[#ffba38]" />
                <h3 className="text-sm font-extrabold">
                  Detalles de Aforo: {selectedSamplingDetails.paddockName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSamplingDetails(null)}
                className="p-1 text-white/70 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#f8fbf9] p-3 rounded-2xl border border-[#c1c8c2]">
                <div>
                  <span className="text-[#717973] block text-[10px] font-bold uppercase">
                    Fecha
                  </span>
                  <span className="font-extrabold text-[#012d1d]">
                    {selectedSamplingDetails.date}
                  </span>
                </div>
                <div>
                  <span className="text-[#717973] block text-[10px] font-bold uppercase">
                    Evaluador
                  </span>
                  <span className="font-extrabold text-[#012d1d]">
                    {selectedSamplingDetails.samplerName}
                  </span>
                </div>
                <div>
                  <span className="text-[#717973] block text-[10px] font-bold uppercase">
                    Especie
                  </span>
                  <span className="font-extrabold text-[#012d1d]">
                    {selectedSamplingDetails.grassType}
                  </span>
                </div>
                <div>
                  <span className="text-[#717973] block text-[10px] font-bold uppercase">
                    Época
                  </span>
                  <span className="font-extrabold text-[#012d1d]">
                    {selectedSamplingDetails.season}
                  </span>
                </div>
              </div>

              {/* Cuts Table */}
              <div>
                <span className="font-extrabold text-[#012d1d] uppercase block mb-1.5 text-[11px]">
                  Desglose de Pesos por Marco:
                </span>
                <div className="space-y-1">
                  {selectedSamplingDetails.cuts.map((c) => (
                    <div
                      key={c.frameIndex}
                      className="flex items-center justify-between bg-[#f8fbf9] p-2 rounded-xl border border-[#e2ede6]"
                    >
                      <span className="font-bold text-[#012d1d]">Marco #{c.frameIndex}</span>
                      <span className="font-mono font-extrabold text-[#15803d]">
                        {c.weightKg} kg {c.heightCm ? `(${c.heightCm} cm)` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSamplingDetails.notes && (
                <div className="bg-[#f8fbf9] p-3 rounded-2xl border border-[#c1c8c2]">
                  <span className="text-[10px] font-extrabold text-[#717973] uppercase block mb-1">
                    Notas de Campo:
                  </span>
                  <p className="text-[#414844] italic">{selectedSamplingDetails.notes}</p>
                </div>
              )}

              <button
                onClick={() => setSelectedSamplingDetails(null)}
                className="w-full py-2.5 bg-[#012d1d] text-white font-bold rounded-xl cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
