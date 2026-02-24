-- ChainVolio Immutability & State Machine Migration
-- Ensures attested work records cannot be tampered with.

-------------------------------------------------------------------------------
-- 1. STATE MACHINE DEFINITION
-------------------------------------------------------------------------------
-- Current states in 'status' column: 'Self-Declared', 'Attested'
-- We will formalize these with a check constraint to prevent invalid states.

ALTER TABLE receipts 
ADD CONSTRAINT check_receipt_status 
CHECK (status IN ('Draft', 'Submitted', 'Attested', 'Locked'));

-- Migration: Update 'Self-Declared' to 'Submitted' for consistency if desired
UPDATE receipts SET status = 'Submitted' WHERE status = 'Self-Declared';

-------------------------------------------------------------------------------
-- 2. PROTECT ATTESTED RECORDS (Trigger)
-------------------------------------------------------------------------------
-- This function prevents any modification to receipts that are 'Attested' or 'Locked'.

CREATE OR REPLACE FUNCTION protect_immutable_receipts()
RETURNS TRIGGER AS $$
BEGIN
    -- If the current status is Attested or Locked, block UPDATE and DELETE
    IF (OLD.status = 'Attested' OR OLD.status = 'Locked') THEN
        RAISE EXCEPTION 'This work record is attested/locked and cannot be modified or deleted.';
    END IF;
    
    -- Prevent moving backwards in the state machine
    -- Draft(1) -> Submitted(2) -> Attested(3) -> Locked(4)
    IF (TG_OP = 'UPDATE') THEN
        IF (OLD.status = 'Attested' AND NEW.status = 'Submitted') THEN
            RAISE EXCEPTION 'Cannot revert an attested record to submitted status.';
        END IF;
        IF (OLD.status = 'Locked' AND NEW.status != 'Locked') THEN
            RAISE EXCEPTION 'Cannot unlock a locked record.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for UPDATE and DELETE
DROP TRIGGER IF EXISTS trg_protect_receipts ON receipts;
CREATE TRIGGER trg_protect_receipts
BEFORE UPDATE OR DELETE ON receipts
FOR EACH ROW
EXECUTE FUNCTION protect_immutable_receipts();

-------------------------------------------------------------------------------
-- 3. PROTECT ATTESTATIONS (Immutable by Design)
-------------------------------------------------------------------------------
-- Attestations are evidence. Once given, they should never be changed or removed.

CREATE OR REPLACE FUNCTION protect_immutable_attestations()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        RAISE EXCEPTION 'Attestations are permanent evidence and cannot be deleted.';
    END IF;
    
    IF (TG_OP = 'UPDATE') THEN
        RAISE EXCEPTION 'Attestations are permanent evidence and cannot be edited.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_attestations ON attestations;
CREATE TRIGGER trg_protect_attestations
BEFORE UPDATE OR DELETE ON attestations
FOR EACH ROW
EXECUTE FUNCTION protect_immutable_attestations();

-------------------------------------------------------------------------------
-- 4. SECURITY RATIONALE / DOCUMENTATION
-------------------------------------------------------------------------------
-- LOGIC:
-- 1. Draft/Submitted: Owner can edit details (typos etc.) or delete.
-- 2. Attested: Once a third party verifies the work, the record becomes 
--    the "Truth". Editing it would invalidate the verifier's signature.
-- 3. Locked: Terminal state for archival.

-- COMMON ATTACK VECTORS PREVENTED:
-- - "Verification Bait": Attesting a good record, then editing it to link to fake evidence.
-- - "Evidence Erasure": Deleting a work history that has been flagged or attested negatively.
-- - "State Rollback": Reverting 'Attested' to 'Draft' to bypass UI locks.
