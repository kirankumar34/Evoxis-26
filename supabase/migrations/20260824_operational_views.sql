-- ==============================================================================
-- EvoXis'26 Operations Portal — Operational Summary Views & Indexes Migration
-- ==============================================================================

-- 1. Index critical lookups on attendance_logs and overall_registrations
CREATE INDEX IF NOT EXISTS idx_attendance_logs_qr_token_status 
  ON public.attendance_logs(qr_token, event_type, attendance_status);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_registration_id 
  ON public.attendance_logs(registration_id, event_type);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_event_attendance 
  ON public.attendance_logs(registration_id, event_id, attendance_status);

CREATE INDEX IF NOT EXISTS idx_overall_registrations_reg_id 
  ON public.overall_registrations(registration_id);

CREATE INDEX IF NOT EXISTS idx_overall_registrations_team 
  ON public.overall_registrations(team_name);

CREATE INDEX IF NOT EXISTS idx_event_registrations_reg_event 
  ON public.event_registrations(registration_id, event_id);


-- 2. Participant Operational Summary View
-- Computes real-time live attendance and operational status per participant
CREATE OR REPLACE VIEW public.participant_operational_summary AS
SELECT
  o.registration_id AS participant_id,
  o.registration_id,
  o.team_name,
  o.participant_name AS full_name,
  o.email,
  o.mobile_number,
  o.department,
  o.college_institution AS college,
  o.registration_type,
  -- Physical QR binding from latest successful QR_ASSIGNMENT
  (
    SELECT qr_token 
    FROM public.attendance_logs 
    WHERE event_type = 'QR_ASSIGNMENT' 
      AND registration_id = o.registration_id 
      AND attendance_status = 'SUCCESS' 
    ORDER BY scan_timestamp DESC 
    LIMIT 1
  ) AS physical_qr_id,
  -- QR status
  CASE 
    WHEN (
      SELECT 1 
      FROM public.attendance_logs 
      WHERE event_type = 'QR_ASSIGNMENT' 
        AND registration_id = o.registration_id 
        AND attendance_status = 'SUCCESS' 
      LIMIT 1
    ) IS NOT NULL THEN 'ASSIGNED'
    ELSE 'UNASSIGNED'
  END AS qr_status,
  -- Campus Check-in
  (
    SELECT scan_timestamp 
    FROM public.attendance_logs 
    WHERE event_type = 'CAMPUS_CHECKIN' 
      AND registration_id = o.registration_id 
      AND attendance_status = 'SUCCESS' 
    ORDER BY scan_timestamp ASC 
    LIMIT 1
  ) AS campus_checkin_time,
  (
    o.overall_attendance_status = 'Present' OR
    EXISTS (
      SELECT 1 
      FROM public.attendance_logs 
      WHERE event_type = 'CAMPUS_CHECKIN' 
        AND registration_id = o.registration_id 
        AND attendance_status = 'SUCCESS'
    )
  ) AS campus_present,
  -- Event Counts
  COALESCE(o.total_events, (
    SELECT COUNT(DISTINCT er.event_id)
    FROM public.event_registrations er
    WHERE er.registration_id = o.registration_id
  ), 0) AS total_registered_events,
  (
    SELECT COUNT(DISTINCT ea.event_id)
    FROM public.attendance_logs ea
    WHERE ea.event_type = 'EVENT_CHECKIN'
      AND ea.registration_id = o.registration_id
      AND ea.attendance_status = 'SUCCESS'
  ) AS total_events_attended,
  -- Food Delivery
  (
    SELECT scan_timestamp 
    FROM public.attendance_logs 
    WHERE event_type = 'FOOD_DELIVERY' 
      AND registration_id = o.registration_id 
      AND attendance_status = 'SUCCESS' 
    ORDER BY scan_timestamp ASC 
    LIMIT 1
  ) AS food_delivered_time,
  EXISTS (
    SELECT 1 
    FROM public.attendance_logs 
    WHERE event_type = 'FOOD_DELIVERY' 
      AND registration_id = o.registration_id 
      AND attendance_status = 'SUCCESS'
  ) AS food_delivered,
  o.created_at
FROM public.overall_registrations o;


-- 3. Event Attendance Summary View
-- Computes registered vs attended metrics per event
CREATE OR REPLACE VIEW public.event_attendance_summary AS
SELECT
  er.event_id,
  er.event_name,
  er.category,
  COUNT(DISTINCT er.registration_id) AS total_registered,
  COUNT(DISTINCT CASE WHEN er.attendance_status = 'Present' THEN er.registration_id END) AS total_present,
  COUNT(DISTINCT CASE WHEN er.attendance_status != 'Present' OR er.attendance_status IS NULL THEN er.registration_id END) AS total_absent,
  CASE 
    WHEN COUNT(DISTINCT er.registration_id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN er.attendance_status = 'Present' THEN er.registration_id END)::numeric / COUNT(DISTINCT er.registration_id)::numeric) * 100, 1)
    ELSE 0.0
  END AS attendance_percentage
FROM public.event_registrations er
GROUP BY er.event_id, er.event_name, er.category;


-- 4. Team Operational Summary View
-- Computes aggregate readiness and attendance across team members
CREATE OR REPLACE VIEW public.team_operational_summary AS
SELECT
  o.team_name,
  COUNT(DISTINCT o.registration_id) AS total_members,
  COUNT(DISTINCT CASE WHEN o.overall_attendance_status = 'Present' THEN o.registration_id END) AS members_campus_checked_in,
  COUNT(DISTINCT CASE WHEN (
    SELECT 1 FROM public.attendance_logs 
    WHERE event_type = 'QR_ASSIGNMENT' 
      AND registration_id = o.registration_id 
      AND attendance_status = 'SUCCESS'
    LIMIT 1
  ) IS NOT NULL THEN o.registration_id END) AS members_qr_assigned,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM public.attendance_logs 
    WHERE event_type = 'FOOD_DELIVERY' 
      AND registration_id = o.registration_id 
      AND attendance_status = 'SUCCESS'
  ) THEN o.registration_id END) AS members_food_delivered
FROM public.overall_registrations o
WHERE o.team_name IS NOT NULL AND o.team_name != ''
GROUP BY o.team_name;
