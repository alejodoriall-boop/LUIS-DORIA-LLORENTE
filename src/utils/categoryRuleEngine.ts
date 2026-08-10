import {
  ImportedAnimalRecord,
  CategoryProgressionRule,
  CategoryTransitionAlert,
} from '../types';

export const DEFAULT_CATEGORY_RULES: CategoryProgressionRule[] = [
  {
    id: 'rule-cria-levante',
    ruleName: 'Cría / Ternero ➔ Levante / Preceba',
    sourceCategory: 'cria',
    targetCategory: 'levante',
    targetCategoryLabel: 'Levante / Preceba',
    minWeightKg: 180,
    minAgeMonths: 8,
    sexFilter: 'todos',
    description: 'Pasa a Levante/Preceba al alcanzar 180 kg o cumplidos 8 meses de edad.',
    isActive: true,
  },
  {
    id: 'rule-preceba-ceba',
    ruleName: 'Novillo Preceba / Levante ➔ Ceba / Finalización',
    sourceCategory: 'levante',
    targetCategory: 'ceba',
    targetCategoryLabel: 'Ceba / Finalización',
    minWeightKg: 350,
    minAgeMonths: 24,
    sexFilter: 'macho',
    description: 'Novillo de preceba/levante pasa a ceba al alcanzar 350 kg por pesaje o 24 meses de edad.',
    isActive: true,
  },
  {
    id: 'rule-vaquilla-vientre',
    ruleName: 'Vaquilla Levante ➔ Novilla de Vientre',
    sourceCategory: 'levante',
    targetCategory: 'leche',
    targetCategoryLabel: 'Novilla de Vientre / Lechería',
    minWeightKg: 300,
    minAgeMonths: 20,
    sexFilter: 'hembra',
    description: 'Hembra de levante pasa a novilla de vientre al alcanzar 300 kg o 20 meses de edad.',
    isActive: true,
  },
  {
    id: 'rule-ceba-mercado',
    ruleName: 'Novillo Ceba ➔ Listo para Comercialización',
    sourceCategory: 'ceba',
    targetCategory: 'comercial',
    targetCategoryLabel: 'Listo para Mercado / Sacrificio',
    minWeightKg: 480,
    minAgeMonths: 34,
    sexFilter: 'macho',
    description: 'Novillo en ceba alcanza peso de gordura (480 kg) o 34 meses.',
    isActive: true,
  },
];

const LOCAL_STORAGE_RULES_KEY = 'ganaderia_category_rules_v1';
const LOCAL_STORAGE_ALERTS_KEY = 'ganaderia_category_alerts_v1';

export function getSavedCategoryRules(): CategoryProgressionRule[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RULES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading category rules from localStorage', e);
  }
  return DEFAULT_CATEGORY_RULES;
}

export function saveCategoryRules(rules: CategoryProgressionRule[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error('Error saving category rules to localStorage', e);
  }
}

export function getSavedTransitionAlerts(): CategoryTransitionAlert[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ALERTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading transition alerts from localStorage', e);
  }
  return [];
}

export function saveTransitionAlerts(alerts: CategoryTransitionAlert[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error('Error saving transition alerts to localStorage', e);
  }
}

/**
 * Scans animals and generates transition alerts for those meeting weight or age thresholds
 */
export function evaluateCategoryTransitions(
  animals: ImportedAnimalRecord[],
  rules: CategoryProgressionRule[] = getSavedCategoryRules(),
  existingAlerts: CategoryTransitionAlert[] = getSavedTransitionAlerts(),
): CategoryTransitionAlert[] {
  const activeRules = rules.filter((r) => r.isActive);
  const updatedAlerts = [...existingAlerts];

  const todayStr = new Date().toISOString().split('T')[0];

  animals.forEach((animal) => {
    if (animal.status && animal.status !== 'activo') return;

    const currentCatNormalized = (animal.category || 'cria').toLowerCase();

    // Find rules that apply to this animal's category & sex
    const matchingRules = activeRules.filter((r) => {
      const catMatches =
        r.sourceCategory === currentCatNormalized ||
        (r.sourceCategory === 'levante' && (currentCatNormalized === 'levante' || currentCatNormalized === 'preceba')) ||
        (r.sourceCategory === 'cria' && (currentCatNormalized === 'cria' || currentCatNormalized === 'ternero'));
      
      const sexMatches = !r.sexFilter || r.sexFilter === 'todos' || r.sexFilter === animal.sex;
      return catMatches && sexMatches;
    });

    matchingRules.forEach((rule) => {
      const weightMet = animal.weightKg >= rule.minWeightKg;
      const ageMet = (animal.ageMonths || 0) >= rule.minAgeMonths;

      if (weightMet || ageMet) {
        // Check if an alert already exists for this animal & target category
        const alreadyExists = updatedAlerts.some(
          (a) => a.animalId === animal.id && a.targetCategory === rule.targetCategory && a.status === 'pending',
        );

        if (!alreadyExists) {
          let triggerType: 'peso' | 'edad' | 'ambos' = 'peso';
          let triggerReason = '';

          if (weightMet && ageMet) {
            triggerType = 'ambos';
            triggerReason = `⚡ Ambos criterios cumplidos: Peso ${animal.weightKg} kg (≥ ${rule.minWeightKg} kg) Y Edad ${animal.ageMonths || 0} meses (≥ ${rule.minAgeMonths}m).`;
          } else if (weightMet) {
            triggerType = 'peso';
            triggerReason = `⚖️ Peso alcanzado: ${animal.weightKg} kg por pesaje (Límite regla: ≥ ${rule.minWeightKg} kg).`;
          } else {
            triggerType = 'edad';
            triggerReason = `🎂 Edad alcanzada: ${animal.ageMonths || 0} meses (Límite regla: ≥ ${rule.minAgeMonths} meses).`;
          }

          const newAlert: CategoryTransitionAlert = {
            id: `alert-${animal.id}-${rule.targetCategory}-${Date.now()}`,
            animalId: animal.id,
            animalTag: animal.tag,
            animalName: animal.name,
            sex: animal.sex,
            breed: animal.breed,
            currentCategory: animal.category || 'cria',
            targetCategory: rule.targetCategory,
            targetCategoryLabel: rule.targetCategoryLabel,
            triggerType,
            triggerReason,
            currentWeightKg: animal.weightKg,
            currentAgeMonths: animal.ageMonths || 0,
            ruleMinWeightKg: rule.minWeightKg,
            ruleMinAgeMonths: rule.minAgeMonths,
            detectedDate: todayStr,
            status: 'pending',
            farmId: animal.farmId,
            farmName: animal.farmName,
            lotId: animal.lotId,
            lotCode: animal.lotCode,
          };

          updatedAlerts.unshift(newAlert);
        }
      }
    });
  });

  saveTransitionAlerts(updatedAlerts);
  return updatedAlerts;
}
