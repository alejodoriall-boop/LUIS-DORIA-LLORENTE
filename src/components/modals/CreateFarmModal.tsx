import React, { useState } from 'react';
import { CreateFarmInput, FarmProductionType, FenceType } from '../../types';
import { REGION_PRESETS, RegionPreset } from '../../data/mockMultiFarmData';
import {
  X,
  PlusCircle,
  Building,
  MapPin,
  Compass,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wheat,
  Activity,
  Globe,
  Sliders,
  FileText,
} from 'lucide-react';

interface CreateFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFarm: (input: CreateFarmInput) => void;
}

export const CreateFarmModal: React.FC<CreateFarmModalProps> = ({
  isOpen,
  onClose,
  onCreateFarm,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('');
  const [legalOwner, setLegalOwner] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [cadastralCode, setCadastralCode] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [department, setDepartment] = useState('Córdoba');
  const [municipality, setMunicipality] = useState('Montería');
  const [vereda, setVereda] = useState('El Ceibal / Vega del Sinú');
  const [centerLat, setCenterLat] = useState<number>(8.7525);
  const [centerLng, setCenterLng] = useState<number>(-75.875);
  const [elevationMsnm, setElevationMsnm] = useState<number>(135);
  const [totalAreaHa, setTotalAreaHa] = useState<number>(250);

  const [productionType, setProductionType] = useState<FarmProductionType>('ceba');
  const [initialPaddocksCount, setInitialPaddocksCount] = useState<number>(6);
  const [predominantPasture, setPredominantPasture] = useState('Brachiaria Brizantha cv. Marandú');
  const [fenceType, setFenceType] = useState<FenceType>('electrica');
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Apply Region Preset
  const handleApplyPreset = (preset: RegionPreset) => {
    setDepartment(preset.department);
    setMunicipality(preset.municipality);
    setVereda(preset.vereda);
    setCenterLat(preset.defaultLat);
    setCenterLng(preset.defaultLng);
    setElevationMsnm(preset.elevationMsnm);
    setPredominantPasture(preset.predominantPasture);
    setProductionType(preset.defaultProduction);
  };

  // Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Por favor ingresa el nombre de la finca o predio.');
      setActiveStep(1);
      return;
    }
    if (totalAreaHa <= 0) {
      setErrorMsg('El área total debe ser mayor a 0 hectáreas.');
      setActiveStep(2);
      return;
    }

    const payload: CreateFarmInput = {
      name: name.trim(),
      legalOwner: legalOwner.trim() || 'Propietario Registrado',
      registrationNumber: registrationNumber.trim() || `ICA-${Math.floor(10000 + Math.random() * 90000)}-${new Date().getFullYear()}`,
      cadastralCode: cadastralCode.trim() || `${Math.floor(10000000000000000000 + Math.random() * 89999999999999999999)}`,
      department: department.trim(),
      municipality: municipality.trim(),
      vereda: vereda.trim(),
      totalAreaHa: Number(totalAreaHa),
      elevationMsnm: Number(elevationMsnm),
      centerLat: Number(centerLat),
      centerLng: Number(centerLng),
      productionType,
      initialPaddocksCount: Number(initialPaddocksCount),
      predominantPasture,
      fenceType,
      contactPhone: contactPhone.trim(),
      notes: notes.trim(),
    };

    onCreateFarm(payload);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setLegalOwner('');
    setRegistrationNumber('');
    setCadastralCode('');
    setContactPhone('');
    setTotalAreaHa(250);
    setInitialPaddocksCount(6);
    setNotes('');
    setErrorMsg(null);
    setActiveStep(1);
  };

  // Estimated Calculations
  const estimatedHeads = Math.round(totalAreaHa * (productionType === 'lecheria_especializada' ? 2.8 : 1.8));
  const avgPaddockHa = initialPaddocksCount > 0 ? (totalAreaHa / initialPaddocksCount).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#c1c8c2] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#012d1d] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-[#2d6a4f]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1b4332] text-[#c1ecd4] rounded-2xl border border-[#2d6a4f]">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Crear Nueva Finca / Predio
                </h3>
                <span className="text-[10px] font-bold uppercase bg-[#ffba38] text-[#523700] px-2 py-0.5 rounded-full font-mono">
                  Multi-Finca
                </span>
              </div>
              <p className="text-xs text-[#c1ecd4]/80 mt-0.5">
                Registra un nuevo predio ganadero con cartografía, potreros y hato independiente.
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

        {/* Step Indicator Tabs */}
        <div className="flex border-b border-[#c1c8c2] bg-[#f8faf8] px-4 sm:px-6">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeStep === 1
                ? 'border-[#012d1d] text-[#012d1d] bg-white'
                : 'border-transparent text-[#717973] hover:text-[#1a1c1c]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#012d1d] text-white text-[11px] flex items-center justify-center font-bold">
              1
            </span>
            <span className="hidden sm:inline">Datos Legales</span>
            <span className="sm:hidden">Legal</span>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeStep === 2
                ? 'border-[#012d1d] text-[#012d1d] bg-white'
                : 'border-transparent text-[#717973] hover:text-[#1a1c1c]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#012d1d] text-white text-[11px] flex items-center justify-center font-bold">
              2
            </span>
            <span className="hidden sm:inline">Ubicación y GPS</span>
            <span className="sm:hidden">Ubicación</span>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeStep === 3
                ? 'border-[#012d1d] text-[#012d1d] bg-white'
                : 'border-transparent text-[#717973] hover:text-[#1a1c1c]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#012d1d] text-white text-[11px] flex items-center justify-center font-bold">
              3
            </span>
            <span className="hidden sm:inline">Potreros y Producción</span>
            <span className="sm:hidden">Potreros</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-[#ffdad6] text-[#93000a] rounded-xl border-l-4 border-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: LEGAL & GENERAL INFO */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-extrabold text-[#012d1d] uppercase tracking-wider mb-1">
                  Nombre del Predio / Finca <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Ej. Hacienda San Jerónimo, Finca El Porvenir..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c1c8c2] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-[#fcfdfc] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#414844] mb-1">
                    Propietario / Razón Social
                  </label>
                  <input
                    type="text"
                    value={legalOwner}
                    onChange={(e) => setLegalOwner(e.target.value)}
                    placeholder="Ej. Inversiones Agropecuarias S.A.S."
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#414844] mb-1">
                    Teléfono / Celular de Contacto
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Ej. +57 310 555 1234"
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#414844] mb-1">
                    Código / Registro Sanitario ICA
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="Ej. ICA-23001-0982"
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
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
                    placeholder="Ej. 2300100020034..."
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414844] mb-1">
                  Notas u Observaciones del Predio
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Finca destinada a ceba con pastoreo intensivo y banco forrajero..."
                  className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & GPS */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Region Presets Quick Filler */}
              <div className="p-3 bg-[#eafaf1] rounded-2xl border border-[#c1ecd4]">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#012d1d] mb-2">
                  <Sparkles className="w-4 h-4 text-[#ffba38]" />
                  <span>Autocompletar por Zona / Región Ganadera:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {REGION_PRESETS.map((p) => (
                    <button
                      key={p.department}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                        department === p.department
                          ? 'bg-[#012d1d] text-white border-[#012d1d]'
                          : 'bg-white text-[#012d1d] border-[#c1c8c2] hover:bg-[#c1ecd4]/40'
                      }`}
                    >
                      {p.department} ({p.municipality})
                    </button>
                  ))}
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
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-[#012d1d] mb-1">
                    Área Total del Predio (Hectáreas) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={totalAreaHa}
                    onChange={(e) => setTotalAreaHa(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#2d6a4f] text-sm font-bold text-[#012d1d] focus:outline-none bg-[#f4fbf7]"
                  />
                  <span className="text-[10px] text-[#717973] mt-0.5 block">
                    Equivalente a {(totalAreaHa * 10000).toLocaleString()} m²
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#414844] mb-1">
                    Elevación (msnm)
                  </label>
                  <input
                    type="number"
                    value={elevationMsnm}
                    onChange={(e) => setElevationMsnm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#414844] mb-1">
                    Latitud Central (GPS)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={centerLat}
                    onChange={(e) => setCenterLat(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414844] mb-1">
                  Longitud Central (GPS)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={centerLng}
                  onChange={(e) => setCenterLng(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PRODUCTION & PADDOCKS */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-extrabold text-[#012d1d] uppercase tracking-wider mb-1.5">
                  Enfoque Productivo Principal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'ceba', label: 'Ceba Intensiva', icon: '🐂', desc: 'Engorde a pastoreo' },
                    { id: 'cria', label: 'Cría y Levante', icon: '🐄', desc: 'Vientres y destete' },
                    { id: 'doble_proposito', label: 'Doble Propósito', icon: '🥛', desc: 'Carne + Leche' },
                    { id: 'lecheria_especializada', label: 'Lechería Especializada', icon: '🧀', desc: 'Alta producción' },
                    { id: 'genetica_pura', label: 'Genética & Cabaña', icon: '🧬', desc: 'Pedigrí y biotecnología' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProductionType(item.id as FarmProductionType)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        productionType === item.id
                          ? 'border-[#012d1d] bg-[#012d1d] text-white shadow-md'
                          : 'border-[#c1c8c2] bg-white hover:bg-[#eeeeee] text-[#1a1c1c]'
                      }`}
                    >
                      <div className="text-xl mb-1">{item.icon}</div>
                      <p className="font-bold text-xs">{item.label}</p>
                      <p className={`text-[10px] mt-0.5 ${productionType === item.id ? 'text-[#c1ecd4]' : 'text-[#717973]'}`}>
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#414844] mb-1">
                    Potreros Iniciales a Generar
                  </label>
                  <select
                    value={initialPaddocksCount}
                    onChange={(e) => setInitialPaddocksCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-semibold bg-white"
                  >
                    <option value={0}>0 (Empezar mapa en blanco)</option>
                    <option value={4}>4 Potreros Rotacionales</option>
                    <option value={6}>6 Potreros Rotacionales</option>
                    <option value={8}>8 Potreros Rotacionales</option>
                    <option value={12}>12 Potreros Rotacionales</option>
                    <option value={16}>16 Potreros PRV Intensivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#414844] mb-1">
                    Tipo de Pasto Predominante
                  </label>
                  <select
                    value={predominantPasture}
                    onChange={(e) => setPredominantPasture(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-semibold bg-white"
                  >
                    <option value="Brachiaria Brizantha cv. Marandú">Brachiaria Brizantha cv. Marandú</option>
                    <option value="Panicum Maximum cv. Mombasa">Panicum Maximum cv. Mombasa</option>
                    <option value="Brachiaria Humidicola + Pasto Llanero">Brachiaria Humidicola + Llanero</option>
                    <option value="Brachiaria Decumbens + Kudzú">Brachiaria Decumbens + Kudzú</option>
                    <option value="Pasto Estrella Africana (Cynodon)">Pasto Estrella Africana</option>
                    <option value="Pasto Kikuyo (Pennisetum) + Ryegrass">Pasto Kikuyo + Ryegrass</option>
                    <option value="Ryegrass Tetraploide + Trébol Blanco">Ryegrass Tetraploide + Trébol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#414844] mb-1">
                    Tipo de Cerramiento
                  </label>
                  <select
                    value={fenceType}
                    onChange={(e) => setFenceType(e.target.value as FenceType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#c1c8c2] text-xs sm:text-sm font-semibold bg-white"
                  >
                    <option value="electrica">Cerca Eléctrica Ganadera</option>
                    <option value="puas">Alambre de Púas Tradicional</option>
                    <option value="viva">Cerca Viva Silvopastoril</option>
                    <option value="malla">Malla Graduada</option>
                  </select>
                </div>
              </div>

              {/* Summary card */}
              <div className="p-4 bg-[#f4fbf7] rounded-2xl border border-[#c1ecd4] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#012d1d]">
                    Resumen del Nuevo Predio Ganadero
                  </span>
                  <span className="text-[10px] font-mono text-[#2d6a4f] bg-[#c1ecd4] px-2 py-0.5 rounded font-bold">
                    Cálculo Automático
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-white rounded-xl border border-[#c1ecd4]">
                    <p className="text-[10px] text-[#717973] uppercase font-bold">Área Predial</p>
                    <p className="text-base font-extrabold text-[#012d1d]">{totalAreaHa} Ha</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-[#c1ecd4]">
                    <p className="text-[10px] text-[#717973] uppercase font-bold">Potreros</p>
                    <p className="text-base font-extrabold text-[#012d1d]">
                      {initialPaddocksCount > 0 ? `${initialPaddocksCount} (~${avgPaddockHa} Ha/c.u)` : '0'}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-[#c1ecd4]">
                    <p className="text-[10px] text-[#717973] uppercase font-bold">Hato Estimado</p>
                    <p className="text-base font-extrabold text-[#2d6a4f]">~{estimatedHeads} Cabezas</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-[#c1c8c2] flex items-center justify-between gap-3">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 text-xs font-bold text-[#414844] hover:bg-[#eeeeee] rounded-xl transition-colors"
                >
                  ← Anterior
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#717973] hover:bg-[#eeeeee] rounded-xl transition-colors"
              >
                Cancelar
              </button>

              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 1 && !name.trim()) {
                      setErrorMsg('Por favor ingresa el nombre de la finca antes de continuar.');
                      return;
                    }
                    setErrorMsg(null);
                    setActiveStep((prev) => (prev + 1) as any);
                  }}
                  className="px-5 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Siguiente Paso</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 border border-[#ffba38]/80 cursor-pointer active:scale-98"
                >
                  <PlusCircle className="w-4 h-4 text-[#012d1d]" />
                  <span>Crear y Activar Finca</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
