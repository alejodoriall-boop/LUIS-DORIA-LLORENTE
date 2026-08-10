import React from 'react';
import { WithdrawalAnimal } from '../../types';
import { Clock, X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: WithdrawalAnimal[];
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  animals,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border-2 border-[#523700] shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#ffdeac] text-[#523700] rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#523700]">Control de Tiempos de Retiro</h3>
              <p className="text-xs text-[#717973]">
                Bovinos con tratamiento farmacológico activo (Prohibido despacho o consumo)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#717973] hover:text-black rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 my-4">
          <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-xl text-xs flex items-center gap-2 border-l-4 border-[#ba1a1a]">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>
              <strong>Advertencia de Inocuidad:</strong> No comercializar animales para faena ni
              enviar leche al tanque comunal hasta que los días restantes lleguen a 0.
            </span>
          </div>

          <div className="divide-y divide-[#eeeeee] border border-[#c1c8c2] rounded-xl overflow-hidden text-xs">
            {animals.map((item) => (
              <div key={item.id} className="p-3.5 bg-white hover:bg-[#fafafa] flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-[#1b4332] text-white px-2 py-0.5 rounded text-xs">
                      {item.tagId}
                    </span>
                    <span className="font-bold text-[#012d1d] text-sm">{item.name}</span>
                    <span className="text-[11px] text-[#717973]">({item.lot})</span>
                  </div>
                  <p className="text-[#414844] mt-1 font-medium">
                    Fármaco: <span className="font-semibold text-[#1a1c1c]">{item.medication}</span>
                  </p>
                  <p className="text-[10px] text-[#717973]">
                    Aplicado: {item.appliedDate} • Motivo: {item.reason}
                  </p>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <span className="inline-block bg-[#ffdad6] text-[#ba1a1a] font-bold font-mono px-2.5 py-1 rounded-lg text-xs">
                    {item.daysRemaining} Días Restantes
                  </span>
                  <span className="block text-[10px] text-[#717973] mt-0.5">
                    Retiro Total: {item.withdrawalDays} días
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#eeeeee]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#012d1d] hover:bg-[#1b4332] text-white font-bold rounded-xl text-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
