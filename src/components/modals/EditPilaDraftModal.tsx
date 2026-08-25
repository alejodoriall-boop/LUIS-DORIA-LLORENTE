import React, { useState, useEffect } from 'react';
import {
  SocialSecurityPilaPlanilla,
  PilaNovedadCode,
  PilaItemNovedad,
  Employee,
} from '../../types';
import {
  FileText,
  X,
  Check,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Save,
  ShieldCheck,
  Calendar,
  DollarSign,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

interface EditPilaDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  pila: SocialSecurityPilaPlanilla | null;
  onSaveDraft: (updatedPila: SocialSecurityPilaPlanilla) => void;
  onConsolidatePin: (consolidatedPila: SocialSecurityPilaPlanilla) => void;
  employees: Employee[];
}

export const NOVEDADES_DESCRIPTIONS: Record<PilaNovedadCode, { label: string; desc: string; badgeBg: string; textCol: string }> = {
  NINGUNA: {
    label: 'Sin Novedad (Cotización Normal)',
    desc: 'El cotizante laboró los 30 días del mes sin interrupciones.',
    badgeBg: 'bg-[#1F3327] border-white/15',
    textCol: 'text-white',
  },
  SLN: {
    label: 'SLN — Suspensión Temporal / Licencia No Remunerada',
    desc: 'No hay aportes a Salud, ARL ni Caja por los días suspendidos. Se liquida aporte patronal de Pensión.',
    badgeBg: 'bg-amber-100 border-amber-300',
    textCol: 'text-amber-900',
  },
  IGE: {
    label: 'IGE — Incapacidad Enfermedad General',
    desc: 'Base de cotización al 66.67% sobre días de incapacidad. No hay aporte de ARL en días de incapacidad.',
    badgeBg: 'bg-rose-100 border-rose-300',
    textCol: 'text-rose-900',
  },
  LMA: {
    label: 'LMA — Licencia de Maternidad / Paternidad',
    desc: 'Salud y Pensión al 100% sobre IBC. ARL $0 durante los días de licencia.',
    badgeBg: 'bg-purple-100 border-purple-300',
    textCol: 'text-purple-900',
  },
  VAC: {
    label: 'VAC — Vacaciones Recreativas / Compensadas',
    desc: 'Cotización completa a Salud (12.5%), Pensión (16%) y Caja (4%). ARL $0 por días en vacaciones.',
    badgeBg: 'bg-sky-100 border-sky-300',
    textCol: 'text-sky-900',
  },
  VST: {
    label: 'VST — Variación Sustancial de Sueldo / IBC',
    desc: 'Modificación permanente o transitoria en el salario base o IBC del cotizante.',
    badgeBg: 'bg-emerald-100 border-emerald-300',
    textCol: 'text-emerald-900',
  },
  ING: {
    label: 'ING — Ingreso de Nuevo Cotizante',
    desc: 'Ingreso durante el curso del mes. Se liquidan días proporcionales de trabajo.',
    badgeBg: 'bg-indigo-100 border-indigo-300',
    textCol: 'text-indigo-900',
  },
  RET: {
    label: 'RET — Retiro Definitivo del Cotizante',
    desc: 'Terminación del contrato de trabajo en el mes. Se pro-ratean días laborados.',
    badgeBg: 'bg-red-100 border-red-300',
    textCol: 'text-red-900',
  },
};

export const EditPilaDraftModal: React.FC<EditPilaDraftModalProps> = ({
  isOpen,
  onClose,
  pila,
  onSaveDraft,
  onConsolidatePin,
  employees,
}) => {
  const [draft, setDraft] = useState<SocialSecurityPilaPlanilla | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Novedad Editing Form State
  const [novCode, setNovCode] = useState<PilaNovedadCode>('NINGUNA');
  const [novDays, setNovDays] = useState<number>(0);
  const [novNotes, setNovNotes] = useState<string>('');
  const [novIbc, setNovIbc] = useState<number>(0);

  // Add Employee State
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  useEffect(() => {
    if (pila && isOpen) {
      setDraft(JSON.parse(JSON.stringify(pila)));
      setEditingIndex(null);
      setShowAddEmp(false);
    }
  }, [pila, isOpen]);

  if (!isOpen || !draft) return null;

  // Recalculate whole draft summary totals
  const recalculateSummary = (items: SocialSecurityPilaPlanilla['items']) => {
    let totalIbc = 0;
    let totalHealth = 0;
    let totalPension = 0;
    let totalArl = 0;
    let totalCaja = 0;
    let totalEmployer = 0;
    let totalWorker = 0;

    items.forEach((item) => {
      totalIbc += item.ibc;
      totalHealth += item.healthWorker + item.healthEmployer;
      totalPension += item.pensionWorker + item.pensionEmployer;
      totalArl += item.arlEmployer;
      totalCaja += item.cajaEmployer;
      totalEmployer += item.healthEmployer + item.pensionEmployer + item.arlEmployer + item.cajaEmployer;
      totalWorker += item.healthWorker + item.pensionWorker;
    });

    return {
      totalIbc,
      totalHealth,
      totalPension,
      totalArl,
      totalCaja,
      totalEmployerContributions: totalEmployer,
      totalWorkerDeductions: totalWorker,
      grandTotalPila: totalEmployer + totalWorker,
      totalEmployees: items.length,
    };
  };

  // Recalculate single item given a novedad
  const calculateItemNovedad = (
    item: SocialSecurityPilaPlanilla['items'][0],
    code: PilaNovedadCode,
    days: number,
    baseIbc: number,
    notes: string
  ) => {
    let daysWorked = 30;
    let ibc = baseIbc > 0 ? baseIbc : item.ibc;

    // Arl Rate from string
    let arlRate = 0.02436; // Default nivel III 2.436%
    if (item.arlRiskLevel.includes('4.350%') || item.arlRiskLevel.includes('IV')) arlRate = 0.0435;
    if (item.arlRiskLevel.includes('0.522%') || item.arlRiskLevel.includes('I')) arlRate = 0.00522;
    if (item.arlRiskLevel.includes('1.044%') || item.arlRiskLevel.includes('II')) arlRate = 0.01044;

    let healthWorker = Math.round(ibc * 0.04);
    let healthEmployer = Math.round(ibc * 0.085);
    let pensionWorker = Math.round(ibc * 0.04);
    let pensionEmployer = Math.round(ibc * 0.12);
    let arlEmployer = Math.round(ibc * arlRate);
    let cajaEmployer = Math.round(ibc * 0.04);

    const safeDays = Math.min(30, Math.max(0, days));

    switch (code) {
      case 'SLN': {
        // Suspensión Temporal / Licencia No Remunerada
        daysWorked = 30 - safeDays;
        const ratio = daysWorked / 30;
        healthWorker = Math.round(ibc * ratio * 0.04);
        healthEmployer = Math.round(ibc * ratio * 0.085);
        pensionWorker = Math.round(ibc * ratio * 0.04);
        pensionEmployer = Math.round(ibc * 0.12); // Mantener pensión patronal
        arlEmployer = Math.round(ibc * ratio * arlRate);
        cajaEmployer = Math.round(ibc * ratio * 0.04);
        break;
      }
      case 'IGE': {
        // Incapacidad por Enfermedad General (66.67% base en dias incapacitados)
        daysWorked = 30 - safeDays;
        const ibcIncap = ibc * (safeDays / 30) * 0.6667 + ibc * (daysWorked / 30);
        healthWorker = Math.round(ibcIncap * 0.04);
        healthEmployer = Math.round(ibcIncap * 0.085);
        pensionWorker = Math.round(ibcIncap * 0.04);
        pensionEmployer = Math.round(ibcIncap * 0.12);
        arlEmployer = Math.round(ibc * (daysWorked / 30) * arlRate); // ARL $0 en incapacidad
        cajaEmployer = Math.round(ibcIncap * 0.04);
        break;
      }
      case 'LMA':
      case 'VAC': {
        // Maternidad o Vacaciones -> ARL $0 en dias de vacaciones/licencia
        daysWorked = 30 - safeDays;
        healthWorker = Math.round(ibc * 0.04);
        healthEmployer = Math.round(ibc * 0.085);
        pensionWorker = Math.round(ibc * 0.04);
        pensionEmployer = Math.round(ibc * 0.12);
        arlEmployer = Math.round(ibc * (daysWorked / 30) * arlRate);
        cajaEmployer = Math.round(ibc * 0.04);
        break;
      }
      case 'ING':
      case 'RET': {
        // Ingreso o Retiro
        daysWorked = safeDays > 0 ? safeDays : 15;
        const ratio = daysWorked / 30;
        ibc = Math.round(baseIbc * ratio);
        healthWorker = Math.round(ibc * 0.04);
        healthEmployer = Math.round(ibc * 0.085);
        pensionWorker = Math.round(ibc * 0.04);
        pensionEmployer = Math.round(ibc * 0.12);
        arlEmployer = Math.round(ibc * arlRate);
        cajaEmployer = Math.round(ibc * 0.04);
        break;
      }
      case 'VST': {
        // Variación de Sueldo
        daysWorked = 30;
        healthWorker = Math.round(ibc * 0.04);
        healthEmployer = Math.round(ibc * 0.085);
        pensionWorker = Math.round(ibc * 0.04);
        pensionEmployer = Math.round(ibc * 0.12);
        arlEmployer = Math.round(ibc * arlRate);
        cajaEmployer = Math.round(ibc * 0.04);
        break;
      }
      case 'NINGUNA':
      default:
        daysWorked = 30;
        break;
    }

    const totalItem = healthWorker + healthEmployer + pensionWorker + pensionEmployer + arlEmployer + cajaEmployer;

    return {
      ...item,
      ibc,
      daysWorked,
      healthWorker,
      healthEmployer,
      pensionWorker,
      pensionEmployer,
      arlEmployer,
      cajaEmployer,
      totalItem,
      novedad: {
        code,
        days: safeDays,
        newIbc: ibc,
        notes,
      },
    };
  };

  const handleStartEditItem = (idx: number) => {
    const item = draft.items[idx];
    setEditingIndex(idx);
    setNovCode(item.novedad?.code || 'NINGUNA');
    setNovDays(item.novedad?.days || 0);
    setNovNotes(item.novedad?.notes || '');
    setNovIbc(item.ibc);
  };

  const handleSaveItemNovedad = () => {
    if (editingIndex === null) return;
    const currentItem = draft.items[editingIndex];
    const updatedItem = calculateItemNovedad(currentItem, novCode, novDays, novIbc, novNotes);

    const newItems = [...draft.items];
    newItems[editingIndex] = updatedItem;

    const summary = recalculateSummary(newItems);

    setDraft({
      ...draft,
      ...summary,
      items: newItems,
    });
    setEditingIndex(null);
  };

  const handleRemoveItem = (idx: number) => {
    if (draft.items.length <= 1) {
      alert('⚠️ La planilla debe tener al menos un cotizante.');
      return;
    }
    const newItems = draft.items.filter((_, i) => i !== idx);
    const summary = recalculateSummary(newItems);
    setDraft({
      ...draft,
      ...summary,
      items: newItems,
    });
  };

  const handleAddEmployeeToDraft = () => {
    if (!selectedEmpId) return;
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    if (draft.items.some((i) => i.documentId === emp.documentId)) {
      alert('⚠️ Este empleado ya está incluido en el borrador de la planilla.');
      return;
    }

    const ibc = emp.baseRate || 1423500;
    let arlRate = 0.02436;
    if (emp.arlRiskLevel?.includes('4.350%')) arlRate = 0.0435;
    if (emp.arlRiskLevel?.includes('0.522%')) arlRate = 0.00522;

    const newItem = {
      employeeName: emp.fullName,
      documentId: emp.documentId,
      epsName: emp.epsName || 'EPS Sura',
      pensionFund: emp.pensionFund || 'Porvenir',
      arlRiskLevel: emp.arlRiskLevel || 'Nivel III (2.436% Agropecuario)',
      cajaCompensacion: emp.cajaCompensacion || 'Comfama',
      ibc,
      daysWorked: 30,
      healthWorker: Math.round(ibc * 0.04),
      healthEmployer: Math.round(ibc * 0.085),
      pensionWorker: Math.round(ibc * 0.04),
      pensionEmployer: Math.round(ibc * 0.12),
      arlEmployer: Math.round(ibc * arlRate),
      cajaEmployer: Math.round(ibc * 0.04),
      totalItem: Math.round(ibc * (0.04 + 0.085 + 0.04 + 0.12 + arlRate + 0.04)),
      novedad: {
        code: 'NINGUNA' as PilaNovedadCode,
        days: 0,
        notes: '',
      },
    };

    const newItems = [...draft.items, newItem];
    const summary = recalculateSummary(newItems);

    setDraft({
      ...draft,
      ...summary,
      items: newItems,
    });
    setShowAddEmp(false);
    setSelectedEmpId('');
  };

  const handleSaveDraftOnly = () => {
    onSaveDraft(draft);
    onClose();
  };

  const handleConsolidateAndGeneratePin = () => {
    const finalPin = `8839${Math.floor(100000 + Math.random() * 900000)}`;
    const consolidated: SocialSecurityPilaPlanilla = {
      ...draft,
      pilaPin: finalPin,
      status: 'Generada PILA',
      generationDate: new Date().toISOString().split('T')[0],
    };

    onConsolidatePin(consolidated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#15241C] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#012d1d] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#012d1d] via-[#02402a] to-[#012d1d] text-white p-5 flex items-start justify-between shrink-0 border-b border-emerald-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#D4A94E] text-white font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow">
                📝 Borrador PILA Cierre de Mes (Días 26-31)
              </span>
              <span className="bg-white/20 text-white font-mono text-xs px-2.5 py-0.5 rounded-lg border border-white/20">
                Periodo: {draft.period}
              </span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#ffba38]" />
              Edición de Borrador Planilla PILA & Novedades de Cotizantes
            </h2>
            <p className="text-xs text-[#A5B8AC]">
              {draft.farmName} — Operador: <strong>{draft.operatorName}</strong> | Basado en: {draft.draftBasePeriod || 'Planilla Anterior'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 grow bg-[#15241C]">

          {/* Banner Instructions */}
          <div className="bg-amber-950/30 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-black text-sm">🗓️ Período Automático de Pre-Liquidación PILA</p>
              <p>
                Este borrador se pre-llenó automáticamente para el cierre de mes. Puedes registrar <strong>novedades (SLN, IGE, LMA, VAC, VST, ING, RET)</strong>, ajustar IBCs, agregar o retirar trabajadores. Al finalizar, haz clic en <strong>Consolidar y Generar PIN Definitivo</strong> para pagar vía PSE.
              </p>
            </div>
          </div>

          {/* Quick Header Config & Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#15241C] p-3.5 rounded-2xl border-2 border-white/10 shadow-sm">
              <p className="text-[11px] font-bold text-[#717973]">Total Cotizantes</p>
              <p className="text-xl font-black text-white mt-1">{draft.totalEmployees} Empleados</p>
            </div>

            <div className="bg-[#15241C] p-3.5 rounded-2xl border-2 border-white/10 shadow-sm">
              <p className="text-[11px] font-bold text-[#717973]">IBC Total Acumulado</p>
              <p className="text-xl font-black text-emerald-800 mt-1 font-mono">
                ${draft.totalIbc.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="bg-[#15241C] p-3.5 rounded-2xl border-2 border-white/10 shadow-sm">
              <p className="text-[11px] font-bold text-[#717973]">Aportes Patronales</p>
              <p className="text-xl font-black text-white mt-1 font-mono">
                ${draft.totalEmployerContributions.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="bg-[#0D1A13] text-white p-3.5 rounded-2xl border-2 border-[#012d1d] shadow-md">
              <p className="text-[11px] font-bold text-[#ffba38]">Gran Total PILA PSE</p>
              <p className="text-xl font-black text-[#ffba38] mt-1 font-mono">
                ${draft.grandTotalPila.toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          {/* Operator Selector */}
          <div className="bg-[#15241C] p-4 rounded-2xl border-2 border-white/10 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-black text-white">Operador PILA de Liquidación</label>
                <p className="text-[11px] text-[#717973]">Selecciona el operador por el cual se transmitirá la planilla</p>
              </div>
              <select
                value={draft.operatorName}
                onChange={(e) => setDraft({ ...draft, operatorName: e.target.value as any })}
                className="p-2 rounded-xl border-2 border-white/10 bg-[#15241C] font-bold text-xs text-white focus:border-[#012d1d] focus:outline-none"
              >
                <option value="Aportes en Línea">Aportes en Línea</option>
                <option value="Mi Planilla">Mi Planilla (Compensar / SOI)</option>
                <option value="SOI">SOI (Seguridad Social)</option>
                <option value="Asopagos">Asopagos</option>
                <option value="Simple">Simple Aportes</option>
              </select>
            </div>
          </div>

          {/* Item Novedad Editor Sub-Panel (if editing an item) */}
          {editingIndex !== null && (
            <div className="bg-[#15241C] p-5 rounded-3xl border-2 border-[#ffba38] shadow-lg space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b pb-3 border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#D4A94E] text-white flex items-center justify-center font-black">
                    <Edit2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      Registrar Novedad — {draft.items[editingIndex].employeeName}
                    </h4>
                    <p className="text-[11px] text-[#717973]">
                      C.C. {draft.items[editingIndex].documentId} | {draft.items[editingIndex].epsName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="text-xs font-bold text-[#717973] hover:text-white"
                >
                  Cancelar Edición
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Novedad Type Selector */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-white mb-1">
                    Código de Novedad PILA
                  </label>
                  <select
                    value={novCode}
                    onChange={(e) => setNovCode(e.target.value as PilaNovedadCode)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] text-xs font-bold text-white focus:border-[#012d1d] focus:outline-none"
                  >
                    {Object.entries(NOVEDADES_DESCRIPTIONS).map(([code, info]) => (
                      <option key={code} value={code}>
                        {code} — {info.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#717973] mt-1 font-medium">
                    💡 {NOVEDADES_DESCRIPTIONS[novCode].desc}
                  </p>
                </div>

                {/* Days of Novedad */}
                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Días de Novedad / Trabajo
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={novDays}
                    onChange={(e) => setNovDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] text-xs font-bold text-white focus:border-[#012d1d] focus:outline-none"
                    placeholder="Ej. 5 días"
                  />
                  <p className="text-[10px] text-[#717973] mt-1">Días aplicables en el mes (0-30)</p>
                </div>

                {/* Custom IBC */}
                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Ingreso Base de Cotización (IBC)
                  </label>
                  <input
                    type="number"
                    step={10000}
                    value={novIbc}
                    onChange={(e) => setNovIbc(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] text-xs font-bold text-white focus:border-[#012d1d] focus:outline-none font-mono"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-white mb-1">
                    Observaciones / Radicado EPS / Justificación
                  </label>
                  <input
                    type="text"
                    value={novNotes}
                    onChange={(e) => setNovNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] text-xs font-medium text-white focus:border-[#012d1d] focus:outline-none"
                    placeholder="Ej. Incapacidad EPS Sura radicado #992815 de 5 días"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveItemNovedad}
                  className="bg-[#0D1A13] hover:bg-[#02402a] text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#ffba38]" />
                  Aplicar Novedad al Cotizante
                </button>
              </div>
            </div>
          )}

          {/* Employees List / Table */}
          <div className="bg-[#15241C] rounded-3xl border-2 border-white/10 overflow-hidden shadow-sm space-y-3 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-800" />
                Detalle de Cotizantes & Novedades ({draft.items.length})
              </h3>

              {!showAddEmp && (
                <button
                  type="button"
                  onClick={() => setShowAddEmp(true)}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold text-xs py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Cotizante
                </button>
              )}
            </div>

            {/* Add employee dropdown form */}
            {showAddEmp && (
              <div className="bg-[#15241C] p-3 rounded-2xl border-2 border-emerald-300 flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="grow p-2 rounded-xl border border-white/10 bg-[#15241C] text-xs font-bold text-white"
                >
                  <option value="">-- Seleccionar Empleado a Incluir en la Planilla --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} (C.C. {e.documentId}) — {e.role} [${e.baseRate.toLocaleString('es-CO')}]
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAddEmployeeToDraft}
                    className="bg-[#0D1A13] text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
                  >
                    Añadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEmp(false)}
                    className="bg-[#202E25] text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f1f4f2] text-[11px] font-black text-white uppercase tracking-wider border-b border-white/10">
                    <th className="p-2.5">Cotizante / Documento</th>
                    <th className="p-2.5">Novedad PILA</th>
                    <th className="p-2.5">Días</th>
                    <th className="p-2.5 text-right">IBC Base</th>
                    <th className="p-2.5 text-right">Salud (12.5%)</th>
                    <th className="p-2.5 text-right">Pensión (16%)</th>
                    <th className="p-2.5 text-right">ARL / Caja</th>
                    <th className="p-2.5 text-right">Total Item</th>
                    <th className="p-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee] text-xs">
                  {draft.items.map((item, idx) => {
                    const nov = item.novedad?.code || 'NINGUNA';
                    const info = NOVEDADES_DESCRIPTIONS[nov];

                    return (
                      <tr key={idx} className="hover:bg-[#0D1A13] transition-colors">
                        <td className="p-2.5">
                          <p className="font-black text-white">{item.employeeName}</p>
                          <p className="text-[10px] text-[#717973] font-mono">C.C. {item.documentId}</p>
                          <p className="text-[9px] text-emerald-800">{item.epsName} | {item.pensionFund}</p>
                        </td>

                        <td className="p-2.5">
                          <span
                            className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-lg border ${info.badgeBg} ${info.textCol}`}
                          >
                            {nov}
                          </span>
                          {item.novedad?.notes && (
                            <p className="text-[9px] text-[#717973] truncate max-w-[140px]" title={item.novedad.notes}>
                              {item.novedad.notes}
                            </p>
                          )}
                        </td>

                        <td className="p-2.5 font-bold text-center">
                          {item.daysWorked !== undefined ? item.daysWorked : 30} d
                        </td>

                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          ${item.ibc.toLocaleString('es-CO')}
                        </td>

                        <td className="p-2.5 text-right font-mono text-[11px]">
                          ${(item.healthWorker + item.healthEmployer).toLocaleString('es-CO')}
                        </td>

                        <td className="p-2.5 text-right font-mono text-[11px]">
                          ${(item.pensionWorker + item.pensionEmployer).toLocaleString('es-CO')}
                        </td>

                        <td className="p-2.5 text-right font-mono text-[11px]">
                          ${(item.arlEmployer + item.cajaEmployer).toLocaleString('es-CO')}
                        </td>

                        <td className="p-2.5 text-right font-mono font-black text-emerald-900">
                          ${item.totalItem.toLocaleString('es-CO')}
                        </td>

                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditItem(idx)}
                              title="Editar Novedad"
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              title="Retirar Cotizante"
                              className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#15241C] border-t border-white/10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#717973] font-medium">
            💡 Puedes conservar el borrador para seguir editando o consolidar para PSE.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveDraftOnly}
              className="flex-1 sm:flex-none bg-[#1F3327] hover:bg-[#202E25] text-white border-2 border-white/15 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Borrador
            </button>

            <button
              type="button"
              onClick={handleConsolidateAndGeneratePin}
              className="flex-1 sm:flex-none bg-[#D4A94E] hover:bg-[#ffa000] text-white font-black text-xs py-2.5 px-5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Consolidar & Generar PIN PSE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
