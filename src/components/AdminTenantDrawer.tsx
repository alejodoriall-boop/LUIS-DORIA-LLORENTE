import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShieldAlert,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  KeyRound,
  RotateCcw,
  Save,
  MessageSquare,
  HardDrive,
  Cpu,
  Users,
  Layers,
  LifeBuoy,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  TenantRecord,
  TenantFeatureFlags,
  TenantQuotas,
  TenantStatus,
  TenantPlan,
} from '../types';

export interface AdminTenantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantRecord | null;
  onUpdateTenant: (updated: TenantRecord) => void;
  onStartImpersonation: (tenant: TenantRecord) => void;
  onExtendTrial: (tenantId: string, days: number) => void;
  onToggleSuspend: (tenantId: string) => void;
  onResetPolicyLock: (tenantId: string) => void;
}

export const AdminTenantDrawer: React.FC<AdminTenantDrawerProps> = ({
  isOpen,
  onClose,
  tenant,
  onUpdateTenant,
  onStartImpersonation,
  onExtendTrial,
  onToggleSuspend,
  onResetPolicyLock,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'quotas' | 'features' | 'security'>('features');
  const [formData, setFormData] = useState<TenantRecord | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData(JSON.parse(JSON.stringify(tenant)));
      setSaveSuccess(false);
    }
  }, [tenant]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!tenant || !formData) return null;

  const handleToggleFeature = (key: keyof TenantFeatureFlags) => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        featureFlags: {
          ...prev.featureFlags,
          [key]: !prev.featureFlags[key],
        },
      };
    });
  };

  const handleQuotaChange = (key: keyof TenantQuotas, value: number) => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        quotas: {
          ...prev.quotas,
          [key]: value,
        },
      };
    });
  };

  const handleSave = () => {
    if (formData) {
      onUpdateTenant(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const isSuspended = formData.status === 'suspended';
  const isTrial = formData.status === 'trial';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Slide-over Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-xl bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#123F2A] text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm border border-emerald-800/40 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white leading-tight">
                          {formData.farmName}
                        </h2>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            formData.status === 'active'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                              : formData.status === 'trial'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800'
                              : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {formData.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                          {formData.tenantCode}
                        </span>
                        <span>•</span>
                        <span>{formData.legalBusinessName}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Cerrar Panel (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Impersonation Action Banner */}
                <div className="mt-4 pt-3 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onStartImpersonation(formData);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <LifeBuoy className="w-4 h-4" />
                      <span>Entrar como Soporte</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleSuspend(formData.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSuspended
                          ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {isSuspended ? (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Reactivar Cuenta</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Suspender</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isTrial && (
                    <button
                      type="button"
                      onClick={() => onExtendTrial(formData.id, 7)}
                      className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                    >
                      +7 Días Prueba
                    </button>
                  )}
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 mt-4 bg-neutral-200/70 dark:bg-neutral-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('features')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      activeTab === 'features'
                        ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    Feature Flags
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quotas')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      activeTab === 'quotas'
                        ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    Límites & Cuotas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      activeTab === 'info'
                        ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    Facturación
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      activeTab === 'security'
                        ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    Seguridad
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
                {/* ========================================================= */}
                {/* TAB 1: FEATURE FLAGS MODULARES */}
                {/* ========================================================= */}
                {activeTab === 'features' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                          Activación Modular por Ganadería
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Habilita módulos avanzados según el plan comercial contratado.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-md">
                        {Object.values(formData.featureFlags).filter(Boolean).length}/8 Activos
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Flag 1: Bubalinos */}
                      <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>🐃 Módulo de Bubalinos (Búfalos de Agua)</span>
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Gestión zootécnica de gestación 312d, ordeño de búfala y sólidos de mozzarella.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.featureFlags.enableBuffaloModule}
                            onChange={() => handleToggleFeature('enableBuffaloModule')}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#123F2A]" />
                        </label>
                      </div>

                      {/* Flag 2: WhatsApp IA */}
                      <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>🤖 Asistente IA de Campo por WhatsApp</span>
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Recepción de notas de voz de vaqueros para registro de partos, pesajes y ventas.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.featureFlags.enableWhatsAppAIAssistant}
                            onChange={() => handleToggleFeature('enableWhatsAppAIAssistant')}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#123F2A]" />
                        </label>
                      </div>

                      {/* Flag 3: Plan Sanitario Avanzado */}
                      <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>💉 Plan Sanitario Avanzado & Vacunación</span>
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Control de carbón sintomático, aftosa y tratamientos multidía con alerta de retiro.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.featureFlags.enableAdvancedSanitaryPlan}
                            onChange={() => handleToggleFeature('enableAdvancedSanitaryPlan')}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#123F2A]" />
                        </label>
                      </div>

                      {/* Flag 4: Suplementación MRP */}
                      <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>🌾 Suplementación & Proyección Mensual MRP</span>
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Cálculo de raciones (MS/PB/EM), requerimientos de sales mineralizadas y silo.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.featureFlags.enableSupplementationMRP}
                            onChange={() => handleToggleFeature('enableSupplementationMRP')}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#123F2A]" />
                        </label>
                      </div>

                      {/* Flag 5: Aprobaciones Inventario */}
                      <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>🛡️ Flujo Obligatorio de Aprobaciones</span>
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Exige confirmación de administrador para descartes, ventas y consumo de insumos.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.featureFlags.enableInventoryApprovalFlow}
                            onChange={() => handleToggleFeature('enableInventoryApprovalFlow')}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#123F2A]" />
                        </label>
                      </div>

                      {/* Flag 6: Mapeo GIS */}
                      <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>🛰️ Mapeo GIS Satelital & Aforo de Pastos</span>
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Polígonos georreferenciados, curvas de nivel y cálculo de capacidad de carga.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.featureFlags.enableGisAdvancedMapping}
                            onChange={() => handleToggleFeature('enableGisAdvancedMapping')}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#123F2A]" />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: LÍMITES Y CUOTAS DE CONSUMO */}
                {/* ========================================================= */}
                {activeTab === 'quotas' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                        Cuotas de Recursos e Integraciones
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Ajusta los límites de almacenamiento, mensajes de WhatsApp y capacidad de animales.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Quota 1: Límite de Animales */}
                      <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <span>Cupo Máximo de Animales</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-700">
                            {formData.quotas.usedAnimalsCount} en uso
                          </span>
                        </div>
                        <input
                          type="number"
                          value={formData.quotas.maxAnimalsLimit}
                          onChange={(e) =>
                            handleQuotaChange('maxAnimalsLimit', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm font-extrabold text-neutral-900 dark:text-white"
                        />
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (formData.quotas.usedAnimalsCount /
                                  (formData.quotas.maxAnimalsLimit || 1)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Quota 2: Mensajes WhatsApp */}
                      <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            <span>Mensajes WhatsApp / Mes</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-green-700">
                            {formData.quotas.whatsAppMessagesSentThisMonth} enviados
                          </span>
                        </div>
                        <input
                          type="number"
                          value={formData.quotas.whatsAppMonthlyQuota}
                          onChange={(e) =>
                            handleQuotaChange('whatsAppMonthlyQuota', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm font-extrabold text-neutral-900 dark:text-white"
                        />
                      </div>

                      {/* Quota 3: Consultas IA */}
                      <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-amber-500" />
                            <span>Consultas IA / Mes</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-600">
                            {formData.quotas.aiQueriesUsedThisMonth} usadas
                          </span>
                        </div>
                        <input
                          type="number"
                          value={formData.quotas.aiQueriesMonthlyQuota}
                          onChange={(e) =>
                            handleQuotaChange('aiQueriesMonthlyQuota', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm font-extrabold text-neutral-900 dark:text-white"
                        />
                      </div>

                      {/* Quota 4: Almacenamiento Supabase MB */}
                      <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                            <HardDrive className="w-4 h-4 text-blue-600" />
                            <span>Storage Cuota (MB)</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-blue-600">
                            {(formData.quotas.storageMbUsed / 1024).toFixed(1)} GB en uso
                          </span>
                        </div>
                        <input
                          type="number"
                          value={formData.quotas.storageMbQuota}
                          onChange={(e) =>
                            handleQuotaChange('storageMbQuota', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm font-extrabold text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* TAB 3: INFORMACIÓN GENERAL Y FACTURACIÓN */}
                {/* ========================================================= */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                        Datos del Propietario & Facturación
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Configuración comercial, pasarela de pagos y contacto legal.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                            Propietario / Representante
                          </label>
                          <input
                            type="text"
                            value={formData.ownerName}
                            onChange={(e) =>
                              setFormData({ ...formData, ownerName: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                            Correo Electrónico
                          </label>
                          <input
                            type="email"
                            value={formData.ownerEmail}
                            onChange={(e) =>
                              setFormData({ ...formData, ownerEmail: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                            Teléfono / WhatsApp
                          </label>
                          <input
                            type="text"
                            value={formData.ownerPhone}
                            onChange={(e) =>
                              setFormData({ ...formData, ownerPhone: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                            Plan Comercial
                          </label>
                          <select
                            value={formData.plan}
                            onChange={(e) =>
                              setFormData({ ...formData, plan: e.target.value as TenantPlan })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-bold capitalize"
                          >
                            <option value="starter_finca">Starter Finca ($79/mes)</option>
                            <option value="pro_ganadero">Pro Ganadero ($149/mes)</option>
                            <option value="enterprise_corporativo">
                              Enterprise Corporativo ($299/mes)
                            </option>
                            <option value="custom_agro">Custom Agro Especializado</option>
                          </select>
                        </div>
                      </div>

                      {/* Facturación Card */}
                      <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            <span>Estado de Facturación Stripe</span>
                          </span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400">
                            ${formData.monthlyFeeUsd} USD / mes
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                          <span>Próximo cobro automático:</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {formData.nextBillingDate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                          <span>Stripe Customer ID:</span>
                          <span className="font-mono">{formData.stripeCustomerId || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* TAB 4: SEGURIDAD & POLÍTICAS */}
                {/* ========================================================= */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                        Control de Seguridad & Políticas
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Bypass de restricciones y auditoría técnica de la ganadería.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Action 1: Resetear Bloqueo de Políticas */}
                      <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4 text-amber-600" />
                            <span>Bypass de Políticas de Numeración</span>
                          </p>
                          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-1">
                            Permite al cliente registrar chapetas con numeración fuera de secuencia o duplicadas temporalmente para importaciones de subasta.
                          </p>
                          {formData.isPolicyLockBypassed && (
                            <span className="inline-block mt-2 text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md">
                              Bypass Activo Actualmente
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onResetPolicyLock(formData.id)}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                        >
                          {formData.isPolicyLockBypassed ? 'Desactivar Bypass' : 'Activar Bypass'}
                        </button>
                      </div>

                      {/* Action 2: Notas de Soporte Internas */}
                      <div>
                        <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                          Notas Internas de Soporte (Solo visibles por Superadmins)
                        </label>
                        <textarea
                          rows={3}
                          value={formData.supportNotes || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, supportNotes: e.target.value })
                          }
                          placeholder="Registra acuerdos comerciales, incidentes técnicos o excepciones autorizadas..."
                          className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                      <Check className="w-4 h-4" /> Guardado
                    </span>
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-[#123F2A] hover:bg-[#064e3b] text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Guardar Cambios</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
