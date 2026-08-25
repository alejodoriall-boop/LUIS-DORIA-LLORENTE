import React, { useState } from 'react';
import {
  FarmDataPackage,
  LotRecord,
  ImportedAnimalRecord,
  AnimalOriginType,
  LotCategory,
  BrandingIron,
  BirthDeliveryType,
  CalvingCondition,
  ConceptionMethod,
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
  Baby,
  Stethoscope,
  MapPin,
  Clock,
  Zap,
  Lock,
} from 'lucide-react';
import { getSavedFarmNumberingPolicy, generateNextAnimalTag, validateAnimalTagAgainstPolicy } from '../../utils/numberingPolicyEngine';

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
  const activePolicy = getSavedFarmNumberingPolicy(selectedFarmId);
  const [tag, setTag] = useState<string>(() => generateNextAnimalTag(activePolicy, { gender: 'hembra' }));
  const [rfidTag, setRfidTag] = useState<string>('982 000 412 884 102');
  const [siniganTag, setSiniganTag] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [sex, setSex] = useState<'macho' | 'hembra'>('hembra');
  const [breed, setBreed] = useState<string>('Brahman Blanco');
  const [purityPct, setPurityPct] = useState<string>('100% Puro (Registro)');
  const [category, setCategory] = useState<LotCategory>('cria');
  const [commercialDestination, setCommercialDestination] = useState<string>('cria_levante');
  const [weightKg, setWeightKg] = useState<number>(35);
  const [ageMonths, setAgeMonths] = useState<number>(0);
  const [color, setColor] = useState<string>('Blanco / Gris');
  const [cattleType, setCattleType] = useState<string>('comercial');
  const [notes, setNotes] = useState<string>('');

  // 1. Nacido en Ganadería - 4 Módulos
  // Identificación y Datos Básicos
  const [birthDate, setBirthDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [birthTime, setBirthTime] = useState<string>('06:30');

  // Datos del Parto y Ternero
  const [birthWeightKg, setBirthWeightKg] = useState<number>(35);
  const [deliveryType, setDeliveryType] = useState<BirthDeliveryType>('eutocico');
  const [calvingCondition, setCalvingCondition] = useState<CalvingCondition>('simple');
  const [vigorScore, setVigorScore] = useState<number>(5);

  // Genealogía
  const [damTag, setDamTag] = useState<string>('Vaca 402 - La Reina');
  const [surrogateDamTag, setSurrogateDamTag] = useState<string>('');
  const [sireTagOrBull, setSireTagOrBull] = useState<string>('Toro Don Pedro (B-12)');
  const [conceptionMethod, setConceptionMethod] = useState<ConceptionMethod>('monta_natural');

  // Manejo Inicial y Ubicación
  const [colostrumFed, setColostrumFed] = useState<boolean>(true);
  const [colostrumHoursPostCalving, setColostrumHoursPostCalving] = useState<number>(2);
  const [navelDisinfected, setNavelDisinfected] = useState<boolean>(true);
  const [initialTreatments, setInitialTreatments] = useState<string>('Hierro dextrano 2ml + Complejo B + Selenio');
  const [originFarmId, setOriginFarmId] = useState<string>(
    currentFarmId === 'all' ? farms[0]?.profile.id || 'finca-san-juan' : currentFarmId,
  );
  const [customOriginFarmName, setCustomOriginFarmName] = useState<string>('');
  const [maternityPaddockId, setMaternityPaddockId] = useState<string>('');
  const [operatorResponsible, setOperatorResponsible] = useState<string>('Carlos Mendoza (Mayordomo / Operario)');
  const [earTagInitial, setEarTagInitial] = useState<string>('CHP-ORE-308');
  const [tattooNumber, setTattooNumber] = useState<string>('TAT-308');
  const [birthError, setBirthError] = useState<string | null>(null);

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
      weightKg: originType === 'nacido' ? (Number(birthWeightKg) || 35) : (Number(weightKg) || 0),
      ageMonths: originType === 'nacido' ? 0 : (Number(ageMonths) || 0),
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
        setBirthError('La información de la MADRE Biológica es obligatoria para registrar un nacimiento.');
        return;
      }
      setBirthError(null);

      const selectedOriginFarmObj = farms.find((f) => f.profile.id === originFarmId);
      const finalOriginFarmName = originFarmId === 'custom'
        ? (customOriginFarmName.trim() || 'Predio de Origen')
        : (selectedOriginFarmObj?.profile.name || selectedFarm?.profile.name || 'Predio Principal');

      const targetPaddocks = selectedOriginFarmObj?.paddocks || selectedFarm?.paddocks || [];
      const maternityPad = targetPaddocks.find((p) => p.id === maternityPaddockId);
      const maternityName = maternityPad ? `${maternityPad.code} - ${maternityPad.name}` : undefined;

      animalData.origin = `Nacido en ${finalOriginFarmName}`;
      animalData.bornInfo = {
        tag: tag.trim() || `ARE-${Math.floor(1000 + Math.random() * 9000)}`,
        rfidTag: rfidTag.trim() || undefined,
        damTag: damTag.trim(),
        surrogateDamTag: surrogateDamTag.trim() || undefined,
        sireTagOrBull: sireTagOrBull.trim() || 'Sin padre registrado (Desconocido)',
        birthDate,
        birthTime,
        birthWeightKg: Number(birthWeightKg) || 35,
        sex,
        breed,
        purityPct,
        color,
        brandingIronId: selectedIron?.id,
        brandingIronName: selectedIron?.name,
        deliveryType,
        calvingCondition,
        vigorScore,
        conceptionMethod,
        colostrumFed,
        colostrumHoursPostCalving: Number(colostrumHoursPostCalving) || 2,
        navelDisinfected,
        initialTreatments,
        originFarmId,
        originFarmName: finalOriginFarmName,
        paddockMaternityName: maternityName,
        operatorResponsible,
        earTagInitial,
        tattooNumber,
        notes,
      };
    } else if (originType === 'comprado') {
      animalData.origin = supplierOrAuction;
      animalData.pricePerKg = Number(purchasePricePerKg);
      animalData.totalPrice = Number(purchasePriceTotal);
      animalData.weightKg = Number(purchaseWeightKg) || Number(weightKg) || 0;
      animalData.purchasedInfo = {
        supplierOrAuction,
        purchaseDate,
        purchasePriceTotal: Number(purchasePriceTotal),
        purchasePricePerKg: Number(purchasePricePerKg),
        purchaseWeightKg: Number(purchaseWeightKg) || Number(weightKg) || 0,
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-3xl max-w-4xl lg:max-w-5xl w-full p-5 md:p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#eeeeee] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#123F2A] text-[#A5B8AC] rounded-2xl shadow-sm">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Ingreso Nuevo a Inventario</h3>
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
                className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-2 font-bold text-white"
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
                className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-2 font-bold text-white"
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
            <label className="block text-[11px] font-black text-white uppercase mb-2">
              Origen del Ingreso (Procedencia)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOriginType('nacido')}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                  originType === 'nacido'
                    ? 'border-[#1b4332] bg-[#e8f5e9] text-white font-bold shadow-xs'
                    : 'border-white/10 bg-[#15241C] text-[#717973] hover:bg-[#f9f9f9]'
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
                    : 'border-white/10 bg-[#15241C] text-[#717973] hover:bg-[#f9f9f9]'
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
                    : 'border-white/10 bg-[#15241C] text-[#717973] hover:bg-[#f9f9f9]'
                }`}
              >
                <Award className="w-5 h-5 text-[#7b1fa2]" />
                <span className="text-[11px] leading-tight">Puro con Registro</span>
              </button>
            </div>
          </div>

          {/* SECTION: Basic Identification (For Comprado and Puro Registro) */}
          {originType !== 'nacido' && (
            <div className="p-3.5 bg-[#15241C] border border-white/10 rounded-2xl space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-[#eeeeee] pb-2">
                <Tag className="w-4 h-4 text-[#1b4332]" /> Identificación y Datos Físicos
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-[#717973] uppercase">
                      N° Arete / Chapeta *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const refreshedTag = generateNextAnimalTag(activePolicy, {
                          gender: sex,
                          eventDate: new Date(),
                        });
                        setTag(refreshedTag);
                      }}
                      className="text-[9px] text-emerald-800 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded hover:bg-emerald-100 cursor-pointer"
                    >
                      Sugerir
                    </button>
                  </div>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Ej. ARE-9021"
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-mono font-bold text-white"
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
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                    Sexo
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'macho' | 'hembra')}
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-bold"
                  >
                    <option value="hembra">Hembra ♀</option>
                    <option value="macho">Macho ♂</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-white uppercase mb-1">
                    Tipo / Pureza *
                  </label>
                  <select
                    value={cattleType}
                    onChange={(e) => setCattleType(e.target.value)}
                    className="w-full bg-[#f4fbf6] border border-emerald-500 rounded-xl px-2.5 py-1.5 font-bold text-white text-xs"
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
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-semibold text-xs"
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
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-2.5 py-1.5 font-semibold text-xs"
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
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-xs"
                  >
                    <option value="cria">Cría / Levante</option>
                    <option value="ceba">Ceba Comercial</option>
                    <option value="leche">Lechería / Ordeño</option>
                    <option value="genetica">Registrados / Pureza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white uppercase mb-1 flex items-center gap-1">
                    Destino Comercial *
                  </label>
                  <select
                    value={commercialDestination}
                    onChange={(e) => setCommercialDestination(e.target.value)}
                    className="w-full bg-[#e8f5ec] border border-[#c1ecd4] text-white rounded-xl px-2.5 py-1.5 font-bold text-xs"
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
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-mono font-bold text-white"
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
                    className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DATOS DE COMERCIALIZACIÓN / COMPRA (Solo para Comprado) */}
          {originType === 'comprado' && (
            <div className="p-4 bg-[#f0f7ff] border border-[#90caf9] rounded-2xl space-y-3 animate-in fade-in shadow-xs">
              <div className="flex items-center justify-between border-b border-[#bbdefb] pb-2">
                <h4 className="font-bold text-[#0d47a1] text-xs flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#1976d2]" />
                  <span>Datos de la Comercialización / Compra</span>
                </h4>
                <span className="text-[10px] font-bold text-[#1565c0] bg-[#15241C] px-2.5 py-0.5 rounded-full border border-[#90caf9]">
                  Transacción Comercial & Proveedor
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1565c0] uppercase mb-1">
                    Proveedor / Subasta / Vendedor *
                  </label>
                  <input
                    type="text"
                    value={supplierOrAuction}
                    onChange={(e) => setSupplierOrAuction(e.target.value)}
                    placeholder="Ej. Subastar S.A. / Ganadería El Porvenir"
                    className="w-full bg-[#15241C] border border-[#90caf9] rounded-xl px-3 py-1.5 font-bold text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1565c0] uppercase mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#1976d2]" />
                    Fecha de Compra *
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-[#15241C] border border-[#90caf9] rounded-xl px-3 py-1.5 font-bold text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1565c0] uppercase mb-1">
                    Precio Total ($ COP)
                  </label>
                  <input
                    type="number"
                    value={purchasePriceTotal}
                    onChange={(e) => {
                      const tot = Number(e.target.value);
                      setPurchasePriceTotal(tot);
                      const currentWeight = purchaseWeightKg || weightKg || birthWeightKg || 1;
                      if (currentWeight > 0) setPurchasePricePerKg(Math.round(tot / currentWeight));
                    }}
                    className="w-full bg-[#15241C] border border-[#90caf9] rounded-xl px-3 py-1.5 font-mono font-bold text-[#0d47a1] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1565c0] uppercase mb-1">
                    Precio por Kg ($)
                  </label>
                  <input
                    type="number"
                    value={purchasePricePerKg}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setPurchasePricePerKg(p);
                      const currentWeight = purchaseWeightKg || weightKg || birthWeightKg || 1;
                      if (currentWeight > 0) setPurchasePriceTotal(Math.round(p * currentWeight));
                    }}
                    className="w-full bg-[#15241C] border border-[#90caf9] rounded-xl px-3 py-1.5 font-mono font-bold text-[#0d47a1] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1565c0] uppercase mb-1">
                    Peso Compra / Entrada (kg)
                  </label>
                  <input
                    type="number"
                    value={purchaseWeightKg}
                    onChange={(e) => {
                      const w = Number(e.target.value);
                      setPurchaseWeightKg(w);
                      setWeightKg(w);
                      setBirthWeightKg(w);
                      if (purchasePricePerKg > 0) setPurchasePriceTotal(Math.round(purchasePricePerKg * w));
                    }}
                    className="w-full bg-[#15241C] border border-[#90caf9] rounded-xl px-3 py-1.5 font-mono font-bold text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1565c0] uppercase mb-1">
                    N° Guía / Factura ICA
                  </label>
                  <input
                    type="text"
                    value={invoiceOrReceipt}
                    onChange={(e) => setInvoiceOrReceipt(e.target.value)}
                    placeholder="FAC-8812 / GSMI-904"
                    className="w-full bg-[#15241C] border border-[#90caf9] rounded-xl px-3 py-1.5 font-semibold text-white text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC ORIGIN DETAILS: 4 MÓDULOS ZOOTÉCNICOS COMPLETOS (Solo para Nacido en Ganadería) */}
          {originType === 'nacido' && (
            <div className="space-y-4 animate-in fade-in">
              {birthError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{birthError}</span>
                </div>
              )}

              {/* 1. IDENTIFICACIÓN Y DATOS BÁSICOS */}
              <div className="p-4 bg-[#15241C] border border-white/10 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#123F2A] text-white flex items-center justify-center text-[10px] font-mono">1</span>
                    <Tag className="w-4 h-4 text-[#1b4332]" />
                    <span>1. Identificación y Datos Básicos</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-[#2e7d32] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full">
                    Arete / RFID / Pelaje / Raza / Hierro
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-[#717973] uppercase">
                        ID / Chapeta Oficial Interna *
                      </label>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        {activePolicy.isLocked && <Lock className="w-2.5 h-2.5 text-amber-700" />}
                        {activePolicy.policyType === 'SEASONAL_TRIMESTER_YEAR'
                          ? 'Estacional'
                          : activePolicy.policyType === 'GENDER_CATEGORIZED_YEAR'
                          ? 'Mixto Sexo'
                          : activePolicy.policyType === 'CUSTOM_LEGACY_ADOPTION'
                          ? 'Adopción'
                          : 'Cronológico'}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Ej. ARE-9021 / CO-089201"
                        className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-mono font-bold text-white text-sm pr-16"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const refreshedTag = generateNextAnimalTag(activePolicy, {
                            gender: sex,
                            eventDate: new Date(birthDate),
                          });
                          setTag(refreshedTag);
                        }}
                        title="Generar ID según política activa"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-2 py-1 rounded-lg transition cursor-pointer"
                      >
                        Sugerir
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Chip / Botón RFID (Opcional)
                    </label>
                    <input
                      type="text"
                      value={rfidTag}
                      onChange={(e) => setRfidTag(e.target.value)}
                      placeholder="Ej. 982 000 412 884 102"
                      className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-mono font-semibold text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#1b4332]" /> {originType === 'nacido' ? 'Fecha de Nacimiento *' : 'Fecha de Nacimiento / Parto'}
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-white text-xs"
                      required={originType === 'nacido'}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#1b4332]" /> Hora del Parto
                    </label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Sexo *
                    </label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value as 'macho' | 'hembra')}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-xs"
                    >
                      <option value="hembra">Hembra ♀ (Ternera / Novilla / Vaca)</option>
                      <option value="macho">Macho ♂ (Ternero / Novillo / Toro)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Nombre / Alias
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Estrella Naciente"
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-semibold text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-[#f0f0f0]">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Raza *
                    </label>
                    <select
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1.5 font-semibold text-xs"
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
                      Composición / % de Cruce
                    </label>
                    <select
                      value={purityPct}
                      onChange={(e) => setPurityPct(e.target.value)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1.5 font-semibold text-xs"
                    >
                      <option value="100% Puro (Registro)">100% Puro (Registro)</option>
                      <option value="Puro Comercial">Puro Comercial</option>
                      <option value="F1 (50% / 50%)">F1 (50% / 50%)</option>
                      <option value="3/4 Cruce">3/4 Cruce</option>
                      <option value="7/8 Cruce">7/8 Cruce</option>
                      <option value="Trihíbrido Comercial">Trihíbrido Comercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Color / Pelaje *
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1.5 font-semibold text-xs"
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
                </div>
              </div>

              {/* 2. DATOS DEL PARTO Y TERNERO */}
              <div className="p-4 bg-[#15241C] border border-white/10 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#123F2A] text-white flex items-center justify-center text-[10px] font-mono">2</span>
                    <Baby className="w-4 h-4 text-[#1b4332]" />
                    <span>2. Datos del Parto y Ternero</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-[#0277bd] bg-[#e1f5fe] px-2.5 py-0.5 rounded-full">
                    Peso al Nacer / Tipo de Parto / Condición / Vigor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      ⚖️ {originType === 'nacido' ? 'Peso al Nacer (kg) *' : 'Peso al Nacer / Peso Entrada (kg)'}
                    </label>
                    <input
                      type="number"
                      value={birthWeightKg}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBirthWeightKg(val);
                        if (originType === 'comprado') {
                          setWeightKg(val);
                          setPurchaseWeightKg(val);
                        }
                      }}
                      placeholder="35"
                      className="w-full bg-[#15241C] border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-mono font-black text-[#1b5e20] text-sm"
                      required={originType === 'nacido'}
                    />
                    <span className="text-[9.5px] text-[#717973] mt-1 block">Rango típico bovino: 28 - 45 kg</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      🩺 Tipo de Parto *
                    </label>
                    <select
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value as BirthDeliveryType)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-xs text-white"
                    >
                      <option value="eutocico">🟢 Eutócico (Normal / Sin Asistencia)</option>
                      <option value="asistido">🟡 Asistido / Distócico (Tracción manual)</option>
                      <option value="cesarea">🔴 Cesárea Quirúrgica</option>
                      <option value="mortinato">⚫ Mortinato (Nacido muerto)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      👥 Condición del Parto *
                    </label>
                    <select
                      value={calvingCondition}
                      onChange={(e) => setCalvingCondition(e.target.value as CalvingCondition)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-xs text-white"
                    >
                      <option value="simple">Cría Simple (1 Ternero)</option>
                      <option value="multiple">Cría Múltiple (Mellizos / Gemelos)</option>
                    </select>
                  </div>
                </div>

                {/* VIGOR SCORE (1-5) */}
                <div className="bg-[#fcfdfc] p-3 rounded-xl border border-[#e0e0e0] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10.5px] font-bold text-white uppercase flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Vigor / Nivel de Vitalidad (Escala 1 a 5) *</span>
                    </label>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      vigorScore >= 4 ? 'bg-emerald-100 text-emerald-800' : vigorScore === 3 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vigorScore === 5 && '🌟 Nivel 5: Excelente (Se levanta y mama < 30min)'}
                      {vigorScore === 4 && '👍 Nivel 4: Bueno (Activo, reflejo de succión fuerte)'}
                      {vigorScore === 3 && '⚠️ Nivel 3: Regular (Lento, requiere estímulo)'}
                      {vigorScore === 2 && '🚨 Nivel 2: Débil (Hipotérmico / Succión débil)'}
                      {vigorScore === 1 && '🛑 Nivel 1: Crítico (Requiere reanimación)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setVigorScore(score)}
                        className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center gap-0.5 transition-all cursor-pointer border ${
                          vigorScore === score
                            ? 'bg-[#123F2A] text-white border-[#1b4332] shadow-sm scale-[1.02]'
                            : 'bg-[#15241C] text-[#717973] border-white/10 hover:bg-[#123F2A]/60'
                        }`}
                      >
                        <span className="text-sm">{score === 5 ? '⭐⭐⭐⭐⭐' : score === 4 ? '⭐⭐⭐⭐' : score === 3 ? '⭐⭐⭐' : score === 2 ? '⭐⭐' : '⭐'}</span>
                        <span className="font-mono text-[11px]">Grado {score}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. GENEALOGÍA */}
              <div className="p-4 bg-[#15241C] border border-white/10 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#123F2A] text-white flex items-center justify-center text-[10px] font-mono">3</span>
                    <Dna className="w-4 h-4 text-[#1b4332]" />
                    <span>3. Genealogía</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-[#6a1b9a] bg-[#f3e5f5] px-2.5 py-0.5 rounded-full">
                    Madres & Padre & Método de Concepción
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* MADRE BIOLÓGICA */}
                  <div className="bg-[#f9fbf9] p-3 rounded-xl border-2 border-emerald-600/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-black text-white uppercase flex items-center gap-1">
                        <Dna className="w-3.5 h-3.5 text-emerald-700" />
                        <span>ID Madre Biológica (Chapeta) {originType === 'nacido' ? '*' : '(Opcional si es compra)'}</span>
                      </label>
                      {originType !== 'nacido' && (
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#202E25] text-white">
                          Opcional
                        </span>
                      )}
                    </div>

                    <select
                      value={damTag}
                      onChange={(e) => {
                        setDamTag(e.target.value);
                        setBirthError(null);
                      }}
                      className="w-full bg-[#15241C] border border-emerald-500 rounded-xl px-3 py-2 font-bold text-white text-xs"
                    >
                      <option value="">-- Seleccionar Madre del Hato --</option>
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

                    <div>
                      <span className="text-[9.5px] font-bold text-[#717973] block mb-1">
                        O digite manualmente la chapeta de la madre:
                      </span>
                      <input
                        type="text"
                        value={damTag}
                        onChange={(e) => {
                          setDamTag(e.target.value);
                          setBirthError(null);
                        }}
                        placeholder="Ej. Vaca 402 - La Reina"
                        className="w-full bg-[#15241C] border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-bold text-white text-xs"
                        required={originType === 'nacido'}
                      />
                    </div>
                  </div>

                  {/* PADRE */}
                  <div className="bg-[#f9fbf9] p-3 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10.5px] font-black text-white uppercase flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>ID Padre (Toro de Monta / Pajilla IA)</span>
                      </label>
                      <span className="text-[9px] bg-[#202E25] text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Opcional
                      </span>
                    </div>

                    <select
                      value={sireTagOrBull}
                      onChange={(e) => setSireTagOrBull(e.target.value)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-2 font-bold text-white text-xs"
                    >
                      <option value="Sin padre registrado (Desconocido)">
                        ❓ Sin padre registrado (Desconocido / Sin trazabilidad)
                      </option>
                      {systemBulls.length > 0 && (
                        <optgroup label="Toros Activos en Finca">
                          {systemBulls.map((b) => (
                            <option key={b.id || b.tag} value={`${b.tag} ${b.name ? `(${b.name})` : ''}`}>
                              🐂 #{b.tag} {b.name ? `- ${b.name}` : ''} ({b.breed || 'Toro'})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Toros & Pajillas IA del Catálogo">
                        {DEFAULT_SYSTEM_SIRES.map((s) => (
                          <option key={s.tag} value={s.tag}>
                            🐂 {s.tag} - {s.breed}
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    <div>
                      <span className="text-[9.5px] font-bold text-[#717973] block mb-1">
                        O digite el toro / código de pajilla:
                      </span>
                      <input
                        type="text"
                        value={sireTagOrBull}
                        onChange={(e) => setSireTagOrBull(e.target.value)}
                        placeholder="Ej. Toro Don Pedro (B-12) / Pajilla JDH 45/9"
                        className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f0f0f0]">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      🧬 Método de Concepción *
                    </label>
                    <select
                      value={conceptionMethod}
                      onChange={(e) => setConceptionMethod(e.target.value as ConceptionMethod)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-xs text-white"
                    >
                      <option value="monta_natural">🌱 Monta Natural a Campo</option>
                      <option value="ia">🧪 Inseminación Artificial (IA Convencional)</option>
                      <option value="iatf">⏱️ IATF (A Tiempo Fijo con Protocolo Hormonal)</option>
                      <option value="te">🔬 Transferencia de Embriones (TE / FIV)</option>
                    </select>
                  </div>

                  {conceptionMethod === 'te' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-[#6a1b9a] uppercase mb-1">
                        🔬 ID Madre Receptora (Solo para TE / FIV) *
                      </label>
                      <input
                        type="text"
                        value={surrogateDamTag}
                        onChange={(e) => setSurrogateDamTag(e.target.value)}
                        placeholder="Ej. Vaca Receptora R-109"
                        className="w-full bg-[#f3e5f5] border border-[#ce93d8] rounded-xl px-3 py-1.5 font-bold text-xs text-[#4a148c]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        ID Madre Receptora (TE / FIV)
                      </label>
                      <input
                        type="text"
                        value={surrogateDamTag}
                        onChange={(e) => setSurrogateDamTag(e.target.value)}
                        placeholder="No aplica (Solo si es TE)"
                        className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-1.5 font-normal text-xs text-[#717973]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. MANEJO INICIAL Y UBICACIÓN */}
              <div className="p-4 bg-[#15241C] border border-white/10 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2.5">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#123F2A] text-white flex items-center justify-center text-[10px] font-mono">4</span>
                    <Stethoscope className="w-4 h-4 text-[#1b4332]" />
                    <span>4. Manejo Inicial y Ubicación</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-[#2e7d32] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full">
                    Calostro / Curación Ombligo / Tratamientos / Finca / Operario
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* CALOSTRO */}
                  <div className="p-3 bg-[#fcfdfc] border border-white/10 rounded-xl space-y-2">
                    <label className="block text-[10.5px] font-bold text-white uppercase flex items-center justify-between">
                      <span>🍼 Suministro de Calostro *</span>
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${colostrumFed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {colostrumFed ? 'Suministrado' : 'Pendiente / No'}
                      </span>
                    </label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setColostrumFed(true)}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                          colostrumFed ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-[#15241C] text-[#717973] border-white/10'
                        }`}
                      >
                        ✓ Sí Suministrado
                      </button>
                      <button
                        type="button"
                        onClick={() => setColostrumFed(false)}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                          !colostrumFed ? 'bg-red-600 text-white border-red-600' : 'bg-[#15241C] text-[#717973] border-white/10'
                        }`}
                      >
                        ✕ No Suministrado
                      </button>
                    </div>

                    {colostrumFed && (
                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-[#717973] mb-1">
                          Tiempo Posparto de Toma (Horas):
                        </label>
                        <select
                          value={colostrumHoursPostCalving}
                          onChange={(e) => setColostrumHoursPostCalving(Number(e.target.value))}
                          className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1 font-bold text-xs text-white"
                        >
                          <option value={1}>⏱️ Dentro de la 1ra hora (Excelente absorción)</option>
                          <option value={2}>⏱️ Entre 1 y 2 horas (Óptimo)</option>
                          <option value={4}>⏱️ Entre 2 y 4 horas (Aceptable)</option>
                          <option value={6}>⏱️ Entre 4 y 6 horas (Límite inmunológico)</option>
                          <option value={8}>⚠️ Más de 6 horas (Riesgo falla transferencia pasiva)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* CURACIÓN OMBLIGO */}
                  <div className="p-3 bg-[#fcfdfc] border border-white/10 rounded-xl space-y-2">
                    <label className="block text-[10.5px] font-bold text-white uppercase flex items-center justify-between">
                      <span>🩺 Curación de Ombligo *</span>
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${navelDisinfected ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {navelDisinfected ? 'Desinfectado' : 'Sin Curación'}
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNavelDisinfected(true)}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                          navelDisinfected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-[#15241C] text-[#717973] border-white/10'
                        }`}
                      >
                        ✓ Sí Realizada (Yodo 7%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNavelDisinfected(false)}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                          !navelDisinfected ? 'bg-red-600 text-white border-red-600' : 'bg-[#15241C] text-[#717973] border-white/10'
                        }`}
                      >
                        ✕ No Realizada
                      </button>
                    </div>

                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-[#717973] mb-1">
                        Tratamientos Iniciales Aplicados:
                      </label>
                      <input
                        type="text"
                        value={initialTreatments}
                        onChange={(e) => setInitialTreatments(e.target.value)}
                        placeholder="Ej. Hierro dextrano 2ml + Vitamina ADE + Selenio"
                        className="w-full bg-[#15241C] border border-white/10 rounded-xl px-2.5 py-1 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* UBICACIÓN & OPERARIO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#f0f0f0]">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#1b4332]" /> {originType === 'nacido' ? 'Predio de Nacimiento *' : 'Predio de Destino / Origen'}
                    </label>
                    <select
                      value={originFarmId}
                      onChange={(e) => {
                        setOriginFarmId(e.target.value);
                        setBirthError(null);
                      }}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-white text-xs"
                    >
                      {farms.map((f) => (
                        <option key={f.profile.id} value={f.profile.id}>
                          🏡 {f.profile.name}
                        </option>
                      ))}
                      <option value="custom">✍️ Otro Predio Externo...</option>
                    </select>

                    {originFarmId === 'custom' && (
                      <input
                        type="text"
                        value={customOriginFarmName}
                        onChange={(e) => setCustomOriginFarmName(e.target.value)}
                        placeholder="Nombre del predio externo..."
                        className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1 text-xs font-semibold mt-1"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1b4332]" /> Potrero / Lote Maternidad
                    </label>
                    <select
                      value={maternityPaddockId}
                      onChange={(e) => setMaternityPaddockId(e.target.value)}
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-xs text-white"
                    >
                      <option value="">-- Asignar Potrero de Maternidad / Recepción --</option>
                      {(farms.find((f) => f.profile.id === (originFarmId === 'custom' ? selectedFarmId : originFarmId))?.paddocks || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          🌱 {p.code} - {p.name} ({p.currentOccupancy}/{p.capacityAnimals} animales)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      👤 Operario / Responsable *
                    </label>
                    <input
                      type="text"
                      value={operatorResponsible}
                      onChange={(e) => setOperatorResponsible(e.target.value)}
                      placeholder="Ej. Carlos Mendoza (Mayordomo)"
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f0f0f0]">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      🏷️ Marca / Chapeta Inicial de Campo
                    </label>
                    <input
                      type="text"
                      value={earTagInitial}
                      onChange={(e) => setEarTagInitial(e.target.value)}
                      placeholder="Ej. CHP-ORE-308"
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      🖋️ Tatuaje Inicial en Oreja (Opcional)
                    </label>
                    <input
                      type="text"
                      value={tattooNumber}
                      onChange={(e) => setTattooNumber(e.target.value)}
                      placeholder="Ej. TAT-308 (Oreja izquierda)"
                      className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>
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
                    className="w-full bg-[#15241C] border border-[#81d4fa] rounded-xl px-3 py-1.5 font-semibold text-white"
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
                    className="w-full bg-[#15241C] border border-[#81d4fa] rounded-xl px-3 py-1.5 font-bold"
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
                    className="w-full bg-[#15241C] border border-[#81d4fa] rounded-xl px-3 py-1.5 font-mono font-bold text-[#01579b]"
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
                    className="w-full bg-[#15241C] border border-[#81d4fa] rounded-xl px-3 py-1.5 font-mono font-bold text-[#01579b]"
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
                    className="w-full bg-[#15241C] border border-[#81d4fa] rounded-xl px-3 py-1.5 font-semibold text-white"
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
                    className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1.5 font-semibold text-white"
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
                    className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1.5 font-mono font-bold text-[#4a148c]"
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
                  className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1.5 font-bold text-white"
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
                      className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1 font-medium text-xs"
                    />
                    <input
                      type="text"
                      value={sireReg}
                      onChange={(e) => setSireReg(e.target.value)}
                      placeholder="Reg Padre (ej. US-8812)"
                      className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1 font-mono text-[11px]"
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
                      className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1 font-medium text-xs"
                    />
                    <input
                      type="text"
                      value={damReg}
                      onChange={(e) => setDamReg(e.target.value)}
                      placeholder="Reg Madre (ej. COL-4011)"
                      className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1 font-mono text-[11px]"
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
              className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eeeeee] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-[#414844] font-bold text-xs hover:bg-[#f0f0f0] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0D1A13] hover:bg-[#123F2A] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#A5B8AC]" />
              Guardar Ingreso a Inventario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
