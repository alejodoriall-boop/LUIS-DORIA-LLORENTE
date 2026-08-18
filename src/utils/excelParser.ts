import * as XLSX from 'xlsx';
import { ImportedAnimalRecord } from '../types';

/**
 * Intelligent parser that maps flexible column headers from Auction/Excel files
 * to standardized ImportedAnimalRecord fields.
 */
export function normalizeHeaders(header: string): string {
  const h = header.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (h.includes('arete') || h.includes('id') || h.includes('chapa') || h.includes('identificacion') || h.includes('codigo') || h.includes('numero') || h.includes('tag')) {
    return 'tag';
  }
  if (h.includes('peso') || h.includes('kg') || h.includes('kilos') || h.includes('peso_kg') || h.includes('weight')) {
    return 'weight';
  }
  if (h.includes('sex') || h.includes('genero') || h.includes('macho') || h.includes('hembra') || h.includes('m_h') || h.includes('tipificacion')) {
    return 'sex';
  }
  if (h.includes('raza') || h.includes('cruce') || h.includes('fenotipo') || h.includes('breed')) {
    return 'breed';
  }
  if (h.includes('precio') || h.includes('valor') || h.includes('costo') || h.includes('price')) {
    return 'pricePerKg';
  }
  if (h.includes('total') || h.includes('precio_total') || h.includes('valor_total')) {
    return 'totalPrice';
  }
  if (h.includes('color') || h.includes('capa') || h.includes('pelaje')) {
    return 'color';
  }
  if (h.includes('tipo') || h.includes('categoria') || h.includes('categoria_zootecnica') || h.includes('category')) {
    return 'category';
  }
  if (h.includes('hierro') || h.includes('marca') || h.includes('fierro') || h.includes('brand') || h.includes('hierro_marca')) {
    return 'brandingIron';
  }
  if (h.includes('guia') || h.includes('movilizacion') || h.includes('gsmi') || h.includes('ica') || h.includes('guia_movilizacion')) {
    return 'movementGuideNumber';
  }
  if (h.includes('lote') || h.includes('subasta_lote') || h.includes('corral')) {
    return 'lotCode';
  }
  if (h.includes('edad') || h.includes('meses') || h.includes('age') || h.includes('mes')) {
    return 'ageMonths';
  }
  if (h.includes('origen') || h.includes('procedencia') || h.includes('vendedor') || h.includes('finca_origen')) {
    return 'origin';
  }
  if (h.includes('obs') || h.includes('nota') || h.includes('detalle') || h.includes('comentario')) {
    return 'notes';
  }
  return header;
}

/**
 * Parse an Excel (.xlsx, .xls) or CSV file into a list of ImportedAnimalRecord
 */
export async function parseExcelOrCsvFile(file: File): Promise<ImportedAnimalRecord[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('El archivo no contiene hojas válidas.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('El archivo está vacío o no tiene registros de datos.');
  }

  return processRawObjects(rawRows);
}

/**
 * Parse plain text copied and pasted from Excel, Google Sheets, or TSV/CSV
 */
export function parsePastedTableText(pastedText: string): ImportedAnimalRecord[] {
  const lines = pastedText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter (tab \t or comma , or semicolon ;)
  const firstLine = lines[0];
  let delimiter = '\t';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';')) delimiter = ';';
  else if (firstLine.includes(',')) delimiter = ',';

  const headerCells = lines[0].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
  const hasHeaders = headerCells.some((c) => {
    const norm = normalizeHeaders(c);
    return ['tag', 'weight', 'sex', 'breed', 'pricePerKg'].includes(norm);
  });

  const records: ImportedAnimalRecord[] = [];
  const startIdx = hasHeaders ? 1 : 0;
  const headers = hasHeaders ? headerCells : ['tag', 'weight', 'sex', 'breed', 'pricePerKg'];

  for (let i = startIdx; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue;

    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cells[idx] !== undefined ? cells[idx] : '';
    });

    const parsed = transformRowToAnimal(rowObj, i);
    if (parsed) records.push(parsed);
  }

  return records;
}

/**
 * Transforms an array of raw row objects into ImportedAnimalRecord list
 */
function processRawObjects(rawRows: Record<string, any>[]): ImportedAnimalRecord[] {
  const records: ImportedAnimalRecord[] = [];

  rawRows.forEach((row, idx) => {
    const parsed = transformRowToAnimal(row, idx + 1);
    if (parsed) records.push(parsed);
  });

  return records;
}

function transformRowToAnimal(row: Record<string, any>, index: number): ImportedAnimalRecord | null {
  const normalizedRow: Record<string, any> = {};
  Object.keys(row).forEach((key) => {
    const normKey = normalizeHeaders(key);
    normalizedRow[normKey] = row[key];
  });

  // Extract tag/ID
  let tag = normalizedRow['tag'] ? String(normalizedRow['tag']).trim() : '';
  if (!tag) {
    tag = `SUB-${1000 + index}`;
  }
  if (!tag.startsWith('#') && !tag.startsWith('SUB-') && !tag.startsWith('ICA-')) {
    tag = `#${tag}`;
  }

  // Extract weight
  let weight = parseFloat(String(normalizedRow['weight']).replace(',', '.').replace(/[^0-9.]/g, ''));
  if (isNaN(weight) || weight <= 0) {
    weight = 350 + Math.floor(Math.random() * 80); // Default fallback weight
  }

  // Extract sex and Colombian Livestock Sex Code: TO, VE, HV, HL, ML, MC, VP
  const rawSex = String(normalizedRow['sex'] || '').toUpperCase().trim();
  let sexCode: string = 'MC';
  let sex: 'macho' | 'hembra' = 'macho';

  if (rawSex === 'TO' || rawSex.includes('TORO') || rawSex.includes('REPRODUCTOR')) {
    sexCode = 'TO';
    sex = 'macho';
  } else if (rawSex === 'VE' || rawSex.includes('ESCOTERA') || rawSex.includes('HORRA') || rawSex.includes('SECA')) {
    sexCode = 'VE';
    sex = 'hembra';
  } else if (rawSex === 'HV' || rawSex.includes('VIENTRE') || rawSex.includes('NOVILLA DE VIENTRE')) {
    sexCode = 'HV';
    sex = 'hembra';
  } else if (rawSex === 'HL' || rawSex.includes('HEMBRA DE LEVANTE') || rawSex.includes('TERNERA')) {
    sexCode = 'HL';
    sex = 'hembra';
  } else if (rawSex === 'ML' || rawSex.includes('MACHO DE LEVANTE') || rawSex.includes('TERNERO')) {
    sexCode = 'ML';
    sex = 'macho';
  } else if (rawSex === 'MC' || rawSex.includes('MACHO DE CEBA') || rawSex.includes('CEBA') || rawSex.includes('NOVILLO')) {
    sexCode = 'MC';
    sex = 'macho';
  } else if (rawSex === 'VP' || rawSex.includes('PARIDA') || rawSex.includes('CRIA AL PIE')) {
    sexCode = 'VP';
    sex = 'hembra';
  } else if (rawSex.includes('H') || rawSex.includes('HEMBRA') || rawSex.includes('F') || rawSex.includes('VACA')) {
    sexCode = weight > 400 ? 'VE' : weight > 280 ? 'HV' : 'HL';
    sex = 'hembra';
  } else {
    sexCode = weight > 380 ? 'MC' : 'ML';
    sex = 'macho';
  }

  // Extract breed
  const breed = String(normalizedRow['breed'] || normalizedRow['raza'] || 'Brahman Comercial / Cebú').trim();

  // Price
  let pricePerKg = parseFloat(String(normalizedRow['pricePerKg'] || '8500').replace(/[^0-9.]/g, ''));
  if (isNaN(pricePerKg) || pricePerKg <= 0) pricePerKg = 8500;

  let totalPrice = parseFloat(String(normalizedRow['totalPrice'] || '').replace(/[^0-9.]/g, ''));
  if (isNaN(totalPrice) || totalPrice <= 0) {
    totalPrice = Math.round(weight * pricePerKg);
  }

  // Category / Tipo
  const rawCat = String(normalizedRow['category'] || '').toLowerCase();
  let category = 'ceba';
  if (rawCat.includes('cria') || rawCat.includes('cría') || rawCat.includes('levante')) {
    category = 'cria';
  } else if (rawCat.includes('leche') || rawCat.includes('doble')) {
    category = 'leche';
  } else if (rawCat.includes('genetica') || rawCat.includes('genética') || rawCat.includes('puro')) {
    category = 'genetica';
  } else {
    category = sexCode === 'MC' ? 'ceba' : sexCode === 'ML' || sexCode === 'HL' ? 'cria' : sexCode === 'TO' ? 'genetica' : 'cria';
  }

  // Age in months
  let ageMonths = parseInt(String(normalizedRow['ageMonths'] || ''), 10);
  if (isNaN(ageMonths) || ageMonths <= 0) {
    ageMonths = weight < 220 ? 8 : weight < 340 ? 18 : 26;
  }

  const lotCode = String(normalizedRow['lotCode'] || `LOTE-${Math.floor(10 + Math.random() * 90)}`).trim();
  const color = String(normalizedRow['color'] || 'Blanco / Gris').trim();
  const brandingIronName = String(normalizedRow['brandingIron'] || normalizedRow['hierro'] || '').trim() || undefined;
  const movementGuideNumber = String(normalizedRow['movementGuideNumber'] || normalizedRow['guia'] || '').trim() || undefined;
  const origin = String(normalizedRow['origin'] || 'Subasta Comercial').trim();
  const notes = String(normalizedRow['notes'] || 'Ingreso por compra').trim();

  return {
    id: `anim-imp-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    tag,
    weightKg: Number(weight.toFixed(1)),
    sex,
    sexCode,
    breed,
    category,
    pricePerKg,
    totalPrice,
    lotCode,
    ageMonths,
    color,
    brandingIronName,
    movementGuideNumber,
    origin,
    notes,
  };
}

/**
 * Generates sample data representing realistic cattle auction lots from Colombian subastas
 */
export function generateAuctionSampleData(
  sampleType: 'subastar_ceba' | 'subacasanare_cria' | 'feria_leche' = 'subastar_ceba',
): ImportedAnimalRecord[] {
  if (sampleType === 'subastar_ceba') {
    // 25 Novillos de Ceba Cebú / Brahman Comercial (MC)
    const baseTags = [
      'SUB-8012', 'SUB-8013', 'SUB-8014', 'SUB-8015', 'SUB-8016',
      'SUB-8017', 'SUB-8018', 'SUB-8019', 'SUB-8020', 'SUB-8021',
      'SUB-8022', 'SUB-8023', 'SUB-8024', 'SUB-8025', 'SUB-8026',
      'SUB-8027', 'SUB-8028', 'SUB-8029', 'SUB-8030', 'SUB-8031',
      'SUB-8032', 'SUB-8033', 'SUB-8034', 'SUB-8035', 'SUB-8036',
    ];
    const breeds = ['Brahman Blanco', 'Cebú Comercial', 'Nelore x Brahman', 'Guzerá Cruce', 'Brangus Comercial'];
    const colors = ['Blanco / Gris', 'Rojo / Sardo', 'Bayo / Amarillo', 'Hosco / Chorreado'];

    return baseTags.map((tag, idx) => {
      const weight = 360 + (idx * 3.5) % 45 + Math.floor(Math.random() * 12);
      const pricePerKg = 8750;
      return {
        id: `anim-sample-${idx + 1}`,
        tag: `#${tag}`,
        weightKg: Number(weight.toFixed(1)),
        sex: 'macho' as const,
        sexCode: 'MC',
        breed: breeds[idx % breeds.length],
        category: 'ceba',
        pricePerKg,
        totalPrice: Math.round(weight * pricePerKg),
        lotCode: 'CORRAL-08',
        ageMonths: 22 + (idx % 4),
        color: colors[idx % colors.length],
        brandingIronName: '🔥 Hierro Ganadería San Juan',
        movementGuideNumber: `ICA-GSMI-2026-${88000 + idx}`,
        origin: 'Subastar S.A. - Sede Planeta Rica',
        notes: 'Excelente conformación carnicera, aplomos correctos y buena masa muscular.',
      };
    });
  }

  if (sampleType === 'subacasanare_cria') {
    // 18 Terneros de Cría y Levante (ML y HL)
    const baseTags = [
      'CAS-4101', 'CAS-4102', 'CAS-4103', 'CAS-4104', 'CAS-4105', 'CAS-4106',
      'CAS-4107', 'CAS-4108', 'CAS-4109', 'CAS-4110', 'CAS-4111', 'CAS-4112',
      'CAS-4113', 'CAS-4114', 'CAS-4115', 'CAS-4116', 'CAS-4117', 'CAS-4118',
    ];
    const breeds = ['Braford F1', 'Sanmartinero x Cebú', 'Brahman Rojo', 'Blanco Orejinegro (BON) x Cebú'];
    const colors = ['Rojo / Sardo', 'Bayo / Amarillo', 'Hosco / Chorreado', 'Pintado / Overo'];

    return baseTags.map((tag, idx) => {
      const weight = 195 + (idx * 4.2) % 35 + Math.floor(Math.random() * 8);
      const pricePerKg = 9200;
      const isFemale = idx % 3 === 0;
      return {
        id: `anim-sample-cria-${idx + 1}`,
        tag: `#${tag}`,
        weightKg: Number(weight.toFixed(1)),
        sex: isFemale ? ('hembra' as const) : ('macho' as const),
        sexCode: isFemale ? 'HL' : 'ML',
        breed: breeds[idx % breeds.length],
        category: 'cria',
        pricePerKg,
        totalPrice: Math.round(weight * pricePerKg),
        lotCode: 'LOTE-CRIA-04',
        ageMonths: 9 + (idx % 3),
        color: colors[idx % colors.length],
        brandingIronName: '🔥 Hierro Santa Bárbara (SB)',
        movementGuideNumber: `ICA-GSMI-2026-${74100 + idx}`,
        origin: 'Subacasanare - Subasta de Levante Yopal',
        notes: 'Terneros destetados sanos, desparasitados y con vacuna de carbón.',
      };
    });
  }

  // Feria Leche y Doble Propósito (HV y VP)
  const baseTags = [
    'LECH-301', 'LECH-302', 'LECH-303', 'LECH-304', 'LECH-305',
    'LECH-306', 'LECH-307', 'LECH-308', 'LECH-309', 'LECH-310',
  ];
  return baseTags.map((tag, idx) => {
    const weight = 440 + (idx * 6) % 40;
    const pricePerKg = 8100;
    const isParida = idx % 2 === 0;
    return {
      id: `anim-sample-lech-${idx + 1}`,
      tag: `#${tag}`,
      weightKg: Number(weight.toFixed(1)),
      sex: 'hembra' as const,
      sexCode: isParida ? 'VP' : 'HV',
      breed: idx % 2 === 0 ? 'Girolando F1 (Gyr x Holstein)' : 'Guzolando',
      category: 'leche',
      pricePerKg,
      totalPrice: Math.round(weight * pricePerKg),
      lotCode: 'CORRAL-LECHE-02',
      ageMonths: 32,
      color: 'Pintado / Overo',
      brandingIronName: '🔥 Hierro La Esmeralda',
      movementGuideNumber: `ICA-GSMI-2026-${61200 + idx}`,
      origin: 'Feria Ganadera y Lechera',
      notes: isParida ? 'Vaca parida con cría al pie hembra.' : 'Novilla de vientre preñada garantizada.',
    };
  });
}

/**
 * Downloads a sample template Excel (.xlsx) file that users can fill in
 */
export function downloadExcelTemplate(): void {
  const headers = [
    'Identificacion_Numero',
    'Peso_Kg',
    'Raza_Cruce',
    'Sexo_Codigo',
    'Color_Pelaje',
    'Tipo_Categoria',
    'Hierro_Marca',
    'Precio_Kg_COP',
    'Guia_Movilizacion_ICA',
    'Observaciones',
  ];

  const sampleRows = [
    ['#SUB-9001', 375.5, 'Brahman Blanco', 'MC', 'Blanco / Gris', 'Ceba', 'Hierro San Juan', 8800, 'ICA-GSMI-890123', 'Novillo en ceba'],
    ['#SUB-9002', 362.0, 'Nelore Comercial', 'MC', 'Blanco / Gris', 'Ceba', 'Hierro San Juan', 8800, 'ICA-GSMI-890123', 'Novillo en ceba'],
    ['#SUB-9003', 215.0, 'Cebú Comercial', 'ML', 'Rojo / Sardo', 'Levante', 'Hierro San Juan', 9200, 'ICA-GSMI-890123', 'Macho de levante'],
    ['#SUB-9004', 345.5, 'Braford F1', 'HV', 'Rojo / Sardo', 'Cría', 'Hierro El Recuerdo', 8900, 'ICA-GSMI-890123', 'Hembra de vientre'],
    ['#SUB-9005', 430.0, 'Girolando F1', 'VP', 'Pintado / Overo', 'Lechería', 'Hierro La Palma', 8500, 'ICA-GSMI-890123', 'Vaca parida con cría'],
    ['#SUB-9006', 480.0, 'Brahman Gris Puro', 'TO', 'Blanco / Gris', 'Genética', 'Hierro Ganadería Central', 12000, 'ICA-GSMI-890123', 'Toro reproductor'],
    ['#SUB-9007', 410.0, 'Gyr Lechero', 'VE', 'Rojo / Sardo', 'Doble Propósito', 'Hierro La Palma', 8200, 'ICA-GSMI-890123', 'Vaca escotera / horra'],
    ['#SUB-9008', 210.0, 'Brangus Negro', 'HL', 'Negro / Arrebolado', 'Levante', 'Hierro El Recuerdo', 9100, 'ICA-GSMI-890123', 'Hembra de levante'],
  ];

  const data = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla_Ingreso_Ganado');

  // Trigger browser download
  XLSX.writeFile(workbook, 'Plantilla_Registro_Compra_Bovinos.xlsx');
}

/* ==========================================================================
   PALPATION & REPRODUCTION BATCH EXCEL IMPORTER
   ========================================================================== */

export interface PalpationBatchItemRecord {
  tag: string;
  color?: string;
  breed?: string;
  weightKg?: number;
  result: 'preñada' | 'vacia_sincronizacion' | 'vacia_monta_natural' | 'vacia_ia' | 'vacia_te' | 'dudosa';
  gestationDays?: string;
  leftOvaryStatus?: 'cl_activo' | 'foliculo_dominante' | 'foliculos_pequenos' | 'anestro_inactivo' | 'quiste_folicular' | 'quiste_luteico';
  rightOvaryStatus?: 'cl_activo' | 'foliculo_dominante' | 'foliculos_pequenos' | 'anestro_inactivo' | 'quiste_folicular' | 'quiste_luteico';
  uterineStatus?: 'normal_tonico' | 'flacido_inerte' | 'gestante_vesicula' | 'endometritis_piometra';
  cervixStatus?: 'cerrado_normal' | 'moco_limpido' | 'abierto_turbio';
  ovaryMeasurementsNotes?: string;
  sireOrStraw?: string;
  protocol?: string;
  notes?: string;
}

function normalizePalpationHeaders(header: string): string {
  const h = header.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (h.includes('arete') || h.includes('tag') || h.includes('id') || h.includes('numero') || h.includes('chapa')) {
    return 'tag';
  }
  if (h.includes('color') || h.includes('capa') || h.includes('pelaje')) {
    return 'color';
  }
  if (h.includes('raza') || h.includes('cruce') || h.includes('breed') || h.includes('fenotipo')) {
    return 'breed';
  }
  if (h.includes('peso') || h.includes('kg') || h.includes('weight')) {
    return 'weightKg';
  }
  if (h.includes('result') || h.includes('diagnostico') || h.includes('diag') || h.includes('estado_repro') || h.includes('palpacion')) {
    return 'result';
  }
  if (h.includes('dias') || h.includes('gestacion') || h.includes('semanas') || h.includes('tiempo')) {
    return 'gestationDays';
  }
  if (h.includes('oi') || h.includes('izquierdo') || h.includes('left')) {
    return 'leftOvaryStatus';
  }
  if (h.includes('od') || h.includes('derecho') || h.includes('right')) {
    return 'rightOvaryStatus';
  }
  if (h.includes('utero') || h.includes('uterino')) {
    return 'uterineStatus';
  }
  if (h.includes('cervix') || h.includes('cuello')) {
    return 'cervixStatus';
  }
  if (h.includes('medida') || h.includes('ecografia') || h.includes('foliculo') || h.includes('hallazgo')) {
    return 'ovaryMeasurementsNotes';
  }
  if (h.includes('pajilla') || h.includes('semen') || h.includes('toro') || h.includes('reproductor') || h.includes('sire')) {
    return 'sireOrStraw';
  }
  if (h.includes('protocolo') || h.includes('iatf') || h.includes('tratamiento') || h.includes('sincroniz')) {
    return 'protocol';
  }
  if (h.includes('nota') || h.includes('obs') || h.includes('comentario')) {
    return 'notes';
  }
  return header;
}

function mapResultValue(raw: any): PalpationBatchItemRecord['result'] {
  const s = String(raw || '').toLowerCase().trim();
  if (s.includes('preñ') || s.includes('preg') || s.includes('gestant') || s === 'p' || s === '1') {
    return 'preñada';
  }
  if (s.includes('iatf') || s.includes('sincroniz')) {
    return 'vacia_sincronizacion';
  }
  if (s.includes('monta') || s.includes('toro')) {
    return 'vacia_monta_natural';
  }
  if (s.includes('ia') || s.includes('insemin')) {
    return 'vacia_ia';
  }
  if (s.includes('te') || s.includes('receptora') || s.includes('embri')) {
    return 'vacia_te';
  }
  if (s.includes('duda') || s.includes('dudosa') || s.includes('revis')) {
    return 'dudosa';
  }
  return 'vacia_sincronizacion';
}

function mapOvaryValue(raw: any, defaultVal: PalpationBatchItemRecord['leftOvaryStatus']): PalpationBatchItemRecord['leftOvaryStatus'] {
  const s = String(raw || '').toLowerCase().trim();
  if (s.includes('cl') || s.includes('luteo') || s.includes('lúteo')) return 'cl_activo';
  if (s.includes('dominante') || s.includes('folic_dom')) return 'foliculo_dominante';
  if (s.includes('pequeñ') || s.includes('pequen')) return 'foliculos_pequenos';
  if (s.includes('anestro') || s.includes('inactiv')) return 'anestro_inactivo';
  if (s.includes('quiste_fol') || s.includes('quiste folicular')) return 'quiste_folicular';
  if (s.includes('quiste_lut') || s.includes('quiste luteico')) return 'quiste_luteico';
  return defaultVal;
}

function mapUterineValue(raw: any): PalpationBatchItemRecord['uterineStatus'] {
  const s = String(raw || '').toLowerCase().trim();
  if (s.includes('flacid') || s.includes('inerte')) return 'flacido_inerte';
  if (s.includes('vesicula') || s.includes('gestant')) return 'gestante_vesicula';
  if (s.includes('endometr') || s.includes('piometra') || s.includes('infecc')) return 'endometritis_piometra';
  return 'normal_tonico';
}

function mapCervixValue(raw: any): PalpationBatchItemRecord['cervixStatus'] {
  const s = String(raw || '').toLowerCase().trim();
  if (s.includes('moco') || s.includes('limpid')) return 'moco_limpido';
  if (s.includes('abiert') || s.includes('turbi')) return 'abierto_turbio';
  return 'cerrado_normal';
}

function transformRowToPalpation(rowObj: Record<string, any>): PalpationBatchItemRecord | null {
  const normObj: Record<string, any> = {};
  Object.keys(rowObj).forEach((k) => {
    const nk = normalizePalpationHeaders(k);
    normObj[nk] = rowObj[k];
  });

  const rawTag = normObj['tag'];
  if (!rawTag) return null;

  const tagFormatted = String(rawTag).trim().startsWith('#')
    ? String(rawTag).trim()
    : `#${String(rawTag).trim()}`;

  const result = mapResultValue(normObj['result']);
  const gestationDays = normObj['gestationDays'] ? String(normObj['gestationDays']).trim() : result === 'preñada' ? '45' : undefined;

  return {
    tag: tagFormatted,
    color: normObj['color'] ? String(normObj['color']).trim() : undefined,
    breed: normObj['breed'] ? String(normObj['breed']).trim() : undefined,
    weightKg: normObj['weightKg'] ? parseFloat(normObj['weightKg']) : undefined,
    result,
    gestationDays,
    leftOvaryStatus: mapOvaryValue(normObj['leftOvaryStatus'], 'cl_activo'),
    rightOvaryStatus: mapOvaryValue(normObj['rightOvaryStatus'], 'foliculo_dominante'),
    uterineStatus: mapUterineValue(normObj['uterineStatus']),
    cervixStatus: mapCervixValue(normObj['cervixStatus']),
    ovaryMeasurementsNotes: normObj['ovaryMeasurementsNotes'] ? String(normObj['ovaryMeasurementsNotes']).trim() : undefined,
    sireOrStraw: normObj['sireOrStraw'] ? String(normObj['sireOrStraw']).trim() : undefined,
    protocol: normObj['protocol'] ? String(normObj['protocol']).trim() : undefined,
    notes: normObj['notes'] ? String(normObj['notes']).trim() : undefined,
  };
}

export async function parsePalpationExcelOrCsvFile(file: File): Promise<PalpationBatchItemRecord[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('El archivo no contiene hojas válidas.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('El archivo está vacío o no contiene registros.');
  }

  const results: PalpationBatchItemRecord[] = [];
  for (const row of rawRows) {
    const item = transformRowToPalpation(row);
    if (item) results.push(item);
  }
  return results;
}

export function parsePalpationPastedText(pastedText: string): PalpationBatchItemRecord[] {
  const lines = pastedText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  let delimiter = '\t';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';')) delimiter = ';';
  else if (firstLine.includes(',')) delimiter = ',';

  const headerCells = lines[0].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
  const hasHeaders = headerCells.some((c) => {
    const norm = normalizePalpationHeaders(c);
    return ['tag', 'result', 'gestationDays'].includes(norm);
  });

  const records: PalpationBatchItemRecord[] = [];
  const startIdx = hasHeaders ? 1 : 0;
  const headers = hasHeaders ? headerCells : ['tag', 'result', 'gestationDays', 'leftOvaryStatus', 'rightOvaryStatus', 'uterineStatus', 'cervixStatus', 'ovaryMeasurementsNotes', 'sireOrStraw', 'protocol', 'notes'];

  for (let i = startIdx; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue;

    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cells[idx] !== undefined ? cells[idx] : '';
    });

    const parsed = transformRowToPalpation(rowObj);
    if (parsed) records.push(parsed);
  }

  return records;
}

export function downloadPalpationExcelTemplate(): void {
  const headers = [
    'Arete_Tag',
    'Resultado_Diagnostico',
    'Dias_Gestacion',
    'Ovario_Izquierdo',
    'Ovario_Derecho',
    'Estado_Utero',
    'Estado_Cervix',
    'Medidas_Ecografia',
    'Pajilla_Semen_Toro',
    'Protocolo_IATF',
    'Notas_Observaciones',
  ];

  const sampleRows = [
    ['#402', 'Preñada', 45, 'CL Activo', 'Folículo Dominante', 'Normal Tónico', 'Cerrado Normal', 'OI: CL 18mm | OD: Folículo 12mm', 'Pajilla Mr. V8 380/6', 'DIB 0.5g + BE + PGF2α', 'Excelente estado general'],
    ['#102', 'Preñada', 60, 'CL Activo', 'Anestro Inactivo', 'Gestante Vesícula', 'Cerrado Normal', 'Gestación confirmada 60 días', 'Toro Brahman Repro #1', 'Monta Natural Directa', 'Condición corporal 3.5'],
    ['#304', 'Vacía Sincronización', 0, 'Folículo Dominante', 'Folículos Pequeños', 'Flácido Inerte', 'Moco Límpido', 'Iniciando celo aparente', 'Pajilla Mr. V8 380/6', 'Protocolo IATF 8 Días', 'Programada para IATF'],
    ['#501', 'Vacía Monta Natural', 0, 'Folículos Pequeños', 'Anestro Inactivo', 'Flácido Inerte', 'Cerrado Normal', 'Estructuras ováricas pequeñas', 'Toro Brahman Repro #2', 'Revisión Suplementación', 'Ofrecer sal mineralizada'],
    ['#208', 'Dudosa', 30, 'CL Activo', 'CL Activo', 'Normal Tónico', 'Cerrado Normal', 'Posible vesícula muy pequeña', 'Pajilla Mr. V8 380/6', 'Repetir Palpación 30 Días', 'Revisar en próxima jornada'],
  ];

  const data = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla_Palpacion_Lote');

  XLSX.writeFile(workbook, 'Plantilla_Palpacion_Lote_GanaderIA.xlsx');
}

