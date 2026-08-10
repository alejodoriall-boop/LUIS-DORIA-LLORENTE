import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Wheat,
  Syringe,
  Leaf,
  Droplet,
  Wrench,
  Fuel,
  Package,
  Shield,
  Zap,
  Truck,
  Tag,
  Check,
} from 'lucide-react';
import { CategoryInfo } from '../../types';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (newCategory: CategoryInfo) => void;
}

const COLOR_PRESETS = [
  { label: 'Ámbar / Dorado', color: '#d97706', badgeBg: '#fef3c7' },
  { label: 'Verde Esmeralda', color: '#15803d', badgeBg: '#dcfce7' },
  { label: 'Azul Real', color: '#0284c7', badgeBg: '#e0f2fe' },
  { label: 'Rojo Carmesí', color: '#dc2626', badgeBg: '#fee2e2' },
  { label: 'Púrpura / Violeta', color: '#7c3aed', badgeBg: '#f3e8ff' },
  { label: 'Gris Metal / Slate', color: '#475569', badgeBg: '#f1f5f9' },
  { label: 'Teal / Turquesa', color: '#0d9488', badgeBg: '#ccfbf1' },
  { label: 'Naranja Fuego', color: '#ea580c', badgeBg: '#ffedd5' },
];

const AVAILABLE_ICONS = [
  { name: 'Sparkles', label: 'Destellos / Minerales', Icon: Sparkles },
  { name: 'Wheat', label: 'Trigo / Alimentos', Icon: Wheat },
  { name: 'Syringe', label: 'Jeringa / Veterinaria', Icon: Syringe },
  { name: 'Leaf', label: 'Hoja / Semilla', Icon: Leaf },
  { name: 'Droplet', label: 'Gota / Líquidos', Icon: Droplet },
  { name: 'Wrench', label: 'Llave / Herramientas', Icon: Wrench },
  { name: 'Fuel', label: 'Combustibles / ACPM', Icon: Fuel },
  { name: 'Package', label: 'Caja / General', Icon: Package },
  { name: 'Shield', label: 'Escudo / Protección', Icon: Shield },
  { name: 'Zap', label: 'Rayo / Electricidad', Icon: Zap },
  { name: 'Truck', label: 'Vehículos / Transporte', Icon: Truck },
  { name: 'Tag', label: 'Etiqueta', Icon: Tag },
];

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSaveCategory,
}) => {
  const [label, setLabel] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [selectedIconName, setSelectedIconName] = useState<string>('Package');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setErrorMsg('Por favor ingresa un nombre para la categoría.');
      return;
    }

    const categoryId = 'cat_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();

    const newCategory: CategoryInfo = {
      id: categoryId,
      label: label.trim(),
      iconName: selectedIconName,
      color: selectedColor.color,
      badgeBg: selectedColor.badgeBg,
      description: description.trim() || undefined,
    };

    onSaveCategory(newCategory);
    setLabel('');
    setDescription('');
    setErrorMsg('');
    onClose();
  };

  const SelectedIconComponent =
    AVAILABLE_ICONS.find((i) => i.name === selectedIconName)?.Icon || Package;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#c1c8c2] animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-[#012d1d] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#ffba38] text-[#012d1d] rounded-2xl">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Nueva Categoría de Almacén</h2>
              <p className="text-xs text-[#c1ecd4]/80 font-medium">
                Organiza insumos, herramientas y repuestos de tu finca
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-[#fee2e2] border border-[#fca5a5] text-[#b91c1c] text-xs font-bold rounded-2xl">
              {errorMsg}
            </div>
          )}

          {/* Category Name */}
          <div>
            <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
              Nombre de la Categoría:
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Ej. Combustibles & Lubricantes, Maquinaria, Repuestos..."
              className="w-full p-2.5 bg-[#f8fbf9] border-2 border-[#c1c8c2] rounded-2xl text-xs font-bold text-[#012d1d] focus:outline-none focus:border-[#012d1d]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
              Descripción / Detalle (Opcional):
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Gasolina, ACPM, aceites 15W40, grasa para chasis..."
              className="w-full p-2.5 bg-white border border-[#c1c8c2] rounded-xl text-xs font-medium text-[#1a1c1c] focus:outline-none focus:border-[#012d1d]"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1.5">
              Icono Representativo:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map(({ name, label: iconLabel, Icon }) => {
                const isSelected = selectedIconName === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedIconName(name)}
                    title={iconLabel}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#012d1d] text-[#ffba38] border-[#012d1d] shadow-sm scale-105'
                        : 'bg-[#f8fbf9] text-[#414844] border-[#c1c8c2] hover:bg-[#e8f3ed]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1.5">
              Color de Identificación:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = selectedColor.color === preset.color;
                return (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => setSelectedColor(preset)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#012d1d] ring-2 ring-[#012d1d]/30 font-bold'
                        : 'border-[#c1c8c2] hover:border-[#2d6a4f]'
                    }`}
                    style={{ backgroundColor: preset.badgeBg }}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white"
                      style={{ backgroundColor: preset.color }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span className="text-[10.5px] truncate font-semibold" style={{ color: preset.color }}>
                      {preset.label.split('/')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-[#f8fbf9] p-3.5 rounded-2xl border border-[#c1c8c2] space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-[#717973]">
              Vista Previa de la Etiqueta:
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-extrabold uppercase font-mono px-3 py-1 rounded-full flex items-center gap-1.5 border"
                style={{
                  backgroundColor: selectedColor.badgeBg,
                  color: selectedColor.color,
                  borderColor: selectedColor.color + '40',
                }}
              >
                <SelectedIconComponent className="w-4 h-4" />
                <span>{label || 'Nombre Categoría'}</span>
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#f0f0f0]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white hover:bg-[#f0f0f0] text-[#414844] font-bold text-xs rounded-xl border border-[#c1c8c2] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#ffba38]" />
              <span>Guardar Categoría</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
