-- ============================================================================
-- EvoXis 26: Physical QR Inventory Master Table
-- Pre-generated QR wristband inventory & Reception assignment schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.physical_qr_inventory (
  qr_id TEXT PRIMARY KEY,
  qr_code TEXT NOT NULL UNIQUE,
  qr_type TEXT NOT NULL DEFAULT 'WRISTBAND',
  environment TEXT NOT NULL DEFAULT 'PRODUCTION',
  status TEXT NOT NULL DEFAULT 'UNUSED',
  registration_id TEXT,
  participant_id TEXT,
  participant_name TEXT,
  email TEXT,
  mobile_number TEXT,
  college_institution TEXT,
  department TEXT,
  year TEXT,
  gender TEXT,
  registration_type TEXT,
  selected_events TEXT,
  total_events INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'Paid/Confirmed',
  campus_status TEXT DEFAULT 'Pending',
  food_status TEXT DEFAULT 'Pending',
  revocation_reason TEXT,
  assigned_at TIMESTAMPTZ,
  assigned_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_pqr_qr_code ON public.physical_qr_inventory(qr_code);
CREATE INDEX IF NOT EXISTS idx_pqr_participant_id ON public.physical_qr_inventory(participant_id);
CREATE INDEX IF NOT EXISTS idx_pqr_registration_id ON public.physical_qr_inventory(registration_id);
CREATE INDEX IF NOT EXISTS idx_pqr_status ON public.physical_qr_inventory(status);
CREATE INDEX IF NOT EXISTS idx_pqr_environment ON public.physical_qr_inventory(environment);

-- Enable RLS and Permissive Policies for Web Operations
ALTER TABLE public.physical_qr_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to physical_qr_inventory"
  ON public.physical_qr_inventory FOR SELECT USING (true);

CREATE POLICY "Allow public insert to physical_qr_inventory"
  ON public.physical_qr_inventory FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to physical_qr_inventory"
  ON public.physical_qr_inventory FOR UPDATE USING (true);
