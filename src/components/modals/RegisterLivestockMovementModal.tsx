import React, { useState } from 'react';
import {
  FarmDataPackage,
  LotRecord,
  ImportedAnimalRecord,
  LivestockMovementInput,
} from '../../types';
import {
  ArrowRightLeft,
  X,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  Skull,
  DollarSign,
  Scale,
  FileText,
  AlertTriangle,
  Send,
  Truck,
  Building,
} from 'lucide-react';

interface RegisterLivestockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  lots: LotRecord[];
  onSaveMovement: (movement: LivestockMovementInput) => void;
}

export const RegisterLivestockMovementModal: React.FC<RegisterLivestockMovementModalProps> = ({
  isOpen,
  onClose,
  farms,
  lots,
  onSaveMovement,
}) => {
  const [movementType, setMovementType] = useState<
    'transferencia_interna' | 'salida_muerte' | 'salida_sacrificio' | 'salida_venta'
  >('transferencia_interna');

  // Source Selection
  const [sourceFarmId, setSourceFarmId] = useState<string>(farms[0]?.profile.id || 'finca-san-juan');
  
  const sourceLots = lots.filter((l) => l.farmId === sourceFarmId || sourceFarmId === 'all');
  const [selectedLotId, setSelectedLotId] = useState<string>(sourceLots[0]?.id || lots[0]?.id || '');

  // For Internal Transfer Destination
  const [targetFarmId, setTargetFarmId] = useState<string>(
    farms.find((f) => f.profile.id !== sourceFarmId)?.profile.id || farms[0]?.profile.id || '',
  );

  // Common Fields
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [causeOrReason, setCauseOrReason] = useState<string>('Traslado de pasture y rotación de potreros');
  const [buyerOrDestination, setBuyerOrDestination] = useState<string>('Ganadería El Porvenir - Predio B');
  const [salePriceTotal, setSalePriceTotal] = useState<number>(45000000);
  const [salePricePerKg, setSalePricePerKg] = useState<number>(9800);
  const [totalWeightKg, setTotalWeightKg] = useState<number>(4590);
  const [invoiceOrGuideNumber, setInvoiceOrGuideNumber] = useState<string>('GUI-2026-901');
  const [notes, setNotes] = useState<string>('Movimiento registrado en sistema con guía ICA');

  if (!isOpen) return null;

  const currentLot = lots.find((l) => l.id === selectedLotId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const movement: LivestockMovementInput = {
      movementType,
      lotId: selectedLotId,
      targetFarmId: movementType === 'transferencia_interna' ? targetFarmId : undefined,
      date,
      causeOrReason,
      buyerOrDestination,
      salePriceTotal: movementType === 'salida_venta' ? Number(salePriceTotal) : undefined,
      salePricePerKg: movementType === 'salida_venta' ? Number(salePricePerKg) : undefined,
      totalWeightKg: Number(totalWeightKg) || currentLot?.currentTotalWeight || 0,
      invoiceOrGuideNumber,
      notes,
    };

    onSaveMovement(movement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 md:p-6 border border-[#c1c8c2] shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#eeeeee] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#012d1d] text-[#c1ecd4] rounded-2xl shadow-sm">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#012d1d]">
                Transferencias & Salidas de Ganado
              </h3>
              <p className="text-xs text-[#717973] font-medium">
                Traslados entre predios, ventas externas y bajas de inventario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#717973] hover:text-black hover:bg-[#f0f0f0] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 py-4 space-y-4 text-xs">
          {/* Action Type Selector */}
          <div>
            <label className="block text-[11px] font-black text-[#012d1d] uppercase mb-2">
              Tipo de Movimiento o Salida
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMovementType('transferencia_interna');
                  setCauseOrReason('Traslado interno entre predios por rotación de potreros');
                }}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                  movementType === 'transferencia_interna'
                    ? 'border-[#012d1d] bg-[#e8f5e9] text-[#012d1d] font-bold shadow-xs'
                    : 'border-[#c1c8c2] bg-white text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#1b4332]" />
                <span className="text-[10.5px] leading-tight">Transferencia Interna</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('salida_venta');
                  setCauseOrReason('Venta comercial de ganado / Subasta');
                }}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                  movementType === 'salida_venta'
                    ? 'border-[#2563eb] bg-[#dbeafe] text-[#1e40af] font-bold shadow-xs'
                    : 'border-[#c1c8c2] bg-white text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#2563eb]" />
                <span className="text-[10.5px] leading-tight">Venta Externa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('salida_muerte');
                  setCauseOrReason('Baja por muerte / enfermedad');
                }}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                  movementType === 'salida_muerte'
                    ? 'border-[#dc2626] bg-[#fee2e2] text-[#991b1b] font-bold shadow-xs'
                    : 'border-[#c1c8c2] bg-white text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <Skull className="w-4 h-4 text-[#dc2626]" />
                <span className="text-[10.5px] leading-tight">Baja / Muerte</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('salida_sacrificio');
                  setCauseOrReason('Sacrificio / Autoconsumo en finca');
                }}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                  movementType === 'salida_sacrificio'
                    ? 'border-[#d97706] bg-[#fef3c7] text-[#92400e] font-bold shadow-xs'
                    : 'border-[#c1c8c2] bg-white text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <Building className="w-4 h-4 text-[#d97706]" />
                <span className="text-[10.5px] leading-tight">Sacrificio / Consumo</span>
              </button>
            </div>
          </div>

          {/* Source Selection (Predio & Lote Origen) */}
          <div className="p-3.5 bg-white border border-[#c1c8c2] rounded-2xl space-y-3">
            <h4 className="font-bold text-[#012d1d] text-xs flex items-center gap-1.5 border-b border-[#eeeeee] pb-2">
              <Building2 className="w-4 h-4 text-[#1b4332]" /> Predio y Lote de Origen
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Predio Origen
                </label>
                <select
                  value={sourceFarmId}
                  onChange={(e) => setSourceFarmId(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-bold text-[#012d1d]"
                >
                  {farms.map((farm) => (
                    <option key={farm.profile.id} value={farm.profile.id}>
                      {farm.profile.name} ({farm.profile.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Lote Afectado
                </label>
                <select
                  value={selectedLotId}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-bold text-[#012d1d]"
                >
                  {sourceLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name} ({lot.heads} cabezas - {lot.currentAvgWeight} kg prom)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Transferencia Interna Specific Controls */}
          {movementType === 'transferencia_interna' && (
            <div className="p-3.5 bg-[#e8f5e9]/70 border border-[#a5d6a7] rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="font-bold text-[#1b5e20] text-xs flex items-center gap-1.5 border-b border-[#a5d6a7] pb-2">
                <Truck className="w-4 h-4 text-[#2e7d32]" /> Destino de la Transferencia Interna
              </h4>

              <div>
                <label className="block text-[10px] font-bold text-[#2e7d32] uppercase mb-1">
                  Predio de Destino (Dentro de la Ganadería)
                </label>
                <select
                  value={targetFarmId}
                  onChange={(e) => setTargetFarmId(e.target.value)}
                  className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-2 font-black text-[#012d1d]"
                >
                  {farms.map((farm) => (
                    <option key={farm.profile.id} value={farm.profile.id}>
                      {farm.profile.name} — {farm.profile.department} ({farm.profile.vereda})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Venta Externa Specific Controls */}
          {movementType === 'salida_venta' && (
            <div className="p-3.5 bg-[#dbeafe]/70 border border-[#93c5fd] rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="font-bold text-[#1e40af] text-xs flex items-center gap-1.5 border-b border-[#93c5fd] pb-2">
                <ShoppingBag className="w-4 h-4 text-[#2563eb]" /> Comercialización y Venta
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                    Comprador / Subasta Destino
                  </label>
                  <input
                    type="text"
                    value={buyerOrDestination}
                    onChange={(e) => setBuyerOrDestination(e.target.value)}
                    placeholder="Ej. Subacasanare / Carnes del Sinu"
                    className="w-full bg-white border border-[#93c5fd] rounded-xl px-3 py-1.5 font-semibold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                    Guía de Movilización / Factura ICA
                  </label>
                  <input
                    type="text"
                    value={invoiceOrGuideNumber}
                    onChange={(e) => setInvoiceOrGuideNumber(e.target.value)}
                    placeholder="GUI-2026-901"
                    className="w-full bg-white border border-[#93c5fd] rounded-xl px-3 py-1.5 font-mono font-bold text-[#012d1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                    Valor Total Venta ($)
                  </label>
                  <input
                    type="number"
                    value={salePriceTotal}
                    onChange={(e) => setSalePriceTotal(Number(e.target.value))}
                    className="w-full bg-white border border-[#93c5fd] rounded-xl px-3 py-1.5 font-mono font-bold text-[#1e40af]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                    Precio Prom. $/Kg
                  </label>
                  <input
                    type="number"
                    value={salePricePerKg}
                    onChange={(e) => setSalePricePerKg(Number(e.target.value))}
                    className="w-full bg-white border border-[#93c5fd] rounded-xl px-3 py-1.5 font-mono font-bold text-[#1e40af]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                    Peso Total Despachado (kg)
                  </label>
                  <input
                    type="number"
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                    className="w-full bg-white border border-[#93c5fd] rounded-xl px-3 py-1.5 font-mono font-bold text-[#012d1d]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Common Date & Motivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                Fecha del Evento
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                Motivo / Causa
              </label>
              <input
                type="text"
                value={causeOrReason}
                onChange={(e) => setCauseOrReason(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-semibold text-[#012d1d]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
              ObservacionesAdicionales
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales del transporte, responsable en finca..."
              className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl p-2.5 text-xs text-[#012d1d]"
            />
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eeeeee] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#c1c8c2] text-[#414844] font-bold text-xs hover:bg-[#f0f0f0] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#c1ecd4]" />
              Confirmar Movimiento de Ganado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
