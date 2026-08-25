import React, { useState, useRef, useMemo, useEffect } from 'react';
import { FarmGeoProfile, PaddockGeo, GeoCoordinate, ContourLine } from '../../types';
import {
  calculatePolygonAreaM2,
  calculatePolygonPerimeter,
  calculateHaversineDistance,
  m2ToHectares,
  subdividePolygonIntoPaddocks,
  generateContourLinesForBoundary,
} from '../../utils/geoUtils';
import { farmSatelliteReliefImg } from '../../assets/images';
import {
  MapPin,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Check,
  X,
  Undo,
  Trash2,
  Sparkles,
  Mountain,
  Grid,
  ChevronRight,
  Info,
  Download,
  Upload,
  Globe,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface PresetRegion {
  id: string;
  name: string;
  department: string;
  centerLat: number;
  centerLng: number;
  elevationMsnm: number;
  pastureType: string;
  defaultPoints: GeoCoordinate[];
}

const PRESET_REGIONS: PresetRegion[] = [
  {
    id: 'monteria',
    name: 'Montería (Valle del Sinú)',
    department: 'Córdoba',
    centerLat: 8.7562,
    centerLng: -75.8741,
    elevationMsnm: 18,
    pastureType: 'Brachiaria Brizantha cv. Marandú',
    defaultPoints: [
      { lat: 8.7612, lng: -75.8795 },
      { lat: 8.7615, lng: -75.8692 },
      { lat: 8.7518, lng: -75.8688 },
      { lat: 8.7512, lng: -75.8798 },
    ],
  },
  {
    id: 'villavicencio',
    name: 'Villavicencio (Piedemonte)',
    department: 'Meta',
    centerLat: 4.1488,
    centerLng: -73.6189,
    elevationMsnm: 460,
    pastureType: 'Brachiaria Decumbens & Humidicola',
    defaultPoints: [
      { lat: 4.1545, lng: -73.6245 },
      { lat: 4.1552, lng: -73.6135 },
      { lat: 4.1432, lng: -73.6128 },
      { lat: 4.1425, lng: -73.6238 },
    ],
  },
  {
    id: 'san_martin',
    name: 'San Martín (Altillanura)',
    department: 'Meta',
    centerLat: 3.6965,
    centerLng: -73.6982,
    elevationMsnm: 405,
    pastureType: 'Brachiaria Brizantha cv. Toledo',
    defaultPoints: [
      { lat: 3.7025, lng: -73.7045 },
      { lat: 3.7032, lng: -73.6925 },
      { lat: 3.6912, lng: -73.6918 },
      { lat: 3.6905, lng: -73.7038 },
    ],
  },
  {
    id: 'pto_berrio',
    name: 'Puerto Berrío (Magdalena Medio)',
    department: 'Antioquia',
    centerLat: 6.4925,
    centerLng: -74.4055,
    elevationMsnm: 125,
    pastureType: 'Panicum Maximum cv. Mombasa',
    defaultPoints: [
      { lat: 6.4985, lng: -74.4115 },
      { lat: 6.4992, lng: -74.3995 },
      { lat: 6.4872, lng: -74.3988 },
      { lat: 6.4865, lng: -74.4108 },
    ],
  },
  {
    id: 'yopal',
    name: 'Yopal (Sabana Inundable)',
    department: 'Casanare',
    centerLat: 5.3412,
    centerLng: -72.3985,
    elevationMsnm: 350,
    pastureType: 'Brachiaria Humidicola cv. Llanero',
    defaultPoints: [
      { lat: 5.3475, lng: -72.4045 },
      { lat: 5.3482, lng: -72.3925 },
      { lat: 5.3362, lng: -72.3918 },
      { lat: 5.3355, lng: -72.4038 },
    ],
  },
];

interface SatelliteFarmLoaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadFarm: (
    farm: FarmGeoProfile,
    paddocks: PaddockGeo[],
    contours?: ContourLine[],
  ) => void;
}

export const SatelliteFarmLoaderModal: React.FC<SatelliteFarmLoaderModalProps> = ({
  isOpen,
  onClose,
  onLoadFarm,
}) => {
  // Current Selected Region Preset or Custom
  const [selectedRegionId, setSelectedRegionId] = useState<string>('monteria');
  const activePreset = PRESET_REGIONS.find((r) => r.id === selectedRegionId) || PRESET_REGIONS[0];

  // Farm Form State
  const [farmName, setFarmName] = useState<string>('Hacienda Santa Bárbara');
  const [legalOwner, setLegalOwner] = useState<string>('Inversiones Ganaderas S.A.S.');
  const [cadastralCode, setCadastralCode] = useState<string>('23-001-00-02-0045-0012-000');
  const [department, setDepartment] = useState<string>(activePreset.department);
  const [municipality, setMunicipality] = useState<string>(activePreset.name.split(' ')[0]);
  const [baseElevation, setBaseElevation] = useState<number>(activePreset.elevationMsnm);
  const [pastureType, setPastureType] = useState<string>(activePreset.pastureType);
  const [paddockSubdivisionCount, setPaddockSubdivisionCount] = useState<number>(6);

  // Marked points on the Satellite Relief Image
  // Stored as relative normalized coordinates [0..1, 0..1] on the image, mapped to real Lat/Lng
  const [markedPoints, setMarkedPoints] = useState<GeoCoordinate[]>(activePreset.defaultPoints);
  const [isGpsLocating, setIsGpsLocating] = useState<boolean>(false);
  const [gpsAccuracyM, setGpsAccuracyM] = useState<number | null>(null);

  // Satellite Viewer States
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [reliefContrast, setReliefContrast] = useState<'normal' | 'enhanced' | 'high_relief'>('enhanced');
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const [showSegmentDistances, setShowSegmentDistances] = useState<boolean>(true);

  // Canvas / SVG Dimensions
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 650;
  const svgRef = useRef<SVGSVGElement>(null);

  // Update form fields when region changes
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    const region = PRESET_REGIONS.find((r) => r.id === regionId);
    if (region) {
      setDepartment(region.department);
      setMunicipality(region.name.split(' ')[0]);
      setBaseElevation(region.elevationMsnm);
      setPastureType(region.pastureType);
      setMarkedPoints(region.defaultPoints);
    }
  };

  // Geographic Bounding Calculation for Projection
  const geoBounds = useMemo(() => {
    let minLat = activePreset.centerLat - 0.009;
    let maxLat = activePreset.centerLat + 0.009;
    let minLng = activePreset.centerLng - 0.013;
    let maxLng = activePreset.centerLng + 0.013;

    if (markedPoints.length > 0) {
      markedPoints.forEach((p) => {
        if (p.lat < minLat) minLat = p.lat - 0.003;
        if (p.lat > maxLat) maxLat = p.lat + 0.003;
        if (p.lng < minLng) minLng = p.lng - 0.004;
        if (p.lng > maxLng) maxLng = p.lng + 0.004;
      });
    }

    return { minLat, maxLat, minLng, maxLng };
  }, [activePreset, markedPoints]);

  // Project (lat, lng) to SVG space
  const project = (coord: GeoCoordinate) => {
    const x = ((coord.lng - geoBounds.minLng) / (geoBounds.maxLng - geoBounds.minLng)) * SVG_WIDTH;
    const y = ((geoBounds.maxLat - coord.lat) / (geoBounds.maxLat - geoBounds.minLat)) * SVG_HEIGHT;
    return { x, y };
  };

  // Unproject from SVG space back to real (lat, lng)
  const unproject = (x: number, y: number): GeoCoordinate => {
    const lng = geoBounds.minLng + (x / SVG_WIDTH) * (geoBounds.maxLng - geoBounds.minLng);
    const lat = geoBounds.maxLat - (y / SVG_HEIGHT) * (geoBounds.maxLat - geoBounds.minLat);
    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    };
  };

  // Handle clicking on satellite image to mark vertex point
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * SVG_WIDTH;
    const clickY = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * SVG_HEIGHT;

    // Constrain within bounds
    if (clickX < 0 || clickX > SVG_WIDTH || clickY < 0 || clickY > SVG_HEIGHT) return;

    const newCoord = unproject(clickX, clickY);
    setMarkedPoints((prev) => [...prev, newCoord]);
  };

  // Remove point
  const handleRemovePoint = (index: number) => {
    setMarkedPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUndoPoint = () => {
    setMarkedPoints((prev) => prev.slice(0, -1));
  };

  const handleClearPoints = () => {
    setMarkedPoints([]);
  };

  // Request actual Device GPS Location
  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización GPS no está soportada en este dispositivo.');
      return;
    }
    setIsGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsAccuracyM(Math.round(pos.coords.accuracy));

        // Generate 4-point default box around device location (~100 Ha)
        const dLat = 0.0045;
        const dLng = 0.006;
        const devicePoints: GeoCoordinate[] = [
          { lat: Number((lat + dLat).toFixed(6)), lng: Number((lng - dLng).toFixed(6)) },
          { lat: Number((lat + dLat).toFixed(6)), lng: Number((lng + dLng).toFixed(6)) },
          { lat: Number((lat - dLat).toFixed(6)), lng: Number((lng + dLng).toFixed(6)) },
          { lat: Number((lat - dLat).toFixed(6)), lng: Number((lng - dLng).toFixed(6)) },
        ];
        setMarkedPoints(devicePoints);
      },
      (err) => {
        setIsGpsLocating(false);
        alert(`No se pudo obtener la posición GPS: ${err.message}. Usando coordenadas de referencia.`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Live Polygon Metrics Calculations
  const metrics = useMemo(() => {
    if (markedPoints.length < 3) {
      return {
        areaHa: 0,
        areaM2: 0,
        perimeterM: 0,
        carryingCapacityUGG: 0,
        maxHeads: 0,
        segments: [],
      };
    }
    const areaM2 = calculatePolygonAreaM2(markedPoints);
    const areaHa = m2ToHectares(areaM2);
    const perimeterM = Math.round(calculatePolygonPerimeter(markedPoints));
    const carryingCapacityUGG = Math.round(areaHa * 2.85);
    const maxHeads = Math.round(carryingCapacityUGG * 1.15);

    // Calculate segment lengths
    const segments = markedPoints.map((p, i) => {
      const nextP = markedPoints[(i + 1) % markedPoints.length];
      const distM = Math.round(calculateHaversineDistance(p, nextP));
      return { from: i + 1, to: ((i + 1) % markedPoints.length) + 1, distM };
    });

    return {
      areaHa,
      areaM2: Math.round(areaM2),
      perimeterM,
      carryingCapacityUGG,
      maxHeads,
      segments,
    };
  }, [markedPoints]);

  // Center of marked points
  const centerCoord = useMemo(() => {
    if (markedPoints.length === 0) return { lat: activePreset.centerLat, lng: activePreset.centerLng };
    const sumLat = markedPoints.reduce((s, p) => s + p.lat, 0);
    const sumLng = markedPoints.reduce((s, p) => s + p.lng, 0);
    return {
      lat: Number((sumLat / markedPoints.length).toFixed(6)),
      lng: Number((sumLng / markedPoints.length).toFixed(6)),
    };
  }, [markedPoints, activePreset]);

  // Final Action: Load Farm into GIS
  const handleLoadFarmSubmit = () => {
    if (markedPoints.length < 3) {
      alert('Debes marcar al menos 3 puntos en la imagen satelital para delimitar el perímetro del predio.');
      return;
    }

    // 1. Build Farm Profile
    const newFarm: FarmGeoProfile = {
      id: `farm-sat-${Date.now()}`,
      name: farmName.trim() || 'Finca Georreferenciada',
      legalOwner: legalOwner.trim() || 'Propietario Predial',
      registrationNumber: `ICA-${Math.floor(100000 + Math.random() * 900000)}`,
      cadastralCode: cadastralCode.trim() || '23-001-00-02-0045',
      department,
      municipality,
      vereda: 'Sector El Recreo',
      centerLat: centerCoord.lat,
      centerLng: centerCoord.lng,
      zoomLevel: 15,
      elevationMsnm: baseElevation,
      totalAreaHa: metrics.areaHa,
      totalPerimeterM: metrics.perimeterM,
      perimeterPolygon: markedPoints,
      importedFileName: 'Delimitación_Satelital_GPS.kml',
      lastUpdated: new Date().toLocaleDateString('es-CO'),
    };

    // 2. Generate Paddocks
    const newPaddocks = subdividePolygonIntoPaddocks(
      markedPoints,
      paddockSubdivisionCount,
      farmName,
      pastureType,
      baseElevation,
    );

    // 3. Generate Topography Contours
    const newContours = generateContourLinesForBoundary(
      centerCoord.lat,
      centerCoord.lng,
      baseElevation,
    );

    onLoadFarm(newFarm, newPaddocks, newContours);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#f9f9f9] w-full max-w-6xl rounded-3xl border-2 border-[#1b4332] shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="bg-[#123F2A] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#2d6a4f] shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#D4A94E] text-[#0D1A13] p-2.5 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
                Delimitación Satelital & Carga de Finca por GPS
              </h2>
              <p className="text-xs text-[#A5B8AC]">
                Marca los puntos perimetrales sobre la imagen satelital con relieve para calcular área, curvas de nivel y potreros
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view (Left: Satellite Canvas, Right: Farm Parameters & Point Manager) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* LEFT 7-COLS: Interactive Realistic Satellite & Relief Point Marking Canvas */}
          <div className="lg:col-span-8 p-3 sm:p-5 flex flex-col gap-3 bg-[#0a1a12] border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Top Toolbar over Canvas */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0D1A13] p-2.5 rounded-2xl border border-[#2d6a4f] text-white text-xs">
              <div className="flex items-center gap-2">
                <span className="bg-[#123F2A] text-[#ffba38] px-2 py-0.5 rounded font-mono font-bold text-[11px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {markedPoints.length} Vértices GPS
                </span>
                {gpsAccuracyM && (
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Precisión GPS: ±{gpsAccuracyM}m
                  </span>
                )}
              </div>

              {/* Point Manipulation Tools */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleGetDeviceLocation}
                  disabled={isGpsLocating}
                  className="bg-[#123F2A] hover:bg-[#1F6547] text-[#A5B8AC] px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 text-[11px]"
                  title="Capturar GPS del dispositivo"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isGpsLocating ? 'animate-spin' : ''}`} />
                  <span>{isGpsLocating ? 'Obteniendo GPS...' : 'Mi Ubicación GPS'}</span>
                </button>

                <button
                  onClick={handleUndoPoint}
                  disabled={markedPoints.length === 0}
                  className="bg-[#123F2A] hover:bg-[#1F6547] text-white px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 text-[11px] disabled:opacity-40"
                  title="Deshacer último punto"
                >
                  <Undo className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Deshacer</span>
                </button>

                <button
                  onClick={handleClearPoints}
                  disabled={markedPoints.length === 0}
                  className="bg-[#ba1a1a]/80 hover:bg-[#ba1a1a] text-white px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 text-[11px] disabled:opacity-40"
                  title="Borrar todos los puntos"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Limpiar</span>
                </button>
              </div>
            </div>

            {/* Satellite Canvas Container */}
            <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border-2 border-[#2d6a4f] bg-[#07170f] select-none shadow-inner">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className="w-full h-full cursor-crosshair"
                onClick={handleMapClick}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
              >
                <defs>
                  {/* High-Relief Filter */}
                  <filter id="reliefFilter">
                    <feColorMatrix
                      type="matrix"
                      values="
                        1.2  0    0    0   0
                        0    1.25 0    0   0
                        0    0    1.1  0   0
                        0    0    0    1   0"
                    />
                  </filter>

                  {/* Shading Pattern */}
                  <pattern id="gridOverlay" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path
                      d="M 50 0 L 0 0 0 50"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.5"
                      strokeOpacity="0.12"
                    />
                  </pattern>

                  {/* Polygon Fill Pattern */}
                  <pattern id="farmHatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="16" stroke="#ffba38" strokeWidth="1.5" strokeOpacity="0.4" />
                  </pattern>
                </defs>

                {/* 1. Realistic Satellite & Relief Image Layer */}
                <image
                  href={farmSatelliteReliefImg}
                  x="0"
                  y="0"
                  width={SVG_WIDTH}
                  height={SVG_HEIGHT}
                  preserveAspectRatio="xMidYMid slice"
                  filter={reliefContrast === 'enhanced' ? 'url(#reliefFilter)' : 'none'}
                />

                {/* 2. Topographic Relief Shading Overlay */}
                <rect
                  x="0"
                  y="0"
                  width={SVG_WIDTH}
                  height={SVG_HEIGHT}
                  fill="#012d1d"
                  fillOpacity="0.15"
                />

                {/* 3. Coordinate Grid */}
                {showGridOverlay && (
                  <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#gridOverlay)" />
                )}

                {/* 4. Marked Polygon Enclosure */}
                {markedPoints.length >= 3 && (
                  <g className="marked-polygon">
                    <polygon
                      points={markedPoints
                        .map((pt) => {
                          const { x, y } = project(pt);
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(' ')}
                      fill="url(#farmHatch)"
                      stroke="#ffba38"
                      strokeWidth="3.5"
                      strokeDasharray="6,4"
                      className="drop-shadow-lg"
                    />
                  </g>
                )}

                {/* 5. In-Progress Line connecting points */}
                {markedPoints.length >= 2 && (
                  <g className="polygon-edges">
                    {markedPoints.map((pt, idx) => {
                      const nextPt = markedPoints[(idx + 1) % markedPoints.length];
                      if (markedPoints.length < 3 && idx === markedPoints.length - 1) return null;
                      const p1 = project(pt);
                      const p2 = project(nextPt);
                      const midX = (p1.x + p2.x) / 2;
                      const midY = (p1.y + p2.y) / 2;
                      const distM = Math.round(calculateHaversineDistance(pt, nextPt));

                      return (
                        <g key={`edge-${idx}`}>
                          <line
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                            stroke="#ffba38"
                            strokeWidth="2.5"
                          />
                          {showSegmentDistances && (
                            <g transform={`translate(${midX}, ${midY})`}>
                              <rect
                                x="-30"
                                y="-10"
                                width="60"
                                height="20"
                                rx="5"
                                fill="#012d1d"
                                fillOpacity="0.85"
                                stroke="#2d6a4f"
                                strokeWidth="1"
                              />
                              <text
                                x="0"
                                y="3.5"
                                fill="#c1ecd4"
                                fontSize="9"
                                fontWeight="bold"
                                fontFamily="monospace"
                                textAnchor="middle"
                              >
                                {distM}m
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* 6. Marked Vertex Badges & Points */}
                {markedPoints.map((pt, idx) => {
                  const pos = project(pt);
                  return (
                    <g
                      key={`pt-${idx}`}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePoint(idx);
                      }}
                    >
                      {/* Outer pulse */}
                      <circle r="14" fill="#ffba38" fillOpacity="0.25" className="animate-ping" />
                      {/* Main pin marker */}
                      <circle r="8" fill="#ffba38" stroke="#012d1d" strokeWidth="2.5" />
                      <text
                        x="0"
                        y="3.5"
                        fill="#012d1d"
                        fontSize="9"
                        fontWeight="extrabold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {idx + 1}
                      </text>

                      {/* Coordinate Tooltip badge */}
                      <g transform="translate(12, -12)">
                        <rect
                          x="0"
                          y="0"
                          width="90"
                          height="18"
                          rx="4"
                          fill="#012d1d"
                          fillOpacity="0.9"
                          stroke="#2d6a4f"
                          strokeWidth="0.8"
                        />
                        <text
                          x="45"
                          y="12"
                          fill="#ffffff"
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          P{idx + 1}: {pt.lat.toFixed(4)}°, {pt.lng.toFixed(4)}°
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Instruction Prompt Watermark */}
              {markedPoints.length < 3 && (
                <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none bg-[#0D1A13]/85 backdrop-blur-md text-white border border-[#2d6a4f] p-3 rounded-2xl text-center shadow-lg">
                  <p className="text-xs font-bold text-[#ffba38] flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Haz clic sobre la imagen satelital para marcar los linderos de tu finca
                  </p>
                  <p className="text-[11px] text-[#A5B8AC] mt-0.5">
                    Marca 3 o más esquinas (vértices) perimetrales. El área y las cotas de relieve se calcularán en tiempo real.
                  </p>
                </div>
              )}

              {/* Floating Bottom Nav Controls */}
              <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1 bg-[#0D1A13]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#2d6a4f] shadow-lg">
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                  className="p-2 text-white hover:bg-[#123F2A] rounded-xl transition-colors"
                  title="Acercar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
                  className="p-2 text-white hover:bg-[#123F2A] rounded-xl transition-colors"
                  title="Alejar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-2 text-white hover:bg-[#123F2A] rounded-xl transition-colors"
                  title="Restablecer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Left: Visual Compass & Scale */}
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-[#0D1A13]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2d6a4f] text-[10px] text-[#A5B8AC] font-mono">
                <Compass className="w-3.5 h-3.5 text-[#ffba38]" />
                <span>Norte Satelital • WGS84</span>
              </div>
            </div>

            {/* Real-time Surface & Livestock Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0D1A13] p-3 rounded-2xl border border-[#2d6a4f]">
              <div className="bg-[#07170f] p-2.5 rounded-xl border border-[#1b4332] text-center">
                <p className="text-[10px] text-[#86af99] font-bold uppercase">Área Total Delimitada</p>
                <p className="text-lg font-mono font-extrabold text-[#A5B8AC]">{metrics.areaHa} Ha</p>
                <p className="text-[9px] text-[#717973] font-mono">({metrics.areaM2.toLocaleString()} m²)</p>
              </div>

              <div className="bg-[#07170f] p-2.5 rounded-xl border border-[#1b4332] text-center">
                <p className="text-[10px] text-[#86af99] font-bold uppercase">Perímetro Cerca</p>
                <p className="text-lg font-mono font-extrabold text-[#ffba38]">
                  {metrics.perimeterM.toLocaleString()} m
                </p>
                <p className="text-[9px] text-[#717973] font-mono">{(metrics.perimeterM / 1000).toFixed(2)} km linderos</p>
              </div>

              <div className="bg-[#07170f] p-2.5 rounded-xl border border-[#1b4332] text-center">
                <p className="text-[10px] text-[#86af99] font-bold uppercase">Capacidad de Carga</p>
                <p className="text-lg font-mono font-extrabold text-[#52b788]">
                  {metrics.carryingCapacityUGG} UGG
                </p>
                <p className="text-[9px] text-emerald-400 font-mono">2.85 UGG / Ha</p>
              </div>

              <div className="bg-[#07170f] p-2.5 rounded-xl border border-[#1b4332] text-center">
                <p className="text-[10px] text-[#86af99] font-bold uppercase">Carga Animal Máx.</p>
                <p className="text-lg font-mono font-extrabold text-[#ffba38]">{metrics.maxHeads}</p>
                <p className="text-[9px] text-[#717973]">Cabezas recomendadas</p>
              </div>
            </div>
          </div>

          {/* RIGHT 5-COLS: Farm Parameters, Preset Zones & Rotational Subdivision Options */}
          <div className="lg:col-span-4 p-4 sm:p-5 space-y-4 bg-[#15241C] flex flex-col justify-between">
            <div className="space-y-4">
              {/* Regional Presets Selector */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Zonas Ganaderas Preset</span>
                  <span className="text-[10px] text-[#717973] lowercase">latam / colombia</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_REGIONS.map((region) => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => handleSelectRegion(region.id)}
                      className={`p-2 rounded-xl text-left text-xs transition-all border ${
                        selectedRegionId === region.id
                          ? 'bg-[#123F2A] text-white border-[#1b4332] font-bold shadow-sm'
                          : 'bg-[#f3f3f3] text-[#414844] border-white/10 hover:bg-[#e8e8e8]'
                      }`}
                    >
                      <p className="font-bold truncate text-[11px]">{region.name}</p>
                      <p className="text-[9px] opacity-80">{region.department} • {region.elevationMsnm} msnm</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Farm Information Fields */}
              <div className="space-y-3 pt-2 border-t border-[#eeeeee]">
                <div>
                  <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-1">
                    Nombre del Predio / Finca
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="Ej. Hacienda El Trébol"
                    className="w-full bg-[#f3f3f3] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:bg-[#15241C] focus:border-[#1b4332] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-[#f3f3f3] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Municipio
                    </label>
                    <input
                      type="text"
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      className="w-full bg-[#f3f3f3] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Cota Base (msnm)
                    </label>
                    <input
                      type="number"
                      value={baseElevation}
                      onChange={(e) => setBaseElevation(Number(e.target.value))}
                      className="w-full bg-[#f3f3f3] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#717973] uppercase mb-1">
                      Pasto Predominante
                    </label>
                    <select
                      value={pastureType}
                      onChange={(e) => setPastureType(e.target.value)}
                      className="w-full bg-[#f3f3f3] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                    >
                      <option value="Brachiaria Brizantha cv. Marandú">Brizantha Marandú</option>
                      <option value="Brachiaria Brizantha cv. Toledo">Brizantha Toledo</option>
                      <option value="Panicum Maximum cv. Mombasa">Mombasa</option>
                      <option value="Brachiaria Humidicola cv. Llanero">Humidicola Llanero</option>
                      <option value="Brachiaria Decumbens">Decumbens</option>
                      <option value="Pasto Estrella Africana">Estrella Africana</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rotational PRV Subdivision Setup */}
              <div className="bg-[#c1ecd4]/20 p-3.5 rounded-2xl border border-white/10 space-y-2">
                <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-[#1b4332]" />
                    Subdivisión de Potreros (PRV)
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[#1b4332]">
                    {paddockSubdivisionCount} potreros
                  </span>
                </label>

                <p className="text-[11px] text-[#414844]">
                  El sistema creará automáticamente la división con callejones, bebederos y curvas de nivel.
                </p>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[1, 4, 6, 8, 12, 16].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPaddockSubdivisionCount(count)}
                      className={`py-1.5 rounded-xl font-bold text-xs transition-all ${
                        paddockSubdivisionCount === count
                          ? 'bg-[#123F2A] text-white shadow-sm'
                          : 'bg-[#15241C] text-white border border-white/10 hover:bg-[#f3f3f3]'
                      }`}
                    >
                      {count === 1 ? '1 Macro' : `${count} Pot.`}
                    </button>
                  ))}
                </div>

                {metrics.areaHa > 0 && (
                  <p className="text-[10px] text-[#1b4332] font-bold text-center mt-1">
                    Área promedio por potrero: {(metrics.areaHa / paddockSubdivisionCount).toFixed(1)} Ha
                  </p>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="space-y-2 pt-3 border-t border-[#eeeeee]">
              <button
                type="button"
                onClick={handleLoadFarmSubmit}
                disabled={markedPoints.length < 3}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  markedPoints.length >= 3
                    ? 'bg-[#123F2A] hover:bg-[#1F6547] text-[#ffba38] tactical-shadow font-extrabold cursor-pointer active:scale-98'
                    : 'bg-[#c1c8c2] text-white cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-[#ffba38]" />
                <span>Cargar Finca y Potreros al SIG</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-[#717973] hover:bg-[#eeeeee] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
