import React, { useState, useMemo } from 'react';
import { safeConfirm } from '../utils/printUtils';
import {
  ArtificialCalfRecord,
  CalfColostrumRecord,
  CalfDailyFeedingRecord,
  CalfGrowthWeightRecord,
  CalfHealthEventRecord,
  CalfHealthStatus,
  CalfHousingType,
  CalfFeedingType,
  CalfRearingModel,
  CalfRearingModelId,
} from '../types';
import { INITIAL_CALVES_DATA } from '../data/mockCalfData';
import { REARING_MODELS } from '../data/rearingModelsData';
import {
  Baby,
  Droplet,
  Scale,
  Stethoscope,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Sparkles,
  Milk,
  X,
  Trash2,
  Plus,
  ShieldCheck,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  Info,
  Clock,
  Printer,
  Sliders,
  Check,
  Zap,
  ArrowUpRight,
  ClipboardList,
  Layers,
  Lightbulb,
  DollarSign,
  Compass,
  CheckSquare
} from 'lucide-react';

interface CalfRearingViewProps {
  calves?: ArtificialCalfRecord[];
  onUpdateCalves?: (calves: ArtificialCalfRecord[]) => void;
}

export const CalfRearingView: React.FC<CalfRearingViewProps> = ({
  calves: propCalves,
  onUpdateCalves: propOnUpdateCalves,
}) => {
  // Local state initialized with prop or mock
  const [calvesState, setCalvesState] = useState<ArtificialCalfRecord[]>(
    propCalves && propCalves.length > 0 ? propCalves : INITIAL_CALVES_DATA
  );

  const calves = propCalves && propCalves.length > 0 ? propCalves : calvesState;

  const updateCalves = (updated: ArtificialCalfRecord[]) => {
    setCalvesState(updated);
    if (propOnUpdateCalves) {
      propOnUpdateCalves(updated);
    }
  };

  // Sub-tabs State
  const [activeSubTab, setActiveSubTab] = useState<
    'terneros_activos' | 'modelos_crianza' | 'calostrado_neonatal' | 'plan_alimentacion_curva' | 'controles_peso' | 'historial_sanitario'
  >('terneros_activos');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [housingFilter, setHousingFilter] = useState<'all' | CalfHousingType>('all');
  const [healthFilter, setHealthFilter] = useState<'all' | CalfHealthStatus>('all');
  const [selectedCalfId, setSelectedCalfId] = useState<string | null>(calves[0]?.id || null);

  // Rearing Models State
  const [selectedModelCategory, setSelectedModelCategory] = useState<string>('all');
  const [selectedModelForDetail, setSelectedModelForDetail] = useState<CalfRearingModel | null>(null);

  // Simulator State
  const [simGoal, setSimGoal] = useState<'lecheria' | 'doble_proposito' | 'carne' | 'tecnificada'>('lecheria');
  const [simCalvesCount, setSimCalvesCount] = useState<number>(15);
  const [simMilkPriceUSD, setSimMilkPriceUSD] = useState<number>(0.50);

  // Modals
  const [isAddCalfModalOpen, setIsAddCalfModalOpen] = useState(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isWeanModalOpen, setIsWeanModalOpen] = useState(false);

  const [modalTargetCalf, setModalTargetCalf] = useState<ArtificialCalfRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Form States
  // 1. Add Calf Form
  const [newEarTag, setNewEarTag] = useState('');
  const [newName, setNewName] = useState('');
  const [newSex, setNewSex] = useState<'Macho' | 'Hembra'>('Hembra');
  const [newBreed, setNewBreed] = useState('Girolando F1');
  const [newBirthDate, setNewBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBirthWeight, setNewBirthWeight] = useState<number>(33.0);
  const [newDamTag, setNewDamTag] = useState('');
  const [newSireTag, setNewSireTag] = useState('');
  const [newHousingType, setNewHousingType] = useState<CalfHousingType>('cuna_individual');
  const [newHousingNumber, setNewHousingNumber] = useState('Cuna A-05');
  const [newRearingModelId, setNewRearingModelId] = useState<CalfRearingModelId>('crianza_artificial_intensiva');
  const [newColostrumLiters, setNewColostrumLiters] = useState<number>(4.0);
  const [newBrixPercent, setNewBrixPercent] = useState<number>(25.0);
  const [newHoursPostBirth, setNewHoursPostBirth] = useState<number>(2.0);
  const [newDisinfections, setNewDisinfections] = useState(true);

  // 2. Feeding Form
  const [feedMorningLiters, setFeedMorningLiters] = useState<number>(3.0);
  const [feedAfternoonLiters, setFeedAfternoonLiters] = useState<number>(3.0);
  const [feedLiquidType, setFeedLiquidType] = useState<'Leche Entera' | 'Sustituto Lácteo Premium' | 'Transición Calostral'>('Sustituto Lácteo Premium');
  const [feedStarterGrams, setFeedStarterGrams] = useState<number>(750);
  const [feedForageGrams, setFeedForageGrams] = useState<number>(150);
  const [feedAppetite, setFeedAppetite] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [feedNotes, setFeedNotes] = useState('');

  // 3. Weight Form
  const [weightKg, setWeightKg] = useState<number>(55.0);
  const [heartGirthCm, setHeartGirthCm] = useState<number>(85);

  // 4. Health Form
  const [healthEventType, setHealthEventType] = useState<'diarrea_neonatal' | 'neumonia' | 'omfalitis' | 'vacunacion' | 'descorne' | 'desparasitacion' | 'podologia'>('vacunacion');
  const [healthDescription, setHealthDescription] = useState('');
  const [healthMedication, setHealthMedication] = useState('');
  const [healthDose, setHealthDose] = useState('');
  const [healthVet, setHealthVet] = useState('Dr. Roberto Silva');

  // Filtered Calves
  const filteredCalves = useMemo(() => {
    return calves.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.earTag.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.damTag.toLowerCase().includes(q) ||
        c.housingNumber.toLowerCase().includes(q) ||
        c.breed.toLowerCase().includes(q);

      const matchesHousing = housingFilter === 'all' || c.housingType === housingFilter;
      const matchesHealth = healthFilter === 'all' || c.healthStatus === healthFilter;

      return matchesSearch && matchesHousing && matchesHealth;
    });
  }, [calves, searchQuery, housingFilter, healthFilter]);

  // Selected Calf object
  const selectedCalf = useMemo(() => {
    return calves.find((c) => c.id === selectedCalfId) || calves[0] || null;
  }, [calves, selectedCalfId]);

  // Global KPIs
  const totalActiveCalves = calves.filter((c) => !c.weaned).length;
  const totalWeanedCalves = calves.filter((c) => c.weaned).length;

  const totalDailyMilkLiters = calves
    .filter((c) => !c.weaned)
    .reduce((acc, c) => acc + c.currentDailyMilkLiters, 0);

  const avgGrowthGdp = useMemo(() => {
    const allRecords = calves.flatMap((c) => c.growthHistory);
    const validRecords = allRecords.filter((r) => r.dailyGainGrams > 0);
    if (validRecords.length === 0) return 840;
    const sum = validRecords.reduce((acc, r) => acc + r.dailyGainGrams, 0);
    return Math.round(sum / validRecords.length);
  }, [calves]);

  const avgBrixColostrum = useMemo(() => {
    const colList = calves.map((c) => c.colostrumRecord).filter(Boolean);
    if (colList.length === 0) return 25;
    const sum = colList.reduce((acc, r) => acc + (r?.brixQualityPercent || 0), 0);
    return (sum / colList.length).toFixed(1);
  }, [calves]);

  const totalHealthAlerts = calves.filter(
    (c) => c.healthStatus === 'en_observacion' || c.healthStatus === 'tratamiento' || c.healthStatus === 'critico'
  ).length;

  // Handlers
  // 1. Create Calf
  const handleCreateCalf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEarTag.trim()) return;

    const newCalfId = `cal-${Date.now()}`;
    const autoName = newName.trim() || `Ternero ${newEarTag.trim()}`;

    const colostrum: CalfColostrumRecord = {
      id: `col-${Date.now()}`,
      calfId: newCalfId,
      colostrumDate: newBirthDate,
      litersFed: Number(newColostrumLiters) || 4.0,
      brixQualityPercent: Number(newBrixPercent) || 24.0,
      timePostBirthHours: Number(newHoursPostBirth) || 2.0,
      umbilicalDisinfectionDone: newDisinfections,
      iggPassivitySuccess: Number(newBrixPercent) >= 22,
      notes: 'Suministro inicial registrado en ingreso a sala de crianza.',
    };

    const initialWeightRecord: CalfGrowthWeightRecord = {
      id: `gro-${Date.now()}`,
      calfId: newCalfId,
      date: newBirthDate,
      weightKg: Number(newBirthWeight) || 32,
      dailyGainGrams: 0,
      ageDays: 0,
    };

    const newCalfRecord: ArtificialCalfRecord = {
      id: newCalfId,
      earTag: newEarTag.trim().toUpperCase(),
      name: autoName,
      sex: newSex,
      breed: newBreed,
      birthDate: newBirthDate,
      birthWeightKg: Number(newBirthWeight) || 32,
      currentWeightKg: Number(newBirthWeight) || 32,
      damTag: newDamTag.trim() || 'Madre No Reg.',
      sireTag: newSireTag.trim() || 'Inseminación IATF',
      housingType: newHousingType,
      housingNumber: newHousingNumber.trim() || 'Cuna 01',
      healthStatus: 'excelente',
      feedingType: 'calostro',
      currentDailyMilkLiters: 4.0,
      starterFeedConsumptionGrams: 100,
      colostrumRecord: colostrum,
      feedingHistory: [],
      growthHistory: [initialWeightRecord],
      healthHistory: [],
      targetWeaningDate: new Date(Date.parse(newBirthDate) + 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      weaned: false,
      rearingModelId: newRearingModelId,
    };

    updateCalves([newCalfRecord, ...calves]);
    setIsAddCalfModalOpen(false);
    setSelectedCalfId(newCalfId);
    showToast(`✅ Ternero/a ${newCalfRecord.earTag} ingresado/a a Crianza Artificial.`);

    // Reset Form
    setNewEarTag('');
    setNewName('');
    setNewDamTag('');
    setNewSireTag('');
  };

  // 2. Add Feeding Record
  const handleAddFeeding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTargetCalf) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const totalMilk = Number(feedMorningLiters) + Number(feedAfternoonLiters);

    const newFeeding: CalfDailyFeedingRecord = {
      id: `feed-${Date.now()}`,
      calfId: modalTargetCalf.id,
      date: todayStr,
      morningLiters: Number(feedMorningLiters),
      afternoonLiters: Number(feedAfternoonLiters),
      liquidType: feedLiquidType,
      starterFeedGrams: Number(feedStarterGrams),
      forageGrams: Number(feedForageGrams),
      waterAvailable: true,
      appetiteScore: feedAppetite,
      notes: feedNotes.trim(),
    };

    const updated = calves.map((c) => {
      if (c.id === modalTargetCalf.id) {
        return {
          ...c,
          currentDailyMilkLiters: totalMilk,
          starterFeedConsumptionGrams: Number(feedStarterGrams),
          feedingHistory: [newFeeding, ...c.feedingHistory],
        };
      }
      return c;
    });

    updateCalves(updated);
    setIsFeedModalOpen(false);
    setModalTargetCalf(null);
    showToast(`🥛 Toma de leche/sustituto (${totalMilk} L) registrada para ${modalTargetCalf.earTag}.`);
  };

  // 3. Add Weight Record
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTargetCalf) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newW = Number(weightKg);

    const birthDateObj = new Date(modalTargetCalf.birthDate);
    const todayObj = new Date(todayStr);
    const ageDays = Math.max(1, Math.round((todayObj.getTime() - birthDateObj.getTime()) / (1000 * 60 * 60 * 24)));

    const weightDiffGrams = (newW - modalTargetCalf.birthWeightKg) * 1000;
    const dailyGain = Math.round(weightDiffGrams / ageDays);

    const newWeightRecord: CalfGrowthWeightRecord = {
      id: `gro-${Date.now()}`,
      calfId: modalTargetCalf.id,
      date: todayStr,
      weightKg: newW,
      heartGirthCm: Number(heartGirthCm) || undefined,
      dailyGainGrams: Math.max(0, dailyGain),
      ageDays,
    };

    const updated = calves.map((c) => {
      if (c.id === modalTargetCalf.id) {
        return {
          ...c,
          currentWeightKg: newW,
          growthHistory: [newWeightRecord, ...c.growthHistory],
        };
      }
      return c;
    });

    updateCalves(updated);
    setIsWeightModalOpen(false);
    setModalTargetCalf(null);
    showToast(`⚖️ Pesaje registrado para ${modalTargetCalf.earTag}: ${newW} kg (GDP: ${dailyGain} g/día).`);
  };

  // 4. Add Health Record
  const handleAddHealthEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTargetCalf) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const newHealth: CalfHealthEventRecord = {
      id: `hea-${Date.now()}`,
      calfId: modalTargetCalf.id,
      date: todayStr,
      eventType: healthEventType,
      description: healthDescription.trim() || `Evento sanitario ${healthEventType}`,
      medication: healthMedication.trim() || undefined,
      dose: healthDose.trim() || undefined,
      vetInCharge: healthVet.trim() || 'Dr. Médico Veterinario',
      resolved: true,
    };

    // Determine new status if treatment vs vaccination
    let nextHealthStatus: CalfHealthStatus = modalTargetCalf.healthStatus;
    if (healthEventType === 'diarrea_neonatal' || healthEventType === 'neumonia' || healthEventType === 'omfalitis') {
      nextHealthStatus = 'tratamiento';
    }

    const updated = calves.map((c) => {
      if (c.id === modalTargetCalf.id) {
        return {
          ...c,
          healthStatus: nextHealthStatus,
          healthHistory: [newHealth, ...c.healthHistory],
        };
      }
      return c;
    });

    updateCalves(updated);
    setIsHealthModalOpen(false);
    setModalTargetCalf(null);
    showToast(`💉 Evento sanitario (${healthEventType}) registrado en ${modalTargetCalf.earTag}.`);
  };

  // 5. Wean / Graduate Calf
  const handleGraduateCalf = (calfId: string) => {
    const calf = calves.find((c) => c.id === calfId);
    if (!calf) return;

    if (!safeConfirm(`¿Confirma graduar/destetar a ${calf.earTag} (${calf.name}) y trasladarlo a potrero de levante?`)) {
      return;
    }

    const updated = calves.map((c) => {
      if (c.id === calfId) {
        return {
          ...c,
          weaned: true,
          feedingType: 'destetado' as CalfFeedingType,
          currentDailyMilkLiters: 0,
          housingType: 'pastoreo_terneril' as CalfHousingType,
          housingNumber: 'Potrero Levante 01',
        };
      }
      return c;
    });

    updateCalves(updated);
    showToast(`🎉 ¡Ternero/a ${calf.earTag} graduado exitosamente de la sala de crianza!`);
  };

  // Delete Calf Record
  const handleDeleteCalf = (calfId: string) => {
    if (!safeConfirm('¿Desea eliminar completamente este registro de ternero/a?')) return;
    const updated = calves.filter((c) => c.id !== calfId);
    updateCalves(updated);
    showToast('🗑️ Registro de ternero/a eliminado.');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 bg-[#c1ecd4] border-2 border-[#012d1d] text-[#002114] rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#012d1d] shrink-0" />
            <p className="text-xs font-black">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#012d1d] hover:text-black cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Module Banner Header */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border-2 border-[#012d1d] card-shadow space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#e2e2e2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center shrink-0 shadow-md">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-[#012d1d]">
                  Sala de Crianza Artificial de Terneros
                </h2>
                <span className="bg-[#ffba38] text-[#523700] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                  Sustituto / Calostrado & Desmante
                </span>
                <div className="group relative inline-flex items-center">
                  <button
                    type="button"
                    className="text-[#717973] hover:text-[#012d1d] transition-colors p-0.5 rounded cursor-pointer"
                    title="Control zootécnico integral de terneros en cunas/jaulas: calidad de calostrado (% Brix), curva de lactancia artificial, ración de inicio y ganancia diaria de peso pre-destete."
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-80 bg-[#012d1d] text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl border border-[#2d6a4f] pointer-events-none animate-in fade-in zoom-in-95">
                    Control zootécnico integral de terneros en cunas/jaulas: calidad de calostrado (% Brix), curva de lactancia artificial, ración de inicio y ganancia diaria de peso pre-destete.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddCalfModalOpen(true)}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-[#ffba38] px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#ffba38]" />
              Ingresar Ternero/a a Crianza
            </button>
          </div>
        </div>

        {/* 5 KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 bg-[#f8fbf9] border border-[#a2cfb8] rounded-2xl space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-[#717973] block flex items-center gap-1">
              <Baby className="w-3.5 h-3.5 text-[#012d1d]" /> Terneros Activos
            </span>
            <span className="text-2xl font-mono font-black text-[#012d1d] block">
              {totalActiveCalves} <span className="text-xs font-sans text-[#717973]">/ {calves.length}</span>
            </span>
            <span className="text-[10px] text-emerald-800 font-bold block">En cunas & jaulas</span>
          </div>

          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-blue-900 block flex items-center gap-1">
              <Milk className="w-3.5 h-3.5 text-blue-700" /> Leche / Sustituto Hoy
            </span>
            <span className="text-2xl font-mono font-black text-blue-950 block">{totalDailyMilkLiters} L</span>
            <span className="text-[10px] text-blue-800 font-bold block">Distribución Diaria</span>
          </div>

          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-amber-900 block flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-amber-700" /> Promedio GDP
            </span>
            <span className="text-2xl font-mono font-black text-amber-950 block">{avgGrowthGdp} g/día</span>
            <span className="text-[10px] text-amber-800 font-bold block">Ganancia Diaria Pre-destete</span>
          </div>

          <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-emerald-900 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Calostro Promedio
            </span>
            <span className="text-2xl font-mono font-black text-emerald-800 block">{avgBrixColostrum}% Brix</span>
            <span className="text-[10px] text-emerald-700 font-bold block">Alta Inmunidad IgG</span>
          </div>

          <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-1 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-black uppercase text-rose-900 block flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-rose-700" /> Alertas Sanidad
            </span>
            <span className="text-2xl font-mono font-black text-rose-950 block">{totalHealthAlerts} Terneros</span>
            <span className="text-[10px] text-rose-800 font-bold block">Observación / Tratamiento</span>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-[#eeeeee] pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('terneros_activos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'terneros_activos'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
                : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
            }`}
          >
            <Baby className="w-4 h-4 text-[#ffba38]" />
            Terneros & Cunas ({filteredCalves.length})
          </button>

          <button
            onClick={() => setActiveSubTab('modelos_crianza')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'modelos_crianza'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
                : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            Modelos de Crianza (5)
          </button>

          <button
            onClick={() => setActiveSubTab('calostrado_neonatal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'calostrado_neonatal'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
                : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Calostrado & 48h
          </button>

          <button
            onClick={() => setActiveSubTab('plan_alimentacion_curva')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'plan_alimentacion_curva'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
                : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
            }`}
          >
            <Milk className="w-4 h-4 text-blue-600" />
            Plan de Lactancia & Curva
          </button>

          <button
            onClick={() => setActiveSubTab('controles_peso')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'controles_peso'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
                : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-600" />
            Controles de Pesaje & GDP
          </button>

          <button
            onClick={() => setActiveSubTab('historial_sanitario')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'historial_sanitario'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
                : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-rose-600" />
            Eventos Sanitario / Descorne
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: TERNEROS ACTIVOS & FICHA INDIVIDUAL                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'terneros_activos' && (
        <div className="space-y-6">
          {/* Search & Filters Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#717973]" />
              <input
                type="text"
                placeholder="Buscar por Arete (Ej: TER-101), Nombre, Madre o Cuna..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-[#012d1d] focus:bg-white focus:border-[#012d1d] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-[#717973]" />
                <select
                  value={housingFilter}
                  onChange={(e) => setHousingFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-extrabold text-[#012d1d] focus:outline-none cursor-pointer py-1"
                >
                  <option value="all">Todas las Instalaciones</option>
                  <option value="cuna_individual">🏠 Cuna Individual</option>
                  <option value="jaula_elevada">🪜 Jaula Elevada</option>
                  <option value="corral_colectivo">🐄 Corral Colectivo</option>
                  <option value="pastoreo_terneril">🌿 Pastoreo Levante</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-2.5 py-1">
                <Sliders className="w-3.5 h-3.5 text-[#717973]" />
                <select
                  value={healthFilter}
                  onChange={(e) => setHealthFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-extrabold text-[#012d1d] focus:outline-none cursor-pointer py-1"
                >
                  <option value="all">Todos los Estados Salud</option>
                  <option value="excelente">⭐ Excelente</option>
                  <option value="bueno">✅ Bueno</option>
                  <option value="en_observacion">👁️ En Observación</option>
                  <option value="tratamiento">💊 Tratamiento</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calves Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCalves.map((calf) => {
              const isSelected = selectedCalfId === calf.id;
              const lastGrowth = calf.growthHistory[0];
              const lastFeeding = calf.feedingHistory[0];

              return (
                <div
                  key={calf.id}
                  onClick={() => setSelectedCalfId(calf.id)}
                  className={`bg-white rounded-3xl border-2 p-5 transition-all cursor-pointer card-shadow flex flex-col justify-between space-y-4 ${
                    isSelected ? 'border-[#012d1d] ring-2 ring-[#012d1d]/20 bg-[#fbfdfc]' : 'border-[#e2e2e2] hover:border-[#a2cfb8]'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#eeeeee] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-xs">
                        {calf.earTag.substring(0, 7)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-sm text-[#012d1d]">{calf.earTag}</h4>
                          <span className={`text-[9.5px] font-black px-2 py-0.2 rounded-full ${
                            calf.sex === 'Hembra' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {calf.sex}
                          </span>
                        </div>
                        <p className="text-xs text-[#717973] font-bold">{calf.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold bg-[#f0f4f1] text-[#012d1d] px-2 py-0.5 rounded border border-[#c1c8c2] block">
                        {calf.housingNumber}
                      </span>
                      {calf.weaned ? (
                        <span className="text-[9.5px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          🎉 Graduado / Destetado
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          🍼 Crianza Activa
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-[#f8fbf9] rounded-xl border border-[#eeeeee]">
                      <span className="text-[9.5px] text-[#717973] font-bold uppercase block">Raza / Genética</span>
                      <span className="font-bold text-[#012d1d] block truncate">{calf.breed}</span>
                    </div>

                    <div className="p-2 bg-[#f8fbf9] rounded-xl border border-[#eeeeee]">
                      <span className="text-[9.5px] text-[#717973] font-bold uppercase block">Madre</span>
                      <span className="font-bold text-[#012d1d] block truncate">{calf.damTag}</span>
                    </div>

                    <div className="p-2 bg-[#f8fbf9] rounded-xl border border-[#eeeeee]">
                      <span className="text-[9.5px] text-[#717973] font-bold uppercase block">Peso Actual</span>
                      <span className="font-mono font-black text-[#012d1d] text-sm block">
                        {calf.currentWeightKg} kg
                      </span>
                      <span className="text-[9px] text-[#717973]">Nacer: {calf.birthWeightKg} kg</span>
                    </div>

                    <div className="p-2 bg-[#f8fbf9] rounded-xl border border-[#eeeeee]">
                      <span className="text-[9.5px] text-[#717973] font-bold uppercase block">GDP Pre-destete</span>
                      <span className="font-mono font-black text-emerald-800 text-sm block">
                        +{lastGrowth?.dailyGainGrams || 800} g/d
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold">Ganancia Diaria</span>
                    </div>
                  </div>

                  {/* Liquid Diet status */}
                  <div className="p-2.5 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Milk className="w-4 h-4 text-blue-700 shrink-0" />
                      <div>
                        <span className="font-bold text-blue-950 block text-[11px]">Ración Láctea</span>
                        <span className="text-[10px] text-blue-800 font-mono">
                          {calf.weaned ? 'Alimento Seco / Pasto' : `${calf.currentDailyMilkLiters} Litros / día`}
                        </span>
                      </div>
                    </div>

                    <span className="font-extrabold text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                      {calf.feedingType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#eeeeee]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalTargetCalf(calf);
                          setIsFeedModalOpen(true);
                        }}
                        disabled={calf.weaned}
                        className="p-1.5 bg-[#f0f7f4] hover:bg-[#e2efe8] text-[#012d1d] rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                        title="Registrar Toma de Leche"
                      >
                        <Milk className="w-4 h-4 text-blue-700" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalTargetCalf(calf);
                          setIsWeightModalOpen(true);
                        }}
                        className="p-1.5 bg-[#f0f7f4] hover:bg-[#e2efe8] text-[#012d1d] rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Registrar Pesaje"
                      >
                        <Scale className="w-4 h-4 text-amber-700" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalTargetCalf(calf);
                          setIsHealthModalOpen(true);
                        }}
                        className="p-1.5 bg-[#f0f7f4] hover:bg-[#e2efe8] text-[#012d1d] rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Registrar Sanidad"
                      >
                        <Stethoscope className="w-4 h-4 text-rose-700" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCalf(calf.id);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Eliminar Ternero"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {!calf.weaned ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGraduateCalf(calf.id);
                        }}
                        className="bg-[#012d1d] hover:bg-[#1b4332] text-[#ffba38] px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <span>Graduar</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> En Potrero
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Calf Detailed Card */}
          {selectedCalf && (
            <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#eeeeee] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-mono font-black text-sm">
                    {selectedCalf.earTag}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#012d1d] flex items-center gap-2">
                      Ficha Zootécnica Completa: {selectedCalf.earTag} - {selectedCalf.name}
                    </h3>
                    <p className="text-xs text-[#717973] font-medium">
                      Nacido el {selectedCalf.birthDate} • Ubicación: <b>{selectedCalf.housingNumber}</b> ({selectedCalf.housingType.replace('_', ' ')})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-[#f0f4f1] border border-[#c1c8c2] text-[#012d1d] px-3 py-1 rounded-xl font-bold">
                    Target Destete: {selectedCalf.targetWeaningDate}
                  </span>
                </div>
              </div>

              {/* Detail Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Calostrado */}
                <div className="p-4 bg-[#f8fbf9] border border-[#a2cfb8] rounded-2xl space-y-2 text-xs">
                  <h5 className="font-black text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" /> Registro de Calostrado
                  </h5>
                  {selectedCalf.colostrumRecord ? (
                    <div className="space-y-1 font-medium text-[#012d1d]">
                      <p>• Volumen Suministrado: <b>{selectedCalf.colostrumRecord.litersFed} L</b></p>
                      <p>• Calidad Refractómetro Brix: <b className="font-mono text-emerald-800">{selectedCalf.colostrumRecord.brixQualityPercent}% Brix</b></p>
                      <p>• Tiempo Post-parto: <b>{selectedCalf.colostrumRecord.timePostBirthHours} Horas</b></p>
                      <p>• Curación Ombligo (Yodo 10%): <b className="text-emerald-800">✅ Realizada</b></p>
                    </div>
                  ) : (
                    <p className="text-[#717973] italic">Sin registro de calostrado registrado.</p>
                  )}
                </div>

                {/* Card 2: Growth Chart Summary */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
                  <h5 className="font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-700" /> Curva de Crecimiento & Pesajes
                  </h5>
                  <div className="space-y-1 text-amber-950 font-medium">
                    <p>• Peso Nacimiento: <b>{selectedCalf.birthWeightKg} kg</b></p>
                    <p>• Peso Actual: <b className="font-mono text-base font-black text-amber-900">{selectedCalf.currentWeightKg} kg</b></p>
                    <p>• Historial Pesajes: <b>{selectedCalf.growthHistory.length} mediciones</b></p>
                    <p>• Ganancia Total Acumulada: <b>+{(selectedCalf.currentWeightKg - selectedCalf.birthWeightKg).toFixed(1)} kg</b></p>
                  </div>
                </div>

                {/* Card 3: Health Log */}
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2 text-xs">
                  <h5 className="font-black text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-rose-700" /> Historial Sanitario
                  </h5>
                  {selectedCalf.healthHistory.length > 0 ? (
                    <div className="space-y-1 text-rose-950 text-[11px]">
                      {selectedCalf.healthHistory.slice(0, 3).map((h) => (
                        <div key={h.id} className="border-b border-rose-200/60 pb-1">
                          <span className="font-bold text-rose-900">[{h.date}] {h.eventType.toUpperCase()}</span>: {h.description}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-rose-800 italic">Ternero/a sin eventos ni enfermedades reportadas.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: MODELOS DE CRIANZA BOVINA                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'modelos_crianza' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold shrink-0 shadow-md">
                  <Layers className="w-6 h-6 text-[#ffba38]" />
                </div>
                <div>
                  <h3 className="font-black text-lg md:text-xl text-[#012d1d] flex items-center gap-2">
                    Modelos & Sistemas Zootécnicos de Crianza
                  </h3>
                  <p className="text-xs text-[#717973] max-w-2xl">
                    Sistemas estandarizados de crianza láctea pre-destete. Elija y aplique el modelo que mejor se adapte a los objetivos productivos y recursos de su predio.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#f0f4f1] p-1.5 rounded-2xl border border-[#c1c8c2] overflow-x-auto">
                {['all', 'Lechería Especializada', 'Doble Propósito', 'Tecnificada / Estabulada', 'Cría a Campo', 'Tradicional'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedModelCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer whitespace-nowrap ${
                      selectedModelCategory === cat
                        ? 'bg-[#012d1d] text-[#ffba38] shadow-xs'
                        : 'text-[#012d1d] hover:bg-white'
                    }`}
                  >
                    {cat === 'all' ? 'Todos los Modelos' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
              {REARING_MODELS.filter(
                (m) => selectedModelCategory === 'all' || m.category === selectedModelCategory
              ).map((model) => (
                <div
                  key={model.id}
                  className="bg-[#f8fdfa] rounded-2xl border-2 border-[#012d1d] p-5 space-y-4 card-shadow hover:border-[#ffba38] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2efe8] pb-2.5">
                      <span className="bg-[#012d1d] text-[#ffba38] text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        {model.category}
                      </span>
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-black px-2.5 py-0.5 rounded-xl flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700" /> Target GDP: {model.targetGDPGrams} g/día
                      </span>
                    </div>

                    <h4 className="font-black text-base text-[#012d1d] leading-snug">
                      {model.name}
                    </h4>

                    <p className="text-xs text-[#525a55] leading-relaxed">
                      {model.description}
                    </p>

                    {/* Key Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#c1c8c2] text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717973] block">Duración</span>
                        <span className="text-sm font-mono font-black text-[#012d1d]">{model.durationDays} días</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717973] block">Costo Est.</span>
                        <span className="text-sm font-mono font-black text-amber-900">${model.estimatedCostPerCalfUSD} USD</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717973] block">Ganancia D.</span>
                        <span className="text-sm font-mono font-black text-emerald-800">+{model.targetGDPGrams} g</span>
                      </div>
                    </div>

                    {/* Protocol and Weaning */}
                    <div className="space-y-2 text-xs">
                      <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200 space-y-1">
                        <span className="font-black text-blue-950 uppercase text-[10px] flex items-center gap-1">
                          <Milk className="w-3.5 h-3.5 text-blue-700" /> Protocolo Alimentario:
                        </span>
                        <p className="text-[#334155] font-medium leading-tight">{model.feedingProtocol}</p>
                      </div>

                      <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 space-y-1">
                        <span className="font-black text-amber-950 uppercase text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> Criterio de Destete:
                        </span>
                        <p className="text-[#451a03] font-medium leading-tight">{model.weaningCriteria}</p>
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="space-y-1">
                        <span className="font-black text-emerald-800 block uppercase text-[10px]">Ventajas Clave:</span>
                        {model.pros.slice(0, 3).map((pro, idx) => (
                          <p key={idx} className="text-[#1e3a2b] flex items-start gap-1">
                            <span className="text-emerald-600 font-bold">✓</span> {pro}
                          </p>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <span className="font-black text-rose-800 block uppercase text-[10px]">Consideraciones:</span>
                        {model.cons.slice(0, 2).map((con, idx) => (
                          <p key={idx} className="text-[#4c0519] flex items-start gap-1">
                            <span className="text-rose-500 font-bold">✗</span> {con}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer & Recommended Breeds */}
                  <div className="pt-3 border-t border-[#e2efe8] space-y-3">
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <span className="font-bold text-[#717973]">Razas Recomendadas:</span>
                      {model.recommendedBreeds.map((breed) => (
                        <span
                          key={breed}
                          className="bg-[#012d1d]/10 text-[#012d1d] font-bold px-2 py-0.5 rounded-md"
                        >
                          {breed}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedModelForDetail(model);
                        showToast(`💡 Modelo "${model.name}" seleccionado para análisis detallado.`);
                      }}
                      className="w-full bg-[#012d1d] hover:bg-[#1b4332] text-[#ffba38] py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-[#ffba38]" />
                      Ver Ficha Técnica Completa & Guias
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparative Matrix Table */}
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
            <div className="flex items-center gap-3 border-b border-[#eeeeee] pb-3">
              <ClipboardList className="w-5 h-5 text-[#012d1d]" />
              <h4 className="font-black text-base text-[#012d1d]">
                Matriz Comparativa de Modelos de Crianza Bovina
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-[#ffba38] font-black uppercase text-[10px]">
                    <th className="p-3 rounded-tl-xl">Modelo de Crianza</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3 text-center">Duración (Días)</th>
                    <th className="p-3 text-center">GDP Objetivo</th>
                    <th className="p-3 text-center">Costo Est. ($)</th>
                    <th className="p-3">Alojamiento Típico</th>
                    <th className="p-3 rounded-tr-xl">Dieta Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e2e2]">
                  {REARING_MODELS.map((m) => (
                    <tr key={m.id} className="hover:bg-[#f8fdfa] transition-colors font-medium text-[#012d1d]">
                      <td className="p-3 font-bold text-[#012d1d] max-w-[220px]">
                        {m.name}
                      </td>
                      <td className="p-3">
                        <span className="bg-[#012d1d]/10 text-[#012d1d] font-bold px-2 py-0.5 rounded-md text-[10px]">
                          {m.category}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#012d1d]">
                        {m.durationDays}d
                      </td>
                      <td className="p-3 text-center font-mono font-black text-emerald-800">
                        +{m.targetGDPGrams} g/d
                      </td>
                      <td className="p-3 text-center font-mono font-black text-amber-900">
                        ${m.estimatedCostPerCalfUSD}
                      </td>
                      <td className="p-3 text-[11px] text-[#525a55] max-w-[200px]">
                        {m.housingRecommended}
                      </td>
                      <td className="p-3 text-[11px] text-[#334155] max-w-[200px]">
                        {m.feedingProtocol.slice(0, 50)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Model Recommendation Simulator */}
          <div className="bg-gradient-to-br from-[#012d1d] to-[#0d4731] text-white rounded-3xl p-6 border-2 border-[#012d1d] card-shadow space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1b5e43] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ffba38] text-[#012d1d] flex items-center justify-center font-bold shrink-0 shadow-md">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-[#ffba38]">
                    Simulador Inteligente: Selección de Modelo de Crianza
                  </h4>
                  <p className="text-xs text-emerald-100 max-w-xl">
                    Calcule el retorno financiero por leche liberada y descubra el modelo técnico idóneo según la escala y meta de su finca.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Goal Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-100 block">Propósito Principal de la Finca:</label>
                <select
                  value={simGoal}
                  onChange={(e) => setSimGoal(e.target.value as any)}
                  className="w-full bg-[#03402a] border border-[#1b5e43] text-white rounded-xl px-3 py-2.5 font-bold text-xs"
                >
                  <option value="lecheria">🥛 Lechería Especializada (Alta Producción)</option>
                  <option value="doble_proposito">🐄 Doble Propósito (Carne + Leche)</option>
                  <option value="tecnificada">🤖 Estabulación Tecnificada (RFID / Automático)</option>
                  <option value="carne">🥩 Cría Bovina a Campo / Extensiva</option>
                </select>
              </div>

              {/* Calf Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-100 block">Terneros Creados / Mes:</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={simCalvesCount}
                  onChange={(e) => setSimCalvesCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#03402a] border border-[#1b5e43] text-white rounded-xl px-3 py-2 font-mono font-bold text-sm"
                />
              </div>

              {/* Milk Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-100 block">Precio Comercial Leche ($/Litro):</label>
                <input
                  type="number"
                  step="0.05"
                  value={simMilkPriceUSD}
                  onChange={(e) => setSimMilkPriceUSD(Number(e.target.value))}
                  className="w-full bg-[#03402a] border border-[#1b5e43] text-white rounded-xl px-3 py-2 font-mono font-bold text-sm"
                />
              </div>
            </div>

            {/* Simulation Results Card */}
            {(() => {
              const recommended = REARING_MODELS.find((m) => {
                if (simGoal === 'lecheria') return m.id === 'crianza_artificial_intensiva';
                if (simGoal === 'doble_proposito') return m.id === 'crianza_vaca_nodriza';
                if (simGoal === 'tecnificada') return m.id === 'crianza_colectiva_automatica';
                if (simGoal === 'carne') return m.id === 'crianza_pastoreo_creep_feeding';
                return m.id === 'crianza_tradicional_balde';
              }) || REARING_MODELS[0];

              const totalMilkSavedLiters = simCalvesCount * 240; // Approx 240 L per calf
              const grossMilkRevenue = totalMilkSavedLiters * simMilkPriceUSD;
              const totalRearingCost = simCalvesCount * recommended.estimatedCostPerCalfUSD;
              const netBenefit = grossMilkRevenue - totalRearingCost;

              return (
                <div className="bg-[#03402a] rounded-2xl p-5 border border-[#1b5e43] space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#1b5e43] pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase text-[#ffba38] bg-[#012d1d] px-2.5 py-0.5 rounded-full">
                        RECOMENDACIÓN TÉCNICA SUGERIDA
                      </span>
                      <h5 className="font-black text-lg text-white mt-1">
                        {recommended.name}
                      </h5>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-200 block">GDP Objetivo Esperado</span>
                      <span className="text-xl font-mono font-black text-[#ffba38]">+{recommended.targetGDPGrams} g/día</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3 bg-[#012d1d] rounded-xl border border-[#1b5e43]">
                      <span className="text-[10px] text-emerald-200 uppercase block font-bold">Leche Liberada/Mes</span>
                      <span className="text-lg font-mono font-black text-white">{totalMilkSavedLiters.toLocaleString()} Litros</span>
                    </div>

                    <div className="p-3 bg-[#012d1d] rounded-xl border border-[#1b5e43]">
                      <span className="text-[10px] text-emerald-200 uppercase block font-bold">Ingreso por Leche Com.</span>
                      <span className="text-lg font-mono font-black text-emerald-300">${grossMilkRevenue.toFixed(0)} USD</span>
                    </div>

                    <div className="p-3 bg-[#012d1d] rounded-xl border border-[#1b5e43]">
                      <span className="text-[10px] text-emerald-200 uppercase block font-bold">Retorno Neto Estimado</span>
                      <span className={`text-lg font-mono font-black ${netBenefit >= 0 ? 'text-[#ffba38]' : 'text-rose-300'}`}>
                        ${netBenefit.toFixed(0)} USD
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100 font-medium italic">
                    💡 <b>Dictamen Zootécnico:</b> {recommended.description} Alojamiento recomendado: <b>{recommended.housingRecommended}</b>.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}


      {activeSubTab === 'calostrado_neonatal' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg text-[#012d1d]">
                    Monitoreo de Calostrado y Transmisión de Inmunidad Pasiva (IgG)
                  </h3>
                  <p className="text-xs text-[#717973]">
                    Primeras 24-48 horas vitales para prevenir mortalidad neonatal y asegurar salud intestinal
                  </p>
                </div>
              </div>
            </div>

            {/* Colostrum Rule Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-emerald-950">
              <div className="space-y-1">
                <span className="font-black uppercase block text-emerald-800">1. Tiempo de Oro (&lt; 2 Horas)</span>
                <p>Suministrar el 1er volumen de calostro dentro de las primeras 2 horas post-parto (máxima absorción de inmunoglobulinas IgG).</p>
              </div>

              <div className="space-y-1">
                <span className="font-black uppercase block text-emerald-800">2. Calidad Refractómetro (&gt; 22% Brix)</span>
                <p>Medir calidad con refractómetro Brix. Calostro excelente &gt;22-25% Brix equivalente a &gt;50g/L de IgG.</p>
              </div>

              <div className="space-y-1">
                <span className="font-black uppercase block text-emerald-800">3. Volumen Objetivo (10% Peso Vivo)</span>
                <p>Suministrar de 3.5 L a 4.0 L en las primeras 6 horas para terneros de 35-40 kg de peso vivo.</p>
              </div>
            </div>

            {/* Table of Colostrum Records */}
            <div className="overflow-x-auto rounded-2xl border border-[#c1c8c2]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0f4f1] text-[#012d1d] font-black uppercase text-[10.5px] border-b border-[#c1c8c2]">
                    <th className="p-3">Ternero / Arete</th>
                    <th className="p-3">Madre</th>
                    <th className="p-3 text-center">Fecha Nacimiento</th>
                    <th className="p-3 text-right">Volumen (L)</th>
                    <th className="p-3 text-right">Calidad Brix (%)</th>
                    <th className="p-3 text-center">Horas Post-Parto</th>
                    <th className="p-3 text-center">Curación Ombligo</th>
                    <th className="p-3 text-center">Inmunidad IgG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee] font-mono">
                  {calves.map((calf) => {
                    const col = calf.colostrumRecord;
                    return (
                      <tr key={calf.id} className="hover:bg-[#f8fbf9]">
                        <td className="p-3 font-sans">
                          <span className="font-black text-[#012d1d] block">{calf.earTag}</span>
                          <span className="text-[10px] text-[#717973]">{calf.name}</span>
                        </td>
                        <td className="p-3 font-sans font-bold text-[#012d1d]">{calf.damTag}</td>
                        <td className="p-3 text-center">{calf.birthDate}</td>
                        <td className="p-3 text-right font-black text-[#012d1d]">
                          {col ? `${col.litersFed} L` : '-'}
                        </td>
                        <td className="p-3 text-right font-black text-emerald-800">
                          {col ? `${col.brixQualityPercent}% Brix` : '-'}
                        </td>
                        <td className="p-3 text-center font-bold">
                          {col ? `${col.timePostBirthHours} h` : '-'}
                        </td>
                        <td className="p-3 text-center font-sans">
                          {col?.umbilicalDisinfectionDone ? (
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              ✅ Yodo 10%
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-sans">
                          {col?.iggPassivitySuccess ? (
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                              ⭐ Inmunidad Élite
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                              Alerta
                            </span>
                          )}
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
      {/* SUB-TAB 3: PLAN DE LACTANCIA ARTIFICIAL & CURVA                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'plan_alimentacion_curva' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
            <div className="flex items-center gap-3 border-b border-[#eeeeee] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold">
                <Milk className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-black text-base md:text-lg text-[#012d1d]">
                  Curva Estándar de Alimentación Láctea y Desmante Precoz (8 Semanas)
                </h3>
                <p className="text-xs text-[#717973]">
                  Esquema nutricional recomendado por semana de vida para estimular desarrollo ruminal temprano
                </p>
              </div>
            </div>

            {/* Weekly Feeding Protocol Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#c1c8c2]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0f4f1] text-[#012d1d] font-black uppercase text-[10.5px] border-b border-[#c1c8c2]">
                    <th className="p-3">Semana de Crianza</th>
                    <th className="p-3">Dieta Láctea (L/día)</th>
                    <th className="p-3">Distribución Tomas</th>
                    <th className="p-3">Concentrado Starter (g/día)</th>
                    <th className="p-3">Heno / Forraje Seco</th>
                    <th className="p-3">Objetivo GDP (g/día)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee] font-medium">
                  <tr className="hover:bg-[#f8fbf9]">
                    <td className="p-3 font-black text-[#012d1d]">Semana 1 (Días 1 - 7)</td>
                    <td className="p-3 font-mono font-bold text-blue-900">4.0 - 5.0 L / día</td>
                    <td className="p-3">2 tomas (2.5 L Mañana / 2.5 L Tarde)</td>
                    <td className="p-3 font-mono">100 - 200 g / día</td>
                    <td className="p-3 text-[#717973]">Solo agua limpia a voluntad</td>
                    <td className="p-3 font-mono font-bold text-emerald-800">500 - 650 g/día</td>
                  </tr>

                  <tr className="hover:bg-[#f8fbf9]">
                    <td className="p-3 font-black text-[#012d1d]">Semana 2 - 4 (Días 8 - 28)</td>
                    <td className="p-3 font-mono font-bold text-blue-900">6.0 L / día</td>
                    <td className="p-3">2 tomas (3.0 L Mañana / 3.0 L Tarde)</td>
                    <td className="p-3 font-mono">300 - 600 g / día</td>
                    <td className="p-3 text-emerald-800 font-bold">Ofrecer heno suave picado (100g)</td>
                    <td className="p-3 font-mono font-bold text-emerald-800">750 - 850 g/día</td>
                  </tr>

                  <tr className="hover:bg-[#f8fbf9]">
                    <td className="p-3 font-black text-[#012d1d]">Semana 5 - 6 (Días 29 - 42)</td>
                    <td className="p-3 font-mono font-bold text-blue-900">5.0 - 6.0 L / día</td>
                    <td className="p-3">2 tomas (Pico de apetito)</td>
                    <td className="p-3 font-mono">800 - 1,200 g / día</td>
                    <td className="p-3 font-bold">Heno suave libre elección</td>
                    <td className="p-3 font-mono font-bold text-emerald-800">850 - 950 g/día</td>
                  </tr>

                  <tr className="hover:bg-[#f8fbf9] bg-amber-50/50">
                    <td className="p-3 font-black text-amber-950">Semana 7 (Reducción Desmante)</td>
                    <td className="p-3 font-mono font-bold text-amber-900">3.0 L / día</td>
                    <td className="p-3 font-bold text-amber-900">1 toma única (Mañana)</td>
                    <td className="p-3 font-mono font-bold">1,500 g / día</td>
                    <td className="p-3 font-bold text-amber-900">Agua + Heno abundante</td>
                    <td className="p-3 font-mono font-bold text-amber-900">900 g/día</td>
                  </tr>

                  <tr className="hover:bg-[#f8fbf9] bg-emerald-50/60">
                    <td className="p-3 font-black text-emerald-950">Semana 8 (Destete Definitivo)</td>
                    <td className="p-3 font-mono font-bold text-emerald-900">0.0 L (Destetado)</td>
                    <td className="p-3 font-bold text-emerald-900">Pasaje a Potrero Levante</td>
                    <td className="p-3 font-mono font-bold text-emerald-900">1,800 - 2,000 g / día</td>
                    <td className="p-3 font-bold text-emerald-900">Pastoreo directo + Sales</td>
                    <td className="p-3 font-mono font-black text-emerald-900">&gt; 900 g/día</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: CONTROLES DE PESAJE & GDP                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'controles_peso' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg text-[#012d1d]">
                    Historial de Pesajes & Ganancia Diaria de Peso (GDP)
                  </h3>
                  <p className="text-xs text-[#717973]">
                    Monitoreo biométrico de crecimiento pre-destete y desarrollo muscular
                  </p>
                </div>
              </div>
            </div>

            {/* Weights Log */}
            <div className="space-y-3">
              {calves.map((calf) => (
                <div key={calf.id} className="p-4 bg-[#f8fbf9] border border-[#a2cfb8] rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#c1c8c2] pb-2">
                    <span className="font-black text-sm text-[#012d1d]">
                      {calf.earTag} - {calf.name} ({calf.breed})
                    </span>
                    <span className="font-mono text-xs font-bold bg-[#e2efe8] text-[#15803d] px-2.5 py-0.5 rounded-full">
                      Peso Actual: {calf.currentWeightKg} kg
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {calf.growthHistory.map((gro) => (
                      <div key={gro.id} className="p-2.5 bg-white rounded-xl border border-[#eeeeee] space-y-0.5">
                        <span className="text-[10px] text-[#717973] font-bold block">Fecha: {gro.date} ({gro.ageDays} días)</span>
                        <span className="font-mono font-black text-sm text-[#012d1d] block">{gro.weightKg} kg</span>
                        <span className="text-[10px] font-bold text-emerald-800 block">GDP: +{gro.dailyGainGrams} g/día</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: HISTORIAL SANITARIO / EVENTOS                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'historial_sanitario' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg text-[#012d1d]">
                    Registro Sanitario, Vacunación Neonatal & Descorne
                  </h3>
                  <p className="text-xs text-[#717973]">
                    Tratamientos de neumonía, diarrea neonatal, omfalitis y protocolos profilácticos
                  </p>
                </div>
              </div>
            </div>

            {/* Health Records List */}
            <div className="space-y-3">
              {calves.flatMap((c) => c.healthHistory).length === 0 ? (
                <p className="text-center py-8 text-xs text-[#717973] italic">
                  No se registran eventos sanitarios. Todos los terneros se encuentran sanos.
                </p>
              ) : (
                calves.map((calf) => {
                  if (calf.healthHistory.length === 0) return null;
                  return (
                    <div key={calf.id} className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-2 text-xs">
                      <h4 className="font-black text-rose-950 text-xs">
                        Ternero/a: {calf.earTag} ({calf.name}) - Ubicación: {calf.housingNumber}
                      </h4>

                      <div className="divide-y divide-rose-200">
                        {calf.healthHistory.map((h) => (
                          <div key={h.id} className="py-2 space-y-1">
                            <div className="flex items-center justify-between font-bold text-[#012d1d]">
                              <span>[{h.date}] <span className="uppercase text-rose-900">{h.eventType.replace('_', ' ')}</span></span>
                              <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full">
                                {h.vetInCharge}
                              </span>
                            </div>
                            <p className="text-[#717973]">{h.description}</p>
                            {h.medication && (
                              <p className="font-mono text-[11px] text-rose-900">
                                💊 <b>Tratamiento:</b> {h.medication} ({h.dose})
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INGRESAR TERNERO A CRIANZA ARTIFICIAL                            */}
      {/* ========================================================================= */}
      {isAddCalfModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-2xl w-full p-5 md:p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#012d1d]">Ingresar Ternero/a a Crianza Artificial</h3>
                  <p className="text-xs text-[#717973]">Registro neonatal, calostrado inicial y asignación de cuna/jaula</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddCalfModalOpen(false)}
                className="p-2 text-[#717973] hover:text-black rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCalf} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Arete Ternero/a *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: TER-105"
                    value={newEarTag}
                    onChange={(e) => setNewEarTag(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Nombre / Identificación:</label>
                  <input
                    type="text"
                    placeholder="Ej: Lucero 105"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Sexo:</label>
                  <select
                    value={newSex}
                    onChange={(e) => setNewSex(e.target.value as any)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  >
                    <option value="Hembra">♀ Hembra</option>
                    <option value="Macho">♂ Macho</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Raza / Cruce Genético:</label>
                  <input
                    type="text"
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Fecha de Nacimiento:</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Peso al Nacer (kg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBirthWeight}
                    onChange={(e) => setNewBirthWeight(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Vaca Madre (Arete):</label>
                  <input
                    type="text"
                    placeholder="Ej: V-504"
                    value={newDamTag}
                    onChange={(e) => setNewDamTag(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Instalación Asignada:</label>
                  <select
                    value={newHousingType}
                    onChange={(e) => setNewHousingType(e.target.value as any)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  >
                    <option value="cuna_individual">🏠 Cuna Individual</option>
                    <option value="jaula_elevada">🪜 Jaula Elevada</option>
                    <option value="corral_colectivo">🐄 Corral Colectivo</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">N° Cuna / Jaula:</label>
                  <input
                    type="text"
                    placeholder="Ej: Cuna A-05"
                    value={newHousingNumber}
                    onChange={(e) => setNewHousingNumber(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  />
                </div>
              </div>

              {/* Rearing Model Selection */}
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Modelo de Crianza Asignado *:</label>
                <select
                  value={newRearingModelId}
                  onChange={(e) => setNewRearingModelId(e.target.value as CalfRearingModelId)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                >
                  {REARING_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Colostrum Sub-section */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-2">
                <h4 className="font-black text-emerald-950 uppercase text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Registro de Suministro de Calostro Inicial
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Volumen (Litros):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newColostrumLiters}
                      onChange={(e) => setNewColostrumLiters(Number(e.target.value))}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-2.5 py-1.5 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Calidad Brix (%):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newBrixPercent}
                      onChange={(e) => setNewBrixPercent(Number(e.target.value))}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-2.5 py-1.5 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Horas Post-Parto:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newHoursPostBirth}
                      onChange={(e) => setNewHoursPostBirth(Number(e.target.value))}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-2.5 py-1.5 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsAddCalfModalOpen(false)}
                  className="px-4 py-2 bg-[#f0f4f1] text-[#012d1d] rounded-xl font-bold hover:bg-[#e2efe8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-[#ffba38] rounded-xl font-black hover:bg-[#1b4332] shadow-md cursor-pointer"
                >
                  Guardar Ternero/a
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTRAR TOMA DIARIA DE LECHE / SUSTITUTO                        */}
      {/* ========================================================================= */}
      {isFeedModalOpen && modalTargetCalf && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-2.5">
                <Milk className="w-5 h-5 text-blue-700" />
                <h3 className="font-black text-base text-[#012d1d]">
                  Registrar Toma Láctea: {modalTargetCalf.earTag}
                </h3>
              </div>
              <button onClick={() => setIsFeedModalOpen(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFeeding} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Litros Mañana (AM):</label>
                  <input
                    type="number"
                    step="0.25"
                    value={feedMorningLiters}
                    onChange={(e) => setFeedMorningLiters(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Litros Tarde (PM):</label>
                  <input
                    type="number"
                    step="0.25"
                    value={feedAfternoonLiters}
                    onChange={(e) => setFeedAfternoonLiters(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Tipo de Dieta Láctea:</label>
                <select
                  value={feedLiquidType}
                  onChange={(e) => setFeedLiquidType(e.target.value as any)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold"
                >
                  <option value="Sustituto Lácteo Premium">Sustituto Lácteo Premium (22% Proteína)</option>
                  <option value="Leche Entera">Leche Entera de Ordeño</option>
                  <option value="Transición Calostral">Transición Calostral</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Concentrado Starter (Gramos):</label>
                  <input
                    type="number"
                    step="50"
                    value={feedStarterGrams}
                    onChange={(e) => setFeedStarterGrams(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Puntaje de Apetito (1 a 5):</label>
                  <select
                    value={feedAppetite}
                    onChange={(e) => setFeedAppetite(Number(e.target.value) as any)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold"
                  >
                    <option value={5}>5 - Vigoroso / Consume todo en &lt; 3min</option>
                    <option value={4}>4 - Normal / Apetito Bueno</option>
                    <option value={3}>3 - Lento / Consume parcial</option>
                    <option value={2}>2 - Rechazo Parcial</option>
                    <option value={1}>1 - Anorexia / Rechazo Total</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Observaciones:</label>
                <input
                  type="text"
                  placeholder="Ej: Buena hidratación y reflejo de succión."
                  value={feedNotes}
                  onChange={(e) => setFeedNotes(e.target.value)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsFeedModalOpen(false)}
                  className="px-4 py-2 bg-[#f0f4f1] text-[#012d1d] rounded-xl font-bold hover:bg-[#e2efe8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-[#ffba38] rounded-xl font-black hover:bg-[#1b4332] shadow-md cursor-pointer"
                >
                  Guardar Toma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTRAR PESAJE & BIOMETRÍA                                     */}
      {/* ========================================================================= */}
      {isWeightModalOpen && modalTargetCalf && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-amber-700" />
                <h3 className="font-black text-base text-[#012d1d]">
                  Registrar Pesaje: {modalTargetCalf.earTag}
                </h3>
              </div>
              <button onClick={() => setIsWeightModalOpen(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWeight} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Peso Medido (kg) *:</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-black text-lg text-[#012d1d]"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Perímetro Torácico (cm):</label>
                <input
                  type="number"
                  value={heartGirthCm}
                  onChange={(e) => setHeartGirthCm(Number(e.target.value))}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="px-4 py-2 bg-[#f0f4f1] text-[#012d1d] rounded-xl font-bold hover:bg-[#e2efe8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-[#ffba38] rounded-xl font-black hover:bg-[#1b4332] shadow-md cursor-pointer"
                >
                  Guardar Pesaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REGISTRAR EVENTO SANITARIO / DESCORNE                            */}
      {/* ========================================================================= */}
      {isHealthModalOpen && modalTargetCalf && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-5 h-5 text-rose-700" />
                <h3 className="font-black text-base text-[#012d1d]">
                  Registrar Evento Sanitario: {modalTargetCalf.earTag}
                </h3>
              </div>
              <button onClick={() => setIsHealthModalOpen(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHealthEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Tipo de Evento *:</label>
                <select
                  value={healthEventType}
                  onChange={(e) => setHealthEventType(e.target.value as any)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold"
                >
                  <option value="vacunacion">💉 Vacunación Profiláctica</option>
                  <option value="descorne">🔥 Descorne Térmico / Químico</option>
                  <option value="diarrea_neonatal">🤒 Diarrea Neonatal</option>
                  <option value="neumonia">🫁 Neumonía / DVB</option>
                  <option value="omfalitis">🩹 Omfalitis (Infección Ombligo)</option>
                  <option value="desparasitacion">🪱 Desparasitación Interna</option>
                  <option value="podologia">🦶 Podología / Salud de Pezuñas</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Descripción / Hallazgos:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Descorne químico con analgésico local"
                  value={healthDescription}
                  onChange={(e) => setHealthDescription(e.target.value)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Medicamento / Producto:</label>
                  <input
                    type="text"
                    placeholder="Ej: Scourguard / Meloxicam"
                    value={healthMedication}
                    onChange={(e) => setHealthMedication(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Dosis Suministrada:</label>
                  <input
                    type="text"
                    placeholder="Ej: 2 ml IM"
                    value={healthDose}
                    onChange={(e) => setHealthDose(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Veterinario / Encargado:</label>
                <input
                  type="text"
                  value={healthVet}
                  onChange={(e) => setHealthVet(e.target.value)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsHealthModalOpen(false)}
                  className="px-4 py-2 bg-[#f0f4f1] text-[#012d1d] rounded-xl font-bold hover:bg-[#e2efe8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-[#ffba38] rounded-xl font-black hover:bg-[#1b4332] shadow-md cursor-pointer"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: FICHA TÉCNICA DETALLADA DE MODELO DE CRIANZA                    */}
      {/* ========================================================================= */}
      {selectedModelForDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold shrink-0">
                  <Layers className="w-5 h-5 text-[#ffba38]" />
                </div>
                <div>
                  <span className="bg-[#012d1d] text-[#ffba38] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase">
                    {selectedModelForDetail.category}
                  </span>
                  <h3 className="font-black text-lg text-[#012d1d] mt-1">
                    {selectedModelForDetail.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedModelForDetail(null)}
                className="text-[#717973] hover:text-black p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-[#525a55] leading-relaxed font-medium">
                {selectedModelForDetail.description}
              </p>

              <div className="grid grid-cols-3 gap-3 bg-[#f0f4f1] p-3 rounded-2xl text-center border border-[#c1c8c2]">
                <div>
                  <span className="text-[10px] font-bold text-[#717973] uppercase block">Duración Estimada</span>
                  <span className="text-base font-mono font-black text-[#012d1d]">{selectedModelForDetail.durationDays} Días</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#717973] uppercase block">Ganancia Diaria (GDP)</span>
                  <span className="text-base font-mono font-black text-emerald-800">+{selectedModelForDetail.targetGDPGrams} g/día</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#717973] uppercase block">Costo Directo Est.</span>
                  <span className="text-base font-mono font-black text-amber-900">${selectedModelForDetail.estimatedCostPerCalfUSD} USD</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-black text-[#012d1d] uppercase text-[11px] flex items-center gap-1.5">
                  <Milk className="w-4 h-4 text-blue-600" /> Esquema de Nutrición Láctea:
                </h5>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl font-medium text-[#1e293b]">
                  {selectedModelForDetail.feedingProtocol}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-black text-[#012d1d] uppercase text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" /> Regla de Oro para el Destete Definitivo:
                </h5>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl font-medium text-[#451a03]">
                  {selectedModelForDetail.weaningCriteria}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                  <h6 className="font-black text-emerald-950 uppercase text-[10.5px]">Ventajas Principales:</h6>
                  <ul className="space-y-1 text-emerald-900">
                    {selectedModelForDetail.pros.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="font-bold">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                  <h6 className="font-black text-rose-950 uppercase text-[10.5px]">Consideraciones de Manejo:</h6>
                  <ul className="space-y-1 text-rose-900">
                    {selectedModelForDetail.cons.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="font-bold">✗</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-[#eeeeee] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[#717973]">Razas Ideales:</span>
                  {selectedModelForDetail.recommendedBreeds.map((b) => (
                    <span key={b} className="bg-[#012d1d] text-[#ffba38] text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {b}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedModelForDetail(null)}
                  className="px-5 py-2 bg-[#012d1d] text-[#ffba38] rounded-xl font-black hover:bg-[#1b4332] shadow-md cursor-pointer"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
