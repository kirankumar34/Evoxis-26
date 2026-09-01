-- ============================================================================
-- EVOXIS'26 -- Payment Fields Migration
-- Adds UPI transaction ID and payment screenshot URL to overall_registrations
-- ============================================================================

-- 1. Add payment columns to overall_registrations
ALTER TABLE public.overall_registrations
  ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
