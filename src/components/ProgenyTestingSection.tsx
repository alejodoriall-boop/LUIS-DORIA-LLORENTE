import React, { useState, useMemo } from 'react';
import { safePrint, safeConfirm } from '../utils/printUtils';
import { ProgenyTestRecord, ProgenyOffspringRecord, SemenInventoryItem, PedigreeAnimal } from '../types';
import {
  Dna,
  Award,
  Search,
  Filter,
  Plus,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  Trash2,
  BarChart3,
  TrendingUp,
  Scale,
  Milk,
  FileText,
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  GitBranch,
  Star,
  Activity,
  Calendar,
  User,
  Sliders
} from 'lucide-react';

interface ProgenyTestingSectionProps {
  progenyTests: ProgenyTestRecord[];
  onUpdateProgenyTests: (tests: ProgenyTestRecord[]) => void;
  semenInventory: SemenInventoryItem[];
  bullsList: PedigreeAnimal[];
}

export const ProgenyTestingSection: React.FC<ProgenyTestingSectionProps> = ({
  progenyTests,
  onUpdateProgenyTests,
  semenInventory,
  bullsList,
}) => {
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'probado_excelente' | 'probado_positivo' | 'en_evaluacion' | 'descartado'>('all');
  const [aptitudeFilter, setAptitudeFilter] = useState<'all' | 'Leche' | 'Carne' | 'Doble Propósito'>('all');
  const [expandedSireId, setExpandedSireId] = useState<string | null>(progenyTests[0]?.id || null);

  // Modal States
  const [isAddTestModalOpen, setIsAddTestModalOpen] = useState(false);
  const [isAddOffspringModalOpen, setIsAddOffspringModalOpen] = useState(false);
  const [targetSireForOffspring, setTargetSireForOffspring] = useState<ProgenyTestRecord | null>(null);
  const [isPrintCertificateModalOpen, setIsPrintCertificateModalOpen] = useState(false);
  const [certificateSire, setCertificateSire] = useState<ProgenyTestRecord | null>(null);

  // New Progeny Test Form State
  const [newSireId, setNewSireId] = useState('');
  const [newSireName, setNewSireName] = useState('');
  const [newSireRegister, setNewSireRegister] = useState('');
  const [newSireBreed, setNewSireBreed] = useState('Brangus Negro');
  const [newAptitude, setNewAptitude] = useState<'Carne' | 'Leche' | 'Doble Propósito'>('Carne');
  const [newEvaluator, setNewEvaluator] = useState('Dr. Roberto Silva (Genetista Evaluador ASOCEBU)');
  const [newEvalDate, setNewEvalDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEvalStatus, setNewEvalStatus] = useState<'probado_excelente' | 'probado_positivo' | 'en_evaluacion' | 'descartado'>('probado_positivo');
  const [newDepMilk, setNewDepMilk] = useState<number>(250);
  const [newDepWeaningWeight, setNewDepWeaningWeight] = useState<number>(18.5);
  const [newDepBirthWeight, setNewDepBirthWeight] = useState<number>(0.8);
  const [newDepCalvingEase, setNewDepCalvingEase] = useState<number>(97.5);
  const [newReliability, setNewReliability] = useState<number>(85.0);
  const [newRecommendations, setNewRecommendations] = useState('');

  // Draft Offspring List for New Test Modal
  const [draftOffsprings, setDraftOffsprings] = useState<ProgenyOffspringRecord[]>([]);

  // Individual Offspring Form (for adding inside modal or adding to existing test)
  const [offTag, setOffTag] = useState('');
  const [offName, setOffName] = useState('');
  const [offDamTag, setOffDamTag] = useState('');
  const [offSex, setOffSex] = useState<'Macho' | 'Hembra'>('Macho');
  const [offBirthDate, setOffBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [offBirthWeight, setOffBirthWeight] = useState<number>(32);
  const [offWeaningWeight, setOffWeaningWeight] = useState<number>(245);
  const [offFinalWeight, setOffFinalWeight] = useState<number>(470);
  const [offDailyGain, setOffDailyGain] = useState<number>(1015);
  const [offMilk305, setOffMilk305] = useState<number>(4500);
  const [offCalvingEase, setOffCalvingEase] = useState<number>(1);
  const [offConformation, setOffConformation] = useState<number>(9.0);
  const [offNotes, setOffNotes] = useState('');

  // Toast Notice State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filtered Progeny Tests
  const filteredTests = useMemo(() => {
    return progenyTests.filter((test) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        test.sireName.toLowerCase().includes(q) ||
        test.sireRegister.toLowerCase().includes(q) ||
        test.sireBreed.toLowerCase().includes(q) ||
        test.testCode.toLowerCase().includes(q) ||
        test.offspringRecords.some((off) => off.offspringTag.toLowerCase().includes(q) || off.offspringName.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || test.evaluationStatus === statusFilter;
      const matchesAptitude = aptitudeFilter === 'all' || test.aptitude === aptitudeFilter;

      return matchesSearch && matchesStatus && matchesAptitude;
    });
  }, [progenyTests, searchQuery, statusFilter, aptitudeFilter]);

  // Global KPIs Calculation
  const totalSiresEvaluated = progenyTests.length;
  const totalOffspringMeasured = progenyTests.reduce((acc, t) => acc + (t.offspringRecords?.length || t.offspringCountMeasured || 0), 0);
  
  const allOffsprings = progenyTests.flatMap((t) => t.offspringRecords || []);
  const avgGdp = allOffsprings.length > 0
    ? Math.round(allOffsprings.reduce((acc, o) => acc + (o.dailyWeightGainGrams || 0), 0) / allOffsprings.length)
    : 1020;

  const femaleOffspringsWithMilk = allOffsprings.filter((o) => o.milk305dLiters && o.milk305dLiters > 0);
  const avgMilk305 = femaleOffspringsWithMilk.length > 0
    ? Math.round(femaleOffspringsWithMilk.reduce((acc, o) => acc + (o.milk305dLiters || 0), 0) / femaleOffspringsWithMilk.length)
    : 5400;

  const eliteSiresCount = progenyTests.filter((t) => t.evaluationStatus === 'probado_excelente' || t.evaluationStatus === 'probado_positivo').length;

  // Handle Add Draft Offspring to New Test Modal
  const handleAddDraftOffspring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offTag.trim()) {
      alert('Por favor ingrese el arete de la cría');
      return;
    }

    const newOff: ProgenyOffspringRecord = {
      id: `off-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      offspringTag: offTag.trim(),
      offspringName: offName.trim() || `Cría ${offTag.trim()}`,
      damTag: offDamTag.trim() || 'Vaca Madre Base',
      sex: offSex,
      birthDate: offBirthDate,
      birthWeightKg: Number(offBirthWeight) || 32,
      weaningWeight210dKg: Number(offWeaningWeight) || 230,
      finalWeight18mKg: offSex === 'Macho' ? Number(offFinalWeight) || 470 : undefined,
      dailyWeightGainGrams: Number(offDailyGain) || 1000,
      milk305dLiters: offSex === 'Hembra' ? Number(offMilk305) || 4500 : undefined,
      calvingEaseScore: Number(offCalvingEase) || 1,
      conformationScore: Number(offConformation) || 9.0,
      notes: offNotes.trim(),
    };

    setDraftOffsprings([...draftOffsprings, newOff]);

    // Reset offspring subform
    setOffTag('');
    setOffName('');
    setOffDamTag('');
    setOffNotes('');
  };

  // Handle Create New Progeny Test
  const handleCreateProgenyTest = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSireName = newSireName.trim() || 'Toro Semental Evaluado';
    const autoCode = `PRU-PROG-2026-${(progenyTests.length + 1).toString().padStart(2, '0')}`;

    const newTestRecord: ProgenyTestRecord = {
      id: `pru-${Date.now()}`,
      testCode: autoCode,
      sireId: newSireId || `sire-${Date.now()}`,
      sireName: finalSireName,
      sireRegister: newSireRegister.trim() || 'REG-PENDIENTE',
      sireBreed: newSireBreed,
      aptitude: newAptitude,
      evaluatorVeterinarian: newEvaluator.trim() || 'Dr. Médico Veterinario Evaluador',
      evaluationDate: newEvalDate,
      evaluationStatus: newEvalStatus,
      offspringCountMeasured: draftOffsprings.length,
      offspringRecords: draftOffsprings,
      depMilkKg: Number(newDepMilk) || 0,
      depWeaningWeightKg: Number(newDepWeaningWeight) || 0,
      depBirthWeightKg: Number(newDepBirthWeight) || 0,
      depCalvingEasePercent: Number(newDepCalvingEase) || 98.0,
      reliabilityPercent: Number(newReliability) || 80.0,
      recommendations: newRecommendations.trim() || 'Evaluación de prueba de progenie registrada para seguimiento del mérito genético paterno.',
    };

    onUpdateProgenyTests([newTestRecord, ...progenyTests]);
    setIsAddTestModalOpen(false);
    setExpandedSireId(newTestRecord.id);
    showToast(`✅ Prueba de Progenie (${autoCode} - ${finalSireName}) registrada con éxito.`);

    // Reset main form
    setNewSireName('');
    setNewSireRegister('');
    setNewRecommendations('');
    setDraftOffsprings([]);
  };

  // Handle Add Offspring to Existing Test
  const handleAddOffspringToExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSireForOffspring || !offTag.trim()) return;

    const newOff: ProgenyOffspringRecord = {
      id: `off-${Date.now()}`,
      offspringTag: offTag.trim(),
      offspringName: offName.trim() || `Cría ${offTag.trim()}`,
      damTag: offDamTag.trim() || 'Vaca Madre Hato',
      sex: offSex,
      birthDate: offBirthDate,
      birthWeightKg: Number(offBirthWeight) || 32,
      weaningWeight210dKg: Number(offWeaningWeight) || 240,
      finalWeight18mKg: offSex === 'Macho' ? Number(offFinalWeight) || 470 : undefined,
      dailyWeightGainGrams: Number(offDailyGain) || 1020,
      milk305dLiters: offSex === 'Hembra' ? Number(offMilk305) || 4800 : undefined,
      calvingEaseScore: Number(offCalvingEase) || 1,
      conformationScore: Number(offConformation) || 9.0,
      notes: offNotes.trim(),
    };

    const updatedTests = progenyTests.map((test) => {
      if (test.id === targetSireForOffspring.id) {
        const nextRecords = [newOff, ...(test.offspringRecords || [])];
        return {
          ...test,
          offspringRecords: nextRecords,
          offspringCountMeasured: nextRecords.length,
        };
      }
      return test;
    });

    onUpdateProgenyTests(updatedTests);
    setIsAddOffspringModalOpen(false);
    setTargetSireForOffspring(null);
    showToast(`✅ Cría ${newOff.offspringTag} vinculada correctamente a la prueba de ${targetSireForOffspring.sireName}.`);

    // Reset offspring input fields
    setOffTag('');
    setOffName('');
    setOffDamTag('');
    setOffNotes('');
  };

  // Remove offspring from test
  const handleRemoveOffspring = (sireTestId: string, offspringId: string) => {
    if (!safeConfirm('¿Está seguro de eliminar esta cría de la prueba de progenie?')) return;

    const updated = progenyTests.map((test) => {
      if (test.id === sireTestId) {
        const nextOffsprings = test.offspringRecords.filter((o) => o.id !== offspringId);
        return {
          ...test,
          offspringRecords: nextOffsprings,
          offspringCountMeasured: nextOffsprings.length,
        };
      }
      return test;
    });

    onUpdateProgenyTests(updated);
    showToast('🗑️ Registro de cría eliminado.');
  };

  // Delete Sire Test
  const handleDeleteSireTest = (sireTestId: string) => {
    if (!safeConfirm('¿Desea eliminar este registro completo de Prueba de Progenie?')) return;
    const updated = progenyTests.filter((t) => t.id !== sireTestId);
    onUpdateProgenyTests(updated);
    showToast('🗑️ Registro de Prueba de Progenie eliminado.');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-[#c1ecd4] border-2 border-[#012d1d] text-[#002114] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#012d1d] shrink-0" />
            <p className="text-xs font-black">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#012d1d] hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Banner Header for Progeny Testing */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border-2 border-[#012d1d] card-shadow space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#e2e2e2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center shrink-0 shadow-md">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-[#012d1d]">
                  Módulo de Registro & Evaluación de Prueba de Progenies
                </h3>
                <span className="bg-[#ffba38] text-[#523700] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                  Mérito Genético Paterno (DEP)
                </span>
              </div>
              <p className="text-xs text-[#717973] max-w-3xl mt-0.5">
                Evaluación zootécnica de toros sementales a través del rendimiento medido en sus descendientes (peso nacimiento, peso destete a 210d, ganancia diaria de peso y lactancia proyectada a 305 días).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddTestModalOpen(true)}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-[#ffba38] px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#ffba38]" />
              Nueva Prueba de Progenie
            </button>
          </div>
        </div>

        {/* 5 KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 bg-[#f8fbf9] border border-[#a2cfb8] rounded-2xl space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-[#717973] block flex items-center gap-1">
              <Dna className="w-3.5 h-3.5 text-[#012d1d]" /> Toros Evaluados
            </span>
            <span className="text-2xl font-mono font-black text-[#012d1d] block">{totalSiresEvaluated}</span>
            <span className="text-[10px] text-emerald-800 font-bold block">Sementales en Programa</span>
          </div>

          <div className="p-3.5 bg-[#f8fbf9] border border-[#a2cfb8] rounded-2xl space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-[#717973] block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#012d1d]" /> Crías Medidas
            </span>
            <span className="text-2xl font-mono font-black text-[#012d1d] block">{totalOffspringMeasured}</span>
            <span className="text-[10px] text-[#717973] font-bold block">Descendientes con Registro</span>
          </div>

          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-amber-900 block flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-amber-700" /> Promedio GDP Crías
            </span>
            <span className="text-2xl font-mono font-black text-amber-950 block">{avgGdp} g/día</span>
            <span className="text-[10px] text-amber-800 font-bold block">Ganancia Diaria Cárnica</span>
          </div>

          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-blue-900 block flex items-center gap-1">
              <Milk className="w-3.5 h-3.5 text-blue-700" /> Prom. Leche 305d
            </span>
            <span className="text-2xl font-mono font-black text-blue-950 block">{avgMilk305} L</span>
            <span className="text-[10px] text-blue-800 font-bold block">Producción Hijas Lecheras</span>
          </div>

          <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-1 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-black uppercase text-emerald-900 block flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-700" /> Toros Probados Élite
            </span>
            <span className="text-2xl font-mono font-black text-emerald-800 block">{eliteSiresCount} Toros</span>
            <span className="text-[10px] text-emerald-700 font-bold block">Certificados Positivos</span>
          </div>
        </div>

        {/* Search Toolbar & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#717973]" />
            <input
              type="text"
              placeholder="Buscar por Toro Padre, Registro, Raza o Arete de Cría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-[#012d1d] focus:bg-white focus:border-[#012d1d] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-[#717973]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs font-extrabold text-[#012d1d] focus:outline-none cursor-pointer py-1"
              >
                <option value="all">Todos los Estados</option>
                <option value="probado_excelente">⭐ Probado Excelente / Élite</option>
                <option value="probado_positivo">✅ Probado Positivo</option>
                <option value="en_evaluacion">⏳ En Evaluación</option>
                <option value="descartado">❌ Descartado</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-2.5 py-1">
              <Sliders className="w-3.5 h-3.5 text-[#717973]" />
              <select
                value={aptitudeFilter}
                onChange={(e) => setAptitudeFilter(e.target.value as any)}
                className="bg-transparent text-xs font-extrabold text-[#012d1d] focus:outline-none cursor-pointer py-1"
              >
                <option value="all">Todas las Aptitudes</option>
                <option value="Carne">🥩 Carne Especializada</option>
                <option value="Leche">🥛 Leche / Doble Propósito</option>
                <option value="Doble Propósito">⚖️ Doble Propósito</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* List of Progeny Tested Sires */}
      <div className="space-y-4">
        {filteredTests.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#c1c8c2] rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-black text-sm text-[#012d1d]">No se encontraron Pruebas de Progenies</h4>
            <p className="text-xs text-[#717973] max-w-md mx-auto">
              No hay registros que coincidan con la búsqueda o filtros aplicados. Registre un nuevo toro semental para iniciar la evaluación de descendencia.
            </p>
            <button
              onClick={() => setIsAddTestModalOpen(true)}
              className="bg-[#012d1d] text-[#ffba38] px-4 py-2 rounded-xl text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Registrar Primera Prueba
            </button>
          </div>
        ) : (
          filteredTests.map((test) => {
            const isExpanded = expandedSireId === test.id;
            const offsprings = test.offspringRecords || [];

            return (
              <div
                key={test.id}
                className="bg-white rounded-3xl border-2 border-[#012d1d] overflow-hidden card-shadow transition-all"
              >
                {/* Sire Card Main Header */}
                <div className="p-4 md:p-5 bg-[#fcfdfe] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#eeeeee]">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center shrink-0 shadow-md font-mono font-black text-sm">
                      <Zap className="w-6 h-6 text-[#ffba38]" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-base md:text-lg text-[#012d1d]">{test.sireName}</span>
                        <span className="font-mono text-xs bg-[#f0f4f1] text-[#012d1d] px-2 py-0.5 rounded border border-[#c1c8c2] font-bold">
                          Reg: {test.sireRegister}
                        </span>
                        <span className="text-[11px] font-bold bg-[#e2efe8] text-[#15803d] px-2.5 py-0.5 rounded-full">
                          {test.sireBreed}
                        </span>
                        {test.evaluationStatus === 'probado_excelente' && (
                          <span className="text-[10px] font-black uppercase bg-amber-400 text-[#523700] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 fill-current" /> Toro Probado Élite
                          </span>
                        )}
                        {test.evaluationStatus === 'probado_positivo' && (
                          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Probado Positivo
                          </span>
                        )}
                        {test.evaluationStatus === 'en_evaluacion' && (
                          <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Activity className="w-3 h-3" /> En Evaluación
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#717973] mt-1 font-medium">
                        <span>Aptitud: <b>{test.aptitude}</b></span>
                        <span>•</span>
                        <span>Código: <b className="font-mono">{test.testCode}</b></span>
                        <span>•</span>
                        <span>Evaluador: <b>{test.evaluatorVeterinarian}</b></span>
                        <span>•</span>
                        <span>Fecha: <b>{test.evaluationDate}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Sire Card Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[#eeeeee]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCertificateSire(test);
                          setIsPrintCertificateModalOpen(true);
                        }}
                        className="bg-[#f0f7f4] hover:bg-[#e2efe8] text-[#012d1d] border border-[#a2cfb8] px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Imprimir Certificado de Prueba de Progenies"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-700" /> Certificado
                      </button>

                      <button
                        onClick={() => {
                          setTargetSireForOffspring(test);
                          setIsAddOffspringModalOpen(true);
                        }}
                        className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar Cría
                      </button>

                      <button
                        onClick={() => handleDeleteSireTest(test.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Eliminar Prueba"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => setExpandedSireId(isExpanded ? null : test.id)}
                      className="bg-[#012d1d] text-white px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Ocultar Hijas/Hijos' : `Ver Hijas/Hijos (${offsprings.length})`}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sire DEPs Summary Banner */}
                <div className="bg-[#f8fbf9] p-4 border-b border-[#eeeeee] grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-[#c1c8c2] text-center">
                    <span className="text-[10px] font-black text-[#717973] uppercase block">DEP Leche (305d)</span>
                    <span className="font-mono font-black text-sm text-[#012d1d] block">
                      {test.depMilkKg > 0 ? `+${test.depMilkKg}` : test.depMilkKg} kg
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#c1c8c2] text-center">
                    <span className="text-[10px] font-black text-[#717973] uppercase block">DEP Peso Destete (210d)</span>
                    <span className="font-mono font-black text-sm text-emerald-800 block">
                      {test.depWeaningWeightKg > 0 ? `+${test.depWeaningWeightKg}` : test.depWeaningWeightKg} kg
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#c1c8c2] text-center">
                    <span className="text-[10px] font-black text-[#717973] uppercase block">DEP Peso Nacimiento</span>
                    <span className="font-mono font-black text-sm text-[#012d1d] block">
                      {test.depBirthWeightKg > 0 ? `+${test.depBirthWeightKg}` : test.depBirthWeightKg} kg
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#c1c8c2] text-center">
                    <span className="text-[10px] font-black text-[#717973] uppercase block">Facilidad Parto</span>
                    <span className="font-mono font-black text-sm text-blue-900 block">
                      {test.depCalvingEasePercent}% Fácil
                    </span>
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-black text-amber-900 uppercase block">Confiabilidad / Repetibilidad</span>
                    <span className="font-mono font-black text-sm text-amber-950 block">
                      {test.reliabilityPercent}% Confiable
                    </span>
                  </div>
                </div>

                {/* Recommendations and Notes */}
                {test.recommendations && (
                  <div className="px-4 py-2.5 bg-amber-50/50 border-b border-amber-100 text-xs font-medium text-amber-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                    <span><b>Recomendación Zootécnica:</b> {test.recommendations}</span>
                  </div>
                )}

                {/* Expanded Offspring Records Table */}
                {isExpanded && (
                  <div className="p-4 bg-white space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-xs uppercase tracking-wider text-[#012d1d] flex items-center gap-1.5">
                        <Dna className="w-4 h-4 text-emerald-700" />
                        Registro Zootécnico de Crías Evaluadas ({offsprings.length} Descendientes)
                      </h5>

                      <button
                        onClick={() => {
                          setTargetSireForOffspring(test);
                          setIsAddOffspringModalOpen(true);
                        }}
                        className="text-xs font-black text-[#012d1d] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Registrar Nueva Cría
                      </button>
                    </div>

                    {offsprings.length === 0 ? (
                      <p className="text-xs text-[#717973] italic text-center py-4 bg-[#f8f9f8] rounded-2xl">
                        Aún no se han ingresado crías/hijas individuales a este toro. Haga clic en "+ Registrar Nueva Cría" para asociar registros.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-[#c1c8c2]">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#f0f4f1] text-[#012d1d] font-bold text-[10.5px] uppercase border-b border-[#c1c8c2]">
                              <th className="p-2.5">Cría / Arete</th>
                              <th className="p-2.5">Vaca Madre</th>
                              <th className="p-2.5 text-center">Sexo</th>
                              <th className="p-2.5 text-center">Nacimiento</th>
                              <th className="p-2.5 text-right">Peso Nacer (kg)</th>
                              <th className="p-2.5 text-right">Destete 210d (kg)</th>
                              <th className="p-2.5 text-right">GDP (g/día)</th>
                              <th className="p-2.5 text-right">Leche 305d (L)</th>
                              <th className="p-2.5 text-center">Parto</th>
                              <th className="p-2.5 text-center">Conform.</th>
                              <th className="p-2.5 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eeeeee] font-mono">
                            {offsprings.map((off) => (
                              <tr key={off.id} className="hover:bg-[#f9fbf9]">
                                <td className="p-2.5 font-sans">
                                  <div className="font-black text-[#012d1d]">{off.offspringTag}</div>
                                  <div className="text-[10px] text-[#717973]">{off.offspringName}</div>
                                </td>
                                <td className="p-2.5 font-sans font-extrabold text-[#012d1d]">
                                  {off.damTag}
                                </td>
                                <td className="p-2.5 text-center font-sans">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    off.sex === 'Hembra' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {off.sex}
                                  </span>
                                </td>
                                <td className="p-2.5 text-center">{off.birthDate}</td>
                                <td className="p-2.5 text-right font-bold text-[#012d1d]">{off.birthWeightKg} kg</td>
                                <td className="p-2.5 text-right font-bold text-emerald-800">{off.weaningWeight210dKg} kg</td>
                                <td className="p-2.5 text-right font-bold text-amber-900">{off.dailyWeightGainGrams} g</td>
                                <td className="p-2.5 text-right font-bold text-blue-900">
                                  {off.milk305dLiters ? `${off.milk305dLiters} L` : '-'}
                                </td>
                                <td className="p-2.5 text-center font-sans">
                                  <span className="text-[10px] font-bold bg-[#f0f4f1] text-[#012d1d] px-1.5 py-0.5 rounded">
                                    Grado {off.calvingEaseScore}
                                  </span>
                                </td>
                                <td className="p-2.5 text-center font-sans font-black text-emerald-800">
                                  {off.conformationScore}/10
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => handleRemoveOffspring(test.id, off.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                                    title="Eliminar cría de la prueba"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR NUEVA PRUEBA DE PROGENIES                             */}
      {/* ========================================================================= */}
      {isAddTestModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-4xl w-full p-5 md:p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#012d1d]">Registrar Nueva Prueba de Progenies</h3>
                  <p className="text-xs text-[#717973]">Evaluación zootécnica de toro semental y medición de descendencia</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddTestModalOpen(false)}
                className="p-2 text-[#717973] hover:text-black rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgenyTest} className="space-y-5">
              {/* Step 1: Sire Information */}
              <div className="space-y-3 bg-[#f8fbf9] border border-[#a2cfb8] rounded-2xl p-4">
                <h4 className="font-black text-xs uppercase text-[#012d1d] tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#ffba38]" /> 1. Información del Toro Semental
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">Seleccionar o Escribir Toro:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Don Juan 450 (Brangus)"
                      value={newSireName}
                      onChange={(e) => setNewSireName(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-extrabold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">N° Registro HBB / ASOCEBU:</label>
                    <input
                      type="text"
                      placeholder="Ej: BR-450-FJ"
                      value={newSireRegister}
                      onChange={(e) => setNewSireRegister(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">Raza del Semental:</label>
                    <select
                      value={newSireBreed}
                      onChange={(e) => setNewSireBreed(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-extrabold text-[#012d1d]"
                    >
                      <option value="Brangus Negro">Brangus Negro / Rojo</option>
                      <option value="Gyr Lechero">Gyr Lechero (Puro)</option>
                      <option value="Girolando F1">Girolando F1 / 5/8</option>
                      <option value="Brahman Rojo">Brahman Rojo / Blanco</option>
                      <option value="Angus">Angus Negro / Rojo</option>
                      <option value="Nelore">Nelore / Guzerá</option>
                      <option value="Simmental">Simmental / Simbrah</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">Aptitud Productiva:</label>
                    <select
                      value={newAptitude}
                      onChange={(e) => setNewAptitude(e.target.value as any)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-extrabold text-[#012d1d]"
                    >
                      <option value="Carne">🥩 Carne Especializada</option>
                      <option value="Leche">🥛 Leche Especializada</option>
                      <option value="Doble Propósito">⚖️ Doble Propósito</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">Veterinario / Genetista Evaluador:</label>
                    <input
                      type="text"
                      value={newEvaluator}
                      onChange={(e) => setNewEvaluator(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">Estado de la Prueba:</label>
                    <select
                      value={newEvalStatus}
                      onChange={(e) => setNewEvalStatus(e.target.value as any)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-extrabold text-[#012d1d]"
                    >
                      <option value="probado_excelente">⭐ Probado Excelente / Élite</option>
                      <option value="probado_positivo">✅ Probado Positivo</option>
                      <option value="en_evaluacion">⏳ En Evaluación</option>
                      <option value="descartado">❌ Descartado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: DEPs Estimated Values */}
              <div className="space-y-3 bg-[#f8fbf9] border border-[#a2cfb8] rounded-2xl p-4">
                <h4 className="font-black text-xs uppercase text-[#012d1d] tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-700" /> 2. Valores Estimados de DEP (Diferencia Esperada)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">DEP Leche (kg/305d):</label>
                    <input
                      type="number"
                      value={newDepMilk}
                      onChange={(e) => setNewDepMilk(Number(e.target.value))}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">DEP Peso Destete (210d):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newDepWeaningWeight}
                      onChange={(e) => setNewDepWeaningWeight(Number(e.target.value))}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">DEP Peso Nacer (kg):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newDepBirthWeight}
                      onChange={(e) => setNewDepBirthWeight(Number(e.target.value))}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">Facilidad Parto (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newDepCalvingEase}
                      onChange={(e) => setNewDepCalvingEase(Number(e.target.value))}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#012d1d] block mb-1">Confiabilidad (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newReliability}
                      onChange={(e) => setNewReliability(Number(e.target.value))}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Add Draft Offspring Entry Subform */}
              <div className="space-y-3 bg-white border border-[#c1c8c2] rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs uppercase text-[#012d1d] tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" /> 3. Registro Zootécnico de Crías ({draftOffsprings.length} agregadas)
                  </h4>
                </div>

                {/* Subform to add offspring to list */}
                <div className="bg-[#f0f4f1] p-3 rounded-2xl space-y-3 text-xs border border-[#a2cfb8]">
                  <span className="font-extrabold text-[#012d1d] block text-[11px]">Ingresar datos de una cría/hijo a la prueba:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Arete Cría (Ej: T-205)"
                      value={offTag}
                      onChange={(e) => setOffTag(e.target.value)}
                      className="bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Madre (Ej: BR-102)"
                      value={offDamTag}
                      onChange={(e) => setOffDamTag(e.target.value)}
                      className="bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-bold"
                    />
                    <select
                      value={offSex}
                      onChange={(e) => setOffSex(e.target.value as any)}
                      className="bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-bold"
                    >
                      <option value="Macho">♂ Macho</option>
                      <option value="Hembra">♀ Hembra</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Peso Destete (210d) kg"
                      value={offWeaningWeight}
                      onChange={(e) => setOffWeaningWeight(Number(e.target.value))}
                      className="bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-mono font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10.5px] text-[#717973]">Complete los campos y presione Agregar a la Lista.</span>
                    <button
                      type="button"
                      onClick={handleAddDraftOffspring}
                      className="bg-[#012d1d] text-[#ffba38] px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Cría
                    </button>
                  </div>
                </div>

                {/* Draft Offspring List */}
                {draftOffsprings.length > 0 && (
                  <div className="space-y-1.5">
                    {draftOffsprings.map((off, idx) => (
                      <div key={off.id} className="p-2.5 bg-[#f8f9f8] rounded-xl border border-[#eeeeee] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#717973]">#{idx + 1}</span>
                          <span className="font-black text-[#012d1d]">{off.offspringTag}</span>
                          <span className="text-[#717973]">Madre: <b>{off.damTag}</b></span>
                          <span className="font-mono text-emerald-800 font-bold">Destete: {off.weaningWeight210dKg} kg</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDraftOffsprings(draftOffsprings.filter((o) => o.id !== off.id))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations Input */}
              <div className="text-xs">
                <label className="font-bold text-[#012d1d] block mb-1">Recomendaciones & Conclusión Zootécnica:</label>
                <textarea
                  rows={2}
                  value={newRecommendations}
                  onChange={(e) => setNewRecommendations(e.target.value)}
                  placeholder="Ej: Toro probado de alta calidad con excelente transmisión en peso al destete..."
                  className="w-full bg-white border border-[#c1c8c2] rounded-xl p-3 text-xs text-[#012d1d]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsAddTestModalOpen(false)}
                  className="bg-[#f0f4f1] text-[#012d1d] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#012d1d] text-[#ffba38] px-5 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" /> Guardar Prueba de Progenie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AGREGAR CRÍA A TORO EXISTENTE                                   */}
      {/* ========================================================================= */}
      {isAddOffspringModalOpen && targetSireForOffspring && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-lg w-full p-5 md:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#012d1d]">Vincular Cría a Prueba de Progenie</h3>
                  <p className="text-xs text-[#717973]">Padre: <b>{targetSireForOffspring.sireName}</b> ({targetSireForOffspring.sireRegister})</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAddOffspringModalOpen(false);
                  setTargetSireForOffspring(null);
                }}
                className="p-2 text-[#717973] hover:text-black rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOffspringToExisting} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Arete Cría / Ternero(a):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: T-302"
                    value={offTag}
                    onChange={(e) => setOffTag(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Nombre / Alias Cría:</label>
                  <input
                    type="text"
                    placeholder="Ej: Rey 302"
                    value={offName}
                    onChange={(e) => setOffName(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Vaca Madre:</label>
                  <input
                    type="text"
                    placeholder="Ej: BR-102 (Rosita)"
                    value={offDamTag}
                    onChange={(e) => setOffDamTag(e.target.value)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Sexo de la Cría:</label>
                  <select
                    value={offSex}
                    onChange={(e) => setOffSex(e.target.value as any)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-extrabold text-[#012d1d]"
                  >
                    <option value="Macho">♂ Macho</option>
                    <option value="Hembra">♀ Hembra</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Peso Nacimiento (kg):</label>
                  <input
                    type="number"
                    value={offBirthWeight}
                    onChange={(e) => setOffBirthWeight(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Peso Destete 210d (kg):</label>
                  <input
                    type="number"
                    value={offWeaningWeight}
                    onChange={(e) => setOffWeaningWeight(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Ganancia Diaria (g/día):</label>
                  <input
                    type="number"
                    value={offDailyGain}
                    onChange={(e) => setOffDailyGain(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Puntuación Conformación (1-10):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={offConformation}
                    onChange={(e) => setOffConformation(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Notas u Observaciones:</label>
                <input
                  type="text"
                  placeholder="Observaciones de desarrollo o pastoreo..."
                  value={offNotes}
                  onChange={(e) => setOffNotes(e.target.value)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 text-[#012d1d]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setIsAddOffspringModalOpen(false)}
                  className="bg-[#f0f4f1] text-[#012d1d] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#012d1d] text-[#ffba38] px-5 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Vincular Cría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CERTIFICADO IMPRIMIBLE DE PRUEBA DE PROGENIES                   */}
      {/* ========================================================================= */}
      {isPrintCertificateModalOpen && certificateSire && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b-2 border-[#012d1d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-mono font-black text-lg">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-[#012d1d] uppercase tracking-wide">Certificado Oficial de Prueba de Progenies</h3>
                  <p className="text-xs text-[#717973]">Programa de Evaluación Genotípica & Zootécnica de Sementales</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={safePrint}
                  className="bg-[#012d1d] text-[#ffba38] px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" /> Imprimir / PDF
                </button>

                <button
                  onClick={() => {
                    setIsPrintCertificateModalOpen(false);
                    setCertificateSire(null);
                  }}
                  className="p-2 text-[#717973] hover:text-black rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-5 border-2 border-[#012d1d] rounded-2xl p-6 bg-[#fafcfb]">
              <div className="flex justify-between items-start border-b border-[#c1c8c2] pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#717973] block">Ganadería / Predio Evaluador</span>
                  <h4 className="font-black text-base text-[#012d1d]">GANADERÍA PRO - SELECCIÓN GENÉTICA</h4>
                  <p className="text-xs text-[#555]">Código Certificación: <b>{certificateSire.testCode}</b></p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#717973] block">Dictamen Final</span>
                  <span className="text-sm font-black text-emerald-800 uppercase bg-emerald-100 px-3 py-1 rounded-full inline-block border border-emerald-300">
                    {certificateSire.evaluationStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Sire Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#c1c8c2] text-xs">
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-bold block">Toro Semental</span>
                  <span className="font-black text-[#012d1d] text-sm">{certificateSire.sireName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-bold block">Registro Oficial</span>
                  <span className="font-mono font-black text-[#012d1d]">{certificateSire.sireRegister}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-bold block">Raza</span>
                  <span className="font-extrabold text-[#012d1d]">{certificateSire.sireBreed}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#717973] uppercase font-bold block">Aptitud</span>
                  <span className="font-extrabold text-[#012d1d]">{certificateSire.aptitude}</span>
                </div>
              </div>

              {/* DEPs Box */}
              <div className="space-y-2">
                <h5 className="font-black text-xs uppercase text-[#012d1d]">Diferencias Esperadas en la Progenie (DEPs Evaluadas)</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-white border rounded-xl text-center">
                    <span className="text-[9.5px] font-sans text-[#717973] uppercase font-bold block">DEP Leche</span>
                    <span className="font-black text-sm text-[#012d1d]">{certificateSire.depMilkKg > 0 ? `+${certificateSire.depMilkKg}` : certificateSire.depMilkKg} kg</span>
                  </div>
                  <div className="p-2.5 bg-white border rounded-xl text-center">
                    <span className="text-[9.5px] font-sans text-[#717973] uppercase font-bold block">DEP Destete 210d</span>
                    <span className="font-black text-sm text-emerald-800">+{certificateSire.depWeaningWeightKg} kg</span>
                  </div>
                  <div className="p-2.5 bg-white border rounded-xl text-center">
                    <span className="text-[9.5px] font-sans text-[#717973] uppercase font-bold block">Facilidad Parto</span>
                    <span className="font-black text-sm text-blue-900">{certificateSire.depCalvingEasePercent}%</span>
                  </div>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <span className="text-[9.5px] font-sans text-amber-900 uppercase font-bold block">Confiabilidad</span>
                    <span className="font-black text-sm text-amber-950">{certificateSire.reliabilityPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-3 bg-white border border-[#c1c8c2] rounded-xl text-xs space-y-1">
                <span className="font-black text-[#012d1d] block">Conclusión Zootécnica & Aval Veterinario:</span>
                <p className="text-[#555] leading-relaxed">{certificateSire.recommendations}</p>
                <div className="pt-2 text-[11px] text-[#717973] font-bold">
                  Evaluador: {certificateSire.evaluatorVeterinarian} • Fecha: {certificateSire.evaluationDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
