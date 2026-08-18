import React from 'react';
import { LotRecord } from '../../types';
import { safePrint } from '../../utils/printUtils';
import { BarChart3, X, DollarSign, TrendingUp, Download, Printer } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lots: LotRecord[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  lots,
}) => {
  if (!isOpen) return null;

  const totalHeads = lots.reduce((acc, curr) => acc + curr.heads, 0);
  const totalKg = lots.reduce((acc, curr) => acc + curr.heads * curr.currentAvgWeight, 0);
  const avgPricePerKg = 2.45; // USD/kg or local currency unit
  const estimatedGrossValue = totalKg * avgPricePerKg;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl max-w-4xl lg:max-w-5xl w-full p-6 border-2 border-[#c1c8c2] shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1b4332] text-white rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#012d1d]">Reporte Comercial de Ganado</h3>
              <p className="text-xs text-[#717973]">Consolidado de Biomasa, Rendimiento y Valoración de Hato</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#717973] hover:text-black rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-4 text-xs">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#79564b] font-bold uppercase block">
                Total Cabezas
              </span>
              <span className="font-mono text-xl font-bold text-[#012d1d]">{totalHeads}</span>
            </div>

            <div className="p-3.5 bg-[#f3f3f3] rounded-xl border border-[#c1c8c2]">
              <span className="text-[10px] text-[#79564b] font-bold uppercase block">
                Biomasa Total
              </span>
              <span className="font-mono text-xl font-bold text-[#012d1d]">
                {totalKg.toLocaleString()} kg
              </span>
            </div>

            <div className="p-3.5 bg-[#c1ecd4]/50 rounded-xl border border-[#a5d0b9]">
              <span className="text-[10px] text-[#002114] font-bold uppercase block">
                Valoración Hato
              </span>
              <span className="font-mono text-xl font-bold text-[#012d1d]">
                ${estimatedGrossValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Lot Breakdown Table */}
          <div>
            <h4 className="font-bold text-[#012d1d] mb-2">Desglose por Potrero / Lote</h4>
            <div className="border border-[#c1c8c2] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#f3f3f3] border-b border-[#c1c8c2]">
                  <tr>
                    <th className="p-2.5 font-bold text-[#414844]">Lote / Nombre</th>
                    <th className="p-2.5 font-bold text-[#414844]">Cabezas</th>
                    <th className="p-2.5 font-bold text-[#414844]">Peso Prom.</th>
                    <th className="p-2.5 font-bold text-[#414844]">GDP</th>
                    <th className="p-2.5 font-bold text-[#414844]">Salida Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {lots.map((l) => (
                    <tr key={l.id} className="hover:bg-[#fafafa]">
                      <td className="p-2.5 font-semibold text-[#012d1d]">{l.name}</td>
                      <td className="p-2.5 font-mono">{l.heads}</td>
                      <td className="p-2.5 font-mono">{l.currentAvgWeight} kg</td>
                      <td className="p-2.5 font-mono text-emerald-800 font-bold">
                        {l.gdpCurrent} kg/d
                      </td>
                      <td className="p-2.5 font-mono text-[#79564b]">{l.estDaysToExit} días</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-3 border-t border-[#eeeeee]">
          <button
            onClick={safePrint}
            className="px-4 py-2.5 bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#012d1d] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Reporte
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
