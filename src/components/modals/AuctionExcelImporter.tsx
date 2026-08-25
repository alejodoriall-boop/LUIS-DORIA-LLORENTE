import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ClipboardPaste,
  Edit2,
  Check,
} from 'lucide-react';
import { ImportedAnimalRecord } from '../../types';
import {
  parseExcelOrCsvFile,
  parsePastedTableText,
  generateAuctionSampleData,
  downloadExcelTemplate,
} from '../../utils/excelParser';

interface AuctionExcelImporterProps {
  animals: ImportedAnimalRecord[];
  onAnimalsChange: (animals: ImportedAnimalRecord[]) => void;
  defaultPricePerKg: number;
}

export const LIVESTOCK_SEX_OPTIONS = [
  { code: 'MC', label: 'MC - Macho de Ceba', sex: 'macho' as const, badgeBg: 'bg-amber-100 text-amber-900 border-amber-300' },
  { code: 'ML', label: 'ML - Macho de Levante', sex: 'macho' as const, badgeBg: 'bg-blue-100 text-blue-900 border-blue-300' },
  { code: 'TO', label: 'TO - Toro Reproductor', sex: 'macho' as const, badgeBg: 'bg-purple-100 text-purple-900 border-purple-300' },
  { code: 'HL', label: 'HL - Hembra de Levante', sex: 'hembra' as const, badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { code: 'HV', label: 'HV - Hembra de Vientre', sex: 'hembra' as const, badgeBg: 'bg-rose-100 text-rose-900 border-rose-300' },
  { code: 'VP', label: 'VP - Vaca Parida', sex: 'hembra' as const, badgeBg: 'bg-pink-100 text-pink-900 border-pink-300' },
  { code: 'VE', label: 'VE - Vaca Escotera (Horra)', sex: 'hembra' as const, badgeBg: 'bg-stone-100 text-stone-900 border-stone-300' },
];

export const AuctionExcelImporter: React.FC<AuctionExcelImporterProps> = ({
  animals,
  onAnimalsChange,
  defaultPricePerKg,
}) => {
  const [importMode, setImportMode] = useState<'file' | 'paste' | 'manual'>('file');
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ImportedAnimalRecord>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual single row adding with all 9 fields
  const [manualTag, setManualTag] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const [manualBreed, setManualBreed] = useState('Brahman Blanco');
  const [manualSexCode, setManualSexCode] = useState<string>('MC');
  const [manualColor, setManualColor] = useState('Blanco / Gris');
  const [manualCategory, setManualCategory] = useState('Ceba');
  const [manualBrandingIron, setManualBrandingIron] = useState('');
  const [manualPricePerKg, setManualPricePerKg] = useState(String(defaultPricePerKg || 8750));
  const [manualMovementGuide, setManualMovementGuide] = useState('');

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const parsedAnimals = await parseExcelOrCsvFile(file);
      if (parsedAnimals.length === 0) {
        throw new Error('No se encontraron registros de animales válidos en el archivo.');
      }
      onAnimalsChange(parsedAnimals);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al procesar el archivo Excel / CSV. Verifique el formato.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    try {
      const parsed = parsePastedTableText(pastedText);
      if (parsed.length === 0) {
        setErrorMsg('No se detectaron filas tabulares válidas. Copie las celdas desde Excel o Google Sheets.');
        return;
      }
      onAnimalsChange(parsed);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg('Error al interpretar el texto pegado: ' + err.message);
    }
  };

  const handleLoadSample = (sampleKey: 'subastar_ceba' | 'subacasanare_cria' | 'feria_leche') => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      const sample = generateAuctionSampleData(sampleKey);
      onAnimalsChange(sample);
      setIsLoading(false);
    }, 150);
  };

  const handleAddManualAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(manualWeight);
    if (!manualTag.trim() || isNaN(weight) || weight <= 0) return;

    const price = parseFloat(manualPricePerKg) || defaultPricePerKg || 8750;
    const selectedSexConfig = LIVESTOCK_SEX_OPTIONS.find((s) => s.code === manualSexCode) || LIVESTOCK_SEX_OPTIONS[0];

    const newAnimal: ImportedAnimalRecord = {
      id: `anim-man-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tag: manualTag.startsWith('#') ? manualTag : `#${manualTag}`,
      weightKg: weight,
      sex: selectedSexConfig.sex,
      sexCode: selectedSexConfig.code,
      breed: manualBreed.trim() || 'Brahman Comercial',
      category: manualCategory.trim() || 'Ceba',
      color: manualColor.trim() || 'Blanco / Gris',
      brandingIronName: manualBrandingIron.trim() || undefined,
      pricePerKg: price,
      totalPrice: Math.round(weight * price),
      movementGuideNumber: manualMovementGuide.trim() || undefined,
      lotCode: 'MANUAL',
      ageMonths: weight < 220 ? 8 : weight < 340 ? 18 : 26,
      notes: 'Ingreso manual individual de compra',
    };

    onAnimalsChange([...animals, newAnimal]);
    setManualTag('');
    setManualWeight('');
  };

  const handleRemoveAnimal = (id: string) => {
    onAnimalsChange(animals.filter((a) => a.id !== id));
  };

  const handleStartEdit = (animal: ImportedAnimalRecord) => {
    setEditingAnimalId(animal.id);
    setEditFormData({
      tag: animal.tag,
      weightKg: animal.weightKg,
      breed: animal.breed,
      sex: animal.sex,
      sexCode: animal.sexCode || (animal.sex === 'hembra' ? 'HV' : 'MC'),
      color: animal.color || 'Blanco / Gris',
      category: animal.category || 'Ceba',
      brandingIronName: animal.brandingIronName || '',
      pricePerKg: animal.pricePerKg || defaultPricePerKg,
      movementGuideNumber: animal.movementGuideNumber || '',
    });
  };

  const handleSaveEdit = (id: string) => {
    onAnimalsChange(
      animals.map((a) => {
        if (a.id === id) {
          const updatedWeight = Number(editFormData.weightKg) || a.weightKg;
          const updatedPrice = Number(editFormData.pricePerKg) || a.pricePerKg || defaultPricePerKg;
          const updatedSexCode = editFormData.sexCode || a.sexCode || 'MC';
          const matchedSexConfig = LIVESTOCK_SEX_OPTIONS.find((s) => s.code === updatedSexCode);
          const updatedSex = matchedSexConfig ? matchedSexConfig.sex : (editFormData.sex as 'macho' | 'hembra') || a.sex;

          return {
            ...a,
            tag: editFormData.tag || a.tag,
            weightKg: updatedWeight,
            breed: editFormData.breed || a.breed,
            sex: updatedSex,
            sexCode: updatedSexCode,
            color: editFormData.color || a.color,
            category: editFormData.category || a.category,
            brandingIronName: editFormData.brandingIronName || a.brandingIronName,
            movementGuideNumber: editFormData.movementGuideNumber || a.movementGuideNumber,
            pricePerKg: updatedPrice,
            totalPrice: Math.round(updatedWeight * updatedPrice),
          };
        }
        return a;
      }),
    );
    setEditingAnimalId(null);
  };

  // Calculations
  const totalHeads = animals.length;
  const totalWeight = animals.reduce((acc, curr) => acc + curr.weightKg, 0);
  const avgWeight = totalHeads > 0 ? (totalWeight / totalHeads).toFixed(1) : '0';
  const totalCost = animals.reduce((acc, curr) => acc + (curr.totalPrice || curr.weightKg * defaultPricePerKg), 0);

  return (
    <div className="space-y-4">
      {/* Import Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6e8e6] pb-3">
        <div className="flex items-center gap-1.5 bg-[#f0f2f0] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setImportMode('file')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              importMode === 'file'
                ? 'bg-[#0D1A13] text-white shadow-xs'
                : 'text-[#414844] hover:text-black'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Cargar Excel / CSV
          </button>
          <button
            type="button"
            onClick={() => setImportMode('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              importMode === 'paste'
                ? 'bg-[#0D1A13] text-white shadow-xs'
                : 'text-[#414844] hover:text-black'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            Pegar Tabla
          </button>
          <button
            type="button"
            onClick={() => setImportMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              importMode === 'manual'
                ? 'bg-[#0D1A13] text-white shadow-xs'
                : 'text-[#414844] hover:text-black'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Ingreso Individual (Uno a Uno)
          </button>
        </div>

        <button
          type="button"
          onClick={downloadExcelTemplate}
          className="text-[11px] text-white hover:text-[#1b4332] font-semibold bg-[#e6f4ea] hover:bg-[#c1ecd4] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-[#a3e0be]"
          title="Descargar formato Excel oficial con 9 columnas"
        >
          <Download className="w-3.5 h-3.5 text-[#2d6a4f]" />
          Descargar Plantilla Excel Oficial (9 Columnas)
        </button>
      </div>

      {/* Mode 1: File Upload / Drag & Drop */}
      {importMode === 'file' && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#012d1d] bg-[#c1ecd4]/20'
                : 'border-white/10 hover:border-[#012d1d] bg-[#fbfbfb] hover:bg-[#f3f6f4]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#c1ecd4] text-white flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Haga clic o arrastre el archivo de Subasta / Compra aquí
                </p>
                <p className="text-[11px] text-[#717973] mt-0.5">
                  Columnas admitidas: Identificación/Número, Peso, Raza, Sexo (TO, VE, HV, HL, ML, MC, VP), Color, Tipo/Categoría, Hierro/Marca, Precio, Guía de Movilización.
                </p>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Samples from Colombian Auctions */}
          <div className="bg-[#f5f8f6] border border-[#d6e2db] rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#dc9a00]" />
              <span>Cargar Lote de Ejemplo (Prueba Rápida en 1 Clic):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('subastar_ceba')}
                className="text-left px-2.5 py-2 bg-[#15241C] hover:bg-[#e6f4ea] border border-white/10 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between shadow-xs"
              >
                <div>
                  <p className="font-bold text-white">Subastar S.A. (MC)</p>
                  <p className="text-[10px] text-[#717973]">25 Novillos Machos Ceba</p>
                </div>
                <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded">
                  25 Cab. (MC)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('subacasanare_cria')}
                className="text-left px-2.5 py-2 bg-[#15241C] hover:bg-[#e6f4ea] border border-white/10 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between shadow-xs"
              >
                <div>
                  <p className="font-bold text-white">Subacasanare (ML/HL)</p>
                  <p className="text-[10px] text-[#717973]">18 Terneros Levante</p>
                </div>
                <span className="text-[9px] bg-blue-100 text-blue-900 border border-blue-300 font-bold px-1.5 py-0.5 rounded">
                  18 Cab. (ML/HL)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('feria_leche')}
                className="text-left px-2.5 py-2 bg-[#15241C] hover:bg-[#e6f4ea] border border-white/10 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between shadow-xs"
              >
                <div>
                  <p className="font-bold text-white">Feria Lechera (VP/HV)</p>
                  <p className="text-[10px] text-[#717973]">10 Vientres Girolando</p>
                </div>
                <span className="text-[9px] bg-pink-100 text-pink-900 border border-pink-300 font-bold px-1.5 py-0.5 rounded">
                  10 Cab. (VP/HV)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Paste from clipboard */}
      {importMode === 'paste' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-[#414844]">
            Pegue las celdas copiadas desde Excel o Google Sheets con las 9 columnas (separadas por tabulaciones):
          </label>
          <textarea
            rows={4}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={'Identificacion\tPeso\tRaza\tSexo\tColor\tTipo\tHierro\tPrecio\tGuia\n#8901\t380\tBrahman Blanco\tMC\tBlanco / Gris\tCeba\tHierro San Juan\t8800\tICA-GSMI-123456\n#8902\t365\tNelore\tMC\tBlanco / Gris\tCeba\tHierro San Juan\t8800\tICA-GSMI-123456'}
            className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-[#012d1d] focus:outline-hidden"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim()}
              className="px-4 py-2 bg-[#0D1A13] hover:bg-[#123F2A] text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Procesar y Cargar Registros
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Manual single animal entry with all 9 fields */}
      {importMode === 'manual' && (
        <form onSubmit={handleAddManualAnimal} className="bg-[#fbfbfb] border border-[#d6e2db] rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-700" />
              Registro Individual de Compra (Animal por Animal *):
            </p>
            <span className="text-[10px] bg-[#e6f4ea] text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Datos Estandarizados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {/* 1. Identificación o Número */}
            <div>
              <label className="block text-[10px] font-bold text-[#414844] uppercase mb-0.5">
                1. Identificación / N° <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualTag}
                onChange={(e) => setManualTag(e.target.value)}
                placeholder="#8950 o 4092"
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            {/* 2. Peso (kg) */}
            <div>
              <label className="block text-[10px] font-bold text-[#414844] uppercase mb-0.5">
                2. Peso (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={manualWeight}
                onChange={(e) => setManualWeight(e.target.value)}
                placeholder="365.0"
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            {/* 3. Raza / Cruce */}
            <div>
              <label className="block text-[10px] font-bold text-[#414844] uppercase mb-0.5">
                3. Raza / Cruce <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualBreed}
                onChange={(e) => setManualBreed(e.target.value)}
                placeholder="Brahman Blanco / Nelore"
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                required
              />
            </div>

            {/* 4. Sexo (TO, VE, HV, HL, ML, MC, VP) */}
            <div>
              <label className="block text-[10px] font-bold text-[#414844] uppercase mb-0.5">
                4. Sexo / Código <span className="text-red-500">*</span>
              </label>
              <select
                value={manualSexCode}
                onChange={(e) => setManualSexCode(e.target.value)}
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold text-white"
              >
                {LIVESTOCK_SEX_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Color / Pelaje */}
            <div>
              <label className="block text-[10px] font-bold text-[#414844] uppercase mb-0.5">5. Color / Pelaje</label>
              <input
                type="text"
                value={manualColor}
                onChange={(e) => setManualColor(e.target.value)}
                placeholder="Blanco / Gris / Sardo"
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs"
              />
            </div>

            {/* 6. Tipo / Categoría */}
            <div>
              <label className="block text-[10px] font-bold text-[#414844] uppercase mb-0.5">6. Tipo / Categoría</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium"
              >
                <option value="Ceba">Ceba Intensiva / Engorde</option>
                <option value="Cría">Cría / Vientres</option>
                <option value="Levante">Levante / Desarrollo</option>
                <option value="Doble Propósito">Doble Propósito / Leche</option>
                <option value="Genética">Genética / Puro de Registro</option>
              </select>
            </div>

            {/* 7. Hierro / Marca */}
            <div>
              <label className="block text-[10px] font-bold text-[#414844] uppercase mb-0.5">7. Hierro / Marca</label>
              <input
                type="text"
                value={manualBrandingIron}
                onChange={(e) => setManualBrandingIron(e.target.value)}
                placeholder="Hierro San Juan / SB"
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs"
              />
            </div>

            {/* 8. Precio / Kg */}
            <div>
              <label className="block text-[10px] font-bold text-[#414844] uppercase mb-0.5">8. Precio / Kg ($ COP)</label>
              <input
                type="number"
                value={manualPricePerKg}
                onChange={(e) => setManualPricePerKg(e.target.value)}
                placeholder="8750"
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono"
              />
            </div>

            {/* 9. Guía de Movilización */}
            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-[10px] font-bold text-[#414844] uppercase mb-0.5">
                9. Guía de Movilización Sanitaria (ICA / GSMI)
              </label>
              <input
                type="text"
                value={manualMovementGuide}
                onChange={(e) => setManualMovementGuide(e.target.value)}
                placeholder="ICA-GSMI-2026-981245 o N° Certificado Zoosanitario"
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#e6e8e6]">
            <p className="text-[11px] text-[#717973]">
              El animal ingresará directamente a la tabla del lote con cálculo automático de costo total.
            </p>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0D1A13] hover:bg-[#123F2A] text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Guardar Animal al Registro
            </button>
          </div>
        </form>
      )}

      {/* Error Display */}
      {errorMsg && (
        <div className="bg-[#ffdad6] text-[#410002] border border-[#ffb4ab] rounded-xl p-3 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ba1a1a]" />
          <div>
            <p className="font-bold">Error al procesar archivo</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Summary Metrics Bar */}
      {animals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#123F2A]/60 border border-[#c1ecd4] rounded-xl p-2.5">
          <div className="bg-[#15241C] p-2 rounded-lg border border-[#d6e2db] text-center">
            <p className="text-[10px] text-[#717973] font-bold uppercase">Total Cabezas</p>
            <p className="text-base font-extrabold text-white">{totalHeads}</p>
          </div>
          <div className="bg-[#15241C] p-2 rounded-lg border border-[#d6e2db] text-center">
            <p className="text-[10px] text-[#717973] font-bold uppercase">Peso Total</p>
            <p className="text-base font-extrabold text-white font-mono">
              {totalWeight.toLocaleString('es-CO')} <span className="text-xs font-normal">kg</span>
            </p>
          </div>
          <div className="bg-[#15241C] p-2 rounded-lg border border-[#d6e2db] text-center">
            <p className="text-[10px] text-[#717973] font-bold uppercase">Peso Promedio</p>
            <p className="text-base font-extrabold text-emerald-800 font-mono">
              {avgWeight} <span className="text-xs font-normal">kg</span>
            </p>
          </div>
          <div className="bg-[#15241C] p-2 rounded-lg border border-[#d6e2db] text-center">
            <p className="text-[10px] text-[#717973] font-bold uppercase">Inversión Compra</p>
            <p className="text-base font-extrabold text-[#79564b] font-mono">
              ${(totalCost / 1000000).toFixed(2)}M <span className="text-[10px] font-normal">COP</span>
            </p>
          </div>
        </div>
      )}

      {/* Animals Preview Data Table with 9 Columns */}
      {animals.length > 0 ? (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-[#15241C] shadow-xs">
          <div className="max-h-72 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[980px]">
              <thead className="bg-[#f3f4f3] sticky top-0 z-10 text-[10px] text-[#414844] font-extrabold uppercase border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">1. Identificación / N°</th>
                  <th className="py-2.5 px-3">2. Peso (kg)</th>
                  <th className="py-2.5 px-3">3. Raza / Cruce</th>
                  <th className="py-2.5 px-3">4. Sexo (Código)</th>
                  <th className="py-2.5 px-3">5. Color</th>
                  <th className="py-2.5 px-3">6. Tipo / Categoría</th>
                  <th className="py-2.5 px-3">7. Hierro / Marca</th>
                  <th className="py-2.5 px-3">8. Precio / Total</th>
                  <th className="py-2.5 px-3">9. Guía ICA</th>
                  <th className="py-2.5 px-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee] text-[11px]">
                {animals.map((anim, idx) => {
                  const isEditing = editingAnimalId === anim.id;
                  const sexCode = anim.sexCode || (anim.sex === 'hembra' ? 'HV' : 'MC');
                  const sexOption = LIVESTOCK_SEX_OPTIONS.find((s) => s.code === sexCode);

                  return (
                    <tr key={anim.id} className="hover:bg-[#f9fbf9] transition-colors">
                      <td className="py-2 px-3 text-[#717973] font-mono">{idx + 1}</td>
                      
                      {/* 1. Tag / ID */}
                      <td className="py-2 px-3 font-bold font-mono text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.tag || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, tag: e.target.value })}
                            className="w-24 px-1.5 py-0.5 border border-white/10 rounded font-mono text-xs"
                          />
                        ) : (
                          anim.tag
                        )}
                      </td>

                      {/* 2. Weight */}
                      <td className="py-2 px-3 font-bold font-mono text-emerald-900">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editFormData.weightKg || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, weightKg: parseFloat(e.target.value) })}
                            className="w-16 px-1.5 py-0.5 border border-white/10 rounded font-mono text-xs"
                          />
                        ) : (
                          `${anim.weightKg} kg`
                        )}
                      </td>

                      {/* 3. Breed */}
                      <td className="py-2 px-3 text-[#414844] max-w-[130px] truncate">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.breed || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                            className="w-28 px-1.5 py-0.5 border border-white/10 rounded text-xs"
                          />
                        ) : (
                          anim.breed
                        )}
                      </td>

                      {/* 4. Sex with Code */}
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <select
                            value={editFormData.sexCode || 'MC'}
                            onChange={(e) => {
                              const selectedCode = e.target.value;
                              const matched = LIVESTOCK_SEX_OPTIONS.find((s) => s.code === selectedCode);
                              setEditFormData({
                                ...editFormData,
                                sexCode: selectedCode,
                                sex: matched ? matched.sex : 'macho',
                              });
                            }}
                            className="px-1 py-0.5 border border-white/10 rounded text-xs font-bold"
                          >
                            {LIVESTOCK_SEX_OPTIONS.map((opt) => (
                              <option key={opt.code} value={opt.code}>
                                {opt.code} ({opt.sex})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-extrabold ${
                              sexOption ? sexOption.badgeBg : 'bg-[#1F3327] text-white border-white/15'
                            }`}
                            title={sexOption ? sexOption.label : anim.sex}
                          >
                            {sexCode}
                          </span>
                        )}
                      </td>

                      {/* 5. Color */}
                      <td className="py-2 px-3 text-[#414844]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.color || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                            className="w-24 px-1.5 py-0.5 border border-white/10 rounded text-xs"
                          />
                        ) : (
                          anim.color || 'Blanco / Gris'
                        )}
                      </td>

                      {/* 6. Tipo / Categoría */}
                      <td className="py-2 px-3 text-[#414844]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.category || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                            className="w-20 px-1.5 py-0.5 border border-white/10 rounded text-xs"
                          />
                        ) : (
                          <span className="capitalize">{anim.category || 'Ceba'}</span>
                        )}
                      </td>

                      {/* 7. Hierro / Marca */}
                      <td className="py-2 px-3 text-[#414844] max-w-[120px] truncate">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.brandingIronName || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, brandingIronName: e.target.value })}
                            className="w-24 px-1.5 py-0.5 border border-white/10 rounded text-xs"
                          />
                        ) : (
                          anim.brandingIronName || <span className="text-[#a0a8a2] italic">Sin marca</span>
                        )}
                      </td>

                      {/* 8. Price / Total */}
                      <td className="py-2 px-3 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFormData.pricePerKg || defaultPricePerKg}
                            onChange={(e) => setEditFormData({ ...editFormData, pricePerKg: parseFloat(e.target.value) })}
                            className="w-20 px-1.5 py-0.5 border border-white/10 rounded font-mono text-xs"
                          />
                        ) : (
                          <div>
                            <span className="font-bold text-white">
                              ${((anim.totalPrice || anim.weightKg * (anim.pricePerKg || defaultPricePerKg)) / 1000).toFixed(0)}k
                            </span>
                            <span className="text-[10px] text-[#717973] block">
                              ${(anim.pricePerKg || defaultPricePerKg).toLocaleString('es-CO')}/kg
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 9. Guía de Movilización */}
                      <td className="py-2 px-3 font-mono text-[#414844] text-[10px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.movementGuideNumber || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, movementGuideNumber: e.target.value })}
                            className="w-28 px-1.5 py-0.5 border border-white/10 rounded font-mono text-xs"
                          />
                        ) : (
                          anim.movementGuideNumber || <span className="text-[#a0a8a2] italic">Sin guía</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-2 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(anim.id)}
                              className="p-1 text-emerald-700 hover:bg-emerald-950/30 rounded"
                              title="Guardar"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(anim)}
                              className="p-1 text-[#717973] hover:text-white rounded"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveAnimal(anim.id)}
                            className="p-1 text-[#ba1a1a] hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-[#f9f9f9] px-3 py-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#717973]">
            <span>{animals.length} animales registrados en este lote</span>
            <button
              type="button"
              onClick={() => onAnimalsChange([])}
              className="text-[#ba1a1a] hover:underline font-semibold"
            >
              Limpiar todos los registros
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#f9f9f9] border border-dashed border-white/10 rounded-xl text-center text-xs text-[#717973]">
          Aún no se han cargado animales para este lote. Cargue un archivo Excel/CSV, pegue una tabla, agregue uno a uno o use los botones de ejemplo arriba.
        </div>
      )}
    </div>
  );
};
