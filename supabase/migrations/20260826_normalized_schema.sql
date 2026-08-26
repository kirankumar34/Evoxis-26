-- ============================================================================
-- EVOXIS'26 — NORMALIZED POSTGRESQL DATABASE REBUILD MIGRATION
-- Reference: EvoXis26_Reference_Schema.xlsx & evoxis26-data-reset-and-realtime-sync-spec.md
-- Project: https://supabase.com/dashboard/project/rvpdwkqpgloyfahdjmvr
-- Account: evoxis26enquiry@gmail.com
-- ============================================================================

-- 1. Enable pgcrypto for UUID & cryptographic hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Sequence for atomic sequential registration ID generation (EVOXIS26-00001 ...)
CREATE SEQUENCE IF NOT EXISTS evoxis26_registration_seq START WITH 1 INCREMENT BY 1;

-- ============================================================================
-- DROP EXISTING VIEWS AND TABLES IN SAFE REVERSE DEPENDENCY ORDER
-- ============================================================================
DROP VIEW IF EXISTS public.team_operational_summary CASCADE;
DROP VIEW IF EXISTS public.event_attendance_summary CASCADE;
DROP VIEW IF EXISTS public.participant_operational_summary CASCADE;
DROP VIEW IF EXISTS public.overall_registrations CASCADE;
DROP VIEW IF EXISTS public.attendance_logs CASCADE;
DROP VIEW IF EXISTS public.physical_qr_inventory CASCADE;

DROP TABLE IF EXISTS public.sync_failure_log CASCADE;
DROP TABLE IF EXISTS public.food_delivery CASCADE;
DROP TABLE IF EXISTS public.event_attendance CASCADE;
DROP TABLE IF EXISTS public.qr_binding_log CASCADE;
DROP TABLE IF EXISTS public.physical_qr_master CASCADE;
DROP TABLE IF EXISTS public.physical_qr_inventory CASCADE;
DROP TABLE IF EXISTS public.attendance_logs CASCADE;
DROP TABLE IF EXISTS public.notification_logs CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.overall_registrations CASCADE;

-- ============================================================================
-- 1. EVENT MASTER (16 Flagship Events Configuration)
-- ============================================================================
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
ON CONFLICT (event_id) DO UPDATE SET
    event_name = EXCLUDED.event_name,
    category = EXCLUDED.category,
    venue = EXCLUDED.venue,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time;

-- ============================================================================
-- 2. SYSTEM CONFIGURATION
-- ============================================================================
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
ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

-- ============================================================================
-- 3. REGISTRATIONS TABLE (Transaction Level Metadata)
-- ============================================================================
CREATE TABLE public.registrations (
    registration_id TEXT PRIMARY KEY,
    registration_type TEXT NOT NULL DEFAULT 'Individual' CHECK (registration_type IN ('Individual', 'Team')),
    team_name TEXT,
    total_events INTEGER NOT NULL DEFAULT 1,
    total_amount INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Free',
    registration_status TEXT NOT NULL DEFAULT 'Confirmed',
    referral_source TEXT,
    referral_source_other TEXT,
    registration_date TEXT NOT NULL,
    registration_time TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

CREATE INDEX idx_registrations_type ON public.registrations(registration_type);
CREATE INDEX idx_registrations_date ON public.registrations(registration_date);
CREATE INDEX idx_registrations_team ON public.registrations(team_name);

-- ============================================================================
-- 4. PARTICIPANTS TABLE (One Row per Individual Human)
-- ============================================================================
CREATE TABLE public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id TEXT NOT NULL REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    college TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    gender TEXT NOT NULL DEFAULT 'Not Specified',
    role TEXT NOT NULL DEFAULT 'INDIVIDUAL' CHECK (role IN ('TEAM_HEAD', 'TEAM_MEMBER', 'INDIVIDUAL')),
    team_name TEXT,
    qr_token TEXT UNIQUE NOT NULL,
    qr_status TEXT NOT NULL DEFAULT 'Active',
    campus_attendance_status TEXT NOT NULL DEFAULT 'Pending',
    campus_checkin_time TIMESTAMPTZ,
    campus_checkin_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

CREATE INDEX idx_participants_reg_id ON public.participants(registration_id);
CREATE INDEX idx_participants_email ON public.participants(email);
CREATE INDEX idx_participants_mobile ON public.participants(mobile_number);
CREATE INDEX idx_participants_qr_token ON public.participants(qr_token);
CREATE INDEX idx_participants_role ON public.participants(role);
CREATE INDEX idx_participants_campus_status ON public.participants(campus_attendance_status);

-- ============================================================================
-- 5. EVENT REGISTRATIONS TABLE (One Row per Participant per Event)
-- ============================================================================
CREATE TABLE public.event_registrations (
    id BIGSERIAL PRIMARY KEY,
    registration_id TEXT NOT NULL REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    college TEXT NOT NULL,
    department TEXT NOT NULL,
    event_id TEXT NOT NULL REFERENCES public.event_master(event_id) ON DELETE RESTRICT,
    event_name TEXT NOT NULL,
    category TEXT NOT NULL,
    qr_token TEXT NOT NULL,
    attendance_status TEXT NOT NULL DEFAULT 'Pending',
    participation_status TEXT NOT NULL DEFAULT 'Registered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW()),
    CONSTRAINT unique_participant_per_event UNIQUE (participant_id, event_id)
);

CREATE INDEX idx_event_reg_reg_id ON public.event_registrations(registration_id);
CREATE INDEX idx_event_reg_part_id ON public.event_registrations(participant_id);
CREATE INDEX idx_event_reg_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_event_reg_qr_token ON public.event_registrations(qr_token);
CREATE INDEX idx_event_reg_att_status ON public.event_registrations(attendance_status);

-- ============================================================================
-- 6. PHYSICAL QR MASTER (Wristbands & ID Cards Inventory)
-- ============================================================================
CREATE TABLE public.physical_qr_master (
    qr_code TEXT PRIMARY KEY,
    qr_type TEXT NOT NULL DEFAULT 'WRISTBAND' CHECK (qr_type IN ('WRISTBAND', 'ID_CARD')),
    environment TEXT NOT NULL DEFAULT 'PRODUCTION' CHECK (environment IN ('PRODUCTION', 'TEST')),
    status TEXT NOT NULL DEFAULT 'UNUSED' CHECK (status IN ('UNUSED', 'ASSIGNED', 'REVOKED')),
    participant_id UUID REFERENCES public.participants(id) ON DELETE SET NULL,
    registration_id TEXT REFERENCES public.registrations(registration_id) ON DELETE SET NULL,
    participant_name TEXT,
    assigned_at TIMESTAMPTZ,
    assigned_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

CREATE INDEX idx_physical_qr_status ON public.physical_qr_master(status);
CREATE INDEX idx_physical_qr_part_id ON public.physical_qr_master(participant_id);
CREATE INDEX idx_physical_qr_reg_id ON public.physical_qr_master(registration_id);
CREATE INDEX idx_physical_qr_env ON public.physical_qr_master(environment);

-- ============================================================================
-- 7. QR BINDING LOG TABLE (Audit trail for wristband/card bindings)
-- ============================================================================
CREATE TABLE public.qr_binding_log (
    log_id TEXT PRIMARY KEY,
    qr_code TEXT NOT NULL,
    qr_type TEXT NOT NULL DEFAULT 'WRISTBAND',
    participant_id UUID REFERENCES public.participants(id) ON DELETE SET NULL,
    registration_id TEXT,
    action TEXT NOT NULL DEFAULT 'BIND' CHECK (action IN ('BIND', 'UNBIND', 'REPLACE')),
    station TEXT,
    staff_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

CREATE INDEX idx_qr_binding_log_code ON public.qr_binding_log(qr_code);
CREATE INDEX idx_qr_binding_log_part_id ON public.qr_binding_log(participant_id);

-- ============================================================================
-- 8. EVENT ATTENDANCE TABLE (Unified Check-in and Attendance Log)
-- ============================================================================
CREATE TABLE public.event_attendance (
    attendance_id TEXT PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    registration_id TEXT NOT NULL REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    event_id TEXT NOT NULL REFERENCES public.event_master(event_id) ON DELETE RESTRICT,
    event_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    attendance_location TEXT NOT NULL,
    attendance_status TEXT NOT NULL DEFAULT 'Present',
    participation_status TEXT NOT NULL DEFAULT 'Present',
    verified_by TEXT NOT NULL,
    qr_token TEXT NOT NULL,
    scan_timestamp TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW()),
    CONSTRAINT unique_attendance_per_event UNIQUE (participant_id, event_id)
);

CREATE INDEX idx_event_att_part_id ON public.event_attendance(participant_id);
CREATE INDEX idx_event_att_reg_id ON public.event_attendance(registration_id);
CREATE INDEX idx_event_att_event_id ON public.event_attendance(event_id);
CREATE INDEX idx_event_att_qr_token ON public.event_attendance(qr_token);
CREATE INDEX idx_event_att_status ON public.event_attendance(attendance_status);

-- ============================================================================
-- 9. FOOD DELIVERY TABLE (One Row per Participant, Idempotent)
-- ============================================================================
CREATE TABLE public.food_delivery (
    delivery_id TEXT PRIMARY KEY,
    participant_id UUID NOT NULL UNIQUE REFERENCES public.participants(id) ON DELETE CASCADE,
    registration_id TEXT NOT NULL REFERENCES public.registrations(registration_id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    meal_type TEXT NOT NULL DEFAULT 'LUNCH',
    station TEXT NOT NULL DEFAULT 'Food Counter 1',
    delivered_by TEXT NOT NULL,
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW())
);

CREATE INDEX idx_food_delivery_part_id ON public.food_delivery(participant_id);
CREATE INDEX idx_food_delivery_reg_id ON public.food_delivery(registration_id);

-- ============================================================================
-- 10. NOTIFICATION LOGS (Email / SMS / WhatsApp triggers)
-- ============================================================================
CREATE TABLE public.notification_logs (
    notification_id TEXT PRIMARY KEY,
    registration_id TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    event_id TEXT,
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

CREATE INDEX idx_notif_reg_id ON public.notification_logs(registration_id);

-- ============================================================================
-- 11. SYNC FAILURE LOG TABLE (Resilient real-time sync queue & retry)
-- ============================================================================
CREATE TABLE public.sync_failure_log (
    id BIGSERIAL PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    payload JSONB NOT NULL,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Kolkata', NOW()),
    last_attempt_at TIMESTAMPTZ
);

CREATE INDEX idx_sync_failure_status ON public.sync_failure_log(status);

-- ============================================================================
-- 12. BACKWARD-COMPATIBLE ADAPTER VIEWS
-- ============================================================================

-- A. overall_registrations view (maps normalized participants + registrations)
CREATE OR REPLACE VIEW public.overall_registrations AS
SELECT
    p.registration_id,
    r.registration_date,
    r.registration_time,
    p.full_name AS participant_name,
    p.email,
    p.mobile_number,
    p.college AS college_institution,
    p.department,
    p.year,
    p.gender,
    r.registration_type,
    (
        SELECT string_agg(er.event_id, ', ')
        FROM public.event_registrations er
        WHERE er.participant_id = p.id
    ) AS selected_events,
    r.total_events,
    r.total_amount,
    r.payment_status,
    p.qr_token,
    p.qr_status,
    r.referral_source,
    r.referral_source_other,
    'Sent'::text AS email_status,
    'Sent'::text AS sms_status,
    'Sent'::text AS whatsapp_status,
    p.campus_attendance_status AS overall_attendance_status,
    r.registration_status,
    r.team_name,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', tm.id,
                'name', tm.full_name,
                'email', tm.email,
                'phone', tm.mobile_number,
                'college', tm.college,
                'department', tm.department,
                'year', tm.year,
                'gender', tm.gender,
                'role', tm.role,
                'registrationId', tm.registration_id,
                'qrToken', tm.qr_token
            )
        )
        FROM public.participants tm
        WHERE tm.registration_id = p.registration_id
    ) AS team_members,
    p.created_at
FROM public.participants p
JOIN public.registrations r ON r.registration_id = p.registration_id;

-- B. attendance_logs view (maps event_attendance to legacy shape)
CREATE OR REPLACE VIEW public.attendance_logs AS
SELECT
    ea.attendance_id,
    ea.registration_id,
    ea.participant_name,
    ea.event_id,
    ea.event_name,
    ea.event_type,
    split_part(ea.scan_timestamp, 'T', 1) AS attendance_date,
    split_part(ea.scan_timestamp, 'T', 2) AS attendance_time,
    ea.attendance_location,
    ea.attendance_status,
    ea.participation_status,
    ea.verified_by,
    ea.qr_token,
    ea.scan_timestamp,
    ea.created_at
FROM public.event_attendance ea;

-- C. physical_qr_inventory view
CREATE OR REPLACE VIEW public.physical_qr_inventory AS
SELECT
    pq.qr_code AS qr_id,
    pq.qr_code,
    pq.qr_type,
    pq.environment,
    pq.status,
    pq.registration_id,
    pq.participant_id::text AS participant_id,
    pq.participant_name,
    p.email,
    p.mobile_number,
    p.college AS college_institution,
    p.department,
    p.year,
    p.gender,
    r.registration_type,
    (
        SELECT string_agg(er.event_id, ', ')
        FROM public.event_registrations er
        WHERE er.participant_id = pq.participant_id
    ) AS selected_events,
    COALESCE(r.total_events, 0) AS total_events,
    COALESCE(r.payment_status, 'Free') AS payment_status,
    p.campus_attendance_status AS campus_status,
    CASE WHEN fd.delivery_id IS NOT NULL THEN 'Delivered' ELSE 'Pending' END AS food_status,
    NULL::text AS revocation_reason,
    pq.assigned_at,
    pq.assigned_by,
    pq.created_at,
    pq.updated_at
FROM public.physical_qr_master pq
LEFT JOIN public.participants p ON p.id = pq.participant_id
LEFT JOIN public.registrations r ON r.registration_id = pq.registration_id
LEFT JOIN public.food_delivery fd ON fd.participant_id = pq.participant_id;

-- D. participant_operational_summary view
CREATE OR REPLACE VIEW public.participant_operational_summary AS
SELECT
    p.id::text AS participant_id,
    p.registration_id,
    r.team_name,
    p.full_name,
    p.email,
    p.mobile_number,
    p.department,
    p.college,
    r.registration_type,
    pq.qr_code AS physical_qr_id,
    CASE WHEN pq.qr_code IS NOT NULL THEN 'ASSIGNED' ELSE 'UNASSIGNED' END AS qr_status,
    p.campus_checkin_time,
    (p.campus_attendance_status = 'Present') AS campus_present,
    (
        SELECT COUNT(DISTINCT er.event_id)
        FROM public.event_registrations er
        WHERE er.participant_id = p.id
    ) AS total_registered_events,
    (
        SELECT COUNT(DISTINCT ea.event_id)
        FROM public.event_attendance ea
        WHERE ea.participant_id = p.id AND ea.attendance_status = 'Present'
    ) AS total_events_attended,
    fd.delivered_at AS food_delivered_time,
    (fd.delivery_id IS NOT NULL) AS food_delivered,
    p.created_at
FROM public.participants p
JOIN public.registrations r ON r.registration_id = p.registration_id
LEFT JOIN public.physical_qr_master pq ON pq.participant_id = p.id AND pq.status = 'ASSIGNED'
LEFT JOIN public.food_delivery fd ON fd.participant_id = p.id;

-- E. event_attendance_summary view
CREATE OR REPLACE VIEW public.event_attendance_summary AS
SELECT
    em.event_id,
    em.event_name,
    em.category,
    COUNT(DISTINCT er.participant_id) AS total_registered,
    COUNT(DISTINCT CASE WHEN er.attendance_status = 'Present' THEN er.participant_id END) AS total_present,
    COUNT(DISTINCT CASE WHEN er.attendance_status != 'Present' OR er.attendance_status IS NULL THEN er.participant_id END) AS total_absent,
    CASE 
        WHEN COUNT(DISTINCT er.participant_id) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN er.attendance_status = 'Present' THEN er.participant_id END)::numeric / COUNT(DISTINCT er.participant_id)::numeric) * 100, 1)
        ELSE 0.0
    END AS attendance_percentage
FROM public.event_master em
LEFT JOIN public.event_registrations er ON er.event_id = em.event_id
GROUP BY em.event_id, em.event_name, em.category;

-- F. team_operational_summary view
CREATE OR REPLACE VIEW public.team_operational_summary AS
SELECT
    r.team_name,
    COUNT(DISTINCT p.id) AS total_members,
    COUNT(DISTINCT CASE WHEN p.campus_attendance_status = 'Present' THEN p.id END) AS members_campus_checked_in,
    COUNT(DISTINCT CASE WHEN pq.qr_code IS NOT NULL THEN p.id END) AS members_qr_assigned,
    COUNT(DISTINCT CASE WHEN fd.delivery_id IS NOT NULL THEN p.id END) AS members_food_delivered
FROM public.registrations r
JOIN public.participants p ON p.registration_id = r.registration_id
LEFT JOIN public.physical_qr_master pq ON pq.participant_id = p.id AND pq.status = 'ASSIGNED'
LEFT JOIN public.food_delivery fd ON fd.participant_id = p.id
WHERE r.team_name IS NOT NULL AND r.team_name != ''
GROUP BY r.team_name;

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_qr_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_binding_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_failure_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Allow public full access for symposium registration, check-in, event desks & food counters
CREATE POLICY "Allow public all on registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on participants" ON public.participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on event_registrations" ON public.event_registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on physical_qr_master" ON public.physical_qr_master FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on qr_binding_log" ON public.qr_binding_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on event_attendance" ON public.event_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on food_delivery" ON public.food_delivery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on sync_failure_log" ON public.sync_failure_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on notification_logs" ON public.notification_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on event_master" ON public.event_master FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on system_config" ON public.system_config FOR ALL USING (true) WITH CHECK (true);
