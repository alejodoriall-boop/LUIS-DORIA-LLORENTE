import React from 'react';
import { WaterInfrastructure, PaddockGeo } from '../../types';
import { Droplets, Layers, ShieldCheck, Zap, Activity } from 'lucide-react';

interface WaterInfrastructureViewProps {
  waterInfra: WaterInfrastructure;
  paddocks: PaddockGeo[];
}

export const WaterInfrastructureView: React.FC<WaterInfrastructureViewProps> = ({
  waterInfra,
  paddocks,
}) => {
  const totalStorageCapacityLiters =
    waterInfra.tanks.reduce((sum, t) => sum + t.capacityLiters, 0) +
    waterInfra.troughs.reduce((sum, tr) => sum + tr.capacityLiters, 0);

  const totalPipelineLengthMeters = waterInfra.pipelines.reduce(
    (sum, p) => sum + p.lengthM,
    0,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Almacenamiento Total</p>
          <p className="text-xl font-mono font-extrabold text-sky-400">
            {(totalStorageCapacityLiters / 1000).toFixed(0)}{' '}
            <span className="text-xs text-[#A5B8AC]">m³ ({totalStorageCapacityLiters.toLocaleString()} L)</span>
          </p>
          <p className="text-[10px] text-emerald-400 font-bold">Autonomía estimada: 3.5 días</p>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Red de Tuberías</p>
          <p className="text-xl font-mono font-extrabold text-white">
            {(totalPipelineLengthMeters / 1000).toFixed(1)}{' '}
            <span className="text-xs text-[#A5B8AC]">km lineales</span>
          </p>
          <p className="text-[10px] text-[#A5B8AC]">PVC y Polietileno HDPE</p>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Bebederos en Red</p>
          <p className="text-xl font-mono font-extrabold text-white">
            {waterInfra.troughs.length}{' '}
            <span className="text-xs text-[#A5B8AC]">estaciones</span>
          </p>
          <p className="text-[10px] text-[#A5B8AC]">Con válvulas de flotador alto caudal</p>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Fuentes de Captación</p>
          <p className="text-xl font-mono font-extrabold text-[#D4A94E]">
            {waterInfra.sources.length}{' '}
            <span className="text-xs text-[#A5B8AC]">fuentes</span>
          </p>
          <p className="text-[10px] text-[#A5B8AC]">Pozos profundos y nacimientos</p>
        </div>
      </div>

      {/* Grid of Water Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tanks & Storage */}
        <div className="bg-[#15241C] rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="bg-[#123F2A] text-white p-4 flex items-center justify-between border-b border-white/10">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              Tanques de Reserva & Presión
            </h3>
            <span className="text-xs font-mono text-[#A5B8AC]">{waterInfra.tanks.length} tanques</span>
          </div>

          <div className="p-4 space-y-3">
            {waterInfra.tanks.map((tank) => (
              <div
                key={tank.id}
                className="p-3.5 bg-[#1A2C22] rounded-2xl border border-white/10 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{tank.name}</h4>
                  <p className="text-xs text-[#A5B8AC]">
                    Cota: {tank.elevationMsnm} msnm • Tipo: {tank.type.replace('_', ' ')}
                  </p>
                </div>
                <span className="font-mono font-extrabold text-sm text-sky-300 bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-500/30">
                  {tank.capacityLiters.toLocaleString()} L
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipelines Network */}
        <div className="bg-[#15241C] rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="bg-[#123F2A] text-white p-4 flex items-center justify-between border-b border-white/10">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Líneas Matrices & Conducción
            </h3>
            <span className="text-xs font-mono text-[#A5B8AC]">
              {waterInfra.pipelines.length} ramales
            </span>
          </div>

          <div className="p-4 space-y-3">
            {waterInfra.pipelines.map((pipe) => (
              <div
                key={pipe.id}
                className="p-3.5 bg-[#1A2C22] rounded-2xl border border-white/10 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{pipe.name}</h4>
                  <p className="text-xs text-[#A5B8AC]">
                    Diámetro: {pipe.diameterInches} • Material: {pipe.material} ({pipe.pressureType})
                  </p>
                </div>
                <span className="font-mono font-bold text-xs text-white bg-[#0D1A13] px-2.5 py-1 rounded-xl border border-white/10">
                  {pipe.lengthM.toLocaleString()} m
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drinking Troughs Matrix */}
      <div className="bg-[#15241C] rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="bg-[#123F2A] text-white p-4 flex items-center justify-between border-b border-white/10">
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-400" />
            Red de Bebederos en Potreros
          </h3>
          <span className="text-xs font-mono text-[#A5B8AC]">
            {waterInfra.troughs.length} bebederos
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {waterInfra.troughs.map((trough) => (
            <div
              key={trough.id}
              className="p-3 bg-[#1A2C22] rounded-2xl border border-white/10 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{trough.name}</span>
                <span className="font-mono font-bold text-xs text-sky-300">
                  {trough.capacityLiters} L
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#A5B8AC]">
                <span>Caudal: {trough.flowRateLpm} L/min</span>
                <span>Flotador: {trough.hasFloatValve ? '✅ Sí' : '❌ No'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {trough.servesPaddockCodes.map((code) => (
                  <span
                    key={code}
                    className="text-[10px] font-mono font-bold bg-[#0D1A13] text-[#D4A94E] border border-[#D4A94E]/30 px-1.5 py-0.5 rounded"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
