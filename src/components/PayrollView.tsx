import React, { useState, useMemo, useEffect } from 'react';
import { safePrint } from '../utils/printUtils';
import {
  Employee,
  PayrollRun,
  PayrollAdvance,
  PayrollItem,
  FarmDataPackage,
  FinancialTransaction,
  BusinessUnitId,
  WorkerRole,
  ContractType,
  SocialSecurityBreakdown,
  SocialSecurityPilaPlanilla,
  PilaNovedadCode,
} from '../types';
import { EditPilaDraftModal } from './modals/EditPilaDraftModal';
import { PayrollDisbursementModal } from './modals/PayrollDisbursementModal';
import { PayrollTemplatesModal } from './modals/PayrollTemplatesModal';
import {
  Users,
  UserPlus,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Briefcase,
  Plus,
  Trash2,
  Edit,
  Eye,
  CreditCard,
  Building,
  Building2,
  Check,
  X,
  Search,
  Filter,
  TrendingUp,
  Receipt,
  Printer,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Lock,
  Info,
} from 'lucide-react';

interface PayrollViewProps {
  currentFarm: FarmDataPackage;
  farms: FarmDataPackage[];
  employees: Employee[];
  payrollRuns: PayrollRun[];
  payrollAdvances: PayrollAdvance[];
  financialTransactions: FinancialTransaction[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onAddPayrollRun: (run: PayrollRun) => void;
  onUpdatePayrollRun: (run: PayrollRun) => void;
  onAddPayrollAdvance: (adv: PayrollAdvance) => void;
  onAddFinancialTransaction: (tx: FinancialTransaction) => void;
}

// Helper function for Colombia Social Security calculations
export function calculateSocialSecurity(emp: Partial<Employee>, basePay: number): SocialSecurityBreakdown {
  const ibc = emp.ibcSalary || basePay || 1650000;
  
  const workerHealth = Math.round(ibc * 0.04);
  const workerPension = Math.round(ibc * 0.04);
  
  const employerHealth = Math.round(ibc * 0.085);
  const employerPension = Math.round(ibc * 0.12);
  
  let arlRate = 0.02436; // Nivel III Agropecuario default
  if (emp.arlRiskLevel?.includes('Nivel I')) arlRate = 0.00522;
  else if (emp.arlRiskLevel?.includes('Nivel II')) arlRate = 0.01044;
  else if (emp.arlRiskLevel?.includes('Nivel III')) arlRate = 0.02436;
  else if (emp.arlRiskLevel?.includes('Nivel IV')) arlRate = 0.04350;
  else if (emp.arlRiskLevel?.includes('Nivel V')) arlRate = 0.06960;
  
  const employerArl = Math.round(ibc * arlRate);
  const employerCaja = Math.round(ibc * 0.04);
  const employerSenaIcbf = 0; // Exento para la gran mayoría de pymes ganaderas

  const totalWorkerDeduction = workerHealth + workerPension;
  const totalEmployerContribution = employerHealth + employerPension + employerArl + employerCaja + employerSenaIcbf;
  const totalCombined = totalWorkerDeduction + totalEmployerContribution;

  return {
    ibc,
    epsName: emp.epsName || 'EPS Sura',
    pensionFund: emp.pensionFund || 'Porvenir',
    arlRiskLevel: emp.arlRiskLevel || 'Nivel III (2.436% Agropecuario)',
    cajaCompensacion: emp.cajaCompensacion || 'Comfama',
    workerHealth,
    workerPension,
    employerHealth,
    employerPension,
    employerArl,
    employerCaja,
    employerSenaIcbf,
    totalWorkerDeduction,
    totalEmployerContribution,
    totalCombined,
  };
}

// Helper function to calculate seniority (antigüedad) for social benefits liquidations
export function calculateSeniority(startDateStr?: string): string {
  if (!startDateStr) return 'Sin fecha';
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return 'Fecha inválida';
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return 'Por iniciar';
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} d`;
  }

  const months = Math.floor(diffDays / 30);
  if (months < 12) {
    return `${months} m (${diffDays}d)`;
  }

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return `${years} a ${remMonths > 0 ? `${remMonths}m` : ''}`.trim();
}

export interface ContractLegalDetails {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  labelShort: string;
  hasSocialBenefits: boolean;
  hasAuxTransport: boolean;
  legalBasis: string;
  summary: string;
  obligations: string[];
}

export function getContractInfo(contractType: ContractType): ContractLegalDetails {
  switch (contractType) {
    case 'Término Indefinido':
      return {
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-950',
        badgeBorder: 'border-emerald-300',
        labelShort: 'Término Indefinido',
        hasSocialBenefits: true,
        hasAuxTransport: true,
        legalBasis: 'Art. 45 Código Sustantivo del Trabajo (CST)',
        summary: 'Vinculación laboral directa sin fecha de vencimiento. Otorga derecho pleno a todas las prestaciones sociales y estabilidad laboral.',
        obligations: [
          'Cesantías (8.33% / 1 mes por año)',
          'Intereses sobre Cesantías (12% anual sobre acumulado)',
          'Prima de Servicios (8.33% / 30 días pagaderos junio/diciembre)',
          'Vacaciones Remuneradas (15 días hábiles/año / 4.17%)',
          'Auxilio de Transporte (si devenga ≤ 2 SMLMV)',
          'Planilla PILA Completa (Salud, Pensión, ARL, Cajas)'
        ]
      };
    case 'Término Fijo':
      return {
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-950',
        badgeBorder: 'border-blue-300',
        labelShort: 'Término Fijo',
        hasSocialBenefits: true,
        hasAuxTransport: true,
        legalBasis: 'Art. 46 Código Sustantivo del Trabajo (CST)',
        summary: 'Contrato escrito con duración definida (máximo 3 años, renovable). Exige preaviso escrito de 30 días antes del vencimiento.',
        obligations: [
          'Prestaciones sociales proporcionales al tiempo laborado',
          'Preaviso obligatorio de no renovación con 30 días de antelación',
          'Indemnización en caso de terminación sin justa causa antes del vencimiento',
          'Planilla PILA completa (Salud, Pensión, ARL, Cajas)'
        ]
      };
    case 'Obra o Labor':
      return {
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-950',
        badgeBorder: 'border-purple-300',
        labelShort: 'Obra o Labor',
        hasSocialBenefits: true,
        hasAuxTransport: true,
        legalBasis: 'Art. 45 Código Sustantivo del Trabajo (CST)',
        summary: 'La duración está sujeta al tiempo que demande la ejecución de una obra o labor agrícola específica (ej. cosecha, siembra, cerca).',
        obligations: [
          'Prestaciones sociales completas de ley proporcionales a la duración de la obra',
          'Finalización automática al culminar la tarea u obra pactada',
          'Exige definición clara de la obra en el contrato',
          'Aportes completos a la Seguridad Social (PILA)'
        ]
      };
    case 'Prestación de Servicios':
      return {
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-950',
        badgeBorder: 'border-amber-300',
        labelShort: 'Prestación Servicios',
        hasSocialBenefits: false,
        hasAuxTransport: false,
        legalBasis: 'Derecho Civil / Comercial (Sin Subordinación Laboral)',
        summary: 'Vinculación de carácter civil por honorarios. El contratista opera con autonomía técnica y sin relación de subordinación.',
        obligations: [
          'NO genera prestaciones sociales de ley (Sin Cesantías, Primas, Vacaciones)',
          'NO genera Auxilio de Transporte ni recargos de jornada',
          'El contratista independiente paga su Planilla PILA para cobro de honorarios',
          'Sujeto a Retención en la Fuente según régimen tributario'
        ]
      };
    case 'Jornal Diario':
      return {
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-950',
        badgeBorder: 'border-yellow-300',
        labelShort: 'Jornal Diario / Ocasional',
        hasSocialBenefits: true,
        hasAuxTransport: true,
        legalBasis: 'Art. 6 CST & Decreto 2616 / Ley 1955 (Cotización por Días)',
        summary: 'Aplica a labores del campo o de corta duración (menos de 1 mes). Se liquida según los días trabajados.',
        obligations: [
          'Pago del jornal pactado diario o semanal',
          'Cotización a seguridad social por semanas/días trabajados (Decreto 2616)',
          'Liquidación proporcional de prestaciones sociales de ley'
        ]
      };
    case 'Destajo / Por Tarea':
      return {
        badgeBg: 'bg-teal-100',
        badgeText: 'text-teal-950',
        badgeBorder: 'border-teal-300',
        labelShort: 'Destajo / Por Tarea',
        hasSocialBenefits: true,
        hasAuxTransport: true,
        legalBasis: 'Art. 132 Código Sustantivo del Trabajo (CST)',
        summary: 'Remuneración calculada por cantidad de unidades producidas (kilos de café, cantinas de leche, metros de zanja).',
        obligations: [
          'Base prestacional calculada sobre el promedio de ingresos obtenidos',
          'Garantía de ingreso proporcional no inferior al Salario Mínimo Legal',
          'Inclusión de prestaciones de ley (Cesantías, Primas, Vacaciones, PILA)'
        ]
      };
    case 'Aprendizaje / Pasantía':
      return {
        badgeBg: 'bg-sky-100',
        badgeText: 'text-sky-950',
        badgeBorder: 'border-sky-300',
        labelShort: 'Aprendizaje SENA',
        hasSocialBenefits: false,
        hasAuxTransport: false,
        legalBasis: 'Ley 789 de 2002 (Estatuto de Aprendizaje SENA)',
        summary: 'Vinculación de formación práctica en la empresa agrícola. Se otorga un Apoyo de Sostenimiento no prestacional.',
        obligations: [
          'Afiliación obligatoria a EPS (Salud 100% empresa) y ARL',
          'Apoyo de Sostenimiento (no inferior al 75% o 100% SMLMV en etapa práctica)',
          'NO constituye contrato laboral ni otorga prestaciones sociales'
        ]
      };
    default:
      return {
        badgeBg: 'bg-stone-100',
        badgeText: 'text-stone-900',
        badgeBorder: 'border-stone-300',
        labelShort: 'Fijo Mensual',
        hasSocialBenefits: true,
        hasAuxTransport: true,
        legalBasis: 'Código Sustantivo del Trabajo (CST)',
        summary: 'Remuneración mensualizada estándar con cumplimiento de jornada y prestaciones sociales completas.',
        obligations: [
          'Pago de sueldo base acordado',
          'Prestaciones sociales completas de ley',
          'Aportes a la Seguridad Social (PILA)'
        ]
      };
  }
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  currentFarm,
  farms,
  employees,
  payrollRuns,
  payrollAdvances,
  financialTransactions,
  onAddEmployee,
  onUpdateEmployee,
  onAddPayrollRun,
  onUpdatePayrollRun,
  onAddPayrollAdvance,
  onAddFinancialTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'runs' | 'jornales' | 'employees' | 'advances' | 'pila' | 'reports'>('runs');
  const [selectedFarmFilter, setSelectedFarmFilter] = useState<string>(currentFarm.id || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [showCreateRunModal, setShowCreateRunModal] = useState(false);
  const [showAddAdvanceModal, setShowAddAdvanceModal] = useState(false);
  const [viewingPayslipRun, setViewingPayslipRun] = useState<{ run: PayrollRun; item: PayrollItem } | null>(null);

  // New Employee Form State
  const [empName, setEmpName] = useState('');
  const [empDoc, setEmpDoc] = useState('');
  const [empStartDate, setEmpStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [empRole, setEmpRole] = useState<WorkerRole>('Vaquero / Ordeñador');
  const [empContract, setEmpContract] = useState<ContractType>('Fijo Mensual');
  const [empBaseRate, setEmpBaseRate] = useState<number>(1650000);
  const [empDailyJornalRate, setEmpDailyJornalRate] = useState<number>(65000);
  const [empFrequency, setEmpFrequency] = useState<'Quincenal' | 'Mensual' | 'Semanal'>('Quincenal');
  const [empBank, setEmpBank] = useState('Bancolombia');
  const [empAccount, setEmpAccount] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empSocialSec, setEmpSocialSec] = useState('');
  const [empEpsName, setEmpEpsName] = useState('EPS Sura');
  const [empPensionFund, setEmpPensionFund] = useState('Porvenir');
  const [empArlLevel, setEmpArlLevel] = useState('Nivel III (2.436% Agropecuario)');
  const [empCaja, setEmpCaja] = useState('Comfama');
  const [empIbcSalary, setEmpIbcSalary] = useState<number>(1650000);
  const [empFarmId, setEmpFarmId] = useState(currentFarm.id);

  // PILA & PSE Payment State
  const [pilaOperator, setPilaOperator] = useState<'Aportes en Línea' | 'Mi Planilla' | 'SOI' | 'Asopagos' | 'Simple'>('Aportes en Línea');
  const [pilaMonth, setPilaMonth] = useState('2026-08');
  const [showPseModal, setShowPseModal] = useState(false);
  const [activePilaForPse, setActivePilaForPse] = useState<SocialSecurityPilaPlanilla | null>(null);
  const [pseBank, setPseBank] = useState('Bancolombia');
  const [psePersonType, setPsePersonType] = useState<'Natural' | 'Juridica'>('Natural');
  const [pseDocId, setPseDocId] = useState('1.094.882.110');
  const [pseEmail, setPseEmail] = useState('administracion@finca.com');

  // PILA List persistence
  const [pilasList, setPilasList] = useState<SocialSecurityPilaPlanilla[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_pila_planillas');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading PILA planillas:', e);
    }
    return [
      {
        id: 'pila-init-01',
        farmId: currentFarm.id || 'farm-1',
        farmName: currentFarm.name || 'Finca La Esperanza',
        period: '2026-08',
        operatorName: 'Aportes en Línea',
        pilaPin: '8839201492',
        generationDate: '2026-08-05',
        totalEmployees: 3,
        totalIbc: 5850000,
        totalHealth: 731250,
        totalPension: 936000,
        totalArl: 142506,
        totalCaja: 234000,
        totalEmployerContributions: 1572506,
        totalWorkerDeductions: 468000,
        grandTotalPila: 2040506,
        status: 'Generada PILA',
        items: [
          {
            employeeName: 'Jairo Antonio Benítez',
            documentId: '1.094.882.110',
            epsName: 'EPS Sura',
            pensionFund: 'Porvenir',
            arlRiskLevel: 'Nivel III (2.436% Agropecuario)',
            cajaCompensacion: 'Comfama',
            ibc: 2400000,
            healthWorker: 96000,
            healthEmployer: 204000,
            pensionWorker: 96000,
            pensionEmployer: 288000,
            arlEmployer: 58464,
            cajaEmployer: 96000,
            totalItem: 838464,
          },
          {
            employeeName: 'Carlos Mario Ospina',
            documentId: '88.291.022',
            epsName: 'Nueva EPS',
            pensionFund: 'Protección',
            arlRiskLevel: 'Nivel III (2.436% Agropecuario)',
            cajaCompensacion: 'Comfama',
            ibc: 1650000,
            healthWorker: 66000,
            healthEmployer: 140250,
            pensionWorker: 66000,
            pensionEmployer: 198000,
            arlEmployer: 40194,
            cajaEmployer: 66000,
            totalItem: 576444,
          },
          {
            employeeName: 'David Esteban Morales',
            documentId: '1.019.283.491',
            epsName: 'Sanitas EPS',
            pensionFund: 'Colpensiones',
            arlRiskLevel: 'Nivel IV (4.350% Maquinaria)',
            cajaCompensacion: 'Comfama',
            ibc: 1800000,
            healthWorker: 72000,
            healthEmployer: 153000,
            pensionWorker: 72000,
            pensionEmployer: 216000,
            arlEmployer: 78300,
            cajaEmployer: 72000,
            totalItem: 635300,
          },
        ],
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_pila_planillas', JSON.stringify(pilasList));
    } catch (e) {
      console.warn('Error saving PILAs:', e);
    }
  }, [pilasList]);

  // Modal States for Draft PILA, Templates, and Bank Disbursement Gateway
  const [showPayrollTemplatesModal, setShowPayrollTemplatesModal] = useState(false);
  const [showEditPilaDraftModal, setShowEditPilaDraftModal] = useState(false);
  const [activePilaDraft, setActivePilaDraft] = useState<SocialSecurityPilaPlanilla | null>(null);

  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [activeRunForDisbursement, setActiveRunForDisbursement] = useState<PayrollRun | null>(null);

  // Helper to create a draft PILA based on previous PILA or active farm employees
  const createDraftPilaForFarm = (farmObj: FarmDataPackage, targetPeriod: string) => {
    const farmId = farmObj.profile?.id || (farmObj as any).id || 'farm-1';
    const farmName = farmObj.profile?.name || (farmObj as any).name || 'Finca Ganadera';

    const previousPila = pilasList.find((p) => p.farmId === farmId) || pilasList[0];
    const activeEmps = employees.filter((e) => e.farmId === farmId && e.status === 'Activo');

    let items: SocialSecurityPilaPlanilla['items'] = [];

    if (previousPila && previousPila.items && previousPila.items.length > 0) {
      items = previousPila.items.map((item) => ({
        ...item,
        daysWorked: 30,
        novedad: {
          code: 'NINGUNA' as PilaNovedadCode,
          days: 0,
          notes: '',
        },
      }));
    } else if (activeEmps.length > 0) {
      items = activeEmps.map((emp) => {
        const ss = calculateSocialSecurity(emp, emp.baseRate);
        return {
          employeeName: emp.fullName,
          documentId: emp.documentId,
          epsName: ss.epsName,
          pensionFund: ss.pensionFund,
          arlRiskLevel: ss.arlRiskLevel,
          cajaCompensacion: ss.cajaCompensacion,
          ibc: ss.ibc,
          daysWorked: 30,
          healthWorker: ss.workerHealth,
          healthEmployer: ss.employerHealth,
          pensionWorker: ss.workerPension,
          pensionEmployer: ss.employerPension,
          arlEmployer: ss.employerArl,
          cajaEmployer: ss.employerCaja,
          totalItem: ss.totalCombined,
          novedad: {
            code: 'NINGUNA' as PilaNovedadCode,
            days: 0,
            notes: '',
          },
        };
      });
    } else {
      return null;
    }

    let totalIbc = 0;
    let totalHealth = 0;
    let totalPension = 0;
    let totalArl = 0;
    let totalCaja = 0;
    let totalEmployerContrib = 0;
    let totalWorkerDeduc = 0;

    items.forEach((item) => {
      totalIbc += item.ibc;
      totalHealth += item.healthWorker + item.healthEmployer;
      totalPension += item.pensionWorker + item.pensionEmployer;
      totalArl += item.arlEmployer;
      totalCaja += item.cajaEmployer;
      totalEmployerContrib += item.healthEmployer + item.pensionEmployer + item.arlEmployer + item.cajaEmployer;
      totalWorkerDeduc += item.healthWorker + item.pensionWorker;
    });

    const draft: SocialSecurityPilaPlanilla = {
      id: `pila-draft-${Date.now()}`,
      farmId,
      farmName,
      period: targetPeriod,
      operatorName: 'Aportes en Línea',
      pilaPin: 'BORRADOR-DRAFT',
      generationDate: new Date().toISOString().split('T')[0],
      totalEmployees: items.length,
      totalIbc,
      totalHealth,
      totalPension,
      totalArl,
      totalCaja,
      totalEmployerContributions: totalEmployerContrib,
      totalWorkerDeductions: totalWorkerDeduc,
      grandTotalPila: totalEmployerContrib + totalWorkerDeduc,
      status: 'Borrador',
      isAutoGeneratedDraft: true,
      draftBasePeriod: previousPila ? previousPila.period : 'Directorio Activo',
      items,
    };

    return draft;
  };

  // Auto-check if today is within last 5 days of month and create PILA draft if missing
  useEffect(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const isLast5Days = (daysInMonth - currentDay) < 5;

    const currentPeriodStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (isLast5Days) {
      const currentFarmId = currentFarm.profile?.id || (currentFarm as any).id;
      const targetFarm = farms.find((f) => (f.profile?.id || (f as any).id) === (selectedFarmFilter === 'all' ? currentFarmId : selectedFarmFilter)) || currentFarm;
      const targetFarmId = targetFarm.profile?.id || (targetFarm as any).id;

      const existsForPeriod = pilasList.some((p) => p.period === currentPeriodStr && p.farmId === targetFarmId);

      if (!existsForPeriod) {
        const draft = createDraftPilaForFarm(targetFarm, currentPeriodStr);
        if (draft) {
          setPilasList((prev) => [draft, ...prev]);
        }
      }
    }
  }, [selectedFarmFilter, currentFarm, pilasList.length]);

  // Quick Jornales Calculator & Logger State
  const [jornalWorkerId, setJornalWorkerId] = useState<string>('new');
  const [jornalWorkerName, setJornalWorkerName] = useState('');
  const [jornalRate, setJornalRate] = useState<number>(65000);
  const [jornalCount, setJornalCount] = useState<number>(1);
  const [jornalTask, setJornalTask] = useState('Guadañado & Deshierbe de Potreros');
  const [jornalBonus, setJornalBonus] = useState<number>(0);
  const [jornalDeduction, setJornalDeduction] = useState<number>(0);
  const [jornalDate, setJornalDate] = useState(new Date().toISOString().split('T')[0]);
  const [jornalNotes, setJornalNotes] = useState('');

  // New Payroll Run Form State
  const [runPeriodName, setRunPeriodName] = useState('');
  const [runPeriodType, setRunPeriodType] = useState<'Quincenal' | 'Mensual' | 'Semanal' | 'Jornales / Ocasional'>('Quincenal');
  const [runStartDate, setRunStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [runEndDate, setRunEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [runPaymentDate, setRunPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [runBusinessUnit, setRunBusinessUnit] = useState<BusinessUnitId>('corporativo_general');
  const [runItems, setRunItems] = useState<PayrollItem[]>([]);

  // New Advance Form State
  const [advEmpId, setAdvEmpId] = useState('');
  const [advAmount, setAdvAmount] = useState<number>(100000);
  const [advReason, setAdvReason] = useState('Anticipo de sueldo');
  const [advDate, setAdvDate] = useState(new Date().toISOString().split('T')[0]);

  // Filtered lists
  const farmEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchFarm = selectedFarmFilter === 'all' || e.farmId === selectedFarmFilter;
      const matchSearch =
        e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.documentId.includes(searchTerm) ||
        e.role.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFarm && matchSearch;
    });
  }, [employees, selectedFarmFilter, searchTerm]);

  const farmPayrollRuns = useMemo(() => {
    return payrollRuns.filter((r) => selectedFarmFilter === 'all' || r.farmId === selectedFarmFilter);
  }, [payrollRuns, selectedFarmFilter]);

  const farmAdvances = useMemo(() => {
    return payrollAdvances.filter((a) => selectedFarmFilter === 'all' || a.farmId === selectedFarmFilter);
  }, [payrollAdvances, selectedFarmFilter]);

  // Key KPI Metrics
  const totalActiveEmployees = farmEmployees.filter((e) => e.status === 'Activo').length;
  const totalMonthlyPayrollEst = farmEmployees
    .filter((e) => e.status === 'Activo')
    .reduce((sum, e) => sum + (e.contractType === 'Jornal Diario' ? e.baseRate * 20 : e.baseRate), 0);

  const totalPendingAdvances = farmAdvances
    .filter((a) => a.status === 'Pendiente')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalPaidPayrollThisMonth = farmPayrollRuns
    .filter((r) => r.status === 'Pagada')
    .reduce((sum, r) => sum + r.totalNetPayable, 0);

  // Auto-fill Payroll Run items from selected farm's active employees
  const handleInitializeRunItems = (targetFarmId: string) => {
    const active = employees.filter((e) => e.farmId === targetFarmId && e.status === 'Activo');
    const items: PayrollItem[] = active.map((emp) => {
      const defaultDays = runPeriodType === 'Quincenal' ? 15 : runPeriodType === 'Mensual' ? 30 : 7;
      const basePay = emp.contractType === 'Jornal Diario' ? emp.baseRate * defaultDays : emp.baseRate / (runPeriodType === 'Quincenal' ? 2 : 1);
      
      // Check pending advances for this employee
      const empAdvances = payrollAdvances
        .filter((a) => a.employeeId === emp.id && a.status === 'Pendiente')
        .reduce((sum, a) => sum + a.amount, 0);

      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        role: emp.role,
        daysWorked: defaultDays,
        basePay: Math.round(basePay),
        overtimeHours: 0,
        overtimePay: 0,
        bonuses: 0,
        deductions: empAdvances,
        netPayable: Math.round(basePay - empAdvances),
        notes: empAdvances > 0 ? `Descuento automático de anticipos ($${empAdvances.toLocaleString('es-CO')})` : '',
      };
    });
    setRunItems(items);
  };

  // Recalculate item net payable when changing inputs in table
  const handleUpdateRunItem = (
    empId: string,
    field: 'daysWorked' | 'basePay' | 'overtimePay' | 'bonuses' | 'deductions' | 'notes',
    value: number | string,
  ) => {
    setRunItems((prev) =>
      prev.map((item) => {
        if (item.employeeId !== empId) return item;
        const updated = { ...item, [field]: value };
        const base = typeof updated.basePay === 'number' ? updated.basePay : Number(updated.basePay) || 0;
        const overtime = typeof updated.overtimePay === 'number' ? updated.overtimePay : Number(updated.overtimePay) || 0;
        const bonus = typeof updated.bonuses === 'number' ? updated.bonuses : Number(updated.bonuses) || 0;
        const ded = typeof updated.deductions === 'number' ? updated.deductions : Number(updated.deductions) || 0;
        updated.netPayable = Math.max(0, base + overtime + bonus - ded);
        return updated;
      }),
    );
  };

  // Submit New Employee
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empDoc) return;

    const farmObj = farms.find((f) => f.id === empFarmId) || currentFarm;

    if (editingEmployee) {
      const updated: Employee = {
        ...editingEmployee,
        farmId: empFarmId,
        farmName: farmObj.name,
        documentId: empDoc,
        fullName: empName,
        role: empRole,
        contractType: empContract,
        baseRate: Number(empBaseRate),
        dailyJornalRate: Number(empDailyJornalRate),
        paymentFrequency: empFrequency,
        bankName: empBank,
        bankAccount: empAccount,
        phone: empPhone,
        startDate: empStartDate || new Date().toISOString().split('T')[0],
        socialSecurityNotes: empSocialSec,
        epsName: empEpsName,
        pensionFund: empPensionFund,
        arlRiskLevel: empArlLevel,
        cajaCompensacion: empCaja,
        ibcSalary: Number(empIbcSalary),
      };
      onUpdateEmployee(updated);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now().toString().slice(-4)}`,
        farmId: empFarmId,
        farmName: farmObj.name,
        documentId: empDoc,
        fullName: empName,
        role: empRole,
        contractType: empContract,
        baseRate: Number(empBaseRate),
        dailyJornalRate: Number(empDailyJornalRate),
        paymentFrequency: empFrequency,
        bankName: empBank,
        bankAccount: empAccount,
        phone: empPhone,
        startDate: empStartDate || new Date().toISOString().split('T')[0],
        status: 'Activo',
        socialSecurityNotes: empSocialSec,
        epsName: empEpsName,
        pensionFund: empPensionFund,
        arlRiskLevel: empArlLevel,
        cajaCompensacion: empCaja,
        ibcSalary: Number(empIbcSalary),
      };
      onAddEmployee(newEmp);
    }

    setShowAddEmployeeModal(false);
    setEditingEmployee(null);
    resetEmpForm();
  };

  const resetEmpForm = () => {
    setEmpName('');
    setEmpDoc('');
    setEmpStartDate(new Date().toISOString().split('T')[0]);
    setEmpRole('Vaquero / Ordeñador');
    setEmpContract('Fijo Mensual');
    setEmpBaseRate(1650000);
    setEmpDailyJornalRate(65000);
    setEmpFrequency('Quincenal');
    setEmpBank('Bancolombia');
    setEmpAccount('');
    setEmpPhone('');
    setEmpSocialSec('');
    setEmpEpsName('EPS Sura');
    setEmpPensionFund('Porvenir');
    setEmpArlLevel('Nivel III (2.436% Agropecuario)');
    setEmpCaja('Comfama');
    setEmpIbcSalary(1650000);
  };

  const startEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpFarmId(emp.farmId);
    setEmpName(emp.fullName);
    setEmpDoc(emp.documentId);
    setEmpStartDate(emp.startDate || new Date().toISOString().split('T')[0]);
    setEmpRole(emp.role);
    setEmpContract(emp.contractType);
    setEmpBaseRate(emp.baseRate);
    setEmpDailyJornalRate(emp.dailyJornalRate || 65000);
    setEmpFrequency(emp.paymentFrequency);
    setEmpBank(emp.bankName);
    setEmpAccount(emp.bankAccount || '');
    setEmpPhone(emp.phone || '');
    setEmpSocialSec(emp.socialSecurityNotes || '');
    setEmpEpsName(emp.epsName || 'EPS Sura');
    setEmpPensionFund(emp.pensionFund || 'Porvenir');
    setEmpArlLevel(emp.arlRiskLevel || 'Nivel III (2.436% Agropecuario)');
    setEmpCaja(emp.cajaCompensacion || 'Comfama');
    setEmpIbcSalary(emp.ibcSalary || emp.baseRate || 1650000);
    setShowAddEmployeeModal(true);
  };

  // Submit Quick Jornal Payroll & Expense
  const handleQuickPayJornal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jornalRate || !jornalCount) return;

    const selectedEmp = employees.find((emp) => emp.id === jornalWorkerId);
    const workerName =
      jornalWorkerId === 'new'
        ? jornalWorkerName || 'Jornalero Ocasional'
        : selectedEmp?.fullName || 'Jornalero';

    const totalBase = Math.round(Number(jornalRate) * Number(jornalCount));
    const netPayable = Math.max(0, totalBase + Number(jornalBonus) - Number(jornalDeduction));

    const runId = `prun-jornal-${Date.now().toString().slice(-6)}`;
    const txId = `tx-payroll-jornal-${Date.now().toString().slice(-6)}`;

    const targetFarm =
      farms.find((f) => f.id === (selectedFarmFilter === 'all' ? currentFarm.id : selectedFarmFilter)) ||
      currentFarm;

    // 1. Create Financial Egreso
    const finTx: FinancialTransaction = {
      id: txId,
      farmId: targetFarm.id,
      farmName: targetFarm.name,
      type: 'egreso',
      category: 'mano_obra_directa',
      amount: netPayable,
      date: jornalDate,
      description: `Pago de Jornal (${jornalCount} días @ $${Number(jornalRate).toLocaleString('es-CO')}/día): ${workerName} - Labor: ${jornalTask}`,
      businessUnit: 'corporativo_general',
      costType: 'directo',
    };

    onAddFinancialTransaction(finTx);

    // 2. Create Payroll Run
    const newRun: PayrollRun = {
      id: runId,
      farmId: targetFarm.id,
      farmName: targetFarm.name,
      periodName: `Jornales: ${workerName} (${jornalCount} Jornal${jornalCount > 1 ? 'es' : ''}) - ${jornalTask}`,
      periodType: 'Jornales / Ocasional',
      startDate: jornalDate,
      endDate: jornalDate,
      paymentDate: jornalDate,
      status: 'Pagada',
      businessUnit: 'corporativo_general',
      financialTransactionId: txId,
      createdAt: jornalDate,
      items: [
        {
          employeeId: jornalWorkerId === 'new' ? `temp-${Date.now()}` : jornalWorkerId,
          employeeName: workerName,
          role: selectedEmp?.role || 'Jornalero / Temporal',
          daysWorked: Number(jornalCount),
          dailyJornalRate: Number(jornalRate),
          jornalesCount: Number(jornalCount),
          jornalTaskType: jornalTask,
          basePay: totalBase,
          overtimePay: 0,
          bonuses: Number(jornalBonus),
          deductions: Number(jornalDeduction),
          netPayable: netPayable,
          notes: `Labor: ${jornalTask}. ${jornalNotes}`.trim(),
        },
      ],
      totalBase: totalBase,
      totalOvertime: 0,
      totalBonuses: Number(jornalBonus),
      totalDeductions: Number(jornalDeduction),
      totalNetPayable: netPayable,
    };

    onAddPayrollRun(newRun);

    // Reset Jornal Form
    setJornalWorkerName('');
    setJornalCount(1);
    setJornalBonus(0);
    setJornalDeduction(0);
    setJornalNotes('');
    alert(`✅ Jornal de ${workerName} (${netPayable.toLocaleString('es-CO')}) liquidado y registrado exitosamente en Finanzas.`);
  };

  // Generate PILA Planilla
  const handleGeneratePila = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFarm =
      farms.find((f) => f.id === (selectedFarmFilter === 'all' ? currentFarm.id : selectedFarmFilter)) ||
      currentFarm;
    const activeEmps = employees.filter((e) => e.farmId === targetFarm.id && e.status === 'Activo');

    if (activeEmps.length === 0) {
      alert('⚠️ No hay trabajadores activos registrados en esta finca para generar la planilla PILA.');
      return;
    }

    let totalIbc = 0;
    let totalHealth = 0;
    let totalPension = 0;
    let totalArl = 0;
    let totalCaja = 0;
    let totalEmployerContrib = 0;
    let totalWorkerDeduc = 0;

    const items = activeEmps.map((emp) => {
      const ss = calculateSocialSecurity(emp, emp.baseRate);
      totalIbc += ss.ibc;
      totalHealth += ss.workerHealth + ss.employerHealth;
      totalPension += ss.workerPension + ss.employerPension;
      totalArl += ss.employerArl;
      totalCaja += ss.employerCaja;
      totalEmployerContrib += ss.totalEmployerContribution;
      totalWorkerDeduc += ss.totalWorkerDeduction;

      return {
        employeeName: emp.fullName,
        documentId: emp.documentId,
        epsName: ss.epsName,
        pensionFund: ss.pensionFund,
        arlRiskLevel: ss.arlRiskLevel,
        cajaCompensacion: ss.cajaCompensacion,
        ibc: ss.ibc,
        healthWorker: ss.workerHealth,
        healthEmployer: ss.employerHealth,
        pensionWorker: ss.workerPension,
        pensionEmployer: ss.employerPension,
        arlEmployer: ss.employerArl,
        cajaEmployer: ss.employerCaja,
        totalItem: ss.totalCombined,
      };
    });

    const pin = `8839${Math.floor(100000 + Math.random() * 900000)}`;

    const newPila: SocialSecurityPilaPlanilla = {
      id: `pila-${Date.now()}`,
      farmId: targetFarm.id,
      farmName: targetFarm.name,
      period: pilaMonth,
      operatorName: pilaOperator,
      pilaPin: pin,
      generationDate: new Date().toISOString().split('T')[0],
      totalEmployees: activeEmps.length,
      totalIbc,
      totalHealth,
      totalPension,
      totalArl,
      totalCaja,
      totalEmployerContributions: totalEmployerContrib,
      totalWorkerDeductions: totalWorkerDeduc,
      grandTotalPila: totalEmployerContrib + totalWorkerDeduc,
      status: 'Generada PILA',
      items,
    };

    setPilasList((prev) => [newPila, ...prev]);
    alert(`✅ Planilla PILA para ${targetFarm.name} (${pilaMonth}) generada exitosamente con PIN ${pin}.\nPuede realizar el pago directo vía PSE ahora.`);
  };

  // Submit PSE Payment
  const handleConfirmPsePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePilaForPse) return;

    const cusRef = `CUS-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;
    const txId = `tx-pila-pse-${Date.now().toString().slice(-6)}`;

    // Create Egreso in Finanzas
    const finTx: FinancialTransaction = {
      id: txId,
      farmId: activePilaForPse.farmId,
      farmName: activePilaForPse.farmName,
      type: 'egreso',
      category: 'nomina_fija',
      amount: activePilaForPse.grandTotalPila,
      date: new Date().toISOString().split('T')[0],
      description: `Pago Planilla PILA Seguridad Social (${activePilaForPse.period}) - PIN ${activePilaForPse.pilaPin} por ${pseBank} PSE Ref: ${cusRef} (${activePilaForPse.totalEmployees} Empleados)`,
      businessUnit: 'corporativo_general',
      costType: 'directo',
    };

    onAddFinancialTransaction(finTx);

    // Update PILA state
    setPilasList((prev) =>
      prev.map((p) =>
        p.id === activePilaForPse.id
          ? {
              ...p,
              status: 'Pagada PSE',
              paymentDate: new Date().toISOString().split('T')[0],
              pseReference: cusRef,
              financialTransactionId: txId,
            }
          : p,
      ),
    );

    setShowPseModal(false);
    setActivePilaForPse(null);
    alert(`🎉 ¡PAGO PSE APROBADO EXITOSAMENTE!\n\nPlanilla PILA PIN: ${activePilaForPse.pilaPin}\nMonto Pagado: ${activePilaForPse.grandTotalPila.toLocaleString('es-CO')}\nBanco: ${pseBank}\nComprobante CUS PSE: ${cusRef}\n\nEl comprobante ha quedado registrado en Finanzas.`);
  };

  // Submit Create Payroll Run
  const handleCreateRunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!runPeriodName || runItems.length === 0) return;

    const farmObj = farms.find((f) => f.id === empFarmId) || currentFarm;

    const totalBase = runItems.reduce((acc, i) => acc + (i.basePay || 0), 0);
    const totalOvertime = runItems.reduce((acc, i) => acc + (i.overtimePay || 0), 0);
    const totalBonuses = runItems.reduce((acc, i) => acc + (i.bonuses || 0), 0);
    const totalDeductions = runItems.reduce((acc, i) => acc + (i.deductions || 0), 0);
    const totalNetPayable = runItems.reduce((acc, i) => acc + (i.netPayable || 0), 0);

    const newRun: PayrollRun = {
      id: `prun-${Date.now().toString().slice(-6)}`,
      farmId: empFarmId,
      farmName: farmObj.name,
      periodName: runPeriodName,
      periodType: runPeriodType,
      startDate: runStartDate,
      endDate: runEndDate,
      paymentDate: runPaymentDate,
      status: 'Borrador',
      businessUnit: runBusinessUnit,
      items: runItems,
      totalBase,
      totalOvertime,
      totalBonuses,
      totalDeductions,
      totalNetPayable,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddPayrollRun(newRun);
    setShowCreateRunModal(false);
    setRunPeriodName('');
  };

  // Approve & Pay Payroll Run -> Automatically Register Expense in Finances!
  const handleApproveAndPayRun = (run: PayrollRun) => {
    if (run.status === 'Pagada') return;

    const txId = `tx-payroll-${Date.now().toString().slice(-6)}`;

    // 1. Create Financial Transaction
    const finTx: FinancialTransaction = {
      id: txId,
      farmId: run.farmId,
      farmName: run.farmName,
      type: 'egreso',
      category: 'mano_obra_directa',
      amount: run.totalNetPayable,
      date: new Date().toISOString().split('T')[0],
      description: `Pago de Nómina: ${run.periodName} (${run.items.length} Empleados)`,
      businessUnit: run.businessUnit || 'corporativo_general',
      costType: 'fijo',
    };

    onAddFinancialTransaction(finTx);

    // 2. Update Run status to Pagada and link financialTransactionId
    const updatedRun: PayrollRun = {
      ...run,
      status: 'Pagada',
      financialTransactionId: txId,
    };

    onUpdatePayrollRun(updatedRun);

    // 3. Mark any deducted advances as 'Descontado'
    run.items.forEach((item) => {
      if (item.deductions > 0) {
        // Find matching pending advance and mark descontado
        const matchingAdv = payrollAdvances.find(
          (a) => a.employeeId === item.employeeId && a.status === 'Pendiente',
        );
        if (matchingAdv) {
          matchingAdv.status = 'Descontado';
          matchingAdv.payrollRunId = run.id;
        }
      }
    });
  };

  // Submit Advance
  const handleCreateAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advEmpId || !advAmount) return;

    const emp = employees.find((e) => e.id === advEmpId);
    if (!emp) return;

    const newAdv: PayrollAdvance = {
      id: `adv-${Date.now().toString().slice(-4)}`,
      farmId: emp.farmId,
      farmName: emp.farmName,
      employeeId: emp.id,
      employeeName: emp.fullName,
      date: advDate,
      amount: Number(advAmount),
      reason: advReason,
      status: 'Pendiente',
    };

    onAddPayrollAdvance(newAdv);
    setShowAddAdvanceModal(false);
    setAdvAmount(100000);
    setAdvReason('Anticipo de sueldo');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. HEADER & FARM SELECTION & KPI CARDS */}
      {/* ========================================================================= */}
      <div className="bg-[#0D1A13] text-white p-5 sm:p-6 rounded-3xl shadow-xl border-2 border-[#1b4332] relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-[#c1ecd4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#D4A94E] text-white font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-amber-300 shadow-sm flex items-center gap-1">
                <Receipt className="w-3 h-3" /> MÓDULO DE NÓMINA ENLAZADO A FINANZAS
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                Gestión de Personal & Nómina de Campo
              </h1>
              <div className="group relative inline-flex items-center">
                <button
                  type="button"
                  className="text-[#a3b8ad] hover:text-[#A5B8AC] transition-colors p-0.5 rounded cursor-pointer"
                  title="Control total de liquidaciones, vales, horas extras y aportes de trabajadores de finca. Cada nómina pagada se contabiliza automáticamente en los egresos de Finanzas."
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-72 bg-[#0D1A13] text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl border border-[#2d6a4f] pointer-events-none animate-in fade-in zoom-in-95">
                  Control total de liquidaciones, vales, horas extras y aportes de trabajadores de finca. Cada nómina pagada se contabiliza automáticamente en los egresos de Finanzas.
                </div>
              </div>
            </div>
          </div>

          {/* Farm Switcher Filter */}
          <div className="flex items-center gap-3 bg-[#002216]/80 p-2 rounded-2xl border border-[#1b4332] shrink-0">
            <Building className="w-4 h-4 text-[#ffba38]" />
            <select
              value={selectedFarmFilter}
              onChange={(e) => setSelectedFarmFilter(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-2"
            >
              <option key="all" value="all" className="bg-[#0D1A13] text-white">
                🌐 Todas las Fincas ({farms.length})
              </option>
              {farms.map((f, idx) => (
                <option key={f.id || `farm-${idx}`} value={f.id} className="bg-[#0D1A13] text-white">
                  📍 {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15">
            <div className="flex items-center justify-between text-[#A5B8AC]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Personal Activo</span>
              <Users className="w-4 h-4 text-[#ffba38]" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{totalActiveEmployees}</p>
            <p className="text-[10px] text-[#A5B8AC]/70 mt-0.5">Trabajadores registrados</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15">
            <div className="flex items-center justify-between text-[#A5B8AC]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Presupuesto Mes</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              ${totalMonthlyPayrollEst.toLocaleString('es-CO')}
            </p>
            <p className="text-[10px] text-[#A5B8AC]/70 mt-0.5">Estimado nómina activa</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15">
            <div className="flex items-center justify-between text-[#A5B8AC]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pagado en Finanzas</span>
              <TrendingUp className="w-4 h-4 text-cyan-300" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
              ${totalPaidPayrollThisMonth.toLocaleString('es-CO')}
            </p>
            <p className="text-[10px] text-[#A5B8AC]/70 mt-0.5">Liquidaciones ejecutadas</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15">
            <div className="flex items-center justify-between text-[#A5B8AC]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Anticipos Pendientes</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              ${totalPendingAdvances.toLocaleString('es-CO')}
            </p>
            <p className="text-[10px] text-[#A5B8AC]/70 mt-0.5">Vales por descontar</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NAVIGATION SUBTABS & ACTIONS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b-2 border-white/10 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('runs')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'runs'
                ? 'bg-[#0D1A13] text-white shadow-md'
                : 'bg-[#15241C] text-[#717973] hover:bg-[#1F3327] border border-white/10'
            }`}
          >
            <Receipt className="w-4 h-4 text-[#ffba38]" />
            Liquidaciones de Nómina ({farmPayrollRuns.length})
          </button>

          <button
            onClick={() => setActiveTab('jornales')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'jornales'
                ? 'bg-[#0D1A13] text-white shadow-md'
                : 'bg-[#15241C] text-[#717973] hover:bg-[#1F3327] border border-white/10'
            }`}
          >
            <Clock className="w-4 h-4 text-[#ffba38]" />
            Nómina por Jornales
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'employees'
                ? 'bg-[#0D1A13] text-white shadow-md'
                : 'bg-[#15241C] text-[#717973] hover:bg-[#1F3327] border border-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-[#ffba38]" />
            Directorio de Personal ({farmEmployees.length})
          </button>

          <button
            onClick={() => setActiveTab('advances')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'advances'
                ? 'bg-[#0D1A13] text-white shadow-md'
                : 'bg-[#15241C] text-[#717973] hover:bg-[#1F3327] border border-white/10'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#ffba38]" />
            Anticipos & Vales ({farmAdvances.length})
          </button>

          <button
            onClick={() => setActiveTab('pila')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pila'
                ? 'bg-[#0D1A13] text-white shadow-md'
                : 'bg-[#15241C] text-[#717973] hover:bg-[#1F3327] border border-white/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#ffba38]" />
            Seguridad Social & Planilla PILA (PSE)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'runs' && (
            <>
              <button
                onClick={() => setShowPayrollTemplatesModal(true)}
                className="bg-[#D4A94E] hover:bg-[#ffa000] text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 border border-[#012d1d]/20 cursor-pointer"
                title="Generar liquidación especial con plantillas para Vacaciones, Bonificaciones y Cesantías"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>📋 Plantillas (Vacaciones / Bonificaciones / Cesantías)</span>
              </button>
              <button
                onClick={() => {
                  setEmpFarmId(selectedFarmFilter === 'all' ? currentFarm.id : selectedFarmFilter);
                  handleInitializeRunItems(selectedFarmFilter === 'all' ? currentFarm.id : selectedFarmFilter);
                  setRunPeriodName(`Nómina Quincenal - ${new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}`);
                  setShowCreateRunModal(true);
                }}
                className="bg-[#0D1A13] hover:bg-[#002216] text-[#A5B8AC] font-black text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 border border-[#c1ecd4]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#ffba38]" />
                Nueva Liquidación
              </button>
            </>
          )}

          {activeTab === 'employees' && (
            <button
              onClick={() => {
                setEditingEmployee(null);
                resetEmpForm();
                setEmpFarmId(selectedFarmFilter === 'all' ? currentFarm.id : selectedFarmFilter);
                setShowAddEmployeeModal(true);
              }}
              className="bg-[#0D1A13] hover:bg-[#002216] text-[#A5B8AC] font-black text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 border border-[#c1ecd4]/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#ffba38]" />
              Registrar Trabajador
            </button>
          )}

          {activeTab === 'advances' && (
            <button
              onClick={() => {
                if (farmEmployees.length > 0) {
                  setAdvEmpId(farmEmployees[0].id);
                }
                setShowAddAdvanceModal(true);
              }}
              className="bg-[#0D1A13] hover:bg-[#002216] text-[#A5B8AC] font-black text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 border border-[#c1ecd4]/20 cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-[#ffba38]" />
              Registrar Anticipo / Vale
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIQUIDACIONES DE NÓMINA */}
      {/* ========================================================================= */}
      {activeTab === 'runs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {farmPayrollRuns.length === 0 ? (
              <div className="bg-[#15241C] p-8 rounded-3xl border-2 border-dashed border-white/10 text-center space-y-3">
                <Receipt className="w-12 h-12 text-[#717973] mx-auto opacity-50" />
                <h3 className="font-black text-lg text-white">No hay liquidaciones registradas</h3>
                <p className="text-xs text-[#717973] max-w-md mx-auto">
                  Comienza creando una nueva planilla de liquidación para tus empleados. Al marcar la nómina como pagada, se registrará el egreso automáticamente en Finanzas.
                </p>
                <button
                  onClick={() => {
                    handleInitializeRunItems(currentFarm.id);
                    setRunPeriodName(`Nómina Quincenal - ${new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}`);
                    setShowCreateRunModal(true);
                  }}
                  className="bg-[#0D1A13] text-white font-bold text-xs px-5 py-2.5 rounded-2xl inline-flex items-center gap-2 shadow-md hover:bg-[#002216] cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#ffba38]" /> Crear Primera Liquidación
                </button>
              </div>
            ) : (
              farmPayrollRuns.map((run, runIdx) => (
                <div
                  key={run.id || `run-${runIdx}`}
                  className="bg-[#15241C] rounded-3xl border-2 border-white/10 p-5 shadow-md hover:shadow-lg transition-all space-y-4"
                >
                  {/* Run Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#eeeeee] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#0D1A13] text-[#ffba38] rounded-2xl shadow-sm">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-base text-white">{run.periodName}</h3>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              run.status === 'Pagada'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : run.status === 'Aprobada'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {run.status === 'Pagada' ? '✅ PAGADA EN FINANZAS' : run.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#717973] flex items-center gap-2 mt-0.5">
                          <span>📍 {run.farmName}</span> • <span>Periodo: {run.startDate} al {run.endDate}</span> •{' '}
                          <span>Pago: {run.paymentDate}</span>
                        </p>
                      </div>
                    </div>

                    {/* Total Net & Action */}
                    <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[#717973] uppercase block">Total a Pagar</span>
                        <span className="text-xl font-black text-white">
                          ${run.totalNetPayable.toLocaleString('es-CO')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {run.status !== 'Pagada' && (
                          <button
                            onClick={() => handleApproveAndPayRun(run)}
                            className="bg-[#0D1A13] hover:bg-[#02402a] text-white font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                            Marcar Pagada
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveRunForDisbursement(run);
                            setShowDisbursementModal(true);
                          }}
                          className={`font-black text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border ${
                            run.disbursementStatus === 'Dispersada ACH'
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-400 hover:bg-emerald-200'
                              : 'bg-[#D4A94E] hover:bg-[#ffa000] text-white border-amber-400'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-white" />
                          {run.disbursementStatus === 'Dispersada ACH' ? (
                            <span>✔️ Dispersada ACH ({run.disbursementBatchCode})</span>
                          ) : (
                            <span>💳 Dispersar Nómina vía Pasarela ACH</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Run Detail Table */}
                  <div className="overflow-x-auto rounded-2xl border border-[#eeeeee]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8f9f8] text-white font-black uppercase text-[10px] border-b border-[#eeeeee]">
                        <tr>
                          <th className="p-3">Trabajador / Cargo</th>
                          <th className="p-3 text-center">Días</th>
                          <th className="p-3 text-right">Sueldo Base</th>
                          <th className="p-3 text-right">H. Extras</th>
                          <th className="p-3 text-right">Bonos / Incentivos</th>
                          <th className="p-3 text-right text-rose-700">Deducciones / Vales</th>
                          <th className="p-3 text-right font-black">Neto A Pagar</th>
                          <th className="p-3 text-center">Desprendible</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeeee] text-white">
                        {run.items.map((item, itemIdx) => (
                          <tr key={item.employeeId ? `${item.employeeId}-${itemIdx}` : `item-${itemIdx}`} className="hover:bg-[#0D1A13] transition-colors">
                            <td className="p-3">
                              <p className="font-bold">{item.employeeName}</p>
                              <p className="text-[10px] text-[#717973]">{item.role}</p>
                            </td>
                            <td className="p-3 text-center font-bold">{item.daysWorked}d</td>
                            <td className="p-3 text-right font-medium">${item.basePay.toLocaleString('es-CO')}</td>
                            <td className="p-3 text-right font-medium text-blue-700">
                              +${(item.overtimePay || 0).toLocaleString('es-CO')}
                            </td>
                            <td className="p-3 text-right font-medium text-emerald-700">
                              +${(item.bonuses || 0).toLocaleString('es-CO')}
                            </td>
                            <td className="p-3 text-right font-medium text-rose-600">
                              -${(item.deductions || 0).toLocaleString('es-CO')}
                            </td>
                            <td className="p-3 text-right font-black text-sm text-white">
                              ${item.netPayable.toLocaleString('es-CO')}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setViewingPayslipRun({ run, item })}
                                className="p-1.5 text-white hover:bg-[#202E25] rounded-xl transition-all cursor-pointer"
                                title="Ver Desprendible de Pago"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Totals Summary */}
                  <div className="bg-[#f8f9f8] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-white">
                    <span className="text-[#717973] font-medium">
                      Unidad de Negocio: <strong className="text-white">{run.businessUnit}</strong>
                    </span>
                    <div className="flex items-center gap-4 text-[11px] flex-wrap">
                      <span>Base: ${run.totalBase.toLocaleString('es-CO')}</span>
                      <span className="text-blue-700">Extras: +${run.totalOvertime.toLocaleString('es-CO')}</span>
                      <span className="text-emerald-700">Bonos: +${run.totalBonuses.toLocaleString('es-CO')}</span>
                      <span className="text-rose-600">Deducciones: -${run.totalDeductions.toLocaleString('es-CO')}</span>
                      <span className="bg-[#0D1A13] text-white px-3 py-1 rounded-xl text-xs font-black">
                        Total Liquidado: ${run.totalNetPayable.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NÓMINA POR JORNALES (CALCULADORA & REGISTRO RÁPIDO DE CAMPO) */}
      {/* ========================================================================= */}
      {activeTab === 'jornales' && (
        <div className="space-y-6">
          {/* Jornales Calculator & Quick Payment Card */}
          <div className="bg-[#15241C] rounded-3xl border-2 border-[#012d1d] p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0D1A13] text-[#ffba38] flex items-center justify-center font-black shadow-md shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Calculadora & Registro Rápido
                  </span>
                  <h2 className="text-lg font-black text-white mt-0.5">
                    Planilla de Nómina por Jornales de Campo
                  </h2>
                  <p className="text-xs text-[#717973]">
                    Liquida trabajos ocasionales por día o por tarea (guadaña, cercas, vacunación) y contabiliza el pago de inmediato en Finanzas.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleQuickPayJornal} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Worker Selector */}
                <div>
                  <label className="block font-bold text-white mb-1">
                    Trabajador / Jornalero *
                  </label>
                  <select
                    value={jornalWorkerId}
                    onChange={(e) => {
                      setJornalWorkerId(e.target.value);
                      if (e.target.value !== 'new') {
                        const selectedEmp = employees.find((emp) => emp.id === e.target.value);
                        if (selectedEmp?.dailyJornalRate) {
                          setJornalRate(selectedEmp.dailyJornalRate);
                        }
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-bold text-white focus:border-[#012d1d] focus:outline-none"
                  >
                    <option key="new" value="new">➕ Jornalero Ocasional (Ingreso Manual)</option>
                    {farmEmployees.map((e, idx) => (
                      <option key={e.id || `emp-${idx}`} value={e.id}>
                        {e.fullName} — ({e.contractType === 'Jornal Diario' ? `Jornal: $${(e.dailyJornalRate || e.baseRate).toLocaleString('es-CO')}` : e.role})
                      </option>
                    ))}
                  </select>

                  {jornalWorkerId === 'new' && (
                    <input
                      type="text"
                      required
                      placeholder="Nombre del Jornalero Ocasional (Ej: Pedro Nel Morales)"
                      value={jornalWorkerName}
                      onChange={(e) => setJornalWorkerName(e.target.value)}
                      className="w-full mt-2 p-2.5 rounded-xl border-2 border-white/10 font-bold text-white focus:border-[#012d1d] focus:outline-none"
                    />
                  )}
                </div>

                {/* 2. Tarifa Valor Jornal ($/día) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-white">Tarifa por Jornal ($/Día) *</label>
                    <span className="text-[10px] text-[#717973] font-bold">Valor Estándar</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="1000"
                    value={jornalRate}
                    onChange={(e) => setJornalRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 font-black text-emerald-800 text-sm focus:border-[#012d1d] focus:outline-none"
                  />
                  {/* Presets */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {[60000, 65000, 70000, 80000, 100000].map((rate, rateIdx) => (
                      <button
                        type="button"
                        key={`rate-${rate}-${rateIdx}`}
                        onClick={() => setJornalRate(rate)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          jornalRate === rate
                            ? 'bg-[#0D1A13] text-white border-[#012d1d]'
                            : 'bg-[#1F3327] text-[#717973] hover:bg-[#202E25] border-white/15'
                        }`}
                      >
                        ${rate / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Cantidad de Jornales (Días) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-white">Jornales Trabajados (Días) *</label>
                    <span className="text-[10px] text-[#717973] font-bold">Fracciones o Días</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0.25"
                    max="31"
                    step="0.25"
                    value={jornalCount}
                    onChange={(e) => setJornalCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 font-black text-white text-sm focus:border-[#012d1d] focus:outline-none"
                  />
                  {/* Presets */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {[0.5, 1, 2, 3, 5, 6, 12, 15].map((cnt, cntIdx) => (
                      <button
                        type="button"
                        key={`cnt-${cnt}-${cntIdx}`}
                        onClick={() => setJornalCount(cnt)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          jornalCount === cnt
                            ? 'bg-[#0D1A13] text-white border-[#012d1d]'
                            : 'bg-[#1F3327] text-[#717973] hover:bg-[#202E25] border-white/15'
                        }`}
                      >
                        {cnt}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Labor o Tarea Ejecutada */}
                <div>
                  <label className="block font-bold text-white mb-1">
                    Labor o Tarea Ejecutada en Campo *
                  </label>
                  <select
                    value={jornalTask}
                    onChange={(e) => setJornalTask(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-bold text-white focus:border-[#012d1d] focus:outline-none"
                  >
                    <option value="Guadañado & Deshierbe de Potreros">🌿 Guadañado & Deshierbe de Potreros</option>
                    <option value="Mantenimiento Cerca Eléctrica & Broches">⚡ Mantenimiento Cerca Eléctrica & Broches</option>
                    <option value="Arreo, Curación & Vacunación Ganado">🐄 Arreo, Curación & Vacunación Ganado</option>
                    <option value="Apoyo Ordeño & Aseo Tanque Leche">🥛 Apoyo Ordeño & Aseo Tanque Leche</option>
                    <option value="Siembra de Forrajes & Fertilización">🌱 Siembra de Forrajes & Fertilización</option>
                    <option value="Mantenimiento Bebederos, Establo & Cercos">🔨 Mantenimiento Bebederos, Establo & Cercos</option>
                    <option value="Carga / Descarga Bultos Alimento Concentrado">🚚 Carga / Descarga Bultos Alimento Concentrado</option>
                    <option value="Corte y Picado de Pasto de Corte">🌾 Corte y Picado de Pasto de Corte</option>
                    <option value="Trabajo Maquinaria / Guadañadora">🚜 Trabajo Maquinaria / Guadañadora</option>
                    <option value="Otras Labores Generales de Finca">🛠️ Otras Labores Generales de Finca</option>
                  </select>
                </div>

                {/* 5. Fecha */}
                <div>
                  <label className="block font-bold text-white mb-1">Fecha de Ejecución / Pago *</label>
                  <input
                    type="date"
                    required
                    value={jornalDate}
                    onChange={(e) => setJornalDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 font-mono font-bold text-white focus:border-[#012d1d] focus:outline-none"
                  />
                </div>

                {/* 6. Bonificación / Alimentación */}
                <div>
                  <label className="block font-bold text-white mb-1">
                    Bonificación / Alimentación ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={jornalBonus}
                    onChange={(e) => setJornalBonus(Number(e.target.value))}
                    placeholder="Ej. 10000 (Aux. Almuerzo)"
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 font-bold text-emerald-700 focus:border-[#012d1d] focus:outline-none"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block font-bold text-white mb-1">
                  Notas u Observaciones del Trabajo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Trabajo realizado en Potrero El Hato. Se limpiaron 3 hectáreas."
                  value={jornalNotes}
                  onChange={(e) => setJornalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-white/10 focus:border-[#012d1d] focus:outline-none"
                />
              </div>

              {/* Calculation Live Summary Banner */}
              <div className="p-4 bg-[#f8f9f8] rounded-2xl border-2 border-[#012d1d] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#717973] tracking-wider block">
                    Cálculo Automático de Jornal
                  </span>
                  <div className="flex items-center gap-3 text-sm font-bold text-white flex-wrap">
                    <span>
                      Subtotal: <strong className="font-mono font-black">${(jornalRate * jornalCount).toLocaleString('es-CO')}</strong> ({jornalCount}d @ ${jornalRate.toLocaleString('es-CO')})
                    </span>
                    {jornalBonus > 0 && (
                      <span className="text-emerald-700 font-mono">
                        +${jornalBonus.toLocaleString('es-CO')} Bono
                      </span>
                    )}
                    {jornalDeduction > 0 && (
                      <span className="text-rose-700 font-mono">
                        -${jornalDeduction.toLocaleString('es-CO')} Vale
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-[#717973] font-bold block uppercase">Neto A Pagar</span>
                    <span className="text-2xl font-black text-emerald-800 font-mono">
                      ${Math.max(0, jornalRate * jornalCount + jornalBonus - jornalDeduction).toLocaleString('es-CO')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0D1A13] hover:bg-[#002216] text-[#ffba38] font-black text-xs px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 border border-amber-400 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Liquidar & Pagar Jornal
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Histórico de Jornales Pagados */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#ffba38]" />
                Histórico de Jornales Liquidados en Finca
              </h3>
              <span className="text-xs font-bold text-[#717973]">
                {farmPayrollRuns.filter((r) => r.periodType === 'Jornales / Ocasional').length} Planillas de Jornal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {farmPayrollRuns.filter((r) => r.periodType === 'Jornales / Ocasional').length === 0 ? (
                <div className="col-span-full bg-[#15241C] p-6 rounded-2xl border-2 border-dashed border-white/10 text-center text-[#717973]">
                  <p className="font-bold text-xs">No se han registrado pagos por jornales aún.</p>
                  <p className="text-[11px] mt-1">Usa la calculadora arriba para liquidar el primer jornal de campo.</p>
                </div>
              ) : (
                farmPayrollRuns
                  .filter((r) => r.periodType === 'Jornales / Ocasional')
                  .map((run, runIdx) => (
                    <div
                      key={run.id || `jornal-run-${runIdx}`}
                      className="bg-[#15241C] rounded-2xl border-2 border-white/10 p-4 shadow-sm hover:shadow-md transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between border-b pb-2 border-white/10">
                        <div>
                          <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                            NÓMINA POR JORNAL
                          </span>
                          <h4 className="font-black text-sm text-white mt-1">{run.periodName}</h4>
                          <p className="text-[10px] text-[#717973] font-mono">Fecha: {run.paymentDate} • {run.farmName}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-1 rounded-xl font-mono">
                          ${run.totalNetPayable.toLocaleString('es-CO')}
                        </span>
                      </div>

                      {run.items.map((item, idx) => (
                        <div key={item.employeeId ? `${item.employeeId}-${idx}` : `item-${idx}`} className="bg-[#f8f9f8] p-2.5 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between items-center font-bold text-white">
                            <span>👤 {item.employeeName}</span>
                            <span className="text-[11px] font-mono font-black text-emerald-800">
                              {item.jornalesCount || item.daysWorked} Jornal{(item.jornalesCount || item.daysWorked) > 1 ? 'es' : ''}
                            </span>
                          </div>
                          {item.jornalTaskType && (
                            <p className="text-[11px] font-semibold text-emerald-900">
                              Task: {item.jornalTaskType}
                            </p>
                          )}
                          {item.notes && <p className="text-[10px] text-[#717973] italic">{item.notes}</p>}
                        </div>
                      ))}

                      {run.financialTransactionId && (
                        <div className="flex items-center justify-between text-[10px] text-[#717973] pt-1">
                          <span className="flex items-center gap-1 font-bold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Contabilizado en Finanzas (Mano de Obra)
                          </span>
                          <span className="font-mono text-[#A5B8AC]">ID: {run.financialTransactionId}</span>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DIRECTORIO DE EMPLEADOS */}
      {/* ========================================================================= */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-[#15241C] p-3 rounded-2xl border border-white/10 shadow-sm">
            <Search className="w-5 h-5 text-[#717973]" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-medium focus:outline-none text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmEmployees.length === 0 ? (
              <div className="col-span-full bg-[#15241C] p-8 rounded-3xl border-2 border-dashed border-white/10 text-center space-y-2">
                <Users className="w-10 h-10 text-[#717973] mx-auto opacity-50" />
                <p className="font-bold text-sm text-white">No se encontraron trabajadores en el directorio.</p>
              </div>
            ) : (
              farmEmployees.map((emp, empIdx) => (
                <div
                  key={emp.id || `emp-${empIdx}`}
                  className="bg-[#15241C] rounded-3xl border-2 border-white/10 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#0D1A13] text-[#ffba38] flex items-center justify-center font-black shadow-md shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-white">{emp.fullName}</h4>
                          <span className="text-[10px] font-mono font-bold text-[#717973]">C.C. {emp.documentId}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => startEditEmployee(emp)}
                        className="p-1.5 text-[#717973] hover:text-white hover:bg-[#1F3327] rounded-xl cursor-pointer"
                        title="Editar trabajador"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-white">
                      <div className="flex items-center justify-between bg-[#0D1A13] p-2 rounded-xl border border-white/10">
                        <span className="text-[#717973] text-[11px]">Cargo:</span>
                        <span className="font-bold text-[11px] text-white">{emp.role}</span>
                      </div>

                      <div className="flex items-center justify-between bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                        <span className="text-white text-[11px] font-bold">Fecha Ingreso / Antigüedad:</span>
                        <span className="font-mono font-bold text-[11px] text-emerald-900">
                          📅 {emp.startDate || '2025-01-15'} ({calculateSeniority(emp.startDate)})
                        </span>
                      </div>

                      {(() => {
                        const contractInfo = getContractInfo(emp.contractType);
                        return (
                          <div className="flex items-center justify-between bg-[#0D1A13] p-2 rounded-xl border border-white/10">
                            <span className="text-[#717973] text-[11px]">Modalidad Vinculación:</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-extrabold text-[11px] px-2 py-0.5 rounded-lg border ${contractInfo.badgeBg} ${contractInfo.badgeText} ${contractInfo.badgeBorder}`}>
                                {emp.contractType}
                              </span>
                              <button
                                onClick={() => startEditEmployee(emp)}
                                className="text-[10px] font-bold text-white hover:bg-[#0D1A13] hover:text-white px-2 py-0.5 rounded-md border border-white/10 bg-[#15241C] transition-all cursor-pointer"
                                title="Modificar modalidad de contrato y datos de vinculación"
                              >
                                ✏️ Cambiar
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex items-center justify-between bg-[#0D1A13] p-2 rounded-xl border border-white/10">
                        <span className="text-[#717973] text-[11px]">Tarifa Base:</span>
                        <span className="font-black text-emerald-800 text-xs">
                          ${emp.baseRate.toLocaleString('es-CO')} {emp.contractType === 'Jornal Diario' ? '/día' : '/mes'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-[#0D1A13] p-2 rounded-xl border border-white/10">
                        <span className="text-[#717973] text-[11px]">Pago:</span>
                        <span className="font-medium text-[11px] text-white">
                          💳 {emp.bankName} {emp.bankAccount ? `(${emp.bankAccount})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#eeeeee] pt-2 flex items-center justify-between text-[10px] text-[#717973]">
                    <span>📍 {emp.farmName}</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200">
                      {emp.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ANTICIPOS Y VALES */}
      {/* ========================================================================= */}
      {activeTab === 'advances' && (
        <div className="space-y-4">
          <div className="bg-[#15241C] rounded-3xl border-2 border-white/10 overflow-hidden shadow-sm">
            <div className="p-4 bg-[#f8f9f8] border-b border-[#eeeeee] flex items-center justify-between">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-500" />
                Historial de Vales y Anticipos Registrados
              </h3>
              <span className="text-xs text-[#717973] font-bold">
                Los anticipos pendientes se descuentan automáticamente en la próxima liquidación.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1F3327] text-white font-black uppercase text-[10px] border-b border-[#eeeeee]">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Empleado</th>
                    <th className="p-3">Finca</th>
                    <th className="p-3">Motivo / Concepto</th>
                    <th className="p-3 text-right">Monto Anticipado</th>
                    <th className="p-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {farmAdvances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#717973]">
                        No hay vales ni anticipos registrados.
                      </td>
                    </tr>
                  ) : (
                    farmAdvances.map((adv, advIdx) => (
                      <tr key={adv.id || `adv-${advIdx}`} className="hover:bg-[#0D1A13]">
                        <td className="p-3 font-mono text-[11px] font-bold">{adv.date}</td>
                        <td className="p-3 font-bold text-white">{adv.employeeName}</td>
                        <td className="p-3 text-[#717973]">{adv.farmName}</td>
                        <td className="p-3 text-white">{adv.reason}</td>
                        <td className="p-3 text-right font-black text-rose-700">${adv.amount.toLocaleString('es-CO')}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              adv.status === 'Descontado'
                                ? 'bg-[#1F3327] text-white border-white/15'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {adv.status === 'Descontado' ? '✔️ Descontado en Liquidación' : '⏳ Pendiente por Descontar'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SEGURIDAD SOCIAL & PLANILLA PILA (PAGO PSE) */}
      {/* ========================================================================= */}
      {activeTab === 'pila' && (
        <div className="space-y-6">
          {/* Header Banner & Generator Card */}
          <div className="bg-gradient-to-br from-[#012d1d] via-[#002216] to-[#0d3f2c] text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-[#1b4332] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#D4A94E] text-white flex items-center justify-center font-black shadow-lg shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <span className="bg-[#D4A94E]/20 text-[#ffba38] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#ffba38]/30">
                    PILA & Pasarela PSE Directa
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">
                    Planilla Integrada de Liquidación de Aportes (PILA)
                  </h2>
                  <p className="text-xs text-[#A5B8AC]">
                    Genera la planilla unificada de Salud, Pensión, ARL y Caja de Compensación de la finca y paga directamente con PSE.
                  </p>
                </div>
              </div>

              {/* PSE Branding Badge */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shrink-0">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-black text-[#ffba38] tracking-wider">Botón de Pago</p>
                  <p className="text-xs font-black text-white">PSE Colombia 100% Seguro</p>
                </div>
              </div>
            </div>

            {/* Quick Generator Form */}
            <form onSubmit={handleGeneratePila} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#A5B8AC] mb-1">
                    Periodo de Cotización
                  </label>
                  <input
                    type="month"
                    value={pilaMonth}
                    onChange={(e) => setPilaMonth(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#15241C] text-white font-bold text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#A5B8AC] mb-1">
                    Operador PILA
                  </label>
                  <select
                    value={pilaOperator}
                    onChange={(e) => setPilaOperator(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#15241C] text-white font-bold text-xs focus:outline-none"
                  >
                    <option value="Aportes en Línea">Aportes en Línea</option>
                    <option value="Mi Planilla">Mi Planilla (Compensar / SOI)</option>
                    <option value="SOI">SOI (Seguridad Social)</option>
                    <option value="Asopagos">Asopagos</option>
                    <option value="Simple">Simple Aportes</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#D4A94E] hover:bg-[#ffa000] text-white font-black text-xs py-2.5 px-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generar PILA Definitiva
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPayrollTemplatesModal(true)}
                    className="bg-[#0D1A13] hover:bg-[#002216] text-[#ffba38] font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#ffba38]/30 shrink-0"
                    title="Crea planillas o liquidaciones con plantillas especiales para Vacaciones, Bonificaciones y Cesantías"
                  >
                    <FileText className="w-4 h-4 text-[#ffba38]" />
                    <span>📋 Plantillas (VAC/BON/CES)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentFarmId = currentFarm.profile?.id || (currentFarm as any).id;
                      const targetFarm = farms.find((f) => (f.profile?.id || (f as any).id) === (selectedFarmFilter === 'all' ? currentFarmId : selectedFarmFilter)) || currentFarm;
                      const draft = createDraftPilaForFarm(targetFarm, pilaMonth);
                      if (draft) {
                        setPilasList((prev) => [draft, ...prev]);
                        setActivePilaDraft(draft);
                        setShowEditPilaDraftModal(true);
                      }
                    }}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-600 shrink-0"
                    title="Crea un borrador editable para precargar novedades (SLN, IGE, LMA, VAC, VST)"
                  >
                    <Edit className="w-4 h-4 text-[#ffba38]" />
                    <span>⚡ Crear Borrador (Días 26-31)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* List of PILA Planillas */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-800" />
              Planillas PILA Generadas, Borradores & Estado de Pago
            </h3>

            {pilasList.length === 0 ? (
              <div className="bg-[#15241C] rounded-3xl p-8 border-2 border-dashed border-white/10 text-center text-[#717973] space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-[#c1c8c2]" />
                <p className="font-bold text-sm text-white">No hay planillas PILA generadas aún</p>
                <p className="text-xs">Usa el generador superior para crear la planilla del mes e iniciar el pago PSE.</p>
              </div>
            ) : (
              pilasList.map((pila, pilaIdx) => (
                <div key={pila.id || `pila-${pilaIdx}`} className="bg-[#15241C] rounded-3xl border-2 border-[#012d1d] overflow-hidden shadow-lg space-y-4 p-5">
                  {/* Planilla Header Bar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#eeeeee] pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#0D1A13] text-[#ffba38] font-mono font-black text-xs px-2.5 py-0.5 rounded-lg">
                          PIN PILA: {pila.pilaPin}
                        </span>
                        <span className="bg-emerald-100 text-emerald-900 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                          {pila.operatorName}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            pila.status === 'Pagada PSE'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                              : pila.status === 'Borrador'
                              ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                              : 'bg-blue-100 text-blue-900 border-blue-400'
                          }`}
                        >
                          {pila.status === 'Pagada PSE'
                            ? `✔️ PAGADA PSE (${pila.pseReference})`
                            : pila.status === 'Borrador'
                            ? '📝 BORRADOR EDITABLE — EN REGISTRO DE NOVEDADES'
                            : '⏳ PILA GENERADA (PENDIENTE PSE)'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white">
                        Planilla Integrada de Seguridad Social — {pila.farmName} ({pila.period})
                      </h4>
                      <p className="text-xs text-[#717973]">
                        {pila.totalEmployees} Cotizantes | IBC Total: <strong className="text-white">${pila.totalIbc.toLocaleString('es-CO')}</strong> | Generada el {pila.generationDate}
                      </p>
                    </div>

                    {/* PSE & Draft Action Buttons */}
                    <div className="shrink-0 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setActivePilaDraft(pila);
                          setShowEditPilaDraftModal(true);
                        }}
                        className="bg-[#1F3327] hover:bg-[#202E25] text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-4 h-4 text-emerald-800" />
                        <span>✏️ Editar Novedades</span>
                      </button>

                      {pila.status === 'Pagada PSE' ? (
                        <div className="bg-emerald-950/30 border border-emerald-300 rounded-2xl p-2.5 text-right">
                          <p className="text-[10px] uppercase font-bold text-emerald-700">Comprobante de Pago PSE</p>
                          <p className="text-xs font-mono font-black text-emerald-900">{pila.pseReference}</p>
                          <p className="text-[10px] text-emerald-800">Pagado el {pila.paymentDate}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (pila.status === 'Borrador') {
                              const finalPin = `8839${Math.floor(100000 + Math.random() * 900000)}`;
                              const updated = {
                                ...pila,
                                pilaPin: finalPin,
                                status: 'Generada PILA' as const,
                                generationDate: new Date().toISOString().split('T')[0],
                              };
                              setPilasList((prev) => prev.map((p) => (p.id === pila.id ? updated : p)));
                              setActivePilaForPse(updated);
                            } else {
                              setActivePilaForPse(pila);
                            }
                            setShowPseModal(true);
                          }}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition-all flex items-center gap-2 border-2 border-amber-300 cursor-pointer animate-pulse"
                        >
                          <CreditCard className="w-5 h-5 text-white" />
                          <span>💳 PAGAR $ {pila.grandTotalPila.toLocaleString('es-CO')} CON PSE</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contribution Summary Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-[#f8f9f8] p-3.5 rounded-2xl border border-white/10">
                    <div className="bg-[#15241C] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-[#717973] uppercase">Salud (EPS 12.5%)</span>
                      <p className="text-sm font-black text-white">${pila.totalHealth.toLocaleString('es-CO')}</p>
                      <p className="text-[9px] text-[#A5B8AC]">Emp: 4% | Patronal: 8.5%</p>
                    </div>

                    <div className="bg-[#15241C] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-[#717973] uppercase">Pensión (16%)</span>
                      <p className="text-sm font-black text-white">${pila.totalPension.toLocaleString('es-CO')}</p>
                      <p className="text-[9px] text-[#A5B8AC]">Emp: 4% | Patronal: 12%</p>
                    </div>

                    <div className="bg-[#15241C] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-[#717973] uppercase">ARL Agropecuario</span>
                      <p className="text-sm font-black text-white">${pila.totalArl.toLocaleString('es-CO')}</p>
                      <p className="text-[9px] text-[#A5B8AC]">100% Patronal (Nivel III)</p>
                    </div>

                    <div className="bg-[#15241C] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-[#717973] uppercase">Caja Compensación</span>
                      <p className="text-sm font-black text-white">${pila.totalCaja.toLocaleString('es-CO')}</p>
                      <p className="text-[9px] text-[#A5B8AC]">4% Patronal (Comfama)</p>
                    </div>

                    <div className="bg-[#0D1A13] text-white p-2.5 rounded-xl border border-[#012d1d] col-span-2 md:col-span-1">
                      <span className="text-[10px] font-bold text-[#ffba38] uppercase">Total Planilla PILA</span>
                      <p className="text-base font-black text-white">${pila.grandTotalPila.toLocaleString('es-CO')}</p>
                      <p className="text-[9px] text-[#A5B8AC]">Aportes Empleado + Patronales</p>
                    </div>
                  </div>

                  {/* Detail Table per Employee */}
                  <div className="overflow-x-auto border border-[#eeeeee] rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0D1A13] text-white font-black uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Trabajador / Documento</th>
                          <th className="p-2.5">EPS / Fondo Pensión</th>
                          <th className="p-2.5 text-right">IBC Base</th>
                          <th className="p-2.5 text-right">Salud (Emp/Pat)</th>
                          <th className="p-2.5 text-right">Pensión (Emp/Pat)</th>
                          <th className="p-2.5 text-right">ARL</th>
                          <th className="p-2.5 text-right">Caja</th>
                          <th className="p-2.5 text-right font-black">Total Cotización</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeeee] bg-[#15241C]">
                        {pila.items.map((item, idx) => (
                          <tr key={item.documentId ? `${item.documentId}-${idx}` : `pila-item-${idx}`} className="hover:bg-[#0D1A13]">
                            <td className="p-2.5 font-bold text-white">
                              {item.employeeName}
                              <div className="text-[10px] text-[#717973] font-normal font-mono">C.C. {item.documentId}</div>
                            </td>
                            <td className="p-2.5">
                              <div className="font-semibold text-[11px] text-white">{item.epsName}</div>
                              <div className="text-[10px] text-[#717973]">{item.pensionFund}</div>
                            </td>
                            <td className="p-2.5 text-right font-bold text-white">${item.ibc.toLocaleString('es-CO')}</td>
                            <td className="p-2.5 text-right font-mono text-[11px]">
                              ${(item.healthWorker + item.healthEmployer).toLocaleString('es-CO')}
                              <div className="text-[9px] text-[#A5B8AC]">Ded: ${item.healthWorker.toLocaleString('es-CO')}</div>
                            </td>
                            <td className="p-2.5 text-right font-mono text-[11px]">
                              ${(item.pensionWorker + item.pensionEmployer).toLocaleString('es-CO')}
                              <div className="text-[9px] text-[#A5B8AC]">Ded: ${item.pensionWorker.toLocaleString('es-CO')}</div>
                            </td>
                            <td className="p-2.5 text-right font-mono text-[11px]">${item.arlEmployer.toLocaleString('es-CO')}</td>
                            <td className="p-2.5 text-right font-mono text-[11px]">${item.cajaEmployer.toLocaleString('es-CO')}</td>
                            <td className="p-2.5 text-right font-black text-white">${item.totalItem.toLocaleString('es-CO')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR / EDITAR TRABAJADOR */}
      {/* ========================================================================= */}
      {showAddEmployeeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddEmployeeModal(false);
          }}
        >
          <div className="bg-[#15241C] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 border-2 border-[#012d1d] my-auto">
            <div className="flex justify-between items-center border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#0D1A13] text-[#ffba38] flex items-center justify-center font-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingEmployee ? 'Editar Trabajador' : 'Registrar Nuevo Trabajador'}
                  </h3>
                  <p className="text-[11px] text-[#717973]">Ingresa los datos contractuales y bancarios.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEmployeeModal(false)}
                className="text-[#717973] hover:text-black p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-white mb-1">Finca Asignada</label>
                <select
                  value={empFarmId}
                  onChange={(e) => setEmpFarmId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-medium focus:border-[#012d1d] focus:outline-none"
                >
                  {farms.map((f, idx) => (
                    <option key={f.id || `farm-opt-${idx}`} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Jairo Benítez"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 focus:border-[#012d1d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Cédula / Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1.094.882.110"
                    value={empDoc}
                    onChange={(e) => setEmpDoc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 focus:border-[#012d1d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">Cargo / Rol</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as WorkerRole)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-medium focus:border-[#012d1d] focus:outline-none"
                  >
                    <option value="Administrador / Mayordomo">Administrador / Mayordomo</option>
                    <option value="Vaquero / Ordeñador">Vaquero / Ordeñador</option>
                    <option value="Operario Maquinaria">Operario Maquinaria</option>
                    <option value="Jornalero / Temporal">Jornalero / Temporal</option>
                    <option value="Veterinario / Zootecnista">Veterinario / Zootecnista</option>
                    <option value="Auxiliar de Campo">Auxiliar de Campo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Modalidad de Vinculación / Contrato *</label>
                  <select
                    value={empContract}
                    onChange={(e) => setEmpContract(e.target.value as ContractType)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-bold text-white focus:border-[#012d1d] focus:outline-none"
                  >
                    <option value="Término Indefinido">Término Indefinido (Prestaciones Sociales Completas)</option>
                    <option value="Término Fijo">Término Fijo (Prestaciones Sociales)</option>
                    <option value="Obra o Labor">Obra o Labor Determinada</option>
                    <option value="Fijo Mensual">Fijo Mensual (Estándar)</option>
                    <option value="Jornal Diario">Jornal Diario / Ocasional ($/Día)</option>
                    <option value="Prestación de Servicios">Prestación de Servicios (Honorarios - Sin Prestaciones)</option>
                    <option value="Destajo / Por Tarea">Destajo / Por Tarea</option>
                    <option value="Aprendizaje / Pasantía">Aprendizaje / Pasantía SENA</option>
                  </select>
                </div>
              </div>

              {/* FICHA INFORMATIVA LEGAL SEGÚN LEY COLOMBIANA (CST) */}
              {(() => {
                const legalInfo = getContractInfo(empContract);
                return (
                  <div className={`p-3 rounded-2xl border ${legalInfo.badgeBorder} ${legalInfo.badgeBg} space-y-2 text-white`}>
                    <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-1.5">
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                        <span>Régimen Legal Laboral: {legalInfo.labelShort}</span>
                      </div>
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-white/80 border border-black/10">
                        ⚖️ {legalInfo.legalBasis}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium leading-relaxed">
                      {legalInfo.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5 text-[10px] font-bold">
                      <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${legalInfo.hasSocialBenefits ? 'bg-emerald-950/30 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'}`}>
                        {legalInfo.hasSocialBenefits ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> : <X className="w-3.5 h-3.5 shrink-0 text-red-600" />}
                        <span>{legalInfo.hasSocialBenefits ? 'Genera Prestaciones Sociales (Cesantías, Primas, Vac.)' : 'Sin Prestaciones Sociales (Honorarios Nétos)'}</span>
                      </div>

                      <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${legalInfo.hasAuxTransport ? 'bg-emerald-950/30 border-emerald-300 text-emerald-950' : 'bg-amber-950/30 border-amber-200 text-amber-950'}`}>
                        {legalInfo.hasAuxTransport ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />}
                        <span>{legalInfo.hasAuxTransport ? 'Auxilio de Transporte (Si gana ≤ 2 SMLMV)' : 'Sin Auxilio de Transporte'}</span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-black/10">
                      <span className="text-[10px] font-extrabold block mb-1">Garantías Legales & Criterios de Ley:</span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-medium">
                        {legalInfo.obligations.map((item, obIdx) => (
                          <li key={obIdx} className="flex items-start gap-1">
                            <span className="text-emerald-800 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">Fecha de Ingreso / Inicio de Contrato *</label>
                  <input
                    type="date"
                    required
                    value={empStartDate}
                    onChange={(e) => setEmpStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 font-bold text-white focus:border-[#012d1d] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#717973] mt-1">
                    📅 Base para liquidación de Cesantías, Intereses, Primas y Vacaciones.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Frecuencia de Pago</label>
                  <select
                    value={empFrequency}
                    onChange={(e) => setEmpFrequency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-medium focus:border-[#012d1d] focus:outline-none"
                  >
                    <option value="Semanal">Semanal (Pago de Jornales los sábados)</option>
                    <option value="Quincenal">Quincenal (Cada 15 días)</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">
                    {empContract === 'Jornal Diario' ? 'Tarifa Jornal Diario ($/Día)' : 'Sueldo Base Mensual ($)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={empBaseRate}
                    onChange={(e) => setEmpBaseRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 font-black text-emerald-800 focus:border-[#012d1d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">
                    Tarifa Fija por Jornal ($/Día)
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="1000"
                    value={empDailyJornalRate}
                    onChange={(e) => setEmpDailyJornalRate(Number(e.target.value))}
                    placeholder="Ej. 65000"
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 font-black text-white focus:border-[#012d1d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">Medio de Pago / Banco</label>
                  <input
                    type="text"
                    placeholder="Ej. Bancolombia / Nequi / Efectivo"
                    value={empBank}
                    onChange={(e) => setEmpBank(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 focus:border-[#012d1d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Número de Cuenta / Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 312-882109-12"
                    value={empAccount}
                    onChange={(e) => setEmpAccount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 focus:border-[#012d1d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Seguridad Social / EPS / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Afiliado a Sura EPS y ARL Positiva"
                  value={empSocialSec}
                  onChange={(e) => setEmpSocialSec(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-white/10 focus:border-[#012d1d] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-[#717973] hover:bg-[#1F3327]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0D1A13] text-white font-black px-5 py-2.5 rounded-xl shadow-md hover:bg-[#002216] cursor-pointer"
                >
                  {editingEmployee ? 'Guardar Cambios' : 'Registrar Trabajador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR NUEVA LIQUIDACIÓN DE NÓMINA */}
      {/* ========================================================================= */}
      {showCreateRunModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateRunModal(false);
          }}
        >
          <div className="bg-[#15241C] rounded-3xl max-w-4xl w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 border-2 border-[#012d1d] my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0D1A13] text-[#ffba38] flex items-center justify-center font-black shadow-md">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Planilla de Liquidación de Nómina</h3>
                  <p className="text-[11px] text-[#717973]">
                    Liquidación para trabajadores activos. Puedes ajustar horas extras, bonos y deducciones.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateRunModal(false)}
                className="text-[#717973] hover:text-black p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRunSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">Finca Asignada</label>
                  <select
                    value={empFarmId}
                    onChange={(e) => {
                      setEmpFarmId(e.target.value);
                      handleInitializeRunItems(e.target.value);
                    }}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-bold focus:border-[#012d1d] focus:outline-none"
                  >
                    {farms.map((f, idx) => (
                      <option key={f.id || `farm-run-opt-${idx}`} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Nombre del Período *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nómina 1ra Quincena Agosto 2026"
                    value={runPeriodName}
                    onChange={(e) => setRunPeriodName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 font-bold focus:border-[#012d1d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Tipo de Período</label>
                  <select
                    value={runPeriodType}
                    onChange={(e) => setRunPeriodType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-medium focus:border-[#012d1d] focus:outline-none"
                  >
                    <option value="Quincenal">Quincenal (15 días)</option>
                    <option value="Mensual">Mensual (30 días)</option>
                    <option value="Semanal">Semanal (7 días)</option>
                    <option value="Jornales / Ocasional">Jornales / Ocasional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={runStartDate}
                    onChange={(e) => setRunStartDate(e.target.value)}
                    className="w-full p-2 rounded-xl border-2 border-white/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={runEndDate}
                    onChange={(e) => setRunEndDate(e.target.value)}
                    className="w-full p-2 rounded-xl border-2 border-white/10 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Fecha Programada de Pago</label>
                  <input
                    type="date"
                    value={runPaymentDate}
                    onChange={(e) => setRunPaymentDate(e.target.value)}
                    className="w-full p-2 rounded-xl border-2 border-white/10 focus:outline-none"
                  />
                </div>
              </div>

              {/* Items Editable Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-white">Detalle de Liquidación por Trabajador</h4>
                  <span className="text-[11px] text-[#717973] font-bold">
                    {runItems.length} Trabajadores Incluidos
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border-2 border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0D1A13] text-white font-black uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Trabajador</th>
                        <th className="p-2.5 w-16 text-center">Días</th>
                        <th className="p-2.5 w-28 text-right">Sueldo Base</th>
                        <th className="p-2.5 w-28 text-right">Extras ($)</th>
                        <th className="p-2.5 w-28 text-right">Bonos ($)</th>
                        <th className="p-2.5 w-28 text-right">Deducciones ($)</th>
                        <th className="p-2.5 w-32 text-right">Neto A Pagar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee] bg-[#15241C]">
                      {runItems.map((item, itemIdx) => (
                        <tr key={item.employeeId ? `${item.employeeId}-${itemIdx}` : `run-item-${itemIdx}`} className="hover:bg-[#0D1A13]">
                          <td className="p-2.5">
                            <p className="font-bold text-white">{item.employeeName}</p>
                            <p className="text-[10px] text-[#717973]">{item.role}</p>
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={item.daysWorked}
                              onChange={(e) =>
                                handleUpdateRunItem(item.employeeId, 'daysWorked', Number(e.target.value))
                              }
                              className="w-14 p-1 text-center font-bold border border-white/10 rounded-lg"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={item.basePay}
                              onChange={(e) =>
                                handleUpdateRunItem(item.employeeId, 'basePay', Number(e.target.value))
                              }
                              className="w-24 p-1 text-right font-medium border border-white/10 rounded-lg"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={item.overtimePay}
                              onChange={(e) =>
                                handleUpdateRunItem(item.employeeId, 'overtimePay', Number(e.target.value))
                              }
                              className="w-24 p-1 text-right font-medium text-blue-700 border border-white/10 rounded-lg"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={item.bonuses}
                              onChange={(e) =>
                                handleUpdateRunItem(item.employeeId, 'bonuses', Number(e.target.value))
                              }
                              className="w-24 p-1 text-right font-medium text-emerald-700 border border-white/10 rounded-lg"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={item.deductions}
                              onChange={(e) =>
                                handleUpdateRunItem(item.employeeId, 'deductions', Number(e.target.value))
                              }
                              className="w-24 p-1 text-right font-medium text-rose-700 border border-white/10 rounded-lg"
                            />
                          </td>
                          <td className="p-2.5 text-right font-black text-sm text-white">
                            ${item.netPayable.toLocaleString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-200 flex items-center justify-between font-black text-sm text-white">
                <span>TOTAL NÓMINA LIQUIDADA:</span>
                <span className="text-xl text-emerald-900">
                  $
                  {runItems
                    .reduce((sum, i) => sum + (i.netPayable || 0), 0)
                    .toLocaleString('es-CO')}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setShowCreateRunModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-[#717973] hover:bg-[#1F3327]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0D1A13] text-white font-black px-5 py-2.5 rounded-xl shadow-md hover:bg-[#002216] cursor-pointer"
                >
                  Guardar Planilla de Nómina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR ANTICIPO O VALE */}
      {/* ========================================================================= */}
      {showAddAdvanceModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddAdvanceModal(false);
          }}
        >
          <div className="bg-[#15241C] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 border-2 border-[#012d1d] my-auto">
            <div className="flex justify-between items-center border-b border-[#eeeeee] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#0D1A13] text-[#ffba38] flex items-center justify-center font-black">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Registrar Vale / Anticipo</h3>
                  <p className="text-[11px] text-[#717973]">Se descontará en la próxima liquidación.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddAdvanceModal(false)}
                className="text-[#717973] hover:text-black p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdvanceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-white mb-1">Seleccionar Trabajador *</label>
                <select
                  value={advEmpId}
                  onChange={(e) => setAdvEmpId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-bold focus:border-[#012d1d] focus:outline-none"
                >
                  {farmEmployees.map((e, idx) => (
                    <option key={e.id || `adv-emp-${idx}`} value={e.id}>
                      {e.fullName} ({e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Fecha del Anticipo</label>
                <input
                  type="date"
                  value={advDate}
                  onChange={(e) => setAdvDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-white/10 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Monto Anticipado ($) *</label>
                <input
                  type="number"
                  required
                  min="5000"
                  step="5000"
                  value={advAmount}
                  onChange={(e) => setAdvAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border-2 border-white/10 font-black text-rose-700 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Concepto / Motivo</label>
                <input
                  type="text"
                  placeholder="Ej. Anticipo compra medicinas / Vales de mercado"
                  value={advReason}
                  onChange={(e) => setAdvReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-white/10 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setShowAddAdvanceModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-[#717973] hover:bg-[#1F3327]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0D1A13] text-white font-black px-5 py-2.5 rounded-xl shadow-md hover:bg-[#002216] cursor-pointer"
                >
                  Registrar Vale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VISTA E IMPRESIÓN DE DESPRENDIBLE DE PAGO */}
      {/* ========================================================================= */}
      {viewingPayslipRun && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingPayslipRun(null);
          }}
        >
          <div className="bg-[#15241C] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in border-2 border-[#012d1d] my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="font-black text-base text-white">Desprendible de Pago de Nómina</h3>
              </div>
              <button
                onClick={() => setViewingPayslipRun(null)}
                className="text-[#717973] hover:text-black p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payslip Card Printable Body */}
            <div className="bg-[#f8f9f8] p-5 rounded-2xl border-2 border-white/10 space-y-4 text-xs font-medium text-white">
              <div className="text-center border-b pb-3 border-white/10">
                <h4 className="font-black text-base uppercase text-white">{viewingPayslipRun.run.farmName}</h4>
                <p className="text-[10px] text-[#717973] font-bold uppercase">{viewingPayslipRun.run.periodName}</p>
                <p className="text-[10px] text-[#717973]">
                  Periodo: {viewingPayslipRun.run.startDate} al {viewingPayslipRun.run.endDate}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#717973] block text-[10px] uppercase font-bold">Trabajador</span>
                  <span className="font-black">{viewingPayslipRun.item.employeeName}</span>
                </div>
                <div>
                  <span className="text-[#717973] block text-[10px] uppercase font-bold">Cargo</span>
                  <span className="font-bold">{viewingPayslipRun.item.role}</span>
                </div>
              </div>

              <div className="space-y-1.5 border-t pt-3 border-white/10">
                <div className="flex justify-between">
                  <span>Días Trabados ({viewingPayslipRun.item.daysWorked}d):</span>
                  <span className="font-bold">${viewingPayslipRun.item.basePay.toLocaleString('es-CO')}</span>
                </div>
                {viewingPayslipRun.item.overtimePay > 0 && (
                  <div className="flex justify-between text-blue-700">
                    <span>Horas Extras / Recargos:</span>
                    <span className="font-bold">+${viewingPayslipRun.item.overtimePay.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {viewingPayslipRun.item.bonuses > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Bonificaciones / Metas:</span>
                    <span className="font-bold">+${viewingPayslipRun.item.bonuses.toLocaleString('es-CO')}</span>
                  </div>
                )}
                {viewingPayslipRun.item.deductions > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>Deducciones / Vales:</span>
                    <span className="font-bold">-${viewingPayslipRun.item.deductions.toLocaleString('es-CO')}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-[#012d1d] pt-3 flex justify-between items-center text-sm font-black">
                <span>NETO RECIBIDO:</span>
                <span className="text-emerald-800 text-lg">
                  ${viewingPayslipRun.item.netPayable.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={safePrint}
                className="bg-[#0D1A13] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#ffba38]" /> Imprimir Desprendible
              </button>
              <button
                onClick={() => setViewingPayslipRun(null)}
                className="bg-[#202E25] text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PASARELA DE PAGO DIRECTO VÍA PSE COLOMBIA */}
      {/* ========================================================================= */}
      {showPseModal && activePilaForPse && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPseModal(false);
          }}
        >
          <div className="bg-[#15241C] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 border-2 border-[#012d1d] my-auto">
            {/* Modal PSE Header */}
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0D1A13] text-[#ffba38] flex items-center justify-center font-black shadow-lg">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-300">
                    Pasarela PSE Oficial
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Pago de Planilla PILA por PSE
                  </h3>
                  <p className="text-xs text-[#717973]">
                    PIN PILA: <strong className="font-mono text-white">{activePilaForPse.pilaPin}</strong> ({activePilaForPse.operatorName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPseModal(false)}
                className="text-[#717973] hover:text-black p-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Payment Highlight Banner */}
            <div className="bg-gradient-to-r from-[#012d1d] to-[#0a4d33] text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
              <div>
                <p className="text-[10px] text-[#ffba38] uppercase font-black tracking-wider">Total Aportes a Debitar</p>
                <p className="text-2xl font-black text-white">${activePilaForPse.grandTotalPila.toLocaleString('es-CO')}</p>
                <p className="text-[10px] text-[#A5B8AC]">Salud + Pensión + ARL + Caja ({activePilaForPse.totalEmployees} empleados)</p>
              </div>
              <Lock className="w-8 h-8 text-amber-400 opacity-80" />
            </div>

            {/* PSE Bank Selection Form */}
            <form onSubmit={handleConfirmPsePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-white mb-1">
                  Seleccione su Entidad Bancaria (PSE) *
                </label>
                <select
                  value={pseBank}
                  onChange={(e) => setPseBank(e.target.value)}
                  className="w-full p-3 rounded-2xl border-2 border-[#012d1d] bg-[#15241C] font-black text-white text-sm focus:outline-none"
                >
                  <option value="Bancolombia">Bancolombia</option>
                  <option value="Banco de Bogotá">Banco de Bogotá</option>
                  <option value="Davivienda">Davivienda / Daviplata</option>
                  <option value="BBVA Colombia">BBVA Colombia</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Banco Agrario de Colombia">Banco Agrario de Colombia</option>
                  <option value="Banco de Occidente">Banco de Occidente</option>
                  <option value="Banco Popular">Banco Popular</option>
                  <option value="Banco AV Villas">Banco AV Villas</option>
                  <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                  <option value="Banco Caja Social">Banco Caja Social</option>
                  <option value="RappiPay">RappiPay / Lulo Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-white mb-1">Tipo de Persona</label>
                  <select
                    value={psePersonType}
                    onChange={(e) => setPsePersonType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 bg-[#15241C] font-bold"
                  >
                    <option value="Natural">Persona Natural</option>
                    <option value="Juridica">Persona Jurídica (Empresa)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Número de Documento / NIT</label>
                  <input
                    type="text"
                    required
                    value={pseDocId}
                    onChange={(e) => setPseDocId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-white/10 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Correo Electrónico de Confirmación</label>
                <input
                  type="email"
                  required
                  value={pseEmail}
                  onChange={(e) => setPseEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-white/10 font-medium"
                />
              </div>

              <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Al hacer clic en <strong>Ir al Banco para Pagar con PSE</strong>, se simulará el débito seguro. El comprobante CUS y la transacción de Egreso se registrarán automáticamente en el módulo de Finanzas de la finca.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setShowPseModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-[#717973] hover:bg-[#1F3327]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition-all flex items-center gap-2 border-2 border-amber-300 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ir al Banco para Pagar con PSE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit PILA Draft & Novedades Modal */}
      <EditPilaDraftModal
        isOpen={showEditPilaDraftModal}
        onClose={() => {
          setShowEditPilaDraftModal(false);
          setActivePilaDraft(null);
        }}
        pila={activePilaDraft}
        onSaveDraft={(updatedPila) => {
          setPilasList((prev) => prev.map((p) => (p.id === updatedPila.id ? updatedPila : p)));
        }}
        onConsolidatePin={(consolidated) => {
          setPilasList((prev) => prev.map((p) => (p.id === consolidated.id ? consolidated : p)));
          setActivePilaForPse(consolidated);
          setShowPseModal(true);
        }}
        employees={employees}
      />

      {/* Payroll Bank Disbursement (Pasarela ACH) Modal */}
      <PayrollDisbursementModal
        isOpen={showDisbursementModal}
        onClose={() => {
          setShowDisbursementModal(false);
          setActiveRunForDisbursement(null);
        }}
        payrollRun={activeRunForDisbursement}
        employees={employees}
        onDisburseSuccess={(updatedRun, finTx) => {
          onUpdatePayrollRun(updatedRun);
          onAddFinancialTransaction(finTx);
        }}
      />

      {/* Automated Payroll & PILA Templates Modal (Vacaciones, Bonificaciones, Cesantías) */}
      <PayrollTemplatesModal
        isOpen={showPayrollTemplatesModal}
        onClose={() => setShowPayrollTemplatesModal(false)}
        farm={currentFarm}
        employees={employees}
        onGeneratePayrollRun={(newRun) => {
          onAddPayrollRun(newRun);
        }}
        onGeneratePilaDraft={(pilaDraft) => {
          setPilasList((prev) => [pilaDraft, ...prev]);
          setActivePilaDraft(pilaDraft);
          setShowEditPilaDraftModal(true);
        }}
      />
    </div>
  );
};
