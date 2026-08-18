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
  LivestockMovementInput,
  LotCategory,
  RainfallRecord,
  DailyRainfallInput,
  InventoryItem,
  StockMovement,
  InventoryCategory,
  MovementType,
  CategoryInfo,
  AforoSampling,
  FinancialTransaction,
  ReproductiveEvent,
  BrandingIron,
  Employee,
  PayrollRun,
  PayrollAdvance,
  PendingDailyActivity,
  PendingActivityStatus,
  MastitisRecord,
  MastitisStatus,
  EquineAnimal,
  BubalineAnimal,
  AdminUser,
  LivestockSaleRecord,
} from './types';
import { INITIAL_MASTITIS_RECORDS } from './data/mockMastitisData';
import { INITIAL_PENDING_ACTIVITIES } from './data/mockPendingActivities';
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

import { Building2, CheckCircle2, Sparkles } from 'lucide-react';

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
import { PayrollView } from './components/PayrollView';
import { CalfRearingView } from './components/CalfRearingView';
import { SupplementationPlanView } from './components/SupplementationPlanView';
import { AnalyticsReportView } from './components/AnalyticsReportView';
import { HerdTraceabilityView } from './components/HerdTraceabilityView';
import { EquinesView } from './components/EquinesView';
import { BubalineView } from './components/BubalineView';
import { SalesManagementView } from './components/SalesManagementView';
import { AdminManagementView } from './components/AdminManagementView';
import { RightNotificationSidebar } from './components/RightNotificationSidebar';
import { AuthSessionModal } from './components/modals/AuthSessionModal';
import { INITIAL_ADMIN_USERS } from './data/mockAdminData';
import { INITIAL_EQUINES_MOCK } from './data/mockEquinesData';
import { INITIAL_BUBALINE_ANIMALS } from './data/mockBubalineData';
import { INITIAL_SALES_RECORDS } from './data/mockSalesData';
import { INITIAL_FINANCIAL_TRANSACTIONS } from './data/mockFinancialData';
import {
  INITIAL_EMPLOYEES,
  INITIAL_PAYROLL_RUNS,
  INITIAL_PAYROLL_ADVANCES,
} from './data/mockPayrollData';

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
import { RegisterSaleModal } from './components/modals/RegisterSaleModal';
import { RegisterTransactionModal } from './components/modals/RegisterTransactionModal';
import { RegisterBrandingIronModal } from './components/modals/RegisterBrandingIronModal';
import { PendingActivitiesReportModal } from './components/modals/PendingActivitiesReportModal';
import { RegisterMastitisModal } from './components/modals/RegisterMastitisModal';
import { RegisterPalpationModal, PalpationSavedPayload } from './components/modals/RegisterPalpationModal';
import { SanitaryPlanModal, SanitaryPlanSavedPayload } from './components/modals/SanitaryPlanModal';
import { ModuleManagerModal } from './components/modals/ModuleManagerModal';
import { ModuleUnlockPinModal } from './components/modals/ModuleUnlockPinModal';
import { SaleConfirmationNoticeModal, SaleConfirmationData } from './components/modals/SaleConfirmationNoticeModal';
import { WhatsAppIntegrationModal } from './components/modals/WhatsAppIntegrationModal';
import { useLivestockScale } from './hooks/useLivestockScale';
import { INITIAL_SANITARY_PROTOCOLS, INITIAL_SANITARY_APPLICATIONS } from './data/mockSanitaryData';
import { SanitaryProtocol, SanitaryApplicationRecord, WithdrawalAnimal } from './types';
import { generateAnimalsForLot } from './utils/lotAnimalUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [geneticsInitialSubTab, setGeneticsInitialSubTab] = useState<
    'kpis_ia' | 'insemination' | 'embryo_transfer' | 'donors_receptors' | 'bulls_semen' | 'events' | 'females' | 'pedigree' | 'progeny_testing'
  >('kpis_ia');
  const [menuInitialSubTab, setMenuInitialSubTab] = useState<'assistant' | 'sanitario' | 'settings'>('assistant');

  // Livestock Scale Hardware Hook
  const scaleHook = useLivestockScale();

  // User Authentication & Active Session State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_admin_users');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading admin users:', e);
    }
    return INITIAL_ADMIN_USERS;
  });

  const [activeUser, setActiveUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_active_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading active user session:', e);
    }
    return INITIAL_ADMIN_USERS[0];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync active user to local storage
  useEffect(() => {
    try {
      if (activeUser) {
        localStorage.setItem('ganaderia_active_user', JSON.stringify(activeUser));
      } else {
        localStorage.removeItem('ganaderia_active_user');
      }
    } catch (e) {
      console.error('Error saving active user session:', e);
    }
  }, [activeUser]);

  const handleLoginUser = (userToLogin: AdminUser, pinInput: string): boolean => {
    if (userToLogin.securityPin === pinInput) {
      const updatedUser = {
        ...userToLogin,
        lastLogin: new Date().toISOString(),
      };
      setActiveUser(updatedUser);
      showToast(`¡Sesión iniciada como ${updatedUser.fullName} (${updatedUser.customRoleTitle || updatedUser.roleType})!`);
      return true;
    }
    return false;
  };

  const handleLogoutUser = () => {
    setActiveUser(null);
    showToast('Ha cerrado la sesión del sistema.');
  };

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
  const [pendingFarmSwitch, setPendingFarmSwitch] = useState<string | null>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Synchronize farms to local storage
  useEffect(() => {
    saveFarmsToStorage(farms);
  }, [farms]);

  useEffect(() => {
    saveActiveFarmIdToStorage(selectedFarmId);
  }, [selectedFarmId]);

  // Equines, Mules & Donkeys inventory state
  const [equines, setEquines] = useState<EquineAnimal[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_equines_data');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading equines data:', e);
    }
    return INITIAL_EQUINES_MOCK;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_equines_data', JSON.stringify(equines));
    } catch (e) {
      console.error('Error saving equines data:', e);
    }
  }, [equines]);

  // Bubaline / Water Buffalo state
  const [bubalineAnimals, setBubalineAnimals] = useState<BubalineAnimal[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_bubaline_data');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading bubaline data:', e);
    }
    return INITIAL_BUBALINE_ANIMALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_bubaline_data', JSON.stringify(bubalineAnimals));
    } catch (e) {
      console.error('Error saving bubaline data:', e);
    }
  }, [bubalineAnimals]);

  // Current active farm package
  const currentFarm =
    farms.find((f) => f.profile.id === selectedFarmId) ||
    farms[0] ||
    INITIAL_FARMS_LIBRARY[0];

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Application Data States
  const [bullsList, setBullsList] = useState<PedigreeAnimal[]>(INITIAL_BULLS);
  const [currentBull, setCurrentBull] = useState<PedigreeAnimal>(INITIAL_BULLS[0]);
  const [reproductiveHistory, setReproductiveHistory] = useState(INITIAL_REPRODUCTIVE_HISTORY);
  const [lots, setLots] = useState<LotRecord[]>(INITIAL_LOTS);
  const [dairyData, setDairyData] = useState<DairyRecord>(INITIAL_DAIRY_DATA);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingCowEvent[]>(INITIAL_UPCOMING_COW_EVENTS);
  const [alerts] = useState(INITIAL_ALERTS);
  const [activities, setActivities] = useState<RecentActivity[]>(INITIAL_ACTIVITIES);

  // Sanitary Plan & Withdrawal Management State
  const [isSanitaryPlanModalOpen, setIsSanitaryPlanModalOpen] = useState(false);
  const [sanitaryPlanInitialTab, setSanitaryPlanInitialTab] = useState<'protocols' | 'apply' | 'withdrawals' | 'history'>('protocols');

  const [sanitaryProtocols, setSanitaryProtocols] = useState<SanitaryProtocol[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_sanitary_protocols');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading sanitary protocols from storage:', e);
    }
    return INITIAL_SANITARY_PROTOCOLS;
  });

  const [sanitaryApplications, setSanitaryApplications] = useState<SanitaryApplicationRecord[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_sanitary_applications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading sanitary applications from storage:', e);
    }
    return INITIAL_SANITARY_APPLICATIONS;
  });

  const [withdrawalAnimals, setWithdrawalAnimals] = useState<WithdrawalAnimal[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_withdrawal_animals');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading withdrawal animals from storage:', e);
    }
    return INITIAL_WITHDRAWAL_ANIMALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_sanitary_protocols', JSON.stringify(sanitaryProtocols));
    } catch (e) {
      console.warn('Error saving sanitary protocols:', e);
    }
  }, [sanitaryProtocols]);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_sanitary_applications', JSON.stringify(sanitaryApplications));
    } catch (e) {
      console.warn('Error saving sanitary applications:', e);
    }
  }, [sanitaryApplications]);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_withdrawal_animals', JSON.stringify(withdrawalAnimals));
    } catch (e) {
      console.warn('Error saving withdrawal animals:', e);
    }
  }, [withdrawalAnimals]);

  const openSanitaryPlanModal = (tab: 'protocols' | 'apply' | 'withdrawals' | 'history' = 'protocols') => {
    setSanitaryPlanInitialTab(tab);
    setIsSanitaryPlanModalOpen(true);
  };

  const handleSaveSanitaryPayload = (payload: SanitaryPlanSavedPayload) => {
    setSanitaryProtocols(payload.protocols);
    setSanitaryApplications(payload.applications);
    setWithdrawalAnimals(payload.withdrawalAnimals);

    if (payload.action === 'application_registered' && payload.newApplication) {
      const app = payload.newApplication;
      handleAddActivity(
        'Jornada Sanitaria',
        `${app.treatmentName} (${app.productName}) aplicada a ${app.targetLotOrGroup}`,
        `${app.headcount} Cabezas`,
        'health'
      );

      if (app.totalCost && app.totalCost > 0) {
        const activeFarmName = selectedFarmId === 'all'
          ? (farms[0]?.profile.name || 'Hacienda La Gloria')
          : (farms.find((f) => f.profile.id === selectedFarmId)?.profile.name || 'Hacienda La Gloria');

        const newTransaction: FinancialTransaction = {
          id: `fin-sanit-${Date.now()}`,
          farmId: selectedFarmId === 'all' ? (farms[0]?.profile.id || 'finca-1') : selectedFarmId,
          farmName: activeFarmName,
          date: app.date,
          type: 'egreso',
          costType: 'directo',
          category: 'veterinaria_vacunas',
          description: `Jornada Sanitaria: ${app.treatmentName} (${app.productName}) - ${app.headcount} dosis a ${app.targetLotOrGroup}`,
          amount: app.totalCost,
          headcount: app.headcount,
        };
        setFinancialTransactions((prev) => [newTransaction, ...prev]);
      }
      showToast(`✅ Jornada Sanitaria "${app.treatmentName}" registrada y sincronizada.`);
    } else if (payload.action === 'protocol_created' || payload.action === 'protocol_updated') {
      showToast('✅ Protocolo Sanitario guardado correctamente.');
    } else if (payload.action === 'protocol_deleted') {
      showToast('🗑️ Protocolo Sanitario eliminado.');
    } else if (payload.action === 'withdrawal_updated') {
      showToast('🔄 Control de Tiempos de Retiro actualizado.');
    }
  };

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

  // Payroll & Employee Management State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_employees');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse employees from localStorage:', e);
    }
    return INITIAL_EMPLOYEES;
  });

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_payroll_runs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse payroll runs from localStorage:', e);
    }
    return INITIAL_PAYROLL_RUNS;
  });

  const [payrollAdvances, setPayrollAdvances] = useState<PayrollAdvance[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_payroll_advances');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse payroll advances from localStorage:', e);
    }
    return INITIAL_PAYROLL_ADVANCES;
  });

  // Pending Daily Activities State
  const [isDairyEnabled, setIsDairyEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_dairy_enabled');
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not parse dairy_enabled from localStorage:', e);
    }
    return true; // Default enabled
  });

  // Lots Management State - Default FALSE (Predios por defecto)
  const [isLotsEnabled, setIsLotsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_lots_enabled');
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not parse lots_enabled from localStorage:', e);
    }
    return false; // Default: Manejo por PREDIOS (Lotes desactivados por defecto)
  });

  const [isUnlockPinModalOpen, setIsUnlockPinModalOpen] = useState(false);
  const [pendingEnableAction, setPendingEnableAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_dairy_enabled', JSON.stringify(isDairyEnabled));
    } catch (e) {
      console.warn('Error saving dairy_enabled:', e);
    }
  }, [isDairyEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_lots_enabled', JSON.stringify(isLotsEnabled));
    } catch (e) {
      console.warn('Error saving lots_enabled:', e);
    }
  }, [isLotsEnabled]);

  const handleToggleDairyModule = (enabled?: boolean, forceWithoutPin?: boolean) => {
    const nextVal = enabled !== undefined ? enabled : !isDairyEnabled;

    if (nextVal && !isDairyEnabled && !forceWithoutPin) {
      setPendingEnableAction(() => () => {
        setIsDairyEnabled(true);
        showToast('🔓 Módulo de Lechería activado con éxito.');
      });
      setIsUnlockPinModalOpen(true);
      return;
    }

    setIsDairyEnabled(nextVal);
    if (!nextVal && activeTab === 'dairy') {
      setActiveTab('home');
    }
  };

  const handleToggleLotsModule = (enabled?: boolean) => {
    const nextVal = enabled !== undefined ? enabled : !isLotsEnabled;
    setIsLotsEnabled(nextVal);
    if (nextVal) {
      showToast('🌾 Manejo por LOTES HABILITADO. Subdivisión y rotación de lotes activada.');
    } else {
      showToast('🏡 Manejo por PREDIOS activado por defecto.');
    }
  };

  const [pendingActivities, setPendingActivities] = useState<PendingDailyActivity[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_pending_activities');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse pending activities from localStorage:', e);
    }
    return INITIAL_PENDING_ACTIVITIES;
  });

  const [isPendingActivitiesModalOpen, setIsPendingActivitiesModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_pending_activities', JSON.stringify(pendingActivities));
    } catch (e) {
      console.warn('Error saving pending activities:', e);
    }
  }, [pendingActivities]);

  const handleAddPendingActivity = (activityInput: Omit<PendingDailyActivity, 'id' | 'createdAt'>) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newActivity: PendingDailyActivity = {
      ...activityInput,
      id: `pact-${uniqueSuffix}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPendingActivities((prev) => [newActivity, ...prev]);
  };

  const handleUpdatePendingActivityStatus = (
    id: string,
    status: PendingActivityStatus,
    completedBy?: string,
    completionNotes?: string,
  ) => {
    setPendingActivities((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          return {
            ...act,
            status,
            completedAt: status === 'completada' ? new Date().toISOString().split('T')[0] : undefined,
            completedBy: status === 'completada' ? completedBy : undefined,
            completionNotes: status === 'completada' ? completionNotes : undefined,
          };
        }
        return act;
      }),
    );
  };

  const handleDeletePendingActivity = (id: string) => {
    setPendingActivities((prev) => prev.filter((a) => a.id !== id));
  };

  // Mastitis Positive Test Records State
  const [mastitisRecords, setMastitisRecords] = useState<MastitisRecord[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_mastitis_records');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse mastitis records from localStorage:', e);
    }
    return INITIAL_MASTITIS_RECORDS;
  });

  const [isMastitisModalOpen, setIsMastitisModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_mastitis_records', JSON.stringify(mastitisRecords));
    } catch (e) {
      console.warn('Error saving mastitis records:', e);
    }
  }, [mastitisRecords]);

  const handleAddMastitisRecord = (newRecord: Omit<MastitisRecord, 'id'>) => {
    const recordWithId: MastitisRecord = {
      ...newRecord,
      id: `mast-${Date.now()}`,
    };
    setMastitisRecords((prev) => [recordWithId, ...prev]);
  };

  const handleUpdateMastitisStatus = (id: string, status: MastitisStatus, notes?: string) => {
    setMastitisRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              notes: notes ? `${item.notes ? item.notes + ' ' : ''}[Alta: ${notes}]` : item.notes,
            }
          : item
      )
    );
  };

  const handleDeleteMastitisRecord = (id: string) => {
    setMastitisRecords((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_employees', JSON.stringify(employees));
    } catch (e) {
      console.warn('Error saving employees:', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_payroll_runs', JSON.stringify(payrollRuns));
    } catch (e) {
      console.warn('Error saving payroll runs:', e);
    }
  }, [payrollRuns]);

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_payroll_advances', JSON.stringify(payrollAdvances));
    } catch (e) {
      console.warn('Error saving payroll advances:', e);
    }
  }, [payrollAdvances]);

  // Handlers for Payroll
  const handleAddEmployee = (emp: Employee) => setEmployees((prev) => [emp, ...prev]);
  const handleUpdateEmployee = (emp: Employee) =>
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));

  const handleAddPayrollRun = (run: PayrollRun) => setPayrollRuns((prev) => [run, ...prev]);
  const handleUpdatePayrollRun = (run: PayrollRun) =>
    setPayrollRuns((prev) => prev.map((r) => (r.id === run.id ? run : r)));

  const handleAddPayrollAdvance = (adv: PayrollAdvance) =>
    setPayrollAdvances((prev) => [adv, ...prev]);

  const handleAddFinancialTransactionFromPayroll = (tx: FinancialTransaction) => {
    setFinancialTransactions((prev) => [tx, ...prev]);
  };

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

  // Aforo, Finance & Module Manager Modal States
  const [isRegisterAforoModalOpen, setIsRegisterAforoModalOpen] = useState(false);
  const [isRegisterSaleModalOpen, setIsRegisterSaleModalOpen] = useState(false);
  const [isRegisterTransactionModalOpen, setIsRegisterTransactionModalOpen] = useState(false);
  const [isRegisterPalpationModalOpen, setIsRegisterPalpationModalOpen] = useState(false);
  const [isModuleManagerModalOpen, setIsModuleManagerModalOpen] = useState(false);
  const [isSaleConfirmationModalOpen, setIsSaleConfirmationModalOpen] = useState(false);
  const [saleConfirmationData, setSaleConfirmationData] = useState<SaleConfirmationData | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Sales Module State
  const [salesRecords, setSalesRecords] = useState<LivestockSaleRecord[]>(() => {
    try {
      const stored = localStorage.getItem('ganaderia_sales_records');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse sales records from localStorage:', e);
    }
    return INITIAL_SALES_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ganaderia_sales_records', JSON.stringify(salesRecords));
    } catch (e) {
      console.warn('Could not save sales records to localStorage:', e);
    }
  }, [salesRecords]);

  const handleSaveSale = (saleRecord: LivestockSaleRecord) => {
    // 1. Add to sales history
    setSalesRecords((prev) => [saleRecord, ...prev]);

    // 2. Adjust lot inventory and individual animals (baja animal por animal)
    const soldAnimalTags = new Set(saleRecord.animals.map((a) => a.tag));
    const soldAnimalIds = new Set(saleRecord.animals.map((a) => a.id));

    if (saleRecord.lotId) {
      setLots((prevLots) =>
        prevLots.map((lot) => {
          if (lot.id === saleRecord.lotId) {
            const farmName =
              farms.find((f) => f.profile.id === saleRecord.farmId)?.profile.name ||
              currentFarm.profile.name;

            // Get all current lot animals
            const currentAnimals = generateAnimalsForLot(lot, farmName);

            // Filter out or mark sold animals
            const remainingActiveAnimals = currentAnimals.filter(
              (a) => !soldAnimalTags.has(a.tag) && !soldAnimalIds.has(a.id) && a.status !== 'vendido'
            );

            const remainingHeads = Math.max(0, lot.heads - saleRecord.headsCount);

            // Recalculate average weight of remaining animals
            const newAvgWeight =
              remainingActiveAnimals.length > 0
                ? Math.round(
                    remainingActiveAnimals.reduce(
                      (acc, a) => acc + (a.weightKg || lot.currentAvgWeight),
                      0
                    ) / remainingActiveAnimals.length
                  )
                : 0;

            const tagsText = Array.from(soldAnimalTags).slice(0, 4).join(', ');
            const moreCount = soldAnimalTags.size > 4 ? ` (+${soldAnimalTags.size - 4})` : '';

            return {
              ...lot,
              heads: remainingHeads,
              currentAvgWeight: remainingHeads > 0 ? newAvgWeight : 0,
              animals: remainingActiveAnimals,
              notes: `${lot.notes || ''} | Venta ${saleRecord.saleCode}: ${saleRecord.headsCount} cabezas [${tagsText}${moreCount}] (${saleRecord.saleReasonLabel}) Guía ICA ${saleRecord.icaGuideNumber}`,
            };
          }
          return lot;
        })
      );
    }

    // 3. Register financial transaction (ingreso por venta de ganado)
    const activeFarmName =
      farms.find((f) => f.profile.id === saleRecord.farmId)?.profile.name ||
      currentFarm.profile.name;

    const tagsPreview = Array.from(soldAnimalTags).slice(0, 3).join(', ');
    const extraTags = soldAnimalTags.size > 3 ? ` (+${soldAnimalTags.size - 3})` : '';

    const newTransaction: FinancialTransaction = {
      id: `fin-sale-${Date.now()}`,
      farmId: saleRecord.farmId,
      farmName: activeFarmName,
      date: saleRecord.saleDate,
      type: 'ingreso',
      category: 'venta_ganado',
      description: `Venta Ganadera [${saleRecord.saleCode}]: ${saleRecord.headsCount} cabezas [${tagsPreview}${extraTags}] (${saleRecord.saleReasonLabel}) a ${saleRecord.buyerName} • Guía ICA: ${saleRecord.icaGuideNumber}`,
      amount: saleRecord.economicMetrics.netSaleIncome,
      headcount: saleRecord.headsCount,
    };
    setFinancialTransactions((prev) => [newTransaction, ...prev]);

    // 4. Log recent activity
    handleAddActivity(
      `Despacho & Venta: ${saleRecord.headsCount} Cab. (${saleRecord.saleReasonLabel})`,
      `Animales: ${tagsPreview}${extraTags} • Comprador: ${saleRecord.buyerName} • Guía ICA: ${saleRecord.icaGuideNumber} • Peso Neto: ${saleRecord.zootecnicMetrics.netWeightKg.toLocaleString('es-CO')} kg • Ingreso Neto: $${saleRecord.economicMetrics.netSaleIncome.toLocaleString('es-CO')} COP`,
      `-${saleRecord.headsCount} Cab. 💰`,
      'weigh'
    );

    // 5. Open Sale Confirmation Notice & Toast
    const tagsList = saleRecord.animals.map((a) => a.tag);
    setSaleConfirmationData({
      saleCode: saleRecord.saleCode,
      farmName: activeFarmName,
      headsCount: saleRecord.headsCount,
      animalTags: tagsList,
      buyerName: saleRecord.buyerName,
      buyerDoc: saleRecord.buyerDoc,
      destination: saleRecord.destinationLocation,
      totalAmount: saleRecord.economicMetrics.netSaleIncome,
      pricePerKg: saleRecord.pricePerKg,
      avgWeightKg: Math.round(saleRecord.zootecnicMetrics.grossWeightKg / (saleRecord.headsCount || 1)),
      totalWeightKg: saleRecord.zootecnicMetrics.netWeightKg,
      icaGuideNumber: saleRecord.icaGuideNumber,
      invoiceNumber: saleRecord.invoiceNumber,
      date: saleRecord.saleDate,
      lotName: saleRecord.lotName,
      category: saleRecord.saleReasonLabel,
    });
    setIsSaleConfirmationModalOpen(true);

    showToast(`✅ Venta formalizada: ${saleRecord.headsCount} animales dados de baja en inventario y registrados en contabilidad.`);
  };

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

  const handleSavePalpation = (payload: PalpationSavedPayload) => {
    const totalRecords = payload.records.length;
    const prenadas = payload.records.filter((r) => r.result === 'preñada').length;
    const vacias = payload.records.filter((r) => r.result.startsWith('vacia')).length;
    
    // Add reproductive event
    const newReproEvent: ReproductiveEvent = {
      id: `palp-${Date.now()}`,
      type: 'Palpación',
      date: payload.date,
      lotOrCow: payload.lotName || (payload.mode === 'individual' ? payload.records[0]?.tag : 'Jornada de Palpación'),
      details: `${totalRecords} hembras evaluadas por ${payload.veterinarian}: ${prenadas} Preñadas, ${vacias} Vacías.`,
      status: prenadas > 0 ? 'Preñez Confirmada' : 'Exitoso',
      iconType: 'heart',
    };
    setReproductiveHistory((prev) => [newReproEvent, ...prev]);

    // If costs specified, register financial transaction
    if (payload.costPerHead && payload.costPerHead > 0 && totalRecords > 0) {
      const totalCost = payload.costPerHead * totalRecords;
      const activeFarmName = selectedFarmId === 'all'
        ? (farms[0]?.profile.name || 'Hacienda La Gloria')
        : (farms.find((f) => f.profile.id === selectedFarmId)?.profile.name || 'Hacienda La Gloria');

      const newTransaction: FinancialTransaction = {
        id: `fin-palp-${Date.now()}`,
        farmId: selectedFarmId === 'all' ? (farms[0]?.profile.id || 'finca-1') : selectedFarmId,
        farmName: activeFarmName,
        date: payload.date,
        type: 'egreso',
        costType: 'directo',
        category: 'veterinaria_vacunas',
        description: `Jornada de Palpación y DG (${totalRecords} hembras a $${payload.costPerHead.toLocaleString()} c/u) - ${payload.veterinarian}`,
        amount: totalCost,
        headcount: totalRecords,
      };
      setFinancialTransactions((prev) => [newTransaction, ...prev]);
    }

    handleAddActivity(
      'Diagnóstico Reproductivo',
      `Jornada de Palpación / DG: ${totalRecords} hembras evaluadas (${prenadas} preñadas, ${vacias} vacías)`,
      `${prenadas}/${totalRecords} Preñadas`,
      'health'
    );

    showToast(`✅ Palpación guardada con éxito: ${totalRecords} hembras diagnosticadas (${prenadas} preñadas).`);
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
  const doSelectFarm = (farmId: string) => {
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
    setPendingFarmSwitch(null);
  };

  const handleSelectFarm = (farmId: string, skipConfirm = false) => {
    if (skipConfirm || !selectedFarmId || selectedFarmId === farmId) {
      doSelectFarm(farmId);
    } else {
      setPendingFarmSwitch(farmId);
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

  const handleToggleDisableFarm = (farmId: string) => {
    setFarms((prev) =>
      prev.map((f) => {
        if (f.profile.id === farmId) {
          const nextDisabled = !f.profile.isDisabled;
          return {
            ...f,
            profile: {
              ...f.profile,
              isDisabled: nextDisabled,
            },
          };
        }
        return f;
      }),
    );

    const target = farms.find((f) => f.profile.id === farmId);
    if (target) {
      const willBeDisabled = !target.profile.isDisabled;
      if (willBeDisabled) {
        showToast(`🔒 Finca "${target.profile.name}" deshabilitada. Toda su información, potreros e historial permanecen guardados.`);
        handleAddActivity(
          `Predio Deshabilitado: ${target.profile.name}`,
          `Información, potreros e historial resguardados 100% de forma segura.`,
          'Deshabilitado',
          'health',
        );
      } else {
        showToast(`✅ Finca "${target.profile.name}" habilitada nuevamente.`);
        handleAddActivity(
          `Predio Habilitado: ${target.profile.name}`,
          `Predio activado para gestión y registros operativos.`,
          'Habilitado',
          'birth',
        );
      }
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

  const handleSaveLivestockMovement = (movement: LivestockMovementInput) => {
    const movedHeads = movement.headsMoved || 1;
    const movedWeight = movement.totalWeightKg || (movedHeads * (movement.avgWeightKg || 400));
    
    if (movement.movementType === 'transferencia_interna') {
      // 1. Update source lot and target farm/lot
      setLots((prevLots) => {
        return prevLots.map((lot) => {
          if (lot.id === movement.lotId) {
            const remHeads = Math.max(0, lot.heads - movedHeads);
            return {
              ...lot,
              heads: remHeads,
              notes: `${lot.notes || ''} | Traslado ${movedHeads} cab a ${movement.targetFarmName || 'otro predio'} el ${movement.date}`,
            };
          }
          return lot;
        });
      });

      // If entire lot moved or new lot created on target farm
      if (movement.targetFarmId) {
        const destFarm = farms.find((f) => f.profile.id === movement.targetFarmId);
        const newDestLot: LotRecord = {
          id: `lot-transf-${Date.now()}`,
          code: `LOT-TRF-${Date.now().toString().slice(-4)}`,
          name: `${movement.lotName || 'Lote Trasladado'} (${movement.sourceFarmName || 'Origen'})`,
          category: (movement.category as LotCategory) || 'ceba',
          categoryLabel: movement.categoryLabel || 'TRASLADO INTERNO',
          heads: movedHeads,
          sexLabel: movement.sexLabel || 'Machos',
          ageRange: movement.ageRange || '20-28 Meses',
          gdpCurrent: 0.85,
          currentAvgWeight: movement.avgWeightKg || 420,
          targetWeight: (movement.avgWeightKg || 420) + 100,
          estDaysToExit: 90,
          pastureType: 'Brachiaria Brizantha',
          notes: `Trasladado desde ${movement.sourceFarmName || 'Predio Origen'} (Guía: ${movement.invoiceOrGuideNumber || 'S/N'}). Conductor: ${movement.transporterName || 'N/A'}.`,
          historyWeights: [{ date: 'Hoy (Traslado)', weight: movement.avgWeightKg || 420 }],
          farmId: movement.targetFarmId,
          farmName: destFarm?.profile.name,
        };

        setFarms((prevFarms) =>
          prevFarms.map((f) => {
            if (f.profile.id === movement.targetFarmId) {
              return {
                ...f,
                lots: [newDestLot, ...(f.lots || [])],
                headsCount: (f.headsCount || f.profile.headsCount || 0) + movedHeads,
              };
            }
            if (f.profile.id === movement.sourceFarmId) {
              return {
                ...f,
                headsCount: Math.max(0, (f.headsCount || f.profile.headsCount || 0) - movedHeads),
              };
            }
            return f;
          })
        );
      }

      handleAddActivity(
        `Transferencia Interna: ${movement.lotName || `${movedHeads} Cabezas`}`,
        `De ${movement.sourceFarmName || 'Origen'} ➔ ${movement.targetFarmName || 'Destino'} • ${movedHeads} Cab. (${movement.avgWeightKg || 420}kg prom.) • Guía: ${movement.invoiceOrGuideNumber || 'S/N'}`,
        `${movedHeads} Cab. 🔄`,
        'weigh'
      );
    } else if (movement.movementType === 'salida_venta') {
      // Deduct heads
      setLots((prevLots) =>
        prevLots.map((lot) => {
          if (lot.id === movement.lotId) {
            return {
              ...lot,
              heads: Math.max(0, lot.heads - movedHeads),
              notes: `${lot.notes || ''} | Venta de ${movedHeads} cab a ${movement.buyerOrDestination || 'Comprador'} ($${movement.salePriceTotal?.toLocaleString('es-CO')})`,
            };
          }
          return lot;
        })
      );

      // Financial transaction
      const newTransaction: FinancialTransaction = {
        id: `fin-sale-mov-${Date.now()}`,
        farmId: movement.sourceFarmId || selectedFarmId,
        farmName: movement.sourceFarmName || currentFarm.profile.name,
        date: movement.date || new Date().toLocaleDateString('es-CO'),
        type: 'ingreso',
        category: 'venta_ganado',
        description: `Venta Ganadera: ${movedHeads} cabezas (${movement.lotName || 'Lote'}) a ${movement.buyerOrDestination || 'Comprador'} • Guía ICA: ${movement.invoiceOrGuideNumber || 'S/N'}`,
        amount: movement.salePriceTotal || 0,
        headcount: movedHeads,
      };
      setFinancialTransactions((prev) => [newTransaction, ...prev]);

      handleAddActivity(
        `Venta Comercial: ${movement.lotName || `${movedHeads} Cabezas`}`,
        `${movedHeads} Cab. (${movedWeight.toLocaleString('es-CO')} kg) vendidas a ${movement.buyerOrDestination || 'Comprador'} • Total: $${movement.salePriceTotal?.toLocaleString('es-CO')} COP • Guía: ${movement.invoiceOrGuideNumber || 'S/N'}`,
        `-${movedHeads} Cab. 💰`,
        'weigh'
      );

      // Extract animal tags if present
      const tagsMatch = movement.notes?.match(/Aretes:\s*([^|]+)/i);
      const extractedTags = tagsMatch
        ? tagsMatch[1].split(/[\s,]+/).filter((t) => t.trim().length > 0)
        : [`#101-#${100 + movedHeads}`];

      setSaleConfirmationData({
        saleCode: `VTA-${Date.now().toString().slice(-4)}`,
        farmName: movement.sourceFarmName || currentFarm.profile.name,
        headsCount: movedHeads,
        animalTags: extractedTags,
        buyerName: movement.buyerOrDestination || 'Comprador Comercial',
        buyerDoc: movement.buyerDoc,
        destination: movement.commercialPurpose || 'Planta de Beneficio / Carne',
        totalAmount: movement.salePriceTotal || 0,
        pricePerKg: movement.salePricePerKg,
        avgWeightKg: movement.avgWeightKg,
        totalWeightKg: movedWeight,
        icaGuideNumber: movement.invoiceOrGuideNumber,
        invoiceNumber: movement.invoiceOrGuideNumber,
        date: movement.date || new Date().toLocaleDateString('es-CO'),
        lotName: movement.lotName,
        category: movement.categoryLabel,
        brandingIron: movement.brandingIron,
        paddockName: movement.sourcePaddockName,
      });
      setIsSaleConfirmationModalOpen(true);

      showToast(`✅ Venta formalizada: ${movedHeads} cabezas dadas de baja en inventario y registradas en contabilidad.`);
    } else if (movement.movementType === 'salida_muerte' || movement.movementType === 'salida_sacrificio') {
      setLots((prevLots) =>
        prevLots.map((lot) => {
          if (lot.id === movement.lotId) {
            return {
              ...lot,
              heads: Math.max(0, lot.heads - movedHeads),
              notes: `${lot.notes || ''} | Baja (${movement.movementType}) de ${movedHeads} cab por ${movement.causeOrReason || 'enfermedad'}`,
            };
          }
          return lot;
        })
      );
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
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newAct: RecentActivity = {
      id: `act-${uniqueSuffix}`,
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
        isDairyEnabled={isDairyEnabled}
        onToggleDairyModule={handleToggleDairyModule}
        isLotsEnabled={isLotsEnabled}
        onToggleLotsModule={handleToggleLotsModule}
        onOpenModuleManagerModal={() => setIsModuleManagerModalOpen(true)}
        activeUser={activeUser}
        onLogoutUser={handleLogoutUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main App Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Application Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadAlertsCount={alerts.length}
          onOpenWithdrawalModal={() => setIsWithdrawalModalOpen(true)}
          onOpenNewEventModal={handleOpenNewEventModal}
          scaleName={scaleHook.activeScale?.name}
          scaleWeight={scaleHook.reading?.weight}
          onOpenScaleModal={() => setIsScaleModalOpen(true)}
          farms={farms}
          currentFarmId={selectedFarmId}
          onSelectFarm={handleSelectFarm}
          onOpenCreateFarmModal={() => setIsCreateFarmModalOpen(true)}
          onOpenFarmManagerModal={() => setIsFarmManagerModalOpen(true)}
          onOpenPendingActivitiesModal={() => setIsPendingActivitiesModalOpen(true)}
          pendingActivitiesCount={pendingActivities.filter((a) => a.status === 'pendiente' || a.status === 'vencida').length}
          onOpenMastitisModal={() => setIsMastitisModalOpen(true)}
          activeMastitisCount={mastitisRecords.filter((r) => r.status !== 'curado').length}
          isDairyEnabled={isDairyEnabled}
          onToggleDairyModule={handleToggleDairyModule}
          isLotsEnabled={isLotsEnabled}
          onToggleLotsModule={handleToggleLotsModule}
          activeUser={activeUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogoutUser={handleLogoutUser}
          onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
        />

      {/* Main Content & Right Lateral Panel Workspace */}
      <div className="flex-1 flex min-w-0">
        <main className="flex-1 px-3 sm:px-4 md:px-5 lg:px-6 py-4 md:py-6 w-full pb-24 md:pb-10 min-w-0">
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
            onOpenPendingActivitiesModal={() => setIsPendingActivitiesModalOpen(true)}
            pendingActivitiesCount={pendingActivities.filter((a) => a.status === 'pendiente' || a.status === 'vencida').length}
            isDairyEnabled={isDairyEnabled}
            onToggleDairyModule={handleToggleDairyModule}
            isLotsEnabled={isLotsEnabled}
            onToggleLotsModule={handleToggleLotsModule}
            onOpenPalpationModal={() => setIsRegisterPalpationModalOpen(true)}
            onOpenSanitaryPlanModal={(tab) => openSanitaryPlanModal(tab || 'protocols')}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
          />
        )}

        {activeTab === 'cattle' && (
          <CattleView
            lots={lots}
            farms={farms}
            currentFarm={currentFarm}
            selectedFarmId={selectedFarmId}
            onSelectFarm={handleSelectFarm}
            onOpenWeightModal={(lotId) => {
              setSelectedLotForWeight(lotId);
              setIsWeightModalOpen(true);
            }}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenScaleModal={() => setIsScaleModalOpen(true)}
            onOpenNewLotModal={() => setIsNewEventModalOpen(true)}
            activeScale={scaleHook.activeScale}
            reading={scaleHook.reading}
            isDairyEnabled={isDairyEnabled}
            onToggleDairyModule={handleToggleDairyModule}
            isLotsEnabled={isLotsEnabled}
            onToggleLotsModule={handleToggleLotsModule}
          />
        )}

        {activeTab === 'dairy' && (
          <DairyView
            dairyData={dairyData}
            upcomingEvents={upcomingEvents}
            onOpenMilkingModal={() => setIsMilkingModalOpen(true)}
            onCompleteEvent={handleCompleteCowEvent}
            onOpenMastitisModal={() => setIsMastitisModalOpen(true)}
            activeMastitisCount={mastitisRecords.filter((r) => r.status !== 'curado').length}
            isDairyEnabled={isDairyEnabled}
            onToggleDairyModule={handleToggleDairyModule}
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
            onOpenPalpationModal={() => setIsRegisterPalpationModalOpen(true)}
            initialSubTab={geneticsInitialSubTab}
          />
        )}

        {activeTab === 'equines' && (
          <EquinesView
            equines={equines}
            onUpdateEquines={setEquines}
            farms={farms}
            currentFarmId={selectedFarmId}
          />
        )}

        {activeTab === 'buffalo' && (
          <BubalineView
            bubalineAnimals={bubalineAnimals}
            onUpdateBubalineAnimals={setBubalineAnimals}
            farms={farms}
            currentFarmId={selectedFarmId}
            onAddActivity={handleAddActivity}
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

        {activeTab === 'sales' && (
          <SalesManagementView
            farms={farms}
            currentFarmId={selectedFarmId}
            onSelectFarm={handleSelectFarm}
            lots={lots}
            salesRecords={salesRecords}
            onOpenRegisterSaleModal={() => setIsRegisterSaleModalOpen(true)}
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

        {activeTab === 'payroll' && (
          <PayrollView
            currentFarm={currentFarm}
            farms={farms}
            employees={employees}
            payrollRuns={payrollRuns}
            payrollAdvances={payrollAdvances}
            financialTransactions={financialTransactions}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onAddPayrollRun={handleAddPayrollRun}
            onUpdatePayrollRun={handleUpdatePayrollRun}
            onAddPayrollAdvance={handleAddPayrollAdvance}
            onAddFinancialTransaction={handleAddFinancialTransactionFromPayroll}
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

        {activeTab === 'calf_rearing' && <CalfRearingView />}

        {activeTab === 'supplementation' && <SupplementationPlanView />}

        {activeTab === 'herd_traceability' && (
          <HerdTraceabilityView
            isDairyEnabled={isDairyEnabled}
            onToggleDairyModule={handleToggleDairyModule}
          />
        )}

        {activeTab === 'analytics_report' && (
          <AnalyticsReportView
            currentFarm={currentFarm}
            farms={farms}
            dairyData={dairyData}
            financialTransactions={financialTransactions}
            rainfallRecords={rainfallRecords}
            lots={lots}
            inventoryItems={inventoryItems}
            employees={employees}
          />
        )}

        {activeTab === 'admin' && (
          <AdminManagementView
            currentFarm={currentFarm}
            farms={farms}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            withdrawalAnimals={withdrawalAnimals}
            sanitaryProtocols={sanitaryProtocols}
            sanitaryApplications={sanitaryApplications}
            alerts={alerts}
            onOpenWithdrawalModal={() => openSanitaryPlanModal('withdrawals')}
            onOpenSanitaryPlanModal={(tab) => openSanitaryPlanModal(tab || 'protocols')}
            onNavigateGis={() => setActiveTab('gis')}
            currentFarm={currentFarm}
            farms={farms}
            onSelectFarm={handleSelectFarm}
            onOpenCreateFarmModal={() => setIsCreateFarmModalOpen(true)}
            onOpenFarmManagerModal={() => setIsFarmManagerModalOpen(true)}
            onOpenPendingActivitiesModal={() => setIsPendingActivitiesModalOpen(true)}
            pendingActivitiesCount={pendingActivities.filter((a) => a.status === 'pendiente' || a.status === 'vencida').length}
            onOpenMastitisModal={() => setIsMastitisModalOpen(true)}
            activeMastitisCount={mastitisRecords.filter((r) => r.status !== 'curado').length}
            initialSubTab={menuInitialSubTab}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
          />
        )}
      </main>

      {/* Dedicated Right Lateral Sidebar for Notices & Notifications */}
      <RightNotificationSidebar
        isOpen={isRightSidebarOpen}
        onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        onNavigateToTab={setActiveTab}
        onOpenWithdrawalModal={() => setIsWithdrawalModalOpen(true)}
        onOpenNewEventModal={handleOpenNewEventModal}
        onOpenPendingActivitiesModal={() => setIsPendingActivitiesModalOpen(true)}
        pendingActivitiesCount={pendingActivities.filter((a) => a.status === 'pendiente' || a.status === 'vencida').length}
        activeMastitisCount={mastitisRecords.filter((r) => r.status !== 'curado').length}
        onOpenMastitisModal={() => setIsMastitisModalOpen(true)}
        onOpenWeightModal={() => setIsWeightModalOpen(true)}
        onOpenScaleModal={() => setIsScaleModalOpen(true)}
        onOpenMilkingModal={() => setIsMilkingModalOpen(true)}
        onOpenRegisterPalpationModal={() => setIsRegisterPalpationModalOpen(true)}
        onOpenRegisterRainfallModal={() => setIsRegisterRainfallModalOpen(true)}
        onOpenRegisterStockEntryModal={() => setIsRegisterStockEntryModalOpen(true)}
        onOpenSaleModal={() => setIsRegisterSaleModalOpen(true)}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
        currentFarmName={currentFarm.profile.name}
        alerts={alerts}
        activities={activities}
        pendingActivities={pendingActivities}
      />
    </div>

      {/* Reporte de Actividades Diarias Pendientes Modal */}
      <PendingActivitiesReportModal
        isOpen={isPendingActivitiesModalOpen}
        onClose={() => setIsPendingActivitiesModalOpen(false)}
        activities={pendingActivities}
        onAddActivity={handleAddPendingActivity}
        onUpdateActivityStatus={handleUpdatePendingActivityStatus}
        onDeleteActivity={handleDeletePendingActivity}
        onNavigateToTab={setActiveTab}
      />

      {/* Registro de Pruebas Positivas de Mastitis Modal */}
      <RegisterMastitisModal
        isOpen={isMastitisModalOpen}
        onClose={() => setIsMastitisModalOpen(false)}
        records={mastitisRecords}
        onAddRecord={handleAddMastitisRecord}
        onUpdateStatus={handleUpdateMastitisStatus}
        onDeleteRecord={handleDeleteMastitisRecord}
      />

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
        onToggleDisableFarm={handleToggleDisableFarm}
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
        mastitisRecords={mastitisRecords}
        withdrawalAnimals={withdrawalAnimals}
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
        lots={lots}
        onSelectFarm={handleSelectFarm}
        onAddActivity={handleAddActivity}
        onRegisterAuctionLot={handleRegisterAuctionLot}
        onRegisterLivestockMovement={handleSaveLivestockMovement}
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

      <RegisterSaleModal
        isOpen={isRegisterSaleModalOpen}
        onClose={() => setIsRegisterSaleModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        lots={lots}
        liveScaleWeight={scaleHook.reading.weight}
        scaleName={scaleHook.activeScale?.name}
        onOpenScaleModal={() => setIsScaleModalOpen(true)}
        onSaveSale={handleSaveSale}
        isLotsEnabled={isLotsEnabled}
      />

      <RegisterTransactionModal
        isOpen={isRegisterTransactionModalOpen}
        onClose={() => setIsRegisterTransactionModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        onSaveTransaction={handleSaveFinancialTransaction}
      />

      <RegisterPalpationModal
        isOpen={isRegisterPalpationModalOpen}
        onClose={() => setIsRegisterPalpationModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        lots={lots}
        onSavePalpation={handleSavePalpation}
      />

      {/* Módulo Integral de Plan Sanitario, Vacunación e Inocuidad BPG */}
      <SanitaryPlanModal
        isOpen={isSanitaryPlanModalOpen}
        onClose={() => setIsSanitaryPlanModalOpen(false)}
        farms={farms}
        currentFarmId={selectedFarmId}
        lots={lots}
        protocols={sanitaryProtocols}
        applications={sanitaryApplications}
        withdrawalAnimals={withdrawalAnimals}
        onSaveData={handleSaveSanitaryPayload}
        initialTab={sanitaryPlanInitialTab}
      />

      {/* Gestor de Módulos Modal */}
      <ModuleManagerModal
        isOpen={isModuleManagerModalOpen}
        onClose={() => setIsModuleManagerModalOpen(false)}
        isDairyEnabled={isDairyEnabled}
        onToggleDairyModule={handleToggleDairyModule}
        isLotsEnabled={isLotsEnabled}
        onToggleLotsModule={handleToggleLotsModule}
        setActiveTab={setActiveTab}
      />

      {/* Security Code / PIN Authorization Modal */}
      <ModuleUnlockPinModal
        isOpen={isUnlockPinModalOpen}
        onClose={() => {
          setIsUnlockPinModalOpen(false);
          setPendingEnableAction(null);
        }}
        onUnlockSuccess={() => {
          if (pendingEnableAction) {
            pendingEnableAction();
            setPendingEnableAction(null);
          } else {
            setIsDairyEnabled(true);
            showToast('🔓 Módulo de Lechería activado correctamente con clave.');
          }
        }}
      />

      {/* User Session & Login Authentication Modal */}
      <AuthSessionModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={adminUsers}
        activeUser={activeUser}
        onLoginUser={handleLoginUser}
        onLogoutUser={handleLogoutUser}
        onNavigateToAdmin={() => setActiveTab('admin')}
      />

      {/* Sale Confirmation Notice Modal (Aviso de Confirmación de Venta) */}
      <SaleConfirmationNoticeModal
        isOpen={isSaleConfirmationModalOpen}
        onClose={() => {
          setIsSaleConfirmationModalOpen(false);
          setSaleConfirmationData(null);
        }}
        data={saleConfirmationData}
        onNavigateToSales={() => setActiveTab('sales')}
      />

      {/* Asistente Virtual en WhatsApp & Webhook Modal */}
      <WhatsAppIntegrationModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        currentFarm={currentFarm}
        onAddRecentActivity={handleAddActivity}
      />

      {/* Toast Floating Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[120] bg-[#012d1d] text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-[#ffba38] text-xs font-bold font-mono animate-in fade-in slide-in-from-bottom-5 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#ffba38] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Confirmation Modal for Farm Switch */}
      {pendingFarmSwitch && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95" onClick={(e) => { if (e.target === e.currentTarget) setPendingFarmSwitch(null); }}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-[#012d1d] shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#c1ecd4]/50 flex items-center justify-center border border-[#012d1d]/20 shrink-0">
                <Building2 className="w-6 h-6 text-[#012d1d]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#012d1d]">¿Confirmar Cambio de Predio?</h3>
                <p className="text-xs text-[#717973] font-medium mt-0.5">
                  Estás a punto de cambiar el predio activo en el sistema.
                </p>
              </div>
            </div>

            <div className="bg-[#f8faf8] p-3.5 rounded-2xl border border-[#c1c8c2] text-xs space-y-2">
              <div className="flex items-center justify-between text-[#717973]">
                <span>Predio Actual:</span>
                <span className="font-bold text-[#012d1d]">{currentFarm?.profile?.name || 'Todos los Predios'}</span>
              </div>
              <div className="flex items-center justify-between text-[#012d1d] pt-1.5 border-t border-[#e2e8f0]">
                <span className="font-semibold">Nuevo Predio:</span>
                <span className="font-extrabold text-[#012d1d] underline">
                  {pendingFarmSwitch === 'all'
                    ? 'Consolidado General (Todos los Predios)'
                    : farms.find((f) => f.profile.id === pendingFarmSwitch)?.profile?.name || 'Predio Seleccionado'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeeeee]">
              <button
                type="button"
                onClick={() => setPendingFarmSwitch(null)}
                className="px-4 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => doSelectFarm(pendingFarmSwitch)}
                className="px-4 py-2.5 bg-[#012d1d] hover:bg-[#02442d] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-[#ffba38]" />
                <span>Sí, Cambiar de Predio</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

