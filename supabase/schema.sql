-- ============================================================================
-- EVOXIS'26 — OFFICIAL SUPABASE POSTGRESQL DATABASE SCHEMA
-- Project: https://supabase.com/dashboard/project/rvpdwkqpgloyfahdjmvr
-- Account: evoxis26enquiry@gmail.com
-- ============================================================================

-- 1. Enable pgcrypto for UUID & cryptographic token generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Sequence for atomic sequential registration ID generation (EVOXIS26-00001 ...)
CREATE SEQUENCE IF NOT EXISTS evoxis26_registration_seq START WITH 1 INCREMENT BY 1;

-- 3. Overall Registrations Master Table
CREATE TABLE IF NOT EXISTS public.overall_registrations (
    registration_id TEXT PRIMARY KEY,
    registration_date TEXT NOT NULL,
    registration_time TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    college_institution TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    gender TEXT DEFAULT 'Not Specified',
    registration_type TEXT DEFAULT 'Individual',
    selected_events TEXT NOT NULL,
    total_events INTEGER NOT NULL DEFAULT 1,
    total_amount INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Free',
    qr_token TEXT UNIQUE NOT NULL,
    qr_status TEXT NOT NULL DEFAULT 'Active',
    email_status TEXT NOT NULL DEFAULT 'Sent',
    sms_status TEXT NOT NULL DEFAULT 'Sent',
    whatsapp_status TEXT NOT NULL DEFAULT 'Sent',
    overall_attendance_status TEXT NOT NULL DEFAULT 'Pending',
    registration_status TEXT NOT NULL DEFAULT 'Confirmed',
    team_name TEXT,
    team_members JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_reg_email ON public.overall_registrations(email);
CREATE INDEX IF NOT EXISTS idx_reg_phone ON public.overall_registrations(mobile_number);
CREATE INDEX IF NOT EXISTS idx_reg_qr_token ON public.overall_registrations(qr_token);

-- 4. Event Registrations (Per-event mapping for Technical / Non-Technical / Special tracks)
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id BIGSERIAL PRIMARY KEY,
    registration_id TEXT NOT NULL REFERENCES public.overall_registrations(registration_id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    college TEXT NOT NULL,
    department TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    category TEXT NOT NULL,
    registration_date TEXT NOT NULL,
    qr_token TEXT NOT NULL,
    attendance_status TEXT NOT NULL DEFAULT 'Pending',
    participation_status TEXT NOT NULL DEFAULT 'Registered',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Kolkata', NOW()),
    CONSTRAINT unique_registration_per_event UNIQUE(registration_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_evt_reg_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_evt_reg_qr ON public.event_registrations(qr_token);

-- 5. Attendance Log (Immutable append-only audit trail)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    attendance_id TEXT PRIMARY KEY,
    registration_id TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    attendance_date TEXT NOT NULL,
    attendance_time TEXT NOT NULL,
    attendance_location TEXT NOT NULL,
    attendance_status TEXT NOT NULL DEFAULT 'Present',
    participation_status TEXT NOT NULL DEFAULT 'Present',
    verified_by TEXT NOT NULL,
    qr_token TEXT NOT NULL,
    scan_timestamp TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

CREATE INDEX IF NOT EXISTS idx_att_reg_id ON public.attendance_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_att_event_id ON public.attendance_logs(event_id);

-- 6. Notification Log (Audit for Email / SMS / WhatsApp triggers)
CREATE TABLE IF NOT EXISTS public.notification_logs (
    notification_id TEXT PRIMARY KEY,
    registration_id TEXT NOT NULL,
    participant TEXT NOT NULL,
    event_id TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    channel TEXT NOT NULL,
    recipient TEXT NOT NULL,
    message_type TEXT NOT NULL,
    sent_date TEXT NOT NULL,
    sent_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Sent',
    provider_response TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

-- 7. Event Master Table (16 Flagship Events Configuration)
CREATE TABLE IF NOT EXISTS public.event_master (
    event_id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    venue TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    max_participants TEXT NOT NULL,
    reg_open BOOLEAN NOT NULL DEFAULT TRUE,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

-- Pre-populate 16 Official Events
INSERT INTO public.event_master (event_id, event_name, category, type, venue, date, start_time, end_time, max_participants, reg_open)
VALUES
    ('TE01', 'Paper Presentation', 'Technical', 'Individual/Team', 'Main Auditorium / Seminar Hall 1', 'September 26, 2026', '10:00 AM', '01:00 PM', '100', TRUE),
    ('TE02', 'Business Battle', 'Technical', 'Team', 'MBA Seminar Hall (Block 1)', 'September 26, 2026', '10:30 AM', '01:30 PM', '60', TRUE),
    ('TE03', 'Mind Sparks', 'Technical', 'Individual', 'CSE Smart Classroom 2', 'September 26, 2026', '11:00 AM', '01:00 PM', '80', TRUE),
    ('TE04', 'EditoMania', 'Technical', 'Individual', 'Design & Multimedia Lab (Block 3)', 'September 26, 2026', '10:00 AM', '01:00 PM', '50', TRUE),
    ('TE05', 'Lego Build with AI', 'Technical', 'Team', 'Robotics & Embedded Systems Lab', 'September 26, 2026', '11:00 AM', '01:30 PM', '50', TRUE),
    ('TE06', 'Cyber Investigation', 'Technical', 'Team', 'Cyber Security War Room Lab', 'September 26, 2026', '10:00 AM', '01:00 PM', '60', TRUE),
    ('NT01', 'Start Music', 'Non-Technical', 'Individual', 'Open Air Amphitheatre', 'September 26, 2026', '01:30 PM', '03:30 PM', '100', TRUE),
    ('NT02', 'Indo Japanese Game', 'Non-Technical', 'Team', 'Indoor Sports Complex Activity Hall', 'September 26, 2026', '02:00 PM', '04:00 PM', '60', TRUE),
    ('NT03', 'IPL Auction', 'Non-Technical', 'Team', 'Main Auditorium Tier Hall', 'September 26, 2026', '01:30 PM', '04:30 PM', '80', TRUE),
    ('NT04', 'Reel Rush', 'Non-Technical', 'Individual/Team', 'Campus Wide / Media Center Hub', 'September 26, 2026', '01:00 PM', '03:30 PM', '100', TRUE),
    ('NT05', 'Squid Game', 'Non-Technical', 'Individual', 'Central Quadrangle Ground', 'September 26, 2026', '02:00 PM', '04:30 PM', '120', TRUE),
    ('NT06', 'Clash of Talent', 'Non-Technical', 'Individual', 'Main Auditorium Grand Stage', 'September 26, 2026', '02:30 PM', '04:45 PM', '50', TRUE),
    ('SP01', 'Box Cricket', 'Special', 'Team', 'Sriram Turf Ground 1', 'September 26, 2026', '09:30 AM', '04:00 PM', '100', TRUE),
    ('SP02', '5-a-Side Football', 'Special', 'Team', 'Sriram Sports Complex Turf 2', 'September 26, 2026', '09:30 AM', '04:00 PM', '80', TRUE),
    ('SP03', 'Fashion Walk', 'Special', 'Individual/Team', 'Main Auditorium Grand Ramp', 'September 26, 2026', '03:00 PM', '05:00 PM', '50', TRUE),
    ('SP04', 'E-Sports Arena', 'Special', 'Individual/Team', 'High Performance Computing Lab (Block 2)', 'September 26, 2026', '11:00 AM', '03:30 PM', '100', TRUE)
ON CONFLICT (event_id) DO NOTHING;

-- 8. System Configuration Table
CREATE TABLE IF NOT EXISTS public.system_config (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT
);

INSERT INTO public.system_config (config_key, config_value, description)
VALUES
    ('EVENT_DATE_START', '2026-09-26', 'Symposium start date'),
    ('EVENT_DATE_END', '2026-09-26', 'Symposium end date'),
    ('REMINDER_SEND_TIME', '08:00', 'Daily reminder send trigger time (IST)'),
    ('ORGANIZER_CONTACT_EMAIL', 'evoxis26enquiry@gmail.com', 'Official helpdesk email'),
    ('ORGANIZER_CONTACT_PHONE', '+91 98401 23456', 'Official student helpdesk contact')
ON CONFLICT (config_key) DO NOTHING;

-- 9. Row Level Security (RLS) Configuration
ALTER TABLE public.overall_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert for symposium registration & check-in portal
CREATE POLICY "Allow public insert to overall_registrations" ON public.overall_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from overall_registrations" ON public.overall_registrations FOR SELECT USING (true);
CREATE POLICY "Allow public update to overall_registrations" ON public.overall_registrations FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to event_registrations" ON public.event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from event_registrations" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Allow public update to event_registrations" ON public.event_registrations FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to attendance_logs" ON public.attendance_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from attendance_logs" ON public.attendance_logs FOR SELECT USING (true);

CREATE POLICY "Allow public select from event_master" ON public.event_master FOR SELECT USING (true);
CREATE POLICY "Allow public update to event_master" ON public.event_master FOR UPDATE USING (true);

CREATE POLICY "Allow public select from system_config" ON public.system_config FOR SELECT USING (true);
