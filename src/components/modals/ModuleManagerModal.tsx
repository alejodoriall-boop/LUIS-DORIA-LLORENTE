import React, { useState } from 'react';
import { MainTab } from '../../types';
import { CowIcon } from '../icons/CowIcon';
import { HorseIcon } from '../icons/HorseIcon';
import { GrassIcon } from '../icons/GrassIcon';
import {
  X,
  Milk,
  Dna,
  ShieldCheck,
  Baby,
  Wheat,
  BarChart3,
  MapPin,
  DollarSign,
  Users,
  CloudRain,
  Warehouse,
  Sparkles,
  Scale,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Search,
  ArrowRight,
  Power,
  Building2,
} from 'lucide-react';

interface ModuleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDairyEnabled: boolean;
  onToggleDairyModule: () => void;
  isLotsEnabled?: boolean;
  onToggleLotsModule?: (enabled?: boolean) => void;
  setActiveTab: (tab: MainTab) => void;
}

interface ModuleInfo {
  id: MainTab | 'scale';
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  isDairySpecific?: boolean;
}

export const ModuleManagerModal: React.FC<ModuleManagerModalProps> = ({
  isOpen,
  onClose,
  isDairyEnabled,
  onToggleDairyModule,
  isLotsEnabled = false,
  onToggleLotsModule,
  setActiveTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'productivo' | 'tecnico' | 'administrativo'>('all');

  if (!isOpen) return null;

  const modulesList: ModuleInfo[] = [
    {
      id: 'dairy',
      name: 'Módulo de Lechería Especializada',
      category: 'productivo',
      description: 'Control de ordeño diario, curvas de lactancia, tanque de frío y calidad láctea.',
      icon: Milk,
      isDairySpecific: true,
    },
    {
      id: 'cattle',
      name: 'Inventarios de Ganado & Lotes',
      category: 'productivo',
      description: 'Control físico de cabezas, ceba, levante, pesajes y movimientos entre predios.',
      icon: CowIcon,
    },
    {
      id: 'equines',
      name: 'Inventario de Equinos, Mulares & Asnales',
      category: 'productivo',
      description: 'Mulas de carga/enjalma, caballos de vaquería, burros padrotes, herrajes y Coggins AIE.',
      icon: HorseIcon,
    },
    {
      id: 'genetics',
      name: 'Reproducción, FIV & Pedigrí',
      category: 'productivo',
      description: 'Genealogías, inseminación IATF, catálogo de toros, semen y DEPs.',
      icon: Dna,
    },
    {
      id: 'calf_rearing',
      name: 'Crianza & Destete de Terneros',
      category: 'productivo',
      description: 'Control de calostro, salas de amamantamiento artificial y tablas de pesaje.',
      icon: Baby,
    },
    {
      id: 'supplementation',
      name: 'Suplementación & Nutrición',
      category: 'productivo',
      description: 'Cálculo de raciones diarias, concentrados, sales mineralizadas y bloques.',
      icon: Wheat,
    },
    {
      id: 'herd_traceability',
      name: 'Trazabilidad Sanitaria & Eventos',
      category: 'tecnico',
      description: 'Historial de vacunación, vermifugados, tratamientos sanitarios y tiempos de retiro.',
      icon: ShieldCheck,
    },
    {
      id: 'gis',
      name: 'SIG Potreros & Capacidad de Carga',
      category: 'tecnico',
      description: 'Georreferenciación de potreros, rotación de pastoreo y mapas satelitales.',
      icon: MapPin,
    },
    {
      id: 'aforo',
      name: 'Aforos de Pastos & Forraje',
      category: 'tecnico',
      description: 'Muestra de cuadro de aforo, oferta de MS/ha, días de ocupación y descanso.',
      icon: GrassIcon,
    },
    {
      id: 'scale',
      name: 'Sincronización Báscula Bluetooth',
      category: 'tecnico',
      description: 'Captura de peso en vivo desde barras de carga Tru-Test, Gallagher y RFID.',
      icon: Scale,
    },
    {
      id: 'analytics_report',
      name: 'Análisis de Datos & Métricas',
      category: 'tecnico',
      description: 'Informe ejecutivo de GDP, días abiertos, eficiencia productiva e indicadores clave.',
      icon: BarChart3,
    },
    {
      id: 'finance',
      name: 'Finanzas, Margen & $/Ha',
      category: 'administrativo',
      description: 'Ingresos por leche/carne, costos operacionales y rentabilidad por hectárea.',
      icon: DollarSign,
    },
    {
      id: 'payroll',
      name: 'Nómina & Gestión de Operarios',
      category: 'administrativo',
      description: 'Pago de colaboradores, tareas asignadas y registro de labores de campo.',
      icon: Users,
    },
    {
      id: 'rainfall',
      name: 'Pluviómetro & Clima',
      category: 'tecnico',
      description: 'Registro de lluvias diarias (mm), historial hídrico e impacto en pasturas.',
      icon: CloudRain,
    },
    {
      id: 'inventory',
      name: 'Almacén, Insumos & Fármacos',
      category: 'administrativo',
      description: 'Control de inventario de medicamentos, agroquímicos, semovientes e insumos.',
      icon: Warehouse,
    },
    {
      id: 'menu',
      name: 'Asistente Veterinario con IA',
      category: 'tecnico',
      description: 'Diagnóstico diferencial, recomendación de esquemas sanitarios y consultas.',
      icon: Sparkles,
    },
  ];

  const filteredModules = modulesList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const activeCount = isDairyEnabled ? modulesList.length : modulesList.length - 1;

  const handlePresetApply = (type: 'dairy' | 'beef' | 'all') => {
    if (type === 'dairy' && !isDairyEnabled) {
      onToggleDairyModule();
    } else if (type === 'beef' && isDairyEnabled) {
      onToggleDairyModule();
    } else if (type === 'all' && !isDairyEnabled) {
      onToggleDairyModule();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-[#012d1d] rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#012d1d] text-white p-5 flex items-center justify-between border-b border-[#1b4332]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1b4332] text-[#ffba38] rounded-2xl border border-[#ffba38]/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white uppercase font-mono">
                  GESTOR DE MÓDULOS DE GESTIÓN
                </h2>
                <span className="bg-[#ffba38] text-[#012d1d] text-xs font-black px-2 py-0.5 rounded-full font-mono">
                  {activeCount}/{modulesList.length} ACTIVOS
                </span>
              </div>
              <p className="text-xs text-[#c1ecd4]/80 mt-0.5">
                Configura los módulos activos según el modelo productivo de tu ganadería.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1b4332] text-[#c1ecd4] hover:text-white hover:bg-rose-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar bg-[#fcfdfc]">
          {/* Quick Preset Selector */}
          <div className="bg-[#eaf4ee] border border-[#c1ecd4] p-4 rounded-2xl space-y-2">
            <p className="text-xs font-extrabold text-[#012d1d] uppercase font-mono flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#ffba38]" />
              PERFILES PRODUCTIVOS PRECONFIGURADOS:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handlePresetApply('dairy')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                  isDairyEnabled
                    ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-sm'
                    : 'bg-white text-[#012d1d] border-[#c1ecd4] hover:bg-[#d8ece0]'
                }`}
              >
                <Milk className="w-5 h-5 text-[#ffba38] shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase">Lechería / Doble Propósito</p>
                  <p className="text-[10px] opacity-80">Ordeño, calidad láctea y todos los módulos</p>
                </div>
              </button>

              <button
                onClick={() => handlePresetApply('beef')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                  !isDairyEnabled
                    ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-sm'
                    : 'bg-white text-[#012d1d] border-[#c1ecd4] hover:bg-[#d8ece0]'
                }`}
              >
                <CowIcon className="w-5 h-5 text-[#ffba38] shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase">Ganadería de Carne / Ceba</p>
                  <p className="text-[10px] opacity-80">Enfocado en GDP, lotes y praderas (Lechería OFF)</p>
                </div>
              </button>

              <button
                onClick={() => handlePresetApply('all')}
                className="p-2.5 rounded-xl border bg-white text-[#012d1d] border-[#c1ecd4] hover:bg-[#d8ece0] text-left cursor-pointer transition-all flex items-center gap-2.5"
              >
                <Sparkles className="w-5 h-5 text-[#ffba38] shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase">Sistema Integral Completo</p>
                  <p className="text-[10px] opacity-80">Todos los 15+ módulos 100% operativos</p>
                </div>
              </button>
            </div>
          </div>

          {/* Organizational Structure Selector: PREDIOS (DEFAULT) VS LOTES */}
          <div className="bg-white border-2 border-[#012d1d]/20 p-4 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#012d1d]" />
                <div>
                  <h3 className="text-xs font-black text-[#012d1d] uppercase font-mono">
                    ESTRUCTURA DE ORGANIZACIÓN DEL HATO
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Por defecto el sistema gestiona el inventario por <strong className="text-[#012d1d]">Predios</strong>. Para subdividir por <strong className="text-[#012d1d]">Lotes</strong> de rotación, debes habilitarlo.
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase shrink-0 self-start sm:self-auto ${
                isLotsEnabled ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {isLotsEnabled ? '🌾 Modo Lotes Habilitado' : '🏡 Modo Predios (Por Defecto)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onToggleLotsModule?.(false)}
                className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all flex items-start gap-3 ${
                  !isLotsEnabled
                    ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-sm'
                    : 'bg-gray-50 text-[#012d1d] border-gray-200 hover:border-[#012d1d]'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${!isLotsEnabled ? 'bg-[#1b4332] text-[#ffba38]' : 'bg-gray-200 text-gray-600'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black uppercase font-mono">1. Manejo por Predios</p>
                    <span className="text-[9px] bg-emerald-300 text-emerald-950 font-black px-1.5 py-0.2 rounded uppercase">
                      Predeterminado
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80 mt-1 leading-snug">
                    Inventarios, pesajes y traslados organizados directamente por Fincas y Predios sin exigir subdivisión en lotes.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onToggleLotsModule?.(true)}
                className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all flex items-start gap-3 ${
                  isLotsEnabled
                    ? 'bg-[#012d1d] text-white border-[#012d1d] shadow-sm'
                    : 'bg-gray-50 text-[#012d1d] border-gray-200 hover:border-[#012d1d]'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isLotsEnabled ? 'bg-[#1b4332] text-[#ffba38]' : 'bg-gray-200 text-gray-600'}`}>
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black uppercase font-mono">2. Manejo por Lotes</p>
                    <span className="text-[9px] bg-amber-300 text-amber-950 font-black px-1.5 py-0.2 rounded uppercase">
                      Opcional
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80 mt-1 leading-snug">
                    Habilita desgloses por grupos de pastoreo, lotes de ceba, hembras de reemplazo y rotación de potreros.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar módulo por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#012d1d] outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                  filterCategory === 'all'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterCategory('productivo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                  filterCategory === 'productivo'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Productivos
              </button>
              <button
                onClick={() => setFilterCategory('tecnico')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                  filterCategory === 'tecnico'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Técnicos & SIG
              </button>
              <button
                onClick={() => setFilterCategory('administrativo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                  filterCategory === 'administrativo'
                    ? 'bg-[#012d1d] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Gestión & Finanzas
              </button>
            </div>
          </div>

          {/* Modules List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredModules.map((mod) => {
              const IconComp = mod.icon;
              const isActive = mod.isDairySpecific ? isDairyEnabled : true;

              return (
                <div
                  key={mod.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                    isActive
                      ? 'bg-white border-[#012d1d]/20 shadow-xs hover:border-[#012d1d]'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isActive
                            ? 'bg-[#012d1d] text-[#ffba38]'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-xs text-[#012d1d] uppercase font-mono">
                            {mod.name}
                          </h3>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                            {mod.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span
                      className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                        isActive ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {isActive ? 'MóDULO ACTIVO' : 'MóDULO DESACTIVADO'}
                    </span>

                    <div className="flex items-center gap-2">
                      {mod.isDairySpecific ? (
                        <button
                          onClick={onToggleDairyModule}
                          className={`px-3 py-1 rounded-xl text-xs font-mono font-black uppercase cursor-pointer transition-all ${
                            isDairyEnabled
                              ? 'bg-[#ffba38] text-[#012d1d] hover:bg-amber-400'
                              : 'bg-rose-800 text-white hover:bg-rose-900'
                          }`}
                        >
                          {isDairyEnabled ? 'DESACTIVAR' : 'ACTIVAR'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (mod.id !== 'scale') {
                              setActiveTab(mod.id as MainTab);
                              onClose();
                            }
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-[#012d1d] text-white hover:bg-[#1b4332] cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <span>IR AL MÓDULO</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configuración guardada automáticamente en tu sesión local.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
