import React, { useState } from 'react';
import { InventoryItem, MovementType } from '../../types';
import {
  PackageMinus,
  Building2,
  Calendar,
  CheckCircle2,
  X,
  AlertTriangle,
  User,
  MapPin,
  ClipboardList,
} from 'lucide-react';

interface RegisterStockConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  defaultItemId?: string;
  onSaveConsumption: (movement: {
    itemId: string;
    quantity: number;
    type: MovementType;
    reasonOrDestination: string;
    registeredBy: string;
    notes?: string;
  }) => void;
}

export const RegisterStockConsumptionModal: React.FC<RegisterStockConsumptionModalProps> = ({
  isOpen,
  onClose,
  items,
  defaultItemId,
  onSaveConsumption,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    defaultItemId || items[0]?.id || '',
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [movementType, setMovementType] = useState<MovementType>('salida');
  const [reasonOrDestination, setReasonOrDestination] = useState<string>(
    'Suministro a saladeros Potrero 4 (Lote Ceba)',
  );
  const [registeredBy, setRegisteredBy] = useState<string>('Mayordomo Carlos');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId) || items[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || quantity <= 0) return;

    onSaveConsumption({
      itemId: currentItem.id,
      quantity: Number(quantity),
      type: movementType,
      reasonOrDestination,
      registeredBy,
      notes,
    });

    onClose();
  };

  const isStockInsufficient = currentItem && quantity > currentItem.currentStock;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl border-2 border-[#012d1d] shadow-2xl max-w-3xl lg:max-w-5xl lg:max-w-6xl w-full overflow-hidden flex flex-col my-6">
        {/* Header */}
        <div className="bg-[#012d1d] text-white p-5 flex items-center justify-between border-b-2 border-[#ffba38]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1b4332] rounded-2xl text-[#ffba38] border border-[#2d6a4f]">
              <PackageMinus className="w-6 h-6 text-[#ffba38]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase font-mono text-[#ffba38] tracking-wider">
                Consumo & Salida de Bodega
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                Registrar Uso en Campo
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Select Item */}
          <div>
            <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
              Producto a Descontar del Inventario:
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbf9] border-2 border-[#c1c8c2] rounded-2xl text-xs font-bold text-[#012d1d]"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} — Disponibles: {i.currentStock} {i.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Summary Box */}
          {currentItem && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                currentItem.currentStock <= currentItem.minStockAlert
                  ? 'bg-[#fff0f0] border-[#ffb3b3] text-[#700000]'
                  : 'bg-[#f0f8ff] border-[#b3e0ff] text-[#003366]'
              }`}
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider block">
                  Disponibilidad Actual en Finca
                </span>
                <span className="text-lg font-black font-mono">
                  {currentItem.currentStock} {currentItem.unit}
                </span>
              </div>

              {currentItem.currentStock <= currentItem.minStockAlert && (
                <div className="flex items-center gap-1.5 bg-[#d90429] text-white px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Bajo Stock</span>
                </div>
              )}
            </div>
          )}

          {/* Quantity & Movement Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#d90429] uppercase mb-1">
                Cantidad a Consumir:
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 bg-[#fff5f5] border-2 border-[#d90429] rounded-xl text-lg font-black font-mono text-[#700000]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                Tipo de Registro:
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as MovementType)}
                className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-bold text-[#1a1c1c]"
              >
                <option value="salida">Salida / Consumo Normal</option>
                <option value="baja">Baja por Daño / Vencimiento</option>
                <option value="ajuste">Ajuste de Conteo Físico</option>
              </select>
            </div>
          </div>

          {isStockInsufficient && (
            <div className="p-3 bg-[#fff0f0] border border-[#ff8080] rounded-2xl flex items-center gap-2 text-xs text-[#d90429] font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                La cantidad ingresada ({quantity}) supera el stock existente ({currentItem?.currentStock}). Se registrará un saldo crítico.
              </span>
            </div>
          )}

          {/* Reason or Destination */}
          <div>
            <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2d6a4f]" />
              Destino / Aplicación en Campo:
            </label>
            <input
              type="text"
              value={reasonOrDestination}
              onChange={(e) => setReasonOrDestination(e.target.value)}
              placeholder="Ej. Saladeros Potrero 4, Bañado de Lote Ceba, Fertilización Potrero B"
              className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-medium text-[#1a1c1c]"
              required
            />
          </div>

          {/* Registered By */}
          <div>
            <label className="block text-xs font-bold text-[#414844] uppercase mb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#2d6a4f]" />
              Persona que Registra (Mayordomo / Encargado):
            </label>
            <input
              type="text"
              value={registeredBy}
              onChange={(e) => setRegisteredBy(e.target.value)}
              placeholder="Ej. Carlos Mendoza (Mayordomo)"
              className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs text-[#1a1c1c]"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
              Observaciones Adicionales:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Se llenaron 3 canoas con sal mineralizada"
              className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs text-[#1a1c1c]"
            />
          </div>

          {/* Actions */}
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
              className="flex-1 py-3 bg-[#d90429] hover:bg-[#a0001e] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Confirmar Descuento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
