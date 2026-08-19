import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  TrendingUp,
  Building2,
  Users,
  HardDrive,
  MessageSquare,
  Cpu,
  Search,
  Filter,
  Sliders,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  LifeBuoy,
  Plus,
  ArrowUpRight,
  Download,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Check,
  X,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  LogOut,
} from 'lucide-react';
import {
  TenantRecord,
  SuperadminGlobalMetrics,
  SuperadminAuditLog,
  TenantStatus,
  TenantPlan,
} from '../types';
import {
  INITIAL_SUPERADMIN_METRICS,
  INITIAL_TENANTS,
  INITIAL_SUPERADMIN_AUDIT_LOGS,
} from '../data/mockSuperadminData';
import { AdminTenantDrawer } from './AdminTenantDrawer';

export interface SuperadminDashboardViewProps {
  onStartImpersonation: (tenant: TenantRecord) => void;
  onExitToMyFarms: () => void;
  onLogout?: () => void;
}

export const SuperadminDashboardView: React.FC<SuperadminDashboardViewProps> = ({
  onStartImpersonation,
  onExitToMyFarms,
  onLogout,
}) => {
  // State
  const [metrics, setMetrics] = useState<SuperadminGlobalMetrics>(INITIAL_SUPERADMIN_METRICS);
  const [tenants, setTenants] = useState<TenantRecord[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_superadmin_tenants');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TENANTS;
  });

  const [auditLogs, setAuditLogs] = useState<SuperadminAuditLog[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_superadmin_logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SUPERADMIN_AUDIT_LOGS;
  });

  // Selected Tenant for Drawer
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<TenantPlan | 'all'>('all');
  const [activeMainTab, setActiveMainTab] = useState<'tenants' | 'audit' | 'metrics'>('tenants');

  // Persistence
  const saveTenants = (updated: TenantRecord[]) => {
    setTenants(updated);
    try {
      localStorage.setItem('ganaderia_superadmin_tenants', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const addAuditLog = (
    actionType: SuperadminAuditLog['actionType'],
    details: string,
    tenantId?: string,
    tenantName?: string
  ) => {
    const newLog: SuperadminAuditLog = {
      id: `log-sa-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      superadminEmail: 'superadmin@ganaderia.cloud',
      actionType,
      details,
      tenantId,
      tenantName,
      ipAddress: '190.158.42.11',
      status: 'success',
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    try {
      localStorage.setItem('ganaderia_superadmin_logs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Tenants List
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        t.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tenantCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPlan = planFilter === 'all' || t.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [tenants, searchTerm, statusFilter, planFilter]);

  // Handlers for Drawer
  const handleOpenDrawer = (tenant: TenantRecord) => {
    setSelectedTenant(tenant);
    setIsDrawerOpen(true);
  };

  const handleUpdateTenant = (updated: TenantRecord) => {
    const newTenants = tenants.map((t) => (t.id === updated.id ? updated : t));
    saveTenants(newTenants);
    setSelectedTenant(updated);
    addAuditLog(
      'feature_flag_toggle',
      `Actualizada configuración y feature flags para ${updated.farmName}`,
      updated.id,
      updated.farmName
    );
  };

  const handleToggleSuspend = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;
    const newStatus: TenantStatus = target.status === 'suspended' ? 'active' : 'suspended';
    const updated = tenants.map((t) => (t.id === tenantId ? { ...t, status: newStatus } : t));
    saveTenants(updated);
    if (selectedTenant && selectedTenant.id === tenantId) {
      setSelectedTenant({ ...selectedTenant, status: newStatus });
    }
    addAuditLog(
      'tenant_status_change',
      `Estado de ${target.farmName} cambiado a "${newStatus}"`,
      target.id,
      target.farmName
    );
  };

  const handleExtendTrial = (tenantId: string, days = 7) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;
    const newEnd = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
    const updated = tenants.map((t) =>
      t.id === tenantId ? { ...t, trialEndsAt: newEnd, status: 'trial' as TenantStatus } : t
    );
    saveTenants(updated);
    if (selectedTenant && selectedTenant.id === tenantId) {
      setSelectedTenant({ ...selectedTenant, trialEndsAt: newEnd });
    }
    addAuditLog(
      'trial_extended',
      `Período de prueba extendido ${days} días (Vence: ${newEnd}) para ${target.farmName}`,
      target.id,
      target.farmName
    );
  };

  const handleResetPolicyLock = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;
    const newBypass = !target.isPolicyLockBypassed;
    const updated = tenants.map((t) =>
      t.id === tenantId ? { ...t, isPolicyLockBypassed: newBypass } : t
    );
    saveTenants(updated);
    if (selectedTenant && selectedTenant.id === tenantId) {
      setSelectedTenant({ ...selectedTenant, isPolicyLockBypassed: newBypass });
    }
    addAuditLog(
      'policy_lock_reset',
      `Bypass de política de numeración establecido en ${newBypass} para ${target.farmName}`,
      target.id,
      target.farmName
    );
  };

  // Export audit logs
  const handleExportLogs = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Timestamp,Admin,Accion,Tenant,Detalles,IP,Estado\n' +
      auditLogs
        .map(
          (l) =>
            `"${l.id}","${l.timestamp}","${l.superadminEmail}","${l.actionType}","${
              l.tenantName || ''
            }","${l.details.replace(/"/g, '""')}","${l.ipAddress}","${l.status}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ganaderia_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-950 text-white p-5 sm:p-7 rounded-3xl border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              SUPABASE AUTH • IS_SUPERADMIN = TRUE
            </span>
            <span className="text-xs text-neutral-400">Plataforma Cloud v4.2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 text-white">
            <Globe className="w-7 h-7 text-amber-400" />
            <span>Panel de Administración Global</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Consola central de supervisión SaaS Multi-Tenant, gestión de cuotas de recursos, feature flags por ganadería y auditoría inmutable.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onExitToMyFarms}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Ir a la App</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Cerrar Sesión Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BENTO-GRID DE KPIS GLOBALES SAAS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: MRR / ARR */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Ingresos Recurrentes
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-3 h-3" /> +{metrics.mrrGrowthPct}% MoM
            </span>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              ${metrics.mrrUsd.toLocaleString()} <span className="text-xs font-semibold text-neutral-400">USD/mes</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">
              ARR Proyectado: <span className="font-bold text-neutral-800 dark:text-neutral-200">${metrics.arrUsd.toLocaleString()} USD</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Total Tenants */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Predios Registrados
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              {metrics.trialTenantsCount} en prueba
            </span>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              {metrics.totalTenantsCount}{' '}
              <span className="text-xs font-semibold text-neutral-400">Ganaderías</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">
              <span className="text-emerald-600 font-bold">{metrics.activeTenantsCount} Activos</span> •{' '}
              <span className="text-rose-500 font-bold">{metrics.suspendedTenantsCount} Suspendidos</span>
            </p>
          </div>
        </div>

        {/* KPI 3: Total Animales Gestionados */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Animales Gestionados
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              Bovinos + Búfalos
            </span>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              {metrics.totalManagedAnimals.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-neutral-400">Cabezas</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">
              {metrics.totalCattleCount.toLocaleString()} Bovinos • {metrics.totalBuffaloCount.toLocaleString()} Búfalos
            </p>
          </div>
        </div>

        {/* KPI 4: Consumo de Recursos & WhatsApp API */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Consumo Cloud & API
            </span>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Supabase + Meta
            </span>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              {(metrics.whatsAppMessagesSentTotal / 1000).toFixed(1)}k{' '}
              <span className="text-xs font-semibold text-neutral-400">Msgs WhatsApp</span>
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
              <span>IA: {(metrics.aiQueriesExecutedTotal / 1000).toFixed(1)}k</span>
              <span>Storage: {metrics.storageGigabytesTotal} GB</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMainTab('tenants')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'tenants'
                ? 'bg-[#043825] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Directorio de Tenants ({tenants.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'audit'
                ? 'bg-[#043825] text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoría & Logs ({auditLogs.length})</span>
          </button>
        </div>

        {activeMainTab === 'audit' && (
          <button
            type="button"
            onClick={handleExportLogs}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DIRECTORIO DE TENANTS (LISTADO & FILTROS) */}
      {/* ========================================================================= */}
      {activeMainTab === 'tenants' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por finca, tenant, propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 font-medium"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {/* Status Filter */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Activos
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('trial')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'trial'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Trial
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('suspended')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'suspended'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Suspendidos
                </button>
              </div>

              {/* Plan Filter */}
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as TenantPlan | 'all')}
                className="px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 capitalize"
              >
                <option value="all">Todos los Planes</option>
                <option value="starter_finca">Starter Finca</option>
                <option value="pro_ganadero">Pro Ganadero</option>
                <option value="enterprise_corporativo">Enterprise Corporativo</option>
              </select>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DESKTOP TABLE VIEW (>= md) */}
          {/* ========================================================================= */}
          <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Predio & Código Tenant</th>
                    <th className="py-3.5 px-4">Propietario & Contacto</th>
                    <th className="py-3.5 px-4">Plan & Cobro</th>
                    <th className="py-3.5 px-4 text-center">Cabezas</th>
                    <th className="py-3.5 px-4 text-center">WhatsApp / IA</th>
                    <th className="py-3.5 px-4 text-center">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {filteredTenants.map((t) => {
                    const isSuspended = t.status === 'suspended';
                    return (
                      <tr
                        key={t.id}
                        onClick={() => handleOpenDrawer(t)}
                        className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
                      >
                        {/* Farm & Tenant Code */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#043825] dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-100 dark:border-emerald-800/40">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-extrabold text-neutral-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                                {t.farmName}
                              </p>
                              <p className="text-[10px] text-neutral-400 font-mono">
                                {t.tenantCode} • {t.municipality}, {t.department}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Owner & Contact */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-neutral-800 dark:text-neutral-200">
                            {t.ownerName}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate max-w-[180px]">
                            {t.ownerPhone} • {t.ownerEmail}
                          </p>
                        </td>

                        {/* Plan & Fee */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-neutral-800 dark:text-neutral-200 capitalize block">
                            {t.plan.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                            ${t.monthlyFeeUsd} USD / mes
                          </span>
                        </td>

                        {/* Heads */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-neutral-900 dark:text-white block">
                            {t.totalHeads.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {t.totalHectares} Ha
                          </span>
                        </td>

                        {/* WhatsApp / IA usage */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
                            {t.quotas.whatsAppMessagesSentThisMonth} / {t.quotas.whatsAppMonthlyQuota}
                          </span>
                          <span className="text-[10px] text-amber-600 font-mono">
                            {t.quotas.aiQueriesUsedThisMonth} IA
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block ${
                              t.status === 'active'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : t.status === 'trial'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => onStartImpersonation(t)}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-neutral-950 transition-colors cursor-pointer"
                              title="Entrar como Soporte / Impersonar"
                            >
                              <LifeBuoy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDrawer(t)}
                              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                              title="Abrir Drawer de Configuración"
                            >
                              <Sliders className="w-4 h-4" />
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

          {/* ========================================================================= */}
          {/* MOBILE CARDS VIEW (< md) */}
          {/* ========================================================================= */}
          <div className="md:hidden space-y-3">
            {filteredTenants.map((t) => (
              <div
                key={t.id}
                onClick={() => handleOpenDrawer(t)}
                className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#043825] flex items-center justify-center font-bold shrink-0 border border-emerald-100">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                        {t.farmName}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {t.tenantCode} • {t.municipality}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      t.status === 'active'
                        ? 'bg-emerald-100 text-emerald-900'
                        : t.status === 'trial'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Propietario</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate block">
                      {t.ownerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Hato / Área</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {t.totalHeads} Cab. • {t.totalHectares} Ha
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    ${t.monthlyFeeUsd} USD/m • {t.plan.replace('_', ' ')}
                  </span>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onStartImpersonation(t)}
                      className="px-2.5 py-1 bg-amber-500 text-neutral-950 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <LifeBuoy className="w-3 h-3" />
                      <span>Soporte</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(t)}
                      className="px-2.5 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <span>Gestionar</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AUDITORÍA GLOBAL & LOGS INMUTABLES */}
      {/* ========================================================================= */}
      {activeMainTab === 'audit' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Registro Inmutable de Eventos Críticos (Audit Trail)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Trazabilidad de inicio de sesión de soporte, switches de feature flags y cambios de suscripción.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-lg">
              {auditLogs.length} Registros
            </span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 sm:p-4 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-neutral-400">
                      {log.timestamp}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-md uppercase ${
                        log.actionType.includes('impersonation')
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300'
                          : log.actionType.includes('status')
                          ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300'
                      }`}
                    >
                      {log.actionType.replace(/_/g, ' ')}
                    </span>
                    {log.tenantName && (
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {log.tenantName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-normal">
                    {log.details}
                  </p>
                </div>

                <div className="text-right sm:shrink-0 text-[11px] text-neutral-400 font-mono">
                  <span>{log.superadminEmail}</span>
                  <span className="block text-[10px] text-neutral-500">IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-over Drawer for Tenant Configuration */}
      <AdminTenantDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tenant={selectedTenant}
        onUpdateTenant={handleUpdateTenant}
        onStartImpersonation={onStartImpersonation}
        onExtendTrial={handleExtendTrial}
        onToggleSuspend={handleToggleSuspend}
        onResetPolicyLock={handleResetPolicyLock}
      />
    </div>
  );
};
