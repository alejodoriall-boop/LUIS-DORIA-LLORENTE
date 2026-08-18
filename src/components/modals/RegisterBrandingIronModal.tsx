import React, { useState, useEffect } from 'react';
import { X, Flame, Shield, Award, MapPin, Check, Info, Upload, Image as ImageIcon, Trash2, Camera } from 'lucide-react';
import { BrandingIron, FarmDataPackage } from '../../types';

interface RegisterBrandingIronModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (iron: BrandingIron) => void;
  farms?: FarmDataPackage[];
  initialIron?: BrandingIron | null;
}

const BODY_LOCATIONS = [
  'Anca Derecha',
  'Anca Izquierda',
  'Pierna Derecha',
  'Pierna Izquierda',
  'Paleta Derecha',
  'Paleta Izquierda',
  'Ijar Derecho',
  'Ijar Izquierdo',
  'Lomo Derecho',
  'Lomo Izquierdo',
];

const SYMBOL_PRESETS = ['🔥', '👑', '⚡', '★', '✝', '⚓', '🐂', '🛡️', '💎', '⚜️', 'Ω', 'H1', 'SJ', 'V', 'G'];

export const RegisterBrandingIronModal: React.FC<RegisterBrandingIronModalProps> = ({
  isOpen,
  onClose,
  onSave,
  farms = [],
  initialIron,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [symbolIcon, setSymbolIcon] = useState('🔥');
  const [bodyLocation, setBodyLocation] = useState('Anca Derecha');
  const [type, setType] = useState<'propiedad' | 'ventanilla' | 'finca' | 'sanitario' | string>('propiedad');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialIron) {
        setName(initialIron.name || '');
        setCode(initialIron.code || '');
        setSymbolIcon(initialIron.symbolIcon || '🔥');
        setBodyLocation(initialIron.bodyLocation || 'Anca Derecha');
        setType(initialIron.type || 'propiedad');
        setRegistrationNumber(initialIron.registrationNumber || '');
        setSelectedFarmId(initialIron.farmId || '');
        setImageUrl(initialIron.imageUrl || '');
        setNotes(initialIron.notes || '');
      } else {
        setName('');
        setCode('');
        setSymbolIcon('🔥');
        setBodyLocation('Anca Derecha');
        setType('propiedad');
        setRegistrationNumber('');
        setSelectedFarmId(farms[0]?.profile.id || '');
        setImageUrl('');
        setNotes('');
      }
    }
  }, [initialIron?.id, isOpen, farms.length]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const farmObj = farms.find((f) => f.profile.id === selectedFarmId);

    const ironData: BrandingIron = {
      id: initialIron ? initialIron.id : `iron-${Date.now()}`,
      name: name.trim(),
      code: code.trim() || name.substring(0, 3).toUpperCase(),
      symbolIcon: symbolIcon || '🔥',
      bodyLocation,
      type,
      registrationNumber: registrationNumber.trim(),
      farmId: selectedFarmId,
      farmName: farmObj?.profile.name || 'Todas las Fincas',
      imageUrl,
      notes: notes.trim(),
      createdAt: initialIron?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(ironData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white border-2 border-[#012d1d] rounded-3xl max-w-4xl lg:max-w-5xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#012d1d] via-[#083d28] to-[#012d1d] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ffba38] text-[#523700] rounded-2xl font-black shadow-inner">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {initialIron ? 'Editar Hierro de Marcar' : 'Registrar Hierro Ganadero / Marca a Fuego'}
              </h3>
              <p className="text-xs text-[#c1ecd4]">
                Patente oficial de hierros de propiedad, venta y contra-marcas de la ganadería
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
          {/* Live Brand Stamp Preview Banner */}
          <div className="bg-gradient-to-br from-[#2a1b12] to-[#120b07] border-2 border-[#ffba38]/50 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <div className="w-16 h-16 rounded-2xl border-2 border-[#ffba38] overflow-hidden bg-black shadow-xl ring-2 ring-[#ffba38]/30 shrink-0">
                  <img src={imageUrl} alt="Fotografía del Hierro" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffba38] via-[#e65100] to-[#b71c1c] p-0.5 flex items-center justify-center shadow-xl ring-2 ring-[#ffba38]/30 shrink-0">
                  <div className="w-full h-full bg-[#1c100a] rounded-[14px] flex flex-col items-center justify-center text-center p-1 border border-[#ff8f00]/40">
                    <span className="text-2xl font-black text-[#ffe082] drop-shadow-[0_2px_4px_rgba(255,143,0,0.8)]">
                      {symbolIcon}
                    </span>
                    <span className="text-[10px] font-mono font-black text-white tracking-widest uppercase">
                      {code || 'MARCA'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <span className="bg-[#ffba38]/20 text-[#ffe082] border border-[#ffba38]/40 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  VISTA PREVIA DEL HIERRO
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {name || 'Nombre del Hierro Ganadero'}
                </h4>
                <p className="text-xs text-[#d7ccc8] flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ffba38]" />
                  Ubicación: <strong className="text-white">{bodyLocation}</strong>
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
              <span className="text-[10px] font-bold text-[#b0bec5] block uppercase">Registro ICA / RUP</span>
              <span className="text-sm font-mono font-black text-[#ffe082]">
                {registrationNumber || 'PENDIENTE'}
              </span>
            </div>
          </div>

          {/* Main Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
                Nombre del Hierro / Propietario *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Hierro Principal H1 - Las Delicias"
                className="w-full bg-[#f4fbf6] border border-[#a5d6a7] rounded-xl px-3 py-2 font-bold text-xs text-[#012d1d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
                Código / Iniciales o Sigla *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej: H1, HLD, G1"
                className="w-full bg-[#f4fbf6] border border-[#a5d6a7] rounded-xl px-3 py-2 font-mono font-black text-xs text-[#012d1d] uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
                Ubicación del Hierro en el Animal *
              </label>
              <select
                value={bodyLocation}
                onChange={(e) => setBodyLocation(e.target.value)}
                className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-semibold text-xs text-[#012d1d]"
              >
                {BODY_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
                Tipo de Hierro / Uso *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-semibold text-xs text-[#012d1d]"
              >
                <option value="propiedad">🔥 Hierro de Propiedad (Nacimiento / Marca Oficial)</option>
                <option value="ventanilla">⚡ Hierro de Ventanilla / Venta (Contra-marca)</option>
                <option value="finca">🏡 Hierro de Finca / Predio</option>
                <option value="sanitario">💉 Hierro Sanitario / Vacunación (Sanidad ICA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
                N° Registro ICA / RUP / Patente
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="Ej: ICA-R-9842 o RUP-10293"
                className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-mono font-bold text-xs text-[#012d1d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
                Predio / Finca Asignada
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full bg-white border border-[#c1c8c2] rounded-xl px-3 py-2 font-semibold text-xs text-[#012d1d]"
              >
                <option value="">Todas las Fincas (Global)</option>
                {farms.map((f) => (
                  <option key={f.profile.id} value={f.profile.id}>
                    🏡 {f.profile.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Symbol Presets */}
          <div>
            <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1.5">
              Símbolo / Ícono Representativo del Hierro
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMBOL_PRESETS.map((sym) => (
                <button
                  type="button"
                  key={sym}
                  onClick={() => setSymbolIcon(sym)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all cursor-pointer ${
                    symbolIcon === sym
                      ? 'bg-[#012d1d] text-[#ffba38] ring-2 ring-[#ffba38] shadow-md scale-105'
                      : 'bg-[#f0f4f1] text-[#012d1d] hover:bg-[#e2eae4] border border-[#c1c8c2]'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Cargar Fotografía del Hierro / Marca */}
          <div>
            <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#ff8f00]" />
                Fotografía Real o Imagen de la Patente del Hierro
              </span>
              <span className="text-[10px] text-[#717973] normal-case font-normal">Opcional (JPG/PNG máx 5MB)</span>
            </label>

            {imageUrl ? (
              <div className="p-3 bg-[#f4fbf6] border-2 border-dashed border-[#a5d6a7] rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-[#012d1d]/20 overflow-hidden bg-black shrink-0 shadow-xs">
                    <img src={imageUrl} alt="Cargada" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-700" /> Imagen Cargada Exitosamente
                    </span>
                    <p className="text-xs font-semibold text-[#012d1d] mt-1">
                      Fotografía del hierro guardada en el expediente.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="p-2 bg-[#012d1d] text-white hover:bg-[#1b4332] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#ffba38]" />
                    <span>Cambiar</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#c1c8c2] hover:border-[#012d1d] bg-[#fafcfb] hover:bg-[#f0f4f1] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e9] group-hover:bg-[#c8e6c9] flex items-center justify-center mb-2 transition-colors">
                  <Upload className="w-5 h-5 text-[#012d1d]" />
                </div>
                <span className="text-xs font-bold text-[#012d1d]">
                  Haga clic para subir una foto o escaneo del hierro
                </span>
                <span className="text-[11px] text-[#717973] mt-0.5">
                  Puedes tomar una foto directa del hierro de marca o de la boleta de la alcaldía/patente
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#012d1d] uppercase mb-1">
              Observaciones / Registro Legal
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles sobre el diseño, patente municipal o resolución ICA de la marca..."
              className="w-full bg-white border border-[#c1c8c2] rounded-xl p-2.5 text-xs text-[#012d1d]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e7eb]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#c1c8c2] text-xs font-bold text-[#414844] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#012d1d] text-white hover:bg-[#1b4332] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4 text-[#ffba38]" />
              <span>{initialIron ? 'Guardar Cambios' : 'Registrar Hierro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
