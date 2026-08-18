import React, { useState, useMemo } from 'react';
import {
  BubalineAnimal,
  BubalineBreed,
  BubalineCategory,
  BubalineMilkQualityRecord,
  BubalineReproductionRecord,
  FarmDataPackage,
} from '../types';
import { BuffaloIcon } from './icons/BuffaloIcon';
import {
  Plus,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Scale,
  Building2,
  Droplets,
  HeartPulse,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Waves,
  Sun,
  Award,
  ChevronRight,
  TrendingUp,
  X,
  Stethoscope,
  Activity,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

interface BubalineViewProps {
  bubalineAnimals: BubalineAnimal[];
  onUpdateBubalineAnimals: (list: BubalineAnimal[]) => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  onAddActivity?: (title: string, subtitle: string, metric: string, category: any) => void;
}

export const BubalineView: React.FC<BubalineViewProps> = ({
  bubalineAnimals,
  onUpdateBubalineAnimals,
  farms,
  currentFarmId,
  onAddActivity,
}) => {
  // Navigation subtabs
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'dairy' | 'reproduction' | 'calculator'>('inventory');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreedFilter, setSelectedBreedFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [wallowFilter, setWallowFilter] = useState<'all' | 'with_wallow' | 'without_wallow'>('all');

  // Selected animal detail modal
  const [selectedAnimalDetail, setSelectedAnimalDetail] = useState<BubalineAnimal | null>(null);

  // New Buffalo Animal Modal
  const [isAddAnimalModalOpen, setIsAddAnimalModalOpen] = useState(false);
  const [newEarTag, setNewEarTag] = useState('');
  const [newName, setNewName] = useState('');
  const [newRfid, setNewRfid] = useState('');
  const [newBreed, setNewBreed] = useState<BubalineBreed>('Murrah');
  const [newCategory, setNewCategory] = useState<BubalineCategory>('bufala_produccion');
  const [newSex, setNewSex] = useState<'macho' | 'hembra'>('hembra');
  const [newBirthDate, setNewBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWeightKg, setNewWeightKg] = useState('580');
  const [newPaddock, setNewPaddock] = useState('Potrero 4 (Bajo Húmedo)');
  const [newHasWallow, setNewHasWallow] = useState(true);
  const [newShadePct, setNewShadePct] = useState('40');
  const [newIsMilking, setNewIsMilking] = useState(true);
  const [newDailyMilk, setNewDailyMilk] = useState('9.5');
  const [newReproStatus, setNewReproStatus] = useState<BubalineAnimal['reproductiveStatus']>('vacia');
  const [newLastServiceDate, setNewLastServiceDate] = useState('');
  const [newToxocaraDewormed, setNewToxocaraDewormed] = useState(true);

  // New Milk Batch / Quality Modal
  const [isAddMilkModalOpen, setIsAddMilkModalOpen] = useState(false);
  const [milkTargetAnimalId, setMilkTargetAnimalId] = useState('');
  const [milkDate, setMilkDate] = useState(new Date().toISOString().split('T')[0]);
  const [milkShift, setMilkShift] = useState<'mañana' | 'tarde' | 'unico'>('mañana');
  const [milkLiters, setMilkLiters] = useState('6.5');
  const [milkFatPct, setMilkFatPct] = useState('7.8');
  const [milkProteinPct, setMilkProteinPct] = useState('4.2');
  const [milkSccK, setMilkSccK] = useState('110');

  // Mozzarella Calculator Sandbox State
  const [calcLiters, setCalcLiters] = useState('500');
  const [calcFat, setCalcFat] = useState('7.8');
  const [calcProtein, setCalcProtein] = useState('4.2');
  const [calcBasePriceCop, setCalcBasePriceCop] = useState('3400');

  // Local Milk Records
  const [milkRecords, setMilkRecords] = useState<BubalineMilkQualityRecord[]>([
    {
      id: 'bm-1',
      animalId: 'buf-101',
      animalTag: 'BUF-402',
      animalName: 'Reina Murrah',
      date: '2026-08-18',
      shift: 'mañana',
      liters: 6.2,
      fatPercentage: 7.9,
      proteinPercentage: 4.2,
      totalSolidsPercentage: 17.8,
      sccK: 98,
      estimatedMozzarellaKg: 1.34,
      notes: 'Tanque frío 1',
    },
    {
      id: 'bm-2',
      animalId: 'buf-102',
      animalTag: 'BUF-305',
      animalName: 'Mediterránea Bella',
      date: '2026-08-18',
      shift: 'mañana',
      liters: 5.5,
      fatPercentage: 8.4,
      proteinPercentage: 4.4,
      totalSolidsPercentage: 18.6,
      sccK: 110,
      estimatedMozzarellaKg: 1.25,
      notes: 'Ordeño matutino',
    },
  ]);

  // KPIs Calculations
  const totalCount = bubalineAnimals.length;
  const milkingCount = bubalineAnimals.filter((a) => a.isMilking).length;
  const pregnantCount = bubalineAnimals.filter((a) => a.reproductiveStatus === 'gestante').length;
  const calvesCount = bubalineAnimals.filter((a) => a.category === 'bucerro_lactante' || a.category === 'bucerra_lactante').length;
  
  const avgMilkPerCow = useMemo(() => {
    const milkers = bubalineAnimals.filter((a) => a.isMilking && (a.dailyMilkLiters || 0) > 0);
    if (milkers.length === 0) return 0;
    const sum = milkers.reduce((acc, curr) => acc + (curr.dailyMilkLiters || 0), 0);
    return Number((sum / milkers.length).toFixed(1));
  }, [bubalineAnimals]);

  const avgFatPct = useMemo(() => {
    const milkers = bubalineAnimals.filter((a) => (a.lastFatPercentage || 0) > 0);
    if (milkers.length === 0) return 7.8;
    const sum = milkers.reduce((acc, curr) => acc + (curr.lastFatPercentage || 0), 0);
    return Number((sum / milkers.length).toFixed(2));
  }, [bubalineAnimals]);

  const totalDailyProductionLiters = useMemo(() => {
    return bubalineAnimals
      .filter((a) => a.isMilking)
      .reduce((acc, curr) => acc + (curr.dailyMilkLiters || 0), 0);
  }, [bubalineAnimals]);

  // Mozzarella Calculator Results
  const cheeseCalcResult = useMemo(() => {
    const L = parseFloat(calcLiters) || 0;
    const F = parseFloat(calcFat) || 0;
    const P = parseFloat(calcProtein) || 0;
    const basePrice = parseFloat(calcBasePriceCop) || 0;

    // Total Solids %
    const totalSolids = Number((F + P + 4.8 + 0.8).toFixed(2));
    
    // Formula: Mozzarella Kg = L * [(0.075 * F) + (0.080 * P)]
    const yieldKg = Number((L * (0.075 * F + 0.080 * P)).toFixed(2));
    const litersPerKg = yieldKg > 0 ? Number((L / yieldKg).toFixed(2)) : 0;

    // Bonification for Fat (> 7.0%)
    let bonifPct = 0;
    if (F > 7.0) {
      bonifPct = ((F - 7.0) / 0.5) * 2.5;
    }
    const adjustedPrice = Math.round(basePrice * (1 + bonifPct / 100));
    const totalRevenue = Math.round(L * adjustedPrice);

    return {
      totalSolids,
      yieldKg,
      litersPerKg,
      bonifPct: Number(bonifPct.toFixed(1)),
      adjustedPrice,
      totalRevenue,
    };
  }, [calcLiters, calcFat, calcProtein, calcBasePriceCop]);

  // Filtered List
  const filteredAnimals = useMemo(() => {
    return bubalineAnimals.filter((a) => {
      const matchSearch =
        a.earTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.rfidOrTattoo && a.rfidOrTattoo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.paddockName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchBreed = selectedBreedFilter === 'all' || a.breed === selectedBreedFilter;
      const matchCategory = selectedCategoryFilter === 'all' || a.category === selectedCategoryFilter;
      const matchWallow =
        wallowFilter === 'all'
          ? true
          : wallowFilter === 'with_wallow'
          ? a.hasWallowAccess
          : !a.hasWallowAccess;

      return matchSearch && matchBreed && matchCategory && matchWallow;
    });
  }, [bubalineAnimals, searchQuery, selectedBreedFilter, selectedCategoryFilter, wallowFilter]);

  // Category labels helper
  const getCategoryBadge = (cat: BubalineCategory) => {
    switch (cat) {
      case 'bucerro_lactante':
        return { label: 'Bucerro Lactante', bg: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'bucerra_lactante':
        return { label: 'Bucerra Lactante', bg: 'bg-pink-100 text-pink-900 border-pink-200' };
      case 'bubillo_levante':
        return { label: 'Bubillo Levante', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'bubilla_levante':
        return { label: 'Bubilla Levante', bg: 'bg-teal-100 text-teal-900 border-teal-200' };
      case 'bufala_primipara':
        return { label: 'Búfala Primípara (1er Vientre)', bg: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'bufala_produccion':
        return { label: 'Búfala en Ordeño', bg: 'bg-sky-100 text-sky-900 border-sky-200' };
      case 'bufala_seca':
        return { label: 'Búfala Seca / Descanso', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'bufalo_reproductor':
        return { label: 'Búfalo Reproductor (Padrón)', bg: 'bg-rose-100 text-rose-900 border-rose-200' };
      case 'bufalo_ceba':
        return { label: 'Búfalo Ceba / Carne', bg: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
      default:
        return { label: 'Búfalo', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Handle Add New Bubaline
  const handleSaveAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEarTag.trim()) return;

    const bDate = new Date(newBirthDate);
    const now = new Date();
    const diffMonths = Math.max(1, Math.round((now.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4)));

    // Calculate FPP if service date provided (+312 days for Bubalus bubalis)
    let fpp = undefined;
    let daysGest = undefined;
    if (newLastServiceDate) {
      const sDate = new Date(newLastServiceDate);
      const fppObj = new Date(sDate.getTime() + 312 * 86400000);
      fpp = fppObj.toISOString().split('T')[0];
      daysGest = Math.max(0, Math.round((now.getTime() - sDate.getTime()) / 86400000));
    }

    const newAnimal: BubalineAnimal = {
      id: `buf-${Date.now()}`,
      earTag: newEarTag.trim().toUpperCase(),
      name: newName.trim() || `Búfalo ${newEarTag.trim().toUpperCase()}`,
      rfidOrTattoo: newRfid.trim() || undefined,
      markingMethod: newRfid ? 'ear_tag_rfid' : 'ear_tag_rfid',
      breed: newBreed,
      category: newCategory,
      sex: newSex,
      birthDate: newBirthDate,
      ageMonths: diffMonths,
      weightKg: parseFloat(newWeightKg) || 450,
      lastWeighDate: new Date().toISOString().split('T')[0],
      dailyWeightGainG: 650,
      farmId: currentFarmId || 'farm-1',
      farmName: 'Hacienda La Esperanza',
      paddockName: newPaddock,
      hasWallowAccess: newHasWallow,
      shadeCoveragePct: parseInt(newShadePct, 10) || 40,
      isMilking: newIsMilking,
      dailyMilkLiters: newIsMilking ? parseFloat(newDailyMilk) || 8.0 : undefined,
      currentLactationDays: newIsMilking ? 45 : undefined,
      lastFatPercentage: newIsMilking ? 7.8 : undefined,
      lastProteinPercentage: newIsMilking ? 4.2 : undefined,
      lastSolidsPercentage: newIsMilking ? 17.6 : undefined,
      reproductiveStatus: newReproStatus,
      lastServiceDate: newLastServiceDate || undefined,
      expectedCalvingDate: fpp,
      daysInGestation: daysGest,
      totalCalvings: newCategory === 'bufala_produccion' ? 2 : 0,
      toxocaraDewormed: newToxocaraDewormed,
      toxocaraDewormingDate: newToxocaraDewormed ? newBirthDate : undefined,
      sanitaryNotes: `Ingreso al inventario bubalino. Termorregulación: ${newHasWallow ? 'Con poza/revolcadero' : 'Sin poza'}.`,
    };

    onUpdateBubalineAnimals([newAnimal, ...bubalineAnimals]);

    if (onAddActivity) {
      onAddActivity(
        `Alta Bubalina: ${newAnimal.name} (#${newAnimal.earTag})`,
        `Raza ${newAnimal.breed} • ${newAnimal.weightKg} kg • ${newAnimal.paddockName} (Gestación estándar 312 días)`,
        `+1 Búfalo 🐃`,
        'birth'
      );
    }

    setIsAddAnimalModalOpen(false);
    // Reset
    setNewEarTag('');
    setNewName('');
    setNewRfid('');
  };

  // Handle Add Milk Record
  const handleSaveMilkRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const target = bubalineAnimals.find((a) => a.id === milkTargetAnimalId);
    if (!target) return;

    const L = parseFloat(milkLiters) || 0;
    const F = parseFloat(milkFatPct) || 0;
    const P = parseFloat(milkProteinPct) || 0;
    const totalSolids = Number((F + P + 4.8 + 0.8).toFixed(2));
    const mozKg = Number((L * (0.075 * F + 0.080 * P)).toFixed(2));

    const newRecord: BubalineMilkQualityRecord = {
      id: `bmilk-${Date.now()}`,
      animalId: target.id,
      animalTag: target.earTag,
      animalName: target.name,
      date: milkDate,
      shift: milkShift,
      liters: L,
      fatPercentage: F,
      proteinPercentage: P,
      totalSolidsPercentage: totalSolids,
      sccK: parseInt(milkSccK, 10) || 110,
      estimatedMozzarellaKg: mozKg,
      notes: `Ordeño ${milkShift}. Sólidos: ${totalSolids}%`,
    };

    setMilkRecords([newRecord, ...milkRecords]);

    // Update animal's latest metrics
    const updated = bubalineAnimals.map((a) => {
      if (a.id === target.id) {
        return {
          ...a,
          dailyMilkLiters: L,
          lastFatPercentage: F,
          lastProteinPercentage: P,
          lastSolidsPercentage: totalSolids,
        };
      }
      return a;
    });
    onUpdateBubalineAnimals(updated);

    if (onAddActivity) {
      onAddActivity(
        `Control Lechero Búfala #${target.earTag}`,
        `${L} Litros • Grasa: ${F}% • Prot: ${P}% • Rend: ${mozKg} kg Mozzarella`,
        `${L} L 🥛`,
        'dairy'
      );
    }

    setIsAddMilkModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#032418] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-emerald-950/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <BuffaloIcon className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center text-[#facc15] shadow-inner">
                <BuffaloIcon className="w-6 h-6 text-[#facc15]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Gestión Integral de Bubalinos
                  <span className="text-xs font-mono font-normal bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    Bubalus bubalis
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-emerald-200/80">
                  Parámetros biológicos adaptados: 312 días de gestación, leche A2 de alta grasa (6.5% - 9.0%) y manejo en humedales.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddMilkModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-bold flex items-center gap-1.5 border border-emerald-700/40 transition cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-300" />
              <span>Control Lechero</span>
            </button>

            <button
              onClick={() => setIsAddAnimalModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#facc15] hover:bg-[#eab308] text-[#032418] text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Búfalo</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-900/60">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <p className="text-[10.5px] uppercase font-bold tracking-wider text-emerald-300/80">Censo Bubalino</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{totalCount}</span>
              <span className="text-xs text-emerald-300 font-medium">Cabezas</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-0.5">{calvesCount} Bucerros lactantes</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <p className="text-[10.5px] uppercase font-bold tracking-wider text-emerald-300/80">Producción Láctea</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{totalDailyProductionLiters.toFixed(0)}</span>
              <span className="text-xs text-emerald-300 font-medium">L / Día</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-0.5">{milkingCount} Búfalas en ordeño ({avgMilkPerCow} L/cab)</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <p className="text-[10.5px] uppercase font-bold tracking-wider text-emerald-300/80">Grasa Butirométrica</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{avgFatPct}%</span>
              <span className="text-xs text-[#facc15] font-medium font-mono">ST: ~17.8%</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-0.5">Alto sólidos para Mozzarella</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
            <p className="text-[10.5px] uppercase font-bold tracking-wider text-emerald-300/80">Gestación Bubalina</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{pregnantCount}</span>
              <span className="text-xs text-emerald-300 font-medium">Gestantes</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-0.5">Media exacta: 312 Días</p>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BuffaloIcon className="w-4 h-4" />
            <span>Inventario Bubalino ({filteredAnimals.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dairy')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'dairy'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-4 h-4 text-sky-600" />
            <span>Lechería & Sólidos Totales</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reproduction')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'reproduction'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-pink-600" />
            <span>Reproducción & Partos (312 Días)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'calculator'
                ? 'border-emerald-800 text-emerald-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Calculadora Rendimiento Mozzarella</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: INVENTARIO BUBALINO */}
      {/* ========================================================================= */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por arete, nombre, RFID o potrero..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-800"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedBreedFilter}
                onChange={(e) => setSelectedBreedFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="all">Todas las Razas</option>
                <option value="Murrah">Murrah (Leche/Doble Propósito)</option>
                <option value="Mediterránea">Mediterránea (Carne/Leche)</option>
                <option value="Jafarabadi">Jafarabadi (Alta Estructura)</option>
                <option value="Carabao">Carabao (Pantano/Trabajo)</option>
              </select>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="all">Todas las Categorías</option>
                <option value="bufala_produccion">Búfala en Ordeño</option>
                <option value="bufala_primipara">Búfala 1er Vientre</option>
                <option value="bufalo_reproductor">Búfalo Reproductor</option>
                <option value="bucerro_lactante">Bucerros Lactantes</option>
                <option value="bubillo_levante">Levante (Bubillos)</option>
                <option value="bufalo_ceba">Ceba / Engorde</option>
              </select>

              <select
                value={wallowFilter}
                onChange={(e) => setWallowFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="all">Revolcadero: Todos</option>
                <option value="with_wallow">Con Poza / Agua (✓)</option>
                <option value="without_wallow">Sin Poza (⚠️)</option>
              </select>
            </div>
          </div>

          {/* Buffalo Animals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnimals.map((animal) => {
              const badge = getCategoryBadge(animal.category);

              return (
                <div
                  key={animal.id}
                  onClick={() => setSelectedAnimalDetail(animal)}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-emerald-700/40 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <BuffaloIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900 font-mono">#{animal.earTag}</span>
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[130px]">
                              {animal.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {animal.breed} • {animal.sex === 'hembra' ? 'Hembra' : 'Macho'} • {animal.ageMonths} meses
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Weight & Production Bar */}
                    <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100 text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">Peso & GDP</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-bold text-slate-800 font-mono">{animal.weightKg} kg</span>
                          <span className="text-[10px] text-emerald-700 font-mono">+{animal.dailyWeightGainG}g/d</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {animal.isMilking ? 'Ordeño & Grasa' : 'Estado Reproductivo'}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          {animal.isMilking ? (
                            <>
                              <span className="font-bold text-slate-800 font-mono">{animal.dailyMilkLiters} L</span>
                              <span className="text-[10px] text-amber-700 font-mono font-bold">({animal.lastFatPercentage}% G)</span>
                            </>
                          ) : (
                            <span className="font-bold text-slate-800 capitalize truncate text-[11px]">
                              {animal.reproductiveStatus.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Paddock & Wallow Amenity */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                      <span className="truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        {animal.paddockName}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        {animal.hasWallowAccess ? (
                          <span className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200" title="Acceso a Poza de Agua / Revolcadero">
                            <Waves className="w-2.5 h-2.5" /> Poza
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title="Sin poza en potrero">
                            <Sun className="w-2.5 h-2.5" /> Sombra {animal.shadeCoveragePct}%
                          </span>
                        )}

                        {animal.toxocaraDewormed && (
                          <span className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Desparasitación Toxocara vitulorum aplicada">
                            <CheckCircle2 className="w-2.5 h-2.5" /> T. vitulorum
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Arrow */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400 group-hover:text-emerald-800 transition-colors">
                    <span>Ver ficha zootécnica y curvas</span>
                    <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: LECHERÍA BUBALINA & SÓLIDOS TOTALES */}
      {/* ========================================================================= */}
      {activeSubTab === 'dairy' && (
        <div className="space-y-4">
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-700" />
                Control Fisicoquímico de Leche de Búfala (*Bubalus bubalis*)
              </h3>
              <p className="text-xs text-sky-800/80 mt-0.5">
                La leche de búfala promedia entre 6.5% y 9.0% de grasa y &gt;17.0% de sólidos totales, con caseína A2 y ausencia de β-carotenos.
              </p>
            </div>

            <button
              onClick={() => setIsAddMilkModalOpen(true)}
              className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Control Lechero</span>
            </button>
          </div>

          {/* Milk Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3">Búfala</th>
                  <th className="p-3">Fecha & Turno</th>
                  <th className="p-3">Litros</th>
                  <th className="p-3">% Grasa</th>
                  <th className="p-3">% Proteína</th>
                  <th className="p-3">% Sólidos Totales</th>
                  <th className="p-3">Rend. Mozzarella</th>
                  <th className="p-3">CCS (Miles/mL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {milkRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-slate-900 font-mono">#{rec.animalTag}</p>
                      <p className="text-[10.5px] text-slate-400">{rec.animalName}</p>
                    </td>
                    <td className="p-3 text-slate-600 capitalize">
                      {rec.date} • <span className="font-medium text-slate-800">{rec.shift}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 font-mono">{rec.liters} L</td>
                    <td className="p-3">
                      <span className="font-bold text-amber-700 font-mono">{rec.fatPercentage}%</span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{rec.proteinPercentage}%</td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-800 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {rec.totalSolidsPercentage}% ST
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 font-mono">{rec.estimatedMozzarellaKg} kg</span>
                      <span className="text-[9.5px] text-slate-400 block">
                        (~{(rec.liters / (rec.estimatedMozzarellaKg || 1)).toFixed(2)} L/kg)
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {rec.sccK} <span className="text-[10px] text-emerald-600 font-bold">✓ Óptimo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: REPRODUCCIÓN BUBALINA (312 DÍAS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'reproduction' && (
        <div className="space-y-4">
          <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-pink-950 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-pink-700" />
              Gestación y Estacionalidad Bubalina (Fotoperiodo Negativo)
            </h3>
            <p className="text-xs text-pink-900/80 mt-0.5">
              Cálculo biológico dinámico: <strong>312 días promedio de gestación</strong> (vs. 283 días en bovinos). Secado programado a los 250 días.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bubalineAnimals
              .filter((a) => a.reproductiveStatus === 'gestante' || a.reproductiveStatus === 'servida')
              .map((animal) => {
                const daysGest = animal.daysInGestation || 0;
                const progressPct = Math.min(100, Math.round((daysGest / 312) * 100));

                return (
                  <div key={animal.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm font-mono">#{animal.earTag}</span>
                        <span className="text-xs font-semibold text-slate-700 ml-2">{animal.name}</span>
                        <p className="text-[10.5px] text-slate-400">{animal.breed} • {animal.totalCalvings} partos previos</p>
                      </div>
                      <span className="text-[10px] font-bold bg-pink-100 text-pink-900 border border-pink-200 px-2 py-0.5 rounded-full capitalize">
                        {animal.reproductiveStatus}
                      </span>
                    </div>

                    {/* Progress Bar for 312 days */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Progreso Gestacional ({daysGest} / 312 Días)</span>
                        <span className="font-mono font-bold text-slate-800">{progressPct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-pink-500 to-rose-600 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Fecha Servicio</span>
                        <span className="font-bold text-slate-800">{animal.lastServiceDate || 'S/R'}</span>
                      </div>

                      <div className="bg-pink-50/50 p-2 rounded-xl border border-pink-100">
                        <span className="text-[10px] text-pink-700 block font-medium">FPP Calculada (312 d)</span>
                        <span className="font-bold text-pink-950">{animal.expectedCalvingDate || 'Calculando...'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: CALCULADORA MOZZARELLA & SÓLIDOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Inputs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Parámetros del Lote</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Volumen de Leche (Litros)</label>
                <input
                  type="number"
                  value={calcLiters}
                  onChange={(e) => setCalcLiters(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">% Grasa Butirométrica (6.5% - 9.0%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcFat}
                  onChange={(e) => setCalcFat(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono font-bold text-amber-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">% Proteína / Caseína (3.8% - 4.8%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcProtein}
                  onChange={(e) => setCalcProtein(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Precio Base por Litro ($ COP)</label>
                <input
                  type="number"
                  value={calcBasePriceCop}
                  onChange={(e) => setCalcBasePriceCop(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Results Visualizer */}
          <div className="bg-linear-to-br from-[#032418] to-emerald-950 text-white p-6 rounded-2xl border border-emerald-900 shadow-lg lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                  Rendimiento Quesero Teórico (Pasta Hilada)
                </span>
                <span className="text-xs bg-emerald-900/80 text-[#facc15] font-mono px-2 py-0.5 rounded-full border border-emerald-700/50">
                  Algoritmo Calibrado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-emerald-300 font-medium">Producción Mozzarella</p>
                  <p className="text-3xl font-bold font-mono text-white mt-1">{cheeseCalcResult.yieldKg} <span className="text-base text-emerald-400">kg</span></p>
                  <p className="text-[10.5px] text-emerald-300 mt-1">~{cheeseCalcResult.litersPerKg} Litros / kg queso</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-emerald-300 font-medium">Sólidos Totales (ST)</p>
                  <p className="text-3xl font-bold font-mono text-[#facc15] mt-1">{cheeseCalcResult.totalSolids}%</p>
                  <p className="text-[10.5px] text-emerald-300 mt-1">Grasa ({calcFat}%) + Proteína ({calcProtein}%)</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-[11px] text-emerald-300 font-medium">Precio Bonificado</p>
                  <p className="text-3xl font-bold font-mono text-white mt-1">${cheeseCalcResult.adjustedPrice.toLocaleString('es-CO')}</p>
                  <p className="text-[10.5px] text-[#facc15] mt-1">Bonificación: +{cheeseCalcResult.bonifPct}% por sólidos</p>
                </div>
              </div>

              <div className="mt-6 bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-300 block">Ingreso Estimado del Lote</span>
                  <span className="text-2xl font-bold font-mono text-white">
                    ${cheeseCalcResult.totalRevenue.toLocaleString('es-CO')} COP
                  </span>
                </div>
                <Award className="w-8 h-8 text-[#facc15]" />
              </div>
            </div>

            <p className="text-[11px] text-emerald-300/60 mt-4">
              * Comparativa: En ganado vacuno se requieren ~9.5 a 10.5 litros de leche por kilogramo de queso. En búfalas de agua se requieren únicamente ~4.5 a 5.2 litros.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVO BÚFALO AL INVENTARIO */}
      {/* ========================================================================= */}
      {isAddAnimalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-[#032418] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BuffaloIcon className="w-5 h-5 text-[#facc15]" />
                <h3 className="font-bold text-sm">Registro de Animal Bubalino</h3>
              </div>
              <button
                onClick={() => setIsAddAnimalModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnimal} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Arete Visual / Chapeta *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. BUF-512"
                    value={newEarTag}
                    onChange={(e) => setNewEarTag(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nombre / Identificador</label>
                  <input
                    type="text"
                    placeholder="Ej. Murrah Linda"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Raza Bubalina</label>
                  <select
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value as BubalineBreed)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Murrah">Murrah</option>
                    <option value="Mediterránea">Mediterránea</option>
                    <option value="Jafarabadi">Jafarabadi</option>
                    <option value="Carabao">Carabao</option>
                    <option value="Nili-Ravi">Nili-Ravi</option>
                    <option value="Mestizo Lechero">Mestizo Lechero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Categoría Zootécnica</label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const val = e.target.value as BubalineCategory;
                      setNewCategory(val);
                      if (val === 'bucerro_lactante' || val === 'bubillo_levante' || val === 'bufalo_reproductor' || val === 'bufalo_ceba') {
                        setNewSex('macho');
                        setNewIsMilking(false);
                      } else {
                        setNewSex('hembra');
                        if (val === 'bufala_produccion') setNewIsMilking(true);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="bufala_produccion">Búfala en Ordeño</option>
                    <option value="bufala_primipara">Búfala 1er Vientre</option>
                    <option value="bufala_seca">Búfala Seca / Descanso</option>
                    <option value="bufalo_reproductor">Búfalo Reproductor (Padrón)</option>
                    <option value="bucerro_lactante">Bucerro Lactante (Macho)</option>
                    <option value="bucerra_lactante">Bucerra Lactante (Hembra)</option>
                    <option value="bubillo_levante">Bubillo Levante (Macho)</option>
                    <option value="bubilla_levante">Bubilla Levante (Hembra)</option>
                    <option value="bufalo_ceba">Búfalo Ceba / Engorde</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Peso Actual (kg)</label>
                  <input
                    type="number"
                    value={newWeightKg}
                    onChange={(e) => setNewWeightKg(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-emerald-800" />
                  Bienestar & Termorregulación Bubalina
                </p>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHasWallow}
                      onChange={(e) => setNewHasWallow(e.target.checked)}
                      className="rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span className="text-slate-700 font-medium">Potrero con Poza / Revolcadero</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newToxocaraDewormed}
                      onChange={(e) => setNewToxocaraDewormed(e.target.checked)}
                      className="rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span className="text-slate-700 font-medium">Desparasitado *T. vitulorum*</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAnimalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold shadow-md cursor-pointer"
                >
                  Guardar Búfalo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR CONTROL LECHERO BUBALINO */}
      {/* ========================================================================= */}
      {isAddMilkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-sky-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-300" />
                <h3 className="font-bold text-sm">Control Lechero & Sólidos</h3>
              </div>
              <button
                onClick={() => setIsAddMilkModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMilkRecord} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Seleccionar Búfala en Ordeño *</label>
                <select
                  required
                  value={milkTargetAnimalId}
                  onChange={(e) => setMilkTargetAnimalId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Seleccione una búfala...</option>
                  {bubalineAnimals
                    .filter((a) => a.isMilking || a.sex === 'hembra')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        #{a.earTag} - {a.name} ({a.breed})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Litros Producidos</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={milkLiters}
                    onChange={(e) => setMilkLiters(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Turno de Ordeño</label>
                  <select
                    value={milkShift}
                    onChange={(e) => setMilkShift(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="mañana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="unico">Único (1 Ordeño)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">% Grasa Butirométrica</label>
                  <input
                    type="number"
                    step="0.1"
                    value={milkFatPct}
                    onChange={(e) => setMilkFatPct(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">% Proteína</label>
                  <input
                    type="number"
                    step="0.1"
                    value={milkProteinPct}
                    onChange={(e) => setMilkProteinPct(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMilkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-800 hover:bg-sky-900 text-white font-bold shadow-md cursor-pointer"
                >
                  Guardar Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / FICHA ZOOTÉCNICA INDIVIDUAL DEL BÚFALO */}
      {/* ========================================================================= */}
      {selectedAnimalDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#032418] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center text-[#facc15]">
                  <BuffaloIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">#{selectedAnimalDetail.earTag}</h3>
                    <span className="text-xs text-emerald-300 font-medium">({selectedAnimalDetail.name})</span>
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    Raza {selectedAnimalDetail.breed} • {selectedAnimalDetail.sex === 'hembra' ? 'Hembra' : 'Macho'} • {selectedAnimalDetail.ageMonths} Meses
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnimalDetail(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
              {/* Category & RFID Badge */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10.5px] text-slate-400 block font-medium">Categoría Zootécnica</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {getCategoryBadge(selectedAnimalDetail.category).label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10.5px] text-slate-400 block font-medium">Identificación Secundaria</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {selectedAnimalDetail.rfidOrTattoo || 'Sin RFID/Tatuaje'}
                  </span>
                </div>
              </div>

              {/* Physical & Growth Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">Peso Corporal</span>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">{selectedAnimalDetail.weightKg} kg</p>
                  <p className="text-[9.5px] text-emerald-700 font-medium mt-0.5">+{selectedAnimalDetail.dailyWeightGainG} g/día</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">Potrero Asignado</span>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate">{selectedAnimalDetail.paddockName}</p>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">Sombra: {selectedAnimalDetail.shadeCoveragePct}%</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">Termorregulación</span>
                  <div className="mt-1">
                    {selectedAnimalDetail.hasWallowAccess ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        <Waves className="w-3 h-3" /> Con Poza
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Sun className="w-3 h-3" /> Sin Poza
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dairy Production & Solids (if applicable) */}
              {selectedAnimalDetail.isMilking && (
                <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-950 flex items-center gap-1.5 text-xs">
                      <Droplets className="w-3.5 h-3.5 text-sky-700" />
                      Rendimiento Lechero & Sólidos Totales
                    </span>
                    <span className="text-[10px] font-mono bg-sky-100 text-sky-900 px-2 py-0.5 rounded-full font-bold">
                      {selectedAnimalDetail.currentLactationDays || 120} Días Lactancia
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="bg-white p-2 rounded-xl border border-sky-100">
                      <span className="text-[9.5px] text-slate-400 block">Producción</span>
                      <span className="font-bold text-slate-900 font-mono text-xs">{selectedAnimalDetail.dailyMilkLiters} L/d</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-sky-100">
                      <span className="text-[9.5px] text-slate-400 block">% Grasa</span>
                      <span className="font-bold text-amber-800 font-mono text-xs">{selectedAnimalDetail.lastFatPercentage}%</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-sky-100">
                      <span className="text-[9.5px] text-slate-400 block">% Proteína</span>
                      <span className="font-bold text-slate-800 font-mono text-xs">{selectedAnimalDetail.lastProteinPercentage}%</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-sky-100">
                      <span className="text-[9.5px] text-slate-400 block">Sólidos Totales</span>
                      <span className="font-bold text-emerald-800 font-mono text-xs">{selectedAnimalDetail.lastSolidsPercentage}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reproduction & 312 Days Gestation */}
              <div className="p-3.5 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-950 flex items-center gap-1.5 text-xs">
                    <HeartPulse className="w-3.5 h-3.5 text-pink-700" />
                    Estado Reproductivo (Media: 312 Días)
                  </span>
                  <span className="text-[10px] capitalize font-bold text-pink-900 bg-pink-100 px-2 py-0.5 rounded-full">
                    {selectedAnimalDetail.reproductiveStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-slate-400 block">Último Servicio / Monta</span>
                    <span className="font-bold text-slate-800">{selectedAnimalDetail.lastServiceDate || 'Sin registro'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-pink-700 block font-medium">Fecha Probable de Parto (FPP)</span>
                    <span className="font-bold text-pink-950 font-mono">{selectedAnimalDetail.expectedCalvingDate || 'No gestante'}</span>
                  </div>
                </div>
              </div>

              {/* Sanitary Notes & Deworming */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <span className="font-bold text-slate-800 block text-xs">Sanidad & Manejo Neonatal</span>
                <div className="flex items-center gap-2">
                  {selectedAnimalDetail.toxocaraDewormed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Desparasitación *Toxocara vitulorum* aplicada (15 días)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <AlertTriangle className="w-3 h-3" /> Pendiente Desparasitación *T. vitulorum*
                    </span>
                  )}
                </div>
                {selectedAnimalDetail.sanitaryNotes && (
                  <p className="text-[11px] text-slate-600 italic mt-1 bg-white p-2 rounded-xl border border-slate-100">
                    "{selectedAnimalDetail.sanitaryNotes}"
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAnimalDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition text-xs"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
