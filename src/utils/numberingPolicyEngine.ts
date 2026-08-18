import { FarmNumberingPolicy, NumberingPolicyType, YearPositionType } from '../types/numberingPolicy';

export interface GenerateIdOptions {
  eventDate?: Date | string;
  gender?: 'macho' | 'hembra' | string;
  consecutiveOverride?: number;
}

const STORAGE_KEY_PREFIX = 'campana_ganadora_numbering_policy_';
const SEQUENCE_KEY_PREFIX = 'campana_ganadora_consecutive_seq_';

/**
 * Construye el patrón Regex dinámico para el esquema personalizado.
 */
export function buildCustomRegexPattern(policy: FarmNumberingPolicy): string {
  const escapeRegex = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const sep = policy.useSeparator && policy.separatorChar ? escapeRegex(policy.separatorChar) : '';
  const prefixPart = policy.customPrefix ? `${escapeRegex(policy.customPrefix)}` : '';
  
  let yearPart = '';
  if (policy.yearPosition && policy.yearPosition !== 'NONE') {
    yearPart = `\\d{${policy.yearDigitsLength || 2}}`;
  }

  let consecutivePart = '';
  if (policy.isConsecutiveFixedLength) {
    consecutivePart = `\\d{${policy.consecutiveDigitsLength || 3}}`;
  } else {
    consecutivePart = `\\d{1,${policy.consecutiveDigitsLength || 4}}`;
  }

  const suffixPart = policy.customSuffix ? `${escapeRegex(policy.customSuffix)}` : '';

  let pattern = '^';
  if (prefixPart) pattern += prefixPart;

  if (policy.yearPosition === 'PREFIX') {
    pattern += yearPart;
    if (sep) pattern += sep;
    pattern += consecutivePart;
  } else if (policy.yearPosition === 'SUFFIX') {
    pattern += consecutivePart;
    if (sep) pattern += sep;
    pattern += yearPart;
  } else {
    pattern += consecutivePart;
  }

  if (suffixPart) pattern += suffixPart;
  pattern += '$';

  return pattern;
}

/**
 * Valida un código contra el patrón de la política activa.
 */
export function validateAnimalTagAgainstPolicy(tag: string, policy: FarmNumberingPolicy): { isValid: boolean; error?: string } {
  if (!tag || !tag.trim()) {
    return { isValid: false, error: 'El código de identificación no puede estar vacío.' };
  }

  const clean = tag.trim();

  if (policy.policyType === 'CUSTOM_LEGACY_ADOPTION') {
    const patternStr = policy.generatedRegexPattern || buildCustomRegexPattern(policy);
    try {
      const regex = new RegExp(patternStr);
      const ok = regex.test(clean);
      if (!ok) {
        return {
          isValid: false,
          error: `El código "${clean}" no cumple con el formato personalizado configurado (${patternStr}).`,
        };
      }
      return { isValid: true };
    } catch (e) {
      return { isValid: true };
    }
  }

  // Validaciones básicas para los otros 3 tipos
  const sep = policy.useSeparator ? (policy.separatorChar || '-') : '';
  if (policy.policyType === 'CHRONOLOGICAL_YEAR_CONSECUTIVE') {
    // ej. "6-015" o "6015"
    const escapedSep = sep ? `\\${sep}` : '';
    const regex = new RegExp(`^\\d${escapedSep}\\d{${policy.consecutiveDigitsLength}}$`);
    if (!regex.test(clean)) {
      return {
        isValid: false,
        error: `El código debe tener formato de Año + Consecutivo (ej. 6${sep}${'0'.repeat(policy.consecutiveDigitsLength - 1)}1).`,
      };
    }
  } else if (policy.policyType === 'SEASONAL_TRIMESTER_YEAR') {
    // ej. "015-36" o "01536"
    const escapedSep = sep ? `\\${sep}` : '';
    const regex = new RegExp(`^\\d{${policy.consecutiveDigitsLength}}${escapedSep}[1-4]\\d$`);
    if (!regex.test(clean)) {
      return {
        isValid: false,
        error: `El código debe tener formato de Consecutivo + Trimestre + Año (ej. ${'0'.repeat(policy.consecutiveDigitsLength - 1)}1${sep}36).`,
      };
    }
  } else if (policy.policyType === 'GENDER_CATEGORIZED_YEAR') {
    // ej. "6M-015" o "6H-015"
    const male = policy.malePrefix || 'M';
    const female = policy.femalePrefix || 'H';
    const escapedSep = sep ? `\\${sep}` : '';
    const regex = new RegExp(`^\\d[${male}${female}]${escapedSep}\\d{${policy.consecutiveDigitsLength}}$`);
    if (!regex.test(clean)) {
      return {
        isValid: false,
        error: `El código debe tener formato de Año + Sexo (${male}/${female}) + Consecutivo (ej. 6${female}${sep}${'0'.repeat(policy.consecutiveDigitsLength - 1)}1).`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Genera el siguiente código sugerido/automático para un nuevo animal.
 */
export function generateNextAnimalTag(
  policy: FarmNumberingPolicy,
  options: GenerateIdOptions = {}
): string {
  const d = options.eventDate ? new Date(options.eventDate) : new Date();
  const year = d.getFullYear();
  const lastYearDigit = year.toString().slice(-1); // "6"
  const twoDigitYear = year.toString().slice(-2);  // "26"
  const fourDigitYear = year.toString();          // "2026"
  const trimester = Math.ceil((d.getMonth() + 1) / 3); // 1, 2, 3 o 4
  const sep = policy.useSeparator ? (policy.separatorChar ?? '-') : '';

  // Determinar consecutivo
  let consec = options.consecutiveOverride;
  if (consec === undefined) {
    consec = getNextConsecutiveNumber(policy.farmId, policy.policyType, year, trimester, options.gender);
  }

  const paddedConsec = policy.isConsecutiveFixedLength ?? true
    ? consec.toString().padStart(policy.consecutiveDigitsLength, '0')
    : consec.toString();

  switch (policy.policyType) {
    case 'CHRONOLOGICAL_YEAR_CONSECUTIVE':
      return `${lastYearDigit}${sep}${paddedConsec}`;

    case 'SEASONAL_TRIMESTER_YEAR':
      return `${paddedConsec}${sep}${trimester}${lastYearDigit}`;

    case 'GENDER_CATEGORIZED_YEAR': {
      const isM = (options.gender || 'hembra').toLowerCase().includes('macho') || (options.gender || '').toLowerCase() === 'm';
      const pfx = isM ? (policy.malePrefix || 'M') : (policy.femalePrefix || 'H');
      return `${lastYearDigit}${pfx}${sep}${paddedConsec}`;
    }

    case 'CUSTOM_LEGACY_ADOPTION': {
      const pfx = policy.customPrefix || '';
      const sfx = policy.customSuffix || '';
      const yearLen = policy.yearDigitsLength || 2;
      const yStr = yearLen === 1 ? lastYearDigit : yearLen === 2 ? twoDigitYear : fourDigitYear;

      if (policy.yearPosition === 'PREFIX') {
        return `${pfx}${yStr}${sep}${paddedConsec}${sfx}`;
      } else if (policy.yearPosition === 'SUFFIX') {
        return `${pfx}${paddedConsec}${sep}${yStr}${sfx}`;
      } else {
        return `${pfx}${paddedConsec}${sfx}`;
      }
    }

    default:
      return `${lastYearDigit}${sep}${paddedConsec}`;
  }
}

/**
 * Obtiene y gestiona la secuencia de consecutivos localmente.
 */
export function getNextConsecutiveNumber(
  farmId: string,
  policyType: NumberingPolicyType,
  year: number,
  trimester: number,
  gender?: string
): number {
  const policy = getSavedFarmNumberingPolicy(farmId);
  const baseOffset = policy.initialConsecutiveOffset || 0;
  
  const key = `${SEQUENCE_KEY_PREFIX}${farmId}_${policyType}_${year}`;
  const stored = localStorage.getItem(key);
  let current = stored ? parseInt(stored, 10) : (baseOffset > 0 ? baseOffset : 1);
  return current;
}

export function incrementConsecutiveNumber(
  farmId: string,
  policyType: NumberingPolicyType,
  year: number
): number {
  const key = `${SEQUENCE_KEY_PREFIX}${farmId}_${policyType}_${year}`;
  const stored = localStorage.getItem(key);
  const current = stored ? parseInt(stored, 10) : 1;
  const next = current + 1;
  localStorage.setItem(key, next.toString());
  return next;
}

/**
 * Recupera la política guardada para una finca.
 */
export function getSavedFarmNumberingPolicy(farmId: string = 'all'): FarmNumberingPolicy {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${farmId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading numbering policy from storage', e);
  }

  // Configuración por defecto
  return {
    farmId,
    policyType: 'CHRONOLOGICAL_YEAR_CONSECUTIVE',
    consecutiveDigitsLength: 3,
    useSeparator: true,
    separatorChar: '-',
    malePrefix: 'M',
    femalePrefix: 'H',
    customPrefix: 'TE-',
    customSuffix: '',
    yearPosition: 'PREFIX',
    yearDigitsLength: 2,
    isConsecutiveFixedLength: true,
    initialConsecutiveOffset: 0,
    generatedRegexPattern: '^TE-\\d{2}-\\d{3}$',
    isLocked: false,
    registeredAnimalsCount: 0,
  };
}

/**
 * Guarda y bloquea la política en el predio.
 */
export function saveFarmNumberingPolicy(policy: FarmNumberingPolicy): FarmNumberingPolicy {
  const toSave = {
    ...policy,
    generatedRegexPattern: policy.policyType === 'CUSTOM_LEGACY_ADOPTION'
      ? buildCustomRegexPattern(policy)
      : undefined,
  };

  localStorage.setItem(`${STORAGE_KEY_PREFIX}${policy.farmId}`, JSON.stringify(toSave));
  // También guardar para clave 'all' para sincronización
  if (policy.farmId !== 'all') {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}all`, JSON.stringify(toSave));
  }
  return toSave;
}
