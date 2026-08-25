import React, { useState, useEffect } from 'react';
import { WithdrawalAnimal, SanitarioAlert, FarmDataPackage, SanitaryProtocol, SanitaryApplicationRecord } from '../types';
import { GanaderIALogo } from './GanaderIALogo';
import {
  Sparkles,
  Bot,
  Send,
  Calendar,
  Clock,
  ShieldCheck,
  Download,
  Database,
  Wifi,
  FileSpreadsheet,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  AlertTriangle,
  Building,
  PlusCircle,
  Settings,
  MapPin,
  Check,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Plus,
  Pill,
  Syringe,
  Layers,
  Printer,
  Share2,
  Smartphone,
} from 'lucide-react';

interface MenuViewProps {
  withdrawalAnimals: WithdrawalAnimal[];
  alerts: SanitarioAlert[];
  onOpenWithdrawalModal: () => void;
  onNavigateGis?: () => void;
  currentFarm?: FarmDataPackage;
  farms?: FarmDataPackage[];
  onSelectFarm?: (farmId: string) => void;
  onOpenCreateFarmModal?: () => void;
  onOpenFarmManagerModal?: () => void;
  onOpenPendingActivitiesModal?: () => void;
  pendingActivitiesCount?: number;
  onOpenMastitisModal?: () => void;
  activeMastitisCount?: number;
  initialSubTab?: 'assistant' | 'sanitario' | 'settings';
  sanitaryProtocols?: SanitaryProtocol[];
  sanitaryApplications?: SanitaryApplicationRecord[];
  onOpenSanitaryPlanModal?: (tab?: 'protocols' | 'apply' | 'withdrawals' | 'history') => void;
  onOpenWhatsAppModal?: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  withdrawalAnimals,
  alerts,
  onOpenWithdrawalModal,
  onNavigateGis,
  currentFarm,
  farms = [],
  onSelectFarm,
  onOpenCreateFarmModal,
  onOpenFarmManagerModal,
  onOpenPendingActivitiesModal,
  pendingActivitiesCount = 0,
  onOpenMastitisModal,
  activeMastitisCount = 0,
  initialSubTab,
  sanitaryProtocols = [],
  sanitaryApplications = [],
  onOpenSanitaryPlanModal,
  onOpenWhatsAppModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'assistant' | 'sanitario' | 'settings'>(
    initialSubTab || 'assistant',
  );

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // AI Assistant Chat state
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: '¡Hola! Soy GanaderIA Assistant, tu especialista en zootecnia, nutrición, genética y sanidad animal. ¿En qué puedo orientarte hoy respecto a tu hato?',
      time: '10:00 AM',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    '¿Cómo reducir la consanguinidad en hijas de Don Juan 450?',
    '¿Cuál es el tiempo de retiro para Oxitetraciclina y Penicilina?',
    '¿Cómo mejorar la Ganancia Diaria de Peso (GDP) en pastoreo?',
    '¿Qué protocolo IATF recomiendas para vacas lecheras?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('consanguinidad') || lower.includes('don juan')) {
        reply =
          'Para hijas de Don Juan 450 (F=3.1%), se recomienda utilizar toros de líneas abiertas como Brahman Rojo (Rey Midas) o Angus puro no emparentado. Esto maximiza el vigor híbrido (heterosis) resultando en un aumento proyectado de +14 kg al destete y fertilidad mejorada.';
      } else if (lower.includes('retiro') || lower.includes('oxitetraciclina') || lower.includes('penicilina')) {
        reply =
          'Tiempos de retiro estándar recomendados:\n• Oxitetraciclina L.A.: 28 días en carne y 7 días (14 ordeños) en leche.\n• Penicilina G Procaínica: 10 días en carne y 72-96 horas en leche.\n• Ceftiofur: 0 días en leche / 4 días en carne.\n⚠️ Recuerda: Tenemos 5 animales actualmente con retiro activo en tu finca.';
      } else if (lower.includes('gdp') || lower.includes('ganancia') || lower.includes('peso')) {
        reply =
          'Para elevar la GDP de 0.85 kg/d a >1.10 kg/d en Ceba:\n1. Ajustar carga animal a 2.5 UGM/ha con rotación cada 3-4 días.\n2. Suplementar con sal mineralizada con 8% de Fósforo y 15% de Nitrógeno No Proteico (Urea peletizada).\n3. Ofrecer banco proteico (Matarratón o Leucaena) 2 horas al día.';
      } else if (lower.includes('iatf') || lower.includes('protocolo')) {
        reply =
          'Protocolo IATF recomendado para vacas con >50 días post-parto:\n• Día 0: Dispositivo intravaginal con Progesterona (1.0g) + 2mg Benzoato de Estradiol.\n• Día 8: Retirar dispositivo + 0.5mg PGF2α + 300 UI eCG + 1mg Cipionato de Estradiol.\n• Día 10: Inseminación a tiempo fijo (48-52h post-retiro) con pajilla de Don Juan 450.';
      } else {
        reply = `He analizado tu consulta sobre "${text}". Para tu rebaño de 1,245 cabezas en Finca La Esperanza, sugiero mantener el monitoreo periódico de pesajes cada 15 días y asegurar el cumplimiento del plan vacunal de Fiebre Aftosa programado en 3 días.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Subtab Navigation */}
      <div className="flex bg-[#eeeeee] p-1.5 rounded-2xl border border-white/10 gap-1">
        <button
          onClick={() => setActiveSubTab('assistant')}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'assistant'
              ? 'bg-[#0D1A13] text-white shadow-sm'
              : 'text-[#414844] hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#ffba38]" />
          Asistente IA Agropecuario
        </button>

        <button
          onClick={() => setActiveSubTab('sanitario')}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'sanitario'
              ? 'bg-[#0D1A13] text-white shadow-sm'
              : 'text-[#414844] hover:text-white'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-[#A5B8AC]" />
          Plan Sanitario & Retiros ({withdrawalAnimals.length})
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'settings'
              ? 'bg-[#0D1A13] text-white shadow-sm'
              : 'text-[#414844] hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          Finca & Exportación
        </button>
      </div>

      {/* SubTab 1: Asistente IA Agropecuario */}
      {activeSubTab === 'assistant' && (
        <div className="bg-[#15241C] rounded-2xl border border-white/10 card-shadow overflow-hidden flex flex-col h-[620px]">
          {/* Assistant Header */}
          <div className="bg-[#123F2A] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GanaderIALogo variant="icon" size="md" />
              <div>
                <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                  <span>Ganader<span className="text-[#ffba38]">IA.</span> Assistant</span>
                  <span className="text-[10px] bg-[#D4A94E] text-[#0D1A13] px-1.5 py-0.2 rounded font-bold">2.5 FLASH</span>
                </h3>
                <p className="text-xs text-[#86af99]">
                  Especialista zootecnista y veterinario con acceso a tus datos de hato
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onOpenWhatsAppModal && (
                <button
                  type="button"
                  onClick={onOpenWhatsAppModal}
                  className="text-xs bg-[#25D366] hover:bg-[#1ebd59] text-slate-950 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Vincular Asistente de WhatsApp"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Vincular WhatsApp</span>
                </button>
              )}
              <span className="text-xs text-[#A5B8AC] bg-[#0D1A13] px-2 py-1 rounded-lg flex items-center gap-1 font-mono">
                <Wifi className="w-3 h-3 text-emerald-400" /> Online
              </span>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="p-3 bg-[#f3f3f3] border-b border-white/10 overflow-x-auto flex gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[11px] font-medium bg-[#15241C] hover:bg-[#e8e8e8] text-white px-3 py-1.5 rounded-full border border-white/10 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f9f9f9]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0D1A13] text-white rounded-br-none'
                      : 'bg-[#15241C] border border-white/10 text-white rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[10px] text-[#717973] font-mono mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#717973] p-2 bg-[#15241C] rounded-xl border border-white/10 w-fit">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
                <span>Analizando parámetros zootécnicos...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#15241C] border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Pregunta sobre genética, vacunas, nutrición o tiempos de retiro..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-[#f3f3f3] border border-white/10 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-[#012d1d]"
            />
            <button
              onClick={() => handleSendMessage()}
              className="bg-[#D4A94E] hover:bg-[#ffdeac] text-[#0D1A13] p-3 rounded-xl tactical-shadow transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SubTab 2: Plan Sanitario & Retiros */}
      {activeSubTab === 'sanitario' && (
        <div className="space-y-6">
          {/* Main Sanitary Plan Header Banner */}
          <div className="bg-[#0D1A13] text-white p-5 md:p-6 rounded-3xl border border-[#1b4332] card-shadow flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
            <div className="flex items-start gap-3.5">
              <div className="p-3.5 bg-[#083d28] border border-[#2d6a4f] text-emerald-300 rounded-2xl shrink-0 shadow-inner">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-lg md:text-xl text-white tracking-tight">
                    Módulo de Plan Sanitario, Vacunación & Inocuidad (ICA/BPG)
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                    Editable & 100% Funcional
                  </span>
                </div>
                <p className="text-xs text-[#a3c9b4] mt-1 max-w-2xl leading-relaxed">
                  Controle cronogramas de vacunación oficial, esquemas reproductivos IATF, vermífugos, registro de lotes de biológicos y monitoreo estricto de tiempos de retiro de carne y leche.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-bold">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {sanitaryProtocols.length} Protocolos Configurados
                  </span>
                  <span className="text-[#A5B8AC]">•</span>
                  <span className="text-pink-300 flex items-center gap-1">
                    <Pill className="w-4 h-4 text-pink-400" />
                    {sanitaryApplications.length} Jornadas en Historial
                  </span>
                  <span className="text-[#A5B8AC]">•</span>
                  <span className="text-amber-300 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    {withdrawalAnimals.length} En Tiempo de Retiro
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              <button
                onClick={() => (onOpenSanitaryPlanModal ? onOpenSanitaryPlanModal('apply') : onOpenWithdrawalModal())}
                className="flex-1 lg:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Pill className="w-4 h-4" />
                <span>⚡ Registrar Jornada</span>
              </button>
              <button
                onClick={() => (onOpenSanitaryPlanModal ? onOpenSanitaryPlanModal('protocols') : onOpenWithdrawalModal())}
                className="flex-1 lg:flex-initial bg-[#D4A94E] hover:bg-[#ffc857] text-[#0D1A13] px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Gestionar Protocolos</span>
              </button>
            </div>
          </div>

          {/* Pending Activities Banner */}
          {onOpenPendingActivitiesModal && (
            <div className="bg-[#0D1A13] text-white p-5 rounded-2xl border border-[#1b4332] card-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-800 text-emerald-300 rounded-xl">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white flex items-center gap-2">
                    Reporte de Actividades Diarias Pendientes
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                      {pendingActivitiesCount} Tareas
                    </span>
                  </h3>
                  <p className="text-xs text-[#86af99] mt-0.5">
                    Planifique, filtre, complete y comparta por WhatsApp el reporte diario de trabajo para vaqueros y mayordomo.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenPendingActivitiesModal}
                className="bg-[#D4A94E] hover:bg-[#ffc857] text-[#0D1A13] px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
              >
                <ClipboardList className="w-4 h-4" />
                Abrir Reporte Completo
              </button>
            </div>
          )}

          {/* Registro de Pruebas Positivas de Mastitis Banner */}
          {onOpenMastitisModal && (
            <div className="bg-red-950 text-white p-5 rounded-2xl border border-red-800 card-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-900 text-red-200 rounded-xl border border-red-700">
                  <FlaskConical className="w-6 h-6 text-red-300" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white flex items-center gap-2">
                    Pruebas de Mastitis Positivas (CMT)
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500 text-white font-mono">
                      {activeMastitisCount} Activas
                    </span>
                  </h3>
                  <p className="text-xs text-red-200 mt-0.5">
                    Evaluación anatómica de los 4 cuartos mamarios, patógenos aislados y control estricto de retiro de antibiótico en ordeño.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenMastitisModal}
                className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                Gestionar Casos y Diagnósticos
              </button>
            </div>
          )}

          {/* Active Withdrawal Banner */}
          <div className="bg-[#ffdeac] text-[#604100] p-5 rounded-2xl border-l-4 border-[#523700] card-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-lg text-[#0D1A13] flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Animales con Periodo de Retiro Activo ({withdrawalAnimals.length})
              </h3>
              <p className="text-xs text-[#604100] mt-1">
                Bovinos bajo tratamiento farmacológico. Cumplimiento estricto de inocuidad alimentaria (prohibición de sacrificio y leche a tanque).
              </p>
            </div>
            <button
              onClick={() => (onOpenSanitaryPlanModal ? onOpenSanitaryPlanModal('withdrawals') : onOpenWithdrawalModal())}
              className="bg-[#523700] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#362300] transition-colors cursor-pointer"
            >
              Ver & Administrar Retiros
            </button>
          </div>

          {/* Protocols Quick List / Cards */}
          <div className="bg-[#15241C] rounded-2xl border border-white/10 card-shadow p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Esquemas & Protocolos Sanitarios Programados ({sanitaryProtocols.length})
              </h4>
              <button
                onClick={() => (onOpenSanitaryPlanModal ? onOpenSanitaryPlanModal('protocols') : onOpenWithdrawalModal())}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
              >
                <span>Administrar todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sanitaryProtocols.slice(0, 6).map((prot) => {
                const isUrgent = prot.status === 'urgente' || prot.status === 'vencido';
                const isCompleted = prot.status === 'completado';

                return (
                  <div
                    key={prot.id}
                    onClick={() => (onOpenSanitaryPlanModal ? onOpenSanitaryPlanModal('protocols') : onOpenWithdrawalModal())}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                      isUrgent
                        ? 'bg-red-50/50 border-red-300'
                        : isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-[#f9fbf9] border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-xs text-white line-clamp-1">{prot.name}</span>
                      {isUrgent ? (
                        <span className="text-[10px] font-black bg-red-500 text-white px-1.5 py-0.2 rounded shrink-0 animate-pulse">
                          URGENTE
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded shrink-0">
                          AL DÍA
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded shrink-0">
                          {prot.scheduledDate}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] mt-1">
                      <strong>Biológico:</strong> {prot.productName} ({prot.dosage})
                    </p>
                    <p className="text-[10px] text-[#A5B8AC] mt-0.5">
                      👥 {prot.targetGroup} • ⏳ Retiro: {prot.meatWithdrawalDays}d
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Withdrawal Animals Table */}
          <div className="bg-[#15241C] rounded-2xl border border-white/10 card-shadow overflow-hidden p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-white">
                Monitoreo Individual de Fármacos Residuales
              </h4>
              <button
                onClick={() => (onOpenSanitaryPlanModal ? onOpenSanitaryPlanModal('withdrawals') : onOpenWithdrawalModal())}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <span>+ Agregar / Liberar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-white/10">
                    <th className="pb-2 text-[10px] uppercase font-bold text-[#717973]">Arete / Nombre</th>
                    <th className="pb-2 text-[10px] uppercase font-bold text-[#717973]">Medicamento Aplicado</th>
                    <th className="pb-2 text-[10px] uppercase font-bold text-[#717973]">Fecha Aplicación</th>
                    <th className="pb-2 text-[10px] uppercase font-bold text-[#717973]">Retiro Total</th>
                    <th className="pb-2 text-[10px] uppercase font-bold text-[#717973]">Días Restantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {withdrawalAnimals.map((w) => (
                    <tr key={w.id} className="hover:bg-[#f9f9f9]">
                      <td className="py-3 font-semibold text-white">
                        <span className="font-mono bg-[#f3f3f3] px-1.5 py-0.5 rounded mr-1">
                          {w.tagId}
                        </span>
                        {w.name}
                      </td>
                      <td className="py-3 text-white">{w.medication}</td>
                      <td className="py-3 text-[#717973] font-mono">{w.appliedDate}</td>
                      <td className="py-3 font-mono">{w.withdrawalDays} días</td>
                      <td className="py-3">
                        <span className="bg-[#ffdad6] text-[#ba1a1a] font-bold font-mono px-2 py-0.5 rounded text-[11px]">
                          {w.daysRemaining} días restantes
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Finca & Exportación */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Farm Profile Box */}
            <div className="bg-[#15241C] p-5 rounded-2xl border border-white/10 card-shadow space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#2d6a4f]" />
                  Información del Predio & SIG
                </h4>
                <div className="flex items-center gap-1.5">
                  {onOpenCreateFarmModal && (
                    <button
                      onClick={onOpenCreateFarmModal}
                      className="text-xs font-bold bg-[#D4A94E] text-[#0D1A13] px-2.5 py-1.5 rounded-xl hover:bg-[#ffdeac] transition-colors flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Nueva Finca</span>
                    </button>
                  )}
                  {onNavigateGis && (
                    <button
                      onClick={onNavigateGis}
                      className="text-xs font-bold bg-[#123F2A] text-[#A5B8AC] px-2.5 py-1.5 rounded-xl hover:bg-[#1F6547] transition-colors flex items-center gap-1"
                    >
                      <span>Abrir SIG</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Farm Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#717973]">Nombre del Predio:</span>
                  <span className="font-bold text-white">
                    {currentFarm?.profile.name || 'Finca La Esperanza'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#717973]">Ubicación:</span>
                  <span className="font-semibold text-white">
                    {currentFarm?.profile.municipality}, {currentFarm?.profile.department} (
                    {currentFarm?.profile.vereda})
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#717973]">Registro Sanitario ICA:</span>
                  <span className="font-mono font-bold text-white">
                    {currentFarm?.profile.registrationNumber || 'ICA-23001-0982'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#717973]">Área Total:</span>
                  <span className="font-bold text-white">
                    {currentFarm?.profile.totalAreaHa || 420.5} Hectáreas (
                    {currentFarm?.paddocks.length || 8} Potreros SIG)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#717973]">Hato Asignado:</span>
                  <span className="font-bold text-emerald-800">
                    {currentFarm?.headsCount || currentFarm?.profile.headsCount || 840} Cabezas
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#717973]">Elevación & Relieve:</span>
                  <span className="font-bold text-white">
                    {currentFarm?.profile.elevationMsnm || 135} msnm •{' '}
                    {currentFarm?.contours?.length || 6} Curvas de Nivel
                  </span>
                </div>
              </div>

              {/* Multi-farm Switcher inside Settings */}
              {farms.length > 1 && (
                <div className="pt-2 border-t border-[#eeeeee]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#79564b] uppercase">
                      Predios Registrados ({farms.length})
                    </span>
                    {onOpenFarmManagerModal && (
                      <button
                        onClick={onOpenFarmManagerModal}
                        className="text-[11px] text-white font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Settings className="w-3 h-3" /> Administrar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {farms.map((f) => {
                      const isSel = f.profile.id === currentFarm?.profile.id;
                      return (
                        <button
                          key={f.profile.id}
                          onClick={() => onSelectFarm && onSelectFarm(f.profile.id)}
                          className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                            isSel
                              ? 'bg-[#0D1A13] text-white border-[#012d1d] font-bold'
                              : 'bg-[#f8faf8] text-[#414844] border-white/10 hover:bg-[#c1ecd4]/40'
                          }`}
                        >
                          <span>{f.profile.name}</span>
                          {isSel && <Check className="w-3 h-3 text-[#ffba38]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Data Export & Reports */}
            <div className="bg-[#15241C] p-5 rounded-2xl border border-white/10 card-shadow space-y-4">
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Exportación de Reportes
              </h4>
              <p className="text-xs text-[#414844]">
                Descarga en formato Excel, CSV o PDF para entidades gubernamentales, frigoríficos o bancos.
              </p>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => alert('Generando exportación en CSV del Hato Ganadero...')}
                  className="w-full bg-[#f3f3f3] hover:bg-[#e8e8e8] text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-white/10 flex items-center justify-between transition-colors"
                >
                  <span>Exportar Inventario Bovino (CSV)</span>
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => alert('Generando planilla de control lechero mensual...')}
                  className="w-full bg-[#f3f3f3] hover:bg-[#e8e8e8] text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-white/10 flex items-center justify-between transition-colors"
                >
                  <span>Exportar Planilla de Ordeño y Calidad (Excel)</span>
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
