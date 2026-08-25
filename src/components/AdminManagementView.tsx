import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Building2,
  Stethoscope,
  DollarSign,
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  KeyRound,
  FileSpreadsheet,
  Edit,
  Trash2,
  Lock,
  Eye,
  Check,
  X,
  Plus,
  Clock,
  Sparkles,
  Award,
  FileText,
  BadgeCheck,
  Info,
  Mail,
  Send,
  Bell,
  CheckSquare,
  Square,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AdminUser,
  SystemRoleType,
  AdminUserPermissions,
  SystemAuditLog,
  FarmDataPackage,
  EmailNotificationRecipient,
  NotificationPreferences,
  NotificationDeliveryLog,
} from '../types';
import { INITIAL_ADMIN_USERS, INITIAL_SYSTEM_AUDIT_LOGS } from '../data/mockAdminData';
import { NotificationChannelsManager } from './NotificationChannelsManager';

interface AdminManagementViewProps {
  currentFarm?: FarmDataPackage;
  farms?: FarmDataPackage[];
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  currentFarm,
  farms = [],
}) => {
  // State for Users list with Local Storage persistence
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_admin_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading admin users from localStorage:', e);
    }
    return INITIAL_ADMIN_USERS;
  });

  // State for Audit Logs
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_system_audit_logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading audit logs from localStorage:', e);
    }
    return INITIAL_SYSTEM_AUDIT_LOGS;
  });

  // Navigation sub-tabs inside Admin View
  const [activeSubTab, setActiveSubTab] = useState<'directorio' | 'matriz' | 'notificaciones' | 'auditoria'>('directorio');

  // State for Email Notification Recipients
  const [recipients, setRecipients] = useState<EmailNotificationRecipient[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_email_recipients');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading notification recipients from localStorage:', e);
    }
    return [
      {
        id: 'rec_01',
        fullName: 'Alejandro Doria',
        email: 'alejodoriall@gmail.com',
        role: 'propietario',
        isAllFarmsAccess: true,
        assignedFarmNames: ['Todas las Fincas'],
        status: 'active',
        verifiedAt: '2026-08-10 14:30',
        quietHoursEnabled: true,
        quietHoursStart: '21:00',
        quietHoursEnd: '06:00',
        preferences: {
          alertSalesDispatch: true,
          alertMortalityRecorded: true,
          alertWithdrawalActive: true,
          alertCriticalStockOut: true,
          notifyNewBirths: true,
          notifyCalvingForecast: true,
          notifyHealthReinforcement: true,
          reportDailyDigest: false,
          reportWeeklyExecutive: true,
          reportMonthlyMrp: true,
        },
        lastSentAt: 'Hoy, 06:00 AM',
        createdAt: '2026-08-01',
      },
      {
        id: 'rec_02',
        fullName: 'Dr. Carlos Restrepo (M.V.Z)',
        email: 'carlos.veterinaria@sanmateo.com',
        role: 'veterinario',
        isAllFarmsAccess: false,
        assignedFarmNames: ['Hacienda San Mateo', 'Finca El Roble'],
        status: 'active',
        verifiedAt: '2026-08-12 09:15',
        quietHoursEnabled: true,
        quietHoursStart: '20:00',
        quietHoursEnd: '06:30',
        preferences: {
          alertSalesDispatch: false,
          alertMortalityRecorded: true,
          alertWithdrawalActive: true,
          alertCriticalStockOut: true,
          notifyNewBirths: true,
          notifyCalvingForecast: true,
          notifyHealthReinforcement: true,
          reportDailyDigest: false,
          reportWeeklyExecutive: false,
          reportMonthlyMrp: false,
        },
        lastSentAt: 'Ayer, 07:30 AM',
        createdAt: '2026-08-05',
      },
      {
        id: 'rec_03',
        fullName: 'Martha Lucía Gómez',
        email: 'martha.contabilidad@ganaderia.com',
        role: 'contador',
        isAllFarmsAccess: true,
        assignedFarmNames: ['Todas las Fincas'],
        status: 'pending_verification',
        verificationCode: '849201',
        quietHoursEnabled: true,
        quietHoursStart: '19:00',
        quietHoursEnd: '07:00',
        preferences: {
          alertSalesDispatch: true,
          alertMortalityRecorded: false,
          alertWithdrawalActive: false,
          alertCriticalStockOut: false,
          notifyNewBirths: false,
          notifyCalvingForecast: false,
          notifyHealthReinforcement: false,
          reportDailyDigest: false,
          reportWeeklyExecutive: true,
          reportMonthlyMrp: true,
        },
        createdAt: '2026-08-17',
      },
    ];
  });

  // Delivery logs state
  const [deliveryLogs, setDeliveryLogs] = useState<NotificationDeliveryLog[]>([
    {
      id: 'log_01',
      recipientEmail: 'alejodoriall@gmail.com',
      recipientName: 'Alejandro Doria',
      eventCategory: 'Venta de Ganado',
      severity: 'CRITICAL',
      subject: '[VENTA] Confirmación de Despacho 32 Novillos Ceba - Hda. San Mateo',
      sentAt: '18/08/2026 07:45 AM',
      deliveryStatus: 'delivered',
    },
    {
      id: 'log_02',
      recipientEmail: 'carlos.veterinaria@sanmateo.com',
      recipientName: 'Dr. Carlos Restrepo',
      eventCategory: 'Alerta Sanitaria',
      severity: 'WARNING',
      subject: '[RETIRO LECHE] Inicio de Retiro Vaca #ARE-4012 (Cefalexina 72h)',
      sentAt: '18/08/2026 06:10 AM',
      deliveryStatus: 'delivered',
    },
    {
      id: 'log_03',
      recipientEmail: 'alejodoriall@gmail.com',
      recipientName: 'Alejandro Doria',
      eventCategory: 'Reporte Semanal',
      severity: 'INFO',
      subject: '[BALANCE] Reporte Semanal Ejecutivo Hato General (11-17 Agosto)',
      sentAt: '17/08/2026 08:00 AM',
      deliveryStatus: 'opened',
    },
  ]);

  // Modals for Notifications
  const [isAddRecipientModalOpen, setIsAddRecipientModalOpen] = useState(false);
  const [editingPreferencesRecipient, setEditingPreferencesRecipient] = useState<EmailNotificationRecipient | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyingRecipient, setVerifyingRecipient] = useState<EmailNotificationRecipient | null>(null);
  const [enteredVerifyCode, setEnteredVerifyCode] = useState('');
  const [previewTemplateType, setPreviewTemplateType] = useState<'sales' | 'weekly' | null>(null);

  // New recipient form state
  const [newRecEmail, setNewRecEmail] = useState('');
  const [newRecName, setNewRecName] = useState('');
  const [newRecRole, setNewRecRole] = useState<'propietario' | 'administrador' | 'veterinario' | 'contador' | 'zootecnista'>('administrador');
  const [newRecFarmsAccess, setNewRecFarmsAccess] = useState<'all' | 'custom'>('all');
  const [newRecSelectedFarm, setNewRecSelectedFarm] = useState<string>('Hacienda San Mateo');

  // Save email recipients to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_email_recipients', JSON.stringify(recipients));
    } catch (e) {
      console.error('Error saving email recipients to localStorage:', e);
    }
  }, [recipients]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('todos');

  // Modal State for Creating / Editing Admin Users
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form State
  const [formFullName, setFormFullName] = useState('');
  const [formDocumentId, setFormDocumentId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRoleType, setFormRoleType] = useState<SystemRoleType>('administrador');
  const [formCustomRoleTitle, setFormCustomRoleTitle] = useState('');
  const [formAssignedFarms, setFormAssignedFarms] = useState<string[]>(['all']);
  const [formStatus, setFormStatus] = useState<'activo' | 'inactivo' | 'suspendido'>('activo');
  const [formSecurityPin, setFormSecurityPin] = useState('1234');
  const [formOwnershipPercentage, setFormOwnershipPercentage] = useState<number>(0);
  const [formMaxDisbursementApproval, setFormMaxDisbursementApproval] = useState<number>(10000000);
  const [formProfessionalLicenseNo, setFormProfessionalLicenseNo] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Default permissions state for form
  const [formPermissions, setFormPermissions] = useState<AdminUserPermissions>({
    cattle: true,
    dairy: true,
    genetics: true,
    finance: true,
    payroll: true,
    sanitary: true,
    inventory: true,
    gis: true,
    admin: false,
    reports: true,
  });

  // Save admin users to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_admin_users', JSON.stringify(adminUsers));
    } catch (e) {
      console.error('Error saving admin users to localStorage:', e);
    }
  }, [adminUsers]);

  // Save audit logs to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_system_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Error saving audit logs to localStorage:', e);
    }
  }, [auditLogs]);

  // Reset or initialize form
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormFullName('');
    setFormDocumentId('');
    setFormEmail('');
    setFormPhone('');
    setFormRoleType('administrador');
    setFormCustomRoleTitle('Administrador de Finca');
    setFormAssignedFarms(['all']);
    setFormStatus('activo');
    setFormSecurityPin(Math.floor(1000 + Math.random() * 9000).toString());
    setFormOwnershipPercentage(0);
    setFormMaxDisbursementApproval(15000000);
    setFormProfessionalLicenseNo('');
    setFormNotes('');
    setFormPermissions({
      cattle: true,
      dairy: true,
      genetics: true,
      finance: true,
      payroll: true,
      sanitary: true,
      inventory: true,
      gis: true,
      admin: false,
      reports: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormDocumentId(user.documentId);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRoleType(user.roleType);
    setFormCustomRoleTitle(user.customRoleTitle || '');
    setFormAssignedFarms(user.assignedFarms);
    setFormStatus(user.status);
    setFormSecurityPin(user.securityPin);
    setFormOwnershipPercentage(user.ownershipPercentage || 0);
    setFormMaxDisbursementApproval(user.maxDisbursementApproval || 0);
    setFormProfessionalLicenseNo(user.professionalLicenseNo || '');
    setFormNotes(user.notes || '');
    setFormPermissions(user.permissions);
    setIsModalOpen(true);
  };

  // Adjust default permissions when changing role type in form
  const handleRoleTypeChange = (newRole: SystemRoleType) => {
    setFormRoleType(newRole);
    if (newRole === 'propietario') {
      setFormCustomRoleTitle('Propietario / Socio');
      setFormPermissions({
        cattle: true,
        dairy: true,
        genetics: true,
        finance: true,
        payroll: true,
        sanitary: true,
        inventory: true,
        gis: true,
        admin: true,
        reports: true,
      });
    } else if (newRole === 'administrador') {
      setFormCustomRoleTitle('Administrador General');
      setFormPermissions({
        cattle: true,
        dairy: true,
        genetics: true,
        finance: true,
        payroll: true,
        sanitary: true,
        inventory: true,
        gis: true,
        admin: true,
        reports: true,
      });
    } else if (newRole === 'veterinario') {
      setFormCustomRoleTitle('Veterinario / Zootecnista');
      setFormPermissions({
        cattle: true,
        dairy: true,
        genetics: true,
        finance: false,
        payroll: false,
        sanitary: true,
        inventory: true,
        gis: true,
        admin: false,
        reports: true,
      });
    } else if (newRole === 'mayordomo') {
      setFormCustomRoleTitle('Mayordomo de Campo');
      setFormPermissions({
        cattle: true,
        dairy: true,
        genetics: false,
        finance: false,
        payroll: false,
        sanitary: true,
        inventory: true,
        gis: true,
        admin: false,
        reports: false,
      });
    } else if (newRole === 'financiero_contador') {
      setFormCustomRoleTitle('Financiero / Contador Público');
      setFormPermissions({
        cattle: false,
        dairy: true,
        genetics: false,
        finance: true,
        payroll: true,
        sanitary: false,
        inventory: true,
        gis: false,
        admin: false,
        reports: true,
      });
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formDocumentId.trim()) {
      alert('Por favor ingrese el nombre completo y el documento de identidad.');
      return;
    }

    const newUserObj: AdminUser = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      fullName: formFullName.trim(),
      documentId: formDocumentId.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      roleType: formRoleType,
      customRoleTitle: formCustomRoleTitle.trim() || undefined,
      assignedFarms: formAssignedFarms,
      status: formStatus,
      securityPin: formSecurityPin.trim() || '1234',
      ownershipPercentage: formRoleType === 'propietario' ? Number(formOwnershipPercentage) : undefined,
      maxDisbursementApproval:
        formRoleType === 'administrador' || formRoleType === 'financiero_contador' || formRoleType === 'propietario'
          ? Number(formMaxDisbursementApproval)
          : undefined,
      professionalLicenseNo:
        formRoleType === 'veterinario' || formRoleType === 'financiero_contador'
          ? formProfessionalLicenseNo.trim()
          : undefined,
      permissions: formPermissions,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString().split('T')[0],
      lastLogin: editingUser ? editingUser.lastLogin : 'Nunca',
      notes: formNotes.trim(),
    };

    if (editingUser) {
      setAdminUsers((prev) => prev.map((u) => (u.id === editingUser.id ? newUserObj : u)));
    } else {
      setAdminUsers((prev) => [newUserObj, ...prev]);
    }

    // Add audit log entry
    const newLog: SystemAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleString('es-CO'),
      userId: 'user-admin-1',
      userName: 'Administrador del Sistema',
      userRole: 'Administración',
      module: 'Gestión de Roles',
      action: editingUser ? 'Edición de Usuario/Rol' : 'Creación de Usuario/Rol',
      details: `${editingUser ? 'Modificó' : 'Creó'} al usuario ${newUserObj.fullName} con rol (${getRoleLabel(newUserObj.roleType)}).`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    setIsModalOpen(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`¿Está seguro de eliminar los accesos administrativos de ${userName}?`)) {
      setAdminUsers((prev) => prev.filter((u) => u.id !== userId));
      const newLog: SystemAuditLog = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString('es-CO'),
        userId: 'user-admin-1',
        userName: 'Administrador del Sistema',
        userRole: 'Administración',
        module: 'Gestión de Roles',
        action: 'Revocación de Usuario',
        details: `Eliminó accesos del usuario ${userName}.`,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  // Helper functions for roles
  const getRoleLabel = (role: SystemRoleType) => {
    switch (role) {
      case 'propietario':
        return '👑 Propietario / Socio';
      case 'administrador':
        return '🏢 Administrador General';
      case 'veterinario':
        return '🩺 Veterinario / Zootecnista';
      case 'mayordomo':
        return '🤠 Mayordomo / Caporal';
      case 'financiero_contador':
        return '💼 Financiero / Contador';
      default:
        return '👤 Usuario Administrativo';
    }
  };

  const getRoleBadgeStyle = (role: SystemRoleType) => {
    switch (role) {
      case 'propietario':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'administrador':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'veterinario':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'mayordomo':
        return 'bg-amber-800/10 text-amber-950 border-amber-300';
      case 'financiero_contador':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-[#1F3327] text-white border-white/15';
    }
  };

  // Filter users
  const filteredUsers = adminUsers.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.documentId.includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.customRoleTitle && u.customRoleTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'todos' || u.roleType === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  // Role Statistics Counter
  const ownersCount = adminUsers.filter((u) => u.roleType === 'propietario').length;
  const adminsCount = adminUsers.filter((u) => u.roleType === 'administrador').length;
  const vetsCount = adminUsers.filter((u) => u.roleType === 'veterinario').length;
  const foremenCount = adminUsers.filter((u) => u.roleType === 'mayordomo').length;
  const financialCount = adminUsers.filter((u) => u.roleType === 'financiero_contador').length;

  return (
    <div className="space-y-6 w-full pb-24">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-[#012d1d] via-[#02402a] to-[#011c12] text-white p-6 rounded-3xl border border-[#ffba38]/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#D4A94E]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#D4A94E] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Módulo Administrativo
              </span>
              <span className="text-emerald-300 text-xs font-mono font-bold">
                Gestión Centralizada de Usuarios & Roles
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Estructura de Roles & Gobierno de la Hacienda
              </h1>
              <div className="group relative inline-flex items-center">
                <button
                  type="button"
                  className="text-[#a3b8ad] hover:text-[#A5B8AC] transition-colors p-0.5 rounded cursor-pointer"
                  title="Asignación de perfiles para Propietarios, Administradores, Veterinarios/Zootecnistas, Mayordomos/Caporales y Financieros/Contadores con control de firmas y matriz de permisos por módulo."
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-80 bg-[#0D1A13] text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl border border-[#2d6a4f] pointer-events-none animate-in fade-in zoom-in-95">
                  Asignación de perfiles para <b>Propietarios, Administradores, Veterinarios/Zootecnistas, Mayordomos/Caporales y Financieros/Contadores</b> con control de firmas y matriz de permisos por módulo.
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="bg-[#D4A94E] hover:bg-[#e0a22e] text-white font-black text-xs uppercase px-5 py-3 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 self-start md:self-auto border border-[#ffba38]"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Crear Usuario / Rol Administrativo</span>
          </button>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block flex items-center gap-1">
              👑 Propietario(s)
            </span>
            <span className="text-xl font-black text-white mt-0.5 block">{ownersCount}</span>
            <span className="text-[10px] text-[#A5B8AC]">Socios / Dueños</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-blue-300 font-bold block flex items-center gap-1">
              🏢 Administrador(es)
            </span>
            <span className="text-xl font-black text-white mt-0.5 block">{adminsCount}</span>
            <span className="text-[10px] text-[#A5B8AC]">Gerencia Operativa</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block flex items-center gap-1">
              🩺 Veterinarios
            </span>
            <span className="text-xl font-black text-white mt-0.5 block">{vetsCount}</span>
            <span className="text-[10px] text-[#A5B8AC]">Zootecnia & Sanidad</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-orange-300 font-bold block flex items-center gap-1">
              🤠 Mayordomos
            </span>
            <span className="text-xl font-black text-white mt-0.5 block">{foremenCount}</span>
            <span className="text-[10px] text-[#A5B8AC]">Supervisión de Campo</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold block flex items-center gap-1">
              💼 Financiero / Contador
            </span>
            <span className="text-xl font-black text-white mt-0.5 block">{financialCount}</span>
            <span className="text-[10px] text-[#A5B8AC]">Contabilidad & PILA</span>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('directorio')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'directorio'
                ? 'bg-[#0D1A13] text-[#ffba38] shadow-md font-black'
                : 'bg-[#15241C] text-[#A5B8AC] hover:bg-[#1F3327] border border-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Directorio de Usuarios ({adminUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('matriz')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'matriz'
                ? 'bg-[#0D1A13] text-[#ffba38] shadow-md font-black'
                : 'bg-[#15241C] text-[#A5B8AC] hover:bg-[#1F3327] border border-white/10'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Matriz de Permisos por Rol</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notificaciones')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'notificaciones'
                ? 'bg-[#0D1A13] text-[#ffba38] shadow-md font-black'
                : 'bg-[#15241C] text-[#A5B8AC] hover:bg-[#1F3327] border border-white/10'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Notificaciones por Correo ({recipients.filter(r => r.status === 'active').length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('auditoria')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'auditoria'
                ? 'bg-[#0D1A13] text-[#ffba38] shadow-md font-black'
                : 'bg-[#15241C] text-[#A5B8AC] hover:bg-[#1F3327] border border-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Registro de Auditoría & Seguridad ({auditLogs.length})</span>
          </button>
        </div>

        {activeSubTab === 'directorio' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#A5B8AC] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold pl-9 pr-3 py-2 bg-[#15241C] rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
              />
            </div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="text-xs font-bold bg-[#15241C] text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
            >
              <option value="todos">Todos los Roles</option>
              <option value="propietario">👑 Propietario(s)</option>
              <option value="administrador">🏢 Administrador(es)</option>
              <option value="veterinario">🩺 Veterinario(s)</option>
              <option value="mayordomo">🤠 Mayordomo(s)</option>
              <option value="financiero_contador">💼 Financiero / Contador</option>
            </select>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: DIRECTORIO DE USUARIOS & CARGOS */}
      {activeSubTab === 'directorio' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-[#15241C] p-5 rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0D1A13] text-[#ffba38] flex items-center justify-center font-black text-base shadow-sm">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white leading-tight">{user.fullName}</h3>
                        <span className="text-[11px] text-[#A5B8AC] font-mono block">C.C. {user.documentId}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadgeStyle(
                        user.roleType
                      )}`}
                    >
                      {getRoleLabel(user.roleType)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-[#A5B8AC]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#A5B8AC]">Cargo Específico:</span>
                      <span className="font-bold text-white">{user.customRoleTitle || 'Sin especificar'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#A5B8AC]">Email:</span>
                      <span className="font-mono text-white">{user.email || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#A5B8AC]">Teléfono:</span>
                      <span className="font-mono text-white">{user.phone || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#A5B8AC]">PIN de Firma:</span>
                      <span className="font-mono font-bold bg-[#1F3327] text-white px-2 py-0.5 rounded text-[10px]">
                        •••• ({user.securityPin})
                      </span>
                    </div>

                    {/* ROLE SPECIFIC ATTR DISPLAY */}
                    {user.roleType === 'propietario' && user.ownershipPercentage !== undefined && (
                      <div className="flex items-center justify-between bg-amber-950/30 p-1.5 rounded-lg border border-amber-200 mt-1">
                        <span className="font-bold text-amber-900">Participación Accionaria:</span>
                        <span className="font-black text-amber-900">{user.ownershipPercentage}%</span>
                      </div>
                    )}

                    {(user.roleType === 'administrador' || user.roleType === 'financiero_contador') &&
                      user.maxDisbursementApproval !== undefined && (
                        <div className="flex items-center justify-between bg-blue-950/30 p-1.5 rounded-lg border border-blue-200 mt-1">
                          <span className="font-bold text-blue-900">Límite Desembolso:</span>
                          <span className="font-black text-blue-900">
                            ${user.maxDisbursementApproval.toLocaleString()} COP
                          </span>
                        </div>
                      )}

                    {(user.roleType === 'veterinario' || user.roleType === 'financiero_contador') &&
                      user.professionalLicenseNo && (
                        <div className="flex items-center justify-between bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-200 mt-1">
                          <span className="font-bold text-emerald-900">Matrícula / TP:</span>
                          <span className="font-mono font-bold text-emerald-900">{user.professionalLicenseNo}</span>
                        </div>
                      )}

                    {user.roleType === 'mayordomo' && user.assignedPaddocksOrLotsScope && (
                      <div className="flex items-center justify-between bg-orange-50 p-1.5 rounded-lg border border-orange-200 mt-1">
                        <span className="font-bold text-orange-900">Ámbito de Lotes:</span>
                        <span className="font-bold text-orange-900 text-[10px]">
                          {user.assignedPaddocksOrLotsScope.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ACTIVE PERMISSIONS BADGES */}
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-bold uppercase text-[#A5B8AC] block mb-1">
                      Módulos Habilitados:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.cattle && (
                        <span className="bg-emerald-950/30 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                          Ganado
                        </span>
                      )}
                      {user.permissions.dairy && (
                        <span className="bg-blue-950/30 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                          Lechería
                        </span>
                      )}
                      {user.permissions.sanitary && (
                        <span className="bg-rose-950/30 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-200">
                          Sanidad
                        </span>
                      )}
                      {user.permissions.finance && (
                        <span className="bg-purple-950/30 text-purple-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-200">
                          Finanzas
                        </span>
                      )}
                      {user.permissions.payroll && (
                        <span className="bg-teal-50 text-teal-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-teal-200">
                          Nómina
                        </span>
                      )}
                      {user.permissions.admin && (
                        <span className="bg-amber-950/30 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#A5B8AC]">
                    Último acceso: {user.lastLogin || 'Hoy'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="p-1.5 text-blue-600 hover:bg-blue-950/30 rounded-lg transition"
                      title="Editar usuario y rol"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.fullName)}
                      className="p-1.5 text-rose-600 hover:bg-rose-950/30 rounded-lg transition"
                      title="Revocar acceso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center bg-[#15241C] rounded-2xl border border-white/10 space-y-3">
              <Users className="w-12 h-12 text-[#A5B8AC] mx-auto" />
              <h3 className="font-bold text-white">No se encontraron usuarios administrativos</h3>
              <p className="text-xs text-[#A5B8AC]">Pruebe ajustando los filtros de búsqueda o cree un nuevo rol.</p>
              <button
                onClick={handleOpenCreateModal}
                className="bg-[#0D1A13] text-[#ffba38] text-xs font-bold px-4 py-2 rounded-xl"
              >
                + Crear Usuario / Rol
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MATRIZ DE PERMISOS POR ROL */}
      {activeSubTab === 'matriz' && (
        <div className="bg-[#15241C] rounded-2xl border border-white/10 p-5 shadow-sm space-y-4 overflow-x-auto">
          <div>
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Matriz de Control de Accesos & Permisos por Módulo</span>
            </h3>
            <p className="text-xs text-[#A5B8AC]">
              Desglose detallado de privilegios asignados por cada rol en los 10 módulos principales del sistema.
            </p>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1F3327] text-white uppercase font-black border-b border-white/10">
                <th className="p-3">Usuario & Rol</th>
                <th className="p-2 text-center">Ganado</th>
                <th className="p-2 text-center">Lechería</th>
                <th className="p-2 text-center">Genética</th>
                <th className="p-2 text-center">Sanidad</th>
                <th className="p-2 text-center">Finanzas</th>
                <th className="p-2 text-center">Nómina</th>
                <th className="p-2 text-center">Almacén</th>
                <th className="p-2 text-center">SIG</th>
                <th className="p-2 text-center">Admin</th>
                <th className="p-2 text-center">Reportes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {adminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#0D1A13]">
                  <td className="p-3">
                    <div className="font-bold text-white">{user.fullName}</div>
                    <div className="text-[10px] text-[#A5B8AC] font-mono">
                      {getRoleLabel(user.roleType)} • {user.customRoleTitle || ''}
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.cattle ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.dairy ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.genetics ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.sanitary ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.finance ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.payroll ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.inventory ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.gis ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.admin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {user.permissions.reports ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-[#A5B8AC] mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 3: CANALES DE NOTIFICACIÓN POR CORREO */}
      {activeSubTab === 'notificaciones' && (
        <NotificationChannelsManager
          recipients={recipients}
          setRecipients={setRecipients}
          deliveryLogs={deliveryLogs}
          setDeliveryLogs={setDeliveryLogs}
        />
      )}

      {/* SUB-TAB 4: REGISTRO DE AUDITORÍA & SEGURIDAD */}
      {activeSubTab === 'auditoria' && (
        <div className="bg-[#15241C] rounded-2xl border border-white/10 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>Historial de Auditoría & Trazabilidad de Acciones</span>
              </h3>
              <p className="text-xs text-[#A5B8AC]">
                Registro inmutable de actividades administrativas, firmas digitales y cambios de configuración.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              🔒 Trazabilidad Activa
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-[#0D1A13] rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">{log.userName}</span>
                    <span className="text-[10px] font-mono bg-gray-200 text-white px-1.5 py-0.5 rounded">
                      {log.userRole}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-200">
                      {log.module}
                    </span>
                  </div>
                  <p className="text-white font-medium">{log.details}</p>
                </div>
                <div className="text-right sm:text-right font-mono text-[11px] text-[#A5B8AC] whitespace-nowrap">
                  <div>{log.timestamp}</div>
                  <span className="text-[10px] text-[#A5B8AC] font-semibold">{log.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR USUARIO Y ROL ADMINISTRATIVO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#15241C] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/10 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#0D1A13] text-[#ffba38] rounded-2xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">
                    {editingUser ? 'Editar Usuario / Rol Administrativo' : 'Crear Nuevo Usuario y Rol'}
                  </h3>
                  <p className="text-xs text-[#A5B8AC]">
                    Defina el cargo, privilegios de acceso y firma de seguridad.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#A5B8AC] hover:text-white rounded-xl hover:bg-[#1F3327] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              {/* ROL SELECTOR PRINCIPAL */}
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                <label className="font-black text-amber-950 uppercase tracking-wider block text-[10.5px]">
                  1. Selección de Rol Administrativo Principal:
                </label>
                <select
                  value={formRoleType}
                  onChange={(e) => handleRoleTypeChange(e.target.value as SystemRoleType)}
                  className="w-full text-xs font-black bg-[#15241C] text-white p-3 rounded-xl border border-amber-300 focus:ring-2 focus:ring-[#012d1d]"
                >
                  <option value="propietario">👑 Propietario(s) / Socio Accionista / Dueño</option>
                  <option value="administrador">🏢 Administrador(es) General / Gerente Operativo</option>
                  <option value="veterinario">🩺 Veterinario(s) / Zootecnista / Sanidad</option>
                  <option value="mayordomo">🤠 Mayordomo(s) / Caporal / Encargado de Campo</option>
                  <option value="financiero_contador">💼 Financiero / Contador Público / Revisor Fiscal</option>
                  <option value="otro">👤 Otro Cargo Personalizado</option>
                </select>
              </div>

              {/* INFORMACIÓN PERSONAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-white block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Don Juan Carlos Restrepo"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full p-2.5 bg-[#0D1A13] rounded-xl border border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-white block mb-1">Cédula / Documento ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 79.482.109"
                    value={formDocumentId}
                    onChange={(e) => setFormDocumentId(e.target.value)}
                    className="w-full p-2.5 bg-[#0D1A13] rounded-xl border border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-white block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#0D1A13] rounded-xl border border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-white block mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="+57 310 000 0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#0D1A13] rounded-xl border border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                  />
                </div>
              </div>

              {/* TÍTULO DE CARGO & CAMPOS ESPECÍFICOS SEGÚN EL ROL */}
              <div className="p-3.5 bg-[#0D1A13] rounded-2xl border border-white/10 space-y-3">
                <div>
                  <label className="font-bold text-white block mb-1">Título Específico del Cargo</label>
                  <input
                    type="text"
                    placeholder="Ej: Director Ganadero / Zootecnista Senior"
                    value={formCustomRoleTitle}
                    onChange={(e) => setFormCustomRoleTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#15241C] rounded-xl border border-white/10 text-xs font-semibold"
                  />
                </div>

                {/* ROLE SPECIFIC INPUTS */}
                {formRoleType === 'propietario' && (
                  <div>
                    <label className="font-bold text-amber-900 block mb-1">
                      Porcentaje de Participación / Propiedad (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formOwnershipPercentage}
                      onChange={(e) => setFormOwnershipPercentage(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#15241C] rounded-xl border border-amber-300 text-xs font-bold text-amber-900"
                    />
                  </div>
                )}

                {(formRoleType === 'administrador' ||
                  formRoleType === 'financiero_contador' ||
                  formRoleType === 'propietario') && (
                  <div>
                    <label className="font-bold text-blue-900 block mb-1">
                      Límite Máximo de Aprobación de Desembolso ($ COP)
                    </label>
                    <input
                      type="number"
                      step="1000000"
                      value={formMaxDisbursementApproval}
                      onChange={(e) => setFormMaxDisbursementApproval(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#15241C] rounded-xl border border-blue-300 text-xs font-bold text-blue-900"
                    />
                  </div>
                )}

                {(formRoleType === 'veterinario' || formRoleType === 'financiero_contador') && (
                  <div>
                    <label className="font-bold text-emerald-900 block mb-1">
                      Matrícula Profesional / Licencia (COMVEZCOL, ICA o TP)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: COMVEZCOL-14209 / ICA-0924 / TP-192842"
                      value={formProfessionalLicenseNo}
                      onChange={(e) => setFormProfessionalLicenseNo(e.target.value)}
                      className="w-full p-2.5 bg-[#15241C] rounded-xl border border-emerald-300 text-xs font-mono font-bold text-emerald-900"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-white block mb-1">PIN de Firma / Seguridad (4 Dígitos)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formSecurityPin}
                      onChange={(e) => setFormSecurityPin(e.target.value)}
                      className="w-full p-2.5 bg-[#15241C] rounded-xl border border-white/15 text-xs font-mono font-bold text-center tracking-widest text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-white block mb-1">Estado del Acceso</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-[#15241C] rounded-xl border border-white/15 text-xs font-bold"
                    >
                      <option value="activo">✅ Activo</option>
                      <option value="inactivo">⏸️ Inactivo</option>
                      <option value="suspendido">🚫 Suspendido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* MATRIZ DE PERMISOS DE ACCESO POR MÓDULO */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <label className="font-black text-white uppercase tracking-wider block text-[10.5px]">
                  2. Configuración de Permisos por Módulo:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#0D1A13] p-3 rounded-2xl border border-white/10">
                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#15241C] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.cattle}
                      onChange={(e) => setFormPermissions({ ...formPermissions, cattle: e.target.checked })}
                      className="rounded text-white focus:ring-[#012d1d]"
                    />
                    <span className="font-semibold text-white">Ganado & Pesajes</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#15241C] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.dairy}
                      onChange={(e) => setFormPermissions({ ...formPermissions, dairy: e.target.checked })}
                      className="rounded text-white focus:ring-[#012d1d]"
                    />
                    <span className="font-semibold text-white">Lechería & Ordeño</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#15241C] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.genetics}
                      onChange={(e) => setFormPermissions({ ...formPermissions, genetics: e.target.checked })}
                      className="rounded text-white focus:ring-[#012d1d]"
                    />
                    <span className="font-semibold text-white">Genética & Embrios</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#15241C] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.sanitary}
                      onChange={(e) => setFormPermissions({ ...formPermissions, sanitary: e.target.checked })}
                      className="rounded text-white focus:ring-[#012d1d]"
                    />
                    <span className="font-semibold text-white">Sanidad & Recetas</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#15241C] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.finance}
                      onChange={(e) => setFormPermissions({ ...formPermissions, finance: e.target.checked })}
                      className="rounded text-white focus:ring-[#012d1d]"
                    />
                    <span className="font-semibold text-white">Finanzas & Costos</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#15241C] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.payroll}
                      onChange={(e) => setFormPermissions({ ...formPermissions, payroll: e.target.checked })}
                      className="rounded text-white focus:ring-[#012d1d]"
                    />
                    <span className="font-semibold text-white">Nómina & PILA</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#15241C] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.inventory}
                      onChange={(e) => setFormPermissions({ ...formPermissions, inventory: e.target.checked })}
                      className="rounded text-white focus:ring-[#012d1d]"
                    />
                    <span className="font-semibold text-white">Almacén & Lotes</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#15241C] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.admin}
                      onChange={(e) => setFormPermissions({ ...formPermissions, admin: e.target.checked })}
                      className="rounded text-white focus:ring-[#012d1d]"
                    />
                    <span className="font-semibold text-white">Gestión Admin</span>
                  </label>

                  <label className="flex items-center gap-2 p-1.5 hover:bg-[#15241C] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.reports}
                      onChange={(e) => setFormPermissions({ ...formPermissions, reports: e.target.checked })}
                      className="rounded text-white focus:ring-[#012d1d]"
                    />
                    <span className="font-semibold text-white">Informes Ejecutivos</span>
                  </label>
                </div>
              </div>

              {/* OBSERVACIONES */}
              <div>
                <label className="font-bold text-white block mb-1">Notas u Observaciones del Cargo</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de responsabilidad, funciones clave o restricciones..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-[#0D1A13] rounded-xl border border-white/10 text-xs"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#A5B8AC] hover:bg-[#1F3327] rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black bg-[#0D1A13] hover:bg-[#02402a] text-[#ffba38] rounded-xl transition shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingUser ? 'Guardar Cambios' : 'Crear Usuario / Rol'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
