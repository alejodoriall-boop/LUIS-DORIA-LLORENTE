import { FeedIngredient, SupplementPlan, SupplementDispatchLog } from '../types';

export const INITIAL_INGREDIENTS: FeedIngredient[] = [
  {
    id: 'ing_maiz_molido',
    name: 'Maíz Amarillo Molido',
    category: 'energetico',
    dryMatterPercent: 88,
    crudeProteinPercent: 8.5,
    tdnPercent: 88,
    netEnergyMcalKg: 2.1,
    costPerKgUSD: 0.38,
    unit: 'kg',
    notes: 'Fuente principal de almidón de alta digestibilidad ruminal.'
  },
  {
    id: 'ing_torta_soya',
    name: 'Torta / Harina de Soya (44% PC)',
    category: 'proteico',
    dryMatterPercent: 89,
    crudeProteinPercent: 44.0,
    tdnPercent: 82,
    netEnergyMcalKg: 1.95,
    costPerKgUSD: 0.62,
    unit: 'kg',
    notes: 'Proteína de excelente perfil de aminoácidos para crecimiento óseo-muscular.'
  },
  {
    id: 'ing_palmiste',
    name: 'Torta de Palmiste',
    category: 'energetico',
    dryMatterPercent: 91,
    crudeProteinPercent: 15.5,
    tdnPercent: 68,
    netEnergyMcalKg: 1.5,
    costPerKgUSD: 0.22,
    unit: 'kg',
    notes: 'Excelente subproducto proteico-energético con fibra de mediana fermentación.'
  },
  {
    id: 'ing_afrecho_trigo',
    name: 'Afrecho / Salvado de Trigo',
    category: 'energetico',
    dryMatterPercent: 88,
    crudeProteinPercent: 15.0,
    tdnPercent: 70,
    netEnergyMcalKg: 1.55,
    costPerKgUSD: 0.26,
    unit: 'kg',
    notes: 'Palatable, aporta fósforo y fibra de rápida fermentación.'
  },
  {
    id: 'ing_sal_mineral_8',
    name: 'Sal Mineralizada 8% Fósforo',
    category: 'mineral',
    dryMatterPercent: 98,
    crudeProteinPercent: 0,
    tdnPercent: 0,
    netEnergyMcalKg: 0,
    costPerKgUSD: 0.75,
    unit: 'kg',
    notes: 'Macro y micro minerales para zonas con suelos de media fertilidad.'
  },
  {
    id: 'ing_sal_proteada_40',
    name: 'Sal Proteica 40% PC',
    category: 'proteico',
    dryMatterPercent: 95,
    crudeProteinPercent: 40.0,
    tdnPercent: 45,
    netEnergyMcalKg: 1.1,
    costPerKgUSD: 0.58,
    unit: 'kg',
    notes: 'Mezcla lista con úrea protegida y minerales para épocas secas.'
  },
  {
    id: 'ing_urea_pecuaria',
    name: 'Úrea Pecuaria (46% N / 281% PC equivalente)',
    category: 'proteico',
    dryMatterPercent: 99,
    crudeProteinPercent: 281.0,
    tdnPercent: 0,
    netEnergyMcalKg: 0,
    costPerKgUSD: 0.70,
    unit: 'kg',
    notes: 'Nitrógeno No Proteico (NNP) para síntesis de proteína microbiana ruminal.'
  },
  {
    id: 'ing_melaza',
    name: 'Melaza de Caña de Azúcar',
    category: 'energetico',
    dryMatterPercent: 75,
    crudeProteinPercent: 3.5,
    tdnPercent: 72,
    netEnergyMcalKg: 1.6,
    costPerKgUSD: 0.18,
    unit: 'kg',
    notes: 'Carbohidrato soluble de rápida asimilación y estimulante del consumo.'
  },
  {
    id: 'ing_bicarbonato',
    name: 'Bicarbonato de Sodio (Tampón)',
    category: 'aditivo',
    dryMatterPercent: 99,
    crudeProteinPercent: 0,
    tdnPercent: 0,
    netEnergyMcalKg: 0,
    costPerKgUSD: 0.45,
    unit: 'kg',
    notes: 'Amortiguador de pH ruminal para prevenir acidosis en dietas de ceba.'
  },
  {
    id: 'ing_monensina',
    name: 'Premix Ionóforo (Monensina Sódica)',
    category: 'aditivo',
    dryMatterPercent: 95,
    crudeProteinPercent: 0,
    tdnPercent: 0,
    netEnergyMcalKg: 0,
    costPerKgUSD: 3.20,
    unit: 'kg',
    notes: 'Modificador de fermentación ruminal: incrementa producción de ácido propiónico.'
  },
  {
    id: 'ing_sustituto_lacteo',
    name: 'Sustituto Lácteo Premium 22% PC / 20% Grasa',
    category: 'lacteo',
    dryMatterPercent: 96,
    crudeProteinPercent: 22.0,
    tdnPercent: 95,
    netEnergyMcalKg: 2.8,
    costPerKgUSD: 2.45,
    unit: 'kg',
    notes: 'Fórmula láctea atomizada solubilizable para crianza artificial de terneros.'
  },
  {
    id: 'ing_starter_terneros',
    name: 'Concentrado Iniciador / Starter Terneros 20% PC',
    category: 'proteico',
    dryMatterPercent: 90,
    crudeProteinPercent: 20.0,
    tdnPercent: 82,
    netEnergyMcalKg: 2.0,
    costPerKgUSD: 0.52,
    unit: 'kg',
    notes: 'Pellet o migaja palatable con carbohidratos fermentables para papilas ruminales.'
  },
  {
    id: 'ing_ensilaje_maiz',
    name: 'Ensilaje de Maíz de Planta Entera',
    category: 'fibra_forraje',
    dryMatterPercent: 33,
    crudeProteinPercent: 7.8,
    tdnPercent: 68,
    netEnergyMcalKg: 1.45,
    costPerKgUSD: 0.08,
    unit: 'kg',
    notes: 'Forraje conservado de alta energía por grano y fibra de buena digestibilidad.'
  }
];

export const INITIAL_SUPPLEMENT_PLANS: SupplementPlan[] = [
  // 1. CRÍA
  {
    id: 'plan_cria_creep_feeding',
    name: 'Plan 1: Creep Feeding Terneros al Pie (Iniciador 18% PC)',
    stage: 'cria',
    stageLabel: 'Cría Bovina',
    description: 'Suplementación diferencial exclusiva en comedero paso-ternero. Estimula el desarrollo precocísimo del rumen y aumenta el peso al destete en 25-35 kg adicionales.',
    seasonSuitability: 'todo_el_ano',
    targetWeightMinKg: 60,
    targetWeightMaxKg: 180,
    targetGDPGrams: 850,
    inclusionPercentBW: 0.75,
    recommendedDoseKgPerHead: 0.90,
    crudeProteinPercent: 18.5,
    energyMcalKg: 1.95,
    costPerKgUSD: 0.44,
    costPerHeadDayUSD: 0.40,
    feedingFrequency: 'Libre acceso en paso-ternero (Creep Feeder)',
    recommendations: [
      'Ubicación del paso-ternero cerca de la fuente de agua y sombra de las madres.',
      'Sombra limpia y comederos protegidos de la lluvia.',
      'Asegurar consumo gradual comenzando desde los 20-30 días de nacido.'
    ],
    formula: [
      { ingredientId: 'ing_maiz_molido', ingredientName: 'Maíz Amarillo Molido', percentageInclusion: 55, kgPerTon: 550, costContributionUSD: 0.209 },
      { ingredientId: 'ing_torta_soya', ingredientName: 'Torta / Harina de Soya (44% PC)', percentageInclusion: 22, kgPerTon: 220, costContributionUSD: 0.136 },
      { ingredientId: 'ing_afrecho_trigo', ingredientName: 'Afrecho / Salvado de Trigo', percentageInclusion: 15, kgPerTon: 150, costContributionUSD: 0.039 },
      { ingredientId: 'ing_melaza', ingredientName: 'Melaza de Caña', percentageInclusion: 5, kgPerTon: 50, costContributionUSD: 0.009 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineralizada 8%', percentageInclusion: 3, kgPerTon: 30, costContributionUSD: 0.022 }
    ]
  },
  {
    id: 'plan_cria_vacas_seca',
    name: 'Plan 2: Suplementación Proteica Vacas Lactantes / Época Seca',
    stage: 'cria',
    stageLabel: 'Cría Bovina',
    description: 'Bloque multinutricional o sal proteada al 30% PC para mantener la condición corporal de vacas en amamantamiento durante veranos críticos y evitar anestro post-parto.',
    seasonSuitability: 'epoca_seca',
    targetWeightMinKg: 380,
    targetWeightMaxKg: 500,
    targetGDPGrams: 200,
    inclusionPercentBW: 0.12,
    recommendedDoseKgPerHead: 0.50,
    crudeProteinPercent: 30.0,
    energyMcalKg: 1.35,
    costPerKgUSD: 0.48,
    costPerHeadDayUSD: 0.24,
    feedingFrequency: 'Suministro diario en saladero cubierto',
    recommendations: [
      'Distribución uniforme de 1 m de saladero por cada 15 vacas.',
      'Verificar consumo constante entre 400 g y 600 g por vaca al día.',
      'Evitar que la sal se encharque con agua de lluvia.'
    ],
    formula: [
      { ingredientId: 'ing_sal_proteada_40', ingredientName: 'Sal Proteica 40% PC', percentageInclusion: 60, kgPerTon: 600, costContributionUSD: 0.348 },
      { ingredientId: 'ing_palmiste', ingredientName: 'Torta de Palmiste', percentageInclusion: 25, kgPerTon: 250, costContributionUSD: 0.055 },
      { ingredientId: 'ing_melaza', ingredientName: 'Melaza de Caña', percentageInclusion: 10, kgPerTon: 100, costContributionUSD: 0.018 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineralizada 8%', percentageInclusion: 5, kgPerTon: 50, costContributionUSD: 0.037 }
    ]
  },

  // 2. LEVANTE
  {
    id: 'plan_levante_sal_proteica',
    name: 'Plan 3: Levante a Pasto con Sal Proteica 40% PC (0.15% PV)',
    stage: 'levante',
    stageLabel: 'Levante / Desmante',
    description: 'Suplementación de bajo volumen para potenciar la digestión de la fibra del pasto en novillos recién destetados (140 - 250 kg). Eficiencia económica superior.',
    seasonSuitability: 'todo_el_ano',
    targetWeightMinKg: 140,
    targetWeightMaxKg: 260,
    targetGDPGrams: 650,
    inclusionPercentBW: 0.15,
    recommendedDoseKgPerHead: 0.30,
    crudeProteinPercent: 40.0,
    energyMcalKg: 1.20,
    costPerKgUSD: 0.54,
    costPerHeadDayUSD: 0.16,
    feedingFrequency: 'Acceso continuo en saladeros',
    recommendations: [
      'Garantizar siempre agua fresca y limpia a menos de 200 m del saladero.',
      'Monitorear consumo semanal para ajustar cantidad entregada.',
      'Ideal para lotes numerosos en pastoreo rotacional.'
    ],
    formula: [
      { ingredientId: 'ing_sal_proteada_40', ingredientName: 'Sal Proteica 40% PC', percentageInclusion: 70, kgPerTon: 700, costContributionUSD: 0.406 },
      { ingredientId: 'ing_afrecho_trigo', ingredientName: 'Afrecho de Trigo', percentageInclusion: 20, kgPerTon: 200, costContributionUSD: 0.052 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineralizada 8%', percentageInclusion: 10, kgPerTon: 100, costContributionUSD: 0.075 }
    ]
  },
  {
    id: 'plan_levante_proteico_energetico',
    name: 'Plan 4: Levante Proteico-Energético Estratégico (0.5% PV)',
    stage: 'levante',
    stageLabel: 'Levante / Desmante',
    description: 'Ración concentrada al 16% PC administrada al 0.5% del peso vivo para novillos de levante en desarrollo esquelético y muscular acelerado.',
    seasonSuitability: 'transicion',
    targetWeightMinKg: 180,
    targetWeightMaxKg: 280,
    targetGDPGrams: 850,
    inclusionPercentBW: 0.50,
    recommendedDoseKgPerHead: 1.20,
    crudeProteinPercent: 16.5,
    energyMcalKg: 1.75,
    costPerKgUSD: 0.35,
    costPerHeadDayUSD: 0.42,
    feedingFrequency: '1 toma matutina a las 7:00 AM',
    recommendations: [
      'Disponer de 30 cm de canoa o comedero lineal por animal.',
      'Sumar a un pastoreo de buena disponibilidad de masa forrajera.',
      'Control parasitario previo para maximizar conversión alimenticia.'
    ],
    formula: [
      { ingredientId: 'ing_maiz_molido', ingredientName: 'Maíz Amarillo Molido', percentageInclusion: 45, kgPerTon: 450, costContributionUSD: 0.171 },
      { ingredientId: 'ing_palmiste', ingredientName: 'Torta de Palmiste', percentageInclusion: 30, kgPerTon: 300, costContributionUSD: 0.066 },
      { ingredientId: 'ing_torta_soya', ingredientName: 'Torta de Soya', percentageInclusion: 15, kgPerTon: 150, costContributionUSD: 0.093 },
      { ingredientId: 'ing_melaza', ingredientName: 'Melaza de Caña', percentageInclusion: 6, kgPerTon: 60, costContributionUSD: 0.011 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineralizada 8%', percentageInclusion: 4, kgPerTon: 40, costContributionUSD: 0.030 }
    ]
  },

  // 3. PRECEBA
  {
    id: 'plan_preceba_adaptacion',
    name: 'Plan 5: Preceba y Adaptación Ruminal (1.2% PV con Ensilaje)',
    stage: 'preceba',
    stageLabel: 'Preceba / Backgrounding',
    description: 'Etapa de transición de 30-45 días para adaptar la microbiota ruminal a dietas ricas en concentrados y ensilaje antes de ingresar a la ceba intensiva.',
    seasonSuitability: 'todo_el_ano',
    targetWeightMinKg: 280,
    targetWeightMaxKg: 380,
    targetGDPGrams: 1100,
    inclusionPercentBW: 1.20,
    recommendedDoseKgPerHead: 4.0,
    crudeProteinPercent: 14.0,
    energyMcalKg: 1.85,
    costPerKgUSD: 0.28,
    costPerHeadDayUSD: 1.12,
    feedingFrequency: '2 tomas diarias (7:00 AM y 3:00 PM)',
    recommendations: [
      'Aumentar la dosis gradualmente en 500 g cada 3 días hasta llegar a la meta.',
      'Incorportar 0.5% de Bicarbonato de Sodio en la ración para prevenir acidez.',
      'Revisar firmeza de bostas (escala de consistencia fecal 3 de 5).'
    ],
    formula: [
      { ingredientId: 'ing_ensilaje_maiz', ingredientName: 'Ensilaje de Maíz', percentageInclusion: 50, kgPerTon: 500, costContributionUSD: 0.040 },
      { ingredientId: 'ing_maiz_molido', ingredientName: 'Maíz Amarillo Molido', percentageInclusion: 30, kgPerTon: 300, costContributionUSD: 0.114 },
      { ingredientId: 'ing_palmiste', ingredientName: 'Torta de Palmiste', percentageInclusion: 12, kgPerTon: 120, costContributionUSD: 0.026 },
      { ingredientId: 'ing_torta_soya', ingredientName: 'Torta de Soya', percentageInclusion: 5, kgPerTon: 50, costContributionUSD: 0.031 },
      { ingredientId: 'ing_bicarbonato', ingredientName: 'Bicarbonato de Sodio', percentageInclusion: 1, kgPerTon: 10, costContributionUSD: 0.005 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineralizada 8%', percentageInclusion: 2, kgPerTon: 20, costContributionUSD: 0.015 }
    ]
  },
  {
    id: 'plan_preceba_melaza_urea',
    name: 'Plan 6: Preceba Semiestabulada Melaza + Úrea Protegida',
    stage: 'preceba',
    stageLabel: 'Preceba / Backgrounding',
    description: 'Suplementación líquida/pastosa de bajo costo a base de melaza de caña, 3% de úrea pecuaria y sales minerales para pastoreo en fincas de ciclo corto.',
    seasonSuitability: 'epoca_seca',
    targetWeightMinKg: 300,
    targetWeightMaxKg: 380,
    targetGDPGrams: 900,
    inclusionPercentBW: 0.60,
    recommendedDoseKgPerHead: 2.0,
    crudeProteinPercent: 18.0,
    energyMcalKg: 1.60,
    costPerKgUSD: 0.24,
    costPerHeadDayUSD: 0.48,
    feedingFrequency: 'Suministro diario en bateas de plástico de alta resistencia',
    recommendations: [
      'Dilución estricta de la úrea y mezclado homogéneo.',
      'Período previo de acostumbramiento de 7 días con melaza pura.',
      'Prohibido el consumo en terneros jóvenes o animales en ayuno prolongado.'
    ],
    formula: [
      { ingredientId: 'ing_melaza', ingredientName: 'Melaza de Caña', percentageInclusion: 82, kgPerTon: 820, costContributionUSD: 0.148 },
      { ingredientId: 'ing_urea_pecuaria', ingredientName: 'Úrea Pecuaria', percentageInclusion: 3, kgPerTon: 30, costContributionUSD: 0.021 },
      { ingredientId: 'ing_afrecho_trigo', ingredientName: 'Afrecho de Trigo', percentageInclusion: 10, kgPerTon: 100, costContributionUSD: 0.026 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineralizada 8%', percentageInclusion: 5, kgPerTon: 50, costContributionUSD: 0.038 }
    ]
  },

  // 4. CEBA
  {
    id: 'plan_ceba_hot_finish',
    name: 'Plan 7: Ceba Intensiva Hot-Finish (2.0% PV - Ración de Alta Energía)',
    stage: 'ceba',
    stageLabel: 'Ceba / Engorde Intensivo',
    description: 'Dieta de engorde acelerado en corral o confinamiento para novillos pesados (380 - 520 kg). Diseñada para lograr rendimientos en canal > 56.5% y excelente cobertura de grasa.',
    seasonSuitability: 'todo_el_ano',
    targetWeightMinKg: 380,
    targetWeightMaxKg: 530,
    targetGDPGrams: 1450,
    inclusionPercentBW: 2.0,
    recommendedDoseKgPerHead: 9.0,
    crudeProteinPercent: 13.5,
    energyMcalKg: 2.05,
    costPerKgUSD: 0.32,
    costPerHeadDayUSD: 2.88,
    feedingFrequency: '3 repartos al día (6:30 AM, 11:30 AM, 4:30 PM)',
    recommendations: [
      'Piso de establo cómodo con cama seca o drenaje rápido.',
      'Uso obligatorio de Monensina (ionóforo) y Bicarbonato de sodio.',
      'Lectura de comederos diaria para ajustar consumo según rechazos (< 3%).'
    ],
    formula: [
      { ingredientId: 'ing_maiz_molido', ingredientName: 'Maíz Amarillo Molido', percentageInclusion: 58, kgPerTon: 580, costContributionUSD: 0.220 },
      { ingredientId: 'ing_ensilaje_maiz', ingredientName: 'Ensilaje de Maíz', percentageInclusion: 25, kgPerTon: 250, costContributionUSD: 0.020 },
      { ingredientId: 'ing_torta_soya', ingredientName: 'Torta de Soya', percentageInclusion: 8, kgPerTon: 80, costContributionUSD: 0.050 },
      { ingredientId: 'ing_palmiste', ingredientName: 'Torta de Palmiste', percentageInclusion: 5, kgPerTon: 50, costContributionUSD: 0.011 },
      { ingredientId: 'ing_bicarbonato', ingredientName: 'Bicarbonato de Sodio', percentageInclusion: 1.5, kgPerTon: 15, costContributionUSD: 0.007 },
      { ingredientId: 'ing_monensina', ingredientName: 'Monensina Pre-Mix', percentageInclusion: 0.5, kgPerTon: 5, costContributionUSD: 0.016 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineralizada 8%', percentageInclusion: 2, kgPerTon: 20, costContributionUSD: 0.015 }
    ]
  },
  {
    id: 'plan_ceba_pastoreo_suplementado',
    name: 'Plan 8: Ceba a Pasto con Suplementación Energética (1.0% PV)',
    stage: 'ceba',
    stageLabel: 'Ceba / Engorde Intensivo',
    description: 'Terminación de machos a campo sobre praderas mejoradas con entrega diaria de 4.0 kg de alimento concentrado energético para acortar el turno de venta en 60 días.',
    seasonSuitability: 'todo_el_ano',
    targetWeightMinKg: 380,
    targetWeightMaxKg: 500,
    targetGDPGrams: 1150,
    inclusionPercentBW: 1.0,
    recommendedDoseKgPerHead: 4.2,
    crudeProteinPercent: 12.5,
    energyMcalKg: 1.85,
    costPerKgUSD: 0.29,
    costPerHeadDayUSD: 1.22,
    feedingFrequency: '1 toma diaria a las 8:00 AM en comedero de potrero',
    recommendations: [
      'Garantizar espacio de comedero de 40 cm por animal.',
      'Suplementar después de que el ganado haya realizado el primer bocado de pastura.',
      'Sombra adecuada en el potrero para mitigar estrés térmico.'
    ],
    formula: [
      { ingredientId: 'ing_maiz_molido', ingredientName: 'Maíz Amarillo Molido', percentageInclusion: 50, kgPerTon: 500, costContributionUSD: 0.190 },
      { ingredientId: 'ing_palmiste', ingredientName: 'Torta de Palmiste', percentageInclusion: 30, kgPerTon: 300, costContributionUSD: 0.066 },
      { ingredientId: 'ing_afrecho_trigo', ingredientName: 'Afrecho de Trigo', percentageInclusion: 12, kgPerTon: 120, costContributionUSD: 0.031 },
      { ingredientId: 'ing_melaza', ingredientName: 'Melaza de Caña', percentageInclusion: 5, kgPerTon: 50, costContributionUSD: 0.009 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineralizada 8%', percentageInclusion: 3, kgPerTon: 30, costContributionUSD: 0.022 }
    ]
  },

  // 5. CRIANZA ARTIFICIAL DE TERNEROS
  {
    id: 'plan_crianza_lacteo_starter',
    name: 'Plan 9: Crianza Láctea Acelerada + Concentrado Starter 20% PC',
    stage: 'crianza_artificial',
    stageLabel: 'Crianza Artificial Terneros',
    description: 'Protocolo de alta eficiencia pre-destete (días 3 a 60). Combina sustituto lácteo o leche entera al 12.5% MS con concentrado iniciador pelletizado a voluntad.',
    seasonSuitability: 'todo_el_ano',
    targetWeightMinKg: 35,
    targetWeightMaxKg: 90,
    targetGDPGrams: 850,
    inclusionPercentBW: 10.0, // En forma de dieta líquida 10% de PV en litros
    recommendedDoseKgPerHead: 1.25, // Consumo de alimento seco + sustituto
    crudeProteinPercent: 21.0,
    energyMcalKg: 2.35,
    costPerKgUSD: 0.82,
    costPerHeadDayUSD: 1.05,
    feedingFrequency: '2 tomas lácteas (6:00 AM y 4:00 PM) + Starter libre en balde seco',
    recommendations: [
      'Calostrado obligatorio con > 22% Brix en las primeras 4 horas de vida.',
      'Temperatura del tetero/sustituto entre 38°C y 39.5°C al momento de ofrecer.',
      'Suministrar agua potable a voluntad en balde separado desde el día 3.'
    ],
    formula: [
      { ingredientId: 'ing_starter_terneros', ingredientName: 'Concentrado Starter 20% PC', percentageInclusion: 65, kgPerTon: 650, costContributionUSD: 0.338 },
      { ingredientId: 'ing_sustituto_lacteo', ingredientName: 'Sustituto Lácteo Premium', percentageInclusion: 30, kgPerTon: 300, costContributionUSD: 0.735 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineral / Pre-Mix Terneros', percentageInclusion: 5, kgPerTon: 50, costContributionUSD: 0.038 }
    ]
  },
  {
    id: 'plan_crianza_destete_precoz',
    name: 'Plan 10: Plan de Destete Precoz Lácteo Gradual (Semana 1 a 8)',
    stage: 'crianza_artificial',
    stageLabel: 'Crianza Artificial Terneros',
    description: 'Curva de desmante lácteo programada de 6 a 2 Litros/día sincronizada con el incremento exponencial de consumo de alimento starter seco para lograr desmante a las 8 semanas.',
    seasonSuitability: 'todo_el_ano',
    targetWeightMinKg: 40,
    targetWeightMaxKg: 85,
    targetGDPGrams: 780,
    inclusionPercentBW: 8.0,
    recommendedDoseKgPerHead: 1.10,
    crudeProteinPercent: 20.0,
    energyMcalKg: 2.20,
    costPerKgUSD: 0.72,
    costPerHeadDayUSD: 0.88,
    feedingFrequency: 'Curva semanal descendente: Sem 1-4 (6L), Sem 5-7 (4L), Sem 8 (2L matutinos)',
    recommendations: [
      'Destetar únicamente cuando el ternero consuma al menos 1.2 kg/día de starter por 3 días seguidos.',
      'Mantener cunas o jaulas con paja limpia y ventilación libre de corrientes frías.',
      'Lavado y desinfección diaria de chupo y baldes con agua caliente.'
    ],
    formula: [
      { ingredientId: 'ing_starter_terneros', ingredientName: 'Concentrado Starter 20% PC', percentageInclusion: 75, kgPerTon: 750, costContributionUSD: 0.390 },
      { ingredientId: 'ing_sustituto_lacteo', ingredientName: 'Sustituto Lácteo Premium', percentageInclusion: 20, kgPerTon: 200, costContributionUSD: 0.490 },
      { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineral / Pre-Mix', percentageInclusion: 5, kgPerTon: 50, costContributionUSD: 0.038 }
    ]
  }
];

export const INITIAL_DISPATCH_LOGS: SupplementDispatchLog[] = [
  {
    id: 'disp_001',
    date: '2026-08-11',
    stage: 'ceba',
    lotName: 'Lote Ceba 04 - Novillos Pesados',
    planName: 'Plan 7: Ceba Intensiva Hot-Finish',
    animalCount: 42,
    kgOfferedTotal: 378,
    kgRefusalTotal: 8,
    kgConsumedNet: 370,
    kgConsumedPerHead: 8.81,
    costTotalUSD: 120.96,
    operatorName: 'Carlos Mendoza',
    notes: 'Ganado con excelente apetito. Consumo parejo en comederos del establo.'
  },
  {
    id: 'disp_002',
    date: '2026-08-11',
    stage: 'cria',
    lotName: 'Lote Potrero La Esperanza - Terneros Paso',
    planName: 'Plan 1: Creep Feeding Terneros al Pie',
    animalCount: 28,
    kgOfferedTotal: 25.2,
    kgRefusalTotal: 1.2,
    kgConsumedNet: 24.0,
    kgConsumedPerHead: 0.86,
    costTotalUSD: 11.08,
    operatorName: 'Jorge Ramírez',
    notes: 'Revisión de comedero paso-ternero. Saladero seco y protegido.'
  },
  {
    id: 'disp_003',
    date: '2026-08-10',
    stage: 'crianza_artificial',
    lotName: 'Sala de Crianza A - Cunas Indiv.',
    planName: 'Plan 9: Crianza Láctea Acelerada + Starter',
    animalCount: 16,
    kgOfferedTotal: 20.0,
    kgRefusalTotal: 0.5,
    kgConsumedNet: 19.5,
    kgConsumedPerHead: 1.22,
    costTotalUSD: 16.40,
    operatorName: 'Ana María Gómez',
    notes: 'Toma AM y PM completada. Temperatura del sustituto lácteo verificada a 38.8°C.'
  },
  {
    id: 'disp_004',
    date: '2026-08-10',
    stage: 'levante',
    lotName: 'Lote Levante 02 - Potrero El Boquerón',
    planName: 'Plan 4: Levante Proteico-Energético Estratégico',
    animalCount: 35,
    kgOfferedTotal: 42.0,
    kgRefusalTotal: 1.0,
    kgConsumedNet: 41.0,
    kgConsumedPerHead: 1.17,
    costTotalUSD: 14.70,
    operatorName: 'Carlos Mendoza',
    notes: 'Suplemento ofrecido a las 7:15 AM. Bateas vacías en menos de 45 minutos.'
  }
];
