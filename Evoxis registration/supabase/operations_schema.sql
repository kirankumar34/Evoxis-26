-- ============================================================================
-- EvoXis'26 — Operations Portal PostgreSQL Database Schema
-- Project: https://supabase.com/dashboard/project/rvpdwkqpgloyfahdjmvr
-- Scope: Operational state (Physical QR, Campus Check-In, Event Attendance, Food Delivery, Audit Log)
-- ============================================================================

-- 1. Physical QR Inventory (Pre-generated Wristbands & ID Cards)
CREATE TABLE IF NOT EXISTS public.physical_qr_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT NOT NULL UNIQUE,
  qr_type TEXT NOT NULL DEFAULT 'WRISTBAND' CHECK (qr_type IN ('WRISTBAND', 'ID_CARD')),
  environment TEXT NOT NULL CHECK (environment IN ('PRODUCTION', 'TEST')),
  status TEXT NOT NULL DEFAULT 'UNUSED' CHECK (status IN ('UNUSED', 'ASSIGNED', 'ACTIVE', 'REVOKED')),
  participant_id TEXT,
  registration_id TEXT REFERENCES public.overall_registrations(registration_id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  assigned_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for physical_qr_inventory
CREATE INDEX IF NOT EXISTS idx_qr_code ON public.physical_qr_inventory(qr_code);
CREATE INDEX IF NOT EXISTS idx_qr_env_status ON public.physical_qr_inventory(environment, status);
CREATE INDEX IF NOT EXISTS idx_qr_reg_id ON public.physical_qr_inventory(registration_id);

-- 2. Physical QR Assignments (Active Bindings)
CREATE TABLE IF NOT EXISTS public.physical_qr_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physical_qr_id TEXT NOT NULL UNIQUE,
  physical_qr_type TEXT NOT NULL CHECK (physical_qr_type IN ('ID_CARD', 'WRISTBAND')),
  participant_id TEXT NOT NULL,
  registration_id TEXT NOT NULL REFERENCES public.overall_registrations(registration_id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Partial Unique Index: Only one active physical QR per participant
CREATE UNIQUE INDEX IF NOT EXISTS one_active_qr_per_participant 
ON public.physical_qr_assignments (registration_id) 
WHERE active;

-- 2. Campus Attendance (Single check-in per participant, idempotent)
CREATE TABLE IF NOT EXISTS public.campus_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES public.overall_registrations(registration_id) ON DELETE CASCADE UNIQUE,
  physical_qr_id TEXT NOT NULL,
  checkin_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checkin_by TEXT NOT NULL,
  station TEXT
);

-- 3. Event Attendance (Check-in per event, enforces unique(registration_id, event_id))
CREATE TABLE IF NOT EXISTS public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES public.overall_registrations(registration_id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES public.event_master(event_id),
  physical_qr_id TEXT NOT NULL,
  checkin_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checkin_by TEXT NOT NULL,
  station TEXT,
  is_override BOOLEAN NOT NULL DEFAULT FALSE,
  override_reason TEXT,
  CONSTRAINT unique_event_attendance_per_participant UNIQUE(registration_id, event_id)
);

-- 4. Food Delivery (Single meal redemption per participant, idempotent)
CREATE TABLE IF NOT EXISTS public.food_delivery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL REFERENCES public.overall_registrations(registration_id) ON DELETE CASCADE UNIQUE,
  physical_qr_id TEXT NOT NULL,
  delivered_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_by TEXT NOT NULL,
  station TEXT,
  is_override BOOLEAN NOT NULL DEFAULT FALSE,
  override_reason TEXT
);

-- 5. Operations Audit Log
CREATE TABLE IF NOT EXISTS public.operation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  staff_user TEXT,
  station TEXT,
  operation TEXT NOT NULL, -- QR_ASSIGNMENT | CAMPUS_CHECKIN | EVENT_CHECKIN | FOOD_DELIVERY | ADMIN_OVERRIDE
  registration_id TEXT,
  physical_qr_id TEXT,
  event_id TEXT,
  result TEXT NOT NULL,    -- SUCCESS | DUPLICATE | DENIED | ERROR
  reason TEXT
);

-- Indices for rapid real-time lookups
CREATE INDEX IF NOT EXISTS idx_pqr_physical_qr ON public.physical_qr_assignments(physical_qr_id);
CREATE INDEX IF NOT EXISTS idx_campus_reg_id ON public.campus_attendance(registration_id);
CREATE INDEX IF NOT EXISTS idx_evt_att_reg_id ON public.event_attendance(registration_id, event_id);
CREATE INDEX IF NOT EXISTS idx_food_reg_id ON public.food_delivery(registration_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_ts ON public.operation_audit_log(ts DESC);
