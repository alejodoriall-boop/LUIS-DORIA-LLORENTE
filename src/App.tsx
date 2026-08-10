import React, { useState, useEffect } from 'react';
import {
  MainTab,
  PedigreeAnimal,
  LotRecord,
  DairyRecord,
  UpcomingCowEvent,
  RecentActivity,
  FarmDataPackage,
  CreateFarmInput,
  FarmGeoProfile,
  NewLotRegistrationInput,
  RainfallRecord,
  DailyRainfallInput,
  InventoryItem,
  StockMovement,
  InventoryCategory,
  MovementType,
  CategoryInfo,
  AforoSampling,
  FinancialTransaction,
  BrandingIron,
} from './types';
import { INITIAL_BRANDING_IRONS } from './data/mockBrandingIrons';
import {
  INITIAL_BULLS,
  INITIAL_REPRODUCTIVE_HISTORY,
  INITIAL_LOTS,
  INITIAL_DAIRY_DATA,
  INITIAL_UPCOMING_COW_EVENTS,
  INITIAL_ALERTS,
  INITIAL_ACTIVITIES,
  INITIAL_WITHDRAWAL_ANIMALS,
} from './data/mockData';
import { INITIAL_FARMS_LIBRARY, generateFarmPackage } from './data/mockMultiFarmData';
import {
  INITIAL_RAINFALL_RECORDS,
  getAugmentedRainfallRecords,
} from './data/mockRainfallData';
import {
  INITIAL_INVENTORY_ITEMS,
  INITIAL_STOCK_MOVEMENTS,
  INVENTORY_CATEGORIES_INFO,
} from './data/mockInventoryData';
import { INITIAL_AFORO_SAMPLINGS } from './data/mockAforoData';
import {
  loadFarmsFromStorage,
  saveFarmsToStorage,
  loadActiveFarmIdFromStorage,
  saveActiveFarmIdToStorage,
  resetFarmsToDefaults,
} from './utils/farmStorage';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { CattleView } from './components/CattleView';
import { DairyView } from './components/DairyView';
import { GeneticsView } from './components/GeneticsView';
import { MenuView } from './components/MenuView';
import { FarmGisView } from './components/gis/FarmGisView';
import { RainfallView } from './components/RainfallView';
import { InventoryView } from './components/InventoryView';
import { AforoView } from './components/AforoView';
import { FinanceView } from './components/FinanceView';
import { INITIAL_FINANCIAL_TRANSACTIONS } from './data/mockFinancialData';

import { RegisterWeightModal } from './components/modals/RegisterWeightModal';
import { RegisterMilkingModal } from './components/modals/RegisterMilkingModal';
import { PedigreeCertificateModal } from './components/modals/PedigreeCertificateModal';
import { EditAnimalModal } from './components/modals/EditAnimalModal';
import { BreedingSimulatorModal } from './components/modals/BreedingSimulatorModal';
import { WithdrawalModal } from './components/modals/WithdrawalModal';
import { ReportModal } from './components/modals/ReportModal';
import { NewEventModal, RegistrationEventType } from './components/modals/NewEventModal';
import { ScaleSyncModal } from './components/modals/ScaleSyncModal';
import { CreateFarmModal } from './components/modals/CreateFarmModal';
import { EditFarmModal } from './components/modals/EditFarmModal';
import { FarmManagerModal } from './components/modals/FarmManagerModal';
import { RegisterRainfallModal } from './components/modals/RegisterRainfallModal';
import { RegisterStockEntryModal } from './components/modals/RegisterStockEntryModal';
import { RegisterStockConsumptionModal } from './components/modals/RegisterStockConsumptionModal';
import { CreateCategoryModal } from './components/modals/CreateCategoryModal';
import { RegisterAforoModal } from './components/modals/RegisterAforoModal';
import { RegisterTransactionModal } from './components/modals/RegisterTransactionModal';
import { RegisterBrandingIronModal } from './components/modals/RegisterBrandingIronModal';
import { useLivestockScale } from './hooks/useLivestockScale';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');

  // Livestock Scale Hardware Hook
  const scaleHook = useLivestockScale();

  // Multi-Farm Management State with Local Storage Persistence
  const [farms, setFarms] = useState<FarmDataPackage[]>(() => loadFarmsFromStorage());
  const [selectedFarmId, setSelectedFarmId] = useState<string>(() =>
    loadActiveFarmIdFromStorage('farm-1'),
  );

  // Modals for Multi-Farm
  const [isCreateFarmModalOpen, setIsCreateFarmModalOpen] = useState(false);
  const [isEditFarmModalOpen, setIsEditFarmModalOpen] = useState(false);
  const [editingFarmTargetId, setEditingFarmTargetId] = useState<string | null>(null);
  const [isFarmManagerModalOpen, setIsFarmManagerModalOpen] = useState(false);

  // Synchronize farms to local storage
  useEffect(() => {
    saveFarmsToStorage(farms);
  }, [farms]);

  useEffect(() => {
    saveActiveFarmIdToStorage(selectedFarmId);
  }, [selectedFarmId]);

  // Current active farm package
  const currentFarm =
    farms.find((f) => f.profile.id === selectedFarmId) ||
    farms[0] ||
    INITIAL_FARMS_LIBRARY[0];

  // Application Data States
  const [bullsList, setBullsList] = useState<PedigreeAnimal[]>(INITIAL_BULLS);
  const [currentBull, setCurrentBull] = useState<PedigreeAnimal>(INITIAL_BULLS[0]);
  const [reproductiveHistory, setReproductiveHistory] = useState(INITIAL_REPRODUCTIVE_HISTORY);
  const [lots, setLots] = useState<LotRecord[]>(INITIAL_LOTS);
  const [dairyData, setDairyData] = useState<DairyRecord>(INITIAL_DAIRY_DATA);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingCowEvent[]>(INITIAL_UPCOMING_COW_EVENTS);
  const [alerts] = useState(INITIAL_ALERTS);
  const [activities, setActivities] = useState<RecentActivity[]>(INITIAL_ACTIVITIES);
  const [withdrawalAnimals] = useState(INITIAL_WITHDRAWAL_ANIMALS);

  // Pluviometry / Rainfall State
  const [rainfallRecords, setRainfallRecords] = useState<RainfallRecord[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_rainfall_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return getAugmentedRainfallRecords(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not parse rainfall local storage:', e);
    }
    return getAugmentedRainfallRecords(INITIAL_RAINFALL_RECORDS);
  });

  // Inventory / Warehouse State
  const [categories, setCategories] = useState<Record<string, CategoryInfo>>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_inventory_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse categories from localStorage:', e);
    }
    return INVENTORY_CATEGORIES_INFO;
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_inventory_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse inventory items from localStorage:', e);
    }
    return INITIAL_INVENTORY_ITEMS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_stock_movements');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse stock movements from localStorage:', e);
    }
    return INITIAL_STOCK_MOVEMENTS;
  });

  const [aforoSamplings, setAforoSamplings] = useState<AforoSampling[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_aforo_samplings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse aforo samplings from localStorage:', e);
    }
    return INITIAL_AFORO_SAMPLINGS;
  });

  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_financial_transactions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse financial transactions from localStorage:', e);
    }
    return INITIAL_FINANCIAL_TRANSACTIONS;
  });

  // Branding Irons / Marcas State
  const [brandingIrons, setBrandingIrons] = useState<BrandingIron[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_branding_irons');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse branding irons from localStorage:', e);
    }
    return INITIAL_BRANDING_IRONS;
  });

  const [isRegisterBrandingIronModalOpen, setIsRegisterBrandingIronModalOpen] = useState(false);
  const [editingBrandingIronTarget, setEditingBrandingIronTarget] = useState<BrandingIron | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_branding_irons', JSON.stringify(brandingIrons));
    } catch (e) {
      console.error(e);
    }
  }, [brandingIrons]);

  const handleSaveBrandingIron = (iron: BrandingIron) => {
    setBrandingIrons((prev) => {
      const exists = prev.some((i) => i.id === iron.id);
      if (exists) {
        return prev.map((i) => (i.id === iron.id ? iron : i));
      }
      return [iron, ...prev];
    });
  };

  const handleDeleteBrandingIron = (id: string) => {
    setBrandingIrons((prev) => prev.filter((i) => i.id !== id));
  };

  // Modal Open/Close States
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [selectedLotForWeight, setSelectedLotForWeight] = useState<string | undefined>(undefined);
  const [isMilkingModalOpen, setIsMilkingModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isEditAnimalModalOpen, setIsEditAnimalModalOpen] = useState(false);
  const [isBreedingSimulatorOpen, setIsBreedingSimulatorOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventInitialType, setNewEventInitialType] = useState<RegistrationEventType>('compra');

  const handleOpenNewEventModal = (type: RegistrationEventType = 'compra') => {
    setNewEventInitialType(type);
    setIsNewEventModalOpen(true);
  };
  const [isRegisterRainfallModalOpen, setIsRegisterRainfallModalOpen] = useState(false);

  // Inventory Modals & Selected Item State
  const [isRegisterStockEntryModalOpen, setIsRegisterStockEntryModalOpen] = useState(false);
  const [isRegisterStockConsumptionModalOpen, setIsRegisterStockConsumptionModalOpen] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [defaultConsumptionItemId, setDefaultConsumptionItemId] = useState<string | undefined>(undefined);

  // Aforo & Finance Modal States
  const [isRegisterAforoModalOpen, setIsRegisterAforoModalOpen] = useState(false);
  const [isRegisterTransactionModalOpen, setIsRegisterTransactionModalOpen] = useState(false);

  // Sync inventory categories, items & movements to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_inventory_categories', JSON.stringify(categories));
    } catch (e) {
      console.warn('Could not save categories to localStorage:', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_inventory_items', JSON.stringify(inventoryItems));
    } catch (e) {
      console.warn('Could not save inventory items to localStorage:', e);
    }
  }, [inventoryItems]);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_stock_movements', JSON.stringify(stockMovements));
    } catch (e) {
      console.warn('Could not save stock movements to localStorage:', e);
    }
  }, [stockMovements]);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_aforo_samplings', JSON.stringify(aforoSamplings));
    } catch (e) {
      console.warn('Could not save aforo samplings to localStorage:', e);
    }
  }, [aforoSamplings]);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_financial_transactions', JSON.stringify(financialTransactions));
    } catch (e) {
      console.warn('Could not save financial transactions to localStorage:', e);
    }
  }, [financialTransactions]);

  const handleSaveFinancialTransaction = (newTx: FinancialTransaction) => {
    setFinancialTransactions((prev) => [newTx, ...prev]);
    handleAddActivity(
      'Movimiento Financiero',
      `${newTx.type === 'ingreso' ? 'Ingreso' : 'Egreso'}: ${newTx.description}`,
      `$${newTx.amount.toLocaleString('es-CO')} COP`,
      'health'
    );
  };

  const handleDeleteFinancialTransaction = (id: string) => {
    setFinancialTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveAforo = (newAforo: AforoSampling) => {
    setAforoSamplings((prev) => [newAforo, ...prev]);
    handleAddActivity(
      'Aforo de Pastos',
      `Nuevo aforo registrado en ${newAforo.paddockName}: ${newAforo.totalGreenYieldTonHa} Ton/Ha`,
      `${newAforo.totalGreenYieldTonHa} Ton/Ha`,
      'health'
    );
  };

  const handleDeleteAforo = (id: string) => {
    setAforoSamplings((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveCategory = (newCat: CategoryInfo) => {
    setCategories((prev) => ({
      ...prev,
      [newCat.id]: newCat,
    }));
    handleAddActivity(
      'Almacén - Nueva Categoría',
      `Creada categoría: ${newCat.label}`,
      '+1 Categoría',
      'health',
    );
  };

  // Handler for stock reception / entry (Manual or Invoice OCR)
  const handleSaveStockEntry = (
    itemData: {
      farmId: string;
      name: string;
      category: InventoryCategory;
      brand?: string;
      unit: string;
      quantity: number;
      unitCostEstimate?: number;
      minStockAlert: number;
      locationInStore?: string;
      batchNumber?: string;
      expirationDate?: string;
      supplierName?: string;
      notes?: string;
      invoiceNumber?: string;
    },
    existingItemId?: string,
  ) => {
    const farmObj = farms.find((f) => f.profile.id === itemData.farmId) || currentFarm;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let finalItemId = existingItemId;
    let newStockAfter = itemData.quantity;

    if (existingItemId) {
      // Update existing product stock
      setInventoryItems((prev) =>
        prev.map((i) => {
          if (i.id === existingItemId) {
            newStockAfter = i.currentStock + itemData.quantity;
            return {
              ...i,
              currentStock: newStockAfter,
              unitCostEstimate: itemData.unitCostEstimate || i.unitCostEstimate,
              batchNumber: itemData.batchNumber || i.batchNumber,
              expirationDate: itemData.expirationDate || i.expirationDate,
              lastRestockDate: dateStr,
            };
          }
          return i;
        }),
      );
    } else {
      // Create new product
      finalItemId = 'inv-' + Date.now();
      const newItem: InventoryItem = {
        id: finalItemId,
        farmId: itemData.farmId,
        farmName: farmObj.profile.name,
        name: itemData.name,
        category: itemData.category,
        brand: itemData.brand,
        unit: itemData.unit,
        currentStock: itemData.quantity,
        minStockAlert: itemData.minStockAlert,
        unitCostEstimate: itemData.unitCostEstimate,
        locationInStore: itemData.locationInStore,
        batchNumber: itemData.batchNumber,
        expirationDate: itemData.expirationDate,
        supplierName: itemData.supplierName,
        lastRestockDate: dateStr,
        notes: itemData.notes,
      };
      setInventoryItems((prev) => [newItem, ...prev]);
    }

    // Record movement in audit log
    const newMovement: StockMovement = {
      id: 'mov-' + Date.now(),
      itemId: finalItemId || 'inv-item',
      itemName: itemData.name,
      farmId: itemData.farmId,
      farmName: farmObj.profile.name,
      type: 'entrada',
      quantity: itemData.quantity,
      unit: itemData.unit,
      stockAfter: newStockAfter,
      date: dateStr,
      time: timeStr,
      registeredBy: 'Mayordomo / Recepción',
      reasonOrDestination: itemData.invoiceNumber
        ? `Ingreso Factura/Remisión #${itemData.invoiceNumber}`
        : 'Recepción de Almacén en Finca',
      invoiceNumber: itemData.invoiceNumber,
      notes: itemData.notes,
    };

    setStockMovements((prev) => [newMovement, ...prev]);

    handleAddActivity(
      `Recepción de Almacén - ${farmObj.profile.name}`,
      `+${itemData.quantity} ${itemData.unit} de ${itemData.name}`,
      `+${itemData.quantity}`,
      'health',
    );
  };

  // Handler for stock usage / consumption
  const handleSaveStockConsumption = (movementData: {
    itemId: string;
    quantity: number;
    type: MovementType;
    reasonOrDestination: string;
    registeredBy: string;
    notes?: string;
  }) => {
    const targetItem = inventoryItems.find((i) => i.id === movementData.itemId);
    if (!targetItem) return;

    const farmObj = farms.find((f) => f.profile.id === targetItem.farmId) || currentFarm;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newStockAfter = Math.max(0, targetItem.currentStock - movementData.quantity);

    // Update item stock
    setInventoryItems((prev) =>
      prev.map((i) => {
        if (i.id === targetItem.id) {
          return {
            ...i,
            currentStock: newStockAfter,
          };
        }
        return i;
      }),
    );

    // Record movement log
    const newMovement: StockMovement = {
      id: 'mov-' + Date.now(),
      itemId: targetItem.id,
      itemName: targetItem.name,
      farmId: targetItem.farmId,
      farmName: farmObj.profile.name,
      type: movementData.type,
      quantity: movementData.quantity,
      unit: targetItem.unit,
      stockAfter: newStockAfter,
      date: dateStr,
      time: timeStr,
      registeredBy: movementData.registeredBy,
      reasonOrDestination: movementData.reasonOrDestination,
      notes: movementData.notes,
    };

    setStockMovements((prev) => [newMovement, ...prev]);

    handleAddActivity(
      `Consumo de Insumo - ${farmObj.profile.name}`,
      `-${movementData.quantity} ${targetItem.unit} de ${targetItem.name}`,
      `-${movementData.quantity}`,
      'health',
    );
  };

  // Sync rainfall records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_rainfall_data', JSON.stringify(rainfallRecords));
    } catch (e) {
      console.warn('Could not save rainfall data to localStorage:', e);
    }
  }, [rainfallRecords]);

  const handleSaveRainfall = (input: DailyRainfallInput) => {
    const farmObj = farms.find((f) => f.profile.id === input.farmId) || currentFarm;
    const newRecord: RainfallRecord = {
      id: 'rain-' + Date.now(),
      farmId: input.farmId,
      farmName: farmObj.profile.name,
      date: input.date,
      amountMm: input.amountMm,
      durationMinutes: input.durationMinutes,
      intensity: input.intensity,
      recordedBy: input.recordedBy,
      notes: input.notes,
      timestamp: new Date().toISOString(),
    };

    setRainfallRecords((prev) => [newRecord, ...prev]);

    handleAddActivity(
      `Lluvia Registrada - ${farmObj.profile.name}`,
      `${input.amountMm} mm (${input.intensity || 'moderada'}) • ${input.date}`,
      `${input.amountMm} mm`,
      'health',
    );
  };

  // Computed Values
  const totalHeads =
    lots.reduce((acc, curr) => acc + curr.heads, 0) +
    (currentFarm?.headsCount || currentFarm?.profile.headsCount || 840);
  const avgGdp = lots.length > 0 ? lots.reduce((acc, curr) => acc + curr.gdpCurrent, 0) / lots.length : 0.85;

  // Farm Action Handlers
  const handleSelectFarm = (farmId: string) => {
    setSelectedFarmId(farmId);
    const targetFarm = farms.find((f) => f.profile.id === farmId);
    if (targetFarm) {
      if (targetFarm.lots && targetFarm.lots.length > 0) {
        setLots(targetFarm.lots);
      }
      handleAddActivity(
        `Predio Seleccionado: ${targetFarm.profile.name}`,
        `${targetFarm.profile.municipality}, ${targetFarm.profile.department} • ${targetFarm.profile.totalAreaHa} Ha`,
        `${targetFarm.headsCount || targetFarm.profile.headsCount || 0} Cab.`,
        'weigh',
      );
    }
  };

  const handleCreateFarm = (input: CreateFarmInput) => {
    const newPkg = generateFarmPackage(input);
    setFarms((prev) => [newPkg, ...prev]);
    setSelectedFarmId(newPkg.profile.id);
    if (newPkg.lots && newPkg.lots.length > 0) {
      setLots(newPkg.lots);
    }
    handleAddActivity(
      `Nuevo Predio Registrado: ${newPkg.profile.name}`,
      `${newPkg.profile.municipality} • ${newPkg.profile.totalAreaHa} Ha • ${newPkg.paddocks.length} potreros`,
      'Creada',
      'birth',
    );
    // Switch to GIS tab to see new farm map immediately
    setActiveTab('gis');
  };

  const handleUpdateFarmProfile = (updatedProfile: FarmGeoProfile) => {
    setFarms((prev) =>
      prev.map((f) => (f.profile.id === updatedProfile.id ? { ...f, profile: updatedProfile } : f)),
    );
    handleAddActivity(
      `Datos Actualizados: ${updatedProfile.name}`,
      `Área: ${updatedProfile.totalAreaHa} Ha • ICA: ${updatedProfile.registrationNumber}`,
      'Editada',
      'genetics',
    );
  };

  const handleUpdateFarmGis = (farmId: string, updatedData: Partial<FarmDataPackage>) => {
    setFarms((prev) =>
      prev.map((f) => (f.profile.id === farmId ? { ...f, ...updatedData } : f)),
    );
  };

  const handleDeleteFarm = (farmId: string) => {
    if (farms.length <= 1) return;
    const farmToDelete = farms.find((f) => f.profile.id === farmId);
    const remaining = farms.filter((f) => f.profile.id !== farmId);
    setFarms(remaining);
    if (selectedFarmId === farmId) {
      setSelectedFarmId(remaining[0].profile.id);
    }
    if (farmToDelete) {
      handleAddActivity(
        `Predio Eliminado: ${farmToDelete.profile.name}`,
        `${farmToDelete.profile.municipality}, ${farmToDelete.profile.department}`,
        'Eliminado',
        'health',
      );
    }
  };

  const handleDuplicateFarm = (farmId: string) => {
    const source = farms.find((f) => f.profile.id === farmId);
    if (!source) return;

    const newId = `farm-${Date.now()}`;
    const duplicated: FarmDataPackage = {
      ...source,
      profile: {
        ...source.profile,
        id: newId,
        name: `${source.profile.name} (Copia)`,
        registrationNumber: `ICA-${Math.floor(10000 + Math.random() * 90000)}-${new Date().getFullYear()}`,
        lastUpdated: new Date().toLocaleDateString('es-CO'),
      },
      paddocks: source.paddocks.map((p, idx) => ({
        ...p,
        id: `pot-${Date.now()}-${idx}`,
      })),
    };

    setFarms((prev) => [duplicated, ...prev]);
    setSelectedFarmId(newId);
    handleAddActivity(
      `Predio Duplicado: ${duplicated.profile.name}`,
      `Clonado de ${source.profile.name}`,
      'Duplicado',
      'birth',
    );
  };

  const handleResetFarms = () => {
    const defaults = resetFarmsToDefaults();
    setFarms(defaults);
    setSelectedFarmId(defaults[0].profile.id);
  };

  const openEditFarmModal = (farmId?: string) => {
    setEditingFarmTargetId(farmId || selectedFarmId);
    setIsEditFarmModalOpen(true);
  };

  // Handlers for Cattle & Production
  const handleSaveWeight = (lotId: string, newAvgWeight: number, date: string) => {
    setLots((prev) =>
      prev.map((lot) => {
        if (lot.id === lotId) {
          const updatedGdp = Number((lot.gdpCurrent + 0.05).toFixed(2));
          return {
            ...lot,
            currentAvgWeight: newAvgWeight,
            gdpCurrent: updatedGdp,
            historyWeights: [
              ...lot.historyWeights,
              { date: 'Hoy', weight: newAvgWeight },
            ],
          };
        }
        return lot;
      }),
    );

    const targetLot = lots.find((l) => l.id === lotId);
    handleAddActivity(
      `Pesaje ${targetLot?.name || 'Lote'}`,
      `${targetLot?.heads || 45} animales pesados • ${date}`,
      `Prom: ${newAvgWeight} kg`,
      'weigh',
    );
  };

  const handleRegisterAuctionLot = (lotInput: NewLotRegistrationInput) => {
    const newLotId = `lote-${Date.now()}`;
    const newLot: LotRecord = {
      id: newLotId,
      code: `LOT-${lotInput.invoiceNumber ? lotInput.invoiceNumber.replace(/[^A-Za-z0-9]/g, '').slice(-6) : Date.now().toString().slice(-4)}`,
      name: lotInput.lotName,
      category: lotInput.category,
      categoryLabel: lotInput.categoryLabel || 'CEBA / SUBASTA',
      heads: lotInput.heads,
      sexLabel: lotInput.sexLabel || 'Machos de Ceba',
      ageRange: lotInput.ageRange || '18-24 Meses',
      gdpCurrent: 0.85,
      currentAvgWeight: lotInput.currentAvgWeight,
      targetWeight: lotInput.targetWeight || Math.round(lotInput.currentAvgWeight + 120),
      estDaysToExit: 90,
      pastureType: lotInput.pastureType || 'Brachiaria Brizantha',
      notes: lotInput.notes || `Comprado en ${lotInput.sourceEntity} (Fact: ${lotInput.invoiceNumber}).`,
      historyWeights: [
        { date: 'Hoy (Ingreso)', weight: lotInput.currentAvgWeight },
      ],
    };

    // Update farms library: add new lot to destination farm, increase heads, and assign paddock if selected
    setFarms((prevFarms) =>
      prevFarms.map((f) => {
        if (f.profile.id === lotInput.farmId) {
          const updatedLots = [newLot, ...(f.lots || [])];
          const newTotalHeads = (f.headsCount || f.profile.headsCount || 0) + lotInput.heads;

          let updatedPaddocks = f.paddocks;
          if (lotInput.paddockId) {
            updatedPaddocks = f.paddocks.map((p) => {
              if (p.id === lotInput.paddockId) {
                return {
                  ...p,
                  status: 'ocupado' as const,
                  assignedLotId: newLot.id,
                  assignedLotName: newLot.name,
                  currentHeads: lotInput.heads,
                  currentLotCategory: lotInput.category,
                  daysInOccupancy: 0,
                  entryDate: new Date().toLocaleDateString('es-CO'),
                };
              }
              return p;
            });
          }

          return {
            ...f,
            lots: updatedLots,
            headsCount: newTotalHeads,
            profile: {
              ...f.profile,
              headsCount: newTotalHeads,
              lastUpdated: new Date().toLocaleDateString('es-CO'),
            },
            paddocks: updatedPaddocks,
          };
        }
        return f;
      }),
    );

    // If destination farm is currently the active selected farm, update the active state variables too
    if (selectedFarmId === lotInput.farmId) {
      setLots((prev) => [newLot, ...prev]);
    } else {
      // Auto-switch to destination farm so the user immediately sees the newly loaded inventory!
      handleSelectFarm(lotInput.farmId);
    }
  };

  const handleSaveMilking = (morning: number, evening: number, fat: number, protein: number) => {
    const total = morning + evening;
    setDairyData((prev) => ({
      ...prev,
      morningLiters: morning,
      eveningLiters: evening,
      totalLiters: total,
      fatPct: fat,
      proteinPct: protein,
    }));

    handleAddActivity(
      'Control Ordeño Registrado',
      `Mañana: ${morning}L • Tarde: ${evening}L • Grasa: ${fat}%`,
      `${total.toLocaleString()} L`,
      'dairy',
    );
  };

  const handleUpdateBull = (updatedBull: PedigreeAnimal) => {
    setCurrentBull(updatedBull);
    setBullsList((prev) =>
      prev.map((b) => (b.id === updatedBull.id ? updatedBull : b)),
    );
    handleAddActivity(
      `Actualización Ficha Toro ${updatedBull.name}`,
      `ID: ${updatedBull.code} • Peso: ${updatedBull.weight}kg`,
      'Registro Editado',
      'genetics',
    );
  };

  const handleCompleteCowEvent = (eventId: string) => {
    const evt = upcomingEvents.find((e) => e.id === eventId);
    if (evt) {
      setUpcomingEvents((prev) => prev.filter((e) => e.id !== eventId));
      handleAddActivity(
        `${evt.eventType} Registrado - ${evt.cowName}`,
        `Arete: ${evt.tagId} • ${evt.batch}`,
        'Completado',
        evt.eventType === 'Parto' ? 'birth' : 'dairy',
      );
    }
  };

  const handleAddActivity = (
    title: string,
    subtitle: string,
    metric: string,
    category: 'birth' | 'weigh' | 'dairy' | 'health' | 'genetics',
  ) => {
    const newAct: RecentActivity = {
      id: 'act-' + Date.now(),
      title,
      subtitle,
      weightOrMetric: metric,
      category,
      timestamp: 'Justo ahora',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const editingFarmTarget =
    farms.find((f) => f.profile.id === editingFarmTargetId)?.profile || currentFarm.profile;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col md:flex-row font-sans antialiased selection:bg-[#c1ecd4] selection:text-[#002114]">
      {/* Left Vertical Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertsCount={alerts.length}
      />

      {/* Main App Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Application Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadAlertsCount={alerts.length}
          onOpenWithdrawalModal={() => setIsWithdrawalModalOpen(true)}
          scaleName={scaleHook.activeScale?.name}
          scaleWeight={scaleHook.reading?.weight}
          onOpenScaleModal={() => setIsScaleModalOpen(true)}
          farms={farms}
          currentFarmId={selectedFarmId}
          onSelectFarm={handleSelectFarm}
          onOpenCreateFarmModal={() => setIsCreateFarmModalOpen(true)}
          onOpenFarmManagerModal={() => setIsFarmManagerModalOpen(true)}
        />

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-10 py-5 md:py-8 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            alerts={alerts}
            activities={activities}
            totalHeads={totalHeads}
            avgGdp={avgGdp}
            todayMilkLiters={dairyData.morningLiters + dairyData.eveningLiters}
            onOpenWithdrawalModal={() => setIsWithdrawalModalOpen(true)}
            onOpenNewEventModal={handleOpenNewEventModal}
            onOpenWeightModal={() => {
              setSelectedLotForWeight(undefined);
              setIsWeightModalOpen(true);
            }}
            onOpenMilkingModal={() => setIsMilkingModalOpen(true)}
            currentFarm={currentFarm}
            farms={farms}
            selectedFarmId={selectedFarmId}
            onSelectFarm={handleSelectFarm}
            onOpenCreateFarmModal={() => setIsCreateFarmModalOpen(true)}
            onOpenFarmManagerModal={() => setIsFarmManagerModalOpen(true)}
            onOpenEditFarmModal={(farmId) => openEditFarmModal(farmId)}
            brandingIrons={brandingIrons}
            onOpenRegisterBrandingIronModal={() => {
              setEditingBrandingIronTarget(null);
              setIsRegisterBrandingIronModalOpen(true);
            }}
            onDeleteBrandingIron={handleDeleteBrandingIron}
            onEditBrandingIron={(iron) => {
              setEditingBrandingIronTarget(iron);
              setIsRegisterBrandingIronModalOpen(true);
            }}
          />
        )}

        {activeTab === 'cattle' && (
          <CattleView
            lots={lots}
            onOpenWeightModal={(lotId) => {
              setSelectedLotForWeight(lotId);
              setIsWeightModalOpen(true);
            }}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenScaleModal={() => setIsScaleModalOpen(true)}
            onOpenNewLotModal={() => setIsNewEventModalOpen(true)}
            activeScale={scaleHook.activeScale}
            reading={scaleHook.reading}
          />
        )}

        {activeTab === 'dairy' && (
          <DairyView
            dairyData={dairyData}
            upcomingEvents={upcomingEvents}
            onOpenMilkingModal={() => setIsMilkingModalOpen(true)}
            onCompleteEvent={handleCompleteCowEvent}
          />
        )}

        {activeTab === 'genetics' && (
          <GeneticsView
            currentBull={currentBull}
            bullsList={bullsList}
            onSelectBull={(b) => setCurrentBull(b)}
            reproductiveHistory={reproductiveHistory}
            onOpenEditModal={() => setIsEditAnimalModalOpen(true)}
            onOpenCertificateModal={() => setIsCertificateModalOpen(true)}
            onOpenBreedingSimulator={() => setIsBreedingSimulatorOpen(true)}
            onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
          />
        )}

        {activeTab === 'gis' && (
          <FarmGisView
            lots={lots}
            currentFarm={currentFarm}
            farms={farms}
            onSelectFarm={handleSelectFarm}
            onOpenCreateFarmModal={() => setIsCreateFarmModalOpen(true)}
            onOpenEditFarmModal={(farmId) => openEditFarmModal(farmId)}
            onOpenFarmManagerModal={() => setIsFarmManagerModalOpen(true)}
            onUpdateFarmGis={handleUpdateFarmGis}
          />
        )}

        {activeTab === 'rainfall' && (
          <RainfallView
            farms={farms}
            currentFarm={currentFarm}
            selectedFarmId={selectedFarmId}
            onSelectFarm={handleSelectFarm}
            rainfallRecords={rainfallRecords}
            onOpenRegisterModal={() => setIsRegisterRainfallModalOpen(true)}
          />
        )}

        {activeTab === 'aforo' && (
          <AforoView
            farms={farms}
            selectedFarmId={selectedFarmId}
            onSelectFarm={handleSelectFarm}
            aforoSamplings={aforoSamplings}
            onOpenRegisterAforoModal={() => setIsRegisterAforoModalOpen(true)}
            onDeleteAforo={handleDeleteAforo}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            farms={farms}
            selectedFarmId={selectedFarmId}
            onSelectFarm={handleSelectFarm}
            transactions={financialTransactions}
            onOpenRegisterTransactionModal={() => setIsRegisterTransactionModalOpen(true)}
            onDeleteTransaction={handleDeleteFinancialTransaction}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            farms={farms}
            currentFarm={currentFarm}
            selectedFarmId={selectedFarmId}
            onSelectFarm={handleSelectFarm}
            inventoryItems={inventoryItems}
            stockMovements={stockMovements}
            categories={categories}
            onOpenEntryModal={() => setIsRegisterStockEntryModalOpen(true)}
            onOpenConsumptionModal={(defaultItemId) => {
              setDefaultConsumptionItemId(defaultItemId);
              setIsRegisterStockConsumptionModalOpen(true);
            }}
            onOpenCreateCategoryModal={() => setIsCreateCategoryModalOpen(true)}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            withdrawalAnimals={withdrawalAnimals}
            alerts={alerts}
            onOpenWithdrawalModal={() => setIsWithdrawalModalOpen(true)}
            onNavigateGis={() => setActiveTab('gis')}
            currentFarm={currentFarm}
            farms={farms}
            onSelectFarm={handleSelectFarm}
            onOpenCreateFarmModal={() => setIsCreateFarmModalOpen(true)}
            onOpenFarmManagerModal={() => setIsFarmManagerModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={alerts.length}
      />

      {/* Multi-Farm Management Modals */}
      <CreateFarmModal
        isOpen={isCreateFarmModalOpen}
        onClose={() => setIsCreateFarmModalOpen(false)}
        onCreateFarm={handleCreateFarm}
      />

      <EditFarmModal
        isOpen={isEditFarmModalOpen}
        onClose={() => {
          setIsEditFarmModalOpen(false);
          setEditingFarmTargetId(null);
        }}
        farm={editingFarmTarget}
        onSave={handleUpdateFarmProfile}
      />

      <FarmManagerModal
        isOpen={isFarmManagerModalOpen}
        onClose={() => setIsFarmManagerModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        onSelectFarm={handleSelectFarm}
        onOpenCreateFarm={() => setIsCreateFarmModalOpen(true)}
        onOpenEditFarm={(farmId) => openEditFarmModal(farmId)}
        onDeleteFarm={handleDeleteFarm}
        onDuplicateFarm={handleDuplicateFarm}
        onResetFarms={handleResetFarms}
        onNavigateGis={() => setActiveTab('gis')}
      />

      {/* Interactive Livestock Modals */}
      <RegisterWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        lots={lots}
        initialLotId={selectedLotForWeight}
        onSaveWeight={handleSaveWeight}
        scaleHook={scaleHook}
        onOpenScaleModal={() => setIsScaleModalOpen(true)}
      />

      <ScaleSyncModal
        scaleHook={scaleHook}
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        onSelectWeightToForm={(weight) => {
          setIsScaleModalOpen(false);
          setIsWeightModalOpen(true);
        }}
      />

      <RegisterMilkingModal
        isOpen={isMilkingModalOpen}
        onClose={() => setIsMilkingModalOpen(false)}
        currentData={dairyData}
        onSaveMilking={handleSaveMilking}
      />

      <PedigreeCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        bull={currentBull}
      />

      <EditAnimalModal
        isOpen={isEditAnimalModalOpen}
        onClose={() => setIsEditAnimalModalOpen(false)}
        bull={currentBull}
        onSave={handleUpdateBull}
      />

      <BreedingSimulatorModal
        isOpen={isBreedingSimulatorOpen}
        onClose={() => setIsBreedingSimulatorOpen(false)}
        bull={currentBull}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        animals={withdrawalAnimals}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        lots={lots}
      />

      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        animals={withdrawalAnimals}
        brandingIrons={brandingIrons}
        onSelectFarm={handleSelectFarm}
        onAddActivity={handleAddActivity}
        onRegisterAuctionLot={handleRegisterAuctionLot}
        liveScaleWeight={scaleHook.reading.weight}
        scaleName={scaleHook.activeScale?.name}
        onOpenScaleModal={() => setIsScaleModalOpen(true)}
        initialEventType={newEventInitialType}
      />

      <RegisterBrandingIronModal
        isOpen={isRegisterBrandingIronModalOpen}
        onClose={() => {
          setIsRegisterBrandingIronModalOpen(false);
          setEditingBrandingIronTarget(null);
        }}
        initialIron={editingBrandingIronTarget}
        farms={farms}
        onSave={handleSaveBrandingIron}
      />

      <RegisterRainfallModal
        isOpen={isRegisterRainfallModalOpen}
        onClose={() => setIsRegisterRainfallModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        onSaveRainfall={handleSaveRainfall}
      />

      <RegisterStockEntryModal
        isOpen={isRegisterStockEntryModalOpen}
        onClose={() => setIsRegisterStockEntryModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        existingItems={inventoryItems}
        categories={categories}
        onOpenCreateCategoryModal={() => setIsCreateCategoryModalOpen(true)}
        onSaveEntry={handleSaveStockEntry}
      />

      <RegisterStockConsumptionModal
        isOpen={isRegisterStockConsumptionModalOpen}
        onClose={() => setIsRegisterStockConsumptionModalOpen(false)}
        items={inventoryItems.filter((i) => selectedFarmId === 'all' || i.farmId === selectedFarmId)}
        defaultItemId={defaultConsumptionItemId}
        onSaveConsumption={handleSaveStockConsumption}
      />

      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        onSaveCategory={handleSaveCategory}
      />

      <RegisterAforoModal
        isOpen={isRegisterAforoModalOpen}
        onClose={() => setIsRegisterAforoModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        onSaveAforo={handleSaveAforo}
      />

      <RegisterTransactionModal
        isOpen={isRegisterTransactionModalOpen}
        onClose={() => setIsRegisterTransactionModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        onSaveTransaction={handleSaveFinancialTransaction}
      />
      </div>
    </div>
  );
}

