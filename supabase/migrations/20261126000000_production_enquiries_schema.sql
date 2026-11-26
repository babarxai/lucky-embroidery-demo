-- Lucky Embroidery Production Schema Migration
-- Migration: 20261126000000_production_enquiries_schema.sql

-- 1. Create enquiries table if not exists, or update constraints
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    service TEXT DEFAULT '',
    project_details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ip_hash TEXT,
    idempotency_key TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Ensure columns exist if table was already created earlier
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enquiries' AND column_name = 'id') THEN
        ALTER TABLE public.enquiries ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enquiries' AND column_name = 'status') THEN
        ALTER TABLE public.enquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enquiries' AND column_name = 'created_at') THEN
        ALTER TABLE public.enquiries ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enquiries' AND column_name = 'updated_at') THEN
        ALTER TABLE public.enquiries ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enquiries' AND column_name = 'ip_hash') THEN
        ALTER TABLE public.enquiries ADD COLUMN ip_hash TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enquiries' AND column_name = 'idempotency_key') THEN
        ALTER TABLE public.enquiries ADD COLUMN idempotency_key TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enquiries' AND column_name = 'metadata') THEN
        ALTER TABLE public.enquiries ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Check constraint for status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'enquiries_status_check'
    ) THEN
        ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_status_check
            CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'archived'));
    END IF;
END $$;

-- 2. Enquiry Notifications tracking table
CREATE TABLE IF NOT EXISTS public.enquiry_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('admin_notification', 'customer_acknowledgement')),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    sent_at TIMESTAMPTZ
);

-- 3. Admin Profiles table for role-based authorization
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_enquiries_updated ON public.enquiries;
CREATE TRIGGER on_enquiries_updated
    BEFORE UPDATE ON public.enquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Helper function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
$$;

-- 6. Indexes for performant querying, searching, filtering and pagination
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON public.enquiries(email);
CREATE INDEX IF NOT EXISTS idx_enquiries_idempotency_key ON public.enquiries(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_enquiry_notifications_enquiry_id ON public.enquiry_notifications(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_notifications_status ON public.enquiry_notifications(status);

-- 7. Row Level Security (RLS) Configuration
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Revoke all permissions from anon
REVOKE ALL ON public.enquiries FROM anon;
REVOKE ALL ON public.enquiry_notifications FROM anon;
REVOKE ALL ON public.admin_profiles FROM anon;

-- Admin policies for enquiries:
DROP POLICY IF EXISTS "Admins can view enquiries" ON public.enquiries;
CREATE POLICY "Admins can view enquiries"
    ON public.enquiries
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
CREATE POLICY "Admins can update enquiries"
    ON public.enquiries
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Notifications policies:
DROP POLICY IF EXISTS "Admins can view notifications" ON public.enquiry_notifications;
CREATE POLICY "Admins can view notifications"
    ON public.enquiry_notifications
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update notifications" ON public.enquiry_notifications;
CREATE POLICY "Admins can update notifications"
    ON public.enquiry_notifications
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Admin profile policies:
DROP POLICY IF EXISTS "Users can read own admin profile" ON public.admin_profiles;
CREATE POLICY "Users can read own admin profile"
    ON public.admin_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());
