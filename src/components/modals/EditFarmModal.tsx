import React, { useState, useEffect } from 'react';
import { FarmGeoProfile, FarmProductionType } from '../../types';
import { X, Save, Edit3, Building, MapPin, AlertCircle, FileText, Power, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface EditFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmGeoProfile | null;
  onSave: (updatedFarm: FarmGeoProfile) => void;
}

export const EditFarmModal: React.FC<EditFarmModalProps> = ({
  isOpen,
  onClose,
  farm,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [legalOwner, setLegalOwner] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [cadastralCode, setCadastralCode] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [vereda, setVereda] = useState('');
  const [elevationMsnm, setElevationMsnm] = useState<number>(135);
  const [totalAreaHa, setTotalAreaHa] = useState<number>(100);
  const [productionType, setProductionType] = useState<FarmProductionType>('ceba');
  const [notes, setNotes] = useState('');
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && farm) {
      setName(farm.name || '');
      setLegalOwner(farm.legalOwner || '');
      setRegistrationNumber(farm.registrationNumber || '');
      setCadastralCode(farm.cadastralCode || '');
      setContactPhone(farm.contactPhone || '');
      setDepartment(farm.department || '');
      setMunicipality(farm.municipality || '');
      setVereda(farm.vereda || '');
      setElevationMsnm(farm.elevationMsnm || 135);
      setTotalAreaHa(farm.totalAreaHa || 100);
      setProductionType(farm.productionType || 'ceba');
      setNotes(farm.notes || '');
      setIsDisabled(!!farm.isDisabled);
      setErrorMsg(null);
    }
  }, [farm?.id, isOpen]);

  if (!isOpen || !farm) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre de la finca es obligatorio.');
      return;
    }

    const updated: FarmGeoProfile = {
      ...farm,
      name: name.trim(),
      legalOwner: legalOwner.trim(),
      registrationNumber: registrationNumber.trim(),
      cadastralCode: cadastralCode.trim(),
      contactPhone: contactPhone.trim(),
      department: department.trim(),
      municipality: municipality.trim(),
      vereda: vereda.trim(),
      elevationMsnm: Number(elevationMsnm),
      totalAreaHa: Number(totalAreaHa),
      productionType,
      notes: notes.trim(),
      isDisabled,
      lastUpdated: new Date().toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#c1c8c2] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#012d1d] text-white px-5 py-4 sm:px-6 flex items-center justify-between border-b border-[#2d6a4f]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1b4332] text-[#c1ecd4] rounded-2xl border border-[#2d6a4f]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Editar Datos del Predio</h3>
              <p className="text-xs text-[#c1ecd4]/80 mt-0.5">
                {farm.name} • {farm.municipality}, {farm.department}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-xl border-l-4 border-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-[#012d1d] uppercase tracking-wider mb-1">
              Nombre de la Finca / Predio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-[#fcfdfc]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#414844] mb-1">
                Propietario / Razón Social
              </label>
              <input
                type="text"
                value={legalOwner}
                onChange={(e) => setLegalOwner(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] mb-1">
                Registro Sanitario ICA
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] mb-1">
                Matrícula / Código Catastral
              </label>
              <input
                type="text"
                value={cadastralCode}
                onChange={(e) => setCadastralCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#414844] mb-1">
                Departamento
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] mb-1">
                Municipio
              </label>
              <input
                type="text"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] mb-1">
                Vereda / Sector
              </label>
              <input
                type="text"
                value={vereda}
                onChange={(e) => setVereda(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-[#012d1d] mb-1">
                Área Total (Hectáreas)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={totalAreaHa}
                onChange={(e) => setTotalAreaHa(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#2d6a4f] text-sm font-bold text-[#012d1d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] mb-1">
                Elevación (msnm)
              </label>
              <input
                type="number"
                value={elevationMsnm}
                onChange={(e) => setElevationMsnm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#414844] mb-1">
                Enfoque Productivo
              </label>
              <select
                value={productionType}
                onChange={(e) => setProductionType(e.target.value as FarmProductionType)}
                className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-bold bg-white"
              >
                <option value="ceba">Ceba Intensiva</option>
                <option value="cria">Cría y Levante</option>
                <option value="doble_proposito">Doble Propósito</option>
                <option value="lecheria_especializada">Lechería Especializada</option>
                <option value="genetica_pura">Genética & Cabaña</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#414844] mb-1">
              Notas y Descripción Operativa
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            />
          </div>

          {/* Estado del Predio (Habilitado / Deshabilitado) */}
          <div className="p-3.5 rounded-2xl bg-[#f8faf8] border-2 border-[#c1c8c2] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-extrabold text-xs text-[#012d1d] flex items-center gap-1.5">
                  <Power className={`w-4 h-4 ${isDisabled ? 'text-amber-600' : 'text-emerald-700'}`} />
                  <span>Estado del Predio / Finca:</span>
                </label>
                <p className="text-[11px] text-[#555] mt-0.5">
                  {isDisabled ? (
                    <span className="font-bold text-amber-800">
                      🚫 Deshabilitado — Conserva potreros, hatos e historial 100% intactos.
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-800">
                      ● Activo — Totalmente operativo para registros diarios.
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDisabled(!isDisabled)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isDisabled
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-300'
                }`}
              >
                {isDisabled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Re-Habilitar Predio</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                    <span>Deshabilitar Predio</span>
                  </>
                )}
              </button>
            </div>

            {isDisabled && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10.5px] text-amber-900 font-medium">
                💡 <b>Información Segura:</b> Al deshabilitar este predio, <b>no se borra ninguna información</b> (se mantienen intactos potreros, pluviómetros, pesajes, inventario y movimientos). Solo se oculta temporalmente para evitar registros por error.
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-[#c1c8c2] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#717973] hover:bg-[#eeeeee] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-[#c1ecd4]" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
