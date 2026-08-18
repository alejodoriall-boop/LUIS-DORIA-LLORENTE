import { CalfRearingModel } from '../types';

export const REARING_MODELS: CalfRearingModel[] = [
  {
    id: 'crianza_artificial_intensiva',
    name: 'Modelo 1: Crianza Artificial Intensiva (Sustituto Premium & Cunas)',
    category: 'Lechería Especializada',
    description: 'Sistema individual de cunas o jaulas con sustituto lácteo de alta proteína (22/20) y ración starter precoz. Maximiza ganancia diaria y libera leche comercial materna.',
    durationDays: 56,
    housingRecommended: 'Cunas individuales elevadas o jaulas móviles con piso slatted/paja seca.',
    feedingProtocol: 'Sem 1-4: 6 L/día sustituto (2 tomas) + starter libre. Sem 5-7: 4 L/día. Sem 8: 2 L/día (1 toma matutina).',
    weaningCriteria: 'Consumo sostenido de > 1.2 kg/día de concentrado iniciador por 3 días consecutivos.',
    targetGDPGrams: 850,
    estimatedCostPerCalfUSD: 145,
    pros: [
      'Control total de bioseguridad y prevención de contagios cruzados',
      'Liberación inmediata del 100% de la leche de la madre para venta comercial',
      'Desarrollo ruminal acelerado por alto consumo de concentrado iniciador',
      'Desmante precoz estandarizado a las 8 semanas de vida'
    ],
    cons: [
      'Inversión inicial alta en infraestructura de cunas/jaulas',
      'Costo directo en compra de sustituto lácteo de calidad superior',
      'Demanda mano de obra minuciosa para limpieza e higiene de teteros'
    ],
    recommendedBreeds: ['Holstein', 'Jersey', 'Girolando F1', 'Ayrshire']
  },
  {
    id: 'crianza_vaca_nodriza',
    name: 'Modelo 2: Crianza con Vaca Nodriza (Amamantamiento Restringido)',
    category: 'Doble Propósito',
    description: 'Asignación de 3 a 4 terneros por cada vaca nodriza de alta producción. Amamantamiento directo en 2 tomas diarias de 15-20 minutos complementado con pastoreo terneril.',
    durationDays: 100,
    housingRecommended: 'Corral de adiestramiento + Potrero terneril arbolado con sombra y agua limpia.',
    feedingProtocol: '2 tomas diarias de amamantamiento con la nodriza (mañana y tarde post-ordeño) + pasto tierno + 300g concentrado.',
    weaningCriteria: 'Alcanzar los 95 - 105 kg de peso vivo o los 3.5 - 4 meses de edad.',
    targetGDPGrams: 750,
    estimatedCostPerCalfUSD: 85,
    pros: [
      'Reducción drástica en costos de sustituto lácteo y teteros',
      'Baja incidencia de diarreas mecánicas por temperatura e higiene de leche natural',
      'Estimulación natural del comportamiento gregario en potrero',
      'Ideal para zonas tropicales con vacas de alto mérito maternal (Gyr, Guzerá)'
    ],
    cons: [
      'Requiere selección y adiestramiento de vacas nodrizas mansas',
      'Riesgo de rechazo de terneros adoptivos si no se realiza buen ahijamiento',
      'Insume espacio de potreros dedicados a la crianza'
    ],
    recommendedBreeds: ['Girolando', 'Gyr Lechero', 'Simmental x Cebú', 'Pardo Suizo']
  },
  {
    id: 'crianza_colectiva_automatica',
    name: 'Modelo 3: Crianza Colectiva Acelerada (Amamantador Automático RFID)',
    category: 'Tecnificada / Estabulada',
    description: 'Lotes de 15-20 terneros en corrales colectivos equipados con estación amamantadora automatizada por chip de radiofrecuencia (RFID). Ofrece múltiples tomas pequeñas a temperatura exacta.',
    durationDays: 60,
    housingRecommended: 'Corral colectivo amplio (3.5 m²/ternero) con cama profunda de viruta/paja y buena ventilación.',
    feedingProtocol: 'Suministro automatizado de hasta 8-10 L/día fraccionados en 4-6 visitas diarias. Curva de desmante programada.',
    weaningCriteria: 'Curva de desmante automático computarizada a los 60 días con reducción gradual de dosis láctea.',
    targetGDPGrams: 950,
    estimatedCostPerCalfUSD: 180,
    pros: [
      'Bienestar animal superior e interacción social desde la 2da semana',
      'Máximo rendimiento de crecimiento (> 900 g/día de GDP)',
      'Ahorro significativo de tiempo de personal de alimentación',
      'Reportes computarizados de velocidad de succión y alertas tempranas de fiebre/anorexia'
    ],
    cons: [
      'Alta inversión en amamantador automático e infraestructura RFID',
      'Riesgo de contagio masivo si falla la desinfección automática del chupete',
      'Requiere personal capacitado en soporte técnico y software'
    ],
    recommendedBreeds: ['Holstein', 'Jersey x Holstein', 'Brown Swiss', 'Girolando 3/4']
  },
  {
    id: 'crianza_pastoreo_creep_feeding',
    name: 'Modelo 4: Crianza a Campo con Creep Feeding (Suplementación Selectiva)',
    category: 'Cría a Campo',
    description: 'Terneros criados al pie de la madre en pastoreo extensivo con acceso exclusivo a un corralito de suplementación diferencial (Creep Feeding) protegido por paso de ternero.',
    durationDays: 180,
    housingRecommended: 'Potrero de cría con cerco paso-ternero (Creep-Feeder) de 45 cm de ancho.',
    feedingProtocol: 'Amamantamiento libre con la madre + 0.5% a 1% del peso vivo en alimento balancedo concentrado de alta energía.',
    weaningCriteria: 'Destete hiperprecoz (60-70 días) para recuperar la madre o destete tradicional (6-7 meses a los 180-210 kg).',
    targetGDPGrams: 800,
    estimatedCostPerCalfUSD: 60,
    pros: [
      'Prepara el rumen para digestión eficiente de forraje y fibra',
      'Aumenta el peso al destete en 20 a 35 kg adicionales comparado con solo pasto',
      'Reduce la carga metabólica de la madre mejorando el intervalo entre partos',
      'Mínima infraestructura requerida a campo abierto'
    ],
    cons: [
      'Depende del clima y disponibilidad de masa forrajera en potrero',
      'Menor control de consumo individual por ternero',
      'Riesgo de dominancia de terneros más grandes en el comedero'
    ],
    recommendedBreeds: ['Brangus', 'Braford', 'Nelore', 'Angus', 'Brahman']
  },
  {
    id: 'crianza_tradicional_balde',
    name: 'Modelo 5: Crianza Tradicional (Leche Entera en Balde / Mamadera Manual)',
    category: 'Tradicional',
    description: 'Suministro manual de 4 a 5 litros diarios de leche entera tibia tibia en baldes con o sin mamadera, administrada dos veces al día a temperatura de ordeño.',
    durationDays: 75,
    housingRecommended: 'Estructuras de estaca individual con sombra o corrales pequeños rústicos.',
    feedingProtocol: '2.5 L AM + 2.5 L PM de leche entera tibia + paja/heno de corte + concentrado comercial.',
    weaningCriteria: 'Duplicar el peso al nacer (alcanzar 65-75 kg) y consumo de 1 kg/día de alimento seco.',
    targetGDPGrams: 700,
    estimatedCostPerCalfUSD: 110,
    pros: [
      'Baja complejidad y fácil adopción por cualquier operario del predio',
      'Utiliza la leche entera producida en la propia finca',
      'No requiere software ni equipos electrónicos sofisticados',
      'Adaptable a explotaciones pequeñas y medianas'
    ],
    cons: [
      'Mayor costo de oportunidad al usar leche entera comercializable',
      'Variación de temperatura de la leche puede desencadenar diarreas',
      'Menor velocidad de crecimiento en comparación con modelos intensivos'
    ],
    recommendedBreeds: ['Criollo', 'Doble Propósito', 'Gyr', 'Normando', 'Simmental']
  }
];
