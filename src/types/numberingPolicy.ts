export type NumberingPolicyType =
  | 'CHRONOLOGICAL_YEAR_CONSECUTIVE' // Tipo 1: Año + Consecutivo (ej. 6-015)
  | 'SEASONAL_TRIMESTER_YEAR'        // Tipo 2: Consecutivo + Trimestre + Año (ej. 015-36)
  | 'GENDER_CATEGORIZED_YEAR'        // Tipo 3: Año + Sexo + Consecutivo (ej. 6M-015 / 6H-015)
  | 'CUSTOM_LEGACY_ADOPTION';        // Tipo 4: Adopción de Sistema Existente / Personalizado Previo

export type YearPositionType = 'NONE' | 'PREFIX' | 'SUFFIX';

export interface FarmNumberingPolicy {
  farmId: string;
  policyType: NumberingPolicyType;
  consecutiveDigitsLength: number; // 3, 4, 5
  useSeparator: boolean;
  separatorChar: '-' | '/' | '.' | '';
  
  // Opciones para Tipo 3 (Género)
  malePrefix?: string; // ej. 'M'
  femalePrefix?: string; // ej. 'H'
  
  // Opciones para Tipo 4 (Personalizado / Existente)
  customPrefix?: string; // ej. 'TE-', 'H-', 'LOTE-'
  customSuffix?: string; // ej. '-A', '-CEBA'
  yearPosition?: YearPositionType;
  yearDigitsLength?: 1 | 2 | 4;
  isConsecutiveFixedLength?: boolean;
  generatedRegexPattern?: string;
  initialConsecutiveOffset?: number; // Punto de corte / último consecutivo utilizado
  
  // Candado de Bloqueo Inmutable
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  registeredAnimalsCount?: number;
  sampleGeneratedCode?: string;
}

export const DEFAULT_NUMBERING_POLICY: FarmNumberingPolicy = {
  farmId: 'all',
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
  initialConsecutiveOffset: 1250,
  generatedRegexPattern: '^TE-\\d{2}-\\d{3,4}$',
  isLocked: false,
  registeredAnimalsCount: 0,
};
