import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BubalineAnimal, EquineAnimal, FarmDataPackage, FinancialTransaction, LivestockSaleRecord } from '../types';

/**
 * Servicio centralizado para sincronización en la nube (Firestore Database)
 */
export const FirestoreSyncService = {
  // Sincronizar Fincas
  async syncFarms(farms: FarmDataPackage[]) {
    try {
      for (const farm of farms) {
        const farmRef = doc(db, 'farms', farm.profile.id);
        await setDoc(farmRef, {
          ...farm,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      console.log('✅ Fincas sincronizadas con Firestore');
    } catch (error) {
      console.error('Error sincronizando fincas en Firestore:', error);
    }
  },

  // Sincronizar Bubalinos
  async syncBubalines(animals: BubalineAnimal[]) {
    try {
      for (const animal of animals) {
        const animalRef = doc(db, 'bubaline_animals', animal.id);
        await setDoc(animalRef, {
          ...animal,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      console.log('✅ Bubalinos sincronizados con Firestore');
    } catch (error) {
      console.error('Error sincronizando bubalinos en Firestore:', error);
    }
  },

  // Sincronizar Equinos
  async syncEquines(equines: EquineAnimal[]) {
    try {
      for (const eq of equines) {
        const eqRef = doc(db, 'equines', eq.id);
        await setDoc(eqRef, {
          ...eq,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      console.log('✅ Equinos sincronizados con Firestore');
    } catch (error) {
      console.error('Error sincronizando equinos en Firestore:', error);
    }
  },

  // Sincronizar Transacciones Financieras
  async syncFinancials(transactions: FinancialTransaction[]) {
    try {
      for (const trx of transactions) {
        const trxRef = doc(db, 'financial_transactions', trx.id);
        await setDoc(trxRef, {
          ...trx,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      console.log('✅ Finanzas sincronizadas con Firestore');
    } catch (error) {
      console.error('Error sincronizando finanzas en Firestore:', error);
    }
  },

  // Sincronizar Ventas
  async syncSales(sales: LivestockSaleRecord[]) {
    try {
      for (const sale of sales) {
        const saleRef = doc(db, 'sales_records', sale.id);
        await setDoc(saleRef, {
          ...sale,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      console.log('✅ Ventas sincronizadas con Firestore');
    } catch (error) {
      console.error('Error sincronizando ventas en Firestore:', error);
    }
  }
};
