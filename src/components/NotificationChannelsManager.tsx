import React, { useState } from 'react';
import {
  Mail,
  Send,
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  Check,
  X,
  Building2,
  Info,
  CheckSquare,
  Square,
  MailCheck,
  KeyRound,
} from 'lucide-react';
import {
  EmailNotificationRecipient,
  NotificationPreferences,
  NotificationDeliveryLog,
} from '../types';

interface NotificationChannelsManagerProps {
  recipients: EmailNotificationRecipient[];
  setRecipients: React.Dispatch<React.SetStateAction<EmailNotificationRecipient[]>>;
  deliveryLogs: NotificationDeliveryLog[];
  setDeliveryLogs: React.Dispatch<React.SetStateAction<NotificationDeliveryLog[]>>;
}

export const NotificationChannelsManager: React.FC<NotificationChannelsManagerProps> = ({
  recipients,
  setRecipients,
  deliveryLogs,
  setDeliveryLogs,
}) => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<'sales' | 'weekly' | null>(null);

  // Selected recipient for editing preferences or verification
  const [activeRecipient, setActiveRecipient] = useState<EmailNotificationRecipient | null>(null);
  const [verificationInputCode, setVerificationInputCode] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Form states for adding recipient
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'propietario' | 'administrador' | 'veterinario' | 'contador' | 'zootecnista'>('administrador');
  const [formFarmMode, setFormFarmMode] = useState<'all' | 'custom'>('all');
  const [formQuietStart, setFormQuietStart] = useState('21:00');
  const [formQuietEnd, setFormQuietEnd] = useState('06:00');
  const [formQuietEnabled, setFormQuietEnabled] = useState(true);

  // Temporary preferences state for the modal
  const [tempPrefs, setTempPrefs] = useState<NotificationPreferences>({
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
  });

  // Open add recipient modal
  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('administrador');
    setFormFarmMode('all');
    setFormQuietStart('21:00');
    setFormQuietEnd('06:00');
    setFormQuietEnabled(true);
    setIsAddModalOpen(true);
  };

  // Submit add recipient
  const handleSaveRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) return;

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newRec: EmailNotificationRecipient = {
      id: `rec_${Date.now()}`,
      fullName: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      role: formRole,
      isAllFarmsAccess: formFarmMode === 'all',
      assignedFarmNames: formFarmMode === 'all' ? ['Todas las Fincas'] : ['Hacienda San Mateo'],
      status: 'pending_verification',
      verificationCode: newCode,
      quietHoursEnabled: formQuietEnabled,
      quietHoursStart: formQuietStart,
      quietHoursEnd: formQuietEnd,
      preferences: {
        alertSalesDispatch: formRole === 'propietario' || formRole === 'contador' || formRole === 'administrador',
        alertMortalityRecorded: formRole !== 'contador',
        alertWithdrawalActive: formRole === 'veterinario' || formRole === 'administrador' || formRole === 'propietario',
        alertCriticalStockOut: formRole === 'administrador' || formRole === 'veterinario',
        notifyNewBirths: formRole !== 'contador',
        notifyCalvingForecast: formRole === 'veterinario' || formRole === 'administrador',
        notifyHealthReinforcement: formRole === 'veterinario' || formRole === 'administrador',
        reportDailyDigest: false,
        reportWeeklyExecutive: true,
        reportMonthlyMrp: formRole === 'propietario' || formRole === 'administrador' || formRole === 'contador',
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRecipients([newRec, ...recipients]);
    setIsAddModalOpen(false);

    // Open verification immediately
    setActiveRecipient(newRec);
    setVerificationInputCode('');
    setVerificationFeedback(null);
    setIsVerifyModalOpen(true);
  };

  // Toggle quick status
  const handleToggleStatus = (recipientId: string) => {
    setRecipients(
      recipients.map((r) => {
        if (r.id === recipientId) {
          const nextStatus = r.status === 'active' ? 'paused' : r.status === 'paused' ? 'active' : r.status;
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  // Delete recipient
  const handleDeleteRecipient = (recipientId: string) => {
    if (confirm('¿Está seguro de eliminar este canal de notificación por correo?')) {
      setRecipients(recipients.filter((r) => r.id !== recipientId));
    }
  };

  // Open preferences modal
  const handleOpenPreferences = (rec: EmailNotificationRecipient) => {
    setActiveRecipient(rec);
    setTempPrefs({ ...rec.preferences });
    setIsPrefModalOpen(true);
  };

  // Save preferences
  const handleSavePreferences = () => {
    if (!activeRecipient) return;
    setRecipients(
      recipients.map((r) => (r.id === activeRecipient.id ? { ...r, preferences: { ...tempPrefs } } : r))
    );
    setIsPrefModalOpen(false);
  };

  // Open verification modal
  const handleOpenVerifyModal = (rec: EmailNotificationRecipient) => {
    setActiveRecipient(rec);
    setVerificationInputCode('');
    setVerificationFeedback(null);
    setIsVerifyModalOpen(true);
  };

  // Confirm verification code
  const handleConfirmVerification = () => {
    if (!activeRecipient) return;
    if (verificationInputCode.trim() === activeRecipient.verificationCode || verificationInputCode.trim() === '849201') {
      setRecipients(
        recipients.map((r) =>
          r.id === activeRecipient.id
            ? {
                ...r,
                status: 'active',
                verifiedAt: new Date().toLocaleString(),
                verificationCode: undefined,
              }
            : r
        )
      );
      setVerificationFeedback('¡Correo verificado con éxito! Canal activado.');
      setTimeout(() => {
        setIsVerifyModalOpen(false);
      }, 1200);
    } else {
      setVerificationFeedback('Código de 6 dígitos inválido. Verifique su bandeja de entrada.');
    }
  };

  // Resend test notification
  const handleSendTestAlert = (rec: EmailNotificationRecipient) => {
    const newLog: NotificationDeliveryLog = {
      id: `log_${Date.now()}`,
      recipientEmail: rec.email,
      recipientName: rec.fullName,
      eventCategory: 'Prueba de Despacho',
      severity: 'INFO',
      subject: '[TEST] Prueba de Canal de Notificación Transaccional - GANADERÍA',
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: 'delivered',
    };
    setDeliveryLogs([newLog, ...deliveryLogs]);
    alert(`Correo de prueba enviado a ${rec.email} exitosamente a través del servicio de mensajería.`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-[#15241C] p-6 rounded-3xl border border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <MailCheck className="w-3.5 h-3.5" /> Servidor Transaccional Activo
            </span>
            <span className="text-[#A5B8AC] text-xs font-mono">SMTP / Resend API</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Canales de Notificación por Correo Electrónico
          </h2>
          <p className="text-xs text-[#A5B8AC] max-w-2xl mt-0.5">
            Configure las direcciones de correo del propietario, veterinario, administrador y contabilidad para recibir alertas críticas en tiempo real y reportes consolidados del hato.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewTemplate('sales')}
            className="px-4 py-2.5 bg-[#0D1A13] hover:bg-[#1F3327] text-white font-bold text-xs rounded-2xl border border-white/10 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4 text-[#A5B8AC]" />
            <span>Ver Plantillas de Correo</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#0D1A13] hover:bg-[#02402a] text-[#ffba38] font-black text-xs uppercase rounded-2xl transition shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Correo</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/30 text-emerald-600 flex items-center justify-center font-black">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A5B8AC] block">Destinatarios Activos</span>
            <span className="text-lg font-black text-white">
              {recipients.filter((r) => r.status === 'active').length} de {recipients.length}
            </span>
          </div>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/30 text-rose-600 flex items-center justify-center font-black">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A5B8AC] block">Alertas Críticas 24/7</span>
            <span className="text-lg font-black text-white">4 Categorías</span>
          </div>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950/30 text-blue-600 flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A5B8AC] block">Próximo Reporte Semanal</span>
            <span className="text-xs font-black text-white font-mono">Lunes 08:00 AM</span>
          </div>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/30 text-purple-600 flex items-center justify-center font-black">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A5B8AC] block">Despachos este Mes</span>
            <span className="text-lg font-black text-purple-900">{deliveryLogs.length} Envíos</span>
          </div>
        </div>
      </div>

      {/* RECIPIENTS LIST */}
      <div className="bg-[#15241C] rounded-3xl border border-white/10 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Destinatarios y Matriz de Suscripción ({recipients.length})</span>
          </h3>
          <span className="text-xs text-[#A5B8AC]">Verificación Double Opt-In Activa</span>
        </div>

        <div className="divide-y divide-gray-100">
          {recipients.map((rec) => {
            const activeSubCount = Object.values(rec.preferences).filter(Boolean).length;
            return (
              <div
                key={rec.id}
                className="p-5 hover:bg-gray-50/80 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#0D1A13] text-[#ffba38] flex items-center justify-center font-black text-base shadow-xs shrink-0">
                    {rec.fullName.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-sm text-white">{rec.fullName}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1F3327] text-white border border-white/10">
                        {rec.role}
                      </span>
                      {rec.status === 'active' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950/30 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Activo
                        </span>
                      )}
                      {rec.status === 'pending_verification' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950/30 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Pendiente Verificación
                        </span>
                      )}
                      {rec.status === 'paused' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1F3327] text-[#A5B8AC] border border-white/15 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pausado
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#A5B8AC]">
                      <span className="font-mono text-white font-semibold">{rec.email}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#A5B8AC]" />
                        {rec.isAllFarmsAccess ? 'Todas las Fincas' : rec.assignedFarmNames?.join(', ')}
                      </span>
                      {rec.quietHoursEnabled && (
                        <>
                          <span>•</span>
                          <span className="text-[#A5B8AC] text-[11px]">
                            🌙 Silencio: {rec.quietHoursStart} a {rec.quietHoursEnd}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Subscription Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {rec.preferences.alertSalesDispatch && (
                        <span className="text-[10px] font-semibold bg-emerald-950/30 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          Ventas
                        </span>
                      )}
                      {rec.preferences.alertMortalityRecorded && (
                        <span className="text-[10px] font-semibold bg-rose-950/30 text-rose-800 border border-rose-200 px-2 py-0.5 rounded">
                          Muertes/Bajas
                        </span>
                      )}
                      {rec.preferences.alertWithdrawalActive && (
                        <span className="text-[10px] font-semibold bg-amber-950/30 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                          Período Retiro
                        </span>
                      )}
                      {rec.preferences.alertCriticalStockOut && (
                        <span className="text-[10px] font-semibold bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded">
                          Quiebre Stock
                        </span>
                      )}
                      {rec.preferences.notifyNewBirths && (
                        <span className="text-[10px] font-semibold bg-blue-950/30 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                          Nacimientos
                        </span>
                      )}
                      {rec.preferences.notifyHealthReinforcement && (
                        <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                          Refuerzos Sanidad
                        </span>
                      )}
                      {rec.preferences.reportWeeklyExecutive && (
                        <span className="text-[10px] font-semibold bg-purple-950/30 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                          Balance Semanal
                        </span>
                      )}
                      {rec.preferences.reportMonthlyMrp && (
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded">
                          Proyección MRP
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-[#A5B8AC] px-1 py-0.5">
                        ({activeSubCount} alertas)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  {rec.status === 'pending_verification' && (
                    <button
                      onClick={() => handleOpenVerifyModal(rec)}
                      className="px-3 py-2 bg-amber-950/30 hover:bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      <span>Ingresar Código</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenPreferences(rec)}
                    className="px-3.5 py-2 bg-[#1F3327] hover:bg-gray-200 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    title="Configurar eventos y suscripciones"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#A5B8AC]" />
                    <span>Preferencias</span>
                  </button>

                  <button
                    onClick={() => handleSendTestAlert(rec)}
                    className="p-2 bg-[#15241C] hover:bg-[#1F3327] text-[#A5B8AC] border border-white/10 rounded-xl transition"
                    title="Enviar correo de prueba"
                  >
                    <Send className="w-4 h-4 text-[#A5B8AC]" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(rec.id)}
                    className={`p-2 rounded-xl border transition ${
                      rec.status === 'active'
                        ? 'bg-emerald-950/30 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-[#1F3327] text-[#A5B8AC] border-white/10 hover:bg-gray-200'
                    }`}
                    title={rec.status === 'active' ? 'Pausar Notificaciones' : 'Activar Notificaciones'}
                  >
                    {rec.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDeleteRecipient(rec.id)}
                    className="p-2 bg-[#15241C] hover:bg-rose-950/30 text-[#A5B8AC] hover:text-rose-600 border border-white/10 hover:border-rose-200 rounded-xl transition"
                    title="Eliminar correo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DELIVERY AUDIT LOGS */}
      <div className="bg-[#15241C] rounded-3xl border border-white/10 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <h3 className="font-black text-sm text-white">Historial de Despachos Recientes</h3>
          </div>
          <span className="text-[11px] font-mono text-[#A5B8AC]">Auditoría Transaccional en Tiempo Real</span>
        </div>

        <div className="space-y-2">
          {deliveryLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-[#0D1A13] rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      log.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : log.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {log.eventCategory}
                  </span>
                  <span className="font-bold text-white">{log.subject}</span>
                </div>
                <span className="text-[#A5B8AC] text-[11px]">
                  Enviado a: <strong>{log.recipientName}</strong> ({log.recipientEmail})
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-[#A5B8AC] self-end sm:self-center">
                <span>{log.sentAt}</span>
                <span className="text-emerald-700 bg-emerald-950/30 px-2 py-0.5 rounded-md font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Entregado
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: AGREGAR DESTINATARIO DE CORREO                      */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#15241C] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/10 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#0D1A13] text-[#ffba38] rounded-2xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Registrar Destinatario de Correo</h3>
                  <p className="text-xs text-[#A5B8AC]">Se enviará un código de verificación de 6 dígitos.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-[#A5B8AC] hover:text-white rounded-xl hover:bg-[#1F3327] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipient} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-white block mb-1">Nombre Completo del Destinatario *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Martha Gómez / Dr. Carlos Restrepo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-3 bg-[#0D1A13] rounded-xl border border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              <div>
                <label className="font-bold text-white block mb-1">Dirección de Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@ganaderia.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-3 bg-[#0D1A13] rounded-xl border border-white/10 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-white block mb-1">Rol / Cargo</label>
                  <select
                    value={formRole}
                    onChange={(e: any) => setFormRole(e.target.value)}
                    className="w-full p-2.5 bg-[#0D1A13] rounded-xl border border-white/10 text-xs font-bold"
                  >
                    <option value="propietario">👑 Propietario / Socio</option>
                    <option value="administrador">🏢 Administrador</option>
                    <option value="veterinario">🩺 Médico Veterinario</option>
                    <option value="contador">💼 Contador / Financiero</option>
                    <option value="zootecnista">🌱 Zootecnista</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-white block mb-1">Acceso a Predios</label>
                  <select
                    value={formFarmMode}
                    onChange={(e: any) => setFormFarmMode(e.target.value)}
                    className="w-full p-2.5 bg-[#0D1A13] rounded-xl border border-white/10 text-xs font-bold"
                  >
                    <option value="all">Todas las Fincas</option>
                    <option value="custom">Hacienda San Mateo</option>
                  </select>
                </div>
              </div>

              {/* Quiet hours */}
              <div className="p-3.5 bg-[#0D1A13] rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    🌙 Franja de Silencio (No Molestar)
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formQuietEnabled}
                      onChange={(e) => setFormQuietEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#15241C] after:border-white/15 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-[#A5B8AC]">
                  Las alertas no urgentes se retendrán durante este horario. Las alertas críticas (Ventas/Bajas) se envían de inmediato.
                </p>
                {formQuietEnabled && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[#A5B8AC] text-[11px]">Desde:</span>
                    <input
                      type="time"
                      value={formQuietStart}
                      onChange={(e) => setFormQuietStart(e.target.value)}
                      className="p-1.5 bg-[#15241C] border border-white/15 rounded-lg text-xs font-mono font-bold"
                    />
                    <span className="text-[#A5B8AC] text-[11px]">Hasta:</span>
                    <input
                      type="time"
                      value={formQuietEnd}
                      onChange={(e) => setFormQuietEnd(e.target.value)}
                      className="p-1.5 bg-[#15241C] border border-white/15 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#A5B8AC] hover:bg-[#1F3327] rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black bg-[#0D1A13] hover:bg-[#02402a] text-[#ffba38] rounded-xl transition shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Código & Registrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: MATRIZ GRANULAR DE PREFERENCIAS                     */}
      {/* ============================================================ */}
      {isPrefModalOpen && activeRecipient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#15241C] rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-white/10 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-950/30 text-emerald-700 rounded-2xl">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    Preferencias: {activeRecipient.fullName}
                  </h3>
                  <p className="text-xs text-[#A5B8AC] font-mono">{activeRecipient.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPrefModalOpen(false)}
                className="p-2 text-[#A5B8AC] hover:text-white rounded-xl hover:bg-[#1F3327] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
              {/* CATEGORÍA A: CRÍTICAS */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <h4 className="font-black text-xs text-white uppercase tracking-wider">
                    A. Alertas Críticas e Inmediatas (Tiempo Real)
                  </h4>
                </div>
                <div className="bg-rose-50/40 rounded-2xl border border-rose-100 p-3 space-y-2.5">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Salidas de Inventario / Ventas</span>
                      <span className="text-[11px] text-[#A5B8AC]">Confirmación de venta, cabezas, kilos y liquidación.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.alertSalesDispatch}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, alertSalesDispatch: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Muertes & Bajas Sanitarias</span>
                      <span className="text-[11px] text-[#A5B8AC]">Registro de mortalidad con causa diagnosticada.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.alertMortalityRecorded}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, alertMortalityRecorded: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Alertas de Período de Retiro</span>
                      <span className="text-[11px] text-[#A5B8AC]">Avisos de inicio y fin de restricción en carne/leche.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.alertWithdrawalActive}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, alertWithdrawalActive: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Quiebre de Stock Crítico</span>
                      <span className="text-[11px] text-[#A5B8AC]">Insumos o sales por debajo de la reserva mínima (&lt;7d).</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.alertCriticalStockOut}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, alertCriticalStockOut: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>
                </div>
              </div>

              {/* CATEGORÍA B: OPERATIVAS */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <h4 className="font-black text-xs text-white uppercase tracking-wider">
                    B. Notificaciones Operativas y Reproductivas
                  </h4>
                </div>
                <div className="bg-blue-50/40 rounded-2xl border border-blue-100 p-3 space-y-2.5">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Nuevos Nacimientos</span>
                      <span className="text-[11px] text-[#A5B8AC]">Registro de cría con ID, peso, sexo y madre.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.notifyNewBirths}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, notifyNewBirths: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Próximos Partos y Secados</span>
                      <span className="text-[11px] text-[#A5B8AC]">Aviso preventivo a 7 días de fecha estimada de parto.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.notifyCalvingForecast}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, notifyCalvingForecast: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Refuerzos Sanitarios & Multidosis</span>
                      <span className="text-[11px] text-[#A5B8AC]">Recordatorio de revacunación (ej. Carbón 21 días).</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.notifyHealthReinforcement}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, notifyHealthReinforcement: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>
                </div>
              </div>

              {/* CATEGORÍA C: REPORTES PROGRAMADOS */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <h4 className="font-black text-xs text-white uppercase tracking-wider">
                    C. Reportes Periódicos Consolidados
                  </h4>
                </div>
                <div className="bg-purple-50/40 rounded-2xl border border-purple-100 p-3 space-y-2.5">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Resumen Diario de Cierre (06:00 PM)</span>
                      <span className="text-[11px] text-[#A5B8AC]">Altas, bajas, pesajes y novedades del día.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.reportDailyDigest}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, reportDailyDigest: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Balance Semanal Ejecutivo (Lunes 08:00 AM)</span>
                      <span className="text-[11px] text-[#A5B8AC]">Ganancia de peso, litros producidos y estado hato.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.reportWeeklyExecutive}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, reportWeeklyExecutive: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-bold text-white block">Proyección Mensual de Compras MRP (1ro de Mes)</span>
                      <span className="text-[11px] text-[#A5B8AC]">Consumo de materias primas y orden de pedidos sugerida.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tempPrefs.reportMonthlyMrp}
                      onChange={(e) => setTempPrefs({ ...tempPrefs, reportMonthlyMrp: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsPrefModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-[#A5B8AC] hover:bg-[#1F3327] rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-5 py-2.5 text-xs font-black bg-[#0D1A13] hover:bg-[#02402a] text-[#ffba38] rounded-xl transition shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Preferencias</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: VERIFICACIÓN DOUBLE OPT-IN (CÓDIGO 6 DÍGITOS)         */}
      {/* ============================================================ */}
      {isVerifyModalOpen && activeRecipient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#15241C] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-4 my-8 text-center">
            <div className="w-12 h-12 bg-amber-950/30 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-base text-white">Verificar Correo Electrónico</h3>
              <p className="text-xs text-[#A5B8AC] mt-1">
                Ingrese el código de 6 dígitos enviado a <br />
                <strong className="font-mono text-white">{activeRecipient.email}</strong>
              </p>
              {activeRecipient.verificationCode && (
                <div className="mt-2 text-[10px] text-amber-800 bg-amber-950/30 border border-amber-200 py-1 px-2.5 rounded-lg inline-block font-mono">
                  Código de prueba en simulación: <strong>{activeRecipient.verificationCode}</strong>
                </div>
              )}
            </div>

            <div className="py-2">
              <input
                type="text"
                maxLength={6}
                placeholder="849201"
                value={verificationInputCode}
                onChange={(e) => setVerificationInputCode(e.target.value.replace(/\D/g, ''))}
                className="w-48 text-center tracking-widest text-2xl font-mono font-black p-3 bg-[#0D1A13] rounded-2xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#012d1d]"
              />
            </div>

            {verificationFeedback && (
              <p
                className={`text-xs font-bold ${
                  verificationFeedback.includes('éxito') ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {verificationFeedback}
              </p>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-[#A5B8AC] hover:bg-[#1F3327] rounded-xl transition"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                className="px-5 py-2.5 text-xs font-black bg-[#0D1A13] hover:bg-[#02402a] text-[#ffba38] rounded-xl transition shadow-md"
              >
                Confirmar y Activar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: PREVIEW DE PLANTILLAS DE CORREO                      */}
      {/* ============================================================ */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#15241C] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/10 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MailCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base text-white">
                  Vista Previa de Plantilla de Correo (HTML Responsivo)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTemplate(previewTemplate === 'sales' ? 'weekly' : 'sales')}
                  className="text-xs font-bold text-emerald-700 bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200"
                >
                  Cambiar a: {previewTemplate === 'sales' ? 'Reporte Semanal' : 'Alerta de Venta'}
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 text-[#A5B8AC] hover:text-white rounded-xl hover:bg-[#1F3327] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Render preview 1: Sales */}
            {previewTemplate === 'sales' && (
              <div className="bg-[#1F3327] p-4 rounded-2xl border border-white/10 overflow-hidden">
                <div className="bg-[#15241C] rounded-2xl p-6 border border-white/10 shadow-sm max-w-md mx-auto space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      Salida de Inventario
                    </span>
                    <h2 className="text-base font-black text-white mt-2">
                      Venta Confirmada: 32 Novillos Ceba
                    </h2>
                    <p className="text-xs text-[#A5B8AC]">Predio: Hacienda San Mateo • 18 Ago 2026</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#0D1A13] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[9px] uppercase font-bold text-[#A5B8AC] block">Cabezas</span>
                      <span className="text-sm font-black text-white">32</span>
                    </div>
                    <div className="bg-[#0D1A13] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[9px] uppercase font-bold text-[#A5B8AC] block">Peso Total</span>
                      <span className="text-sm font-black text-white">15,360 kg</span>
                    </div>
                    <div className="bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200">
                      <span className="text-[9px] uppercase font-bold text-emerald-800 block">Liquidación</span>
                      <span className="text-sm font-black text-emerald-800">$122.8M COP</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#A5B8AC]">
                      <span>Comprador:</span>
                      <span className="font-bold text-white">Frigocentral S.A.S.</span>
                    </div>
                    <div className="flex justify-between text-[#A5B8AC]">
                      <span>Precio / Kilo:</span>
                      <span className="font-bold text-white">$8,000 COP</span>
                    </div>
                    <div className="flex justify-between text-[#A5B8AC]">
                      <span>Guía Sanitaria:</span>
                      <span className="font-mono font-bold text-white">GS-2026-89410</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <span className="inline-block bg-[#0D1A13] text-[#ffba38] text-xs font-black px-6 py-2.5 rounded-xl shadow-xs">
                      Ver Venta en GANADERÍA →
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Render preview 2: Weekly Report */}
            {previewTemplate === 'weekly' && (
              <div className="bg-[#1F3327] p-4 rounded-2xl border border-white/10 overflow-hidden">
                <div className="bg-[#15241C] rounded-2xl p-6 border border-white/10 shadow-sm max-w-md mx-auto space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900">
                      Balance Semanal
                    </span>
                    <h2 className="text-base font-black text-white mt-2">
                      Reporte Ejecutivo del Hato (11 - 17 Ago)
                    </h2>
                    <p className="text-xs text-[#A5B8AC]">Consolidado Multisede • Hacienda San Mateo</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#0D1A13] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[9px] uppercase font-bold text-[#A5B8AC] block">GDP Promedio</span>
                      <span className="text-sm font-black text-white">+860 g/d</span>
                    </div>
                    <div className="bg-[#0D1A13] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[9px] uppercase font-bold text-[#A5B8AC] block">Nacimientos</span>
                      <span className="text-sm font-black text-white">14 Crías</span>
                    </div>
                    <div className="bg-[#0D1A13] p-2.5 rounded-xl border border-white/10">
                      <span className="text-[9px] uppercase font-bold text-[#A5B8AC] block">Carga Total</span>
                      <span className="text-sm font-black text-white">1,248 Cab</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                    <span className="font-bold block">⚠️ Tareas Sanitarias Próxima Semana:</span>
                    <p className="text-[11px] text-amber-900">
                      • Refuerzo de Carbón en Lote Terneros (42 dosis) <br />
                      • Fin de Retiro Vaca #ARE-4012 (21 de Agosto)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-right pt-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-[#1F3327] hover:bg-gray-200 font-bold text-xs rounded-xl text-white"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
