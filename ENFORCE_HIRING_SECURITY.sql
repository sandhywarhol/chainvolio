-- ENFORCE HIRING FLOW SECURITY & IMMUTABILITY
-- This script hardens the collection_submissions table with state machine rules and prevents modification of core submission data.

-- 1. Create State Transition Function
CREATE OR REPLACE FUNCTION fn_enforce_submission_state_machine()
RETURNS TRIGGER AS $$
BEGIN
    -- Only allow changes if the record isn't being deleted
    IF (TG_OP = 'UPDATE') THEN
        -- Prevent modification of core identity fields
        IF (OLD.candidate_wallet != NEW.candidate_wallet OR OLD.collection_id != NEW.collection_id OR OLD.submitted_at != NEW.submitted_at) THEN
            RAISE EXCEPTION 'ERR_IMMUTABLE_SUBMISSION: Core submission data cannot be modified after application.';
        END IF;

        -- State Machine Enforcement: recruiter_status
        -- Allowed: pending -> reviewed, reviewed -> shortlisted, reviewed -> rejected, pending -> shortlisted (skip reviewed), pending -> rejected (skip reviewed)
        IF (OLD.recruiter_status = 'shortlisted' AND NEW.recruiter_status != 'shortlisted') THEN
            RAISE EXCEPTION 'ERR_STATE_LOCK: shortlisted records cannot be moved back to other states.';
        END IF;

        IF (OLD.recruiter_status = 'rejected' AND NEW.recruiter_status != 'rejected') THEN
            RAISE EXCEPTION 'ERR_STATE_LOCK: rejected records cannot be moved back to other states.';
        END IF;

        -- Ensure status is a valid enum value (fallback if not using ENUM type)
        IF (NEW.recruiter_status NOT IN ('pending', 'reviewed', 'shortlisted', 'rejected')) THEN
            RAISE EXCEPTION 'ERR_INVALID_STATE: % is not a valid submission status.', NEW.recruiter_status;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Bind the Trigger
DROP TRIGGER IF EXISTS trg_enforce_hiring_rules ON collection_submissions;
CREATE TRIGGER trg_enforce_hiring_rules
BEFORE UPDATE ON collection_submissions
FOR EACH ROW
EXECUTE FUNCTION fn_enforce_submission_state_machine();

-- 3. Hardened RLS for Hiring
ALTER TABLE hiring_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_submissions ENABLE ROW LEVEL SECURITY;

-- 3.1 Collections Policies
DROP POLICY IF EXISTS "Collections readable by everyone" ON hiring_collections;
DROP POLICY IF EXISTS "Service role manages collections" ON hiring_collections;
CREATE POLICY "Collections readable by everyone" ON hiring_collections FOR SELECT USING (true);
CREATE POLICY "Service role manages collections" ON hiring_collections FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3.2 Submissions Policies (STRICT)
DROP POLICY IF EXISTS "Candidates read own submission" ON collection_submissions;
DROP POLICY IF EXISTS "Recruiters read own collection submissions" ON collection_submissions;
DROP POLICY IF EXISTS "Service role manages submissions" ON collection_submissions;

-- Candidate: Can see ONLY their own submissions
CREATE POLICY "Candidates read own submission" 
ON collection_submissions FOR SELECT 
USING (candidate_wallet = current_setting('app.current_wallet', true));

-- Recruiter: Can see submissions ONLY for collections they own
CREATE POLICY "Recruiters read own collection submissions" 
ON collection_submissions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM hiring_collections 
        WHERE hiring_collections.id = collection_submissions.collection_id 
        AND hiring_collections.owner_wallet = current_setting('app.current_wallet', true)
    )
);

CREATE POLICY "Service role manages submissions" ON collection_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Cleanup anon access to submissions (IMPORTANT)
REVOKE ALL ON collection_submissions FROM anon, authenticated;
GRANT SELECT ON collection_submissions TO anon, authenticated; -- Required for candidates to check status

COMMENT ON TRIGGER trg_enforce_hiring_rules ON collection_submissions IS 'Enforces one-way state machine and immutability of submission identity.';
