import React, { useState } from 'react';
import {
  FarmDataPackage,
  LotRecord,
  ImportedAnimalRecord,
  LivestockMovementInput,
  LotCategory,
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
  Tag,
  Dna,
  UserCheck,
  ShieldCheck,
  MapPin,
  Clock,
  ChevronRight,
  Flame,
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
  
  const sourceLots = lots.filter((l) => !l.farmId || l.farmId === sourceFarmId || sourceFarmId === 'all');
  const [selectedLotId, setSelectedLotId] = useState<string>(sourceLots[0]?.id || lots[0]?.id || '');

  // For Internal Transfer Destination
  const [targetFarmId, setTargetFarmId] = useState<string>(
    farms.find((f) => f.profile.id !== sourceFarmId)?.profile.id || farms[0]?.profile.id || '',
  );
  const [targetPaddockId, setTargetPaddockId] = useState<string>('');

  const currentFarm = farms.find((f) => f.profile.id === sourceFarmId) || farms[0];
  const targetFarm = farms.find((f) => f.profile.id === targetFarmId) || farms[0];
  const currentLot = lots.find((l) => l.id === selectedLotId) || sourceLots[0] || lots[0];

  // Editable / Confirmable Basic Information Fields (Synced with selected lot)
  const [headsToMove, setHeadsToMove] = useState<string>(currentLot?.heads?.toString() || '25');
  const [avgWeightKg, setAvgWeightKg] = useState<string>(currentLot?.currentAvgWeight?.toString() || '420.0');
  const [lotCategory, setLotCategory] = useState<LotCategory>(currentLot?.category || 'ceba');
  const [sexLabel, setSexLabel] = useState<string>(currentLot?.sexLabel || 'Machos de Ceba');
  const [breed, setBreed] = useState<string>('Brahman Blanco / Cebú Comercial');
  const [ageRange, setAgeRange] = useState<string>(currentLot?.ageRange || '22-28 Meses');
  const [brandIron, setBrandIron] = useState<string>('Hierro Finca San Juan (Corona)');
  const [commercialPurpose, setCommercialPurpose] = useState<string>('Ceba / Engorde Intensivo');

  // Venta specifics
  const [buyerOrDestination, setBuyerOrDestination] = useState<string>('Frigorífico del Sinú / Comprador Particular');
  const [buyerDoc, setBuyerDoc] = useState<string>('900.567.123-4');
  const [buyerPhone, setBuyerPhone] = useState<string>('310 987 6543');
  const [salePriceType, setSalePriceType] = useState<'kilo' | 'total'>('kilo');
  const [salePricePerKg, setSalePricePerKg] = useState<number>(9850);
  const [salePriceTotalCustom, setSalePriceTotalCustom] = useState<number>(98500000);

  // Muerte / Sacrificio specifics
  const [bajaSpecificCause, setBajaSpecificCause] = useState<string>('Timpanismo agudo / Accidente en potrero');
  const [disposalMethod, setDisposalMethod] = useState<string>('enterramiento_cal');
  const [estimatedLossCop, setEstimatedLossCop] = useState<number>(3400000);

  // Logistical / Transport Details
  const [transporterName, setTransporterName] = useState<string>('Transportes Ganaderos del Sinú / Jairo Morales');
  const [transporterPhone, setTransporterPhone] = useState<string>('312 456 7890');
  const [truckPlate, setTruckPlate] = useState<string>('WNK-452');
  const [freightCost, setFreightCost] = useState<number>(350000);
  const [dispatcherName, setDispatcherName] = useState<string>('Mayordomo Carlos Restrepo');
  const [receiverName, setReceiverName] = useState<string>('Administrador Luis Durango');
  const [sanitaryClearanceVerified, setSanitaryClearanceVerified] = useState<boolean>(true);

  // Common Fields
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [causeOrReason, setCauseOrReason] = useState<string>('Traslado interno entre predios por rotación de potreros');
  const [invoiceOrGuideNumber, setInvoiceOrGuideNumber] = useState<string>(`GUI-ICA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
  const [notes, setNotes] = useState<string>('Movimiento registrado con trazabilidad de lote e información básica completa.');

  if (!isOpen) return null;

  // Real-time calculations
  const parsedHeads = parseInt(headsToMove, 10) || 1;
  const parsedAvgWeight = parseFloat(avgWeightKg) || 400;
  const totalBiomassKg = Math.round(parsedHeads * parsedAvgWeight);
  const ugmCount = (totalBiomassKg / 450).toFixed(2);
  const calculatedSaleTotal = salePriceType === 'kilo' ? Math.round(totalBiomassKg * salePricePerKg) : salePriceTotalCustom;

  const handleLotSelect = (lotId: string) => {
    setSelectedLotId(lotId);
    const lot = lots.find((l) => l.id === lotId);
    if (lot) {
      setHeadsToMove(lot.heads?.toString() || '20');
      setAvgWeightKg(lot.currentAvgWeight?.toString() || '400.0');
      setLotCategory(lot.category || 'ceba');
      setSexLabel(lot.sexLabel || (lot.category === 'ceba' ? 'Machos de Ceba' : 'Hembras de Cría'));
      setAgeRange(lot.ageRange || '20-28 Meses');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetPaddockObj = targetFarm.paddocks.find((p) => p.id === targetPaddockId);

    const movement: LivestockMovementInput = {
      movementType,
      lotId: selectedLotId,
      lotName: currentLot?.name || 'Lote de Ganado',
      category: lotCategory,
      categoryLabel: lotCategory === 'ceba' ? 'CEBA INTENSIVA' : lotCategory === 'cria' ? 'CRÍA / LEVANTE' : lotCategory === 'leche' ? 'LECHERÍA' : 'GENÉTICA',
      sexLabel,
      breed,
      ageRange,
      brandingIron: brandIron,
      commercialPurpose,
      sourceFarmId,
      sourceFarmName: currentFarm?.profile?.name || 'Predio Origen',
      targetFarmId: movementType === 'transferencia_interna' ? targetFarmId : undefined,
      targetFarmName: movementType === 'transferencia_interna' ? targetFarm?.profile?.name : undefined,
      targetPaddockId: movementType === 'transferencia_interna' ? targetPaddockId : undefined,
      targetPaddockName: movementType === 'transferencia_interna' && targetPaddockObj ? `${targetPaddockObj.code} - ${targetPaddockObj.name}` : undefined,
      headsMoved: parsedHeads,
      avgWeightKg: parsedAvgWeight,
      totalWeightKg: totalBiomassKg,
      date,
      causeOrReason: movementType === 'salida_muerte' ? bajaSpecificCause : causeOrReason,
      buyerOrDestination: movementType === 'salida_venta' ? buyerOrDestination : movementType === 'transferencia_interna' ? targetFarm?.profile?.name : movementType === 'salida_sacrificio' ? 'Autoconsumo / Beneficio Local' : 'Salida por Muerte / Descarte',
      buyerDoc: movementType === 'salida_venta' ? buyerDoc : undefined,
      buyerPhone: movementType === 'salida_venta' ? buyerPhone : undefined,
      salePriceTotal: movementType === 'salida_venta' ? calculatedSaleTotal : undefined,
      salePricePerKg: movementType === 'salida_venta' ? salePricePerKg : undefined,
      invoiceOrGuideNumber,
      sanitaryClearanceVerified,
      transporterName,
      transporterPhone,
      truckPlate,
      freightCost,
      dispatcherName,
      receiverName,
      notes: `${notes} | Espec: ${breed}, Edad: ${ageRange}, Hierro: ${brandIron}, UGM: ${ugmCount}`,
    };

    onSaveMovement(movement);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#15241C] rounded-3xl max-w-4xl lg:max-w-5xl w-full p-5 md:p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#eeeeee] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0D1A13] text-[#A5B8AC] rounded-2xl shadow-sm">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Movilización & Trazabilidad de Lotes de Ganado
              </h3>
              <p className="text-xs text-[#717973] font-medium">
                Transferencias internas, ventas comerciales, traslados y bajas de inventario con información básica vinculada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#717973] hover:text-black hover:bg-[#f0f0f0] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 py-4 space-y-4 text-xs">
          {/* Action Type Selector */}
          <div>
            <label className="block text-[11px] font-black text-white uppercase mb-2">
              Tipo de Movimiento o Transacción
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMovementType('transferencia_interna');
                  setCauseOrReason('Traslado interno entre predios por rotación de potreros y forraje');
                }}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                  movementType === 'transferencia_interna'
                    ? 'border-[#012d1d] bg-[#e8f5e9] text-white font-black shadow-xs ring-1 ring-[#012d1d]'
                    : 'border-white/10 bg-[#15241C] text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#1b4332]" />
                <span className="text-[11px] leading-tight font-bold">Transferencia Interna</span>
                <span className="text-[9.5px] opacity-75">Entre predios / potreros</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('salida_venta');
                  setCauseOrReason('Venta comercial de ganado gordo / subasta');
                }}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                  movementType === 'salida_venta'
                    ? 'border-[#2563eb] bg-[#dbeafe] text-[#1e40af] font-black shadow-xs ring-1 ring-[#2563eb]'
                    : 'border-white/10 bg-[#15241C] text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#2563eb]" />
                <span className="text-[11px] leading-tight font-bold">Venta Comercial</span>
                <span className="text-[9.5px] opacity-75">Frigorífico / Subasta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('salida_muerte');
                  setCauseOrReason('Baja por muerte / enfermedad / accidente');
                }}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                  movementType === 'salida_muerte'
                    ? 'border-[#dc2626] bg-[#fee2e2] text-[#991b1b] font-black shadow-xs ring-1 ring-[#dc2626]'
                    : 'border-white/10 bg-[#15241C] text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <Skull className="w-4 h-4 text-[#dc2626]" />
                <span className="text-[11px] leading-tight font-bold">Baja / Muerte</span>
                <span className="text-[9.5px] opacity-75">Salida sanitaria</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('salida_sacrificio');
                  setCauseOrReason('Sacrificio / Autoconsumo en finca');
                }}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                  movementType === 'salida_sacrificio'
                    ? 'border-[#d97706] bg-[#fef3c7] text-[#92400e] font-black shadow-xs ring-1 ring-[#d97706]'
                    : 'border-white/10 bg-[#15241C] text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <Building className="w-4 h-4 text-[#d97706]" />
                <span className="text-[11px] leading-tight font-bold">Sacrificio / Consumo</span>
                <span className="text-[9.5px] opacity-75">Beneficio de emergencia</span>
              </button>
            </div>
          </div>

          {/* SECTION: Source Selection (Predio & Lote Origen) */}
          <div className="p-3.5 bg-[#15241C] border border-white/10 rounded-2xl space-y-3">
            <h4 className="font-black text-white text-xs flex items-center justify-between border-b border-[#eeeeee] pb-2">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#1b4332]" /> Predio y Lote de Origen
              </span>
              <span className="text-[10px] text-[#717973] font-normal">
                Predio Activo: <strong>{currentFarm?.profile?.name}</strong>
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Predio de Origen
                </label>
                <select
                  value={sourceFarmId}
                  onChange={(e) => {
                    setSourceFarmId(e.target.value);
                    const lotsInNewFarm = lots.filter((l) => !l.farmId || l.farmId === e.target.value);
                    if (lotsInNewFarm[0]) {
                      handleLotSelect(lotsInNewFarm[0].id);
                    }
                  }}
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-bold text-white"
                >
                  {farms.map((farm) => (
                    <option key={farm.profile.id} value={farm.profile.id}>
                      {farm.profile.name} ({farm.profile.department} — {farm.profile.municipality})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Lote Afectado / Origen *
                </label>
                <select
                  value={selectedLotId}
                  onChange={(e) => handleLotSelect(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-black text-white"
                >
                  {sourceLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name} ({lot.heads} cab • {lot.currentAvgWeight} kg prom • {lot.categoryLabel || lot.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION: Ficha Técnica & Información Básica del Lote */}
          <div className="p-4 bg-[#f8faf9] border border-[#a5d6a7] rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#c8e6c9] pb-2">
              <h4 className="font-black text-[#1b5e20] text-xs flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#2e7d32]" />
                Información Básica & Ficha Zootécnica del Lote
              </h4>
              <span className="text-[10px] bg-[#c8e6c9] text-[#1b5e20] font-bold px-2 py-0.5 rounded-md">
                Trazabilidad 100% Vinculada
              </span>
            </div>

            {/* Grid of Basic Info Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[9.5px] font-bold text-[#414844] uppercase mb-1">
                  N° Cabezas a Movilizar *
                </label>
                <input
                  type="number"
                  min="1"
                  value={headsToMove}
                  onChange={(e) => setHeadsToMove(e.target.value)}
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1.5 font-mono font-black text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-[#414844] uppercase mb-1">
                  Peso Promedio (kg/cab) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={avgWeightKg}
                  onChange={(e) => setAvgWeightKg(e.target.value)}
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1.5 font-mono font-black text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-[#414844] uppercase mb-1">
                  Categoría Zootécnica
                </label>
                <select
                  value={lotCategory}
                  onChange={(e) => setLotCategory(e.target.value as LotCategory)}
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2 py-1.5 font-semibold text-white text-xs"
                >
                  <option value="ceba">Ceba Intensiva (Engorde)</option>
                  <option value="cria">Cría / Levante</option>
                  <option value="leche">Lechería / Doble Propósito</option>
                  <option value="genetica">Genética / Reproductores</option>
                </select>
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-[#414844] uppercase mb-1">
                  Sexo Predominante
                </label>
                <select
                  value={sexLabel}
                  onChange={(e) => setSexLabel(e.target.value)}
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2 py-1.5 font-semibold text-white text-xs"
                >
                  <option value="Machos de Ceba">Machos (Ceba / Levante)</option>
                  <option value="Hembras de Cría / Vientres">Hembras (Cría / Vientre)</option>
                  <option value="Mixto (Machos y Hembras)">Lote Mixto</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[9.5px] font-bold text-[#414844] uppercase mb-1">
                  Raza / Cruce
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Ej. Brahman Blanco / Cebú"
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1.5 font-medium text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-[#414844] uppercase mb-1">
                  Rango de Edad
                </label>
                <input
                  type="text"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  placeholder="Ej. 20-28 Meses"
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1.5 font-medium text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-[#414844] uppercase mb-1">
                  Hierro / Marca a Fuego
                </label>
                <input
                  type="text"
                  value={brandIron}
                  onChange={(e) => setBrandIron(e.target.value)}
                  placeholder="Ej. Hierro Corona / San Juan"
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1.5 font-medium text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-[#414844] uppercase mb-1">
                  Destino Productivo
                </label>
                <input
                  type="text"
                  value={commercialPurpose}
                  onChange={(e) => setCommercialPurpose(e.target.value)}
                  placeholder="Ej. Ceba / Engorde"
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1.5 font-medium text-white text-xs"
                />
              </div>
            </div>

            {/* Live Metrics Ribbon */}
            <div className="bg-[#e8f5e9] p-2.5 rounded-xl border border-[#c8e6c9] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#1b5e20]">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase opacity-75">Cabezas a Salir</span>
                <span className="font-mono font-black text-sm">{parsedHeads} Cab.</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase opacity-75">Peso Promedio</span>
                <span className="font-mono font-black text-sm">{parsedAvgWeight} kg</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase opacity-75">Biomasa Total</span>
                <span className="font-mono font-black text-sm">{totalBiomassKg.toLocaleString('es-CO')} kg</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase opacity-75">Carga Animal</span>
                <span className="font-mono font-black text-sm">{ugmCount} UGM (450kg)</span>
              </div>
            </div>
          </div>

          {/* Transferencia Interna Specific Controls */}
          {movementType === 'transferencia_interna' && (
            <div className="p-3.5 bg-[#e8f5e9]/70 border border-[#a5d6a7] rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="font-black text-[#1b5e20] text-xs flex items-center gap-1.5 border-b border-[#a5d6a7] pb-2">
                <Truck className="w-4 h-4 text-[#2e7d32]" /> Destino del Traslado Interno
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#2e7d32] uppercase mb-1">
                    Predio de Destino
                  </label>
                  <select
                    value={targetFarmId}
                    onChange={(e) => setTargetFarmId(e.target.value)}
                    className="w-full bg-[#15241C] border border-[#a5d6a7] rounded-xl px-3 py-2 font-black text-white"
                  >
                    {farms.map((farm) => (
                      <option key={farm.profile.id} value={farm.profile.id}>
                        {farm.profile.name} — {farm.profile.department} ({farm.profile.municipality})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#2e7d32] uppercase mb-1">
                    Potrero Destino en {targetFarm?.profile?.name}
                  </label>
                  <select
                    value={targetPaddockId}
                    onChange={(e) => setTargetPaddockId(e.target.value)}
                    className="w-full bg-[#15241C] border border-[#a5d6a7] rounded-xl px-3 py-2 font-bold text-white"
                  >
                    <option value="">-- Asignar más tarde --</option>
                    {targetFarm?.paddocks?.map((pad) => (
                      <option key={pad.id} value={pad.id}>
                        {pad.code} - {pad.name} ({pad.areaHa} Ha • {pad.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Venta Externa Specific Controls */}
          {movementType === 'salida_venta' && (
            <div className="p-3.5 bg-[#dbeafe]/70 border border-[#93c5fd] rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#93c5fd] pb-2">
                <h4 className="font-black text-[#1e40af] text-xs flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#2563eb]" /> Comercialización y Venta
                </h4>
                <div className="flex items-center gap-1 bg-[#15241C] p-0.5 rounded-lg border border-[#93c5fd]">
                  <button
                    type="button"
                    onClick={() => setSalePriceType('kilo')}
                    className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                      salePriceType === 'kilo' ? 'bg-[#2563eb] text-white' : 'text-[#1e40af]'
                    }`}
                  >
                    Por Kilo ($/kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalePriceType('total')}
                    className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                      salePriceType === 'total' ? 'bg-[#2563eb] text-white' : 'text-[#1e40af]'
                    }`}
                  >
                    Valor Global ($)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                    Comprador / Frigorífico / Subasta *
                  </label>
                  <input
                    type="text"
                    value={buyerOrDestination}
                    onChange={(e) => setBuyerOrDestination(e.target.value)}
                    placeholder="Ej. Frigorífico del Sinú / Subastar"
                    className="w-full bg-[#15241C] border border-[#93c5fd] rounded-xl px-3 py-1.5 font-bold text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                    Cédula / NIT Comprador
                  </label>
                  <input
                    type="text"
                    value={buyerDoc}
                    onChange={(e) => setBuyerDoc(e.target.value)}
                    placeholder="Ej. 900.123.456-7"
                    className="w-full bg-[#15241C] border border-[#93c5fd] rounded-xl px-3 py-1.5 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="Ej. 310 555 1234"
                    className="w-full bg-[#15241C] border border-[#93c5fd] rounded-xl px-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {salePriceType === 'kilo' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                      Precio Venta por Kg ($ COP) *
                    </label>
                    <input
                      type="number"
                      value={salePricePerKg}
                      onChange={(e) => setSalePricePerKg(Number(e.target.value))}
                      className="w-full bg-[#15241C] border border-[#2563eb] rounded-xl px-3 py-1.5 font-mono font-black text-[#1e40af]"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-[#1e40af] uppercase mb-1">
                      Valor Total Venta ($ COP) *
                    </label>
                    <input
                      type="number"
                      value={salePriceTotalCustom}
                      onChange={(e) => setSalePriceTotalCustom(Number(e.target.value))}
                      className="w-full bg-[#15241C] border border-[#2563eb] rounded-xl px-3 py-1.5 font-mono font-black text-[#1e40af]"
                      required
                    />
                  </div>
                )}

                <div className="sm:col-span-2 bg-[#15241C] p-2.5 rounded-xl border border-[#93c5fd] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#1e40af] uppercase">
                    Liquidación Total Estimada ({totalBiomassKg.toLocaleString('es-CO')} kg)
                  </span>
                  <span className="font-mono font-black text-sm text-[#1e40af]">
                    ${calculatedSaleTotal.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Muerte / Baja Specific Controls */}
          {movementType === 'salida_muerte' && (
            <div className="p-3.5 bg-[#fee2e2]/70 border border-[#fca5a5] rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="font-black text-[#991b1b] text-xs flex items-center gap-1.5 border-b border-[#fca5a5] pb-2">
                <Skull className="w-4 h-4 text-[#dc2626]" /> Registro de Baja por Muerte / Novedad Sanitaria
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#991b1b] uppercase mb-1">
                    Causa / Diagnóstico de Muerte
                  </label>
                  <input
                    type="text"
                    value={bajaSpecificCause}
                    onChange={(e) => setBajaSpecificCause(e.target.value)}
                    placeholder="Ej. Timpanismo, Fiebre de Garrapata..."
                    className="w-full bg-[#15241C] border border-[#fca5a5] rounded-xl px-3 py-1.5 font-bold text-[#991b1b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#991b1b] uppercase mb-1">
                    Método de Disposición Sanitaria
                  </label>
                  <select
                    value={disposalMethod}
                    onChange={(e) => setDisposalMethod(e.target.value)}
                    className="w-full bg-[#15241C] border border-[#fca5a5] rounded-xl px-3 py-1.5 font-semibold text-white"
                  >
                    <option value="enterramiento_cal">Enterramiento Profundo con Cal Viva</option>
                    <option value="cremacion">Cremación Sanitaria</option>
                    <option value="necropsia">Necropsia y Toma de Muestras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#991b1b] uppercase mb-1">
                    Pérdida Económica Estimada ($ COP)
                  </label>
                  <input
                    type="number"
                    value={estimatedLossCop}
                    onChange={(e) => setEstimatedLossCop(Number(e.target.value))}
                    className="w-full bg-[#15241C] border border-[#fca5a5] rounded-xl px-3 py-1.5 font-mono font-bold text-[#991b1b]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Guía Sanitaria ICA, Trazabilidad & Transporte */}
          <div className="p-3.5 bg-[#15241C] border border-white/10 rounded-2xl space-y-3">
            <h4 className="font-black text-white text-xs flex items-center justify-between border-b border-[#eeeeee] pb-2">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#1b4332]" /> Guía Sanitaria ICA, Transporte & Despacho
              </span>
              <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Control Sanitario
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  N° Guía de Movilización ICA / Factura *
                </label>
                <input
                  type="text"
                  value={invoiceOrGuideNumber}
                  onChange={(e) => setInvoiceOrGuideNumber(e.target.value)}
                  placeholder="GUI-ICA-2026-901"
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-mono font-bold text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Fecha de la Movilización
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Placa del Vehículo / Camión
                </label>
                <input
                  type="text"
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  placeholder="Ej. WNK-452"
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-mono font-bold text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Conductor / Transportador
                </label>
                <input
                  type="text"
                  value={transporterName}
                  onChange={(e) => setTransporterName(e.target.value)}
                  placeholder="Nombre del transportador"
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Despachador en Finca
                </label>
                <input
                  type="text"
                  value={dispatcherName}
                  onChange={(e) => setDispatcherName(e.target.value)}
                  placeholder="Ej. Mayordomo Carlos"
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Receptor / Responsable Destino
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Ej. Administrador Luis"
                  className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer bg-[#e8f5e9] p-2.5 rounded-xl border border-[#a5d6a7]">
                <input
                  type="checkbox"
                  checked={sanitaryClearanceVerified}
                  onChange={(e) => setSanitaryClearanceVerified(e.target.checked)}
                  className="w-4 h-4 text-emerald-800 rounded"
                />
                <span className="text-[11px] font-bold text-emerald-950">
                  Certifico que el lote cumple con el tiempo de retiro sanitario de medicamentos y cuenta con vacunación vigente (Aftosa y Brucelosis).
                </span>
              </label>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
              Observaciones del Movimiento
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales del pesaje, precintos de seguridad del camión, condiciones de carga..."
              className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eeeeee] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-[#414844] font-bold text-xs hover:bg-[#f0f0f0] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0D1A13] hover:bg-[#123F2A] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#A5B8AC]" />
              Confirmar y Registrar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
