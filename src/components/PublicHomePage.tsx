import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Building2,
  Milk,
  Dna,
  HeartPulse,
  MapPin,
  CloudRain,
  Scale,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Smartphone,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Menu as MenuIcon,
  X,
  Compass,
  Boxes,
  Briefcase,
  Activity,
  Calendar,
  Lock,
  Stethoscope,
  Globe,
  Sliders,
  Check,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { GanaderIALogo } from './GanaderIALogo';
import { FarmDataPackage } from '../types';

export interface PublicHomePageProps {
  onEnterPlatform: (targetTab?: string) => void;
  onOpenAuthModal: () => void;
  onGoToSuperadmin?: () => void;
  farms?: FarmDataPackage[];
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  onEnterPlatform,
  onOpenAuthModal,
  onGoToSuperadmin,
  farms = [],
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  // Smooth scroll handler for internal links
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Real 19 modules present in GanaderIA codebase
  const realModules = [
    {
      id: 'home',
      name: 'Inicio y Resumen de Finca',
      description: 'Tablero consolidado de KPIs zootécnicos, alertas sanitarias prioritarias y bitácora de actividades diarias.',
      icon: Activity,
      category: 'Gestión General',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'cattle',
      name: 'Ganado y Lotes',
      description: 'Control de inventario bovino, pesajes con sincronización a báscula Bluetooth Tru-Test y ganancias diarias de peso (GDP).',
      icon: Layers,
      category: 'Inventario Animal',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'dairy',
      name: 'Producción Lechera',
      description: 'Monitoreo de ordeño individual con chips RFID, control de mastitis (CMT/RCS) y alertas de retiro por antibióticos.',
      icon: Milk,
      category: 'Producción',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      id: 'genetics',
      name: 'Genética y Reproducción',
      description: 'Programas de IATF, transferencia de embriones, catálogo de toros, pajillas de semen y simulación de consanguinidad.',
      icon: Dna,
      category: 'Mejoramiento Genético',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      id: 'calf_rearing',
      name: 'Cría de Terneros',
      description: 'Protocolos de crianza artificial, suministro de calostro, control de diarreas/neumonías y pesajes predestete.',
      icon: HeartPulse,
      category: 'Crianza',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      id: 'equines',
      name: 'Equinos de Trabajo',
      description: 'Registro de caballos, mulares y asnales de vaquería, genealogía, herrero, desparasitación y aptitud física.',
      icon: Award,
      category: 'Especies Menores',
      color: 'bg-stone-50 text-stone-800 border-stone-200',
    },
    {
      id: 'buffalo',
      name: 'Búfalos de Agua',
      description: 'Manejo especializado de hatos bubalinos: control de fotoperiodo, leche con altos sólidos y rendimiento para mozzarella.',
      icon: Boxes,
      category: 'Especies Especiales',
      color: 'bg-slate-50 text-slate-800 border-slate-200',
    },
    {
      id: 'sanitary',
      name: 'Sanidad y Retiros ICA',
      description: 'Calendario de vacunación oficial, planes preventivos, registro de patologías y bloqueo de venta por tiempos de retiro.',
      icon: Stethoscope,
      category: 'Salud Animal',
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      id: 'gis',
      name: 'Potreros y Gestión Geográfica (GIS)',
      description: 'Mapeo satelital de perímetros de finca, curvas de nivel, zonas de inundación y estado de rotación de potreros.',
      icon: MapPin,
      category: 'Infraestructura',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'rainfall',
      name: 'Pluviometría y Lluvias',
      description: 'Registro milimétrico de precipitaciones diarias, comparativas históricas mensuales y análisis de sequías.',
      icon: CloudRain,
      category: 'Climatología',
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    },
    {
      id: 'aforo',
      name: 'Aforos y Capacidad de Carga',
      description: 'Muestreo de pasturas en doble marco botánico, cálculo de materia seca disponible y asignación de Unidades Animales (UA).',
      icon: Scale,
      category: 'Nutrición y Pastos',
      color: 'bg-lime-50 text-lime-800 border-lime-200',
    },
    {
      id: 'supplementation',
      name: 'Suplementación Nutricional',
      description: 'Planes de sales mineralizadas, concentrados por etapa productiva (cría, levante, ceba) y costeo de ración diaria.',
      icon: Sparkles,
      category: 'Nutrición y Pastos',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'inventory',
      name: 'Inventario y Almacén',
      description: 'Control de existencias de medicamentos, agroquímicos, alimentos e insumos con alertas de stock mínimo y vencimiento.',
      icon: Boxes,
      category: 'Insumos',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      id: 'sales',
      name: 'Ventas y Comercialización',
      description: 'Registro de ventas de novillos, vacas de descarte, leche y reproductores con cálculo de precio por kg y márgenes.',
      icon: DollarSign,
      category: 'Comercial',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'finance',
      name: 'Finanzas y Flujo de Caja',
      description: 'Estado de ingresos y egresos, categorización contable de costos fijos/variables y rentabilidad neta por hectárea.',
      icon: TrendingUp,
      category: 'Economía',
      color: 'bg-green-50 text-green-800 border-green-200',
    },
    {
      id: 'payroll',
      name: 'Nómina y Personal de Campo',
      description: 'Administración de colaboradores, mayordomos, ordeñadores, jornales diarios, anticipos y liquidación periódica.',
      icon: Briefcase,
      category: 'Talento Humano',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      id: 'herd_traceability',
      name: 'Trazabilidad Genealógica',
      description: 'Genealogía ascendente y descendente, certificados de pureza Asocebú, control de hierro caliente y marcas a fuego.',
      icon: FileSpreadsheet,
      category: 'Trazabilidad',
      color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    },
    {
      id: 'analytics_report',
      name: 'Reportes y Analítica Zootécnica',
      description: 'Informes ejecutivos exportables en PDF y Excel para auditorías bancarias, ICA y juntas de accionistas.',
      icon: FileSpreadsheet,
      category: 'Analítica',
      color: 'bg-violet-50 text-violet-800 border-violet-200',
    },
    {
      id: 'admin',
      name: 'Administración y Permisos',
      description: 'Control granular de usuarios con PIN de seguridad, roles asignados y bitácora inmutable de eventos del sistema.',
      icon: Users,
      category: 'Seguridad',
      color: 'bg-stone-50 text-stone-800 border-stone-200',
    },
  ];

  // The 5 real roles identified in the codebase
  const userRoles = [
    {
      role: 'Propietario',
      badge: 'Acceso Total',
      description: 'Visión estratégica y consolidada de todas las fincas, estados financieros, inversiones, reportes gerenciales y decisiones globales.',
      permissions: [
        'Acceso irrestricto a todas las fincas registradas',
        'Aprobación de compras y desembolsos mayores',
        'Consulta de rentabilidad neta por hectárea',
        'Gestión de usuarios y asignación de fincas',
        'Exportación de balances consolidados',
      ],
      icon: Building2,
      color: 'border-amber-400 bg-amber-50/70 text-amber-950',
    },
    {
      role: 'Administrador',
      badge: 'Gestión Operativa',
      description: 'Control diario de las actividades del predio, rotación de lotes, compras de insumos, ventas de ganado y supervisión del personal.',
      permissions: [
        'Creación y movimiento de lotes de ganado',
        'Aprobación de entradas y salidas de almacén',
        'Registro de ventas y liquidación de fletes',
        'Programación de actividades diarias del personal',
        'Gestión de nómina de campo y jornales',
      ],
      icon: Briefcase,
      color: 'border-emerald-500 bg-emerald-50/70 text-emerald-950',
    },
    {
      role: 'Veterinario o Zootecnista',
      badge: 'Técnico Especializado',
      description: 'Responsable técnico del plan sanitario oficial ICA, programas de inseminación artificial (IATF), control de mastitis y retiros.',
      permissions: [
        'Registro y certificación de esquemas de vacunación',
        'Diagnósticos de palpación y ecografías reproductivas',
        'Control de cuartos mamarios y pruebas CMT',
        'Activación de alertas por retiro de medicamentos',
        'Simulador de consanguinidad y catálogo genético',
      ],
      icon: Stethoscope,
      color: 'border-teal-500 bg-teal-50/70 text-teal-950',
    },
    {
      role: 'Mayordomo o Caporal',
      badge: 'Operación en Campo',
      description: 'Encargado directo en manga y potreros de los pesajes en báscula, registros de leche diarios, conteos y aplicaciones sanitarias.',
      permissions: [
        'Captura de peso directo vía Bluetooth Tru-Test',
        'Registro de producción de leche turno mañana/tarde',
        'Movimientos de ganado entre potreros',
        'Reporte de nacimientos y novedades de hato',
        'Consulta rápida desde el asistente de WhatsApp',
      ],
      icon: Layers,
      color: 'border-blue-500 bg-blue-50/70 text-blue-950',
    },
    {
      role: 'Financiero o Contador',
      badge: 'Control Económico',
      description: 'Supervisión del flujo de caja, categorización contable de ingresos/egresos, comprobantes de pago y balances de rentabilidad.',
      permissions: [
        'Registro de ingresos por venta de ganado y leche',
        'Control de costos fijos y variables de insumos',
        'Cálculo de costo por kilo producido y litro de leche',
        'Liquidación de nómina y comprobantes de desembolso',
        'Generación de reportes tributarios y contables',
      ],
      icon: DollarSign,
      color: 'border-purple-500 bg-purple-50/70 text-purple-950',
    },
  ];

  // Core benefits
  const platformBenefits = [
    {
      title: 'Información organizada',
      desc: 'Centraliza registros genealógicos, productivos y sanitarios en una estructura estandarizada sin planillas de papel.',
      icon: Boxes,
    },
    {
      title: 'Gestión multifincas',
      desc: 'Administra varios predios ganaderos desde una sola cuenta, cambiando de contexto con un solo clic.',
      icon: Building2,
    },
    {
      title: 'Control de animales y lotes',
      desc: 'Trazabilidad individual con chapeta, RFID y hierro caliente, categorizando por ceba, cría, leche o genética.',
      icon: Layers,
    },
    {
      title: 'Seguimiento productivo',
      desc: 'Medición precisa de ganancia diaria de peso (GDP), curvas de lactancia y rendimiento lechero diario.',
      icon: TrendingUp,
    },
    {
      title: 'Control sanitario estricto',
      desc: 'Alertas automáticas por periodos de retiro de medicamentos y cronogramas de vacunación conforme al ICA.',
      icon: Stethoscope,
    },
    {
      title: 'Administración financiera',
      desc: 'Flujo de caja en tiempo real, costeo por animal/hectárea y balances de ingresos contra egresos operativos.',
      icon: DollarSign,
    },
    {
      title: 'Gestión de inventarios',
      desc: 'Control de existencias de sales, medicamentos e insumos con trazabilidad de lotes y fechas de expiración.',
      icon: Boxes,
    },
    {
      title: 'Control de usuarios y permisos',
      desc: 'Acceso seguro con PIN y roles zootécnicos delimitados para propietarios, administradores y personal de campo.',
      icon: ShieldCheck,
    },
    {
      title: 'Reportes y análisis avanzado',
      desc: 'Generación instantánea de reportes ejecutivos para auditorías, certificación oficial y toma de decisiones.',
      icon: FileSpreadsheet,
    },
    {
      title: 'Información geográfica (GIS)',
      desc: 'Mapeo satelital de perímetros, cálculo de áreas por potrero, curvas de nivel y fuentes de agua.',
      icon: MapPin,
    },
  ];

  return (
    <div id="inicio" className="min-h-screen bg-[#fcfdfa] text-neutral-900 flex flex-col font-sans selection:bg-[#f2a900]/30 selection:text-[#012d1d]">
      {/* Top Banner Notice */}
      <div className="bg-[#012d1d] text-emerald-100 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-emerald-900/50">
        <Sparkles className="w-3.5 h-3.5 text-[#f2a900] shrink-0" />
        <span>Plataforma zootécnica profesional para ganadería de precisión bovina, bubalina y equina.</span>
        {onGoToSuperadmin && (
          <button
            onClick={onGoToSuperadmin}
            className="ml-2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-[11px] font-semibold border border-emerald-700/50 cursor-pointer transition-all"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            Panel Superadmin Global
          </button>
        )}
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/[0.06] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => scrollToSection('inicio')}>
            <GanaderIALogo size="md" variant="compact" showSubtitle={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-sm text-neutral-700">
            <button
              onClick={() => scrollToSection('inicio')}
              className="hover:text-[#012d1d] transition-colors cursor-pointer"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection('plataforma')}
              className="hover:text-[#012d1d] transition-colors cursor-pointer"
            >
              Plataforma
            </button>
            <button
              onClick={() => scrollToSection('modulos')}
              className="hover:text-[#012d1d] transition-colors cursor-pointer"
            >
              Módulos
            </button>
            <button
              onClick={() => scrollToSection('beneficios')}
              className="hover:text-[#012d1d] transition-colors cursor-pointer"
            >
              Beneficios
            </button>
            <button
              onClick={() => scrollToSection('multifincas')}
              className="hover:text-[#012d1d] transition-colors cursor-pointer"
            >
              Multifincas
            </button>
            <button
              onClick={() => scrollToSection('roles')}
              className="hover:text-[#012d1d] transition-colors cursor-pointer"
            >
              Roles
            </button>
          </nav>

          {/* Action Access Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 text-sm font-semibold text-[#012d1d] hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-emerald-200/60"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => onEnterPlatform()}
              className="px-5 py-2.5 text-sm font-bold text-neutral-950 bg-[#f2a900] hover:bg-[#df9b00] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 group"
            >
              <span>Acceder a GanaderIA</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3 shadow-lg"
            >
              <div className="flex flex-col space-y-2 text-base font-semibold text-neutral-800">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-[#012d1d]"
                >
                  Inicio
                </button>
                <button
                  onClick={() => scrollToSection('plataforma')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-[#012d1d]"
                >
                  Plataforma
                </button>
                <button
                  onClick={() => scrollToSection('modulos')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-[#012d1d]"
                >
                  Módulos
                </button>
                <button
                  onClick={() => scrollToSection('beneficios')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-[#012d1d]"
                >
                  Beneficios
                </button>
                <button
                  onClick={() => scrollToSection('multifincas')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-[#012d1d]"
                >
                  Gestión Multifincas
                </button>
                <button
                  onClick={() => scrollToSection('roles')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-[#012d1d]"
                >
                  Roles y Permisos
                </button>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-2.5 text-center font-bold text-[#012d1d] bg-emerald-50 border border-emerald-200 rounded-xl"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEnterPlatform();
                  }}
                  className="w-full py-3 text-center font-bold text-neutral-950 bg-[#f2a900] rounded-xl shadow-xs"
                >
                  Acceder a GanaderIA
                </button>
                {onGoToSuperadmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onGoToSuperadmin();
                    }}
                    className="w-full py-2 text-center text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    Abrir Panel Global Superadmin
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-emerald-50/20 to-[#fcfdfa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[#012d1d] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#f2a900] animate-pulse" />
              Software Inteligente para Gestión Ganadera Integral
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#012d1d] leading-[1.1]">
              Tu ganadería, <span className="text-[#2d6a4f] underline decoration-[#f2a900] decoration-wavy decoration-2">bajo control.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Administra animales, producción, sanidad, potreros, inventarios, finanzas y actividades de tus fincas desde una sola plataforma.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => onEnterPlatform()}
                className="w-full sm:w-auto px-7 py-3.5 text-base font-extrabold text-neutral-950 bg-[#f2a900] hover:bg-[#df9b00] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 group"
              >
                <span>Acceder a la plataforma</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => scrollToSection('modulos')}
                className="w-full sm:w-auto px-6 py-3.5 text-base font-bold text-[#012d1d] bg-white hover:bg-emerald-50/80 border border-emerald-900/20 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Conocer los módulos</span>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-black/[0.05]">
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-black text-[#012d1d]">19</div>
                <div className="text-xs text-neutral-500 font-medium">Módulos Especializados</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-black text-[#012d1d]">100%</div>
                <div className="text-xs text-neutral-500 font-medium">Cumplimiento Oficial ICA</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-black text-[#012d1d]">Multi-Predio</div>
                <div className="text-xs text-neutral-500 font-medium">Gestión Centralizada</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-black text-[#012d1d]">Bluetooth</div>
                <div className="text-xs text-neutral-500 font-medium">Sincronización de Básculas</div>
              </div>
            </div>
          </div>

          {/* Interactive UI Mockup Representation */}
          <div className="mt-12 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#012d1d] via-[#2d6a4f] to-[#f2a900] rounded-2xl blur-lg opacity-25" />
            <div className="relative bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden text-white">
              {/* Window Header */}
              <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-neutral-400">ganaderia.cloud / dashboard / Hato El Diamante</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Predio Activo
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-4 sm:p-6 bg-neutral-900 space-y-5">
                {/* Top Row KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                    <div className="text-xs text-neutral-400 font-medium">Inventario Bovino</div>
                    <div className="text-xl sm:text-2xl font-black text-white mt-1">1,450 <span className="text-xs text-emerald-400 font-normal">cabezas</span></div>
                    <div className="text-[10px] text-emerald-400 font-medium mt-1">12 Lotes activos en potrero</div>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                    <div className="text-xs text-neutral-400 font-medium">Producción Lechera Hoy</div>
                    <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">3,420 <span className="text-xs text-amber-200/70 font-normal">Lts</span></div>
                    <div className="text-[10px] text-amber-300 font-medium mt-1">+4.2% vs promedio semanal</div>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                    <div className="text-xs text-neutral-400 font-medium">Ganancia Diaria (GDP)</div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">740 <span className="text-xs text-neutral-300 font-normal">g/día</span></div>
                    <div className="text-[10px] text-emerald-400 font-medium mt-1">Lote Ceba 2 (Brahman)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                    <div className="text-xs text-neutral-400 font-medium">Área Georreferenciada</div>
                    <div className="text-xl sm:text-2xl font-black text-white mt-1">620 <span className="text-xs text-neutral-300 font-normal">Ha</span></div>
                    <div className="text-[10px] text-cyan-400 font-medium mt-1">34 Potreros mapeados GIS</div>
                  </div>
                </div>

                {/* Sub-panels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50 md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-neutral-300 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        Rotación de Potreros y Capacidad de Carga
                      </span>
                      <span className="text-[11px] text-neutral-400">Aforo: 1.85 UA/Ha</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-center">
                        <div className="text-xs font-bold text-emerald-300">Potrero 14</div>
                        <div className="text-[10px] text-emerald-400/80 font-medium mt-0.5">En Ocupación</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/40 text-center">
                        <div className="text-xs font-bold text-amber-300">Potrero 08</div>
                        <div className="text-[10px] text-amber-400/80 font-medium mt-0.5">En Descanso (18d)</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-700/40 text-center">
                        <div className="text-xs font-bold text-blue-300">Potrero 02</div>
                        <div className="text-[10px] text-blue-400/80 font-medium mt-0.5">Listo p/ Ingreso</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-center">
                        <div className="text-xs font-bold text-neutral-300">Potrero 21</div>
                        <div className="text-[10px] text-neutral-400 font-medium mt-0.5">Mantenimiento</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-neutral-300 flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                        Sanidad y Retiros
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full">ICA OK</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-neutral-900/60 border border-neutral-800">
                        <span className="text-neutral-300">Fiebre Aftosa / Ciclo II</span>
                        <span className="text-emerald-400 font-medium">100% Vacunado</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-neutral-900/60 border border-neutral-800">
                        <span className="text-neutral-300">Retiro Leche (Mastitis)</span>
                        <span className="text-amber-400 font-medium">2 vacas retenidas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM PRESENTATION SECTION */}
      <section id="plataforma" className="py-20 bg-white border-y border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#2d6a4f]">
              Plataforma Integral
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#012d1d] tracking-tight">
              Centraliza la operación de una o varias fincas en tiempo real
            </p>
            <p className="text-base sm:text-lg text-neutral-600">
              GanaderIA unifica los procesos zootécnicos, agronómicos, logísticos y financieros en un entorno colaborativo y seguro para propietarios, administradores y personal de campo.
            </p>
          </div>

          {/* Benefits Grid */}
          <div id="beneficios" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformBenefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#fcfdfa] border border-neutral-200/80 hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-[#012d1d] group-hover:scale-105 group-hover:bg-[#f2a900]/20 transition-all">
                    <Icon className="w-6 h-6 text-[#012d1d]" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#012d1d]">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODULES SECTION */}
      <section id="modulos" className="py-20 bg-[#f8faf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#2d6a4f]">
              Ecosistema Modular
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#012d1d] tracking-tight">
              19 Módulos especializados para cada área de tu ganadería
            </p>
            <p className="text-base sm:text-lg text-neutral-600">
              Cada módulo ha sido diseñado conforme a los protocolos zootécnicos de campo, integrando trazabilidad, analítica y alertas sanitarias en tiempo real.
            </p>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {realModules.map((mod) => {
              const IconComponent = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-md hover:border-emerald-600/50 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl border ${mod.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-100 px-2.5 py-1 rounded-full">
                        {mod.category}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-neutral-900 group-hover:text-[#012d1d] transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#012d1d]">
                    <button
                      onClick={() => onEnterPlatform(mod.id)}
                      className="inline-flex items-center gap-1.5 hover:text-[#2d6a4f] cursor-pointer group-hover:underline"
                    >
                      <span>Abrir módulo</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MULTI-FARM SECTION */}
      <section id="multifincas" className="py-20 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#012d1d] text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                Arquitectura Multi-Predio
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#012d1d] tracking-tight">
                Administra múltiples fincas desde un solo lugar sin mezclar datos
              </h2>
              <p className="text-base text-neutral-600 leading-relaxed">
                Ya sea que manejes una finca de cría, una lechería especializada o un complejo ganadero empresarial de varios predios, GanaderIA te permite:
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-neutral-900 block text-sm">Selección instantánea de predio:</strong>
                    <span className="text-neutral-600 text-xs sm:text-sm">Cambia entre fincas en el encabezado con un clic para actualizar el inventario y potreros en pantalla.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-neutral-900 block text-sm">Consulta de información individual y consolidada:</strong>
                    <span className="text-neutral-600 text-xs sm:text-sm">Audita las métricas productivas y financieras de cada predio por separado o en balances unificados.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-neutral-900 block text-sm">Traslado de animales entre predios:</strong>
                    <span className="text-neutral-600 text-xs sm:text-sm">Registra traslados con control de guía sanitaria ICA y actualización automática de inventario.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onEnterPlatform()}
                  className="px-6 py-3 bg-[#012d1d] text-white hover:bg-[#02442c] font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Explorar gestión multifincas</span>
                  <ArrowRight className="w-4 h-4 text-[#f2a900]" />
                </button>
              </div>
            </div>

            {/* Visual Multi-farm Cards */}
            <div className="space-y-4 bg-[#f8faf7] p-6 rounded-3xl border border-neutral-200/80">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Fincas registradas en la plataforma
              </div>

              {farms.length > 0 ? (
                farms.slice(0, 3).map((f) => (
                  <div
                    key={f.profile.id}
                    className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#012d1d] text-sm">{f.profile.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {f.profile.department}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        {f.profile.totalAreaHa} Hectáreas • {f.headsCount || 0} Animales • {f.paddocks.length} Potreros
                      </div>
                    </div>
                    <button
                      onClick={() => onEnterPlatform()}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-emerald-50 text-[#012d1d] rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      Ingresar
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
                  <div className="font-bold text-[#012d1d] text-sm">Finca La Esperanza</div>
                  <div className="text-xs text-neutral-500">620 Ha • 1,450 Cabezas • Montería, Córdoba</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ROLES & PERMISSIONS SECTION */}
      <section id="roles" className="py-20 bg-[#f8faf7] border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#2d6a4f]">
              Seguridad y Colaboración
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#012d1d] tracking-tight">
              Roles y permisos zootécnicos especializados
            </p>
            <p className="text-base sm:text-lg text-neutral-600">
              Cada perfil accede únicamente a los módulos autorizados para su labor de campo, garantizando la privacidad de los datos financieros y la integridad operativa.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRoles.map((roleItem, index) => {
              const RoleIcon = roleItem.icon;
              return (
                <div
                  key={index}
                  className={`p-6 rounded-2xl bg-white border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                    index === 0 ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-neutral-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#012d1d]">
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                        {roleItem.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-neutral-900">{roleItem.role}</h3>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{roleItem.description}</p>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 space-y-2">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                        Permisos principales:
                      </span>
                      {roleItem.permissions.map((perm, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-xs text-neutral-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{perm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-gradient-to-br from-[#012d1d] via-[#023c27] to-[#012014] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#f2a900]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#f2a900]/20 border border-[#f2a900]/40 flex items-center justify-center mx-auto text-[#f2a900]">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Gestiona tu ganadería con información clara y organizada.
          </h2>

          <p className="text-base sm:text-lg text-emerald-100/80 max-w-2xl mx-auto font-normal">
            Comienza a monitorear tus animales, potreros, pesajes y finanzas con la tecnología más completa del sector agropecuario.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onEnterPlatform()}
              className="w-full sm:w-auto px-8 py-4 text-base font-black text-neutral-950 bg-[#f2a900] hover:bg-[#df9b00] rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-3 group"
            >
              <span>Ingresar a GanaderIA</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-7 py-4 text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all cursor-pointer"
            >
              Iniciar sesión con PIN
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-950 text-neutral-400 py-12 border-t border-neutral-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4 md:col-span-2">
              <GanaderIALogo size="md" variant="compact" theme="dark" showSubtitle={true} />
              <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
                Plataforma integral e inteligente para la administración zootécnica, agronómica y financiera de fincas ganaderas bovinas, bubalinas y equinas.
              </p>
              <div className="text-xs text-emerald-400 font-medium">
                © {new Date().getFullYear()} GanaderIA. Todos los derechos reservados.
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Navegación
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => scrollToSection('inicio')} className="hover:text-white transition-colors cursor-pointer">
                    Inicio
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('plataforma')} className="hover:text-white transition-colors cursor-pointer">
                    Plataforma
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('modulos')} className="hover:text-white transition-colors cursor-pointer">
                    Módulos (19)
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('beneficios')} className="hover:text-white transition-colors cursor-pointer">
                    Beneficios Reales
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('multifincas')} className="hover:text-white transition-colors cursor-pointer">
                    Gestión Multifincas
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('roles')} className="hover:text-white transition-colors cursor-pointer">
                    Roles y Permisos
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Acceso Plataforma
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => onEnterPlatform()} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                    <span>Acceder a la plataforma</span>
                    <ArrowRight className="w-3 h-3 text-[#f2a900]" />
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAuthModal} className="hover:text-white transition-colors cursor-pointer">
                    Iniciar sesión con PIN
                  </button>
                </li>
                {onGoToSuperadmin && (
                  <li>
                    <button onClick={onGoToSuperadmin} className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 text-amber-300/90 font-semibold">
                      <Globe className="w-3 h-3" />
                      <span>Panel Global Superadmin</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-900 text-center text-xs text-neutral-500">
            GanaderIA • Software Inteligente para Ganadería de Precisión • Desarrollado para el sector agropecuario
          </div>
        </div>
      </footer>
    </div>
  );
};
