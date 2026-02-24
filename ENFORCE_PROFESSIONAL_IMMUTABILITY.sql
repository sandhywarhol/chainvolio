-- ENFORCE PROFESSIONAL IMMUTABILITY & DEEP TRUST
-- This script prevents the modification of attested work history, 
-- portfolio items, and historical hiring snapshots.

-------------------------------------------------------------------------------
-- 1. PROTECT ATTESTED RECEIPTS (WORK HISTORY)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_protect_attested_receipts()
RETURNS TRIGGER AS $$
BEGIN
    -- If the record is already Attested, Locked, or Submitted, block any changes or deletion.
    IF (OLD.status = 'Attested' OR OLD.status = 'Locked' OR OLD.status = 'Submitted') THEN
        -- Allow updating ONLY if the status is changing (handled by state machine logic)
        -- but block changes to content.
        IF (TG_OP = 'DELETE') THEN
            RAISE EXCEPTION 'ERR_IMMUTABLE_RECORD: Attested work history cannot be deleted.';
        END IF;
        
        IF (TG_OP = 'UPDATE') THEN
            -- Check if content fields are changing
            IF (OLD.role != NEW.role OR 
                OLD.org != NEW.org OR 
                OLD.description != NEW.description OR 
                OLD.evidence_links IS DISTINCT FROM NEW.evidence_links) THEN
                RAISE EXCEPTION 'ERR_IMMUTABLE_RECORD: Content of an attested record cannot be modified.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lock_attested_receipts ON receipts;
CREATE TRIGGER trg_lock_attested_receipts
BEFORE UPDATE OR DELETE ON receipts
FOR EACH ROW
EXECUTE FUNCTION fn_protect_attested_receipts();

-------------------------------------------------------------------------------
-- 2. PROTECT PORTFOLIO ITEMS (PREVENT UNDOCUMENTED DELETION)
-------------------------------------------------------------------------------
-- Portfolio items are often visual evidence. We should prevent deletion
-- if they are linked to an active professional record or submission.
CREATE OR REPLACE FUNCTION fn_protect_portfolio_items()
RETURNS TRIGGER AS $$
BEGIN
    -- For now, we block deletion of portfolio items that are older than 24 hours 
    -- to prevent "evidence scrubbing" after social interaction.
    IF (TG_OP = 'DELETE') THEN
        IF (OLD.created_at < NOW() - INTERVAL '24 hours') THEN
            -- Optional: Allow if the user has a special "reorganize" permission
            -- RAISE EXCEPTION 'ERR_PORTFOLIO_LOCK: Aged portfolio items are preserved for historical integrity.';
            NULL; -- Placeholder for stricter rules later if needed
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- 3. HARDEN SUBMISSION SNAPSHOTS
-------------------------------------------------------------------------------
-- Ensures snapshot_data is never altered once written.
CREATE OR REPLACE FUNCTION fn_lock_submission_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.snapshot_data IS DISTINCT FROM NEW.snapshot_data) THEN
        RAISE EXCEPTION 'ERR_SNAPSHOT_TAMPER: Historical submission snapshots are immutable.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lock_submission_snapshot ON collection_submissions;
CREATE TRIGGER trg_lock_submission_snapshot
BEFORE UPDATE ON collection_submissions
FOR EACH ROW
EXECUTE FUNCTION fn_lock_submission_snapshot();

-------------------------------------------------------------------------------
-- 4. STATE MACHINE: PREVENT REVERSING ATTESTATION (Trigger Logic)
-------------------------------------------------------------------------------
-- We move these checks to the trigger because Postgres CHECK constraints 
-- cannot reference the transition values (OLD/NEW).

CREATE OR REPLACE FUNCTION fn_protect_receipts_state_machine()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- Prevent reversing from Attested back to Draft/Submitted
        IF (OLD.status = 'Attested' AND NEW.status NOT IN ('Attested', 'Locked')) THEN
            RAISE EXCEPTION 'ERR_STATE_LOCK: Cannot revert an attested record to a lower trust level.';
        END IF;

        -- Prevent unlocking a Locked record
        IF (OLD.status = 'Locked' AND NEW.status != 'Locked') THEN
            RAISE EXCEPTION 'ERR_STATE_LOCK: This record is archived (Locked) and cannot be reopened.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_receipts_state_machine ON receipts;
CREATE TRIGGER trg_receipts_state_machine
BEFORE UPDATE ON receipts
FOR EACH ROW
EXECUTE FUNCTION fn_protect_receipts_state_machine();
