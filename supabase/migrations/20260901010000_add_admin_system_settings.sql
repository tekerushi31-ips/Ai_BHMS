-- ============================================================================
-- BHMS AI — SUPABASE POSTGRESQL ADMIN SYSTEM SETTINGS MIGRATION
-- Project URL: https://dxjopdtrtknlbrydzwaw.supabase.co
-- Target Table: public.system_settings
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'GENERAL', -- FEATURE_FLAG, AI_CONFIG, SYSTEM
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-performance key lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_cat ON public.system_settings(category);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "System settings readable by authenticated users" ON public.system_settings;
DROP POLICY IF EXISTS "System settings editable by admin officers" ON public.system_settings;

CREATE POLICY "System settings readable by authenticated users"
    ON public.system_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "System settings editable by admin officers"
    ON public.system_settings FOR ALL TO authenticated
    USING (
        user_id IN (
            SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
        )
    );
