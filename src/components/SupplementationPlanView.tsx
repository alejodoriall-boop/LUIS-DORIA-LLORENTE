import React, { useState, useMemo } from 'react';
import {
  SupplementStage,
  FeedIngredient,
  FormulaComponent,
  SupplementPlan,
  SupplementDispatchLog,
  PurchaseHorizonDays,
  FeedPurchaseOrderProjection,
} from '../types';
import {
  INITIAL_INGREDIENTS,
  INITIAL_SUPPLEMENT_PLANS,
  INITIAL_DISPATCH_LOGS,
} from '../data/supplementationData';
import {
  Layers,
  Baby,
  Milk,
  Sparkles,
  Wheat,
  Flame,
  Scale,
  DollarSign,
  Calculator,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  Warehouse,
  Calendar,
  Search,
  Check,
  X,
  PieChart,
  Zap,
  Beef,
  ChevronRight,
  Info,
  ArrowUpRight,
  ShoppingCart,
  Clock,
  Send,
  Download,
  Package,
  Boxes,
} from 'lucide-react';

export const SupplementationPlanView: React.FC = () => {
  // State
  const [plans, setPlans] = useState<SupplementPlan[]>(INITIAL_SUPPLEMENT_PLANS);
  const [ingredients, setIngredients] = useState<FeedIngredient[]>(INITIAL_INGREDIENTS);
  const [dispatchLogs, setDispatchLogs] = useState<SupplementDispatchLog[]>(INITIAL_DISPATCH_LOGS);

  // Active Main Sub-Tab
  const [activeTab, setActiveTab] = useState<
    'planes_estandar' | 'calculadora_formulador' | 'proyeccion_compras' | 'inventario_insumos' | 'registro_despachos'
  >('planes_estandar');

  // Horizon State for Orders (7, 15, 30, 90, 180, 365 Días)
  const [purchaseHorizon, setPurchaseHorizon] = useState<PurchaseHorizonDays>(30);
  const [projectedHeadCount, setProjectedHeadCount] = useState<number>(320);
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('all');

  // Filter Stage
  const [selectedStage, setSelectedStage] = useState<SupplementStage | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // FORMULATOR CALCULATOR STATE
  // ==========================================
  const [calcStage, setCalcStage] = useState<SupplementStage>('ceba');
  const [calcHeadCount, setCalcHeadCount] = useState<number>(30);
  const [calcAvgWeight, setCalcAvgWeight] = useState<number>(420);
  const [calcTargetGDP, setCalcTargetGDP] = useState<number>(1300); // g/day
  const [calcCattlePriceUSD, setCalcCattlePriceUSD] = useState<number>(2.10); // $/kg live weight
  const [calcInclusionMix, setCalcInclusionMix] = useState<{ ingredientId: string; percent: number }[]>([
    { ingredientId: 'ing_maiz_molido', percent: 50 },
    { ingredientId: 'ing_ensilaje_maiz', percent: 25 },
    { ingredientId: 'ing_torta_soya', percent: 15 },
    { ingredientId: 'ing_palmiste', percent: 7 },
    { ingredientId: 'ing_sal_mineral_8', percent: 3 },
  ]);

  // Modals
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<SupplementPlan | null>(null);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState<boolean>(false);
  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState<boolean>(false);
  const [isLogDispatchModalOpen, setIsLogDispatchModalOpen] = useState<boolean>(false);

  // Add Plan Form State
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanStage, setNewPlanStage] = useState<SupplementStage>('levante');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanMinWeight, setNewPlanMinWeight] = useState(150);
  const [newPlanMaxWeight, setNewPlanMaxWeight] = useState(280);
  const [newPlanTargetGDP, setNewPlanTargetGDP] = useState(800);
  const [newPlanInclusionBW, setNewPlanInclusionBW] = useState(0.5);
  const [newPlanDoseKg, setNewPlanDoseKg] = useState(1.2);
  const [newPlanFrequency, setNewPlanFrequency] = useState('1 toma matutina en saladero/canoa');

  // Add Ingredient Form State
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState<FeedIngredient['category']>('energetico');
  const [newIngDM, setNewIngDM] = useState(88);
  const [newIngCP, setNewIngCP] = useState(12);
  const [newIngTDN, setNewIngTDN] = useState(70);
  const [newIngCost, setNewIngCost] = useState(0.30);

  // Dispatch Form State
  const [dispStage, setDispStage] = useState<SupplementStage>('ceba');
  const [dispLotName, setDispLotName] = useState('Lote Ceba 01 - Potrero El Roble');
  const [dispPlanName, setDispPlanName] = useState('Plan 7: Ceba Intensiva Hot-Finish');
  const [dispCount, setDispCount] = useState(25);
  const [dispOfferedKg, setDispOfferedKg] = useState(200);
  const [dispRefusalKg, setDispRefusalKg] = useState(5);
  const [dispOperator, setDispOperator] = useState('Carlos Mendoza');

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchStage = selectedStage === 'all' || p.stage === selectedStage;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.stageLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStage && matchQuery;
    });
  }, [plans, selectedStage, searchQuery]);

  // Realtime Formulator Calculation
  const formulatorResults = useMemo(() => {
    let totalPercent = 0;
    let weightedDM = 0;
    let weightedCP = 0;
    let weightedTDN = 0;
    let weightedCostPerKg = 0;

    calcInclusionMix.forEach((item) => {
      const ing = ingredients.find((i) => i.id === item.ingredientId);
      if (ing && item.percent > 0) {
        totalPercent += item.percent;
        weightedDM += (ing.dryMatterPercent * item.percent) / 100;
        weightedCP += (ing.crudeProteinPercent * item.percent) / 100;
        weightedTDN += (ing.tdnPercent * item.percent) / 100;
        weightedCostPerKg += (ing.costPerKgUSD * item.percent) / 100;
      }
    });

    // Suggested daily intake based on stage and weight
    let intakeBWPercent = 0.5;
    if (calcStage === 'cria') intakeBWPercent = 0.75;
    if (calcStage === 'levante') intakeBWPercent = 0.5;
    if (calcStage === 'preceba') intakeBWPercent = 1.2;
    if (calcStage === 'ceba') intakeBWPercent = 1.8;
    if (calcStage === 'crianza_artificial') intakeBWPercent = 2.2;

    const dailySupplementKgPerHead = (calcAvgWeight * intakeBWPercent) / 100;
    const totalDailySupplementKgLot = dailySupplementKgPerHead * calcHeadCount;
    const dailySupplementCostPerHead = dailySupplementKgPerHead * weightedCostPerKg;
    const dailySupplementCostLot = dailySupplementCostPerHead * calcHeadCount;
    const monthlyInvestmentLot = dailySupplementCostLot * 30;

    // Projected Economic Gain
    const dailyGainedKgPerHead = calcTargetGDP / 1000;
    const dailyGainedValueUSD = dailyGainedKgPerHead * calcCattlePriceUSD;
    const netDailyMarginPerHead = dailyGainedValueUSD - dailySupplementCostPerHead;
    const netMonthlyMarginLot = netDailyMarginPerHead * calcHeadCount * 30;

    return {
      totalPercent,
      weightedDM,
      weightedCP,
      weightedTDN,
      weightedCostPerKg,
      dailySupplementKgPerHead,
      totalDailySupplementKgLot,
      dailySupplementCostPerHead,
      dailySupplementCostLot,
      monthlyInvestmentLot,
      dailyGainedValueUSD,
      netDailyMarginPerHead,
      netMonthlyMarginLot,
    };
  }, [calcInclusionMix, ingredients, calcAvgWeight, calcHeadCount, calcTargetGDP, calcCattlePriceUSD, calcStage]);

  // ==========================================
  // MRP CALCULATION: PROYECCIÓN DE COMPRAS POR HORIZONTE (7, 15, 30, 90, 180, 365 DÍAS)
  // ==========================================
  const purchaseProjections = useMemo(() => {
    // Definición de materias primas con inventario simulado de bodega
    const rawMaterialSpecs: Record<string, {
      category: string;
      packageSizeKg: number;
      currentStockKg: number;
      safetyStockKg: number;
      supplier: string;
      supplierPhone: string;
      dailyConsumptionGramsPerHead: number; // Tasa promedio de consumo en el hato
    }> = {
      ing_maiz_molido: {
        category: 'Energético',
        packageSizeKg: 50,
        currentStockKg: 1250,
        safetyStockKg: 500,
        supplier: 'AgroInsumos El Molino',
        supplierPhone: '+57 312 456 7890',
        dailyConsumptionGramsPerHead: 650,
      },
      ing_torta_soya: {
        category: 'Proteico',
        packageSizeKg: 50,
        currentStockKg: 400,
        safetyStockKg: 400,
        supplier: 'NutriGan del Llano',
        supplierPhone: '+57 310 987 6543',
        dailyConsumptionGramsPerHead: 320,
      },
      ing_palmiste: {
        category: 'Energético/Fibra',
        packageSizeKg: 50,
        currentStockKg: 950,
        safetyStockKg: 300,
        supplier: 'Extractora Palmas del Sol',
        supplierPhone: '+57 315 222 3344',
        dailyConsumptionGramsPerHead: 250,
      },
      ing_afrecho_trigo: {
        category: 'Energético',
        packageSizeKg: 40,
        currentStockKg: 680,
        safetyStockKg: 200,
        supplier: 'Molinos del Oriente',
        supplierPhone: '+57 318 444 5566',
        dailyConsumptionGramsPerHead: 180,
      },
      ing_sal_mineral_8: {
        category: 'Mineral',
        packageSizeKg: 40,
        currentStockKg: 850,
        safetyStockKg: 350,
        supplier: 'Sales Minerales Somex / Ganadería',
        supplierPhone: '+57 311 777 8899',
        dailyConsumptionGramsPerHead: 80,
      },
      ing_melaza_cana: {
        category: 'Energético Líquido',
        packageSizeKg: 250, // Tambor 250 kg
        currentStockKg: 1000,
        safetyStockKg: 500,
        supplier: 'Ingenio Azucarero Central',
        supplierPhone: '+57 316 333 9900',
        dailyConsumptionGramsPerHead: 300,
      },
      ing_urea_protegida: {
        category: 'Proteína No Proteica',
        packageSizeKg: 25,
        currentStockKg: 150,
        safetyStockKg: 100,
        supplier: 'NutriGan del Llano',
        supplierPhone: '+57 310 987 6543',
        dailyConsumptionGramsPerHead: 40,
      },
    };

    const projections: FeedPurchaseOrderProjection[] = ingredients.map((ing) => {
      const spec = rawMaterialSpecs[ing.id] || {
        category: ing.category,
        packageSizeKg: 50,
        currentStockKg: 500,
        safetyStockKg: 250,
        supplier: 'Distribuidora Agropecuaria Principal',
        supplierPhone: '+57 300 000 0000',
        dailyConsumptionGramsPerHead: 100,
      };

      // Demanda diaria del hato activo
      const dailyDemandHatoKg = (projectedHeadCount * spec.dailyConsumptionGramsPerHead) / 1000;
      
      // Demanda proyectada según el horizonte seleccionado (7, 15, 30, 90, 180, 365 días)
      const projectedDemandKg = dailyDemandHatoKg * purchaseHorizon;

      // Cálculo de déficit / faltante neto considerando el stock de seguridad
      const totalRequiredKg = projectedDemandKg + spec.safetyStockKg;
      const netShortageKg = Math.max(0, totalRequiredKg - spec.currentStockKg);

      // Conversión a unidades comerciales (Bultos o Tambores redondeados hacia arriba)
      const suggestedPackages = netShortageKg > 0 ? Math.ceil(netShortageKg / spec.packageSizeKg) : 0;
      const totalOrderKg = suggestedPackages * spec.packageSizeKg;
      const totalEstimatedCostUSD = totalOrderKg * ing.costPerKgUSD;

      // Autonomía en días con el inventario actual
      const daysOfAutonomy = dailyDemandHatoKg > 0 ? Math.floor(spec.currentStockKg / dailyDemandHatoKg) : 999;
      const isUrgentReorder = daysOfAutonomy <= 7;

      return {
        materialId: ing.id,
        materialName: ing.name,
        category: spec.category,
        packageWeightKg: spec.packageSizeKg,
        unitCostPerKgUSD: ing.costPerKgUSD,
        currentStockKg: spec.currentStockKg,
        safetyStockKg: spec.safetyStockKg,
        dailyDemandHatoKg: Math.round(dailyDemandHatoKg * 10) / 10,
        projectedDemandKg: Math.round(projectedDemandKg),
        netShortageKg: Math.round(netShortageKg),
        suggestedPackages,
        totalOrderKg,
        totalEstimatedCostUSD: Math.round(totalEstimatedCostUSD * 100) / 100,
        daysOfAutonomy,
        isUrgentReorder,
        supplier: spec.supplier,
        supplierPhone: spec.supplierPhone,
      };
    });

    const totalProjectedCostUSD = projections.reduce((acc, p) => acc + p.totalEstimatedCostUSD, 0);
    const totalPackagesToOrder = projections.reduce((acc, p) => acc + p.suggestedPackages, 0);
    const totalTonsToOrder = projections.reduce((acc, p) => acc + p.totalOrderKg, 0) / 1000;
    const criticalStockCount = projections.filter((p) => p.isUrgentReorder).length;

    return {
      projections,
      totalProjectedCostUSD,
      totalPackagesToOrder,
      totalTonsToOrder: Math.round(totalTonsToOrder * 100) / 100,
      criticalStockCount,
    };
  }, [ingredients, purchaseHorizon, projectedHeadCount]);

  // Stage Badge Colors and Labels Helper
  const getStageBadgeProps = (stage: SupplementStage) => {
    switch (stage) {
      case 'cria':
        return {
          label: 'CRÍA (MAMANTAS)',
          icon: Milk,
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'levante':
        return {
          label: 'LEVANTE (DESMATE)',
          icon: Wheat,
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      case 'preceba':
        return {
          label: 'PRECEBA (ADAPTACIÓN)',
          icon: Zap,
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'ceba':
        return {
          label: 'CEBA (FINALIZACIÓN)',
          icon: Beef,
          badgeBg: 'bg-red-100 text-red-900 border-red-300',
        };
      case 'crianza_artificial':
        return {
          label: 'CRIANZA ARTIFICIAL',
          icon: Baby,
          badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
        };
    }
  };

  // Add Plan Handler
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) {
      showToast('⚠️ Por favor ingrese un nombre para el plan.');
      return;
    }

    const newPlan: SupplementPlan = {
      id: `plan_custom_${Date.now()}`,
      name: newPlanName,
      stage: newPlanStage,
      stageLabel: getStageBadgeProps(newPlanStage).label,
      description: newPlanDesc || 'Plan formulado a medida para nutrición estratégica del lote.',
      seasonSuitability: 'todo_el_ano',
      targetWeightMinKg: newPlanMinWeight,
      targetWeightMaxKg: newPlanMaxWeight,
      targetGDPGrams: newPlanTargetGDP,
      inclusionPercentBW: newPlanInclusionBW,
      recommendedDoseKgPerHead: newPlanDoseKg,
      crudeProteinPercent: 16.0,
      energyMcalKg: 1.80,
      costPerKgUSD: 0.35,
      costPerHeadDayUSD: newPlanDoseKg * 0.35,
      feedingFrequency: newPlanFrequency,
      recommendations: [
        'Asegurar agua potable y limpia a voluntad.',
        'Suministrar en comederos limpios libres de hongos o humedad.',
      ],
      formula: [
        { ingredientId: 'ing_maiz_molido', ingredientName: 'Maíz Amarillo Molido', percentageInclusion: 50, kgPerTon: 500, costContributionUSD: 0.19 },
        { ingredientId: 'ing_palmiste', ingredientName: 'Torta de Palmiste', percentageInclusion: 30, kgPerTon: 300, costContributionUSD: 0.066 },
        { ingredientId: 'ing_torta_soya', ingredientName: 'Torta de Soya', percentageInclusion: 15, kgPerTon: 150, costContributionUSD: 0.093 },
        { ingredientId: 'ing_sal_mineral_8', ingredientName: 'Sal Mineralizada 8%', percentageInclusion: 5, kgPerTon: 50, costContributionUSD: 0.038 },
      ],
    };

    setPlans([newPlan, ...plans]);
    setIsAddPlanModalOpen(false);
    showToast(`✅ Plan "${newPlan.name}" creado con éxito.`);
    // Reset
    setNewPlanName('');
    setNewPlanDesc('');
  };

  // Add Ingredient Handler
  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    const newIng: FeedIngredient = {
      id: `ing_custom_${Date.now()}`,
      name: newIngName,
      category: newIngCategory,
      dryMatterPercent: newIngDM,
      crudeProteinPercent: newIngCP,
      tdnPercent: newIngTDN,
      netEnergyMcalKg: 1.6,
      costPerKgUSD: newIngCost,
      unit: 'kg',
      notes: 'Insumo registrado manualmente en inventario.',
    };

    setIngredients([...ingredients, newIng]);
    setIsAddIngredientModalOpen(false);
    showToast(`🌾 Materia prima "${newIng.name}" agregada al inventario.`);
    setNewIngName('');
  };

  // Add Dispatch Handler
  const handleLogDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const net = Math.max(0, dispOfferedKg - dispRefusalKg);
    const perHead = dispCount > 0 ? net / dispCount : 0;

    const newLog: SupplementDispatchLog = {
      id: `disp_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      stage: dispStage,
      lotName: dispLotName,
      planName: dispPlanName,
      animalCount: dispCount,
      kgOfferedTotal: dispOfferedKg,
      kgRefusalTotal: dispRefusalKg,
      kgConsumedNet: net,
      kgConsumedPerHead: Number(perHead.toFixed(2)),
      costTotalUSD: Number((net * 0.32).toFixed(2)),
      operatorName: dispOperator,
      notes: 'Registro de despacho en comedero completado.',
    };

    setDispatchLogs([newLog, ...dispatchLogs]);
    setIsLogDispatchModalOpen(false);
    showToast(`📋 Despacho registrado para "${dispLotName}" (${net} kg consumidos).`);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#012d1d] text-[#ffba38] border-2 border-[#ffba38] px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-[#ffba38] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HERO BANNER */}
      <div className="bg-gradient-to-r from-[#012d1d] via-[#083e29] to-[#012d1d] text-white rounded-3xl p-5 md:p-7 border-2 border-[#012d1d] card-shadow space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#1b5e43] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ffba38] text-[#012d1d] flex items-center justify-center font-black text-2xl shrink-0 shadow-lg">
              <Wheat className="w-8 h-8 text-[#012d1d]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#ffba38] text-[#012d1d] text-[10px] font-mono font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                  MÓDULO DE NUTRICIÓN BOVINA MULTI-ETAPA
                </span>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                  v3.2 Zootecnia Aprobada
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-1">
                <h1 className="font-black text-2xl md:text-3xl text-[#ffba38]">
                  Plan Integral de Suplementación Bovina
                </h1>
                <div className="group relative inline-flex items-center">
                  <button
                    type="button"
                    className="text-[#a3b8ad] hover:text-[#ffba38] transition-colors p-0.5 rounded cursor-pointer"
                    title="Estrategias nutricionales estandarizadas para Cría, Levante, Preceba, Ceba e Crianza Artificial de Terneros. Formule raciones balanceadas, optimice el costo por kg ganado y controle entregas diarias en comederos."
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-40 w-80 bg-[#012d1d] text-white text-[11px] font-medium p-2.5 rounded-xl shadow-xl border border-[#2d6a4f] pointer-events-none animate-in fade-in zoom-in-95">
                    Estrategias nutricionales estandarizadas para <b>Cría, Levante, Preceba, Ceba e Crianza Artificial de Terneros</b>. Formule raciones balanceadas, optimice el costo por kg ganado y controle entregas diarias en comederos.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddPlanModalOpen(true)}
              className="bg-[#ffba38] hover:bg-[#e0a020] text-[#012d1d] px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-[#012d1d]" />
              Crear Nuevo Plan
            </button>

            <button
              onClick={() => setIsLogDispatchModalOpen(true)}
              className="bg-[#03402a] hover:bg-[#07593c] text-white border border-[#1b5e43] px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-[#ffba38]" />
              Registrar Despacho
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
          <div className="bg-[#03402a]/90 p-3.5 rounded-2xl border border-[#1b5e43] text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Planes Nutricionales</span>
            <span className="text-xl font-mono font-black text-white">{plans.length} Formulados</span>
          </div>

          <div className="bg-[#03402a]/90 p-3.5 rounded-2xl border border-[#1b5e43] text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Insumos en Inventario</span>
            <span className="text-xl font-mono font-black text-[#ffba38]">{ingredients.length} Materias Primas</span>
          </div>

          <div className="bg-[#03402a]/90 p-3.5 rounded-2xl border border-[#1b5e43] text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">GDP Objetivo Promedio</span>
            <span className="text-xl font-mono font-black text-emerald-300">+980 g/día</span>
          </div>

          <div className="bg-[#03402a]/90 p-3.5 rounded-2xl border border-[#1b5e43] text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Despachos Hoy</span>
            <span className="text-xl font-mono font-black text-white">{dispatchLogs.length} Entregas</span>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-[#03402a]/90 p-3.5 rounded-2xl border border-[#1b5e43] text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Costo Promedio Ración</span>
            <span className="text-xl font-mono font-black text-[#ffba38]">$0.42 USD / kg</span>
          </div>
        </div>
      </div>

      {/* STAGE SELECTOR CAROUSEL / PILLS */}
      <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-4 card-shadow space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-[#012d1d] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#012d1d]" />
            Filtrar por Etapa Productiva Bovinos:
          </span>
          <span className="text-[11px] text-[#717973] font-bold">
            Mostrando {filteredPlans.length} de {plans.length} planes
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'all', label: 'Todas las Etapas', icon: Layers, count: plans.length },
            { id: 'crianza_artificial', label: 'Crianza Artificial (0-60d)', icon: Baby, count: plans.filter(p => p.stage === 'crianza_artificial').length },
            { id: 'cria', label: 'Cría / Creep Feeding', icon: Milk, count: plans.filter(p => p.stage === 'cria').length },
            { id: 'levante', label: 'Levante (140-280 kg)', icon: Wheat, count: plans.filter(p => p.stage === 'levante').length },
            { id: 'preceba', label: 'Preceba (280-380 kg)', icon: Zap, count: plans.filter(p => p.stage === 'preceba').length },
            { id: 'ceba', label: 'Ceba / Engorde (380-530 kg)', icon: Beef, count: plans.filter(p => p.stage === 'ceba').length },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isSelected = selectedStage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStage(tab.id as any)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border-2 ${
                  isSelected
                    ? 'bg-[#012d1d] text-[#ffba38] border-[#012d1d] shadow-md scale-[1.02]'
                    : 'bg-[#f8fdfa] text-[#012d1d] border-[#e2efe8] hover:border-[#012d1d]'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#ffba38]' : 'text-[#012d1d]'}`} />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${isSelected ? 'bg-[#ffba38] text-[#012d1d]' : 'bg-[#e2efe8] text-[#012d1d]'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODULE MAIN SUB-TABS */}
      <div className="flex items-center gap-2 border-b-2 border-[#012d1d] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('planes_estandar')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'planes_estandar'
              ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
              : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
          }`}
        >
          <Wheat className="w-4 h-4 text-[#ffba38]" />
          Recetario de Dietas & Planes ({filteredPlans.length})
        </button>

        <button
          onClick={() => setActiveTab('calculadora_formulador')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'calculadora_formulador'
              ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
              : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#ffba38]" />
          Formulador de Raciones & ROI
        </button>

        <button
          onClick={() => setActiveTab('proyeccion_compras')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border-2 ${
            activeTab === 'proyeccion_compras'
              ? 'bg-[#012d1d] text-[#ffba38] border-[#012d1d] shadow-md'
              : 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-[#ffba38]" />
          Proyección de Pedidos & Compras (MRP)
          <span className="bg-[#ffba38] text-[#012d1d] text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
            {purchaseHorizon}d
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inventario_insumos')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'inventario_insumos'
              ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
              : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
          }`}
        >
          <Warehouse className="w-4 h-4 text-[#ffba38]" />
          Inventario de Materias Primas ({ingredients.length})
        </button>

        <button
          onClick={() => setActiveTab('registro_despachos')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'registro_despachos'
              ? 'bg-[#012d1d] text-[#ffba38] shadow-md'
              : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2efe8]'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-[#ffba38]" />
          Bitácora de Despachos ({dispatchLogs.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: RECETARIO DE PLANES DE SUPLEMENTACION                          */}
      {/* ========================================================================= */}
      {activeTab === 'planes_estandar' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl border-2 border-[#012d1d] p-3 card-shadow flex items-center gap-3">
            <Search className="w-5 h-5 text-[#717973] ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar plan por nombre, ingrediente o etapa (ej: Creep Feeding, Hot-Finish, Sal Proteica)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-bold text-[#012d1d] focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#717973] hover:text-black">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPlans.map((plan) => {
              const stageProps = getStageBadgeProps(plan.stage);
              const StageIcon = stageProps.icon;

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 space-y-4 card-shadow hover:border-[#ffba38] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2efe8] pb-3">
                      <span className={`text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase border flex items-center gap-1.5 ${stageProps.badgeBg}`}>
                        <StageIcon className="w-3.5 h-3.5" /> {stageProps.label}
                      </span>

                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-black px-2.5 py-0.5 rounded-xl flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700" /> Target GDP: +{plan.targetGDPGrams} g/d
                      </span>
                    </div>

                    <h3 className="font-black text-lg text-[#012d1d] leading-snug">
                      {plan.name}
                    </h3>

                    <p className="text-xs text-[#525a55] leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-[#f8fdfa] p-3 rounded-2xl border border-[#c1c8c2] text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717973] block">Proteína Cruda</span>
                        <span className="text-sm font-mono font-black text-[#012d1d]">{plan.crudeProteinPercent}% PC</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717973] block">Dosis Diaria</span>
                        <span className="text-sm font-mono font-black text-blue-900">{plan.recommendedDoseKgPerHead} kg/cab</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717973] block">Costo / Día</span>
                        <span className="text-sm font-mono font-black text-amber-900">${plan.costPerHeadDayUSD.toFixed(2)} USD</span>
                      </div>
                    </div>

                    {/* Formula Composition Preview */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-black uppercase text-[#012d1d] flex items-center gap-1">
                        <PieChart className="w-3.5 h-3.5 text-[#012d1d]" /> Composición de la Mezcla (Fórmula):
                      </span>

                      <div className="space-y-1 bg-[#f0f4f1] p-2.5 rounded-xl border border-[#e2efe8]">
                        {plan.formula.slice(0, 4).map((f) => (
                          <div key={f.ingredientId} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#012d1d] truncate max-w-[200px]">{f.ingredientName}</span>
                            <div className="flex items-center gap-2 font-mono font-bold">
                              <span className="text-emerald-800">{f.percentageInclusion}%</span>
                              <span className="text-[#717973] text-[10px]">({f.kgPerTon} kg/Ton)</span>
                            </div>
                          </div>
                        ))}
                        {plan.formula.length > 4 && (
                          <span className="text-[10px] text-[#717973] italic block text-right">
                            + {plan.formula.length - 4} insumos adicionales...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Recommendations bullet */}
                    <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-xs text-[#451a03] font-medium leading-tight space-y-1">
                      <span className="font-bold block uppercase text-[10px] text-amber-900 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-amber-700" /> Recomendación Zootécnica:
                      </span>
                      <p>{plan.recommendations[0]}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#e2efe8] flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPlanDetail(plan)}
                      className="flex-1 bg-[#012d1d] hover:bg-[#1b4332] text-[#ffba38] py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ffba38]" />
                      Ver Ficha Completa
                    </button>

                    <button
                      onClick={() => {
                        setCalcStage(plan.stage);
                        setActiveTab('calculadora_formulador');
                        showToast(`⚡ Cargado "${plan.name}" en el Simulador Formulado.`);
                      }}
                      className="px-3 py-2 bg-[#f0f4f1] hover:bg-[#e2efe8] text-[#012d1d] rounded-xl text-xs font-bold flex items-center gap-1 border border-[#c1c8c2] cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5 text-[#012d1d]" />
                      Formular
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: FORMULADOR DE RACIONES & ROI SIMULATOR                        */}
      {/* ========================================================================= */}
      {activeTab === 'calculadora_formulador' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold shrink-0">
                  <Calculator className="w-6 h-6 text-[#ffba38]" />
                </div>
                <div>
                  <h3 className="font-black text-lg md:text-xl text-[#012d1d]">
                    Simulador & Formulado de Raciones Nutricionales
                  </h3>
                  <p className="text-xs text-[#717973]">
                    Ajuste porcentajes de insumos y obtenga en tiempo real: Proteína Cruda (PC %), Materia Seca (MS %), TDN %, Costo por kg y Retorno Económico Estimado (ROI).
                  </p>
                </div>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-[#f8fdfa] p-4 rounded-2xl border-2 border-[#012d1d]">
              <div>
                <label className="text-[11px] font-black uppercase text-[#012d1d] block mb-1">Etapa Productiva:</label>
                <select
                  value={calcStage}
                  onChange={(e) => setCalcStage(e.target.value as SupplementStage)}
                  className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                >
                  <option value="crianza_artificial">Crianza Artificial (0-60d)</option>
                  <option value="cria">Cría / Creep Feeding</option>
                  <option value="levante">Levante (140-280 kg)</option>
                  <option value="preceba">Preceba (280-380 kg)</option>
                  <option value="ceba">Ceba / Engorde (380-530 kg)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-[#012d1d] block mb-1">Cabezas en el Lote:</label>
                <input
                  type="number"
                  min="1"
                  value={calcHeadCount}
                  onChange={(e) => setCalcHeadCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-[#012d1d] block mb-1">Peso Promedio (kg):</label>
                <input
                  type="number"
                  value={calcAvgWeight}
                  onChange={(e) => setCalcAvgWeight(Number(e.target.value))}
                  className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-[#012d1d] block mb-1">GDP Meta (g/día):</label>
                <input
                  type="number"
                  step="50"
                  value={calcTargetGDP}
                  onChange={(e) => setCalcTargetGDP(Number(e.target.value))}
                  className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-[#012d1d] block mb-1">Precio Ganado Vivo ($/kg):</label>
                <input
                  type="number"
                  step="0.10"
                  value={calcCattlePriceUSD}
                  onChange={(e) => setCalcCattlePriceUSD(Number(e.target.value))}
                  className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-900"
                />
              </div>
            </div>

            {/* Custom Ingredient Mixer Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-[#012d1d] flex items-center gap-2">
                  <Wheat className="w-4 h-4 text-[#012d1d]" />
                  Mezcla de Ingredientes de la Ración (% Inclusión Total):
                </h4>

                <span className={`text-xs font-mono font-black px-3 py-1 rounded-xl ${
                  Math.abs(formulatorResults.totalPercent - 100) < 0.1
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  Suma Total: {formulatorResults.totalPercent.toFixed(1)}% {Math.abs(formulatorResults.totalPercent - 100) < 0.1 ? '✓ (100% Correcto)' : '⚠️ Debe sumar 100%'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#012d1d] text-[#ffba38] font-black uppercase text-[10px]">
                      <th className="p-3 rounded-tl-xl">Materia Prima / Insumo</th>
                      <th className="p-3 text-center">% Inclusión</th>
                      <th className="p-3 text-center">kg por Tonelada</th>
                      <th className="p-3 text-center">Materia Seca (MS %)</th>
                      <th className="p-3 text-center">Proteína Cruda (PC %)</th>
                      <th className="p-3 text-center">TDN %</th>
                      <th className="p-3 text-center">Costo ($/kg)</th>
                      <th className="p-3 text-center rounded-tr-xl">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {calcInclusionMix.map((item, idx) => {
                      const ing = ingredients.find((i) => i.id === item.ingredientId);
                      return (
                        <tr key={idx} className="hover:bg-[#f8fdfa]">
                          <td className="p-2.5">
                            <select
                              value={item.ingredientId}
                              onChange={(e) => {
                                const newMix = [...calcInclusionMix];
                                newMix[idx].ingredientId = e.target.value;
                                setCalcInclusionMix(newMix);
                              }}
                              className="w-full bg-white border border-[#c1c8c2] rounded-xl px-2.5 py-1.5 font-bold text-[#012d1d]"
                            >
                              {ingredients.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.name} (${i.costPerKgUSD}/kg)
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.percent}
                              onChange={(e) => {
                                const newMix = [...calcInclusionMix];
                                newMix[idx].percent = Number(e.target.value);
                                setCalcInclusionMix(newMix);
                              }}
                              className="w-20 bg-white border border-[#c1c8c2] rounded-xl px-2 py-1 text-center font-mono font-bold text-[#012d1d]"
                            />
                          </td>

                          <td className="p-2.5 text-center font-mono font-bold text-[#012d1d]">
                            {(item.percent * 10).toFixed(0)} kg
                          </td>

                          <td className="p-2.5 text-center font-mono text-[#525a55]">
                            {ing?.dryMatterPercent}%
                          </td>

                          <td className="p-2.5 text-center font-mono font-bold text-emerald-800">
                            {ing?.crudeProteinPercent}%
                          </td>

                          <td className="p-2.5 text-center font-mono text-blue-900">
                            {ing?.tdnPercent}%
                          </td>

                          <td className="p-2.5 text-center font-mono font-bold text-amber-900">
                            ${ing?.costPerKgUSD.toFixed(2)}
                          </td>

                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => {
                                if (calcInclusionMix.length > 1) {
                                  setCalcInclusionMix(calcInclusionMix.filter((_, i) => i !== idx));
                                }
                              }}
                              className="text-rose-600 hover:text-rose-900 p-1"
                              title="Eliminar insumo de la mezcla"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => {
                  setCalcInclusionMix([
                    ...calcInclusionMix,
                    { ingredientId: ingredients[0].id, percent: 5 },
                  ]);
                }}
                className="bg-[#f0f4f1] hover:bg-[#e2efe8] text-[#012d1d] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-[#c1c8c2] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#012d1d]" />
                Agregar Otra Materia Prima a la Fórmula
              </button>
            </div>

            {/* Simulation Output Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Nutritional Results */}
              <div className="bg-[#f8fdfa] rounded-2xl p-5 border-2 border-[#012d1d] space-y-3">
                <h4 className="font-black text-sm text-[#012d1d] border-b border-[#e2efe8] pb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#012d1d]" />
                  Aporte Nutricional Proyectado de la Mezcla:
                </h4>

                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#c1c8c2]">
                    <span className="text-[10px] text-[#717973] uppercase font-bold block">Proteína Cruda (PC %)</span>
                    <span className="text-xl font-mono font-black text-emerald-800">
                      {formulatorResults.weightedCP.toFixed(1)}% PC
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#c1c8c2]">
                    <span className="text-[10px] text-[#717973] uppercase font-bold block">Nutrientes Totales (TDN)</span>
                    <span className="text-xl font-mono font-black text-blue-900">
                      {formulatorResults.weightedTDN.toFixed(1)}% TDN
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#c1c8c2]">
                    <span className="text-[10px] text-[#717973] uppercase font-bold block">Materia Seca (MS %)</span>
                    <span className="text-lg font-mono font-bold text-[#012d1d]">
                      {formulatorResults.weightedDM.toFixed(1)}% MS
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-[#c1c8c2]">
                    <span className="text-[10px] text-[#717973] uppercase font-bold block">Costo Directo Preparado</span>
                    <span className="text-lg font-mono font-black text-amber-900">
                      ${formulatorResults.weightedCostPerKg.toFixed(2)} / kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial & ROI Results */}
              <div className="bg-gradient-to-br from-[#012d1d] to-[#083e29] text-white rounded-2xl p-5 border-2 border-[#012d1d] space-y-3">
                <h4 className="font-black text-sm text-[#ffba38] border-b border-[#1b5e43] pb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#ffba38]" />
                  Retorno Financiero & Margen Bruto del Lote:
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-100">Consumo Dosis/Día por Animal:</span>
                    <span className="font-mono font-bold text-white">{formulatorResults.dailySupplementKgPerHead.toFixed(2)} kg/día</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-emerald-100">Costo Alimentación Lote ({calcHeadCount} cab/día):</span>
                    <span className="font-mono font-bold text-amber-300">${formulatorResults.dailySupplementCostLot.toFixed(2)} USD</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-emerald-100">Inversión Mensual del Lote (30 días):</span>
                    <span className="font-mono font-bold text-amber-300">${formulatorResults.monthlyInvestmentLot.toFixed(0)} USD</span>
                  </div>

                  <div className="border-t border-[#1b5e43] pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-200">Margen Bruto Neto Ganado/Día:</span>
                    <span className="text-base font-mono font-black text-[#ffba38]">
                      +${formulatorResults.netDailyMarginPerHead.toFixed(2)} USD / animal
                    </span>
                  </div>

                  <div className="bg-[#03402a] p-3 rounded-xl border border-[#1b5e43] text-center">
                    <span className="text-[10px] text-emerald-200 uppercase font-bold block">Utilidad Neta Proyectada Lote/Mes</span>
                    <span className="text-xl font-mono font-black text-emerald-300">
                      +${formulatorResults.netMonthlyMarginLot.toFixed(0)} USD / mes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: PROYECCIÓN DE PEDIDOS & COMPRAS (MRP - 7, 15, 30, 90, 180, 365d)  */}
      {/* ========================================================================= */}
      {activeTab === 'proyeccion_compras' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Control Panel: Horizon Selector and Farm Animal Load */}
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold shadow-md shrink-0">
                  <ShoppingCart className="w-6 h-6 text-[#ffba38]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-lg text-[#012d1d]">
                      Planificador MRP & Proyección de Pedidos de Insumos
                    </h3>
                    <span className="bg-[#012d1d] text-[#ffba38] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase">
                      Horizonte Activo: {purchaseHorizon === 365 ? '1 Año (365 Días)' : `${purchaseHorizon} Días`}
                    </span>
                  </div>
                  <p className="text-xs text-[#717973] mt-0.5">
                    Calcule con precisión matemática los bultos y toneladas a ordenar según la carga animal y los días de cobertura deseados.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={() => {
                    const message = `📋 *PEDIDO DE INSUMOS NUTRICIONALES - HATO GENERAL*\n🗓️ Cobertura: ${purchaseHorizon} Días | Carga: ${projectedHeadCount} Bovinos\n💰 Inversión Estimada: $${purchaseProjections.totalProjectedCostUSD.toLocaleString()} USD\n📦 Total Bultos Sugeridos: ${purchaseProjections.totalPackagesToOrder} und (${purchaseProjections.totalTonsToOrder} Ton)\n\n*Detalle de Insumos:*\n` +
                      purchaseProjections.projections.filter(p => p.suggestedPackages > 0).map(p => `• ${p.materialName}: ${p.suggestedPackages} bultos (${p.totalOrderKg} kg) - Prov: ${p.supplier}`).join('\n');
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  <Send className="w-4 h-4 text-emerald-200" />
                  Enviar por WhatsApp
                </button>

                <button
                  onClick={() => showToast('📥 Planilla de orden de compra generada en formato CSV/Excel.')}
                  className="px-3.5 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-[#ffba38] rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-[#ffba38]" />
                  Exportar Orden
                </button>
              </div>
            </div>

            {/* HORIZON SELECTOR BUTTONS (7, 15, 30, 90, 180, AÑO) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#012d1d] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#012d1d]" />
                Seleccionar Horizonte Temporal de Pedido:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {[
                  { days: 7 as PurchaseHorizonDays, label: '7 Días (Semanal)', desc: 'Rápido / Flujo Continuo', icon: Clock },
                  { days: 15 as PurchaseHorizonDays, label: '15 Días (Quincenal)', desc: 'Abastecimiento Regular', icon: Clock },
                  { days: 30 as PurchaseHorizonDays, label: '30 Días (Mensual)', desc: 'Plan Estándar Operativo', icon: Calendar },
                  { days: 90 as PurchaseHorizonDays, label: '90 Días (Trimestral)', desc: 'Cobertura Época Crítica', icon: Boxes },
                  { days: 180 as PurchaseHorizonDays, label: '180 Días (Semestral)', desc: 'Precios por Volumen', icon: Package },
                  { days: 365 as PurchaseHorizonDays, label: '1 Año (Anual)', desc: 'Presupuesto Maestro Hato', icon: Sparkles },
                ].map((item) => {
                  const isSelected = purchaseHorizon === item.days;
                  const IconC = item.icon;
                  return (
                    <button
                      key={item.days}
                      onClick={() => setPurchaseHorizon(item.days)}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between text-left cursor-pointer group ${
                        isSelected
                          ? 'bg-[#012d1d] text-[#ffba38] border-[#012d1d] shadow-md scale-[1.02]'
                          : 'bg-[#f8fdfa] text-[#012d1d] border-[#c1c8c2] hover:border-[#012d1d]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#ffba38] text-[#012d1d]' : 'bg-[#e2efe8] text-[#012d1d]'
                        }`}>
                          {item.days === 365 ? '365 Días' : `${item.days} D`}
                        </span>
                        <IconC className={`w-4 h-4 ${isSelected ? 'text-[#ffba38]' : 'text-[#717973]'}`} />
                      </div>
                      <div className="mt-2">
                        <span className="block font-black text-xs leading-tight">
                          {item.label}
                        </span>
                        <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-[#717973]'}`}>
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parametrization Bar: Animal Head Count & Quick Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#f0f4f1] p-4 rounded-2xl border border-[#c1c8c2]">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#012d1d] block">
                  Carga Total de Bovinos a Suplementar:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={projectedHeadCount}
                    onChange={(e) => setProjectedHeadCount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-[#012d1d] rounded-xl px-3 py-1.5 font-mono text-sm font-black text-[#012d1d]"
                  />
                  <span className="text-xs font-bold text-[#717973] shrink-0">Cabezas</span>
                </div>
              </div>

              <div className="text-center p-2 bg-white rounded-xl border border-[#c1c8c2] flex flex-col justify-center">
                <span className="text-[10px] text-[#717973] uppercase font-bold block">Inversión Estimada Total</span>
                <span className="text-lg font-mono font-black text-amber-900">
                  ${purchaseProjections.totalProjectedCostUSD.toLocaleString()} USD
                </span>
              </div>

              <div className="text-center p-2 bg-white rounded-xl border border-[#c1c8c2] flex flex-col justify-center">
                <span className="text-[10px] text-[#717973] uppercase font-bold block">Volumen Sugerido</span>
                <span className="text-lg font-mono font-black text-emerald-800">
                  {purchaseProjections.totalPackagesToOrder} Bultos ({purchaseProjections.totalTonsToOrder} Ton)
                </span>
              </div>

              <div className="text-center p-2 bg-white rounded-xl border border-[#c1c8c2] flex flex-col justify-center">
                <span className="text-[10px] text-[#717973] uppercase font-bold block">Insumos en Alerta (&lt;7d)</span>
                <span className={`text-lg font-mono font-black ${purchaseProjections.criticalStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {purchaseProjections.criticalStockCount} Críticos
                </span>
              </div>
            </div>

            {/* Filter by Supplier */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#012d1d]">Filtrar por Proveedor:</span>
                <select
                  value={selectedSupplierFilter}
                  onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                  className="bg-[#f8fdfa] border border-[#012d1d] rounded-xl px-3 py-1 text-xs font-bold text-[#012d1d]"
                >
                  <option value="all">Todos los Proveedores</option>
                  <option value="AgroInsumos El Molino">AgroInsumos El Molino</option>
                  <option value="NutriGan del Llano">NutriGan del Llano</option>
                  <option value="Sales Minerales Somex / Ganadería">Sales Minerales Somex</option>
                  <option value="Extractora Palmas del Sol">Extractora Palmas del Sol</option>
                  <option value="Molinos del Oriente">Molinos del Oriente</option>
                </select>
              </div>

              <span className="text-xs text-[#717973] font-medium">
                Consumo diario estimado: {((projectedHeadCount * 1.5) / 1000).toFixed(1)} Ton / día
              </span>
            </div>
          </div>

          {/* DETAILED PURCHASE PROJECTIONS TABLE */}
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <h4 className="font-black text-sm text-[#012d1d] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#012d1d]" />
                Detalle de Requerimientos por Materia Prima ({purchaseHorizon} Días):
              </h4>
              <span className="text-[11px] text-[#717973] font-bold">
                Redondeo automático a bultos comerciales completos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-[#ffba38] font-black uppercase text-[10px]">
                    <th className="p-3 rounded-tl-xl">Materia Prima</th>
                    <th className="p-3 text-center">Stock Actual</th>
                    <th className="p-3 text-center">Consumo Hato/Día</th>
                    <th className="p-3 text-center">Demanda {purchaseHorizon}d</th>
                    <th className="p-3 text-center">Autonomía</th>
                    <th className="p-3 text-center bg-[#03402a] text-[#ffba38]">Pedido Sugerido</th>
                    <th className="p-3 text-center">Precio/Kg</th>
                    <th className="p-3 text-center">Costo Estimado</th>
                    <th className="p-3 rounded-tr-xl">Proveedor Preferido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {purchaseProjections.projections
                    .filter((p) => selectedSupplierFilter === 'all' || p.supplier === selectedSupplierFilter)
                    .map((item) => {
                      return (
                        <tr key={item.materialId} className={`hover:bg-[#f8fdfa] font-medium text-[#012d1d] ${item.isUrgentReorder ? 'bg-amber-50/40' : ''}`}>
                          <td className="p-3">
                            <div className="font-black text-[#012d1d]">{item.materialName}</div>
                            <span className="text-[10px] text-[#717973] font-mono">{item.category} • Bulto {item.packageWeightKg} kg</span>
                          </td>

                          <td className="p-3 text-center font-mono font-bold">
                            {item.currentStockKg.toLocaleString()} kg
                          </td>

                          <td className="p-3 text-center font-mono font-bold text-slate-700">
                            {item.dailyDemandHatoKg} kg/d
                          </td>

                          <td className="p-3 text-center font-mono font-bold text-[#012d1d]">
                            {item.projectedDemandKg.toLocaleString()} kg
                          </td>

                          <td className="p-3 text-center font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                              item.daysOfAutonomy <= 7
                                ? 'bg-rose-100 text-rose-800 border border-rose-300 font-black animate-pulse'
                                : item.daysOfAutonomy <= 15
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {item.daysOfAutonomy > 180 ? '>180 d' : `${item.daysOfAutonomy} días`}
                            </span>
                          </td>

                          <td className="p-3 text-center bg-emerald-50/60 border-x border-emerald-200">
                            <div className="font-mono font-black text-emerald-900 text-sm">
                              {item.suggestedPackages} Bultos
                            </div>
                            <span className="text-[10px] font-mono text-emerald-700 block">
                              ({item.totalOrderKg.toLocaleString()} kg)
                            </span>
                          </td>

                          <td className="p-3 text-center font-mono font-bold text-slate-600">
                            ${item.unitCostPerKgUSD.toFixed(2)}
                          </td>

                          <td className="p-3 text-center font-mono font-black text-amber-900">
                            ${item.totalEstimatedCostUSD.toLocaleString()} USD
                          </td>

                          <td className="p-3 text-xs text-[#525a55]">
                            <span className="font-bold block text-[#012d1d]">{item.supplier}</span>
                            <span className="text-[10px] font-mono text-[#717973]">{item.supplierPhone}</span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: INVENTARIO DE MATERIAS PRIMAS                                   */}
      {/* ========================================================================= */}
      {activeTab === 'inventario_insumos' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <Warehouse className="w-6 h-6 text-[#012d1d]" />
                <div>
                  <h3 className="font-black text-lg text-[#012d1d]">
                    Catálogo de Materias Primas & Precios de Insumos Nutricionales
                  </h3>
                  <p className="text-xs text-[#717973]">
                    Administre los costos unitarios por kg de maíz, soya, sales, melaza y aditivos para actualizar el cálculo automático de dietas.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddIngredientModalOpen(true)}
                className="bg-[#012d1d] hover:bg-[#1b4332] text-[#ffba38] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#ffba38]" />
                Agregar Materia Prima
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-[#ffba38] font-black uppercase text-[10px]">
                    <th className="p-3 rounded-tl-xl">Materia Prima</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3 text-center">Materia Seca (MS %)</th>
                    <th className="p-3 text-center">Proteína Cruda (PC %)</th>
                    <th className="p-3 text-center">TDN %</th>
                    <th className="p-3 text-center">Precio Unitario ($/kg)</th>
                    <th className="p-3 rounded-tr-xl">Notas Zootécnicas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {ingredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-[#f8fdfa] font-medium text-[#012d1d]">
                      <td className="p-3 font-bold text-[#012d1d]">
                        {ing.name}
                      </td>
                      <td className="p-3">
                        <span className="bg-[#012d1d]/10 text-[#012d1d] font-bold px-2 py-0.5 rounded-md uppercase text-[10px]">
                          {ing.category}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#012d1d]">
                        {ing.dryMatterPercent}%
                      </td>
                      <td className="p-3 text-center font-mono font-black text-emerald-800">
                        {ing.crudeProteinPercent}%
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-blue-900">
                        {ing.tdnPercent}%
                      </td>
                      <td className="p-3 text-center font-mono font-black text-amber-900">
                        ${ing.costPerKgUSD.toFixed(2)} USD
                      </td>
                      <td className="p-3 text-[11px] text-[#525a55] max-w-[280px]">
                        {ing.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: BITÁCORA DE DESPACHO & CONSUMO EN COMEDERO                     */}
      {/* ========================================================================= */}
      {activeTab === 'registro_despachos' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] p-5 md:p-6 card-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-[#012d1d]" />
                <div>
                  <h3 className="font-black text-lg text-[#012d1d]">
                    Historial de Despachos y Consumos Netos en Comedero
                  </h3>
                  <p className="text-xs text-[#717973]">
                    Seguimiento diario de kg entregados vs desperdicio/rechazo para evaluar el consumo real por cabeza.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLogDispatchModalOpen(true)}
                className="bg-[#012d1d] hover:bg-[#1b4332] text-[#ffba38] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#ffba38]" />
                Registrar Entrega
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#012d1d] text-[#ffba38] font-black uppercase text-[10px]">
                    <th className="p-3 rounded-tl-xl">Fecha</th>
                    <th className="p-3">Lote & Etapa</th>
                    <th className="p-3">Plan Suplemento</th>
                    <th className="p-3 text-center">Animales</th>
                    <th className="p-3 text-center">kg Entregados</th>
                    <th className="p-3 text-center">Rechazo (kg)</th>
                    <th className="p-3 text-center">Consumo / Cab (kg)</th>
                    <th className="p-3 text-center">Costo Total</th>
                    <th className="p-3 rounded-tr-xl">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {dispatchLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f8fdfa] font-medium text-[#012d1d]">
                      <td className="p-3 font-mono font-bold text-[#012d1d]">
                        {log.date}
                      </td>
                      <td className="p-3 font-bold text-[#012d1d]">
                        {log.lotName}
                      </td>
                      <td className="p-3 text-[11px] text-[#334155]">
                        {log.planName}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {log.animalCount}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#012d1d]">
                        {log.kgOfferedTotal} kg
                      </td>
                      <td className="p-3 text-center font-mono text-rose-700 font-bold">
                        {log.kgRefusalTotal} kg
                      </td>
                      <td className="p-3 text-center font-mono font-black text-emerald-800">
                        {log.kgConsumedPerHead} kg/cab
                      </td>
                      <td className="p-3 text-center font-mono font-black text-amber-900">
                        ${log.costTotalUSD} USD
                      </td>
                      <td className="p-3 text-xs text-[#525a55]">
                        {log.operatorName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FICHA TÉCNICA DETALLADA DEL PLAN DE SUPLEMENTACIÓN               */}
      {/* ========================================================================= */}
      {selectedPlanDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#eeeeee] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#012d1d] text-[#ffba38] flex items-center justify-center font-bold shrink-0">
                  <Wheat className="w-5 h-5 text-[#ffba38]" />
                </div>
                <div>
                  <span className="bg-[#012d1d] text-[#ffba38] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase">
                    {selectedPlanDetail.stageLabel}
                  </span>
                  <h3 className="font-black text-lg text-[#012d1d] mt-1">
                    {selectedPlanDetail.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanDetail(null)}
                className="text-[#717973] hover:text-black p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-[#525a55] leading-relaxed font-medium">
                {selectedPlanDetail.description}
              </p>

              <div className="grid grid-cols-3 gap-3 bg-[#f0f4f1] p-3 rounded-2xl text-center border border-[#c1c8c2]">
                <div>
                  <span className="text-[10px] font-bold text-[#717973] uppercase block">Proteína Cruda</span>
                  <span className="text-base font-mono font-black text-[#012d1d]">{selectedPlanDetail.crudeProteinPercent}% PC</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#717973] uppercase block">Ganancia Diaria (GDP)</span>
                  <span className="text-base font-mono font-black text-emerald-800">+{selectedPlanDetail.targetGDPGrams} g/día</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#717973] uppercase block">Costo / Animal / Día</span>
                  <span className="text-base font-mono font-black text-amber-900">${selectedPlanDetail.costPerHeadDayUSD.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Composition Table */}
              <div className="space-y-2">
                <h5 className="font-black text-[#012d1d] uppercase text-[11px]">
                  Fórmula y Composición de la Ración (por Tonelada):
                </h5>
                <div className="overflow-x-auto border border-[#c1c8c2] rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#012d1d] text-[#ffba38] font-black uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Ingrediente</th>
                        <th className="p-2 text-center">% Inclusión</th>
                        <th className="p-2 text-center">kg por Tonelada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee]">
                      {selectedPlanDetail.formula.map((f) => (
                        <tr key={f.ingredientId}>
                          <td className="p-2 font-bold text-[#012d1d]">{f.ingredientName}</td>
                          <td className="p-2 text-center font-mono font-bold text-emerald-800">{f.percentageInclusion}%</td>
                          <td className="p-2 text-center font-mono font-bold">{f.kgPerTon} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                <h5 className="font-black text-amber-950 uppercase text-[10.5px]">Recomendaciones de Manejo en Comedero:</h5>
                <ul className="space-y-1 text-amber-900">
                  {selectedPlanDetail.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="font-bold">✓</span> {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#eeeeee] flex justify-end">
                <button
                  onClick={() => setSelectedPlanDetail(null)}
                  className="px-5 py-2 bg-[#012d1d] text-[#ffba38] rounded-xl font-black hover:bg-[#1b4332] cursor-pointer"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREAR NUEVO PLAN DE SUPLEMENTACIÓN                               */}
      {/* ========================================================================= */}
      {isAddPlanModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4">
              <h3 className="font-black text-lg text-[#012d1d] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#012d1d]" />
                Crear Nuevo Plan de Suplementación Custom
              </h3>
              <button onClick={() => setIsAddPlanModalOpen(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Nombre del Plan *:</label>
                <input
                  type="text"
                  placeholder="ej: Plan Levante Alto Impacto Proteico"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Etapa Productiva *:</label>
                  <select
                    value={newPlanStage}
                    onChange={(e) => setNewPlanStage(e.target.value as SupplementStage)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  >
                    <option value="cria">Cría / Creep Feeding</option>
                    <option value="levante">Levante (140-280 kg)</option>
                    <option value="preceba">Preceba (280-380 kg)</option>
                    <option value="ceba">Ceba / Engorde (380-530 kg)</option>
                    <option value="crianza_artificial">Crianza Artificial (0-60d)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">GDP Meta (g/día):</label>
                  <input
                    type="number"
                    step="50"
                    value={newPlanTargetGDP}
                    onChange={(e) => setNewPlanTargetGDP(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Dosis Recomendada (kg/cab/día):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPlanDoseKg}
                    onChange={(e) => setNewPlanDoseKg(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">% Consumo del Peso Vivo (% PV):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPlanInclusionBW}
                    onChange={(e) => setNewPlanInclusionBW(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Descripción / Objetivo Zootécnico:</label>
                <textarea
                  rows={2}
                  placeholder="Describa el objetivo principal del suplemento..."
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl p-2.5 font-medium text-[#012d1d]"
                />
              </div>

              <div className="pt-3 border-t border-[#eeeeee] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlanModalOpen(false)}
                  className="px-4 py-2 border border-[#c1c8c2] rounded-xl font-bold text-[#717973]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-[#ffba38] rounded-xl font-black hover:bg-[#1b4332] shadow-md cursor-pointer"
                >
                  Guardar Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTRAR DESPACHO DIARIO                                       */}
      {/* ========================================================================= */}
      {isLogDispatchModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <h3 className="font-black text-base text-[#012d1d] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#012d1d]" />
                Registrar Despacho en Comedero
              </h3>
              <button onClick={() => setIsLogDispatchModalOpen(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogDispatch} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Lote de Ganado:</label>
                <input
                  type="text"
                  value={dispLotName}
                  onChange={(e) => setDispLotName(e.target.value)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Cabezas en Lote:</label>
                  <input
                    type="number"
                    value={dispCount}
                    onChange={(e) => setDispCount(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">kg Ofrecidos Total:</label>
                  <input
                    type="number"
                    value={dispOfferedKg}
                    onChange={(e) => setDispOfferedKg(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Rechazo en Comedero (kg):</label>
                <input
                  type="number"
                  value={dispRefusalKg}
                  onChange={(e) => setDispRefusalKg(Number(e.target.value))}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Operador / Vaquero:</label>
                <input
                  type="text"
                  value={dispOperator}
                  onChange={(e) => setDispOperator(e.target.value)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                />
              </div>

              <div className="pt-3 border-t border-[#eeeeee] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogDispatchModalOpen(false)}
                  className="px-4 py-2 border border-[#c1c8c2] rounded-xl font-bold text-[#717973]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-[#ffba38] rounded-xl font-black hover:bg-[#1b4332] shadow-md cursor-pointer"
                >
                  Guardar Despacho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: AGREGAR MATERIA PRIMA A INVENTARIO                              */}
      {/* ========================================================================= */}
      {isAddIngredientModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#012d1d] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
              <h3 className="font-black text-base text-[#012d1d] flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-[#012d1d]" />
                Agregar Materia Prima a Inventario
              </h3>
              <button onClick={() => setIsAddIngredientModalOpen(false)} className="text-[#717973] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIngredient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#012d1d] block mb-1">Nombre Insumo *:</label>
                <input
                  type="text"
                  placeholder="ej: Afrecho de Arroz o Pulpa de Cítricos"
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Categoría:</label>
                  <select
                    value={newIngCategory}
                    onChange={(e) => setNewIngCategory(e.target.value as any)}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-bold text-[#012d1d]"
                  >
                    <option value="energetico">Energético</option>
                    <option value="proteico">Proteico</option>
                    <option value="mineral">Mineral</option>
                    <option value="fibra_forraje">Fibra / Forraje</option>
                    <option value="aditivo">Aditivo</option>
                    <option value="lacteo">Lácteo</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">Costo Unitario ($/kg):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-[#012d1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">MS %:</label>
                  <input
                    type="number"
                    value={newIngDM}
                    onChange={(e) => setNewIngDM(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-2 py-1.5 font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">PC %:</label>
                  <input
                    type="number"
                    value={newIngCP}
                    onChange={(e) => setNewIngCP(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-2 py-1.5 font-mono text-center font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#012d1d] block mb-1">TDN %:</label>
                  <input
                    type="number"
                    value={newIngTDN}
                    onChange={(e) => setNewIngTDN(Number(e.target.value))}
                    className="w-full bg-[#f8f9f8] border border-[#c1c8c2] rounded-xl px-2 py-1.5 font-mono text-center font-bold text-blue-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#eeeeee] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddIngredientModalOpen(false)}
                  className="px-4 py-2 border border-[#c1c8c2] rounded-xl font-bold text-[#717973]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#012d1d] text-[#ffba38] rounded-xl font-black hover:bg-[#1b4332] shadow-md cursor-pointer"
                >
                  Guardar Materia Prima
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
