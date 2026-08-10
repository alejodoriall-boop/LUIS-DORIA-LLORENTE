import React, { useState } from 'react';
import {
  FarmDataPackage,
  LotRecord,
  ImportedAnimalRecord,
  AnimalOriginType,
  LotCategory,
  BrandingIron,
} from '../../types';
import {
  PlusCircle,
  X,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Tag,
  Dna,
  ShoppingBag,
  Award,
  Heart,
  DollarSign,
  Scale,
  FileText,
  UserCheck,
  AlertCircle,
  Hash,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface RegisterNewAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  lots: LotRecord[];
  animals?: ImportedAnimalRecord[];
  brandingIrons?: BrandingIron[];
  onSaveNewAnimal: (animalData: Partial<ImportedAnimalRecord>, targetLotId: string, targetFarmId: string) => void;
  onSaveNewLot?: (newLotData: any) => void;
}

const DEFAULT_SYSTEM_DAMS = [
  { tag: 'Vaca 402 - La Reina', breed: 'Brahman Blanco', reg: 'COL-402' },
  { tag: 'Vaca 102 - Lady Manso', breed: 'Gyr Leche', reg: 'COL-102' },
  { tag: 'Vaca 304 - Mariposa', breed: 'Simbrah', reg: 'COL-304' },
  { tag: 'Vaca 501 - La Esperanza', breed: 'Brahman Rojo', reg: 'COL-501' },
  { tag: 'Vaca 802 - Clara', breed: 'Guzerá', reg: 'COL-802' },
  { tag: 'Vaca 210 - Paloma', breed: 'Girolando', reg: 'COL-210' },
  { tag: 'Vaca 615 - Esmeralda', breed: 'Nelore', reg: 'COL-615' },
];

const DEFAULT_SYSTEM_SIRES = [
  { tag: 'Toro Don Pedro (B-12)', breed: 'Brahman Blanco', reg: 'COL-B12' },
  { tag: 'JDH Sir Liberty 45/9', breed: 'Brahman Importado', reg: 'US-882104' },
  { tag: 'Toro San Juan #88', breed: 'Brahman Rojo', reg: 'COL-88' },
  { tag: 'Pajilla IA - Mr. V8 380/6', breed: 'Semen IA Importado', reg: 'US-3806' },
  { tag: 'Pajilla IA - Sansao Gyr #2201', breed: 'Semen IA Leche', reg: 'BR-2201' },
  { tag: 'Toro El Rey #901', breed: 'Nelore Pura Sangre', reg: 'COL-901' },
];

export const RegisterNewAnimalModal: React.FC<RegisterNewAnimalModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  lots,
  animals = [],
  brandingIrons = [],
  onSaveNewAnimal,
}) => {
  const [entryMode, setEntryMode] = useState<'individual' | 'lote'>('individual');
  const [originType, setOriginType] = useState<AnimalOriginType>('nacido');
  const [selectedBrandingIronId, setSelectedBrandingIronId] = useState<string>('');

  // Common Selection
  const [selectedFarmId, setSelectedFarmId] = useState<string>(
    currentFarmId === 'all' ? farms[0]?.profile.id || 'finca-san-juan' : currentFarmId,
  );
  
  const activeFarmLots = lots.filter(
    (l) => l.farmId === selectedFarmId || selectedFarmId === 'all',
  );

  const [selectedLotId, setSelectedLotId] = useState<string>(
    activeFarmLots[0]?.id || lots[0]?.id || 'lot-1',
  );

  // System Animals Filtering
  const systemCows = animals.filter((a) => a.sex === 'hembra' || a.category === 'cria' || a.category === 'novilla');
  const systemBulls = animals.filter((a) => a.sex === 'macho' || a.category === 'ceba' || a.category === 'toro');

  // Basic Individual Form Fields
  const [tag, setTag] = useState<string>('ARE-9021');
  const [name, setName] = useState<string>('');
  const [sex, setSex] = useState<'macho' | 'hembra'>('hembra');
  const [breed, setBreed] = useState<string>('Brahman Blanco');
  const [category, setCategory] = useState<LotCategory>('cria');
  const [commercialDestination, setCommercialDestination] = useState<string>('lecheria');
  const [weightKg, setWeightKg] = useState<number>(220);
  const [ageMonths, setAgeMonths] = useState<number>(8);
  const [color, setColor] = useState<string>('Blanco / Gris');
  const [cattleType, setCattleType] = useState<string>('ganado_comercial');
  const [notes, setNotes] = useState<string>('');

  // 1. Nacido en Ganadería Fields
  const [damTag, setDamTag] = useState<string>('Vaca 402 - La Reina');
  const [sireTagOrBull, setSireTagOrBull] = useState<string>('Toro Don Pedro (B-12)');
  const [originFarmId, setOriginFarmId] = useState<string>(
    currentFarmId === 'all' ? farms[0]?.profile.id || 'finca-san-juan' : currentFarmId,
  );
  const [customOriginFarmName, setCustomOriginFarmName] = useState<string>('');
  const [birthError, setBirthError] = useState<string | null>(null);

  const [birthDate, setBirthDate] = useState<string>(
    new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [birthWeightKg, setBirthWeightKg] = useState<number>(34);
  const [earTagInitial, setEarTagInitial] = useState<string>('CHP-ORE-308');
  const [tattooNumber, setTattooNumber] = useState<string>('TAT-308');

  // 2. Comprado Fields
  const [supplierOrAuction, setSupplierOrAuction] = useState<string>('Subastar S.A. - Montería');
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [purchasePriceTotal, setPurchasePriceTotal] = useState<number>(2100000);
  const [purchasePricePerKg, setPurchasePricePerKg] = useState<number>(9500);
  const [purchaseWeightKg, setPurchaseWeightKg] = useState<number>(220);
  const [invoiceOrReceipt, setInvoiceOrReceipt] = useState<string>('FAC-88210');

  // 3. Puro con Registro Fields
  const [association, setAssociation] = useState<string>('Asocebú Colombia');
  const [registrationNumber, setRegistrationNumber] = useState<string>('REG-2026-99411');
  const [registeredName, setRegisteredName] = useState<string>('Don Gabriel F.R. 882/11');
  const [sireName, setSireName] = useState<string>('JDH Sir Liberty 45/9');
  const [sireReg, setSireReg] = useState<string>('US-882104');
  const [damName, setDamName] = useState<string>('Lady Manso 102/5');
  const [damReg, setDamReg] = useState<string>('COL-44120');
  const [maternalGrandSire, setMaternalGrandSire] = useState<string>('+ + Mr. V8 380/6');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedFarm = farms.find((f) => f.profile.id === selectedFarmId);
    const selectedLot = lots.find((l) => l.id === selectedLotId);

    const selectedIron = brandingIrons.find((i) => i.id === selectedBrandingIronId);

    const animalData: Partial<ImportedAnimalRecord> = {
      id: `anim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tag: tag.trim() || `ARE-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim() || undefined,
      sex,
      breed,
      category,
      commercialDestination,
      weightKg: Number(weightKg) || 0,
      ageMonths: Number(ageMonths) || 0,
      color,
      cattleType,
      brandingIronId: selectedIron?.id,
      brandingIronName: selectedIron?.name,
      brandingIronLocation: selectedIron?.bodyLocation,
      brandingIronSymbol: selectedIron?.symbolIcon,
      farmId: selectedFarmId,
      farmName: selectedFarm?.profile.name || 'Predio Principal',
      lotId: selectedLotId,
      lotCode: selectedLot?.code || 'LOTE-NEW',
      notes,
      originType,
      status: 'activo',
    };

    if (originType === 'nacido') {
      if (!damTag || !damTag.trim()) {
        setBirthError('La información de la madre es OBLIGATORIA para registrar un nacimiento.');
        return;
      }
      setBirthError(null);

      const selectedOriginFarmObj = farms.find((f) => f.profile.id === originFarmId);
      const finalOriginFarmName = originFarmId === 'custom'
        ? (customOriginFarmName.trim() || 'Predio de Origen')
        : (selectedOriginFarmObj?.profile.name || selectedFarm?.profile.name || 'Predio Principal');

      animalData.origin = `Nacido en ${finalOriginFarmName}`;
      animalData.bornInfo = {
        damTag: damTag.trim(),
        sireTagOrBull: sireTagOrBull.trim() || 'Sin padre registrado (Desconocido)',
        birthDate,
        birthWeightKg: Number(birthWeightKg),
        earTagInitial,
        tattooNumber,
        originFarmName: finalOriginFarmName,
      };
    } else if (originType === 'comprado') {
      animalData.origin = supplierOrAuction;
      animalData.pricePerKg = Number(purchasePricePerKg);
      animalData.totalPrice = Number(purchasePriceTotal);
      animalData.purchasedInfo = {
        supplierOrAuction,
        purchaseDate,
        purchasePriceTotal: Number(purchasePriceTotal),
        purchasePricePerKg: Number(purchasePricePerKg),
        purchaseWeightKg: Number(purchaseWeightKg),
        invoiceOrReceipt,
      };
    } else if (originType === 'puro_registro') {
      animalData.origin = `Registro de Pureza - ${association}`;
      animalData.purebredInfo = {
        association,
        registrationNumber,
        registeredName: registeredName || name || tag,
        sireName,
        sireReg,
        damName,
        damReg,
        maternalGrandSire,
      };
    }

    onSaveNewAnimal(animalData, selectedLotId, selectedFarmId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 md:p-6 border border-[#c1c8c2] shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#eeeeee] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1b4332] text-[#c1ecd4] rounded-2xl shadow-sm">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#012d1d]">Ingreso Nuevo a Inventario</h3>
              <p className="text-xs text-[#717973] font-medium">
                Alta individual o por lote con origen, genealogía y datos de compra
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
          {/* Top Mode Selector & Predio Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f4f6f4] p-3 rounded-2xl border border-[#e0e4e0]">
            <div>
              <label className="block text-[10px] font-bold text-[#79564b] uppercase mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Predio Destino
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
              >
                {farms.map((farm) => (
                  <option key={farm.profile.id} value={farm.profile.id}>
                    {farm.profile.name} ({farm.profile.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#79564b] uppercase mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Lote de Destino
              </label>
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
              >
                {activeFarmLots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name} ({lot.code}) - {lot.categoryLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Origen del Animal */}
          <div>
            <label className="block text-[11px] font-black text-[#012d1d] uppercase mb-2">
              Origen del Ingreso (Procedencia)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOriginType('nacido')}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                  originType === 'nacido'
                    ? 'border-[#1b4332] bg-[#e8f5e9] text-[#012d1d] font-bold shadow-xs'
                    : 'border-[#c1c8c2] bg-white text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <Heart className="w-5 h-5 text-[#2e7d32]" />
                <span className="text-[11px] leading-tight">Nacido en Ganadería</span>
              </button>

              <button
                type="button"
                onClick={() => setOriginType('comprado')}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                  originType === 'comprado'
                    ? 'border-[#0288d1] bg-[#e1f5fe] text-[#01579b] font-bold shadow-xs'
                    : 'border-[#c1c8c2] bg-white text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <ShoppingBag className="w-5 h-5 text-[#0288d1]" />
                <span className="text-[11px] leading-tight">Comprado / Subasta</span>
              </button>

              <button
                type="button"
                onClick={() => setOriginType('puro_registro')}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                  originType === 'puro_registro'
                    ? 'border-[#7b1fa2] bg-[#f3e5f5] text-[#4a148c] font-bold shadow-xs'
                    : 'border-[#c1c8c2] bg-white text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <Award className="w-5 h-5 text-[#7b1fa2]" />
                <span className="text-[11px] leading-tight">Puro con Registro</span>
              </button>
            </div>
          </div>

          {/* SECTION: Basic Identification */}
          <div className="p-3.5 bg-white border border-[#c1c8c2] rounded-2xl space-y-3">
            <h4 className="font-bold text-[#012d1d] text-xs flex items-center gap-1.5 border-b border-[#eeeeee] pb-2">
              <Tag className="w-4 h-4 text-[#1b4332]" /> Identificación y Datos Físicos
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  N° Arete / Chapeta *
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Ej. ARE-9021"
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-mono font-bold text-[#012d1d]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Nombre / Alias (Opcional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Princesa"
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-semibold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Sexo
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'macho' | 'hembra')}
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-bold"
                >
                  <option value="hembra">Hembra ♀</option>
                  <option value="macho">Macho ♂</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#012d1d] uppercase mb-1">
                  Tipo / Pureza *
                </label>
                <select
                  value={cattleType}
                  onChange={(e) => setCattleType(e.target.value)}
                  className="w-full bg-[#f4fbf6] border border-emerald-500 rounded-xl px-2.5 py-1.5 font-bold text-[#012d1d] text-xs"
                >
                  <option value="comercial">🐮 Comercial</option>
                  <option value="puro_comercial">🐄 Puro Comercial</option>
                  <option value="puro_registrable">📜 Puro / Registrable</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Raza / Cruce *
                </label>
                <select
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-semibold text-xs"
                >
                  <option value="Brahman Blanco">Brahman Blanco</option>
                  <option value="Brahman Rojo">Brahman Rojo</option>
                  <option value="Gyr Lechero">Gyr Lechero</option>
                  <option value="Nelore">Nelore</option>
                  <option value="Guzerá">Guzerá</option>
                  <option value="Brangus">Brangus</option>
                  <option value="Simbrah">Simbrah</option>
                  <option value="Holstein">Holstein</option>
                  <option value="Jerthol / Jersey">Jerthol / Jersey</option>
                  <option value="Girolando">Girolando</option>
                  <option value="F1 / F2">F1 / F2</option>
                  <option value="Siete Colores">Siete Colores</option>
                  <option value="Criollo Romosinuano">Criollo Romosinuano</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Color / Pelaje *
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-semibold text-xs"
                >
                  <option value="Blanco / Gris">⚪ Blanco / Gris</option>
                  <option value="Rojo / Sardo">🔴 Rojo / Sardo</option>
                  <option value="Bayo / Amarillo">🟡 Bayo / Amarillo</option>
                  <option value="Negro / Arrebolado">⚫ Negro / Arrebolado</option>
                  <option value="Hosco / Chorreado">🟤 Hosco / Chorreado</option>
                  <option value="Pintado / Overo">⚪🔴 Pintado / Overo</option>
                  <option value="Flor de Durazno / Café">🌸 Flor de Durazno / Café</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#b71c1c] uppercase mb-1 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#e65100]" />
                  Hierro / Marca a Fuego
                </label>
                <select
                  value={selectedBrandingIronId}
                  onChange={(e) => setSelectedBrandingIronId(e.target.value)}
                  className="w-full bg-[#fffde7] border border-[#fbc02d] rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#3e2723]"
                >
                  <option value="">-- Sin Hierro Asignado --</option>
                  {brandingIrons.map((iron) => (
                    <option key={iron.id} value={iron.id}>
                      {iron.symbolIcon || '🔥'} {iron.name} ({iron.code}) - {iron.bodyLocation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LotCategory)}
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-bold text-xs"
                >
                  <option value="cria">Cría / Levante</option>
                  <option value="ceba">Ceba Comercial</option>
                  <option value="leche">Lechería / Ordeño</option>
                  <option value="genetica">Registrados / Pureza</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#012d1d] uppercase mb-1 flex items-center gap-1">
                  Destino Comercial *
                </label>
                <select
                  value={commercialDestination}
                  onChange={(e) => setCommercialDestination(e.target.value)}
                  className="w-full bg-[#e8f5ec] border border-[#c1ecd4] text-[#012d1d] rounded-xl px-2.5 py-1.5 font-bold text-xs"
                >
                  <option value="lecheria">🥛 Lechería Especializada</option>
                  <option value="doble_proposito">🥛🥩 Doble Propósito</option>
                  <option value="ceba_carne">🥩 Ceba Comercial</option>
                  <option value="cria_levante">🍼 Cría & Levante</option>
                  <option value="genetica_reproductor">🏆 Genética & Reproductor</option>
                  <option value="reemplazo_finca">🌾 Reemplazo Finca</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Peso Entrada (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-mono font-bold text-[#012d1d]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Edad (Meses)
                </label>
                <input
                  type="number"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(Number(e.target.value))}
                  className="w-full bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl px-3 py-1.5 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC ORIGIN DETAILS */}
          {originType === 'nacido' && (
            <div className="p-4 bg-[#e8f5e9]/90 border-2 border-[#a5d6a7] rounded-2xl space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#a5d6a7] pb-2">
                <h4 className="font-bold text-[#1b5e20] text-xs flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#2e7d32]" /> Registro de Nacimiento & Trazabilidad Genealógica
                </h4>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[#2e7d32] text-white">
                  Carga del Sistema
                </span>
              </div>

              {birthError && (
                <div className="p-2.5 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{birthError}</span>
                </div>
              )}

              {/* 1. PREDIO DE ORIGEN (DÓNDE NACIÓ) */}
              <div className="bg-white p-3 rounded-xl border border-[#a5d6a7] space-y-1.5">
                <label className="block text-[10.5px] font-black text-[#1b5e20] uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#2e7d32]" />
                    Predio de Origen (Dónde Nació) *
                  </span>
                  <span className="text-[9.5px] bg-[#c1ecd4] text-[#012d1d] font-bold px-2 py-0.5 rounded-full">
                    Lugar de Nacimiento
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={originFarmId}
                    onChange={(e) => {
                      setOriginFarmId(e.target.value);
                      setBirthError(null);
                    }}
                    className="w-full bg-[#f9fbf9] border border-[#a5d6a7] rounded-xl px-3 py-2 font-bold text-[#012d1d] text-xs"
                  >
                    {farms.map((f) => (
                      <option key={f.profile.id} value={f.profile.id}>
                        🏡 {f.profile.name} ({f.profile.municipality}, {f.profile.department})
                      </option>
                    ))}
                    <option value="custom">✍️ Otro Predio / Finca de Origen Diferente...</option>
                  </select>

                  {originFarmId === 'custom' && (
                    <input
                      type="text"
                      value={customOriginFarmName}
                      onChange={(e) => setCustomOriginFarmName(e.target.value)}
                      placeholder="Escriba el nombre del predio de origen..."
                      className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  )}
                </div>
              </div>

              {/* 2. INF DE LA MADRE (CARGA DEL SISTEMA - OBLIGATORIO) & INF DEL PADRE (CARGA DEL SISTEMA - OPCIONAL) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* MADRE - OBLIGATORIO */}
                <div className="bg-white p-3 rounded-xl border-2 border-emerald-600/70 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10.5px] font-black text-[#012d1d] uppercase flex items-center gap-1">
                      <Dna className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Información de la Madre *</span>
                    </label>
                    <span className="text-[9px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Obligatorio
                    </span>
                  </div>

                  <p className="text-[10px] text-[#555] font-medium">
                    Seleccione una vaca/matriz del sistema o digite el arete.
                  </p>

                  <select
                    value={damTag}
                    onChange={(e) => {
                      setDamTag(e.target.value);
                      setBirthError(null);
                    }}
                    className="w-full bg-[#f4fbf6] border border-emerald-500 rounded-xl px-3 py-2 font-bold text-[#012d1d] text-xs"
                  >
                    <option value="">-- Seleccionar Madre del Sistema --</option>
                    {systemCows.length > 0 && (
                      <optgroup label="Carga de Sistema (Inventario Activo)">
                        {systemCows.map((c) => (
                          <option key={c.id || c.tag} value={`${c.tag} ${c.name ? `(${c.name})` : ''}`}>
                            🐮 #{c.tag} {c.name ? `- ${c.name}` : ''} ({c.breed || 'Hembra'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Matrices Principales Registradas">
                      {DEFAULT_SYSTEM_DAMS.map((d) => (
                        <option key={d.tag} value={d.tag}>
                          🐮 #{d.tag} - {d.breed}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  <div className="pt-1">
                    <span className="text-[9.5px] font-bold text-[#717973] block mb-1">
                      O digite manualmente la madre:
                    </span>
                    <input
                      type="text"
                      value={damTag}
                      onChange={(e) => {
                        setDamTag(e.target.value);
                        setBirthError(null);
                      }}
                      placeholder="Ej. Vaca 402 - La Reina"
                      className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-bold text-[#012d1d] text-xs"
                      required
                    />
                  </div>
                </div>

                {/* PADRE - OPCIONAL */}
                <div className="bg-white p-3 rounded-xl border border-[#a5d6a7] space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10.5px] font-black text-[#012d1d] uppercase flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Información del Padre</span>
                    </label>
                    <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Opcional (Sin trazabilidad)
                    </span>
                  </div>

                  <p className="text-[10px] text-[#555] font-medium">
                    Seleccione un toro o semen. Dejar en blanco si no se cuenta con trazabilidad.
                  </p>

                  <select
                    value={sireTagOrBull}
                    onChange={(e) => setSireTagOrBull(e.target.value)}
                    className="w-full bg-[#fbfbfe] border border-[#a5d6a7] rounded-xl px-3 py-2 font-bold text-[#012d1d] text-xs"
                  >
                    <option value="Sin padre registrado (Desconocido)">
                      ❓ Sin padre registrado (Desconocido / Sin trazabilidad)
                    </option>
                    {systemBulls.length > 0 && (
                      <optgroup label="Carga de Sistema (Toros Activos)">
                        {systemBulls.map((b) => (
                          <option key={b.id || b.tag} value={`${b.tag} ${b.name ? `(${b.name})` : ''}`}>
                            🐂 #{b.tag} {b.name ? `- ${b.name}` : ''} ({b.breed || 'Toro'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Toros & Pajillas IA del Sistema">
                      {DEFAULT_SYSTEM_SIRES.map((s) => (
                        <option key={s.tag} value={s.tag}>
                          🐂 {s.tag} - {s.breed}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  <div className="pt-1">
                    <span className="text-[9.5px] font-bold text-[#717973] block mb-1">
                      O digite el toro / pajilla de semen:
                    </span>
                    <input
                      type="text"
                      value={sireTagOrBull}
                      onChange={(e) => setSireTagOrBull(e.target.value)}
                      placeholder="Ej. Toro Don Pedro (B-12) / Pajilla JDH"
                      className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-bold text-[#012d1d] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. FECHA, PESO AL NACER Y IDENTIFICACIÓN */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#2e7d32] uppercase mb-1">
                    📅 Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-bold text-[#012d1d]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#2e7d32] uppercase mb-1">
                    ⚖️ Peso al Nacer (kg) *
                  </label>
                  <input
                    type="number"
                    value={birthWeightKg}
                    onChange={(e) => setBirthWeightKg(Number(e.target.value))}
                    placeholder="34"
                    className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-mono font-black text-[#1b5e20]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#2e7d32] uppercase mb-1">
                    🏷️ Marca / Chapeta Inicial *
                  </label>
                  <input
                    type="text"
                    value={earTagInitial}
                    onChange={(e) => setEarTagInitial(e.target.value)}
                    placeholder="Ej. CHP-ORE-308"
                    className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-mono font-bold text-[#012d1d]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2e7d32] uppercase mb-1">
                  🖋️ Tatuaje Inicial en Oreja (Opcional)
                </label>
                <input
                  type="text"
                  value={tattooNumber}
                  onChange={(e) => setTattooNumber(e.target.value)}
                  placeholder="Ej. TAT-308 (Tatuaje pinza oreja izquierda)"
                  className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {originType === 'comprado' && (
            <div className="p-3.5 bg-[#e1f5fe]/60 border border-[#81d4fa] rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="font-bold text-[#01579b] text-xs flex items-center gap-1.5 border-b border-[#81d4fa]/60 pb-2">
                <ShoppingBag className="w-4 h-4 text-[#0288d1]" /> Datos de la Comercialización / Compra
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#0288d1] uppercase mb-1">
                    Proveedor / Subasta
                  </label>
                  <input
                    type="text"
                    value={supplierOrAuction}
                    onChange={(e) => setSupplierOrAuction(e.target.value)}
                    placeholder="Ej. Subastar S.A. / Ganadería El Porvenir"
                    className="w-full bg-white border border-[#81d4fa] rounded-xl px-3 py-1.5 font-semibold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#0288d1] uppercase mb-1">
                    Fecha de Compra
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-white border border-[#81d4fa] rounded-xl px-3 py-1.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#0288d1] uppercase mb-1">
                    Precio Total ($ COP)
                  </label>
                  <input
                    type="number"
                    value={purchasePriceTotal}
                    onChange={(e) => {
                      const tot = Number(e.target.value);
                      setPurchasePriceTotal(tot);
                      if (weightKg > 0) setPurchasePricePerKg(Math.round(tot / weightKg));
                    }}
                    className="w-full bg-white border border-[#81d4fa] rounded-xl px-3 py-1.5 font-mono font-bold text-[#01579b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#0288d1] uppercase mb-1">
                    Precio por Kg ($)
                  </label>
                  <input
                    type="number"
                    value={purchasePricePerKg}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setPurchasePricePerKg(p);
                      if (weightKg > 0) setPurchasePriceTotal(p * weightKg);
                    }}
                    className="w-full bg-white border border-[#81d4fa] rounded-xl px-3 py-1.5 font-mono font-bold text-[#01579b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#0288d1] uppercase mb-1">
                    N° Guía / Factura
                  </label>
                  <input
                    type="text"
                    value={invoiceOrReceipt}
                    onChange={(e) => setInvoiceOrReceipt(e.target.value)}
                    placeholder="FAC-8812"
                    className="w-full bg-white border border-[#81d4fa] rounded-xl px-3 py-1.5 font-semibold text-[#012d1d]"
                  />
                </div>
              </div>
            </div>
          )}

          {originType === 'puro_registro' && (
            <div className="p-3.5 bg-[#f3e5f5]/60 border border-[#ce93d8] rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="font-bold text-[#4a148c] text-xs flex items-center gap-1.5 border-b border-[#ce93d8]/60 pb-2">
                <Award className="w-4 h-4 text-[#7b1fa2]" /> Registro de Genealogía y Pureza
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#7b1fa2] uppercase mb-1">
                    Asociación de Raza
                  </label>
                  <input
                    type="text"
                    value={association}
                    onChange={(e) => setAssociation(e.target.value)}
                    placeholder="Ej. Asocebú / ASOHOLSTEIN"
                    className="w-full bg-white border border-[#ce93d8] rounded-xl px-3 py-1.5 font-semibold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7b1fa2] uppercase mb-1">
                    N° Registro Oficial *
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="REG-2026-001"
                    className="w-full bg-white border border-[#ce93d8] rounded-xl px-3 py-1.5 font-mono font-bold text-[#4a148c]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#7b1fa2] uppercase mb-1">
                  Nombre Oficial Registrado
                </label>
                <input
                  type="text"
                  value={registeredName}
                  onChange={(e) => setRegisteredName(e.target.value)}
                  placeholder="Ej. Don Gabriel F.R. 882/11"
                  className="w-full bg-white border border-[#ce93d8] rounded-xl px-3 py-1.5 font-bold text-[#012d1d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#7b1fa2] uppercase mb-1">
                    Padre y N° Registro
                  </label>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={sireName}
                      onChange={(e) => setSireName(e.target.value)}
                      placeholder="Nombre del Padre"
                      className="w-full bg-white border border-[#ce93d8] rounded-xl px-3 py-1 font-medium text-xs"
                    />
                    <input
                      type="text"
                      value={sireReg}
                      onChange={(e) => setSireReg(e.target.value)}
                      placeholder="Reg Padre (ej. US-8812)"
                      className="w-full bg-white border border-[#ce93d8] rounded-xl px-3 py-1 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7b1fa2] uppercase mb-1">
                    Madre y N° Registro
                  </label>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={damName}
                      onChange={(e) => setDamName(e.target.value)}
                      placeholder="Nombre de la Madre"
                      className="w-full bg-white border border-[#ce93d8] rounded-xl px-3 py-1 font-medium text-xs"
                    />
                    <input
                      type="text"
                      value={damReg}
                      onChange={(e) => setDamReg(e.target.value)}
                      placeholder="Reg Madre (ej. COL-4011)"
                      className="w-full bg-white border border-[#ce93d8] rounded-xl px-3 py-1 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Observations */}
          <div>
            <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
              Notas y Observaciones
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones de ingreso, estado sanitario, hierro o marcas de la finca..."
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
              Guardar Ingreso a Inventario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
