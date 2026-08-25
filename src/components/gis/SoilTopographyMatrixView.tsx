import React from 'react';
import { PaddockGeo, ContourLine, FloodZoneFeature } from '../../types';
import { Mountain, FlaskConical, Waves, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface SoilTopographyMatrixViewProps {
  paddocks: PaddockGeo[];
  contours: ContourLine[];
  floodZones: FloodZoneFeature[];
  onSelectPaddock: (paddock: PaddockGeo) => void;
}

export const SoilTopographyMatrixView: React.FC<SoilTopographyMatrixViewProps> = ({
  paddocks,
  contours,
  floodZones,
  onSelectPaddock,
}) => {
  // Agronomic averages
  const avgPh = (
    paddocks.reduce((sum, p) => sum + p.soilAnalysis.ph, 0) / paddocks.length
  ).toFixed(1);
  const avgOrganicMatter = (
    paddocks.reduce((sum, p) => sum + p.soilAnalysis.organicMatterPct, 0) / paddocks.length
  ).toFixed(1);
  const totalLimingNeededTon = paddocks
    .reduce((sum, p) => sum + p.soilAnalysis.limingRecommendationTonHa * p.areaHa, 0)
    .toFixed(1);
  const floodProneAreaHa = paddocks
    .filter((p) => p.isFloodProne)
    .reduce((sum, p) => sum + p.areaHa, 0)
    .toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Agronomic Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">pH Promedio Finca</p>
          <p className="text-xl font-mono font-extrabold text-white">{avgPh}</p>
          <p className="text-[10px] text-emerald-400 font-bold">Rango aceptable para pasturas</p>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Materia Orgánica (MO)</p>
          <p className="text-xl font-mono font-extrabold text-white">{avgOrganicMatter}%</p>
          <p className="text-[10px] text-[#A5B8AC]">Buena retención de humedad</p>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Cal Dolomítica Necesaria</p>
          <p className="text-xl font-mono font-extrabold text-[#D4A94E]">{totalLimingNeededTon} Ton</p>
          <p className="text-[10px] text-[#A5B8AC]">Corrección acidez y aluminio</p>
        </div>

        <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-[#A5B8AC]">Área Inundable / Bajíos</p>
          <p className="text-xl font-mono font-extrabold text-sky-400">{floodProneAreaHa} Ha</p>
          <p className="text-[10px] text-[#A5B8AC]">Manejo con Humidicola & Alemán</p>
        </div>
      </div>

      {/* Detailed Soil & Topography Matrix Table */}
      <div className="bg-[#15241C] rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="bg-[#123F2A] text-white p-4 flex items-center justify-between border-b border-white/10">
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#D4A94E]" />
            Matriz de Estudios de Suelo, Topografía & Drenajes
          </h3>
          <span className="text-xs font-mono text-[#A5B8AC]">{paddocks.length} potreros analizados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0D1A13] text-[#A5B8AC] uppercase text-[10px] font-bold border-b border-white/10">
                <th className="p-3.5">Potrero</th>
                <th className="p-3.5">Área</th>
                <th className="p-3.5">Topografía & Cota</th>
                <th className="p-3.5">Tipo de Suelo</th>
                <th className="p-3.5">pH</th>
                <th className="p-3.5">Materia Orgánica</th>
                <th className="p-3.5">Fósforo (P)</th>
                <th className="p-3.5">Inundabilidad</th>
                <th className="p-3.5">Recomendación Encalado/Fertilizante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paddocks.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectPaddock(p)}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-[#0D1A13] text-[#D4A94E] border border-[#D4A94E]/30 px-1.5 py-0.5 rounded font-bold text-[11px]">
                        {p.code}
                      </span>
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-white">{p.areaHa} Ha</td>
                  <td className="p-3.5">
                    <span className="capitalize font-bold text-white">{p.topography}</span>
                    <span className="text-[10px] text-[#A5B8AC] block">
                      {p.avgSlopePct}% pend. • {p.elevationMsnm} msnm
                    </span>
                  </td>
                  <td className="p-3.5 text-[#A5B8AC]">{p.soilAnalysis.soilType}</td>
                  <td className="p-3.5 font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        p.soilAnalysis.ph < 5.5
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                          : p.soilAnalysis.ph > 6.5
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {p.soilAnalysis.ph}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-white">{p.soilAnalysis.organicMatterPct}%</td>
                  <td className="p-3.5 font-mono text-white">{p.soilAnalysis.phosphorusPpm} ppm</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.isFloodProne ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {p.floodRisk}
                    </span>
                  </td>
                  <td className="p-3.5 text-[11px] text-[#A5B8AC] max-w-xs">
                    {p.soilAnalysis.limingRecommendationTonHa > 0 && (
                      <span className="font-bold text-[#D4A94E] block">
                        Cal: {p.soilAnalysis.limingRecommendationTonHa} Ton/Ha
                      </span>
                    )}
                    <span className="text-[#A5B8AC] truncate block">
                      {p.soilAnalysis.fertilizerRecommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
