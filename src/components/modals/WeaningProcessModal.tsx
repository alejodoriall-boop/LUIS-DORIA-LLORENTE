import React, { useState, useEffect, useMemo } from 'react';
import {
  FarmDataPackage,
  LotRecord,
  ImportedAnimalRecord,
  WeaningInfo,
} from '../../types';
import {
  X,
  Scale,
  Award,
  Flame,
  Tag,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  Building2,
  Search,
  Heart,
} from 'lucide-react';

interface WeaningProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  lots: LotRecord[];
  animals?: ImportedAnimalRecord[];
  onSaveWeaning: (
    animalId: string,
    weaningInfo: WeaningInfo,
    newCategory: string,
    targetLotId?: string,
  ) => void;
}

export const WeaningProcessModal: React.FC<WeaningProcessModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  lots,
  animals = [],
  onSaveWeaning,
}) => {
  // Farm & Lot filter
  const [selectedFarmId, setSelectedFarmId] = useState<string>(
    currentFarmId === 'all' ? farms[0]?.profile.id || 'finca-san-juan' : currentFarmId,
  );

  const activeFarmLots = lots.filter(
    (l) => l.farmId === selectedFarmId || selectedFarmId === 'all',
  );

  // Eligible calves (category = 'cria' or age <= 12 months)
  const eligibleCalves = animals.filter((a) => {
    const isFarmMatch = selectedFarmId === 'all' || a.farmId === selectedFarmId;
    const isCalfCategory =
      a.category === 'cria' ||
      (a.ageMonths && a.ageMonths <= 12) ||
      (a.originType === 'nacido');
    return isFarmMatch && isCalfCategory;
  });

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    eligibleCalves[0]?.id || '',
  );

  // Search input state for animal tag/number lookup
  const [searchTagOrNumber, setSearchTagOrNumber] = useState<string>('');

  // Manual fallback tag if no animal found in inventory
  const [customTag, setCustomTag] = useState<string>('ARE-9021');

  // Find matching animal based on searchTagOrNumber OR selectedAnimalId
  const matchedAnimal = useMemo(() => {
    if (searchTagOrNumber.trim()) {
      const q = searchTagOrNumber.trim().toLowerCase();
      const found = animals.find((a) => {
        const isFarmMatch = selectedFarmId === 'all' || a.farmId === selectedFarmId;
        const tagMatch = a.tag.toLowerCase() === q || a.tag.toLowerCase().includes(q) || q.includes(a.tag.toLowerCase());
        const earMatch = a.bornInfo?.earTagInitial?.toLowerCase().includes(q);
        const tatMatch = a.bornInfo?.tattooNumber?.toLowerCase().includes(q);
        const nameMatch = a.name?.toLowerCase().includes(q);
        const damMatch = a.bornInfo?.damTag?.toLowerCase().includes(q);
        return isFarmMatch && (tagMatch || earMatch || tatMatch || nameMatch || damMatch);
      });
      if (found) return found;
    }
    return animals.find((a) => a.id === selectedAnimalId) || eligibleCalves[0] || null;
  }, [searchTagOrNumber, selectedAnimalId, animals, eligibleCalves, selectedFarmId]);

  // 1. Marcación Fields
  const [brandType, setBrandType] = useState<
    'hierro_caliente' | 'chapeta_definitiva' | 'tatuaje_oreja' | 'fuego_numerico'
  >('hierro_caliente');
  const [brandCode, setBrandCode] = useState<string>('H-882-SJ');
  const [brandLocation, setBrandLocation] = useState<string>('Muslo Izquierdo (Hierro Finca)');

  // 2. Pesaje de Destete Fields
  const [weaningDate, setWeaningDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [weaningWeightKg, setWeaningWeightKg] = useState<number>(215);
  const [weaningAgeMonths, setWeaningAgeMonths] = useState<number>(8);
  const [birthWeightKg, setBirthWeightKg] = useState<number>(34);

  // Auto-populate form whenever matchedAnimal changes (Birth record auto-loading)
  useEffect(() => {
    if (matchedAnimal) {
      if (matchedAnimal.id !== selectedAnimalId) {
        setSelectedAnimalId(matchedAnimal.id);
      }
      
      // Auto load birth weight
      if (matchedAnimal.bornInfo?.birthWeightKg) {
        setBirthWeightKg(matchedAnimal.bornInfo.birthWeightKg);
      } else {
        setBirthWeightKg(35);
      }

      // Auto load current weight
      if (matchedAnimal.weightKg) {
        setWeaningWeightKg(matchedAnimal.weightKg);
      }

      // Auto calculate age in months if birthDate is available
      const bDate = matchedAnimal.bornInfo?.birthDate;
      if (bDate && weaningDate) {
        const birthMs = new Date(bDate).getTime();
        const weaningMs = new Date(weaningDate).getTime();
        const calcMonths = Math.max(1, Math.round((weaningMs - birthMs) / (1000 * 60 * 60 * 24 * 30.43)));
        if (!isNaN(calcMonths)) {
          setWeaningAgeMonths(calcMonths);
        }
      } else if (matchedAnimal.ageMonths) {
        setWeaningAgeMonths(matchedAnimal.ageMonths);
      }

      // Auto suggest brand code
      setBrandCode(`H-${matchedAnimal.tag.replace(/[^a-zA-Z0-9]/g, '')}-SJ`);

      // Auto suggest Asocebú registered name
      setRegisteredNameAsocebu(`Don ${matchedAnimal.name || `Ejemplar ${matchedAnimal.tag}`} ${matchedAnimal.breed}`);
    }
  }, [matchedAnimal?.id, weaningDate]);

  // 3. Asocebú / Genealógico Fields
  const [hasAsocebuRegister, setHasAsocebuRegister] = useState<boolean>(true);
  const [asocebuRegisterNumber, setAsocebuRegisterNumber] = useState<string>('REG-ASOC-2026-8812');
  const [asocebuBook, setAsocebuBook] = useState<string>('Brahman Blanco Puro (Libro Abierto)');
  const [registeredNameAsocebu, setRegisteredNameAsocebu] = useState<string>('Don Gabriel F.R. 882/11');

  // 4. Destination Lot / Category
  const [targetCategory, setTargetCategory] = useState<string>('cria'); // Levante
  const [targetLotId, setTargetLotId] = useState<string>(
    activeFarmLots.find((l) => l.category === 'ceba' || l.category === 'cria')?.id ||
      activeFarmLots[0]?.id ||
      '',
  );
  const [weaningNotes, setWeaningNotes] = useState<string>(
    'Ternero con excelente desarrollo musculoesquelético. Aplicado hierro caliente y chapeta Asocebú.',
  );

  if (!isOpen) return null;

  const currentSelectedAnimal = animals.find((a) => a.id === selectedAnimalId);

  // Calculate Average Daily Gain (GDP)
  const birthWeight = currentSelectedAnimal?.bornInfo?.birthWeightKg || birthWeightKg || 32;
  const daysInLactation = Math.max(30, weaningAgeMonths * 30);
  const totalWeightGained = Math.max(0, weaningWeightKg - birthWeight);
  const calculatedDailyGainKg = Number((totalWeightGained / daysInLactation).toFixed(3));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const weaningInfoRecord: WeaningInfo = {
      weaningDate,
      weaningWeightKg: Number(weaningWeightKg),
      weaningAgeMonths: Number(weaningAgeMonths),
      dailyGainKg: calculatedDailyGainKg,
      brandType,
      brandCode,
      asocebuRegisterNumber: hasAsocebuRegister ? asocebuRegisterNumber : undefined,
      asocebuBook: hasAsocebuRegister ? asocebuBook : undefined,
      registeredNameAsocebu: hasAsocebuRegister ? registeredNameAsocebu : undefined,
      weaningNotes,
    };

    onSaveWeaning(
      selectedAnimalId || 'custom-animal',
      weaningInfoRecord,
      targetCategory,
      targetLotId,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-3xl max-w-5xl lg:max-w-6xl w-full p-5 md:p-6 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#eeeeee] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#D4A94E] text-[#0D1A13] rounded-2xl shadow-sm">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Módulo & Proceso de Destete Bovino
                </h3>
                <span className="text-[10px] font-mono font-extrabold bg-[#0D1A13] text-[#A5B8AC] px-2 py-0.5 rounded">
                  Etapa Cría ➔ Levante
                </span>
              </div>
              <p className="text-xs text-[#717973] font-medium">
                Protocolo oficial: Marcación (Hierro Caliente/Chapeta), Pesaje al Destete (GDP) y Registro Asocebú
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 py-4 space-y-4 text-xs">
          {/* Step 1: Farm & Animal Selection with Automatic Birth Record Lookup */}
          <div className="p-3.5 bg-[#f4f6f4] border-2 border-[#a5d6a7] rounded-2xl space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#1b4332]" /> 1. Búsqueda y Carga del Registro de Nacimiento
              </span>
              <span className="text-[10px] bg-[#123F2A] text-[#A5B8AC] font-mono font-bold px-2 py-0.5 rounded">
                ⚡ Auto-Carga Activada
              </span>
            </h4>

            {/* Live Animal Tag / Number Search Box */}
            <div>
              <label className="block text-[10.5px] font-extrabold text-white uppercase mb-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#1b5e20]" />
                <span>Coloque / Digite el Número del Animal o Arete de Nacimiento *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTagOrNumber}
                  onChange={(e) => setSearchTagOrNumber(e.target.value)}
                  placeholder="Ej. 308, CHP-ORE-308, TAT-308, 01 (Digite el número para autocargar datos)..."
                  className="w-full bg-[#15241C] border-2 border-[#1b5e20] rounded-2xl px-3.5 py-2 font-mono font-black text-sm text-white shadow-xs focus:ring-2 focus:ring-[#2e7d32] placeholder:font-normal placeholder:text-xs"
                />
                {matchedAnimal && (
                  <span className="absolute right-2.5 top-2 bg-[#e8f5e9] text-[#1b5e20] text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg border border-[#a5d6a7] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#2e7d32]" /> Nacimiento Encontrado
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Predio Ganadero
                </label>
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-white"
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
                  O Seleccione de Lista de Terneros Aptos
                </label>
                {eligibleCalves.length > 0 ? (
                  <select
                    value={selectedAnimalId}
                    onChange={(e) => {
                      setSelectedAnimalId(e.target.value);
                      const anim = animals.find((a) => a.id === e.target.value);
                      if (anim) {
                        setSearchTagOrNumber(anim.tag);
                      }
                    }}
                    className="w-full bg-[#15241C] border border-[#012d1d] rounded-xl px-3 py-1.5 font-bold text-white"
                  >
                    {eligibleCalves.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.tag} {a.name ? `(${a.name})` : ''} - {a.breed} - Peso Nacimiento: {a.bornInfo?.birthWeightKg || 35} kg
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Ej. ARE-9021 (Ingreso manual)"
                    className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-white"
                  />
                )}
              </div>
            </div>

            {/* Rich Loaded Birth Record Banner */}
            {matchedAnimal ? (
              <div className="bg-[#e8f5e9] p-3.5 rounded-2xl border-2 border-[#81c784] shadow-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#a5d6a7] pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2e7d32]" />
                    <span className="font-black text-xs text-[#1b5e20]">
                      Ficha de Nacimiento Cargada Exitosamente — Ejemplar #{matchedAnimal.tag}
                    </span>
                  </div>
                  <span className="text-[9.5px] font-mono font-black bg-[#2e7d32] text-white px-2 py-0.5 rounded shadow-2xs">
                    DATOS DE NACIMIENTO AUTOCARGADOS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-[#15241C] p-2 rounded-xl border border-[#a5d6a7]">
                    <span className="text-[9.5px] font-bold uppercase text-[#2e7d32] block">🎂 Fecha Nacimiento</span>
                    <span className="font-mono font-black text-white block mt-0.5">
                      {matchedAnimal.bornInfo?.birthDate || '2024-05-12'}
                    </span>
                  </div>

                  <div className="bg-[#15241C] p-2 rounded-xl border border-[#a5d6a7]">
                    <span className="text-[9.5px] font-bold uppercase text-[#2e7d32] block">⚖️ Peso al Nacer</span>
                    <span className="font-mono font-black text-[#1b5e20] block mt-0.5">
                      {matchedAnimal.bornInfo?.birthWeightKg || birthWeightKg || 35} kg
                    </span>
                  </div>

                  <div className="bg-[#15241C] p-2 rounded-xl border border-[#a5d6a7]">
                    <span className="text-[9.5px] font-bold uppercase text-[#2e7d32] block">🏷️ Marca Oreja Inicial</span>
                    <span className="font-mono font-black text-white block mt-0.5">
                      {matchedAnimal.bornInfo?.earTagInitial || `CHP-ORE-${matchedAnimal.tag}`}
                    </span>
                  </div>

                  <div className="bg-[#15241C] p-2 rounded-xl border border-[#a5d6a7]">
                    <span className="text-[9.5px] font-bold uppercase text-[#2e7d32] block">🖋️ Tatuaje Oreja</span>
                    <span className="font-mono font-black text-white block mt-0.5">
                      {matchedAnimal.bornInfo?.tattooNumber || `TAT-${matchedAnimal.tag}`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#1b5e20] font-semibold pt-1 border-t border-[#a5d6a7]/60">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#e53935]" />
                    <span>Madre: <strong>{matchedAnimal.bornInfo?.damTag || 'Vaca Registrada'}</strong></span>
                  </div>
                  <div>
                    <span>Padre: <strong>{matchedAnimal.bornInfo?.sireTagOrBull || 'Toro Finca'}</strong></span>
                  </div>
                  <div>
                    <span>Raza: <strong>{matchedAnimal.breed}</strong> ({matchedAnimal.sex})</span>
                  </div>
                  <div>
                    <span>Peso Actual: <strong className="font-mono text-white bg-[#15241C] px-1.5 py-0.2 rounded border border-[#a5d6a7]">{matchedAnimal.weightKg} kg</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#fff8e7] p-3 rounded-2xl border border-[#ffe082] text-xs text-[#0D1A13] flex items-center justify-between">
                <span>💡 Digite el número o arete de nacimiento arriba para cargar los datos del registro.</span>
              </div>
            )}
          </div>

          {/* Step 2: Marcación Definitiva al Destete (Hierro Caliente / Chapeta) */}
          <div className="p-3.5 bg-[#fff8e7] border-2 border-[#ffe082] rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#ffe082] pb-2">
              <h4 className="font-bold text-[#0D1A13] text-xs flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#ff8f00]" /> 2. Marcación Definitiva al Destete (Hierro Caliente / Chapeta)
              </h4>
              <span className="text-[10px] font-mono font-bold bg-[#D4A94E] text-[#0D1A13] px-2 py-0.5 rounded">
                Protocolo de Hierro
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#0D1A13] uppercase mb-1">
                  Tipo de Marcación *
                </label>
                <select
                  value={brandType}
                  onChange={(e: any) => setBrandType(e.target.value)}
                  className="w-full bg-[#15241C] border border-[#ffe082] text-[#0D1A13] rounded-xl px-3 py-1.5 font-bold"
                >
                  <option value="hierro_caliente">🔥 Hierro Caliente (Fuego en Muslo/Paleta)</option>
                  <option value="chapeta_definitiva">🏷️ Chapeta Definitiva Metal / Plástica Asocebú</option>
                  <option value="tatuaje_oreja">🖋️ Tatuaje Oreja + Hierro Caliente</option>
                  <option value="fuego_numerico">⚡ Fuego Numérico de Hato</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#0D1A13] uppercase mb-1">
                  Código de Hierro / Chapeta *
                </label>
                <input
                  type="text"
                  value={brandCode}
                  onChange={(e) => setBrandCode(e.target.value)}
                  placeholder="Ej. H-882-SJ"
                  className="w-full bg-[#15241C] border border-[#ffe082] rounded-xl px-3 py-1.5 font-mono font-black text-[#0D1A13]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#0D1A13] uppercase mb-1">
                  Ubicación de la Marca
                </label>
                <input
                  type="text"
                  value={brandLocation}
                  onChange={(e) => setBrandLocation(e.target.value)}
                  placeholder="Ej. Muslo Izquierdo / Paleta Derecha"
                  className="w-full bg-[#15241C] border border-[#ffe082] rounded-xl px-3 py-1.5 font-bold text-[#0D1A13]"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Control de Pesaje de Destete y GDP */}
          <div className="p-3.5 bg-[#e8f5ec] border-2 border-[#c1ecd4] rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#c1ecd4] pb-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#2d6a4f]" /> 3. Control de Pesaje Oficial al Destete
              </h4>
              <span className="text-[10px] font-mono font-bold bg-[#0D1A13] text-[#A5B8AC] px-2 py-0.5 rounded">
                Control de Peso
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-white uppercase mb-1">
                  Fecha de Destete
                </label>
                <input
                  type="date"
                  value={weaningDate}
                  onChange={(e) => setWeaningDate(e.target.value)}
                  className="w-full bg-[#15241C] border border-[#c1ecd4] rounded-xl px-3 py-1.5 font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white uppercase mb-1">
                  ⚖️ Peso Destete (kg) *
                </label>
                <input
                  type="number"
                  value={weaningWeightKg}
                  onChange={(e) => setWeaningWeightKg(Number(e.target.value))}
                  placeholder="215"
                  className="w-full bg-[#15241C] border border-[#012d1d] rounded-xl px-3 py-1.5 font-mono font-black text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white uppercase mb-1">
                  Edad al Destete (Meses)
                </label>
                <input
                  type="number"
                  value={weaningAgeMonths}
                  onChange={(e) => setWeaningAgeMonths(Number(e.target.value))}
                  placeholder="8"
                  className="w-full bg-[#15241C] border border-[#c1ecd4] rounded-xl px-3 py-1.5 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white uppercase mb-1">
                  Peso al Nacer Ref. (kg)
                </label>
                <input
                  type="number"
                  value={birthWeight}
                  onChange={(e) => setBirthWeightKg(Number(e.target.value))}
                  className="w-full bg-[#15241C] border border-[#c1ecd4] rounded-xl px-3 py-1.5 font-mono font-bold text-[#717973]"
                />
              </div>
            </div>

            {/* Calculated GDP Box */}
            <div className="bg-[#15241C] p-3 rounded-xl border border-[#c1ecd4] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2d6a4f]" />
                <div>
                  <span className="font-black text-white block">
                    Ganancia Diaria de Peso Predestete (GDP): {calculatedDailyGainKg} kg/día
                  </span>
                  <span className="text-[10.5px] text-[#717973]">
                    Ganancia total en lactancia: +{totalWeightGained.toFixed(1)} kg en {daysInLactation} días
                  </span>
                </div>
              </div>

              <span className="bg-[#e8f5ec] text-white border border-[#c1ecd4] text-[10px] font-mono font-black px-2.5 py-1 rounded-lg">
                Rendimiento: {calculatedDailyGainKg > 0.7 ? '🟢 Excelente' : '🟡 Aceptable'}
              </span>
            </div>
          </div>

          {/* Step 4: Registro Asocebú / Genealógico Oficial */}
          <div className="p-3.5 bg-[#f3e5f5] border-2 border-[#ce93d8] rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#ce93d8] pb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#7b1fa2]" />
                <h4 className="font-bold text-[#4a148c] text-xs">
                  4. Registro Asocebú & Genealogía de Pureza
                </h4>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#4a148c]">
                <input
                  type="checkbox"
                  checked={hasAsocebuRegister}
                  onChange={(e) => setHasAsocebuRegister(e.target.checked)}
                  className="rounded text-[#7b1fa2] focus:ring-[#7b1fa2]"
                />
                Inscribir Registro Asocebú
              </label>
            </div>

            {hasAsocebuRegister && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-[10px] font-bold text-[#4a148c] uppercase mb-1">
                    N° Registro Asocebú Oficial *
                  </label>
                  <input
                    type="text"
                    value={asocebuRegisterNumber}
                    onChange={(e) => setAsocebuRegisterNumber(e.target.value)}
                    placeholder="Ej. REG-ASOC-2026-8812"
                    className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1.5 font-mono font-bold text-[#4a148c]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#4a148c] uppercase mb-1">
                    Libro / Categoría Genealógica
                  </label>
                  <select
                    value={asocebuBook}
                    onChange={(e) => setAsocebuBook(e.target.value)}
                    className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1.5 font-semibold text-[#4a148c]"
                  >
                    <option value="Brahman Blanco Puro">Brahman Blanco Puro (Libro Cerrado)</option>
                    <option value="Brahman Rojo Puro">Brahman Rojo Puro</option>
                    <option value="Gyr / Gyrolando">Gyr Lechero / Gyrolando Registro</option>
                    <option value="Guzerá / Nelore">Guzerá / Nelore Puro</option>
                    <option value="Cruzado Certificado">Cruzado F1 Certificado Asocebú</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#4a148c] uppercase mb-1">
                    Nombre Oficial Asocebú
                  </label>
                  <input
                    type="text"
                    value={registeredNameAsocebu}
                    onChange={(e) => setRegisteredNameAsocebu(e.target.value)}
                    placeholder="Ej. Don Gabriel F.R. 882/11"
                    className="w-full bg-[#15241C] border border-[#ce93d8] rounded-xl px-3 py-1.5 font-semibold text-[#4a148c]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 5: Destination Category & Lot */}
          <div className="p-3.5 bg-[#15241C] border border-white/10 rounded-2xl space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-[#eeeeee] pb-2">
              <Layers className="w-4 h-4 text-[#1b4332]" /> 5. Reclasificación & Lote Destino de Levante
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Nueva Categoría Productiva
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full bg-[#e8f5ec] border border-[#c1ecd4] rounded-xl px-3 py-1.5 font-black text-white"
                >
                  <option value="ceba">🌿 Levante / Machos de Ceba</option>
                  <option value="cria">🍼 Cría / Reemplazo de Hato</option>
                  <option value="leche">🥛 Levante Lechería / Vaquillas</option>
                  <option value="genetica">🏆 Plantel Registrado Asocebú</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                  Lote de Destino
                </label>
                <select
                  value={targetLotId}
                  onChange={(e) => setTargetLotId(e.target.value)}
                  className="w-full bg-[#15241C] border border-white/10 rounded-xl px-3 py-1.5 font-bold text-white"
                >
                  {activeFarmLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name} ({lot.code}) - {lot.categoryLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                Observaciones del Destete
              </label>
              <textarea
                value={weaningNotes}
                onChange={(e) => setWeaningNotes(e.target.value)}
                rows={2}
                className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="pt-3 border-t border-[#eeeeee] flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 font-bold text-xs text-[#414844] hover:bg-[#f3f3f3] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0D1A13] hover:bg-[#123F2A] text-white font-black text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-98"
            >
              <ShieldCheck className="w-4 h-4 text-[#A5B8AC]" />
              <span>Registrar Destete Oficial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
