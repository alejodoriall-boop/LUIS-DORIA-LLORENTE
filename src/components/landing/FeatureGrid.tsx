import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  ShieldCheck,
  Layers,
  Dna,
  Sparkles,
  Scale,
  Milk,
  Boxes,
  HeartPulse,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Send,
  Zap,
} from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'bovinos' | 'bubalinos' | 'sanidad'>('all');

  return (
    <section id="modulos" className="py-24 bg-[#F8FAFC] relative overflow-hidden border-y border-neutral-200/80">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#004D38]/10 border border-[#004D38]/20 text-[#004D38] text-xs font-extrabold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#f2a900]" />
            Capacidades de Vanguardia
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Diseñado para la complejidad real del <span className="text-[#004D38]">campo ganadero</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 font-normal leading-relaxed">
            Elimina cuadernos de papel y hojas de cálculo desactualizadas. Un ecosistema integrado con automatizaciones zootécnicas de precisión.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
          
          {/* Card 1: WhatsApp de Campo con IA (Grande - 8 cols) */}
          <div
            id="whatsapp"
            className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 group-hover:bg-emerald-100/70 transition-colors" />
            
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  WhatsApp Bot IA Oficial
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                Asistente de Campo por WhatsApp en Tiempo Real
              </h3>
              <p className="mt-2 text-neutral-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                Los vaqueros y administradores registran pesajes, nacimientos, celos, tratamientos y novedades enviando un simple mensaje de texto o nota de voz. La IA interpreta los datos y actualiza el inventario al instante.
              </p>
            </div>

            {/* Chat Simulation Preview */}
            <div className="mt-6 bg-[#00281c] rounded-xl p-4 sm:p-5 border border-emerald-900/40 text-white shadow-inner">
              <div className="flex items-center gap-2 pb-3 border-b border-emerald-800/60 mb-3 text-xs text-emerald-300 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Conversación en Finca La Esperanza • Vaquero Juan</span>
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-end">
                  <div className="bg-emerald-700/80 text-white px-3.5 py-2 rounded-2xl rounded-tr-xs max-w-xs sm:max-w-md">
                    "Pesé el ternero 8042 de la vaca 3105, dio 215 kilos en Lote Ceba 2"
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-neutral-800 text-emerald-100 px-3.5 py-2 rounded-2xl rounded-tl-xs max-w-xs sm:max-w-md border border-neutral-700">
                    <span className="font-bold text-[#f2a900]">✓ GanaderIA Bot:</span> Registrado. Ternero #8042 actualizado (+0.82 kg/día GDP). Lote Ceba 2 sincronizado.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Módulo Bovino y Bubalino Especializado (4 cols) */}
          <div
            id="bubalinos"
            className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center mb-4 border border-amber-300">
                <Dna className="w-6 h-6 text-amber-700" />
              </div>
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-amber-800 mb-1">
                Bovinos & Bubalinos
              </span>
              <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Adaptación Fisiológica para Búfalos de Agua
              </h3>
              <p className="mt-2 text-neutral-600 text-sm leading-relaxed">
                Gestión nativa para hatos bubalinos con curvas de gestación exactas (312 días), control de grasa láctea hasta 8.5%, sólidos totales y cálculo de rusticidad.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                <span>Gestación Bubalina</span>
                <span className="text-amber-800 font-mono">310 - 315 días</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[85%]" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Solidos Lácteos: 17.5%</span>
                <span className="text-emerald-700 font-bold">Alta Rentabilidad</span>
              </div>
            </div>
          </div>

          {/* Card 3: Plan Sanitario y Tiempos de Retiro (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-200">
                <HeartPulse className="w-6 h-6 text-red-600" />
              </div>
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-red-700 mb-1">
                Bioseguridad & Normativa
              </span>
              <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Plan Sanitario y Bloqueo por Tiempo de Retiro
              </h3>
              <p className="mt-2 text-neutral-600 text-sm leading-relaxed">
                Calendarios de vacunación oficial ICA (Fiebre Aftosa, Carbón, Brucelosis) con bloqueo preventivo de venta para animales en tratamiento farmacológico.
              </p>
            </div>

            <div className="mt-6 p-3.5 bg-red-50/70 rounded-xl border border-red-200/80 flex items-start gap-3 text-xs text-red-950">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Bloqueo Activo en Venta:</span> 3 novillos bajo tratamiento con Oxitetraciclina (Retiro: 14 días restantes).
              </div>
            </div>
          </div>

          {/* Card 4: Inventarios y Suplementación Mineral (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 border border-blue-200">
                <Boxes className="w-6 h-6 text-blue-700" />
              </div>
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-blue-700 mb-1">
                Nutrición & Bodega
              </span>
              <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Suplementación y Proyección de Compras
              </h3>
              <p className="mt-2 text-neutral-600 text-sm leading-relaxed">
                Formulaciones exactas de sales mineralizadas, melaza y ensilaje según etapa productiva, con proyección mensual estimada de sacos y costo por kilo ganado.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-semibold text-neutral-800">
              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-[10px] text-neutral-500">Consumo Sal</div>
                <div className="font-mono text-sm font-bold text-neutral-900">85 g / animal / día</div>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-[10px] text-neutral-500">Stock Crítico</div>
                <div className="font-mono text-sm font-bold text-emerald-700">18 Días Cubiertos</div>
              </div>
            </div>
          </div>

          {/* Card 5: Trazabilidad, Básculas y Certificaciones (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#004D38]/10 text-[#004D38] flex items-center justify-center mb-4 border border-[#004D38]/20">
                <Scale className="w-6 h-6 text-[#004D38]" />
              </div>
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#004D38] mb-1">
                Pesaje Bluetooth & ICA
              </span>
              <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Trazabilidad Oficial y Conexión a Básculas
              </h3>
              <p className="mt-2 text-neutral-600 text-sm leading-relaxed">
                Integración directa con básculas ganaderas Tru-Test vía Bluetooth. Control de chapetas DIN, genealogía de 3 generaciones y certificados sanitarios.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-neutral-800">Tru-Test XR5000</span>
              </div>
              <span className="text-neutral-500 font-mono text-[11px]">Sincronizado</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
