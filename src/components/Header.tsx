import React, { useState, useMemo } from 'react';
import { MainTab, FarmDataPackage } from '../types';
import { USER_AVATAR } from '../data/mockData';
import { GanaderIALogo } from './GanaderIALogo';
import {
  Bell,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Check,
  X,
  AlertTriangle,
  Scale,
  Bluetooth,
  Zap,
  PlusCircle,
  Building,
  Settings,
  Home,
  Tractor,
  Droplet,
  Dna,
  MapPin,
  Sparkles,
  Map,
  Beef,
  Baby,
  Filter,
  CloudRain,
  Warehouse,
  DollarSign,
} from 'lucide-react';
import {
  ProductionCategoryKey,
  CATEGORY_DEFINITIONS,
  filterFarmsByCategory,
  getFarmCategories,
} from '../utils/farmCategoryUtils';

interface HeaderProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  unreadAlertsCount: number;
  onOpenWithdrawalModal: () => void;
  scaleName?: string;
  scaleWeight?: number;
  onOpenScaleModal?: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  onSelectFarm: (farmId: string) => void;
  onOpenCreateFarmModal: () => void;
  onOpenFarmManagerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  onOpenWithdrawalModal,
  scaleName,
  scaleWeight,
  onOpenScaleModal,
  farms,
  currentFarmId,
  onSelectFarm,
  onOpenCreateFarmModal,
  onOpenFarmManagerModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFarmMenu, setShowFarmMenu] = useState(false);
  const [headerCategoryFilter, setHeaderCategoryFilter] = useState<ProductionCategoryKey>('all');

  const activeFarm = farms.find((f) => f.profile.id === currentFarmId) || farms[0];

  const filteredDropdownFarms = useMemo(() => {
    return filterFarmsByCategory(farms, headerCategoryFilter);
  }, [farms, headerCategoryFilter]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 h-14 md:h-16 w-full bg-[#f9f9f9] border-b border-[#c1c8c2] shadow-2xs">
      {/* Brand & Manager Avatar */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative">
          <img
            src={USER_AVATAR}
            alt="Administrador Ganadero"
            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-[#c1c8c2] shadow-2xs"
          />
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
            title="Conectado y sincronizado"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <GanaderIALogo
              variant="compact"
              size="sm"
              theme="light"
              onClick={() => setActiveTab('home')}
            />
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] uppercase font-bold tracking-wider bg-[#1b4332] text-[#c1ecd4] px-1.5 py-0.2 rounded ml-1">
              <ShieldCheck className="w-2.5 h-2.5" /> PRO
            </span>
          </div>

          {/* Farm Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFarmMenu(!showFarmMenu)}
              className="text-[10.5px] font-medium text-[#414844] flex items-center gap-1 hover:text-[#012d1d] transition-colors group cursor-pointer"
            >
              <Building className="w-3 h-3 text-[#2d6a4f]" />
              <span className="truncate max-w-[120px] sm:max-w-none font-bold text-[#012d1d]">
                {activeFarm?.profile.name || 'Seleccionar Finca'}
              </span>
              <ChevronDown className="w-2.5 h-2.5 text-[#717973] group-hover:text-[#012d1d] transition-transform" />
            </button>

            {showFarmMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-white rounded-2xl border-2 border-[#c1c8c2] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-2 py-1 border-b border-[#eeeeee] mb-1.5">
                  <p className="text-[10px] font-bold text-[#79564b] uppercase tracking-wider">
                    Predios ({filteredDropdownFarms.length}/{farms.length})
                  </p>
                  <button
                    onClick={() => {
                      setShowFarmMenu(false);
                      onOpenFarmManagerModal();
                    }}
                    className="text-[10px] text-[#012d1d] hover:underline font-bold flex items-center gap-0.5"
                  >
                    <Settings className="w-3 h-3" /> Administrar
                  </button>
                </div>

                {/* Filter Pills in Dropdown */}
                <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1">
                  {(['all', 'ceba', 'cria', 'leche', 'genetica'] as ProductionCategoryKey[]).map((cKey) => {
                    const isSelected = headerCategoryFilter === cKey;
                    const def = CATEGORY_DEFINITIONS[cKey];
                    return (
                      <button
                        key={cKey}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeaderCategoryFilter(cKey);
                        }}
                        className={`text-[9.5px] font-bold px-2 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'bg-[#012d1d] text-white shadow-2xs'
                            : 'bg-[#f4f7f5] hover:bg-[#e2eae5] text-[#414844]'
                        }`}
                      >
                        {def.shortLabel}
                      </button>
                    );
                  })}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {filteredDropdownFarms.length === 0 ? (
                    <p className="text-xs text-[#717973] text-center py-4">
                      No hay predios con inventario de {CATEGORY_DEFINITIONS[headerCategoryFilter].shortLabel}.
                    </p>
                  ) : (
                    filteredDropdownFarms.map((f) => {
                      const isSelected = f.profile.id === currentFarmId;
                      const farmCats = getFarmCategories(f);

                      return (
                        <button
                          key={f.profile.id}
                          onClick={() => {
                            onSelectFarm(f.profile.id);
                            setShowFarmMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[#012d1d] text-white font-semibold'
                              : 'hover:bg-[#eeeeee] text-[#1a1c1c]'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <p className="font-bold truncate">{f.profile.name}</p>
                            <p className="text-[10px] opacity-80 truncate font-mono">
                              {f.profile.department} • {f.profile.totalAreaHa} Ha • {f.headsCount || f.profile.headsCount || 0} cab.
                            </p>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {farmCats.map((cat) => (
                                <span
                                  key={cat}
                                  className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-[#e2ede6] text-[#012d1d]'
                                  }`}
                                >
                                  {CATEGORY_DEFINITIONS[cat]?.shortLabel || cat}
                                </span>
                              ))}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#ffba38] shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Quick Add Farm button */}
                <div className="pt-2 mt-2 border-t border-[#eeeeee]">
                  <button
                    onClick={() => {
                      setShowFarmMenu(false);
                      onOpenCreateFarmModal();
                    }}
                    className="w-full py-2 px-3 bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#012d1d]" />
                    <span>+ Crear Nueva Finca</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Active Module Title Pill (Desktop) */}
      <div className="hidden lg:flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#c1c8c2] shadow-2xs whitespace-nowrap">
        <span className="text-[9.5px] font-bold uppercase text-[#717973] tracking-wider">Módulo:</span>
        <span className="text-xs font-black text-[#012d1d] uppercase tracking-wide">
          {activeTab === 'home' && 'Panel Principal'}
          {activeTab === 'cattle' && 'Inventarios de Ganado (Ceba / Cría & Levante)'}
          {activeTab === 'dairy' && 'Lechería Especializada'}
          {activeTab === 'genetics' && 'Reproducción y Genética'}
          {activeTab === 'gis' && 'SIG (Potreros & Mapas)'}
          {activeTab === 'aforo' && 'Aforos de Pastos'}
          {activeTab === 'finance' && 'Finanzas ($/Ha)'}
          {activeTab === 'rainfall' && 'Lluvia (Pluviómetro)'}
          {activeTab === 'inventory' && 'Almacén & Inventario'}
          {activeTab === 'menu' && 'Asistente Sanidad & IA'}
        </span>
      </div>

      {/* Right Action Icons & Status Widgets */}
      <div className="flex items-center gap-2">
        {/* Scale Status Button */}
        {onOpenScaleModal && (
          <button
            onClick={onOpenScaleModal}
            className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white border border-[#c1c8c2] text-[#012d1d] hover:bg-[#eaf4ee] transition-colors shadow-2xs cursor-pointer text-xs font-bold whitespace-nowrap"
            title="Configurar Báscula Bluetooth / Serial"
          >
            <Bluetooth className="w-3.5 h-3.5 text-[#0077b6] shrink-0 animate-pulse" />
            <span className="font-mono text-[11px] truncate max-w-[140px]">
              {scaleName ? `${scaleName.split(' ')[0]} (${scaleWeight ?? 0} kg)` : 'Báscula BT'}
            </span>
          </button>
        )}

        {/* Withdrawal Warning Quick Action */}
        <button
          onClick={onOpenWithdrawalModal}
          className="hidden md:flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#fffde7] border border-[#ffe066] text-[#523700] hover:bg-[#fff3bf] transition-colors shadow-2xs cursor-pointer text-xs font-bold whitespace-nowrap"
          title="Ver animales en tiempo de retiro sanitario"
        >
          <Zap className="w-3.5 h-3.5 text-[#dc9a00] shrink-0" />
          <span>Retiros (5)</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-8 h-8 rounded-lg hover:bg-[#eeeeee] flex items-center justify-center transition-colors text-[#012d1d]"
            title="Alertas Sanitarias y Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#ba1a1a] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border-2 border-[#c1c8c2] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee]">
                <h3 className="font-bold text-sm text-[#012d1d] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" /> Notificaciones de Campo
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-[#eeeeee] rounded-lg text-[#717973]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 mt-3 max-h-80 overflow-y-auto pr-1">
                {/* Alert 1 */}
                <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-xl border-l-4 border-[#ba1a1a] text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Plan Sanitario Urgente</span>
                    <span className="bg-[#ba1a1a] text-white text-[10px] px-1.5 py-0.5 rounded">
                      En 3 días
                    </span>
                  </div>
                  <p className="mt-1">
                    Vacunación obligatoria contra Fiebre Aftosa en Lote 4 (45 novillos).
                  </p>
                </div>

                {/* Alert 2 */}
                <div
                  onClick={() => {
                    setShowNotifications(false);
                    onOpenWithdrawalModal();
                  }}
                  className="p-3 bg-[#ffdeac] text-[#604100] rounded-xl border-l-4 border-[#523700] text-xs cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Control de Tiempos de Retiro</span>
                    <span className="bg-[#523700] text-[#ffdeac] text-[10px] px-1.5 py-0.5 rounded font-mono">
                      5 animales
                    </span>
                  </div>
                  <p className="mt-1">
                    5 bovinos con tratamiento antibiótico activo. Prohibido despacho o leche a tanque.
                  </p>
                  <p className="text-[10px] text-[#281900] font-bold mt-1 underline">
                    Toca para ver lista de animales →
                  </p>
                </div>

                {/* Alert 3 */}
                <div className="p-3 bg-[#e8e8e8] text-[#1a1c1c] rounded-xl border-l-4 border-[#717973] text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>Pesaje Programado</span>
                    <span className="text-[10px] font-mono text-[#717973]">Mañana</span>
                  </div>
                  <p className="mt-1">
                    Lote Potrero Norte (45 Machos) cumple ciclo de 15 días para estimación de salida.
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#eeeeee] flex justify-between items-center text-xs">
                <span className="text-[11px] text-[#717973] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sincronizado en la nube
                </span>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setActiveTab('menu');
                  }}
                  className="font-bold text-[#012d1d] hover:underline text-[11px]"
                >
                  Ver todo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
