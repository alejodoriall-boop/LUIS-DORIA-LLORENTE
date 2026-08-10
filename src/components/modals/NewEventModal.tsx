import React, { useState, useEffect } from 'react';
import {
  Baby,
  Scale,
  Heart,
  Stethoscope,
  X,
  CheckCircle2,
  Zap,
  Building2,
  MapPin,
  Sparkles,
  ShoppingBag,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Coins,
  AlertCircle,
  Dna,
  Award,
  Flame,
  Users,
  Truck,
  UserCheck,
  Phone,
  FileText,
  Compass,
  ShieldAlert,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FarmDataPackage, ImportedAnimalRecord, NewLotRegistrationInput, LotCategory, BrandingIron } from '../../types';
import { AuctionExcelImporter } from './AuctionExcelImporter';

export type RegistrationEventType =
  | 'compra'
  | 'auction'
  | 'birth'
  | 'sociedad'
  | 'pasaje'
  | 'monta'
  | 'ia'
  | 'health'
  | 'weigh';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  animals?: ImportedAnimalRecord[];
  onSelectFarm?: (farmId: string) => void;
  onAddActivity: (
    title: string,
    subtitle: string,
    metric: string,
    category: 'birth' | 'weigh' | 'dairy' | 'health' | 'genetics',
  ) => void;
  onRegisterAuctionLot: (lotInput: NewLotRegistrationInput) => void;
  liveScaleWeight?: number;
  scaleName?: string;
  onOpenScaleModal?: () => void;
  initialEventType?: RegistrationEventType;
  brandingIrons?: BrandingIron[];
}

const DEFAULT_SYSTEM_DAMS = [
  { tag: 'Vaca 402 - La Reina', breed: 'Brahman Blanco' },
  { tag: 'Vaca 102 - Lady Manso', breed: 'Gyr Leche' },
  { tag: 'Vaca 304 - Mariposa', breed: 'Simbrah' },
  { tag: 'Vaca 501 - La Esperanza', breed: 'Brahman Rojo' },
  { tag: 'Vaca 802 - Clara', breed: 'Guzerá' },
  { tag: 'Vaca 210 - Paloma', breed: 'Girolando' },
];

const DEFAULT_SYSTEM_SIRES = [
  { tag: 'Toro Don Pedro (B-12)', breed: 'Brahman Blanco' },
  { tag: 'JDH Sir Liberty 45/9', breed: 'Brahman Importado' },
  { tag: 'Toro San Juan #88', breed: 'Brahman Rojo' },
  { tag: 'Pajilla IA - Mr. V8 380/6', breed: 'Semen IA Importado' },
  { tag: 'Pajilla IA - Sansao Gyr #2201', breed: 'Semen IA Leche' },
];

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  animals = [],
  onSelectFarm,
  onAddActivity,
  onRegisterAuctionLot,
  liveScaleWeight,
  scaleName,
  onOpenScaleModal,
  initialEventType = 'compra',
  brandingIrons = [],
}) => {
  // Target Farm selection
  const [selectedFarmId, setSelectedFarmId] = useState<string>(currentFarmId || (farms[0]?.profile?.id ?? ''));

  // Event category
  const [eventType, setEventType] = useState<RegistrationEventType>(
    initialEventType === 'auction' ? 'compra' : initialEventType || 'compra'
  );

  // Sync selectedFarmId when modal opens or currentFarmId changes
  useEffect(() => {
    if (isOpen) {
      if (currentFarmId) {
        setSelectedFarmId(currentFarmId);
        setBirthOriginFarmId(currentFarmId);
      }
      if (initialEventType) {
        setEventType(initialEventType === 'auction' ? 'compra' : initialEventType);
      }
    }
  }, [isOpen, currentFarmId, initialEventType]);

  // System Animals Filtering
  const systemCows = animals.filter((a) => a.sex === 'hembra' || a.category === 'cria' || a.category === 'novilla');
  const systemBulls = animals.filter((a) => a.sex === 'macho' || a.category === 'ceba' || a.category === 'toro');

  // ==========================================
  // COMPRA & VENDEDOR STATE
  // ==========================================
  const [sellerType, setSellerType] = useState<'subasta' | 'particular' | 'comerciante' | 'finca' | 'empresa'>('subasta');
  const [auctionEntity, setAuctionEntity] = useState('Subastar S.A. (Montería / Planeta Rica)');
  const [customAuctionEntity, setCustomAuctionEntity] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerDoc, setSellerDoc] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [sellerSanitaryStatus, setSellerSanitaryStatus] = useState('Hato libre de Brucelosis y Aftosa');
  const [invoiceNumber, setInvoiceNumber] = useState(`FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [lotName, setLotName] = useState('Lote Novillos Ceba Compra');
  const [lotCategory, setLotCategory] = useState<LotCategory>('ceba');
  const [selectedPaddockId, setSelectedPaddockId] = useState<string>('');
  const [pricePerKg, setPricePerKg] = useState('8750');
  const [freightCost, setFreightCost] = useState('45000');
  const [auctionEntryMode, setAuctionEntryMode] = useState<'excel' | 'quick'>('quick');
  const [importedAnimals, setImportedAnimals] = useState<ImportedAnimalRecord[]>([]);

  // Quick batch manual input
  const [quickHeads, setQuickHeads] = useState('25');
  const [quickAvgWeight, setQuickAvgWeight] = useState('365.0');
  const [quickSex, setQuickSex] = useState<'Machos' | 'Hembras' | 'Mixto'>('Machos');
  const [quickBreed, setQuickBreed] = useState('Brahman Blanco / Cebú');

  // ==========================================
  // NACIMIENTOS STATE
  // ==========================================
  const [tag, setTag] = useState('#9084');
  const [parentTag, setParentTag] = useState('Vaca 402 - La Reina');
  const [birthSireTag, setBirthSireTag] = useState('Toro Don Pedro (B-12)');
  const [birthOriginFarmId, setBirthOriginFarmId] = useState<string>(currentFarmId || farms[0]?.profile.id || '');
  const [customOriginFarmName, setCustomOriginFarmName] = useState('');
  const [birthError, setBirthError] = useState<string | null>(null);
  const [birthSex, setBirthSex] = useState<'hembra' | 'macho'>('hembra');
  const [birthBreed, setBirthBreed] = useState<string>('Brahman Blanco');
  const [birthColor, setBirthColor] = useState<string>('Blanco / Gris');
  const [birthCattleType, setBirthCattleType] = useState<string>('comercial');
  const [selectedBrandingIronId, setSelectedBrandingIronId] = useState<string>('');
  const [individualWeight, setIndividualWeight] = useState('36.5');
  const [bullOrSire, setBullOrSire] = useState('Don Juan 450 (Puro)');
  const [notes, setNotes] = useState('Registro verificado en campo');

  // ==========================================
  // RECIBIDOS EN SOCIEDAD STATE
  // ==========================================
  const [partnerName, setPartnerName] = useState('Don Gabriel Gómez');
  const [partnerDoc, setPartnerDoc] = useState('80.123.456');
  const [partnerPhone, setPartnerPhone] = useState('311 890 1234');
  const [shareScheme, setShareScheme] = useState('50% Socio / 50% Finca (En Aumento)');
  const [sociedadHeads, setSociedadHeads] = useState('18');
  const [sociedadAvgWeight, setSociedadAvgWeight] = useState('275.0');
  const [sociedadPricePerKg, setSociedadPricePerKg] = useState('8200');
  const [sociedadPaddockId, setSociedadPaddockId] = useState('');
  const [sociedadNotes, setSociedadNotes] = useState('Ganado de levante recibido al aumento. Contrato a 12 meses.');

  // ==========================================
  // PASAJE / TRASLADO STATE
  // ==========================================
  const [pasajeType, setPasajeType] = useState<'potreros' | 'predios'>('potreros');
  const [pasajeOriginPaddockId, setPasajeOriginPaddockId] = useState('');
  const [pasajeTargetFarmOrPaddock, setPasajeTargetFarmOrPaddock] = useState('Potrero La Ceiba #4');
  const [icaGuideNumber, setIcaGuideNumber] = useState(`ICA-${Math.floor(100000 + Math.random() * 900000)}`);
  const [transporterName, setTransporterName] = useState('Transportes Ganaderos del Norte');
  const [truckPlate, setTruckPlate] = useState('WNK-452');
  const [pasajeFreightCost, setPasajeFreightCost] = useState('180000');
  const [pasajeHeads, setPasajeHeads] = useState('24');
  const [pasajeNotes, setPasajeNotes] = useState('Traslado por rotación de pasturas. Ganado completo en destino.');

  // ==========================================
  // MONTA / REPRODUCCIÓN STATE
  // ==========================================
  const [montaType, setMontaType] = useState<'monta_directa' | 'ia' | 'iatf' | 'te'>('ia');
  const [montaFemaleTag, setMontaFemaleTag] = useState('Vaca #402');
  const [montaSireOrStraw, setMontaSireOrStraw] = useState('Pajilla - Mr. V8 380/6 (Brahman)');
  const [montaTechnician, setMontaTechnician] = useState('Dr. Mario Restrepo (Inseminador)');
  const [montaServiceDate, setMontaServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [montaNotes, setMontaNotes] = useState('Protocolo IATF sincronizado con DIB de 0.5g');

  // ==========================================
  // SANIDAD STATE
  // ==========================================
  const [healthType, setHealthType] = useState<'vacunacion' | 'desparasitacion' | 'vitaminas' | 'tratamiento' | 'ombligo' | 'bano'>('vacunacion');
  const [healthProduct, setHealthProduct] = useState('Aftosa + Edema (Limor)');
  const [healthDose, setHealthDose] = useState('2.0');
  const [healthWithdrawalDays, setHealthWithdrawalDays] = useState('0');
  const [healthBatchCode, setHealthBatchCode] = useState('LOT-2026-908');
  const [healthCost, setHealthCost] = useState('35000');
  const [healthNotes, setHealthNotes] = useState('Jornada de vacunación oficial ciclo I. Sin reacciones adversas.');

  if (!isOpen) return null;

  const targetFarm = farms.find((f) => f.profile.id === selectedFarmId) || farms[0];
  const targetPaddocks = targetFarm?.paddocks || [];

  const handleFetchFromScale = () => {
    if (liveScaleWeight) {
      if (eventType === 'compra' || eventType === 'auction') {
        setQuickAvgWeight(liveScaleWeight.toFixed(1));
      } else {
        setIndividualWeight(liveScaleWeight.toFixed(1));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const farmName = targetFarm?.profile?.name || 'Predio';

    // 1. COMPRA DE GANADO (SUBASTA O PARTICULAR)
    if (eventType === 'compra' || eventType === 'auction') {
      const subastaName =
        sellerType === 'subasta'
          ? auctionEntity === 'Otro / Particular'
            ? customAuctionEntity || 'Subasta Comercial'
            : auctionEntity
          : `${sellerName || 'Proveedor Particular'} (${sellerType.toUpperCase()})`;

      let finalAnimals = [...importedAnimals];
      let headsCount = 0;
      let calculatedAvgWeight = 0;

      if (auctionEntryMode === 'excel' && finalAnimals.length > 0) {
        headsCount = finalAnimals.length;
        const sumWeight = finalAnimals.reduce((acc, curr) => acc + curr.weightKg, 0);
        calculatedAvgWeight = Number((sumWeight / headsCount).toFixed(1));
      } else {
        headsCount = parseInt(quickHeads, 10) || 20;
        calculatedAvgWeight = parseFloat(quickAvgWeight) || 350;
        const unitPrice = parseFloat(pricePerKg) || 8750;

        finalAnimals = Array.from({ length: headsCount }, (_, idx) => ({
          id: `anim-compra-${Date.now()}-${idx}`,
          tag: `#CMP-${8000 + idx + 1}`,
          weightKg: calculatedAvgWeight,
          sex: quickSex === 'Hembras' ? 'hembra' : 'macho',
          breed: quickBreed,
          pricePerKg: unitPrice,
          totalPrice: Math.round(calculatedAvgWeight * unitPrice),
          lotCode: invoiceNumber,
          ageMonths: calculatedAvgWeight < 220 ? 8 : 22,
          notes: `Compra ${sellerType}: ${lotName}. Vendedor: ${sellerName || subastaName}`,
        }));
      }

      const newLotData: NewLotRegistrationInput = {
        farmId: selectedFarmId,
        lotName: lotName.trim() || `Lote Compra ${invoiceNumber}`,
        category: lotCategory,
        categoryLabel:
          lotCategory === 'ceba'
            ? 'CEBA INTENSIVA'
            : lotCategory === 'cria'
            ? 'CRÍA / LEVANTE'
            : lotCategory === 'leche'
            ? 'LECHERÍA'
            : 'GENÉTICA',
        sourceType: sellerType === 'subasta' ? 'subasta' : 'compra_directa',
        sourceEntity: subastaName,
        invoiceNumber,
        purchaseDate: new Date().toLocaleDateString('es-CO'),
        paddockId: selectedPaddockId || undefined,
        pricePerKg: parseFloat(pricePerKg) || 8750,
        freightCost: parseFloat(freightCost) || 0,
        heads: headsCount,
        currentAvgWeight: calculatedAvgWeight,
        targetWeight: calculatedAvgWeight + 120,
        ageRange: calculatedAvgWeight < 220 ? '8-14 Meses' : '18-28 Meses',
        sexLabel: quickSex === 'Hembras' ? 'Hembras de Levante' : 'Machos de Ceba',
        pastureType:
          targetPaddocks.find((p) => p.id === selectedPaddockId)?.pastureType ||
          targetFarm?.profile?.notes?.slice(0, 30) ||
          'Brachiaria Brizantha',
        animals: finalAnimals,
        notes: `Comprado en ${subastaName} (Factura: ${invoiceNumber}). Vendedor: ${sellerName || 'N/A'} (Tel: ${
          sellerPhone || 'S/N'
        }, Doc: ${sellerDoc || 'S/N'}). Sanidad: ${sellerSanitaryStatus}. Asignado a ${farmName}.`,
      };

      onRegisterAuctionLot(newLotData);

      onAddActivity(
        `Compra Ganado: ${newLotData.lotName}`,
        `${headsCount} Cab. asignadas a ${farmName} • Fact: ${invoiceNumber} • Proveedor: ${subastaName}${
          sellerName ? ` (${sellerName})` : ''
        }`,
        `+${headsCount} Cab.`,
        'weigh',
      );
    }
    // 2. NACIMIENTOS
    else if (eventType === 'birth') {
      if (!parentTag || !parentTag.trim()) {
        setBirthError('La información de la MADRE es obligatoria para registrar el nacimiento.');
        return;
      }
      setBirthError(null);

      const originFarmObj = farms.find((f) => f.profile.id === birthOriginFarmId);
      const originFarmName =
        birthOriginFarmId === 'custom'
          ? customOriginFarmName.trim() || 'Predio de Origen'
          : originFarmObj?.profile.name || farmName;

      const selectedIron = brandingIrons.find((i) => i.id === selectedBrandingIronId);
      const ironText = selectedIron ? ` • Hierro: ${selectedIron.symbolIcon || ''} ${selectedIron.name}` : '';

      onAddActivity(
        `Nacimiento - Ternero ${tag} (${originFarmName})`,
        `Madre: ${parentTag.trim()} • Padre: ${birthSireTag.trim() || 'Desconocido'} • Raza: ${birthBreed} • Color: ${birthColor}${ironText}`,
        `${individualWeight} kg`,
        'birth',
      );
    }
    // 3. RECIBIDOS EN SOCIEDAD
    else if (eventType === 'sociedad') {
      const heads = parseInt(sociedadHeads, 10) || 10;
      const avgW = parseFloat(sociedadAvgWeight) || 250;
      const priceKg = parseFloat(sociedadPricePerKg) || 8200;

      const sociedadLotData: NewLotRegistrationInput = {
        farmId: selectedFarmId,
        lotName: `Sociedad - ${partnerName || 'Socio'} (${shareScheme.slice(0, 20)})`,
        category: 'cria',
        categoryLabel: 'RECIBIDO EN SOCIEDAD',
        sourceType: 'compra_directa',
        sourceEntity: `Sociedad / Alianza con ${partnerName || 'Socio'}`,
        invoiceNumber: `SOC-${Date.now().toString().slice(-4)}`,
        purchaseDate: new Date().toLocaleDateString('es-CO'),
        paddockId: sociedadPaddockId || undefined,
        pricePerKg: priceKg,
        freightCost: 0,
        heads: heads,
        currentAvgWeight: avgW,
        targetWeight: avgW + 150,
        ageRange: '12-20 Meses',
        sexLabel: 'Recibidos en Sociedad',
        animals: Array.from({ length: heads }, (_, idx) => ({
          id: `anim-soc-${Date.now()}-${idx}`,
          tag: `#SOC-${7000 + idx + 1}`,
          weightKg: avgW,
          sex: 'macho',
          breed: 'Cebú Comercial / Sociedad',
          pricePerKg: priceKg,
          totalPrice: Math.round(avgW * priceKg),
          lotCode: `SOC-${(partnerName || 'SOC').slice(0, 3).toUpperCase()}`,
          notes: `Recibido en sociedad con ${partnerName}. Esquema: ${shareScheme}`,
        })),
        notes: `Recibido en sociedad. Socio: ${partnerName} (CC/NIT: ${partnerDoc}, Tel: ${partnerPhone}). Esquema: ${shareScheme}. ${sociedadNotes}`,
      };

      onRegisterAuctionLot(sociedadLotData);

      onAddActivity(
        `Recibido en Sociedad: ${partnerName || 'Socio'}`,
        `${heads} Cab. (${avgW} kg prom.) • Participación: ${shareScheme} • Asignado a ${farmName}`,
        `+${heads} Cab.`,
        'weigh',
      );
    }
    // 4. PASAJE / TRASLADO
    else if (eventType === 'pasaje') {
      const heads = parseInt(pasajeHeads, 10) || 1;
      const origPad = targetPaddocks.find((p) => p.id === pasajeOriginPaddockId)?.name || 'Potrero Origen';
      const guideText = icaGuideNumber ? ` • Guía ICA: ${icaGuideNumber}` : '';
      const transporterText = transporterName ? ` • Transp: ${transporterName} (${truckPlate})` : '';

      onAddActivity(
        `Pasaje / Traslado: ${heads} Cabezas`,
        `Origen: ${origPad} ➔ Destino: ${pasajeTargetFarmOrPaddock || 'Nuevo Potrero'}${guideText}${transporterText}`,
        `${heads} Cab.`,
        'weigh',
      );
    }
    // 5. MONTA / REPRODUCCIÓN
    else if (eventType === 'monta' || eventType === 'ia') {
      const femTag = montaFemaleTag.trim() || tag.trim();
      const sireText = montaSireOrStraw.trim() || bullOrSire.trim();
      const fppDate = new Date(Date.now() + 283 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO');

      onAddActivity(
        `Reproducción (${montaType.toUpperCase()}) - ${femTag}`,
        `Vaca: ${femTag} • Toro/Pajilla: ${sireText} • FPP Est: ${fppDate} • Resp: ${montaTechnician || 'Inseminador'}`,
        'Servicio IA',
        'genetics',
      );
    }
    // 6. SANIDAD
    else if (eventType === 'health') {
      const withdrawalNotice = parseInt(healthWithdrawalDays, 10) > 0 ? ` • Retiro: ${healthWithdrawalDays} días` : '';
      onAddActivity(
        `Tratamiento Sanitario: ${healthProduct || 'Medicamento'}`,
        `Tipo: ${healthType.toUpperCase()} • Dosis: ${healthDose} ml/cab. • Lote: ${healthBatchCode || 'S/N'}${withdrawalNotice} • ${farmName}`,
        'Sanitario',
        'health',
      );
    }
    // 7. PESAJE
    else {
      onAddActivity(
        `Pesaje Individual ${tag} (${farmName})`,
        `Pesado en ${farmName} • Báscula principal`,
        `${individualWeight} kg`,
        'weigh',
      );
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#012d1d', '#ffba38', '#c1ecd4', '#2d6a4f'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 md:p-7 border-2 border-[#c1c8c2] shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#012d1d]">Módulo de Registro Ganadero</h3>
            </div>
            <p className="text-xs text-[#717973] mt-0.5">
              Seleccione la ruta de registro (Compra con datos del vendedor, Nacimientos, Sociedad, Pasaje, Monta o Sanidad)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#717973] hover:text-black hover:bg-[#f3f3f3] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 my-3 overflow-y-auto flex-1 pr-1 text-xs">
          {/* 1. SELECTOR DE PREDIO DESTINO */}
          <div className="bg-[#f2f7f4] border-2 border-[#c1ecd4] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-[#012d1d] uppercase flex items-center gap-1.5 tracking-wider">
                <Building2 className="w-4 h-4 text-[#2d6a4f]" />
                <span>Predio Destino / Asignación de Inventario</span>
              </label>
              <span className="text-[10px] bg-[#c1ecd4] text-[#002114] font-bold px-2 py-0.5 rounded-full">
                {farms.length} {farms.length === 1 ? 'predio disponible' : 'predios registrados'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {farms.map((f) => {
                const isSelected = f.profile.id === selectedFarmId;
                const heads = f.headsCount || f.profile.headsCount || 0;
                return (
                  <button
                    key={f.profile.id}
                    type="button"
                    onClick={() => {
                      setSelectedFarmId(f.profile.id);
                      setSelectedPaddockId('');
                      if ((eventType === 'compra' || eventType === 'auction') && !lotName.includes('Compra')) {
                        setLotName(`Lote Compra - ${f.profile.name}`);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-[#012d1d] bg-white ring-2 ring-[#012d1d] shadow-sm'
                        : 'border-[#c1c8c2] bg-[#fbfbfb] hover:bg-white text-[#414844]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-bold text-xs text-[#012d1d] truncate">{f.profile.name}</p>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-[10px] text-[#717973] truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {f.profile.municipality}, {f.profile.department}
                    </p>
                    <div className="flex items-center justify-between text-[10px] mt-1.5 pt-1.5 border-t border-[#eeeeee]">
                      <span className="font-mono font-bold text-[#2d6a4f]">{heads} Cabezas</span>
                      <span className="text-[#717973]">{f.profile.totalAreaHa} Ha</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. REGISTRATION MODULE TABS (ONLY ICON + NAME) */}
          <div>
            <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-2 tracking-wide">
              Ruta de Registro / Módulo Independiente
            </label>
            <div className="bg-[#f2f4f3] border border-[#d6e2db] p-2 rounded-2xl grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
              {/* 1. COMPRA */}
              <button
                type="button"
                onClick={() => setEventType('compra')}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                  eventType === 'compra' || eventType === 'auction'
                    ? 'bg-[#012d1d] text-white shadow-md ring-2 ring-[#012d1d]/30'
                    : 'bg-white/80 text-[#3a4d3f] hover:bg-white hover:text-[#012d1d] border border-transparent hover:border-[#c1c8c2]'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 ${eventType === 'compra' || eventType === 'auction' ? 'text-[#ffba38]' : 'text-[#012d1d]'}`} />
                <span className="text-xs text-center leading-tight">Compra</span>
              </button>

              {/* 2. NACIMIENTO */}
              <button
                type="button"
                onClick={() => setEventType('birth')}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                  eventType === 'birth'
                    ? 'bg-[#012d1d] text-white shadow-md ring-2 ring-[#012d1d]/30'
                    : 'bg-white/80 text-[#3a4d3f] hover:bg-white hover:text-[#012d1d] border border-transparent hover:border-[#c1c8c2]'
                }`}
              >
                <Baby className={`w-5 h-5 ${eventType === 'birth' ? 'text-emerald-300' : 'text-emerald-600'}`} />
                <span className="text-xs text-center leading-tight">Nacimiento</span>
              </button>

              {/* 3. SOCIEDAD */}
              <button
                type="button"
                onClick={() => setEventType('sociedad')}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                  eventType === 'sociedad'
                    ? 'bg-[#012d1d] text-white shadow-md ring-2 ring-[#012d1d]/30'
                    : 'bg-white/80 text-[#3a4d3f] hover:bg-white hover:text-[#012d1d] border border-transparent hover:border-[#c1c8c2]'
                }`}
              >
                <Users className={`w-5 h-5 ${eventType === 'sociedad' ? 'text-amber-300' : 'text-amber-600'}`} />
                <span className="text-xs text-center leading-tight">Sociedad</span>
              </button>

              {/* 4. PASAJE */}
              <button
                type="button"
                onClick={() => setEventType('pasaje')}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                  eventType === 'pasaje'
                    ? 'bg-[#012d1d] text-white shadow-md ring-2 ring-[#012d1d]/30'
                    : 'bg-white/80 text-[#3a4d3f] hover:bg-white hover:text-[#012d1d] border border-transparent hover:border-[#c1c8c2]'
                }`}
              >
                <Truck className={`w-5 h-5 ${eventType === 'pasaje' ? 'text-sky-300' : 'text-sky-600'}`} />
                <span className="text-xs text-center leading-tight">Pasaje</span>
              </button>

              {/* 5. MONTA / IA */}
              <button
                type="button"
                onClick={() => setEventType('monta')}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                  eventType === 'monta' || eventType === 'ia'
                    ? 'bg-[#012d1d] text-white shadow-md ring-2 ring-[#012d1d]/30'
                    : 'bg-white/80 text-[#3a4d3f] hover:bg-white hover:text-[#012d1d] border border-transparent hover:border-[#c1c8c2]'
                }`}
              >
                <Heart className={`w-5 h-5 ${eventType === 'monta' || eventType === 'ia' ? 'text-pink-300' : 'text-pink-600'}`} />
                <span className="text-xs text-center leading-tight">Monta / IA</span>
              </button>

              {/* 6. SANIDAD */}
              <button
                type="button"
                onClick={() => setEventType('health')}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                  eventType === 'health'
                    ? 'bg-[#012d1d] text-white shadow-md ring-2 ring-[#012d1d]/30'
                    : 'bg-white/80 text-[#3a4d3f] hover:bg-white hover:text-[#012d1d] border border-transparent hover:border-[#c1c8c2]'
                }`}
              >
                <Stethoscope className={`w-5 h-5 ${eventType === 'health' ? 'text-rose-300' : 'text-rose-600'}`} />
                <span className="text-xs text-center leading-tight">Sanidad</span>
              </button>

              {/* 7. PESAJE */}
              <button
                type="button"
                onClick={() => setEventType('weigh')}
                className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                  eventType === 'weigh'
                    ? 'bg-[#012d1d] text-white shadow-md ring-2 ring-[#012d1d]/30'
                    : 'bg-white/80 text-[#3a4d3f] hover:bg-white hover:text-[#012d1d] border border-transparent hover:border-[#c1c8c2]'
                }`}
              >
                <Scale className={`w-5 h-5 ${eventType === 'weigh' ? 'text-amber-300' : 'text-amber-600'}`} />
                <span className="text-xs text-center leading-tight">Pesaje</span>
              </button>
            </div>
          </div>

          {/* ========================================== */}
          {/* MÓDULO 1: COMPRA DE GANADO CON INF. VENDEDOR */}
          {/* ========================================== */}
          {(eventType === 'compra' || eventType === 'auction') && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#fbfbfb] border border-[#d6e2db] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
                  <p className="text-xs font-bold text-[#012d1d] flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-[#dc9a00]" />
                    Información de la Compra & Origen del Ganado
                  </p>
                  <span className="text-[10px] bg-[#e8f5e9] text-[#1b5e20] font-mono font-bold px-2 py-0.5 rounded">
                    Módulo de Compras
                  </span>
                </div>

                {/* Seleccionar Origen / Vendedor (Subasta vs Particular, etc) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Origen / Tipo de Vendedor *
                    </label>
                    <select
                      value={sellerType}
                      onChange={(e) => setSellerType(e.target.value as any)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-2 font-bold text-xs text-[#012d1d]"
                    >
                      <option value="subasta">🏛️ Subasta Comercial (Subastar, Cogasucre, etc)</option>
                      <option value="particular">👤 Particular / Ganadero Directo</option>
                      <option value="comerciante">💼 Comerciante / Intermediario</option>
                      <option value="finca">🏡 Finca / Criadero Vecino</option>
                      <option value="empresa">🏢 Empresa Comercializadora</option>
                    </select>
                  </div>

                  {sellerType === 'subasta' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Entidad / Subasta
                      </label>
                      <select
                        value={auctionEntity}
                        onChange={(e) => setAuctionEntity(e.target.value)}
                        className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-2 font-semibold text-xs"
                      >
                        <option value="Subastar S.A. (Montería / Planeta Rica)">Subastar S.A. (Córdoba)</option>
                        <option value="Subacasanare (Yopal / Aguazul)">Subacasanare (Casanare / Meta)</option>
                        <option value="Cogasucre (Sincelejo)">Cogasucre (Sucre)</option>
                        <option value="Subagauca (La Dorada / Caldas)">Subagauca (Magdalena Medio)</option>
                        <option value="SubaOriente (Puerto Boyacá)">SubaOriente</option>
                        <option value="Feria de Ganados Medellín">Feria de Ganados Medellín</option>
                        <option value="Otro / Particular">Otra Subasta...</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                        Nombre del Vendedor / Razón Social *
                      </label>
                      <input
                        type="text"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        placeholder="Ej. Don Carlos Mendoza - Finca El Recuerdo"
                        className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-2 text-xs font-bold"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Factura / Liquidación / Guía *
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-2 font-mono font-bold text-xs text-[#012d1d]"
                      required
                    />
                  </div>
                </div>

                {/* Campos Detallados de Información del Vendedor */}
                <div className="bg-[#f2f7f4] border border-[#c1ecd4] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black text-[#012d1d] uppercase flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#2d6a4f]" />
                      Información Detallada del Vendedor / Proveedor
                    </span>
                    <span className="text-[9px] text-[#2d6a4f] font-semibold">Trazabilidad Comercial</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {sellerType === 'subasta' && (
                      <div>
                        <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                          Consignatario / Vendedor
                        </label>
                        <input
                          type="text"
                          value={sellerName}
                          onChange={(e) => setSellerName(e.target.value)}
                          placeholder="Nombre del criadero o dueño"
                          className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Cédula / NIT del Vendedor
                      </label>
                      <input
                        type="text"
                        value={sellerDoc}
                        onChange={(e) => setSellerDoc(e.target.value)}
                        placeholder="Ej. 91.234.567-8"
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Teléfono / Contacto
                      </label>
                      <input
                        type="text"
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        placeholder="Ej. 310 555 1234"
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Ubicación / Municipio
                      </label>
                      <input
                        type="text"
                        value={sellerLocation}
                        onChange={(e) => setSellerLocation(e.target.value)}
                        placeholder="Ej. Montería, Córdoba"
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>

                    <div className={sellerType === 'subasta' ? 'col-span-1' : 'col-span-1 sm:col-span-2'}>
                      <label className="block text-[9.5px] font-bold text-[#717973] uppercase mb-0.5">
                        Garantía / Estado Sanitario
                      </label>
                      <input
                        type="text"
                        value={sellerSanitaryStatus}
                        onChange={(e) => setSellerSanitaryStatus(e.target.value)}
                        placeholder="Hato libre, vacunas al día..."
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Nombre de Lote, Categoría, Potrero, Precio Base */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Nombre del Lote *
                    </label>
                    <input
                      type="text"
                      value={lotName}
                      onChange={(e) => setLotName(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Categoría Zootécnica
                    </label>
                    <select
                      value={lotCategory}
                      onChange={(e) => setLotCategory(e.target.value as LotCategory)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-semibold text-xs"
                    >
                      <option value="ceba">Ceba Intensiva (Engorde)</option>
                      <option value="cria">Cría / Levante</option>
                      <option value="leche">Lechería / Doble Propósito</option>
                      <option value="genetica">Genética / Reproductores</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Potrero Destino en {targetFarm?.profile?.name}
                    </label>
                    <select
                      value={selectedPaddockId}
                      onChange={(e) => setSelectedPaddockId(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#012d1d]"
                    >
                      <option value="">-- Asignar más tarde --</option>
                      {targetPaddocks.map((pad) => (
                        <option key={pad.id} value={pad.id}>
                          {pad.code} - {pad.name} ({pad.areaHa} Ha • {pad.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Precio Base / Kilo ($ COP)
                    </label>
                    <input
                      type="number"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                      placeholder="8750"
                      className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Mode Switcher: Excel Import vs Quick Manual */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#79564b] uppercase">
                    Método de Ingreso de los Animales Comprados
                  </span>
                  <div className="flex items-center gap-1 bg-[#f3f3f3] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAuctionEntryMode('quick')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                        auctionEntryMode === 'quick' ? 'bg-[#012d1d] text-white shadow-xs' : 'text-[#414844]'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      Ingreso Rápido por Lote
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuctionEntryMode('excel')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                        auctionEntryMode === 'excel' ? 'bg-[#012d1d] text-white shadow-xs' : 'text-[#414844]'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Importar Excel / Subasta ({importedAnimals.length})
                    </button>
                  </div>
                </div>

                {auctionEntryMode === 'excel' ? (
                  <AuctionExcelImporter
                    animals={importedAnimals}
                    onAnimalsChange={setImportedAnimals}
                    defaultPricePerKg={parseFloat(pricePerKg) || 8750}
                  />
                ) : (
                  <div className="bg-[#fbfbfb] border border-[#d6e2db] rounded-2xl p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          N° de Cabezas *
                        </label>
                        <input
                          type="number"
                          value={quickHeads}
                          onChange={(e) => setQuickHeads(e.target.value)}
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-extrabold text-sm text-[#012d1d]"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-[#717973] uppercase">
                            Peso Promedio (kg) *
                          </label>
                          {liveScaleWeight && (
                            <button
                              type="button"
                              onClick={handleFetchFromScale}
                              className="text-[9px] text-emerald-800 font-bold bg-[#c1ecd4] hover:bg-[#a5d0b9] px-1 py-0.5 rounded flex items-center gap-1"
                            >
                              <Zap className="w-2.5 h-2.5 text-[#dc9a00]" />
                              Báscula ({liveScaleWeight.toFixed(1)} kg)
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={quickAvgWeight}
                          onChange={(e) => setQuickAvgWeight(e.target.value)}
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-sm text-[#012d1d]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Sexo Predominante
                        </label>
                        <select
                          value={quickSex}
                          onChange={(e) => setQuickSex(e.target.value as any)}
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-semibold"
                        >
                          <option value="Machos">Machos (Ceba / Levante)</option>
                          <option value="Hembras">Hembras</option>
                          <option value="Mixto">Lote Mixto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                          Raza / Cruce
                        </label>
                        <input
                          type="text"
                          value={quickBreed}
                          onChange={(e) => setQuickBreed(e.target.value)}
                          className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="bg-[#e6f4ea] p-2.5 rounded-xl text-xs text-[#002114] flex items-center justify-between">
                      <span>
                        Se generarán <strong>{quickHeads} animales</strong> con un peso total estimado de{' '}
                        <strong>
                          {((parseInt(quickHeads, 10) || 0) * (parseFloat(quickAvgWeight) || 0)).toLocaleString('es-CO')} kg
                        </strong>
                      </span>
                      <span className="font-mono font-bold text-[#012d1d]">
                        ${(
                          ((parseInt(quickHeads, 10) || 0) *
                            (parseFloat(quickAvgWeight) || 0) *
                            (parseFloat(pricePerKg) || 8750)) /
                          1000000
                        ).toFixed(2)}{' '}
                        M COP
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 2: NACIMIENTOS */}
          {/* ========================================== */}
          {eventType === 'birth' && (
            <div className="space-y-4 pt-1">
              <div className="p-3.5 bg-[#e8f5e9]/90 border border-[#a5d6a7] rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#a5d6a7] pb-1.5">
                  <span className="text-xs font-bold text-[#1b5e20] flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-[#2e7d32]" /> Trazabilidad de Nacimiento & Genealogía
                  </span>
                  <span className="text-[9.5px] bg-[#2e7d32] text-white px-2 py-0.5 rounded font-mono font-bold">
                    Módulo Nacimiento
                  </span>
                </div>

                {birthError && (
                  <div className="p-2 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{birthError}</span>
                  </div>
                )}

                {/* PREDIO DE ORIGEN */}
                <div className="bg-white p-2.5 rounded-xl border border-[#a5d6a7] space-y-1">
                  <label className="block text-[10.5px] font-black text-[#1b5e20] uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#2e7d32]" />
                      Predio de Origen (Dónde Nació) *
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={birthOriginFarmId}
                      onChange={(e) => {
                        setBirthOriginFarmId(e.target.value);
                        setBirthError(null);
                      }}
                      className="w-full bg-[#f9fbf9] border border-[#a5d6a7] rounded-xl px-2.5 py-1.5 font-bold text-[#012d1d] text-xs"
                    >
                      {farms.map((f) => (
                        <option key={f.profile.id} value={f.profile.id}>
                          🏡 {f.profile.name}
                        </option>
                      ))}
                      <option value="custom">✍️ Otro Predio Externo...</option>
                    </select>
                    {birthOriginFarmId === 'custom' && (
                      <input
                        type="text"
                        value={customOriginFarmName}
                        onChange={(e) => setCustomOriginFarmName(e.target.value)}
                        placeholder="Nombre del predio de origen..."
                        className="w-full bg-white border border-[#a5d6a7] rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                      />
                    )}
                  </div>
                </div>

                {/* MADRE & PADRE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border-2 border-emerald-600/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black text-[#012d1d] uppercase flex items-center gap-1">
                        <Dna className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Madre (Carga del Sistema) *</span>
                      </label>
                      <span className="text-[8.5px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded uppercase">
                        Obligatorio
                      </span>
                    </div>
                    <select
                      value={parentTag}
                      onChange={(e) => {
                        setParentTag(e.target.value);
                        setBirthError(null);
                      }}
                      className="w-full bg-[#f4fbf6] border border-emerald-500 rounded-xl px-2.5 py-1.5 font-bold text-[#012d1d] text-xs"
                    >
                      <option value="">-- Seleccionar Madre del Sistema --</option>
                      {systemCows.length > 0 && (
                        <optgroup label="Cargadas en el Sistema">
                          {systemCows.map((c) => (
                            <option key={c.id || c.tag} value={`${c.tag} ${c.name ? `(${c.name})` : ''}`}>
                              🐮 #{c.tag} {c.name ? `- ${c.name}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Matrices Registradas">
                        {DEFAULT_SYSTEM_DAMS.map((d) => (
                          <option key={d.tag} value={d.tag}>
                            🐮 #{d.tag} - {d.breed}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <input
                      type="text"
                      value={parentTag}
                      onChange={(e) => {
                        setParentTag(e.target.value);
                        setBirthError(null);
                      }}
                      placeholder="O digite arete de la madre..."
                      className="w-full bg-white border border-[#a5d6a7] rounded-xl px-2.5 py-1 text-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#a5d6a7] space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black text-[#012d1d] uppercase flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Padre (Carga del Sistema)</span>
                      </label>
                      <span className="text-[8.5px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.2 rounded uppercase">
                        Opcional
                      </span>
                    </div>
                    <select
                      value={birthSireTag}
                      onChange={(e) => setBirthSireTag(e.target.value)}
                      className="w-full bg-[#fbfbfe] border border-[#a5d6a7] rounded-xl px-2.5 py-1.5 font-bold text-[#012d1d] text-xs"
                    >
                      <option value="Sin padre registrado (Desconocido)">
                        ❓ Sin padre registrado (Desconocido / Sin trazabilidad)
                      </option>
                      {systemBulls.length > 0 && (
                        <optgroup label="Toros del Sistema">
                          {systemBulls.map((b) => (
                            <option key={b.id || b.tag} value={`${b.tag} ${b.name ? `(${b.name})` : ''}`}>
                              🐂 #{b.tag} {b.name ? `- ${b.name}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Toros & Pajillas IA">
                        {DEFAULT_SYSTEM_SIRES.map((s) => (
                          <option key={s.tag} value={s.tag}>
                            🐂 {s.tag} - {s.breed}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <input
                      type="text"
                      value={birthSireTag}
                      onChange={(e) => setBirthSireTag(e.target.value)}
                      placeholder="O digite el toro o pajilla..."
                      className="w-full bg-white border border-[#a5d6a7] rounded-xl px-2.5 py-1 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* CARACTERÍSTICAS DEL ANIMAL (RAZA, COLOR, TIPO, SEXO, HIERRO) */}
                <div className="bg-white p-2.5 rounded-xl border border-[#a5d6a7] space-y-2">
                  <span className="text-[10px] font-black text-[#1b5e20] uppercase block">
                    🧬 Datos del Ternero (Raza, Pelaje, Pureza, Sexo, Hierro)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[9.5px] font-bold text-[#2e7d32] uppercase mb-0.5">
                        Sexo *
                      </label>
                      <select
                        value={birthSex}
                        onChange={(e) => setBirthSex(e.target.value as 'macho' | 'hembra')}
                        className="w-full bg-[#f4fbf6] border border-[#a5d6a7] rounded-lg px-2 py-1 text-xs font-bold"
                      >
                        <option value="hembra">Hembra ♀</option>
                        <option value="macho">Macho ♂</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#2e7d32] uppercase mb-0.5">
                        Tipo / Pureza *
                      </label>
                      <select
                        value={birthCattleType}
                        onChange={(e) => setBirthCattleType(e.target.value)}
                        className="w-full bg-[#f4fbf6] border border-[#a5d6a7] rounded-lg px-2 py-1 text-xs font-bold"
                      >
                        <option value="comercial">Comercial</option>
                        <option value="puro_comercial">Puro Comercial</option>
                        <option value="puro_registrable">Puro / Registrable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#2e7d32] uppercase mb-0.5">
                        Raza / Cruce *
                      </label>
                      <select
                        value={birthBreed}
                        onChange={(e) => setBirthBreed(e.target.value)}
                        className="w-full bg-white border border-[#a5d6a7] rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="Brahman Blanco">Brahman Blanco</option>
                        <option value="Brahman Rojo">Brahman Rojo</option>
                        <option value="Gyr Lechero">Gyr Lechero</option>
                        <option value="Nelore">Nelore</option>
                        <option value="Guzerá">Guzerá</option>
                        <option value="Brangus">Brangus</option>
                        <option value="Simbrah">Simbrah</option>
                        <option value="Holstein">Holstein</option>
                        <option value="Jersey">Jersey / Jerthol</option>
                        <option value="Girolando">Girolando</option>
                        <option value="F1 / F2">F1 / F2</option>
                        <option value="Siete Colores">Siete Colores</option>
                        <option value="Criollo">Criollo Romosinuano</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#2e7d32] uppercase mb-0.5">
                        Color / Pelaje *
                      </label>
                      <select
                        value={birthColor}
                        onChange={(e) => setBirthColor(e.target.value)}
                        className="w-full bg-white border border-[#a5d6a7] rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="Blanco / Gris">⚪ Blanco / Gris</option>
                        <option value="Rojo / Sardo">🔴 Rojo / Sardo</option>
                        <option value="Bayo / Amarillo">🟡 Bayo / Amarillo</option>
                        <option value="Negro / Arrebolado">⚫ Negro / Arrebolado</option>
                        <option value="Hosco / Chorreado">🟤 Hosco / Chorreado</option>
                        <option value="Pintado / Overo">⚪🔴 Pintado / Overo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-[#b71c1c] uppercase mb-0.5 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-[#e65100]" />
                        Hierro / Marca *
                      </label>
                      <select
                        value={selectedBrandingIronId}
                        onChange={(e) => setSelectedBrandingIronId(e.target.value)}
                        className="w-full bg-[#fffde7] border border-[#fbc02d] rounded-lg px-2 py-1 text-xs font-bold text-[#3e2723]"
                      >
                        <option value="">-- Sin Hierro --</option>
                        {brandingIrons.map((iron) => (
                          <option key={iron.id} value={iron.id}>
                            {iron.symbolIcon || '🔥'} {iron.name} ({iron.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-1">
                      Arete / Chapeta Ternero *
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#79564b] uppercase">
                        Peso al Nacer (kg) *
                      </label>
                      {liveScaleWeight && (
                        <button
                          type="button"
                          onClick={handleFetchFromScale}
                          className="text-[10px] text-emerald-800 font-bold bg-[#c1ecd4] px-1.5 py-0.5 rounded flex items-center gap-1"
                        >
                          <Zap className="w-2.5 h-2.5 text-[#dc9a00]" />
                          Báscula ({liveScaleWeight.toFixed(1)} kg)
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={individualWeight}
                      onChange={(e) => setIndividualWeight(e.target.value)}
                      className="w-full bg-white border border-[#a5d6a7] rounded-xl px-3 py-1.5 font-mono font-bold text-[#012d1d] text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 3: RECIBIDOS EN SOCIEDAD */}
          {/* ========================================== */}
          {eventType === 'sociedad' && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#fffdf5] border-2 border-[#ffe082] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#ffe082] pb-2">
                  <span className="text-xs font-bold text-[#5d4037] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#f57f17]" />
                    Registro de Ganado Recibido en Sociedad / Alianza / Aumento
                  </span>
                  <span className="text-[10px] bg-[#fff8e1] text-[#f57f17] font-mono font-bold px-2 py-0.5 rounded border border-[#ffe082]">
                    Módulo Sociedad
                  </span>
                </div>

                {/* Datos del Socio / Inversionista */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Nombre del Socio / Inversionista *
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Ej. Don Gabriel Gómez"
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Cédula / NIT del Socio
                    </label>
                    <input
                      type="text"
                      value={partnerDoc}
                      onChange={(e) => setPartnerDoc(e.target.value)}
                      placeholder="Ej. 80.123.456"
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="text"
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      placeholder="Ej. 311 890 1234"
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Esquema de Participación y Cantidades */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Esquema de Participación *
                    </label>
                    <select
                      value={shareScheme}
                      onChange={(e) => setShareScheme(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-semibold text-xs"
                    >
                      <option value="50% Socio / 50% Finca (En Aumento)">50% Socio / 50% Finca (Aumento)</option>
                      <option value="60% Finca / 40% Socio">60% Finca / 40% Socio</option>
                      <option value="70% Finca / 30% Socio">70% Finca / 30% Socio</option>
                      <option value="Fijo $ por Kilo Ganado">Fijo $ por Kilo de Aumento</option>
                      <option value="Ganado en Pastoreo (Alquiler)">Alquiler de Pastos / Pastaje</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Cabezas Recibidas *
                    </label>
                    <input
                      type="number"
                      value={sociedadHeads}
                      onChange={(e) => setSociedadHeads(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Peso Promedio Entrada (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={sociedadAvgWeight}
                      onChange={(e) => setSociedadAvgWeight(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Valor Base / Kg ($ COP)
                    </label>
                    <input
                      type="number"
                      value={sociedadPricePerKg}
                      onChange={(e) => setSociedadPricePerKg(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Potrero & Notas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Potrero Asignado en {targetFarm?.profile?.name}
                    </label>
                    <select
                      value={sociedadPaddockId}
                      onChange={(e) => setSociedadPaddockId(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                    >
                      <option value="">-- Seleccionar Potrero --</option>
                      {targetPaddocks.map((pad) => (
                        <option key={pad.id} value={pad.id}>
                          {pad.code} - {pad.name} ({pad.areaHa} Ha)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Observaciones del Contrato / Acuerdo
                    </label>
                    <input
                      type="text"
                      value={sociedadNotes}
                      onChange={(e) => setSociedadNotes(e.target.value)}
                      placeholder="Plazo de liquidación, condiciones sanitarias..."
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 4: PASAJE / TRASLADO */}
          {/* ========================================== */}
          {eventType === 'pasaje' && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#f0f7ff] border-2 border-[#90caf9] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#90caf9] pb-2">
                  <span className="text-xs font-bold text-[#0d47a1] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#1976d2]" />
                    Módulo de Pasaje, Rotación y Traslado de Ganado
                  </span>
                  <span className="text-[10px] bg-[#e3f2fd] text-[#0d47a1] font-mono font-bold px-2 py-0.5 rounded border border-[#90caf9]">
                    Módulo Pasaje
                  </span>
                </div>

                {/* Tipo de Pasaje & Datos de Origen / Destino */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Tipo de Pasaje *
                    </label>
                    <select
                      value={pasajeType}
                      onChange={(e) => setPasajeType(e.target.value as any)}
                      className="w-full bg-white border border-[#90caf9] rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#0d47a1]"
                    >
                      <option value="potreros">🔄 Rotación entre Potreros de la misma Finca</option>
                      <option value="predios">🚛 Traslado a otra Finca / Predio Externo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Potrero / Predio Origen
                    </label>
                    <select
                      value={pasajeOriginPaddockId}
                      onChange={(e) => setPasajeOriginPaddockId(e.target.value)}
                      className="w-full bg-white border border-[#90caf9] rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                    >
                      <option value="">-- Seleccionar Origen --</option>
                      {targetPaddocks.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Potrero / Predio Destino *
                    </label>
                    <input
                      type="text"
                      value={pasajeTargetFarmOrPaddock}
                      onChange={(e) => setPasajeTargetFarmOrPaddock(e.target.value)}
                      placeholder="Ej. Potrero La Ceiba #4 o Finca La Guajira"
                      className="w-full bg-white border border-[#90caf9] rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Guía ICA y Transportador */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Guía ICA / Movilización
                    </label>
                    <input
                      type="text"
                      value={icaGuideNumber}
                      onChange={(e) => setIcaGuideNumber(e.target.value)}
                      placeholder="Ej. ICA-89012"
                      className="w-full bg-white border border-[#90caf9] rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-[#0d47a1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Empresa / Conductor
                    </label>
                    <input
                      type="text"
                      value={transporterName}
                      onChange={(e) => setTransporterName(e.target.value)}
                      placeholder="Ej. Transp. Ganaderos"
                      className="w-full bg-white border border-[#90caf9] rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Placa Vehículo
                    </label>
                    <input
                      type="text"
                      value={truckPlate}
                      onChange={(e) => setTruckPlate(e.target.value)}
                      placeholder="WNK-452"
                      className="w-full bg-white border border-[#90caf9] rounded-xl px-2.5 py-1.5 text-xs font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Costo Flete / Traslado ($)
                    </label>
                    <input
                      type="number"
                      value={pasajeFreightCost}
                      onChange={(e) => setPasajeFreightCost(e.target.value)}
                      className="w-full bg-white border border-[#90caf9] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Cabezas Movidas *
                    </label>
                    <input
                      type="number"
                      value={pasajeHeads}
                      onChange={(e) => setPasajeHeads(e.target.value)}
                      className="w-full bg-white border border-[#90caf9] rounded-xl px-2.5 py-1.5 font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Observaciones del Traslado
                    </label>
                    <input
                      type="text"
                      value={pasajeNotes}
                      onChange={(e) => setPasajeNotes(e.target.value)}
                      className="w-full bg-white border border-[#90caf9] rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 5: MONTA / REPRODUCCIÓN */}
          {/* ========================================== */}
          {(eventType === 'monta' || eventType === 'ia') && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#fce4ec] border-2 border-[#f8bbd0] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#f8bbd0] pb-2">
                  <span className="text-xs font-bold text-[#880e4f] flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#c2185b]" />
                    Módulo de Servido, Monta Directa e Inseminación Artificial
                  </span>
                  <span className="text-[10px] bg-[#f8bbd0] text-[#880e4f] font-mono font-bold px-2 py-0.5 rounded">
                    Módulo Monta / IA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Tipo de Servicio *
                    </label>
                    <select
                      value={montaType}
                      onChange={(e) => setMontaType(e.target.value as any)}
                      className="w-full bg-white border border-[#f8bbd0] rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#880e4f]"
                    >
                      <option value="ia">🧪 Inseminación Artificial (IA)</option>
                      <option value="iatf">⏱️ IA a Tiempo Fijo (IATF)</option>
                      <option value="monta_directa">🐂 Monta Directa (Toro en Campo)</option>
                      <option value="te">🔬 Transferencia de Embrión (TE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Vaca / Hembra Servida *
                    </label>
                    <input
                      type="text"
                      value={montaFemaleTag}
                      onChange={(e) => setMontaFemaleTag(e.target.value)}
                      placeholder="Arete o Nombre de la Vaca"
                      className="w-full bg-white border border-[#f8bbd0] rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Toro Reproductor / Pajilla *
                    </label>
                    <input
                      type="text"
                      value={montaSireOrStraw}
                      onChange={(e) => setMontaSireOrStraw(e.target.value)}
                      placeholder="Nombre del toro o pajilla"
                      className="w-full bg-white border border-[#f8bbd0] rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Inseminador / Veterinario
                    </label>
                    <input
                      type="text"
                      value={montaTechnician}
                      onChange={(e) => setMontaTechnician(e.target.value)}
                      placeholder="Nombre del técnico"
                      className="w-full bg-white border border-[#f8bbd0] rounded-xl px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Fecha del Servicio
                    </label>
                    <input
                      type="date"
                      value={montaServiceDate}
                      onChange={(e) => setMontaServiceDate(e.target.value)}
                      className="w-full bg-white border border-[#f8bbd0] rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-[#f8bbd0] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-[#717973] uppercase block">
                        Fecha Probable Parto (Est. +283d)
                      </span>
                      <span className="font-mono font-bold text-xs text-[#880e4f]">
                        {new Date(
                          new Date(montaServiceDate).getTime() + 283 * 24 * 60 * 60 * 1000,
                        ).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <Sparkles className="w-4 h-4 text-pink-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                    Detalle / Hormonas / Observaciones
                  </label>
                  <input
                    type="text"
                    value={montaNotes}
                    onChange={(e) => setMontaNotes(e.target.value)}
                    placeholder="Protocolo utilizado, condición corporal..."
                    className="w-full bg-white border border-[#f8bbd0] rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 6: SANIDAD */}
          {/* ========================================== */}
          {eventType === 'health' && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#ffebee] border-2 border-[#ffcdd2] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#ffcdd2] pb-2">
                  <span className="text-xs font-bold text-[#b71c1c] flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#d32f2f]" />
                    Módulo de Sanidad, Vacunación y Tratamientos
                  </span>
                  <span className="text-[10px] bg-[#ffcdd2] text-[#b71c1c] font-mono font-bold px-2 py-0.5 rounded">
                    Módulo Sanidad
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Tipo de Evento Sanitario *
                    </label>
                    <select
                      value={healthType}
                      onChange={(e) => setHealthType(e.target.value as any)}
                      className="w-full bg-white border border-[#ffcdd2] rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#b71c1c]"
                    >
                      <option value="vacunacion">💉 Vacunación Oficial (Aftosa, Brucelosis)</option>
                      <option value="desparasitacion">🪱 Desparasitación / Purga</option>
                      <option value="vitaminas">🧪 Vitaminas / Modificadores Orgánicos</option>
                      <option value="tratamiento">💊 Tratamiento Curativo / Antibiótico</option>
                      <option value="ombligo">🩺 Curación Ombligo / Heridas</option>
                      <option value="bano">🚿 Baño / Control Parásitos Externos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Producto / Medicamento *
                    </label>
                    <input
                      type="text"
                      value={healthProduct}
                      onChange={(e) => setHealthProduct(e.target.value)}
                      placeholder="Ej. Aftosa Limor, Ivomec, Dectomax"
                      className="w-full bg-white border border-[#ffcdd2] rounded-xl px-2.5 py-1.5 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Dosis por Animal (ml / cc)
                    </label>
                    <input
                      type="text"
                      value={healthDose}
                      onChange={(e) => setHealthDose(e.target.value)}
                      placeholder="Ej. 2.0 ml"
                      className="w-full bg-white border border-[#ffcdd2] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      Días de Retiro (Leche / Carne)
                    </label>
                    <input
                      type="number"
                      value={healthWithdrawalDays}
                      onChange={(e) => setHealthWithdrawalDays(e.target.value)}
                      className="w-full bg-white border border-[#ffcdd2] rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-red-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      N° Lote / Registro ICA
                    </label>
                    <input
                      type="text"
                      value={healthBatchCode}
                      onChange={(e) => setHealthBatchCode(e.target.value)}
                      placeholder="LOT-2026-X"
                      className="w-full bg-white border border-[#ffcdd2] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Costo Total Sanitario ($ COP)
                    </label>
                    <input
                      type="number"
                      value={healthCost}
                      onChange={(e) => setHealthCost(e.target.value)}
                      className="w-full bg-white border border-[#ffcdd2] rounded-xl px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                    Observaciones Sanitarias
                  </label>
                  <input
                    type="text"
                    value={healthNotes}
                    onChange={(e) => setHealthNotes(e.target.value)}
                    placeholder="Lote afectado, frasco utilizado..."
                    className="w-full bg-white border border-[#ffcdd2] rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MÓDULO 7: PESAJE */}
          {/* ========================================== */}
          {eventType === 'weigh' && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#fff8e1] border-2 border-[#ffe082] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#ffe082] pb-2">
                  <span className="text-xs font-bold text-[#795548] flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#ff8f00]" />
                    Módulo de Pesaje Colectivo e Individual
                  </span>
                  <span className="text-[10px] bg-[#ffe082] text-[#5d4037] font-mono font-bold px-2 py-0.5 rounded">
                    Módulo Pesaje
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-1">
                      Arete / ID Bovino *
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-3 py-2 font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#79564b] uppercase">
                        Peso Medido (kg) *
                      </label>
                      {liveScaleWeight && (
                        <button
                          type="button"
                          onClick={handleFetchFromScale}
                          className="text-[10px] text-emerald-800 font-bold bg-[#c1ecd4] px-1.5 py-0.5 rounded flex items-center gap-1"
                        >
                          <Zap className="w-2.5 h-2.5 text-[#dc9a00]" />
                          Báscula ({liveScaleWeight.toFixed(1)} kg)
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={individualWeight}
                      onChange={(e) => setIndividualWeight(e.target.value)}
                      className="w-full bg-white border border-[#ffe082] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d] text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-1">
                    Observaciones de Pesaje
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-[#ffe082] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#eeeeee] shrink-0">
            <button
              type="submit"
              className="flex-1 bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-extrabold py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 tactical-shadow transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5 text-[#523700]" />
              <span>
                Cargar e Ingresar a Inventario de{' '}
                <strong className="underline">{targetFarm?.profile?.name || 'Predio'}</strong>
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 bg-[#f3f3f3] hover:bg-[#e9eae9] text-[#414844] font-semibold rounded-2xl text-xs transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
