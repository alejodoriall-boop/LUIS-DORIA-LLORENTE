import React, { useState } from 'react';
import {
  FarmDataPackage,
  InventoryItem,
  InventoryCategory,
  InvoiceItemScan,
  CategoryInfo,
} from '../../types';
import {
  PackagePlus,
  Camera,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
  Scan,
  DollarSign,
  Tag,
  Hash,
  Upload,
  Plus,
} from 'lucide-react';
import { INVENTORY_CATEGORIES_INFO } from '../../data/mockInventoryData';

interface RegisterStockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  existingItems: InventoryItem[];
  categories?: Record<string, CategoryInfo>;
  onOpenCreateCategoryModal?: () => void;
  onSaveEntry: (
    itemData: {
      farmId: string;
      name: string;
      category: InventoryCategory;
      brand?: string;
      unit: string;
      quantity: number;
      unitCostEstimate?: number;
      minStockAlert: number;
      locationInStore?: string;
      batchNumber?: string;
      expirationDate?: string;
      supplierName?: string;
      notes?: string;
      invoiceNumber?: string;
    },
    existingItemId?: string,
  ) => void;
}

export const RegisterStockEntryModal: React.FC<RegisterStockEntryModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  existingItems,
  categories = INVENTORY_CATEGORIES_INFO,
  onOpenCreateCategoryModal,
  onSaveEntry,
}) => {
  const [entryMode, setEntryMode] = useState<'manual' | 'camera_ocr'>('manual');
  const [selectedFarmId, setSelectedFarmId] = useState<string>(
    currentFarmId === 'all' ? farms[0]?.profile.id || 'finca-el-roble' : currentFarmId,
  );

  // Form states
  const [isNewItem, setIsNewItem] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string>(existingItems[0]?.id || '');
  
  // New item details
  const [name, setName] = useState<string>('Sal Mineralizada SLA 8% Cría');
  const [category, setCategory] = useState<InventoryCategory>('sales_nutricion');
  const [brand, setBrand] = useState<string>('SLA Nutrición Animal');
  const [unit, setUnit] = useState<string>('Saco 40kg');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCostEstimate, setUnitCostEstimate] = useState<number>(115000);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [locationInStore, setLocationInStore] = useState<string>('Bodega Principal');
  const [batchNumber, setBatchNumber] = useState<string>('LOT-2026-08');
  const [expirationDate, setExpirationDate] = useState<string>('2027-08-30');
  const [supplierName, setSupplierName] = useState<string>('Agroinsumos del Sinú S.A.');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('FE-10492');
  const [notes, setNotes] = useState<string>('Ingreso recibido por el mayordomo en finca');

  // Camera/OCR Scanner Simulation State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedItems, setScannedItems] = useState<InvoiceItemScan[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter items available for selected farm
  const farmItems = existingItems.filter(
    (i) => i.farmId === selectedFarmId || selectedFarmId === 'all',
  );

  const handleSimulateCameraOCR = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setIsScanning(true);

        // Simulate AI OCR reading after 1.5s
        setTimeout(() => {
          setIsScanning(false);
          const detected: InvoiceItemScan[] = [
            {
              itemName: 'Sal Mineralizada SLA 8% Cría y Ceba',
              category: 'sales_nutricion',
              quantity: 20,
              unit: 'Saco 40kg',
              unitCost: 115000,
              batchNumber: 'SLA-2026-884',
              expirationDate: '2027-09-15',
              confidenceScore: 98,
            },
            {
              itemName: 'Garrapaticida Baño Amitraz 12.5%',
              category: 'salud_veterinaria',
              quantity: 6,
              unit: 'Frasco 1000ml',
              unitCost: 98000,
              batchNumber: 'AMT-9812',
              expirationDate: '2027-06-20',
              confidenceScore: 94,
            },
          ];
          setScannedItems(detected);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyScannedItem = (scan: InvoiceItemScan) => {
    setName(scan.itemName);
    setCategory(scan.category);
    setQuantity(scan.quantity);
    setUnit(scan.unit);
    if (scan.unitCost) setUnitCostEstimate(scan.unitCost);
    if (scan.batchNumber) setBatchNumber(scan.batchNumber);
    if (scan.expirationDate) setExpirationDate(scan.expirationDate);
    setIsNewItem(true);
    setEntryMode('manual');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    if (!isNewItem && selectedItemId) {
      const existing = existingItems.find((i) => i.id === selectedItemId);
      if (existing) {
        onSaveEntry(
          {
            farmId: existing.farmId,
            name: existing.name,
            category: existing.category,
            brand: existing.brand,
            unit: existing.unit,
            quantity: Number(quantity),
            unitCostEstimate: Number(unitCostEstimate) || existing.unitCostEstimate,
            minStockAlert: existing.minStockAlert,
            locationInStore: locationInStore || existing.locationInStore,
            batchNumber: batchNumber || existing.batchNumber,
            expirationDate: expirationDate || existing.expirationDate,
            supplierName: supplierName || existing.supplierName,
            invoiceNumber,
            notes,
          },
          existing.id,
        );
        onClose();
        return;
      }
    }

    // New item creation
    onSaveEntry({
      farmId: selectedFarmId,
      name,
      category,
      brand,
      unit,
      quantity: Number(quantity),
      unitCostEstimate: Number(unitCostEstimate),
      minStockAlert: Number(minStockAlert) || 5,
      locationInStore,
      batchNumber,
      expirationDate,
      supplierName,
      invoiceNumber,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl border-2 border-[#012d1d] shadow-2xl max-w-3xl lg:max-w-5xl lg:max-w-6xl w-full overflow-hidden flex flex-col my-6">
        {/* Modal Header */}
        <div className="bg-[#012d1d] text-white p-5 flex items-center justify-between border-b-2 border-[#ffba38]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1b4332] rounded-2xl text-[#ffba38] border border-[#2d6a4f]">
              <PackagePlus className="w-6 h-6 text-[#ffba38]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase font-mono text-[#ffba38] tracking-wider">
                Recepción de Almacén
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                Ingresar Insumos / Factura
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#c1ecd4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: Manual vs Camera / Invoice Scan */}
        <div className="p-4 bg-[#f0f4f1] border-b border-[#c1c8c2] flex gap-2">
          <button
            type="button"
            onClick={() => setEntryMode('manual')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              entryMode === 'manual'
                ? 'bg-[#012d1d] text-white shadow-xs'
                : 'bg-white text-[#414844] hover:bg-[#e2efe8] border border-[#c1c8c2]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#ffba38]" />
            <span>Ingreso Manual</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('camera_ocr')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              entryMode === 'camera_ocr'
                ? 'bg-[#012d1d] text-[#ffba38] shadow-xs'
                : 'bg-white text-[#414844] hover:bg-[#e2efe8] border border-[#c1c8c2]'
            }`}
          >
            <Camera className="w-4 h-4 text-[#0077b6]" />
            <span>Leer Factura con Cámara (IA)</span>
          </button>
        </div>

        {/* Modal Form or Camera OCR Section */}
        {entryMode === 'camera_ocr' ? (
          <div className="p-5 space-y-4">
            <div className="bg-[#eef8ff] border-2 border-dashed border-[#0077b6] rounded-2xl p-6 text-center space-y-3">
              <Scan className="w-10 h-10 text-[#0077b6] mx-auto animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-[#012d1d]">
                  Escaneo de Facturas o Remisiones
                </h3>
                <p className="text-xs text-[#414844] mt-1 max-w-sm mx-auto">
                  Captura una fotografía de la factura o remisión física entregada al mayordomo para extraer insumos, cantidades y precios automáticamente.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 bg-[#0077b6] hover:bg-[#03045e] text-white font-bold text-xs px-5 py-3 rounded-xl cursor-pointer transition-all shadow-md">
                <Upload className="w-4 h-4 text-[#caf0f8]" />
                <span>Tomar Foto o Cargar Factura</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSimulateCameraOCR}
                  className="hidden"
                />
              </label>
            </div>

            {/* OCR Processing State */}
            {isScanning && (
              <div className="p-4 bg-[#fff8e7] border-2 border-[#ffba38] rounded-2xl text-center space-y-2">
                <Sparkles className="w-6 h-6 text-[#d97706] mx-auto animate-spin" />
                <p className="text-xs font-bold text-[#523700]">
                  Analizando texto e ítems de la factura con visión de IA...
                </p>
              </div>
            )}

            {/* Photo Preview & Detected Results */}
            {photoPreview && !isScanning && scannedItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#012d1d]">
                  <span className="flex items-center gap-1 text-[#2d6a4f]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Ítems Detectados en la Factura ({scannedItems.length}):
                  </span>
                </div>

                <div className="space-y-2">
                  {scannedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#f8fbf9] border border-[#c1c8c2] rounded-2xl flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#012d1d]">{item.itemName}</span>
                          <span className="text-[9px] bg-[#c1ecd4] text-[#002114] font-mono px-1.5 py-0.5 rounded font-bold">
                            {item.confidenceScore}% Precisión
                          </span>
                        </div>
                        <span className="text-[11px] text-[#717973] block">
                          Cantidad: <strong>{item.quantity} {item.unit}</strong> • Lote: {item.batchNumber}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyScannedItem(item)}
                        className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                      >
                        Ingresar Ítem
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Target Farm */}
            <div>
              <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2d6a4f]" />
                Finca o Predio Receptora:
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full p-2.5 bg-[#f8fbf9] border-2 border-[#c1c8c2] rounded-2xl text-xs font-bold text-[#012d1d]"
              >
                {farms.map((f) => (
                  <option key={f.profile.id} value={f.profile.id}>
                    {f.profile.name} ({f.profile.municipality})
                  </option>
                ))}
              </select>
            </div>

            {/* Existing Item or Create New Item Toggle */}
            <div className="p-3 bg-[#f0f7f4] border border-[#c1ecd4] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#012d1d]">¿Producto Existente o Nuevo?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewItem(false)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                      !isNewItem ? 'bg-[#012d1d] text-white' : 'bg-white text-[#414844] border border-[#c1c8c2]'
                    }`}
                  >
                    Existente
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewItem(true)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                      isNewItem ? 'bg-[#012d1d] text-[#ffba38]' : 'bg-white text-[#414844] border border-[#c1c8c2]'
                    }`}
                  >
                    + Nuevo Producto
                  </button>
                </div>
              </div>

              {!isNewItem ? (
                <div>
                  <label className="block text-[11px] font-bold text-[#414844] mb-1">
                    Seleccionar Producto del Inventario:
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#012d1d]"
                  >
                    {farmItems.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} (Stock Actual: {i.currentStock} {i.unit})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {/* New Product Form Fields */}
            {isNewItem && (
              <div className="space-y-3 bg-[#fafafa] p-3.5 rounded-2xl border border-[#eeeeee]">
                <div>
                  <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
                    Nombre Completo del Producto / Insumo:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Sal Mineralizada SLA 8% Cría"
                    className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#1a1c1c]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#414844] uppercase">
                        Categoría:
                      </label>
                      {onOpenCreateCategoryModal && (
                        <button
                          type="button"
                          onClick={onOpenCreateCategoryModal}
                          className="text-[10px] font-bold text-[#2d6a4f] hover:text-[#012d1d] flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-[#ffba38]" />
                          <span>+ Crear Nueva</span>
                        </button>
                      )}
                    </div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                      className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#1a1c1c]"
                    >
                      {Object.entries(categories).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                      Marca / Fabricante:
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ej. SLA Nutrición"
                      className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-medium text-[#1a1c1c]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                      Presentación / Unidad:
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="Ej. Saco 40kg, Frasco 500ml"
                      className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#1a1c1c]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                      Stock Mínimo para Alerta:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={minStockAlert}
                      onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 5)}
                      className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#1a1c1c]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Common Entry Fields: Quantity, Cost, Batch, Expiration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0077b6] uppercase mb-1">
                  Cantidad a Ingresar:
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 bg-[#f0f8ff] border-2 border-[#0077b6] rounded-xl text-lg font-black font-mono text-[#03045e]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Costo Unitario Aprox. ($ COP):
                </label>
                <input
                  type="number"
                  step="1000"
                  value={unitCostEstimate}
                  onChange={(e) => setUnitCostEstimate(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-mono font-bold text-[#1a1c1c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Número de Lote:
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Ej. LOT-2026-88"
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-mono text-[#1a1c1c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Fecha de Vencimiento:
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs text-[#1a1c1c]"
                />
              </div>
            </div>

            {/* Factura / Proveedor / Notas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Número de Factura / Remisión:
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Ej. FE-9842"
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-mono text-[#1a1c1c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                  Proveedor:
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Ej. Agroinsumos del Sinú"
                  className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs text-[#1a1c1c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                Ubicación en Bodega & Notas:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Guardado en Estiba 2 del bodegón principal"
                className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs text-[#1a1c1c]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#eeeeee] flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#414844] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                <span>Guardar Recepción</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
