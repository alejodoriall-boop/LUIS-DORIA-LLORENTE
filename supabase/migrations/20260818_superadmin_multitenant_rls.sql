-- ============================================================================
-- GANADERIA SAAS - MIGRACIÓN & POLÍTICAS DE SEGURIDAD RLS (SUPERADMIN & MULTI-TENANT)
-- PostgreSQL / Supabase Migration
-- ============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE TENANTS (PREDIOS / GANADERÍAS REGISTRADAS)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_code VARCHAR(30) UNIQUE NOT NULL,
    farm_name VARCHAR(150) NOT NULL,
    legal_business_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(50) NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    owner_email VARCHAR(150) NOT NULL,
    owner_phone VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'suspended', 'cancelled')),
    plan VARCHAR(50) NOT NULL DEFAULT 'starter_finca' CHECK (plan IN ('starter_finca', 'pro_ganadero', 'enterprise_corporativo', 'custom_agro')),
    monthly_fee_usd NUMERIC(10, 2) NOT NULL DEFAULT 79.00,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Feature Flags modulares almacenadas en JSONB
    feature_flags JSONB NOT NULL DEFAULT '{
        "enableBuffaloModule": false,
        "enableWhatsAppAIAssistant": true,
        "enableAdvancedSanitaryPlan": true,
        "enableSupplementationMRP": false,
        "enableInventoryApprovalFlow": false,
        "enableGisAdvancedMapping": true,
        "enableCustomPedigreeCertificates": false,
        "enableTraceabilityExport": true
    }'::jsonb,

    -- Cuotas y límites de consumo
    quotas JSONB NOT NULL DEFAULT '{
        "maxAnimalsLimit": 300,
        "usedAnimalsCount": 0,
        "whatsAppMonthlyQuota": 500,
        "whatsAppMessagesSentThisMonth": 0,
        "aiQueriesMonthlyQuota": 100,
        "aiQueriesUsedThisMonth": 0,
        "storageMbQuota": 5120,
        "storageMbUsed": 0,
        "maxUserSeats": 3,
        "usedUserSeats": 1
    }'::jsonb,

    is_policy_lock_bypassed BOOLEAN NOT NULL DEFAULT FALSE,
    support_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE SUSCRIPCIONES Y FACTURACIÓN STRIPE
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    stripe_price_id VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA INMUTABLE DE AUDITORÍA GLOBAL (SUPERADMIN AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.superadmin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    superadmin_id UUID REFERENCES auth.users(id),
    superadmin_email VARCHAR(150) NOT NULL,
    action_type VARCHAR(60) NOT NULL,
    details TEXT NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    tenant_name VARCHAR(150),
    ip_address VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'success'
);

-- 5. FUNCIONES HELPER DE SUPABASE AUTH Y RECLAMOS JWT
-- Función para verificar si el usuario autenticado tiene el reclamo is_superadmin
CREATE OR REPLACE FUNCTION auth.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        coalesce(
            (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_superadmin')::boolean,
            false
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el tenant_id del usuario autenticado
CREATE OR REPLACE FUNCTION auth.current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id')::uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superadmin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS PARA TENANTS
-- Superadmin: Control total (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "superadmin_full_access_tenants"
ON public.tenants
FOR ALL
USING (auth.is_superadmin())
WITH CHECK (auth.is_superadmin());

-- Clientes Ordinarios: Solo pueden ver y actualizar su propio Tenant asignado
CREATE POLICY "tenant_isolation_select"
ON public.tenants
FOR SELECT
USING (id = auth.current_tenant_id());

CREATE POLICY "tenant_isolation_update"
ON public.tenants
FOR UPDATE
USING (id = auth.current_tenant_id() AND status != 'suspended')
WITH CHECK (id = auth.current_tenant_id() AND status != 'suspended');

-- 8. POLÍTICAS RLS PARA AUDITORÍA
-- Solo los Superadmins pueden consultar la bitácora de auditoría
CREATE POLICY "superadmin_read_audit_logs"
ON public.superadmin_audit_logs
FOR SELECT
USING (auth.is_superadmin());

-- Las inserciones de auditoría se realizan por funciones autorizadas o superadmin
CREATE POLICY "superadmin_insert_audit_logs"
ON public.superadmin_audit_logs
FOR INSERT
WITH CHECK (auth.is_superadmin() OR auth.role() = 'authenticated');

-- 9. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_code ON public.tenants(tenant_code);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.superadmin_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_id ON public.superadmin_audit_logs(tenant_id);
