import { FarmDataPackage } from '../types';
import { INITIAL_FARMS_LIBRARY } from '../data/mockMultiFarmData';

const STORAGE_KEY_FARMS = 'ganaderia_farms_v2';
const STORAGE_KEY_ACTIVE_FARM = 'ganaderia_active_farm_id_v2';

export function loadFarmsFromStorage(): FarmDataPackage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FARMS);
    if (!raw) return INITIAL_FARMS_LIBRARY;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Error loading farms from localStorage:', err);
  }
  return INITIAL_FARMS_LIBRARY;
}

export function saveFarmsToStorage(farms: FarmDataPackage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(farms));
  } catch (err) {
    console.error('Error saving farms to localStorage:', err);
  }
}

export function loadActiveFarmIdFromStorage(fallbackId: string): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_FARM);
    if (raw) return raw;
  } catch (err) {
    console.error('Error loading active farm ID from localStorage:', err);
  }
  return fallbackId;
}

export function saveActiveFarmIdToStorage(farmId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_FARM, farmId);
  } catch (err) {
    console.error('Error saving active farm ID to localStorage:', err);
  }
}

export function resetFarmsToDefaults(): FarmDataPackage[] {
  try {
    localStorage.removeItem(STORAGE_KEY_FARMS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_FARM);
  } catch (err) {
    console.error('Error resetting farms storage:', err);
  }
  return INITIAL_FARMS_LIBRARY;
}
