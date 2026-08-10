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
        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">pH Promedio Finca</p>
          <p className="text-xl font-mono font-extrabold text-[#012d1d]">{avgPh}</p>
          <p className="text-[10px] text-emerald-700 font-bold">Rango aceptable para pasturas</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">Materia Orgánica (MO)</p>
          <p className="text-xl font-mono font-extrabold text-[#012d1d]">{avgOrganicMatter}%</p>
          <p className="text-[10px] text-[#717973]">Buena retención de humedad</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">Cal Dolomítica Necesaria</p>
          <p className="text-xl font-mono font-extrabold text-[#523700]">{totalLimingNeededTon} Ton</p>
          <p className="text-[10px] text-[#717973]">Corrección acidez y aluminio</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#c1c8c2] card-shadow">
          <p className="text-[10px] uppercase font-bold text-[#717973]">Área Inundable / Bajíos</p>
          <p className="text-xl font-mono font-extrabold text-[#0077b6]">{floodProneAreaHa} Ha</p>
          <p className="text-[10px] text-[#717973]">Manejo con Humidicola & Alemán</p>
        </div>
      </div>

      {/* Detailed Soil & Topography Matrix Table */}
      <div className="bg-white rounded-3xl border border-[#c1c8c2] card-shadow overflow-hidden">
        <div className="bg-[#1b4332] text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#c1ecd4]" />
            Matriz de Estudios de Suelo, Topografía & Drenajes
          </h3>
          <span className="text-xs font-mono text-[#86af99]">{paddocks.length} potreros analizados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f3f3f3] text-[#717973] uppercase text-[10px] font-bold border-b border-[#c1c8c2]">
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
            <tbody className="divide-y divide-[#eeeeee]">
              {paddocks.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectPaddock(p)}
                  className="hover:bg-[#c1ecd4]/20 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-[#012d1d] text-[#c1ecd4] px-1.5 py-0.5 rounded font-bold text-[11px]">
                        {p.code}
                      </span>
                      <span className="font-bold text-[#012d1d]">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#012d1d]">{p.areaHa} Ha</td>
                  <td className="p-3.5">
                    <span className="capitalize font-bold text-[#012d1d]">{p.topography}</span>
                    <span className="text-[10px] text-[#717973] block">
                      {p.avgSlopePct}% pend. • {p.elevationMsnm} msnm
                    </span>
                  </td>
                  <td className="p-3.5 text-[#012d1d]">{p.soilAnalysis.soilType}</td>
                  <td className="p-3.5 font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        p.soilAnalysis.ph < 5.5
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : p.soilAnalysis.ph > 6.5
                          ? 'bg-[#c1ecd4] text-[#002114]'
                          : 'bg-[#ffdeac] text-[#523700]'
                      }`}
                    >
                      {p.soilAnalysis.ph}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[#012d1d]">{p.soilAnalysis.organicMatterPct}%</td>
                  <td className="p-3.5 font-mono text-[#012d1d]">{p.soilAnalysis.phosphorusPpm} ppm</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.isFloodProne ? 'bg-[#bfe6ff] text-[#004e7a]' : 'bg-[#c1ecd4] text-[#002114]'
                      }`}
                    >
                      {p.floodRisk}
                    </span>
                  </td>
                  <td className="p-3.5 text-[11px] text-[#414844] max-w-xs">
                    {p.soilAnalysis.limingRecommendationTonHa > 0 && (
                      <span className="font-bold text-[#523700] block">
                        Cal: {p.soilAnalysis.limingRecommendationTonHa} Ton/Ha
                      </span>
                    )}
                    <span className="text-[#717973] truncate block">
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
