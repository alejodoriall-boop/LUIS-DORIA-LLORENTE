import React from 'react';
import {
  CheckCircle2,
  DollarSign,
  Tag,
  Truck,
  FileText,
  Printer,
  X,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Receipt,
  Scale,
} from 'lucide-react';

export interface SaleConfirmationData {
  saleCode?: string;
  farmName: string;
  headsCount: number;
  animalTags: string[];
  buyerName: string;
  buyerDoc?: string;
  destination?: string;
  totalAmount: number;
  pricePerKg?: number;
  avgWeightKg?: number;
  totalWeightKg?: number;
  icaGuideNumber?: string;
  invoiceNumber?: string;
  date: string;
  lotName?: string;
  category?: string;
  brandingIron?: string;
  paddockName?: string;
}

interface SaleConfirmationNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SaleConfirmationData | null;
  onNavigateToSales?: () => void;
}

export const SaleConfirmationNoticeModal: React.FC<SaleConfirmationNoticeModalProps> = ({
  isOpen,
  onClose,
  data,
  onNavigateToSales,
}) => {
  if (!isOpen || !data) return null;

  const formattedTotal = `$${(data.totalAmount || 0).toLocaleString('es-CO')} COP`;
  const formattedWeight = data.totalWeightKg
    ? `${data.totalWeightKg.toLocaleString('es-CO')} kg`
    : data.avgWeightKg && data.headsCount
    ? `${(data.avgWeightKg * data.headsCount).toLocaleString('es-CO')} kg`
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="sale-confirmation-backdrop"
      className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="sale-confirmation-modal"
        className="bg-[#15241C] rounded-3xl max-w-2xl w-full border-2 border-emerald-600 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col text-left my-auto"
      >
        {/* Header con estilo de confirmación y sello de éxito */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#012d1d] text-white p-5 sm:p-6 relative overflow-hidden border-b border-emerald-800">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950 flex items-center justify-center shadow-lg border-2 border-emerald-200/40 shrink-0">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-800/90 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#ffba38]" />
                    Despacho Ganadero Exitoso
                  </span>
                  {data.saleCode && (
                    <span className="text-[10px] font-mono font-bold bg-white/15 text-white px-2 py-0.5 rounded-md">
                      {data.saleCode}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black tracking-tight text-white mt-1">
                  ¡Venta Registrada y Confirmada!
                </h2>
                <p className="text-xs text-emerald-200/90 font-medium">
                  Salida comercial formalizada • Descargo de inventario aplicado
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-emerald-300 hover:text-white bg-emerald-900/60 hover:bg-emerald-800 p-2 rounded-xl transition-colors cursor-pointer border border-emerald-700/40"
              title="Cerrar aviso"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Aviso */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-slate-50/50">
          {/* Banner de Valor Total y Cabezas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-900 to-[#012d1d] text-white p-4 rounded-2xl border border-emerald-700 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Total Liquidación Venta
                </p>
                <p className="text-2xl font-black text-[#ffba38] tracking-tight mt-0.5">
                  {formattedTotal}
                </p>
                {data.pricePerKg ? (
                  <p className="text-[10px] text-emerald-200 font-medium mt-0.5">
                    Precio: ${data.pricePerKg.toLocaleString('es-CO')} / kg
                  </p>
                ) : null}
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
                <DollarSign className="w-6 h-6 text-[#ffba38]" />
              </div>
            </div>

            <div className="bg-[#15241C] p-4 rounded-2xl border border-white/10 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A5B8AC]">
                  Animales Despachados
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-white">{data.headsCount}</span>
                  <span className="text-xs font-bold text-[#A5B8AC]">Cabezas</span>
                </div>
                {formattedWeight && (
                  <p className="text-[10px] text-[#A5B8AC] font-semibold mt-0.5">
                    Biomasa Total: {formattedWeight}
                  </p>
                )}
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-950/30 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Ficha de Detalles de la Transacción */}
          <div className="bg-[#15241C] rounded-2xl border border-white/10 p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Receipt className="w-4 h-4 text-emerald-700" />
              Comprobante de Salida Comercial
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2 bg-[#0D1A13] p-2.5 rounded-xl border border-white/10">
                <Building2 className="w-4 h-4 text-[#A5B8AC] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-[#A5B8AC] block uppercase">Predio Origen</span>
                  <span className="font-bold text-white">{data.farmName}</span>
                  {data.paddockName && (
                    <span className="text-[10px] text-[#A5B8AC] block">Potrero: {data.paddockName}</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#0D1A13] p-2.5 rounded-xl border border-white/10">
                <Truck className="w-4 h-4 text-[#A5B8AC] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-[#A5B8AC] block uppercase">Comprador / Destino</span>
                  <span className="font-bold text-white">{data.buyerName}</span>
                  {data.destination && (
                    <span className="text-[10px] text-[#A5B8AC] block">Dest: {data.destination}</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#0D1A13] p-2.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-[#A5B8AC] block uppercase">Guía Sanitaria ICA</span>
                  <span className="font-mono font-black text-emerald-900">
                    {data.icaGuideNumber || 'En trámite / No especificada'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#0D1A13] p-2.5 rounded-xl border border-white/10">
                <FileText className="w-4 h-4 text-[#A5B8AC] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-[#A5B8AC] block uppercase">Factura / Fecha</span>
                  <span className="font-bold text-white">
                    {data.invoiceNumber || 'S/N'} • {data.date}
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de Chapetas / Aretes Dados de Baja */}
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-950 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  # ANIMAL / # CHAPETAS DADAS DE BAJA ({data.animalTags.length > 0 ? data.animalTags.length : data.headsCount})
                </span>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                  Descargado del Hato
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                {data.animalTags.length > 0 ? (
                  data.animalTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[#15241C] text-emerald-950 font-mono font-bold text-[11px] rounded-lg border border-emerald-300 shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono font-bold text-emerald-900">
                    {data.lotName || `${data.headsCount} cabezas del lote`}
                  </span>
                )}
              </div>
            </div>

            {/* Lista de Acciones Automáticas Ejecutadas */}
            <div className="p-3 bg-slate-100/80 rounded-xl border border-white/10 text-[11px] text-white space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Inventario actualizado: Las cabezas y chapetas fueron dadas de baja en el hato.</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Contabilidad sincronizada: Se generó el comprobante de ingreso financiero.</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-[#A5B8AC]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Trazabilidad archivada: El registro quedó disponible para auditoría y reportes ICA.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con Acciones */}
        <div className="bg-[#15241C] p-4 sm:p-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#1F3327] hover:bg-[#202E25] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#A5B8AC]" />
            <span>Imprimir Comprobante</span>
          </button>

          <div className="flex items-center gap-2">
            {onNavigateToSales && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToSales();
                }}
                className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ver en Gestión de Ventas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-[#012d1d] hover:from-emerald-700 hover:to-emerald-900 text-white font-extrabold rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
              <span>Aceptar y Continuar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
