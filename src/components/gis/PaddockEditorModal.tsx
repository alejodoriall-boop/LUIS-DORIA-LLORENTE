import React, { useState } from 'react';
import { PaddockGeo } from '../../types';
import { X, Save, Edit3, Plus, Droplets, Mountain, FlaskConical, Layers } from 'lucide-react';

interface PaddockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  paddock: PaddockGeo | null;
  onSave: (paddock: PaddockGeo) => void;
}

const PASTURE_SPECIES = [
  'Brachiaria Brizantha cv. Marandú',
  'Brachiaria Decumbens + Leguminosa Kudzú',
  'Brachiaria Humidicola (Tolerante Humedad)',
  'Panicum Maximum cv. Mombasa',
  'Panicum Maximum cv. Tanzania',
  'Pasto Estrella Africana (Cynodon nlemfuensis)',
  'Híbrido Mulato II (Brachiaria)',
  'Tanzania + Banco de Leucaena (SSP)',
  'Brachiaria + Teca y Guácimo (Silvopastoril)',
  'Pasto Pangola (Digitaria eriantha)',
  'Pasto Guinea Común (Megathyrsus maximus)',
  'Grama Nativa y Pajonales',
];

const SOIL_TYPES = [
  'Franco Arcilloso',
  'Franco Arenoso',
  'Franco Limoso Fértil',
  'Vertisol Arcilloso Pesado',
  'Aluvial Fértil (Vega de Río)',
  'Oxisol Ácido de Ladera',
  'Franco Neutro Fértil',
];

export const PaddockEditorModal: React.FC<PaddockEditorModalProps> = ({
  isOpen,
  onClose,
  paddock,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<PaddockGeo>>({
    id: paddock?.id || `pot-${Date.now()}`,
    code: paddock?.code || `POT-${Math.floor(Math.random() * 90 + 10)}`,
    name: paddock?.name || 'Nuevo Potrero',
    color: paddock?.color || '#2d6a4f',
    areaHa: paddock?.areaHa || 15.0,
    areaM2: paddock?.areaM2 || 150000,
    perimeterM: paddock?.perimeterM || 1600,
    fenceType: paddock?.fenceType || 'electrica',
    pastureType: paddock?.pastureType || PASTURE_SPECIES[0],
    pastureCondition: paddock?.pastureCondition || 'bueno',
    topography: paddock?.topography || 'plana',
    avgSlopePct: paddock?.avgSlopePct || 2.5,
    elevationMsnm: paddock?.elevationMsnm || 130,
    isFloodProne: paddock?.isFloodProne || false,
    floodRisk: paddock?.floodRisk || 'ninguno',
    drainageChannel: paddock?.drainageChannel || false,
    forageYieldKgM2: paddock?.forageYieldKgM2 || 3.5,
    forageTotalTon: paddock?.forageTotalTon || 525,
    dryMatterPct: paddock?.dryMatterPct || 20,
    grazingEfficiencyPct: paddock?.grazingEfficiencyPct || 65,
    residualHeightCm: paddock?.residualHeightCm || 12,
    restDaysTarget: paddock?.restDaysTarget || 30,
    occupancyDaysTarget: paddock?.occupancyDaysTarget || 2,
    carryingCapacityUGG: paddock?.carryingCapacityUGG || 45,
    carryingCapacityUGGPerHa: paddock?.carryingCapacityUGGPerHa || 3.0,
    maxHeadsRecommended: paddock?.maxHeadsRecommended || 50,
    status: paddock?.status || 'descanso',
    waterAccess: paddock?.waterAccess ?? true,
    waterSource: paddock?.waterSource || 'bebedero_gravedad',
    waterTroughDistanceM: paddock?.waterTroughDistanceM || 60,
    troughCapacityLiters: paddock?.troughCapacityLiters || 2000,
    flowRateLpm: paddock?.flowRateLpm || 30,
    soilAnalysis: paddock?.soilAnalysis || {
      soilType: 'Franco Arcilloso',
      ph: 6.0,
      organicMatterPct: 4.2,
      phosphorusPpm: 18.0,
      potassiumMeq: 0.35,
      cationExchangeCap: 22.0,
      aluminumSaturationPct: 4.0,
      fertilityLevel: 'media',
      limingRecommendationTonHa: 0.5,
      fertilizerRecommendation: 'Mantenimiento con 50 kg/ha N tras rotación',
    },
    polygon: paddock?.polygon || [
      { lat: 8.755, lng: -75.875 },
      { lat: 8.758, lng: -75.872 },
      { lat: 8.753, lng: -75.869 },
      { lat: 8.751, lng: -75.873 },
    ],
    notes: paddock?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as PaddockGeo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow max-w-2xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1b4332] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#012d1d] border border-[#2d6a4f] flex items-center justify-center text-[#ffba38]">
              {paddock ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">
                {paddock ? `Editar Ficha: ${paddock.name}` : 'Crear Nuevo Potrero'}
              </h3>
              <p className="text-xs text-[#86af99]">Parámetros agronómicos, topográficos y de suelo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f9f9f9]">
          {/* General Identification */}
          <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow space-y-4">
            <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider">
              1. Identificación & Superficie
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Código Potrero
                </label>
                <input
                  type="text"
                  required
                  value={formData.code ?? ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Nombre del Potrero
                </label>
                <input
                  type="text"
                  required
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Área (Ha)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.areaHa ?? 15.0}
                  onChange={(e) => {
                    const ha = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      areaHa: ha,
                      areaM2: ha * 10000,
                    });
                  }}
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Perímetro (m)
                </label>
                <input
                  type="number"
                  value={formData.perimeterM ?? 1600}
                  onChange={(e) =>
                    setFormData({ ...formData, perimeterM: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Tipo de Cerca
                </label>
                <select
                  value={formData.fenceType ?? 'electrica'}
                  onChange={(e) =>
                    setFormData({ ...formData, fenceType: e.target.value as any })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                >
                  <option value="electrica">Cerca Eléctrica</option>
                  <option value="puas">Alambre de Púas</option>
                  <option value="viva">Cerca Viva</option>
                  <option value="malla">Malla Ganadera</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Color Mapa
                </label>
                <input
                  type="color"
                  value={formData.color ?? '#22c55e'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-9 bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl p-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Pasture & Forage Yield */}
          <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow space-y-4">
            <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
              <span>🌾</span> 2. Pastura & Aforo Inicial
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Especie Forrajera
                </label>
                <select
                  value={formData.pastureType ?? PASTURE_SPECIES[0]}
                  onChange={(e) => setFormData({ ...formData, pastureType: e.target.value })}
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                >
                  {PASTURE_SPECIES.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Condición del Pasto
                </label>
                <select
                  value={formData.pastureCondition ?? 'bueno'}
                  onChange={(e) =>
                    setFormData({ ...formData, pastureCondition: e.target.value as any })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                >
                  <option value="excelente">Excelente (Denso, sin malezas)</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular (Requiere fertilización)</option>
                  <option value="degradado">Degradado (Sobrepastoreado)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Aforo (kg/m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.forageYieldKgM2 ?? 3.5}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      forageYieldKgM2: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Días Ocupación
                </label>
                <input
                  type="number"
                  value={formData.occupancyDaysTarget ?? 2}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      occupancyDaysTarget: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Días Descanso
                </label>
                <input
                  type="number"
                  value={formData.restDaysTarget ?? 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      restDaysTarget: parseInt(e.target.value) || 30,
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>
            </div>
          </div>

          {/* Topography & Soil Survey */}
          <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow space-y-4">
            <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-amber-600" />
              3. Topografía & Suelo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Topografía
                </label>
                <select
                  value={formData.topography ?? 'plana'}
                  onChange={(e) =>
                    setFormData({ ...formData, topography: e.target.value as any })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                >
                  <option value="plana">Plana (0 - 3%)</option>
                  <option value="ondulada">Ondulada (4 - 12%)</option>
                  <option value="ladera_suave">Ladera Suave (13 - 25%)</option>
                  <option value="escarpada">Escarpada (&gt;25%)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Elevación (msnm)
                </label>
                <input
                  type="number"
                  value={formData.elevationMsnm ?? 130}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      elevationMsnm: parseInt(e.target.value) || 100,
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Inundabilidad
                </label>
                <select
                  value={formData.floodRisk ?? 'ninguno'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floodRisk: e.target.value as any,
                      isFloodProne: e.target.value !== 'ninguno',
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                >
                  <option value="ninguno">No Inundable</option>
                  <option value="bajo">Riesgo Bajo</option>
                  <option value="medio">Riesgo Medio (Encharcamiento)</option>
                  <option value="alto">Riesgo Alto (Bajo Húmedo)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#eeeeee]">
              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Tipo de Suelo
                </label>
                <select
                  value={formData.soilAnalysis?.soilType ?? 'Franco Arcilloso'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      soilAnalysis: {
                        soilType: e.target.value,
                        ph: formData.soilAnalysis?.ph ?? 6.0,
                        organicMatterPct: formData.soilAnalysis?.organicMatterPct ?? 4.2,
                        phosphorusPpm: formData.soilAnalysis?.phosphorusPpm ?? 18.0,
                        potassiumMeq: formData.soilAnalysis?.potassiumMeq ?? 0.35,
                        cationExchangeCap: formData.soilAnalysis?.cationExchangeCap ?? 22.0,
                        aluminumSaturationPct: formData.soilAnalysis?.aluminumSaturationPct ?? 4.0,
                        fertilityLevel: formData.soilAnalysis?.fertilityLevel ?? 'media',
                        limingRecommendationTonHa: formData.soilAnalysis?.limingRecommendationTonHa ?? 0.5,
                        fertilizerRecommendation: formData.soilAnalysis?.fertilizerRecommendation ?? 'Mantenimiento con 50 kg/ha N tras rotación',
                      },
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                >
                  {SOIL_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  pH del Suelo
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.soilAnalysis?.ph ?? 6.0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      soilAnalysis: {
                        soilType: formData.soilAnalysis?.soilType ?? 'Franco Arcilloso',
                        ph: parseFloat(e.target.value) || 6.0,
                        organicMatterPct: formData.soilAnalysis?.organicMatterPct ?? 4.2,
                        phosphorusPpm: formData.soilAnalysis?.phosphorusPpm ?? 18.0,
                        potassiumMeq: formData.soilAnalysis?.potassiumMeq ?? 0.35,
                        cationExchangeCap: formData.soilAnalysis?.cationExchangeCap ?? 22.0,
                        aluminumSaturationPct: formData.soilAnalysis?.aluminumSaturationPct ?? 4.0,
                        fertilityLevel: formData.soilAnalysis?.fertilityLevel ?? 'media',
                        limingRecommendationTonHa: formData.soilAnalysis?.limingRecommendationTonHa ?? 0.5,
                        fertilizerRecommendation: formData.soilAnalysis?.fertilizerRecommendation ?? 'Mantenimiento con 50 kg/ha N tras rotación',
                      },
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Materia Orgánica %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.soilAnalysis?.organicMatterPct ?? 4.2}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      soilAnalysis: {
                        soilType: formData.soilAnalysis?.soilType ?? 'Franco Arcilloso',
                        ph: formData.soilAnalysis?.ph ?? 6.0,
                        organicMatterPct: parseFloat(e.target.value) || 4.0,
                        phosphorusPpm: formData.soilAnalysis?.phosphorusPpm ?? 18.0,
                        potassiumMeq: formData.soilAnalysis?.potassiumMeq ?? 0.35,
                        cationExchangeCap: formData.soilAnalysis?.cationExchangeCap ?? 22.0,
                        aluminumSaturationPct: formData.soilAnalysis?.aluminumSaturationPct ?? 4.0,
                        fertilityLevel: formData.soilAnalysis?.fertilityLevel ?? 'media',
                        limingRecommendationTonHa: formData.soilAnalysis?.limingRecommendationTonHa ?? 0.5,
                        fertilizerRecommendation: formData.soilAnalysis?.fertilizerRecommendation ?? 'Mantenimiento con 50 kg/ha N tras rotación',
                      },
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>
            </div>
          </div>

          {/* Water Infrastructure */}
          <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow space-y-4">
            <h4 className="font-bold text-xs text-[#012d1d] uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-600" />
              4. Acueducto & Bebederos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Fuente de Agua
                </label>
                <select
                  value={formData.waterSource ?? 'bebedero_gravedad'}
                  onChange={(e) =>
                    setFormData({ ...formData, waterSource: e.target.value as any })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-bold text-[#012d1d]"
                >
                  <option value="bebedero_gravedad">Bebedero por Gravedad</option>
                  <option value="bebedero_bomba">Bebedero por Bombeo Solar</option>
                  <option value="reservorio">Reservorio / Jagüey Cercado</option>
                  <option value="quebrada">Quebrada Natural Protegida</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Capacidad Bebedero (L)
                </label>
                <input
                  type="number"
                  value={formData.troughCapacityLiters ?? 2000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      troughCapacityLiters: parseInt(e.target.value) || 2000,
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#717973] uppercase block mb-1">
                  Distancia Máx al Agua (m)
                </label>
                <input
                  type="number"
                  value={formData.waterTroughDistanceM ?? 60}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waterTroughDistanceM: parseInt(e.target.value) || 80,
                    })
                  }
                  className="w-full bg-[#f3f3f3] border border-[#c1c8c2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#012d1d]"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-[#eeeeee] p-4 border-t border-[#c1c8c2] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#c1c8c2] text-xs font-bold text-[#414844] hover:bg-white transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-bold text-xs md:text-sm px-6 py-2.5 rounded-xl tactical-shadow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {paddock ? 'Guardar Cambios' : 'Crear Potrero'}
          </button>
        </div>
      </div>
    </div>
  );
};
