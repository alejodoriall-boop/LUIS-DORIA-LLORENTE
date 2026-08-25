import React, { useState } from 'react';
import { FarmDataPackage, DailyRainfallInput, RainIntensity } from '../../types';
import { CloudRain, Calendar, Building2, Droplets, Info, Check, X, Ruler, Shield, Layers } from 'lucide-react';

interface RegisterRainfallModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  onSaveRainfall: (input: DailyRainfallInput) => void;
}

export const RegisterRainfallModal: React.FC<RegisterRainfallModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  onSaveRainfall,
}) => {
  const [selectedFarmId, setSelectedFarmId] = useState<string>(currentFarmId || (farms[0]?.profile.id || 'finca-el-roble'));
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amountMm, setAmountMm] = useState<number>(25.0);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [intensity, setIntensity] = useState<RainIntensity>('moderada');
  const [recordedBy, setRecordedBy] = useState<string>('Carlos Mendoza (Mayordomo)');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const targetFarm = farms.find((f) => f.profile.id === selectedFarmId) || farms[0];

  // Water volume calculations
  const litersPerM2 = amountMm; // 1 mm = 1 Liter / m²
  const litersPerHa = amountMm * 10000; // 1 Ha = 10,000 m²
  const farmAreaHa = targetFarm?.profile.totalAreaHa || 100;
  const totalFarmLiters = litersPerHa * farmAreaHa;
  const totalM3 = Math.round(totalFarmLiters / 1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountMm <= 0) return;

    onSaveRainfall({
      farmId: selectedFarmId,
      date,
      amountMm: Number(amountMm),
      durationMinutes: Number(durationMinutes),
      intensity,
      recordedBy,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-3xl border-2 border-[#012d1d] shadow-2xl max-w-3xl lg:max-w-5xl lg:max-w-6xl w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#0D1A13] text-white p-5 flex items-center justify-between border-b-2 border-[#ffba38]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#123F2A] rounded-2xl text-[#A5B8AC] border border-[#2d6a4f]">
              <CloudRain className="w-6 h-6 text-[#ffba38]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase font-mono text-[#ffba38] tracking-wider">
                Control Pluviométrico
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                Registrar Lluvia (mm)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#A5B8AC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Farm Selector */}
          <div>
            <label className="block text-xs font-bold text-white uppercase mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#2d6a4f]" />
              Predio o Finca Receptora:
            </label>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full p-3 bg-[#15241C] border-2 border-white/10 rounded-2xl text-sm font-bold text-white focus:border-[#012d1d] focus:outline-none"
            >
              {farms.map((f) => (
                <option key={f.profile.id} value={f.profile.id}>
                  {f.profile.name} ({f.profile.municipality}, {f.profile.department} • {f.profile.totalAreaHa} Ha)
                </option>
              ))}
            </select>
          </div>

          {/* Date & Amount Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white uppercase mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#2d6a4f]" />
                Fecha del Evento:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-[#15241C] border-2 border-white/10 rounded-2xl text-sm font-bold text-white focus:border-[#012d1d] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase mb-1 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#0077b6]" />
                Lluvia Caída (mm):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="300"
                  value={amountMm}
                  onChange={(e) => setAmountMm(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-[#f0f8ff] border-2 border-[#0077b6] rounded-2xl text-lg font-black font-mono text-[#03045e] focus:outline-none pr-14"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#0077b6] font-mono">
                  mm
                </span>
              </div>
            </div>
          </div>

          {/* Duration & Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                Duración Estimada (Minutos):
              </label>
              <input
                type="number"
                min="5"
                max="720"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                className="w-full p-2.5 bg-[#15241C] border border-white/10 rounded-xl text-xs font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
                Intensidad de la Lluvia:
              </label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as RainIntensity)}
                className="w-full p-2.5 bg-[#15241C] border border-white/10 rounded-xl text-xs font-bold text-white"
              >
                <option value="suave">Suave / Garúa (Llovizna)</option>
                <option value="moderada">Moderada (Constante)</option>
                <option value="fuerte">Fuerte (Aguacero)</option>
                <option value="torrencial">Torrencial (Vendaval / Tormenta)</option>
              </select>
            </div>
          </div>

          {/* Live Water Volume Conversion Box */}
          <div className="bg-[#f0f7f4] border-2 border-[#c1ecd4] rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-white font-black">
              <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-[#2d6a4f]">
                <Ruler className="w-4 h-4 text-white" /> Equivalencia Hidrológica:
              </span>
              <span className="bg-[#0D1A13] text-[#A5B8AC] font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                1 mm = 1 L/m²
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#c1ecd4]/60">
              <div className="bg-[#15241C] p-2 rounded-xl border border-[#c1ecd4]">
                <span className="text-[9px] text-[#717973] block uppercase font-bold">Por m²</span>
                <span className="font-mono font-black text-white text-sm">{litersPerM2} L</span>
              </div>
              <div className="bg-[#15241C] p-2 rounded-xl border border-[#c1ecd4]">
                <span className="text-[9px] text-[#717973] block uppercase font-bold">Por Hectárea</span>
                <span className="font-mono font-black text-[#0077b6] text-sm">
                  {(litersPerHa / 1000).toLocaleString()} m³
                </span>
              </div>
              <div className="bg-[#0D1A13] text-white p-2 rounded-xl">
                <span className="text-[9px] text-[#A5B8AC] block uppercase font-bold">En la Finca ({farmAreaHa} Ha)</span>
                <span className="font-mono font-black text-[#ffba38] text-sm">
                  {totalM3.toLocaleString()} m³
                </span>
              </div>
            </div>
          </div>

          {/* Observer & Notes */}
          <div>
            <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
              Registrado por:
            </label>
            <input
              type="text"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              placeholder="Nombre del mayordomo o estación"
              className="w-full p-2.5 bg-[#15241C] border border-white/10 rounded-xl text-xs font-medium text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#414844] uppercase mb-1">
              Notas / Observación del Terreno:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej. Creciente en caño central, escorrentía en potrero 3, suficiente para brote de pasto..."
              className="w-full p-2.5 bg-[#15241C] border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#eeeeee] flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#414844] font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#0D1A13] hover:bg-[#123F2A] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#ffba38]" />
              <span>Guardar Registro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
