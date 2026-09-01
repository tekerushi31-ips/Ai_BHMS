-- ============================================================================
-- BHMS AI — SUPABASE POSTGRESQL DOCTOR PROFILE EXTENSION MIGRATION
-- Project URL: https://dxjopdtrtknlbrydzwaw.supabase.co
-- Target Table: public.doctor_profiles
-- ============================================================================

-- Safe extension of public.doctor_profiles columns
ALTER TABLE public.doctor_profiles
  ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '+91 98765 43210',
  ADD COLUMN IF NOT EXISTS date_of_birth TEXT DEFAULT '1985-06-15',
  ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Male',
  ADD COLUMN IF NOT EXISTS qualification TEXT DEFAULT 'B.H.M.S., M.D. (Hom.)',
  ADD COLUMN IF NOT EXISTS degree TEXT DEFAULT 'M.D. in Homoeopathic Philosophy',
  ADD COLUMN IF NOT EXISTS languages TEXT DEFAULT 'English, Hindi, Marathi',
  ADD COLUMN IF NOT EXISTS consultation_type TEXT DEFAULT 'Online & Offline',
  ADD COLUMN IF NOT EXISTS clinic_address TEXT DEFAULT 'Suite 402, Medical Enclave, MG Road',
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Pune',
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Maharashtra',
  ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '411001',
  ADD COLUMN IF NOT EXISTS clinic_phone TEXT DEFAULT '+91 20 2612 3456',
  ADD COLUMN IF NOT EXISTS clinic_email TEXT DEFAULT 'contact@homoeohealing.com',
  ADD COLUMN IF NOT EXISTS short_bio TEXT DEFAULT 'Experienced Classical Homoeopathic practitioner specializing in constitutional prescribing and chronic disease management.',
  ADD COLUMN IF NOT EXISTS areas_of_practice TEXT DEFAULT 'Respiratory disorders, Dermatological cases, Autoimmune conditions, Pediatric Homoeopathy',
  ADD COLUMN IF NOT EXISTS consultation_days TEXT DEFAULT 'Mon, Tue, Wed, Thu, Fri, Sat',
  ADD COLUMN IF NOT EXISTS available_start_time TEXT DEFAULT '09:00 AM',
  ADD COLUMN IF NOT EXISTS available_end_time TEXT DEFAULT '06:00 PM',
  ADD COLUMN IF NOT EXISTS is_online_consultation BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_offline_consultation BOOLEAN DEFAULT TRUE;

-- Enable RLS on doctor_profiles
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "Doctor profiles readable by authenticated users" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Doctors can update their own doctor profile" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Doctors can insert their own doctor profile" ON public.doctor_profiles;

-- 1. SELECT Policy: Readable by all authenticated users
CREATE POLICY "Doctor profiles readable by authenticated users"
    ON public.doctor_profiles FOR SELECT TO authenticated USING (true);

-- 2. UPDATE Policy: Doctor can only update their own profile linked via auth.uid()
CREATE POLICY "Doctors can update their own doctor profile"
    ON public.doctor_profiles FOR UPDATE TO authenticated
    USING (
      user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
      )
    );

-- 3. INSERT Policy: Doctor can insert their own profile linked via auth.uid()
CREATE POLICY "Doctors can insert their own doctor profile"
    ON public.doctor_profiles FOR INSERT TO authenticated
    WITH CHECK (
      user_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
      )
    );
