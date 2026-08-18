import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  X,
  FileText,
  Info,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Eye,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  FarmDataPackage,
  ImportedAnimalRecord,
  LotCategory,
  LotRecord,
} from '../../types';
import { FarmNumberingPolicy } from '../../types/numberingPolicy';
import { getSavedFarmNumberingPolicy } from '../../utils/numberingPolicyEngine';

interface MigrateInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  onCompleteMigration: (result: MigrationResult) => void;
}

export interface MigrationResult {
  targetFarmId: string;
  targetFarmName: string;
  totalImported: number;
  importedAnimals: ImportedAnimalRecord[];
  createdLots: LotRecord[];
  migrationSummary: {
    sourceType: 'excel' | 'csv' | 'paste' | 'template';
    fileName?: string;
    totalRows: number;
    validRows: number;
    errorRows: number;
    autoGroupedByLot: boolean;
    autoGroupedByCategory: boolean;
    initialCutoffOffsetUsed?: number;
    appliedPolicyType: string;
  };
}

interface ColumnMapping {
  tag: string;
  name?: string;
  weightKg: string;
  sex: string;
  breed: string;
  category: string;
  lotName: string;
  paddockName: string;
  ageMonths: string;
  color: string;
  brandingIron: string;
  movementGuide: string;
  costPrice: string;
  origin: string;
  siniganTag?: string;
}

export const MigrateInventoryModal: React.FC<MigrateInventoryModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  onCompleteMigration,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(
    currentFarmId !== 'all' ? currentFarmId : (farms[0]?.profile.id || 'finca-1')
  );

  // File parsing states
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Column mappings
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    tag: '',
    name: '',
    weightKg: '',
    sex: '',
    breed: '',
    category: '',
    lotName: '',
    paddockName: '',
    ageMonths: '',
    color: '',
    brandingIron: '',
    movementGuide: '',
    costPrice: '',
    origin: '',
    siniganTag: '',
  });

  // Migration Options
  const [autoCreateLots, setAutoCreateLots] = useState<boolean>(true);
  const [defaultLotName, setDefaultLotName] = useState<string>('Lote Migrado Inicial');
  const [defaultPaddockName, setDefaultPaddockName] = useState<string>('Potrero General');
  const [defaultBreed, setDefaultBreed] = useState<string>('Brahman Comercial');
  const [defaultCategory, setDefaultCategory] = useState<string>('Ceba');
  const [adoptNumberingPolicy, setAdoptNumberingPolicy] = useState<boolean>(true);
  const [fallbackPricePerKg, setFallbackPricePerKg] = useState<number>(8500);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFarm = useMemo(() => {
    return farms.find((f) => f.profile.id === selectedFarmId) || farms[0];
  }, [farms, selectedFarmId]);

  const activeFarmPolicy: FarmNumberingPolicy = useMemo(() => {
    return getSavedFarmNumberingPolicy(selectedFarmId);
  }, [selectedFarmId]);

  // Intelligent column auto-matcher
  const autoDetectMappings = (headers: string[]) => {
    const mapping: ColumnMapping = {
      tag: '',
      name: '',
      weightKg: '',
      sex: '',
      breed: '',
      category: '',
      lotName: '',
      paddockName: '',
      ageMonths: '',
      color: '',
      brandingIron: '',
      movementGuide: '',
      costPrice: '',
      origin: '',
      siniganTag: '',
    };

    headers.forEach((h) => {
      const clean = h.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (!mapping.tag && (clean.includes('arete') || clean.includes('id') || clean.includes('chapa') || clean.includes('codigo') || clean.includes('tag') || clean.includes('numero') || clean.includes('identificacion'))) {
        mapping.tag = h;
      } else if (!mapping.siniganTag && (clean.includes('sinigan') || clean.includes('ica') || clean.includes('din') || clean.includes('oficial') || clean.includes('rfid') || clean.includes('chip'))) {
        mapping.siniganTag = h;
      } else if (!mapping.name && (clean.includes('nombre') || clean.includes('alias'))) {
        mapping.name = h;
      } else if (!mapping.weightKg && (clean.includes('peso') || clean.includes('kg') || clean.includes('kilos') || clean.includes('weight'))) {
        mapping.weightKg = h;
      } else if (!mapping.sex && (clean.includes('sex') || clean.includes('genero') || clean.includes('macho') || clean.includes('hembra') || clean.includes('m_h') || clean.includes('tipo_sexo'))) {
        mapping.sex = h;
      } else if (!mapping.breed && (clean.includes('raza') || clean.includes('cruce') || clean.includes('fenotipo') || clean.includes('breed'))) {
        mapping.breed = h;
      } else if (!mapping.category && (clean.includes('categoria') || clean.includes('etapa') || clean.includes('tipo') || clean.includes('proposito'))) {
        mapping.category = h;
      } else if (!mapping.lotName && (clean.includes('lote') || clean.includes('grupo') || clean.includes('rodeo') || clean.includes('tropa'))) {
        mapping.lotName = h;
      } else if (!mapping.paddockName && (clean.includes('potrero') || clean.includes('poblado') || clean.includes('cuadro') || clean.includes('cercado') || clean.includes('paddock'))) {
        mapping.paddockName = h;
      } else if (!mapping.ageMonths && (clean.includes('edad') || clean.includes('meses') || clean.includes('mes') || clean.includes('age'))) {
        mapping.ageMonths = h;
      } else if (!mapping.color && (clean.includes('color') || clean.includes('capa') || clean.includes('pelaje'))) {
        mapping.color = h;
      } else if (!mapping.brandingIron && (clean.includes('hierro') || clean.includes('marca') || clean.includes('fierro') || clean.includes('brand'))) {
        mapping.brandingIron = h;
      } else if (!mapping.movementGuide && (clean.includes('guia') || clean.includes('movilizacion') || clean.includes('gsmi'))) {
        mapping.movementGuide = h;
      } else if (!mapping.costPrice && (clean.includes('precio') || clean.includes('costo') || clean.includes('valor') || clean.includes('compra'))) {
        mapping.costPrice = h;
      } else if (!mapping.origin && (clean.includes('origen') || clean.includes('procedencia') || clean.includes('proveedor') || clean.includes('vendedor'))) {
        mapping.origin = h;
      }
    });

    setColumnMapping(mapping);
  };

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) {
        throw new Error('El archivo no contiene hojas válidas.');
      }

      const worksheet = workbook.Sheets[firstSheet];
      const parsedData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (!parsedData || parsedData.length === 0) {
        throw new Error('El archivo no contiene filas de datos.');
      }

      const detectedHeaders = Object.keys(parsedData[0] || {});
      setRawHeaders(detectedHeaders);
      setRawRows(parsedData);
      autoDetectMappings(detectedHeaders);
      setActiveStep(2); // Move to Column Mapping
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al procesar el archivo Excel / CSV.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Generate Sample Demo File for testing
  const handleDownloadDemoTemplate = () => {
    const demoData = [
      {
        'ID_Chapeta': 'ARE-1001',
        'Nombre': 'Sultán 101',
        'Peso_Kg': 385,
        'Sexo': 'Macho',
        'Raza': 'Brahman Blanco',
        'Categoria': 'Ceba',
        'Lote': 'Lote Machos Ceba #1',
        'Potrero': 'Potrero La Vega 01',
        'Edad_Meses': 24,
        'Color': 'Blanco',
        'Hierro_Marca': 'H1-SanJuan',
        'Guia_Movilizacion': 'GSMI-89412',
        'Costo_Unitario': 3272500,
        'Origen_Proveedor': 'Finca El Diamante / Compra Directa',
      },
      {
        'ID_Chapeta': 'ARE-1002',
        'Nombre': 'Paloma 102',
        'Peso_Kg': 340,
        'Sexo': 'Hembra',
        'Raza': 'Brahman Rojo',
        'Categoria': 'Levante',
        'Lote': 'Lote Hembras Levante #2',
        'Potrero': 'Potrero Las Brisas 03',
        'Edad_Meses': 18,
        'Color': 'Rojo',
        'Hierro_Marca': 'H1-SanJuan',
        'Guia_Movilizacion': 'GSMI-89412',
        'Costo_Unitario': 2890000,
        'Origen_Proveedor': 'Finca El Diamante',
      },
      {
        'ID_Chapeta': 'ARE-1003',
        'Nombre': 'Gitana 103',
        'Peso_Kg': 460,
        'Sexo': 'Hembra',
        'Raza': 'Gyr Lechero',
        'Categoria': 'Vientre / Lechería',
        'Lote': 'Lote Vacas Ordeño',
        'Potrero': 'Potrero El Mango',
        'Edad_Meses': 36,
        'Color': 'Giro / Pintado',
        'Hierro_Marca': 'H1-SanJuan',
        'Guia_Movilizacion': 'GSMI-77219',
        'Costo_Unitario': 4200000,
        'Origen_Proveedor': 'Hacienda La Gloria',
      },
      {
        'ID_Chapeta': 'ARE-1004',
        'Nombre': 'Diamante 104',
        'Peso_Kg': 410,
        'Sexo': 'Macho',
        'Raza': 'Brangus',
        'Categoria': 'Ceba',
        'Lote': 'Lote Machos Ceba #1',
        'Potrero': 'Potrero La Vega 01',
        'Edad_Meses': 22,
        'Color': 'Negro',
        'Hierro_Marca': 'H1-SanJuan',
        'Guia_Movilizacion': 'GSMI-89412',
        'Costo_Unitario': 3485000,
        'Origen_Proveedor': 'Finca El Diamante',
      },
      {
        'ID_Chapeta': 'ARE-1005',
        'Nombre': 'Canela 105',
        'Peso_Kg': 210,
        'Sexo': 'Hembra',
        'Raza': 'Guzerá',
        'Categoria': 'Cría',
        'Lote': 'Lote Crías y Destetes',
        'Potrero': 'Potrero Corralón',
        'Edad_Meses': 8,
        'Color': 'Gris Oscuro',
        'Hierro_Marca': 'H1-SanJuan',
        'Guia_Movilizacion': 'Nacimiento Finca',
        'Costo_Unitario': 1785000,
        'Origen_Proveedor': 'Nacimiento Predio',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(demoData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Inventario');
    XLSX.writeFile(wb, 'Plantilla_Migracion_Inventario_Ganadero.xlsx');
  };

  // Preview Parsed & Transformed Records
  const transformedPreview = useMemo(() => {
    if (!rawRows.length) return [];

    return rawRows.map((row, index) => {
      // Clean Tag
      const rawTag = columnMapping.tag ? String(row[columnMapping.tag] || '').trim() : '';
      const tag = rawTag || `MIG-${String(index + 1).padStart(4, '0')}`;

      // Clean Weight
      const rawWeight = columnMapping.weightKg ? parseFloat(String(row[columnMapping.weightKg]).replace(',', '.')) : NaN;
      const weightKg = !isNaN(rawWeight) && rawWeight > 0 ? rawWeight : 350;

      // Clean Sex
      const rawSex = columnMapping.sex ? String(row[columnMapping.sex] || '').toLowerCase() : '';
      let sex: 'macho' | 'hembra' = 'macho';
      if (rawSex.includes('h') || rawSex.includes('fem') || rawSex.includes('vaca') || rawSex.includes('novilla')) {
        sex = 'hembra';
      }

      // Clean Category
      const rawCat = columnMapping.category ? String(row[columnMapping.category] || '').trim() : '';
      const category: LotCategory | string = rawCat || defaultCategory;

      // Clean Breed
      const rawBreed = columnMapping.breed ? String(row[columnMapping.breed] || '').trim() : '';
      const breed = rawBreed || defaultBreed;

      // Clean Lot Name
      const rawLot = columnMapping.lotName ? String(row[columnMapping.lotName] || '').trim() : '';
      const lotName = rawLot || defaultLotName;

      // Clean Paddock
      const rawPaddock = columnMapping.paddockName ? String(row[columnMapping.paddockName] || '').trim() : '';
      const paddockName = rawPaddock || defaultPaddockName;

      // Clean Age
      const rawAge = columnMapping.ageMonths ? parseInt(String(row[columnMapping.ageMonths]), 10) : NaN;
      const ageMonths = !isNaN(rawAge) ? rawAge : 24;

      // Clean Color
      const rawColor = columnMapping.color ? String(row[columnMapping.color] || '').trim() : '';
      const color = rawColor || 'Blanco / Gris';

      // Clean Branding Iron
      const rawBrand = columnMapping.brandingIron ? String(row[columnMapping.brandingIron] || '').trim() : '';

      // Clean Movement Guide
      const rawGuide = columnMapping.movementGuide ? String(row[columnMapping.movementGuide] || '').trim() : '';

      // Clean Price
      const rawPrice = columnMapping.costPrice ? parseFloat(String(row[columnMapping.costPrice]).replace(/[^0-9.]/g, '')) : NaN;
      const pricePerKg = !isNaN(rawPrice) && rawPrice > 0 ? (rawPrice > 100000 ? Math.round(rawPrice / weightKg) : rawPrice) : fallbackPricePerKg;
      const totalPrice = !isNaN(rawPrice) && rawPrice > 100000 ? rawPrice : Math.round(pricePerKg * weightKg);

      const animal: ImportedAnimalRecord = {
        id: `migrated-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        tag,
        name: columnMapping.name ? String(row[columnMapping.name] || '').trim() : undefined,
        weightKg,
        sex,
        breed,
        category,
        lotCode: lotName,
        farmId: selectedFarmId,
        farmName: activeFarm?.profile.name || 'Predio Activo',
        paddockName,
        ageMonths,
        color,
        brandingIronName: rawBrand || undefined,
        movementGuideNumber: rawGuide || undefined,
        pricePerKg,
        totalPrice,
        status: 'activo',
        cattleType: 'ganado_comercial',
        origin: columnMapping.origin ? String(row[columnMapping.origin] || '').trim() : 'Inventario Previo Migrado',
        notes: `Animal importado mediante migración masiva de inventario previo el ${new Date().toLocaleDateString()}.`,
      };

      return animal;
    });
  }, [
    rawRows,
    columnMapping,
    defaultCategory,
    defaultBreed,
    defaultLotName,
    defaultPaddockName,
    selectedFarmId,
    activeFarm,
    fallbackPricePerKg,
  ]);

  // Group Animals into Created Lots
  const calculatedLots = useMemo(() => {
    if (!transformedPreview.length) return [];

    const grouped: Record<string, ImportedAnimalRecord[]> = {};
    transformedPreview.forEach((animal) => {
      const lotKey = animal.lotCode || defaultLotName;
      if (!grouped[lotKey]) {
        grouped[lotKey] = [];
      }
      grouped[lotKey].push(animal);
    });

    const lots: LotRecord[] = Object.keys(grouped).map((lotName, idx) => {
      const lotAnimals = grouped[lotName];
      const heads = lotAnimals.length;
      const totalWeight = lotAnimals.reduce((acc, a) => acc + a.weightKg, 0);
      const avgWeight = heads > 0 ? Math.round((totalWeight / heads) * 10) / 10 : 0;
      const dominantCategory = (lotAnimals[0]?.category || defaultCategory).toLowerCase();
      const validCategory: LotCategory = ['ceba', 'cria', 'leche', 'genetica'].includes(dominantCategory)
        ? (dominantCategory as LotCategory)
        : 'ceba';
      const dominantPaddock = lotAnimals[0]?.paddockName || defaultPaddockName;
      const dominantSex = lotAnimals.filter(a => a.sex === 'macho').length >= (heads / 2) ? 'Machos' : 'Hembras';

      return {
        id: `lot-migrated-${Date.now()}-${idx}`,
        code: `LOT-MIG-${idx + 1}`,
        name: lotName,
        category: validCategory,
        categoryLabel: lotName,
        heads,
        sexLabel: dominantSex,
        ageRange: '18 - 36 meses',
        gdpCurrent: 0.65,
        currentAvgWeight: avgWeight,
        targetWeight: avgWeight + 120,
        estDaysToExit: 120,
        pastureType: dominantPaddock,
        notes: `Lote generado automáticamente por migración de inventario (${heads} cabezas).`,
        historyWeights: [{ date: new Date().toISOString().split('T')[0], weight: avgWeight }],
        farmId: selectedFarmId,
        farmName: activeFarm?.profile.name || 'Predio Activo',
        animals: lotAnimals,
      };
    });

    return lots;
  }, [transformedPreview, defaultLotName, defaultCategory, defaultPaddockName]);

  // Execute Final Migration
  const handleExecuteMigration = () => {
    if (!transformedPreview.length) return;

    const result: MigrationResult = {
      targetFarmId: selectedFarmId,
      targetFarmName: activeFarm?.profile.name || 'Predio Activo',
      totalImported: transformedPreview.length,
      importedAnimals: transformedPreview,
      createdLots: calculatedLots,
      migrationSummary: {
        sourceType: 'excel',
        fileName: fileName || 'Archivo de Migración',
        totalRows: rawRows.length,
        validRows: transformedPreview.length,
        errorRows: 0,
        autoGroupedByLot: autoCreateLots,
        autoGroupedByCategory: true,
        appliedPolicyType: activeFarmPolicy.policyType,
      },
    };

    onCompleteMigration(result);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#012d1d] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Migración de Inventario Ganadero Existente
                </h2>
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  IMPORTADOR MASIVO INTELIGENTE
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Importa planillas previas de Excel / CSV, preservando chapetas, lotes, pesos y marcas a fuego
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Wizard Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-6 text-xs">
            <div
              onClick={() => setActiveStep(1)}
              className={`flex items-center gap-2 cursor-pointer ${
                activeStep === 1 ? 'font-bold text-[#012d1d]' : 'text-slate-500'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                activeStep === 1 ? 'bg-[#012d1d] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span className="hidden sm:inline">Cargar Archivo</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

            <div
              onClick={() => rawHeaders.length > 0 && setActiveStep(2)}
              className={`flex items-center gap-2 ${
                rawHeaders.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${activeStep === 2 ? 'font-bold text-[#012d1d]' : 'text-slate-500'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                activeStep === 2 ? 'bg-[#012d1d] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span className="hidden sm:inline">Mapear Columnas</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

            <div
              onClick={() => rawHeaders.length > 0 && setActiveStep(3)}
              className={`flex items-center gap-2 ${
                rawHeaders.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${activeStep === 3 ? 'font-bold text-[#012d1d]' : 'text-slate-500'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                activeStep === 3 ? 'bg-[#012d1d] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                3
              </span>
              <span className="hidden sm:inline">Validar y Previsualizar</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

            <div
              onClick={() => transformedPreview.length > 0 && setActiveStep(4)}
              className={`flex items-center gap-2 ${
                transformedPreview.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${activeStep === 4 ? 'font-bold text-[#012d1d]' : 'text-slate-500'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                activeStep === 4 ? 'bg-[#012d1d] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                4
              </span>
              <span className="hidden sm:inline">Confirmar Migración</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Predio Destino:</span>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {farms.map((farm) => (
                <option key={farm.profile.id} value={farm.profile.id}>
                  {farm.profile.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body Content per Step */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* STEP 1: Upload File & Template */}
          {activeStep === 1 && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Carga tu Archivo de Inventario Actual
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Sube cualquier archivo en formato <strong>.xlsx, .xls o .csv</strong>. El motor inteligente detectará automáticamente las columnas de identificación, pesos, categorías y marcas.
                </p>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-emerald-600 bg-white hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileProcess(file);
                  }}
                />

                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-sm">
                  {isLoading ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
                  ) : (
                    <Upload className="w-8 h-8 text-emerald-700" />
                  )}
                </div>

                <div>
                  <span className="block text-sm font-bold text-slate-800">
                    {isLoading ? 'Analizando estructura del archivo...' : 'Haz clic o arrastra tu archivo aquí'}
                  </span>
                  <span className="block text-xs text-slate-400 mt-1">
                    Formatos admitidos: Excel (.XLSX, .XLS) y CSV delimitado por comas o punto y coma
                  </span>
                </div>

                {fileName && (
                  <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 mt-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{fileName} ({rawRows.length} registros detectados)</span>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Template Helper Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      ¿No tienes un formato estructurado?
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Descarga nuestra plantilla oficial de Excel con ejemplos precargados y llena los datos de tu finca.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadDemoTemplate}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Descargar Plantilla Demo (.xlsx)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {activeStep === 2 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-700" />
                    Mapeo y Correspondencia de Columnas
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Asocia los encabezados de tu archivo Excel con los campos del sistema ganadero.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => autoDetectMappings(rawHeaders)}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Detectar
                </button>
              </div>

              {/* Mapping Grid */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Chapeta / ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>N° Arete / Chapeta / ID *</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Obligatorio</span>
                  </label>
                  <select
                    value={columnMapping.tag}
                    onChange={(e) => setColumnMapping({ ...columnMapping, tag: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                  >
                    <option value="">-- Seleccionar Columna --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h} {rawRows[0]?.[h] ? `(Ej: "${rawRows[0][h]}")` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Peso Actual */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Peso Vivo Actual (Kg) *</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Recomendado</span>
                  </label>
                  <select
                    value={columnMapping.weightKg}
                    onChange={(e) => setColumnMapping({ ...columnMapping, weightKg: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                  >
                    <option value="">-- Sin columna de peso (usar 350 kg por defecto) --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h} {rawRows[0]?.[h] ? `(Ej: "${rawRows[0][h]}")` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Sexo */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Sexo / Género (Macho / Hembra)
                  </label>
                  <select
                    value={columnMapping.sex}
                    onChange={(e) => setColumnMapping({ ...columnMapping, sex: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800"
                  >
                    <option value="">-- Detectar o Macho por defecto --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h} {rawRows[0]?.[h] ? `(Ej: "${rawRows[0][h]}")` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Categoría Zootécnica */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Categoría Productiva (Ceba, Cría, Levante, Vientre)
                  </label>
                  <select
                    value={columnMapping.category}
                    onChange={(e) => setColumnMapping({ ...columnMapping, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800"
                  >
                    <option value="">-- Usar categoría fija ({defaultCategory}) --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h} {rawRows[0]?.[h] ? `(Ej: "${rawRows[0][h]}")` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Lote de Asignación */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nombre o Código de Lote
                  </label>
                  <select
                    value={columnMapping.lotName}
                    onChange={(e) => setColumnMapping({ ...columnMapping, lotName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800"
                  >
                    <option value="">-- Agrupar en lote único ({defaultLotName}) --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h} {rawRows[0]?.[h] ? `(Ej: "${rawRows[0][h]}")` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Potrero de Ubicación */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Potrero Asignado
                  </label>
                  <select
                    value={columnMapping.paddockName}
                    onChange={(e) => setColumnMapping({ ...columnMapping, paddockName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800"
                  >
                    <option value="">-- Potrero por defecto ({defaultPaddockName}) --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h} {rawRows[0]?.[h] ? `(Ej: "${rawRows[0][h]}")` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Raza / Cruce */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Raza o Fenotipo
                  </label>
                  <select
                    value={columnMapping.breed}
                    onChange={(e) => setColumnMapping({ ...columnMapping, breed: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800"
                  >
                    <option value="">-- Raza por defecto ({defaultBreed}) --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h} {rawRows[0]?.[h] ? `(Ej: "${rawRows[0][h]}")` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 8. Hierro / Marca a Fuego */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Hierro / Marca de Fuego
                  </label>
                  <select
                    value={columnMapping.brandingIron}
                    onChange={(e) => setColumnMapping({ ...columnMapping, brandingIron: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800"
                  >
                    <option value="">-- Sin columna de hierro --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h} {rawRows[0]?.[h] ? `(Ej: "${rawRows[0][h]}")` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fallback Defaults */}
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                <span className="font-bold text-slate-800 block">
                  Valores Predeterminados (para filas sin datos específicos):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Lote por defecto</label>
                    <input
                      type="text"
                      value={defaultLotName}
                      onChange={(e) => setDefaultLotName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Categoría por defecto</label>
                    <select
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    >
                      <option value="Ceba">Ceba (Engorde)</option>
                      <option value="Levante">Levante</option>
                      <option value="Cría">Cría / Terneros</option>
                      <option value="Vientre">Vientre / Cría</option>
                      <option value="Lechería">Lechería Especializada</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Precio base por kg ($)</label>
                    <input
                      type="number"
                      value={fallbackPricePerKg}
                      onChange={(e) => setFallbackPricePerKg(parseFloat(e.target.value) || 8500)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Regresar a Carga
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="bg-[#012d1d] hover:bg-[#02412a] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <span>Previsualizar {rawRows.length} Animales</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Validation */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-700" />
                    Previsualización de Datos Transformados
                  </h3>
                  <p className="text-xs text-slate-500">
                    Se detectaron <strong>{transformedPreview.length} animales</strong> listos para ser incorporados al hato de <strong>{activeFarm?.profile.name}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-xl">
                    {calculatedLots.length} Lotes Creados
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-900 font-bold px-3 py-1 rounded-xl">
                    {Math.round(transformedPreview.reduce((acc, a) => acc + a.weightKg, 0)).toLocaleString()} Kg Totales
                  </span>
                </div>
              </div>

              {/* Lotes a Crear */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Lotes que se crearán automáticamente:
                </span>
                <div className="flex flex-wrap gap-2">
                  {calculatedLots.map((lot) => (
                    <div key={lot.id} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs flex items-center gap-2">
                      <span className="font-bold text-slate-900">{lot.name}</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {lot.heads} cabezas ({lot.avgWeightKg} kg prom)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabla de Muestra */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto max-h-[340px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Chapeta / ID</th>
                        <th className="py-2.5 px-3">Sexo</th>
                        <th className="py-2.5 px-3">Raza</th>
                        <th className="py-2.5 px-3">Categoría</th>
                        <th className="py-2.5 px-3">Peso (Kg)</th>
                        <th className="py-2.5 px-3">Lote</th>
                        <th className="py-2.5 px-3">Potrero</th>
                        <th className="py-2.5 px-3">Hierro</th>
                        <th className="py-2.5 px-3">Valor Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {transformedPreview.slice(0, 100).map((animal, idx) => (
                        <tr key={animal.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{animal.tag}</td>
                          <td className="py-2 px-3">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              animal.sex === 'macho' ? 'bg-blue-50 text-blue-800' : 'bg-pink-50 text-pink-800'
                            }`}>
                              {animal.sex}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700">{animal.breed}</td>
                          <td className="py-2 px-3">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                              {animal.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-800">{animal.weightKg} kg</td>
                          <td className="py-2 px-3 text-slate-700">{animal.lotCode}</td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">{animal.paddockName}</td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{animal.brandingIronName || '-'}</td>
                          <td className="py-2 px-3 font-mono text-slate-800">${(animal.totalPrice || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {transformedPreview.length > 100 && (
                  <div className="bg-slate-50 p-2.5 text-center text-xs text-slate-500 font-medium border-t border-slate-200">
                    Mostrando las primeras 100 filas de {transformedPreview.length} totales. Todas las filas serán importadas al confirmar.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Ajustar Mapeo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="bg-[#012d1d] hover:bg-[#02412a] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <span>Continuar a Confirmación</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Final Confirmation */}
          {activeStep === 4 && (
            <div className="max-w-2xl mx-auto space-y-6 text-center animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-8 h-8 text-emerald-700" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  ¿Confirmar e Inyectar Inventario al Predio?
                </h3>
                <p className="text-xs text-slate-500">
                  Se agregarán de forma inmediata todos los animales y se actualizarán los contadores zootécnicos del predio.
                </p>
              </div>

              {/* Summary Stats Box */}
              <div className="bg-gradient-to-br from-[#012d1d] to-[#04422b] text-white p-6 rounded-3xl shadow-lg border border-emerald-600/30 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-emerald-200">Predio de Destino:</span>
                  <span className="text-sm font-bold text-white">{activeFarm?.profile.name}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-emerald-200 block uppercase font-bold">Animales</span>
                    <span className="text-2xl font-black text-amber-300 font-mono">{transformedPreview.length}</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-emerald-200 block uppercase font-bold">Lotes</span>
                    <span className="text-2xl font-black text-white font-mono">{calculatedLots.length}</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-emerald-200 block uppercase font-bold">Biomasa Total</span>
                    <span className="text-xl font-black text-emerald-300 font-mono">
                      {Math.round(transformedPreview.reduce((acc, a) => acc + a.weightKg, 0) / 1000).toFixed(1)} Ton
                    </span>
                  </div>
                </div>

                <div className="text-[11.5px] text-emerald-100/90 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/10 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <span>
                    El sistema respetará íntegramente las chapetas importadas. Los futuros nacimientos y compras continuarán a partir de la numeración zootécnica establecida para la finca.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs transition cursor-pointer"
                >
                  Regresar a Revisar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMigration}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Ejecutar Migración Definitiva</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
