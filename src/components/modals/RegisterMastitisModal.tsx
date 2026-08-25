import React, { useState } from 'react';
import { safeOpenURL } from '../../utils/printUtils';
import {
  MastitisRecord,
  MastitisQuarterScore,
  MastitisType,
  MastitisTestType,
  MastitisStatus,
  UdderQuarters,
} from '../../types';
import {
  X,
  Plus,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  FlaskConical,
  Activity,
  Calendar,
  Share2,
  Trash2,
  FileText,
  Search,
  Filter,
  Check,
  Milk,
  Clock,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegisterMastitisModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MastitisRecord[];
  onAddRecord: (record: Omit<MastitisRecord, 'id'>) => void;
  onUpdateStatus: (id: string, status: MastitisStatus, notes?: string) => void;
  onDeleteRecord: (id: string) => void;
}

const QUARTER_SCORE_LABELS: Record<
  MastitisQuarterScore,
  { label: string; badgeClass: string; bgClass: string; borderClass: string; textClass: string }
> = {
  negativo: {
    label: '0 / Negativo',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgClass: 'bg-emerald-950/30',
    borderClass: 'border-emerald-300',
    textClass: 'text-emerald-700',
  },
  trazas: {
    label: 'T / Trazas',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    bgClass: 'bg-amber-950/30',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-700',
  },
  positivo_1: {
    label: '+ (Grado 1)',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-300',
    textClass: 'text-orange-700',
  },
  positivo_2: {
    label: '++ (Grado 2)',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-400',
    textClass: 'text-red-700',
  },
  positivo_3: {
    label: '+++ (Grado 3 - Gel)',
    badgeClass: 'bg-rose-900 text-white border-rose-950 font-black',
    bgClass: 'bg-rose-100',
    borderClass: 'border-rose-600',
    textClass: 'text-rose-900',
  },
};

const COMMON_PATHOGENS = [
  'Staphylococcus aureus (Contagioso)',
  'Streptococcus agalactiae (Contagioso)',
  'Escherichia coli (Ambiental)',
  'Streptococcus uberis (Ambiental)',
  'Klebsiella pneumoniae (Ambiental)',
  'Mycoplasma bovis',
  'Corynebacterium bovis',
  'Pseudomonas aeruginosa',
  'No determinado / En cultivo',
];

export const RegisterMastitisModal: React.FC<RegisterMastitisModalProps> = ({
  isOpen,
  onClose,
  records,
  onAddRecord,
  onUpdateStatus,
  onDeleteRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'lista' | 'nuevo'>('lista');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form state for new mastitis diagnosis
  const [cowTag, setCowTag] = useState<string>('');
  const [cowName, setCowName] = useState<string>('');
  const [testDate, setTestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [testType, setTestType] = useState<MastitisTestType>('CMT (California Mastitis Test)');
  const [mastitisType, setMastitisType] = useState<MastitisType>('clinica_aguda');
  const [pathogenIsolated, setPathogenIsolated] = useState<string>('Staphylococcus aureus (Contagioso)');
  const [somaticCellCountK, setSomaticCellCountK] = useState<number>(650);
  const [treatmentApplied, setTreatmentApplied] = useState<string>(
    'Intramamario Cefalosporina 100mg cada 12h x 3 días'
  );
  const [withdrawalDays, setWithdrawalDays] = useState<number>(4);
  const [severity, setSeverity] = useState<'critica' | 'moderada' | 'leve'>('critica');
  const [veterinarian, setVeterinarian] = useState<string>('Dr. Carlos Mendoza');
  const [notes, setNotes] = useState<string>('');

  // Quarter scores
  const [quarters, setQuarters] = useState<UdderQuarters>({
    anteriorIzquierdo: 'positivo_2',
    anteriorDerecho: 'negativo',
    posteriorIzquierdo: 'negativo',
    posteriorDerecho: 'negativo',
  });

  if (!isOpen) return null;

  const activeInTreatmentCount = records.filter(
    (r) => r.status === 'en_tratamiento' || r.status === 'en_observacion'
  ).length;

  const criticalCount = records.filter(
    (r) => r.severity === 'critica' && r.status !== 'curado'
  ).length;

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.cowTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.treatmentApplied.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'todos') return matchesSearch;
    return matchesSearch && r.status === filterStatus;
  });

  const handleQuarterScoreChange = (
    quarterKey: keyof UdderQuarters,
    score: MastitisQuarterScore
  ) => {
    setQuarters((prev) => ({
      ...prev,
      [quarterKey]: score,
    }));
  };

  const handleSubmitNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cowTag.trim()) return;

    const startDate = testDate;
    const startObj = new Date(startDate);
    startObj.setDate(startObj.getDate() + withdrawalDays);
    const endDate = startObj.toISOString().split('T')[0];

    onAddRecord({
      cowTag: cowTag.toUpperCase(),
      cowName: cowName.trim() || `Vaca ${cowTag}`,
      testDate,
      testType,
      mastitisType,
      quarters,
      pathogenIsolated,
      somaticCellCountK,
      treatmentApplied,
      withdrawalDays,
      withdrawalStartDate: startDate,
      withdrawalEndDate: endDate,
      severity,
      status: 'en_tratamiento',
      veterinarian,
      notes,
    });

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ba1a1a', '#ff1e00', '#012d1d'],
    });

    // Reset form and switch to list tab
    setCowTag('');
    setCowName('');
    setNotes('');
    setActiveTab('lista');
  };

  const handleShareWhatsApp = () => {
    const activeCases = records.filter((r) => r.status !== 'curado');
    if (activeCases.length === 0) {
      alert('No hay casos de mastitis activos para reportar.');
      return;
    }

    let msg = `*REPORTE OPERATIVO - CASOS POSITIVOS DE MASTITIS EN LECHERÍA*\n`;
    msg += `*Fecha de emisión:* ${new Date().toLocaleDateString('es-CO')}\n`;
    msg += `*Casos Activos:* ${activeCases.length}\n`;
    msg += `-------------------------------------------\n\n`;

    activeCases.forEach((act, idx) => {
      msg += `*${idx + 1}. Vaca:* ${act.cowTag} - ${act.cowName}\n`;
      msg += `   • *Tipo:* ${act.mastitisType.toUpperCase().replace('_', ' ')}\n`;
      msg += `   • *Método:* ${act.testType}\n`;
      msg += `   • *Cuartos Afectados:*\n`;
      if (act.quarters.anteriorIzquierdo !== 'negativo')
        msg += `     - Ant. Izquierdo (AI): ${QUARTER_SCORE_LABELS[act.quarters.anteriorIzquierdo].label}\n`;
      if (act.quarters.anteriorDerecho !== 'negativo')
        msg += `     - Ant. Derecho (AD): ${QUARTER_SCORE_LABELS[act.quarters.anteriorDerecho].label}\n`;
      if (act.quarters.posteriorIzquierdo !== 'negativo')
        msg += `     - Post. Izquierdo (PI): ${QUARTER_SCORE_LABELS[act.quarters.posteriorIzquierdo].label}\n`;
      if (act.quarters.posteriorDerecho !== 'negativo')
        msg += `     - Post. Derecho (PD): ${QUARTER_SCORE_LABELS[act.quarters.posteriorDerecho].label}\n`;

      msg += `   • *Tratamiento:* ${act.treatmentApplied}\n`;
      msg += `   • *Retiro de Leche:* ${act.withdrawalDays} días (Hasta: ${act.withdrawalEndDate})\n`;
      msg += `   • *Estado:* ${act.status.toUpperCase().replace('_', ' ')}\n\n`;
    });

    msg += `*¡ATENCIÓN ORDEÑADORES!* No ordeñar al tanque las vacas en tratamiento o carencia de antibiótico.`;

    const encoded = encodeURIComponent(msg);
    safeOpenURL(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#15241C] w-full max-w-5xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-[#0D1A13] text-white p-5 md:p-6 flex items-start justify-between gap-4 shrink-0 border-b border-[#1b4332]">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-950/80 text-red-400 rounded-2xl border border-red-800/80 shadow-inner">
              <FlaskConical className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Registro de Pruebas de Mastitis Positivas
                </h2>
                <span className="bg-red-500/20 text-red-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-red-500/30">
                  {activeInTreatmentCount} En Tratamiento
                </span>
              </div>
              <p className="text-xs text-[#86af99] mt-1">
                Monitoreo de cuartos mamarios, California Mastitis Test (CMT), patógenos aislados y retención de antibiótico.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#86af99] hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Top Summary Banner KPIs */}
        <div className="bg-[#f0f7f4] border-b border-[#c1ecd4] p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div className="bg-[#15241C] p-3 rounded-2xl border border-[#c1ecd4] shadow-2xs">
            <span className="text-[10px] font-bold text-[#717973] uppercase tracking-wider block">
              Casos Activos Totales
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-white font-mono">
                {activeInTreatmentCount}
              </span>
              <span className="text-[10px] text-[#2d6a4f]">vacas</span>
            </div>
          </div>

          <div className="bg-[#15241C] p-3 rounded-2xl border border-red-200 shadow-2xs">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
              Cuadro Clínico Crítico
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-red-700 font-mono">
                {criticalCount}
              </span>
              <span className="text-[10px] text-red-600">urgentes</span>
            </div>
          </div>

          <div className="bg-[#15241C] p-3 rounded-2xl border border-[#c1ecd4] shadow-2xs">
            <span className="text-[10px] font-bold text-[#717973] uppercase tracking-wider block">
              Retención Antibiótico
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-amber-700 font-mono">
                {records.filter((r) => r.withdrawalDays > 0 && r.status !== 'curado').length}
              </span>
              <span className="text-[10px] text-amber-700">en carencia</span>
            </div>
          </div>

          <div className="bg-[#15241C] p-3 rounded-2xl border border-[#c1ecd4] shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#717973] uppercase tracking-wider block">
                Casos Curados Total
              </span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                {records.filter((r) => r.status === 'curado').length}
              </span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 bg-[#0D1A13] border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('lista')}
              className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'lista'
                  ? 'bg-[#15241C] text-white border-t-2 border-x border-[#012d1d] shadow-2xs'
                  : 'text-[#A5B8AC] hover:text-white hover:bg-[#1F3327]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Histórico y Casos Activos ({records.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('nuevo')}
              className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'nuevo'
                  ? 'bg-[#0D1A13] text-white shadow-2xs'
                  : 'bg-emerald-800 text-white hover:bg-emerald-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Nuevo Diagnóstico Positivo</span>
            </button>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs mb-2"
            title="Compartir reporte activo a ordeñadores y veterinario por WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Enviar a Ordeñadores (WhatsApp)</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {/* TAB 1: LIST & MANAGEMENT */}
          {activeTab === 'lista' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#15241C] p-3 rounded-2xl border border-white/10 shadow-2xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#A5B8AC] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por arete, nombre o tratamiento..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0D1A13] border border-white/10 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <Filter className="w-3.5 h-3.5 text-[#A5B8AC] shrink-0" />
                  <span className="text-[11px] font-bold text-[#A5B8AC] shrink-0">Estado:</span>
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'en_tratamiento', label: 'En Tratamiento' },
                    { id: 'en_observacion', label: 'En Carencia' },
                    { id: 'curado', label: 'Curado' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setFilterStatus(st.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        filterStatus === st.id
                          ? 'bg-[#0D1A13] text-white'
                          : 'bg-[#1F3327] text-white hover:bg-[#202E25]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Records List Grid */}
              {filteredRecords.length === 0 ? (
                <div className="bg-[#15241C] p-8 rounded-2xl border border-dashed border-white/15 text-center space-y-3">
                  <FlaskConical className="w-12 h-12 text-[#A5B8AC] mx-auto" />
                  <p className="text-sm font-bold text-[#A5B8AC]">
                    No se encontraron registros de mastitis con el filtro seleccionado.
                  </p>
                  <button
                    onClick={() => setActiveTab('nuevo')}
                    className="px-4 py-2 bg-[#0D1A13] text-white text-xs font-bold rounded-xl hover:bg-[#123F2A] transition-all cursor-pointer"
                  >
                    Registrar Primer Caso Positivo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-[#15241C] rounded-2xl border p-4 md:p-5 shadow-2xs space-y-3 transition-all ${
                        item.severity === 'critica' && item.status !== 'curado'
                          ? 'border-red-300 bg-red-50/20'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#0D1A13] text-emerald-300 flex items-center justify-center font-black font-mono text-sm shadow-2xs">
                            {item.cowTag}
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                              <span>{item.cowName}</span>
                              <span
                                className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                                  item.severity === 'critica'
                                    ? 'bg-red-100 text-red-800 border-red-300'
                                    : item.severity === 'moderada'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}
                              >
                                Severidad: {item.severity}
                              </span>
                            </h3>
                            <p className="text-xs text-[#A5B8AC] font-medium flex items-center gap-2 mt-0.5">
                              <span>Prueba: {item.testType}</span>
                              <span>•</span>
                              <span>Fecha: {item.testDate}</span>
                              {item.veterinarian && (
                                <>
                                  <span>•</span>
                                  <span>Vet: {item.veterinarian}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Status badge and quick actions */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                              item.status === 'en_tratamiento'
                                ? 'bg-red-600 text-white'
                                : item.status === 'en_observacion'
                                ? 'bg-amber-500 text-slate-950'
                                : item.status === 'curado'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-white'
                            }`}
                          >
                            {item.status.replace('_', ' ')}
                          </span>

                          {item.status !== 'curado' && (
                            <button
                              onClick={() =>
                                onUpdateStatus(
                                  item.id,
                                  'curado',
                                  'Dada de alta. Cuartos desinflamados y leche limpia.'
                                )
                              }
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-300 transition-all cursor-pointer flex items-center gap-1"
                              title="Marcar vaca como Curada y dar de alta para el tanque"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Dar de Alta</span>
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteRecord(item.id)}
                            className="p-1.5 text-[#A5B8AC] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Eliminar este registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Udder Quarters Anatomical Diagram */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#0D1A13] p-3.5 rounded-2xl border border-white/10 space-y-2">
                          <span className="text-[10px] font-extrabold uppercase text-[#A5B8AC] tracking-wider block">
                            Evaluación por Cuartos Mamarios (Ubre)
                          </span>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {/* Anterior Izquierdo */}
                            <div
                              className={`p-2.5 rounded-xl border text-center ${
                                QUARTER_SCORE_LABELS[item.quarters.anteriorIzquierdo].bgClass
                              } ${
                                QUARTER_SCORE_LABELS[item.quarters.anteriorIzquierdo].borderClass
                              }`}
                            >
                              <span className="text-[9.5px] font-bold text-[#A5B8AC] uppercase block">
                                Ant. Izquierdo (AI)
                              </span>
                              <span
                                className={`font-black text-xs block mt-0.5 ${
                                  QUARTER_SCORE_LABELS[item.quarters.anteriorIzquierdo].textClass
                                }`}
                              >
                                {QUARTER_SCORE_LABELS[item.quarters.anteriorIzquierdo].label}
                              </span>
                            </div>

                            {/* Anterior Derecho */}
                            <div
                              className={`p-2.5 rounded-xl border text-center ${
                                QUARTER_SCORE_LABELS[item.quarters.anteriorDerecho].bgClass
                              } ${
                                QUARTER_SCORE_LABELS[item.quarters.anteriorDerecho].borderClass
                              }`}
                            >
                              <span className="text-[9.5px] font-bold text-[#A5B8AC] uppercase block">
                                Ant. Derecho (AD)
                              </span>
                              <span
                                className={`font-black text-xs block mt-0.5 ${
                                  QUARTER_SCORE_LABELS[item.quarters.anteriorDerecho].textClass
                                }`}
                              >
                                {QUARTER_SCORE_LABELS[item.quarters.anteriorDerecho].label}
                              </span>
                            </div>

                            {/* Posterior Izquierdo */}
                            <div
                              className={`p-2.5 rounded-xl border text-center ${
                                QUARTER_SCORE_LABELS[item.quarters.posteriorIzquierdo].bgClass
                              } ${
                                QUARTER_SCORE_LABELS[item.quarters.posteriorIzquierdo].borderClass
                              }`}
                            >
                              <span className="text-[9.5px] font-bold text-[#A5B8AC] uppercase block">
                                Post. Izquierdo (PI)
                              </span>
                              <span
                                className={`font-black text-xs block mt-0.5 ${
                                  QUARTER_SCORE_LABELS[item.quarters.posteriorIzquierdo].textClass
                                }`}
                              >
                                {QUARTER_SCORE_LABELS[item.quarters.posteriorIzquierdo].label}
                              </span>
                            </div>

                            {/* Posterior Derecho */}
                            <div
                              className={`p-2.5 rounded-xl border text-center ${
                                QUARTER_SCORE_LABELS[item.quarters.posteriorDerecho].bgClass
                              } ${
                                QUARTER_SCORE_LABELS[item.quarters.posteriorDerecho].borderClass
                              }`}
                            >
                              <span className="text-[9.5px] font-bold text-[#A5B8AC] uppercase block">
                                Post. Derecho (PD)
                              </span>
                              <span
                                className={`font-black text-xs block mt-0.5 ${
                                  QUARTER_SCORE_LABELS[item.quarters.posteriorDerecho].textClass
                                }`}
                              >
                                {QUARTER_SCORE_LABELS[item.quarters.posteriorDerecho].label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Medical Details & Antibiotic Withdrawal */}
                        <div className="bg-[#0D1A13] p-3.5 rounded-2xl border border-white/10 space-y-2 flex flex-col justify-between text-xs">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                              <span className="text-[#A5B8AC] font-medium">Patógeno Aislado:</span>
                              <span className="font-bold text-white font-mono">
                                {item.pathogenIsolated || 'En laboratorio'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                              <span className="text-[#A5B8AC] font-medium">Tratamiento Aplicado:</span>
                              <span className="font-bold text-white text-right max-w-xs">
                                {item.treatmentApplied}
                              </span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                              <span className="text-[#A5B8AC] font-medium">RCS Estimado:</span>
                              <span className="font-bold text-red-700 font-mono">
                                {item.somaticCellCountK ? `${item.somaticCellCountK}k cel/ml` : 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Antibiotic Withdrawal Banner */}
                          {item.withdrawalDays > 0 && (
                            <div
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                item.status === 'curado'
                                  ? 'bg-[#1F3327] border-white/15 text-[#A5B8AC]'
                                  : 'bg-amber-100 border-amber-300 text-amber-900'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                                <div>
                                  <span className="font-extrabold text-[11px] block">
                                    Retiro en Leche: {item.withdrawalDays} días
                                  </span>
                                  <span className="text-[10px] text-amber-800">
                                    Carencia activa hasta: <b>{item.withdrawalEndDate}</b>
                                  </span>
                                </div>
                              </div>
                              <span className="bg-amber-200 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-md">
                                ¡NO MEZCLAR CON TANQUE!
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.notes && (
                        <div className="bg-[#15241C] p-2.5 rounded-xl border border-white/10 text-xs text-[#A5B8AC] italic flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#A5B8AC] shrink-0" />
                          <span>Notas: "{item.notes}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REGISTER NEW POSITIVE MASTITIS DIAGNOSIS */}
          {activeTab === 'nuevo' && (
            <form onSubmit={handleSubmitNewRecord} className="space-y-6">
              <div className="bg-[#15241C] p-5 rounded-2xl border border-white/10 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                  <Stethoscope className="w-4 h-4 text-[#2d6a4f]" />
                  <span>1. Identificación de la Vaca y Método de Diagnóstico</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Arete / ID de la Vaca *
                    </label>
                    <input
                      type="text"
                      required
                      value={cowTag}
                      onChange={(e) => setCowTag(e.target.value)}
                      placeholder="Ej: VACA-104"
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d] font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Nombre / Registro
                    </label>
                    <input
                      type="text"
                      value={cowName}
                      onChange={(e) => setCowName(e.target.value)}
                      placeholder="Ej: Estrella Holstein"
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Fecha de Muestreo / Prueba
                    </label>
                    <input
                      type="date"
                      required
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Método de Diagnóstico
                    </label>
                    <select
                      value={testType}
                      onChange={(e) => setTestType(e.target.value as MastitisTestType)}
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    >
                      <option value="CMT (California Mastitis Test)">
                        CMT (California Mastitis Test)
                      </option>
                      <option value="Recuento Celular Somático (RCS)">
                        Recuento Celular Somático (RCS)
                      </option>
                      <option value="Observación Clínica (Grumos/Ubre Inflamada)">
                        Observación Clínica (Grumos/Ubre Inflamada)
                      </option>
                      <option value="Cultivo Microbiológico / Antibiograma">
                        Cultivo Microbiológico / Antibiograma
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Clasificación de Mastitis
                    </label>
                    <select
                      value={mastitisType}
                      onChange={(e) => setMastitisType(e.target.value as MastitisType)}
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    >
                      <option value="clinica_aguda">Clínica Aguda (Ubre inflamada, grumos)</option>
                      <option value="subclinica">Subclínica (Sin síntomas visibles, RCS alto)</option>
                      <option value="clinica_cronica">Clínica Crónica (Recurrente / Fibrosa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Nivel de Severidad
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as 'critica' | 'moderada' | 'leve')}
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    >
                      <option value="critica">Crítica (Fiebre / Inflamación grave)</option>
                      <option value="moderada">Moderada (Grumos moderados / Dolor local)</option>
                      <option value="leve">Leve (Precipitado leve en CMT)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: INTERACTIVE UDDER QUARTER EVALUATION SCHEMATIC */}
              <div className="bg-[#f0f7f4] p-5 rounded-2xl border border-[#c1ecd4] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#c1ecd4] pb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Milk className="w-4 h-4 text-[#ffba38]" />
                      <span>2. Evaluación Anatómica por Cuartos Mamarios (Prueba CMT)</span>
                    </h3>
                    <p className="text-xs text-[#A5B8AC]">
                      Seleccione la reactividad del reactivo CMT para cada uno de los 4 cuartos de la ubre.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front Left / Anterior Izquierdo */}
                  <div className="bg-[#15241C] p-3.5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white uppercase">
                        Anterior Izquierdo (AI)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${QUARTER_SCORE_LABELS[quarters.anteriorIzquierdo].badgeClass}`}>
                        {QUARTER_SCORE_LABELS[quarters.anteriorIzquierdo].label}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-[10px]">
                      {(['negativo', 'trazas', 'positivo_1', 'positivo_2', 'positivo_3'] as MastitisQuarterScore[]).map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleQuarterScoreChange('anteriorIzquierdo', score)}
                          className={`p-1.5 rounded-lg font-bold border transition-all cursor-pointer text-center ${
                            quarters.anteriorIzquierdo === score
                              ? 'bg-[#0D1A13] text-white border-[#012d1d] shadow-2xs'
                              : 'bg-[#0D1A13] text-white hover:bg-[#1F3327] border-white/10'
                          }`}
                        >
                          {score === 'negativo' ? '0' : score === 'trazas' ? 'T' : score === 'positivo_1' ? '+' : score === 'positivo_2' ? '++' : '+++'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Front Right / Anterior Derecho */}
                  <div className="bg-[#15241C] p-3.5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white uppercase">
                        Anterior Derecho (AD)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${QUARTER_SCORE_LABELS[quarters.anteriorDerecho].badgeClass}`}>
                        {QUARTER_SCORE_LABELS[quarters.anteriorDerecho].label}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-[10px]">
                      {(['negativo', 'trazas', 'positivo_1', 'positivo_2', 'positivo_3'] as MastitisQuarterScore[]).map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleQuarterScoreChange('anteriorDerecho', score)}
                          className={`p-1.5 rounded-lg font-bold border transition-all cursor-pointer text-center ${
                            quarters.anteriorDerecho === score
                              ? 'bg-[#0D1A13] text-white border-[#012d1d] shadow-2xs'
                              : 'bg-[#0D1A13] text-white hover:bg-[#1F3327] border-white/10'
                          }`}
                        >
                          {score === 'negativo' ? '0' : score === 'trazas' ? 'T' : score === 'positivo_1' ? '+' : score === 'positivo_2' ? '++' : '+++'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rear Left / Posterior Izquierdo */}
                  <div className="bg-[#15241C] p-3.5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white uppercase">
                        Posterior Izquierdo (PI)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${QUARTER_SCORE_LABELS[quarters.posteriorIzquierdo].badgeClass}`}>
                        {QUARTER_SCORE_LABELS[quarters.posteriorIzquierdo].label}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-[10px]">
                      {(['negativo', 'trazas', 'positivo_1', 'positivo_2', 'positivo_3'] as MastitisQuarterScore[]).map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleQuarterScoreChange('posteriorIzquierdo', score)}
                          className={`p-1.5 rounded-lg font-bold border transition-all cursor-pointer text-center ${
                            quarters.posteriorIzquierdo === score
                              ? 'bg-[#0D1A13] text-white border-[#012d1d] shadow-2xs'
                              : 'bg-[#0D1A13] text-white hover:bg-[#1F3327] border-white/10'
                          }`}
                        >
                          {score === 'negativo' ? '0' : score === 'trazas' ? 'T' : score === 'positivo_1' ? '+' : score === 'positivo_2' ? '++' : '+++'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rear Right / Posterior Derecho */}
                  <div className="bg-[#15241C] p-3.5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white uppercase">
                        Posterior Derecho (PD)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${QUARTER_SCORE_LABELS[quarters.posteriorDerecho].badgeClass}`}>
                        {QUARTER_SCORE_LABELS[quarters.posteriorDerecho].label}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-[10px]">
                      {(['negativo', 'trazas', 'positivo_1', 'positivo_2', 'positivo_3'] as MastitisQuarterScore[]).map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleQuarterScoreChange('posteriorDerecho', score)}
                          className={`p-1.5 rounded-lg font-bold border transition-all cursor-pointer text-center ${
                            quarters.posteriorDerecho === score
                              ? 'bg-[#0D1A13] text-white border-[#012d1d] shadow-2xs'
                              : 'bg-[#0D1A13] text-white hover:bg-[#1F3327] border-white/10'
                          }`}
                        >
                          {score === 'negativo' ? '0' : score === 'trazas' ? 'T' : score === 'positivo_1' ? '+' : score === 'positivo_2' ? '++' : '+++'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PATHOGEN, TREATMENT & WITHDRAWAL PERIOD */}
              <div className="bg-[#15241C] p-5 rounded-2xl border border-white/10 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>3. Patógeno, Tratamiento y Tiempo de Retiro en Leche</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Patógeno Aislado / Sospechado
                    </label>
                    <select
                      value={pathogenIsolated}
                      onChange={(e) => setPathogenIsolated(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    >
                      {COMMON_PATHOGENS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Conteo de Células Somáticas (RCS k/ml)
                    </label>
                    <input
                      type="number"
                      value={somaticCellCountK}
                      onChange={(e) => setSomaticCellCountK(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-white mb-1">
                      Tratamiento Aplicado (Intramamario / Sistémico) *
                    </label>
                    <input
                      type="text"
                      required
                      value={treatmentApplied}
                      onChange={(e) => setTreatmentApplied(e.target.value)}
                      placeholder="Ej: Cefalexina Intramamaria 100mg + Meloxicam"
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Días de Retiro Sanitario (Carencia)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={withdrawalDays}
                      onChange={(e) => setWithdrawalDays(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d] font-bold text-amber-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Veterinario Responsable
                    </label>
                    <input
                      type="text"
                      value={veterinarian}
                      onChange={(e) => setVeterinarian(e.target.value)}
                      placeholder="Ej: Dr. Carlos Mendoza"
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Observaciones / Cuidados Especiales
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Ordeñar al final del lote de producción"
                      className="w-full px-3 py-2 text-xs border border-white/15 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#012d1d]"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('lista')}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#1F3327] hover:bg-[#202E25] rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black text-white bg-[#0D1A13] hover:bg-[#123F2A] rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Guardar Registro Diagnóstico</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
