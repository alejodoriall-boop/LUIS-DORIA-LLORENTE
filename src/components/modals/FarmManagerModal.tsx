import React, { useState } from 'react';
import { FarmDataPackage } from '../../types';
import { safeConfirm } from '../../utils/printUtils';
import {
  X,
  PlusCircle,
  Building,
  Check,
  MapPin,
  Compass,
  Edit3,
  Trash2,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Power,
  ShieldAlert,
  CheckCircle2,
  EyeOff,
} from 'lucide-react';
import { exportPaddocksToGeoJSON } from '../../utils/geoUtils';

interface FarmManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  onSelectFarm: (farmId: string) => void;
  onOpenCreateFarm: () => void;
  onOpenEditFarm: (farmId: string) => void;
  onDeleteFarm: (farmId: string) => void;
  onDuplicateFarm: (farmId: string) => void;
  onResetFarms: () => void;
  onNavigateGis?: () => void;
  onToggleDisableFarm?: (farmId: string) => void;
}

export const FarmManagerModal: React.FC<FarmManagerModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  onSelectFarm,
  onOpenCreateFarm,
  onOpenEditFarm,
  onDeleteFarm,
  onDuplicateFarm,
  onResetFarms,
  onNavigateGis,
  onToggleDisableFarm,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleExportGeoJSON = (farmPkg: FarmDataPackage) => {
    const geoJsonStr = exportPaddocksToGeoJSON(farmPkg.paddocks, farmPkg.profile.name);
    const blob = new Blob([geoJsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${farmPkg.profile.name.toLowerCase().replace(/\s+/g, '_')}_sig.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`GeoJSON de ${farmPkg.profile.name} exportado.`);
  };

  const totalHectaresAllFarms = farms.reduce((acc, f) => acc + (f.profile.totalAreaHa || 0), 0);
  const totalHeadsAllFarms = farms.reduce((acc, f) => acc + (f.headsCount || f.profile.headsCount || 0), 0);
  const totalPaddocksAllFarms = farms.reduce((acc, f) => acc + f.paddocks.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-2xl sm:rounded-3xl border-2 border-white/10 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0D1A13] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-[#2d6a4f]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#123F2A] text-[#A5B8AC] rounded-xl border border-[#2d6a4f]">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Administrador de Fincas y Predios
                </h3>
                <span className="text-[10px] font-bold uppercase bg-[#c1ecd4] text-[#002114] px-2 py-0.5 rounded-full font-mono">
                  {farms.length} {farms.length === 1 ? 'Predio' : 'Predios'}
                </span>
              </div>
              <p className="text-xs text-[#A5B8AC]/80 mt-0.5">
                Gestiona y alterna entre múltiples predios con cartografía, potreros y hatos independientes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Stats Ribbon */}
        <div className="grid grid-cols-3 bg-[#f3f9f5] border-b border-white/10 px-4 py-2.5 text-center">
          <div>
            <span className="text-[10px] font-bold text-[#717973] uppercase block">Área Consolidada</span>
            <span className="text-sm sm:text-base font-extrabold text-white">
              {totalHectaresAllFarms.toLocaleString('es-CO', { maximumFractionDigits: 1 })} Ha
            </span>
          </div>
          <div className="border-x border-white/10">
            <span className="text-[10px] font-bold text-[#717973] uppercase block">Hato Total</span>
            <span className="text-sm sm:text-base font-extrabold text-[#2d6a4f]">
              {totalHeadsAllFarms.toLocaleString()} Cabezas
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#717973] uppercase block">Potreros Mapeados</span>
            <span className="text-sm sm:text-base font-extrabold text-white">
              {totalPaddocksAllFarms} Potreros
            </span>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mx-4 mt-3 p-2.5 bg-[#c1ecd4] text-[#002114] rounded-xl text-xs font-bold text-center animate-in fade-in">
            {toast}
          </div>
        )}

        {/* Farms List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <span className="text-xs font-extrabold text-[#414844] uppercase tracking-wider block">
                Listado de Predios Registrados
              </span>
              <p className="text-[11px] text-[#717973]">
                Deshabilita predios fuera de servicio conservando intacta toda su información e historial.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Filters */}
              <div className="flex items-center bg-[#123F2A]/60 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'all'
                      ? 'bg-[#0D1A13] text-white shadow-xs'
                      : 'text-[#414844] hover:text-white'
                  }`}
                >
                  Todos ({farms.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'active'
                      ? 'bg-[#0D1A13] text-white shadow-xs'
                      : 'text-[#414844] hover:text-white'
                  }`}
                >
                  Activos ({farms.filter((f) => !f.profile.isDisabled).length})
                </button>
                <button
                  onClick={() => setStatusFilter('disabled')}
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'disabled'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-amber-900 hover:text-amber-950'
                  }`}
                >
                  Deshabilitados ({farms.filter((f) => !!f.profile.isDisabled).length})
                </button>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenCreateFarm();
                }}
                className="bg-[#0D1A13] hover:bg-[#123F2A] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-[#ffba38]" />
                <span className="hidden sm:inline">+ Crear Nueva Finca</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {farms
              .filter((f) => {
                if (statusFilter === 'active') return !f.profile.isDisabled;
                if (statusFilter === 'disabled') return !!f.profile.isDisabled;
                return true;
              })
              .map((f) => {
              const isActive = f.profile.id === currentFarmId;
              const isDisabled = !!f.profile.isDisabled;
              const prodLabel =
                f.profile.productionType === 'ceba'
                  ? 'Ceba Intensiva'
                  : f.profile.productionType === 'cria'
                  ? 'Cría y Levante'
                  : f.profile.productionType === 'doble_proposito'
                  ? 'Doble Propósito'
                  : f.profile.productionType === 'lecheria_especializada'
                  ? 'Lechería Especializada'
                  : 'Genética & Cabaña';

              return (
                <div
                  key={f.profile.id}
                  className={`rounded-2xl border-2 p-4 transition-all relative flex flex-col justify-between ${
                    isDisabled
                      ? 'border-amber-300 bg-amber-50/50 opacity-90'
                      : isActive
                      ? 'border-[#012d1d] bg-[#f4fbf7] shadow-md ring-1 ring-[#012d1d]'
                      : 'border-white/10 bg-[#15241C] hover:border-[#717973]'
                  }`}
                >
                  {/* Top card info */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-base text-white">
                            {f.profile.name}
                          </h4>
                          {isActive && !isDisabled && (
                            <span className="text-[10px] uppercase font-bold bg-[#0D1A13] text-[#A5B8AC] px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Check className="w-3 h-3 text-[#ffba38]" /> Selección Activa
                            </span>
                          )}
                          {isDisabled && (
                            <span className="text-[10px] font-extrabold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-300">
                              <ShieldAlert className="w-3 h-3 text-amber-700" /> Deshabilitada
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#414844] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-[#2d6a4f]" />
                          <span>
                            {f.profile.municipality}, {f.profile.department} • {f.profile.vereda}
                          </span>
                        </p>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#e8e8e8] text-[#414844] shrink-0 font-mono">
                        {prodLabel}
                      </span>
                    </div>

                    {/* Metric pills */}
                    <div className="grid grid-cols-3 gap-2 my-3 text-center">
                      <div className="p-2 bg-white/80 rounded-xl border border-white/10">
                        <p className="text-[9px] font-bold text-[#717973] uppercase">Área Total</p>
                        <p className="text-xs sm:text-sm font-extrabold text-white">
                          {f.profile.totalAreaHa} Ha
                        </p>
                      </div>
                      <div className="p-2 bg-white/80 rounded-xl border border-white/10">
                        <p className="text-[9px] font-bold text-[#717973] uppercase">Potreros</p>
                        <p className="text-xs sm:text-sm font-extrabold text-white">
                          {f.paddocks.length} Pot.
                        </p>
                      </div>
                      <div className="p-2 bg-white/80 rounded-xl border border-white/10">
                        <p className="text-[9px] font-bold text-[#717973] uppercase">Hato</p>
                        <p className="text-xs sm:text-sm font-extrabold text-[#2d6a4f]">
                          {f.headsCount || f.profile.headsCount || 0} Cab.
                        </p>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="space-y-1 text-[11px] text-[#414844] bg-white/60 p-2.5 rounded-xl border border-[#eeeeee]">
                      <div className="flex justify-between">
                        <span className="text-[#717973]">Propietario:</span>
                        <span className="font-semibold">{f.profile.legalOwner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#717973]">Registro ICA:</span>
                        <span className="font-mono font-semibold">{f.profile.registrationNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#717973]">Elevación:</span>
                        <span>{f.profile.elevationMsnm} msnm</span>
                      </div>
                    </div>

                    {isDisabled && (
                      <div className="mt-2.5 p-2 bg-amber-100/80 border border-amber-300 rounded-xl text-[10px] text-amber-900 font-semibold flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Información e historial conservados. Activa nuevamente este predio cuando requieras registrar operaciones.</span>
                      </div>
                    )}
                  </div>

                  {/* Actions toolbar */}
                  <div className="pt-3 mt-3 border-t border-white/10/60 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      {!isActive && !isDisabled && (
                        <button
                          onClick={() => {
                            onSelectFarm(f.profile.id);
                            showToast(`Finca ${f.profile.name} activada.`);
                          }}
                          className="px-3 py-1.5 bg-[#0D1A13] hover:bg-[#123F2A] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-[#ffba38]" />
                          <span>Seleccionar</span>
                        </button>
                      )}

                      {isDisabled && (
                        <button
                          onClick={() => {
                            if (onToggleDisableFarm) {
                              onToggleDisableFarm(f.profile.id);
                              showToast(`Finca ${f.profile.name} re-habilitada.`);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Volver a habilitar esta finca"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Habilitar</span>
                        </button>
                      )}

                      {!isDisabled && (
                        <button
                          onClick={() => {
                            if (onToggleDisableFarm) {
                              onToggleDisableFarm(f.profile.id);
                              showToast(`Finca ${f.profile.name} deshabilitada (Información resguardada).`);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                          title="Deshabilitar finca sin eliminar datos"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                          <span className="hidden sm:inline">Deshabilitar</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSelectFarm(f.profile.id);
                          onClose();
                          if (onNavigateGis) onNavigateGis();
                        }}
                        className="px-2.5 py-1.5 bg-[#15241C] hover:bg-[#eeeeee] text-white border border-white/10 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        title="Ver mapa SIG"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#2d6a4f]" />
                        <span className="hidden sm:inline">Mapa SIG</span>
                      </button>

                      <button
                        onClick={() => onOpenEditFarm(f.profile.id)}
                        className="p-1.5 hover:bg-[#eeeeee] text-[#414844] rounded-xl transition-colors border border-white/10 cursor-pointer"
                        title="Editar datos o estado del predio"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleExportGeoJSON(f)}
                        className="p-1.5 hover:bg-[#eeeeee] text-[#414844] rounded-xl transition-colors border border-white/10 cursor-pointer"
                        title="Exportar GeoJSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicateFarm(f.profile.id)}
                        className="p-1.5 hover:bg-[#eeeeee] text-[#414844] rounded-xl transition-colors cursor-pointer"
                        title="Duplicar como plantilla"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === f.profile.id ? (
                        <div className="flex items-center gap-1 bg-[#ffdad6] p-1 rounded-xl">
                          <button
                            onClick={() => {
                              onDeleteFarm(f.profile.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-1 text-[10px] text-[#93000a] font-bold cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={farms.length <= 1}
                          onClick={() => setDeleteConfirmId(f.profile.id)}
                          className={`p-1.5 rounded-xl transition-colors ${
                            farms.length <= 1
                              ? 'opacity-30 cursor-not-allowed text-[#717973]'
                              : 'hover:bg-[#ffdad6] text-[#ba1a1a] cursor-pointer'
                          }`}
                          title={
                            farms.length <= 1
                              ? 'No puedes eliminar el único predio'
                              : 'Eliminar predio'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-[#f8faf8] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={() => {
              if (
                safeConfirm(
                  '¿Deseas restablecer las fincas de ejemplo (La Esperanza, El Roble, Los Robles)? Los predios personalizados se reiniciarán.',
                )
              ) {
                onResetFarms();
                showToast('Fincas restablecidas a valores de fábrica.');
              }
            }}
            className="text-[11px] text-[#717973] hover:text-[#ba1a1a] flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Fincas de Fábrica</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenCreateFarm();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#D4A94E] hover:bg-[#ffdeac] text-[#0D1A13] text-xs font-extrabold rounded-xl shadow transition-all flex items-center justify-center gap-1.5 border border-[#ffba38]/80 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Crear Nueva Finca</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#0D1A13] hover:bg-[#123F2A] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
