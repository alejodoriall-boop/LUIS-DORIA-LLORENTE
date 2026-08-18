import React, { useState, useMemo } from 'react';
import {
  SanitaryProtocol,
  SanitaryApplicationRecord,
  SanitaryCategory,
  SanitaryFrequency,
  SanitaryStatus,
  WithdrawalAnimal,
  FarmDataPackage,
  LotRecord,
} from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Download,
  Share2,
  Printer,
  Search,
  Filter,
  X,
  ChevronRight,
  FileText,
  Check,
  AlertCircle,
  Pill,
  Droplet,
  Layers,
  Building,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

export interface SanitaryPlanSavedPayload {
  action: 'protocol_created' | 'protocol_updated' | 'protocol_deleted' | 'application_registered' | 'withdrawal_updated';
  protocols: SanitaryProtocol[];
  applications: SanitaryApplicationRecord[];
  withdrawalAnimals: WithdrawalAnimal[];
  newApplication?: SanitaryApplicationRecord;
}

interface SanitaryPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocols: SanitaryProtocol[];
  onUpdateProtocols?: (protocols: SanitaryProtocol[]) => void;
  applications: SanitaryApplicationRecord[];
  onUpdateApplications?: (applications: SanitaryApplicationRecord[]) => void;
  withdrawalAnimals: WithdrawalAnimal[];
  onUpdateWithdrawalAnimals?: (animals: WithdrawalAnimal[]) => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  lots?: LotRecord[];
  onSaveSanitaryPayload?: (payload: SanitaryPlanSavedPayload) => void;
  onSaveData?: (payload: SanitaryPlanSavedPayload) => void;
  initialTab?: 'protocols' | 'apply' | 'withdrawals' | 'history';
}

const CATEGORY_CONFIG: Record<
  SanitaryCategory,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  vacunacion_oficial: {
    label: 'Vacunación Oficial ICA',
    bg: 'bg-red-50 text-red-700',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: '💉',
  },
  vacunacion_reproductiva: {
    label: 'Vacuna Reproductiva (IATF)',
    bg: 'bg-pink-50 text-pink-700',
    text: 'text-pink-700',
    border: 'border-pink-200',
    icon: '🧬',
  },
  clostridiosis: {
    label: 'Clostridiosis (Polivalente)',
    bg: 'bg-amber-50 text-amber-800',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: '🛡️',
  },
  control_parasitario: {
    label: 'Control Parasitario / Purga',
    bg: 'bg-emerald-50 text-emerald-800',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: '🪱',
  },
  vitaminas_minerales: {
    label: 'Vitaminas & Minerales',
    bg: 'bg-blue-50 text-blue-700',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: '⚡',
  },
  podologia: {
    label: 'Podología & Pezuñas',
    bg: 'bg-purple-50 text-purple-700',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: '🦶',
  },
  diagnostico_pruebas: {
    label: 'Diagnósticos & Pruebas Oficiales',
    bg: 'bg-indigo-50 text-indigo-700',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: '🔬',
  },
  tratamiento_especifico: {
    label: 'Tratamiento Curativo / Fármacos',
    bg: 'bg-orange-50 text-orange-800',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: '💊',
  },
};

const FREQUENCY_LABELS: Record<SanitaryFrequency, string> = {
  anual: 'Anual (Cada 12 meses)',
  semestral: 'Semestral (Ciclos ICA)',
  trimestral: 'Trimestral (Cada 3 meses)',
  mensual: 'Mensual',
  al_destete: 'Al Destete (3-8 meses)',
  al_nacer: 'Al Nacer (Primeros días)',
  al_secado: 'Al Secado (60 días pre-parto)',
  pre_servicio: 'Pre-Servicio / Pre-IATF (30 días antes)',
  estrategica: 'Estratégica / Por Época Climática',
  unica: 'Única Vez',
};

export const SanitaryPlanModal: React.FC<SanitaryPlanModalProps> = ({
  isOpen,
  onClose,
  protocols,
  onUpdateProtocols,
  applications,
  onUpdateApplications,
  withdrawalAnimals,
  onUpdateWithdrawalAnimals,
  farms,
  currentFarmId,
  lots = [],
  onSaveSanitaryPayload,
  initialTab = 'protocols',
}) => {
  const [activeTab, setActiveTab] = useState<'protocols' | 'apply' | 'withdrawals' | 'history'>(initialTab);

  // Filter & Search States
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected farm
  const [selectedFarm, setSelectedFarm] = useState<string>(
    currentFarmId === 'all' ? farms[0]?.profile.id || 'finca-1' : currentFarmId
  );

  // Active Farm Profile
  const activeFarmProfile = useMemo(() => {
    return farms.find((f) => f.profile.id === selectedFarm)?.profile || farms[0]?.profile || {
      id: 'finca-1',
      name: 'Hacienda La Gloria',
      location: 'Montería, Córdoba',
      totalArea: 250,
      totalCattle: 320,
    };
  }, [farms, selectedFarm]);

  // Protocol Modal / Drawer Form State
  const [isProtocolFormOpen, setIsProtocolFormOpen] = useState(false);
  const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null);

  const initialProtocolForm = {
    name: '',
    category: 'vacunacion_oficial' as SanitaryCategory,
    targetGroup: 'Todo el Hato Bovino',
    frequency: 'semestral' as SanitaryFrequency,
    productName: '',
    activeIngredient: '',
    laboratory: '',
    dosage: '2.0 ml por animal',
    route: 'subcutanea' as SanitaryProtocol['route'],
    meatWithdrawalDays: 0,
    milkWithdrawalHoursOrDays: 0,
    costPerDose: 0,
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'programado' as SanitaryStatus,
    icaRegistration: '',
    batchNumber: '',
    veterinarian: '',
    notes: '',
    autoCreateWithdrawal: false,
  };

  const [protocolFormData, setProtocolFormData] = useState(initialProtocolForm);

  // Application Form State
  const initialAppForm = {
    protocolId: '',
    date: new Date().toISOString().split('T')[0],
    treatmentName: '',
    category: 'vacunacion_oficial' as SanitaryCategory,
    productName: '',
    laboratory: '',
    batchNumber: '',
    icaRegistration: '',
    dosage: '2.0 ml',
    route: 'Subcutánea',
    targetLotOrGroup: 'Lote 1',
    headcount: 1,
    meatWithdrawalDays: 0,
    milkWithdrawalDays: 0,
    costPerHead: 0,
    registerExpense: true,
    veterinarian: 'Dr. Roberto Mendoza',
    vetLicense: 'TP-18920',
    notes: '',
    adverseReactions: 'Ninguna observada. Aplicación normal.',
  };

  const [appFormData, setAppFormData] = useState(initialAppForm);

  // Manual Withdrawal Modal State
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState(false);
  const [withdrawalFormData, setWithdrawalFormData] = useState({
    tagId: '',
    name: '',
    medication: '',
    appliedDate: new Date().toISOString().split('T')[0],
    withdrawalDays: 28,
    reason: '',
    lot: 'Lote General',
  });

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showLocalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Pre-fill application form when clicking "⚡ Aplicar / Vacunar" on a protocol
  const handleStartApplicationFromProtocol = (prot: SanitaryProtocol) => {
    setAppFormData({
      protocolId: prot.id,
      date: new Date().toISOString().split('T')[0],
      treatmentName: prot.name,
      category: prot.category,
      productName: prot.productName,
      laboratory: prot.laboratory || '',
      batchNumber: prot.batchNumber || '',
      icaRegistration: prot.icaRegistration || '',
      dosage: prot.dosage,
      route: prot.route === 'subcutanea' ? 'Subcutánea' : prot.route === 'intramuscular' ? 'Intramuscular' : prot.route === 'oral' ? 'Oral' : 'Tópica / Pour-on',
      targetLotOrGroup: prot.targetGroup,
      headcount: 25,
      meatWithdrawalDays: prot.meatWithdrawalDays,
      milkWithdrawalDays: prot.milkWithdrawalHoursOrDays,
      costPerHead: prot.costPerDose || 0,
      registerExpense: (prot.costPerDose || 0) > 0,
      veterinarian: prot.veterinarian || 'Dr. Roberto Mendoza',
      vetLicense: 'TP-18920',
      notes: prot.notes || '',
      adverseReactions: 'Ninguna observada.',
    });
    setActiveTab('apply');
  };

  // Open Protocol Form (Create or Edit)
  const handleOpenCreateProtocol = () => {
    setEditingProtocolId(null);
    setProtocolFormData({
      ...initialProtocolForm,
      scheduledDate: new Date().toISOString().split('T')[0],
    });
    setIsProtocolFormOpen(true);
  };

  const handleOpenEditProtocol = (prot: SanitaryProtocol) => {
    setEditingProtocolId(prot.id);
    setProtocolFormData({
      name: prot.name,
      category: prot.category,
      targetGroup: prot.targetGroup,
      frequency: prot.frequency,
      productName: prot.productName,
      activeIngredient: prot.activeIngredient || '',
      laboratory: prot.laboratory || '',
      dosage: prot.dosage,
      route: prot.route,
      meatWithdrawalDays: prot.meatWithdrawalDays,
      milkWithdrawalHoursOrDays: prot.milkWithdrawalHoursOrDays,
      costPerDose: prot.costPerDose,
      scheduledDate: prot.scheduledDate,
      status: prot.status,
      icaRegistration: prot.icaRegistration || '',
      batchNumber: prot.batchNumber || '',
      veterinarian: prot.veterinarian || '',
      notes: prot.notes || '',
      autoCreateWithdrawal: prot.autoCreateWithdrawal || false,
    });
    setIsProtocolFormOpen(true);
  };

  // Save Protocol (Create or Update)
  const handleSaveProtocolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolFormData.name.trim() || !protocolFormData.productName.trim()) {
      showLocalToast('⚠️ Por favor ingresa el nombre del protocolo y el producto biológico.');
      return;
    }

    let updatedProtocols: SanitaryProtocol[];

    if (editingProtocolId) {
      updatedProtocols = protocols.map((p) =>
        p.id === editingProtocolId
          ? {
              ...p,
              ...protocolFormData,
              nextScheduledDate: protocolFormData.scheduledDate,
            }
          : p
      );
      showLocalToast(`✅ Protocolo "${protocolFormData.name}" actualizado con éxito.`);
    } else {
      const newProtocol: SanitaryProtocol = {
        id: `prot-${Date.now()}`,
        farmId: selectedFarm,
        ...protocolFormData,
        nextScheduledDate: protocolFormData.scheduledDate,
      };
      updatedProtocols = [newProtocol, ...protocols];
      showLocalToast(`✅ Nuevo protocolo "${protocolFormData.name}" creado con éxito.`);
    }

    onUpdateProtocols(updatedProtocols);
    setIsProtocolFormOpen(false);

    if (onSaveSanitaryPayload) {
      onSaveSanitaryPayload({
        action: editingProtocolId ? 'protocol_updated' : 'protocol_created',
        protocols: updatedProtocols,
        applications,
        withdrawalAnimals,
      });
    }
  };

  // Delete Protocol
  const handleDeleteProtocol = (id: string) => {
    const target = protocols.find((p) => p.id === id);
    if (!target) return;
    if (confirm(`¿Estás seguro de eliminar el protocolo sanitario "${target.name}"?`)) {
      const updated = protocols.filter((p) => p.id !== id);
      onUpdateProtocols(updated);
      showLocalToast(`🗑️ Protocolo "${target.name}" eliminado.`);
      if (onSaveSanitaryPayload) {
        onSaveSanitaryPayload({
          action: 'protocol_deleted',
          protocols: updated,
          applications,
          withdrawalAnimals,
        });
      }
    }
  };

  // Fast Complete Protocol & Schedule Next
  const handleFastCompleteProtocol = (prot: SanitaryProtocol) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Compute next date based on frequency
    const nextDate = new Date(today);
    if (prot.frequency === 'anual') nextDate.setFullYear(nextDate.getFullYear() + 1);
    else if (prot.frequency === 'semestral') nextDate.setMonth(nextDate.getMonth() + 6);
    else if (prot.frequency === 'trimestral') nextDate.setMonth(nextDate.getMonth() + 3);
    else if (prot.frequency === 'mensual') nextDate.setMonth(nextDate.getMonth() + 1);
    else nextDate.setMonth(nextDate.getMonth() + 6);

    const nextDateStr = nextDate.toISOString().split('T')[0];

    const updatedProtocols = protocols.map((p) =>
      p.id === prot.id
        ? {
            ...p,
            status: 'completado' as SanitaryStatus,
            lastAppliedDate: todayStr,
            nextScheduledDate: nextDateStr,
            scheduledDate: nextDateStr,
          }
        : p
    );

    onUpdateProtocols(updatedProtocols);
    showLocalToast(`✅ Protocolo "${prot.name}" marcado como completado. Próxima fecha: ${nextDateStr}`);

    if (onSaveSanitaryPayload) {
      onSaveSanitaryPayload({
        action: 'protocol_updated',
        protocols: updatedProtocols,
        applications,
        withdrawalAnimals,
      });
    }
  };

  // Submit Application Record
  const handleSaveApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appFormData.treatmentName.trim() || !appFormData.productName.trim()) {
      showLocalToast('⚠️ Por favor completa el tratamiento y el producto aplicado.');
      return;
    }

    const totalCost = (appFormData.costPerHead || 0) * (appFormData.headcount || 1);

    const newAppRecord: SanitaryApplicationRecord = {
      id: `app-${Date.now()}`,
      protocolId: appFormData.protocolId || undefined,
      farmId: selectedFarm,
      farmName: activeFarmProfile.name,
      date: appFormData.date,
      treatmentName: appFormData.treatmentName,
      category: appFormData.category,
      productName: appFormData.productName,
      laboratory: appFormData.laboratory,
      batchNumber: appFormData.batchNumber,
      icaRegistration: appFormData.icaRegistration,
      dosage: appFormData.dosage,
      route: appFormData.route,
      targetLotOrGroup: appFormData.targetLotOrGroup,
      headcount: Number(appFormData.headcount) || 1,
      meatWithdrawalDays: Number(appFormData.meatWithdrawalDays) || 0,
      milkWithdrawalDays: Number(appFormData.milkWithdrawalDays) || 0,
      costPerHead: Number(appFormData.costPerHead) || 0,
      totalCost: totalCost,
      veterinarian: appFormData.veterinarian,
      vetLicense: appFormData.vetLicense,
      notes: appFormData.notes,
      adverseReactions: appFormData.adverseReactions,
    };

    const updatedApps = [newAppRecord, ...applications];
    onUpdateApplications(updatedApps);

    // If meat or milk withdrawal > 0, auto-register withdrawal entry
    let updatedWithdrawals = [...withdrawalAnimals];
    if (newAppRecord.meatWithdrawalDays > 0 || newAppRecord.milkWithdrawalDays > 0) {
      const maxWithdrawal = Math.max(newAppRecord.meatWithdrawalDays, newAppRecord.milkWithdrawalDays);
      const newWithdrawalEntry: WithdrawalAnimal = {
        id: `w-${Date.now()}`,
        tagId: `LOTE-${appFormData.targetLotOrGroup.replace(/\s+/g, '-').toUpperCase()}`,
        name: `${appFormData.targetLotOrGroup} (${appFormData.headcount} cabezas)`,
        medication: `${appFormData.productName} (${appFormData.dosage})`,
        appliedDate: appFormData.date,
        withdrawalDays: maxWithdrawal,
        daysRemaining: maxWithdrawal,
        reason: `${appFormData.treatmentName} - ${appFormData.notes || 'Aplicación sanitaria'}`,
        lot: appFormData.targetLotOrGroup,
      };
      updatedWithdrawals = [newWithdrawalEntry, ...updatedWithdrawals];
      onUpdateWithdrawalAnimals(updatedWithdrawals);
    }

    // Also update protocol lastAppliedDate if associated
    let updatedProtocols = [...protocols];
    if (appFormData.protocolId) {
      updatedProtocols = protocols.map((p) => {
        if (p.id === appFormData.protocolId) {
          const nextD = new Date(appFormData.date);
          if (p.frequency === 'anual') nextD.setFullYear(nextD.getFullYear() + 1);
          else if (p.frequency === 'semestral') nextD.setMonth(nextD.getMonth() + 6);
          else if (p.frequency === 'trimestral') nextD.setMonth(nextD.getMonth() + 3);
          else if (p.frequency === 'mensual') nextD.setMonth(nextD.getMonth() + 1);
          else nextD.setMonth(nextD.getMonth() + 6);

          return {
            ...p,
            lastAppliedDate: appFormData.date,
            nextScheduledDate: nextD.toISOString().split('T')[0],
            status: 'completado' as SanitaryStatus,
          };
        }
        return p;
      });
      onUpdateProtocols(updatedProtocols);
    }

    showLocalToast(`✅ Jornada Sanitaria guardada exitosamente (${appFormData.headcount} cabezas tratadas).`);
    setActiveTab('history');

    if (onSaveSanitaryPayload) {
      onSaveSanitaryPayload({
        action: 'application_registered',
        protocols: updatedProtocols,
        applications: updatedApps,
        withdrawalAnimals: updatedWithdrawals,
        newApplication: newAppRecord,
      });
    }
  };

  // Release animal from withdrawal
  const handleReleaseWithdrawal = (id: string) => {
    const item = withdrawalAnimals.find((w) => w.id === id);
    if (!item) return;
    if (confirm(`¿Confirmas dar de alta y liberar a ${item.name} (${item.tagId}) del tiempo de retiro?`)) {
      const updated = withdrawalAnimals.filter((w) => w.id !== id);
      onUpdateWithdrawalAnimals(updated);
      showLocalToast(`🕊️ ${item.name} ha sido liberado de tiempo de retiro.`);
      if (onSaveSanitaryPayload) {
        onSaveSanitaryPayload({
          action: 'withdrawal_updated',
          protocols,
          applications,
          withdrawalAnimals: updated,
        });
      }
    }
  };

  // Add Manual Withdrawal
  const handleSaveManualWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalFormData.tagId.trim() || !withdrawalFormData.medication.trim()) {
      showLocalToast('⚠️ Por favor ingresa el arete/nombre y el medicamento aplicado.');
      return;
    }

    const newW: WithdrawalAnimal = {
      id: `w-${Date.now()}`,
      tagId: withdrawalFormData.tagId,
      name: withdrawalFormData.name || `Bovino ${withdrawalFormData.tagId}`,
      medication: withdrawalFormData.medication,
      appliedDate: withdrawalFormData.appliedDate,
      withdrawalDays: Number(withdrawalFormData.withdrawalDays) || 1,
      daysRemaining: Number(withdrawalFormData.withdrawalDays) || 1,
      reason: withdrawalFormData.reason || 'Tratamiento clínico farmacológico',
      lot: withdrawalFormData.lot || 'Lote General',
    };

    const updated = [newW, ...withdrawalAnimals];
    onUpdateWithdrawalAnimals(updated);
    setIsWithdrawalFormOpen(false);
    showLocalToast(`✅ Animal ${newW.tagId} agregado al control de retiros.`);

    if (onSaveSanitaryPayload) {
      onSaveSanitaryPayload({
        action: 'withdrawal_updated',
        protocols,
        applications,
        withdrawalAnimals: updated,
      });
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Fecha', 'Tratamiento', 'Categoría', 'Producto', 'Lote/Grupo', 'Cabezas', 'Retiro Carne (d)', 'Retiro Leche (d)', 'Costo Total', 'Veterinario'];
    const rows = applications.map((a) => [
      a.date,
      `"${a.treatmentName}"`,
      `"${a.category}"`,
      `"${a.productName}"`,
      `"${a.targetLotOrGroup}"`,
      a.headcount,
      a.meatWithdrawalDays,
      a.milkWithdrawalDays,
      a.totalCost || 0,
      `"${a.veterinarian}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Plan_Sanitario_${activeFarmProfile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showLocalToast('📥 Archivo CSV descargado con éxito.');
  };

  // WhatsApp Share Schedule
  const handleShareWhatsApp = () => {
    const urgentOrUpcoming = protocols.filter((p) => p.status === 'urgente' || p.status === 'programado');
    let text = `📋 *PLAN SANITARIO & VACUNACIÓN - ${activeFarmProfile.name.toUpperCase()}*\n`;
    text += `📅 Fecha de emisión: ${new Date().toLocaleDateString('es-CO')}\n`;
    text += `📍 Ubicación: ${activeFarmProfile.location || 'Colombia'}\n`;
    text += `------------------------------------\n`;
    text += `🚨 *PRÓXIMAS JORNADAS PROGRAMADAS:*\n`;

    urgentOrUpcoming.forEach((p, idx) => {
      text += `\n${idx + 1}. *${p.name}*\n`;
      text += `   • Fecha: ${p.scheduledDate}\n`;
      text += `   • Biológico: ${p.productName} (${p.dosage})\n`;
      text += `   • Grupo: ${p.targetGroup}\n`;
      text += `   • Retiro Carne: ${p.meatWithdrawalDays} días | Leche: ${p.milkWithdrawalHoursOrDays} d/h\n`;
    });

    text += `\n------------------------------------\n`;
    text += `⏳ *ANIMALES EN TIEMPO DE RETIRO:* ${withdrawalAnimals.length} casos activos.\n`;
    text += `_Sistema de Gestión Ganadera BPG_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Print Official ICA Report
  const handlePrintOfficialReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Plan Sanitario Oficial ICA - ${activeFarmProfile.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; color: #111; font-size: 12px; }
          .header { border-bottom: 2px solid #012d1d; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          h1 { color: #012d1d; margin: 0 0 5px 0; font-size: 18px; text-transform: uppercase; }
          h2 { color: #523700; margin: 20px 0 10px 0; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
          th { background-color: #f4f7f5; font-weight: bold; color: #012d1d; }
          .badge { font-weight: bold; padding: 2px 5px; border-radius: 4px; font-size: 10px; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .sign-box { width: 45%; border-top: 1px solid #333; text-align: center; padding-top: 8px; font-size: 11px; }
          @media print { body { margin: 15mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>LIBRO OFICIAL DE PLAN SANITARIO & VACUNACIÓN</h1>
            <p><strong>Predio:</strong> ${activeFarmProfile.name} | <strong>Ubicación:</strong> ${activeFarmProfile.location || 'Colombia'}</p>
            <p><strong>Inventario Total:</strong> ${activeFarmProfile.totalCattle} bovinos | <strong>Área:</strong> ${activeFarmProfile.totalArea} Ha</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Fecha de Expedición:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
            <p><strong>Cumplimiento Normativo:</strong> ICA / BPG Ganadería Bovina</p>
          </div>
        </div>

        <h2>1. ESQUEMAS Y PROTOCOLOS SANITARIOS PROGRAMADOS</h2>
        <table>
          <thead>
            <tr>
              <th>Protocolo / Vacunación</th>
              <th>Categoría</th>
              <th>Grupo Objetivo</th>
              <th>Fármaco / Laboratorio</th>
              <th>Dosis & Vía</th>
              <th>Retiro Carne / Leche</th>
              <th>Próxima Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${protocols
              .map(
                (p) => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${CATEGORY_CONFIG[p.category]?.label || p.category}</td>
                <td>${p.targetGroup}</td>
                <td>${p.productName} ${p.laboratory ? `(${p.laboratory})` : ''}</td>
                <td>${p.dosage} - ${p.route}</td>
                <td>${p.meatWithdrawalDays}d / ${p.milkWithdrawalHoursOrDays}d</td>
                <td>${p.scheduledDate}</td>
                <td><strong>${p.status.toUpperCase()}</strong></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h2>2. HISTORIAL DE JORNADAS SANITARIAS APLICADAS</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tratamiento / Biológico</th>
              <th>Lote Aplicado</th>
              <th>Cabezas</th>
              <th>Lote Fármaco & Reg. ICA</th>
              <th>Retiro Carne</th>
              <th>Veterinario Responsable</th>
            </tr>
          </thead>
          <tbody>
            ${applications
              .map(
                (a) => `
              <tr>
                <td>${a.date}</td>
                <td><strong>${a.treatmentName}</strong> (${a.productName})</td>
                <td>${a.targetLotOrGroup}</td>
                <td>${a.headcount}</td>
                <td>${a.batchNumber || 'N/A'} - ${a.icaRegistration || 'ICA'}</td>
                <td>${a.meatWithdrawalDays > 0 ? `${a.meatWithdrawalDays} días` : '0 días'}</td>
                <td>${a.veterinarian} ${a.vetLicense ? `(${a.vetLicense})` : ''}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h2>3. CONTROL DE TIEMPOS DE RETIRO VIGENTES</h2>
        <table>
          <thead>
            <tr>
              <th>Arete / Lote</th>
              <th>Medicamento</th>
              <th>Fecha Aplicación</th>
              <th>Retiro Total</th>
              <th>Días Restantes</th>
              <th>Motivo / Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            ${
              withdrawalAnimals.length === 0
                ? '<tr><td colspan="6" style="text-align: center; color: #666;">No hay animales en tiempo de retiro actualmente.</td></tr>'
                : withdrawalAnimals
                    .map(
                      (w) => `
              <tr>
                <td><strong>${w.tagId}</strong> - ${w.name}</td>
                <td>${w.medication}</td>
                <td>${w.appliedDate}</td>
                <td>${w.withdrawalDays} días</td>
                <td style="color: red; font-weight: bold;">${w.daysRemaining} días</td>
                <td>${w.reason}</td>
              </tr>
            `
                    )
                    .join('')
            }
          </tbody>
        </table>

        <div class="footer">
          <div class="sign-box">
            <p><strong>MÉDICO VETERINARIO RESPONSABLE</strong></p>
            <p>Firma y Tarjeta Profesional COMVEZCOL</p>
          </div>
          <div class="sign-box">
            <p><strong>PROPIETARIO / ADMINISTRADOR DE LA FINCA</strong></p>
            <p>Firma y Documento de Identidad</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Filtered Protocols
  const filteredProtocols = useMemo(() => {
    return protocols.filter((p) => {
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'urgente' && (p.status === 'urgente' || p.status === 'vencido')) ||
        (statusFilter === 'programado' && p.status === 'programado') ||
        (statusFilter === 'completado' && p.status === 'completado');

      const matchSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.targetGroup.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCategory && matchStatus && matchSearch;
    });
  }, [protocols, categoryFilter, statusFilter, searchTerm]);

  // KPIs
  const kpis = useMemo(() => {
    const total = protocols.length;
    const completados = protocols.filter((p) => p.status === 'completado').length;
    const urgentes = protocols.filter((p) => p.status === 'urgente' || p.status === 'vencido').length;
    const programados = protocols.filter((p) => p.status === 'programado').length;
    const retirosActivos = withdrawalAnimals.length;
    const cumplimientoPct = total > 0 ? Math.round((completados / total) * 100) : 100;

    return { total, completados, urgentes, programados, retirosActivos, cumplimientoPct };
  }, [protocols, withdrawalAnimals]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#f8faf9] rounded-3xl max-w-6xl w-full border border-[#2d6a4f]/30 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95">
        {/* MODAL HEADER */}
        <div className="bg-[#012d1d] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#1b4332] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#083d28] border border-[#2d6a4f] flex items-center justify-center text-emerald-300 shadow-inner">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Módulo de Plan Sanitario & Bioseguridad
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  ICA / BPG Ready
                </span>
              </div>
              <p className="text-xs text-[#a3c9b4] flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>Predio: <strong>{activeFarmProfile.name}</strong></span>
                <span className="mx-1.5 opacity-40">•</span>
                <span>{kpis.cumplimientoPct}% Esquemas al Día</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Farm Selector if multiple */}
            {farms.length > 1 && (
              <select
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                className="bg-[#083d28] border border-[#2d6a4f] text-white text-xs rounded-xl px-2.5 py-1.5 font-medium outline-hidden focus:border-emerald-400"
              >
                {farms.map((f) => (
                  <option key={f.profile.id} value={f.profile.id} className="bg-slate-900 text-white">
                    {f.profile.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrintOfficialReport}
              className="bg-[#1b4332] hover:bg-[#2d6a4f] text-emerald-200 border border-[#2d6a4f] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Imprimir Libro Oficial Sanitario ICA"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir ICA</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="bg-[#198754] hover:bg-[#146c43] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Compartir Cronograma por WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="bg-emerald-900 text-emerald-100 px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-emerald-700 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-300 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* SUB-TABS NAVIGATION */}
        <div className="bg-white border-b border-slate-200 px-5 pt-3 pb-0 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('protocols')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'protocols'
                  ? 'border-[#012d1d] text-[#012d1d] bg-[#f0f7f3]'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Cronograma & Protocolos ({protocols.length})</span>
              {kpis.urgentes > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {kpis.urgentes}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('apply')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'apply'
                  ? 'border-[#012d1d] text-[#012d1d] bg-[#f0f7f3]'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Pill className="w-4 h-4 text-pink-600" />
              <span>⚡ Registrar Jornada / Vacunar</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'withdrawals'
                  ? 'border-[#012d1d] text-[#012d1d] bg-[#f0f7f3]'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Tiempos de Retiro ({withdrawalAnimals.length})</span>
              {withdrawalAnimals.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {withdrawalAnimals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-[#012d1d] text-[#012d1d] bg-[#f0f7f3]'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Historial & BPG ({applications.length})</span>
            </button>
          </div>

          <div className="pb-2 hidden md:flex items-center gap-2">
            <button
              onClick={handleOpenCreateProtocol}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>+ Nuevo Protocolo</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: CRONOGRAMA & PROTOCOLOS SANITARIOS EDITABLES       */}
          {/* ======================================================== */}
          {activeTab === 'protocols' && (
            <div className="space-y-6">
              {/* KPI DASHBOARD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Total Esquemas</p>
                    <p className="text-xl font-black text-slate-900">{kpis.total}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">{kpis.cumplimientoPct}% Al Día</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Urgentes / Vencidos</p>
                    <p className="text-xl font-black text-red-600">{kpis.urgentes}</p>
                    <p className="text-[10px] text-red-500 font-bold">Atención requerida</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Programados</p>
                    <p className="text-xl font-black text-slate-800">{kpis.programados}</p>
                    <p className="text-[10px] text-blue-600 font-bold">Próximos ciclos</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="p-3 bg-amber-50 text-amber-800 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">En Retiro Activo</p>
                    <p className="text-xl font-black text-amber-700">{kpis.retirosActivos}</p>
                    <p className="text-[10px] text-amber-600 font-bold">Sin faena / leche</p>
                  </div>
                </div>
              </div>

              {/* FILTERS & ACTION BAR */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar protocolo, vacuna o lote..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:border-emerald-500"
                  >
                    <option value="all">Todas las Categorías</option>
                    <option value="vacunacion_oficial">💉 Vacunación Oficial ICA</option>
                    <option value="vacunacion_reproductiva">🧬 Reproductivas (IATF)</option>
                    <option value="clostridiosis">🛡️ Clostridiosis (10 Vías)</option>
                    <option value="control_parasitario">🪱 Control Parasitario</option>
                    <option value="vitaminas_minerales">⚡ Vitaminas & Minerales</option>
                    <option value="podologia">🦶 Podología</option>
                    <option value="diagnostico_pruebas">🔬 Diagnósticos & Pruebas</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:border-emerald-500"
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="urgente">🚨 Urgentes / Vencidos</option>
                    <option value="programado">📅 Programados</option>
                    <option value="completado">✅ Completados / Al Día</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleOpenCreateProtocol}
                    className="w-full md:w-auto bg-[#012d1d] hover:bg-[#1b4332] text-white px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Crear Protocolo</span>
                  </button>
                </div>
              </div>

              {/* PROTOCOLS LIST */}
              <div className="space-y-3">
                {filteredProtocols.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                    <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">No se encontraron protocolos con estos filtros</h4>
                    <p className="text-xs text-slate-400 mt-1">Prueba cambiando la búsqueda o crea un nuevo esquema sanitario.</p>
                    <button
                      onClick={handleOpenCreateProtocol}
                      className="mt-4 inline-flex items-center gap-1.5 bg-[#012d1d] text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Crear Primer Protocolo</span>
                    </button>
                  </div>
                ) : (
                  filteredProtocols.map((prot) => {
                    const catCfg = CATEGORY_CONFIG[prot.category] || CATEGORY_CONFIG.vacunacion_oficial;
                    const isUrgent = prot.status === 'urgente' || prot.status === 'vencido';
                    const isCompleted = prot.status === 'completado';

                    return (
                      <div
                        key={prot.id}
                        className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs hover:shadow-md ${
                          isUrgent
                            ? 'border-red-300 bg-red-50/20'
                            : isCompleted
                            ? 'border-emerald-200'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Protocol Info */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${catCfg.bg} ${catCfg.border}`}>
                              {catCfg.icon} {catCfg.label}
                            </span>

                            {isUrgent ? (
                              <span className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                {prot.status === 'vencido' ? 'VENCIDO' : 'URGENTE'}
                              </span>
                            ) : isCompleted ? (
                              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                AL DÍA
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-blue-600" />
                                PROGRAMADO
                              </span>
                            )}

                            <span className="text-[11px] text-slate-400 font-mono font-bold">
                              • Frecuencia: {FREQUENCY_LABELS[prot.frequency] || prot.frequency}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                              {prot.name}
                            </h3>
                            <p className="text-xs text-slate-600 mt-0.5">
                              <strong>Producto:</strong> <span className="font-semibold text-slate-800">{prot.productName}</span>
                              {prot.laboratory && <span className="text-slate-500"> ({prot.laboratory})</span>}
                              <span className="mx-1.5 opacity-40">•</span>
                              <strong>Dosis:</strong> {prot.dosage} ({prot.route})
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                            <span>👥 <strong>Grupo:</strong> {prot.targetGroup}</span>
                            <span>⏳ <strong>Retiro Carne:</strong> {prot.meatWithdrawalDays > 0 ? `${prot.meatWithdrawalDays} días` : '0 días (Libre)'}</span>
                            {prot.milkWithdrawalHoursOrDays > 0 && (
                              <span>🥛 <strong>Retiro Leche:</strong> {prot.milkWithdrawalHoursOrDays} días/horas</span>
                            )}
                            {prot.costPerDose > 0 && (
                              <span>💰 <strong>Costo Est.:</strong> ${prot.costPerDose.toLocaleString()} / dosis</span>
                            )}
                          </div>

                          {prot.notes && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                              📝 {prot.notes}
                            </p>
                          )}
                        </div>

                        {/* Dates & Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          <div className="text-left lg:text-right">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Próxima Aplicación</p>
                            <p className={`text-sm font-black font-mono ${isUrgent ? 'text-red-600' : 'text-slate-900'}`}>
                              📅 {prot.scheduledDate}
                            </p>
                            {prot.lastAppliedDate && (
                              <p className="text-[10px] text-slate-400">Última: {prot.lastAppliedDate}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Fast Apply Button */}
                            <button
                              onClick={() => handleStartApplicationFromProtocol(prot)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-transform active:scale-95"
                              title="Registrar aplicación inmediata de este protocolo"
                            >
                              <Pill className="w-3.5 h-3.5" />
                              <span>Aplicar</span>
                            </button>

                            {/* Mark as Completed */}
                            <button
                              onClick={() => handleFastCompleteProtocol(prot)}
                              className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Marcar como cumplido y reprogramar siguiente fecha"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Completar</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditProtocol(prot)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                              title="Editar este protocolo"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteProtocol(prot.id)}
                              className="p-1.5 bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-400 rounded-xl transition-colors cursor-pointer"
                              title="Eliminar protocolo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: REGISTRAR JORNADA / APLICACIÓN SANITARIA          */}
          {/* ======================================================== */}
          {activeTab === 'apply' && (
            <form onSubmit={handleSaveApplicationSubmit} className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-pink-600" />
                      Registro de Jornada de Vacunación & Tratamiento Sanitario
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Registra la aplicación de vacunas, vermífugos o fármacos a lotes o animales individuales.
                    </p>
                  </div>
                </div>

                {/* Pre-fill Protocol Selector */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-emerald-900">Autocompletar desde Protocolo Existente</p>
                      <p className="text-[11px] text-emerald-700">Selecciona un esquema para cargar dosis, fármaco y retiro automáticamente.</p>
                    </div>
                  </div>
                  <select
                    value={appFormData.protocolId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) {
                        setAppFormData({ ...appFormData, protocolId: '' });
                        return;
                      }
                      const found = protocols.find((p) => p.id === selectedId);
                      if (found) {
                        handleStartApplicationFromProtocol(found);
                      }
                    }}
                    className="bg-white border border-emerald-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-hidden focus:border-emerald-600"
                  >
                    <option value="">-- Seleccionar protocolo base --</option>
                    {protocols.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.productName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Main Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Fecha */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fecha de Aplicación *</label>
                    <input
                      type="date"
                      required
                      value={appFormData.date}
                      onChange={(e) => setAppFormData({ ...appFormData, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  {/* Nombre del Tratamiento */}
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Nombre del Tratamiento / Evento *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Vacunación Oficial Fiebre Aftosa Ciclo I"
                      value={appFormData.treatmentName}
                      onChange={(e) => setAppFormData({ ...appFormData, treatmentName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Categoría Sanitaria</label>
                    <select
                      value={appFormData.category}
                      onChange={(e) => setAppFormData({ ...appFormData, category: e.target.value as SanitaryCategory })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-hidden focus:border-emerald-500"
                    >
                      <option value="vacunacion_oficial">💉 Vacunación Oficial ICA</option>
                      <option value="vacunacion_reproductiva">🧬 Vacuna Reproductiva</option>
                      <option value="clostridiosis">🛡️ Clostridiosis (10 Vías)</option>
                      <option value="control_parasitario">🪱 Control Parasitario / Purga</option>
                      <option value="vitaminas_minerales">⚡ Vitaminas & Minerales</option>
                      <option value="podologia">🦶 Podología</option>
                      <option value="diagnostico_pruebas">🔬 Diagnósticos & Pruebas</option>
                      <option value="tratamiento_especifico">💊 Tratamiento Curativo</option>
                    </select>
                  </div>

                  {/* Producto Comercial */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Producto / Biológico Aplicado *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Aftogan / Covexin 10 / Dectomax"
                      value={appFormData.productName}
                      onChange={(e) => setAppFormData({ ...appFormData, productName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  {/* Laboratorio */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Laboratorio Fabricante</label>
                    <input
                      type="text"
                      placeholder="Ej: Vecol, Zoetis, MSD, Bayer"
                      value={appFormData.laboratory}
                      onChange={(e) => setAppFormData({ ...appFormData, laboratory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  {/* Dosis */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dosis por Cabeza</label>
                    <input
                      type="text"
                      placeholder="Ej: 2.0 ml / 5 ml / 1 ml/50kg"
                      value={appFormData.dosage}
                      onChange={(e) => setAppFormData({ ...appFormData, dosage: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  {/* Vía de Administración */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vía de Aplicación</label>
                    <select
                      value={appFormData.route}
                      onChange={(e) => setAppFormData({ ...appFormData, route: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-hidden focus:border-emerald-500"
                    >
                      <option value="Subcutánea">Subcutánea (SC)</option>
                      <option value="Intramuscular">Intramuscular (IM)</option>
                      <option value="Oral">Oral</option>
                      <option value="Pour-on / Tópica">Pour-on / Tópica</option>
                      <option value="Intramamaria">Intramamaria</option>
                      <option value="Inmersión / Batea">Inmersión / Batea</option>
                    </select>
                  </div>

                  {/* N° Lote & Reg ICA */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">N° Lote Frasco / Reg. ICA</label>
                    <input
                      type="text"
                      placeholder="Ej: LOTE-8892 / ICA-0145"
                      value={appFormData.batchNumber}
                      onChange={(e) => setAppFormData({ ...appFormData, batchNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Target Lots & Headcount */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lote / Grupo Tratado *</label>
                    <select
                      value={appFormData.targetLotOrGroup}
                      onChange={(e) => setAppFormData({ ...appFormData, targetLotOrGroup: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-hidden focus:border-emerald-500"
                    >
                      <option value="Todo el Hato Bovino">Todo el Hato Bovino</option>
                      {lots.map((lot) => (
                        <option key={lot.id} value={lot.name}>
                          {lot.name} ({lot.totalAnimals} animales)
                        </option>
                      ))}
                      <option value="Lote 1 - Vacas de Cría">Lote 1 - Vacas de Cría</option>
                      <option value="Lote 2 - Terneros Destetos">Lote 2 - Terneros Destetos</option>
                      <option value="Lote 3 - Novillas Levante">Lote 3 - Novillas Levante</option>
                      <option value="Lote 4 - Ceba & Engorde">Lote 4 - Ceba & Engorde</option>
                      <option value="Lote Lechería & Ordeño">Lote Lechería & Ordeño</option>
                      <option value="Lote Enfermería / Aislamiento">Lote Enfermería / Aislamiento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Número de Cabezas Tratadas *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={appFormData.headcount}
                      onChange={(e) => setAppFormData({ ...appFormData, headcount: parseInt(e.target.value) || 1 })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Costo por Dosis ($ COP)</label>
                    <input
                      type="number"
                      min={0}
                      value={appFormData.costPerHead}
                      onChange={(e) => setAppFormData({ ...appFormData, costPerHead: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Total Jornada: <strong>${((appFormData.costPerHead || 0) * (appFormData.headcount || 1)).toLocaleString()} COP</strong>
                    </p>
                  </div>
                </div>

                {/* Withdrawal & Biosecurity Controls */}
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700" />
                      Tiempo de Retiro en Carne (Días)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={appFormData.meatWithdrawalDays}
                      onChange={(e) => setAppFormData({ ...appFormData, meatWithdrawalDays: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 font-mono font-bold text-amber-900 outline-hidden focus:border-amber-600"
                    />
                    <p className="text-[10px] text-amber-700 mt-1">
                      {appFormData.meatWithdrawalDays > 0
                        ? `⚠️ Se registrará alerta de retiro por ${appFormData.meatWithdrawalDays} días.`
                        : '✅ 0 días (Sin restricción de faena).'}
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-amber-700" />
                      Tiempo de Retiro en Leche (Días u Horas)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={appFormData.milkWithdrawalDays}
                      onChange={(e) => setAppFormData({ ...appFormData, milkWithdrawalDays: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 font-mono font-bold text-amber-900 outline-hidden focus:border-amber-600"
                    />
                    <p className="text-[10px] text-amber-700 mt-1">
                      {appFormData.milkWithdrawalDays > 0
                        ? `⚠️ No enviar leche de este lote al tanque durante el periodo de retiro.`
                        : '✅ 0 días (Leche apta para ordeño comercial).'}
                    </p>
                  </div>
                </div>

                {/* Responsible & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Médico Veterinario / Responsable *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Dr. Roberto Mendoza"
                      value={appFormData.veterinarian}
                      onChange={(e) => setAppFormData({ ...appFormData, veterinarian: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">N° Tarjeta Profesional / Matrícula</label>
                    <input
                      type="text"
                      placeholder="Ej: TP-18920 COMVEZCOL"
                      value={appFormData.vetLicense}
                      onChange={(e) => setAppFormData({ ...appFormData, vetLicense: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Observaciones & Reacciones Post-Vacunales</label>
                    <textarea
                      rows={2}
                      placeholder="Detalles del comportamiento del ganado, condiciones climáticas o hallazgos..."
                      value={appFormData.notes}
                      onChange={(e) => setAppFormData({ ...appFormData, notes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('protocols')}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-black text-xs shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Guardar Jornada Sanitaria</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CONTROL DE TIEMPOS DE RETIRO (CARNE & LECHE)      */}
          {/* ======================================================== */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              {/* Alert Banner */}
              <div className="bg-[#ffdad6] text-[#93000a] p-4 sm:p-5 rounded-2xl border-l-4 border-[#ba1a1a] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-[#ba1a1a] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-sm text-[#93000a]">
                      Control Estricto de Inocuidad y Retiro de Fármacos
                    </h4>
                    <p className="text-xs text-[#93000a]/80 mt-0.5">
                      Queda terminantemente prohibido despachar a sacrificio o remitir leche al tanque comunal de los animales listados abajo hasta que los días restantes lleguen a 0.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsWithdrawalFormOpen(true)}
                  className="bg-[#ba1a1a] hover:bg-[#93000a] text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar a Retiro</span>
                </button>
              </div>

              {/* Withdrawals List */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Casos Activos con Medicación Residual ({withdrawalAnimals.length})
                  </h4>
                </div>

                {withdrawalAnimals.length === 0 ? (
                  <div className="p-8 text-center">
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <h5 className="font-bold text-sm text-slate-800">¡Hato 100% Libre de Tiempos de Retiro!</h5>
                    <p className="text-xs text-slate-500 mt-1">Todos los animales cumplen los estándares de inocuidad para carne y leche.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {withdrawalAnimals.map((w) => {
                      const pctRemaining = Math.min(100, Math.round((w.daysRemaining / (w.withdrawalDays || 1)) * 100));

                      return (
                        <div key={w.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold bg-[#012d1d] text-white px-2 py-0.5 rounded text-xs">
                                {w.tagId}
                              </span>
                              <span className="font-black text-slate-900 text-sm">{w.name}</span>
                              <span className="text-xs font-medium text-slate-500">({w.lot})</span>
                            </div>

                            <p className="text-xs text-slate-700">
                              <strong>Fármaco Aplicado:</strong> <span className="font-semibold text-slate-900">{w.medication}</span>
                            </p>

                            <p className="text-[11px] text-slate-500">
                              📅 Aplicación: {w.appliedDate} • Motivo: {w.reason}
                            </p>

                            {/* Progress bar */}
                            <div className="w-full max-w-md pt-1.5">
                              <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                                <span>Retiro: {w.withdrawalDays} días</span>
                                <span className="text-red-600">{w.daysRemaining} días restantes ({pctRemaining}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-red-500 h-full rounded-full transition-all"
                                  style={{ width: `${pctRemaining}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleReleaseWithdrawal(w.id)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Dar de alta y liberar animal del retiro"
                            >
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>Liberar / Apto</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: HISTORIAL DE JORNADAS & AUDITORÍA BPG             */}
          {/* ======================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Bitácora de Aplicaciones y Tratamientos Registrados
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Historial oficial de trazabilidad para auditorías ICA, BPG y sanidad animal.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportCSV}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>Exportar CSV</span>
                  </button>
                  <button
                    onClick={handlePrintOfficialReport}
                    className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>Imprimir Libro Oficial</span>
                  </button>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Tratamiento / Biológico</th>
                        <th className="py-3 px-4">Lote Tratado</th>
                        <th className="py-3 px-4 text-center">Cabezas</th>
                        <th className="py-3 px-4">Dosis & Vía</th>
                        <th className="py-3 px-4">Retiro Carne</th>
                        <th className="py-3 px-4">Costo Total</th>
                        <th className="py-3 px-4">Responsable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No hay jornadas sanitarias registradas aún.
                          </td>
                        </tr>
                      ) : (
                        applications.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-700">{app.date}</td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{app.treatmentName}</p>
                              <p className="text-[11px] text-slate-500">{app.productName} {app.batchNumber ? `(Lote: ${app.batchNumber})` : ''}</p>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">{app.targetLotOrGroup}</td>
                            <td className="py-3 px-4 text-center font-mono font-bold">{app.headcount}</td>
                            <td className="py-3 px-4 text-slate-600">{app.dosage} ({app.route})</td>
                            <td className="py-3 px-4">
                              {app.meatWithdrawalDays > 0 ? (
                                <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[11px]">
                                  {app.meatWithdrawalDays} días
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-bold text-[11px]">0 días</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                              {app.totalCost ? `$${app.totalCost.toLocaleString()}` : '$0'}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {app.veterinarian}
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
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-white border-t border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Todos los registros sanitarios se sincronizan con trazabilidad y finanzas.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Cerrar Módulo
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PROTOCOL CREATE / EDIT POPUP MODAL                       */}
      {/* ======================================================== */}
      {isProtocolFormOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                {editingProtocolId ? 'Editar Protocolo Sanitario' : 'Crear Nuevo Protocolo Sanitario'}
              </h3>
              <button onClick={() => setIsProtocolFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProtocolSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Protocolo / Vacunación *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Vacunación Oficial Fiebre Aftosa"
                    value={protocolFormData.name}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={protocolFormData.category}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, category: e.target.value as SanitaryCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-hidden focus:border-emerald-500"
                  >
                    <option value="vacunacion_oficial">💉 Vacunación Oficial ICA</option>
                    <option value="vacunacion_reproductiva">🧬 Vacuna Reproductiva (IATF)</option>
                    <option value="clostridiosis">🛡️ Clostridiosis (10 Vías)</option>
                    <option value="control_parasitario">🪱 Control Parasitario</option>
                    <option value="vitaminas_minerales">⚡ Vitaminas & Minerales</option>
                    <option value="podologia">🦶 Podología</option>
                    <option value="diagnostico_pruebas">🔬 Diagnósticos & Pruebas</option>
                    <option value="tratamiento_especifico">💊 Tratamiento Específico</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Periodicidad / Frecuencia</label>
                  <select
                    value={protocolFormData.frequency}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, frequency: e.target.value as SanitaryFrequency })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-hidden focus:border-emerald-500"
                  >
                    <option value="semestral">Semestral (Ciclos ICA)</option>
                    <option value="anual">Anual (Cada 12 meses)</option>
                    <option value="trimestral">Trimestral (Cada 3 meses)</option>
                    <option value="mensual">Mensual</option>
                    <option value="al_destete">Al Destete (3-8 meses)</option>
                    <option value="al_nacer">Al Nacer</option>
                    <option value="al_secado">Al Secado</option>
                    <option value="pre_servicio">Pre-Servicio / IATF</option>
                    <option value="estrategica">Estratégica / Por Época</option>
                    <option value="unica">Única Vez</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Producto Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Aftogan / Covexin 10 / CattleMaster"
                    value={protocolFormData.productName}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Laboratorio Fabricante</label>
                  <input
                    type="text"
                    placeholder="Ej: Vecol, Zoetis, MSD"
                    value={protocolFormData.laboratory}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, laboratory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grupo Objetivo *</label>
                  <input
                    type="text"
                    placeholder="Ej: Todo el Hato, Terneras 3-8m, Cría"
                    value={protocolFormData.targetGroup}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, targetGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosis por Cabeza</label>
                  <input
                    type="text"
                    placeholder="Ej: 2.0 ml SC / 5 ml SC"
                    value={protocolFormData.dosage}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, dosage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vía de Aplicación</label>
                  <select
                    value={protocolFormData.route}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, route: e.target.value as SanitaryProtocol['route'] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-hidden focus:border-emerald-500"
                  >
                    <option value="subcutanea">Subcutánea (SC)</option>
                    <option value="intramuscular">Intramuscular (IM)</option>
                    <option value="oral">Oral</option>
                    <option value="pour_on">Pour-On / Tópica</option>
                    <option value="intramamaria">Intramamaria</option>
                    <option value="inmersion">Inmersión</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Días Retiro en Carne</label>
                  <input
                    type="number"
                    min={0}
                    value={protocolFormData.meatWithdrawalDays}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, meatWithdrawalDays: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Días Retiro en Leche</label>
                  <input
                    type="number"
                    min={0}
                    value={protocolFormData.milkWithdrawalHoursOrDays}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, milkWithdrawalHoursOrDays: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Costo Estimado / Dosis ($ COP)</label>
                  <input
                    type="number"
                    min={0}
                    value={protocolFormData.costPerDose}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, costPerDose: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Próxima Fecha Programada *</label>
                  <input
                    type="date"
                    required
                    value={protocolFormData.scheduledDate}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, scheduledDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={protocolFormData.status}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, status: e.target.value as SanitaryStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-hidden focus:border-emerald-500"
                  >
                    <option value="programado">📅 Programado</option>
                    <option value="urgente">🚨 Urgente / Próximo</option>
                    <option value="completado">✅ Completado / Al Día</option>
                    <option value="vencido">⚠️ Vencido</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Notas y Protocolo de Aplicación</label>
                  <textarea
                    rows={2}
                    placeholder="Instrucciones para el personal de corral, precauciones de frío..."
                    value={protocolFormData.notes}
                    onChange={(e) => setProtocolFormData({ ...protocolFormData, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProtocolFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-black"
                >
                  {editingProtocolId ? 'Guardar Cambios' : 'Crear Protocolo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MANUAL WITHDRAWAL POPUP MODAL                            */}
      {/* ======================================================== */}
      {isWithdrawalFormOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Agregar Animal a Control de Retiro
              </h3>
              <button onClick={() => setIsWithdrawalFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualWithdrawal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Arete / Identificación *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: #4512 o LOTE-4"
                  value={withdrawalFormData.tagId}
                  onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, tagId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre / Referencia</label>
                <input
                  type="text"
                  placeholder="Ej: Vaca Pinta 12"
                  value={withdrawalFormData.name}
                  onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicamento / Principio Activo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Oxitetraciclina L.A. 200mg"
                  value={withdrawalFormData.medication}
                  onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, medication: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha Aplicación</label>
                  <input
                    type="date"
                    required
                    value={withdrawalFormData.appliedDate}
                    onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, appliedDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Días de Retiro *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={withdrawalFormData.withdrawalDays}
                    onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, withdrawalDays: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo / Diagnóstico</label>
                <input
                  type="text"
                  placeholder="Ej: Tratamiento respiratorio / Mastitis"
                  value={withdrawalFormData.reason}
                  onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lote / Ubicación</label>
                <input
                  type="text"
                  placeholder="Ej: Lote Enfermería"
                  value={withdrawalFormData.lot}
                  onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, lot: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWithdrawalFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black"
                >
                  Guardar Retiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
