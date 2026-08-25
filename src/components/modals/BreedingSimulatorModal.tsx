import React, { useState } from 'react';
import { PedigreeAnimal } from '../../types';
import { Zap, X, ShieldCheck, Heart, AlertTriangle, ArrowRight } from 'lucide-react';

interface BreedingSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  bull: PedigreeAnimal;
}

export const BreedingSimulatorModal: React.FC<BreedingSimulatorModalProps> = ({
  isOpen,
  onClose,
  bull,
}) => {
  const [selectedCowId, setSelectedCowId] = useState('cow-1');

  if (!isOpen) return null;

  const herdCows = [
    {
      id: 'cow-1',
      tag: 'BR-102',
      name: 'Rosita 102',
      breed: 'Brangus Negro',
      sire: 'Rey Midas',
      dam: 'Matriarca 08',
      weight: 580,
      predictedF: 1.4,
      compatibility: 'Óptima (Vigor Híbrido Alto)',
      predictedBirthWeight: 34.5,
      predictedWeanWeight: 215,
    },
    {
      id: 'cow-2',
      tag: 'V-08',
      name: 'Mancha V-08',
      breed: 'Gyr x Holstein F1',
      sire: 'Sansao',
      dam: 'Lucero 14',
      weight: 540,
      predictedF: 0.0,
      compatibility: 'Excelente (Cruza Terminal F1)',
      predictedBirthWeight: 32.0,
      predictedWeanWeight: 230,
    },
    {
      id: 'cow-3',
      tag: 'BR-3341',
      name: 'Hija de Luna 55',
      breed: 'Brangus',
      sire: 'Cacique 120',
      dam: 'Luna 55',
      weight: 510,
      predictedF: 12.5,
      compatibility: 'Riesgo Alto de Consanguinidad (Medio Hermanos)',
      predictedBirthWeight: 37.0,
      predictedWeanWeight: 195,
    },
  ];

  const currentCow = herdCows.find((c) => c.id === selectedCowId) || herdCows[0];
  const isHighRisk = currentCow.predictedF > 6.25;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-2xl max-w-3xl lg:max-w-5xl lg:max-w-6xl w-full p-6 border-2 border-white/10 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#123F2A] text-[#A5B8AC] rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Simulador de Cruzamiento Virtual</h3>
              <p className="text-[11px] text-[#717973]">Predicción de Consanguinidad y Mérito Genético</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#717973] hover:text-black rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-4 text-xs">
          {/* Matched Pair Display */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#f3f3f3] rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] text-[#79564b] font-bold uppercase block">
                Semental (Padre)
              </span>
              <p className="font-bold text-sm text-white">{bull.name}</p>
              <p className="font-mono text-[10px] text-[#717973]">{bull.code} • {bull.breed}</p>
            </div>

            <div>
              <span className="text-[10px] text-[#79564b] font-bold uppercase block">
                Seleccionar Vientre (Madre)
              </span>
              <select
                value={selectedCowId}
                onChange={(e) => setSelectedCowId(e.target.value)}
                className="w-full bg-[#15241C] border border-white/10 rounded-lg px-2 py-1 text-xs font-semibold text-white mt-1"
              >
                {herdCows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.tag})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Predicted Inbreeding Coefficient (F) */}
          <div
            className={`p-4 rounded-xl border-l-4 ${
              isHighRisk
                ? 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]'
                : 'bg-[#c1ecd4]/40 text-[#002114] border-[#012d1d]'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold uppercase text-[10px] tracking-wider">
                Coeficiente de Consanguinidad Proyectado (F)
              </span>
              <span className="font-mono text-xl font-bold">
                {currentCow.predictedF.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs font-semibold flex items-center gap-1">
              {isHighRisk ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
                  {currentCow.compatibility}
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  {currentCow.compatibility}
                </>
              )}
            </p>
          </div>

          {/* Progeny Projections */}
          <div className="p-4 bg-[#15241C] rounded-xl border border-white/10 space-y-2">
            <h4 className="font-bold text-white">Proyección de la Cría Resultante:</h4>
            <div className="grid grid-cols-2 gap-3 text-center pt-1">
              <div className="p-2.5 bg-[#f9f9f9] rounded-lg border border-[#e2e2e2]">
                <span className="text-[10px] text-[#717973] block">Peso Estimado al Nacer</span>
                <span className="font-mono font-bold text-sm text-white">
                  {currentCow.predictedBirthWeight} kg
                </span>
                <span className="text-[9px] text-emerald-700 block">Parto Eutócico Seguro</span>
              </div>

              <div className="p-2.5 bg-[#f9f9f9] rounded-lg border border-[#e2e2e2]">
                <span className="text-[10px] text-[#717973] block">Peso Estimado al Destete (205d)</span>
                <span className="font-mono font-bold text-sm text-white">
                  {currentCow.predictedWeanWeight} kg
                </span>
                <span className="text-[9px] text-emerald-700 block">+18kg vs promedio</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-[#eeeeee]">
          <button
            onClick={() => {
              alert(`Cruzamiento programado: ${bull.name} x ${currentCow.name}. Se ha añadido al plan reproductivo.`);
              onClose();
            }}
            className="flex-1 bg-[#123F2A] hover:bg-[#0D1A13] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Heart className="w-4 h-4 text-[#ffba38]" />
            Programar Servicio / IATF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
