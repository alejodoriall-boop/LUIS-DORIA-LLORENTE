import React, { useState } from 'react';
import { PedigreeAnimal } from '../../types';
import { Edit3, X, CheckCircle2 } from 'lucide-react';

interface EditAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  bull: PedigreeAnimal;
  onSave: (updatedBull: PedigreeAnimal) => void;
}

export const EditAnimalModal: React.FC<EditAnimalModalProps> = ({
  isOpen,
  onClose,
  bull,
  onSave,
}) => {
  const [name, setName] = useState(bull.name);
  const [code, setCode] = useState(bull.code);
  const [breed, setBreed] = useState(bull.breed);
  const [category, setCategory] = useState(bull.category);
  const [weight, setWeight] = useState(bull.weight);
  const [inbreedingCoeff, setInbreedingCoeff] = useState(bull.inbreedingCoeff);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...bull,
      name,
      code,
      breed,
      category,
      weight,
      inbreedingCoeff,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-2xl max-w-2xl lg:max-w-3xl w-full p-6 border-2 border-white/10 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#D4A94E]/30 rounded-xl text-[#0D1A13]">
              <Edit3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Editar Registro de Toro</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#717973] hover:text-black rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 my-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-1">
              Nombre del Ejemplar
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-bold text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-1">
                Identificador (ID)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-1">
                Raza
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-semibold"
              >
                <option value="Puro Registrado">Puro Registrado</option>
                <option value="Padre Superior">Padre Superior</option>
                <option value="Gran Campeón">Gran Campeón</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-1">
                Peso Actual (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-mono font-bold text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#79564b] uppercase mb-1">
              Coeficiente de Endogamia F (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inbreedingCoeff}
              onChange={(e) => setInbreedingCoeff(Number(e.target.value))}
              className="w-full bg-[#f9f9f9] border border-white/10 rounded-xl px-3 py-2 font-mono"
            />
          </div>

          <div className="flex gap-2 pt-3 border-t border-[#eeeeee]">
            <button
              type="submit"
              className="flex-1 bg-[#D4A94E] hover:bg-[#ffdeac] text-[#0D1A13] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 tactical-shadow transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-[#f3f3f3] text-[#414844] font-semibold rounded-xl text-xs"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
