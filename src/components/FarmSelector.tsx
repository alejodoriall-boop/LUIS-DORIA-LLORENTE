import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, ChevronDown, Check, Settings, Plus, X } from 'lucide-react';
import { FarmDataPackage } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';

export interface FarmSelectorProps {
  farms: FarmDataPackage[];
  currentFarmId: string;
  onSelectFarm: (farmId: string) => void;
  onOpenCreateFarmModal?: () => void;
  onOpenFarmManagerModal?: () => void;
  className?: string;
}

export const FarmSelector: React.FC<FarmSelectorProps> = ({
  farms,
  currentFarmId,
  onSelectFarm,
  onOpenCreateFarmModal,
  onOpenFarmManagerModal,
  className = '',
}) => {
  // 1. Estados Principales
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [selectedFarmTemp, setSelectedFarmTemp] = useState<FarmDataPackage | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Referencias para control de clics exteriores
  const dropdownContainerRef = useClickOutside<HTMLDivElement>(
    () => setIsOpenDropdown(false),
    isOpenDropdown
  );

  const modalRef = useRef<HTMLDivElement>(null);

  // Predio Activo
  const currentFarm = useMemo(() => {
    return farms.find((f) => f.profile.id === currentFarmId) || farms[0];
  }, [farms, currentFarmId]);

  // Manejo de tecla Escape para cerrar Dropdown y Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConfirmModalOpen) {
          setIsConfirmModalOpen(false);
          setSelectedFarmTemp(null);
        } else if (isOpenDropdown) {
          setIsOpenDropdown(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfirmModalOpen, isOpenDropdown]);

  // 2. Selección de un predio desde la lista
  const handleFarmItemClick = (farm: FarmDataPackage) => {
    if (farm.profile.id === currentFarm?.profile.id) {
      setIsOpenDropdown(false);
      return;
    }

    setIsOpenDropdown(false);
    setSelectedFarmTemp(farm);
    setIsConfirmModalOpen(true);
  };

  // 3. Confirmación definitiva del cambio de predio
  const handleConfirmSwitch = () => {
    if (selectedFarmTemp) {
      onSelectFarm(selectedFarmTemp.profile.id);
    }
    setIsConfirmModalOpen(false);
    setSelectedFarmTemp(null);
  };

  // 4. Cancelación del cambio
  const handleCancelSwitch = () => {
    setIsConfirmModalOpen(false);
    setSelectedFarmTemp(null);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownContainerRef}>
      {/* BOTÓN SELECTOR PRINCIPAL */}
      <motion.button
        type="button"
        whileHover={{ y: -1, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={() => setIsOpenDropdown(!isOpenDropdown)}
        className="flex items-center gap-1.5 sm:gap-2 bg-[#152019] hover:bg-[#1A251E] text-[#F5F2E9] px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs border border-white/10 transition-all cursor-pointer group shrink-0 select-none"
        title="Cambiar de Predio Activo o Administrar Fincas"
        aria-expanded={isOpenDropdown}
        aria-haspopup="listbox"
      >
        <Building2 className="w-3.5 h-3.5 text-[#C9A35A] shrink-0" />
        <span className="font-bold tracking-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[210px] md:max-w-[260px]">
          {currentFarm?.profile.name || 'Finca La Esperanza'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
            isOpenDropdown ? 'rotate-180 text-[#C9A35A]' : 'text-[#7F8C83] opacity-80 group-hover:opacity-100'
          }`}
        />
      </motion.button>

      {/* LISTA DESPLEGABLE FLOTANTE */}
      <AnimatePresence>
        {isOpenDropdown && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
              onClick={() => setIsOpenDropdown(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-16 sm:top-full mt-2 w-auto sm:w-84 max-w-sm sm:max-w-none bg-[#152019] text-[#F5F2E9] rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3.5 z-50 space-y-2 text-left"
              role="listbox"
            >
              {/* Cabecera del Dropdown */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#A5B8AC] uppercase tracking-wider">
                    Predios Registrados
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#202B24] text-[#C9A35A] px-1.5 py-0.2 rounded-full border border-white/10">
                    {farms.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {onOpenFarmManagerModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpenDropdown(false);
                        onOpenFarmManagerModal();
                      }}
                      className="text-[11px] text-[#C9A35A] hover:text-[#D8B66C] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Gestionar</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpenDropdown(false)}
                    className="sm:hidden p-1 text-[#7F8C83] hover:text-[#F5F2E9] rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lista Scrollable de Fincas */}
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {farms.map((farm) => {
                  const isSelected = farm.profile.id === currentFarm?.profile.id;
                  return (
                    <button
                      key={farm.profile.id}
                      type="button"
                      onClick={() => handleFarmItemClick(farm)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#C9A35A]/15 text-[#F5F2E9] font-bold border border-[#C9A35A]/40 shadow-2xs'
                          : 'hover:bg-white/5 text-[#B9C3BB] font-medium hover:border-white/10 border border-transparent'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-[#C9A35A] ring-2 ring-[#C9A35A]/30' : 'bg-[#7F8C83]'
                          }`}
                        />
                        <div className="truncate min-w-0">
                          <p className="truncate font-semibold leading-tight text-[#F5F2E9]">
                            {farm.profile.name}
                          </p>
                          <p className="text-[10px] text-[#A5B8AC] truncate mt-0.5">
                            {farm.profile.municipality ? `${farm.profile.municipality}, ` : ''}
                            {farm.profile.department || 'Colombia'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-[#A5B8AC] bg-[#202B24] border border-white/10 px-1.5 py-0.5 rounded-md">
                          {farm.profile.totalAreaHa || 0} Ha
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#C9A35A] shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Botón Inferior: Crear Nuevo Predio */}
              {onOpenCreateFarmModal && (
                <div className="pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpenDropdown(false);
                      onOpenCreateFarmModal();
                    }}
                    className="w-full py-2 bg-[#202B24] hover:bg-[#26332B] hover:text-[#C9A35A] text-[#F5F2E9] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A35A]" />
                    <span>Crear Nuevo Predio</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIRMACIÓN OBLIGATORIO */}
      <AnimatePresence>
        {isConfirmModalOpen && selectedFarmTemp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
              onClick={handleCancelSwitch}
            />

            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.93, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-[#152019] text-[#F5F2E9] rounded-3xl p-6 shadow-2xl border border-white/15 z-10 space-y-4 text-left"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-switch-title"
            >
              {/* Encabezado del Modal */}
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#202B24] text-[#C9A35A] flex items-center justify-center border border-white/10 shrink-0">
                  <Building2 className="w-6 h-6 text-[#C9A35A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 id="confirm-switch-title" className="text-base sm:text-lg font-extrabold text-[#F5F2E9] leading-tight">
                    ¿Cambiar de predio?
                  </h3>
                  <p className="text-xs text-[#A5B8AC] mt-1 leading-normal">
                    Estás a punto de cambiar a{' '}
                    <span className="font-bold text-[#F5F2E9]">{selectedFarmTemp.profile.name}</span>. La vista, inventarios y registros se actualizarán con los datos de este predio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelSwitch}
                  className="text-[#7F8C83] hover:text-[#F5F2E9] p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Resumen Comparativo de Predios */}
              <div className="bg-[#202B24] p-4 rounded-2xl border border-white/10 text-xs space-y-2.5">
                <div className="flex items-center justify-between text-[#A5B8AC]">
                  <span className="font-medium">Predio actual:</span>
                  <span className="font-bold text-[#F5F2E9] truncate max-w-[200px]">
                    {currentFarm?.profile.name || 'Finca actual'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[#C9A35A]">
                  <span className="font-semibold">Nuevo predio:</span>
                  <div className="text-right">
                    <span className="font-extrabold text-sm block text-[#F5F2E9] truncate max-w-[200px]">
                      {selectedFarmTemp.profile.name}
                    </span>
                    <span className="text-[10px] text-[#A5B8AC] font-mono">
                      {selectedFarmTemp.profile.totalAreaHa || 0} Ha • {selectedFarmTemp.profile.municipality || 'Colombia'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancelSwitch}
                  className="px-4 py-2.5 bg-[#202B24] hover:bg-[#26332B] text-[#F5F2E9] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-white/10"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirmSwitch}
                  className="px-5 py-2.5 bg-[#C9A35A] hover:bg-[#D8B66C] text-[#101713] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#101713]" />
                  <span>Confirmar Cambio</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
