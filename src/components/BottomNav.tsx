import React from 'react';
import { MainTab } from '../types';
import { CowIcon } from './icons/CowIcon';
import { GrassIcon } from './icons/GrassIcon';
import { MilkGlassIcon } from './icons/MilkGlassIcon';
import { Home, Droplet, Dna, MapPin, Sparkles, Bell, CloudRain, Warehouse, Scale, DollarSign } from 'lucide-react';

interface BottomNavProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 2,
}) => {
  return (
    <nav className="md:hidden fixed bottom-2 left-2 right-2 z-50 flex justify-between items-center px-1.5 py-1.5 bg-[#fff9db]/85 backdrop-blur-md border border-[#ffeaa7]/70 rounded-2xl shadow-xl gap-1">
      {/* Home Tab */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-1 cursor-pointer select-none ${
          activeTab === 'home'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-[#c1ecd4]' : 'text-[#717973]'}`} />
        <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Home</span>
      </button>

      {/* Cattle / Inventarios de Ganado Tab */}
      <button
        onClick={() => setActiveTab('cattle')}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-1 cursor-pointer select-none ${
          activeTab === 'cattle'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <CowIcon className={`w-4 h-4 ${activeTab === 'cattle' ? 'text-[#c1ecd4]' : 'text-[#717973]'}`} />
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider mt-0.5">Ganado</span>
      </button>

      {/* Dairy Tab */}
      <button
        onClick={() => setActiveTab('dairy')}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-1 cursor-pointer select-none ${
          activeTab === 'dairy'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <MilkGlassIcon className={`w-4 h-4 ${activeTab === 'dairy' ? 'text-[#c1ecd4]' : 'text-[#717973]'}`} />
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider mt-0.5">Lechería</span>
      </button>

      {/* Genetics Tab */}
      <button
        onClick={() => setActiveTab('genetics')}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-1 cursor-pointer select-none ${
          activeTab === 'genetics'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <Dna className={`w-4 h-4 ${activeTab === 'genetics' ? 'text-[#c1ecd4]' : 'text-[#717973]'}`} />
        <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Pedigrí</span>
      </button>

      {/* SIG & Potreros Tab */}
      <button
        onClick={() => setActiveTab('gis')}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-0.5 cursor-pointer select-none ${
          activeTab === 'gis'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <MapPin className={`w-3.5 h-3.5 ${activeTab === 'gis' ? 'text-[#ffba38]' : 'text-[#717973]'}`} />
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider mt-0.5">SIG</span>
      </button>

      {/* Aforo Tab */}
      <button
        onClick={() => setActiveTab('aforo')}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-0.5 cursor-pointer select-none ${
          activeTab === 'aforo'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <GrassIcon className={`w-3.5 h-3.5 ${activeTab === 'aforo' ? 'text-[#ffba38]' : 'text-[#717973]'}`} />
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider mt-0.5">Aforos</span>
      </button>

      {/* Finanzas Tab */}
      <button
        onClick={() => setActiveTab('finance')}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-0.5 cursor-pointer select-none ${
          activeTab === 'finance'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <DollarSign className={`w-3.5 h-3.5 ${activeTab === 'finance' ? 'text-[#ffba38]' : 'text-[#717973]'}`} />
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider mt-0.5">Finanzas</span>
      </button>

      {/* Pluviometría Tab */}
      <button
        onClick={() => setActiveTab('rainfall')}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-0.5 cursor-pointer select-none ${
          activeTab === 'rainfall'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <CloudRain className={`w-3.5 h-3.5 ${activeTab === 'rainfall' ? 'text-[#0077b6]' : 'text-[#717973]'}`} />
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider mt-0.5">Lluvia</span>
      </button>

      {/* Almacén Tab */}
      <button
        onClick={() => setActiveTab('inventory')}
        className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-0.5 cursor-pointer select-none ${
          activeTab === 'inventory'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <Warehouse className={`w-3.5 h-3.5 ${activeTab === 'inventory' ? 'text-[#ffba38]' : 'text-[#717973]'}`} />
        <span className="text-[8.5px] font-extrabold uppercase tracking-wider mt-0.5">Bodega</span>
      </button>

      {/* Menu & Sanidad Tab */}
      <button
        onClick={() => setActiveTab('menu')}
        className={`relative flex-1 flex flex-col items-center justify-center transition-all duration-200 rounded-xl py-1.5 px-1 cursor-pointer select-none ${
          activeTab === 'menu'
            ? 'bg-[#012d1d] text-white shadow-sm shadow-[#012d1d]/30 scale-[1.02] border border-[#012d1d]'
            : 'bg-[#fffde7]/60 hover:bg-[#fff3bf]/80 text-[#414844] hover:text-[#012d1d] border border-[#ffe066]/40'
        }`}
      >
        <Sparkles className={`w-4 h-4 ${activeTab === 'menu' ? 'text-[#ffba38]' : 'text-[#717973]'}`} />
        <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">Sanidad</span>
        {unreadCount > 0 && activeTab !== 'menu' && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full animate-ping" />
        )}
      </button>
    </nav>
  );
};

