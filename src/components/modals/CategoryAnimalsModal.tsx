import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  Download,
  Milk,
  Award,
  Baby,
  Users,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Tag,
  ShieldAlert,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { MilkGlassIcon } from '../icons/MilkGlassIcon';

export type DairyCategoryKey =
  | 'todos'
  | 'vacas_ordeno'
  | 'vacas_secas'
  | 'toros_lecheros'
  | 'terneras_crias'
  | 'levante_reemplazos';

export interface CategoryAnimalRecord {
  id: string;
  tag: string;
  name: string;
  category: DairyCategoryKey;
  categoryLabel: string;
  breed: string;
  ageMonths: number;
  weightKg: number;
  rfidChip?: string;
  lotName: string;
  statusLabel: string;
  // Specific metrics
  dailyMilkLiters?: number;
  lactationDays?: number;
  gestationDays?: number;
  expectedCalvingDate?: string;
  milkProofPtam?: number;
  damTag?: string;
  healthAlert?: string;
}

interface CategoryAnimalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: DairyCategoryKey;
  moduleTitle?: string;
}

// Generate rich mock dataset for the Dairy Module animals
const generateDairyAnimals = (): CategoryAnimalRecord[] => {
  const list: CategoryAnimalRecord[] = [];

  // 1. Vacas en Ordeño (20 representative records shown out of 280)
  const milkingBreeds = ['Holstein Friesian', 'Girolando 5/8', 'Jersey Pura', 'Gyr Lechero', 'Normando'];
  const lotsMilking = ['Potrero Látigo (Ordeño 1)', 'Potrero Naranjos (Ordeño 2)', 'Pueblo Viejo (Ordeño 3)'];
  
  for (let i = 1; i <= 20; i++) {
    const breed = milkingBreeds[i % milkingBreeds.length];
    const del = 30 + (i * 12) % 240;
    const milkL = parseFloat((18 + (i * 3.7) % 18).toFixed(1));
    const hasAlert = i === 3 || i === 11;

    list.push({
      id: `vaca-ordeno-${i}`,
      tag: `VACA-${100 + i}`,
      name: i % 2 === 0 ? ['Mariposa', 'Claraboya', 'Sinfonía', 'Princesa', 'Esmeralda', 'Dulcinea', 'Milagrosa', 'Lucero', 'Triana', 'Amapola'][i % 10] : `Lechera ${100 + i}`,
      category: 'vacas_ordeno',
      categoryLabel: 'Vacas en Ordeño',
      breed,
      ageMonths: 36 + (i * 4) % 48,
      weightKg: 520 + (i * 15) % 120,
      rfidChip: `982 000${184000 + i * 137}`,
      lotName: lotsMilking[i % lotsMilking.length],
      statusLabel: 'Producción Activa',
      dailyMilkLiters: milkL,
      lactationDays: del,
      healthAlert: hasAlert ? (i === 3 ? 'Tratamiento Antibiótico (Retención 48h)' : 'Control de Células Somáticas Elevado') : undefined,
    });
  }

  // 2. Vacas Secas / Horras (10 records out of 38)
  for (let i = 1; i <= 10; i++) {
    const gestDays = 210 + (i * 7) % 65;
    const daysToCalv = 280 - gestDays;
    const calvDate = new Date();
    calvDate.setDate(calvDate.getDate() + daysToCalv);

    list.push({
      id: `vaca-seca-${i}`,
      tag: `VACA-S${80 + i}`,
      name: ['Paloma', 'Gitana', 'Triana', 'Camelia', 'Monarca', 'Girasol', 'Catarina', 'Azucena', 'Serena', 'Coral'][i - 1],
      category: 'vacas_secas',
      categoryLabel: 'Vacas Secas / Horras',
      breed: milkingBreeds[(i + 2) % milkingBreeds.length],
      ageMonths: 48 + i * 5,
      weightKg: 580 + (i * 12) % 90,
      rfidChip: `985 000${294000 + i * 192}`,
      lotName: 'Potrero Descanso Secas',
      statusLabel: 'Periodo Seco / Gestación',
      gestationDays: gestDays,
      expectedCalvingDate: calvDate.toISOString().split('T')[0],
      healthAlert: i === 2 ? 'Sellado de ubres completo' : undefined,
    });
  }

  // 3. Toros Lecheros (4 records)
  const bullsInfo = [
    { tag: 'TORO-L01', name: 'Holstein Planet Kingpin', breed: 'Holstein PO', ptam: +1250, lot: 'Kiosco Toros Pedigree' },
    { tag: 'TORO-L02', name: 'Jersey Goldstar Impresivo', breed: 'Jersey Puro', ptam: +980, lot: 'Kiosco Toros Pedigree' },
    { tag: 'TORO-L03', name: 'Gyr Supremo de la Victoria', breed: 'Gyr Lechero Registro', ptam: +1420, lot: 'Potrero Toros Reproductores' },
    { tag: 'TORO-L04', name: 'Girolando Titán 5/8', breed: 'Girolando 5/8', ptam: +1110, lot: 'Potrero Toros Reproductores' },
  ];

  bullsInfo.forEach((b, idx) => {
    list.push({
      id: `toro-lechero-${idx + 1}`,
      tag: b.tag,
      name: b.name,
      category: 'toros_lecheros',
      categoryLabel: 'Toros Lecheros',
      breed: b.breed,
      ageMonths: 42 + idx * 6,
      weightKg: 820 + idx * 45,
      rfidChip: `982 000${910000 + idx * 88}`,
      lotName: b.lot,
      statusLabel: 'Reproductor Probado',
      milkProofPtam: b.ptam,
    });
  });

  // 4. Terneras & Crías (10 records out of 28)
  for (let i = 1; i <= 10; i++) {
    list.push({
      id: `ternera-${i}`,
      tag: `CRÍA-${200 + i}`,
      name: ['Nube', 'Copito', 'Brisa', 'Miel', 'Muñeca', 'Perla', 'Estrella', 'Flor', 'Canela', 'Chispa'][i - 1],
      category: 'terneras_crias',
      categoryLabel: 'Terneras & Crías',
      breed: milkingBreeds[i % milkingBreeds.length],
      ageMonths: 1 + i,
      weightKg: 42 + i * 8,
      rfidChip: `982 000${300000 + i * 411}`,
      lotName: 'Sala de Cuna & Tetero',
      statusLabel: 'Lactancia & Cuna',
      damTag: `VACA-${100 + (i % 15) + 1}`,
    });
  }

  // 5. Levante & Reemplazos (10 records out of 32)
  for (let i = 1; i <= 10; i++) {
    list.push({
      id: `levante-${i}`,
      tag: `VAQ-${300 + i}`,
      name: ['Esperanza', 'Diamante', 'Rubí', 'Gema', 'Zafiro', 'Victoria', 'Aura', 'Begoña', 'Dakota', 'Electra'][i - 1],
      category: 'levante_reemplazos',
      categoryLabel: 'Levante & Reemplazos',
      breed: milkingBreeds[(i + 1) % milkingBreeds.length],
      ageMonths: 14 + i,
      weightKg: 280 + i * 12,
      rfidChip: `985 000${400000 + i * 512}`,
      lotName: 'Potrero Vaquillas Reemplazo',
      statusLabel: i >= 5 ? 'Apta para Servicio IATF' : 'Desarrollo Corporal',
      damTag: `VACA-${105 + i}`,
    });
  }

  return list;
};

export const CategoryAnimalsModal: React.FC<CategoryAnimalsModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'todos',
  moduleTitle = 'Plantel Lechero Integral',
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<DairyCategoryKey>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilterOnly, setHealthFilterOnly] = useState(false);

  // Sync initialCategory when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveCategoryFilter(initialCategory);
      setSearchTerm('');
      setHealthFilterOnly(false);
    }
  }, [isOpen, initialCategory]);

  const allAnimals = useMemo(() => generateDairyAnimals(), []);

  const filteredAnimals = useMemo(() => {
    return allAnimals.filter((item) => {
      // Category Filter
      if (activeCategoryFilter !== 'todos' && item.category !== activeCategoryFilter) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTag = item.tag.toLowerCase().includes(term);
        const matchesName = item.name.toLowerCase().includes(term);
        const matchesBreed = item.breed.toLowerCase().includes(term);
        const matchesRfid = item.rfidChip ? item.rfidChip.toLowerCase().includes(term) : false;
        const matchesLot = item.lotName.toLowerCase().includes(term);
        if (!matchesTag && !matchesName && !matchesBreed && !matchesRfid && !matchesLot) {
          return false;
        }
      }

      // Health Alert Filter
      if (healthFilterOnly && !item.healthAlert) {
        return false;
      }

      return true;
    });
  }, [allAnimals, activeCategoryFilter, searchTerm, healthFilterOnly]);

  if (!isOpen) return null;

  const categoriesConfig: {
    key: DairyCategoryKey;
    label: string;
    countText: string;
    badgeColor: string;
  }[] = [
    { key: 'todos', label: 'Todos los Ejemplares', countText: '382 Cabezas', badgeColor: 'bg-[#012d1d] text-white' },
    { key: 'vacas_ordeno', label: 'Vacas en Ordeño', countText: '280 Cabezas', badgeColor: 'bg-emerald-700 text-white' },
    { key: 'vacas_secas', label: 'Vacas Secas / Horras', countText: '38 Cabezas', badgeColor: 'bg-[#79564b] text-white' },
    { key: 'toros_lecheros', label: 'Toros Lecheros', countText: '4 Cabezas', badgeColor: 'bg-[#523700] text-[#ffba38]' },
    { key: 'terneras_crias', label: 'Terneras & Crías', countText: '28 Cabezas', badgeColor: 'bg-[#0077b6] text-white' },
    { key: 'levante_reemplazos', label: 'Levante & Reemplazos', countText: '32 Cabezas', badgeColor: 'bg-[#4a148c] text-white' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#012d1d] rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#012d1d] text-white p-4 md:p-5 flex items-center justify-between border-b border-[#1b4332] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1b4332] text-[#ffba38] rounded-2xl border border-[#ffba38]/30">
              <MilkGlassIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#ffba38] text-[#012d1d] text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-md">
                  Inventario en Módulo
                </span>
                <span className="text-xs text-[#c1ecd4]/80 font-mono">382 Cabezas Totales</span>
              </div>
              <h2 className="text-lg md:text-xl font-black tracking-tight text-white uppercase font-mono mt-0.5">
                {moduleTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-[#1b4332] text-[#c1ecd4] hover:text-white hover:bg-rose-900 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills Switcher */}
        <div className="bg-[#f0f7f4] border-b border-[#c1ecd4] p-3 px-4 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          {categoriesConfig.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategoryFilter(cat.key)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeCategoryFilter === cat.key
                  ? 'bg-[#012d1d] text-[#ffba38] shadow-md scale-102 border border-[#ffba38]/40'
                  : 'bg-white hover:bg-[#e0efe6] text-[#012d1d] border border-[#c1ecd4]'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-extrabold ${cat.badgeColor}`}>
                {cat.countText}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Arete, Nombre, RFID o Raza..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#012d1d] shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setHealthFilterOnly(!healthFilterOnly)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                healthFilterOnly
                  ? 'bg-rose-100 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${healthFilterOnly ? 'text-rose-600' : 'text-gray-500'}`} />
              <span>Sólo con Alertas Médicas</span>
            </button>

            <span className="text-xs text-gray-500 font-mono font-bold bg-gray-200 px-3 py-1.5 rounded-2xl">
              {filteredAnimals.length} mostrados
            </span>
          </div>
        </div>

        {/* Modal Table Content */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {filteredAnimals.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-6">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No se encontraron animales con el filtro seleccionado.</p>
              <p className="text-xs text-gray-500 mt-1">Prueba cambiando el término de búsqueda o limpia los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-2xs bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#012d1d] text-[#c1ecd4] font-mono font-bold text-[11px] uppercase tracking-wider">
                    <th className="p-3">Ejemplar / Arete</th>
                    <th className="p-3">Categoría / Subgrupo</th>
                    <th className="p-3">Raza & Edad</th>
                    <th className="p-3">Chapeta RFID (EID)</th>
                    <th className="p-3">Métrica de Rendimiento</th>
                    <th className="p-3">Lote / Potrero</th>
                    <th className="p-3 text-center">Estado Sanitario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAnimals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-[#f4f9f6] transition-colors group">
                      {/* Arete / Tag */}
                      <td className="p-3 font-sans">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-[#eaf4ee] text-[#012d1d] font-mono font-black text-xs rounded-xl border border-[#c1ecd4]">
                            {animal.tag}
                          </div>
                          <div>
                            <span className="font-extrabold text-[#012d1d] block text-xs group-hover:text-[#2d6a4f] transition-colors">
                              {animal.name}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              Peso: {animal.weightKg} kg
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-black uppercase inline-block ${
                          animal.category === 'vacas_ordeno'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : animal.category === 'vacas_secas'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : animal.category === 'toros_lecheros'
                            ? 'bg-amber-50 text-amber-950 border border-amber-400 font-black'
                            : animal.category === 'terneras_crias'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-purple-100 text-purple-900 border border-purple-300'
                        }`}>
                          {animal.categoryLabel}
                        </span>
                      </td>

                      {/* Breed & Age */}
                      <td className="p-3">
                        <span className="font-bold text-gray-800 block text-xs">{animal.breed}</span>
                        <span className="text-[10.5px] text-gray-500 font-mono">
                          {Math.floor(animal.ageMonths / 12) > 0 ? `${Math.floor(animal.ageMonths / 12)}a ` : ''}
                          {animal.ageMonths % 12} meses
                        </span>
                      </td>

                      {/* RFID Chip */}
                      <td className="p-3 font-mono text-xs">
                        {animal.rfidChip ? (
                          <span className="text-[#2d6a4f] font-bold bg-[#eaf4ee] px-2 py-0.5 rounded-lg border border-[#c1ecd4] inline-flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-[#2d6a4f]" />
                            {animal.rfidChip}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Sin RFID</span>
                        )}
                      </td>

                      {/* Specific Metric */}
                      <td className="p-3">
                        {animal.category === 'vacas_ordeno' && (
                          <div>
                            <span className="font-black text-xs text-[#012d1d] font-mono block">
                              🥛 {animal.dailyMilkLiters} L / Día
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              DEL: {animal.lactationDays} días
                            </span>
                          </div>
                        )}

                        {animal.category === 'vacas_secas' && (
                          <div>
                            <span className="font-bold text-xs text-amber-900 font-mono block">
                              🤰 Gestación: {animal.gestationDays}d
                            </span>
                            <span className="text-[10px] text-amber-700 font-mono">
                              FPP: {animal.expectedCalvingDate}
                            </span>
                          </div>
                        )}

                        {animal.category === 'toros_lecheros' && (
                          <div>
                            <span className="font-bold text-xs text-amber-900 font-mono block">
                              🏆 Proba Leche: +{animal.milkProofPtam} kg
                            </span>
                            <span className="text-[10px] text-amber-700 font-mono">
                              Reproductor Evaluado
                            </span>
                          </div>
                        )}

                        {animal.category === 'terneras_crias' && (
                          <div>
                            <span className="font-bold text-xs text-blue-900 block">
                              🍼 Lactante en Cuna
                            </span>
                            <span className="text-[10px] text-blue-700 font-mono">
                              Madre: {animal.damTag}
                            </span>
                          </div>
                        )}

                        {animal.category === 'levante_reemplazos' && (
                          <div>
                            <span className="font-bold text-xs text-purple-900 block">
                              ✨ {animal.statusLabel}
                            </span>
                            <span className="text-[10px] text-purple-700 font-mono">
                              Madre: {animal.damTag}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Lot / Paddock */}
                      <td className="p-3 text-xs text-gray-700 font-medium">
                        {animal.lotName}
                      </td>

                      {/* Health Status */}
                      <td className="p-3 text-center">
                        {animal.healthAlert ? (
                          <span className="bg-rose-100 text-rose-900 text-[10px] font-extrabold px-2.5 py-1 rounded-xl border border-rose-300 inline-flex items-center gap-1 shadow-2xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{animal.healthAlert}</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sano / Normal</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 font-mono font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ffba38]" />
            <span>Mostrando {filteredAnimals.length} ejemplares registrados en esta categoría de la finca.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
