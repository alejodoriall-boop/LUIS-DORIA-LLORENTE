import React, { useState, useEffect } from 'react';
import { safePrint } from '../../utils/printUtils';
import { PayrollRun, Employee, FinancialTransaction } from '../../types';
import {
  CreditCard,
  Building2,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  Printer,
  Check,
  RefreshCw,
  Building,
  DollarSign,
  Users,
  FileCheck2,
} from 'lucide-react';

interface PayrollDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollRun: PayrollRun | null;
  employees: Employee[];
  onDisburseSuccess: (updatedRun: PayrollRun, financialTx: FinancialTransaction) => void;
}

export const BANK_ACCOUNTS_ORIGIN = [
  {
    id: 'bancolombia-1',
    bankName: 'Bancolombia PyME - Cta. Ahorros',
    accountNumber: '912-384910-02',
    accountType: 'Ahorros',
    balance: 48500000,
    logo: '🏦',
  },
  {
    id: 'banco-agrario-1',
    bankName: 'Banco Agrario Ganadero - Cta. Corriente',
    accountNumber: '003-88219-3',
    accountType: 'Corriente',
    balance: 35000000,
    logo: '🏛️',
  },
  {
    id: 'davivienda-1',
    bankName: 'Davivienda Empresarial Agro - Cta. Ahorros',
    accountNumber: '0482-0091-22',
    accountType: 'Ahorros',
    balance: 28000000,
    logo: '🔴',
  },
  {
    id: 'banco-bogota-1',
    bankName: 'Banco de Bogotá - Cta. Corriente',
    accountNumber: '018-384210-9',
    accountType: 'Corriente',
    balance: 52000000,
    logo: '🔵',
  },
  {
    id: 'nequi-1',
    bankName: 'Nequi Negocios Finca',
    accountNumber: '300-8812934',
    accountType: 'Digital',
    balance: 15000000,
    logo: '📱',
  },
];

export const PayrollDisbursementModal: React.FC<PayrollDisbursementModalProps> = ({
  isOpen,
  onClose,
  payrollRun,
  employees,
  onDisburseSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedOriginBankId, setSelectedOriginBankId] = useState(BANK_ACCOUNTS_ORIGIN[0].id);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  
  // Editable employee bank details during review step
  const [itemBankDetails, setItemBankDetails] = useState<Record<string, { bankName: string; bankAccount: string }>>({});

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [batchCus, setBatchCus] = useState<string>('');

  useEffect(() => {
    if (payrollRun && isOpen) {
      setStep(1);
      setSelectedOriginBankId(BANK_ACCOUNTS_ORIGIN[0].id);
      setTokenInput('');
      setTokenError('');
      setIsProcessing(false);
      setProgress(0);
      setProcessingLogs([]);
      setBatchCus('');

      // Map employee bank details
      const initialMap: Record<string, { bankName: string; bankAccount: string }> = {};
      payrollRun.items.forEach((item) => {
        const matchedEmp = employees.find((e) => e.id === item.employeeId || e.fullName === item.employeeName);
        initialMap[item.employeeId || item.employeeName] = {
          bankName: matchedEmp?.bankName || 'Bancolombia',
          bankAccount: matchedEmp?.bankAccount || `10${Math.floor(100000000 + Math.random() * 900000000)}`,
        };
      });
      setItemBankDetails(initialMap);
    }
  }, [payrollRun, isOpen, employees]);

  if (!isOpen || !payrollRun) return null;

  const originBank = BANK_ACCOUNTS_ORIGIN.find((b) => b.id === selectedOriginBankId) || BANK_ACCOUNTS_ORIGIN[0];

  const handleBankDetailChange = (empKey: string, field: 'bankName' | 'bankAccount', val: string) => {
    setItemBankDetails((prev) => ({
      ...prev,
      [empKey]: {
        ...prev[empKey],
        [field]: val,
      },
    }));
  };

  const handleStartDisbursement = () => {
    if (!tokenInput || tokenInput.trim().length < 4) {
      setTokenError('⚠️ Ingresa la clave dinámica o token de seguridad bancario.');
      return;
    }
    setTokenError('');
    setStep(3);
    setIsProcessing(true);
    setProgress(0);

    const generatedCus = `ACH-DISP-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setBatchCus(generatedCus);

    const totalItems = payrollRun.items.length;
    let currentIdx = 0;

    const interval = setInterval(() => {
      currentIdx++;
      const item = payrollRun.items[currentIdx - 1];
      const details = itemBankDetails[item.employeeId || item.employeeName] || { bankName: 'Bancolombia', bankAccount: 'Ahorros' };
      const cusItem = `CUS-${Math.floor(100000 + Math.random() * 900000)}`;

      const logMsg = `[${currentIdx}/${totalItems}] Transferido $${item.netPayable.toLocaleString('es-CO')} a ${item.employeeName} (${details.bankName} ${details.bankAccount}) — ✔️ Aprobación ${cusItem}`;

      setProcessingLogs((prev) => [...prev, logMsg]);
      setProgress(Math.round((currentIdx / totalItems) * 100));

      if (currentIdx >= totalItems) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setStep(4);

          // Create Financial Egreso
          const finTx: FinancialTransaction = {
            id: `tx-[#${Date.now().toString().slice(-6)}]`,
            farmId: payrollRun.farmId,
            farmName: payrollRun.farmName,
            type: 'egreso',
            category: 'nomina_fija',
            amount: payrollRun.totalNetPayable,
            date: new Date().toISOString().split('T')[0],
            description: `Dispersión Bancaria de Nómina (${payrollRun.periodName}) por ${originBank.bankName} Lote ACH Ref: ${generatedCus} (${payrollRun.items.length} Trabajadores)`,
            businessUnit: payrollRun.businessUnit || 'corporativo_general',
            costType: 'directo',
          };

          const updatedRun: PayrollRun = {
            ...payrollRun,
            status: 'Pagada',
            disbursementStatus: 'Dispersada ACH',
            disbursementBatchCode: generatedCus,
            disbursementBank: originBank.bankName,
            disbursementDate: new Date().toLocaleString('es-CO'),
            financialTransactionId: finTx.id,
          };

          onDisburseSuccess(updatedRun, finTx);
        }, 600);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#012d1d] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#012d1d] via-[#023e2a] to-[#012d1d] text-white p-5 flex items-start justify-between shrink-0 border-b border-emerald-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#ffba38] text-[#012d1d] font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow">
                💳 Pasarela de Dispersión Bancaria ACH
              </span>
              <span className="bg-white/20 text-white font-mono text-xs px-2.5 py-0.5 rounded-lg border border-white/20">
                Lote de Nómina
              </span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#ffba38]" />
              Dispersión Masiva de Pagos de Nómina a Cuentas
            </h2>
            <p className="text-xs text-[#c1ecd4]">
              {payrollRun.farmName} — {payrollRun.periodName} | Total a Dispersar: <strong className="text-[#ffba38]">${payrollRun.totalNetPayable.toLocaleString('es-CO')}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="bg-[#f1f4f2] px-6 py-3 border-b border-[#c1c8c2] flex items-center justify-between text-xs font-bold text-[#717973]">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#012d1d] font-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-[#012d1d] text-white' : 'bg-slate-300 text-slate-600'}`}>
              1
            </span>
            <span>Cuenta Origen</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#012d1d] font-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-[#012d1d] text-white' : 'bg-slate-300 text-slate-600'}`}>
              2
            </span>
            <span>Cuentas Destino</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#012d1d] font-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-[#012d1d] text-white' : 'bg-slate-300 text-slate-600'}`}>
              3
            </span>
            <span>Dispersión ACH</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <div className={`flex items-center gap-2 ${step === 4 ? 'text-emerald-900 font-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 4 ? 'bg-emerald-800 text-white' : 'bg-slate-300 text-slate-600'}`}>
              4
            </span>
            <span>Comprobante</span>
          </div>
        </div>

        {/* Modal Content according to Step */}
        <div className="p-5 overflow-y-auto grow bg-[#f8fbf9] space-y-5">

          {/* STEP 1: Select Origin Bank Account */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-800 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-black text-sm">Paso 1: Selecciona la Cuenta Débito de la Finca</p>
                  <p>
                    Los fondos para cubrir la nómina de <strong>${payrollRun.totalNetPayable.toLocaleString('es-CO')}</strong> serán debitados de la cuenta seleccionada e inyectados directamente al canal interbancario ACH Colombia para su acreditación inmediata.
                  </p>
                </div>
              </div>

              <label className="block text-xs font-black text-[#012d1d] uppercase tracking-wider">
                Cuentas Bancarias Registradas de la Finca
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BANK_ACCOUNTS_ORIGIN.map((bank) => {
                  const isSelected = selectedOriginBankId === bank.id;
                  const hasSufficient = bank.balance >= payrollRun.totalNetPayable;

                  return (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedOriginBankId(bank.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-white border-[#012d1d] ring-2 ring-[#012d1d]/20 shadow-lg'
                          : 'bg-white border-[#c1c8c2] hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{bank.logo}</span>
                          <div>
                            <h4 className="text-xs font-black text-[#012d1d]">{bank.bankName}</h4>
                            <p className="text-[11px] text-[#717973] font-mono">{bank.accountNumber} ({bank.accountType})</p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="bg-[#012d1d] text-[#ffba38] p-1 rounded-full">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[#717973] font-bold">Saldo Disponible:</span>
                        <span className={`font-mono font-black ${hasSufficient ? 'text-emerald-800' : 'text-rose-800'}`}>
                          ${bank.balance.toLocaleString('es-CO')}
                        </span>
                      </div>

                      {!hasSufficient && (
                        <div className="mt-1 text-[10px] text-rose-700 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Saldo insuficiente (se requerirá sobregiro/monto complementario)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#c1c8c2] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#012d1d]">Monto Neto Total de Nómina a Dispersar:</p>
                  <p className="text-2xl font-black text-emerald-900 font-mono">
                    ${payrollRun.totalNetPayable.toLocaleString('es-CO')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-[#012d1d] hover:bg-[#02402a] text-white font-black text-xs py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  Continuar a Revisión de Cuentas
                  <ArrowRight className="w-4 h-4 text-[#ffba38]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Review Destination Employee Accounts */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 flex items-start gap-3">
                <Users className="w-6 h-6 text-sky-800 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-950 space-y-1">
                  <p className="font-black text-sm">Paso 2: Verifica y Valida las Cuentas Destino de Empleados</p>
                  <p>
                    Revisa las entidades bancarias y números de cuenta de cada trabajador. Puedes ajustar los datos de cuenta directamente si hubo cambios antes de autenticar con el banco origen <strong>{originBank.bankName}</strong>.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border-2 border-[#c1c8c2] overflow-hidden shadow-sm p-4 space-y-3">
                <h3 className="text-xs font-black text-[#012d1d] uppercase tracking-wider">
                  Listado de Beneficiarios ({payrollRun.items.length} Trabajadores)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-[#f1f4f2] text-[11px] font-black text-[#012d1d] uppercase tracking-wider border-b border-[#c1c8c2]">
                        <th className="p-2.5">Empleado</th>
                        <th className="p-2.5">Banco Destino</th>
                        <th className="p-2.5">Número de Cuenta</th>
                        <th className="p-2.5 text-right">Neto a Dispersar</th>
                        <th className="p-2.5 text-center">Estado ACH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee] text-xs">
                      {payrollRun.items.map((item, idx) => {
                        const key = item.employeeId || item.employeeName;
                        const detail = itemBankDetails[key] || { bankName: 'Bancolombia', bankAccount: '' };

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <p className="font-black text-[#012d1d]">{item.employeeName}</p>
                              <p className="text-[10px] text-[#717973]">{item.role}</p>
                            </td>

                            <td className="p-2.5">
                              <select
                                value={detail.bankName}
                                onChange={(e) => handleBankDetailChange(key, 'bankName', e.target.value)}
                                className="p-1.5 rounded-lg border border-[#c1c8c2] bg-white text-xs font-bold text-[#012d1d]"
                              >
                                <option value="Bancolombia">Bancolombia</option>
                                <option value="Nequi">Nequi</option>
                                <option value="Daviplata">Daviplata</option>
                                <option value="Banco Agrario">Banco Agrario</option>
                                <option value="BBVA">BBVA Colombia</option>
                                <option value="Davivienda">Davivienda</option>
                                <option value="Banco de Bogotá">Banco de Bogotá</option>
                                <option value="Efectivo en Finca">Efectivo en Finca</option>
                              </select>
                            </td>

                            <td className="p-2.5">
                              <input
                                type="text"
                                value={detail.bankAccount}
                                onChange={(e) => handleBankDetailChange(key, 'bankAccount', e.target.value)}
                                className="p-1.5 rounded-lg border border-[#c1c8c2] bg-white text-xs font-mono font-bold text-[#012d1d] w-36"
                                placeholder="Num Cuenta"
                              />
                            </td>

                            <td className="p-2.5 text-right font-mono font-black text-emerald-900">
                              ${item.netPayable.toLocaleString('es-CO')}
                            </td>

                            <td className="p-2.5 text-center">
                              <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center justify-center gap-1 w-fit mx-auto">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                Validada ACH
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Security Token Input Card */}
              <div className="bg-white p-5 rounded-3xl border-2 border-[#ffba38] shadow-md space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#ffba38] text-[#012d1d] flex items-center justify-center font-black">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#012d1d]">
                      Autenticación de Seguridad Pasarela — Clave Dinámica / Token OTP
                    </h4>
                    <p className="text-[11px] text-[#717973]">
                      Ingresa la clave dinámica de la app empresarial de <strong>{originBank.bankName}</strong> para autorizar la dispersión masiva.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <div className="grow w-full">
                    <input
                      type="password"
                      maxLength={6}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Token 6 dígitos (ej. 123456)"
                      className="w-full p-3 rounded-2xl border-2 border-[#c1c8c2] font-mono text-center text-lg font-black tracking-widest text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setTokenInput('123456')}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs py-3 px-4 rounded-2xl cursor-pointer shrink-0"
                  >
                    ⚡ Auto-Llenar Token Demo
                  </button>
                </div>

                {tokenError && (
                  <p className="text-xs font-bold text-rose-700 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {tokenError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-slate-100 hover:bg-slate-200 text-[#012d1d] font-bold text-xs py-3 px-5 rounded-xl border border-slate-300 cursor-pointer"
                >
                  Regresar
                </button>

                <button
                  type="button"
                  onClick={handleStartDisbursement}
                  className="bg-[#ffba38] hover:bg-[#ffa000] text-[#012d1d] font-black text-xs py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Ejecutar Dispersión Masiva vía ACH (${payrollRun.totalNetPayable.toLocaleString('es-CO')})
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Animated Real-Time ACH Processing */}
          {step === 3 && (
            <div className="space-y-5 py-6 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#ffba38]/20 text-[#012d1d] border-2 border-[#ffba38] flex items-center justify-center mx-auto animate-bounce">
                <RefreshCw className="w-8 h-8 text-[#012d1d] animate-spin" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#012d1d]">
                  Procesando Dispersión ACH en Línea...
                </h3>
                <p className="text-xs text-[#717973]">
                  Conectando con la API Interbancaria de {originBank.bankName}... Lote <strong>{batchCus}</strong>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden p-0.5 border border-slate-300">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs font-mono font-black text-emerald-900">{progress}% Completado</p>
              </div>

              {/* Terminal Logs */}
              <div className="bg-[#012d1d] text-[#c1ecd4] p-4 rounded-2xl text-left font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5 shadow-inner border border-emerald-900">
                {processingLogs.map((log, i) => (
                  <p key={i} className="leading-tight">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Printable Receipt and Completion Confirmation */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-emerald-500 text-white rounded-3xl p-6 text-center space-y-2 shadow-lg">
                <div className="w-14 h-14 rounded-full bg-white text-emerald-900 flex items-center justify-center mx-auto font-black shadow-md">
                  <CheckCircle2 className="w-9 h-9 text-emerald-700" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  ¡Dispersión de Nómina Exitosa!
                </h3>
                <p className="text-xs text-emerald-100 max-w-md mx-auto">
                  Se acreditaron correctamente los sueldos netos a los {payrollRun.items.length} trabajadores de la finca. Se registró automáticamente el egreso financiero de nómina.
                </p>
              </div>

              {/* Batch Receipt Box */}
              <div className="bg-white p-5 rounded-3xl border-2 border-[#012d1d] shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="bg-[#012d1d] text-[#ffba38] text-[10px] font-mono font-black px-3 py-1 rounded-lg">
                      LOTE CUS ACH: {payrollRun.disbursementBatchCode || batchCus}
                    </span>
                    <h4 className="text-base font-black text-[#012d1d] mt-1">
                      Comprobante de Giro Masivo — {payrollRun.farmName}
                    </h4>
                    <p className="text-xs text-[#717973]">
                      Banco Emisor: {payrollRun.disbursementBank || originBank.bankName} | Fecha: {payrollRun.disbursementDate || new Date().toLocaleString('es-CO')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={safePrint}
                    className="bg-slate-100 hover:bg-slate-200 text-[#012d1d] font-bold text-xs py-2 px-4 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Printer className="w-4 h-4 text-emerald-800" />
                    Imprimir Comprobante
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <p className="text-[#717973] font-bold">Total Dispersado</p>
                    <p className="text-lg font-black text-emerald-900 font-mono mt-0.5">
                      ${payrollRun.totalNetPayable.toLocaleString('es-CO')}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <p className="text-[#717973] font-bold">Total Empleados</p>
                    <p className="text-lg font-black text-[#012d1d] mt-0.5">
                      {payrollRun.items.length} Beneficiarios
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
                    <p className="text-[#717973] font-bold">Egreso Registrado</p>
                    <p className="text-xs font-mono font-black text-emerald-900 mt-1 flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                      Módulo Finanzas Sync
                    </p>
                  </div>
                </div>

                {/* Dispersed Employees List */}
                <div className="space-y-2">
                  <p className="text-xs font-black text-[#012d1d] uppercase tracking-wider">
                    Detalle de Transferencias Individuales
                  </p>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border rounded-2xl bg-slate-50/50">
                    {payrollRun.items.map((item, idx) => {
                      const key = item.employeeId || item.employeeName;
                      const detail = itemBankDetails[key] || { bankName: 'Bancolombia', bankAccount: '' };

                      return (
                        <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-[#012d1d]">{item.employeeName}</p>
                            <p className="text-[10px] text-[#717973]">
                              {detail.bankName} {detail.bankAccount}
                            </p>
                          </div>
                          <div className="text-right font-mono">
                            <p className="font-black text-emerald-900">${item.netPayable.toLocaleString('es-CO')}</p>
                            <span className="text-[9px] text-emerald-700 font-bold">✔️ Exitoso</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#012d1d] hover:bg-[#02402a] text-white font-black text-xs py-3 px-8 rounded-2xl shadow-lg transition-all cursor-pointer"
                >
                  Finalizar & Cerrar Pasarela
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
