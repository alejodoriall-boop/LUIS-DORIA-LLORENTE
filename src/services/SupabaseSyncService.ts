import { supabase } from '../lib/supabase';
import {
  BubalineAnimal,
  EquineAnimal,
  FarmDataPackage,
  FinancialTransaction,
  LivestockSaleRecord,
} from '../types';

/**
 * Servicio centralizado para sincronización en la nube con Supabase (PostgreSQL)
 */
export const SupabaseSyncService = {
  // Sincronizar Fincas
  async syncFarms(farms: FarmDataPackage[]) {
    try {
      const records = farms.map((farm) => ({
        id: farm.profile.id,
        name: farm.profile.name,
        location: `${farm.profile.municipality || ''}, ${farm.profile.department || ''}`,
        data: farm,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('farms').upsert(records, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncFarms info:', error.message);
      } else {
        console.log('✅ Fincas sincronizadas con Supabase');
      }
    } catch (err) {
      console.warn('Error en syncFarms Supabase:', err);
    }
  },

  // Sincronizar Bubalinos
  async syncBubalines(animals: BubalineAnimal[]) {
    try {
      const records = animals.map((animal) => ({
        id: animal.id,
        farm_id: animal.farmId,
        ear_tag: animal.earTag,
        name: animal.name,
        breed: animal.breed,
        species: 'bubaline',
        category: animal.category,
        weight_kg: animal.weightKg,
        data: animal,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('animals').upsert(records, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncBubalines info:', error.message);
      } else {
        console.log('✅ Bubalinos sincronizados con Supabase');
      }
    } catch (err) {
      console.warn('Error en syncBubalines Supabase:', err);
    }
  },

  // Sincronizar Equinos
  async syncEquines(equines: EquineAnimal[]) {
    try {
      const records = equines.map((eq) => ({
        id: eq.id,
        ear_tag: eq.earTagOrIron || eq.rfidChip || eq.id,
        name: eq.name,
        breed: eq.breed,
        species: 'equine',
        category: eq.aptitude,
        weight_kg: eq.weightKg || 0,
        data: eq,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('animals').upsert(records, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncEquines info:', error.message);
      } else {
        console.log('✅ Equinos sincronizados con Supabase');
      }
    } catch (err) {
      console.warn('Error en syncEquines Supabase:', err);
    }
  },

  // Sincronizar Transacciones Financieras
  async syncFinancials(transactions: FinancialTransaction[]) {
    try {
      const records = transactions.map((trx) => ({
        id: trx.id,
        farm_id: trx.farmId,
        date: trx.date,
        type: trx.type,
        category: trx.category,
        amount: trx.amount,
        description: trx.description,
        data: trx,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('financial_transactions').upsert(records, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncFinancials info:', error.message);
      } else {
        console.log('✅ Finanzas sincronizadas con Supabase');
      }
    } catch (err) {
      console.warn('Error en syncFinancials Supabase:', err);
    }
  },

  // Sincronizar Ventas
  async syncSales(sales: LivestockSaleRecord[]) {
    try {
      const records = sales.map((sale) => ({
        id: sale.id,
        farm_id: sale.farmId,
        sale_date: sale.saleDate,
        buyer_name: sale.buyerName,
        total_amount: sale.economicMetrics?.netSaleIncome || 0,
        total_weight_kg: sale.zootecnicMetrics?.netWeightKg || 0,
        heads_count: sale.headsCount || sale.animals.length,
        status: 'completada',
        data: sale,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('sales_records').upsert(records, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase syncSales info:', error.message);
      } else {
        console.log('✅ Ventas sincronizadas con Supabase');
      }
    } catch (err) {
      console.warn('Error en syncSales Supabase:', err);
    }
  },
};
