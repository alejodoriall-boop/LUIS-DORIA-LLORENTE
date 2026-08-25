import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Smartphone,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Send,
  Mic,
  Copy,
  Check,
  RefreshCw,
  Layers,
  Sparkles,
  ShieldCheck,
  Phone,
  User,
  Plus,
  Trash2,
  Eye,
  Code,
  FileText,
  Activity,
  ArrowRight,
  Radio,
  Zap,
  Scale,
  Baby,
  Stethoscope,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { FarmDataPackage } from '../../types';

interface WhatsAppIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFarm?: FarmDataPackage;
  onAddRecentActivity?: (
    title: string,
    subtitle: string,
    metric: string,
    category: 'birth' | 'weigh' | 'dairy' | 'health' | 'genetics',
  ) => void;
}

interface AuthorizedPhone {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: 'active' | 'pending';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  isAudio?: boolean;
  audioDuration?: string;
  jsonPayload?: any;
  requiresConfirmation?: boolean;
  confirmed?: boolean;
}

export const WhatsAppIntegrationModal: React.FC<WhatsAppIntegrationModalProps> = ({
  isOpen,
  onClose,
  currentFarm,
  onAddRecentActivity,
}) => {
  const [activeTab, setActiveTab] = useState<'playground' | 'qr_config' | 'guide'>('playground');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Configuration state
  const [webhookUrl] = useState('https://api.campanaganadora.com/v1/webhooks/whatsapp');
  const [verifyToken] = useState('campana_ganadora_meta_token_2026');
  const [botPhoneNumber, setBotPhoneNumber] = useState('+57 310 555 0199');
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [autoTwoStepConfirm, setAutoTwoStepConfirm] = useState(true);
  const [autoWhisper, setAutoWhisper] = useState(true);
  const [autoOcr, setAutoOcr] = useState(true);
  const [autoWithdrawalAlerts, setAutoWithdrawalAlerts] = useState(true);

  // Authorized phones list
  const [authorizedPhones, setAuthorizedPhones] = useState<AuthorizedPhone[]>([
    { id: '1', name: 'Alejandro Doria (Administrador)', role: 'Admin Total', phone: '+57 300 123 4567', status: 'active' },
    { id: '2', name: 'Don Ramón (Mayordomo San Juan)', role: 'Operativo / Campo', phone: '+57 310 987 6543', status: 'active' },
    { id: '3', name: 'Dr. Carlos Mendoza (Veterinario)', role: 'Sanidad & Genética', phone: '+57 315 444 8899', status: 'active' },
    { id: '4', name: 'Jhon Vaquero (Lote Ceba)', role: 'Solo Pesajes / Movimientos', phone: '+57 320 654 3210', status: 'active' },
  ]);

  const [newPhoneName, setNewPhoneName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newPhoneRole, setNewPhoneRole] = useState('Operativo / Campo');
  const [showAddPhone, setShowAddPhone] = useState(false);

  // Chat simulator state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-0',
      sender: 'bot',
      text: '🤠 ¡Hola! Soy GanaderIA Bot de Campaña Ganadora.\n\nPuedes enviarme notas de voz, fotos de báscula/chapeta o mensajes de texto desde el potrero para registrar nacimientos, pesajes, compras, ventas o sanidad.',
      time: '07:30 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [selectedJsonView, setSelectedJsonView] = useState<any | null>(null);
  const [impactSuccessNotice, setImpactSuccessNotice] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleAddPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoneName.trim() || !newPhoneNumber.trim()) return;
    const newEntry: AuthorizedPhone = {
      id: 'ph-' + Date.now(),
      name: newPhoneName.trim(),
      phone: newPhoneNumber.trim(),
      role: newPhoneRole,
      status: 'active',
    };
    setAuthorizedPhones((prev) => [...prev, newEntry]);
    setNewPhoneName('');
    setNewPhoneNumber('');
    setShowAddPhone(false);
  };

  const handleDeletePhone = (id: string) => {
    setAuthorizedPhones((prev) => prev.filter((p) => p.id !== id));
  };

  // Preset field scenarios
  const sendPresetScenario = (scenarioType: 'birth' | 'weigh' | 'sale' | 'health' | 'incomplete') => {
    let userMsg: string = '';
    let isAudio = false;
    let audioDur = '0:14';

    if (scenarioType === 'birth') {
      userMsg = 'Don Alejo, buenos días. Para reportarle que acá en el bajo parió la vaca 4512 un ternero macho bien bonito de 38 kilos hoy temprano.';
      isAudio = true;
    } else if (scenarioType === 'weigh') {
      userMsg = 'Pesamos el lote Ceba 1 completo. 22 novillos dieron 9.460 kg en total, promedio 430 kg.';
    } else if (scenarioType === 'sale') {
      userMsg = 'Acabamos de despachar para el Frigorífico Central 18 novillos gordos del lote Ceba 2. En la báscula pesaron 8.740 kilos en total a 9.100 el kilo. Guía ICA 44812.';
    } else if (scenarioType === 'health') {
      userMsg = 'Le aplicamos Oxitetraciclina al lote 3 por cuadro de neumonía a 12 vacas.';
    } else if (scenarioType === 'incomplete') {
      userMsg = 'Parió la vaca 3105 en el callejón.';
    }

    triggerChatFlow(userMsg, isAudio, audioDur);
  };

  const handleSendCustomMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    triggerChatFlow(text, false);
  };

  const triggerChatFlow = (userText: string, isAudio: boolean = false, audioDuration?: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'u-' + Date.now();

    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userText,
      time: timeNow,
      isAudio,
      audioDuration,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsBotTyping(true);

    // Process NLP logic
    setTimeout(() => {
      processBotResponse(userText);
      setIsBotTyping(false);
    }, 1100);
  };

  const processBotResponse = (input: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const lower = input.toLowerCase();

    // 1. Check if user is confirming pending 2-step sale
    if (lower === '1' || lower === '1️⃣' || lower.includes('si') || lower.includes('sí') || lower.includes('confirmar')) {
      const lastConfirmMsg = [...messages].reverse().find((m) => m.requiresConfirmation && !m.confirmed);
      if (lastConfirmMsg) {
        lastConfirmMsg.confirmed = true;
        const confirmBotMsg: ChatMessage = {
          id: 'b-' + Date.now(),
          sender: 'bot',
          text: '✅ ¡Venta confirmada con éxito!\n\n• Se descontaron los 18 animales del Lote Ceba 2 en el inventario activo.\n• Comprobante de salida generado: #VT-2026-088\n• Guía ICA #44812 asociada.',
          time: timeNow,
          jsonPayload: {
            event_type: 'INVENTORY_SALE_DISPATCH_CONFIRMED',
            farm_id: currentFarm?.profile.id || 'farm-san-juan',
            status: 'EXECUTED',
            affected_lot: 'Lote Ceba 2',
            heads_deducted: 18,
            total_weight_kg: 8740.0,
            gross_amount_cop: 79534000.0,
            dispatch_permit: '44812',
            inventory_impact_mode: 'IMMEDIATE_DEPRESSION',
            timestamp: new Date().toISOString(),
          },
        };
        setMessages((prev) => [...prev, confirmBotMsg]);
        setSelectedJsonView(confirmBotMsg.jsonPayload);

        // Impact recent activities in software
        if (onAddRecentActivity) {
          onAddRecentActivity('Venta Confirmada (WhatsApp)', '18 Novillos Lote Ceba 2 -> Frigorífico Central', '$79.5M COP', 'weigh');
        }
        return;
      }
    }

    // 2. Scenario: Incomplete birth report
    if (lower.includes('parió') && !lower.includes('kilo') && !lower.includes('kg') && !lower.includes('macho') && !lower.includes('hembra')) {
      const match = input.match(/\d+/);
      const cowId = match ? match[0] : 'la vaca';
      const botMsg: ChatMessage = {
        id: 'b-' + Date.now(),
        sender: 'bot',
        text: `Anotado el parto de la vaca #${cowId}. ¿La cría es macho o hembra y cuánto pesó al nacer en la báscula?`,
        time: timeNow,
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    // 3. Scenario: Complete Birth
    if (lower.includes('parió') || lower.includes('pario') || lower.includes('nacimiento') || lower.includes('ternero') || lower.includes('ternera')) {
      const isMacho = lower.includes('macho') || lower.includes('ternero');
      const weightMatch = input.match(/(\d+([\.,]\d+)?)\s*(kilos|kg)/i);
      const weight = weightMatch ? parseFloat(weightMatch[1].replace(',', '.')) : 38.0;
      const cowMatch = input.match(/vaca\s*#?(\d+)/i) || input.match(/(\d{3,5})/);
      const cowId = cowMatch ? cowMatch[1] : '4512';
      const suggestedTag = '9085-T326';

      const botMsg: ChatMessage = {
        id: 'b-' + Date.now(),
        sender: 'bot',
        text: `Listo. Registrado en el sistema:\n\n• Madre: #${cowId}\n• Cría: ${isMacho ? 'Macho' : 'Hembra'} (${weight.toFixed(1)} kg)\n• Chapeta sugerida: #${suggestedTag}\n• Fecha: ${new Date().toLocaleDateString('es-CO')}\n• Lote: Maternidad / Potrero 3\n\n¡Quedó cargado en Crianza de Terneros!`,
        time: timeNow,
        jsonPayload: {
          event_type: 'BIRTH_REGISTRATION',
          farm_id: currentFarm?.profile.id || 'farm-san-juan',
          mother_id: cowId,
          gender: isMacho ? 'macho' : 'hembra',
          birth_weight_kg: weight,
          birth_date: new Date().toISOString().split('T')[0],
          suggested_tag_id: suggestedTag,
          paddock_lot_id: 'lote-maternidad-potrero-3',
          operator: 'Don Ramón (Mayordomo)',
          action: 'EXECUTE_API',
        },
      };

      setMessages((prev) => [...prev, botMsg]);
      setSelectedJsonView(botMsg.jsonPayload);

      if (onAddRecentActivity) {
        onAddRecentActivity('Nacimiento (WhatsApp Bot)', `Cría ${isMacho ? 'Macho' : 'Hembra'} de Vaca #${cowId} (Tag #${suggestedTag})`, `${weight} kg`, 'birth');
      }
      return;
    }

    // 4. Scenario: Sale with 2-Step Confirmation
    if (lower.includes('despachamos') || lower.includes('venta') || lower.includes('frigorífico') || lower.includes('frigorifico') || lower.includes('novillos')) {
      const botMsg: ChatMessage = {
        id: 'b-' + Date.now(),
        sender: 'bot',
        text: `⚠️ *Confirmación de Venta y Salida de Inventario*\n\n• Comprador: Frigorífico Central\n• Cantidad: 18 novillos (Lote Ceba 2)\n• Peso Total: 8,740 kg (Prom: 485.5 kg)\n• Precio: $9,100 / kg\n• Total Liquidado: $79,534,000 COP\n• Guía ICA: 44812\n\n🚨 *Esta acción dará de baja los 18 animales del inventario activo de la finca.*\n\n¿Confirmas la salida?\n1️⃣ Sí, descargar del inventario\n2️⃣ Corregir datos`,
        time: timeNow,
        requiresConfirmation: true,
        confirmed: false,
        jsonPayload: {
          event_type: 'INVENTORY_SALE_DISPATCH_PENDING_CONFIRMATION',
          farm_id: currentFarm?.profile.id || 'farm-san-juan',
          buyer_name: 'Frigorífico Central',
          source_lot: 'Lote Ceba 2',
          head_count: 18,
          total_weight_kg: 8740.0,
          price_per_kg_cop: 9100.0,
          gross_amount_cop: 79534000.0,
          health_permit_number: '44812',
          user_confirmed: false,
          requires_step2: true,
        },
      };
      setMessages((prev) => [...prev, botMsg]);
      setSelectedJsonView(botMsg.jsonPayload);
      return;
    }

    // 5. Scenario: Weighing
    if (lower.includes('pesamos') || lower.includes('báscula') || lower.includes('pesaje') || lower.includes('promedio')) {
      const botMsg: ChatMessage = {
        id: 'b-' + Date.now(),
        sender: 'bot',
        text: `⚖️ *Pesaje de Lote Registrado con Éxito*\n\n• Lote: Ceba 1 (22 animales)\n• Peso Total: 9,460.0 kg\n• Peso Promedio: 430.0 kg\n• GDP Estimada: +820 g/día\n\nLos datos se actualizaron en la pestaña de Ganado & Pesajes.`,
        time: timeNow,
        jsonPayload: {
          event_type: 'BATCH_WEIGHING_RECORD',
          farm_id: currentFarm?.profile.id || 'farm-san-juan',
          lot_id: 'lote-ceba-1',
          head_count: 22,
          total_weight_kg: 9460.0,
          average_weight_kg: 430.0,
          estimated_daily_gain_g: 820,
          date: new Date().toISOString().split('T')[0],
          action: 'EXECUTE_API',
        },
      };
      setMessages((prev) => [...prev, botMsg]);
      setSelectedJsonView(botMsg.jsonPayload);

      if (onAddRecentActivity) {
        onAddRecentActivity('Pesaje Lote Ceba 1 (WhatsApp)', '22 Novillos (Prom: 430 kg - GDP: +820g)', '9,460 kg', 'weigh');
      }
      return;
    }

    // 6. Scenario: Health / Antibiotic & Withdrawal
    if (lower.includes('oxitetraciclina') || lower.includes('ivermectina') || lower.includes('medicamento') || lower.includes('neumonía') || lower.includes('vacuna')) {
      const botMsg: ChatMessage = {
        id: 'b-' + Date.now(),
        sender: 'bot',
        text: `💉 *Tratamiento Sanitario Registrado*\n\n• Fármaco: Oxitetraciclina L.A. (20%)\n• Destino: Lote 3 (12 animales)\n• Diagnóstico: Cuadro respiratorio / Neumonía\n\n⚠️ *ALERTA DE TIEMPO DE RETIRO*\n• Retiro en Carne: 28 días (Hasta: ${new Date(Date.now() + 28 * 86400000).toLocaleDateString('es-CO')})\n• Retiro en Leche: 7 días\n*Los animales han sido marcados con bandera preventiva en el sistema.*`,
        time: timeNow,
        jsonPayload: {
          event_type: 'HEALTH_TREATMENT_APPLICATION',
          farm_id: currentFarm?.profile.id || 'farm-san-juan',
          medication_name: 'Oxitetraciclina L.A. 20%',
          target_lot_id: 'lote-3',
          affected_heads: 12,
          reason: 'Cuadro respiratorio / Neumonía',
          withdrawal_meat_days: 28,
          withdrawal_milk_days: 7,
          withdrawal_meat_release_date: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
          safety_flag: 'ACTIVE_WITHDRAWAL_RESTRICTION',
          action: 'EXECUTE_API',
        },
      };
      setMessages((prev) => [...prev, botMsg]);
      setSelectedJsonView(botMsg.jsonPayload);

      if (onAddRecentActivity) {
        onAddRecentActivity('Tratamiento Sanitario (WhatsApp)', 'Oxitetraciclina L.A. en Lote 3 (Retiro: 28 días)', '12 Vacas', 'health');
      }
      return;
    }

    // Fallback general AI response
    const botMsg: ChatMessage = {
      id: 'b-' + Date.now(),
      sender: 'bot',
      text: `Recibido: "${input}". He registrado la nota de campo para el predio ${currentFarm?.profile.name || 'San Juan'}. ¿Deseas asociarlo a algún lote o animal específico?`,
      time: timeNow,
      jsonPayload: {
        event_type: 'GENERIC_FIELD_NOTE',
        raw_text: input,
        farm_id: currentFarm?.profile.id || 'farm-san-juan',
        timestamp: new Date().toISOString(),
      },
    };
    setMessages((prev) => [...prev, botMsg]);
    setSelectedJsonView(botMsg.jsonPayload);
  };

  const handleImpactSoftwareDirectly = () => {
    if (!selectedJsonView) return;
    if (onAddRecentActivity) {
      const type = selectedJsonView.event_type || 'EVENTO';
      onAddRecentActivity(
        `WhatsApp Bot: ${type.replace(/_/g, ' ')}`,
        `Impactado directamente desde Webhook de WhatsApp`,
        selectedJsonView.head_count ? `${selectedJsonView.head_count} cabezas` : 'Sincronizado',
        'weigh',
      );
    }
    setImpactSuccessNotice('¡Datos impactados exitosamente en la base de datos de Campaña Ganadora!');
    setTimeout(() => setImpactSuccessNotice(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#15241C] rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[820px] flex flex-col overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#075e54] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold leading-tight">
                  Vincular Asistente WhatsApp de Campo
                </h2>
                <span className="bg-[#25D366] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                  BOT GANADERIA
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 truncate max-w-md">
                Recepción inteligente de audios, fotos y textos desde el potrero para {currentFarm?.profile.name || 'San Juan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-[#25D366] animate-pulse" />
              <span>{isLiveConnected ? 'Webhook Conectado' : 'Desconectado'}</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-5 bg-[#1F3327] border-b border-white/10 text-xs font-bold shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('playground')}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'playground'
                  ? 'border-[#075e54] text-[#075e54] bg-[#15241C] shadow-xs'
                  : 'border-transparent text-[#A5B8AC] hover:text-white hover:bg-slate-200/60'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Simulador en Vivo (Probar Bot de Campo)</span>
            </button>

            <button
              onClick={() => setActiveTab('qr_config')}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'qr_config'
                  ? 'border-[#075e54] text-[#075e54] bg-[#15241C] shadow-xs'
                  : 'border-transparent text-[#A5B8AC] hover:text-white hover:bg-slate-200/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Vinculación QR & Permisos de Teléfonos</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-[#075e54] text-[#075e54] bg-[#15241C] shadow-xs'
                  : 'border-transparent text-[#A5B8AC] hover:text-white hover:bg-slate-200/60'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Arquitectura & Meta Cloud API</span>
            </button>
          </div>

          <span className="hidden md:block text-[11px] text-[#A5B8AC] font-mono">
            {botPhoneNumber}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden bg-[#0D1A13] flex flex-col">
          {/* TAB 1: PLAYGROUND SIMULATOR */}
          {activeTab === 'playground' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
              {/* Left Column: Preset Test Scenarios Toolbar */}
              <div className="lg:col-span-4 bg-[#15241C] border-r border-white/10 p-4 overflow-y-auto space-y-4 flex flex-col">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5B8AC] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#075e54]" />
                    <span>Casos de Prueba en Potrero</span>
                  </h3>
                  <p className="text-[11px] text-[#A5B8AC] mt-0.5">
                    Haz clic en cualquier escenario para simular una nota de voz o mensaje del mayordomo:
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => sendPresetScenario('birth')}
                    className="w-full text-left p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/90 border border-amber-200/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Baby className="w-3.5 h-3.5 text-amber-700" />
                        1. Nacimiento (Audio Mayordomo)
                      </span>
                      <span className="text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded-full font-bold">
                        🎙️ Audio 0:14
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] line-clamp-2 italic">
                      "Don Alejo, parió la vaca 4512 un ternero macho de 38 kilos en el bajo..."
                    </p>
                    <span className="text-[10px] text-amber-800 font-semibold block mt-1">
                      → Extrae sexo, peso, madre y sugiere chapeta #9085-T326
                    </span>
                  </button>

                  <button
                    onClick={() => sendPresetScenario('sale')}
                    className="w-full text-left p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/90 border border-rose-200/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                        2. Venta (Confirmación 2 Pasos)
                      </span>
                      <span className="text-[9px] bg-rose-200 text-rose-950 px-1.5 py-0.2 rounded-full font-bold">
                        Baja Inventario
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] line-clamp-2 italic">
                      "Despachamos 18 novillos al Frigorífico Central a $9.100/kg, guía 44812..."
                    </p>
                    <span className="text-[10px] text-rose-800 font-semibold block mt-1">
                      → Exige responder "1" antes de descontar animales
                    </span>
                  </button>

                  <button
                    onClick={() => sendPresetScenario('weigh')}
                    className="w-full text-left p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/90 border border-emerald-200/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        3. Pesaje de Lote
                      </span>
                      <span className="text-[9px] bg-emerald-200 text-emerald-950 px-1.5 py-0.2 rounded-full font-bold">
                        GDP +820g
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] line-clamp-2 italic">
                      "Pesamos el lote Ceba 1 completo. 22 novillos dieron 9.460 kg..."
                    </p>
                  </button>

                  <button
                    onClick={() => sendPresetScenario('health')}
                    className="w-full text-left p-3 rounded-2xl bg-teal-50/70 hover:bg-teal-100/90 border border-teal-200/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                        4. Sanidad & Tiempo de Retiro
                      </span>
                      <span className="text-[9px] bg-teal-200 text-teal-950 px-1.5 py-0.2 rounded-full font-bold">
                        28 Días Retiro
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] line-clamp-2 italic">
                      "Le aplicamos Oxitetraciclina al lote 3 por neumonía..."
                    </p>
                  </button>

                  <button
                    onClick={() => sendPresetScenario('incomplete')}
                    className="w-full text-left p-3 rounded-2xl bg-[#0D1A13] hover:bg-[#1F3327] border border-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-[#A5B8AC]" />
                        5. Manejo de Incompletitud
                      </span>
                      <span className="text-[9px] bg-[#202E25] text-white px-1.5 py-0.2 rounded-full font-bold">
                        Falta dato
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A5B8AC] line-clamp-2 italic">
                      "Parió la vaca 3105 en el callejón."
                    </p>
                    <span className="text-[10px] text-white font-semibold block mt-1">
                      → Pregunta en 1 sola frase corta por el peso y sexo
                    </span>
                  </button>
                </div>

                {/* JSON Inspector Preview */}
                {selectedJsonView && (
                  <div className="mt-auto pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1">
                        <Code className="w-3.5 h-3.5 text-indigo-600" />
                        JSON Generado para API
                      </span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(selectedJsonView, null, 2), 'json_preview')}
                        className="text-[10px] text-[#A5B8AC] hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'json_preview' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'json_preview' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>

                    <pre className="bg-slate-950 text-emerald-400 p-2.5 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36 custom-scrollbar border border-slate-800 leading-tight">
                      {JSON.stringify(selectedJsonView, null, 2)}
                    </pre>

                    <button
                      onClick={handleImpactSoftwareDirectly}
                      className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Impactar Software en Tiempo Real</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Center & Right Column: Interactive WhatsApp Chat Window */}
              <div className="lg:col-span-8 flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
                {/* Simulated WhatsApp Chat Header */}
                <div className="px-4 py-2.5 bg-[#075e54] text-white flex items-center justify-between shadow-md shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-950 flex items-center justify-center font-bold text-sm shadow-xs">
                      🤠
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold leading-tight flex items-center gap-1.5">
                        <span>GanaderIA Bot (Finca {currentFarm?.profile.name || 'San Juan'})</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                      </h4>
                      <p className="text-[10px] text-emerald-200">en línea • WhatsApp Business API</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded-full font-mono text-emerald-200">
                      Modo: Mayordomo
                    </span>
                  </div>
                </div>

                {/* Toast Notification for Real Impact */}
                <AnimatePresence>
                  {impactSuccessNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-14 left-4 right-4 z-30 bg-emerald-800 text-white text-xs font-bold p-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                      <span>{impactSuccessNotice}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {messages.map((m) => {
                    const isUser = m.sender === 'user';
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs text-xs relative ${
                            isUser
                              ? 'bg-[#d9fdd3] text-white rounded-tr-none'
                              : 'bg-[#15241C] text-white rounded-tl-none border border-white/10'
                          }`}
                        >
                          {/* Audio player simulation */}
                          {m.isAudio && (
                            <div className="flex items-center gap-2.5 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/60 mb-1.5">
                              <div className="w-7 h-7 rounded-full bg-[#075e54] text-white flex items-center justify-center shrink-0">
                                <Mic className="w-3.5 h-3.5 text-[#25D366]" />
                              </div>
                              <div className="flex-1">
                                <div className="h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#075e54] w-2/3" />
                                </div>
                                <div className="flex justify-between text-[9px] text-[#A5B8AC] mt-1 font-mono">
                                  <span>Audio de voz ({m.audioDuration || '0:12'})</span>
                                  <span className="text-emerald-700 font-bold">Whisper Transcrito</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                          {/* Action Button for 2-step confirmation */}
                          {m.requiresConfirmation && !m.confirmed && (
                            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-2">
                              <button
                                onClick={() => triggerChatFlow('1', false)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <Check className="w-3 h-3" />
                                <span>1️⃣ Sí, Confirmar y Descargar</span>
                              </button>
                              <button
                                onClick={() => triggerChatFlow('2', false)}
                                className="px-3 py-1 bg-[#1F3327] hover:bg-[#202E25] text-white font-semibold text-[11px] rounded-lg transition cursor-pointer"
                              >
                                2️⃣ Corregir
                              </button>
                            </div>
                          )}

                          {/* Footer Info */}
                          <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] text-[#A5B8AC]">
                            <span>{m.time}</span>
                            {isUser && <Check className="w-3 h-3 text-sky-600" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isBotTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#15241C] rounded-2xl rounded-tl-none p-3 shadow-xs border border-white/10 flex items-center gap-1.5">
                        <span className="text-xs text-[#A5B8AC] italic">GanaderIA Bot está procesando zootécnicamente</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#075e54] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#075e54] animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#075e54] animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendCustomMessage}
                  className="p-2.5 bg-[#f0f2f5] border-t border-white/15 flex items-center gap-2 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => sendPresetScenario('birth')}
                    className="p-2 text-[#A5B8AC] hover:text-[#075e54] hover:bg-[#202E25] rounded-full transition cursor-pointer"
                    title="Simular Nota de Voz"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe como mayordomo (ej: 'parió la vaca 4512 un macho de 38kg')..."
                    className="flex-1 bg-[#15241C] border border-white/15 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#075e54]"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="w-9 h-9 rounded-full bg-[#075e54] hover:bg-[#064e3b] disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: QR & CONFIGURATION */}
          {activeTab === 'qr_config' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full">
              {/* QR Code Linking Card */}
              <div className="bg-[#15241C] rounded-3xl p-6 shadow-sm border border-white/10 flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-[#0D1A13] border-2 border-dashed border-emerald-300 rounded-3xl flex flex-col items-center justify-center shrink-0">
                  <div className="w-40 h-40 bg-[#15241C] p-2 rounded-2xl shadow-inner flex items-center justify-center relative">
                    <QrCode className="w-36 h-36 text-white" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <Smartphone className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#075e54] mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Conectado
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">
                      Número Oficial Conectado para {currentFarm?.profile.name || 'San Juan'}
                    </h3>
                    <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-full">
                      🟢 En Línea
                    </span>
                  </div>

                  <p className="text-xs text-[#A5B8AC] leading-relaxed">
                    Cualquier audio, imagen o mensaje enviado desde los teléfonos autorizados a este número de WhatsApp será procesado por el motor zootécnico de IA e impactará el software en tiempo real.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-[#0D1A13] p-3 rounded-2xl border border-white/10">
                      <span className="text-[10px] text-[#A5B8AC] font-bold uppercase tracking-wider block">
                        Número de la Finca:
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        {botPhoneNumber}
                      </span>
                    </div>

                    <div className="bg-[#0D1A13] p-3 rounded-2xl border border-white/10">
                      <span className="text-[10px] text-[#A5B8AC] font-bold uppercase tracking-wider block">
                        Estado del Webhook:
                      </span>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Meta Cloud API (HTTP 200 OK)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorized Phones Management */}
              <div className="bg-[#15241C] rounded-3xl p-6 shadow-sm border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-[#075e54]" />
                      <span>Teléfonos y Operarios Autorizados</span>
                    </h3>
                    <p className="text-xs text-[#A5B8AC]">
                      Solo los números registrados en esta lista tienen autorización para registrar eventos y bajas de inventario.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddPhone(!showAddPhone)}
                    className="px-3 py-1.5 bg-[#075e54] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Teléfono</span>
                  </button>
                </div>

                {/* Form to add phone */}
                {showAddPhone && (
                  <form onSubmit={handleAddPhone} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-950">Nuevo Operario / Mayordomo Autorizado</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={newPhoneName}
                          onChange={(e) => setNewPhoneName(e.target.value)}
                          placeholder="Ej. Don Hernán (Mayordomo)"
                          className="w-full bg-[#15241C] border border-white/15 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Número de WhatsApp (con país)</label>
                        <input
                          type="text"
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                          placeholder="+57 311 234 5678"
                          className="w-full bg-[#15241C] border border-white/15 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#A5B8AC] block mb-1">Rol / Permisos</label>
                        <select
                          value={newPhoneRole}
                          onChange={(e) => setNewPhoneRole(e.target.value)}
                          className="w-full bg-[#15241C] border border-white/15 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="Admin Total">Admin Total (Ventas, Sanidad, Altas)</option>
                          <option value="Operativo / Campo">Operativo / Campo (Nacimientos, Pesajes)</option>
                          <option value="Sanidad & Genética">Sanidad & Genética (Veterinario)</option>
                          <option value="Solo Pesajes">Solo Pesajes / Movimientos</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddPhone(false)}
                        className="px-3 py-1.5 bg-[#202E25] text-white text-xs font-semibold rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                      >
                        Guardar Autorización
                      </button>
                    </div>
                  </form>
                )}

                <div className="divide-y divide-slate-100">
                  {authorizedPhones.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1F3327] text-white flex items-center justify-center font-bold text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{p.name}</p>
                          <p className="text-[11px] font-mono text-[#A5B8AC]">{p.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-[#1F3327] text-white px-2 py-0.5 rounded-full font-semibold">
                          {p.role}
                        </span>
                        <button
                          onClick={() => handleDeletePhone(p.id)}
                          className="text-[#A5B8AC] hover:text-rose-600 p-1 rounded-lg transition"
                          title="Eliminar autorización"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bot Security & Automation Switches */}
              <div className="bg-[#15241C] rounded-3xl p-6 shadow-sm border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white">
                  Políticas de Seguridad y Automatización IA
                </h3>

                <div className="space-y-3 pt-1">
                  <label className="flex items-center justify-between p-3 bg-[#0D1A13] rounded-2xl cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Confirmación en 2 Pasos para Ventas y Bajas
                      </span>
                      <span className="text-[11px] text-[#A5B8AC]">
                        Exige confirmación con "1" o "Sí" antes de descargar animales del inventario activo.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoTwoStepConfirm}
                      onChange={(e) => setAutoTwoStepConfirm(e.target.checked)}
                      className="w-4 h-4 text-[#075e54] rounded focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-[#0D1A13] rounded-2xl cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Transcripción Inteligente de Notas de Voz (Whisper)
                      </span>
                      <span className="text-[11px] text-[#A5B8AC]">
                        Convierte audios de mayordomos y vaqueros a texto estructurado en tiempo real.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoWhisper}
                      onChange={(e) => setAutoWhisper(e.target.checked)}
                      className="w-4 h-4 text-[#075e54] rounded focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-[#0D1A13] rounded-2xl cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Alertas Automáticas de Tiempo de Retiro Fármacos
                      </span>
                      <span className="text-[11px] text-[#A5B8AC]">
                        Advierte de inmediato los días de retiro de carne y leche cuando se aplican antibióticos.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoWithdrawalAlerts}
                      onChange={(e) => setAutoWithdrawalAlerts(e.target.checked)}
                      className="w-4 h-4 text-[#075e54] rounded focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & META CLOUD API GUIDE */}
          {activeTab === 'guide' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full">
              {/* Webhook Connection Endpoints */}
              <div className="bg-[#15241C] rounded-3xl p-6 shadow-sm border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#075e54]" />
                  <span>Configuración del Webhook en Meta for Developers</span>
                </h3>

                <p className="text-xs text-[#A5B8AC] leading-relaxed">
                  Para conectar tu cuenta corporativa de WhatsApp Cloud API, ingresa al panel de Meta Developers en la sección <b>WhatsApp &gt; Configuration &gt; Webhook</b> e ingresa estos valores:
                </p>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-white block mb-1">Callback URL (Webhook Endpoint)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={webhookUrl}
                        className="flex-1 bg-[#1F3327] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white"
                      />
                      <button
                        onClick={() => copyToClipboard(webhookUrl, 'webhook_url')}
                        className="px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'webhook_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'webhook_url' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white block mb-1">Verify Token</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={verifyToken}
                        className="flex-1 bg-[#1F3327] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white"
                      />
                      <button
                        onClick={() => copyToClipboard(verifyToken, 'verify_token')}
                        className="px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'verify_token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'verify_token' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Architecture Pipeline */}
              <div className="bg-[#15241C] rounded-3xl p-6 shadow-sm border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span>Pipeline Técnico de Procesamiento Multimodal</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#0D1A13] rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-[#A5B8AC] uppercase">Paso 1: Ingress</span>
                    <p className="font-bold text-white">WhatsApp Cloud API</p>
                    <p className="text-[11px] text-[#A5B8AC]">Recibe payload firmado con `X-Hub-Signature-256` y valida remitente en Redis.</p>
                  </div>

                  <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Paso 2: Audio & OCR</span>
                    <p className="font-bold text-emerald-950">Whisper & Gemini Vision</p>
                    <p className="text-[11px] text-emerald-800">Convierte notas de voz (.ogg) y extrae pesos de fotos de pantallas de báscula.</p>
                  </div>

                  <div className="p-3 bg-amber-950/30 rounded-2xl border border-amber-200 space-y-1">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Paso 3: Zootecnia IA</span>
                    <p className="font-bold text-amber-950">Gemini 2.5 Flash</p>
                    <p className="text-[11px] text-amber-800">Estructura datos, calcula chapeta #9085-T326 y valida retiros sanitarios.</p>
                  </div>

                  <div className="p-3 bg-blue-950/30 rounded-2xl border border-blue-200 space-y-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">Paso 4: Base de Datos</span>
                    <p className="font-bold text-blue-950">Campaña Ganadora</p>
                    <p className="text-[11px] text-blue-800">Afecta inventario activo, libros de nacimientos y genera comprobantes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
