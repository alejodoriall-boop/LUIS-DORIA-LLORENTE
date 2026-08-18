import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  Truck,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Flame,
  Calculator,
  ArrowUpRight,
  BadgePercent,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Tag,
} from 'lucide-react';
import {
  FarmDataPackage,
  LotRecord,
  MasterTraceabilityAnimal,
  LivestockSaleRecord,
  SaleReasonType,
  SaleSettlementMode,
} from '../types';
import {
  SALE_REASON_LABELS,
  SETTLEMENT_MODE_LABELS,
  DESTINATION_TYPE_LABELS,
} from '../data/mockSalesData';

interface SalesManagementViewProps {
  farms: FarmDataPackage[];
  currentFarmId: string;
  onSelectFarm: (farmId: string) => void;
  lots: LotRecord[];
  salesRecords: LivestockSaleRecord[];
  onOpenRegisterSaleModal: () => void;
}

export const SalesManagementView: React.FC<SalesManagementViewProps> = ({
  farms,
  currentFarmId,
  onSelectFarm,
  lots,
  salesRecords,
  onOpenRegisterSaleModal,
}) => {
  const [activeTab, setActiveTab] = useState<
    'despachos' | 'libro_salidas' | 'analisis_economico' | 'simulador_venta'
  >('despachos');

  const [selectedFarmFilter, setSelectedFarmFilter] = useState<string>('all');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [selectedSaleForModal, setSelectedSaleForModal] = useState<LivestockSaleRecord | null>(null);

  // Simulator State
  const [simLotId, setSimLotId] = useState<string>(lots[0]?.id || '');
  const [simPriceKg, setSimPriceKg] = useState<number>(9200);
  const [simShrinkagePct, setSimShrinkagePct] = useState<number>(3.5);
  const [simCarcassYieldPct, setSimCarcassYieldPct] = useState<number>(55.5);
  const [simFreight, setSimFreight] = useState<number>(600000);
  const [simRetefuentePct, setSimRetefuentePct] = useState<number>(1.5);
  const [simFomentoPct, setSimFomentoPct] = useState<number>(0.75);

  // Format COP
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter sales
  const filteredSales = useMemo(() => {
    return salesRecords.filter((sale) => {
      if (selectedFarmFilter !== 'all' && sale.farmId !== selectedFarmFilter) return false;
      if (selectedReasonFilter !== 'all' && sale.saleReason !== selectedReasonFilter) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchBuyer = sale.buyerName.toLowerCase().includes(query);
        const matchGuide = sale.icaGuideNumber.toLowerCase().includes(query);
        const matchInvoice = (sale.invoiceNumber || '').toLowerCase().includes(query);
        const matchLot = (sale.lotName || '').toLowerCase().includes(query);
        const matchCode = sale.saleCode.toLowerCase().includes(query);
        if (!matchBuyer && !matchGuide && !matchInvoice && !matchLot && !matchCode) return false;
      }
      return true;
    });
  }, [salesRecords, selectedFarmFilter, selectedReasonFilter, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalHeads = filteredSales.reduce((acc, s) => acc + s.headsCount, 0);
    const totalGrossIncome = filteredSales.reduce((acc, s) => acc + s.economicMetrics.grossSaleIncome, 0);
    const totalDeductions = filteredSales.reduce((acc, s) => acc + s.economicMetrics.totalDeductions, 0);
    const totalNetIncome = filteredSales.reduce((acc, s) => acc + s.economicMetrics.netSaleIncome, 0);
    const totalGrossMargin = filteredSales.reduce((acc, s) => acc + s.economicMetrics.grossMargin, 0);
    const totalNetProfit = filteredSales.reduce((acc, s) => acc + s.economicMetrics.realNetProfitability, 0);
    const totalBiomassKg = filteredSales.reduce((acc, s) => acc + s.zootecnicMetrics.grossWeightKg, 0);
    const totalNetBiomassKg = filteredSales.reduce((acc, s) => acc + s.zootecnicMetrics.netWeightKg, 0);
    const totalUggFreed = filteredSales.reduce((acc, s) => acc + (s.inventoryReleased?.uggCount || 0), 0);

    const avgGDP =
      filteredSales.length > 0
        ? Math.round(
            filteredSales.reduce((acc, s) => acc + s.economicMetrics.dailyWeightGainGrams, 0) /
              filteredSales.length
          )
        : 0;

    const avgDEF =
      filteredSales.length > 0
        ? Math.round(
            filteredSales.reduce((acc, s) => acc + s.economicMetrics.daysInFarm, 0) /
              filteredSales.length
          )
        : 0;

    const totalInvested = filteredSales.reduce(
      (acc, s) => acc + s.economicMetrics.initialCost + s.economicMetrics.totalAccumulatedCosts,
      0
    );
    const overallRoi = totalInvested > 0 ? (totalNetProfit / totalInvested) * 100 : 0;

    return {
      totalHeads,
      totalGrossIncome,
      totalDeductions,
      totalNetIncome,
      totalGrossMargin,
      totalNetProfit,
      totalBiomassKg,
      totalNetBiomassKg,
      totalUggFreed,
      avgGDP,
      avgDEF,
      overallRoi,
      salesCount: filteredSales.length,
    };
  }, [filteredSales]);

  // Selected Lot for simulation
  const simLot = useMemo(() => {
    return lots.find((l) => l.id === simLotId) || lots[0];
  }, [lots, simLotId]);

  // Simulation calculations
  const simCalculations = useMemo(() => {
    if (!simLot) return null;
    const heads = simLot.heads || 1;
    const avgGrossWeight = simLot.currentAvgWeight || 450;
    const totalGross = heads * avgGrossWeight;
    const shrinkageKg = (totalGross * simShrinkagePct) / 100;
    const totalNet = totalGross - shrinkageKg;
    const netAvg = totalNet / heads;
    const carcassWeight = (totalNet * simCarcassYieldPct) / 100;
    const grossIncome = totalNet * simPriceKg;

    const retefuente = Math.round((grossIncome * simRetefuentePct) / 100);
    const fomento = Math.round((grossIncome * simFomentoPct) / 100);
    const deductions = simFreight + retefuente + fomento + 75000;
    const netIncome = grossIncome - deductions;

    const estimatedInitialCost = heads * 2400000;
    const estimatedAccumCosts = heads * 650000;
    const grossMargin = netIncome - estimatedInitialCost;
    const netProfit = grossMargin - estimatedAccumCosts;
    const roi = (estimatedInitialCost + estimatedAccumCosts) > 0 ? (netProfit / (estimatedInitialCost + estimatedAccumCosts)) * 100 : 0;

    return {
      heads,
      avgGrossWeight,
      totalGross,
      shrinkageKg,
      totalNet,
      netAvg,
      carcassWeight,
      grossIncome,
      deductions,
      netIncome,
      grossMargin,
      netProfit,
      roi,
      uggToFree: (totalGross / 450).toFixed(1),
    };
  }, [simLot, simPriceKg, simShrinkagePct, simCarcassYieldPct, simFreight, simRetefuentePct, simFomentoPct]);

  const handlePrintActa = (sale: LivestockSaleRecord) => {
    setSelectedSaleForModal(sale);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Banner / Title Bar */}
      <div className="bg-gradient-to-r from-[#002114] via-[#003822] to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                  Módulo de Ventas & Despachos Oficiales
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-emerald-200/90 font-medium">
                    Formalización de salida definitiva, baja automática en inventario e indicadores zootécnicos.
                  </span>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase">
                    ICA & Invima Conforme
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onOpenRegisterSaleModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-900/50 hover:shadow-emerald-700/60 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nueva Venta</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Total Ingreso Neto */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden space-y-1">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase truncate" title="Ingreso Neto Venta">
              Ingreso Neto
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <span 
            className="text-sm sm:text-base font-black font-mono text-emerald-950 block truncate tracking-tight"
            title={formatCOP(metrics.totalNetIncome)}
          >
            {formatCOP(metrics.totalNetIncome)}
          </span>
          <span className="text-[10px] text-slate-500 truncate block" title={`Bruto: ${formatCOP(metrics.totalGrossIncome)}`}>
            Bruto: {formatCOP(metrics.totalGrossIncome)}
          </span>
        </div>

        {/* Total Cabezas */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden space-y-1">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase truncate" title="Cabezas Despachadas">
              Cabezas Salida
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-sm sm:text-base font-black font-mono text-slate-900 block truncate tracking-tight">
            {metrics.totalHeads} Cab.
          </span>
          <span className="text-[10px] text-slate-500 truncate block" title={`En ${metrics.salesCount} despachos registrados`}>
            {metrics.salesCount} despachos
          </span>
        </div>

        {/* Rentabilidad Neta Real */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden space-y-1">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase truncate" title="Rentabilidad Neta Real">
              Rent. Neta Real
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <span 
            className="text-sm sm:text-base font-black font-mono text-purple-950 block truncate tracking-tight"
            title={formatCOP(metrics.totalNetProfit)}
          >
            {formatCOP(metrics.totalNetProfit)}
          </span>
          <span className="text-[10px] text-purple-700 font-bold truncate block" title={`ROI Promedio: ${metrics.overallRoi.toFixed(1)}%`}>
            ROI Prom: {metrics.overallRoi.toFixed(1)}%
          </span>
        </div>

        {/* Ganancia Diaria GDP */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden space-y-1">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase truncate" title="GDP Promedio de Salida">
              GDP Promedio
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-sm sm:text-base font-black font-mono text-amber-950 block truncate tracking-tight">
            {metrics.avgGDP} g/día
          </span>
          <span className="text-[10px] text-slate-500 truncate block" title={`DEF Promedio: ${metrics.avgDEF} días`}>
            DEF: {metrics.avgDEF} días
          </span>
        </div>

        {/* Biomasa Neta */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden space-y-1">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase truncate" title="Biomasa Neta Liquidada">
              Biomasa Neta
            </span>
            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-sm sm:text-base font-black font-mono text-teal-950 block truncate tracking-tight">
            {(metrics.totalNetBiomassKg / 1000).toFixed(1)} Ton
          </span>
          <span className="text-[10px] text-slate-500 truncate block" title={`${metrics.totalNetBiomassKg.toLocaleString('es-CO')} kg`}>
            {metrics.totalNetBiomassKg.toLocaleString('es-CO')} kg
          </span>
        </div>

        {/* UGG Liberadas */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden space-y-1">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase truncate" title="Carga UGG Liberada">
              Carga Liberada
            </span>
            <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-sm sm:text-base font-black font-mono text-sky-950 block truncate tracking-tight">
            {metrics.totalUggFreed.toFixed(1)} UGG
          </span>
          <span className="text-[10px] text-slate-500 truncate block" title="Cupo de forraje renovado">
            Forraje liberado
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('despachos')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'despachos'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Salidas & Facturación ({filteredSales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('libro_salidas')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'libro_salidas'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Libro de Hato & Despachos ICA</span>
        </button>

        <button
          onClick={() => setActiveTab('analisis_economico')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'analisis_economico'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Análisis Económico & Rentabilidad</span>
        </button>

        <button
          onClick={() => setActiveTab('simulador_venta')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'simulador_venta'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4 text-amber-400" />
          <span>Simulador & Pre-Liquidación de Lotes</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Guía ICA, Comprador, Factura o Lote..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Farm Filter */}
          <select
            value={selectedFarmFilter}
            onChange={(e) => setSelectedFarmFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">Todas las Fincas</option>
            {farms.map((f) => (
              <option key={f.profile.id} value={f.profile.id}>
                🏡 {f.profile.name}
              </option>
            ))}
          </select>

          {/* Reason Filter */}
          <select
            value={selectedReasonFilter}
            onChange={(e) => setSelectedReasonFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">Todos los Motivos de Venta</option>
            {(Object.keys(SALE_REASON_LABELS) as SaleReasonType[]).map((key) => (
              <option key={key} value={key}>
                {SALE_REASON_LABELS[key].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LISTADO DE SALIDAS & FACTURACIÓN */}
      {/* ========================================================= */}
      {activeTab === 'despachos' && (
        <div className="space-y-3">
          {filteredSales.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase">
                No se encontraron registros de venta
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No hay ventas registradas que coincidan con los filtros seleccionados. Registre una nueva venta para actualizar el balance e inventario.
              </p>
              <button
                onClick={onOpenRegisterSaleModal}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar Venta Ahora
              </button>
            </div>
          ) : (
            filteredSales.map((sale) => {
              const isExpanded = expandedSaleId === sale.id;
              const reasonInfo = SALE_REASON_LABELS[sale.saleReason];

              return (
                <div
                  key={sale.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all overflow-hidden"
                >
                  {/* Card Header Row */}
                  <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-mono font-black text-xs flex flex-col items-center justify-center shrink-0 border border-emerald-200">
                        <span>{sale.headsCount}</span>
                        <span className="text-[8.5px] uppercase font-bold text-emerald-700">Cab.</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900">
                            {sale.saleCode} • {sale.buyerName}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${reasonInfo.color}`}>
                            {reasonInfo.label}
                          </span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {sale.icaGuideNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {sale.saleDate}
                          </span>
                          <span>•</span>
                          <span>🏡 {sale.farmName}</span>
                          <span>•</span>
                          <span>🏷️ {sale.lotName || 'Venta de Lote'}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            Modo: {sale.settlementModeLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-200">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          Ingreso Neto Liquidado
                        </span>
                        <span className="text-base font-black font-mono text-emerald-950 block">
                          {formatCOP(sale.economicMetrics.netSaleIncome)}
                        </span>
                        <span className="text-[10px] text-purple-700 font-bold block">
                          Rent. Neta: {formatCOP(sale.economicMetrics.realNetProfitability)} (ROI {sale.economicMetrics.roiPercent.toFixed(1)}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePrintActa(sale)}
                          title="Imprimir Acta Oficial de Despacho e ICA"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-slate-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'Ocultar' : 'Detalles'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200 bg-white space-y-4 text-xs animate-in fade-in duration-150">
                      {/* 4 Pillars Breakdown Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Zootecnic Summary */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[11px] font-black text-slate-900 uppercase flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-emerald-700" />
                            Biometría & Báscula
                          </span>
                          <div className="space-y-1 font-mono text-[11px] text-slate-700">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Peso Bruto Total:</span>
                              <span className="font-bold">{sale.zootecnicMetrics.grossWeightKg.toLocaleString('es-CO')} kg</span>
                            </div>
                            <div className="flex justify-between text-amber-700">
                              <span>Desbaste ({sale.zootecnicMetrics.shrinkagePercent}%):</span>
                              <span className="font-bold">- {sale.zootecnicMetrics.shrinkageKg.toFixed(1)} kg</span>
                            </div>
                            <div className="flex justify-between text-emerald-900 font-black border-t border-slate-200 pt-1">
                              <span>Peso Neto Liquidado:</span>
                              <span>{sale.zootecnicMetrics.netWeightKg.toFixed(1)} kg</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Promedio Neto / Cab:</span>
                              <span>{(sale.zootecnicMetrics.netWeightKg / sale.headsCount).toFixed(1)} kg</span>
                            </div>
                            {sale.zootecnicMetrics.hotCarcassWeightKg && (
                              <div className="flex justify-between text-blue-800">
                                <span>Peso Canal ({sale.zootecnicMetrics.carcassYieldPercent}%):</span>
                                <span className="font-bold">{sale.zootecnicMetrics.hotCarcassWeightKg.toFixed(1)} kg</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Deductions Breakdown */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[11px] font-black text-slate-900 uppercase flex items-center gap-1.5">
                            <BadgePercent className="w-3.5 h-3.5 text-rose-700" />
                            Deducciones & Impuestos
                          </span>
                          <div className="space-y-1 font-mono text-[11px] text-slate-700">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Flete de Salida:</span>
                              <span>{formatCOP(sale.deductions.freightCost)}</span>
                            </div>
                            {sale.deductions.auctionCommission > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Comisión Subasta ({sale.deductions.auctionCommissionPct}%):</span>
                                <span>{formatCOP(sale.deductions.auctionCommission)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-500">Retefuente ({sale.deductions.withholdingTaxPct}%):</span>
                              <span>{formatCOP(sale.deductions.withholdingTax)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Fomento Ganadero:</span>
                              <span>{formatCOP(sale.deductions.livestockFundFee)}</span>
                            </div>
                            <div className="flex justify-between text-rose-800 font-bold border-t border-slate-200 pt-1">
                              <span>Total Deducciones:</span>
                              <span>- {formatCOP(sale.deductions.totalDeductions)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Performance & Zootechnics */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[11px] font-black text-slate-900 uppercase flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            Rendimiento Zootécnico
                          </span>
                          <div className="space-y-1 font-mono text-[11px] text-slate-700">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Días en Finca (DEF):</span>
                              <span className="font-bold">{sale.economicMetrics.daysInFarm} días</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Ganancia Peso Total:</span>
                              <span className="font-bold">{sale.economicMetrics.totalWeightGainKg.toFixed(1)} kg</span>
                            </div>
                            <div className="flex justify-between text-amber-800 font-black">
                              <span>Ganancia Diaria (GDP):</span>
                              <span>{sale.economicMetrics.dailyWeightGainGrams} g/día</span>
                            </div>
                            <div className="flex justify-between text-sky-800">
                              <span>Carga Liberada:</span>
                              <span className="font-bold">{sale.inventoryReleased?.uggCount} UGG</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Ganancia $/día:</span>
                              <span>{formatCOP(sale.economicMetrics.profitPerDay || 0)}/día</span>
                            </div>
                          </div>
                        </div>

                        {/* Final Profitability */}
                        <div className="bg-emerald-900 text-white p-3.5 rounded-xl border border-emerald-950 space-y-2">
                          <span className="text-[11px] font-black text-emerald-300 uppercase flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-emerald-300" />
                            Resultado Económico
                          </span>
                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between text-emerald-100">
                              <span>Costo Compra Inicial:</span>
                              <span>{formatCOP(sale.economicMetrics.initialCost)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-100">
                              <span>Costos Acumulados:</span>
                              <span>{formatCOP(sale.economicMetrics.totalAccumulatedCosts)}</span>
                            </div>
                            <div className="flex justify-between text-amber-300 font-bold border-t border-emerald-800 pt-1">
                              <span>Margen Bruto:</span>
                              <span>{formatCOP(sale.economicMetrics.grossMargin)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-300 font-black text-xs">
                              <span>Rentabilidad Neta:</span>
                              <span>{formatCOP(sale.economicMetrics.realNetProfitability)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-200">
                              <span>Retorno Inversión:</span>
                              <span className="font-bold">{sale.economicMetrics.roiPercent.toFixed(1)}% ROI</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Manifiesto Individual Animal por Animal */}
                      {sale.animals && sale.animals.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-2">
                              <Tag className="w-4 h-4 text-emerald-700" />
                              Manifiesto Individual de Animales Vendidos ({sale.animals.length} Cabezas)
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 font-bold">
                              Liquidación Individualizada & Trazabilidad
                            </span>
                          </div>

                          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[10px] border-b border-slate-200">
                                <tr>
                                  <th className="p-2.5 text-center w-10">#</th>
                                  <th className="p-2.5">Chapeta / Tag</th>
                                  <th className="p-2.5">Raza & Sexo</th>
                                  <th className="p-2.5 text-right">Peso Entrada</th>
                                  <th className="p-2.5 text-right">Peso Salida Bruto</th>
                                  <th className="p-2.5 text-right">Peso Neto Liq.</th>
                                  <th className="p-2.5 text-right">Ganancia (GDP)</th>
                                  <th className="p-2.5 text-right">Ingreso Neto</th>
                                  <th className="p-2.5 text-right">Rentabilidad Real</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                                {sale.animals.map((animal, aIdx) => (
                                  <tr key={animal.id || aIdx} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-2.5 text-center text-slate-400 font-sans text-xs">
                                      {aIdx + 1}
                                    </td>
                                    <td className="p-2.5 font-bold text-slate-900">
                                      <div className="flex items-center gap-1.5">
                                        <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>{animal.tag}</span>
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-slate-600 font-sans text-xs">
                                      {animal.breed} <span className="capitalize">({animal.sex})</span>
                                    </td>
                                    <td className="p-2.5 text-right text-slate-500">
                                      {animal.entryWeightKg} kg
                                    </td>
                                    <td className="p-2.5 text-right font-bold text-slate-800">
                                      {animal.grossExitWeightKg} kg
                                    </td>
                                    <td className="p-2.5 text-right font-black text-emerald-800">
                                      {animal.netExitWeightKg.toFixed(1)} kg
                                    </td>
                                    <td className="p-2.5 text-right text-amber-800 font-bold">
                                      +{animal.totalWeightGainKg.toFixed(1)} kg ({Math.round(animal.gdpKgDay * 1000)}g/d)
                                    </td>
                                    <td className="p-2.5 text-right text-slate-900 font-bold">
                                      {formatCOP(animal.individualNetIncome)}
                                    </td>
                                    <td className="p-2.5 text-right font-bold text-emerald-700">
                                      {formatCOP(animal.netProfit)} ({animal.roiPercent.toFixed(1)}%)
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Logistic and Traceability footer bar */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-600 text-[11px] gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span>🚛 Transportador: <strong>{sale.transporterName || 'N/A'}</strong> ({sale.truckPlate || 'Sin Placa'})</span>
                          <span>•</span>
                          <span>👤 Despachado por: <strong>{sale.dispatcherName || 'Mayordomo'}</strong></span>
                          <span>•</span>
                          <span>📍 Destino: <strong>{sale.destinationLocation || 'Planta de Beneficio'}</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-emerald-800 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Tiempos de Retiro Verificados
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LIBRO DE HATO & DESPACHOS OFICIALES ICA */}
      {/* ========================================================= */}
      {activeTab === 'libro_salidas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                Libro Oficial de Registro de Bajas y Salidas ICA
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Consolidado legal para inspección sanitaria, auditoría de hato y balance de inventario ganadero.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Libro ICA</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Guía ICA GSMI</th>
                  <th className="p-3">Causa de Salida</th>
                  <th className="p-3">Predio / Lote</th>
                  <th className="p-3 text-center">Cabezas</th>
                  <th className="p-3 text-right">Peso Bruto (kg)</th>
                  <th className="p-3 text-right">Peso Neto (kg)</th>
                  <th className="p-3">Comprador / Destino</th>
                  <th className="p-3">Transportador & Placa</th>
                  <th className="p-3 text-center">Estado Retiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-semibold">{s.saleDate}</td>
                    <td className="p-3 font-mono font-bold text-emerald-900">{s.icaGuideNumber}</td>
                    <td className="p-3">
                      <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full ${SALE_REASON_LABELS[s.saleReason].color}`}>
                        {SALE_REASON_LABELS[s.saleReason].shortLabel}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{s.farmName}</div>
                      <div className="text-[10px] text-slate-500">{s.lotName}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-black">{s.headsCount}</td>
                    <td className="p-3 text-right font-mono">{s.zootecnicMetrics.grossWeightKg.toLocaleString('es-CO')}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-950">
                      {s.zootecnicMetrics.netWeightKg.toLocaleString('es-CO')}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{s.buyerName}</div>
                      <div className="text-[10px] text-slate-500">{s.destinationLocation}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {s.transporterName || 'Directo'} ({s.truckPlate || 'Sin Placa'})
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Conforme
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ANÁLISIS ECONÓMICO & RENTABILIDAD */}
      {/* ========================================================= */}
      {activeTab === 'analisis_economico' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rentabilidad por Tipo de Salida */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                Rentabilidad por Causa de Venta
              </span>

              <div className="space-y-2.5 pt-1">
                {(Object.keys(SALE_REASON_LABELS) as SaleReasonType[]).map((reasonKey) => {
                  const salesOfReason = filteredSales.filter((s) => s.saleReason === reasonKey);
                  const totalProfit = salesOfReason.reduce((acc, s) => acc + s.economicMetrics.realNetProfitability, 0);
                  const heads = salesOfReason.reduce((acc, s) => acc + s.headsCount, 0);
                  const label = SALE_REASON_LABELS[reasonKey];

                  return (
                    <div key={reasonKey} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{label.label}</div>
                        <div className="text-[10px] text-slate-500">{heads} Cabezas • {salesOfReason.length} Despachos</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-emerald-950">{formatCOP(totalProfit)}</div>
                        <div className="text-[9.5px] text-slate-500">Rentabilidad Total</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estructura de Ingresos vs Deducciones */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-emerald-700" />
                Estructura de Deducciones
              </span>

              <div className="space-y-2 pt-1 font-mono text-xs">
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-600">Fletes Ganaderos:</span>
                  <span className="font-bold">
                    {formatCOP(filteredSales.reduce((acc, s) => acc + s.deductions.freightCost, 0))}
                  </span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-600">Retención en la Fuente:</span>
                  <span className="font-bold">
                    {formatCOP(filteredSales.reduce((acc, s) => acc + s.deductions.withholdingTax, 0))}
                  </span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-600">Cuota Fomento FEDEGAN:</span>
                  <span className="font-bold">
                    {formatCOP(filteredSales.reduce((acc, s) => acc + s.deductions.livestockFundFee, 0))}
                  </span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-600">Comisión Subastas:</span>
                  <span className="font-bold">
                    {formatCOP(filteredSales.reduce((acc, s) => acc + s.deductions.auctionCommission, 0))}
                  </span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-600">Báscula y Pesaje:</span>
                  <span className="font-bold">
                    {formatCOP(filteredSales.reduce((acc, s) => acc + s.deductions.weighingCost, 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Eficiencia Zootécnica de Ceba */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                Eficiencia Zootécnica & Tiempos
              </span>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">GDP Promedio Ponderado</span>
                  <span className="text-lg font-black font-mono text-emerald-950">{metrics.avgGDP} g/animal/día</span>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Días en Finca Promedio (DEF)</span>
                  <span className="text-lg font-black font-mono text-blue-950">{metrics.avgDEF} días</span>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">Carga Liberada a Pastoreo</span>
                  <span className="text-lg font-black font-mono text-purple-950">{metrics.totalUggFreed.toFixed(1)} UGG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SIMULADOR & PRE-LIQUIDACIÓN DE LOTES ACTIVOS */}
      {/* ========================================================= */}
      {activeTab === 'simulador_venta' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                Simulador de Liquidación y Salida de Lotes en Finca
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Proyecte el precio de liquidación, desbaste, rendimiento en canal y rentabilidad estimada antes de formalizar la venta.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Inputs */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Seleccionar Lote Activo
                </label>
                <select
                  value={simLotId}
                  onChange={(e) => setSimLotId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900"
                >
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      🏷️ {lot.lotName} ({lot.heads} Cab. • {lot.currentAvgWeight} kg • {lot.category.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Precio $/kg Pie
                  </label>
                  <input
                    type="number"
                    value={simPriceKg}
                    onChange={(e) => setSimPriceKg(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    % Desbaste
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={simShrinkagePct}
                    onChange={(e) => setSimShrinkagePct(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    % Rend. Canal
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={simCarcassYieldPct}
                    onChange={(e) => setSimCarcassYieldPct(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Flete Estimado ($)
                  </label>
                  <input
                    type="number"
                    value={simFreight}
                    onChange={(e) => setSimFreight(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Right Output Dashboard */}
            {simCalculations && (
              <div className="lg:col-span-2 bg-gradient-to-br from-[#002114] to-emerald-950 text-white p-5 rounded-2xl border border-emerald-800/40 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800/50 pb-2">
                  <span className="text-xs font-black uppercase text-emerald-300">
                    Resultado de la Simulación ({simCalculations.heads} Cabezas • {simLot?.lotName})
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Libera {simCalculations.uggToFree} UGG en potrero
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[9.5px] font-bold text-slate-300 uppercase block">Peso Neto Liquidado</span>
                    <span className="text-base font-black font-mono text-white block">
                      {simCalculations.totalNet.toFixed(1)} kg
                    </span>
                    <span className="text-[9.5px] text-slate-400">
                      {simCalculations.netAvg.toFixed(1)} kg/cab
                    </span>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[9.5px] font-bold text-emerald-300 uppercase block">Ingreso Bruto</span>
                    <span className="text-base font-black font-mono text-white block">
                      {formatCOP(simCalculations.grossIncome)}
                    </span>
                    <span className="text-[9.5px] text-emerald-300">
                      Deducciones: {formatCOP(simCalculations.deductions)}
                    </span>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase block">Ingreso Neto</span>
                    <span className="text-base font-black font-mono text-emerald-200 block">
                      {formatCOP(simCalculations.netIncome)}
                    </span>
                    <span className="text-[9.5px] text-emerald-300">
                      {formatCOP(simCalculations.netIncome / simCalculations.heads)}/cab
                    </span>
                  </div>

                  <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/40">
                    <span className="text-[9.5px] font-bold text-emerald-300 uppercase block">Rentabilidad Estimada</span>
                    <span className="text-base font-black font-mono text-emerald-300 block">
                      {formatCOP(simCalculations.netProfit)}
                    </span>
                    <span className="text-[9.5px] text-emerald-200 font-bold">
                      ROI: {simCalculations.roi.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={onOpenRegisterSaleModal}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Formalizar Salida de este Lote
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Official Acta Modal / Section (For window.print) */}
      {selectedSaleForModal && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 z-50 text-black">
          <div className="border-b-2 border-black pb-4 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">
                ACTA OFICIAL DE SALIDA GANADERA & LIQUIDACIÓN COMERCIAL
              </h1>
              <p className="text-xs font-semibold">
                Predio: {selectedSaleForModal.farmName} • Guía Sanitaria ICA: {selectedSaleForModal.icaGuideNumber}
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <div>Código: {selectedSaleForModal.saleCode}</div>
              <div>Fecha: {selectedSaleForModal.saleDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div>
              <p><strong>Comprador:</strong> {selectedSaleForModal.buyerName}</p>
              <p><strong>Doc/NIT:</strong> {selectedSaleForModal.buyerDoc}</p>
              <p><strong>Destino:</strong> {selectedSaleForModal.destinationLocation}</p>
              <p><strong>Causa de Salida:</strong> {selectedSaleForModal.saleReasonLabel}</p>
            </div>
            <div>
              <p><strong>Cabezas:</strong> {selectedSaleForModal.headsCount}</p>
              <p><strong>Peso Bruto Báscula:</strong> {selectedSaleForModal.zootecnicMetrics.grossWeightKg} kg</p>
              <p><strong>Desbaste:</strong> {selectedSaleForModal.zootecnicMetrics.shrinkagePercent}% ({selectedSaleForModal.zootecnicMetrics.shrinkageKg} kg)</p>
              <p><strong>Peso Neto Liquidado:</strong> {selectedSaleForModal.zootecnicMetrics.netWeightKg} kg</p>
            </div>
          </div>

          <div className="border-t border-b border-black py-2 mb-4 font-mono text-xs">
            <div className="flex justify-between">
              <span>Ingreso Bruto Liquidado:</span>
              <span>{formatCOP(selectedSaleForModal.economicMetrics.grossSaleIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Deducciones (Flete, ICA, Retefuente):</span>
              <span>- {formatCOP(selectedSaleForModal.economicMetrics.totalDeductions)}</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-1 border-t border-dashed border-gray-400">
              <span>VALOR NETO A PAGAR:</span>
              <span>{formatCOP(selectedSaleForModal.economicMetrics.netSaleIncome)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 text-xs pt-16 text-center">
            <div className="border-t border-black pt-1">
              Firma Comprador / Receptor
            </div>
            <div className="border-t border-black pt-1">
              Firma Mayordomo / Despachador
            </div>
            <div className="border-t border-black pt-1">
              Firma MVZ / Administrador
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
