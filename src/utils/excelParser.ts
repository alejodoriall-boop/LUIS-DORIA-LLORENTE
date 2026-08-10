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
  if (h.includes('sex') || h.includes('genero') || h.includes('macho') || h.includes('hembra') || h.includes('m_h')) {
    return 'sex';
  }
  if (h.includes('raza') || h.includes('cruce') || h.includes('fenotipo') || h.includes('breed')) {
    return 'breed';
  }
  if (h.includes('precio') || h.includes('valor') || h.includes('costo') || h.includes('price')) {
    return 'pricePerKg';
  }
  if (h.includes('lote') || h.includes('subasta_lote') || h.includes('corral')) {
    return 'lotCode';
  }
  if (h.includes('edad') || h.includes('meses') || h.includes('age') || h.includes('mes')) {
    return 'ageMonths';
  }
  if (h.includes('color') || h.includes('capa')) {
    return 'color';
  }
  if (h.includes('origen') || h.includes('procedencia') || h.includes('vendedor') || h.includes('finca_origen')) {
    return 'origin';
  }
  if (h.includes('obs') || h.includes('nota') || h.includes('detalle') || h.includes('comentario') || h.includes('hierro')) {
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

  // Extract sex
  const rawSex = String(normalizedRow['sex'] || '').toLowerCase();
  let sex: 'macho' | 'hembra' = 'macho';
  if (rawSex.includes('h') || rawSex.includes('hembra') || rawSex.includes('f') || rawSex.includes('vaca') || rawSex.includes('novilla')) {
    sex = 'hembra';
  }

  // Extract breed
  const breed = String(normalizedRow['breed'] || normalizedRow['raza'] || 'Brahman Comercial / Cebú').trim();

  // Price
  let pricePerKg = parseFloat(String(normalizedRow['pricePerKg'] || '8500').replace(/[^0-9.]/g, ''));
  if (isNaN(pricePerKg) || pricePerKg <= 0) pricePerKg = 8500;

  const totalPrice = Math.round(weight * pricePerKg);

  // Age in months
  let ageMonths = parseInt(String(normalizedRow['ageMonths'] || ''), 10);
  if (isNaN(ageMonths) || ageMonths <= 0) {
    ageMonths = weight < 220 ? 8 : weight < 340 ? 18 : 26;
  }

  const lotCode = String(normalizedRow['lotCode'] || `LOTE-${Math.floor(10 + Math.random() * 90)}`).trim();
  const color = String(normalizedRow['color'] || 'Blanco / Gris').trim();
  const origin = String(normalizedRow['origin'] || 'Subasta Comercial').trim();
  const notes = String(normalizedRow['notes'] || 'Ingreso por compra en subasta').trim();

  return {
    id: `anim-imp-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    tag,
    weightKg: Number(weight.toFixed(1)),
    sex,
    breed,
    pricePerKg,
    totalPrice,
    lotCode,
    ageMonths,
    color,
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
    // 25 Novillos de Ceba Cebú / Brahman Comercial
    const baseTags = [
      'SUB-8012', 'SUB-8013', 'SUB-8014', 'SUB-8015', 'SUB-8016',
      'SUB-8017', 'SUB-8018', 'SUB-8019', 'SUB-8020', 'SUB-8021',
      'SUB-8022', 'SUB-8023', 'SUB-8024', 'SUB-8025', 'SUB-8026',
      'SUB-8027', 'SUB-8028', 'SUB-8029', 'SUB-8030', 'SUB-8031',
      'SUB-8032', 'SUB-8033', 'SUB-8034', 'SUB-8035', 'SUB-8036',
    ];
    const breeds = ['Brahman Blanco', 'Cebú Comercial', 'Nelore x Brahman', 'Guzerá Cruce', 'Brangus Comercial'];

    return baseTags.map((tag, idx) => {
      const weight = 360 + (idx * 3.5) % 45 + Math.floor(Math.random() * 12);
      const pricePerKg = 8750;
      return {
        id: `anim-sample-${idx + 1}`,
        tag: `#${tag}`,
        weightKg: Number(weight.toFixed(1)),
        sex: 'macho' as const,
        breed: breeds[idx % breeds.length],
        pricePerKg,
        totalPrice: Math.round(weight * pricePerKg),
        lotCode: 'CORRAL-08',
        ageMonths: 22 + (idx % 4),
        color: idx % 3 === 0 ? 'Blanco Cebú' : idx % 3 === 1 ? 'Gris Acebrado' : 'Rojizo',
        origin: 'Subastar S.A. - Sede Planeta Rica',
        notes: 'Excelente conformación carnicera, aplomos correctos y buena masa muscular.',
      };
    });
  }

  if (sampleType === 'subacasanare_cria') {
    // 18 Terneros de Cría y Levante
    const baseTags = [
      'CAS-4101', 'CAS-4102', 'CAS-4103', 'CAS-4104', 'CAS-4105', 'CAS-4106',
      'CAS-4107', 'CAS-4108', 'CAS-4109', 'CAS-4110', 'CAS-4111', 'CAS-4112',
      'CAS-4113', 'CAS-4114', 'CAS-4115', 'CAS-4116', 'CAS-4117', 'CAS-4118',
    ];
    const breeds = ['Braford F1', 'Sanmartinero x Cebú', 'Brahman Rojo', 'Blanco Orejinegro (BON) x Cebú'];

    return baseTags.map((tag, idx) => {
      const weight = 195 + (idx * 4.2) % 35 + Math.floor(Math.random() * 8);
      const pricePerKg = 9200;
      return {
        id: `anim-sample-cria-${idx + 1}`,
        tag: `#${tag}`,
        weightKg: Number(weight.toFixed(1)),
        sex: idx % 4 === 0 ? 'hembra' : 'macho',
        breed: breeds[idx % breeds.length],
        pricePerKg,
        totalPrice: Math.round(weight * pricePerKg),
        lotCode: 'LOTE-CRIA-04',
        ageMonths: 9 + (idx % 3),
        color: idx % 2 === 0 ? 'Colorado' : 'Hosco',
        origin: 'Subacasanare - Subasta de Levante Yopal',
        notes: 'Terneros destetados sanos, desparasitados y con vacuna de carbón.',
      };
    });
  }

  // Feria Leche y Doble Propósito
  const baseTags = [
    'LECH-301', 'LECH-302', 'LECH-303', 'LECH-304', 'LECH-305',
    'LECH-306', 'LECH-307', 'LECH-308', 'LECH-309', 'LECH-310',
  ];
  return baseTags.map((tag, idx) => {
    const weight = 440 + (idx * 6) % 40;
    const pricePerKg = 8100;
    return {
      id: `anim-sample-lech-${idx + 1}`,
      tag: `#${tag}`,
      weightKg: Number(weight.toFixed(1)),
      sex: 'hembra' as const,
      breed: idx % 2 === 0 ? 'Girolando F1 (Gyr x Holstein)' : 'Guzolando',
      pricePerKg,
      totalPrice: Math.round(weight * pricePerKg),
      lotCode: 'CORRAL-LECHE-02',
      ageMonths: 32,
      color: 'Overo Negro / Barroso',
      origin: 'Feria Ganadera y Lechera',
      notes: 'Novillas de primer parto preñadas garantizadas.',
    };
  });
}

/**
 * Downloads a sample template Excel (.xlsx) file that users can fill in
 */
export function downloadExcelTemplate(): void {
  const headers = [
    'Arete_ID',
    'Peso_Kg',
    'Sexo_M_H',
    'Raza_Fenotipo',
    'Precio_Kg_COP',
    'Edad_Meses',
    'Lote_Subasta',
    'Observaciones',
  ];

  const sampleRows = [
    ['#SUB-9001', 375.5, 'Macho', 'Brahman Blanco', 8800, 22, 'CORRAL-01', 'Novillo Ceba'],
    ['#SUB-9002', 362.0, 'Macho', 'Nelore Comercial', 8800, 20, 'CORRAL-01', 'Novillo Ceba'],
    ['#SUB-9003', 389.0, 'Macho', 'Cebú Comercial', 8800, 24, 'CORRAL-01', 'Novillo Ceba'],
    ['#SUB-9004', 345.5, 'Hembra', 'Braford F1', 8900, 18, 'CORRAL-02', 'Novilla de Levante'],
    ['#SUB-9005', 358.0, 'Macho', 'Guzerá Cruce', 8800, 21, 'CORRAL-01', 'Novillo Ceba'],
  ];

  const data = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla_Ingreso_Subasta');

  // Trigger browser download
  XLSX.writeFile(workbook, 'Plantilla_Ingreso_Animales_Subasta.xlsx');
}
