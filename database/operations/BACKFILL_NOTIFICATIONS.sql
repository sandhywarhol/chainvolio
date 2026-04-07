-- BACKFILL_NOTIFICATIONS.sql
-- Run this in the Supabase SQL Editor to populate notifications for past events.

-- 1. Backfill Historical Attestations
INSERT INTO notifications (wallet_address, title, message, type, related_id, link, created_at, is_read)
SELECT 
    r.wallet_address,
    'New Attestation',
    'Your work as ' || COALESCE(r.role, 'Work Record') || ' has been attested by ' || COALESCE(a.attester_org, a.attester_name, 'a verifier'),
    'attestation',
    a.id::text,
    '/dashboard#receipt-' || a.id::text,
    a.created_at,
    true
FROM attestations a
JOIN receipts r ON a.receipt_id = r.id
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.related_id = a.id::text AND n.type = 'attestation'
);

-- 2. Backfill Historical Hiring Updates
INSERT INTO notifications (wallet_address, title, message, type, related_id, link, created_at, is_read)
SELECT 
    s.candidate_wallet,
    CASE WHEN s.recruiter_status = 'hired' THEN 'Selected 🎉' ELSE 'Hiring Update' END,
    CASE 
        WHEN s.recruiter_status = 'shortlisted' THEN 'You’ve been shortlisted for ' || c.title
        WHEN s.recruiter_status = 'rejected' THEN 'Your application for ' || c.title || ' was not selected'
        WHEN s.recruiter_status = 'hired' THEN 'You’ve been selected for ' || c.title || ' 🎉'
        ELSE 'Hiring update for ' || c.title
    END,
    'hiring',
    s.id::text,
    '/r/' || c.slug || '#application-status',
    COALESCE(s.submitted_at, NOW()),
    true
FROM collection_submissions s
JOIN hiring_collections c ON s.collection_id = c.id
WHERE s.recruiter_status IN ('shortlisted', 'rejected', 'hired')
AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.related_id = s.id::text AND n.type = 'hiring'
);

-- 3. Backfill Historical Verification Approvals
INSERT INTO notifications (wallet_address, title, message, type, related_id, link, created_at, is_read)
SELECT 
    v.wallet_address,
    'Verification Approved',
    CASE 
        WHEN v.type ILIKE '%Builder%' THEN 'You are now a Verified Builder 🎉'
        WHEN v.type ILIKE '%Figure%' THEN 'You are now a Verified Public Figure 🎉'
        WHEN v.type ILIKE '%Company%' THEN 'Your account is now verified as a Company 🎉'
        WHEN v.type ILIKE '%Community%' OR v.type ILIKE '%DAO%' THEN 'Your account is now verified as a Community 🎉'
        ELSE 'Your account is now verified as ' || v.type || ' 🎉'
    END,
    'verification',
    v.id::text,
    '/dashboard#verification-status',
    COALESCE(v.approved_at, v.updated_at, v.created_at, NOW()),
    true
FROM organization_verifications v
WHERE v.status = 'verified'
AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.related_id = v.id::text AND n.type = 'verification'
);
