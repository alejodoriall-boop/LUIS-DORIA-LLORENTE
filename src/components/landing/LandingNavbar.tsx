import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, LogIn, ChevronRight } from 'lucide-react';
import { GanaderIALogo } from '../GanaderIALogo';

export interface LandingNavbarProps {
  onLoginClick: () => void;
  onDemoClick: () => void;
  onGoToSuperadmin?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onLoginClick,
  onDemoClick,
  onGoToSuperadmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key and outside click to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Plataforma', href: '#plataforma' },
    { label: 'Módulos', href: '#modulos' },
    { label: 'Beneficios', href: '#beneficios' },
    { label: 'Gestión multifincas', href: '#multifincas' },
    { label: 'Roles', href: '#roles' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[72px] ${
          isScrolled
            ? 'bg-[#101713]/95 backdrop-blur-md border-b border-white/[0.08] shadow-md'
            : 'bg-[#101713]/90 backdrop-blur-sm border-b border-white/[0.05]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group transition-transform duration-200 active:scale-95"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <GanaderIALogo variant="icon" size="md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-[#F5F2E9]">
                  Ganader<span className="text-[#C9A35A]">IA</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#043825] text-emerald-300 border border-emerald-500/30">
                  Oficial
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#A5B8AC] hidden sm:inline">
                Software Ganadero Integral
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="px-3.5 py-2 text-sm font-medium text-[#A5B8AC] hover:text-[#F5F2E9] hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={onLoginClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#F5F2E9] hover:text-white bg-transparent hover:bg-white/[0.06] rounded-xl transition-all border border-white/15 cursor-pointer active:scale-98"
            >
              <LogIn className="w-4 h-4 text-[#A5B8AC]" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={onDemoClick}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-[#F5F2E9] bg-[#202B24] hover:bg-[#28372e] rounded-xl border border-white/10 transition-all shadow-sm cursor-pointer active:scale-98"
            >
              <span>Acceder a GanaderIA</span>
              <ArrowRight className="w-4 h-4 text-[#C9A35A]" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={onLoginClick}
              className="px-3 py-1.5 text-xs font-semibold text-[#F5F2E9] border border-white/15 rounded-lg bg-white/[0.04]"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A5B8AC] hover:text-[#F5F2E9] hover:bg-white/[0.06] rounded-lg transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden"
            />
            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#101713] text-[#F5F2E9] z-50 p-6 flex flex-col justify-between shadow-2xl border-l border-white/10 md:hidden overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <GanaderIALogo variant="icon" size="md" />
                    <span className="text-lg font-bold text-[#F5F2E9]">GanaderIA</span>
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
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => handleNavClick(link.href)}
                      className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold text-[#A5B8AC] hover:text-[#F5F2E9] hover:bg-white/[0.04] rounded-xl transition-colors text-left"
                    >
                      <span>{link.label}</span>
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
                    onLoginClick();
                  }}
                  className="w-full py-3 px-4 text-center text-sm font-semibold text-[#F5F2E9] bg-[#202B24] hover:bg-[#28372e] border border-white/10 rounded-xl transition-colors"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onDemoClick();
                  }}
                  className="w-full py-3.5 px-4 text-center text-sm font-bold text-[#F5F2E9] bg-[#043825] hover:bg-[#064e3b] border border-emerald-500/30 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Acceder a GanaderIA</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A35A]" />
                </button>
                {onGoToSuperadmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onGoToSuperadmin();
                    }}
                    className="w-full py-2 text-center text-xs font-semibold text-[#C9A35A] hover:underline"
                  >
                    🛡️ Acceso Superadmin Plataforma
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
