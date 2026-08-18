import React, { useState, useEffect, useMemo } from 'react';
import {
  FarmGeoProfile,
  PaddockGeo,
  ContourLine,
  FloodZoneFeature,
  WaterInfrastructure,
  GISLayerVisibility,
  LotRecord,
  GeoCoordinate,
  FarmDataPackage,
} from '../../types';
import {
  INITIAL_FARM_PROFILE,
  INITIAL_PADDOCKS,
  INITIAL_CONTOURS,
  INITIAL_FLOOD_ZONES,
  INITIAL_WATER_INFRASTRUCTURE,
} from '../../data/mockGisData';
import {
  exportPaddocksToKml,
  exportPaddocksToGeoJson,
  calculatePolygonAreaM2,
  calculatePolygonPerimeter,
  m2ToHectares,
} from '../../utils/geoUtils';
import {
  ProductionCategoryKey,
  CATEGORY_DEFINITIONS,
  filterFarmsByCategory,
  segmentPaddocksByFarms,
  getFarmCategories,
} from '../../utils/farmCategoryUtils';
import { InteractiveFarmMap } from './InteractiveFarmMap';
import { PaddockDetailDrawer } from './PaddockDetailDrawer';
import { CarryingCapacityCalculator } from './CarryingCapacityCalculator';
import { PaddockEditorModal } from './PaddockEditorModal';
import { KmlImportModal } from './KmlImportModal';
import { SatelliteFarmLoaderModal } from './SatelliteFarmLoaderModal';
import { RotationMatrixView } from './RotationMatrixView';
import { SoilTopographyMatrixView } from './SoilTopographyMatrixView';
import { WaterInfrastructureView } from './WaterInfrastructureView';
import { GrassIcon } from '../icons/GrassIcon';
import {
  Map,
  Layers,
  Upload,
  Download,
  Plus,
  Scale,
  Mountain,
  FlaskConical,
  Droplets,
  Calendar,
  Compass,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  Building,
  ChevronDown,
  Edit3,
  Settings,
  PlusCircle,
  Globe,
  Check,
  Beef,
  Baby,
  Filter,
} from 'lucide-react';

interface FarmGisViewProps {
  lots: LotRecord[];
  currentFarm?: FarmDataPackage;
  farms?: FarmDataPackage[];
  onSelectFarm?: (farmId: string) => void;
  onOpenCreateFarmModal?: () => void;
  onOpenEditFarmModal?: (farmId: string) => void;
  onOpenFarmManagerModal?: () => void;
  onUpdateFarmGis?: (farmId: string, data: Partial<FarmDataPackage>) => void;
}

export const FarmGisView: React.FC<FarmGisViewProps> = ({
  lots,
  currentFarm,
  farms = [],
  onSelectFarm,
  onOpenCreateFarmModal,
  onOpenEditFarmModal,
  onOpenFarmManagerModal,
  onUpdateFarmGis,
}) => {
  // Farm Profile State
  const [farm, setFarm] = useState<FarmGeoProfile>(currentFarm?.profile || INITIAL_FARM_PROFILE);
  const [paddocks, setPaddocks] = useState<PaddockGeo[]>(currentFarm?.paddocks || INITIAL_PADDOCKS);
  const [contours, setContours] = useState<ContourLine[]>(currentFarm?.contours || INITIAL_CONTOURS);
  const [floodZones, setFloodZones] = useState<FloodZoneFeature[]>(currentFarm?.floodZones || INITIAL_FLOOD_ZONES);
  const [waterInfra, setWaterInfra] = useState<WaterInfrastructure>(
    currentFarm?.waterInfra || INITIAL_WATER_INFRASTRUCTURE,
  );

  const [showFarmDropdown, setShowFarmDropdown] = useState(false);
  const [gisCategoryFilter, setGisCategoryFilter] = useState<ProductionCategoryKey>('all');

  // Filtered Farms in GIS based on category selection
  const filteredGisFarms = useMemo(() => {
    return filterFarmsByCategory(farms, gisCategoryFilter);
  }, [farms, gisCategoryFilter]);

  // Segmented Paddocks across all filtered farms
  const segmentedGisPaddocks = useMemo(() => {
    return segmentPaddocksByFarms(filteredGisFarms, gisCategoryFilter);
  }, [filteredGisFarms, gisCategoryFilter]);

  // Sync state whenever currentFarm prop changes (e.g. user selected another farm in header)
  useEffect(() => {
    if (currentFarm) {
      setFarm(currentFarm.profile);
      setPaddocks(currentFarm.paddocks);
      setContours(currentFarm.contours || []);
      setFloodZones(currentFarm.floodZones || []);
      setWaterInfra(currentFarm.waterInfra || INITIAL_WATER_INFRASTRUCTURE);
      setSelectedPaddock(currentFarm.paddocks[0] || null);
    }
  }, [currentFarm?.profile.id]);

  // Sync changes upstream if onUpdateFarmGis is provided
  const notifyUpstream = (
    updatedProfile: FarmGeoProfile,
    updatedPaddocks: PaddockGeo[],
    updatedContours?: ContourLine[],
    updatedWater?: WaterInfrastructure,
  ) => {
    if (onUpdateFarmGis) {
      onUpdateFarmGis(updatedProfile.id, {
        profile: updatedProfile,
        paddocks: updatedPaddocks,
        contours: updatedContours || contours,
        waterInfra: updatedWater || waterInfra,
      });
    }
  };

  // Active Sub-tab inside GIS
  const [activeGisTab, setActiveGisTab] = useState<
    'map' | 'rotation' | 'segmentation' | 'soil_topo' | 'water_infra'
  >('map');

  // Layer Visibility
  const [layers, setLayers] = useState<GISLayerVisibility>({
    paddocks: true,
    paddockLabels: true,
    contourLines: true,
    floodZones: true,
    waterNetwork: true,
    waterTroughBuffers: true,
    soilAnalysis: true,
    fences: true,
    occupancyHeatmap: false,
  });

  const [mapStyle, setMapStyle] = useState<'satellite' | 'terrain' | 'vector' | 'hybrid'>('hybrid');

  // Interactive Drawing & Selection State
  const [selectedPaddock, setSelectedPaddock] = useState<PaddockGeo | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);

  // Modals State
  const [isSatelliteLoaderOpen, setIsSatelliteLoaderOpen] = useState<boolean>(false);
  const [isAforoModalOpen, setIsAforoModalOpen] = useState<boolean>(false);
  const [aforoInitialPaddockId, setAforoInitialPaddockId] = useState<string | undefined>(undefined);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [editingPaddock, setEditingPaddock] = useState<PaddockGeo | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleLayer = (key: keyof GISLayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Load satellite delimited farm
  const handleLoadSatelliteFarm = (
    newFarm: FarmGeoProfile,
    newPaddocks: PaddockGeo[],
    newContours?: ContourLine[],
  ) => {
    setFarm(newFarm);
    setPaddocks(newPaddocks);
    if (newContours && newContours.length > 0) {
      setContours(newContours);
    }
    setSelectedPaddock(newPaddocks[0] || null);
    notifyUpstream(newFarm, newPaddocks, newContours);
    showToast(
      `¡Finca ${newFarm.name} delimitada y cargada con éxito (${newFarm.totalAreaHa} Ha / ${newPaddocks.length} potreros)!`,
    );
  };

  // Assign Lot to Paddock Handler
  const handleAssignLot = (paddockId: string, lotId: string | undefined) => {
    const lot = lotId ? lots.find((l) => l.id === lotId) : undefined;
    setPaddocks((prev) =>
      prev.map((p) => {
        if (p.id === paddockId) {
          return {
            ...p,
            status: lot ? 'ocupado' : 'descanso',
            assignedLotId: lot?.id,
            assignedLotName: lot ? `${lot.name} (${lot.code})` : undefined,
            currentHeads: lot?.heads,
            currentLotCategory: lot?.category as any,
            daysInOccupancy: lot ? 1 : 0,
            daysInRest: lot ? 0 : 1,
            entryDate: lot ? new Date().toLocaleDateString('es-CO') : undefined,
          };
        }
        return p;
      }),
    );

    showToast(
      lot
        ? `Lote ${lot.name} asignado al potrero.`
        : 'Potrero liberado y colocado en descanso.',
    );
  };

  // Save new paddock polygon from interactive drawing
  const handleSaveDrawnPolygon = (points: GeoCoordinate[]) => {
    const areaM2 = calculatePolygonAreaM2(points);
    const areaHa = m2ToHectares(areaM2);
    const perimeterM = Math.round(calculatePolygonPerimeter(points));

    const newPaddock: PaddockGeo = {
      id: `pot-${Date.now()}`,
      code: `POT-${paddocks.length + 1 < 10 ? `0${paddocks.length + 1}` : paddocks.length + 1}`,
      name: `Potrero Lote ${paddocks.length + 1}`,
      color: '#2d6a4f',
      areaHa,
      areaM2: Math.round(areaM2),
      perimeterM,
      fenceType: 'electrica',
      pastureType: 'Brachiaria Brizantha cv. Marandú',
      pastureCondition: 'bueno',
      topography: 'plana',
      avgSlopePct: 2.0,
      elevationMsnm: 130,
      isFloodProne: false,
      floodRisk: 'ninguno',
      drainageChannel: false,
      soilAnalysis: {
        soilType: 'Franco Arcilloso',
        ph: 6.0,
        organicMatterPct: 4.2,
        phosphorusPpm: 18.0,
        potassiumMeq: 0.35,
        cationExchangeCap: 22.0,
        aluminumSaturationPct: 4.0,
        fertilityLevel: 'media',
        limingRecommendationTonHa: 0.5,
        fertilizerRecommendation: 'Mantenimiento con 50 kg N/ha tras primer ciclo de pastoreo',
      },
      waterAccess: true,
      waterSource: 'bebedero_gravedad',
      waterTroughDistanceM: 70,
      troughCapacityLiters: 2000,
      flowRateLpm: 30,
      forageYieldKgM2: 3.5,
      forageTotalTon: Math.round((areaHa * 10000 * 3.5) / 1000),
      dryMatterPct: 20,
      grazingEfficiencyPct: 65,
      residualHeightCm: 12,
      restDaysTarget: 30,
      occupancyDaysTarget: 2,
      carryingCapacityUGG: Number((areaHa * 2.8).toFixed(1)),
      carryingCapacityUGGPerHa: 2.8,
      maxHeadsRecommended: Math.round(areaHa * 3),
      status: 'descanso',
      daysInOccupancy: 0,
      daysInRest: 1,
      polygon: points,
    };

    setPaddocks((prev) => [...prev, newPaddock]);
    setSelectedPaddock(newPaddock);
    showToast(`Nuevo potrero ${newPaddock.code} (${newPaddock.areaHa} Ha) creado con éxito.`);
  };

  // Save Aforo calculations
  const handleSavePaddockAforo = (paddockId: string, updates: any) => {
    setPaddocks((prev) =>
      prev.map((p) => (p.id === paddockId ? { ...p, ...updates } : p)),
    );
    showToast('Aforo forrajero y capacidad de carga actualizados.');
  };

  // Save or edit paddock from modal
  const handleSavePaddockForm = (savedPaddock: PaddockGeo) => {
    setPaddocks((prev) => {
      const exists = prev.some((p) => p.id === savedPaddock.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPaddock.id ? savedPaddock : p));
      }
      return [...prev, savedPaddock];
    });
    setSelectedPaddock(savedPaddock);
    showToast(`Potrero ${savedPaddock.code} guardado.`);
  };

  // Delete paddock
  const handleDeletePaddock = (paddockId: string) => {
    setPaddocks((prev) => prev.filter((p) => p.id !== paddockId));
    if (selectedPaddock?.id === paddockId) setSelectedPaddock(null);
    showToast('Potrero eliminado del sistema SIG.');
  };

  // Import KML / GeoJSON
  const handleImportSuccess = (
    importedPaddocks: PaddockGeo[],
    farmProfile?: Partial<FarmGeoProfile>,
  ) => {
    setPaddocks(importedPaddocks);
    if (farmProfile) {
      setFarm((prev) => ({ ...prev, ...farmProfile }));
    }
    showToast(`Se importaron ${importedPaddocks.length} potreros exitosamente al SIG.`);
  };

  // Export handlers
  const handleExportKml = () => {
    const kmlString = exportPaddocksToKml(paddocks, farm.name);
    const blob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${farm.name.toLowerCase().replace(/\s+/g, '_')}_potreros.kml`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo KML descargado para Google Earth / QGIS.');
  };

  const handleExportGeoJson = () => {
    const geoJsonString = exportPaddocksToGeoJson(paddocks, farm.name);
    const blob = new Blob([geoJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${farm.name.toLowerCase().replace(/\s+/g, '_')}_potreros.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo GeoJSON descargado.');
  };

  // Global Farm Statistics
  const totalPaddocksAreaHa = paddocks.reduce((sum, p) => sum + (p.areaHa || 0), 0);
  const totalUGG = paddocks.reduce((sum, p) => sum + (p.carryingCapacityUGG || 0), 0);
  const globalUggPerHa =
    totalPaddocksAreaHa > 0 ? (totalUGG / totalPaddocksAreaHa).toFixed(2) : '0.00';
  const totalBiomassTon = paddocks.reduce((sum, p) => sum + (p.forageTotalTon || 0), 0);
  const totalHeadsAssigned = paddocks.reduce((sum, p) => sum + (p.currentHeads || 0), 0);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#012d1d] text-white border-2 border-[#ffba38] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#ffba38]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-[#c1c8c2] card-shadow">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="bg-[#1b4332] text-[#c1ecd4] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Módulo Georreferenciado SIG & PRV
            </span>

            {/* Farm Switcher Dropdown in GIS */}
            {farms.length > 0 && onSelectFarm && (
              <div className="relative">
                <button
                  onClick={() => setShowFarmDropdown(!showFarmDropdown)}
                  className="bg-[#eafaf1] hover:bg-[#c1ecd4]/50 text-[#012d1d] border border-[#c1ecd4] text-xs font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Building className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <span>Cambiar Finca ({filteredGisFarms.length}/{farms.length})</span>
                  <ChevronDown className="w-3 h-3 text-[#2d6a4f]" />
                </button>

                {showFarmDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl border-2 border-[#c1c8c2] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between px-1 py-1 mb-1 border-b border-[#eeeeee]">
                      <p className="text-[10px] font-bold text-[#79564b] uppercase tracking-wider">
                        Fincas Registradas
                      </p>
                      <span className="text-[10px] font-mono text-[#717973] font-bold">
                        {CATEGORY_DEFINITIONS[gisCategoryFilter].shortLabel}
                      </span>
                    </div>

                    {/* Filter pills inside dropdown */}
                    <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1">
                      {(['all', 'ceba', 'cria', 'leche', 'genetica'] as ProductionCategoryKey[]).map((cKey) => {
                        const isSelected = gisCategoryFilter === cKey;
                        const def = CATEGORY_DEFINITIONS[cKey];
                        return (
                          <button
                            key={cKey}
                            onClick={(e) => {
                              e.stopPropagation();
                              setGisCategoryFilter(cKey);
                            }}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                              isSelected
                                ? 'bg-[#012d1d] text-white'
                                : 'bg-[#f0f4f1] text-[#414844] hover:bg-[#e2eae5]'
                            }`}
                          >
                            {def.shortLabel}
                          </button>
                        );
                      })}
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {filteredGisFarms.length === 0 ? (
                        <p className="text-xs text-[#717973] text-center py-3">
                          No hay fincas con inventario de {CATEGORY_DEFINITIONS[gisCategoryFilter].shortLabel}.
                        </p>
                      ) : (
                        filteredGisFarms.map((f) => {
                          const isCur = f.profile.id === farm.id;
                          const farmCats = getFarmCategories(f);
                          return (
                            <button
                              key={f.profile.id}
                              onClick={() => {
                                onSelectFarm(f.profile.id);
                                setShowFarmDropdown(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                                isCur
                                  ? 'bg-[#012d1d] text-white font-bold'
                                  : 'hover:bg-[#eeeeee] text-[#1a1c1c]'
                              }`}
                            >
                              <div className="truncate mr-1">
                                <p className="truncate">{f.profile.name}</p>
                                <p className="text-[9.5px] opacity-75 font-mono">
                                  {f.profile.department} • {f.profile.totalAreaHa} Ha
                                </p>
                                <div className="flex items-center gap-0.5 mt-0.5 flex-wrap">
                                  {farmCats.map((cat) => (
                                    <span
                                      key={cat}
                                      className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase ${
                                        isCur ? 'bg-white/20 text-white' : 'bg-[#e2ede6] text-[#012d1d]'
                                      }`}
                                    >
                                      {CATEGORY_DEFINITIONS[cat]?.shortLabel || cat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {isCur && <Check className="w-3.5 h-3.5 text-[#ffba38] shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {onOpenEditFarmModal && (
              <button
                onClick={() => onOpenEditFarmModal(farm.id)}
                className="text-[11px] text-[#414844] hover:text-[#012d1d] flex items-center gap-1 font-semibold hover:underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>Editar Predio</span>
              </button>
            )}

            {onOpenFarmManagerModal && (
              <button
                onClick={onOpenFarmManagerModal}
                className="text-[11px] text-[#2d6a4f] hover:text-[#012d1d] flex items-center gap-1 font-semibold hover:underline"
              >
                <Settings className="w-3 h-3" />
                <span>Gestionar Predios</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#012d1d] tracking-tight flex items-center gap-2">
            <span>{farm.name}</span>
            <span className="text-xs font-bold text-[#717973] font-normal">
              • {farm.municipality}, {farm.department} ({farm.vereda})
            </span>
          </h1>
          <p className="text-xs text-[#717973] mt-0.5">
            Área Registrada: <span className="font-bold text-[#012d1d]">{farm.totalAreaHa} Ha</span> • Catastro:{' '}
            <span className="font-mono text-[#012d1d]">{farm.cadastralCode}</span> • Matrícula:{' '}
            <span className="font-mono text-[#012d1d]">{farm.registrationNumber}</span>
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenCreateFarmModal && (
            <button
              onClick={onOpenCreateFarmModal}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#ffba38]" />
              <span>+ Nueva Finca</span>
            </button>
          )}

          <button
            onClick={() => setIsSatelliteLoaderOpen(true)}
            className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 border border-[#ffba38]/80 cursor-pointer active:scale-98"
          >
            <Globe className="w-4 h-4 text-[#012d1d]" />
            <span>Delimitar por Satélite (GPS)</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-[#f3f3f3] hover:bg-[#c1ecd4]/30 text-[#012d1d] border border-[#c1c8c2] font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-[#1b4332]" />
            <span>Cargar KML / GeoJSON</span>
          </button>

          <button
            onClick={() => {
              setEditingPaddock(null);
              setIsEditorModalOpen(true);
            }}
            className="bg-[#f3f3f3] hover:bg-[#c1ecd4]/30 text-[#012d1d] border border-[#c1c8c2] font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#1b4332]" />
            <span>Crear Potrero</span>
          </button>

          <button
            onClick={() => {
              setAforoInitialPaddockId(paddocks[0]?.id);
              setIsAforoModalOpen(true);
            }}
            className="bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <GrassIcon className="w-4 h-4 text-[#ffba38]" />
            <span>Calculadora Aforos</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1 bg-[#f3f3f3] p-1 rounded-xl border border-[#c1c8c2]">
            <button
              onClick={handleExportKml}
              className="p-1.5 text-[#012d1d] hover:bg-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              title="Descargar KML para Google Earth"
            >
              <Download className="w-3.5 h-3.5 text-[#1b4332]" />
              <span className="text-[11px]">KML</span>
            </button>
            <button
              onClick={handleExportGeoJson}
              className="p-1.5 text-[#012d1d] hover:bg-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              title="Descargar GeoJSON para QGIS/ArcGIS"
            >
              <FileCode className="w-3.5 h-3.5 text-[#1b4332]" />
              <span className="text-[11px]">GeoJSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Global Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-slate-500 truncate">Área Potreros</p>
          <p className="text-lg sm:text-xl font-mono font-bold text-slate-900 truncate mt-1">
            {totalPaddocksAreaHa.toFixed(1)}{' '}
            <span className="text-xs font-medium text-slate-500">Ha</span>
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{paddocks.length} potreros SIG</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-slate-500 truncate">Capacidad Carga</p>
          <p className="text-lg sm:text-xl font-mono font-bold text-amber-800 truncate mt-1">
            {totalUGG.toFixed(0)} <span className="text-xs font-medium text-slate-500">UGG</span>
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold font-mono truncate mt-0.5">{globalUggPerHa} UGG/Ha</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-slate-500 truncate">Ganado Pastoreo</p>
          <p className="text-lg sm:text-xl font-mono font-bold text-slate-900 truncate mt-1">{totalHeadsAssigned}</p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">Cabezas en rotación</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-slate-500 truncate">Biomasa Total</p>
          <p className="text-lg sm:text-xl font-mono font-bold text-slate-900 truncate mt-1">
            {(totalBiomassTon / 1000).toFixed(1)}{' '}
            <span className="text-xs font-medium text-slate-500">kTon</span>
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{totalBiomassTon.toLocaleString()} Ton MV</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-slate-500 truncate">Red Hídrica</p>
          <p className="text-lg sm:text-xl font-mono font-bold text-sky-800 truncate mt-1">
            {waterInfra.troughs.length}{' '}
            <span className="text-xs font-medium text-slate-500">Bebederos</span>
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            {(waterInfra.pipelines.reduce((s, p) => s + p.lengthM, 0) / 1000).toFixed(1)} km tubería
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-slate-500 truncate">Cota Finca</p>
          <p className="text-lg sm:text-xl font-mono font-bold text-slate-900 truncate mt-1">
            {farm.elevationMsnm} <span className="text-xs font-medium text-slate-500">msnm</span>
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">6 curvas de nivel</p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 bg-[#f3f3f3] p-1.5 rounded-2xl border border-[#c1c8c2] overflow-x-auto">
        <button
          onClick={() => setActiveGisTab('map')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeGisTab === 'map'
              ? 'bg-[#1b4332] text-white tactical-shadow'
              : 'text-[#414844] hover:bg-white/60'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Mapa Satelital & SIG</span>
        </button>

        <button
          onClick={() => setActiveGisTab('segmentation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeGisTab === 'segmentation'
              ? 'bg-[#1b4332] text-white tactical-shadow'
              : 'text-[#414844] hover:bg-white/60'
          }`}
        >
          <Building className="w-4 h-4 text-[#ffba38]" />
          <span>Potreros por Predio</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/20 text-white">
            {segmentedGisPaddocks.reduce((sum, s) => sum + s.paddocks.length, 0)}
          </span>
        </button>

        <button
          onClick={() => setActiveGisTab('rotation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeGisTab === 'rotation'
              ? 'bg-[#1b4332] text-white tactical-shadow'
              : 'text-[#414844] hover:bg-white/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Rotación Voisin (PRV)</span>
        </button>

        <button
          onClick={() => setActiveGisTab('soil_topo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeGisTab === 'soil_topo'
              ? 'bg-[#1b4332] text-white tactical-shadow'
              : 'text-[#414844] hover:bg-white/60'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Matriz de Suelos & Topografía</span>
        </button>

        <button
          onClick={() => setActiveGisTab('water_infra')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeGisTab === 'water_infra'
              ? 'bg-[#1b4332] text-white tactical-shadow'
              : 'text-[#414844] hover:bg-white/60'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Red de Acueductos Ganaderos</span>
        </button>
      </div>

      {/* Main Tab Content View */}
      {activeGisTab === 'map' && (
        <div className="space-y-4">
          <InteractiveFarmMap
            farm={farm}
            paddocks={paddocks}
            contours={contours}
            floodZones={floodZones}
            waterInfra={waterInfra}
            selectedPaddock={selectedPaddock}
            onSelectPaddock={(p) => setSelectedPaddock(p)}
            isDrawingMode={isDrawingMode}
            onToggleDrawingMode={(active) => setIsDrawingMode(active)}
            onSaveNewPaddockPolygon={handleSaveDrawnPolygon}
            layers={layers}
            onToggleLayer={handleToggleLayer}
            mapStyle={mapStyle}
            onChangeMapStyle={(style) => setMapStyle(style)}
            onOpenSatelliteLoader={() => setIsSatelliteLoaderOpen(true)}
          />
        </div>
      )}

      {/* POTREROS SEGMENTADOS POR PREDIO TAB */}
      {activeGisTab === 'segmentation' && (
        <div className="space-y-6">
          {/* Category Filter Controls */}
          <div className="bg-white p-4 rounded-3xl border border-[#c1c8c2] card-shadow flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#012d1d] flex items-center gap-2">
                <span>Filtrar Potreros por Vocación Productiva</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-[#eafaf1] text-[#1b4332] rounded-full font-bold">
                  {filteredGisFarms.length} predios filtrados
                </span>
              </h2>
              <p className="text-xs text-[#717973]">
                Visualiza los potreros clasificados según el tipo de inventario pecuario que albergan.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'ceba', 'cria', 'leche', 'genetica'] as ProductionCategoryKey[]).map((cKey) => {
                const isSelected = gisCategoryFilter === cKey;
                const def = CATEGORY_DEFINITIONS[cKey];
                return (
                  <button
                    key={cKey}
                    onClick={() => setGisCategoryFilter(cKey)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#012d1d] text-[#ffba38] shadow-xs'
                        : 'bg-[#f4f7f5] hover:bg-[#e2eae5] text-[#414844]'
                    }`}
                  >
                    {def.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Segmented Farm List */}
          {segmentedGisPaddocks.length === 0 ? (
            <div className="bg-white border border-[#c1c8c2] rounded-3xl p-10 text-center text-[#717973]">
              <Building className="w-12 h-12 text-[#c1c8c2] mx-auto mb-3" />
              <p className="font-bold text-base text-[#012d1d]">
                No se encontraron predios con inventario de {CATEGORY_DEFINITIONS[gisCategoryFilter].label}
              </p>
              <p className="text-xs mt-1">Selecciona otra categoría o agrega animales a los predios existentes.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {segmentedGisPaddocks.map((seg) => {
                const isSelectedFarm = seg.farm.profile.id === farm.profile.id;
                return (
                  <div
                    key={seg.farm.profile.id}
                    className={`bg-white border-2 rounded-3xl p-5 card-shadow transition-all space-y-4 ${
                      isSelectedFarm ? 'border-[#012d1d] ring-1 ring-[#012d1d]/10' : 'border-[#c1c8c2]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eeeeee] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#012d1d] text-[#ffba38] rounded-2xl">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-lg text-[#012d1d]">{seg.farm.profile.name}</h3>
                            {isSelectedFarm && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#1b4332] text-[#c1ecd4] rounded-full uppercase">
                                Predio Activo en SIG
                              </span>
                            )}
                            <span className="text-xs font-mono text-[#717973]">
                              {seg.farm.profile.municipality}, {seg.farm.profile.department} • {(seg.totalPaddocksAreaHa ?? seg.totalAreaHa ?? 0).toFixed(1)} Ha en {seg.paddocks.length} potreros
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics & Switch action */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold bg-[#ffdad6] text-[#ba1a1a] px-2.5 py-1 rounded-xl">
                          {seg.occupiedCount} Ocupados ({seg.totalHeadsOccupying ?? seg.totalOccupiedHeads ?? 0} Cab)
                        </span>
                        <span className="text-xs font-mono font-bold bg-[#c1ecd4] text-[#002114] px-2.5 py-1 rounded-xl">
                          {seg.readyCount} Listos
                        </span>
                        <span className="text-xs font-mono font-bold bg-[#fff3d6] text-[#523700] px-2.5 py-1 rounded-xl">
                          {seg.restingCount} En Descanso
                        </span>

                        {!isSelectedFarm && onSelectFarm && (
                          <button
                            onClick={() => {
                              onSelectFarm(seg.farm.profile.id);
                              setActiveGisTab('map');
                            }}
                            className="text-xs font-bold bg-[#012d1d] text-white hover:bg-[#1b4332] px-3 py-1.5 rounded-xl cursor-pointer shadow-xs"
                          >
                            Cargar en Mapa SIG →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Paddocks Grid for Farm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {seg.paddocks.map((p) => {
                        const isOccupied = p.status === 'ocupado';
                        const isReady = p.status === 'listo';
                        const isResting = p.status === 'descanso';

                        return (
                          <div
                            key={p.id}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isOccupied
                                ? 'bg-[#fff8f7] border-[#ffdad6]'
                                : isReady
                                ? 'bg-[#f4fbf7] border-[#c1ecd4]'
                                : isResting
                                ? 'bg-[#fcfdfa] border-[#e2e8f0]'
                                : 'bg-[#fafafa] border-[#e0e0e0]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-extrabold bg-[#012d1d] text-[#ffba38] px-2 py-0.5 rounded">
                                {p.code}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                  isOccupied
                                    ? 'bg-[#ba1a1a] text-white'
                                    : isReady
                                    ? 'bg-emerald-700 text-white'
                                    : isResting
                                    ? 'bg-[#523700] text-white'
                                    : 'bg-gray-600 text-white'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>

                            <div className="mt-2.5">
                              <h4 className="font-extrabold text-sm text-[#012d1d] truncate">{p.name}</h4>
                              <p className="text-xs text-[#717973] truncate">
                                {p.pastureType || 'Brachiaria Brizantha'}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-xs font-mono">
                              <span className="font-bold text-[#012d1d]">{p.areaHa} Ha</span>
                              <span className="text-[#523700]">Cap: {p.carryingCapacityUGG} UGG</span>
                            </div>

                            {isOccupied && p.assignedLotName && (
                              <div className="mt-2 bg-[#ffdad6]/60 text-[#ba1a1a] text-[11px] font-bold px-2 py-1 rounded-lg truncate">
                                🐄 Lote: {p.assignedLotName}
                              </div>
                            )}

                            <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between gap-1.5">
                              <button
                                onClick={() => {
                                  if (!isSelectedFarm && onSelectFarm) {
                                    onSelectFarm(seg.farm.profile.id);
                                  }
                                  setSelectedPaddock(p);
                                }}
                                className="text-[11px] font-bold text-[#012d1d] hover:underline cursor-pointer"
                              >
                                Ver Ficha
                              </button>
                              <button
                                onClick={() => {
                                  if (!isSelectedFarm && onSelectFarm) {
                                    onSelectFarm(seg.farm.profile.id);
                                  }
                                  setAforoInitialPaddockId(p.id);
                                  setIsAforoModalOpen(true);
                                }}
                                className="text-[11px] font-bold bg-white text-[#2d6a4f] px-2 py-1 rounded-lg border border-[#c1c8c2] hover:bg-[#eafaf1] cursor-pointer"
                              >
                                Aforar Pasto
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeGisTab === 'rotation' && (
        <RotationMatrixView
          paddocks={paddocks}
          lots={lots}
          onSelectPaddock={(p) => setSelectedPaddock(p)}
          onOpenAforoCalculator={(p) => {
            setAforoInitialPaddockId(p.id);
            setIsAforoModalOpen(true);
          }}
          onAssignLot={handleAssignLot}
        />
      )}

      {activeGisTab === 'soil_topo' && (
        <SoilTopographyMatrixView
          paddocks={paddocks}
          contours={contours}
          floodZones={floodZones}
          onSelectPaddock={(p) => setSelectedPaddock(p)}
        />
      )}

      {activeGisTab === 'water_infra' && (
        <WaterInfrastructureView waterInfra={waterInfra} paddocks={paddocks} />
      )}

      {/* Paddock Detail Side Drawer */}
      <PaddockDetailDrawer
        paddock={selectedPaddock}
        onClose={() => setSelectedPaddock(null)}
        lots={lots}
        onOpenAforoCalculator={(p) => {
          setAforoInitialPaddockId(p.id);
          setIsAforoModalOpen(true);
        }}
        onOpenPaddockEditor={(p) => {
          setEditingPaddock(p);
          setIsEditorModalOpen(true);
        }}
        onAssignLot={handleAssignLot}
        onDeletePaddock={handleDeletePaddock}
      />

      {/* Carrying Capacity & Aforo Calculator Modal */}
      <CarryingCapacityCalculator
        isOpen={isAforoModalOpen}
        onClose={() => setIsAforoModalOpen(false)}
        paddocks={paddocks}
        initialPaddockId={aforoInitialPaddockId}
        lots={lots}
        onSavePaddockAforo={handleSavePaddockAforo}
      />

      {/* Paddock Editor Modal */}
      <PaddockEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => {
          setIsEditorModalOpen(false);
          setEditingPaddock(null);
        }}
        paddock={editingPaddock}
        onSave={handleSavePaddockForm}
      />

      {/* KML / GeoJSON Import Modal */}
      <KmlImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Satellite Farm Delimitation & Point Marking Modal */}
      <SatelliteFarmLoaderModal
        isOpen={isSatelliteLoaderOpen}
        onClose={() => setIsSatelliteLoaderOpen(false)}
        onLoadFarm={handleLoadSatelliteFarm}
      />
    </div>
  );
};
