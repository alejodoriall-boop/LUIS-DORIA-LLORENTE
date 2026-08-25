import React, { useState } from 'react';
import { X, DollarSign, Calendar, Building2, Layers, AlignLeft, Layers3 } from 'lucide-react';
import {
  FarmDataPackage,
  FinancialTransaction,
  IncomeCategory,
  ExpenseCategory,
  BusinessUnitId,
} from '../../types';
import {
  INCOME_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
  BUSINESS_UNITS_CATALOG,
  getBusinessUnitForTransaction,
} from '../../data/mockFinancialData';

interface RegisterTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms: FarmDataPackage[];
  currentFarmId: string;
  onSaveTransaction: (transaction: FinancialTransaction) => void;
}

export const RegisterTransactionModal: React.FC<RegisterTransactionModalProps> = ({
  isOpen,
  onClose,
  farms,
  currentFarmId,
  onSaveTransaction,
}) => {
  if (!isOpen) return null;

  const initialFarmId = currentFarmId === 'all' ? (farms[0]?.profile.id || 'farm-001') : currentFarmId;

  const [type, setType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [farmId, setFarmId] = useState<string>(initialFarmId);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('venta_ganado_ceba');
  const [businessUnit, setBusinessUnit] = useState<BusinessUnitId>('ganado_comercial');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [headcount, setHeadcount] = useState<number | ''>('');
  const [kgOrLiters, setKgOrLiters] = useState<number | ''>('');

  const selectedFarmObj = farms.find((f) => f.profile.id === farmId);
  const farmAreaHa = selectedFarmObj?.profile.totalAreaHa || 120;

  // Sync default business unit when category changes
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const tempTx: FinancialTransaction = {
      id: 'temp',
      farmId,
      farmName: '',
      date,
      type,
      category: newCategory as IncomeCategory | ExpenseCategory,
      description: '',
      amount: 0,
    };
    setBusinessUnit(getBusinessUnitForTransaction(tempTx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const newTx: FinancialTransaction = {
      id: `fin-${Date.now()}`,
      farmId,
      farmName: selectedFarmObj?.profile.name || 'Finca Ganadera',
      date,
      type,
      costType: type === 'egreso' ? (EXPENSE_CATEGORY_LABELS[category as ExpenseCategory]?.isDirect ? 'directo' : 'fijo') : undefined,
      category: category as IncomeCategory | ExpenseCategory,
      businessUnit,
      description: description || (type === 'ingreso' ? 'Ingreso Ganadero' : 'Gasto Operativo'),
      amount: Number(amount),
      affectedAreaHa: farmAreaHa,
      headcount: headcount ? Number(headcount) : undefined,
      kgOrLiters: kgOrLiters ? Number(kgOrLiters) : undefined,
    };

    onSaveTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#15241C] rounded-3xl max-w-3xl lg:max-w-5xl lg:max-w-6xl w-full p-6 shadow-2xl border border-[#ffe066] relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#A5B8AC] hover:text-[#A5B8AC] rounded-full hover:bg-[#1F3327] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#0D1A13] text-[#ffba38] rounded-2xl shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              Registrar Movimiento Financiero
            </h3>
            <p className="text-xs text-[#717973] font-semibold">
              Ingreso o Egreso imputado a Hectáreas de Finca
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#fffde7] rounded-2xl border border-[#ffe066]">
            <button
              type="button"
              onClick={() => {
                setType('ingreso');
                setCategory('venta_ganado_ceba');
              }}
              className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                type === 'ingreso'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-[#334139] hover:bg-[#fff3bf]'
              }`}
            >
              🟢 INGRESO (+)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('egreso');
                setCategory('alimentacion_sales');
              }}
              className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                type === 'egreso'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'text-[#334139] hover:bg-[#fff3bf]'
              }`}
            >
              🔴 EGRESO (-)
            </button>
          </div>

          {/* Farm & Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-white mb-1">
                Finca Imputada
              </label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 bg-[#fffde7] border border-[#ffe066] rounded-xl focus:ring-2 focus:ring-[#012d1d] outline-none"
              >
                {farms.map((f) => (
                  <option key={f.profile.id} value={f.profile.id}>
                    {f.profile.name} ({f.profile.totalAreaHa} Ha)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-white mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 bg-[#fffde7] border border-[#ffe066] rounded-xl focus:ring-2 focus:ring-[#012d1d] outline-none"
                required
              />
            </div>
          </div>

          {/* Category & Business Unit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-white mb-1">
                Rubro / Categoría
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 bg-[#fffde7] border border-[#ffe066] rounded-xl focus:ring-2 focus:ring-[#012d1d] outline-none"
              >
                {type === 'ingreso'
                  ? Object.entries(INCOME_CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))
                  : Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label} {v.isDirect ? '(Directo)' : '(Fijo)'}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-white mb-1 flex items-center gap-1">
                <Layers3 className="w-3.5 h-3.5 text-white" />
                Unidad de Negocio
              </label>
              <select
                value={businessUnit}
                onChange={(e) => setBusinessUnit(e.target.value as BusinessUnitId)}
                className="w-full text-xs font-bold py-2.5 px-3 bg-[#fffde7] border border-[#ffe066] rounded-xl focus:ring-2 focus:ring-[#012d1d] outline-none"
              >
                {Object.values(BUSINESS_UNITS_CATALOG).map((bu) => (
                  <option key={bu.id} value={bu.id}>
                    {bu.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-extrabold text-white mb-1">
              Monto Total en Pesos ($ COP)
            </label>
            <input
              type="number"
              placeholder="Ej. 15400000"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full text-sm font-black py-2.5 px-3 bg-[#fffde7] border border-[#ffe066] rounded-xl focus:ring-2 focus:ring-[#012d1d] outline-none"
              required
            />
            {amount && Number(amount) > 0 && (
              <p className="text-[11px] font-bold text-[#2b8a3e] mt-1">
                Equivalente a ${(Number(amount) / farmAreaHa).toLocaleString('es-CO', { maximumFractionDigits: 0 })} / Ha
              </p>
            )}
          </div>

          {/* Optional Headcount / Kg */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-white mb-1">
                Cabezas / Animales (Opcional)
              </label>
              <input
                type="number"
                placeholder="Ej. 25"
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs font-bold py-2.5 px-3 bg-[#fffde7] border border-[#ffe066] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-white mb-1">
                Kilos o Litros (Opcional)
              </label>
              <input
                type="number"
                placeholder="Ej. 11500"
                value={kgOrLiters}
                onChange={(e) => setKgOrLiters(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs font-bold py-2.5 px-3 bg-[#fffde7] border border-[#ffe066] rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-extrabold text-white mb-1">
              Detalle / Observaciones
            </label>
            <input
              type="text"
              placeholder="Ej. Venta Lote #2 Novillos o Compra Bultos Concentrado"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 px-3 bg-[#fffde7] border border-[#ffe066] rounded-xl outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-white/15 text-xs font-bold text-[#A5B8AC] hover:bg-[#1F3327] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-[#0D1A13] hover:bg-[#02402a] text-[#ffba38] text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              Guardar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
