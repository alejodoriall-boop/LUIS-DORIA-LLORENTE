import React, { useState, useEffect } from 'react';
import {
  PayrollRun,
  PayrollItem,
  SocialSecurityPilaPlanilla,
  Employee,
  FarmDataPackage,
  PilaNovedadCode,
} from '../../types';
import {
  FileText,
  X,
  Palmtree,
  Gift,
  Landmark,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { calculateSocialSecurity } from '../PayrollView';

interface PayrollTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmDataPackage;
  employees: Employee[];
  onGeneratePayrollRun: (run: PayrollRun) => void;
  onGeneratePilaDraft: (pila: SocialSecurityPilaPlanilla) => void;
}

export const PayrollTemplatesModal: React.FC<PayrollTemplatesModalProps> = ({
  isOpen,
  onClose,
  farm,
  employees,
  onGeneratePayrollRun,
  onGeneratePilaDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'vacaciones' | 'bonificaciones' | 'cesantias'>('vacaciones');

  const farmId = farm.profile?.id || (farm as any).id || 'farm-1';
  const farmName = farm.profile?.name || (farm as any).name || 'Finca Ganadera';
  const activeEmps = employees.filter((e) => e.farmId === farmId && e.status === 'Activo');

  // =========================================================================
  // 1. VACATION TEMPLATE STATE
  // =========================================================================
  const [vacType, setVacType] = useState<'disfrutadas' | 'compensadas'>('disfrutadas');
  const [vacDays, setVacDays] = useState<number>(15);
  const [vacStartDate, setVacStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedVacEmpIds, setSelectedVacEmpIds] = useState<string[]>([]);
  const [vacIncludeAuxTransport, setVacIncludeAuxTransport] = useState<boolean>(false);

  // =========================================================================
  // 2. BONUSES TEMPLATE STATE
  // =========================================================================
  const [bonusCategory, setBonusCategory] = useState<'constitutiva' | 'no_constitutiva' | 'prima_extralegal'>('constitutiva');
  const [bonusReason, setBonusReason] = useState<string>('Bonificación por Meta de Ordeño y Producción de Leche');
  const [bonusAmounts, setBonusAmounts] = useState<Record<string, number>>({});
  const [bonusApplyAll, setBonusApplyAll] = useState<number>(200000);

  // =========================================================================
  // 3. SEVERANCE (CESANTÍAS) TEMPLATE STATE
  // =========================================================================
  const [cesantiasMode, setCesantiasMode] = useState<'consignacion_fondo' | 'intereses_directos' | 'liquidacion_parcial'>('intereses_directos');
  const [cesantiasDays, setCesantiasDays] = useState<number>(360);
  const [selectedCesEmpIds, setSelectedCesEmpIds] = useState<string[]>([]);
  const [partialReason, setPartialReason] = useState<string>('Remodelación / Mejoras de Vivienda Rural');

  useEffect(() => {
    if (isOpen) {
      // Default select all active employees for templates
      setSelectedVacEmpIds(activeEmps.map((e) => e.id));
      setSelectedCesEmpIds(activeEmps.map((e) => e.id));

      const initialBonusMap: Record<string, number> = {};
      activeEmps.forEach((e) => {
        initialBonusMap[e.id] = 200000;
      });
      setBonusAmounts(initialBonusMap);
    }
  }, [isOpen, employees]);

  if (!isOpen) return null;

  // Toggle selection
  const toggleVacEmp = (id: string) => {
    setSelectedVacEmpIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleCesEmp = (id: string) => {
    setSelectedCesEmpIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // -------------------------------------------------------------------------
  // GENERATION HANDLER 1: VACATIONS (VACACIONES)
  // -------------------------------------------------------------------------
  const handleGenerateVacationPayroll = () => {
    if (selectedVacEmpIds.length === 0) {
      alert('⚠️ Selecciona al menos un trabajador para liquidar vacaciones.');
      return;
    }

    const targetEmps = activeEmps.filter((e) => selectedVacEmpIds.includes(e.id));
    const isDisfrutadas = vacType === 'disfrutadas';

    let runTotalBase = 0;
    let runTotalBonuses = 0;
    let runTotalDeductions = 0;
    let runTotalNet = 0;

    const items: PayrollItem[] = targetEmps.map((emp) => {
      const dailyRate = Math.round(emp.baseRate / 30);
      const vacationBase = Math.round(dailyRate * vacDays);
      const auxTransport = vacIncludeAuxTransport ? Math.round((162000 / 30) * vacDays) : 0;

      // Desglose SS
      const ss = calculateSocialSecurity(emp, vacationBase);
      const healthDeduction = isDisfrutadas ? Math.round(vacationBase * 0.04) : 0;
      const pensionDeduction = isDisfrutadas ? Math.round(vacationBase * 0.04) : 0;
      const totalDeductions = healthDeduction + pensionDeduction;
      const netPayable = vacationBase + auxTransport - totalDeductions;

      runTotalBase += vacationBase;
      runTotalBonuses += auxTransport;
      runTotalDeductions += totalDeductions;
      runTotalNet += netPayable;

      return {
        id: `vac-item-${emp.id}-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        role: emp.role,
        daysWorked: vacDays,
        basePay: vacationBase,
        overtimePay: 0,
        bonuses: auxTransport,
        deductions: totalDeductions,
        netPayable,
        socialSecurity: ss,
        notes: `Vacaciones ${isDisfrutadas ? 'Disfrutadas' : 'Compensadas'} (${vacDays} días). Inicio: ${vacStartDate}`,
      };
    });

    const runId = `run-vac-${Date.now()}`;
    const periodStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const newRun: PayrollRun = {
      id: runId,
      farmId,
      farmName,
      periodName: `Liquidación de Vacaciones (${isDisfrutadas ? 'Disfrutadas' : 'Compensadas'}) - ${vacDays} Días`,
      periodType: 'Vacaciones',
      startDate: vacStartDate,
      endDate: new Date(new Date(vacStartDate).getTime() + vacDays * 86400000).toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'Aprobada',
      businessUnit: 'corporativo_general',
      items,
      totalBase: runTotalBase,
      totalOvertime: 0,
      totalBonuses: runTotalBonuses,
      totalDeductions: runTotalDeductions,
      totalNetPayable: runTotalNet,
      createdAt: new Date().toISOString(),
    };

    // Auto-create PILA Draft with VAC Novedad
    const pilaItems = targetEmps.map((emp) => {
      const dailyRate = Math.round(emp.baseRate / 30);
      const ibc = Math.round(dailyRate * 30); // Base mensual normal
      const ss = calculateSocialSecurity(emp, ibc);

      return {
        employeeName: emp.fullName,
        documentId: emp.documentId,
        epsName: emp.epsName || 'EPS Sura',
        pensionFund: emp.pensionFund || 'Porvenir',
        arlRiskLevel: emp.arlRiskLevel || 'Nivel III (2.436% Agropecuario)',
        cajaCompensacion: emp.cajaCompensacion || 'Comfama',
        ibc,
        daysWorked: isDisfrutadas ? 30 - vacDays : 30,
        healthWorker: ss.workerHealth,
        healthEmployer: ss.employerHealth,
        pensionWorker: ss.workerPension,
        pensionEmployer: ss.employerPension,
        arlEmployer: isDisfrutadas ? Math.round(ss.employerArl * ((30 - vacDays) / 30)) : ss.employerArl,
        cajaEmployer: ss.employerCaja,
        totalItem: ss.totalCombined,
        novedad: {
          code: 'VAC' as PilaNovedadCode,
          days: vacDays,
          startDate: vacStartDate,
          notes: `Vacaciones ${isDisfrutadas ? 'Disfrutadas' : 'Compensadas'} ${vacDays} días. ARL pro-rateada`,
        },
      };
    });

    let totalIbc = 0;
    let totalEmployerContrib = 0;
    let totalWorkerDeduc = 0;

    pilaItems.forEach((item) => {
      totalIbc += item.ibc;
      totalEmployerContrib += item.healthEmployer + item.pensionEmployer + item.arlEmployer + item.cajaEmployer;
      totalWorkerDeduc += item.healthWorker + item.pensionWorker;
    });

    const pilaDraft: SocialSecurityPilaPlanilla = {
      id: `pila-vac-${Date.now()}`,
      farmId,
      farmName,
      period: periodStr,
      operatorName: 'Aportes en Línea',
      pilaPin: 'BORRADOR-VACACIONES',
      generationDate: new Date().toISOString().split('T')[0],
      totalEmployees: pilaItems.length,
      totalIbc,
      totalHealth: pilaItems.reduce((a, b) => a + b.healthWorker + b.healthEmployer, 0),
      totalPension: pilaItems.reduce((a, b) => a + b.pensionWorker + b.pensionEmployer, 0),
      totalArl: pilaItems.reduce((a, b) => a + b.arlEmployer, 0),
      totalCaja: pilaItems.reduce((a, b) => a + b.cajaEmployer, 0),
      totalEmployerContributions: totalEmployerContrib,
      totalWorkerDeductions: totalWorkerDeduc,
      grandTotalPila: totalEmployerContrib + totalWorkerDeduc,
      status: 'Borrador',
      isAutoGeneratedDraft: true,
      draftBasePeriod: 'Plantilla de Vacaciones',
      items: pilaItems,
    };

    onGeneratePayrollRun(newRun);
    onGeneratePilaDraft(pilaDraft);
    onClose();
  };

  // -------------------------------------------------------------------------
  // GENERATION HANDLER 2: BONUSES & LEY 1393 (BONIFICACIONES)
  // -------------------------------------------------------------------------
  const handleGenerateBonusPayroll = () => {
    let runTotalBase = 0;
    let runTotalBonuses = 0;
    let runTotalNet = 0;

    const isConstitutive = bonusCategory === 'constitutiva';

    const items: PayrollItem[] = activeEmps.map((emp) => {
      const bonusAmt = bonusAmounts[emp.id] || 0;
      const basePay = 0; // Nómina exclusiva de bonificación
      const netPayable = bonusAmt;

      runTotalBonuses += bonusAmt;
      runTotalNet += bonusAmt;

      return {
        id: `bon-item-${emp.id}-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        role: emp.role,
        daysWorked: 30,
        basePay: 0,
        overtimePay: 0,
        bonuses: bonusAmt,
        deductions: 0,
        netPayable,
        notes: `Bonificación (${bonusCategory.toUpperCase()}): ${bonusReason}`,
      };
    });

    const periodStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const newRun: PayrollRun = {
      id: `run-bon-${Date.now()}`,
      farmId,
      farmName,
      periodName: `Nómina Especial de Bonificaciones (${bonusReason})`,
      periodType: 'Bonificaciones',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'Aprobada',
      businessUnit: 'corporativo_general',
      items,
      totalBase: 0,
      totalOvertime: 0,
      totalBonuses: runTotalBonuses,
      totalDeductions: 0,
      totalNetPayable: runTotalNet,
      createdAt: new Date().toISOString(),
    };

    // Auto-create PILA Draft with Ley 1393 calculation
    const pilaItems = activeEmps.map((emp) => {
      const bonusAmt = bonusAmounts[emp.id] || 0;
      const regularSalary = emp.baseRate;
      let finalIbc = regularSalary;

      if (isConstitutive) {
        finalIbc += bonusAmt;
      } else {
        // Ley 1393: 40% rule check
        const totalComp = regularSalary + bonusAmt;
        const maxNonConstitutive = totalComp * 0.4;
        if (bonusAmt > maxNonConstitutive) {
          const excess = bonusAmt - maxNonConstitutive;
          finalIbc += excess; // Add excess to IBC
        }
      }

      const ss = calculateSocialSecurity(emp, finalIbc);

      return {
        employeeName: emp.fullName,
        documentId: emp.documentId,
        epsName: emp.epsName || 'EPS Sura',
        pensionFund: emp.pensionFund || 'Porvenir',
        arlRiskLevel: emp.arlRiskLevel || 'Nivel III (2.436% Agropecuario)',
        cajaCompensacion: emp.cajaCompensacion || 'Comfama',
        ibc: finalIbc,
        daysWorked: 30,
        healthWorker: ss.workerHealth,
        healthEmployer: ss.employerHealth,
        pensionWorker: ss.workerPension,
        pensionEmployer: ss.employerPension,
        arlEmployer: ss.employerArl,
        cajaEmployer: ss.employerCaja,
        totalItem: ss.totalCombined,
        novedad: {
          code: 'VST' as PilaNovedadCode,
          days: 0,
          newIbc: finalIbc,
          notes: `VST Bonificaciones (${isConstitutive ? 'Constitutiva' : 'Ley 1393 Limit 40%'})`,
        },
      };
    });

    let totalIbc = 0;
    let totalEmployerContrib = 0;
    let totalWorkerDeduc = 0;

    pilaItems.forEach((item) => {
      totalIbc += item.ibc;
      totalEmployerContrib += item.healthEmployer + item.pensionEmployer + item.arlEmployer + item.cajaEmployer;
      totalWorkerDeduc += item.healthWorker + item.pensionWorker;
    });

    const pilaDraft: SocialSecurityPilaPlanilla = {
      id: `pila-bon-${Date.now()}`,
      farmId,
      farmName,
      period: periodStr,
      operatorName: 'Aportes en Línea',
      pilaPin: 'BORRADOR-BONIFICACIONES',
      generationDate: new Date().toISOString().split('T')[0],
      totalEmployees: pilaItems.length,
      totalIbc,
      totalHealth: pilaItems.reduce((a, b) => a + b.healthWorker + b.healthEmployer, 0),
      totalPension: pilaItems.reduce((a, b) => a + b.pensionWorker + b.pensionEmployer, 0),
      totalArl: pilaItems.reduce((a, b) => a + b.arlEmployer, 0),
      totalCaja: pilaItems.reduce((a, b) => a + b.cajaEmployer, 0),
      totalEmployerContributions: totalEmployerContrib,
      totalWorkerDeductions: totalWorkerDeduc,
      grandTotalPila: totalEmployerContrib + totalWorkerDeduc,
      status: 'Borrador',
      isAutoGeneratedDraft: true,
      draftBasePeriod: 'Plantilla de Bonificaciones (Ley 1393)',
      items: pilaItems,
    };

    onGeneratePayrollRun(newRun);
    onGeneratePilaDraft(pilaDraft);
    onClose();
  };

  // -------------------------------------------------------------------------
  // GENERATION HANDLER 3: SEVERANCE & INTERESTS (CESANTÍAS E INTERESES)
  // -------------------------------------------------------------------------
  const handleGenerateCesantiasPayroll = () => {
    if (selectedCesEmpIds.length === 0) {
      alert('⚠️ Selecciona al menos un trabajador para cesantías/intereses.');
      return;
    }

    const targetEmps = activeEmps.filter((e) => selectedCesEmpIds.includes(e.id));
    const auxTransporte = 162000;

    let runTotalBase = 0;
    let runTotalBonuses = 0;
    let runTotalNet = 0;

    const items: PayrollItem[] = targetEmps.map((emp) => {
      const baseSalary = emp.baseRate + auxTransporte;
      const cesantiasAmount = Math.round((baseSalary * cesantiasDays) / 360);
      const interesesAmount = Math.round((cesantiasAmount * cesantiasDays * 0.12) / 360);

      let netPayable = 0;
      let notes = '';

      if (cesantiasMode === 'intereses_directos') {
        netPayable = interesesAmount;
        notes = `Pago Directo 12% Intereses sobre Cesantías (${cesantiasDays} días). Base Cesantías: $${cesantiasAmount.toLocaleString('es-CO')}`;
      } else if (cesantiasMode === 'consignacion_fondo') {
        netPayable = cesantiasAmount;
        notes = `Consignación a Fondo de Cesantías (${emp.pensionFund || 'Porvenir'}). Cesantías Anuales Ley 50 (${cesantiasDays} días)`;
      } else {
        netPayable = cesantiasAmount + interesesAmount;
        notes = `Liquidación Parcial Cesantías + Intereses (${partialReason}). Total: $${netPayable.toLocaleString('es-CO')}`;
      }

      runTotalBase += cesantiasAmount;
      runTotalBonuses += interesesAmount;
      runTotalNet += netPayable;

      return {
        id: `ces-item-${emp.id}-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        role: emp.role,
        daysWorked: cesantiasDays,
        basePay: cesantiasAmount,
        overtimePay: 0,
        bonuses: interesesAmount,
        deductions: 0,
        netPayable,
        notes,
      };
    });

    const newRun: PayrollRun = {
      id: `run-ces-${Date.now()}`,
      farmId,
      farmName,
      periodName: `Liquidación de Cesantías e Intereses de Cesantías (Periodo ${cesantiasDays} Días)`,
      periodType: 'Cesantías',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'Aprobada',
      businessUnit: 'corporativo_general',
      items,
      totalBase: runTotalBase,
      totalOvertime: 0,
      totalBonuses: runTotalBonuses,
      totalDeductions: 0,
      totalNetPayable: runTotalNet,
      createdAt: new Date().toISOString(),
    };

    onGeneratePayrollRun(newRun);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#012d1d] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#012d1d] via-[#023e2a] to-[#012d1d] text-white p-5 flex items-start justify-between shrink-0 border-b border-emerald-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#ffba38] text-[#012d1d] font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow">
                📋 Plantillas Automatizadas de Nómina & PILA
              </span>
              <span className="bg-white/20 text-white font-mono text-xs px-2.5 py-0.5 rounded-lg border border-white/20">
                Normativa Laboral Colombia
              </span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#ffba38]" />
              Plantillas de Liquidación: Vacaciones, Bonificaciones & Cesantías
            </h2>
            <p className="text-xs text-[#c1ecd4]">
              {farmName} — Genera liquidaciones exactas con fórmulas legales, cálculos de IBC y borrador PILA precargado
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#f1f4f2] px-6 py-3 border-b border-[#c1c8c2] flex items-center gap-3 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('vacaciones')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'vacaciones'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-md border border-[#012d1d]'
                : 'bg-white text-[#717973] hover:bg-slate-100 border border-[#c1c8c2]'
            }`}
          >
            <Palmtree className="w-4 h-4 text-emerald-600" />
            <span>1. Plantilla de Vacaciones</span>
          </button>

          <button
            onClick={() => setActiveTab('bonificaciones')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'bonificaciones'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-md border border-[#012d1d]'
                : 'bg-white text-[#717973] hover:bg-slate-100 border border-[#c1c8c2]'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-500" />
            <span>2. Plantilla de Bonificaciones (Ley 1393)</span>
          </button>

          <button
            onClick={() => setActiveTab('cesantias')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'cesantias'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-md border border-[#012d1d]'
                : 'bg-white text-[#717973] hover:bg-slate-100 border border-[#c1c8c2]'
            }`}
          >
            <Landmark className="w-4 h-4 text-sky-600" />
            <span>3. Plantilla de Cesantías e Intereses</span>
          </button>
        </div>

        {/* Body Content according to Active Tab */}
        <div className="p-5 overflow-y-auto grow bg-[#f8fbf9] space-y-5">

          {/* ========================================================================= */}
          {/* TAB 1: VACACIONES */}
          {/* ========================================================================= */}
          {activeTab === 'vacaciones' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Information Banner */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
                <Palmtree className="w-6 h-6 text-emerald-800 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-black text-sm">🏖️ Liquidación de Vacaciones y Novedad PILA Code VAC</p>
                  <p>
                    Según el Art. 186 del Código Sustantivo del Trabajo, el trabajador tiene derecho a 15 días hábiles de descanso remunerado por año de servicio.
                    Al generar esta plantilla, el sistema calcula la liquidación y pre-carga la novedad <strong>VAC</strong> en la planilla PILA con el ajuste proporcional del aporte de ARL a $0 durante el período de disfrute.
                  </p>
                </div>
              </div>

              {/* Configuration Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-3xl border-2 border-[#c1c8c2] shadow-sm">
                <div>
                  <label className="block text-xs font-black text-[#012d1d] mb-1">
                    Modalidad de Vacaciones
                  </label>
                  <select
                    value={vacType}
                    onChange={(e) => setVacType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#c1c8c2] bg-white text-xs font-bold text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                  >
                    <option value="disfrutadas">Disfrutadas en Tiempo (Descanso efectivo)</option>
                    <option value="compensadas">Compensadas en Dinero (Sin suspensión de trabajo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#012d1d] mb-1">
                    Días a Liquidar
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={vacDays}
                    onChange={(e) => setVacDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border-2 border-[#c1c8c2] bg-white text-xs font-bold text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#717973] mt-1">Estándar 15 días / año completo</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#012d1d] mb-1">
                    Fecha Inicio de Vacaciones
                  </label>
                  <input
                    type="date"
                    value={vacStartDate}
                    onChange={(e) => setVacStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#c1c8c2] bg-white text-xs font-bold text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                  />
                </div>
              </div>

              {/* Employee Selector Table */}
              <div className="bg-white rounded-3xl border-2 border-[#c1c8c2] overflow-hidden p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-[#012d1d] uppercase tracking-wider">
                    Selecciona Trabajadores para Vacaciones ({selectedVacEmpIds.length} / {activeEmps.length})
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedVacEmpIds.length === activeEmps.length) {
                        setSelectedVacEmpIds([]);
                      } else {
                        setSelectedVacEmpIds(activeEmps.map((e) => e.id));
                      }
                    }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
                  >
                    {selectedVacEmpIds.length === activeEmps.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-[#f1f4f2] text-[11px] font-black text-[#012d1d] uppercase tracking-wider border-b border-[#c1c8c2]">
                        <th className="p-2.5 text-center">Incluir</th>
                        <th className="p-2.5">Trabajador</th>
                        <th className="p-2.5">Salario Base</th>
                        <th className="p-2.5 text-right">Valor Día</th>
                        <th className="p-2.5 text-right">Valor {vacDays} Días Vacaciones</th>
                        <th className="p-2.5 text-center">Efecto PILA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee] text-xs">
                      {activeEmps.map((emp) => {
                        const isSelected = selectedVacEmpIds.includes(emp.id);
                        const dailyRate = Math.round(emp.baseRate / 30);
                        const vacTotal = Math.round(dailyRate * vacDays);

                        return (
                          <tr key={emp.id} className={isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}>
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleVacEmp(emp.id)}
                                className="w-4 h-4 accent-[#012d1d] cursor-pointer"
                              />
                            </td>

                            <td className="p-2.5">
                              <p className="font-black text-[#012d1d]">{emp.fullName}</p>
                              <p className="text-[10px] text-[#717973]">{emp.role} (C.C. {emp.documentId})</p>
                            </td>

                            <td className="p-2.5 font-mono font-bold text-[#012d1d]">
                              ${emp.baseRate.toLocaleString('es-CO')}
                            </td>

                            <td className="p-2.5 text-right font-mono text-[#717973]">
                              ${dailyRate.toLocaleString('es-CO')}
                            </td>

                            <td className="p-2.5 text-right font-mono font-black text-emerald-900">
                              ${vacTotal.toLocaleString('es-CO')}
                            </td>

                            <td className="p-2.5 text-center">
                              <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                                Code VAC ({vacDays}d)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateVacationPayroll}
                  className="bg-[#012d1d] hover:bg-[#02402a] text-white font-black text-xs py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#ffba38]" />
                  Generar Liquidación de Vacaciones & Borrador PILA
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BONIFICACIONES & LEY 1393 */}
          {/* ========================================================================= */}
          {activeTab === 'bonificaciones' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Information Banner */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                <Gift className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 space-y-1">
                  <p className="font-black text-sm">🎁 Bonificaciones, Primas de Ordeño y Ley 1393 de 2010</p>
                  <p>
                    Permite estructurar pagos por rendimiento (kilos de leche, natalidad, metas de peso).
                    <strong> Control de Ley 1393:</strong> Si otorgas bonificaciones no constitutivas de salario y estas superan el <strong>40% del total devengado</strong> del trabajador en el mes, el excedente sobre el 40% se suma automáticamente a la Base de Cotización (IBC) de la planilla PILA para evitar sanciones de la UGPP.
                  </p>
                </div>
              </div>

              {/* Category & Reason Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-3xl border-2 border-[#c1c8c2] shadow-sm">
                <div>
                  <label className="block text-xs font-black text-[#012d1d] mb-1">
                    Tipo de Bonificación
                  </label>
                  <select
                    value={bonusCategory}
                    onChange={(e) => setBonusCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#c1c8c2] bg-white text-xs font-bold text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                  >
                    <option value="constitutiva">Constitutiva de Salario (100% IBC PILA)</option>
                    <option value="no_constitutiva">No Constitutiva de Salario (Art. 128 CST / Sujeta a Tope 40%)</option>
                    <option value="prima_extralegal">Prima Extralegal de Servicios</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-[#012d1d] mb-1">
                    Concepto / Motivo de la Bonificación
                  </label>
                  <input
                    type="text"
                    value={bonusReason}
                    onChange={(e) => setBonusReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#c1c8c2] bg-white text-xs font-bold text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                    placeholder="Ej. Bonificación por Meta de Kilos de Leche y Cero Mastitis"
                  />
                </div>
              </div>

              {/* Quick Bulk Bonus Setter */}
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-bold text-emerald-950">Asignar Monto General a Todos:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={10000}
                    value={bonusApplyAll}
                    onChange={(e) => setBonusApplyAll(Number(e.target.value))}
                    className="p-1.5 rounded-xl border border-emerald-400 bg-white text-xs font-mono font-bold w-32 text-emerald-950"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated: Record<string, number> = {};
                      activeEmps.forEach((e) => {
                        updated[e.id] = bonusApplyAll;
                      });
                      setBonusAmounts(updated);
                    }}
                    className="bg-[#012d1d] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Aplicar a Todos
                  </button>
                </div>
              </div>

              {/* Employee Bonus Matrix */}
              <div className="bg-white rounded-3xl border-2 border-[#c1c8c2] overflow-hidden p-4 space-y-3">
                <h3 className="text-xs font-black text-[#012d1d] uppercase tracking-wider">
                  Matriz de Bonificaciones por Trabajador ({activeEmps.length} Empleados)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-[#f1f4f2] text-[11px] font-black text-[#012d1d] uppercase tracking-wider border-b border-[#c1c8c2]">
                        <th className="p-2.5">Trabajador</th>
                        <th className="p-2.5 text-right">Salario Ordinario</th>
                        <th className="p-2.5 text-center">Monto Bonificación ($)</th>
                        <th className="p-2.5 text-right">Devengado Total</th>
                        <th className="p-2.5 text-center">Tope 40% Ley 1393</th>
                        <th className="p-2.5 text-right">IBC Ajustado PILA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee] text-xs">
                      {activeEmps.map((emp) => {
                        const bonusAmt = bonusAmounts[emp.id] || 0;
                        const totalDevengado = emp.baseRate + bonusAmt;
                        const max40 = totalDevengado * 0.4;
                        const isExceeded = bonusCategory === 'no_constitutiva' && bonusAmt > max40;
                        const excess = isExceeded ? bonusAmt - max40 : 0;
                        const ibcPila = bonusCategory === 'constitutiva' ? totalDevengado : emp.baseRate + excess;

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <p className="font-black text-[#012d1d]">{emp.fullName}</p>
                              <p className="text-[10px] text-[#717973]">{emp.role}</p>
                            </td>

                            <td className="p-2.5 text-right font-mono font-bold text-[#012d1d]">
                              ${emp.baseRate.toLocaleString('es-CO')}
                            </td>

                            <td className="p-2.5 text-center">
                              <input
                                type="number"
                                step={10000}
                                value={bonusAmt}
                                onChange={(e) =>
                                  setBonusAmounts({
                                    ...bonusAmounts,
                                    [emp.id]: Number(e.target.value),
                                  })
                                }
                                className="p-1.5 rounded-xl border border-[#c1c8c2] bg-white text-xs font-mono font-bold text-[#012d1d] w-32 text-center"
                              />
                            </td>

                            <td className="p-2.5 text-right font-mono font-black text-emerald-900">
                              ${totalDevengado.toLocaleString('es-CO')}
                            </td>

                            <td className="p-2.5 text-center">
                              {bonusCategory === 'no_constitutiva' ? (
                                isExceeded ? (
                                  <span className="bg-rose-100 text-rose-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-rose-300">
                                    ⚠️ Supera 40% (+${Math.round(excess).toLocaleString('es-CO')})
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                                    ✔️ Dentro del 40%
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold">100% Salarial</span>
                              )}
                            </td>

                            <td className="p-2.5 text-right font-mono font-black text-emerald-950">
                              ${Math.round(ibcPila).toLocaleString('es-CO')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateBonusPayroll}
                  className="bg-[#012d1d] hover:bg-[#02402a] text-white font-black text-xs py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#ffba38]" />
                  Generar Nómina Especial de Bonificaciones & Borrador PILA (Ley 1393)
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CESANTÍAS E INTERESES */}
          {/* ========================================================================= */}
          {activeTab === 'cesantias' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Information Banner */}
              <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 flex items-start gap-3">
                <Landmark className="w-6 h-6 text-sky-800 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-950 space-y-1">
                  <p className="font-black text-sm">🏦 Cesantías e Intereses sobre Cesantías (Ley 50 / CST)</p>
                  <p>
                    <strong>Cesantías Anuales:</strong> Un mes de salario completo por cada año laborado, que se consigna directamente en el fondo del trabajador (Porvenir, Protección, Colfondos, FNA) antes del 14 de Febrero.
                    <br />
                    <strong>Intereses sobre Cesantías (12% Anual):</strong> Se pagan directamente al trabajador en el dinero de la primera quincena de Enero de cada año o al finalizar contrato.
                  </p>
                </div>
              </div>

              {/* Configuration Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-3xl border-2 border-[#c1c8c2] shadow-sm">
                <div>
                  <label className="block text-xs font-black text-[#012d1d] mb-1">
                    Tipo de Liquidación
                  </label>
                  <select
                    value={cesantiasMode}
                    onChange={(e) => setCesantiasMode(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#c1c8c2] bg-white text-xs font-bold text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                  >
                    <option value="intereses_directos">Pago Directo de Intereses de Cesantías (12% Anual)</option>
                    <option value="consignacion_fondo">Consignación Anual a Fondo de Cesantías (Porvenir / Protección / FNA)</option>
                    <option value="liquidacion_parcial">Liquidación Parcial de Cesantías (Vivienda / Estudio)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#012d1d] mb-1">
                    Días Laborados a Liquidar
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={360}
                    value={cesantiasDays}
                    onChange={(e) => setCesantiasDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border-2 border-[#c1c8c2] bg-white text-xs font-bold text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#717973] mt-1">360 días = Año completo laboral</p>
                </div>

                {cesantiasMode === 'liquidacion_parcial' && (
                  <div>
                    <label className="block text-xs font-black text-[#012d1d] mb-1">
                      Destino de Liquidación Parcial
                    </label>
                    <input
                      type="text"
                      value={partialReason}
                      onChange={(e) => setPartialReason(e.target.value)}
                      className="w-full p-2.5 rounded-xl border-2 border-[#c1c8c2] bg-white text-xs font-bold text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Employee Selector Table */}
              <div className="bg-white rounded-3xl border-2 border-[#c1c8c2] overflow-hidden p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-[#012d1d] uppercase tracking-wider">
                    Trabajadores para Cesantías ({selectedCesEmpIds.length} / {activeEmps.length})
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCesEmpIds.length === activeEmps.length) {
                        setSelectedCesEmpIds([]);
                      } else {
                        setSelectedCesEmpIds(activeEmps.map((e) => e.id));
                      }
                    }}
                    className="text-xs font-bold text-sky-800 hover:text-sky-900 cursor-pointer"
                  >
                    {selectedCesEmpIds.length === activeEmps.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-[#f1f4f2] text-[11px] font-black text-[#012d1d] uppercase tracking-wider border-b border-[#c1c8c2]">
                        <th className="p-2.5 text-center">Incluir</th>
                        <th className="p-2.5">Trabajador / Fondo</th>
                        <th className="p-2.5 text-right">Base (Salario + Aux)</th>
                        <th className="p-2.5 text-right">Cesantías Acumuladas</th>
                        <th className="p-2.5 text-right">Intereses (12%)</th>
                        <th className="p-2.5 text-right font-black">Neto A Liquidar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee] text-xs">
                      {activeEmps.map((emp) => {
                        const isSelected = selectedCesEmpIds.includes(emp.id);
                        const baseSalary = emp.baseRate + 162000;
                        const cesantiasAmount = Math.round((baseSalary * cesantiasDays) / 360);
                        const interesesAmount = Math.round((cesantiasAmount * cesantiasDays * 0.12) / 360);

                        let netToPay = 0;
                        if (cesantiasMode === 'intereses_directos') netToPay = interesesAmount;
                        else if (cesantiasMode === 'consignacion_fondo') netToPay = cesantiasAmount;
                        else netToPay = cesantiasAmount + interesesAmount;

                        return (
                          <tr key={emp.id} className={isSelected ? 'bg-sky-50/50' : 'hover:bg-slate-50'}>
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleCesEmp(emp.id)}
                                className="w-4 h-4 accent-[#012d1d] cursor-pointer"
                              />
                            </td>

                            <td className="p-2.5">
                              <p className="font-black text-[#012d1d]">{emp.fullName}</p>
                              <p className="text-[10px] text-sky-900 font-bold">Fondo: {emp.pensionFund || 'Porvenir'}</p>
                            </td>

                            <td className="p-2.5 text-right font-mono font-bold text-[#012d1d]">
                              ${baseSalary.toLocaleString('es-CO')}
                            </td>

                            <td className="p-2.5 text-right font-mono text-[#717973]">
                              ${cesantiasAmount.toLocaleString('es-CO')}
                            </td>

                            <td className="p-2.5 text-right font-mono text-emerald-800 font-bold">
                              ${interesesAmount.toLocaleString('es-CO')}
                            </td>

                            <td className="p-2.5 text-right font-mono font-black text-emerald-950">
                              ${netToPay.toLocaleString('es-CO')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateCesantiasPayroll}
                  className="bg-[#012d1d] hover:bg-[#02402a] text-white font-black text-xs py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#ffba38]" />
                  Generar Liquidación de Cesantías / Intereses
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
