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

  // Manual single row adding
  const [manualTag, setManualTag] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const [manualBreed, setManualBreed] = useState('Brahman Blanco');
  const [manualSex, setManualSex] = useState<'macho' | 'hembra'>('macho');

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

    const newAnimal: ImportedAnimalRecord = {
      id: `anim-man-${Date.now()}`,
      tag: manualTag.startsWith('#') ? manualTag : `#${manualTag}`,
      weightKg: weight,
      sex: manualSex,
      breed: manualBreed,
      pricePerKg: defaultPricePerKg,
      totalPrice: Math.round(weight * defaultPricePerKg),
      lotCode: 'MANUAL',
      ageMonths: weight < 220 ? 8 : 22,
      color: 'Comercial',
      notes: 'Ingreso manual individual',
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
      pricePerKg: animal.pricePerKg,
    });
  };

  const handleSaveEdit = (id: string) => {
    onAnimalsChange(
      animals.map((a) => {
        if (a.id === id) {
          const updatedWeight = Number(editFormData.weightKg) || a.weightKg;
          const updatedPrice = Number(editFormData.pricePerKg) || a.pricePerKg || defaultPricePerKg;
          return {
            ...a,
            tag: editFormData.tag || a.tag,
            weightKg: updatedWeight,
            breed: editFormData.breed || a.breed,
            sex: (editFormData.sex as 'macho' | 'hembra') || a.sex,
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
                ? 'bg-[#012d1d] text-white shadow-xs'
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
                ? 'bg-[#012d1d] text-white shadow-xs'
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
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'text-[#414844] hover:text-black'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Uno a Uno
          </button>
        </div>

        <button
          type="button"
          onClick={downloadExcelTemplate}
          className="text-[11px] text-[#012d1d] hover:text-[#1b4332] font-semibold bg-[#e6f4ea] hover:bg-[#c1ecd4] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          title="Descargar formato Excel compatible"
        >
          <Download className="w-3.5 h-3.5 text-[#2d6a4f]" />
          Plantilla Excel
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
                : 'border-[#c1c8c2] hover:border-[#012d1d] bg-[#fbfbfb] hover:bg-[#f3f6f4]'
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
              <div className="w-10 h-10 rounded-full bg-[#c1ecd4] text-[#012d1d] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#012d1d]">
                  Haga clic o arrastre el archivo de Subasta / Factura aquí
                </p>
                <p className="text-[11px] text-[#717973]">
                  Formatos soportados: Excel (.xlsx, .xls) o CSV (.csv) con columnas de Arete, Peso, Sexo, Raza
                </p>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Samples from Colombian Auctions */}
          <div className="bg-[#f5f8f6] border border-[#d6e2db] rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#012d1d] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#dc9a00]" />
              <span>Cargar Lote de Ejemplo (Prueba Rápida en 1 Clic):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('subastar_ceba')}
                className="text-left px-2.5 py-2 bg-white hover:bg-[#e6f4ea] border border-[#c1c8c2] rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-[#012d1d]">Subastar S.A.</p>
                  <p className="text-[10px] text-[#717973]">25 Novillos Ceba Cebú</p>
                </div>
                <span className="text-[9px] bg-[#c1ecd4] text-[#012d1d] font-bold px-1.5 py-0.5 rounded">
                  25 Cab.
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('subacasanare_cria')}
                className="text-left px-2.5 py-2 bg-white hover:bg-[#e6f4ea] border border-[#c1c8c2] rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-[#012d1d]">Subacasanare</p>
                  <p className="text-[10px] text-[#717973]">18 Terneros Cría/Levante</p>
                </div>
                <span className="text-[9px] bg-[#c1ecd4] text-[#012d1d] font-bold px-1.5 py-0.5 rounded">
                  18 Cab.
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('feria_leche')}
                className="text-left px-2.5 py-2 bg-white hover:bg-[#e6f4ea] border border-[#c1c8c2] rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-[#012d1d]">Feria Lechera</p>
                  <p className="text-[10px] text-[#717973]">10 Novillas Girolando</p>
                </div>
                <span className="text-[9px] bg-[#c1ecd4] text-[#012d1d] font-bold px-1.5 py-0.5 rounded">
                  10 Cab.
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
            Pegue las celdas copiadas desde Excel o Google Sheets (separadas por tabulaciones):
          </label>
          <textarea
            rows={4}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={'Arete\tPeso\tSexo\tRaza\tPrecio\n#8901\t380\tMacho\tBrahman\t8800\n#8902\t365\tMacho\tNelore\t8800'}
            className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-[#012d1d] focus:outline-hidden"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim()}
              className="px-4 py-2 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Procesar y Cargar Tabla
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Manual single animal entry */}
      {importMode === 'manual' && (
        <form onSubmit={handleAddManualAnimal} className="bg-[#fbfbfb] border border-[#d6e2db] rounded-xl p-3 space-y-3">
          <p className="text-xs font-bold text-[#012d1d]">Ingreso Individual de Animal al Lote:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#717973] uppercase mb-0.5">Arete / Chapeta</label>
              <input
                type="text"
                value={manualTag}
                onChange={(e) => setManualTag(e.target.value)}
                placeholder="#8950"
                className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1.5 text-xs font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#717973] uppercase mb-0.5">Peso (kg)</label>
              <input
                type="number"
                step="0.5"
                value={manualWeight}
                onChange={(e) => setManualWeight(e.target.value)}
                placeholder="360"
                className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1.5 text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#717973] uppercase mb-0.5">Sexo</label>
              <select
                value={manualSex}
                onChange={(e) => setManualSex(e.target.value as 'macho' | 'hembra')}
                className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1.5 text-xs font-semibold"
              >
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#717973] uppercase mb-0.5">Raza / Cruce</label>
              <input
                type="text"
                value={manualBreed}
                onChange={(e) => setManualBreed(e.target.value)}
                className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-bold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar a la Lista
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f0f4f1] border border-[#c1ecd4] rounded-xl p-2.5">
          <div className="bg-white p-2 rounded-lg border border-[#d6e2db] text-center">
            <p className="text-[10px] text-[#717973] font-bold uppercase">Total Cabezas</p>
            <p className="text-base font-extrabold text-[#012d1d]">{totalHeads}</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-[#d6e2db] text-center">
            <p className="text-[10px] text-[#717973] font-bold uppercase">Peso Total</p>
            <p className="text-base font-extrabold text-[#012d1d] font-mono">
              {totalWeight.toLocaleString('es-CO')} <span className="text-xs font-normal">kg</span>
            </p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-[#d6e2db] text-center">
            <p className="text-[10px] text-[#717973] font-bold uppercase">Peso Promedio</p>
            <p className="text-base font-extrabold text-emerald-800 font-mono">
              {avgWeight} <span className="text-xs font-normal">kg</span>
            </p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-[#d6e2db] text-center">
            <p className="text-[10px] text-[#717973] font-bold uppercase">Inversión Compra</p>
            <p className="text-base font-extrabold text-[#79564b] font-mono">
              ${(totalCost / 1000000).toFixed(2)}M <span className="text-[10px] font-normal">COP</span>
            </p>
          </div>
        </div>
      )}

      {/* Animals Preview Data Table */}
      {animals.length > 0 ? (
        <div className="border border-[#c1c8c2] rounded-xl overflow-hidden bg-white">
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f3f4f3] sticky top-0 z-10 text-[10px] text-[#414844] font-bold uppercase border-b border-[#c1c8c2]">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Arete / Tag</th>
                  <th className="py-2 px-3">Peso (kg)</th>
                  <th className="py-2 px-3">Sexo</th>
                  <th className="py-2 px-3">Raza / Cruce</th>
                  <th className="py-2 px-3">Precio/Kg</th>
                  <th className="py-2 px-3">Total ($)</th>
                  <th className="py-2 px-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee] text-[11px]">
                {animals.map((anim, idx) => {
                  const isEditing = editingAnimalId === anim.id;
                  return (
                    <tr key={anim.id} className="hover:bg-[#f9fbf9] transition-colors">
                      <td className="py-1.5 px-3 text-[#717973] font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-bold font-mono text-[#012d1d]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.tag || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, tag: e.target.value })}
                            className="w-20 px-1.5 py-0.5 border border-[#c1c8c2] rounded font-mono text-xs"
                          />
                        ) : (
                          anim.tag
                        )}
                      </td>
                      <td className="py-1.5 px-3 font-bold font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editFormData.weightKg || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, weightKg: parseFloat(e.target.value) })}
                            className="w-16 px-1.5 py-0.5 border border-[#c1c8c2] rounded font-mono text-xs"
                          />
                        ) : (
                          `${anim.weightKg} kg`
                        )}
                      </td>
                      <td className="py-1.5 px-3">
                        {isEditing ? (
                          <select
                            value={editFormData.sex || 'macho'}
                            onChange={(e) => setEditFormData({ ...editFormData, sex: e.target.value as any })}
                            className="px-1 py-0.5 border border-[#c1c8c2] rounded text-xs"
                          >
                            <option value="macho">Macho</option>
                            <option value="hembra">Hembra</option>
                          </select>
                        ) : (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              anim.sex === 'macho' ? 'bg-blue-50 text-blue-800' : 'bg-pink-50 text-pink-800'
                            }`}
                          >
                            {anim.sex === 'macho' ? 'M' : 'H'}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-[#414844] truncate max-w-[140px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.breed || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                            className="w-28 px-1.5 py-0.5 border border-[#c1c8c2] rounded text-xs"
                          />
                        ) : (
                          anim.breed
                        )}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-[#717973]">
                        ${(anim.pricePerKg || defaultPricePerKg).toLocaleString('es-CO')}
                      </td>
                      <td className="py-1.5 px-3 font-mono font-bold text-[#012d1d]">
                        ${((anim.totalPrice || anim.weightKg * defaultPricePerKg) / 1000).toFixed(0)}k
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(anim.id)}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                              title="Guardar"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(anim)}
                              className="p-1 text-[#717973] hover:text-[#012d1d] rounded"
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
          <div className="bg-[#f9f9f9] px-3 py-2 border-t border-[#c1c8c2] flex items-center justify-between text-[11px] text-[#717973]">
            <span>{animals.length} registros cargados</span>
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
        <div className="p-4 bg-[#f9f9f9] border border-dashed border-[#c1c8c2] rounded-xl text-center text-xs text-[#717973]">
          Aún no se han cargado animales para este lote. Arrastre un archivo Excel/CSV o use los botones de ejemplo arriba.
        </div>
      )}
    </div>
  );
};
