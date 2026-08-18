import React, { useState, useMemo } from 'react';
import { safeOpenURL, safePrint } from '../../utils/printUtils';
import {
  PendingDailyActivity,
  PendingActivityCategory,
  PendingActivityPriority,
  PendingActivityStatus,
  FarmDataPackage,
  Employee,
  MainTab,
} from '../../types';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Printer,
  Share2,
  Calendar,
  UserCheck,
  MapPin,
  FileText,
  Stethoscope,
  Droplet,
  Wheat,
  Compass,
  Wrench,
  Warehouse,
  Users,
  HeartPulse,
  Trash2,
  Edit3,
  CalendarDays,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Check,
  ArrowUpRight,
} from 'lucide-react';

interface PendingActivitiesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: PendingDailyActivity[];
  onAddActivity: (activity: Omit<PendingDailyActivity, 'id' | 'createdAt'>) => void;
  onUpdateActivityStatus: (
    id: string,
    status: PendingActivityStatus,
    completedBy?: string,
    completionNotes?: string,
  ) => void;
  onDeleteActivity: (id: string) => void;
  currentFarm?: FarmDataPackage;
  employees?: Employee[];
  onNavigateToTab?: (tab: MainTab) => void;
}

export const CATEGORY_CONFIG: Record<
  PendingActivityCategory,
  { label: string; icon: React.FC<{ className?: string }>; colorBg: string; colorText: string; borderColor: string }
> = {
  sanitario: {
    label: 'Sanitario / Salud',
    icon: Stethoscope,
    colorBg: 'bg-rose-50',
    colorText: 'text-rose-900',
    borderColor: 'border-rose-200',
  },
  ordeno: {
    label: 'Ordeño & Lechería',
    icon: Droplet,
    colorBg: 'bg-blue-50',
    colorText: 'text-blue-900',
    borderColor: 'border-blue-200',
  },
  nutricion: {
    label: 'Nutrición & Suplemento',
    icon: Wheat,
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-900',
    borderColor: 'border-amber-200',
  },
  pastoreo: {
    label: 'Pastoreo & Aforo',
    icon: Compass,
    colorBg: 'bg-emerald-50',
    colorText: 'text-emerald-900',
    borderColor: 'border-emerald-200',
  },
  mantenimiento: {
    label: 'Mantenimiento & Cercas',
    icon: Wrench,
    colorBg: 'bg-stone-100',
    colorText: 'text-stone-900',
    borderColor: 'border-stone-300',
  },
  inventario: {
    label: 'Bodega e Insumos',
    icon: Warehouse,
    colorBg: 'bg-purple-50',
    colorText: 'text-purple-900',
    borderColor: 'border-purple-200',
  },
  personal: {
    label: 'Personal & Nómina',
    icon: Users,
    colorBg: 'bg-indigo-50',
    colorText: 'text-indigo-900',
    borderColor: 'border-indigo-200',
  },
  reproduccion: {
    label: 'Reproducción & IATF',
    icon: HeartPulse,
    colorBg: 'bg-pink-50',
    colorText: 'text-pink-900',
    borderColor: 'border-pink-200',
  },
};

export const PRIORITY_CONFIG: Record<
  PendingActivityPriority,
  { label: string; badgeBg: string; badgeText: string; borderColor: string; dotColor: string }
> = {
  alta: {
    label: '🚨 Urgente / Alta',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-900',
    borderColor: 'border-red-300',
    dotColor: 'bg-red-600',
  },
  media: {
    label: '⚡ Media',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
  normal: {
    label: '🟢 Normal',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    borderColor: 'border-slate-300',
    dotColor: 'bg-slate-500',
  },
};

export const PendingActivitiesReportModal: React.FC<PendingActivitiesReportModalProps> = ({
  isOpen,
  onClose,
  activities,
  onAddActivity,
  onUpdateActivityStatus,
  onDeleteActivity,
  currentFarm,
  employees = [],
  onNavigateToTab,
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming' | 'completed'>('today');

  // Completion modal state
  const [completingActivity, setCompletingActivity] = useState<PendingDailyActivity | null>(null);
  const [completionWorker, setCompletionWorker] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  // Form State for New Task
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PendingActivityCategory>('sanitario');
  const [priority, setPriority] = useState<PendingActivityPriority>('alta');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState('07:00 AM');
  const [responsibleWorker, setResponsibleWorker] = useState('');
  const [assignedLotOrAnimal, setAssignedLotOrAnimal] = useState('');
  const [locationPaddock, setLocationPaddock] = useState('');
  const [notes, setNotes] = useState('');

  const [showCompletedSection, setShowCompletedSection] = useState(false);

  if (!isOpen) return null;

  // Filter calculations
  const filteredActivities = activities.filter((act) => {
    // Search term
    const matchesSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (act.responsibleWorker && act.responsibleWorker.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (act.assignedLotOrAnimal && act.assignedLotOrAnimal.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (act.locationPaddock && act.locationPaddock.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category
    const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory;

    // Priority
    const matchesPriority = selectedPriority === 'all' || act.priority === selectedPriority;

    // Time filter
    let matchesTime = true;
    if (selectedTimeFilter === 'today') {
      matchesTime = act.status !== 'completada' && act.scheduledDate === todayStr;
    } else if (selectedTimeFilter === 'overdue') {
      matchesTime = act.status !== 'completada' && act.scheduledDate < todayStr;
    } else if (selectedTimeFilter === 'upcoming') {
      matchesTime = act.status !== 'completada' && act.scheduledDate > todayStr;
    } else if (selectedTimeFilter === 'completed') {
      matchesTime = act.status === 'completada';
    } else if (selectedTimeFilter === 'all') {
      matchesTime = act.status !== 'completada';
    }

    return matchesSearch && matchesCategory && matchesPriority && matchesTime;
  });

  const completedActivitiesList = activities.filter((a) => a.status === 'completada');

  // KPI calculations
  const pendingCount = activities.filter((a) => a.status !== 'completada').length;
  const overdueCount = activities.filter((a) => a.status !== 'completada' && a.scheduledDate < todayStr).length;
  const todayCount = activities.filter((a) => a.status !== 'completada' && a.scheduledDate === todayStr).length;
  const completedCount = completedActivitiesList.length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddActivity({
      title,
      category,
      priority,
      status: 'pendiente',
      scheduledDate: scheduledDate || todayStr,
      scheduledTime,
      responsibleWorker: responsibleWorker || (employees.length > 0 ? employees[0].fullName : 'Vaquero de turno'),
      assignedLotOrAnimal,
      locationPaddock,
      notes,
      farmId: currentFarm?.profile.id || 'farm-1',
    });

    // Reset Form
    setTitle('');
    setNotes('');
    setAssignedLotOrAnimal('');
    setLocationPaddock('');
    setShowNewForm(false);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingActivity) return;

    onUpdateActivityStatus(
      completingActivity.id,
      'completada',
      completionWorker || completingActivity.responsibleWorker || 'Administrador',
      completionNotes,
    );

    setCompletingActivity(null);
    setCompletionWorker('');
    setCompletionNotes('');
  };

  const handleShareWhatsApp = () => {
    const farmName = currentFarm?.profile.name || 'Finca Ganadera';
    let text = `📋 *REPORTE DE ACTIVIDADES DIARIAS PENDIENTES*\n🏡 *Finca:* ${farmName}\n📅 *Fecha:* ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

    const pendingTodayOrOverdue = activities.filter(
      (a) => a.status !== 'completada' && a.scheduledDate <= todayStr,
    );

    if (pendingTodayOrOverdue.length === 0) {
      text += `✅ *¡No hay actividades pendientes programadas para el día de hoy!*\n`;
    } else {
      pendingTodayOrOverdue.forEach((act, i) => {
        const isOverdue = act.scheduledDate < todayStr;
        const prioTag = act.priority === 'alta' ? '🚨 URGENTE' : act.priority === 'media' ? '⚡ MEDIA' : '🟢 NORMAL';
        text += `*${i + 1}. ${act.title}*\n`;
        text += `   • Categoría: ${CATEGORY_CONFIG[act.category]?.label || act.category}\n`;
        text += `   • Prioridad: ${prioTag} ${isOverdue ? '(⏰ VENCIDA)' : ''}\n`;
        if (act.scheduledTime) text += `   • Hora: ${act.scheduledTime}\n`;
        if (act.responsibleWorker) text += `   • Responsable: ${act.responsibleWorker}\n`;
        if (act.locationPaddock) text += `   • Ubicación: ${act.locationPaddock}\n`;
        if (act.notes) text += `   • Notas: ${act.notes}\n`;
        text += `\n`;
      });
    }

    text += `\nGenerado desde *GanaderIA System OS* 📲`;

    const encoded = encodeURIComponent(text);
    safeOpenURL(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 border-2 border-[#c1c8c2] shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between pb-4 border-b border-[#eeeeee] shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#012d1d] text-white rounded-2xl shadow-sm">
              <CalendarDays className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-[#012d1d]">
                  Reporte de Actividades Diarias Pendientes
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  🏡 {currentFarm?.profile.name || 'Finca Principal'}
                </span>
              </div>
              <p className="text-xs text-[#717973] font-medium mt-0.5">
                Plan operativo de campo, tareas programadas, alertas de rutina y control de cumplimiento.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#717973] hover:text-black rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 shrink-0">
          <button
            onClick={() => setSelectedTimeFilter('all')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedTimeFilter === 'all'
                ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-md'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold uppercase block opacity-80">Pendientes Totales</span>
            <span className="font-mono text-2xl font-black">{pendingCount}</span>
            <span className="text-[10px] block opacity-70">Tareas activas</span>
          </button>

          <button
            onClick={() => setSelectedTimeFilter('overdue')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedTimeFilter === 'overdue'
                ? 'bg-rose-900 text-white border-rose-950 shadow-md ring-2 ring-rose-400'
                : overdueCount > 0
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase block">🚨 Vencidas</span>
              {overdueCount > 0 && (
                <span className="animate-ping inline-flex h-2 w-2 rounded-full bg-rose-500 opacity-75"></span>
              )}
            </div>
            <span className="font-mono text-2xl font-black">{overdueCount}</span>
            <span className="text-[10px] block opacity-80">Requieren atención</span>
          </button>

          <button
            onClick={() => setSelectedTimeFilter('today')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedTimeFilter === 'today'
                ? 'bg-emerald-900 text-white border-emerald-950 shadow-md ring-2 ring-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <span className="text-[10px] font-bold uppercase block">📅 Para Hoy</span>
            <span className="font-mono text-2xl font-black">{todayCount}</span>
            <span className="text-[10px] block opacity-80">{new Date().toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}</span>
          </button>

          <button
            onClick={() => setSelectedTimeFilter('completed')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedTimeFilter === 'completed'
                ? 'bg-blue-900 text-white border-blue-950 shadow-md'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            <span className="text-[10px] font-bold uppercase block">✅ Completadas</span>
            <span className="font-mono text-2xl font-black">{completedCount}</span>
            <span className="text-[10px] block opacity-80">Histórico reciente</span>
          </button>
        </div>

        {/* ACTION BAR & FILTERS */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 mb-3 bg-slate-100 p-2.5 rounded-2xl border border-slate-200 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título, responsable, potrero o lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-[#012d1d]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2 text-xs font-bold rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-[#012d1d]"
            >
              <option value="all">Todas las Categorías</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="py-1.5 px-2 text-xs font-bold rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-[#012d1d]"
            >
              <option value="all">Todas las Prioridades</option>
              <option value="alta">🚨 Urgente / Alta</option>
              <option value="media">⚡ Media</option>
              <option value="normal">🟢 Normal</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="px-3.5 py-2 bg-[#012d1d] hover:bg-[#1b4332] text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showNewForm ? 'Ocultar Formulario' : 'Nueva Actividad'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Compartir resumen por WhatsApp al vaquero o mayordomo"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar WhatsApp</span>
            </button>

            <button
              onClick={safePrint}
              className="px-3 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Imprimir reporte de tareas"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>

        {/* FORMULARIO PARA AGREGAR NUEVA TAREA (DESPLEGABLE) */}
        {showNewForm && (
          <form
            onSubmit={handleCreateTask}
            className="p-4 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl mb-4 text-xs space-y-3 animate-in slide-in-from-top-2 shrink-0"
          >
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <span className="font-black text-[#012d1d] flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Programar Nueva Actividad Diaria
              </span>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="text-slate-500 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#012d1d] mb-1">Título de la Actividad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Vacunación Aftosa, Aforo Potrero 4, Revisión de Cerco..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold focus:border-[#012d1d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Categoría *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PendingActivityCategory)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold focus:border-[#012d1d] focus:outline-none"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Nivel de Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PendingActivityPriority)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-[#012d1d] focus:border-[#012d1d] focus:outline-none"
                >
                  <option value="alta">🚨 Urgente / Alta</option>
                  <option value="media">⚡ Media</option>
                  <option value="normal">🟢 Normal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Fecha Programada *</label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold focus:border-[#012d1d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Hora Estimada</label>
                <input
                  type="text"
                  placeholder="Ej. 07:00 AM"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold focus:border-[#012d1d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Trabajador Responsable</label>
                {employees.length > 0 ? (
                  <select
                    value={responsibleWorker}
                    onChange={(e) => setResponsibleWorker(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold focus:border-[#012d1d] focus:outline-none"
                  >
                    <option value="">Seleccionar del directorio...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={`${emp.fullName} (${emp.role})`}>
                        {emp.fullName} - {emp.role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ej. Carlos Ruiz (Vaquero)"
                    value={responsibleWorker}
                    onChange={(e) => setResponsibleWorker(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold focus:border-[#012d1d] focus:outline-none"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Lote / Animal Afectado</label>
                <input
                  type="text"
                  placeholder="Ej. Lote Engorde A / Vaca #4512"
                  value={assignedLotOrAnimal}
                  onChange={(e) => setAssignedLotOrAnimal(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold focus:border-[#012d1d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Potrero / Ubicación de Finca</label>
                <input
                  type="text"
                  placeholder="Ej. Potrero 5 (Las Palmas) / Corral Central"
                  value={locationPaddock}
                  onChange={(e) => setLocationPaddock(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold focus:border-[#012d1d] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#012d1d] mb-1">Instrucciones o Notas Especiales</label>
              <textarea
                rows={2}
                placeholder="Detalle dosis, insumos requeridos o procedimiento específico..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-[#012d1d] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#012d1d] hover:bg-[#1b4332] text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Guardar Actividad Pendiente
              </button>
            </div>
          </form>
        )}

        {/* LISTA DE ACTIVIDADES PENDIENTES */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl my-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2 opacity-60" />
              <h4 className="font-bold text-slate-800 text-sm">No hay actividades pendientes en este filtro</h4>
              <p className="text-xs text-slate-500 mt-1">
                {selectedTimeFilter === 'completed'
                  ? 'Aún no has marcado tareas como completadas.'
                  : '¡Excelente trabajo! Todo el plan operativo está al día.'}
              </p>
            </div>
          ) : (
            filteredActivities.map((act, idx) => {
              const catConfig = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.sanitario;
              const IconComp = catConfig.icon;
              const prioConfig = PRIORITY_CONFIG[act.priority] || PRIORITY_CONFIG.normal;
              const isOverdue = act.status !== 'completada' && act.scheduledDate < todayStr;
              const isToday = act.scheduledDate === todayStr;

              return (
                <div
                  key={`${act.id}-${idx}`}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    act.status === 'completada'
                      ? 'bg-slate-50 border-slate-200 opacity-75'
                      : isOverdue
                      ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200 shadow-2xs'
                      : isToday
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2.5 rounded-xl border ${catConfig.colorBg} ${catConfig.borderColor} shrink-0 mt-0.5`}>
                      <IconComp className={`w-5 h-5 ${catConfig.colorText}`} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-[#012d1d] text-sm sm:text-base">
                          {act.title}
                        </span>

                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${prioConfig.badgeBg} ${prioConfig.badgeText} ${prioConfig.borderColor}`}
                        >
                          {prioConfig.label}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catConfig.colorBg} ${catConfig.colorText} ${catConfig.borderColor}`}>
                          {catConfig.label}
                        </span>

                        {isOverdue && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                            ⏰ VENCIDA ({act.scheduledDate})
                          </span>
                        )}

                        {isToday && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                            📅 PARA HOY
                          </span>
                        )}
                      </div>

                      {/* DETALLES DE CONTEXTO */}
                      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-[#717973] font-medium pt-0.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {act.scheduledDate} {act.scheduledTime ? `• ${act.scheduledTime}` : ''}
                          </span>
                        </div>

                        {act.responsibleWorker && (
                          <div className="flex items-center gap-1 font-bold text-[#012d1d]">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{act.responsibleWorker}</span>
                          </div>
                        )}

                        {act.assignedLotOrAnimal && (
                          <div className="flex items-center gap-1 font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <span>🐄 {act.assignedLotOrAnimal}</span>
                          </div>
                        )}

                        {act.locationPaddock && (
                          <div className="flex items-center gap-1 font-semibold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{act.locationPaddock}</span>
                          </div>
                        )}
                      </div>

                      {act.notes && (
                        <p className="text-[11px] text-slate-700 font-medium bg-slate-100/80 p-2 rounded-xl border border-slate-200 mt-1">
                          📝 <span className="italic">{act.notes}</span>
                        </p>
                      )}

                      {act.status === 'completada' && (
                        <div className="text-[11px] text-emerald-900 font-bold bg-emerald-100/80 p-2 rounded-xl border border-emerald-300 mt-1 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Completada el {act.completedAt || 'Hoy'} por{' '}
                            <span className="underline">{act.completedBy || 'Administrador'}</span>
                            {act.completionNotes ? ` — "${act.completionNotes}"` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BARRAS DE ACCIÓN */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 w-full sm:w-auto justify-end flex-wrap">
                    {onNavigateToTab && (
                      <button
                        onClick={() => {
                          let targetTab: MainTab = 'cattle';
                          if (act.category === 'sanitario') targetTab = 'cattle';
                          else if (act.category === 'ordeno') targetTab = 'dairy';
                          else if (act.category === 'reproduccion') targetTab = 'genetics';
                          else if (act.category === 'pastoreo') targetTab = 'aforo';
                          else if (act.category === 'nutricion') targetTab = 'supplementation';
                          else if (act.category === 'mantenimiento') targetTab = 'gis';
                          else if (act.category === 'personal') targetTab = 'payroll';
                          else if (act.category === 'inventario') targetTab = 'inventory';

                          onClose();
                          onNavigateToTab(targetTab);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-200 hover:border-emerald-200"
                        title={`Ir al módulo de ${catConfig.label}`}
                      >
                        <span>Módulo</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {act.status !== 'completada' ? (
                      <button
                        onClick={() => {
                          setCompletingActivity(act);
                          setCompletionWorker(act.responsibleWorker || '');
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Completar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateActivityStatus(act.id, 'pendiente')}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
                        title="Reabrir actividad"
                      >
                        ↩️ Reabrir
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar actividad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL COMPLETAR ACTIVIDAD (POPUP DENTRO) */}
        {completingActivity && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <form
              onSubmit={handleCompleteSubmit}
              className="bg-white rounded-2xl max-w-md w-full p-5 border-2 border-emerald-300 shadow-2xl space-y-3 animate-in zoom-in-95 text-xs"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-black text-[#012d1d] text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Marcar Actividad como Completada
                </span>
                <button type="button" onClick={() => setCompletingActivity(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[#012d1d] font-bold">
                {completingActivity.title}
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">
                  Persona que Ejecutó o Confirmó la Tarea
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Ruiz / Don Jorge"
                  value={completionWorker}
                  onChange={(e) => setCompletionWorker(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-[#012d1d]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012d1d] mb-1">Observaciones / Novedades de Campo</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Se aplicó dosis completa sin inconvenientes. Quedan 3 frascos en bodega..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-[#012d1d]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingActivity(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl cursor-pointer"
                >
                  Confirmar Ejecución
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-[#eeeeee] mt-3 shrink-0 text-xs">
          <div className="text-[#717973] font-medium text-[11px] hidden sm:block">
            📅 Reporte actualizado en tiempo real • {activities.length} actividades registradas en hato.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold rounded-xl transition-colors ml-auto cursor-pointer"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};
