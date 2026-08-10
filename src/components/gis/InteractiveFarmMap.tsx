import React, { useState, useRef, useMemo } from 'react';
import {
  PaddockGeo,
  FarmGeoProfile,
  ContourLine,
  FloodZoneFeature,
  WaterInfrastructure,
  GISLayerVisibility,
  GeoCoordinate,
} from '../../types';
import {
  calculatePolygonAreaM2,
  calculatePolygonPerimeter,
  calculateHaversineDistance,
  m2ToHectares,
} from '../../utils/geoUtils';
import { farmSatelliteReliefImg } from '../../assets/images';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  MapPin,
  Eye,
  EyeOff,
  Plus,
  Check,
  X,
  Undo,
  Waves,
  Mountain,
  Droplets,
  FlaskConical,
  Zap,
  Info,
  Navigation,
  Globe,
  Sparkles,
} from 'lucide-react';

interface InteractiveFarmMapProps {
  farm: FarmGeoProfile;
  paddocks: PaddockGeo[];
  contours: ContourLine[];
  floodZones: FloodZoneFeature[];
  waterInfra: WaterInfrastructure;
  selectedPaddock: PaddockGeo | null;
  onSelectPaddock: (paddock: PaddockGeo | null) => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: (active: boolean) => void;
  onSaveNewPaddockPolygon: (polygon: GeoCoordinate[]) => void;
  layers: GISLayerVisibility;
  onToggleLayer: (layerKey: keyof GISLayerVisibility) => void;
  mapStyle: 'satellite' | 'terrain' | 'vector' | 'hybrid';
  onChangeMapStyle: (style: 'satellite' | 'terrain' | 'vector' | 'hybrid') => void;
  onOpenSatelliteLoader?: () => void;
}

export const InteractiveFarmMap: React.FC<InteractiveFarmMapProps> = ({
  farm,
  paddocks,
  contours,
  floodZones,
  waterInfra,
  selectedPaddock,
  onSelectPaddock,
  isDrawingMode,
  onToggleDrawingMode,
  onSaveNewPaddockPolygon,
  layers,
  onToggleLayer,
  mapStyle,
  onChangeMapStyle,
  onOpenSatelliteLoader,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPaddock, setHoveredPaddock] = useState<PaddockGeo | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<GeoCoordinate[]>([]);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [userLocation, setUserLocation] = useState<GeoCoordinate | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate Geo Bounding Box around Farm
  const bounds = useMemo(() => {
    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;

    const allPoints: GeoCoordinate[] = [
      ...farm.perimeterPolygon,
      ...paddocks.flatMap((p) => p.polygon),
    ];

    allPoints.forEach((pt) => {
      if (pt.lat < minLat) minLat = pt.lat;
      if (pt.lat > maxLat) maxLat = pt.lat;
      if (pt.lng < minLng) minLng = pt.lng;
      if (pt.lng > maxLng) maxLng = pt.lng;
    });

    // Add 10% padding
    const latPadding = (maxLat - minLat) * 0.15 || 0.005;
    const lngPadding = (maxLng - minLng) * 0.15 || 0.005;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  }, [farm, paddocks]);

  // Project (lat, lng) to SVG viewbox (0, 0, 1000, 700)
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 700;

  const projectToSvg = (coord: GeoCoordinate) => {
    const x = ((coord.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * SVG_WIDTH;
    // Invert Y because latitude goes up but SVG Y goes down
    const y = ((bounds.maxLat - coord.lat) / (bounds.maxLat - bounds.minLat)) * SVG_HEIGHT;
    return { x, y };
  };

  const unprojectFromSvg = (x: number, y: number): GeoCoordinate => {
    const lng = bounds.minLng + (x / SVG_WIDTH) * (bounds.maxLng - bounds.minLng);
    const lat = bounds.maxLat - (y / SVG_HEIGHT) * (bounds.maxLat - bounds.minLat);
    return { lat, lng };
  };

  // Convert polygon coordinates to SVG path string
  const polygonToSvgPath = (polygon: GeoCoordinate[]) => {
    if (polygon.length === 0) return '';
    return (
      polygon
        .map((pt, i) => {
          const { x, y } = projectToSvg(pt);
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ') + ' Z'
    );
  };

  // Handle map click for drawing mode
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingMode || !containerRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * SVG_WIDTH;
    const clickY = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * SVG_HEIGHT;

    const newCoord = unprojectFromSvg(clickX, clickY);
    setDrawingPoints((prev) => [...prev, newCoord]);
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDrawingMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isDrawingMode) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Live drawing calculations
  const drawingStats = useMemo(() => {
    if (drawingPoints.length < 3) {
      return { areaHa: 0, areaM2: 0, perimeterM: 0 };
    }
    const areaM2 = calculatePolygonAreaM2(drawingPoints);
    const areaHa = m2ToHectares(areaM2);
    const perimeterM = Math.round(calculatePolygonPerimeter(drawingPoints));
    return { areaHa, areaM2: Math.round(areaM2), perimeterM };
  }, [drawingPoints]);

  const handleCompleteDrawing = () => {
    if (drawingPoints.length >= 3) {
      onSaveNewPaddockPolygon(drawingPoints);
      setDrawingPoints([]);
      onToggleDrawingMode(false);
    }
  };

  const handleUndoPoint = () => {
    setDrawingPoints((prev) => prev.slice(0, -1));
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(userPos);
        },
        () => {
          // Fallback to center of farm
          setUserLocation({ lat: farm.centerLat, lng: farm.centerLng });
        },
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[580px] md:h-[680px] bg-[#00170f] rounded-2xl border-2 border-[#1b4332] overflow-hidden select-none shadow-md"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Farm Badge & Coordinates */}
        <div className="pointer-events-auto bg-[#012d1d]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-[#2d6a4f] shadow-lg flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs md:text-sm tracking-tight">{farm.name}</span>
              <span className="text-[10px] bg-[#1b4332] text-[#c1ecd4] px-1.5 py-0.5 rounded font-mono">
                {farm.totalAreaHa} Ha
              </span>
            </div>
            <p className="text-[10px] text-[#86af99] font-mono">
              Lat: {farm.centerLat.toFixed(4)}° • Lng: {farm.centerLng.toFixed(4)}° • {farm.elevationMsnm} msnm
            </p>
          </div>
        </div>

        {/* Action Controls & Layer Selector */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Satellite Farm Delimitation Button */}
          {onOpenSatelliteLoader && (
            <button
              onClick={onOpenSatelliteLoader}
              className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] px-3 py-2 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center gap-1.5"
              title="Delimitar y cargar finca desde imagen satelital GPS"
            >
              <Globe className="w-4 h-4 text-[#012d1d]" />
              <span className="hidden sm:inline">Delimitar Satelital</span>
            </button>
          )}

          {/* Map Style Selector */}
          <div className="bg-[#012d1d]/90 backdrop-blur-md p-1 rounded-xl border border-[#2d6a4f] shadow-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => onChangeMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                mapStyle === 'satellite' ? 'bg-[#c1ecd4] text-[#002114]' : 'text-white/80 hover:bg-[#1b4332]'
              }`}
            >
              Satélite
            </button>
            <button
              onClick={() => onChangeMapStyle('hybrid')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                mapStyle === 'hybrid' ? 'bg-[#c1ecd4] text-[#002114]' : 'text-white/80 hover:bg-[#1b4332]'
              }`}
            >
              Híbrido
            </button>
            <button
              onClick={() => onChangeMapStyle('terrain')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] ${
                mapStyle === 'terrain' ? 'bg-[#c1ecd4] text-[#002114]' : 'text-white/80 hover:bg-[#1b4332]'
              }`}
            >
              Relieve
            </button>
          </div>

          {/* Toggle Layers Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`p-2.5 rounded-xl border shadow-lg transition-all flex items-center gap-1.5 text-xs font-bold ${
                showLayerMenu
                  ? 'bg-[#ffba38] text-[#523700] border-[#ffba38]'
                  : 'bg-[#012d1d]/90 backdrop-blur-md text-white border-[#2d6a4f] hover:bg-[#1b4332]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Capas SIG</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#012d1d] text-white border border-[#2d6a4f] rounded-2xl p-3 shadow-2xl z-30 space-y-2 text-xs backdrop-blur-lg animate-in fade-in zoom-in-95 duration-100">
                <p className="font-bold text-[11px] uppercase tracking-wider text-[#c1ecd4] border-b border-[#1b4332] pb-1.5 flex items-center justify-between">
                  <span>Capas Geoespaciales</span>
                  <span className="text-[10px] text-[#86af99]">Activar / Desactivar</span>
                </p>

                <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1b4332] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#2d6a4f] border border-white/40" />
                      Polígonos de Potreros
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.paddocks}
                      onChange={() => onToggleLayer('paddocks')}
                      className="accent-[#ffba38]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1b4332] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Mountain className="w-3.5 h-3.5 text-amber-300" />
                      Curvas de Nivel (Topografía)
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.contourLines}
                      onChange={() => onToggleLayer('contourLines')}
                      className="accent-[#ffba38]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1b4332] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Waves className="w-3.5 h-3.5 text-cyan-300" />
                      Áreas Inundables / Humedales
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.floodZones}
                      onChange={() => onToggleLayer('floodZones')}
                      className="accent-[#ffba38]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1b4332] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      Acueductos & Bebederos
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.waterNetwork}
                      onChange={() => onToggleLayer('waterNetwork')}
                      className="accent-[#ffba38]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1b4332] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
                      Estudios de Suelo (Fertilidad)
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.soilAnalysis}
                      onChange={() => onToggleLayer('soilAnalysis')}
                      className="accent-[#ffba38]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1b4332] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Cerca Eléctrica & Callejones
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.fences}
                      onChange={() => onToggleLayer('fences')}
                      className="accent-[#ffba38]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1b4332] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="text-xs">🐄</span>
                      Semáforo de Ocupación
                    </span>
                    <input
                      type="checkbox"
                      checked={layers.occupancyHeatmap}
                      onChange={() => onToggleLayer('occupancyHeatmap')}
                      className="accent-[#ffba38]"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Drawing Mode Toggle Button */}
          <button
            onClick={() => {
              if (isDrawingMode) {
                setDrawingPoints([]);
                onToggleDrawingMode(false);
              } else {
                onToggleDrawingMode(true);
              }
            }}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 ${
              isDrawingMode
                ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white animate-pulse'
                : 'bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700]'
            }`}
          >
            {isDrawingMode ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isDrawingMode ? 'Cancelar Dibujo' : 'Dibujar Potrero'}</span>
          </button>
        </div>
      </div>

      {/* Floating Drawing Status Banner */}
      {isDrawingMode && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30 bg-[#012d1d]/95 backdrop-blur-md text-white border-2 border-[#ffba38] rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-xs text-[#ffba38] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffba38] animate-ping" />
              Editor Georreferenciado
            </h4>
            <span className="text-[11px] font-mono text-[#c1ecd4]">
              {drawingPoints.length} vértices
            </span>
          </div>

          <p className="text-xs text-white/90 mb-3">
            {drawingPoints.length === 0
              ? 'Haz clic en el mapa para marcar los vértices perimetrales del nuevo potrero.'
              : `Vértices marcados: ${drawingPoints.length}. Haz clic para agregar más esquinas.`}
          </p>

          {drawingPoints.length >= 3 && (
            <div className="grid grid-cols-2 gap-2 bg-[#00170f] p-2.5 rounded-xl border border-[#2d6a4f] mb-3 text-center">
              <div>
                <p className="text-[10px] text-[#86af99] uppercase font-bold">Área Calculada</p>
                <p className="text-sm font-bold text-[#c1ecd4] font-mono">
                  {drawingStats.areaHa} Ha
                </p>
                <p className="text-[9px] text-[#717973] font-mono">
                  ({drawingStats.areaM2.toLocaleString()} m²)
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#86af99] uppercase font-bold">Perímetro Cerca</p>
                <p className="text-sm font-bold text-[#ffba38] font-mono">
                  {drawingStats.perimeterM.toLocaleString()} m
                </p>
                <p className="text-[9px] text-[#717973]">Lineales</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {drawingPoints.length > 0 && (
              <button
                onClick={handleUndoPoint}
                className="flex-1 bg-[#1b4332] hover:bg-[#2d6a4f] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Undo className="w-3.5 h-3.5" /> Deshacer
              </button>
            )}

            <button
              onClick={handleCompleteDrawing}
              disabled={drawingPoints.length < 3}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                drawingPoints.length >= 3
                  ? 'bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] shadow-md font-extrabold cursor-pointer'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" /> Guardar Potrero
            </button>
          </div>
        </div>
      )}

      {/* Map Canvas / SVG Viewport */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className={`w-full h-full ${
          isDrawingMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        onClick={handleMapClick}
      >
        <defs>
          {/* Satellite Map Texture & Patterns */}
          <radialGradient id="satelliteBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1a382b" />
            <stop offset="60%" stopColor="#0f291e" />
            <stop offset="100%" stopColor="#071b13" />
          </radialGradient>

          <pattern id="cropGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#2d6a4f"
              strokeWidth="0.5"
              strokeOpacity="0.25"
            />
          </pattern>

          <pattern id="floodHatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#00b4d8" strokeWidth="2.5" strokeOpacity="0.6" />
          </pattern>

          {/* Glow Filters */}
          <filter id="paddockGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffba38" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Base Map Background */}
        {mapStyle === 'vector' ? (
          <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="#f4f6f4" />
        ) : (
          <g className="satellite-relief-base">
            {/* Realistic Satellite Relief Orthophoto */}
            <image
              href={farmSatelliteReliefImg}
              x="0"
              y="0"
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Relief / Style Overlays */}
            {mapStyle === 'terrain' && (
              <rect
                x="0"
                y="0"
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                fill="#432818"
                fillOpacity="0.22"
                style={{ mixBlendMode: 'multiply' }}
              />
            )}
            {mapStyle === 'hybrid' && (
              <rect
                x="0"
                y="0"
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                fill="#012d1d"
                fillOpacity="0.12"
              />
            )}
          </g>
        )}
        <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#cropGrid)" />

        {/* Layer: Farm Outer Boundary */}
        <path
          d={polygonToSvgPath(farm.perimeterPolygon)}
          fill="none"
          stroke="#ffba38"
          strokeWidth="3.5"
          strokeDasharray="8,5"
          className="opacity-90"
        />

        {/* Layer: Topographic Contour Lines (Curvas de Nivel) */}
        {layers.contourLines && (
          <g className="contour-layer">
            {contours.map((c) => {
              if (c.points.length < 2) return null;
              const pathD = c.points
                .map((pt, idx) => {
                  const { x, y } = projectToSvg(pt);
                  return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                })
                .join(' ');

              const labelPos = projectToSvg(c.points[Math.floor(c.points.length / 2)]);

              return (
                <g key={c.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={c.isMajor ? '#e9c46a' : '#d4a373'}
                    strokeWidth={c.isMajor ? 1.8 : 1.0}
                    strokeOpacity={c.isMajor ? 0.75 : 0.45}
                    strokeDasharray={c.isMajor ? 'none' : '4,2'}
                  />
                  {c.isMajor && (
                    <text
                      x={labelPos.x}
                      y={labelPos.y - 4}
                      fill="#e9c46a"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none pointer-events-none drop-shadow-sm"
                    >
                      {c.elevationMsnm}m
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Layer: Flood Zones (Áreas Inundables & Rondas Hídricas) */}
        {layers.floodZones && (
          <g className="flood-zones-layer">
            {floodZones.map((fz) => {
              if (fz.polygon && fz.polygon.length >= 3) {
                const center = projectToSvg(fz.polygon[0]);
                return (
                  <g key={fz.id}>
                    <path
                      d={polygonToSvgPath(fz.polygon)}
                      fill="url(#floodHatch)"
                      stroke="#00b4d8"
                      strokeWidth="2"
                      strokeOpacity="0.8"
                    />
                    <text
                      x={center.x + 15}
                      y={center.y + 15}
                      fill="#00b4d8"
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      🌊 {fz.name}
                    </text>
                  </g>
                );
              }
              if (fz.linePath && fz.linePath.length >= 2) {
                const lineD = fz.linePath
                  .map((pt, idx) => {
                    const { x, y } = projectToSvg(pt);
                    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <g key={fz.id}>
                    <path
                      d={lineD}
                      fill="none"
                      stroke="#0077b6"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeOpacity="0.7"
                    />
                    <path
                      d={lineD}
                      fill="none"
                      stroke="#90e0ef"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="6,4"
                    />
                  </g>
                );
              }
              return null;
            })}
          </g>
        )}

        {/* Layer: Paddocks Polygons */}
        {layers.paddocks && (
          <g className="paddocks-layer">
            {paddocks.map((p) => {
              const isSelected = selectedPaddock?.id === p.id;
              const isHovered = hoveredPaddock?.id === p.id;
              const pathD = polygonToSvgPath(p.polygon);

              // Determine fill color by layer settings
              let fillColor = p.color;
              if (layers.occupancyHeatmap) {
                if (p.status === 'ocupado') fillColor = '#ba1a1a'; // Red
                else if (p.status === 'listo') fillColor = '#2d6a4f'; // Green
                else if (p.status === 'descanso') fillColor = '#e7c24f'; // Yellow
                else if (p.status === 'inundado') fillColor = '#0077b6'; // Blue
                else fillColor = '#52b788';
              }

              // Compute centroid for label
              let avgX = 0;
              let avgY = 0;
              p.polygon.forEach((pt) => {
                const { x, y } = projectToSvg(pt);
                avgX += x;
                avgY += y;
              });
              avgX /= p.polygon.length;
              avgY /= p.polygon.length;

              return (
                <g
                  key={p.id}
                  className="cursor-pointer transition-all duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDrawingMode) onSelectPaddock(p);
                  }}
                  onMouseEnter={() => setHoveredPaddock(p)}
                  onMouseLeave={() => setHoveredPaddock(null)}
                >
                  <path
                    d={pathD}
                    fill={fillColor}
                    fillOpacity={isSelected ? 0.85 : isHovered ? 0.75 : 0.55}
                    stroke={isSelected ? '#ffba38' : isHovered ? '#ffffff' : '#1b4332'}
                    strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                    filter={isSelected ? 'url(#paddockGlow)' : 'none'}
                  />

                  {/* Paddock Center Label */}
                  {layers.paddockLabels && (
                    <g transform={`translate(${avgX}, ${avgY})`} className="pointer-events-none">
                      <rect
                        x="-48"
                        y="-18"
                        width="96"
                        height="36"
                        rx="8"
                        fill="#012d1d"
                        fillOpacity="0.85"
                        stroke={isSelected ? '#ffba38' : '#2d6a4f'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-4"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {p.code}
                      </text>
                      <text
                        x="0"
                        y="9"
                        fill="#c1ecd4"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {p.areaHa} Ha • {p.carryingCapacityUGG} UGG
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Layer: Water Infrastructure (Acueducto Ganadero, Tuberías y Bebederos) */}
        {layers.waterNetwork && (
          <g className="water-network-layer">
            {/* Pipelines */}
            {waterInfra.pipelines.map((pipe) => {
              const pipeD = pipe.path
                .map((pt, idx) => {
                  const { x, y } = projectToSvg(pt);
                  return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                })
                .join(' ');
              return (
                <path
                  key={pipe.id}
                  d={pipeD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="5,2"
                  className="drop-shadow-sm"
                />
              );
            })}

            {/* Storage Tanks */}
            {waterInfra.tanks.map((tank) => {
              const pos = projectToSvg(tank.location);
              return (
                <g key={tank.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                  <text x="12" y="4" fill="#38bdf8" fontSize="9" fontWeight="bold">
                    🛢️ {tank.name}
                  </text>
                </g>
              );
            })}

            {/* Drinking Troughs & 200m Coverage Buffers */}
            {waterInfra.troughs.map((trough) => {
              const pos = projectToSvg(trough.location);
              return (
                <g key={trough.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  {layers.waterTroughBuffers && (
                    <circle
                      r="40"
                      fill="#38bdf8"
                      fillOpacity="0.12"
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                  )}
                  <circle r="6" fill="#00b4d8" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="9" y="3" fill="#ffffff" fontSize="8" fontWeight="bold">
                    💧 {trough.capacityLiters}L
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* User GPS Location Marker */}
        {userLocation && (
          <g transform={`translate(${projectToSvg(userLocation).x}, ${projectToSvg(userLocation).y})`}>
            <circle r="16" fill="#ffba38" fillOpacity="0.3" className="animate-ping" />
            <circle r="7" fill="#ffba38" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}

        {/* Live Drawing In-Progress Polygon */}
        {isDrawingMode && drawingPoints.length > 0 && (
          <g className="drawing-active-layer">
            <path
              d={polygonToSvgPath(drawingPoints)}
              fill="#ffba38"
              fillOpacity="0.35"
              stroke="#ffba38"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
            {drawingPoints.map((pt, idx) => {
              const { x, y } = projectToSvg(pt);
              return (
                <g key={idx} transform={`translate(${x}, ${y})`}>
                  <circle r="6" fill="#ffba38" stroke="#000000" strokeWidth="1.5" />
                  <text
                    x="0"
                    y="3"
                    fill="#000000"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {idx + 1}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* Floating Bottom-Right Map Nav & Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-[#012d1d]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#2d6a4f] shadow-2xl">
        <button
          onClick={() => setZoom((prev) => Math.min(3.5, prev + 0.25))}
          className="p-2 text-white hover:bg-[#1b4332] rounded-xl transition-colors"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.25))}
          className="p-2 text-white hover:bg-[#1b4332] rounded-xl transition-colors"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 text-white hover:bg-[#1b4332] rounded-xl transition-colors"
          title="Restablecer Vista"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleLocateMe}
          className="p-2 text-[#ffba38] hover:bg-[#1b4332] rounded-xl transition-colors"
          title="Mi Ubicación GPS"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Map Scale & North Indicator (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-[#012d1d]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2d6a4f] text-[10px] text-[#86af99] font-mono">
        <div className="flex items-center gap-1 text-white">
          <Compass className="w-3.5 h-3.5 text-[#ffba38]" />
          <span className="font-bold">N</span>
        </div>
        <div className="h-3 w-px bg-[#2d6a4f]" />
        <div>Escala: 1:5,000 • WGS84</div>
      </div>
    </div>
  );
};
