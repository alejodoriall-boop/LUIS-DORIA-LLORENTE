import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Menu as MenuIcon,
  X,
  Boxes,
  Briefcase,
  Activity,
  Lock,
  Stethoscope,
  ChevronDown,
  Shield,
  KeyRound,
  FileText,
  UserCheck,
  Wheat,
  Sliders,
  Check,
} from 'lucide-react';
import { GanaderIALogo } from './GanaderIALogo';
import { FarmDataPackage } from '../types';

export interface PublicHomePageProps {
  onEnterPlatform: (targetTab?: string) => void;
  onOpenAuthModal: () => void;
  farms?: FarmDataPackage[];
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  onEnterPlatform,
  onOpenAuthModal,
  farms = [],
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [selectedFarmPreviewId, setSelectedFarmPreviewId] = useState<string>(farms[0]?.profile?.id || 'farm-1');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Smooth scroll helper
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close mobile drawer on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // The 19 real modules present in GanaderIA
  const realModules = [
    {
      id: 'home',
      name: 'Inicio y Resumen de Finca',
      category: 'Gestión General',
      description: 'Tablero consolidado de KPIs zootécnicos, alertas sanitarias prioritarias y bitácora de actividades.',
      icon: Activity,
    },
    {
      id: 'cattle',
      name: 'Ganado y Lotes',
      category: 'Inventario Animal',
      description: 'Control de inventario bovino, pesajes con sincronización a báscula Bluetooth y ganancias diarias (GDP).',
      icon: Layers,
    },
    {
      id: 'dairy',
      name: 'Producción Lechera',
      category: 'Producción',
      description: 'Monitoreo de ordeño individual, control de mastitis (CMT/RCS), calidad en tanque y curvas de lactancia.',
      icon: Milk,
    },
    {
      id: 'genetics',
      name: 'Genética y Reproducción',
      category: 'Mejoramiento Genético',
      description: 'Programas de IATF, transferencia de embriones, catálogo de toros, pajillas y simulación de consanguinidad.',
      icon: Dna,
    },
    {
      id: 'calf_rearing',
      name: 'Cría de Terneros',
      category: 'Crianza',
      description: 'Protocolos de crianza artificial, suministro de calostro, control de diarreas/neumonías y pesajes predestete.',
      icon: HeartPulse,
    },
    {
      id: 'equines',
      name: 'Equinos',
      category: 'Especies de Trabajo',
      description: 'Registro de caballos, mulares y asnales de vaquería, genealogía, herraje, desparasitación y aptitud física.',
      icon: Award,
    },
    {
      id: 'buffalo',
      name: 'Búfalos',
      category: 'Especies Especiales',
      description: 'Manejo especializado de hatos bubalinos: curva de gestación (312 días), sólidos de leche y rusticidad.',
      icon: Boxes,
    },
    {
      id: 'sanitary',
      name: 'Sanidad',
      category: 'Salud Animal',
      description: 'Calendario de vacunación oficial ICA, planes preventivos y bloqueo de venta por tiempos de retiro farmacológico.',
      icon: Stethoscope,
    },
    {
      id: 'gis',
      name: 'Potreros y Gestión Geográfica',
      category: 'Infraestructura',
      description: 'Mapeo satelital de perímetros de finca, curvas de nivel, zonas de inundación y rotación de potreros.',
      icon: MapPin,
    },
    {
      id: 'rainfall',
      name: 'Pluviometría',
      category: 'Clima y Forraje',
      description: 'Historial pluviométrico milimétrico (mm/día), análisis estacional de sequías y correlación con biomasa.',
      icon: CloudRain,
    },
    {
      id: 'aforo',
      name: 'Aforos y Capacidad de Carga',
      category: 'Manejo Forrajero',
      description: 'Cálculo de biomasa por metro cuadrado, forraje verde disponible, período de descanso y Unidad Gran Ganado (UGG).',
      icon: Wheat,
    },
    {
      id: 'supplementation',
      name: 'Suplementación',
      category: 'Nutrición Animal',
      description: 'Formulación y dosificación de sales mineralizadas, bloques multinutricionales y balance de raciones.',
      icon: Boxes,
    },
    {
      id: 'inventory',
      name: 'Inventario y Almacén',
      category: 'Logística de Insumos',
      description: 'Control de stock en bodega: medicamentos veterinarios, biológicos, semillas, alambres y alertas de vencimiento.',
      icon: Boxes,
    },
    {
      id: 'sales',
      name: 'Ventas',
      category: 'Comercialización',
      description: 'Despacho de animales a frigorífico o subasta, liquidación de peso en báscula, mermas y guías de movilización.',
      icon: DollarSign,
    },
    {
      id: 'finance',
      name: 'Finanzas',
      category: 'Administración',
      description: 'Control de ingresos, egresos operacionales, costo por kilo producido y rentabilidad neta por hectárea.',
      icon: TrendingUp,
    },
    {
      id: 'payroll',
      name: 'Nómina',
      category: 'Gestión Humana',
      description: 'Liquidación de jornales de vaquería, salarios fijos de administradores, anticipos y registro de empleados.',
      icon: Users,
    },
    {
      id: 'traceability',
      name: 'Trazabilidad',
      category: 'Identificación Oficial',
      description: 'Historial individual de cada animal desde nacimiento: genealogía, eventos médicos, traslados y chapetas DIN.',
      icon: ShieldCheck,
    },
    {
      id: 'analytics',
      name: 'Reportes y Analítica',
      category: 'Inteligencia de Datos',
      description: 'Consolidación de indicadores zootécnicos, curvas de crecimiento, intervalos entre partos y exportación a Excel/PDF.',
      icon: FileSpreadsheet,
    },
    {
      id: 'admin',
      name: 'Administración y Permisos',
      category: 'Seguridad y Control',
      description: 'Gestión de usuarios del predio, asignación de roles con PIN de seguridad y bitácora de auditoría de cambios.',
      icon: Shield,
    },
  ];

  // 5 Key capabilities cards row
  const capabilityCards = [
    { title: '19 módulos especializados', icon: Layers, accent: 'text-[#D4A94E]' },
    { title: 'Gestión multifincas', icon: Building2, accent: 'text-[#10B981]' },
    { title: 'Control de usuarios y permisos', icon: ShieldCheck, accent: 'text-[#D4A94E]' },
    { title: 'Integración con básculas', icon: Scale, accent: 'text-[#10B981]' },
    { title: 'Reportes y analítica', icon: TrendingUp, accent: 'text-[#D4A94E]' },
  ];

  // Benefits
  const benefits = [
    {
      title: 'Control integral del hato',
      description: 'Visualiza en tiempo real el censo de animales por categoría, sexo, raza y ubicación en potreros.',
      icon: Layers,
    },
    {
      title: 'Trazabilidad animal',
      description: 'Ficha única e inmutable por animal con historial completo de pesajes, tratamientos y genealogía.',
      icon: ShieldCheck,
    },
    {
      title: 'Gestión sanitaria',
      description: 'Planes preventivos oficiales ICA y bloqueo automático de despacho por tiempos de retiro de medicamentos.',
      icon: HeartPulse,
    },
    {
      title: 'Reproducción y genética',
      description: 'Control de servicios, palpaciones, IATF, días abiertos e intervalos entre partos para optimizar preñez.',
      icon: Dna,
    },
    {
      title: 'Manejo de potreros',
      description: 'Mapeo satelital y rotación programada para maximizar el aprovechamiento de la biomasa forrajera.',
      icon: MapPin,
    },
    {
      title: 'Control de lluvias y aforos',
      description: 'Medición de precipitaciones milimétricas y aforos de pasto para determinar la capacidad de carga (UGG/Ha).',
      icon: CloudRain,
    },
    {
      title: 'Inventarios y almacén',
      description: 'Bodega de insumos con control de lotes, fechas de caducidad, consumo promedio y alertas de stock mínimo.',
      icon: Boxes,
    },
    {
      title: 'Finanzas y flujo de caja',
      description: 'Cálculo del costo por kilo producido en ceba, margen de utilidad y rentabilidad neta por hectárea.',
      icon: DollarSign,
    },
    {
      title: 'Nómina y personal',
      description: 'Liquidación de jornales de campo, registro de contratistas, anticipos y control de tareas asignadas.',
      icon: Users,
    },
    {
      title: 'Reportes gerenciales',
      description: 'Informes ejecutivos consolidados listos para exportar a hojas de cálculo o presentar a entidades.',
      icon: FileSpreadsheet,
    },
    {
      title: 'Control de usuarios y permisos',
      description: 'Acceso seguro mediante PIN de seguridad con perfiles específicos para cada miembro del equipo.',
      icon: Lock,
    },
    {
      title: 'Gestión de múltiples fincas',
      description: 'Administra varios predios desde una sola cuenta, comparando indicadores consolidados o individuales.',
      icon: Building2,
    },
  ];

  // 8 Process categories in platform presentation
  const platformProcesses = [
    { title: 'Zootécnicos', desc: 'Control de pesajes, ganancias diarias de peso (GDP) y clasificación zootécnica de lotes.', icon: Scale },
    { title: 'Sanitarios', desc: 'Planes de vacunación oficial ICA, biológicos, antibióticos y control de tiempos de retiro.', icon: Stethoscope },
    { title: 'Reproductivos', desc: 'Servicios por monta natural e IATF, diagnóstico de gestación por palpación y partos.', icon: Dna },
    { title: 'Productivos', desc: 'Monitoreo de ordeño, calidad de leche en tanque frío y rendimiento en canal para ceba.', icon: Milk },
    { title: 'Agronómicos', desc: 'Aforos de biomasa por metro cuadrado, rotación de praderas y registro pluviométrico.', icon: Wheat },
    { title: 'Administrativos', desc: 'Gestión de personal de vaquería, nómina por jornales y bitácora de novedades diarias.', icon: Briefcase },
    { title: 'Financieros', desc: 'Contabilidad simplificada ganadera, flujo de caja y rentabilidad calculada por hectárea.', icon: TrendingUp },
    { title: 'Logísticos', desc: 'Control de bodegas de insumos, traslados entre predios y despacho de lotes para venta.', icon: Boxes },
  ];

  // Roles
  const roles = [
    {
      title: 'Propietario',
      roleType: 'propietario',
      description: 'Acceso total y estratégico a todas las fincas. Supervisión del patrimonio ganadero, decisiones financieras y de inversión.',
      permissions: [
        'Visualización consolidada de todas las fincas',
        'Acceso completo a finanzas, compras y ventas',
        'Autorización de gastos extraordinarios y nómina',
        'Configuración de permisos y usuarios del sistema',
        'Exportación de reportes gerenciales ejecutivos',
      ],
      badge: 'Acceso Total',
    },
    {
      title: 'Administrador',
      roleType: 'administrador',
      description: 'Gestión operativa, inventarios, compras de insumos, supervisión de personal y control del calendario sanitario.',
      permissions: [
        'Registro de entradas, salidas y traslados de ganado',
        'Control de almacén, insumos y compras de bodega',
        'Liquidación de nómina de vaquería y jornales',
        'Programación de aforos y rotación de potreros',
        'Supervisión de metas de ganancia de peso (GDP)',
      ],
      badge: 'Gestión Operativa',
    },
    {
      title: 'Veterinario o Zootecnista',
      roleType: 'veterinario',
      description: 'Control estricto de la salud del hato, protocolos reproductivos (IATF), tiempos de retiro y mejoramiento genético.',
      permissions: [
        'Registro de diagnósticos de palpación y ecografía',
        'Aplicación de tratamientos médicos y planes sanitarios',
        'Bloqueo preventivo de venta por tiempos de retiro',
        'Gestión del catálogo de toros y pajillas de semen',
        'Control de calidad de leche y pruebas CMT de mastitis',
      ],
      badge: 'Salud & Genética',
    },
    {
      title: 'Mayordomo o Personal de Campo',
      roleType: 'mayordomo',
      description: 'Captura ágil de eventos en corral: pesajes en báscula, partos, muertes y movimientos de potrero.',
      permissions: [
        'Registro rápido de pesajes individuales y de lote',
        'Reporte de nacimientos, sexaje e identificación',
        'Registro de novedades de campo y rotación de pradera',
        'Consulta básica de fichas de animales en corral',
      ],
      badge: 'Operación en Corral',
    },
    {
      title: 'Financiero o Contador',
      roleType: 'financiero_contador',
      description: 'Control de cuentas por pagar, facturación de ventas, egresos operativos, liquidación de jornales y rentabilidad.',
      permissions: [
        'Registro y conciliación de transacciones financieras',
        'Liquidación detallada de nómina y pagos al personal',
        'Reportes de costos por kilo ganado y por hectárea',
        'Comprobantes de venta y liquidación de báscula',
      ],
      badge: 'Finanzas & Costos',
    },
  ];

  // Security features
  const securityFeatures = [
    { title: 'Inicio de sesión mediante PIN', desc: 'Cada usuario accede con un código PIN de 4 dígitos individualizado para evitar suplantaciones.', icon: KeyRound },
    { title: 'Roles y permisos granulares', desc: 'Acceso segmentado según la función zootécnica, administrativa o de campo del colaborador.', icon: UserCheck },
    { title: 'Protección de información', desc: 'Aislamiento estricto de datos con políticas de seguridad en base de datos para cada ganadería.', icon: ShieldCheck },
    { title: 'Bitácora de actividades', desc: 'Registro inmutable de auditoría con fecha, hora y usuario para cada movimiento registrado.', icon: FileText },
    { title: 'Trazabilidad de operaciones', desc: 'Historial completo de pesajes, partos, ventas y tratamientos con trazabilidad individual.', icon: Activity },
    { title: 'Separación de datos por finca', desc: 'Gestión multi-predio independiente garantizando que cada predio mantenga sus registros propios.', icon: Building2 },
    { title: 'Control de accesos y seguridad', desc: 'Supervisión de permisos por rol, bloqueo preventivo de despacho y cifrado institucional.', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#0D1A13] text-[#FFFFFF] font-sans antialiased selection:bg-[#123F2A] selection:text-[#D4A94E] flex flex-col">
      
      {/* 1. Encabezado Fijo (Sticky Dark Navbar - 72px) */}
      <header className="sticky top-0 z-50 h-[72px] bg-[#0D1A13]/95 backdrop-blur-md border-b border-white/[0.07] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Brand Logo (Left) */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('inicio');
            }}
            className="flex items-center gap-3 group transition-transform active:scale-98"
          >
            <GanaderIALogo variant="icon" size="md" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#FFFFFF]">
                Ganader<span className="text-[#D4A94E]">IA</span>
              </span>
              <span className="text-[10px] font-medium text-[#A5B8AC] tracking-wider uppercase hidden sm:inline">
                Software Ganadero
              </span>
            </div>
          </a>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { label: 'Inicio', id: 'inicio' },
              { label: 'Plataforma', id: 'plataforma' },
              { label: 'Módulos', id: 'modulos' },
              { label: 'Beneficios', id: 'beneficios' },
              { label: 'Gestión multifincas', id: 'multifincas' },
              { label: 'Roles', id: 'roles' },
            ].map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="px-3.5 py-1.5 text-xs xl:text-sm font-medium text-[#A5B8AC] hover:text-[#FFFFFF] hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs (Right) */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-4 py-2 text-xs xl:text-sm font-semibold text-[#FFFFFF] hover:text-white bg-transparent hover:bg-white/[0.06] rounded-xl border border-white/15 transition-all cursor-pointer active:scale-98"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 px-4.5 py-2 text-xs xl:text-sm font-bold text-[#FFFFFF] bg-[#1F3327] hover:bg-[#28372e] rounded-xl border border-white/10 shadow-xs hover:border-white/20 transition-all cursor-pointer active:scale-98"
            >
              <span>Acceder a GanaderIA</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4A94E]" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 text-xs font-semibold text-[#FFFFFF] border border-white/15 rounded-lg bg-white/[0.04]"
            >
              Acceder
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A5B8AC] hover:text-[#FFFFFF] hover:bg-white/[0.06] rounded-lg transition-colors"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0D1A13] z-50 p-6 flex flex-col justify-between shadow-2xl border-l border-white/10 lg:hidden overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <GanaderIALogo variant="icon" size="md" />
                    <span className="text-lg font-bold text-[#FFFFFF]">GanaderIA</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#A5B8AC] hover:bg-white/10 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-1">
                  {[
                    { label: 'Inicio', id: 'inicio' },
                    { label: 'Plataforma', id: 'plataforma' },
                    { label: 'Módulos', id: 'modulos' },
                    { label: 'Beneficios', id: 'beneficios' },
                    { label: 'Gestión multifincas', id: 'multifincas' },
                    { label: 'Roles', id: 'roles' },
                    { label: 'Seguridad', id: 'seguridad' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-[#A5B8AC] hover:text-[#FFFFFF] hover:bg-white/[0.04] rounded-xl text-left"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-[#A5B8AC]/40" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-3 px-4 text-center text-sm font-semibold text-[#FFFFFF] bg-[#1F3327] hover:bg-[#28372e] border border-white/10 rounded-xl"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-3.5 px-4 text-center text-sm font-bold text-[#FFFFFF] bg-[#123F2A] hover:bg-[#064e3b] border border-emerald-500/30 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <span>Acceder a GanaderIA</span>
                  <ArrowRight className="w-4 h-4 text-[#D4A94E]" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Sección Principal (Hero) - Dos Columnas + Tarjetas de Capacidades + Tarjeta Tecnológica */}
      <section id="inicio" className="pt-10 pb-16 sm:pt-14 sm:pb-20 bg-[#0D1A13] border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Two-Column Hero Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Columna Izquierda (~43%) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-5 flex flex-col justify-center"
            >
              {/* Main Headline in Serif Typography with Golden "control." */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] text-[#FFFFFF] font-bold tracking-tight leading-[1.12]">
                Tu ganadería,<br />
                bajo <span className="text-[#D4A94E] underline decoration-[#D4A94E]/40 decoration-2 underline-offset-4">control.</span>
              </h1>

              {/* Exact Descriptive Subtitle in greenish-gray */}
              <p className="mt-5 sm:mt-6 text-base sm:text-lg text-[#A5B8AC] leading-relaxed max-w-lg font-normal">
                Administra animales, producción, sanidad, potreros, inventarios, finanzas y actividades de todas tus fincas desde una sola plataforma.
              </p>

              {/* Hero Action Buttons */}
              <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-bold text-[#FFFFFF] bg-[#1F3327] hover:bg-[#28372e] border border-white/15 hover:border-white/30 rounded-xl shadow-md transition-all cursor-pointer group active:scale-98"
                >
                  <span>Acceder a GanaderIA</span>
                  <ArrowRight className="w-4 h-4 text-[#D4A94E] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('modulos')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm sm:text-base font-semibold text-[#A5B8AC] hover:text-[#FFFFFF] bg-transparent hover:bg-white/[0.04] rounded-xl border border-white/10 transition-all cursor-pointer active:scale-98"
                >
                  <span>Explorar módulos</span>
                  <ChevronDown className="w-4 h-4 text-[#A5B8AC]" />
                </button>
              </div>
            </motion.div>

            {/* Columna Derecha (~57%) - Fotografía Ganadera Horizontal 16:9 de Vaca Gyr */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#15241C]">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/41/Cow%2C_breed_Gir_in_Balacan%2C_Mexico.jpg"
                  alt="Vaca de raza Gyr lechero en potrero verde bajo luz natural"
                  className="w-full h-[280px] sm:h-[360px] lg:h-[400px] object-cover object-center"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('Brazilian_Gyr_Cattle')) {
                      target.src = 'https://commons.wikimedia.org/wiki/Special:FilePath/Brazilian_Gyr_Cattle.jpg';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>

          </div>

          {/* 3. Fila de Cinco Tarjetas de Capacidades */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {capabilityCards.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#1F3327] border border-white/[0.08] hover:border-white/20 rounded-xl p-5 flex flex-col items-center justify-center text-center h-32 sm:h-36 shadow-xs group transition-colors"
                >
                  <div className="mb-3">
                    <IconComp className={`w-7 h-7 ${card.accent} group-hover:scale-110 transition-transform`} />
                  </div>
                  <span className="text-sm font-semibold text-[#FFFFFF] tracking-tight leading-snug">
                    {card.title}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* 4. Tarjeta Tecnológica Inferior Integrada */}
          <div className="mt-6 bg-[#15241C] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-80 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              {/* Left Column: Platform & Sync Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <GanaderIALogo variant="icon" size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-[#FFFFFF]">
                        GanaderIA · Tablero General
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#123F2A] text-emerald-300 border border-emerald-500/30">
                        SISTEMA OFICIAL
                      </span>
                    </div>
                    <div className="text-xs text-[#A5B8AC] mt-0.5">
                      5 predios activos · Córdoba, Meta y Antioquia
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-start sm:self-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sincronizado</span>
                </div>
              </div>

              {/* Right Column: Weight Indicator + Mini Ascending Golden Trend Line */}
              <div className="flex items-center gap-5 sm:gap-8 self-end lg:self-center pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.08] w-full lg:w-auto justify-between lg:justify-end">
                
                {/* Tru-Test Live Metric */}
                <div>
                  <div className="text-[11px] text-[#A5B8AC] uppercase font-semibold tracking-wider">
                    Báscula Tru-Test
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#D4A94E] tracking-tight">
                    442.5 kg <span className="text-xs font-normal text-[#A5B8AC]">(+0.88 kg/d)</span>
                  </div>
                </div>

                {/* Mini Golden Trend Line Chart (SVG) */}
                <div className="flex flex-col items-end">
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#D4A94E]" />
                    <span>Curva de Ganancia</span>
                  </div>
                  <svg className="w-28 sm:w-36 h-8 mt-1 overflow-visible" viewBox="0 0 120 30" fill="none">
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4A94E" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#D4A94E" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,24 Q20,22 40,16 T80,10 T120,4 L120,30 L0,30 Z"
                      fill="url(#goldGradient)"
                    />
                    <path
                      d="M0,24 Q20,22 40,16 T80,10 T120,4"
                      stroke="#D4A94E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="120" cy="4" r="3.5" fill="#D4A94E" className="animate-pulse" />
                  </svg>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. Presentación de la Plataforma (Procesos) */}
      <section id="plataforma" className="py-20 bg-[#15241C] border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123F2A] text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              Ecosistema Unificado
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight">
              Todos los procesos de tu ganadería en un solo sistema
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#A5B8AC]">
              GanaderIA centraliza e interconecta todas las áreas críticas de la finca para que la información fluya sin fricciones entre el corral, la veterinaria y la gerencia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {platformProcesses.map((proc, idx) => {
              const IconComp = proc.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#1F3327] border border-white/[0.08] hover:border-white/20 transition-all group"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#123F2A] text-[#D4A94E] flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#FFFFFF] tracking-tight">
                    Procesos {proc.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#A5B8AC] leading-relaxed">
                    {proc.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Beneficios */}
      <section id="beneficios" className="py-20 bg-[#0D1A13] border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123F2A] text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              Ventajas Comprobadas
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight">
              Beneficios estratégicos para el productor ganadero
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#A5B8AC]">
              Herramientas diseñadas para aumentar la rentabilidad por hectárea, reducir pérdidas y garantizar el cumplimiento normativo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, idx) => {
              const IconComp = b.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#1F3327] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#123F2A] text-[#D4A94E] border border-emerald-500/20 flex items-center justify-center mb-4">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#FFFFFF] tracking-tight">
                      {b.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#A5B8AC] leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. Módulos Especializados (Los 19 reales) */}
      <section id="modulos" className="py-20 bg-[#15241C] border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123F2A] text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              19 Módulos Especializados
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight">
              Estructura modular completa de GanaderIA
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#A5B8AC]">
              Cada módulo resuelve un área operativa específica de la ganadería, interconectado en tiempo real con el resto de la plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {realModules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => onEnterPlatform(mod.id)}
                  className="p-6 rounded-xl bg-[#1F3327] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-lg bg-[#123F2A] text-[#D4A94E] border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/[0.06] text-[#A5B8AC]">
                        {mod.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#FFFFFF] group-hover:text-[#D4A94E] transition-colors">
                      {mod.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#A5B8AC] leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold text-[#D4A94E] group-hover:underline">
                    <span>Acceder al módulo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1F3327] hover:bg-[#28372e] text-[#FFFFFF] font-bold text-sm border border-white/15 cursor-pointer shadow-md transition-all active:scale-98"
            >
              <span>Ingresar con tu PIN a los módulos</span>
              <ArrowRight className="w-4 h-4 text-[#D4A94E]" />
            </button>
          </div>

        </div>
      </section>

      {/* 8. Gestión Multifincas */}
      <section id="multifincas" className="py-20 bg-[#0D1A13] border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123F2A] text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              Arquitectura Multi-Predio
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight">
              Gestión centralizada de múltiples fincas
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#A5B8AC]">
              Administra todas tus haciendas desde una sola cuenta. Cambia de predio con un clic o visualiza el balance consolidado de toda tu empresa ganadera.
            </p>
          </div>

          {/* Multifarm Capability Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-12 text-center">
            {[
              { title: 'Selector de finca', desc: 'Conmutación instantánea entre predios desde la cabecera.', icon: Building2 },
              { title: 'Información consolidada', desc: 'Suma de inventarios, hectáreas y ventas globales.', icon: Layers },
              { title: 'Indicadores por predio', desc: 'KPIs zootécnicos y climáticos independientes.', icon: TrendingUp },
              { title: 'Comparación de resultados', desc: 'Análisis comparativo de GDP y costos entre fincas.', icon: Scale },
              { title: 'Administración centralizada', desc: 'Catálogo de toros y bodega matriz compartida.', icon: Boxes },
              { title: 'Accesos diferenciados', desc: 'Permisos de mayordomo restringidos a su predio.', icon: UserCheck },
            ].map((p, idx) => {
              const IconC = p.icon;
              return (
                <div key={idx} className="p-4.5 bg-[#1F3327] rounded-xl border border-white/[0.08]">
                  <div className="w-9 h-9 rounded-lg bg-[#123F2A] text-[#D4A94E] mx-auto flex items-center justify-center mb-3">
                    <IconC className="w-4.5 h-4.5" />
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-[#FFFFFF]">{p.title}</div>
                  <div className="text-[11px] text-[#A5B8AC] mt-1 leading-relaxed">{p.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Live Farm Directory Preview */}
          <div className="bg-[#15241C] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Directorio de Predios</span>
                <h3 className="text-lg sm:text-xl font-bold text-[#FFFFFF] mt-0.5">Tus Fincas en Operación</h3>
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-4 py-2 bg-[#1F3327] hover:bg-[#28372e] text-[#FFFFFF] font-bold text-xs rounded-xl border border-white/10 transition-colors self-start sm:self-auto"
              >
                + Registrar Nueva Finca
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {(farms || []).slice(0, 6).map((farm) => {
                const totalBovinos =
                  farm?.headsCount ??
                  (farm?.lots || []).reduce((acc, l) => acc + (l.animalCount || 0), 0) ??
                  farm?.profile?.headsCount ??
                  0;
                const totalPotreros =
                  farm?.paddocks?.length ??
                  farm?.profile?.paddocksCount ??
                  0;
                const totalHa = farm?.profile?.totalAreaHa ?? 0;

                return (
                  <div
                    key={farm.profile.id}
                    onClick={() => setSelectedFarmPreviewId(farm.profile.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedFarmPreviewId === farm.profile.id
                        ? 'bg-[#1F3327] border-emerald-500/50 ring-1 ring-emerald-500/30'
                        : 'bg-[#1F3327]/60 border-white/[0.08] hover:bg-[#1F3327]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#FFFFFF]">{farm.profile.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#123F2A] text-emerald-300 border border-emerald-500/20">
                        {farm.profile.department}
                      </span>
                    </div>
                    <div className="text-xs text-[#A5B8AC] mt-1">{farm.profile.municipality} • {totalHa} HA</div>
                    
                    <div className="mt-3 pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-xs font-semibold text-[#FFFFFF]">
                      <div>
                        <span className="text-[10px] text-[#A5B8AC] block">Cabezas</span>
                        <span>{totalBovinos} bovinos</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#A5B8AC] block">Potreros</span>
                        <span>{totalPotreros} potreros</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 9. Roles y Permisos (Interactivo) */}
      <section id="roles" className="py-20 bg-[#15241C] border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123F2A] text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              Perfiles y Alcance
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight">
              Roles y permisos diseñados para cada perfil
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#A5B8AC]">
              Selecciona un perfil para consultar sus facultades operativas, nivel de acceso a datos y alcance dentro de GanaderIA.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {roles.map((r, idx) => (
              <button
                key={r.roleType}
                type="button"
                onClick={() => setSelectedRoleIndex(idx)}
                className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedRoleIndex === idx
                    ? 'bg-[#1F3327] text-[#FFFFFF] border border-white/20 shadow-md'
                    : 'bg-transparent text-[#A5B8AC] hover:text-[#FFFFFF] hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {r.title}
              </button>
            ))}
          </div>

          {/* Active Role Card Detail */}
          <div className="max-w-4xl mx-auto bg-[#1F3327] rounded-2xl border border-white/10 p-7 sm:p-9 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#123F2A] text-emerald-300 border border-emerald-500/30">
                  {roles[selectedRoleIndex].badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] mt-2">
                  Perfil de {roles[selectedRoleIndex].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-4 py-2 bg-[#123F2A] hover:bg-[#064e3b] text-[#FFFFFF] text-xs font-bold rounded-xl border border-emerald-500/30 self-start sm:self-auto"
              >
                Iniciar sesión con este rol
              </button>
            </div>

            <p className="mt-5 text-sm sm:text-base text-[#A5B8AC] leading-relaxed">
              {roles[selectedRoleIndex].description}
            </p>

            <div className="mt-7">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#A5B8AC] mb-3">
                Permisos y Facultades en el Sistema:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roles[selectedRoleIndex].permissions.map((perm, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 bg-[#15241C] rounded-xl border border-white/[0.06] text-xs sm:text-sm font-medium text-[#FFFFFF]">
                    <CheckCircle2 className="w-4 h-4 text-[#D4A94E] shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 10. Seguridad */}
      <section id="seguridad" className="py-20 bg-[#0D1A13] border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123F2A] text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              Protección y Confianza
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFFFF] tracking-tight">
              Seguridad y control de tu información
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#A5B8AC]">
              Arquitectura blindada para salvaguardar los datos zootécnicos, patrimoniales y comerciales de tu ganadería.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {securityFeatures.map((sec, idx) => {
              const IconC = sec.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#1F3327] border border-white/[0.08] flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#123F2A] text-[#D4A94E] flex items-center justify-center mb-4 border border-emerald-500/20">
                      <IconC className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#FFFFFF]">
                      {sec.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#A5B8AC] leading-relaxed">
                      {sec.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 11. Llamado a la Acción (Final CTA) */}
      <section className="py-20 bg-[#15241C] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="mx-auto mb-6 flex items-center justify-center">
            <GanaderIALogo variant="icon" size="xl" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-[#FFFFFF]">
            Transforma la información de tu finca en mejores decisiones.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#A5B8AC] max-w-2xl mx-auto leading-relaxed font-normal">
            Convierte los registros diarios de pesaje, sanidad, partos y costos en decisiones productivas y financieras certeras para tu ganadería.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1F3327] hover:bg-[#28372e] text-[#FFFFFF] font-bold text-sm rounded-xl border border-white/15 shadow-xl transition-all cursor-pointer active:scale-98"
            >
              Ingresar a GanaderIA
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('modulos')}
              className="w-full sm:w-auto px-7 py-3.5 bg-transparent hover:bg-white/[0.04] text-[#A5B8AC] hover:text-[#FFFFFF] font-semibold text-sm rounded-xl border border-white/10 transition-all cursor-pointer active:scale-98"
            >
              Ver los 19 módulos
            </button>
          </div>

        </div>
      </section>

      {/* 12. Pie de Página (Footer) */}
      <footer className="bg-[#0D1A13] text-[#A5B8AC] py-14 border-t border-white/[0.07] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/[0.07]">
            {/* Column 1: Brand Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <GanaderIALogo variant="icon" size="md" />
                <span className="text-lg font-bold text-[#FFFFFF]">GanaderIA</span>
              </div>
              <p className="text-xs text-[#A5B8AC] leading-relaxed max-w-xs">
                Plataforma integral para la administración ganadera, control zootécnico, sanidad, pesaje e inventarios multi-finca.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <div className="font-bold text-[#FFFFFF] text-xs uppercase tracking-wider mb-3">Navegación</div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => scrollToSection('inicio')} className="hover:text-[#FFFFFF] text-left transition-colors">Inicio</button>
                <button type="button" onClick={() => scrollToSection('plataforma')} className="hover:text-[#FFFFFF] text-left transition-colors">Plataforma</button>
                <button type="button" onClick={() => scrollToSection('modulos')} className="hover:text-[#FFFFFF] text-left transition-colors">Módulos</button>
                <button type="button" onClick={() => scrollToSection('beneficios')} className="hover:text-[#FFFFFF] text-left transition-colors">Beneficios</button>
                <button type="button" onClick={() => scrollToSection('multifincas')} className="hover:text-[#FFFFFF] text-left transition-colors">Gestión multifincas</button>
                <button type="button" onClick={() => scrollToSection('roles')} className="hover:text-[#FFFFFF] text-left transition-colors">Roles y permisos</button>
              </div>
            </div>

            {/* Column 3: Legal & Security */}
            <div>
              <div className="font-bold text-[#FFFFFF] text-xs uppercase tracking-wider mb-3">Legal y Seguridad</div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="hover:text-[#FFFFFF] text-left transition-colors">Política de privacidad</button>
                <button type="button" onClick={() => setIsTermsModalOpen(true)} className="hover:text-[#FFFFFF] text-left transition-colors">Términos y condiciones</button>
                <button type="button" onClick={() => scrollToSection('seguridad')} className="hover:text-[#FFFFFF] text-left transition-colors">Seguridad de datos</button>
              </div>
            </div>

            {/* Column 4: Access */}
            <div>
              <div className="font-bold text-[#FFFFFF] text-xs uppercase tracking-wider mb-3">Acceso al Software</div>
              <p className="text-xs text-[#A5B8AC] mb-3">
                Ingresa con tu usuario y PIN de seguridad para gestionar tus hatos.
              </p>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="w-full py-2.5 px-4 bg-[#1F3327] hover:bg-[#28372e] text-[#FFFFFF] border border-white/10 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Iniciar sesión ahora
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A5B8AC]/60">
            <div>
              © {new Date().getFullYear()} GanaderIA. Todos los derechos reservados.
            </div>
            <div>
              Software Ganadero Colombiano • Ganadería Bovina, Bubalina y Equina
            </div>
          </div>

        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F3327] text-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-bold text-lg text-[#FFFFFF]">Política de Privacidad</h3>
              <button type="button" onClick={() => setIsPrivacyModalOpen(false)} className="p-1 rounded-lg text-[#A5B8AC] hover:bg-white/10 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 text-xs text-[#A5B8AC] space-y-3 leading-relaxed">
              <p>En <strong className="text-[#FFFFFF]">GanaderIA</strong>, la privacidad y seguridad de la información zootécnica, comercial y patrimonial de nuestros clientes es una prioridad institucional.</p>
              <p>Los datos registrados sobre inventarios animales, pesajes, sanidad y finanzas pertenecen exclusivamente al propietario de la cuenta y no son compartidos con terceros sin autorización expresa.</p>
              <p>La autenticación se realiza mediante PIN individual y las sesiones se protegen mediante protocolos cifrados en la nube.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-right">
              <button type="button" onClick={() => setIsPrivacyModalOpen(false)} className="px-4 py-2 bg-[#123F2A] text-white text-xs font-bold rounded-xl border border-emerald-500/30">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F3327] text-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-bold text-lg text-[#FFFFFF]">Términos y Condiciones</h3>
              <button type="button" onClick={() => setIsTermsModalOpen(false)} className="p-1 rounded-lg text-[#A5B8AC] hover:bg-white/10 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 text-xs text-[#A5B8AC] space-y-3 leading-relaxed">
              <p>El uso del software <strong className="text-[#FFFFFF]">GanaderIA</strong> implica la aceptación de los presentes términos de servicio.</p>
              <p>El usuario es responsable de mantener la confidencialidad de su PIN de acceso y de verificar la veracidad de los datos sanitarios y de pesaje ingresados en la plataforma.</p>
              <p>GanaderIA provee herramientas de cálculo zootécnico y alertas de tiempo de retiro que deben ser supervisadas por médicos veterinarios acreditados.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-right">
              <button type="button" onClick={() => setIsTermsModalOpen(false)} className="px-4 py-2 bg-[#123F2A] text-white text-xs font-bold rounded-xl border border-emerald-500/30">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
