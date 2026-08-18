-- ============================================================================
-- ESQUEMA DDL DE SUPABASE / POSTGRESQL PARA EL SISTEMA GANADERÍA
-- ============================================================================

-- 1. TABLA DE FINCAS (farms)
CREATE TABLE IF NOT EXISTS public.farms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA DE ANIMALES (animals) - Bovinos, Bubalinos, Equinos
CREATE TABLE IF NOT EXISTS public.animals (
  id TEXT PRIMARY KEY,
  farm_id TEXT,
  ear_tag TEXT,
  name TEXT,
  species TEXT NOT NULL CHECK (species IN ('bovine', 'bubaline', 'equine')),
  breed TEXT,
  category TEXT,
  weight_kg NUMERIC(8,2) DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE TRANSACCIONES FINANCIERAS (financial_transactions)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id TEXT PRIMARY KEY,
  farm_id TEXT,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  description TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA DE VENTAS Y DESPACHOS (sales_records)
CREATE TABLE IF NOT EXISTS public.sales_records (
  id TEXT PRIMARY KEY,
  farm_id TEXT,
  sale_date DATE NOT NULL,
  buyer_name TEXT,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_weight_kg NUMERIC(10,2) DEFAULT 0,
  heads_count INT DEFAULT 0,
  status TEXT DEFAULT 'pagado',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES DE ALTO RENDIMIENTO
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_animals_species_category ON public.animals(species, category);
CREATE INDEX IF NOT EXISTS idx_animals_ear_tag ON public.animals(ear_tag);
CREATE INDEX IF NOT EXISTS idx_finances_farm_date ON public.financial_transactions(farm_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_farm_date ON public.sales_records(farm_id, sale_date DESC);

-- Habilitar Row Level Security (RLS) en modo permisivo para la app
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write for farms" ON public.farms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for animals" ON public.animals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for financial_transactions" ON public.financial_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for sales_records" ON public.sales_records FOR ALL USING (true) WITH CHECK (true);
