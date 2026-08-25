import React, { useState } from 'react';
import {
  FarmDataPackage,
  InventoryItem,
  StockMovement,
  InventoryCategory,
  MovementType,
  CategoryInfo,
} from '../types';
import {
  Warehouse,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  Search,
  Sparkles,
  Wheat,
  Camera,
  Building2,
  Filter,
  History,
  CheckCircle2,
  Syringe,
  Leaf,
  Droplets,
  Wrench,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Tag,
  DollarSign,
  AlertCircle,
  ShieldAlert,
  BarChart2,
  LayoutGrid,
  List,
  Plus,
  Fuel,
  Package,
  Shield,
  Zap,
  Truck,
  Info,
} from 'lucide-react';

interface InventoryViewProps {
  farms: FarmDataPackage[];
  currentFarm: FarmDataPackage;
  selectedFarmId: string;
  onSelectFarm: (id: string) => void;
  inventoryItems: InventoryItem[];
  stockMovements: StockMovement[];
  categories: Record<string, CategoryInfo>;
  onOpenEntryModal: () => void;
  onOpenConsumptionModal: (defaultItemId?: string) => void;
  onOpenCreateCategoryModal: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  farms,
  currentFarm,
  selectedFarmId,
  onSelectFarm,
  inventoryItems,
  stockMovements,
  categories,
  onOpenEntryModal,
  onOpenConsumptionModal,
  onOpenCreateCategoryModal,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAlertsOnly, setFilterAlertsOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter items by selected farm
  const farmFilteredItems = inventoryItems.filter(
    (item) => selectedFarmId === 'all' || item.farmId === selectedFarmId,
  );

  // Critical Low Stock or Expiring items
  const alertItems = farmFilteredItems.filter((item) => {
    const isLowStock = item.currentStock <= item.minStockAlert;
    let isExpiringSoon = false;
    if (item.expirationDate) {
      const exp = new Date(item.expirationDate);
      const now = new Date();
      const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
      if (diffDays <= 60 && diffDays >= 0) isExpiringSoon = true;
    }
    return isLowStock || isExpiringSoon;
  });

  // Filter items by category & search
  const displayedItems = farmFilteredItems.filter((item) => {
    if (filterAlertsOnly) {
      const isLowStock = item.currentStock <= item.minStockAlert;
      if (!isLowStock) return false;
    }
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(query);
      const matchesBrand = item.brand?.toLowerCase().includes(query) || false;
      const matchesSupplier = item.supplierName?.toLowerCase().includes(query) || false;
      return matchesName || matchesBrand || matchesSupplier;
    }
    return true;
  });

  // Filter movements by selected farm
  const displayedMovements = stockMovements.filter(
    (mov) => selectedFarmId === 'all' || mov.farmId === selectedFarmId,
  );

  // Category Icon Renderer
  const renderCategoryIcon = (categoryKey: string) => {
    const catInfo = categories[categoryKey];
    const iconName = catInfo?.iconName;
    const catColor = catInfo?.color || '#012d1d';

    switch (iconName || categoryKey) {
      case 'Sparkles':
      case 'sales_nutricion':
        return <Sparkles className="w-4 h-4 text-[#d97706]" />;
      case 'Wheat':
      case 'concentrados_alimentos':
        return <Wheat className="w-4 h-4 text-[#b45309]" />;
      case 'Syringe':
      case 'salud_veterinaria':
        return <Syringe className="w-4 h-4 text-[#0077b6]" />;
      case 'Leaf':
      case 'agroquimicos':
        return <Leaf className="w-4 h-4 text-[#2d6a4f]" />;
      case 'Droplets':
      case 'Droplet':
      case 'insumos_ordeno':
        return <Droplets className="w-4 h-4 text-[#0284c7]" />;
      case 'Wrench':
      case 'herramientas_equipos':
        return <Wrench className="w-4 h-4 text-[#475569]" />;
      case 'Fuel':
        return <Fuel className="w-4 h-4 text-[#ea580c]" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-[#dc2626]" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-[#7c3aed]" />;
      case 'Truck':
        return <Truck className="w-4 h-4 text-[#0284c7]" />;
      case 'Tag':
        return <Tag className="w-4 h-4 text-[#0d9488]" />;
      default:
        return <Package className="w-4 h-4" style={{ color: catColor }} />;
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. HEADER & FARM SELECTOR */}
      {/* ========================================================================= */}
      <div className="bg-[#0D1A13] text-white rounded-3xl p-6 border-2 border-[#ffba38] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1F6547]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#123F2A] rounded-2xl text-[#ffba38] border border-[#2d6a4f] shadow-md">
              <Warehouse className="w-8 h-8 text-[#ffba38]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono text-[#ffba38] bg-[#123F2A] px-2.5 py-0.5 rounded-full border border-[#2d6a4f]">
                  ALMACÉN & INVENTARIOS
                </span>
                <span className="text-[10px] font-mono text-[#A5B8AC] bg-white/10 px-2 py-0.5 rounded">
                  Control en Celular
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  Bodega e Insumos de Campo
                </h1>
                <div className="group relative inline-flex items-center">
                  <button
                    type="button"
                    className="text-[#a3b8ad] hover:text-[#A5B8AC] transition-colors p-0.5 rounded cursor-pointer"
                    title="Control de Sales Mineralizadas (SLA), Sanidad, Agroquímicos y Facturas"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-72 bg-[#0D1A13] text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl border border-[#2d6a4f] pointer-events-none animate-in fade-in zoom-in-95">
                    Control de Sales Mineralizadas (SLA), Sanidad, Agroquímicos y Facturas
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenEntryModal}
              className="bg-[#D4A94E] hover:bg-[#f5a700] text-white font-black text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PackagePlus className="w-4 h-4 text-white" />
              <span>+ Recepción / Leer Factura</span>
            </button>

            <button
              onClick={() => onOpenConsumptionModal()}
              className="bg-[#d90429] hover:bg-[#a0001e] text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 border border-white/20"
            >
              <PackageMinus className="w-4 h-4 text-white" />
              <span>- Registrar Consumo</span>
            </button>
          </div>
        </div>

        {/* Farm Filter Pills */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-[#A5B8AC] uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Predio:
            </span>

            <button
              onClick={() => onSelectFarm('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedFarmId === 'all'
                  ? 'bg-[#15241C] text-white shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Todas las Fincas ({inventoryItems.length})
            </button>

            {farms.map((farm) => {
              const count = inventoryItems.filter((i) => i.farmId === farm.profile.id).length;
              return (
                <button
                  key={farm.profile.id}
                  onClick={() => onSelectFarm(farm.profile.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedFarmId === farm.profile.id
                      ? 'bg-[#D4A94E] text-white shadow-sm'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {farm.profile.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#A5B8AC] font-mono">
            <span>Ítems Registrados: <strong>{farmFilteredItems.length}</strong></span>
            <span>Alertas: <strong className={alertItems.length > 0 ? 'text-[#ffba38]' : ''}>{alertItems.length}</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CRITICAL ALERT BANNER FOR LOW STOCK (e.g. SAL MINERALIZADA SLA 8%) */}
      {/* ========================================================================= */}
      {alertItems.length > 0 && (
        <div className="bg-[#fff0f0] border-2 border-[#d90429] rounded-3xl p-5 shadow-lg space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between gap-2 border-b border-[#ffb3b3] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#d90429] text-white rounded-xl shadow-xs">
                <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase font-mono text-[#d90429] tracking-wider block">
                  ALERTAS DE REORDEN DE STOCK EN CAMPO
                </span>
                <h3 className="text-sm font-black text-[#700000]">
                  {alertItems.length} {alertItems.length === 1 ? 'producto requiere' : 'productos requieren'} compra o reposición inmediata
                </h3>
              </div>
            </div>

            <button
              onClick={() => setFilterAlertsOnly(!filterAlertsOnly)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                filterAlertsOnly
                  ? 'bg-[#d90429] text-white border-[#d90429]'
                  : 'bg-[#15241C] text-[#d90429] border-[#ff8080] hover:bg-[#ffe5e5]'
              }`}
            >
              {filterAlertsOnly ? 'Ver Todo el Inventario' : 'Filtrar Solo Alertas'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#15241C] p-3.5 rounded-2xl border border-[#ffb3b3] shadow-xs flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                  </div>
                  <span className="text-[11px] text-[#414844] block mt-0.5">
                    Stock: <strong className="text-[#d90429] font-mono text-xs">{item.currentStock} {item.unit}</strong> (Mínimo: {item.minStockAlert})
                  </span>
                  {item.farmName && (
                    <span className="text-[10px] text-[#717973] block font-mono">
                      📍 {item.farmName}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onOpenConsumptionModal(item.id)}
                  className="bg-[#d90429] hover:bg-[#a0001e] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Registrar Usos
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. NAVIGATION TABS: INVENTARIO ACTUAL vs HISTÓRICO DE MOVIMIENTOS */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`py-2.5 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'stock'
                ? 'bg-[#0D1A13] text-white shadow-md'
                : 'bg-[#123F2A]/60 text-[#414844] hover:bg-[#e2efe8]'
            }`}
          >
            <Warehouse className="w-4 h-4 text-[#ffba38]" />
            <span>Inventario de Existencias ({displayedItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('movements')}
            className={`py-2.5 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'movements'
                ? 'bg-[#0D1A13] text-white shadow-md'
                : 'bg-[#123F2A]/60 text-[#414844] hover:bg-[#e2efe8]'
            }`}
          >
            <History className="w-4 h-4 text-[#0077b6]" />
            <span>Movimientos & Auditoría ({displayedMovements.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. STOCK VIEW CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filters, Search & View Toggle */}
          <div className="bg-[#15241C] p-3.5 rounded-3xl border border-white/10 space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-[#717973] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar insumo, marca o sal SLA..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#15241C] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#012d1d]"
                />
              </div>

              {/* View Mode Toggle & Category Filters */}
              <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto overflow-x-auto pb-0.5">
                {/* Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === 'all'
                        ? 'bg-[#0D1A13] text-white'
                        : 'bg-[#15241C] text-[#414844] border border-white/10 hover:bg-[#e8f3ed]'
                    }`}
                  >
                    Todas
                  </button>

                  {Object.entries(categories).map(([key, info]: [string, CategoryInfo]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        selectedCategory === key
                          ? 'bg-[#0D1A13] text-[#ffba38]'
                          : 'bg-[#15241C] text-[#414844] border border-white/10 hover:bg-[#e8f3ed]'
                      }`}
                    >
                      {renderCategoryIcon(key)}
                      <span>{info.label.split('&')[0]}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={onOpenCreateCategoryModal}
                    title="Crear Nueva Categoría"
                    className="px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 bg-[#D4A94E] hover:bg-[#f59e0b] text-white border border-[#d97706]/40 shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+ Categoría</span>
                  </button>
                </div>

                {/* Grid / List Selector Pills */}
                <div className="flex items-center bg-[#15241C] p-0.5 rounded-xl border border-white/10 shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Vista Cuadrícula Compacta"
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      viewMode === 'grid'
                        ? 'bg-[#0D1A13] text-[#ffba38] shadow-xs'
                        : 'text-[#717973] hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px]">Cuadrícula</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="Vista Lista Compacta"
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      viewMode === 'list'
                        ? 'bg-[#0D1A13] text-[#ffba38] shadow-xs'
                        : 'text-[#717973] hover:text-white'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px]">Lista</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid / List Display of Inventory Items */}
          {displayedItems.length === 0 ? (
            <div className="p-10 text-center bg-[#15241C] rounded-3xl border-2 border-dashed border-white/10 space-y-3">
              <Warehouse className="w-10 h-10 text-[#717973] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-white">
                No se encontraron productos en esta categoría o filtro
              </h3>
              <p className="text-xs text-[#717973] max-w-sm mx-auto">
                Usa el botón de "+ Recepción / Leer Factura" para ingresar nuevos insumos al inventario de la finca.
              </p>
              <button
                onClick={onOpenEntryModal}
                className="bg-[#0D1A13] text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                + Ingresar Producto
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* COMPACT GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {displayedItems.map((item) => {
                const categoryInfo = categories[item.category] || {
                  label: item.category,
                  color: '#012d1d',
                  badgeBg: '#f0f4f1',
                };
                const isLowStock = item.currentStock <= item.minStockAlert;
                const isCritical = item.currentStock <= item.minStockAlert / 2;

                const targetStock = item.minStockAlert * 3;
                const pct = Math.min(Math.round((item.currentStock / targetStock) * 100), 100);

                return (
                  <div
                    key={item.id}
                    className={`bg-[#15241C] rounded-2xl border p-3.5 transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between space-y-2.5 relative ${
                      isCritical
                        ? 'border-[#d90429] bg-[#fffbfb]'
                        : isLowStock
                        ? 'border-[#ffba38] bg-[#fffdf5]'
                        : 'border-white/10 hover:border-[#2d6a4f]'
                    }`}
                  >
                    {/* Header Badge */}
                    <div>
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className="text-[8.5px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-md flex items-center gap-1 border truncate max-w-[130px]"
                          style={{
                            backgroundColor: categoryInfo.badgeBg,
                            color: categoryInfo.color,
                            borderColor: categoryInfo.color + '30',
                          }}
                        >
                          {renderCategoryIcon(item.category)}
                          <span className="truncate">{categoryInfo.label.split('&')[0]}</span>
                        </span>

                        {isLowStock ? (
                          <span className="bg-[#d90429] text-white text-[8px] font-black uppercase font-mono px-1.5 py-0.5 rounded-md shrink-0 animate-pulse">
                            {isCritical ? 'CRÍTICO' : 'REORDEN'}
                          </span>
                        ) : (
                          <span className="bg-[#c1ecd4] text-[#002114] text-[8px] font-bold uppercase font-mono px-1.5 py-0.5 rounded-md shrink-0">
                            OK
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-extrabold text-white mt-1.5 leading-tight line-clamp-1">
                        {item.name}
                      </h3>

                      <div className="flex items-center justify-between text-[10px] text-[#717973] mt-0.5">
                        <span>{item.brand ? item.brand : 'Genérico'}</span>
                        {item.farmName && (
                          <span className="font-mono text-[9.5px] text-[#2d6a4f]">📍 {item.farmName}</span>
                        )}
                      </div>
                    </div>

                    {/* Stock Value & Progress Bar */}
                    <div className="bg-[#15241C] p-2 rounded-xl border border-[#e2efe8] space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] font-semibold text-[#414844]">Stock:</span>
                        <span className="text-base font-black font-mono text-white">
                          {item.currentStock} <span className="text-[10px] font-normal text-[#717973]">{item.unit}</span>
                        </span>
                      </div>

                      <div className="w-full bg-[#e2efe8] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            isCritical
                              ? 'bg-[#d90429]'
                              : isLowStock
                              ? 'bg-[#d97706]'
                              : 'bg-[#1F6547]'
                          }`}
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-[#717973] font-mono">
                        <span>Mín: {item.minStockAlert} {item.unit}</span>
                        {item.locationInStore && <span>{item.locationInStore}</span>}
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => onOpenConsumptionModal(item.id)}
                        className="flex-1 bg-[#123F2A]/60 hover:bg-[#d90429] text-white hover:text-white font-bold text-[10.5px] py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <PackageMinus className="w-3 h-3" />
                        <span>Usar</span>
                      </button>

                      <button
                        onClick={onOpenEntryModal}
                        className="bg-[#0D1A13] hover:bg-[#123F2A] text-white font-bold text-[10.5px] py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <PackagePlus className="w-3 h-3 text-[#ffba38]" />
                        <span>+ Ingreso</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* COMPACT LIST VIEW */
            <div className="space-y-2">
              {displayedItems.map((item) => {
                const categoryInfo = categories[item.category] || {
                  label: item.category,
                  color: '#012d1d',
                  badgeBg: '#f0f4f1',
                };
                const isLowStock = item.currentStock <= item.minStockAlert;
                const isCritical = item.currentStock <= item.minStockAlert / 2;

                const targetStock = item.minStockAlert * 3;
                const pct = Math.min(Math.round((item.currentStock / targetStock) * 100), 100);

                return (
                  <div
                    key={item.id}
                    className={`bg-[#15241C] rounded-2xl border p-2.5 sm:p-3 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCritical
                        ? 'border-[#d90429] bg-[#fffbfb]'
                        : isLowStock
                        ? 'border-[#ffba38] bg-[#fffdf5]'
                        : 'border-white/10 hover:border-[#2d6a4f]'
                    }`}
                  >
                    {/* Left Info: Category Icon + Product Name + Farm */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="p-2 rounded-xl shrink-0 border"
                        style={{
                          backgroundColor: categoryInfo.badgeBg,
                          borderColor: categoryInfo.color + '30',
                        }}
                      >
                        {renderCategoryIcon(item.category)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
                            {item.name}
                          </h3>
                          {isLowStock && (
                            <span className="bg-[#d90429] text-white text-[8px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded shrink-0">
                              {isCritical ? 'CRÍTICO' : 'BAJO'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#717973] font-mono mt-0.5">
                          {item.brand && <span>Marca: {item.brand}</span>}
                          {item.farmName && (
                            <span className="text-[#2d6a4f] font-bold">📍 {item.farmName}</span>
                          )}
                          {item.locationInStore && (
                            <span className="hidden sm:inline">📦 {item.locationInStore}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle Info: Stock Meter & Numbers */}
                    <div className="flex items-center gap-3 sm:w-48 shrink-0 bg-[#15241C] p-2 rounded-xl border border-[#e2efe8]">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-baseline justify-between text-[10px]">
                          <span className="text-[#717973]">Stock:</span>
                          <span className="font-extrabold font-mono text-white">
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                        <div className="w-full bg-[#e2efe8] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical
                                ? 'bg-[#d90429]'
                                : isLowStock
                                ? 'bg-[#d97706]'
                                : 'bg-[#1F6547]'
                            }`}
                            style={{ width: `${Math.max(pct, 5)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[9px] font-mono text-[#717973] text-right shrink-0">
                        <span>Mín: {item.minStockAlert}</span>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onOpenConsumptionModal(item.id)}
                        className="bg-[#123F2A]/60 hover:bg-[#d90429] text-white hover:text-white font-bold text-[10px] py-1.5 px-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <PackageMinus className="w-3 h-3" />
                        <span>Descontar</span>
                      </button>

                      <button
                        onClick={onOpenEntryModal}
                        className="bg-[#0D1A13] hover:bg-[#123F2A] text-white font-bold text-[10px] py-1.5 px-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <PackagePlus className="w-3 h-3 text-[#ffba38]" />
                        <span>Recibir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MOVEMENTS & AUDIT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'movements' && (
        <div className="bg-[#15241C] rounded-3xl border-2 border-white/10 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#0077b6]" />
              Bitácora Histórica de Entradas y Salidas
            </h3>
            <span className="text-xs font-mono text-[#717973]">
              Mostrando {displayedMovements.length} registros
            </span>
          </div>

          <div className="divide-y divide-[#eeeeee] overflow-x-auto">
            {displayedMovements.length === 0 ? (
              <p className="p-6 text-center text-xs text-[#717973]">
                No hay movimientos registrados para el filtro seleccionado.
              </p>
            ) : (
              displayedMovements.map((mov) => (
                <div key={mov.id} className="py-3.5 flex items-start justify-between gap-3 min-w-[500px]">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        mov.type === 'entrada'
                          ? 'bg-[#c1ecd4] text-[#002114]'
                          : 'bg-[#ffe5e5] text-[#700000]'
                      }`}
                    >
                      {mov.type === 'entrada' ? (
                        <ArrowDownRight className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-700" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{mov.itemName}</span>
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            mov.type === 'entrada'
                              ? 'bg-[#c1ecd4] text-[#002114]'
                              : 'bg-[#ffe5e5] text-[#700000]'
                          }`}
                        >
                          {mov.type}
                        </span>
                      </div>

                      <p className="text-xs text-[#414844] mt-0.5">
                        {mov.reasonOrDestination}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-[#717973] font-mono mt-1">
                        <span>📅 {mov.date} {mov.time || ''}</span>
                        <span>👤 {mov.registeredBy}</span>
                        {mov.invoiceNumber && (
                          <span className="bg-[#e8f3ed] text-white px-1.5 py-0.2 rounded">
                            Factura: {mov.invoiceNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span
                      className={`text-sm font-black block ${
                        mov.type === 'entrada' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {mov.type === 'entrada' ? '+' : '-'}{mov.quantity} {mov.unit}
                    </span>
                    <span className="text-[10px] text-[#717973] block">
                      Saldo Posterior: {mov.stockAfter}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. AI CAMERA & MOBILE WORKFLOW EXPLANATION CARD */}
      {/* ========================================================================= */}
      <div className="bg-[#0D1A13] text-white rounded-3xl p-6 border-2 border-[#ffba38] shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#123F2A] rounded-2xl text-[#ffba38] border border-[#2d6a4f]">
              <Camera className="w-6 h-6 text-[#ffba38]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase font-mono text-[#ffba38] tracking-widest block">
                TECNOLOGÍA DE CAMPO PARA EL MAYORDOMO
              </span>
              <h3 className="text-lg font-black text-white">
                Recepción con Cámara Celular & Alertas Preventivas
              </h3>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#A5B8AC] leading-relaxed">
          El aplicativo permite al mayordomo o administrador tomar la foto de la factura recibida en la portería de la finca. La inteligencia artificial extrae los bultos de sal mineralizada (SLA), vacunas y garrapaticidas para alimentar el inventario al instante y emitir alertas anticipadas antes de que el stock se agote.
        </p>
      </div>
    </div>
  );
};
