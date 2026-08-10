import React, { useState, useMemo } from 'react';
import { CowIcon } from './icons/CowIcon';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Download,
  Building2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Scale,
  Sparkles,
  Info,
  ChevronRight,
  Trash2,
  MapPin,
  RefreshCw,
  Milk,
  Dna,
  Baby,
  Beef,
  Wrench,
  Layers3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import {
  FinancialTransaction,
  MonthlyFinancialRecord,
  AnnualFinancialSummary,
  ConsolidatedFinancialReport,
  FarmDataPackage,
  IncomeCategory,
  ExpenseCategory,
  BusinessUnitId,
  BusinessUnitInfo,
} from '../types';
import {
  INCOME_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
  INITIAL_ANNUAL_SUMMARIES,
  INITIAL_CONSOLIDATED_REPORT,
  BUSINESS_UNITS_CATALOG,
  getBusinessUnitForTransaction,
} from '../data/mockFinancialData';

interface FinanceViewProps {
  farms: FarmDataPackage[];
  selectedFarmId: string;
  onSelectFarm: (farmId: string) => void;
  transactions: FinancialTransaction[];
  onOpenRegisterTransactionModal: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  farms,
  selectedFarmId,
  onSelectFarm,
  transactions,
  onOpenRegisterTransactionModal,
  onDeleteTransaction,
}) => {
  // Navigation sub-tabs inside Finance section
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'business_units' | 'monthly' | 'annual' | 'consolidated' | 'simulator' | 'ledger'>('dashboard');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<BusinessUnitId | 'all'>('all');

  // Helper to render Business Unit icon
  const renderBUIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Milk':
        return <Milk className={className} />;
      case 'Dna':
        return <Dna className={className} />;
      case 'Baby':
        return <CowIcon className={className} />;
      case 'Beef':
        return <CowIcon className={className} />;
      case 'Wrench':
        return <Wrench className={className} />;
      case 'Building2':
      default:
        return <Building2 className={className} />;
    }
  };

  // Selected farm object
  const currentFarm = useMemo(() => {
    if (selectedFarmId === 'all') return null;
    return farms.find((f) => f.profile.id === selectedFarmId) || null;
  }, [farms, selectedFarmId]);

  // Farm total area in Hectares
  const currentAreaHa = useMemo(() => {
    if (selectedFarmId === 'all') {
      return farms.reduce((acc, f) => acc + (f.profile.totalAreaHa || 120), 0);
    }
    return currentFarm?.profile.totalAreaHa || 120;
  }, [farms, selectedFarmId, currentFarm]);

  // Format currency helpers
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatShortNumber = (val: number) => {
    if (Math.abs(val) >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000).toFixed(1)}M`;
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val.toLocaleString('es-CO');
  };

  // Business Units Metrics Computation across transactions
  const businessUnitMetrics = useMemo(() => {
    const units = Object.values(BUSINESS_UNITS_CATALOG);
    const totalFarmArea = currentAreaHa || 120;

    const farmTxs = transactions.filter((t) => selectedFarmId === 'all' || t.farmId === selectedFarmId);
    const totalRanchIncome = farmTxs
      .filter((t) => t.type === 'ingreso')
      .reduce((acc, t) => acc + t.amount, 0);

    return units.map((bu) => {
      const buTxs = farmTxs.filter((t) => getBusinessUnitForTransaction(t) === bu.id);
      const income = buTxs.filter((t) => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
      const directCosts = buTxs.filter((t) => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
      const netProfit = income - directCosts;
      const incomePerHa = income / totalFarmArea;
      const costsPerHa = directCosts / totalFarmArea;
      const profitPerHa = netProfit / totalFarmArea;
      const marginPercent = income > 0 ? (netProfit / income) * 100 : 0;
      const shareOfTotalIncome = totalRanchIncome > 0 ? (income / totalRanchIncome) * 100 : 0;

      const totalHeadcount = buTxs.reduce((acc, t) => acc + (t.headcount || 0), 0);
      const totalKgOrLiters = buTxs.reduce((acc, t) => acc + (t.kgOrLiters || 0), 0);

      return {
        ...bu,
        income,
        directCosts,
        netProfit,
        incomePerHa,
        costsPerHa,
        profitPerHa,
        marginPercent,
        shareOfTotalIncome,
        totalHeadcount,
        totalKgOrLiters,
        txCount: buTxs.length,
        transactions: buTxs,
      };
    });
  }, [transactions, selectedFarmId, currentAreaHa]);

  // Annual summary active
  const activeAnnualSummary = useMemo(() => {
    const found = INITIAL_ANNUAL_SUMMARIES.find(
      (s) => s.year === selectedYear && (selectedFarmId === 'all' || s.farmId === selectedFarmId)
    );
    if (found) return found;
    // Fallback computed
    return INITIAL_ANNUAL_SUMMARIES[0];
  }, [selectedYear, selectedFarmId]);

  // Monthly breakdown array
  const monthlyData = useMemo(() => {
    return activeAnnualSummary.monthlyBreakdown || [];
  }, [activeAnnualSummary]);

  // Category Pie breakdown
  const incomeCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyData.forEach((m) => {
      Object.entries(m.incomeByCategory || {}).forEach(([cat, val]) => {
        map[cat] = (map[cat] || 0) + Number(val || 0);
      });
    });
    return Object.entries(map).map(([key, value]) => ({
      name: INCOME_CATEGORY_LABELS[key as IncomeCategory]?.label || key,
      value,
      color: INCOME_CATEGORY_LABELS[key as IncomeCategory]?.color || '#2b8a3e',
      perHa: value / currentAreaHa,
    }));
  }, [monthlyData, currentAreaHa]);

  const expenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyData.forEach((m) => {
      Object.entries(m.costsByCategory || {}).forEach(([cat, val]) => {
        map[cat] = (map[cat] || 0) + Number(val || 0);
      });
    });
    return Object.entries(map).map(([key, value]) => ({
      name: EXPENSE_CATEGORY_LABELS[key as ExpenseCategory]?.label || key,
      value,
      color: EXPENSE_CATEGORY_LABELS[key as ExpenseCategory]?.color || '#e03131',
      perHa: value / currentAreaHa,
    }));
  }, [monthlyData, currentAreaHa]);

  // Simulator State (What-if scenario)
  const [simBeefPriceKg, setSimBeefPriceKg] = useState<number>(9500);
  const [simCarryingCapacityUa, setSimCarryingCapacityUa] = useState<number>(2.2);
  const [simDailyGainGrams, setSimDailyGainGrams] = useState<number>(650);
  const [simDirectCostPerAnimalMonth, setSimDirectCostPerAnimalMonth] = useState<number>(65000);

  // Simulator Calculations per Hectare
  const simResults = useMemo(() => {
    // 1 UA = 450 kg liveweight
    const animalsPerHa = simCarryingCapacityUa * (450 / 450); // UA ~ animals
    const annualGainedKgPerAnimal = (simDailyGainGrams / 1000) * 365;
    const totalGainedKgPerHaAnnual = animalsPerHa * annualGainedKgPerAnimal;
    
    const grossIncomePerHaAnnual = totalGainedKgPerHaAnnual * simBeefPriceKg;
    const grossIncomePerHaMonthly = grossIncomePerHaAnnual / 12;
    
    const directCostPerHaMonthly = animalsPerHa * simDirectCostPerAnimalMonth;
    const directCostPerHaAnnual = directCostPerHaMonthly * 12;
    
    const fixedCostPerHaMonthly = 40000; // estimated fixed overhead
    const fixedCostPerHaAnnual = fixedCostPerHaMonthly * 12;
    
    const totalCostPerHaAnnual = directCostPerHaAnnual + fixedCostPerHaAnnual;
    const netProfitPerHaAnnual = grossIncomePerHaAnnual - totalCostPerHaAnnual;
    const netProfitPerHaMonthly = netProfitPerHaAnnual / 12;
    
    const profitMargin = grossIncomePerHaAnnual > 0 ? (netProfitPerHaAnnual / grossIncomePerHaAnnual) * 100 : 0;
    
    return {
      totalGainedKgPerHaAnnual: Math.round(totalGainedKgPerHaAnnual),
      grossIncomePerHaAnnual: Math.round(grossIncomePerHaAnnual),
      grossIncomePerHaMonthly: Math.round(grossIncomePerHaMonthly),
      totalCostPerHaAnnual: Math.round(totalCostPerHaAnnual),
      totalCostPerHaMonthly: Math.round((directCostPerHaMonthly + fixedCostPerHaMonthly)),
      netProfitPerHaAnnual: Math.round(netProfitPerHaAnnual),
      netProfitPerHaMonthly: Math.round(netProfitPerHaMonthly),
      profitMargin: Math.round(profitMargin * 10) / 10,
    };
  }, [simBeefPriceKg, simCarryingCapacityUa, simDailyGainGrams, simDirectCostPerAnimalMonth]);

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchFarm = selectedFarmId === 'all' || t.farmId === selectedFarmId;
      const bu = getBusinessUnitForTransaction(t);
      const matchBU = selectedBusinessUnit === 'all' || bu === selectedBusinessUnit;
      return matchFarm && matchBU;
    });
  }, [transactions, selectedFarmId, selectedBusinessUnit]);

  return (
    <div className="space-y-6 pb-24 text-[#1a231e]">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-[#012d1d] via-[#02402a] to-[#012d1d] rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden border border-[#02402a]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffba38]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffba38]/20 border border-[#ffba38]/40 text-[#ffba38] text-xs font-extrabold uppercase tracking-widest mb-3">
              <DollarSign className="w-3.5 h-3.5" /> MÓDULO FINANCIERO
            </div>
            <h1 className="text-2xl lg:text-4xl font-black text-white tracking-tight">
              Análisis Financiero x Hectárea
            </h1>
            <p className="text-sm lg:text-base text-[#c1ecd4]/80 mt-1 max-w-2xl font-medium">
              Indicadores clave de rentabilidad, margen operativo ($/Ha, $/Ha/mes, $/Ha/año) y estados financieros consolidados multipredio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Farm Selector */}
            <div className="relative">
              <select
                value={selectedFarmId}
                onChange={(e) => onSelectFarm(e.target.value)}
                className="bg-[#012d1d]/90 text-white text-xs lg:text-sm font-bold py-2.5 px-4 pr-9 rounded-2xl border border-[#ffba38]/40 hover:border-[#ffba38] focus:outline-none focus:ring-2 focus:ring-[#ffba38] cursor-pointer backdrop-blur-md shadow-sm appearance-none"
              >
                <option value="all" className="bg-[#012d1d] text-white font-bold">
                  🌐 Todas las Fincas (Consolidado)
                </option>
                {farms.map((f) => (
                  <option key={f.profile.id} value={f.profile.id} className="bg-[#012d1d] text-white">
                    🏡 {f.profile.name} ({f.profile.totalAreaHa} Ha)
                  </option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-[#ffba38] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Business Unit Selector */}
            <div className="relative">
              <select
                value={selectedBusinessUnit}
                onChange={(e) => setSelectedBusinessUnit(e.target.value as BusinessUnitId | 'all')}
                className="bg-[#012d1d]/90 text-white text-xs lg:text-sm font-bold py-2.5 px-4 pr-9 rounded-2xl border border-[#ffba38]/40 hover:border-[#ffba38] focus:outline-none focus:ring-2 focus:ring-[#ffba38] cursor-pointer backdrop-blur-md shadow-sm appearance-none"
              >
                <option value="all" className="bg-[#012d1d] text-white font-bold">
                  📊 Todas las Unidades (Consolidado)
                </option>
                {Object.values(BUSINESS_UNITS_CATALOG).map((bu) => (
                  <option key={bu.id} value={bu.id} className="bg-[#012d1d] text-white font-semibold">
                    {bu.label}
                  </option>
                ))}
              </select>
              <Layers3 className="w-4 h-4 text-[#ffba38] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Year Selector */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-[#012d1d]/90 text-white text-xs lg:text-sm font-bold py-2.5 px-4 pr-8 rounded-2xl border border-[#ffba38]/40 hover:border-[#ffba38] focus:outline-none focus:ring-2 focus:ring-[#ffba38] cursor-pointer backdrop-blur-md shadow-sm appearance-none"
              >
                <option value={2026} className="bg-[#012d1d] text-white">Año 2026 (Proyectado)</option>
                <option value={2025} className="bg-[#012d1d] text-white">Año 2025 (Cierre Real)</option>
                <option value={2024} className="bg-[#012d1d] text-white">Año 2024 (Histórico)</option>
              </select>
              <Calendar className="w-4 h-4 text-[#ffba38] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Register Transaction Button */}
            <button
              onClick={onOpenRegisterTransactionModal}
              className="flex items-center gap-2 bg-[#ffba38] hover:bg-[#ffa90a] text-[#012d1d] font-black text-xs lg:text-sm py-2.5 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" /> Nuevo Movimiento
            </button>
          </div>
        </div>

        {/* TOP KPI CARDS OVERVIEW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md p-3.5 lg:p-4 rounded-2xl border border-white/15">
            <div className="text-[10px] lg:text-xs font-bold text-[#c1ecd4] uppercase tracking-wider">
              Ingreso Promedio / Ha / Año
            </div>
            <div className="text-lg lg:text-2xl font-black text-white mt-1">
              {formatCOP(activeAnnualSummary.totalIncomePerHaAnnual)}
            </div>
            <div className="text-[11px] text-[#ffba38] font-bold mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {formatCOP(activeAnnualSummary.totalIncomePerHaMonthlyAvg)} / Ha / mes
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 lg:p-4 rounded-2xl border border-white/15">
            <div className="text-[10px] lg:text-xs font-bold text-[#c1ecd4] uppercase tracking-wider">
              Costo Operativo / Ha / Año
            </div>
            <div className="text-lg lg:text-2xl font-black text-white mt-1">
              {formatCOP(activeAnnualSummary.totalCostsPerHaAnnual)}
            </div>
            <div className="text-[11px] text-red-300 font-bold mt-0.5 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {formatCOP(activeAnnualSummary.totalCostsPerHaMonthlyAvg)} / Ha / mes
            </div>
          </div>

          <div className="bg-[#ffba38]/20 backdrop-blur-md p-3.5 lg:p-4 rounded-2xl border border-[#ffba38]/40">
            <div className="text-[10px] lg:text-xs font-extrabold text-[#ffba38] uppercase tracking-wider">
              Utilidad Neta / Ha / Año
            </div>
            <div className="text-lg lg:text-2xl font-black text-[#ffba38] mt-1">
              {formatCOP(activeAnnualSummary.netProfitPerHaAnnual)}
            </div>
            <div className="text-[11px] text-white font-bold mt-0.5">
              🟢 {formatCOP(activeAnnualSummary.netProfitPerHaMonthlyAvg)} / Ha / mes
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 lg:p-4 rounded-2xl border border-white/15">
            <div className="text-[10px] lg:text-xs font-bold text-[#c1ecd4] uppercase tracking-wider">
              Margen Neto & ROI
            </div>
            <div className="text-lg lg:text-2xl font-black text-white mt-1 flex items-baseline gap-2">
              <span>{activeAnnualSummary.operatingMarginPercentage}%</span>
              <span className="text-xs font-semibold text-[#ffba38]">ROI {activeAnnualSummary.roiPercentage}%</span>
            </div>
            <div className="text-[11px] text-[#c1ecd4]/80 font-semibold mt-0.5">
              Área Evaluada: {currentAreaHa} Ha
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#fffde7] rounded-2xl border border-[#ffe066]/60 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'dashboard'
              ? 'bg-[#012d1d] text-white shadow-md'
              : 'text-[#414844] hover:bg-[#fff3bf] hover:text-[#012d1d]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#ffba38]" /> Resumen General
        </button>

        <button
          onClick={() => setActiveSubTab('business_units')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'business_units'
              ? 'bg-[#012d1d] text-white shadow-md'
              : 'text-[#414844] hover:bg-[#fff3bf] hover:text-[#012d1d]'
          }`}
        >
          <Layers3 className="w-4 h-4 text-[#ffba38]" /> Unidades de Negocio
        </button>

        <button
          onClick={() => setActiveSubTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'monthly'
              ? 'bg-[#012d1d] text-white shadow-md'
              : 'text-[#414844] hover:bg-[#fff3bf] hover:text-[#012d1d]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#ffba38]" /> Análisis Mensual ($/Ha/mes)
        </button>

        <button
          onClick={() => setActiveSubTab('annual')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'annual'
              ? 'bg-[#012d1d] text-white shadow-md'
              : 'text-[#414844] hover:bg-[#fff3bf] hover:text-[#012d1d]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#ffba38]" /> Análisis Anual ($/Ha/año)
        </button>

        <button
          onClick={() => setActiveSubTab('consolidated')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'consolidated'
              ? 'bg-[#012d1d] text-white shadow-md'
              : 'text-[#414844] hover:bg-[#fff3bf] hover:text-[#012d1d]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#ffba38]" /> Consolidado Multi-Predio
        </button>

        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'simulator'
              ? 'bg-[#012d1d] text-white shadow-md'
              : 'text-[#414844] hover:bg-[#fff3bf] hover:text-[#012d1d]'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#ffba38]" /> Simulador de Rentabilidad
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ledger'
              ? 'bg-[#012d1d] text-white shadow-md'
              : 'text-[#414844] hover:bg-[#fff3bf] hover:text-[#012d1d]'
          }`}
        >
          <DollarSign className="w-4 h-4 text-[#ffba38]" /> Libro Transaccional ({filteredTransactions.length})
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 1: DASHBOARD / RESUMEN GENERAL */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend $/Ha Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-lg text-[#012d1d] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#ffba38]" />
                    Evolución Mensual del Margen Neto por Hectárea
                  </h3>
                  <p className="text-xs text-[#717973] font-medium">
                    Comportamiento de Ingresos vs Costos ($/Ha/mes) durante el año {selectedYear}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-[#fffde7] text-[#012d1d] rounded-lg border border-[#ffe066]">
                  {currentAreaHa} Hectáreas
                </span>
              </div>

              <div className="h-72 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="monthName" tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        formatCOP(Number(value)) + ' / Ha',
                        name === 'totalIncomePerHa' ? 'Ingreso/Ha' : name === 'netProfitPerHa' ? 'Utilidad/Ha' : 'Costo/Ha',
                      ]}
                      contentStyle={{ borderRadius: '16px', backgroundColor: '#012d1d', color: '#fff', border: 'none' }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs font-bold text-[#334139]">
                          {value === 'totalIncomePerHa' ? 'Ingreso/Ha' : value === 'netProfitPerHa' ? 'Utilidad Neta/Ha' : 'Costo Total/Ha'}
                        </span>
                      )}
                    />
                    <Bar dataKey="totalIncomePerHa" name="totalIncomePerHa" fill="#2b8a3e" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="netProfitPerHa" name="netProfitPerHa" fill="#ffba38" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Breakdown Pie Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60">
              <h3 className="font-black text-lg text-[#012d1d] flex items-center gap-2 mb-1">
                <PieIcon className="w-5 h-5 text-[#e03131]" />
                Estructura de Egresos por Hectárea
              </h3>
              <p className="text-xs text-[#717973] font-medium mb-4">
                Distribución porcentual de costos por rubro
              </p>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatCOP(Number(val))}
                      contentStyle={{ borderRadius: '12px', backgroundColor: '#012d1d', color: '#fff' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
                {expenseCategoryData.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold text-[#334139] truncate max-w-[150px]">{cat.name}</span>
                    </div>
                    <span className="font-extrabold text-[#012d1d]">{formatCOP(cat.perHa)}/Ha</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Unit Cost & Production Productivity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#fffde7] rounded-3xl p-5 border border-[#ffe066] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#012d1d] uppercase tracking-wider">Costo por Kilo Producido</span>
                <Scale className="w-4 h-4 text-[#2b8a3e]" />
              </div>
              <div className="text-2xl font-black text-[#012d1d] mt-2">
                {formatCOP(activeAnnualSummary.costPerKgAvg)} <span className="text-xs font-semibold text-[#717973]">/ kg carne</span>
              </div>
              <p className="text-xs text-[#717973] font-medium mt-1">
                Kilos Totales Producidos: <strong className="text-[#012d1d]">{activeAnnualSummary.producedKgAnnual.toLocaleString('es-CO')} kg</strong>
              </p>
            </div>

            <div className="bg-[#fffde7] rounded-3xl p-5 border border-[#ffe066] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#012d1d] uppercase tracking-wider">Carga Animal Promedio</span>
                <Layers className="w-4 h-4 text-[#ffba38]" />
              </div>
              <div className="text-2xl font-black text-[#012d1d] mt-2">
                {activeAnnualSummary.avgCarryingCapacityUaHa} <span className="text-xs font-semibold text-[#717973]">UA / Hectárea</span>
              </div>
              <p className="text-xs text-[#717973] font-medium mt-1">
                Equivalente a <strong className="text-[#012d1d]">{(activeAnnualSummary.avgCarryingCapacityUaHa * 450).toFixed(0)} kg</strong> de biomasa ganadera/Ha.
              </p>
            </div>

            <div className="bg-[#fffde7] rounded-3xl p-5 border border-[#ffe066] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#012d1d] uppercase tracking-wider">Productividad en Carne</span>
                <TrendingUp className="w-4 h-4 text-[#0077b6]" />
              </div>
              <div className="text-2xl font-black text-[#012d1d] mt-2">
                {Math.round(activeAnnualSummary.producedKgAnnual / currentAreaHa)} <span className="text-xs font-semibold text-[#717973]">kg / Ha / año</span>
              </div>
              <p className="text-xs text-[#717973] font-medium mt-1">
                Rendimiento de conversión de forraje a carne por Hectárea.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 2: UNIDADES DE NEGOCIO (SEGMENTACIÓN FINANCIERA) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'business_units' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7e22ce]/10 text-[#7e22ce] text-xs font-black uppercase mb-2">
                  <Layers3 className="w-3.5 h-3.5" /> SEGMENTACIÓN POR UNIDADES DE NEGOCIO
                </div>
                <h3 className="font-black text-2xl text-[#012d1d]">
                  Rendimiento Comparativo por Línea de Negocio
                </h3>
                <p className="text-xs text-[#717973] font-medium mt-1 max-w-3xl">
                  Análisis desglosado de Ingresos, Costos Directos e Imputación de Margen por Hectárea para Lechería, Venta de Genética, Venta de Crías & Levante, Kilo de Ganado Comercial (Ceba), Servicios y Estructura Corporativa.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#fffde7] p-2.5 rounded-2xl border border-[#ffe066]">
                <Sparkles className="w-5 h-5 text-[#ffba38]" />
                <div className="text-xs">
                  <span className="font-extrabold text-[#012d1d] block">Finca Evaluada:</span>
                  <span className="font-bold text-[#2b8a3e]">
                    {selectedFarmId === 'all' ? 'Consolidado General Multi-Predio' : currentFarm?.profile.name} ({currentAreaHa} Ha)
                  </span>
                </div>
              </div>
            </div>

            {/* Business Units Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {businessUnitMetrics.map((bu) => {
                const isSelected = selectedBusinessUnit === bu.id;

                return (
                  <div
                    key={bu.id}
                    className={`rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#012d1d] text-white border-[#ffba38] shadow-xl ring-2 ring-[#ffba38]/50'
                        : 'bg-white text-[#1a231e] border-slate-200 hover:border-[#ffba38]/60 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="p-2.5 rounded-2xl"
                            style={{
                              backgroundColor: isSelected ? '#ffba38' : bu.badgeBg,
                              color: isSelected ? '#012d1d' : bu.badgeText,
                            }}
                          >
                            {renderBUIcon(bu.iconName, 'w-5 h-5')}
                          </div>
                          <div>
                            <h4 className={`font-black text-sm ${isSelected ? 'text-white' : 'text-[#012d1d]'}`}>
                              {bu.label}
                            </h4>
                            <p className={`text-[11px] font-semibold ${isSelected ? 'text-[#c1ecd4]' : 'text-slate-500'}`}>
                              {bu.txCount} transacciones registradas
                            </p>
                          </div>
                        </div>

                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: isSelected ? 'rgba(255,186,56,0.2)' : bu.badgeBg,
                            color: isSelected ? '#ffba38' : bu.badgeText,
                          }}
                        >
                          {bu.shareOfTotalIncome.toFixed(1)}% Ingresos
                        </span>
                      </div>

                      <p className={`text-xs font-medium mb-4 line-clamp-2 ${isSelected ? 'text-white/80' : 'text-slate-600'}`}>
                        {bu.description}
                      </p>

                      {/* Main Financial Metrics */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl mb-4 bg-slate-50/80 border border-slate-100 dark:bg-black/20 dark:border-white/10">
                        <div>
                          <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-[#c1ecd4]' : 'text-slate-500'}`}>
                            Ingreso Total ($)
                          </span>
                          <div className={`text-sm font-black ${isSelected ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            {formatCOP(bu.income)}
                          </div>
                          <span className={`text-[10px] font-semibold ${isSelected ? 'text-white/70' : 'text-slate-600'}`}>
                            {formatCOP(bu.incomePerHa)} / Ha
                          </span>
                        </div>

                        <div>
                          <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-[#c1ecd4]' : 'text-slate-500'}`}>
                            Utilidad Neta ($)
                          </span>
                          <div className={`text-sm font-black ${isSelected ? 'text-[#ffba38]' : bu.netProfit >= 0 ? 'text-[#012d1d]' : 'text-rose-600'}`}>
                            {formatCOP(bu.netProfit)}
                          </div>
                          <span className={`text-[10px] font-semibold ${isSelected ? 'text-white/70' : 'text-slate-600'}`}>
                            {formatCOP(bu.profitPerHa)} / Ha
                          </span>
                        </div>
                      </div>

                      {/* Volumetric / Additional Details */}
                      {(bu.totalHeadcount > 0 || bu.totalKgOrLiters > 0) && (
                        <div className={`text-xs font-semibold px-3 py-1.5 rounded-xl mb-4 flex items-center justify-between ${
                          isSelected ? 'bg-white/10 text-white' : 'bg-[#fffde7] text-[#012d1d] border border-[#ffe066]'
                        }`}>
                          {bu.totalHeadcount > 0 && <span>🐮 {bu.totalHeadcount} cabezas</span>}
                          {bu.totalKgOrLiters > 0 && <span>⚖️ {bu.totalKgOrLiters.toLocaleString('es-CO')} Kg/L</span>}
                        </div>
                      )}
                    </div>

                    {/* Footer Action Button */}
                    <button
                      onClick={() => setSelectedBusinessUnit(isSelected ? 'all' : bu.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#ffba38] text-[#012d1d] hover:bg-[#ffa90a]'
                          : 'bg-[#012d1d] text-white hover:bg-[#02402a]'
                      }`}
                    >
                      {isSelected ? '✓ Filtrando esta Unidad (Click para desfiltrar)' : 'Ver Detalle Transaccional'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparative Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart comparing Income vs Direct Costs vs Net Profit across Business Units */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-lg text-[#012d1d] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#ffba38]" />
                    Comparativo de Ingresos vs Costos Directos por Unidad
                  </h3>
                  <p className="text-xs text-[#717973] font-medium">
                    Valores absolutos ($ COP) de cada línea de negocio en el predio
                  </p>
                </div>
              </div>

              <div className="h-80 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={businessUnitMetrics} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="shortLabel"
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#334155' }}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        formatCOP(Number(value)),
                        name === 'income' ? 'Ingresos Totales' : name === 'directCosts' ? 'Costos Directos' : 'Utilidad Neta',
                      ]}
                      contentStyle={{ borderRadius: '16px', backgroundColor: '#012d1d', color: '#fff', border: 'none' }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs font-bold text-[#334139]">
                          {value === 'income' ? 'Ingresos' : value === 'directCosts' ? 'Costos Directos' : 'Utilidad Neta'}
                        </span>
                      )}
                    />
                    <Bar dataKey="income" name="income" fill="#15803d" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="directCosts" name="directCosts" fill="#e03131" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="netProfit" name="netProfit" fill="#ffba38" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Income Share Pie Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-lg text-[#012d1d] flex items-center gap-2 mb-1">
                  <PieIcon className="w-5 h-5 text-[#7e22ce]" />
                  Participación en Ingresos
                </h3>
                <p className="text-xs text-[#717973] font-medium mb-4">
                  Porcentaje de ingresos brutos según unidad de negocio
                </p>

                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={businessUnitMetrics.filter((b) => b.income > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="income"
                        nameKey="shortLabel"
                      >
                        {businessUnitMetrics.map((entry, index) => (
                          <Cell key={`cell-bu-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => formatCOP(Number(val))}
                        contentStyle={{ borderRadius: '12px', backgroundColor: '#012d1d', color: '#fff' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend list */}
              <div className="space-y-1.5 pt-4 border-t border-slate-100 max-h-36 overflow-y-auto">
                {businessUnitMetrics.map((bu) => (
                  <div key={bu.id} className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bu.color }} />
                      <span>{bu.shortLabel}</span>
                    </div>
                    <span className="font-black text-[#012d1d]">{bu.shareOfTotalIncome.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Segmented Detail Table */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60">
            <h3 className="font-black text-xl text-[#012d1d] mb-4">
              Consolidado de Unidades de Negocio ($/Ha y % Margen)
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-white text-xs font-black uppercase">
                    <th className="p-3.5">Unidad de Negocio</th>
                    <th className="p-3.5 text-right">Ingresos ($)</th>
                    <th className="p-3.5 text-right">Ingreso $/Ha</th>
                    <th className="p-3.5 text-right">Costos Directos ($)</th>
                    <th className="p-3.5 text-right">Costo $/Ha</th>
                    <th className="p-3.5 text-right">Utilidad Neta ($)</th>
                    <th className="p-3.5 text-right">Utilidad $/Ha</th>
                    <th className="p-3.5 text-center">Margen %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#334139]">
                  {businessUnitMetrics.map((bu) => (
                    <tr key={bu.id} className="hover:bg-[#fffde7]/60 transition-colors">
                      <td className="p-3.5 font-black text-[#012d1d]">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: bu.badgeBg, color: bu.badgeText }}
                          >
                            {renderBUIcon(bu.iconName, 'w-4 h-4')}
                          </div>
                          <span>{bu.label}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-black text-emerald-700">{formatCOP(bu.income)}</td>
                      <td className="p-3.5 text-right font-bold text-emerald-800">{formatCOP(bu.incomePerHa)}</td>
                      <td className="p-3.5 text-right font-black text-rose-700">{formatCOP(bu.directCosts)}</td>
                      <td className="p-3.5 text-right font-bold text-rose-800">{formatCOP(bu.costsPerHa)}</td>
                      <td className="p-3.5 text-right font-black text-[#012d1d] bg-[#fffde7]">{formatCOP(bu.netProfit)}</td>
                      <td className="p-3.5 text-right font-black text-emerald-900 bg-emerald-50">{formatCOP(bu.profitPerHa)}</td>
                      <td className="p-3.5 text-center font-black">
                        <span className="px-2.5 py-1 rounded-md bg-[#012d1d] text-[#ffba38]">
                          {bu.marginPercent.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 3: ANÁLISIS MENSUAL DETALLADO */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-black text-xl text-[#012d1d]">
                  Matriz Mensual de Desglose Financiero por Hectárea ({selectedYear})
                </h3>
                <p className="text-xs text-[#717973] font-medium mt-0.5">
                  Valores absolutos ($) y valores normalizados por Hectárea ($/Ha/mes)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#012d1d] bg-[#fffde7] px-3 py-1.5 rounded-xl border border-[#ffe066]">
                  Área Finca: {currentAreaHa} Ha
                </span>
              </div>
            </div>

            {/* Monthly Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-white text-xs font-black uppercase tracking-wider">
                    <th className="p-3.5">Mes</th>
                    <th className="p-3.5 text-right">Ingreso Total ($)</th>
                    <th className="p-3.5 text-right text-[#ffba38]">Ingreso $/Ha</th>
                    <th className="p-3.5 text-right">Costo Directo ($)</th>
                    <th className="p-3.5 text-right text-red-300">Costo $/Ha</th>
                    <th className="p-3.5 text-right">Margen Bruto ($)</th>
                    <th className="p-3.5 text-right text-[#c1ecd4]">Utilidad $/Ha</th>
                    <th className="p-3.5 text-center">Costo/Kg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#334139]">
                  {monthlyData.map((m, idx) => (
                    <tr key={idx} className="hover:bg-[#fffde7]/60 transition-colors">
                      <td className="p-3.5 font-black text-[#012d1d]">{m.monthName} {selectedYear}</td>
                      <td className="p-3.5 text-right font-extrabold text-emerald-700">{formatCOP(m.totalIncome)}</td>
                      <td className="p-3.5 text-right font-black text-[#012d1d] bg-emerald-50/50">{formatCOP(m.totalIncomePerHa)}</td>
                      <td className="p-3.5 text-right text-rose-700 font-bold">{formatCOP(m.totalDirectCosts)}</td>
                      <td className="p-3.5 text-right font-bold text-rose-800 bg-rose-50/50">{formatCOP(m.totalDirectCostsPerHa)}</td>
                      <td className="p-3.5 text-right font-black text-[#012d1d]">{formatCOP(m.grossMargin)}</td>
                      <td className="p-3.5 text-right font-black text-[#012d1d] bg-[#fffde7]">{formatCOP(m.netProfitPerHa)}</td>
                      <td className="p-3.5 text-center font-bold text-slate-600">
                        {m.costPerKgProduced > 0 ? formatCOP(m.costPerKgProduced) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#012d1d]/10 text-[#012d1d] font-black text-xs uppercase border-t-2 border-[#012d1d]">
                    <td className="p-3.5">PROMEDIO / TOTAL ANUAL</td>
                    <td className="p-3.5 text-right">{formatCOP(activeAnnualSummary.totalIncomeAnnual)}</td>
                    <td className="p-3.5 text-right text-[#012d1d] bg-[#ffba38]/20">{formatCOP(activeAnnualSummary.totalIncomePerHaMonthlyAvg)}/mes</td>
                    <td className="p-3.5 text-right">{formatCOP(activeAnnualSummary.totalCostsAnnual)}</td>
                    <td className="p-3.5 text-right text-rose-800">{formatCOP(activeAnnualSummary.totalCostsPerHaMonthlyAvg)}/mes</td>
                    <td className="p-3.5 text-right">{formatCOP(activeAnnualSummary.netProfitAnnual)}</td>
                    <td className="p-3.5 text-right bg-[#ffba38] text-[#012d1d]">{formatCOP(activeAnnualSummary.netProfitPerHaMonthlyAvg)}/mes</td>
                    <td className="p-3.5 text-center">{formatCOP(activeAnnualSummary.costPerKgAvg)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 3: ANÁLISIS ANUAL / INTERANUAL */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'annual' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60">
            <h3 className="font-black text-xl text-[#012d1d] mb-1">
              Comparativo Interanual ($/Ha/año y $/Ha/mes)
            </h3>
            <p className="text-xs text-[#717973] font-medium mb-6">
              Evolución multianual de rentabilidad y retorno por Hectárea (2024 - 2026)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INITIAL_ANNUAL_SUMMARIES.filter((s) => selectedFarmId === 'all' || s.farmId === selectedFarmId).map((s) => (
                <div
                  key={`${s.farmId}-${s.year}`}
                  className={`rounded-3xl p-6 border transition-all ${
                    s.year === selectedYear
                      ? 'bg-gradient-to-br from-[#012d1d] to-[#02402a] text-white border-[#012d1d] shadow-lg scale-[1.02]'
                      : 'bg-[#fffde7]/60 text-[#1a231e] border-[#ffe066] hover:bg-[#fff3bf]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 mb-4 border-current/20">
                    <div>
                      <span className="text-2xl font-black">{s.year}</span>
                      <span className="block text-xs opacity-80 font-semibold">{s.farmName}</span>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${s.year === selectedYear ? 'bg-[#ffba38] text-[#012d1d]' : 'bg-[#012d1d] text-white'}`}>
                      {s.totalAreaHa} Ha
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="opacity-80 font-medium">Ingreso / Ha / Año:</span>
                      <strong className="font-black text-emerald-400">{formatCOP(s.totalIncomePerHaAnnual)}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-80 font-medium">Costo / Ha / Año:</span>
                      <strong className="font-extrabold text-rose-300">{formatCOP(s.totalCostsPerHaAnnual)}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-current/20">
                      <span className="font-extrabold">Utilidad / Ha / Año:</span>
                      <strong className="font-black text-lg text-[#ffba38]">{formatCOP(s.netProfitPerHaAnnual)}</strong>
                    </div>
                    <div className="flex justify-between items-center bg-black/10 p-2.5 rounded-xl">
                      <span className="text-xs font-semibold">Promedio Mensual / Ha:</span>
                      <strong className="text-sm font-black">{formatCOP(s.netProfitPerHaMonthlyAvg)}/mes</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center pt-1 text-xs">
                      <div className="bg-white/10 p-2 rounded-lg">
                        <span className="block text-[10px] opacity-75 uppercase font-bold">Margen Operativo</span>
                        <span className="font-black text-sm">{s.operatingMarginPercentage}%</span>
                      </div>
                      <div className="bg-white/10 p-2 rounded-lg">
                        <span className="block text-[10px] opacity-75 uppercase font-bold">ROI Estimado</span>
                        <span className="font-black text-sm">{s.roiPercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 4: CONSOLIDADO MULTI-PREDIO */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'consolidated' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-xl text-[#012d1d] flex items-center gap-2">
                  <Layers className="w-6 h-6 text-[#ffba38]" />
                  Informe Consolidado Multi-Predio ({INITIAL_CONSOLIDATED_REPORT.combinedAreaHa} Ha Totales)
                </h3>
                <p className="text-xs text-[#717973] font-medium">
                  Análisis comparativo de desempeño económico por Hectárea entre diferentes fincas del grupo
                </p>
              </div>
              <span className="text-xs font-black px-3 py-1.5 bg-[#012d1d] text-white rounded-xl shadow-xs">
                {INITIAL_CONSOLIDATED_REPORT.totalFarmsCount} Fincas Evaluadas
              </span>
            </div>

            {/* Consolidated Summary Banner */}
            <div className="bg-gradient-to-r from-[#012d1d] to-[#02402a] text-white p-6 rounded-2xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 border border-[#012d1d]">
              <div>
                <span className="text-xs font-bold text-[#c1ecd4] uppercase tracking-wider">Ingreso Consolidado / Ha</span>
                <div className="text-2xl font-black text-white mt-1">
                  {formatCOP(INITIAL_CONSOLIDATED_REPORT.totalIncomePerHaAnnualAvg)} <span className="text-xs text-[#c1ecd4]">/ Ha / año</span>
                </div>
                <span className="text-xs font-semibold text-[#ffba38]">
                  {formatCOP(INITIAL_CONSOLIDATED_REPORT.totalIncomePerHaMonthlyAvg)} / Ha / mes
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-[#c1ecd4] uppercase tracking-wider">Costo Consolidado / Ha</span>
                <div className="text-2xl font-black text-white mt-1">
                  {formatCOP(INITIAL_CONSOLIDATED_REPORT.totalCostsPerHaAnnualAvg)} <span className="text-xs text-[#c1ecd4]">/ Ha / año</span>
                </div>
                <span className="text-xs font-semibold text-rose-300">
                  {formatCOP(INITIAL_CONSOLIDATED_REPORT.totalCostsPerHaMonthlyAvg)} / Ha / mes
                </span>
              </div>

              <div>
                <span className="text-xs font-extrabold text-[#ffba38] uppercase tracking-wider">Utilidad Neta Consolidada</span>
                <div className="text-2xl font-black text-[#ffba38] mt-1">
                  {formatCOP(INITIAL_CONSOLIDATED_REPORT.netProfitConsolidated)}
                </div>
                <span className="text-xs font-extrabold text-white">
                  🟢 {formatCOP(INITIAL_CONSOLIDATED_REPORT.netProfitPerHaMonthlyAvg)} / Ha / mes
                </span>
              </div>
            </div>

            {/* Multi-Farm Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-white text-xs font-black uppercase">
                    <th className="p-3.5">Finca / Predio</th>
                    <th className="p-3.5">Sistema Productivo</th>
                    <th className="p-3.5 text-center">Área (Ha)</th>
                    <th className="p-3.5 text-right">Ingreso $/Ha/año</th>
                    <th className="p-3.5 text-right">Costo $/Ha/año</th>
                    <th className="p-3.5 text-right text-[#ffba38]">Utilidad $/Ha/año</th>
                    <th className="p-3.5 text-right text-[#c1ecd4]">Utilidad $/Ha/mes</th>
                    <th className="p-3.5 text-center">Margen %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#334139]">
                  {INITIAL_CONSOLIDATED_REPORT.farmComparisons.map((fc, idx) => (
                    <tr key={idx} className="hover:bg-[#fffde7]/60 transition-colors">
                      <td className="p-3.5 font-black text-[#012d1d] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#2b8a3e]" />
                        {fc.farmName}
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">{fc.productionType}</td>
                      <td className="p-3.5 text-center font-extrabold text-[#012d1d]">{fc.areaHa} Ha</td>
                      <td className="p-3.5 text-right font-bold text-emerald-700">{formatCOP(fc.incomePerHaAnnual)}</td>
                      <td className="p-3.5 text-right font-bold text-rose-700">{formatCOP(fc.costsPerHaAnnual)}</td>
                      <td className="p-3.5 text-right font-black text-[#012d1d] bg-[#fffde7]">{formatCOP(fc.netProfitPerHaAnnual)}</td>
                      <td className="p-3.5 text-right font-black text-emerald-800 bg-emerald-50">{formatCOP(fc.netProfitPerHaMonthly)}</td>
                      <td className="p-3.5 text-center font-black text-[#012d1d]">
                        <span className="px-2 py-0.5 rounded-md bg-[#012d1d] text-[#ffba38]">
                          {fc.profitMarginPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 5: SIMULADOR DE RENTABILIDAD Y SENSIBILIDAD */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'simulator' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffba38]/20 text-[#012d1d] font-black text-xs uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#ffba38]" /> SIMULADOR "WHAT-IF" SENSIBILIDAD FINANCIERA
            </div>
            <h3 className="font-black text-2xl text-[#012d1d]">
              Proyección de Impacto por Hectárea
            </h3>
            <p className="text-xs text-[#717973] font-medium mt-1">
              Ajusta las variables operativas (precio del kilo, carga animal UA/Ha, ganancia de peso y costo de suplementación) para simular el retorno $/Ha/mes y $/Ha/año en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Controls Side */}
            <div className="space-y-5 bg-[#fffde7] p-6 rounded-3xl border border-[#ffe066]">
              <h4 className="font-black text-sm text-[#012d1d] uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#2b8a3e]" />
                Parámetros de Entrada
              </h4>

              {/* Slider 1: Precio Kilo Carne */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#012d1d]">
                  <span>Precio de Venta ($ / kg carne en pie):</span>
                  <span className="font-black text-sm text-[#2b8a3e]">{formatCOP(simBeefPriceKg)} / kg</span>
                </div>
                <input
                  type="range"
                  min={7000}
                  max={13000}
                  step={100}
                  value={simBeefPriceKg}
                  onChange={(e) => setSimBeefPriceKg(Number(e.target.value))}
                  className="w-full accent-[#012d1d] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#717973] font-semibold mt-1">
                  <span>$7,000/kg</span>
                  <span>$10,000/kg</span>
                  <span>$13,000/kg</span>
                </div>
              </div>

              {/* Slider 2: Carga Animal UA/Ha */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#012d1d]">
                  <span>Carga Animal Soportada (UA / Ha):</span>
                  <span className="font-black text-sm text-[#012d1d]">{simCarryingCapacityUa} UA / Ha</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={4.0}
                  step={0.1}
                  value={simCarryingCapacityUa}
                  onChange={(e) => setSimCarryingCapacityUa(Number(e.target.value))}
                  className="w-full accent-[#012d1d] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#717973] font-semibold mt-1">
                  <span>1.0 UA (Extensivo)</span>
                  <span>2.5 UA (Pastoreo Rotacional)</span>
                  <span>4.0 UA (Riego + Voisin)</span>
                </div>
              </div>

              {/* Slider 3: Ganancia Diaria de Peso (GDP) */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#012d1d]">
                  <span>Ganancia Diaria de Peso (GDP):</span>
                  <span className="font-black text-sm text-[#0077b6]">{simDailyGainGrams} g / animal / día</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1000}
                  step={25}
                  value={simDailyGainGrams}
                  onChange={(e) => setSimDailyGainGrams(Number(e.target.value))}
                  className="w-full accent-[#012d1d] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#717973] font-semibold mt-1">
                  <span>300 g/día</span>
                  <span>650 g/día</span>
                  <span>1,000 g/día</span>
                </div>
              </div>

              {/* Slider 4: Costo Directo por Animal/Mes */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#012d1d]">
                  <span>Inversión Directa por Animal (Sales, Sanidad, Suplemento/mes):</span>
                  <span className="font-black text-sm text-rose-700">{formatCOP(simDirectCostPerAnimalMonth)}</span>
                </div>
                <input
                  type="range"
                  min={30000}
                  max={150000}
                  step={5000}
                  value={simDirectCostPerAnimalMonth}
                  onChange={(e) => setSimDirectCostPerAnimalMonth(Number(e.target.value))}
                  className="w-full accent-[#012d1d] cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#717973] font-semibold mt-1">
                  <span>$30,000/mes</span>
                  <span>$80,000/mes</span>
                  <span>$150,000/mes</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Results Card */}
            <div className="bg-gradient-to-br from-[#012d1d] via-[#02402a] to-[#012d1d] text-white p-6 rounded-3xl border border-[#02402a] shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-extrabold text-[#ffba38] uppercase tracking-widest">
                  PROYECCIÓN SIMULADA RESULTADOS
                </span>
                <h4 className="text-xl font-black text-white mt-1">
                  Retorno Estimado por Hectárea
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-[#c1ecd4] uppercase">Producción de Carne</span>
                  <div className="text-xl font-black text-white mt-1">
                    {simResults.totalGainedKgPerHaAnnual} <span className="text-xs text-[#c1ecd4]">kg / Ha / año</span>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-[#c1ecd4] uppercase">Ingreso Bruto / Ha</span>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {formatCOP(simResults.grossIncomePerHaAnnual)}
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-[#c1ecd4] uppercase">Costos Totales / Ha</span>
                  <div className="text-xl font-black text-rose-300 mt-1">
                    {formatCOP(simResults.totalCostPerHaAnnual)}
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-[#c1ecd4] uppercase">Margen de Ganancia</span>
                  <div className="text-xl font-black text-[#ffba38] mt-1">
                    {simResults.profitMargin}%
                  </div>
                </div>
              </div>

              {/* Big Highlighted Monthly Utility */}
              <div className="bg-[#ffba38] text-[#012d1d] p-5 rounded-2xl shadow-lg">
                <div className="text-xs font-black uppercase tracking-wider opacity-90">
                  UTILIDAD NETA RESULTANTE POR HECTÁREA / MES
                </div>
                <div className="text-3xl font-black mt-1">
                  {formatCOP(simResults.netProfitPerHaMonthly)} <span className="text-sm font-extrabold">/ Ha / mes</span>
                </div>
                <div className="text-xs font-extrabold mt-1 text-[#012d1d]/80">
                  Equivalente a {formatCOP(simResults.netProfitPerHaAnnual)} / Ha / año
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 6: LIBRO TRANSACCIONAL */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe066]/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-black text-xl text-[#012d1d]">
                  Historial de Movimientos Financieros
                </h3>
                <p className="text-xs text-[#717973] font-medium mt-0.5">
                  Registro detallado de ingresos y egresos con imputación a fincas y hectáreas afectadas
                </p>
              </div>

              <button
                onClick={onOpenRegisterTransactionModal}
                className="flex items-center gap-2 bg-[#012d1d] text-white hover:bg-[#02402a] font-bold text-xs py-2.5 px-4 rounded-2xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#ffba38]" /> Registrar Nuevo Movimiento
              </button>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-white text-xs font-black uppercase">
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Finca</th>
                    <th className="p-3.5">Unidad de Negocio</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Categoría / Rubro</th>
                    <th className="p-3.5">Descripción</th>
                    <th className="p-3.5 text-right">Monto ($)</th>
                    <th className="p-3.5 text-right">Monto / Ha</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#334139]">
                  {filteredTransactions.map((t) => {
                    const area = t.affectedAreaHa || 120;
                    const perHa = t.amount / area;
                    const isIncome = t.type === 'ingreso';
                    const buKey = getBusinessUnitForTransaction(t);
                    const buObj = BUSINESS_UNITS_CATALOG[buKey];

                    return (
                      <tr key={t.id} className="hover:bg-[#fffde7]/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-600 whitespace-nowrap">{t.date}</td>
                        <td className="p-3.5 font-extrabold text-[#012d1d]">{t.farmName}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          {buObj && (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase"
                              style={{ backgroundColor: buObj.badgeBg, color: buObj.badgeText }}
                            >
                              {renderBUIcon(buObj.iconName, 'w-3.5 h-3.5')}
                              {buObj.shortLabel}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {isIncome
                            ? INCOME_CATEGORY_LABELS[t.category as IncomeCategory]?.label || t.category
                            : EXPENSE_CATEGORY_LABELS[t.category as ExpenseCategory]?.label || t.category}
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium max-w-xs truncate">{t.description}</td>
                        <td className={`p-3.5 text-right font-black ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isIncome ? '+' : '-'}{formatCOP(t.amount)}
                        </td>
                        <td className="p-3.5 text-right font-extrabold text-[#012d1d]">
                          {formatCOP(perHa)} / Ha
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar movimiento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 text-xs font-semibold">
                        No hay movimientos registrados para el filtro seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
