import React, { useState } from 'react';
import {
  CategoryTransitionAlert,
  CategoryProgressionRule,
  ImportedAnimalRecord,
  LotRecord,
} from '../../types';
import {
  Sparkles,
  X,
  CheckCircle2,
  XCircle,
  Scale,
  Calendar,
  Layers,
  Sliders,
  AlertTriangle,
  Plus,
  Trash2,
  Flame,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CategoryTransitionApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: CategoryTransitionAlert[];
  rules: CategoryProgressionRule[];
  animals: ImportedAnimalRecord[];
  lots: LotRecord[];
  onApproveTransition: (
    alertId: string,
    animalId: string,
    newCategory: string,
    targetLotId?: string,
  ) => void;
  onRejectTransition: (alertId: string) => void;
  onApproveAllPending: () => void;
  onSaveRules: (updatedRules: CategoryProgressionRule[]) => void;
}

export const CategoryTransitionApprovalModal: React.FC<CategoryTransitionApprovalModalProps> = ({
  isOpen,
  onClose,
  alerts,
  rules,
  animals,
  lots,
  onApproveTransition,
  onRejectTransition,
  onApproveAllPending,
  onSaveRules,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'rules' | 'history'>('pending');
  const [editingRules, setEditingRules] = useState<CategoryProgressionRule[]>(rules);
  const [selectedTargetLots, setSelectedTargetLots] = useState<Record<string, string>>({});
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingAlerts = alerts.filter((a) => a.status === 'pending');
  const processedAlerts = alerts.filter((a) => a.status !== 'pending');

  const handleApprove = (alert: CategoryTransitionAlert) => {
    const targetLotId = selectedTargetLots[alert.id];
    onApproveTransition(alert.id, alert.animalId, alert.targetCategory, targetLotId);
    
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
    });

    setBannerMsg(`✅ Categoria del animal #${alert.animalTag} actualizada con éxito a '${alert.targetCategoryLabel}'.`);
    setTimeout(() => setBannerMsg(null), 4000);
  };

  const handleApproveAll = () => {
    onApproveAllPending();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
    });
    setBannerMsg(`🎉 Se han aprobado todas las ${pendingAlerts.length} reclasificaciones pendientes.`);
    setTimeout(() => setBannerMsg(null), 5000);
  };

  const handleSaveRuleChanges = () => {
    onSaveRules(editingRules);
    setBannerMsg('⚙️ Parámetros de reglas de peso y edad guardados correctamente.');
    setTimeout(() => setBannerMsg(null), 4000);
  };

  const handleUpdateRuleValue = (
    ruleId: string,
    field: 'minWeightKg' | 'minAgeMonths' | 'isActive',
    val: any,
  ) => {
    setEditingRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, [field]: val } : r)),
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#012d1d]/20 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#012d1d] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#1b4332]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ffba38] text-[#523700] rounded-2xl shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Reclasificación Automática por Peso y Edad
                </h3>
                {pendingAlerts.length > 0 && (
                  <span className="bg-[#ff4d4d] text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-full animate-pulse">
                    {pendingAlerts.length} PENDIENTES
                  </span>
                )}
              </div>
              <p className="text-xs text-[#a3b8ad] font-medium mt-0.5">
                Regla de progresión: El primero que ocurra (Peso en báscula O Edad) notifica para aprobación administrativa.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#a3b8ad] hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Notification Banner */}
        {bannerMsg && (
          <div className="bg-[#e8f5ec] border-b border-[#c1ecd4] px-4 py-2.5 text-xs text-[#002114] font-bold flex items-center justify-between animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2d6a4f]" />
              <span>{bannerMsg}</span>
            </div>
            <button onClick={() => setBannerMsg(null)} className="text-[#002114] hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="bg-[#f4f6f4] px-4 sm:px-6 pt-3 border-b border-[#e0e4e0] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 px-3.5 font-extrabold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'pending'
                  ? 'border-[#012d1d] text-[#012d1d]'
                  : 'border-transparent text-[#717973] hover:text-[#012d1d]'
              }`}
            >
              <Zap className="w-4 h-4 text-[#ffba38]" />
              <span>Solicitudes Pendientes</span>
              {pendingAlerts.length > 0 && (
                <span className="bg-[#012d1d] text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full">
                  {pendingAlerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`pb-3 px-3.5 font-extrabold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'rules'
                  ? 'border-[#012d1d] text-[#012d1d]'
                  : 'border-transparent text-[#717973] hover:text-[#012d1d]'
              }`}
            >
              <Sliders className="w-4 h-4 text-[#1b4332]" />
              <span>Parámetros de Reglas (Pesos & Edades)</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-3.5 font-extrabold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-[#012d1d] text-[#012d1d]'
                  : 'border-transparent text-[#717973] hover:text-[#012d1d]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#2d6a4f]" />
              <span>Historial de Aprobaciones</span>
              <span className="text-[10px] text-[#717973]">({processedAlerts.length})</span>
            </button>
          </div>

          {activeTab === 'pending' && pendingAlerts.length > 1 && (
            <button
              onClick={handleApproveAll}
              className="mb-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
            >
              <CheckCheck className="w-4 h-4 text-[#c1ecd4]" />
              <span>Aprobar Todos ({pendingAlerts.length})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PENDING TRANSITIONS FOR APPROVAL */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingAlerts.length === 0 ? (
                <div className="bg-[#f8fcf9] p-8 rounded-3xl border-2 border-dashed border-[#c1ecd4] text-center space-y-3">
                  <div className="p-3 bg-[#e8f5ec] text-[#1b4332] rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#2d6a4f]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#012d1d] text-sm">
                      ¡Inventario Ganadero al Día!
                    </h4>
                    <p className="text-xs text-[#717973] max-w-md mx-auto mt-1">
                      No hay animales con pesajes o edades pendientes de reclasificación en este momento. El sistema continuará evaluando cada control de pesaje y cambio de fecha.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-[#fff8e7] p-3 rounded-2xl border border-[#ffe082] text-xs text-[#523700] flex items-center justify-between">
                    <span className="font-medium">
                      💡 Revise el cumplimiento de peso o edad y apruebe el paso de categoría (ej. Levante ➔ Ceba).
                    </span>
                    <span className="font-mono font-bold text-[10px] bg-[#ffba38] px-2 py-0.5 rounded">
                      REGLA AUTOMÁTICA OCURRIDA
                    </span>
                  </div>

                  {pendingAlerts.map((alert) => {
                    const animal = animals.find((a) => a.id === alert.animalId);
                    const matchingLots = lots.filter(
                      (l) => l.category.toLowerCase() === alert.targetCategory.toLowerCase() || l.category === 'ceba',
                    );

                    return (
                      <div
                        key={alert.id}
                        className="bg-white p-4 rounded-2xl border-2 border-[#1b4332]/30 shadow-xs hover:border-[#1b4332] transition-all space-y-3"
                      >
                        {/* Top info bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e0e4e0] pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="bg-[#012d1d] text-white font-mono font-black text-xs px-2.5 py-1 rounded-xl shadow-2xs">
                              #{alert.animalTag}
                            </span>
                            <div>
                              <span className="font-extrabold text-[#012d1d] text-sm block">
                                {alert.animalName || `Ejemplar #${alert.animalTag}`} ({alert.breed || 'Bovino'}, {alert.sex})
                              </span>
                              <span className="text-[10.5px] text-[#717973]">
                                Predio: {alert.farmName || 'Finca Principal'} | Lote Actual: {alert.lotCode || 'Lote General'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {alert.triggerType === 'peso' && (
                              <span className="bg-[#e8f5ec] text-[#1b5e20] text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-lg border border-[#a5d6a7] flex items-center gap-1">
                                <Scale className="w-3.5 h-3.5 text-[#2e7d32]" /> PESO ALCANZADO ({alert.currentWeightKg} kg)
                              </span>
                            )}
                            {alert.triggerType === 'edad' && (
                              <span className="bg-[#e3f2fd] text-[#0d47a1] text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-lg border border-[#90caf9] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#1565c0]" /> EDAD ALCANZADA ({alert.currentAgeMonths}m)
                              </span>
                            )}
                            {alert.triggerType === 'ambos' && (
                              <span className="bg-[#fff3cd] text-[#8c6500] text-[10.5px] font-bold font-mono px-2.5 py-1 rounded-lg border border-[#ffe082] flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-[#ff8f00]" /> AMBOS CRITERIOS CUMPLIDOS
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Transition visual arrow */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-[#f8fdf9] p-3 rounded-xl border border-[#c1ecd4]">
                          {/* Current Category */}
                          <div className="bg-white p-2.5 rounded-xl border border-[#c1c8c2] text-center">
                            <span className="text-[9.5px] font-bold text-[#717973] uppercase block">Categoría Actual</span>
                            <span className="font-extrabold text-[#012d1d] text-xs capitalize mt-0.5 block">
                              {alert.currentCategory}
                            </span>
                          </div>

                          {/* Arrow */}
                          <div className="text-center flex flex-col items-center justify-center">
                            <ArrowRight className="w-5 h-5 text-[#1b4332] animate-pulse" />
                            <span className="text-[9.5px] font-extrabold text-[#1b4332] mt-0.5">Pase Automático Requerido</span>
                          </div>

                          {/* Target Proposed Category */}
                          <div className="bg-[#1b4332] text-white p-2.5 rounded-xl text-center shadow-xs">
                            <span className="text-[9.5px] font-bold text-[#c1ecd4] uppercase block">Nueva Categoría Propuesta</span>
                            <span className="font-extrabold text-sm text-white mt-0.5 block">
                              {alert.targetCategoryLabel}
                            </span>
                          </div>
                        </div>

                        {/* Reason detailed description */}
                        <div className="bg-[#f4f6f4] p-2.5 rounded-xl border border-[#e0e4e0] text-xs text-[#012d1d] font-medium flex items-center justify-between">
                          <span>{alert.triggerReason}</span>
                          <span className="text-[10px] text-[#717973] font-mono">Detención: {alert.detectedDate}</span>
                        </div>

                        {/* Actions & Target Lot option */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <label className="text-[10.5px] font-bold text-[#717973]">Reasignar Lote (Opcional):</label>
                            <select
                              value={selectedTargetLots[alert.id] || ''}
                              onChange={(e) =>
                                setSelectedTargetLots((prev) => ({ ...prev, [alert.id]: e.target.value }))
                              }
                              className="bg-white border border-[#c1c8c2] rounded-lg px-2.5 py-1 text-xs font-bold text-[#012d1d]"
                            >
                              <option value="">Mantener Lote Actual ({alert.lotCode || 'Sin Lote'})</option>
                              {matchingLots.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.code} - {l.name} ({l.category})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onRejectTransition(alert.id)}
                              className="px-3.5 py-1.5 bg-[#f5f5f5] hover:bg-[#ffebee] text-[#c62828] font-bold text-xs rounded-xl border border-[#ef9a9a] transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Rechazar</span>
                            </button>

                            <button
                              onClick={() => handleApprove(alert)}
                              className="px-4 py-1.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-extrabold text-xs rounded-xl border border-[#012d1d] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#c1ecd4]" />
                              <span>Aprobar Cambio de Categoría</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RULES PARAMETERS CONFIGURATION */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="bg-[#e8f5ec] p-3.5 rounded-2xl border border-[#c1ecd4] text-xs text-[#002114] space-y-1">
                <h4 className="font-extrabold flex items-center gap-2 text-[#012d1d]">
                  <Sliders className="w-4 h-4 text-[#1b4332]" /> Configuración de Umbrales por Categoria
                </h4>
                <p className="text-[11.5px] text-[#2d6a4f]">
                  Defina el peso mínimo (kg) y la edad mínima (meses) para que el sistema active automáticamente la alerta de transición. La regla se evalúa con el criterio que se cumpla primero.
                </p>
              </div>

              <div className="space-y-3">
                {editingRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                      rule.isActive
                        ? 'bg-white border-[#1b4332]/40 shadow-2xs'
                        : 'bg-[#fafafa] border-[#e0e0e0] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#e0e4e0] pb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          onChange={(e) =>
                            handleUpdateRuleValue(rule.id, 'isActive', e.target.checked)
                          }
                          className="w-4 h-4 accent-[#012d1d] rounded cursor-pointer"
                        />
                        <span className="font-black text-xs text-[#012d1d]">{rule.ruleName}</span>
                      </div>
                      <span className="text-[10px] font-mono font-extrabold bg-[#f0f4f1] text-[#012d1d] px-2 py-0.5 rounded border border-[#c1c8c2]">
                        Aplica a Sexo: {rule.sexFilter?.toUpperCase() || 'TODOS'}
                      </span>
                    </div>

                    <p className="text-xs text-[#717973]">{rule.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-[#f4f6f4] p-3 rounded-xl border border-[#e0e4e0]">
                        <label className="block text-[10px] font-extrabold text-[#012d1d] uppercase mb-1 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-[#1b4332]" /> Peso Mínimo Requerido (kg) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={rule.minWeightKg}
                            onChange={(e) =>
                              handleUpdateRuleValue(
                                rule.id,
                                'minWeightKg',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full bg-white border border-[#012d1d] rounded-lg px-3 py-1.5 font-mono font-extrabold text-sm text-[#012d1d]"
                          />
                          <span className="absolute right-3 top-2 text-xs font-bold text-[#717973]">kg</span>
                        </div>
                      </div>

                      <div className="bg-[#f4f6f4] p-3 rounded-xl border border-[#e0e4e0]">
                        <label className="block text-[10px] font-extrabold text-[#012d1d] uppercase mb-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#1b4332]" /> Edad Mínima Requerida (Meses) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={rule.minAgeMonths}
                            onChange={(e) =>
                              handleUpdateRuleValue(
                                rule.id,
                                'minAgeMonths',
                                parseInt(e.target.value, 10) || 0,
                              )
                            }
                            className="w-full bg-white border border-[#012d1d] rounded-lg px-3 py-1.5 font-mono font-extrabold text-sm text-[#012d1d]"
                          />
                          <span className="absolute right-3 top-2 text-xs font-bold text-[#717973]">meses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveRuleChanges}
                  className="bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#c1ecd4]" />
                  <span>Guardar Cambios de Parámetros</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PROCESSED APPROVALS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {processedAlerts.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#717973] bg-[#f8f8f8] rounded-2xl border border-dashed border-[#e0e0e0]">
                  Aún no hay aprobaciones o rechazos registrados en el historial de esta sesión.
                </div>
              ) : (
                processedAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 bg-white rounded-xl border border-[#e0e4e0] text-xs flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-extrabold bg-[#012d1d] text-white px-2 py-0.5 rounded">
                        #{a.animalTag}
                      </span>
                      <div>
                        <span className="font-bold text-[#012d1d]">
                          {a.animalName || `Animal #${a.animalTag}`} ➔ {a.targetCategoryLabel}
                        </span>
                        <span className="text-[10.5px] text-[#717973] block">
                          {a.triggerReason}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#717973] font-mono">{a.detectedDate}</span>
                      {a.status === 'approved' ? (
                        <span className="bg-[#e8f5ec] text-[#1b5e20] text-[10px] font-bold px-2 py-0.5 rounded-lg border border-[#a5d6a7] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#2e7d32]" /> APROBADO
                        </span>
                      ) : (
                        <span className="bg-[#ffebee] text-[#c62828] text-[10px] font-bold px-2 py-0.5 rounded-lg border border-[#ef9a9a] flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-[#c62828]" /> RECHAZADO
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f4f6f4] p-4 border-t border-[#e0e4e0] flex items-center justify-between text-xs text-[#717973]">
          <span className="font-medium">
            Regla Ganadera Automatizada v2.4 | Aprobación Obligatoria del Administrador
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#c1c8c2] text-[#012d1d] font-bold rounded-xl hover:bg-[#e0e4e0] transition-colors cursor-pointer"
          >
            Cerrar Modal
          </button>
        </div>
      </div>
    </div>
  );
};
