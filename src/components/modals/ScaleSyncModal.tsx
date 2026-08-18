import React, { useState } from 'react';
import {
  Scale,
  Bluetooth,
  Wifi,
  Cable,
  Radio,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  X,
  BatteryCharging,
  Signal,
  Sliders,
  Sparkles,
  Layers,
  Zap,
  Tag,
  Beef,
  Plus,
} from 'lucide-react';
import { LivestockScaleHook } from '../../hooks/useLivestockScale';
import { ScaleBrand, ScaleConnectionType } from '../../types';

interface ScaleSyncModalProps {
  scaleHook: LivestockScaleHook;
  isOpen: boolean;
  onClose: () => void;
  onSelectWeightToForm?: (weight: number, tag?: string) => void;
}

export const ScaleSyncModal: React.FC<ScaleSyncModalProps> = ({
  scaleHook,
  isOpen,
  onClose,
  onSelectWeightToForm,
}) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'live' | 'wifi' | 'serial' | 'settings'>('live');
  const [wifiIp, setWifiIp] = useState('192.168.1.185');
  const [wifiPort, setWifiPort] = useState(4001);
  const [serialBaud, setSerialBaud] = useState(9600);
  const [customTagInput, setCustomTagInput] = useState('');

  if (!isOpen) return null;

  const {
    scales,
    activeScale,
    reading,
    isScanning,
    filterSensitivity,
    connectScale,
    disconnectScale,
    scanForBluetoothDevices,
    connectWifiScale,
    connectSerialScale,
    tareScale,
    lockCurrentWeight,
    unlockWeight,
    simulateNextAnimal,
    setPlatformEmpty,
    toggleSound,
    toggleRFID,
    setUnit,
    setFilterSensitivity,
    readRFIDTag,
  } = scaleHook;

  const handleCaptureAndApply = () => {
    const lockedVal = reading.isLocked ? reading.weight : lockCurrentWeight();
    if (onSelectWeightToForm) {
      onSelectWeightToForm(lockedVal, activeScale?.lastEIDTag);
    }
    onClose();
  };

  const handleScanRFID = () => {
    const tag = readRFIDTag();
    setCustomTagInput(tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="bg-white w-full max-w-3xl rounded-3xl border border-[#c1c8c2] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#012d1d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ffba38] text-[#523700] rounded-2xl shadow-md">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold tracking-tight">
                  Consola de Báscula Ganadera
                </h2>
                <span className="bg-[#c1ecd4] text-[#002114] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Hardware Sync
                </span>
              </div>
              <p className="text-xs text-[#a5d0b9]">
                Sincronización digital con indicadores Tru-Test, Gallagher, Hook, Iconix y RFID
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className="bg-[#f3f3f3] border-b border-[#c1c8c2] px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-[#e8e8e8] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'live'
                  ? 'bg-[#012d1d] text-white shadow-sm'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Visor en Vivo
            </button>

            <button
              onClick={() => setActiveTab('devices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'devices'
                  ? 'bg-[#012d1d] text-white shadow-sm'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              <Bluetooth className="w-3.5 h-3.5" />
              Básculas Bluetooth ({scales.filter((s) => s.connectionType === 'bluetooth').length})
            </button>

            <button
              onClick={() => setActiveTab('wifi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'wifi'
                  ? 'bg-[#012d1d] text-white shadow-sm'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              Wi-Fi / Red
            </button>

            <button
              onClick={() => setActiveTab('serial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'serial'
                  ? 'bg-[#012d1d] text-white shadow-sm'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              <Cable className="w-3.5 h-3.5" />
              Serial RS232
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#012d1d] text-white shadow-sm'
                  : 'text-[#414844] hover:text-[#012d1d]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Ajustes
            </button>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center gap-2">
            {activeScale ? (
              <div className="flex items-center gap-2 bg-[#c1ecd4] border border-[#a5d0b9] px-3 py-1 rounded-full text-xs font-bold text-[#002114]">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="truncate max-w-[150px] md:max-w-none">
                  {activeScale.brand} ({activeScale.battery}%)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#ffdacf] border border-[#ffb4a8] px-3 py-1 rounded-full text-xs font-bold text-[#ba1a1a]">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Desconectada</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#f9f9f9]">
          {/* TAB 1: LIVE VIEWER (VISOR EN VIVO) */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              {/* Digital LED Scale Display Box */}
              <div className="bg-[#00180f] rounded-3xl p-6 md:p-8 border-4 border-[#012d1d] shadow-2xl relative overflow-hidden text-center">
                {/* Decorative scale screen grid overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#1b4332_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

                {/* Scale Top Bar */}
                <div className="flex items-center justify-between text-xs font-mono text-[#a5d0b9] border-b border-[#1b4332] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#1b4332] text-white font-bold">
                      {activeScale?.brand || 'BÁSCULA VIRTUAL'}
                    </span>
                    <span>{activeScale?.model || 'XR5000 DUAL LOAD-CELL'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Signal className="w-3.5 h-3.5 text-emerald-400" />
                      {activeScale?.signal || 98}%
                    </span>
                    <span className="flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                      {activeScale?.battery || 94}%
                    </span>
                  </div>
                </div>

                {/* Stability Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase mb-2 shadow-inner">
                  {reading.weight === 0 ? (
                    <span className="bg-[#313632] text-[#c1c8c2] px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      PLATAFORMA EN CERO (TARA 0.0)
                    </span>
                  ) : reading.isStable ? (
                    <span className="bg-[#1b4332] text-[#c1ecd4] border border-[#2d6a4f] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-950/50">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      PESO ESTABLE 🔒 [BLOQUEADO]
                    </span>
                  ) : (
                    <span className="bg-[#ffba38]/20 text-[#ffba38] border border-[#ffba38]/40 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ESTABILIZANDO FILTRO BOVINO...
                    </span>
                  )}
                </div>

                {/* BIG DIGITAL LCD NUMBERS */}
                <div className="my-2">
                  <span className="font-mono text-6xl md:text-8xl font-black tracking-tight text-[#c1ecd4] drop-shadow-[0_0_25px_rgba(45,106,79,0.8)]">
                    {reading.weight.toFixed(1)}
                  </span>
                  <span className="font-mono text-2xl md:text-3xl font-bold text-[#a5d0b9] ml-2">
                    {reading.unit}
                  </span>
                </div>

                {/* EID Ear Tag Reader Box */}
                {activeScale?.rfidConnected && activeScale.lastEIDTag && (
                  <div className="mt-4 pt-3 border-t border-[#1b4332] flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                    <span className="text-[#a5d0b9] flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-[#ffba38] animate-pulse" />
                      Arete Electrónico (RFID EID):
                    </span>
                    <span className="bg-[#ffba38]/20 border border-[#ffba38]/40 text-[#ffba38] px-2.5 py-0.5 rounded font-bold">
                      {activeScale.lastEIDTag}
                    </span>
                  </div>
                )}
              </div>

              {/* Physical Chute Scale Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={tareScale}
                  className="bg-white hover:bg-[#f3f3f3] border-2 border-[#c1c8c2] text-[#012d1d] font-bold p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <RefreshCw className="w-5 h-5 text-[#012d1d]" />
                  <span className="text-xs">Tara (Poner a 0.0)</span>
                </button>

                <button
                  type="button"
                  onClick={() => (reading.isLocked ? unlockWeight() : lockCurrentWeight())}
                  className={`font-bold p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm border-2 ${
                    reading.isLocked
                      ? 'bg-[#c1ecd4] border-[#1b4332] text-[#002114]'
                      : 'bg-white hover:bg-[#f3f3f3] border-[#c1c8c2] text-[#012d1d]'
                  }`}
                >
                  {reading.isLocked ? (
                    <>
                      <Unlock className="w-5 h-5 text-emerald-700" />
                      <span className="text-xs">Desbloquear Peso</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-[#012d1d]" />
                      <span className="text-xs">Bloquear / Congelar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => simulateNextAnimal()}
                  className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md col-span-1 sm:col-span-1"
                >
                  <Beef className="w-5 h-5 text-[#ffba38]" />
                  <span className="text-xs">Simular Siguiente Bovino</span>
                </button>

                <button
                  type="button"
                  onClick={handleScanRFID}
                  className="bg-white hover:bg-[#f3f3f3] border-2 border-[#c1c8c2] text-[#012d1d] font-bold p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <Radio className="w-5 h-5 text-[#ffba38]" />
                  <span className="text-xs">Leer RFID Stick</span>
                </button>
              </div>

              {/* Action Banner to Apply Weight */}
              {onSelectWeightToForm && (
                <div className="bg-[#c1ecd4]/50 border border-[#a5d0b9] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#002114]">
                      ¿Usar este peso en el formulario de pesaje?
                    </h4>
                    <p className="text-xs text-[#274e3d]">
                      Se transferirá automáticamente {reading.weight} kg a la ficha del lote o animal.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCaptureAndApply}
                    className="w-full sm:w-auto bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-bold px-6 py-3 rounded-xl tactical-shadow flex items-center justify-center gap-2 text-sm transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Capturar {reading.weight} kg y Aplicar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BLUETOOTH DEVICES LIST */}
          {activeTab === 'devices' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#012d1d]">
                    Básculas e Indicadores Bluetooth Disponibles
                  </h3>
                  <p className="text-xs text-[#414844]">
                    Conexión directa vía Bluetooth Low Energy (BLE) a barras de pesaje y consolas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={scanForBluetoothDevices}
                  disabled={isScanning}
                  className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'Buscando Básculas...' : 'Escanear Dispositivos'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scales
                  .filter((s) => s.connectionType === 'bluetooth')
                  .map((scale) => {
                    const isConnected = scale.status === 'connected';
                    const isConnecting = scale.status === 'connecting';

                    return (
                      <div
                        key={scale.id}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                          isConnected
                            ? 'bg-[#c1ecd4]/30 border-[#1b4332] shadow-md'
                            : 'bg-white border-[#c1c8c2] hover:border-[#717973]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2.5 rounded-xl ${
                                isConnected
                                  ? 'bg-[#1b4332] text-[#c1ecd4]'
                                  : 'bg-[#f3f3f3] text-[#414844]'
                              }`}
                            >
                              <Bluetooth className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[#012d1d]">{scale.name}</h4>
                              <p className="text-xs text-[#717973]">{scale.model}</p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[#414844]">
                                <span>Batería: {scale.battery}%</span>
                                <span>•</span>
                                <span>Señal: {scale.signal}%</span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isConnected
                                ? 'bg-emerald-700 text-white'
                                : isConnecting
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-[#e8e8e8] text-[#414844]'
                            }`}
                          >
                            {isConnected
                              ? 'Conectada'
                              : isConnecting
                              ? 'Conectando...'
                              : 'Disponible'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#c1c8c2]/50">
                          <div className="flex items-center gap-2 text-xs text-[#414844]">
                            <Radio className="w-3.5 h-3.5 text-emerald-600" />
                            <span>RFID: {scale.rfidConnected ? 'Habilitado' : 'No'}</span>
                          </div>

                          {isConnected ? (
                            <button
                              type="button"
                              onClick={() => disconnectScale(scale.id)}
                              className="px-3 py-1.5 bg-[#ffdacf] hover:bg-[#ffb4a8] text-[#ba1a1a] rounded-lg text-xs font-bold transition-colors"
                            >
                              Desconectar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => connectScale(scale.id)}
                              disabled={isConnecting}
                              className="px-4 py-1.5 bg-[#012d1d] hover:bg-[#1b4332] text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              {isConnecting ? 'Emparejando...' : 'Conectar'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: WI-FI / TCP IP */}
          {activeTab === 'wifi' && (
            <div className="bg-white p-6 rounded-2xl border border-[#c1c8c2] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#c1ecd4] text-[#002114] rounded-2xl">
                  <Wifi className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#012d1d]">
                    Conexión por Red Local Wi-Fi (Socket TCP/IP)
                  </h3>
                  <p className="text-xs text-[#414844]">
                    Ideal para básculas de puente o mangas con indicador conectado a router de finca.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#012d1d] mb-1">
                    Dirección IP del Indicador:
                  </label>
                  <input
                    type="text"
                    value={wifiIp}
                    onChange={(e) => setWifiIp(e.target.value)}
                    placeholder="192.168.1.185"
                    className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl text-xs font-mono text-[#1a1c1c] focus:outline-none focus:border-[#012d1d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#012d1d] mb-1">
                    Puerto TCP / UDP:
                  </label>
                  <input
                    type="number"
                    value={wifiPort}
                    onChange={(e) => setWifiPort(Number(e.target.value))}
                    placeholder="4001"
                    className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl text-xs font-mono text-[#1a1c1c] focus:outline-none focus:border-[#012d1d]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => connectWifiScale(wifiIp, wifiPort)}
                  className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <Wifi className="w-4 h-4" />
                  Conectar a Báscula Wi-Fi
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SERIAL RS-232 */}
          {activeTab === 'serial' && (
            <div className="bg-white p-6 rounded-2xl border border-[#c1c8c2] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#ffba38]/30 text-[#523700] rounded-2xl">
                  <Cable className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#012d1d]">
                    Conexión Serial RS-232 / USB OTG
                  </h3>
                  <p className="text-xs text-[#414844]">
                    Compatible con cables RS-232 a USB para indicadores Iconix, Systel, Baxtran y Torrey.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#012d1d] mb-1">
                    Velocidad en Baudios (Baud Rate):
                  </label>
                  <select
                    value={serialBaud}
                    onChange={(e) => setSerialBaud(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#c1c8c2] rounded-xl text-xs font-mono text-[#1a1c1c] focus:outline-none focus:border-[#012d1d]"
                  >
                    <option value={9600}>9600 bps (Estándar Tru-Test / Iconix)</option>
                    <option value={19200}>19200 bps (Gallagher)</option>
                    <option value={115200}>115200 bps (Alta velocidad)</option>
                    <option value={4800}>4800 bps (Legacy Hook)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#012d1d] mb-1">
                    Paridad y Bits de Parada:
                  </label>
                  <input
                    type="text"
                    disabled
                    value="8-N-1 (8 Data Bits, No Parity, 1 Stop Bit)"
                    className="w-full px-3 py-2 bg-[#e8e8e8] border border-[#c1c8c2] rounded-xl text-xs text-[#717973] font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => connectSerialScale(serialBaud)}
                  className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <Cable className="w-4 h-4" />
                  Abrir Puerto Serial RS-232
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: CALIBRATION & ADVANCED SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#c1c8c2] space-y-4">
                <h3 className="font-bold text-sm text-[#012d1d] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#012d1d]" />
                  Filtro Anti-Movimiento Bovino (Damping)
                </h3>
                <p className="text-xs text-[#414844]">
                  Compensa el pateo y forcejeo del ganado en la báscula para estabilizar el peso más rápido.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {(['alta', 'media', 'baja'] as const).map((sens) => (
                    <button
                      key={sens}
                      type="button"
                      onClick={() => setFilterSensitivity(sens)}
                      className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                        filterSensitivity === sens
                          ? 'bg-[#012d1d] text-white border-[#012d1d]'
                          : 'bg-[#f9f9f9] text-[#414844] border-[#c1c8c2] hover:bg-[#eeeeee]'
                      }`}
                    >
                      {sens === 'alta'
                        ? '⚡ Alta (Rápido 1.2s)'
                        : sens === 'media'
                        ? '⚖️ Media (Bovinos estándar)'
                        : '🐂 Baja (Toros bravos)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#c1c8c2] space-y-3">
                <h3 className="font-bold text-sm text-[#012d1d]">Preferencias de Hardware</h3>

                <div className="flex items-center justify-between py-2 border-b border-[#eeeeee]">
                  <div>
                    <p className="text-xs font-bold text-[#1a1c1c]">Bip Acústico al Estabilizar</p>
                    <p className="text-[11px] text-[#717973]">Emite señal de audio cuando se bloquea el peso.</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleSound}
                    className={`p-2 rounded-xl border ${
                      activeScale?.soundFeedback
                        ? 'bg-[#c1ecd4] text-[#002114] border-[#1b4332]'
                        : 'bg-[#f3f3f3] text-[#717973] border-[#c1c8c2]'
                    }`}
                  >
                    {activeScale?.soundFeedback ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#eeeeee]">
                  <div>
                    <p className="text-xs font-bold text-[#1a1c1c]">Lector de Arete Electrónico (RFID Stick)</p>
                    <p className="text-[11px] text-[#717973]">Vincula automáticamente el arete con Tru-Test SRS2.</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleRFID}
                    className={`p-2 rounded-xl border ${
                      activeScale?.rfidConnected
                        ? 'bg-[#c1ecd4] text-[#002114] border-[#1b4332]'
                        : 'bg-[#f3f3f3] text-[#717973] border-[#c1c8c2]'
                    }`}
                  >
                    <Radio className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-xs font-bold text-[#1a1c1c]">Unidades de Pesaje</p>
                    <p className="text-[11px] text-[#717973]">Alternar entre Kilogramos y Libras.</p>
                  </div>
                  <div className="flex gap-1 bg-[#e8e8e8] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUnit('kg')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        reading.unit === 'kg' ? 'bg-[#012d1d] text-white' : 'text-[#414844]'
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('lb')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        reading.unit === 'lb' ? 'bg-[#012d1d] text-white' : 'text-[#414844]'
                      }`}
                    >
                      lb
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f3f3f3] px-6 py-4 border-t border-[#c1c8c2] flex justify-between items-center">
          <div className="text-xs text-[#717973]">
            {activeScale ? `Conectado a ${activeScale.name}` : 'Báscula no conectada'}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-[#c1c8c2] hover:bg-[#eeeeee] text-[#1a1c1c] font-semibold rounded-xl text-xs transition-colors"
            >
              Cerrar
            </button>

            {onSelectWeightToForm && (
              <button
                type="button"
                onClick={handleCaptureAndApply}
                className="px-5 py-2.5 bg-[#ffba38] hover:bg-[#ffdeac] text-[#523700] font-bold rounded-xl text-xs tactical-shadow transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Usar {reading.weight} kg
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
