import React, { useState, useMemo } from 'react';
import {
  EquineAnimal,
  EquineSpecies,
  EquineAptitude,
  EquineHerrajeRecord,
  EquineSanitaryEvent,
  FarmDataPackage,
} from '../types';
import { HorseIcon } from './icons/HorseIcon';
import {
  Plus,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Scale,
  Building2,
  User,
  Activity,
  FileText,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Download,
  Footprints,
  Eye,
  Tag,
  Info,
} from 'lucide-react';

interface EquinesViewProps {
  equines: EquineAnimal[];
  onUpdateEquines: (updatedList: EquineAnimal[]) => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
}

export const EquinesView: React.FC<EquinesViewProps> = ({
  equines,
  onUpdateEquines,
  farms,
  currentFarmId,
}) => {
  // State
  const [speciesTab, setSpeciesTab] = useState<EquineSpecies | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFarmFilter, setSelectedFarmFilter] = useState<string>('all');
  const [selectedAptitudeFilter, setSelectedAptitudeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEquineForHerraje, setSelectedEquineForHerraje] = useState<EquineAnimal | null>(null);
  const [selectedEquineForSanitary, setSelectedEquineForSanitary] = useState<EquineAnimal | null>(null);
  const [selectedEquineDetail, setSelectedEquineDetail] = useState<EquineAnimal | null>(null);

  // New Equine Form State
  const [newTag, setNewTag] = useState('');
  const [newName, setNewName] = useState('');
  const [newRfid, setNewRfid] = useState('');
  const [newSpecies, setNewSpecies] = useState<EquineSpecies>('caballar');
  const [newSex, setNewSex] = useState<'macho' | 'hembra' | 'capon'>('capon');
  const [newBreed, setNewBreed] = useState('Criollo Colombiano');
  const [newCoat, setNewCoat] = useState('Castaño');
  const [newAge, setNewAge] = useState(5);
  const [newWeight, setNewWeight] = useState(400);
  const [newFarm, setNewFarm] = useState(farms[0]?.profile.name || 'Finca La Esperanza');
  const [newAptitude, setNewAptitude] = useState<EquineAptitude>('trabajo_vaqueria');
  const [newRider, setNewRider] = useState('');
  const [newAieCert, setNewAieCert] = useState('');
  const [newObs, setNewObs] = useState('');

  // Herraje Form State
  const [herrajeDate, setHerrajeDate] = useState(new Date().toISOString().split('T')[0]);
  const [herrajeType, setHerrajeType] = useState<'completo' | 'delantero' | 'recorte_cascos'>('completo');
  const [farrierName, setFarrierName] = useState('Maestro José');
  const [herrajeCost, setHerrajeCost] = useState(120000);
  const [herrajeNotes, setHerrajeNotes] = useState('');

  // Sanitary Form State
  const [sanitaryDate, setSanitaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [sanitaryType, setSanitaryType] = useState<'aie_coggins' | 'encefalitis' | 'tetanos' | 'desparasitacion' | 'vitamina' | 'otro'>('aie_coggins');
  const [sanitaryTitle, setSanitaryTitle] = useState('Examen Coggins AIE');
  const [sanitaryLab, setSanitaryLab] = useState('Laboratorio Oficial ICA');
  const [sanitaryResult, setSanitaryResult] = useState('NEGATIVO');
  const [sanitaryDueDate, setSanitaryDueDate] = useState('');
  const [sanitaryCost, setSanitaryCost] = useState(85000);

  // Filtered List
  const filteredEquines = useMemo(() => {
    return equines.filter((eq) => {
      // Species
      if (speciesTab !== 'all' && eq.species !== speciesTab) return false;
      // Farm
      if (selectedFarmFilter !== 'all' && eq.farmName !== selectedFarmFilter) return false;
      // Aptitude
      if (selectedAptitudeFilter !== 'all' && eq.aptitude !== selectedAptitudeFilter) return false;
      // Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = eq.name.toLowerCase().includes(q);
        const matchTag = eq.earTagOrIron.toLowerCase().includes(q);
        const matchBreed = eq.breed.toLowerCase().includes(q);
        const matchRider = (eq.assignedRiderOrWorker || '').toLowerCase().includes(q);
        const matchChip = (eq.rfidChip || '').toLowerCase().includes(q);
        if (!matchName && !matchTag && !matchBreed && !matchRider && !matchChip) return false;
      }
      return true;
    });
  }, [equines, speciesTab, selectedFarmFilter, selectedAptitudeFilter, searchQuery]);

  // KPIs
  const kpis = useMemo(() => {
    const total = equines.length;
    const caballares = equines.filter((e) => e.species === 'caballar').length;
    const mulares = equines.filter((e) => e.species === 'mular').length;
    const asnales = equines.filter((e) => e.species === 'asnal').length;
    const enTrabajo = equines.filter((e) => e.status === 'activo' && (e.aptitude === 'trabajo_vaqueria' || e.aptitude === 'carga_enjalma')).length;

    // Check Herraje or AIE alerts
    const now = new Date();
    const pendingHerraje = equines.filter((e) => {
      if (!e.nextHerrajeDueDate) return true;
      const dueDate = new Date(e.nextHerrajeDueDate);
      const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7; // due within 7 days or past due
    }).length;

    return {
      total,
      caballares,
      mulares,
      asnales,
      enTrabajo,
      pendingHerraje,
    };
  }, [equines]);

  // Helpers
  const getSpeciesLabel = (species: EquineSpecies) => {
    switch (species) {
      case 'caballar':
        return { label: 'CABALLAR', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'mular':
        return { label: 'MULAR (MULA/MACHO)', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'asnal':
        return { label: 'ASNAL (BURRO)', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
    }
  };

  const getAptitudeLabel = (aptitude: EquineAptitude) => {
    switch (aptitude) {
      case 'trabajo_vaqueria':
        return 'Trabajo & Vaquería';
      case 'carga_enjalma':
        return 'Carga & Enjalma';
      case 'reproduccion_cria':
        return 'Reproducción & Cría';
      case 'paseo_exposicion':
        return 'Paseo & Exposición';
      case 'tiro':
        return 'Tiro & Tracción';
    }
  };

  // Add Equine Handler
  const handleAddEquine = (e: React.FormEvent) => {
    e.preventDefault();
    const newEquine: EquineAnimal = {
      id: `eq-${Date.now()}`,
      earTagOrIron: newTag || `EQ-${equines.length + 1}`,
      name: newName || 'Sin Nombre',
      rfidChip: newRfid || undefined,
      species: newSpecies,
      sex: newSex,
      breed: newBreed,
      coatColor: newCoat,
      ageYears: Number(newAge),
      weightKg: Number(newWeight),
      farmName: newFarm,
      aptitude: newAptitude,
      status: 'activo',
      sanitaryStatus: 'excelente',
      lastHerrajeDate: new Date().toISOString().split('T')[0],
      nextHerrajeDueDate: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().split('T')[0],
      assignedRiderOrWorker: newRider || undefined,
      aieCertificateCode: newAieCert || undefined,
      observations: newObs || undefined,
      herrajeHistory: [],
      sanitaryHistory: [],
    };

    onUpdateEquines([newEquine, ...equines]);
    setIsAddModalOpen(false);
    // Reset form
    setNewTag('');
    setNewName('');
    setNewRfid('');
    setNewRider('');
    setNewObs('');
  };

  // Add Herraje Handler
  const handleSaveHerraje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquineForHerraje) return;

    const newRec: EquineHerrajeRecord = {
      id: `hr-${Date.now()}`,
      date: herrajeDate,
      type: herrajeType,
      farrierName: farrierName,
      costCop: Number(herrajeCost),
      notes: herrajeNotes,
    };

    // Calculate next due date (approx 45 days)
    const nextDate = new Date(new Date(herrajeDate).getTime() + 45 * 24 * 3600 * 1000)
      .toISOString()
      .split('T')[0];

    const updatedList = equines.map((eq) => {
      if (eq.id === selectedEquineForHerraje.id) {
        return {
          ...eq,
          lastHerrajeDate: herrajeDate,
          nextHerrajeDueDate: nextDate,
          herrajeHistory: [newRec, ...(eq.herrajeHistory || [])],
        };
      }
      return eq;
    });

    onUpdateEquines(updatedList);
    setSelectedEquineForHerraje(null);
    setHerrajeNotes('');
  };

  // Add Sanitary Event Handler
  const handleSaveSanitary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquineForSanitary) return;

    const newEvt: EquineSanitaryEvent = {
      id: `sn-${Date.now()}`,
      date: sanitaryDate,
      type: sanitaryType,
      title: sanitaryTitle,
      laboratoryOrMedication: sanitaryLab,
      resultOrDose: sanitaryResult,
      nextDueDate: sanitaryDueDate || undefined,
      costCop: Number(sanitaryCost),
    };

    const updatedList = equines.map((eq) => {
      if (eq.id === selectedEquineForSanitary.id) {
        const isAie = sanitaryType === 'aie_coggins';
        return {
          ...eq,
          lastAieTestDate: isAie ? sanitaryDate : eq.lastAieTestDate,
          cogginsValidUntil: isAie && sanitaryDueDate ? sanitaryDueDate : eq.cogginsValidUntil,
          sanitaryHistory: [newEvt, ...(eq.sanitaryHistory || [])],
        };
      }
      return eq;
    });

    onUpdateEquines(updatedList);
    setSelectedEquineForSanitary(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Arete/Hierro', 'Nombre', 'Especie', 'Sexo', 'Raza', 'Pelaje', 'Edad', 'Peso (kg)', 'Predio', 'Aptitud', 'Encargado', 'Último Herraje', 'Próximo Herraje'];
    const rows = filteredEquines.map((e) => [
      e.earTagOrIron,
      e.name,
      e.species,
      e.sex,
      e.breed,
      e.coatColor,
      e.ageYears,
      e.weightKg,
      e.farmName,
      getAptitudeLabel(e.aptitude),
      e.assignedRiderOrWorker || 'Sin asignar',
      e.lastHerrajeDate || 'N/A',
      e.nextHerrajeDueDate || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventario_Equinos_Mulares_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Banner */}
      <section className="bg-[#0D1A13] text-white rounded-3xl p-5 md:p-6 shadow-xl border-2 border-[#1b4332] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <HorseIcon className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A94E]/20 border border-[#ffba38]/40 text-[#ffba38] text-xs font-bold tracking-wider uppercase mb-2">
              <HorseIcon className="w-4 h-4" />
              <span>Módulo Específico de Trabajo & Apoyo</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Inventario de Equinos, Mulares y Asnales
              </h1>
              <div className="group relative inline-flex items-center">
                <button
                  type="button"
                  className="text-[#a3b8ad] hover:text-[#A5B8AC] transition-colors p-0.5 rounded cursor-pointer"
                  title="Gestión especializada de caballos de vaquería, mulas de carga/enjalma y asnos reproductores. Registro de herrajes, libretas sanitarias y certificados de Coggins AIE."
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-72 bg-[#123F2A] text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl border border-[#2d6a4f] pointer-events-none animate-in fade-in zoom-in-95">
                  Gestión especializada de caballos de vaquería, mulas de carga/enjalma y asnos reproductores. Registro de herrajes, libretas sanitarias y certificados de Coggins AIE.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#ffba38]" />
              <span>Exportar Reporte</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#D4A94E] hover:bg-[#e0a02e] text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar Nuevo Equino</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 shadow-xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A5B8AC] gap-1 min-w-0">
            <span className="text-[10px] font-bold uppercase truncate">Total Equinos</span>
            <HorseIcon className="w-4 h-4 text-emerald-800 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-2 truncate">{kpis.total}</p>
          <p className="text-[10px] text-[#A5B8AC] mt-1 font-medium truncate">Ejemplares registrados</p>
        </div>

        <div className="bg-[#15241C] border border-emerald-200 rounded-2xl p-4 shadow-xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-900 gap-1 min-w-0">
            <span className="text-[10px] font-bold uppercase text-emerald-700 truncate">Caballares</span>
            <HorseIcon className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-900 mt-2 truncate">{kpis.caballares}</p>
          <p className="text-[10px] text-emerald-700 mt-1 font-medium truncate">Caballos & Yeguas</p>
        </div>

        <div className="bg-[#15241C] border border-amber-200 rounded-2xl p-4 shadow-xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-900 gap-1 min-w-0">
            <span className="text-[10px] font-bold uppercase text-amber-700 truncate">Mulares</span>
            <Footprints className="w-4 h-4 text-amber-700 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-amber-900 mt-2 truncate">{kpis.mulares}</p>
          <p className="text-[10px] text-amber-700 mt-1 font-medium truncate">Carga & Trabajo</p>
        </div>

        <div className="bg-[#15241C] border border-indigo-200 rounded-2xl p-4 shadow-xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-900 gap-1 min-w-0">
            <span className="text-[10px] font-bold uppercase text-indigo-700 truncate">Asnales</span>
            <Tag className="w-4 h-4 text-indigo-700 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-indigo-900 mt-2 truncate">{kpis.asnales}</p>
          <p className="text-[10px] text-indigo-700 mt-1 font-medium truncate">Burros & Asnas</p>
        </div>

        <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 shadow-xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A5B8AC] gap-1 min-w-0">
            <span className="text-[10px] font-bold uppercase truncate">En Vaquería</span>
            <User className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-2 truncate">{kpis.enTrabajo}</p>
          <p className="text-[10px] text-[#A5B8AC] mt-1 font-medium truncate">Trabajo Activo</p>
        </div>

        <div className="bg-[#15241C] border border-rose-200 rounded-2xl p-4 shadow-xs min-w-0 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-900 gap-1 min-w-0">
            <span className="text-[10px] font-bold uppercase text-rose-700 truncate">Herraje / AIE</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-rose-900 mt-2 truncate">{kpis.pendingHerraje}</p>
          <p className="text-[10px] text-rose-700 mt-1 font-medium truncate">Próximos a vencer</p>
        </div>
      </section>

      {/* Filter Tabs & Search Bar */}
      <section className="bg-[#15241C] p-4 rounded-2xl border-2 border-white/10 shadow-xs space-y-4">
        {/* Top Species Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeeee] pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSpeciesTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                speciesTab === 'all'
                  ? 'bg-[#0D1A13] text-white shadow-xs'
                  : 'bg-[#123F2A]/60 text-white hover:bg-[#e2efe8]'
              }`}
            >
              Todos ({equines.length})
            </button>

            <button
              onClick={() => setSpeciesTab('caballar')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                speciesTab === 'caballar'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-emerald-950/30 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <HorseIcon className="w-3.5 h-3.5" />
              <span>Caballares ({kpis.caballares})</span>
            </button>

            <button
              onClick={() => setSpeciesTab('mular')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                speciesTab === 'mular'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-amber-950/30 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Mulares ({kpis.mulares})</span>
            </button>

            <button
              onClick={() => setSpeciesTab('asnal')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                speciesTab === 'asnal'
                  ? 'bg-indigo-800 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Asnales ({kpis.asnales})</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#123F2A]/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-[#0D1A13] text-white' : 'text-[#717973] hover:text-black'
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[#0D1A13] text-white' : 'text-[#717973] hover:text-black'
              }`}
            >
              Tabla Detallada
            </button>
          </div>
        </div>

        {/* Search & Secondary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, hierro, RFID, arriero..."
              className="w-full pl-9 pr-3 py-2 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-[#012d1d]"
            />
          </div>

          {/* Farm Filter */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-white shrink-0" />
            <select
              value={selectedFarmFilter}
              onChange={(e) => setSelectedFarmFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold focus:outline-none focus:border-[#012d1d]"
            >
              <option value="all">Todos los Predios / Fincas</option>
              {farms.map((f) => (
                <option key={f.profile.id} value={f.profile.name}>
                  {f.profile.name}
                </option>
              ))}
            </select>
          </div>

          {/* Aptitude Filter */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-white shrink-0" />
            <select
              value={selectedAptitudeFilter}
              onChange={(e) => setSelectedAptitudeFilter(e.target.value)}
              className="w-full py-2 px-3 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold focus:outline-none focus:border-[#012d1d]"
            >
              <option value="all">Todas las Aptitudes de Trabajo</option>
              <option value="trabajo_vaqueria">Trabajo & Vaquería</option>
              <option value="carga_enjalma">Carga & Enjalma</option>
              <option value="reproduccion_cria">Reproducción & Cría</option>
              <option value="paseo_exposicion">Paseo & Exposición</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Display Content */}
      {viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquines.map((eq) => {
            const speciesBadge = getSpeciesLabel(eq.species);
            const isNearHerraje = eq.nextHerrajeDueDate && new Date(eq.nextHerrajeDueDate) <= new Date(Date.now() + 7 * 24 * 3600 * 1000);

            return (
              <article
                key={eq.id}
                className="bg-[#15241C] rounded-2xl border-2 border-white/10 shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#012d1d] transition-all"
              >
                {/* Card Top Header */}
                <div className="p-4 bg-[#f4fbf7] border-b border-[#c1ecd4] flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${speciesBadge.bg}`}>
                        {speciesBadge.label}
                      </span>
                      <span className="font-mono text-xs font-bold bg-[#0D1A13] text-[#ffba38] px-2 py-0.5 rounded">
                        {eq.earTagOrIron}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-white mt-1.5 leading-snug">
                      {eq.name}
                    </h3>
                    <p className="text-xs text-[#717973] font-medium">
                      {eq.breed} • {eq.coatColor}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-[10px] rounded uppercase tracking-wider shrink-0">
                    {eq.status}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-grow">
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#f9f9f9] p-3 rounded-xl border border-[#eeeeee]">
                    <div>
                      <span className="text-[10px] text-[#717973] uppercase font-bold block">Predio</span>
                      <span className="font-bold text-white">{eq.farmName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#717973] uppercase font-bold block">Aptitud</span>
                      <span className="font-bold text-[#2d6a4f]">{getAptitudeLabel(eq.aptitude)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#717973] uppercase font-bold block">Edad / Peso</span>
                      <span className="font-mono font-bold text-white">{eq.ageYears} años • {eq.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#717973] uppercase font-bold block">Encargado</span>
                      <span className="font-medium text-[#414844] truncate block">{eq.assignedRiderOrWorker || 'Sin asignar'}</span>
                    </div>
                  </div>

                  {/* Sanitary & Farriery Status */}
                  <div className={`p-3 rounded-xl border text-xs ${isNearHerraje ? 'bg-rose-950/30 border-rose-200 text-rose-900' : 'bg-emerald-950/30 border-emerald-200 text-emerald-900'}`}>
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="flex items-center gap-1">
                        <Footprints className="w-3.5 h-3.5" />
                        Próximo Herraje:
                      </span>
                      <span className="font-mono">{eq.nextHerrajeDueDate || 'No registrado'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] mt-1 text-[#717973]">
                      <span>AIE Coggins: {eq.aieCertificateCode || 'N/A'}</span>
                      <span>{eq.cogginsValidUntil ? `Vence: ${eq.cogginsValidUntil}` : 'Sin vencimiento'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-[#f9f9f9] border-t border-[#eeeeee] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedEquineForHerraje(eq)}
                    className="flex-1 py-1.5 px-2.5 bg-[#123F2A]/60 hover:bg-[#e2efe8] text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-white/10"
                  >
                    <Footprints className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Herraje</span>
                  </button>

                  <button
                    onClick={() => setSelectedEquineForSanitary(eq)}
                    className="flex-1 py-1.5 px-2.5 bg-[#123F2A]/60 hover:bg-[#e2efe8] text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-white/10"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Sanidad</span>
                  </button>

                  <button
                    onClick={() => setSelectedEquineDetail(eq)}
                    className="py-1.5 px-3 bg-[#0D1A13] hover:bg-[#123F2A] text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#ffba38]" />
                    <span>Ficha</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#15241C] rounded-2xl border-2 border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0D1A13] text-white text-[11px] uppercase tracking-wider font-extrabold border-b border-[#012d1d]">
                  <th className="p-3">Hierro / Tag</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Especie</th>
                  <th className="p-3">Raza & Pelaje</th>
                  <th className="p-3 text-center">Edad / Peso</th>
                  <th className="p-3">Predio</th>
                  <th className="p-3">Aptitud</th>
                  <th className="p-3">Próx. Herraje</th>
                  <th className="p-3">AIE Coggins</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee] text-xs font-medium">
                {filteredEquines.map((eq) => {
                  const speciesBadge = getSpeciesLabel(eq.species);

                  return (
                    <tr key={eq.id} className="hover:bg-[#f4fbf7] transition-colors">
                      <td className="p-3 font-mono font-bold text-white">{eq.earTagOrIron}</td>
                      <td className="p-3 font-bold text-sm text-white">{eq.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${speciesBadge.bg}`}>
                          {eq.species.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-[#414844]">
                        {eq.breed} <br />
                        <span className="text-[10px] text-[#717973]">{eq.coatColor}</span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-white">
                        {eq.ageYears} yrs / {eq.weightKg} kg
                      </td>
                      <td className="p-3 text-white font-bold">{eq.farmName}</td>
                      <td className="p-3 text-[#2d6a4f] font-bold">{getAptitudeLabel(eq.aptitude)}</td>
                      <td className="p-3 font-mono text-white">{eq.nextHerrajeDueDate || 'N/A'}</td>
                      <td className="p-3 font-mono text-xs">{eq.aieCertificateCode || 'Sin certificado'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedEquineDetail(eq)}
                          className="px-2.5 py-1 bg-[#0D1A13] text-white rounded-lg font-bold text-[10px] hover:bg-[#123F2A] cursor-pointer"
                        >
                          Ver Ficha
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NUEVO EQUINO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#15241C] rounded-3xl border-2 border-[#012d1d] max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-[#A5B8AC] hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4 border-b border-[#eeeeee] pb-3">
              <HorseIcon className="w-6 h-6 text-[#ffba38]" />
              <span>Registrar Nuevo Equino / Mular / Asnal</span>
            </div>

            <form onSubmit={handleAddEquine} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">
                    Especie *
                  </label>
                  <select
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value as EquineSpecies)}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                  >
                    <option value="caballar">Caballar (Caballo / Yegua)</option>
                    <option value="mular">Mular (Mula / Macho Mular)</option>
                    <option value="asnal">Asnal (Burro / Asna)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">
                    Identificador / Hierro *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ej: H-12, MUL-08"
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">
                    Nombre del Ejemplar *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Relámpago, Consentida"
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Sexo</label>
                  <select
                    value={newSex}
                    onChange={(e) => setNewSex(e.target.value as any)}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                  >
                    <option value="capon">Capón (Macho castrado)</option>
                    <option value="macho">Macho Entero (Reproductor)</option>
                    <option value="hembra">Hembra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Raza</label>
                  <input
                    type="text"
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    placeholder="Criollo Colombiano, Cuarto de Milla..."
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Pelaje / Capa</label>
                  <input
                    type="text"
                    value={newCoat}
                    onChange={(e) => setNewCoat(e.target.value)}
                    placeholder="Castaño, Alazán, Bayo, Roano..."
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Edad (Años)</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Peso Estimado (kg)</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Predio / Finca</label>
                  <select
                    value={newFarm}
                    onChange={(e) => setNewFarm(e.target.value)}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                  >
                    {farms.map((f) => (
                      <option key={f.profile.id} value={f.profile.name}>
                        {f.profile.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Aptitud / Trabajo Principal</label>
                  <select
                    value={newAptitude}
                    onChange={(e) => setNewAptitude(e.target.value as EquineAptitude)}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                  >
                    <option value="trabajo_vaqueria">Trabajo & Vaquería</option>
                    <option value="carga_enjalma">Carga & Enjalma</option>
                    <option value="reproduccion_cria">Reproducción & Cría</option>
                    <option value="paseo_exposicion">Paseo & Exposición</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Vaquero / Arriero Encargado</label>
                  <input
                    type="text"
                    value={newRider}
                    onChange={(e) => setNewRider(e.target.value)}
                    placeholder="Ej: Don Carlos Mendoza"
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={newObs}
                  onChange={(e) => setNewObs(e.target.value)}
                  placeholder="Comportamiento, detalles sanitarios o antecedentes..."
                  className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-3 border-t border-[#eeeeee] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1F3327] text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0D1A13] text-white text-xs font-bold hover:bg-[#123F2A]"
                >
                  Guardar Ejemplar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR HERRAJE */}
      {selectedEquineForHerraje && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#15241C] rounded-3xl border-2 border-[#012d1d] max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedEquineForHerraje(null)}
              className="absolute right-4 top-4 text-[#A5B8AC] hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
              <Footprints className="w-6 h-6 text-[#2d6a4f]" />
              <span>Registrar Herraje & Mantenimiento de Cascos</span>
            </div>
            <p className="text-xs text-[#717973] mb-4">
              Ejemplar: <span className="font-bold text-white">{selectedEquineForHerraje.name} ({selectedEquineForHerraje.earTagOrIron})</span>
            </p>

            <form onSubmit={handleSaveHerraje} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Fecha de Herraje</label>
                <input
                  type="date"
                  required
                  value={herrajeDate}
                  onChange={(e) => setHerrajeDate(e.target.value)}
                  className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Tipo de Trabajo</label>
                <select
                  value={herrajeType}
                  onChange={(e) => setHerrajeType(e.target.value as any)}
                  className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                >
                  <option value="completo">Herraje Completo (4 Patas)</option>
                  <option value="delantero">Herraje Solo Delanteros</option>
                  <option value="recorte_cascos">Recorte & Aplomos sin Herradura</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Herrador</label>
                  <input
                    type="text"
                    value={farrierName}
                    onChange={(e) => setFarrierName(e.target.value)}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Costo ($ COP)</label>
                  <input
                    type="number"
                    value={herrajeCost}
                    onChange={(e) => setHerrajeCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Notas / Observaciones del Casco</label>
                <textarea
                  rows={2}
                  value={herrajeNotes}
                  onChange={(e) => setHerrajeNotes(e.target.value)}
                  placeholder="Especifique si requirió ramplón, tratamiento de palma o tipo de herradura..."
                  className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-3 border-t border-[#eeeeee] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEquineForHerraje(null)}
                  className="px-4 py-2 rounded-xl bg-[#1F3327] text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D1A13] text-white text-xs font-bold hover:bg-[#123F2A]"
                >
                  Guardar Herraje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR EVENTO SANITARIO */}
      {selectedEquineForSanitary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#15241C] rounded-3xl border-2 border-[#012d1d] max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedEquineForSanitary(null)}
              className="absolute right-4 top-4 text-[#A5B8AC] hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
              <ShieldCheck className="w-6 h-6 text-blue-700" />
              <span>Registrar Evento Sanitario & Vacunación</span>
            </div>
            <p className="text-xs text-[#717973] mb-4">
              Ejemplar: <span className="font-bold text-white">{selectedEquineForSanitary.name}</span>
            </p>

            <form onSubmit={handleSaveSanitary} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Tipo de Evento</label>
                <select
                  value={sanitaryType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setSanitaryType(val);
                    if (val === 'aie_coggins') setSanitaryTitle('Examen Coggins AIE');
                    else if (val === 'encefalitis') setSanitaryTitle('Vacuna Encefalitis Equina (EEV)');
                    else if (val === 'tetanos') setSanitaryTitle('Vacuna Tétanos Equino');
                    else if (val === 'desparasitacion') setSanitaryTitle('Desparasitación Oral');
                  }}
                  className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                >
                  <option value="aie_coggins">Examen AIE (Coggins Anemia Infecciosa)</option>
                  <option value="encefalitis">Vacuna Encefalitis Equina</option>
                  <option value="tetanos">Vacuna Tétanos</option>
                  <option value="desparasitacion">Desparasitador / Vermífugo</option>
                  <option value="vitamina">Complejo Vitamínico</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Título del Evento</label>
                <input
                  type="text"
                  required
                  value={sanitaryTitle}
                  onChange={(e) => setSanitaryTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Laboratorio / Fármaco</label>
                  <input
                    type="text"
                    value={sanitaryLab}
                    onChange={(e) => setSanitaryLab(e.target.value)}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Resultado / Dosis</label>
                  <input
                    type="text"
                    value={sanitaryResult}
                    onChange={(e) => setSanitaryResult(e.target.value)}
                    placeholder="NEGATIVO, 2 ml, etc."
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Fecha de Aplicación</label>
                  <input
                    type="date"
                    required
                    value={sanitaryDate}
                    onChange={(e) => setSanitaryDate(e.target.value)}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">Próximo Vencimiento</label>
                  <input
                    type="date"
                    value={sanitaryDueDate}
                    onChange={(e) => setSanitaryDueDate(e.target.value)}
                    className="w-full p-2.5 bg-[#f9f9f9] border border-white/10 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#eeeeee] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEquineForSanitary(null)}
                  className="px-4 py-2 rounded-xl bg-[#1F3327] text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D1A13] text-white text-xs font-bold hover:bg-[#123F2A]"
                >
                  Guardar Sanidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VER FICHA COMPLETA */}
      {selectedEquineDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#15241C] rounded-3xl border-2 border-[#012d1d] max-w-3xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedEquineDetail(null)}
              className="absolute right-4 top-4 text-[#A5B8AC] hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#eeeeee] pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0D1A13] text-[#ffba38] flex items-center justify-center font-bold text-xl shadow-md">
                <HorseIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold bg-[#D4A94E] text-white px-2 py-0.5 rounded">
                  {selectedEquineDetail.earTagOrIron}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedEquineDetail.name}</h2>
                <p className="text-xs text-[#717973] font-medium">
                  {selectedEquineDetail.species.toUpperCase()} • {selectedEquineDetail.breed} ({selectedEquineDetail.coatColor})
                </p>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#f4fbf7] p-4 rounded-2xl border border-[#c1ecd4]">
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-bold block">Predio Actual</span>
                  <span className="font-bold text-white">{selectedEquineDetail.farmName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-bold block">Aptitud Principal</span>
                  <span className="font-bold text-[#2d6a4f]">{getAptitudeLabel(selectedEquineDetail.aptitude)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-bold block">Edad / Peso</span>
                  <span className="font-mono font-bold text-white">{selectedEquineDetail.ageYears} Años • {selectedEquineDetail.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-bold block">Encargado</span>
                  <span className="font-bold text-white">{selectedEquineDetail.assignedRiderOrWorker || 'Sin asignar'}</span>
                </div>
              </div>

              {/* Pedigree & Identification */}
              <div className="bg-[#f9f9f9] p-4 rounded-2xl border border-[#eeeeee]">
                <h4 className="font-bold text-white uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#ffba38]" />
                  <span>Genealogía & Chip RFID</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-[#717973] block font-bold">Padre (Sire):</span>
                    <span className="font-medium text-white">{selectedEquineDetail.fatherName || 'No registrado'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#717973] block font-bold">Madre (Dam):</span>
                    <span className="font-medium text-white">{selectedEquineDetail.motherName || 'No registrada'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#717973] block font-bold">Chip RFID:</span>
                    <span className="font-mono text-white">{selectedEquineDetail.rfidChip || 'Sin Chip registrado'}</span>
                  </div>
                </div>
              </div>

              {/* History of Farriery */}
              <div>
                <h4 className="font-bold text-white uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-[#2d6a4f]" />
                  <span>Historial de Herrajes</span>
                </h4>
                {selectedEquineDetail.herrajeHistory && selectedEquineDetail.herrajeHistory.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedEquineDetail.herrajeHistory.map((h) => (
                      <div key={h.id} className="p-2.5 bg-[#15241C] rounded-xl border border-[#eeeeee] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-white">{h.date}</span> - <span className="font-bold">{h.type.toUpperCase()}</span> por <span className="text-[#2d6a4f]">{h.farrierName}</span>
                          {h.notes && <p className="text-[11px] text-[#717973]">{h.notes}</p>}
                        </div>
                        <span className="font-mono font-bold text-[#0D1A13]">${h.costCop.toLocaleString('es-CO')} COP</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#717973] italic">Sin registros previos de herraje.</p>
                )}
              </div>

              {/* History of Sanitary Events */}
              <div>
                <h4 className="font-bold text-white uppercase text-[11px] mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Historial de Vacunación & Coggins AIE</span>
                </h4>
                {selectedEquineDetail.sanitaryHistory && selectedEquineDetail.sanitaryHistory.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedEquineDetail.sanitaryHistory.map((s) => (
                      <div key={s.id} className="p-2.5 bg-[#15241C] rounded-xl border border-[#eeeeee] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-white">{s.date}</span> - <span className="font-bold">{s.title}</span> ({s.laboratoryOrMedication})
                          <p className="text-[11px] text-[#717973]">Resultado/Dosis: {s.resultOrDose}</p>
                        </div>
                        {s.nextDueDate && (
                          <span className="text-[10px] bg-blue-950/30 text-blue-900 font-bold px-2 py-0.5 rounded">
                            Vence: {s.nextDueDate}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#717973] italic">Sin eventos sanitarios registrados.</p>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#eeeeee] flex justify-end">
              <button
                onClick={() => setSelectedEquineDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#0D1A13] text-white text-xs font-bold"
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
