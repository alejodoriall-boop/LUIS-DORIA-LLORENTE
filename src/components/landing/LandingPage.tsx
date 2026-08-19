import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Milk,
  Dna,
  Scale,
  MessageSquare,
  Boxes,
  Users,
  Award,
  ChevronRight,
  Smartphone,
  Star,
  Quote,
  Zap,
  Globe,
  Building2,
  Lock,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { LandingNavbar } from './LandingNavbar';
import { FeatureGrid } from './FeatureGrid';
import { GanaderIALogo } from '../GanaderIALogo';
import { FarmDataPackage } from '../../types';

export interface LandingPageProps {
  onLoginClick: () => void;
  onDemoClick: () => void;
  onGoToSuperadmin?: () => void;
  farms?: FarmDataPackage[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onDemoClick,
  onGoToSuperadmin,
  farms = [],
}) => {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const roles = [
    {
      title: 'Propietario / Ganadero',
      tagline: 'Rentabilidad por hectárea y control de patrimonio',
      description: 'Supervisa el inventario total de todas tus fincas desde tu celular. Analiza costos por kilo producido, margen bruto en ceba y proyecciones de venta sin depender de llamadas.',
      highlights: ['Consolidado multi-finca en tiempo real', 'Rentabilidad por lote y hectárea', 'Auditoría de compras e insumos'],
      badge: 'Visión Estratégica',
    },
    {
      title: 'Médico Veterinario / Zootecnista',
      tagline: 'Sanidad estricta y mejoramiento genético',
      description: 'Gestiona protocolos de IATF, transferencias embrionarias, curvas de lactancia, planes de vacunación y bloqueos preventivos por tiempos de retiro farmacológico.',
      highlights: ['Alertas de días abiertos y servicios', 'Tiempos de retiro y bioseguridad', 'Índices de consanguinidad'],
      badge: 'Salud & Genética',
    },
    {
      title: 'Administrador de Campo & Mayordomo',
      tagline: 'Operación diaria sin complicaciones',
      description: 'Registra pesajes, nacimientos, muertes y movimientos de potrero directamente por WhatsApp o la app sin perder tiempo en libretas mojadas.',
      highlights: ['Entrada de datos por voz y texto', 'Control de aforos y rotación', 'Despacho y básculas Bluetooth'],
      badge: 'Operación Diaria',
    },
  ];

  const metrics = [
    { value: '+50.000', label: 'Cabezas Gestionadas', desc: 'En fincas de Colombia y Latinoamérica' },
    { value: '99.8%', label: 'Precisión de Inventario', desc: 'Conciliación exacta en pesajes y traslados' },
    { value: '4.5 hrs', label: 'Ahorro Semanal', desc: 'Menos digitación manual y planillas' },
    { value: '100%', label: 'Normativa ICA / Sanidad', desc: 'Reportes y certificados oficiales inmediatos' },
  ];

  const testimonials = [
    {
      quote: 'Con GanaderIA dejamos atrás las planillas en Excel que nadie actualizaba. El asistente de WhatsApp permite que los vaqueros reporten partos y pesajes al instante.',
      author: 'Carlos Alberto Restrepo',
      role: 'Ganadería La Florida • 1,450 Cabezas (Montería)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote: 'La adaptación para búfalos de agua es excepcional. Poder calcular con precisión la curva de 312 días de gestación y los sólidos de leche cambió nuestros números.',
      author: 'Dra. Marcela Echeverri',
      role: 'Médica Veterinaria • Hacienda El Trébol (Magdalena Medio)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote: 'El control de tiempos de retiro farmacológico nos salvó de penalizaciones en frigorífico. Es una herramienta indispensable para ganaderías de ceba intensiva.',
      author: 'Ing. Fernando Gómez',
      role: 'Cromos Genética & Ceba • 3 Fincas (Meta)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const pricingPlans = [
    {
      name: 'Plan Hato Estándar',
      badge: 'Para Fincas Individuales',
      price: '$120.000',
      period: 'COP / mes',
      description: 'Ideal para productores que buscan digitalizar el control de pesajes, sanidad y partos.',
      features: [
        'Hasta 400 cabezas de ganado',
        'Módulo Bovino y Bubalino completo',
        'Pesaje y cálculo automático de GDP',
        'Plan Sanitario y alertas de retiro',
        '1 usuario administrador + 2 vaqueros',
      ],
      popular: false,
      cta: 'Comenzar 14 días Gratis',
    },
    {
      name: 'Plan Profesional Multi-Finca',
      badge: 'Más Popular',
      price: '$260.000',
      period: 'COP / mes',
      description: 'Para ganaderías consolidadas que requieren WhatsApp IA, genética avanzada y finanzas.',
      features: [
        'Hasta 1.500 cabezas de ganado',
        'Asistente de Campo por WhatsApp IA',
        'Conexión Básculas Bluetooth Tru-Test',
        'Genética, IATF y Catálogo de Toros',
        'Gestión de Potreros y Aforos Forrajeros',
        'Usuarios y roles ilimitados',
      ],
      popular: true,
      cta: 'Solicitar Demostración',
    },
    {
      name: 'Hato Corporativo / Criadero',
      badge: 'Grandes Ganaderías',
      price: '$490.000',
      period: 'COP / mes',
      description: 'Para empresas agropecuarias con múltiples haciendas, ceba intensiva y lechería especializada.',
      features: [
        'Cabezas ilimitadas (+5.000)',
        'Soporte VIP 24/7 y capacitación en finca',
        'Integración con ERP y Facturación',
        'Módulo de Suplementación y Almacén',
        'Reportes de Rentabilidad y Auditoría',
        'Conmutador de Contexto Superadmin',
      ],
      popular: false,
      cta: 'Contactar un Asesor',
    },
  ];

  const faqs = [
    {
      q: '¿Cómo funciona el asistente de campo por WhatsApp?',
      a: 'Tus vaqueros y mayordomos pueden enviar mensajes de texto o audios directamente al número oficial de GanaderIA Bot. La inteligencia artificial procesa el mensaje, identifica el animal o lote y actualiza el inventario inmediatamente en la nube.',
    },
    {
      q: '¿El software funciona con básculas ganaderas electrónicas?',
      a: 'Sí. GanaderIA se sincroniza en vivo con las principales básculas del mercado (Tru-Test, Gallagher, ICONIX) mediante Bluetooth, registrando el peso individual sin errores de digitación manual.',
    },
    {
      q: '¿Puedo gestionar hatos bubalinos (búfalos de agua)?',
      a: 'Totalmente. Incluye parámetros zootécnicos exclusivos para la especie bubalina: gestación de 312 días, control de sólidos grasos (hasta 8.5%), rusticidad y ganancia diaria.',
    },
    {
      q: '¿Mis datos están seguros y respaldados?',
      a: 'Absolutamente. Utilizamos infraestructura en la nube con Supabase/PostgreSQL y respaldos diarios cifrados, con políticas de seguridad RLS donde cada ganadería tiene aislamiento estricto de su información.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased selection:bg-[#c1ecd4] selection:text-[#002114]">
      {/* 1. Sticky Navigation Bar */}
      <LandingNavbar
        onLoginClick={onLoginClick}
        onDemoClick={onDemoClick}
        onGoToSuperadmin={onGoToSuperadmin}
      />

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-white">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-100/60 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-100/50 rounded-full blur-[90px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#004D38]/10 border border-[#004D38]/20 text-[#004D38] text-xs sm:text-sm font-bold tracking-tight mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#f2a900] animate-pulse" />
              <span>Plataforma SaaS Ganadera de Nueva Generación</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#004D38]" />
            </div>

            {/* Main Hero Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1]">
              El software inteligente que transforma la gestión de tu{' '}
              <span className="text-[#004D38] underline decoration-[#f2a900] decoration-wavy decoration-from-font">
                ganadería
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed max-w-3xl mx-auto">
              Control integral de inventarios, pesajes, nacimientos, plan sanitario y suplementación para hatos bovinos y bubalinos. Registra eventos en campo directamente desde WhatsApp.
            </p>

            {/* CTA Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={onDemoClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-extrabold text-white bg-[#004D38] hover:bg-[#003829] rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group active:scale-98"
              >
                <span>Probar GanaderIA Gratis</span>
                <ArrowRight className="w-5 h-5 text-[#f2a900] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onLoginClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-neutral-800 bg-white hover:bg-neutral-50 rounded-2xl border border-neutral-300/80 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98"
              >
                <span>Iniciar Sesión</span>
                <span className="text-neutral-400">→</span>
              </button>
            </div>

            {/* Trust Micro-Bullets */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-neutral-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>14 días de prueba sin tarjeta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Básculas Bluetooth Tru-Test</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Integración WhatsApp Oficial</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero UI Mockup */}
          <div className="mt-14 sm:mt-18 relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-4 bg-neutral-900/5 ring-1 ring-neutral-900/10 shadow-2xl backdrop-blur-xl">
              <div className="bg-[#00281c] rounded-xl sm:rounded-2xl border border-emerald-900/40 p-4 sm:p-6 text-white overflow-hidden shadow-inner">
                
                {/* Header Mockup Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-emerald-800/60 mb-5 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <GanaderIALogo className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white flex items-center gap-2">
                        Finca La Esperanza
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                          Sincronizado
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-300/70 font-mono">Montería • 420.5 HA • 840 Cabezas</div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
                    <span className="px-3 py-1 bg-emerald-950/80 rounded-lg border border-emerald-800 text-amber-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      Tru-Test (442.5 kg)
                    </span>
                    <span className="px-3 py-1 bg-emerald-950/80 rounded-lg border border-emerald-800 text-emerald-300">
                      WhatsApp Bot Activo
                    </span>
                  </div>
                </div>

                {/* KPI Bento Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
                  <div className="bg-emerald-950/60 p-3 sm:p-4 rounded-xl border border-emerald-800/50">
                    <div className="text-[11px] text-emerald-300 font-medium">Inventario Total</div>
                    <div className="text-xl sm:text-2xl font-black text-white mt-1">840 <span className="text-xs font-normal text-emerald-300">cabezas</span></div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Bovinos 680 • Búfalos 160</div>
                  </div>
                  <div className="bg-emerald-950/60 p-3 sm:p-4 rounded-xl border border-emerald-800/50">
                    <div className="text-[11px] text-emerald-300 font-medium">GDP Promedio Ceba</div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">+0.84 <span className="text-xs font-normal text-amber-300">kg/día</span></div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Lote Engorde A: +1.05 kg</div>
                  </div>
                  <div className="bg-emerald-950/60 p-3 sm:p-4 rounded-xl border border-emerald-800/50">
                    <div className="text-[11px] text-emerald-300 font-medium">Producción Leche Hoy</div>
                    <div className="text-xl sm:text-2xl font-black text-white mt-1">1,240 <span className="text-xs font-normal text-emerald-300">litros</span></div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Grasa 4.2% • Sólidos 12.8%</div>
                  </div>
                  <div className="bg-emerald-950/60 p-3 sm:p-4 rounded-xl border border-emerald-800/50">
                    <div className="text-[11px] text-emerald-300 font-medium">Sanidad & Retiro</div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">0 <span className="text-xs font-normal text-emerald-300">riesgos</span></div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Ciclo Aftosa ICA al día</div>
                  </div>
                </div>

                {/* Quick Action Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-800/40 text-xs text-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-800/60 font-semibold">+ Nuevo Registro</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-800/60 font-semibold">Palpación IATF</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-800/60 font-semibold">Plan Sanitario</span>
                  </div>
                  <div className="text-[11px] text-emerald-300/80 font-mono">
                    GanaderIA Cloud Core v3.8 • 100% Sincronizado
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bento-Grid de Funcionalidades */}
      <FeatureGrid />

      {/* 4. Social Proof & Confidence Metrics */}
      <section id="beneficios" className="py-20 bg-white border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {metrics.map((m, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/60">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#004D38] tracking-tight">
                  {m.value}
                </div>
                <div className="mt-2 text-sm sm:text-base font-bold text-neutral-900">
                  {m.label}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {m.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Role-Based Adaptation Section */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              Una plataforma adaptada al rol de cada miembro del equipo
            </h2>
            <p className="mt-4 text-neutral-600 text-base">
              Desde la toma de decisiones financieras hasta el reporte diario en el corral.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedRoleIndex(idx)}
                className={`p-7 rounded-2xl border transition-all cursor-pointer ${
                  selectedRoleIndex === idx
                    ? 'bg-white border-[#004D38] shadow-md ring-2 ring-[#004D38]/10'
                    : 'bg-white/60 border-neutral-200/80 hover:bg-white hover:border-neutral-300'
                }`}
              >
                <span className="inline-block px-3 py-1 rounded-full bg-[#004D38]/10 text-[#004D38] text-xs font-bold mb-3">
                  {r.badge}
                </span>
                <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  {r.title}
                </h3>
                <div className="text-xs font-semibold text-emerald-800 mt-1">
                  {r.tagline}
                </div>
                <p className="mt-3 text-neutral-600 text-sm leading-relaxed">
                  {r.description}
                </p>

                <div className="mt-6 pt-4 border-t border-neutral-100 space-y-2">
                  {r.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#004D38] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-24 bg-white border-y border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              La voz de ganaderos que lideran el sector
            </h2>
            <p className="mt-3 text-neutral-600 text-base">
              Productores en Córdoba, Meta, Antioquia y Magdalena confían en GanaderIA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-7 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-neutral-700 text-sm italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-11 h-11 rounded-full object-cover border border-neutral-300"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-sm font-bold text-neutral-900">{t.author}</div>
                    <div className="text-xs text-neutral-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Transparent Pricing Plans */}
      <section id="precios" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/80 text-neutral-800 text-xs font-bold uppercase tracking-wider mb-3">
              Planes Flexibles
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              Precios justos para cada escala ganadera
            </h2>
            <p className="mt-3 text-neutral-600 text-base">
              Sin contratos forzosos. Cancela o cambia de plan en cualquier momento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-[#003829] text-white shadow-2xl ring-4 ring-[#004D38]/30 relative scale-105 z-10'
                    : 'bg-white text-neutral-900 border border-neutral-200/90 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                        plan.popular
                          ? 'bg-[#f2a900] text-neutral-950'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <h3 className={`text-2xl font-black tracking-tight ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-2 text-sm ${plan.popular ? 'text-emerald-200' : 'text-neutral-600'}`}>
                    {plan.description}
                  </p>

                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className={`text-xs font-medium ml-2 ${plan.popular ? 'text-emerald-300' : 'text-neutral-500'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-neutral-200/20">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            plan.popular ? 'text-[#f2a900]' : 'text-emerald-600'
                          }`}
                        />
                        <span className={plan.popular ? 'text-emerald-100' : 'text-neutral-700'}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6">
                  <button
                    type="button"
                    onClick={onDemoClick}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer ${
                      plan.popular
                        ? 'bg-[#f2a900] hover:bg-[#dba000] text-neutral-950'
                        : 'bg-[#004D38] hover:bg-[#003829] text-white'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="mt-2 text-neutral-600 text-sm">
              Resolvemos tus dudas antes de iniciar tu prueba gratuita.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/60 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-neutral-900 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      activeFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-neutral-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Bottom CTA Banner */}
      <section className="py-20 bg-[#003829] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f2a900]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Comienza a gestionar tu ganadería con precisión inteligente
          </h2>
          <p className="mt-4 text-base sm:text-lg text-emerald-200 max-w-2xl mx-auto">
            Únete a más de 50.000 cabezas monitoreadas con trazabilidad ICA, básculas Bluetooth y asistencia por WhatsApp.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onDemoClick}
              className="w-full sm:w-auto px-8 py-4 bg-[#f2a900] hover:bg-[#dba000] text-neutral-950 font-black text-base rounded-2xl shadow-xl transition-all cursor-pointer active:scale-98"
            >
              Comenzar Prueba Gratis (14 Días)
            </button>
            <button
              type="button"
              onClick={onLoginClick}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-base rounded-2xl border border-emerald-800 transition-all cursor-pointer active:scale-98"
            >
              Acceso a Mi Cuenta
            </button>
          </div>
        </div>
      </section>

      {/* 10. Minimalist Footer */}
      <footer className="py-12 bg-[#002419] text-emerald-200/80 border-t border-emerald-950 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#004D38] p-1 flex items-center justify-center">
              <GanaderIALogo className="w-full h-full text-white" />
            </div>
            <span className="font-extrabold text-white text-sm">GanaderIA</span>
            <span className="text-emerald-400/60">© {new Date().getFullYear()} Todos los derechos reservados.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-emerald-300">
            <a href="#modulos" className="hover:text-white transition-colors">Módulos</a>
            <a href="#bubalinos" className="hover:text-white transition-colors">Búfalos</a>
            <a href="#whatsapp" className="hover:text-white transition-colors">WhatsApp IA</a>
            <a href="#precios" className="hover:text-white transition-colors">Precios</a>
            {onGoToSuperadmin && (
              <button
                type="button"
                onClick={onGoToSuperadmin}
                className="hover:text-amber-300 text-emerald-400 font-semibold cursor-pointer"
              >
                Panel Superadmin
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
