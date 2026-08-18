import React from 'react';
import { PedigreeAnimal } from '../../types';
import { safePrint } from '../../utils/printUtils';
import { Award, X, Printer, Download, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';

interface PedigreeCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  bull: PedigreeAnimal;
}

export const PedigreeCertificateModal: React.FC<PedigreeCertificateModalProps> = ({
  isOpen,
  onClose,
  bull,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    safePrint();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl max-w-5xl lg:max-w-6xl w-full p-6 md:p-8 border-4 border-[#012d1d] shadow-2xl animate-in fade-in zoom-in-95 my-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#717973] hover:text-black rounded-full bg-[#f3f3f3]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border & Header */}
        <div className="border-2 border-[#ffba38] p-4 md:p-6 rounded-xl bg-[#fafafa]">
          {/* Top Header */}
          <div className="text-center pb-4 border-b-2 border-[#012d1d]">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-[#012d1d] text-[#ffba38] flex items-center justify-center border-2 border-[#ffba38]">
                <Award className="w-7 h-7" />
              </div>
            </div>
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-wider text-[#012d1d]">
              Certificado Oficial de Registro Genealógico
            </h2>
            <p className="text-xs text-[#79564b] font-semibold uppercase tracking-widest mt-0.5">
              Sociedad de Criadores de Ganado Puro • Registro Nacional Bovino
            </p>
            <p className="text-[10px] font-mono text-[#717973] mt-1">
              Registro N°: {bull.registryNumber} • Certificado Digital Verificado
            </p>
          </div>

          {/* Animal Identification Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5 p-3.5 bg-white rounded-xl border border-[#c1c8c2] text-xs">
            <div>
              <span className="text-[10px] text-[#717973] uppercase font-bold block">
                Nombre del Bovino
              </span>
              <span className="font-bold text-[#012d1d] text-sm">{bull.name}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#717973] uppercase font-bold block">
                Identificación (ID)
              </span>
              <span className="font-mono font-bold text-[#1a1c1c] text-sm">{bull.code}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#717973] uppercase font-bold block">Raza</span>
              <span className="font-semibold text-[#012d1d] text-sm">{bull.breed}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#717973] uppercase font-bold block">Categoría</span>
              <span className="font-bold text-emerald-800 bg-[#c1ecd4] px-1.5 py-0.5 rounded text-[10px]">
                {bull.category}
              </span>
            </div>
          </div>

          {/* Genealogy Summary */}
          <div className="my-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#79564b] mb-2">
              Línea Genealógica (Pedigree 3G)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-[11px] bg-white p-3 rounded-xl border border-[#c1c8c2]">
              {/* Gen 1 */}
              <div className="p-2 bg-[#f3f3f3] rounded-lg border border-[#012d1d] text-center">
                <span className="text-[9px] text-[#717973] font-bold block">SUJETO</span>
                <span className="font-bold text-[#012d1d]">{bull.name}</span>
                <span className="block font-mono text-[9px] text-[#717973]">{bull.code}</span>
              </div>

              {/* Gen 2 */}
              <div className="space-y-1.5">
                <div className="p-1.5 bg-[#f9f9f9] rounded border border-[#c1c8c2]">
                  <span className="text-[8px] text-[#79564b] font-bold block">PADRE (SIRE)</span>
                  <span className="font-semibold">{bull.sire?.name || 'Cacique 120'}</span>
                </div>
                <div className="p-1.5 bg-[#f9f9f9] rounded border border-[#c1c8c2]">
                  <span className="text-[8px] text-[#79564b] font-bold block">MADRE (DAM)</span>
                  <span className="font-semibold">{bull.dam?.name || 'Luna 55'}</span>
                </div>
              </div>

              {/* Gen 3 */}
              <div className="space-y-1 text-[9px]">
                <div className="p-1 bg-[#f9f9f9] rounded border border-[#e2e2e2]">
                  Abuelo P: Gran Toro A
                </div>
                <div className="p-1 bg-[#f9f9f9] rounded border border-[#e2e2e2]">
                  Abuela P: Vaca Paternal
                </div>
                <div className="p-1 bg-[#f9f9f9] rounded border border-[#e2e2e2]">
                  Abuelo M: Toro Materno
                </div>
                <div className="p-1 bg-[#f9f9f9] rounded border border-[#e2e2e2]">
                  Abuela M: Gran Vaca B
                </div>
              </div>
            </div>
          </div>

          {/* Genetic DEPs & Inbreeding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] text-xs">
              <h5 className="font-bold text-[#012d1d] mb-1.5">Valores Genéticos DEP</h5>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-1.5 bg-[#f3f3f3] rounded">
                  <span className="text-[9px] text-[#717973] block">PN (Parto)</span>
                  <span className="font-mono font-bold text-[#012d1d]">+1.2 kg</span>
                </div>
                <div className="p-1.5 bg-[#f3f3f3] rounded">
                  <span className="text-[9px] text-[#717973] block">PD (Destete)</span>
                  <span className="font-mono font-bold text-[#012d1d]">+15.4 kg</span>
                </div>
                <div className="p-1.5 bg-[#f3f3f3] rounded">
                  <span className="text-[9px] text-[#717973] block">CE (Escrotal)</span>
                  <span className="font-mono font-bold text-[#012d1d]">+0.8 cm</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#c1c8c2] text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#717973] font-bold block">
                  Coeficiente de Consanguinidad (F)
                </span>
                <span className="text-xl font-bold font-mono text-[#012d1d]">
                  {bull.inbreedingCoeff}%
                </span>
                <span className="text-[10px] text-emerald-700 block font-semibold">
                  Nivel Seguro (Heterosis Alta)
                </span>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          {/* Signature & Verification Seal */}
          <div className="pt-4 border-t border-[#c1c8c2] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white border border-[#c1c8c2] rounded-lg p-1 flex items-center justify-center">
                <QrCode className="w-9 h-9 text-[#012d1d]" />
              </div>
              <div>
                <span className="text-[10px] text-[#717973] block">Validación QR Oficial</span>
                <span className="font-mono text-[10px] text-[#012d1d] font-semibold">
                  HASH: 9982-BRG-2021-GEN
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="border-b border-[#012d1d] w-40 pb-1 font-serif italic text-xs">
                Dr. Roberto S. Alarcón
              </div>
              <span className="text-[10px] text-[#717973] uppercase block mt-0.5">
                Director Técnico Zootecnista
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex gap-3 justify-end">
          <button
            onClick={handlePrint}
            className="bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Certificado
          </button>
          <button
            onClick={onClose}
            className="bg-[#f3f3f3] hover:bg-[#e8e8e8] text-[#414844] font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
