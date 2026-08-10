import { GeoCoordinate, PaddockGeo, FarmGeoProfile, SoilAnalysis } from '../types';

/**
 * Earth radius in meters (WGS84 mean radius)
 */
const EARTH_RADIUS_METERS = 6378137;

/**
 * Calculates geodesic distance between two points in meters using Haversine formula
 */
export function calculateHaversineDistance(p1: GeoCoordinate, p2: GeoCoordinate): number {
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates polygon perimeter in meters
 */
export function calculatePolygonPerimeter(polygon: GeoCoordinate[]): number {
  if (polygon.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < polygon.length; i++) {
    const nextIdx = (i + 1) % polygon.length;
    perimeter += calculateHaversineDistance(polygon[i], polygon[nextIdx]);
  }
  return perimeter;
}

/**
 * Calculates polygon area in square meters using Shoelace formula on equirectangular projection
 */
export function calculatePolygonAreaM2(polygon: GeoCoordinate[]): number {
  if (polygon.length < 3) return 0;

  // Find center of polygon for local projection
  let sumLat = 0;
  let sumLng = 0;
  polygon.forEach((p) => {
    sumLat += p.lat;
    sumLng += p.lng;
  });
  const centerLat = sumLat / polygon.length;
  const centerLng = sumLng / polygon.length;

  const latRad = (centerLat * Math.PI) / 180;
  const cosLat = Math.cos(latRad);

  // Convert points to local meter coordinates (x, y)
  const localPoints = polygon.map((p) => {
    const x = ((p.lng - centerLng) * Math.PI * EARTH_RADIUS_METERS * cosLat) / 180;
    const y = ((p.lat - centerLat) * Math.PI * EARTH_RADIUS_METERS) / 180;
    return { x, y };
  });

  // Shoelace formula
  let area = 0;
  for (let i = 0; i < localPoints.length; i++) {
    const j = (i + 1) % localPoints.length;
    area += localPoints[i].x * localPoints[j].y;
    area -= localPoints[j].x * localPoints[i].y;
  }

  return Math.abs(area) / 2;
}

/**
 * Converts area in square meters to Hectares (1 Ha = 10,000 m²)
 */
export function m2ToHectares(areaM2: number): number {
  return Number((areaM2 / 10000).toFixed(2));
}

/**
 * Computes centroid coordinate of a polygon
 */
export function calculatePolygonCentroid(polygon: GeoCoordinate[]): GeoCoordinate {
  if (polygon.length === 0) return { lat: 0, lng: 0 };
  let sumLat = 0;
  let sumLng = 0;
  polygon.forEach((p) => {
    sumLat += p.lat;
    sumLng += p.lng;
  });
  return {
    lat: sumLat / polygon.length,
    lng: sumLng / polygon.length,
  };
}

/**
 * Livestock Carrying Capacity & Forage Math (Zootecnia de Pastos y Aforo)
 */
export interface CarryingCapacityResult {
  totalGreenForageKg: number;
  totalDryMatterKg: number;
  usableForageKg: number;
  residualForageKg: number;
  dailyConsumptionPerUGGKg: number;
  dailyConsumptionSelectedAnimalKg: number;
  instantaneousUGG: number;
  uggPerHectare: number;
  maxHeadsForDuration: number;
  recommendedDurationDays: number;
  restDaysRequired: number;
  totalPaddocksNeededInRotation: number;
  annualSustainableUGGPerHa: number;
  dailyWaterNeedLiters: number;
  troughFlowRateRequiredLpm: number;
}

export function calculateCarryingCapacity({
  areaHa,
  forageYieldKgM2, // e.g. 3.5 kg/m²
  dryMatterPct = 20, // e.g. 20%
  efficiencyPct = 65, // e.g. 65% (factor de uso sin desperdicio)
  animalWeightKg = 420, // e.g. 420 kg
  occupancyDays = 2, // e.g. 2 days
  restDays = 30, // e.g. 30 days
  currentHeads = 45,
}: {
  areaHa: number;
  forageYieldKgM2: number;
  dryMatterPct?: number;
  efficiencyPct?: number;
  animalWeightKg?: number;
  occupancyDays?: number;
  restDays?: number;
  currentHeads?: number;
}): CarryingCapacityResult {
  const areaM2 = areaHa * 10000;
  const totalGreenForageKg = areaM2 * forageYieldKgM2;
  const totalDryMatterKg = totalGreenForageKg * (dryMatterPct / 100);
  const usableForageKg = totalGreenForageKg * (efficiencyPct / 100);
  const residualForageKg = totalGreenForageKg - usableForageKg;

  // 1 UGG = 450 kg live weight, consumes 10% PV in Green Forage (45 kg/day)
  const dailyConsumptionPerUGGKg = 45;
  const dailyConsumptionSelectedAnimalKg = animalWeightKg * 0.10; // 10% of body weight

  // Instantaneous carrying capacity for the specified occupancy duration
  const totalDailyFeedCapacityKg = usableForageKg / Math.max(1, occupancyDays);
  const instantaneousUGG = Number((totalDailyFeedCapacityKg / dailyConsumptionPerUGGKg).toFixed(1));
  const uggPerHectare = Number((instantaneousUGG / Math.max(0.1, areaHa)).toFixed(2));
  
  const maxHeadsForDuration = Math.floor(totalDailyFeedCapacityKg / Math.max(1, dailyConsumptionSelectedAnimalKg));

  // Rotation math (PRV / Voisin)
  const totalPaddocksNeededInRotation = Math.ceil(restDays / Math.max(1, occupancyDays)) + 1;
  const rotationsPerYear = 365 / (occupancyDays + restDays);
  const annualTotalUsableKg = usableForageKg * rotationsPerYear;
  const annualSustainableUGGPerHa = Number(
    (annualTotalUsableKg / (dailyConsumptionPerUGGKg * 365 * Math.max(0.1, areaHa))).toFixed(2)
  );

  // Water requirements: 65 L/day per 450kg UGG + margin
  const activeAnimals = currentHeads > 0 ? currentHeads : maxHeadsForDuration;
  const dailyWaterNeedLiters = activeAnimals * 65;
  // Peak drinking rate: 40% of daily water consumed in 2 peak hours
  const troughFlowRateRequiredLpm = Number(((dailyWaterNeedLiters * 0.40) / (2 * 60)).toFixed(1));

  return {
    totalGreenForageKg: Math.round(totalGreenForageKg),
    totalDryMatterKg: Math.round(totalDryMatterKg),
    usableForageKg: Math.round(usableForageKg),
    residualForageKg: Math.round(residualForageKg),
    dailyConsumptionPerUGGKg,
    dailyConsumptionSelectedAnimalKg: Math.round(dailyConsumptionSelectedAnimalKg),
    instantaneousUGG,
    uggPerHectare,
    maxHeadsForDuration,
    recommendedDurationDays: occupancyDays,
    restDaysRequired: restDays,
    totalPaddocksNeededInRotation,
    annualSustainableUGGPerHa,
    dailyWaterNeedLiters,
    troughFlowRateRequiredLpm,
  };
}

/**
 * Generate Google Earth KML XML representation of the Farm and Paddocks
 */
export function exportFarmToKML(farm: FarmGeoProfile, paddocks: PaddockGeo[]): string {
  const paddockPlacemarks = paddocks
    .map((p) => {
      const coords = p.polygon
        .map((pt) => `${pt.lng},${pt.lat},${p.elevationMsnm || 120}`)
        .join(' ');
      // Close polygon if not closed
      const closedCoords = coords + ` ${p.polygon[0].lng},${p.polygon[0].lat},${p.elevationMsnm || 120}`;

      return `
    <Placemark>
      <name>${p.code} - ${p.name}</name>
      <description>
        <![CDATA[
          <h3>${p.name} (${p.code})</h3>
          <p><b>Área:</b> ${p.areaHa} Ha (${p.areaM2.toLocaleString()} m²)</p>
          <p><b>Pasto:</b> ${p.pastureType}</p>
          <p><b>Aforo:</b> ${p.forageYieldKgM2} kg/m² (${p.forageTotalTon} Ton MV)</p>
          <p><b>Capacidad:</b> ${p.carryingCapacityUGG} UGG (${p.carryingCapacityUGGPerHa} UGG/Ha)</p>
          <p><b>Topografía:</b> ${p.topography} (Pendiente ${p.avgSlopePct}%)</p>
          <p><b>Suelo:</b> ${p.soilAnalysis.soilType} (pH: ${p.soilAnalysis.ph})</p>
          <p><b>Estado:</b> ${p.status.toUpperCase()}</p>
        ]]>
      </description>
      <Style>
        <LineStyle>
          <color>ff005500</color>
          <width>2</width>
        </LineStyle>
        <PolyStyle>
          <color>7f22aa44</color>
        </PolyStyle>
      </Style>
      <Polygon>
        <extrude>1</extrude>
        <altitudeMode>relativeToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${closedCoords}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
    })
    .join('\n');

  const farmBoundaryCoords = farm.perimeterPolygon
    .map((pt) => `${pt.lng},${pt.lat},0`)
    .join(' ');
  const closedFarmCoords =
    farmBoundaryCoords + ` ${farm.perimeterPolygon[0].lng},${farm.perimeterPolygon[0].lat},0`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${farm.name} - Plano SIG de Potreros</name>
    <description>Levantamiento georreferenciado de Finca, Potreros, Aforos y Capacidad de Carga</description>
    <Placemark>
      <name>Límite Perimetral - ${farm.name}</name>
      <description>Área Total: ${farm.totalAreaHa} Ha • Registro ICA: ${farm.registrationNumber}</description>
      <Style>
        <LineStyle>
          <color>ff0000ff</color>
          <width>4</width>
        </LineStyle>
        <PolyStyle>
          <color>200000ff</color>
        </PolyStyle>
      </Style>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${closedFarmCoords}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    ${paddockPlacemarks}
  </Document>
</kml>`;
}

/**
 * Generate GeoJSON FeatureCollection of the Farm and Paddocks
 */
export function exportFarmToGeoJSON(farm: FarmGeoProfile, paddocks: PaddockGeo[]): string {
  const features = [
    {
      type: 'Feature',
      properties: {
        type: 'farm_boundary',
        name: farm.name,
        totalAreaHa: farm.totalAreaHa,
        registrationNumber: farm.registrationNumber,
        department: farm.department,
        municipality: farm.municipality,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [farm.perimeterPolygon.map((p) => [p.lng, p.lat])],
      },
    },
    ...paddocks.map((p) => ({
      type: 'Feature',
      properties: {
        type: 'paddock',
        id: p.id,
        code: p.code,
        name: p.name,
        areaHa: p.areaHa,
        areaM2: p.areaM2,
        perimeterM: p.perimeterM,
        pastureType: p.pastureType,
        forageYieldKgM2: p.forageYieldKgM2,
        carryingCapacityUGG: p.carryingCapacityUGG,
        carryingCapacityUGGPerHa: p.carryingCapacityUGGPerHa,
        maxHeadsRecommended: p.maxHeadsRecommended,
        status: p.status,
        topography: p.topography,
        avgSlopePct: p.avgSlopePct,
        isFloodProne: p.isFloodProne,
        floodRisk: p.floodRisk,
        soilType: p.soilAnalysis.soilType,
        soilPh: p.soilAnalysis.ph,
        waterAccess: p.waterAccess,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [p.polygon.map((pt) => [pt.lng, pt.lat])],
      },
    })),
  ];

  const geoJson = {
    type: 'FeatureCollection',
    name: `${farm.name}_GIS`,
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
    },
    features,
  };

  return JSON.stringify(geoJson, null, 2);
}

/**
 * Parse KML or GeoJSON text into parsed polygons with auto-calculated areas
 */
export function parseGeoFileContent(fileContent: string, fileName: string): {
  success: boolean;
  detectedPaddocks: Partial<PaddockGeo>[];
  detectedBoundary?: GeoCoordinate[];
  message: string;
} {
  try {
    const trimmed = fileContent.trim();

    // Check if it's GeoJSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      const features = parsed.features || (Array.isArray(parsed) ? parsed : [parsed]);
      const paddocks: Partial<PaddockGeo>[] = [];
      let boundary: GeoCoordinate[] | undefined;

      features.forEach((feat: any, idx: number) => {
        const geom = feat.geometry || feat;
        if (geom.type === 'Polygon' && geom.coordinates && geom.coordinates[0]) {
          const rawCoords = geom.coordinates[0];
          const poly: GeoCoordinate[] = rawCoords.map((c: any) => ({
            lat: typeof c[1] === 'number' ? c[1] : parseFloat(c[1]),
            lng: typeof c[0] === 'number' ? c[0] : parseFloat(c[0]),
          }));

          if (poly.length >= 3) {
            const areaM2 = calculatePolygonAreaM2(poly);
            const areaHa = m2ToHectares(areaM2);
            const perimeterM = Math.round(calculatePolygonPerimeter(poly));

            if (feat.properties?.type === 'farm_boundary' || areaHa > 200) {
              boundary = poly;
            } else {
              const code = feat.properties?.code || `POT-0${idx + 1}`;
              const name = feat.properties?.name || `Potrero Importado ${idx + 1}`;
              const forageYieldKgM2 = feat.properties?.forageYieldKgM2 || 3.5;
              const cap = calculateCarryingCapacity({ areaHa, forageYieldKgM2 });

              paddocks.push({
                id: `imported-${Date.now()}-${idx}`,
                code,
                name,
                polygon: poly,
                color: '#2d6a4f',
                areaHa,
                areaM2: Math.round(areaM2),
                perimeterM,
                fenceType: 'electrica',
                pastureType: feat.properties?.pastureType || 'Brachiaria Brizantha',
                pastureCondition: 'bueno',
                topography: 'plana',
                avgSlopePct: 3,
                elevationMsnm: 130,
                isFloodProne: false,
                floodRisk: 'ninguno',
                drainageChannel: false,
                soilAnalysis: {
                  soilType: 'Franco Arcilloso',
                  ph: 6.0,
                  organicMatterPct: 4.0,
                  phosphorusPpm: 15,
                  potassiumMeq: 0.3,
                  cationExchangeCap: 20,
                  aluminumSaturationPct: 5,
                  fertilityLevel: 'media',
                  limingRecommendationTonHa: 0.5,
                  fertilizerRecommendation: 'Mantenimiento con N-P-K 15-15-15',
                },
                waterAccess: true,
                waterSource: 'bebedero_gravedad',
                waterTroughDistanceM: 80,
                troughCapacityLiters: 1500,
                flowRateLpm: 25,
                forageYieldKgM2,
                forageTotalTon: Math.round((areaM2 * forageYieldKgM2) / 1000),
                dryMatterPct: 20,
                grazingEfficiencyPct: 65,
                residualHeightCm: 12,
                restDaysTarget: 30,
                occupancyDaysTarget: 2,
                carryingCapacityUGG: cap.instantaneousUGG,
                carryingCapacityUGGPerHa: cap.uggPerHectare,
                maxHeadsRecommended: cap.maxHeadsForDuration,
                status: 'listo',
                daysInOccupancy: 0,
                daysInRest: 28,
              });
            }
          }
        }
      });

      return {
        success: true,
        detectedPaddocks: paddocks,
        detectedBoundary: boundary,
        message: `Se importaron ${paddocks.length} potreros desde archivo GeoJSON (${fileName}) con cálculo automático de áreas.`,
      };
    }

    // Check if it's KML XML
    if (trimmed.includes('<kml') || trimmed.includes('<coordinates>')) {
      const paddocks: Partial<PaddockGeo>[] = [];
      const coordMatches = trimmed.matchAll(/<coordinates>([\s\S]*?)<\/coordinates>/gi);
      let idx = 1;

      for (const match of coordMatches) {
        const rawCoordsStr = match[1].trim();
        const coordTokens = rawCoordsStr.split(/\s+/).filter(Boolean);
        const poly: GeoCoordinate[] = [];

        coordTokens.forEach((tok) => {
          const parts = tok.split(',');
          if (parts.length >= 2) {
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              poly.push({ lat, lng });
            }
          }
        });

        if (poly.length >= 3) {
          const areaM2 = calculatePolygonAreaM2(poly);
          const areaHa = m2ToHectares(areaM2);
          const perimeterM = Math.round(calculatePolygonPerimeter(poly));
          const forageYieldKgM2 = 3.6;
          const cap = calculateCarryingCapacity({ areaHa, forageYieldKgM2 });

          paddocks.push({
            id: `kml-imported-${Date.now()}-${idx}`,
            code: `POT-K${idx.toString().padStart(2, '0')}`,
            name: `Potrero KML ${idx}`,
            polygon: poly,
            color: '#1b4332',
            areaHa,
            areaM2: Math.round(areaM2),
            perimeterM,
            fenceType: 'electrica',
            pastureType: 'Brachiaria Brizantha',
            pastureCondition: 'excelente',
            topography: 'plana',
            avgSlopePct: 2,
            elevationMsnm: 125,
            isFloodProne: false,
            floodRisk: 'ninguno',
            drainageChannel: false,
            soilAnalysis: {
              soilType: 'Franco Arcilloso',
              ph: 5.9,
              organicMatterPct: 4.2,
              phosphorusPpm: 18,
              potassiumMeq: 0.35,
              cationExchangeCap: 22,
              aluminumSaturationPct: 8,
              fertilityLevel: 'media',
              limingRecommendationTonHa: 0.8,
              fertilizerRecommendation: 'Aplicar 100 kg/ha DAP + 50 kg/ha Urea en lluvias',
            },
            waterAccess: true,
            waterSource: 'bebedero_gravedad',
            waterTroughDistanceM: 90,
            troughCapacityLiters: 2000,
            flowRateLpm: 30,
            forageYieldKgM2,
            forageTotalTon: Math.round((areaM2 * forageYieldKgM2) / 1000),
            dryMatterPct: 20,
            grazingEfficiencyPct: 65,
            residualHeightCm: 12,
            restDaysTarget: 30,
            occupancyDaysTarget: 2,
            carryingCapacityUGG: cap.instantaneousUGG,
            carryingCapacityUGGPerHa: cap.uggPerHectare,
            maxHeadsRecommended: cap.maxHeadsForDuration,
            status: 'descanso',
            daysInOccupancy: 0,
            daysInRest: 18,
          });
          idx++;
        }
      }

      return {
        success: true,
        detectedPaddocks: paddocks,
        message: `Se importaron ${paddocks.length} potreros desde archivo KML (${fileName}) con cálculo instantáneo de áreas y aforos.`,
      };
    }

    return {
      success: false,
      detectedPaddocks: [],
      message: 'Formato no reconocido. Por favor cargue un archivo KML o GeoJSON válido.',
    };
  } catch (err: any) {
    return {
      success: false,
      detectedPaddocks: [],
      message: `Error al procesar archivo: ${err.message || err}`,
    };
  }
}

/**
 * Export paddocks list to standard KML file format for Google Earth and QGIS
 */
export function exportPaddocksToKml(paddocks: PaddockGeo[], farmName: string = 'GanaderIA Predio'): string {
  const placemarks = paddocks
    .map((p) => {
      const coordStr = p.polygon.map((pt) => `${pt.lng},${pt.lat},0`).join(' ');
      return `    <Placemark>
      <name>${p.code} - ${p.name}</name>
      <description><![CDATA[
        <b>Área:</b> ${p.areaHa} Ha (${p.areaM2.toLocaleString()} m²)<br/>
        <b>Pasto:</b> ${p.pastureType}<br/>
        <b>Estado:</b> ${p.status}<br/>
        <b>Capacidad de Carga:</b> ${p.carryingCapacityUGG} UGG (${p.carryingCapacityUGGPerHa} UGG/Ha)<br/>
        <b>Biomasa Total:</b> ${p.forageTotalTon} Ton MV<br/>
        <b>Topografía:</b> ${p.topography} (${p.avgSlopePct}% pendiente)<br/>
        <b>pH Suelo:</b> ${p.soilAnalysis.ph}<br/>
        <b>Riesgo Inundación:</b> ${p.floodRisk}
      ]]></description>
      <Style>
        <LineStyle>
          <color>ff004a2d</color>
          <width>2</width>
        </LineStyle>
        <PolyStyle>
          <color>7f2d6a4f</color>
        </PolyStyle>
      </Style>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coordStr} ${p.polygon[0].lng},${p.polygon[0].lat},0</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${farmName} - Potreros Georreferenciados</name>
    <description>Exportado desde Sistema SIG GanaderIA</description>
${placemarks}
  </Document>
</kml>`;
}

/**
 * Export paddocks list to GeoJSON FeatureCollection format
 */
export function exportPaddocksToGeoJson(paddocks: PaddockGeo[], farmName: string = 'GanaderIA Predio'): string {
  const features = paddocks.map((p) => ({
    type: 'Feature',
    properties: {
      id: p.id,
      code: p.code,
      name: p.name,
      areaHa: p.areaHa,
      areaM2: p.areaM2,
      perimeterM: p.perimeterM,
      pastureType: p.pastureType,
      status: p.status,
      carryingCapacityUGG: p.carryingCapacityUGG,
      carryingCapacityUGGPerHa: p.carryingCapacityUGGPerHa,
      maxHeadsRecommended: p.maxHeadsRecommended,
      forageYieldKgM2: p.forageYieldKgM2,
      forageTotalTon: p.forageTotalTon,
      topography: p.topography,
      elevationMsnm: p.elevationMsnm,
      avgSlopePct: p.avgSlopePct,
      soilPh: p.soilAnalysis.ph,
      organicMatterPct: p.soilAnalysis.organicMatterPct,
      isFloodProne: p.isFloodProne,
      floodRisk: p.floodRisk,
      waterSource: p.waterSource,
      flowRateLpm: p.flowRateLpm,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          ...p.polygon.map((pt) => [pt.lng, pt.lat]),
          [p.polygon[0].lng, p.polygon[0].lat],
        ],
      ],
    },
  }));

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      name: `${farmName} - Potreros`,
      features,
    },
    null,
    2,
  );
}

/**
 * Subdivides a bounding farm polygon into N rotational PRV paddocks
 */
export function subdividePolygonIntoPaddocks(
  boundaryPoints: GeoCoordinate[],
  numPaddocks: number = 6,
  farmName: string = 'Finca Satelital',
  pastureType: string = 'Brachiaria Brizantha cv. Marandú',
  baseElevation: number = 135,
): PaddockGeo[] {
  if (boundaryPoints.length < 3) return [];

  // Compute bounding box
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;

  boundaryPoints.forEach((p) => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  });

  const totalAreaM2 = calculatePolygonAreaM2(boundaryPoints);
  const targetAreaM2 = totalAreaM2 / numPaddocks;

  // Determine grid dimensions (cols x rows)
  let cols = 1;
  let rows = 1;
  if (numPaddocks <= 2) {
    cols = numPaddocks;
    rows = 1;
  } else if (numPaddocks <= 4) {
    cols = 2;
    rows = Math.ceil(numPaddocks / 2);
  } else if (numPaddocks <= 6) {
    cols = 3;
    rows = 2;
  } else if (numPaddocks <= 8) {
    cols = 4;
    rows = 2;
  } else {
    cols = 4;
    rows = Math.ceil(numPaddocks / 4);
  }

  const dLng = (maxLng - minLng) / cols;
  const dLat = (maxLat - minLat) / rows;

  const paddockColors = [
    '#2d6a4f',
    '#40916c',
    '#52b788',
    '#74c69d',
    '#1b4332',
    '#386641',
    '#6a994e',
    '#a7c957',
    '#2b9348',
    '#007f5f',
    '#55a630',
    '#80b918',
  ];

  const paddocks: PaddockGeo[] = [];
  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (count >= numPaddocks) break;

      const pMinLng = minLng + c * dLng;
      const pMaxLng = minLng + (c + 1) * dLng;
      const pMinLat = minLat + r * dLat;
      const pMaxLat = minLat + (r + 1) * dLat;

      // Small inset padding for internal electric fences and alleyways
      const padLng = dLng * 0.04;
      const padLat = dLat * 0.04;

      const cellPolygon: GeoCoordinate[] = [
        { lat: pMaxLat - padLat, lng: pMinLng + padLng },
        { lat: pMaxLat - padLat, lng: pMaxLng - padLng },
        { lat: pMinLat + padLat, lng: pMaxLng - padLng },
        { lat: pMinLat + padLat, lng: pMinLng + padLng },
      ];

      const areaM2 = calculatePolygonAreaM2(cellPolygon);
      const areaHa = m2ToHectares(areaM2);
      const perimeterM = Math.round(calculatePolygonPerimeter(cellPolygon));
      const code = `POT-${count + 1 < 10 ? `0${count + 1}` : count + 1}`;
      const carryingCapacityUGG = Number((areaHa * 2.85).toFixed(1));

      paddocks.push({
        id: `pot-sat-${count + 1}-${Date.now()}`,
        code,
        name: `Potrero ${count + 1} (${code})`,
        polygon: cellPolygon,
        color: paddockColors[count % paddockColors.length],
        areaHa,
        areaM2: Math.round(areaM2),
        perimeterM,
        fenceType: 'electrica',
        pastureType,
        pastureCondition: count % 3 === 0 ? 'excelente' : 'bueno',
        topography: r % 2 === 0 ? 'plana' : 'ondulada',
        avgSlopePct: Number((2.0 + (r * 1.5)).toFixed(1)),
        elevationMsnm: Math.round(baseElevation + (r * 4) + (c * 2)),
        isFloodProne: r === 0 && c === 0,
        floodRisk: r === 0 && c === 0 ? 'medio' : 'ninguno',
        drainageChannel: r === 0,
        soilAnalysis: {
          soilType: 'Franco Arcilloso',
          ph: Number((5.8 + (count * 0.1) % 0.8).toFixed(1)),
          organicMatterPct: 4.2,
          phosphorusPpm: 18.5,
          potassiumMeq: 0.38,
          cationExchangeCap: 24.0,
          aluminumSaturationPct: 4.5,
          fertilityLevel: 'media',
          limingRecommendationTonHa: 0.5,
          fertilizerRecommendation: 'Fertilización de establecimiento con N-P-K 15-15-15 tras primer pastoreo',
        },
        waterAccess: true,
        waterSource: 'bebedero_gravedad',
        waterTroughDistanceM: 85,
        troughCapacityLiters: 2000,
        flowRateLpm: 35,
        forageYieldKgM2: 3.8,
        forageTotalTon: Math.round((areaHa * 10000 * 3.8) / 1000),
        dryMatterPct: 20,
        grazingEfficiencyPct: 65,
        residualHeightCm: 14,
        restDaysTarget: 30,
        occupancyDaysTarget: 2,
        carryingCapacityUGG,
        carryingCapacityUGGPerHa: 2.85,
        maxHeadsRecommended: Math.round(carryingCapacityUGG * 1.2),
        status: count === 0 ? 'ocupado' : count === 1 ? 'listo' : 'descanso',
        daysInOccupancy: count === 0 ? 1 : 0,
        daysInRest: count === 0 ? 0 : count * 4 + 2,
      });

      count++;
    }
  }

  return paddocks;
}

/**
 * Generates realistic topography contour lines for a satellite delimited bounding area
 */
export function generateContourLinesForBoundary(
  centerLat: number,
  centerLng: number,
  baseElevation: number = 130,
): import('../types').ContourLine[] {
  const isohipsas = [
    { elev: baseElevation - 10, offset: 0.007, isMajor: true },
    { elev: baseElevation - 5, offset: 0.0055, isMajor: false },
    { elev: baseElevation, offset: 0.004, isMajor: true },
    { elev: baseElevation + 5, offset: 0.0028, isMajor: false },
    { elev: baseElevation + 10, offset: 0.0016, isMajor: true },
    { elev: baseElevation + 15, offset: 0.0008, isMajor: false },
  ];

  return isohipsas.map((iso, idx) => {
    const points: GeoCoordinate[] = [];
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 1.6 - 0.8;
      const wobble = Math.sin(i * 1.4) * 0.0004;
      points.push({
        lat: centerLat + (Math.sin(angle) * iso.offset) + wobble,
        lng: centerLng + (Math.cos(angle) * iso.offset * 1.3) + (wobble * 0.5),
      });
    }
    return {
      id: `contour-sat-${idx + 1}`,
      elevationMsnm: iso.elev,
      isMajor: iso.isMajor,
      points,
    };
  });
}

/**
 * Exports paddock geometries and metadata into standard GeoJSON FeatureCollection format
 */
export function exportPaddocksToGeoJSON(paddocks: PaddockGeo[], farmName: string = 'Finca'): string {
  const featureCollection = {
    type: 'FeatureCollection',
    name: `${farmName} - SIG Potreros`,
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      },
    },
    features: paddocks.map((p) => {
      // GeoJSON coordinates are [lng, lat]
      const coordinates = [
        ...p.polygon.map((pt) => [Number(pt.lng.toFixed(6)), Number(pt.lat.toFixed(6))]),
        // Close polygon if needed
        [Number(p.polygon[0].lng.toFixed(6)), Number(p.polygon[0].lat.toFixed(6))],
      ];

      return {
        type: 'Feature',
        id: p.id,
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
        properties: {
          id: p.id,
          code: p.code,
          name: p.name,
          areaHa: p.areaHa,
          pastureType: p.pastureType,
          pastureCondition: p.pastureCondition,
          carryingCapacityUGG: p.carryingCapacityUGG,
          carryingCapacityUGGPerHa: p.carryingCapacityUGGPerHa,
          forageYieldKgM2: p.forageYieldKgM2,
          forageTotalTon: p.forageTotalTon,
          status: p.status,
          soilType: p.soilAnalysis?.soilType || 'Franco Arcilloso',
          soilPh: p.soilAnalysis?.ph || 6.0,
          waterSource: p.waterSource,
          waterAccess: p.waterAccess,
          avgSlopePct: p.avgSlopePct,
          elevationMsnm: p.elevationMsnm,
          color: p.color,
        },
      };
    }),
  };

  return JSON.stringify(featureCollection, null, 2);
}

