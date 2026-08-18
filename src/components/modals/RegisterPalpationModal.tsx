import React, { useState, useRef, useMemo } from 'react';
import {
  HeartPulse,
  X,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  User,
  Plus,
  Trash2,
  Sparkles,
  Share2,
  Printer,
  HelpCircle,
  Stethoscope,
  Activity,
  FileText,
  Clock,
  Baby,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LotRecord, FarmDataPackage, ReproductiveFemale } from '../../types';
import {
  PalpationBatchItemRecord,
  parsePalpationExcelOrCsvFile,
  parsePalpationPastedText,
  downloadPalpationExcelTemplate,
} from '../../utils/excelParser';

export interface PalpationSavedPayload {
  mode: 'individual' | 'batch';
  date: string;
  veterinarian: string;
  vetLicense?: string;
  costPerHead?: number;
  lotId?: string;
  lotName?: string;
  records: Array<{
    tag: string;
    result: 'preñada' | 'vacia_sincronizacion' | 'vacia_monta_natural' | 'vacia_ia' | 'vacia_te' | 'dudosa';
    gestationDays?: number;
    fppDate?: string;
    leftOvary?: string;
    rightOvary?: string;
    uterineTone?: string;
    cervix?: string;
    sireOrStraw?: string;
    protocol?: string;
    notes?: string;
  }>;
}

interface RegisterPalpationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lots: LotRecord[];
  farms: FarmDataPackage[];
  currentFarmId?: string;
  females?: ReproductiveFemale[];
  onSavePalpation: (payload: PalpationSavedPayload) => void;
}

export const RegisterPalpationModal: React.FC<RegisterPalpationModalProps> = ({
  isOpen,
  onClose,
  lots,
  farms,
  currentFarmId,
  females = [],
  onSavePalpation,
}) => {
  // Main Tab: 'individual' or 'batch'
  const [activeTab, setActiveTab] = useState<'individual' | 'batch'>('batch');

  // Shared Header States
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || '');
  const [veterinarian, setVeterinarian] = useState<string>('Dr. Carlos Restrepo (MVZ Esp. Reproducción)');
  const [vetLicense, setVetLicense] = useState<string>('TP-ICA-18942');
  const [costPerHead, setCostPerHead] = useState<string>('15000');

  // INDIVIDUAL FORM STATES
  const [indTag, setIndTag] = useState<string>('');
  const [indResult, setIndResult] = useState<
    'preñada' | 'vacia_sincronizacion' | 'vacia_monta_natural' | 'vacia_ia' | 'vacia_te' | 'dudosa'
  >('preñada');
  const [indGestationDays, setIndGestationDays] = useState<string>('45');
  const [indLeftOvary, setIndLeftOvary] = useState<string>('cl_activo');
  const [indRightOvary, setIndRightOvary] = useState<string>('foliculos_pequenos');
  const [indUterineTone, setIndUterineTone] = useState<string>('gestante_vesicula');
  const [indCervix, setIndCervix] = useState<string>('cerrado_normal');
  const [indSireOrStraw, setIndSireOrStraw] = useState<string>('Don Juan 450 (Pajilla)');
  const [indProtocol, setIndProtocol] = useState<string>('IATF Protocolo D0/D8/D10');
  const [indNotes, setIndNotes] = useState<string>('Excelente tono uterino y confirmación con vesícula fetal viable.');

  // BATCH / MANGA TABLE STATES
  const [batchItems, setBatchItems] = useState<PalpationBatchItemRecord[]>([
    {
      tag: '#102',
      result: 'preñada',
      gestationDays: '45',
      leftOvaryStatus: 'cl_activo',
      rightOvaryStatus: 'foliculos_pequenos',
      uterineStatus: 'gestante_vesicula',
      cervixStatus: 'cerrado_normal',
      sireOrStraw: 'Don Juan 450',
      notes: 'Confirmada viable',
    },
    {
      tag: '#105',
      result: 'preñada',
      gestationDays: '60',
      leftOvaryStatus: 'foliculos_pequenos',
      rightOvaryStatus: 'cl_activo',
      uterineStatus: 'gestante_vesicula',
      cervixStatus: 'cerrado_normal',
      sireOrStraw: 'Mr. V8 380/6',
      notes: 'Feto activo',
    },
    {
      tag: '#204',
      result: 'vacia_sincronizacion',
      leftOvaryStatus: 'cl_activo',
      rightOvaryStatus: 'foliculo_dominante',
      uterineStatus: 'normal_tonico',
      cervixStatus: 'moco_limpido',
      notes: 'Apta reinicio IATF',
    },
    {
      tag: '#315',
      result: 'vacia_monta_natural',
      leftOvaryStatus: 'anestro_inactivo',
      rightOvaryStatus: 'foliculos_pequenos',
      uterineStatus: 'flacido_inerte',
      cervixStatus: 'cerrado_normal',
      notes: 'Requiere estímulo mineral',
    },
    {
      tag: '#410',
      result: 'dudosa',
      gestationDays: '30',
      leftOvaryStatus: 'cl_activo',
      rightOvaryStatus: 'cl_activo',
      uterineStatus: 'normal_tonico',
      cervixStatus: 'cerrado_normal',
      notes: 'Revisar en 25 días',
    },
  ]);

  // Import Submode for Batch: 'table' | 'file' | 'paste'
  const [batchSubMode, setBatchSubMode] = useState<'table' | 'file' | 'paste'>('table');
  const [pastedText, setPastedText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter in Table
  const [tableFilter, setTableFilter] = useState<'all' | 'preñada' | 'vacia' | 'dudosa'>('all');

  // Quick Row State for Manga Entry
  const [newRowTag, setNewRowTag] = useState('');
  const [newRowResult, setNewRowResult] = useState<PalpationBatchItemRecord['result']>('preñada');
  const [newRowDays, setNewRowDays] = useState('45');
  const [newRowNotes, setNewRowNotes] = useState('');

  // Calculate FPP (Fecha Probable de Parto)
  const calculateFPP = (diagDateStr: string, daysGest: number) => {
    try {
      const base = new Date(diagDateStr);
      const remainingDays = 283 - daysGest;
      const fppDate = new Date(base.getTime() + remainingDays * 24 * 60 * 60 * 1000);
      return fppDate.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Computed Stats for the Batch
  const batchStats = useMemo(() => {
    const total = batchItems.length;
    if (total === 0) return { total: 0, prenadas: 0, prenadasPct: 0, vacias: 0, dudosas: 0, avgGestation: 0 };

    const prenadas = batchItems.filter((i) => i.result === 'preñada').length;
    const vacias = batchItems.filter((i) => i.result.startsWith('vacia')).length;
    const dudosas = batchItems.filter((i) => i.result === 'dudosa').length;
    const prenadasPct = total > 0 ? Math.round((prenadas / total) * 100) : 0;

    let gestSum = 0;
    let gestCount = 0;
    batchItems.forEach((i) => {
      if (i.result === 'preñada' && i.gestationDays) {
        const d = parseInt(i.gestationDays, 10);
        if (!isNaN(d)) {
          gestSum += d;
          gestCount++;
        }
      }
    });

    const avgGestation = gestCount > 0 ? Math.round(gestSum / gestCount) : 0;

    return { total, prenadas, prenadasPct, vacias, dudosas, avgGestation };
  }, [batchItems]);

  // Handler: Add Single Row in Manga Table
  const handleAddMangaRow = () => {
    if (!newRowTag.trim()) return;
    const newItem: PalpationBatchItemRecord = {
      tag: newRowTag.trim(),
      result: newRowResult,
      gestationDays: newRowResult === 'preñada' || newRowResult === 'dudosa' ? newRowDays : undefined,
      notes: newRowNotes.trim() || undefined,
      leftOvaryStatus: 'cl_activo',
      rightOvaryStatus: 'foliculos_pequenos',
      uterineStatus: newRowResult === 'preñada' ? 'gestante_vesicula' : 'normal_tonico',
      cervixStatus: 'cerrado_normal',
    };
    setBatchItems((prev) => [newItem, ...prev]);
    setNewRowTag('');
    setNewRowNotes('');
  };

  // Handler: Remove Row
  const handleRemoveRow = (index: number) => {
    setBatchItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handler: File Upload (Excel / CSV)
  const handleFileUpload = async (file: File) => {
    setImportError(null);
    setImportSuccessMsg(null);
    try {
      const records = await parsePalpationExcelOrCsvFile(file);
      if (records.length === 0) {
        setImportError('No se encontraron registros de palpación válidos en el archivo.');
        return;
      }
      setBatchItems(records);
      setImportSuccessMsg(`✅ Se importaron exitosamente ${records.length} hembras diagnosticadas desde "${file.name}".`);
      setBatchSubMode('table');
    } catch (err: any) {
      setImportError(err.message || 'Error al procesar el archivo Excel.');
    }
  };

  // Handler: Paste Text
  const handleProcessPastedText = () => {
    setImportError(null);
    setImportSuccessMsg(null);
    if (!pastedText.trim()) {
      setImportError('Por favor pega texto o filas de Excel antes de procesar.');
      return;
    }
    try {
      const records = parsePalpationPastedText(pastedText);
      if (records.length === 0) {
        setImportError('No se pudieron reconocer datos válidos en el texto pegado.');
        return;
      }
      setBatchItems(records);
      setImportSuccessMsg(`✅ Se procesaron exitosamente ${records.length} registros desde el portapapeles.`);
      setPastedText('');
      setBatchSubMode('table');
    } catch (err: any) {
      setImportError(err.message || 'Error al interpretar el texto.');
    }
  };

  // Handler: Share Summary on WhatsApp
  const handleShareWhatsApp = () => {
    const selectedLot = lots.find((l) => l.id === selectedLotId);
    const lotName = selectedLot?.name || 'Lote General';
    const text = `📋 *REPORTE DE PALPACIÓN & DIAGNÓSTICO GINECOLÓGICO*
📅 *Fecha:* ${date}
🏡 *Lote:* ${lotName}
👨‍⚕️ *MVZ:* ${veterinarian}
----------------------------------------
🐮 *Total Evaluadas:* ${batchStats.total}
🟢 *Preñadas (Gestantes):* ${batchStats.prenadas} (${batchStats.prenadasPct}%)
🟡 *Vacías:* ${batchStats.vacias}
⚪ *Dudosas:* ${batchStats.dudosas}
⏱️ *Promedio Gestación:* ${batchStats.avgGestation} días
----------------------------------------
_Generado por GanaderIA PRO Software Ganadero_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Handler: Save and Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLot = lots.find((l) => l.id === selectedLotId);
    const cost = parseFloat(costPerHead) || 0;

    if (activeTab === 'individual') {
      if (!indTag.trim()) {
        alert('Por favor ingrese el arete / chapa de la hembra.');
        return;
      }
      const days = indResult === 'preñada' || indResult === 'dudosa' ? parseInt(indGestationDays, 10) || 0 : undefined;
      const fpp = days ? calculateFPP(date, days) : undefined;

      const payload: PalpationSavedPayload = {
        mode: 'individual',
        date,
        veterinarian,
        vetLicense,
        costPerHead: cost,
        lotId: selectedLotId,
        lotName: selectedLot?.name || 'Lote Individual',
        records: [
          {
            tag: indTag.trim(),
            result: indResult,
            gestationDays: days,
            fppDate: fpp,
            leftOvary: indLeftOvary,
            rightOvary: indRightOvary,
            uterineTone: indUterineTone,
            cervix: indCervix,
            sireOrStraw: indSireOrStraw,
            protocol: indProtocol,
            notes: indNotes,
          },
        ],
      };

      onSavePalpation(payload);
      triggerConfetti();
      onClose();
    } else {
      if (batchItems.length === 0) {
        alert('Por favor ingrese o importe al menos una hembra en la lista de palpación.');
        return;
      }

      const records = batchItems.map((item) => {
        const days = item.gestationDays ? parseInt(item.gestationDays, 10) : undefined;
        const fpp = days ? calculateFPP(date, days) : undefined;
        return {
          tag: item.tag,
          result: item.result,
          gestationDays: days,
          fppDate: fpp,
          leftOvary: item.leftOvaryStatus,
          rightOvary: item.rightOvaryStatus,
          uterineTone: item.uterineStatus,
          cervix: item.cervixStatus,
          sireOrStraw: item.sireOrStraw,
          protocol: item.protocol,
          notes: item.notes,
        };
      });

      const payload: PalpationSavedPayload = {
        mode: 'batch',
        date,
        veterinarian,
        vetLicense,
        costPerHead: cost,
        lotId: selectedLotId,
        lotName: selectedLot?.name || 'Jornada de Palpación',
        records,
      };

      onSavePalpation(payload);
      triggerConfetti();
      onClose();
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const filteredBatchItems = batchItems.filter((item) => {
    if (tableFilter === 'all') return true;
    if (tableFilter === 'preñada') return item.result === 'preñada';
    if (tableFilter === 'vacia') return item.result.startsWith('vacia');
    if (tableFilter === 'dudosa') return item.result === 'dudosa';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-[#012d1d] text-white border-b border-[#1b4332] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#083d28] border border-[#2d6a4f] flex items-center justify-center text-pink-300 shadow-inner">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-white tracking-wide">
                  Módulo de Registro de Palpación & Diagnóstico Ginecológico
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  Reproducción PRO
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Chequeo ginecológico, confirmación de preñez (DG), tono ovárico/uterino e importación en manga
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP TAB CONTROLS (INDIVIDUAL VS BATCH) */}
        <div className="px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl border border-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'batch'
                  ? 'bg-[#012d1d] text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Jornada en Manga / Masivo ({batchItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('individual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'individual'
                  ? 'bg-pink-700 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Chequeo Individual (1 a 1)</span>
            </button>
          </div>

          {/* Quick Header Metadata Bar */}
          <div className="flex items-center gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-pink-600" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-hidden cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-hidden max-w-[150px] truncate cursor-pointer"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id} className="bg-white text-slate-900">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-slate-50/60">
          
          {/* =========================================================================
              TAB 1: JORNADA EN MANGA & IMPORTACIÓN EXCEL
              ========================================================================= */}
          {activeTab === 'batch' && (
            <div className="space-y-6">
              {/* LIVE KPI METRICS BANNER */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-black block">Total Evaluadas</span>
                  <span className="text-2xl font-black text-slate-900">{batchStats.total}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block">Hembras en manga</span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl shadow-2xs">
                  <span className="text-[10px] text-emerald-800 uppercase font-black block">Preñadas (Gestantes)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-emerald-800">{batchStats.prenadas}</span>
                    <span className="text-xs font-bold text-emerald-700">({batchStats.prenadasPct}%)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block">Tasa de concepción</span>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl shadow-2xs">
                  <span className="text-[10px] text-amber-900 uppercase font-black block">Vacías Totales</span>
                  <span className="text-2xl font-black text-amber-800">{batchStats.vacias}</span>
                  <span className="text-[10px] text-amber-700 font-bold block">Aptas sincronización</span>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-2xl shadow-2xs">
                  <span className="text-[10px] text-blue-900 uppercase font-black block">Dudosas / Rechequeo</span>
                  <span className="text-2xl font-black text-blue-800">{batchStats.dudosas}</span>
                  <span className="text-[10px] text-blue-700 font-bold block">Repetir en 30d</span>
                </div>

                <div className="bg-pink-50/70 border border-pink-200 p-3.5 rounded-2xl shadow-2xs">
                  <span className="text-[10px] text-pink-900 uppercase font-black block">Días Gestación Prom.</span>
                  <span className="text-2xl font-black text-pink-800">{batchStats.avgGestation} d</span>
                  <span className="text-[10px] text-pink-700 font-bold block">Edad gestacional</span>
                </div>

                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-black block">Acciones Rápidas</span>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={downloadPalpationExcelTemplate}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 p-1.5 rounded-xl border border-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Descargar plantilla Excel para diligenciar en campo"
                    >
                      <Download className="w-3 h-3 text-slate-700" />
                      <span>Plantilla</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                      title="Compartir reporte en WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* BATCH SUB-NAVIGATION: TABLE / UPLOAD / PASTE */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setBatchSubMode('table')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      batchSubMode === 'table'
                        ? 'bg-[#012d1d] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Planilla en Manga ({batchItems.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchSubMode('file')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      batchSubMode === 'file'
                        ? 'bg-[#012d1d] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importar Excel / CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchSubMode('paste')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      batchSubMode === 'paste'
                        ? 'bg-[#012d1d] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Pegar desde Portapapeles</span>
                  </button>
                </div>

                {batchSubMode === 'table' && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={tableFilter}
                      onChange={(e: any) => setTableFilter(e.target.value)}
                      className="bg-white border border-slate-300 text-xs text-slate-800 font-bold rounded-xl px-2.5 py-1 focus:outline-hidden cursor-pointer shadow-2xs"
                    >
                      <option value="all">Todas ({batchItems.length})</option>
                      <option value="preñada">Preñadas ({batchStats.prenadas})</option>
                      <option value="vacia">Vacías ({batchStats.vacias})</option>
                      <option value="dudosa">Dudosas ({batchStats.dudosas})</option>
                    </select>
                  </div>
                )}
              </div>

              {/* SUBMODE: FILE UPLOAD */}
              {batchSubMode === 'file' && (
                <div className="p-6 bg-white border border-dashed border-slate-300 rounded-2xl text-center space-y-4 shadow-2xs">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`p-8 rounded-2xl transition-colors cursor-pointer ${
                      isDragging ? 'bg-emerald-50 border border-emerald-500' : 'bg-slate-50 hover:bg-emerald-50/50 border border-slate-200'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-emerald-700 mx-auto mb-3 animate-bounce" />
                    <h3 className="font-black text-base text-slate-900">Arrastra y suelta tu archivo Excel / CSV aquí</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Compatible con columnas automáticas: Arete, Diagnóstico, Días de Preñez, Ovario Izq, Ovario Der, Útero
                    </p>
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Seleccionar Archivo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-600">
                    <FileSpreadsheet className="w-4 h-4 text-pink-600" />
                    <span>¿No tienes la plantilla?</span>
                    <button
                      type="button"
                      onClick={downloadPalpationExcelTemplate}
                      className="text-pink-700 hover:text-pink-900 font-bold underline cursor-pointer"
                    >
                      Descargar Plantilla_Palpacion_Lote.xlsx
                    </button>
                  </div>
                </div>
              )}

              {/* SUBMODE: PASTE TEXT */}
              {batchSubMode === 'paste' && (
                <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase mb-1">
                      Pega aquí tus datos copiados desde Excel, Google Sheets o WhatsApp
                    </label>
                    <p className="text-xs text-slate-500 mb-2">
                      Formato recomendado tabulado o separado por comas: Arete | Diagnóstico (Preñada/Vacía/Dudosa) | Días Gestación | Observación
                    </p>
                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={`Ejemplo:\n#101\tPreñada\t45\tCL Activo OI\n#102\tVacía\t0\tApta IATF\n#103\tDudosa\t30\tRepetir en 30d`}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPastedText('')}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-bold"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessPastedText}
                      className="px-4 py-2 bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Procesar e Importar Filas</span>
                    </button>
                  </div>
                </div>
              )}

              {/* FEEDBACK ALERTS */}
              {importError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-red-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {/* SUBMODE: MANGA TABLE & LIVE ENTRY */}
              {batchSubMode === 'table' && (
                <div className="space-y-4">
                  {/* QUICK MANGA ROW INPUT */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                        Arete / Chapa
                      </label>
                      <input
                        type="text"
                        value={newRowTag}
                        onChange={(e) => setNewRowTag(e.target.value)}
                        placeholder="Ej. #520"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMangaRow();
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>

                    <div className="w-48">
                      <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                        Diagnóstico
                      </label>
                      <select
                        value={newRowResult}
                        onChange={(e: any) => setNewRowResult(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-hidden cursor-pointer"
                      >
                        <option value="preñada">🟢 Preñada (Gestante)</option>
                        <option value="vacia_sincronizacion">🟡 Vacía - Apta IATF</option>
                        <option value="vacia_monta_natural">🟠 Vacía - Monta Natural</option>
                        <option value="vacia_te">🟣 Vacía - Receptora TE</option>
                        <option value="dudosa">⚪ Dudosa (Rechequeo 30d)</option>
                      </select>
                    </div>

                    {(newRowResult === 'preñada' || newRowResult === 'dudosa') && (
                      <div className="w-24">
                        <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                          Días Preñez
                        </label>
                        <input
                          type="number"
                          value={newRowDays}
                          onChange={(e) => setNewRowDays(e.target.value)}
                          placeholder="45"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold text-center focus:bg-white focus:outline-hidden focus:border-emerald-600"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] font-black text-slate-600 uppercase mb-1">
                        Nota / Hallazgo
                      </label>
                      <input
                        type="text"
                        value={newRowNotes}
                        onChange={(e) => setNewRowNotes(e.target.value)}
                        placeholder="Ej. CL Activo OI, buen tono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMangaRow();
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleAddMangaRow}
                        className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>+ Agregar Vaca</span>
                      </button>
                    </div>
                  </div>

                  {/* INTERACTIVE MANGA TABLE */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                    <div className="max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-slate-100 text-slate-700 border-b border-slate-200 font-black text-[11px] uppercase tracking-wider">
                          <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">Arete / ID</th>
                            <th className="p-3">Diagnóstico Ginecológico</th>
                            <th className="p-3 text-center">Días Gestación</th>
                            <th className="p-3 text-center">FPP Proyectada</th>
                            <th className="p-3">Ovario / Tono Útero</th>
                            <th className="p-3">Observaciones</th>
                            <th className="p-3 text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {filteredBatchItems.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                                No hay hembras en la lista. Agrega una arriba o importa tu archivo Excel.
                              </td>
                            </tr>
                          ) : (
                            filteredBatchItems.map((item, idx) => {
                              const days = item.gestationDays ? parseInt(item.gestationDays, 10) : null;
                              const fpp = days ? calculateFPP(date, days) : '-';

                              return (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                                  <td className="p-3 font-black text-slate-900">{item.tag}</td>
                                  <td className="p-3">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                        item.result === 'preñada'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : item.result.startsWith('vacia')
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                                      }`}
                                    >
                                      {item.result === 'preñada'
                                        ? '🟢 PREÑADA'
                                        : item.result === 'vacia_sincronizacion'
                                        ? '🟡 VACÍA (IATF)'
                                        : item.result === 'vacia_monta_natural'
                                        ? '🟠 VACÍA (Monta)'
                                        : item.result === 'vacia_te'
                                        ? '🟣 VACÍA (TE)'
                                        : '⚪ DUDOSA (30d)'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center font-black font-mono text-pink-700">
                                    {days ? `${days} días` : '-'}
                                  </td>
                                  <td className="p-3 text-center text-slate-600 font-mono text-[11px]">{fpp}</td>
                                  <td className="p-3 text-[11px] text-slate-600">
                                    {item.leftOvaryStatus || item.rightOvaryStatus ? (
                                      <span>
                                        OI: {item.leftOvaryStatus || '-'} | OD: {item.rightOvaryStatus || '-'}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-slate-600 truncate max-w-[140px]">
                                    {item.notes || '-'}
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRow(idx)}
                                      className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Eliminar de la lista"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: REGISTRO INDIVIDUAL (1 a 1)
              ========================================================================= */}
          {activeTab === 'individual' && (
            <div className="space-y-6">
              {/* SECTION: ANIMAL IDENTIFICATION */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <HeartPulse className="w-5 h-5 text-pink-600" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    1. Identificación de la Hembra & Resultado Reproductivo
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Arete / Chapa / ID Animal *
                    </label>
                    <input
                      type="text"
                      required
                      value={indTag}
                      onChange={(e) => setIndTag(e.target.value)}
                      placeholder="Ej. #208 / CRIA-45"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:bg-white focus:border-pink-600 focus:outline-hidden"
                    />
                    {females.length > 0 && (
                      <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                        {females.filter((f) => f.tagId.toLowerCase().includes(indTag.toLowerCase())).length > 0 && indTag
                          ? `💡 Coincide con hembra del inventario`
                          : ''}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Diagnóstico Ginecológico *
                    </label>
                    <select
                      value={indResult}
                      onChange={(e: any) => setIndResult(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:bg-white focus:border-pink-600 focus:outline-hidden cursor-pointer"
                    >
                      <option value="preñada">🟢 Preñada (Gestación Confirmada)</option>
                      <option value="vacia_sincronizacion">🟡 Vacía - Apta Sincronización IATF</option>
                      <option value="vacia_monta_natural">🟠 Vacía - Para Monta Natural</option>
                      <option value="vacia_ia">🔵 Vacía - Para Inseminación (IA)</option>
                      <option value="vacia_te">🟣 Vacía - Receptora TE / FIV</option>
                      <option value="dudosa">⚪ Dudosa (Rechequeo a los 30 días)</option>
                    </select>
                  </div>

                  {(indResult === 'preñada' || indResult === 'dudosa') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Días Estimados de Gestación *
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={15}
                          max={290}
                          value={indGestationDays}
                          onChange={(e) => setIndGestationDays(e.target.value)}
                          className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-pink-700 font-bold text-center focus:bg-white focus:border-pink-600 focus:outline-hidden"
                        />
                        <div className="text-xs text-slate-600">
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">FPP Proyectada:</span>
                          <span className="font-mono font-bold text-pink-700">
                            {calculateFPP(date, parseInt(indGestationDays, 10) || 0) || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: OVARIAN & UTERINE EVALUATION */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Activity className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    2. Examen del Tracto Reproductivo (Ovarios & Útero)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ovario Izquierdo (OI)
                    </label>
                    <select
                      value={indLeftOvary}
                      onChange={(e) => setIndLeftOvary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="cl_activo">CL Activo (Cuerpo Lúteo)</option>
                      <option value="foliculo_dominante">Folículo Dominante (≥10mm)</option>
                      <option value="foliculos_pequenos">Folículos Pequeños (&lt;8mm)</option>
                      <option value="anestro_inactivo">Anestro / Ovario Liso</option>
                      <option value="quiste_folicular">Quiste Folicular</option>
                      <option value="quiste_luteico">Quiste Luteínico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ovario Derecho (OD)
                    </label>
                    <select
                      value={indRightOvary}
                      onChange={(e) => setIndRightOvary(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="cl_activo">CL Activo (Cuerpo Lúteo)</option>
                      <option value="foliculo_dominante">Folículo Dominante (≥10mm)</option>
                      <option value="foliculos_pequenos">Folículos Pequeños (&lt;8mm)</option>
                      <option value="anestro_inactivo">Anestro / Ovario Liso</option>
                      <option value="quiste_folicular">Quiste Folicular</option>
                      <option value="quiste_luteico">Quiste Luteínico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Condición / Tono Uterino
                    </label>
                    <select
                      value={indUterineTone}
                      onChange={(e) => setIndUterineTone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="normal_tonico">Normal Tónico (Apto)</option>
                      <option value="gestante_vesicula">Gestante (Vesícula Fetal)</option>
                      <option value="flacido_inerte">Flácido / Inerte</option>
                      <option value="endometritis_piometra">Endometritis / Piometra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cérvix & Mucus
                    </label>
                    <select
                      value={indCervix}
                      onChange={(e) => setIndCervix(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="cerrado_normal">Cerrado Normal</option>
                      <option value="moco_limpido">Moco Cristalino / Fértil</option>
                      <option value="abierto_turbio">Abierto / Turbio (Alerta)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: BREEDING & SERVICE ASSOCIATION */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Baby className="w-5 h-5 text-amber-600" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    3. Asociación de Servicio & Protocolo
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Toro / Pajilla Asignada
                    </label>
                    <input
                      type="text"
                      value={indSireOrStraw}
                      onChange={(e) => setIndSireOrStraw(e.target.value)}
                      placeholder="Ej. Don Juan 450 (Pajilla) o Toro Padrillo"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Protocolo / Sincronización
                    </label>
                    <input
                      type="text"
                      value={indProtocol}
                      onChange={(e) => setIndProtocol(e.target.value)}
                      placeholder="Ej. IATF D0/D8/D10 Benzoato + Prostaglandina"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Observaciones & Plan de Manejo
                    </label>
                    <textarea
                      rows={2}
                      value={indNotes}
                      onChange={(e) => setIndNotes(e.target.value)}
                      placeholder="Observaciones de campo, recomendación de rechequeo o tratamiento hormonal..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: VETERINARIAN & COST INFORMATION (SHARED) */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-5 h-5 text-emerald-700" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Datos del Médico Veterinario (MVZ) & Costo Operativo
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del MVZ / Palpador
                </label>
                <input
                  type="text"
                  value={veterinarian}
                  onChange={(e) => setVeterinarian(e.target.value)}
                  placeholder="Dr. Nombre Apellido"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tarjeta Profesional / Registro ICA
                </label>
                <input
                  type="text"
                  value={vetLicense}
                  onChange={(e) => setVetLicense(e.target.value)}
                  placeholder="TP-12345"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Costo por Cabeza Palpada (COP / $)
                </label>
                <input
                  type="number"
                  value={costPerHead}
                  onChange={(e) => setCostPerHead(e.target.value)}
                  placeholder="15000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs md:text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#012d1d] via-[#083d28] to-[#012d1d] hover:bg-[#0c4e34] text-white font-black text-xs md:text-sm shadow-md flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>
                {activeTab === 'individual'
                  ? 'Guardar Diagnóstico Ginecológico'
                  : `Guardar Jornada de Palpación (${batchItems.length} Hembras)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
