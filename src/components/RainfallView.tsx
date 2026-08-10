import React, { useState, useMemo } from 'react';
import {
  FarmDataPackage,
  RainfallRecord,
  DailyRainfallInput,
} from '../types';
import {
  CloudRain,
  Calendar,
  Building2,
  TrendingUp,
  Droplets,
  Filter,
  BarChart3,
  Layers,
  PlusCircle,
  Download,
  AlertTriangle,
  Sparkles,
  Sun,
  Umbrella,
  Zap,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  CalendarDays,
  Search,
  Table,
  Info,
  ChevronRight,
  Gauge,
  Droplet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  MONTH_NAMES_SPANISH,
  MONTH_SHORT_SPANISH,
  HISTORICAL_MONTHLY_AVERAGES,
  getMonthlyTotals,
  getMultiYearConsolidatedData,
  getAnnualTotalsComparison,
} from '../data/mockRainfallData';

interface RainfallViewProps {
  farms: FarmDataPackage[];
  currentFarm?: FarmDataPackage;
  selectedFarmId: string;
  onSelectFarm: (farmId: string) => void;
  rainfallRecords: RainfallRecord[];
  onOpenRegisterModal: () => void;
}

export const RainfallView: React.FC<RainfallViewProps> = ({
  farms,
  currentFarm,
  selectedFarmId = 'all',
  onSelectFarm,
  rainfallRecords,
  onOpenRegisterModal,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly' | 'multiyear' | 'farm_comparison'>('daily');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // August
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Active target farm or "all"
  const activeFarm = farms.find((f) => f.profile.id === selectedFarmId);

  // Filtered records by farm and year
  const filteredRecords = useMemo(() => {
    return rainfallRecords.filter((r) => {
      if (selectedFarmId !== 'all' && r.farmId !== selectedFarmId) return false;
      const recYear = new Date(r.date).getFullYear();
      if (recYear !== selectedYear) return false;
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        if (
          !r.date.toLowerCase().includes(q) &&
          !(r.farmName || '').toLowerCase().includes(q) &&
          !(r.notes || '').toLowerCase().includes(q) &&
          !(r.recordedBy || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [rainfallRecords, selectedFarmId, selectedYear, searchFilter]);

  // Current month specific daily records for selected month
  const dailyMonthRecords = useMemo(() => {
    return filteredRecords
      .filter((r) => new Date(r.date).getMonth() + 1 === selectedMonth)
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [filteredRecords, selectedMonth]);

  // Daily Chart Data for Selected Month
  const dailyChartData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const mapByDay: Record<number, { day: number; dateStr: string; amountMm: number; rainy: boolean }> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      mapByDay[d] = { day: d, dateStr, amountMm: 0, rainy: false };
    }

    dailyMonthRecords.forEach((r) => {
      const d = new Date(r.date).getDate();
      if (mapByDay[d]) {
        mapByDay[d].amountMm += r.amountMm;
        mapByDay[d].rainy = true;
      }
    });

    return Object.values(mapByDay);
  }, [selectedYear, selectedMonth, dailyMonthRecords]);

  // Monthly Aggregated Data for Selected Year
  const monthlyTotals = useMemo(() => {
    return getMonthlyTotals(rainfallRecords, selectedFarmId, selectedYear);
  }, [rainfallRecords, selectedFarmId, selectedYear]);

  // Multi-Year Consolidated Data (2023 - 2026)
  const multiYearConsolidated = useMemo(() => {
    return getMultiYearConsolidatedData(rainfallRecords, selectedFarmId);
  }, [rainfallRecords, selectedFarmId]);

  // Annual Totals Comparison (2023, 2024, 2025, 2026)
  const annualTotals = useMemo(() => {
    return getAnnualTotalsComparison(rainfallRecords, selectedFarmId);
  }, [rainfallRecords, selectedFarmId]);

  // Side-by-Side Farm Comparison Data for 2026
  const farmComparisonData = useMemo(() => {
    return farms.map((f) => {
      const farmRecs2026 = rainfallRecords.filter(
        (r) => r.farmId === f.profile.id && new Date(r.date).getFullYear() === selectedYear,
      );
      const totalMm = Math.round(farmRecs2026.reduce((s, r) => s + r.amountMm, 0) * 10) / 10;
      const rainyDays = farmRecs2026.filter((r) => r.amountMm > 0).length;
      const maxDaily = farmRecs2026.reduce((max, r) => (r.amountMm > max ? r.amountMm : max), 0);

      const areaHa = f.profile.totalAreaHa || 100;
      const totalVolumeM3 = Math.round((totalMm * 10 * areaHa));

      return {
        farmId: f.profile.id,
        farmName: f.profile.name,
        department: f.profile.department,
        municipality: f.profile.municipality,
        totalAreaHa: areaHa,
        totalMm,
        rainyDays,
        maxDaily,
        totalVolumeM3,
      };
    });
  }, [farms, rainfallRecords, selectedYear]);

  // Key KPI Metrics for Top Header Bar
  const totalYearMm = useMemo(() => {
    return monthlyTotals.reduce((sum, m) => sum + m.totalMm, 0);
  }, [monthlyTotals]);

  const totalYearRainyDays = useMemo(() => {
    return monthlyTotals.reduce((sum, m) => sum + m.rainyDays, 0);
  }, [monthlyTotals]);

  const maxYearDaily = useMemo(() => {
    return Math.max(...monthlyTotals.map((m) => m.maxDaily), 0);
  }, [monthlyTotals]);

  const currentMonthMm = useMemo(() => {
    const mMatch = monthlyTotals.find((m) => m.month === selectedMonth);
    return mMatch ? mMatch.totalMm : 0;
  }, [monthlyTotals, selectedMonth]);

  const historicalMonthAvg = useMemo(() => {
    const mMatch = monthlyTotals.find((m) => m.month === selectedMonth);
    return mMatch ? mMatch.historicalAvg : 150;
  }, [monthlyTotals, selectedMonth]);

  const monthDiffPct = useMemo(() => {
    if (!historicalMonthAvg || historicalMonthAvg === 0) return 0;
    return Math.round(((currentMonthMm - historicalMonthAvg) / historicalMonthAvg) * 100);
  }, [currentMonthMm, historicalMonthAvg]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* ========================================================================= */}
      {/* 1. HEADER & PRIMARY ACTIONS */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0077b6] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-[#caf0f8]" /> Estación Pluviométrica
            </span>
            <span className="text-xs text-[#717973] font-medium">
              Sincronizado • {farms.length} Predios Monitoreados
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#012d1d] tracking-tight mt-1">
            Pluviometría y Registro de Lluvias
          </h1>
          <p className="text-xs md:text-sm text-[#414844] mt-0.5">
            Análisis de precipitaciones por día, mes, año y consolidado multianual con equivalencias hídricas por predio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenRegisterModal}
            className="flex-1 md:flex-none bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs md:text-sm px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 h-12 shadow-sm active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#ffba38]" />
            <span>+ Registrar Lluvia (mm)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP KPI METRICS BAR (6 SUMMARY CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Year Rain */}
        <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between text-[#79564b]">
            <span className="text-[10px] font-extrabold uppercase">Lluvia Año {selectedYear}</span>
            <Droplet className="w-4 h-4 text-[#0077b6]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#012d1d] mt-2">
            {totalYearMm.toLocaleString()} <span className="text-xs font-normal text-[#717973]">mm</span>
          </p>
          <p className="text-[10px] text-[#2d6a4f] font-bold mt-1">Acumulado anual</p>
        </div>

        {/* Card 2: Selected Month Rain */}
        <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between text-[#79564b]">
            <span className="text-[10px] font-extrabold uppercase">
              {MONTH_SHORT_SPANISH[selectedMonth - 1]} {selectedYear}
            </span>
            <CloudRain className="w-4 h-4 text-[#0077b6]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#0077b6] mt-2">
            {currentMonthMm.toLocaleString()} <span className="text-xs font-normal text-[#717973]">mm</span>
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold mt-1">
            {monthDiffPct >= 0 ? (
              <span className="text-emerald-700 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +{monthDiffPct}% vs Histórico
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3" /> {monthDiffPct}% vs Histórico
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Rainy Days */}
        <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between text-[#79564b]">
            <span className="text-[10px] font-extrabold uppercase">Días con Lluvia</span>
            <Umbrella className="w-4 h-4 text-[#2d6a4f]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#012d1d] mt-2">
            {totalYearRainyDays} <span className="text-xs font-normal text-[#717973]">días</span>
          </p>
          <p className="text-[10px] text-[#717973] mt-1 font-medium">Registrados en {selectedYear}</p>
        </div>

        {/* Card 4: Max Daily Record */}
        <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between text-[#79564b]">
            <span className="text-[10px] font-extrabold uppercase">Máximo Diario</span>
            <Gauge className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-900 mt-2">
            {maxYearDaily} <span className="text-xs font-normal text-[#717973]">mm/día</span>
          </p>
          <p className="text-[10px] text-amber-700 font-bold mt-1">Pico de precipitación</p>
        </div>

        {/* Card 5: Equivalent Water Volume (m3/Ha) */}
        <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between text-[#79564b]">
            <span className="text-[10px] font-extrabold uppercase">Volumen por Ha</span>
            <Layers className="w-4 h-4 text-[#012d1d]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#012d1d] mt-2">
            {(totalYearMm * 10).toLocaleString()} <span className="text-xs font-normal text-[#717973]">m³/Ha</span>
          </p>
          <p className="text-[10px] text-[#2d6a4f] font-bold mt-1">10,000 L x mm caídos</p>
        </div>

        {/* Card 6: Hydric Status Indicator */}
        <div className="bg-[#012d1d] text-white border-2 border-[#012d1d] rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between text-[#ffba38]">
            <span className="text-[10px] font-extrabold uppercase">Estado Hídrico</span>
            <Sparkles className="w-4 h-4 text-[#ffba38]" />
          </div>
          <p className="text-lg font-black font-mono text-[#c1ecd4] mt-2 leading-tight">
            {currentMonthMm >= historicalMonthAvg ? 'Óptimo para Pastos' : 'Alerta Déficit'}
          </p>
          <p className="text-[10px] text-white/80 mt-1 font-mono">
            {currentMonthMm >= historicalMonthAvg ? 'Suficiente rebrote' : 'Monitorear bebederos'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTROLS BAR: PREDIO SELECTOR, YEAR SELECTOR, VIEW TABS */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-2xl border-2 border-[#c1c8c2] card-shadow space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Farm Switcher Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#2d6a4f]" />
              Finca / Predio:
            </span>

            <button
              onClick={() => onSelectFarm('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFarmId === 'all'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'bg-[#f4fbf7] text-[#012d1d] hover:bg-[#c1ecd4]/50 border border-[#c1c8c2]'
              }`}
            >
              Todos los Predios ({farms.length})
            </button>

            {farms.map((f) => {
              const isSelected = selectedFarmId === f.profile.id;
              return (
                <button
                  key={f.profile.id}
                  onClick={() => onSelectFarm(f.profile.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-xs'
                      : 'bg-white text-[#1a1c1c] border-[#c1c8c2] hover:border-[#012d1d]'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-[#ffba38]' : 'text-[#717973]'}`} />
                  <span>{f.profile.name}</span>
                </button>
              );
            })}
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#414844] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#012d1d]" />
              Año de Análisis:
            </span>
            <div className="flex items-center gap-1 bg-[#f3f3f3] p-1 rounded-xl border border-[#c1c8c2]">
              {[2023, 2024, 2025, 2026].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-[#012d1d] text-[#ffba38] shadow-xs'
                      : 'text-[#414844] hover:text-[#012d1d]'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5-WAY NAVIGATION TABS (Día a Día, Consolidado Mensual, Anual, Multianual, Comparativa Fincas) */}
        <div className="pt-2 border-t border-[#e5e7eb] flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'daily'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'bg-[#f8fbf9] text-[#414844] hover:bg-[#e2efe8] border border-[#c1c8c2]'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-[#ffba38]" />
            <span>Día a Día (Diario)</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'monthly'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'bg-[#f8fbf9] text-[#414844] hover:bg-[#e2efe8] border border-[#c1c8c2]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#c1ecd4]" />
            <span>Consolidado Mensual</span>
          </button>

          <button
            onClick={() => setActiveTab('yearly')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'yearly'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'bg-[#f8fbf9] text-[#414844] hover:bg-[#e2efe8] border border-[#c1c8c2]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#caf0f8]" />
            <span>Consolidado Anual ({selectedYear})</span>
          </button>

          <button
            onClick={() => setActiveTab('multiyear')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'multiyear'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-xs'
                : 'bg-[#f8fbf9] text-[#414844] hover:bg-[#e2efe8] border border-[#c1c8c2]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#ffba38]" />
            <span>Consolidado de Años (2023-2026)</span>
          </button>

          <button
            onClick={() => setActiveTab('farm_comparison')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'farm_comparison'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'bg-[#f8fbf9] text-[#414844] hover:bg-[#e2efe8] border border-[#c1c8c2]'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Comparativa por Predios</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DÍA A DÍA (REGISTROS DIARIOS Y GRÁFICA DIARIA POR MES) */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Month Selector bar inside Daily view */}
          <div className="bg-[#f0f4f1] p-3 rounded-2xl border border-[#c1c8c2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#012d1d] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2d6a4f]" />
              Selecciona el Mes del Año {selectedYear}:
            </span>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
              {MONTH_SHORT_SPANISH.map((mShort, idx) => {
                const mNum = idx + 1;
                const isSel = selectedMonth === mNum;
                return (
                  <button
                    key={mNum}
                    onClick={() => setSelectedMonth(mNum)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isSel
                        ? 'bg-[#012d1d] text-white shadow-xs'
                        : 'bg-white text-[#414844] hover:bg-[#e2efe8] border border-[#c1c8c2]'
                    }`}
                  >
                    {mShort}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Bar Chart */}
          <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-5 card-shadow space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eeeeee] pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-[#0077b6] text-white px-2 py-0.5 rounded font-mono">
                  CURVA DIARIA EN MM
                </span>
                <h3 className="text-lg font-bold text-[#012d1d] mt-1">
                  Precipitación Diaria en {MONTH_NAMES_SPANISH[selectedMonth - 1]} {selectedYear}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#717973] block font-medium">Acumulado Mes:</span>
                <span className="text-xl font-black font-mono text-[#0077b6]">
                  {currentMonthMm} mm
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#414844' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#414844' }} unit="mm" />
                  <Tooltip
                    formatter={(val: any) => [`${val} mm`, 'Lluvia']}
                    labelFormatter={(label) => `Día ${label} de ${MONTH_NAMES_SPANISH[selectedMonth - 1]}`}
                    contentStyle={{ borderRadius: '12px', borderColor: '#012d1d', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="amountMm" name="Lluvia (mm)" radius={[6, 6, 0, 0]}>
                    {dailyChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.amountMm > 35 ? '#0077b6' : entry.amountMm > 15 ? '#2d6a4f' : '#80ed99'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Records List / Table */}
          <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl card-shadow overflow-hidden">
            <div className="bg-[#012d1d] text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="bg-[#ffba38] text-[#523700] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono">
                  HISTORIAL DE REGISTROS
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Listado de Eventos de Lluvia ({dailyMonthRecords.length} eventos)
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar observación, predio..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/60 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0f4f1] text-[#012d1d] font-bold uppercase text-[11px] border-b-2 border-[#c1c8c2]">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Finca / Predio</th>
                    <th className="p-3 text-right">Lluvia (mm)</th>
                    <th className="p-3 text-right">Volumen (L/m²)</th>
                    <th className="p-3">Intensidad</th>
                    <th className="p-3">Duración</th>
                    <th className="p-3">Registrado por</th>
                    <th className="p-3">Notas / Campo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {dailyMonthRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#717973]">
                        No hay registros de lluvia para el mes de {MONTH_NAMES_SPANISH[selectedMonth - 1]} {selectedYear}.
                        ¡Toca en <strong>+ Registrar Lluvia (mm)</strong> para agregar uno!
                      </td>
                    </tr>
                  ) : (
                    dailyMonthRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-[#f9fbf9] transition-colors">
                        <td className="p-3 font-mono font-bold text-[#012d1d]">
                          {r.date}
                        </td>
                        <td className="p-3 font-semibold text-[#2d6a4f] flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#012d1d]" />
                          {r.farmName || 'Predio Principal'}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-sm text-[#0077b6]">
                          {r.amountMm} mm
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#414844]">
                          {r.amountMm} L/m²
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.intensity === 'torrencial'
                                ? 'bg-[#ffdad6] text-[#93000a]'
                                : r.intensity === 'fuerte'
                                ? 'bg-[#ffdeac] text-[#523700]'
                                : r.intensity === 'moderada'
                                ? 'bg-[#caf0f8] text-[#03045e]'
                                : 'bg-[#e2ede6] text-[#012d1d]'
                            }`}
                          >
                            {r.intensity || 'moderada'}
                          </span>
                        </td>
                        <td className="p-3 text-[#717973] font-mono">
                          {r.durationMinutes ? `${r.durationMinutes} min` : 'N/A'}
                        </td>
                        <td className="p-3 text-[#414844] font-medium">
                          {r.recordedBy || 'Mayordomo'}
                        </td>
                        <td className="p-3 text-[#717973] truncate max-w-[200px]">
                          {r.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONSOLIDADO MENSUAL (12 MESES COMPARADOS CON PROMEDIO HISTÓRICO) */}
      {/* ========================================================================= */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* Monthly Comparison Area/Bar Chart */}
          <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-5 card-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eeeeee] pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-[#012d1d] text-[#ffba38] px-2 py-0.5 rounded font-mono">
                  ANÁLISIS MENSUAL AÑO {selectedYear}
                </span>
                <h3 className="text-lg font-bold text-[#012d1d] mt-1">
                  Distribución Mensual de Precipitaciones vs Promedio Histórico
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#0077b6] rounded" />
                  <span className="font-bold text-[#012d1d]">Lluvia Real (mm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 bg-[#ffba38] border-t-2 border-dashed border-[#523700]" />
                  <span className="font-bold text-[#523700]">Promedio Histórico</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTotals} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: '#012d1d', fontWeight: 'bold' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#414844' }} unit="mm" />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} mm`,
                      name === 'totalMm' ? 'Lluvia Real' : 'Promedio Histórico',
                    ]}
                    contentStyle={{ borderRadius: '12px', borderColor: '#012d1d', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="totalMm" name="Lluvia Real (mm)" fill="#0077b6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="historicalAvg" name="Promedio Histórico (mm)" fill="#ffba38" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Breakdown Data Table */}
          <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl card-shadow overflow-hidden">
            <div className="bg-[#012d1d] text-white p-4">
              <h3 className="text-lg font-bold">
                Tabla de Consolidado Mensual de Precipitaciones ({selectedYear})
              </h3>
              <p className="text-xs text-[#c1ecd4]">
                Comparativa entre lluvia caída en el mes, días de lluvia y variación porcentual respecto al promedio histórico.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0f4f1] text-[#012d1d] font-bold uppercase text-[11px] border-b-2 border-[#c1c8c2]">
                    <th className="p-3">Mes</th>
                    <th className="p-3 text-right">Lluvia Total (mm)</th>
                    <th className="p-3 text-right">Prom. Histórico (mm)</th>
                    <th className="p-3 text-center">Días de Lluvia</th>
                    <th className="p-3 text-right">Máximo Diario (mm)</th>
                    <th className="p-3 text-right">Variación Hídrica</th>
                    <th className="p-3 text-center">Estado Pasturas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {monthlyTotals.map((m) => {
                    const diff = m.totalMm - m.historicalAvg;
                    const pct = m.historicalAvg > 0 ? Math.round((diff / m.historicalAvg) * 100) : 0;

                    return (
                      <tr key={m.month} className="hover:bg-[#f9fbf9] transition-colors">
                        <td className="p-3 font-bold text-[#012d1d] text-sm">
                          {m.monthLabel} ({MONTH_NAMES_SPANISH[m.month - 1]})
                        </td>
                        <td className="p-3 text-right font-mono font-black text-sm text-[#0077b6]">
                          {m.totalMm} mm
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-[#717973]">
                          {m.historicalAvg} mm
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-[#012d1d]">
                          {m.rainyDays} días
                        </td>
                        <td className="p-3 text-right font-mono text-amber-900 font-bold">
                          {m.maxDaily} mm/día
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          {pct >= 0 ? (
                            <span className="text-emerald-700 bg-[#c1ecd4] px-2 py-0.5 rounded">
                              +{pct}% (Superávit)
                            </span>
                          ) : (
                            <span className="text-amber-800 bg-[#ffdeac] px-2 py-0.5 rounded">
                              {pct}% (Déficit)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.totalMm >= 150
                                ? 'bg-[#c1ecd4] text-[#002114]'
                                : m.totalMm >= 60
                                ? 'bg-[#fff3cd] text-[#533f03]'
                                : 'bg-[#ffdad6] text-[#93000a]'
                            }`}
                          >
                            {m.totalMm >= 150 ? 'Crecimiento Óptimo' : m.totalMm >= 60 ? 'Mantenimiento' : 'Riego Requerido'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONSOLIDADO ANUAL (AÑO SELECCIONADO METRICAS Y PROYECCIÓN) */}
      {/* ========================================================================= */}
      {activeTab === 'yearly' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4">
              <div>
                <span className="bg-[#012d1d] text-[#ffba38] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono">
                  RESUMEN ANUAL CONSOLIDADO
                </span>
                <h3 className="text-xl font-bold text-[#012d1d] mt-1">
                  Balance Pluviométrico del Año {selectedYear}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#717973] block uppercase font-bold">Total Acumulado</span>
                <span className="text-3xl font-black font-mono text-[#012d1d]">
                  {totalYearMm.toLocaleString()} mm
                </span>
              </div>
            </div>

            {/* 4 Summary Boxes for the Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#f0f7f4] border border-[#c1ecd4] rounded-2xl p-4">
                <span className="text-xs font-bold text-[#2d6a4f] uppercase block">Mes Más Lluvioso</span>
                <p className="text-xl font-black text-[#012d1d] mt-1">
                  {monthlyTotals.reduce((prev, curr) => (curr.totalMm > prev.totalMm ? curr : prev), monthlyTotals[0]).monthLabel} ({monthlyTotals.reduce((prev, curr) => (curr.totalMm > prev.totalMm ? curr : prev), monthlyTotals[0]).totalMm} mm)
                </p>
                <p className="text-[10px] text-[#717973] mt-1">Pico máximo invernal</p>
              </div>

              <div className="bg-[#fffdf0] border border-[#ffe066] rounded-2xl p-4">
                <span className="text-xs font-bold text-[#523700] uppercase block">Mes Más Seco</span>
                <p className="text-xl font-black text-[#523700] mt-1">
                  {monthlyTotals.reduce((prev, curr) => (curr.totalMm < prev.totalMm ? curr : prev), monthlyTotals[0]).monthLabel} ({monthlyTotals.reduce((prev, curr) => (curr.totalMm < prev.totalMm ? curr : prev), monthlyTotals[0]).totalMm} mm)
                </p>
                <p className="text-[10px] text-[#717973] mt-1">Estación de verano / sequía</p>
              </div>

              <div className="bg-[#f0f8ff] border border-[#caf0f8] rounded-2xl p-4">
                <span className="text-xs font-bold text-[#0077b6] uppercase block">Promedio Mensual</span>
                <p className="text-xl font-black text-[#03045e] mt-1">
                  {Math.round(totalYearMm / (selectedYear === 2026 ? 8 : 12))} mm / mes
                </p>
                <p className="text-[10px] text-[#717973] mt-1">Promedio simple mensual</p>
              </div>

              <div className="bg-[#012d1d] text-white rounded-2xl p-4">
                <span className="text-xs font-bold text-[#ffba38] uppercase block">Volumen Hídrico Total</span>
                <p className="text-xl font-black text-white mt-1">
                  {(totalYearMm * 10 * (activeFarm?.profile.totalAreaHa || 100) / 1000).toLocaleString()} m³
                </p>
                <p className="text-[10px] text-[#c1ecd4] mt-1">Recibidos en {activeFarm?.profile.name || 'el predio'}</p>
              </div>
            </div>

            {/* Area Chart for Annual Cumulative Rainfall */}
            <div className="pt-4">
              <h4 className="text-sm font-bold text-[#012d1d] mb-2">
                Acumulado Progresivo de Lluvia (mm) a lo largo de {selectedYear}:
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyTotals.map((m, idx) => {
                      const cum = monthlyTotals.slice(0, idx + 1).reduce((s, item) => s + item.totalMm, 0);
                      return { ...m, cumulative: cum };
                    })}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: '#012d1d' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#414844' }} unit="mm" />
                    <Tooltip
                      formatter={(val: any) => [`${val} mm`, 'Acumulado']}
                      contentStyle={{ borderRadius: '12px', borderColor: '#012d1d', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke="#012d1d" fill="#2d6a4f" fillOpacity={0.2} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONSOLIDADO DE AÑOS (COMPARATIVA HISTÓRICA MULTIANUAL 2023-2026) */}
      {/* ========================================================================= */}
      {activeTab === 'multiyear' && (
        <div className="space-y-6">
          {/* Multi-Year Comparison Line Chart */}
          <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-5 card-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eeeeee] pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-[#012d1d] text-[#ffba38] px-2 py-0.5 rounded font-mono">
                  COMPARATIVA MULTIANUAL
                </span>
                <h3 className="text-xl font-bold text-[#012d1d] mt-1">
                  Curvas de Lluvia Mensual Comparadas (2023 vs 2024 vs 2025 vs 2026)
                </h3>
                <p className="text-xs text-[#717973]">
                  Superposición de patrones pluviométricos para detección de sequías o fenómenos climáticos.
                </p>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={multiYearConsolidated} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: '#012d1d', fontWeight: 'bold' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#414844' }} unit="mm" />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} mm`, `Año ${name.replace('mm', '')}`]}
                    contentStyle={{ borderRadius: '12px', borderColor: '#012d1d', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="mm2023" name="2023 (El Niño)" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="mm2024" name="2024 (La Niña)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="mm2025" name="2025 (Normal)" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="mm2026" name="2026 (Actual)" stroke="#012d1d" strokeWidth={3.5} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="historicalAvg" name="Promedio Histórico" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Annual Totals Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-5 card-shadow space-y-3">
              <h3 className="text-lg font-bold text-[#012d1d]">
                Totales Anuales Acumulados por Año (mm)
              </h3>
              <p className="text-xs text-[#717973]">
                Volumen total de precipitaciones recibidas en cada año calendario.
              </p>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={annualTotals} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#012d1d', fontWeight: 'bold' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#414844' }} unit="mm" />
                    <Tooltip
                      formatter={(val: any) => [`${val} mm`, 'Acumulado Anual']}
                      contentStyle={{ borderRadius: '12px', borderColor: '#012d1d', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="totalMm" name="Lluvia Total (mm)" radius={[8, 8, 0, 0]}>
                      {annualTotals.map((entry, index) => (
                        <Cell
                          key={`cell-annual-${index}`}
                          fill={entry.year === 2026 ? '#012d1d' : entry.year === 2024 ? '#2563eb' : entry.year === 2023 ? '#d97706' : '#059669'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Multi-Year Statistical Summary Table */}
            <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-5 card-shadow space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#012d1d]">
                  Resumen Estadístico Multianual
                </h3>
                <p className="text-xs text-[#717973] mb-3">
                  Comparativo de rendimiento hidrológico por año para {activeFarm?.profile.name || 'los predios'}.
                </p>

                <div className="space-y-2.5">
                  {annualTotals.map((at) => (
                    <div
                      key={at.year}
                      className="p-3 bg-[#f8fbf9] border border-[#c1c8c2] rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-black text-sm text-[#012d1d]">
                          Año {at.year}
                        </span>
                        <span className="text-[10px] text-[#717973] block font-medium">
                          {at.rainyDays} días lluviosos • Mes con más lluvia: <strong>{at.wettestMonth}</strong>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-lg text-[#0077b6]">
                          {at.totalMm} mm
                        </span>
                        <span className="text-[10px] text-[#2d6a4f] font-bold block">
                          {(at.totalMm * 10).toLocaleString()} m³/Ha
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#eeeeee] text-xs text-[#414844] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#012d1d] shrink-0" />
                <span>
                  Promedio multianual registrado: <strong>1,850 mm/año</strong>. Variabilidad interanual: ~18%.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: COMPARATIVA ENTRE PREDIOS / FINCAS */}
      {/* ========================================================================= */}
      {activeTab === 'farm_comparison' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl p-5 card-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eeeeee] pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-[#012d1d] text-white px-2 py-0.5 rounded font-mono">
                  MICROCLIMAS Y FINCAS
                </span>
                <h3 className="text-xl font-bold text-[#012d1d] mt-1">
                  Comparativa de Precipitaciones por Predio ({selectedYear})
                </h3>
                <p className="text-xs text-[#717973]">
                  Diferencias pluviométricas y volumen total captado en cada finca.
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={farmComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="farmName" tick={{ fontSize: 11, fill: '#012d1d', fontWeight: 'bold' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#414844' }} unit="mm" />
                  <Tooltip
                    formatter={(val: any) => [`${val} mm`, 'Lluvia Acumulada']}
                    contentStyle={{ borderRadius: '12px', borderColor: '#012d1d', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="totalMm" name="Lluvia Total (mm)" fill="#2d6a4f" radius={[8, 8, 0, 0]}>
                    {farmComparisonData.map((_, index) => (
                      <Cell key={`cell-farm-${index}`} fill={index % 2 === 0 ? '#012d1d' : '#0077b6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Farm Comparison Details Table */}
          <div className="bg-white border-2 border-[#c1c8c2] rounded-2xl card-shadow overflow-hidden">
            <div className="bg-[#012d1d] text-white p-4">
              <h3 className="text-lg font-bold">
                Desglose de Captación Hídrica por Predio ({selectedYear})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0f4f1] text-[#012d1d] font-bold uppercase text-[11px] border-b-2 border-[#c1c8c2]">
                    <th className="p-3">Predio / Finca</th>
                    <th className="p-3">Ubicación</th>
                    <th className="p-3 text-right">Área (Ha)</th>
                    <th className="p-3 text-right">Lluvia Acumulada (mm)</th>
                    <th className="p-3 text-center">Días de Lluvia</th>
                    <th className="p-3 text-right">Máximo Diario</th>
                    <th className="p-3 text-right">Volumen Captado (m³)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {farmComparisonData.map((f) => (
                    <tr key={f.farmId} className="hover:bg-[#f9fbf9] transition-colors">
                      <td className="p-3 font-black text-sm text-[#012d1d]">
                        {f.farmName}
                      </td>
                      <td className="p-3 text-[#414844] font-medium">
                        {f.municipality}, {f.department}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#012d1d]">
                        {f.totalAreaHa} Ha
                      </td>
                      <td className="p-3 text-right font-mono font-black text-sm text-[#0077b6]">
                        {f.totalMm} mm
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#012d1d]">
                        {f.rainyDays} días
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-900">
                        {f.maxDaily} mm/día
                      </td>
                      <td className="p-3 text-right font-mono font-black text-emerald-800">
                        {f.totalVolumeM3.toLocaleString()} m³
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FUTURA AUTOMATIZACIÓN Y CAPTURA INTELIGENTE (IOT, IA Y FUENTES OFICIALES) */}
      {/* ========================================================================= */}
      <div className="bg-[#012d1d] text-white rounded-3xl p-6 border-2 border-[#ffba38] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1b4332] rounded-2xl text-[#ffba38] border border-[#2d6a4f]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase font-mono text-[#ffba38] tracking-widest block">
                PRÓXIMA EVOLUCIÓN TECNOLÓGICA
              </span>
              <h3 className="text-xl font-black text-white leading-tight">
                Integración de Pluviómetros Inteligentes & Fuentes Oficiales
              </h3>
            </div>
          </div>
          <span className="bg-[#1b4332] text-[#c1ecd4] text-xs font-mono font-bold px-3 py-1 rounded-full border border-[#2d6a4f] self-start md:self-auto">
            Módulo Preparado para Sensores
          </span>
        </div>

        <p className="text-xs md:text-sm text-[#c1ecd4] leading-relaxed">
          Diseñado para expandirse con tres métodos automáticos de captura de datos pluviométricos para eliminar el registro manual en potrero:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Card 1: IoT Telemetry */}
          <div className="bg-[#023e2a] border border-[#2d6a4f] hover:border-[#ffba38] p-4 rounded-2xl transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-[#ffba38] text-[#012d1d] text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                1. SENSORES IOT
              </span>
              <Zap className="w-4 h-4 text-[#ffba38]" />
            </div>
            <h4 className="text-sm font-bold text-white">Pluviómetro de Señal Automática</h4>
            <p className="text-xs text-[#c1ecd4]/80 leading-snug">
              Pluviómetros digitales de balancín con transmisión inalámbrica (LoRaWAN, Sigfox o 4G/NB-IoT) que envían los pulsos en mm inmediatamente al comenzar a llover.
            </p>
          </div>

          {/* Card 2: Photo OCR */}
          <div className="bg-[#023e2a] border border-[#2d6a4f] hover:border-[#ffba38] p-4 rounded-2xl transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-[#c1ecd4] text-[#012d1d] text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                2. LECTURA POR FOTO (IA)
              </span>
              <Sparkles className="w-4 h-4 text-[#c1ecd4]" />
            </div>
            <h4 className="text-sm font-bold text-white">Reconocimiento Óptico (OCR)</h4>
            <p className="text-xs text-[#c1ecd4]/80 leading-snug">
              El mayordomo toma una foto con el celular al menisco de agua en la probeta calibrada del pluviómetro físico y la visión de IA calcula de forma exacta los mm caídos.
            </p>
          </div>

          {/* Card 3: Official Weather APIs */}
          <div className="bg-[#023e2a] border border-[#2d6a4f] hover:border-[#ffba38] p-4 rounded-2xl transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-[#caf0f8] text-[#03045e] text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                3. FUENTES OFICIALES
              </span>
              <CloudRain className="w-4 h-4 text-[#caf0f8]" />
            </div>
            <h4 className="text-sm font-bold text-white">Estaciones Meteorológicas & Satélite</h4>
            <p className="text-xs text-[#c1ecd4]/80 leading-snug">
              Conexión directa vía API con estaciones del IDEAM, NOAA, Open-Meteo y radares pluviométricos zonales para validar y complementar los datos de cada predio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
