-- ============================================================================
-- EvoXis 26: Add Referral Source Columns
-- Supports "How did you know about this event?" multi-choice + other specification
-- ============================================================================

ALTER TABLE IF EXISTS public.overall_registrations 
  ADD COLUMN IF NOT EXISTS referral_source TEXT,
  ADD COLUMN IF NOT EXISTS referral_source_other TEXT;

ALTER TABLE IF EXISTS public.physical_qr_inventory 
  ADD COLUMN IF NOT EXISTS referral_source TEXT,
  ADD COLUMN IF NOT EXISTS referral_source_other TEXT;

-- Index for analytics and reporting
CREATE INDEX IF NOT EXISTS idx_reg_referral_source ON public.overall_registrations(referral_source);
