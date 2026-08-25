import React, { useState, useEffect } from 'react';
import {
  DairyRecord,
  RfidMilkingConfig,
  IndividualCowMilkingRecord,
  RfidChipStandard,
  MastitisRecord,
  WithdrawalAnimal,
} from '../../types';
import { DEFAULT_RFID_MILKING_CONFIG, INITIAL_MILKING_COWS_RFID } from '../../data/mockMilkingRfidData';
import { scaleSound } from '../../services/scaleSound';
import { MilkGlassIcon } from '../icons/MilkGlassIcon';
import {
  X,
  CheckCircle2,
  Radio,
  Sliders,
  Cpu,
  Wifi,
  Volume2,
  AlertTriangle,
  Play,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Check,
  Milk,
  ClipboardList,
  Zap,
  Info,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegisterMilkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: DairyRecord;
  onSaveMilking: (morning: number, evening: number, fat: number, protein: number) => void;
  mastitisRecords?: MastitisRecord[];
  withdrawalAnimals?: WithdrawalAnimal[];
}

export const RegisterMilkingModal: React.FC<RegisterMilkingModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onSaveMilking,
  mastitisRecords = [],
  withdrawalAnimals = [],
}) => {
  // Modal Navigation Tab
  const [activeTab, setActiveTab] = useState<'manual' | 'rfid_auto' | 'rfid_config'>('rfid_auto');

  // Manual Form States
  const [morningLiters, setMorningLiters] = useState<number>(currentData.morningLiters);
  const [eveningLiters, setEveningLiters] = useState<number>(currentData.eveningLiters);
  const [fatPct, setFatPct] = useState<number>(currentData.fatPct);
  const [proteinPct, setProteinPct] = useState<number>(currentData.proteinPct);
  const [somaticK, setSomaticK] = useState<number>(currentData.somaticCellCountK || 250);

  // RFID Configuration States
  const [rfidConfig, setRfidConfig] = useState<RfidMilkingConfig>(
    currentData.rfidConfig || DEFAULT_RFID_MILKING_CONFIG
  );

  // Cow Milking List with RFID Chapeta data
  const [cowList, setCowList] = useState<IndividualCowMilkingRecord[]>(
    currentData.cowMilkingList || INITIAL_MILKING_COWS_RFID
  );

  // Live Scanning Console States
  const [selectedCowForMilking, setSelectedCowForMilking] = useState<IndividualCowMilkingRecord | null>(null);
  const [scannedIndex, setScannedIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [manualSearchQuery, setManualSearchQuery] = useState<string>('');

  // New Cow Manual Entry State
  const [newCowTag, setNewCowTag] = useState<string>('');
  const [newCowName, setNewCowName] = useState<string>('');
  const [newCowEid, setNewCowEid] = useState<string>('');
  const [newCowStandard, setNewCowStandard] = useState<RfidChipStandard>('FDX-B');
  const [newCowMorningLiters, setNewCowMorningLiters] = useState<number>(15);

  // Helper to cross-reference active veterinary prescription & withdrawal period for a cow
  const checkCowPrescriptionWithdrawal = (cow: IndividualCowMilkingRecord) => {
    const cowTagUpper = cow.cowTag.toUpperCase();
    const tagClean = cowTagUpper.replace('VACA-', '').replace('#', '').trim();

    // 1. Check Mastitis Records with active withdrawal / prescription
    if (mastitisRecords && mastitisRecords.length > 0) {
      const activeMastitis = mastitisRecords.find((m) => {
        if (m.status === 'curado') return false;
        const mTagClean = m.cowTag.toUpperCase().replace('VACA-', '').replace('#', '').trim();
        return (
          mTagClean === tagClean ||
          cowTagUpper.includes(mTagClean) ||
          m.cowTag.toUpperCase().includes(tagClean) ||
          (Boolean(m.eidChip) && m.eidChip === cow.eidChip)
        );
      });

      if (activeMastitis) {
        return {
          isUnderWithdrawal: true,
          medication: activeMastitis.treatmentApplied || `Tratamiento Mastitis (${activeMastitis.testType})`,
          reason: `Mastitis ${activeMastitis.mastitisType.replace('_', ' ')} - Cuarto: ${Object.entries(activeMastitis.quartersAffected || {}).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(', ') || 'Infección unilateral'}`,
          veterinarian: activeMastitis.veterinarian || 'Dr. Médico Veterinario',
          daysRemaining: activeMastitis.withdrawalDays || 4,
          endDate: activeMastitis.withdrawalEndDate || 'Período activo',
        };
      }
    }

    // 2. Check Sanitario Withdrawal Animals list
    if (withdrawalAnimals && withdrawalAnimals.length > 0) {
      const activeWithdrawal = withdrawalAnimals.find((w) => {
        const wTagClean = w.tagId.toUpperCase().replace('VACA-', '').replace('#', '').trim();
        return wTagClean === tagClean || cowTagUpper.includes(wTagClean);
      });

      if (activeWithdrawal) {
        return {
          isUnderWithdrawal: true,
          medication: activeWithdrawal.medication,
          reason: activeWithdrawal.reason,
          veterinarian: 'Prescripción Veterinaria Activa',
          daysRemaining: activeWithdrawal.daysRemaining,
          endDate: 'Período activo',
        };
      }
    }

    // 3. Check existing medicine alert flag on the record
    if (cow.hasMedicineAlert) {
      return {
        isUnderWithdrawal: true,
        medication: cow.medicineNotes || 'Tratamiento por Antibiótico Prescrito',
        reason: 'Carencia farmacológica de leche activa',
        veterinarian: 'Veterinario Sanitario',
        daysRemaining: cow.prescriptionWithdrawalDaysRemaining || 3,
        endDate: cow.prescriptionEndDate || 'Período activo',
      };
    }

    return null;
  };

  // Synchronize cow list with active veterinary prescription withdrawal when modal is opened or props update
  useEffect(() => {
    if (!isOpen) return;

    setCowList((prevList) =>
      prevList.map((cow) => {
        const prescription = checkCowPrescriptionWithdrawal(cow);
        if (prescription) {
          const autoWithdrawEnabled = rfidConfig.autoPrescriptionWithdrawal !== false;
          const targetVol = cow.recordedMorningLiters > 0 ? cow.recordedMorningLiters : cow.targetMorningLiters || 18.0;

          return {
            ...cow,
            hasMedicineAlert: true,
            medicineNotes: `¡RETIRO AUTOMÁTICO VETERINARIO! ${prescription.medication} (${prescription.daysRemaining} días carencia restantes)`,
            prescriptionName: prescription.medication,
            prescriptionWithdrawalDaysRemaining: prescription.daysRemaining,
            prescriptionEndDate: prescription.endDate,
            recordedMorningLiters: autoWithdrawEnabled ? 0 : cow.recordedMorningLiters,
            withdrawnLiters: autoWithdrawEnabled ? targetVol : 0,
            status: 'retenido_antibiotico' as const,
          };
        }
        return cow;
      })
    );
  }, [isOpen, mastitisRecords, withdrawalAnimals, rfidConfig.autoPrescriptionWithdrawal]);

  if (!isOpen) return null;

  const totalCalculatedFromCows = cowList.reduce(
    (acc, cow) => acc + (cow.recordedMorningLiters || 0) + (cow.recordedEveningLiters || 0),
    0
  );

  const totalWithdrawnLiters = cowList.reduce(
    (acc, cow) => acc + (cow.withdrawnLiters || 0),
    0
  );

  const totalGrossLitersProduced = totalCalculatedFromCows + totalWithdrawnLiters;
  const cowsWithActiveWithdrawal = cowList.filter(
    (c) => c.hasMedicineAlert || (c.withdrawnLiters && c.withdrawnLiters > 0)
  );

  // Handle Manual Save
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMorning = activeTab === 'rfid_auto' && totalCalculatedFromCows > 0
      ? cowList.reduce((acc, c) => acc + (c.recordedMorningLiters || 0), 0) || morningLiters
      : morningLiters;

    const finalEvening = activeTab === 'rfid_auto' && totalCalculatedFromCows > 0
      ? cowList.reduce((acc, c) => acc + (c.recordedEveningLiters || 0), 0) || eveningLiters
      : eveningLiters;

    onSaveMilking(finalMorning, finalEvening, fatPct, proteinPct);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#012d1d', '#3f6653', '#ffba38'],
    });

    onClose();
  };

  // Simulate Scan RFID Ear Tag (Chapeta) with Automatic Veterinary Prescription Milk Withdrawal
  const handleSimulateRfidScan = () => {
    setIsScanning(true);
    const nextCow = cowList[scannedIndex % cowList.length];

    setTimeout(() => {
      const prescription = checkCowPrescriptionWithdrawal(nextCow);
      const autoWithdrawalActive = rfidConfig.autoPrescriptionWithdrawal !== false;

      if (prescription && autoWithdrawalActive) {
        if (rfidConfig.beepConfirmation) {
          scaleSound.playTareBeep(); // Warning acoustic alarm for medication withdrawal
        }

        const volProduced = nextCow.recordedMorningLiters > 0 
          ? nextCow.recordedMorningLiters 
          : nextCow.targetMorningLiters || 18.0;

        const updatedCow: IndividualCowMilkingRecord = {
          ...nextCow,
          chipStandard: rfidConfig.standard,
          scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasMedicineAlert: true,
          medicineNotes: `¡RETIRO AUTOMÁTICO EN FOSA! Prescripción: ${prescription.medication} (${prescription.daysRemaining} días carencia restantes)`,
          prescriptionName: prescription.medication,
          prescriptionWithdrawalDaysRemaining: prescription.daysRemaining,
          prescriptionEndDate: prescription.endDate,
          recordedMorningLiters: 0, // 0 Litros al tanque general
          withdrawnLiters: volProduced, // Leche desviada por electroválvula a balde de hospital
          status: 'retenido_antibiotico',
        };

        setCowList((prev) => prev.map((c) => (c.id === nextCow.id ? updatedCow : c)));
        setSelectedCowForMilking(updatedCow);
      } else {
        if (rfidConfig.beepConfirmation) {
          scaleSound.playRFIDChime(); // Normal success RFID sound
        }

        const autoLitersMorning = nextCow.recordedMorningLiters > 0 
          ? nextCow.recordedMorningLiters 
          : nextCow.targetMorningLiters;

        const updatedCow: IndividualCowMilkingRecord = {
          ...nextCow,
          chipStandard: rfidConfig.standard,
          scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recordedMorningLiters: autoLitersMorning,
          withdrawnLiters: 0,
          status: 'en_puesto',
        };

        setCowList((prev) => prev.map((c) => (c.id === nextCow.id ? updatedCow : c)));
        setSelectedCowForMilking(updatedCow);
      }

      setScannedIndex((prev) => prev + 1);
      setIsScanning(false);
    }, 600);
  };

  // Handle manual update of a cow's milk volume in table
  const handleUpdateCowLiters = (cowId: string, field: 'recordedMorningLiters' | 'recordedEveningLiters', val: number) => {
    setCowList((prev) =>
      prev.map((c) => {
        if (c.id === cowId) {
          const updated = { ...c, [field]: val, status: 'completado' as const };
          return updated;
        }
        return c;
      })
    );
  };

  // Add new cow to table
  const handleAddCustomCow = () => {
    if (!newCowTag) return;
    const eid = newCowEid || `982 000${Math.floor(100000000 + Math.random() * 900000000)}`;
    const newCow: IndividualCowMilkingRecord = {
      id: 'cow-custom-' + Date.now(),
      cowTag: newCowTag.toUpperCase(),
      eidChip: eid,
      chipStandard: newCowStandard,
      cowName: newCowName || `Vaca ${newCowTag}`,
      lactationDays: 60,
      stallsPuesto: 'Puesto Auto',
      targetMorningLiters: newCowMorningLiters,
      targetEveningLiters: Math.round(newCowMorningLiters * 0.8),
      recordedMorningLiters: newCowMorningLiters,
      recordedEveningLiters: 0,
      fatPct: 3.8,
      proteinPct: 3.2,
      somaticCellK: 180,
      hasMedicineAlert: false,
      status: 'completado',
      scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCowList([newCow, ...cowList]);
    setNewCowTag('');
    setNewCowName('');
    setNewCowEid('');
  };

  const filteredCowList = cowList.filter(
    (c) =>
      c.cowTag.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
      c.cowName.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
      c.eidChip.includes(manualSearchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-3xl max-w-5xl lg:max-w-6xl w-full border border-white/10 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#012d1d] via-[#02402a] to-[#15803d] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#D4A94E] text-white rounded-2xl shadow-sm">
              <MilkGlassIcon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black tracking-tight">
                  Control de Ordeño & Chapetas RFID
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold bg-white/20 text-[#A5B8AC] px-2 py-0.5 rounded-md border border-white/20">
                  {rfidConfig.standard} (ISO 11784)
                </span>
              </div>
              <p className="text-xs text-[#A5B8AC]/90">
                Configuración manual y automatizada por microchip (FDX-B / HDX 134.2 kHz)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Mode Navigation Bar */}
        <div className="bg-[#123F2A]/60 border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            {/* Auto RFID Mode Tab */}
            <button
              onClick={() => setActiveTab('rfid_auto')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rfid_auto'
                  ? 'bg-[#0D1A13] text-white shadow-sm'
                  : 'bg-[#15241C] text-[#414844] hover:bg-[#e0e8e3] border border-white/10'
              }`}
            >
              <Radio className={`w-4 h-4 ${activeTab === 'rfid_auto' ? 'text-[#ffba38] animate-pulse' : 'text-[#717973]'}`} />
              <span>Ordeño Automático RFID</span>
              <span className="text-[9.5px] font-mono bg-[#D4A94E] text-[#0D1A13] px-1.5 py-0.2 rounded-md font-bold">
                {rfidConfig.standard}
              </span>
            </button>

            {/* Manual Mode Tab */}
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-[#0D1A13] text-white shadow-sm'
                  : 'bg-[#15241C] text-[#414844] hover:bg-[#e0e8e3] border border-white/10'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-[#ffba38]" />
              <span>Planilla & Tanque Manual</span>
            </button>

            {/* Hardware & Standard Config Tab */}
            <button
              onClick={() => setActiveTab('rfid_config')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rfid_config'
                  ? 'bg-[#0D1A13] text-white shadow-sm'
                  : 'bg-[#15241C] text-[#414844] hover:bg-[#e0e8e3] border border-white/10'
              }`}
            >
              <Sliders className="w-4 h-4 text-[#ffba38]" />
              <span>Configuración Chapetas & Antena</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-white bg-[#e2efe8] px-2.5 py-1 rounded-lg border border-[#c1ecd4]">
            <Wifi className="w-3.5 h-3.5 text-[#15803d]" />
            <span>Lector: <b>{rfidConfig.readerBrand}</b> ({rfidConfig.connectionType.toUpperCase()})</span>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* ======================================================== */}
          {/* TAB 1: AUTOMATED RFID MILKING CONSOLE (CHAPETAS FDX-B / HDX) */}
          {/* ======================================================== */}
          {activeTab === 'rfid_auto' && (
            <div className="space-y-5">
              
              {/* Antena / Scanner Live Box */}
              <div className="bg-gradient-to-br from-[#012d1d] to-[#0a4731] text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-[#012d1d] relative overflow-hidden">
                <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
                  <Radio className="w-32 h-32 text-white" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-[#D4A94E] text-[#0D1A13] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        <Zap className="w-3 h-3 fill-current" />
                        Antena de Fosa / Paso Activa
                      </span>
                      <span className="text-[10px] font-mono text-[#A5B8AC]">
                        Estándar: <b>{rfidConfig.standard} (134.2 kHz ISO)</b>
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                      <span>Detección Automática por Chapeta Electrónica</span>
                    </h3>
                    <p className="text-xs text-[#A5B8AC]/80 max-w-xl">
                      Al pasar la vaca por la puerta o puesto de ordeño, la antena lee la chapeta RFID (chip {rfidConfig.standard}), la identifica y auto-registra la leche capturada por el flujómetro.
                    </p>
                  </div>

                  {/* Scan Trigger Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={handleSimulateRfidScan}
                      disabled={isScanning}
                      className="bg-[#D4A94E] hover:bg-[#ffdeac] text-[#0D1A13] font-black text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 uppercase tracking-wider"
                    >
                      <Radio className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                      <span>{isScanning ? 'Escaneando Chip...' : `Escanear Chapeta (${rfidConfig.standard})`}</span>
                    </button>
                  </div>
                </div>

                {/* Scanned Cow Result Card */}
                {selectedCowForMilking && (
                  <div className="mt-4 pt-4 border-t border-white/15 animate-in fade-in slide-in-from-top-2">
                    <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      selectedCowForMilking.hasMedicineAlert 
                        ? 'bg-red-950/90 border-red-500 text-red-100 shadow-md' 
                        : 'bg-white/10 border-white/20 text-white'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-xl shrink-0 ${selectedCowForMilking.hasMedicineAlert ? 'bg-red-600 text-white animate-bounce' : 'bg-[#D4A94E] text-[#0D1A13]'}`}>
                          {selectedCowForMilking.hasMedicineAlert ? <ShieldAlert className="w-6 h-6" /> : <Milk className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-sm">{selectedCowForMilking.cowTag}</span>
                            <span className="font-bold text-xs">({selectedCowForMilking.cowName})</span>
                            <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-[#ffba38]">
                              EID: {selectedCowForMilking.eidChip} [{selectedCowForMilking.chipStandard}]
                            </span>
                            {selectedCowForMilking.hasMedicineAlert && (
                              <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-current" />
                                Retiro Automático
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] opacity-90 mt-0.5">
                            Raza: <b>{selectedCowForMilking.breed || 'Lechera'}</b> • DEL: <b>{selectedCowForMilking.lactationDays} Días</b> • Puesto: <b>{selectedCowForMilking.stallsPuesto}</b>
                          </p>
                          {selectedCowForMilking.hasMedicineAlert && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-black text-red-200 bg-red-900/80 px-2.5 py-1 rounded-lg border border-red-500/50">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                                <span>{selectedCowForMilking.medicineNotes || '¡ALERTA DE RETIRO POR MEDICAMENTOS!'}</span>
                              </div>
                              <div className="text-[11px] text-red-200/90 font-mono pl-1">
                                🛑 <b>Acción Electroválvula:</b> 0 Litros al Tanque General. <b>{selectedCowForMilking.withdrawnLiters || selectedCowForMilking.targetMorningLiters || 18} Litros</b> derivados a balde hospitalario durante los días de prescripción.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 bg-white/10 p-2.5 rounded-xl border border-white/10 w-full sm:w-auto">
                        <span className="text-[10px] uppercase font-bold text-[#A5B8AC] block">Tanque General (Apta):</span>
                        <span className={`text-xl font-mono font-black ${selectedCowForMilking.hasMedicineAlert ? 'text-red-400 line-through' : 'text-[#ffba38]'}`}>
                          {selectedCowForMilking.recordedMorningLiters} Litros
                        </span>
                        {selectedCowForMilking.hasMedicineAlert && (
                          <span className="block text-[11px] font-mono font-bold text-red-300 mt-1">
                            Desviados: {selectedCowForMilking.withdrawnLiters || selectedCowForMilking.targetMorningLiters || 18} L
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Automated Milk Withdrawal Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#f0f7f4] border border-[#c1ecd4] rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-bold uppercase text-[#717973] block">Tanque General (Apta)</span>
                    <span className="text-lg font-mono font-black text-white">{totalCalculatedFromCows.toFixed(1)} L</span>
                  </div>
                  <div className="p-2 bg-[#e2efe8] text-[#15803d] rounded-xl font-mono text-[10px] font-bold">
                    100% Sin Antibiótico
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-bold uppercase text-red-800 block">Retirados por Prescripción</span>
                    <span className="text-lg font-mono font-black text-red-700">{totalWithdrawnLiters.toFixed(1)} L</span>
                  </div>
                  <div className="p-2 bg-red-100 text-red-800 rounded-xl font-mono text-[10px] font-bold">
                    Segregados / Hospital
                  </div>
                </div>

                <div className="bg-amber-950/30 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-bold uppercase text-amber-800 block">Vacas en Carencia Veterinaria</span>
                    <span className="text-lg font-mono font-black text-amber-900">{cowsWithActiveWithdrawal.length} Reses</span>
                  </div>
                  <div className="p-2 bg-amber-100 text-amber-900 rounded-xl font-mono text-[10px] font-bold">
                    Desvío Automático
                  </div>
                </div>
              </div>

              {/* Individual Cows RFID Milking Table */}
              <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#eeeeee]">
                  <div>
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span>Planilla de Vacas con Chapeta Electrónica</span>
                      <span className="text-[10px] font-mono bg-[#e2efe8] text-white px-2 py-0.5 rounded-md font-bold">
                        {cowList.length} Registradas
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#717973]">
                      Modifica manualmente o escanea el chip EID de cada res para actualizar el volumen.
                    </p>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#717973]" />
                    <input
                      type="text"
                      placeholder="Buscar por Caravana, Nombre o EID..."
                      value={manualSearchQuery}
                      onChange={(e) => setManualSearchQuery(e.target.value)}
                      className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#012d1d]"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#123F2A]/60 text-white font-bold text-[10.5px] uppercase border-b border-white/10">
                        <th className="p-2.5">Vaca / Caravana</th>
                        <th className="p-2.5">Chapeta RFID (EID ISO)</th>
                        <th className="p-2.5">Chip</th>
                        <th className="p-2.5 text-center">DEL</th>
                        <th className="p-2.5 text-right">Tanque (L)</th>
                        <th className="p-2.5 text-right">Retenido (L)</th>
                        <th className="p-2.5 text-center">Estado / Prescripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee] font-mono">
                      {filteredCowList.map((cow) => (
                        <tr key={cow.id} className={`hover:bg-[#f9fbf9] transition-colors ${cow.hasMedicineAlert ? 'bg-red-50/50' : ''}`}>
                          <td className="p-2.5">
                            <div className="font-sans font-extrabold text-white flex items-center gap-1.5">
                              <span>{cow.cowTag}</span>
                              {cow.hasMedicineAlert && (
                                <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded font-sans">
                                  Carencia
                                </span>
                              )}
                            </div>
                            <div className="font-sans text-[10px] text-[#717973]">{cow.cowName}</div>
                          </td>

                          <td className="p-2.5 text-[11px] text-[#2d6a4f] font-bold">
                            {cow.eidChip}
                          </td>

                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                              cow.chipStandard === 'FDX-B'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-purple-100 text-purple-900 border border-purple-300'
                            }`}>
                              {cow.chipStandard}
                            </span>
                          </td>

                          <td className="p-2.5 text-center text-[#414844]">
                            {cow.lactationDays} d
                          </td>

                          <td className="p-2.5 text-right">
                            <input
                              type="number"
                              step="0.1"
                              disabled={cow.hasMedicineAlert}
                              value={cow.recordedMorningLiters}
                              onChange={(e) => handleUpdateCowLiters(cow.id, 'recordedMorningLiters', Number(e.target.value))}
                              className={`w-16 border rounded-lg px-2 py-1 text-right font-bold focus:outline-none ${
                                cow.hasMedicineAlert 
                                  ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed' 
                                  : 'bg-[#f9f9f9] border-white/10 text-white focus:bg-[#15241C] focus:border-[#012d1d]'
                              }`}
                            />
                          </td>

                          <td className="p-2.5 text-right font-bold">
                            {cow.withdrawnLiters && cow.withdrawnLiters > 0 ? (
                              <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                                {cow.withdrawnLiters} L
                              </span>
                            ) : (
                              <span className="text-[#A5B8AC]">0 L</span>
                            )}
                          </td>

                          <td className="p-2.5 text-center font-sans">
                            {cow.hasMedicineAlert ? (
                              <span className="bg-red-100 text-red-800 text-[9.5px] font-bold px-2 py-1 rounded-md inline-flex items-center gap-1 border border-red-300" title={cow.medicineNotes}>
                                <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                Retiro Auto ({cow.prescriptionWithdrawalDaysRemaining || 3}d carencia)
                              </span>
                            ) : cow.recordedMorningLiters > 0 || cow.recordedEveningLiters > 0 ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-bold px-2 py-1 rounded-md inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Ordeñada (Apta)
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                                Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Custom Cow inline bar */}
                <div className="pt-3 border-t border-[#eeeeee] flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    Agregar Vaca con Chip RFID:
                  </span>

                  <input
                    type="text"
                    placeholder="Ej. VACA-205"
                    value={newCowTag}
                    onChange={(e) => setNewCowTag(e.target.value)}
                    className="w-28 bg-[#f9f9f9] border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Nombre (Opcional)"
                    value={newCowName}
                    onChange={(e) => setNewCowName(e.target.value)}
                    className="w-32 bg-[#f9f9f9] border border-white/10 rounded-xl px-2.5 py-1 text-xs focus:outline-none"
                  />

                  <input
                    type="text"
                    placeholder="EID (ISO 15 dígitos)"
                    value={newCowEid}
                    onChange={(e) => setNewCowEid(e.target.value)}
                    className="w-40 bg-[#f9f9f9] border border-white/10 rounded-xl px-2.5 py-1 text-xs font-mono focus:outline-none"
                  />

                  <select
                    value={newCowStandard}
                    onChange={(e) => setNewCowStandard(e.target.value as RfidChipStandard)}
                    className="bg-[#f9f9f9] border border-white/10 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none"
                  >
                    <option value="FDX-B">FDX-B</option>
                    <option value="HDX">HDX</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddCustomCow}
                    className="bg-[#0D1A13] hover:bg-[#15803d] text-white font-bold text-xs px-3 py-1 rounded-xl transition-colors cursor-pointer"
                  >
                    + Registrar Res
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MANUAL MILKING & TANK CONTROL */}
          {/* ======================================================== */}
          {activeTab === 'manual' && (
            <div className="space-y-5">
              <div className="bg-[#f0f7f4] border border-[#c1ecd4] p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Milk className="w-4 h-4 text-[#ffba38]" />
                  <span>Control de Volumen General de Tanque</span>
                </h4>
                <p className="text-xs text-[#414844]">
                  Ingresa directamente los litros ordeñados en el tanque de enfriamiento para el turno de mañana y tarde.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-2xs space-y-2">
                  <label className="block text-[11px] font-bold text-[#79564b] uppercase">
                    Turno Mañana - Tanque (Litros)
                  </label>
                  <input
                    type="number"
                    value={morningLiters}
                    onChange={(e) => setMorningLiters(Number(e.target.value))}
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-[#012d1d]"
                    required
                  />
                </div>

                <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-2xs space-y-2">
                  <label className="block text-[11px] font-bold text-[#79564b] uppercase">
                    Turno Tarde - Tanque (Litros)
                  </label>
                  <input
                    type="number"
                    value={eveningLiters}
                    onChange={(e) => setEveningLiters(Number(e.target.value))}
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-[#012d1d]"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-[#f3f3f3] rounded-2xl border border-white/10 flex justify-between items-center font-bold">
                <span className="text-[#414844] text-xs">Total Producción Diaria Consolidada:</span>
                <span className="font-mono text-lg text-white">
                  {(morningLiters + eveningLiters).toLocaleString()} Litros
                </span>
              </div>

              {/* Solids & Somatic cells */}
              <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-2xs space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Calidad de Leche & Análisis de Laboratorio
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Grasa Butírica (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={fatPct}
                      onChange={(e) => setFatPct(Number(e.target.value))}
                      className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Proteína Verdadera (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={proteinPct}
                      onChange={(e) => setProteinPct(Number(e.target.value))}
                      className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Células Somáticas RCS (Miles/mL)
                    </label>
                    <input
                      type="number"
                      value={somaticK}
                      onChange={(e) => setSomaticK(Number(e.target.value))}
                      className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: RFID HARDWARE & CHIP STANDARD CONFIGURATION */}
          {/* ======================================================== */}
          {activeTab === 'rfid_config' && (
            <div className="space-y-5">
              
              {/* Chip Standard Technical Selector (FDX-B vs HDX) */}
              <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#eeeeee] pb-3">
                  <Cpu className="w-5 h-5 text-[#2d6a4f]" />
                  <div>
                    <h4 className="font-extrabold text-white text-sm">
                      Selección del Estándar de Chapeta RFID (Chip ISO 11784 / ISO 11785)
                    </h4>
                    <p className="text-[11px] text-[#717973]">
                      Define la tecnología de transpondedor RFID utilizada en las caravanas o orejeras electrónicas del hato.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* FDX-B Standard Option */}
                  <div
                    onClick={() => setRfidConfig({ ...rfidConfig, standard: 'FDX-B' })}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                      rfidConfig.standard === 'FDX-B'
                        ? 'border-[#012d1d] bg-[#f0f7f4] shadow-sm'
                        : 'border-white/10 bg-[#15241C] hover:border-[#2d6a4f]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-white uppercase flex items-center gap-2">
                        <span>FDX-B (Full Duplex)</span>
                        <span className="text-[9.5px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                          134.2 kHz
                        </span>
                      </span>
                      {rfidConfig.standard === 'FDX-B' && (
                        <CheckCircle2 className="w-5 h-5 text-[#15803d]" />
                      )}
                    </div>
                    <p className="text-xs text-[#414844] leading-relaxed">
                      Transmisión continua e instantánea en cuanto el chip entra al campo de la antena. Estándar mundial ISO para ganado lechero.
                    </p>
                    <div className="pt-2 border-t border-[#c1ecd4]/60 text-[10.5px] font-mono text-white">
                      Código ISO: <b>15 dígitos continuos (ej. 982 000184910293)</b>
                    </div>
                  </div>

                  {/* HDX Standard Option */}
                  <div
                    onClick={() => setRfidConfig({ ...rfidConfig, standard: 'HDX' })}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                      rfidConfig.standard === 'HDX'
                        ? 'border-[#012d1d] bg-[#f0f7f4] shadow-sm'
                        : 'border-white/10 bg-[#15241C] hover:border-[#2d6a4f]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-white uppercase flex items-center gap-2">
                        <span>HDX (Half Duplex)</span>
                        <span className="text-[9.5px] font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
                          134.2 kHz Carga
                        </span>
                      </span>
                      {rfidConfig.standard === 'HDX' && (
                        <CheckCircle2 className="w-5 h-5 text-[#15803d]" />
                      )}
                    </div>
                    <p className="text-xs text-[#414844] leading-relaxed">
                      Almacena energía en un condensador de carga y emite una señal de mayor potencia. Ideal para salas de ordeño con interferencia de motores.
                    </p>
                    <div className="pt-2 border-t border-[#c1ecd4]/60 text-[10.5px] font-mono text-white">
                      Código ISO: <b>15 dígitos de alto rango (ej. 985 000294019281)</b>
                    </div>
                  </div>

                </div>
              </div>

              {/* Hardware Reader Brand & Connection */}
              <div className="bg-[#15241C] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#ffba38]" />
                  <span>Equipo Lector / Antena de Sala de Ordeño</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">
                      Marca / Protocolo de Lector RFID
                    </label>
                    <select
                      value={rfidConfig.readerBrand}
                      onChange={(e) => setRfidConfig({ ...rfidConfig, readerBrand: e.target.value as any })}
                      className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#012d1d]"
                    >
                      <option value="Tru-Test">Tru-Test (SRS2 / XRS2 / Antena Fosa)</option>
                      <option value="Allflex">Allflex (Lector RS480 / Stick Reader)</option>
                      <option value="Gallagher">Gallagher (HR5 / TWR Series / Panel)</option>
                      <option value="Panel DeLaval">DeLaval (Panel Puesto Ordeño / ALPRO)</option>
                      <option value="Panel Afimilk">Afimilk (Antena AfiPass / Parlor Gate)</option>
                      <option value="Datamars">Datamars / TracKing</option>
                      <option value="Agrident">Agrident APR600</option>
                      <option value="Genérica ISO 11784">Lector Genérico ISO 11784 (USB / Serial)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#717973] uppercase mb-1">
                      Tipo de Conexión
                    </label>
                    <select
                      value={rfidConfig.connectionType}
                      onChange={(e) => setRfidConfig({ ...rfidConfig, connectionType: e.target.value as any })}
                      className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#012d1d]"
                    >
                      <option value="bluetooth">Bluetooth LE (Bajo Consumo)</option>
                      <option value="wifi">Wi-Fi TCP/IP (Red Local de Fosa)</option>
                      <option value="serial">Serie RS-232 / RS-485</option>
                      <option value="usb_baston">USB Directo (Bastón / Stick)</option>
                    </select>
                  </div>
                </div>

                {/* Automation Toggles */}
                <div className="pt-3 border-t border-[#eeeeee] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f9f9f9] border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rfidConfig.autoCaptureMilk}
                      onChange={(e) => setRfidConfig({ ...rfidConfig, autoCaptureMilk: e.target.checked })}
                      className="w-4 h-4 accent-[#012d1d] rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-white block">Auto-captura Flujómetro</span>
                      <span className="text-[10px] text-[#717973]">Lee automáticamente los litros del medidor de leche</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f9f9f9] border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rfidConfig.beepConfirmation}
                      onChange={(e) => setRfidConfig({ ...rfidConfig, beepConfirmation: e.target.checked })}
                      className="w-4 h-4 accent-[#012d1d] rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-white block">Confirmación Sonora (Beep)</span>
                      <span className="text-[10px] text-[#717973]">Emite tono acústico al detectar la chapeta</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f9f9f9] border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rfidConfig.withholdingAlert}
                      onChange={(e) => setRfidConfig({ ...rfidConfig, withholdingAlert: e.target.checked })}
                      className="w-4 h-4 accent-red-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-red-900 block">Alerta de Medicamentos (Fosa)</span>
                      <span className="text-[10px] text-[#717973]">Alerta sonora/visual si la res tiene retiro farmacológico</span>
                    </div>
                  </label>

                  <div className="p-3 rounded-xl bg-[#f9f9f9] border border-white/10 flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Anti-Duplicado Antena:</span>
                    <select
                      value={rfidConfig.antiDuplicateSeconds}
                      onChange={(e) => setRfidConfig({ ...rfidConfig, antiDuplicateSeconds: Number(e.target.value) })}
                      className="bg-[#15241C] border border-white/10 rounded-lg px-2 py-1 text-xs font-bold"
                    >
                      <option value={10}>10 seg</option>
                      <option value={15}>15 seg</option>
                      <option value={30}>30 seg</option>
                      <option value={60}>60 seg</option>
                    </select>
                  </div>

                  {/* Automated Milk Withdrawal Toggle */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={rfidConfig.autoPrescriptionWithdrawal !== false}
                      onChange={(e) => setRfidConfig({ ...rfidConfig, autoPrescriptionWithdrawal: e.target.checked })}
                      className="w-4 h-4 accent-red-600 rounded mt-0.5"
                    />
                    <div>
                      <span className="font-extrabold text-xs text-red-950 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Retiro Automático por Prescripción Veterinaria (Días de Carencia)</span>
                      </span>
                      <span className="text-[10.5px] text-red-800/90 block mt-1 leading-relaxed">
                        Al detectar por chip RFID a una res con tratamiento activo (Mastitis o Prescripción Veterinaria), la electroválvula de fosa asigna <b>0 Litros al tanque general</b> y deriva el 100% de la leche a balde de hospital/descarte durante todos los días indicados en la prescripción médica.
                      </span>
                    </div>
                  </label>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#123F2A]/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#414844] font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2d6a4f]" />
            <span>
              Total Leche Consolidada: <b>{
                activeTab === 'rfid_auto' && totalCalculatedFromCows > 0
                  ? totalCalculatedFromCows.toLocaleString()
                  : (morningLiters + eveningLiters).toLocaleString()
              } Litros</b>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#15241C] border border-white/10 text-[#414844] hover:bg-[#e0e8e3] font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-[#D4A94E] hover:bg-[#ffdeac] text-[#0D1A13] font-black rounded-xl text-xs flex items-center justify-center gap-2 tactical-shadow transition-all cursor-pointer uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Registro de Ordeño</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
