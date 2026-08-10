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
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">Almacenamiento Total</p>
          <p className="text-xl font-mono font-extrabold text-[#0077b6]">
            {(totalStorageCapacityLiters / 1000).toFixed(0)}{' '}
            <span className="text-xs text-[#717973]">m³ ({totalStorageCapacityLiters.toLocaleString()} L)</span>
          </p>
          <p className="text-[10px] text-emerald-700 font-bold">Autonomía estimada: 3.5 días</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">Red de Tuberías</p>
          <p className="text-xl font-mono font-extrabold text-[#012d1d]">
            {(totalPipelineLengthMeters / 1000).toFixed(1)}{' '}
            <span className="text-xs text-[#717973]">km lineales</span>
          </p>
          <p className="text-[10px] text-[#717973]">PVC y Polietileno HDPE</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">Bebederos en Red</p>
          <p className="text-xl font-mono font-extrabold text-[#012d1d]">
            {waterInfra.troughs.length}{' '}
            <span className="text-xs text-[#717973]">estaciones</span>
          </p>
          <p className="text-[10px] text-[#717973]">Con válvulas de flotador alto caudal</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">Fuentes de Captación</p>
          <p className="text-xl font-mono font-extrabold text-[#523700]">
            {waterInfra.sources.length}{' '}
            <span className="text-xs text-[#717973]">fuentes</span>
          </p>
          <p className="text-[10px] text-[#717973]">Pozos profundos y nacimientos</p>
        </div>
      </div>

      {/* Grid of Water Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tanks & Storage */}
        <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow overflow-hidden">
          <div className="bg-[#1b4332] text-white p-4 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-300" />
              Tanques de Reserva & Presión
            </h3>
            <span className="text-xs font-mono text-[#86af99]">{waterInfra.tanks.length} tanques</span>
          </div>

          <div className="p-4 space-y-3">
            {waterInfra.tanks.map((tank) => (
              <div
                key={tank.id}
                className="p-3.5 bg-[#f3f3f3] rounded-2xl border border-[#c1c8c2] flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#012d1d]">{tank.name}</h4>
                  <p className="text-xs text-[#717973]">
                    Cota: {tank.elevationMsnm} msnm • Tipo: {tank.type.replace('_', ' ')}
                  </p>
                </div>
                <span className="font-mono font-extrabold text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                  {tank.capacityLiters.toLocaleString()} L
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipelines Network */}
        <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow overflow-hidden">
          <div className="bg-[#1b4332] text-white p-4 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-300" />
              Líneas Matrices & Conducción
            </h3>
            <span className="text-xs font-mono text-[#86af99]">
              {waterInfra.pipelines.length} ramales
            </span>
          </div>

          <div className="p-4 space-y-3">
            {waterInfra.pipelines.map((pipe) => (
              <div
                key={pipe.id}
                className="p-3.5 bg-[#f3f3f3] rounded-2xl border border-[#c1c8c2] flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#012d1d]">{pipe.name}</h4>
                  <p className="text-xs text-[#717973]">
                    Diámetro: {pipe.diameterInches} • Material: {pipe.material} ({pipe.pressureType})
                  </p>
                </div>
                <span className="font-mono font-bold text-xs text-[#012d1d] bg-white px-2.5 py-1 rounded-xl border border-[#c1c8c2]">
                  {pipe.lengthM.toLocaleString()} m
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drinking Troughs Matrix */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow overflow-hidden">
        <div className="bg-[#1b4332] text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-300" />
            Red de Bebederos en Potreros
          </h3>
          <span className="text-xs font-mono text-[#86af99]">
            {waterInfra.troughs.length} bebederos
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {waterInfra.troughs.map((trough) => (
            <div
              key={trough.id}
              className="p-3 bg-[#f3f3f3] rounded-2xl border border-[#c1c8c2] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#012d1d]">{trough.name}</span>
                <span className="font-mono font-bold text-xs text-blue-700">
                  {trough.capacityLiters} L
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#717973]">
                <span>Caudal: {trough.flowRateLpm} L/min</span>
                <span>Flotador: {trough.hasFloatValve ? '✅ Sí' : '❌ No'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {trough.servesPaddockCodes.map((code) => (
                  <span
                    key={code}
                    className="text-[10px] font-mono font-bold bg-[#1b4332] text-[#c1ecd4] px-1.5 py-0.5 rounded"
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
